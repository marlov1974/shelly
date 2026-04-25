// poll feature-extract 3.0.0
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

function deriveExtractTelemetry(ctx) {
  ctx.extract.pa = clipPa(ctx.extract.pa);
  ctx.extract.rpm = clipFanRpm(ctx.extract.rpm);
  ctx.extract.ls = clipLs(paToLsExtract(ctx.extract.pa));
  ctx.extract.temp_to_house = clipTemp(ctx.extract.temp_to_house);
  ctx.extract.temp_brine = clipTemp(ctx.extract.temp_brine);
  ctx.extract.temp_hotwater = clipTemp(ctx.extract.temp_hotwater);
  ctx.extract.fan_pct = clipPct(ctx.extract.fan_pct);
  ctx.extract.fan_w = clipW(ctx.extract.fan_w, 180);
}

function readExtract(ctx, cb) {
  httpGetStatus(IP_EXTRACT_UNI, function (js) {
    var x = js ? parseExtractUni(js) : null;
    ctx.extract.pa = x ? x.pa : 0;
    ctx.extract.rpm = x ? x.rpm : 0;
    ctx.extract.temp_to_house = x ? x.temp_to_house : 0;
    ctx.extract.temp_brine = x ? x.temp_brine : 0;
    ctx.extract.temp_hotwater = x ? x.temp_hotwater : 0;

    httpGetStatus(IP_EXTRACT_FAN, function (js2) {
      var y = js2 ? parseLight0(js2) : null;
      ctx.extract.fan_on = y ? y.on : 0;
      ctx.extract.fan_pct = y ? y.pct : 0;
      ctx.extract.fan_w = y ? y.w : 0;
      deriveExtractTelemetry(ctx);
      cb();
    });
  });
}
