// poll output 1.0.1
function buildTelM() {
  return {
    t: {
      house: tempHouseC,
      out: tempOutdoorC,
      to_house: tempToHouseC,
      post_vvx: tempPostVvxC,
      to_outdoor: tempToOutdoorC,
      brine: tempBrineC,
      hotwater: tempHotwaterC
    },
    rpm: {
      sup: rpmSupplyFan,
      ext: rpmExtractFan,
      vvx: rpmVvx
    },
    pa: {
      sup: paSupply,
      ext: paExtract
    },
    ls: {
      sup: lsSupply,
      ext: lsExtract
    },
    ppm: {
      house: ppmHouse
    },
    rh: {
      house: rhHouse
    }
  };
}

function buildTelAct() {
  return {
    sup: { on: actSupplyOn, pct: actSupplyPct, w: actSupplyW, run: actSupplyRun },
    ext: { on: actExtractOn, pct: actExtractPct, w: actExtractW, run: actExtractRun },
    vvx: { on: actVvxOn, w: actVvxW, run: actVvxRun },
    heat: { on: actHeatOn, pct: actHeatPct, w: actHeatW, run: actHeatRun },
    cool: { on: actCoolOn, pct: actCoolPct, w: actCoolW, run: actCoolRun },
    dmp: { on: actDampersOn, run: actDampersRun }
  };
}

function buildVvxEffRawHist() {
  return { r0: d1(vvxEffRaw0), r1: d1(vvxEffRaw1), r2: d1(vvxEffRaw2) };
}

function writeTelemetryM(cb) { kvsSet(KEY_TEL_M, buildTelM(), cb); }
function writeTelemetryAct(cb) { kvsSet(KEY_TEL_ACT, buildTelAct(), cb); }
function writeVvxEffRawHist(cb) { kvsSet(KEY_VVX_EFF_RAW_HIST, buildVvxEffRawHist(), cb); }
function writeTotalPower(cb) { numberSet(TOTAL_POWER_ID, totalPowerW, cb); }
function writeVvxEfficiency(cb) { numberSet(VVX_EFFICIENCY_ID, vvxEfficiencyPct, cb); }
function writeFanSpeedAvg(cb) { numberSet(FAN_SPEED_AVG_ID, fanSpeedAvgPct, cb); }

function writePollStatus(cb) {
  var s = "P OK W=" + totalPowerW + " E=" + vvxEfficiencyPct + " F=" + fanSpeedAvgPct;
  Shelly.call("Text.Set", { id: POLL_STATUS_TEXT_ID, value: s }, function () {
    if (cb) cb();
  });
}

