// poll feature-process 3.5.0-extract-sensor-addon
var IP_EXTRACT_FAN = "192.168.77.11";

var HOUSE_PPM_ID = 101;
var TEMP_HOUSE_ID = 105;
var RH_HOUSE_ID = 105;

function tempValueOr(c, fallback) {
  var v;
  if (!c || (c.errors && c.errors.length)) return fallback;
  v = num4(c, "tC", "tc", "value", "temp");
  return (typeof v === "number") ? v : fallback;
}

function rhValueOr(c, fallback) {
  var v;
  if (!c || (c.errors && c.errors.length)) return fallback;
  v = num3(c, "rh", "value", "percent");
  return (typeof v === "number") ? v : fallback;
}

function parseProcessFromExtractAddon(js) {
  var ppm = comp(js, "input:" + HOUSE_PPM_ID);
  var rh = comp(js, "humidity:" + RH_HOUSE_ID);
  var t = comp(js, "temperature:" + TEMP_HOUSE_ID);
  return {
    co2_ppm: n(num4(ppm, "xpercent", "ppm", "co2", "value"), 0),
    rpm_vvx: 0,
    temp_house: tempValueOr(t, 20.0),
    rh_house: rhValueOr(rh, 60)
  };
}

function applyProcessFromExtractAddon(ctx, js) {
  var x = js ? parseProcessFromExtractAddon(js) : null;
  ctx.process.rpm_vvx = 0;
  ctx.process.co2_ppm = x ? x.co2_ppm : 0;
  ctx.process.temp_house = x ? x.temp_house : 20.0;
  ctx.process.rh_house = x ? x.rh_house : 60;

  ctx.process.rpm_vvx = 0;
  ctx.process.co2_ppm = normPpm(ctx.process.co2_ppm);
  ctx.process.temp_house = normTemp(ctx.process.temp_house);
  ctx.process.rh_house = normRh(ctx.process.rh_house);
}

function readProcess(ctx, cb) {
  httpGetStatus(IP_EXTRACT_FAN, function (js) {
    applyProcessFromExtractAddon(ctx, js);
    cb();
  });
}
