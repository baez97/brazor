function loginClicked() {
    cleanError();
    var email    = $('#emailLogin').val();
    var password = $('#passwordLogin').val();
    
    if ( testEmail(email) ) {
        if ( testPassword(password) ) {
            rest.loginUser(email, password, showError);
        } else {
            showError("<span>Introduce la contraseña</span>");
        }
    } else {
        showError("<span>Email incorrecto</span>");
    }
}

function testEmail(email) {
    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return regex.test(email);
}

function testPassword(password) {
    if ( password ) { 
        return true;
    } else {
        return false;
    }
}