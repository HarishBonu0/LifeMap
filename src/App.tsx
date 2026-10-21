import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './i18n';
import { AuthProvider } from './contexts/AuthContext';
import { PublicLayout } from './components/PublicLayout';
import { PrivateLayout } from './components/PrivateLayout';

// Public Pages
import { LandingPage } from './features/landing/LandingPage';
import { PublicSchemesPage } from './features/schemes/PublicSchemesPage';
import { SignInPage } from './features/auth/SignInPage';
import { SignUpPage } from './features/auth/SignUpPage';

// Authenticated Application Pages (The 5 Primary Destinations + Profile/Settings)
import { DashboardPage } from './features/dashboard/DashboardPage';
import { SchemesPage } from './features/schemes/SchemesPage';
import { MyPlanPage } from './features/plan/MyPlanPage';
import { FinancialLearningPage } from './features/learning/FinancialLearningPage';
import { ChatPage } from './features/chat/ChatPage';
import { ProfilePage } from './features/profile/ProfilePage';
import { SettingsPage } from './features/settings/SettingsPage';

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Routes>
          {/* ========================================================= */}
          {/* 1. PUBLIC WEBSITE & AUTHENTICATION (Before Login)         */}
          {/* ========================================================= */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/plans" element={<PublicSchemesPage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />
          </Route>

          {/* ========================================================= */}
          {/* 2. PRIVATE APPLICATION (After Login with Left Sidebar)     */}
          {/* ========================================================= */}
          <Route element={<PrivateLayout />}>
            {/* 1. Overview */}
            <Route path="/overview" element={<DashboardPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* 2. Insurance Schemes */}
            <Route path="/schemes" element={<SchemesPage />} />

            {/* 3. My Plan (Protection Summary, Goals, 10-Yr, 20-Yr, Scenarios) */}
            <Route path="/plan" element={<MyPlanPage />} />

            {/* 4. Financial Learning (Mindset Assessment & Learning Games) */}
            <Route path="/learning" element={<FinancialLearningPage />} />

            {/* 5. AI Assistant */}
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/assistant" element={<Navigate to="/chat" replace />} />

            {/* User Account Controls (Top-Right Menu) */}
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />

            {/* Legacy route redirects for backward compatibility */}
            <Route path="/mindset" element={<Navigate to="/learning" replace />} />
            <Route path="/games" element={<Navigate to="/learning?tab=games" replace />} />
            <Route path="/coverage" element={<Navigate to="/plan" replace />} />
            <Route path="/simulator" element={<Navigate to="/plan?tab=scenarios" replace />} />
            <Route path="/assessment" element={<Navigate to="/plan" replace />} />
            <Route path="/calculator" element={<Navigate to="/plan" replace />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </LanguageProvider>
    </AuthProvider>
  );
}
