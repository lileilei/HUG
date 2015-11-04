/*==================================================
 Copyright (c) 2013-2015 ˾ͽ���� and other contributors
 http://www.cnblogs.com/rubylouvre/
 https://github.com/RubyLouvre
 http://weibo.com/jslouvre/

 Released under the MIT license
 avalon.js 1.4.7.1 built in 2015.10.27
 support IE6+ and other browsers
 ==================================================*/
(function(global, factory) {

    if (typeof module === "object" && typeof module.exports === "object") {
        // For CommonJS and CommonJS-like environments where a proper `window`
        // is present, execute the factory and get avalon.
        // For environments that do not have a `window` with a `document`
        // (such as Node.js), expose a factory as module.exports.
        // This accentuates the need for the creation of a real `window`.
        // e.g. var avalon = require("avalon")(window);
        module.exports = global.document ? factory(global, true) : function(w) {
            if (!w.document) {
                throw new Error("Avalon requires a window with a document")
            }
            return factory(w)
        }
    } else {
        factory(global)
    }

// Pass this if window is not defined yet
}(typeof window !== "undefined" ? window : this, function(window, noGlobal){

    /*********************************************************************
     *                    ȫ�ֱ���������                                  *
     **********************************************************************/
    var expose = new Date() - 0
//http://stackoverflow.com/questions/7290086/javascript-use-strict-and-nicks-find-global-function
    var DOC = window.document
    var head = DOC.getElementsByTagName("head")[0] //HEADԪ��
    var ifGroup = head.insertBefore(document.createElement("avalon"), head.firstChild) //����IE6 base��ǩBUG
    ifGroup.innerHTML = "X<style id='avalonStyle'>.avalonHide{ display: none!important }</style>"
    ifGroup.setAttribute("ms-skip", "1")
    ifGroup.className = "avalonHide"
    var rnative = /\[native code\]/ //�ж��Ƿ�ԭ������
    function log() {
        if (window.console && avalon.config.debug) {
            // http://stackoverflow.com/questions/8785624/how-to-safely-wrap-console-log
            Function.apply.call(console.log, console, arguments)
        }
    }


    var subscribers = "$" + expose
    var stopRepeatAssign = false
    var rword = /[^, ]+/g //�и��ַ���Ϊһ����С�飬�Կո�򶹺ŷֿ����ǣ����replaceʵ���ַ�����forEach
    var rcomplexType = /^(?:object|array)$/
    var rsvg = /^\[object SVG\w*Element\]$/
    var rwindow = /^\[object (?:Window|DOMWindow|global)\]$/
    var oproto = Object.prototype
    var ohasOwn = oproto.hasOwnProperty
    var serialize = oproto.toString
    var ap = Array.prototype
    var aslice = ap.slice
    var Registry = {} //�������ع⵽�˶����ϣ�����������ռ�����
    var W3C = window.dispatchEvent
    var root = DOC.documentElement
    var avalonFragment = DOC.createDocumentFragment()
    var cinerator = DOC.createElement("div")
    var class2type = {}
    "Boolean Number String Function Array Date RegExp Object Error".replace(rword, function (name) {
        class2type["[object " + name + "]"] = name.toLowerCase()
    })


    function noop() {
    }


    function oneObject(array, val) {
        if (typeof array === "string") {
            array = array.match(rword) || []
        }
        var result = {},
            value = val !== void 0 ? val : 1
        for (var i = 0, n = array.length; i < n; i++) {
            result[array[i]] = value
        }
        return result
    }

//����UUID http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
    var generateID = function (prefix) {
        prefix = prefix || "avalon"
        return String(Math.random() + Math.random()).replace(/\d\.\d{4}/, prefix)
    }
    function IE() {
        if (window.VBArray) {
            var mode = document.documentMode
            return mode ? mode : window.XMLHttpRequest ? 7 : 6
        } else {
            return NaN
        }
    }
    var IEVersion = IE()

    avalon = function (el) { //����jQueryʽ����new ʵ�����ṹ
        return new avalon.init(el)
    }

    avalon.profile = function () {
        if (window.console && avalon.config.profile) {
            Function.apply.call(console.log, console, arguments)
        }
    }

    /*�������������������첽�ص�*/
    avalon.nextTick = new function () {// jshint ignore:line
        var tickImmediate = window.setImmediate
        var tickObserver = window.MutationObserver
        if (tickImmediate) {//IE10?\11 edage
            return tickImmediate.bind(window)
        }

        var queue = []
        function callback() {
            var n = queue.length
            for (var i = 0; i < n; i++) {
                queue[i]()
            }
            queue = queue.slice(n)
        }

        if (tickObserver) {//?֧��MutationObserver
            var node = document.createTextNode("avalon")
            new tickObserver(callback).observe(node, {characterData: true})// jshint ignore:line
            return function (fn) {
                queue.push(fn)
                node.data = Math.random()
            }
        }

        if (window.VBArray) {
            return function (fn) {
                queue.push(fn)
                var node = DOC.createElement("script")
                node.onreadystatechange = function () {
                    callback() //��interactive�׶ξʹ���
                    node.onreadystatechange = null
                    head.removeChild(node)
                    node = null
                }
                head.appendChild(node)
            }
        }


        return function (fn) {
            setTimeout(fn, 4)
        }
    }// jshint ignore:line
    /*********************************************************************
     *                 avalon�ľ�̬����������                              *
     **********************************************************************/
    avalon.init = function (el) {
        this[0] = this.element = el
    }
    avalon.fn = avalon.prototype = avalon.init.prototype

    avalon.type = function (obj) { //ȡ��Ŀ�������
        if (obj == null) {
            return String(obj)
        }
        // ���ڵ�webkit�ں������ʵ�����ѷ�����ecma262v4��׼�����Խ�������������������ʹ�ã����typeof���ж�����ʱ�᷵��function
        return typeof obj === "object" || typeof obj === "function" ?
        class2type[serialize.call(obj)] || "object" :
            typeof obj
    }

    var isFunction = typeof alert === "object" ? function (fn) {
        try {
            return /^\s*\bfunction\b/.test(fn + "")
        } catch (e) {
            return false
        }
    } : function (fn) {
        return serialize.call(fn) === "[object Function]"
    }
    avalon.isFunction = isFunction

    avalon.isWindow = function (obj) {
        if (!obj)
            return false
        // ����IE678 window == documentΪtrue,document == window��ȻΪfalse����������
        // ��׼�������IE9��IE10��ʹ�� ������
        return obj == obj.document && obj.document != obj //jshint ignore:line
    }

    function isWindow(obj) {
        return rwindow.test(serialize.call(obj))
    }
    if (isWindow(window)) {
        avalon.isWindow = isWindow
    }
    var enu
    for (enu in avalon({})) {
        break
    }
    var enumerateBUG = enu !== "0" //IE6��Ϊtrue, ����Ϊfalse
    /*�ж��Ƿ���һ�����ص�javascript����Object��������DOM���󣬲���BOM���󣬲����Զ������ʵ��*/
    avalon.isPlainObject = function (obj, key) {
        if (!obj || avalon.type(obj) !== "object" || obj.nodeType || avalon.isWindow(obj)) {
            return false;
        }
        try { //IE���ö���û��constructor
            if (obj.constructor && !ohasOwn.call(obj, "constructor") && !ohasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
                return false;
            }
        } catch (e) { //IE8 9���������״�
            return false;
        }
        if (enumerateBUG) {
            for (key in obj) {
                return ohasOwn.call(obj, key)
            }
        }
        for (key in obj) {
        }
        return key === void 0 || ohasOwn.call(obj, key)
    }
    if (rnative.test(Object.getPrototypeOf)) {
        avalon.isPlainObject = function (obj) {
            // �򵥵� typeof obj === "object"��⣬����ʹ��isPlainObject(window)��opera��ͨ����
            return serialize.call(obj) === "[object Object]" && Object.getPrototypeOf(obj) === oproto
        }
    }
//��jQuery.extend������������ǳ���������
    avalon.mix = avalon.fn.mix = function () {
        var options, name, src, copy, copyIsArray, clone,
            target = arguments[0] || {},
            i = 1,
            length = arguments.length,
            deep = false

        // �����һ������Ϊ����,�ж��Ƿ����
        if (typeof target === "boolean") {
            deep = target
            target = arguments[1] || {}
            i++
        }

        //ȷ�����ܷ�Ϊһ�����ӵ���������
        if (typeof target !== "object" && !isFunction(target)) {
            target = {}
        }

        //���ֻ��һ����������ô�³�Ա�����mix���ڵĶ�����
        if (i === length) {
            target = this
            i--
        }

        for (; i < length; i++) {
            //ֻ����ǿղ���
            if ((options = arguments[i]) != null) {
                for (name in options) {
                    src = target[name]
                    try {
                        copy = options[name] //��optionsΪVBS����ʱ����
                    } catch (e) {
                        continue
                    }

                    // ��ֹ������
                    if (target === copy) {
                        continue
                    }
                    if (deep && copy && (avalon.isPlainObject(copy) || (copyIsArray = Array.isArray(copy)))) {

                        if (copyIsArray) {
                            copyIsArray = false
                            clone = src && Array.isArray(src) ? src : []

                        } else {
                            clone = src && avalon.isPlainObject(src) ? src : {}
                        }

                        target[name] = avalon.mix(deep, clone, copy)
                    } else if (copy !== void 0) {
                        target[name] = copy
                    }
                }
            }
        }
        return target
    }

    function _number(a, len) { //����ģ��slice, splice��Ч��
        a = Math.floor(a) || 0
        return a < 0 ? Math.max(len + a, 0) : Math.min(a, len);
    }

    avalon.mix({
        rword: rword,
        subscribers: subscribers,
        version: 1.471,
        ui: {},
        log: log,
        slice: W3C ? function (nodes, start, end) {
            return aslice.call(nodes, start, end)
        } : function (nodes, start, end) {
            var ret = []
            var len = nodes.length
            if (end === void 0)
                end = len
            if (typeof end === "number" && isFinite(end)) {
                start = _number(start, len)
                end = _number(end, len)
                for (var i = start; i < end; ++i) {
                    ret[i - start] = nodes[i]
                }
            }
            return ret
        },
        noop: noop,
        /*�������Error�����װһ�£�str�ڿ���̨�¿��ܻ�����*/
        error: function (str, e) {
            throw  (e || Error)(str)
        },
        /*��һ���Կո�򶺺Ÿ������ַ���������,ת����һ����ֵ��Ϊ1�Ķ���*/
        oneObject: oneObject,
        /* avalon.range(10)
         => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
         avalon.range(1, 11)
         => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
         avalon.range(0, 30, 5)
         => [0, 5, 10, 15, 20, 25]
         avalon.range(0, -10, -1)
         => [0, -1, -2, -3, -4, -5, -6, -7, -8, -9]
         avalon.range(0)
         => []*/
        range: function (start, end, step) { // ����������������
            step || (step = 1)
            if (end == null) {
                end = start || 0
                start = 0
            }
            var index = -1,
                length = Math.max(0, Math.ceil((end - start) / step)),
                result = new Array(length)
            while (++index < length) {
                result[index] = start
                start += step
            }
            return result
        },
        eventHooks: [],
        /*���¼�*/
        bind: function (el, type, fn, phase) {
            var hooks = avalon.eventHooks
            var hook = hooks[type]
            if (typeof hook === "object") {
                type = hook.type || type
                phase = hook.phase || !!phase
                fn = hook.fn ? hook.fn(el,fn): fn
            }
            var callback = W3C ? fn : function (e) {
                fn.call(el, fixEvent(e));
            }
            if (W3C) {
                el.addEventListener(type, callback, phase)
            } else {
                el.attachEvent("on" + type, callback)
            }
            return callback
        },
        /*ж���¼�*/
        unbind: function (el, type, fn, phase) {
            var hooks = avalon.eventHooks
            var hook = hooks[type]
            var callback = fn || noop
            if (typeof hook === "object") {
                type = hook.type || type
                phase = hook.phase || !!phase
            }
            if (W3C) {
                el.removeEventListener(type, callback, phase)
            } else {
                el.detachEvent("on" + type, callback)
            }
        },
        /*��дɾ��Ԫ�ؽڵ����ʽ*/
        css: function (node, name, value) {
            if (node instanceof avalon) {
                node = node[0]
            }
            var prop = /[_-]/.test(name) ? camelize(name) : name, fn
            name = avalon.cssName(prop) || prop
            if (value === void 0 || typeof value === "boolean") { //��ȡ��ʽ
                fn = cssHooks[prop + ":get"] || cssHooks["@:get"]
                if (name === "background") {
                    name = "backgroundColor"
                }
                var val = fn(node, name)
                return value === true ? parseFloat(val) || 0 : val
            } else if (value === "") { //�����ʽ
                node.style[name] = ""
            } else { //������ʽ
                if (value == null || value !== value) {
                    return
                }
                if (isFinite(value) && !avalon.cssNumber[prop]) {
                    value += "px"
                }
                fn = cssHooks[prop + ":set"] || cssHooks["@:set"]
                fn(node, name, value)
            }
        },
        /*�������������,�ص��ĵ�һ������Ϊ���������,�ڶ�����Ԫ�ػ��ֵ*/
        each: function (obj, fn) {
            if (obj) { //�ų�null, undefined
                var i = 0
                if (isArrayLike(obj)) {
                    for (var n = obj.length; i < n; i++) {
                        if (fn(i, obj[i]) === false)
                            break
                    }
                } else {
                    for (i in obj) {
                        if (obj.hasOwnProperty(i) && fn(i, obj[i]) === false) {
                            break
                        }
                    }
                }
            }
        },
        //�ռ�Ԫ�ص�data-{{prefix}}-*���ԣ���ת��Ϊ����
        getWidgetData: function (elem, prefix) {
            var raw = avalon(elem).data()
            var result = {}
            for (var i in raw) {
                if (i.indexOf(prefix) === 0) {
                    result[i.replace(prefix, "").replace(/\w/, function (a) {
                        return a.toLowerCase()
                    })] = raw[i]
                }
            }
            return result
        },
        Array: {
            /*ֻ�е�ǰ���鲻���ڴ�Ԫ��ʱֻ�����*/
            ensure: function (target, item) {
                if (target.indexOf(item) === -1) {
                    return target.push(item)
                }
            },
            /*�Ƴ�������ָ��λ�õ�Ԫ�أ����ز�����ʾ�ɹ����*/
            removeAt: function (target, index) {
                return !!target.splice(index, 1).length
            },
            /*�Ƴ������е�һ��ƥ�䴫�ε��Ǹ�Ԫ�أ����ز�����ʾ�ɹ����*/
            remove: function (target, item) {
                var index = target.indexOf(item)
                if (~index)
                    return avalon.Array.removeAt(target, index)
                return false
            }
        }
    })

    var bindingHandlers = avalon.bindingHandlers = {}
    var bindingExecutors = avalon.bindingExecutors = {}

    /*�ж��Ƿ������飬��ڵ㼯�ϣ������飬arguments��ӵ�зǸ�������length���ԵĴ�JS����*/
    function isArrayLike(obj) {
        if (!obj)
            return false
        var n = obj.length
        if (n === (n >>> 0)) { //���length�����Ƿ�Ϊ�Ǹ�����
            var type = serialize.call(obj).slice(8, -1)
            if (/(?:regexp|string|function|window|global)$/i.test(type))
                return false
            if (type === "Array")
                return true
            try {
                if ({}.propertyIsEnumerable.call(obj, "length") === false) { //�����ԭ������
                    return  /^\s?function/.test(obj.item || obj.callee)
                }
                return true
            } catch (e) { //IE��NodeListֱ���״�
                return !obj.window //IE6-8 window
            }
        }
        return false
    }


// https://github.com/rsms/js-lru
    var Cache = new function() {// jshint ignore:line
        function LRU(maxLength) {
            this.size = 0
            this.limit = maxLength
            this.head = this.tail = void 0
            this._keymap = {}
        }

        var p = LRU.prototype

        p.put = function(key, value) {
            var entry = {
                key: key,
                value: value
            }
            this._keymap[key] = entry
            if (this.tail) {
                this.tail.newer = entry
                entry.older = this.tail
            } else {
                this.head = entry
            }
            this.tail = entry
            if (this.size === this.limit) {
                this.shift()
            } else {
                this.size++
            }
            return value
        }

        p.shift = function() {
            var entry = this.head
            if (entry) {
                this.head = this.head.newer
                this.head.older =
                    entry.newer =
                        entry.older =
                            this._keymap[entry.key] = void 0
                delete this._keymap[entry.key] //#1029
            }
        }
        p.get = function(key) {
            var entry = this._keymap[key]
            if (entry === void 0)
                return
            if (entry === this.tail) {
                return  entry.value
            }
            // HEAD--------------TAIL
            //   <.older   .newer>
            //  <--- add direction --
            //   A  B  C  <D>  E
            if (entry.newer) {
                if (entry === this.head) {
                    this.head = entry.newer
                }
                entry.newer.older = entry.older // C <-- E.
            }
            if (entry.older) {
                entry.older.newer = entry.newer // C. --> E
            }
            entry.newer = void 0 // D --x
            entry.older = this.tail // D. --> E
            if (this.tail) {
                this.tail.newer = entry // E. <-- D
            }
            this.tail = entry
            return entry.value
        }
        return LRU
    }// jshint ignore:line

    /*********************************************************************
     *                         javascript �ײ㲹��                       *
     **********************************************************************/
    if (!"˾ͽ����".trim) {
        var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g
        String.prototype.trim = function () {
            return this.replace(rtrim, "")
        }
    }
    var hasDontEnumBug = !({
            'toString': null
        }).propertyIsEnumerable('toString'),
        hasProtoEnumBug = (function () {
        }).propertyIsEnumerable('prototype'),
        dontEnums = [
            "toString",
            "toLocaleString",
            "valueOf",
            "hasOwnProperty",
            "isPrototypeOf",
            "propertyIsEnumerable",
            "constructor"
        ],
        dontEnumsLength = dontEnums.length;
    if (!Object.keys) {
        Object.keys = function (object) { //ecma262v5 15.2.3.14
            var theKeys = []
            var skipProto = hasProtoEnumBug && typeof object === "function"
            if (typeof object === "string" || (object && object.callee)) {
                for (var i = 0; i < object.length; ++i) {
                    theKeys.push(String(i))
                }
            } else {
                for (var name in object) {
                    if (!(skipProto && name === "prototype") && ohasOwn.call(object, name)) {
                        theKeys.push(String(name))
                    }
                }
            }

            if (hasDontEnumBug) {
                var ctor = object.constructor,
                    skipConstructor = ctor && ctor.prototype === object
                for (var j = 0; j < dontEnumsLength; j++) {
                    var dontEnum = dontEnums[j]
                    if (!(skipConstructor && dontEnum === "constructor") && ohasOwn.call(object, dontEnum)) {
                        theKeys.push(dontEnum)
                    }
                }
            }
            return theKeys
        }
    }
    if (!Array.isArray) {
        Array.isArray = function (a) {
            return serialize.call(a) === "[object Array]"
        }
    }

    if (!noop.bind) {
        Function.prototype.bind = function (scope) {
            if (arguments.length < 2 && scope === void 0)
                return this
            var fn = this,
                argv = arguments
            return function () {
                var args = [],
                    i
                for (i = 1; i < argv.length; i++)
                    args.push(argv[i])
                for (i = 0; i < arguments.length; i++)
                    args.push(arguments[i])
                return fn.apply(scope, args)
            }
        }
    }

    function iterator(vars, body, ret) {
        var fun = 'for(var ' + vars + 'i=0,n = this.length; i < n; i++){' + body.replace('_', '((i in this) && fn.call(scope,this[i],i,this))') + '}' + ret
        /* jshint ignore:start */
        return Function("fn,scope", fun)
        /* jshint ignore:end */
    }
    if (!rnative.test([].map)) {
        avalon.mix(ap, {
            //��λ���������������е�һ�����ڸ���������Ԫ�ص�����ֵ��
            indexOf: function (item, index) {
                var n = this.length,
                    i = ~~index
                if (i < 0)
                    i += n
                for (; i < n; i++)
                    if (this[i] === item)
                        return i
                return -1
            },
            //��λ������ͬ�ϣ������ǴӺ������
            lastIndexOf: function (item, index) {
                var n = this.length,
                    i = index == null ? n - 1 : index
                if (i < 0)
                    i = Math.max(0, n + i)
                for (; i >= 0; i--)
                    if (this[i] === item)
                        return i
                return -1
            },
            //�����������������Ԫ�ذ���������һ��������ִ�С�Prototype.js�Ķ�Ӧ����Ϊeach��
            forEach: iterator("", '_', ""),
            //������ �������е�ÿ����������һ������������˺�����ֵΪ�棬���Ԫ����Ϊ�������Ԫ���ռ�������������������
            filter: iterator('r=[],j=0,', 'if(_)r[j++]=this[i]', 'return r'),
            //�ռ��������������Ԫ�ذ���������һ��������ִ�У�Ȼ������ǵķ���ֵ���һ�������鷵�ء�Prototype.js�Ķ�Ӧ����Ϊcollect��
            map: iterator('r=[],', 'r[i]=_', 'return r'),
            //ֻҪ��������һ��Ԫ�������������Ž�������������true������ô���ͷ���true��Prototype.js�Ķ�Ӧ����Ϊany��
            some: iterator("", 'if(_)return true', 'return false'),
            //ֻ�������е�Ԫ�ض������������Ž�������������true�������ŷ���true��Prototype.js�Ķ�Ӧ����Ϊall��
            every: iterator("", 'if(!_)return false', 'return true')
        })
    }
    /*********************************************************************
     *                           DOM �ײ㲹��                             *
     **********************************************************************/

    function fixContains(root, el) {
        try { //IE6-8,������DOM������ı��ڵ㣬����parentNode��ʱ���״�
            while ((el = el.parentNode))
                if (el === root)
                    return true
            return false
        } catch (e) {
            return false
        }
    }
    avalon.contains = fixContains
//IE6-11���ĵ�����û��contains
    if (!DOC.contains) {
        DOC.contains = function (b) {
            return fixContains(DOC, b)
        }
    }

    function outerHTML() {
        return new XMLSerializer().serializeToString(this)
    }

    if (window.SVGElement) {
        //safari5+�ǰ�contains��������Element.prototype�϶�����Node.prototype
        if (!DOC.createTextNode("x").contains) {
            Node.prototype.contains = function (arg) {//IE6-8û��Node����
                return !!(this.compareDocumentPosition(arg) & 16)
            }
        }
        var svgns = "http://www.w3.org/2000/svg"
        var svg = DOC.createElementNS(svgns, "svg")
        svg.innerHTML = '<circle cx="50" cy="50" r="40" fill="red" />'
        if (!rsvg.test(svg.firstChild)) { // #409
            function enumerateNode(node, targetNode) {// jshint ignore:line
                if (node && node.childNodes) {
                    var nodes = node.childNodes
                    for (var i = 0, el; el = nodes[i++]; ) {
                        if (el.tagName) {
                            var svg = DOC.createElementNS(svgns,
                                el.tagName.toLowerCase())
                            ap.forEach.call(el.attributes, function (attr) {
                                svg.setAttribute(attr.name, attr.value) //��������
                            })// jshint ignore:line
                            // �ݹ鴦���ӽڵ�
                            enumerateNode(el, svg)
                            targetNode.appendChild(svg)
                        }
                    }
                }
            }
            Object.defineProperties(SVGElement.prototype, {
                "outerHTML": {//IE9-11,firefox��֧��SVGԪ�ص�innerHTML,outerHTML����
                    enumerable: true,
                    configurable: true,
                    get: outerHTML,
                    set: function (html) {
                        var tagName = this.tagName.toLowerCase(),
                            par = this.parentNode,
                            frag = avalon.parseHTML(html)
                        // ������svg��ֱ�Ӳ���
                        if (tagName === "svg") {
                            par.insertBefore(frag, this)
                            // svg�ڵ���ӽڵ�����
                        } else {
                            var newFrag = DOC.createDocumentFragment()
                            enumerateNode(frag, newFrag)
                            par.insertBefore(newFrag, this)
                        }
                        par.removeChild(this)
                    }
                },
                "innerHTML": {
                    enumerable: true,
                    configurable: true,
                    get: function () {
                        var s = this.outerHTML
                        var ropen = new RegExp("<" + this.nodeName + '\\b(?:(["\'])[^"]*?(\\1)|[^>])*>', "i")
                        var rclose = new RegExp("<\/" + this.nodeName + ">$", "i")
                        return s.replace(ropen, "").replace(rclose, "")
                    },
                    set: function (html) {
                        if (avalon.clearHTML) {
                            avalon.clearHTML(this)
                            var frag = avalon.parseHTML(html)
                            enumerateNode(frag, this)
                        }
                    }
                }
            })
        }
    }
    if (!root.outerHTML && window.HTMLElement) { //firefox ��11ʱ����outerHTML
        HTMLElement.prototype.__defineGetter__("outerHTML", outerHTML);
    }


//============================= event binding =======================
    var rmouseEvent = /^(?:mouse|contextmenu|drag)|click/
    function fixEvent(event) {
        var ret = {}
        for (var i in event) {
            ret[i] = event[i]
        }
        var target = ret.target = event.srcElement
        if (event.type.indexOf("key") === 0) {
            ret.which = event.charCode != null ? event.charCode : event.keyCode
        } else if (rmouseEvent.test(event.type)) {
            var doc = target.ownerDocument || DOC
            var box = doc.compatMode === "BackCompat" ? doc.body : doc.documentElement
            ret.pageX = event.clientX + (box.scrollLeft >> 0) - (box.clientLeft >> 0)
            ret.pageY = event.clientY + (box.scrollTop >> 0) - (box.clientTop >> 0)
            ret.wheelDeltaY = ret.wheelDelta
            ret.wheelDeltaX = 0
        }
        ret.timeStamp = new Date() - 0
        ret.originalEvent = event
        ret.preventDefault = function () { //��ֹĬ����Ϊ
            event.returnValue = false
        }
        ret.stopPropagation = function () { //��ֹ�¼���DOM���еĴ���
            event.cancelBubble = true
        }
        return ret
    }

    var eventHooks = avalon.eventHooks
//���firefox, chrome����mouseenter, mouseleave
    if (!("onmouseenter" in root)) {
        avalon.each({
            mouseenter: "mouseover",
            mouseleave: "mouseout"
        }, function (origType, fixType) {
            eventHooks[origType] = {
                type: fixType,
                fn: function (elem, fn) {
                    return function (e) {
                        var t = e.relatedTarget
                        if (!t || (t !== elem && !(elem.compareDocumentPosition(t) & 16))) {
                            delete e.type
                            e.type = origType
                            return fn.call(elem, e)
                        }
                    }
                }
            }
        })
    }
//���IE9+, w3c����animationend
    avalon.each({
        AnimationEvent: "animationend",
        WebKitAnimationEvent: "webkitAnimationEnd"
    }, function (construct, fixType) {
        if (window[construct] && !eventHooks.animationend) {
            eventHooks.animationend = {
                type: fixType
            }
        }
    })
//���IE6-8����input
    if (!("oninput" in DOC.createElement("input"))) {
        eventHooks.input = {
            type: "propertychange",
            fn: function (elem, fn) {
                return function (e) {
                    if (e.propertyName === "value") {
                        e.type = "input"
                        return fn.call(elem, e)
                    }
                }
            }
        }
    }
    if (DOC.onmousewheel === void 0) {
        /* IE6-11 chrome mousewheel wheelDetla �� -120 �� 120
         firefox DOMMouseScroll detail ��3 ��-3
         firefox wheel detlaY ��3 ��-3
         IE9-11 wheel deltaY ��40 ��-40
         chrome wheel deltaY ��100 ��-100 */
        var fixWheelType = DOC.onwheel !== void 0 ? "wheel" : "DOMMouseScroll"
        var fixWheelDelta = fixWheelType === "wheel" ? "deltaY" : "detail"
        eventHooks.mousewheel = {
            type: fixWheelType,
            fn: function (elem, fn) {
                return function (e) {
                    e.wheelDeltaY = e.wheelDelta = e[fixWheelDelta] > 0 ? -120 : 120
                    e.wheelDeltaX = 0
                    if (Object.defineProperty) {
                        Object.defineProperty(e, "type", {
                            value: "mousewheel"
                        })
                    }
                    fn.call(elem, e)
                }
            }
        }
    }



    /*********************************************************************
     *                           ����ϵͳ                                 *
     **********************************************************************/

    function kernel(settings) {
        for (var p in settings) {
            if (!ohasOwn.call(settings, p))
                continue
            var val = settings[p]
            if (typeof kernel.plugins[p] === "function") {
                kernel.plugins[p](val)
            } else if (typeof kernel[p] === "object") {
                avalon.mix(kernel[p], val)
            } else {
                kernel[p] = val
            }
        }
        return this
    }
    var openTag, closeTag, rexpr, rexprg, rbind, rregexp = /[-.*+?^${}()|[\]\/\\]/g

    function escapeRegExp(target) {
        //http://stevenlevithan.com/regex/xregexp/
        //���ַ�����ȫ��ʽ��Ϊ������ʽ��Դ��
        return (target + "").replace(rregexp, "\\$&")
    }

    var plugins = {

        interpolate: function (array) {
            openTag = array[0]
            closeTag = array[1]
            if (openTag === closeTag) {
                throw new SyntaxError("openTag===closeTag")
            } else {
                var test = openTag + "test" + closeTag
                cinerator.innerHTML = test
                if (cinerator.innerHTML !== test && cinerator.innerHTML.indexOf("&lt;") > -1) {
                    throw new SyntaxError("�˶�������Ϸ�")
                }
                kernel.openTag = openTag
                kernel.closeTag = closeTag
                cinerator.innerHTML = ""
            }
            var o = escapeRegExp(openTag),
                c = escapeRegExp(closeTag)
            rexpr = new RegExp(o + "(.*?)" + c)
            rexprg = new RegExp(o + "(.*?)" + c, "g")
            rbind = new RegExp(o + ".*?" + c + "|\\sms-")
        }
    }

    kernel.debug = true
    kernel.plugins = plugins
    kernel.plugins['interpolate'](["{{", "}}"])
    kernel.paths = {}
    kernel.shim = {}
    kernel.maxRepeatSize = 100
    avalon.config = kernel
    var ravalon = /(\w+)\[(avalonctrl)="(\S+)"\]/
    var findNodes = DOC.querySelectorAll ? function(str) {
        return DOC.querySelectorAll(str)
    } : function(str) {
        var match = str.match(ravalon)
        var all = DOC.getElementsByTagName(match[1])
        var nodes = []
        for (var i = 0, el; el = all[i++]; ) {
            if (el.getAttribute(match[2]) === match[3]) {
                nodes.push(el)
            }
        }
        return nodes
    }
    /*********************************************************************
     *                            �¼�����                               *
     **********************************************************************/
    var EventBus = {
        $watch: function (type, callback) {
            if (typeof callback === "function") {
                var callbacks = this.$events[type]
                if (callbacks) {
                    callbacks.push(callback)
                } else {
                    this.$events[type] = [callback]
                }
            } else { //���¿�ʼ������VM�ĵ�һ�ؼ����Եı䶯
                this.$events = this.$watch.backup
            }
            return this
        },
        $unwatch: function (type, callback) {
            var n = arguments.length
            if (n === 0) { //�ô�VM������$watch�ص���Ч��
                this.$watch.backup = this.$events
                this.$events = {}
            } else if (n === 1) {
                this.$events[type] = []
            } else {
                var callbacks = this.$events[type] || []
                var i = callbacks.length
                while (~--i < 0) {
                    if (callbacks[i] === callback) {
                        return callbacks.splice(i, 1)
                    }
                }
            }
            return this
        },
        $fire: function (type) {
            var special, i, v, callback
            if (/^(\w+)!(\S+)$/.test(type)) {
                special = RegExp.$1
                type = RegExp.$2
            }
            var events = this.$events
            if (!events)
                return
            var args = aslice.call(arguments, 1)
            var detail = [type].concat(args)
            if (special === "all") {
                for (i in avalon.vmodels) {
                    v = avalon.vmodels[i]
                    if (v !== this) {
                        v.$fire.apply(v, detail)
                    }
                }
            } else if (special === "up" || special === "down") {
                var elements = events.expr ? findNodes(events.expr) : []
                if (elements.length === 0)
                    return
                for (i in avalon.vmodels) {
                    v = avalon.vmodels[i]
                    if (v !== this) {
                        if (v.$events.expr) {
                            var eventNodes = findNodes(v.$events.expr)
                            if (eventNodes.length === 0) {
                                continue
                            }
                            //ѭ������vmodel�еĽڵ㣬����ƥ�䣨����ƥ���������ƥ�䣩�Ľڵ㲢���ñ�ʶ
                            /* jshint ignore:start */
                            ap.forEach.call(eventNodes, function (node) {
                                ap.forEach.call(elements, function (element) {
                                    var ok = special === "down" ? element.contains(node) : //���²���
                                        node.contains(element) //����ð��
                                    if (ok) {
                                        node._avalon = v //���������ļ�һ����ʶ
                                    }
                                });
                            })
                            /* jshint ignore:end */
                        }
                    }
                }
                var nodes = DOC.getElementsByTagName("*") //ʵ�ֽڵ�����
                var alls = []
                ap.forEach.call(nodes, function (el) {
                    if (el._avalon) {
                        alls.push(el._avalon)
                        el._avalon = ""
                        el.removeAttribute("_avalon")
                    }
                })
                if (special === "up") {
                    alls.reverse()
                }
                for (i = 0; callback = alls[i++]; ) {
                    if (callback.$fire.apply(callback, detail) === false) {
                        break
                    }
                }
            } else {
                var callbacks = events[type] || []
                var all = events.$all || []
                for (i = 0; callback = callbacks[i++]; ) {
                    if (isFunction(callback))
                        callback.apply(this, args)
                }
                for (i = 0; callback = all[i++]; ) {
                    if (isFunction(callback))
                        callback.apply(this, arguments)
                }
            }
        }
    }
    /*********************************************************************
     *                           modelFactory                             *
     **********************************************************************/
//avalon����ĵķ�������������֮һ����һ����avalon.scan��������һ��ViewModel(VM)
    var VMODELS = avalon.vmodels = {} //����vmodel������������
    avalon.define = function (id, factory) {
        var $id = id.$id || id
        if (!$id) {
            log("warning: vm����ָ��$id")
        }
        if (VMODELS[$id]) {
            log("warning: " + $id + " �Ѿ�������avalon.vmodels��")
        }
        if (typeof id === "object") {
            var model = modelFactory(id)
        } else {
            var scope = {
                $watch: noop
            }
            factory(scope) //�õ����ж���

            model = modelFactory(scope) //͵�컻�գ���scope��Ϊmodel
            stopRepeatAssign = true
            factory(model)
            stopRepeatAssign = false
        }
        model.$id = $id
        return VMODELS[$id] = model
    }

//һЩ����Ҫ������������
    var $$skipArray = String("$id,$watch,$unwatch,$fire,$events,$model,$skipArray,$reinitialize").match(rword)
    var defineProperty = Object.defineProperty
    var canHideOwn = true
//����������֧��ecma262v5��Object.defineProperties���ߴ���BUG������IE8
//��׼�����ʹ��__defineGetter__, __defineSetter__ʵ��
    try {
        defineProperty({}, "_", {
            value: "x"
        })
        var defineProperties = Object.defineProperties
    } catch (e) {
        canHideOwn = false
    }

    function modelFactory(source, $special, $model) {
        if (Array.isArray(source)) {
            var arr = source.concat()
            source.length = 0
            var collection = arrayFactory(source)
            collection.pushArray(arr)
            return collection
        }
        //0 null undefined || Node || VModel(fix IE6-8 createWithProxy $val: val������BUG)
        if (!source || source.nodeType > 0 || (source.$id && source.$events)) {
            return source
        }
        var $skipArray = Array.isArray(source.$skipArray) ? source.$skipArray : []
        $skipArray.$special = $special || {} //ǿ��Ҫ����������
        var $vmodel = {} //Ҫ���صĶ���, ����IE6-8�¿��ܱ�͵��ת��
        $model = $model || {} //vmodels.$model����
        var $events = {} //vmodel.$events����
        var accessors = {} //�������
        var computed = []
        $$skipArray.forEach(function (name) {
            delete source[name]
        })
        var names = Object.keys(source)
        /* jshint ignore:start */
        names.forEach(function (name, accessor) {
            var val = source[name]
            $model[name] = val
            if (isObservable(name, val, $skipArray)) {
                //�ܹ���������accessor
                $events[name] = []
                var valueType = avalon.type(val)
                //�ܹ���������accessor
                if (valueType === "object" && isFunction(val.get) && Object.keys(val).length <= 2) {
                    accessor = makeComputedAccessor(name, val)
                    computed.push(accessor)
                } else if (rcomplexType.test(valueType)) {
                    // issue #940 ���$model���������ʧ https://github.com/RubyLouvre/avalon/issues/940
                    //  $model[name] = {}
                    accessor = makeComplexAccessor(name, val, valueType, $events[name], $model)
                } else {
                    accessor = makeSimpleAccessor(name, val)
                }
                accessors[name] = accessor
            }
        })
        /* jshint ignore:end */
        $vmodel = defineProperties($vmodel, descriptorFactory(accessors), source) //����һ���յ�ViewModel
        for (var i = 0; i < names.length; i++) {
            var name = names[i]
            if (!accessors[name]) {
                $vmodel[name] = source[name]
            }
        }
        //���$id, $model, $events, $watch, $unwatch, $fire
        hideProperty($vmodel, "$id", generateID())
        hideProperty($vmodel, "$model", $model)
        hideProperty($vmodel, "$events", $events)
        /* jshint ignore:start */
        if (canHideOwn) {
            hideProperty($vmodel, "hasOwnProperty", function (name) {
                return name in $vmodel.$model
            })
        } else {
            $vmodel.hasOwnProperty = function (name) {
                return (name in $vmodel.$model) && (name !== "hasOwnProperty")
            }
        }
        /* jshint ignore:end */
        for ( i in EventBus) {
            hideProperty($vmodel, i, EventBus[i].bind($vmodel))
        }

        $vmodel.$reinitialize = function () {
            computed.forEach(function (accessor) {
                delete accessor._value
                delete accessor.oldArgs
                accessor.digest = function () {
                    accessor.call($vmodel)
                }
                dependencyDetection.begin({
                    callback: function (vm, dependency) {//dependencyΪһ��accessor
                        var name = dependency._name
                        if (dependency !== accessor) {
                            var list = vm.$events[name]
                            injectDependency(list, accessor.digest)
                        }
                    }
                })
                try {
                    accessor.get.call($vmodel)
                } finally {
                    dependencyDetection.end()
                }
            })
        }
        $vmodel.$reinitialize()
        return $vmodel
    }


    function hideProperty(host, name, value) {
        if (canHideOwn) {
            Object.defineProperty(host, name, {
                value: value,
                writable: true,
                enumerable: false,
                configurable: true
            })
        } else {
            host[name] = value
        }
    }
//����һ���򵥷�����
    function makeSimpleAccessor(name, value) {
        function accessor(value) {
            var oldValue = accessor._value
            if (arguments.length > 0) {
                if (!stopRepeatAssign && !isEqual(value, oldValue)) {
                    accessor.updateValue(this, value)
                    accessor.notify(this, value, oldValue)
                }
                return this
            } else {
                dependencyDetection.collectDependency(this, accessor)
                return oldValue
            }
        }
        accessorFactory(accessor, name)
        accessor._value = value
        return accessor;
    }

//����һ�����������
    function makeComputedAccessor(name, options) {
        function accessor(value) {//��������
            var oldValue = accessor._value
            var init = ("_value" in accessor)
            if (arguments.length > 0) {
                if (stopRepeatAssign) {
                    return this
                }
                if (typeof accessor.set === "function") {
                    if (accessor.oldArgs !== value) {
                        accessor.oldArgs = value
                        var $events = this.$events
                        var lock = $events[name]
                        $events[name] = [] //��ջص�����ֹ�ڲ�ð�ݶ��������$fire
                        accessor.set.call(this, value)
                        $events[name] = lock
                        value = accessor.get.call(this)
                        if (value !== oldValue) {
                            accessor.updateValue(this, value)
                            accessor.notify(this, value, oldValue) //����$watch�ص�
                        }
                    }
                }
                return this
            } else {
                //���������Լ��ĸ߲����������ͼˢ�º������԰󶨶�����ʽ���ŵ��Լ��Ķ���������
                //���Լ�ע�뵽�Ͳ�������Ķ���������
                value = accessor.get.call(this)
                accessor.updateValue(this, value)
                if (init && oldValue !== value) {
                    accessor.notify(this, value, oldValue) //����$watch�ص�
                }
                return value
            }
        }
        accessor.set = options.set
        accessor.get = options.get
        accessorFactory(accessor, name)
        return accessor
    }

//����һ�����ӷ�����
    function makeComplexAccessor(name, initValue, valueType, list, parentModel) {

        function accessor(value) {
            var oldValue = accessor._value

            var son = accessor._vmodel
            if (arguments.length > 0) {
                if (stopRepeatAssign) {
                    return this
                }
                if (valueType === "array") {
                    var a = son, b = value,
                        an = a.length,
                        bn = b.length
                    a.$lock = true
                    if (an > bn) {
                        a.splice(bn, an - bn)
                    } else if (bn > an) {
                        a.push.apply(a, b.slice(an))
                    }
                    var n = Math.min(an, bn)
                    for (var i = 0; i < n; i++) {
                        a.set(i, b[i])
                    }
                    delete a.$lock
                    a._fire("set")
                } else if (valueType === "object") {
                    value = value.$model ? value.$model : value
                    var observes = this.$events[name] || []
                    var newObject = avalon.mix(true, {}, value)
                    for(i in son ){
                        if(son.hasOwnProperty(i) && ohasOwn.call(newObject,i)){
                            son[i] = newObject[i]
                        }
                    }
                    son = accessor._vmodel = modelFactory(value)
                    son.$events[subscribers] = observes
                    if (observes.length) {
                        observes.forEach(function (data) {
                            if (!data.type) {
                                return //����δ׼����ʱ���Ը���
                            }
                            if (data.rollback) {
                                data.rollback() //��ԭ ms-with ms-on
                            }
                            bindingHandlers[data.type](data, data.vmodels)
                        })
                    }
                }
                accessor.updateValue(this, son.$model)
                accessor.notify(this, this._value, oldValue)
                return this
            } else {
                dependencyDetection.collectDependency(this, accessor)
                return son
            }
        }
        accessorFactory(accessor, name)
        if (Array.isArray(initValue)) {
            parentModel[name] = initValue
        } else {
            parentModel[name] = parentModel[name] || {}
        }
        var son = accessor._vmodel = modelFactory(initValue, 0, parentModel[name])
        son.$events[subscribers] = list
        return accessor
    }

    function globalUpdateValue(vmodel, value) {
        vmodel.$model[this._name] = this._value = value
    }

    function globalNotify(vmodel, value, oldValue) {
        var name = this._name
        var array = vmodel.$events[name] //ˢ��ֵ
        if (array) {
            fireDependencies(array) //ͬ����ͼ
            EventBus.$fire.call(vmodel, name, value, oldValue) //����$watch�ص�
        }
    }

    function accessorFactory(accessor, name) {
        accessor._name = name
        //ͬʱ����_value��model
        accessor.updateValue = globalUpdateValue
        accessor.notify = globalNotify
    }

//�Ƚ�����ֵ�Ƿ����
    var isEqual = Object.is || function (v1, v2) {
            if (v1 === 0 && v2 === 0) {
                return 1 / v1 === 1 / v2
            } else if (v1 !== v1) {
                return v2 !== v2
            } else {
                return v1 === v2
            }
        }

    function isObservable(name, value, $skipArray) {
        if (isFunction(value) || value && value.nodeType) {
            return false
        }
        if ($skipArray.indexOf(name) !== -1) {
            return false
        }
        var $special = $skipArray.$special
        if (name && name.charAt(0) === "$" && !$special[name]) {
            return false
        }
        return true
    }
    function keysVM(obj) {
        var arr = Object.keys(obj.$model ? obj.$model: obj)
        for (var i = 0; i < $$skipArray.length; i++) {
            var index = arr.indexOf($$skipArray[i])
            if (index !== -1) {
                arr.splice(index, 1)
            }
        }
        return arr
    }
    var descriptorFactory = W3C ? function (obj) {
        var descriptors = {}
        for (var i in obj) {
            descriptors[i] = {
                get: obj[i],
                set: obj[i],
                enumerable: true,
                configurable: true
            }
        }
        return descriptors
    } : function (a) {
        return a
    }

//===================�޸��������Object.defineProperties��֧��=================
    if (!canHideOwn) {
        if ("__defineGetter__" in avalon) {
            defineProperty = function (obj, prop, desc) {
                if ('value' in desc) {
                    obj[prop] = desc.value
                }
                if ("get" in desc) {
                    obj.__defineGetter__(prop, desc.get)
                }
                if ('set' in desc) {
                    obj.__defineSetter__(prop, desc.set)
                }
                return obj
            }
            defineProperties = function (obj, descs) {
                for (var prop in descs) {
                    if (descs.hasOwnProperty(prop)) {
                        defineProperty(obj, prop, descs[prop])
                    }
                }
                return obj
            }
        }
        if (IEVersion) {
            var VBClassPool = {}
            window.execScript([// jshint ignore:line
                "Function parseVB(code)",
                "\tExecuteGlobal(code)",
                "End Function" //ת��һ���ı�ΪVB����
            ].join("\n"), "VBScript")
            function VBMediator(instance, accessors, name, value) {// jshint ignore:line
                var accessor = accessors[name]
                if (arguments.length === 4) {
                    accessor.call(instance, value)
                } else {
                    return accessor.call(instance)
                }
            }
            defineProperties = function (name, accessors, properties) {
                // jshint ignore:line
                var buffer = []
                buffer.push(
                    "\r\n\tPrivate [__data__], [__proxy__]",
                    "\tPublic Default Function [__const__](d"+expose+", p"+expose+")",
                    "\t\tSet [__data__] = d"+expose+": set [__proxy__] = p"+expose,
                    "\t\tSet [__const__] = Me", //��ʽ����
                    "\tEnd Function")
                //�����ͨ����,��ΪVBScript��������JS����������ɾ���ԣ�����������Ԥ�ȶ����
                for (name in properties) {
                    if (!accessors.hasOwnProperty(name)) {
                        buffer.push("\tPublic [" + name + "]")
                    }
                }
                $$skipArray.forEach(function (name) {
                    if (!accessors.hasOwnProperty(name)) {
                        buffer.push("\tPublic [" + name + "]")
                    }
                })
                buffer.push("\tPublic [" + 'hasOwnProperty' + "]")
                //��ӷ��������� 
                for (name in accessors) {
                    buffer.push(
                        //���ڲ�֪�Է��ᴫ��ʲô,���set, let������
                        "\tPublic Property Let [" + name + "](val" + expose + ")", //setter
                        "\t\tCall [__proxy__](Me,[__data__], \"" + name + "\", val" + expose + ")",
                        "\tEnd Property",
                        "\tPublic Property Set [" + name + "](val" + expose + ")", //setter
                        "\t\tCall [__proxy__](Me,[__data__], \"" + name + "\", val" + expose + ")",
                        "\tEnd Property",
                        "\tPublic Property Get [" + name + "]", //getter
                        "\tOn Error Resume Next", //��������ʹ��set���,�������������鵱�ַ�������
                        "\t\tSet[" + name + "] = [__proxy__](Me,[__data__],\"" + name + "\")",
                        "\tIf Err.Number <> 0 Then",
                        "\t\t[" + name + "] = [__proxy__](Me,[__data__],\"" + name + "\")",
                        "\tEnd If",
                        "\tOn Error Goto 0",
                        "\tEnd Property")

                }

                buffer.push("End Class")
                var body = buffer.join("\r\n")
                var className =VBClassPool[body]
                if (!className) {
                    className = generateID("VBClass")
                    window.parseVB("Class " + className + body)
                    window.parseVB([
                        "Function " + className + "Factory(a, b)", //����ʵ�������������ؼ��Ĳ���
                        "\tDim o",
                        "\tSet o = (New " + className + ")(a, b)",
                        "\tSet " + className + "Factory = o",
                        "End Function"
                    ].join("\r\n"))
                    VBClassPool[body] = className
                }
                var ret = window[className + "Factory"](accessors, VBMediator) //�õ����Ʒ
                return ret //�õ����Ʒ
            }
        }
    }

    /*********************************************************************
     *          ������飨��ms-each, ms-repeat���ʹ�ã�                     *
     **********************************************************************/

    function arrayFactory(model) {
        var array = []
        array.$id = generateID()
        array.$model = model //����ģ��
        array.$events = {}
        array.$events[subscribers] = []
        array._ = modelFactory({
            length: model.length
        })
        array._.$watch("length", function (a, b) {
            array.$fire("length", a, b)
        })
        for (var i in EventBus) {
            array[i] = EventBus[i]
        }
        avalon.mix(array, arrayPrototype)
        return array
    }

    function mutateArray(method, pos, n, index, method2, pos2, n2) {
        var oldLen = this.length, loop = 2
        while (--loop) {
            switch (method) {
                case "add":
                    /* jshint ignore:start */
                    var array = this.$model.slice(pos, pos + n).map(function (el) {
                        if (rcomplexType.test(avalon.type(el))) {
                            return el.$id ? el : modelFactory(el, 0, el)
                        } else {
                            return el
                        }
                    })
                    /* jshint ignore:end */
                    _splice.apply(this, [pos, 0].concat(array))
                    this._fire("add", pos, n)
                    break
                case "del":
                    var ret = this._splice(pos, n)
                    this._fire("del", pos, n)
                    break
            }
            if (method2) {
                method = method2
                pos = pos2
                n = n2
                loop = 2
                method2 = 0
            }
        }
        this._fire("index", index)
        if (this.length !== oldLen) {
            this._.length = this.length
        }
        return ret
    }

    var _splice = ap.splice
    var arrayPrototype = {
        _splice: _splice,
        _fire: function (method, a, b) {
            fireDependencies(this.$events[subscribers], method, a, b)
        },
        size: function () { //ȡ�����鳤�ȣ������������ͬ����ͼ��length����
            return this._.length
        },
        pushArray: function (array) {
            var m = array.length, n = this.length
            if (m) {
                ap.push.apply(this.$model, array)
                mutateArray.call(this, "add", n, m, Math.max(0, n - 1))
            }
            return  m + n
        },
        push: function () {
            //http://jsperf.com/closure-with-arguments
            var array = []
            var i, n = arguments.length
            for (i = 0; i < n; i++) {
                array[i] = arguments[i]
            }
            return this.pushArray(array)
        },
        unshift: function () {
            var m = arguments.length, n = this.length
            if (m) {
                ap.unshift.apply(this.$model, arguments)
                mutateArray.call(this, "add", 0, m, 0)
            }
            return  m + n //IE67��unshift���᷵�س���
        },
        shift: function () {
            if (this.length) {
                var el = this.$model.shift()
                mutateArray.call(this, "del", 0, 1, 0)
                return el //���ر��Ƴ���Ԫ��
            }
        },
        pop: function () {
            var n = this.length
            if (n) {
                var el = this.$model.pop()
                mutateArray.call(this, "del", n - 1, 1, Math.max(0, n - 2))
                return el //���ر��Ƴ���Ԫ��
            }
        },
        splice: function (start) {
            var m = arguments.length, args = [], change
            var removed = _splice.apply(this.$model, arguments)
            if (removed.length) { //����û�ɾ����Ԫ��
                args.push("del", start, removed.length, 0)
                change = true
            }
            if (m > 2) {  //����û������Ԫ��
                if (change) {
                    args.splice(3, 1, 0, "add", start, m - 2)
                } else {
                    args.push("add", start, m - 2, 0)
                }
                change = true
            }
            if (change) { //���ر��Ƴ���Ԫ��
                return mutateArray.apply(this, args)
            } else {
                return []
            }
        },
        contains: function (el) { //�ж��Ƿ����
            return this.indexOf(el) !== -1
        },
        remove: function (el) { //�Ƴ���һ�����ڸ���ֵ��Ԫ��
            return this.removeAt(this.indexOf(el))
        },
        removeAt: function (index) { //�Ƴ�ָ�������ϵ�Ԫ��
            if (index >= 0) {
                this.$model.splice(index, 1)
                return mutateArray.call(this, "del", index, 1, 0)
            }
            return  []
        },
        clear: function () {
            this.$model.length = this.length = this._.length = 0 //�������
            this._fire("clear", 0)
            return this
        },
        removeAll: function (all) { //�Ƴ�N��Ԫ��
            if (Array.isArray(all)) {
                for (var i = this.length - 1; i >= 0; i--) {
                    if (all.indexOf(this[i]) !== -1) {
                        this.removeAt(i)
                    }
                }
            } else if (typeof all === "function") {
                for ( i = this.length - 1; i >= 0; i--) {
                    var el = this[i]
                    if (all(el, i)) {
                        this.removeAt(i)
                    }
                }
            } else {
                this.clear()
            }
        },
        ensure: function (el) {
            if (!this.contains(el)) { //ֻ�в����ڲ�push
                this.push(el)
            }
            return this
        },
        set: function (index, val) {
            if (index < this.length && index > -1) {
                var valueType = avalon.type(val)
                if (val && val.$model) {
                    val = val.$model
                }
                var target = this[index]
                if (valueType === "object") {
                    for (var i in val) {
                        if (target.hasOwnProperty(i)) {
                            target[i] = val[i]
                        }
                    }
                } else if (valueType === "array") {
                    target.clear().push.apply(target, val)
                } else if (target !== val) {
                    this[index] = val
                    this.$model[index] = val
                    this._fire("set", index, val)
                }
            }
            return this
        }
    }
//�൱��ԭ��bindingExecutors.repeat ��index��֧
    function resetIndex(array, pos) {
        var last = array.length - 1
        for (var el; el = array[pos]; pos++) {
            el.$index = pos
            el.$first = pos === 0
            el.$last = pos === last
        }
    }

    function sortByIndex(array, indexes) {
        var map = {};
        for (var i = 0, n = indexes.length; i < n; i++) {
            map[i] = array[i] // preserve
            var j = indexes[i]
            if (j in map) {
                array[i] = map[j]
                delete map[j]
            } else {
                array[i] = array[j]
            }
        }
    }

    "sort,reverse".replace(rword, function (method) {
        arrayPrototype[method] = function () {
            var newArray = this.$model//����Ҫ�����������
            var oldArray = newArray.concat() //����ԭ��״̬�ľ�����
            var mask = Math.random()
            var indexes = []
            var hasSort
            ap[method].apply(newArray, arguments) //����
            for (var i = 0, n = oldArray.length; i < n; i++) {
                var neo = newArray[i]
                var old = oldArray[i]
                if (isEqual(neo, old)) {
                    indexes.push(i)
                } else {
                    var index = oldArray.indexOf(neo)
                    indexes.push(index)//�õ��������ÿ��Ԫ���ھ������Ӧ��λ��
                    oldArray[index] = mask    //�����Ѿ��ҹ���Ԫ��
                    hasSort = true
                }
            }
            if (hasSort) {
                sortByIndex(this, indexes)
                // sortByIndex(this.$proxy, indexes)
                this._fire("move", indexes)
                this._fire("index", 0)
            }
            return this
        }
    })


    /*********************************************************************
     *                           ��������ϵͳ                             *
     **********************************************************************/
//�������������������ϵ
    var dependencyDetection = (function () {
        var outerFrames = []
        var currentFrame
        return {
            begin: function (accessorObject) {
                //accessorObjectΪһ��ӵ��callback�Ķ���
                outerFrames.push(currentFrame)
                currentFrame = accessorObject
            },
            end: function () {
                currentFrame = outerFrames.pop()
            },
            collectDependency: function (vmodel, accessor) {
                if (currentFrame) {
                    //��dependencyDetection.begin����
                    currentFrame.callback(vmodel, accessor);
                }
            }
        };
    })()
//���󶨶���ע�뵽��������Ķ���������
    var ronduplex = /^(duplex|on)$/
    avalon.injectBinding = function (data) {
        var valueFn = data.evaluator
        if (valueFn) { //�������ֵ����
            dependencyDetection.begin({
                callback: function (vmodel, dependency) {
                    injectDependency(vmodel.$events[dependency._name], data)
                }
            })
            try {
                var value = ronduplex.test(data.type) ? data : valueFn.apply(0, data.args)
                if(value === void 0){
                    delete data.evaluator
                }
                if (data.handler) {
                    data.handler(value, data.element, data)
                }
            } catch (e) {
                log("warning:exception throwed in [avalon.injectBinding] " , e)
                delete data.evaluator
                var node = data.element
                if (node && node.nodeType === 3) {
                    var parent = node.parentNode
                    if (kernel.commentInterpolate) {
                        parent.replaceChild(DOC.createComment(data.value), node)
                    } else {
                        node.data = openTag + (data.oneTime ? "::" : "") + data.value + closeTag
                    }
                }
            } finally {
                dependencyDetection.end()
            }
        }
    }

//��������(�����߲�ķ������򹹽���ͼˢ�º����İ󶨶���)ע�뵽���������� 
    function injectDependency(list, data) {
        if (data.oneTime)
            return
        if (list && avalon.Array.ensure(list, data) && data.element) {
            injectDisposeQueue(data, list)
            if (new Date() - beginTime > 444 ) {
                rejectDisposeQueue()
            }
        }
    }

//֪ͨ����������������Ķ����߸�������
    function fireDependencies(list) {
        if (list && list.length) {
            if (new Date() - beginTime > 444 && typeof list[0] === "object") {
                rejectDisposeQueue()
            }
            var args = aslice.call(arguments, 1)
            for (var i = list.length, fn; fn = list[--i]; ) {
                var el = fn.element
                if (el && el.parentNode) {
                    try {
                        var valueFn = fn.evaluator
                        if (fn.$repeat) {
                            fn.handler.apply(fn, args) //����������ķ���
                        }else if("$repeat" in fn || !valueFn ){//���û��eval,��eval
                            bindingHandlers[fn.type](fn, fn.vmodels)
                        } else if (fn.type !== "on") { //�¼���ֻ�����û�����,�����ɳ��򴥷�
                            var value = valueFn.apply(0, fn.args || [])
                            fn.handler(value, el, fn)
                        }
                    } catch (e) {
                        console.log(e)
                    }
                }
            }
        }
    }
    /*********************************************************************
     *                          ��ʱGC���ջ���                             *
     **********************************************************************/
    var disposeCount = 0
    var disposeQueue = avalon.$$subscribers = []
    var beginTime = new Date()
    var oldInfo = {}
//var uuid2Node = {}
    function getUid(elem, makeID) { //IE9+,��׼�����
        if (!elem.uuid && !makeID) {
            elem.uuid = ++disposeCount
        }
        return elem.uuid
    }

//��ӵ������ж���
    function injectDisposeQueue(data, list) {
        var elem = data.element
        if (!data.uuid) {
            if (elem.nodeType !== 1) {
                data.uuid = data.type + getUid(elem.parentNode)+ "-"+ (++disposeCount)
            } else {
                data.uuid = data.name + "-" + getUid(elem)
            }
        }
        var lists = data.lists || (data.lists = [])
        avalon.Array.ensure(lists, list)
        list.$uuid = list.$uuid || generateID()
        if (!disposeQueue[data.uuid]) {
            disposeQueue[data.uuid] = 1
            disposeQueue.push(data)
        }
    }

    function rejectDisposeQueue(data) {
        if (avalon.optimize)
            return
        var i = disposeQueue.length
        var n = i
        var allTypes = []
        var iffishTypes = {}
        var newInfo = {}
        //��ҳ�������а󶨶�����з��ű���, ֻ�����������仯������
        while (data = disposeQueue[--i]) {
            var type = data.type
            if (newInfo[type]) {
                newInfo[type]++
            } else {
                newInfo[type] = 1
                allTypes.push(type)
            }
        }
        var diff = false
        allTypes.forEach(function (type) {
            if (oldInfo[type] !== newInfo[type]) {
                iffishTypes[type] = 1
                diff = true
            }
        })
        i = n
        if (diff) {
            while (data = disposeQueue[--i]) {
                if (data.element === null) {
                    disposeQueue.splice(i, 1)
                    continue
                }
                if (iffishTypes[data.type] && shouldDispose(data.element)) { //�����û����DOM��
                    disposeQueue.splice(i, 1)
                    delete disposeQueue[data.uuid]
                    //delete uuid2Node[data.element.uuid]
                    var lists = data.lists
                    for (var k = 0, list; list = lists[k++]; ) {
                        avalon.Array.remove(lists, list)
                        avalon.Array.remove(list, data)
                    }
                    disposeData(data)
                }
            }
        }
        oldInfo = newInfo
        beginTime = new Date()
    }

    function disposeData(data) {
        delete disposeQueue[data.uuid] // ���������Ȼ�޷�������
        data.element = null
        data.rollback && data.rollback()
        for (var key in data) {
            data[key] = null
        }
    }

    function shouldDispose(el) {
        try {//IE�£�����ı��ڵ�����DOM��������parentNode�ᱨ��
            var fireError = el.parentNode.nodeType
        } catch (e) {
            return true
        }
        if (el.ifRemove) {
            // ����ڵ㱻�ŵ�ifGroup�����Ƴ�
            if (!root.contains(el.ifRemove) && (ifGroup === el.parentNode)) {
                el.parentNode && el.parentNode.removeChild(el)
                return true
            }
        }
        return el.msRetain ? 0 : (el.nodeType === 1 ? !root.contains(el) : !avalon.contains(root, el))
    }

    /************************************************************************
     *            HTML����(parseHTML, innerHTML, clearHTML)                  *
     ************************************************************************/
// We have to close these tags to support XHTML 
    var tagHooks = {
        area: [1, "<map>", "</map>"],
        param: [1, "<object>", "</object>"],
        col: [2, "<table><colgroup>", "</colgroup></table>"],
        legend: [1, "<fieldset>", "</fieldset>"],
        option: [1, "<select multiple='multiple'>", "</select>"],
        thead: [1, "<table>", "</table>"],
        tr: [2, "<table>", "</table>"],
        td: [3, "<table><tr>", "</tr></table>"],
        g: [1, '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1">', '</svg>'],
        //IE6-8����innerHTML���ɽڵ�ʱ������ֱ�Ӵ���no-scopeԪ����HTML5���±�ǩ
        _default: W3C ? [0, "", ""] : [1, "X<div>", "</div>"] //div���Բ��ñպ�
    }
    tagHooks.th = tagHooks.td
    tagHooks.optgroup = tagHooks.option
    tagHooks.tbody = tagHooks.tfoot = tagHooks.colgroup = tagHooks.caption = tagHooks.thead
    String("circle,defs,ellipse,image,line,path,polygon,polyline,rect,symbol,text,use").replace(rword, function (tag) {
        tagHooks[tag] = tagHooks.g //����SVG
    })
    var rtagName = /<([\w:]+)/  //ȡ����tagName
    var rxhtml = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig
    var rcreate = W3C ? /[^\d\D]/ : /(<(?:script|link|style|meta|noscript))/ig
    var scriptTypes = oneObject(["", "text/javascript", "text/ecmascript", "application/ecmascript", "application/javascript"])
    var rnest = /<(?:tb|td|tf|th|tr|col|opt|leg|cap|area)/ //��Ҫ������Ƕ��ϵ�ı�ǩ
    var script = DOC.createElement("script")
    var rhtml = /<|&#?\w+;/
    avalon.parseHTML = function (html) {
        var fragment = avalonFragment.cloneNode(false)
        if (typeof html !== "string") {
            return fragment
        }
        if (!rhtml.test(html)) {
            fragment.appendChild(DOC.createTextNode(html))
            return fragment
        }
        html = html.replace(rxhtml, "<$1></$2>").trim()
        var tag = (rtagName.exec(html) || ["", ""])[1].toLowerCase(),
        //ȡ�����ǩ��
            wrap = tagHooks[tag] || tagHooks._default,
            wrapper = cinerator,
            firstChild, neo
        if (!W3C) { //fix IE
            html = html.replace(rcreate, "<br class=msNoScope>$1") //��link style script�ȱ�ǩ֮ǰ���һ������
        }
        wrapper.innerHTML = wrap[1] + html + wrap[2]
        var els = wrapper.getElementsByTagName("script")
        if (els.length) { //ʹ��innerHTML���ɵ�script�ڵ㲻�ᷢ��������ִ��text����
            for (var i = 0, el; el = els[i++]; ) {
                if (scriptTypes[el.type]) {
                    //��͵��ת�﷽ʽ�ָ�ִ�нű�����
                    neo = script.cloneNode(false) //FF����ʡ�Բ���
                    ap.forEach.call(el.attributes, function (attr) {
                        if (attr && attr.specified) {
                            neo[attr.name] = attr.value //����������
                            neo.setAttribute(attr.name, attr.value)
                        }
                    })  // jshint ignore:line
                    neo.text = el.text
                    el.parentNode.replaceChild(neo, el) //�滻�ڵ�
                }
            }
        }
        if (!W3C) { //fix IE
            var target = wrap[1] === "X<div>" ? wrapper.lastChild.firstChild : wrapper.lastChild
            if (target && target.tagName === "TABLE" && tag !== "tbody") {
                //IE6-7���� <thead> --> <thead>,<tbody>
                //<tfoot> --> <tfoot>,<tbody>
                //<table> --> <table><tbody></table>
                for (els = target.childNodes, i = 0; el = els[i++]; ) {
                    if (el.tagName === "TBODY" && !el.innerHTML) {
                        target.removeChild(el)
                        break
                    }
                }
            }
            els = wrapper.getElementsByTagName("br")
            var n = els.length
            while (el = els[--n]) {
                if (el.className === "msNoScope") {
                    el.parentNode.removeChild(el)
                }
            }
            for (els = wrapper.all, i = 0; el = els[i++]; ) { //fix VML
                if (isVML(el)) {
                    fixVML(el)
                }
            }
        }
        //�Ƴ�����Ϊ�˷�����Ƕ��ϵ����ӵı�ǩ
        for (i = wrap[0]; i--; wrapper = wrapper.lastChild) {
        }
        while (firstChild = wrapper.firstChild) { // ��wrapper�ϵĽڵ�ת�Ƶ��ĵ���Ƭ�ϣ�
            fragment.appendChild(firstChild)
        }
        return fragment
    }

    function isVML(src) {
        var nodeName = src.nodeName
        return nodeName.toLowerCase() === nodeName && src.scopeName && src.outerText === ""
    }

    function fixVML(node) {
        if (node.currentStyle.behavior !== "url(#default#VML)") {
            node.style.behavior = "url(#default#VML)"
            node.style.display = "inline-block"
            node.style.zoom = 1 //hasLayout
        }
    }
    avalon.innerHTML = function (node, html) {
        if (!W3C && (!rcreate.test(html) && !rnest.test(html))) {
            try {
                node.innerHTML = html
                return
            } catch (e) {
            }
        }
        var a = this.parseHTML(html)
        this.clearHTML(node).appendChild(a)
    }
    avalon.clearHTML = function (node) {
        node.textContent = ""
        while (node.firstChild) {
            node.removeChild(node.firstChild)
        }
        return node
    }

    /*********************************************************************
     *                  avalon��ԭ�ͷ���������                            *
     **********************************************************************/

    function hyphen(target) {
        //ת��Ϊ���ַ��߷��
        return target.replace(/([a-z\d])([A-Z]+)/g, "$1-$2").toLowerCase()
    }

    function camelize(target) {
        //��ǰ�жϣ����getStyle�ȵ�Ч��
        if (!target || target.indexOf("-") < 0 && target.indexOf("_") < 0) {
            return target
        }
        //ת��Ϊ�շ���
        return target.replace(/[-_][^-_]/g, function(match) {
            return match.charAt(1).toUpperCase()
        })
    }

    var fakeClassListMethods = {
        _toString: function() {
            var node = this.node
            var cls = node.className
            var str = typeof cls === "string" ? cls : cls.baseVal
            return str.split(/\s+/).join(" ")
        },
        _contains: function(cls) {
            return (" " + this + " ").indexOf(" " + cls + " ") > -1
        },
        _add: function(cls) {
            if (!this.contains(cls)) {
                this._set(this + " " + cls)
            }
        },
        _remove: function(cls) {
            this._set((" " + this + " ").replace(" " + cls + " ", " "))
        },
        __set: function(cls) {
            cls = cls.trim()
            var node = this.node
            if (rsvg.test(node)) {
                //SVGԪ�ص�className��һ������ SVGAnimatedString { baseVal="", animVal=""}��ֻ��ͨ��set/getAttribute����
                node.setAttribute("class", cls)
            } else {
                node.className = cls
            }
        } //toggle���ڰ汾���죬��˲�ʹ����
    }

    function fakeClassList(node) {
        if (!("classList" in node)) {
            node.classList = {
                node: node
            }
            for (var k in fakeClassListMethods) {
                node.classList[k.slice(1)] = fakeClassListMethods[k]
            }
        }
        return node.classList
    }


    "add,remove".replace(rword, function(method) {
        avalon.fn[method + "Class"] = function(cls) {
            var el = this[0]
            //https://developer.mozilla.org/zh-CN/docs/Mozilla/Firefox/Releases/26
            if (cls && typeof cls === "string" && el && el.nodeType === 1) {
                cls.replace(/\S+/g, function(c) {
                    fakeClassList(el)[method](c)
                })
            }
            return this
        }
    })
    avalon.fn.mix({
        hasClass: function(cls) {
            var el = this[0] || {}
            return el.nodeType === 1 && fakeClassList(el).contains(cls)
        },
        toggleClass: function(value, stateVal) {
            var className, i = 0
            var classNames = String(value).split(/\s+/)
            var isBool = typeof stateVal === "boolean"
            while ((className = classNames[i++])) {
                var state = isBool ? stateVal : !this.hasClass(className)
                this[state ? "addClass" : "removeClass"](className)
            }
            return this
        },
        attr: function(name, value) {
            if (arguments.length === 2) {
                this[0].setAttribute(name, value)
                return this
            } else {
                return this[0].getAttribute(name)
            }
        },
        data: function(name, value) {
            name = "data-" + hyphen(name || "")
            switch (arguments.length) {
                case 2:
                    this.attr(name, value)
                    return this
                case 1:
                    var val = this.attr(name)
                    return parseData(val)
                case 0:
                    var ret = {}
                    ap.forEach.call(this[0].attributes, function(attr) {
                        if (attr) {
                            name = attr.name
                            if (!name.indexOf("data-")) {
                                name = camelize(name.slice(5))
                                ret[name] = parseData(attr.value)
                            }
                        }
                    })
                    return ret
            }
        },
        removeData: function(name) {
            name = "data-" + hyphen(name)
            this[0].removeAttribute(name)
            return this
        },
        css: function(name, value) {
            if (avalon.isPlainObject(name)) {
                for (var i in name) {
                    avalon.css(this, i, name[i])
                }
            } else {
                var ret = avalon.css(this, name, value)
            }
            return ret !== void 0 ? ret : this
        },
        position: function() {
            var offsetParent, offset,
                elem = this[0],
                parentOffset = {
                    top: 0,
                    left: 0
                }
            if (!elem) {
                return
            }
            if (this.css("position") === "fixed") {
                offset = elem.getBoundingClientRect()
            } else {
                offsetParent = this.offsetParent() //�õ�������offsetParent
                offset = this.offset() // �õ���ȷ��offsetParent
                if (offsetParent[0].tagName !== "HTML") {
                    parentOffset = offsetParent.offset()
                }
                parentOffset.top += avalon.css(offsetParent[0], "borderTopWidth", true)
                parentOffset.left += avalon.css(offsetParent[0], "borderLeftWidth", true)

                // Subtract offsetParent scroll positions
                parentOffset.top -= offsetParent.scrollTop()
                parentOffset.left -= offsetParent.scrollLeft()
            }
            return {
                top: offset.top - parentOffset.top - avalon.css(elem, "marginTop", true),
                left: offset.left - parentOffset.left - avalon.css(elem, "marginLeft", true)
            }
        },
        offsetParent: function() {
            var offsetParent = this[0].offsetParent
            while (offsetParent && avalon.css(offsetParent, "position") === "static") {
                offsetParent = offsetParent.offsetParent;
            }
            return avalon(offsetParent || root)
        },
        bind: function(type, fn, phase) {
            if (this[0]) { //�˷���������
                return avalon.bind(this[0], type, fn, phase)
            }
        },
        unbind: function(type, fn, phase) {
            if (this[0]) {
                avalon.unbind(this[0], type, fn, phase)
            }
            return this
        },
        val: function(value) {
            var node = this[0]
            if (node && node.nodeType === 1) {
                var get = arguments.length === 0
                var access = get ? ":get" : ":set"
                var fn = valHooks[getValType(node) + access]
                if (fn) {
                    var val = fn(node, value)
                } else if (get) {
                    return (node.value || "").replace(/\r/g, "")
                } else {
                    node.value = value
                }
            }
            return get ? val : this
        }
    })

    function parseData(data) {
        try {
            if (typeof data === "object")
                return data
            data = data === "true" ? true :
                data === "false" ? false :
                    data === "null" ? null : +data + "" === data ? +data : rbrace.test(data) ? avalon.parseJSON(data) : data
        } catch (e) {}
        return data
    }
    var rbrace = /(?:\{[\s\S]*\}|\[[\s\S]*\])$/,
        rvalidchars = /^[\],:{}\s]*$/,
        rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g,
        rvalidescape = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g,
        rvalidtokens = /"[^"\\\r\n]*"|true|false|null|-?(?:\d+\.|)\d+(?:[eE][+-]?\d+|)/g
    avalon.parseJSON = window.JSON ? JSON.parse : function(data) {
        if (typeof data === "string") {
            data = data.trim();
            if (data) {
                if (rvalidchars.test(data.replace(rvalidescape, "@")
                        .replace(rvalidtokens, "]")
                        .replace(rvalidbraces, ""))) {
                    return (new Function("return " + data))() // jshint ignore:line
                }
            }
            avalon.error("Invalid JSON: " + data)
        }
        return data
    }

//����avalon.fn.scrollLeft, avalon.fn.scrollTop����
    avalon.each({
        scrollLeft: "pageXOffset",
        scrollTop: "pageYOffset"
    }, function(method, prop) {
        avalon.fn[method] = function(val) {
            var node = this[0] || {}, win = getWindow(node),
                top = method === "scrollTop"
            if (!arguments.length) {
                return win ? (prop in win) ? win[prop] : root[method] : node[method]
            } else {
                if (win) {
                    win.scrollTo(!top ? val : avalon(win).scrollLeft(), top ? val : avalon(win).scrollTop())
                } else {
                    node[method] = val
                }
            }
        }
    })

    function getWindow(node) {
        return node.window && node.document ? node : node.nodeType === 9 ? node.defaultView || node.parentWindow : false;
    }
//=============================css���=======================
    var cssHooks = avalon.cssHooks = {}
    var prefixes = ["", "-webkit-", "-o-", "-moz-", "-ms-"]
    var cssMap = {
        "float": W3C ? "cssFloat" : "styleFloat"
    }
    avalon.cssNumber = oneObject("animationIterationCount,columnCount,order,flex,flexGrow,flexShrink,fillOpacity,fontWeight,lineHeight,opacity,orphans,widows,zIndex,zoom")

    avalon.cssName = function(name, host, camelCase) {
        if (cssMap[name]) {
            return cssMap[name]
        }
        host = host || root.style
        for (var i = 0, n = prefixes.length; i < n; i++) {
            camelCase = camelize(prefixes[i] + name)
            if (camelCase in host) {
                return (cssMap[name] = camelCase)
            }
        }
        return null
    }
    cssHooks["@:set"] = function(node, name, value) {
        try { //node.style.width = NaN;node.style.width = "xxxxxxx";node.style.width = undefine �ھ�ʽIE�»����쳣
            node.style[name] = value
        } catch (e) {}
    }
    if (window.getComputedStyle) {
        cssHooks["@:get"] = function(node, name) {
            if (!node || !node.style) {
                throw new Error("getComputedStyleҪ����һ���ڵ� " + node)
            }
            var ret, styles = getComputedStyle(node, null)
            if (styles) {
                ret = name === "filter" ? styles.getPropertyValue(name) : styles[name]
                if (ret === "") {
                    ret = node.style[name] //�����������Ҫ�����ֶ�ȡ������ʽ
                }
            }
            return ret
        }
        cssHooks["opacity:get"] = function(node) {
            var ret = cssHooks["@:get"](node, "opacity")
            return ret === "" ? "1" : ret
        }
    } else {
        var rnumnonpx = /^-?(?:\d*\.)?\d+(?!px)[^\d\s]+$/i
        var rposition = /^(top|right|bottom|left)$/
        var ralpha = /alpha\([^)]*\)/i
        var ie8 = !! window.XDomainRequest
        var salpha = "DXImageTransform.Microsoft.Alpha"
        var border = {
            thin: ie8 ? '1px' : '2px',
            medium: ie8 ? '3px' : '4px',
            thick: ie8 ? '5px' : '6px'
        }
        cssHooks["@:get"] = function(node, name) {
            //ȡ�þ�ȷֵ���������п����Ǵ�em,pc,mm,pt,%�ȵ�λ
            var currentStyle = node.currentStyle
            var ret = currentStyle[name]
            if ((rnumnonpx.test(ret) && !rposition.test(ret))) {
                //�٣�����ԭ�е�style.left, runtimeStyle.left,
                var style = node.style,
                    left = style.left,
                    rsLeft = node.runtimeStyle.left
                //�����ڢ۴���style.left = xxx��Ӱ�쵽currentStyle.left��
                //��˰���currentStyle.left�ŵ�runtimeStyle.left��
                //runtimeStyle.leftӵ��������ȼ�������style.leftӰ��
                node.runtimeStyle.left = currentStyle.left
                //�۽���ȷֵ������style.left��Ȼ��ͨ��IE����һ��˽������ style.pixelLeft
                //�õ���λΪpx�Ľ����fontSize�ķ�֧��http://bugs.jquery.com/ticket/760
                style.left = name === 'fontSize' ? '1em' : (ret || 0)
                ret = style.pixelLeft + "px"
                //�ܻ�ԭ style.left��runtimeStyle.left
                style.left = left
                node.runtimeStyle.left = rsLeft
            }
            if (ret === "medium") {
                name = name.replace("Width", "Style")
                //border width Ĭ��ֵΪmedium����ʹ��Ϊ0"
                if (currentStyle[name] === "none") {
                    ret = "0px"
                }
            }
            return ret === "" ? "auto" : border[ret] || ret
        }
        cssHooks["opacity:set"] = function(node, name, value) {
            var style = node.style
            var opacity = isFinite(value) && value <= 1 ? "alpha(opacity=" + value * 100 + ")" : ""
            var filter = style.filter || "";
            style.zoom = 1
            //����ʹ�����·�ʽ����͸����
            //node.filters.alpha.opacity = value * 100
            style.filter = (ralpha.test(filter) ?
                filter.replace(ralpha, opacity) :
            filter + " " + opacity).trim()
            if (!style.filter) {
                style.removeAttribute("filter")
            }
        }
        cssHooks["opacity:get"] = function(node) {
            //�������Ļ�ȡIE͸��ֵ�ķ�ʽ������Ҫ���������ˣ�
            var alpha = node.filters.alpha || node.filters[salpha],
                op = alpha && alpha.enabled ? alpha.opacity : 100
            return (op / 100) + "" //ȷ�����ص����ַ���
        }
    }

    "top,left".replace(rword, function(name) {
        cssHooks[name + ":get"] = function(node) {
            var computed = cssHooks["@:get"](node, name)
            return /px$/.test(computed) ? computed :
            avalon(node).position()[name] + "px"
        }
    })

    var cssShow = {
        position: "absolute",
        visibility: "hidden",
        display: "block"
    }

    var rdisplayswap = /^(none|table(?!-c[ea]).+)/

    function showHidden(node, array) {
        //http://www.cnblogs.com/rubylouvre/archive/2012/10/27/2742529.html
        if (node.offsetWidth <= 0) { //opera.offsetWidth����С��0
            if (rdisplayswap.test(cssHooks["@:get"](node, "display"))) {
                var obj = {
                    node: node
                }
                for (var name in cssShow) {
                    obj[name] = node.style[name]
                    node.style[name] = cssShow[name]
                }
                array.push(obj)
            }
            var parent = node.parentNode
            if (parent && parent.nodeType === 1) {
                showHidden(parent, array)
            }
        }
    }
    "Width,Height".replace(rword, function(name) { //fix 481
        var method = name.toLowerCase(),
            clientProp = "client" + name,
            scrollProp = "scroll" + name,
            offsetProp = "offset" + name
        cssHooks[method + ":get"] = function(node, which, override) {
            var boxSizing = -4
            if (typeof override === "number") {
                boxSizing = override
            }
            which = name === "Width" ? ["Left", "Right"] : ["Top", "Bottom"]
            var ret = node[offsetProp] // border-box 0
            if (boxSizing === 2) { // margin-box 2
                return ret + avalon.css(node, "margin" + which[0], true) + avalon.css(node, "margin" + which[1], true)
            }
            if (boxSizing < 0) { // padding-box  -2
                ret = ret - avalon.css(node, "border" + which[0] + "Width", true) - avalon.css(node, "border" + which[1] + "Width", true)
            }
            if (boxSizing === -4) { // content-box -4
                ret = ret - avalon.css(node, "padding" + which[0], true) - avalon.css(node, "padding" + which[1], true)
            }
            return ret
        }
        cssHooks[method + "&get"] = function(node) {
            var hidden = [];
            showHidden(node, hidden);
            var val = cssHooks[method + ":get"](node)
            for (var i = 0, obj; obj = hidden[i++];) {
                node = obj.node
                for (var n in obj) {
                    if (typeof obj[n] === "string") {
                        node.style[n] = obj[n]
                    }
                }
            }
            return val;
        }
        avalon.fn[method] = function(value) { //�������display
            var node = this[0]
            if (arguments.length === 0) {
                if (node.setTimeout) { //ȡ�ô��ڳߴ�,IE9�������node.innerWidth /innerHeight����
                    return node["inner" + name] || node.document.documentElement[clientProp] ||
                        node.document.body[clientProp]//IE6��ǰ�����ֱ�Ϊundefine,0
                }
                if (node.nodeType === 9) { //ȡ��ҳ��ߴ�
                    var doc = node.documentElement
                    //FF chrome    html.scrollHeight< body.scrollHeight
                    //IE ��׼ģʽ : html.scrollHeight> body.scrollHeight
                    //IE ����ģʽ : html.scrollHeight �����ڿ��Ӵ��ڶ�һ�㣿
                    return Math.max(node.body[scrollProp], doc[scrollProp], node.body[offsetProp], doc[offsetProp], doc[clientProp])
                }
                return cssHooks[method + "&get"](node)
            } else {
                return this.css(method, value)
            }
        }
        avalon.fn["inner" + name] = function() {
            return cssHooks[method + ":get"](this[0], void 0, -2)
        }
        avalon.fn["outer" + name] = function(includeMargin) {
            return cssHooks[method + ":get"](this[0], void 0, includeMargin === true ? 2 : 0)
        }
    })
    avalon.fn.offset = function() { //ȡ�þ���ҳ�����ҽǵ�����
        var node = this[0],
            box = {
                left: 0,
                top: 0
            }
        if (!node || !node.tagName || !node.ownerDocument) {
            return box
        }
        var doc = node.ownerDocument,
            body = doc.body,
            root = doc.documentElement,
            win = doc.defaultView || doc.parentWindow
        if (!avalon.contains(root, node)) {
            return box
        }
        //http://hkom.blog1.fc2.com/?mode=m&no=750 body��ƫ�����ǲ�����margin��
        //���ǿ���ͨ��getBoundingClientRect�����Ԫ�������client��rect.
        //http://msdn.microsoft.com/en-us/library/ms536433.aspx
        if (node.getBoundingClientRect) {
            box = node.getBoundingClientRect() // BlackBerry 5, iOS 3 (original iPhone)
        }
        //chrome/IE6: body.scrollTop, firefox/other: root.scrollTop
        var clientTop = root.clientTop || body.clientTop,
            clientLeft = root.clientLeft || body.clientLeft,
            scrollTop = Math.max(win.pageYOffset || 0, root.scrollTop, body.scrollTop),
            scrollLeft = Math.max(win.pageXOffset || 0, root.scrollLeft, body.scrollLeft)
        // �ѹ�������ӵ�left,top��ȥ��
        // IEһЩ�汾�л��Զ�ΪHTMLԪ�ؼ���2px��border��������Ҫȥ����
        // http://msdn.microsoft.com/en-us/library/ms533564(VS.85).aspx
        return {
            top: box.top + scrollTop - clientTop,
            left: box.left + scrollLeft - clientLeft
        }
    }

    //==================================val���============================

    function getValType(elem) {
        var ret = elem.tagName.toLowerCase()
        return ret === "input" && /checkbox|radio/.test(elem.type) ? "checked" : ret
    }
    var roption = /^<option(?:\s+\w+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*\s+value[\s=]/i
    var valHooks = {
        "option:get": IEVersion ? function(node) {
            //��IE11��W3C�����û��ָ��value����ônode.valueĬ��Ϊnode.text������trim��������IE9-10����ȡinnerHTML(ûtrim����)
            //specified�����ɿ������ͨ������outerHTML�ж��û���û����ʾ����value
            return roption.test(node.outerHTML) ? node.value : node.text.trim()
        } : function(node) {
            return node.value
        },
        "select:get": function(node, value) {
            var option, options = node.options,
                index = node.selectedIndex,
                getter = valHooks["option:get"],
                one = node.type === "select-one" || index < 0,
                values = one ? null : [],
                max = one ? index + 1 : options.length,
                i = index < 0 ? max : one ? index : 0
            for (; i < max; i++) {
                option = options[i]
                //��ʽIE��reset�󲻻�ı�selected����Ҫ����i === index�ж�
                //���ǹ�������disabled��optionԪ�أ�����safari5�£��������selectΪdisable����ô�����к��Ӷ�disable
                //��˵�һ��Ԫ��Ϊdisable����Ҫ������Ƿ���ʽ������disable���丸�ڵ��disable���
                if ((option.selected || i === index) && !option.disabled) {
                    value = getter(option)
                    if (one) {
                        return value
                    }
                    //�ռ�����selectedֵ������鷵��
                    values.push(value)
                }
            }
            return values
        },
        "select:set": function(node, values, optionSet) {
            values = [].concat(values) //ǿ��ת��Ϊ����
            var getter = valHooks["option:get"]
            for (var i = 0, el; el = node.options[i++];) {
                if ((el.selected = values.indexOf(getter(el)) > -1)) {
                    optionSet = true
                }
            }
            if (!optionSet) {
                node.selectedIndex = -1
            }
        }
    }

    /*********************************************************************
     *                          ����ϵͳ                                  *
     **********************************************************************/
    var meta = {
        '\b': '\\b',
        '\t': '\\t',
        '\n': '\\n',
        '\f': '\\f',
        '\r': '\\r',
        '"': '\\"',
        '\\': '\\\\'
    }
    var quote = window.JSON && JSON.stringify || function(str) {
            return '"' + str.replace(/[\\\"\x00-\x1f]/g, function(a) {
                    var c = meta[a];
                    return typeof c === 'string' ? c :
                    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                }) + '"'
        }

    var keywords = [
        "break,case,catch,continue,debugger,default,delete,do,else,false",
        "finally,for,function,if,in,instanceof,new,null,return,switch,this",
        "throw,true,try,typeof,var,void,while,with", /* �ؼ���*/
        "abstract,boolean,byte,char,class,const,double,enum,export,extends",
        "final,float,goto,implements,import,int,interface,long,native",
        "package,private,protected,public,short,static,super,synchronized",
        "throws,transient,volatile", /*������*/
        "arguments,let,yield,undefined" /* ECMA 5 - use strict*/].join(",")
    var rrexpstr = /\/\*[\w\W]*?\*\/|\/\/[^\n]*\n|\/\/[^\n]*$|"(?:[^"\\]|\\[\w\W])*"|'(?:[^'\\]|\\[\w\W])*'|[\s\t\n]*\.[\s\t\n]*[$\w\.]+/g
    var rsplit = /[^\w$]+/g
    var rkeywords = new RegExp(["\\b" + keywords.replace(/,/g, '\\b|\\b') + "\\b"].join('|'), 'g')
    var rnumber = /\b\d[^,]*/g
    var rcomma = /^,+|,+$/g
    var variablePool = new Cache(512)
    var getVariables = function (code) {
        var key = "," + code.trim()
        var ret = variablePool.get(key)
        if (ret) {
            return ret
        }
        var match = code
            .replace(rrexpstr, "")
            .replace(rsplit, ",")
            .replace(rkeywords, "")
            .replace(rnumber, "")
            .replace(rcomma, "")
            .split(/^$|,+/)
        return variablePool.put(key, uniqSet(match))
    }
    /*��Ӹ�ֵ���*/

    function addAssign(vars, scope, name, data) {
        var ret = [],
            prefix = " = " + name + "."
        for (var i = vars.length, prop; prop = vars[--i]; ) {
            if (scope.hasOwnProperty(prop)) {
                ret.push(prop + prefix + prop)
                data.vars.push(prop)
                if (data.type === "duplex") {
                    vars.get = name + "." + prop
                }
                vars.splice(i, 1)
            }
        }
        return ret
    }

    function uniqSet(array) {
        var ret = [],
            unique = {}
        for (var i = 0; i < array.length; i++) {
            var el = array[i]
            var id = el && typeof el.$id === "string" ? el.$id : el
            if (!unique[id]) {
                unique[id] = ret.push(el)
            }
        }
        return ret
    }
//������ֵ�������Ա�������
    var evaluatorPool = new Cache(128)
//ȡ����ֵ�������䴫��
    var rduplex = /\w\[.*\]|\w\.\w/
    var rproxy = /(\$proxy\$[a-z]+)\d+$/
    var rthimRightParentheses = /\)\s*$/
    var rthimOtherParentheses = /\)\s*\|/g
    var rquoteFilterName = /\|\s*([$\w]+)/g
    var rpatchBracket = /"\s*\["/g
    var rthimLeftParentheses = /"\s*\(/g
    function parseFilter(val, filters) {
        filters = filters
            .replace(rthimRightParentheses, "")//��������С����
            .replace(rthimOtherParentheses, function () {//��������С����
                return "],|"
            })
            .replace(rquoteFilterName, function (a, b) { //����|��������Ĺ�����������
                return "[" + quote(b)
            })
            .replace(rpatchBracket, function () {
                return '"],["'
            })
            .replace(rthimLeftParentheses, function () {
                return '",'
            }) + "]"
        return  "return this.filters.$filter(" + val + ", " + filters + ")"
    }

    function parseExpr(code, scopes, data) {
        var dataType = data.type
        var filters = data.filters || ""
        var exprId = scopes.map(function (el) {
                return String(el.$id).replace(rproxy, "$1")
            }) + code + dataType + filters
        var vars = getVariables(code).concat(),
            assigns = [],
            names = [],
            args = [],
            prefix = ""
        //args ��һ���������飬 names �ǽ�Ҫ���ɵ���ֵ�����Ĳ���
        scopes = uniqSet(scopes)
        data.vars = []
        for (var i = 0, sn = scopes.length; i < sn; i++) {
            if (vars.length) {
                var name = "vm" + expose + "_" + i
                names.push(name)
                args.push(scopes[i])
                assigns.push.apply(assigns, addAssign(vars, scopes[i], name, data))
            }
        }
        if (!assigns.length && dataType === "duplex") {
            return
        }
        if (dataType !== "duplex" && (code.indexOf("||") > -1 || code.indexOf("&&") > -1)) {
            //https://github.com/RubyLouvre/avalon/issues/583
            data.vars.forEach(function (v) {
                var reg = new RegExp("\\b" + v + "(?:\\.\\w+|\\[\\w+\\])+", "ig")
                code = code.replace(reg, function (_, cap) {
                    var c = _.charAt(v.length)
                    //var r = IEVersion ? code.slice(arguments[1] + _.length) : RegExp.rightContext
                    //https://github.com/RubyLouvre/avalon/issues/966
                    var r = code.slice(cap + _.length)
                    var method = /^\s*\(/.test(r)
                    if (c === "." || c === "[" || method) {//����vΪaa,����ֻƥ��aa.bb,aa[cc],��ƥ��aaa.xxx
                        var name = "var" + String(Math.random()).replace(/^0\./, "")
                        if (method) {//array.size()
                            var array = _.split(".")
                            if (array.length > 2) {
                                var last = array.pop()
                                assigns.push(name + " = " + array.join("."))
                                return name + "." + last
                            } else {
                                return _
                            }
                        }
                        assigns.push(name + " = " + _)
                        return name
                    } else {
                        return _
                    }
                })
            })
        }
        //---------------args----------------
        data.args = args
        //---------------cache----------------
        delete data.vars
        var fn = evaluatorPool.get(exprId) //ֱ�Ӵӻ��棬����ظ�����
        if (fn) {
            data.evaluator = fn
            return
        }
        prefix = assigns.join(", ")
        if (prefix) {
            prefix = "var " + prefix
        }
        if (/\S/.test(filters)) { //�ı��󶨣�˫���󶨲��й�����
            if (!/text|html/.test(data.type)) {
                throw Error("ms-" + data.type + "��֧�ֹ�����")
            }
            code = "\nvar ret" + expose + " = " + code + ";\r\n"
            code += parseFilter("ret" + expose, filters)
            try {
                fn = Function.apply(noop, names.concat("'use strict';\n" + prefix + code))
                data.evaluator = evaluatorPool.put(exprId, function() {
                    return fn.apply(avalon, arguments)//ȷ�������ڱ��������ʹ��this��ȡavalon����
                })
            } catch (e) {
                log("debug: parse error," + e.message)
            }
            vars = assigns = names = null //�ͷ��ڴ�
            return
        } else if (dataType === "duplex") { //˫����
            var _body = "'use strict';\nreturn function(vvv){\n\t" +
                prefix +
                ";\n\tif(!arguments.length){\n\t\treturn " +
                code +
                "\n\t}\n\t" + (!rduplex.test(code) ? vars.get : code) +
                "= vvv;\n} "
            try {
                fn = Function.apply(noop, names.concat(_body))
                data.evaluator = evaluatorPool.put(exprId, fn)
            } catch (e) {
                log("debug: parse error," + e.message)
            }
            vars = assigns = names = null //�ͷ��ڴ�
            return
        } else if (dataType === "on") { //�¼���
            if (code.indexOf("(") === -1) {
                code += ".call(this, $event)"
            } else {
                code = code.replace("(", ".call(this,")
            }
            names.push("$event")
            code = "\nreturn " + code + ";" //IEȫ�� Function("return ")������ҪFunction("return ;")
            var lastIndex = code.lastIndexOf("\nreturn")
            var header = code.slice(0, lastIndex)
            var footer = code.slice(lastIndex)
            code = header + "\n" + footer
        } else { //������
            code = "\nreturn " + code + ";" //IEȫ�� Function("return ")������ҪFunction("return ;")
        }
        try {
            fn = Function.apply(noop, names.concat("'use strict';\n" + prefix + code))
            data.evaluator = evaluatorPool.put(exprId, fn)
        } catch (e) {
            log("debug: parse error," + e.message)
        }
        vars = assigns = names = null //�ͷ��ڴ�
    }
    function stringifyExpr(code) {
        var hasExpr = rexpr.test(code) //����ms-class="width{{w}}"�����
        if (hasExpr) {
            var array = scanExpr(code)
            if (array.length === 1) {
                return array[0].value
            }
            return array.map(function (el) {
                return el.expr ? "(" + el.value + ")" : quote(el.value)
            }).join(" + ")
        } else {
            return code
        }
    }
//parseExpr���������ô���

    function parseExprProxy(code, scopes, data, noRegister) {
        code = code || "" //code ����δ����
        parseExpr(code, scopes, data)
        if (data.evaluator && !noRegister) {
            data.handler = bindingExecutors[data.handlerName || data.type]
            //�������
            //����ǳ���Ҫ,����ͨ���ж���ͼˢ�º�����element�Ƿ���DOM������
            //�����Ƴ��������б�
            avalon.injectBinding(data)
        }
    }
    avalon.parseExprProxy = parseExprProxy
    /*********************************************************************
     *                           ɨ��ϵͳ                                 *
     **********************************************************************/

    avalon.scan = function(elem, vmodel) {
        elem = elem || root
        var vmodels = vmodel ? [].concat(vmodel) : []
        scanTag(elem, vmodels)
    }

//http://www.w3.org/TR/html5/syntax.html#void-elements
    var stopScan = oneObject("area,base,basefont,br,col,command,embed,hr,img,input,link,meta,param,source,track,wbr,noscript,script,style,textarea".toUpperCase())

    function checkScan(elem, callback, innerHTML) {
        var id = setTimeout(function() {
            var currHTML = elem.innerHTML
            clearTimeout(id)
            if (currHTML === innerHTML) {
                callback()
            } else {
                checkScan(elem, callback, currHTML)
            }
        })
    }


    function createSignalTower(elem, vmodel) {
        var id = elem.getAttribute("avalonctrl") || vmodel.$id
        elem.setAttribute("avalonctrl", id)
        vmodel.$events.expr = elem.tagName + '[avalonctrl="' + id + '"]'
    }

    var getBindingCallback = function(elem, name, vmodels) {
        var callback = elem.getAttribute(name)
        if (callback) {
            for (var i = 0, vm; vm = vmodels[i++]; ) {
                if (vm.hasOwnProperty(callback) && typeof vm[callback] === "function") {
                    return vm[callback]
                }
            }
        }
    }

    function executeBindings(bindings, vmodels) {
        for (var i = 0, data; data = bindings[i++]; ) {
            data.vmodels = vmodels
            bindingHandlers[data.type](data, vmodels)
            if (data.evaluator && data.element && data.element.nodeType === 1) { //�Ƴ����ݰ󶨣���ֹ�����ν���
                //chromeʹ��removeAttributeNode�Ƴ������ڵ����Խڵ�ʱ�ᱨ�� https://github.com/RubyLouvre/avalon/issues/99
                data.element.removeAttribute(data.name)
            }
        }
        bindings.length = 0
    }

//https://github.com/RubyLouvre/avalon/issues/636
    var mergeTextNodes = IEVersion && window.MutationObserver ? function (elem) {
        var node = elem.firstChild, text
        while (node) {
            var aaa = node.nextSibling
            if (node.nodeType === 3) {
                if (text) {
                    text.nodeValue += node.nodeValue
                    elem.removeChild(node)
                } else {
                    text = node
                }
            } else {
                text = null
            }
            node = aaa
        }
    } : 0
    var roneTime = /^\s*::/
    var rmsAttr = /ms-(\w+)-?(.*)/
    var priorityMap = {
        "if": 10,
        "repeat": 90,
        "data": 100,
        "widget": 110,
        "each": 1400,
        "with": 1500,
        "duplex": 2000,
        "on": 3000
    }

    var events = oneObject("animationend,blur,change,input,click,dblclick,focus,keydown,keypress,keyup,mousedown,mouseenter,mouseleave,mousemove,mouseout,mouseover,mouseup,scan,scroll,submit")
    var obsoleteAttrs = oneObject("value,title,alt,checked,selected,disabled,readonly,enabled")
    function bindingSorter(a, b) {
        return a.priority - b.priority
    }

    function scanAttr(elem, vmodels, match) {
        var scanNode = true
        if (vmodels.length) {
            var attributes = getAttributes ? getAttributes(elem) : elem.attributes
            var bindings = []
            var fixAttrs = []
            var msData = {}
            var uniq = {}
            for (var i = 0, attr; attr = attributes[i++]; ) {
                if (attr.specified) {
                    if (match = attr.name.match(rmsAttr)) {
                        //�������ָ��ǰ׺������
                        var type = match[1]
                        var param = match[2] || ""
                        var value = attr.value
                        var name = attr.name
                        if (uniq[name]) {//IE8��ms-repeat,ms-with BUG
                            continue
                        }
                        uniq[name] = 1
                        if (events[type]) {
                            param = type
                            type = "on"
                        } else if (obsoleteAttrs[type]) {
                            if (type === "enabled") {//�Ե�ms-enabled��,��ms-disabled����
                                log("warning!ms-enabled��ms-attr-enabled�Ѿ�������")
                                type = "disabled"
                                value = "!(" + value + ")"
                            }
                            param = type
                            type = "attr"
                            name = "ms-" + type + "-" + param
                            fixAttrs.push([attr.name, name, value])
                        }
                        msData[name] = value
                        if (typeof bindingHandlers[type] === "function") {
                            var newValue = value.replace(roneTime, "")
                            var oneTime = value !== newValue
                            var binding = {
                                type: type,
                                param: param,
                                element: elem,
                                name: name,
                                value: newValue,
                                oneTime: oneTime,
                                uuid: name + "-" + getUid(elem),
                                //chrome��firefox��Number(param)�õ���ֵ��һ�� #855
                                priority: (priorityMap[type] || type.charCodeAt(0) * 10) + (Number(param.replace(/\D/g, "")) || 0)
                            }
                            if (type === "html" || type === "text") {
                                var token = getToken(value)
                                avalon.mix(binding, token)
                                binding.filters = binding.filters.replace(rhasHtml, function () {
                                    binding.type = "html"
                                    binding.group = 1
                                    return ""
                                })// jshint ignore:line
                            } else if (type === "duplex") {
                                var hasDuplex = name
                            } else if (name === "ms-if-loop") {
                                binding.priority += 100
                            }
                            bindings.push(binding)
                            if (type === "widget") {
                                elem.msData = elem.msData || msData
                            }
                        }
                    }
                }
            }
            if (bindings.length) {
                bindings.sort(bindingSorter)
                fixAttrs.forEach(function (arr) {
                    log("warning!�����" + arr[1] + "����" + arr[0] + "!")
                    elem.removeAttribute(arr[0])
                    elem.setAttribute(arr[1], arr[2])
                })
                //http://bugs.jquery.com/ticket/7071
                //��IE�¶�VML��ȡtype����,���ô�Ԫ���������Զ����<Failed>
                if (hasDuplex && msData["ms-attr-value"] && !elem.scopeName && elem.type === "text") {
                    log("warning!һ���ؼ�����ͬʱ����ms-attr-value��" + hasDuplex)
                }
                for (i = 0; binding = bindings[i]; i++) {
                    type = binding.type
                    if (rnoscanAttrBinding.test(type)) {
                        return executeBindings(bindings.slice(0, i + 1), vmodels)
                    } else if (scanNode) {
                        scanNode = !rnoscanNodeBinding.test(type)
                    }
                }
                executeBindings(bindings, vmodels)
            }
        }
        if (scanNode && !stopScan[elem.tagName] && rbind.test(elem.innerHTML.replace(rlt, "<").replace(rgt, ">"))) {
            mergeTextNodes && mergeTextNodes(elem)
            scanNodeList(elem, vmodels) //ɨ������Ԫ��
        }
    }
    var rnoscanAttrBinding = /^if|widget|repeat$/
    var rnoscanNodeBinding = /^each|with|html|include$/
//IE67�£���ѭ�����У�һ���ڵ������ͨ��cloneNode�õ����Զ������Ե�specifiedΪfalse���޷���������ķ�֧��
//���������ȥ��scanAttr�е�attr.specified��⣬һ��Ԫ�ػ���80+�����Խڵ㣨��Ϊ�������ֹ����������Զ������ԣ��������׿���ҳ��
    if (!W3C) {
        var attrPool = new Cache(512)
        var rattrs = /\s+(ms-[^=\s]+)(?:=("[^"]*"|'[^']*'|[^\s>]+))?/g,
            rquote = /^['"]/,
            rtag = /<\w+\b(?:(["'])[^"]*?(\1)|[^>])*>/i,
            ramp = /&amp;/g
        //IE6-8����HTML5�±�ǩ���Ὣ���ֽ�����Ԫ�ؽڵ���һ���ı��ڵ�
        //<body><section>ddd</section></body>
        //        window.onload = function() {
        //            var body = document.body
        //            for (var i = 0, el; el = body.children[i++]; ) {
        //                avalon.log(el.outerHTML)
        //            }
        //        }
        //�������<SECTION>, </SECTION>
        var getAttributes = function (elem) {
            var html = elem.outerHTML
            //����IE6-8����HTML5�±�ǩ���������<br>�Ȱ�պϱ�ǩouterHTMLΪ�յ����
            if (html.slice(0, 2) === "</" || !html.trim()) {
                return []
            }
            var str = html.match(rtag)[0]
            var attributes = [],
                match,
                k, v
            var ret = attrPool.get(str)
            if (ret) {
                return ret
            }
            while (k = rattrs.exec(str)) {
                v = k[2]
                if (v) {
                    v = (rquote.test(v) ? v.slice(1, -1) : v).replace(ramp, "&")
                }
                var name = k[1].toLowerCase()
                match = name.match(rmsAttr)
                var binding = {
                    name: name,
                    specified: true,
                    value: v || ""
                }
                attributes.push(binding)
            }
            return attrPool.put(str, attributes)
        }
    }

    function scanNodeList(parent, vmodels) {
        var nodes = avalon.slice(parent.childNodes)
        scanNodeArray(nodes, vmodels)
    }

    function scanNodeArray(nodes, vmodels) {
        for (var i = 0, node; node = nodes[i++];) {
            switch (node.nodeType) {
                case 1:
                    scanTag(node, vmodels) //ɨ��Ԫ�ؽڵ�
                    if (node.msCallback) {
                        node.msCallback()
                        node.msCallback = void 0
                    }
                    break
                case 3:
                    if(rexpr.test(node.nodeValue)){
                        scanText(node, vmodels, i) //ɨ���ı��ڵ�
                    }
                    break
            }
        }
    }


    function scanTag(elem, vmodels, node) {
        //ɨ��˳��  ms-skip(0) --> ms-important(1) --> ms-controller(2) --> ms-if(10) --> ms-repeat(100) 
        //--> ms-if-loop(110) --> ms-attr(970) ...--> ms-each(1400)-->ms-with(1500)--��ms-duplex(2000)���
        var a = elem.getAttribute("ms-skip")
        //#360 �ھ�ʽIE�� Object��ǩ������Flash����Դʱ,���ܳ���û��getAttributeNode,innerHTML������
        if (!elem.getAttributeNode) {
            return log("warning " + elem.tagName + " no getAttributeNode method")
        }
        var b = elem.getAttributeNode("ms-important")
        var c = elem.getAttributeNode("ms-controller")
        if (typeof a === "string") {
            return
        } else if (node = b || c) {
            var newVmodel = avalon.vmodels[node.value]
            if (!newVmodel) {
                return
            }
            //ms-important��������VM��ms-controller�෴
            vmodels = node === b ? [newVmodel] : [newVmodel].concat(vmodels)
            var name = node.name
            elem.removeAttribute(name) //removeAttributeNode����ˢ��[ms-controller]��ʽ����
            avalon(elem).removeClass(name)
            createSignalTower(elem, newVmodel)
        }
        scanAttr(elem, vmodels) //ɨ�����Խڵ�
    }
    var rhasHtml = /\|\s*html(?:\b|$)/,
        r11a = /\|\|/g,
        rlt = /&lt;/g,
        rgt = /&gt;/g,
        rstringLiteral = /(['"])(\\\1|.)+?\1/g
    function getToken(value) {
        if (value.indexOf("|") > 0) {
            var scapegoat = value.replace(rstringLiteral, function (_) {
                return Array(_.length + 1).join("1")// jshint ignore:line
            })
            var index = scapegoat.replace(r11a, "\u1122\u3344").indexOf("|") //�ɵ����ж�·��
            if (index > -1) {
                return {
                    filters: value.slice(index),
                    value: value.slice(0, index),
                    expr: true
                }
            }
        }
        return {
            value: value,
            filters: "",
            expr: true
        }
    }

    function scanExpr(str) {
        var tokens = [],
            value, start = 0,
            stop
        do {
            stop = str.indexOf(openTag, start)
            if (stop === -1) {
                break
            }
            value = str.slice(start, stop)
            if (value) { // {{ ��ߵ��ı�
                tokens.push({
                    value: value,
                    filters: "",
                    expr: false
                })
            }
            start = stop + openTag.length
            stop = str.indexOf(closeTag, start)
            if (stop === -1) {
                break
            }
            value = str.slice(start, stop)
            if (value) { //����{{ }}��ֵ���ʽ
                tokens.push(getToken(value))
            }
            start = stop + closeTag.length
        } while (1)
        value = str.slice(start)
        if (value) { //}} �ұߵ��ı�
            tokens.push({
                value: value,
                expr: false,
                filters: ""
            })
        }
        return tokens
    }

    function scanText(textNode, vmodels) {
        var bindings = [], tokens = scanExpr(textNode.data)
        if (tokens.length) {
            for (var i = 0, token; token = tokens[i++]; ) {
                var node = DOC.createTextNode(token.value) //���ı�ת��Ϊ�ı��ڵ㣬���滻ԭ�����ı��ڵ�
                if (token.expr) {
                    token.value = token.value.replace(roneTime, function () {
                        token.oneTime = true
                        return ""
                    })// jshint ignore:line
                    token.type = "text"
                    token.element = node
                    token.filters = token.filters.replace(rhasHtml, function (a, b,c) {
                        token.type = "html"
                        return ""
                    })// jshint ignore:line
                    bindings.push(token) //�ռ����в�ֵ���ʽ���ı�
                }
                avalonFragment.appendChild(node)
            }
            textNode.parentNode.replaceChild(avalonFragment, textNode)
            if (bindings.length)
                executeBindings(bindings, vmodels)
        }
    }

    var bools = ["autofocus,autoplay,async,allowTransparency,checked,controls",
        "declare,disabled,defer,defaultChecked,defaultSelected",
        "contentEditable,isMap,loop,multiple,noHref,noResize,noShade",
        "open,readOnly,selected"
    ].join(",")
    var boolMap = {}
    bools.replace(rword, function (name) {
        boolMap[name.toLowerCase()] = name
    })

    var propMap = {//������ӳ��
        "accept-charset": "acceptCharset",
        "char": "ch",
        "charoff": "chOff",
        "class": "className",
        "for": "htmlFor",
        "http-equiv": "httpEquiv"
    }

    var anomaly = ["accessKey,bgColor,cellPadding,cellSpacing,codeBase,codeType,colSpan",
        "dateTime,defaultValue,frameBorder,longDesc,maxLength,marginWidth,marginHeight",
        "rowSpan,tabIndex,useMap,vSpace,valueType,vAlign"
    ].join(",")
    anomaly.replace(rword, function (name) {
        propMap[name.toLowerCase()] = name
    })

    var rnoscripts = /<noscript.*?>(?:[\s\S]+?)<\/noscript>/img
    var rnoscriptText = /<noscript.*?>([\s\S]+?)<\/noscript>/im

    var getXHR = function () {
        return new (window.XMLHttpRequest || ActiveXObject)("Microsoft.XMLHTTP") // jshint ignore:line
    }

    var templatePool = avalon.templateCache = {}

    bindingHandlers.attr = function (data, vmodels) {
        var value = stringifyExpr(data.value.trim())
        if (data.type === "include") {
            var elem = data.element
            data.includeRendered = getBindingCallback(elem, "data-include-rendered", vmodels)
            data.includeLoaded = getBindingCallback(elem, "data-include-loaded", vmodels)
            var outer = data.includeReplace = !!avalon(elem).data("includeReplace")
            if (avalon(elem).data("includeCache")) {
                data.templateCache = {}
            }
            data.startInclude = DOC.createComment("ms-include")
            data.endInclude = DOC.createComment("ms-include-end")
            if (outer) {
                data.element = data.startInclude
                elem.parentNode.insertBefore(data.startInclude, elem)
                elem.parentNode.insertBefore(data.endInclude, elem.nextSibling)
            } else {
                elem.insertBefore(data.startInclude, elem.firstChild)
                elem.appendChild(data.endInclude)
            }
        }
        data.handlerName = "attr" //handleName���ڴ�����ְ󶨹���ͬһ��bindingExecutor�����
        parseExprProxy(value, vmodels, data)
    }

    bindingExecutors.attr = function (val, elem, data) {
        var method = data.type,
            attrName = data.param
        if (method === "css") {
            avalon(elem).css(attrName, val)
        } else if (method === "attr") {

            // ms-attr-class="xxx" vm.xxx="aaa bbb ccc"��Ԫ�ص�className����Ϊaaa bbb ccc
            // ms-attr-class="xxx" vm.xxx=false  ���Ԫ�ص���������
            // ms-attr-name="yyy"  vm.yyy="ooo" ΪԪ������name����
            var toRemove = (val === false) || (val === null) || (val === void 0)

            if (!W3C && propMap[attrName]) { //��ʽIE����Ҫ��������ӳ��
                attrName = propMap[attrName]
            }
            var bool = boolMap[attrName]
            if (typeof elem[bool] === "boolean") {
                elem[bool] = !!val //�������Ա���ʹ��el.xxx = true|false��ʽ��ֵ
                if (!val) { //���Ϊfalse, IEȫϵ�����൱��setAttribute(xxx,''),��Ӱ�쵽��ʽ,��Ҫ��һ������
                    toRemove = true
                }
            }
            if (toRemove) {
                return elem.removeAttribute(attrName)
            }
            //SVGֻ��ʹ��setAttribute(xxx, yyy), VMLֻ��ʹ��elem.xxx = yyy ,HTML�Ĺ������Ա���elem.xxx = yyy
            var isInnate = rsvg.test(elem) ? false : (DOC.namespaces && isVML(elem)) ? true : attrName in elem.cloneNode(false)
            if (isInnate) {
                elem[attrName] = val + ""
            } else {
                elem.setAttribute(attrName, val)
            }
        } else if (method === "include" && val) {
            var vmodels = data.vmodels
            var rendered = data.includeRendered
            var loaded = data.includeLoaded
            var replace = data.includeReplace
            var target = replace ? elem.parentNode : elem
            var scanTemplate = function (text) {
                if (data.vmodels === null) {
                    return
                }

                if (loaded) {
                    var newText = loaded.apply(target, [text].concat(vmodels))
                    if (typeof newText === "string")
                        text = newText
                }
                if (rendered) {
                    checkScan(target, function () {
                        rendered.call(target)
                    }, NaN)
                }
                var lastID = data.includeLastID
                if (data.templateCache && lastID && lastID !== val) {
                    var lastTemplate = data.templateCache[lastID]
                    if (!lastTemplate) {
                        lastTemplate = data.templateCache[lastID] = DOC.createElement("div")
                        ifGroup.appendChild(lastTemplate)
                    }
                }
                data.includeLastID = val
                while (data.startInclude) {
                    var node = data.startInclude.nextSibling
                    if (node && node !== data.endInclude) {
                        target.removeChild(node)
                        if (lastTemplate)
                            lastTemplate.appendChild(node)
                    } else {
                        break
                    }
                }
                var dom = getTemplateNodes(data, val, text)
                var nodes = avalon.slice(dom.childNodes)
                target.insertBefore(dom, data.endInclude)
                scanNodeArray(nodes, vmodels)
            }

            if (data.param === "src") {
                if (typeof templatePool[val] === "string") {
                    avalon.nextTick(function () {
                        scanTemplate(templatePool[val])
                    })
                } else if (Array.isArray(templatePool[val])) { //#805 ��ֹ��ѭ�����з��������ͬ������
                    templatePool[val].push(scanTemplate)
                } else {
                    var xhr = getXHR()
                    xhr.onreadystatechange = function () {
                        if (xhr.readyState === 4) {
                            var s = xhr.status
                            if (s >= 200 && s < 300 || s === 304 || s === 1223) {
                                var text = xhr.responseText
                                for (var f = 0, fn; fn = templatePool[val][f++]; ) {
                                    fn(text)
                                }
                                templatePool[val] = text
                            }
                        }
                    }
                    templatePool[val] = [scanTemplate]
                    xhr.open("GET", val, true)
                    if ("withCredentials" in xhr) {
                        xhr.withCredentials = true
                    }
                    xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest")
                    xhr.send(null)
                }
            } else {
                //IEϵ���빻�µı�׼�����֧��ͨ��IDȡ��Ԫ�أ�firefox14+��
                //http://tjvantoll.com/2012/07/19/dom-element-references-as-global-variables/
                var el = val && val.nodeType === 1 ? val : DOC.getElementById(val)
                if (el) {
                    if (el.tagName === "NOSCRIPT" && !(el.innerHTML || el.fixIE78)) { //IE7-8 innerText,innerHTML���޷�ȡ�������ݣ�IE6��ȡ����innerHTML
                        xhr = getXHR() //IE9-11��chrome��innerHTML��õ�ת������ݣ����ǵ�innerText����
                        xhr.open("GET", location, false) //ллNodejs ����Ⱥ ����-�����鹹
                        xhr.send(null)
                        //http://bbs.csdn.net/topics/390349046?page=1#post-393492653
                        var noscripts = DOC.getElementsByTagName("noscript")
                        var array = (xhr.responseText || "").match(rnoscripts) || []
                        var n = array.length
                        for (var i = 0; i < n; i++) {
                            var tag = noscripts[i]
                            if (tag) { //IE6-8��noscript��ǩ��innerHTML,innerText��ֻ����
                                tag.style.display = "none" //http://haslayout.net/css/noscript-Ghost-Bug
                                tag.fixIE78 = (array[i].match(rnoscriptText) || ["", "&nbsp;"])[1]
                            }
                        }
                    }
                    avalon.nextTick(function () {
                        scanTemplate(el.fixIE78 || el.value || el.innerText || el.innerHTML)
                    })
                }
            }
        } else {
            if (!root.hasAttribute && typeof val === "string" && (method === "src" || method === "href")) {
                val = val.replace(/&amp;/g, "&") //����IE67�Զ�ת�������
            }
            elem[method] = val
            if (window.chrome && elem.tagName === "EMBED") {
                var parent = elem.parentNode //#525  chrome1-37��embed��ǩ��̬����src���ܷ�������
                var comment = document.createComment("ms-src")
                parent.replaceChild(comment, elem)
                parent.replaceChild(elem, comment)
            }
        }
    }

    function getTemplateNodes(data, id, text) {
        var div = data.templateCache && data.templateCache[id]
        if (div) {
            var dom = DOC.createDocumentFragment(),
                firstChild
            while (firstChild = div.firstChild) {
                dom.appendChild(firstChild)
            }
            return dom
        }
        return avalon.parseHTML(text)
    }

//�⼸��ָ�����ʹ�ò�ֵ���ʽ����ms-src="aaa/{{b}}/{{c}}.html"
    "title,alt,src,value,css,include,href".replace(rword, function (name) {
        bindingHandlers[name] = bindingHandlers.attr
    })
//����VM������ֵ����ʽ��ֵ�л�������ms-class="xxx yyy zzz:flag" 
//http://www.cnblogs.com/rubylouvre/archive/2012/12/17/2818540.html
    bindingHandlers["class"] = function (binding, vmodels) {
        var oldStyle = binding.param,
            text = binding.value,
            rightExpr
        binding.handlerName = "class"
        if (!oldStyle || isFinite(oldStyle)) {
            binding.param = "" //ȥ������
            var colonIndex = text.replace(rexprg, function (a) {
                return a.replace(/./g, "0")
            }).indexOf(":") //ȡ�õ�һ��ð�ŵ�λ��
            if (colonIndex === -1) { // ���� ms-class="aaa bbb ccc" �����
                var className = text
                rightExpr = true
            } else { // ���� ms-class-1="ui-state-active:checked" �����
                className = text.slice(0, colonIndex)
                rightExpr = text.slice(colonIndex + 1)
            }
            if (!rexpr.test(text)) {
                className = quote(className)
            } else {
                className = stringifyExpr(className)
            }
            binding.expr = "[" + className + "," + rightExpr + "]"
        } else {
            binding.expr = '[' + quote(oldStyle) + "," + text + "]"
            binding.oldStyle = oldStyle
        }
        var method = binding.type
        if (method === "hover" || method === "active") { //ȷ��ֻ��һ��
            if (!binding.hasBindEvent) {
                var elem = binding.element
                var $elem = avalon(elem)
                var activate = "mouseenter" //���Ƴ�����ʱ�л�����
                var abandon = "mouseleave"
                if (method === "active") { //�ھ۽�ʧ�����л�����
                    elem.tabIndex = elem.tabIndex || -1
                    activate = "mousedown"
                    abandon = "mouseup"
                    var fn0 = $elem.bind("mouseleave", function () {
                        binding.toggleClass && $elem.removeClass(binding.newClass)
                    })
                }
            }

            var fn1 = $elem.bind(activate, function () {
                binding.toggleClass && $elem.addClass(binding.newClass)
            })
            var fn2 = $elem.bind(abandon, function () {
                binding.toggleClass && $elem.removeClass(binding.newClass)
            })
            binding.rollback = function () {
                $elem.unbind("mouseleave", fn0)
                $elem.unbind(activate, fn1)
                $elem.unbind(abandon, fn2)
            }
            binding.hasBindEvent = true
        }
        parseExprProxy(binding.expr, vmodels, binding)
    }

    bindingExecutors["class"] = function (arr, elem, binding) {
        var $elem = avalon(elem)
        binding.newClass = arr[0]
        binding.toggleClass = !!arr[1]
        if (binding.oldClass && binding.newClass !== binding.oldClass) {
            $elem.removeClass(binding.oldClass)
        }
        binding.oldClass = binding.newClass
        if (binding.type === "class") {
            if (binding.oldStyle) {
                $elem.toggleClass(binding.oldStyle, !!arr[1])
            } else {
                $elem.toggleClass(binding.newClass, binding.toggleClass)
            }
        }

    }

    "hover,active".replace(rword, function (method) {
        bindingHandlers[method] = bindingHandlers["class"]
    })
//ms-controller���Ѿ���scanTag ������ʵ��
//ms-css������ms-attr��ʵ��


// bindingHandlers.data ������if.js
    bindingExecutors.data = function(val, elem, data) {
        var key = "data-" + data.param
        if (val && typeof val === "object") {
            elem[key] = val
        } else {
            elem.setAttribute(key, String(val))
        }
    }
//˫����
    var duplexBinding = bindingHandlers.duplex = function(data, vmodels) {
        var elem = data.element,
            hasCast
        parseExprProxy(data.value, vmodels, data, 1)

        data.changed = getBindingCallback(elem, "data-duplex-changed", vmodels) || noop
        if (data.evaluator && data.args) {
            var params = []
            var casting = oneObject("string,number,boolean,checked")
            if (elem.type === "radio" && data.param === "") {
                data.param = "checked"
            }
            if (elem.msData) {
                elem.msData["ms-duplex"] = data.value
            }
            data.param.replace(/\w+/g, function(name) {
                if (/^(checkbox|radio)$/.test(elem.type) && /^(radio|checked)$/.test(name)) {
                    if (name === "radio")
                        log("ms-duplex-radio�Ѿ�����Ϊms-duplex-checked")
                    name = "checked"
                    data.isChecked = true
                }
                if (name === "bool") {
                    name = "boolean"
                    log("ms-duplex-bool�Ѿ�����Ϊms-duplex-boolean")
                } else if (name === "text") {
                    name = "string"
                    log("ms-duplex-text�Ѿ�����Ϊms-duplex-string")
                }
                if (casting[name]) {
                    hasCast = true
                }
                avalon.Array.ensure(params, name)
            })
            if (!hasCast) {
                params.push("string")
            }
            data.param = params.join("-")
            data.bound = function(type, callback) {
                if (elem.addEventListener) {
                    elem.addEventListener(type, callback, false)
                } else {
                    elem.attachEvent("on" + type, callback)
                }
                var old = data.rollback
                data.rollback = function() {
                    elem.avalonSetter = null
                    avalon.unbind(elem, type, callback)
                    old && old()
                }
            }
            for (var i in avalon.vmodels) {
                var v = avalon.vmodels[i]
                v.$fire("avalon-ms-duplex-init", data)
            }
            var cpipe = data.pipe || (data.pipe = pipe)
            cpipe(null, data, "init")
            var tagName = elem.tagName
            duplexBinding[tagName] && duplexBinding[tagName](elem, data.evaluator.apply(null, data.args), data)
        }
    }
//������ bindingExecutors.duplex

    function fixNull(val) {
        return val == null ? "" : val
    }
    avalon.duplexHooks = {
        checked: {
            get: function(val, data) {
                return !data.element.oldValue
            }
        },
        string: {
            get: function(val) { //ͬ����VM
                return val
            },
            set: fixNull
        },
        "boolean": {
            get: function(val) {
                return val === "true"
            },
            set: fixNull
        },
        number: {
            get: function(val, data) {
                var number = parseFloat(val)
                if (-val === -number) {
                    return number
                }
                var arr = /strong|medium|weak/.exec(data.element.getAttribute("data-duplex-number")) || ["medium"]
                switch (arr[0]) {
                    case "strong":
                        return 0
                    case "medium":
                        return val === "" ? "" : 0
                    case "weak":
                        return val
                }
            },
            set: fixNull
        }
    }

    function pipe(val, data, action, e) {
        data.param.replace(/\w+/g, function(name) {
            var hook = avalon.duplexHooks[name]
            if (hook && typeof hook[action] === "function") {
                val = hook[action](val, data)
            }
        })
        return val
    }

    var TimerID, ribbon = []

    avalon.tick = function(fn) {
        if (ribbon.push(fn) === 1) {
            TimerID = setInterval(ticker, 60)
        }
    }

    function ticker() {
        for (var n = ribbon.length - 1; n >= 0; n--) {
            var el = ribbon[n]
            if (el() === false) {
                ribbon.splice(n, 1)
            }
        }
        if (!ribbon.length) {
            clearInterval(TimerID)
        }
    }

    var watchValueInTimer = noop
    new function() { // jshint ignore:line
        try { //#272 IE9-IE11, firefox
            var setters = {}
            var aproto = HTMLInputElement.prototype
            var bproto = HTMLTextAreaElement.prototype
            function newSetter(value) { // jshint ignore:line
                setters[this.tagName].call(this, value)
                if (!this.msFocus && this.avalonSetter && this.oldValue !== value) {
                    this.avalonSetter()
                }
            }
            var inputProto = HTMLInputElement.prototype
            Object.getOwnPropertyNames(inputProto) //��������IE6-8�����������
            setters["INPUT"] = Object.getOwnPropertyDescriptor(aproto, "value").set

            Object.defineProperty(aproto, "value", {
                set: newSetter
            })
            setters["TEXTAREA"] = Object.getOwnPropertyDescriptor(bproto, "value").set
            Object.defineProperty(bproto, "value", {
                set: newSetter
            })
        } catch (e) {
            //��chrome 43�� ms-duplex���ڲ���Ҫʹ�ö�ʱ��ʵ��˫�����
            // http://updates.html5rocks.com/2015/04/DOM-attributes-now-on-the-prototype
            // https://docs.google.com/document/d/1jwA8mtClwxI-QJuHT7872Z0pxpZz8PBkf2bGAbsUtqs/edit?pli=1
            watchValueInTimer = avalon.tick
        }
    } // jshint ignore:line
    if (IEVersion) {
        avalon.bind(DOC, "selectionchange", function (e) {
            var el = DOC.activeElement
            if (el && typeof el.avalonSetter === "function") {
                el.avalonSetter()
            }
        })
    }
    var rnoduplex = /^(file|button|reset|submit|checkbox|radio|range)$/
//����radio, checkbox, text, textarea, password
    duplexBinding.INPUT = function (element, evaluator, data) {
        var $type = element.type,
            bound = data.bound,
            $elem = avalon(element),
            composing = false

        function callback(value) {
            data.changed.call(this, value, data)
        }

        function compositionStart() {
            composing = true
        }

        function compositionEnd() {
            composing = false
        }
        //��value�仯ʱ�ı�model��ֵ
        var updateVModel = function () {
            var val = element.value //��ֹ�ݹ�����γ���ѭ��
            if (composing || val === element.oldValue) //�����������뷨��minlengh��������BUG
                return
            var lastValue = data.pipe(val, data, "get")
            if ($elem.data("duplexObserve") !== false) {
                evaluator(lastValue)
                callback.call(element, lastValue)
            }
        }
        //��model�仯ʱ,���ͻ�ı�value��ֵ
        data.handler = function () {
            var val = data.pipe(evaluator(), data, "set")  //fix #673 #1106
            if (val !== element.oldValue) {
                var fixCaret = false
                if (element.msFocus) {
                    try {
                        var pos = getCaret(element)
                        if (pos.start === pos.end) {
                            pos = pos.start
                            fixCaret = true
                        }
                    } catch (e) {
                    }
                }
                element.value = element.oldValue = val
                if (fixCaret) {
                    setCaret(element, pos, pos)
                }
            }
        }
        if (data.isChecked || $type === "radio") {
            var IE6 = IEVersion === 6
            updateVModel = function () {
                if ($elem.data("duplexObserve") !== false) {
                    var lastValue = data.pipe(element.value, data, "get")
                    evaluator(lastValue)
                    callback.call(element, lastValue)
                }
            }
            data.handler = function () {
                var val = evaluator()
                var checked = data.isChecked ? !!val : val + "" === element.value
                element.oldValue = checked
                if (IE6) {
                    setTimeout(function () {
                        //IE8 checkbox, radio��ʹ��defaultChecked����ѡ��״̬��
                        //����Ҫ������defaultChecked������checked
                        //���ұ��������ӳ�
                        element.defaultChecked = checked
                        element.checked = checked
                    }, 31)
                } else {
                    element.checked = checked
                }
            }
            bound("click", updateVModel)
        } else if ($type === "checkbox") {
            updateVModel = function () {
                if ($elem.data("duplexObserve") !== false) {
                    var method = element.checked ? "ensure" : "remove"
                    var array = evaluator()
                    if (!Array.isArray(array)) {
                        log("ms-duplexӦ����checkbox��Ҫ��Ӧһ������")
                        array = [array]
                    }
                    var val = data.pipe(element.value, data, "get")
                    avalon.Array[method](array, val)
                    callback.call(element, array)
                }
            }

            data.handler = function () {
                var array = [].concat(evaluator()) //ǿ��ת��Ϊ����
                var val = data.pipe(element.value, data, "get")
                element.checked = array.indexOf(val) > -1
            }
            bound(W3C ? "change" : "click", updateVModel)
        } else {
            var events = element.getAttribute("data-duplex-event") || "input"
            if (element.attributes["data-event"]) {
                log("data-eventָ���Ѿ������������data-duplex-event")
            }

            function delay(e) { // jshint ignore:line
                setTimeout(function () {
                    updateVModel(e)
                })
            }
            events.replace(rword, function (name) {
                switch (name) {
                    case "input":
                        if (!IEVersion) { // W3C
                            bound("input", updateVModel)
                            //��IE������������
                            bound("compositionstart", compositionStart)
                            bound("compositionend", compositionEnd)
                            bound("DOMAutoComplete", updateVModel)
                        } else { //onpropertychange�¼��޷������ǳ��򴥷������û�����
                            // IE��ͨ��selectionchange�¼�����IE9+���input�ұߵ�X�������Ϊ����ճ�������У�ɾ����Ϊ
                            if (IEVersion > 8) {
                                bound("input", updateVModel) //IE9ʹ��propertychange�޷�������������Ķ�
                            } else {
                                bound("propertychange", function (e) { //IE6-8�µ�һ���޸�ʱ���ᴥ��,��Ҫʹ��keydown��selectionchange����
                                    if (e.propertyName === "value") {
                                        updateVModel()
                                    }
                                })
                            }
                            bound("dragend", delay)
                            //http://www.cnblogs.com/rubylouvre/archive/2013/02/17/2914604.html
                            //http://www.matts411.com/post/internet-explorer-9-oninput/
                        }
                        break
                    default:
                        bound(name, updateVModel)
                        break
                }
            })


            if (!rnoduplex.test(element.type)) {
                if (element.type !== "hidden") {
                    bound("focus", function () {
                        element.msFocus = true
                    })
                    bound("blur", function () {
                        element.msFocus = false
                    })
                }

                element.avalonSetter = updateVModel //#765
                watchValueInTimer(function () {
                    if (root.contains(element)) {
                        if (!element.msFocus && element.oldValue !== element.value) {
                            updateVModel()
                        }
                    } else if (!element.msRetain) {
                        return false
                    }
                })
            }

        }

        avalon.injectBinding(data)
        callback.call(element, element.value)
    }
    duplexBinding.TEXTAREA = duplexBinding.INPUT
    function getCaret(ctrl, start, end) {
        if (ctrl.setSelectionRange) {
            start = ctrl.selectionStart
            end = ctrl.selectionEnd
        } else if (document.selection && document.selection.createRange) {
            var range = document.selection.createRange()
            start = 0 - range.duplicate().moveStart('character', -100000)
            end = start + range.text.length
        }
        return {
            start: start,
            end: end
        }
    }
    function setCaret(ctrl, begin, end) {
        if (!ctrl.value || ctrl.readOnly)
            return
        if (ctrl.createTextRange) {//IE6-9
            setTimeout(function () {
                var range = ctrl.createTextRange()
                range.collapse(true);
                range.moveStart("character", begin)
                range.select()
            }, 17)
        } else {
            ctrl.selectionStart = begin
            ctrl.selectionEnd = end
        }
    }
    duplexBinding.SELECT = function(element, evaluator, data) {
        var $elem = avalon(element)

        function updateVModel() {
            if ($elem.data("duplexObserve") !== false) {
                var val = $elem.val() //�ַ������ַ�������
                if (Array.isArray(val)) {
                    val = val.map(function(v) {
                        return data.pipe(v, data, "get")
                    })
                } else {
                    val = data.pipe(val, data, "get")
                }
                if (val + "" !== element.oldValue) {
                    evaluator(val)
                }
                data.changed.call(element, val, data)
            }
        }
        data.handler = function() {
            var val = evaluator()
            val = val && val.$model || val
            if (Array.isArray(val)) {
                if (!element.multiple) {
                    log("ms-duplex��<select multiple=true>��Ҫ���Ӧһ������")
                }
            } else {
                if (element.multiple) {
                    log("ms-duplex��<select multiple=false>���ܶ�Ӧһ������")
                }
            }
            //�������ַ�������ܱȽ�
            val = Array.isArray(val) ? val.map(String) : val + ""
            if (val + "" !== element.oldValue) {
                $elem.val(val)
                element.oldValue = val + ""
            }
        }
        data.bound("change", updateVModel)
        element.msCallback = function() {
            avalon.injectBinding(data)
            data.changed.call(element, evaluator(), data)
        }
    }
// bindingHandlers.html ������if.js
    bindingExecutors.html = function (val, elem, data) {
        var isHtmlFilter = elem.nodeType !== 1
        var parent = isHtmlFilter ? elem.parentNode : elem
        if (!parent)
            return
        val = val == null ? "" : val
        if (data.oldText !== val) {
            data.oldText = val
        } else {
            return
        }
        if (elem.nodeType === 3) {
            var signature = generateID("html")
            parent.insertBefore(DOC.createComment(signature), elem)
            data.element = DOC.createComment(signature + ":end")
            parent.replaceChild(data.element, elem)
            elem = data.element
        }
        if (typeof val !== "object") {//string, number, boolean
            var fragment = avalon.parseHTML(String(val))
        } else if (val.nodeType === 11) { //��valת��Ϊ�ĵ���Ƭ
            fragment = val
        } else if (val.nodeType === 1 || val.item) {
            var nodes = val.nodeType === 1 ? val.childNodes : val.item
            fragment = avalonFragment.cloneNode(true)
            while (nodes[0]) {
                fragment.appendChild(nodes[0])
            }
        }

        nodes = avalon.slice(fragment.childNodes)
        //����ռλ��, ����ǹ�����,��Ҫ�н��Ƶ��Ƴ�ָ��������,�����htmlָ��,ֱ�����
        if (isHtmlFilter) {
            var endValue = elem.nodeValue.slice(0, -4)
            while (true) {
                var node = elem.previousSibling
                if (!node || node.nodeType === 8 && node.nodeValue === endValue) {
                    break
                } else {
                    parent.removeChild(node)
                }
            }
            parent.insertBefore(fragment, elem)
        } else {
            avalon.clearHTML(elem).appendChild(fragment)
        }
        scanNodeArray(nodes, data.vmodels)
    }
    bindingHandlers["if"] =
        bindingHandlers.data =
            bindingHandlers.text =
                bindingHandlers.html =
                    function(data, vmodels) {
                        parseExprProxy(data.value, vmodels, data)
                    }

    bindingExecutors["if"] = function(val, elem, data) {
        try {
            if(!elem.parentNode) return
        } catch(e) {return}
        if (val) { //���DOM��
            if (elem.nodeType === 8) {
                elem.parentNode.replaceChild(data.template, elem)
                elem.ifRemove = null
                //   animate.enter(data.template, elem.parentNode)
                elem = data.element = data.template //��ʱ����Ϊnull
            }
            if (elem.getAttribute(data.name)) {
                elem.removeAttribute(data.name)
                scanAttr(elem, data.vmodels)
            }
            data.rollback = null
        } else { //�Ƴ�DOM��������ע�ͽڵ�ռ��ԭλ��
            if (elem.nodeType === 1) {
                var node = data.element = DOC.createComment("ms-if")
                elem.parentNode.replaceChild(node, elem)
                elem.ifRemove = node
                //     animate.leave(elem, node.parentNode, node)
                data.template = elem //Ԫ�ؽڵ�
                ifGroup.appendChild(elem)
                data.rollback = function() {
                    if (elem.parentNode === ifGroup) {
                        ifGroup.removeChild(elem)
                    }
                }
            }
        }
    }
//ms-important���Ѿ���scanTag ������ʵ��
//ms-include������ms-attr��ʵ��

    var rdash = /\(([^)]*)\)/
    bindingHandlers.on = function(data, vmodels) {
        var value = data.value
        data.type = "on"
        var eventType = data.param.replace(/-\d+$/, "") // ms-on-mousemove-10
        if (typeof bindingHandlers.on[eventType + "Hook"] === "function") {
            bindingHandlers.on[eventType + "Hook"](data)
        }
        if (value.indexOf("(") > 0 && value.indexOf(")") > -1) {
            var matched = (value.match(rdash) || ["", ""])[1].trim()
            if (matched === "" || matched === "$event") { // aaa() aaa($event)����aaa����
                value = value.replace(rdash, "")
            }
        }
        parseExprProxy(value, vmodels, data)
    }

    bindingExecutors.on = function(callback, elem, data) {
        callback = function(e) {
            var fn = data.evaluator || noop
            return fn.apply(this, data.args.concat(e))
        }
        var eventType = data.param.replace(/-\d+$/, "") // ms-on-mousemove-10
        if (eventType === "scan") {
            callback.call(elem, {
                type: eventType
            })
        } else if (typeof data.specialBind === "function") {
            data.specialBind(elem, callback)
        } else {
            var removeFn = avalon.bind(elem, eventType, callback)
        }
        data.rollback = function() {
            if (typeof data.specialUnbind === "function") {
                data.specialUnbind()
            } else {
                avalon.unbind(elem, eventType, removeFn)
            }
        }
    }
    bindingHandlers.repeat = function (data, vmodels) {
        var type = data.type
        parseExprProxy(data.value, vmodels, data, 1)
        data.proxies = []
        var freturn = false
        try {
            var $repeat = data.$repeat = data.evaluator.apply(0, data.args || [])
            var xtype = avalon.type($repeat)
            if (xtype !== "object" && xtype !== "array") {
                freturn = true
                avalon.log("warning:" + data.value + "ֻ���Ƕ��������")
            } else {
                data.xtype = xtype
            }
        } catch (e) {
            freturn = true
        }
        var arr = data.value.split(".") || []
        if (arr.length > 1) {
            arr.pop()
            var n = arr[0]
            for (var i = 0, v; v = vmodels[i++]; ) {
                if (v && v.hasOwnProperty(n)) {
                    var events = v[n].$events || {}
                    events[subscribers] = events[subscribers] || []
                    events[subscribers].push(data)
                    break
                }
            }
        }

        var oldHandler = data.handler
        data.handler = noop
        avalon.injectBinding(data)
        data.handler = oldHandler

        var elem = data.element
        if (elem.nodeType === 1) {
            elem.removeAttribute(data.name)
            data.sortedCallback = getBindingCallback(elem, "data-with-sorted", vmodels)
            data.renderedCallback = getBindingCallback(elem, "data-" + type + "-rendered", vmodels)
            var signature = generateID(type)
            var start = DOC.createComment(signature)
            var end = DOC.createComment(signature + ":end")
            data.signature = signature
            data.template = avalonFragment.cloneNode(false)
            if (type === "repeat") {
                var parent = elem.parentNode
                parent.replaceChild(end, elem)
                parent.insertBefore(start, end)
                data.template.appendChild(elem)
            } else {
                while (elem.firstChild) {
                    data.template.appendChild(elem.firstChild)
                }
                elem.appendChild(start)
                elem.appendChild(end)
            }
            data.element = end
            data.handler = bindingExecutors.repeat
            data.rollback = function () {
                var elem = data.element
                if (!elem)
                    return
                data.handler("clear")
            }
        }

        if (freturn) {
            return
        }

        data.$outer = {}
        var check0 = "$key"
        var check1 = "$val"
        if (Array.isArray($repeat)) {
            check0 = "$first"
            check1 = "$last"
        }

        for (i = 0; v = vmodels[i++]; ) {
            if (v.hasOwnProperty(check0) && v.hasOwnProperty(check1)) {
                data.$outer = v
                break
            }
        }
        var $events = $repeat.$events
        var $list = ($events || {})[subscribers]
        injectDependency($list, data)
        if (xtype === "object") {
            data.handler("append")
        } else if ($repeat.length) {
            data.handler("add", 0, $repeat.length)
        }
    }

    bindingExecutors.repeat = function (method, pos, el) {
        var data = this
        if (!method && data.xtype) {
            var old = data.$repeat
            var neo = data.evaluator.apply(0, data.args || [])

            if (data.xtype === "array") {
                if (old.length === neo.length) {
                    if (old !== neo && old.length > 0) {
                        bindingExecutors.repeat.call(this, 'clear', pos, el)
                    }
                    else {
                        return
                    }
                }
                method = "add"
                pos = 0
                data.$repeat = neo
                el = neo.length
            } else {
                if (keysVM(old).join(";;") === keysVM(neo).join(";;")) {
                    return
                }
                method = "append"
                data.$repeat = neo
            }
        }
        if (method) {
            var start, fragment
            var end = data.element
            var comments = getComments(data)
            var parent = end.parentNode
            var proxies = data.proxies
            var transation = avalonFragment.cloneNode(false)
            switch (method) {
                case "add": //��posλ�ú����el���飨posΪ����λ��,elΪҪ����ĸ�����
                    var n = pos + el
                    var fragments = []
                    for (var i = pos; i < n; i++) {
                        var proxy = eachProxyAgent(i, data)
                        proxies.splice(i, 0, proxy)
                        shimController(data, transation, proxy, fragments)
                    }
                    parent.insertBefore(transation, comments[pos] || end)
                    for (i = 0; fragment = fragments[i++]; ) {
                        scanNodeArray(fragment.nodes, fragment.vmodels)
                        fragment.nodes = fragment.vmodels = null
                    }

                    break
                case "del": //��pos���el��Ԫ��ɾ��(pos, el��������)
                    sweepNodes(comments[pos], comments[pos + el] || end)
                    var removed = proxies.splice(pos, el)
                    recycleProxies(removed, "each")
                    break
                case "clear":
                    start = comments[0]
                    if (start) {
                        sweepNodes(start, end)
                        if (data.xtype === "object") {
                            parent.insertBefore(start, end)
                        }else{
                            recycleProxies(proxies, "each")
                        }
                    }
                    break
                case "move":
                    start = comments[0]
                    if (start) {
                        var signature = start.nodeValue
                        var rooms = []
                        var room = [],
                            node
                        sweepNodes(start, end, function () {
                            room.unshift(this)
                            if (this.nodeValue === signature) {
                                rooms.unshift(room)
                                room = []
                            }
                        })
                        sortByIndex(rooms, pos)
                        sortByIndex(proxies, pos)
                        while (room = rooms.shift()) {
                            while (node = room.shift()) {
                                transation.appendChild(node)
                            }
                        }
                        parent.insertBefore(transation, end)
                    }
                    break
                case "index": //��proxies�еĵ�pos���������Ԫ����������
                    var last = proxies.length - 1
                    for (; el = proxies[pos]; pos++) {
                        el.$index = pos
                        el.$first = pos === 0
                        el.$last = pos === last
                    }
                    return
                case "set": //��proxies�еĵ�pos��Ԫ�ص�VM����Ϊel��posΪ���֣�el���⣩
                    proxy = proxies[pos]
                    if (proxy) {
                        fireDependencies(proxy.$events[data.param || "el"])
                    }
                    break
                case "append":
                    var object = data.$repeat //ԭ����2������ ��ѭ������
                    var pool = Array.isArray(proxies) ||!proxies ?  {}: proxies   //���������ɵ�hash
                    data.proxies = pool
                    var keys = []
                    fragments = []
                    for (var key in pool) {
                        if (!object.hasOwnProperty(key)) {
                            proxyRecycler(pool[key], withProxyPool) //ȥ��֮ǰ�Ĵ���VM
                            delete(pool[key])
                        }
                    }
                    for (key in object) { //�õ����м���
                        if (object.hasOwnProperty(key) && key !== "hasOwnProperty") {
                            keys.push(key)
                        }
                    }
                    if (data.sortedCallback) { //����лص���������������
                        var keys2 = data.sortedCallback.call(parent, keys)
                        if (keys2 && Array.isArray(keys2) && keys2.length) {
                            keys = keys2
                        }
                    }
                    for (i = 0; key = keys[i++]; ) {
                        if (key !== "hasOwnProperty") {
                            pool[key] = withProxyAgent(pool[key], key, data)
                            shimController(data, transation, pool[key], fragments)
                        }
                    }

                    parent.insertBefore(transation, end)
                    for (i = 0; fragment = fragments[i++]; ) {
                        scanNodeArray(fragment.nodes, fragment.vmodels)
                        fragment.nodes = fragment.vmodels = null
                    }
                    break
            }
            if (!data.$repeat || data.$repeat.hasOwnProperty("$lock")) //IE6-8 VBScript����ᱨ��, ��ʱ��data.$repeat������
                return
            if (method === "clear")
                method = "del"
            var callback = data.renderedCallback || noop,
                args = arguments
            if (parent.oldValue && parent.tagName === "SELECT") { //fix #503
                avalon(parent).val(parent.oldValue.split(","))
            }
            callback.apply(parent, args)
        }
    }
    "with,each".replace(rword, function (name) {
        bindingHandlers[name] = bindingHandlers.repeat
    })

    function shimController(data, transation, proxy, fragments) {
        var content = data.template.cloneNode(true)
        var nodes = avalon.slice(content.childNodes)
        content.insertBefore(DOC.createComment(data.signature), content.firstChild)
        transation.appendChild(content)
        var nv = [proxy].concat(data.vmodels)
        var fragment = {
            nodes: nodes,
            vmodels: nv
        }
        fragments.push(fragment)
    }

    function getComments(data) {
        var ret = []
        var nodes = data.element.parentNode.childNodes
        for (var i = 0, node; node = nodes[i++]; ) {
            if (node.nodeValue === data.signature) {
                ret.push(node)
            } else if (node.nodeValue === data.signature + ":end") {
                break
            }
        }
        return ret
    }


//�Ƴ���start��end֮��Ľڵ�(����end)
    function sweepNodes(start, end, callback) {
        while (true) {
            var node = end.previousSibling
            if (!node)
                break
            node.parentNode.removeChild(node)
            callback && callback.call(node)
            if (node === start) {
                break
            }
        }
    }

// Ϊms-each,ms-with, ms-repeat�ᴴ��һ������VM��
// ͨ�����Ǳ���һ�������ģ����û��ܵ���$index,$first,$last,$remove,$key,$val,$outer�������뷽��
// ���д���VM�Ĳ���,����,�ռ�,���ͨ��xxxProxyFactory,xxxProxyAgent, recycleProxies,xxxProxyPoolʵ��
    var withProxyPool = []
    function withProxyFactory() {
        var proxy = modelFactory({
            $key: "",
            $outer: {},
            $host: {},
            $val: {
                get: function () {
                    return this.$host[this.$key]
                },
                set: function (val) {
                    this.$host[this.$key] = val
                }
            }
        }, {
            $val: 1
        })
        proxy.$id = generateID("$proxy$with")
        return proxy
    }

    function withProxyAgent(proxy, key, data) {
        proxy = proxy || withProxyPool.pop()
        if (!proxy) {
            proxy = withProxyFactory()
        } else {
            proxy.$reinitialize()
        }
        var host = data.$repeat
        proxy.$key = key

        proxy.$host = host
        proxy.$outer = data.$outer
        if (host.$events) {
            proxy.$events.$val = host.$events[key]
        } else {
            proxy.$events = {}
        }
        return proxy
    }


    function  recycleProxies(proxies) {
        eachProxyRecycler(proxies)
    }
    function eachProxyRecycler(proxies) {
        proxies.forEach(function (proxy) {
            proxyRecycler(proxy, eachProxyPool)
        })
        proxies.length = 0
    }


    var eachProxyPool = []
    function eachProxyFactory(name) {
        var source = {
            $host: [],
            $outer: {},
            $index: 0,
            $first: false,
            $last: false,
            $remove: avalon.noop
        }
        source[name] = {
            get: function () {
                var e = this.$events
                var array = e.$index
                e.$index = e[name] //#817 ͨ��$indexΪel�ռ�����
                try {
                    return this.$host[this.$index]
                } finally {
                    e.$index = array
                }
            },
            set: function (val) {
                try {
                    var e = this.$events
                    var array = e.$index
                    e.$index = []
                    this.$host.set(this.$index, val)
                } finally {
                    e.$index = array
                }
            }
        }
        var second = {
            $last: 1,
            $first: 1,
            $index: 1
        }
        var proxy = modelFactory(source, second)
        proxy.$id = generateID("$proxy$each")
        return proxy
    }

    function eachProxyAgent(index, data) {
        var param = data.param || "el",
            proxy
        for (var i = 0, n = eachProxyPool.length; i < n; i++) {
            var candidate = eachProxyPool[i]
            if (candidate && candidate.hasOwnProperty(param)) {
                proxy = candidate
                eachProxyPool.splice(i, 1)
            }
        }
        if (!proxy) {
            proxy = eachProxyFactory(param)
        }
        var host = data.$repeat
        var last = host.length - 1
        proxy.$index = index
        proxy.$first = index === 0
        proxy.$last = index === last
        proxy.$host = host
        proxy.$outer = data.$outer
        proxy.$remove = function () {
            return host.removeAt(proxy.$index)
        }
        return proxy
    }


    function proxyRecycler(proxy, proxyPool) {
        for (var i in proxy.$events) {
            var arr = proxy.$events[i]
            if (Array.isArray(arr)) {
                arr.forEach(function (data) {
                    if (typeof data === "object")
                        disposeData(data)
                })// jshint ignore:line
                arr.length = 0
            }
        }
        proxy.$host = proxy.$outer = {}
        if (proxyPool.unshift(proxy) > kernel.maxRepeatSize) {
            proxyPool.pop()
        }
    }

    /*********************************************************************
     *                         ����ָ��                                  *
     **********************************************************************/
//ms-skip���Ѿ���scanTag ������ʵ��
// bindingHandlers.text ������if.js
    bindingExecutors.text = function(val, elem) {
        val = val == null ? "" : val //����ҳ������ʾundefined null
        if (elem.nodeType === 3) { //�����ı��ڵ���
            try { //IE��������DOM����Ľڵ㸳ֵ�ᱨ��
                elem.data = val
            } catch (e) {}
        } else { //�������Խڵ���
            if ("textContent" in elem) {
                elem.textContent = val
            } else {
                elem.innerText = val
            }
        }
    }
    function parseDisplay(nodeName, val) {
        //����ȡ�ô����ǩ��Ĭ��displayֵ
        var key = "_" + nodeName
        if (!parseDisplay[key]) {
            var node = DOC.createElement(nodeName)
            root.appendChild(node)
            if (W3C) {
                val = getComputedStyle(node, null).display
            } else {
                val = node.currentStyle.display
            }
            root.removeChild(node)
            parseDisplay[key] = val
        }
        return parseDisplay[key]
    }

    avalon.parseDisplay = parseDisplay

    bindingHandlers.visible = function (data, vmodels) {
        parseExprProxy(data.value, vmodels, data)
    }

    bindingExecutors.visible = function (val, elem, binding) {
        if (val) {
            elem.style.display = binding.display || ""
            if (avalon(elem).css("display") === "none") {
                elem.style.display = binding.display = parseDisplay(elem.nodeName)
            }
        } else {
            elem.style.display = "none"
        }
    }
    bindingHandlers.widget = function(data, vmodels) {
        var args = data.value.match(rword)
        var elem = data.element
        var widget = args[0]
        var id = args[1]
        if (!id || id === "$") { //û�ж����Ϊ$ʱ��ȡ�����+�����
            id = generateID(widget)
        }
        var optName = args[2] || widget //û�ж��壬ȡ�����
        var constructor = avalon.ui[widget]
        if (typeof constructor === "function") { //ms-widget="tabs,tabsAAA,optname"
            vmodels = elem.vmodels || vmodels
            for (var i = 0, v; v = vmodels[i++];) {
                if (v.hasOwnProperty(optName) && typeof v[optName] === "object") {
                    var vmOptions = v[optName]
                    vmOptions = vmOptions.$model || vmOptions
                    break
                }
            }
            if (vmOptions) {
                var wid = vmOptions[widget + "Id"]
                if (typeof wid === "string") {
                    log("warning!����֧��" + widget + "Id")
                    id = wid
                }
            }
            //��ȡdata-tooltip-text��data-tooltip-attr���ԣ����һ�����ö���
            var widgetData = avalon.getWidgetData(elem, widget)
            data.value = [widget, id, optName].join(",")
            data[widget + "Id"] = id
            data.evaluator = noop
            elem.msData["ms-widget-id"] = id
            var options = data[widget + "Options"] = avalon.mix({}, constructor.defaults, vmOptions || {}, widgetData)
            elem.removeAttribute("ms-widget")
            var vmodel = constructor(elem, data, vmodels) || {} //��ֹ���������VM
            if (vmodel.$id) {
                avalon.vmodels[id] = vmodel
                createSignalTower(elem, vmodel)
                try {
                    vmodel.$init(function() {
                        avalon.scan(elem, [vmodel].concat(vmodels))
                        if (typeof options.onInit === "function") {
                            options.onInit.call(elem, vmodel, options, vmodels)
                        }
                    })
                } catch (e) {log(e)}
                data.rollback = function() {
                    try {
                        vmodel.$remove()
                        vmodel.widgetElement = null // �ŵ�$remove���
                    } catch (e) {}
                    elem.msData = {}
                    delete avalon.vmodels[vmodel.$id]
                }
                injectDisposeQueue(data, widgetList)
                if (window.chrome) {
                    elem.addEventListener("DOMNodeRemovedFromDocument", function() {
                        setTimeout(rejectDisposeQueue)
                    })
                }
            } else {
                avalon.scan(elem, vmodels)
            }
        } else if (vmodels.length) { //����������û�м��أ���ô���浱ǰ��vmodels
            elem.vmodels = vmodels
        }
    }
    var widgetList = []
//������ bindingExecutors.widget
    /*********************************************************************
     *                             �Դ�������                            *
     **********************************************************************/
    var rscripts = /<script[^>]*>([\S\s]*?)<\/script\s*>/gim
    var ron = /\s+(on[^=\s]+)(?:=("[^"]*"|'[^']*'|[^\s>]+))?/g
    var ropen = /<\w+\b(?:(["'])[^"]*?(\1)|[^>])*>/ig
    var rsanitize = {
        a: /\b(href)\=("javascript[^"]*"|'javascript[^']*')/ig,
        img: /\b(src)\=("javascript[^"]*"|'javascript[^']*')/ig,
        form: /\b(action)\=("javascript[^"]*"|'javascript[^']*')/ig
    }
    var rsurrogate = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g
    var rnoalphanumeric = /([^\#-~| |!])/g;

    function numberFormat(number, decimals, point, thousands) {
        //form http://phpjs.org/functions/number_format/
        //number	���裬Ҫ��ʽ��������
        //decimals	��ѡ���涨���ٸ�С��λ��
        //point	��ѡ���涨����С������ַ�����Ĭ��Ϊ . ����
        //thousands	��ѡ���涨����ǧλ�ָ������ַ�����Ĭ��Ϊ , ������������˸ò�������ô���������������Ǳ���ġ�
        number = (number + '')
            .replace(/[^0-9+\-Ee.]/g, '')
        var n = !isFinite(+number) ? 0 : +number,
            prec = !isFinite(+decimals) ? 3 : Math.abs(decimals),
            sep = thousands || ",",
            dec = point || ".",
            s = '',
            toFixedFix = function(n, prec) {
                var k = Math.pow(10, prec)
                return '' + (Math.round(n * k) / k)
                        .toFixed(prec)
            }
        // Fix for IE parseFloat(0.55).toFixed(0) = 0;
        s = (prec ? toFixedFix(n, prec) : '' + Math.round(n))
            .split('.')
        if (s[0].length > 3) {
            s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep)
        }
        if ((s[1] || '')
                .length < prec) {
            s[1] = s[1] || ''
            s[1] += new Array(prec - s[1].length + 1)
                .join('0')
        }
        return s.join(dec)
    }


    var filters = avalon.filters = {
        uppercase: function(str) {
            return str.toUpperCase()
        },
        lowercase: function(str) {
            return str.toLowerCase()
        },
        truncate: function(str, length, truncation) {
            //length�����ַ������ȣ�truncation�����ַ����Ľ�β���ֶ�,�������ַ���
            length = length || 30
            truncation = typeof truncation === "string" ?  truncation : "..."
            return str.length > length ? str.slice(0, length - truncation.length) + truncation : String(str)
        },
        $filter: function(val) {
            for (var i = 1, n = arguments.length; i < n; i++) {
                var array = arguments[i]
                var fn = avalon.filters[array[0]]
                if (typeof fn === "function") {
                    var arr = [val].concat(array.slice(1))
                    val = fn.apply(null, arr)
                }
            }
            return val
        },
        camelize: camelize,
        //https://www.owasp.org/index.php/XSS_Filter_Evasion_Cheat_Sheet
        //    <a href="javasc&NewLine;ript&colon;alert('XSS')">chrome</a> 
        //    <a href="data:text/html;base64, PGltZyBzcmM9eCBvbmVycm9yPWFsZXJ0KDEpPg==">chrome</a>
        //    <a href="jav	ascript:alert('XSS');">IE67chrome</a>
        //    <a href="jav&#x09;ascript:alert('XSS');">IE67chrome</a>
        //    <a href="jav&#x0A;ascript:alert('XSS');">IE67chrome</a>
        sanitize: function(str) {
            return str.replace(rscripts, "").replace(ropen, function(a, b) {
                var match = a.toLowerCase().match(/<(\w+)\s/)
                if (match) { //����a��ǩ��href���ԣ�img��ǩ��src���ԣ�form��ǩ��action����
                    var reg = rsanitize[match[1]]
                    if (reg) {
                        a = a.replace(reg, function(s, name, value) {
                            var quote = value.charAt(0)
                            return name + "=" + quote + "javascript:void(0)" + quote// jshint ignore:line
                        })
                    }
                }
                return a.replace(ron, " ").replace(/\s+/g, " ") //�Ƴ�onXXX�¼�
            })
        },
        escape: function(str) {
            //���ַ������� str ת��õ��ʺ���ҳ������ʾ������, �����滻 < Ϊ &lt 
            return String(str).
                replace(/&/g, '&amp;').
                replace(rsurrogate, function(value) {
                    var hi = value.charCodeAt(0)
                    var low = value.charCodeAt(1)
                    return '&#' + (((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000) + ';'
                }).
                replace(rnoalphanumeric, function(value) {
                    return '&#' + value.charCodeAt(0) + ';'
                }).
                replace(/</g, '&lt;').
                replace(/>/g, '&gt;')
        },
        currency: function(amount, symbol, fractionSize) {
            return (symbol || "\uFFE5") + numberFormat(amount, isFinite(fractionSize) ? fractionSize : 2)
        },
        number: numberFormat
    }
    /*
     'yyyy': 4 digit representation of year (e.g. AD 1 => 0001, AD 2010 => 2010)
     'yy': 2 digit representation of year, padded (00-99). (e.g. AD 2001 => 01, AD 2010 => 10)
     'y': 1 digit representation of year, e.g. (AD 1 => 1, AD 199 => 199)
     'MMMM': Month in year (January-December)
     'MMM': Month in year (Jan-Dec)
     'MM': Month in year, padded (01-12)
     'M': Month in year (1-12)
     'dd': Day in month, padded (01-31)
     'd': Day in month (1-31)
     'EEEE': Day in Week,(Sunday-Saturday)
     'EEE': Day in Week, (Sun-Sat)
     'HH': Hour in day, padded (00-23)
     'H': Hour in day (0-23)
     'hh': Hour in am/pm, padded (01-12)
     'h': Hour in am/pm, (1-12)
     'mm': Minute in hour, padded (00-59)
     'm': Minute in hour (0-59)
     'ss': Second in minute, padded (00-59)
     's': Second in minute (0-59)
     'a': am/pm marker
     'Z': 4 digit (+sign) representation of the timezone offset (-1200-+1200)
     format string can also be one of the following predefined localizable formats:

     'medium': equivalent to 'MMM d, y h:mm:ss a' for en_US locale (e.g. Sep 3, 2010 12:05:08 pm)
     'short': equivalent to 'M/d/yy h:mm a' for en_US locale (e.g. 9/3/10 12:05 pm)
     'fullDate': equivalent to 'EEEE, MMMM d,y' for en_US locale (e.g. Friday, September 3, 2010)
     'longDate': equivalent to 'MMMM d, y' for en_US locale (e.g. September 3, 2010
     'mediumDate': equivalent to 'MMM d, y' for en_US locale (e.g. Sep 3, 2010)
     'shortDate': equivalent to 'M/d/yy' for en_US locale (e.g. 9/3/10)
     'mediumTime': equivalent to 'h:mm:ss a' for en_US locale (e.g. 12:05:08 pm)
     'shortTime': equivalent to 'h:mm a' for en_US locale (e.g. 12:05 pm)
     */
    new function() {// jshint ignore:line
        function toInt(str) {
            return parseInt(str, 10) || 0
        }

        function padNumber(num, digits, trim) {
            var neg = ""
            if (num < 0) {
                neg = '-'
                num = -num
            }
            num = "" + num
            while (num.length < digits)
                num = "0" + num
            if (trim)
                num = num.substr(num.length - digits)
            return neg + num
        }

        function dateGetter(name, size, offset, trim) {
            return function(date) {
                var value = date["get" + name]()
                if (offset > 0 || value > -offset)
                    value += offset
                if (value === 0 && offset === -12) {
                    value = 12
                }
                return padNumber(value, size, trim)
            }
        }

        function dateStrGetter(name, shortForm) {
            return function(date, formats) {
                var value = date["get" + name]()
                var get = (shortForm ? ("SHORT" + name) : name).toUpperCase()
                return formats[get][value]
            }
        }

        function timeZoneGetter(date) {
            var zone = -1 * date.getTimezoneOffset()
            var paddedZone = (zone >= 0) ? "+" : ""
            paddedZone += padNumber(Math[zone > 0 ? "floor" : "ceil"](zone / 60), 2) + padNumber(Math.abs(zone % 60), 2)
            return paddedZone
        }
        //ȡ����������

        function ampmGetter(date, formats) {
            return date.getHours() < 12 ? formats.AMPMS[0] : formats.AMPMS[1]
        }
        var DATE_FORMATS = {
            yyyy: dateGetter("FullYear", 4),
            yy: dateGetter("FullYear", 2, 0, true),
            y: dateGetter("FullYear", 1),
            MMMM: dateStrGetter("Month"),
            MMM: dateStrGetter("Month", true),
            MM: dateGetter("Month", 2, 1),
            M: dateGetter("Month", 1, 1),
            dd: dateGetter("Date", 2),
            d: dateGetter("Date", 1),
            HH: dateGetter("Hours", 2),
            H: dateGetter("Hours", 1),
            hh: dateGetter("Hours", 2, -12),
            h: dateGetter("Hours", 1, -12),
            mm: dateGetter("Minutes", 2),
            m: dateGetter("Minutes", 1),
            ss: dateGetter("Seconds", 2),
            s: dateGetter("Seconds", 1),
            sss: dateGetter("Milliseconds", 3),
            EEEE: dateStrGetter("Day"),
            EEE: dateStrGetter("Day", true),
            a: ampmGetter,
            Z: timeZoneGetter
        }
        var rdateFormat = /((?:[^yMdHhmsaZE']+)|(?:'(?:[^']|'')*')|(?:E+|y+|M+|d+|H+|h+|m+|s+|a|Z))(.*)/
        var raspnetjson = /^\/Date\((\d+)\)\/$/
        filters.date = function(date, format) {
            var locate = filters.date.locate,
                text = "",
                parts = [],
                fn, match
            format = format || "mediumDate"
            format = locate[format] || format
            if (typeof date === "string") {
                if (/^\d+$/.test(date)) {
                    date = toInt(date)
                } else if (raspnetjson.test(date)) {
                    date = +RegExp.$1
                } else {
                    var trimDate = date.trim()
                    var dateArray = [0, 0, 0, 0, 0, 0, 0]
                    var oDate = new Date(0)
                    //ȡ��������
                    trimDate = trimDate.replace(/^(\d+)\D(\d+)\D(\d+)/, function(_, a, b, c) {
                        var array = c.length === 4 ? [c, a, b] : [a, b, c]
                        dateArray[0] = toInt(array[0])     //��
                        dateArray[1] = toInt(array[1]) - 1 //��
                        dateArray[2] = toInt(array[2])     //��
                        return ""
                    })
                    var dateSetter = oDate.setFullYear
                    var timeSetter = oDate.setHours
                    trimDate = trimDate.replace(/[T\s](\d+):(\d+):?(\d+)?\.?(\d)?/, function(_, a, b, c, d) {
                        dateArray[3] = toInt(a) //Сʱ
                        dateArray[4] = toInt(b) //����
                        dateArray[5] = toInt(c) //��
                        if (d) {                //����
                            dateArray[6] = Math.round(parseFloat("0." + d) * 1000)
                        }
                        return ""
                    })
                    var tzHour = 0
                    var tzMin = 0
                    trimDate = trimDate.replace(/Z|([+-])(\d\d):?(\d\d)/, function(z, symbol, c, d) {
                        dateSetter = oDate.setUTCFullYear
                        timeSetter = oDate.setUTCHours
                        if (symbol) {
                            tzHour = toInt(symbol + c)
                            tzMin = toInt(symbol + d)
                        }
                        return ""
                    })

                    dateArray[3] -= tzHour
                    dateArray[4] -= tzMin
                    dateSetter.apply(oDate, dateArray.slice(0, 3))
                    timeSetter.apply(oDate, dateArray.slice(3))
                    date = oDate
                }
            }
            if (typeof date === "number") {
                date = new Date(date)
            }
            if (avalon.type(date) !== "date") {
                return
            }
            while (format) {
                match = rdateFormat.exec(format)
                if (match) {
                    parts = parts.concat(match.slice(1))
                    format = parts.pop()
                } else {
                    parts.push(format)
                    format = null
                }
            }
            parts.forEach(function(value) {
                fn = DATE_FORMATS[value]
                text += fn ? fn(date, locate) : value.replace(/(^'|'$)/g, "").replace(/''/g, "'")
            })
            return text
        }
        var locate = {
            AMPMS: {
                0: "����",
                1: "����"
            },
            DAY: {
                0: "������",
                1: "����һ",
                2: "���ڶ�",
                3: "������",
                4: "������",
                5: "������",
                6: "������"
            },
            MONTH: {
                0: "1��",
                1: "2��",
                2: "3��",
                3: "4��",
                4: "5��",
                5: "6��",
                6: "7��",
                7: "8��",
                8: "9��",
                9: "10��",
                10: "11��",
                11: "12��"
            },
            SHORTDAY: {
                "0": "����",
                "1": "��һ",
                "2": "�ܶ�",
                "3": "����",
                "4": "����",
                "5": "����",
                "6": "����"
            },
            fullDate: "y��M��d��EEEE",
            longDate: "y��M��d��",
            medium: "yyyy-M-d H:mm:ss",
            mediumDate: "yyyy-M-d",
            mediumTime: "H:mm:ss",
            "short": "yy-M-d ah:mm",
            shortDate: "yy-M-d",
            shortTime: "ah:mm"
        }
        locate.SHORTMONTH = locate.MONTH
        filters.date.locate = locate
    }// jshint ignore:line
    /*********************************************************************
     *                      AMD������                                   *
     **********************************************************************/
//https://www.devbridge.com/articles/understanding-amd-requirejs/
//http://maxogden.com/nested-dependencies.html
    var modules = avalon.modules = {
        "domReady!": {
            exports: avalon,
            state: 3
        },
        "avalon": {
            exports: avalon,
            state: 4
        }
    }

    var otherRequire = window.require
    var otherDefine = window.define
    var innerRequire

    plugins.loader = function (builtin) {
        var flag = innerRequire && builtin
        window.require = flag ? innerRequire : otherRequire
        window.define = flag ? innerRequire.define : otherDefine
    }
//Object(modules[id]).stateӵ������ֵ 
// undefined  û�ж���
// 1(send)    �Ѿ���������
// 2(loading) �Ѿ���ִ�е���û��ִ����ɣ�������׶�define�����ᱻִ��
// 3(loaded)  ִ����ϣ�ͨ��onload/onreadystatechange�ص��ж���������׶�checkDeps������ִ��
// 4(execute)  ������Ҳִ�����, ֵ�ŵ�exports�����ϣ�������׶�fireFactory������ִ��
    modules.exports = modules.avalon

    new function () {// jshint ignore:line
        var loadings = [] //���ڼ����е�ģ���б�
        var factorys = [] //����define������factory����
        var rjsext = /\.js$/i
        function makeRequest(name, config) {
//1. ȥ����Դǰ׺
            var res = "js"
            name = name.replace(/^(\w+)\!/, function (a, b) {
                res = b
                return ""
            })
            if (res === "ready") {
                log("debug: ready!�Ѿ�����������ʹ��domReady!")
                res = "domReady"
            }
//2. ȥ��querystring, hash
            var query = ""
            name = name.replace(rquery, function (a) {
                query = a
                return ""
            })
            //3. ȥ����չ��
            var suffix = "." + res
            var ext = /js|css/.test(suffix) ? suffix : ""
            name = name.replace(/\.[a-z0-9]+$/g, function (a) {
                if (a === suffix) {
                    ext = a
                    return ""
                } else {
                    return a
                }
            })
            var req = avalon.mix({
                query: query,
                ext: ext,
                res: res,
                name: name,
                toUrl: toUrl
            }, config)
            req.toUrl(name)
            return req
        }

        function fireRequest(req) {
            var name = req.name
            var res = req.res
            //1. �����ģ���Ѿ���������ֱ�ӷ���
            var module = modules[name]
            var urlNoQuery = name && req.urlNoQuery
            if (module && module.state >= 1) {
                return name
            }
            module = modules[urlNoQuery]
            if (module && module.state >= 3) {
                innerRequire(module.deps || [], module.factory, urlNoQuery)
                return urlNoQuery
            }
            if (name && !module) {
                module = modules[urlNoQuery] = {
                    id: urlNoQuery,
                    state: 1 //send
                }
                var wrap = function (obj) {
                    resources[res] = obj
                    obj.load(name, req, function (a) {
                        if (arguments.length && a !== void 0) {
                            module.exports = a
                        }
                        module.state = 4
                        checkDeps()
                    })
                }

                if (!resources[res]) {
                    innerRequire([res], wrap)
                } else {
                    wrap(resources[res])
                }
            }
            return name ? urlNoQuery : res + "!"
        }

//����API֮һ require
        var requireQueue = []
        var isUserFirstRequire = false
        innerRequire = avalon.require = function (array, factory, parentUrl, defineConfig) {
            if (!isUserFirstRequire) {
                requireQueue.push(avalon.slice(arguments))
                if (arguments.length <= 2) {
                    isUserFirstRequire = true
                    var queue = requireQueue.splice(0, requireQueue.length), args
                    while (args = queue.shift()) {
                        innerRequire.apply(null, args)
                    }
                }
                return
            }

            if (!Array.isArray(array)) {
                avalon.error("require�����ĵ�һ������ӦΪ���� " + array)
            }
            var deps = [] // �������������������·��
            var uniq = {}
            var id = parentUrl || "callback" + setTimeout("1")// jshint ignore:line
            defineConfig = defineConfig || {}
            defineConfig.baseUrl = kernel.baseUrl
            var isBuilt = !!defineConfig.built
            if (parentUrl) {
                defineConfig.parentUrl = parentUrl.substr(0, parentUrl.lastIndexOf("/"))
                defineConfig.mapUrl = parentUrl.replace(rjsext, "")
            }
            if (isBuilt) {
                var req = makeRequest(defineConfig.defineName, defineConfig)
                id = req.urlNoQuery
            } else {
                array.forEach(function (name) {
                    var req = makeRequest(name, defineConfig)
                    var url = fireRequest(req) //������Դ�������ظ���Դ��������ַ
                    if (url) {
                        if (!uniq[url]) {
                            deps.push(url)
                            uniq[url] = "˾ͽ����" //ȥ��
                        }
                    }
                })
            }

            var module = modules[id]
            if (!module || module.state !== 4) {
                modules[id] = {
                    id: id,
                    deps: isBuilt ? array.concat() : deps,
                    factory: factory || noop,
                    state: 3
                }
            }
            if (!module) {
                //�����ģ���Ƕ�������һ��JS�ļ���, �Ǳ���ȸ��ļ��������, ���ܷŵ�����ж���
                loadings.push(id)
            }
            checkDeps()
        }

//����API֮�� require
        innerRequire.define = function (name, deps, factory) { //ģ����,�����б�,ģ�鱾��
            if (typeof name !== "string") {
                factory = deps
                deps = name
                name = "anonymous"
            }
            if (!Array.isArray(deps)) {
                factory = deps
                deps = []
            }
            var config = {
                built: !isUserFirstRequire, //��r.js�����,����define��ŵ�requirejs֮ǰ
                defineName: name
            }
            var args = [deps, factory, config]
            factory.require = function (url) {
                args.splice(2, 0, url)
                if (modules[url]) {
                    modules[url].state = 3 //loaded
                    var isCycle = false
                    try {
                        isCycle = checkCycle(modules[url].deps, url)
                    } catch (e) {
                    }
                    if (isCycle) {
                        avalon.error(url + "ģ����֮ǰ��ģ�����ѭ���������벻Ҫֱ����script��ǩ����" + url + "ģ��")
                    }
                }
                delete factory.require //�ͷ��ڴ�
                innerRequire.apply(null, args) //0,1,2 --> 1,2,0
            }
//���ݱ�׼,������ѭW3C��׼�������,script��ǩ�ᰴ��ǩ�ĳ���˳��ִ�С�
//�ϵ�������У�����Ҳ�ǰ�˳��ģ�һ���ļ�������ɺ󣬲ſ�ʼ������һ���ļ���
//���µ�������У�IE8+ ��FireFox3.5+ ��Chrome4+ ��Safari4+����Ϊ�˼�С����ʱ�����Ż����飬
//���ؿ����ǲ��еģ�����ִ��˳���ǰ��ձ�ǩ���ֵ�˳��
//�����script��ǩ�Ƕ�̬�����, ��δ�ذ�����������ִ�е�ԭ����,Ŀ��ֻ��firefox����
//Ψһ�Ƚ�һ�µ���,IE10+��������׼�����,һ����ʼ�����ű�, �ͻ�һֱ��������,ֱ�ӽű��������
//�༴���Ƚ���loading�׶ε�script��ǩ(ģ��)��Ȼ���Ƚ���loaded�׶�
            var url = config.built ? "unknown" : getCurrentScript()
            if (url) {
                var module = modules[url]
                if (module) {
                    module.state = 2
                }
                factory.require(url)
            } else {//�ϲ�ǰ���safari���ϲ����IE6-9�ߴ˷�֧
                factorys.push(factory)
            }
        }
//����API֮�� require.config(settings)
        innerRequire.config = kernel
        //����API֮�� define.amd ��ʶ�����AMD�淶
        innerRequire.define.amd = modules

        //==========================���û�����������ټӹ�==========================
        var allpaths = kernel["orig.paths"] = {}
        var allmaps = kernel["orig.map"] = {}
        var allpackages = kernel["packages"] = []
        var allargs = kernel["orig.args"] = {}
        avalon.mix(plugins, {
            paths: function (hash) {
                avalon.mix(allpaths, hash)
                kernel.paths = makeIndexArray(allpaths)
            },
            map: function (hash) {
                avalon.mix(allmaps, hash)
                var list = makeIndexArray(allmaps, 1, 1)
                avalon.each(list, function (_, item) {
                    item.val = makeIndexArray(item.val)
                })
                kernel.map = list
            },
            packages: function (array) {
                array = array.concat(allpackages)
                var uniq = {}
                var ret = []
                for (var i = 0, pkg; pkg = array[i++]; ) {
                    pkg = typeof pkg === "string" ? {name: pkg} : pkg
                    var name = pkg.name
                    if (!uniq[name]) {
                        var url = joinPath(pkg.location || name, pkg.main || "main")
                        url = url.replace(rjsext, "")
                        ret.push(pkg)
                        uniq[name] = pkg.location = url
                        pkg.reg = makeMatcher(name)
                    }
                }
                kernel.packages = ret.sort()
            },
            urlArgs: function (hash) {
                if (typeof hash === "string") {
                    hash = {"*": hash}
                }
                avalon.mix(allargs, hash)
                kernel.urlArgs = makeIndexArray(allargs, 1)
            },
            baseUrl: function (url) {
                if (!isAbsUrl(url)) {
                    var baseElement = head.getElementsByTagName("base")[0]
                    if (baseElement) {
                        head.removeChild(baseElement)
                    }
                    var node = DOC.createElement("a")
                    node.href = url
                    url = getFullUrl(node, "href")
                    if (baseElement) {
                        head.insertBefore(baseElement, head.firstChild)
                    }
                }
                if (url.length > 3)
                    kernel.baseUrl = url
            },
            shim: function (obj) {
                for (var i in obj) {
                    var value = obj[i]
                    if (Array.isArray(value)) {
                        value = obj[i] = {
                            deps: value
                        }
                    }
                    if (!value.exportsFn && (value.exports || value.init)) {
                        value.exportsFn = makeExports(value)
                    }
                }
                kernel.shim = obj
            }

        })


        //==============================�ڲ�����=================================
        function checkCycle(deps, nick) {
            //����Ƿ����ѭ������
            for (var i = 0, id; id = deps[i++]; ) {
                if (modules[id].state !== 4 &&
                    (id === nick || checkCycle(modules[id].deps, nick))) {
                    return true
                }
            }
        }

        function checkFail(node, onError, fuckIE) {
            var id = trimQuery(node.src) //����Ƿ�����
            node.onload = node.onreadystatechange = node.onerror = null
            if (onError || (fuckIE && modules[id] && !modules[id].state)) {
                setTimeout(function () {
                    head.removeChild(node)
                    node = null // �����ʽIE�µ�ѭ����������
                })
                log("debug: ���� " + id + " ʧ��" + onError + " " + (!modules[id].state))
            } else {
                return true
            }
        }

        function checkDeps() {
            //����JSģ��������Ƿ��Ѱ�װ���,����װ����
            loop: for (var i = loadings.length, id; id = loadings[--i]; ) {
                var obj = modules[id],
                    deps = obj.deps
                if (!deps)
                    continue
                for (var j = 0, key; key = deps[j]; j++) {
                    if (Object(modules[key]).state !== 4) {
                        continue loop
                    }
                }
                //���deps�ǿն��������������ģ���״̬����2
                if (obj.state !== 4) {
                    loadings.splice(i, 1) //�������Ƴ��ٰ�װ����ֹ��IE��DOM��������ֶ�ˢ��ҳ�棬����ִ����
                    fireFactory(obj.id, obj.deps, obj.factory)
                    checkDeps() //����ɹ�,����ִ��һ��,�Է���Щģ��Ͳģ��û�а�װ��
                }
            }
        }

        var rreadyState = /complete|loaded/
        function loadJS(url, id, callback) {
            //ͨ��script�ڵ����Ŀ��ģ��
            var node = DOC.createElement("script")
            node.className = subscribers //��getCurrentScriptֻ��������Ϊsubscribers��script�ڵ�
            var supportLoad = "onload" in node
            var onEvent = supportLoad ? "onload" : "onreadystatechange"
            function onload() {
                var factory = factorys.pop()
                factory && factory.require(id)
                if (callback) {
                    callback()
                }
                if (checkFail(node, false, !supportLoad)) {
                    log("debug: �ѳɹ����� " + url)
                    id && loadings.push(id)
                    checkDeps()
                }
            }
            var index = 0, loadID
            node[onEvent] = supportLoad ? onload : function () {
                if (rreadyState.test(node.readyState)) {
                    ++index
                    if (index === 1) {
                        loadID = setTimeout(onload, 500)
                    } else {
                        clearTimeout(loadID)
                        onload()
                    }
                }
            }
            node.onerror = function () {
                checkFail(node, true)
            }

            head.insertBefore(node, head.firstChild) //chrome�µڶ�����������Ϊnull
            node.src = url //���뵽head�ĵ�һ���ڵ�ǰ����ֹIE6��head��ǩû�պ�ǰʹ��appendChild�״�
            log("debug: ��׼������ " + url) //����Ҫ����IE6�¿�����խgetCurrentScript��Ѱ�ҷ�Χ
        }

        var resources = innerRequire.plugins = {
            //��������Դ��� js!, css!, text!, ready!
            ready: {
                load: noop
            },
            js: {
                load: function (name, req, onLoad) {
                    var url = req.url
                    var id = req.urlNoQuery
                    var shim = kernel.shim[name.replace(rjsext, "")]
                    if (shim) { //shim����
                        innerRequire(shim.deps || [], function () {
                            var args = avalon.slice(arguments)
                            loadJS(url, id, function () {
                                onLoad(shim.exportsFn ? shim.exportsFn.apply(0, args) : void 0)
                            })
                        })
                    } else {
                        loadJS(url, id)
                    }
                }
            },
            css: {
                load: function (name, req, onLoad) {
                    var url = req.url
                    var node = DOC.createElement("link")
                    node.rel = "stylesheet"
                    node.href = url
                    head.insertBefore(node, head.firstChild)
                    log("debug: �ѳɹ����� " + url)
                    onLoad()
                }
            },
            text: {
                load: function (name, req, onLoad) {
                    var url = req.url
                    var xhr = getXHR()
                    xhr.onreadystatechange = function () {
                        if (xhr.readyState === 4) {
                            var status = xhr.status;
                            if (status > 399 && status < 600) {
                                avalon.error(url + " ��Ӧ��Դ�����ڻ�û�п��� CORS")
                            } else {
                                log("debug: �ѳɹ����� " + url)
                                onLoad(xhr.responseText)
                            }
                        }
                    }
                    var time = "_=" + (new Date() - 0)
                    var _url = url.indexOf("?") === -1 ? url + "?" + time : url + "&" + time
                    xhr.open("GET", _url, true)
                    if ("withCredentials" in xhr) {//���Ǵ������
                        xhr.withCredentials = true
                    }
                    xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest")//���ߺ������AJAX����
                    xhr.send()
                    log("debug: ��׼������ " + url)
                }
            }
        }
        innerRequire.checkDeps = checkDeps

        var rquery = /(\?[^#]*)$/
        function trimQuery(url) {
            return (url || "").replace(rquery, "")
        }

        function isAbsUrl(path) {
            //http://stackoverflow.com/questions/10687099/how-to-test-if-a-url-string-is-absolute-or-relative
            return  /^(?:[a-z]+:)?\/\//i.test(String(path))
        }

        function getFullUrl(node, src) {
            return"1"[0] ? node[src] : node.getAttribute(src, 4)
        }

        function getCurrentScript() {
            // inspireb by https://github.com/samyk/jiagra/blob/master/jiagra.js
            var stack
            try {
                a.b.c() //ǿ�Ʊ���,�Ա㲶��e.stack
            } catch (e) { //safari5��sourceURL��firefox��fileName�����ǵ�Ч����e.stack��һ��
                stack = e.stack
                if (!stack && window.opera) {
                    //opera 9û��e.stack,����e.Backtrace,������ֱ��ȡ��,��Ҫ��e����ת�ַ������г�ȡ
                    stack = (String(e).match(/of linked script \S+/g) || []).join(" ")
                }
            }
            if (stack) {
                /**e.stack���һ��������֧�ֵ��������������:
                 *chrome23:
                 * at http://113.93.50.63/data.js:4:1
                 *firefox17:
                 *@http://113.93.50.63/query.js:4
                 *opera12:http://www.oldapps.com/opera.php?system=Windows_XP
                 *@http://113.93.50.63/data.js:4
                 *IE10:
                 *  at Global code (http://113.93.50.63/data.js:4:1)
                 *  //firefox4+ ������document.currentScript
                 */
                stack = stack.split(/[@ ]/g).pop() //ȡ�����һ��,���һ���ո��@֮��Ĳ���
                stack = stack[0] === "(" ? stack.slice(1, -1) : stack.replace(/\s/, "") //ȥ�����з�
                return trimQuery(stack.replace(/(:\d+)?:\d+$/i, "")) //ȥ���к��������ڵĳ����ַ���ʼλ��
            }
            var nodes = head.getElementsByTagName("script") //ֻ��head��ǩ��Ѱ��
            for (var i = nodes.length, node; node = nodes[--i]; ) {
                if (node.className === subscribers && node.readyState === "interactive") {
                    var url = getFullUrl(node, "src")
                    return node.className = trimQuery(url)
                }
            }
        }

        var rcallback = /^callback\d+$/
        function fireFactory(id, deps, factory) {
            var module = Object(modules[id])
            module.state = 4
            for (var i = 0, array = [], d; d = deps[i++]; ) {
                if (d === "exports") {
                    var obj = module.exports || (module.exports = {})
                    array.push(obj)
                } else {
                    array.push(modules[d].exports)
                }
            }
            try {
                var ret = factory.apply(window, array)
            } catch (e) {
                log("ִ��[" + id + "]ģ���factory�״� ", e)
            }
            if (ret !== void 0) {
                module.exports = ret
            }
            if (rcallback.test(id)) {
                delete modules[id]
            }
            delete module.factory
            return ret
        }
        function toUrl(id) {
            if (id.indexOf(this.res + "!") === 0) {
                id = id.slice(this.res.length + 1) //����define("css!style",[], function(){})�����
            }
            var url = id
            //1. �Ƿ�����paths������
            var usePath = 0
            var baseUrl = this.baseUrl
            var rootUrl = this.parentUrl || baseUrl
            eachIndexArray(id, kernel.paths, function (value, key) {
                url = url.replace(key, value)
                usePath = 1
            })
            //2. �Ƿ�����packages������
            if (!usePath) {
                eachIndexArray(id, kernel.packages, function (value, key, item) {
                    url = url.replace(item.name, item.location)
                })
            }
            //3. �Ƿ�����map������
            if (this.mapUrl) {
                eachIndexArray(this.mapUrl, kernel.map, function (array) {
                    eachIndexArray(url, array, function (mdValue, mdKey) {
                        url = url.replace(mdKey, mdValue)
                        rootUrl = baseUrl
                    })
                })
            }
            var ext = this.ext
            if (ext && usePath && url.slice(-ext.length) === ext) {
                url = url.slice(0, -ext.length)
            }
            //4. ת��Ϊ����·��
            if (!isAbsUrl(url)) {
                rootUrl = this.built || /^\w/.test(url) ? baseUrl : rootUrl
                url = joinPath(rootUrl, url)
            }
            //5. ��ԭ��չ����query
            var urlNoQuery = url + ext
            url = urlNoQuery + this.query
            urlNoQuery = url.replace(rquery, function (a) {
                this.query = a
                return ""
            })
            //6. ����urlArgs
            eachIndexArray(id, kernel.urlArgs, function (value) {
                url += (url.indexOf("?") === -1 ? "?" : "&") + value;
            })
            this.url = url
            return  this.urlNoQuery = urlNoQuery
        }

        function makeIndexArray(hash, useStar, part) {
            //����һ�����������㷨�ź��������
            var index = hash2array(hash, useStar, part)
            index.sort(descSorterByName)
            return index
        }

        function makeMatcher(prefix) {
            return new RegExp('^' + prefix + '(/|$)')
        }

        function makeExports(value) {
            return function () {
                var ret
                if (value.init) {
                    ret = value.init.apply(window, arguments)
                }
                return ret || (value.exports && getGlobal(value.exports))
            }
        }


        function hash2array(hash, useStar, part) {
            var array = [];
            for (var key in hash) {
                if (ohasOwn.call(hash, key)) {
                    var item = {
                        name: key,
                        val: hash[key]
                    }
                    array.push(item)
                    item.reg = key === "*" && useStar ? /^/ : makeMatcher(key)
                    if (part && key !== "*") {
                        item.reg = new RegExp('\/' + key.replace(/^\//, "") + '(/|$)')
                    }
                }
            }
            return array
        }

        function eachIndexArray(moduleID, array, matcher) {
            array = array || []
            for (var i = 0, el; el = array[i++]; ) {
                if (el.reg.test(moduleID)) {
                    matcher(el.val, el.name, el)
                    return false
                }
            }
        }
        // ����Ԫ�ص�name����������ַ��������������
        function descSorterByName(a, b) {
            var aaa = a.name
            var bbb = b.name
            if (bbb === "*") {
                return -1
            }
            if (aaa === "*") {
                return 1
            }
            return bbb.length - aaa.length
        }

        var rdeuce = /\/\w+\/\.\./
        function joinPath(a, b) {
            if (a.charAt(a.length - 1) !== "/") {
                a += "/"
            }
            if (b.slice(0, 2) === "./") { //������ֵ�·��
                return a + b.slice(2)
            }
            if (b.slice(0, 2) === "..") { //����ڸ�·��
                a += b
                while (rdeuce.test(a)) {
                    a = a.replace(rdeuce, "")
                }
                return a
            }
            if (b.slice(0, 1) === "/") {
                return a + b.slice(1)
            }
            return a + b
        }

        function getGlobal(value) {
            if (!value) {
                return value
            }
            var g = window
            value.split(".").forEach(function (part) {
                g = g[part]
            })
            return g
        }

        var mainNode = DOC.scripts[DOC.scripts.length - 1]
        var dataMain = mainNode.getAttribute("data-main")
        if (dataMain) {
            plugins.baseUrl(dataMain)
            var href = kernel.baseUrl
            kernel.baseUrl = href.slice(0, href.lastIndexOf("/") + 1)
            loadJS(href.replace(rjsext, "") + ".js")
        } else {
            var loaderUrl = trimQuery(getFullUrl(mainNode, "src"))
            kernel.baseUrl = loaderUrl.slice(0, loaderUrl.lastIndexOf("/") + 1)
        }
    }// jshint ignore:line

    /*********************************************************************
     *                           DOMReady                               *
     **********************************************************************/

    var readyList = [], isReady
    var fireReady = function(fn) {
        isReady = true
        var require = avalon.require
        if (require && require.checkDeps) {
            modules["domReady!"].state = 4
            require.checkDeps()
        }
        while(fn = readyList.shift()){
            fn(avalon)
        }
    }

    function doScrollCheck() {
        try { //IE��ͨ��doScrollCheck���DOM���Ƿ���
            root.doScroll("left")
            fireReady()
        } catch (e) {
            setTimeout(doScrollCheck)
        }
    }

    if (DOC.readyState === "complete") {
        setTimeout(fireReady) //�����domReady֮�����
    } else if (W3C) {
        DOC.addEventListener("DOMContentLoaded", fireReady)
    } else {
        DOC.attachEvent("onreadystatechange", function() {
            if (DOC.readyState === "complete") {
                fireReady()
            }
        })
        try {
            var isTop = window.frameElement === null
        } catch (e) {
        }
        if (root.doScroll && isTop && window.external) {//fix IE iframe BUG
            doScrollCheck()
        }
    }
    avalon.bind(window, "load", fireReady)

    avalon.ready = function(fn) {
        if (!isReady) {
            readyList.push(fn)
        } else {
            fn(avalon)
        }
    }

    avalon.config({
        loader: true
    })

    avalon.ready(function() {
        avalon.scan(DOC.body)
    })

// Register as a named AMD module, since avalon can be concatenated with other
// files that may use define, but not via a proper concatenation script that
// understands anonymous AMD modules. A named AMD is safest and most robust
// way to register. Lowercase avalon is used because AMD module names are
// derived from file names, and Avalon is normally delivered in a lowercase
// file name. Do this after creating the global so that if an AMD module wants
// to call noConflict to hide this version of avalon, it will work.

// Note that for maximum portability, libraries that are not avalon should
// declare themselves as anonymous modules, and avoid setting a global if an
// AMD loader is present. avalon is a special case. For more information, see
// https://github.com/jrburke/requirejs/wiki/Updating-existing-libraries#wiki-anon
    if (typeof define === "function" && define.amd) {
        define("avalon", [], function() {
            return avalon
        })
    }
// Map over avalon in case of overwrite
    var _avalon = window.avalon
    avalon.noConflict = function(deep) {
        if (deep && window.avalon === avalon) {
            window.avalon = _avalon
        }
        return avalon
    }
// Expose avalon identifiers, even in AMD
// and CommonJS for browser emulators
    if (noGlobal === void 0) {
        window.avalon = avalon
    }

    return avalon

}));