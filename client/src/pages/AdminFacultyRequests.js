import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import './AdminFacultyRequests.css';

const AdminFacultyRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRequests = async () => {
            setLoading(true);
            try {
                // We need to fetch requests for the admin's specific college
                // For now, we fetch all pending requests. We'll add the filter later.
                const requestsCollection = collection(db, "facultyApprovalRequests");
                const q = query(requestsCollection, where("status", "==", "pending"));
                const querySnapshot = await getDocs(q);
                const requestsList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setRequests(requestsList);
            } catch (error) {
                console.error("Error fetching requests:", error);
            }
            setLoading(false);
        };

        fetchRequests();
    }, []);

    const handleApprove = async (requestId) => {
        try {
            const functions = getFunctions();
            const approveFacultyRequest = httpsCallable(functions, 'approveFacultyRequest');
            const result = await approveFacultyRequest({ requestId: requestId });
            
            console.log(result.data.message);
            setRequests(requests.filter(req => req.id !== requestId));
            alert("Faculty request approved and user created!");
        } catch (error) {
            console.error("Error approving request:", error);
            alert("Failed to approve request. See console for details.");
        }
    };

    const handleReject = async (requestId) => {
        const requestDocRef = doc(db, "facultyApprovalRequests", requestId);
        try {
            await updateDoc(requestDocRef, { status: "rejected" });
            setRequests(requests.filter(req => req.id !== requestId));
            alert("Faculty request rejected.");
        } catch (error) {
            console.error("Error rejecting request:", error);
            alert("Failed to reject request.");
        }
    };

    if (loading) {
        return <p>Loading requests...</p>;
    }

    return (
        <div>
            {/* <div className="page-header">
                <h2>Institute Faculty</h2>
                <p>Manage faculty members and their access permissions</p>
            </div> */}

            <div className="requests-banner">
                <h3>Institute Faculty</h3>
                <p>Manage faculty members and their access permissions</p>
            </div>

            <div className="requests-container">
                {requests.length === 0 ? (
                    <p>No pending requests found.</p>
                ) : (
                    requests.map(req => (
                        <div key={req.id} className="request-card">
                            <div className="request-details">
                                <h4>{req.fullName}</h4>
                                <p><strong>Email:</strong> {req.email} | <strong>Department:</strong> {req.department}</p>
                            </div>
                            <div className="request-actions">
                                <button className="btn-approve" onClick={() => handleApprove(req.id)}>Approve</button>
                                <button className="btn-reject" onClick={() => handleReject(req.id)}>Reject</button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminFacultyRequests;





















// import React, { useState, useEffect } from 'react';
// import { db } from '../firebase';
// import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
// import { getFunctions, httpsCallable } from 'firebase/functions';
// import './AdminFacultyRequests.css';

// const AdminFacultyRequests = () => {
//     const [requests, setRequests] = useState([]);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         const fetchRequests = async () => {
//             setLoading(true);
//             try {
//                 const requestsCollection = collection(db, "facultyApprovalRequests");
//                 const q = query(requestsCollection, where("status", "==", "pending"));
//                 const querySnapshot = await getDocs(q);
//                 const requestsList = querySnapshot.docs.map(doc => ({
//                     id: doc.id,
//                     ...doc.data()
//                 }));
//                 setRequests(requestsList);
//             } catch (error) {
//                 console.error("Error fetching requests:", error);
//             }
//             setLoading(false);
//         };

//         fetchRequests();
//     }, []);

//     const handleApprove = async (requestId) => {
//         console.log("Frontend: Attempting to approve with ID:", requestId); // <-- ADD THIS LINE
//         try {
//             const functions = getFunctions();
//             const approveFacultyRequest = httpsCallable(functions, 'approveFacultyRequest');
            
//             // This is the important part: we send an object with a 'requestId' key
//             const result = await approveFacultyRequest({ requestId: requestId });
            
//             console.log(result.data.message);
//             setRequests(requests.filter(req => req.id !== requestId)); // Update UI
//             alert("Faculty request approved and user created!");

//         } catch (error) {
//             console.error("Error approving request:", error);
//             alert("Failed to approve request. See browser console for details.");
//         }
//     };

//     const handleReject = async (requestId) => {
//         const requestDocRef = doc(db, "facultyApprovalRequests", requestId);
//         try {
//             await updateDoc(requestDocRef, { status: "rejected" });
//             setRequests(requests.filter(req => req.id !== requestId));
//             alert("Faculty request rejected.");
//         } catch (error) {
//             console.error("Error rejecting request:", error);
//             alert("Failed to reject request.");
//         }
//     };

//     if (loading) {
//         return <p>Loading requests...</p>;
//     }

//     return (
//         <div>
//             <h2>Faculty Enrollment Requests</h2>
//             <p>Review and approve new faculty registrations for your institution.</p>
//             <div className="requests-container">
//                 {requests.length === 0 ? (
//                     <p>No pending requests found.</p>
//                 ) : (
//                     <table className="requests-table">
//                         <thead>
//                             <tr>
//                                 <th>Full Name</th>
//                                 <th>Email</th>
//                                 <th>Department</th>
//                                 <th>Actions</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {requests.map(req => (
//                                 <tr key={req.id}>
//                                     <td>{req.fullName}</td>
//                                     <td>{req.email}</td>
//                                     <td>{req.department}</td>
//                                     <td className="action-buttons">
//                                         <button className="btn-approve" onClick={() => handleApprove(req.id)}>Approve</button>
//                                         <button className="btn-reject" onClick={() => handleReject(req.id)}>Reject</button>
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default AdminFacultyRequests;