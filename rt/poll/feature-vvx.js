// poll feature-vvx 1.2.1-direct-parse-low-memory
var IP_VVX = "192.168.77.40";

function applyVvx(ctx, js) {
  var x = js ? parseSwitch0(js) : null;
  ctx.vvx.on = x ? x.on : 0;
  ctx.vvx.w = x ? normW(x.w) : 0;
}

function readVvx(ctx, cb) {
  httpGetStatus(IP_VVX, function (js) {
    applyVvx(ctx, js);
    cb();
  });
}
