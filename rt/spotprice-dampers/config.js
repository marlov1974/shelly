// spotprice-dampers config 1.2.0-fallback
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

// Statistical all-in fallback prices, SEK/kWh, 12 x 2h blocks.
// Used if Tibber/API/token fails so HP scheduling still works.
var FALLBACK_PRICE_2H = "1.6,1.5,1.5,1.8,2.3,2.2,2.0,2.1,2.5,2.7,2.5,2.0";
