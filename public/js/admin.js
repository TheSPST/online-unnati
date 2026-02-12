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
let currentEditId = null;
let currentEditCollection = null;

// Modal Functions
function openEditModal(collection, id) {
    const container = document.getElementById('editFormContainer');
    if (!container) return showToast("Error: Edit form container not found", "error");

    currentEditCollection = collection;
    currentEditId = id;
    let html = '';
    let data = null;

    if (collection === 'leads') {
        data = leadsData.find(d => d.id === id);
        if (!data) return;
        html = `
            <label>Name</label>
            <input type="text" id="editName" value="${data.name || ''}">
            <label>Phone</label>
            <input type="text" id="editPhone" value="${data.phone || ''}">
            <label>Business</label>
            <input type="text" id="editBusiness" value="${data.business || ''}">
            <label>Plan</label>
            <select id="editPlan">
                <option value="Basic" ${data.plan === 'Basic' ? 'selected' : ''}>Basic</option>
                <option value="Standard" ${data.plan === 'Standard' ? 'selected' : ''}>Standard</option>
                <option value="Premium" ${data.plan === 'Premium' ? 'selected' : ''}>Premium</option>
            </select>
        `;
    } else if (collection === 'employee_codes') {
        data = employeesData.find(d => d.id === id);
        if (!data) return;
        html = `
            <label>Employee Name</label>
            <input type="text" id="editEmpName" value="${data.name || ''}">
             <label>Code (Read Only)</label>
            <input type="text" value="${data.code || ''}" readonly style="opacity:0.6">
        `;
    } else if (collection === 'businesses') {
        data = businessesData.find(d => d.id === id);
        if (!data) return;
        html = `
            <label>Business Name</label>
            <input type="text" id="editBizName" value="${data.bizName || ''}">
            <label>Owner Name</label>
            <input type="text" id="editOwnerName" value="${data.ownerName || ''}">
            <label>Phone</label>
            <input type="text" id="editBizPhone" value="${data.bizPhone || ''}">
            <label>Product</label>
            <input type="text" id="editBizProduct" value="${data.bizProduct || ''}">
            <label>Plan</label>
            <select id="editBizPlan">
                 <option value="Basic" ${data.bizPlan === 'Basic' ? 'selected' : ''}>Basic</option>
                <option value="Standard" ${data.bizPlan === 'Standard' ? 'selected' : ''}>Standard</option>
                <option value="Premium" ${data.bizPlan === 'Premium' ? 'selected' : ''}>Premium</option>
            </select>
            <label>Remark</label>
            <textarea id="editBizRemark" rows="3">${data.bizRemark || ''}</textarea>
        `;
    }

    container.innerHTML = html;
    document.getElementById('editModal').style.display = 'flex';
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
    currentEditId = null;
    currentEditCollection = null;
}

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

// UI Helpers
function toggleLoader(show) {
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = show ? 'flex' : 'none';
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}" style="color: ${type === 'success' ? '#10b981' : '#ef4444'}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    // Auto remove
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Updated loadData with Loader
async function loadData() {
    toggleLoader(true);
    try {
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
            data.id = doc.id;
            businessesData.push(data);
        });
        renderBusinesses(businessesData);
    } catch (e) {
        console.error(e);
        showToast("Error loading data", "error");
    } finally {
        toggleLoader(false);
    }
}

// Updated Render Functions with Empty State & Tooltips
function renderLeads(data) {
    const leadsBody = document.getElementById("leadsBody");
    leadsBody.innerHTML = "";

    if (data.length === 0) {
        leadsBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 30px; color: var(--text-muted);">No leads found</td></tr>`;
        return;
    }

    data.forEach(d => {
        leadsBody.innerHTML += `<tr>
            <td>${d.name}</td>
            <td>${d.business}</td>
            <td>${d.phone}</td>
            <td><span class="badge" style="position:static; transform:none;">${d.plan}</span></td>
            <td>${formatDate(d.timestamp)}</td>
            <td>
                <button onclick="openEditModal('leads', '${d.id}')" class="btn btn-sm btn-outline" title="Edit Lead" style="margin-right:5px; color: #6366f1; border-color: #6366f1; padding: 5px 10px; font-size: 0.8em;">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteLead('${d.id}')" class="btn btn-sm" title="Delete Lead" style="background: #ef4444; color: white; padding: 5px 10px; font-size: 0.8em;">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>`;
    });
}

function renderEmployees(data) {
    const empBody = document.getElementById("employeeBody");
    empBody.innerHTML = "";

    if (data.length === 0) {
        empBody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 30px; color: var(--text-muted);">No employee codes found</td></tr>`;
        return;
    }

    data.forEach(d => {
        empBody.innerHTML += `<tr>
            <td><strong>${d.code}</strong></td>
            <td>${d.name}</td>
            <td>${formatDate(d.timestamp)}</td>
            <td>
                <button onclick="openEditModal('employee_codes', '${d.id}')" class="btn btn-sm btn-outline" title="Edit Employee" style="margin-right:5px; color: #6366f1; border-color: #6366f1; padding: 5px 10px; font-size: 0.8em;">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteEmployee('${d.id}')" class="btn btn-sm" title="Delete Employee" style="background: #ef4444; color: white; padding: 5px 10px; font-size: 0.8em;">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>`;
    });
}

function renderBusinesses(data) {
    const bizBody = document.getElementById("bizBody");
    bizBody.innerHTML = "";

    if (data.length === 0) {
        bizBody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 30px; color: var(--text-muted);">No businesses found</td></tr>`;
        return;
    }

    data.forEach(d => {
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
                <button onclick="openEditModal('businesses', '${d.id}')" class="btn btn-sm btn-outline" title="Edit Business" style="margin-right:5px; color: #6366f1; border-color: #6366f1; padding: 5px 10px; font-size: 0.8em;">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteBusiness('${d.id}')" class="btn btn-sm" title="Delete Business" style="background: #ef4444; color: white; padding: 5px 10px; font-size: 0.8em;">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>`;
    });
}

// Save Edit using Toast
async function saveEdit() {
    if (!currentEditId || !currentEditCollection) return;

    toggleLoader(true);
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
        showToast("Updated successfully!", "success");
        closeEditModal();
        loadData();
    } catch (error) {
        console.error("Error updating: ", error);
        showToast("Error update: " + error.message, "error");
    } finally {
        toggleLoader(false);
    }
}

// Delete functions using Toast
async function deleteLead(docId) {
    if (!docId) return;
    if (confirm("Are you sure you want to delete this lead?")) {
        toggleLoader(true);
        try {
            await db.collection("leads").doc(docId).delete();
            showToast("Lead deleted successfully", "success");
            loadData();
        } catch (error) {
            console.error("Error removing: ", error);
            showToast("Error deleting: " + error.message, "error");
        } finally {
            toggleLoader(false);
        }
    }
}

async function deleteEmployee(docId) {
    if (!docId) return;
    if (confirm("Are you sure you want to delete this employee code?")) {
        toggleLoader(true);
        try {
            await db.collection("employee_codes").doc(docId).delete();
            showToast("Employee code deleted", "success");
            loadData();
        } catch (error) {
            console.error("Error removing: ", error);
            showToast("Error deleting: " + error.message, "error");
        } finally {
            toggleLoader(false);
        }
    }
}

async function deleteBusiness(docId) {
    if (!docId) return;
    if (confirm("Are you sure you want to delete this business?")) {
        toggleLoader(true);
        try {
            await db.collection("businesses").doc(docId).delete();
            showToast("Business deleted successfully", "success");
            loadData();
        } catch (error) {
            console.error("Error removing: ", error);
            showToast("Error deleting: " + error.message, "error");
        } finally {
            toggleLoader(false);
        }
    }
}

async function generateCode() {
    const name = document.getElementById('empName').value;
    if (!name) return showToast("Enter employee name", "error");

    const code = "UN" + Math.random().toString(36).substring(2, 7).toUpperCase();

    toggleLoader(true);
    try {
        await db.collection("employee_codes").add({
            name: name,
            code: code,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        document.getElementById('empName').value = "";
        loadData();
        showToast("Generated Code: " + code, "success");
    } catch (e) {
        console.error(e);
        showToast("Error generating code", "error");
    } finally {
        toggleLoader(false);
    }
}



// Sidebar Toggle
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const grid = document.querySelector('.dashboard-grid');
    const btnIcon = sidebar.querySelector('button i');
    const menuTitle = document.getElementById('menuTitle');

    sidebar.classList.toggle('collapsed');
    grid.classList.toggle('collapsed-mode');

    if (sidebar.classList.contains('collapsed')) {
        menuTitle.style.display = 'none';
        btnIcon.classList.remove('fa-bars');
        btnIcon.classList.add('fa-chevron-right');
    } else {
        menuTitle.style.display = 'block';
        btnIcon.classList.remove('fa-chevron-right');
        btnIcon.classList.add('fa-bars');
    }
}
