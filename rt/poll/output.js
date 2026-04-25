// poll output 3.0.0
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

function buildTelAct(ctx) {
  return {
    sup: { on: ctx.supply.fan_on, pct: ctx.supply.fan_pct, w: ctx.supply.fan_w },
    ext: { on: ctx.extract.fan_on, pct: ctx.extract.fan_pct, w: ctx.extract.fan_w },
    vvx: { on: ctx.vvx.on, w: ctx.vvx.w },
    heat: { on: ctx.heat.on, pct: ctx.heat.pct, w: ctx.heat.w },
    cool: { on: ctx.cool.on, pct: ctx.cool.pct, w: ctx.cool.w },
    dmp: { on: ctx.dmp.on }
  };
}

function writeTelemetryM(ctx, cb) { kvsSet(KEY_TEL_M, buildTelM(ctx), cb); }
function writeTelemetryAct(ctx, cb) { kvsSet(KEY_TEL_ACT, buildTelAct(ctx), cb); }

function writePollStatus(ctx, cb) {
  var s = "P OK S=" + ctx.supply.ls + " E=" + ctx.extract.ls + " C=" + ctx.process.co2_ppm;
  Shelly.call("Text.Set", { id: POLL_STATUS_TEXT_ID, value: s }, function () {
    if (cb) cb();
  });
}
