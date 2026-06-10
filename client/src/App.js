import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Import Pages
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
// Student Pages
import StudentDashboard from './pages/StudentDashboard';
import StudentPortfolio from './pages/StudentPortfolio';
import StudentPublicProfiles from './pages/StudentPublicProfiles';
import StudentMyActivities from './pages/StudentMyActivities';
import StudentFacultyResponse from './pages/StudentFacultyResponse';
import StudentSettings from './pages/StudentSettings';
import StudentLMSIntegration from './pages/StudentLMSIntegration';
// Faculty Pages
import FacultyDashboard from './pages/FacultyDashboard';
import FacultyStudentRequests from './pages/FacultyStudentRequests';
import FacultyStudentEnrollments from './pages/FacultyStudentEnrollments';
import FacultyApprovalHistory from './pages/FacultyApprovalHistory';
import FacultySettings from './pages/FacultySettings';
import FacultyStudentUploads from './pages/FacultyStudentUploads';
import FacultyStudentDetails from './pages/FacultyStudentDetails';
import FacultyPerformance from './pages/FacultyPerformance';
// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminStatistics from './pages/AdminStatistics';
import AdminDepartments from './pages/AdminDepartments';
import AdminReports from './pages/AdminReports';
import AdminSettings from './pages/AdminSettings';
import AdminFacultyRequests from './pages/AdminFacultyRequests';
import AdminFacultyManagement from './pages/AdminFacultyManagement';


function App() {
  return (
    <Router>
      <Routes>
        {/* --- Public Routes --- */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/:role" element={<AuthPage />} />

        {/* --- Student Routes --- */}
        <Route path="/student" element={<DashboardLayout />}>
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="portfolio" element={<StudentPortfolio />} />
          <Route path="profiles" element={<StudentPublicProfiles />} />
          <Route path="activities" element={<StudentMyActivities />} />
          <Route path="responses" element={<StudentFacultyResponse />} />
          <Route path="settings" element={<StudentSettings />} />
          <Route path="lms" element={<StudentLMSIntegration />} />
        </Route>

        {/* --- Faculty Routes --- */}
        <Route path="/faculty" element={<DashboardLayout />}>
          <Route path="dashboard" element={<FacultyDashboard />} />
          <Route path="uploads" element={<FacultyStudentUploads />} />
          <Route path="requests" element={<FacultyStudentRequests />} />
          <Route path="enrollments" element={<FacultyStudentEnrollments />} />
          <Route path="history" element={<FacultyApprovalHistory />} />
          <Route path="settings" element={<FacultySettings />} />
          <Route path="students" element={<FacultyStudentDetails />} />
          <Route path="performance" element={<FacultyPerformance />} />
        </Route>
        
        {/* --- Admin Routes --- */}
        <Route path="/admin" element={<DashboardLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="requests" element={<AdminFacultyRequests />} />
          <Route path="faculty-management" element={<AdminFacultyManagement />} />
          <Route path="statistics" element={<AdminStatistics />} />
          <Route path="departments" element={<AdminDepartments />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

























// // App.js

// import React from 'react';
// import './App.css';

// // Simple Navbar Component
// function Navbar() {
//   return (
//     <nav className="navbar">
//       <div className="navbar-brand">Achieve Hub+</div>
//       {/* We can add navigation links here later */}
//     </nav>
//   );
// }

// // Hero/Landing Page Component
// function LandingPage() {
//   return (
//     <div className="hero-container">
//       <h1>Welcome to the Smart Student Hub</h1>
//       <p>Your centralized platform for tracking, managing, and showcasing all your academic and co-curricular achievements.</p>
//       <div className="button-container">
//         <a href="/login/student" className="btn btn-primary">Student Login</a>
//         <a href="/login/faculty" className="btn btn-secondary">Faculty / Admin Login</a>
//       </div>
//     </div>
//   );
// }


// // Main App Component
// function App() {
//   // We will add routing here later to handle different pages
//   return (
//     <div className="App">
//       <Navbar />
//       <LandingPage />
//     </div>
//   );
// }

// export default App;