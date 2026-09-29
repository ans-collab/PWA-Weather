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
const ForecastApp: React.FC = () => {
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
      window.removeEventListener("sw-update-available", handleUpdateAvailable);
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
            city: "",
            state: "",
            country: "",
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
        <h1 className="font-bold">
          Forecast{" "}
          <span className="text-xs text-gray-400">{__APP_VERSION__}</span>
        </h1>
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
          <a
            className="text-sm text-white/80 underline-offset-2 hover:text-white hover:underline"
            href="/privacy"
          >
            Privacy
          </a>
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
            <div className="flex w-full flex-col items-stretch gap-4 sm:flex-row sm:items-center">
              <input
                type="text"
                placeholder="City"
                className="min-w-0 rounded border border-gray-500 px-3 py-2 text-base w-full sm:flex-1"
                onChange={(e) => updateCityInput(e.target.value)}
              />
              <input
                type="text"
                placeholder="State"
                className="min-w-0 rounded border border-gray-500 px-3 py-2 text-base w-full sm:flex-1"
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

const PrivacyPolicy: React.FC = () => (
  <main className="min-h-screen bg-whitesmoke px-6 py-10 text-gray-900 sm:px-10">
    <article className="mx-auto max-w-3xl rounded bg-white p-6 shadow-sm sm:p-10">
      <a className="text-sm text-gray-600 underline hover:text-gray-900" href="/">
        Back to Forecast
      </a>
      <h1 className="mt-6 text-3xl font-bold">Privacy Policy</h1>
      <p className="mt-2 text-sm text-gray-600">Last updated: September 28, 2026</p>

      <section className="mt-8 space-y-4 leading-7">
        <h2 className="text-xl font-semibold">Location data</h2>
        <p>
          Forecast may request access to your device&apos;s location to obtain
          weather information for your area. Location data is used only to make
          the weather and location lookups you request.
        </p>
        <p>
          Forecast does not store your precise location information after the
          request. You can use the app without granting location permission by
          entering a city and state manually.
        </p>

        <h2 className="pt-4 text-xl font-semibold">Weather data</h2>
        <p>
          Forecast uses Open-Meteo to retrieve weather data based on your
          location. Weather requests may include latitude, longitude, and
          forecast preferences. Open-Meteo processes those requests according
          to its own privacy policy.
        </p>

        <h2 className="pt-4 text-xl font-semibold">Photos</h2>
        <p>
          Forecast uses the Pexels API to retrieve scenic photos. Photo search
          requests may include a city or state query, and images are loaded
          from Pexels. Pexels processes requests according to its own privacy
          policy.
        </p>

        <h2 className="pt-4 text-xl font-semibold">Analytics</h2>
        <p>
          Cloudflare Web Analytics may collect analytics information about
          visits to the app, such as page views and basic device or browser
          information. This helps us understand usage and improve the app.
          Cloudflare processes this information according to its privacy
          policy.
        </p>

        <h2 className="pt-4 text-xl font-semibold">Cookies and local storage</h2>
        <p>
          Forecast does not set cookies directly. The app stores weather
          responses in your browser&apos;s local storage to make subsequent views
          faster and support limited offline use. The service worker may also
          store app files, weather responses, and images in the browser&apos;s
          Cache Storage. You can remove this data through your browser settings.
        </p>

        <h2 className="pt-4 text-xl font-semibold">Sale and sharing</h2>
        <p>
          Forecast does not sell personal information. We do not share location
          information for advertising, profiling, or unrelated purposes.
          Information may be sent to Open-Meteo, Pexels, geocoding providers,
          and Cloudflare as necessary to provide and operate the app; those
          providers handle information under their own privacy policies.
        </p>

        <h2 className="pt-4 text-xl font-semibold">Contact</h2>
        <p>
          If you have questions about this policy or the app&apos;s privacy
          practices, please contact the app owner through the{" "}
          <a
            className="underline hover:text-gray-600"
            href="https://github.com/ans-collab/PWA-Weather"
            rel="noreferrer"
            target="_blank"
          >
            project repository
          </a>
          .
        </p>
      </section>
    </article>
  </main>
);

const App: React.FC = () =>
  window.location.pathname === "/privacy" ? <PrivacyPolicy /> : <ForecastApp />;

export default App;
