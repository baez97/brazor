function ClienteCom() {
    this.socket = undefined;
    this.user = undefined;
    this.ini = function (user) {
        this.socket = io.connect();
        this.user = user;
        this.lanzarSocketSrv();
    }

    this.updateUsersOnline = function(email, friends) {
        console.log("Told you to update!");
        this.socket.emit('updateUsersOnline', email, friends);
    }

    this.challenge = function(user, email) {
        this.socket.emit('challenge', user, email);
    }

    this.acceptChallenge = function(user, email) {
        this.socket.emit('acceptChallenge', user, email);
    }

    this.lanzarSocketSrv = function () {
        var cli = this;
        cli.socket.on('connect', function () {
            console.log("Usuario conectado al servidor de WebSockets");
        });

        cli.socket.on('updateUsersOnline', function() {
            console.log("Muchacho actualiza");
            fillFriends();
        });

        cli.socket.on('challenge', function(challenger) {
            showReceiveChallenge(challenger);
        });

        cli.socket.on('acceptChallenge', function(challenger) {
            showAlert(`<h1>${challenger.name} ha aceptado tu desafío</h1>`);
        })

    }
}