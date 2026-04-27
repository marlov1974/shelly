// brain output 2.2.0-signal
var KEY_INTENT_ACT = "ftx.intent.act";
var VM_TARGET_TO_HOUSE_ID = 204;

function writeIntent(ctx, cb) {
  kvsSet(KEY_INTENT_ACT, ctx.intent || baseOffIntent(), cb);
}

function writeTargetToHouse(ctx, cb) {
  var value = d1(ctx.sig ? ctx.sig.target_to_house_c : 0);
  numberSet(VM_TARGET_TO_HOUSE_ID, value, cb);
}
