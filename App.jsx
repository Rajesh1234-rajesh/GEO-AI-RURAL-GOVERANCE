import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ToastProvider } from './components/Toast';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import CitizenLayout from './layouts/CitizenLayout';
import GovernmentLayout from './layouts/GovernmentLayout';

// Guard
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import Features from './pages/Features';
import HowItWorks from './pages/HowItWorks';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';

// Citizen Pages
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import SubmitComplaint from './pages/citizen/SubmitComplaint';
import MyComplaints from './pages/citizen/MyComplaints';
import SchemeMonitoring from './pages/citizen/SchemeMonitoring';

// Government Pages
import GovernmentDashboard from './pages/government/GovernmentDashboard';
import ViewComplaints from './pages/government/ViewComplaints';
import VillageMap from './pages/government/VillageMap';
import AIInsights from './pages/government/AIInsights';
import GovernmentTeams from './pages/government/GovernmentTeams';
import Analytics from './pages/government/Analytics';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <ToastProvider>
            <Routes>
              
              {/* ===================== PUBLIC ROUTES ===================== */}
              <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
              <Route path="/features" element={<PublicLayout><Features /></PublicLayout>} />
              <Route path="/how-it-works" element={<PublicLayout><HowItWorks /></PublicLayout>} />
              <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
              <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
              <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />

              {/* ===================== CITIZEN ROUTES ===================== */}
              <Route
                path="/citizen"
                element={
                  <ProtectedRoute allowedRoles={['citizen']}>
                    <CitizenLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/citizen/dashboard" replace />} />
                <Route path="dashboard" element={<CitizenDashboard />} />
                <Route path="submit" element={<SubmitComplaint />} />
                <Route path="complaints" element={<MyComplaints />} />
                <Route path="schemes" element={<SchemeMonitoring />} />
              </Route>

              {/* ===================== GOVERNMENT ROUTES ===================== */}
              <Route
                path="/government"
                element={
                  <ProtectedRoute allowedRoles={['government']}>
                    <GovernmentLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/government/dashboard" replace />} />
                <Route path="dashboard" element={<GovernmentDashboard />} />
                <Route path="complaints" element={<ViewComplaints />} />
                <Route path="map" element={<VillageMap />} />
                <Route path="ai-insights" element={<AIInsights />} />
                <Route path="teams" element={<GovernmentTeams />} />
                <Route path="analytics" element={<Analytics />} />
              </Route>

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>
          </ToastProvider>
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
