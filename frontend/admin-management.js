// ======================================================
// RIDENOW ADMIN MANAGEMENT
// Customers / Drivers / Vehicles
// ======================================================


// ======================================================
// API
// ======================================================

const API_BASE_URL = "http://localhost:8080";


// ======================================================
// STATE
// ======================================================

let currentSection = "customers";


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
// HTML ESCAPE
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
// CUSTOMER TABLE
// ======================================================

function renderCustomers(customers) {

    const tbody =
        document.getElementById(
            "customersTableBody"
        );

    const count =
        document.getElementById(
            "customerCount"
        );

    if (!tbody) {
        return;
    }

    const data =
        Array.isArray(customers)
            ? customers
            : [];

    if (count) {

        count.textContent =
            data.length;
    }

    if (data.length === 0) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="table-empty"
                >

                    <i
                        class="fa-solid fa-users"
                    ></i>

                    <strong>
                        No customers found
                    </strong>

                    <span>
                        There are no registered customers.
                    </span>

                </td>

            </tr>

        `;

        return;
    }

    tbody.innerHTML =
        data.map(customer => `

            <tr>

                <td>
                    ${escapeHtml(
                        customer.id
                    )}
                </td>

                <td>

                    <span class="table-name">

                        ${escapeHtml(
                            customer.name ||
                            "-"
                        )}

                    </span>

                </td>

                <td>

                    <span class="table-email">

                        ${escapeHtml(
                            customer.email ||
                            "-"
                        )}

                    </span>

                </td>

                <td>

                    ${escapeHtml(
                        customer.phone ||
                        "-"
                    )}

                </td>

                <td>

                    <span class="status-badge available">

                        <i
                            class="fa-solid fa-user"
                        ></i>

                        ${escapeHtml(
                            customer.role ||
                            "CUSTOMER"
                        )}

                    </span>

                </td>

            </tr>

        `).join("");
}


// ======================================================
// DRIVER TABLE
// ======================================================

function renderDrivers(drivers) {

    const tbody =
        document.getElementById(
            "driversTableBody"
        );

    const count =
        document.getElementById(
            "driverCount"
        );

    if (!tbody) {
        return;
    }

    const data =
        Array.isArray(drivers)
            ? drivers
            : [];

    if (count) {

        count.textContent =
            data.length;
    }

    if (data.length === 0) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="9"
                    class="table-empty"
                >

                    <i
                        class="fa-solid fa-id-card"
                    ></i>

                    <strong>
                        No drivers found
                    </strong>

                    <span>
                        There are no registered drivers.
                    </span>

                </td>

            </tr>

        `;

        return;
    }

    tbody.innerHTML =
        data.map(driver => {

            const status =
                driver.status ||
                "UNKNOWN";

            const statusClass =
                getStatusClass(status);

            let locationHtml;

            if (
                driver.currentLatitude !== null &&
                driver.currentLatitude !== undefined &&
                driver.currentLongitude !== null &&
                driver.currentLongitude !== undefined
            ) {

                locationHtml = `

                    <span class="location">

                        ${escapeHtml(
                            Number(
                                driver.currentLatitude
                            ).toFixed(6)
                        )}

                        ,

                        ${escapeHtml(
                            Number(
                                driver.currentLongitude
                            ).toFixed(6)
                        )}

                    </span>

                `;

            } else {

                locationHtml = `

                    <span class="location empty">

                        Location unavailable

                    </span>

                `;
            }


            return `

                <tr>

                    <td>
                        ${escapeHtml(
                            driver.id
                        )}
                    </td>


                    <td>

                        <span class="table-name">

                            ${escapeHtml(
                                driver.name ||
                                "-"
                            )}

                        </span>

                    </td>


                    <td>

                        <span class="table-email">

                            ${escapeHtml(
                                driver.email ||
                                "-"
                            )}

                        </span>

                    </td>


                    <td>

                        ${escapeHtml(
                            driver.phone ||
                            "-"
                        )}

                    </td>


                    <td>

                        <strong>

                            ${escapeHtml(
                                driver.licenseNumber ||
                                "-"
                            )}

                        </strong>

                    </td>


                    <td>

                        ${driver.experience !== null &&
                        driver.experience !== undefined
                            ? escapeHtml(
                                driver.experience
                            ) + " yrs"
                            : "-"
                        }

                    </td>


                    <td>

                        <span class="rating">

                            <i
                                class="fa-solid fa-star"
                            ></i>

                            ${driver.rating !== null &&
                            driver.rating !== undefined
                                ? escapeHtml(
                                    Number(
                                        driver.rating
                                    ).toFixed(1)
                                )
                                : "-"
                            }

                        </span>

                    </td>


                    <td>

                        <span
                            class="status-badge ${statusClass}"
                        >

                            <i
                                class="fa-solid fa-circle"
                            ></i>

                            ${escapeHtml(
                                status
                            )}

                        </span>

                    </td>


                    <td>

                        ${locationHtml}

                    </td>

                </tr>

            `;
        }).join("");
}


// ======================================================
// VEHICLE TABLE
// ======================================================

function renderVehicles(vehicles) {

    const tbody =
        document.getElementById(
            "vehiclesTableBody"
        );

    const count =
        document.getElementById(
            "vehicleCount"
        );

    if (!tbody) {
        return;
    }

    const data =
        Array.isArray(vehicles)
            ? vehicles
            : [];

    if (count) {

        count.textContent =
            data.length;
    }

    if (data.length === 0) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="9"
                    class="table-empty"
                >

                    <i
                        class="fa-solid fa-car"
                    ></i>

                    <strong>
                        No vehicles found
                    </strong>

                    <span>
                        There are no registered vehicles.
                    </span>

                </td>

            </tr>

        `;

        return;
    }

    tbody.innerHTML =
        data.map(vehicle => {

            const status =
                vehicle.status ||
                "UNKNOWN";

            const statusClass =
                getStatusClass(status);

            const driverName =
                vehicle.driverName ||
                "Not assigned";


            return `

                <tr>

                    <td>
                        ${escapeHtml(
                            vehicle.id
                        )}
                    </td>


                    <td>

                        <span class="vehicle-number">

                            ${escapeHtml(
                                vehicle.vehicleNumber ||
                                "-"
                            )}

                        </span>

                    </td>


                    <td>

                        ${escapeHtml(
                            vehicle.vehicleType ||
                            "-"
                        )}

                    </td>


                    <td>

                        ${escapeHtml(
                            vehicle.brand ||
                            "-"
                        )}

                    </td>


                    <td>

                        ${escapeHtml(
                            vehicle.model ||
                            "-"
                        )}

                    </td>


                    <td>

                        ${escapeHtml(
                            vehicle.color ||
                            "-"
                        )}

                    </td>


                    <td>

                        ${vehicle.seatCapacity !== null &&
                        vehicle.seatCapacity !== undefined
                            ? escapeHtml(
                                vehicle.seatCapacity
                            )
                            : "-"
                        }

                    </td>


                    <td>

                        <span
                            class="status-badge ${statusClass}"
                        >

                            <i
                                class="fa-solid fa-circle"
                            ></i>

                            ${escapeHtml(
                                status
                            )}

                        </span>

                    </td>


                    <td>

                        <div class="table-name">

                            ${escapeHtml(
                                driverName
                            )}

                        </div>


                        ${
                            vehicle.driverEmail
                                ? `
                                    <div class="table-email">

                                        ${escapeHtml(
                                            vehicle.driverEmail
                                        )}

                                    </div>
                                `
                                : ""
                        }

                    </td>

                </tr>

            `;
        }).join("");
}


// ======================================================
// SHOW LOADING
// ======================================================

function showLoading(section) {

    if (section === "customers") {

        const tbody =
            document.getElementById(
                "customersTableBody"
            );

        if (tbody) {

            tbody.innerHTML = `

                <tr>

                    <td
                        colspan="5"
                        class="table-loading"
                    >

                        <i
                            class="fa-solid fa-spinner fa-spin"
                        ></i>

                        Loading customers...

                    </td>

                </tr>

            `;
        }

        return;
    }


    if (section === "drivers") {

        const tbody =
            document.getElementById(
                "driversTableBody"
            );

        if (tbody) {

            tbody.innerHTML = `

                <tr>

                    <td
                        colspan="9"
                        class="table-loading"
                    >

                        <i
                            class="fa-solid fa-spinner fa-spin"
                        ></i>

                        Loading drivers...

                    </td>

                </tr>

            `;
        }

        return;
    }


    if (section === "vehicles") {

        const tbody =
            document.getElementById(
                "vehiclesTableBody"
            );

        if (tbody) {

            tbody.innerHTML = `

                <tr>

                    <td
                        colspan="9"
                        class="table-loading"
                    >

                        <i
                            class="fa-solid fa-spinner fa-spin"
                        ></i>

                        Loading vehicles...

                    </td>

                </tr>

            `;
        }
    }
}


// ======================================================
// SHOW TABLE ERROR
// ======================================================

function showTableError(
    section,
    message
) {

    let tbody;

    let colspan;


    if (section === "customers") {

        tbody =
            document.getElementById(
                "customersTableBody"
            );

        colspan = 5;
    }


    if (section === "drivers") {

        tbody =
            document.getElementById(
                "driversTableBody"
            );

        colspan = 9;
    }


    if (section === "vehicles") {

        tbody =
            document.getElementById(
                "vehiclesTableBody"
            );

        colspan = 9;
    }


    if (!tbody) {
        return;
    }


    tbody.innerHTML = `

        <tr>

            <td
                colspan="${colspan}"
                class="table-error"
            >

                <i
                    class="fa-solid fa-triangle-exclamation"
                ></i>

                ${escapeHtml(message)}

            </td>

        </tr>

    `;
}


// ======================================================
// LOAD CUSTOMERS
// ======================================================

async function loadCustomers() {

    const token =
        getToken();


    if (!token) {

        window.location.href =
            "login.html";

        return;
    }


    showLoading("customers");


    try {

        const response =
            await fetch(
                API_BASE_URL +
                "/api/admin/customers",
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


        if (response.status === 401) {

            logoutAdmin();

            return;
        }


        if (response.status === 403) {

            throw new Error(
                "Access denied. Admin privileges are required."
            );
        }


        if (!response.ok) {

            throw new Error(
                "Unable to load customers."
            );
        }


        const customers =
            await response.json();


        renderCustomers(
            customers
        );


    } catch (error) {

        console.error(
            "Customers error:",
            error
        );

        showTableError(
            "customers",
            error.message ||
            "Unable to load customers."
        );

    }
}


// ======================================================
// LOAD DRIVERS
// ======================================================

async function loadDrivers() {

    const token =
        getToken();


    if (!token) {

        window.location.href =
            "login.html";

        return;
    }


    showLoading("drivers");


    try {

        const response =
            await fetch(
                API_BASE_URL +
                "/api/admin/drivers",
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


        if (response.status === 401) {

            logoutAdmin();

            return;
        }


        if (response.status === 403) {

            throw new Error(
                "Access denied. Admin privileges are required."
            );
        }


        if (!response.ok) {

            throw new Error(
                "Unable to load drivers."
            );
        }


        const drivers =
            await response.json();


        renderDrivers(
            drivers
        );


    } catch (error) {

        console.error(
            "Drivers error:",
            error
        );

        showTableError(
            "drivers",
            error.message ||
            "Unable to load drivers."
        );

    }
}


// ======================================================
// LOAD VEHICLES
// ======================================================

async function loadVehicles() {

    const token =
        getToken();


    if (!token) {

        window.location.href =
            "login.html";

        return;
    }


    showLoading("vehicles");


    try {

        const response =
            await fetch(
                API_BASE_URL +
                "/api/admin/vehicles",
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


        if (response.status === 401) {

            logoutAdmin();

            return;
        }


        if (response.status === 403) {

            throw new Error(
                "Access denied. Admin privileges are required."
            );
        }


        if (!response.ok) {

            throw new Error(
                "Unable to load vehicles."
            );
        }


        const vehicles =
            await response.json();


        renderVehicles(
            vehicles
        );


    } catch (error) {

        console.error(
            "Vehicles error:",
            error
        );

        showTableError(
            "vehicles",
            error.message ||
            "Unable to load vehicles."
        );

    }
}


// ======================================================
// LOAD CURRENT SECTION
// ======================================================

function loadCurrentSection() {

    hideError();


    if (currentSection === "customers") {

        loadCustomers();

        return;
    }


    if (currentSection === "drivers") {

        loadDrivers();

        return;
    }


    if (currentSection === "vehicles") {

        loadVehicles();
    }
}


// ======================================================
// TAB SWITCHING
// ======================================================

function setupTabs() {

    const tabs =
        document.querySelectorAll(
            ".management-tab"
        );


    const sections =
        document.querySelectorAll(
            ".management-content"
        );


    tabs.forEach(tab => {

        tab.addEventListener(
            "click",
            function () {

                const sectionName =
                    this.dataset.section;


                if (!sectionName) {
                    return;
                }


                currentSection =
                    sectionName;


                // ----------------------------------------
                // Update tabs
                // ----------------------------------------

                tabs.forEach(item => {

                    item.classList.remove(
                        "active"
                    );

                });


                this.classList.add(
                    "active"
                );


                // ----------------------------------------
                // Update sections
                // ----------------------------------------

                sections.forEach(section => {

                    section.classList.remove(
                        "active"
                    );

                });


                const target =
                    document.getElementById(
                        sectionName +
                        "Section"
                    );


                if (target) {

                    target.classList.add(
                        "active"
                    );
                }


                // ----------------------------------------
                // Load selected data
                // ----------------------------------------

                loadCurrentSection();

            }
        );

    });
}


// ======================================================
// REFRESH
// ======================================================

async function refreshCurrentSection() {

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


    try {

        await loadCurrentSection();

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
// INITIALIZATION
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadAdminName();


        setupTabs();


        loadCurrentSection();


        const refreshBtn =
            document.getElementById(
                "refreshBtn"
            );


        if (refreshBtn) {

            refreshBtn.addEventListener(
                "click",
                refreshCurrentSection
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