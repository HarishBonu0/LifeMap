import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './i18n';
import { Layout } from './components/Layout';
import { LandingPage } from './features/landing/LandingPage';
import { AssessmentPage } from './features/assessment/AssessmentPage';
import { CalculatorPage } from './features/calculator/CalculatorPage';
import { CoveragePage } from './features/coverage/CoveragePage';
import { SimulatorPage } from './features/simulator/SimulatorPage';
import { GamesPage } from './features/games/GamesPage';
import { DashboardPage } from './features/dashboard/DashboardPage';

export default function App() {
  return (
    <LanguageProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<LandingPage />} />
          <Route path="assessment" element={<AssessmentPage />} />
          <Route path="calculator" element={<CalculatorPage />} />
          <Route path="coverage" element={<CoveragePage />} />
          <Route path="simulator" element={<SimulatorPage />} />
          <Route path="games" element={<GamesPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </LanguageProvider>
  );
}
