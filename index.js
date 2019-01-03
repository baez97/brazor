var fs      = require("fs");
var config  = JSON.parse(fs.readFileSync("config.json"));
var host    = config.host;
var port    = config.port;
var bodyParser = require('body-parser');
var exp     = require("express");
var app     = exp(); 
var server  = require('http').Server(app);

var io      = require('socket.io').listen(server);
var model  = require("./server/model.js");
var comSrv  = require("./server/comSrv.js");
var com     = new comSrv.ComSrv();

var juego = new model.Juego(13);

app.set('port', (process.env.PORT || 5000));
app.use(exp.static(__dirname + '/'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// --------------------------------------------------------------------
// ---------------------------- ROUTING -------------------------------
// --------------------------------------------------------------------
app.get('/', function(request, response) {
	var contenido=fs.readFileSync("./cliente/index.html"); 
	response.setHeader("Content-type","text/html");
	response.send(contenido); 
});

app.get('/login', function(request, response) {
    var contenido = fs.readFileSync("./cliente/views/login.html");
    response.setHeader("Content-type", "text/html");
    response.send(contenido);
})

app.get('/signin', function(request, response) {
    var contenido = fs.readFileSync("./cliente/views/signin.html");
    response.setHeader("Content-type", "text/html");
    response.send(contenido);
})

app.get('/selection', function(request, response) {
    var contenido = fs.readFileSync("./cliente/views/selection.html");
    response.setHeader("Content-type", "text/html");
    response.send(contenido);
})

app.get('/main', function(request, response) {
    var contenido = fs.readFileSync("./cliente/views/main.html");
    response.setHeader("Content-type", "text/html");
    response.send(contenido);
})
// --------------------------------------------------------------------


// --------------------------------------------------------------------
// ------------------------- API REST ROUTES --------------------------
// --------------------------------------------------------------------
app.post("/loginUsuario/", function(req, res) {
    var email = req.body.email;
    var password = req.body.password ? req.body.password : "";

    juego.loginUser(email, password, function(data) {
        res.send(data);
    });
});

// app.post("/registrarUsuario/", function(req, res) {
//     var nombre = req.body.nombre;
//     var email  = req.body.email;
//     var clave  = req.body.clave;

//     juego.registrarUsuario(nombre, email, clave, function(data) {
//         res.send(data);
//     })
// })

// app.get("/confirmarUsuario/:usremail/:key", function(req, res) {
//     var email = req.params.usremail;
//     var key   = req.params.key;
//     console.log("Confirmando usuario! => " + email + " " + key);

//     juego.confirmarUsuario(email, key, function(data) {
//         if ( data.res ) {
//             res.send("<h3>Usuario confirmado</h3>");
//         } else {
//             res.send('<h3 style="color: red">No se pudo confirmar el usuario</h3>');
//         }
//     });
// })

// app.get("/comprobarUsuario/:usrid", function (request, response) {
//     var usrid = request.params.usrid;
//     var usr = juego.obtenerUsuario(usrid);
//     var json;
//     if (usr) {
//         if (usr.partida) {
//             var json = { "partida": usr.partida.nombre };
//         } else {
//             var json = { "partida": undefined };
//         }
//     } else {
//         response.send( {"notFound": true} );
//     }
//     response.send(json);
// });


// app.get("/agregarUsuario/:nombre",function(request,response) {
// 	// const nombre = request.params.nombre;
// 	// var usr     = new model.Usuario(nombre);
// 	// juego.agregarUsuario(usr);
//     // DEPRECATED!
    
// 	response.send({"usr":-1});
// });

// app.get("/crearPartida/:usrid/:nombre",function(request,response) {
// 	var usrid   = request.params.usrid;
// 	var nombre  = request.params.nombre;

// 	var usr     = juego.obtenerUsuario(usrid);

// 	if ( usr ) {
// 		var id = juego.crearPartida(nombre, usr);
// 		var partida = juego.partidas[id];
// 		response.send({"nombre-partida:":partida.nombre, "id":id});
// 	}

// 	response.send({"res": -1});

// });

// app.get("/elegirPartida/:usrid/:nombre",function(request,response){
// 	var usrid   = request.params.usrid;
// 	var partida = request.params.nombre;

// 	var usr     = juego.obtenerUsuario(usrid); 

// 	var id = usr.eligePartida(partida);

// 	response.send({"id":id});
// });

// app.get("/obtenerCartasMano/:usrid", function(request, response) {
// 	var usrid   = request.params.usrid;
// 	var usr     = juego.obtenerUsuario(usrid);

// 	var json_cartas = [];

// 	if ( usr ) {
// 		json_cartas = usr.obtenerCartasMano();
// 	}
		
// 	response.send(json_cartas);
// });

// app.get("/jugarCarta/:usrid/:cartaid",function(request,response){
// 	var usrid   = request.params.usrid;
// 	var cartaid = request.params.cartaid;

// 	var usr		= juego.obtenerUsuario(usrid); 
// 	var carta   = usr.obtenerCartaMano(cartaid);
	
// 	usr.jugarCarta(carta);
	
// 	const respuesta = usr.nombre + ", has jugado la carta " + carta.nombre;
// 	response.send({"res":respuesta});
// });

// app.get("/pasarTurno/:usrid/",function(request,response){
// 	var usrid = request.params.usrid;
// 	var usr   = juego.obtenerUsuario(usrid);

// 	if ( usr ) {
// 		usr.pasarTurno();
// 		const respuesta = usr.nombre + ", has pasado el turno";
// 	} else {
// 		const respuesta = "El usuario no existe";
// 	}
// 	response.send({"res": respuesta});
// });

// app.get("/ataca/:usrid/:cartaid/:targetid",function(request,response){
// 	var usrid    = request.params.usrid;
// 	var cartaid  = request.params.cartaid;
// 	var targetid = request.params.targetid;

// 	var usr      = juego.obtenerUsuario(usrid); 
// 	var carta    = juego.cartas[cartaid];
// 	var target   = juego.obtenerUsuario(targetid);

// 	const respuesta = -1;

// 	if ( usr ) {
// 		usr.ataca(carta, target);
// 		respuesta = usr.nombre + ", has atacado a " 
// 				 + target.nombre + " con " 
// 				 + carta.nombre;
// 	}

// 	response.send({"res": respuesta});
// });

// app.get("/verResultado/:nombre/", function(request,response){
// 	var nombre = request.params.nombre;

// 	const respuesta = juego.verResultado(nombre);

// 	response.send({"res": respuesta});
// });

// app.get("/obtenerPartidas", function(request, response) {
// 	var json=[];
// 	var partidas=juego.obtenerPartidas();

// 	if ( partidas.length != 0 ) {
// 		for ( var i=0; i<partidas.length; i++ ) {
// 			var partida=partidas[i];
// 			json.push({"idPartida":partida.id,"nombre":partida.nombre});
// 		}
// 	} 

// 	response.send(json);
// });

// app.get("/cambiarTurno/:usrid/", function(request, response) {
// 	var usr = juego.obtenerUsuario(request.params.usrid);
// 	usr.cambiarTurno();

// 	response.send({res: "Turno pasado"});
// });

// app.delete("/eliminarUsuario/:uid",function(request,response){
//     var uid=request.params.uid;
//     juego.eliminarUsuario(uid,function(result){
//         response.send(result);
//     });
// });


server.listen(app.get('port'), function () {
	console.log('Node app is running on port', app.get('port'));
});

com.lanzarSocketSrv(io,juego);