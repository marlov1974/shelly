// prep-dampers model 1.0.0
function comfortBandC(mode) {
  if (mode === "HIGH") return 0.5;
  if (mode === "LOW") return 2.0;
  return 1.0;
}

function batterySizeKwh(bandC) {
  return d1((bandC * 2.0) * 100.0);
}

function currentSocPct(houseTemp, targetTemp, bandC) {
  var lo = targetTemp - bandC;
  var hi = targetTemp + bandC;
  if (hi <= lo) return 50;
  return d1(clip(((houseTemp - lo) / (hi - lo)) * 100.0, 0, 100));
}

function heatNeedKwhDay(outdoorTempC) {
  return d1(119.9 - 11.4 * outdoorTempC);
}

function heatLossForPeriodKwh(outdoorTempC, hours) {
  return d1((heatNeedKwhDay(outdoorTempC) / 24.0) * hours);
}

function startPlanForPeriod(periodName) {
  if (periodName === "night") return "0;4;0;0";
  return "0;0;0;0";
}

function buildPrep(ctx) {
  var band = comfortBandC(ctx.comfort);
  var size = batterySizeKwh(band);
  var socPct = currentSocPct(ctx.houseTemp, ctx.targetTemp, band);
  var socKwh = d1((socPct / 100.0) * size);
  var targetKwh = d1((ctx.targetPct / 100.0) * size);
  var deltaPct = d1(ctx.targetPct - socPct);
  var deltaKwh = d1(targetKwh - socKwh);
  var lossKwh = heatLossForPeriodKwh(ctx.dayAvgTemp, ctx.periodHours);
  var required = d1(lossKwh + deltaKwh);
  if (required < 0) required = 0;

  return {
    comfort: ctx.comfort,
    target_temp_c: d1(ctx.targetTemp),
    house_temp_c: d1(ctx.houseTemp),
    band_c: band,
    battery_kwh: size,
    soc_pct: socPct,
    soc_kwh: socKwh,
    checkpoint_weekday: ctx.cpWeekday,
    checkpoint_hour: ctx.cpHour,
    target_soc_pct: ctx.targetPct,
    target_soc_kwh: targetKwh,
    delta_pct: deltaPct,
    delta_kwh: deltaKwh,
    day_avg_temp_c: d1(ctx.dayAvgTemp),
    heat_loss_kwh: lossKwh,
    required_heat_kwh: required,
    period: ctx.periodName,
    period_hours: ctx.periodHours,
    start_plan: startPlanForPeriod(ctx.periodName),
    updated: prepIso(ctx.now)
  };
}
