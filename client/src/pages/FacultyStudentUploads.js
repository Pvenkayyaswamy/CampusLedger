import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, doc, runTransaction } from 'firebase/firestore';
import './FacultyStudentUploads.css';

const FacultyStudentUploads = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [points, setPoints] = useState({});

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
            await runTransaction(db, async (transaction) => {
                const studentDoc = await transaction.get(studentDocRef);
                if (!studentDoc.exists()) {
                    throw new Error("Student document does not exist!");
                }
                const newTotalPoints = (studentDoc.data().totalPoints || 0) + awardedPoints;
                transaction.update(studentDocRef, { totalPoints: newTotalPoints });
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

    if (loading) return <p>Loading requests...</p>;

    return (
        <div>
            {/* <div className="page-header">
                <h2>Student Uploads</h2>
                <p>Faculty Portal - Computer Science Engineering</p>
            </div> */}

            <div className="uploads-banner">
                <h3>Student Uploads</h3>
                <p>Review and approve student activity submissions</p>
            </div>

            <div className="requests-list">
                {requests.length === 0 ? (
                    <div className="request-card">
                        <p>Student uploads management interface will be implemented here.</p>
                    </div>
                ) : (
                    requests.map(req => (
                        <div key={req.id} className="request-card">
                            <div className="request-card-header">
                                <h4>{req.studentName}</h4>
                                <p>{req.activityTitle} - Submitted on {new Date(req.submittedAt?.seconds * 1000).toLocaleDateString()}</p>
                            </div>
                            <div className="request-card-body">
                                <p>Attended 3-day workshop on Machine Learning fundamentals.</p>
                            </div>
                            <div className="request-actions">
                                <input
                                    type="number"
                                    min="1" max="10"
                                    placeholder="Points"
                                    onChange={(e) => handlePointsChange(req.id, e.target.value)}
                                />
                                <button className="btn-approve" onClick={() => handleApprove(req.id, req.studentId)}>
                                    <i className="bi bi-check-circle"></i> Approve
                                </button>
                                <button className="btn-reject" onClick={() => handleReject(req.id)}>
                                    <i className="bi bi-x-circle"></i> Reject
                                </button>
                                <a href={req.fileURL} target="_blank" rel="noopener noreferrer" className="btn-details">
                                    <i className="bi bi-eye"></i> View Details
                                </a>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default FacultyStudentUploads;