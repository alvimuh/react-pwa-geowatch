import React, { useState } from "react";
import logo from "../logo.svg";
import UseInstallPWA from "../InstallPWA";

const polygon = [
  [-6.894587210328337, 106.79362572352287],
  [-6.896479389473766, 106.79351758363802],
  [-6.896593456769374, 106.79437594397379],
  [-6.894580500459754, 106.79419345791815],
];

function inside(point, vs) {
  // ray-casting algorithm based on
  // https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html/pnpoly.html

  const x = point[0],
    y = point[1];

  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0],
      yi = vs[i][1];
    const xj = vs[j][0],
      yj = vs[j][1];
    // prettier-ignore
    const intersect = ((yi > y) !== (yj > y))
          && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }

  return inside;
}

function App() {
  let geoWatch;
  const [data, setData] = useState();
  const [errorLog, setErrorLog] = useState();
  const [isWatching, setIsWatching] = useState(false);
  const setCurrentPosition = (posision) => {
    let prevLS = JSON.parse(localStorage.getItem("log")) || [];
    if (prevLS.length === 0) {
      localStorage.setItem("log", JSON.stringify([]));
    }
    const newData = {
      date: new Date().toJSON(),
      accuracy: posision.coords.accuracy,
      altitude: posision.coords.altitude,
      altitudeAccuracy: posision.coords.altitudeAccuracy,
      heading: posision.coords.heading,
      latitude: posision.coords.latitude,
      longitude: posision.coords.longitude,
      innerPerum: inside(
        [posision.coords.latitude, posision.coords.longitude],
        polygon
      ),
    };
    prevLS.push(newData);
    localStorage.setItem("log", JSON.stringify(prevLS));
    setData(prevLS);
  };
  const positionError = (error) => {
    let prevLS = JSON.parse(localStorage.getItem("error-log")) || [];
    if (prevLS.length === 0) {
      localStorage.setItem("error-log", JSON.stringify([]));
    }
    const newData = {
      date: new Date().toJSON(),
      code: error.code,
      message: error.message,
    };
    prevLS.push(newData);
    localStorage.setItem("error-log", JSON.stringify(prevLS));
    setErrorLog(prevLS);
  };
  const startWatch = () => {
    if (!geoWatch) {
      if (
        "geolocation" in navigator &&
        "watchPosition" in navigator.geolocation
      ) {
        geoWatch = navigator.geolocation.watchPosition(
          setCurrentPosition,
          positionError,
          {
            enableHighAccuracy: false,
            timeout: 15000,
            maximumAge: 0,
          }
        );
      }
    }
  };
  function stopWatch() {
    navigator.geolocation.clearWatch(geoWatch);
    geoWatch = undefined;
  }

  const countInRange = () => {
    const count = data.filter(function (item) {
      return item.innerPerum;
    }).length;
    return count;
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        {/* <button
          onClick={() => {
            if ("geolocation" in navigator) {
              navigator.geolocation.getCurrentPosition(
                setCurrentPosition,
                positionError,
                {
                  enableHighAccuracy: false,
                  timeout: 15000,
                  maximumAge: 0,
                }
              );
            } else {
            }
          }}
        >
          Allow Geo Permission
        </button> */}
        <button
          onClick={() => {
            if (isWatching) {
              stopWatch();
              setIsWatching(false);
            } else {
              startWatch();
              setIsWatching(true);
            }
          }}
        >
          {isWatching ? "Stop" : "Start"} Watching
        </button>
        <button
          onClick={() => {
            localStorage.removeItem("log");
            localStorage.removeItem("error-log");
            setData(null);
            setErrorLog(null);
          }}
        >
          Clear Log
        </button>
        <UseInstallPWA />
        <h3>Data Logging</h3>
        <div className="counter">
          <p>
            <span>{data ? data.length : "0"}</span> Total data
          </p>
          <p>
            <span>{data ? countInRange() : "0"}</span> innerInRange
          </p>
          <p>
            <span>
              {data
                ? new Date(data[data.length - 1].date).toLocaleString()
                : "-"}
            </span>{" "}
            last updated
          </p>
        </div>
        <div className="scroll">
          <table>
            <thead>
              <tr>
                <th>date</th>
                <th>accuracy</th>
                <th>altitude</th>
                <th>altitudeAccuracy</th>
                <th>heading</th>
                <th>latitude</th>
                <th>longitude</th>
                <th>innerRange</th>
              </tr>
            </thead>
            <tbody>
              {data &&
                data
                  .map((item) => (
                    <tr>
                      <td>{new Date(item.date).toLocaleString()}</td>
                      <td>{item.accuracy}</td>
                      <td>{item.altitude}</td>
                      <td>{item.altitudeAccuracy}</td>
                      <td>{item.heading}</td>
                      <td>{item.latitude}</td>
                      <td>{item.longitude}</td>
                      <td>{item.innerPerum.toString()}</td>
                    </tr>
                  ))
                  .reverse()}
            </tbody>
          </table>
        </div>
        <h3>Error log</h3>
        <div className="scroll">
          <table>
            <thead>
              <tr>
                <th>date</th>
                <th>code</th>
                <th>message</th>
              </tr>
            </thead>
            <tbody>
              {errorLog &&
                errorLog
                  .map((item) => (
                    <tr>
                      <td>{new Date(item.date).toLocaleString()}</td>
                      <td>{item.code}</td>
                      <td>{item.message}</td>
                    </tr>
                  ))
                  .reverse()}
            </tbody>
          </table>
        </div>
      </header>
    </div>
  );
}

export default App;
