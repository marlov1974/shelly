// poll feature-heat 1.0.0
function readHeat(ctx, cb) {
  httpGetStatus(IP_HEAT, function (js) {
    var x = js ? parseLight0(js) : null;
    ctx.heat.on = x ? x.on : 0;
    ctx.heat.pct = x ? clipPct(x.pct) : 0;
    ctx.heat.w = x ? clipW(x.w, 50) : 0;
    cb();
  });
}
