import React, { useState, useEffect } from 'react';
import './StudentPortfolio.css';
import { auth, db } from '../firebase';
import { doc, getDoc, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
// --- 1. CORRECTED IMPORTS ---
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const StudentPortfolio = () => {
    const [studentData, setStudentData] = useState(null);
    const [rankings, setRankings] = useState({ branchRank: 0 });
    const [activities, setActivities] = useState([]);
    const [pointsBreakdown, setPointsBreakdown] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (auth.currentUser) {
                setLoading(true);
                const studentId = auth.currentUser.uid;
                const studentDocRef = doc(db, "students", studentId);
                const studentDoc = await getDoc(studentDocRef);
                if (!studentDoc.exists()) { setLoading(false); return; }
                const currentStudent = studentDoc.data();
                setStudentData(currentStudent);

                const branchStudentsQuery = query(collection(db, "students"), where("branch", "==", currentStudent.branch), orderBy("totalPoints", "desc"));
                const branchSnapshot = await getDocs(branchStudentsQuery);
                const myRank = branchSnapshot.docs.findIndex(d => d.id === studentId) + 1;
                setRankings({ branchRank: myRank });

                const activitiesRef = collection(db, "certificateApprovalRequests");
                const q = query(activitiesRef, where("studentId", "==", studentId), where("status", "==", "approved"), orderBy("submittedAt", "desc"));
                const activitySnapshot = await getDocs(q);
                const approvedActivities = activitySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                setActivities(approvedActivities);

                const breakdown = approvedActivities.reduce((acc, activity) => {
                    const type = activity.activityType || 'Other';
                    acc[type] = (acc[type] || 0) + (activity.pointsAwarded || 0);
                    return acc;
                }, {});
                setPointsBreakdown(breakdown);
                
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleDownloadPdf = () => {
        const doc = new jsPDF();

        doc.setFontSize(22);
        doc.text("Student Report", 105, 20, { align: 'center' });

        doc.setFontSize(12);
        doc.text(`Name: ${studentData?.fullName || 'N/A'}`, 14, 40);
        doc.text(`Branch: ${studentData?.branch || 'N/A'}`, 14, 47);
        doc.text(`Year: ${studentData?.year || 'N/A'}`, 14, 54);
        doc.text(`Department Rank: #${rankings.branchRank || 'N/A'}`, 14, 61);
        doc.text(`Registered Number: 24PA5A4210`, 14, 68);

        const tableColumn = ["Activity", "Points"];
        const tableRows = [];

        activities.forEach(activity => {
            const activityData = [
                activity.activityType,
                activity.pointsAwarded,
            ];
            tableRows.push(activityData);
        });

        // --- 2. CORRECTED FUNCTION CALL ---
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 80,
        });

        const finalY = (doc).lastAutoTable.finalY; // The plugin adds this property
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(
            `Total Points: ${studentData?.totalPoints || 0}`,
            14,
            finalY + 15
        );

        doc.save(`${studentData?.fullName || 'student'}_report.pdf`);
    };


    if (loading) return <p>Loading Portfolio...</p>;

    return (
        <div>
            <div className="portfolio-header">
                <div>
                    <h3>Digital Portfolio</h3>
                    <p>Your comprehensive academic and extracurricular achievements</p>
                </div>
                <button onClick={handleDownloadPdf} className="btn-header-action">Download PDF</button>
            </div>
            
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon orange"><i className="bi bi-star-fill"></i></div>
                    <div className="stat-info">
                        <h3>{studentData?.totalPoints || 0}</h3>
                        <p>Total Points</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon green"><i className="bi bi-check-circle-fill"></i></div>
                    <div className="stat-info">
                        <h3>{activities.length}</h3>
                        <p>Activities Completed</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon blue"><i className="bi bi-building"></i></div>
                    <div className="stat-info">
                        <h3>{studentData?.branch}</h3>
                        <p>{studentData?.year} Year</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon purple"><i className="bi bi-trophy-fill"></i></div>
                    <div className="stat-info">
                        <h3>#{rankings.branchRank || 'N/A'}</h3>
                        <p>Department Rank</p>
                    </div>
                </div>
            </div>

            <div className="portfolio-grid">
                <div className="section-card">
                    <h4>Points Breakdown</h4>
                    <ul className="points-breakdown-list">
                        {Object.entries(pointsBreakdown).map(([type, points]) => (
                            <li key={type} className="points-breakdown-item">
                                <span>{type}s</span>
                                <span>{points} pts</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="section-card leaderboard-card">
                    <h4>Leaderboard Position</h4>
                    <div className="trophy"><i className="bi bi-trophy-fill"></i></div>
                    <p className="rank">#{rankings.branchRank || 'N/A'}</p>
                    <p>Department Rank</p>
                    <p>Branch Rank ({studentData?.branch} {studentData?.year} Year)</p>
                </div>
            </div>

            <div className="section-card" style={{marginTop: '2rem'}}>
                <h4>Recent Achievements</h4>
                <div className="recent-achievements-list">
                    {activities.slice(0, 3).map(activity => (
                         <div key={activity.id} className="activity-item">
                            <div className="activity-icon" style={{backgroundColor: '#ffffffff'}}><i className="bi bi-patch-check-fill"></i></div>
                            <div className="activity-details"><h5>{activity.activityTitle}</h5></div>
                            <span className="activity-points">+{activity.pointsAwarded} pts</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="portfolio-actions">
                {/* <button>Share Portfolio</button> */}
                <button onClick={handleDownloadPdf}>Download PDF</button>
                {/* <button>View Analytics</button> */}
            </div>
        </div>
    );
};

export default StudentPortfolio;


