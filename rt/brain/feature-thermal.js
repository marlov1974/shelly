// brain feature-thermal 2.5.2-actuator-regulation
var HEAT_ON_DB_C = 0.3;
var COOL_ON_DB_C = 0.3;
var OVER_TEMP_RECOVERY_C = 0.5;
var UNDER_TEMP_RECOVERY_C = 0.5;

var HOUSE_LOSS_KWH_DAY_PER_C = 12.5;
var BASE_INTERNAL_KWH_DAY = 42.0;
var COOL_MAX_SUPPLY_PCT = 75;
var HEAT_MAX_SUPPLY_PCT = 75;
var THERMAL_MIN_SUPPLY_PCT = 20;

var HEAT_STEP_PCT = 8;
var COOL_STEP_PCT = 5;
var THERMAL_HOLD_BAND_C = 0.2;

function heatNeedKwhDay(ctx) {
  var need = HOUSE_LOSS_KWH_DAY_PER_C * (ctx.inp.t_house_c - ctx.inp.t_out_c) - BASE_INTERNAL_KWH_DAY - n(ctx.weather.solar_kwh_today, 0);
  return need > 0 ? need : 0;
}

function coolNeedKwhDay(ctx) {
  var need = HOUSE_LOSS_KWH_DAY_PER_C * (ctx.inp.t_out_c - ctx.inp.t_house_c) + BASE_INTERNAL_KWH_DAY + n(ctx.weather.solar_kwh_today, 0);
  return need > 0 ? need : 0;
}

function targetForCool(ctx, supPct, needKwhDay) {
  var k = airKwhDayPerC(supPct);
  var delta = k > 0 ? needKwhDay / k : 0;
  return max2(ctx.sig.min_supply_temp_c, ctx.inp.t_house_c - delta);
}

function targetForHeat(ctx, supPct, needKwhDay) {
  var k = airKwhDayPerC(supPct);
  var delta = k > 0 ? needKwhDay / k : 0;
  return min2(TARGET_TO_HOUSE_MAX_C, ctx.inp.t_house_c + delta);
}

function chooseCoolSupplyPct(ctx, needKwhDay) {
  var p;
  var t;
  for (p = THERMAL_MIN_SUPPLY_PCT; p <= COOL_MAX_SUPPLY_PCT; p += 5) {
    t = targetForCool(ctx, p, needKwhDay);
    if (t >= ctx.sig.min_supply_temp_c) return p;
  }
  return COOL_MAX_SUPPLY_PCT;
}

function chooseHeatSupplyPct(ctx, needKwhDay) {
  var p;
  var t;
  for (p = THERMAL_MIN_SUPPLY_PCT; p <= HEAT_MAX_SUPPLY_PCT; p += 5) {
    t = targetForHeat(ctx, p, needKwhDay);
    if (t <= TARGET_TO_HOUSE_MAX_C) return p;
  }
  return HEAT_MAX_SUPPLY_PCT;
}

function resolveCoolPct(ctx) {
  var err = ctx.inp.t_to_house_c - ctx.sig.target_to_house_c;
  if (!ctx.sig.full_air_ready) return 0;
  if (err > THERMAL_HOLD_BAND_C) return clipPct(ctx.inp.cool_pct_actual + COOL_STEP_PCT);
  if (err < -THERMAL_HOLD_BAND_C) return clipPct(ctx.inp.cool_pct_actual - COOL_STEP_PCT);
  return clipPct(ctx.inp.cool_pct_actual);
}

function resolveHeatPct(ctx) {
  var err = ctx.sig.target_to_house_c - ctx.inp.t_to_house_c;
  if (!ctx.sig.full_air_ready) return 0;
  if (err > THERMAL_HOLD_BAND_C) return clipPct(ctx.inp.heat_pct_actual + HEAT_STEP_PCT);
  if (err < -THERMAL_HOLD_BAND_C) return clipPct(ctx.inp.heat_pct_actual - HEAT_STEP_PCT);
  return clipPct(ctx.inp.heat_pct_actual);
}

function calcThermal(ctx) {
  var overTemp = ctx.inp.t_house_c - ctx.sig.house_target_c;
  var underTemp = ctx.sig.house_target_c - ctx.inp.t_house_c;
  var need;
  var sup;

  ctx.sig.cool_candidate_pct = 0;
  ctx.sig.heat_candidate_pct = 0;
  ctx.sig.thermal_sup_pct = 0;
  ctx.sig.thermal_mode = "NEU";

  if (overTemp > OVER_TEMP_RECOVERY_C) {
    ctx.sig.thermal_mode = "CREC";
    ctx.sig.cool_need_kwh_day = d1(coolNeedKwhDay(ctx));
    ctx.sig.thermal_sup_pct = COOL_MAX_SUPPLY_PCT;
    ctx.sig.target_to_house_c = ctx.sig.min_supply_temp_c;
    ctx.sig.cool_candidate_pct = resolveCoolPct(ctx);
  } else if (underTemp > UNDER_TEMP_RECOVERY_C) {
    ctx.sig.thermal_mode = "HREC";
    ctx.sig.heat_need_kwh_day = d1(heatNeedKwhDay(ctx));
    ctx.sig.thermal_sup_pct = HEAT_MAX_SUPPLY_PCT;
    ctx.sig.target_to_house_c = TARGET_TO_HOUSE_MAX_C;
    ctx.sig.heat_candidate_pct = resolveHeatPct(ctx);
  } else {
    need = coolNeedKwhDay(ctx);
    ctx.sig.cool_need_kwh_day = d1(need);
    if (need > COOL_ON_DB_C) {
      ctx.sig.thermal_mode = "CBAL";
      sup = chooseCoolSupplyPct(ctx, need);
      ctx.sig.thermal_sup_pct = sup;
      ctx.sig.target_to_house_c = d1(targetForCool(ctx, sup, need));
      ctx.sig.cool_candidate_pct = resolveCoolPct(ctx);
    } else {
      need = heatNeedKwhDay(ctx);
      ctx.sig.heat_need_kwh_day = d1(need);
      if (need > HEAT_ON_DB_C) {
        ctx.sig.thermal_mode = "HBAL";
        sup = chooseHeatSupplyPct(ctx, need);
        ctx.sig.thermal_sup_pct = sup;
        ctx.sig.target_to_house_c = d1(targetForHeat(ctx, sup, need));
        ctx.sig.heat_candidate_pct = resolveHeatPct(ctx);
      }
    }
  }

  ctx.sig.target_to_house_c = clip(ctx.sig.target_to_house_c, ctx.sig.min_supply_temp_c, TARGET_TO_HOUSE_MAX_C);
  ctx.sig.supply_delta_post_c = ctx.sig.target_to_house_c - ctx.inp.t_post_vvx_c;
  ctx.sig.delta_to_house_c = ctx.sig.target_to_house_c - ctx.inp.t_to_house_c;
}
