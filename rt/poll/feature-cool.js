// poll feature-cool 1.0.1
var IP_COOL = "192.168.77.13";
var COOL_MAX_W = 50;

function readCool(ctx, cb) {
  httpGetStatus(IP_COOL, function (js) {
    var x = js ? parseLight0(js) : null;
    ctx.cool.on = x ? x.on : 0;
    ctx.cool.pct = x ? clipPct(x.pct) : 0;
    ctx.cool.w = x ? clipW(x.w, COOL_MAX_W) : 0;
    cb();
  });
}
