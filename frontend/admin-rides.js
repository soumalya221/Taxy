// ======================================================
// RIDENOW ADMIN - RIDE MANAGEMENT
// ======================================================


// ======================================================
// API
// ======================================================

const API_BASE_URL = "http://localhost:8080";


// ======================================================
// STATE
// ======================================================

let currentStatus = "ALL";


// ======================================================
// AUTH
// ======================================================

function getToken() {

    return localStorage.getItem("token");
}


// ======================================================
// STORED USER
// ======================================================

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
// ADMIN NAME
// ======================================================

function loadAdminName() {

    const element =
        document.getElementById("adminName");

    if (!element) {
        return;
    }


    const user =
        getStoredUser();


    if (user) {

        element.textContent =
            user.name ||
            user.email ||
            "Administrator";

        return;
    }


    element.textContent =
        "Administrator";
}


// ======================================================
// LOGOUT
// ======================================================

function logoutAdmin() {

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    localStorage.removeItem("role");

    window.location.href =
        "login.html";
}


// ======================================================
// ERROR
// ======================================================

function showError(message) {

    const element =
        document.getElementById(
            "errorMessage"
        );

    if (!element) {
        return;
    }


    element.textContent =
        message;

    element.style.display =
        "block";
}


function hideError() {

    const element =
        document.getElementById(
            "errorMessage"
        );

    if (!element) {
        return;
    }


    element.textContent = "";

    element.style.display =
        "none";
}


// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";
    }


    return String(value)

        .replaceAll("&", "&amp;")

        .replaceAll("<", "&lt;")

        .replaceAll(">", "&gt;")

        .replaceAll('"', "&quot;")

        .replaceAll("'", "&#039;");
}


// ======================================================
// FORMAT NUMBER
// ======================================================

function formatNumber(
    value,
    decimals = 2
) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return "-";
    }


    const number =
        Number(value);


    if (Number.isNaN(number)) {
        return "-";
    }


    return number.toFixed(
        decimals
    );
}


// ======================================================
// STATUS CLASS
// ======================================================

function getStatusClass(status) {

    if (!status) {
        return "";
    }


    return status
        .toLowerCase()
        .replaceAll("_", "-");
}


// ======================================================
// STATUS ICON
// ======================================================

function getStatusIcon(status) {

    switch (status) {

        case "REQUESTED":
            return "fa-clock";

        case "ACCEPTED":
            return "fa-check";

        case "STARTED":
            return "fa-play";

        case "COMPLETED":
            return "fa-flag-checkered";

        default:
            return "fa-circle";
    }
}


// ======================================================
// RENDER RIDE CARD
// ======================================================

function createRideCard(ride) {

    const status =
        ride.status || "UNKNOWN";


    const statusClass =
        getStatusClass(status);


    const statusIcon =
        getStatusIcon(status);


    const customer =
        ride.customer ||
        "Not available";


    const driver =
        ride.driver ||
        "Not assigned";


    const vehicle =
        ride.vehicle ||
        "Not assigned";


    const pickup =
        ride.pickupLocation ||
        "-";


    const drop =
        ride.dropLocation ||
        "-";


    const distance =
        formatNumber(
            ride.distance
        );


    const duration =
        formatNumber(
            ride.durationMinutes
        );


    const fare =
        ride.fare !== null &&
        ride.fare !== undefined
            ? Number(ride.fare).toFixed(2)
            : "0.00";


    return `

        <article class="ride-card">


            <!-- =========================================
                 HEADER
                 ========================================= -->

            <div class="ride-card-header">

                <div class="ride-id">

                    Ride #${escapeHtml(
                        ride.id
                    )}

                </div>


                <span
                    class="status-badge ${statusClass}"
                >

                    <i
                        class="fa-solid ${statusIcon}"
                    ></i>

                    ${escapeHtml(status)}

                </span>

            </div>



            <!-- =========================================
                 LOCATION
                 ========================================= -->

            <div class="location-row">


                <div class="info-box">

                    <span class="info-label">
                        Pickup
                    </span>

                    <span
                        class="info-value"
                        title="${escapeHtml(pickup)}"
                    >
                        ${escapeHtml(pickup)}
                    </span>

                </div>


                <div class="info-box">

                    <span class="info-label">
                        Destination
                    </span>

                    <span
                        class="info-value"
                        title="${escapeHtml(drop)}"
                    >
                        ${escapeHtml(drop)}
                    </span>

                </div>


            </div>



            <!-- =========================================
                 CUSTOMER
                 ========================================= -->

            <div class="info-box">

                <span class="info-label">
                    Customer
                </span>

                <span
                    class="info-value"
                    title="${escapeHtml(customer)}"
                >
                    ${escapeHtml(customer)}
                </span>

            </div>



            <!-- =========================================
                 DRIVER / VEHICLE
                 ========================================= -->

            <div class="assignment-row">


                <div class="assignment-box">

                    <span class="info-label">
                        Driver
                    </span>

                    <span
                        class="info-value ${
                            ride.driver
                                ? ""
                                : "empty"
                        }"
                    >
                        ${escapeHtml(driver)}
                    </span>

                </div>


                <div class="assignment-box">

                    <span class="info-label">
                        Vehicle
                    </span>

                    <span
                        class="info-value ${
                            ride.vehicle
                                ? ""
                                : "empty"
                        }"
                    >
                        ${escapeHtml(vehicle)}
                    </span>

                </div>


            </div>



            <!-- =========================================
                 RIDE INFORMATION
                 ========================================= -->

            <div class="ride-info-grid">


                <div class="ride-info-box">

                    <span class="info-label">
                        Distance
                    </span>

                    <span class="info-value">

                        ${distance} km

                    </span>

                </div>


                <div class="ride-info-box">

                    <span class="info-label">
                        Duration
                    </span>

                    <span class="info-value">

                        ${duration} minutes

                    </span>

                </div>


            </div>



            <!-- =========================================
                 FARE
                 ========================================= -->

            <div class="fare-box">

                <span class="info-label">
                    Fare
                </span>

                <span class="fare-value">

                    ₹${fare}

                </span>

            </div>


        </article>
    `;
}


// ======================================================
// RENDER RIDES
// ======================================================

function renderRides(rides) {

    const container =
        document.getElementById(
            "ridesContainer"
        );


    const count =
        document.getElementById(
            "rideCount"
        );


    if (!container) {
        return;
    }


    if (count) {

        count.textContent =
            rides.length;
    }


    if (
        !Array.isArray(rides) ||
        rides.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-state">

                <i
                    class="fa-solid fa-route"
                ></i>

                <h3>
                    No rides found
                </h3>

                <p>
                    There are no rides
                    matching this status.
                </p>

            </div>

        `;

        return;
    }


    container.innerHTML =
        rides
            .map(createRideCard)
            .join("");
}


// ======================================================
// LOAD RIDES
// ======================================================

async function loadRides() {

    const token =
        getToken();


    if (!token) {

        window.location.href =
            "login.html";

        return;
    }


    hideError();


    const refreshBtn =
        document.getElementById(
            "refreshBtn"
        );


    if (refreshBtn) {

        refreshBtn.classList.add(
            "loading"
        );

        refreshBtn.innerHTML = `

            <i
                class="fa-solid fa-spinner fa-spin"
            ></i>

            Loading...

        `;
    }


    const container =
        document.getElementById(
            "ridesContainer"
        );


    if (container) {

        container.innerHTML = `

            <div class="loading-state">

                <i
                    class="fa-solid fa-spinner fa-spin"
                ></i>

                Loading rides...

            </div>

        `;
    }


    try {

        let url =
            API_BASE_URL +
            "/api/admin/rides";


        if (
            currentStatus &&
            currentStatus !== "ALL"
        ) {

            url +=
                "?status=" +
                encodeURIComponent(
                    currentStatus
                );
        }


        const response =
            await fetch(
                url,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            "Bearer " +
                            token,

                        "Content-Type":
                            "application/json"
                    }
                }
            );


        // ================================================
        // UNAUTHORIZED
        // ================================================

        if (
            response.status === 401
        ) {

            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "user"
            );

            localStorage.removeItem(
                "role"
            );

            window.location.href =
                "login.html";

            return;
        }


        // ================================================
        // FORBIDDEN
        // ================================================

        if (
            response.status === 403
        ) {

            showError(
                "Access denied. Admin privileges are required."
            );

            return;
        }


        // ================================================
        // OTHER ERROR
        // ================================================

        if (!response.ok) {

            throw new Error(
                "Unable to load rides."
            );
        }


        // ================================================
        // SUCCESS
        // ================================================

        const rides =
            await response.json();


        renderRides(
            Array.isArray(rides)
                ? rides
                : []
        );


    } catch (error) {

        console.error(
            "Admin rides error:",
            error
        );


        showError(
            error.message ||
            "Unable to load rides."
        );


        if (container) {

            container.innerHTML = `

                <div class="empty-state">

                    <i
                        class="fa-solid fa-triangle-exclamation"
                    ></i>

                    <h3>
                        Unable to load rides
                    </h3>

                    <p>
                        Check that the backend
                        is running and try again.
                    </p>

                </div>

            `;
        }


    } finally {

        if (refreshBtn) {

            refreshBtn.classList.remove(
                "loading"
            );

            refreshBtn.innerHTML = `

                <i
                    class="fa-solid fa-rotate"
                ></i>

                Refresh

            `;
        }
    }
}


// ======================================================
// FILTER
// ======================================================

function setupFilters() {

    const buttons =
        document.querySelectorAll(
            ".filter-btn"
        );


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                function () {

                    buttons.forEach(
                        item =>
                            item.classList.remove(
                                "active"
                            )
                    );


                    this.classList.add(
                        "active"
                    );


                    currentStatus =
                        this.dataset.status ||
                        "ALL";


                    loadRides();

                }
            );

        }
    );
}


// ======================================================
// PAGE INITIALIZATION
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadAdminName();

        setupFilters();

        loadRides();


        const refreshBtn =
            document.getElementById(
                "refreshBtn"
            );


        if (refreshBtn) {

            refreshBtn.addEventListener(
                "click",
                loadRides
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