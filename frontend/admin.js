const API_URL = "http://localhost:5000/api";

const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token || role !== "Admin") {
    window.location.href = "index.html";
}

// ================= API CONNECTION =================

async function apiRequest(endpoint, options = {}) {
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...options.headers
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Request failed.");
    }

    return data;
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}

function formatDate(value) {
    if (!value) return "-";

    const date = new Date(value);

    return isNaN(date)
        ? "-"
        : date.toLocaleDateString();
}

// ================= NAVIGATION =================

const navLinks = document.querySelectorAll(".sidebar a.nav-link");
const sections = document.querySelectorAll(".content-section");

function showSection(sectionId) {
    sections.forEach(section => {
        section.style.display =
            section.id === sectionId ? "block" : "none";

        section.classList.toggle(
            "active-section",
            section.id === sectionId
        );
    });

    navLinks.forEach(link => {
        link.classList.toggle(
            "active",
            link.dataset.section === sectionId
        );
    });

    const title = document.getElementById("pageTitle");

    if (title) {
        title.textContent =
            sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
    }
}

navLinks.forEach(link => {
    link.addEventListener("click", event => {
        event.preventDefault();
        showSection(link.dataset.section);
    });
});

document.querySelectorAll('[data-target]').forEach(button => {
    button.addEventListener("click", () => {
        showSection(button.dataset.target);
    });
});

// ================= TABLE HELPERS =================

function renderTable(tableId, records, columns, type) {
    const table = document.getElementById(tableId);

    if (!table) return;

    if (!records.length) {
        table.innerHTML = `
            <tr>
                <td colspan="${columns.length + 1}">
                    No records found.
                </td>
            </tr>
        `;
        return;
    }

    table.innerHTML = records.map(record => `
        <tr>
            ${columns.map(column => `
                <td>${escapeHTML(
                    column.format
                        ? column.format(record[column.key])
                        : record[column.key]
                )}</td>
            `).join("")}

            ${type !== "users" ? `
                <td>
                    <button class="edit-btn"
                        data-action="edit"
                        data-type="${type}"
                        data-id="${escapeHTML(record[type + "Id"] || record.requestId || record.scheduleId)}">
                        Edit
                    </button>

                    <button class="delete-btn"
                        data-action="delete"
                        data-type="${type}"
                        data-id="${escapeHTML(record[type + "Id"] || record.requestId || record.scheduleId)}">
                        Delete
                    </button>
                </td>
            ` : ""}
        </tr>
    `).join("");
}

// ================= STORED RECORDS =================

let residents = [];
let collectors = [];
let vehicles = [];
let requests = [];
let schedules = [];
let users = [];

async function loadResidents() {
    residents = await apiRequest("/residents");

    renderTable("residentsTable", residents, [
        { key: "residentId" },
        { key: "fullName" },
        { key: "phone" },
        { key: "email" },
        { key: "address" }
    ], "resident");
}

async function loadCollectors() {
    collectors = await apiRequest("/collectors");

    renderTable("collectorsTable", collectors, [
        { key: "collectorId" },
        { key: "fullName" },
        { key: "phone" },
        { key: "email" },
        { key: "status" }
    ], "collector");
}

async function loadVehicles() {
    vehicles = await apiRequest("/vehicles");

    renderTable("vehiclesTable", vehicles, [
        { key: "vehicleId" },
        { key: "registrationNumber" },
        { key: "vehicleType" },
        { key: "capacityKg" },
        { key: "status" }
    ], "vehicle");
}

async function loadRequests() {
    requests = await apiRequest("/waste-requests");

    renderTable("requestsTable", requests, [
        { key: "requestId" },
        { key: "residentId" },
        { key: "wasteType" },
        { key: "pickupAddress" },
        { key: "status" },
        { key: "createdAt", format: formatDate }
    ], "request");

    renderTable("recentRequests", requests.slice(0, 5), [
        { key: "requestId" },
        { key: "residentId" },
        { key: "wasteType" },
        { key: "status" }
    ], "users");

    document.getElementById("requestCount").textContent =
        requests.length;
}

async function loadSchedules() {
    schedules = await apiRequest("/schedules");

    renderTable("schedulesTable", schedules, [
        { key: "scheduleId" },
        { key: "collectorId" },
        { key: "vehicleId" },
        { key: "collectionDate", format: formatDate },
        { key: "area" },
        { key: "status" }
    ], "schedule");
}

async function loadUsers() {
    users = await apiRequest("/users");

    renderTable("usersTable", users, [
        { key: "userId" },
        { key: "email" },
        { key: "role" },
        { key: "status" },
        { key: "createdAt", format: formatDate }
    ], "users");
}

// ================= DASHBOARD STATISTICS =================

async function loadDashboard() {
    try {
        await Promise.all([
            loadResidents(),
            loadCollectors(),
            loadVehicles(),
            loadRequests(),
            loadSchedules(),
            loadUsers()
        ]);

        document.getElementById("residentCount").textContent =
            residents.length;

        document.getElementById("collectorCount").textContent =
            collectors.length;

        document.getElementById("vehicleCount").textContent =
            vehicles.length;

        document.getElementById("requestCount").textContent =
            requests.length;

    } catch (error) {
        console.error("Dashboard error:", error.message);
        alert("Some dashboard information could not load: " + error.message);
    }
}

// ================= DYNAMIC FORMS =================

function showForm(containerId, title, fields, endpoint, method, reloadFunction) {
    const container = document.getElementById(containerId);

    if (!container) return;

    container.style.display = "block";

    container.innerHTML = `
        <form id="dynamicForm">
            <h3>${title}</h3>

            ${fields.map(field => `
                <label>${field.label}</label>

                ${field.options ? `
                    <select name="${field.name}" required>
                        ${field.options.map(option => `
                            <option value="${option}">${option}</option>
                        `).join("")}
                    </select>
                ` : `
                    <input
                        type="${field.type || "text"}"
                        name="${field.name}"
                        placeholder="${field.label}"
                        ${field.required === false ? "" : "required"}
                        ${field.step ? `step="${field.step}"` : ""}
                    >
                `}
            `).join("")}

            <button type="submit">Save</button>
            <button type="button" id="cancelForm">Cancel</button>

            <p id="formMessage"></p>
        </form>
    `;

    document.getElementById("cancelForm").onclick = () => {
        container.style.display = "none";
        container.innerHTML = "";
    };

    document.getElementById("dynamicForm").onsubmit = async event => {
        event.preventDefault();

        const formData = new FormData(event.target);
        const body = Object.fromEntries(formData.entries());

        try {
            await apiRequest(endpoint, {
                method,
                body: JSON.stringify(body)
            });

            alert("Record saved successfully.");

            container.style.display = "none";
            container.innerHTML = "";

            await reloadFunction();
            await updateStatistics();

        } catch (error) {
            document.getElementById("formMessage").textContent =
                error.message;
        }
    };
}

async function updateStatistics() {
    document.getElementById("residentCount").textContent =
        residents.length;

    document.getElementById("collectorCount").textContent =
        collectors.length;

    document.getElementById("vehicleCount").textContent =
        vehicles.length;

    document.getElementById("requestCount").textContent =
        requests.length;
}

// ================= ADD RESIDENT =================

document.getElementById("addResidentBtn").onclick = () => {
    showForm("residentFormContainer", "Add Resident", [
        { name: "fullName", label: "Full Name" },
        { name: "phone", label: "Phone Number" },
        { name: "email", label: "Email", type: "email" },
        { name: "address", label: "Address" },
        { name: "houseNumber", label: "House Number" }
    ], "/residents", "POST", loadResidents);
};

// ================= ADD COLLECTOR =================

document.getElementById("addCollectorBtn").onclick = () => {
    showForm("collectorFormContainer", "Add Collector", [
        { name: "fullName", label: "Full Name" },
        { name: "phone", label: "Phone Number" },
        { name: "email", label: "Email", type: "email" },
        {
            name: "password",
            label: "Temporary Password (minimum 8 characters)",
            type: "password"
        },
        {
            name: "status",
            label: "Status",
            options: ["Active", "Inactive"]
        }
    ], "/collectors", "POST", loadCollectors);
};

// ================= ADD VEHICLE =================

document.getElementById("addVehicleBtn").onclick = () => {
    showForm("vehicleFormContainer", "Add Vehicle", [
        { name: "registrationNumber", label: "Registration Number" },
        { name: "vehicleType", label: "Vehicle Type" },
        {
            name: "capacityKg",
            label: "Capacity (kg)",
            type: "number",
            step: "any"
        },
        {
            name: "status",
            label: "Status",
            options: ["Active", "Inactive"]
        }
    ], "/vehicles", "POST", loadVehicles);
};

// ================= ADD SCHEDULE =================

document.getElementById("addScheduleBtn").onclick = () => {
    showForm("scheduleFormContainer", "Create Schedule", [
        { name: "collectorId", label: "Collector ID" },
        { name: "vehicleId", label: "Vehicle ID" },
        { name: "collectionDate", label: "Collection Date", type: "date" },
        { name: "area", label: "Collection Area" },
        {
            name: "status",
            label: "Status",
            options: ["Scheduled", "In Progress", "Completed", "Cancelled"]
        }
    ], "/schedules", "POST", loadSchedules);
};

// ================= EDIT AND DELETE =================

document.addEventListener("click", async event => {
    const button = event.target.closest("[data-action]");

    if (!button) return;

    const action = button.dataset.action;
    const type = button.dataset.type;
    const id = button.dataset.id;

    const configurations = {
        resident: {
            collection: residents,
            endpoint: "/residents/",
            reload: loadResidents,
            fields: [
                { name: "fullName", label: "Full Name" },
                { name: "phone", label: "Phone Number" },
                { name: "email", label: "Email", type: "email" },
                { name: "address", label: "Address" },
                { name: "houseNumber", label: "House Number" }
            ],
            idField: "residentId"
        },

        collector: {
            collection: collectors,
            endpoint: "/collectors/",
            reload: loadCollectors,
            fields: [
                { name: "fullName", label: "Full Name" },
                { name: "phone", label: "Phone Number" },
                { name: "email", label: "Email", type: "email" },
                {
                    name: "status",
                    label: "Status",
                    options: ["Active", "Inactive"]
                }
            ],
            idField: "collectorId"
        },

        vehicle: {
            collection: vehicles,
            endpoint: "/vehicles/",
            reload: loadVehicles,
            fields: [
                { name: "registrationNumber", label: "Registration Number" },
                { name: "vehicleType", label: "Vehicle Type" },
                {
                    name: "capacityKg",
                    label: "Capacity (kg)",
                    type: "number",
                    step: "any"
                },
                {
                    name: "status",
                    label: "Status",
                    options: ["Active", "Inactive"]
                }
            ],
            idField: "vehicleId"
        },

        request: {
            collection: requests,
            endpoint: "/waste-requests/",
            reload: loadRequests,
            fields: [
                {
                    name: "status",
                    label: "Request Status",
                    options: ["Pending", "Approved", "Assigned", "Collected", "Rejected"]
                }
            ],
            idField: "requestId"
        },

        schedule: {
            collection: schedules,
            endpoint: "/schedules/",
            reload: loadSchedules,
            fields: [
                { name: "collectorId", label: "Collector ID" },
                { name: "vehicleId", label: "Vehicle ID" },
                { name: "collectionDate", label: "Collection Date", type: "date" },
                { name: "area", label: "Area" },
                {
                    name: "status",
                    label: "Status",
                    options: ["Scheduled", "In Progress", "Completed", "Cancelled"]
                }
            ],
            idField: "scheduleId"
        }
    };

    const config = configurations[type];

    if (!config) return;

    if (action === "delete") {
        if (!confirm("Are you sure you want to delete this record?")) {
            return;
        }

        try {
            await apiRequest(config.endpoint + id, {
                method: "DELETE"
            });

            alert("Record deleted successfully.");

            await config.reload();
            await updateStatistics();

        } catch (error) {
            alert(error.message);
        }
    }

    if (action === "edit") {
        const record = config.collection.find(
            item => item[config.idField] === id
        );

        if (!record) {
            alert("Record not found.");
            return;
        }

        const containerId = {
            resident: "residentFormContainer",
            collector: "collectorFormContainer",
            vehicle: "vehicleFormContainer",
            request: "requests",
            schedule: "scheduleFormContainer"
        }[type];

        const container = document.getElementById(containerId);

        if (type === "request") {
            const newStatus = prompt(
                "Enter new status:\nPending, Approved, Assigned, Collected, Rejected",
                record.status
            );

            if (!newStatus) return;

            try {
                await apiRequest(config.endpoint + id, {
                    method: "PUT",
                    body: JSON.stringify({ status: newStatus })
                });

                await config.reload();
                alert("Request updated.");

            } catch (error) {
                alert(error.message);
            }

            return;
        }

        showForm(
            containerId,
            "Edit " + type,
            config.fields.map(field => ({
                ...field,
                value: record[field.name]
            })),
            config.endpoint + id,
            "PUT",
            config.reload
        );

        const form = document.getElementById("dynamicForm");

        config.fields.forEach(field => {
            const input = form.elements[field.name];

            if (input && record[field.name] !== undefined) {
                input.value = record[field.name];
            }
        });
    }
});

// ================= LOGOUT =================

document.getElementById("logoutBtn").onclick = () => {
    localStorage.clear();
    window.location.href = "index.html";
};

// ================= START DASHBOARD =================

loadDashboard();