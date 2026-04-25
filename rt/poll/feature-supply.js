// poll feature-supply 1.0.0
function parseSupplyUni(js) {
  var vm = comp(js, "voltmeter:" + VM_DP_ID);
  var inRpm = comp(js, "input:" + INPUT_RPM_ID);
  return {
    pa: n(num4(vm, "xvoltage", "value", "pa", "pressure"), 0),
    rpm: n(num4(inRpm, "xfreq", "value", "rpm", "frequency"), 0),
    temp_post_vvx: tempValue(comp(js, "temperature:" + TEMP_A_ID)),
    temp_outdoor: tempValue(comp(js, "temperature:" + TEMP_B_ID)),
    temp_to_outdoor: tempValue(comp(js, "temperature:" + TEMP_C_ID))
  };
}

function parseLight0(js) {
  var light = comp(js, "light:0");
  return {
    on: b(bool2(light, "output", "ison")),
    pct: clipPct(num2(light, "brightness", "brightness_set")),
    w: i(n(num1(light, "apower"), 0))
  };
}

function deriveSupply(ctx) {
  ctx.supply.pa = clipPa(ctx.supply.pa);
  ctx.supply.rpm = clipFanRpm(ctx.supply.rpm);
  ctx.supply.ls = clipLs(paToLsSupply(ctx.supply.pa));
  ctx.supply.temp_post_vvx = clipTemp(ctx.supply.temp_post_vvx);
  ctx.supply.temp_outdoor = clipTemp(ctx.supply.temp_outdoor);
  ctx.supply.temp_to_outdoor = clipTemp(ctx.supply.temp_to_outdoor);
  ctx.supply.fan_w = clipW(ctx.supply.fan_w, 180);
  ctx.supply.fan_run = b(
    ctx.supply.fan_on &&
    ctx.supply.fan_pct > 10 &&
    ctx.supply.rpm > FAN_RPM_RUN_MIN &&
    ctx.supply.pa >= FAN_DP_RUN_MIN_PA
  );
}

function readSupply(ctx, cb) {
  var left = 2;
  function done() {
    left--;
    if (left <= 0) {
      deriveSupply(ctx);
      cb();
    }
  }

  httpGetStatus(IP_SUPPLY_UNI, function (js) {
    var x = js ? parseSupplyUni(js) : null;
    ctx.supply.pa = x ? x.pa : 0;
    ctx.supply.rpm = x ? x.rpm : 0;
    ctx.supply.temp_post_vvx = x ? x.temp_post_vvx : 0;
    ctx.supply.temp_outdoor = x ? x.temp_outdoor : 0;
    ctx.supply.temp_to_outdoor = x ? x.temp_to_outdoor : 0;
    done();
  });

  httpGetStatus(IP_SUPPLY_FAN, function (js) {
    var x = js ? parseLight0(js) : null;
    ctx.supply.fan_on = x ? x.on : 0;
    ctx.supply.fan_pct = x ? x.pct : 0;
    ctx.supply.fan_w = x ? x.w : 0;
    done();
  });
}
