import React, { useRef, useEffect, useState } from "react";
import { Weather } from "./engine/weather";
import { IPexelData } from "./engine/pexel.models";
import { PexelClient } from "./clients/PexelClient";
import { LocationClient } from "./clients/locationClient";
import { ILocationData } from "./engine/location.models";

/// The Weather App.
const App: React.FC = () => {
  const [location, setLocation] = useState<ILocationData | undefined>();
  const [pexelData, setPexelData] = useState<IPexelData | null>(null);

  // constructor
  useEffect(() => {
    const fetchScenicPhoto = async () => {
      try {
        let geoLocation: ILocationData | undefined;

        // load location data.
        const currentLocation = await LocationClient.getCurrentLocation();
        if (currentLocation) {
          geoLocation = await LocationClient.getGeoLocation(
            currentLocation.coords.longitude.toString(),
            currentLocation.coords.latitude.toString(),
          );

          geoLocation.longitude = currentLocation.coords.longitude;
          geoLocation.latitude = currentLocation.coords.latitude;
          setLocation(geoLocation);
        }

        // load scenic photo.
        const photoResponse: IPexelData | null =
          await PexelClient.getRandomImage(
            geoLocation
              ? `${geoLocation.address.city}, ${geoLocation.address.state} scenic attraction`
              : "weather",
          );
        setPexelData(photoResponse);
      } catch (e) {
        console.error("App: createScene threw", e);
        return;
      }
    };
    fetchScenicPhoto();

    // destructor
    return () => {
      // clean up stuff
    };
  }, []);

  return (
    <div
      className="app-shell bg-gray-500"
      style={{
        backgroundImage: `url(${pexelData?.photos[0]?.src.portrait})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Weather location={location} />
    </div>
  );
};

export default App;
