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

            socket.on('saludar', function(name, fightPlaceID) {
                io.sockets.in(fightPlaceID).emit("saludar", name);
            });

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

            socket.on('crearPartida', function (usrid, nombrePartida) {
                console.log('nueva partida: ', usrid, nombrePartida);
                var usr = juego.obtenerUsuario(usrid);
                var partidaId;
                if (usr) {
                    console.log("usuario " + usrid + " crea partida " + nombrePartida);
                    partidaId = usr.crearPartida(nombrePartida);
                    socket.join(nombrePartida);
                    // io.sockets.in(nombrePartida).emit("partidaCreada", partidaId);
                    cli.enviarATodos(io, nombrePartida, "partidaCreada", partidaId);
                }
            });

            socket.on('abandonarPartida', function(usrid, nombrePartida) {
                console.log(`Partida ${nombrePartida} abandonada`);
                var usr = juego.obtenerUsuario(usrid);
                if ( usr ) {
                    console.log("usuario " + usrid + " abandona partida " + nombrePartida);
                    var partida = juego.obtenerPartida(nombrePartida);
                    console.log(partida);
                    partida.finPartida();

                    cli.agregarMensaje(io, nombrePartida, juego, usr.nombre + " abandona la partida");
                    cli.enviarATodos(io, nombrePartida, "finalizarPartida");
                }
            });

            socket.on('reconectarPartida', function(usrid, nombrePartida) {
                var usr = juego.obtenerUsuario(usrid);
                if ( usr && usr.partida.nombre == nombrePartida ) {
                    socket.join(nombrePartida);
                } 
                cli.enviarRemitente(socket, "reconectar", nombrePartida);
            })

            socket.on('obtenerDatosRival', function (usrid) {
                var usr = juego.obtenerUsuario(usrid);
                if ( usr ) {
                    console.log(usr);
                    cli.enviarRemitente(socket, "datosRival", usr.obtenerDatosRival());
                }
            });


            socket.on('elegirPartida', function (usrid, nombrePartida) {
                var usr = juego.obtenerUsuario(usrid);
                var partidaId;
                if (usr) {
                    partidaId = usr.eligePartida(nombrePartida);
                    if (partidaId < 0) {
                        console.log("usuario " + usrid + " NO se pudo unir a la partida " + nombrePartida);
                        //socket.emit("noUnido", partidaId);
                        cli.enviarRemitente(socket, "noUnido", partidaId);
                    } else {
                        console.log("usuario " + usrid + " se une a la partida " + nombrePartida);
                        socket.join(nombrePartida);
                        //io.sockets.in(nombrePartida).emit("unidoAPartida", partidaId);
                        cli.agregarMensaje(io, nombrePartida, juego, usr.nombre + " se ha unido a la partida");
                        cli.enviarRemitente(socket, "unidoAPartida", partidaId);
                        cli.agregarMensaje(io, nombrePartida, juego, "A jugar!");
                        cli.enviarATodos(io, nombrePartida, "aJugar", {});
                    }
                }
            });

            socket.on('pasarTurno', function(usrid, nombrePartida) {
                var usr = juego.obtenerUsuario(usrid);
                if ( usr ) {
                    usr.pasarTurno();
                    cli.agregarMensaje(io, nombrePartida, juego, usr.nombre + " ha pasado el turno");
                    console.log(usr.nombre + " ha pasado el turno");
                    cli.enviarRemitente(socket, "pasaTurno", usr.meToca());
                    cli.enviarATodosMenosRemitente(socket, nombrePartida, "meToca", usr.rivalTeToca());
                }
            });
            
            socket.on('obtenerCartasMano', function(usrid) {
                var usr = juego.obtenerUsuario(usrid);
                if ( usr ) {
                    // socket.emit("mano", usr.obtenerCartasMano());
                    json = { mano: usr.obtenerCartasMano(),
                             elixir: usr.elixir};

                    cli.enviarRemitente(socket, "mano", json);
                } 
            });
            
            socket.on('obtenerCartasAtaque', function(usrid) {
                var usr = juego.obtenerUsuario(usrid);
                if ( usr ) {
                    cli.enviarRemitente(socket, "cartasAtaque", usr.obtenerCartasAtaque());
                } 
            });

            socket.on('meToca', function(usrid) {
                var usr = juego.obtenerUsuario(usrid);
                if ( usr ) {
                    cli.enviarRemitente(socket, "meToca", usr.meToca());
                }
            });

            socket.on('atacar', function(usrid, nombrePartida, idCarta1, idCarta2) {
                var usr = juego.obtenerUsuario(usrid);
                if ( usr ) {
                    var json = usr.ataqueConNombre(idCarta1, idCarta2);
                    cli.agregarMensaje(io, nombrePartida, juego, `${idCarta1} ataca a ${idCarta2}`);
                    cli.enviarATodos(io, nombrePartida, "respuestaAtaque", json);
                }
            });

            socket.on('atacarRival', function(usrid, nombrePartida, carta) {
                var usr = juego.obtenerUsuario(usrid);
                if ( usr ) {
                    var json = usr.ataqueRivalConNombre(carta);
                    cli.agregarMensaje(io, nombrePartida, juego, `${usr.nombre} ataca al rival`);
                    juego.comprobarFin(nombrePartida, function(fin) {
                        if ( fin ) {
                            var resultado = juego.verResultado(nombrePartida);
                            juego.guardarResultado(resultado, function(result) {
                                if ( result.jugador1 ) {
                                    cli.enviarATodos(io, nombrePartida, "partidaFinalizada", result);
                                } else {
                                    cli.agregarMensaje(io, nombrePartida, juego, `No se ha podido guardar el resultado`);
                                }
                            });
                        } else {
                            cli.enviarATodos(io, nombrePartida, "respuestaAtaqueRival", json);
                        }
                    });
                }
            })

            socket.on('jugarCarta', function(usrid, nombrePartida, nombreCarta) { 
                var usr=juego.obtenerUsuario(usrid); 
                var carta;
                if ( usr ) { 
                    carta=usr.obtenerCartaMano(nombreCarta);
                    if (carta.coste==undefined){
                        console.log("usuario "+usrid+" NO pudo jugar esta carta porque no estaba en su mano");
                        // socket.emit("noJugadaNoMano",carta);
                        cli.enviarRemitente(socket, "noJugadaNoMano", carta);
                    } else {
                        usr.jugarCarta(carta);
                        if ( carta.posicion=="ataque" ){
                            cli.agregarMensaje(io, nombrePartida, juego, usr.nombre + " juega la carta " + carta.nombre);
                            console.log("usuario "+usrid+" juega la carta con coste: "+carta.coste+", elixir: " + usr.elixir);
                            // io.sockets.in(nombrePartida).emit("juegaCarta",usr.nombre, usr.elixir,carta);
                            let data = {
                                nombre: usr.nombre,
                                elixir: usr.elixir,
                                carta:  carta
                            };
                            cli.enviarATodos(io, nombrePartida, "juegaCarta", data);
                        } else {
                            console.log("usuario "+usrid+" NO pudo jugar la carta con coste: "+carta.coste);
                            // socket.emit("noJugada",carta);
                            cli.enviarRemitente(socket, "noJugada", carta);
                        }
                    }
                } 
            });

            socket.on('obtenerResultado', function(usrid, nombrePartida) {
                var usr = juego.obtenerUsuario(usrid);

                if ( usr ) {
                    var resultado = usr.partida.verResultado();
                    console.log(resultado);
                }
                cli.enviarATodos(io, nombrePartida, "obtenerResultado", resultado);
            });

            socket.on('obtenerMensajes', function(nombrePartida) {
                var partida = juego.obtenerPartida(nombrePartida);

                if ( partida ) {
                    cli.enviarATodos(io, nombrePartida, "mostrarMensajes", partida.obtenerMensajes());
                }
            });

            socket.on('agregarMensaje', function(nombrePartida, mensaje) {
                var partida = juego.obtenerPartida(nombrePartida);

                if ( partida ) {
                    partida.agregarMensaje(mensaje);
                    cli.enviarATodos(io, nombrePartida, "mostrarMensajes", partida.obtenerMensajes());
                }
            });
                
        });
    };
}
module.exports.ComSrv = ComSrv;