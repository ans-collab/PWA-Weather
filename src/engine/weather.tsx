import { useEffect, useState } from "react";
import { IPexelData } from "./pexel.models";
import { LocationClient } from "../clients/locationClient";
import { ILocationData } from "./location.models";
import { WeatherClient } from "../clients/weatherClient";
import { IWeatherData } from "./weather.models";

export const Weather = () => {
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<string | undefined>();
  const [weather, setWeather] = useState<IWeatherData | null>(null);

  // constructor
  useEffect(() => {
    const initialize = async () => {
      try {
        // load location data.
        const currentLocation = await LocationClient.getCurrentLocation();
        if (currentLocation) {
          const geoLocation: ILocationData =
            await LocationClient.getGeoLocation(
              currentLocation.coords.longitude.toString(),
              currentLocation.coords.latitude.toString(),
            );
          setLocation(
            geoLocation
              ? `${geoLocation.address.city}, ${geoLocation.address.state}`
              : undefined,
          );

          // load weather data.
          const weatherData = await WeatherClient.getWeather(
            currentLocation.coords.longitude,
            currentLocation.coords.latitude,
          );
          setWeather(weatherData);

          setLoading(false);
        } else {
          console.error("Weather: Unable to get current location.");
          setLoading(false);
        }
      } catch (e) {
        setLoading(false);
        console.error("App: createScene threw", e);
        return;
      }
    };

    if (loading) {
      initialize();
    }

    // destructor
    return () => {
      // clean up stuff
    };
  }, []);

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
      {!loading && (
        <div
          className="p-8 text-blue-600 bold rounded-2xl"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.6)" }}
        >
          <div className="text-2xl text-left">
            {location ? location : "Location not available"}
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
