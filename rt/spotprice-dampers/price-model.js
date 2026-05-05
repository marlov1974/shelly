// spotprice-dampers price-model 1.1.3-tax-grid
// Tibber priceInfo.total is treated as electricity-retailer price incl VAT.
// This model adds variable network-side costs used for optimization.

var ENERGY_TAX_SEK_PER_KWH_INC_VAT = 0.450;

// Vattenfall Eldistribution Tidstariff 2026, incl VAT.
var GRID_HIGH_SEK_PER_KWH_INC_VAT = 0.765;
var GRID_LOW_SEK_PER_KWH_INC_VAT = 0.305;

// High-load: weekdays 06-22 during Jan, Feb, Mar, Nov, Dec.
// v1.1.3 does not include public-holiday exceptions.
var GRID_HIGH_MONTHS = "1,2,3,11,12";
var GRID_HIGH_WEEKDAYS = "1,2,3,4,5";
var GRID_HIGH_START_HOUR = 6;
var GRID_HIGH_END_HOUR = 22;

function spHasCsvInt(csv, value) {
  return ("," + csv + ",").indexOf("," + String(value) + ",") >= 0;
}

function spWeekdayMon1(d) {
  var w = d.getDay();
  return w === 0 ? 7 : w;
}

function spTargetDate(wantTomorrow) {
  var d = new Date();
  if (wantTomorrow) d = new Date(d.getTime() + 86400000);
  return d;
}

function spIsHighLoad(month, weekday, hour) {
  return spHasCsvInt(GRID_HIGH_MONTHS, month) &&
    spHasCsvInt(GRID_HIGH_WEEKDAYS, weekday) &&
    hour >= GRID_HIGH_START_HOUR && hour < GRID_HIGH_END_HOUR;
}

function spGridFeeIncVat(month, weekday, hour) {
  return spIsHighLoad(month, weekday, hour) ? GRID_HIGH_SEK_PER_KWH_INC_VAT : GRID_LOW_SEK_PER_KWH_INC_VAT;
}

function finalPriceFromTibber(tibberTotalIncVat, index, count, wantTomorrow) {
  var d = spTargetDate(wantTomorrow);
  var month = d.getMonth() + 1;
  var weekday = spWeekdayMon1(d);
  var hour = count >= 96 ? Math.floor(index / 4) : index;
  return Number(tibberTotalIncVat) + ENERGY_TAX_SEK_PER_KWH_INC_VAT + spGridFeeIncVat(month, weekday, hour);
}
