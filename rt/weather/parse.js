// weather parse 1.1.0-daily-mean-temp
function parseDailyWeather(body) {
  var js;
  var daily;
  var swrArr;
  var tempAvgArr;
  var mj;
  var kwh;
  var tempAvg;

  try { js = JSON.parse(body); } catch (e) { log("JSON DAILY ERR"); return { solar_kwh_today: 0, temp_avg_today: 0 }; }

  daily = js && js.daily;
  if (!daily || typeof daily !== "object") { log("NO DAILY"); return { solar_kwh_today: 0, temp_avg_today: 0 }; }

  swrArr = daily.shortwave_radiation_sum;
  if (!swrArr || !swrArr.length) { log("NO SWR"); mj = 0; }
  else mj = n(swrArr[0], 0);
  if (mj < 0) mj = 0;
  kwh = i(clip(mj * SOLAR_GAIN_FACTOR_KWH_PER_MJ, 0, 999));

  tempAvgArr = daily.temperature_2m_mean;
  if (!tempAvgArr || !tempAvgArr.length) { log("NO TAVG"); tempAvg = 0; }
  else tempAvg = d1(clip(tempAvgArr[0], -99.9, 99.9));

  log("SWR MJ=" + mj);
  log("SOL KWH=" + kwh);
  log("TAVG=" + tempAvg);
  return { solar_kwh_today: kwh, temp_avg_today: tempAvg };
}

function parseDailySolar(body) {
  return parseDailyWeather(body).solar_kwh_today;
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
