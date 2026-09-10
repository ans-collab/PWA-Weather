import { useEffect, useState } from "react";
import { LocationClient } from "../clients/locationClient";
import { ILocationData } from "./location.models";
import { WeatherClient } from "../clients/weatherClient";
import { getWeatherCondition, IWeatherData } from "./weather.models";

interface WeatherProps {
  location?: ILocationData;
  photographer?: string;
  description?: string;
}

const WeatherAnimation = ({ weatherCode }: { weatherCode: number }) => {
  const condition = getWeatherCondition(weatherCode);

  return (
    <div
      className={`weather-animation ${condition.icon}`}
      role="img"
      aria-label={condition.name}
    >
      <span className="weather-animation__sun" />
      <span className="weather-animation__cloud" />
      <span className="weather-animation__precipitation" />
      <span className="weather-animation__lightning" />
      <span className="weather-animation__fog" />
    </div>
  );
};

const formatForecastDate = (date: string) => {
  const forecastDate = new Date(`${date}T12:00:00`);
  const month = String(forecastDate.getMonth() + 1).padStart(2, "0");
  const day = String(forecastDate.getDate()).padStart(2, "0");

  return `${month}/${day}`;
};

export const Weather = ({ location, photographer, description }: WeatherProps) => {
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState<IWeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const textColor = "text-white";
  const panelBackgroundColor = "rgba(79, 102, 186, 0.47)";

  useEffect(() => {
    if (!location) {
      // setLoading(false);
      // setError(
      //   "Location access is unavailable. Enable location access to view local weather.",
      // );
      return;
    }

    setError(null);
    const cacheKey = `weather:${location.latitude.toFixed(2)}:${location.longitude.toFixed(2)}`;
    const cachedWeather = localStorage.getItem(cacheKey);
    let hasCachedWeather = false;

    if (cachedWeather) {
      try {
        setWeather(JSON.parse(cachedWeather) as IWeatherData);
        hasCachedWeather = true;
        setLoading(false);
      } catch {
        localStorage.removeItem(cacheKey);
      }
    }

    const initialize = async () => {
      try {
        const weatherData = await WeatherClient.getWeather(
          location.longitude,
          location.latitude,
        );
        setWeather(weatherData);
        setLoading(false);
        if (weatherData) {
          localStorage.setItem(cacheKey, JSON.stringify(weatherData));
        }
      } catch (e: any) {
        console.error("Weather: Error fetching weather data", e);
        if (!hasCachedWeather) {
          setError(
            navigator.onLine
              ? "Weather is temporarily unavailable."
              : "You're offline and no cached weather is available.",
          );
        }
        setLoading(false);
      }
    };

    initialize();
  }, [location]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-20 flex items-center justify-center">
        <div
          className="p-8 text-white bold rounded-2xl"
          style={{ backgroundColor: panelBackgroundColor }}
        >
          <div
            className="flex items-center justify-center gap-5 rounded-2xl p-8 text-blue-600"
            role="status"
            style={{ backgroundColor: "transparent" }}
          >
            <div
              className={`flex items-center justify-center gap-4 text-2xl text-left ${textColor} text-shadow-lg text-shadow-black font-bold`}
            >
              <div className="relative h-16 w-16 animate-[spin_4s_linear_infinite]">
                {[0, 45, 90, 135, 180, 225, 270, 315].map((rotation) => (
                  <div
                    className="absolute inset-0"
                    key={rotation}
                    style={{ transform: `rotate(${rotation}deg)` }}
                  >
                    <div className="mx-auto h-4 w-2 rounded-full bg-amber-400" />
                  </div>
                ))}
                <div className="absolute inset-0 m-auto h-10 w-10 rounded-full bg-amber-300 shadow-[0_0_0_5px_rgba(251,191,36,0.2)]" />
              </div>
              <span className="text-2xl font-bold">Loading weather...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto">
      <div className="relative flex min-h-0 flex-1 flex-col items-start justify-start p-3 m:p-10">
        {photographer && (
          <div className="absolute right-[15px] top-[20px] rounded bg-black/60 px-2 py-1 text-xs text-white text-right w-[40%]">
            <div className="text-left mb-[5px] text-sm">"{description}"</div>
            <div>Photo by {photographer} from pexels.com</div>
          </div>
        )}

        {error && (
          <div
            className="p-8 text-white bold rounded-2xl"
            style={{ backgroundColor: panelBackgroundColor }}
          >
            <div className="text-base">Weather is not available.</div>
            <div className="text-3xl">{error}</div>
          </div>
        )}

        {!error && (
          <>
            {/* Top panel */}
            <div
              className={`p-6 bold mt-0 rounded-2xl w-[40%] min-w-[350px] z-10`}
              style={{ backgroundColor: panelBackgroundColor }}
            >
              <div
                className={`text-lg text-left ${textColor} text-shadow-lg text-shadow-black`}
              >
                {location
                  ? `${location.address.city}, ${location.address.state}`
                  : "Location not available"}
              </div>
              {weather ? (
                <div className="mt-5 text-start text-white">
                  <div className="text-6xl text-shadow-lg text-shadow-black font-bold">
                    {weather.current.temperature_2m}&deg;F
                  </div>
                  <div
                    className={`bold ${textColor} text-shadow-lg text-shadow-black font-bold`}
                  >
                    <div className="my-4 flex items-center gap-4">
                      <WeatherAnimation
                        weatherCode={weather.current.weather_code}
                      />
                      <span className="text-2xl">
                        {getWeatherCondition(weather.current.weather_code).name}
                      </span>
                    </div>
                    <div className="mt-2 text-xl">
                      Feels like {weather.current.apparent_temperature}&deg;F
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-2 text-lg">
                      <div>
                        Humidity: {weather.current.relative_humidity_2m}%
                      </div>
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

            {/* Today's Forecast panel */}
            {weather && (
              <div
                className={`p-6 bold rounded-2xl mt-2 w-full`}
                style={{ backgroundColor: panelBackgroundColor }}
              >
                <div
                  className={`mb-3 text-lg md:text-xl ${textColor} text-shadow-lg text-shadow-black font-bold`}
                >
                  Hourly Forecast
                </div>
                <div className="flex flex-row gap-2 overflow-x-auto pb-3">
                  {weather.hourly.time.slice(0, 24).map((date, index) => (
                    <div
                      className="flex flex-col shrink-0 items-center gap-1 rounded-xl bg-black/60 p-2 text-left lg:block w-[150px]"
                      key={date}
                    >
                      <div className="flex flex-row justify-beween gap-2">
                        <div className={`font-bold ${textColor}`}>
                          {new Date(date).toLocaleTimeString("en-US", {
                            hour: "numeric",
                          })}
                        </div>
                      </div>
                      <div className="w-full justify-self-center lg:mx-auto">
                        <WeatherAnimation
                          weatherCode={weather.hourly.weather_code[index]}
                        />
                      </div>
                      <div className={`font-bold ${textColor} lg:mt-1`}>
                        {
                          getWeatherCondition(
                            weather.hourly.weather_code[index],
                          ).name
                        }
                      </div>
                      <div className={`font-bold ${textColor} lg:mt-1`}>
                        {weather.hourly.temperature_2m[index]}&deg;F
                      </div>
                      <div className={`font-bold ${textColor} lg:mt-1`}>
                        Rain {weather.hourly.precipitation_probability[index]}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7 Day Forecast panel */}
            {weather && (
              <div
                className={`p-6 bold rounded-2xl mt-2 w-full`}
                style={{ backgroundColor: panelBackgroundColor }}
              >
                <div
                  className={`mb-3 text-lg md:text-xl ${textColor} text-shadow-lg text-shadow-black font-bold`}
                >
                  7 Day Forecast
                </div>
                <div className="flex flex-row gap-2 overflow-x-auto pb-3">
                  {weather.daily.time.slice(0, 7).map((date, index) => (
                    <div
                      className="flex flex-col shrink-0 items-center gap-1 rounded-xl bg-black/60 p-2 text-left lg:block w-[150px]"
                      key={date}
                    >
                      <div className="flex flex-row justify-beween gap-2">
                        <div className={`font-bold ${textColor}`}>
                          {new Date(`${date}T12:00:00`).toLocaleDateString(
                            undefined,
                            { weekday: "short" },
                          )}
                        </div>
                        <div className={`text-xs ${textColor}`}>
                          {formatForecastDate(date)}
                        </div>
                      </div>
                      <div className="w-full justify-self-center lg:mx-auto">
                        <WeatherAnimation
                          weatherCode={weather.daily.weather_code[index]}
                        />
                      </div>
                      <div className={`font-bold ${textColor} lg:mt-1`}>
                        {
                          getWeatherCondition(weather.daily.weather_code[index])
                            .name
                        }
                      </div>
                      <div className={`font-bold ${textColor} lg:mt-1`}>
                        {weather.daily.temperature_2m_max[index]}&deg; /{" "}
                        {weather.daily.temperature_2m_min[index]}&deg;F
                      </div>
                      <div className={`font-bold ${textColor} lg:mt-1`}>
                        Rain{" "}
                        {weather.daily.precipitation_probability_max[index]}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex w-full shrink-0 flex-row justify-between text-md">
        <div className="rounded bg-black/60 px-2 py-1 text-xs text-white m-1">
          {__APP_VERSION__}
        </div>
        <div className="rounded bg-black/60 px-2 py-1 text-xs text-white m-1">
          Weather provided by Open-Meteo
        </div>
      </div>
    </div>
  );
};
