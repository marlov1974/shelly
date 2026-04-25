// state output 1.2.0
function writeStateOutput(ctx, cb) {
  kvsSet(KEY_STATE_RUN, ctx.run || {}, cb);
}

function writeStateStatus(ctx, cb) {
  var run = ctx.run || {};
  var s = "ST OK SR=" + run.sup + " ER=" + run.ext + " VR=" + run.vvx + " H=" + run.heat + " C=" + run.cool;
  Shelly.call("Text.Set", { id: STATE_STATUS_TEXT_ID, value: s }, function () {
    if (cb) cb();
  });
}
