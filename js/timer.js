
var timer = {};

timer.controller = function(duration, completeCallback) {
	this.duration = duration;
	this.seconds = m.prop(this.duration);
	this.startTime = null
	this.completeCallback = completeCallback;
	this.stopped = m.prop(true);

	this.reset = function() {
		this.seconds(this.duration);
		this.startTime = (new Date());
		this.clearInterval();
	};

	this.start = function() {
		this.reset();
		this.stopped(false);
		this.timer = window.setInterval(this.update, 100);
	}.bind(this);

	this.update = function() {
		var now = new Date(), duration = now - this.startTime, seconds = Math.ceil(this.duration - (duration / 1000));
		this.seconds(seconds);
		if (seconds <= 0) {
			this.finished();
		}
		m.redraw();
	}.bind(this);

	this.finished = function() {
		this.stop();
		if (this.completeCallback) { this.completeCallback(); }
	};

	this.stop = function() {
		this.seconds(0);
		this.stopped(true);
		this.clearInterval();
	};

	this.clearInterval = function() {
		if (this.timer) {
			window.clearInterval(this.timer);
			this.timer = null;
		}
	};
};

timer.view = function(ctrl) {
	var view = [], stopped = ctrl.stopped();

		view.push(m('div', ctrl.seconds()));
	if (!stopped) {
	}
	return view;
};

module.exports = timer;