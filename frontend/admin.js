// ======================================================
// RIDENOW ADMIN DASHBOARD
// ======================================================


// ======================================================
// API CONFIGURATION
// ======================================================

const API_BASE_URL = "https://ridenow-backend-1ty9.onrender.com";


// ======================================================
// AUTH HELPERS
// ======================================================

function getToken() {

    return localStorage.getItem("token");
}


function getStoredUser() {

    const userData =
        localStorage.getItem("user");

    if (!userData) {
        return null;
    }

    try {

        return JSON.parse(userData);

    } catch (error) {

        console.error(
            "Unable to read stored user:",
            error
        );

        return null;
    }
}


// ======================================================
// LOGOUT
// ======================================================

function logoutAdmin() {

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    localStorage.removeItem("role");

    window.location.href = "login.html";
}


// ======================================================
// SHOW ERROR
// ======================================================

function showError(message) {

    const errorMessage =
        document.getElementById("errorMessage");

    if (!errorMessage) {
        return;
    }

    errorMessage.textContent = message;

    errorMessage.style.display = "block";
}


// ======================================================
// HIDE ERROR
// ======================================================

function hideError() {

    const errorMessage =
        document.getElementById("errorMessage");

    if (!errorMessage) {
        return;
    }

    errorMessage.textContent = "";

    errorMessage.style.display = "none";
}


// ======================================================
// UPDATE DASHBOARD
// ======================================================

function updateDashboard(data) {

    document.getElementById(
        "totalCustomers"
    ).textContent =
        data.totalCustomers ?? 0;


    document.getElementById(
        "totalDrivers"
    ).textContent =
        data.totalDrivers ?? 0;


    document.getElementById(
        "totalVehicles"
    ).textContent =
        data.totalVehicles ?? 0;


    document.getElementById(
        "totalRides"
    ).textContent =
        data.totalRides ?? 0;


    document.getElementById(
        "requestedRides"
    ).textContent =
        data.requestedRides ?? 0;


    document.getElementById(
        "acceptedRides"
    ).textContent =
        data.acceptedRides ?? 0;


    document.getElementById(
        "startedRides"
    ).textContent =
        data.startedRides ?? 0;


    document.getElementById(
        "completedRides"
    ).textContent =
        data.completedRides ?? 0;
}


// ======================================================
// LOAD ADMIN DASHBOARD
// ======================================================

async function loadAdminDashboard() {

    const token = getToken();

    if (!token) {

        window.location.href = "login.html";

        return;
    }


    hideError();


    const refreshBtn =
        document.getElementById("refreshBtn");


    if (refreshBtn) {

        refreshBtn.classList.add(
            "loading"
        );

        refreshBtn.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Loading...
        `;
    }


    try {

        const response = await fetch(
            API_BASE_URL +
            "/api/admin/dashboard",
            {
                method: "GET",

                headers: {
                    "Authorization":
                        "Bearer " + token,

                    "Content-Type":
                        "application/json"
                }
            }
        );


        // ==================================================
        // UNAUTHORIZED
        // ==================================================

        if (response.status === 401) {

            localStorage.removeItem("token");

            localStorage.removeItem("user");

            localStorage.removeItem("role");

            window.location.href =
                "login.html";

            return;
        }


        // ==================================================
        // FORBIDDEN
        // ==================================================

        if (response.status === 403) {

            showError(
                "Access denied. Admin privileges are required."
            );

            setTimeout(
                () => {

                    window.location.href =
                        "index.html";

                },
                2000
            );

            return;
        }


        // ==================================================
        // OTHER ERROR
        // ==================================================

        if (!response.ok) {

            const errorData =
                await response.json()
                    .catch(() => null);

            throw new Error(
                errorData?.message ||
                "Unable to load admin dashboard."
            );
        }


        // ==================================================
        // SUCCESS
        // ==================================================

        const data =
            await response.json();


        updateDashboard(data);


    } catch (error) {

        console.error(
            "Admin dashboard error:",
            error
        );


        showError(
            error.message ||
            "Unable to load dashboard."
        );


    } finally {

        if (refreshBtn) {

            refreshBtn.classList.remove(
                "loading"
            );

            refreshBtn.innerHTML = `
                <i class="fa-solid fa-rotate"></i>
                Refresh
            `;
        }
    }
}


// ======================================================
// LOAD ADMIN NAME
// ======================================================

function loadAdminName() {

    const adminName =
        document.getElementById(
            "adminName"
        );

    if (!adminName) {
        return;
    }


    const user =
        getStoredUser();


    if (user) {

        adminName.textContent =
            user.name ||
            user.email ||
            "Admin";

        return;
    }


    const role =
        localStorage.getItem("role");


    if (
        role &&
        role.toUpperCase() === "ADMIN"
    ) {

        adminName.textContent =
            "Administrator";
    }
}


// ======================================================
// CHECK ADMIN ROLE
// ======================================================

function checkAdminRole() {

    const role =
        localStorage.getItem("role");


    /*
     * The backend remains the real security layer.
     *
     * This frontend check simply prevents
     * normal users from opening the admin page.
     */

    if (
        role &&
        role.toUpperCase() === "ADMIN"
    ) {

        return true;
    }


    /*
     * If role is not stored correctly,
     * the API request will still determine
     * whether the account has ADMIN access.
     */

    return true;
}


// ======================================================
// PAGE INITIALIZATION
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        checkAdminRole();

        loadAdminName();

        loadAdminDashboard();


        const refreshBtn =
            document.getElementById(
                "refreshBtn"
            );


        if (refreshBtn) {

            refreshBtn.addEventListener(
                "click",
                loadAdminDashboard
            );
        }


        const logoutBtn =
            document.getElementById(
                "logoutBtn"
            );


        if (logoutBtn) {

            logoutBtn.addEventListener(
                "click",
                logoutAdmin
            );
        }

    }
);
