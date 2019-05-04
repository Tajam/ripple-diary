$(document).ready(function() {
	var vue;

	var socketio = io.connect('https://' + document.domain);
	//var socketio = io.connect('http://' + document.domain + ':20000');

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

	function messageParser(element, message) {
		let size = 48;
		for (let i = 0; i < message.length; i++) {
			let item = message[i];
			if (item.type == 'emoji') {
				element.append(item.data);
				if (size > 12) {
					size -= 2;
				}
			} else {
				element.append(document.createTextNode(item.data));
				if (size > 12) {
					size -= item.data.length / 2;
				}
			}
		}
		element.css('font-size', size + 'px');
		return element;
	}

	function copyToClipboard(text) {
		var dummy = document.createElement("textarea");
		document.body.appendChild(dummy);
		dummy.value = text;
		dummy.select();
		document.execCommand("copy");
		document.body.removeChild(dummy);
	}

	function regenMana() {
		if (vue.userdata.manapoint.regen) {
			return;
		}
		vue.userdata.manapoint.regen = true;
		(async () => {
			while(vue.userdata.manapoint.regen) {
				vue.userdata.manapoint.current++;
				if (vue.userdata.manapoint.current > vue.userdata.manapoint.max) {
					vue.userdata.manapoint.current = vue.userdata.manapoint.max;
					vue.userdata.manapoint.regen = false;
				}
				vue.userdata.manapoint.percentage = (vue.userdata.manapoint.current / vue.userdata.manapoint.max) * 100;
				await new Promise((resolve, reject) => setTimeout(resolve, 100));
			}
		})();
	}

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

	socketio.on('leaveroom', function(data) {
		vue.mechanics.loading = false;
		if (data == vue.userdata.roomid) {
			//Update shows
			vue.mechanics.show.title = true;
			vue.mechanics.show.input = true;
			vue.mechanics.show.create = true;
			vue.mechanics.show.room = false;

			//Update display
			vue.displays.placeholder = 'Enter message';
			vue.userdata.roomid = data;

			effect({left: '50%', top: '50%'}, 'ripple');
		} else {
			//Prompt user
			alert("Something went wrong!");
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

		let element = messageParser($('<div></div>'), message.text)
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
		vue.userdata.usercount = 1;

	});

	socketio.on('onlineupdate', function(data) {
		vue.userdata.usercount = data;

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
				isHost: false,
				usercount: 0,
				images: [],
				manapoint: {
					max: 100,
					current: 100,
					cost: 20,
					time: 5000,
					percentage: 100,
					regen: false
				}
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
					if (this.userdata.manapoint.current < this.userdata.manapoint.cost) {
						return;
					}
					this.userdata.manapoint.current -= this.userdata.manapoint.cost;
					this.userdata.manapoint.percentage = (this.userdata.manapoint.current / this.userdata.manapoint.max) * 100;
					this.mechanics.loading = true;
					this.socket.emit('chatsend', s);
					this.mechanics.input = '';

					regenMana();
				}
			},
			leave: function() {
				this.mechanics.loading = true;
				this.socket.emit('leaveroom');
			},
			copyRoomID: function() {
				copyToClipboard(this.userdata.roomid);
			} 
		}
	})
});

