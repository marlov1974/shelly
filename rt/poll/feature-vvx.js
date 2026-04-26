// poll feature-vvx 1.2.0-classic-parse
var IP_VVX = "192.168.77.40";

function readVvx(ctx, cb) {
  httpGetStatus(IP_VVX, function (js) {
    ctx.raw.vvx = js;
    cb();
  });
}

function applyVvx(ctx) {
  var x = ctx.raw.vvx ? parseSwitch0(ctx.raw.vvx) : null;
  ctx.vvx.on = x ? x.on : 0;
  ctx.vvx.w = x ? normW(x.w) : 0;
}
