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

    this.moveFighter = function(fighterName, movement) {
        this.socket.emit('moveFighter', this.player.name, fighterName, movement, this.fightPlaceID);
    }

    this.attackFighter = function(fighterName, objectivePos) {
        this.socket.emit('attackFighter', this.player.name, fighterName, objectivePos, this.fightPlaceID);
    }

    this.attackOwnFighter = function(fighterName, objectivePos) {
        this.socket.emit('attackOwnFighter', this.player.name, fighterName, objectivePos, this.fightPlaceID);
    }
    
    this.spendTurn = function() {
        this.socket.emit('spendTurn', this.player.name, this.fightPlaceID);
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

        cli.socket.on("update", function(data) {
            addChange(data.change);
            updateDisplay(data.currentFightPlace);
        });
    }
}