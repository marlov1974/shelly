// poll feature-cool 1.0.0
function readCool(ctx, cb) {
  httpGetStatus(IP_COOL, function (js) {
    var x = js ? parseLight0(js) : null;
    ctx.cool.on = x ? x.on : 0;
    ctx.cool.pct = x ? clipPct(x.pct) : 0;
    ctx.cool.w = x ? clipW(x.w, 50) : 0;
    cb();
  });
}
