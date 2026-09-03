import { useEffect, useState } from "react";

export const Weather = () => {
  const [loading, setLoading] = useState(true);

  // constructor
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // load weather data.
       
      } catch (e) {
        console.error("App: createScene threw", e);
        return;
      }
    };
    fetchWeather();

    // destructor
    return () => {
      // clean up stuff
    };
  }, []);

  return (
    <div className="items-center justify-center flex flex-col h-full">
      {loading && <div className="text-3xl p-8 text-white">Loading weather data...</div>}
      {!loading && (
        <div className="weather-info">
          <h2>Weather Information</h2>
          <p>Temperature: 25°C</p>
          <p>Humidity: 60%</p>
          <p>Wind Speed: 10 km/h</p>
        </div>
      )}
    </div>
  );
};
