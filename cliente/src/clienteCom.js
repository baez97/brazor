function ClienteCom() {
    this.socket = undefined;
    this.user = undefined;
    this.ini = function (user) {
        this.socket = io.connect();
        this.user = user;
        console.log("Hey! hola " +user.name);
        this.lanzarSocketSrv();
    }

    this.lanzarSocketSrv = function () {
        var cli = this;
        this.socket.on('connect', function () {
            console.log("Usuario conectado al servidor de WebSockets");
        });
    }
}