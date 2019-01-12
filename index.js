var fs      = require("fs");
var config  = JSON.parse(fs.readFileSync("config.json"));
var host    = config.host;
var port    = config.port;
var bodyParser = require('body-parser');
var exp     = require("express");
var app     = exp(); 
var server  = require('http').Server(app);

var io      = require('socket.io').listen(server);
var model   = require("./server/model.js");
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

app.get('/fight', function(request, response) {
    var contenido = fs.readFileSync("./cliente/views/fight.html");
    response.setHeader("Content-type", "text/html");
    response.send(contenido);
})
// --------------------------------------------------------------------


// --------------------------------------------------------------------
// ------------------------- API REST ROUTES --------------------------
// --------------------------------------------------------------------
app.post("/loginUser/", function(req, res) {
    var email = req.body.email;
    var password = req.body.password;

    juego.loginUser(email, password, function(data) {
        res.send(data);
    });
});

app.post("/registerUser", function(req, res) {
    var user = req.body;
    juego.registerUser(user, function(data) {
        res.send(data);
    });
});

app.post("/addFriendByEmail", function(req, res) {
    var { user, email } = req.body;
    juego.addFriendByEmail(user, email, function(data) {
        res.send(data);
    });
});

app.post("/addFriendByName", function(req, res) {
    var { user, name } = req.body;
    juego.addFriendByName(user, name, function(data) {
        res.send(data);
    });
});

app.post("/getFriends", function(req, res) {
    juego.getFriends(req.body, function(data) {
        res.send(data);
    });
});

app.put("/logoutUser", function(req, res) {
    juego.logoutUser(req.body.email, function(data) {
        res.send(data);
    });
});

app.put("/unlockFighter", function(req, res) {
    juego.unlockFighter(req.body.user, function(newFighter) {
        res.send({newFighter: newFighter});
    });
});


server.listen(app.get('port'), function () {
	console.log('Node app is running on port', app.get('port'));
});

com.lanzarSocketSrv(io,juego);