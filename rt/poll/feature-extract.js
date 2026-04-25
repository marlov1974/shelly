// poll feature-extract 1.0.0
function parseExtractUni(js) {
  var vm = comp(js, "voltmeter:" + VM_DP_ID);
  var inRpm = comp(js, "input:" + INPUT_RPM_ID);
  return {
    pa: n(num4(vm, "xvoltage", "value", "pa", "pressure"), 0),
    rpm: n(num4(inRpm, "xfreq", "value", "rpm", "frequency"), 0),
    temp_to_house: tempValue(comp(js, "temperature:" + TEMP_A_ID)),
    temp_brine: tempValue(comp(js, "temperature:" + TEMP_B_ID)),
    temp_hotwater: tempValue(comp(js, "temperature:" + TEMP_C_ID))
  };
}

function deriveExtract(ctx) {
  ctx.extract.pa = clipPa(ctx.extract.pa);
  ctx.extract.rpm = clipFanRpm(ctx.extract.rpm);
  ctx.extract.ls = clipLs(paToLsExtract(ctx.extract.pa));
  ctx.extract.temp_to_house = clipTemp(ctx.extract.temp_to_house);
  ctx.extract.temp_brine = clipTemp(ctx.extract.temp_brine);
  ctx.extract.temp_hotwater = clipTemp(ctx.extract.temp_hotwater);
  ctx.extract.fan_w = clipW(ctx.extract.fan_w, 180);
  ctx.extract.fan_run = b(
    ctx.extract.fan_on &&
    ctx.extract.fan_pct > 10 &&
    ctx.extract.rpm > FAN_RPM_RUN_MIN &&
    ctx.extract.pa >= FAN_DP_RUN_MIN_PA
  );
}

function readExtract(ctx, cb) {
  var left = 2;
  function done() {
    left--;
    if (left <= 0) {
      deriveExtract(ctx);
      cb();
    }
  }

  httpGetStatus(IP_EXTRACT_UNI, function (js) {
    var x = js ? parseExtractUni(js) : null;
    ctx.extract.pa = x ? x.pa : 0;
    ctx.extract.rpm = x ? x.rpm : 0;
    ctx.extract.temp_to_house = x ? x.temp_to_house : 0;
    ctx.extract.temp_brine = x ? x.temp_brine : 0;
    ctx.extract.temp_hotwater = x ? x.temp_hotwater : 0;
    done();
  });

  httpGetStatus(IP_EXTRACT_FAN, function (js) {
    var x = js ? parseLight0(js) : null;
    ctx.extract.fan_on = x ? x.on : 0;
    ctx.extract.fan_pct = x ? x.pct : 0;
    ctx.extract.fan_w = x ? x.w : 0;
    done();
  });
}
