import React, { useEffect, useState } from "react";
import { Weather } from "./engine/weather";
import { IPexelData } from "./engine/pexel.models";
import { PexelClient } from "./clients/PexelClient";
import { LocationClient } from "./clients/locationClient";
import { ILocationData } from "./engine/location.models";

/// The Weather App.
const App: React.FC = () => {
  const [location, setLocation] = useState<ILocationData | undefined>();
  const [pexelData, setPexelData] = useState<IPexelData | null>(null);
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  // constructor
  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    const handleAppInstalled = () => setInstallPrompt(null);

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

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
              ? `${geoLocation.address.city}, ${geoLocation.address.state} scenic urban landscape park`
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
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (!installPrompt) return;

    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  return (
    <div
      className="app-shell relative bg-gray-500"
      style={{
        backgroundImage: `url(${pexelData?.photos[0]?.src.portrait})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <header className="flex h-12 shrink-0 items-center justify-between bg-black/70 px-4 text-white">
        <h1 className="font-bold">Simply Weather</h1>
        {installPrompt && (
          <button
            className="rounded bg-white/90 px-3 py-1 text-sm font-semibold text-black hover:bg-white"
            onClick={installApp}
            type="button"
          >
            Install app
          </button>
        )}
      </header>
      <Weather
        location={location}
        photographer={pexelData?.photos[0]?.photographer}
      />
    </div>
  );
};

export default App;
