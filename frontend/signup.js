async function signupUser() {

    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const phoneInput = document.getElementById("phone");
    const passwordInput = document.getElementById("password");

    // Check that all fields exist
    if (!nameInput || !emailInput || !phoneInput || !passwordInput) {
        console.error("Signup form field is missing.");

        alert(
            "Signup form error: Name, Email, Phone and Password fields are required."
        );

        return;
    }

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    const password = passwordInput.value;

    // Validate fields
    if (
        name === "" ||
        email === "" ||
        phone === "" ||
        password === ""
    ) {
        alert("Please fill all fields.");
        return;
    }

    try {

        const response = await fetch(
            "https://ridenow-backend-1ty9.onrender.com/api/auth/register",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name: name,
                    email: email,
                    phone: phone,
                    password: password
                })
            }
        );

        const data = await response.json();

        console.log("Registration HTTP status:", response.status);
        console.log("Registration response:", data);

        // Registration failed
        if (!response.ok) {

            alert(
                data.message ||
                "Registration failed."
            );

            return;
        }

        // Registration successful
        alert("Account Created Successfully!");

        // Do NOT store the password in localStorage
        localStorage.setItem("name", name);
        localStorage.setItem("email", email);

        window.location.href = "login.html";

    } catch (error) {

        console.error("Registration error:", error);

        alert(
            "Unable to connect to the backend. Please try again."
        );
    }
}