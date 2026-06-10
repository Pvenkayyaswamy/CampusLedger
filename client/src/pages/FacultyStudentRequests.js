import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, doc, runTransaction } from 'firebase/firestore';
import './FacultyRequests.css';

const FacultyStudentRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [points, setPoints] = useState({}); // To hold points for each request

    useEffect(() => {
        if (auth.currentUser) {
            const fetchRequests = async () => {
                setLoading(true);
                try {
                    const requestsCollection = collection(db, "certificateApprovalRequests");
                    const q = query(
                        requestsCollection,
                        where("status", "==", "pending"),
                        where("mentorId", "==", auth.currentUser.uid)
                    );
                    const querySnapshot = await getDocs(q);
                    const requestsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setRequests(requestsList);
                } catch (error) {
                    console.error("Error fetching certificate requests:", error);
                }
                setLoading(false);
            };
            fetchRequests();
        }
    }, []);

    const handlePointsChange = (requestId, value) => {
        setPoints(prev => ({ ...prev, [requestId]: Number(value) }));
    };

    const handleApprove = async (requestId, studentId) => {
        const awardedPoints = points[requestId];
        if (!awardedPoints || awardedPoints < 1 || awardedPoints > 10) {
            alert("Please enter a point value between 1 and 10.");
            return;
        }

        const requestDocRef = doc(db, "certificateApprovalRequests", requestId);
        const studentDocRef = doc(db, "students", studentId);

        try {
            // Use a transaction to update both documents safely
            await runTransaction(db, async (transaction) => {
                const studentDoc = await transaction.get(studentDocRef);
                if (!studentDoc.exists()) {
                    throw new Error("Student document does not exist!");
                }

                const newTotalPoints = (studentDoc.data().totalPoints || 0) + awardedPoints;
                
                // 1. Update the student's total points
                transaction.update(studentDocRef, { totalPoints: newTotalPoints });

                // 2. Update the certificate request status and points
                transaction.update(requestDocRef, { 
                    status: "approved",
                    pointsAwarded: awardedPoints
                });
            });

            setRequests(requests.filter(req => req.id !== requestId));
            alert("Certificate approved!");
        } catch (e) {
            console.error("Transaction failed: ", e);
            alert("Failed to approve certificate.");
        }
    };

    const handleReject = async (requestId) => {
        const requestDocRef = doc(db, "certificateApprovalRequests", requestId);
        await runTransaction(db, async (transaction) => {
            transaction.update(requestDocRef, { status: "rejected" });
        });
        setRequests(requests.filter(req => req.id !== requestId));
        alert("Certificate rejected.");
    };

    if (loading) return <p>Loading certificate requests...</p>;

    return (
        <div>
            <h2>Student Certificate Requests</h2>
            <p>Review and approve certificate uploads from your students.</p>
            {requests.length === 0 ? (
                <div className="request-item"><p>No pending certificate requests found.</p></div>
            ) : (
                requests.map(req => (
                    <div key={req.id} className="request-item">
                        <div className="request-header"><h4>{req.activityTitle}</h4></div>
                        <p>Student: {req.studentName} | Type: {req.activityType}</p>
                        <div className="request-actions">
                            <input
                                type="number"
                                min="1"
                                max="10"
                                placeholder="Points (1-10)"
                                onChange={(e) => handlePointsChange(req.id, e.target.value)}
                                style={{width: '120px', marginRight: '10px', padding: '6px'}}
                            />
                            <button className="btn-approve" onClick={() => handleApprove(req.id, req.studentId)}>Approve</button>
                            <button className="btn-reject" onClick={() => handleReject(req.id)}>Reject</button>
                            <a href={req.fileURL} target="_blank" rel="noopener noreferrer" className="btn-details">View Certificate</a>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default FacultyStudentRequests;