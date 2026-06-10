import React, { useState, useEffect } from 'react';
import { Link , useOutletContext } from 'react-router-dom';
import './StudentDashboard.css';
import { auth, db } from '../firebase';
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import AddActivityModal from '../components/AddActivityModal';

const StudentDashboard = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [studentData, setStudentData] = useState(null);
    const [rankings, setRankings] = useState({ branchRank: 0, departmentRank: 0, pointsToLead: 0 });
    const [recentActivities, setRecentActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const { lmsData } = useOutletContext();

    useEffect(() => {
        const fetchData = async () => {
            if (auth.currentUser) {
                setLoading(true);
                const studentId = auth.currentUser.uid;

                // 1. Fetch current student's profile
                const studentDocRef = doc(db, "students", studentId);
                const studentDoc = await getDoc(studentDocRef);
                if (!studentDoc.exists()) {
                    setLoading(false);
                    return;
                }
                const currentStudent = studentDoc.data();
                setStudentData(currentStudent);

                // 2. Fetch all students in the same branch to calculate rank
                const branchStudentsQuery = query(
                    collection(db, "students"),
                    where("branch", "==", currentStudent.branch),
                    orderBy("totalPoints", "desc")
                );
                const branchSnapshot = await getDocs(branchStudentsQuery);
                const rankedStudents = branchSnapshot.docs.map(d => d.data());
                
                const myRank = rankedStudents.findIndex(s => s.uid === studentId) + 1;
                const topStudentPoints = rankedStudents.length > 0 ? rankedStudents[0].totalPoints : 0;
                const pointsToLead = topStudentPoints - (currentStudent.totalPoints || 0);

                setRankings({
                    branchRank: myRank,
                    departmentRank: myRank, // Assuming department rank is the same as branch for now
                    pointsToLead: pointsToLead,
                });

                // 3. Fetch last 3 recent activities
                const activitiesRef = collection(db, "certificateApprovalRequests");
                const q = query(activitiesRef, where("studentId", "==", studentId), orderBy("submittedAt", "desc"), limit(3));
                const activitySnapshot = await getDocs(q);
                setRecentActivities(activitySnapshot.docs.map(d => ({ id: d.id, ...d.data() })));
                
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return <p>Loading Dashboard...</p>;
    }

    return (
        <>
            {isModalOpen && <AddActivityModal onClose={() => setIsModalOpen(false)} />}
            
            <div className="dashboard-header">
                <h2>Welcome back, {studentData?.fullName || 'Student'}!</h2>
                <p>You're doing great! Keep up the excellent work and maintain your position in the leaderboard.</p>
               <div className="header-meta">
                    {/* Display attendance from LMS if available */}
                    <span>Attendance: {lmsData ? lmsData.overallAttendance : 'Link LMS'}</span>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <p>Total Points</p>
                    <h3 className="value">{studentData?.totalPoints || 0}</h3>
                    <p className="trend">+{rankings.pointsToLead} to #1</p>
                </div>
                <div className="stat-card">
                    <p>({studentData?.branch})</p>
                    <p>Branch Year</p>
                    <h3 className="value">{studentData?.year || ''}</h3>
                    {/* Placeholder for trend */}
                </div>
                <div className="stat-card">
                    <p>Department Rank</p>
                    <h3 className="value">#{rankings.departmentRank || 'N/A'}</h3>
                    <p className="trend"></p> {/* Placeholder */}
                </div>
                <div className="stat-card">
                    <p>CGPA</p>
                    <h3 className="value">{lmsData ? lmsData.overallCGPA : 'N/A'}</h3>
                    <p className="trend">{lmsData ? '' : 'Link LMS for data'}</p>
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="section-card">
                    <h4>Recent Activities</h4>
                    {recentActivities.length > 0 ? recentActivities.map(activity => (
                        <div key={activity.id} className="activity-item">
                            <div className="activity-details">
                                <h5>{activity.activityTitle}</h5>
                                <p>Submitted on {new Date(activity.submittedAt?.seconds * 1000).toLocaleDateString()}</p>
                            </div>
                            {activity.status === 'approved' && <span className="activity-points">+{activity.pointsAwarded} pts</span>}
                            <span className={`activity-status ${activity.status}`}>{activity.status}</span>
                        </div>
                    )) : <p>No recent activities found.</p>}
                </div>
                <div className="section-card">
                    <h4>Quick Actions</h4>
                    <div className="quick-actions">
                        <button onClick={() => setIsModalOpen(true)}>Upload New Activity</button>
                        <Link to="/student/portfolio"><button>View Portfolio</button></Link>
                        <Link to="/student/settings"><button>Update Profile</button></Link>
                    </div>
                </div>
            </div>
            <div className="keep-going-banner">
                <h4>Keep Going!</h4>
                <p>You're just {rankings.pointsToLead} points away from reaching the top student in your branch. Consider participating in upcoming workshops or competitions to boost your rank!</p>
            </div>
        </>
    );
};

export default StudentDashboard;

