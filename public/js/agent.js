// Firebase configuration
const firebaseConfig = {
    projectId: "listingsuit",
    appId: "1:194651929970:web:7674f9d8130fc9867cb1eb",
    storageBucket: "listingsuit.firebasestorage.app",
    apiKey: "AIzaSyBAJn3hMWxPxmmeN2LqhpJdDxHOuUfxeYM",
    authDomain: "listingsuit.firebaseapp.com",
    messagingSenderId: "194651929970",
    measurementId: "G-LH5FDXK8PP",
    projectNumber: "194651929970"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Form Submission
document.getElementById("businessForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button');
    const statusMsg = document.getElementById('statusMessage');

    submitBtn.innerText = "Saving...";
    submitBtn.disabled = true;
    statusMsg.style.display = 'none';

    const formData = new FormData(e.target);
    const data = {
        empCode: formData.get('empCode').toUpperCase(),
        bizName: formData.get('bizName'),
        ownerName: formData.get('ownerName'),
        bizPhone: formData.get('bizPhone'),
        bizAddress: formData.get('bizAddress'),
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        // Verify Employee Code
        const codeCheck = await db.collection("employee_codes").where("code", "==", data.empCode).get();
        if (codeCheck.empty) {
            alert("Invalid Employee Code! Please check and try again.");
            submitBtn.innerText = "Save Business Details";
            submitBtn.disabled = false;
            return;
        }

        await db.collection("businesses").add(data);

        statusMsg.innerHTML = `<span style="color: #4ade80;"><i class="fas fa-check-circle"></i> Business registered successfully!</span>`;
        statusMsg.style.display = 'block';
        e.target.reset();

        setTimeout(() => {
            statusMsg.style.display = 'none';
        }, 5000);

    } catch (error) {
        console.error("Error adding business: ", error);
        alert("Error storing data. Please check your connection.");
    } finally {
        submitBtn.innerText = "Save Business Details";
        submitBtn.disabled = false;
    }
});
