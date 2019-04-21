//Global Variables
var focused = true;
var chatblocks = [];
var interval;
var id_count = 0;
var id_reset = 10000;
var chattemp = 0;
var chattemp_max = 64;
var vue;

//Socket
//var socket = io.connect('https://' + document.domain);
//Socket Debug
var socket = io.connect('http://' + document.domain + ':20000');

socket.on('connect', function() {
    socket.emit('connected');
});

socket.on('disconnect', function() {
	console.error('Server disconnected!');
    location.reload();
});

socket.on('chatreceive', function(data) {
	if (focused) {
		let obj = JSON.parse(data);
		let xx = $(window).width()*(obj.x/100);
		let yy = $(window).height()*(obj.y/100);
		let bb = new Chatblock(xx,yy,obj.message);
		bb.draw('chatroom',id_count);
		id_count += 1;
		if (id_count > id_reset) {
			id_count = 0;
		}
		chatblocks.push(bb);
	}
});

socket.on('onlineupdate', function(data) {
	if (data == 1) {
		data = 'Only you';
	}
	$('#online').html('Online: '+data);
});

socket.on('setname', function(data) {
	if (data === true) {
		vue.page = 1;
		vue.loading = false;
		vue.title = 'Hello, ' + vue.nickname
		vue.subtitle = 'Enter room ID to join a room';
		vue.placeholder = 'Room ID';
	}
});

//Documents
function update() {
	//Chat fades
	let removal_id = [];
	for (let i = 0; i < chatblocks.length; i++) {
		if (chatblocks[i].update()) {
			removal_id.push(i);
		}
	}
	for (let i = 0; i < removal_id.length; i++) {
		chatblocks.splice(removal_id[i], 1);
	}
	if (!focused) {
		chatblocks = [];
	}
	//Anti spam
	let changed = false;
	if (chattemp > 0) {
		chattemp -= 1;
		changed = true;
	}
	let cttpperc = (chattemp/chattemp_max)*100;
	if (cttpperc > 100) {
		cttpperc = 100;
	}
	if (changed) {
		$('#chattemp').html(chattemp);
		$('#chattemp').css('opacity',chattemp/chattemp_max);
		$('#chattemp-bar').css('width','calc('+cttpperc+'% - 4px)');
		$('#chattemp-bar').css('left','calc('+(100-cttpperc)/2+'% + 2px)');
		$('#chattemp-bar').css('opacity',chattemp/chattemp_max);
	}
}

$(document).ready(function() {
	$("#chatinput").keyup(function(event) {
		if (event.keyCode === 13) {
			$("#chatsend").click();
		}
	});

	$("#chatsend").click(function() {
		if (($("#chatinput").val().length > 0)&&($("#chatinput").val().length <= 250)) {
			if (chattemp <= chattemp_max) {
				socket.emit('chatsend', $("#chatinput").val());
				$("#chatinput").val('');
				chattemp += 16;
			}
		}
	});

	$(window).focus(function() {
        focused = true;
    });

    $(window).blur(function() {
        focused = false;
        $('.chatblock').remove();
    });

	interval = setInterval(function(){update()}, 100);
});