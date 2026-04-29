// brain feature-vvx 2.4.0-simple-on-when-air-ready
function calcVvx(ctx) {
  ctx.sig.vvx_candidate_on = ctx.sig.full_air_ready ? 1 : 0;
  ctx.sig.vvx_reason = ctx.sig.full_air_ready ? "AIR" : "NOA";
}
