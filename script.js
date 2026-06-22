let currentFare = 0;
function calculateFare() {

    let distance =
        document.getElementById("distance").value;

    let vehicle =
        document.getElementById("vehicle").value;

    let rate = 10;

    if(vehicle === "sedan"){
        rate = 12;
    }

    if(vehicle === "suv"){
        rate = 18;
    }

    currentFare = distance * rate;

    document.getElementById("fareResult").innerHTML =
        "Fare: ₹" + currentFare;
}

function bookRide(){

    let name =
        document.getElementById("customerName").value;

    let phone =
        document.getElementById("customerPhone").value;

    if(name === "" || phone === ""){
        alert("Please enter all details");
        return;
    }

    alert(
        "Booking Confirmed\n\n" +
        "Customer: " + name +
        "\nFare: ₹" + currentFare
    );
}
function initAutocomplete() {

    const pickup =
        document.getElementById("pickup");

    const destination =
        document.getElementById("destination");

    new google.maps.places.Autocomplete(
        pickup
    );

    new google.maps.places.Autocomplete(
        destination
    );
}

window.onload = initAutocomplete;
async function calculateFare() {

    const pickup =
        document.getElementById("pickup").value;

    const destination =
        document.getElementById("destination").value;

    const vehicle =
        document.getElementById("vehicle").value;

    const service =
        new google.maps.DistanceMatrixService();

    service.getDistanceMatrix(
        {
            origins:[pickup],
            destinations:[destination],
            travelMode:"DRIVING"
        },

        function(response,status){

            if(status==="OK"){

                const distanceText =
                    response.rows[0]
                    .elements[0]
                    .distance.text;

                const distanceValue =
                    response.rows[0]
                    .elements[0]
                    .distance.value;

                const km =
                    distanceValue / 1000;

                let rate = 10;

                if(vehicle==="sedan")
                    rate=12;

                if(vehicle==="suv")
                    rate=18;

                const fare =
                    Math.round(km*rate);

                document
                    .getElementById(
                        "fareResult"
                    )
                    .innerHTML =
                    `Distance: ${distanceText}
                     <br>
                     Fare: ₹${fare}`;
            }
        }
    );
}
const username =
localStorage.getItem("name");

document.getElementById(
    "welcomeUser"
).innerHTML =
"Welcome, " + username;
window.onload = function(){

    const username =
        localStorage.getItem("name");

    if(username){

        document.getElementById(
            "welcomeUser"
        ).innerHTML =
        "Welcome, " + username;

        document.querySelector(
            ".signup-btn"
        ).style.display = "none";

        document.querySelector(
            ".login-btn"
        ).style.display = "none";
    }
}