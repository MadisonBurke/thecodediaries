$(function(){
	var socket = io.connect();
	var $messageForm = $('#messageForm');
	var $message = $('#message');
	var $chat = $('#chat');
	var $messageArea = $('#messageArea');
	var $userFormArea = $('#userFormArea');
	var $userForm = $('#userForm');
	var $allUsers = $('#allUsers');
	var $allUsersList = $('#allUsersList'); 
	var $roomUsers = $('#roomUsers');
	var $roomUsersList = $('#roomUsersList');
	var $username = $('#username');
	var $roomArea = $('#roomArea');
	var $rooms = $('#rooms');
	var $makeRoom = $('#makeRoom');
	var $roomTitle = $('#roomTitle');
	var $lobbyButton = $('#lobbyButton');

	///////////////////////////////////////
	//////////////  MESSAGES  /////////////
	///////////////////////////////////////
	socket.on('new message', function(data){
		if(data.enter)
			$chat.append('<div class="well muted">'+data.user+" has joined the room.");
		else if(data.exit)
			$chat.append('<div class="well muted">'+data.user+" has left the room.");
		else 
    		$chat.append('<div class="well"><strong>'+data.user+"</strong>: "+data.message+'</div>');
 	 });

	///////////////////////////////////////
	///////////////////////////////////////
	$messageForm.submit(function(e){
		e.preventDefault();
		var data = {"message":$message.val()};
		socket.emit('chat message', data);
	    $message.val('');
	});
	///////////////////////////////////////
	$lobbyButton.on('click',function(){
		socket.emit('lobby', function(){
			enterLobby();
		});
		
	})

	///////////////////////////////////////
	///////////  USERS  ///////////////////
	///////////////////////////////////////
	socket.on('get users', function(data){
		var html = '';
		for(i=0; i < data.users.length; i++){
			html += '<li class="list-group-item user">'+data.users[i]+'</li>';
		}
		
		if(data.allUsers) $allUsersList.html(html);
		else $roomUsersList.html(html);
		
	});
	///////////////////////////////////////
	///////////////////////////////////////
	$userForm.submit(function(e){
		e.preventDefault();
		socket.emit('new user', $username.val(), function(recieved){
			if(recieved){	enterLobby(); }
		});
	});
	///////////////////////////////////////
	////////////  ROOMS  //////////////////
	///////////////////////////////////////
	socket.on('get rooms', function(data){
		var html = '';
		for(i=0; i < data.length; i++){
			html += '<li class="list-group-item room">'+data[i]+'</li>';
		}
		$rooms.html(html);

		///////////// Join Room //////////
		$rooms.find('li').on('click',function(){
			$(this).hide(1000).show(1000);
			var data = { 'title':$(this).html()	};
			socket.emit('join room',data,function(recieved){
				if(recieved){ enterRoom(data.title); }
			} );
		});	

	});
	///////////////////////////////////////
	///////////////////////////////////////
	$makeRoom.on('click',function(){
		var title = prompt();
		var data = {"title":title };
		socket.emit('make room', data, function(recieved){
			if(recieved){ enterRoom(data.title); }
		});
	});
	///////////////////////////////////////
	///////////////////////////////////////
	function activateRooms(){
		$rooms.find('li').on('click',function(){
			$(this).hide(1000).show(1000);
			alert($(this).html());
		})
	}

	function enterRoom(roomname){
		$userFormArea.hide();  // hide everything
		$roomArea.hide(); 
		$allUsers.hide();		// hide online users 

		$roomTitle.html(roomname); // fix room title
		$roomUsers.show();		   // show room users
		$messageArea.show();	   // show chat room
	}

	function enterLobby(){
		$messageArea.hide();
		$userFormArea.hide();
		$chat.html('');
		
		$roomUsers.hide();
		
		$allUsers.show();
		$roomArea.show();

	}

	function enterUser(){
		$username.val('');
		$messageArea.hide();
		$roomArea.hide();
		$userFormArea.show();
		$roomUsers.hide();
	}
	

	});
