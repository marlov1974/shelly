// brain feature-failsafe 2.1.0
var FREEZE_POST_VVX_MIN_C = 0.0;
var FAILSAFE_WRONG_DIR_DB_C = 1.0;
var FAILSAFE_COLD_EXT_PCT = 15;
var FAILSAFE_MILD_EXT_PCT = 25;

function calcFailsafe(ctx) {
  ctx.dx.fanFrozenGuardActive = b(ctx.inp.t_post_vvx_c < FREEZE_POST_VVX_MIN_C);
  ctx.dx.failsafeVentReduce = b(
    (ctx.inp.t_house_c < ctx.cmd.house_temp_c && ctx.inp.t_to_house_c < (ctx.inp.t_house_c - FAILSAFE_WRONG_DIR_DB_C)) ||
    (ctx.inp.t_house_c > ctx.cmd.house_temp_c && ctx.inp.t_to_house_c > (ctx.inp.t_house_c + FAILSAFE_WRONG_DIR_DB_C))
  );
}

function getFailsafeVentCapPct(ctx) {
  return (ctx.inp.t_out_c < 0) ? FAILSAFE_COLD_EXT_PCT : FAILSAFE_MILD_EXT_PCT;
}
