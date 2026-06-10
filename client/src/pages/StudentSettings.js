import React, { useState, useEffect } from 'react';
import './StudentSettings.css';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';

// --- Edit Profile Component (Unchanged) ---
const EditProfile = () => {
    const [formData, setFormData] = useState({ fullName: '', phone: '', bio: '' });
    const [readOnlyData, setReadOnlyData] = useState({ email: '', registrationNumber: 'N/A' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchStudentData = async () => {
            if (auth.currentUser) {
                const studentDocRef = doc(db, 'students', auth.currentUser.uid);
                const studentDoc = await getDoc(studentDocRef);
                if (studentDoc.exists()) {
                    const data = studentDoc.data();
                    setFormData({
                        fullName: data.fullName || '',
                        phone: data.phone || '',
                        bio: data.bio || '',
                    });
                    setReadOnlyData({
                        email: data.email || auth.currentUser.email,
                        registrationNumber: data.registrationNumber || 'N/A',
                    });
                }
                setLoading(false);
            }
        };
        fetchStudentData();
    }, []);

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSaveChanges = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const studentDocRef = doc(db, 'students', auth.currentUser.uid);
            await updateDoc(studentDocRef, {
                fullName: formData.fullName,
                phone: formData.phone,
                bio: formData.bio,
            });
            alert('Profile updated successfully!');
        } catch (error) {
            console.error("Error updating profile: ", error);
            alert('Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <p>Loading profile...</p>;

    return (
        <form onSubmit={handleSaveChanges}>
            <div className="profile-summary">
                <div className="profile-avatar">{formData.fullName ? formData.fullName.charAt(0) : ''}</div>
                <div className="profile-info">
                    <h4>{formData.fullName}</h4>
                    <p>{readOnlyData.email}</p>
                </div>
            </div>
            <div className="form-grid">
                <div className="form-group"><label htmlFor="fullName">Full Name</label><input type="text" id="fullName" value={formData.fullName} onChange={handleInputChange} /></div>
                <div className="form-group"><label htmlFor="phone">Phone Number</label><input type="tel" id="phone" value={formData.phone} onChange={handleInputChange} /></div>
                <div className="form-group full-width"><label htmlFor="bio">Bio</label><textarea id="bio" value={formData.bio} onChange={handleInputChange}></textarea></div>
                <div className="form-group"><label>Email (Read-only)</label><input type="email" value={readOnlyData.email} readOnly /></div>
                <div className="form-group"><label>Registration Number (Read-only)</label><input type="text" value={readOnlyData.registrationNumber} readOnly /></div>
            </div>
            <div className="form-actions">
                <button type="submit" className="save-button" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
            </div>
        </form>
    );
};

// --- Change Password Component (UPDATED with full logic) ---
const ChangePassword = () => {
    const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setPasswords(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (passwords.newPassword !== passwords.confirmNewPassword) {
            setError("New passwords do not match.");
            return;
        }

        setSaving(true);
        const user = auth.currentUser;
        const credential = EmailAuthProvider.credential(user.email, passwords.currentPassword);

        try {
            // Re-authenticate the user to confirm their identity
            await reauthenticateWithCredential(user, credential);
            
            // If re-authentication is successful, update the password
            await updatePassword(user, passwords.newPassword);

            alert("Password updated successfully!");
            setPasswords({ currentPassword: '', newPassword: '', confirmNewPassword: '' }); // Clear fields
        } catch (error) {
            console.error("Error updating password:", error);
            setError("Failed to update password. Please check your current password and try again.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div className="form-group"><label htmlFor="currentPassword">Current Password</label><input type="password" id="currentPassword" value={passwords.currentPassword} onChange={handleInputChange} required /></div>
                <div className="form-group"><label htmlFor="newPassword">New Password</label><input type="password" id="newPassword" value={passwords.newPassword} onChange={handleInputChange} required /></div>
                <div className="form-group"><label htmlFor="confirmNewPassword">Confirm New Password</label><input type="password" id="confirmNewPassword" value={passwords.confirmNewPassword} onChange={handleInputChange} required /></div>
                {error && <p style={{color: 'red', textAlign: 'center'}}>{error}</p>}
                <div className="password-requirements">
                    <p>Password Requirements:</p>
                    <ul>
                        <li>At least 8 characters long</li>
                        <li>Include uppercase and lowercase letters</li>
                        <li>Include at least one number</li>
                        <li>Include at least one special character</li>
                    </ul>
                </div>
                <div className="form-actions">
                    <button type="submit" className="save-button" disabled={saving}>
                        {saving ? 'Updating...' : 'Update Password'}
                    </button>
                </div>
            </form>
        </div>
    );
};


// --- Main Settings Page Component ---
const StudentSettings = () => {
    const [activeTab, setActiveTab] = useState('editProfile');

    const renderContent = () => {
        switch (activeTab) {
            case 'editProfile':
                return <EditProfile />;
            case 'changePassword':
                return <ChangePassword />;
            case 'notifications':
                return <p>Notification settings will be configured here.</p>;
            case 'privacy':
                return <p>Privacy & Security settings will be configured here.</p>;
            default:
                return <EditProfile />;
        }
    };

    return (
        <div>
            <div className="page-header1">
                <h2>Settings</h2>
                <p>Manage your account preferences and security settings</p>
            </div>
            <div className="settings-layout">
                <aside className="settings-submenu">
                    <button className={`submenu-button ${activeTab === 'editProfile' ? 'active' : ''}`} onClick={() => setActiveTab('editProfile')}>Edit Profile</button>
                    <button className={`submenu-button ${activeTab === 'changePassword' ? 'active' : ''}`} onClick={() => setActiveTab('changePassword')}>Change Password</button>
                    <button className={`submenu-button ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>Notifications</button>
                    <button className={`submenu-button ${activeTab === 'privacy' ? 'active' : ''}`} onClick={() => setActiveTab('privacy')}>Privacy & Security</button>
                </aside>
                <main className="settings-content">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default StudentSettings;

