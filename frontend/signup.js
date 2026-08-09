function signupUser(){

    let name =
        document.getElementById("name").value;

    let email =
        document.getElementById("email").value;

    let password =
        document.getElementById("password").value;

    if(
        name === "" ||
        email === "" ||
        password === ""
    ){

        alert("Please fill all fields");
        return;
    }

    localStorage.setItem(
        "name",
        name
    );

    localStorage.setItem(
        "email",
        email
    );

    localStorage.setItem(
        "password",
        password
    );

    alert(
        "Account Created Successfully!"
    );

    window.location.href =
        "login.html";
}