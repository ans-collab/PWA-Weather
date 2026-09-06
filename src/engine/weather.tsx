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
  const textColor = "text-white";

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
    <div className="items-left justify-center flex flex-col h-full p-10">
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
          <div className="text-base">Oops! Something went wrong:</div>
          <div className="text-3xl">{error}</div>
        </div>
      )}
      {!loading && !error && (
        <>
          <div
            className={`p-8 bold rounded-2xl w-[40%]`}
            style={{ backgroundColor: "rgba(34, 69, 172, 0.71)" }}
          >
            <div
              className={`text-2xl text-left ${textColor} text-shadow-lg text-shadow-black font-bold`}
            >
              {location
                ? `${location.address.city}, ${location.address.state}`
                : "Location not available"}
            </div>
            {weather ? (
              <div className="mt-5 text-left text-white">
                <div className="text-6xl text-shadow-lg text-shadow-black font-bold">
                  {weather.current.temperature_2m}&deg;F
                </div>
                <div
                  className={`bold ${textColor} text-shadow-lg text-shadow-black font-bold`}
                >
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
          {weather && (
            <div
              className={`p-8 bold rounded-2xl mt-2`}
              style={{ backgroundColor: "rgba(34, 69, 172, 0.71)" }}
            >
              <div
                className={`mb-3 text-xl ${textColor} text-shadow-lg text-shadow-black font-bold`}
              >
                This Week's Forecast
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
                {weather.daily.time.slice(0, 7).map((date, index) => (
                  <div
                    className="rounded-xl bg-black/60 p-3 text-center"
                    key={date}
                  >
                    <div className={`font-bold ${textColor}`}>
                      {new Date(`${date}T12:00:00`).toLocaleDateString(
                        undefined,
                        { weekday: "short" },
                      )}
                    </div>
                    <div className={`text-sm ${textColor}`}>{date}</div>
                    <div className={`mt-1 font-bold ${textColor}`}>
                      {weather.daily.temperature_2m_max[index]}&deg; /{" "}
                      {weather.daily.temperature_2m_min[index]}&deg;F
                    </div>
                    <div className={`mt-1 font-bold ${textColor}`}>
                      Rain {weather.daily.precipitation_probability_max[index]}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
