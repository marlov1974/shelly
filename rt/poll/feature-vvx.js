// poll feature-vvx 1.0.0
function readVvx(ctx, cb) {
  httpGetStatus(IP_VVX, function (js) {
    var x = js ? parseSwitch0(js) : null;
    ctx.vvx.on = x ? x.on : 0;
    ctx.vvx.w = x ? clipW(x.w, 30) : 0;
    cb();
  });
}
