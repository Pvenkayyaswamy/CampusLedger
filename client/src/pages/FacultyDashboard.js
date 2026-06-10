import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './FacultyDashboard.css';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc, orderBy, limit } from 'firebase/firestore';

const FacultyDashboard = () => {
    const [facultyData, setFacultyData] = useState(null);
    const [stats, setStats] = useState({
        pendingRequests: 0,
        totalStudents: 0,
        approvedThisMonth: 0,
        averagePoints: 0,
    });
    const [recentSubmissions, setRecentSubmissions] = useState([]);
    const [departmentPerformance, setDepartmentPerformance] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (auth.currentUser) {
                setLoading(true);
                const facultyId = auth.currentUser.uid;

                // Fetch Faculty Details for the welcome banner
                const facultyDocRef = doc(db, 'faculty', facultyId);
                const facultyDoc = await getDoc(facultyDocRef);
                if (facultyDoc.exists()) {
                    setFacultyData(facultyDoc.data());
                }

                // 1. Fetch pending certificate requests for this faculty
                const requestsRef = collection(db, "certificateApprovalRequests");
                const qPendingRequests = query(requestsRef, where("mentorId", "==", facultyId), where("status", "==", "pending"));
                const pendingRequestsSnapshot = await getDocs(qPendingRequests);
                const pendingCount = pendingRequestsSnapshot.size;
                
                // Get the 3 most recent submissions
                const qRecentSubmissions = query(requestsRef, where("mentorId", "==", facultyId), orderBy("submittedAt", "desc"), limit(3));
                const recentSubmissionsSnapshot = await getDocs(qRecentSubmissions);
                setRecentSubmissions(recentSubmissionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));


                // 2. Fetch students mentored by this faculty
                const studentsRef = collection(db, "students");
                const qStudents = query(studentsRef, where("mentorId", "==", facultyId));
                const studentSnapshot = await getDocs(qStudents);
                const studentCount = studentSnapshot.size;
                
                // 3. Calculate average points
                let totalPoints = 0;
                studentSnapshot.forEach(doc => {
                    totalPoints += doc.data().totalPoints || 0;
                });
                const avgPoints = studentCount > 0 ? (totalPoints / studentCount).toFixed(1) : 0;

                // Placeholder for approved this month - this is a more complex query for later
                const approvedThisMonthCount = 8; 

                setStats({
                    pendingRequests: pendingCount,
                    totalStudents: studentCount,
                    approvedThisMonth: approvedThisMonthCount,
                    averagePoints: avgPoints,
                });

                // Placeholder for Department Performance
                setDepartmentPerformance([
                    { year: '1st Year', students: 45, avgPoints: 6.8, activities: 89 },
                    { year: '2nd Year', students: 42, avgPoints: 7.5, activities: 124 },
                    { year: '3rd Year', students: 38, avgPoints: 7.9, activities: 156 },
                    { year: '4th Year', students: 31, avgPoints: 8.7, activities: 187 },
                ]);

                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return <p>Loading Dashboard...</p>;
    }

    const getStatusTagClass = (status) => {
        if (status === 'pending') return 'tag-pending';
        if (status === 'approved') return 'tag-approved';
        if (status === 'rejected') return 'tag-rejected';
        return '';
    };

    return (
        <div>
            {/* Welcome Banner */}
            <div className="welcome-banner">
                <h3>Welcome back, {facultyData?.fullName || 'Faculty'}!</h3>
                <p>You have {stats.pendingRequests} pending activity approvals waiting for your review!</p>
                <div className="faculty-chips">
                    <span className="faculty-chip">{facultyData?.department || 'Department'}</span>
                    <span className="faculty-chip">{facultyData?.designation || 'Designation'}</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="card-header"><p>Pending Requests</p><span className="trend"></span></div>
                    <div className="card-value">{stats.pendingRequests}</div>
                </div>
                <div className="stat-card">
                    <div className="card-header"><p>Total Students</p><span className="trend"></span></div>
                    <div className="card-value">{stats.totalStudents}</div>
                </div>
                <div className="stat-card">
                    <div className="card-header"><p>Approved This Month</p><span className="trend"></span></div>
                    <div className="card-value">{stats.approvedThisMonth}</div>
                </div>
                <div className="stat-card">
                    <div className="card-header"><p>Average Points</p><span className="trend"></span></div>
                    <div className="card-value">{stats.averagePoints}</div>
                </div>
            </div>

            <div className="dashboard-sections-grid">
                {/* Recent Submissions */}
                <div className="section-card">
                    <h4>Recent Submissions</h4>
                    <ul className="submission-list">
                        {recentSubmissions.length === 0 ? <p>No recent submissions.</p> :
                            recentSubmissions.map(submission => (
                                <li key={submission.id} className="submission-item">
                                    <div className="submission-avatar">{submission.studentName ? submission.studentName.charAt(0) : 'S'}</div>
                                    <div className="submission-details">
                                        <h5>{submission.studentName || 'Student'}</h5>
                                        <p>{submission.activityTitle}</p>
                                    </div>
                                    <span className={`submission-tag ${getStatusTagClass(submission.status)}`}>
                                        {submission.status}
                                    </span>
                                </li>
                            ))
                        }
                    </ul>
                    <Link to="/faculty/history" className="view-all-link">View All →</Link>
                </div>

                {/* Quick Actions */}
                <div className="section-card">
                    <h4>Quick Actions</h4>
                    <div className="quick-actions-list">
                        <Link to="/faculty/uploads" className="quick-action-btn">Review Submissions</Link>
                        <Link to="/faculty/enrollments" className="quick-action-btn">Approve Enrollments</Link>
                        <button className="quick-action-btn">Generate Reports</button>
                    </div>
                </div>
            </div>

            {/* Department Performance Overview */}
            <div className="section-card" style={{ marginBottom: '2rem' }}>
                <h4>Department Performance Overview</h4>
                <div className="department-performance-grid">
                    {departmentPerformance.map(yearData => (
                        <div key={yearData.year} className="department-year-card">
                            <h5>{yearData.year}</h5>
                            <ul>
                                <li><span>Students</span><span>{yearData.students}</span></li>
                                <li><span>Avg. Points</span><span>{yearData.avgPoints}</span></li>
                                <li><span>Activities</span><span>{yearData.activities}</span></li>
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* Points Allocation Guide */}
            <div className="section-card">
                <h4>Points Allocation Guide</h4>
                <div className="points-guide-grid">
                    <div className="points-category-card">
                        <h5>High Impact (8-10 points)</h5>
                        <ul><li>- Research Publications, Patents, etc.</li></ul>
                    </div>
                    <div className="points-category-card">
                        <h5>Medium Impact (4-7 points)</h5>
                        <ul><li>- Internships, Hackathons, etc.</li></ul>
                    </div>
                    <div className="points-category-card">
                        <h5>Standard Impact (1-3 points)</h5>
                        <ul><li>- Workshops, Club Activities, etc.</li></ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FacultyDashboard;

