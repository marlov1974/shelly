// driver main 1.0.0
function finishDriver() {
  log("DON");
  selfStop();
}

function runDriver() {
  var ctx = createDriverCtx();

  log("BOT");

  readDriverIntent(ctx, function () {
    normalizeDriverIntent(ctx);

    if (ctx.intent.driver_inhibit) {
      log("INH");
      selfStop();
      return;
    }

    if (driverIntentIsOff(ctx.intent)) {
      log("OFF");
      applyOffSequence(ctx, finishDriver);
      return;
    }

    log("ON S=" + ctx.intent.sup.pct + " E=" + ctx.intent.ext.pct + " H=" + ctx.intent.heat.pct + " C=" + ctx.intent.cool.pct + " V=" + ctx.intent.vvx.on);
    applyOnSequence(ctx, finishDriver);
  });
}

runDriver();
