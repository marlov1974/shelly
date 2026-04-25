// weather temp 1.0.0
var FIELD_TEMP_NOW = "temp_now";

var API_HOURLY_BASE =
  "https://api.open-meteo.com/v1/forecast" +
  "?latitude=" + LAT +
  "&longitude=" + LON +
  "&hourly=temperature_2m" +
  "&forecast_hours=1" +
  "&timezone=auto";

function parseHourlyTemp(body) {
  var js;
  var hourly;
  var tempArr;

  try {
    js = JSON.parse(body);
  } catch (e) {
    log("JSON HOURLY ERR");
    return 0;
  }

  hourly = js && js.hourly;
  if (!hourly || typeof hourly !== "object") {
    log("NO HOURLY");
    return 0;
  }

  tempArr = hourly.temperature_2m;
  if (!tempArr || !tempArr.length) {
    log("NO TEMP");
    return 0;
  }

  return d1(clip(tempArr[0], -99.9, 99.9));
}

function featureHourlyTemp(ctx, cb) {
  log("HTTP HOURLY GET");
  httpGet(API_HOURLY_BASE, function (body) {
    var tempNow = 0;

    if (body) {
      log("HTTP HOURLY OK len=" + lenOfString(body));
      tempNow = parseHourlyTemp(body);
    }

    ctx.out[FIELD_TEMP_NOW] = tempNow;
    log("TEMP NOW=" + tempNow);
    cb();
  });
}

