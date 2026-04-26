// poll feature-cool 1.2.0-classic-parse
var IP_COOL = "192.168.77.13";

function readCool(ctx, cb) {
  httpGetStatus(IP_COOL, function (js) {
    ctx.raw.cool = js;
    cb();
  });
}

function applyCool(ctx) {
  var x = ctx.raw.cool ? parseLight0(ctx.raw.cool) : null;
  ctx.cool.on = x ? x.on : 0;
  ctx.cool.pct = x ? normPct(x.pct) : 0;
  ctx.cool.w = x ? normW(x.w) : 0;
}
