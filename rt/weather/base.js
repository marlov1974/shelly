// weather base 1.0.0
var SCRIPT_NAME = "weather";

var LAT = "59.6214405";
var LON = "17.7336153";
var KEY_WEATHER_ACT = "ftx.weather.act";

var SOLAR_GAIN_FACTOR_KWH_PER_MJ = 2.0;

var API_DAILY_BASE =
  "https://api.open-meteo.com/v1/forecast" +
  "?latitude=" + LAT +
  "&longitude=" + LON +
  "&daily=shortwave_radiation_sum" +
  "&timezone=auto";

var API_HOURLY_BASE =
  "https://api.open-meteo.com/v1/forecast" +
  "?latitude=" + LAT +
  "&longitude=" + LON +
  "&hourly=temperature_2m" +
  "&forecast_hours=1" +
  "&timezone=auto";

function createWeatherCtx() {
  return {
    today: "",
    daily_url: "",
    hourly_url: "",
    act: { solar_kwh_today: 0, temp_now: 0 }
  };
}
