// poll feature-extract 3.5.0-sensor-addon
var IP_EXTRACT_FAN = "192.168.77.11";

var EXTRACT_PA_ID = 100;
var TEMP_TO_OUTDOOR_ID = 100;

var K_EXTRACT_FAN = 12.1;

function extractPaToLs(pa) {
  if (pa <= 0) return 0;
  return Math.round(K_EXTRACT_FAN * Math.sqrt(pa));
}

function parseExtractSensorAddon(js) {
  var pa = comp(js, "input:" + EXTRACT_PA_ID);
  return {
    pa: n(num4(pa, "xpercent", "pa", "pressure", "value"), 0),
    rpm: 0,
    temp_to_outdoor: tempValue(comp(js, "temperature:" + TEMP_TO_OUTDOOR_ID))
  };
}

function applyExtractFan(ctx, js) {
  var x = js ? parseExtractSensorAddon(js) : null;
  var y = js ? parseLight0(js) : null;
  ctx.extract.pa = x ? x.pa : 0;
  ctx.extract.rpm = 0;
  ctx.extract.temp_to_outdoor = x ? x.temp_to_outdoor : 0;
  ctx.extract.fan_on = y ? y.on : 0;
  ctx.extract.fan_pct = y ? y.pct : 0;
  ctx.extract.fan_w = y ? y.w : 0;
}

function deriveExtractTelemetry(ctx) {
  ctx.extract.pa = normPa(ctx.extract.pa);
  ctx.extract.rpm = 0;
  ctx.extract.ls = normLs(extractPaToLs(ctx.extract.pa));
  ctx.extract.temp_to_outdoor = normTemp(ctx.extract.temp_to_outdoor);
  ctx.extract.fan_pct = normPct(ctx.extract.fan_pct);
  ctx.extract.fan_w = normW(ctx.extract.fan_w);
}

function readExtract(ctx, cb) {
  httpGetStatus(IP_EXTRACT_FAN, function (js) {
    applyExtractFan(ctx, js);
    deriveExtractTelemetry(ctx);
    cb();
  });
}
