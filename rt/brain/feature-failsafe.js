// brain feature-failsafe 2.2.0-signal
var FREEZE_POST_VVX_MIN_C = 0.0;
var FAILSAFE_WRONG_DIR_DB_C = 1.0;
var FAILSAFE_COLD_EXT_PCT = 15;
var FAILSAFE_MILD_EXT_PCT = 25;

function calcFailsafe(ctx) {
  ctx.sig.freeze_guard_active = b(ctx.inp.t_post_vvx_c < FREEZE_POST_VVX_MIN_C);
  ctx.sig.failsafe_active = b(
    (ctx.inp.t_house_c < ctx.cmd.house_temp_c && ctx.inp.t_to_house_c < (ctx.inp.t_house_c - FAILSAFE_WRONG_DIR_DB_C)) ||
    (ctx.inp.t_house_c > ctx.cmd.house_temp_c && ctx.inp.t_to_house_c > (ctx.inp.t_house_c + FAILSAFE_WRONG_DIR_DB_C))
  );
  ctx.sig.failsafe_ext_cap_pct = (ctx.inp.t_out_c < 0) ? FAILSAFE_COLD_EXT_PCT : FAILSAFE_MILD_EXT_PCT;
}
