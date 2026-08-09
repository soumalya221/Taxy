// ======================================================
// GLOBAL VARIABLES
// ======================================================

let map;

let pickupMarker = null;
let destinationMarker = null;

let routeLayer = null;

let pickup = null;
let destination = null;
let selectedVehicleType = null;
let routePreviewDistance = null;

const vehicleRates = {
    HATCHBACK: 12,
    SEDAN: 15,
    SUV: 20
};

// Retained for the existing map and route functionality.
let pickupCoordinates = null;
let destinationCoordinates = null;

const autocompleteState = {
    pickup: { suggestions: [], activeIndex: -1 },
    destination: { suggestions: [], activeIndex: -1 }
};

// ======================================================
// LIVE DRIVER LOCATION
// ======================================================

let driverMarker = null;
let driverLocationTimer = null;


// Default map location: Kolkata
const defaultLatitude = 22.5726;
const defaultLongitude = 88.3639;


// ======================================================
// INITIALIZE MAP
// ======================================================

function initializeMap() {

    map = L.map("map").setView(
        [defaultLatitude, defaultLongitude],
        12
    );

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }
    ).addTo(map);

    console.log("Leaflet map loaded successfully");
}


// ======================================================
// WELCOME USER / AUTH NAVBAR
// ======================================================

function loadUser() {

    const token =
        localStorage.getItem("token");

    const username =
        localStorage.getItem("name");

    const welcomeUser =
        document.getElementById("welcomeUser");

    const authButtons =
        document.querySelector(".auth-buttons");

    if (!authButtons) {
        return;
    }

    const signupButton =
        document.querySelector(".signup-btn");

    const loginButton =
        document.querySelector(".login-btn");

    if (token) {

        if (welcomeUser) {

            welcomeUser.innerHTML =
                `Welcome, ${username || "User"}`;

            welcomeUser.style.display =
                "inline-block";
        }


        if (signupButton) {

            signupButton.style.display =
                "none";
        }


        if (loginButton) {

            loginButton.style.display =
                "none";
        }


        let logoutButton =
            document.getElementById("logoutBtn");

        if (!logoutButton) {

            logoutButton =
                document.createElement("button");

            logoutButton.id =
                "logoutBtn";

            logoutButton.className =
                "login-btn";

            logoutButton.innerHTML =
                `<i class="fa-solid fa-right-from-bracket"></i>
                 Logout`;

            authButtons.appendChild(logoutButton);
        }


        logoutButton.style.display =
            "inline-flex";


        logoutButton.onclick =
            function () {

                localStorage.removeItem("token");
                localStorage.removeItem("email");
                localStorage.removeItem("name");
                localStorage.removeItem("role");

                stopRideTracking();
                stopDriverLocationTracking();

                window.location.href =
                    "index.html";
            };

    } else {

        if (welcomeUser) {

            welcomeUser.innerHTML =
                "";

            welcomeUser.style.display =
                "none";
        }


        if (signupButton) {

            signupButton.style.display =
                "inline-flex";
        }


        if (loginButton) {

            loginButton.style.display =
                "inline-flex";
        }


        const logoutButton =
            document.getElementById("logoutBtn");

        if (logoutButton) {

            logoutButton.remove();
        }
    }
}

function updateVehicleFareEstimate() {

    const estimate = document.getElementById("vehicleFareEstimate");

    if (!estimate) {
        return;
    }

    if (!selectedVehicleType) {

        estimate.innerText =
            "Select a vehicle to view its estimated fare.";
        return;
    }

    if (!Number.isFinite(routePreviewDistance)) {

        estimate.innerText = selectedVehicleType +
            " selected (Rs. " +
            vehicleRates[selectedVehicleType] +
            "/km). Select both locations to estimate the fare.";
        return;
    }

    const fare = 50 +
            (routePreviewDistance *
                    vehicleRates[selectedVehicleType]);

    estimate.innerText = "Estimated " + selectedVehicleType +
        " fare: Rs. " + fare.toFixed(2);
}

function setupVehicleSelection() {

    document.querySelectorAll(
        'input[name="vehicleType"]'
    ).forEach(option => {

        option.addEventListener("change", event => {

            selectedVehicleType = event.target.value;

            document.querySelectorAll(".vehicle-option")
                .forEach(card => card.classList.toggle(
                    "selected",
                    card.contains(event.target)
                ));

            updateVehicleFareEstimate();
        });
    });
}


// ======================================================
// SET PICKUP LOCATION
// ======================================================

function setPickupLocation(
    latitude,
    longitude,
    locationName,
    address = ""
) {

    pickup = {
        name: locationName,
        address: address,
        latitude: latitude,
        longitude: longitude
    };

    pickupCoordinates = pickup;

    if (pickupMarker) {
        map.removeLayer(pickupMarker);
    }

    pickupMarker = L.marker([
        latitude,
        longitude
    ]).addTo(map);

    console.log("Pickup marker coordinates:", latitude, longitude);

    pickupMarker.bindPopup(
        "<b>Pickup</b><br>" + locationName
    ).openPopup();

    updateLocationIndicator("pickup", pickup);

    map.setView(
        [latitude, longitude],
        14
    );

    // Remove old route when pickup changes
    clearRoute();

    // If destination already exists, fit both markers and calculate route
    if (destination) {

        map.fitBounds(L.latLngBounds(
            [pickup.latitude, pickup.longitude],
            [destination.latitude, destination.longitude]
        ), { padding: [40, 40] });

        calculateRoute();
    }

    console.log("Pickup state:", pickup);
}

function updateLocationIndicator(type, location) {

    const indicator = document.getElementById(
        type === "pickup"
            ? "pickupCoordinates"
            : "dropCoordinates"
    );

    if (!indicator) {
        return;
    }

    if (!location) {

        indicator.innerText = "Not selected";
        return;
    }

    indicator.innerText = location.address
        ? location.name + ", " + location.address
        : location.name;

    indicator.title =
        location.latitude.toFixed(6) +
        ", " +
        location.longitude.toFixed(6);
}

// ======================================================
// SET DESTINATION LOCATION
// ======================================================

function setDestinationLocation(
    latitude,
    longitude,
    locationName,
    address = ""
) {

    destination = {
        name: locationName,
        address: address,
        latitude: latitude,
        longitude: longitude
    };

    destinationCoordinates = destination;

    if (destinationMarker) {
        map.removeLayer(destinationMarker);
    }

    destinationMarker = L.marker([
        latitude,
        longitude
    ]).addTo(map);

    console.log("Destination marker coordinates:", latitude, longitude);

    destinationMarker.bindPopup(
        "<b>Destination</b><br>" + locationName
    ).openPopup();

    updateLocationIndicator("destination", destination);

    if (pickup) {

        const bounds = L.latLngBounds(
            [
                pickup.latitude,
                pickup.longitude
            ],
            [
                latitude,
                longitude
            ]
        );

        map.fitBounds(bounds, {
            padding: [40, 40]
        });

        // Both locations available
        // Calculate actual road route
        calculateRoute();
    }

    console.log("Destination state:", destination);
}

// ======================================================
// LOCATION SEARCH
// ======================================================

async function searchLocations(query) {

    if (!query || query.trim().length < 2) {
        return [];
    }

    const url = "https://ridenow-backend-1ty9.onrender.com/api/location/search?q=" +
        encodeURIComponent(query.trim());

    console.log("Autocomplete request:", url);

    const response = await fetch(url);

    if (!response.ok) {

        throw new Error(
            "Location search HTTP " + response.status
        );
    }

    const results = await response.json();

    console.log("Autocomplete API response:", results);

    return Array.isArray(results)
        ? results
        : [];
}


// ======================================================
// PICKUP SEARCH
// ======================================================

function clearLocationSelection(type) {

    const isPickup = type === "pickup";

    if (isPickup) {

        pickup = null;
        pickupCoordinates = null;
        updateLocationIndicator("pickup", null);

        if (pickupMarker) {

            map.removeLayer(pickupMarker);
            pickupMarker = null;
        }

    } else {

        destination = null;
        destinationCoordinates = null;
        updateLocationIndicator("destination", null);

        if (destinationMarker) {

            map.removeLayer(destinationMarker);
            destinationMarker = null;
        }
    }

    clearRoute();
}

function renderLocationSuggestions(type, suggestions, message = "") {

    const state = autocompleteState[type];
    state.suggestions = suggestions;
    state.activeIndex = -1;

    const container = document.getElementById(
        type === "pickup" ? "pickupSuggestions" : "dropSuggestions"
    );

    if (!container) {
        return;
    }

    container.replaceChildren();
    container.classList.toggle(
        "visible",
        suggestions.length > 0 || message !== ""
    );

    if (message) {

        const empty = document.createElement("p");
        empty.className = "location-suggestions-message";
        empty.textContent = message;
        container.appendChild(empty);
        return;
    }

    suggestions.forEach((suggestion, index) => {

        const option = document.createElement("button");
        option.type = "button";
        option.className = "location-suggestion";
        option.setAttribute("role", "option");
        option.dataset.index = index;

        const name = document.createElement("span");
        name.className = "location-suggestion-name";
        name.textContent = suggestion.name;

        const address = document.createElement("span");
        address.className = "location-suggestion-address";
        address.textContent = suggestion.address;

        option.append(name, address);
        option.addEventListener("click", () =>
            selectLocationSuggestion(type, suggestion)
        );
        option.addEventListener("mouseenter", () =>
            updateActiveSuggestion(type, index)
        );
        container.appendChild(option);
    });
}

function updateActiveSuggestion(type, index) {

    const state = autocompleteState[type];
    const container = document.getElementById(
        type === "pickup" ? "pickupSuggestions" : "dropSuggestions"
    );

    state.activeIndex = index;

    container.querySelectorAll(".location-suggestion")
        .forEach(option => option.classList.toggle(
            "active",
            Number(option.dataset.index) === index
        ));

    const activeOption = container.querySelector(
        `.location-suggestion[data-index="${index}"]`
    );

    activeOption?.scrollIntoView({ block: "nearest" });
}

function selectLocationSuggestion(type, suggestion) {

    console.log("Selected suggestion:", type, suggestion);

    const input = document.getElementById(
        type === "pickup" ? "pickupLocation" : "dropLocation"
    );

    input.value = suggestion.address
        ? suggestion.name + ", " + suggestion.address
        : suggestion.name;

    if (type === "pickup") {

        setPickupLocation(
            suggestion.latitude,
            suggestion.longitude,
            suggestion.name,
            suggestion.address
        );

    } else {

        setDestinationLocation(
            suggestion.latitude,
            suggestion.longitude,
            suggestion.name,
            suggestion.address
        );
    }

    renderLocationSuggestions(type, []);
}


// ======================================================
// DESTINATION SEARCH
// ======================================================

function setupAutocomplete(type, inputId) {

    const input = document.getElementById(inputId);
    let debounceTimer;

    if (!input) {
        return;
    }

    input.addEventListener("input", () => {

        clearTimeout(debounceTimer);
        clearLocationSelection(type);

        const query = input.value.trim();

        if (query.length < 2) {

            renderLocationSuggestions(type, []);
            return;
        }

        debounceTimer = setTimeout(async () => {

            try {

                const suggestions = await searchLocations(query);

                if (input.value.trim() !== query) {
                    return;
                }

                renderLocationSuggestions(
                    type,
                    suggestions,
                    suggestions.length === 0
                        ? "No locations found."
                        : ""
                );

            } catch (error) {

                console.error("Location autocomplete error:", error);
                renderLocationSuggestions(
                    type,
                    [],
                    "Location search is unavailable. Please try again."
                );
            }
        }, 300);
    });

    input.addEventListener("keydown", event => {

        const state = autocompleteState[type];

        if (event.key === "ArrowDown") {

            if (state.suggestions.length === 0) {
                return;
            }

            event.preventDefault();
            updateActiveSuggestion(
                type,
                Math.min(
                    state.activeIndex + 1,
                    state.suggestions.length - 1
                )
            );
            return;
        }

        if (event.key === "ArrowUp") {

            if (state.suggestions.length === 0) {
                return;
            }

            event.preventDefault();
            updateActiveSuggestion(
                type,
                Math.max(state.activeIndex - 1, 0)
            );
            return;
        }

        if (event.key === "Escape") {

            renderLocationSuggestions(type, []);
            return;
        }

        if (event.key === "Enter" && state.suggestions.length > 0) {

            event.preventDefault();
            selectLocationSuggestion(
                type,
                state.suggestions[
                    state.activeIndex >= 0
                        ? state.activeIndex
                        : 0
                ]
            );
        }
    });
}


// ======================================================
// INPUT EVENTS
// ======================================================

function setupLocationInputs() {

    setupAutocomplete("pickup", "pickupLocation");
    setupAutocomplete("destination", "dropLocation");

    document.addEventListener("click", event => {

        if (!event.target.closest(".location-input")) {

            renderLocationSuggestions("pickup", []);
            renderLocationSuggestions("destination", []);
        }
    });
}


// ======================================================
// CLEAR EXISTING ROUTE
// ======================================================

function clearRoute() {

    if (routeLayer) {

        map.removeLayer(routeLayer);

        routeLayer = null;
    }
}


// ======================================================
// DECODE OPENROUTESERVICE POLYLINE
// ======================================================

function decodePolyline(encoded) {

    const coordinates = [];

    let index = 0;
    let latitude = 0;
    let longitude = 0;

    while (index < encoded.length) {

        let result = 0;
        let shift = 0;
        let byte;

        do {

            byte =
                encoded.charCodeAt(index++) -
                63;

            result |=
                (byte & 0x1f) << shift;

            shift += 5;

        } while (byte >= 0x20);

        const latitudeChange =
            (result & 1)
                ? ~(result >> 1)
                : (result >> 1);

        latitude += latitudeChange;


        result = 0;
        shift = 0;

        do {

            byte =
                encoded.charCodeAt(index++) -
                63;

            result |=
                (byte & 0x1f) << shift;

            shift += 5;

        } while (byte >= 0x20);

        const longitudeChange =
            (result & 1)
                ? ~(result >> 1)
                : (result >> 1);

        longitude += longitudeChange;


        coordinates.push([
            latitude / 1e5,
            longitude / 1e5
        ]);
    }

    return coordinates;
}


// ======================================================
// CALCULATE ACTUAL ROAD ROUTE
// ======================================================

async function calculateRoute() {

    if (!pickupCoordinates ||
        !destinationCoordinates) {

        return;
    }

    console.log(
        "Calculating road route..."
    );

    clearRoute();

    try {

        const url =
            "https://ridenow-backend-1ty9.onrender.com/api/rides/route" +
            "?pickupLatitude=" +
            encodeURIComponent(
                pickupCoordinates.latitude
            ) +
            "&pickupLongitude=" +
            encodeURIComponent(
                pickupCoordinates.longitude
            ) +
            "&dropLatitude=" +
            encodeURIComponent(
                destinationCoordinates.latitude
            ) +
            "&dropLongitude=" +
            encodeURIComponent(
                destinationCoordinates.longitude
            );

        console.log(
            "Route API:",
            url
        );

        const response =
            await fetch(url);

        if (!response.ok) {

            throw new Error(
                "Route API failed: HTTP " +
                response.status
            );
        }

        const data =
            await response.json();

        console.log(
            "Route response:",
            data
        );


        // ==========================================
        // DISTANCE
        // ==========================================

        const distance =
            Number(data.distanceKm);

        routePreviewDistance = distance;


        // ==========================================
        // DURATION
        // ==========================================

        const duration =
            Number(data.durationMinutes);


        // ==========================================
        // GEOMETRY
        // ==========================================

        if (!data.geometry) {

            throw new Error(
                "Route geometry is missing."
            );
        }


        const routeCoordinates =
            decodePolyline(
                data.geometry
            );


        if (!routeCoordinates.length) {

            throw new Error(
                "Unable to decode route geometry."
            );
        }


        // ==========================================
        // DRAW ROUTE
        // ==========================================

        routeLayer =
            L.polyline(
                routeCoordinates,
                {
                    weight: 6,
                    opacity: 0.8
                }
            ).addTo(map);


        // ==========================================
        // FIT MAP TO ROUTE
        // ==========================================

        map.fitBounds(
            routeLayer.getBounds(),
            {
                padding: [40, 40]
            }
        );


        // ==========================================
        // DISPLAY ROUTE INFORMATION
        // ==========================================

        const rideResult =
            document.getElementById(
                "rideResult"
            );

        if (rideResult) {
            rideResult.style.display =
                "block";
        }


        const rideDistance =
            document.getElementById(
                "rideDistance"
            );

        if (rideDistance) {

            rideDistance.innerText =
                distance.toFixed(2) +
                " km";
        }


        const rideDuration =
            document.getElementById(
                "rideDuration"
            );

        if (rideDuration) {

            rideDuration.innerText =
                duration.toFixed(2) +
                " minutes";
        }


        const rideFare =
            document.getElementById(
                "rideFare"
            );

        if (rideFare) {

            rideFare.innerText = selectedVehicleType
                ? "Rs. " + (
                    50 +
                    (distance * vehicleRates[selectedVehicleType])
                ).toFixed(2)
                : "Select a vehicle";
        }

        updateVehicleFareEstimate();


        const rideStatus =
            document.getElementById(
                "rideStatus"
            );

        if (rideStatus) {

            rideStatus.innerText =
                "ROUTE PREVIEW";
        }


        console.log(
            "Road route drawn successfully."
        );

        console.log(
            "Distance:",
            distance,
            "km"
        );

        console.log(
            "Duration:",
            duration,
            "minutes"
        );

    } catch (error) {

        console.error(
            "Route calculation error:",
            error
        );

        alert(
            "Unable to calculate road route.\n\n" +
            error.message
        );
    }
}


// ======================================================
// BOOK RIDE
// ======================================================

function hasValidLocation(location) {

    return Boolean(
        location &&
        Number.isFinite(location.latitude) &&
        Number.isFinite(location.longitude)
    );
}

async function bookRide() {

    if (!hasValidLocation(pickup)) {

        alert(
            "Please select a pickup location."
        );

        return;
    }

    if (!hasValidLocation(destination)) {

        alert(
            "Please select a destination."
        );

        return;
    }

    if (!selectedVehicleType) {

        alert("Please select a vehicle type.");
        return;
    }

    const token =
        localStorage.getItem("token");

    if (!token) {

        alert(
            "Please login before booking a ride."
        );

        window.location.href =
            "login.html";

        return;
    }


    const requestBody = {

        pickupLocation:
            pickup.address || pickup.name,

        dropLocation:
            destination.address || destination.name,

        pickupLatitude:
            pickup.latitude,

        pickupLongitude:
            pickup.longitude,

        dropLatitude:
            destination.latitude,

        dropLongitude:
            destination.longitude,

        vehicleType:
            selectedVehicleType
    };


    try {

        const response =
            await fetch(
                "https://ridenow-backend-1ty9.onrender.com/api/rides/book",
                {
                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            "Bearer " + token
                    },

                    body:
                        JSON.stringify(
                            requestBody
                        )
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Ride booking failed."
            );

            return;
        }


        // Display ride result

        const rideResult =
            document.getElementById(
                "rideResult"
            );

        if (rideResult) {

            rideResult.style.display =
                "block";
        }


        const rideDistance =
            document.getElementById(
                "rideDistance"
            );

        if (rideDistance) {

            rideDistance.innerText =
                data.distance +
                " km";
        }


        const rideDuration =
            document.getElementById(
                "rideDuration"
            );

        if (rideDuration) {

            rideDuration.innerText =
                data.durationMinutes +
                " minutes";
        }


        const rideFare =
            document.getElementById(
                "rideFare"
            );

        if (rideFare) {

            rideFare.innerText =
                "₹" +
                data.fare;
        }


        const rideStatus =
            document.getElementById(
                "rideStatus"
            );

        if (rideStatus) {

            rideStatus.innerText =
                data.status;
        }


        console.log(
            "Ride booked successfully:",
            data
        );

    } catch (error) {

        console.error(
            "Booking error:",
            error
        );

        alert(
            "Unable to connect to backend."
        );
    }
}


// ======================================================
// BOOK BUTTON
// ======================================================

function setupBookButton() {

    const button =
        document.getElementById(
            "bookRideBtn"
        );

    if (!button) {
        return;
    }

    button.addEventListener(
        "click",
        bookRide
    );
}


// ======================================================
// LIVE DRIVER LOCATION
// ======================================================

async function loadDriverLocation(driverId) {

    const token =
        localStorage.getItem("token");

    if (!token || !driverId || !map) {
        return;
    }

    try {
        const response = await fetch(
            `https://ridenow-backend-1ty9.onrender.com/api/drivers/${driverId}/location`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                }
            }
        );

        if (response.status === 401) {
            return;
        }

        if (!response.ok) {
            throw new Error("Unable to load driver location");
        }

        const driver = await response.json();
        const latitude = driver.latitude;
        const longitude = driver.longitude;

        if (latitude == null || longitude == null) {
            return;
        }

        const driverPosition = [latitude, longitude];

        if (!driverMarker) {
            driverMarker = L.marker(driverPosition).addTo(map);

            driverMarker.bindPopup(
                `<strong>🚕 ${driver.name}</strong><br>Driver`
            );
        } else {
            driverMarker.setLatLng(driverPosition);
        }
    } catch (error) {
        console.error("Driver location error:", error);
    }
}

function startDriverLocationTracking(driverId) {

    if (driverLocationTimer || !driverId) {
        return;
    }

    loadDriverLocation(driverId);

    driverLocationTimer = setInterval(
        function () {
            loadDriverLocation(driverId);
        },
        5000
    );
}

function stopDriverLocationTracking() {

    if (driverLocationTimer) {
        clearInterval(driverLocationTimer);
        driverLocationTimer = null;
    }

    if (driverMarker && map) {
        map.removeLayer(driverMarker);
        driverMarker = null;
    }
}


// ======================================================
// CUSTOMER CURRENT RIDE
// ======================================================

let rideTrackingTimer = null;

async function loadCustomerRides() {

    const token =
        localStorage.getItem("token");

    const currentRideCard =
        document.getElementById("currentRideCard");

    if (!currentRideCard) {
        return;
    }

    if (!token) {

        currentRideCard.innerHTML = `
            <p class="no-ride">
                Please login to view your rides.
            </p>
        `;

        stopRideTracking();
        stopDriverLocationTracking();

        return;
    }

    try {

        const response = await fetch(
            "https://ridenow-backend-1ty9.onrender.com/api/rides/history",
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                }
            }
        );

        if (response.status === 401) {

            currentRideCard.innerHTML = `
                <p class="no-ride">
                    Session expired. Please login again.
                </p>
            `;

            stopRideTracking();
            stopDriverLocationTracking();

            return;
        }

        if (!response.ok) {

            throw new Error(
                "Failed to load customer rides"
            );
        }

        const rides =
            await response.json();

        if (!rides || rides.length === 0) {

            hideCurrentRide();

            stopRideTracking();
            stopDriverLocationTracking();

            return;
        }


        const activeRides =
            rides.filter(function (ride) {

                return (
                    ride.status === "REQUESTED" ||
                    ride.status === "ACCEPTED" ||
                    ride.status === "STARTED"
                );
            });

        if (activeRides.length === 0) {

            hideCurrentRide();

            stopRideTracking();
            stopDriverLocationTracking();

            return;
        }

        const latestActiveRide =
            activeRides.reduce(
                function (latest, ride) {

                    return ride.id > latest.id
                        ? ride
                        : latest;
                }
            );

        showCurrentRide(
            latestActiveRide
        );

        startRideTracking();

        if (latestActiveRide.driverId) {
            startDriverLocationTracking(
                latestActiveRide.driverId
            );
        } else {
            stopDriverLocationTracking();
        }

    } catch (error) {
        console.error("Customer ride error:", error);

        currentRideCard.innerHTML = `
            <p class="no-ride">
                Unable to load ride information.
            </p>
        `;
    }
}

function showCurrentRide(ride) {

    const currentRideCard =
        document.getElementById("currentRideCard");

    if (!currentRideCard) {
        return;
    }

    const driverText = ride.driver
        ? ride.driver
        : "Waiting for driver";

    const vehicleText = ride.vehicle
        ? ride.vehicle
        : "Not assigned";

    currentRideCard.innerHTML = `
        <h3>Ride #${ride.id}</h3>

        <div class="customer-ride-info">
            <p><strong>Pickup:</strong> ${ride.pickupLocation}</p>
            <p><strong>Destination:</strong> ${ride.dropLocation}</p>
            <p><strong>Distance:</strong> ${ride.distance} km</p>
            <p><strong>Duration:</strong> ${ride.durationMinutes} minutes</p>
            <p><strong>Fare:</strong> ₹${ride.fare}</p>
            <p><strong>Driver:</strong> ${driverText}</p>
            <p><strong>Vehicle:</strong> ${vehicleText}</p>
            <p>
                <strong>Status:</strong>
                <span class="customer-ride-status ${ride.status}">
                    ${ride.status}
                </span>
            </p>
        </div>
    `;
}

function hideCurrentRide() {

    const currentRideCard =
        document.getElementById("currentRideCard");

    if (!currentRideCard) {
        return;
    }

    currentRideCard.innerHTML = `
        <p class="no-ride">
            No active ride.
        </p>
    `;
}

function startRideTracking() {

    if (rideTrackingTimer) {
        return;
    }

    rideTrackingTimer = setInterval(
        loadCustomerRides,
        5000
    );
}

function stopRideTracking() {

    if (rideTrackingTimer) {
        clearInterval(rideTrackingTimer);
        rideTrackingTimer = null;
    }
}

function setupRideTracking() {

    const button =
        document.getElementById("refreshRideBtn");

    if (!button) {
        return;
    }

    button.addEventListener(
        "click",
        loadCustomerRides
    );
}


// ======================================================
// PAGE LOAD
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeMap();

        loadUser();

        setupLocationInputs();

        setupVehicleSelection();

        setupBookButton();

        setupRideTracking();

        loadCustomerRides();

    }
);

// ======================================================
// CUSTOMER RIDE HISTORY
// ======================================================

let customerHistoryLoading = false;

async function loadCustomerRideHistory() {

    if (customerHistoryLoading) {
        return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
        return;
    }

    const historyList =
        document.getElementById("customerRideHistory");

    if (!historyList) {
        return;
    }

    customerHistoryLoading = true;

    historyList.innerHTML = `
        <p class="history-loading">
            Loading ride history...
        </p>
    `;

    try {

        const response = await fetch(
            "https://ridenow-backend-1ty9.onrender.com/api/rides/history",
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                }
            }
        );

        if (response.status === 401) {

            historyList.innerHTML = `
                <p class="history-empty">
                    Session expired. Please login again.
                </p>
            `;

            return;
        }

        if (!response.ok) {

            throw new Error(
                "Unable to load ride history."
            );
        }

        const rides = await response.json();

        const completedRides =
            rides.filter(function (ride) {

                return ride.status === "COMPLETED";

            });

        displayCustomerRideHistory(
            completedRides
        );

    } catch (error) {

        console.error(
            "Customer ride history error:",
            error
        );

        historyList.innerHTML = `
            <p class="history-empty">
                Unable to load ride history.
            </p>
        `;

    } finally {

        customerHistoryLoading = false;
    }
}


// ======================================================
// DISPLAY CUSTOMER HISTORY
// ======================================================

function displayCustomerRideHistory(rides) {

    const historyList =
        document.getElementById(
            "customerRideHistory"
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
            "history-card";

        const driverText =
            ride.driver
                ? ride.driver
                : "Not assigned";

        const vehicleText =
            ride.vehicle
                ? ride.vehicle
                : "Not assigned";

        card.innerHTML = `

            <div class="history-card-header">

                <h3>
                    Ride #${ride.id}
                </h3>

                <span class="history-status COMPLETED">
                    COMPLETED
                </span>

            </div>

            <div class="history-grid">

                <div class="history-item">
                    <span>Pickup</span>
                    <strong>
                        ${ride.pickupLocation || "-"}
                    </strong>
                </div>

                <div class="history-item">
                    <span>Destination</span>
                    <strong>
                        ${ride.dropLocation || "-"}
                    </strong>
                </div>

                <div class="history-item">
                    <span>Driver</span>
                    <strong>
                        ${driverText}
                    </strong>
                </div>

                <div class="history-item">
                    <span>Vehicle</span>
                    <strong>
                        ${vehicleText}
                    </strong>
                </div>

                <div class="history-item">
                    <span>Distance</span>
                    <strong>
                        ${ride.distance ?? "-"} km
                    </strong>
                </div>

                <div class="history-item">
                    <span>Duration</span>
                    <strong>
                        ${ride.durationMinutes ?? "-"} minutes
                    </strong>
                </div>

                <div class="history-item history-fare">
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
// CREATE CUSTOMER HISTORY SECTION
// ======================================================

function createCustomerHistorySection() {

    if (
        document.getElementById(
            "customerRideHistorySection"
        )
    ) {
        return;
    }

    const currentRideCard =
        document.getElementById(
            "currentRideCard"
        );

    if (!currentRideCard) {
        return;
    }

    const currentSection =
        currentRideCard.closest(
            ".customer-rides-section"
        );

    if (!currentSection) {
        return;
    }

    const section =
        document.createElement("section");

    section.id =
        "customerRideHistorySection";

    section.className =
        "customer-rides-section customer-history-section";

    section.innerHTML = `

        <div class="history-title-row">

            <h2>
                📋 My Ride History
            </h2>

            <button
                id="refreshCustomerHistoryBtn"
                class="history-refresh-btn">

                🔄 Refresh

            </button>

        </div>

        <div
            id="customerRideHistory"
            class="customer-ride-history">

            <p class="history-loading">
                Loading ride history...
            </p>

        </div>
    `;

    currentSection.insertAdjacentElement(
        "afterend",
        section
    );

    const refreshButton =
        document.getElementById(
            "refreshCustomerHistoryBtn"
        );

    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            loadCustomerRideHistory
        );
    }
}


// ======================================================
// CUSTOMER HISTORY PAGE LOAD
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        createCustomerHistorySection();

        loadCustomerRideHistory();

    }
);


// ======================================================
// CUSTOMER RIDE HISTORY + RATING
// ======================================================

async function getRideRating(rideId) {

    const token = localStorage.getItem("token");

    if (!token) {
        return null;
    }

    try {
        const response = await fetch(
            `https://ridenow-backend-1ty9.onrender.com/api/ratings/rides/${rideId}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                }
            }
        );

        return response.ok ? await response.json() : null;
    } catch (error) {
        console.warn("Rating lookup failed:", error);
        return null;
    }
}

async function loadCustomerRideHistory() {

    if (customerHistoryLoading) {
        return;
    }

    const token = localStorage.getItem("token");
    const historyList = document.getElementById("customerRideHistory");

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

    customerHistoryLoading = true;
    historyList.innerHTML = `
        <p class="history-loading">Loading ride history...</p>
    `;

    try {
        const response = await fetch(
            "https://ridenow-backend-1ty9.onrender.com/api/rides/history",
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                }
            }
        );

        if (response.status === 401) {
            historyList.innerHTML = `
                <p class="history-empty">
                    Session expired. Please login again.
                </p>
            `;
            return;
        }

        if (!response.ok) {
            throw new Error("Unable to load ride history.");
        }

        const rides = await response.json();
        const completedRides = rides.filter(
            ride => ride.status === "COMPLETED"
        );

        await displayCustomerRideHistory(completedRides);
    } catch (error) {
        console.error("Customer ride history error:", error);
        historyList.innerHTML = `
            <p class="history-empty">
                Unable to load ride history.
            </p>
        `;
    } finally {
        customerHistoryLoading = false;
    }
}

async function displayCustomerRideHistory(rides) {

    const historyList = document.getElementById("customerRideHistory");

    if (!historyList) {
        return;
    }

    if (!rides || rides.length === 0) {
        historyList.innerHTML = `
            <p class="history-empty">No completed rides yet.</p>
        `;
        return;
    }

    historyList.innerHTML = `
        <p class="history-loading">Loading completed rides...</p>
    `;

    const ridesWithRatings = await Promise.all(
        rides.map(async ride => ({
            ride,
            rating: await getRideRating(ride.id)
        }))
    );

    historyList.innerHTML = "";

    ridesWithRatings.forEach(({ ride, rating }) => {
        const card = document.createElement("div");
        card.className = "history-card";

        const driverText = ride.driver || "Not assigned";
        const vehicleText = ride.vehicle || "Not assigned";
        let ratingHTML;

        if (rating) {
            const value = Number(rating.rating);
            const stars = "★".repeat(value) + "☆".repeat(5 - value);

            ratingHTML = `
                <div class="ride-rated-box">
                    <div class="ride-rated-title">
                        <span>Your Rating</span>
                        <strong>${value}/5</strong>
                    </div>
                    <div class="rated-stars">${stars}</div>
                    ${rating.comment ? `
                        <p class="rated-comment">
                            "${escapeHTML(rating.comment)}"
                        </p>
                    ` : ""}
                </div>
            `;
        } else {
            ratingHTML = `
                <div class="ride-rating-box" id="ratingBox-${ride.id}">
                    <h4>⭐ Rate Your Driver</h4>
                    <div class="rating-stars" id="ratingStars-${ride.id}">
                        ${[1, 2, 3, 4, 5].map(value => `
                            <button type="button" data-rating="${value}"
                                onclick="selectRideRating(${ride.id}, ${value})">★</button>
                        `).join("")}
                    </div>
                    <input type="hidden" id="selectedRating-${ride.id}" value="">
                    <textarea id="ratingComment-${ride.id}" class="rating-comment"
                        maxlength="500" placeholder="Write a comment (optional)"></textarea>
                    <button type="button" class="submit-rating-btn"
                        onclick="submitRideRating(${ride.id})">
                        <i class="fa-solid fa-star"></i> Submit Rating
                    </button>
                    <p id="ratingMessage-${ride.id}" class="rating-message"></p>
                </div>
            `;
        }

        card.innerHTML = `
            <div class="history-card-header">
                <h3>Ride #${ride.id}</h3>
                <span class="history-status COMPLETED">COMPLETED</span>
            </div>
            <div class="history-grid">
                <div class="history-item"><span>Pickup</span><strong>${escapeHTML(ride.pickupLocation || "-")}</strong></div>
                <div class="history-item"><span>Destination</span><strong>${escapeHTML(ride.dropLocation || "-")}</strong></div>
                <div class="history-item"><span>Driver</span><strong>${escapeHTML(driverText)}</strong></div>
                <div class="history-item"><span>Vehicle</span><strong>${escapeHTML(vehicleText)}</strong></div>
                <div class="history-item"><span>Distance</span><strong>${ride.distance ?? "-"} km</strong></div>
                <div class="history-item"><span>Duration</span><strong>${ride.durationMinutes ?? "-"} minutes</strong></div>
                <div class="history-item history-fare"><span>Fare</span><strong>₹${ride.fare ?? "-"}</strong></div>
            </div>
            ${ratingHTML}
        `;

        historyList.appendChild(card);
    });
}

function selectRideRating(rideId, rating) {

    const hiddenInput = document.getElementById(`selectedRating-${rideId}`);
    const starsContainer = document.getElementById(`ratingStars-${rideId}`);

    if (!hiddenInput || !starsContainer) {
        return;
    }

    hiddenInput.value = rating;
    starsContainer.querySelectorAll("button").forEach(button => {
        button.classList.toggle(
            "selected",
            Number(button.dataset.rating) <= rating
        );
    });
}

async function submitRideRating(rideId) {

    const token = localStorage.getItem("token");
    const ratingInput = document.getElementById(`selectedRating-${rideId}`);
    const commentInput = document.getElementById(`ratingComment-${rideId}`);
    const message = document.getElementById(`ratingMessage-${rideId}`);
    const ratingBox = document.getElementById(`ratingBox-${rideId}`);
    const submitButton = ratingBox?.querySelector(".submit-rating-btn");
    const rating = Number(ratingInput?.value);

    if (!token) {
        alert("Please login before submitting a rating.");
        return;
    }

    if (!rating || rating < 1 || rating > 5) {
        if (message) {
            message.className = "rating-message error";
            message.innerText = "Please select a star rating.";
        }
        return;
    }

    if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';
    }

    try {
        const response = await fetch(
            `https://ridenow-backend-1ty9.onrender.com/api/ratings/rides/${rideId}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify({
                    rating,
                    comment: commentInput?.value.trim() || ""
                })
            }
        );

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            throw new Error(data?.message || "Unable to submit rating.");
        }

        if (message) {
            message.className = "rating-message success";
            message.innerText = "Rating submitted successfully.";
        }

        setTimeout(loadCustomerRideHistory, 700);
    } catch (error) {
        console.error("Rating submission error:", error);
        if (message) {
            message.className = "rating-message error";
            message.innerText = error.message || "Unable to submit rating.";
        }
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = '<i class="fa-solid fa-star"></i> Submit Rating';
        }
    }
}

function escapeHTML(value) {

    if (value == null) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


