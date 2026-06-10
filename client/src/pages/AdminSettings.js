import React, { useState, useEffect } from 'react';
import './AdminSettings.css';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, collection, query, where, getDocs } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';

// The master list of all possible branches
const ALL_BRANCHES = [
  "Agricultural Engineering", "Artificial Intelligence", "Artificial Intelligence and Data Science",
  "Artificial Intelligence and Machine Learning", "Aerospace Engineering", "Automobile Engineering",
  "Bio Technology", "Chemical Engineering", "Civil Engineering", "Computer Engineering",
  "Computer Networking", "Computer Science and Biosciences", "Computer Science and Business Systems",
  "Computer Science and Design", "Computer Science and Engineering", "CSE (AI & ML)", "CSE (Big Data Analytics)",
  "CSE (Blockchain)", "CSE (Cloud Computing)", "CSE (Cyber Security)", "CSE (Data Analytics)",
  "CSE (Data Science)", "CSE (DevOps)", "CSE with spl in IOT & Automation",
  "Dairy Technology", "Data Science", "Digital Techniques for Design and Planning",
  "Electronics and Communication Engineering", "ECE (Bio-Medical Engineering)", "ECE (Embedded Systems)",
  "ECE (VLSI Design)", "Electrical and Electronics Engineering", "Environmental Engineering",
  "Food Engineering", "Food Technology", "Information Technology", "Instrumentation Engineering",
  "Internet of Things (IoT)", "Mechanical Engineering", "Mechanical Engineering (Automotive Design)",
  "Mechanical Engineering (Robotics)", "Mechatronics Engineering", "Mining Engineering",
  "Naval Architecture and Marine Engineering", "Petroleum Engineering", "Pharmaceutical Engineering",
  "Quantum Computing", "Robotics", "Software Engineering"
].sort();


// --- Sub-component for "Institution Profile" (Unchanged) ---
const InstitutionProfile = () => {
    const [profile, setProfile] = useState({ institutionName: '', adminName: '', adminEmail: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!auth.currentUser) return;
            const docRef = doc(db, 'colleges', auth.currentUser.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setProfile(docSnap.data());
            }
            setLoading(false);
        };
        fetchProfile();
    }, []);
    
    const handleSave = async () => {
        const docRef = doc(db, 'colleges', auth.currentUser.uid);
        await updateDoc(docRef, { 
            institutionName: profile.institutionName,
            adminName: profile.adminName 
        });
        alert("Profile updated!");
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div>
            <h4>Institution Profile Settings</h4>
            <div className="form-group"><label>Institution Name</label><input value={profile.institutionName || ''} onChange={(e) => setProfile({...profile, institutionName: e.target.value})} /></div>
            <div className="form-group"><label>Administrator Name</label><input value={profile.adminName || ''} onChange={(e) => setProfile({...profile, adminName: e.target.value})} /></div>
            <div className="form-group"><label>Administrator Email (Read-only)</label><input value={profile.adminEmail || ''} readOnly /></div>
            <div className="form-actions"><button onClick={handleSave} className="btn-save">Save Changes</button></div>
        </div>
    );
};

// --- UPDATED Sub-component for "Department Configuration" ---
const DepartmentConfiguration = () => {
    const [currentBranches, setCurrentBranches] = useState([]);
    const [branchToAdd, setBranchToAdd] = useState(''); // State for the selected branch from dropdown
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        if (auth.currentUser) {
            const docRef = doc(db, 'colleges', auth.currentUser.uid);
            const fetchBranches = async () => {
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setCurrentBranches(docSnap.data().branches || []);
                }
                setLoading(false);
            };
            fetchBranches();
        }
    }, []);

    const handleAddBranch = async () => {
        if (branchToAdd) {
            const docRef = doc(db, 'colleges', auth.currentUser.uid);
            await updateDoc(docRef, { branches: arrayUnion(branchToAdd) });
            setCurrentBranches([...currentBranches, branchToAdd]);
            setBranchToAdd(''); // Reset dropdown selection
        }
    };

    const handleDeleteBranch = async (branchToDelete) => {
        if (window.confirm(`Are you sure you want to delete the "${branchToDelete}" department?`)) {
            const docRef = doc(db, 'colleges', auth.currentUser.uid);
            await updateDoc(docRef, { branches: arrayRemove(branchToDelete) });
            setCurrentBranches(currentBranches.filter(b => b !== branchToDelete));
        }
    };

    // Filter the master list to show only branches that haven't been added yet
    const availableBranches = ALL_BRANCHES.filter(b => !currentBranches.includes(b));

    if (loading) return <p>Loading Departments...</p>;
    
    return (
        <div>
            <h4>Department Configuration</h4>
            <p>Manage the list of departments available at your institution.</p>
            <ul className="branch-list">
                {currentBranches.map(branch => (
                    <li key={branch} className="branch-list-item">
                        <span>{branch}</span>
                        <button onClick={() => handleDeleteBranch(branch)} className="btn-delete">
                            <i className="bi bi-trash-fill"></i>
                        </button>
                    </li>
                ))}
            </ul>

            <div className="add-branch-form">
                <select 
                    value={branchToAdd} 
                    onChange={(e) => setBranchToAdd(e.target.value)}
                >
                    <option value="">Select a branch to add...</option>
                    {availableBranches.map(branch => (
                        <option key={branch} value={branch}>{branch}</option>
                    ))}
                </select>
                <button onClick={handleAddBranch} className="btn-save">Add</button>
            </div>
        </div>
    );
};

// --- "Faculty Management" Sub-component (Unchanged) ---
const FacultyManagement = () => {
    const [facultyByDept, setFacultyByDept] = useState({});
    const [expandedDept, setExpandedDept] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (auth.currentUser) {
            const fetchFaculty = async () => {
                const facultyQuery = query(collection(db, "faculty"), where("collegeId", "==", auth.currentUser.uid));
                const facultySnapshot = await getDocs(facultyQuery);
                const facultyList = facultySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                const grouped = facultyList.reduce((acc, faculty) => {
                    const dept = faculty.department || 'Unassigned';
                    if (!acc[dept]) acc[dept] = [];
                    acc[dept].push(faculty);
                    return acc;
                }, {});
                setFacultyByDept(grouped);
                setLoading(false);
            };
            fetchFaculty();
        }
    }, []);

    const handleRemoveFaculty = async (facultyId) => {
        if (window.confirm("Are you sure? This will permanently delete the faculty member.")) {
            try {
                const functions = getFunctions();
                const deleteFacultyUser = httpsCallable(functions, 'deleteFacultyUser');
                await deleteFacultyUser({ facultyId });
                
                const updatedFacultyByDept = { ...facultyByDept };
                Object.keys(updatedFacultyByDept).forEach(dept => {
                    updatedFacultyByDept[dept] = updatedFacultyByDept[dept].filter(f => f.id !== facultyId);
                    if (updatedFacultyByDept[dept].length === 0) {
                        delete updatedFacultyByDept[dept];
                    }
                });
                setFacultyByDept(updatedFacultyByDept);
                alert("Faculty member deleted.");
            } catch (error) {
                alert("Failed to delete faculty member.");
                console.error(error);
            }
        }
    };

    if (loading) return <p>Loading faculty data...</p>;

    return (
        <div>
            <h4>Faculty Management</h4>
            {Object.keys(facultyByDept).length === 0 ? <p>No faculty members found.</p> :
            Object.entries(facultyByDept).map(([dept, facultyList]) => (
                <div key={dept}>
                    <div className="department-summary-card">
                        <div><h5>{dept}</h5><p>{facultyList.length} Faculty Member(s)</p></div>
                        <button className="btn-view-info" onClick={() => setExpandedDept(expandedDept === dept ? null : dept)}>
                            {expandedDept === dept ? 'Hide Info' : 'View Info'}
                        </button>
                    </div>
                    {expandedDept === dept && (
                        <table className="faculty-details-table">
                            <thead><tr><th>Name</th><th>Email</th><th>Action</th></tr></thead>
                            <tbody>
                                {facultyList.map(faculty => (
                                    <tr key={faculty.id}>
                                        <td>{faculty.fullName}</td>
                                        <td>{faculty.email}</td>
                                        <td><button className="btn-remove" onClick={() => handleRemoveFaculty(faculty.id)}>Remove</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            ))}
        </div>
    );
};

// --- Placeholder for "Activity Point System" ---
const PlaceholderContent = ({ title }) => (
    <div>
        <h4>{title}</h4>
        <p>System-wide configuration options for this section will be implemented here.</p>
    </div>
);

// --- Main AdminSettings Component ---
const AdminSettings = () => {
    const [activeTab, setActiveTab] = useState('profile');

    const renderContent = () => {
        switch (activeTab) {
            case 'profile': return <InstitutionProfile />;
            case 'department': return <DepartmentConfiguration />;
            case 'user': return <FacultyManagement />;
            case 'points': return <PlaceholderContent title="Activity Point System" />;
            default: return <InstitutionProfile />;
        }
    };

    return (
        <div>
            <div className="settings-banner">
                <h3>Admin Settings</h3>
                <p>Configure institutional settings and preferences</p>
            </div>
            <div className="settings-layout">
                <div className="settings-submenu">
                    <button onClick={() => setActiveTab('profile')} className={`submenu-item ${activeTab === 'profile' ? 'active' : ''}`}><i className="bi bi-bank2"></i> Institution Profile</button>
                    <button onClick={() => setActiveTab('department')} className={`submenu-item ${activeTab === 'department' ? 'active' : ''}`}><i className="bi bi-building"></i> Department Config</button>
                    <button onClick={() => setActiveTab('user')} className={`submenu-item ${activeTab === 'user' ? 'active' : ''}`}><i className="bi bi-people-fill"></i> Faculty Management</button>
                    <button onClick={() => setActiveTab('points')} className={`submenu-item ${activeTab === 'points' ? 'active' : ''}`}><i className="bi bi-award-fill"></i> Activity Point System</button>
                </div>
                <div className="settings-content">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;