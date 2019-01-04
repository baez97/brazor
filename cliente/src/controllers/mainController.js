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
    showError("<h1>Luchador bloqueado</h1>");
}

user = user;

function fillData() {
    fillName();
    $(document).ready( () => { 
        fillStats( () => {
            fillFighters( () => {
                fillFriends();
            })
        });
    })
}

function fillName() {
    $("#name").text(user.name);
}

function fillFriends() {

    var chain = `
        <thead>
            <tr>
                <th>En línea</th>
                <th>Nombre</th>
                <th>Diplomas</th>
            </tr>
        </thead>`;

    rest.getFriends(user.friends, function(friends) {
        friends.forEach( (friend) => {
            chain += `
                <tr>
                    <td>NO</td>
                    <td>${friend.name}</td>
                    <td>${friend.diplomas}</td>
                </tr>`;
        })
        $('#friends-table').empty();
        $('#friends-table').append(chain);
    });

}

function fillStats(callback) {
    $("#experience").width(`${user.experience}%`);
    $("#diplomas").empty();
    $("#diplomas").append(user.diplomas);
    $(document).ready(callback);
}

function fillFighters(callback) {
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
    $(document).ready(callback);
}

function logOut() {
    rest.logoutUser(user.email, function() {
        localStorage.removeItem("user");
        location.href="/";
    });
}

function disconnectUser() {
    rest.logoutUser(user.email, () => {});
}

function hideAlert() {
    $(document).ready( function() {
        $("#alert-container").addClass("hidden");
        $("#add-friend-container").addClass("hidden");
        $("#alert-background").addClass("hidden");
        cleanError();
    })
}

function showAlert(message) {
    $(document).ready( function() {
        $("#alert-container").removeClass("hidden");
        $("#alert-background").removeClass("hidden");
        $(".alert-title").text(message);
    })
}

function showAddFriend() {
    $(document).ready( function() {
        $("#add-friend-container").removeClass("hidden");
        $("#alert-background").removeClass("hidden");
    })
}

function addFriend() {
    var text = $("#textFriend").val();
    if ( isEmail(text) ) {
        rest.addFriendByEmail(user, text, function(success) {
            if ( success ) {
                user.friends.add(text);
                localStorage.setItem("user", JSON.stringify(user));
                fillFriends();
                hideAlert();
            } else {
                showError("<h1>No hay ningún jugador con ese email</h1>");
            }
        });
    } else if ( text.length > 0 ) {
        //rest.addFriendByName(text); 
    } else {
        showError("<h1>Introduce el nombre</h1>");
    }
}

function isEmail(email) {
    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return regex.test(email);
}

var user;
$(document).ready(function () {
    user = JSON.parse(localStorage.getItem("user"));
    fillData();
});

window.onbeforeunload = function (e) {
    disconnectUser();
}