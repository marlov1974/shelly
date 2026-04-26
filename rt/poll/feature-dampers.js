// poll feature-dampers 1.2.1-direct-parse-low-memory
var IP_DAMPERS = "192.168.77.30";

function applyDampers(ctx, js) {
  var x = js ? parseSwitch0(js) : null;
  ctx.dmp.on = x ? x.on : 0;
}

function readDampers(ctx, cb) {
  httpGetStatus(IP_DAMPERS, function (js) {
    applyDampers(ctx, js);
    cb();
  });
}
