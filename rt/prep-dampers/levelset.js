// prep-dampers levelset 1.6.0-split
var LV_START = 0;
var LV_E0 = 0.8, LV_E1 = 1.1, LV_E2 = 1.8, LV_E3 = 2.4, LV_E4 = 7.5;
var LV_H0 = 8.8, LV_H1 = 11.4, LV_H2 = 18.8, LV_H3 = 24.0, LV_H4 = 54.0;
function parsePriceAt(csv, idx) {
  var s = String(csv || "");
  var p = 0;
  var k = 0;
  while (k < idx) {
    p = s.indexOf(",", p);
    if (p < 0) return 0;
    p++;
    k++;
  }
  var e = s.indexOf(",", p);
  if (e < 0) e = s.length;
  return n(s.substring(p, e), 0);
}
function selectLevelSet(periodName) {
  LV_START = 0;
  LV_E0 = 0.8; LV_E1 = 1.1; LV_E2 = 1.8; LV_E3 = 2.4; LV_E4 = 7.5;
  LV_H0 = 8.8; LV_H1 = 11.4; LV_H2 = 18.8; LV_H3 = 24.0; LV_H4 = 54.0;
  if (periodName === "p2") {
    LV_START = 4;
    LV_E0 = 0.5; LV_E1 = 0.7; LV_E2 = 1.2; LV_E3 = 1.7; LV_E4 = 5.2;
    LV_H0 = 5.8; LV_H1 = 7.8; LV_H2 = 12.8; LV_H3 = 17.0; LV_H4 = 40.0;
  }
  if (periodName === "p3") {
    LV_START = 8;
    LV_E0 = 0.65; LV_E1 = 0.9; LV_E2 = 1.5; LV_E3 = 2.0; LV_E4 = 6.5;
    LV_H0 = 7.2; LV_H1 = 9.6; LV_H2 = 15.6; LV_H3 = 20.0; LV_H4 = 48.0;
  }
}
