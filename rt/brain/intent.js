// brain intent 2.2.0-signal-resolve
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

  if (!ctx.inp.dmp_run) {
    extPct = FAN_START_PCT;
    supPct = supplyPctFromExtractPct(FAN_START_PCT);
  } else if (ctx.sig.freeze_guard_active) {
    extPct = FAN_START_PCT;
    supPct = supplyPctFromExtractPct(FAN_START_PCT);
  } else {
    extPct = ctx.sig.std_ext_pct;

    if (ctx.cmd.mode === MODE_STD) {
      if (ctx.sig.cool_candidate_pct > 0) extPct = min2(extPct, STD_COOL_CAP_PCT);
      if (ctx.sig.failsafe_active) extPct = min2(extPct, ctx.sig.failsafe_ext_cap_pct);
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
  intent.heat.pct = ctx.sig.heat_candidate_pct;
  intent.cool.pct = ctx.sig.cool_candidate_pct;
  intent.heat.on = b(ctx.sig.heat_candidate_pct > 0);
  intent.cool.on = b(ctx.sig.cool_candidate_pct > 0);
}

function resolveVvxIntent(ctx, intent) {
  intent.vvx.on = ctx.sig.vvx_candidate_on;
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
