// === spotprice v1.0.5-readable-chunked ===
(function () {
  "use strict";

  // ---------------------------
  // User configuration
  // ---------------------------
  var PRICE_AREA = "SE3";
  var FETCH_TOMORROW = true;

  var VAT_RATE = 0.25;
  var SPOT_PRICE_IS_EX_VAT = true;

  // Retailer / elhandel, SEK/kWh ex VAT.
  // Tibber example: 0.06 SEK/kWh ex VAT = 0.075 SEK/kWh inc VAT.
  var RETAILER_MARKUP_SEK_PER_KWH_EX_VAT = 0.06;
  var RETAILER_VARIABLE_COST_SEK_PER_KWH_EX_VAT = 0.00;

  // Energy tax, SEK/kWh ex VAT. Adjust per year/location.
  var ENERGY_TAX_SEK_PER_KWH_EX_VAT = 0.36;

  // Grid model: "flat" or "time_tariff".
  var GRID_MODEL = "time_tariff";

  // Grid transfer fees are configured inc VAT.
  var GRID_FLAT_SEK_PER_KWH_INC_VAT = 0.305;
  var GRID_HIGH_SEK_PER_KWH_INC_VAT = 0.765;
  var GRID_LOW_SEK_PER_KWH_INC_VAT = 0.305;

  // High-load definition. Monday=1 ... Sunday=7.
  var GRID_HIGH_MONTHS = "1,2,3,11,12";
  var GRID_HIGH_WEEKDAYS = "1,2,3,4,5";
  var GRID_HIGH_START_HOUR = 6;
  var GRID_HIGH_END_HOUR = 22;

  // KVS keys
  var KEY_PRICE_2H = "hp.price.2h";
  var KEY_PRICE_DATE = "hp.price.date";
  var KEY_PRICE_AREA = "hp.price.area";
  var KEY_PRICE_STATUS = "hp.price.status";
  var KEY_PRICE_UPDATED = "hp.price.updated";

