import React, { useEffect, useState } from "react";
import { Weather } from "./engine/weather";
import { IPexelData } from "./engine/pexel.models";
import { PexelClient } from "./clients/PexelClient";
import { LocationClient } from "./clients/locationClient";
import { ILocationData } from "./engine/location.models";

/// The Weather App.
const App: React.FC = () => {
  const [location, setLocation] = useState<ILocationData | undefined>();
  const [selectedPhoto, setSelectedPhoto] = useState<
    IPexelData["photos"][number] | null
  >(null);
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [shareMessage, setShareMessage] = useState<string | null>(null);

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
              ? `${geoLocation.address.city}, ${geoLocation.address.state} scenic landscape`
              : "weather",
          );
        if (photoResponse?.photos.length) {
          const randomIndex = Math.floor(
            Math.random() * photoResponse.photos.length,
          );
          setSelectedPhoto(photoResponse.photos[randomIndex]);
        }
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

  const shareApp = async () => {
    const shareData = {
      title: "My Forecast",
      text: "Check your local weather with My Forecast.",
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      await navigator.clipboard.writeText(shareData.url);
      setShareMessage("Link copied");
    } catch (error) {
      if ((error as DOMException).name !== "AbortError") {
        setShareMessage("Unable to share");
      }
    }
  };

  return (
    <div
      className="app-shell relative bg-gray-500"
      style={{
        backgroundImage: selectedPhoto
          ? `url(${selectedPhoto.src.portrait})`
          : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <header className="flex h-12 shrink-0 items-center justify-between bg-black/70 px-4 text-white">
        <h1 className="font-bold">My Forecast</h1>
        <div className="flex items-center gap-2">
          <button
            className="rounded bg-white/90 px-3 py-1 text-sm font-semibold text-black hover:bg-white"
            onClick={shareApp}
            type="button"
          >
            Share
          </button>
          {installPrompt && (
            <button
              className="rounded bg-white/90 px-3 py-1 text-sm font-semibold text-black hover:bg-white"
              onClick={installApp}
              type="button"
            >
              Install app
            </button>
          )}
        </div>
      </header>
      {shareMessage && (
        <div className="absolute right-4 top-14 z-10 rounded bg-black/75 px-3 py-2 text-sm text-white">
          {shareMessage}
        </div>
      )}
      <Weather
        location={location}
        photographer={selectedPhoto?.photographer}
      />
    </div>
  );
};

export default App;
