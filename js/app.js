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
	this.answers = m.prop(0);
	this.position = 0;
	this.complete = m.prop(false);

	this.add = function(question) {
		if (question) {
			this.questionData.push(new guru.Question(question));
		}
	};

	this.start = function() {
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

  this.nextQuestion = function() {
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
  	this.question(msg);
  	this.timer.stop();
  	this.complete(true);
  };

  this.timer = new timer.controller(60, this.timeUp);

  // load questions
  for (var i = 0, qq = window.Data.questions, ii = qq.length; i < ii; i++) {
  	this.add(qq[i]);
  }
};

guru.view = function(ctrl) {
  var active = !!ctrl.question(), appClass = active ? ["active"] : ["inactive"], answered = Strings.you_answered.split("{n}")
  if (ctrl.complete()) {
  	appClass.push('complete');
  }
  return m('div#guru', {class: appClass.join(" ")}, [
  	m('h1', "Guru"),
  	m('#timer', new timer.view(ctrl.timer)),
  	m('#intro', Strings.introduction),
  	m('button#start', {onclick: ctrl.start}, Strings.start),
  	m('button#restart', {onclick: ctrl.start}, Strings.try_again),
  	m('div#question', ctrl.question()),
  	m('div#results', [
      	answered[0],
      	m('span', ctrl.answers()),
      	answered[1]
    ]),
  	m('button#next', {onclick: ctrl.nextQuestion}, [
  		"Next question (",
  			(ctrl.questions().length - ctrl.answers()),
  			" left)"
    ])
	]);
};

m.module(document.getElementById('guru'), guru);
