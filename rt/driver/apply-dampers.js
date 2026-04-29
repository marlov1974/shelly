// driver apply-dampers 1.0.0
var IP_DAMPERS = "192.168.77.30";
var DAMPERS_SWITCH_ID = 0;

function applyDampersOn(ctx, onValue, cb) {
  remoteSwitchSet(IP_DAMPERS, DAMPERS_SWITCH_ID, onValue ? 1 : 0, cb);
}

function applyDampersIntent(ctx, cb) {
  applyDampersOn(ctx, ctx.intent && ctx.intent.dmp && ctx.intent.dmp.on, cb);
}
