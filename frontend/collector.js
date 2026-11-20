const API_URL = "http://localhost:5000/api";

const token = localStorage.getItem("token");

let collectorId = null;
let assignedRequests = [];

// Check login and collector access
if (!token) {
    window.location.href = "index.html";
} else {
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));

        if (payload.role !== "Collector") {
            alert("Access denied. Collector account required.");
            window.location.href = "index.html";
        } else {
            collectorId = payload.collectorId;

            document.getElementById("collectorName").textContent =
                collectorId || "Collector";

            loadCollectorDashboard();
        }
    } catch (error) {
        localStorage.removeItem("token");
        window.location.href = "index.html";
    }
}


// API REQUEST FUNCTION
async function apiRequest(endpoint, method = "GET", body = null) {
    const options = {
        method,
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_URL}${endpoint}`, options);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Something went wrong.");
    }

    return data;
}


// LOAD DASHBOARD
async function loadCollectorDashboard() {
    try {
        await loadAssignedRequests();
    } catch (error) {
        showMessage(error.message, "error");
    }
}


// LOAD ASSIGNED REQUESTS
async function loadAssignedRequests() {
    const data = await apiRequest("/waste-requests/collector");

    assignedRequests = Array.isArray(data)
        ? data
        : data.requests || [];

    updateStatistics();
    displayAssignedRequests();
}


// UPDATE DASHBOARD STATISTICS
function updateStatistics() {
    const total = assignedRequests.length;

    const pending = assignedRequests.filter(
        request => request.status === "Assigned"
    ).length;

    const completed = assignedRequests.filter(
        request => request.status === "Collected"
    ).length;

    document.getElementById("totalAssigned").textContent = total;
    document.getElementById("pendingCount").textContent = pending;
    document.getElementById("completedCount").textContent = completed;
}


// PREVENT HTML INJECTION
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}


// DISPLAY ASSIGNED REQUESTS
function displayAssignedRequests() {
    const table = document.getElementById("assignedRequestsTable");

    if (assignedRequests.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="8">You currently have no assigned requests.</td>
            </tr>
        `;
        return;
    }

    table.innerHTML = assignedRequests.map(request => {
        const status = request.status || "Assigned";

        const collectionDate = request.collectionDate
            ? new Date(request.collectionDate).toLocaleDateString()
            : "Not scheduled";

        const actionButton = status === "Assigned"
            ? `<button class="collect-btn" data-request-id="${escapeHTML(request.requestId)}">
                    Mark as Collected
               </button>`
            : `<span class="status status-collected">Completed</span>`;

        return `
            <tr>
                <td>${escapeHTML(request.requestId)}</td>
                <td>${escapeHTML(request.residentId)}</td>
                <td>${escapeHTML(request.wasteType)}</td>
                <td>${escapeHTML(request.quantity ?? "Not specified")}</td>
                <td>${escapeHTML(request.pickupAddress)}</td>
                <td>${escapeHTML(collectionDate)}</td>
                <td>
                    <span class="status ${status === "Collected" ? "status-collected" : "status-assigned"}">
                        ${escapeHTML(status)}
                    </span>
                </td>
                <td>${actionButton}</td>
            </tr>
        `;
    }).join("");
}


// MARK REQUEST AS COLLECTED
document.getElementById("assignedRequestsTable").addEventListener("click", async function(event) {
    const button = event.target.closest(".collect-btn");

    if (!button) return;

    const requestId = button.dataset.requestId;

    const confirmed = confirm(
        `Are you sure you have completed collection for ${requestId}?`
    );

    if (!confirmed) return;

    try {
        button.disabled = true;
        button.textContent = "Updating...";

        await apiRequest(
            `/waste-requests/${encodeURIComponent(requestId)}/collect`,
            "PUT"
        );

        showMessage("Collection marked as completed successfully!", "success");

        await loadAssignedRequests();

    } catch (error) {
        showMessage(error.message, "error");
        button.disabled = false;
        button.textContent = "Mark as Collected";
    }
});


// NAVIGATION
document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", function(event) {
        event.preventDefault();

        const sectionId = this.dataset.section;

        document.querySelectorAll(".content-section").forEach(section => {
            section.classList.remove("active-section");
        });

        document.querySelectorAll(".nav-link").forEach(navLink => {
            navLink.classList.remove("active");
        });

        document.getElementById(sectionId).classList.add("active-section");
        this.classList.add("active");

        document.getElementById("pageTitle").textContent =
            sectionId === "overview" ? "Collector Dashboard" : "My Assignments";
    });
});


// DISPLAY MESSAGES
function showMessage(message, type) {
    const messageElement = document.getElementById("dashboardMessage");

    messageElement.textContent = message;
    messageElement.style.color =
        type === "success" ? "green" : "red";

    setTimeout(() => {
        messageElement.textContent = "";
    }, 5000);
}


// LOGOUT
document.getElementById("logoutBtn").addEventListener("click", function() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "index.html";
});