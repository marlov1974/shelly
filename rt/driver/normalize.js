// driver normalize 1.0.0
function defaultDriverIntent() {
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

function normOn(o) {
  return o && o.on ? 1 : 0;
}

function normPct(o) {
  if (!o || !o.on) return 0;
  return clipPct(o.pct);
}

function normalizeDriverIntent(ctx) {
  var src = ctx.rawIntent || {};
  var out = defaultDriverIntent();

  out.driver_inhibit = src.driver_inhibit ? 1 : 0;

  out.sup.on = normOn(src.sup);
  out.sup.pct = normPct(src.sup);

  out.ext.on = normOn(src.ext);
  out.ext.pct = normPct(src.ext);

  out.vvx.on = normOn(src.vvx);

  out.heat.on = normOn(src.heat);
  out.heat.pct = normPct(src.heat);

  out.cool.on = normOn(src.cool);
  out.cool.pct = normPct(src.cool);

  out.dmp.on = normOn(src.dmp);

  if (out.heat.on && out.cool.on) {
    ctx.thermalConflict = 1;
    out.heat.on = 0;
    out.heat.pct = 0;
    out.cool.on = 0;
    out.cool.pct = 0;
  }

  ctx.intent = out;
}

function driverIntentIsOff(intent) {
  if (!intent) return 1;
  return b(
    !intent.sup.on &&
    !intent.ext.on &&
    !intent.vvx.on &&
    !intent.heat.on &&
    !intent.cool.on &&
    !intent.dmp.on
  );
}
