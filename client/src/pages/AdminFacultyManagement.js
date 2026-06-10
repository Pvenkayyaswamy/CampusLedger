import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';
import './AdminFacultyManagement.css';

const AdminFacultyManagement = () => {
    const [facultyByDept, setFacultyByDept] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedDept, setSelectedDept] = useState(null);

    useEffect(() => {
        const fetchFaculty = async () => {
            setLoading(true);
            try {
                const q = query(collection(db, "users"), where("role", "==", "faculty"));
                const querySnapshot = await getDocs(q);
                
                const groupedFaculty = {};
                querySnapshot.forEach((doc) => {
                    const facultyData = { id: doc.id, ...doc.data() };
                    const department = facultyData.department || 'Unassigned';

                    if (!groupedFaculty[department]) {
                        groupedFaculty[department] = [];
                    }
                    groupedFaculty[department].push(facultyData);
                });

                setFacultyByDept(groupedFaculty);
            } catch (error) {
                console.error("Error fetching faculty: ", error);
            }
            setLoading(false);
        };

        fetchFaculty();
    }, []);

    const handleRemoveFaculty = async (facultyId) => {
        if (window.confirm("Are you sure you want to remove this faculty member? This action cannot be undone.")) {
            try {
                await deleteDoc(doc(db, "users", facultyId));
                // Refresh the data after deletion
                const updatedFacultyInDept = facultyByDept[selectedDept].filter(f => f.id !== facultyId);
                const updatedFacultyByDept = { ...facultyByDept, [selectedDept]: updatedFacultyInDept };
                
                // If the department becomes empty after removal, remove it from the list
                if (updatedFacultyInDept.length === 0) {
                    delete updatedFacultyByDept[selectedDept];
                    setSelectedDept(null); // Go back to the main view
                }
                
                setFacultyByDept(updatedFacultyByDept);
                alert("Faculty member removed successfully.");
            } catch (error) {
                console.error("Error removing faculty member: ", error);
                alert("Failed to remove faculty member.");
            }
        }
    };


    if (loading) {
        return <div>Loading faculty data...</div>;
    }

    // Render the detailed view for a selected department
    if (selectedDept) {
        const facultyList = facultyByDept[selectedDept] || [];
        return (
            <div className="faculty-management-container faculty-details-view">
                <button onClick={() => setSelectedDept(null)} className="back-btn">
                    <i className="fas fa-arrow-left"></i> Back to Departments
                </button>
                <div className="faculty-list-card">
                    <h3 className="faculty-list-header">Faculty in {selectedDept}</h3>
                    {facultyList.length > 0 ? (
                        <ul className="faculty-list">
                            {facultyList.map(faculty => (
                                <li key={faculty.id} className="faculty-item">
                                    <div className="faculty-item-info">
                                        <span className="name">{faculty.name}</span>
                                        <span className="email">{faculty.email}</span>
                                    </div>
                                    <button onClick={() => handleRemoveFaculty(faculty.id)} className="remove-faculty-btn">
                                        Remove
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No faculty found in this department.</p>
                    )}
                </div>
            </div>
        );
    }
    
    // Render the summary view of all departments
    return (
        <div className="faculty-management-container">
            <div className="page-header">
                <h2>Faculty Management</h2>
                <p>Oversee and manage faculty members across all departments.</p>
            </div>

            {Object.keys(facultyByDept).length > 0 ? (
                <div className="department-grid">
                    {Object.keys(facultyByDept).sort().map(dept => (
                        <div key={dept} className="department-card">
                            <div className="department-card-header">
                                <div className="department-info">
                                    <h3>{dept}</h3>
                                    <p>{facultyByDept[dept].length} <span>Faculty Members</span></p>
                                </div>
                                <i className="fas fa-chalkboard-teacher icon"></i>
                            </div>
                            <button onClick={() => setSelectedDept(dept)} className="view-info-btn">
                                View Info
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="no-data-placeholder">
                    <p>No faculty members found in the system.</p>
                </div>
            )}
        </div>
    );
};

export default AdminFacultyManagement;