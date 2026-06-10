import React, { useState, useEffect } from 'react';
import './AddActivityModal.css';
import { auth, db, storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';

const AddActivityModal = ({ onClose }) => {
    const [formData, setFormData] = useState({ activityTitle: '', activityType: '' });
    const [file, setFile] = useState(null);
    const [studentData, setStudentData] = useState(null); // To store student's profile
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Fetch the logged-in student's profile data to get their mentorId
    useEffect(() => {
        const fetchStudentData = async () => {
            const studentDocRef = doc(db, 'students', auth.currentUser.uid);
            const studentDoc = await getDoc(studentDocRef);
            if (studentDoc.exists()) {
                setStudentData(studentDoc.data());
            }
        };
        fetchStudentData();
    }, []);

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) { setError("Please upload a certificate file."); return; }
        if (!studentData || !studentData.mentorId) { setError("Could not find your assigned mentor. Please contact support."); return; }

        setLoading(true);
        setError('');

        try {
            const fileRef = ref(storage, `certificates/${auth.currentUser.uid}/${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(fileRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);

            const requestsCollection = collection(db, "certificateApprovalRequests");
            await addDoc(requestsCollection, {
                ...formData,
                fileURL: downloadURL,
                studentId: auth.currentUser.uid,
                studentName: studentData.fullName,
                mentorId: studentData.mentorId, // <-- Important: Add mentorId to the request
                status: 'pending',
                submittedAt: serverTimestamp(),
            });

            alert("Activity submitted for approval!");
            onClose();

        } catch (err) {
            setError("Failed to submit activity. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            {/* The form JSX is the same as before */}
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Add New Activity</h2>
                    <button onClick={onClose} className="close-button">&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-form-grid">
                        <div className="form-group full-width">
                            <label>Activity Title</label>
                            <input type="text" onChange={(e) => setFormData({...formData, activityTitle: e.target.value})} required />
                        </div>
                        <div className="form-group">
                            <label>Activity Type</label>
                            <select onChange={(e) => setFormData({...formData, activityType: e.target.value})} required>
                                <option value="">Select type</option>
                                <option>Internship</option>
                                <option>Hackathon</option>
                                <option>Workshop</option>
                                <option>Sports</option>
                            </select>
                        </div>
                        <div className="form-group full-width">
                            <label>Certificate/Document</label>
                            <div className="file-drop-zone">
                                <input type="file" onChange={handleFileChange} required />
                                {file ? <p>File selected: {file.name}</p> : <p>Click to upload or drag and drop</p>}
                            </div>
                        </div>
                    </div>
                    {error && <p style={{color: 'red'}}>{error}</p>}
                    <div className="modal-actions">
                        <button type="button" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit Activity'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddActivityModal;