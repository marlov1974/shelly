// poll feature-derived 1.0.0
function readVvxEffHist(ctx, cb) {
  kvsGet(KEY_VVX_EFF_RAW_HIST, function (hist) {
    ctx.hist.vvx_r0 = clipPctRaw(hist && typeof hist.r0 === "number" ? hist.r0 : 0);
    ctx.hist.vvx_r1 = clipPctRaw(hist && typeof hist.r1 === "number" ? hist.r1 : ctx.hist.vvx_r0);
    ctx.hist.vvx_r2 = clipPctRaw(hist && typeof hist.r2 === "number" ? hist.r2 : ctx.hist.vvx_r1);
    cb();
  });
}

function deriveVvxEfficiency(ctx) {
  var raw = calcVvxEfficiencyRawPct(
    ctx.supply.temp_outdoor,
    ctx.extract.temp_to_house,
    ctx.supply.temp_post_vvx,
    ctx.supply.temp_to_outdoor
  );

  ctx.vvx.eff_pct = clipPct((raw + ctx.hist.vvx_r0 + ctx.hist.vvx_r1) / 3);

  ctx.hist.vvx_r2 = ctx.hist.vvx_r1;
  ctx.hist.vvx_r1 = ctx.hist.vvx_r0;
  ctx.hist.vvx_r0 = raw;
}

function deriveTotalPower(ctx) {
  ctx.power.total_w =
    IDLE_POWER_W +
    (ctx.dmp.on ? DAMPERS_POWER_W : 0) +
    ctx.supply.fan_w +
    ctx.extract.fan_w +
    ctx.vvx.w +
    ctx.heat.w +
    ctx.cool.w;

  ctx.power.total_w = i(clip(ctx.power.total_w, 0, 9999));
}

function deriveFanAverage(ctx) {
  ctx.fan.avg_pct = clipPct((ctx.supply.fan_pct + ctx.extract.fan_pct) / 2);
}

function deriveCrossFeatures(ctx, cb) {
  deriveVvxEfficiency(ctx);
  deriveTotalPower(ctx);
  deriveFanAverage(ctx);
  cb();
}
