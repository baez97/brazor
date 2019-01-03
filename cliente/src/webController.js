function loginClicked() {
    cleanError();
    var email    = $('#emailLogin').val();
    var password = $('#passwordLogin').val();

    rest.loginUsuario(email, password);
}

function showError(message) {
    var errorBox = $('#errorBox');
    errorBox.append(`<span>${message}</span>`);
}

function cleanError() {
    $('#errorBox').empty();
}

function signinClicked() {
    cleanError();

    var nombre   = $('#nameSignin').val();
    var email    = $('#emailSignin').val();
    var password = $('#passwordSignin').val();

    if ( nombre == "" || email == "" || password == "") {
        showError("Los tres campos son necesarios");
    } else if (!isEmail(email)) {
        showError("Email no válido");
    } else {
        rest.registrarUsuario(nombre, email, password);
    }
}

function isEmail(email) {
    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return regex.test(email);
}

function select(nameOfRace) {
    $(".error-box").empty();

    var { title, description, damage, life } = races[nameOfRace];

    selected = nameOfRace;

    $('#title').text(title);
    $('#description').text(description);
    $('#life').text(life);
    $('#damage').text(damage);
    $('#profile').attr('src', `cliente/img/profiles/${nameOfRace}.png`);
}

function confirmSelection() {
    alert(selected);
}

function selectLocked() {
    $(".error-box").empty();
    $(".error-box").append("<h1>Luchador bloqueado</h1>");
}