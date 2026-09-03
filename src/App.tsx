import React, { useRef, useEffect, useState } from "react";
import { Weather } from "./engine/weather";

/// The Weather App.
const App: React.FC = () => {

  // constructor
  useEffect(() => {
    // destructor
    return () => {
      // clean up stuff
    };
  }, []);

  return (
    <div className="app-shell bg-gray-500">
       <Weather />
    </div>
  );
};

export default App;
