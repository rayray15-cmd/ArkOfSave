import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { Button } from './components/ui/Button';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';
import { DebtsPage } from './pages/DebtsPage';
import { CalendarPage } from './pages/CalendarPage';
import { RecurringPage } from './pages/RecurringPage';
import { IncomePage } from './pages/IncomePage';
import { LoginPage } from './pages/LoginPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/*" element={
          <ProtectedRoute>
            <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
              <Toaster position="top-right" />
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSidebarOpen(true)} 
                className="md:hidden fixed top-4 left-4 z-40 bg-white dark:bg-gray-800 shadow-lg"
              >
                <Menu />
              </Button>
              
              <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
              
              <main className="flex-1 ml-0 md:ml-64 p-6">
                <Routes>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/income" element={<IncomePage />} />
                  <Route path="/expenses" element={<ExpensesPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="/debts" element={<DebtsPage />} />
                  <Route path="/calendar" element={<CalendarPage />} />
                  <Route path="/recurring" element={<RecurringPage />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </main>
            </div>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;