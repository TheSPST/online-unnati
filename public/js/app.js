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

// Modal Logic
const modal = document.getElementById("interestModal");
const span = document.getElementsByClassName("close")[0];

function openInterestForm(plan) {
    document.getElementById("selectedPlan").innerText = plan;
    document.getElementById("planInput").value = plan;
    modal.style.display = "flex";
}

span.onclick = () => modal.style.display = "none";
window.onclick = (event) => {
    if (event.target == modal) modal.style.display = "none";
}

// Form Submission
document.getElementById("interestForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button');
    submitBtn.innerText = "Submitting...";
    submitBtn.disabled = true;

    const formData = new FormData(e.target);
    const data = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        business: formData.get('business'),
        plan: formData.get('plan'),
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        await db.collection("leads").add(data);
        alert("Thank you! We will contact you soon on WhatsApp.");
        modal.style.display = "none";
        e.target.reset();
    } catch (error) {
        console.error("Error adding document: ", error);
        alert("Something went wrong. Please try again.");
    } finally {
        submitBtn.innerText = "Submit Interest";
        submitBtn.disabled = false;
    }
});

// FAQ Toggle Logic
document.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', () => {
        const item = q.parentElement;
        item.classList.toggle('active');
        const answer = item.querySelector('.faq-answer');
        if (item.classList.contains('active')) {
            answer.style.display = 'block';
        } else {
            answer.style.display = 'none';
        }
    });
});
