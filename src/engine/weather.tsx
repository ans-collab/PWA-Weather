import { useEffect, useState } from "react";
import { LocationClient } from "../clients/locationClient";
import { ILocationData } from "./location.models";
import { WeatherClient } from "../clients/weatherClient";
import { getWeatherCondition, IWeatherData } from "./weather.models";
import { MapPinPen } from "lucide-react";

interface WeatherProps {
  location?: ILocationData;
  photographer?: string;
  description?: string;
  changeLocation?: () => void;
}

const isNightTime = (timestamp: string) => {
  const hour = Number(timestamp.slice(11, 13));
  return hour < 6 || hour >= 18;
};

const WeatherAnimation = ({
  weatherCode,
  isNight = false,
}: {
  weatherCode: number;
  isNight?: boolean;
}) => {
  const condition = getWeatherCondition(weatherCode, isNight);

  return (
    <div
      className={`w-full weather-animation ${condition.icon}`}
      role="img"
      aria-label={condition.name}
      style={{ borderRadius: 8, opacity: 0.88 }}
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

export const Weather = ({
  location,
  photographer,
  description,
  changeLocation,
}: WeatherProps) => {
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState<IWeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isChangeLocationDialogOpen, setIsChangeLocationDialogOpen] =
    useState(false);
  const textColor = "text-white";
  const locationBackgroundColor = "rgba(4, 4, 5, 0.47)";
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
      {isChangeLocationDialogOpen && (
        <div
          aria-labelledby="change-location-title"
          aria-modal="true"
          className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 p-4"
          role="dialog"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-slate-900 shadow-2xl">
            <h2 className="text-xl font-bold" id="change-location-title">
              Change location?
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Choose a new city and state to update your forecast.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                onClick={() => setIsChangeLocationDialogOpen(false)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
                onClick={() => {
                  setIsChangeLocationDialogOpen(false);
                  changeLocation?.();
                }}
                type="button"
              >
                Change location
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="relative flex min-h-0 flex-1 flex-col items-start justify-start p-3 m:p-10">
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
            <div className="grid h-[60vh] w-full mb-2">
              {photographer && (
                <div className="sticky top-2 z-10 col-start-1 row-start-1 ml-auto h-fit w-[60%] self-start rounded bg-black/60 p-3 text-right text-xs text-white">
                  <div className="mb-[5px] text-left text-sm">
                    "{description}"
                  </div>
                  <div>By {photographer}</div>
                  <div>pexels.com</div>
                </div>
              )}

              {/* Location display */}
              {/* <div
                className={`col-start-1 row-start-1 flex h-full w-full flex-row items-center justify-center text-center text-xl ${textColor}`}
              >
                {location
                  ? `${location.address.city}, ${location.address.state}`
                  : "Location not available"}
                <button
                  aria-label="Change location"
                  className="cursor-pointer"
                  onClick={() => {
                    setIsChangeLocationDialogOpen(true);
                  }}
                  title="Change location"
                  type="button"
                >
                  <MapPinPen />
                </button>
              </div> */}
            </div>
            {/* Top panel */}
            <div
              className={`z-10 min-w-[350px] rounded-2xl p-6 font-bold`}
              style={{ backgroundColor: panelBackgroundColor }}
            >
              <div
                className={`flex flex-row gap-3 text-xl text-left ${textColor} text-shadow-lg text-shadow-black`}
              >
                {location
                  ? `${location.address.city}, ${location.address.state}`
                  : "Location not available"}
                <button
                  aria-label="Change location"
                  className="cursor-pointer"
                  onClick={() => {
                    setIsChangeLocationDialogOpen(true);
                  }}
                  title="Change location"
                  type="button"
                >
                  <MapPinPen />
                </button>
              </div>
              {weather ? (
                <div className="mt-5 text-start text-white">
                  <div className="flex flex-row gap-3 items-center">
                    <div className="text-6xl text-shadow-lg text-shadow-black font-bold">
                      {weather.current.temperature_2m}&deg;F
                    </div>
                    <div className="text-lg text-shadow-lg text-shadow-black">
                      Feels like {weather.current.apparent_temperature}&deg;F
                    </div>
                  </div>
                  <div
                    className={`bold ${textColor} text-shadow-lg text-shadow-black font-bold`}
                  >
                    <div className="my-4 flex items-center justify-between gap-5">
                      <WeatherAnimation
                        weatherCode={weather.current.weather_code}
                        isNight={isNightTime(weather.current.time)}
                      />
                      <span className="text-2xl">
                        {
                          getWeatherCondition(
                            weather.current.weather_code,
                            isNightTime(weather.current.time),
                          ).name
                        }
                      </span>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-2 text-lg">
                      <div>
                        Humidity: {weather.current.relative_humidity_2m}%
                      </div>
                      <div></div>
                      <div>Wind: {weather.current.wind_speed_10m} mph</div>
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
                          isNight={isNightTime(date)}
                        />
                      </div>
                      <div className={`font-bold ${textColor} lg:mt-1`}>
                        {
                          getWeatherCondition(
                            weather.hourly.weather_code[index],
                            isNightTime(date),
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
