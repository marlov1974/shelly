// poll feature-actuators 1.0.0
function deriveHeat(ctx) {
  ctx.heat.w = clipW(ctx.heat.w, 50);
  ctx.heat.run = b(
    ctx.heat.on &&
    ctx.heat.pct > 0 &&
    (ctx.extract.temp_to_house - ctx.supply.temp_post_vvx) >= HEAT_DT_MIN_C
  );
}

function deriveCool(ctx) {
  ctx.cool.w = clipW(ctx.cool.w, 50);
  ctx.cool.run = b(
    ctx.cool.on &&
    ctx.cool.pct > 0 &&
    (ctx.supply.temp_post_vvx - ctx.extract.temp_to_house) >= COOL_DT_MIN_C
  );
}

function deriveVvx(ctx) {
  ctx.vvx.w = clipW(ctx.vvx.w, 30);
  ctx.vvx.run = b(ctx.vvx.on && ctx.process.rpm_vvx > VVX_RPM_RUN_MIN);
}

function deriveDampers(ctx) {
  ctx.dmp.run = ctx.dmp.on;
}

function readLightActuator(ip, target, cb) {
  httpGetStatus(ip, function (js) {
    var x = js ? parseLight0(js) : null;
    target.on = x ? x.on : 0;
    target.pct = x ? x.pct : 0;
    target.w = x ? x.w : 0;
    cb();
  });
}

function readSwitchActuator(ip, target, cb) {
  httpGetStatus(ip, function (js) {
    var x = js ? parseSwitch0(js) : null;
    target.on = x ? x.on : 0;
    target.w = x ? x.w : 0;
    cb();
  });
}

function readActuators(ctx, cb) {
  var left = 4;
  function done() {
    left--;
    if (left <= 0) {
      deriveHeat(ctx);
      deriveCool(ctx);
      deriveVvx(ctx);
      deriveDampers(ctx);
      cb();
    }
  }

  readLightActuator(IP_HEAT, ctx.heat, done);
  readLightActuator(IP_COOL, ctx.cool, done);
  readSwitchActuator(IP_VVX, ctx.vvx, done);
  readSwitchActuator(IP_DAMPERS, ctx.dmp, done);
}
