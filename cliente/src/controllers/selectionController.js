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
    console.log(selected);
}