// brain feature-thermal 2.0.0
function calcHeatDemand(deltaC, isActive) {
  if (isActive) return b(deltaC > HEAT_OFF_DB_C);
  return b(deltaC > HEAT_ON_DB_C);
}

function calcCoolDemand(deltaC, isActive) {
  if (isActive) return b(deltaC < -COOL_OFF_DB_C);
  return b(deltaC < -COOL_ON_DB_C);
}

function nextHeatPct(ctx) {
  var step;
  if (!ctx.dx.fullAirReady || !ctx.dx.heatAllowed || !ctx.dx.heatDemand) return 0;
  if (abs(ctx.dx.deltaToHouseC) <= HEAT_HOLD_BAND_C) return clipPct(ctx.inp.heat_pct_actual);
  step = Math.round(HEAT_KP_STEP * ctx.dx.deltaToHouseC);
  if (step > 0) step = min2(step, HEAT_STEP_MAX_UP_PCT);
  else step = max2(step, -HEAT_STEP_MAX_DOWN_PCT);
  return clipPct(ctx.inp.heat_pct_actual + step);
}

function nextCoolPct(ctx) {
  if (!ctx.dx.fullAirReady || !ctx.dx.coolAllowed || !ctx.dx.coolDemand) return 0;
  if (ctx.dx.deltaToHouseC < -COOL_HOLD_BAND_C) return clipPct(ctx.inp.cool_pct_actual + COOL_STEP_PCT);
  if (ctx.dx.deltaToHouseC > COOL_HOLD_BAND_C) return clipPct(ctx.inp.cool_pct_actual - COOL_STEP_PCT);
  return clipPct(ctx.inp.cool_pct_actual);
}

function calcThermal(ctx) {
  var heatIsActive = b(ctx.inp.heat_pct_actual > 0);
  var coolIsActive = b(ctx.inp.cool_pct_actual > 0);
  ctx.dx.heatAllowed = b(ctx.inp.t_out_c <= HEAT_DISABLE_ABOVE_OUT_C);
  ctx.dx.coolAllowed = b(ctx.inp.t_out_c >= COOL_DISABLE_BELOW_OUT_C);
  ctx.dx.heatDemand = calcHeatDemand(ctx.dx.supplyDeltaPostC, heatIsActive);
  ctx.dx.coolDemand = calcCoolDemand(ctx.dx.supplyDeltaPostC, coolIsActive);
  ctx.dx.heatPct = nextHeatPct(ctx);
  ctx.dx.coolPct = nextCoolPct(ctx);
}
