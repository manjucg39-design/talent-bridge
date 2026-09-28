import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Public pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DemoPage from './pages/DemoPage';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Student pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import StudentOpportunities from './pages/student/StudentOpportunities';
import StudentApplications from './pages/student/StudentApplications';

// Teacher pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherStudents from './pages/teacher/TeacherStudents';
import AddFitnessTest from './pages/teacher/AddFitnessTest';

// Scout pages
import ScoutDashboard from './pages/scout/ScoutDashboard';
import ScoutAthletes from './pages/scout/ScoutAthletes';
import ScoutShortlist from './pages/scout/ScoutShortlist';
import AthleteDetail from './pages/scout/AthleteDetail';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminVerifications from './pages/admin/AdminVerifications';
import AdminUsers from './pages/admin/AdminUsers';

// Shared pages
import OpportunityDetail from './pages/OpportunityDetail';
import ClubsKIC from './pages/ClubsKIC';
import NotificationsPage from './pages/NotificationsPage';
import OpportunitiesPage from './pages/OpportunitiesPage';

// Gov pages
import GovDashboard from './pages/gov/GovDashboard';
import CreateOpportunity from './pages/gov/CreateOpportunity';
import ClubDashboard from './pages/club/ClubDashboard';

import { UserRole } from './types';
import { ReactNode } from 'react';

function ProtectedRoute({ children, roles }: { children: ReactNode; roles?: UserRole[] }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function DashboardRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  const routes: Record<UserRole, string> = {
    STUDENT: '/dashboard/student',
    PE_TEACHER: '/dashboard/teacher',
    CLUB: '/dashboard/club',
    SCOUT: '/dashboard/scout',
    GOVERNMENT_ORGANIZATION: '/dashboard/gov',
    ADMIN: '/dashboard/admin',
  };
  return <Navigate to={routes[user.role]} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/demo" element={<DemoPage />} />
          <Route path="/opportunities" element={<OpportunitiesPage />} />
          <Route path="/opportunities/:id" element={<OpportunityDetail />} />
          <Route path="/clubs" element={<ClubsKIC />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />

          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            {/* Student */}
            <Route path="student" element={<ProtectedRoute roles={['STUDENT']}><StudentDashboard /></ProtectedRoute>} />
            <Route path="student/profile" element={<ProtectedRoute roles={['STUDENT']}><StudentProfile /></ProtectedRoute>} />
            <Route path="student/opportunities" element={<ProtectedRoute roles={['STUDENT']}><StudentOpportunities /></ProtectedRoute>} />
            <Route path="student/applications" element={<ProtectedRoute roles={['STUDENT']}><StudentApplications /></ProtectedRoute>} />

            {/* Teacher */}
            <Route path="teacher" element={<ProtectedRoute roles={['PE_TEACHER']}><TeacherDashboard /></ProtectedRoute>} />
            <Route path="teacher/students" element={<ProtectedRoute roles={['PE_TEACHER']}><TeacherStudents /></ProtectedRoute>} />
            <Route path="teacher/add-test" element={<ProtectedRoute roles={['PE_TEACHER']}><AddFitnessTest /></ProtectedRoute>} />

            {/* Scout */}
            <Route path="scout" element={<ProtectedRoute roles={['SCOUT']}><ScoutDashboard /></ProtectedRoute>} />
            <Route path="scout/athletes" element={<ProtectedRoute roles={['SCOUT']}><ScoutAthletes /></ProtectedRoute>} />
            <Route path="scout/athletes/:id" element={<ProtectedRoute roles={['SCOUT']}><AthleteDetail /></ProtectedRoute>} />
            <Route path="scout/shortlist" element={<ProtectedRoute roles={['SCOUT']}><ScoutShortlist /></ProtectedRoute>} />

            {/* Club */}
            <Route path="club" element={<ProtectedRoute roles={['CLUB']}><ClubDashboard /></ProtectedRoute>} />

            {/* Gov */}
            <Route path="gov" element={<ProtectedRoute roles={['GOVERNMENT_ORGANIZATION']}><GovDashboard /></ProtectedRoute>} />
            <Route path="gov/create" element={<ProtectedRoute roles={['GOVERNMENT_ORGANIZATION']}><CreateOpportunity /></ProtectedRoute>} />
            <Route path="gov/opportunities/:id/edit" element={<ProtectedRoute roles={['GOVERNMENT_ORGANIZATION']}><CreateOpportunity /></ProtectedRoute>} />

            {/* Admin */}
            <Route path="admin" element={<ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="admin/verifications" element={<ProtectedRoute roles={['ADMIN']}><AdminVerifications /></ProtectedRoute>} />
            <Route path="admin/users" element={<ProtectedRoute roles={['ADMIN']}><AdminUsers /></ProtectedRoute>} />

            {/* Shared */}
            <Route path="notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
            <Route path="clubs" element={<ProtectedRoute><ClubsKIC /></ProtectedRoute>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
