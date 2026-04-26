// poll feature-heat 1.2.1-direct-parse-low-memory
var IP_HEAT = "192.168.77.12";

function applyHeat(ctx, js) {
  var x = js ? parseLight0(js) : null;
  ctx.heat.on = x ? x.on : 0;
  ctx.heat.pct = x ? normPct(x.pct) : 0;
  ctx.heat.w = x ? normW(x.w) : 0;
}

function readHeat(ctx, cb) {
  httpGetStatus(IP_HEAT, function (js) {
    applyHeat(ctx, js);
    cb();
  });
}
