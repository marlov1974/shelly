// poll clips 1.0.0
function clip01(v) {
  return clip(v, 0, 1);
}

function clipTemp(v) { return d1(clip(v, -99.9, 99.9)); }
function clipRh(v) { return i(clip(v, 0, 100)); }
function clipPpm(v) { return i(clip(v, 0, 2000)); }
function clipPa(v) { return i(clip(v, 0, 999)); }
function clipLs(v) { return i(clip(v, 0, 999)); }
function clipPct(v) { return i(clip(v, 0, 100)); }
function clipPctRaw(v) { return d1(clip(v, 0, 100)); }
function clipFanRpm(v) { return i(clip(v, 0, 9999)); }
function clipVvxRpm(v) { return i(clip(v, 0, 99)); }
function clipW(v, maxW) { return i(clip(v, 0, maxW)); }

function paToLsSupply(pa) {
  if (pa <= 0) return 0;
  return Math.round(K_SUPPLY_FAN * Math.sqrt(pa));
}

function paToLsExtract(pa) {
  if (pa <= 0) return 0;
  return Math.round(K_EXTRACT_FAN * Math.sqrt(pa));
}

function calcVvxEfficiencyRawPct(tOutdoorC, tFromHouseC, tPostVvxC, tToOutdoorC) {
  var den = tFromHouseC - tOutdoorC;
  var effSupply;
  var effExtract;
  var effAvg;

  if (abs(den) < VVX_EFF_DEN_MIN_C) return 0.0;

  effSupply = (tPostVvxC - tOutdoorC) / den;
  effExtract = (tFromHouseC - tToOutdoorC) / den;

  effSupply = clip01(effSupply);
  effExtract = clip01(effExtract);

  effAvg = (effSupply + effExtract) / 2;

  return clipPctRaw(100 * effAvg);
}

