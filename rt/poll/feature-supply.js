// poll feature-supply 3.5.0-sensor-addon
var IP_SUPPLY_FAN = "192.168.77.10";

var SUPPLY_PA_ID = 100;
var TEMP_TO_HOUSE_ID = 100;
var TEMP_POST_VVX_ID = 101;
var TEMP_OUTDOOR_ID = 102;
var TEMP_BRINE_ID = 103;
var TEMP_BRINE_POST_SHUNT_ID = 104;
var TEMP_HOTWATER_ID = 105;
var TEMP_HOTWATER_POST_SHUNT_ID = 106;

var K_SUPPLY_FAN = 11.6;

function supplyPaToLs(pa) {
  if (pa <= 0) return 0;
  return Math.round(K_SUPPLY_FAN * Math.sqrt(pa));
}

function parseSupplySensorAddon(js) {
  var pa = comp(js, "input:" + SUPPLY_PA_ID);
  return {
    pa: n(num4(pa, "xpercent", "pa", "pressure", "value"), 0),
    rpm: 0,
    temp_to_house: tempValue(comp(js, "temperature:" + TEMP_TO_HOUSE_ID)),
    temp_post_vvx: tempValue(comp(js, "temperature:" + TEMP_POST_VVX_ID)),
    temp_outdoor: tempValue(comp(js, "temperature:" + TEMP_OUTDOOR_ID)),
    temp_brine: tempValue(comp(js, "temperature:" + TEMP_BRINE_ID)),
    temp_brine_post_shunt: tempValue(comp(js, "temperature:" + TEMP_BRINE_POST_SHUNT_ID)),
    temp_hotwater: tempValue(comp(js, "temperature:" + TEMP_HOTWATER_ID)),
    temp_hotwater_post_shunt: tempValue(comp(js, "temperature:" + TEMP_HOTWATER_POST_SHUNT_ID))
  };
}

function applySupplyFan(ctx, js) {
  var x = js ? parseSupplySensorAddon(js) : null;
  var y = js ? parseLight0(js) : null;
  ctx.supply.pa = x ? x.pa : 0;
  ctx.supply.rpm = 0;
  ctx.supply.temp_to_house = x ? x.temp_to_house : 0;
  ctx.supply.temp_post_vvx = x ? x.temp_post_vvx : 0;
  ctx.supply.temp_outdoor = x ? x.temp_outdoor : 0;
  ctx.supply.temp_brine = x ? x.temp_brine : 0;
  ctx.supply.temp_brine_post_shunt = x ? x.temp_brine_post_shunt : 0;
  ctx.supply.temp_hotwater = x ? x.temp_hotwater : 0;
  ctx.supply.temp_hotwater_post_shunt = x ? x.temp_hotwater_post_shunt : 0;
  ctx.supply.fan_on = y ? y.on : 0;
  ctx.supply.fan_pct = y ? y.pct : 0;
  ctx.supply.fan_w = y ? y.w : 0;
}

function deriveSupplyTelemetry(ctx) {
  ctx.supply.pa = normPa(ctx.supply.pa);
  ctx.supply.rpm = 0;
  ctx.supply.ls = normLs(supplyPaToLs(ctx.supply.pa));
  ctx.supply.temp_to_house = normTemp(ctx.supply.temp_to_house);
  ctx.supply.temp_post_vvx = normTemp(ctx.supply.temp_post_vvx);
  ctx.supply.temp_outdoor = normTemp(ctx.supply.temp_outdoor);
  ctx.supply.temp_brine = normTemp(ctx.supply.temp_brine);
  ctx.supply.temp_brine_post_shunt = normTemp(ctx.supply.temp_brine_post_shunt);
  ctx.supply.temp_hotwater = normTemp(ctx.supply.temp_hotwater);
  ctx.supply.temp_hotwater_post_shunt = normTemp(ctx.supply.temp_hotwater_post_shunt);
  ctx.supply.fan_pct = normPct(ctx.supply.fan_pct);
  ctx.supply.fan_w = normW(ctx.supply.fan_w);
}

function readSupply(ctx, cb) {
  httpGetStatus(IP_SUPPLY_FAN, function (js) {
    applySupplyFan(ctx, js);
    deriveSupplyTelemetry(ctx);
    cb();
  });
}
