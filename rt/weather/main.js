// weather main 1.0.0-print-only-self-stop
function runWeather() {
  var ctx = createWeatherCtx();

  log("BOT");
  buildWeatherUrls(ctx);
  log("DATE " + ctx.today);

  fetchDailySolar(ctx, function () {
    fetchHourlyTemp(ctx, function () {
      saveWeatherAct(ctx, function () {
        log("DON");
        selfStop();
      });
    });
  });
}

runWeather();
