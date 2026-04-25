// poll flow 3.0.0
function clipTemp(v) { return d1(clip(v, -99.9, 99.9)); }
function clipRh(v) { return i(clip(v, 0, 100)); }
function clipPpm(v) { return i(clip(v, 0, 2000)); }
function clipPa(v) { return i(clip(v, 0, 999)); }
function clipLs(v) { return i(clip(v, 0, 999)); }
function clipPct(v) { return i(clip(v, 0, 100)); }
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
