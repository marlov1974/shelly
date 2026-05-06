// prep-dampers levels 1.1.0
// Format per level: level,electric_kW,heat_kWh_per_2h
function levelSpecForPeriod(periodName) {
  if (periodName === "morning") {
    return "0,0.5,5.8;1,0.7,7.8;2,1.2,12.8;3,1.7,17.0;4,5.2,40.0";
  }
  if (periodName === "afternoon") {
    return "0,0.65,7.2;1,0.9,9.6;2,1.5,15.6;3,2.0,20.0;4,6.5,48.0";
  }
  return "0,0.8,8.8;1,1.1,11.4;2,1.8,18.8;3,2.4,24.0;4,7.5,54.0";
}
