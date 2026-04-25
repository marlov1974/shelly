// poll feature-dampers 1.0.1
var IP_DAMPERS = "192.168.77.30";

function readDampers(ctx, cb) {
  httpGetStatus(IP_DAMPERS, function (js) {
    var x = js ? parseSwitch0(js) : null;
    ctx.dmp.on = x ? x.on : 0;
    cb();
  });
}
