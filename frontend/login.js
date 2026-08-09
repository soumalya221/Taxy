async function loginUser() {

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;

    if (email === "" || password === "") {
        alert("Please enter email and password.");
        return;
    }

    try {

        const response = await fetch(
            "http://localhost:8080/api/auth/login",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: email,
                    password: password
                })
            }
        );

        const data = await response.json();

        console.log("Login response:", data);

        if (!response.ok || !data.success) {

            alert(
                data.message ||
                "Invalid email or password."
            );

            return;
        }

        // ==========================================
        // SAVE LOGIN INFORMATION
        // ==========================================

        localStorage.setItem(
            "token",
            data.token
        );

        localStorage.setItem(
            "email",
            data.email
        );

        localStorage.setItem(
            "role",
            data.role
        );

        // Save name if backend provides it
        if (data.name) {

            localStorage.setItem(
                "name",
                data.name
            );

        } else {

            // Use email as fallback
            localStorage.setItem(
                "name",
                data.email
            );
        }

        alert("Login Successful");

        // Go back to home page
        window.location.href = "index.html";

    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        alert(
            "Unable to connect to backend. " +
            "Make sure Spring Boot is running on port 8080."
        );
    }
}