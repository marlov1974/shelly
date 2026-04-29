// driver apply-fans 1.0.0
var IP_SUPPLY_FAN = "192.168.77.10";
var IP_EXTRACT_FAN = "192.168.77.11";
var FAN_LIGHT_ID = 0;

function applyOneFan(ip, act, cb) {
  var fanOn = act && act.on ? 1 : 0;
  var p = fanOn ? clipPct(act.pct) : 0;
  remoteLightSet(ip, FAN_LIGHT_ID, p > 0, p, cb);
}

function applyFansIntent(ctx, cb) {
  applyOneFan(IP_SUPPLY_FAN, ctx.intent.sup, function () {
    applyOneFan(IP_EXTRACT_FAN, ctx.intent.ext, cb);
  });
}

function applyFansOff(ctx, cb) {
  remoteLightSet(IP_SUPPLY_FAN, FAN_LIGHT_ID, 0, 0, function () {
    remoteLightSet(IP_EXTRACT_FAN, FAN_LIGHT_ID, 0, 0, cb);
  });
}
