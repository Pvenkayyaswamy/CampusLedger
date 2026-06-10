import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import './AdminStatistics.css';

const AdminStatistics = () => {
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalFaculty: 0,
        totalActivities: 0,
        departments: 0,
        totalPoints: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (auth.currentUser) {
                setLoading(true);
                try {
                    const collegeId = auth.currentUser.uid;
                    
                    // Fetch college data to get department count
                    const collegeDocRef = doc(db, 'colleges', collegeId);
                    const collegeDoc = await getDoc(collegeDocRef);
                    const departmentCount = collegeDoc.exists() ? collegeDoc.data().branches.length : 0;

                    // Fetch all students, faculty, and activities for this college
                    const studentsQuery = query(collection(db, "students"), where("collegeId", "==", collegeId));
                    const facultyQuery = query(collection(db, "faculty"), where("collegeId", "==", collegeId));
                    // Note: A more optimized query would also filter activities by collegeId if possible
                    const activitiesQuery = query(collection(db, "certificateApprovalRequests")); 

                    // --- CORRECTED DATA FETCHING ---
                    const [studentSnapshot, facultySnapshot, activitySnapshot] = await Promise.all([
                        getDocs(studentsQuery),
                        getDocs(facultyQuery),
                        getDocs(activitiesQuery)
                    ]);
                    
                    const totalPoints = studentSnapshot.docs.reduce((sum, doc) => sum + (doc.data().totalPoints || 0), 0);

                    setStats({
                        totalStudents: studentSnapshot.size,
                        totalFaculty: facultySnapshot.size,
                        totalActivities: activitySnapshot.size,
                        departments: departmentCount,
                        totalPoints: totalPoints,
                    });

                } catch (error) {
                    console.error("Error fetching statistics:", error);
                }
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <p>Loading statistics...</p>;

    return (
        <div>
            {/* <div className="page-header">
                <h2>Statistical Overview</h2>
                <p>Comprehensive institutional statistics</p>
            </div> */}

            <div className="stats-banner">
                <h3>Statistical Overview</h3>
                <p>Comprehensive institutional statistics</p>
            </div>

            <div className="stats-overview-grid">
                {/* Student Statistics Card */}
                <div className="stat-overview-card">
                    <h4>Student Statistics</h4>
                    <div className="main-stat">
                        <p className="value">{stats.totalStudents}</p>
                        <p className="label">Total Students</p>
                    </div>
                    <ul className="sub-stats-list">
                        <li className="sub-stat-item">
                            <span className="label">Active Students</span>
                            <span className="value">98%</span>
                        </li>
                        <li className="sub-stat-item">
                            <span className="label">Average CGPA</span>
                            <span className="value">8.2</span>
                        </li>
                    </ul>
                </div>

                {/* Faculty Statistics Card */}
                <div className="stat-overview-card">
                    <h4>Faculty Statistics</h4>
                    <div className="main-stat">
                        <p className="value">{stats.totalFaculty}</p>
                        <p className="label">Total Faculty</p>
                    </div>
                    <ul className="sub-stats-list">
                        <li className="sub-stat-item">
                            <span className="label">Active Faculty</span>
                            <span className="value">100%</span>
                        </li>
                        <li className="sub-stat-item">
                            <span className="label">Departments</span>
                            <span className="value">{stats.departments}</span>
                        </li>
                    </ul>
                </div>

                {/* Activity Statistics Card */}
                <div className="stat-overview-card">
                    <h4>Activity Statistics</h4>
                    <div className="main-stat">
                        <p className="value">{stats.totalActivities}</p>
                        <p className="label">Total Activities</p>
                    </div>
                    <ul className="sub-stats-list">
                        <li className="sub-stat-item">
                            <span className="label">This Month</span>
                            <span className="value">245</span>
                        </li>
                        <li className="sub-stat-item">
                            <span className="label">Total Points</span>
                            <span className="value">{stats.totalPoints.toLocaleString()}</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AdminStatistics;