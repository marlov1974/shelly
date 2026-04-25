// weather solar 1.0.0
var SOLAR_GAIN_FACTOR_KWH_PER_MJ = 2.0;
var FIELD_SOLAR_KWH_TODAY = "solar_kwh_today";

var API_DAILY_BASE =
  "https://api.open-meteo.com/v1/forecast" +
  "?latitude=" + LAT +
  "&longitude=" + LON +
  "&daily=shortwave_radiation_sum" +
  "&timezone=auto";

function getTodayStr() {
  var d = new Date();
  return String(d.getFullYear()) + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
}

function buildDailySolarUrl() {
  var today = getTodayStr();
  return API_DAILY_BASE + "&start_date=" + today + "&end_date=" + today;
}

function parseDailySolar(body) {
  var js;
  var daily;
  var swrArr;
  var mj;

  try {
    js = JSON.parse(body);
  } catch (e) {
    log("JSON DAILY ERR");
    return 0;
  }

  daily = js && js.daily;
  if (!daily || typeof daily !== "object") {
    log("NO DAILY");
    return 0;
  }

  swrArr = daily.shortwave_radiation_sum;
  if (!swrArr || !swrArr.length) {
    log("NO SWR");
    return 0;
  }

  mj = n(swrArr[0], 0);
  if (mj < 0) mj = 0;

  return i(clip(mj * SOLAR_GAIN_FACTOR_KWH_PER_MJ, 0, 999));
}

function featureDailySolar(ctx, cb) {
  var url = buildDailySolarUrl();

  log("HTTP DAILY GET");
  httpGet(url, function (body) {
    var kwh = 0;

    if (body) {
      log("HTTP DAILY OK len=" + lenOfString(body));
      kwh = parseDailySolar(body);
    }

    ctx.out[FIELD_SOLAR_KWH_TODAY] = kwh;
    log("SOL KWH=" + kwh);
    cb();
  });
}

