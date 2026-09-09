import { IWeatherData } from "../engine/weather.models";

export class WeatherClient {
  static getWeather(
    longitude: number,
    latitude: number,
  ): Promise<IWeatherData | null> {
    return new Promise(async (resolve, reject) => {
      try {
        const params = new URLSearchParams({
          latitude: String(latitude),
          longitude: String(longitude),
          current: [
            "temperature_2m",
            "relative_humidity_2m",
            "apparent_temperature",
            "weather_code",
            "wind_speed_10m",
          ].join(","),
          hourly: [
            "temperature_2m",
            "precipitation_probability",
            "precipitation",
            "weather_code",
          ].join(","),
          daily: [
            "weather_code",
            "temperature_2m_max",
            "temperature_2m_min",
            "precipitation_probability_max",
          ].join(","),
          temperature_unit: "fahrenheit",
          wind_speed_unit: "mph",
          timezone: "auto",
          forecast_days: "7",
          forecast_hours: "12"
        });

        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?${params}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch weather");
        }

        const data = await response.json();
        resolve(data as IWeatherData);
      } catch (error) {
        console.error("WeatherClient: Error getting weather data", error);
        reject(error);
      }
    });
  }
}
