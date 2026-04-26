// poll feature-dampers 1.2.0-classic-parse
var IP_DAMPERS = "192.168.77.30";

function readDampers(ctx, cb) {
  httpGetStatus(IP_DAMPERS, function (js) {
    ctx.raw.dampers = js;
    cb();
  });
}

function applyDampers(ctx) {
  var x = ctx.raw.dampers ? parseSwitch0(ctx.raw.dampers) : null;
  ctx.dmp.on = x ? x.on : 0;
}
