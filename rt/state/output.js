// state output 1.4.0-print-only
function writeStateOutput(ctx, cb) {
  kvsSet(KEY_STATE_RUN, ctx.run || {}, cb);
}

function writeStateStatus(ctx, cb) {
  var run = ctx.run || {};
  log("OK SR=" + run.sup + " ER=" + run.ext + " VR=" + run.vvx + " H=" + run.heat + " C=" + run.cool);
  if (cb) cb();
}
