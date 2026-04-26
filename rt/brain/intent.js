// brain intent 2.1.0-resolve-layer
var FAN_START_PCT = 15;
var BST_SUP_PCT = 90;
var BST_EXT_PCT = 90;
var FIRE_SUP_PCT = 75;
var FIRE_EXT_PCT = 25;
var STD_COOL_CAP_PCT = 75;

function baseOffIntent() {
  return {
    driver_inhibit: 0,
    sup:  { on: 0, pct: 0 },
    ext:  { on: 0, pct: 0 },
    vvx:  { on: 0 },
    heat: { on: 0, pct: 0 },
    cool: { on: 0, pct: 0 },
    dmp:  { on: 0 }
  };
}

function resolveDriverInhibit(ctx, intent) {
  intent.driver_inhibit = b(ctx.cmd.mode === MODE_MAN);
}

function resolveDampersAndFansOn(ctx, intent) {
  intent.dmp.on = 1;
  intent.sup.on = 1;
  intent.ext.on = 1;
}

function resolveFanPct(ctx, intent) {
  var extPct;
  var supPct;
  var fsCap;

  if (!ctx.inp.dmp_run) {
    extPct = FAN_START_PCT;
    supPct = supplyPctFromExtractPct(FAN_START_PCT);
  } else if (ctx.dx.fanFrozenGuardActive) {
    extPct = FAN_START_PCT;
    supPct = supplyPctFromExtractPct(FAN_START_PCT);
  } else {
    extPct = ctx.dx.stdExtPct;

    if (ctx.cmd.mode === MODE_STD) {
      if (ctx.dx.coolPct > 0) extPct = min2(extPct, STD_COOL_CAP_PCT);

      if (ctx.dx.failsafeVentReduce) {
        fsCap = getFailsafeVentCapPct(ctx);
        extPct = min2(extPct, fsCap);
      }
    }

    if (ctx.cmd.mode === MODE_BST) {
      extPct = BST_EXT_PCT;
      supPct = BST_SUP_PCT;
    } else if (ctx.cmd.mode === MODE_FIRE) {
      extPct = FIRE_EXT_PCT;
      supPct = FIRE_SUP_PCT;
    } else {
      supPct = supplyPctFromExtractPct(extPct);
    }
  }

  intent.sup.pct = supPct;
  intent.ext.pct = extPct;
}

function resolveThermalIntent(ctx, intent) {
  intent.heat.pct = ctx.dx.heatPct;
  intent.cool.pct = ctx.dx.coolPct;
  intent.heat.on = b(ctx.dx.heatPct > 0);
  intent.cool.on = b(ctx.dx.coolPct > 0);
}

function resolveVvxIntent(ctx, intent) {
  intent.vvx.on = ctx.dx.vvxOn;
}

function buildIntent(ctx) {
  var intent = baseOffIntent();

  resolveDriverInhibit(ctx, intent);

  if (!ctx.cmd.enable) {
    ctx.intent = intent;
    return;
  }

  resolveDampersAndFansOn(ctx, intent);
  resolveFanPct(ctx, intent);
  resolveVvxIntent(ctx, intent);
  resolveThermalIntent(ctx, intent);

  ctx.intent = intent;
}
