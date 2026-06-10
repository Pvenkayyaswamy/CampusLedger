const {onCall} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();

// This is our function to approve faculty
exports.approveFacultyRequest = onCall(async (request) => { // CHANGED 'data' to 'request'
  // Get the ID of the request document from the data sent by our app
  const requestId = request.data.requestId; // CHANGED to request.data.requestId

  if (!requestId) {
    throw new Error("Request ID is missing.");
  }

  const db = admin.firestore();

  // 1. Get the request document from Firestore
  const requestDocRef = db.collection("facultyApprovalRequests").doc(requestId);
  const requestDoc = await requestDocRef.get();

  if (!requestDoc.exists || requestDoc.data().status !== "pending") {
    throw new Error("Request not found or already processed.");
  }

  const {email, password, fullName, collegeId, department} = requestDoc.data();

  try {
    // 2. Create the new user in Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: fullName,
    });

    // 3. Create a permanent faculty profile document
    await db.collection("faculty").doc(userRecord.uid).set({
      fullName: fullName,
      email: email,
      collegeId: collegeId,
      department: department,
      uid: userRecord.uid,
    });

    // 4. Update the original request status to "approved"
    await requestDocRef.update({status: "approved"});

    return {message: `Successfully created user ${userRecord.email}`};
  } catch (error) {
    console.error("Error creating user:", error);
    throw new Error("Failed to create user.");
  }
});

// --- NEW FUNCTION TO APPROVE STUDENTS ---
exports.approveStudentRequest = onCall(async (request) => {
  const requestId = request.data.requestId;

  if (!requestId) {
    throw new Error("Request ID is missing.");
  }

  const db = admin.firestore();
  const requestDocRef = db.collection("studentApprovalRequests").doc(requestId);
  const requestDoc = await requestDocRef.get();

  if (!requestDoc.exists || requestDoc.data().status !== "pending") {
    throw new Error("Student request not found or already processed.");
  }

  const {email, password, fullName, collegeId, branch, year, phone, mentorId} = requestDoc.data();

  try {
    // 1. Create the new student user in Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: fullName,
    });

    // 2. Create a permanent student profile document
    await db.collection("students").doc(userRecord.uid).set({
      fullName: fullName,
      email: email,
      collegeId: collegeId,
      branch: branch,
      year: year,
      phone: phone,
      mentorId: mentorId,
      uid: userRecord.uid,
      totalPoints: 0, // Initialize points
    });

    // 3. Update the original request status to "approved"
    await requestDocRef.update({status: "approved"});

    return {message: `Successfully created student ${userRecord.email}`};
  } catch (error) {
    console.error("Error creating student:", error);
    throw new Error("Failed to create student user.");
  }
});


// ... (keep your existing approveFacultyRequest and approveStudentRequest functions)

// --- NEW FUNCTION TO DELETE FACULTY ---
// ... (keep your existing approveFacultyRequest and approveStudentRequest functions)

// --- NEW FUNCTION TO DELETE FACULTY ---
exports.deleteFacultyUser = onCall(async (data, context) => {
  // Add a security check to ensure only an authenticated user can run this
  if (!context.auth) {
    throw new Error("Authentication required.");
  }

  const facultyId = data.facultyId;
  if (!facultyId) {
    throw new Error("Faculty ID is missing.");
  }

  const db = admin.firestore();

  try {
    // 1. Delete the user from Firebase Authentication
    await admin.auth().deleteUser(facultyId);

    // 2. Delete the faculty's profile from Firestore
    const facultyDocRef = db.collection("faculty").doc(facultyId);
    await facultyDocRef.delete();
    
    return { message: "Faculty user deleted successfully." };
  } catch (error) {
    console.error("Error deleting faculty user:", error);
    throw new Error("Failed to delete faculty user.");
  }
});

// ... (keep all your other imports and functions the same)

exports.approveFacultyRequest = onCall(async (request) => {
  const requestId = request.data.requestId;
  if (!requestId) { /* ... error handling ... */ }

  const db = admin.firestore();
  const requestDocRef = db.collection("facultyApprovalRequests").doc(requestId);
  const requestDoc = await requestDocRef.get();

  if (!requestDoc.exists) { /* ... error handling ... */ }

  const {email, password, fullName, collegeId} = requestDoc.data();

  try {
    const userRecord = await admin.auth().createUser({ /* ... user creation ... */ });

    await db.collection("faculty").doc(userRecord.uid).set({ /* ... creating faculty profile ... */ });
    
    await requestDocRef.update({status: "approved"});

    // --- NEW: CREATE AN AUDIT LOG ENTRY ---
    await db.collection("auditLog").add({
        action: "New Faculty Approved",
        details: `Approved ${fullName} (${email})`,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        collegeId: collegeId, // Link the log to the college
        performedBy: "Admin", // We can add the admin's name later
    });

    return {message: `Successfully created user ${userRecord.email}`};
  } catch (error) {
    console.error("Error creating user:", error);
    throw new Error("Failed to create user.");
  }
});