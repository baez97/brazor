function signinClicked() {
    cleanError();

    var name     = $('#nameSignin').val();
    var email    = $('#emailSignin').val();
    var password = $('#passwordSignin').val();

    if ( name == "" || email == "" || password == "") {
        showError("Los tres campos son necesarios");
    } else if (/\s/.test(name)) {
        showError("El nombre de cuenta no puede contener espacios");
    } else if (!isEmail(email)) {
        showError("Email no válido");
    } else {
        var userJSON = {
            name: name,
            email: email,
            password: password
        }

        localStorage.setItem("user-to-sign", JSON.stringify(userJSON));
        location.href="/selection";
    }
}

function isEmail(email) {
    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return regex.test(email);
}