// brain feature-thermal 2.5.0-supply-resolved
var HEAT_ON_DB_C = 0.3;
var COOL_ON_DB_C = 0.3;
var OVER_TEMP_RECOVERY_C = 0.5;
var UNDER_TEMP_RECOVERY_C = 0.5;

var HOUSE_LOSS_KWH_DAY_PER_C = 12.5;
var BASE_INTERNAL_KWH_DAY = 42.0;
var COOL_MAX_SUPPLY_PCT = 75;
var HEAT_MAX_SUPPLY_PCT = 75;
var THERMAL_MIN_SUPPLY_PCT = 20;

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
    ctx.sig.cool_need_kwh_day = coolNeedKwhDay(ctx);
    ctx.sig.thermal_sup_pct = COOL_MAX_SUPPLY_PCT;
    ctx.sig.target_to_house_c = ctx.sig.min_supply_temp_c;
    ctx.sig.cool_candidate_pct = 100;
  } else if (underTemp > UNDER_TEMP_RECOVERY_C) {
    ctx.sig.thermal_mode = "HREC";
    ctx.sig.heat_need_kwh_day = heatNeedKwhDay(ctx);
    ctx.sig.thermal_sup_pct = HEAT_MAX_SUPPLY_PCT;
    ctx.sig.target_to_house_c = TARGET_TO_HOUSE_MAX_C;
    ctx.sig.heat_candidate_pct = 100;
  } else {
    need = coolNeedKwhDay(ctx);
    ctx.sig.cool_need_kwh_day = d1(need);
    if (need > COOL_ON_DB_C) {
      ctx.sig.thermal_mode = "CBAL";
      sup = chooseCoolSupplyPct(ctx, need);
      ctx.sig.thermal_sup_pct = sup;
      ctx.sig.target_to_house_c = d1(targetForCool(ctx, sup, need));
      ctx.sig.cool_candidate_pct = 100;
    } else {
      need = heatNeedKwhDay(ctx);
      ctx.sig.heat_need_kwh_day = d1(need);
      if (need > HEAT_ON_DB_C) {
        ctx.sig.thermal_mode = "HBAL";
        sup = chooseHeatSupplyPct(ctx, need);
        ctx.sig.thermal_sup_pct = sup;
        ctx.sig.target_to_house_c = d1(targetForHeat(ctx, sup, need));
        ctx.sig.heat_candidate_pct = 100;
      }
    }
  }

  ctx.sig.target_to_house_c = clip(ctx.sig.target_to_house_c, ctx.sig.min_supply_temp_c, TARGET_TO_HOUSE_MAX_C);
  ctx.sig.supply_delta_post_c = ctx.sig.target_to_house_c - ctx.inp.t_post_vvx_c;
  ctx.sig.delta_to_house_c = ctx.sig.target_to_house_c - ctx.inp.t_to_house_c;
}
