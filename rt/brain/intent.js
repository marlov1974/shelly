// brain intent 2.0.0
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

function buildIntent(ctx) {
  var intent = baseOffIntent();
  var extPct;
  var supPct;
  var heatPct;
  var coolPct;
  var fsCap;

  intent.driver_inhibit = b(ctx.cmd.mode === MODE_MAN);

  if (!ctx.cmd.enable) {
    ctx.intent = intent;
    return;
  }

  intent.dmp.on = 1;
  intent.sup.on = 1;
  intent.ext.on = 1;

  heatPct = ctx.dx.heatPct;
  coolPct = ctx.dx.coolPct;

  if (!ctx.inp.dmp_run) {
    extPct = FAN_START_PCT;
    supPct = supplyPctFromExtractPct(FAN_START_PCT);
  } else if (ctx.dx.fanFrozenGuardActive) {
    extPct = FAN_START_PCT;
    supPct = supplyPctFromExtractPct(FAN_START_PCT);
  } else {
    extPct = ctx.dx.stdExtPct;

    if (ctx.cmd.mode === MODE_STD) {
      if (coolPct > 0) extPct = min2(extPct, STD_COOL_CAP_PCT);

      if (ctx.dx.failsafeVentReduce) {
        fsCap = (ctx.inp.t_out_c < 0) ? FAILSAFE_COLD_EXT_PCT : FAILSAFE_MILD_EXT_PCT;
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
  intent.vvx.on = ctx.dx.vvxOn;
  intent.heat.pct = heatPct;
  intent.cool.pct = coolPct;
  intent.heat.on = b(heatPct > 0);
  intent.cool.on = b(coolPct > 0);

  ctx.intent = intent;
}
