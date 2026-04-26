// poll feature-supply 3.1.3-debug-checkpoints
var IP_SUPPLY_UNI = "192.168.77.20";
var IP_SUPPLY_FAN = "192.168.77.10";

var SUPPLY_DP_ID = 100;
var SUPPLY_RPM_ID = 2;
var TEMP_POST_VVX_ID = 100;
var TEMP_OUTDOOR_ID = 101;
var TEMP_TO_OUTDOOR_ID = 102;

var K_SUPPLY_FAN = 11.6;

function supplyDbg(s, cb) {
  Shelly.call("Text.Set", { id: POLL_STATUS_TEXT_ID, value: String(s || "") }, function () {
    if (cb) cb();
  });
}

function supplyPaToLs(pa) {
  if (pa <= 0) return 0;
  return Math.round(K_SUPPLY_FAN * Math.sqrt(pa));
}

function parseSupplyUni(js) {
  var vm = comp(js, "voltmeter:" + SUPPLY_DP_ID);
  var inRpm = comp(js, "input:" + SUPPLY_RPM_ID);
  return {
    pa: n(num4(vm, "xvoltage", "value", "pa", "pressure"), 0),
    rpm: n(num4(inRpm, "xfreq", "value", "rpm", "frequency"), 0),
    temp_post_vvx: tempValue(comp(js, "temperature:" + TEMP_POST_VVX_ID)),
    temp_outdoor: tempValue(comp(js, "temperature:" + TEMP_OUTDOOR_ID)),
    temp_to_outdoor: tempValue(comp(js, "temperature:" + TEMP_TO_OUTDOOR_ID))
  };
}

function deriveSupplyTelemetry(ctx) {
  ctx.supply.pa = normPa(ctx.supply.pa);
  ctx.supply.rpm = normFanRpm(ctx.supply.rpm);
  ctx.supply.ls = normLs(supplyPaToLs(ctx.supply.pa));
  ctx.supply.temp_post_vvx = normTemp(ctx.supply.temp_post_vvx);
  ctx.supply.temp_outdoor = normTemp(ctx.supply.temp_outdoor);
  ctx.supply.temp_to_outdoor = normTemp(ctx.supply.temp_to_outdoor);
  ctx.supply.fan_pct = normPct(ctx.supply.fan_pct);
  ctx.supply.fan_w = normW(ctx.supply.fan_w);
}

function readSupply(ctx, cb) {
  supplyDbg("P S0 UNI", function () {
    httpGetStatus(IP_SUPPLY_UNI, function (js) {
      var x = js ? parseSupplyUni(js) : null;
      ctx.supply.pa = x ? x.pa : 0;
      ctx.supply.rpm = x ? x.rpm : 0;
      ctx.supply.temp_post_vvx = x ? x.temp_post_vvx : 0;
      ctx.supply.temp_outdoor = x ? x.temp_outdoor : 0;
      ctx.supply.temp_to_outdoor = x ? x.temp_to_outdoor : 0;

      supplyDbg("P S1 UNI_OK", function () {
        supplyDbg("P S2 FAN", function () {
          httpGetStatus(IP_SUPPLY_FAN, function (js2) {
            var y = js2 ? parseLight0(js2) : null;
            ctx.supply.fan_on = y ? y.on : 0;
            ctx.supply.fan_pct = y ? y.pct : 0;
            ctx.supply.fan_w = y ? y.w : 0;

            supplyDbg("P S3 FAN_OK", function () {
              deriveSupplyTelemetry(ctx);
              supplyDbg("P S4 DER", function () {
                cb();
              });
            });
          });
        });
      });
    });
  });
}
