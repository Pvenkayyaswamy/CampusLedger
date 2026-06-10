import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import './FacultyPerformance.css';

const FacultyPerformance = () => {
    const [performanceData, setPerformanceData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (auth.currentUser) {


               const fetchData = async () => {
    setLoading(true);
    try {
        // 1. Get faculty profile
        const facultyDocRef = doc(db, 'faculty', auth.currentUser.uid);
        const facultyDoc = await getDoc(facultyDocRef);
        if (!facultyDoc.exists()) throw new Error("Faculty profile not found");

        const facultyDept = facultyDoc.data().department;
        const facultyCollegeId = facultyDoc.data().collegeId;

        // 2. Get students in department
        const studentsQuery = query(
            collection(db, "students"),
            where("collegeId", "==", facultyCollegeId),
            where("branch", "==", facultyDept)
        );
        const studentSnapshot = await getDocs(studentsQuery);
        const studentDocs = studentSnapshot.docs;
        const studentsInDept = studentDocs.map(doc => ({ id: doc.id, ...doc.data() }));

        // 3. Build year-wise structure
        let totalPoints = 0;
        const studentsByYear = {};
        const studentIdToYear = {};

        studentsInDept.forEach(student => {
            const year = student.year || "Unassigned";
            const points = student.totalPoints || 0;

            totalPoints += points;

            if (!studentsByYear[year]) {
                studentsByYear[year] = {
                    studentCount: 0,
                    totalPoints: 0,
                    activityCount: 0
                };
            }

            studentsByYear[year].studentCount++;
            studentsByYear[year].totalPoints += points;

            // Map student ID to year
            studentIdToYear[student.id] = year;
        });

        // 4. Fetch approved activities for these students
        const studentIds = studentsInDept.map(s => s.id);
        let approvedActivities = [];

        // Firebase "in" queries can only take up to 10 items
        const chunk = (arr, size) => arr.length <= size ? [arr] : arr.reduce((acc, _, i) => {
            if (i % size === 0) acc.push(arr.slice(i, i + size));
            return acc;
        }, []);

        const chunks = chunk(studentIds, 10);
        for (const group of chunks) {
            const activitiesQuery = query(
                collection(db, "certificateApprovalRequests"),
                where("status", "==", "approved"),
                where("studentId", "in", group)
            );
            const activitySnapshot = await getDocs(activitiesQuery);
            approvedActivities.push(...activitySnapshot.docs.map(doc => doc.data()));
        }

        // 5. Add activity counts to year stats
        approvedActivities.forEach(activity => {
            const studentId = activity.studentId;
            const year = studentIdToYear[studentId] || "Unassigned";

            if (studentsByYear[year]) {
                studentsByYear[year].activityCount++;
            }
        });

        // 6. Format the result
        const formattedYearData = Object.entries(studentsByYear).map(([year, stats]) => ({
            year,
            ...stats,
            avgPoints: stats.studentCount > 0 ? (stats.totalPoints / stats.studentCount).toFixed(1) : "0.0"
        }));

        setPerformanceData({
            departmentName: facultyDept,
            totalStudents: studentsInDept.length,
            totalPoints,
            avgPoints: studentsInDept.length > 0 ? (totalPoints / studentsInDept.length).toFixed(1) : "0.0",
            yearWise: formattedYearData,
        });

    } catch (error) {
        console.error("Error fetching performance data:", error);
    }
    setLoading(false);
};



            // const fetchData = async () => {
            //     setLoading(true);
            //     try {
            //         // 1. Get current faculty's profile to find their department
            //         const facultyDocRef = doc(db, 'faculty', auth.currentUser.uid);
            //         const facultyDoc = await getDoc(facultyDocRef);
            //         if (!facultyDoc.exists()) throw new Error("Faculty profile not found");
                    
            //         const facultyDept = facultyDoc.data().department;

            //         // 2. Get all students ONLY from that specific department
            //         const studentsQuery = query(
            //             collection(db, "students"),
            //             where("collegeId", "==", facultyDoc.data().collegeId),
            //             where("branch", "==", facultyDept)
            //         );
            //         const studentSnapshot = await getDocs(studentsQuery);
            //         const studentsInDept = studentSnapshot.docs.map(d => d.data());

            //         // 3. Process data for the department
            //         let totalPoints = 0;
            //         let totalActivities = 0; // Placeholder for now
            //         const studentsByYear = {};

            //         studentsInDept.forEach(student => {
            //             totalPoints += student.totalPoints || 0;
            //             const year = student.year || "Unassigned";
            //             if (!studentsByYear[year]) {
            //                 studentsByYear[year] = { studentCount: 0, totalPoints: 0, activityCount: 0 };
            //             }
            //             studentsByYear[year].studentCount++;
            //             studentsByYear[year].totalPoints += student.totalPoints || 0;
            //         });
                    
            //         const formattedYearData = Object.entries(studentsByYear).map(([year, stats]) => ({
            //             year,
            //             ...stats,
            //             avgPoints: stats.studentCount > 0 ? (stats.totalPoints / stats.studentCount).toFixed(1) : 0,
            //         }));

            //         setPerformanceData({
            //             departmentName: facultyDept,
            //             totalStudents: studentsInDept.length,
            //             totalPoints,
            //             avgPoints: studentsInDept.length > 0 ? (totalPoints / studentsInDept.length).toFixed(1) : 0,
            //             yearWise: formattedYearData,
            //         });

            //     } catch (error) {
            //         console.error("Error fetching performance data:", error);
            //     }
            //     setLoading(false);
            // };
            fetchData();
        }
    }, []);

    if (loading) return <p>Loading department performance...</p>;

    return (
        <div>
            {/* <div className="page-header">
                <h2>Department Performance</h2>
                <p>Analyze student performance and analytics for your department.</p>
            </div> */}

            <div className="performance-banner">
                <h3>Department Performance</h3>
                <p>Analyze department-wide student performance and analytics</p>
            </div>

            { !performanceData || performanceData.totalStudents === 0 ? (
                <div className="department-summary-card">
                    <p>No student data available to generate performance metrics for your department.</p>
                </div>
            ) : (
                <>
                    <div className="department-summary-card">
                        <div>
                            <h4>{performanceData.departmentName}</h4>
                            <div className="summary-stats-grid">
                                <div className="summary-stat-item">
                                    <p>Total Students</p>
                                    <h5>{performanceData.totalStudents}</h5>
                                </div>
                                <div className="summary-stat-item">
                                    <p>Total Points</p>
                                    <h5>{performanceData.totalPoints}</h5>
                                </div>
                                <div className="summary-stat-item">
                                    <p>Average Points</p>
                                    <h5>{performanceData.avgPoints}</h5>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="year-wise-grid">
                        {performanceData.yearWise.map(data => (
                            <div key={data.year} className="year-card">
                                <h5>{data.year} Year</h5>
                                <ul>
                                    <li><span>Students</span> <span>{data.studentCount}</span></li>
                                    <li><span>Avg. Points</span> <span>{data.avgPoints}</span></li>
                                    <li><span>Activities</span> <span>{data.activityCount}</span></li>
                                </ul>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default FacultyPerformance;



















// import React, { useState, useEffect } from 'react';
// import { auth, db } from '../firebase';
// import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
// import './FacultyPerformance.css';

// const FacultyPerformance = () => {
//     const [performanceData, setPerformanceData] = useState([]);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         if (auth.currentUser) {
//             const fetchData = async () => {
//                 setLoading(true);
//                 try {
//                     // 1. Get current faculty's collegeId to know which college to query for
//                     const facultyDocRef = doc(db, 'faculty', auth.currentUser.uid);
//                     const facultyDoc = await getDoc(facultyDocRef);
//                     if (!facultyDoc.exists()) throw new Error("Faculty profile not found");
//                     const collegeId = facultyDoc.data().collegeId;

//                     // 2. Get all students from that college
//                     const studentsQuery = query(collection(db, "students"), where("collegeId", "==", collegeId));
//                     const studentSnapshot = await getDocs(studentsQuery);
//                     const students = studentSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

//                     // 3. Get all approved activities submitted by students of that college
//                     const studentIds = students.map(s => s.id);
//                     let activities = [];
//                     if (studentIds.length > 0) {
//                         const activitiesQuery = query(
//                             collection(db, "certificateApprovalRequests"), 
//                             where("status", "==", "approved"),
//                             where("studentId", "in", studentIds)
//                         );
//                         const activitySnapshot = await getDocs(activitiesQuery);
//                         activities = activitySnapshot.docs.map(d => d.data());
//                     }

//                     // 4. Group students and activities by department (branch)
//                     const departmentStats = {};
//                     students.forEach(student => {
//                         const dept = student.branch || "Unassigned";
//                         if (!departmentStats[dept]) {
//                             departmentStats[dept] = { studentCount: 0, totalPoints: 0, activityCount: 0 };
//                         }
//                         departmentStats[dept].studentCount++;
//                         departmentStats[dept].totalPoints += student.totalPoints || 0;
//                     });
                    
//                     activities.forEach(activity => {
//                         const student = students.find(s => s.id === activity.studentId);
//                         if (student) {
//                             const dept = student.branch || "Unassigned";
//                             if (departmentStats[dept]) {
//                                 departmentStats[dept].activityCount++;
//                             }
//                         }
//                     });

//                     // 5. Format the final data for rendering
//                     const formattedData = Object.entries(departmentStats).map(([name, stats]) => ({
//                         name,
//                         ...stats,
//                         avgPoints: stats.studentCount > 0 ? (stats.totalPoints / stats.studentCount).toFixed(1) : 0,
//                     }));
//                     setPerformanceData(formattedData);

//                 } catch (error) {
//                     console.error("Error fetching performance data:", error);
//                 }
//                 setLoading(false);
//             };
//             fetchData();
//         }
//     }, []);

//     if (loading) return <p>Loading department performance...</p>;

//     return (
//         <div>
//             {/* <div className="page-header">
//                 <h2>Department Performance</h2>
//                 <p>Faculty Portal - Computer Science Engineering</p>
//             </div> */}

//             <div className="performance-banner">
//                 <h3>Department Performance</h3>
//                 <p>Analyze department-wide student performance and analytics</p>
//             </div>

//             <div className="department-list-container">
//                 {performanceData.length === 0 ? (
//                     <p>No student data available to generate performance metrics.</p>
//                 ) : (
//                     performanceData.map(dept => (
//                         <div key={dept.name} className="department-list-item">
//                             <h4 className="department-name">{dept.name}</h4>
//                             <div className="department-stats">
//                                 <div className="stat-item">
//                                     <span>Students:</span>
//                                     <p>{dept.studentCount}</p>
//                                 </div>
//                                 <div className="stat-item">
//                                     <span>Activities:</span>
//                                     <p>{dept.activityCount}</p>
//                                 </div>
//                                 <div className="stat-item">
//                                     <span>Avg Points:</span>
//                                     <p>{dept.avgPoints}</p>
//                                 </div>
//                             </div>
//                             <div className="avg-points-tag">{dept.avgPoints} avg points</div>
//                         </div>
//                     ))
//                 )}
//             </div>
//         </div>
//     );
// };

// export default FacultyPerformance;
