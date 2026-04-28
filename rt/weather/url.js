// weather url 1.0.0
function pad2(x) {
  x = i(x);
  if (x < 10) return "0" + String(x);
  return String(x);
}

function getTodayStr() {
  var d = new Date();
  return String(d.getFullYear()) + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
}

function buildWeatherUrls(ctx) {
  ctx.today = getTodayStr();
  ctx.daily_url = API_DAILY_BASE + "&start_date=" + ctx.today + "&end_date=" + ctx.today;
  ctx.hourly_url = API_HOURLY_BASE;
}
