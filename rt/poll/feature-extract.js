// poll feature-extract 3.1.0
var IP_EXTRACT_UNI = "192.168.77.21";
var IP_EXTRACT_FAN = "192.168.77.11";

var EXTRACT_DP_ID = 100;
var EXTRACT_RPM_ID = 2;
var TEMP_TO_HOUSE_ID = 100;
var TEMP_BRINE_ID = 101;
var TEMP_HOTWATER_ID = 102;

var K_EXTRACT_FAN = 12.1;

function extractPaToLs(pa) {
  if (pa <= 0) return 0;
  return Math.round(K_EXTRACT_FAN * Math.sqrt(pa));
}

function parseExtractUni(js) {
  var vm = comp(js, "voltmeter:" + EXTRACT_DP_ID);
  var inRpm = comp(js, "input:" + EXTRACT_RPM_ID);
  return {
    pa: n(num4(vm, "xvoltage", "value", "pa", "pressure"), 0),
    rpm: n(num4(inRpm, "xfreq", "value", "rpm", "frequency"), 0),
    temp_to_house: tempValue(comp(js, "temperature:" + TEMP_TO_HOUSE_ID)),
    temp_brine: tempValue(comp(js, "temperature:" + TEMP_BRINE_ID)),
    temp_hotwater: tempValue(comp(js, "temperature:" + TEMP_HOTWATER_ID))
  };
}

function deriveExtractTelemetry(ctx) {
  ctx.extract.pa = normPa(ctx.extract.pa);
  ctx.extract.rpm = normFanRpm(ctx.extract.rpm);
  ctx.extract.ls = normLs(extractPaToLs(ctx.extract.pa));
  ctx.extract.temp_to_house = normTemp(ctx.extract.temp_to_house);
  ctx.extract.temp_brine = normTemp(ctx.extract.temp_brine);
  ctx.extract.temp_hotwater = normTemp(ctx.extract.temp_hotwater);
  ctx.extract.fan_pct = normPct(ctx.extract.fan_pct);
  ctx.extract.fan_w = normW(ctx.extract.fan_w);
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
