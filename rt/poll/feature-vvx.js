// poll feature-vvx 1.0.1
var IP_VVX = "192.168.77.40";
var VVX_MAX_W = 30;

function readVvx(ctx, cb) {
  httpGetStatus(IP_VVX, function (js) {
    var x = js ? parseSwitch0(js) : null;
    ctx.vvx.on = x ? x.on : 0;
    ctx.vvx.w = x ? clipW(x.w, VVX_MAX_W) : 0;
    cb();
  });
}
