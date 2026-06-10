import React from 'react';
import { Link } from 'react-router-dom'; // IMPORT Link
import './LandingPage.css';

const LandingPage = () => {
  return (
    <>
      {/* Navbar */}
      <header className="navbar">CampusLedger</header>

      <main>
        {/* Hero Section */}
        <section className="hero">
          <h1>CampusLedger</h1>
          <p>
            Centralized Digital Platform for Comprehensive Student Activity Records.
            Track and showcase your complete profile from academics to extra-curriculars, all in one place.
          </p>
          <div className="hero-buttons">
            <a href="#roles" className="btn btn-primary">Get Started</a>
            <a href="#features" className="btn btn-secondary">Learn More</a>
          </div>
        </section>

        {/* The Challenge We Solve Section */}
        <section className="container">
          <h2 className="section-title">The Challenge We Solve</h2>
          <div className="challenge-grid">
            {/* ... challenge cards ... */}
            <div className="challenge-card problem">
              <h3>Current Problems</h3>
              <ul>
                <li><i className="bi bi-x-circle-fill"></i> Scattered student records</li>
                <li><i className="bi bi-x-circle-fill"></i> Difficulty in tracking achievements</li>
                <li><i className="bi bi-x-circle-fill"></i> Heavy administrative burden</li>
                <li><i className="bi bi-x-circle-fill"></i> Lack of verified portfolios</li>
              </ul>
            </div>
            <div className="challenge-card solution">
              <h3>Our Solution</h3>
              <ul>
                <li><i className="bi bi-check-circle-fill"></i> Centralized digital platform</li>
                <li><i className="bi bi-check-circle-fill"></i> Real-time activity tracking</li>
                <li><i className="bi bi-check-circle-fill"></i> Automated reporting for accreditation</li>
                <li><i className="bi bi-check-circle-fill"></i> Verified & shareable portfolios</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Key Features Section */}
        <section id="features" className="container">
          <h2 className="section-title">Key Features</h2>
          <p className="section-subtitle">
            Everything you need to build a holistic student profile and streamline institutional data management.
          </p>
          <div className="features-grid">
             {/* ... feature cards ... */}
            <div className="feature-card">
              <i className="bi bi-person-vcard"></i>
              <h3>Dynamic Student Dashboard</h3>
              <p>Real-time updates on academics, attendance, and credit-based activities.</p>
            </div>
            <div className="feature-card">
              <i className="bi bi-graph-up-arrow"></i>
              <h3>Activity Tracker</h3>
              <p>Upload and validate participation in seminars, courses, internships, etc.</p>
            </div>
            <div className="feature-card">
              <i className="bi bi-check2-square"></i>
              <h3>Faculty Approval Panel</h3>
              <p>Faculty or admin can approve uploaded records to maintain credibility.</p>
            </div>
            <div className="feature-card">
              <i className="bi bi-file-earmark-pdf"></i>
              <h3>Auto-Generated Portfolio</h3>
              <p>Downloadable and shareable verified student portfolio in PDF or web link.</p>
            </div>
            <div className="feature-card">
              <i className="bi bi-bar-chart-fill"></i>
              <h3>Analytics & Reporting</h3>
              <p>Generate reports for NAAC, AICTE, NIRF, or internal institutional evaluations.</p>
            </div>
            <div className="feature-card">
              <i className="bi bi-arrow-repeat"></i>
              <h3>Integration Support</h3>
              <p>Seamlessly connect with existing LMS, ERP, or digital university platforms.</p>
            </div>
          </div>
        </section>

        {/* Impact & Benefits Section */}
        <section className="container">
          <h2 className="section-title">Impact & Benefits</h2>
          <div className="impact-list">
             {/* ... impact items ... */}
            <div className="impact-item"><i className="bi bi-shield-check"></i> Empowers students with a verified, holistic digital profile.</div>
            <div className="impact-item"><i className="bi bi-briefcase-fill"></i> Facilitates career planning and placements.</div>
            <div className="impact-item"><i className="bi bi-files"></i> Reduces administrative burden during audits and accreditations.</div>
            <div className="impact-item"><i className="bi bi-trophy-fill"></i> Encourages participation in co-curricular activities.</div>
          </div>
        </section>

        {/* Choose Your Role Section */}
        <section id="roles" className="container">
          <h2 className="section-title">Choose Your Role</h2>
          <p className="section-subtitle">
            Access the hub based on your role. Login to get started and explore your dedicated dashboard.
          </p>
          <div className="roles-grid">
            <div className="role-card">
              <i className="bi bi-person-fill"></i>
              <h3>Student</h3>
              <p>Build your profile, track achievements, and generate your portfolio.</p>
              {/* CHANGE <a> to <Link> */}
              <Link to="/auth/student">Login as Student →</Link>
            </div>
            <div className="role-card">
              <i className="bi bi-people-fill"></i>
              <h3>Faculty</h3>
              <p>Verify student achievements, mentor students, and track progress.</p>
              {/* CHANGE <a> to <Link> */}
              <Link to="/auth/faculty">Login as Faculty →</Link>
            </div>
            <div className="role-card">
              <i className="bi bi-building-fill"></i>
              <h3>Admin</h3>
              <p>Manage the institution's data, generate reports, and oversee activities.</p>
              {/* CHANGE <a> to <Link> */}
              <Link to="/auth/admin">Login as Admin →</Link>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="cta container">
           {/* ... cta content ... */}
          <h2 className="section-title" style={{ color: 'white' }}>Ready to Transform Your Institution?</h2>
          <p className="section-subtitle" style={{ color: '#eee' }}>
            Join the digital transformation of education. Empower your students and faculty today.
          </p>
          <a href="/contact" className="btn">Get in Touch</a>
        </section>
      </main>
    </>
  );
};

export default LandingPage;