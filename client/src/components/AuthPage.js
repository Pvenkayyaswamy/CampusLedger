import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './AuthPage.css';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, getDocs, addDoc, serverTimestamp, query, where, getDoc } from 'firebase/firestore';

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

const validatePassword = (password) => {
    if (password.length < 8) return "Password must be at least 8 characters long.";
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter.";
    if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter.";
    if (!/[0-9]/.test(password)) return "Password must contain at least one number.";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return "Password must contain at least one special character.";
    return "";
};

// --- UPDATED StudentLoginForm ---
// --- UPDATED StudentLoginForm with Role Check ---
const StudentLoginForm = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault(); setLoading(true); setError('');
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Role Verification Step
            const studentDocRef = doc(db, "students", user.uid);
            const studentDoc = await getDoc(studentDocRef);

            if (studentDoc.exists()) {
                navigate('/student/dashboard');
            } else {
                await auth.signOut();
                setError("You do not have permission to access the student portal.");
            }
        } catch (err) {
            if (err.code === 'auth/invalid-credential') {
                setError('Invalid email or password. Please try again.');
            } else {
                setError('Failed to log in. Please try again later.');
            }
        } finally { setLoading(false); }
    };

    return (
        <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group"><label>College Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
            <div className="form-group"><label>Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
            {error && <p className="error-message">{error}</p>}
            <button type="submit" className="submit-btn" disabled={loading}>{loading ? 'Logging in...' : 'Login as Student'}</button>
        </form>
    );
};

// --- UPDATED StudentSignupForm ---
const StudentSignupForm = () => {
    const navigate = useNavigate();
    const [colleges, setColleges] = useState([]);
    const [faculties, setFaculties] = useState([]);
    const [formData, setFormData] = useState({
        fullName: '', email: '', collegeId: '', branch: '', year: '',
        phone: '', mentorId: '', password: '', confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchColleges = async () => {
            const collegesCollection = collection(db, 'colleges');
            const collegeSnapshot = await getDocs(collegesCollection);
            const collegeList = collegeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setColleges(collegeList);
        };
        fetchColleges();
    }, []);

    useEffect(() => {
        if (formData.collegeId) {
            const fetchFaculties = async () => {
                const facultyCollection = collection(db, 'faculty');
                const q = query(facultyCollection, where("collegeId", "==", formData.collegeId));
                const facultySnapshot = await getDocs(q);
                const facultyList = facultySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setFaculties(facultyList);
            };
            fetchFaculties();
        }
    }, [formData.collegeId]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        if (!formData.collegeId || !formData.mentorId) {
            setError('Please select a college and a mentor.');
            setLoading(false);
            return;
        }
        try {
            const requestsCollection = collection(db, 'studentApprovalRequests');
            await addDoc(requestsCollection, {
                fullName: formData.fullName,
                email: formData.email,
                collegeId: formData.collegeId,
                branch: formData.branch,
                year: formData.year,
                phone: formData.phone,
                mentorId: formData.mentorId,
                status: 'pending',
                createdAt: serverTimestamp(),
                password: formData.password,
            });
            alert('Your registration request has been submitted for approval!');
            navigate('/');
        } catch (err) {
            setError("Failed to submit request. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const selectedCollege = colleges.find(c => c.id === formData.collegeId);

    return (
        <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group"><label>Full Name</label><input type="text" id="fullName" value={formData.fullName} onChange={handleChange} required /></div>
            <div className="form-group"><label>College Email</label><input type="email" id="email" value={formData.email} onChange={handleChange} required /></div>
            <div className="form-group">
                <label htmlFor="collegeId">Institution Name</label>
                <select id="collegeId" value={formData.collegeId} onChange={handleChange} required>
                    <option value="">Select your institution</option>
                    {colleges.map(college => (<option key={college.id} value={college.id}>{college.institutionName}</option>))}
                </select>
            </div>
            <div className="form-row">
                <div className="form-group">
                    <label>Branch</label>
                    <select id="branch" value={formData.branch} onChange={handleChange} required disabled={!formData.collegeId}>
                        <option value="">Select a college first</option>
                        {selectedCollege?.branches.map(branch => (<option key={branch} value={branch}>{branch}</option>))}
                    </select>
                </div>
                <div className="form-group"><label>Year</label><select id="year" value={formData.year} onChange={handleChange} required><option value="">Select</option><option>1st</option><option>2nd</option><option>3rd</option><option>4th</option></select></div>
            </div>
            <div className="form-group">
                <label htmlFor="mentorId">Select Mentor</label>
                <select id="mentorId" value={formData.mentorId} onChange={handleChange} required disabled={!formData.collegeId}>
                    <option value="">Select a college first</option>
                    {faculties.map(faculty => (<option key={faculty.id} value={faculty.id}>{faculty.fullName}</option>))}
                </select>
            </div>
            <div className="form-group"><label>Phone Number</label><input type="tel" id="phone" value={formData.phone} onChange={handleChange} required /></div>
            <div className="form-group"><label>Password</label><input type="password" id="password" value={formData.password} onChange={handleChange} required /></div>
            <div className="form-group"><label>Confirm Password</label><input type="password" id="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required /></div>
            {error && <p className="error-message">{error}</p>}
            <button type="submit" className="submit-btn" disabled={loading}>{loading ? 'Submitting...' : 'Request Registration'}</button>
        </form>
    );
};
// --- UPDATED FacultyLoginForm ---
const FacultyLoginForm = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault(); setLoading(true); setError('');
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Role Verification Step
            const facultyDocRef = doc(db, "faculty", user.uid);
            const facultyDoc = await getDoc(facultyDocRef);

            if (facultyDoc.exists()) {
                // User is a faculty member, proceed
                navigate('/faculty/dashboard');
            } else {
                await auth.signOut();
                setError("You do not have permission to access the faculty portal.");
            }
        } catch (err) {
            if (err.code === 'auth/invalid-credential') {
                setError('Invalid email or password. Please try again.');
            } else {
                setError('Failed to log in. Please try again later.');
            }
        } finally { setLoading(false); }
    };

    return (
        <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group"><label>Faculty Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
            <div className="form-group"><label>Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
            {error && <p className="error-message">{error}</p>}
            <button type="submit" className="submit-btn" disabled={loading}>{loading ? 'Logging in...' : 'Login as Faculty'}</button>
        </form>
    );
};


// Find and replace this entire component

const FacultySignupForm = () => {
    const navigate = useNavigate();
    const [colleges, setColleges] = useState([]);
    const [formData, setFormData] = useState({
        fullName: '', email: '', collegeId: '', department: '', designation: '',
        employeeId: '', password: '', confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchColleges = async () => {
            const collegesCollection = collection(db, 'colleges');
            const collegeSnapshot = await getDocs(collegesCollection);
            const collegeList = collegeSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setColleges(collegeList);
        };
        fetchColleges();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.collegeId) { setError('Please select a college.'); setLoading(false); return; }
    const passwordError = validatePassword(formData.password);
    if (passwordError) { setError(passwordError); setLoading(false); return; }
    if (formData.password !== formData.confirmPassword) { setError('password and confirm password should be same'); setLoading(false); return; }

    try {
        const requestsCollection = collection(db, 'facultyApprovalRequests');
        await addDoc(requestsCollection, {
            fullName: formData.fullName,
            email: formData.email,
            collegeId: formData.collegeId,
            institutionName: colleges.find(c => c.id === formData.collegeId).institutionName,
            department: formData.department,
            designation: formData.designation,
            employeeId: formData.employeeId,
            status: 'pending',
            createdAt: serverTimestamp(),
            password: formData.password, // <-- ADD THIS LINE
        });
        alert('Your registration request has been submitted for approval!');
        navigate('/');
    } catch (err) {
        setError("Failed to submit request. Please try again.");
        console.error(err);
    } finally {
        setLoading(false);
    }
};
    // --- LOGIC TO FIND BRANCHES FOR THE SELECTED COLLEGE ---
    const selectedCollege = colleges.find(c => c.id === formData.collegeId);

    return (
        <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group"><label>Full Name</label><input type="text" id="fullName" value={formData.fullName} onChange={handleChange} required /></div>
            <div className="form-group"><label>Faculty Email</label><input type="email" id="email" value={formData.email} onChange={handleChange} required /></div>
            <div className="form-group">
                <label htmlFor="collegeId">Institution Name</label>
                <select id="collegeId" value={formData.collegeId} onChange={handleChange} required>
                    <option value="">Select your institution</option>
                    {colleges.map(college => (<option key={college.id} value={college.id}>{college.institutionName}</option>))}
                </select>
            </div>
            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="department">Department</label>
                    {/* --- UPDATED DEPARTMENT DROPDOWN --- */}
                    <select id="department" value={formData.department} onChange={handleChange} required disabled={!formData.collegeId}>
                        <option value="">{formData.collegeId ? 'Select a department' : 'Select a college first'}</option>
                        {selectedCollege?.branches.map(branch => (
                            <option key={branch} value={branch}>{branch}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group"><label htmlFor="designation">Designation</label><select id="designation" value={formData.designation} onChange={handleChange} required><option value="">Select</option><option>Head Of Department</option><option>Professor</option><option>Associate Professor</option><option>Assistant Professor</option></select></div>
            </div>
            <div className="form-group"><label>Employee ID</label><input type="text" id="employeeId" value={formData.employeeId} onChange={handleChange} required /></div>
            <div className="form-group"><label>Password</label><input type="password" id="password" value={formData.password} onChange={handleChange} required /></div>
            <div className="form-group"><label>Confirm Password</label><input type="password" id="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required /></div>
            {error && <p className="error-message">{error}</p>}
            <button type="submit" className="submit-btn" disabled={loading}>{loading ? 'Submitting...' : 'Request Registration'}</button>
        </form>
    );
};
// --- UPDATED AdminLoginForm ---
const AdminLoginForm = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const handleSubmit = async (e) => {
        e.preventDefault(); setLoading(true); setError('');
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Role Verification Step
            const adminDocRef = doc(db, "colleges", user.uid);
            const adminDoc = await getDoc(adminDocRef);

            if (adminDoc.exists()) {
                // User is an admin, proceed
                navigate('/admin/dashboard');
            } else {
                await auth.signOut();
                setError("You do not have permission to access the admin portal.");
            }
        } catch (err) {
            if (err.code === 'auth/invalid-credential') {
                setError('Invalid email or password. Please try again.');
            } else {
                setError('Failed to log in. Please try again later.');
            }
        } finally { setLoading(false); }
    };

    return (
        <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group"><label>Admin Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
            <div className="form-group"><label>Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
            {/* <div className="form-group"><label>Admin Access Key</label><input type="password" placeholder="Enter admin access key" /></div> */}
            {error && <p className="error-message">{error}</p>}
            <button type="submit" className="submit-btn" disabled={loading}>{loading ? 'Logging in...' : 'Login as Admin'}</button>
        </form>
    );
};

const AdminSignupForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '', email: '', institutionName: '', phone: '',
        branches: [], password: '', confirmPassword: ''
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleBranchChange = (branchName) => {
        const currentBranches = formData.branches;
        const newBranches = currentBranches.includes(branchName)
            ? currentBranches.filter(b => b !== branchName)
            : [...currentBranches, branchName];
        setFormData({ ...formData, branches: newBranches });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        if (formData.branches.length === 0) {
            setError('Please select at least one branch.');
            setLoading(false);
            return;
        }
        const passwordError = validatePassword(formData.password);
        if (passwordError) {
            setError(passwordError); setLoading(false); return;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match!'); setLoading(false); return;
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;
            const collegeDocRef = doc(db, "colleges", user.uid);
            await setDoc(collegeDocRef, {
                adminName: formData.fullName,
                adminEmail: formData.email,
                institutionName: formData.institutionName,
                phone: formData.phone,
                branches: formData.branches,
                adminUid: user.uid
            });
            alert('Admin account created successfully! Redirecting...');
            navigate('/admin/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const filteredBranches = ALL_BRANCHES.filter(branch =>
        branch.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <form className="auth-form" onSubmit={handleSubmit}>
            <p style={{textAlign: 'center', background: '#fff3cd', padding: '10px', borderRadius: '5px'}}>New admin accounts require institutional verification.</p>
            <div className="form-group"><label htmlFor="fullName">Full Name</label><input type="text" id="fullName" value={formData.fullName} onChange={handleChange} placeholder="Dr. Jane Smith" required /></div>
            <div className="form-group"><label htmlFor="email">Official Email</label><input type="email" id="email" value={formData.email} onChange={handleChange} placeholder="admin@college.edu" required /></div>
            <div className="form-group"><label htmlFor="institutionName">Institution Name</label><input type="text" id="institutionName" value={formData.institutionName} onChange={handleChange} placeholder="University/College Name" required /></div>
            <div className="form-group"><label htmlFor="phone">Phone Number</label><input type="tel" id="phone" value={formData.phone} onChange={handleChange} placeholder="Enter your phone" required /></div>
            <div className="form-group">
                <label htmlFor="branches">Branches Offered</label>
                <input type="text" className="branch-search-input" placeholder="Search for a branch..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <div className="branch-list">
                    {filteredBranches.map(branch => (
                        <div key={branch} className="branch-item">
                            <input type="checkbox" id={branch} checked={formData.branches.includes(branch)} onChange={() => handleBranchChange(branch)} />
                            <label htmlFor={branch}>{branch}</label>
                        </div>
                    ))}
                </div>
            </div>
            <div className="form-group"><label htmlFor="password">Password</label><input type="password" id="password" value={formData.password} onChange={handleChange} required /></div>
            <div className="form-group"><label htmlFor="confirmPassword">Confirm Password</label><input type="password" id="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required /></div>
            {error && <p className="error-message">{error}</p>}
            <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Admin Account'}
            </button>
        </form>
    );
};

const AuthPage = () => {
  const { role } = useParams();
  const [activeTab, setActiveTab] = useState('login');

  const roleConfig = {
    student: { icon: 'bi-person-fill', title: 'Student Portal', subtitle: 'Build your comprehensive digital portfolio', LoginForm: <StudentLoginForm />, SignupForm: <StudentSignupForm />, loginTab: 'Login', signupTab: 'Sign Up' },
    faculty: { icon: 'bi-people-fill', title: 'Faculty Portal', subtitle: 'Guide and approve student achievements', LoginForm: <FacultyLoginForm />, SignupForm: <FacultySignupForm />, loginTab: 'Login', signupTab: 'Sign Up' },
    admin: { icon: 'bi-building-fill', title: 'Admin Portal', subtitle: 'Manage institutional operations', LoginForm: <AdminLoginForm />, SignupForm: <AdminSignupForm />, loginTab: 'Login', signupTab: 'Register' }
  };

  const config = roleConfig[role] || roleConfig.student;

  return (
    <div className="auth-container">
      <Link to="/" className="back-to-home"><i className="bi bi-arrow-left"></i> Back to Home</Link>
      <div className="auth-card">
        <div className="auth-header"><i className={`bi ${config.icon}`}></i><h1>{config.title}</h1><p>{config.subtitle}</p></div>
        <div className="auth-tabs">
          <button className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`} onClick={() => setActiveTab('login')}>{config.loginTab}</button>
          <button className={`auth-tab ${activeTab === 'signup' ? 'active' : ''}`} onClick={() => setActiveTab('signup')}>{config.signupTab}</button>
        </div>
        {activeTab === 'login' ? config.LoginForm : config.SignupForm}
        {/* <div className="auth-footer">By continuing, you agree to our terms of service and privacy policy.</div> */}
      </div>
    </div>
  );
};

export default AuthPage;