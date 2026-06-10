import React from 'react';
import './StudentProfile.css';

const StudentProfile = () => {
  // Dummy data
  const profile = {
    fullName: 'John Doe',
    studentId: 'CSE2021001',
    email: 'john.doe@college.edu',
    phone: '+91 9876543210',
    branch: 'Computer Science Engineering',
    currentYear: '3rd Year',
  };

  return (
    <div>
      <h2>Profile Details</h2>
      <p>Manage your personal information and academic details.</p>
      <div className="profile-card">
        <h3>Personal Information</h3>
        <div className="profile-grid">
          <div className="info-field"><label>Full Name</label><p>{profile.fullName}</p></div>
          <div className="info-field"><label>Student ID</label><p>{profile.studentId}</p></div>
          <div className="info-field"><label>Email</label><p>{profile.email}</p></div>
          <div className="info-field"><label>Phone</label><p>{profile.phone}</p></div>
          <div className="info-field"><label>Branch</label><p>{profile.branch}</p></div>
          <div className="info-field"><label>Current Year</label><p>{profile.currentYear}</p></div>
        </div>
      </div>
    </div>
  );
};
export default StudentProfile;