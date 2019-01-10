function ClienteCom() {
    this.socket = undefined;
    this.user = undefined;
    this.ini = function (user) {
        this.socket = io.connect({'sync disconnect on unload':false});
        this.user = user;
        this.lanzarSocketSrv();
    }

    this.updateUsersOnline = function(email, friends) {
        this.socket.emit('updateUsersOnline', email, friends);
    }

    this.challenge = function(user, email) {
        this.socket.emit('challenge', user, email);
    }

    this.acceptChallenge = function(user, email) {
        this.socket.emit('acceptChallenge', user, email);
    }

    this.disconnect = function(email) {
        this.socket.emit('disconnect', email);
    }

    this.lanzarSocketSrv = function () {
        var cli = this;
        cli.socket.on('connect', function () {
            console.log("Usuario conectado al servidor de WebSockets");
        });

        cli.socket.on('updateUsersOnline', function() {
            fillFriends();
        });

        cli.socket.on('challenge', function(challenger) {
            showReceiveChallenge(challenger);
        });

        cli.socket.on('acceptChallenge', function(challenger) {
            showAlert(`${challenger.name} ha aceptado tu desafío`);
        });

        cli.socket.on('goToFight', function(data) {
            var { challenged, challenger, fightPlaceID } = data;

            if ( challenged.email === user.email ) {
                localStorage.setItem("player", JSON.stringify(challenged));
                localStorage.setItem("enemy", JSON.stringify(challenger));
            } else {
                localStorage.setItem("player", JSON.stringify(challenger));
                localStorage.setItem("enemy", JSON.stringify(challenged));
            }

            localStorage.setItem("fightPlaceID", JSON.stringify(fightPlaceID));
            localStorage.setItem("oldFightersNumber", user.fighters.length);
            
            localStorage.setItem("fightPlaceID", JSON.stringify(fightPlaceID));
            location.href = "/fight";
        });
    }
}