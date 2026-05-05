// weather-dampers url 1.1.0
function weatherUrl() {
  return WEATHER_URL +
    "?latitude=" + WEATHER_LAT +
    "&longitude=" + WEATHER_LON +
    "&hourly=temperature_2m,shortwave_radiation" +
    "&forecast_days=1" +
    "&timezone=" + WEATHER_TZ;
}
