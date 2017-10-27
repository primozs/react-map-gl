var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import { PureComponent, createElement } from 'react';
import PropTypes from 'prop-types';
import autobind from '../utils/autobind';

import StaticMap from './static-map';
import { MAPBOX_LIMITS } from '../utils/map-state';
import { PerspectiveMercatorViewport } from 'viewport-mercator-project';

import TransitionManager from '../utils/transition-manager';

import { EventManager } from 'mjolnir.js';
import MapControls from '../utils/map-controls';
import config from '../config';
import deprecateWarn from '../utils/deprecate-warn';

var propTypes = Object.assign({}, StaticMap.propTypes, {
  // Additional props on top of StaticMap

  /** Viewport constraints */
  // Max zoom level
  maxZoom: PropTypes.number,
  // Min zoom level
  minZoom: PropTypes.number,
  // Max pitch in degrees
  maxPitch: PropTypes.number,
  // Min pitch in degrees
  minPitch: PropTypes.number,

  /**
   * `onViewportChange` callback is fired when the user interacted with the
   * map. The object passed to the callback contains viewport properties
   * such as `longitude`, `latitude`, `zoom` etc.
   */
  onViewportChange: PropTypes.func,

  /** Viewport transition **/
  // transition duration for viewport change
  transitionDuration: PropTypes.number,
  // function called for each transition step, can be used to perform custom transitions.
  transitionInterpolator: PropTypes.func,
  // type of interruption of current transition on update.
  transitionInterruption: PropTypes.number,
  // easing function
  transitionEasing: PropTypes.func,
  // transition status update functions
  onTransitionStart: PropTypes.func,
  onTransitionInterrupt: PropTypes.func,
  onTransitionEnd: PropTypes.func,

  /** Enables control event handling */
  // Scroll to zoom
  scrollZoom: PropTypes.bool,
  // Drag to pan
  dragPan: PropTypes.bool,
  // Drag to rotate
  dragRotate: PropTypes.bool,
  // Double click to zoom
  doubleClickZoom: PropTypes.bool,
  // Pinch to zoom / rotate
  touchZoomRotate: PropTypes.bool,
  // Keyboard
  keyboard: PropTypes.bool,

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
  onHover: PropTypes.func,
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
  onClick: PropTypes.func,

  /** Radius to detect features around a clicked point. Defaults to 0. */
  clickRadius: PropTypes.number,

  /** Accessor that returns a cursor style to show interactive state */
  getCursor: PropTypes.func,

  /** Advanced features */
  // Contraints for displaying the map. If not met, then the map is hidden.
  // Experimental! May be changed in minor version updates.
  visibilityConstraints: PropTypes.shape({
    minZoom: PropTypes.number,
    maxZoom: PropTypes.number,
    minPitch: PropTypes.number,
    maxPitch: PropTypes.number
  }),
  // A map control instance to replace the default map controls
  // The object must expose one property: `events` as an array of subscribed
  // event names; and two methods: `setState(state)` and `handle(event)`
  mapControls: PropTypes.shape({
    events: PropTypes.arrayOf(PropTypes.string),
    handleEvent: PropTypes.func
  })
});

var getDefaultCursor = function getDefaultCursor(_ref) {
  var isDragging = _ref.isDragging,
      isHovering = _ref.isHovering;
  return isDragging ? config.CURSOR.GRABBING : isHovering ? config.CURSOR.POINTER : config.CURSOR.GRAB;
};

var defaultProps = Object.assign({}, StaticMap.defaultProps, MAPBOX_LIMITS, TransitionManager.defaultProps, {
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

  visibilityConstraints: MAPBOX_LIMITS
});

var childContextTypes = {
  viewport: PropTypes.instanceOf(PerspectiveMercatorViewport),
  isDragging: PropTypes.bool,
  eventManager: PropTypes.object
};

var InteractiveMap = function (_PureComponent) {
  _inherits(InteractiveMap, _PureComponent);

  _createClass(InteractiveMap, null, [{
    key: 'supported',
    value: function supported() {
      return StaticMap.supported();
    }
  }]);

  function InteractiveMap(props) {
    _classCallCheck(this, InteractiveMap);

    var _this = _possibleConstructorReturn(this, (InteractiveMap.__proto__ || Object.getPrototypeOf(InteractiveMap)).call(this, props));

    autobind(_this);
    // Check for deprecated props
    deprecateWarn(props);

    _this.state = {
      // Whether the cursor is down
      isDragging: false,
      // Whether the cursor is over a clickable feature
      isHovering: false
    };

    // If props.mapControls is not provided, fallback to default MapControls instance
    // Cannot use defaultProps here because it needs to be per map instance
    _this._mapControls = props.mapControls || new MapControls();
    return _this;
  }

  _createClass(InteractiveMap, [{
    key: 'getChildContext',
    value: function getChildContext() {
      return {
        viewport: new PerspectiveMercatorViewport(this.props),
        isDragging: this.state.isDragging,
        eventManager: this._eventManager
      };
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var eventManager = new EventManager(this._eventCanvas, { rightButton: true });

      // Register additional event handlers for click and hover
      eventManager.on('mousemove', this._onMouseMove);
      eventManager.on('click', this._onMouseClick);
      this._eventManager = eventManager;

      this._mapControls.setOptions(Object.assign({}, this.props, {
        onStateChange: this._onInteractiveStateChange,
        eventManager: eventManager
      }));

      this._transitionManager = new TransitionManager(this.props);
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
          var viewport = new PerspectiveMercatorViewport(this.props);
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
        var viewport = new PerspectiveMercatorViewport(this.props);
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

      return createElement('div', {
        key: 'map-controls',
        ref: this._eventCanvasLoaded,
        style: eventCanvasStyle
      }, createElement(StaticMap, Object.assign({}, this.props, this._transitionManager && this._transitionManager.getViewportInTransition(), {
        visible: this._checkVisibilityConstraints(this.props),
        ref: this._staticMapLoaded,
        children: this._eventManager ? this.props.children : null
      })));
    }
  }]);

  return InteractiveMap;
}(PureComponent);

export default InteractiveMap;


InteractiveMap.displayName = 'InteractiveMap';
InteractiveMap.propTypes = propTypes;
InteractiveMap.defaultProps = defaultProps;
InteractiveMap.childContextTypes = childContextTypes;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21wb25lbnRzL2ludGVyYWN0aXZlLW1hcC5qcyJdLCJuYW1lcyI6WyJQdXJlQ29tcG9uZW50IiwiY3JlYXRlRWxlbWVudCIsIlByb3BUeXBlcyIsImF1dG9iaW5kIiwiU3RhdGljTWFwIiwiTUFQQk9YX0xJTUlUUyIsIlBlcnNwZWN0aXZlTWVyY2F0b3JWaWV3cG9ydCIsIlRyYW5zaXRpb25NYW5hZ2VyIiwiRXZlbnRNYW5hZ2VyIiwiTWFwQ29udHJvbHMiLCJjb25maWciLCJkZXByZWNhdGVXYXJuIiwicHJvcFR5cGVzIiwiT2JqZWN0IiwiYXNzaWduIiwibWF4Wm9vbSIsIm51bWJlciIsIm1pblpvb20iLCJtYXhQaXRjaCIsIm1pblBpdGNoIiwib25WaWV3cG9ydENoYW5nZSIsImZ1bmMiLCJ0cmFuc2l0aW9uRHVyYXRpb24iLCJ0cmFuc2l0aW9uSW50ZXJwb2xhdG9yIiwidHJhbnNpdGlvbkludGVycnVwdGlvbiIsInRyYW5zaXRpb25FYXNpbmciLCJvblRyYW5zaXRpb25TdGFydCIsIm9uVHJhbnNpdGlvbkludGVycnVwdCIsIm9uVHJhbnNpdGlvbkVuZCIsInNjcm9sbFpvb20iLCJib29sIiwiZHJhZ1BhbiIsImRyYWdSb3RhdGUiLCJkb3VibGVDbGlja1pvb20iLCJ0b3VjaFpvb21Sb3RhdGUiLCJrZXlib2FyZCIsIm9uSG92ZXIiLCJvbkNsaWNrIiwiY2xpY2tSYWRpdXMiLCJnZXRDdXJzb3IiLCJ2aXNpYmlsaXR5Q29uc3RyYWludHMiLCJzaGFwZSIsIm1hcENvbnRyb2xzIiwiZXZlbnRzIiwiYXJyYXlPZiIsInN0cmluZyIsImhhbmRsZUV2ZW50IiwiZ2V0RGVmYXVsdEN1cnNvciIsImlzRHJhZ2dpbmciLCJpc0hvdmVyaW5nIiwiQ1VSU09SIiwiR1JBQkJJTkciLCJQT0lOVEVSIiwiR1JBQiIsImRlZmF1bHRQcm9wcyIsImNoaWxkQ29udGV4dFR5cGVzIiwidmlld3BvcnQiLCJpbnN0YW5jZU9mIiwiZXZlbnRNYW5hZ2VyIiwib2JqZWN0IiwiSW50ZXJhY3RpdmVNYXAiLCJzdXBwb3J0ZWQiLCJwcm9wcyIsInN0YXRlIiwiX21hcENvbnRyb2xzIiwiX2V2ZW50TWFuYWdlciIsIl9ldmVudENhbnZhcyIsInJpZ2h0QnV0dG9uIiwib24iLCJfb25Nb3VzZU1vdmUiLCJfb25Nb3VzZUNsaWNrIiwic2V0T3B0aW9ucyIsIm9uU3RhdGVDaGFuZ2UiLCJfb25JbnRlcmFjdGl2ZVN0YXRlQ2hhbmdlIiwiX3RyYW5zaXRpb25NYW5hZ2VyIiwibmV4dFByb3BzIiwicHJvY2Vzc1ZpZXdwb3J0Q2hhbmdlIiwiZGVzdHJveSIsIl9tYXAiLCJnZXRNYXAiLCJnZW9tZXRyeSIsIm9wdGlvbnMiLCJxdWVyeVJlbmRlcmVkRmVhdHVyZXMiLCJjYXBpdGFsaXplIiwicyIsInRvVXBwZXJDYXNlIiwic2xpY2UiLCJwcm9wTmFtZSIsImNhcGl0YWxpemVkUHJvcE5hbWUiLCJtaW5Qcm9wTmFtZSIsIm1heFByb3BOYW1lIiwicG9zIiwicmFkaXVzIiwiZmVhdHVyZXMiLCJzaXplIiwiYmJveCIsInNldFN0YXRlIiwiZXZlbnQiLCJvZmZzZXRDZW50ZXIiLCJ4IiwieSIsIl9nZXRQb3MiLCJfZ2V0RmVhdHVyZXMiLCJsZW5ndGgiLCJsbmdMYXQiLCJ1bnByb2plY3QiLCJyZWYiLCJ3aWR0aCIsImhlaWdodCIsImV2ZW50Q2FudmFzU3R5bGUiLCJwb3NpdGlvbiIsImN1cnNvciIsImtleSIsIl9ldmVudENhbnZhc0xvYWRlZCIsInN0eWxlIiwiZ2V0Vmlld3BvcnRJblRyYW5zaXRpb24iLCJ2aXNpYmxlIiwiX2NoZWNrVmlzaWJpbGl0eUNvbnN0cmFpbnRzIiwiX3N0YXRpY01hcExvYWRlZCIsImNoaWxkcmVuIiwiZGlzcGxheU5hbWUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUEsU0FBUUEsYUFBUixFQUF1QkMsYUFBdkIsUUFBMkMsT0FBM0M7QUFDQSxPQUFPQyxTQUFQLE1BQXNCLFlBQXRCO0FBQ0EsT0FBT0MsUUFBUCxNQUFxQixtQkFBckI7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RCxlQUFlTixZQUFmLEdBQThCQSxZQUE5QjtBQUNBTSxlQUFlTCxpQkFBZixHQUFtQ0EsaUJBQW5DIiwiZmlsZSI6ImludGVyYWN0aXZlLW1hcC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7UHVyZUNvbXBvbmVudCwgY3JlYXRlRWxlbWVudH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCBhdXRvYmluZCBmcm9tICcuLi91dGlscy9hdXRvYmluZCc7XG5cbmltcG9ydCBTdGF0aWNNYXAgZnJvbSAnLi9zdGF0aWMtbWFwJztcbmltcG9ydCB7TUFQQk9YX0xJTUlUU30gZnJvbSAnLi4vdXRpbHMvbWFwLXN0YXRlJztcbmltcG9ydCB7UGVyc3BlY3RpdmVNZXJjYXRvclZpZXdwb3J0fSBmcm9tICd2aWV3cG9ydC1tZXJjYXRvci1wcm9qZWN0JztcblxuaW1wb3J0IFRyYW5zaXRpb25NYW5hZ2VyIGZyb20gJy4uL3V0aWxzL3RyYW5zaXRpb24tbWFuYWdlcic7XG5cbmltcG9ydCB7RXZlbnRNYW5hZ2VyfSBmcm9tICdtam9sbmlyLmpzJztcbmltcG9ydCBNYXBDb250cm9scyBmcm9tICcuLi91dGlscy9tYXAtY29udHJvbHMnO1xuaW1wb3J0IGNvbmZpZyBmcm9tICcuLi9jb25maWcnO1xuaW1wb3J0IGRlcHJlY2F0ZVdhcm4gZnJvbSAnLi4vdXRpbHMvZGVwcmVjYXRlLXdhcm4nO1xuXG5jb25zdCBwcm9wVHlwZXMgPSBPYmplY3QuYXNzaWduKHt9LCBTdGF0aWNNYXAucHJvcFR5cGVzLCB7XG4gIC8vIEFkZGl0aW9uYWwgcHJvcHMgb24gdG9wIG9mIFN0YXRpY01hcFxuXG4gIC8qKiBWaWV3cG9ydCBjb25zdHJhaW50cyAqL1xuICAvLyBNYXggem9vbSBsZXZlbFxuICBtYXhab29tOiBQcm9wVHlwZXMubnVtYmVyLFxuICAvLyBNaW4gem9vbSBsZXZlbFxuICBtaW5ab29tOiBQcm9wVHlwZXMubnVtYmVyLFxuICAvLyBNYXggcGl0Y2ggaW4gZGVncmVlc1xuICBtYXhQaXRjaDogUHJvcFR5cGVzLm51bWJlcixcbiAgLy8gTWluIHBpdGNoIGluIGRlZ3JlZXNcbiAgbWluUGl0Y2g6IFByb3BUeXBlcy5udW1iZXIsXG5cbiAgLyoqXG4gICAqIGBvblZpZXdwb3J0Q2hhbmdlYCBjYWxsYmFjayBpcyBmaXJlZCB3aGVuIHRoZSB1c2VyIGludGVyYWN0ZWQgd2l0aCB0aGVcbiAgICogbWFwLiBUaGUgb2JqZWN0IHBhc3NlZCB0byB0aGUgY2FsbGJhY2sgY29udGFpbnMgdmlld3BvcnQgcHJvcGVydGllc1xuICAgKiBzdWNoIGFzIGBsb25naXR1ZGVgLCBgbGF0aXR1ZGVgLCBgem9vbWAgZXRjLlxuICAgKi9cbiAgb25WaWV3cG9ydENoYW5nZTogUHJvcFR5cGVzLmZ1bmMsXG5cbiAgLyoqIFZpZXdwb3J0IHRyYW5zaXRpb24gKiovXG4gIC8vIHRyYW5zaXRpb24gZHVyYXRpb24gZm9yIHZpZXdwb3J0IGNoYW5nZVxuICB0cmFuc2l0aW9uRHVyYXRpb246IFByb3BUeXBlcy5udW1iZXIsXG4gIC8vIGZ1bmN0aW9uIGNhbGxlZCBmb3IgZWFjaCB0cmFuc2l0aW9uIHN0ZXAsIGNhbiBiZSB1c2VkIHRvIHBlcmZvcm0gY3VzdG9tIHRyYW5zaXRpb25zLlxuICB0cmFuc2l0aW9uSW50ZXJwb2xhdG9yOiBQcm9wVHlwZXMuZnVuYyxcbiAgLy8gdHlwZSBvZiBpbnRlcnJ1cHRpb24gb2YgY3VycmVudCB0cmFuc2l0aW9uIG9uIHVwZGF0ZS5cbiAgdHJhbnNpdGlvbkludGVycnVwdGlvbjogUHJvcFR5cGVzLm51bWJlcixcbiAgLy8gZWFzaW5nIGZ1bmN0aW9uXG4gIHRyYW5zaXRpb25FYXNpbmc6IFByb3BUeXBlcy5mdW5jLFxuICAvLyB0cmFuc2l0aW9uIHN0YXR1cyB1cGRhdGUgZnVuY3Rpb25zXG4gIG9uVHJhbnNpdGlvblN0YXJ0OiBQcm9wVHlwZXMuZnVuYyxcbiAgb25UcmFuc2l0aW9uSW50ZXJydXB0OiBQcm9wVHlwZXMuZnVuYyxcbiAgb25UcmFuc2l0aW9uRW5kOiBQcm9wVHlwZXMuZnVuYyxcblxuICAvKiogRW5hYmxlcyBjb250cm9sIGV2ZW50IGhhbmRsaW5nICovXG4gIC8vIFNjcm9sbCB0byB6b29tXG4gIHNjcm9sbFpvb206IFByb3BUeXBlcy5ib29sLFxuICAvLyBEcmFnIHRvIHBhblxuICBkcmFnUGFuOiBQcm9wVHlwZXMuYm9vbCxcbiAgLy8gRHJhZyB0byByb3RhdGVcbiAgZHJhZ1JvdGF0ZTogUHJvcFR5cGVzLmJvb2wsXG4gIC8vIERvdWJsZSBjbGljayB0byB6b29tXG4gIGRvdWJsZUNsaWNrWm9vbTogUHJvcFR5cGVzLmJvb2wsXG4gIC8vIFBpbmNoIHRvIHpvb20gLyByb3RhdGVcbiAgdG91Y2hab29tUm90YXRlOiBQcm9wVHlwZXMuYm9vbCxcbiAgLy8gS2V5Ym9hcmRcbiAga2V5Ym9hcmQ6IFByb3BUeXBlcy5ib29sLFxuXG4gLyoqXG4gICAgKiBDYWxsZWQgd2hlbiB0aGUgbWFwIGlzIGhvdmVyZWQgb3Zlci5cbiAgICAqIEBjYWxsYmFja1xuICAgICogQHBhcmFtIHtPYmplY3R9IGV2ZW50IC0gVGhlIG1vdXNlIGV2ZW50LlxuICAgICogQHBhcmFtIHtbTnVtYmVyLCBOdW1iZXJdfSBldmVudC5sbmdMYXQgLSBUaGUgY29vcmRpbmF0ZXMgb2YgdGhlIHBvaW50ZXJcbiAgICAqIEBwYXJhbSB7QXJyYXl9IGV2ZW50LmZlYXR1cmVzIC0gVGhlIGZlYXR1cmVzIHVuZGVyIHRoZSBwb2ludGVyLCB1c2luZyBNYXBib3gnc1xuICAgICogcXVlcnlSZW5kZXJlZEZlYXR1cmVzIEFQSTpcbiAgICAqIGh0dHBzOi8vd3d3Lm1hcGJveC5jb20vbWFwYm94LWdsLWpzL2FwaS8jTWFwI3F1ZXJ5UmVuZGVyZWRGZWF0dXJlc1xuICAgICogVG8gbWFrZSBhIGxheWVyIGludGVyYWN0aXZlLCBzZXQgdGhlIGBpbnRlcmFjdGl2ZWAgcHJvcGVydHkgaW4gdGhlXG4gICAgKiBsYXllciBzdHlsZSB0byBgdHJ1ZWAuIFNlZSBNYXBib3gncyBzdHlsZSBzcGVjXG4gICAgKiBodHRwczovL3d3dy5tYXBib3guY29tL21hcGJveC1nbC1zdHlsZS1zcGVjLyNsYXllci1pbnRlcmFjdGl2ZVxuICAgICovXG4gIG9uSG92ZXI6IFByb3BUeXBlcy5mdW5jLFxuICAvKipcbiAgICAqIENhbGxlZCB3aGVuIHRoZSBtYXAgaXMgY2xpY2tlZC5cbiAgICAqIEBjYWxsYmFja1xuICAgICogQHBhcmFtIHtPYmplY3R9IGV2ZW50IC0gVGhlIG1vdXNlIGV2ZW50LlxuICAgICogQHBhcmFtIHtbTnVtYmVyLCBOdW1iZXJdfSBldmVudC5sbmdMYXQgLSBUaGUgY29vcmRpbmF0ZXMgb2YgdGhlIHBvaW50ZXJcbiAgICAqIEBwYXJhbSB7QXJyYXl9IGV2ZW50LmZlYXR1cmVzIC0gVGhlIGZlYXR1cmVzIHVuZGVyIHRoZSBwb2ludGVyLCB1c2luZyBNYXBib3gnc1xuICAgICogcXVlcnlSZW5kZXJlZEZlYXR1cmVzIEFQSTpcbiAgICAqIGh0dHBzOi8vd3d3Lm1hcGJveC5jb20vbWFwYm94LWdsLWpzL2FwaS8jTWFwI3F1ZXJ5UmVuZGVyZWRGZWF0dXJlc1xuICAgICogVG8gbWFrZSBhIGxheWVyIGludGVyYWN0aXZlLCBzZXQgdGhlIGBpbnRlcmFjdGl2ZWAgcHJvcGVydHkgaW4gdGhlXG4gICAgKiBsYXllciBzdHlsZSB0byBgdHJ1ZWAuIFNlZSBNYXBib3gncyBzdHlsZSBzcGVjXG4gICAgKiBodHRwczovL3d3dy5tYXBib3guY29tL21hcGJveC1nbC1zdHlsZS1zcGVjLyNsYXllci1pbnRlcmFjdGl2ZVxuICAgICovXG4gIG9uQ2xpY2s6IFByb3BUeXBlcy5mdW5jLFxuXG4gIC8qKiBSYWRpdXMgdG8gZGV0ZWN0IGZlYXR1cmVzIGFyb3VuZCBhIGNsaWNrZWQgcG9pbnQuIERlZmF1bHRzIHRvIDAuICovXG4gIGNsaWNrUmFkaXVzOiBQcm9wVHlwZXMubnVtYmVyLFxuXG4gIC8qKiBBY2Nlc3NvciB0aGF0IHJldHVybnMgYSBjdXJzb3Igc3R5bGUgdG8gc2hvdyBpbnRlcmFjdGl2ZSBzdGF0ZSAqL1xuICBnZXRDdXJzb3I6IFByb3BUeXBlcy5mdW5jLFxuXG4gIC8qKiBBZHZhbmNlZCBmZWF0dXJlcyAqL1xuICAvLyBDb250cmFpbnRzIGZvciBkaXNwbGF5aW5nIHRoZSBtYXAuIElmIG5vdCBtZXQsIHRoZW4gdGhlIG1hcCBpcyBoaWRkZW4uXG4gIC8vIEV4cGVyaW1lbnRhbCEgTWF5IGJlIGNoYW5nZWQgaW4gbWlub3IgdmVyc2lvbiB1cGRhdGVzLlxuICB2aXNpYmlsaXR5Q29uc3RyYWludHM6IFByb3BUeXBlcy5zaGFwZSh7XG4gICAgbWluWm9vbTogUHJvcFR5cGVzLm51bWJlcixcbiAgICBtYXhab29tOiBQcm9wVHlwZXMubnVtYmVyLFxuICAgIG1pblBpdGNoOiBQcm9wVHlwZXMubnVtYmVyLFxuICAgIG1heFBpdGNoOiBQcm9wVHlwZXMubnVtYmVyXG4gIH0pLFxuICAvLyBBIG1hcCBjb250cm9sIGluc3RhbmNlIHRvIHJlcGxhY2UgdGhlIGRlZmF1bHQgbWFwIGNvbnRyb2xzXG4gIC8vIFRoZSBvYmplY3QgbXVzdCBleHBvc2Ugb25lIHByb3BlcnR5OiBgZXZlbnRzYCBhcyBhbiBhcnJheSBvZiBzdWJzY3JpYmVkXG4gIC8vIGV2ZW50IG5hbWVzOyBhbmQgdHdvIG1ldGhvZHM6IGBzZXRTdGF0ZShzdGF0ZSlgIGFuZCBgaGFuZGxlKGV2ZW50KWBcbiAgbWFwQ29udHJvbHM6IFByb3BUeXBlcy5zaGFwZSh7XG4gICAgZXZlbnRzOiBQcm9wVHlwZXMuYXJyYXlPZihQcm9wVHlwZXMuc3RyaW5nKSxcbiAgICBoYW5kbGVFdmVudDogUHJvcFR5cGVzLmZ1bmNcbiAgfSlcbn0pO1xuXG5jb25zdCBnZXREZWZhdWx0Q3Vyc29yID0gKHtpc0RyYWdnaW5nLCBpc0hvdmVyaW5nfSkgPT4gaXNEcmFnZ2luZyA/XG4gIGNvbmZpZy5DVVJTT1IuR1JBQkJJTkcgOlxuICAoaXNIb3ZlcmluZyA/IGNvbmZpZy5DVVJTT1IuUE9JTlRFUiA6IGNvbmZpZy5DVVJTT1IuR1JBQik7XG5cbmNvbnN0IGRlZmF1bHRQcm9wcyA9IE9iamVjdC5hc3NpZ24oe30sXG4gIFN0YXRpY01hcC5kZWZhdWx0UHJvcHMsIE1BUEJPWF9MSU1JVFMsIFRyYW5zaXRpb25NYW5hZ2VyLmRlZmF1bHRQcm9wcyxcbiAge1xuICAgIG9uVmlld3BvcnRDaGFuZ2U6IG51bGwsXG4gICAgb25DbGljazogbnVsbCxcbiAgICBvbkhvdmVyOiBudWxsLFxuXG4gICAgc2Nyb2xsWm9vbTogdHJ1ZSxcbiAgICBkcmFnUGFuOiB0cnVlLFxuICAgIGRyYWdSb3RhdGU6IHRydWUsXG4gICAgZG91YmxlQ2xpY2tab29tOiB0cnVlLFxuICAgIHRvdWNoWm9vbVJvdGF0ZTogdHJ1ZSxcblxuICAgIGNsaWNrUmFkaXVzOiAwLFxuICAgIGdldEN1cnNvcjogZ2V0RGVmYXVsdEN1cnNvcixcblxuICAgIHZpc2liaWxpdHlDb25zdHJhaW50czogTUFQQk9YX0xJTUlUU1xuICB9XG4pO1xuXG5jb25zdCBjaGlsZENvbnRleHRUeXBlcyA9IHtcbiAgdmlld3BvcnQ6IFByb3BUeXBlcy5pbnN0YW5jZU9mKFBlcnNwZWN0aXZlTWVyY2F0b3JWaWV3cG9ydCksXG4gIGlzRHJhZ2dpbmc6IFByb3BUeXBlcy5ib29sLFxuICBldmVudE1hbmFnZXI6IFByb3BUeXBlcy5vYmplY3Rcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEludGVyYWN0aXZlTWFwIGV4dGVuZHMgUHVyZUNvbXBvbmVudCB7XG5cbiAgc3RhdGljIHN1cHBvcnRlZCgpIHtcbiAgICByZXR1cm4gU3RhdGljTWFwLnN1cHBvcnRlZCgpO1xuICB9XG5cbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgYXV0b2JpbmQodGhpcyk7XG4gICAgLy8gQ2hlY2sgZm9yIGRlcHJlY2F0ZWQgcHJvcHNcbiAgICBkZXByZWNhdGVXYXJuKHByb3BzKTtcblxuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAvLyBXaGV0aGVyIHRoZSBjdXJzb3IgaXMgZG93blxuICAgICAgaXNEcmFnZ2luZzogZmFsc2UsXG4gICAgICAvLyBXaGV0aGVyIHRoZSBjdXJzb3IgaXMgb3ZlciBhIGNsaWNrYWJsZSBmZWF0dXJlXG4gICAgICBpc0hvdmVyaW5nOiBmYWxzZVxuICAgIH07XG5cbiAgICAvLyBJZiBwcm9wcy5tYXBDb250cm9scyBpcyBub3QgcHJvdmlkZWQsIGZhbGxiYWNrIHRvIGRlZmF1bHQgTWFwQ29udHJvbHMgaW5zdGFuY2VcbiAgICAvLyBDYW5ub3QgdXNlIGRlZmF1bHRQcm9wcyBoZXJlIGJlY2F1c2UgaXQgbmVlZHMgdG8gYmUgcGVyIG1hcCBpbnN0YW5jZVxuICAgIHRoaXMuX21hcENvbnRyb2xzID0gcHJvcHMubWFwQ29udHJvbHMgfHwgbmV3IE1hcENvbnRyb2xzKCk7XG4gIH1cblxuICBnZXRDaGlsZENvbnRleHQoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHZpZXdwb3J0OiBuZXcgUGVyc3BlY3RpdmVNZXJjYXRvclZpZXdwb3J0KHRoaXMucHJvcHMpLFxuICAgICAgaXNEcmFnZ2luZzogdGhpcy5zdGF0ZS5pc0RyYWdnaW5nLFxuICAgICAgZXZlbnRNYW5hZ2VyOiB0aGlzLl9ldmVudE1hbmFnZXJcbiAgICB9O1xuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgY29uc3QgZXZlbnRNYW5hZ2VyID0gbmV3IEV2ZW50TWFuYWdlcih0aGlzLl9ldmVudENhbnZhcywge3JpZ2h0QnV0dG9uOiB0cnVlfSk7XG5cbiAgICAvLyBSZWdpc3RlciBhZGRpdGlvbmFsIGV2ZW50IGhhbmRsZXJzIGZvciBjbGljayBhbmQgaG92ZXJcbiAgICBldmVudE1hbmFnZXIub24oJ21vdXNlbW92ZScsIHRoaXMuX29uTW91c2VNb3ZlKTtcbiAgICBldmVudE1hbmFnZXIub24oJ2NsaWNrJywgdGhpcy5fb25Nb3VzZUNsaWNrKTtcbiAgICB0aGlzLl9ldmVudE1hbmFnZXIgPSBldmVudE1hbmFnZXI7XG5cbiAgICB0aGlzLl9tYXBDb250cm9scy5zZXRPcHRpb25zKE9iamVjdC5hc3NpZ24oe30sIHRoaXMucHJvcHMsIHtcbiAgICAgIG9uU3RhdGVDaGFuZ2U6IHRoaXMuX29uSW50ZXJhY3RpdmVTdGF0ZUNoYW5nZSxcbiAgICAgIGV2ZW50TWFuYWdlclxuICAgIH0pKTtcblxuICAgIHRoaXMuX3RyYW5zaXRpb25NYW5hZ2VyID0gbmV3IFRyYW5zaXRpb25NYW5hZ2VyKHRoaXMucHJvcHMpO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFVwZGF0ZShuZXh0UHJvcHMpIHtcbiAgICB0aGlzLl9tYXBDb250cm9scy5zZXRPcHRpb25zKG5leHRQcm9wcyk7XG4gICAgdGhpcy5fdHJhbnNpdGlvbk1hbmFnZXIucHJvY2Vzc1ZpZXdwb3J0Q2hhbmdlKG5leHRQcm9wcyk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICBpZiAodGhpcy5fZXZlbnRNYW5hZ2VyKSB7XG4gICAgICAvLyBNdXN0IGRlc3Ryb3kgYmVjYXVzZSBoYW1tZXIgYWRkcyBldmVudCBsaXN0ZW5lcnMgdG8gd2luZG93XG4gICAgICB0aGlzLl9ldmVudE1hbmFnZXIuZGVzdHJveSgpO1xuICAgIH1cbiAgfVxuXG4gIGdldE1hcCgpIHtcbiAgICByZXR1cm4gdGhpcy5fbWFwLmdldE1hcCgpO1xuICB9XG5cbiAgcXVlcnlSZW5kZXJlZEZlYXR1cmVzKGdlb21ldHJ5LCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIHRoaXMuX21hcC5xdWVyeVJlbmRlcmVkRmVhdHVyZXMoZ2VvbWV0cnksIG9wdGlvbnMpO1xuICB9XG5cbiAgLy8gQ2hlY2tzIGEgdmlzaWJpbGl0eUNvbnN0cmFpbnRzIG9iamVjdCB0byBzZWUgaWYgdGhlIG1hcCBzaG91bGQgYmUgZGlzcGxheWVkXG4gIF9jaGVja1Zpc2liaWxpdHlDb25zdHJhaW50cyhwcm9wcykge1xuICAgIGNvbnN0IGNhcGl0YWxpemUgPSBzID0+IHNbMF0udG9VcHBlckNhc2UoKSArIHMuc2xpY2UoMSk7XG5cbiAgICBjb25zdCB7dmlzaWJpbGl0eUNvbnN0cmFpbnRzfSA9IHByb3BzO1xuICAgIGZvciAoY29uc3QgcHJvcE5hbWUgaW4gcHJvcHMpIHtcbiAgICAgIGNvbnN0IGNhcGl0YWxpemVkUHJvcE5hbWUgPSBjYXBpdGFsaXplKHByb3BOYW1lKTtcbiAgICAgIGNvbnN0IG1pblByb3BOYW1lID0gYG1pbiR7Y2FwaXRhbGl6ZWRQcm9wTmFtZX1gO1xuICAgICAgY29uc3QgbWF4UHJvcE5hbWUgPSBgbWF4JHtjYXBpdGFsaXplZFByb3BOYW1lfWA7XG5cbiAgICAgIGlmIChtaW5Qcm9wTmFtZSBpbiB2aXNpYmlsaXR5Q29uc3RyYWludHMgJiZcbiAgICAgICAgcHJvcHNbcHJvcE5hbWVdIDwgdmlzaWJpbGl0eUNvbnN0cmFpbnRzW21pblByb3BOYW1lXSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICBpZiAobWF4UHJvcE5hbWUgaW4gdmlzaWJpbGl0eUNvbnN0cmFpbnRzICYmXG4gICAgICAgIHByb3BzW3Byb3BOYW1lXSA+IHZpc2liaWxpdHlDb25zdHJhaW50c1ttYXhQcm9wTmFtZV0pIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIF9nZXRGZWF0dXJlcyh7cG9zLCByYWRpdXN9KSB7XG4gICAgbGV0IGZlYXR1cmVzO1xuICAgIGlmIChyYWRpdXMpIHtcbiAgICAgIC8vIFJhZGl1cyBlbmFibGVzIHBvaW50IGZlYXR1cmVzLCBsaWtlIG1hcmtlciBzeW1ib2xzLCB0byBiZSBjbGlja2VkLlxuICAgICAgY29uc3Qgc2l6ZSA9IHJhZGl1cztcbiAgICAgIGNvbnN0IGJib3ggPSBbW3Bvc1swXSAtIHNpemUsIHBvc1sxXSArIHNpemVdLCBbcG9zWzBdICsgc2l6ZSwgcG9zWzFdIC0gc2l6ZV1dO1xuICAgICAgZmVhdHVyZXMgPSB0aGlzLl9tYXAucXVlcnlSZW5kZXJlZEZlYXR1cmVzKGJib3gpO1xuICAgIH0gZWxzZSB7XG4gICAgICBmZWF0dXJlcyA9IHRoaXMuX21hcC5xdWVyeVJlbmRlcmVkRmVhdHVyZXMocG9zKTtcbiAgICB9XG4gICAgcmV0dXJuIGZlYXR1cmVzO1xuICB9XG5cbiAgX29uSW50ZXJhY3RpdmVTdGF0ZUNoYW5nZSh7aXNEcmFnZ2luZyA9IGZhbHNlfSkge1xuICAgIGlmIChpc0RyYWdnaW5nICE9PSB0aGlzLnN0YXRlLmlzRHJhZ2dpbmcpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe2lzRHJhZ2dpbmd9KTtcbiAgICB9XG4gIH1cblxuICAvLyBIT1ZFUiBBTkQgQ0xJQ0tcbiAgX2dldFBvcyhldmVudCkge1xuICAgIGNvbnN0IHtvZmZzZXRDZW50ZXI6IHt4LCB5fX0gPSBldmVudDtcbiAgICByZXR1cm4gW3gsIHldO1xuICB9XG5cbiAgX29uTW91c2VNb3ZlKGV2ZW50KSB7XG4gICAgaWYgKCF0aGlzLnN0YXRlLmlzRHJhZ2dpbmcpIHtcbiAgICAgIGNvbnN0IHBvcyA9IHRoaXMuX2dldFBvcyhldmVudCk7XG4gICAgICBjb25zdCBmZWF0dXJlcyA9IHRoaXMuX2dldEZlYXR1cmVzKHtwb3MsIHJhZGl1czogdGhpcy5wcm9wcy5jbGlja1JhZGl1c30pO1xuXG4gICAgICBjb25zdCBpc0hvdmVyaW5nID0gZmVhdHVyZXMgJiYgZmVhdHVyZXMubGVuZ3RoID4gMDtcbiAgICAgIGlmIChpc0hvdmVyaW5nICE9PSB0aGlzLnN0YXRlLmlzSG92ZXJpbmcpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7aXNIb3ZlcmluZ30pO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5wcm9wcy5vbkhvdmVyKSB7XG4gICAgICAgIGNvbnN0IHZpZXdwb3J0ID0gbmV3IFBlcnNwZWN0aXZlTWVyY2F0b3JWaWV3cG9ydCh0aGlzLnByb3BzKTtcbiAgICAgICAgZXZlbnQubG5nTGF0ID0gdmlld3BvcnQudW5wcm9qZWN0KHBvcyk7XG4gICAgICAgIGV2ZW50LmZlYXR1cmVzID0gZmVhdHVyZXM7XG5cbiAgICAgICAgdGhpcy5wcm9wcy5vbkhvdmVyKGV2ZW50KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfb25Nb3VzZUNsaWNrKGV2ZW50KSB7XG4gICAgaWYgKHRoaXMucHJvcHMub25DbGljaykge1xuICAgICAgY29uc3QgcG9zID0gdGhpcy5fZ2V0UG9zKGV2ZW50KTtcbiAgICAgIGNvbnN0IHZpZXdwb3J0ID0gbmV3IFBlcnNwZWN0aXZlTWVyY2F0b3JWaWV3cG9ydCh0aGlzLnByb3BzKTtcbiAgICAgIGV2ZW50LmxuZ0xhdCA9IHZpZXdwb3J0LnVucHJvamVjdChwb3MpO1xuICAgICAgZXZlbnQuZmVhdHVyZXMgPSB0aGlzLl9nZXRGZWF0dXJlcyh7cG9zLCByYWRpdXM6IHRoaXMucHJvcHMuY2xpY2tSYWRpdXN9KTtcblxuICAgICAgdGhpcy5wcm9wcy5vbkNsaWNrKGV2ZW50KTtcbiAgICB9XG4gIH1cblxuICBfZXZlbnRDYW52YXNMb2FkZWQocmVmKSB7XG4gICAgdGhpcy5fZXZlbnRDYW52YXMgPSByZWY7XG4gIH1cblxuICBfc3RhdGljTWFwTG9hZGVkKHJlZikge1xuICAgIHRoaXMuX21hcCA9IHJlZjtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCB7d2lkdGgsIGhlaWdodCwgZ2V0Q3Vyc29yfSA9IHRoaXMucHJvcHM7XG5cbiAgICBjb25zdCBldmVudENhbnZhc1N0eWxlID0ge1xuICAgICAgd2lkdGgsXG4gICAgICBoZWlnaHQsXG4gICAgICBwb3NpdGlvbjogJ3JlbGF0aXZlJyxcbiAgICAgIGN1cnNvcjogZ2V0Q3Vyc29yKHRoaXMuc3RhdGUpXG4gICAgfTtcblxuICAgIHJldHVybiAoXG4gICAgICBjcmVhdGVFbGVtZW50KCdkaXYnLCB7XG4gICAgICAgIGtleTogJ21hcC1jb250cm9scycsXG4gICAgICAgIHJlZjogdGhpcy5fZXZlbnRDYW52YXNMb2FkZWQsXG4gICAgICAgIHN0eWxlOiBldmVudENhbnZhc1N0eWxlXG4gICAgICB9LFxuICAgICAgICBjcmVhdGVFbGVtZW50KFN0YXRpY01hcCwgT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5wcm9wcyxcbiAgICAgICAgICB0aGlzLl90cmFuc2l0aW9uTWFuYWdlciAmJiB0aGlzLl90cmFuc2l0aW9uTWFuYWdlci5nZXRWaWV3cG9ydEluVHJhbnNpdGlvbigpLFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHZpc2libGU6IHRoaXMuX2NoZWNrVmlzaWJpbGl0eUNvbnN0cmFpbnRzKHRoaXMucHJvcHMpLFxuICAgICAgICAgICAgcmVmOiB0aGlzLl9zdGF0aWNNYXBMb2FkZWQsXG4gICAgICAgICAgICBjaGlsZHJlbjogdGhpcy5fZXZlbnRNYW5hZ2VyID8gdGhpcy5wcm9wcy5jaGlsZHJlbiA6IG51bGxcbiAgICAgICAgICB9XG4gICAgICAgICkpXG4gICAgICApXG4gICAgKTtcbiAgfVxufVxuXG5JbnRlcmFjdGl2ZU1hcC5kaXNwbGF5TmFtZSA9ICdJbnRlcmFjdGl2ZU1hcCc7XG5JbnRlcmFjdGl2ZU1hcC5wcm9wVHlwZXMgPSBwcm9wVHlwZXM7XG5JbnRlcmFjdGl2ZU1hcC5kZWZhdWx0UHJvcHMgPSBkZWZhdWx0UHJvcHM7XG5JbnRlcmFjdGl2ZU1hcC5jaGlsZENvbnRleHRUeXBlcyA9IGNoaWxkQ29udGV4dFR5cGVzO1xuIl19