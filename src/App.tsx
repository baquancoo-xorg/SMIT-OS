/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import AppLayout from './components/layout/AppLayout';
import PMDashboard from './pages/PMDashboard';
import OKRsManagement from './pages/OKRsManagement';
import TechScrumBoard from './pages/TechScrumBoard';
import MarketingKanban from './pages/MarketingKanban';
import MediaKanban from './pages/MediaKanban';
import SaleKanban from './pages/SaleKanban';
import SaturdaySync from './pages/SaturdaySync';

export type ViewType = 'dashboard' | 'okrs' | 'tech' | 'mkt' | 'media' | 'sale' | 'sync';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');

  return (
    <AppLayout currentView={currentView} onViewChange={setCurrentView}>
      {currentView === 'dashboard' && <PMDashboard />}
      {currentView === 'okrs' && <OKRsManagement />}
      {currentView === 'tech' && <TechScrumBoard />}
      {currentView === 'mkt' && <MarketingKanban />}
      {currentView === 'media' && <MediaKanban />}
      {currentView === 'sale' && <SaleKanban />}
      {currentView === 'sync' && <SaturdaySync />}
    </AppLayout>
  );
}
