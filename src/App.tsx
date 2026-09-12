import React, { useEffect, useState } from "react";
import { Weather } from "./engine/weather";
import { IPexelData } from "./engine/pexel.models";
import { PexelClient } from "./clients/PexelClient";
import { LocationClient } from "./clients/locationClient";
import { ILocationData } from "./engine/location.models";

enum LocationPermissionState {
  None,
  NoPermission,
  PermissionGranted,
  LocatedProvided,
}

/// The Weather App.
const App: React.FC = () => {
  const [location, setLocation] = useState<ILocationData | undefined>();
  const [locationPermission, setLocationPermission] =
    useState<LocationPermissionState>(LocationPermissionState.None);
  const [locationCity, setLocationCity] = useState<string | null>(null);
  const [locationState, setLocationState] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<
    IPexelData["photos"][number] | null
  >(null);
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);

  useEffect(() => {
    const handleUpdateAvailable = () => setIsUpdateAvailable(true);
    window.addEventListener("sw-update-available", handleUpdateAvailable);

    return () => {
      window.removeEventListener(
        "sw-update-available",
        handleUpdateAvailable,
      );
    };
  }, []);

  // constructor
  useEffect(() => {
    LocationClient.isGeolocationEnabled().then((enabled) => {
      setLocationPermission(
        enabled
          ? LocationPermissionState.PermissionGranted
          : LocationPermissionState.NoPermission,
      );
    });
  }, []);

  // initialize when location permission is determined.
  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    const handleAppInstalled = () => setInstallPrompt(null);

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    if (locationPermission === LocationPermissionState.PermissionGranted) {
      loadScenicPhoto();
    }

    // destructor
    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [locationPermission]);

  // load scenic background phoyo
  const loadScenicPhoto = async (locationData?: ILocationData) => {
    try {
      let geoLocation: ILocationData | undefined;

      // load location data.
      if (!locationData) {
        const currentLocation = await LocationClient.getCurrentLocation();
        if (currentLocation) {
          geoLocation = await LocationClient.getGeoLocation(
            currentLocation.coords.longitude.toString(),
            currentLocation.coords.latitude.toString(),
          );
          setLocation(geoLocation);
        }
      } else {
        geoLocation = {
          address: {
            city: '',
            state: '',
            country: ''
          },
          longitude: locationData.longitude,
          latitude: locationData.latitude,
        };
      }

      const _city = locationData
        ? locationData.address.city
        : geoLocation?.address.city;
      const _state = locationData
        ? locationData.address.state
        : geoLocation?.address.state;

      // load scenic photo.
      const photoResponse: IPexelData | null = await PexelClient.getRandomImage(
        geoLocation
          ? `${_city}, ${_state} majestic scenic landscape`
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

  const isReadyToLoadWeather = (): boolean => {
    if (locationPermission === LocationPermissionState.None) {
      return false;
    }
    return (
      locationPermission === LocationPermissionState.PermissionGranted ||
      locationPermission === LocationPermissionState.LocatedProvided
    );
  };

  const installApp = async () => {
    if (!installPrompt) return;

    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  const shareApp = async () => {
    const shareData = {
      title: "Forecast",
      text: "Get your forecast, plus a few extra neat facts about the area.",
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

  const changeLocation = () => {
    setLocation(undefined);
    setSelectedPhoto(null);
    setLocationCity(null);
    setLocationState(null);
    setLocationPermission(LocationPermissionState.NoPermission);
  };

  const locationChnageObject: {
    City?: string;
    State?: string;
  } = {};

  const timeoutId = React.useRef<any | null>(null);

  const updateCityInput = (value: string) => {
    locationChnageObject.City = value;
    triggerChangeDetection();
  };

  const updateStateInput = (value: string) => {
    locationChnageObject.State = value;
    triggerChangeDetection();
  };

  const triggerChangeDetection = () => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }
    if (locationChnageObject.City && locationChnageObject.State) {
      timeoutId.current = setTimeout(async () => {
        const _location = await LocationClient.getGeoLocationByCityAndState(
          locationChnageObject.City + "",
          locationChnageObject.State + "",
        );
        if (_location && _location.latitude && _location.latitude) {
          loadScenicPhoto(_location);
          setLocation(_location);
          setLocationPermission(LocationPermissionState.LocatedProvided);
        }
      }, 1500);
    }
  };

  return (
    <div
      className="app-shell relative"
      style={{
        backgroundImage: selectedPhoto
          ? `url(${selectedPhoto.src.portrait})`
          : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <header className="flex h-12 shrink-0 items-center justify-between bg-black/70 px-4 text-white">
        <h1 className="font-bold">Forecast <span className="text-xs text-gray-400">{__APP_VERSION__}</span></h1>
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
          {isUpdateAvailable && (
            <button
              className="rounded bg-amber-300 px-3 py-1 text-sm font-semibold text-black hover:bg-amber-200"
              onClick={() => window.__updateServiceWorker?.(true)}
              type="button"
            >
              Update
            </button>
          )}
        </div>
      </header>
      {shareMessage && (
        <div className="absolute right-4 top-14 z-10 rounded bg-black/75 px-3 py-2 text-sm text-white">
          {shareMessage}
        </div>
      )}

      {isReadyToLoadWeather() ? (
        <Weather
          changeLocation={changeLocation}
          location={location}
          photographer={selectedPhoto?.photographer}
          description={selectedPhoto?.alt}
        />
      ) : (
        <div className="flex flex-col h-full items-center justify-between text-black bg-whitesmoke ">
          <div>
            <p className="text-center text-lg font-semibold p-10 text-gray-500">
              Provide a location:
            </p>
            <div className="flex flex-col items-center gap-4">
              <input
                type="text"
                placeholder="City"
                className="rounded border border-gray-500 px-3 py-2 text-base w-full"
                onChange={(e) => updateCityInput(e.target.value)}
              />
              <input
                type="text"
                placeholder="State / Province / Country"
                className="rounded border border-gray-500 px-3 py-2 text-base w-full"
                onChange={(e) => updateStateInput(e.target.value)}
              />
            </div>
          </div>
          <p className="text-center text-sm p-10 text-gray-500">
            You can skip this step if you enable location permission. Note: On
            mobile devices, you may have to enable location services on your
            browser as well as your system settings.
          </p>
        </div>
      )}
    </div>
  );
};

export default App;
