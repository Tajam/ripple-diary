$(document).ready(function() {

	function effect(position, effect, target = 'body', timeout = 1050) {
		let element = $('<div></div>')
			.addClass(effect)
			.css('left', position.left)
			.css('top', position.top)
			.appendTo(target);

		(async () => {
			await new Promise((resolve, reject) => setTimeout(resolve, timeout));
			element.remove();
		})();
	}

	var vue;

	//var socket = io.connect('https://' + document.domain);
	var socketio = io.connect('http://' + document.domain + ':20000');

	socketio.on('connect', function() {
    	socketio.emit('connected');
	});

	socketio.on('disconnect', function() {
		console.error('Server disconnected!');
   		location.reload();
	});

	socketio.on('setname', function(data) {
		vue.userdata.nickname = data;

		//Update shows
		vue.mechanics.show.create = true;
		vue.mechanics.loading = false;

		//Update display
		vue.displays.title = 'Hello, ' + vue.userdata.nickname
		vue.displays.subtitle = 'Enter room ID to join a room.';
		vue.displays.placeholder = 'Room ID';

		effect({left: '50%', top: '50%'}, 'ripple');
	});

	socketio.on('joinroom', function(data) {
		vue.mechanics.loading = false;
		if (data) {
			$("#createRoomModal").modal('hide');

			//Update shows
			vue.mechanics.show.title = false;
			vue.mechanics.show.input = false;
			vue.mechanics.show.create = false;
			vue.mechanics.show.room = true;

			//Update display
			vue.displays.placeholder = 'Enter message';
			vue.userdata.roomid = data;

			effect({left: '50%', top: '50%'}, 'ripple');
		} else {
			//Prompt user
			effect({left: '50%', top: '50%'}, 'slash', '#subtitle', 300);
			vue.displays.subtitle = 'Room not found! Please try another ID.';
		}
	});

	socketio.on('chatreceive', function(data) {
		data = JSON.parse(data);
		//Parse message
		vue.mechanics.loading = false;
		let message = {
			text: data.message,
			left: $(window).width() * (data.x / 100),
			top: $(window).height() * (data.y / 100),
			key: data.hash
		};

		let element = $('<div>' + message.text + '</div>')
			.addClass('chat')
			.css('left', message.left + 'px')
			.css('top', message.top + 'px')
			.appendTo('body');

		effect ({
			left: message.left + 'px', 
			top: message.top + 'px',
		}, 'ripple');
		
		(async () => {
			await new Promise((resolve, reject) => setTimeout(resolve, 5000));
			element.remove();
		})();
	});

	socketio.on('createroom', function(data) {
		$("#createRoomModal").modal('hide');

		//Update shows
		vue.mechanics.show.title = false;
		vue.mechanics.show.input = false;
		vue.mechanics.show.create = false;
		vue.mechanics.loading = false;
		vue.mechanics.show.room = true;

		//Update display
		vue.displays.placeholder = 'Enter message';
		vue.userdata.roomid = data;

	});

	vue = new Vue({
		delimiters:['{$', '$}'],
		el: '#vue',
		data: {
			displays: {
				title: 'Ripple\'s Diary',
				subtitle: 'Your message ripples and fades.',
				placeholder: 'Your nickname'
			},
			mechanics: {
				show: {
					title: true,
					input: true,
					create: false,
					room: false
				},
				loading: false,
				input: ''
			},
			userdata: {
				nickname: '',
				roomid: '',
				images: []
			},
			socket: socketio
		},
		methods: {
			submit: function() {
				let s = this.mechanics.input;
				if (s.length !== 0 || s.trim()) {
					this.mechanics.loading = true;
					let n = this.userdata.nickname;
					if (n.length === 0 || !n.trim()) {
						this.socket.emit('setname', s);
					} else {
						this.socket.emit('joinroom', s);
					}
				}
				this.mechanics.input = '';
			},
			create:function() {
				this.mechanics.loading = true;
				this.socket.emit('createroom');
			},
			send: function() {
				let s = this.mechanics.input;
				if (s.length !== 0 || s.trim()) {
					this.mechanics.loading = true;
					this.socket.emit('chatsend', s);
					this.mechanics.input = '';
				}
			}
		}
	})
});

