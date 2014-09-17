(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"./timer":2,"mithril":3}],2:[function(require,module,exports){

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
		if (seconds === 0) {
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
},{}],3:[function(require,module,exports){
Mithril = m = new function app(window, undefined) {
	var type = {}.toString
	var parser = /(?:(^|#|\.)([^#\.\[\]]+))|(\[.+?\])/g, attrParser = /\[(.+?)(?:=("|'|)(.*?)\2)?\]/
	var voidElements = /AREA|BASE|BR|COL|COMMAND|EMBED|HR|IMG|INPUT|KEYGEN|LINK|META|PARAM|SOURCE|TR‌​ACK|WBR/

	function m() {
		var args = arguments
		var hasAttrs = args[1] != null && type.call(args[1]) == "[object Object]" && !("tag" in args[1]) && !("subtree" in args[1])
		var attrs = hasAttrs ? args[1] : {}
		var classAttrName = "class" in attrs ? "class" : "className"
		var cell = {tag: "div", attrs: {}}
		var match, classes = []
		while (match = parser.exec(args[0])) {
			if (match[1] == "") cell.tag = match[2]
			else if (match[1] == "#") cell.attrs.id = match[2]
			else if (match[1] == ".") classes.push(match[2])
			else if (match[3][0] == "[") {
				var pair = attrParser.exec(match[3])
				cell.attrs[pair[1]] = pair[3] || (pair[2] ? "" :true)
			}
		}
		if (classes.length > 0) cell.attrs[classAttrName] = classes.join(" ")

		cell.children = hasAttrs ? args[2] : args[1]

		for (var attrName in attrs) {
			if (attrName == classAttrName) cell.attrs[attrName] = (cell.attrs[attrName] || "") + " " + attrs[attrName]
			else cell.attrs[attrName] = attrs[attrName]
		}
		return cell
	}
	function build(parentElement, parentTag, parentCache, parentIndex, data, cached, shouldReattach, index, editable, namespace, configs) {
		//`build` is a recursive function that manages creation/diffing/removal of DOM elements based on comparison between `data` and `cached`
		//the diff algorithm can be summarized as this:
		//1 - compare `data` and `cached`
		//2 - if they are different, copy `data` to `cached` and update the DOM based on what the difference is
		//3 - recursively apply this algorithm for every array and for the children of every virtual element
		
		//the `cached` data structure is essentially the same as the previous redraw's `data` data structure, with a few additions:
		//- `cached` always has a property called `nodes`, which is a list of DOM elements that correspond to the data represented by the respective virtual element
		//- in order to support attaching `nodes` as a property of `cached`, `cached` is *always* a non-primitive object, i.e. if the data was a string, then cached is a String instance. If data was `null` or `undefined`, cached is `new String("")`
		//- `cached also has a `configContext` property, which is the state storage object exposed by config(element, isInitialized, context)
		//- when `cached` is an Object, it represents a virtual element; when it's an Array, it represents a list of elements; when it's a String, Number or Boolean, it represents a text node

		//`parentElement` is a DOM element used for W3C DOM API calls
		//`parentTag` is only used for handling a corner case for textarea values
		//`parentCache` is used to remove nodes in some multi-node cases
		//`parentIndex` and `index` are used to figure out the offset of nodes. They're artifacts from before arrays started being flattened and are likely refactorable
		//`data` and `cached` are, respectively, the new and old nodes being diffed
		//`shouldReattach` is a flag indicating whether a parent node was recreated (if so, and if this node is reused, then this node must reattach itself to the new parent)
		//`editable` is a flag that indicates whether an ancestor is contenteditable
		//`namespace` indicates the closest HTML namespace as it cascades down from an ancestor
		//`configs` is a list of config functions to run after the topmost `build` call finishes running

		//there's logic that relies on the assumption that null and undefined data are equivalent to empty strings
		//- this prevents lifecycle surprises from procedural helpers that mix implicit and explicit return statements
		//- it simplifies diffing code
		if (data == null) data = ""
		if (data.subtree === "retain") return cached

		var cachedType = type.call(cached), dataType = type.call(data)
		if (cached == null || cachedType != dataType) {
			if (cached != null) {
				if (parentCache && parentCache.nodes) {
					var offset = index - parentIndex
					var end = offset + (dataType == "[object Array]" ? data : cached.nodes).length
					clear(parentCache.nodes.slice(offset, end), parentCache.slice(offset, end))
				}
				else if (cached.nodes) clear(cached.nodes, cached)
			}
			cached = new data.constructor
			cached.nodes = []
		}

		if (dataType == "[object Array]") {
			data = flatten(data)
			var nodes = [], intact = cached.length === data.length, subArrayCount = 0

			//keys algorithm: sort elements without recreating them if keys are present
			//1) create a map of all existing keys, and mark all for deletion
			//2) add new keys to map and mark them for addition
			//3) if key exists in new list, change action from deletion to a move
			//4) for each key, handle its corresponding action as marked in previous steps
			//5) copy unkeyed items into their respective gaps
			var DELETION = 1, INSERTION = 2 , MOVE = 3
			var existing = {}, unkeyed = [], shouldMaintainIdentities = false
			for (var i = 0; i < cached.length; i++) {
				if (cached[i] && cached[i].attrs && cached[i].attrs.key != null) {
					shouldMaintainIdentities = true
					existing[cached[i].attrs.key] = {action: DELETION, index: i}
				}
			}
			if (shouldMaintainIdentities) {
				for (var i = 0; i < data.length; i++) {
					if (data[i] && data[i].attrs) {
						if (data[i].attrs.key != null) {
							var key = data[i].attrs.key
							if (!existing[key]) existing[key] = {action: INSERTION, index: i}
							else existing[key] = {action: MOVE, index: i, from: existing[key].index, element: parentElement.childNodes[existing[key].index]}
						}
						else unkeyed.push({index: i, element: parentElement.childNodes[i]})
					}
				}
				var actions = Object.keys(existing).map(function(key) {return existing[key]})
				var changes = actions.sort(function(a, b) {return a.action - b.action || a.index - b.index})
				var newCached = cached.slice()

				for (var i = 0, change; change = changes[i]; i++) {
					if (change.action == DELETION) {
						clear(cached[change.index].nodes, cached[change.index])
						newCached.splice(change.index, 1)
					}
					if (change.action == INSERTION) {
						var dummy = window.document.createElement("div")
						dummy.key = data[change.index].attrs.key
						parentElement.insertBefore(dummy, parentElement.childNodes[change.index])
						newCached.splice(change.index, 0, {attrs: {key: data[change.index].attrs.key}, nodes: [dummy]})
					}

					if (change.action == MOVE) {
						if (parentElement.childNodes[change.index] !== change.element && change.element !== null) {
							parentElement.insertBefore(change.element, parentElement.childNodes[change.index])
						}
						newCached[change.index] = cached[change.from]
					}
				}
				for (var i = 0; i < unkeyed.length; i++) {
					var change = unkeyed[i]
					parentElement.insertBefore(change.element, parentElement.childNodes[change.index])
					newCached[change.index] = cached[change.index]
				}
				cached = newCached
				cached.nodes = []
				for (var i = 0, child; child = parentElement.childNodes[i]; i++) cached.nodes.push(child)
			}
			//end key algorithm

			for (var i = 0, cacheCount = 0; i < data.length; i++) {
				//diff each item in the array
				var item = build(parentElement, parentTag, cached, index, data[i], cached[cacheCount], shouldReattach, index + subArrayCount || subArrayCount, editable, namespace, configs)
				if (item === undefined) continue
				if (!item.nodes.intact) intact = false
				var isArray = type.call(item) == "[object Array]"
				subArrayCount += isArray ? item.length : 1
				cached[cacheCount++] = item
			}
			if (!intact) {
				//diff the array itself
				
				//update the list of DOM nodes by collecting the nodes from each item
				for (var i = 0; i < data.length; i++) {
					if (cached[i] != null) nodes = nodes.concat(cached[i].nodes)
				}
				//remove items from the end of the array if the new array is shorter than the old one
				//if errors ever happen here, the issue is most likely a bug in the construction of the `cached` data structure somewhere earlier in the program
				for (var i = 0, node; node = cached.nodes[i]; i++) {
					if (node.parentNode != null && nodes.indexOf(node) < 0) clear([node], [cached[i]])
				}
				//add items to the end if the new array is longer than the old one
				for (var i = cached.nodes.length, node; node = nodes[i]; i++) {
					if (node.parentNode == null) parentElement.appendChild(node)
				}
				if (data.length < cached.length) cached.length = data.length
				cached.nodes = nodes
			}
		}
		else if (data != null && dataType == "[object Object]") {
			//if an element is different enough from the one in cache, recreate it
			if (data.tag != cached.tag || Object.keys(data.attrs).join() != Object.keys(cached.attrs).join() || data.attrs.id != cached.attrs.id) {
				clear(cached.nodes)
				if (cached.configContext && typeof cached.configContext.onunload == "function") cached.configContext.onunload()
			}
			if (typeof data.tag != "string") return

			var node, isNew = cached.nodes.length === 0
			if (data.attrs.xmlns) namespace = data.attrs.xmlns
			else if (data.tag === "svg") namespace = "http://www.w3.org/2000/svg"
			else if (data.tag === "math") namespace = "http://www.w3.org/1998/Math/MathML"
			if (isNew) {
				node = namespace === undefined ? window.document.createElement(data.tag) : window.document.createElementNS(namespace, data.tag)
				cached = {
					tag: data.tag,
					//process children before attrs so that select.value works correctly
					children: build(node, data.tag, undefined, undefined, data.children, cached.children, true, 0, data.attrs.contenteditable ? node : editable, namespace, configs),
					attrs: setAttributes(node, data.tag, data.attrs, {}, namespace),
					nodes: [node]
				}
				parentElement.insertBefore(node, parentElement.childNodes[index] || null)
			}
			else {
				node = cached.nodes[0]
				setAttributes(node, data.tag, data.attrs, cached.attrs, namespace)
				cached.children = build(node, data.tag, undefined, undefined, data.children, cached.children, false, 0, data.attrs.contenteditable ? node : editable, namespace, configs)
				cached.nodes.intact = true
				if (shouldReattach === true && node != null) parentElement.insertBefore(node, parentElement.childNodes[index] || null)
			}
			//schedule configs to be called. They are called after `build` finishes running
			if (typeof data.attrs["config"] === "function") {
				configs.push(data.attrs["config"].bind(window, node, !isNew, cached.configContext = cached.configContext || {}, cached))
			}
		}
		else if (typeof dataType != "function") {
			//handle text nodes
			var nodes
			if (cached.nodes.length === 0) {
				if (data.$trusted) {
					nodes = injectHTML(parentElement, index, data)
				}
				else {
					nodes = [window.document.createTextNode(data)]
					if (!parentElement.nodeName.match(voidElements)) parentElement.insertBefore(nodes[0], parentElement.childNodes[index] || null)
				}
				cached = "string number boolean".indexOf(typeof data) > -1 ? new data.constructor(data) : data
				cached.nodes = nodes
			}
			else if (cached.valueOf() !== data.valueOf() || shouldReattach === true) {
				nodes = cached.nodes
				if (!editable || editable !== window.document.activeElement) {
					if (data.$trusted) {
						clear(nodes, cached)
						nodes = injectHTML(parentElement, index, data)
					}
					else {
						//corner case: replacing the nodeValue of a text node that is a child of a textarea/contenteditable doesn't work
						//we need to update the value property of the parent textarea or the innerHTML of the contenteditable element instead
						if (parentTag === "textarea") parentElement.value = data
						else if (editable) editable.innerHTML = data
						else {
							if (nodes[0].nodeType == 1 || nodes.length > 1) { //was a trusted string
								clear(cached.nodes, cached)
								nodes = [window.document.createTextNode(data)]
							}
							parentElement.insertBefore(nodes[0], parentElement.childNodes[index] || null)
							nodes[0].nodeValue = data
						}
					}
				}
				cached = new data.constructor(data)
				cached.nodes = nodes
			}
			else cached.nodes.intact = true
		}

		return cached
	}
	function setAttributes(node, tag, dataAttrs, cachedAttrs, namespace) {
		var groups = {}
		for (var attrName in dataAttrs) {
			var dataAttr = dataAttrs[attrName]
			var cachedAttr = cachedAttrs[attrName]
			if (!(attrName in cachedAttrs) || (cachedAttr !== dataAttr) || node === window.document.activeElement) {
				cachedAttrs[attrName] = dataAttr
				if (attrName === "config") continue
				else if (typeof dataAttr == "function" && attrName.indexOf("on") == 0) {
					node[attrName] = autoredraw(dataAttr, node)
				}
				else if (attrName === "style" && typeof dataAttr == "object") {
					for (var rule in dataAttr) {
						if (cachedAttr == null || cachedAttr[rule] !== dataAttr[rule]) node.style[rule] = dataAttr[rule]
					}
					for (var rule in cachedAttr) {
						if (!(rule in dataAttr)) node.style[rule] = ""
					}
				}
				else if (namespace != null) {
					if (attrName === "href") node.setAttributeNS("http://www.w3.org/1999/xlink", "href", dataAttr)
					else if (attrName === "className") node.setAttribute("class", dataAttr)
					else node.setAttribute(attrName, dataAttr)
				}
				else if (attrName === "value" && tag === "input") {
					if (node.value !== dataAttr) node.value = dataAttr
				}
				else if (attrName in node && !(attrName == "list" || attrName == "style")) {
					node[attrName] = dataAttr
				}
				else node.setAttribute(attrName, dataAttr)
			}
		}
		return cachedAttrs
	}
	function clear(nodes, cached) {
		for (var i = nodes.length - 1; i > -1; i--) {
			if (nodes[i] && nodes[i].parentNode) {
				nodes[i].parentNode.removeChild(nodes[i])
				cached = [].concat(cached)
				if (cached[i]) unload(cached[i])
			}
		}
		if (nodes.length != 0) nodes.length = 0
	}
	function unload(cached) {
		if (cached.configContext && typeof cached.configContext.onunload == "function") cached.configContext.onunload()
		if (cached.children) {
			if (type.call(cached.children) == "[object Array]") for (var i = 0; i < cached.children.length; i++) unload(cached.children[i])
			else if (cached.children.tag) unload(cached.children)
		}
	}
	function injectHTML(parentElement, index, data) {
		var nextSibling = parentElement.childNodes[index]
		if (nextSibling) {
			var isElement = nextSibling.nodeType != 1
			var placeholder = window.document.createElement("span")
			if (isElement) {
				parentElement.insertBefore(placeholder, nextSibling)
				placeholder.insertAdjacentHTML("beforebegin", data)
				parentElement.removeChild(placeholder)
			}
			else nextSibling.insertAdjacentHTML("beforebegin", data)
		}
		else parentElement.insertAdjacentHTML("beforeend", data)
		var nodes = []
		while (parentElement.childNodes[index] !== nextSibling) {
			nodes.push(parentElement.childNodes[index])
			index++
		}
		return nodes
	}
	function flatten(data) {
		var flattened = []
		for (var i = 0; i < data.length; i++) {
			var item = data[i]
			if (type.call(item) == "[object Array]") flattened.push.apply(flattened, flatten(item))
			else flattened.push(item)
		}
		return flattened
	}
	function autoredraw(callback, object, group) {
		return function(e) {
			e = e || event
			m.redraw.strategy("diff")
			m.startComputation()
			try {return callback.call(object, e)}
			finally {
				if (!lastRedrawId) lastRedrawId = -1;
				m.endComputation()
			}
		}
	}

	var html
	var documentNode = {
		insertAdjacentHTML: function(_, data) {
			window.document.write(data)
			window.document.close()
		},
		appendChild: function(node) {
			if (html === undefined) html = window.document.createElement("html")
			if (node.nodeName == "HTML") html = node
			else html.appendChild(node)
			if (window.document.documentElement && window.document.documentElement !== html) {
				window.document.replaceChild(html, window.document.documentElement)
			}
			else window.document.appendChild(html)
		},
		insertBefore: function(node) {
			this.appendChild(node)
		},
		childNodes: []
	}
	var nodeCache = [], cellCache = {}
	m.render = function(root, cell, forceRecreation) {
		var configs = []
		if (!root) throw new Error("Please ensure the DOM element exists before rendering a template into it.")
		var id = getCellCacheKey(root)
		var node = root == window.document || root == window.document.documentElement ? documentNode : root
		if (cellCache[id] === undefined) clear(node.childNodes)
		if (forceRecreation === true) reset(root)
		cellCache[id] = build(node, null, undefined, undefined, cell, cellCache[id], false, 0, null, undefined, configs)
		for (var i = 0; i < configs.length; i++) configs[i]()
	}
	function getCellCacheKey(element) {
		var index = nodeCache.indexOf(element)
		return index < 0 ? nodeCache.push(element) - 1 : index
	}

	m.trust = function(value) {
		value = new String(value)
		value.$trusted = true
		return value
	}

	function _prop(store) {
		var prop = function() {
			if (arguments.length) store = arguments[0]
			return store
		}

		prop.toJSON = function() {
			return store
		}

		return prop
	}

	m.prop = function (store) {
		if ((typeof store === 'object' || typeof store === 'function') &&
				typeof store.then === 'function') {
			var prop = _prop()
			newPromisedProp(prop, store).then(prop)

			return prop
		}

		return _prop(store)
	}

	var roots = [], modules = [], controllers = [], lastRedrawId = 0, computePostRedrawHook = null, prevented = false
	m.module = function(root, module) {
		var index = roots.indexOf(root)
		if (index < 0) index = roots.length
		var isPrevented = false
		if (controllers[index] && typeof controllers[index].onunload == "function") {
			var event = {
				preventDefault: function() {isPrevented = true}
			}
			controllers[index].onunload(event)
		}
		if (!isPrevented) {
			m.redraw.strategy("all")
			m.startComputation()
			roots[index] = root
			modules[index] = module
			controllers[index] = new module.controller
			m.endComputation()
		}
	}
	m.redraw = function(force) {
		var cancel = window.cancelAnimationFrame || window.clearTimeout
		var defer = window.requestAnimationFrame || window.setTimeout
		if (lastRedrawId && force !== true) {
			cancel(lastRedrawId)
			lastRedrawId = defer(redraw, 0)
		}
		else {
			redraw()
			lastRedrawId = defer(function() {lastRedrawId = null}, 0)
		}
	}
	m.redraw.strategy = m.prop()
	function redraw() {
		var mode = m.redraw.strategy()
		for (var i = 0; i < roots.length; i++) {
			if (controllers[i] && mode != "none") m.render(roots[i], modules[i].view(controllers[i]), mode == "all")
		}
		if (computePostRedrawHook) {
			computePostRedrawHook()
			computePostRedrawHook = null
		}
		lastRedrawId = null
		m.redraw.strategy("diff")
	}

	var pendingRequests = 0
	m.startComputation = function() {pendingRequests++}
	m.endComputation = function() {
		pendingRequests = Math.max(pendingRequests - 1, 0)
		if (pendingRequests == 0) m.redraw()
	}

	m.withAttr = function(prop, withAttrCallback) {
		return function(e) {
			e = e || event
			var currentTarget = e.currentTarget || this
			withAttrCallback(prop in currentTarget ? currentTarget[prop] : currentTarget.getAttribute(prop))
		}
	}

	//routing
	var modes = {pathname: "", hash: "#", search: "?"}
	var redirect = function() {}, routeParams = {}, currentRoute
	m.route = function() {
		if (arguments.length === 0) return currentRoute
		else if (arguments.length === 3 && typeof arguments[1] == "string") {
			var root = arguments[0], defaultRoute = arguments[1], router = arguments[2]
			redirect = function(source) {
				var path = currentRoute = normalizeRoute(source)
				if (!routeByValue(root, router, path)) {
					m.route(defaultRoute, true)
				}
			}
			var listener = m.route.mode == "hash" ? "onhashchange" : "onpopstate"
			window[listener] = function() {
				if (currentRoute != normalizeRoute(window.location[m.route.mode])) {
					redirect(window.location[m.route.mode])
				}
			}
			computePostRedrawHook = setScroll
			window[listener]()
		}
		else if (arguments[0].addEventListener) {
			var element = arguments[0]
			var isInitialized = arguments[1]
			if (element.href.indexOf(modes[m.route.mode]) < 0) {
				element.href = window.location.pathname + modes[m.route.mode] + element.pathname
			}
			if (!isInitialized) {
				element.removeEventListener("click", routeUnobtrusive)
				element.addEventListener("click", routeUnobtrusive)
			}
		}
		else if (typeof arguments[0] == "string") {
			currentRoute = arguments[0]
			var querystring = typeof arguments[1] == "object" ? buildQueryString(arguments[1]) : null
			if (querystring) currentRoute += (currentRoute.indexOf("?") === -1 ? "?" : "&") + querystring

			var shouldReplaceHistoryEntry = (arguments.length == 3 ? arguments[2] : arguments[1]) === true

			if (window.history.pushState) {
				computePostRedrawHook = function() {
					window.history[shouldReplaceHistoryEntry ? "replaceState" : "pushState"](null, window.document.title, modes[m.route.mode] + currentRoute)
					setScroll()
				}
				redirect(modes[m.route.mode] + currentRoute)
			}
			else window.location[m.route.mode] = currentRoute
		}
	}
	m.route.param = function(key) {return routeParams[key]}
	m.route.mode = "search"
	function normalizeRoute(route) {return route.slice(modes[m.route.mode].length)}
	function routeByValue(root, router, path) {
		routeParams = {}

		var queryStart = path.indexOf("?")
		if (queryStart !== -1) {
			routeParams = parseQueryString(path.substr(queryStart + 1, path.length))
			path = path.substr(0, queryStart)
		}

		for (var route in router) {
			if (route == path) {
				m.module(root, router[route])
				return true
			}

			var matcher = new RegExp("^" + route.replace(/:[^\/]+?\.{3}/g, "(.*?)").replace(/:[^\/]+/g, "([^\\/]+)") + "\/?$")

			if (matcher.test(path)) {
				path.replace(matcher, function() {
					var keys = route.match(/:[^\/]+/g) || []
					var values = [].slice.call(arguments, 1, -2)
					for (var i = 0; i < keys.length; i++) routeParams[keys[i].replace(/:|\./g, "")] = decodeURIComponent(values[i])
					m.module(root, router[route])
				})
				return true
			}
		}
	}
	function routeUnobtrusive(e) {
		e = e || event
		if (e.ctrlKey || e.metaKey || e.which == 2) return
		e.preventDefault()
		m.route(e.currentTarget[m.route.mode].slice(modes[m.route.mode].length))
	}
	function setScroll() {
		if (m.route.mode != "hash" && window.location.hash) window.location.hash = window.location.hash
		else window.scrollTo(0, 0)
	}
	function buildQueryString(object, prefix) {
		var str = []
		for(var prop in object) {
			var key = prefix ? prefix + "[" + prop + "]" : prop, value = object[prop]
			str.push(typeof value == "object" ? buildQueryString(value, key) : encodeURIComponent(key) + "=" + encodeURIComponent(value))
		}
		return str.join("&")
	}
	function parseQueryString(str) {
		var pairs = str.split("&"), params = {}
		for (var i = 0; i < pairs.length; i++) {
			var pair = pairs[i].split("=")
			params[decodeSpace(pair[0])] = pair[1] ? decodeSpace(pair[1]) : (pair.length === 1 ? true : "")
		}
		return params
	}
	function decodeSpace(string) {
		return decodeURIComponent(string.replace(/\+/g, " "))
	}
	function reset(root) {
		var cacheKey = getCellCacheKey(root)
		clear(root.childNodes, cellCache[cacheKey])
		cellCache[cacheKey] = undefined
	}

	function newPromisedProp(prop, promise) {
		prop.then = function () {
			var newProp = m.prop()
			return newPromisedProp(newProp,
				promise.then.apply(promise, arguments).then(newProp))
		}
		prop.promise = prop
		prop.resolve = function (val) {
			prop(val)
			promise = promise.resolve.apply(promise, arguments)
			return prop
		}
		prop.reject = function () {
			promise = promise.reject.apply(promise, arguments)
			return prop
		}

		return prop
	}
	m.deferred = function () {
		return newPromisedProp(m.prop(), new Deferred())
	}
	// Promiz.mithril.js | Zolmeister | MIT
	function Deferred(fn, er) {
		// states
		// 0: pending
		// 1: resolving
		// 2: rejecting
		// 3: resolved
		// 4: rejected
		var self = this,
			state = 0,
			val = 0,
			next = [];

		self['promise'] = self

		self['resolve'] = function (v) {
			if (!state) {
				val = v
				state = 1

				fire()
			}
			return this
		}

		self['reject'] = function (v) {
			if (!state) {
				val = v
				state = 2

				fire()
			}
			return this
		}

		self['then'] = function (fn, er) {
			var d = new Deferred(fn, er)
			if (state == 3) {
				d.resolve(val)
			}
			else if (state == 4) {
				d.reject(val)
			}
			else {
				next.push(d)
			}
			return d
		}

		var finish = function (type) {
			state = type || 4
			next.map(function (p) {
				state == 3 && p.resolve(val) || p.reject(val)
			})
		}

		// ref : reference to 'then' function
		// cb, ec, cn : successCallback, failureCallback, notThennableCallback
		function thennable (ref, cb, ec, cn) {
			if ((typeof val == 'object' || typeof val == 'function') && typeof ref == 'function') {
				try {

					// cnt protects against abuse calls from spec checker
					var cnt = 0
					ref.call(val, function (v) {
						if (cnt++) return
						val = v
						cb()
					}, function (v) {
						if (cnt++) return
						val = v
						ec()
					})
				} catch (e) {
					val = e
					ec()
				}
			} else {
				cn()
			}
		};

		function fire() {

			// check if it's a thenable
			var ref;
			try {
				ref = val && val.then
			} catch (e) {
				val = e
				state = 2
				return fire()
			}
			thennable(ref, function () {
				state = 1
				fire()
			}, function () {
				state = 2
				fire()
			}, function () {
				try {
					if (state == 1 && typeof fn == 'function') {
						val = fn(val)
					}

					else if (state == 2 && typeof er == 'function') {
						val = er(val)
						state = 1
					}
				} catch (e) {
					val = e
					return finish()
				}

				if (val == self) {
					val = TypeError()
					finish()
				} else thennable(ref, function () {
						finish(3)
					}, finish, function () {
						finish(state == 1 && 3)
					})

			})
		}
	}

	m.sync = function(args) {
		var method = "resolve"
		function synchronizer(pos, resolved) {
			return function(value) {
				results[pos] = value
				if (!resolved) method = "reject"
				if (--outstanding == 0) {
					deferred.promise(results)
					deferred[method](results)
				}
				return value
			}
		}

		var deferred = m.deferred()
		var outstanding = args.length
		var results = new Array(outstanding)
		if (args.length > 0) {
			for (var i = 0; i < args.length; i++) {
				args[i].then(synchronizer(i, true), synchronizer(i, false))
			}
		}
		else deferred.resolve()

		return deferred.promise
	}
	function identity(value) {return value}

	function ajax(options) {
		var xhr = new window.XMLHttpRequest
		xhr.open(options.method, options.url, true, options.user, options.password)
		xhr.onreadystatechange = function() {
			if (xhr.readyState === 4) {
				if (xhr.status >= 200 && xhr.status < 300) options.onload({type: "load", target: xhr})
				else options.onerror({type: "error", target: xhr})
			}
		}
		if (options.serialize == JSON.stringify && options.method != "GET") {
			xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
		}
		if (typeof options.config == "function") {
			var maybeXhr = options.config(xhr, options)
			if (maybeXhr != null) xhr = maybeXhr
		}
		xhr.send(options.method == "GET" ? "" : options.data)
		return xhr
	}
	function bindData(xhrOptions, data, serialize) {
		if (data && Object.keys(data).length > 0) {
			if (xhrOptions.method == "GET") {
				xhrOptions.url = xhrOptions.url + (xhrOptions.url.indexOf("?") < 0 ? "?" : "&") + buildQueryString(data)
			}
			else xhrOptions.data = serialize(data)
		}
		return xhrOptions
	}
	function parameterizeUrl(url, data) {
		var tokens = url.match(/:[a-z]\w+/gi)
		if (tokens && data) {
			for (var i = 0; i < tokens.length; i++) {
				var key = tokens[i].slice(1)
				url = url.replace(tokens[i], data[key])
				delete data[key]
			}
		}
		return url
	}

	m.request = function(xhrOptions) {
		if (xhrOptions.background !== true) m.startComputation()
		var deferred = m.deferred()
		var serialize = xhrOptions.serialize = xhrOptions.serialize || JSON.stringify
		var deserialize = xhrOptions.deserialize = xhrOptions.deserialize || JSON.parse
		var extract = xhrOptions.extract || function(xhr) {
			return xhr.responseText.length === 0 && deserialize === JSON.parse ? null : xhr.responseText
		}
		xhrOptions.url = parameterizeUrl(xhrOptions.url, xhrOptions.data)
		xhrOptions = bindData(xhrOptions, xhrOptions.data, serialize)
		xhrOptions.onload = xhrOptions.onerror = function(e) {
			try {
				e = e || event
				var unwrap = (e.type == "load" ? xhrOptions.unwrapSuccess : xhrOptions.unwrapError) || identity
				var response = unwrap(deserialize(extract(e.target, xhrOptions)))
				if (e.type == "load") {
					if (type.call(response) == "[object Array]" && xhrOptions.type) {
						for (var i = 0; i < response.length; i++) response[i] = new xhrOptions.type(response[i])
					}
					else if (xhrOptions.type) response = new xhrOptions.type(response)
				}
				deferred[e.type == "load" ? "resolve" : "reject"](response)
			}
			catch (e) {
				if (e instanceof SyntaxError) throw new SyntaxError("Could not parse HTTP response. See http://lhorie.github.io/mithril/mithril.request.html#using-variable-data-formats")
				else if (type.call(e) == "[object Error]" && e.constructor !== Error) throw e
				else deferred.reject(e)
			}
			if (xhrOptions.background !== true) m.endComputation()
		}
		ajax(xhrOptions)
		return deferred.promise
	}

	//testing API
	m.deps = function(mock) {return window = mock}
	//for internal testing only, do not use `m.deps.factory`
	m.deps.factory = app

	return m
}(typeof window != "undefined" ? window : {})

if (typeof module != "undefined" && module !== null) module.exports = m
if (typeof define == "function" && define.amd) define(function() {return m})

;;;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9nYXJyeS9Qcm9qZWN0cy9CQUZUQS9ndXJ1L2pla3lsbC9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy9nYXJyeS9Qcm9qZWN0cy9CQUZUQS9ndXJ1L2pla3lsbC9qcy9hcHAuanMiLCIvVXNlcnMvZ2FycnkvUHJvamVjdHMvQkFGVEEvZ3VydS9qZWt5bGwvanMvdGltZXIuanMiLCIvVXNlcnMvZ2FycnkvUHJvamVjdHMvQkFGVEEvZ3VydS9qZWt5bGwvbm9kZV9tb2R1bGVzL21pdGhyaWwvbWl0aHJpbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpO1xudmFyIHRpbWVyID0gcmVxdWlyZSgnLi90aW1lcicpO1xudmFyIFN0cmluZ3MgPSB3aW5kb3cuRGF0YS5zdHJpbmdzO1xudmFyIGd1cnUgPSB7fTtcblxuZ3VydS5RdWVzdGlvbiA9IGZ1bmN0aW9uKHEpIHtcblx0dGhpcy5xID0gbS5wcm9wKHEpO1xufTtcblxuZ3VydS5RdWVzdGlvbnMgPSBBcnJheTtcblxuZ3VydS5RdWVzdGlvbnMucHJvdG90eXBlLnNodWZmbGUgPSBmdW5jdGlvbigpIHtcblx0dmFyIGkgPSB0aGlzLmxlbmd0aCwgaiwgdGVtcDtcblx0aWYgKGkgPT0gMCkgeyByZXR1cm4gdGhpczsgfVxuXHR3aGlsZSAoLS1pKSB7XG5cdFx0aiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChpICsgMSkpO1xuXHRcdHRlbXAgPSB0aGlzW2ldO1xuXHRcdHRoaXNbaV0gPSB0aGlzW2pdO1xuXHRcdHRoaXNbal0gPSB0ZW1wO1xuXHR9XG5cdHJldHVybiB0aGlzO1xufTtcblxuZ3VydS5jb250cm9sbGVyID0gZnVuY3Rpb24oKSB7XG5cdHRoaXMucXVlc3Rpb25EYXRhID0gbmV3IGd1cnUuUXVlc3Rpb25zKCk7XG5cdHRoaXMuc3RhcnRlZCA9IGZhbHNlO1xuXHR0aGlzLnF1ZXN0aW9ucyA9IG0ucHJvcChbXSk7XG5cdHRoaXMucXVlc3Rpb24gPSBtLnByb3AoXCJcIik7XG4gIHRoaXMuZmluaXNoZWRNZXNzYWdlID0gbS5wcm9wKFwiXCIpO1xuXHR0aGlzLmFuc3dlcnMgPSBtLnByb3AoMCk7XG5cdHRoaXMucG9zaXRpb24gPSAwO1xuXHR0aGlzLmNvbXBsZXRlID0gbS5wcm9wKGZhbHNlKTtcblxuXHR0aGlzLmFkZCA9IGZ1bmN0aW9uKHF1ZXN0aW9uKSB7XG5cdFx0aWYgKHF1ZXN0aW9uKSB7XG5cdFx0XHR0aGlzLnF1ZXN0aW9uRGF0YS5wdXNoKG5ldyBndXJ1LlF1ZXN0aW9uKHF1ZXN0aW9uKSk7XG5cdFx0fVxuXHR9O1xuXG4gIGZ1bmN0aW9uIHN0b3BFdmVudChldmVudCkge1xuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gIH1cblx0dGhpcy5zdGFydCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgc3RvcEV2ZW50KGV2ZW50KTtcbiAgXHQvLyByYW5kb21pc2UgcXVlc3Rpb25zXG4gIFx0dGhpcy5hbnN3ZXJzKDApO1xuICBcdHRoaXMucXVlc3Rpb25zKHRoaXMucXVlc3Rpb25EYXRhLnNodWZmbGUoKSk7XG4gIFx0dGhpcy5wb3NpdGlvbiA9IDA7XG4gIFx0dGhpcy5jb21wbGV0ZShmYWxzZSk7XG4gIFx0dGhpcy50aW1lci5zdGFydCgpO1xuICBcdHRoaXMuc2hvd1F1ZXN0aW9uKCk7XG4gIH0uYmluZCh0aGlzKTtcblxuICB0aGlzLnNob3dRdWVzdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuYW5zd2Vycyh0aGlzLmFuc3dlcnMoKSArIDEpO1xuICBcdHZhciBxID0gdGhpcy5xdWVzdGlvbnMoKVt0aGlzLnBvc2l0aW9uXTtcbiAgXHR0aGlzLnF1ZXN0aW9uKHEucSgpKTtcbiAgfS5iaW5kKHRoaXMpO1xuXG4gIHRoaXMubmV4dFF1ZXN0aW9uID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBzdG9wRXZlbnQoZXZlbnQpO1xuICAgIHRoaXMucHJldmlvdXNRdWVzdGlvbiA9IHRoaXMucXVlc3Rpb24oKTtcbiAgXHR0aGlzLnBvc2l0aW9uICs9IDE7XG4gIFx0aWYgKHRoaXMucG9zaXRpb24gPT09IHRoaXMucXVlc3Rpb25zKCkubGVuZ3RoKSB7XG4gIFx0XHR0aGlzLmVuZChTdHJpbmdzLmFsbF9kb25lKVxuICBcdH0gZWxzZSB7XG4gIFx0XHR0aGlzLnNob3dRdWVzdGlvbigpO1xuICBcdH1cbiAgfS5iaW5kKHRoaXMpO1xuXG4gIHRoaXMudGltZVVwID0gZnVuY3Rpb24oKSB7XG4gIFx0dGhpcy5lbmQoU3RyaW5ncy50aW1lc191cCk7XG4gIH0uYmluZCh0aGlzKTtcblxuICB0aGlzLmVuZCA9IGZ1bmN0aW9uKG1zZykge1xuICBcdHRoaXMuZmluaXNoZWRNZXNzYWdlKG1zZyk7XG4gIFx0dGhpcy50aW1lci5zdG9wKCk7XG4gIFx0dGhpcy5jb21wbGV0ZSh0cnVlKTtcbiAgfTtcblxuICB0aGlzLnN0YXRlQ2xhc3MgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5jb21wbGV0ZSgpKSB7IHJldHVybiBbJ2NvbXBsZXRlJ107IH1cbiAgICB2YXIgYWN0aXZlID0gISF0aGlzLnF1ZXN0aW9uKCksIHN0YXRlQ2xhc3NlcyA9IGFjdGl2ZSA/IFsnYWN0aXZlJ10gOiBbJ2luYWN0aXZlJ107XG4gICAgc3RhdGVDbGFzc2VzLnB1c2goJ2Nsb2NrLScrdGhpcy5xdWVzdGlvbkNsb2NrKCkpO1xuICAgIHJldHVybiBzdGF0ZUNsYXNzZXMuam9pbignICcpXG4gIH07XG5cbiAgdGhpcy5xdWVzdGlvbkNsb2NrID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHBvcztcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PSAwKSB7XG4gICAgICBwb3MgPSB0aGlzLnBvc2l0aW9uO1xuICAgIH0gZWxzZSB7XG4gICAgICBwb3MgPSBhcmd1bWVudHNbMF07XG4gICAgfVxuICAgIHJldHVybiAoKHBvcyAlIDMpKTtcbiAgfTtcblxuICB0aGlzLnF1ZXN0aW9uRm9yU2xvdCA9IGZ1bmN0aW9uKHNsb3RJZCkge1xuICAgIHZhciBjbG9jayA9IHRoaXMucXVlc3Rpb25DbG9jaygpLCBwcmV2ID0gdGhpcy5xdWVzdGlvbkNsb2NrKHRoaXMucG9zaXRpb24gLSAxKVxuICAgIGlmIChzbG90SWQgPT09IGNsb2NrKSB7XG4gICAgICByZXR1cm4gdGhpcy5xdWVzdGlvbigpO1xuICAgIH1cbiAgICBpZiAoc2xvdElkID09PSBwcmV2KSB7XG4gICAgICByZXR1cm4gdGhpcy5wcmV2aW91c1F1ZXN0aW9uO1xuICAgIH1cblxuICAgIHJldHVybiAnJztcbiAgfVxuXG4gIHRoaXMudGltZXIgPSBuZXcgdGltZXIuY29udHJvbGxlcig2MCwgdGhpcy50aW1lVXApO1xuXG4gIC8vIGxvYWQgcXVlc3Rpb25zXG4gIGZvciAodmFyIGkgPSAwLCBxcSA9IHdpbmRvdy5EYXRhLnF1ZXN0aW9ucywgaWkgPSBxcS5sZW5ndGg7IGkgPCBpaTsgaSsrKSB7XG4gIFx0dGhpcy5hZGQocXFbaV0pO1xuICB9XG59O1xuXG5ndXJ1LnZpZXcgPSBmdW5jdGlvbihjdHJsKSB7XG4gIHZhciBhcHBDbGFzcyA9IGN0cmwuc3RhdGVDbGFzcygpLCBhbnN3ZXJlZCA9IFN0cmluZ3MueW91X2Fuc3dlcmVkLnNwbGl0KFwie259XCIpO1xuICByZXR1cm4gbSgnZGl2Jywge2NsYXNzOiBhcHBDbGFzc30sIFtcbiAgXHRtKCdoMSNsb2dvJywgW1xuICAgICAgbSgnaW1nJywge3NyYzogJy9pbWcvZ3VydS1sb2dvLW5lZy5wbmcnLCBhbHQ6ICdCQUZUQSBHdXJ1J30pXG4gICAgXSksXG4gIFx0bSgnI3RpbWVyJywgbmV3IHRpbWVyLnZpZXcoY3RybC50aW1lcikpLFxuICBcdG0oJyNpbnRybycsIFN0cmluZ3MuaW50cm9kdWN0aW9uKSxcbiAgXHRtKCdidXR0b24jc3RhcnQnLCB7b250b3VjaGVuZDogY3RybC5zdGFydCwgb25jbGljazogY3RybC5zdGFydH0sIFN0cmluZ3Muc3RhcnQpLFxuICBcdG0oJ2J1dHRvbiNyZXN0YXJ0Jywge29udG91Y2hlbmQ6IGN0cmwuc3RhcnQsIG9uY2xpY2s6IGN0cmwuc3RhcnR9LCBTdHJpbmdzLnRyeV9hZ2FpbiksXG4gIFx0bSgnZGl2I3F1ZXN0aW9uMC5xdWVzdGlvbicsIFtcbiAgICAgIG0oJ3NwYW4nLCBjdHJsLnF1ZXN0aW9uRm9yU2xvdCgwKSlcbiAgICBdKSxcbiAgICBtKCdkaXYjcXVlc3Rpb24xLnF1ZXN0aW9uJywgW1xuICAgICAgbSgnc3BhbicsIGN0cmwucXVlc3Rpb25Gb3JTbG90KDEpKVxuICAgIF0pLFxuICAgIG0oJ2RpdiNxdWVzdGlvbjIucXVlc3Rpb24nLCBbXG4gICAgICBtKCdzcGFuJywgY3RybC5xdWVzdGlvbkZvclNsb3QoMikpXG4gICAgXSksXG4gICAgbSgnZGl2I2ZpbmlzaGVkJywgY3RybC5maW5pc2hlZE1lc3NhZ2UoKSksXG4gIFx0bSgnZGl2I3Jlc3VsdHMnLCBbXG4gICAgICBcdGFuc3dlcmVkWzBdLFxuICAgICAgXHRtKCdzcGFuJywgY3RybC5hbnN3ZXJzKCkpLFxuICAgICAgXHRhbnN3ZXJlZFsxXVxuICAgIF0pLFxuICBcdG0oJ2J1dHRvbiNuZXh0Jywge29uY2xpY2s6IGN0cmwubmV4dFF1ZXN0aW9uLCBvbnRvdWNoc3RhcnQ6IGN0cmwubmV4dFF1ZXN0aW9ufSwgW1xuICBcdFx0XCJOZXh0IHF1ZXN0aW9uXCJcbiAgICBdKVxuXHRdKTtcbn07XG5cbm0ubW9kdWxlKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdndXJ1JyksIGd1cnUpO1xuIiwiXG52YXIgdGltZXIgPSB7fTtcblxudGltZXIuY29udHJvbGxlciA9IGZ1bmN0aW9uKGR1cmF0aW9uLCBjb21wbGV0ZUNhbGxiYWNrKSB7XG5cdHRoaXMuZHVyYXRpb24gPSBkdXJhdGlvbjtcblx0dGhpcy5zZWNvbmRzID0gbS5wcm9wKHRoaXMuZHVyYXRpb24pO1xuXHR0aGlzLnN0YXJ0VGltZSA9IG51bGxcblx0dGhpcy5jb21wbGV0ZUNhbGxiYWNrID0gY29tcGxldGVDYWxsYmFjaztcblx0dGhpcy5zdG9wcGVkID0gbS5wcm9wKHRydWUpO1xuXG5cdHRoaXMucmVzZXQgPSBmdW5jdGlvbigpIHtcblx0XHR0aGlzLnNlY29uZHModGhpcy5kdXJhdGlvbik7XG5cdFx0dGhpcy5zdGFydFRpbWUgPSAobmV3IERhdGUoKSk7XG5cdFx0dGhpcy5jbGVhckludGVydmFsKCk7XG5cdH07XG5cblx0dGhpcy5zdGFydCA9IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMucmVzZXQoKTtcblx0XHR0aGlzLnN0b3BwZWQoZmFsc2UpO1xuXHRcdHRoaXMudGltZXIgPSB3aW5kb3cuc2V0SW50ZXJ2YWwodGhpcy51cGRhdGUsIDEwMCk7XG5cdH0uYmluZCh0aGlzKTtcblxuXHR0aGlzLnVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBub3cgPSBuZXcgRGF0ZSgpLCBkdXJhdGlvbiA9IG5vdyAtIHRoaXMuc3RhcnRUaW1lLCBzZWNvbmRzID0gTWF0aC5jZWlsKHRoaXMuZHVyYXRpb24gLSAoZHVyYXRpb24gLyAxMDAwKSk7XG5cdFx0dGhpcy5zZWNvbmRzKHNlY29uZHMpO1xuXHRcdGlmIChzZWNvbmRzID09PSAwKSB7XG5cdFx0XHR0aGlzLmZpbmlzaGVkKCk7XG5cdFx0fVxuXHRcdG0ucmVkcmF3KCk7XG5cdH0uYmluZCh0aGlzKTtcblxuXHR0aGlzLmZpbmlzaGVkID0gZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5zdG9wKCk7XG5cdFx0aWYgKHRoaXMuY29tcGxldGVDYWxsYmFjaykgeyB0aGlzLmNvbXBsZXRlQ2FsbGJhY2soKTsgfVxuXHR9O1xuXG5cdHRoaXMuc3RvcCA9IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuc2Vjb25kcygwKTtcblx0XHR0aGlzLnN0b3BwZWQodHJ1ZSk7XG5cdFx0dGhpcy5jbGVhckludGVydmFsKCk7XG5cdH07XG5cblx0dGhpcy5jbGVhckludGVydmFsID0gZnVuY3Rpb24oKSB7XG5cdFx0aWYgKHRoaXMudGltZXIpIHtcblx0XHRcdHdpbmRvdy5jbGVhckludGVydmFsKHRoaXMudGltZXIpO1xuXHRcdFx0dGhpcy50aW1lciA9IG51bGw7XG5cdFx0fVxuXHR9O1xufTtcblxudGltZXIudmlldyA9IGZ1bmN0aW9uKGN0cmwpIHtcblx0dmFyIHZpZXcgPSBbXSwgc3RvcHBlZCA9IGN0cmwuc3RvcHBlZCgpO1xuXG5cdFx0dmlldy5wdXNoKG0oJ2RpdicsIGN0cmwuc2Vjb25kcygpKSk7XG5cdGlmICghc3RvcHBlZCkge1xuXHR9XG5cdHJldHVybiB2aWV3O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB0aW1lcjsiLCJNaXRocmlsID0gbSA9IG5ldyBmdW5jdGlvbiBhcHAod2luZG93LCB1bmRlZmluZWQpIHtcclxuXHR2YXIgdHlwZSA9IHt9LnRvU3RyaW5nXHJcblx0dmFyIHBhcnNlciA9IC8oPzooXnwjfFxcLikoW14jXFwuXFxbXFxdXSspKXwoXFxbLis/XFxdKS9nLCBhdHRyUGFyc2VyID0gL1xcWyguKz8pKD86PShcInwnfCkoLio/KVxcMik/XFxdL1xyXG5cdHZhciB2b2lkRWxlbWVudHMgPSAvQVJFQXxCQVNFfEJSfENPTHxDT01NQU5EfEVNQkVEfEhSfElNR3xJTlBVVHxLRVlHRU58TElOS3xNRVRBfFBBUkFNfFNPVVJDRXxUUuKAjOKAi0FDS3xXQlIvXHJcblxyXG5cdGZ1bmN0aW9uIG0oKSB7XHJcblx0XHR2YXIgYXJncyA9IGFyZ3VtZW50c1xyXG5cdFx0dmFyIGhhc0F0dHJzID0gYXJnc1sxXSAhPSBudWxsICYmIHR5cGUuY2FsbChhcmdzWzFdKSA9PSBcIltvYmplY3QgT2JqZWN0XVwiICYmICEoXCJ0YWdcIiBpbiBhcmdzWzFdKSAmJiAhKFwic3VidHJlZVwiIGluIGFyZ3NbMV0pXHJcblx0XHR2YXIgYXR0cnMgPSBoYXNBdHRycyA/IGFyZ3NbMV0gOiB7fVxyXG5cdFx0dmFyIGNsYXNzQXR0ck5hbWUgPSBcImNsYXNzXCIgaW4gYXR0cnMgPyBcImNsYXNzXCIgOiBcImNsYXNzTmFtZVwiXHJcblx0XHR2YXIgY2VsbCA9IHt0YWc6IFwiZGl2XCIsIGF0dHJzOiB7fX1cclxuXHRcdHZhciBtYXRjaCwgY2xhc3NlcyA9IFtdXHJcblx0XHR3aGlsZSAobWF0Y2ggPSBwYXJzZXIuZXhlYyhhcmdzWzBdKSkge1xyXG5cdFx0XHRpZiAobWF0Y2hbMV0gPT0gXCJcIikgY2VsbC50YWcgPSBtYXRjaFsyXVxyXG5cdFx0XHRlbHNlIGlmIChtYXRjaFsxXSA9PSBcIiNcIikgY2VsbC5hdHRycy5pZCA9IG1hdGNoWzJdXHJcblx0XHRcdGVsc2UgaWYgKG1hdGNoWzFdID09IFwiLlwiKSBjbGFzc2VzLnB1c2gobWF0Y2hbMl0pXHJcblx0XHRcdGVsc2UgaWYgKG1hdGNoWzNdWzBdID09IFwiW1wiKSB7XHJcblx0XHRcdFx0dmFyIHBhaXIgPSBhdHRyUGFyc2VyLmV4ZWMobWF0Y2hbM10pXHJcblx0XHRcdFx0Y2VsbC5hdHRyc1twYWlyWzFdXSA9IHBhaXJbM10gfHwgKHBhaXJbMl0gPyBcIlwiIDp0cnVlKVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRpZiAoY2xhc3Nlcy5sZW5ndGggPiAwKSBjZWxsLmF0dHJzW2NsYXNzQXR0ck5hbWVdID0gY2xhc3Nlcy5qb2luKFwiIFwiKVxyXG5cclxuXHRcdGNlbGwuY2hpbGRyZW4gPSBoYXNBdHRycyA/IGFyZ3NbMl0gOiBhcmdzWzFdXHJcblxyXG5cdFx0Zm9yICh2YXIgYXR0ck5hbWUgaW4gYXR0cnMpIHtcclxuXHRcdFx0aWYgKGF0dHJOYW1lID09IGNsYXNzQXR0ck5hbWUpIGNlbGwuYXR0cnNbYXR0ck5hbWVdID0gKGNlbGwuYXR0cnNbYXR0ck5hbWVdIHx8IFwiXCIpICsgXCIgXCIgKyBhdHRyc1thdHRyTmFtZV1cclxuXHRcdFx0ZWxzZSBjZWxsLmF0dHJzW2F0dHJOYW1lXSA9IGF0dHJzW2F0dHJOYW1lXVxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIGNlbGxcclxuXHR9XHJcblx0ZnVuY3Rpb24gYnVpbGQocGFyZW50RWxlbWVudCwgcGFyZW50VGFnLCBwYXJlbnRDYWNoZSwgcGFyZW50SW5kZXgsIGRhdGEsIGNhY2hlZCwgc2hvdWxkUmVhdHRhY2gsIGluZGV4LCBlZGl0YWJsZSwgbmFtZXNwYWNlLCBjb25maWdzKSB7XHJcblx0XHQvL2BidWlsZGAgaXMgYSByZWN1cnNpdmUgZnVuY3Rpb24gdGhhdCBtYW5hZ2VzIGNyZWF0aW9uL2RpZmZpbmcvcmVtb3ZhbCBvZiBET00gZWxlbWVudHMgYmFzZWQgb24gY29tcGFyaXNvbiBiZXR3ZWVuIGBkYXRhYCBhbmQgYGNhY2hlZGBcclxuXHRcdC8vdGhlIGRpZmYgYWxnb3JpdGhtIGNhbiBiZSBzdW1tYXJpemVkIGFzIHRoaXM6XHJcblx0XHQvLzEgLSBjb21wYXJlIGBkYXRhYCBhbmQgYGNhY2hlZGBcclxuXHRcdC8vMiAtIGlmIHRoZXkgYXJlIGRpZmZlcmVudCwgY29weSBgZGF0YWAgdG8gYGNhY2hlZGAgYW5kIHVwZGF0ZSB0aGUgRE9NIGJhc2VkIG9uIHdoYXQgdGhlIGRpZmZlcmVuY2UgaXNcclxuXHRcdC8vMyAtIHJlY3Vyc2l2ZWx5IGFwcGx5IHRoaXMgYWxnb3JpdGhtIGZvciBldmVyeSBhcnJheSBhbmQgZm9yIHRoZSBjaGlsZHJlbiBvZiBldmVyeSB2aXJ0dWFsIGVsZW1lbnRcclxuXHRcdFxyXG5cdFx0Ly90aGUgYGNhY2hlZGAgZGF0YSBzdHJ1Y3R1cmUgaXMgZXNzZW50aWFsbHkgdGhlIHNhbWUgYXMgdGhlIHByZXZpb3VzIHJlZHJhdydzIGBkYXRhYCBkYXRhIHN0cnVjdHVyZSwgd2l0aCBhIGZldyBhZGRpdGlvbnM6XHJcblx0XHQvLy0gYGNhY2hlZGAgYWx3YXlzIGhhcyBhIHByb3BlcnR5IGNhbGxlZCBgbm9kZXNgLCB3aGljaCBpcyBhIGxpc3Qgb2YgRE9NIGVsZW1lbnRzIHRoYXQgY29ycmVzcG9uZCB0byB0aGUgZGF0YSByZXByZXNlbnRlZCBieSB0aGUgcmVzcGVjdGl2ZSB2aXJ0dWFsIGVsZW1lbnRcclxuXHRcdC8vLSBpbiBvcmRlciB0byBzdXBwb3J0IGF0dGFjaGluZyBgbm9kZXNgIGFzIGEgcHJvcGVydHkgb2YgYGNhY2hlZGAsIGBjYWNoZWRgIGlzICphbHdheXMqIGEgbm9uLXByaW1pdGl2ZSBvYmplY3QsIGkuZS4gaWYgdGhlIGRhdGEgd2FzIGEgc3RyaW5nLCB0aGVuIGNhY2hlZCBpcyBhIFN0cmluZyBpbnN0YW5jZS4gSWYgZGF0YSB3YXMgYG51bGxgIG9yIGB1bmRlZmluZWRgLCBjYWNoZWQgaXMgYG5ldyBTdHJpbmcoXCJcIilgXHJcblx0XHQvLy0gYGNhY2hlZCBhbHNvIGhhcyBhIGBjb25maWdDb250ZXh0YCBwcm9wZXJ0eSwgd2hpY2ggaXMgdGhlIHN0YXRlIHN0b3JhZ2Ugb2JqZWN0IGV4cG9zZWQgYnkgY29uZmlnKGVsZW1lbnQsIGlzSW5pdGlhbGl6ZWQsIGNvbnRleHQpXHJcblx0XHQvLy0gd2hlbiBgY2FjaGVkYCBpcyBhbiBPYmplY3QsIGl0IHJlcHJlc2VudHMgYSB2aXJ0dWFsIGVsZW1lbnQ7IHdoZW4gaXQncyBhbiBBcnJheSwgaXQgcmVwcmVzZW50cyBhIGxpc3Qgb2YgZWxlbWVudHM7IHdoZW4gaXQncyBhIFN0cmluZywgTnVtYmVyIG9yIEJvb2xlYW4sIGl0IHJlcHJlc2VudHMgYSB0ZXh0IG5vZGVcclxuXHJcblx0XHQvL2BwYXJlbnRFbGVtZW50YCBpcyBhIERPTSBlbGVtZW50IHVzZWQgZm9yIFczQyBET00gQVBJIGNhbGxzXHJcblx0XHQvL2BwYXJlbnRUYWdgIGlzIG9ubHkgdXNlZCBmb3IgaGFuZGxpbmcgYSBjb3JuZXIgY2FzZSBmb3IgdGV4dGFyZWEgdmFsdWVzXHJcblx0XHQvL2BwYXJlbnRDYWNoZWAgaXMgdXNlZCB0byByZW1vdmUgbm9kZXMgaW4gc29tZSBtdWx0aS1ub2RlIGNhc2VzXHJcblx0XHQvL2BwYXJlbnRJbmRleGAgYW5kIGBpbmRleGAgYXJlIHVzZWQgdG8gZmlndXJlIG91dCB0aGUgb2Zmc2V0IG9mIG5vZGVzLiBUaGV5J3JlIGFydGlmYWN0cyBmcm9tIGJlZm9yZSBhcnJheXMgc3RhcnRlZCBiZWluZyBmbGF0dGVuZWQgYW5kIGFyZSBsaWtlbHkgcmVmYWN0b3JhYmxlXHJcblx0XHQvL2BkYXRhYCBhbmQgYGNhY2hlZGAgYXJlLCByZXNwZWN0aXZlbHksIHRoZSBuZXcgYW5kIG9sZCBub2RlcyBiZWluZyBkaWZmZWRcclxuXHRcdC8vYHNob3VsZFJlYXR0YWNoYCBpcyBhIGZsYWcgaW5kaWNhdGluZyB3aGV0aGVyIGEgcGFyZW50IG5vZGUgd2FzIHJlY3JlYXRlZCAoaWYgc28sIGFuZCBpZiB0aGlzIG5vZGUgaXMgcmV1c2VkLCB0aGVuIHRoaXMgbm9kZSBtdXN0IHJlYXR0YWNoIGl0c2VsZiB0byB0aGUgbmV3IHBhcmVudClcclxuXHRcdC8vYGVkaXRhYmxlYCBpcyBhIGZsYWcgdGhhdCBpbmRpY2F0ZXMgd2hldGhlciBhbiBhbmNlc3RvciBpcyBjb250ZW50ZWRpdGFibGVcclxuXHRcdC8vYG5hbWVzcGFjZWAgaW5kaWNhdGVzIHRoZSBjbG9zZXN0IEhUTUwgbmFtZXNwYWNlIGFzIGl0IGNhc2NhZGVzIGRvd24gZnJvbSBhbiBhbmNlc3RvclxyXG5cdFx0Ly9gY29uZmlnc2AgaXMgYSBsaXN0IG9mIGNvbmZpZyBmdW5jdGlvbnMgdG8gcnVuIGFmdGVyIHRoZSB0b3Btb3N0IGBidWlsZGAgY2FsbCBmaW5pc2hlcyBydW5uaW5nXHJcblxyXG5cdFx0Ly90aGVyZSdzIGxvZ2ljIHRoYXQgcmVsaWVzIG9uIHRoZSBhc3N1bXB0aW9uIHRoYXQgbnVsbCBhbmQgdW5kZWZpbmVkIGRhdGEgYXJlIGVxdWl2YWxlbnQgdG8gZW1wdHkgc3RyaW5nc1xyXG5cdFx0Ly8tIHRoaXMgcHJldmVudHMgbGlmZWN5Y2xlIHN1cnByaXNlcyBmcm9tIHByb2NlZHVyYWwgaGVscGVycyB0aGF0IG1peCBpbXBsaWNpdCBhbmQgZXhwbGljaXQgcmV0dXJuIHN0YXRlbWVudHNcclxuXHRcdC8vLSBpdCBzaW1wbGlmaWVzIGRpZmZpbmcgY29kZVxyXG5cdFx0aWYgKGRhdGEgPT0gbnVsbCkgZGF0YSA9IFwiXCJcclxuXHRcdGlmIChkYXRhLnN1YnRyZWUgPT09IFwicmV0YWluXCIpIHJldHVybiBjYWNoZWRcclxuXHJcblx0XHR2YXIgY2FjaGVkVHlwZSA9IHR5cGUuY2FsbChjYWNoZWQpLCBkYXRhVHlwZSA9IHR5cGUuY2FsbChkYXRhKVxyXG5cdFx0aWYgKGNhY2hlZCA9PSBudWxsIHx8IGNhY2hlZFR5cGUgIT0gZGF0YVR5cGUpIHtcclxuXHRcdFx0aWYgKGNhY2hlZCAhPSBudWxsKSB7XHJcblx0XHRcdFx0aWYgKHBhcmVudENhY2hlICYmIHBhcmVudENhY2hlLm5vZGVzKSB7XHJcblx0XHRcdFx0XHR2YXIgb2Zmc2V0ID0gaW5kZXggLSBwYXJlbnRJbmRleFxyXG5cdFx0XHRcdFx0dmFyIGVuZCA9IG9mZnNldCArIChkYXRhVHlwZSA9PSBcIltvYmplY3QgQXJyYXldXCIgPyBkYXRhIDogY2FjaGVkLm5vZGVzKS5sZW5ndGhcclxuXHRcdFx0XHRcdGNsZWFyKHBhcmVudENhY2hlLm5vZGVzLnNsaWNlKG9mZnNldCwgZW5kKSwgcGFyZW50Q2FjaGUuc2xpY2Uob2Zmc2V0LCBlbmQpKVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRlbHNlIGlmIChjYWNoZWQubm9kZXMpIGNsZWFyKGNhY2hlZC5ub2RlcywgY2FjaGVkKVxyXG5cdFx0XHR9XHJcblx0XHRcdGNhY2hlZCA9IG5ldyBkYXRhLmNvbnN0cnVjdG9yXHJcblx0XHRcdGNhY2hlZC5ub2RlcyA9IFtdXHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKGRhdGFUeXBlID09IFwiW29iamVjdCBBcnJheV1cIikge1xyXG5cdFx0XHRkYXRhID0gZmxhdHRlbihkYXRhKVxyXG5cdFx0XHR2YXIgbm9kZXMgPSBbXSwgaW50YWN0ID0gY2FjaGVkLmxlbmd0aCA9PT0gZGF0YS5sZW5ndGgsIHN1YkFycmF5Q291bnQgPSAwXHJcblxyXG5cdFx0XHQvL2tleXMgYWxnb3JpdGhtOiBzb3J0IGVsZW1lbnRzIHdpdGhvdXQgcmVjcmVhdGluZyB0aGVtIGlmIGtleXMgYXJlIHByZXNlbnRcclxuXHRcdFx0Ly8xKSBjcmVhdGUgYSBtYXAgb2YgYWxsIGV4aXN0aW5nIGtleXMsIGFuZCBtYXJrIGFsbCBmb3IgZGVsZXRpb25cclxuXHRcdFx0Ly8yKSBhZGQgbmV3IGtleXMgdG8gbWFwIGFuZCBtYXJrIHRoZW0gZm9yIGFkZGl0aW9uXHJcblx0XHRcdC8vMykgaWYga2V5IGV4aXN0cyBpbiBuZXcgbGlzdCwgY2hhbmdlIGFjdGlvbiBmcm9tIGRlbGV0aW9uIHRvIGEgbW92ZVxyXG5cdFx0XHQvLzQpIGZvciBlYWNoIGtleSwgaGFuZGxlIGl0cyBjb3JyZXNwb25kaW5nIGFjdGlvbiBhcyBtYXJrZWQgaW4gcHJldmlvdXMgc3RlcHNcclxuXHRcdFx0Ly81KSBjb3B5IHVua2V5ZWQgaXRlbXMgaW50byB0aGVpciByZXNwZWN0aXZlIGdhcHNcclxuXHRcdFx0dmFyIERFTEVUSU9OID0gMSwgSU5TRVJUSU9OID0gMiAsIE1PVkUgPSAzXHJcblx0XHRcdHZhciBleGlzdGluZyA9IHt9LCB1bmtleWVkID0gW10sIHNob3VsZE1haW50YWluSWRlbnRpdGllcyA9IGZhbHNlXHJcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgY2FjaGVkLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0aWYgKGNhY2hlZFtpXSAmJiBjYWNoZWRbaV0uYXR0cnMgJiYgY2FjaGVkW2ldLmF0dHJzLmtleSAhPSBudWxsKSB7XHJcblx0XHRcdFx0XHRzaG91bGRNYWludGFpbklkZW50aXRpZXMgPSB0cnVlXHJcblx0XHRcdFx0XHRleGlzdGluZ1tjYWNoZWRbaV0uYXR0cnMua2V5XSA9IHthY3Rpb246IERFTEVUSU9OLCBpbmRleDogaX1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0aWYgKHNob3VsZE1haW50YWluSWRlbnRpdGllcykge1xyXG5cdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdFx0aWYgKGRhdGFbaV0gJiYgZGF0YVtpXS5hdHRycykge1xyXG5cdFx0XHRcdFx0XHRpZiAoZGF0YVtpXS5hdHRycy5rZXkgIT0gbnVsbCkge1xyXG5cdFx0XHRcdFx0XHRcdHZhciBrZXkgPSBkYXRhW2ldLmF0dHJzLmtleVxyXG5cdFx0XHRcdFx0XHRcdGlmICghZXhpc3Rpbmdba2V5XSkgZXhpc3Rpbmdba2V5XSA9IHthY3Rpb246IElOU0VSVElPTiwgaW5kZXg6IGl9XHJcblx0XHRcdFx0XHRcdFx0ZWxzZSBleGlzdGluZ1trZXldID0ge2FjdGlvbjogTU9WRSwgaW5kZXg6IGksIGZyb206IGV4aXN0aW5nW2tleV0uaW5kZXgsIGVsZW1lbnQ6IHBhcmVudEVsZW1lbnQuY2hpbGROb2Rlc1tleGlzdGluZ1trZXldLmluZGV4XX1cclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRlbHNlIHVua2V5ZWQucHVzaCh7aW5kZXg6IGksIGVsZW1lbnQ6IHBhcmVudEVsZW1lbnQuY2hpbGROb2Rlc1tpXX0pXHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdHZhciBhY3Rpb25zID0gT2JqZWN0LmtleXMoZXhpc3RpbmcpLm1hcChmdW5jdGlvbihrZXkpIHtyZXR1cm4gZXhpc3Rpbmdba2V5XX0pXHJcblx0XHRcdFx0dmFyIGNoYW5nZXMgPSBhY3Rpb25zLnNvcnQoZnVuY3Rpb24oYSwgYikge3JldHVybiBhLmFjdGlvbiAtIGIuYWN0aW9uIHx8IGEuaW5kZXggLSBiLmluZGV4fSlcclxuXHRcdFx0XHR2YXIgbmV3Q2FjaGVkID0gY2FjaGVkLnNsaWNlKClcclxuXHJcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDAsIGNoYW5nZTsgY2hhbmdlID0gY2hhbmdlc1tpXTsgaSsrKSB7XHJcblx0XHRcdFx0XHRpZiAoY2hhbmdlLmFjdGlvbiA9PSBERUxFVElPTikge1xyXG5cdFx0XHRcdFx0XHRjbGVhcihjYWNoZWRbY2hhbmdlLmluZGV4XS5ub2RlcywgY2FjaGVkW2NoYW5nZS5pbmRleF0pXHJcblx0XHRcdFx0XHRcdG5ld0NhY2hlZC5zcGxpY2UoY2hhbmdlLmluZGV4LCAxKVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0aWYgKGNoYW5nZS5hY3Rpb24gPT0gSU5TRVJUSU9OKSB7XHJcblx0XHRcdFx0XHRcdHZhciBkdW1teSA9IHdpbmRvdy5kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpXHJcblx0XHRcdFx0XHRcdGR1bW15LmtleSA9IGRhdGFbY2hhbmdlLmluZGV4XS5hdHRycy5rZXlcclxuXHRcdFx0XHRcdFx0cGFyZW50RWxlbWVudC5pbnNlcnRCZWZvcmUoZHVtbXksIHBhcmVudEVsZW1lbnQuY2hpbGROb2Rlc1tjaGFuZ2UuaW5kZXhdKVxyXG5cdFx0XHRcdFx0XHRuZXdDYWNoZWQuc3BsaWNlKGNoYW5nZS5pbmRleCwgMCwge2F0dHJzOiB7a2V5OiBkYXRhW2NoYW5nZS5pbmRleF0uYXR0cnMua2V5fSwgbm9kZXM6IFtkdW1teV19KVxyXG5cdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdGlmIChjaGFuZ2UuYWN0aW9uID09IE1PVkUpIHtcclxuXHRcdFx0XHRcdFx0aWYgKHBhcmVudEVsZW1lbnQuY2hpbGROb2Rlc1tjaGFuZ2UuaW5kZXhdICE9PSBjaGFuZ2UuZWxlbWVudCAmJiBjaGFuZ2UuZWxlbWVudCAhPT0gbnVsbCkge1xyXG5cdFx0XHRcdFx0XHRcdHBhcmVudEVsZW1lbnQuaW5zZXJ0QmVmb3JlKGNoYW5nZS5lbGVtZW50LCBwYXJlbnRFbGVtZW50LmNoaWxkTm9kZXNbY2hhbmdlLmluZGV4XSlcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRuZXdDYWNoZWRbY2hhbmdlLmluZGV4XSA9IGNhY2hlZFtjaGFuZ2UuZnJvbV1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB1bmtleWVkLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0XHR2YXIgY2hhbmdlID0gdW5rZXllZFtpXVxyXG5cdFx0XHRcdFx0cGFyZW50RWxlbWVudC5pbnNlcnRCZWZvcmUoY2hhbmdlLmVsZW1lbnQsIHBhcmVudEVsZW1lbnQuY2hpbGROb2Rlc1tjaGFuZ2UuaW5kZXhdKVxyXG5cdFx0XHRcdFx0bmV3Q2FjaGVkW2NoYW5nZS5pbmRleF0gPSBjYWNoZWRbY2hhbmdlLmluZGV4XVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRjYWNoZWQgPSBuZXdDYWNoZWRcclxuXHRcdFx0XHRjYWNoZWQubm9kZXMgPSBbXVxyXG5cdFx0XHRcdGZvciAodmFyIGkgPSAwLCBjaGlsZDsgY2hpbGQgPSBwYXJlbnRFbGVtZW50LmNoaWxkTm9kZXNbaV07IGkrKykgY2FjaGVkLm5vZGVzLnB1c2goY2hpbGQpXHJcblx0XHRcdH1cclxuXHRcdFx0Ly9lbmQga2V5IGFsZ29yaXRobVxyXG5cclxuXHRcdFx0Zm9yICh2YXIgaSA9IDAsIGNhY2hlQ291bnQgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdC8vZGlmZiBlYWNoIGl0ZW0gaW4gdGhlIGFycmF5XHJcblx0XHRcdFx0dmFyIGl0ZW0gPSBidWlsZChwYXJlbnRFbGVtZW50LCBwYXJlbnRUYWcsIGNhY2hlZCwgaW5kZXgsIGRhdGFbaV0sIGNhY2hlZFtjYWNoZUNvdW50XSwgc2hvdWxkUmVhdHRhY2gsIGluZGV4ICsgc3ViQXJyYXlDb3VudCB8fCBzdWJBcnJheUNvdW50LCBlZGl0YWJsZSwgbmFtZXNwYWNlLCBjb25maWdzKVxyXG5cdFx0XHRcdGlmIChpdGVtID09PSB1bmRlZmluZWQpIGNvbnRpbnVlXHJcblx0XHRcdFx0aWYgKCFpdGVtLm5vZGVzLmludGFjdCkgaW50YWN0ID0gZmFsc2VcclxuXHRcdFx0XHR2YXIgaXNBcnJheSA9IHR5cGUuY2FsbChpdGVtKSA9PSBcIltvYmplY3QgQXJyYXldXCJcclxuXHRcdFx0XHRzdWJBcnJheUNvdW50ICs9IGlzQXJyYXkgPyBpdGVtLmxlbmd0aCA6IDFcclxuXHRcdFx0XHRjYWNoZWRbY2FjaGVDb3VudCsrXSA9IGl0ZW1cclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAoIWludGFjdCkge1xyXG5cdFx0XHRcdC8vZGlmZiB0aGUgYXJyYXkgaXRzZWxmXHJcblx0XHRcdFx0XHJcblx0XHRcdFx0Ly91cGRhdGUgdGhlIGxpc3Qgb2YgRE9NIG5vZGVzIGJ5IGNvbGxlY3RpbmcgdGhlIG5vZGVzIGZyb20gZWFjaCBpdGVtXHJcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0XHRpZiAoY2FjaGVkW2ldICE9IG51bGwpIG5vZGVzID0gbm9kZXMuY29uY2F0KGNhY2hlZFtpXS5ub2RlcylcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0Ly9yZW1vdmUgaXRlbXMgZnJvbSB0aGUgZW5kIG9mIHRoZSBhcnJheSBpZiB0aGUgbmV3IGFycmF5IGlzIHNob3J0ZXIgdGhhbiB0aGUgb2xkIG9uZVxyXG5cdFx0XHRcdC8vaWYgZXJyb3JzIGV2ZXIgaGFwcGVuIGhlcmUsIHRoZSBpc3N1ZSBpcyBtb3N0IGxpa2VseSBhIGJ1ZyBpbiB0aGUgY29uc3RydWN0aW9uIG9mIHRoZSBgY2FjaGVkYCBkYXRhIHN0cnVjdHVyZSBzb21ld2hlcmUgZWFybGllciBpbiB0aGUgcHJvZ3JhbVxyXG5cdFx0XHRcdGZvciAodmFyIGkgPSAwLCBub2RlOyBub2RlID0gY2FjaGVkLm5vZGVzW2ldOyBpKyspIHtcclxuXHRcdFx0XHRcdGlmIChub2RlLnBhcmVudE5vZGUgIT0gbnVsbCAmJiBub2Rlcy5pbmRleE9mKG5vZGUpIDwgMCkgY2xlYXIoW25vZGVdLCBbY2FjaGVkW2ldXSlcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0Ly9hZGQgaXRlbXMgdG8gdGhlIGVuZCBpZiB0aGUgbmV3IGFycmF5IGlzIGxvbmdlciB0aGFuIHRoZSBvbGQgb25lXHJcblx0XHRcdFx0Zm9yICh2YXIgaSA9IGNhY2hlZC5ub2Rlcy5sZW5ndGgsIG5vZGU7IG5vZGUgPSBub2Rlc1tpXTsgaSsrKSB7XHJcblx0XHRcdFx0XHRpZiAobm9kZS5wYXJlbnROb2RlID09IG51bGwpIHBhcmVudEVsZW1lbnQuYXBwZW5kQ2hpbGQobm9kZSlcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0aWYgKGRhdGEubGVuZ3RoIDwgY2FjaGVkLmxlbmd0aCkgY2FjaGVkLmxlbmd0aCA9IGRhdGEubGVuZ3RoXHJcblx0XHRcdFx0Y2FjaGVkLm5vZGVzID0gbm9kZXNcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0ZWxzZSBpZiAoZGF0YSAhPSBudWxsICYmIGRhdGFUeXBlID09IFwiW29iamVjdCBPYmplY3RdXCIpIHtcclxuXHRcdFx0Ly9pZiBhbiBlbGVtZW50IGlzIGRpZmZlcmVudCBlbm91Z2ggZnJvbSB0aGUgb25lIGluIGNhY2hlLCByZWNyZWF0ZSBpdFxyXG5cdFx0XHRpZiAoZGF0YS50YWcgIT0gY2FjaGVkLnRhZyB8fCBPYmplY3Qua2V5cyhkYXRhLmF0dHJzKS5qb2luKCkgIT0gT2JqZWN0LmtleXMoY2FjaGVkLmF0dHJzKS5qb2luKCkgfHwgZGF0YS5hdHRycy5pZCAhPSBjYWNoZWQuYXR0cnMuaWQpIHtcclxuXHRcdFx0XHRjbGVhcihjYWNoZWQubm9kZXMpXHJcblx0XHRcdFx0aWYgKGNhY2hlZC5jb25maWdDb250ZXh0ICYmIHR5cGVvZiBjYWNoZWQuY29uZmlnQ29udGV4dC5vbnVubG9hZCA9PSBcImZ1bmN0aW9uXCIpIGNhY2hlZC5jb25maWdDb250ZXh0Lm9udW5sb2FkKClcclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAodHlwZW9mIGRhdGEudGFnICE9IFwic3RyaW5nXCIpIHJldHVyblxyXG5cclxuXHRcdFx0dmFyIG5vZGUsIGlzTmV3ID0gY2FjaGVkLm5vZGVzLmxlbmd0aCA9PT0gMFxyXG5cdFx0XHRpZiAoZGF0YS5hdHRycy54bWxucykgbmFtZXNwYWNlID0gZGF0YS5hdHRycy54bWxuc1xyXG5cdFx0XHRlbHNlIGlmIChkYXRhLnRhZyA9PT0gXCJzdmdcIikgbmFtZXNwYWNlID0gXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiXHJcblx0XHRcdGVsc2UgaWYgKGRhdGEudGFnID09PSBcIm1hdGhcIikgbmFtZXNwYWNlID0gXCJodHRwOi8vd3d3LnczLm9yZy8xOTk4L01hdGgvTWF0aE1MXCJcclxuXHRcdFx0aWYgKGlzTmV3KSB7XHJcblx0XHRcdFx0bm9kZSA9IG5hbWVzcGFjZSA9PT0gdW5kZWZpbmVkID8gd2luZG93LmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoZGF0YS50YWcpIDogd2luZG93LmRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhuYW1lc3BhY2UsIGRhdGEudGFnKVxyXG5cdFx0XHRcdGNhY2hlZCA9IHtcclxuXHRcdFx0XHRcdHRhZzogZGF0YS50YWcsXHJcblx0XHRcdFx0XHQvL3Byb2Nlc3MgY2hpbGRyZW4gYmVmb3JlIGF0dHJzIHNvIHRoYXQgc2VsZWN0LnZhbHVlIHdvcmtzIGNvcnJlY3RseVxyXG5cdFx0XHRcdFx0Y2hpbGRyZW46IGJ1aWxkKG5vZGUsIGRhdGEudGFnLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgZGF0YS5jaGlsZHJlbiwgY2FjaGVkLmNoaWxkcmVuLCB0cnVlLCAwLCBkYXRhLmF0dHJzLmNvbnRlbnRlZGl0YWJsZSA/IG5vZGUgOiBlZGl0YWJsZSwgbmFtZXNwYWNlLCBjb25maWdzKSxcclxuXHRcdFx0XHRcdGF0dHJzOiBzZXRBdHRyaWJ1dGVzKG5vZGUsIGRhdGEudGFnLCBkYXRhLmF0dHJzLCB7fSwgbmFtZXNwYWNlKSxcclxuXHRcdFx0XHRcdG5vZGVzOiBbbm9kZV1cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0cGFyZW50RWxlbWVudC5pbnNlcnRCZWZvcmUobm9kZSwgcGFyZW50RWxlbWVudC5jaGlsZE5vZGVzW2luZGV4XSB8fCBudWxsKVxyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2Uge1xyXG5cdFx0XHRcdG5vZGUgPSBjYWNoZWQubm9kZXNbMF1cclxuXHRcdFx0XHRzZXRBdHRyaWJ1dGVzKG5vZGUsIGRhdGEudGFnLCBkYXRhLmF0dHJzLCBjYWNoZWQuYXR0cnMsIG5hbWVzcGFjZSlcclxuXHRcdFx0XHRjYWNoZWQuY2hpbGRyZW4gPSBidWlsZChub2RlLCBkYXRhLnRhZywgdW5kZWZpbmVkLCB1bmRlZmluZWQsIGRhdGEuY2hpbGRyZW4sIGNhY2hlZC5jaGlsZHJlbiwgZmFsc2UsIDAsIGRhdGEuYXR0cnMuY29udGVudGVkaXRhYmxlID8gbm9kZSA6IGVkaXRhYmxlLCBuYW1lc3BhY2UsIGNvbmZpZ3MpXHJcblx0XHRcdFx0Y2FjaGVkLm5vZGVzLmludGFjdCA9IHRydWVcclxuXHRcdFx0XHRpZiAoc2hvdWxkUmVhdHRhY2ggPT09IHRydWUgJiYgbm9kZSAhPSBudWxsKSBwYXJlbnRFbGVtZW50Lmluc2VydEJlZm9yZShub2RlLCBwYXJlbnRFbGVtZW50LmNoaWxkTm9kZXNbaW5kZXhdIHx8IG51bGwpXHJcblx0XHRcdH1cclxuXHRcdFx0Ly9zY2hlZHVsZSBjb25maWdzIHRvIGJlIGNhbGxlZC4gVGhleSBhcmUgY2FsbGVkIGFmdGVyIGBidWlsZGAgZmluaXNoZXMgcnVubmluZ1xyXG5cdFx0XHRpZiAodHlwZW9mIGRhdGEuYXR0cnNbXCJjb25maWdcIl0gPT09IFwiZnVuY3Rpb25cIikge1xyXG5cdFx0XHRcdGNvbmZpZ3MucHVzaChkYXRhLmF0dHJzW1wiY29uZmlnXCJdLmJpbmQod2luZG93LCBub2RlLCAhaXNOZXcsIGNhY2hlZC5jb25maWdDb250ZXh0ID0gY2FjaGVkLmNvbmZpZ0NvbnRleHQgfHwge30sIGNhY2hlZCkpXHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdGVsc2UgaWYgKHR5cGVvZiBkYXRhVHlwZSAhPSBcImZ1bmN0aW9uXCIpIHtcclxuXHRcdFx0Ly9oYW5kbGUgdGV4dCBub2Rlc1xyXG5cdFx0XHR2YXIgbm9kZXNcclxuXHRcdFx0aWYgKGNhY2hlZC5ub2Rlcy5sZW5ndGggPT09IDApIHtcclxuXHRcdFx0XHRpZiAoZGF0YS4kdHJ1c3RlZCkge1xyXG5cdFx0XHRcdFx0bm9kZXMgPSBpbmplY3RIVE1MKHBhcmVudEVsZW1lbnQsIGluZGV4LCBkYXRhKVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRlbHNlIHtcclxuXHRcdFx0XHRcdG5vZGVzID0gW3dpbmRvdy5kb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShkYXRhKV1cclxuXHRcdFx0XHRcdGlmICghcGFyZW50RWxlbWVudC5ub2RlTmFtZS5tYXRjaCh2b2lkRWxlbWVudHMpKSBwYXJlbnRFbGVtZW50Lmluc2VydEJlZm9yZShub2Rlc1swXSwgcGFyZW50RWxlbWVudC5jaGlsZE5vZGVzW2luZGV4XSB8fCBudWxsKVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRjYWNoZWQgPSBcInN0cmluZyBudW1iZXIgYm9vbGVhblwiLmluZGV4T2YodHlwZW9mIGRhdGEpID4gLTEgPyBuZXcgZGF0YS5jb25zdHJ1Y3RvcihkYXRhKSA6IGRhdGFcclxuXHRcdFx0XHRjYWNoZWQubm9kZXMgPSBub2Rlc1xyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2UgaWYgKGNhY2hlZC52YWx1ZU9mKCkgIT09IGRhdGEudmFsdWVPZigpIHx8IHNob3VsZFJlYXR0YWNoID09PSB0cnVlKSB7XHJcblx0XHRcdFx0bm9kZXMgPSBjYWNoZWQubm9kZXNcclxuXHRcdFx0XHRpZiAoIWVkaXRhYmxlIHx8IGVkaXRhYmxlICE9PSB3aW5kb3cuZG9jdW1lbnQuYWN0aXZlRWxlbWVudCkge1xyXG5cdFx0XHRcdFx0aWYgKGRhdGEuJHRydXN0ZWQpIHtcclxuXHRcdFx0XHRcdFx0Y2xlYXIobm9kZXMsIGNhY2hlZClcclxuXHRcdFx0XHRcdFx0bm9kZXMgPSBpbmplY3RIVE1MKHBhcmVudEVsZW1lbnQsIGluZGV4LCBkYXRhKVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0ZWxzZSB7XHJcblx0XHRcdFx0XHRcdC8vY29ybmVyIGNhc2U6IHJlcGxhY2luZyB0aGUgbm9kZVZhbHVlIG9mIGEgdGV4dCBub2RlIHRoYXQgaXMgYSBjaGlsZCBvZiBhIHRleHRhcmVhL2NvbnRlbnRlZGl0YWJsZSBkb2Vzbid0IHdvcmtcclxuXHRcdFx0XHRcdFx0Ly93ZSBuZWVkIHRvIHVwZGF0ZSB0aGUgdmFsdWUgcHJvcGVydHkgb2YgdGhlIHBhcmVudCB0ZXh0YXJlYSBvciB0aGUgaW5uZXJIVE1MIG9mIHRoZSBjb250ZW50ZWRpdGFibGUgZWxlbWVudCBpbnN0ZWFkXHJcblx0XHRcdFx0XHRcdGlmIChwYXJlbnRUYWcgPT09IFwidGV4dGFyZWFcIikgcGFyZW50RWxlbWVudC52YWx1ZSA9IGRhdGFcclxuXHRcdFx0XHRcdFx0ZWxzZSBpZiAoZWRpdGFibGUpIGVkaXRhYmxlLmlubmVySFRNTCA9IGRhdGFcclxuXHRcdFx0XHRcdFx0ZWxzZSB7XHJcblx0XHRcdFx0XHRcdFx0aWYgKG5vZGVzWzBdLm5vZGVUeXBlID09IDEgfHwgbm9kZXMubGVuZ3RoID4gMSkgeyAvL3dhcyBhIHRydXN0ZWQgc3RyaW5nXHJcblx0XHRcdFx0XHRcdFx0XHRjbGVhcihjYWNoZWQubm9kZXMsIGNhY2hlZClcclxuXHRcdFx0XHRcdFx0XHRcdG5vZGVzID0gW3dpbmRvdy5kb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShkYXRhKV1cclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0cGFyZW50RWxlbWVudC5pbnNlcnRCZWZvcmUobm9kZXNbMF0sIHBhcmVudEVsZW1lbnQuY2hpbGROb2Rlc1tpbmRleF0gfHwgbnVsbClcclxuXHRcdFx0XHRcdFx0XHRub2Rlc1swXS5ub2RlVmFsdWUgPSBkYXRhXHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0Y2FjaGVkID0gbmV3IGRhdGEuY29uc3RydWN0b3IoZGF0YSlcclxuXHRcdFx0XHRjYWNoZWQubm9kZXMgPSBub2Rlc1xyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2UgY2FjaGVkLm5vZGVzLmludGFjdCA9IHRydWVcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gY2FjaGVkXHJcblx0fVxyXG5cdGZ1bmN0aW9uIHNldEF0dHJpYnV0ZXMobm9kZSwgdGFnLCBkYXRhQXR0cnMsIGNhY2hlZEF0dHJzLCBuYW1lc3BhY2UpIHtcclxuXHRcdHZhciBncm91cHMgPSB7fVxyXG5cdFx0Zm9yICh2YXIgYXR0ck5hbWUgaW4gZGF0YUF0dHJzKSB7XHJcblx0XHRcdHZhciBkYXRhQXR0ciA9IGRhdGFBdHRyc1thdHRyTmFtZV1cclxuXHRcdFx0dmFyIGNhY2hlZEF0dHIgPSBjYWNoZWRBdHRyc1thdHRyTmFtZV1cclxuXHRcdFx0aWYgKCEoYXR0ck5hbWUgaW4gY2FjaGVkQXR0cnMpIHx8IChjYWNoZWRBdHRyICE9PSBkYXRhQXR0cikgfHwgbm9kZSA9PT0gd2luZG93LmRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpIHtcclxuXHRcdFx0XHRjYWNoZWRBdHRyc1thdHRyTmFtZV0gPSBkYXRhQXR0clxyXG5cdFx0XHRcdGlmIChhdHRyTmFtZSA9PT0gXCJjb25maWdcIikgY29udGludWVcclxuXHRcdFx0XHRlbHNlIGlmICh0eXBlb2YgZGF0YUF0dHIgPT0gXCJmdW5jdGlvblwiICYmIGF0dHJOYW1lLmluZGV4T2YoXCJvblwiKSA9PSAwKSB7XHJcblx0XHRcdFx0XHRub2RlW2F0dHJOYW1lXSA9IGF1dG9yZWRyYXcoZGF0YUF0dHIsIG5vZGUpXHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGVsc2UgaWYgKGF0dHJOYW1lID09PSBcInN0eWxlXCIgJiYgdHlwZW9mIGRhdGFBdHRyID09IFwib2JqZWN0XCIpIHtcclxuXHRcdFx0XHRcdGZvciAodmFyIHJ1bGUgaW4gZGF0YUF0dHIpIHtcclxuXHRcdFx0XHRcdFx0aWYgKGNhY2hlZEF0dHIgPT0gbnVsbCB8fCBjYWNoZWRBdHRyW3J1bGVdICE9PSBkYXRhQXR0cltydWxlXSkgbm9kZS5zdHlsZVtydWxlXSA9IGRhdGFBdHRyW3J1bGVdXHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRmb3IgKHZhciBydWxlIGluIGNhY2hlZEF0dHIpIHtcclxuXHRcdFx0XHRcdFx0aWYgKCEocnVsZSBpbiBkYXRhQXR0cikpIG5vZGUuc3R5bGVbcnVsZV0gPSBcIlwiXHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGVsc2UgaWYgKG5hbWVzcGFjZSAhPSBudWxsKSB7XHJcblx0XHRcdFx0XHRpZiAoYXR0ck5hbWUgPT09IFwiaHJlZlwiKSBub2RlLnNldEF0dHJpYnV0ZU5TKFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1wiLCBcImhyZWZcIiwgZGF0YUF0dHIpXHJcblx0XHRcdFx0XHRlbHNlIGlmIChhdHRyTmFtZSA9PT0gXCJjbGFzc05hbWVcIikgbm9kZS5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCBkYXRhQXR0cilcclxuXHRcdFx0XHRcdGVsc2Ugbm9kZS5zZXRBdHRyaWJ1dGUoYXR0ck5hbWUsIGRhdGFBdHRyKVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRlbHNlIGlmIChhdHRyTmFtZSA9PT0gXCJ2YWx1ZVwiICYmIHRhZyA9PT0gXCJpbnB1dFwiKSB7XHJcblx0XHRcdFx0XHRpZiAobm9kZS52YWx1ZSAhPT0gZGF0YUF0dHIpIG5vZGUudmFsdWUgPSBkYXRhQXR0clxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRlbHNlIGlmIChhdHRyTmFtZSBpbiBub2RlICYmICEoYXR0ck5hbWUgPT0gXCJsaXN0XCIgfHwgYXR0ck5hbWUgPT0gXCJzdHlsZVwiKSkge1xyXG5cdFx0XHRcdFx0bm9kZVthdHRyTmFtZV0gPSBkYXRhQXR0clxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRlbHNlIG5vZGUuc2V0QXR0cmlidXRlKGF0dHJOYW1lLCBkYXRhQXR0cilcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIGNhY2hlZEF0dHJzXHJcblx0fVxyXG5cdGZ1bmN0aW9uIGNsZWFyKG5vZGVzLCBjYWNoZWQpIHtcclxuXHRcdGZvciAodmFyIGkgPSBub2Rlcy5sZW5ndGggLSAxOyBpID4gLTE7IGktLSkge1xyXG5cdFx0XHRpZiAobm9kZXNbaV0gJiYgbm9kZXNbaV0ucGFyZW50Tm9kZSkge1xyXG5cdFx0XHRcdG5vZGVzW2ldLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQobm9kZXNbaV0pXHJcblx0XHRcdFx0Y2FjaGVkID0gW10uY29uY2F0KGNhY2hlZClcclxuXHRcdFx0XHRpZiAoY2FjaGVkW2ldKSB1bmxvYWQoY2FjaGVkW2ldKVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRpZiAobm9kZXMubGVuZ3RoICE9IDApIG5vZGVzLmxlbmd0aCA9IDBcclxuXHR9XHJcblx0ZnVuY3Rpb24gdW5sb2FkKGNhY2hlZCkge1xyXG5cdFx0aWYgKGNhY2hlZC5jb25maWdDb250ZXh0ICYmIHR5cGVvZiBjYWNoZWQuY29uZmlnQ29udGV4dC5vbnVubG9hZCA9PSBcImZ1bmN0aW9uXCIpIGNhY2hlZC5jb25maWdDb250ZXh0Lm9udW5sb2FkKClcclxuXHRcdGlmIChjYWNoZWQuY2hpbGRyZW4pIHtcclxuXHRcdFx0aWYgKHR5cGUuY2FsbChjYWNoZWQuY2hpbGRyZW4pID09IFwiW29iamVjdCBBcnJheV1cIikgZm9yICh2YXIgaSA9IDA7IGkgPCBjYWNoZWQuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHVubG9hZChjYWNoZWQuY2hpbGRyZW5baV0pXHJcblx0XHRcdGVsc2UgaWYgKGNhY2hlZC5jaGlsZHJlbi50YWcpIHVubG9hZChjYWNoZWQuY2hpbGRyZW4pXHJcblx0XHR9XHJcblx0fVxyXG5cdGZ1bmN0aW9uIGluamVjdEhUTUwocGFyZW50RWxlbWVudCwgaW5kZXgsIGRhdGEpIHtcclxuXHRcdHZhciBuZXh0U2libGluZyA9IHBhcmVudEVsZW1lbnQuY2hpbGROb2Rlc1tpbmRleF1cclxuXHRcdGlmIChuZXh0U2libGluZykge1xyXG5cdFx0XHR2YXIgaXNFbGVtZW50ID0gbmV4dFNpYmxpbmcubm9kZVR5cGUgIT0gMVxyXG5cdFx0XHR2YXIgcGxhY2Vob2xkZXIgPSB3aW5kb3cuZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIilcclxuXHRcdFx0aWYgKGlzRWxlbWVudCkge1xyXG5cdFx0XHRcdHBhcmVudEVsZW1lbnQuaW5zZXJ0QmVmb3JlKHBsYWNlaG9sZGVyLCBuZXh0U2libGluZylcclxuXHRcdFx0XHRwbGFjZWhvbGRlci5pbnNlcnRBZGphY2VudEhUTUwoXCJiZWZvcmViZWdpblwiLCBkYXRhKVxyXG5cdFx0XHRcdHBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQocGxhY2Vob2xkZXIpXHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZSBuZXh0U2libGluZy5pbnNlcnRBZGphY2VudEhUTUwoXCJiZWZvcmViZWdpblwiLCBkYXRhKVxyXG5cdFx0fVxyXG5cdFx0ZWxzZSBwYXJlbnRFbGVtZW50Lmluc2VydEFkamFjZW50SFRNTChcImJlZm9yZWVuZFwiLCBkYXRhKVxyXG5cdFx0dmFyIG5vZGVzID0gW11cclxuXHRcdHdoaWxlIChwYXJlbnRFbGVtZW50LmNoaWxkTm9kZXNbaW5kZXhdICE9PSBuZXh0U2libGluZykge1xyXG5cdFx0XHRub2Rlcy5wdXNoKHBhcmVudEVsZW1lbnQuY2hpbGROb2Rlc1tpbmRleF0pXHJcblx0XHRcdGluZGV4KytcclxuXHRcdH1cclxuXHRcdHJldHVybiBub2Rlc1xyXG5cdH1cclxuXHRmdW5jdGlvbiBmbGF0dGVuKGRhdGEpIHtcclxuXHRcdHZhciBmbGF0dGVuZWQgPSBbXVxyXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdHZhciBpdGVtID0gZGF0YVtpXVxyXG5cdFx0XHRpZiAodHlwZS5jYWxsKGl0ZW0pID09IFwiW29iamVjdCBBcnJheV1cIikgZmxhdHRlbmVkLnB1c2guYXBwbHkoZmxhdHRlbmVkLCBmbGF0dGVuKGl0ZW0pKVxyXG5cdFx0XHRlbHNlIGZsYXR0ZW5lZC5wdXNoKGl0ZW0pXHJcblx0XHR9XHJcblx0XHRyZXR1cm4gZmxhdHRlbmVkXHJcblx0fVxyXG5cdGZ1bmN0aW9uIGF1dG9yZWRyYXcoY2FsbGJhY2ssIG9iamVjdCwgZ3JvdXApIHtcclxuXHRcdHJldHVybiBmdW5jdGlvbihlKSB7XHJcblx0XHRcdGUgPSBlIHx8IGV2ZW50XHJcblx0XHRcdG0ucmVkcmF3LnN0cmF0ZWd5KFwiZGlmZlwiKVxyXG5cdFx0XHRtLnN0YXJ0Q29tcHV0YXRpb24oKVxyXG5cdFx0XHR0cnkge3JldHVybiBjYWxsYmFjay5jYWxsKG9iamVjdCwgZSl9XHJcblx0XHRcdGZpbmFsbHkge1xyXG5cdFx0XHRcdGlmICghbGFzdFJlZHJhd0lkKSBsYXN0UmVkcmF3SWQgPSAtMTtcclxuXHRcdFx0XHRtLmVuZENvbXB1dGF0aW9uKClcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0dmFyIGh0bWxcclxuXHR2YXIgZG9jdW1lbnROb2RlID0ge1xyXG5cdFx0aW5zZXJ0QWRqYWNlbnRIVE1MOiBmdW5jdGlvbihfLCBkYXRhKSB7XHJcblx0XHRcdHdpbmRvdy5kb2N1bWVudC53cml0ZShkYXRhKVxyXG5cdFx0XHR3aW5kb3cuZG9jdW1lbnQuY2xvc2UoKVxyXG5cdFx0fSxcclxuXHRcdGFwcGVuZENoaWxkOiBmdW5jdGlvbihub2RlKSB7XHJcblx0XHRcdGlmIChodG1sID09PSB1bmRlZmluZWQpIGh0bWwgPSB3aW5kb3cuZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImh0bWxcIilcclxuXHRcdFx0aWYgKG5vZGUubm9kZU5hbWUgPT0gXCJIVE1MXCIpIGh0bWwgPSBub2RlXHJcblx0XHRcdGVsc2UgaHRtbC5hcHBlbmRDaGlsZChub2RlKVxyXG5cdFx0XHRpZiAod2luZG93LmRvY3VtZW50LmRvY3VtZW50RWxlbWVudCAmJiB3aW5kb3cuZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICE9PSBodG1sKSB7XHJcblx0XHRcdFx0d2luZG93LmRvY3VtZW50LnJlcGxhY2VDaGlsZChodG1sLCB3aW5kb3cuZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KVxyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2Ugd2luZG93LmRvY3VtZW50LmFwcGVuZENoaWxkKGh0bWwpXHJcblx0XHR9LFxyXG5cdFx0aW5zZXJ0QmVmb3JlOiBmdW5jdGlvbihub2RlKSB7XHJcblx0XHRcdHRoaXMuYXBwZW5kQ2hpbGQobm9kZSlcclxuXHRcdH0sXHJcblx0XHRjaGlsZE5vZGVzOiBbXVxyXG5cdH1cclxuXHR2YXIgbm9kZUNhY2hlID0gW10sIGNlbGxDYWNoZSA9IHt9XHJcblx0bS5yZW5kZXIgPSBmdW5jdGlvbihyb290LCBjZWxsLCBmb3JjZVJlY3JlYXRpb24pIHtcclxuXHRcdHZhciBjb25maWdzID0gW11cclxuXHRcdGlmICghcm9vdCkgdGhyb3cgbmV3IEVycm9yKFwiUGxlYXNlIGVuc3VyZSB0aGUgRE9NIGVsZW1lbnQgZXhpc3RzIGJlZm9yZSByZW5kZXJpbmcgYSB0ZW1wbGF0ZSBpbnRvIGl0LlwiKVxyXG5cdFx0dmFyIGlkID0gZ2V0Q2VsbENhY2hlS2V5KHJvb3QpXHJcblx0XHR2YXIgbm9kZSA9IHJvb3QgPT0gd2luZG93LmRvY3VtZW50IHx8IHJvb3QgPT0gd2luZG93LmRvY3VtZW50LmRvY3VtZW50RWxlbWVudCA/IGRvY3VtZW50Tm9kZSA6IHJvb3RcclxuXHRcdGlmIChjZWxsQ2FjaGVbaWRdID09PSB1bmRlZmluZWQpIGNsZWFyKG5vZGUuY2hpbGROb2RlcylcclxuXHRcdGlmIChmb3JjZVJlY3JlYXRpb24gPT09IHRydWUpIHJlc2V0KHJvb3QpXHJcblx0XHRjZWxsQ2FjaGVbaWRdID0gYnVpbGQobm9kZSwgbnVsbCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIGNlbGwsIGNlbGxDYWNoZVtpZF0sIGZhbHNlLCAwLCBudWxsLCB1bmRlZmluZWQsIGNvbmZpZ3MpXHJcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGNvbmZpZ3MubGVuZ3RoOyBpKyspIGNvbmZpZ3NbaV0oKVxyXG5cdH1cclxuXHRmdW5jdGlvbiBnZXRDZWxsQ2FjaGVLZXkoZWxlbWVudCkge1xyXG5cdFx0dmFyIGluZGV4ID0gbm9kZUNhY2hlLmluZGV4T2YoZWxlbWVudClcclxuXHRcdHJldHVybiBpbmRleCA8IDAgPyBub2RlQ2FjaGUucHVzaChlbGVtZW50KSAtIDEgOiBpbmRleFxyXG5cdH1cclxuXHJcblx0bS50cnVzdCA9IGZ1bmN0aW9uKHZhbHVlKSB7XHJcblx0XHR2YWx1ZSA9IG5ldyBTdHJpbmcodmFsdWUpXHJcblx0XHR2YWx1ZS4kdHJ1c3RlZCA9IHRydWVcclxuXHRcdHJldHVybiB2YWx1ZVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gX3Byb3Aoc3RvcmUpIHtcclxuXHRcdHZhciBwcm9wID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdGlmIChhcmd1bWVudHMubGVuZ3RoKSBzdG9yZSA9IGFyZ3VtZW50c1swXVxyXG5cdFx0XHRyZXR1cm4gc3RvcmVcclxuXHRcdH1cclxuXHJcblx0XHRwcm9wLnRvSlNPTiA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRyZXR1cm4gc3RvcmVcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gcHJvcFxyXG5cdH1cclxuXHJcblx0bS5wcm9wID0gZnVuY3Rpb24gKHN0b3JlKSB7XHJcblx0XHRpZiAoKHR5cGVvZiBzdG9yZSA9PT0gJ29iamVjdCcgfHwgdHlwZW9mIHN0b3JlID09PSAnZnVuY3Rpb24nKSAmJlxyXG5cdFx0XHRcdHR5cGVvZiBzdG9yZS50aGVuID09PSAnZnVuY3Rpb24nKSB7XHJcblx0XHRcdHZhciBwcm9wID0gX3Byb3AoKVxyXG5cdFx0XHRuZXdQcm9taXNlZFByb3AocHJvcCwgc3RvcmUpLnRoZW4ocHJvcClcclxuXHJcblx0XHRcdHJldHVybiBwcm9wXHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIF9wcm9wKHN0b3JlKVxyXG5cdH1cclxuXHJcblx0dmFyIHJvb3RzID0gW10sIG1vZHVsZXMgPSBbXSwgY29udHJvbGxlcnMgPSBbXSwgbGFzdFJlZHJhd0lkID0gMCwgY29tcHV0ZVBvc3RSZWRyYXdIb29rID0gbnVsbCwgcHJldmVudGVkID0gZmFsc2VcclxuXHRtLm1vZHVsZSA9IGZ1bmN0aW9uKHJvb3QsIG1vZHVsZSkge1xyXG5cdFx0dmFyIGluZGV4ID0gcm9vdHMuaW5kZXhPZihyb290KVxyXG5cdFx0aWYgKGluZGV4IDwgMCkgaW5kZXggPSByb290cy5sZW5ndGhcclxuXHRcdHZhciBpc1ByZXZlbnRlZCA9IGZhbHNlXHJcblx0XHRpZiAoY29udHJvbGxlcnNbaW5kZXhdICYmIHR5cGVvZiBjb250cm9sbGVyc1tpbmRleF0ub251bmxvYWQgPT0gXCJmdW5jdGlvblwiKSB7XHJcblx0XHRcdHZhciBldmVudCA9IHtcclxuXHRcdFx0XHRwcmV2ZW50RGVmYXVsdDogZnVuY3Rpb24oKSB7aXNQcmV2ZW50ZWQgPSB0cnVlfVxyXG5cdFx0XHR9XHJcblx0XHRcdGNvbnRyb2xsZXJzW2luZGV4XS5vbnVubG9hZChldmVudClcclxuXHRcdH1cclxuXHRcdGlmICghaXNQcmV2ZW50ZWQpIHtcclxuXHRcdFx0bS5yZWRyYXcuc3RyYXRlZ3koXCJhbGxcIilcclxuXHRcdFx0bS5zdGFydENvbXB1dGF0aW9uKClcclxuXHRcdFx0cm9vdHNbaW5kZXhdID0gcm9vdFxyXG5cdFx0XHRtb2R1bGVzW2luZGV4XSA9IG1vZHVsZVxyXG5cdFx0XHRjb250cm9sbGVyc1tpbmRleF0gPSBuZXcgbW9kdWxlLmNvbnRyb2xsZXJcclxuXHRcdFx0bS5lbmRDb21wdXRhdGlvbigpXHJcblx0XHR9XHJcblx0fVxyXG5cdG0ucmVkcmF3ID0gZnVuY3Rpb24oZm9yY2UpIHtcclxuXHRcdHZhciBjYW5jZWwgPSB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUgfHwgd2luZG93LmNsZWFyVGltZW91dFxyXG5cdFx0dmFyIGRlZmVyID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCB3aW5kb3cuc2V0VGltZW91dFxyXG5cdFx0aWYgKGxhc3RSZWRyYXdJZCAmJiBmb3JjZSAhPT0gdHJ1ZSkge1xyXG5cdFx0XHRjYW5jZWwobGFzdFJlZHJhd0lkKVxyXG5cdFx0XHRsYXN0UmVkcmF3SWQgPSBkZWZlcihyZWRyYXcsIDApXHJcblx0XHR9XHJcblx0XHRlbHNlIHtcclxuXHRcdFx0cmVkcmF3KClcclxuXHRcdFx0bGFzdFJlZHJhd0lkID0gZGVmZXIoZnVuY3Rpb24oKSB7bGFzdFJlZHJhd0lkID0gbnVsbH0sIDApXHJcblx0XHR9XHJcblx0fVxyXG5cdG0ucmVkcmF3LnN0cmF0ZWd5ID0gbS5wcm9wKClcclxuXHRmdW5jdGlvbiByZWRyYXcoKSB7XHJcblx0XHR2YXIgbW9kZSA9IG0ucmVkcmF3LnN0cmF0ZWd5KClcclxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcm9vdHMubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0aWYgKGNvbnRyb2xsZXJzW2ldICYmIG1vZGUgIT0gXCJub25lXCIpIG0ucmVuZGVyKHJvb3RzW2ldLCBtb2R1bGVzW2ldLnZpZXcoY29udHJvbGxlcnNbaV0pLCBtb2RlID09IFwiYWxsXCIpXHJcblx0XHR9XHJcblx0XHRpZiAoY29tcHV0ZVBvc3RSZWRyYXdIb29rKSB7XHJcblx0XHRcdGNvbXB1dGVQb3N0UmVkcmF3SG9vaygpXHJcblx0XHRcdGNvbXB1dGVQb3N0UmVkcmF3SG9vayA9IG51bGxcclxuXHRcdH1cclxuXHRcdGxhc3RSZWRyYXdJZCA9IG51bGxcclxuXHRcdG0ucmVkcmF3LnN0cmF0ZWd5KFwiZGlmZlwiKVxyXG5cdH1cclxuXHJcblx0dmFyIHBlbmRpbmdSZXF1ZXN0cyA9IDBcclxuXHRtLnN0YXJ0Q29tcHV0YXRpb24gPSBmdW5jdGlvbigpIHtwZW5kaW5nUmVxdWVzdHMrK31cclxuXHRtLmVuZENvbXB1dGF0aW9uID0gZnVuY3Rpb24oKSB7XHJcblx0XHRwZW5kaW5nUmVxdWVzdHMgPSBNYXRoLm1heChwZW5kaW5nUmVxdWVzdHMgLSAxLCAwKVxyXG5cdFx0aWYgKHBlbmRpbmdSZXF1ZXN0cyA9PSAwKSBtLnJlZHJhdygpXHJcblx0fVxyXG5cclxuXHRtLndpdGhBdHRyID0gZnVuY3Rpb24ocHJvcCwgd2l0aEF0dHJDYWxsYmFjaykge1xyXG5cdFx0cmV0dXJuIGZ1bmN0aW9uKGUpIHtcclxuXHRcdFx0ZSA9IGUgfHwgZXZlbnRcclxuXHRcdFx0dmFyIGN1cnJlbnRUYXJnZXQgPSBlLmN1cnJlbnRUYXJnZXQgfHwgdGhpc1xyXG5cdFx0XHR3aXRoQXR0ckNhbGxiYWNrKHByb3AgaW4gY3VycmVudFRhcmdldCA/IGN1cnJlbnRUYXJnZXRbcHJvcF0gOiBjdXJyZW50VGFyZ2V0LmdldEF0dHJpYnV0ZShwcm9wKSlcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8vcm91dGluZ1xyXG5cdHZhciBtb2RlcyA9IHtwYXRobmFtZTogXCJcIiwgaGFzaDogXCIjXCIsIHNlYXJjaDogXCI/XCJ9XHJcblx0dmFyIHJlZGlyZWN0ID0gZnVuY3Rpb24oKSB7fSwgcm91dGVQYXJhbXMgPSB7fSwgY3VycmVudFJvdXRlXHJcblx0bS5yb3V0ZSA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHJldHVybiBjdXJyZW50Um91dGVcclxuXHRcdGVsc2UgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDMgJiYgdHlwZW9mIGFyZ3VtZW50c1sxXSA9PSBcInN0cmluZ1wiKSB7XHJcblx0XHRcdHZhciByb290ID0gYXJndW1lbnRzWzBdLCBkZWZhdWx0Um91dGUgPSBhcmd1bWVudHNbMV0sIHJvdXRlciA9IGFyZ3VtZW50c1syXVxyXG5cdFx0XHRyZWRpcmVjdCA9IGZ1bmN0aW9uKHNvdXJjZSkge1xyXG5cdFx0XHRcdHZhciBwYXRoID0gY3VycmVudFJvdXRlID0gbm9ybWFsaXplUm91dGUoc291cmNlKVxyXG5cdFx0XHRcdGlmICghcm91dGVCeVZhbHVlKHJvb3QsIHJvdXRlciwgcGF0aCkpIHtcclxuXHRcdFx0XHRcdG0ucm91dGUoZGVmYXVsdFJvdXRlLCB0cnVlKVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHR2YXIgbGlzdGVuZXIgPSBtLnJvdXRlLm1vZGUgPT0gXCJoYXNoXCIgPyBcIm9uaGFzaGNoYW5nZVwiIDogXCJvbnBvcHN0YXRlXCJcclxuXHRcdFx0d2luZG93W2xpc3RlbmVyXSA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdGlmIChjdXJyZW50Um91dGUgIT0gbm9ybWFsaXplUm91dGUod2luZG93LmxvY2F0aW9uW20ucm91dGUubW9kZV0pKSB7XHJcblx0XHRcdFx0XHRyZWRpcmVjdCh3aW5kb3cubG9jYXRpb25bbS5yb3V0ZS5tb2RlXSlcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0Y29tcHV0ZVBvc3RSZWRyYXdIb29rID0gc2V0U2Nyb2xsXHJcblx0XHRcdHdpbmRvd1tsaXN0ZW5lcl0oKVxyXG5cdFx0fVxyXG5cdFx0ZWxzZSBpZiAoYXJndW1lbnRzWzBdLmFkZEV2ZW50TGlzdGVuZXIpIHtcclxuXHRcdFx0dmFyIGVsZW1lbnQgPSBhcmd1bWVudHNbMF1cclxuXHRcdFx0dmFyIGlzSW5pdGlhbGl6ZWQgPSBhcmd1bWVudHNbMV1cclxuXHRcdFx0aWYgKGVsZW1lbnQuaHJlZi5pbmRleE9mKG1vZGVzW20ucm91dGUubW9kZV0pIDwgMCkge1xyXG5cdFx0XHRcdGVsZW1lbnQuaHJlZiA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSArIG1vZGVzW20ucm91dGUubW9kZV0gKyBlbGVtZW50LnBhdGhuYW1lXHJcblx0XHRcdH1cclxuXHRcdFx0aWYgKCFpc0luaXRpYWxpemVkKSB7XHJcblx0XHRcdFx0ZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgcm91dGVVbm9idHJ1c2l2ZSlcclxuXHRcdFx0XHRlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCByb3V0ZVVub2J0cnVzaXZlKVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRlbHNlIGlmICh0eXBlb2YgYXJndW1lbnRzWzBdID09IFwic3RyaW5nXCIpIHtcclxuXHRcdFx0Y3VycmVudFJvdXRlID0gYXJndW1lbnRzWzBdXHJcblx0XHRcdHZhciBxdWVyeXN0cmluZyA9IHR5cGVvZiBhcmd1bWVudHNbMV0gPT0gXCJvYmplY3RcIiA/IGJ1aWxkUXVlcnlTdHJpbmcoYXJndW1lbnRzWzFdKSA6IG51bGxcclxuXHRcdFx0aWYgKHF1ZXJ5c3RyaW5nKSBjdXJyZW50Um91dGUgKz0gKGN1cnJlbnRSb3V0ZS5pbmRleE9mKFwiP1wiKSA9PT0gLTEgPyBcIj9cIiA6IFwiJlwiKSArIHF1ZXJ5c3RyaW5nXHJcblxyXG5cdFx0XHR2YXIgc2hvdWxkUmVwbGFjZUhpc3RvcnlFbnRyeSA9IChhcmd1bWVudHMubGVuZ3RoID09IDMgPyBhcmd1bWVudHNbMl0gOiBhcmd1bWVudHNbMV0pID09PSB0cnVlXHJcblxyXG5cdFx0XHRpZiAod2luZG93Lmhpc3RvcnkucHVzaFN0YXRlKSB7XHJcblx0XHRcdFx0Y29tcHV0ZVBvc3RSZWRyYXdIb29rID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHR3aW5kb3cuaGlzdG9yeVtzaG91bGRSZXBsYWNlSGlzdG9yeUVudHJ5ID8gXCJyZXBsYWNlU3RhdGVcIiA6IFwicHVzaFN0YXRlXCJdKG51bGwsIHdpbmRvdy5kb2N1bWVudC50aXRsZSwgbW9kZXNbbS5yb3V0ZS5tb2RlXSArIGN1cnJlbnRSb3V0ZSlcclxuXHRcdFx0XHRcdHNldFNjcm9sbCgpXHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdHJlZGlyZWN0KG1vZGVzW20ucm91dGUubW9kZV0gKyBjdXJyZW50Um91dGUpXHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZSB3aW5kb3cubG9jYXRpb25bbS5yb3V0ZS5tb2RlXSA9IGN1cnJlbnRSb3V0ZVxyXG5cdFx0fVxyXG5cdH1cclxuXHRtLnJvdXRlLnBhcmFtID0gZnVuY3Rpb24oa2V5KSB7cmV0dXJuIHJvdXRlUGFyYW1zW2tleV19XHJcblx0bS5yb3V0ZS5tb2RlID0gXCJzZWFyY2hcIlxyXG5cdGZ1bmN0aW9uIG5vcm1hbGl6ZVJvdXRlKHJvdXRlKSB7cmV0dXJuIHJvdXRlLnNsaWNlKG1vZGVzW20ucm91dGUubW9kZV0ubGVuZ3RoKX1cclxuXHRmdW5jdGlvbiByb3V0ZUJ5VmFsdWUocm9vdCwgcm91dGVyLCBwYXRoKSB7XHJcblx0XHRyb3V0ZVBhcmFtcyA9IHt9XHJcblxyXG5cdFx0dmFyIHF1ZXJ5U3RhcnQgPSBwYXRoLmluZGV4T2YoXCI/XCIpXHJcblx0XHRpZiAocXVlcnlTdGFydCAhPT0gLTEpIHtcclxuXHRcdFx0cm91dGVQYXJhbXMgPSBwYXJzZVF1ZXJ5U3RyaW5nKHBhdGguc3Vic3RyKHF1ZXJ5U3RhcnQgKyAxLCBwYXRoLmxlbmd0aCkpXHJcblx0XHRcdHBhdGggPSBwYXRoLnN1YnN0cigwLCBxdWVyeVN0YXJ0KVxyXG5cdFx0fVxyXG5cclxuXHRcdGZvciAodmFyIHJvdXRlIGluIHJvdXRlcikge1xyXG5cdFx0XHRpZiAocm91dGUgPT0gcGF0aCkge1xyXG5cdFx0XHRcdG0ubW9kdWxlKHJvb3QsIHJvdXRlcltyb3V0ZV0pXHJcblx0XHRcdFx0cmV0dXJuIHRydWVcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dmFyIG1hdGNoZXIgPSBuZXcgUmVnRXhwKFwiXlwiICsgcm91dGUucmVwbGFjZSgvOlteXFwvXSs/XFwuezN9L2csIFwiKC4qPylcIikucmVwbGFjZSgvOlteXFwvXSsvZywgXCIoW15cXFxcL10rKVwiKSArIFwiXFwvPyRcIilcclxuXHJcblx0XHRcdGlmIChtYXRjaGVyLnRlc3QocGF0aCkpIHtcclxuXHRcdFx0XHRwYXRoLnJlcGxhY2UobWF0Y2hlciwgZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHR2YXIga2V5cyA9IHJvdXRlLm1hdGNoKC86W15cXC9dKy9nKSB8fCBbXVxyXG5cdFx0XHRcdFx0dmFyIHZhbHVlcyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxLCAtMilcclxuXHRcdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykgcm91dGVQYXJhbXNba2V5c1tpXS5yZXBsYWNlKC86fFxcLi9nLCBcIlwiKV0gPSBkZWNvZGVVUklDb21wb25lbnQodmFsdWVzW2ldKVxyXG5cdFx0XHRcdFx0bS5tb2R1bGUocm9vdCwgcm91dGVyW3JvdXRlXSlcclxuXHRcdFx0XHR9KVxyXG5cdFx0XHRcdHJldHVybiB0cnVlXHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblx0ZnVuY3Rpb24gcm91dGVVbm9idHJ1c2l2ZShlKSB7XHJcblx0XHRlID0gZSB8fCBldmVudFxyXG5cdFx0aWYgKGUuY3RybEtleSB8fCBlLm1ldGFLZXkgfHwgZS53aGljaCA9PSAyKSByZXR1cm5cclxuXHRcdGUucHJldmVudERlZmF1bHQoKVxyXG5cdFx0bS5yb3V0ZShlLmN1cnJlbnRUYXJnZXRbbS5yb3V0ZS5tb2RlXS5zbGljZShtb2Rlc1ttLnJvdXRlLm1vZGVdLmxlbmd0aCkpXHJcblx0fVxyXG5cdGZ1bmN0aW9uIHNldFNjcm9sbCgpIHtcclxuXHRcdGlmIChtLnJvdXRlLm1vZGUgIT0gXCJoYXNoXCIgJiYgd2luZG93LmxvY2F0aW9uLmhhc2gpIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2hcclxuXHRcdGVsc2Ugd2luZG93LnNjcm9sbFRvKDAsIDApXHJcblx0fVxyXG5cdGZ1bmN0aW9uIGJ1aWxkUXVlcnlTdHJpbmcob2JqZWN0LCBwcmVmaXgpIHtcclxuXHRcdHZhciBzdHIgPSBbXVxyXG5cdFx0Zm9yKHZhciBwcm9wIGluIG9iamVjdCkge1xyXG5cdFx0XHR2YXIga2V5ID0gcHJlZml4ID8gcHJlZml4ICsgXCJbXCIgKyBwcm9wICsgXCJdXCIgOiBwcm9wLCB2YWx1ZSA9IG9iamVjdFtwcm9wXVxyXG5cdFx0XHRzdHIucHVzaCh0eXBlb2YgdmFsdWUgPT0gXCJvYmplY3RcIiA/IGJ1aWxkUXVlcnlTdHJpbmcodmFsdWUsIGtleSkgOiBlbmNvZGVVUklDb21wb25lbnQoa2V5KSArIFwiPVwiICsgZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlKSlcclxuXHRcdH1cclxuXHRcdHJldHVybiBzdHIuam9pbihcIiZcIilcclxuXHR9XHJcblx0ZnVuY3Rpb24gcGFyc2VRdWVyeVN0cmluZyhzdHIpIHtcclxuXHRcdHZhciBwYWlycyA9IHN0ci5zcGxpdChcIiZcIiksIHBhcmFtcyA9IHt9XHJcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHBhaXJzLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdHZhciBwYWlyID0gcGFpcnNbaV0uc3BsaXQoXCI9XCIpXHJcblx0XHRcdHBhcmFtc1tkZWNvZGVTcGFjZShwYWlyWzBdKV0gPSBwYWlyWzFdID8gZGVjb2RlU3BhY2UocGFpclsxXSkgOiAocGFpci5sZW5ndGggPT09IDEgPyB0cnVlIDogXCJcIilcclxuXHRcdH1cclxuXHRcdHJldHVybiBwYXJhbXNcclxuXHR9XHJcblx0ZnVuY3Rpb24gZGVjb2RlU3BhY2Uoc3RyaW5nKSB7XHJcblx0XHRyZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KHN0cmluZy5yZXBsYWNlKC9cXCsvZywgXCIgXCIpKVxyXG5cdH1cclxuXHRmdW5jdGlvbiByZXNldChyb290KSB7XHJcblx0XHR2YXIgY2FjaGVLZXkgPSBnZXRDZWxsQ2FjaGVLZXkocm9vdClcclxuXHRcdGNsZWFyKHJvb3QuY2hpbGROb2RlcywgY2VsbENhY2hlW2NhY2hlS2V5XSlcclxuXHRcdGNlbGxDYWNoZVtjYWNoZUtleV0gPSB1bmRlZmluZWRcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIG5ld1Byb21pc2VkUHJvcChwcm9wLCBwcm9taXNlKSB7XHJcblx0XHRwcm9wLnRoZW4gPSBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdHZhciBuZXdQcm9wID0gbS5wcm9wKClcclxuXHRcdFx0cmV0dXJuIG5ld1Byb21pc2VkUHJvcChuZXdQcm9wLFxyXG5cdFx0XHRcdHByb21pc2UudGhlbi5hcHBseShwcm9taXNlLCBhcmd1bWVudHMpLnRoZW4obmV3UHJvcCkpXHJcblx0XHR9XHJcblx0XHRwcm9wLnByb21pc2UgPSBwcm9wXHJcblx0XHRwcm9wLnJlc29sdmUgPSBmdW5jdGlvbiAodmFsKSB7XHJcblx0XHRcdHByb3AodmFsKVxyXG5cdFx0XHRwcm9taXNlID0gcHJvbWlzZS5yZXNvbHZlLmFwcGx5KHByb21pc2UsIGFyZ3VtZW50cylcclxuXHRcdFx0cmV0dXJuIHByb3BcclxuXHRcdH1cclxuXHRcdHByb3AucmVqZWN0ID0gZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRwcm9taXNlID0gcHJvbWlzZS5yZWplY3QuYXBwbHkocHJvbWlzZSwgYXJndW1lbnRzKVxyXG5cdFx0XHRyZXR1cm4gcHJvcFxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBwcm9wXHJcblx0fVxyXG5cdG0uZGVmZXJyZWQgPSBmdW5jdGlvbiAoKSB7XHJcblx0XHRyZXR1cm4gbmV3UHJvbWlzZWRQcm9wKG0ucHJvcCgpLCBuZXcgRGVmZXJyZWQoKSlcclxuXHR9XHJcblx0Ly8gUHJvbWl6Lm1pdGhyaWwuanMgfCBab2xtZWlzdGVyIHwgTUlUXHJcblx0ZnVuY3Rpb24gRGVmZXJyZWQoZm4sIGVyKSB7XHJcblx0XHQvLyBzdGF0ZXNcclxuXHRcdC8vIDA6IHBlbmRpbmdcclxuXHRcdC8vIDE6IHJlc29sdmluZ1xyXG5cdFx0Ly8gMjogcmVqZWN0aW5nXHJcblx0XHQvLyAzOiByZXNvbHZlZFxyXG5cdFx0Ly8gNDogcmVqZWN0ZWRcclxuXHRcdHZhciBzZWxmID0gdGhpcyxcclxuXHRcdFx0c3RhdGUgPSAwLFxyXG5cdFx0XHR2YWwgPSAwLFxyXG5cdFx0XHRuZXh0ID0gW107XHJcblxyXG5cdFx0c2VsZlsncHJvbWlzZSddID0gc2VsZlxyXG5cclxuXHRcdHNlbGZbJ3Jlc29sdmUnXSA9IGZ1bmN0aW9uICh2KSB7XHJcblx0XHRcdGlmICghc3RhdGUpIHtcclxuXHRcdFx0XHR2YWwgPSB2XHJcblx0XHRcdFx0c3RhdGUgPSAxXHJcblxyXG5cdFx0XHRcdGZpcmUoKVxyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiB0aGlzXHJcblx0XHR9XHJcblxyXG5cdFx0c2VsZlsncmVqZWN0J10gPSBmdW5jdGlvbiAodikge1xyXG5cdFx0XHRpZiAoIXN0YXRlKSB7XHJcblx0XHRcdFx0dmFsID0gdlxyXG5cdFx0XHRcdHN0YXRlID0gMlxyXG5cclxuXHRcdFx0XHRmaXJlKClcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gdGhpc1xyXG5cdFx0fVxyXG5cclxuXHRcdHNlbGZbJ3RoZW4nXSA9IGZ1bmN0aW9uIChmbiwgZXIpIHtcclxuXHRcdFx0dmFyIGQgPSBuZXcgRGVmZXJyZWQoZm4sIGVyKVxyXG5cdFx0XHRpZiAoc3RhdGUgPT0gMykge1xyXG5cdFx0XHRcdGQucmVzb2x2ZSh2YWwpXHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZSBpZiAoc3RhdGUgPT0gNCkge1xyXG5cdFx0XHRcdGQucmVqZWN0KHZhbClcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNlIHtcclxuXHRcdFx0XHRuZXh0LnB1c2goZClcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gZFxyXG5cdFx0fVxyXG5cclxuXHRcdHZhciBmaW5pc2ggPSBmdW5jdGlvbiAodHlwZSkge1xyXG5cdFx0XHRzdGF0ZSA9IHR5cGUgfHwgNFxyXG5cdFx0XHRuZXh0Lm1hcChmdW5jdGlvbiAocCkge1xyXG5cdFx0XHRcdHN0YXRlID09IDMgJiYgcC5yZXNvbHZlKHZhbCkgfHwgcC5yZWplY3QodmFsKVxyXG5cdFx0XHR9KVxyXG5cdFx0fVxyXG5cclxuXHRcdC8vIHJlZiA6IHJlZmVyZW5jZSB0byAndGhlbicgZnVuY3Rpb25cclxuXHRcdC8vIGNiLCBlYywgY24gOiBzdWNjZXNzQ2FsbGJhY2ssIGZhaWx1cmVDYWxsYmFjaywgbm90VGhlbm5hYmxlQ2FsbGJhY2tcclxuXHRcdGZ1bmN0aW9uIHRoZW5uYWJsZSAocmVmLCBjYiwgZWMsIGNuKSB7XHJcblx0XHRcdGlmICgodHlwZW9mIHZhbCA9PSAnb2JqZWN0JyB8fCB0eXBlb2YgdmFsID09ICdmdW5jdGlvbicpICYmIHR5cGVvZiByZWYgPT0gJ2Z1bmN0aW9uJykge1xyXG5cdFx0XHRcdHRyeSB7XHJcblxyXG5cdFx0XHRcdFx0Ly8gY250IHByb3RlY3RzIGFnYWluc3QgYWJ1c2UgY2FsbHMgZnJvbSBzcGVjIGNoZWNrZXJcclxuXHRcdFx0XHRcdHZhciBjbnQgPSAwXHJcblx0XHRcdFx0XHRyZWYuY2FsbCh2YWwsIGZ1bmN0aW9uICh2KSB7XHJcblx0XHRcdFx0XHRcdGlmIChjbnQrKykgcmV0dXJuXHJcblx0XHRcdFx0XHRcdHZhbCA9IHZcclxuXHRcdFx0XHRcdFx0Y2IoKVxyXG5cdFx0XHRcdFx0fSwgZnVuY3Rpb24gKHYpIHtcclxuXHRcdFx0XHRcdFx0aWYgKGNudCsrKSByZXR1cm5cclxuXHRcdFx0XHRcdFx0dmFsID0gdlxyXG5cdFx0XHRcdFx0XHRlYygpXHJcblx0XHRcdFx0XHR9KVxyXG5cdFx0XHRcdH0gY2F0Y2ggKGUpIHtcclxuXHRcdFx0XHRcdHZhbCA9IGVcclxuXHRcdFx0XHRcdGVjKClcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0Y24oKVxyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cclxuXHRcdGZ1bmN0aW9uIGZpcmUoKSB7XHJcblxyXG5cdFx0XHQvLyBjaGVjayBpZiBpdCdzIGEgdGhlbmFibGVcclxuXHRcdFx0dmFyIHJlZjtcclxuXHRcdFx0dHJ5IHtcclxuXHRcdFx0XHRyZWYgPSB2YWwgJiYgdmFsLnRoZW5cclxuXHRcdFx0fSBjYXRjaCAoZSkge1xyXG5cdFx0XHRcdHZhbCA9IGVcclxuXHRcdFx0XHRzdGF0ZSA9IDJcclxuXHRcdFx0XHRyZXR1cm4gZmlyZSgpXHJcblx0XHRcdH1cclxuXHRcdFx0dGhlbm5hYmxlKHJlZiwgZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdHN0YXRlID0gMVxyXG5cdFx0XHRcdGZpcmUoKVxyXG5cdFx0XHR9LCBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0c3RhdGUgPSAyXHJcblx0XHRcdFx0ZmlyZSgpXHJcblx0XHRcdH0sIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0XHR0cnkge1xyXG5cdFx0XHRcdFx0aWYgKHN0YXRlID09IDEgJiYgdHlwZW9mIGZuID09ICdmdW5jdGlvbicpIHtcclxuXHRcdFx0XHRcdFx0dmFsID0gZm4odmFsKVxyXG5cdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdGVsc2UgaWYgKHN0YXRlID09IDIgJiYgdHlwZW9mIGVyID09ICdmdW5jdGlvbicpIHtcclxuXHRcdFx0XHRcdFx0dmFsID0gZXIodmFsKVxyXG5cdFx0XHRcdFx0XHRzdGF0ZSA9IDFcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9IGNhdGNoIChlKSB7XHJcblx0XHRcdFx0XHR2YWwgPSBlXHJcblx0XHRcdFx0XHRyZXR1cm4gZmluaXNoKClcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGlmICh2YWwgPT0gc2VsZikge1xyXG5cdFx0XHRcdFx0dmFsID0gVHlwZUVycm9yKClcclxuXHRcdFx0XHRcdGZpbmlzaCgpXHJcblx0XHRcdFx0fSBlbHNlIHRoZW5uYWJsZShyZWYsIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0XHRcdFx0ZmluaXNoKDMpXHJcblx0XHRcdFx0XHR9LCBmaW5pc2gsIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0XHRcdFx0ZmluaXNoKHN0YXRlID09IDEgJiYgMylcclxuXHRcdFx0XHRcdH0pXHJcblxyXG5cdFx0XHR9KVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0bS5zeW5jID0gZnVuY3Rpb24oYXJncykge1xyXG5cdFx0dmFyIG1ldGhvZCA9IFwicmVzb2x2ZVwiXHJcblx0XHRmdW5jdGlvbiBzeW5jaHJvbml6ZXIocG9zLCByZXNvbHZlZCkge1xyXG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24odmFsdWUpIHtcclxuXHRcdFx0XHRyZXN1bHRzW3Bvc10gPSB2YWx1ZVxyXG5cdFx0XHRcdGlmICghcmVzb2x2ZWQpIG1ldGhvZCA9IFwicmVqZWN0XCJcclxuXHRcdFx0XHRpZiAoLS1vdXRzdGFuZGluZyA9PSAwKSB7XHJcblx0XHRcdFx0XHRkZWZlcnJlZC5wcm9taXNlKHJlc3VsdHMpXHJcblx0XHRcdFx0XHRkZWZlcnJlZFttZXRob2RdKHJlc3VsdHMpXHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdHJldHVybiB2YWx1ZVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0dmFyIGRlZmVycmVkID0gbS5kZWZlcnJlZCgpXHJcblx0XHR2YXIgb3V0c3RhbmRpbmcgPSBhcmdzLmxlbmd0aFxyXG5cdFx0dmFyIHJlc3VsdHMgPSBuZXcgQXJyYXkob3V0c3RhbmRpbmcpXHJcblx0XHRpZiAoYXJncy5sZW5ndGggPiAwKSB7XHJcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdGFyZ3NbaV0udGhlbihzeW5jaHJvbml6ZXIoaSwgdHJ1ZSksIHN5bmNocm9uaXplcihpLCBmYWxzZSkpXHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdGVsc2UgZGVmZXJyZWQucmVzb2x2ZSgpXHJcblxyXG5cdFx0cmV0dXJuIGRlZmVycmVkLnByb21pc2VcclxuXHR9XHJcblx0ZnVuY3Rpb24gaWRlbnRpdHkodmFsdWUpIHtyZXR1cm4gdmFsdWV9XHJcblxyXG5cdGZ1bmN0aW9uIGFqYXgob3B0aW9ucykge1xyXG5cdFx0dmFyIHhociA9IG5ldyB3aW5kb3cuWE1MSHR0cFJlcXVlc3RcclxuXHRcdHhoci5vcGVuKG9wdGlvbnMubWV0aG9kLCBvcHRpb25zLnVybCwgdHJ1ZSwgb3B0aW9ucy51c2VyLCBvcHRpb25zLnBhc3N3b3JkKVxyXG5cdFx0eGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRpZiAoeGhyLnJlYWR5U3RhdGUgPT09IDQpIHtcclxuXHRcdFx0XHRpZiAoeGhyLnN0YXR1cyA+PSAyMDAgJiYgeGhyLnN0YXR1cyA8IDMwMCkgb3B0aW9ucy5vbmxvYWQoe3R5cGU6IFwibG9hZFwiLCB0YXJnZXQ6IHhocn0pXHJcblx0XHRcdFx0ZWxzZSBvcHRpb25zLm9uZXJyb3Ioe3R5cGU6IFwiZXJyb3JcIiwgdGFyZ2V0OiB4aHJ9KVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRpZiAob3B0aW9ucy5zZXJpYWxpemUgPT0gSlNPTi5zdHJpbmdpZnkgJiYgb3B0aW9ucy5tZXRob2QgIT0gXCJHRVRcIikge1xyXG5cdFx0XHR4aHIuc2V0UmVxdWVzdEhlYWRlcihcIkNvbnRlbnQtVHlwZVwiLCBcImFwcGxpY2F0aW9uL2pzb247IGNoYXJzZXQ9dXRmLThcIik7XHJcblx0XHR9XHJcblx0XHRpZiAodHlwZW9mIG9wdGlvbnMuY29uZmlnID09IFwiZnVuY3Rpb25cIikge1xyXG5cdFx0XHR2YXIgbWF5YmVYaHIgPSBvcHRpb25zLmNvbmZpZyh4aHIsIG9wdGlvbnMpXHJcblx0XHRcdGlmIChtYXliZVhociAhPSBudWxsKSB4aHIgPSBtYXliZVhoclxyXG5cdFx0fVxyXG5cdFx0eGhyLnNlbmQob3B0aW9ucy5tZXRob2QgPT0gXCJHRVRcIiA/IFwiXCIgOiBvcHRpb25zLmRhdGEpXHJcblx0XHRyZXR1cm4geGhyXHJcblx0fVxyXG5cdGZ1bmN0aW9uIGJpbmREYXRhKHhock9wdGlvbnMsIGRhdGEsIHNlcmlhbGl6ZSkge1xyXG5cdFx0aWYgKGRhdGEgJiYgT2JqZWN0LmtleXMoZGF0YSkubGVuZ3RoID4gMCkge1xyXG5cdFx0XHRpZiAoeGhyT3B0aW9ucy5tZXRob2QgPT0gXCJHRVRcIikge1xyXG5cdFx0XHRcdHhock9wdGlvbnMudXJsID0geGhyT3B0aW9ucy51cmwgKyAoeGhyT3B0aW9ucy51cmwuaW5kZXhPZihcIj9cIikgPCAwID8gXCI/XCIgOiBcIiZcIikgKyBidWlsZFF1ZXJ5U3RyaW5nKGRhdGEpXHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZSB4aHJPcHRpb25zLmRhdGEgPSBzZXJpYWxpemUoZGF0YSlcclxuXHRcdH1cclxuXHRcdHJldHVybiB4aHJPcHRpb25zXHJcblx0fVxyXG5cdGZ1bmN0aW9uIHBhcmFtZXRlcml6ZVVybCh1cmwsIGRhdGEpIHtcclxuXHRcdHZhciB0b2tlbnMgPSB1cmwubWF0Y2goLzpbYS16XVxcdysvZ2kpXHJcblx0XHRpZiAodG9rZW5zICYmIGRhdGEpIHtcclxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0b2tlbnMubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHR2YXIga2V5ID0gdG9rZW5zW2ldLnNsaWNlKDEpXHJcblx0XHRcdFx0dXJsID0gdXJsLnJlcGxhY2UodG9rZW5zW2ldLCBkYXRhW2tleV0pXHJcblx0XHRcdFx0ZGVsZXRlIGRhdGFba2V5XVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdXJsXHJcblx0fVxyXG5cclxuXHRtLnJlcXVlc3QgPSBmdW5jdGlvbih4aHJPcHRpb25zKSB7XHJcblx0XHRpZiAoeGhyT3B0aW9ucy5iYWNrZ3JvdW5kICE9PSB0cnVlKSBtLnN0YXJ0Q29tcHV0YXRpb24oKVxyXG5cdFx0dmFyIGRlZmVycmVkID0gbS5kZWZlcnJlZCgpXHJcblx0XHR2YXIgc2VyaWFsaXplID0geGhyT3B0aW9ucy5zZXJpYWxpemUgPSB4aHJPcHRpb25zLnNlcmlhbGl6ZSB8fCBKU09OLnN0cmluZ2lmeVxyXG5cdFx0dmFyIGRlc2VyaWFsaXplID0geGhyT3B0aW9ucy5kZXNlcmlhbGl6ZSA9IHhock9wdGlvbnMuZGVzZXJpYWxpemUgfHwgSlNPTi5wYXJzZVxyXG5cdFx0dmFyIGV4dHJhY3QgPSB4aHJPcHRpb25zLmV4dHJhY3QgfHwgZnVuY3Rpb24oeGhyKSB7XHJcblx0XHRcdHJldHVybiB4aHIucmVzcG9uc2VUZXh0Lmxlbmd0aCA9PT0gMCAmJiBkZXNlcmlhbGl6ZSA9PT0gSlNPTi5wYXJzZSA/IG51bGwgOiB4aHIucmVzcG9uc2VUZXh0XHJcblx0XHR9XHJcblx0XHR4aHJPcHRpb25zLnVybCA9IHBhcmFtZXRlcml6ZVVybCh4aHJPcHRpb25zLnVybCwgeGhyT3B0aW9ucy5kYXRhKVxyXG5cdFx0eGhyT3B0aW9ucyA9IGJpbmREYXRhKHhock9wdGlvbnMsIHhock9wdGlvbnMuZGF0YSwgc2VyaWFsaXplKVxyXG5cdFx0eGhyT3B0aW9ucy5vbmxvYWQgPSB4aHJPcHRpb25zLm9uZXJyb3IgPSBmdW5jdGlvbihlKSB7XHJcblx0XHRcdHRyeSB7XHJcblx0XHRcdFx0ZSA9IGUgfHwgZXZlbnRcclxuXHRcdFx0XHR2YXIgdW53cmFwID0gKGUudHlwZSA9PSBcImxvYWRcIiA/IHhock9wdGlvbnMudW53cmFwU3VjY2VzcyA6IHhock9wdGlvbnMudW53cmFwRXJyb3IpIHx8IGlkZW50aXR5XHJcblx0XHRcdFx0dmFyIHJlc3BvbnNlID0gdW53cmFwKGRlc2VyaWFsaXplKGV4dHJhY3QoZS50YXJnZXQsIHhock9wdGlvbnMpKSlcclxuXHRcdFx0XHRpZiAoZS50eXBlID09IFwibG9hZFwiKSB7XHJcblx0XHRcdFx0XHRpZiAodHlwZS5jYWxsKHJlc3BvbnNlKSA9PSBcIltvYmplY3QgQXJyYXldXCIgJiYgeGhyT3B0aW9ucy50eXBlKSB7XHJcblx0XHRcdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcmVzcG9uc2UubGVuZ3RoOyBpKyspIHJlc3BvbnNlW2ldID0gbmV3IHhock9wdGlvbnMudHlwZShyZXNwb25zZVtpXSlcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGVsc2UgaWYgKHhock9wdGlvbnMudHlwZSkgcmVzcG9uc2UgPSBuZXcgeGhyT3B0aW9ucy50eXBlKHJlc3BvbnNlKVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRkZWZlcnJlZFtlLnR5cGUgPT0gXCJsb2FkXCIgPyBcInJlc29sdmVcIiA6IFwicmVqZWN0XCJdKHJlc3BvbnNlKVxyXG5cdFx0XHR9XHJcblx0XHRcdGNhdGNoIChlKSB7XHJcblx0XHRcdFx0aWYgKGUgaW5zdGFuY2VvZiBTeW50YXhFcnJvcikgdGhyb3cgbmV3IFN5bnRheEVycm9yKFwiQ291bGQgbm90IHBhcnNlIEhUVFAgcmVzcG9uc2UuIFNlZSBodHRwOi8vbGhvcmllLmdpdGh1Yi5pby9taXRocmlsL21pdGhyaWwucmVxdWVzdC5odG1sI3VzaW5nLXZhcmlhYmxlLWRhdGEtZm9ybWF0c1wiKVxyXG5cdFx0XHRcdGVsc2UgaWYgKHR5cGUuY2FsbChlKSA9PSBcIltvYmplY3QgRXJyb3JdXCIgJiYgZS5jb25zdHJ1Y3RvciAhPT0gRXJyb3IpIHRocm93IGVcclxuXHRcdFx0XHRlbHNlIGRlZmVycmVkLnJlamVjdChlKVxyXG5cdFx0XHR9XHJcblx0XHRcdGlmICh4aHJPcHRpb25zLmJhY2tncm91bmQgIT09IHRydWUpIG0uZW5kQ29tcHV0YXRpb24oKVxyXG5cdFx0fVxyXG5cdFx0YWpheCh4aHJPcHRpb25zKVxyXG5cdFx0cmV0dXJuIGRlZmVycmVkLnByb21pc2VcclxuXHR9XHJcblxyXG5cdC8vdGVzdGluZyBBUElcclxuXHRtLmRlcHMgPSBmdW5jdGlvbihtb2NrKSB7cmV0dXJuIHdpbmRvdyA9IG1vY2t9XHJcblx0Ly9mb3IgaW50ZXJuYWwgdGVzdGluZyBvbmx5LCBkbyBub3QgdXNlIGBtLmRlcHMuZmFjdG9yeWBcclxuXHRtLmRlcHMuZmFjdG9yeSA9IGFwcFxyXG5cclxuXHRyZXR1cm4gbVxyXG59KHR5cGVvZiB3aW5kb3cgIT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KVxyXG5cclxuaWYgKHR5cGVvZiBtb2R1bGUgIT0gXCJ1bmRlZmluZWRcIiAmJiBtb2R1bGUgIT09IG51bGwpIG1vZHVsZS5leHBvcnRzID0gbVxyXG5pZiAodHlwZW9mIGRlZmluZSA9PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkgZGVmaW5lKGZ1bmN0aW9uKCkge3JldHVybiBtfSlcclxuXHJcbjs7O1xyXG4iXX0=
