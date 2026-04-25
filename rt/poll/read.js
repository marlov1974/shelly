// poll read 1.0.0
function parseSupplyUni(js) {
  var vm = comp(js, "voltmeter:" + VM_DP_ID);
  var inRpm = comp(js, "input:" + INPUT_RPM_ID);
  return {
    dp_pa: n(num4(vm, "xvoltage", "value", "pa", "pressure"), 0),
    rpm: n(num4(inRpm, "xfreq", "value", "rpm", "frequency"), 0),
    temp_post_vvx_c: tempValue(comp(js, "temperature:" + TEMP_A_ID)),
    temp_outdoor_c: tempValue(comp(js, "temperature:" + TEMP_B_ID)),
    temp_to_outdoor_c: tempValue(comp(js, "temperature:" + TEMP_C_ID))
  };
}

function parseExtractUni(js) {
  var vm = comp(js, "voltmeter:" + VM_DP_ID);
  var inRpm = comp(js, "input:" + INPUT_RPM_ID);
  return {
    dp_pa: n(num4(vm, "xvoltage", "value", "pa", "pressure"), 0),
    rpm: n(num4(inRpm, "xfreq", "value", "rpm", "frequency"), 0),
    temp_to_house_c: tempValue(comp(js, "temperature:" + TEMP_A_ID)),
    temp_brine_c: tempValue(comp(js, "temperature:" + TEMP_B_ID)),
    temp_hotwater_c: tempValue(comp(js, "temperature:" + TEMP_C_ID))
  };
}

function parseProcessUni(js) {
  var vm = comp(js, "voltmeter:" + VM_DP_ID);
  var inRpm = comp(js, "input:" + INPUT_RPM_ID);
  var rh = comp(js, "humidity:" + RH_ID);
  var t = comp(js, "temperature:" + TEMP_A_ID);
  var tempRaw = n(num4(t, "tC", "tc", "value", "temp"), 0);
  var rhRaw = n(num3(rh, "rh", "value", "percent"), -1);
  var tempErr = !!(t && t.errors && t.errors.length);
  var rhErr = !!(rh && rh.errors && rh.errors.length);
  return {
    co2_ppm: n(num4(vm, "xvoltage", "value", "ppm", "co2"), 0),
    rpm: n(num4(inRpm, "xfreq", "value", "rpm", "frequency"), 0),
    temp_house_c: (!tempErr && tempRaw !== 0) ? tempRaw : 20.0,
    rh_house_pct: (!rhErr && rhRaw >= 0) ? rhRaw : 60
  };
}

function readSupplyUni(cb) {
  httpGetStatus(IP_SUPPLY_UNI, function (js) {
    var x = js ? parseSupplyUni(js) : null;
    paSupply = x ? x.dp_pa : 0;
    rpmSupplyFan = x ? x.rpm : 0;
    tempToOutdoorC = x ? x.temp_to_outdoor_c : 0;
    tempOutdoorC = x ? x.temp_outdoor_c : 0;
    tempPostVvxC = x ? x.temp_post_vvx_c : 0;
    cb();
  });
}

function readExtractUni(cb) {
  httpGetStatus(IP_EXTRACT_UNI, function (js) {
    var x = js ? parseExtractUni(js) : null;
    paExtract = x ? x.dp_pa : 0;
    rpmExtractFan = x ? x.rpm : 0;
    tempToHouseC = x ? x.temp_to_house_c : 0;
    tempBrineC = x ? x.temp_brine_c : 0;
    tempHotwaterC = x ? x.temp_hotwater_c : 0;
    cb();
  });
}

function readProcessUni(cb) {
  httpGetStatus(IP_PROCESS_UNI, function (js) {
    var x = js ? parseProcessUni(js) : null;
    rpmVvx = x ? x.rpm : 0;
    ppmHouse = x ? x.co2_ppm : 0;
    tempHouseC = x ? x.temp_house_c : 20.0;
    rhHouse = x ? x.rh_house_pct : 60;
    cb();
  });
}

function readLightDevice(ip, apply, cb) {
  httpGetStatus(ip, function (js) {
    apply(js ? parseLight0(js) : null);
    cb();
  });
}

function readSwitchDevice(ip, apply, cb) {
  httpGetStatus(ip, function (js) {
    apply(js ? parseSwitch0(js) : null);
    cb();
  });
}

function readVvxEffRawHist(cb) {
  kvsGet(KEY_VVX_EFF_RAW_HIST, function (hist) {
    vvxEffRaw0 = clipPctRaw(hist && typeof hist.r0 === "number" ? hist.r0 : 0);
    vvxEffRaw1 = clipPctRaw(hist && typeof hist.r1 === "number" ? hist.r1 : vvxEffRaw0);
    vvxEffRaw2 = clipPctRaw(hist && typeof hist.r2 === "number" ? hist.r2 : vvxEffRaw1);
    cb();
  });
}

