'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TRANSITION_EVENTS = undefined;

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _viewportTransitionUtils = require('./viewport-transition-utils');

var _mapState = require('./map-state');

var _mapState2 = _interopRequireDefault(_mapState);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var noop = function noop() {}; /* global requestAnimationFrame, cancelAnimationFrame */
var TRANSITION_EVENTS = exports.TRANSITION_EVENTS = {
  BREAK: 1,
  SNAP_TO_END: 2,
  IGNORE: 3
};

var DEFAULT_PROPS = {
  transitionDuration: 0,
  transitionInterpolator: _viewportTransitionUtils.viewportLinearInterpolator,
  transitionEasing: function transitionEasing(t) {
    return t;
  },
  transitionInterruption: TRANSITION_EVENTS.BREAK,
  onTransitionStart: noop,
  onTransitionInterrupt: noop,
  onTransitionEnd: noop
};

var DEFAULT_STATE = {
  animation: null,
  viewport: null,
  startViewport: null,
  endViewport: null
};

var TransitionManager = function () {
  function TransitionManager(props) {
    (0, _classCallCheck3.default)(this, TransitionManager);

    this.props = props;
    this.state = DEFAULT_STATE;

    this._onTransitionFrame = this._onTransitionFrame.bind(this);
  }

  // Returns current transitioned viewport.


  (0, _createClass3.default)(TransitionManager, [{
    key: 'getViewportInTransition',
    value: function getViewportInTransition() {
      return this.state.viewport;
    }

    // Process the vewiport change, either ignore or trigger a new transiton.

  }, {
    key: 'processViewportChange',
    value: function processViewportChange(nextProps) {

      // NOTE: Be cautious re-ordering statements in this function.
      if (this._shouldIgnoreViewportChange(nextProps)) {
        this.props = nextProps;
        return;
      }

      var isTransitionInProgress = this._isTransitionInProgress();

      if (this._isTransitionEnabled(nextProps)) {
        var currentViewport = this.state.viewport || (0, _viewportTransitionUtils.extractViewportFrom)(this.props);
        var endViewport = this.state.endViewport;

        var startViewport = this.state.interruption === TRANSITION_EVENTS.SNAP_TO_END ? endViewport || currentViewport : currentViewport;

        this._triggerTransition(startViewport, nextProps);

        if (isTransitionInProgress) {
          this.props.onTransitionInterrupt();
        }
        nextProps.onTransitionStart();
      } else if (isTransitionInProgress) {
        this.props.onTransitionInterrupt();
        this._endTransition();
      }

      this.props = nextProps;
    }

    // Helper methods

  }, {
    key: '_isTransitionInProgress',
    value: function _isTransitionInProgress() {
      return this.state.viewport;
    }
  }, {
    key: '_isTransitionEnabled',
    value: function _isTransitionEnabled(props) {
      return props.transitionDuration > 0;
    }
  }, {
    key: '_isUpdateDueToCurrentTransition',
    value: function _isUpdateDueToCurrentTransition(props) {
      if (this.state.viewport) {
        return (0, _viewportTransitionUtils.areViewportsEqual)(props, this.state.viewport);
      }
      return false;
    }
  }, {
    key: '_shouldIgnoreViewportChange',
    value: function _shouldIgnoreViewportChange(nextProps) {
      // Ignore update if it is due to current active transition.
      // Ignore update if it is requested to be ignored
      if (this._isTransitionInProgress()) {
        if (this.state.interruption === TRANSITION_EVENTS.IGNORE || this._isUpdateDueToCurrentTransition(nextProps)) {
          return true;
        }
      } else if (!this._isTransitionEnabled(nextProps)) {
        return true;
      }

      // Ignore if none of the viewport props changed.
      if ((0, _viewportTransitionUtils.areViewportsEqual)(this.props, nextProps)) {
        return true;
      }

      return false;
    }
  }, {
    key: '_triggerTransition',
    value: function _triggerTransition(startViewport, nextProps) {
      (0, _assert2.default)(nextProps.transitionDuration !== 0);
      var endViewport = (0, _viewportTransitionUtils.extractViewportFrom)(nextProps);

      cancelAnimationFrame(this.state.animation);

      this.state = {
        // Save current transition props
        duration: nextProps.transitionDuration,
        easing: nextProps.transitionEasing,
        interpolator: nextProps.transitionInterpolator,
        interruption: nextProps.transitionInterruption,

        startTime: Date.now(),
        startViewport: startViewport,
        endViewport: endViewport,
        animation: null,
        viewport: startViewport
      };

      this._onTransitionFrame();
    }
  }, {
    key: '_onTransitionFrame',
    value: function _onTransitionFrame() {
      // _updateViewport() may cancel the animation
      this.state.animation = requestAnimationFrame(this._onTransitionFrame);
      this._updateViewport();
    }
  }, {
    key: '_endTransition',
    value: function _endTransition() {
      cancelAnimationFrame(this.state.animation);
      this.state = DEFAULT_STATE;
    }
  }, {
    key: '_updateViewport',
    value: function _updateViewport() {
      // NOTE: Be cautious re-ordering statements in this function.
      var currentTime = Date.now();
      var _state = this.state,
          startTime = _state.startTime,
          duration = _state.duration,
          easing = _state.easing,
          interpolator = _state.interpolator,
          startViewport = _state.startViewport,
          endViewport = _state.endViewport;


      var shouldEnd = false;
      var t = (currentTime - startTime) / duration;
      if (t >= 1) {
        t = 1;
        shouldEnd = true;
      }
      t = easing(t);

      var viewport = interpolator(startViewport, endViewport, t);
      // Normalize viewport props
      var mapState = new _mapState2.default((0, _assign2.default)({}, this.props, viewport));
      this.state.viewport = mapState.getViewportProps();

      if (this.props.onViewportChange) {
        this.props.onViewportChange(this.state.viewport);
      }

      if (shouldEnd) {
        this._endTransition();
        this.props.onTransitionEnd();
      }
    }
  }]);
  return TransitionManager;
}();

exports.default = TransitionManager;


TransitionManager.defaultProps = DEFAULT_PROPS;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy90cmFuc2l0aW9uLW1hbmFnZXIuanMiXSwibmFtZXMiOlsibm9vcCIsIlRSQU5TSVRJT05fRVZFTlRTIiwiQlJFQUsiLCJTTkFQX1RPX0VORCIsIklHTk9SRSIsIkRFRkFVTFRfUFJPUFMiLCJ0cmFuc2l0aW9uRHVyYXRpb24iLCJ0cmFuc2l0aW9uSW50ZXJwb2xhdG9yIiwidHJhbnNpdGlvbkVhc2luZyIsInQiLCJ0cmFuc2l0aW9uSW50ZXJydXB0aW9uIiwib25UcmFuc2l0aW9uU3RhcnQiLCJvblRyYW5zaXRpb25JbnRlcnJ1cHQiLCJvblRyYW5zaXRpb25FbmQiLCJERUZBVUxUX1NUQVRFIiwiYW5pbWF0aW9uIiwidmlld3BvcnQiLCJzdGFydFZpZXdwb3J0IiwiZW5kVmlld3BvcnQiLCJUcmFuc2l0aW9uTWFuYWdlciIsInByb3BzIiwic3RhdGUiLCJfb25UcmFuc2l0aW9uRnJhbWUiLCJiaW5kIiwibmV4dFByb3BzIiwiX3Nob3VsZElnbm9yZVZpZXdwb3J0Q2hhbmdlIiwiaXNUcmFuc2l0aW9uSW5Qcm9ncmVzcyIsIl9pc1RyYW5zaXRpb25JblByb2dyZXNzIiwiX2lzVHJhbnNpdGlvbkVuYWJsZWQiLCJjdXJyZW50Vmlld3BvcnQiLCJpbnRlcnJ1cHRpb24iLCJfdHJpZ2dlclRyYW5zaXRpb24iLCJfZW5kVHJhbnNpdGlvbiIsIl9pc1VwZGF0ZUR1ZVRvQ3VycmVudFRyYW5zaXRpb24iLCJjYW5jZWxBbmltYXRpb25GcmFtZSIsImR1cmF0aW9uIiwiZWFzaW5nIiwiaW50ZXJwb2xhdG9yIiwic3RhcnRUaW1lIiwiRGF0ZSIsIm5vdyIsInJlcXVlc3RBbmltYXRpb25GcmFtZSIsIl91cGRhdGVWaWV3cG9ydCIsImN1cnJlbnRUaW1lIiwic2hvdWxkRW5kIiwibWFwU3RhdGUiLCJnZXRWaWV3cG9ydFByb3BzIiwib25WaWV3cG9ydENoYW5nZSIsImRlZmF1bHRQcm9wcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7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SGxDO0FBQUEsVUFHaURDLFdBSGpELFVBR2lEQSxXQUhqRDs7O0FBS2hCLFVBQUkwQixZQUFZLEtBQWhCO0FBQ0EsVUFBSW5DLElBQUksQ0FBQ2tDLGNBQWNMLFNBQWYsSUFBNEJILFFBQXBDO0FBQ0EsVUFBSTFCLEtBQUssQ0FBVCxFQUFZO0FBQ1ZBLFlBQUksQ0FBSjtBQUNBbUMsb0JBQVksSUFBWjtBQUNEO0FBQ0RuQyxVQUFJMkIsT0FBTzNCLENBQVAsQ0FBSjs7QUFFQSxVQUFNTyxXQUFXcUIsYUFBYXBCLGFBQWIsRUFBNEJDLFdBQTVCLEVBQXlDVCxDQUF6QyxDQUFqQjtBQUNFO0FBQ0YsVUFBTW9DLFdBQVcsdUJBQWEsc0JBQWMsRUFBZCxFQUFrQixLQUFLekIsS0FBdkIsRUFBOEJKLFFBQTlCLENBQWIsQ0FBakI7QUFDQSxXQUFLSyxLQUFMLENBQVdMLFFBQVgsR0FBc0I2QixTQUFTQyxnQkFBVCxFQUF0Qjs7QUFFQSxVQUFJLEtBQUsxQixLQUFMLENBQVcyQixnQkFBZixFQUFpQztBQUMvQixhQUFLM0IsS0FBTCxDQUFXMkIsZ0JBQVgsQ0FBNEIsS0FBSzFCLEtBQUwsQ0FBV0wsUUFBdkM7QUFDRDs7QUFFRCxVQUFJNEIsU0FBSixFQUFlO0FBQ2IsYUFBS1osY0FBTDtBQUNBLGFBQUtaLEtBQUwsQ0FBV1AsZUFBWDtBQUNEO0FBQ0Y7Ozs7O2tCQS9Ja0JNLGlCOzs7QUFrSnJCQSxrQkFBa0I2QixZQUFsQixHQUFpQzNDLGFBQWpDIiwiZmlsZSI6InRyYW5zaXRpb24tbWFuYWdlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGdsb2JhbCByZXF1ZXN0QW5pbWF0aW9uRnJhbWUsIGNhbmNlbEFuaW1hdGlvbkZyYW1lICovXG5pbXBvcnQgYXNzZXJ0IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQge1xuICB2aWV3cG9ydExpbmVhckludGVycG9sYXRvcixcbiAgZXh0cmFjdFZpZXdwb3J0RnJvbSxcbiAgYXJlVmlld3BvcnRzRXF1YWxcbn0gZnJvbSAnLi92aWV3cG9ydC10cmFuc2l0aW9uLXV0aWxzJztcbmltcG9ydCBNYXBTdGF0ZSBmcm9tICcuL21hcC1zdGF0ZSc7XG5cbmNvbnN0IG5vb3AgPSAoKSA9PiB7fTtcblxuZXhwb3J0IGNvbnN0IFRSQU5TSVRJT05fRVZFTlRTID0ge1xuICBCUkVBSzogMSxcbiAgU05BUF9UT19FTkQ6IDIsXG4gIElHTk9SRTogM1xufTtcblxuY29uc3QgREVGQVVMVF9QUk9QUyA9IHtcbiAgdHJhbnNpdGlvbkR1cmF0aW9uOiAwLFxuICB0cmFuc2l0aW9uSW50ZXJwb2xhdG9yOiB2aWV3cG9ydExpbmVhckludGVycG9sYXRvcixcbiAgdHJhbnNpdGlvbkVhc2luZzogdCA9PiB0LFxuICB0cmFuc2l0aW9uSW50ZXJydXB0aW9uOiBUUkFOU0lUSU9OX0VWRU5UUy5CUkVBSyxcbiAgb25UcmFuc2l0aW9uU3RhcnQ6IG5vb3AsXG4gIG9uVHJhbnNpdGlvbkludGVycnVwdDogbm9vcCxcbiAgb25UcmFuc2l0aW9uRW5kOiBub29wXG59O1xuXG5jb25zdCBERUZBVUxUX1NUQVRFID0ge1xuICBhbmltYXRpb246IG51bGwsXG4gIHZpZXdwb3J0OiBudWxsLFxuICBzdGFydFZpZXdwb3J0OiBudWxsLFxuICBlbmRWaWV3cG9ydDogbnVsbFxufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVHJhbnNpdGlvbk1hbmFnZXIge1xuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgIHRoaXMucHJvcHMgPSBwcm9wcztcbiAgICB0aGlzLnN0YXRlID0gREVGQVVMVF9TVEFURTtcblxuICAgIHRoaXMuX29uVHJhbnNpdGlvbkZyYW1lID0gdGhpcy5fb25UcmFuc2l0aW9uRnJhbWUuYmluZCh0aGlzKTtcbiAgfVxuXG4gIC8vIFJldHVybnMgY3VycmVudCB0cmFuc2l0aW9uZWQgdmlld3BvcnQuXG4gIGdldFZpZXdwb3J0SW5UcmFuc2l0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnN0YXRlLnZpZXdwb3J0O1xuICB9XG5cbiAgLy8gUHJvY2VzcyB0aGUgdmV3aXBvcnQgY2hhbmdlLCBlaXRoZXIgaWdub3JlIG9yIHRyaWdnZXIgYSBuZXcgdHJhbnNpdG9uLlxuICBwcm9jZXNzVmlld3BvcnRDaGFuZ2UobmV4dFByb3BzKSB7XG5cbiAgICAvLyBOT1RFOiBCZSBjYXV0aW91cyByZS1vcmRlcmluZyBzdGF0ZW1lbnRzIGluIHRoaXMgZnVuY3Rpb24uXG4gICAgaWYgKHRoaXMuX3Nob3VsZElnbm9yZVZpZXdwb3J0Q2hhbmdlKG5leHRQcm9wcykpIHtcbiAgICAgIHRoaXMucHJvcHMgPSBuZXh0UHJvcHM7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgaXNUcmFuc2l0aW9uSW5Qcm9ncmVzcyA9IHRoaXMuX2lzVHJhbnNpdGlvbkluUHJvZ3Jlc3MoKTtcblxuICAgIGlmICh0aGlzLl9pc1RyYW5zaXRpb25FbmFibGVkKG5leHRQcm9wcykpIHtcbiAgICAgIGNvbnN0IGN1cnJlbnRWaWV3cG9ydCA9IHRoaXMuc3RhdGUudmlld3BvcnQgfHwgZXh0cmFjdFZpZXdwb3J0RnJvbSh0aGlzLnByb3BzKTtcbiAgICAgIGNvbnN0IGVuZFZpZXdwb3J0ID0gdGhpcy5zdGF0ZS5lbmRWaWV3cG9ydDtcblxuICAgICAgY29uc3Qgc3RhcnRWaWV3cG9ydCA9IHRoaXMuc3RhdGUuaW50ZXJydXB0aW9uID09PSBUUkFOU0lUSU9OX0VWRU5UUy5TTkFQX1RPX0VORCA/XG4gICAgICAgIChlbmRWaWV3cG9ydCB8fCBjdXJyZW50Vmlld3BvcnQpIDpcbiAgICAgICAgY3VycmVudFZpZXdwb3J0O1xuXG4gICAgICB0aGlzLl90cmlnZ2VyVHJhbnNpdGlvbihzdGFydFZpZXdwb3J0LCBuZXh0UHJvcHMpO1xuXG4gICAgICBpZiAoaXNUcmFuc2l0aW9uSW5Qcm9ncmVzcykge1xuICAgICAgICB0aGlzLnByb3BzLm9uVHJhbnNpdGlvbkludGVycnVwdCgpO1xuICAgICAgfVxuICAgICAgbmV4dFByb3BzLm9uVHJhbnNpdGlvblN0YXJ0KCk7XG4gICAgfSBlbHNlIGlmIChpc1RyYW5zaXRpb25JblByb2dyZXNzKSB7XG4gICAgICB0aGlzLnByb3BzLm9uVHJhbnNpdGlvbkludGVycnVwdCgpO1xuICAgICAgdGhpcy5fZW5kVHJhbnNpdGlvbigpO1xuICAgIH1cblxuICAgIHRoaXMucHJvcHMgPSBuZXh0UHJvcHM7XG4gIH1cblxuICAvLyBIZWxwZXIgbWV0aG9kc1xuXG4gIF9pc1RyYW5zaXRpb25JblByb2dyZXNzKCkge1xuICAgIHJldHVybiB0aGlzLnN0YXRlLnZpZXdwb3J0O1xuICB9XG5cbiAgX2lzVHJhbnNpdGlvbkVuYWJsZWQocHJvcHMpIHtcbiAgICByZXR1cm4gcHJvcHMudHJhbnNpdGlvbkR1cmF0aW9uID4gMDtcbiAgfVxuXG4gIF9pc1VwZGF0ZUR1ZVRvQ3VycmVudFRyYW5zaXRpb24ocHJvcHMpIHtcbiAgICBpZiAodGhpcy5zdGF0ZS52aWV3cG9ydCkge1xuICAgICAgcmV0dXJuIGFyZVZpZXdwb3J0c0VxdWFsKHByb3BzLCB0aGlzLnN0YXRlLnZpZXdwb3J0KTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgX3Nob3VsZElnbm9yZVZpZXdwb3J0Q2hhbmdlKG5leHRQcm9wcykge1xuICAgIC8vIElnbm9yZSB1cGRhdGUgaWYgaXQgaXMgZHVlIHRvIGN1cnJlbnQgYWN0aXZlIHRyYW5zaXRpb24uXG4gICAgLy8gSWdub3JlIHVwZGF0ZSBpZiBpdCBpcyByZXF1ZXN0ZWQgdG8gYmUgaWdub3JlZFxuICAgIGlmICh0aGlzLl9pc1RyYW5zaXRpb25JblByb2dyZXNzKCkpIHtcbiAgICAgIGlmICh0aGlzLnN0YXRlLmludGVycnVwdGlvbiA9PT0gVFJBTlNJVElPTl9FVkVOVFMuSUdOT1JFIHx8XG4gICAgICAgIHRoaXMuX2lzVXBkYXRlRHVlVG9DdXJyZW50VHJhbnNpdGlvbihuZXh0UHJvcHMpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoIXRoaXMuX2lzVHJhbnNpdGlvbkVuYWJsZWQobmV4dFByb3BzKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8gSWdub3JlIGlmIG5vbmUgb2YgdGhlIHZpZXdwb3J0IHByb3BzIGNoYW5nZWQuXG4gICAgaWYgKGFyZVZpZXdwb3J0c0VxdWFsKHRoaXMucHJvcHMsIG5leHRQcm9wcykpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIF90cmlnZ2VyVHJhbnNpdGlvbihzdGFydFZpZXdwb3J0LCBuZXh0UHJvcHMpIHtcbiAgICBhc3NlcnQobmV4dFByb3BzLnRyYW5zaXRpb25EdXJhdGlvbiAhPT0gMCk7XG4gICAgY29uc3QgZW5kVmlld3BvcnQgPSBleHRyYWN0Vmlld3BvcnRGcm9tKG5leHRQcm9wcyk7XG5cbiAgICBjYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLnN0YXRlLmFuaW1hdGlvbik7XG5cbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgLy8gU2F2ZSBjdXJyZW50IHRyYW5zaXRpb24gcHJvcHNcbiAgICAgIGR1cmF0aW9uOiBuZXh0UHJvcHMudHJhbnNpdGlvbkR1cmF0aW9uLFxuICAgICAgZWFzaW5nOiBuZXh0UHJvcHMudHJhbnNpdGlvbkVhc2luZyxcbiAgICAgIGludGVycG9sYXRvcjogbmV4dFByb3BzLnRyYW5zaXRpb25JbnRlcnBvbGF0b3IsXG4gICAgICBpbnRlcnJ1cHRpb246IG5leHRQcm9wcy50cmFuc2l0aW9uSW50ZXJydXB0aW9uLFxuXG4gICAgICBzdGFydFRpbWU6IERhdGUubm93KCksXG4gICAgICBzdGFydFZpZXdwb3J0LFxuICAgICAgZW5kVmlld3BvcnQsXG4gICAgICBhbmltYXRpb246IG51bGwsXG4gICAgICB2aWV3cG9ydDogc3RhcnRWaWV3cG9ydFxuICAgIH07XG5cbiAgICB0aGlzLl9vblRyYW5zaXRpb25GcmFtZSgpO1xuICB9XG5cbiAgX29uVHJhbnNpdGlvbkZyYW1lKCkge1xuICAgIC8vIF91cGRhdGVWaWV3cG9ydCgpIG1heSBjYW5jZWwgdGhlIGFuaW1hdGlvblxuICAgIHRoaXMuc3RhdGUuYW5pbWF0aW9uID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMuX29uVHJhbnNpdGlvbkZyYW1lKTtcbiAgICB0aGlzLl91cGRhdGVWaWV3cG9ydCgpO1xuICB9XG5cbiAgX2VuZFRyYW5zaXRpb24oKSB7XG4gICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5zdGF0ZS5hbmltYXRpb24pO1xuICAgIHRoaXMuc3RhdGUgPSBERUZBVUxUX1NUQVRFO1xuICB9XG5cbiAgX3VwZGF0ZVZpZXdwb3J0KCkge1xuICAgIC8vIE5PVEU6IEJlIGNhdXRpb3VzIHJlLW9yZGVyaW5nIHN0YXRlbWVudHMgaW4gdGhpcyBmdW5jdGlvbi5cbiAgICBjb25zdCBjdXJyZW50VGltZSA9IERhdGUubm93KCk7XG4gICAgY29uc3Qge3N0YXJ0VGltZSwgZHVyYXRpb24sIGVhc2luZywgaW50ZXJwb2xhdG9yLCBzdGFydFZpZXdwb3J0LCBlbmRWaWV3cG9ydH0gPSB0aGlzLnN0YXRlO1xuXG4gICAgbGV0IHNob3VsZEVuZCA9IGZhbHNlO1xuICAgIGxldCB0ID0gKGN1cnJlbnRUaW1lIC0gc3RhcnRUaW1lKSAvIGR1cmF0aW9uO1xuICAgIGlmICh0ID49IDEpIHtcbiAgICAgIHQgPSAxO1xuICAgICAgc2hvdWxkRW5kID0gdHJ1ZTtcbiAgICB9XG4gICAgdCA9IGVhc2luZyh0KTtcblxuICAgIGNvbnN0IHZpZXdwb3J0ID0gaW50ZXJwb2xhdG9yKHN0YXJ0Vmlld3BvcnQsIGVuZFZpZXdwb3J0LCB0KTtcbiAgICAgIC8vIE5vcm1hbGl6ZSB2aWV3cG9ydCBwcm9wc1xuICAgIGNvbnN0IG1hcFN0YXRlID0gbmV3IE1hcFN0YXRlKE9iamVjdC5hc3NpZ24oe30sIHRoaXMucHJvcHMsIHZpZXdwb3J0KSk7XG4gICAgdGhpcy5zdGF0ZS52aWV3cG9ydCA9IG1hcFN0YXRlLmdldFZpZXdwb3J0UHJvcHMoKTtcblxuICAgIGlmICh0aGlzLnByb3BzLm9uVmlld3BvcnRDaGFuZ2UpIHtcbiAgICAgIHRoaXMucHJvcHMub25WaWV3cG9ydENoYW5nZSh0aGlzLnN0YXRlLnZpZXdwb3J0KTtcbiAgICB9XG5cbiAgICBpZiAoc2hvdWxkRW5kKSB7XG4gICAgICB0aGlzLl9lbmRUcmFuc2l0aW9uKCk7XG4gICAgICB0aGlzLnByb3BzLm9uVHJhbnNpdGlvbkVuZCgpO1xuICAgIH1cbiAgfVxufVxuXG5UcmFuc2l0aW9uTWFuYWdlci5kZWZhdWx0UHJvcHMgPSBERUZBVUxUX1BST1BTO1xuIl19