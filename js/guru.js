!function t(e,n,r){function o(s,a){if(!n[s]){if(!e[s]){var u="function"==typeof require&&require;if(!a&&u)return u(s,!0);if(i)return i(s,!0);var c=new Error("Cannot find module '"+s+"'");throw c.code="MODULE_NOT_FOUND",c}var l=n[s]={exports:{}};e[s][0].call(l.exports,function(t){var n=e[s][1][t];return o(n?n:t)},l,l.exports,t,e,n,r)}return n[s].exports}for(var i="function"==typeof require&&require,s=0;s<r.length;s++)o(r[s]);return o}({1:[function(t,e){var n={};n.controller=function(t,e){this.duration=t,this.seconds=m.prop(this.duration),this.startTime=null,this.completeCallback=e,this.stopped=m.prop(!0),this.reset=function(){this.seconds(this.duration),this.startTime=new Date,this.clearInterval()},this.start=function(){this.reset(),this.stopped(!1),this.timer=window.setInterval(this.update,100)}.bind(this),this.update=function(){var t=new Date,e=t-this.startTime,n=Math.ceil(this.duration-e/1e3);this.seconds(n),0===n&&this.finished(),m.redraw()}.bind(this),this.finished=function(){this.stop(),this.completeCallback&&this.completeCallback()},this.stop=function(){this.stopped(!0),this.clearInterval()},this.clearInterval=function(){this.timer&&(window.clearInterval(this.timer),this.timer=null)}},n.view=function(t){var e=[],n=t.stopped();return n||e.push(m("div",t.seconds())),e},e.exports=n},{}],2:[function(t,e){Mithril=m=new function n(t,e){function r(){for(var t,e=arguments,n=(!(null==e[1]||"[object Object]"!=q.call(e[1])||"tag"in e[1]||"subtree"in e[1])),r=n?e[1]:{},o=("class"in r?"class":"className"),i={tag:"div",attrs:{}},s=[];t=k.exec(e[0]);)if(""==t[1])i.tag=t[2];else if("#"==t[1])i.attrs.id=t[2];else if("."==t[1])s.push(t[2]);else if("["==t[3][0]){var a=M.exec(t[3]);i.attrs[a[1]]=a[3]||(a[2]?"":!0)}s.length>0&&(i.attrs[o]=s.join(" ")),i.children=n?e[2]:e[1];for(var u in r)i.attrs[u]=u==o?(i.attrs[u]||"")+" "+r[u]:r[u];return i}function o(n,r,a,l,d,f,h,p,m,g,v){if(null==d&&(d=""),"retain"===d.subtree)return f;var y=q.call(f),w=q.call(d);if(null==f||y!=w){if(null!=f)if(a&&a.nodes){var x=p-l,b=x+("[object Array]"==w?d:f.nodes).length;s(a.nodes.slice(x,b),a.slice(x,b))}else f.nodes&&s(f.nodes,f);f=new d.constructor,f.nodes=[]}if("[object Array]"==w){d=c(d);for(var N=[],j=f.length===d.length,C=0,E=1,T=2,O=3,A={},k=[],M=!1,B=0;B<f.length;B++)f[B]&&f[B].attrs&&null!=f[B].attrs.key&&(M=!0,A[f[B].attrs.key]={action:E,index:B});if(M){for(var B=0;B<d.length;B++)if(d[B]&&d[B].attrs)if(null!=d[B].attrs.key){var D=d[B].attrs.key;A[D]=A[D]?{action:O,index:B,from:A[D].index,element:n.childNodes[A[D].index]}:{action:T,index:B}}else k.push({index:B,element:n.childNodes[B]});for(var L,R=Object.keys(A).map(function(t){return A[t]}),I=R.sort(function(t,e){return t.action-e.action||t.index-e.index}),H=f.slice(),B=0;L=I[B];B++){if(L.action==E&&(s(f[L.index].nodes,f[L.index]),H.splice(L.index,1)),L.action==T){var Q=t.document.createElement("div");Q.key=d[L.index].attrs.key,n.insertBefore(Q,n.childNodes[L.index]),H.splice(L.index,0,{attrs:{key:d[L.index].attrs.key},nodes:[Q]})}L.action==O&&(n.childNodes[L.index]!==L.element&&null!==L.element&&n.insertBefore(L.element,n.childNodes[L.index]),H[L.index]=f[L.from])}for(var B=0;B<k.length;B++){var L=k[B];n.insertBefore(L.element,n.childNodes[L.index]),H[L.index]=f[L.index]}f=H,f.nodes=[];for(var U,B=0;U=n.childNodes[B];B++)f.nodes.push(U)}for(var B=0,z=0;B<d.length;B++){var G=o(n,r,f,p,d[B],f[z],h,p+C||C,m,g,v);if(G!==e){G.nodes.intact||(j=!1);var _="[object Array]"==q.call(G);C+=_?G.length:1,f[z++]=G}}if(!j){for(var B=0;B<d.length;B++)null!=f[B]&&(N=N.concat(f[B].nodes));for(var J,B=0;J=f.nodes[B];B++)null!=J.parentNode&&N.indexOf(J)<0&&s([J],[f[B]]);for(var J,B=f.nodes.length;J=N[B];B++)null==J.parentNode&&n.appendChild(J);d.length<f.length&&(f.length=d.length),f.nodes=N}}else if(null!=d&&"[object Object]"==w){if((d.tag!=f.tag||Object.keys(d.attrs).join()!=Object.keys(f.attrs).join()||d.attrs.id!=f.attrs.id)&&(s(f.nodes),f.configContext&&"function"==typeof f.configContext.onunload&&f.configContext.onunload()),"string"!=typeof d.tag)return;var J,K=0===f.nodes.length;d.attrs.xmlns?g=d.attrs.xmlns:"svg"===d.tag?g="http://www.w3.org/2000/svg":"math"===d.tag&&(g="http://www.w3.org/1998/Math/MathML"),K?(J=g===e?t.document.createElement(d.tag):t.document.createElementNS(g,d.tag),f={tag:d.tag,children:o(J,d.tag,e,e,d.children,f.children,!0,0,d.attrs.contenteditable?J:m,g,v),attrs:i(J,d.tag,d.attrs,{},g),nodes:[J]},n.insertBefore(J,n.childNodes[p]||null)):(J=f.nodes[0],i(J,d.tag,d.attrs,f.attrs,g),f.children=o(J,d.tag,e,e,d.children,f.children,!1,0,d.attrs.contenteditable?J:m,g,v),f.nodes.intact=!0,h===!0&&null!=J&&n.insertBefore(J,n.childNodes[p]||null)),"function"==typeof d.attrs.config&&v.push(d.attrs.config.bind(t,J,!K,f.configContext=f.configContext||{},f))}else if("function"!=typeof w){var N;0===f.nodes.length?(d.$trusted?N=u(n,p,d):(N=[t.document.createTextNode(d)],n.nodeName.match(S)||n.insertBefore(N[0],n.childNodes[p]||null)),f="string number boolean".indexOf(typeof d)>-1?new d.constructor(d):d,f.nodes=N):f.valueOf()!==d.valueOf()||h===!0?(N=f.nodes,m&&m===t.document.activeElement||(d.$trusted?(s(N,f),N=u(n,p,d)):"textarea"===r?n.value=d:m?m.innerHTML=d:((1==N[0].nodeType||N.length>1)&&(s(f.nodes,f),N=[t.document.createTextNode(d)]),n.insertBefore(N[0],n.childNodes[p]||null),N[0].nodeValue=d)),f=new d.constructor(d),f.nodes=N):f.nodes.intact=!0}return f}function i(e,n,r,o,i){for(var s in r){var a=r[s],u=o[s];if(!(s in o)||u!==a||e===t.document.activeElement){if(o[s]=a,"config"===s)continue;if("function"==typeof a&&0==s.indexOf("on"))e[s]=l(a,e);else if("style"===s&&"object"==typeof a){for(var c in a)(null==u||u[c]!==a[c])&&(e.style[c]=a[c]);for(var c in u)c in a||(e.style[c]="")}else null!=i?"href"===s?e.setAttributeNS("http://www.w3.org/1999/xlink","href",a):"className"===s?e.setAttribute("class",a):e.setAttribute(s,a):"value"===s&&"input"===n?e.value!==a&&(e.value=a):s in e&&"list"!=s&&"style"!=s?e[s]=a:e.setAttribute(s,a)}}return o}function s(t,e){for(var n=t.length-1;n>-1;n--)t[n]&&t[n].parentNode&&(t[n].parentNode.removeChild(t[n]),e=[].concat(e),e[n]&&a(e[n]));0!=t.length&&(t.length=0)}function a(t){if(t.configContext&&"function"==typeof t.configContext.onunload&&t.configContext.onunload(),t.children)if("[object Array]"==q.call(t.children))for(var e=0;e<t.children.length;e++)a(t.children[e]);else t.children.tag&&a(t.children)}function u(e,n,r){var o=e.childNodes[n];if(o){var i=1!=o.nodeType,s=t.document.createElement("span");i?(e.insertBefore(s,o),s.insertAdjacentHTML("beforebegin",r),e.removeChild(s)):o.insertAdjacentHTML("beforebegin",r)}else e.insertAdjacentHTML("beforeend",r);for(var a=[];e.childNodes[n]!==o;)a.push(e.childNodes[n]),n++;return a}function c(t){for(var e=[],n=0;n<t.length;n++){var r=t[n];"[object Array]"==q.call(r)?e.push.apply(e,c(r)):e.push(r)}return e}function l(t,e){return function(n){n=n||event,r.redraw.strategy("diff"),r.startComputation();try{return t.call(e,n)}finally{Q||(Q=-1),r.endComputation()}}}function d(t){var e=D.indexOf(t);return 0>e?D.push(t)-1:e}function f(t){var e=function(){return arguments.length&&(t=arguments[0]),t};return e.toJSON=function(){return t},e}function h(){for(var t=r.redraw.strategy(),e=0;e<R.length;e++)H[e]&&"none"!=t&&r.render(R[e],I[e].view(H[e]),"all"==t);U&&(U(),U=null),Q=null,r.redraw.strategy("diff")}function p(t){return t.slice(_[r.route.mode].length)}function m(t,e,n){K={};var o=n.indexOf("?");-1!==o&&(K=w(n.substr(o+1,n.length)),n=n.substr(0,o));for(var i in e){if(i==n)return r.module(t,e[i]),!0;var s=new RegExp("^"+i.replace(/:[^\/]+?\.{3}/g,"(.*?)").replace(/:[^\/]+/g,"([^\\/]+)")+"/?$");if(s.test(n))return n.replace(s,function(){for(var n=i.match(/:[^\/]+/g)||[],o=[].slice.call(arguments,1,-2),s=0;s<n.length;s++)K[n[s].replace(/:|\./g,"")]=decodeURIComponent(o[s]);r.module(t,e[i])}),!0}}function g(t){t=t||event,t.ctrlKey||t.metaKey||2==t.which||(t.preventDefault(),r.route(t.currentTarget[r.route.mode].slice(_[r.route.mode].length)))}function v(){"hash"!=r.route.mode&&t.location.hash?t.location.hash=t.location.hash:t.scrollTo(0,0)}function y(t,e){var n=[];for(var r in t){var o=e?e+"["+r+"]":r,i=t[r];n.push("object"==typeof i?y(i,o):encodeURIComponent(o)+"="+encodeURIComponent(i))}return n.join("&")}function w(t){for(var e=t.split("&"),n={},r=0;r<e.length;r++){var o=e[r].split("=");n[x(o[0])]=o[1]?x(o[1]):1===o.length?!0:""}return n}function x(t){return decodeURIComponent(t.replace(/\+/g," "))}function b(t){var n=d(t);s(t.childNodes,L[n]),L[n]=e}function N(t,e){return t.then=function(){var t=r.prop();return N(t,e.then.apply(e,arguments).then(t))},t.promise=t,t.resolve=function(n){return t(n),e=e.resolve.apply(e,arguments),t},t.reject=function(){return e=e.reject.apply(e,arguments),t},t}function j(t,e){function n(t,e,n,r){if("object"!=typeof s&&"function"!=typeof s||"function"!=typeof t)r();else try{var o=0;t.call(s,function(t){o++||(s=t,e())},function(t){o++||(s=t,n())})}catch(i){s=i,n()}}function r(){var a;try{a=s&&s.then}catch(c){return s=c,i=2,r()}n(a,function(){i=1,r()},function(){i=2,r()},function(){try{1==i&&"function"==typeof t?s=t(s):2==i&&"function"==typeof e&&(s=e(s),i=1)}catch(r){return s=r,u()}s==o?(s=TypeError(),u()):n(a,function(){u(3)},u,function(){u(1==i&&3)})})}var o=this,i=0,s=0,a=[];o.promise=o,o.resolve=function(t){return i||(s=t,i=1,r()),this},o.reject=function(t){return i||(s=t,i=2,r()),this},o.then=function(t,e){var n=new j(t,e);return 3==i?n.resolve(s):4==i?n.reject(s):a.push(n),n};var u=function(t){i=t||4,a.map(function(t){3==i&&t.resolve(s)||t.reject(s)})}}function C(t){return t}function E(e){var n=new t.XMLHttpRequest;if(n.open(e.method,e.url,!0,e.user,e.password),n.onreadystatechange=function(){4===n.readyState&&(n.status>=200&&n.status<300?e.onload({type:"load",target:n}):e.onerror({type:"error",target:n}))},e.serialize==JSON.stringify&&"GET"!=e.method&&n.setRequestHeader("Content-Type","application/json; charset=utf-8"),"function"==typeof e.config){var r=e.config(n,e);null!=r&&(n=r)}return n.send("GET"==e.method?"":e.data),n}function T(t,e,n){return e&&Object.keys(e).length>0&&("GET"==t.method?t.url=t.url+(t.url.indexOf("?")<0?"?":"&")+y(e):t.data=n(e)),t}function O(t,e){var n=t.match(/:[a-z]\w+/gi);if(n&&e)for(var r=0;r<n.length;r++){var o=n[r].slice(1);t=t.replace(n[r],e[o]),delete e[o]}return t}var A,q={}.toString,k=/(?:(^|#|\.)([^#\.\[\]]+))|(\[.+?\])/g,M=/\[(.+?)(?:=("|'|)(.*?)\2)?\]/,S=/AREA|BASE|BR|COL|COMMAND|EMBED|HR|IMG|INPUT|KEYGEN|LINK|META|PARAM|SOURCE|TR‌​ACK|WBR/,B={insertAdjacentHTML:function(e,n){t.document.write(n),t.document.close()},appendChild:function(n){A===e&&(A=t.document.createElement("html")),"HTML"==n.nodeName?A=n:A.appendChild(n),t.document.documentElement&&t.document.documentElement!==A?t.document.replaceChild(A,t.document.documentElement):t.document.appendChild(A)},insertBefore:function(t){this.appendChild(t)},childNodes:[]},D=[],L={};r.render=function(n,r,i){var a=[];if(!n)throw new Error("Please ensure the DOM element exists before rendering a template into it.");var u=d(n),c=n==t.document||n==t.document.documentElement?B:n;L[u]===e&&s(c.childNodes),i===!0&&b(n),L[u]=o(c,null,e,e,r,L[u],!1,0,null,e,a);for(var l=0;l<a.length;l++)a[l]()},r.trust=function(t){return t=new String(t),t.$trusted=!0,t},r.prop=function(t){if(("object"==typeof t||"function"==typeof t)&&"function"==typeof t.then){var e=f();return N(e,t).then(e),e}return f(t)};var R=[],I=[],H=[],Q=0,U=null;r.module=function(t,e){var n=R.indexOf(t);0>n&&(n=R.length);var o=!1;if(H[n]&&"function"==typeof H[n].onunload){var i={preventDefault:function(){o=!0}};H[n].onunload(i)}o||(r.redraw.strategy("all"),r.startComputation(),R[n]=t,I[n]=e,H[n]=new e.controller,r.endComputation())},r.redraw=function(e){var n=t.cancelAnimationFrame||t.clearTimeout,r=t.requestAnimationFrame||t.setTimeout;Q&&e!==!0?(n(Q),Q=r(h,0)):(h(),Q=r(function(){Q=null},0))},r.redraw.strategy=r.prop();var z=0;r.startComputation=function(){z++},r.endComputation=function(){z=Math.max(z-1,0),0==z&&r.redraw()},r.withAttr=function(t,e){return function(n){n=n||event;var r=n.currentTarget||this;e(t in r?r[t]:r.getAttribute(t))}};var G,_={pathname:"",hash:"#",search:"?"},J=function(){},K={};return r.route=function(){if(0===arguments.length)return G;if(3===arguments.length&&"string"==typeof arguments[1]){var e=arguments[0],n=arguments[1],o=arguments[2];J=function(t){var i=G=p(t);m(e,o,i)||r.route(n,!0)};var i="hash"==r.route.mode?"onhashchange":"onpopstate";t[i]=function(){G!=p(t.location[r.route.mode])&&J(t.location[r.route.mode])},U=v,t[i]()}else if(arguments[0].addEventListener){var s=arguments[0],a=arguments[1];s.href.indexOf(_[r.route.mode])<0&&(s.href=t.location.pathname+_[r.route.mode]+s.pathname),a||(s.removeEventListener("click",g),s.addEventListener("click",g))}else if("string"==typeof arguments[0]){G=arguments[0];var u="object"==typeof arguments[1]?y(arguments[1]):null;u&&(G+=(-1===G.indexOf("?")?"?":"&")+u);var c=(3==arguments.length?arguments[2]:arguments[1])===!0;t.history.pushState?(U=function(){t.history[c?"replaceState":"pushState"](null,t.document.title,_[r.route.mode]+G),v()},J(_[r.route.mode]+G)):t.location[r.route.mode]=G}},r.route.param=function(t){return K[t]},r.route.mode="search",r.deferred=function(){return N(r.prop(),new j)},r.sync=function(t){function e(t,e){return function(r){return s[t]=r,e||(n="reject"),0==--i&&(o.promise(s),o[n](s)),r}}var n="resolve",o=r.deferred(),i=t.length,s=new Array(i);if(t.length>0)for(var a=0;a<t.length;a++)t[a].then(e(a,!0),e(a,!1));else o.resolve();return o.promise},r.request=function(t){t.background!==!0&&r.startComputation();var e=r.deferred(),n=t.serialize=t.serialize||JSON.stringify,o=t.deserialize=t.deserialize||JSON.parse,i=t.extract||function(t){return 0===t.responseText.length&&o===JSON.parse?null:t.responseText};return t.url=O(t.url,t.data),t=T(t,t.data,n),t.onload=t.onerror=function(n){try{n=n||event;var s=("load"==n.type?t.unwrapSuccess:t.unwrapError)||C,a=s(o(i(n.target,t)));if("load"==n.type)if("[object Array]"==q.call(a)&&t.type)for(var u=0;u<a.length;u++)a[u]=new t.type(a[u]);else t.type&&(a=new t.type(a));e["load"==n.type?"resolve":"reject"](a)}catch(n){if(n instanceof SyntaxError)throw new SyntaxError("Could not parse HTTP response. See http://lhorie.github.io/mithril/mithril.request.html#using-variable-data-formats");if("[object Error]"==q.call(n)&&n.constructor!==Error)throw n;e.reject(n)}t.background!==!0&&r.endComputation()},E(t),e.promise},r.deps=function(e){return t=e},r.deps.factory=n,r}("undefined"!=typeof window?window:{}),"undefined"!=typeof e&&null!==e&&(e.exports=m),"function"==typeof define&&define.amd&&define(function(){return m})},{}],3:[function(t){var e=t("mithril"),n=t("./timer"),r=window.Data.strings,o={};o.Question=function(t){this.q=e.prop(t)},o.Questions=Array,o.Questions.prototype.shuffle=function(){var t,e,n=this.length;if(0==n)return this;for(;--n;)t=Math.floor(Math.random()*(n+1)),e=this[n],this[n]=this[t],this[t]=e;return this},o.controller=function(){this.questionData=new o.Questions,this.started=!1,this.questions=e.prop([]),this.question=e.prop(""),this.answers=e.prop(0),this.position=0,this.complete=e.prop(!1),this.add=function(t){t&&this.questionData.push(new o.Question(t))},this.start=function(){this.answers(0),this.questions(this.questionData.shuffle()),this.position=0,this.complete(!1),this.timer.start(),this.showQuestion()}.bind(this),this.showQuestion=function(){this.answers(this.answers()+1);var t=this.questions()[this.position];this.question(t.q())}.bind(this),this.nextQuestion=function(){this.position+=1,this.position===this.questions().length?this.end(r.all_done):this.showQuestion()}.bind(this),this.timeUp=function(){this.end(r.times_up)}.bind(this),this.end=function(t){this.question(t),this.timer.stop(),this.complete(!0)},this.timer=new n.controller(60,this.timeUp);for(var t=0,i=window.Data.questions,s=i.length;s>t;t++)this.add(i[t])},o.view=function(t){var o=!!t.question(),i=o?["active"]:["inactive"],s=r.you_answered.split("{n}");return t.complete()&&i.push("complete"),e("div#guru",{"class":i.join(" ")},[e("h1","Guru"),e("#timer",new n.view(t.timer)),e("#intro",r.introduction),e("button#start",{onclick:t.start},r.start),e("button#restart",{onclick:t.start},r.try_again),e("div#question",t.question()),e("div#results",[s[0],e("span",t.answers()),s[1]]),e("button#next",{onclick:t.nextQuestion},["Next question (",t.questions().length-t.answers()," left)"])])},e.module(document.getElementById("guru"),o)},{"./timer":1,mithril:2}]},{},[3]);