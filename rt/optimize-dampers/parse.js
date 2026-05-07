// optimize-dampers parse 1.1.0-compact-prep
function splitSemi(s) { if (!s) return []; return String(s).split(";"); }
function splitComma(s) { if (!s) return []; return String(s).split(","); }

function fieldVal(s, tag) {
  var key = tag + "=";
  var p = String(s || "").indexOf(key);
  if (p < 0) return "";
  p += key.length;
  var e = String(s || "").indexOf("|", p);
  if (e < 0) e = String(s || "").length;
  return String(s || "").substring(p, e);
}

function parseCompactPrep(s) {
  return {
    required_heat_kwh: n(fieldVal(s, "r"), 0),
    start_plan: fieldVal(s, "p"),
    period_code: i(n(fieldVal(s, "q"), 1)),
    prices: fieldVal(s, "c")
  };
}

function parsePlan(s) {
  var out = [0, 0, 0, 0];
  var k;
  s = String(s || "0000");
  if (s.indexOf(";") >= 0) {
    var a = splitSemi(s);
    for (k = 0; k < 4 && k < a.length; k++) out[k] = i(n(a[k], 0));
  } else {
    for (k = 0; k < 4 && k < s.length; k++) out[k] = i(n(s.charAt(k), 0));
  }
  return out;
}

function planString(p) {
  return String(p[0]) + String(p[1]) + String(p[2]) + String(p[3]);
}

function priceAt(csv, idx) {
  var a = splitComma(csv);
  if (idx < 0 || idx >= a.length) return 0;
  return n(a[idx], 0);
}
