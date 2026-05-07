// prep-dampers model 1.8.0-tiny-output
function comfortBandC(mode) {
  if (mode === "HIGH") return 0.5;
  if (mode === "LOW") return 2.0;
  return 1.0;
}
function batterySizeKwh(bandC) { return d1((bandC * 2.0) * 100.0); }
function currentSocPct(houseTemp, targetTemp, bandC) {
  var lo = targetTemp - bandC;
  var hi = targetTemp + bandC;
  if (hi <= lo) return 50;
  return d1(clip(((houseTemp - lo) / (hi - lo)) * 100.0, 0, 100));
}
function heatNeedKwhDay(outdoorTempC) { return d1(119.9 - 11.4 * outdoorTempC); }
function heatLossForPeriodKwh(outdoorTempC, hours) { return d1((heatNeedKwhDay(outdoorTempC) / 24.0) * hours); }
function startPlanForPeriod(periodName) { if (periodName === "p1") return "4000"; return "0000"; }
function periodCode(periodName) { if (periodName === "p2") return 2; if (periodName === "p3") return 3; return 1; }
function pricePack(periodName, priceCsv) {
  selectLevelSet(periodName);
  return d1(parsePriceAt(priceCsv, LV_START)) + "," +
    d1(parsePriceAt(priceCsv, LV_START + 1)) + "," +
    d1(parsePriceAt(priceCsv, LV_START + 2)) + "," +
    d1(parsePriceAt(priceCsv, LV_START + 3));
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
  return "r=" + required + "|p=" + startPlanForPeriod(ctx.periodName) + "|q=" + periodCode(ctx.periodName) + "|c=" + pricePack(ctx.periodName, ctx.priceCsv);
}
