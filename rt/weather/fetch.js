// weather fetch 1.0.0
function fetchDailySolar(ctx, cb) {
  log("HTTP DAILY GET");
  httpGet(ctx.daily_url, function (body) {
    if (!body) {
      ctx.act.solar_kwh_today = 0;
      cb(0);
      return;
    }
    log("HTTP DAILY OK len=" + lenOfString(body));
    ctx.act.solar_kwh_today = parseDailySolar(body);
    cb(1);
  });
}

function fetchHourlyTemp(ctx, cb) {
  log("HTTP HOURLY GET");
  httpGet(ctx.hourly_url, function (body) {
    if (!body) {
      ctx.act.temp_now = 0;
      cb(0);
      return;
    }
    log("HTTP HOURLY OK len=" + lenOfString(body));
    ctx.act.temp_now = parseHourlyTemp(body);
    cb(1);
  });
}
