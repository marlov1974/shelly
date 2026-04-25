// poll numbers 3.1.1
function n(v, d) {
  var x = Number(v);
  return (x === x) ? x : d;
}

function i(v) {
  var x = Number(v);
  if (x !== x) return 0;
  return Math.floor(x + 0.5);
}

function d1(v) {
  var x = Number(v);
  if (x !== x) return 0;
  return Math.round(x * 10) / 10;
}

function clip(v, lo, hi) {
  var x = Number(v);
  if (x !== x) x = 0;
  if (x < lo) x = lo;
  if (x > hi) x = hi;
  return x;
}

function normTemp(v) { return d1(clip(v, -99.9, 99.9)); }
function normRh(v) { return i(clip(v, 0, 100)); }
function normPpm(v) { return i(clip(v, 0, 2000)); }
function normPa(v) { return i(clip(v, 0, 999)); }
function normLs(v) { return i(clip(v, 0, 999)); }
function normPct(v) { return i(clip(v, 0, 100)); }
function normFanRpm(v) { return i(clip(v, 0, 9999)); }
function normVvxRpm(v) { return i(clip(v, 0, 999)); }
function normW(v) { return i(clip(v, 0, 9999)); }
