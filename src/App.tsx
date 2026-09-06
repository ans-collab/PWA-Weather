import React, { useRef, useEffect, useState } from "react";
import { Weather } from "./engine/weather";
import { IPexelData } from "./engine/pexel.models";
import { PexelClient } from "./clients/PexelClient";

/// The Weather App.
const App: React.FC = () => {
  const [pexelData, setPexelData] = useState<IPexelData | null>(null);

  // constructor
  useEffect(() => {
    const fetchScenicPhoto = async () => {
      try {
        const response: IPexelData | null =
          await PexelClient.getRandomImage("scenic");
        setPexelData(response);
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
      <Weather />
    </div>
  );
};

export default App;
