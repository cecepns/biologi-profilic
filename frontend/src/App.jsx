import React, { useState } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { BottomNav } from './components/common/BottomNav';

// Pages
import { LoginPage } from './pages/auth/LoginPage';
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentProjects } from './pages/student/StudentProjects';
import { StudentProjectDetail } from './pages/student/StudentProjectDetail';
import { StudentMaterials } from './pages/student/StudentMaterials';
import { StudentDiscussion } from './pages/student/StudentDiscussion';
import { StudentProfile } from './pages/student/StudentProfile';

import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { TeacherProjects } from './pages/teacher/TeacherProjects';
import { TeacherMaterials } from './pages/teacher/TeacherMaterials';
import { TeacherDiscussions } from './pages/teacher/TeacherDiscussions';
import { TeacherClasses } from './pages/teacher/TeacherClasses';
import { TeacherGradingCenter } from './pages/teacher/TeacherGradingCenter';
import { TeacherReports } from './pages/teacher/TeacherReports';
import { TeacherProfile } from './pages/teacher/TeacherProfile';

import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminClasses } from './pages/admin/AdminClasses';
import { AdminAuditLogs } from './pages/admin/AdminAuditLogs';

// Authenticated Layout
const AuthenticatedLayout = ({ user }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const role = user?.role || 'student';

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar (Fixed) */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area Offset by Sidebar on Desktop */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0 lg:pl-64">
        {/* Sticky Top Navbar */}
        <Navbar onToggleSidebar={() => setSidebarOpen(true)} />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        {/* Student Mobile Bottom Navigation */}
        {role === 'student' && <BottomNav />}
      </div>
    </div>
  );
};

export const App = () => {
  const { user, token } = useAuth();
  const isAuthenticated = Boolean(user && token);

  const getHomeRedirect = () => {
    if (user?.role === 'admin') return '/admin/dashboard';
    if (user?.role === 'teacher') return '/teacher/dashboard';
    return '/student/dashboard';
  };

  return (
    <Routes>
      {/* Public Login Route */}
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to={getHomeRedirect()} replace />
          ) : (
            <LoginPage />
          )
        }
      />

      {/* Authenticated Routes Branch */}
      {isAuthenticated ? (
        <Route element={<AuthenticatedLayout user={user} />}>
          {/* Root path redirects to role dashboard */}
          <Route path="/" element={<Navigate to={getHomeRedirect()} replace />} />

          {/* Student Routes */}
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/projects" element={<StudentProjects />} />
          <Route path="/student/projects/:id" element={<StudentProjectDetail />} />
          <Route path="/student/projects/:id/stage/:stageNum" element={<StudentProjectDetail />} />
          <Route path="/student/materials" element={<StudentMaterials />} />
          <Route path="/student/discussion" element={<StudentDiscussion />} />
          <Route path="/student/profile" element={<StudentProfile />} />

          {/* Teacher Routes */}
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/teacher/projects" element={<TeacherProjects />} />
          <Route path="/teacher/materials" element={<TeacherMaterials />} />
          <Route path="/teacher/discussions" element={<TeacherDiscussions />} />
          <Route path="/teacher/classes" element={<TeacherClasses />} />
          <Route path="/teacher/grading" element={<TeacherGradingCenter />} />
          <Route path="/teacher/reports" element={<TeacherReports />} />
          <Route path="/teacher/profile" element={<TeacherProfile />} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/classes" element={<AdminClasses />} />
          <Route path="/admin/materials" element={<TeacherMaterials />} />
          <Route path="/admin/discussions" element={<TeacherDiscussions />} />
          <Route path="/admin/logs" element={<AdminAuditLogs />} />

          {/* Fallback for any unknown route when logged in */}
          <Route path="*" element={<Navigate to={getHomeRedirect()} replace />} />
        </Route>
      ) : (
        /* Fallback for unauthenticated: all routes go directly to /login */
        <Route path="*" element={<Navigate to="/login" replace />} />
      )}
    </Routes>
  );
};

export default App;




