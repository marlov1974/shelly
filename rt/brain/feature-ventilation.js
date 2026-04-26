// brain feature-ventilation 2.0.0
function calcStdExtractPctFromPpm(ppm) {
  var pct;
  pct = CO2_EXT_PCT_AT_25 + (n(ppm, CO2_PPM_AT_25) - CO2_PPM_AT_25) * ((CO2_EXT_PCT_AT_75 - CO2_EXT_PCT_AT_25) / (CO2_PPM_AT_75 - CO2_PPM_AT_25));
  return clipPct(clip(pct, EXT_MIN_PCT, EXT_MAX_PCT));
}

function calcStdExtractPctFromTemp(houseC, setC) {
  var err = clip(abs(n(houseC, setC) - n(setC, houseC)), 0, TEMP_ERR_MAX_C);
  var pct = TEMP_EXT_BASE_PCT + err * TEMP_EXT_SLOPE_PCT_PER_C;
  return clipPct(clip(pct, EXT_MIN_PCT, EXT_MAX_PCT));
}

function supplyPctFromExtractPct(extPct) {
  return clipPct(Math.round(0.9 * n(extPct, 0) - 1));
}

function calcVentilation(ctx) {
  ctx.dx.fullAirReady = b(ctx.inp.dmp_run && ctx.inp.sup_run && ctx.inp.ext_run);
  ctx.dx.fanFrozenGuardActive = b(ctx.inp.t_post_vvx_c < FREEZE_POST_VVX_MIN_C);
  ctx.dx.stdExtPct = max2(calcStdExtractPctFromPpm(ctx.inp.ppm_house), calcStdExtractPctFromTemp(ctx.inp.t_house_c, ctx.cmd.house_temp_c));
  ctx.dx.failsafeVentReduce = b((ctx.inp.t_house_c < ctx.cmd.house_temp_c && ctx.inp.t_to_house_c < (ctx.inp.t_house_c - FAILSAFE_WRONG_DIR_DB_C)) || (ctx.inp.t_house_c > ctx.cmd.house_temp_c && ctx.inp.t_to_house_c > (ctx.inp.t_house_c + FAILSAFE_WRONG_DIR_DB_C)));
}
