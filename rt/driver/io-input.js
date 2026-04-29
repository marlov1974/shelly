// driver io-input 1.0.0
function readDriverIntent(ctx, cb) {
  kvsGet(KEY_INTENT_ACT, function (v) {
    ctx.rawIntent = v || null;
    cb();
  });
}
