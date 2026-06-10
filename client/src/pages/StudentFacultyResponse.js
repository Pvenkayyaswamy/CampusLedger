import React, { useState, useEffect } from 'react';
import './StudentFacultyResponse.css';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';

const StudentFacultyResponse = () => {
    const [activities, setActivities] = useState([]);
    const [mentor, setMentor] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (auth.currentUser) {
                setLoading(true);

                // Get student's mentor
                const studentDocRef = doc(db, "students", auth.currentUser.uid);
                const studentDoc = await getDoc(studentDocRef);
                if (studentDoc.exists()) {
                    const studentData = studentDoc.data();
                    if (studentData.mentorId) {
                        const mentorDocRef = doc(db, "faculty", studentData.mentorId);
                        const mentorDoc = await getDoc(mentorDocRef);
                        if (mentorDoc.exists()) {
                            setMentor(mentorDoc.data());
                        }
                    }
                }

                // Fetch activities
                const requestsCollection = collection(db, "certificateApprovalRequests");
                const q = query(
                    requestsCollection,
                    where("studentId", "==", auth.currentUser.uid),
                    orderBy("submittedAt", "desc")
                );
                const querySnapshot = await getDocs(q);
                const activitiesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setActivities(activitiesList);

                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getStatusCounts = () => {
        const counts = { approved: 0, pending: 0, rejected: 0, total: activities.length };
        activities.forEach(act => {
            if (act.status === 'approved') counts.approved++;
            else if (act.status === 'pending') counts.pending++;
            else if (act.status === 'rejected') counts.rejected++;
        });
        return counts;
    };

    const statusCounts = getStatusCounts();

    if (loading) {
        return <p>Loading faculty responses...</p>;
    }

    return (
        <div>
            <div className="page-header1">
                <h2>Faculty Responses</h2>
                <p>Track feedback and responses from faculty on your submitted activities.</p>
            </div>

            {/* --- THIS IS THE CORRECTED SECTION --- */}
            <div className="stats-summary-grid">
                <div className="summary-card approved">
                    <h3 className="count">{statusCounts.approved}</h3>
                    <p className="label">Approved</p>
                </div>
                <div className="summary-card pending">
                    <h3 className="count">{statusCounts.pending}</h3>
                    <p className="label">Pending</p>
                </div>
                <div className="summary-card rejected">
                    <h3 className="count">{statusCounts.rejected}</h3>
                    <p className="label">Rejected</p>
                </div>
                <div className="summary-card total">
                    <h3 className="count">{statusCounts.total}</h3>
                    <p className="label">Total</p>
                </div>
            </div>

            <div className="section-card">
                <h4>Recent Responses</h4>
                {activities.length === 0 ? <p>No responses yet.</p> :
                    activities.map(activity => (
                        <div key={activity.id} className="response-item">
                            <div className="response-header">
                                <h5>{activity.activityTitle}</h5>
                                <div className="response-status">
                                    {activity.status === 'approved' && <span className="points">+{activity.pointsAwarded} pts</span>}
                                    <span className={`status-badge ${activity.status.replace(/\s+/g, '-').toLowerCase()}`}>
                                        {activity.status}
                                    </span>
                                </div>
                            </div>
                            <div className="response-body">
                                <p>Reviewed by {mentor ? mentor.fullName : '...'}</p>
                                {activity.status === 'approved' && <p className="feedback">Excellent participation. The certificate and learning outcomes are well-documented.</p>}
                                {activity.status === 'pending' && <p className="feedback">Under review. Please provide additional documentation about your project and role.</p>}
                                {activity.status === 'rejected' && <p className="feedback">The internship certificate provided is not from a recognized organization.</p>}
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    );
};

export default StudentFacultyResponse;

