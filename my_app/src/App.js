import React from "react";
import Wall from "./components/Wall";
import Signup from "./pages/SignupPage";
import Login from "./pages/LoginPage";
import Homepage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import MyAltarsPage from "./pages/MyAltarsPage";
import SettingsPage from "./pages/SettingsPage";
import AdminDashboard from "./pages/AdminDashboard";
import WallViewPage from "./pages/WallViewPage";
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import BillingHistoryPage from './pages/BillingHistoryPage';
import FeatureManagement from './pages/FeatureManagement';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PremiumPage from "./components/PremiumPage";
import { FeaturesProvider } from "./hooks/useFeatures";

import "./App.css";

function App() {
  return (
    <div className="App">
      <FeaturesProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/wall" element={<Wall />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/myaltars" element={<MyAltarsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
                      <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/features" element={<FeatureManagement />} />
          <Route path="/wall/view/:id" element={<WallViewPage />} />
          <Route path="/wall/public/:id" element={<WallViewPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/billing-history" element={<BillingHistoryPage />} />
          <Route path="/premium" element={<PremiumPage />} />
          </Routes>
        </BrowserRouter>
      </FeaturesProvider>
    </div>
  );
}

export default App;