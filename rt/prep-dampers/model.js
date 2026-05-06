// prep-dampers model 1.1.0-one-output-with-levels
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
  var deltaKwh = d1(targetKwh - socKwh);
  var lossKwh = heatLossForPeriodKwh(ctx.dayAvgTemp, ctx.periodHours);
  var required = d1(lossKwh + deltaKwh);
  if (required < 0) required = 0;

  return {
    required_heat_kwh: required,
    start_plan: startPlanForPeriod(ctx.periodName),
    levels: levelSpecForPeriod(ctx.periodName)
  };
}
