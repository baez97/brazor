function FightCom() {
    this.socket = undefined;
    this.player = undefined;
    this.fightPlaceID = undefined;

    this.ini = function (player) {
        this.socket = io.connect({'sync disconnect on unload':false});
        this.player = player;
        this.lanzarSocketSrv();
    }

    this.simulateFightPlace = function(user1, user2, id) {
        this.socket.emit('simulateFightPlace', user1, user2, id);
    }

    this.joinFight = function(fightPlaceID) {
        this.socket.emit('join', fightPlaceID);
        this.fightPlaceID = fightPlaceID;
    }

    this.getFightPlace = function(fightPlaceID) {
        this.socket.emit('')
    }

    this.moveFighter = function(fighterName, movement) {
        this.socket.emit('moveFighter', this.player.name, fighterName, movement, this.fightPlaceID);
    }

    this.attackFighter = function(fighterName, objectivePos) {
        this.socket.emit('attackFighter', this.player.name, fighterName, objectivePos, this.fightPlaceID);
    }

    this.saludar = function(player, fightPlaceID) {
        this.socket.emit('saludar', player.name, fightPlaceID);
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

        cli.socket.on("saludar", function(name) {
            console.log("Eres saludado por " + name);
        });

        cli.socket.on("setFightPlace", function(fightPlace) {
            setFightPlace(fightPlace);
        });

        cli.socket.on("update", function(fightPlace) {
            updateDisplay(fightPlace);
        })

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
            location.href = "/fight";
        });
    }
}