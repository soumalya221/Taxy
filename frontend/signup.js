async function signupUser() {

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const password = document.getElementById("password").value;

    if (name === "" || email === "" || phone === "" || password === "") {
        alert("Please fill all fields");
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

        console.log("Register response:", data);

        if (!response.ok) {
            alert(data.message || "Registration failed");
            return;
        }

        alert("Account Created Successfully!");

        window.location.href = "login.html";

    } catch (error) {

        console.error("Registration error:", error);

        alert("Unable to connect to backend.");
    }
}