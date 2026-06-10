import React, { useState, useEffect } from 'react';
import './FacultyApprovalHistory.css';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

const FacultyApprovalHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            if (auth.currentUser) {
                setLoading(true);
                try {
                    const requestsCollection = collection(db, "certificateApprovalRequests");
                    // Query for ALL requests belonging to this mentor, sorted by date
                    const q = query(
                        requestsCollection,
                        where("mentorId", "==", auth.currentUser.uid),
                        orderBy("submittedAt", "desc")
                    );
                    const querySnapshot = await getDocs(q);
                    const historyList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setHistory(historyList);
                } catch (error) {
                    console.error("Error fetching approval history:", error);
                }
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    if (loading) return <p>Loading approval history...</p>;

    return (
        <div>
            {/* <div className="page-header">
                <h2>Approval History</h2>
                <p>A log of all past and pending student submissions.</p>
            </div> */}

            <div className="history-banner">
                <h3>All Submissions</h3>
                <p>Review recent, pending, and past student activities</p>
            </div>

            <div className="history-list-container">
                {history.length === 0 ? (
                    <p>No submission history found.</p>
                ) : (
                    history.map(item => (
                        <div key={item.id} className="history-item">
                            <div className={`history-icon ${item.status}`}>
                                <i className={`bi ${item.status === 'approved' ? 'bi-check-lg' : item.status === 'rejected' ? 'bi-x-lg' : 'bi-clock-history'}`}></i>
                            </div>
                            <div className="history-details">
                                <h5>{item.activityTitle}</h5>
                                <p>Student: {item.studentName}</p>
                            </div>
                            <div className="history-meta">
                                {item.status === 'approved' && <p className="history-points">+{item.pointsAwarded} pts</p>}
                                <span className={`history-status ${item.status}`}>{item.status}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default FacultyApprovalHistory;

