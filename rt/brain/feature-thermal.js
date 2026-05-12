// brain feature-thermal 2.5.3-emergency-slim
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

function r5(v) { return 5 * i(n(v, 0) / 5); }

function calcThermal(ctx) {
  var h = n(ctx.inp.t_house_c, ctx.sig.house_target_c);
  var o = n(ctx.inp.t_out_c, h);
  var s = n(ctx.weather.solar_kwh_today, 0);
  var cn = max2(0, HOUSE_LOSS_KWH_DAY_PER_C * (o - h) + BASE_INTERNAL_KWH_DAY + s);
  var hn = max2(0, HOUSE_LOSS_KWH_DAY_PER_C * (h - o) - BASE_INTERNAL_KWH_DAY - s);
  var sup = 0;
  var trg = ctx.sig.target_to_house_c;
  var d = 0;
  var e = 0;

  ctx.sig.cool_need_kwh_day = d1(cn);
  ctx.sig.heat_need_kwh_day = d1(hn);
  ctx.sig.cool_candidate_pct = 0;
  ctx.sig.heat_candidate_pct = 0;
  ctx.sig.thermal_sup_pct = 0;
  ctx.sig.thermal_mode = "NEU";

  if (h > ctx.sig.house_target_c + OVER_TEMP_RECOVERY_C) {
    ctx.sig.thermal_mode = "CREC";
    sup = COOL_MAX_SUPPLY_PCT;
    trg = ctx.sig.min_supply_temp_c;
  } else if (h < ctx.sig.house_target_c - UNDER_TEMP_RECOVERY_C) {
    ctx.sig.thermal_mode = "HREC";
    sup = HEAT_MAX_SUPPLY_PCT;
    trg = TARGET_TO_HOUSE_MAX_C;
  } else if (cn > COOL_ON_DB_C) {
    ctx.sig.thermal_mode = "CBAL";
    d = h - ctx.sig.min_supply_temp_c;
    if (d < 0.5) d = 0.5;
    sup = clip(r5(cn / (0.077 * d)), THERMAL_MIN_SUPPLY_PCT, COOL_MAX_SUPPLY_PCT);
    trg = max2(ctx.sig.min_supply_temp_c, h - cn / airKwhDayPerC(sup));
  } else if (hn > HEAT_ON_DB_C) {
    ctx.sig.thermal_mode = "HBAL";
    d = TARGET_TO_HOUSE_MAX_C - h;
    if (d < 0.5) d = 0.5;
    sup = clip(r5(hn / (0.077 * d)), THERMAL_MIN_SUPPLY_PCT, HEAT_MAX_SUPPLY_PCT);
    trg = min2(TARGET_TO_HOUSE_MAX_C, h + hn / airKwhDayPerC(sup));
  }

  ctx.sig.thermal_sup_pct = clipPct(sup);
  ctx.sig.target_to_house_c = d1(clip(trg, ctx.sig.min_supply_temp_c, TARGET_TO_HOUSE_MAX_C));

  if (ctx.sig.thermal_mode === "CREC" || ctx.sig.thermal_mode === "CBAL") {
    e = ctx.inp.t_to_house_c - ctx.sig.target_to_house_c;
    if (ctx.sig.full_air_ready && e > THERMAL_HOLD_BAND_C) ctx.sig.cool_candidate_pct = clipPct(ctx.inp.cool_pct_actual + COOL_STEP_PCT);
    else if (ctx.sig.full_air_ready && e < -THERMAL_HOLD_BAND_C) ctx.sig.cool_candidate_pct = clipPct(ctx.inp.cool_pct_actual - COOL_STEP_PCT);
    else ctx.sig.cool_candidate_pct = ctx.sig.full_air_ready ? clipPct(ctx.inp.cool_pct_actual) : 0;
  }

  if (ctx.sig.thermal_mode === "HREC" || ctx.sig.thermal_mode === "HBAL") {
    e = ctx.sig.target_to_house_c - ctx.inp.t_to_house_c;
    if (ctx.sig.full_air_ready && e > THERMAL_HOLD_BAND_C) ctx.sig.heat_candidate_pct = clipPct(ctx.inp.heat_pct_actual + HEAT_STEP_PCT);
    else if (ctx.sig.full_air_ready && e < -THERMAL_HOLD_BAND_C) ctx.sig.heat_candidate_pct = clipPct(ctx.inp.heat_pct_actual - HEAT_STEP_PCT);
    else ctx.sig.heat_candidate_pct = ctx.sig.full_air_ready ? clipPct(ctx.inp.heat_pct_actual) : 0;
  }

  ctx.sig.supply_delta_post_c = ctx.sig.target_to_house_c - ctx.inp.t_post_vvx_c;
  ctx.sig.delta_to_house_c = ctx.sig.target_to_house_c - ctx.inp.t_to_house_c;
}
