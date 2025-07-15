import React from "react";
import Wall from "./components/Wall";
import Signup from "./pages/SignupPage";
import Login from "./pages/LoginPage";
import Homepage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import "./App.css";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/wall" element={<Wall />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;