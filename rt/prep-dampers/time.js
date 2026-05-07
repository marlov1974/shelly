// prep-dampers time 1.3.0-calendar-periods
function prepIso(d) {
  return d.getFullYear() + "-" + (d.getMonth() + 1 < 10 ? "0" : "") + (d.getMonth() + 1) + "-" + (d.getDate() < 10 ? "0" : "") + d.getDate() + "T" + (d.getHours() < 10 ? "0" : "") + d.getHours() + ":" + (d.getMinutes() < 10 ? "0" : "") + d.getMinutes() + ":" + (d.getSeconds() < 10 ? "0" : "") + d.getSeconds();
}
function wdMon(d) { var w = d.getDay(); return w === 0 ? 7 : w; }
function periodStart(d) { var h = d.getHours(); if (h < 8) return 0; if (h < 16) return 8; return 16; }
function periodName(d) { var h = periodStart(d); if (h === 0) return "p1"; if (h === 8) return "p2"; return "p3"; }
function periodHours(d) { return 8; }
function checkpointHour(d) { var h = periodStart(d); if (h === 0) return 8; if (h === 8) return 16; return 0; }
function checkpointWeekday(d) { var w = wdMon(d); if (periodStart(d) === 16) { w++; if (w > 7) w = 1; } return w; }
