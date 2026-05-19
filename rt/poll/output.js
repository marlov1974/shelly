// poll output 3.4.2-split-extended-temps
var KEY_TEL_X = "ftx.tel.x";

function buildTelM(ctx) {
  return {
    t: {
      house: ctx.process.temp_house,
      out: ctx.supply.temp_outdoor,
      to_house: ctx.extract.temp_to_house,
      post_vvx: ctx.supply.temp_post_vvx,
      to_outdoor: ctx.supply.temp_to_outdoor,
      brine: ctx.extract.temp_brine,
      hotwater: ctx.extract.temp_hotwater
    },
    rpm: {
      sup: ctx.supply.rpm,
      ext: ctx.extract.rpm,
      vvx: ctx.process.rpm_vvx
    },
    pa: {
      sup: ctx.supply.pa,
      ext: ctx.extract.pa
    },
    ls: {
      sup: ctx.supply.ls,
      ext: ctx.extract.ls
    },
    ppm: {
      house: ctx.process.co2_ppm
    },
    rh: {
      house: ctx.process.rh_house
    }
  };
}

function buildTelX(ctx) {
  return {
    t: {
      brine_post_shunt: ctx.extract.temp_brine_post_shunt,
      hotwater_post_shunt: ctx.extract.temp_hotwater_post_shunt
    }
  };
}

function buildTelAct(ctx) {
  return {
    sup: { on: ctx.supply.fan_on, pct: ctx.supply.fan_pct, w: ctx.supply.fan_w },
    ext: { on: ctx.extract.fan_on, pct: ctx.extract.fan_pct, w: ctx.extract.fan_w },
    vvx: { on: ctx.vvx.on, w: ctx.vvx.w },
    heat: { on: ctx.heat.on, pct: ctx.heat.pct, w: ctx.heat.w },
    cool: { on: ctx.cool.on, pct: ctx.cool.pct, w: ctx.cool.w },
    dmp: { on: ctx.dmp.on, w: ctx.dmp.w }
  };
}

function writeTelemetryM(ctx, cb) { kvsSet(KEY_TEL_M, buildTelM(ctx), cb); }
function writeTelemetryX(ctx, cb) { kvsSet(KEY_TEL_X, buildTelX(ctx), cb); }
function writeTelemetryAct(ctx, cb) { kvsSet(KEY_TEL_ACT, buildTelAct(ctx), cb); }

function writePollStatus(ctx, cb) {
  log("OK S=" + ctx.supply.ls + " E=" + ctx.extract.ls + " C=" + ctx.process.co2_ppm);
  if (cb) cb();
}
