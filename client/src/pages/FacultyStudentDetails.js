import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import './FacultyStudentDetails.css';

const FacultyStudentDetails = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (auth.currentUser) {
            const fetchStudents = async () => {
                setLoading(true);
                try {
                    const studentsCollection = collection(db, "students");
                    const q = query(
                        studentsCollection,
                        where("mentorId", "==", auth.currentUser.uid)
                    );
                    const querySnapshot = await getDocs(q);
                    const studentsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setStudents(studentsList);
                } catch (error) {
                    console.error("Error fetching students:", error);
                }
                setLoading(false);
            };
            fetchStudents();
        }
    }, []);

    const handleRemoveStudent = async (studentId) => {
        if (window.confirm("Are you sure you want to remove this student? They will need to select a new mentor.")) {
            try {
                const studentDocRef = doc(db, "students", studentId);
                await updateDoc(studentDocRef, {
                    mentorId: null // Set mentorId to null
                });
                setStudents(students.filter(s => s.id !== studentId)); // Remove from UI
                alert("Student has been removed.");
            } catch (error) {
                console.error("Error removing student: ", error);
                alert("Failed to remove student.");
            }
        }
    };

    if (loading) return <p>Loading student details...</p>;

    return (
        <div>
            {/* <div className="page-header">
                <h2>Student Details</h2>
                <p>Faculty Portal - Computer Science Engineering</p>
            </div> */}

            <div className="details-banner">
                <h3>Student Details</h3>
                <p>View comprehensive student information and performance</p>
            </div>

            <div className="students-table-container">
                {students.length === 0 ? (
                    <p>Student details interface will be implemented here.</p>
                ) : (
                    <table className="students-table">
                        <thead>
                            <tr>
                                <th>Student Name</th>
                                <th>Year</th>
                                <th>Total Points</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(student => (
                                <tr key={student.id}>
                                    <td>
                                        <div className="student-name-cell">
                                            <div className="student-avatar">{student.fullName.charAt(0)}</div>
                                            <div>
                                                <h5>{student.fullName}</h5>
                                                <p>{student.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{student.year}</td>
                                    <td>{student.totalPoints}</td>
                                    <td>
                                        <button className="action-btn">View Profile</button>
                                        <button className="action-btn btn-remove" onClick={() => handleRemoveStudent(student.id)}>Remove</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default FacultyStudentDetails;