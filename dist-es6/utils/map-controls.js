var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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

import MapState from './map-state';
import TransitionManager from './transition-manager';

var NO_TRANSITION_PROPS = {
  transitionDuration: 0
};
var LINEAR_TRANSITION_PROPS = Object.assign({}, TransitionManager.defaultProps, {
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
    _classCallCheck(this, MapControls);

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


  _createClass(MapControls, [{
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
      Object.assign(this._state, newState);
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
      var newViewport = Object.assign({}, newMapState.getViewportProps(), extraProps);

      if (this.onViewportChange && Object.keys(newViewport).some(function (key) {
        return oldViewport[key] !== newViewport[key];
      })) {
        // Viewport has changed
        this.onViewportChange(newViewport);
      }

      this.setState(Object.assign({}, newMapState.getInteractiveState(), extraState));
    }
  }, {
    key: 'getMapState',
    value: function getMapState(overrides) {
      return new MapState(Object.assign({}, this.mapStateProps, this._state, overrides));
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
          _getCenter2 = _slicedToArray(_getCenter, 2),
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

export default MapControls;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9tYXAtY29udHJvbHMuanMiXSwibmFtZXMiOlsiTWFwU3RhdGUiLCJUcmFuc2l0aW9uTWFuYWdlciIsIk5PX1RSQU5TSVRJT05fUFJPUFMiLCJ0cmFuc2l0aW9uRHVyYXRpb24iLCJMSU5FQVJfVFJBTlNJVElPTl9QUk9QUyIsIk9iamVjdCIsImFzc2lnbiIsImRlZmF1bHRQcm9wcyIsIlBJVENIX01PVVNFX1RIUkVTSE9MRCIsIlBJVENIX0FDQ0VMIiwiWk9PTV9BQ0NFTCIsIkVWRU5UX1RZUEVTIiwiV0hFRUwiLCJQQU4iLCJQSU5DSCIsIkRPVUJMRV9UQVAiLCJLRVlCT0FSRCIsIk1hcENvbnRyb2xzIiwiX3N0YXRlIiwiaXNEcmFnZ2luZyIsImV2ZW50cyIsImhhbmRsZUV2ZW50IiwiYmluZCIsImV2ZW50IiwibWFwU3RhdGUiLCJnZXRNYXBTdGF0ZSIsInR5cGUiLCJfb25QYW5TdGFydCIsIl9vblBhbiIsIl9vblBhbkVuZCIsIl9vblBpbmNoU3RhcnQiLCJfb25QaW5jaCIsIl9vblBpbmNoRW5kIiwiX29uRG91YmxlVGFwIiwiX29uV2hlZWwiLCJfb25LZXlEb3duIiwib2Zmc2V0Q2VudGVyIiwieCIsInkiLCJzcmNFdmVudCIsIkJvb2xlYW4iLCJtZXRhS2V5IiwiYWx0S2V5IiwiY3RybEtleSIsInNoaWZ0S2V5IiwibmV3U3RhdGUiLCJvblN0YXRlQ2hhbmdlIiwibmV3TWFwU3RhdGUiLCJleHRyYVByb3BzIiwiZXh0cmFTdGF0ZSIsIm9sZFZpZXdwb3J0IiwiZ2V0Vmlld3BvcnRQcm9wcyIsIm5ld1ZpZXdwb3J0Iiwib25WaWV3cG9ydENoYW5nZSIsImtleXMiLCJzb21lIiwia2V5Iiwic2V0U3RhdGUiLCJnZXRJbnRlcmFjdGl2ZVN0YXRlIiwib3ZlcnJpZGVzIiwibWFwU3RhdGVQcm9wcyIsIm9wdGlvbnMiLCJvbkNoYW5nZVZpZXdwb3J0IiwiZXZlbnRNYW5hZ2VyIiwic2Nyb2xsWm9vbSIsImRyYWdQYW4iLCJkcmFnUm90YXRlIiwiZG91YmxlQ2xpY2tab29tIiwidG91Y2hab29tUm90YXRlIiwia2V5Ym9hcmQiLCJfZXZlbnRzIiwidG9nZ2xlRXZlbnRzIiwiaXNJbnRlcmFjdGl2ZSIsImV2ZW50TmFtZXMiLCJlbmFibGVkIiwiZm9yRWFjaCIsImV2ZW50TmFtZSIsIm9uIiwib2ZmIiwicG9zIiwiZ2V0Q2VudGVyIiwicGFuU3RhcnQiLCJyb3RhdGVTdGFydCIsInVwZGF0ZVZpZXdwb3J0IiwiaXNGdW5jdGlvbktleVByZXNzZWQiLCJyaWdodEJ1dHRvbiIsIl9vblBhblJvdGF0ZSIsIl9vblBhbk1vdmUiLCJwYW5FbmQiLCJyb3RhdGVFbmQiLCJwYW4iLCJkZWx0YVgiLCJkZWx0YVkiLCJjZW50ZXJZIiwic3RhcnRZIiwid2lkdGgiLCJoZWlnaHQiLCJkZWx0YVNjYWxlWCIsImRlbHRhU2NhbGVZIiwiTWF0aCIsImFicyIsIm1pbiIsIm1heCIsInJvdGF0ZSIsImRlbHRhIiwic2NhbGUiLCJleHAiLCJ6b29tIiwiem9vbVN0YXJ0Iiwiem9vbUVuZCIsImlzWm9vbU91dCIsImZ1bmNLZXkiLCJrZXlDb2RlIiwiYmVhcmluZyIsInN0YXJ0UG9zIiwicGl0Y2giXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFFBQVAsTUFBcUIsYUFBckI7QUFDQSxPQUFPQyxpQkFBUCxNQUE4QixzQkFBOUI7O0FBRUEsSUFBTUMsc0JBQXNCO0FBQzFCQyxzQkFBb0I7QUFETSxDQUE1QjtBQUdBLElBQU1DLDBCQUEwQkMsT0FBT0MsTUFBUCxDQUFjLEVBQWQsRUFBa0JMLGtCQUFrQk0sWUFBcEMsRUFBa0Q7QUFDaEZKLHNCQUFvQjtBQUQ0RCxDQUFsRCxDQUFoQzs7QUFJQTtBQUNBLElBQU1LLHdCQUF3QixDQUE5QjtBQUNBLElBQU1DLGNBQWMsR0FBcEI7QUFDQSxJQUFN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QUFDRDtBQUNGO0FBQ0UsaUJBQU8sS0FBUDtBQTVDRjtBQThDQSxhQUFPLEtBQUsvQixjQUFMLENBQW9CcEMsV0FBcEIsRUFBaUMzQyx1QkFBakMsQ0FBUDtBQUNEO0FBQ0Q7Ozs7Ozs7ZUFoVW1CYSxXIiwiZmlsZSI6Im1hcC1jb250cm9scy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAxNSBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG5cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cblxuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbmltcG9ydCBNYXBTdGF0ZSBmcm9tICcuL21hcC1zdGF0ZSc7XG5pbXBvcnQgVHJhbnNpdGlvbk1hbmFnZXIgZnJvbSAnLi90cmFuc2l0aW9uLW1hbmFnZXInO1xuXG5jb25zdCBOT19UUkFOU0lUSU9OX1BST1BTID0ge1xuICB0cmFuc2l0aW9uRHVyYXRpb246IDBcbn07XG5jb25zdCBMSU5FQVJfVFJBTlNJVElPTl9QUk9QUyA9IE9iamVjdC5hc3NpZ24oe30sIFRyYW5zaXRpb25NYW5hZ2VyLmRlZmF1bHRQcm9wcywge1xuICB0cmFuc2l0aW9uRHVyYXRpb246IDMwMFxufSk7XG5cbi8vIEVWRU5UIEhBTkRMSU5HIFBBUkFNRVRFUlNcbmNvbnN0IFBJVENIX01PVVNFX1RIUkVTSE9MRCA9IDU7XG5jb25zdCBQSVRDSF9BQ0NFTCA9IDEuMjtcbmNvbnN0IFpPT01fQUNDRUwgPSAwLjAxO1xuXG5jb25zdCBFVkVOVF9UWVBFUyA9IHtcbiAgV0hFRUw6IFsnd2hlZWwnXSxcbiAgUEFOOiBbJ3BhbnN0YXJ0JywgJ3Bhbm1vdmUnLCAncGFuZW5kJ10sXG4gIFBJTkNIOiBbJ3BpbmNoc3RhcnQnLCAncGluY2htb3ZlJywgJ3BpbmNoZW5kJ10sXG4gIERPVUJMRV9UQVA6IFsnZG91YmxldGFwJ10sXG4gIEtFWUJPQVJEOiBbJ2tleWRvd24nXVxufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWFwQ29udHJvbHMge1xuICAvKipcbiAgICogQGNsYXNzZGVzY1xuICAgKiBBIGNsYXNzIHRoYXQgaGFuZGxlcyBldmVudHMgYW5kIHVwZGF0ZXMgbWVyY2F0b3Igc3R5bGUgdmlld3BvcnQgcGFyYW1ldGVyc1xuICAgKi9cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fc3RhdGUgPSB7XG4gICAgICBpc0RyYWdnaW5nOiBmYWxzZVxuICAgIH07XG4gICAgdGhpcy5ldmVudHMgPSBbXTtcbiAgICB0aGlzLmhhbmRsZUV2ZW50ID0gdGhpcy5oYW5kbGVFdmVudC5iaW5kKHRoaXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxiYWNrIGZvciBldmVudHNcbiAgICogQHBhcmFtIHtoYW1tZXIuRXZlbnR9IGV2ZW50XG4gICAqL1xuICBoYW5kbGVFdmVudChldmVudCkge1xuICAgIHRoaXMubWFwU3RhdGUgPSB0aGlzLmdldE1hcFN0YXRlKCk7XG5cbiAgICBzd2l0Y2ggKGV2ZW50LnR5cGUpIHtcbiAgICBjYXNlICdwYW5zdGFydCc6XG4gICAgICByZXR1cm4gdGhpcy5fb25QYW5TdGFydChldmVudCk7XG4gICAgY2FzZSAncGFubW92ZSc6XG4gICAgICByZXR1cm4gdGhpcy5fb25QYW4oZXZlbnQpO1xuICAgIGNhc2UgJ3BhbmVuZCc6XG4gICAgICByZXR1cm4gdGhpcy5fb25QYW5FbmQoZXZlbnQpO1xuICAgIGNhc2UgJ3BpbmNoc3RhcnQnOlxuICAgICAgcmV0dXJuIHRoaXMuX29uUGluY2hTdGFydChldmVudCk7XG4gICAgY2FzZSAncGluY2htb3ZlJzpcbiAgICAgIHJldHVybiB0aGlzLl9vblBpbmNoKGV2ZW50KTtcbiAgICBjYXNlICdwaW5jaGVuZCc6XG4gICAgICByZXR1cm4gdGhpcy5fb25QaW5jaEVuZChldmVudCk7XG4gICAgY2FzZSAnZG91YmxldGFwJzpcbiAgICAgIHJldHVybiB0aGlzLl9vbkRvdWJsZVRhcChldmVudCk7XG4gICAgY2FzZSAnd2hlZWwnOlxuICAgICAgcmV0dXJuIHRoaXMuX29uV2hlZWwoZXZlbnQpO1xuICAgIGNhc2UgJ2tleWRvd24nOlxuICAgICAgcmV0dXJuIHRoaXMuX29uS2V5RG93bihldmVudCk7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICAvKiBFdmVudCB1dGlscyAqL1xuICAvLyBFdmVudCBvYmplY3Q6IGh0dHA6Ly9oYW1tZXJqcy5naXRodWIuaW8vYXBpLyNldmVudC1vYmplY3RcbiAgZ2V0Q2VudGVyKGV2ZW50KSB7XG4gICAgY29uc3Qge29mZnNldENlbnRlcjoge3gsIHl9fSA9IGV2ZW50O1xuICAgIHJldHVybiBbeCwgeV07XG4gIH1cblxuICBpc0Z1bmN0aW9uS2V5UHJlc3NlZChldmVudCkge1xuICAgIGNvbnN0IHtzcmNFdmVudH0gPSBldmVudDtcbiAgICByZXR1cm4gQm9vbGVhbihzcmNFdmVudC5tZXRhS2V5IHx8IHNyY0V2ZW50LmFsdEtleSB8fFxuICAgICAgc3JjRXZlbnQuY3RybEtleSB8fCBzcmNFdmVudC5zaGlmdEtleSk7XG4gIH1cblxuICBzZXRTdGF0ZShuZXdTdGF0ZSkge1xuICAgIE9iamVjdC5hc3NpZ24odGhpcy5fc3RhdGUsIG5ld1N0YXRlKTtcbiAgICBpZiAodGhpcy5vblN0YXRlQ2hhbmdlKSB7XG4gICAgICB0aGlzLm9uU3RhdGVDaGFuZ2UodGhpcy5fc3RhdGUpO1xuICAgIH1cbiAgfVxuXG4gIC8qIENhbGxiYWNrIHV0aWwgKi9cbiAgLy8gZm9ybWF0cyBtYXAgc3RhdGUgYW5kIGludm9rZXMgY2FsbGJhY2sgZnVuY3Rpb25cbiAgdXBkYXRlVmlld3BvcnQobmV3TWFwU3RhdGUsIGV4dHJhUHJvcHMgPSB7fSwgZXh0cmFTdGF0ZSA9IHt9KSB7XG4gICAgY29uc3Qgb2xkVmlld3BvcnQgPSB0aGlzLm1hcFN0YXRlLmdldFZpZXdwb3J0UHJvcHMoKTtcbiAgICBjb25zdCBuZXdWaWV3cG9ydCA9IE9iamVjdC5hc3NpZ24oe30sIG5ld01hcFN0YXRlLmdldFZpZXdwb3J0UHJvcHMoKSwgZXh0cmFQcm9wcyk7XG5cbiAgICBpZiAodGhpcy5vblZpZXdwb3J0Q2hhbmdlICYmXG4gICAgICBPYmplY3Qua2V5cyhuZXdWaWV3cG9ydCkuc29tZShrZXkgPT4gb2xkVmlld3BvcnRba2V5XSAhPT0gbmV3Vmlld3BvcnRba2V5XSkpIHtcbiAgICAgIC8vIFZpZXdwb3J0IGhhcyBjaGFuZ2VkXG4gICAgICB0aGlzLm9uVmlld3BvcnRDaGFuZ2UobmV3Vmlld3BvcnQpO1xuICAgIH1cblxuICAgIHRoaXMuc2V0U3RhdGUoT2JqZWN0LmFzc2lnbih7fSwgbmV3TWFwU3RhdGUuZ2V0SW50ZXJhY3RpdmVTdGF0ZSgpLCBleHRyYVN0YXRlKSk7XG4gIH1cblxuICBnZXRNYXBTdGF0ZShvdmVycmlkZXMpIHtcbiAgICByZXR1cm4gbmV3IE1hcFN0YXRlKE9iamVjdC5hc3NpZ24oe30sIHRoaXMubWFwU3RhdGVQcm9wcywgdGhpcy5fc3RhdGUsIG92ZXJyaWRlcykpO1xuICB9XG5cbiAgLyoqXG4gICAqIEV4dHJhY3QgaW50ZXJhY3Rpdml0eSBvcHRpb25zXG4gICAqL1xuICBzZXRPcHRpb25zKG9wdGlvbnMpIHtcbiAgICBjb25zdCB7XG4gICAgICAvLyBUT0RPKGRlcHJlY2F0ZSk6IHJlbW92ZSB0aGlzIHdoZW4gYG9uQ2hhbmdlVmlld3BvcnRgIGdldHMgZGVwcmVjYXRlZFxuICAgICAgb25DaGFuZ2VWaWV3cG9ydCxcbiAgICAgIG9uVmlld3BvcnRDaGFuZ2UsXG4gICAgICBvblN0YXRlQ2hhbmdlID0gdGhpcy5vblN0YXRlQ2hhbmdlLFxuICAgICAgZXZlbnRNYW5hZ2VyID0gdGhpcy5ldmVudE1hbmFnZXIsXG4gICAgICBzY3JvbGxab29tID0gdHJ1ZSxcbiAgICAgIGRyYWdQYW4gPSB0cnVlLFxuICAgICAgZHJhZ1JvdGF0ZSA9IHRydWUsXG4gICAgICBkb3VibGVDbGlja1pvb20gPSB0cnVlLFxuICAgICAgdG91Y2hab29tUm90YXRlID0gdHJ1ZSxcbiAgICAgIGtleWJvYXJkID0gdHJ1ZVxuICAgIH0gPSBvcHRpb25zO1xuXG4gICAgLy8gVE9ETyhkZXByZWNhdGUpOiByZW1vdmUgdGhpcyBjaGVjayB3aGVuIGBvbkNoYW5nZVZpZXdwb3J0YCBnZXRzIGRlcHJlY2F0ZWRcbiAgICB0aGlzLm9uVmlld3BvcnRDaGFuZ2UgPSBvblZpZXdwb3J0Q2hhbmdlIHx8IG9uQ2hhbmdlVmlld3BvcnQ7XG4gICAgdGhpcy5vblN0YXRlQ2hhbmdlID0gb25TdGF0ZUNoYW5nZTtcbiAgICB0aGlzLm1hcFN0YXRlUHJvcHMgPSBvcHRpb25zO1xuICAgIGlmICh0aGlzLmV2ZW50TWFuYWdlciAhPT0gZXZlbnRNYW5hZ2VyKSB7XG4gICAgICAvLyBFdmVudE1hbmFnZXIgaGFzIGNoYW5nZWRcbiAgICAgIHRoaXMuZXZlbnRNYW5hZ2VyID0gZXZlbnRNYW5hZ2VyO1xuICAgICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgICB0aGlzLnRvZ2dsZUV2ZW50cyh0aGlzLmV2ZW50cywgdHJ1ZSk7XG4gICAgfVxuICAgIGNvbnN0IGlzSW50ZXJhY3RpdmUgPSBCb29sZWFuKHRoaXMub25WaWV3cG9ydENoYW5nZSk7XG5cbiAgICAvLyBSZWdpc3Rlci91bnJlZ2lzdGVyIGV2ZW50c1xuICAgIHRoaXMudG9nZ2xlRXZlbnRzKEVWRU5UX1RZUEVTLldIRUVMLCBpc0ludGVyYWN0aXZlICYmIHNjcm9sbFpvb20pO1xuICAgIHRoaXMudG9nZ2xlRXZlbnRzKEVWRU5UX1RZUEVTLlBBTiwgaXNJbnRlcmFjdGl2ZSAmJiAoZHJhZ1BhbiB8fCBkcmFnUm90YXRlKSk7XG4gICAgdGhpcy50b2dnbGVFdmVudHMoRVZFTlRfVFlQRVMuUElOQ0gsIGlzSW50ZXJhY3RpdmUgJiYgdG91Y2hab29tUm90YXRlKTtcbiAgICB0aGlzLnRvZ2dsZUV2ZW50cyhFVkVOVF9UWVBFUy5ET1VCTEVfVEFQLCBpc0ludGVyYWN0aXZlICYmIGRvdWJsZUNsaWNrWm9vbSk7XG4gICAgdGhpcy50b2dnbGVFdmVudHMoRVZFTlRfVFlQRVMuS0VZQk9BUkQsIGlzSW50ZXJhY3RpdmUgJiYga2V5Ym9hcmQpO1xuXG4gICAgLy8gSW50ZXJhY3Rpb24gdG9nZ2xlc1xuICAgIHRoaXMuc2Nyb2xsWm9vbSA9IHNjcm9sbFpvb207XG4gICAgdGhpcy5kcmFnUGFuID0gZHJhZ1BhbjtcbiAgICB0aGlzLmRyYWdSb3RhdGUgPSBkcmFnUm90YXRlO1xuICAgIHRoaXMuZG91YmxlQ2xpY2tab29tID0gZG91YmxlQ2xpY2tab29tO1xuICAgIHRoaXMudG91Y2hab29tUm90YXRlID0gdG91Y2hab29tUm90YXRlO1xuICAgIHRoaXMua2V5Ym9hcmQgPSBrZXlib2FyZDtcbiAgfVxuXG4gIHRvZ2dsZUV2ZW50cyhldmVudE5hbWVzLCBlbmFibGVkKSB7XG4gICAgaWYgKHRoaXMuZXZlbnRNYW5hZ2VyKSB7XG4gICAgICBldmVudE5hbWVzLmZvckVhY2goZXZlbnROYW1lID0+IHtcbiAgICAgICAgaWYgKHRoaXMuX2V2ZW50c1tldmVudE5hbWVdICE9PSBlbmFibGVkKSB7XG4gICAgICAgICAgdGhpcy5fZXZlbnRzW2V2ZW50TmFtZV0gPSBlbmFibGVkO1xuICAgICAgICAgIGlmIChlbmFibGVkKSB7XG4gICAgICAgICAgICB0aGlzLmV2ZW50TWFuYWdlci5vbihldmVudE5hbWUsIHRoaXMuaGFuZGxlRXZlbnQpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmV2ZW50TWFuYWdlci5vZmYoZXZlbnROYW1lLCB0aGlzLmhhbmRsZUV2ZW50KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qIEV2ZW50IGhhbmRsZXJzICovXG4gIC8vIERlZmF1bHQgaGFuZGxlciBmb3IgdGhlIGBwYW5zdGFydGAgZXZlbnQuXG4gIF9vblBhblN0YXJ0KGV2ZW50KSB7XG4gICAgY29uc3QgcG9zID0gdGhpcy5nZXRDZW50ZXIoZXZlbnQpO1xuICAgIGNvbnN0IG5ld01hcFN0YXRlID0gdGhpcy5tYXBTdGF0ZS5wYW5TdGFydCh7cG9zfSkucm90YXRlU3RhcnQoe3Bvc30pO1xuICAgIHJldHVybiB0aGlzLnVwZGF0ZVZpZXdwb3J0KG5ld01hcFN0YXRlLCBOT19UUkFOU0lUSU9OX1BST1BTLCB7aXNEcmFnZ2luZzogdHJ1ZX0pO1xuICB9XG5cbiAgLy8gRGVmYXVsdCBoYW5kbGVyIGZvciB0aGUgYHBhbm1vdmVgIGV2ZW50LlxuICBfb25QYW4oZXZlbnQpIHtcbiAgICByZXR1cm4gdGhpcy5pc0Z1bmN0aW9uS2V5UHJlc3NlZChldmVudCkgfHwgZXZlbnQucmlnaHRCdXR0b24gP1xuICAgICAgdGhpcy5fb25QYW5Sb3RhdGUoZXZlbnQpIDogdGhpcy5fb25QYW5Nb3ZlKGV2ZW50KTtcbiAgfVxuXG4gIC8vIERlZmF1bHQgaGFuZGxlciBmb3IgdGhlIGBwYW5lbmRgIGV2ZW50LlxuICBfb25QYW5FbmQoZXZlbnQpIHtcbiAgICBjb25zdCBuZXdNYXBTdGF0ZSA9IHRoaXMubWFwU3RhdGUucGFuRW5kKCkucm90YXRlRW5kKCk7XG4gICAgcmV0dXJuIHRoaXMudXBkYXRlVmlld3BvcnQobmV3TWFwU3RhdGUsIG51bGwsIHtpc0RyYWdnaW5nOiBmYWxzZX0pO1xuICB9XG5cbiAgLy8gRGVmYXVsdCBoYW5kbGVyIGZvciBwYW5uaW5nIHRvIG1vdmUuXG4gIC8vIENhbGxlZCBieSBgX29uUGFuYCB3aGVuIHBhbm5pbmcgd2l0aG91dCBmdW5jdGlvbiBrZXkgcHJlc3NlZC5cbiAgX29uUGFuTW92ZShldmVudCkge1xuICAgIGlmICghdGhpcy5kcmFnUGFuKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGNvbnN0IHBvcyA9IHRoaXMuZ2V0Q2VudGVyKGV2ZW50KTtcbiAgICBjb25zdCBuZXdNYXBTdGF0ZSA9IHRoaXMubWFwU3RhdGUucGFuKHtwb3N9KTtcbiAgICByZXR1cm4gdGhpcy51cGRhdGVWaWV3cG9ydChuZXdNYXBTdGF0ZSwgTk9fVFJBTlNJVElPTl9QUk9QUywge2lzRHJhZ2dpbmc6IHRydWV9KTtcbiAgfVxuXG4gIC8vIERlZmF1bHQgaGFuZGxlciBmb3IgcGFubmluZyB0byByb3RhdGUuXG4gIC8vIENhbGxlZCBieSBgX29uUGFuYCB3aGVuIHBhbm5pbmcgd2l0aCBmdW5jdGlvbiBrZXkgcHJlc3NlZC5cbiAgX29uUGFuUm90YXRlKGV2ZW50KSB7XG4gICAgaWYgKCF0aGlzLmRyYWdSb3RhdGUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCB7ZGVsdGFYLCBkZWx0YVl9ID0gZXZlbnQ7XG4gICAgY29uc3QgWywgY2VudGVyWV0gPSB0aGlzLmdldENlbnRlcihldmVudCk7XG4gICAgY29uc3Qgc3RhcnRZID0gY2VudGVyWSAtIGRlbHRhWTtcbiAgICBjb25zdCB7d2lkdGgsIGhlaWdodH0gPSB0aGlzLm1hcFN0YXRlLmdldFZpZXdwb3J0UHJvcHMoKTtcblxuICAgIGNvbnN0IGRlbHRhU2NhbGVYID0gZGVsdGFYIC8gd2lkdGg7XG4gICAgbGV0IGRlbHRhU2NhbGVZID0gMDtcblxuICAgIGlmIChkZWx0YVkgPiAwKSB7XG4gICAgICBpZiAoTWF0aC5hYnMoaGVpZ2h0IC0gc3RhcnRZKSA+IFBJVENIX01PVVNFX1RIUkVTSE9MRCkge1xuICAgICAgICAvLyBNb3ZlIGZyb20gMCB0byAtMSBhcyB3ZSBkcmFnIHVwd2FyZHNcbiAgICAgICAgZGVsdGFTY2FsZVkgPSBkZWx0YVkgLyAoc3RhcnRZIC0gaGVpZ2h0KSAqIFBJVENIX0FDQ0VMO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoZGVsdGFZIDwgMCkge1xuICAgICAgaWYgKHN0YXJ0WSA+IFBJVENIX01PVVNFX1RIUkVTSE9MRCkge1xuICAgICAgICAvLyBNb3ZlIGZyb20gMCB0byAxIGFzIHdlIGRyYWcgdXB3YXJkc1xuICAgICAgICBkZWx0YVNjYWxlWSA9IDEgLSBjZW50ZXJZIC8gc3RhcnRZO1xuICAgICAgfVxuICAgIH1cbiAgICBkZWx0YVNjYWxlWSA9IE1hdGgubWluKDEsIE1hdGgubWF4KC0xLCBkZWx0YVNjYWxlWSkpO1xuXG4gICAgY29uc3QgbmV3TWFwU3RhdGUgPSB0aGlzLm1hcFN0YXRlLnJvdGF0ZSh7ZGVsdGFTY2FsZVgsIGRlbHRhU2NhbGVZfSk7XG4gICAgcmV0dXJuIHRoaXMudXBkYXRlVmlld3BvcnQobmV3TWFwU3RhdGUsIE5PX1RSQU5TSVRJT05fUFJPUFMsIHtpc0RyYWdnaW5nOiB0cnVlfSk7XG4gIH1cblxuICAvLyBEZWZhdWx0IGhhbmRsZXIgZm9yIHRoZSBgd2hlZWxgIGV2ZW50LlxuICBfb25XaGVlbChldmVudCkge1xuICAgIGlmICghdGhpcy5zY3JvbGxab29tKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3QgcG9zID0gdGhpcy5nZXRDZW50ZXIoZXZlbnQpO1xuICAgIGNvbnN0IHtkZWx0YX0gPSBldmVudDtcblxuICAgIC8vIE1hcCB3aGVlbCBkZWx0YSB0byByZWxhdGl2ZSBzY2FsZVxuICAgIGxldCBzY2FsZSA9IDIgLyAoMSArIE1hdGguZXhwKC1NYXRoLmFicyhkZWx0YSAqIFpPT01fQUNDRUwpKSk7XG4gICAgaWYgKGRlbHRhIDwgMCAmJiBzY2FsZSAhPT0gMCkge1xuICAgICAgc2NhbGUgPSAxIC8gc2NhbGU7XG4gICAgfVxuXG4gICAgY29uc3QgbmV3TWFwU3RhdGUgPSB0aGlzLm1hcFN0YXRlLnpvb20oe3Bvcywgc2NhbGV9KTtcbiAgICByZXR1cm4gdGhpcy51cGRhdGVWaWV3cG9ydChuZXdNYXBTdGF0ZSwgTk9fVFJBTlNJVElPTl9QUk9QUyk7XG4gIH1cblxuICAvLyBEZWZhdWx0IGhhbmRsZXIgZm9yIHRoZSBgcGluY2hzdGFydGAgZXZlbnQuXG4gIF9vblBpbmNoU3RhcnQoZXZlbnQpIHtcbiAgICBjb25zdCBwb3MgPSB0aGlzLmdldENlbnRlcihldmVudCk7XG4gICAgY29uc3QgbmV3TWFwU3RhdGUgPSB0aGlzLm1hcFN0YXRlLnpvb21TdGFydCh7cG9zfSk7XG4gICAgcmV0dXJuIHRoaXMudXBkYXRlVmlld3BvcnQobmV3TWFwU3RhdGUsIE5PX1RSQU5TSVRJT05fUFJPUFMsIHtpc0RyYWdnaW5nOiB0cnVlfSk7XG4gIH1cblxuICAvLyBEZWZhdWx0IGhhbmRsZXIgZm9yIHRoZSBgcGluY2hgIGV2ZW50LlxuICBfb25QaW5jaChldmVudCkge1xuICAgIGlmICghdGhpcy50b3VjaFpvb21Sb3RhdGUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgY29uc3QgcG9zID0gdGhpcy5nZXRDZW50ZXIoZXZlbnQpO1xuICAgIGNvbnN0IHtzY2FsZX0gPSBldmVudDtcbiAgICBjb25zdCBuZXdNYXBTdGF0ZSA9IHRoaXMubWFwU3RhdGUuem9vbSh7cG9zLCBzY2FsZX0pO1xuICAgIHJldHVybiB0aGlzLnVwZGF0ZVZpZXdwb3J0KG5ld01hcFN0YXRlLCBOT19UUkFOU0lUSU9OX1BST1BTLCB7aXNEcmFnZ2luZzogdHJ1ZX0pO1xuICB9XG5cbiAgLy8gRGVmYXVsdCBoYW5kbGVyIGZvciB0aGUgYHBpbmNoZW5kYCBldmVudC5cbiAgX29uUGluY2hFbmQoZXZlbnQpIHtcbiAgICBjb25zdCBuZXdNYXBTdGF0ZSA9IHRoaXMubWFwU3RhdGUuem9vbUVuZCgpO1xuICAgIHJldHVybiB0aGlzLnVwZGF0ZVZpZXdwb3J0KG5ld01hcFN0YXRlLCBudWxsLCB7aXNEcmFnZ2luZzogZmFsc2V9KTtcbiAgfVxuXG4gIC8vIERlZmF1bHQgaGFuZGxlciBmb3IgdGhlIGBkb3VibGV0YXBgIGV2ZW50LlxuICBfb25Eb3VibGVUYXAoZXZlbnQpIHtcbiAgICBpZiAoIXRoaXMuZG91YmxlQ2xpY2tab29tKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGNvbnN0IHBvcyA9IHRoaXMuZ2V0Q2VudGVyKGV2ZW50KTtcbiAgICBjb25zdCBpc1pvb21PdXQgPSB0aGlzLmlzRnVuY3Rpb25LZXlQcmVzc2VkKGV2ZW50KTtcblxuICAgIGNvbnN0IG5ld01hcFN0YXRlID0gdGhpcy5tYXBTdGF0ZS56b29tKHtwb3MsIHNjYWxlOiBpc1pvb21PdXQgPyAwLjUgOiAyfSk7XG4gICAgcmV0dXJuIHRoaXMudXBkYXRlVmlld3BvcnQobmV3TWFwU3RhdGUsIExJTkVBUl9UUkFOU0lUSU9OX1BST1BTKTtcbiAgfVxuXG4gIC8qIGVzbGludC1kaXNhYmxlIGNvbXBsZXhpdHkgKi9cbiAgLy8gRGVmYXVsdCBoYW5kbGVyIGZvciB0aGUgYGtleWRvd25gIGV2ZW50XG4gIF9vbktleURvd24oZXZlbnQpIHtcbiAgICBpZiAoIXRoaXMua2V5Ym9hcmQpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgY29uc3QgZnVuY0tleSA9IHRoaXMuaXNGdW5jdGlvbktleVByZXNzZWQoZXZlbnQpO1xuICAgIGNvbnN0IHttYXBTdGF0ZVByb3BzfSA9IHRoaXM7XG4gICAgbGV0IG5ld01hcFN0YXRlO1xuXG4gICAgc3dpdGNoIChldmVudC5zcmNFdmVudC5rZXlDb2RlKSB7XG4gICAgY2FzZSAxODk6IC8vIC1cbiAgICAgIGlmIChmdW5jS2V5KSB7XG4gICAgICAgIG5ld01hcFN0YXRlID0gdGhpcy5nZXRNYXBTdGF0ZSh7em9vbTogbWFwU3RhdGVQcm9wcy56b29tIC0gMn0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmV3TWFwU3RhdGUgPSB0aGlzLmdldE1hcFN0YXRlKHt6b29tOiBtYXBTdGF0ZVByb3BzLnpvb20gLSAxfSk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlIDE4NzogLy8gK1xuICAgICAgaWYgKGZ1bmNLZXkpIHtcbiAgICAgICAgbmV3TWFwU3RhdGUgPSB0aGlzLmdldE1hcFN0YXRlKHt6b29tOiBtYXBTdGF0ZVByb3BzLnpvb20gKyAyfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZXdNYXBTdGF0ZSA9IHRoaXMuZ2V0TWFwU3RhdGUoe3pvb206IG1hcFN0YXRlUHJvcHMuem9vbSArIDF9KTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgMzc6IC8vIGxlZnRcbiAgICAgIGlmIChmdW5jS2V5KSB7XG4gICAgICAgIG5ld01hcFN0YXRlID0gdGhpcy5nZXRNYXBTdGF0ZSh7YmVhcmluZzogbWFwU3RhdGVQcm9wcy5iZWFyaW5nIC0gMTV9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5ld01hcFN0YXRlID0gdGhpcy5tYXBTdGF0ZS5wYW4oe3BvczogWzEwMCwgMF0sIHN0YXJ0UG9zOiBbMCwgMF19KTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgMzk6IC8vIHJpZ2h0XG4gICAgICBpZiAoZnVuY0tleSkge1xuICAgICAgICBuZXdNYXBTdGF0ZSA9IHRoaXMuZ2V0TWFwU3RhdGUoe2JlYXJpbmc6IG1hcFN0YXRlUHJvcHMuYmVhcmluZyArIDE1fSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZXdNYXBTdGF0ZSA9IHRoaXMubWFwU3RhdGUucGFuKHtwb3M6IFstMTAwLCAwXSwgc3RhcnRQb3M6IFswLCAwXX0pO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAzODogLy8gdXBcbiAgICAgIGlmIChmdW5jS2V5KSB7XG4gICAgICAgIG5ld01hcFN0YXRlID0gdGhpcy5nZXRNYXBTdGF0ZSh7cGl0Y2g6IG1hcFN0YXRlUHJvcHMucGl0Y2ggKyAxMH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmV3TWFwU3RhdGUgPSB0aGlzLm1hcFN0YXRlLnBhbih7cG9zOiBbMCwgMTAwXSwgc3RhcnRQb3M6IFswLCAwXX0pO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSA0MDogLy8gZG93blxuICAgICAgaWYgKGZ1bmNLZXkpIHtcbiAgICAgICAgbmV3TWFwU3RhdGUgPSB0aGlzLmdldE1hcFN0YXRlKHtwaXRjaDogbWFwU3RhdGVQcm9wcy5waXRjaCAtIDEwfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZXdNYXBTdGF0ZSA9IHRoaXMubWFwU3RhdGUucGFuKHtwb3M6IFswLCAtMTAwXSwgc3RhcnRQb3M6IFswLCAwXX0pO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMudXBkYXRlVmlld3BvcnQobmV3TWFwU3RhdGUsIExJTkVBUl9UUkFOU0lUSU9OX1BST1BTKTtcbiAgfVxuICAvKiBlc2xpbnQtZW5hYmxlIGNvbXBsZXhpdHkgKi9cbn1cbiJdfQ==