import React, { useState, useEffect } from 'react';
import './FacultySettings.css';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';

// --- Sub-component for the "Edit Profile" Tab ---
const UpdateProfileForm = () => {
    const [facultyData, setFacultyData] = useState({ fullName: '', phone: '', bio: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFacultyData = async () => {
            const facultyDocRef = doc(db, 'faculty', auth.currentUser.uid);
            const facultyDoc = await getDoc(facultyDocRef);
            if (facultyDoc.exists()) {
                setFacultyData(facultyDoc.data());
            }
            setLoading(false);
        };
        if (auth.currentUser) {
            fetchFacultyData();
        }
    }, []);

    const handleChange = (e) => {
        setFacultyData({ ...facultyData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        const facultyDocRef = doc(db, 'faculty', auth.currentUser.uid);
        try {
            await updateDoc(facultyDocRef, {
                fullName: facultyData.fullName,
                phone: facultyData.phone,
                bio: facultyData.bio
            });
            alert("Profile updated successfully!");
        } catch (error) {
            alert("Error updating profile.");
            console.error(error);
        }
    };

    if (loading) return <p>Loading profile...</p>;

    return (
        <div>
            <h4>Edit Profile</h4>
            <div className="form-group">
                <label>Full Name</label>
                <input name="fullName" value={facultyData.fullName || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>Phone Number</label>
                <input name="phone" value={facultyData.phone || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>Bio</label>
                <textarea name="bio" rows="4" value={facultyData.bio || ''} onChange={handleChange}></textarea>
            </div>
            <div className="form-group">
                <label>Email (Read-only)</label>
                <input value={auth.currentUser.email} readOnly />
            </div>
            <div className="form-actions">
                <button onClick={handleSave} className="btn-save">Save Changes</button>
            </div>
        </div>
    );
};

// --- Sub-component for the "Change Password" Tab ---
const ChangePasswordForm = () => {
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    const handleUpdatePassword = async () => {
        setError('');
        if (passwords.new !== passwords.confirm) {
            setError("New passwords do not match.");
            return;
        }
        try {
            const user = auth.currentUser;
            const credential = EmailAuthProvider.credential(user.email, passwords.current);
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, passwords.new);
            alert("Password updated successfully!");
        } catch (error) {
            setError("Failed to update password. Check if your current password is correct.");
            console.error(error);
        }
    };

    return (
        <div>
            <h4>Change Password</h4>
            <div className="form-group">
                <label>Current Password</label>
                <input name="current" type="password" value={passwords.current} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>New Password</label>
                <input name="new" type="password" value={passwords.new} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>Confirm New Password</label>
                <input name="confirm" type="password" value={passwords.confirm} onChange={handleChange} />
            </div>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div className="form-actions">
                <button onClick={handleUpdatePassword} className="btn-save">Update Password</button>
            </div>
        </div>
    );
};

// --- Placeholder for other tabs ---
const PlaceholderContent = ({ title }) => (
    <div>
        <h4>{title}</h4>
        <p>This section will be implemented soon.</p>
    </div>
);

// --- Main FacultySettings Component ---
const FacultySettings = () => {
    const [activeTab, setActiveTab] = useState('profile');

    const renderContent = () => {
        switch (activeTab) {
            case 'profile': return <UpdateProfileForm />;
            case 'password': return <ChangePasswordForm />;
            case 'notifications': return <PlaceholderContent title="Notification Preferences" />;
            case 'privacy': return <PlaceholderContent title="Privacy & Security" />;
            default: return <UpdateProfileForm />;
        }
    };

    return (
        <div>
            <div className="settings-header-banner">
                <h3>Settings</h3>
                <p>Manage your faculty account settings and preferences</p>
            </div>

            <div className="settings-layout">
                <div className="settings-submenu">
                    <button onClick={() => setActiveTab('profile')} className={`submenu-item ${activeTab === 'profile' ? 'active' : ''}`}>
                        <i className="bi bi-person-circle"></i> Edit Profile
                    </button>
                    <button onClick={() => setActiveTab('password')} className={`submenu-item ${activeTab === 'password' ? 'active' : ''}`}>
                        <i className="bi bi-key-fill"></i> Change Password
                    </button>
                    <button onClick={() => setActiveTab('notifications')} className={`submenu-item ${activeTab === 'notifications' ? 'active' : ''}`}>
                        <i className="bi bi-bell-fill"></i> Notifications
                    </button>
                    <button onClick={() => setActiveTab('privacy')} className={`submenu-item ${activeTab === 'privacy' ? 'active' : ''}`}>
                        <i className="bi bi-shield-lock-fill"></i> Privacy & Security
                    </button>
                </div>
                <div className="settings-content">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default FacultySettings;