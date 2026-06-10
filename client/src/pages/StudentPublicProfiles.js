import React, { useState, useEffect } from 'react';
import './StudentPublicProfiles.css';
import { auth, db } from '../firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

// Configuration for predefined platforms
const platformConfig = {
    LinkedIn: { icon: 'bi-linkedin', color: '#0A66C2' },
    LeetCode: { icon: 'bi-code-slash', color: '#FFA116' },
    HackerRank: { icon: 'bi-braces', color: '#2EC866' },
    GitHub: { icon: 'bi-github', color: '#181717' },
};
const platforms = ["LinkedIn", "LeetCode", "HackerRank", "GitHub", "Others"];

// --- Reusable Modal Component ---
const AddProfileModal = ({ onClose, onAddProfile }) => {
    const [platform, setPlatform] = useState('');
    const [customPlatformName, setCustomPlatformName] = useState('');
    const [username, setUsername] = useState('');
    const [url, setUrl] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const finalPlatformName = platform === 'Others' ? customPlatformName : platform;
        onAddProfile({
            platform: finalPlatformName,
            username,
            url
        });
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Add New Profile</h2>
                    <button onClick={onClose} className="close-button">&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group" style={{marginBottom: '1rem'}}>
                        <label>Platform</label>
                        <select value={platform} onChange={(e) => setPlatform(e.target.value)} required>
                            <option value="">Select platform</option>
                            {platforms.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                    {platform === 'Others' && (
                        <div className="form-group" style={{marginBottom: '1rem'}}>
                            <label>Platform Name</label>
                            <input type="text" value={customPlatformName} onChange={(e) => setCustomPlatformName(e.target.value)} placeholder="e.g., CodeChef" required />
                        </div>
                    )}
                    <div className="form-group" style={{marginBottom: '1rem'}}>
                        <label>Username</label>
                        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter your username" required />
                    </div>
                    <div className="form-group" style={{marginBottom: '1rem'}}>
                        <label>Profile URL</label>
                        <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." required />
                    </div>
                    <div className="modal-actions">
                        <button type="button" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-submit">Add Profile</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- Main Page Component ---
const StudentPublicProfiles = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch profiles from Firestore when the component loads
    useEffect(() => {
        const fetchProfiles = async () => {
            if (auth.currentUser) {
                const profilesCollection = collection(db, 'students', auth.currentUser.uid, 'publicProfiles');
                const profileSnapshot = await getDocs(profilesCollection);
                const profileList = profileSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setProfiles(profileList);
            }
            setLoading(false);
        };
        fetchProfiles();
    }, []);

    const handleAddProfile = async (newProfileData) => {
        if (auth.currentUser) {
            // Save the new profile to Firestore
            const profilesCollection = collection(db, 'students', auth.currentUser.uid, 'publicProfiles');
            const docRef = await addDoc(profilesCollection, newProfileData);
            // Update the local state to show the new profile immediately
            setProfiles([...profiles, { id: docRef.id, ...newProfileData }]);
        }
    };

    if (loading) {
        return <p>Loading profiles...</p>
    }

    return (
        <>
            {isModalOpen && <AddProfileModal onClose={() => setIsModalOpen(false)} onAddProfile={handleAddProfile} />}

            <div className="page-header1">
                <div>
                    <h2>My Profiles</h2>
                    <p>Manage your professional and coding platform profiles</p>
                </div>
                <button className="add-profile-btn" onClick={() => setIsModalOpen(true)}>+ Add Profile</button>
            </div>

            {profiles.length === 0 ? (
                <div className="portfolio-card"><p>No public profiles added yet. Click "+ Add Profile" to get started.</p></div>
            ) : (
                <div className="profiles-grid">
                    {profiles.map(profile => {
                        const config = platformConfig[profile.platform] || { icon: 'bi-link-45deg', color: '#6c757d' };
                        return (
                            <div key={profile.id} className="profile-card">
                                <div className="profile-card-header">
                                    <div className="icon" style={{ backgroundColor: config.color }}>
                                        <i className={`bi ${config.icon}`}></i>
                                    </div>
                                    <i className="bi bi-pencil-square edit-icon"></i>
                                </div>
                                <h4>{profile.platform}</h4>
                                <p className="username">@{profile.username}</p>
                                <div className="profile-card-stats">
                                    {/* These stats would be fetched in a real scenario */}
                                </div>
                                <a href={profile.url} target="_blank" rel="noopener noreferrer" className="view-profile-btn" style={{ backgroundColor: config.color }}>
                                    View Profile
                                </a>
                            </div>
                        )
                    })}
                </div>
            )}
        </>
    );
};

export default StudentPublicProfiles;
