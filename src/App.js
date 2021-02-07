import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import UseInstallPWA from "./InstallPWA";
import WeatherPage from "./pages/weather";
import GPSPage from "./pages/gps";
import { Switch, Route, BrowserRouter as Router, Link } from "react-router-dom";

function App() {
  return (
    <Router>
      <nav className="primary-nav">
        <ul>
          <li>
            <Link to="/weather">Weather</Link>
          </li>
          <li>
            <Link to="/gps">GPS</Link>
          </li>
        </ul>
      </nav>
      <Switch>
        <Route path="/weather" component={WeatherPage} />
        <Route path="/gps" component={GPSPage} />
        <Route path="/">Home</Route>
      </Switch>
    </Router>
  );
}

export default App;
