// poll feature-heat 1.2.0-classic-parse
var IP_HEAT = "192.168.77.12";

function readHeat(ctx, cb) {
  httpGetStatus(IP_HEAT, function (js) {
    ctx.raw.heat = js;
    cb();
  });
}

function applyHeat(ctx) {
  var x = ctx.raw.heat ? parseLight0(ctx.raw.heat) : null;
  ctx.heat.on = x ? x.on : 0;
  ctx.heat.pct = x ? normPct(x.pct) : 0;
  ctx.heat.w = x ? normW(x.w) : 0;
}
