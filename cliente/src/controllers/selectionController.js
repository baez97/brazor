var selected = 'yopuka'; 

function select(nameOfRace) {
    $(".error-box").empty();

    var { title, description, damage, life } = races[nameOfRace];

    selected = nameOfRace;

    $('#title').text(title);
    $('#description').text(description);
    $('#life').text(life);
    if ( nameOfRace === 'sacrogito' ) {
        $('#damage').text("10-100");
    } else {
        $('#damage').text(damage);
    }
    $('#profile').attr('src', `cliente/img/profiles/${nameOfRace}.png`);
}

function confirmSelection() {
    var userJSON = localStorage.getItem("user-to-sign");
    var user = JSON.parse(userJSON);

    user.diplomas = 0;
    user.experience = 0;
    user.selected = selected;
    user.fighters = [];
    user.friends = [];
    var firstFighter = races[selected];
    user.fighters.push({
        name: selected,
        damage: firstFighter.damage,
        life: firstFighter.life,
        reach: firstFighter.reach
    })

    localStorage.removeItem("user-to-sign");
    rest.registerUser(user, showError);
}
