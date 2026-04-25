// poll feature-vvx 1.1.0
var IP_VVX = "192.168.77.40";

function readVvx(ctx, cb) {
  httpGetStatus(IP_VVX, function (js) {
    var x = js ? parseSwitch0(js) : null;
    ctx.vvx.on = x ? x.on : 0;
    ctx.vvx.w = x ? normW(x.w) : 0;
    cb();
  });
}
