// prep-dampers time 1.0.0
function prepIso(d) {
  return d.getFullYear() + "-" + (d.getMonth() + 1 < 10 ? "0" : "") + (d.getMonth() + 1) + "-" + (d.getDate() < 10 ? "0" : "") + d.getDate() + "T" + (d.getHours() < 10 ? "0" : "") + d.getHours() + ":" + (d.getMinutes() < 10 ? "0" : "") + d.getMinutes() + ":" + (d.getSeconds() < 10 ? "0" : "") + d.getSeconds();
}
function wdMon(d) { var w = d.getDay(); return w === 0 ? 7 : w; }
function periodStart(d) { var h = d.getHours(); if (h < 6) return 22; if (h < 14) return 6; if (h < 22) return 14; return 22; }
function periodName(d) { var h = periodStart(d); if (h === 22) return "night"; if (h === 6) return "morning"; return "afternoon"; }
function periodHours(d) { return 8; }
function checkpointHour(d) { var h = periodStart(d); if (h === 22) return 6; if (h === 6) return 14; return 22; }
function checkpointWeekday(d) { var w = wdMon(d); if (periodStart(d) === 22) { w++; if (w > 7) w = 1; } return w; }
