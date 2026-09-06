import { useEffect, useState } from "react";
import { LocationClient } from "../clients/locationClient";
import { ILocationData } from "./location.models";
import { WeatherClient } from "../clients/weatherClient";
import { IWeatherData } from "./weather.models";

interface WeatherProps {
  location?: ILocationData;
}

export const Weather = ({ location }: WeatherProps) => {
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState<IWeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        const weatherData = await WeatherClient.getWeather(
          location!.longitude,
          location!.latitude,
        );
        setWeather(weatherData);
        setLoading(false);
      } catch (e: any) {
        console.error("Weather: Error fetching weather data", e);
        setError(e.message);
        setLoading(false);
      }
    };

    if (location) {
      initialize();
    }
  }, [location]);

  return (
    <div className="items-center justify-center flex flex-col h-full">
      {loading && (
        <div
          className="text-4xl p-8 text-blue-600 bold rounded-2xl"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.6)" }}
        >
          Loading weather...
        </div>
      )}
      {error && (
        <div
          className="p-8 text-white bold rounded-2xl"
          style={{ backgroundColor: "rgba(255, 0, 0, 0.6)" }}
        >
          <div className='text-base'>Oops! Something went wrong:</div>
          <div className='text-3xl'>{error}</div>
        </div>
      )}
      {!loading && !error && (
        <div
          className="p-8 text-blue-600 bold rounded-2xl"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.6)" }}
        >
          <div className="text-2xl text-left">
            {location
              ? `${location.address.city}, ${location.address.state}`
              : "Location not available"}
          </div>
          {weather ? (
            <div className="mt-5 text-left text-black">
              <div className="text-6xl">
                {weather.current.temperature_2m}&deg;F
              </div>
              <div className="text-blue-800 bold">
                <div className="mt-2 text-xl">
                  Feels like {weather.current.apparent_temperature}&deg;F
                </div>
                <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-2 text-lg">
                  <div>Humidity: {weather.current.relative_humidity_2m}%</div>
                  <div>Wind: {weather.current.wind_speed_10m} mph</div>
                  <div>Weather code: {weather.current.weather_code}</div>
                  <div>
                    Updated:{" "}
                    {new Date(weather.current.time).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-5 text-2xl">Weather data unavailable</div>
          )}
        </div>
      )}
    </div>
  );
};
