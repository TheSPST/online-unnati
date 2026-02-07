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

// Simple Auth
function checkLogin() {
    const pass = document.getElementById('adminPass').value;
    if (pass === "unnati2026") {
        document.getElementById('loginOverlay').style.display = 'none';
        loadData();
    } else {
        alert("Incorrect Password!");
    }
}

// Navigation
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.sidebar-menu li').forEach(l => l.classList.remove('active'));

    document.getElementById('sec' + sectionId.charAt(0).toUpperCase() + sectionId.slice(1)).classList.add('active');
    document.getElementById('menu' + sectionId.charAt(0).toUpperCase() + sectionId.slice(1)).classList.add('active');

    if (sectionId !== 'addBusiness') loadData();
}

async function loadData() {
    // Load Leads
    const leadsSnap = await db.collection("leads").orderBy("timestamp", "desc").get();
    const leadsBody = document.getElementById("leadsBody");
    leadsBody.innerHTML = "";
    leadsSnap.forEach(doc => {
        const d = doc.data();
        leadsBody.innerHTML += `<tr>
            <td>${d.name}</td>
            <td>${d.business}</td>
            <td>${d.phone}</td>
            <td><span class="badge" style="position:static; transform:none;">${d.plan}</span></td>
            <td>${d.timestamp?.toDate().toLocaleDateString() || '-'}</td>
        </tr>`;
    });

    // Load Employees
    const empSnap = await db.collection("employee_codes").orderBy("timestamp", "desc").get();
    const empBody = document.getElementById("employeeBody");
    empBody.innerHTML = "";
    empSnap.forEach(doc => {
        const d = doc.data();
        empBody.innerHTML += `<tr>
            <td><strong>${d.code}</strong></td>
            <td>${d.name}</td>
            <td>${d.timestamp?.toDate().toLocaleDateString() || '-'}</td>
        </tr>`;
    });

    // Load Businesses
    const bizSnap = await db.collection("businesses").orderBy("timestamp", "desc").get();
    const bizBody = document.getElementById("bizBody");
    bizBody.innerHTML = "";
    bizSnap.forEach(doc => {
        const d = doc.data();
        bizBody.innerHTML += `<tr>
            <td>${d.bizName}
                ${d.bizRemark ? `<br><small style="color:var(--text-muted); font-size:0.8em;">${d.bizRemark}</small>` : ''}
            </td>
            <td>${d.ownerName}</td>
            <td>${d.bizProduct || '-'}</td>
            <td><code>${d.empCode}</code></td>
            <td>${d.bizPhone}</td>
            <td>${d.timestamp?.toDate().toLocaleDateString() || '-'}</td>
        </tr>`;
    });
}

// Generate Code
async function generateCode() {
    const name = document.getElementById('empName').value;
    if (!name) return alert("Enter employee name");

    const code = "UN" + Math.random().toString(36).substring(2, 7).toUpperCase();

    try {
        await db.collection("employee_codes").add({
            name: name,
            code: code,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        document.getElementById('empName').value = "";
        loadData();
        alert("Generated Code: " + code);
    } catch (e) {
        console.error(e);
    }
}


