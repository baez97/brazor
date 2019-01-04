function select(nameOfRace) {
    $(".error-box").empty();

    user.fighters.forEach((fighter) => {
        if (fighter.name == nameOfRace) {
            var { name, damage, life } = fighter;
            $('#life').text(life);
            $('#damage').text(damage);
            $('#profile').attr('src', `cliente/img/profiles/${name}.png`);
        }
    })
}

function selectLocked() {
    $(".error-box").empty();
    $(".error-box").append("<h1>Luchador bloqueado</h1>");
}

user = user;

function fillData() {
    fillName();
    fillStats();
    fillFighters();
}

function fillName() {
    $("#name").text(user.name);
}

function fillStats() {
    $("#experience").width(`${user.experience}%`);
    $("#diplomas").empty();
    $("#diplomas").append(user.diplomas)
}

function fillFighters() {
    var chain = "";
    for (var i = 0; i < user.fighters.length; i++) {
        let name = user.fighters[i].name;
        chain += `<button class="icon ${name}" onClick="select('${name}')"></button>`;
    }

    for (; i < 4; i++) {
        chain += `<button class="icon locked" onClick="selectLocked()"></button>`;
    }

    $(".fighters-deck").empty();
    $(".fighters-deck").append(chain);
    select(user.selected);
}

function logOut() {
    localStorage.removeItem("user");
    location.href="/";
}

function hideAlert() {
    $("#alert-background").addClass("hidden");
    $("#alert-container").addClass("hidden");
}

function showAlert(message) {
    $(document).ready( function() {
        $("#alert-container").removeClass("hidden").addClass("visible");
        $("#alert-background").removeClass("hidden").addClass("visible");
        $(".alert-title").text(message);
    })
}

var user;
$(document).ready(function () {
    user = JSON.parse(localStorage.getItem("user"));
    fillData();
});