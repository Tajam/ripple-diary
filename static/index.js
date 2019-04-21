$(document).ready(function() {

	vue = new Vue({
		delimiters:['{$', '$}'],
		el: '#vue',
		data: {
			title: 'Ripple\'s Diary',
			subtitle: 'Your message ripples and fades.',
			page: 0,
			loading: false,
			placeholder: 'Your nickname',
			input_model: '',
			nickname: ''
		},
		methods: {
			submit: function() {
				if (this.page === 0) {
					this.setname_loading = true;
					this.nickname = this.input_model;
					socket.emit('setname', this.input_model);
					this.input_model = '';
				}
				
			}
		}
	})

});

