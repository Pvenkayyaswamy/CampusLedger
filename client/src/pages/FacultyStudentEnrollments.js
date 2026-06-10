import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import './FacultyStudentEnrollments.css';

const FacultyStudentEnrollments = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (auth.currentUser) {
            const fetchRequests = async () => {
                setLoading(true);
                try {
                    const requestsCollection = collection(db, "studentApprovalRequests");
                    const q = query(
                        requestsCollection,
                        where("status", "==", "pending"),
                        where("mentorId", "==", auth.currentUser.uid)
                    );
                    const querySnapshot = await getDocs(q);
                    const requestsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setRequests(requestsList);
                } catch (error) {
                    console.error("Error fetching student enrollment requests:", error);
                }
                setLoading(false);
            };
            fetchRequests();
        }
    }, []);

    const handleApprove = async (requestId) => {
        try {
            const functions = getFunctions();
            const approveStudentRequest = httpsCallable(functions, 'approveStudentRequest');
            const result = await approveStudentRequest({ requestId: requestId });
            
            console.log(result.data.message);
            setRequests(requests.filter(req => req.id !== requestId));
            alert("Student enrolled successfully and user created!");
        } catch (error) {
            console.error("Error approving student request:", error);
            alert("Failed to approve request. See console for details.");
        }
    };
    
    const handleReject = async (requestId) => {
        const requestDocRef = doc(db, "studentApprovalRequests", requestId);
        await updateDoc(requestDocRef, { status: "rejected" });
        setRequests(requests.filter(req => req.id !== requestId));
        alert("Student enrollment rejected.");
    };

    if (loading) return <p>Loading enrollment requests...</p>;

    return (
        <div>
            {/* <div className="page-header">
                <h2>Student Enrollments</h2>
                <p>Faculty Portal - Computer Science Engineering</p>
            </div> */}

            <div className="enrollments-banner">
                <h3>Student Enrollments</h3>
                <p>Manage student enrollment requests</p>
            </div>

            <div className="enrollment-list">
                {requests.length === 0 ? (
                    <div className="enrollment-card">
                        <p>Student enrollments management interface will be implemented here.</p>
                    </div>
                ) : (
                    requests.map(req => (
                        <div key={req.id} className="enrollment-card">
                            <div className="enrollment-header">
                                <div className="student-info">
                                    <h4>{req.fullName}</h4>
                                    <p>CSE2024001</p> {/* Placeholder ID */}
                                    <p>{req.email}</p>
                                </div>
                                <span className="new-enrollment-tag">New Enrollment</span>
                            </div>
                            <div className="enrollment-details">
                                <div className="detail-item">
                                    <p>Branch</p>
                                    <h5>{req.branch}</h5>
                                </div>
                                <div className="detail-item">
                                    <p>Year</p>
                                    <h5>{req.year}</h5>
                                </div>
                                <div className="detail-item">
                                    <p>Applied On</p>
                                    <h5>{new Date(req.createdAt?.seconds * 1000).toLocaleDateString()}</h5>
                                </div>
                            </div>
                            <div className="enrollment-actions">
                                <button className="btn-approve" onClick={() => handleApprove(req.id)}>
                                    <i className="bi bi-check-circle"></i> Approve Enrollment
                                </button>
                                <button className="btn-reject" onClick={() => handleReject(req.id)}>
                                    <i className="bi bi-x-circle"></i> Reject
                                </button>
                                {/* CORRECTED: Changed <a> to <button> */}
                                {/* <button className="btn-details">
                                    <i className="bi bi-eye"></i> View Documents
                                </button> */}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default FacultyStudentEnrollments;
