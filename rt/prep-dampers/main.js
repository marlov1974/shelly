// prep-dampers main 1.0.0
function run() {
  var ctx = { now: new Date() };
  kvsSet(KEY_PREP_STATUS, "running", function () {
    readComfort(function (comfort) {
      ctx.comfort = comfort;
      readTargetTemp(function (targetTemp) {
        ctx.targetTemp = targetTemp;
        readHouseTemp(function (houseTemp) {
          if (houseTemp === null) {
            log("NO HOUSE TEMP");
            kvsSet(KEY_PREP_STATUS, "no_house_temp", function () { selfStop(); });
            return;
          }
          ctx.houseTemp = houseTemp;
          readWeatherDayAvg(function (dayAvgTemp) {
            ctx.dayAvgTemp = dayAvgTemp;
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
}

run();
