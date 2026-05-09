// spotprice-dampers config 1.3.0-seasonal-fallback
var TIBBER_TOKEN_TEXT_ID = 201;
var TIBBER_URL = "https://api.tibber.com/v1-beta/gql";
var FETCH_TOMORROW = true;

var KEY_PRICE_2H = "hp.price.2h";
var KEY_PRICE_DATE = "hp.price.date";
var KEY_PRICE_STATUS = "hp.price.status";
var KEY_PRICE_UPDATED = "hp.price.updated";
var KEY_PRICE_SOURCE = "hp.price.source";
var KEY_PRICE_DEBUG = "hp.price.debug";
var KEY_PRICE_DEBUG_LEN = "hp.price.debug.len";

// Statistical all-in fallback prices, SEK/kWh, 12 x 2h fixed-CET blocks.
// Includes spot statistics, Tibber markup, Vattenfall time tariff, energy tax and VAT.
// Winter: Nov 1 - Mar 29. Summer: Apr 1 - Oct 25. Edge/DST days use winter fallback.
var FALLBACK_WINTER_PRICE_2H = "4.6,4.4,4.6,6.7,7.8,7.6,7.5,7.6,7.9,7.6,6.5,5.1";
var FALLBACK_SUMMER_PRICE_2H = "3.2,3.3,4.1,5.8,5.1,3.9,3.4,4.0,5.1,5.1,4.1,3.4";
