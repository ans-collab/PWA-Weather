export interface IWeatherData {
    latitude: number;
    longitude: number;
    generationtime_ms: number;
    utc_offset_seconds: number;
    timezone: string;
    timezone_abbreviation: string;
    elevation: number;
    current_units: {
        time: string;
        interval: string;
        temperature_2m: string;
        relative_humidity_2m: string;
        apparent_temperature: string;
        weather_code: string;
        wind_speed_10m: string;
    };
    current: {
        time: string;
        interval: number;
        temperature_2m: number;
        relative_humidity_2m: number;
        apparent_temperature: number;
        weather_code: number;
        wind_speed_10m: number;
    };
    hourly_units: {
        time: string;
        temperature_2m: string;
        precipitation_probability: string;
        precipitation: string;
        weather_code: string;
    };
    hourly: {
        time: string[];
        temperature_2m: number[];
        precipitation_probability: number[];
        precipitation: number[];
        weather_code: number[];
    };
    daily_units: {
        time: string;
        weather_code: string;
        temperature_2m_max: string;
        temperature_2m_min: string;
        precipitation_probability_max: string;
    };
    daily: {
        time: string[];
        weather_code: number[];
        temperature_2m_max: number[];
        temperature_2m_min: number[];
        precipitation_probability_max: number[];
    };
}

export const weatherConditions = {
  CLEAR: {
    name: "Sunny",
    icon: "weather-animation--sunny",
  },

  MOSTLY_CLEAR: {
    name: "Mostly Sunny",
    icon: "weather-animation--mostly-sunny",
  },

  PARTLY_CLOUDY: {
    name: "Partly Cloudy",
    icon: "weather-animation--partly-cloudy",
  },

  CLOUDY: {
    name: "Cloudy",
    icon: "weather-animation--cloudy",
  },

  FOGGY: {
    name: "Foggy",
    icon: "weather-animation--foggy",
  },

  LIGHT_RAIN: {
    name: "Light Rain",
    icon: "weather-animation--light-rain",
  },

  RAIN: {
    name: "Rain",
    icon: "weather-animation--rain",
  },

  HEAVY_RAIN: {
    name: "Heavy Rain",
    icon: "weather-animation--heavy-rain",
  },

  LIGHT_SNOW: {
    name: "Light Snow",
    icon: "weather-animation--light-snow",
  },

  SNOW: {
    name: "Snow",
    icon: "weather-animation--snow",
  },

  HEAVY_SNOW: {
    name: "Heavy Snow",
    icon: "weather-animation--heavy-snow",
  },

  THUNDERSTORM: {
    name: "Thunderstorm",
    icon: "weather-animation--thunderstorm",
  },
};

export const getWeatherCondition = (weatherCode: number) => {
  switch (weatherCode) {
    // Clear
    case 0:
      return weatherConditions.CLEAR;

    // Mainly clear
    case 1:
      return weatherConditions.MOSTLY_CLEAR;

    // Partly cloudy
    case 2:
      return weatherConditions.PARTLY_CLOUDY;

    // Overcast
    case 3:
      return weatherConditions.CLOUDY;

    // Fog
    case 45:
    case 48:
      return weatherConditions.FOGGY;

    // Light drizzle
    case 51:
    case 53:
    case 56:
      return weatherConditions.LIGHT_RAIN;

    // Heavy drizzle
    case 55:
    case 57:
      return weatherConditions.RAIN;

    // Light rain
    case 61:
      return weatherConditions.LIGHT_RAIN;

    // Moderate rain
    case 63:
    case 66:
      return weatherConditions.RAIN;

    // Heavy rain
    case 65:
    case 67:
      return weatherConditions.HEAVY_RAIN;

    // Light snow
    case 71:
    case 77:
    case 85:
      return weatherConditions.LIGHT_SNOW;

    // Moderate snow
    case 73:
      return weatherConditions.SNOW;

    // Heavy snow
    case 75:
    case 86:
      return weatherConditions.HEAVY_SNOW;

    // Thunderstorms
    case 95:
    case 96:
    case 99:
      return weatherConditions.THUNDERSTORM;

    // Unknown code
    default:
      return {
        name: "Unknown",
        icon: "weather-animation--cloudy",
      };
  }
}