// This file just holds sample data. It's not manually updated.
const lmsData = {
  "satya@gmail.com": {
    overallAttendance: "92%",
    overallCGPA: "8.2",
    upcomingAssignments: 3,
    semesters: [
      { sem: 1, sgpa: "8.5", subjects: ["Programming in C", "Engineering Physics"] },
      { sem: 2, sgpa: "8.8", subjects: ["Data Structures", "Engineering Chemistry"] },
      { sem: 3, sgpa: "7.9", subjects: ["Database Management", "Discrete Mathematics"] },
      { sem: 4, sgpa: "8.1", subjects: ["Operating Systems", "Computer Networks"] },
    ]
  },
  "venky@gmail.com": {
    overallAttendance: "85%",
    overallCGPA: "7.9",
    upcomingAssignments: 5,
    semesters: [
        { sem: 1, sgpa: "8.1", subjects: ["Subject A", "Subject B"] },
        { sem: 2, sgpa: "7.5", subjects: ["Subject C", "Subject D"] },
    ]
  },
  
};

module.exports = lmsData;