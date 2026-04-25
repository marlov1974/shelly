// poll feature-process 1.0.0
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
    rpm_vvx: n(num4(inRpm, "xfreq", "value", "rpm", "frequency"), 0),
    temp_house: (!tempErr && tempRaw !== 0) ? tempRaw : 20.0,
    rh_house: (!rhErr && rhRaw >= 0) ? rhRaw : 60
  };
}

function deriveProcess(ctx) {
  ctx.process.rpm_vvx = clipVvxRpm(ctx.process.rpm_vvx);
  ctx.process.co2_ppm = clipPpm(ctx.process.co2_ppm);
  ctx.process.temp_house = clipTemp(ctx.process.temp_house);
  ctx.process.rh_house = clipRh(ctx.process.rh_house);
}

function readProcess(ctx, cb) {
  httpGetStatus(IP_PROCESS_UNI, function (js) {
    var x = js ? parseProcessUni(js) : null;
    ctx.process.rpm_vvx = x ? x.rpm_vvx : 0;
    ctx.process.co2_ppm = x ? x.co2_ppm : 0;
    ctx.process.temp_house = x ? x.temp_house : 20.0;
    ctx.process.rh_house = x ? x.rh_house : 60;
    deriveProcess(ctx);
    cb();
  });
}
