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
        localStorage.setItem('adminLoggedIn', 'true');
        document.getElementById('loginOverlay').style.display = 'none';
        loadData();
    } else {
        alert("Incorrect Password!");
    }
}

// Check Login on Load
window.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('adminLoggedIn') === 'true') {
        document.getElementById('loginOverlay').style.display = 'none';
        loadData();
    }
});

// Navigation
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.sidebar-menu li').forEach(l => l.classList.remove('active'));

    document.getElementById('sec' + sectionId.charAt(0).toUpperCase() + sectionId.slice(1)).classList.add('active');
    document.getElementById('menu' + sectionId.charAt(0).toUpperCase() + sectionId.slice(1)).classList.add('active');

    if (sectionId !== 'addBusiness') loadData();
}

let leadsData = [];
let businessesData = [];
let sortDir = { leads: 'asc', businesses: 'asc' };

async function loadData() {
    // Load Leads
    const leadsSnap = await db.collection("leads").orderBy("timestamp", "desc").get();
    leadsData = [];
    leadsSnap.forEach(doc => leadsData.push(doc.data()));
    renderLeads(leadsData);

    // Load Employees (No search/sort requested, keeping as is)
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
    businessesData = [];
    bizSnap.forEach(doc => businessesData.push(doc.data()));
    renderBusinesses(businessesData);
}

function renderLeads(data) {
    const leadsBody = document.getElementById("leadsBody");
    leadsBody.innerHTML = "";
    data.forEach(d => {
        leadsBody.innerHTML += `<tr>
            <td>${d.name}</td>
            <td>${d.business}</td>
            <td>${d.phone}</td>
            <td><span class="badge" style="position:static; transform:none;">${d.plan}</span></td>
            <td>${d.timestamp?.toDate().toLocaleDateString() || '-'}</td>
        </tr>`;
    });
}

function renderBusinesses(data) {
    const bizBody = document.getElementById("bizBody");
    bizBody.innerHTML = "";
    data.forEach(d => {
        bizBody.innerHTML += `<tr>
            <td>${d.bizName}
                ${d.bizRemark ? `<br><small style="color:var(--text-muted); font-size:0.8em;">${d.bizRemark}</small>` : ''}
            </td>
            <td>${d.ownerName}</td>
            <td>${d.bizProduct || '-'}</td>
            <td><span class="badge">${d.bizPlan || '-'}</span></td>
            <td><code>${d.empCode}</code></td>
            <td>${d.bizPhone}</td>
            <td>${d.timestamp?.toDate().toLocaleDateString() || '-'}</td>
        </tr>`;
    });
}

function filterLeads() {
    const query = document.getElementById('searchLeads').value.toLowerCase();
    const filtered = leadsData.filter(d =>
        (d.name && d.name.toLowerCase().includes(query)) ||
        (d.business && d.business.toLowerCase().includes(query)) ||
        (d.phone && d.phone.includes(query))
    );
    renderLeads(filtered);
}

function filterBusinesses() {
    const query = document.getElementById('searchBiz').value.toLowerCase();
    const filtered = businessesData.filter(d =>
        (d.bizName && d.bizName.toLowerCase().includes(query)) ||
        (d.ownerName && d.ownerName.toLowerCase().includes(query)) ||
        (d.bizProduct && d.bizProduct.toLowerCase().includes(query)) ||
        (d.empCode && d.empCode.toLowerCase().includes(query)) ||
        (d.bizPhone && d.bizPhone.includes(query))
    );
    renderBusinesses(filtered);
}

function sortTable(type, field) {
    const data = type === 'leads' ? leadsData : businessesData;
    const currentDir = sortDir[type];
    const newDir = currentDir === 'asc' ? 'desc' : 'asc';
    sortDir[type] = newDir;

    data.sort((a, b) => {
        let valA = a[field] || '';
        let valB = b[field] || '';

        // Handle timestamps
        if (field === 'timestamp') {
            valA = a[field]?.toDate().getTime() || 0;
            valB = b[field]?.toDate().getTime() || 0;
            return newDir === 'asc' ? valA - valB : valB - valA;
        }

        // Handle strings
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return newDir === 'asc' ? -1 : 1;
        if (valA > valB) return newDir === 'asc' ? 1 : -1;
        return 0;
    });

    if (type === 'leads') renderLeads(data);
    else renderBusinesses(data);
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


