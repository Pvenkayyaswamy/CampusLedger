const express = require('express');
const cors = require('cors');
const lmsData = require('./mockLMS'); // Import the mock data

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());


// --- NEW MOCK DATA ---
const mockActivities = [
    {
        "_id": "1",
        "studentName": "Ravi Kumar",
        "activityName": "Participated in Tech Fest",
        "date": "2024-03-15",
        "description": "Led the winning team in the hackathon event."
    },
    {
        "_id": "2",
        "studentName": "Priya Sharma",
        "activityName": "Volunteered for NSS Camp",
        "date": "2024-03-20",
        "description": "Organized and managed the blood donation drive."
    },
    {
        "_id": "3",
        "studentName": "Amit Singh",
        "activityName": "Published a Research Paper",
        "date": "2024-04-01",
        "description": "Paper on AI in healthcare published in a national journal."
    }
];

// --- NEW ROUTE ---
app.get('/api/activities', (req, res) => {
    console.log("Request received for all activities.");
    res.json(mockActivities);
});

// POST a new activity
app.post('/api/activities', (req, res) => {
    const { activityName, description, studentName } = req.body;

    if (!activityName || !description || !studentName) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    const newActivity = {
        _id: (Math.random() * 10000).toString(), // simple unique ID
        studentName,
        activityName,
        date: new Date().toISOString().split('T')[0], // a YYYY-MM-DD date
        description,
    };

    mockActivities.push(newActivity);
    console.log("Added new activity:", newActivity);
    res.status(201).json(newActivity); // 201 means "Created"
});


// --- NEW: Simulated LMS API Endpoint ---
app.get('/api/lms/get-data/:email', (req, res) => {
    console.log(`Received request for LMS data for email: ${req.params.email}`);
    const studentEmail = req.params.email;
    const studentLmsData = lmsData[studentEmail];

    if (studentLmsData) {
        console.log("Found data:", studentLmsData);
        res.json(studentLmsData); // Send the data back if found
    } else {
        console.log("Data not found.");
        res.status(404).json({ message: "Student not found in LMS" });
    }
});

// --- Your existing routes ---
app.post('/api/register/student', (req, res) => {
    // ... your existing registration logic
});



// --- Add this block to your index.js file ---

const mockUsers = {
    "satya@gmail.com": { password: "password", role: "student" }, // <-- ADD THIS LINE
    "student@test.com": { password: "password", role: "student" },
    "faculty@test.com": { password: "password", role: "faculty" },
    //"hod@test.com": { password: "password", role: "hod" },
    "admin@test.com": { password: "password", role: "admin" }
};

// NEW: Mock data for the faculty to approve
const mockStudents = [
    { "_id": "s1", "name": "Alok Nath", "department": "Computer Science" },
    { "_id": "s2", "name": "Sunita Williams", "department": "Mechanical Engineering" },
    { "_id": "s3", "name": "Vikram Batra", "department": "Civil Engineering" }
];


app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    console.log(`Login attempt for email: ${email}`);

    const user = mockUsers[email];

    if (user && user.password === password) {
        console.log(`Login successful for ${email}, role: ${user.role}`);
        res.json({ message: "Login successful", role: user.role });
    } else {
        console.log(`Login failed for ${email}`);
        res.status(401).json({ message: "Invalid credentials" });
    }
});

// NEW: Route for faculty to get a list of students
app.get('/api/faculty/students', (req, res) => {
    console.log("Request received for students needing approval.");
    res.json(mockStudents);
});


app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});