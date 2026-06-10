import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import './AdminDepartments.css';

const AdminDepartments = () => {
    const [departmentsData, setDepartmentsData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (auth.currentUser) {
                setLoading(true);
                try {
                    const collegeId = auth.currentUser.uid;
                    
                    // 1. Get college data to find the list of branches
                    const collegeDocRef = doc(db, 'colleges', collegeId);
                    const collegeDoc = await getDoc(collegeDocRef);
                    if (!collegeDoc.exists()) throw new Error("College profile not found");
                    const branches = collegeDoc.data().branches || [];

                    // 2. Fetch all students, faculty, and activities for the entire college at once
                    const studentsQuery = query(collection(db, "students"), where("collegeId", "==", collegeId));
                    const facultyQuery = query(collection(db, "faculty"), where("collegeId", "==", collegeId));
                    const activitiesQuery = query(collection(db, "certificateApprovalRequests"), where("status", "==", "approved")); // Only count approved activities

                    const [studentSnapshot, facultySnapshot, activitySnapshot] = await Promise.all([
                        getDocs(studentsQuery),
                        getDocs(facultyQuery),
                        getDocs(activitiesQuery)
                    ]);

                    const allStudents = studentSnapshot.docs.map(d => d.data());
                    const allFaculty = facultySnapshot.docs.map(d => d.data());
                    const allActivities = activitySnapshot.docs.map(d => d.data());

                    // 3. Process the data and group by department
                    const processedData = branches.map(branch => {
                        const studentsInBranch = allStudents.filter(s => s.branch === branch);
                        const facultyInBranch = allFaculty.filter(f => f.department === branch);
                        const studentIdsInBranch = studentsInBranch.map(s => s.uid);
                        const activitiesInBranch = allActivities.filter(a => studentIdsInBranch.includes(a.studentId));
                        const totalPoints = studentsInBranch.reduce((sum, s) => sum + (s.totalPoints || 0), 0);
                        const studentCount = studentsInBranch.length;

                        return {
                            name: branch,
                            students: studentCount,
                            faculty: facultyInBranch.length,
                            activities: activitiesInBranch.length,
                            avgPoints: studentCount > 0 ? (totalPoints / studentCount).toFixed(1) : 0,
                            performance: Math.floor(Math.random() * (100 - 80 + 1)) + 80, // Random value between 80-100
                        };
                    });

                    setDepartmentsData(processedData);

                } catch (error) {
                    console.error("Error fetching department data:", error);
                }
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <p>Loading department data...</p>;

    return (
        <div>
            {/* <div className="page-header">
                <h2>Departmental Performance</h2>
                <p>Detailed statistics and performance metrics for each department</p>
            </div> */}

            <div className="departments-banner">
                <h3>Departmental Performance</h3>
                <p>Detailed statistics and performance metrics for each department</p>
            </div>

            <div className="departments-container">
                {departmentsData.length === 0 ? (
                    <div className="department-card">
                        <p>No departments found or no students enrolled yet.</p>
                    </div>
                ) : (
                    departmentsData.map(dept => (
                        <div key={dept.name} className="department-card">
                            <div className="department-header">
                                <h4>{dept.name}</h4>
                            </div>
                            <div className="department-stats-grid">
                                <div className="stat-item"><p>Students</p><h5>{dept.students}</h5></div>
                                <div className="stat-item"><p>Faculty</p><h5>{dept.faculty}</h5></div>
                                <div className="stat-item"><p>Activities</p><h5>{dept.activities}</h5></div>
                                <div className="stat-item"><p>Total Points</p><h5>{dept.avgPoints}</h5></div>
                                <div className="stat-item">
                                    {/* <p>Performance</p>
                                    <div className="performance-bar-container">
                                        <div className="progress-bar">
                                            <div className="progress-bar-fill" style={{ width: `${dept.performance}%` }}></div>
                                        </div>
                                        <h5>{dept.performance}%</h5>
                                    </div> */}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminDepartments;