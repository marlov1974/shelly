// weather parse 1.0.0
function parseDailySolar(body) {
  var js;
  var daily;
  var swrArr;
  var mj;
  var kwh;

  try { js = JSON.parse(body); } catch (e) { log("JSON DAILY ERR"); return 0; }

  daily = js && js.daily;
  if (!daily || typeof daily !== "object") { log("NO DAILY"); return 0; }

  swrArr = daily.shortwave_radiation_sum;
  if (!swrArr || !swrArr.length) { log("NO SWR"); return 0; }

  mj = n(swrArr[0], 0);
  if (mj < 0) mj = 0;
  kwh = i(clip(mj * SOLAR_GAIN_FACTOR_KWH_PER_MJ, 0, 999));

  log("SWR MJ=" + mj);
  log("SOL KWH=" + kwh);
  return kwh;
}

function parseHourlyTemp(body) {
  var js;
  var hourly;
  var tempArr;
  var tempNow;

  try { js = JSON.parse(body); } catch (e) { log("JSON HOURLY ERR"); return 0; }

  hourly = js && js.hourly;
  if (!hourly || typeof hourly !== "object") { log("NO HOURLY"); return 0; }

  tempArr = hourly.temperature_2m;
  if (!tempArr || !tempArr.length) { log("NO TEMP"); return 0; }

  tempNow = d1(clip(tempArr[0], -99.9, 99.9));
  log("TEMP NOW=" + tempNow);
  return tempNow;
}
