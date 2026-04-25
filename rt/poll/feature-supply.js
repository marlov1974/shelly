// poll feature-supply 1.0.2-debug-seq
function supplyDbg(s, cb) {
  Shelly.call("Text.Set", { id: POLL_STATUS_TEXT_ID, value: String(s || "") }, function () {
    if (cb) cb();
  });
}

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
  supplyDbg("P S1 UNI", function () {
    httpGetStatus(IP_SUPPLY_UNI, function (js) {
      var x = js ? parseSupplyUni(js) : null;
      ctx.supply.pa = x ? x.pa : 0;
      ctx.supply.rpm = x ? x.rpm : 0;
      ctx.supply.temp_post_vvx = x ? x.temp_post_vvx : 0;
      ctx.supply.temp_outdoor = x ? x.temp_outdoor : 0;
      ctx.supply.temp_to_outdoor = x ? x.temp_to_outdoor : 0;

      supplyDbg("P S2 FAN", function () {
        httpGetStatus(IP_SUPPLY_FAN, function (js2) {
          var y = js2 ? parseLight0(js2) : null;
          ctx.supply.fan_on = y ? y.on : 0;
          ctx.supply.fan_pct = y ? y.pct : 0;
          ctx.supply.fan_w = y ? y.w : 0;

          supplyDbg("P S3 DER", function () {
            deriveSupply(ctx);
            cb();
          });
        });
      });
    });
  });
}
