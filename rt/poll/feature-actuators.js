// poll feature-actuators 3.0.0
function readLightActuator(ip, target, cb) {
  httpGetStatus(ip, function (js) {
    var x = js ? parseLight0(js) : null;
    target.on = x ? x.on : 0;
    target.pct = x ? clipPct(x.pct) : 0;
    target.w = x ? clipW(x.w, 50) : 0;
    cb();
  });
}

function readSwitchActuator(ip, target, maxW, cb) {
  httpGetStatus(ip, function (js) {
    var x = js ? parseSwitch0(js) : null;
    target.on = x ? x.on : 0;
    target.w = x ? clipW(x.w, maxW) : 0;
    cb();
  });
}

function readActuators(ctx, cb) {
  readLightActuator(IP_HEAT, ctx.heat, function () {
    readLightActuator(IP_COOL, ctx.cool, function () {
      readSwitchActuator(IP_VVX, ctx.vvx, 30, function () {
        readSwitchActuator(IP_DAMPERS, ctx.dmp, 20, function () {
          cb();
        });
      });
    });
  });
}
