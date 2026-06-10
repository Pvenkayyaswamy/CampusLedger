import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom'; // Import useOutletContext
import './StudentLMSIntegration.css';
import { auth } from '../firebase';

const StudentLMSIntegration = () => {
    // Get the lmsData and the function to update it from the parent layout
    const { lmsData, setLmsData } = useOutletContext(); 
    const [loading, setLoading] = useState(false);

    const handleLinkLMS = async () => {
        setLoading(true);
        try {
            if (auth.currentUser) {
                const studentEmail = auth.currentUser.email;
                const response = await fetch(`https://campusledger-wcgr.onrender.com/api/lms/get-data/${studentEmail}`);
                
                if (!response.ok) {
                    alert("Could not find your records in the mock LMS system.");
                    setLoading(false);
                    return;
                }
                const data = await response.json();
                // Update the state in the PARENT component
                setLmsData(data); 
            }
        } catch (error) {
            console.error("Failed to link LMS account:", error);
            alert("An error occurred. Make sure your backend server is running.");
        }
        setLoading(false);
    };

    // The page now decides what to show based on whether lmsData exists
    const isLinked = lmsData !== null; 

    return (
        <div>
            <div className="lms-banner">
                <h3>LMS Integration</h3>
                <p>Connect your account to the institution's Learning Management System.</p>
            </div>

            {isLinked ? (
                <>
                    <div className="lms-data-grid">
                        <div className="lms-data-card"><h5>Overall Attendance</h5><p>{lmsData?.overallAttendance || 'N/A'}</p></div>
                        <div className="lms-data-card"><h5>Overall CGPA</h5><p>{lmsData?.overallCGPA || 'N/A'}</p></div>
                        <div className="lms-data-card"><h5>Upcoming Assignments</h5><p>{lmsData?.upcomingAssignments || 0}</p></div>
                    </div>
                    <div className="semester-table-container">
                        <h4>Semester-wise Performance</h4>
                        <table className="semester-table">
                            <thead><tr><th>Semester</th><th>SGPA</th><th>Subjects</th></tr></thead>
                            <tbody>
                                {(lmsData?.semesters || []).map(sem => (
                                    <tr key={sem.sem}>
                                        <td>Semester {sem.sem}</td>
                                        <td>{sem.sgpa}</td>
                                        <td>{sem.subjects.join(', ')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <div className="lms-container">
                    <h4>Link Your LMS Account</h4>
                    <p>By linking your account, you can automatically sync your academic data.</p>
                    <button onClick={handleLinkLMS} className="btn-lms-link" disabled={loading}>
                        {loading ? 'Linking...' : 'Link My LMS Account'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default StudentLMSIntegration;