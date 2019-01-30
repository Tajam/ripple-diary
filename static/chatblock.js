class Chatblock {
	constructor(x,y,msg) {
		this.x = x;
		this.y = y;
		this.msg = msg;
		this.life = 30;
	}

	draw(targetID,id) {
		this.bid = 'chatblock-' + id
		this.block = $("<div id='"+this.bid+"'></div>");
		this.block.html(this.msg);
		this.block.addClass('chatblock chatblock-opaque');
		let fsize = 80 - this.msg.length*2;
		if (fsize < 20) {
			fsize = 20;
		}
		this.block.css('font-size',fsize+'px');
		this.block.css('left',this.x);
		this.block.css('top',this.y);
		$('#'+targetID).append(this.block);
		//Effect
		let ripple = $("<div id='"+this.bid+"-ripple'></div>");
		ripple.addClass('ripple');
		ripple.css('left',this.x);
		ripple.css('top',this.y);
		$('#'+targetID).append(ripple);
	}

	update() {
		this.life -= 1;
		if (this.life <= 20) {
			$("#"+this.bid+"-ripple").remove();
		}
		if (this.life <= 10) {
			this.block.addClass('chatblock-transparent');
		}
		if (this.life <= 0) {
			$("#"+this.bid).remove();
			return true;
		}
		return false;
	}
}