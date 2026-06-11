// brain output 2.10.0-device-intents-only
var KEY_INTENT_DEV_SUP = "ftx.intent.dev.sup";
var KEY_INTENT_DEV_EXT = "ftx.intent.dev.ext";
var KEY_INTENT_DEV_HEAT = "ftx.intent.dev.heat";
var KEY_INTENT_DEV_COOL = "ftx.intent.dev.cool";
var KEY_INTENT_DEV_DMP = "ftx.intent.dev.dmp";
var KEY_INTENT_DEV_VVX = "ftx.intent.dev.vvx";
var VM_TARGET_TO_HOUSE_ID = 204;

function nowTs() {
  return Math.floor((new Date()).getTime() / 1000);
}

function buildDeviceIntent(ctx, device, act, ts) {
  var intent = ctx.intent || baseOffIntent();
  var mode = ctx.cmd && ctx.cmd.mode ? String(ctx.cmd.mode) : MODE_STD;
  return {
    v: 1,
    source: "brain",
    ts: ts,
    device: device,
    mode: mode,
    driver_inhibit: intent.driver_inhibit ? 1 : 0,
    act: act || {}
  };
}

function writeDeviceIntents(ctx, cb) {
  var intent = ctx.intent || baseOffIntent();
  var ts = nowTs();
  kvsSet(KEY_INTENT_DEV_SUP, buildDeviceIntent(ctx, "sup", intent.sup, ts), function () {
    kvsSet(KEY_INTENT_DEV_EXT, buildDeviceIntent(ctx, "ext", intent.ext, ts), function () {
      kvsSet(KEY_INTENT_DEV_HEAT, buildDeviceIntent(ctx, "heat", intent.heat, ts), function () {
        kvsSet(KEY_INTENT_DEV_COOL, buildDeviceIntent(ctx, "cool", intent.cool, ts), function () {
          kvsSet(KEY_INTENT_DEV_DMP, buildDeviceIntent(ctx, "dmp", intent.dmp, ts), function () {
            kvsSet(KEY_INTENT_DEV_VVX, buildDeviceIntent(ctx, "vvx", intent.vvx, ts), cb);
          });
        });
      });
    });
  });
}

function writeIntent(ctx, cb) {
  writeDeviceIntents(ctx, cb);
}

function writeTargetToHouse(ctx, cb) {
  var value = d1(ctx.sig ? ctx.sig.target_to_house_c : 0);
  numberSet(VM_TARGET_TO_HOUSE_ID, value, cb);
}
