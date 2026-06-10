import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, NavLink, useNavigate } from 'react-router-dom';
import './DashboardLayout.css';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const navLinks = {
  student: [
    { name: 'Dashboard', path: '/student/dashboard', icon: 'bi-grid-fill' },
    { name: 'Portfolio', path: '/student/portfolio', icon: 'bi-person-badge-fill' },
    { name: 'My Profiles', path: '/student/profiles', icon: 'bi-share-fill' },
    { name: 'My Activities', path: '/student/activities', icon: 'bi-list-task' },
    { name: 'Faculty Response', path: '/student/responses', icon: 'bi-chat-left-dots-fill' },
    { name: 'LMS Integration', path: '/student/lms', icon: 'bi-link-45deg' },
    { name: 'Settings', path: '/student/settings', icon: 'bi-gear-fill' },
  ],
  faculty: [
    { name: 'Dashboard', path: '/faculty/dashboard', icon: 'bi-grid-fill' },
    { name: 'Student Uploads', path: '/faculty/uploads', icon: 'bi-file-earmark-arrow-up-fill' },
    { name: 'Student Enrollments', path: '/faculty/enrollments', icon: 'bi-person-plus-fill' },
    { name: 'Student Details', path: '/faculty/students', icon: 'bi-people-fill' }, // This link is now correct
    { name: 'Department Performance', path: '/faculty/performance', icon: 'bi-graph-up' },
    { name: 'Settings', path: '/faculty/settings', icon: 'bi-gear-fill' },
  ],
  admin: [
    { name: 'Dashboard', path: '/admin/dashboard', icon: 'bi-grid-1x2-fill' },
    { name: 'Faculty Requests', path: '/admin/requests', icon: 'bi-person-check-fill' },
    { name: 'Statistics', path: '/admin/statistics', icon: 'bi-bar-chart-line-fill' },
    { name: 'Departments', path: '/admin/departments', icon: 'bi-building' },
    { name: 'Reports', path: '/admin/reports', icon: 'bi-file-earmark-bar-graph-fill' },
    { name: 'Settings', path: '/admin/settings', icon: 'bi-gear-fill' },
  ],
};

const roleDetails = {
    student: { title: "CampusLedger", subtitle: "Student Portal" },
    faculty: { title: "CampusLedger", subtitle: "Faculty Portal" },
    admin: { title: "CampusLedger", subtitle: "Admin Portal" },
};

const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [lmsData, setLmsData] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        // If user logs out, clear the LMS data
        setLmsData(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const role = location.pathname.split('/')[1] || 'student'; 
  const currentNavLinks = navLinks[role] || [];
  const currentRoleDetails = roleDetails[role] || roleDetails.student;
  const themeClass = `${role}-theme`;

  return (
    <div className={`dashboard-layout ${themeClass}`}>
      <aside className="sidebar">
        <div className="sidebar-header">
          {currentRoleDetails.title}
        </div>
        <nav className="sidebar-nav">
          <ul>
            {currentNavLinks.map((link) => (
              <li key={link.name}>
                <NavLink to={link.path}>
                  <i className={`bi ${link.icon}`}></i>
                  <span>{link.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="sidebar-footer">
            <div className="user-info">
                <p className="username">{user ? user.displayName || currentRoleDetails.subtitle : '...'}</p>
                <p className="email">{user ? user.email : 'Loading...'}</p>
            </div>
             <button onClick={handleLogout} className="logout-btn">
                <i className="bi bi-box-arrow-left"></i>
                <span>Logout</span>
            </button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet context={{ lmsData, setLmsData }} /> 
      </main>
    </div>
  );
};

export default DashboardLayout;

