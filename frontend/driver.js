const API_BASE_URL = "http://localhost:8080";

let driverToken = localStorage.getItem("token");

// ======================================================
// AUTH CHECK
// ======================================================

if (!driverToken) {

    alert("Please login first.");

    window.location.href = "login.html";
}


// ======================================================
// HEADERS
// ======================================================

function getHeaders() {

    // Always get the latest token
    driverToken = localStorage.getItem("token");

    return {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + driverToken
    };
}


// ======================================================
// PAGE LOAD
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadAvailableRides();

        loadDriverInfo();

        loadDriverVehicle();

        setupButtons();

    }
);


// ======================================================
// DRIVER INFORMATION
// ======================================================

function loadDriverInfo() {

    const email =
        localStorage.getItem("email");

    const name =
        localStorage.getItem("name");

    const driverName =
        document.getElementById("driverName");

    if (driverName) {

        driverName.innerText =
            name || email || "Driver";
    }
}


// ======================================================
// LOAD DRIVER VEHICLE
// ======================================================

async function loadDriverVehicle() {

    const vehicleDetails =
        document.getElementById("vehicleDetails");

    if (!vehicleDetails) {
        return;
    }

    vehicleDetails.innerHTML = `
        <p class="loading">
            Loading vehicle information...
        </p>
    `;

    try {

        const response = await fetch(
            API_BASE_URL + "/api/vehicles/my-vehicle",
            {
                method: "GET",
                headers: getHeaders()
            }
        );

        if (response.status === 401) {
            logoutDriver();
            return;
        }

        if (!response.ok) {
            const data = await response.json()
                .catch(() => null);

            throw new Error(
                data?.message ||
                "Unable to load vehicle"
            );
        }

        const vehicle = await response.json();

        console.log("Driver vehicle:", vehicle);

        vehicleDetails.innerHTML = `
            <div class="vehicle-grid">
                <div class="vehicle-item">
                    <span>Vehicle</span>
                    <strong>${vehicle.brand} ${vehicle.model}</strong>
                </div>

                <div class="vehicle-item">
                    <span>Registration</span>
                    <strong>${vehicle.vehicleNumber}</strong>
                </div>

                <div class="vehicle-item">
                    <span>Type</span>
                    <strong>${vehicle.vehicleType}</strong>
                </div>

                <div class="vehicle-item">
                    <span>Color</span>
                    <strong>${vehicle.color}</strong>
                </div>

                <div class="vehicle-item">
                    <span>Seats</span>
                    <strong>${vehicle.seatCapacity}</strong>
                </div>

                <div class="vehicle-item">
                    <span>Status</span>
                    <strong class="vehicle-status">${vehicle.status}</strong>
                </div>
            </div>
        `;

    } catch (error) {

        console.error("Vehicle error:", error);

        vehicleDetails.innerHTML = `
            <p class="empty">
                Unable to load vehicle information.
            </p>
        `;
    }
}


// ======================================================
// LOAD AVAILABLE RIDES
// ======================================================

async function loadAvailableRides() {

    const rideList =
        document.getElementById("rideList");

    if (!rideList) {
        return;
    }


    rideList.innerHTML = `
        <p class="loading">
            Loading available rides...
        </p>
    `;


    try {

        const response =
            await fetch(
                API_BASE_URL +
                "/api/rides/available",
                {
                    method: "GET",
                    headers: getHeaders()
                }
            );


        // ==========================================
        // UNAUTHORIZED
        // ==========================================

        if (response.status === 401) {

            alert(
                "Session expired. Please login again."
            );

            logoutDriver();

            return;
        }


        // ==========================================
        // OTHER ERROR
        // ==========================================

        if (!response.ok) {

            const data =
                await response.json()
                    .catch(() => null);

            throw new Error(
                data?.message ||
                "Failed to load available rides"
            );
        }


        // ==========================================
        // SUCCESS
        // ==========================================

        const rides =
            await response.json();

        displayRides(rides);


    } catch (error) {

        console.error(
            "Load rides error:",
            error
        );


        rideList.innerHTML = `
            <p class="empty">
                Unable to load available rides.
            </p>
        `;
    }
}


// ======================================================
// DISPLAY RIDES
// ======================================================

function displayRides(rides) {

    const rideList =
        document.getElementById("rideList");

    if (!rideList) {
        return;
    }


    // ==========================================
    // NO RIDES
    // ==========================================

    if (!rides || rides.length === 0) {

        rideList.innerHTML = `
            <p class="empty">
                No rides available.
            </p>
        `;

        return;
    }


    rideList.innerHTML = "";


    // ==========================================
    // CREATE RIDE CARDS
    // ==========================================

    rides.forEach(function (ride) {

        const card =
            document.createElement("div");

        card.className =
            "ride-card";


        let actionButton = "";


        // ==========================================
        // REQUESTED → ACCEPT
        // ==========================================

        if (ride.status === "REQUESTED") {

            actionButton = `
                <button
                    class="accept-btn"
                    onclick="acceptRide(${ride.id})">

                    <i class="fa-solid fa-check"></i>

                    Accept Ride

                </button>
            `;
        }


        // ==========================================
        // ACCEPTED → START
        // ==========================================

        else if (ride.status === "ACCEPTED") {

            actionButton = `
                <button
                    class="start-btn"
                    onclick="startRide(${ride.id})">

                    <i class="fa-solid fa-play"></i>

                    Start Ride

                </button>
            `;
        }


        // ==========================================
        // STARTED → COMPLETE
        // ==========================================

        else if (ride.status === "STARTED") {

            actionButton = `
                <button
                    class="complete-btn"
                    onclick="completeRide(${ride.id})">

                    <i class="fa-solid fa-flag-checkered"></i>

                    Complete Ride

                </button>
            `;
        }


        // ==========================================
        // RIDE CARD
        // ==========================================

        card.innerHTML = `

            <h3>
                Ride #${ride.id}
            </h3>


            <div class="ride-info">

                <p>
                    <strong>Pickup:</strong>
                    ${ride.pickupLocation}
                </p>


                <p>
                    <strong>Destination:</strong>
                    ${ride.dropLocation}
                </p>


                <p>
                    <strong>Distance:</strong>
                    ${ride.distance} km
                </p>


                <p>
                    <strong>Duration:</strong>
                    ${ride.durationMinutes} minutes
                </p>


                <p>
                    <strong>Fare:</strong>
                    ₹${ride.fare}
                </p>


                <p>
                    <strong>Status:</strong>

                    <span
                        class="ride-status ${ride.status}">

                        ${ride.status}

                    </span>

                </p>

            </div>


            <div class="ride-actions">

                ${actionButton}

            </div>
        `;


        rideList.appendChild(card);

    });
}


// ======================================================
// ACCEPT RIDE
// ======================================================

async function acceptRide(rideId) {

    await updateRideStatus(
        rideId,
        "accept"
    );
}


// ======================================================
// START RIDE
// ======================================================

async function startRide(rideId) {

    await updateRideStatus(
        rideId,
        "start"
    );
}


// ======================================================
// COMPLETE RIDE
// ======================================================

async function completeRide(rideId) {

    await updateRideStatus(
        rideId,
        "complete"
    );
}


// ======================================================
// UPDATE RIDE STATUS
// ======================================================

async function updateRideStatus(
    rideId,
    action
) {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/rides/${rideId}/${action}`,
                {
                    method: "PATCH",
                    headers: getHeaders()
                }
            );


        // ==========================================
        // UNAUTHORIZED
        // ==========================================

        if (response.status === 401) {

            alert(
                "Session expired. Please login again."
            );

            logoutDriver();

            return;
        }


        // ==========================================
        // READ RESPONSE
        // ==========================================

        const data =
            await response.json()
                .catch(() => null);


        // ==========================================
        // BACKEND ERROR
        // ==========================================

        if (!response.ok) {

            alert(
                data?.message ||
                "Unable to update ride."
            );

            return;
        }


        // ==========================================
        // SUCCESS
        // ==========================================

        alert(
            "Ride status updated successfully."
        );


        // IMPORTANT:
        // Your original code called
        // loadDriverRides(), but that function
        // does not exist.
        //
        // Correct function:
        loadAvailableRides();

    } catch (error) {

        console.error(
            "Ride status error:",
            error
        );


        alert(
            "Unable to connect to backend."
        );
    }
}


// ======================================================
// UPDATE DRIVER LOCATION
// ======================================================

async function updateDriverLocation() {

    if (!navigator.geolocation) {

        alert(
            "Geolocation is not supported by this browser."
        );

        return;
    }


    navigator.geolocation.getCurrentPosition(

        async function (position) {

            const latitude =
                position.coords.latitude;

            const longitude =
                position.coords.longitude;


            try {

                const response =
                    await fetch(
                        API_BASE_URL +
                        "/api/drivers/location",
                        {
                            method: "PATCH",

                            headers:
                                getHeaders(),

                            body:
                                JSON.stringify({
                                    latitude:
                                        latitude,

                                    longitude:
                                        longitude
                                })
                        }
                    );


                const data =
                    await response.json()
                        .catch(() => null);


                // ==================================
                // UNAUTHORIZED
                // ==================================

                if (response.status === 401) {

                    alert(
                        "Session expired. Please login again."
                    );

                    logoutDriver();

                    return;
                }


                // ==================================
                // ERROR
                // ==================================

                if (!response.ok) {

                    alert(
                        data?.message ||
                        "Location update failed."
                    );

                    return;
                }


                // ==================================
                // SUCCESS
                // ==================================

                alert(
                    "Driver location updated successfully."
                );


                const driverStatus =
                    document.getElementById(
                        "driverStatus"
                    );


                if (
                    driverStatus &&
                    data?.status
                ) {

                    driverStatus.innerText =
                        data.status;
                }


            } catch (error) {

                console.error(
                    "Location update error:",
                    error
                );


                alert(
                    "Unable to update driver location."
                );
            }

        },


        function (error) {

            console.error(
                "Geolocation error:",
                error
            );


            alert(
                "Please allow location access in your browser."
            );
        }

    );
}


// ======================================================
// BUTTON SETUP
// ======================================================

function setupButtons() {

    // ==========================================
    // REFRESH
    // ==========================================

    const refreshBtn =
        document.getElementById(
            "refreshBtn"
        );


    if (refreshBtn) {

        refreshBtn.addEventListener(
            "click",
            loadAvailableRides
        );
    }


    // ==========================================
    // LOCATION
    // ==========================================

    const locationBtn =
        document.getElementById(
            "locationBtn"
        );


    if (locationBtn) {

        locationBtn.addEventListener(
            "click",
            updateDriverLocation
        );
    }


    // ==========================================
    // LOGOUT
    // ==========================================

    const logoutBtn =
        document.getElementById(
            "logoutBtn"
        );


    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            logoutDriver
        );
    }
}


// ======================================================
// LOGOUT
// ======================================================

function logoutDriver() {

    localStorage.removeItem(
        "token"
    );

    localStorage.removeItem(
        "email"
    );

    localStorage.removeItem(
        "name"
    );

    localStorage.removeItem(
        "role"
    );


    window.location.href =
        "login.html";
}
// ======================================================
// DRIVER RIDE HISTORY
// ======================================================

let driverHistoryLoading = false;


// ======================================================
// LOAD DRIVER HISTORY
// ======================================================

async function loadDriverRideHistory() {

    if (driverHistoryLoading) {
        return;
    }

    const token =
        localStorage.getItem("token");

    const historyList =
        document.getElementById(
            "driverRideHistory"
        );

    if (!historyList) {
        return;
    }

    if (!token) {
        historyList.innerHTML = `
            <p class="history-empty">
                Please login to view ride history.
            </p>
        `;

        return;
    }

    driverHistoryLoading = true;

    historyList.innerHTML = `
        <p class="history-loading">
            Loading ride history...
        </p>
    `;

    try {

        const response =
            await fetch(
                API_BASE_URL +
                "/api/rides/my-rides",
                {
                    method: "GET",
                    headers: getHeaders()
                }
            );

        if (response.status === 401) {

            historyList.innerHTML = `
                <p class="history-empty">
                    Session expired. Please login again.
                </p>
            `;

            logoutDriver();

            return;
        }

        if (!response.ok) {

            const data =
                await response.json()
                    .catch(() => null);

            throw new Error(
                data?.message ||
                "Unable to load ride history."
            );
        }

        const rides =
            await response.json();

        const completedRides =
            rides.filter(function (ride) {

                return ride.status === "COMPLETED";

            });

        displayDriverRideHistory(
            completedRides
        );

    } catch (error) {

        console.error(
            "Driver ride history error:",
            error
        );

        historyList.innerHTML = `
            <p class="history-empty">
                Unable to load ride history.
            </p>
        `;

    } finally {

        driverHistoryLoading = false;
    }
}


// ======================================================
// DISPLAY DRIVER HISTORY
// ======================================================

function displayDriverRideHistory(rides) {

    const historyList =
        document.getElementById(
            "driverRideHistory"
        );

    if (!historyList) {
        return;
    }

    if (!rides || rides.length === 0) {

        historyList.innerHTML = `
            <p class="history-empty">
                No completed rides yet.
            </p>
        `;

        return;
    }

    historyList.innerHTML = "";

    rides.forEach(function (ride) {

        const card =
            document.createElement("div");

        card.className =
            "driver-history-card";

        const customerText =
            ride.customer
                ? ride.customer
                : "Unknown customer";

        const vehicleText =
            ride.vehicle
                ? ride.vehicle
                : "Not assigned";

        card.innerHTML = `

            <div class="driver-history-header">

                <h3>
                    Ride #${ride.id}
                </h3>

                <span class="driver-history-status">
                    COMPLETED
                </span>

            </div>

            <div class="driver-history-grid">

                <div class="driver-history-item">
                    <span>Customer</span>
                    <strong>
                        ${customerText}
                    </strong>
                </div>

                <div class="driver-history-item">
                    <span>Vehicle</span>
                    <strong>
                        ${vehicleText}
                    </strong>
                </div>

                <div class="driver-history-item">
                    <span>Pickup</span>
                    <strong>
                        ${ride.pickupLocation || "-"}
                    </strong>
                </div>

                <div class="driver-history-item">
                    <span>Destination</span>
                    <strong>
                        ${ride.dropLocation || "-"}
                    </strong>
                </div>

                <div class="driver-history-item">
                    <span>Distance</span>
                    <strong>
                        ${ride.distance ?? "-"} km
                    </strong>
                </div>

                <div class="driver-history-item">
                    <span>Duration</span>
                    <strong>
                        ${ride.durationMinutes ?? "-"} minutes
                    </strong>
                </div>

                <div class="driver-history-item driver-history-fare">
                    <span>Fare</span>
                    <strong>
                        ₹${ride.fare ?? "-"}
                    </strong>
                </div>

            </div>
        `;

        historyList.appendChild(card);
    });
}


// ======================================================
// CREATE DRIVER HISTORY SECTION
// ======================================================

function createDriverHistorySection() {

    if (
        document.getElementById(
            "driverRideHistorySection"
        )
    ) {
        return;
    }

    const rideList =
        document.getElementById(
            "rideList"
        );

    if (!rideList) {
        return;
    }

    const ridesSection =
        rideList.closest(
            ".rides-section"
        );

    if (!ridesSection) {
        return;
    }

    const section =
        document.createElement("section");

    section.id =
        "driverRideHistorySection";

    section.className =
        "rides-section driver-history-section";

    section.innerHTML = `

        <div class="section-title">

            <h2>
                📋 My Ride History
            </h2>

            <button
                id="refreshDriverHistoryBtn"
                class="refresh-btn">

                <i class="fa-solid fa-rotate"></i>
                Refresh

            </button>

        </div>

        <div
            id="driverRideHistory"
            class="driver-ride-history">

            <p class="history-loading">
                Loading ride history...
            </p>

        </div>
    `;

    ridesSection.insertAdjacentElement(
        "afterend",
        section
    );

    const refreshButton =
        document.getElementById(
            "refreshDriverHistoryBtn"
        );

    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            loadDriverRideHistory
        );
    }
}


// ======================================================
// DRIVER HISTORY PAGE LOAD
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        createDriverHistorySection();

        loadDriverRideHistory();

    }
);
