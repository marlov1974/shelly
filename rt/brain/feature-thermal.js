// brain feature-thermal 2.4.0-simple-post-vvx-demand
var HEAT_ON_DB_C = 0.3;
var HEAT_OFF_DB_C = 0.1;
var COOL_ON_DB_C = 0.3;
var COOL_OFF_DB_C = 0.1;

var HEAT_KP_STEP = 0.5;
var HEAT_HOLD_BAND_C = 0.1;
var HEAT_STEP_MAX_UP_PCT = 8;
var HEAT_STEP_MAX_DOWN_PCT = 8;

var COOL_STEP_PCT = 5;
var COOL_HOLD_BAND_C = 0.1;

function calcHeatDemand(postDeltaC, isActive) {
  if (isActive) return b(postDeltaC > HEAT_OFF_DB_C);
  return b(postDeltaC > HEAT_ON_DB_C);
}

function calcCoolDemand(postDeltaC, isActive) {
  if (isActive) return b(postDeltaC < -COOL_OFF_DB_C);
  return b(postDeltaC < -COOL_ON_DB_C);
}

function nextHeatPct(ctx) {
  var step;

  if (!ctx.sig.full_air_ready || !ctx.sig.heat_demand) return 0;

  if (abs(ctx.sig.delta_to_house_c) <= HEAT_HOLD_BAND_C) {
    return clipPct(ctx.inp.heat_pct_actual);
  }

  step = Math.round(HEAT_KP_STEP * ctx.sig.delta_to_house_c);

  if (step > 0) step = min2(step, HEAT_STEP_MAX_UP_PCT);
  else step = max2(step, -HEAT_STEP_MAX_DOWN_PCT);

  return clipPct(ctx.inp.heat_pct_actual + step);
}

function nextCoolPct(ctx) {
  if (!ctx.sig.full_air_ready || !ctx.sig.cool_demand) return 0;

  if (ctx.sig.delta_to_house_c < -COOL_HOLD_BAND_C) {
    return clipPct(ctx.inp.cool_pct_actual + COOL_STEP_PCT);
  }

  if (ctx.sig.delta_to_house_c > COOL_HOLD_BAND_C) {
    return clipPct(ctx.inp.cool_pct_actual - COOL_STEP_PCT);
  }

  return clipPct(ctx.inp.cool_pct_actual);
}

function calcThermal(ctx) {
  var heatIsActive = b(ctx.inp.heat_pct_actual > 0);
  var coolIsActive = b(ctx.inp.cool_pct_actual > 0);

  ctx.sig.heat_demand = calcHeatDemand(ctx.sig.supply_delta_post_c, heatIsActive);
  ctx.sig.cool_demand = calcCoolDemand(ctx.sig.supply_delta_post_c, coolIsActive);

  ctx.sig.heat_candidate_pct = nextHeatPct(ctx);
  ctx.sig.cool_candidate_pct = nextCoolPct(ctx);
}
