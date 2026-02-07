// Firebase configuration (Same as app.js)
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

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Save Business
document.getElementById("businessForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerText;
    btn.innerText = "Submitting...";
    btn.disabled = true;

    const formData = new FormData(e.target);
    const data = {
        empCode: formData.get('empCode'),
        bizName: formData.get('bizName'),
        ownerName: formData.get('ownerName'),
        bizProduct: formData.get('bizProduct'),
        bizPlan: formData.get('bizPlan'),
        bizRemark: formData.get('bizRemark'),
        bizPhone: formData.get('bizPhone'),
        bizAddress: formData.get('bizAddress'),
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        // Optional: Check if code exists
        const codeCheck = await db.collection("employee_codes").where("code", "==", data.empCode).get();
        if (codeCheck.empty) {
            alert("Invalid Employee Code! Please verify your code.");
            btn.innerText = originalText;
            btn.disabled = false;
            return;
        }

        await db.collection("businesses").add(data);
        alert("Business details stored successfully!");
        e.target.reset();
    } catch (error) {
        console.error(error);
        alert("Error storing data: " + error.message);
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
});
