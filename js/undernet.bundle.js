/*!
  * @license MIT (https://github.com/geotrev/undernet/blob/master/LICENSE)
  * Undernet v8.1.0 (https://undernet.io)
  * Copyright 2017-2020 George Treviranus
  */
(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
}((function () { 'use strict';

  function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  var KeyCodes = {
    SHIFT: 16,
    TAB: 9,
    ARROW_UP: 38,
    ARROW_DOWN: 40
  };
  var Selectors = {
    FOCUSABLE_TAGS: ["a", "button", "input", "object", "select", "textarea", "[tabindex]"],
    KEYBOARD_CLASS: "using-keyboard",
    NOT_VISUALLY_HIDDEN_CLASS: ":not(.is-visually-hidden)",
    TABINDEX: "tabindex"
  };
  var Events = {
    KEYDOWN: "keydown",
    CLICK: "click",
    BLUR: "blur"
  };
  var Messages = {
    NO_SELECTOR_STRING_OR_CHILDREN_ERROR: "createFocusTrap must be given one or both of: first parameter (as selector string)" + " and/or options.children (array of elements).",
    OPTION_MATCHERS_DATA_TYPE_ERROR: "Invalid data type given to options.matchers for createFocusTrap. Expected: Array.",
    INCORRECT_MATCHER_TYPE_ERROR: function INCORRECT_MATCHER_TYPE_ERROR(type) {
      return "Invalid matcher given to options.matchers for createFocusTrap. Expected: String. Recieved: ".concat(type, ".");
    },
    NO_MATCHER_LENGTH_ERROR: "Invalid value given to options.matchers for createFocusTrap; value must be an array with at least one selector string"
  };

  var queryAll = function queryAll(selector) {
    var parent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;
    return Array.apply(null, parent.querySelectorAll(selector));
  };
  var getFocusableElements = function getFocusableElements(selectorString) {
    var matchers = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Selectors.FOCUSABLE_TAGS;
    var focusables = matchers.map(function (selector) {
      return "".concat(selectorString, " ").concat(selector).concat(Selectors.NOT_VISUALLY_HIDDEN_CLASS);
    }).join(", ");
    return queryAll(focusables);
  };

  var isBrowserEnv = typeof window !== "undefined";

  var isString = function isString(value) {
    return typeof value === "string";
  };

  var isFunction = function isFunction(value) {
    return typeof value === "function";
  };

  var ComponentEngine = {
    start: function start() {
      var metadata = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      if (!isBrowserEnv) return;
      var id = metadata.id,
          attribute = metadata.attribute,
          thisArg = metadata.thisArg;

      if (id && isString(id)) {
        var instance = document.querySelector("[".concat(attribute, "='").concat(id, "']"));
        if (!instance) return;
        var validComponent = [instance].filter(thisArg._validate)[0];
        if (!validComponent) return;

        thisArg._components.push(validComponent);
      } else if (!id && !thisArg._components.length) {
        var instances = queryAll("[".concat(attribute, "]"));
        if (!instances.length) return;
        var validComponents = instances.filter(thisArg._validate);
        thisArg._components = thisArg._components.concat(validComponents);
      }
    },
    stop: function stop() {
      var metadata = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      if (!isBrowserEnv) return;
      var id = metadata.id,
          attribute = metadata.attribute,
          thisArg = metadata.thisArg,
          activeNodeKey = metadata.activeNodeKey,
          cancelActiveFn = metadata.cancelActiveFn;

      if (id && isString(id)) {
        var targetIndex;

        var instance = thisArg._components.filter(function (activeInstance, index) {
          if (activeInstance.getAttribute(attribute) !== id) return false;
          targetIndex = index;
          return true;
        })[0];

        if (!instance) return;
        if (thisArg[activeNodeKey] && instance === thisArg[activeNodeKey] && isFunction(cancelActiveFn)) thisArg[cancelActiveFn]();

        thisArg._teardown(instance);

        thisArg._components.splice(targetIndex, 1);
      } else if (!id && thisArg._components.length) {
        if (thisArg[activeNodeKey] && isFunction(cancelActiveFn)) thisArg[cancelActiveFn]();

        thisArg._components.forEach(thisArg._teardown);

        thisArg._components = [];
      }
    }
  };

  var createFocusRing = function createFocusRing() {
    if (!isBrowserEnv) return;
    var listeningForKeydown;

    var listenForKeyboard = function listenForKeyboard() {
      document.body.classList.add(Selectors.KEYBOARD_CLASS);
      document.removeEventListener(Events.KEYDOWN, listenForKeyboard);
      document.addEventListener(Events.CLICK, listenForClick);
      listeningForKeydown = false;
    };

    var listenForClick = function listenForClick() {
      document.body.classList.remove(Selectors.KEYBOARD_CLASS);
      document.removeEventListener(Events.CLICK, listenForClick);
      document.addEventListener(Events.KEYDOWN, listenForKeyboard);
      listeningForKeydown = true;
    };

    return {
      start: function start() {
        document.addEventListener(Events.KEYDOWN, listenForKeyboard);
      },
      stop: function stop() {
        if (listeningForKeydown) {
          document.removeEventListener(Events.KEYDOWN, listenForKeyboard);
        } else {
          document.body.classList.remove(Selectors.KEYBOARD_CLASS);
          document.removeEventListener(Events.CLICK, listenForClick);
        }
      }
    };
  };

  var log = function log(message) {
    var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "error";
    return console[type](message);
  };

  var createFocusTrap = function createFocusTrap(selectorString) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    if (!isBrowserEnv) return;
    var useArrows = options.useArrows,
        children = options.children,
        _options$matchers = options.matchers,
        matchers = _options$matchers === void 0 ? Selectors.FOCUSABLE_TAGS : _options$matchers;

    if (!selectorString && !children.length) {
      log(Messages.NO_SELECTOR_STRING_OR_CHILDREN_ERROR);
      return;
    }

    if (!Array.isArray(matchers)) {
      log(Messages.OPTION_MATCHERS_DATA_TYPE_ERROR);
      return;
    } else if (matchers.length) {
      var hasBadMatcher = false;
      matchers.forEach(function (matcher) {
        var type = _typeof(matcher);

        if (type !== "string") {
          log(Messages.INCORRECT_MATCHER_TYPE_ERROR(type));
          hasBadMatcher = true;
        }
      });
      if (hasBadMatcher) return;
    } else if (!matchers.length) {
      log(Messages.NO_MATCHER_LENGTH_ERROR);
      return;
    }

    var focusableChildren = children && children.length ? children : getFocusableElements(selectorString, matchers);
    var focusableFirstChild = focusableChildren[0];
    var focusableLastChild = focusableChildren[focusableChildren.length - 1];

    var handleFocusTrapWithTab = function handleFocusTrapWithTab(event) {
      var containerElement = document.querySelector(selectorString);
      var containerActive = document.activeElement === containerElement;
      var firstActive = document.activeElement === focusableFirstChild;
      var lastActive = document.activeElement === focusableLastChild;
      if (!containerActive && !firstActive && !lastActive) return;
      var tabKey = event.which === KeyCodes.TAB;
      var shiftKey = event.which === KeyCodes.SHIFT || event.shiftKey;
      var hasShift = shiftKey && tabKey;
      var noShift = !shiftKey && tabKey;

      if (hasShift && (firstActive || containerActive)) {
        event.preventDefault();
        focusableLastChild.focus();
      } else if (noShift && lastActive) {
        event.preventDefault();
        focusableFirstChild.focus();
      }
    };

    var focusNextChild = function focusNextChild() {
      for (var i = 0; i < focusableChildren.length; i++) {
        if (focusableChildren[i] === document.activeElement) {
          focusableChildren[i + 1].focus();
          break;
        }
      }
    };

    var focusLastChild = function focusLastChild() {
      for (var i = 0; i < focusableChildren.length; i++) {
        if (focusableChildren[i] === document.activeElement) {
          focusableChildren[i - 1].focus();
          break;
        }
      }
    };

    var handleFocusTrapWithArrows = function handleFocusTrapWithArrows(event) {
      var firstActive = document.activeElement === focusableFirstChild;
      var lastActive = document.activeElement === focusableLastChild;
      var arrowUp = event.which === KeyCodes.ARROW_UP;
      var arrowDown = event.which === KeyCodes.ARROW_DOWN;

      if (arrowUp || arrowDown) {
        event.preventDefault();

        if (firstActive && arrowUp) {
          focusableLastChild.focus();
        } else if (lastActive && arrowDown) {
          focusableFirstChild.focus();
        } else if (arrowDown) {
          focusNextChild();
        } else if (arrowUp) {
          focusLastChild();
        }
      }
    };

    return {
      start: function start() {
        if (useArrows) {
          document.addEventListener(Events.KEYDOWN, handleFocusTrapWithArrows);
        } else {
          document.addEventListener(Events.KEYDOWN, handleFocusTrapWithTab);
        }
      },
      stop: function stop() {
        if (useArrows) {
          document.removeEventListener(Events.KEYDOWN, handleFocusTrapWithArrows);
        } else {
          document.removeEventListener(Events.KEYDOWN, handleFocusTrapWithTab);
        }
      }
    };
  };

  var focusOnce = function focusOnce(element) {
    var handleBlur = function handleBlur(_ref) {
      var target = _ref.target;
      target.removeAttribute(Selectors.TABINDEX);
      target.removeEventListener(Events.BLUR, handleBlur);
    };

    element.setAttribute(Selectors.TABINDEX, "-1");
    element.focus();
    element.addEventListener(Events.BLUR, handleBlur);
  };

  var isiOSMobile = isBrowserEnv ? /(iphone|ipod|ipad)/i.test(navigator.userAgent) : false;

  function throttle(callback, limit) {
    var timeout = false;

    function clear() {
      timeout = false;
    }

    return function () {
      if (timeout) return;
      callback.apply(this, arguments);
      timeout = true;
      setTimeout(clear, limit);
    };
  }

  var Selectors$1 = {
    DATA_COLLAPSIBLE: "data-collapsible",
    DATA_VISIBLE: "data-visible",
    DATA_TARGET: "data-target",
    DATA_PARENT: "data-parent",
    ARIA_EXPANDED: "aria-expanded",
    ARIA_CONTROLS: "aria-controls",
    ARIA_HIDDEN: "aria-hidden",
    ARIA_LABELLEDBY: "aria-labelledby",
    TABINDEX: "tabindex",
    IS_READY_CLASS: "is-ready",
    IS_VISIBLE_CLASS: "is-visible"
  };
  var CssProperties = {
    HEIGHT: "height",
    VISIBILITY: "visibility"
  };
  var CssValues = {
    AUTO: "auto",
    HIDDEN: "hidden",
    VISIBLE: "visible"
  };
  var Events$1 = {
    CLICK: "click",
    TRANSITIONEND: "transitionend"
  };
  var Messages$1 = {
    NO_COLLAPSIBLE_ID_ERROR: "Could not initialize collapsible; you must include a value for the 'data-collapsible' attribute.",
    NO_TRIGGER_ERROR: function NO_TRIGGER_ERROR(id) {
      return "Could not find collapsible trigger with [data-target='".concat(id, "']; you can't have a collapsible without a trigger.");
    },
    NO_TRIGGER_ID_ERROR: function NO_TRIGGER_ID_ERROR(id) {
      return "Could not find id on collapsible trigger with [data-target='".concat(id, "'].");
    },
    NO_CONTENT_ERROR: function NO_CONTENT_ERROR(id) {
      return "Could not find collapsible content with id '".concat(id, "'; you can't have a collapsible without content.");
    }
  };

  var Collapsible = function () {
    function Collapsible() {
      _classCallCheck(this, Collapsible);

      this._handleClick = throttle(this._handleClick.bind(this), 500);
      this._handleExpandTransition = this._handleExpandTransition.bind(this);
      this._validate = this._validate.bind(this);
      this._teardown = this._teardown.bind(this);
      this._components = [];
      this._activeCollapsible = {};
      this._activeTrigger = {};
      this._activeContent = {};
      this._activeId = "";
      this._nextAriaExpandedState = "";
      this._nextAriaHiddenState = "";
    }

    _createClass(Collapsible, [{
      key: "start",
      value: function start(id) {
        ComponentEngine.start({
          id: id,
          attribute: Selectors$1.DATA_COLLAPSIBLE,
          thisArg: this
        });
      }
    }, {
      key: "stop",
      value: function stop(id) {
        ComponentEngine.stop({
          id: id,
          attribute: Selectors$1.DATA_COLLAPSIBLE,
          thisArg: this,
          activeNodeKey: "_activeCollapsible"
        });
      }
    }, {
      key: "_validate",
      value: function _validate(instance) {
        var _this$_getCollapsible = this._getCollapsibleData(instance),
            trigger = _this$_getCollapsible.trigger,
            id = _this$_getCollapsible.id;

        if (!id) {
          log(Messages$1.NO_COLLAPSIBLE_ID_ERROR);
          return false;
        }

        if (!trigger) {
          log(Messages$1.NO_TRIGGER_ERROR(id));
          return false;
        }

        if (!trigger.id) {
          log(Messages$1.NO_TRIGGER_ID_ERROR(id));
          return false;
        }

        var contentId = "#".concat(id);
        var content = instance.querySelector(contentId);

        if (!content) {
          log(Messages$1.NO_CONTENT_ERROR(id));
          return false;
        }

        trigger.setAttribute(Selectors$1.ARIA_CONTROLS, id);
        content.setAttribute(Selectors$1.ARIA_LABELLEDBY, trigger.id);
        var contentIsVisible = instance.getAttribute(Selectors$1.DATA_VISIBLE) === "true";

        if (contentIsVisible) {
          instance.setAttribute(Selectors$1.DATA_VISIBLE, "true");
          trigger.setAttribute(Selectors$1.ARIA_EXPANDED, "true");
          content.setAttribute(Selectors$1.ARIA_HIDDEN, "false");
          content.style[CssProperties.HEIGHT] = "".concat(content.scrollHeight, "px");
          content.classList.add(Selectors$1.IS_VISIBLE_CLASS);
        } else {
          instance.setAttribute(Selectors$1.DATA_VISIBLE, "false");
          trigger.setAttribute(Selectors$1.ARIA_EXPANDED, "false");
          content.setAttribute(Selectors$1.ARIA_HIDDEN, "true");
        }

        requestAnimationFrame(function () {
          trigger.classList.add(Selectors$1.IS_READY_CLASS);
          content.classList.add(Selectors$1.IS_READY_CLASS);
        });
        trigger.addEventListener(Events$1.CLICK, this._handleClick);
        return true;
      }
    }, {
      key: "_teardown",
      value: function _teardown(instance) {
        var _this$_getCollapsible2 = this._getCollapsibleData(instance),
            trigger = _this$_getCollapsible2.trigger;

        trigger.removeEventListener(Events$1.CLICK, this._handleClick);
      }
    }, {
      key: "_handleClick",
      value: function _handleClick(event) {
        event.preventDefault();
        this._activeTrigger = event.target;

        this._setIds();

        this._setActiveCollapsible();

        this._setActiveContent();

        this._setNextVisibleState();

        this._toggleCollapsible();

        this._activeCollapsible = null;
      }
    }, {
      key: "_handleExpandTransition",
      value: function _handleExpandTransition() {
        this._activeContent.style[CssProperties.HEIGHT] = CssValues.AUTO;

        this._activeContent.removeEventListener(Events$1.TRANSITIONEND, this._handleExpandTransition);
      }
    }, {
      key: "_toggleCollapsible",
      value: function _toggleCollapsible() {
        this._activeCollapsible.setAttribute(Selectors$1.DATA_VISIBLE, this._nextAriaExpandedState);

        this._activeTrigger.setAttribute(Selectors$1.ARIA_EXPANDED, this._nextAriaExpandedState);

        this._activeContent.setAttribute(Selectors$1.ARIA_HIDDEN, this._nextAriaHiddenState);

        var fullHeightValue = "".concat(this._activeContent.scrollHeight, "px");

        if (this._activeCollapsible.getAttribute(Selectors$1.DATA_VISIBLE) === "false") {
          return this._collapsePanel(fullHeightValue);
        }

        this._expandPanel(fullHeightValue);
      }
    }, {
      key: "_expandPanel",
      value: function _expandPanel(height) {
        this._activeContent.style[CssProperties.HEIGHT] = height;

        this._activeContent.classList.add(Selectors$1.IS_VISIBLE_CLASS);

        this._activeContent.addEventListener(Events$1.TRANSITIONEND, this._handleExpandTransition);
      }
    }, {
      key: "_collapsePanel",
      value: function _collapsePanel(height) {
        var _this = this;

        return requestAnimationFrame(function () {
          _this._activeContent.style[CssProperties.HEIGHT] = height;
          requestAnimationFrame(function () {
            _this._activeContent.style[CssProperties.HEIGHT] = null;

            _this._activeContent.classList.remove(Selectors$1.IS_VISIBLE_CLASS);
          });
        });
      }
    }, {
      key: "_getCollapsibleData",
      value: function _getCollapsibleData(instance) {
        var id = instance.getAttribute(Selectors$1.DATA_COLLAPSIBLE);
        var trigger = instance.querySelector("[".concat(Selectors$1.DATA_TARGET, "='").concat(id, "']"));
        return {
          id: id,
          trigger: trigger
        };
      }
    }, {
      key: "_setActiveContent",
      value: function _setActiveContent() {
        this._activeContent = this._activeCollapsible.querySelector("#".concat(this._activeId));
      }
    }, {
      key: "_setNextVisibleState",
      value: function _setNextVisibleState() {
        var currentVisibleState = this._activeCollapsible.getAttribute(Selectors$1.DATA_VISIBLE);

        this._nextAriaExpandedState = currentVisibleState === "true" ? "false" : "true";
        this._nextAriaHiddenState = currentVisibleState === "false" ? "false" : "true";
      }
    }, {
      key: "_setIds",
      value: function _setIds() {
        this._activeId = this._activeTrigger.getAttribute(Selectors$1.DATA_TARGET);
      }
    }, {
      key: "_setActiveCollapsible",
      value: function _setActiveCollapsible() {
        this._activeCollapsible = document.querySelector("[".concat(Selectors$1.DATA_COLLAPSIBLE, "='").concat(this._activeId, "']"));
      }
    }]);

    return Collapsible;
  }();

  var KeyCodes$1 = {
    TAB: 9,
    SHIFT: 16,
    ESCAPE: 27,
    ARROW_UP: 38,
    ARROW_DOWN: 40
  };
  var Selectors$2 = {
    DATA_DROPDOWN: "data-dropdown",
    DROPDOWN_MENU_CLASS: "dropdown-menu",
    DATA_TARGET: "data-target",
    DATA_PARENT: "data-parent",
    DATA_VISIBLE: "data-visible",
    TABINDEX: "tabindex",
    ARIA_HASPOPUP: "aria-haspopup",
    ARIA_CONTROLS: "aria-controls",
    ARIA_LABELLEDBY: "aria-labelledby",
    ARIA_EXPANDED: "aria-expanded",
    OVERLAY_OPEN: "overlay-open"
  };
  var Events$2 = {
    KEYDOWN: "keydown",
    CLICK: "click",
    BLUR: "blur"
  };
  var Messages$2 = {
    NO_DROPDOWN_ID_ERROR: "Could not setup dropdown. Make sure it has a valid [data-dropdown] attribute with a unique id as its value.",
    NO_MENU_ERROR: function NO_MENU_ERROR(attr) {
      return "Could not find menu associated with ".concat(attr, ".");
    },
    NO_DROPDOWN_ITEMS_ERROR: function NO_DROPDOWN_ITEMS_ERROR(attr) {
      return "Could not find any list items associated with ".concat(attr, ".");
    },
    NO_DROPDOWN_ACTIONS_ERROR: function NO_DROPDOWN_ACTIONS_ERROR(attr) {
      return "Could not find any button or anchor elements associated with ".concat(attr, ".");
    },
    NO_PARENT_ERROR: "Could not find dropdown button's [data-parent] attribute."
  };

  var Dropdown = function () {
    function Dropdown() {
      _classCallCheck(this, Dropdown);

      this._handleClick = this._handleClick.bind(this);
      this._handleFirstTabClose = this._handleFirstTabClose.bind(this);
      this._handleLastTabClose = this._handleLastTabClose.bind(this);
      this._handleArrowKeyPress = this._handleArrowKeyPress.bind(this);
      this._handleClose = this._handleClose.bind(this);
      this._handleEscapeKeyPress = this._handleEscapeKeyPress.bind(this);
      this._handleOffMenuClick = this._handleOffMenuClick.bind(this);
      this._validate = this._validate.bind(this);
      this._teardown = this._teardown.bind(this);
      this._components = [];
      this._activeDropdownId = "";
      this._activeDropdownAttr = "";
      this._activeDropdownMenuId = "";
      this._activeDropdown = null;
      this._activeTrigger = null;
      this._activeDropdownMenu = null;
      this._firstDropdownAction = null;
      this._lastDropdownAction = null;
      this._focusTrap = null;
      this._activeDropdownActions = [];
      this._allowFocusReturn = true;
      this._dropdownContainerAttr = "[".concat(Selectors$2.DATA_DROPDOWN, "]");
      this._dropdownTargetAttr = "[".concat(Selectors$2.DATA_TARGET, "]");
      this._dropdownMenuClassName = ".".concat(Selectors$2.DROPDOWN_MENU_CLASS);
    }

    _createClass(Dropdown, [{
      key: "start",
      value: function start(id) {
        ComponentEngine.start({
          id: id,
          attribute: Selectors$2.DATA_DROPDOWN,
          thisArg: this
        });
      }
    }, {
      key: "stop",
      value: function stop(id) {
        ComponentEngine.stop({
          id: id,
          attribute: Selectors$2.DATA_DROPDOWN,
          thisArg: this,
          activeNodeKey: "_activeDropdown",
          cancelActiveFn: "_closeActiveDropdown"
        });
      }
    }, {
      key: "_validate",
      value: function _validate(instance) {
        var dropdownId = instance.getAttribute(Selectors$2.DATA_DROPDOWN);

        if (!dropdownId) {
          log(Messages$2.NO_DROPDOWN_ID_ERROR);
          return false;
        }

        var dropdownAttr = "[".concat(Selectors$2.DATA_DROPDOWN, "=\"").concat(dropdownId, "\"]");
        var dropdown = document.querySelector("[".concat(Selectors$2.DATA_DROPDOWN, "=\"").concat(dropdownId, "\"]"));
        var dropdownTrigger = dropdown.querySelector("[".concat(Selectors$2.DATA_TARGET, "]"));

        if (!dropdownTrigger.getAttribute(Selectors$2.DATA_PARENT)) {
          log(Messages$2.NO_PARENT_ERROR);
          return false;
        }

        var dropdownMenuId = dropdownTrigger.getAttribute(Selectors$2.DATA_TARGET);
        var dropdownMenu = dropdown.querySelector("#".concat(dropdownMenuId));

        if (!dropdownMenu) {
          log(Messages$2.NO_MENU_ERROR(dropdownAttr));
          return false;
        }

        dropdownMenu.setAttribute(Selectors$2.ARIA_LABELLEDBY, dropdownTrigger.id);
        dropdownTrigger.setAttribute(Selectors$2.ARIA_CONTROLS, dropdownMenuId);
        dropdownTrigger.setAttribute(Selectors$2.ARIA_HASPOPUP, "true");
        dropdownTrigger.setAttribute(Selectors$2.ARIA_EXPANDED, "false");
        var dropdownMenuListItems = dropdown.querySelectorAll("#".concat(dropdownMenuId, " > li"));

        if (!dropdownMenuListItems.length) {
          log(Messages$2.NO_DROPDOWN_ITEMS_ERROR(dropdownAttr));
          return false;
        }

        var dropdownMenuActions = this._getDropdownActions(dropdownAttr, "#".concat(dropdownMenuId));

        if (!dropdownMenuActions.length) {
          log(Messages$2.NO_DROPDOWN_ACTIONS_ERROR(dropdownAttr));
          return false;
        }

        dropdownMenuActions.forEach(function (trigger) {
          trigger.setAttribute(Selectors$2.TABINDEX, "-1");
        });
        dropdownTrigger.addEventListener(Events$2.CLICK, this._handleClick);
        dropdownTrigger.addEventListener(Events$2.KEYDOWN, this._handleArrowKeyPress);
        return true;
      }
    }, {
      key: "_teardown",
      value: function _teardown(instance) {
        var id = instance.getAttribute(Selectors$2.DATA_DROPDOWN);
        var trigger = instance.querySelector("[".concat(Selectors$2.DATA_PARENT, "='").concat(id, "']"));
        trigger.removeEventListener(Events$2.CLICK, this._handleClick);
        trigger.removeEventListener(Events$2.KEYDOWN, this._handleArrowKeyPress);
      }
    }, {
      key: "_handleClick",
      value: function _handleClick(event, key) {
        event.preventDefault();
        event.stopPropagation();

        this._closeOpenDropdowns(event);

        this._activeTrigger = event.target;

        this._setActiveDropdownId();

        this._setActiveDropdown();

        this._setActiveDropdownMenu();

        this._setVisibleState();

        this._startActiveDropdownEvents();

        if (key && key === KeyCodes$1.ARROW_UP) {
          this._lastDropdownAction.focus();
        } else {
          this._firstDropdownAction.focus();
        }

        if (isiOSMobile) document.body.classList.add(Selectors$2.OVERLAY_OPEN);
      }
    }, {
      key: "_handleClose",
      value: function _handleClose() {
        if (this._allowFocusReturn) this._handleReturnFocus();

        this._closeActiveDropdown();
      }
    }, {
      key: "_closeActiveDropdown",
      value: function _closeActiveDropdown() {
        var _this = this;

        if (isiOSMobile) document.body.classList.remove(Selectors$2.OVERLAY_OPEN);

        this._activeDropdown.setAttribute(Selectors$2.DATA_VISIBLE, "false");

        this._activeTrigger.setAttribute(Selectors$2.ARIA_EXPANDED, "false");

        this._activeTrigger.removeEventListener(Events$2.CLICK, this._handleClose);

        this._activeTrigger.addEventListener(Events$2.CLICK, this._handleClick);

        document.removeEventListener(Events$2.KEYDOWN, this._handleEscapeKeyPress);
        document.removeEventListener(Events$2.CLICK, this._handleOffMenuClick);

        this._firstDropdownAction.removeEventListener(Events$2.KEYDOWN, this._handleFirstTabClose);

        this._lastDropdownAction.removeEventListener(Events$2.KEYDOWN, this._handleLastTabClose);

        this._activeDropdownActions.forEach(function (action) {
          action.setAttribute(Selectors$2.TABINDEX, "-1");
          action.removeEventListener(Events$2.CLICK, _this._handleClose);
        });

        this._focusTrap.stop();

        this._focusTrap = null;

        this._resetProperties();
      }
    }, {
      key: "_resetProperties",
      value: function _resetProperties() {
        this._activeDropdownId = "";
        this._activeDropdownAttr = "";
        this._activeDropdownMenuId = "";
        this._activeDropdown = null;
        this._activeTrigger = null;
        this._activeDropdownMenu = null;
        this._firstDropdownAction = null;
        this._lastDropdownAction = null;
        this._focusTrap = null;
        this._activeDropdownActions = [];
        this._allowFocusReturn = true;
      }
    }, {
      key: "_setActiveDropdownId",
      value: function _setActiveDropdownId() {
        this._activeDropdownId = this._activeTrigger.getAttribute(Selectors$2.DATA_PARENT);
      }
    }, {
      key: "_startActiveDropdownEvents",
      value: function _startActiveDropdownEvents() {
        var _this2 = this;

        this._activeTrigger.removeEventListener(Events$2.CLICK, this._handleClick);

        this._activeTrigger.addEventListener(Events$2.CLICK, this._handleClose);

        document.addEventListener(Events$2.KEYDOWN, this._handleEscapeKeyPress);
        document.addEventListener(Events$2.CLICK, this._handleOffMenuClick);
        this._activeDropdownActions = this._getDropdownActions(this._activeDropdownAttr, "#".concat(this._activeDropdownMenuId));
        this._firstDropdownAction = this._activeDropdownActions[0];
        this._lastDropdownAction = this._activeDropdownActions[this._activeDropdownActions.length - 1];

        this._firstDropdownAction.addEventListener(Events$2.KEYDOWN, this._handleFirstTabClose);

        this._lastDropdownAction.addEventListener(Events$2.KEYDOWN, this._handleLastTabClose);

        this._activeDropdownActions.forEach(function (action) {
          action.setAttribute(Selectors$2.TABINDEX, "0");
          action.addEventListener(Events$2.CLICK, _this2._handleClose);
        });

        var containerSelector = "".concat(this._activeDropdownAttr, " > ").concat(this._dropdownMenuClassName);

        if (this._focusTrap) {
          this._focusTrap.stop();
        }

        this._focusTrap = createFocusTrap(containerSelector, {
          useArrows: true
        });

        this._focusTrap.start();
      }
    }, {
      key: "_setVisibleState",
      value: function _setVisibleState() {
        this._activeTrigger.setAttribute(Selectors$2.ARIA_EXPANDED, "true");

        this._activeDropdown.setAttribute(Selectors$2.DATA_VISIBLE, "true");
      }
    }, {
      key: "_setActiveDropdownMenu",
      value: function _setActiveDropdownMenu() {
        this._activeDropdownMenuId = this._activeTrigger.getAttribute(Selectors$2.DATA_TARGET);
        this._activeDropdownMenu = this._activeDropdown.querySelector("#".concat(this._activeDropdownMenuId));
      }
    }, {
      key: "_setActiveDropdown",
      value: function _setActiveDropdown() {
        this._activeDropdownAttr = "[".concat(Selectors$2.DATA_DROPDOWN, "=\"").concat(this._activeDropdownId, "\"]");
        this._activeDropdown = document.querySelector(this._activeDropdownAttr);
      }
    }, {
      key: "_closeOpenDropdowns",
      value: function _closeOpenDropdowns(event) {
        if (!this._activeTrigger) return;
        this._allowFocusReturn = false;

        this._handleClose(event);

        this._allowFocusReturn = true;
      }
    }, {
      key: "_handleFirstTabClose",
      value: function _handleFirstTabClose(event) {
        var shiftKey = event.which === KeyCodes$1.SHIFT || event.shiftKey;
        var tabKey = event.which === KeyCodes$1.TAB;

        if (shiftKey && tabKey) {
          this._handleClose(event);
        }
      }
    }, {
      key: "_handleLastTabClose",
      value: function _handleLastTabClose(event) {
        var shiftKey = event.which === KeyCodes$1.SHIFT || event.shiftKey;
        var tabKey = event.which === KeyCodes$1.TAB;

        if (tabKey && !shiftKey) {
          this._handleClose(event);
        }
      }
    }, {
      key: "_handleArrowKeyPress",
      value: function _handleArrowKeyPress(event) {
        if (event.which === KeyCodes$1.ARROW_UP || event.which === KeyCodes$1.ARROW_DOWN) {
          this._handleClick(event, event.which);
        }
      }
    }, {
      key: "_handleEscapeKeyPress",
      value: function _handleEscapeKeyPress(event) {
        if (event.which === KeyCodes$1.ESCAPE) {
          this._handleClose(event);
        }
      }
    }, {
      key: "_handleOffMenuClick",
      value: function _handleOffMenuClick(event) {
        if (event.target !== this._activeTrigger && event.target !== this._activeDropdownMenu) {
          this._handleClose(event);
        }
      }
    }, {
      key: "_handleReturnFocus",
      value: function _handleReturnFocus() {
        if (!this._activeTrigger) return;
        focusOnce(this._activeTrigger);
      }
    }, {
      key: "_getDropdownActions",
      value: function _getDropdownActions(dropdownAttr, menuId) {
        return queryAll("".concat(dropdownAttr, " > ").concat(menuId, " > li > a, ").concat(dropdownAttr, " > ").concat(menuId, " > li > button"));
      }
    }]);

    return Dropdown;
  }();

  var KeyCodes$2 = {
    ESCAPE: 27
  };
  var Selectors$3 = {
    DATA_MODAL: "data-modal",
    DATA_TARGET: "data-target",
    DATA_VISIBLE: "data-visible",
    DATA_CLOSE: "data-close",
    DATA_PARENT: "data-parent",
    ARIA_HIDDEN: "aria-hidden",
    ARIA_MODAL: "aria-modal",
    ROLE: "role",
    TABINDEX: "tabindex",
    NO_SCROLL_CLASS: "no-scroll",
    IS_VISIBLE_CLASS: "is-visible",
    OVERLAY_OPEN: "overlay-open"
  };
  var CssProperties$1 = {
    PADDING_RIGHT: "paddingRight",
    PADDING_LEFT: "paddingLeft"
  };
  var Events$3 = {
    KEYDOWN: "keydown",
    CLICK: "click",
    RESIZE: "resize",
    BLUR: "blur",
    TRANSITIONEND: "transitionend"
  };
  var Messages$3 = {
    NO_TRIGGER_ERROR: function NO_TRIGGER_ERROR(id) {
      return "Could not find modal trigger with id ".concat(id, ".");
    },
    NO_ID_ERROR: "Could not detect an id on your [data-modal] element. " + "Please add a value matching the modal trigger's [data-parent] attribute.",
    NO_MODAL_DIALOG_ERROR: function NO_MODAL_DIALOG_ERROR(id) {
      return "Could not find element with attribute [data-parent='".concat(id, "'].");
    }
  };

  var COMPONENT_ROLE = "dialog";

  var Modal = function () {
    function Modal() {
      _classCallCheck(this, Modal);

      this._handleClick = this._handleClick.bind(this);
      this._handleOpenTransition = this._handleOpenTransition.bind(this);
      this._handleCloseTransition = this._handleCloseTransition.bind(this);
      this._handleClose = this._handleClose.bind(this);
      this._handleOverlayClick = this._handleOverlayClick.bind(this);
      this._handleEscapeKeyPress = this._handleEscapeKeyPress.bind(this);
      this._validate = this._validate.bind(this);
      this._teardown = this._teardown.bind(this);
      this._components = [];
      this._activeModalTrigger = null;
      this._activeModalAttr = "";
      this._activeModal = null;
      this._activeModalContent = null;
      this._activeModalId = "";
      this._activeModalContentSelector = "";
      this._activeModalCloseTriggers = [];
      this._originalPagePadding = "";
      this._scrollbarOffset = null;
      this._focusTrap = null;
    }

    _createClass(Modal, [{
      key: "start",
      value: function start(id) {
        ComponentEngine.start({
          id: id,
          attribute: Selectors$3.DATA_MODAL,
          thisArg: this
        });
      }
    }, {
      key: "stop",
      value: function stop(id) {
        ComponentEngine.stop({
          id: id,
          attribute: Selectors$3.DATA_MODAL,
          thisArg: this,
          activeNodeKey: "_activeModal",
          cancelActiveFn: "_closeActiveModal"
        });
      }
    }, {
      key: "_validate",
      value: function _validate(instance) {
        var id = instance.getAttribute(Selectors$3.DATA_MODAL);

        if (!id) {
          log(Messages$3.NO_ID_ERROR);
          return false;
        }

        var modal = document.querySelector("[".concat(Selectors$3.DATA_MODAL, "='").concat(id, "']"));
        var modalContent = instance.querySelector("[".concat(Selectors$3.DATA_PARENT, "='").concat(id, "']"));

        if (!modalContent) {
          log(Messages$3.NO_MODAL_DIALOG_ERROR(id));
          return false;
        }

        modal.setAttribute(Selectors$3.ARIA_HIDDEN, "true");
        modal.setAttribute(Selectors$3.DATA_VISIBLE, "false");
        modalContent.setAttribute(Selectors$3.ARIA_MODAL, "true");
        modalContent.setAttribute(Selectors$3.ROLE, COMPONENT_ROLE);
        var trigger = document.querySelector("[".concat(Selectors$3.DATA_TARGET, "='").concat(id, "']"));

        if (!trigger) {
          log(Messages$3.NO_TRIGGER_ERROR(id));
          return false;
        }

        trigger.addEventListener(Events$3.CLICK, this._handleClick);
        return true;
      }
    }, {
      key: "_teardown",
      value: function _teardown(instance) {
        var id = instance.getAttribute(Selectors$3.DATA_MODAL);
        var trigger = document.querySelector("[".concat(Selectors$3.DATA_TARGET, "='").concat(id, "']"));
        trigger.removeEventListener(Events$3.CLICK, this._handleClick);
      }
    }, {
      key: "_handleClick",
      value: function _handleClick(event) {
        event.preventDefault();
        this._activeModalTrigger = event.target;

        this._setActiveId();

        this._setActiveModal();

        this._setActiveModalContent();

        this._setScrollbarOffset();

        this._setScrollStop();

        this._focusTrap = createFocusTrap(this._activeModalContentSelector);

        this._focusTrap.start();

        this._toggleVisibility(true);

        this._setFocusableChildren();

        this._setCloseTriggers();

        this._startEvents();
      }
    }, {
      key: "_handleClose",
      value: function _handleClose(event) {
        event.preventDefault();

        this._closeActiveModal();
      }
    }, {
      key: "_closeActiveModal",
      value: function _closeActiveModal() {
        var _this = this;

        this._toggleVisibility(false);

        this._focusTrigger();

        this._unsetScrollStop();

        this._unsetScrollbarOffset();

        document.removeEventListener(Events$3.KEYDOWN, this._handleEscapeKeyPress);
        document.removeEventListener(Events$3.CLICK, this._handleOverlayClick);

        this._activeModalCloseTriggers.forEach(function (trigger) {
          trigger.removeEventListener(Events$3.CLICK, _this._handleClose);
        });

        this._focusTrap.stop();

        this._resetProperties();
      }
    }, {
      key: "_resetProperties",
      value: function _resetProperties() {
        this._activeModal = null;
        this._activeModalTrigger = null;
        this._activeModalContent = null;
        this._activeModalId = "";
        this._activeModalContentSelector = "";
        this._activeModalCloseTriggers = [];
        this._originalPagePadding = "";
        this._scrollbarOffset = null;
        this._focusTrap = null;
      }
    }, {
      key: "_setFocusableChildren",
      value: function _setFocusableChildren() {
        var elements = getFocusableElements(this._activeModalContentSelector);
        if (!elements.length) return;
        elements.forEach(function (element) {
          return element.setAttribute(Selectors$3.TABINDEX, "0");
        });
      }
    }, {
      key: "_setCloseTriggers",
      value: function _setCloseTriggers() {
        this._activeModalCloseTriggers = queryAll("".concat(this._activeModalContentSelector, " [").concat(Selectors$3.DATA_CLOSE, "]"));
      }
    }, {
      key: "_setActiveId",
      value: function _setActiveId() {
        this._activeModalId = this._activeModalTrigger.getAttribute(Selectors$3.DATA_TARGET);
      }
    }, {
      key: "_setActiveModal",
      value: function _setActiveModal() {
        this._activeModalAttr = "[".concat(Selectors$3.DATA_MODAL, "='").concat(this._activeModalId, "']");
        this._activeModal = document.querySelector("[".concat(Selectors$3.DATA_MODAL, "='").concat(this._activeModalId, "']"));
      }
    }, {
      key: "_setActiveModalContent",
      value: function _setActiveModalContent() {
        this._activeModalContentSelector = "[".concat(Selectors$3.DATA_PARENT, "='").concat(this._activeModalId, "']");
        this._activeModalContent = this._activeModal.querySelector(this._activeModalContentSelector);
      }
    }, {
      key: "_handleOpenTransition",
      value: function _handleOpenTransition() {
        this._activeModal.removeEventListener(Events$3.TRANSITIONEND, this._handleOpenTransition);

        this._focusContent();

        this._activeModal.scrollTop = 0;
      }
    }, {
      key: "_handleCloseTransition",
      value: function _handleCloseTransition() {
        this._modalCache.style[CssProperties$1.PADDING_LEFT] = "";

        this._modalCache.removeEventListener(Events$3.TRANSITIONEND, this._handleCloseTransition);

        this._modalCache = null;
      }
    }, {
      key: "_toggleVisibility",
      value: function _toggleVisibility(isVisible) {
        this._activeModal.setAttribute(Selectors$3.ARIA_HIDDEN, isVisible ? "false" : "true");

        this._activeModal.setAttribute(Selectors$3.DATA_VISIBLE, isVisible ? "true" : "false");

        if (isVisible) {
          this._activeModal.classList.add(Selectors$3.IS_VISIBLE_CLASS);

          this._activeModal.addEventListener(Events$3.TRANSITIONEND, this._handleOpenTransition);
        } else {
          this._modalCache = this._activeModal;

          this._activeModal.classList.remove(Selectors$3.IS_VISIBLE_CLASS);

          this._activeModal.addEventListener(Events$3.TRANSITIONEND, this._handleCloseTransition);
        }
      }
    }, {
      key: "_startEvents",
      value: function _startEvents() {
        var _this2 = this;

        document.addEventListener(Events$3.KEYDOWN, this._handleEscapeKeyPress);
        document.addEventListener(Events$3.CLICK, this._handleOverlayClick);

        this._activeModalCloseTriggers.forEach(function (trigger) {
          trigger.addEventListener(Events$3.CLICK, _this2._handleClose);
        });
      }
    }, {
      key: "_getScrollbarOffset",
      value: function _getScrollbarOffset() {
        return window.innerWidth - document.body.getBoundingClientRect().right;
      }
    }, {
      key: "_setScrollbarOffset",
      value: function _setScrollbarOffset() {
        if (!this._scrollbarIsVisible()) return;
        this._scrollbarOffset = this._getScrollbarOffset();
        this._originalPagePadding = document.body.style[CssProperties$1.PADDING_RIGHT];
        document.body.style[CssProperties$1.PADDING_RIGHT] = "".concat(this._scrollbarOffset, "px");
      }
    }, {
      key: "_scrollbarIsVisible",
      value: function _scrollbarIsVisible() {
        if (typeof window.innerWidth === "number") {
          return window.innerWidth > document.body.getBoundingClientRect().right;
        }
      }
    }, {
      key: "_unsetScrollbarOffset",
      value: function _unsetScrollbarOffset() {
        if (!this._activeModal) return;
        var originalPaddingRight = this._originalPagePadding;
        this._activeModal.style[CssProperties$1.PADDING_LEFT] = "".concat(this._scrollbarOffset, "px");
        document.body.style[CssProperties$1.PADDING_RIGHT] = originalPaddingRight;
      }
    }, {
      key: "_handleOverlayClick",
      value: function _handleOverlayClick(event) {
        if (event.target === this._activeModal) {
          this._handleClose(event);
        }
      }
    }, {
      key: "_handleEscapeKeyPress",
      value: function _handleEscapeKeyPress(event) {
        if (event.which === KeyCodes$2.ESCAPE) {
          this._handleClose(event);
        }
      }
    }, {
      key: "_focusContent",
      value: function _focusContent() {
        focusOnce(this._activeModalContent);
      }
    }, {
      key: "_focusTrigger",
      value: function _focusTrigger() {
        focusOnce(this._activeModalTrigger);
      }
    }, {
      key: "_unsetScrollStop",
      value: function _unsetScrollStop() {
        if (isiOSMobile) document.body.classList.remove(Selectors$3.OVERLAY_OPEN);
        document.body.classList.remove(Selectors$3.NO_SCROLL_CLASS);
        document.documentElement.classList.remove(Selectors$3.NO_SCROLL_CLASS);
      }
    }, {
      key: "_setScrollStop",
      value: function _setScrollStop() {
        if (isiOSMobile) document.body.classList.add(Selectors$3.OVERLAY_OPEN);
        document.body.classList.add(Selectors$3.NO_SCROLL_CLASS);
        document.documentElement.classList.add(Selectors$3.NO_SCROLL_CLASS);
      }
    }]);

    return Modal;
  }();

  var KeyCodes$3 = {
    ESCAPE: 27
  };
  var Selectors$4 = {
    DATA_TOOLTIP: "data-tooltip",
    DATA_VISIBLE: "data-visible",
    DATA_TARGET: "data-target",
    ROLE: "role",
    ARIA_DESCRIBEDBY: "aria-describedby",
    DROP_INLINE_START_CLASS: "is-drop-inline-start",
    DROP_INLINE_END_CLASS: "is-drop-inline-end",
    OVERLAY_OPEN: "overlay-open"
  };
  var CssProperties$2 = {
    HEIGHT: "height",
    WIDTH: "width",
    TOP: "top",
    LEFT: "left"
  };
  var Events$4 = {
    CLICK: "click",
    MOUSEOVER: "mouseover",
    MOUSEOUT: "mouseout",
    FOCUS: "focus",
    BLUR: "blur",
    KEYDOWN: "keydown"
  };
  var Messages$4 = {
    NO_ID_ERROR: "Could not find tooltip id.",
    NO_TRIGGER_ERROR: function NO_TRIGGER_ERROR(id) {
      return "Could not find a tooltip trigger with attribute [data-target='".concat(id, "'].");
    },
    NO_TOOLTIP_ERROR: function NO_TOOLTIP_ERROR(id) {
      return "Could not find a tooltip with id '".concat(id, "'.");
    }
  };

  var COMPONENT_ROLE$1 = "tooltip";

  var Tooltip = function () {
    function Tooltip() {
      _classCallCheck(this, Tooltip);

      this._handleEvent = this._handleEvent.bind(this);
      this._handleClose = this._handleClose.bind(this);
      this._handleEscapeKeyPress = this._handleEscapeKeyPress.bind(this);
      this._validate = this._validate.bind(this);
      this._teardown = this._teardown.bind(this);
      this._components = [];
      this._activeTrigger = null;
      this._activeTooltipBox = null;
    }

    _createClass(Tooltip, [{
      key: "start",
      value: function start(id) {
        ComponentEngine.start({
          id: id,
          attribute: Selectors$4.DATA_TOOLTIP,
          thisArg: this
        });
      }
    }, {
      key: "stop",
      value: function stop(id) {
        ComponentEngine.stop({
          id: id,
          attribute: Selectors$4.DATA_TOOLTIP,
          thisArg: this,
          activeNodeKey: "_activeTooltip",
          cancelActiveFn: "_handleClose"
        });
      }
    }, {
      key: "_validate",
      value: function _validate(instance) {
        var instanceId = instance.getAttribute(Selectors$4.DATA_TOOLTIP);

        if (!instanceId) {
          log(Messages$4.NO_ID_ERROR);
          return false;
        }

        var trigger = instance.querySelector(this._getTrigger(instanceId));
        var tooltip = instance.querySelector("#".concat(instanceId));

        if (!trigger) {
          log(Messages$4.NO_TRIGGER_ERROR(instanceId));
          return false;
        }

        if (!tooltip) {
          log(Messages$4.NO_TOOLTIP_ERROR(instanceId));
          return false;
        }

        trigger.setAttribute(Selectors$4.ARIA_DESCRIBEDBY, instanceId);
        tooltip.setAttribute(Selectors$4.ROLE, COMPONENT_ROLE$1);
        trigger.addEventListener(Events$4.MOUSEOVER, this._handleEvent);
        trigger.addEventListener(Events$4.FOCUS, this._handleEvent);
        return true;
      }
    }, {
      key: "_teardown",
      value: function _teardown(instance) {
        var id = instance.getAttribute(Selectors$4.DATA_TOOLTIP);
        var trigger = instance.querySelector(this._getTrigger(id));
        trigger.removeEventListener(Events$4.MOUSEOVER, this._handleEvent);
        trigger.removeEventListener(Events$4.FOCUS, this._handleEvent);
      }
    }, {
      key: "_handleEvent",
      value: function _handleEvent(event) {
        if (this._activeTooltip) this._handleClose();
        this._activeTrigger = event.target;

        var id = this._activeTrigger.getAttribute(Selectors$4.DATA_TARGET);

        this._activeTooltip = document.querySelector("[".concat(Selectors$4.DATA_TOOLTIP, "='").concat(id, "']"));
        this._activeTooltipBox = document.querySelector("#".concat(id));

        if (this._hasInlineClass()) {
          this._alignTooltip(CssProperties$2.HEIGHT);
        } else {
          this._alignTooltip(CssProperties$2.WIDTH);
        }

        this._setVisibleState();

        this._startCloseEvents();
      }
    }, {
      key: "_handleClose",
      value: function _handleClose() {
        if (this._activeTooltipBox) this._setHideState();

        this._startOpenEvents();

        this._resetProperties();
      }
    }, {
      key: "_resetProperties",
      value: function _resetProperties() {
        this._activeTooltip = null;
        this._activeTrigger = null;
        this._activeTooltipBox = null;
      }
    }, {
      key: "_setVisibleState",
      value: function _setVisibleState() {
        this._activeTooltipBox.setAttribute(Selectors$4.DATA_VISIBLE, "true");
      }
    }, {
      key: "_setHideState",
      value: function _setHideState() {
        this._activeTooltipBox.setAttribute(Selectors$4.DATA_VISIBLE, "false");
      }
    }, {
      key: "_startCloseEvents",
      value: function _startCloseEvents() {
        this._activeTrigger.removeEventListener(Events$4.MOUSEOVER, this._handleEvent);

        this._activeTrigger.removeEventListener(Events$4.FOCUS, this._handleEvent);

        this._activeTrigger.addEventListener(Events$4.MOUSEOUT, this._handleClose);

        this._activeTrigger.addEventListener(Events$4.BLUR, this._handleClose);

        document.addEventListener(Events$4.KEYDOWN, this._handleEscapeKeyPress);
        if (isiOSMobile) document.body.classList.add(Selectors$4.OVERLAY_OPEN);
      }
    }, {
      key: "_handleEscapeKeyPress",
      value: function _handleEscapeKeyPress(event) {
        if (event.which === KeyCodes$3.ESCAPE) {
          this._handleClose();
        }
      }
    }, {
      key: "_startOpenEvents",
      value: function _startOpenEvents() {
        if (!this._activeTrigger) return;

        this._activeTrigger.removeEventListener(Events$4.MOUSEOUT, this._handleClose);

        this._activeTrigger.removeEventListener(Events$4.BLUR, this._handleClose);

        this._activeTrigger.addEventListener(Events$4.MOUSEOVER, this._handleEvent);

        this._activeTrigger.addEventListener(Events$4.FOCUS, this._handleEvent);

        document.removeEventListener(Events$4.KEYDOWN, this._handleEscapeKeyPress);
        if (isiOSMobile) document.body.classList.remove(Selectors$4.OVERLAY_OPEN);
      }
    }, {
      key: "_alignTooltip",
      value: function _alignTooltip(property) {
        var triggerSize = this._getSize(this._activeTrigger, property);

        var tooltipSize = this._getSize(this._activeTooltipBox, property);

        var triggerIsBigger = triggerSize > tooltipSize;
        var offset = triggerIsBigger ? (triggerSize - tooltipSize) / 2 : (tooltipSize - triggerSize) / -2;

        if (property === CssProperties$2.HEIGHT) {
          this._activeTooltipBox.style[CssProperties$2.TOP] = "".concat(offset, "px");
        } else {
          this._activeTooltipBox.style[CssProperties$2.LEFT] = "".concat(offset, "px");
        }
      }
    }, {
      key: "_getTrigger",
      value: function _getTrigger(id) {
        return "[".concat(Selectors$4.DATA_TARGET, "=\"").concat(id, "\"]");
      }
    }, {
      key: "_getSize",
      value: function _getSize(element, property) {
        return Math.floor(element.getBoundingClientRect()[property]);
      }
    }, {
      key: "_hasInlineClass",
      value: function _hasInlineClass() {
        var classList = this._activeTooltipBox.classList;
        return classList.contains(Selectors$4.DROP_INLINE_START_CLASS) || classList.contains(Selectors$4.DROP_INLINE_END_CLASS);
      }
    }]);

    return Tooltip;
  }();

  var Collapsibles = new Collapsible();
  var Dropdowns = new Dropdown();
  var Modals = new Modal();
  var Tooltips = new Tooltip();
  var Undernet = {
    Modals: Modals,
    Collapsibles: Collapsibles,
    Dropdowns: Dropdowns,
    Tooltips: Tooltips,
    createFocusTrap: createFocusTrap,
    createFocusRing: createFocusRing
  };
  var focusRing = Undernet.createFocusRing();

  Undernet.start = function (id) {
    var enableFocusRing = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    Undernet.Modals.start(id);
    Undernet.Collapsibles.start(id);
    Undernet.Dropdowns.start(id);
    Undernet.Tooltips.start(id);
    if (enableFocusRing) focusRing.start();
  };

  Undernet.stop = function (id) {
    var disableFocusRing = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    Undernet.Modals.stop(id);
    Undernet.Collapsibles.stop(id);
    Undernet.Dropdowns.stop(id);
    Undernet.Tooltips.stop(id);
    if (disableFocusRing) focusRing.stop();
  };

  if (isBrowserEnv) {
    window.Undernet = Undernet;
  }

})));
//# sourceMappingURL=undernet.bundle.js.map
