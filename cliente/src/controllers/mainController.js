function select(nameOfRace) {
    $("#errorBox").empty();

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
    console.log("Filling data when user is:");
    console.log(user);
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
                <th style="text-align: center"></th>
                <th>Nombre</th>
                <th style="text-align: center">Diplomas</th>
            </tr>
        </thead>`;

    rest.getFriends(user.friends, function(friends) {
        friends.forEach( (friend) => {
            chain += `
                <tr>
                    <td style="text-align: center; width: 40px">
                        <span onclick="challenge('${friend.name}', ${friend.online}, '${friend.email}')" 
                              class="online ${friend.online}">
                        </span>
                    </td>
                    <td>${friend.name}</td>
                    <td style="text-align: center">${friend.diplomas}</td>
                </tr>`;
        })
        $('#friends-table').empty();
        $('#friends-table').append(chain);
    });

}

function challenge(name, online, email) {
    if ( !online ) {
        showError(`<h1>${name} no está conectado</h1>`);
    } else {
        com.challenge(user, email);
    }
}

function acceptChallenge(email) {
    com.acceptChallenge(user, email);
    hideAlert();
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
        localStorage.setItem("loggedOut", "1");
        com.updateUsersOnline(user.email, user.friends);
        location.href="/";
    });
}

function disconnectUser() {
    rest.logoutUser(user.email, function() {
        com.updateUsersOnline(user.email, user.friends);
    });
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
        $("#alertButton").attr("onclick", "hideAlert()");
    })
}

function showReceiveChallenge(challenger) {
    $(document).ready( function() {
        $("#alert-container").removeClass("hidden");
        $("#alert-background").removeClass("hidden");
        $(".alert-title").text(`${challenger.name} te está desafiando, yo que tú le calentaba...`);
        $("#alertButton").attr("onclick", `acceptChallenge("${challenger.email}")`);
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
                user.friends.push(text);
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
rest = new ClienteRest();
com = new ClienteCom();

if ( !localStorage.user ) {
    location.href="/";
} else {
    user = JSON.parse(localStorage.getItem("user"));
    localStorage.removeItem("loggedOut");

    rest.onlineUser(user.email, user.password, showError, function(data) {
        if ( data ) {
            user = JSON.parse(localStorage.getItem("user"));
        }
    });
    com.ini(user);
    fillData();
    com.updateUsersOnline(user.email, user.friends);
}

$(window).on("beforeunload", function() {
    disconnectUser();
})