function ComSrv() {

    this.enviarRemitente = function (socket, mens, datos) {
        socket.emit(mens, datos);
    }

    this.sendTo = function (socket, message, data) {
        socket.emit(message, data);
    }

    this.sendToFightPlace = function(io, fightPlaceID, message, data) {
        io.sockets.in(fightPlaceID).emit(message, data);
    }

    this.enviarATodos = function (io, nombre, mens, datos) {
        io.sockets.in(nombre).emit(mens, datos);
    }
    this.enviarATodosMenosRemitente = function (socket, nombre, mens, datos) {
        socket.broadcast.to(nombre).emit(mens, datos)
    };
    this.agregarMensaje = function (io, nombrePartida, juego, mensaje) {
        var partida = juego.obtenerPartida(nombrePartida);
        if ( partida ) {
            partida.agregarMensaje(mensaje);
            io.sockets.in(nombrePartida).emit("mostrarMensajes", partida.obtenerMensajes());
        } else {
            return 0;
        }
    }

    this.lanzarSocketSrv = function (io, juego) {
        var cli = this;
        var clients = {};
        var fightPlaces = {};

        io.on('connection', function (socket) {
            socket.on('join', function(fightPlaceID) {
                socket.join(fightPlaceID);
                var fightPlace = juego.getFightPlace(fightPlaceID);
                cli.sendTo(socket, "setFightPlace", fightPlace);
            });

            socket.on('simulateFightPlace', function(user1, user2, id) {
                juego.simulateFightPlace(user1, user2, id);
            });

            socket.on('moveFighter', function(playerName, fighterName, movement, fightPlaceID) {
                juego.moveFighter(playerName, fighterName, movement, fightPlaceID);
                var currentFightPlace = juego.getFightPlace(fightPlaceID);
                var data = {currentFightPlace: currentFightPlace, change: {}}
                cli.sendToFightPlace(io, fightPlaceID, "update", data);
            });

            socket.on('attackFighter', function(playerName, fighterName, objectivePos, fightPlaceID) {
                var change = juego.attackFighter(playerName, fighterName, objectivePos, fightPlaceID);
                var currentFightPlace = juego.getFightPlace(fightPlaceID);
                var data = {currentFightPlace: currentFightPlace, change: change}
                cli.sendToFightPlace(io, fightPlaceID, "update", data);
            });

            socket.on('attackOwnFighter', function(playerName, fighterName, objectivePos, fightPlaceID) {
                var change = juego.attackOwnFighter(playerName, fighterName, objectivePos, fightPlaceID);
                var currentFightPlace = juego.getFightPlace(fightPlaceID);
                var data = {currentFightPlace: currentFightPlace, change: change}
                cli.sendToFightPlace(io, fightPlaceID, "update", data);
            });

            socket.on('spendTurn', function(playerName, fightPlaceID) {
                juego.spendTurn(playerName, fightPlaceID);
                var currentFightPlace = juego.getFightPlace(fightPlaceID);
                var data = {currentFightPlace: currentFightPlace }
                cli.sendToFightPlace(io, fightPlaceID, "update", data);
            })

            socket.on('updateUsersOnline', function(email, friends) {
                clients[email] = socket;
                if ( friends.length ) {
                    friends.forEach(frEmail => {
                        if ( clients[frEmail] ) {
                            cli.sendTo(clients[frEmail], "updateUsersOnline", {});
                        }
                    });
                }
            });

            socket.on('challenge', function(challenger, email) {
                console.log(Object.keys(clients));
                cli.sendTo(clients[email], "challenge", challenger);
            });

            socket.on('acceptChallenge', function(challenger, email) {
                juego.getUser(email, function(challenged) {
                    juego.createFightPlace(challenger, challenged, function(fightPlaceID) {
                        var data = { challenged: challenged, challenger: challenger, fightPlaceID: fightPlaceID}
                        cli.sendTo(clients[challenged.email], "goToFight", data);
                        cli.sendTo(clients[challenger.email], "goToFight", data);
                    });
                });
            }); 
        });
    };
}
module.exports.ComSrv = ComSrv;