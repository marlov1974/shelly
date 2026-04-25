// poll output 2.0.0
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
    sup: { on: ctx.supply.fan_on, pct: ctx.supply.fan_pct, w: ctx.supply.fan_w, run: ctx.supply.fan_run },
    ext: { on: ctx.extract.fan_on, pct: ctx.extract.fan_pct, w: ctx.extract.fan_w, run: ctx.extract.fan_run },
    vvx: { on: ctx.vvx.on, w: ctx.vvx.w, run: ctx.vvx.run },
    heat: { on: ctx.heat.on, pct: ctx.heat.pct, w: ctx.heat.w, run: ctx.heat.run },
    cool: { on: ctx.cool.on, pct: ctx.cool.pct, w: ctx.cool.w, run: ctx.cool.run },
    dmp: { on: ctx.dmp.on, run: ctx.dmp.run }
  };
}

function buildVvxEffRawHist(ctx) {
  return { r0: d1(ctx.hist.vvx_r0), r1: d1(ctx.hist.vvx_r1), r2: d1(ctx.hist.vvx_r2) };
}

function writeTelemetryM(ctx, cb) { kvsSet(KEY_TEL_M, buildTelM(ctx), cb); }
function writeTelemetryAct(ctx, cb) { kvsSet(KEY_TEL_ACT, buildTelAct(ctx), cb); }
function writeVvxEffRawHist(ctx, cb) { kvsSet(KEY_VVX_EFF_RAW_HIST, buildVvxEffRawHist(ctx), cb); }
function writeTotalPower(ctx, cb) { numberSet(TOTAL_POWER_ID, ctx.power.total_w, cb); }
function writeVvxEfficiency(ctx, cb) { numberSet(VVX_EFFICIENCY_ID, ctx.vvx.eff_pct, cb); }
function writeFanSpeedAvg(ctx, cb) { numberSet(FAN_SPEED_AVG_ID, ctx.fan.avg_pct, cb); }

function writePollStatus(ctx, cb) {
  var s = "P OK W=" + ctx.power.total_w + " E=" + ctx.vvx.eff_pct + " F=" + ctx.fan.avg_pct;
  Shelly.call("Text.Set", { id: POLL_STATUS_TEXT_ID, value: s }, function () {
    if (cb) cb();
  });
}
