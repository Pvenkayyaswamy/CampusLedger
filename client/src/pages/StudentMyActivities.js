import React, { useState, useEffect } from 'react';
import './StudentMyActivities.css';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

// Helper to get a color/icon for an activity type
const getActivityIcon = (type) => {
    switch (type?.toLowerCase()) {
        case 'hackathon': return { icon: 'bi-trophy-fill', color: '#6f42c1' };
        case 'workshop': return { icon: 'bi-tools', color: '#fd7e14' };
        case 'internship': return { icon: 'bi-briefcase-fill', color: '#0d6efd' };
        default: return { icon: 'bi-patch-check-fill', color: '#198754' };
    }
};

const StudentMyActivities = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActivities = async () => {
            if (auth.currentUser) {
                setLoading(true);
                const requestsCollection = collection(db, "certificateApprovalRequests");
                const q = query(
                    requestsCollection,
                    where("studentId", "==", auth.currentUser.uid),
                    orderBy("submittedAt", "desc")
                );
                const querySnapshot = await getDocs(q);
                const activitiesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setActivities(activitiesList);
                setLoading(false);
            }
        };
        fetchActivities();
    }, []);

    const totalPoints = activities
        .filter(act => act.status === 'approved')
        .reduce((sum, act) => sum + (act.pointsAwarded || 0), 0);

    if (loading) {
        return <p>Loading your activities...</p>
    }

    return (
        <div>
            <div className="page-header1">
                <div>
                    <h2>My Activities</h2>
                    <div className="page-header-stats">
                        <div className="page-header-stat">
                            <p>Total Submissions</p>
                            <h3>{activities.length}</h3>
                        </div>
                        <div className="page-header-stat">
                            <p>Total Points</p>
                            <h3>{totalPoints}</h3>
                        </div>
                    </div>
                </div>
                {/* We can add the "+ Upload Activity" button here later */}
            </div>

            <div className="section-card">
                <h4>Recent Submissions</h4>
                {activities.slice(0, 3).map(activity => {
                    const { icon, color } = getActivityIcon(activity.activityType);
                    return (
                        <div key={activity.id} className="activity-item">
                            <div className="activity-info">
                                <div className="icon" style={{ backgroundColor: color }}><i className={`bi ${icon}`}></i></div>
                                <div className="activity-details">
                                    <p>{activity.activityTitle}</p>
                                    <span>Submitted: {new Date(activity.submittedAt?.toDate()).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div className="activity-status">
                                {activity.status === 'approved' && <span className="points">+{activity.pointsAwarded} pts</span>}
                                <span className={`status-badge ${activity.status}`}>{activity.status}</span>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="section-card">
                <div className="section-header">
                    <h4>All Activities</h4>
                    {/* Filter dropdowns can be added here */}
                </div>
                {activities.map(activity => {
                    const { icon, color } = getActivityIcon(activity.activityType);
                     return (
                        <div key={activity.id} className="activity-item">
                            <div className="activity-info">
                                <div className="icon" style={{ backgroundColor: color }}><i className={`bi ${icon}`}></i></div>
                                <div className="activity-details">
                                    <p>{activity.activityTitle}</p>
                                    <span>Submitted: {new Date(activity.submittedAt?.toDate()).toLocaleDateString()}</span>
                                    {activity.status === 'approved' && <span>Points Earned: +{activity.pointsAwarded}</span>}
                                </div>
                            </div>
                             <div className="activity-actions">
                                <span className={`status-badge ${activity.status}`}>{activity.status}</span>
                                <button>View</button>
                                <button><i className="bi bi-trash-fill"></i></button>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

export default StudentMyActivities;
