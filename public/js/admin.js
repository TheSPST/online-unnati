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

function logout() {
    localStorage.removeItem('adminLoggedIn');
    window.location.reload();
}

// Check Login on Load
function initAdmin() {
    const overlay = document.getElementById('loginOverlay');
    if (localStorage.getItem('adminLoggedIn') === 'true') {
        if (overlay) overlay.style.display = 'none';
        loadData();
    } else {
        if (overlay) overlay.style.display = 'flex';
    }
}

// Run immediately if DOM is ready, otherwise wait
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdmin);
} else {
    initAdmin();
}

// Navigation
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.sidebar-menu li').forEach(l => l.classList.remove('active'));

    document.getElementById('sec' + sectionId.charAt(0).toUpperCase() + sectionId.slice(1)).classList.add('active');
    document.getElementById('menu' + sectionId.charAt(0).toUpperCase() + sectionId.slice(1)).classList.add('active');

    if (sectionId !== 'addBusiness') loadData();
}

let leadsData = [];
let employeesData = [];
let businessesData = [];
let sortDir = { leads: 'asc', businesses: 'asc' };

// Date Helper
function formatDate(timestamp) {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    }).replace(/ /g, ', ');
}

async function loadData() {
    // Load Leads
    const leadsSnap = await db.collection("leads").orderBy("timestamp", "desc").get();
    leadsData = [];
    leadsSnap.forEach(doc => {
        let data = doc.data();
        data.id = doc.id;
        leadsData.push(data);
    });
    renderLeads(leadsData);

    // Load Employees
    const empSnap = await db.collection("employee_codes").orderBy("timestamp", "desc").get();
    employeesData = [];
    empSnap.forEach(doc => {
        let data = doc.data();
        data.id = doc.id;
        employeesData.push(data);
    });
    renderEmployees(employeesData);

    // Load Businesses
    const bizSnap = await db.collection("businesses").orderBy("timestamp", "desc").get();
    businessesData = [];
    bizSnap.forEach(doc => {
        let data = doc.data();
        data.id = doc.id; // Store document ID
        businessesData.push(data);
    });
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
            <td>${formatDate(d.timestamp)}</td>
            <td>
                <button onclick="openEditModal('leads', '${d.id}')" class="btn btn-sm btn-outline" style="margin-right:5px; color: #6366f1; border-color: #6366f1; padding: 5px 10px; font-size: 0.8em;">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteLead('${d.id}')" class="btn btn-sm" style="background: #ef4444; color: white; padding: 5px 10px; font-size: 0.8em;">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>`;
    });
}

function renderEmployees(data) {
    const empBody = document.getElementById("employeeBody");
    empBody.innerHTML = "";
    data.forEach(d => {
        empBody.innerHTML += `<tr>
            <td><strong>${d.code}</strong></td>
            <td>${d.name}</td>
            <td>${formatDate(d.timestamp)}</td>
            <td>
                <button onclick="openEditModal('employee_codes', '${d.id}')" class="btn btn-sm btn-outline" style="margin-right:5px; color: #6366f1; border-color: #6366f1; padding: 5px 10px; font-size: 0.8em;">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteEmployee('${d.id}')" class="btn btn-sm" style="background: #ef4444; color: white; padding: 5px 10px; font-size: 0.8em;">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>`;
    });
}

function renderBusinesses(data) {
    const bizBody = document.getElementById("bizBody");
    bizBody.innerHTML = "";
    data.forEach(d => {
        // Use document ID if available, otherwise fallback (though for deletion we need doc id)
        // We need to modify loadData to include doc id in the data pushed to arrays
        bizBody.innerHTML += `<tr>
            <td>${d.bizName}
                ${d.bizRemark ? `<br><small style="color:var(--text-muted); font-size:0.8em;">${d.bizRemark}</small>` : ''}
            </td>
            <td>${d.ownerName}</td>
            <td>${d.bizProduct || '-'}</td>
            <td><span class="badge" style="position:static; transform:none;">${d.bizPlan || '-'}</span></td>
            <td><code>${d.empCode}</code></td>
            <td>${d.bizPhone}</td>
            <td>${formatDate(d.timestamp)}</td>
            <td>
                <button onclick="openEditModal('businesses', '${d.id}')" class="btn btn-sm btn-outline" style="margin-right:5px; color: #6366f1; border-color: #6366f1; padding: 5px 10px; font-size: 0.8em;">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteBusiness('${d.id}')" class="btn btn-sm" style="background: #ef4444; color: white; padding: 5px 10px; font-size: 0.8em;">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>`;
    });
}



// Edit Functionality
let currentEditId = null;
let currentEditCollection = null;

function openEditModal(collection, id) {
    console.log("Opening edit modal:", collection, id);
    currentEditId = id;
    currentEditCollection = collection;

    let data = null;
    if (collection === 'leads') data = leadsData.find(d => d.id === id);
    if (collection === 'employee_codes') data = employeesData.find(d => d.id === id);
    if (collection === 'businesses') data = businessesData.find(d => d.id === id);

    console.log("Data found:", data);

    if (!data) return alert("Error: Data not found");

    const container = document.getElementById('editFormContainer');
    if (!container) return alert("Error: Edit form container not found");

    container.innerHTML = '';

    let formHtml = '';

    if (collection === 'leads') {
        formHtml = `
            <div class="form-group"><label>Name</label><input type="text" id="editName" value="${data.name || ''}"></div>
            <div class="form-group"><label>Phone</label><input type="text" id="editPhone" value="${data.phone || ''}"></div>
            <div class="form-group"><label>Business</label><input type="text" id="editBusiness" value="${data.business || ''}"></div>
            <div class="form-group"><label>Plan</label>
                <select id="editPlan">
                    <option value="Starter" ${data.plan === 'Starter' ? 'selected' : ''}>Starter</option>
                    <option value="Growth" ${data.plan === 'Growth' ? 'selected' : ''}>Growth</option>
                    <option value="Dominance" ${data.plan === 'Dominance' ? 'selected' : ''}>Dominance</option>
                </select>
            </div>
        `;
    } else if (collection === 'employee_codes') {
        formHtml = `
            <div class="form-group"><label>Employee Name</label><input type="text" id="editEmpName" value="${data.name || ''}"></div>
            <div class="form-group"><label>Code (Read Only)</label><input type="text" value="${data.code || ''}" disabled style="opacity:0.6"></div>
        `;
    } else if (collection === 'businesses') {
        formHtml = `
            <div class="form-group"><label>Business Name</label><input type="text" id="editBizName" value="${data.bizName || ''}"></div>
            <div class="form-group"><label>Owner Name</label><input type="text" id="editOwnerName" value="${data.ownerName || ''}"></div>
            <div class="form-group"><label>Phone</label><input type="text" id="editBizPhone" value="${data.bizPhone || ''}"></div>
            <div class="form-group"><label>Product</label><input type="text" id="editBizProduct" value="${data.bizProduct || ''}"></div>
            <div class="form-group"><label>Plan</label>
                <select id="editBizPlan">
                    <option value="Basic" ${data.bizPlan === 'Basic' ? 'selected' : ''}>Basic</option>
                    <option value="Premium" ${data.bizPlan === 'Premium' ? 'selected' : ''}>Premium</option>
                    <option value="Enterprise" ${data.bizPlan === 'Enterprise' ? 'selected' : ''}>Enterprise</option>
                </select>
            </div>
            <div class="form-group"><label>Remark</label><textarea id="editBizRemark">${data.bizRemark || ''}</textarea></div>
        `;
    }

    container.innerHTML = formHtml;
    document.getElementById('editModal').style.display = 'flex';
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
    currentEditId = null;
    currentEditCollection = null;
}

async function saveEdit() {
    if (!currentEditId || !currentEditCollection) return;

    let updates = {};
    if (currentEditCollection === 'leads') {
        updates = {
            name: document.getElementById('editName').value,
            phone: document.getElementById('editPhone').value,
            business: document.getElementById('editBusiness').value,
            plan: document.getElementById('editPlan').value
        };
    } else if (currentEditCollection === 'employee_codes') {
        updates = {
            name: document.getElementById('editEmpName').value
        };
    } else if (currentEditCollection === 'businesses') {
        updates = {
            bizName: document.getElementById('editBizName').value,
            ownerName: document.getElementById('editOwnerName').value,
            bizPhone: document.getElementById('editBizPhone').value,
            bizProduct: document.getElementById('editBizProduct').value,
            bizPlan: document.getElementById('editBizPlan').value,
            bizRemark: document.getElementById('editBizRemark').value
        };
    }

    try {
        await db.collection(currentEditCollection).doc(currentEditId).update(updates);
        alert("Updated successfully!");
        closeEditModal();
        loadData();
    } catch (error) {
        console.error("Error updating: ", error);
        alert("Error updating: " + error.message);
    }
}

async function deleteLead(docId) {
    if (!docId) return alert("Error: No lead ID found");
    if (confirm("Are you sure you want to delete this lead? This action cannot be undone.")) {
        try {
            await db.collection("leads").doc(docId).delete();
            alert("Lead deleted successfully");
            loadData();
        } catch (error) {
            console.error("Error removing document: ", error);
            alert("Error deleting lead: " + error.message);
        }
    }
}

async function deleteEmployee(docId) {
    if (!docId) return alert("Error: No employee ID found");
    if (confirm("Are you sure you want to delete this employee code? This action cannot be undone.")) {
        try {
            await db.collection("employee_codes").doc(docId).delete();
            alert("Employee code deleted successfully");
            loadData();
        } catch (error) {
            console.error("Error removing document: ", error);
            alert("Error deleting employee code: " + error.message);
        }
    }
}

async function deleteBusiness(docId) {
    if (!docId) return alert("Error: No business ID found");

    if (confirm("Are you sure you want to delete this business? This action cannot be undone.")) {
        try {
            await db.collection("businesses").doc(docId).delete();
            alert("Business deleted successfully");
            loadData(); // Refresh list
        } catch (error) {
            console.error("Error removing document: ", error);
            alert("Error deleting business: " + error.message);
        }
    }
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


