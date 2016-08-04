var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
// var HashTable = require('hashtable');

// var users = new HashTable();
var users = [];
var connections = [];
var rooms = [];
var roomCounter = [];


app.use(express.static('public'));

server.listen(process.env.PORT || 3000);
console.log("running!");

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

io.on("connection", function(socket){
	connections.push(socket);
	console.log("Sockets connected %s", connections.length);
	updateAllUsers();

	// Chat Message
	socket.on('chat message', function(data){
		if(!socket.user) { socket.user = 'anonymous coward';}
		if(!socket.location) {returnToLobby(socket);}

		var msg = {"user":socket.user, "message":data.message};
		io.to(socket.location).emit('new message',msg);
		// console.log(socket.rooms);
	});

	// Disconnect
	socket.on('disconnect', function(data){
		connections.splice(connections.indexOf(socket),1);
		console.log('Disconnected: %s sockets connected', connections.length);
		
		if(socket.location)
			roomCount(socket.location, false);
		if(socket.user){
			users.splice(users.indexOf(socket.user), 1);
			updateAllUsers();
		}

	});

	// New User 
	socket.on('new user', function(data, callback){
		if(!data){
			callback(false);
			return;
		}
		newUser(socket,data);
		returnToLobby(socket);
		callback(true); // I will throw room_array in here, instead of updating 
	});

	function newUser(socket,name){
		socket.user = name;
		users.push(socket.user);
		updateAllUsers();
		updateRooms();
	}
	// Make Room
	socket.on('make room', function(data,callback){
		if(!data.title || rooms.indexOf(data.title) > -1){
			callback(false); 
			return;
			// either no title, or the room name is taken
		}
		joinRoom(socket, data.title);
		rooms.push(socket.location); 
		roomCounter.push(0); // ?
		updateRooms();
		callback(true);
	
	});

	// Join Room
	socket.on('join room', function(data,callback){
		if(!data.title || rooms.indexOf(data.title) == -1 ){
			callback(false); 
			return;
		}

		joinRoom(socket, data.title);
		callback(true);
	});

	// Return to Lobby 
	socket.on('lobby', function(callback){
		returnToLobby(socket);
		callback();
	});

//// client needs a (return to lobby) button ///// 
	function returnToLobby(socket){
		if(!socket.user){ newUser(socket,'Anonymous Coward');}

		if(socket.location)
			{ 
				var msg = {"user":socket.user, "exit":true};
					io.to(socket.location).emit('new message',msg); /// announces leave
				socket.leave(socket.location);  
				roomCount(socket.location, false); 
				// socket.join(socket.location); //  joins lobby channel
			}
		socket.location = 'lobby';
		
	}
	function updateRooms(){	io.sockets.emit('get rooms', rooms);	 }// will update (number of people)
	function updateAllUsers(){
		var data = {"allUsers" : true, "users":users};
	 	io.sockets.emit('get users', data);
	 
	}

	function updateRoomUsers(roomname){
		var data = {};
		data.allUsers = false;
	 	var roomUsers = [];
	 	var room = io.sockets.adapter.rooms[roomname]; // room object
	 	// console.log(room);
	 	 for(var id in room.sockets)
	 	 	roomUsers.push(io.sockets.connected[id].user);
	 	data.users = roomUsers;
	 	io.to(roomname).emit('get users', data);
	 	// io.sockets.connected has every fcking socket as a value to an ID
	}

	function joinRoom(socket, roomname){
		returnToLobby(socket);
		socket.location = roomname; 
		socket.join(socket.location, function(){
			roomCount(socket.location, true);
			updateRoomUsers(roomname); 		// jeez
			var msg = {"user":socket.user, "enter":true};
			io.to(socket.location).emit('new message',msg);
		});
		
		
	}
	function roomCount(roomname, increment){
			var index = rooms.indexOf(roomname);
			if(index == -1){return;} // room not exist
			else{
				if(!increment){ 
					roomCounter[index]--; 
					if(roomCounter[index]<=0){ 	// destroy room
						rooms.splice(index, 1);
						roomCounter.splice(index, 1);
					}  
					updateRooms(); 
				}
				else{ 
					roomCounter[index]++;
				}
			}
	}
	
});


	

