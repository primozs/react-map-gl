'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MAPBOX_LIMITS = undefined;

var _log = require('babel-runtime/core-js/math/log2');

var _log2 = _interopRequireDefault(_log);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _isFinite = require('babel-runtime/core-js/number/is-finite');

var _isFinite2 = _interopRequireDefault(_isFinite);

var _viewportMercatorProject = require('viewport-mercator-project');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// MAPBOX LIMITS
var MAPBOX_LIMITS = exports.MAPBOX_LIMITS = {
  minZoom: 0,
  maxZoom: 20,
  minPitch: 0,
  maxPitch: 60,
  // defined by mapbox-gl
  maxLatitude: 85.05113,
  minLatitude: -85.05113
};

var defaultState = {
  pitch: 0,
  bearing: 0,
  altitude: 1.5
};

/* Utils */
function mod(value, divisor) {
  var modulus = value % divisor;
  return modulus < 0 ? divisor + modulus : modulus;
}

function ensureFinite(value, fallbackValue) {
  return (0, _isFinite2.default)(value) ? value : fallbackValue;
}

var MapState = function () {
  function MapState() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        width = _ref.width,
        height = _ref.height,
        latitude = _ref.latitude,
        longitude = _ref.longitude,
        zoom = _ref.zoom,
        bearing = _ref.bearing,
        pitch = _ref.pitch,
        altitude = _ref.altitude,
        maxZoom = _ref.maxZoom,
        minZoom = _ref.minZoom,
        maxPitch = _ref.maxPitch,
        minPitch = _ref.minPitch,
        maxLatitude = _ref.maxLatitude,
        minLatitude = _ref.minLatitude,
        startPanLngLat = _ref.startPanLngLat,
        startZoomLngLat = _ref.startZoomLngLat,
        startBearing = _ref.startBearing,
        startPitch = _ref.startPitch,
        startZoom = _ref.startZoom;

    (0, _classCallCheck3.default)(this, MapState);

    (0, _assert2.default)((0, _isFinite2.default)(width), '`width` must be supplied');
    (0, _assert2.default)((0, _isFinite2.default)(height), '`height` must be supplied');
    (0, _assert2.default)((0, _isFinite2.default)(longitude), '`longitude` must be supplied');
    (0, _assert2.default)((0, _isFinite2.default)(latitude), '`latitude` must be supplied');
    (0, _assert2.default)((0, _isFinite2.default)(zoom), '`zoom` must be supplied');

    this._viewportProps = this._applyConstraints({
      width: width,
      height: height,
      latitude: latitude,
      longitude: longitude,
      zoom: zoom,
      bearing: ensureFinite(bearing, defaultState.bearing),
      pitch: ensureFinite(pitch, defaultState.pitch),
      altitude: ensureFinite(altitude, defaultState.altitude),
      maxZoom: ensureFinite(maxZoom, MAPBOX_LIMITS.maxZoom),
      minZoom: ensureFinite(minZoom, MAPBOX_LIMITS.minZoom),
      maxPitch: ensureFinite(maxPitch, MAPBOX_LIMITS.maxPitch),
      minPitch: ensureFinite(minPitch, MAPBOX_LIMITS.minPitch),
      maxLatitude: ensureFinite(maxLatitude, MAPBOX_LIMITS.maxLatitude),
      minLatitude: ensureFinite(minLatitude, MAPBOX_LIMITS.minLatitude)
    });

    this._interactiveState = {
      startPanLngLat: startPanLngLat,
      startZoomLngLat: startZoomLngLat,
      startBearing: startBearing,
      startPitch: startPitch,
      startZoom: startZoom
    };
  }

  /* Public API */

  (0, _createClass3.default)(MapState, [{
    key: 'getViewportProps',
    value: function getViewportProps() {
      return this._viewportProps;
    }
  }, {
    key: 'getInteractiveState',
    value: function getInteractiveState() {
      return this._interactiveState;
    }

    /**
     * Start panning
     * @param {[Number, Number]} pos - position on screen where the pointer grabs
     */

  }, {
    key: 'panStart',
    value: function panStart(_ref2) {
      var pos = _ref2.pos;

      return this._getUpdatedMapState({
        startPanLngLat: this._unproject(pos)
      });
    }

    /**
     * Pan
     * @param {[Number, Number]} pos - position on screen where the pointer is
     * @param {[Number, Number], optional} startPos - where the pointer grabbed at
     *   the start of the operation. Must be supplied of `panStart()` was not called
     */

  }, {
    key: 'pan',
    value: function pan(_ref3) {
      var pos = _ref3.pos,
          startPos = _ref3.startPos;

      var startPanLngLat = this._interactiveState.startPanLngLat || this._unproject(startPos);

      if (!startPanLngLat) {
        return this;
      }

      var _calculateNewLngLat2 = this._calculateNewLngLat({ startPanLngLat: startPanLngLat, pos: pos }),
          _calculateNewLngLat3 = (0, _slicedToArray3.default)(_calculateNewLngLat2, 2),
          longitude = _calculateNewLngLat3[0],
          latitude = _calculateNewLngLat3[1];

      return this._getUpdatedMapState({
        longitude: longitude,
        latitude: latitude
      });
    }

    /**
     * End panning
     * Must call if `panStart()` was called
     */

  }, {
    key: 'panEnd',
    value: function panEnd() {
      return this._getUpdatedMapState({
        startPanLngLat: null
      });
    }

    /**
     * Start rotating
     * @param {[Number, Number]} pos - position on screen where the center is
     */

  }, {
    key: 'rotateStart',
    value: function rotateStart(_ref4) {
      var pos = _ref4.pos;

      return this._getUpdatedMapState({
        startBearing: this._viewportProps.bearing,
        startPitch: this._viewportProps.pitch
      });
    }

    /**
     * Rotate
     * @param {Number} deltaScaleX - a number between [-1, 1] specifying the
     *   change to bearing.
     * @param {Number} deltaScaleY - a number between [-1, 1] specifying the
     *   change to pitch. -1 sets to minPitch and 1 sets to maxPitch.
     */

  }, {
    key: 'rotate',
    value: function rotate(_ref5) {
      var deltaScaleX = _ref5.deltaScaleX,
          deltaScaleY = _ref5.deltaScaleY;

      (0, _assert2.default)(deltaScaleX >= -1 && deltaScaleX <= 1, '`deltaScaleX` must be a number between [-1, 1]');
      (0, _assert2.default)(deltaScaleY >= -1 && deltaScaleY <= 1, '`deltaScaleY` must be a number between [-1, 1]');

      var _interactiveState = this._interactiveState,
          startBearing = _interactiveState.startBearing,
          startPitch = _interactiveState.startPitch;


      if (!(0, _isFinite2.default)(startBearing) || !(0, _isFinite2.default)(startPitch)) {
        return this;
      }

      var _calculateNewPitchAnd = this._calculateNewPitchAndBearing({
        deltaScaleX: deltaScaleX,
        deltaScaleY: deltaScaleY,
        startBearing: startBearing,
        startPitch: startPitch
      }),
          pitch = _calculateNewPitchAnd.pitch,
          bearing = _calculateNewPitchAnd.bearing;

      return this._getUpdatedMapState({
        bearing: bearing,
        pitch: pitch
      });
    }

    /**
     * End rotating
     * Must call if `rotateStart()` was called
     */

  }, {
    key: 'rotateEnd',
    value: function rotateEnd() {
      return this._getUpdatedMapState({
        startBearing: null,
        startPitch: null
      });
    }

    /**
     * Start zooming
     * @param {[Number, Number]} pos - position on screen where the center is
     */

  }, {
    key: 'zoomStart',
    value: function zoomStart(_ref6) {
      var pos = _ref6.pos;

      return this._getUpdatedMapState({
        startZoomLngLat: this._unproject(pos),
        startZoom: this._viewportProps.zoom
      });
    }

    /**
     * Zoom
     * @param {[Number, Number]} pos - position on screen where the current center is
     * @param {[Number, Number]} startPos - the center position at
     *   the start of the operation. Must be supplied of `zoomStart()` was not called
     * @param {Number} scale - a number between [0, 1] specifying the accumulated
     *   relative scale.
     */

  }, {
    key: 'zoom',
    value: function zoom(_ref7) {
      var pos = _ref7.pos,
          startPos = _ref7.startPos,
          scale = _ref7.scale;

      (0, _assert2.default)(scale > 0, '`scale` must be a positive number');

      // Make sure we zoom around the current mouse position rather than map center
      var startZoomLngLat = this._interactiveState.startZoomLngLat || this._unproject(startPos) || this._unproject(pos);
      var startZoom = this._interactiveState.startZoom;


      if (!(0, _isFinite2.default)(startZoom)) {
        startZoom = this._viewportProps.zoom;
      }

      // take the start lnglat and put it where the mouse is down.
      (0, _assert2.default)(startZoomLngLat, '`startZoomLngLat` prop is required ' + 'for zoom behavior to calculate where to position the map.');

      var zoom = this._calculateNewZoom({ scale: scale, startZoom: startZoom });

      var zoomedViewport = new _viewportMercatorProject.PerspectiveMercatorViewport((0, _assign2.default)({}, this._viewportProps, { zoom: zoom }));

      var _zoomedViewport$getLo = zoomedViewport.getLocationAtPoint({ lngLat: startZoomLngLat, pos: pos }),
          _zoomedViewport$getLo2 = (0, _slicedToArray3.default)(_zoomedViewport$getLo, 2),
          longitude = _zoomedViewport$getLo2[0],
          latitude = _zoomedViewport$getLo2[1];

      return this._getUpdatedMapState({
        zoom: zoom,
        longitude: longitude,
        latitude: latitude
      });
    }

    /**
     * End zooming
     * Must call if `zoomStart()` was called
     */

  }, {
    key: 'zoomEnd',
    value: function zoomEnd() {
      return this._getUpdatedMapState({
        startZoomLngLat: null,
        startZoom: null
      });
    }

    /* Private methods */

  }, {
    key: '_getUpdatedMapState',
    value: function _getUpdatedMapState(newProps) {
      // Update _viewportProps
      return new MapState((0, _assign2.default)({}, this._viewportProps, this._interactiveState, newProps));
    }

    // Apply any constraints (mathematical or defined by _viewportProps) to map state
    /* eslint-disable complexity */

  }, {
    key: '_applyConstraints',
    value: function _applyConstraints(props) {
      // Normalize degrees
      var longitude = props.longitude,
          bearing = props.bearing;

      if (longitude < -180 || longitude > 180) {
        props.longitude = mod(longitude + 180, 360) - 180;
      }
      if (bearing < -180 || bearing > 180) {
        props.bearing = mod(bearing + 180, 360) - 180;
      }

      // Ensure zoom is within specified range
      var maxZoom = props.maxZoom,
          minZoom = props.minZoom,
          zoom = props.zoom;

      props.zoom = zoom > maxZoom ? maxZoom : zoom;
      props.zoom = zoom < minZoom ? minZoom : zoom;

      // Ensure pitch is within specified range
      var maxPitch = props.maxPitch,
          minPitch = props.minPitch,
          pitch = props.pitch;


      props.pitch = pitch > maxPitch ? maxPitch : pitch;
      props.pitch = pitch < minPitch ? minPitch : pitch;

      // Constrain zoom and shift center at low zoom levels
      var height = props.height;

      var _getLatitudeRange2 = this._getLatitudeRange(props),
          _getLatitudeRange2$la = (0, _slicedToArray3.default)(_getLatitudeRange2.latitudeRange, 2),
          topY = _getLatitudeRange2$la[0],
          bottomY = _getLatitudeRange2$la[1],
          viewport = _getLatitudeRange2.viewport;

      var shiftY = 0;

      if (bottomY - topY < height) {
        // Map height must not be smaller than viewport height
        props.zoom += (0, _log2.default)(height / (bottomY - topY));
        var newRange = this._getLatitudeRange(props);

        var _newRange$latitudeRan = (0, _slicedToArray3.default)(newRange.latitudeRange, 2);

        topY = _newRange$latitudeRan[0];
        bottomY = _newRange$latitudeRan[1];

        viewport = newRange.viewport;
      }
      if (topY > 0) {
        // Compensate for white gap on top
        shiftY = topY;
      } else if (bottomY < height) {
        // Compensate for white gap on bottom
        shiftY = bottomY - height;
      }
      if (shiftY) {
        props.latitude = viewport.unproject([props.width / 2, height / 2 + shiftY])[1];
      }

      return props;
    }
    /* eslint-enable complexity */

    // Returns {viewport, latitudeRange: [topY, bottomY]} in non-perspective mode

  }, {
    key: '_getLatitudeRange',
    value: function _getLatitudeRange(props) {
      var flatViewport = new _viewportMercatorProject.PerspectiveMercatorViewport((0, _assign2.default)({}, props, {
        pitch: 0,
        bearing: 0
      }));
      return {
        viewport: flatViewport,
        latitudeRange: [flatViewport.project([props.longitude, props.maxLatitude])[1], flatViewport.project([props.longitude, props.minLatitude])[1]]
      };
    }
  }, {
    key: '_unproject',
    value: function _unproject(pos) {
      var viewport = new _viewportMercatorProject.PerspectiveMercatorViewport(this._viewportProps);
      return pos && viewport.unproject(pos, { topLeft: false });
    }

    // Calculate a new lnglat based on pixel dragging position

  }, {
    key: '_calculateNewLngLat',
    value: function _calculateNewLngLat(_ref8) {
      var startPanLngLat = _ref8.startPanLngLat,
          pos = _ref8.pos;

      var viewport = new _viewportMercatorProject.PerspectiveMercatorViewport(this._viewportProps);
      return viewport.getLocationAtPoint({ lngLat: startPanLngLat, pos: pos });
    }

    // Calculates new zoom

  }, {
    key: '_calculateNewZoom',
    value: function _calculateNewZoom(_ref9) {
      var scale = _ref9.scale,
          startZoom = _ref9.startZoom;
      var _viewportProps = this._viewportProps,
          maxZoom = _viewportProps.maxZoom,
          minZoom = _viewportProps.minZoom;

      var zoom = startZoom + (0, _log2.default)(scale);
      zoom = zoom > maxZoom ? maxZoom : zoom;
      zoom = zoom < minZoom ? minZoom : zoom;
      return zoom;
    }

    // Calculates a new pitch and bearing from a position (coming from an event)

  }, {
    key: '_calculateNewPitchAndBearing',
    value: function _calculateNewPitchAndBearing(_ref10) {
      var deltaScaleX = _ref10.deltaScaleX,
          deltaScaleY = _ref10.deltaScaleY,
          startBearing = _ref10.startBearing,
          startPitch = _ref10.startPitch;
      var _viewportProps2 = this._viewportProps,
          minPitch = _viewportProps2.minPitch,
          maxPitch = _viewportProps2.maxPitch;


      var bearing = startBearing + 180 * deltaScaleX;
      var pitch = startPitch;
      if (deltaScaleY > 0) {
        // Gradually increase pitch
        pitch = startPitch + deltaScaleY * (maxPitch - startPitch);
      } else if (deltaScaleY < 0) {
        // Gradually decrease pitch
        pitch = startPitch - deltaScaleY * (minPitch - startPitch);
      }

      return {
        pitch: pitch,
        bearing: bearing
      };
    }
  }]);
  return MapState;
}();

exports.default = MapState;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9tYXAtc3RhdGUuanMiXSwibmFtZXMiOlsiTUFQQk9YX0xJTUlUUyIsIm1pblpvb20iLCJtYXhab29tIiwibWluUGl0Y2giLCJtYXhQaXRjaCIsIm1heExhdGl0dWRlIiwibWluTGF0aXR1ZGUiLCJkZWZhdWx0U3RhdGUiLCJwaXRjaCIsImJlYXJpbmciLCJhbHRpdHVkZSIsIm1vZCIsInZhbHVlIiwiZGl2aXNvciIsIm1vZHVsdXMiLCJlbnN1cmVGaW5pdGUiLCJmYWxsYmFja1ZhbHVlIiwiTWFwU3RhdGUiLCJ3aWR0aCIsImhlaWdodCIsImxhdGl0dWRlIiwibG9uZ2l0dWRlIiwiem9vbSIsInN0YXJ0UGFuTG5nTGF0Iiwic3RhcnRab29tTG5nTGF0Iiwic3RhcnRCZWFyaW5nIiwic3RhcnRQaXRjaCIsInN0YXJ0Wm9vbSIsIl92aWV3cG9ydFByb3BzIiwiX2FwcGx5Q29uc3RyYWludHMiLCJfaW50ZXJhY3RpdmVTdGF0ZSIsInBvcyIsIl9nZXRVcGRhdGVkTWFwU3RhdGUiLCJfdW5wcm9qZWN0Iiwic3RhcnRQb3MiLCJfY2FsY3VsYXRlTmV3TG5nTGF0IiwiZGVsdGFTY2FsZVgiLCJkZWx0YVNjYWxlWSIsIl9jYWxjdWxhdGVOZXdQaXRjaEFuZEJlYXJpbmciLCJzY2FsZSIsIl9jYWxjdWxhdGVOZXdab29tIiwiem9vbWVkVmlld3BvcnQiLCJnZXRMb2NhdGlvbkF0UG9pbnQiLCJsbmdMYXQiLCJuZXdQcm9wcyIsInByb3BzIiwiX2dldExhdGl0dWRlUmFuZ2UiLCJsYXRpdHVkZVJhbmdlIiwidG9wWSIsImJvdHRvbVkiLCJ2aWV3cG9ydCIsInNoaWZ0WSIsIm5ld1JhbmdlIiwidW5wcm9qZWN0IiwiZmxhdFZpZXdwb3J0IiwicHJvamVjdCIsInRvcExlZnQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7QUFDQTs7Ozs7O0FBRUE7QUFDTyxJQUFNQSx3Q0FBZ0I7QUFDM0JDLFdB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LE9BRDZCO0FBQUEsVUFDcEJELE9BRG9CLGtCQUNwQkEsT0FEb0I7O0FBRXBDLFVBQUlxQixPQUFPSyxZQUFZLG1CQUFVWSxLQUFWLENBQXZCO0FBQ0FqQixhQUFPQSxPQUFPcEIsT0FBUCxHQUFpQkEsT0FBakIsR0FBMkJvQixJQUFsQztBQUNBQSxhQUFPQSxPQUFPckIsT0FBUCxHQUFpQkEsT0FBakIsR0FBMkJxQixJQUFsQztBQUNBLGFBQU9BLElBQVA7QUFDRDs7QUFFRDs7Ozt5REFDbUY7QUFBQSxVQUFyRGMsV0FBcUQsVUFBckRBLFdBQXFEO0FBQUEsVUFBeENDLFdBQXdDLFVBQXhDQSxXQUF3QztBQUFBLFVBQTNCWixZQUEyQixVQUEzQkEsWUFBMkI7QUFBQSxVQUFiQyxVQUFhLFVBQWJBLFVBQWE7QUFBQSw0QkFDcEQsS0FBS0UsY0FEK0M7QUFBQSxVQUMxRXpCLFFBRDBFLG1CQUMxRUEsUUFEMEU7QUFBQSxVQUNoRUMsUUFEZ0UsbUJBQ2hFQSxRQURnRTs7O0FBR2pGLFVBQU1LLFVBQVVnQixlQUFlLE1BQU1XLFdBQXJDO0FBQ0EsVUFBSTVCLFFBQVFrQixVQUFaO0FBQ0EsVUFBSVcsY0FBYyxDQUFsQixFQUFxQjtBQUNuQjtBQUNBN0IsZ0JBQVFrQixhQUFhVyxlQUFlakMsV0FBV3NCLFVBQTFCLENBQXJCO0FBQ0QsT0FIRCxNQUdPLElBQUlXLGNBQWMsQ0FBbEIsRUFBcUI7QUFDMUI7QUFDQTdCLGdCQUFRa0IsYUFBYVcsZUFBZWxDLFdBQVd1QixVQUExQixDQUFyQjtBQUNEOztBQUVELGFBQU87QUFDTGxCLG9CQURLO0FBRUxDO0FBRkssT0FBUDtBQUlEOzs7OztrQkFoV2tCUSxRIiwiZmlsZSI6Im1hcC1zdGF0ZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7UGVyc3BlY3RpdmVNZXJjYXRvclZpZXdwb3J0fSBmcm9tICd2aWV3cG9ydC1tZXJjYXRvci1wcm9qZWN0JztcbmltcG9ydCBhc3NlcnQgZnJvbSAnYXNzZXJ0JztcblxuLy8gTUFQQk9YIExJTUlUU1xuZXhwb3J0IGNvbnN0IE1BUEJPWF9MSU1JVFMgPSB7XG4gIG1pblpvb206IDAsXG4gIG1heFpvb206IDIwLFxuICBtaW5QaXRjaDogMCxcbiAgbWF4UGl0Y2g6IDYwLFxuICAvLyBkZWZpbmVkIGJ5IG1hcGJveC1nbFxuICBtYXhMYXRpdHVkZTogODUuMDUxMTMsXG4gIG1pbkxhdGl0dWRlOiAtODUuMDUxMTNcbn07XG5cbmNvbnN0IGRlZmF1bHRTdGF0ZSA9IHtcbiAgcGl0Y2g6IDAsXG4gIGJlYXJpbmc6IDAsXG4gIGFsdGl0dWRlOiAxLjVcbn07XG5cbi8qIFV0aWxzICovXG5mdW5jdGlvbiBtb2QodmFsdWUsIGRpdmlzb3IpIHtcbiAgY29uc3QgbW9kdWx1cyA9IHZhbHVlICUgZGl2aXNvcjtcbiAgcmV0dXJuIG1vZHVsdXMgPCAwID8gZGl2aXNvciArIG1vZHVsdXMgOiBtb2R1bHVzO1xufVxuXG5mdW5jdGlvbiBlbnN1cmVGaW5pdGUodmFsdWUsIGZhbGxiYWNrVmFsdWUpIHtcbiAgcmV0dXJuIE51bWJlci5pc0Zpbml0ZSh2YWx1ZSkgPyB2YWx1ZSA6IGZhbGxiYWNrVmFsdWU7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1hcFN0YXRlIHtcblxuICBjb25zdHJ1Y3Rvcih7XG4gICAgLyoqIE1hcGJveCB2aWV3cG9ydCBwcm9wZXJ0aWVzICovXG4gICAgLyoqIFRoZSB3aWR0aCBvZiB0aGUgdmlld3BvcnQgKi9cbiAgICB3aWR0aCxcbiAgICAvKiogVGhlIGhlaWdodCBvZiB0aGUgdmlld3BvcnQgKi9cbiAgICBoZWlnaHQsXG4gICAgLyoqIFRoZSBsYXRpdHVkZSBhdCB0aGUgY2VudGVyIG9mIHRoZSB2aWV3cG9ydCAqL1xuICAgIGxhdGl0dWRlLFxuICAgIC8qKiBUaGUgbG9uZ2l0dWRlIGF0IHRoZSBjZW50ZXIgb2YgdGhlIHZpZXdwb3J0ICovXG4gICAgbG9uZ2l0dWRlLFxuICAgIC8qKiBUaGUgdGlsZSB6b29tIGxldmVsIG9mIHRoZSBtYXAuICovXG4gICAgem9vbSxcbiAgICAvKiogVGhlIGJlYXJpbmcgb2YgdGhlIHZpZXdwb3J0IGluIGRlZ3JlZXMgKi9cbiAgICBiZWFyaW5nLFxuICAgIC8qKiBUaGUgcGl0Y2ggb2YgdGhlIHZpZXdwb3J0IGluIGRlZ3JlZXMgKi9cbiAgICBwaXRjaCxcbiAgICAvKipcbiAgICAqIFNwZWNpZnkgdGhlIGFsdGl0dWRlIG9mIHRoZSB2aWV3cG9ydCBjYW1lcmFcbiAgICAqIFVuaXQ6IG1hcCBoZWlnaHRzLCBkZWZhdWx0IDEuNVxuICAgICogTm9uLXB1YmxpYyBBUEksIHNlZSBodHRwczovL2dpdGh1Yi5jb20vbWFwYm94L21hcGJveC1nbC1qcy9pc3N1ZXMvMTEzN1xuICAgICovXG4gICAgYWx0aXR1ZGUsXG5cbiAgICAvKiogVmlld3BvcnQgY29uc3RyYWludHMgKi9cbiAgICBtYXhab29tLFxuICAgIG1pblpvb20sXG4gICAgbWF4UGl0Y2gsXG4gICAgbWluUGl0Y2gsXG4gICAgbWF4TGF0aXR1ZGUsXG4gICAgbWluTGF0aXR1ZGUsXG5cbiAgICAvKiogSW50ZXJhY3Rpb24gc3RhdGVzLCByZXF1aXJlZCB0byBjYWxjdWxhdGUgY2hhbmdlIGR1cmluZyB0cmFuc2Zvcm0gKi9cbiAgICAvKiBUaGUgcG9pbnQgb24gbWFwIGJlaW5nIGdyYWJiZWQgd2hlbiB0aGUgb3BlcmF0aW9uIGZpcnN0IHN0YXJ0ZWQgKi9cbiAgICBzdGFydFBhbkxuZ0xhdCxcbiAgICAvKiBDZW50ZXIgb2YgdGhlIHpvb20gd2hlbiB0aGUgb3BlcmF0aW9uIGZpcnN0IHN0YXJ0ZWQgKi9cbiAgICBzdGFydFpvb21MbmdMYXQsXG4gICAgLyoqIEJlYXJpbmcgd2hlbiBjdXJyZW50IHBlcnNwZWN0aXZlIHJvdGF0ZSBvcGVyYXRpb24gc3RhcnRlZCAqL1xuICAgIHN0YXJ0QmVhcmluZyxcbiAgICAvKiogUGl0Y2ggd2hlbiBjdXJyZW50IHBlcnNwZWN0aXZlIHJvdGF0ZSBvcGVyYXRpb24gc3RhcnRlZCAqL1xuICAgIHN0YXJ0UGl0Y2gsXG4gICAgLyoqIFpvb20gd2hlbiBjdXJyZW50IHpvb20gb3BlcmF0aW9uIHN0YXJ0ZWQgKi9cbiAgICBzdGFydFpvb21cbiAgfSA9IHt9KSB7XG4gICAgYXNzZXJ0KE51bWJlci5pc0Zpbml0ZSh3aWR0aCksICdgd2lkdGhgIG11c3QgYmUgc3VwcGxpZWQnKTtcbiAgICBhc3NlcnQoTnVtYmVyLmlzRmluaXRlKGhlaWdodCksICdgaGVpZ2h0YCBtdXN0IGJlIHN1cHBsaWVkJyk7XG4gICAgYXNzZXJ0KE51bWJlci5pc0Zpbml0ZShsb25naXR1ZGUpLCAnYGxvbmdpdHVkZWAgbXVzdCBiZSBzdXBwbGllZCcpO1xuICAgIGFzc2VydChOdW1iZXIuaXNGaW5pdGUobGF0aXR1ZGUpLCAnYGxhdGl0dWRlYCBtdXN0IGJlIHN1cHBsaWVkJyk7XG4gICAgYXNzZXJ0KE51bWJlci5pc0Zpbml0ZSh6b29tKSwgJ2B6b29tYCBtdXN0IGJlIHN1cHBsaWVkJyk7XG5cbiAgICB0aGlzLl92aWV3cG9ydFByb3BzID0gdGhpcy5fYXBwbHlDb25zdHJhaW50cyh7XG4gICAgICB3aWR0aCxcbiAgICAgIGhlaWdodCxcbiAgICAgIGxhdGl0dWRlLFxuICAgICAgbG9uZ2l0dWRlLFxuICAgICAgem9vbSxcbiAgICAgIGJlYXJpbmc6IGVuc3VyZUZpbml0ZShiZWFyaW5nLCBkZWZhdWx0U3RhdGUuYmVhcmluZyksXG4gICAgICBwaXRjaDogZW5zdXJlRmluaXRlKHBpdGNoLCBkZWZhdWx0U3RhdGUucGl0Y2gpLFxuICAgICAgYWx0aXR1ZGU6IGVuc3VyZUZpbml0ZShhbHRpdHVkZSwgZGVmYXVsdFN0YXRlLmFsdGl0dWRlKSxcbiAgICAgIG1heFpvb206IGVuc3VyZUZpbml0ZShtYXhab29tLCBNQVBCT1hfTElNSVRTLm1heFpvb20pLFxuICAgICAgbWluWm9vbTogZW5zdXJlRmluaXRlKG1pblpvb20sIE1BUEJPWF9MSU1JVFMubWluWm9vbSksXG4gICAgICBtYXhQaXRjaDogZW5zdXJlRmluaXRlKG1heFBpdGNoLCBNQVBCT1hfTElNSVRTLm1heFBpdGNoKSxcbiAgICAgIG1pblBpdGNoOiBlbnN1cmVGaW5pdGUobWluUGl0Y2gsIE1BUEJPWF9MSU1JVFMubWluUGl0Y2gpLFxuICAgICAgbWF4TGF0aXR1ZGU6IGVuc3VyZUZpbml0ZShtYXhMYXRpdHVkZSwgTUFQQk9YX0xJTUlUUy5tYXhMYXRpdHVkZSksXG4gICAgICBtaW5MYXRpdHVkZTogZW5zdXJlRmluaXRlKG1pbkxhdGl0dWRlLCBNQVBCT1hfTElNSVRTLm1pbkxhdGl0dWRlKVxuICAgIH0pO1xuXG4gICAgdGhpcy5faW50ZXJhY3RpdmVTdGF0ZSA9IHtcbiAgICAgIHN0YXJ0UGFuTG5nTGF0LFxuICAgICAgc3RhcnRab29tTG5nTGF0LFxuICAgICAgc3RhcnRCZWFyaW5nLFxuICAgICAgc3RhcnRQaXRjaCxcbiAgICAgIHN0YXJ0Wm9vbVxuICAgIH07XG4gIH1cblxuICAvKiBQdWJsaWMgQVBJICovXG5cbiAgZ2V0Vmlld3BvcnRQcm9wcygpIHtcbiAgICByZXR1cm4gdGhpcy5fdmlld3BvcnRQcm9wcztcbiAgfVxuXG4gIGdldEludGVyYWN0aXZlU3RhdGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2ludGVyYWN0aXZlU3RhdGU7XG4gIH1cblxuICAvKipcbiAgICogU3RhcnQgcGFubmluZ1xuICAgKiBAcGFyYW0ge1tOdW1iZXIsIE51bWJlcl19IHBvcyAtIHBvc2l0aW9uIG9uIHNjcmVlbiB3aGVyZSB0aGUgcG9pbnRlciBncmFic1xuICAgKi9cbiAgcGFuU3RhcnQoe3Bvc30pIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0VXBkYXRlZE1hcFN0YXRlKHtcbiAgICAgIHN0YXJ0UGFuTG5nTGF0OiB0aGlzLl91bnByb2plY3QocG9zKVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFBhblxuICAgKiBAcGFyYW0ge1tOdW1iZXIsIE51bWJlcl19IHBvcyAtIHBvc2l0aW9uIG9uIHNjcmVlbiB3aGVyZSB0aGUgcG9pbnRlciBpc1xuICAgKiBAcGFyYW0ge1tOdW1iZXIsIE51bWJlcl0sIG9wdGlvbmFsfSBzdGFydFBvcyAtIHdoZXJlIHRoZSBwb2ludGVyIGdyYWJiZWQgYXRcbiAgICogICB0aGUgc3RhcnQgb2YgdGhlIG9wZXJhdGlvbi4gTXVzdCBiZSBzdXBwbGllZCBvZiBgcGFuU3RhcnQoKWAgd2FzIG5vdCBjYWxsZWRcbiAgICovXG4gIHBhbih7cG9zLCBzdGFydFBvc30pIHtcbiAgICBjb25zdCBzdGFydFBhbkxuZ0xhdCA9IHRoaXMuX2ludGVyYWN0aXZlU3RhdGUuc3RhcnRQYW5MbmdMYXQgfHwgdGhpcy5fdW5wcm9qZWN0KHN0YXJ0UG9zKTtcblxuICAgIGlmICghc3RhcnRQYW5MbmdMYXQpIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGNvbnN0IFtsb25naXR1ZGUsIGxhdGl0dWRlXSA9IHRoaXMuX2NhbGN1bGF0ZU5ld0xuZ0xhdCh7c3RhcnRQYW5MbmdMYXQsIHBvc30pO1xuXG4gICAgcmV0dXJuIHRoaXMuX2dldFVwZGF0ZWRNYXBTdGF0ZSh7XG4gICAgICBsb25naXR1ZGUsXG4gICAgICBsYXRpdHVkZVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEVuZCBwYW5uaW5nXG4gICAqIE11c3QgY2FsbCBpZiBgcGFuU3RhcnQoKWAgd2FzIGNhbGxlZFxuICAgKi9cbiAgcGFuRW5kKCkge1xuICAgIHJldHVybiB0aGlzLl9nZXRVcGRhdGVkTWFwU3RhdGUoe1xuICAgICAgc3RhcnRQYW5MbmdMYXQ6IG51bGxcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydCByb3RhdGluZ1xuICAgKiBAcGFyYW0ge1tOdW1iZXIsIE51bWJlcl19IHBvcyAtIHBvc2l0aW9uIG9uIHNjcmVlbiB3aGVyZSB0aGUgY2VudGVyIGlzXG4gICAqL1xuICByb3RhdGVTdGFydCh7cG9zfSkge1xuICAgIHJldHVybiB0aGlzLl9nZXRVcGRhdGVkTWFwU3RhdGUoe1xuICAgICAgc3RhcnRCZWFyaW5nOiB0aGlzLl92aWV3cG9ydFByb3BzLmJlYXJpbmcsXG4gICAgICBzdGFydFBpdGNoOiB0aGlzLl92aWV3cG9ydFByb3BzLnBpdGNoXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUm90YXRlXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBkZWx0YVNjYWxlWCAtIGEgbnVtYmVyIGJldHdlZW4gWy0xLCAxXSBzcGVjaWZ5aW5nIHRoZVxuICAgKiAgIGNoYW5nZSB0byBiZWFyaW5nLlxuICAgKiBAcGFyYW0ge051bWJlcn0gZGVsdGFTY2FsZVkgLSBhIG51bWJlciBiZXR3ZWVuIFstMSwgMV0gc3BlY2lmeWluZyB0aGVcbiAgICogICBjaGFuZ2UgdG8gcGl0Y2guIC0xIHNldHMgdG8gbWluUGl0Y2ggYW5kIDEgc2V0cyB0byBtYXhQaXRjaC5cbiAgICovXG4gIHJvdGF0ZSh7ZGVsdGFTY2FsZVgsIGRlbHRhU2NhbGVZfSkge1xuICAgIGFzc2VydChkZWx0YVNjYWxlWCA+PSAtMSAmJiBkZWx0YVNjYWxlWCA8PSAxLFxuICAgICAgJ2BkZWx0YVNjYWxlWGAgbXVzdCBiZSBhIG51bWJlciBiZXR3ZWVuIFstMSwgMV0nKTtcbiAgICBhc3NlcnQoZGVsdGFTY2FsZVkgPj0gLTEgJiYgZGVsdGFTY2FsZVkgPD0gMSxcbiAgICAgICdgZGVsdGFTY2FsZVlgIG11c3QgYmUgYSBudW1iZXIgYmV0d2VlbiBbLTEsIDFdJyk7XG5cbiAgICBjb25zdCB7c3RhcnRCZWFyaW5nLCBzdGFydFBpdGNofSA9IHRoaXMuX2ludGVyYWN0aXZlU3RhdGU7XG5cbiAgICBpZiAoIU51bWJlci5pc0Zpbml0ZShzdGFydEJlYXJpbmcpIHx8ICFOdW1iZXIuaXNGaW5pdGUoc3RhcnRQaXRjaCkpIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGNvbnN0IHtwaXRjaCwgYmVhcmluZ30gPSB0aGlzLl9jYWxjdWxhdGVOZXdQaXRjaEFuZEJlYXJpbmcoe1xuICAgICAgZGVsdGFTY2FsZVgsXG4gICAgICBkZWx0YVNjYWxlWSxcbiAgICAgIHN0YXJ0QmVhcmluZyxcbiAgICAgIHN0YXJ0UGl0Y2hcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzLl9nZXRVcGRhdGVkTWFwU3RhdGUoe1xuICAgICAgYmVhcmluZyxcbiAgICAgIHBpdGNoXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogRW5kIHJvdGF0aW5nXG4gICAqIE11c3QgY2FsbCBpZiBgcm90YXRlU3RhcnQoKWAgd2FzIGNhbGxlZFxuICAgKi9cbiAgcm90YXRlRW5kKCkge1xuICAgIHJldHVybiB0aGlzLl9nZXRVcGRhdGVkTWFwU3RhdGUoe1xuICAgICAgc3RhcnRCZWFyaW5nOiBudWxsLFxuICAgICAgc3RhcnRQaXRjaDogbnVsbFxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0IHpvb21pbmdcbiAgICogQHBhcmFtIHtbTnVtYmVyLCBOdW1iZXJdfSBwb3MgLSBwb3NpdGlvbiBvbiBzY3JlZW4gd2hlcmUgdGhlIGNlbnRlciBpc1xuICAgKi9cbiAgem9vbVN0YXJ0KHtwb3N9KSB7XG4gICAgcmV0dXJuIHRoaXMuX2dldFVwZGF0ZWRNYXBTdGF0ZSh7XG4gICAgICBzdGFydFpvb21MbmdMYXQ6IHRoaXMuX3VucHJvamVjdChwb3MpLFxuICAgICAgc3RhcnRab29tOiB0aGlzLl92aWV3cG9ydFByb3BzLnpvb21cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBab29tXG4gICAqIEBwYXJhbSB7W051bWJlciwgTnVtYmVyXX0gcG9zIC0gcG9zaXRpb24gb24gc2NyZWVuIHdoZXJlIHRoZSBjdXJyZW50IGNlbnRlciBpc1xuICAgKiBAcGFyYW0ge1tOdW1iZXIsIE51bWJlcl19IHN0YXJ0UG9zIC0gdGhlIGNlbnRlciBwb3NpdGlvbiBhdFxuICAgKiAgIHRoZSBzdGFydCBvZiB0aGUgb3BlcmF0aW9uLiBNdXN0IGJlIHN1cHBsaWVkIG9mIGB6b29tU3RhcnQoKWAgd2FzIG5vdCBjYWxsZWRcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHNjYWxlIC0gYSBudW1iZXIgYmV0d2VlbiBbMCwgMV0gc3BlY2lmeWluZyB0aGUgYWNjdW11bGF0ZWRcbiAgICogICByZWxhdGl2ZSBzY2FsZS5cbiAgICovXG4gIHpvb20oe3Bvcywgc3RhcnRQb3MsIHNjYWxlfSkge1xuICAgIGFzc2VydChzY2FsZSA+IDAsICdgc2NhbGVgIG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInKTtcblxuICAgIC8vIE1ha2Ugc3VyZSB3ZSB6b29tIGFyb3VuZCB0aGUgY3VycmVudCBtb3VzZSBwb3NpdGlvbiByYXRoZXIgdGhhbiBtYXAgY2VudGVyXG4gICAgY29uc3Qgc3RhcnRab29tTG5nTGF0ID0gdGhpcy5faW50ZXJhY3RpdmVTdGF0ZS5zdGFydFpvb21MbmdMYXQgfHxcbiAgICAgIHRoaXMuX3VucHJvamVjdChzdGFydFBvcykgfHwgdGhpcy5fdW5wcm9qZWN0KHBvcyk7XG4gICAgbGV0IHtzdGFydFpvb219ID0gdGhpcy5faW50ZXJhY3RpdmVTdGF0ZTtcblxuICAgIGlmICghTnVtYmVyLmlzRmluaXRlKHN0YXJ0Wm9vbSkpIHtcbiAgICAgIHN0YXJ0Wm9vbSA9IHRoaXMuX3ZpZXdwb3J0UHJvcHMuem9vbTtcbiAgICB9XG5cbiAgICAvLyB0YWtlIHRoZSBzdGFydCBsbmdsYXQgYW5kIHB1dCBpdCB3aGVyZSB0aGUgbW91c2UgaXMgZG93bi5cbiAgICBhc3NlcnQoc3RhcnRab29tTG5nTGF0LCAnYHN0YXJ0Wm9vbUxuZ0xhdGAgcHJvcCBpcyByZXF1aXJlZCAnICtcbiAgICAgICdmb3Igem9vbSBiZWhhdmlvciB0byBjYWxjdWxhdGUgd2hlcmUgdG8gcG9zaXRpb24gdGhlIG1hcC4nKTtcblxuICAgIGNvbnN0IHpvb20gPSB0aGlzLl9jYWxjdWxhdGVOZXdab29tKHtzY2FsZSwgc3RhcnRab29tfSk7XG5cbiAgICBjb25zdCB6b29tZWRWaWV3cG9ydCA9IG5ldyBQZXJzcGVjdGl2ZU1lcmNhdG9yVmlld3BvcnQoXG4gICAgICBPYmplY3QuYXNzaWduKHt9LCB0aGlzLl92aWV3cG9ydFByb3BzLCB7em9vbX0pXG4gICAgKTtcbiAgICBjb25zdCBbbG9uZ2l0dWRlLCBsYXRpdHVkZV0gPSB6b29tZWRWaWV3cG9ydC5nZXRMb2NhdGlvbkF0UG9pbnQoe2xuZ0xhdDogc3RhcnRab29tTG5nTGF0LCBwb3N9KTtcblxuICAgIHJldHVybiB0aGlzLl9nZXRVcGRhdGVkTWFwU3RhdGUoe1xuICAgICAgem9vbSxcbiAgICAgIGxvbmdpdHVkZSxcbiAgICAgIGxhdGl0dWRlXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogRW5kIHpvb21pbmdcbiAgICogTXVzdCBjYWxsIGlmIGB6b29tU3RhcnQoKWAgd2FzIGNhbGxlZFxuICAgKi9cbiAgem9vbUVuZCgpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0VXBkYXRlZE1hcFN0YXRlKHtcbiAgICAgIHN0YXJ0Wm9vbUxuZ0xhdDogbnVsbCxcbiAgICAgIHN0YXJ0Wm9vbTogbnVsbFxuICAgIH0pO1xuICB9XG5cbiAgLyogUHJpdmF0ZSBtZXRob2RzICovXG5cbiAgX2dldFVwZGF0ZWRNYXBTdGF0ZShuZXdQcm9wcykge1xuICAgIC8vIFVwZGF0ZSBfdmlld3BvcnRQcm9wc1xuICAgIHJldHVybiBuZXcgTWFwU3RhdGUoT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5fdmlld3BvcnRQcm9wcywgdGhpcy5faW50ZXJhY3RpdmVTdGF0ZSwgbmV3UHJvcHMpKTtcbiAgfVxuXG4gIC8vIEFwcGx5IGFueSBjb25zdHJhaW50cyAobWF0aGVtYXRpY2FsIG9yIGRlZmluZWQgYnkgX3ZpZXdwb3J0UHJvcHMpIHRvIG1hcCBzdGF0ZVxuICAvKiBlc2xpbnQtZGlzYWJsZSBjb21wbGV4aXR5ICovXG4gIF9hcHBseUNvbnN0cmFpbnRzKHByb3BzKSB7XG4gICAgLy8gTm9ybWFsaXplIGRlZ3JlZXNcbiAgICBjb25zdCB7bG9uZ2l0dWRlLCBiZWFyaW5nfSA9IHByb3BzO1xuICAgIGlmIChsb25naXR1ZGUgPCAtMTgwIHx8IGxvbmdpdHVkZSA+IDE4MCkge1xuICAgICAgcHJvcHMubG9uZ2l0dWRlID0gbW9kKGxvbmdpdHVkZSArIDE4MCwgMzYwKSAtIDE4MDtcbiAgICB9XG4gICAgaWYgKGJlYXJpbmcgPCAtMTgwIHx8IGJlYXJpbmcgPiAxODApIHtcbiAgICAgIHByb3BzLmJlYXJpbmcgPSBtb2QoYmVhcmluZyArIDE4MCwgMzYwKSAtIDE4MDtcbiAgICB9XG5cbiAgICAvLyBFbnN1cmUgem9vbSBpcyB3aXRoaW4gc3BlY2lmaWVkIHJhbmdlXG4gICAgY29uc3Qge21heFpvb20sIG1pblpvb20sIHpvb219ID0gcHJvcHM7XG4gICAgcHJvcHMuem9vbSA9IHpvb20gPiBtYXhab29tID8gbWF4Wm9vbSA6IHpvb207XG4gICAgcHJvcHMuem9vbSA9IHpvb20gPCBtaW5ab29tID8gbWluWm9vbSA6IHpvb207XG5cbiAgICAvLyBFbnN1cmUgcGl0Y2ggaXMgd2l0aGluIHNwZWNpZmllZCByYW5nZVxuICAgIGNvbnN0IHttYXhQaXRjaCwgbWluUGl0Y2gsIHBpdGNofSA9IHByb3BzO1xuXG4gICAgcHJvcHMucGl0Y2ggPSBwaXRjaCA+IG1heFBpdGNoID8gbWF4UGl0Y2ggOiBwaXRjaDtcbiAgICBwcm9wcy5waXRjaCA9IHBpdGNoIDwgbWluUGl0Y2ggPyBtaW5QaXRjaCA6IHBpdGNoO1xuXG4gICAgLy8gQ29uc3RyYWluIHpvb20gYW5kIHNoaWZ0IGNlbnRlciBhdCBsb3cgem9vbSBsZXZlbHNcbiAgICBjb25zdCB7aGVpZ2h0fSA9IHByb3BzO1xuICAgIGxldCB7bGF0aXR1ZGVSYW5nZTogW3RvcFksIGJvdHRvbVldLCB2aWV3cG9ydH0gPSB0aGlzLl9nZXRMYXRpdHVkZVJhbmdlKHByb3BzKTtcbiAgICBsZXQgc2hpZnRZID0gMDtcblxuICAgIGlmIChib3R0b21ZIC0gdG9wWSA8IGhlaWdodCkge1xuICAgICAgLy8gTWFwIGhlaWdodCBtdXN0IG5vdCBiZSBzbWFsbGVyIHRoYW4gdmlld3BvcnQgaGVpZ2h0XG4gICAgICBwcm9wcy56b29tICs9IE1hdGgubG9nMihoZWlnaHQgLyAoYm90dG9tWSAtIHRvcFkpKTtcbiAgICAgIGNvbnN0IG5ld1JhbmdlID0gdGhpcy5fZ2V0TGF0aXR1ZGVSYW5nZShwcm9wcyk7XG4gICAgICBbdG9wWSwgYm90dG9tWV0gPSBuZXdSYW5nZS5sYXRpdHVkZVJhbmdlO1xuICAgICAgdmlld3BvcnQgPSBuZXdSYW5nZS52aWV3cG9ydDtcbiAgICB9XG4gICAgaWYgKHRvcFkgPiAwKSB7XG4gICAgICAvLyBDb21wZW5zYXRlIGZvciB3aGl0ZSBnYXAgb24gdG9wXG4gICAgICBzaGlmdFkgPSB0b3BZO1xuICAgIH0gZWxzZSBpZiAoYm90dG9tWSA8IGhlaWdodCkge1xuICAgICAgLy8gQ29tcGVuc2F0ZSBmb3Igd2hpdGUgZ2FwIG9uIGJvdHRvbVxuICAgICAgc2hpZnRZID0gYm90dG9tWSAtIGhlaWdodDtcbiAgICB9XG4gICAgaWYgKHNoaWZ0WSkge1xuICAgICAgcHJvcHMubGF0aXR1ZGUgPSB2aWV3cG9ydC51bnByb2plY3QoW3Byb3BzLndpZHRoIC8gMiwgaGVpZ2h0IC8gMiArIHNoaWZ0WV0pWzFdO1xuICAgIH1cblxuICAgIHJldHVybiBwcm9wcztcbiAgfVxuICAvKiBlc2xpbnQtZW5hYmxlIGNvbXBsZXhpdHkgKi9cblxuICAvLyBSZXR1cm5zIHt2aWV3cG9ydCwgbGF0aXR1ZGVSYW5nZTogW3RvcFksIGJvdHRvbVldfSBpbiBub24tcGVyc3BlY3RpdmUgbW9kZVxuICBfZ2V0TGF0aXR1ZGVSYW5nZShwcm9wcykge1xuICAgIGNvbnN0IGZsYXRWaWV3cG9ydCA9IG5ldyBQZXJzcGVjdGl2ZU1lcmNhdG9yVmlld3BvcnQoT2JqZWN0LmFzc2lnbih7fSwgcHJvcHMsIHtcbiAgICAgIHBpdGNoOiAwLFxuICAgICAgYmVhcmluZzogMFxuICAgIH0pKTtcbiAgICByZXR1cm4ge1xuICAgICAgdmlld3BvcnQ6IGZsYXRWaWV3cG9ydCxcbiAgICAgIGxhdGl0dWRlUmFuZ2U6IFtcbiAgICAgICAgZmxhdFZpZXdwb3J0LnByb2plY3QoW3Byb3BzLmxvbmdpdHVkZSwgcHJvcHMubWF4TGF0aXR1ZGVdKVsxXSxcbiAgICAgICAgZmxhdFZpZXdwb3J0LnByb2plY3QoW3Byb3BzLmxvbmdpdHVkZSwgcHJvcHMubWluTGF0aXR1ZGVdKVsxXVxuICAgICAgXVxuICAgIH07XG4gIH1cblxuICBfdW5wcm9qZWN0KHBvcykge1xuICAgIGNvbnN0IHZpZXdwb3J0ID0gbmV3IFBlcnNwZWN0aXZlTWVyY2F0b3JWaWV3cG9ydCh0aGlzLl92aWV3cG9ydFByb3BzKTtcbiAgICByZXR1cm4gcG9zICYmIHZpZXdwb3J0LnVucHJvamVjdChwb3MsIHt0b3BMZWZ0OiBmYWxzZX0pO1xuICB9XG5cbiAgLy8gQ2FsY3VsYXRlIGEgbmV3IGxuZ2xhdCBiYXNlZCBvbiBwaXhlbCBkcmFnZ2luZyBwb3NpdGlvblxuICBfY2FsY3VsYXRlTmV3TG5nTGF0KHtzdGFydFBhbkxuZ0xhdCwgcG9zfSkge1xuICAgIGNvbnN0IHZpZXdwb3J0ID0gbmV3IFBlcnNwZWN0aXZlTWVyY2F0b3JWaWV3cG9ydCh0aGlzLl92aWV3cG9ydFByb3BzKTtcbiAgICByZXR1cm4gdmlld3BvcnQuZ2V0TG9jYXRpb25BdFBvaW50KHtsbmdMYXQ6IHN0YXJ0UGFuTG5nTGF0LCBwb3N9KTtcbiAgfVxuXG4gIC8vIENhbGN1bGF0ZXMgbmV3IHpvb21cbiAgX2NhbGN1bGF0ZU5ld1pvb20oe3NjYWxlLCBzdGFydFpvb219KSB7XG4gICAgY29uc3Qge21heFpvb20sIG1pblpvb219ID0gdGhpcy5fdmlld3BvcnRQcm9wcztcbiAgICBsZXQgem9vbSA9IHN0YXJ0Wm9vbSArIE1hdGgubG9nMihzY2FsZSk7XG4gICAgem9vbSA9IHpvb20gPiBtYXhab29tID8gbWF4Wm9vbSA6IHpvb207XG4gICAgem9vbSA9IHpvb20gPCBtaW5ab29tID8gbWluWm9vbSA6IHpvb207XG4gICAgcmV0dXJuIHpvb207XG4gIH1cblxuICAvLyBDYWxjdWxhdGVzIGEgbmV3IHBpdGNoIGFuZCBiZWFyaW5nIGZyb20gYSBwb3NpdGlvbiAoY29taW5nIGZyb20gYW4gZXZlbnQpXG4gIF9jYWxjdWxhdGVOZXdQaXRjaEFuZEJlYXJpbmcoe2RlbHRhU2NhbGVYLCBkZWx0YVNjYWxlWSwgc3RhcnRCZWFyaW5nLCBzdGFydFBpdGNofSkge1xuICAgIGNvbnN0IHttaW5QaXRjaCwgbWF4UGl0Y2h9ID0gdGhpcy5fdmlld3BvcnRQcm9wcztcblxuICAgIGNvbnN0IGJlYXJpbmcgPSBzdGFydEJlYXJpbmcgKyAxODAgKiBkZWx0YVNjYWxlWDtcbiAgICBsZXQgcGl0Y2ggPSBzdGFydFBpdGNoO1xuICAgIGlmIChkZWx0YVNjYWxlWSA+IDApIHtcbiAgICAgIC8vIEdyYWR1YWxseSBpbmNyZWFzZSBwaXRjaFxuICAgICAgcGl0Y2ggPSBzdGFydFBpdGNoICsgZGVsdGFTY2FsZVkgKiAobWF4UGl0Y2ggLSBzdGFydFBpdGNoKTtcbiAgICB9IGVsc2UgaWYgKGRlbHRhU2NhbGVZIDwgMCkge1xuICAgICAgLy8gR3JhZHVhbGx5IGRlY3JlYXNlIHBpdGNoXG4gICAgICBwaXRjaCA9IHN0YXJ0UGl0Y2ggLSBkZWx0YVNjYWxlWSAqIChtaW5QaXRjaCAtIHN0YXJ0UGl0Y2gpO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBwaXRjaCxcbiAgICAgIGJlYXJpbmdcbiAgICB9O1xuICB9XG5cbn1cbiJdfQ==