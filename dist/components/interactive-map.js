'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _react = require('react');

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _autobind = require('../utils/autobind');

var _autobind2 = _interopRequireDefault(_autobind);

var _staticMap = require('./static-map');

var _staticMap2 = _interopRequireDefault(_staticMap);

var _mapState = require('../utils/map-state');

var _viewportMercatorProject = require('viewport-mercator-project');

var _transitionManager = require('../utils/transition-manager');

var _transitionManager2 = _interopRequireDefault(_transitionManager);

var _mjolnir = require('mjolnir.js');

var _mapControls = require('../utils/map-controls');

var _mapControls2 = _interopRequireDefault(_mapControls);

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

var _deprecateWarn = require('../utils/deprecate-warn');

var _deprecateWarn2 = _interopRequireDefault(_deprecateWarn);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var propTypes = (0, _assign2.default)({}, _staticMap2.default.propTypes, {
  // Additional props on top of StaticMap

  /** Viewport constraints */
  // Max zoom level
  maxZoom: _propTypes2.default.number,
  // Min zoom level
  minZoom: _propTypes2.default.number,
  // Max pitch in degrees
  maxPitch: _propTypes2.default.number,
  // Min pitch in degrees
  minPitch: _propTypes2.default.number,

  /**
   * `onViewportChange` callback is fired when the user interacted with the
   * map. The object passed to the callback contains viewport properties
   * such as `longitude`, `latitude`, `zoom` etc.
   */
  onViewportChange: _propTypes2.default.func,

  /** Viewport transition **/
  // transition duration for viewport change
  transitionDuration: _propTypes2.default.number,
  // function called for each transition step, can be used to perform custom transitions.
  transitionInterpolator: _propTypes2.default.func,
  // type of interruption of current transition on update.
  transitionInterruption: _propTypes2.default.number,
  // easing function
  transitionEasing: _propTypes2.default.func,
  // transition status update functions
  onTransitionStart: _propTypes2.default.func,
  onTransitionInterrupt: _propTypes2.default.func,
  onTransitionEnd: _propTypes2.default.func,

  /** Enables control event handling */
  // Scroll to zoom
  scrollZoom: _propTypes2.default.bool,
  // Drag to pan
  dragPan: _propTypes2.default.bool,
  // Drag to rotate
  dragRotate: _propTypes2.default.bool,
  // Double click to zoom
  doubleClickZoom: _propTypes2.default.bool,
  // Pinch to zoom / rotate
  touchZoomRotate: _propTypes2.default.bool,
  // Keyboard
  keyboard: _propTypes2.default.bool,

  /**
     * Called when the map is hovered over.
     * @callback
     * @param {Object} event - The mouse event.
     * @param {[Number, Number]} event.lngLat - The coordinates of the pointer
     * @param {Array} event.features - The features under the pointer, using Mapbox's
     * queryRenderedFeatures API:
     * https://www.mapbox.com/mapbox-gl-js/api/#Map#queryRenderedFeatures
     * To make a layer interactive, set the `interactive` property in the
     * layer style to `true`. See Mapbox's style spec
     * https://www.mapbox.com/mapbox-gl-style-spec/#layer-interactive
     */
  onHover: _propTypes2.default.func,
  /**
    * Called when the map is clicked.
    * @callback
    * @param {Object} event - The mouse event.
    * @param {[Number, Number]} event.lngLat - The coordinates of the pointer
    * @param {Array} event.features - The features under the pointer, using Mapbox's
    * queryRenderedFeatures API:
    * https://www.mapbox.com/mapbox-gl-js/api/#Map#queryRenderedFeatures
    * To make a layer interactive, set the `interactive` property in the
    * layer style to `true`. See Mapbox's style spec
    * https://www.mapbox.com/mapbox-gl-style-spec/#layer-interactive
    */
  onClick: _propTypes2.default.func,

  /** Radius to detect features around a clicked point. Defaults to 0. */
  clickRadius: _propTypes2.default.number,

  /** Accessor that returns a cursor style to show interactive state */
  getCursor: _propTypes2.default.func,

  /** Advanced features */
  // Contraints for displaying the map. If not met, then the map is hidden.
  // Experimental! May be changed in minor version updates.
  visibilityConstraints: _propTypes2.default.shape({
    minZoom: _propTypes2.default.number,
    maxZoom: _propTypes2.default.number,
    minPitch: _propTypes2.default.number,
    maxPitch: _propTypes2.default.number
  }),
  // A map control instance to replace the default map controls
  // The object must expose one property: `events` as an array of subscribed
  // event names; and two methods: `setState(state)` and `handle(event)`
  mapControls: _propTypes2.default.shape({
    events: _propTypes2.default.arrayOf(_propTypes2.default.string),
    handleEvent: _propTypes2.default.func
  })
});

var getDefaultCursor = function getDefaultCursor(_ref) {
  var isDragging = _ref.isDragging,
      isHovering = _ref.isHovering;
  return isDragging ? _config2.default.CURSOR.GRABBING : isHovering ? _config2.default.CURSOR.POINTER : _config2.default.CURSOR.GRAB;
};

var defaultProps = (0, _assign2.default)({}, _staticMap2.default.defaultProps, _mapState.MAPBOX_LIMITS, _transitionManager2.default.defaultProps, {
  onViewportChange: null,
  onClick: null,
  onHover: null,

  scrollZoom: true,
  dragPan: true,
  dragRotate: true,
  doubleClickZoom: true,
  touchZoomRotate: true,

  clickRadius: 0,
  getCursor: getDefaultCursor,

  visibilityConstraints: _mapState.MAPBOX_LIMITS
});

var childContextTypes = {
  viewport: _propTypes2.default.instanceOf(_viewportMercatorProject.PerspectiveMercatorViewport),
  isDragging: _propTypes2.default.bool,
  eventManager: _propTypes2.default.object
};

var InteractiveMap = function (_PureComponent) {
  (0, _inherits3.default)(InteractiveMap, _PureComponent);
  (0, _createClass3.default)(InteractiveMap, null, [{
    key: 'supported',
    value: function supported() {
      return _staticMap2.default.supported();
    }
  }]);

  function InteractiveMap(props) {
    (0, _classCallCheck3.default)(this, InteractiveMap);

    var _this = (0, _possibleConstructorReturn3.default)(this, (InteractiveMap.__proto__ || (0, _getPrototypeOf2.default)(InteractiveMap)).call(this, props));

    (0, _autobind2.default)(_this);
    // Check for deprecated props
    (0, _deprecateWarn2.default)(props);

    _this.state = {
      // Whether the cursor is down
      isDragging: false,
      // Whether the cursor is over a clickable feature
      isHovering: false
    };

    // If props.mapControls is not provided, fallback to default MapControls instance
    // Cannot use defaultProps here because it needs to be per map instance
    _this._mapControls = props.mapControls || new _mapControls2.default();
    return _this;
  }

  (0, _createClass3.default)(InteractiveMap, [{
    key: 'getChildContext',
    value: function getChildContext() {
      return {
        viewport: new _viewportMercatorProject.PerspectiveMercatorViewport(this.props),
        isDragging: this.state.isDragging,
        eventManager: this._eventManager
      };
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var eventManager = new _mjolnir.EventManager(this._eventCanvas, { rightButton: true });

      // Register additional event handlers for click and hover
      eventManager.on('mousemove', this._onMouseMove);
      eventManager.on('click', this._onMouseClick);
      this._eventManager = eventManager;

      this._mapControls.setOptions((0, _assign2.default)({}, this.props, {
        onStateChange: this._onInteractiveStateChange,
        eventManager: eventManager
      }));

      this._transitionManager = new _transitionManager2.default(this.props);
    }
  }, {
    key: 'componentWillUpdate',
    value: function componentWillUpdate(nextProps) {
      this._mapControls.setOptions(nextProps);
      this._transitionManager.processViewportChange(nextProps);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      if (this._eventManager) {
        // Must destroy because hammer adds event listeners to window
        this._eventManager.destroy();
      }
    }
  }, {
    key: 'getMap',
    value: function getMap() {
      return this._map.getMap();
    }
  }, {
    key: 'queryRenderedFeatures',
    value: function queryRenderedFeatures(geometry, options) {
      return this._map.queryRenderedFeatures(geometry, options);
    }

    // Checks a visibilityConstraints object to see if the map should be displayed

  }, {
    key: '_checkVisibilityConstraints',
    value: function _checkVisibilityConstraints(props) {
      var capitalize = function capitalize(s) {
        return s[0].toUpperCase() + s.slice(1);
      };

      var visibilityConstraints = props.visibilityConstraints;

      for (var propName in props) {
        var capitalizedPropName = capitalize(propName);
        var minPropName = 'min' + capitalizedPropName;
        var maxPropName = 'max' + capitalizedPropName;

        if (minPropName in visibilityConstraints && props[propName] < visibilityConstraints[minPropName]) {
          return false;
        }
        if (maxPropName in visibilityConstraints && props[propName] > visibilityConstraints[maxPropName]) {
          return false;
        }
      }
      return true;
    }
  }, {
    key: '_getFeatures',
    value: function _getFeatures(_ref2) {
      var pos = _ref2.pos,
          radius = _ref2.radius;

      var features = void 0;
      if (radius) {
        // Radius enables point features, like marker symbols, to be clicked.
        var size = radius;
        var bbox = [[pos[0] - size, pos[1] + size], [pos[0] + size, pos[1] - size]];
        features = this._map.queryRenderedFeatures(bbox);
      } else {
        features = this._map.queryRenderedFeatures(pos);
      }
      return features;
    }
  }, {
    key: '_onInteractiveStateChange',
    value: function _onInteractiveStateChange(_ref3) {
      var _ref3$isDragging = _ref3.isDragging,
          isDragging = _ref3$isDragging === undefined ? false : _ref3$isDragging;

      if (isDragging !== this.state.isDragging) {
        this.setState({ isDragging: isDragging });
      }
    }

    // HOVER AND CLICK

  }, {
    key: '_getPos',
    value: function _getPos(event) {
      var _event$offsetCenter = event.offsetCenter,
          x = _event$offsetCenter.x,
          y = _event$offsetCenter.y;

      return [x, y];
    }
  }, {
    key: '_onMouseMove',
    value: function _onMouseMove(event) {
      if (!this.state.isDragging) {
        var pos = this._getPos(event);
        var features = this._getFeatures({ pos: pos, radius: this.props.clickRadius });

        var isHovering = features && features.length > 0;
        if (isHovering !== this.state.isHovering) {
          this.setState({ isHovering: isHovering });
        }

        if (this.props.onHover) {
          var viewport = new _viewportMercatorProject.PerspectiveMercatorViewport(this.props);
          event.lngLat = viewport.unproject(pos);
          event.features = features;

          this.props.onHover(event);
        }
      }
    }
  }, {
    key: '_onMouseClick',
    value: function _onMouseClick(event) {
      if (this.props.onClick) {
        var pos = this._getPos(event);
        var viewport = new _viewportMercatorProject.PerspectiveMercatorViewport(this.props);
        event.lngLat = viewport.unproject(pos);
        event.features = this._getFeatures({ pos: pos, radius: this.props.clickRadius });

        this.props.onClick(event);
      }
    }
  }, {
    key: '_eventCanvasLoaded',
    value: function _eventCanvasLoaded(ref) {
      this._eventCanvas = ref;
    }
  }, {
    key: '_staticMapLoaded',
    value: function _staticMapLoaded(ref) {
      this._map = ref;
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props,
          width = _props.width,
          height = _props.height,
          getCursor = _props.getCursor;


      var eventCanvasStyle = {
        width: width,
        height: height,
        position: 'relative',
        cursor: getCursor(this.state)
      };

      return (0, _react.createElement)('div', {
        key: 'map-controls',
        ref: this._eventCanvasLoaded,
        style: eventCanvasStyle
      }, (0, _react.createElement)(_staticMap2.default, (0, _assign2.default)({}, this.props, this._transitionManager && this._transitionManager.getViewportInTransition(), {
        visible: this._checkVisibilityConstraints(this.props),
        ref: this._staticMapLoaded,
        children: this._eventManager ? this.props.children : null
      })));
    }
  }]);
  return InteractiveMap;
}(_react.PureComponent);

exports.default = InteractiveMap;


InteractiveMap.displayName = 'InteractiveMap';
InteractiveMap.propTypes = propTypes;
InteractiveMap.defaultProps = defaultProps;
InteractiveMap.childContextTypes = childContextTypes;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21wb25lbnRzL2ludGVyYWN0aXZlLW1hcC5qcyJdLCJuYW1lcyI6WyJwcm9wVHlwZXMiLCJtYXhab29tIiwibnVtYmVyIiwibWluWm9vbSIsIm1heFBpdGNoIiwibWluUGl0Y2giLCJvblZpZXdwb3J0Q2hhbmdlIiwiZnVuYyIsInRyYW5zaXRpb25EdXJhdGlvbiIsInRyYW5zaXRpb25JbnRlcnBvbGF0b3IiLCJ0cmFuc2l0aW9uSW50ZXJydXB0aW9uIiwidHJhbnNpdGlvbkVhc2luZyIsIm9uVHJhbnNpdGlvblN0YXJ0Iiwib25UcmFuc2l0aW9uSW50ZXJydXB0Iiwib25UcmFuc2l0aW9uRW5kIiwic2Nyb2xsWm9vbSIsImJvb2wiLCJkcmFnUGFuIiwiZHJhZ1JvdGF0ZSIsImRvdWJsZUNsaWNrWm9vbSIsInRvdWNoWm9vbVJvdGF0ZSIsImtleWJvYXJkIiwib25Ib3ZlciIsIm9uQ2xpY2siLCJjbGlja1JhZGl1cyIsImdldEN1cnNvciIsInZpc2liaWxpdHlDb25zdHJhaW50cyIsInNoYXBlIiwibWFwQ29udHJvbHMiLCJldmVudHMiLCJhcnJheU9mIiwic3RyaW5nIiwiaGFuZGxlRXZlbnQiLCJnZXREZWZhdWx0Q3Vyc29yIiwiaXNEcmFnZ2luZyIsImlzSG92ZXJpbmciLCJDVVJTT1IiLCJHUkFCQklORyIsIlBPSU5URVIiLCJHUkFCIiwiZGVmYXVsdFByb3BzIiwiY2hpbGRDb250ZXh0VHlwZXMiLCJ2aWV3cG9ydCIsImluc3RhbmNlT2YiLCJldmVudE1hbmFnZXIiLCJvYmplY3QiLCJJbnRlcmFjdGl2ZU1hcCIsInN1cHBvcnRlZCIsInByb3BzIiwic3RhdGUiLCJfbWFwQ29udHJvbHMiLCJfZXZlbnRNYW5hZ2VyIiwiX2V2ZW50Q2FudmFzIiwicmlnaHRCdXR0b24iLCJvbiIsIl9vbk1vdXNlTW92ZSIsIl9vbk1vdXNlQ2xpY2siLCJzZXRPcHRpb25zIiwib25TdGF0ZUNoYW5nZSIsIl9vbkludGVyYWN0aXZlU3RhdGVDaGFuZ2UiLCJfdHJhbnNpdGlvbk1hbmFnZXIiLCJuZXh0UHJvcHMiLCJwcm9jZXNzVmlld3BvcnRDaGFuZ2UiLCJkZXN0cm95IiwiX21hcCIsImdldE1hcCIsImdlb21ldHJ5Iiwib3B0aW9ucyIsInF1ZXJ5UmVuZGVyZWRGZWF0dXJlcyIsImNhcGl0YWxpemUiLCJzIiwidG9VcHBlckNhc2UiLCJzbGljZSIsInByb3BOYW1lIiwiY2FwaXRhbGl6ZWRQcm9wTmFtZSIsIm1pblByb3BOYW1lIiwibWF4UHJvcE5hbWUiLCJwb3MiLCJyYWRpdXMiLCJmZWF0dXJlcyIsInNpemUiLCJiYm94Iiwic2V0U3RhdGUiLCJldmVudCIsIm9mZnNldENlbnRlciIsIngiLCJ5IiwiX2dldFBvcyIsIl9nZXRGZWF0dXJlcyIsImxlbmd0aCIsImxuZ0xhdCIsInVucHJvamVjdCIsInJlZiIsIndpZHRoIiwiaGVpZ2h0IiwiZXZlbnRDYW52YXNTdHlsZSIsInBvc2l0aW9uIiwiY3Vyc29yIiwia2V5IiwiX2V2ZW50Q2FudmFzTG9hZGVkIiwic3R5bGUiLCJnZXRWaWV3cG9ydEluVHJhbnNpdGlvbiIsInZpc2libGUiLCJfY2hlY2tWaXNpYmlsaXR5Q29uc3RyYWludHMiLCJfc3RhdGljTWFwTG9hZGVkIiwiY2hpbGRyZW4iLCJkaXNwbGF5TmFtZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7O0FBQ0E7Ozs7QUFDQTs7OztBQUVBOzs7O0FBQ0E7O0FBQ0E7O0FBRUE7Ozs7QUFFQTs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7OztBQUVBLElBQU1BLFlBQVksc0JBQWMsRUFBZCxFQUFrQixvQkFBVUEsU0FBNUIsRUFBdUM7QUFDdkQ7O0FBRUE7QUFDQTtBQUNBQyxXQUFTLG9CQUFVQyxNQUxvQztBQU12RDtBQUNBQyxXQUFTLG9CQUFVRCxNQVBvQztBQVF2RDtBQUNBRSxZQUFVLG9CQUFVRixNQVRtQztBQVV2RDtBQUNBRyxZQUFVLG9CQUFVSCxNQVhtQzs7QUFhdkQ7Ozs7O0FBS0FJ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dkQsS0FBdEMsQ0FEWDtBQUVFNEMsYUFBSyxLQUFLWSxnQkFGWjtBQUdFQyxrQkFBVSxLQUFLdEQsYUFBTCxHQUFxQixLQUFLSCxLQUFMLENBQVd5RCxRQUFoQyxHQUEyQztBQUh2RCxPQUZ1QixDQUF6QixDQUxGLENBREY7QUFnQkQ7Ozs7O2tCQXBMa0IzRCxjOzs7QUF1THJCQSxlQUFlNEQsV0FBZixHQUE2QixnQkFBN0I7QUFDQTVELGVBQWU5QyxTQUFmLEdBQTJCQSxTQUEzQjtBQUNBOEMsZUFBZU4sWUFBZixHQUE4QkEsWUFBOUI7QUFDQU0sZUFBZUwsaUJBQWYsR0FBbUNBLGlCQUFuQyIsImZpbGUiOiJpbnRlcmFjdGl2ZS1tYXAuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1B1cmVDb21wb25lbnQsIGNyZWF0ZUVsZW1lbnR9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgYXV0b2JpbmQgZnJvbSAnLi4vdXRpbHMvYXV0b2JpbmQnO1xuXG5pbXBvcnQgU3RhdGljTWFwIGZyb20gJy4vc3RhdGljLW1hcCc7XG5pbXBvcnQge01BUEJPWF9MSU1JVFN9IGZyb20gJy4uL3V0aWxzL21hcC1zdGF0ZSc7XG5pbXBvcnQge1BlcnNwZWN0aXZlTWVyY2F0b3JWaWV3cG9ydH0gZnJvbSAndmlld3BvcnQtbWVyY2F0b3ItcHJvamVjdCc7XG5cbmltcG9ydCBUcmFuc2l0aW9uTWFuYWdlciBmcm9tICcuLi91dGlscy90cmFuc2l0aW9uLW1hbmFnZXInO1xuXG5pbXBvcnQge0V2ZW50TWFuYWdlcn0gZnJvbSAnbWpvbG5pci5qcyc7XG5pbXBvcnQgTWFwQ29udHJvbHMgZnJvbSAnLi4vdXRpbHMvbWFwLWNvbnRyb2xzJztcbmltcG9ydCBjb25maWcgZnJvbSAnLi4vY29uZmlnJztcbmltcG9ydCBkZXByZWNhdGVXYXJuIGZyb20gJy4uL3V0aWxzL2RlcHJlY2F0ZS13YXJuJztcblxuY29uc3QgcHJvcFR5cGVzID0gT2JqZWN0LmFzc2lnbih7fSwgU3RhdGljTWFwLnByb3BUeXBlcywge1xuICAvLyBBZGRpdGlvbmFsIHByb3BzIG9uIHRvcCBvZiBTdGF0aWNNYXBcblxuICAvKiogVmlld3BvcnQgY29uc3RyYWludHMgKi9cbiAgLy8gTWF4IHpvb20gbGV2ZWxcbiAgbWF4Wm9vbTogUHJvcFR5cGVzLm51bWJlcixcbiAgLy8gTWluIHpvb20gbGV2ZWxcbiAgbWluWm9vbTogUHJvcFR5cGVzLm51bWJlcixcbiAgLy8gTWF4IHBpdGNoIGluIGRlZ3JlZXNcbiAgbWF4UGl0Y2g6IFByb3BUeXBlcy5udW1iZXIsXG4gIC8vIE1pbiBwaXRjaCBpbiBkZWdyZWVzXG4gIG1pblBpdGNoOiBQcm9wVHlwZXMubnVtYmVyLFxuXG4gIC8qKlxuICAgKiBgb25WaWV3cG9ydENoYW5nZWAgY2FsbGJhY2sgaXMgZmlyZWQgd2hlbiB0aGUgdXNlciBpbnRlcmFjdGVkIHdpdGggdGhlXG4gICAqIG1hcC4gVGhlIG9iamVjdCBwYXNzZWQgdG8gdGhlIGNhbGxiYWNrIGNvbnRhaW5zIHZpZXdwb3J0IHByb3BlcnRpZXNcbiAgICogc3VjaCBhcyBgbG9uZ2l0dWRlYCwgYGxhdGl0dWRlYCwgYHpvb21gIGV0Yy5cbiAgICovXG4gIG9uVmlld3BvcnRDaGFuZ2U6IFByb3BUeXBlcy5mdW5jLFxuXG4gIC8qKiBWaWV3cG9ydCB0cmFuc2l0aW9uICoqL1xuICAvLyB0cmFuc2l0aW9uIGR1cmF0aW9uIGZvciB2aWV3cG9ydCBjaGFuZ2VcbiAgdHJhbnNpdGlvbkR1cmF0aW9uOiBQcm9wVHlwZXMubnVtYmVyLFxuICAvLyBmdW5jdGlvbiBjYWxsZWQgZm9yIGVhY2ggdHJhbnNpdGlvbiBzdGVwLCBjYW4gYmUgdXNlZCB0byBwZXJmb3JtIGN1c3RvbSB0cmFuc2l0aW9ucy5cbiAgdHJhbnNpdGlvbkludGVycG9sYXRvcjogUHJvcFR5cGVzLmZ1bmMsXG4gIC8vIHR5cGUgb2YgaW50ZXJydXB0aW9uIG9mIGN1cnJlbnQgdHJhbnNpdGlvbiBvbiB1cGRhdGUuXG4gIHRyYW5zaXRpb25JbnRlcnJ1cHRpb246IFByb3BUeXBlcy5udW1iZXIsXG4gIC8vIGVhc2luZyBmdW5jdGlvblxuICB0cmFuc2l0aW9uRWFzaW5nOiBQcm9wVHlwZXMuZnVuYyxcbiAgLy8gdHJhbnNpdGlvbiBzdGF0dXMgdXBkYXRlIGZ1bmN0aW9uc1xuICBvblRyYW5zaXRpb25TdGFydDogUHJvcFR5cGVzLmZ1bmMsXG4gIG9uVHJhbnNpdGlvbkludGVycnVwdDogUHJvcFR5cGVzLmZ1bmMsXG4gIG9uVHJhbnNpdGlvbkVuZDogUHJvcFR5cGVzLmZ1bmMsXG5cbiAgLyoqIEVuYWJsZXMgY29udHJvbCBldmVudCBoYW5kbGluZyAqL1xuICAvLyBTY3JvbGwgdG8gem9vbVxuICBzY3JvbGxab29tOiBQcm9wVHlwZXMuYm9vbCxcbiAgLy8gRHJhZyB0byBwYW5cbiAgZHJhZ1BhbjogUHJvcFR5cGVzLmJvb2wsXG4gIC8vIERyYWcgdG8gcm90YXRlXG4gIGRyYWdSb3RhdGU6IFByb3BUeXBlcy5ib29sLFxuICAvLyBEb3VibGUgY2xpY2sgdG8gem9vbVxuICBkb3VibGVDbGlja1pvb206IFByb3BUeXBlcy5ib29sLFxuICAvLyBQaW5jaCB0byB6b29tIC8gcm90YXRlXG4gIHRvdWNoWm9vbVJvdGF0ZTogUHJvcFR5cGVzLmJvb2wsXG4gIC8vIEtleWJvYXJkXG4gIGtleWJvYXJkOiBQcm9wVHlwZXMuYm9vbCxcblxuIC8qKlxuICAgICogQ2FsbGVkIHdoZW4gdGhlIG1hcCBpcyBob3ZlcmVkIG92ZXIuXG4gICAgKiBAY2FsbGJhY2tcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBldmVudCAtIFRoZSBtb3VzZSBldmVudC5cbiAgICAqIEBwYXJhbSB7W051bWJlciwgTnVtYmVyXX0gZXZlbnQubG5nTGF0IC0gVGhlIGNvb3JkaW5hdGVzIG9mIHRoZSBwb2ludGVyXG4gICAgKiBAcGFyYW0ge0FycmF5fSBldmVudC5mZWF0dXJlcyAtIFRoZSBmZWF0dXJlcyB1bmRlciB0aGUgcG9pbnRlciwgdXNpbmcgTWFwYm94J3NcbiAgICAqIHF1ZXJ5UmVuZGVyZWRGZWF0dXJlcyBBUEk6XG4gICAgKiBodHRwczovL3d3dy5tYXBib3guY29tL21hcGJveC1nbC1qcy9hcGkvI01hcCNxdWVyeVJlbmRlcmVkRmVhdHVyZXNcbiAgICAqIFRvIG1ha2UgYSBsYXllciBpbnRlcmFjdGl2ZSwgc2V0IHRoZSBgaW50ZXJhY3RpdmVgIHByb3BlcnR5IGluIHRoZVxuICAgICogbGF5ZXIgc3R5bGUgdG8gYHRydWVgLiBTZWUgTWFwYm94J3Mgc3R5bGUgc3BlY1xuICAgICogaHR0cHM6Ly93d3cubWFwYm94LmNvbS9tYXBib3gtZ2wtc3R5bGUtc3BlYy8jbGF5ZXItaW50ZXJhY3RpdmVcbiAgICAqL1xuICBvbkhvdmVyOiBQcm9wVHlwZXMuZnVuYyxcbiAgLyoqXG4gICAgKiBDYWxsZWQgd2hlbiB0aGUgbWFwIGlzIGNsaWNrZWQuXG4gICAgKiBAY2FsbGJhY2tcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBldmVudCAtIFRoZSBtb3VzZSBldmVudC5cbiAgICAqIEBwYXJhbSB7W051bWJlciwgTnVtYmVyXX0gZXZlbnQubG5nTGF0IC0gVGhlIGNvb3JkaW5hdGVzIG9mIHRoZSBwb2ludGVyXG4gICAgKiBAcGFyYW0ge0FycmF5fSBldmVudC5mZWF0dXJlcyAtIFRoZSBmZWF0dXJlcyB1bmRlciB0aGUgcG9pbnRlciwgdXNpbmcgTWFwYm94J3NcbiAgICAqIHF1ZXJ5UmVuZGVyZWRGZWF0dXJlcyBBUEk6XG4gICAgKiBodHRwczovL3d3dy5tYXBib3guY29tL21hcGJveC1nbC1qcy9hcGkvI01hcCNxdWVyeVJlbmRlcmVkRmVhdHVyZXNcbiAgICAqIFRvIG1ha2UgYSBsYXllciBpbnRlcmFjdGl2ZSwgc2V0IHRoZSBgaW50ZXJhY3RpdmVgIHByb3BlcnR5IGluIHRoZVxuICAgICogbGF5ZXIgc3R5bGUgdG8gYHRydWVgLiBTZWUgTWFwYm94J3Mgc3R5bGUgc3BlY1xuICAgICogaHR0cHM6Ly93d3cubWFwYm94LmNvbS9tYXBib3gtZ2wtc3R5bGUtc3BlYy8jbGF5ZXItaW50ZXJhY3RpdmVcbiAgICAqL1xuICBvbkNsaWNrOiBQcm9wVHlwZXMuZnVuYyxcblxuICAvKiogUmFkaXVzIHRvIGRldGVjdCBmZWF0dXJlcyBhcm91bmQgYSBjbGlja2VkIHBvaW50LiBEZWZhdWx0cyB0byAwLiAqL1xuICBjbGlja1JhZGl1czogUHJvcFR5cGVzLm51bWJlcixcblxuICAvKiogQWNjZXNzb3IgdGhhdCByZXR1cm5zIGEgY3Vyc29yIHN0eWxlIHRvIHNob3cgaW50ZXJhY3RpdmUgc3RhdGUgKi9cbiAgZ2V0Q3Vyc29yOiBQcm9wVHlwZXMuZnVuYyxcblxuICAvKiogQWR2YW5jZWQgZmVhdHVyZXMgKi9cbiAgLy8gQ29udHJhaW50cyBmb3IgZGlzcGxheWluZyB0aGUgbWFwLiBJZiBub3QgbWV0LCB0aGVuIHRoZSBtYXAgaXMgaGlkZGVuLlxuICAvLyBFeHBlcmltZW50YWwhIE1heSBiZSBjaGFuZ2VkIGluIG1pbm9yIHZlcnNpb24gdXBkYXRlcy5cbiAgdmlzaWJpbGl0eUNvbnN0cmFpbnRzOiBQcm9wVHlwZXMuc2hhcGUoe1xuICAgIG1pblpvb206IFByb3BUeXBlcy5udW1iZXIsXG4gICAgbWF4Wm9vbTogUHJvcFR5cGVzLm51bWJlcixcbiAgICBtaW5QaXRjaDogUHJvcFR5cGVzLm51bWJlcixcbiAgICBtYXhQaXRjaDogUHJvcFR5cGVzLm51bWJlclxuICB9KSxcbiAgLy8gQSBtYXAgY29udHJvbCBpbnN0YW5jZSB0byByZXBsYWNlIHRoZSBkZWZhdWx0IG1hcCBjb250cm9sc1xuICAvLyBUaGUgb2JqZWN0IG11c3QgZXhwb3NlIG9uZSBwcm9wZXJ0eTogYGV2ZW50c2AgYXMgYW4gYXJyYXkgb2Ygc3Vic2NyaWJlZFxuICAvLyBldmVudCBuYW1lczsgYW5kIHR3byBtZXRob2RzOiBgc2V0U3RhdGUoc3RhdGUpYCBhbmQgYGhhbmRsZShldmVudClgXG4gIG1hcENvbnRyb2xzOiBQcm9wVHlwZXMuc2hhcGUoe1xuICAgIGV2ZW50czogUHJvcFR5cGVzLmFycmF5T2YoUHJvcFR5cGVzLnN0cmluZyksXG4gICAgaGFuZGxlRXZlbnQ6IFByb3BUeXBlcy5mdW5jXG4gIH0pXG59KTtcblxuY29uc3QgZ2V0RGVmYXVsdEN1cnNvciA9ICh7aXNEcmFnZ2luZywgaXNIb3ZlcmluZ30pID0+IGlzRHJhZ2dpbmcgP1xuICBjb25maWcuQ1VSU09SLkdSQUJCSU5HIDpcbiAgKGlzSG92ZXJpbmcgPyBjb25maWcuQ1VSU09SLlBPSU5URVIgOiBjb25maWcuQ1VSU09SLkdSQUIpO1xuXG5jb25zdCBkZWZhdWx0UHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LFxuICBTdGF0aWNNYXAuZGVmYXVsdFByb3BzLCBNQVBCT1hfTElNSVRTLCBUcmFuc2l0aW9uTWFuYWdlci5kZWZhdWx0UHJvcHMsXG4gIHtcbiAgICBvblZpZXdwb3J0Q2hhbmdlOiBudWxsLFxuICAgIG9uQ2xpY2s6IG51bGwsXG4gICAgb25Ib3ZlcjogbnVsbCxcblxuICAgIHNjcm9sbFpvb206IHRydWUsXG4gICAgZHJhZ1BhbjogdHJ1ZSxcbiAgICBkcmFnUm90YXRlOiB0cnVlLFxuICAgIGRvdWJsZUNsaWNrWm9vbTogdHJ1ZSxcbiAgICB0b3VjaFpvb21Sb3RhdGU6IHRydWUsXG5cbiAgICBjbGlja1JhZGl1czogMCxcbiAgICBnZXRDdXJzb3I6IGdldERlZmF1bHRDdXJzb3IsXG5cbiAgICB2aXNpYmlsaXR5Q29uc3RyYWludHM6IE1BUEJPWF9MSU1JVFNcbiAgfVxuKTtcblxuY29uc3QgY2hpbGRDb250ZXh0VHlwZXMgPSB7XG4gIHZpZXdwb3J0OiBQcm9wVHlwZXMuaW5zdGFuY2VPZihQZXJzcGVjdGl2ZU1lcmNhdG9yVmlld3BvcnQpLFxuICBpc0RyYWdnaW5nOiBQcm9wVHlwZXMuYm9vbCxcbiAgZXZlbnRNYW5hZ2VyOiBQcm9wVHlwZXMub2JqZWN0XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJbnRlcmFjdGl2ZU1hcCBleHRlbmRzIFB1cmVDb21wb25lbnQge1xuXG4gIHN0YXRpYyBzdXBwb3J0ZWQoKSB7XG4gICAgcmV0dXJuIFN0YXRpY01hcC5zdXBwb3J0ZWQoKTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIGF1dG9iaW5kKHRoaXMpO1xuICAgIC8vIENoZWNrIGZvciBkZXByZWNhdGVkIHByb3BzXG4gICAgZGVwcmVjYXRlV2Fybihwcm9wcyk7XG5cbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgLy8gV2hldGhlciB0aGUgY3Vyc29yIGlzIGRvd25cbiAgICAgIGlzRHJhZ2dpbmc6IGZhbHNlLFxuICAgICAgLy8gV2hldGhlciB0aGUgY3Vyc29yIGlzIG92ZXIgYSBjbGlja2FibGUgZmVhdHVyZVxuICAgICAgaXNIb3ZlcmluZzogZmFsc2VcbiAgICB9O1xuXG4gICAgLy8gSWYgcHJvcHMubWFwQ29udHJvbHMgaXMgbm90IHByb3ZpZGVkLCBmYWxsYmFjayB0byBkZWZhdWx0IE1hcENvbnRyb2xzIGluc3RhbmNlXG4gICAgLy8gQ2Fubm90IHVzZSBkZWZhdWx0UHJvcHMgaGVyZSBiZWNhdXNlIGl0IG5lZWRzIHRvIGJlIHBlciBtYXAgaW5zdGFuY2VcbiAgICB0aGlzLl9tYXBDb250cm9scyA9IHByb3BzLm1hcENvbnRyb2xzIHx8IG5ldyBNYXBDb250cm9scygpO1xuICB9XG5cbiAgZ2V0Q2hpbGRDb250ZXh0KCkge1xuICAgIHJldHVybiB7XG4gICAgICB2aWV3cG9ydDogbmV3IFBlcnNwZWN0aXZlTWVyY2F0b3JWaWV3cG9ydCh0aGlzLnByb3BzKSxcbiAgICAgIGlzRHJhZ2dpbmc6IHRoaXMuc3RhdGUuaXNEcmFnZ2luZyxcbiAgICAgIGV2ZW50TWFuYWdlcjogdGhpcy5fZXZlbnRNYW5hZ2VyXG4gICAgfTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIGNvbnN0IGV2ZW50TWFuYWdlciA9IG5ldyBFdmVudE1hbmFnZXIodGhpcy5fZXZlbnRDYW52YXMsIHtyaWdodEJ1dHRvbjogdHJ1ZX0pO1xuXG4gICAgLy8gUmVnaXN0ZXIgYWRkaXRpb25hbCBldmVudCBoYW5kbGVycyBmb3IgY2xpY2sgYW5kIGhvdmVyXG4gICAgZXZlbnRNYW5hZ2VyLm9uKCdtb3VzZW1vdmUnLCB0aGlzLl9vbk1vdXNlTW92ZSk7XG4gICAgZXZlbnRNYW5hZ2VyLm9uKCdjbGljaycsIHRoaXMuX29uTW91c2VDbGljayk7XG4gICAgdGhpcy5fZXZlbnRNYW5hZ2VyID0gZXZlbnRNYW5hZ2VyO1xuXG4gICAgdGhpcy5fbWFwQ29udHJvbHMuc2V0T3B0aW9ucyhPYmplY3QuYXNzaWduKHt9LCB0aGlzLnByb3BzLCB7XG4gICAgICBvblN0YXRlQ2hhbmdlOiB0aGlzLl9vbkludGVyYWN0aXZlU3RhdGVDaGFuZ2UsXG4gICAgICBldmVudE1hbmFnZXJcbiAgICB9KSk7XG5cbiAgICB0aGlzLl90cmFuc2l0aW9uTWFuYWdlciA9IG5ldyBUcmFuc2l0aW9uTWFuYWdlcih0aGlzLnByb3BzKTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVcGRhdGUobmV4dFByb3BzKSB7XG4gICAgdGhpcy5fbWFwQ29udHJvbHMuc2V0T3B0aW9ucyhuZXh0UHJvcHMpO1xuICAgIHRoaXMuX3RyYW5zaXRpb25NYW5hZ2VyLnByb2Nlc3NWaWV3cG9ydENoYW5nZShuZXh0UHJvcHMpO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgaWYgKHRoaXMuX2V2ZW50TWFuYWdlcikge1xuICAgICAgLy8gTXVzdCBkZXN0cm95IGJlY2F1c2UgaGFtbWVyIGFkZHMgZXZlbnQgbGlzdGVuZXJzIHRvIHdpbmRvd1xuICAgICAgdGhpcy5fZXZlbnRNYW5hZ2VyLmRlc3Ryb3koKTtcbiAgICB9XG4gIH1cblxuICBnZXRNYXAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX21hcC5nZXRNYXAoKTtcbiAgfVxuXG4gIHF1ZXJ5UmVuZGVyZWRGZWF0dXJlcyhnZW9tZXRyeSwgb3B0aW9ucykge1xuICAgIHJldHVybiB0aGlzLl9tYXAucXVlcnlSZW5kZXJlZEZlYXR1cmVzKGdlb21ldHJ5LCBvcHRpb25zKTtcbiAgfVxuXG4gIC8vIENoZWNrcyBhIHZpc2liaWxpdHlDb25zdHJhaW50cyBvYmplY3QgdG8gc2VlIGlmIHRoZSBtYXAgc2hvdWxkIGJlIGRpc3BsYXllZFxuICBfY2hlY2tWaXNpYmlsaXR5Q29uc3RyYWludHMocHJvcHMpIHtcbiAgICBjb25zdCBjYXBpdGFsaXplID0gcyA9PiBzWzBdLnRvVXBwZXJDYXNlKCkgKyBzLnNsaWNlKDEpO1xuXG4gICAgY29uc3Qge3Zpc2liaWxpdHlDb25zdHJhaW50c30gPSBwcm9wcztcbiAgICBmb3IgKGNvbnN0IHByb3BOYW1lIGluIHByb3BzKSB7XG4gICAgICBjb25zdCBjYXBpdGFsaXplZFByb3BOYW1lID0gY2FwaXRhbGl6ZShwcm9wTmFtZSk7XG4gICAgICBjb25zdCBtaW5Qcm9wTmFtZSA9IGBtaW4ke2NhcGl0YWxpemVkUHJvcE5hbWV9YDtcbiAgICAgIGNvbnN0IG1heFByb3BOYW1lID0gYG1heCR7Y2FwaXRhbGl6ZWRQcm9wTmFtZX1gO1xuXG4gICAgICBpZiAobWluUHJvcE5hbWUgaW4gdmlzaWJpbGl0eUNvbnN0cmFpbnRzICYmXG4gICAgICAgIHByb3BzW3Byb3BOYW1lXSA8IHZpc2liaWxpdHlDb25zdHJhaW50c1ttaW5Qcm9wTmFtZV0pIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgaWYgKG1heFByb3BOYW1lIGluIHZpc2liaWxpdHlDb25zdHJhaW50cyAmJlxuICAgICAgICBwcm9wc1twcm9wTmFtZV0gPiB2aXNpYmlsaXR5Q29uc3RyYWludHNbbWF4UHJvcE5hbWVdKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBfZ2V0RmVhdHVyZXMoe3BvcywgcmFkaXVzfSkge1xuICAgIGxldCBmZWF0dXJlcztcbiAgICBpZiAocmFkaXVzKSB7XG4gICAgICAvLyBSYWRpdXMgZW5hYmxlcyBwb2ludCBmZWF0dXJlcywgbGlrZSBtYXJrZXIgc3ltYm9scywgdG8gYmUgY2xpY2tlZC5cbiAgICAgIGNvbnN0IHNpemUgPSByYWRpdXM7XG4gICAgICBjb25zdCBiYm94ID0gW1twb3NbMF0gLSBzaXplLCBwb3NbMV0gKyBzaXplXSwgW3Bvc1swXSArIHNpemUsIHBvc1sxXSAtIHNpemVdXTtcbiAgICAgIGZlYXR1cmVzID0gdGhpcy5fbWFwLnF1ZXJ5UmVuZGVyZWRGZWF0dXJlcyhiYm94KTtcbiAgICB9IGVsc2Uge1xuICAgICAgZmVhdHVyZXMgPSB0aGlzLl9tYXAucXVlcnlSZW5kZXJlZEZlYXR1cmVzKHBvcyk7XG4gICAgfVxuICAgIHJldHVybiBmZWF0dXJlcztcbiAgfVxuXG4gIF9vbkludGVyYWN0aXZlU3RhdGVDaGFuZ2Uoe2lzRHJhZ2dpbmcgPSBmYWxzZX0pIHtcbiAgICBpZiAoaXNEcmFnZ2luZyAhPT0gdGhpcy5zdGF0ZS5pc0RyYWdnaW5nKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtpc0RyYWdnaW5nfSk7XG4gICAgfVxuICB9XG5cbiAgLy8gSE9WRVIgQU5EIENMSUNLXG4gIF9nZXRQb3MoZXZlbnQpIHtcbiAgICBjb25zdCB7b2Zmc2V0Q2VudGVyOiB7eCwgeX19ID0gZXZlbnQ7XG4gICAgcmV0dXJuIFt4LCB5XTtcbiAgfVxuXG4gIF9vbk1vdXNlTW92ZShldmVudCkge1xuICAgIGlmICghdGhpcy5zdGF0ZS5pc0RyYWdnaW5nKSB7XG4gICAgICBjb25zdCBwb3MgPSB0aGlzLl9nZXRQb3MoZXZlbnQpO1xuICAgICAgY29uc3QgZmVhdHVyZXMgPSB0aGlzLl9nZXRGZWF0dXJlcyh7cG9zLCByYWRpdXM6IHRoaXMucHJvcHMuY2xpY2tSYWRpdXN9KTtcblxuICAgICAgY29uc3QgaXNIb3ZlcmluZyA9IGZlYXR1cmVzICYmIGZlYXR1cmVzLmxlbmd0aCA+IDA7XG4gICAgICBpZiAoaXNIb3ZlcmluZyAhPT0gdGhpcy5zdGF0ZS5pc0hvdmVyaW5nKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2lzSG92ZXJpbmd9KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMucHJvcHMub25Ib3Zlcikge1xuICAgICAgICBjb25zdCB2aWV3cG9ydCA9IG5ldyBQZXJzcGVjdGl2ZU1lcmNhdG9yVmlld3BvcnQodGhpcy5wcm9wcyk7XG4gICAgICAgIGV2ZW50LmxuZ0xhdCA9IHZpZXdwb3J0LnVucHJvamVjdChwb3MpO1xuICAgICAgICBldmVudC5mZWF0dXJlcyA9IGZlYXR1cmVzO1xuXG4gICAgICAgIHRoaXMucHJvcHMub25Ib3ZlcihldmVudCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX29uTW91c2VDbGljayhldmVudCkge1xuICAgIGlmICh0aGlzLnByb3BzLm9uQ2xpY2spIHtcbiAgICAgIGNvbnN0IHBvcyA9IHRoaXMuX2dldFBvcyhldmVudCk7XG4gICAgICBjb25zdCB2aWV3cG9ydCA9IG5ldyBQZXJzcGVjdGl2ZU1lcmNhdG9yVmlld3BvcnQodGhpcy5wcm9wcyk7XG4gICAgICBldmVudC5sbmdMYXQgPSB2aWV3cG9ydC51bnByb2plY3QocG9zKTtcbiAgICAgIGV2ZW50LmZlYXR1cmVzID0gdGhpcy5fZ2V0RmVhdHVyZXMoe3BvcywgcmFkaXVzOiB0aGlzLnByb3BzLmNsaWNrUmFkaXVzfSk7XG5cbiAgICAgIHRoaXMucHJvcHMub25DbGljayhldmVudCk7XG4gICAgfVxuICB9XG5cbiAgX2V2ZW50Q2FudmFzTG9hZGVkKHJlZikge1xuICAgIHRoaXMuX2V2ZW50Q2FudmFzID0gcmVmO1xuICB9XG5cbiAgX3N0YXRpY01hcExvYWRlZChyZWYpIHtcbiAgICB0aGlzLl9tYXAgPSByZWY7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3Qge3dpZHRoLCBoZWlnaHQsIGdldEN1cnNvcn0gPSB0aGlzLnByb3BzO1xuXG4gICAgY29uc3QgZXZlbnRDYW52YXNTdHlsZSA9IHtcbiAgICAgIHdpZHRoLFxuICAgICAgaGVpZ2h0LFxuICAgICAgcG9zaXRpb246ICdyZWxhdGl2ZScsXG4gICAgICBjdXJzb3I6IGdldEN1cnNvcih0aGlzLnN0YXRlKVxuICAgIH07XG5cbiAgICByZXR1cm4gKFxuICAgICAgY3JlYXRlRWxlbWVudCgnZGl2Jywge1xuICAgICAgICBrZXk6ICdtYXAtY29udHJvbHMnLFxuICAgICAgICByZWY6IHRoaXMuX2V2ZW50Q2FudmFzTG9hZGVkLFxuICAgICAgICBzdHlsZTogZXZlbnRDYW52YXNTdHlsZVxuICAgICAgfSxcbiAgICAgICAgY3JlYXRlRWxlbWVudChTdGF0aWNNYXAsIE9iamVjdC5hc3NpZ24oe30sIHRoaXMucHJvcHMsXG4gICAgICAgICAgdGhpcy5fdHJhbnNpdGlvbk1hbmFnZXIgJiYgdGhpcy5fdHJhbnNpdGlvbk1hbmFnZXIuZ2V0Vmlld3BvcnRJblRyYW5zaXRpb24oKSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICB2aXNpYmxlOiB0aGlzLl9jaGVja1Zpc2liaWxpdHlDb25zdHJhaW50cyh0aGlzLnByb3BzKSxcbiAgICAgICAgICAgIHJlZjogdGhpcy5fc3RhdGljTWFwTG9hZGVkLFxuICAgICAgICAgICAgY2hpbGRyZW46IHRoaXMuX2V2ZW50TWFuYWdlciA/IHRoaXMucHJvcHMuY2hpbGRyZW4gOiBudWxsXG4gICAgICAgICAgfVxuICAgICAgICApKVxuICAgICAgKVxuICAgICk7XG4gIH1cbn1cblxuSW50ZXJhY3RpdmVNYXAuZGlzcGxheU5hbWUgPSAnSW50ZXJhY3RpdmVNYXAnO1xuSW50ZXJhY3RpdmVNYXAucHJvcFR5cGVzID0gcHJvcFR5cGVzO1xuSW50ZXJhY3RpdmVNYXAuZGVmYXVsdFByb3BzID0gZGVmYXVsdFByb3BzO1xuSW50ZXJhY3RpdmVNYXAuY2hpbGRDb250ZXh0VHlwZXMgPSBjaGlsZENvbnRleHRUeXBlcztcbiJdfQ==