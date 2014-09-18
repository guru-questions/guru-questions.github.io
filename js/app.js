var m = require('mithril');
var timer = require('./timer');
var Data = window.Data;
var Strings = Data.strings;
var guru = {};
var Cache = window.applicationCache;

guru.Question = function(q) {
	this.q = m.prop(q);
};

guru.Questions = Array;

guru.Questions.prototype.shuffle = function() {
	var i = this.length, j, temp;
	if (i == 0) { return this; }
	while (--i) {
		j = Math.floor(Math.random() * (i + 1));
		temp = this[i];
		this[i] = this[j];
		this[j] = temp;
	}
	return this;
};

guru.controller = function() {
  var ctrl = this;
	ctrl.questionData = new guru.Questions();
	ctrl.started = false;
	ctrl.questions = m.prop([]);
	ctrl.question = m.prop("");
  ctrl.finishedMessage = m.prop("");
	ctrl.answers = m.prop(0);
	ctrl.position = 0;
	ctrl.complete = m.prop(false);
  ctrl.updateAvailable = m.prop(false);

	ctrl.add = function(question) {
		if (question) {
			ctrl.questionData.push(new guru.Question(question));
		}
	};

  function stopEvent(event) {
    event.stopPropagation();
    event.preventDefault();
  }
	ctrl.start = function(event) {
    stopEvent(event);
  	// randomise questions
  	this.answers(0);
  	this.questions(this.questionData.shuffle());
  	this.position = 0;
  	this.complete(false);
  	this.timer.start();
  	this.showQuestion();
  }.bind(ctrl);

  ctrl.showQuestion = function() {
    this.answers(this.answers() + 1);
  	var q = this.questions()[this.position];
  	this.question(q.q());
  }.bind(ctrl);

  ctrl.nextQuestion = function(event) {
    stopEvent(event);
    this.previousQuestion = this.question();
  	this.position += 1;
  	if (this.position === this.questions().length) {
  		this.end(Strings.all_done)
  	} else {
  		this.showQuestion();
  	}
  }.bind(ctrl);

  ctrl.timeUp = function() {
  	this.end(Strings.times_up);
  }.bind(ctrl);

  ctrl.end = function(msg) {
  	ctrl.finishedMessage(msg);
  	ctrl.timer.stop();
  	ctrl.complete(true);
  };

  ctrl.stateClass = function() {
    if (ctrl.complete()) { return ['complete']; }
    var active = !!ctrl.question(), stateClasses = active ? ['active'] : ['inactive'];
    stateClasses.push('clock-'+ctrl.questionClock());
    return stateClasses.join(' ')
  };

  ctrl.questionClock = function() {
    var pos;
    if (arguments.length == 0) {
      pos = ctrl.position;
    } else {
      pos = arguments[0];
    }
    return ((pos % 3));
  };

  ctrl.questionForSlot = function(slotId) {
    var clock = ctrl.questionClock(), prev = ctrl.questionClock(ctrl.position - 1)
    if (slotId === clock) {
      return ctrl.question();
    }
    if (slotId === prev) {
      return ctrl.previousQuestion;
    }

    return '';
  }

  ctrl.timer = new timer.controller(60, ctrl.timeUp);

  ctrl.reload = function(event) {
    stopEvent(event);
    window.location.reload();
  };

  // register to recieve notifications when the app cache is ready for an update

  function onUpdateReady() {
    ctrl.updateAvailable(true);
    m.redraw();
  }

  Cache.addEventListener('updateready', onUpdateReady);

  if(Cache.status === Cache.UPDATEREADY) {
    onUpdateReady();
  }

  // load questions
  for (var i = 0, qq = Data.questions, ii = qq.length; i < ii; i++) {
  	ctrl.add(qq[i]);
  }
};


guru.view = function(ctrl) {
  var appClass = ctrl.stateClass(), answered = Strings.you_answered.split("{n}");
  return m('div', {class: appClass}, [
  	m('h1#logo', [
      m('img', {src: '/img/guru-logo-neg.png', alt: 'BAFTA Guru'})
    ]),
  	m('#timer', new timer.view(ctrl.timer)),
  	m('#intro', Strings.introduction),
  	m('button#start', {ontouchend: ctrl.start, onclick: ctrl.start}, Strings.start),
  	m('button#restart', {ontouchend: ctrl.start, onclick: ctrl.start}, Strings.try_again),
  	m('div#question0.question', [
      m('span', ctrl.questionForSlot(0))
    ]),
    m('div#question1.question', [
      m('span', ctrl.questionForSlot(1))
    ]),
    m('div#question2.question', [
      m('span', ctrl.questionForSlot(2))
    ]),
    m('div#finished', ctrl.finishedMessage()),
  	m('div#results', [
      	answered[0],
      	m('span', ctrl.answers()),
      	answered[1]
    ]),
  	m('button#next', {onclick: ctrl.nextQuestion, ontouchstart: ctrl.nextQuestion}, [
  		"Next question"
    ]),
    m('button#update', {onclick: ctrl.reload, ontouchstart: ctrl.reload, style: {display: (ctrl.updateAvailable() ? '' : 'none')}}, "Update available")
  ]);
};

m.module(document.getElementById('guru'), guru);

window.guru = guru;