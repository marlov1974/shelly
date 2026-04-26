// brain output 2.0.0
function writeIntent(ctx, cb) {
  kvsSet(KEY_INTENT_ACT, ctx.intent || baseOffIntent(), cb);
}

function writeTargetToHouse(ctx, cb) {
  var value = d1(ctx.dx ? ctx.dx.targetToHouseC : 0);
  numberSet(VM_TARGET_TO_HOUSE_ID, value, cb);
}
