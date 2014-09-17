var m = require('mithril');
var timer = require('./timer');
var Strings = window.Data.strings;
var guru = {};

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
	this.questionData = new guru.Questions();
	this.started = false;
	this.questions = m.prop([]);
	this.question = m.prop("");
  this.finishedMessage = m.prop("");
	this.answers = m.prop(0);
	this.position = 0;
	this.complete = m.prop(false);

	this.add = function(question) {
		if (question) {
			this.questionData.push(new guru.Question(question));
		}
	};

  function stopEvent(event) {
    event.stopPropagation();
    event.preventDefault();
  }
	this.start = function(event) {
    stopEvent(event);
  	// randomise questions
  	this.answers(0);
  	this.questions(this.questionData.shuffle());
  	this.position = 0;
  	this.complete(false);
  	this.timer.start();
  	this.showQuestion();
  }.bind(this);

  this.showQuestion = function() {
    this.answers(this.answers() + 1);
  	var q = this.questions()[this.position];
  	this.question(q.q());
  }.bind(this);

  this.nextQuestion = function(event) {
    stopEvent(event);
    this.previousQuestion = this.question();
  	this.position += 1;
  	if (this.position === this.questions().length) {
  		this.end(Strings.all_done)
  	} else {
  		this.showQuestion();
  	}
  }.bind(this);

  this.timeUp = function() {
  	this.end(Strings.times_up);
  }.bind(this);

  this.end = function(msg) {
  	this.finishedMessage(msg);
  	this.timer.stop();
  	this.complete(true);
  };

  this.stateClass = function() {
    if (this.complete()) { return ['complete']; }
    var active = !!this.question(), stateClasses = active ? ['active'] : ['inactive'];
    stateClasses.push('clock-'+this.questionClock());
    return stateClasses.join(' ')
  };

  this.questionClock = function() {
    var pos;
    if (arguments.length == 0) {
      pos = this.position;
    } else {
      pos = arguments[0];
    }
    return ((pos % 3));
  };

  this.questionForSlot = function(slotId) {
    var clock = this.questionClock(), prev = this.questionClock(this.position - 1)
    if (slotId === clock) {
      return this.question();
    }
    if (slotId === prev) {
      return this.previousQuestion;
    }

    return '';
  }

  this.timer = new timer.controller(60, this.timeUp);

  // load questions
  for (var i = 0, qq = window.Data.questions, ii = qq.length; i < ii; i++) {
  	this.add(qq[i]);
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
    ])
	]);
};

m.module(document.getElementById('guru'), guru);
