// const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;
const GOOGLE_WEATHER_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

async function fetchJsonACB(url, errorMessage) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(errorMessage);
  }

  return response.json();
}

function formatTemperatureUnitACB(unit) {
  return unit === "FAHRENHEIT" ? "F" : "C";
}

function roundDegreesACB(value) {
  return Math.round(value ?? 0);
}

function formatClockTimeACB(value) {
  if (!value) {
    return "--";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getWeekdayLabelACB(dateString, index) {
  if (!dateString) {
    return index === 0 ? "Today" : `Day ${index + 1}`;
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return index === 0 ? "Today" : `Day ${index + 1}`;
  }

  if (index === 0) {
    return "Today";
  }

  return date.toLocaleDateString([], { weekday: "short" });
}

function getUvLabelACB(uvIndex) {
  if (uvIndex == null) {
    return null;
  }

  if (uvIndex <= 2) {
    return "Low";
  }

  if (uvIndex <= 5) {
    return "Moderate";
  }

  if (uvIndex <= 7) {
    return "High";
  }

  if (uvIndex <= 10) {
    return "Very high";
  }

  return "Extreme";
}

function getAirQualityLabelACB(aqi) {
  if (aqi == null) {
    return null;
  }

  if (aqi <= 50) {
    return "Good";
  }

  if (aqi <= 100) {
    return "Moderate";
  }

  if (aqi <= 150) {
    return "Unhealthy for sensitive groups";
  }

  if (aqi <= 200) {
    return "Unhealthy";
  }

  if (aqi <= 300) {
    return "Very unhealthy";
  }

  return "Hazardous";
}

function formatWindSpeedACB(wind) {
  const speed = wind?.speed?.value ?? wind?.speed?.valueInt ?? null;

  if (speed == null) {
    return "--";
  }

  return `${Math.round(speed)} km/h`;
}

function mapDailyForecastACB(forecastDays) {
  return (forecastDays || []).slice(0, 5).map(function mapDayACB(day, index) {
    return {
      day: getWeekdayLabelACB(day?.displayDate || day?.utcDateTime, index),
      condition:
        day?.daytimeForecast?.weatherCondition?.description?.text ||
        day?.nighttimeForecast?.weatherCondition?.description?.text ||
        "Unknown",
      high: roundDegreesACB(day?.maxTemperature?.degrees),
      low: roundDegreesACB(day?.minTemperature?.degrees),
    };
  });
}

export async function fetchAirQualityACB(latitude, longitude) {
  const url =
    `https://airquality.googleapis.com/v1/currentConditions:lookup` +
    `?key=${GOOGLE_WEATHER_API_KEY}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location: { latitude, longitude },
      universalAqi: true,
    }),
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  const index = data.indexes?.[0];

  if (!index) return null;

  return {
    aqi: index.aqi,
    label: index.category || getAirQualityLabelACB(index.aqi),
  };
}

export async function fetchCurrentWeatherACB(latitude, longitude) {
  const url =
    "https://weather.googleapis.com/v1/currentConditions:lookup" +
    `?key=${GOOGLE_WEATHER_API_KEY}` +
    `&location.latitude=${latitude}` +
    `&location.longitude=${longitude}`;

  return fetchJsonACB(url, "Failed to fetch current weather conditions.");
}

export async function fetchDailyForecastACB(latitude, longitude, days = 1) {
  const url =
    "https://weather.googleapis.com/v1/forecast/days:lookup" +
    `?key=${GOOGLE_WEATHER_API_KEY}` +
    `&location.latitude=${latitude}` +
    `&location.longitude=${longitude}` +
    `&days=${days}`;

  return fetchJsonACB(url, "Failed to fetch daily weather forecast.");
}

export async function fetchWeatherBannerACB(latitude, longitude) {
  const [currentData, dailyData] = await Promise.all([
    fetchCurrentWeatherACB(latitude, longitude),
    fetchDailyForecastACB(latitude, longitude, 1),
  ]);

  const today = dailyData.forecastDays?.[0];

  return {
    temperature: roundDegreesACB(currentData.temperature?.degrees),
    unit: formatTemperatureUnitACB(currentData.temperature?.unit),
    condition:
      currentData.weatherCondition?.description?.text ?? "Unknown conditions",
    high: roundDegreesACB(today?.maxTemperature?.degrees),
    low: roundDegreesACB(today?.minTemperature?.degrees),
    isDaytime: currentData.isDaytime ?? true,
    iconBaseUri: currentData.weatherCondition?.iconBaseUri ?? null,
  };
}

// get some more weather details like UV and wind speed
export async function fetchWeatherDetailsACB(latitude, longitude) {
  const [currentData, dailyData, airQuality] = await Promise.all([
    fetchCurrentWeatherACB(latitude, longitude),
    fetchDailyForecastACB(latitude, longitude, 7),
    fetchAirQualityACB(latitude, longitude),
  ]);

  const today = dailyData.forecastDays?.[0];

  return {
    temperature: roundDegreesACB(currentData.temperature?.degrees),
    unit: formatTemperatureUnitACB(currentData.temperature?.unit),
    condition:
      currentData.weatherCondition?.description?.text ?? "Unknown conditions",
    high: roundDegreesACB(today?.maxTemperature?.degrees),
    low: roundDegreesACB(today?.minTemperature?.degrees),
    isDaytime: currentData.isDaytime ?? true,
    iconBaseUri: currentData.weatherCondition?.iconBaseUri ?? null,

    feelsLike: roundDegreesACB(
      currentData.feelsLikeTemperature?.degrees ??
        currentData.apparentTemperature?.degrees
    ),
    humidity:
      currentData.relativeHumidity != null
        ? Math.round(currentData.relativeHumidity)
        : null,
    windSpeed: formatWindSpeedACB(currentData.wind),
    precipitationChance:
      today?.daytimeForecast?.precipitation?.probability?.percent ??
      today?.daytimeForecast?.precipitationProbability?.percent ??
      today?.precipitation?.probability?.percent ??
      null,

    uvIndex:
      currentData.uvIndex ??
      today?.daytimeForecast?.uvIndex ??
      today?.uvIndex ??
      null,
    uvLabel: getUvLabelACB(
      currentData.uvIndex ??
        today?.daytimeForecast?.uvIndex ??
        today?.uvIndex ??
        null
    ),

    sunrise: formatClockTimeACB(today?.sunEvents?.sunriseTime),
    sunset: formatClockTimeACB(today?.sunEvents?.sunsetTime),

    airQuality,

    dailyForecast: mapDailyForecastACB(dailyData.forecastDays),
  };
}
  // TODO: this alert might not be needed? or can change a bit
export function buildWeatherAlertsACB(weather) {
  if (!weather?.condition) {
    return [];
  }

  const condition = weather.condition.toLowerCase();
  const alerts = [];

  if (
    condition.includes("storm") ||
    condition.includes("thunder") ||
    condition.includes("snow") ||
    condition.includes("ice")
  ) {
    alerts.push({
      event: "Weather warning",
      description: `Current conditions: ${weather.condition}. Allow extra travel time and use caution outdoors.`,
    });
  }

  if (condition.includes("rain") || condition.includes("showers")) {
    alerts.push({
      event: "Wet conditions",
      description:
        "Bring rain protection and expect slippery streets in exposed walking areas.",
    });
  }

  return alerts;
}