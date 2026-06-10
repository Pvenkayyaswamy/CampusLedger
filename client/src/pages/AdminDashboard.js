import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc, orderBy, limit } from 'firebase/firestore';

// A small helper component for the progress bars
const ProgressBar = ({ label, value }) => (
    <div className="progress-bar-container">
        <div className="progress-bar-label">
            <span>{label}</span>
            <span>{value}%</span>
        </div>
        <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${value}%` }}></div>
        </div>
    </div>
);


// Helper function to format time difference
const timeSince = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
};

const AdminDashboard = () => {
    const [stats, setStats] = useState({ totalStudents: 0, totalFaculty: 0, totalActivities: 0, avgCGPA: 8.2 });
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [adminData, setAdminData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (auth.currentUser) {
                setLoading(true);
                try {
                    const adminDocRef = doc(db, 'colleges', auth.currentUser.uid);
                    const adminDoc = await getDoc(adminDocRef);
                    if (adminDoc.exists()) setAdminData(adminDoc.data());
                    
                    const collegeId = auth.currentUser.uid;
                    const studentsQuery = query(collection(db, "students"), where("collegeId", "==", collegeId));
                    const facultyQuery = query(collection(db, "faculty"), where("collegeId", "==", collegeId));
                    const activitiesQuery = query(collection(db, "certificateApprovalRequests"));

                    const [studentSnapshot, facultySnapshot, activitySnapshot] = await Promise.all([
                        getDocs(studentsQuery), getDocs(facultyQuery), getDocs(activitiesQuery)
                    ]);

                    setStats({
                        totalStudents: studentSnapshot.size,
                        totalFaculty: facultySnapshot.size,
                        totalActivities: activitySnapshot.size,
                        avgCGPA: 8.2
                    });


                    const logQuery = query(
                        collection(db, "auditLog"), 
                        where("collegeId", "==", collegeId), 
                        orderBy("timestamp", "desc"), 
                        limit(5)
                    );
                    const logSnapshot = await getDocs(logQuery);
                    setRecentActivity(logSnapshot.docs.map(d => ({id: d.id, ...d.data()})));





                } catch (error) {
                    console.error("Error fetching admin dashboard data:", error);
                }
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <p>Loading Admin Dashboard...</p>;

    return (
        <div>
            <div className="page-header">
                <h2>Admin Dashboard</h2>
                <p>Institutional overview and management for {adminData?.institutionName || 'your institution'}</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="info">
                        <p>Total Students</p>
                        <h4>{stats.totalStudents}</h4>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="info">
                        <p>Total Faculty</p>
                        <h4>{stats.totalFaculty}</h4>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="info">
                        <p>Total Activities</p>
                        <h4>{stats.totalActivities}</h4>
                    </div>
                </div>
                {/* <div className="stat-card">
                    <div className="info">
                        <p>Avg CGPA</p>
                        <h4>{stats.avgCGPA}</h4>
                    </div>
                </div> */}
            </div>

            <div className="dashboard-grid">
                <div className="section-card">
                    <h4>Institution Overview</h4>
                    <ProgressBar label="Student Engagement" value={(stats.totalStudents/10)*100} />
                    <ProgressBar label="Faculty Participation" value={(stats.totalFaculty/5)*100} />
                    <ProgressBar label="Overall Performance" value={(stats.totalStudents/10)*(stats.totalFaculty/4)*200} />
                </div>
                <div className="section-card">
                    <h4>Recent Activity</h4>
                    {recentActivity.length > 0 ? (
                        recentActivity.map(activity => (
                            <div key={activity.id} className="activity-feed-item">
                                <i className="bi bi-person-plus activity-icon"></i>
                                <div className="activity-details">
                                    <p>{activity.details}</p>
                                    <span className="time">{timeSince(activity.timestamp?.toDate())}</span>
                                </div>
                            </div>
                        ))
                    ) : <p>No recent activity.</p>}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;






















