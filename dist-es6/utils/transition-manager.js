var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* global requestAnimationFrame, cancelAnimationFrame */
import assert from 'assert';
import { viewportLinearInterpolator, extractViewportFrom, areViewportsEqual } from './viewport-transition-utils';
import MapState from './map-state';

var noop = function noop() {};

export var TRANSITION_EVENTS = {
  BREAK: 1,
  SNAP_TO_END: 2,
  IGNORE: 3
};

var DEFAULT_PROPS = {
  transitionDuration: 0,
  transitionInterpolator: viewportLinearInterpolator,
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
    _classCallCheck(this, TransitionManager);

    this.props = props;
    this.state = DEFAULT_STATE;

    this._onTransitionFrame = this._onTransitionFrame.bind(this);
  }

  // Returns current transitioned viewport.


  _createClass(TransitionManager, [{
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
        var currentViewport = this.state.viewport || extractViewportFrom(this.props);
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
        return areViewportsEqual(props, this.state.viewport);
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
      if (areViewportsEqual(this.props, nextProps)) {
        return true;
      }

      return false;
    }
  }, {
    key: '_triggerTransition',
    value: function _triggerTransition(startViewport, nextProps) {
      assert(nextProps.transitionDuration !== 0);
      var endViewport = extractViewportFrom(nextProps);

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
      var mapState = new MapState(Object.assign({}, this.props, viewport));
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

export default TransitionManager;


TransitionManager.defaultProps = DEFAULT_PROPS;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy90cmFuc2l0aW9uLW1hbmFnZXIuanMiXSwibmFtZXMiOlsiYXNzZXJ0Iiwidmlld3BvcnRMaW5lYXJJbnRlcnBvbGF0b3IiLCJleHRyYWN0Vmlld3BvcnRGcm9tIiwiYXJlVmlld3BvcnRzRXF1YWwiLCJNYXBTdGF0ZSIsIm5vb3AiLCJUUkFOU0lUSU9OX0VWRU5UUyIsIkJSRUFLIiwiU05BUF9UT19FTkQiLCJJR05PUkUiLCJERUZBVUxUX1BST1BTIiwidHJhbnNpdGlvbkR1cmF0aW9uIiwidHJhbnNpdGlvbkludGVycG9sYXRvciIsInRyYW5zaXRpb25FYXNpbmciLCJ0IiwidHJhbnNpdGlvbkludGVycnVwdGlvbiIsIm9uVHJhbnNpdGlvblN0YXJ0Iiwib25UcmFuc2l0aW9uSW50ZXJydXB0Iiwib25UcmFuc2l0aW9uRW5kIiwiREVGQVVMVF9TVEFURSIsImFuaW1hdGlvbiIsInZpZXdwb3J0Iiwic3RhcnRWaWV3cG9ydCIsImVuZFZpZXdwb3J0IiwiVHJhbnNpdGlvbk1hbmFnZXIiLCJwcm9wcyIsInN0YXRlIiwiX29uVHJhbnNpdGlvbkZyYW1lIiwiYmluZCIsIm5leHRQcm9wcyIsIl9zaG91bGRJZ25vcmVWaWV3cG9ydENoYW5nZSIsImlzVHJhbnNpdGlvbkluUHJvZ3Jlc3MiLCJfaXNUcmFuc2l0aW9uSW5Qcm9ncmVzcyIsIl9pc1RyYW5zaXRpb25FbmFibGVkIiwiY3VycmVudFZpZXdwb3J0IiwiaW50ZXJydXB0aW9uIiwiX3RyaWdnZXJUcmFuc2l0aW9uIiwiX2VuZFRyYW5zaXRpb24iLCJfaXNVcGRhdGVEdWVUb0N1cnJlbnRUcmFuc2l0aW9uIiwiY2FuY2VsQW5pbWF0aW9uRnJhbWUiLCJkdXJhdGlvbiIsImVhc2luZyIsImludGVycG9sYXRvciIsInN0YXJ0VGltZSIsIkRhdGUiLCJub3ciLCJyZXF1ZXN0QW5pbWF0aW9uRnJhbWUiLCJfdXBkYXRlVmlld3BvcnQiLCJjdXJyZW50VGltZSIsInNob3VsZEVuZCIsIm1hcFN0YXRlIiwiT2JqZWN0IiwiYXNzaWduIiwiZ2V0Vmlld3BvcnRQcm9wcyIsIm9uVmlld3BvcnRDaGFuZ2UiLCJkZWZhdWx0UHJvcHMiXSwibWFwcGluZ3MiOiI7Ozs7QUFBQTtBQUNBLE9BQU9BLE1BQVAsTUFBbUIsUUFBbkI7QUFDQSxTQUNFQywwQkFERixFQUVFQyxtQkFGRixFQUdFQyxpQkFIRixRQUlPLDZCQUpQO0FBS0EsT0FBT0MsUUFBUCxNQUFxQixhQUFyQjs7QUFFQSxJQUFNQyxPQUFPLFNBQVBBLElBQU8sR0FBTSxDQUFFLENBQXJCOztBQUVBLE9BQU8sSUFBTUMsb0JBQW9CO0FBQy9CQyxTQUFPLENBRHdCO0FBRS9CQyxlQUFhLENBRmtCO0FBRy9CQyxVQUFRO0FBSHVCLENBQTFCOztBQU1QLElBQU1DLGdCQUFnQjtBQUNwQkMsc0JBQW9CLENBREE7QUFFcEJDLDBCQUF3QlgsMEJBRko7QUFHcEJZLG9CQUFrQjtBQUFBLFdBQUtDLENBQUw7QUFBQSxHQUhFO0FBSXBCQywwQkFBd0JULGtCQUFrQkMsS0FKdEI7QUFLcEJTLHFCQUFtQlgsSUFMQztBQU1wQlkseUJBQXVCWixJQU5IO0FBT3BCYSxtQkFBaUJiO0FBUEcsQ0FBdEI7O0FBVUEsSUFBTWMsZ0JBQWdCO0FBQ3BCQyxhQUFXLElBRFM7QUFFcEJDLFlBQVUsSUFGVTtBQUdwQkMsaUJBQWUsSUFISztBQUlwQkMsZUFBYTtBQUpPLENBQXRCOztJQU9xQkMsaUI7QUFDbkIsNkJBQVlDLEtBQVosRUFBbUI7QUFBQTs7QUFDakIsU0FBS0EsS0FBTCxHQUFhQSxLQUFiO0FBQ0EsU0FBS0MsS0FBTCxHQUFhUCxhQUFiOztBQUVBLFNBQUtRLGtCQUFMLEdBQTBCLEtBQUtBLGtCQUFMLENBQXdCQyxJQUF4QixDQUE2QixJQUE3QixDQUExQjtBQUNEOztBQUVEOzs7Ozs4Q0FDMEI7QUFDeEIsYUFBTyxLQUFLRixLQUFMLENBQVdMLFFBQWxCO0FBQ0Q7O0FBRUQ7Ozs7MENBQ3NCUSxTLEVBQVc7O0FBRS9CO0FBQ0EsVUFBSSxLQUFLQywy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Iiwic291cmNlc0NvbnRlbnQiOlsiLyogZ2xvYmFsIHJlcXVlc3RBbmltYXRpb25GcmFtZSwgY2FuY2VsQW5pbWF0aW9uRnJhbWUgKi9cbmltcG9ydCBhc3NlcnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB7XG4gIHZpZXdwb3J0TGluZWFySW50ZXJwb2xhdG9yLFxuICBleHRyYWN0Vmlld3BvcnRGcm9tLFxuICBhcmVWaWV3cG9ydHNFcXVhbFxufSBmcm9tICcuL3ZpZXdwb3J0LXRyYW5zaXRpb24tdXRpbHMnO1xuaW1wb3J0IE1hcFN0YXRlIGZyb20gJy4vbWFwLXN0YXRlJztcblxuY29uc3Qgbm9vcCA9ICgpID0+IHt9O1xuXG5leHBvcnQgY29uc3QgVFJBTlNJVElPTl9FVkVOVFMgPSB7XG4gIEJSRUFLOiAxLFxuICBTTkFQX1RPX0VORDogMixcbiAgSUdOT1JFOiAzXG59O1xuXG5jb25zdCBERUZBVUxUX1BST1BTID0ge1xuICB0cmFuc2l0aW9uRHVyYXRpb246IDAsXG4gIHRyYW5zaXRpb25JbnRlcnBvbGF0b3I6IHZpZXdwb3J0TGluZWFySW50ZXJwb2xhdG9yLFxuICB0cmFuc2l0aW9uRWFzaW5nOiB0ID0+IHQsXG4gIHRyYW5zaXRpb25JbnRlcnJ1cHRpb246IFRSQU5TSVRJT05fRVZFTlRTLkJSRUFLLFxuICBvblRyYW5zaXRpb25TdGFydDogbm9vcCxcbiAgb25UcmFuc2l0aW9uSW50ZXJydXB0OiBub29wLFxuICBvblRyYW5zaXRpb25FbmQ6IG5vb3Bcbn07XG5cbmNvbnN0IERFRkFVTFRfU1RBVEUgPSB7XG4gIGFuaW1hdGlvbjogbnVsbCxcbiAgdmlld3BvcnQ6IG51bGwsXG4gIHN0YXJ0Vmlld3BvcnQ6IG51bGwsXG4gIGVuZFZpZXdwb3J0OiBudWxsXG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUcmFuc2l0aW9uTWFuYWdlciB7XG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgdGhpcy5wcm9wcyA9IHByb3BzO1xuICAgIHRoaXMuc3RhdGUgPSBERUZBVUxUX1NUQVRFO1xuXG4gICAgdGhpcy5fb25UcmFuc2l0aW9uRnJhbWUgPSB0aGlzLl9vblRyYW5zaXRpb25GcmFtZS5iaW5kKHRoaXMpO1xuICB9XG5cbiAgLy8gUmV0dXJucyBjdXJyZW50IHRyYW5zaXRpb25lZCB2aWV3cG9ydC5cbiAgZ2V0Vmlld3BvcnRJblRyYW5zaXRpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUudmlld3BvcnQ7XG4gIH1cblxuICAvLyBQcm9jZXNzIHRoZSB2ZXdpcG9ydCBjaGFuZ2UsIGVpdGhlciBpZ25vcmUgb3IgdHJpZ2dlciBhIG5ldyB0cmFuc2l0b24uXG4gIHByb2Nlc3NWaWV3cG9ydENoYW5nZShuZXh0UHJvcHMpIHtcblxuICAgIC8vIE5PVEU6IEJlIGNhdXRpb3VzIHJlLW9yZGVyaW5nIHN0YXRlbWVudHMgaW4gdGhpcyBmdW5jdGlvbi5cbiAgICBpZiAodGhpcy5fc2hvdWxkSWdub3JlVmlld3BvcnRDaGFuZ2UobmV4dFByb3BzKSkge1xuICAgICAgdGhpcy5wcm9wcyA9IG5leHRQcm9wcztcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBpc1RyYW5zaXRpb25JblByb2dyZXNzID0gdGhpcy5faXNUcmFuc2l0aW9uSW5Qcm9ncmVzcygpO1xuXG4gICAgaWYgKHRoaXMuX2lzVHJhbnNpdGlvbkVuYWJsZWQobmV4dFByb3BzKSkge1xuICAgICAgY29uc3QgY3VycmVudFZpZXdwb3J0ID0gdGhpcy5zdGF0ZS52aWV3cG9ydCB8fCBleHRyYWN0Vmlld3BvcnRGcm9tKHRoaXMucHJvcHMpO1xuICAgICAgY29uc3QgZW5kVmlld3BvcnQgPSB0aGlzLnN0YXRlLmVuZFZpZXdwb3J0O1xuXG4gICAgICBjb25zdCBzdGFydFZpZXdwb3J0ID0gdGhpcy5zdGF0ZS5pbnRlcnJ1cHRpb24gPT09IFRSQU5TSVRJT05fRVZFTlRTLlNOQVBfVE9fRU5EID9cbiAgICAgICAgKGVuZFZpZXdwb3J0IHx8IGN1cnJlbnRWaWV3cG9ydCkgOlxuICAgICAgICBjdXJyZW50Vmlld3BvcnQ7XG5cbiAgICAgIHRoaXMuX3RyaWdnZXJUcmFuc2l0aW9uKHN0YXJ0Vmlld3BvcnQsIG5leHRQcm9wcyk7XG5cbiAgICAgIGlmIChpc1RyYW5zaXRpb25JblByb2dyZXNzKSB7XG4gICAgICAgIHRoaXMucHJvcHMub25UcmFuc2l0aW9uSW50ZXJydXB0KCk7XG4gICAgICB9XG4gICAgICBuZXh0UHJvcHMub25UcmFuc2l0aW9uU3RhcnQoKTtcbiAgICB9IGVsc2UgaWYgKGlzVHJhbnNpdGlvbkluUHJvZ3Jlc3MpIHtcbiAgICAgIHRoaXMucHJvcHMub25UcmFuc2l0aW9uSW50ZXJydXB0KCk7XG4gICAgICB0aGlzLl9lbmRUcmFuc2l0aW9uKCk7XG4gICAgfVxuXG4gICAgdGhpcy5wcm9wcyA9IG5leHRQcm9wcztcbiAgfVxuXG4gIC8vIEhlbHBlciBtZXRob2RzXG5cbiAgX2lzVHJhbnNpdGlvbkluUHJvZ3Jlc3MoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUudmlld3BvcnQ7XG4gIH1cblxuICBfaXNUcmFuc2l0aW9uRW5hYmxlZChwcm9wcykge1xuICAgIHJldHVybiBwcm9wcy50cmFuc2l0aW9uRHVyYXRpb24gPiAwO1xuICB9XG5cbiAgX2lzVXBkYXRlRHVlVG9DdXJyZW50VHJhbnNpdGlvbihwcm9wcykge1xuICAgIGlmICh0aGlzLnN0YXRlLnZpZXdwb3J0KSB7XG4gICAgICByZXR1cm4gYXJlVmlld3BvcnRzRXF1YWwocHJvcHMsIHRoaXMuc3RhdGUudmlld3BvcnQpO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBfc2hvdWxkSWdub3JlVmlld3BvcnRDaGFuZ2UobmV4dFByb3BzKSB7XG4gICAgLy8gSWdub3JlIHVwZGF0ZSBpZiBpdCBpcyBkdWUgdG8gY3VycmVudCBhY3RpdmUgdHJhbnNpdGlvbi5cbiAgICAvLyBJZ25vcmUgdXBkYXRlIGlmIGl0IGlzIHJlcXVlc3RlZCB0byBiZSBpZ25vcmVkXG4gICAgaWYgKHRoaXMuX2lzVHJhbnNpdGlvbkluUHJvZ3Jlc3MoKSkge1xuICAgICAgaWYgKHRoaXMuc3RhdGUuaW50ZXJydXB0aW9uID09PSBUUkFOU0lUSU9OX0VWRU5UUy5JR05PUkUgfHxcbiAgICAgICAgdGhpcy5faXNVcGRhdGVEdWVUb0N1cnJlbnRUcmFuc2l0aW9uKG5leHRQcm9wcykpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICghdGhpcy5faXNUcmFuc2l0aW9uRW5hYmxlZChuZXh0UHJvcHMpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBJZ25vcmUgaWYgbm9uZSBvZiB0aGUgdmlld3BvcnQgcHJvcHMgY2hhbmdlZC5cbiAgICBpZiAoYXJlVmlld3BvcnRzRXF1YWwodGhpcy5wcm9wcywgbmV4dFByb3BzKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgX3RyaWdnZXJUcmFuc2l0aW9uKHN0YXJ0Vmlld3BvcnQsIG5leHRQcm9wcykge1xuICAgIGFzc2VydChuZXh0UHJvcHMudHJhbnNpdGlvbkR1cmF0aW9uICE9PSAwKTtcbiAgICBjb25zdCBlbmRWaWV3cG9ydCA9IGV4dHJhY3RWaWV3cG9ydEZyb20obmV4dFByb3BzKTtcblxuICAgIGNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuc3RhdGUuYW5pbWF0aW9uKTtcblxuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAvLyBTYXZlIGN1cnJlbnQgdHJhbnNpdGlvbiBwcm9wc1xuICAgICAgZHVyYXRpb246IG5leHRQcm9wcy50cmFuc2l0aW9uRHVyYXRpb24sXG4gICAgICBlYXNpbmc6IG5leHRQcm9wcy50cmFuc2l0aW9uRWFzaW5nLFxuICAgICAgaW50ZXJwb2xhdG9yOiBuZXh0UHJvcHMudHJhbnNpdGlvbkludGVycG9sYXRvcixcbiAgICAgIGludGVycnVwdGlvbjogbmV4dFByb3BzLnRyYW5zaXRpb25JbnRlcnJ1cHRpb24sXG5cbiAgICAgIHN0YXJ0VGltZTogRGF0ZS5ub3coKSxcbiAgICAgIHN0YXJ0Vmlld3BvcnQsXG4gICAgICBlbmRWaWV3cG9ydCxcbiAgICAgIGFuaW1hdGlvbjogbnVsbCxcbiAgICAgIHZpZXdwb3J0OiBzdGFydFZpZXdwb3J0XG4gICAgfTtcblxuICAgIHRoaXMuX29uVHJhbnNpdGlvbkZyYW1lKCk7XG4gIH1cblxuICBfb25UcmFuc2l0aW9uRnJhbWUoKSB7XG4gICAgLy8gX3VwZGF0ZVZpZXdwb3J0KCkgbWF5IGNhbmNlbCB0aGUgYW5pbWF0aW9uXG4gICAgdGhpcy5zdGF0ZS5hbmltYXRpb24gPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5fb25UcmFuc2l0aW9uRnJhbWUpO1xuICAgIHRoaXMuX3VwZGF0ZVZpZXdwb3J0KCk7XG4gIH1cblxuICBfZW5kVHJhbnNpdGlvbigpIHtcbiAgICBjYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLnN0YXRlLmFuaW1hdGlvbik7XG4gICAgdGhpcy5zdGF0ZSA9IERFRkFVTFRfU1RBVEU7XG4gIH1cblxuICBfdXBkYXRlVmlld3BvcnQoKSB7XG4gICAgLy8gTk9URTogQmUgY2F1dGlvdXMgcmUtb3JkZXJpbmcgc3RhdGVtZW50cyBpbiB0aGlzIGZ1bmN0aW9uLlxuICAgIGNvbnN0IGN1cnJlbnRUaW1lID0gRGF0ZS5ub3coKTtcbiAgICBjb25zdCB7c3RhcnRUaW1lLCBkdXJhdGlvbiwgZWFzaW5nLCBpbnRlcnBvbGF0b3IsIHN0YXJ0Vmlld3BvcnQsIGVuZFZpZXdwb3J0fSA9IHRoaXMuc3RhdGU7XG5cbiAgICBsZXQgc2hvdWxkRW5kID0gZmFsc2U7XG4gICAgbGV0IHQgPSAoY3VycmVudFRpbWUgLSBzdGFydFRpbWUpIC8gZHVyYXRpb247XG4gICAgaWYgKHQgPj0gMSkge1xuICAgICAgdCA9IDE7XG4gICAgICBzaG91bGRFbmQgPSB0cnVlO1xuICAgIH1cbiAgICB0ID0gZWFzaW5nKHQpO1xuXG4gICAgY29uc3Qgdmlld3BvcnQgPSBpbnRlcnBvbGF0b3Ioc3RhcnRWaWV3cG9ydCwgZW5kVmlld3BvcnQsIHQpO1xuICAgICAgLy8gTm9ybWFsaXplIHZpZXdwb3J0IHByb3BzXG4gICAgY29uc3QgbWFwU3RhdGUgPSBuZXcgTWFwU3RhdGUoT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5wcm9wcywgdmlld3BvcnQpKTtcbiAgICB0aGlzLnN0YXRlLnZpZXdwb3J0ID0gbWFwU3RhdGUuZ2V0Vmlld3BvcnRQcm9wcygpO1xuXG4gICAgaWYgKHRoaXMucHJvcHMub25WaWV3cG9ydENoYW5nZSkge1xuICAgICAgdGhpcy5wcm9wcy5vblZpZXdwb3J0Q2hhbmdlKHRoaXMuc3RhdGUudmlld3BvcnQpO1xuICAgIH1cblxuICAgIGlmIChzaG91bGRFbmQpIHtcbiAgICAgIHRoaXMuX2VuZFRyYW5zaXRpb24oKTtcbiAgICAgIHRoaXMucHJvcHMub25UcmFuc2l0aW9uRW5kKCk7XG4gICAgfVxuICB9XG59XG5cblRyYW5zaXRpb25NYW5hZ2VyLmRlZmF1bHRQcm9wcyA9IERFRkFVTFRfUFJPUFM7XG4iXX0=