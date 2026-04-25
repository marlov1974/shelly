// poll feature-cool 1.1.0
var IP_COOL = "192.168.77.13";

function readCool(ctx, cb) {
  httpGetStatus(IP_COOL, function (js) {
    var x = js ? parseLight0(js) : null;
    ctx.cool.on = x ? x.on : 0;
    ctx.cool.pct = x ? normPct(x.pct) : 0;
    ctx.cool.w = x ? normW(x.w) : 0;
    cb();
  });
}
