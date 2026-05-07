// prep-dampers main 1.9.0-heat-balance
function run() {
  var ctx = { now: new Date() };
  readComfort(function (comfort) {
    ctx.comfort = comfort;
    readTargetTemp(function (targetTemp) {
      ctx.targetTemp = targetTemp;
      readHouseTemp(function (houseTemp) {
        if (houseTemp === null) {
          log("NO HOUSE TEMP");
          selfStop();
          return;
        }
        ctx.houseTemp = houseTemp;
        readWeatherDayAvg(function (dayAvgTemp) {
          ctx.dayAvgTemp = dayAvgTemp;
          readSolar(function (solarWm2) {
            ctx.solarWm2 = solarWm2;
            readPriceBlocks(function (priceCsv) {
              ctx.priceCsv = priceCsv;
              ctx.periodName = periodName(ctx.now);
              ctx.periodHours = periodHours(ctx.now);
              ctx.cpHour = checkpointHour(ctx.now);
              ctx.cpWeekday = checkpointWeekday(ctx.now);
              ctx.targetPct = checkpointTargetPct(ctx.cpWeekday, ctx.cpHour);
              writePrep(buildPrep(ctx), function () {
                selfStop();
              });
            });
          });
        });
      });
    });
  });
}

run();
