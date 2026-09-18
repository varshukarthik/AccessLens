import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import PortalLayout from './layouts/PortalLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import Home from './pages/public/Home';
import About from './pages/public/About';
import Solutions from './pages/public/Solutions';
import Careers from './pages/public/Careers';
import Contact from './pages/public/Contact';
import Login from './pages/public/Login';

// Portal Pages
import Dashboard from './pages/portal/Dashboard';
import NexusGuard from './pages/portal/NexusGuard';
import Documents from './pages/portal/Documents';
import History from './pages/portal/History';

// Admin Pages
import AdminOverview from './pages/admin/AdminOverview';
import SecurityInspector from './pages/admin/SecurityInspector';
import AdminDocuments from './pages/admin/AdminDocuments';
import AdminUsers from './pages/admin/AdminUsers';
import AdminPolicies from './pages/admin/AdminPolicies';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Corporate Website */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/solutions" element={<Solutions />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
          </Route>

          {/* Protected Employee Intranet */}
          <Route path="/portal" element={<PortalLayout />}>
            <Route index element={<Navigate to="/portal/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="nexusguard" element={<NexusGuard />} />
            <Route path="documents" element={<Documents />} />
            <Route path="history" element={<History />} />
          </Route>

          {/* Protected Security & Governance Admin */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminOverview />} />
            <Route path="security-inspector" element={<SecurityInspector />} />
            <Route path="documents" element={<AdminDocuments />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="policies" element={<AdminPolicies />} />
            <Route path="audit-logs" element={<AdminAuditLogs />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
