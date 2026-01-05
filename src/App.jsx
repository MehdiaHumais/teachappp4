import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Login from './pages/Login';
import Register from './pages/Register';
import BuildingList from './pages/BuildingList';
import BuildingDetailPage from './pages/BuildingDetailPage';
import PDFViewerPage from './pages/PDFViewerPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ProfilePage from './pages/ProfilePage';
import SearchPage from './pages/SearchPage';
import ManageBuilding from './pages/ManageBuilding';
import ManageFloorsRisers from './pages/ManageFloorsRisers';
import ManageImages from './pages/ManageImages';
import ManagePDFs from './pages/ManagePDFs';
import ManageUsers from './pages/ManageUsers';
import UploadImagesPage from './pages/UploadImagesPage';

function AppWrapper() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/buildings" element={<ProtectedRoute><BuildingList /></ProtectedRoute>} />
      <Route path="/building/:id" element={<ProtectedRoute><BuildingDetailPage /></ProtectedRoute>} />
      <Route path="/pdfs/:id" element={<ProtectedRoute><PDFViewerPage /></ProtectedRoute>} />
      <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
      <Route path="/admin/buildings" element={<AdminRoute><ManageBuilding /></AdminRoute>} />
      <Route path="/admin/floors-risers" element={<AdminRoute><ManageFloorsRisers /></AdminRoute>} />
      <Route path="/admin/images" element={<AdminRoute><ManageImages /></AdminRoute>} />
      <Route path="/admin/pdfs" element={<AdminRoute><ManagePDFs /></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><ManageUsers /></AdminRoute>} />
      <Route path="/admin/images/upload" element={<AdminRoute><UploadImagesPage /></AdminRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B181C] flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B181C] flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (!user || user.role !== 'Admin') {
    return <Navigate to="/buildings" replace />;
  }

  return children;
};

export default AppWrapper;