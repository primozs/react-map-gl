'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _mapState = require('./map-state');

var _mapState2 = _interopRequireDefault(_mapState);

var _transitionManager = require('./transition-manager');

var _transitionManager2 = _interopRequireDefault(_transitionManager);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Copyright (c) 2015 Uber Technologies, Inc.

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

var NO_TRANSITION_PROPS = {
  transitionDuration: 0
};
var LINEAR_TRANSITION_PROPS = (0, _assign2.default)({}, _transitionManager2.default.defaultProps, {
  transitionDuration: 300
});

// EVENT HANDLING PARAMETERS
var PITCH_MOUSE_THRESHOLD = 5;
var PITCH_ACCEL = 1.2;
var ZOOM_ACCEL = 0.01;

var EVENT_TYPES = {
  WHEEL: ['wheel'],
  PAN: ['panstart', 'panmove', 'panend'],
  PINCH: ['pinchstart', 'pinchmove', 'pinchend'],
  DOUBLE_TAP: ['doubletap'],
  KEYBOARD: ['keydown']
};

var MapControls = function () {
  /**
   * @classdesc
   * A class that handles events and updates mercator style viewport parameters
   */
  function MapControls() {
    (0, _classCallCheck3.default)(this, MapControls);

    this._state = {
      isDragging: false
    };
    this.events = [];
    this.handleEvent = this.handleEvent.bind(this);
  }

  /**
   * Callback for events
   * @param {hammer.Event} event
   */


  (0, _createClass3.default)(MapControls, [{
    key: 'handleEvent',
    value: function handleEvent(event) {
      this.mapState = this.getMapState();

      switch (event.type) {
        case 'panstart':
          return this._onPanStart(event);
        case 'panmove':
          return this._onPan(event);
        case 'panend':
          return this._onPanEnd(event);
        case 'pinchstart':
          return this._onPinchStart(event);
        case 'pinchmove':
          return this._onPinch(event);
        case 'pinchend':
          return this._onPinchEnd(event);
        case 'doubletap':
          return this._onDoubleTap(event);
        case 'wheel':
          return this._onWheel(event);
        case 'keydown':
          return this._onKeyDown(event);
        default:
          return false;
      }
    }

    /* Event utils */
    // Event object: http://hammerjs.github.io/api/#event-object

  }, {
    key: 'getCenter',
    value: function getCenter(event) {
      var _event$offsetCenter = event.offsetCenter,
          x = _event$offsetCenter.x,
          y = _event$offsetCenter.y;

      return [x, y];
    }
  }, {
    key: 'isFunctionKeyPressed',
    value: function isFunctionKeyPressed(event) {
      var srcEvent = event.srcEvent;

      return Boolean(srcEvent.metaKey || srcEvent.altKey || srcEvent.ctrlKey || srcEvent.shiftKey);
    }
  }, {
    key: 'setState',
    value: function setState(newState) {
      (0, _assign2.default)(this._state, newState);
      if (this.onStateChange) {
        this.onStateChange(this._state);
      }
    }

    /* Callback util */
    // formats map state and invokes callback function

  }, {
    key: 'updateViewport',
    value: function updateViewport(newMapState) {
      var extraProps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var extraState = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      var oldViewport = this.mapState.getViewportProps();
      var newViewport = (0, _assign2.default)({}, newMapState.getViewportProps(), extraProps);

      if (this.onViewportChange && (0, _keys2.default)(newViewport).some(function (key) {
        return oldViewport[key] !== newViewport[key];
      })) {
        // Viewport has changed
        this.onViewportChange(newViewport);
      }

      this.setState((0, _assign2.default)({}, newMapState.getInteractiveState(), extraState));
    }
  }, {
    key: 'getMapState',
    value: function getMapState(overrides) {
      return new _mapState2.default((0, _assign2.default)({}, this.mapStateProps, this._state, overrides));
    }

    /**
     * Extract interactivity options
     */

  }, {
    key: 'setOptions',
    value: function setOptions(options) {
      var onChangeViewport = options.onChangeViewport,
          onViewportChange = options.onViewportChange,
          _options$onStateChang = options.onStateChange,
          onStateChange = _options$onStateChang === undefined ? this.onStateChange : _options$onStateChang,
          _options$eventManager = options.eventManager,
          eventManager = _options$eventManager === undefined ? this.eventManager : _options$eventManager,
          _options$scrollZoom = options.scrollZoom,
          scrollZoom = _options$scrollZoom === undefined ? true : _options$scrollZoom,
          _options$dragPan = options.dragPan,
          dragPan = _options$dragPan === undefined ? true : _options$dragPan,
          _options$dragRotate = options.dragRotate,
          dragRotate = _options$dragRotate === undefined ? true : _options$dragRotate,
          _options$doubleClickZ = options.doubleClickZoom,
          doubleClickZoom = _options$doubleClickZ === undefined ? true : _options$doubleClickZ,
          _options$touchZoomRot = options.touchZoomRotate,
          touchZoomRotate = _options$touchZoomRot === undefined ? true : _options$touchZoomRot,
          _options$keyboard = options.keyboard,
          keyboard = _options$keyboard === undefined ? true : _options$keyboard;

      // TODO(deprecate): remove this check when `onChangeViewport` gets deprecated

      this.onViewportChange = onViewportChange || onChangeViewport;
      this.onStateChange = onStateChange;
      this.mapStateProps = options;
      if (this.eventManager !== eventManager) {
        // EventManager has changed
        this.eventManager = eventManager;
        this._events = {};
        this.toggleEvents(this.events, true);
      }
      var isInteractive = Boolean(this.onViewportChange);

      // Register/unregister events
      this.toggleEvents(EVENT_TYPES.WHEEL, isInteractive && scrollZoom);
      this.toggleEvents(EVENT_TYPES.PAN, isInteractive && (dragPan || dragRotate));
      this.toggleEvents(EVENT_TYPES.PINCH, isInteractive && touchZoomRotate);
      this.toggleEvents(EVENT_TYPES.DOUBLE_TAP, isInteractive && doubleClickZoom);
      this.toggleEvents(EVENT_TYPES.KEYBOARD, isInteractive && keyboard);

      // Interaction toggles
      this.scrollZoom = scrollZoom;
      this.dragPan = dragPan;
      this.dragRotate = dragRotate;
      this.doubleClickZoom = doubleClickZoom;
      this.touchZoomRotate = touchZoomRotate;
      this.keyboard = keyboard;
    }
  }, {
    key: 'toggleEvents',
    value: function toggleEvents(eventNames, enabled) {
      var _this = this;

      if (this.eventManager) {
        eventNames.forEach(function (eventName) {
          if (_this._events[eventName] !== enabled) {
            _this._events[eventName] = enabled;
            if (enabled) {
              _this.eventManager.on(eventName, _this.handleEvent);
            } else {
              _this.eventManager.off(eventName, _this.handleEvent);
            }
          }
        });
      }
    }

    /* Event handlers */
    // Default handler for the `panstart` event.

  }, {
    key: '_onPanStart',
    value: function _onPanStart(event) {
      var pos = this.getCenter(event);
      var newMapState = this.mapState.panStart({ pos: pos }).rotateStart({ pos: pos });
      return this.updateViewport(newMapState, NO_TRANSITION_PROPS, { isDragging: true });
    }

    // Default handler for the `panmove` event.

  }, {
    key: '_onPan',
    value: function _onPan(event) {
      return this.isFunctionKeyPressed(event) || event.rightButton ? this._onPanRotate(event) : this._onPanMove(event);
    }

    // Default handler for the `panend` event.

  }, {
    key: '_onPanEnd',
    value: function _onPanEnd(event) {
      var newMapState = this.mapState.panEnd().rotateEnd();
      return this.updateViewport(newMapState, null, { isDragging: false });
    }

    // Default handler for panning to move.
    // Called by `_onPan` when panning without function key pressed.

  }, {
    key: '_onPanMove',
    value: function _onPanMove(event) {
      if (!this.dragPan) {
        return false;
      }
      var pos = this.getCenter(event);
      var newMapState = this.mapState.pan({ pos: pos });
      return this.updateViewport(newMapState, NO_TRANSITION_PROPS, { isDragging: true });
    }

    // Default handler for panning to rotate.
    // Called by `_onPan` when panning with function key pressed.

  }, {
    key: '_onPanRotate',
    value: function _onPanRotate(event) {
      if (!this.dragRotate) {
        return false;
      }

      var deltaX = event.deltaX,
          deltaY = event.deltaY;

      var _getCenter = this.getCenter(event),
          _getCenter2 = (0, _slicedToArray3.default)(_getCenter, 2),
          centerY = _getCenter2[1];

      var startY = centerY - deltaY;

      var _mapState$getViewport = this.mapState.getViewportProps(),
          width = _mapState$getViewport.width,
          height = _mapState$getViewport.height;

      var deltaScaleX = deltaX / width;
      var deltaScaleY = 0;

      if (deltaY > 0) {
        if (Math.abs(height - startY) > PITCH_MOUSE_THRESHOLD) {
          // Move from 0 to -1 as we drag upwards
          deltaScaleY = deltaY / (startY - height) * PITCH_ACCEL;
        }
      } else if (deltaY < 0) {
        if (startY > PITCH_MOUSE_THRESHOLD) {
          // Move from 0 to 1 as we drag upwards
          deltaScaleY = 1 - centerY / startY;
        }
      }
      deltaScaleY = Math.min(1, Math.max(-1, deltaScaleY));

      var newMapState = this.mapState.rotate({ deltaScaleX: deltaScaleX, deltaScaleY: deltaScaleY });
      return this.updateViewport(newMapState, NO_TRANSITION_PROPS, { isDragging: true });
    }

    // Default handler for the `wheel` event.

  }, {
    key: '_onWheel',
    value: function _onWheel(event) {
      if (!this.scrollZoom) {
        return false;
      }

      var pos = this.getCenter(event);
      var delta = event.delta;

      // Map wheel delta to relative scale

      var scale = 2 / (1 + Math.exp(-Math.abs(delta * ZOOM_ACCEL)));
      if (delta < 0 && scale !== 0) {
        scale = 1 / scale;
      }

      var newMapState = this.mapState.zoom({ pos: pos, scale: scale });
      return this.updateViewport(newMapState, NO_TRANSITION_PROPS);
    }

    // Default handler for the `pinchstart` event.

  }, {
    key: '_onPinchStart',
    value: function _onPinchStart(event) {
      var pos = this.getCenter(event);
      var newMapState = this.mapState.zoomStart({ pos: pos });
      return this.updateViewport(newMapState, NO_TRANSITION_PROPS, { isDragging: true });
    }

    // Default handler for the `pinch` event.

  }, {
    key: '_onPinch',
    value: function _onPinch(event) {
      if (!this.touchZoomRotate) {
        return false;
      }
      var pos = this.getCenter(event);
      var scale = event.scale;

      var newMapState = this.mapState.zoom({ pos: pos, scale: scale });
      return this.updateViewport(newMapState, NO_TRANSITION_PROPS, { isDragging: true });
    }

    // Default handler for the `pinchend` event.

  }, {
    key: '_onPinchEnd',
    value: function _onPinchEnd(event) {
      var newMapState = this.mapState.zoomEnd();
      return this.updateViewport(newMapState, null, { isDragging: false });
    }

    // Default handler for the `doubletap` event.

  }, {
    key: '_onDoubleTap',
    value: function _onDoubleTap(event) {
      if (!this.doubleClickZoom) {
        return false;
      }
      var pos = this.getCenter(event);
      var isZoomOut = this.isFunctionKeyPressed(event);

      var newMapState = this.mapState.zoom({ pos: pos, scale: isZoomOut ? 0.5 : 2 });
      return this.updateViewport(newMapState, LINEAR_TRANSITION_PROPS);
    }

    /* eslint-disable complexity */
    // Default handler for the `keydown` event

  }, {
    key: '_onKeyDown',
    value: function _onKeyDown(event) {
      if (!this.keyboard) {
        return false;
      }
      var funcKey = this.isFunctionKeyPressed(event);
      var mapStateProps = this.mapStateProps;

      var newMapState = void 0;

      switch (event.srcEvent.keyCode) {
        case 189:
          // -
          if (funcKey) {
            newMapState = this.getMapState({ zoom: mapStateProps.zoom - 2 });
          } else {
            newMapState = this.getMapState({ zoom: mapStateProps.zoom - 1 });
          }
          break;
        case 187:
          // +
          if (funcKey) {
            newMapState = this.getMapState({ zoom: mapStateProps.zoom + 2 });
          } else {
            newMapState = this.getMapState({ zoom: mapStateProps.zoom + 1 });
          }
          break;
        case 37:
          // left
          if (funcKey) {
            newMapState = this.getMapState({ bearing: mapStateProps.bearing - 15 });
          } else {
            newMapState = this.mapState.pan({ pos: [100, 0], startPos: [0, 0] });
          }
          break;
        case 39:
          // right
          if (funcKey) {
            newMapState = this.getMapState({ bearing: mapStateProps.bearing + 15 });
          } else {
            newMapState = this.mapState.pan({ pos: [-100, 0], startPos: [0, 0] });
          }
          break;
        case 38:
          // up
          if (funcKey) {
            newMapState = this.getMapState({ pitch: mapStateProps.pitch + 10 });
          } else {
            newMapState = this.mapState.pan({ pos: [0, 100], startPos: [0, 0] });
          }
          break;
        case 40:
          // down
          if (funcKey) {
            newMapState = this.getMapState({ pitch: mapStateProps.pitch - 10 });
          } else {
            newMapState = this.mapState.pan({ pos: [0, -100], startPos: [0, 0] });
          }
          break;
        default:
          return false;
      }
      return this.updateViewport(newMapState, LINEAR_TRANSITION_PROPS);
    }
    /* eslint-enable complexity */

  }]);
  return MapControls;
}();

exports.default = MapControls;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9tYXAtY29udHJvbHMuanMiXSwibmFtZXMiOlsiTk9fVFJBTlNJVElPTl9QUk9QUyIsInRyYW5zaXRpb25EdXJhdGlvbiIsIkxJTkVBUl9UUkFOU0lUSU9OX1BST1BTIiwiZGVmYXVsdFByb3BzIiwiUElUQ0hfTU9VU0VfVEhSRVNIT0xEIiwiUElUQ0hfQUNDRUwiLCJaT09NX0FDQ0VMIiwiRVZFTlRfVFlQRVMiLCJXSEVFTCIsIlBBTiIsIlBJTkNIIiwiRE9VQkxFX1RBUCIsIktFWUJPQVJEIiwiTWFwQ29udHJvbHMiLCJfc3RhdGUiLCJpc0RyYWdnaW5nIiwiZXZlbnRzIiwiaGFuZGxlRXZlbnQiLCJiaW5kIiwiZXZlbnQiLCJtYXBTdGF0ZSIsImdldE1hcFN0YXRlIiwidHlwZSIsIl9vblBhblN0YXJ0IiwiX29uUGFuIiwiX29uUGFuRW5kIiwiX29uUGluY2hTdGFydCIsIl9vblBpbmNoIiwiX29uUGluY2hFbmQiLCJfb25Eb3VibGVUYXAiLCJfb25XaGVlbCIsIl9vbktleURvd24iLCJvZmZzZXRDZW50ZXIiLCJ4IiwieSIsInNyY0V2ZW50IiwiQm9vbGVhbiIsIm1ldGFLZXkiLCJhbHRLZXkiLCJjdHJsS2V5Iiwic2hpZnRLZXkiLCJuZXdTdGF0ZSIsIm9uU3RhdGVDaGFuZ2UiLCJuZXdNYXBTdGF0ZSIsImV4dHJhUHJvcHMiLCJleHRyYVN0YXRlIiwib2xkVmlld3BvcnQiLCJnZXRWaWV3cG9ydFByb3BzIiwibmV3Vmlld3BvcnQiLCJvblZpZXdwb3J0Q2hhbmdlIiwic29tZSIsImtleSIsInNldFN0YXRlIiwiZ2V0SW50ZXJhY3RpdmVTdGF0ZSIsIm92ZXJyaWRlcyIsIm1hcFN0YXRlUHJvcHMiLCJvcHRpb25zIiwib25DaGFuZ2VWaWV3cG9ydCIsImV2ZW50TWFuYWdlciIsInNjcm9sbFpvb20iLCJkcmFnUGFuIiwiZHJhZ1JvdGF0ZSIsImRvdWJsZUNsaWNrWm9vbSIsInRvdWNoWm9vbVJvdGF0ZSIsImtleWJvYXJkIiwiX2V2ZW50cyIsInRvZ2dsZUV2ZW50cyIsImlzSW50ZXJhY3RpdmUiLCJldmVudE5hbWVzIiwiZW5hYmxlZCIsImZvckVhY2giLCJldmVudE5hbWUiLCJvbiIsIm9mZiIsInBvcyIsImdldENlbnRlciIsInBhblN0YXJ0Iiwicm90YXRlU3RhcnQiLCJ1cGRhdGVWaWV3cG9ydCIsImlzRnVuY3Rpb25LZXlQcmVzc2VkIiwicmlnaHRCdXR0b24iLCJfb25QYW5Sb3RhdGUiLCJfb25QYW5Nb3ZlIiwicGFuRW5kIiwicm90YXRlRW5kIiwicGFuIiwiZGVsdGFYIiwiZGVsdGFZIiwiY2VudGVyWSIsInN0YXJ0WSIsIndpZHRoIiwiaGVpZ2h0IiwiZGVsdGFTY2FsZVgiLCJkZWx0YVNjYWxlWSIsIk1hdGgiLCJhYnMiLCJtaW4iLCJtYXgiLCJyb3RhdGUiLCJkZWx0YSIsInNjYWxlIiwiZXhwIiwiem9vbSIsInpvb21TdGFydCIsInpvb21FbmQiLCJpc1pvb21PdXQiLCJmdW5jS2V5Iiwia2V5Q29kZSIsImJlYXJpbmciLCJzdGFydFBvcyIsInBpdGNoIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW9CQTs7OztBQUNBOzs7Ozs7QUFyQkE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBS0EsSUFBTUEsc0JBQXNCO0FBQzFCQyxzQkFBb0I7QUFETSxDQUE1QjtBQUdBLElBQU1DLDBCQUEwQixzQkFBYyxFQUFkLEVBQWtCLDRCQUFrQkMsWUFBcEMsRUFBa0Q7QUFDaEZGLHNCQUFvQjtBQUQ0RCxDQUFsRCxDQUFoQzs7QUFJQTtBQUNBLElBQU1HLHdCQUF3QixDQUE5QjtBQUNBLElBQU1DLGNBQWMsR0FBcEI7QUFDQSxJQUFNQyxhQUFhLElBQW5COztBQUVBLElBQU1DLGNBQWM7QUFDbEJDLFNBQU8sQ0FBQyxPQUFELENBRFc7QUFFbEJDLE9BQUssQ0FBQyxVQUFELEVBQWEsU0FB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cmlnaHQgKGMpIDIwMTUgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cblxuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5pbXBvcnQgTWFwU3RhdGUgZnJvbSAnLi9tYXAtc3RhdGUnO1xuaW1wb3J0IFRyYW5zaXRpb25NYW5hZ2VyIGZyb20gJy4vdHJhbnNpdGlvbi1tYW5hZ2VyJztcblxuY29uc3QgTk9fVFJBTlNJVElPTl9QUk9QUyA9IHtcbiAgdHJhbnNpdGlvbkR1cmF0aW9uOiAwXG59O1xuY29uc3QgTElORUFSX1RSQU5TSVRJT05fUFJPUFMgPSBPYmplY3QuYXNzaWduKHt9LCBUcmFuc2l0aW9uTWFuYWdlci5kZWZhdWx0UHJvcHMsIHtcbiAgdHJhbnNpdGlvbkR1cmF0aW9uOiAzMDBcbn0pO1xuXG4vLyBFVkVOVCBIQU5ETElORyBQQVJBTUVURVJTXG5jb25zdCBQSVRDSF9NT1VTRV9USFJFU0hPTEQgPSA1O1xuY29uc3QgUElUQ0hfQUNDRUwgPSAxLjI7XG5jb25zdCBaT09NX0FDQ0VMID0gMC4wMTtcblxuY29uc3QgRVZFTlRfVFlQRVMgPSB7XG4gIFdIRUVMOiBbJ3doZWVsJ10sXG4gIFBBTjogWydwYW5zdGFydCcsICdwYW5tb3ZlJywgJ3BhbmVuZCddLFxuICBQSU5DSDogWydwaW5jaHN0YXJ0JywgJ3BpbmNobW92ZScsICdwaW5jaGVuZCddLFxuICBET1VCTEVfVEFQOiBbJ2RvdWJsZXRhcCddLFxuICBLRVlCT0FSRDogWydrZXlkb3duJ11cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1hcENvbnRyb2xzIHtcbiAgLyoqXG4gICAqIEBjbGFzc2Rlc2NcbiAgICogQSBjbGFzcyB0aGF0IGhhbmRsZXMgZXZlbnRzIGFuZCB1cGRhdGVzIG1lcmNhdG9yIHN0eWxlIHZpZXdwb3J0IHBhcmFtZXRlcnNcbiAgICovXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX3N0YXRlID0ge1xuICAgICAgaXNEcmFnZ2luZzogZmFsc2VcbiAgICB9O1xuICAgIHRoaXMuZXZlbnRzID0gW107XG4gICAgdGhpcy5oYW5kbGVFdmVudCA9IHRoaXMuaGFuZGxlRXZlbnQuYmluZCh0aGlzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsYmFjayBmb3IgZXZlbnRzXG4gICAqIEBwYXJhbSB7aGFtbWVyLkV2ZW50fSBldmVudFxuICAgKi9cbiAgaGFuZGxlRXZlbnQoZXZlbnQpIHtcbiAgICB0aGlzLm1hcFN0YXRlID0gdGhpcy5nZXRNYXBTdGF0ZSgpO1xuXG4gICAgc3dpdGNoIChldmVudC50eXBlKSB7XG4gICAgY2FzZSAncGFuc3RhcnQnOlxuICAgICAgcmV0dXJuIHRoaXMuX29uUGFuU3RhcnQoZXZlbnQpO1xuICAgIGNhc2UgJ3Bhbm1vdmUnOlxuICAgICAgcmV0dXJuIHRoaXMuX29uUGFuKGV2ZW50KTtcbiAgICBjYXNlICdwYW5lbmQnOlxuICAgICAgcmV0dXJuIHRoaXMuX29uUGFuRW5kKGV2ZW50KTtcbiAgICBjYXNlICdwaW5jaHN0YXJ0JzpcbiAgICAgIHJldHVybiB0aGlzLl9vblBpbmNoU3RhcnQoZXZlbnQpO1xuICAgIGNhc2UgJ3BpbmNobW92ZSc6XG4gICAgICByZXR1cm4gdGhpcy5fb25QaW5jaChldmVudCk7XG4gICAgY2FzZSAncGluY2hlbmQnOlxuICAgICAgcmV0dXJuIHRoaXMuX29uUGluY2hFbmQoZXZlbnQpO1xuICAgIGNhc2UgJ2RvdWJsZXRhcCc6XG4gICAgICByZXR1cm4gdGhpcy5fb25Eb3VibGVUYXAoZXZlbnQpO1xuICAgIGNhc2UgJ3doZWVsJzpcbiAgICAgIHJldHVybiB0aGlzLl9vbldoZWVsKGV2ZW50KTtcbiAgICBjYXNlICdrZXlkb3duJzpcbiAgICAgIHJldHVybiB0aGlzLl9vbktleURvd24oZXZlbnQpO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgLyogRXZlbnQgdXRpbHMgKi9cbiAgLy8gRXZlbnQgb2JqZWN0OiBodHRwOi8vaGFtbWVyanMuZ2l0aHViLmlvL2FwaS8jZXZlbnQtb2JqZWN0XG4gIGdldENlbnRlcihldmVudCkge1xuICAgIGNvbnN0IHtvZmZzZXRDZW50ZXI6IHt4LCB5fX0gPSBldmVudDtcbiAgICByZXR1cm4gW3gsIHldO1xuICB9XG5cbiAgaXNGdW5jdGlvbktleVByZXNzZWQoZXZlbnQpIHtcbiAgICBjb25zdCB7c3JjRXZlbnR9ID0gZXZlbnQ7XG4gICAgcmV0dXJuIEJvb2xlYW4oc3JjRXZlbnQubWV0YUtleSB8fCBzcmNFdmVudC5hbHRLZXkgfHxcbiAgICAgIHNyY0V2ZW50LmN0cmxLZXkgfHwgc3JjRXZlbnQuc2hpZnRLZXkpO1xuICB9XG5cbiAgc2V0U3RhdGUobmV3U3RhdGUpIHtcbiAgICBPYmplY3QuYXNzaWduKHRoaXMuX3N0YXRlLCBuZXdTdGF0ZSk7XG4gICAgaWYgKHRoaXMub25TdGF0ZUNoYW5nZSkge1xuICAgICAgdGhpcy5vblN0YXRlQ2hhbmdlKHRoaXMuX3N0YXRlKTtcbiAgICB9XG4gIH1cblxuICAvKiBDYWxsYmFjayB1dGlsICovXG4gIC8vIGZvcm1hdHMgbWFwIHN0YXRlIGFuZCBpbnZva2VzIGNhbGxiYWNrIGZ1bmN0aW9uXG4gIHVwZGF0ZVZpZXdwb3J0KG5ld01hcFN0YXRlLCBleHRyYVByb3BzID0ge30sIGV4dHJhU3RhdGUgPSB7fSkge1xuICAgIGNvbnN0IG9sZFZpZXdwb3J0ID0gdGhpcy5tYXBTdGF0ZS5nZXRWaWV3cG9ydFByb3BzKCk7XG4gICAgY29uc3QgbmV3Vmlld3BvcnQgPSBPYmplY3QuYXNzaWduKHt9LCBuZXdNYXBTdGF0ZS5nZXRWaWV3cG9ydFByb3BzKCksIGV4dHJhUHJvcHMpO1xuXG4gICAgaWYgKHRoaXMub25WaWV3cG9ydENoYW5nZSAmJlxuICAgICAgT2JqZWN0LmtleXMobmV3Vmlld3BvcnQpLnNvbWUoa2V5ID0+IG9sZFZpZXdwb3J0W2tleV0gIT09IG5ld1ZpZXdwb3J0W2tleV0pKSB7XG4gICAgICAvLyBWaWV3cG9ydCBoYXMgY2hhbmdlZFxuICAgICAgdGhpcy5vblZpZXdwb3J0Q2hhbmdlKG5ld1ZpZXdwb3J0KTtcbiAgICB9XG5cbiAgICB0aGlzLnNldFN0YXRlKE9iamVjdC5hc3NpZ24oe30sIG5ld01hcFN0YXRlLmdldEludGVyYWN0aXZlU3RhdGUoKSwgZXh0cmFTdGF0ZSkpO1xuICB9XG5cbiAgZ2V0TWFwU3RhdGUob3ZlcnJpZGVzKSB7XG4gICAgcmV0dXJuIG5ldyBNYXBTdGF0ZShPYmplY3QuYXNzaWduKHt9LCB0aGlzLm1hcFN0YXRlUHJvcHMsIHRoaXMuX3N0YXRlLCBvdmVycmlkZXMpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFeHRyYWN0IGludGVyYWN0aXZpdHkgb3B0aW9uc1xuICAgKi9cbiAgc2V0T3B0aW9ucyhvcHRpb25zKSB7XG4gICAgY29uc3Qge1xuICAgICAgLy8gVE9ETyhkZXByZWNhdGUpOiByZW1vdmUgdGhpcyB3aGVuIGBvbkNoYW5nZVZpZXdwb3J0YCBnZXRzIGRlcHJlY2F0ZWRcbiAgICAgIG9uQ2hhbmdlVmlld3BvcnQsXG4gICAgICBvblZpZXdwb3J0Q2hhbmdlLFxuICAgICAgb25TdGF0ZUNoYW5nZSA9IHRoaXMub25TdGF0ZUNoYW5nZSxcbiAgICAgIGV2ZW50TWFuYWdlciA9IHRoaXMuZXZlbnRNYW5hZ2VyLFxuICAgICAgc2Nyb2xsWm9vbSA9IHRydWUsXG4gICAgICBkcmFnUGFuID0gdHJ1ZSxcbiAgICAgIGRyYWdSb3RhdGUgPSB0cnVlLFxuICAgICAgZG91YmxlQ2xpY2tab29tID0gdHJ1ZSxcbiAgICAgIHRvdWNoWm9vbVJvdGF0ZSA9IHRydWUsXG4gICAgICBrZXlib2FyZCA9IHRydWVcbiAgICB9ID0gb3B0aW9ucztcblxuICAgIC8vIFRPRE8oZGVwcmVjYXRlKTogcmVtb3ZlIHRoaXMgY2hlY2sgd2hlbiBgb25DaGFuZ2VWaWV3cG9ydGAgZ2V0cyBkZXByZWNhdGVkXG4gICAgdGhpcy5vblZpZXdwb3J0Q2hhbmdlID0gb25WaWV3cG9ydENoYW5nZSB8fCBvbkNoYW5nZVZpZXdwb3J0O1xuICAgIHRoaXMub25TdGF0ZUNoYW5nZSA9IG9uU3RhdGVDaGFuZ2U7XG4gICAgdGhpcy5tYXBTdGF0ZVByb3BzID0gb3B0aW9ucztcbiAgICBpZiAodGhpcy5ldmVudE1hbmFnZXIgIT09IGV2ZW50TWFuYWdlcikge1xuICAgICAgLy8gRXZlbnRNYW5hZ2VyIGhhcyBjaGFuZ2VkXG4gICAgICB0aGlzLmV2ZW50TWFuYWdlciA9IGV2ZW50TWFuYWdlcjtcbiAgICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgICAgdGhpcy50b2dnbGVFdmVudHModGhpcy5ldmVudHMsIHRydWUpO1xuICAgIH1cbiAgICBjb25zdCBpc0ludGVyYWN0aXZlID0gQm9vbGVhbih0aGlzLm9uVmlld3BvcnRDaGFuZ2UpO1xuXG4gICAgLy8gUmVnaXN0ZXIvdW5yZWdpc3RlciBldmVudHNcbiAgICB0aGlzLnRvZ2dsZUV2ZW50cyhFVkVOVF9UWVBFUy5XSEVFTCwgaXNJbnRlcmFjdGl2ZSAmJiBzY3JvbGxab29tKTtcbiAgICB0aGlzLnRvZ2dsZUV2ZW50cyhFVkVOVF9UWVBFUy5QQU4sIGlzSW50ZXJhY3RpdmUgJiYgKGRyYWdQYW4gfHwgZHJhZ1JvdGF0ZSkpO1xuICAgIHRoaXMudG9nZ2xlRXZlbnRzKEVWRU5UX1RZUEVTLlBJTkNILCBpc0ludGVyYWN0aXZlICYmIHRvdWNoWm9vbVJvdGF0ZSk7XG4gICAgdGhpcy50b2dnbGVFdmVudHMoRVZFTlRfVFlQRVMuRE9VQkxFX1RBUCwgaXNJbnRlcmFjdGl2ZSAmJiBkb3VibGVDbGlja1pvb20pO1xuICAgIHRoaXMudG9nZ2xlRXZlbnRzKEVWRU5UX1RZUEVTLktFWUJPQVJELCBpc0ludGVyYWN0aXZlICYmIGtleWJvYXJkKTtcblxuICAgIC8vIEludGVyYWN0aW9uIHRvZ2dsZXNcbiAgICB0aGlzLnNjcm9sbFpvb20gPSBzY3JvbGxab29tO1xuICAgIHRoaXMuZHJhZ1BhbiA9IGRyYWdQYW47XG4gICAgdGhpcy5kcmFnUm90YXRlID0gZHJhZ1JvdGF0ZTtcbiAgICB0aGlzLmRvdWJsZUNsaWNrWm9vbSA9IGRvdWJsZUNsaWNrWm9vbTtcbiAgICB0aGlzLnRvdWNoWm9vbVJvdGF0ZSA9IHRvdWNoWm9vbVJvdGF0ZTtcbiAgICB0aGlzLmtleWJvYXJkID0ga2V5Ym9hcmQ7XG4gIH1cblxuICB0b2dnbGVFdmVudHMoZXZlbnROYW1lcywgZW5hYmxlZCkge1xuICAgIGlmICh0aGlzLmV2ZW50TWFuYWdlcikge1xuICAgICAgZXZlbnROYW1lcy5mb3JFYWNoKGV2ZW50TmFtZSA9PiB7XG4gICAgICAgIGlmICh0aGlzLl9ldmVudHNbZXZlbnROYW1lXSAhPT0gZW5hYmxlZCkge1xuICAgICAgICAgIHRoaXMuX2V2ZW50c1tldmVudE5hbWVdID0gZW5hYmxlZDtcbiAgICAgICAgICBpZiAoZW5hYmxlZCkge1xuICAgICAgICAgICAgdGhpcy5ldmVudE1hbmFnZXIub24oZXZlbnROYW1lLCB0aGlzLmhhbmRsZUV2ZW50KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5ldmVudE1hbmFnZXIub2ZmKGV2ZW50TmFtZSwgdGhpcy5oYW5kbGVFdmVudCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKiBFdmVudCBoYW5kbGVycyAqL1xuICAvLyBEZWZhdWx0IGhhbmRsZXIgZm9yIHRoZSBgcGFuc3RhcnRgIGV2ZW50LlxuICBfb25QYW5TdGFydChldmVudCkge1xuICAgIGNvbnN0IHBvcyA9IHRoaXMuZ2V0Q2VudGVyKGV2ZW50KTtcbiAgICBjb25zdCBuZXdNYXBTdGF0ZSA9IHRoaXMubWFwU3RhdGUucGFuU3RhcnQoe3Bvc30pLnJvdGF0ZVN0YXJ0KHtwb3N9KTtcbiAgICByZXR1cm4gdGhpcy51cGRhdGVWaWV3cG9ydChuZXdNYXBTdGF0ZSwgTk9fVFJBTlNJVElPTl9QUk9QUywge2lzRHJhZ2dpbmc6IHRydWV9KTtcbiAgfVxuXG4gIC8vIERlZmF1bHQgaGFuZGxlciBmb3IgdGhlIGBwYW5tb3ZlYCBldmVudC5cbiAgX29uUGFuKGV2ZW50KSB7XG4gICAgcmV0dXJuIHRoaXMuaXNGdW5jdGlvbktleVByZXNzZWQoZXZlbnQpIHx8IGV2ZW50LnJpZ2h0QnV0dG9uID9cbiAgICAgIHRoaXMuX29uUGFuUm90YXRlKGV2ZW50KSA6IHRoaXMuX29uUGFuTW92ZShldmVudCk7XG4gIH1cblxuICAvLyBEZWZhdWx0IGhhbmRsZXIgZm9yIHRoZSBgcGFuZW5kYCBldmVudC5cbiAgX29uUGFuRW5kKGV2ZW50KSB7XG4gICAgY29uc3QgbmV3TWFwU3RhdGUgPSB0aGlzLm1hcFN0YXRlLnBhbkVuZCgpLnJvdGF0ZUVuZCgpO1xuICAgIHJldHVybiB0aGlzLnVwZGF0ZVZpZXdwb3J0KG5ld01hcFN0YXRlLCBudWxsLCB7aXNEcmFnZ2luZzogZmFsc2V9KTtcbiAgfVxuXG4gIC8vIERlZmF1bHQgaGFuZGxlciBmb3IgcGFubmluZyB0byBtb3ZlLlxuICAvLyBDYWxsZWQgYnkgYF9vblBhbmAgd2hlbiBwYW5uaW5nIHdpdGhvdXQgZnVuY3Rpb24ga2V5IHByZXNzZWQuXG4gIF9vblBhbk1vdmUoZXZlbnQpIHtcbiAgICBpZiAoIXRoaXMuZHJhZ1Bhbikge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBjb25zdCBwb3MgPSB0aGlzLmdldENlbnRlcihldmVudCk7XG4gICAgY29uc3QgbmV3TWFwU3RhdGUgPSB0aGlzLm1hcFN0YXRlLnBhbih7cG9zfSk7XG4gICAgcmV0dXJuIHRoaXMudXBkYXRlVmlld3BvcnQobmV3TWFwU3RhdGUsIE5PX1RSQU5TSVRJT05fUFJPUFMsIHtpc0RyYWdnaW5nOiB0cnVlfSk7XG4gIH1cblxuICAvLyBEZWZhdWx0IGhhbmRsZXIgZm9yIHBhbm5pbmcgdG8gcm90YXRlLlxuICAvLyBDYWxsZWQgYnkgYF9vblBhbmAgd2hlbiBwYW5uaW5nIHdpdGggZnVuY3Rpb24ga2V5IHByZXNzZWQuXG4gIF9vblBhblJvdGF0ZShldmVudCkge1xuICAgIGlmICghdGhpcy5kcmFnUm90YXRlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3Qge2RlbHRhWCwgZGVsdGFZfSA9IGV2ZW50O1xuICAgIGNvbnN0IFssIGNlbnRlclldID0gdGhpcy5nZXRDZW50ZXIoZXZlbnQpO1xuICAgIGNvbnN0IHN0YXJ0WSA9IGNlbnRlclkgLSBkZWx0YVk7XG4gICAgY29uc3Qge3dpZHRoLCBoZWlnaHR9ID0gdGhpcy5tYXBTdGF0ZS5nZXRWaWV3cG9ydFByb3BzKCk7XG5cbiAgICBjb25zdCBkZWx0YVNjYWxlWCA9IGRlbHRhWCAvIHdpZHRoO1xuICAgIGxldCBkZWx0YVNjYWxlWSA9IDA7XG5cbiAgICBpZiAoZGVsdGFZID4gMCkge1xuICAgICAgaWYgKE1hdGguYWJzKGhlaWdodCAtIHN0YXJ0WSkgPiBQSVRDSF9NT1VTRV9USFJFU0hPTEQpIHtcbiAgICAgICAgLy8gTW92ZSBmcm9tIDAgdG8gLTEgYXMgd2UgZHJhZyB1cHdhcmRzXG4gICAgICAgIGRlbHRhU2NhbGVZID0gZGVsdGFZIC8gKHN0YXJ0WSAtIGhlaWdodCkgKiBQSVRDSF9BQ0NFTDtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGRlbHRhWSA8IDApIHtcbiAgICAgIGlmIChzdGFydFkgPiBQSVRDSF9NT1VTRV9USFJFU0hPTEQpIHtcbiAgICAgICAgLy8gTW92ZSBmcm9tIDAgdG8gMSBhcyB3ZSBkcmFnIHVwd2FyZHNcbiAgICAgICAgZGVsdGFTY2FsZVkgPSAxIC0gY2VudGVyWSAvIHN0YXJ0WTtcbiAgICAgIH1cbiAgICB9XG4gICAgZGVsdGFTY2FsZVkgPSBNYXRoLm1pbigxLCBNYXRoLm1heCgtMSwgZGVsdGFTY2FsZVkpKTtcblxuICAgIGNvbnN0IG5ld01hcFN0YXRlID0gdGhpcy5tYXBTdGF0ZS5yb3RhdGUoe2RlbHRhU2NhbGVYLCBkZWx0YVNjYWxlWX0pO1xuICAgIHJldHVybiB0aGlzLnVwZGF0ZVZpZXdwb3J0KG5ld01hcFN0YXRlLCBOT19UUkFOU0lUSU9OX1BST1BTLCB7aXNEcmFnZ2luZzogdHJ1ZX0pO1xuICB9XG5cbiAgLy8gRGVmYXVsdCBoYW5kbGVyIGZvciB0aGUgYHdoZWVsYCBldmVudC5cbiAgX29uV2hlZWwoZXZlbnQpIHtcbiAgICBpZiAoIXRoaXMuc2Nyb2xsWm9vbSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGNvbnN0IHBvcyA9IHRoaXMuZ2V0Q2VudGVyKGV2ZW50KTtcbiAgICBjb25zdCB7ZGVsdGF9ID0gZXZlbnQ7XG5cbiAgICAvLyBNYXAgd2hlZWwgZGVsdGEgdG8gcmVsYXRpdmUgc2NhbGVcbiAgICBsZXQgc2NhbGUgPSAyIC8gKDEgKyBNYXRoLmV4cCgtTWF0aC5hYnMoZGVsdGEgKiBaT09NX0FDQ0VMKSkpO1xuICAgIGlmIChkZWx0YSA8IDAgJiYgc2NhbGUgIT09IDApIHtcbiAgICAgIHNjYWxlID0gMSAvIHNjYWxlO1xuICAgIH1cblxuICAgIGNvbnN0IG5ld01hcFN0YXRlID0gdGhpcy5tYXBTdGF0ZS56b29tKHtwb3MsIHNjYWxlfSk7XG4gICAgcmV0dXJuIHRoaXMudXBkYXRlVmlld3BvcnQobmV3TWFwU3RhdGUsIE5PX1RSQU5TSVRJT05fUFJPUFMpO1xuICB9XG5cbiAgLy8gRGVmYXVsdCBoYW5kbGVyIGZvciB0aGUgYHBpbmNoc3RhcnRgIGV2ZW50LlxuICBfb25QaW5jaFN0YXJ0KGV2ZW50KSB7XG4gICAgY29uc3QgcG9zID0gdGhpcy5nZXRDZW50ZXIoZXZlbnQpO1xuICAgIGNvbnN0IG5ld01hcFN0YXRlID0gdGhpcy5tYXBTdGF0ZS56b29tU3RhcnQoe3Bvc30pO1xuICAgIHJldHVybiB0aGlzLnVwZGF0ZVZpZXdwb3J0KG5ld01hcFN0YXRlLCBOT19UUkFOU0lUSU9OX1BST1BTLCB7aXNEcmFnZ2luZzogdHJ1ZX0pO1xuICB9XG5cbiAgLy8gRGVmYXVsdCBoYW5kbGVyIGZvciB0aGUgYHBpbmNoYCBldmVudC5cbiAgX29uUGluY2goZXZlbnQpIHtcbiAgICBpZiAoIXRoaXMudG91Y2hab29tUm90YXRlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGNvbnN0IHBvcyA9IHRoaXMuZ2V0Q2VudGVyKGV2ZW50KTtcbiAgICBjb25zdCB7c2NhbGV9ID0gZXZlbnQ7XG4gICAgY29uc3QgbmV3TWFwU3RhdGUgPSB0aGlzLm1hcFN0YXRlLnpvb20oe3Bvcywgc2NhbGV9KTtcbiAgICByZXR1cm4gdGhpcy51cGRhdGVWaWV3cG9ydChuZXdNYXBTdGF0ZSwgTk9fVFJBTlNJVElPTl9QUk9QUywge2lzRHJhZ2dpbmc6IHRydWV9KTtcbiAgfVxuXG4gIC8vIERlZmF1bHQgaGFuZGxlciBmb3IgdGhlIGBwaW5jaGVuZGAgZXZlbnQuXG4gIF9vblBpbmNoRW5kKGV2ZW50KSB7XG4gICAgY29uc3QgbmV3TWFwU3RhdGUgPSB0aGlzLm1hcFN0YXRlLnpvb21FbmQoKTtcbiAgICByZXR1cm4gdGhpcy51cGRhdGVWaWV3cG9ydChuZXdNYXBTdGF0ZSwgbnVsbCwge2lzRHJhZ2dpbmc6IGZhbHNlfSk7XG4gIH1cblxuICAvLyBEZWZhdWx0IGhhbmRsZXIgZm9yIHRoZSBgZG91YmxldGFwYCBldmVudC5cbiAgX29uRG91YmxlVGFwKGV2ZW50KSB7XG4gICAgaWYgKCF0aGlzLmRvdWJsZUNsaWNrWm9vbSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBjb25zdCBwb3MgPSB0aGlzLmdldENlbnRlcihldmVudCk7XG4gICAgY29uc3QgaXNab29tT3V0ID0gdGhpcy5pc0Z1bmN0aW9uS2V5UHJlc3NlZChldmVudCk7XG5cbiAgICBjb25zdCBuZXdNYXBTdGF0ZSA9IHRoaXMubWFwU3RhdGUuem9vbSh7cG9zLCBzY2FsZTogaXNab29tT3V0ID8gMC41IDogMn0pO1xuICAgIHJldHVybiB0aGlzLnVwZGF0ZVZpZXdwb3J0KG5ld01hcFN0YXRlLCBMSU5FQVJfVFJBTlNJVElPTl9QUk9QUyk7XG4gIH1cblxuICAvKiBlc2xpbnQtZGlzYWJsZSBjb21wbGV4aXR5ICovXG4gIC8vIERlZmF1bHQgaGFuZGxlciBmb3IgdGhlIGBrZXlkb3duYCBldmVudFxuICBfb25LZXlEb3duKGV2ZW50KSB7XG4gICAgaWYgKCF0aGlzLmtleWJvYXJkKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGNvbnN0IGZ1bmNLZXkgPSB0aGlzLmlzRnVuY3Rpb25LZXlQcmVzc2VkKGV2ZW50KTtcbiAgICBjb25zdCB7bWFwU3RhdGVQcm9wc30gPSB0aGlzO1xuICAgIGxldCBuZXdNYXBTdGF0ZTtcblxuICAgIHN3aXRjaCAoZXZlbnQuc3JjRXZlbnQua2V5Q29kZSkge1xuICAgIGNhc2UgMTg5OiAvLyAtXG4gICAgICBpZiAoZnVuY0tleSkge1xuICAgICAgICBuZXdNYXBTdGF0ZSA9IHRoaXMuZ2V0TWFwU3RhdGUoe3pvb206IG1hcFN0YXRlUHJvcHMuem9vbSAtIDJ9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5ld01hcFN0YXRlID0gdGhpcy5nZXRNYXBTdGF0ZSh7em9vbTogbWFwU3RhdGVQcm9wcy56b29tIC0gMX0pO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAxODc6IC8vICtcbiAgICAgIGlmIChmdW5jS2V5KSB7XG4gICAgICAgIG5ld01hcFN0YXRlID0gdGhpcy5nZXRNYXBTdGF0ZSh7em9vbTogbWFwU3RhdGVQcm9wcy56b29tICsgMn0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmV3TWFwU3RhdGUgPSB0aGlzLmdldE1hcFN0YXRlKHt6b29tOiBtYXBTdGF0ZVByb3BzLnpvb20gKyAxfSk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlIDM3OiAvLyBsZWZ0XG4gICAgICBpZiAoZnVuY0tleSkge1xuICAgICAgICBuZXdNYXBTdGF0ZSA9IHRoaXMuZ2V0TWFwU3RhdGUoe2JlYXJpbmc6IG1hcFN0YXRlUHJvcHMuYmVhcmluZyAtIDE1fSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZXdNYXBTdGF0ZSA9IHRoaXMubWFwU3RhdGUucGFuKHtwb3M6IFsxMDAsIDBdLCBzdGFydFBvczogWzAsIDBdfSk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlIDM5OiAvLyByaWdodFxuICAgICAgaWYgKGZ1bmNLZXkpIHtcbiAgICAgICAgbmV3TWFwU3RhdGUgPSB0aGlzLmdldE1hcFN0YXRlKHtiZWFyaW5nOiBtYXBTdGF0ZVByb3BzLmJlYXJpbmcgKyAxNX0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmV3TWFwU3RhdGUgPSB0aGlzLm1hcFN0YXRlLnBhbih7cG9zOiBbLTEwMCwgMF0sIHN0YXJ0UG9zOiBbMCwgMF19KTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgMzg6IC8vIHVwXG4gICAgICBpZiAoZnVuY0tleSkge1xuICAgICAgICBuZXdNYXBTdGF0ZSA9IHRoaXMuZ2V0TWFwU3RhdGUoe3BpdGNoOiBtYXBTdGF0ZVByb3BzLnBpdGNoICsgMTB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5ld01hcFN0YXRlID0gdGhpcy5tYXBTdGF0ZS5wYW4oe3BvczogWzAsIDEwMF0sIHN0YXJ0UG9zOiBbMCwgMF19KTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgNDA6IC8vIGRvd25cbiAgICAgIGlmIChmdW5jS2V5KSB7XG4gICAgICAgIG5ld01hcFN0YXRlID0gdGhpcy5nZXRNYXBTdGF0ZSh7cGl0Y2g6IG1hcFN0YXRlUHJvcHMucGl0Y2ggLSAxMH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmV3TWFwU3RhdGUgPSB0aGlzLm1hcFN0YXRlLnBhbih7cG9zOiBbMCwgLTEwMF0sIHN0YXJ0UG9zOiBbMCwgMF19KTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnVwZGF0ZVZpZXdwb3J0KG5ld01hcFN0YXRlLCBMSU5FQVJfVFJBTlNJVElPTl9QUk9QUyk7XG4gIH1cbiAgLyogZXNsaW50LWVuYWJsZSBjb21wbGV4aXR5ICovXG59XG4iXX0=