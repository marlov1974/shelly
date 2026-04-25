// poll derive 1.0.0
function runGroup1(cb) {
  var left = 5;
  var finished = false;
  function done() {
    left--;
    if (!finished && left <= 0) {
      finished = true;
      cb();
    }
  }
  readSupplyUni(done);
  readExtractUni(done);
  readProcessUni(done);
  readLightDevice(IP_SUPPLY_FAN, function (x) {
    actSupplyOn = x ? x.on : 0;
    actSupplyPct = x ? x.pct : 0;
    actSupplyW = x ? x.w : 0;
  }, done);
  readLightDevice(IP_EXTRACT_FAN, function (x) {
    actExtractOn = x ? x.on : 0;
    actExtractPct = x ? x.pct : 0;
    actExtractW = x ? x.w : 0;
  }, done);
}

function runGroup2(cb) {
  var left = 4;
  var finished = false;
  function done() {
    left--;
    if (!finished && left <= 0) {
      finished = true;
      cb();
    }
  }
  readLightDevice(IP_HEAT, function (x) {
    actHeatOn = x ? x.on : 0;
    actHeatPct = x ? x.pct : 0;
    actHeatW = x ? x.w : 0;
  }, done);
  readLightDevice(IP_COOL, function (x) {
    actCoolOn = x ? x.on : 0;
    actCoolPct = x ? x.pct : 0;
    actCoolW = x ? x.w : 0;
  }, done);
  readSwitchDevice(IP_VVX, function (x) {
    actVvxOn = x ? x.on : 0;
    actVvxW = x ? x.w : 0;
  }, done);
  readSwitchDevice(IP_DAMPERS, function (x) {
    actDampersOn = x ? x.on : 0;
  }, done);
}

function derive(cb) {
  var vvxEffRawNew;
  paSupply = clipPa(paSupply);
  paExtract = clipPa(paExtract);
  lsSupply = clipLs(paToLsSupply(paSupply));
  lsExtract = clipLs(paToLsExtract(paExtract));
  actDampersRun = actDampersOn;
  actSupplyRun = b(actSupplyOn && actSupplyPct > 10 && rpmSupplyFan > FAN_RPM_RUN_MIN && paSupply >= FAN_DP_RUN_MIN_PA);
  actExtractRun = b(actExtractOn && actExtractPct > 10 && rpmExtractFan > FAN_RPM_RUN_MIN && paExtract >= FAN_DP_RUN_MIN_PA);
  actVvxRun = b(actVvxOn && rpmVvx > VVX_RPM_RUN_MIN);
  actHeatRun = b(actHeatOn && actHeatPct > 0 && (tempToHouseC - tempPostVvxC) >= HEAT_DT_MIN_C);
  actCoolRun = b(actCoolOn && actCoolPct > 0 && (tempPostVvxC - tempToHouseC) >= COOL_DT_MIN_C);
  tempHouseC = clipTemp(tempHouseC);
  tempOutdoorC = clipTemp(tempOutdoorC);
  tempToHouseC = clipTemp(tempToHouseC);
  tempPostVvxC = clipTemp(tempPostVvxC);
  tempToOutdoorC = clipTemp(tempToOutdoorC);
  tempBrineC = clipTemp(tempBrineC);
  tempHotwaterC = clipTemp(tempHotwaterC);
  rpmSupplyFan = clipFanRpm(rpmSupplyFan);
  rpmExtractFan = clipFanRpm(rpmExtractFan);
  rpmVvx = clipVvxRpm(rpmVvx);
  ppmHouse = clipPpm(ppmHouse);
  rhHouse = clipRh(rhHouse);
  actSupplyW = clipW(actSupplyW, 180);
  actExtractW = clipW(actExtractW, 180);
  actVvxW = clipW(actVvxW, 30);
  actHeatW = clipW(actHeatW, 50);
  actCoolW = clipW(actCoolW, 50);
  totalPowerW = IDLE_POWER_W + (actDampersOn ? DAMPERS_POWER_W : 0) + actSupplyW + actExtractW + actVvxW + actHeatW + actCoolW;
  totalPowerW = i(clip(totalPowerW, 0, 9999));
  vvxEffRawNew = calcVvxEfficiencyRawPct(tempOutdoorC, tempToHouseC, tempPostVvxC, tempToOutdoorC);
  vvxEfficiencyPct = clipPct((vvxEffRawNew + vvxEffRaw0 + vvxEffRaw1) / 3);
  vvxEffRaw2 = vvxEffRaw1;
  vvxEffRaw1 = vvxEffRaw0;
  vvxEffRaw0 = vvxEffRawNew;
  fanSpeedAvgPct = clipPct((actSupplyPct + actExtractPct) / 2);
  cb();
}

