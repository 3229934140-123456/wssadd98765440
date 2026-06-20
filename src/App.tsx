import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Sidebar from '@/components/Layout/Sidebar';
import Header from '@/components/Layout/Header';
import { ToastProvider } from '@/components/common/Toast';
import { useAppStore } from '@/store/useAppStore';
import TodayRegistration from '@/pages/TodayRegistration';
import ToothSelect from '@/pages/ToothSelect';
import ToothRecord from '@/pages/ToothRecord';
import FollowupReminder from '@/pages/FollowupReminder';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Header />
        <main className="flex-1 min-w-0 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/today" replace />} />
      <Route path="/today" element={<TodayRegistration />} />
      <Route path="/tooth-select" element={<ToothSelect />} />
      <Route path="/tooth/:id" element={<ToothRecord />} />
      <Route path="/followup" element={<FollowupReminder />} />
      <Route path="*" element={<Navigate to="/today" replace />} />
    </Routes>
  );
}

export default function App() {
  const hydrate = useAppStore((s) => s._hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <ToastProvider>
      <Router>
        <Layout>
          <AppRoutes />
        </Layout>
      </Router>
    </ToastProvider>
  );
}
