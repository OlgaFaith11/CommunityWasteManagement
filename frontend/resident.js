const API_URL = "http://localhost:5000/api";

const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

// Ensure only logged-in residents access this dashboard
if (!token || role !== "Resident") {
    window.location.href = "index.html";
}

// Get resident ID from the login token
function getResidentId() {
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.residentId;
    } catch (error) {
        return null;
    }
}

const residentId = getResidentId();

// Reusable API function
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

// Handle dashboard navigation
document.querySelectorAll(".sidebar nav a").forEach(link => {
    link.addEventListener("click", event => {
        event.preventDefault();

        const sectionId = link.dataset.section;

        document.querySelectorAll("main section").forEach(section => {
            section.style.display =
                section.id === sectionId ? "block" : "none";
        });

        if (sectionId === "profileSection") loadProfile();
        if (sectionId === "requestsSection") loadRequests();
    });
});

// Load resident profile
async function loadProfile() {
    const profile = document.getElementById("profileDetails");

    if (!residentId) {
        profile.textContent = "Resident account information could not be identified.";
        return;
    }

    try {
        const resident = await apiRequest(`/residents/${residentId}`);

        profile.innerHTML = `
            <p><strong>Resident ID:</strong> ${resident.residentId}</p>
            <p><strong>Full Name:</strong> ${resident.fullName}</p>
            <p><strong>Phone:</strong> ${resident.phone}</p>
            <p><strong>Email:</strong> ${resident.email}</p>
            <p><strong>Address:</strong> ${resident.address}</p>
            <p><strong>House Number:</strong> ${resident.houseNumber}</p>
        `;
    } catch (error) {
        profile.textContent = error.message;
    }
}

// Load resident waste requests
async function loadRequests() {
    const table = document.getElementById("requestsTable");

    if (!residentId) return;

    try {
        const data = await apiRequest(
            `/waste-requests/resident/${residentId}`
        );

        const requests = Array.isArray(data) ? data : data.requests || [];

        table.innerHTML = "";

        requests.forEach(request => {
            const row = document.createElement("tr");

            [
                request.requestId,
                request.wasteType,
                request.quantity ?? "-",
                request.pickupAddress,
                request.status,
                request.createdAt
                    ? new Date(request.createdAt).toLocaleDateString()
                    : "-"
            ].forEach(value => {
                const cell = document.createElement("td");
                cell.textContent = value ?? "-";
                row.appendChild(cell);
            });

            table.appendChild(row);
        });

        document.getElementById("requestCount").textContent =
            requests.length;

        document.getElementById("pendingCount").textContent =
            requests.filter(request => request.status === "Pending").length;

        document.getElementById("completedCount").textContent =
            requests.filter(request => request.status === "Collected").length;

    } catch (error) {
        console.error("Could not load requests:", error.message);
    }
}

// Submit a new waste collection request
document.getElementById("requestForm").addEventListener("submit", async event => {
    event.preventDefault();

    const message = document.getElementById("requestMessage");

    if (!residentId) {
        message.textContent = "Your resident account could not be identified.";
        return;
    }

    const requestData = {
        residentId,
        wasteType: document.getElementById("wasteType").value,
        quantity: Number(document.getElementById("quantity").value),
        pickupAddress: document.getElementById("pickupAddress").value,
        description: document.getElementById("description").value
    };

    try {
        await apiRequest("/waste-requests", {
            method: "POST",
            body: JSON.stringify(requestData)
        });

        message.textContent = "Waste collection request submitted successfully!";
        document.getElementById("requestForm").reset();

        loadRequests();

    } catch (error) {
        message.textContent = error.message;
    }
});

// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "index.html";
});

// Initial dashboard loading
loadProfile();
loadRequests();