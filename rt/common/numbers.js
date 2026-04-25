// common numbers 1.0.0
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

function lenOfString(s) {
  if (typeof s !== "string") return 0;
  return s.length;
}

function pad2(x) {
  x = i(x);
  if (x < 10) return "0" + String(x);
  return String(x);
}

