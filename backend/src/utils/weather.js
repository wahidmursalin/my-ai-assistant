// Free, no-API-key weather lookup using Open-Meteo (geocoding + forecast).

const GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

const WEATHER_CODES = {
  0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Fog", 48: "Depositing rime fog",
  51: "Light drizzle", 53: "Moderate drizzle", 55: "Dense drizzle",
  61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
  71: "Slight snow", 73: "Moderate snow", 75: "Heavy snow",
  80: "Slight rain showers", 81: "Moderate rain showers", 82: "Violent rain showers",
  95: "Thunderstorm", 96: "Thunderstorm with hail",
};

export const runWeather = async (location) => {
  try {
    const geoRes = await fetch(`${GEOCODE_URL}?name=${encodeURIComponent(location)}&count=1`);
    const geoData = await geoRes.json();
    const place = geoData.results?.[0];

    if (!place) return { error: `Could not find a location matching "${location}"` };

    const forecastRes = await fetch(
      `${FORECAST_URL}?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m`
    );
    const forecastData = await forecastRes.json();
    const current = forecastData.current;

    return {
      location: `${place.name}${place.country ? ", " + place.country : ""}`,
      temperature_celsius: current.temperature_2m,
      condition: WEATHER_CODES[current.weather_code] || "Unknown",
      humidity_percent: current.relative_humidity_2m,
      wind_speed_kmh: current.wind_speed_10m,
    };
  } catch (err) {
    return { error: `Weather lookup failed: ${err.message}` };
  }
};
