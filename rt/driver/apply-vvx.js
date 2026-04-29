// driver apply-vvx 1.0.0
var IP_VVX = "192.168.77.40";
var VVX_SWITCH_ID = 0;

function applyVvxOn(ctx, onValue, cb) {
  remoteSwitchSet(IP_VVX, VVX_SWITCH_ID, onValue ? 1 : 0, cb);
}

function applyVvxIntent(ctx, cb) {
  applyVvxOn(ctx, ctx.intent && ctx.intent.vvx && ctx.intent.vvx.on, cb);
}
