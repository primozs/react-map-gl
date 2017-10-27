var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

import { PerspectiveMercatorViewport } from 'viewport-mercator-project';
import assert from 'assert';

// MAPBOX LIMITS
export var MAPBOX_LIMITS = {
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
  return Number.isFinite(value) ? value : fallbackValue;
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

    _classCallCheck(this, MapState);

    assert(Number.isFinite(width), '`width` must be supplied');
    assert(Number.isFinite(height), '`height` must be supplied');
    assert(Number.isFinite(longitude), '`longitude` must be supplied');
    assert(Number.isFinite(latitude), '`latitude` must be supplied');
    assert(Number.isFinite(zoom), '`zoom` must be supplied');

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

  _createClass(MapState, [{
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
          _calculateNewLngLat3 = _slicedToArray(_calculateNewLngLat2, 2),
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

      assert(deltaScaleX >= -1 && deltaScaleX <= 1, '`deltaScaleX` must be a number between [-1, 1]');
      assert(deltaScaleY >= -1 && deltaScaleY <= 1, '`deltaScaleY` must be a number between [-1, 1]');

      var _interactiveState = this._interactiveState,
          startBearing = _interactiveState.startBearing,
          startPitch = _interactiveState.startPitch;


      if (!Number.isFinite(startBearing) || !Number.isFinite(startPitch)) {
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

      assert(scale > 0, '`scale` must be a positive number');

      // Make sure we zoom around the current mouse position rather than map center
      var startZoomLngLat = this._interactiveState.startZoomLngLat || this._unproject(startPos) || this._unproject(pos);
      var startZoom = this._interactiveState.startZoom;


      if (!Number.isFinite(startZoom)) {
        startZoom = this._viewportProps.zoom;
      }

      // take the start lnglat and put it where the mouse is down.
      assert(startZoomLngLat, '`startZoomLngLat` prop is required ' + 'for zoom behavior to calculate where to position the map.');

      var zoom = this._calculateNewZoom({ scale: scale, startZoom: startZoom });

      var zoomedViewport = new PerspectiveMercatorViewport(Object.assign({}, this._viewportProps, { zoom: zoom }));

      var _zoomedViewport$getLo = zoomedViewport.getLocationAtPoint({ lngLat: startZoomLngLat, pos: pos }),
          _zoomedViewport$getLo2 = _slicedToArray(_zoomedViewport$getLo, 2),
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
      return new MapState(Object.assign({}, this._viewportProps, this._interactiveState, newProps));
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
          _getLatitudeRange2$la = _slicedToArray(_getLatitudeRange2.latitudeRange, 2),
          topY = _getLatitudeRange2$la[0],
          bottomY = _getLatitudeRange2$la[1],
          viewport = _getLatitudeRange2.viewport;

      var shiftY = 0;

      if (bottomY - topY < height) {
        // Map height must not be smaller than viewport height
        props.zoom += Math.log2(height / (bottomY - topY));
        var newRange = this._getLatitudeRange(props);

        var _newRange$latitudeRan = _slicedToArray(newRange.latitudeRange, 2);

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
      var flatViewport = new PerspectiveMercatorViewport(Object.assign({}, props, {
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
      var viewport = new PerspectiveMercatorViewport(this._viewportProps);
      return pos && viewport.unproject(pos, { topLeft: false });
    }

    // Calculate a new lnglat based on pixel dragging position

  }, {
    key: '_calculateNewLngLat',
    value: function _calculateNewLngLat(_ref8) {
      var startPanLngLat = _ref8.startPanLngLat,
          pos = _ref8.pos;

      var viewport = new PerspectiveMercatorViewport(this._viewportProps);
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

      var zoom = startZoom + Math.log2(scale);
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

export default MapState;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9tYXAtc3RhdGUuanMiXSwibmFtZXMiOlsiUGVyc3BlY3RpdmVNZXJjYXRvclZpZXdwb3J0IiwiYXNzZXJ0IiwiTUFQQk9YX0xJTUlUUyIsIm1pblpvb20iLCJtYXhab29tIiwibWluUGl0Y2giLCJtYXhQaXRjaCIsIm1heExhdGl0dWRlIiwibWluTGF0aXR1ZGUiLCJkZWZhdWx0U3RhdGUiLCJwaXRjaCIsImJlYXJpbmciLCJhbHRpdHVkZSIsIm1vZCIsInZhbHVlIiwiZGl2aXNvciIsIm1vZHVsdXMiLCJlbnN1cmVGaW5pdGUiLCJmYWxsYmFja1ZhbHVlIiwiTnVtYmVyIiwiaXNGaW5pdGUiLCJNYXBTdGF0ZSIsIndpZHRoIiwiaGVpZ2h0IiwibGF0aXR1ZGUiLCJsb25naXR1ZGUiLCJ6b29tIiwic3RhcnRQYW5MbmdMYXQiLCJzdGFydFpvb21MbmdMYXQiLCJzdGFydEJlYXJpbmciLCJzdGFydFBpdGNoIiwic3RhcnRab29tIiwiX3ZpZXdwb3J0UHJvcHMiLCJfYXBwbHlDb25zdHJhaW50cyIsIl9pbnRlcmFjdGl2ZVN0YXRlIiwicG9zIiwiX2dldFVwZGF0ZWRNYXBTdGF0ZSIsIl91bnByb2plY3QiLCJzdGFydFBvcyIsIl9jYWxjdWxhdGVOZXdMbmdMYXQiLCJkZWx0YVNjYWxlWCIsImRlbHRhU2NhbGVZIiwiX2NhbGN1bGF0ZU5ld1BpdGNoQW5kQmVhcmluZyIsInNjYWxlIiwiX2NhbGN1bGF0ZU5ld1pvb20iLCJ6b29tZWRWaWV3cG9ydCIsIk9iamVjdCIsImFzc2lnbiIsImdldExvY2F0aW9uQXRQb2ludCIsImxuZ0xhdCIsIm5ld1Byb3BzIiwicHJvcHMiLCJfZ2V0TGF0aXR1ZGVSYW5nZSIsImxhdGl0dWRlUmFuZ2UiLCJ0b3BZIiwiYm90dG9tWSIsInZpZXdwb3J0Iiwic2hpZnRZIiwiTWF0aCIsImxvZzIiLCJuZXdSYW5nZSIsInVucHJvamVjdCIsImZsYXRWaWV3cG9ydCIsInByb2plY3QiLCJ0b3BMZWZ0Il0s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V3dCLFVBQTFCLENBQXJCO0FBQ0QsT0FIRCxNQUdPLElBQUlXLGNBQWMsQ0FBbEIsRUFBcUI7QUFDMUI7QUFDQS9CLGdCQUFRb0IsYUFBYVcsZUFBZXBDLFdBQVd5QixVQUExQixDQUFyQjtBQUNEOztBQUVELGFBQU87QUFDTHBCLG9CQURLO0FBRUxDO0FBRkssT0FBUDtBQUlEOzs7Ozs7ZUFoV2tCVSxRIiwiZmlsZSI6Im1hcC1zdGF0ZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7UGVyc3BlY3RpdmVNZXJjYXRvclZpZXdwb3J0fSBmcm9tICd2aWV3cG9ydC1tZXJjYXRvci1wcm9qZWN0JztcbmltcG9ydCBhc3NlcnQgZnJvbSAnYXNzZXJ0JztcblxuLy8gTUFQQk9YIExJTUlUU1xuZXhwb3J0IGNvbnN0IE1BUEJPWF9MSU1JVFMgPSB7XG4gIG1pblpvb206IDAsXG4gIG1heFpvb206IDIwLFxuICBtaW5QaXRjaDogMCxcbiAgbWF4UGl0Y2g6IDYwLFxuICAvLyBkZWZpbmVkIGJ5IG1hcGJveC1nbFxuICBtYXhMYXRpdHVkZTogODUuMDUxMTMsXG4gIG1pbkxhdGl0dWRlOiAtODUuMDUxMTNcbn07XG5cbmNvbnN0IGRlZmF1bHRTdGF0ZSA9IHtcbiAgcGl0Y2g6IDAsXG4gIGJlYXJpbmc6IDAsXG4gIGFsdGl0dWRlOiAxLjVcbn07XG5cbi8qIFV0aWxzICovXG5mdW5jdGlvbiBtb2QodmFsdWUsIGRpdmlzb3IpIHtcbiAgY29uc3QgbW9kdWx1cyA9IHZhbHVlICUgZGl2aXNvcjtcbiAgcmV0dXJuIG1vZHVsdXMgPCAwID8gZGl2aXNvciArIG1vZHVsdXMgOiBtb2R1bHVzO1xufVxuXG5mdW5jdGlvbiBlbnN1cmVGaW5pdGUodmFsdWUsIGZhbGxiYWNrVmFsdWUpIHtcbiAgcmV0dXJuIE51bWJlci5pc0Zpbml0ZSh2YWx1ZSkgPyB2YWx1ZSA6IGZhbGxiYWNrVmFsdWU7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1hcFN0YXRlIHtcblxuICBjb25zdHJ1Y3Rvcih7XG4gICAgLyoqIE1hcGJveCB2aWV3cG9ydCBwcm9wZXJ0aWVzICovXG4gICAgLyoqIFRoZSB3aWR0aCBvZiB0aGUgdmlld3BvcnQgKi9cbiAgICB3aWR0aCxcbiAgICAvKiogVGhlIGhlaWdodCBvZiB0aGUgdmlld3BvcnQgKi9cbiAgICBoZWlnaHQsXG4gICAgLyoqIFRoZSBsYXRpdHVkZSBhdCB0aGUgY2VudGVyIG9mIHRoZSB2aWV3cG9ydCAqL1xuICAgIGxhdGl0dWRlLFxuICAgIC8qKiBUaGUgbG9uZ2l0dWRlIGF0IHRoZSBjZW50ZXIgb2YgdGhlIHZpZXdwb3J0ICovXG4gICAgbG9uZ2l0dWRlLFxuICAgIC8qKiBUaGUgdGlsZSB6b29tIGxldmVsIG9mIHRoZSBtYXAuICovXG4gICAgem9vbSxcbiAgICAvKiogVGhlIGJlYXJpbmcgb2YgdGhlIHZpZXdwb3J0IGluIGRlZ3JlZXMgKi9cbiAgICBiZWFyaW5nLFxuICAgIC8qKiBUaGUgcGl0Y2ggb2YgdGhlIHZpZXdwb3J0IGluIGRlZ3JlZXMgKi9cbiAgICBwaXRjaCxcbiAgICAvKipcbiAgICAqIFNwZWNpZnkgdGhlIGFsdGl0dWRlIG9mIHRoZSB2aWV3cG9ydCBjYW1lcmFcbiAgICAqIFVuaXQ6IG1hcCBoZWlnaHRzLCBkZWZhdWx0IDEuNVxuICAgICogTm9uLXB1YmxpYyBBUEksIHNlZSBodHRwczovL2dpdGh1Yi5jb20vbWFwYm94L21hcGJveC1nbC1qcy9pc3N1ZXMvMTEzN1xuICAgICovXG4gICAgYWx0aXR1ZGUsXG5cbiAgICAvKiogVmlld3BvcnQgY29uc3RyYWludHMgKi9cbiAgICBtYXhab29tLFxuICAgIG1pblpvb20sXG4gICAgbWF4UGl0Y2gsXG4gICAgbWluUGl0Y2gsXG4gICAgbWF4TGF0aXR1ZGUsXG4gICAgbWluTGF0aXR1ZGUsXG5cbiAgICAvKiogSW50ZXJhY3Rpb24gc3RhdGVzLCByZXF1aXJlZCB0byBjYWxjdWxhdGUgY2hhbmdlIGR1cmluZyB0cmFuc2Zvcm0gKi9cbiAgICAvKiBUaGUgcG9pbnQgb24gbWFwIGJlaW5nIGdyYWJiZWQgd2hlbiB0aGUgb3BlcmF0aW9uIGZpcnN0IHN0YXJ0ZWQgKi9cbiAgICBzdGFydFBhbkxuZ0xhdCxcbiAgICAvKiBDZW50ZXIgb2YgdGhlIHpvb20gd2hlbiB0aGUgb3BlcmF0aW9uIGZpcnN0IHN0YXJ0ZWQgKi9cbiAgICBzdGFydFpvb21MbmdMYXQsXG4gICAgLyoqIEJlYXJpbmcgd2hlbiBjdXJyZW50IHBlcnNwZWN0aXZlIHJvdGF0ZSBvcGVyYXRpb24gc3RhcnRlZCAqL1xuICAgIHN0YXJ0QmVhcmluZyxcbiAgICAvKiogUGl0Y2ggd2hlbiBjdXJyZW50IHBlcnNwZWN0aXZlIHJvdGF0ZSBvcGVyYXRpb24gc3RhcnRlZCAqL1xuICAgIHN0YXJ0UGl0Y2gsXG4gICAgLyoqIFpvb20gd2hlbiBjdXJyZW50IHpvb20gb3BlcmF0aW9uIHN0YXJ0ZWQgKi9cbiAgICBzdGFydFpvb21cbiAgfSA9IHt9KSB7XG4gICAgYXNzZXJ0KE51bWJlci5pc0Zpbml0ZSh3aWR0aCksICdgd2lkdGhgIG11c3QgYmUgc3VwcGxpZWQnKTtcbiAgICBhc3NlcnQoTnVtYmVyLmlzRmluaXRlKGhlaWdodCksICdgaGVpZ2h0YCBtdXN0IGJlIHN1cHBsaWVkJyk7XG4gICAgYXNzZXJ0KE51bWJlci5pc0Zpbml0ZShsb25naXR1ZGUpLCAnYGxvbmdpdHVkZWAgbXVzdCBiZSBzdXBwbGllZCcpO1xuICAgIGFzc2VydChOdW1iZXIuaXNGaW5pdGUobGF0aXR1ZGUpLCAnYGxhdGl0dWRlYCBtdXN0IGJlIHN1cHBsaWVkJyk7XG4gICAgYXNzZXJ0KE51bWJlci5pc0Zpbml0ZSh6b29tKSwgJ2B6b29tYCBtdXN0IGJlIHN1cHBsaWVkJyk7XG5cbiAgICB0aGlzLl92aWV3cG9ydFByb3BzID0gdGhpcy5fYXBwbHlDb25zdHJhaW50cyh7XG4gICAgICB3aWR0aCxcbiAgICAgIGhlaWdodCxcbiAgICAgIGxhdGl0dWRlLFxuICAgICAgbG9uZ2l0dWRlLFxuICAgICAgem9vbSxcbiAgICAgIGJlYXJpbmc6IGVuc3VyZUZpbml0ZShiZWFyaW5nLCBkZWZhdWx0U3RhdGUuYmVhcmluZyksXG4gICAgICBwaXRjaDogZW5zdXJlRmluaXRlKHBpdGNoLCBkZWZhdWx0U3RhdGUucGl0Y2gpLFxuICAgICAgYWx0aXR1ZGU6IGVuc3VyZUZpbml0ZShhbHRpdHVkZSwgZGVmYXVsdFN0YXRlLmFsdGl0dWRlKSxcbiAgICAgIG1heFpvb206IGVuc3VyZUZpbml0ZShtYXhab29tLCBNQVBCT1hfTElNSVRTLm1heFpvb20pLFxuICAgICAgbWluWm9vbTogZW5zdXJlRmluaXRlKG1pblpvb20sIE1BUEJPWF9MSU1JVFMubWluWm9vbSksXG4gICAgICBtYXhQaXRjaDogZW5zdXJlRmluaXRlKG1heFBpdGNoLCBNQVBCT1hfTElNSVRTLm1heFBpdGNoKSxcbiAgICAgIG1pblBpdGNoOiBlbnN1cmVGaW5pdGUobWluUGl0Y2gsIE1BUEJPWF9MSU1JVFMubWluUGl0Y2gpLFxuICAgICAgbWF4TGF0aXR1ZGU6IGVuc3VyZUZpbml0ZShtYXhMYXRpdHVkZSwgTUFQQk9YX0xJTUlUUy5tYXhMYXRpdHVkZSksXG4gICAgICBtaW5MYXRpdHVkZTogZW5zdXJlRmluaXRlKG1pbkxhdGl0dWRlLCBNQVBCT1hfTElNSVRTLm1pbkxhdGl0dWRlKVxuICAgIH0pO1xuXG4gICAgdGhpcy5faW50ZXJhY3RpdmVTdGF0ZSA9IHtcbiAgICAgIHN0YXJ0UGFuTG5nTGF0LFxuICAgICAgc3RhcnRab29tTG5nTGF0LFxuICAgICAgc3RhcnRCZWFyaW5nLFxuICAgICAgc3RhcnRQaXRjaCxcbiAgICAgIHN0YXJ0Wm9vbVxuICAgIH07XG4gIH1cblxuICAvKiBQdWJsaWMgQVBJICovXG5cbiAgZ2V0Vmlld3BvcnRQcm9wcygpIHtcbiAgICByZXR1cm4gdGhpcy5fdmlld3BvcnRQcm9wcztcbiAgfVxuXG4gIGdldEludGVyYWN0aXZlU3RhdGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2ludGVyYWN0aXZlU3RhdGU7XG4gIH1cblxuICAvKipcbiAgICogU3RhcnQgcGFubmluZ1xuICAgKiBAcGFyYW0ge1tOdW1iZXIsIE51bWJlcl19IHBvcyAtIHBvc2l0aW9uIG9uIHNjcmVlbiB3aGVyZSB0aGUgcG9pbnRlciBncmFic1xuICAgKi9cbiAgcGFuU3RhcnQoe3Bvc30pIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0VXBkYXRlZE1hcFN0YXRlKHtcbiAgICAgIHN0YXJ0UGFuTG5nTGF0OiB0aGlzLl91bnByb2plY3QocG9zKVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFBhblxuICAgKiBAcGFyYW0ge1tOdW1iZXIsIE51bWJlcl19IHBvcyAtIHBvc2l0aW9uIG9uIHNjcmVlbiB3aGVyZSB0aGUgcG9pbnRlciBpc1xuICAgKiBAcGFyYW0ge1tOdW1iZXIsIE51bWJlcl0sIG9wdGlvbmFsfSBzdGFydFBvcyAtIHdoZXJlIHRoZSBwb2ludGVyIGdyYWJiZWQgYXRcbiAgICogICB0aGUgc3RhcnQgb2YgdGhlIG9wZXJhdGlvbi4gTXVzdCBiZSBzdXBwbGllZCBvZiBgcGFuU3RhcnQoKWAgd2FzIG5vdCBjYWxsZWRcbiAgICovXG4gIHBhbih7cG9zLCBzdGFydFBvc30pIHtcbiAgICBjb25zdCBzdGFydFBhbkxuZ0xhdCA9IHRoaXMuX2ludGVyYWN0aXZlU3RhdGUuc3RhcnRQYW5MbmdMYXQgfHwgdGhpcy5fdW5wcm9qZWN0KHN0YXJ0UG9zKTtcblxuICAgIGlmICghc3RhcnRQYW5MbmdMYXQpIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGNvbnN0IFtsb25naXR1ZGUsIGxhdGl0dWRlXSA9IHRoaXMuX2NhbGN1bGF0ZU5ld0xuZ0xhdCh7c3RhcnRQYW5MbmdMYXQsIHBvc30pO1xuXG4gICAgcmV0dXJuIHRoaXMuX2dldFVwZGF0ZWRNYXBTdGF0ZSh7XG4gICAgICBsb25naXR1ZGUsXG4gICAgICBsYXRpdHVkZVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEVuZCBwYW5uaW5nXG4gICAqIE11c3QgY2FsbCBpZiBgcGFuU3RhcnQoKWAgd2FzIGNhbGxlZFxuICAgKi9cbiAgcGFuRW5kKCkge1xuICAgIHJldHVybiB0aGlzLl9nZXRVcGRhdGVkTWFwU3RhdGUoe1xuICAgICAgc3RhcnRQYW5MbmdMYXQ6IG51bGxcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydCByb3RhdGluZ1xuICAgKiBAcGFyYW0ge1tOdW1iZXIsIE51bWJlcl19IHBvcyAtIHBvc2l0aW9uIG9uIHNjcmVlbiB3aGVyZSB0aGUgY2VudGVyIGlzXG4gICAqL1xuICByb3RhdGVTdGFydCh7cG9zfSkge1xuICAgIHJldHVybiB0aGlzLl9nZXRVcGRhdGVkTWFwU3RhdGUoe1xuICAgICAgc3RhcnRCZWFyaW5nOiB0aGlzLl92aWV3cG9ydFByb3BzLmJlYXJpbmcsXG4gICAgICBzdGFydFBpdGNoOiB0aGlzLl92aWV3cG9ydFByb3BzLnBpdGNoXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUm90YXRlXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBkZWx0YVNjYWxlWCAtIGEgbnVtYmVyIGJldHdlZW4gWy0xLCAxXSBzcGVjaWZ5aW5nIHRoZVxuICAgKiAgIGNoYW5nZSB0byBiZWFyaW5nLlxuICAgKiBAcGFyYW0ge051bWJlcn0gZGVsdGFTY2FsZVkgLSBhIG51bWJlciBiZXR3ZWVuIFstMSwgMV0gc3BlY2lmeWluZyB0aGVcbiAgICogICBjaGFuZ2UgdG8gcGl0Y2guIC0xIHNldHMgdG8gbWluUGl0Y2ggYW5kIDEgc2V0cyB0byBtYXhQaXRjaC5cbiAgICovXG4gIHJvdGF0ZSh7ZGVsdGFTY2FsZVgsIGRlbHRhU2NhbGVZfSkge1xuICAgIGFzc2VydChkZWx0YVNjYWxlWCA+PSAtMSAmJiBkZWx0YVNjYWxlWCA8PSAxLFxuICAgICAgJ2BkZWx0YVNjYWxlWGAgbXVzdCBiZSBhIG51bWJlciBiZXR3ZWVuIFstMSwgMV0nKTtcbiAgICBhc3NlcnQoZGVsdGFTY2FsZVkgPj0gLTEgJiYgZGVsdGFTY2FsZVkgPD0gMSxcbiAgICAgICdgZGVsdGFTY2FsZVlgIG11c3QgYmUgYSBudW1iZXIgYmV0d2VlbiBbLTEsIDFdJyk7XG5cbiAgICBjb25zdCB7c3RhcnRCZWFyaW5nLCBzdGFydFBpdGNofSA9IHRoaXMuX2ludGVyYWN0aXZlU3RhdGU7XG5cbiAgICBpZiAoIU51bWJlci5pc0Zpbml0ZShzdGFydEJlYXJpbmcpIHx8ICFOdW1iZXIuaXNGaW5pdGUoc3RhcnRQaXRjaCkpIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGNvbnN0IHtwaXRjaCwgYmVhcmluZ30gPSB0aGlzLl9jYWxjdWxhdGVOZXdQaXRjaEFuZEJlYXJpbmcoe1xuICAgICAgZGVsdGFTY2FsZVgsXG4gICAgICBkZWx0YVNjYWxlWSxcbiAgICAgIHN0YXJ0QmVhcmluZyxcbiAgICAgIHN0YXJ0UGl0Y2hcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzLl9nZXRVcGRhdGVkTWFwU3RhdGUoe1xuICAgICAgYmVhcmluZyxcbiAgICAgIHBpdGNoXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogRW5kIHJvdGF0aW5nXG4gICAqIE11c3QgY2FsbCBpZiBgcm90YXRlU3RhcnQoKWAgd2FzIGNhbGxlZFxuICAgKi9cbiAgcm90YXRlRW5kKCkge1xuICAgIHJldHVybiB0aGlzLl9nZXRVcGRhdGVkTWFwU3RhdGUoe1xuICAgICAgc3RhcnRCZWFyaW5nOiBudWxsLFxuICAgICAgc3RhcnRQaXRjaDogbnVsbFxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0IHpvb21pbmdcbiAgICogQHBhcmFtIHtbTnVtYmVyLCBOdW1iZXJdfSBwb3MgLSBwb3NpdGlvbiBvbiBzY3JlZW4gd2hlcmUgdGhlIGNlbnRlciBpc1xuICAgKi9cbiAgem9vbVN0YXJ0KHtwb3N9KSB7XG4gICAgcmV0dXJuIHRoaXMuX2dldFVwZGF0ZWRNYXBTdGF0ZSh7XG4gICAgICBzdGFydFpvb21MbmdMYXQ6IHRoaXMuX3VucHJvamVjdChwb3MpLFxuICAgICAgc3RhcnRab29tOiB0aGlzLl92aWV3cG9ydFByb3BzLnpvb21cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBab29tXG4gICAqIEBwYXJhbSB7W051bWJlciwgTnVtYmVyXX0gcG9zIC0gcG9zaXRpb24gb24gc2NyZWVuIHdoZXJlIHRoZSBjdXJyZW50IGNlbnRlciBpc1xuICAgKiBAcGFyYW0ge1tOdW1iZXIsIE51bWJlcl19IHN0YXJ0UG9zIC0gdGhlIGNlbnRlciBwb3NpdGlvbiBhdFxuICAgKiAgIHRoZSBzdGFydCBvZiB0aGUgb3BlcmF0aW9uLiBNdXN0IGJlIHN1cHBsaWVkIG9mIGB6b29tU3RhcnQoKWAgd2FzIG5vdCBjYWxsZWRcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHNjYWxlIC0gYSBudW1iZXIgYmV0d2VlbiBbMCwgMV0gc3BlY2lmeWluZyB0aGUgYWNjdW11bGF0ZWRcbiAgICogICByZWxhdGl2ZSBzY2FsZS5cbiAgICovXG4gIHpvb20oe3Bvcywgc3RhcnRQb3MsIHNjYWxlfSkge1xuICAgIGFzc2VydChzY2FsZSA+IDAsICdgc2NhbGVgIG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInKTtcblxuICAgIC8vIE1ha2Ugc3VyZSB3ZSB6b29tIGFyb3VuZCB0aGUgY3VycmVudCBtb3VzZSBwb3NpdGlvbiByYXRoZXIgdGhhbiBtYXAgY2VudGVyXG4gICAgY29uc3Qgc3RhcnRab29tTG5nTGF0ID0gdGhpcy5faW50ZXJhY3RpdmVTdGF0ZS5zdGFydFpvb21MbmdMYXQgfHxcbiAgICAgIHRoaXMuX3VucHJvamVjdChzdGFydFBvcykgfHwgdGhpcy5fdW5wcm9qZWN0KHBvcyk7XG4gICAgbGV0IHtzdGFydFpvb219ID0gdGhpcy5faW50ZXJhY3RpdmVTdGF0ZTtcblxuICAgIGlmICghTnVtYmVyLmlzRmluaXRlKHN0YXJ0Wm9vbSkpIHtcbiAgICAgIHN0YXJ0Wm9vbSA9IHRoaXMuX3ZpZXdwb3J0UHJvcHMuem9vbTtcbiAgICB9XG5cbiAgICAvLyB0YWtlIHRoZSBzdGFydCBsbmdsYXQgYW5kIHB1dCBpdCB3aGVyZSB0aGUgbW91c2UgaXMgZG93bi5cbiAgICBhc3NlcnQoc3RhcnRab29tTG5nTGF0LCAnYHN0YXJ0Wm9vbUxuZ0xhdGAgcHJvcCBpcyByZXF1aXJlZCAnICtcbiAgICAgICdmb3Igem9vbSBiZWhhdmlvciB0byBjYWxjdWxhdGUgd2hlcmUgdG8gcG9zaXRpb24gdGhlIG1hcC4nKTtcblxuICAgIGNvbnN0IHpvb20gPSB0aGlzLl9jYWxjdWxhdGVOZXdab29tKHtzY2FsZSwgc3RhcnRab29tfSk7XG5cbiAgICBjb25zdCB6b29tZWRWaWV3cG9ydCA9IG5ldyBQZXJzcGVjdGl2ZU1lcmNhdG9yVmlld3BvcnQoXG4gICAgICBPYmplY3QuYXNzaWduKHt9LCB0aGlzLl92aWV3cG9ydFByb3BzLCB7em9vbX0pXG4gICAgKTtcbiAgICBjb25zdCBbbG9uZ2l0dWRlLCBsYXRpdHVkZV0gPSB6b29tZWRWaWV3cG9ydC5nZXRMb2NhdGlvbkF0UG9pbnQoe2xuZ0xhdDogc3RhcnRab29tTG5nTGF0LCBwb3N9KTtcblxuICAgIHJldHVybiB0aGlzLl9nZXRVcGRhdGVkTWFwU3RhdGUoe1xuICAgICAgem9vbSxcbiAgICAgIGxvbmdpdHVkZSxcbiAgICAgIGxhdGl0dWRlXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogRW5kIHpvb21pbmdcbiAgICogTXVzdCBjYWxsIGlmIGB6b29tU3RhcnQoKWAgd2FzIGNhbGxlZFxuICAgKi9cbiAgem9vbUVuZCgpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0VXBkYXRlZE1hcFN0YXRlKHtcbiAgICAgIHN0YXJ0Wm9vbUxuZ0xhdDogbnVsbCxcbiAgICAgIHN0YXJ0Wm9vbTogbnVsbFxuICAgIH0pO1xuICB9XG5cbiAgLyogUHJpdmF0ZSBtZXRob2RzICovXG5cbiAgX2dldFVwZGF0ZWRNYXBTdGF0ZShuZXdQcm9wcykge1xuICAgIC8vIFVwZGF0ZSBfdmlld3BvcnRQcm9wc1xuICAgIHJldHVybiBuZXcgTWFwU3RhdGUoT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5fdmlld3BvcnRQcm9wcywgdGhpcy5faW50ZXJhY3RpdmVTdGF0ZSwgbmV3UHJvcHMpKTtcbiAgfVxuXG4gIC8vIEFwcGx5IGFueSBjb25zdHJhaW50cyAobWF0aGVtYXRpY2FsIG9yIGRlZmluZWQgYnkgX3ZpZXdwb3J0UHJvcHMpIHRvIG1hcCBzdGF0ZVxuICAvKiBlc2xpbnQtZGlzYWJsZSBjb21wbGV4aXR5ICovXG4gIF9hcHBseUNvbnN0cmFpbnRzKHByb3BzKSB7XG4gICAgLy8gTm9ybWFsaXplIGRlZ3JlZXNcbiAgICBjb25zdCB7bG9uZ2l0dWRlLCBiZWFyaW5nfSA9IHByb3BzO1xuICAgIGlmIChsb25naXR1ZGUgPCAtMTgwIHx8IGxvbmdpdHVkZSA+IDE4MCkge1xuICAgICAgcHJvcHMubG9uZ2l0dWRlID0gbW9kKGxvbmdpdHVkZSArIDE4MCwgMzYwKSAtIDE4MDtcbiAgICB9XG4gICAgaWYgKGJlYXJpbmcgPCAtMTgwIHx8IGJlYXJpbmcgPiAxODApIHtcbiAgICAgIHByb3BzLmJlYXJpbmcgPSBtb2QoYmVhcmluZyArIDE4MCwgMzYwKSAtIDE4MDtcbiAgICB9XG5cbiAgICAvLyBFbnN1cmUgem9vbSBpcyB3aXRoaW4gc3BlY2lmaWVkIHJhbmdlXG4gICAgY29uc3Qge21heFpvb20sIG1pblpvb20sIHpvb219ID0gcHJvcHM7XG4gICAgcHJvcHMuem9vbSA9IHpvb20gPiBtYXhab29tID8gbWF4Wm9vbSA6IHpvb207XG4gICAgcHJvcHMuem9vbSA9IHpvb20gPCBtaW5ab29tID8gbWluWm9vbSA6IHpvb207XG5cbiAgICAvLyBFbnN1cmUgcGl0Y2ggaXMgd2l0aGluIHNwZWNpZmllZCByYW5nZVxuICAgIGNvbnN0IHttYXhQaXRjaCwgbWluUGl0Y2gsIHBpdGNofSA9IHByb3BzO1xuXG4gICAgcHJvcHMucGl0Y2ggPSBwaXRjaCA+IG1heFBpdGNoID8gbWF4UGl0Y2ggOiBwaXRjaDtcbiAgICBwcm9wcy5waXRjaCA9IHBpdGNoIDwgbWluUGl0Y2ggPyBtaW5QaXRjaCA6IHBpdGNoO1xuXG4gICAgLy8gQ29uc3RyYWluIHpvb20gYW5kIHNoaWZ0IGNlbnRlciBhdCBsb3cgem9vbSBsZXZlbHNcbiAgICBjb25zdCB7aGVpZ2h0fSA9IHByb3BzO1xuICAgIGxldCB7bGF0aXR1ZGVSYW5nZTogW3RvcFksIGJvdHRvbVldLCB2aWV3cG9ydH0gPSB0aGlzLl9nZXRMYXRpdHVkZVJhbmdlKHByb3BzKTtcbiAgICBsZXQgc2hpZnRZID0gMDtcblxuICAgIGlmIChib3R0b21ZIC0gdG9wWSA8IGhlaWdodCkge1xuICAgICAgLy8gTWFwIGhlaWdodCBtdXN0IG5vdCBiZSBzbWFsbGVyIHRoYW4gdmlld3BvcnQgaGVpZ2h0XG4gICAgICBwcm9wcy56b29tICs9IE1hdGgubG9nMihoZWlnaHQgLyAoYm90dG9tWSAtIHRvcFkpKTtcbiAgICAgIGNvbnN0IG5ld1JhbmdlID0gdGhpcy5fZ2V0TGF0aXR1ZGVSYW5nZShwcm9wcyk7XG4gICAgICBbdG9wWSwgYm90dG9tWV0gPSBuZXdSYW5nZS5sYXRpdHVkZVJhbmdlO1xuICAgICAgdmlld3BvcnQgPSBuZXdSYW5nZS52aWV3cG9ydDtcbiAgICB9XG4gICAgaWYgKHRvcFkgPiAwKSB7XG4gICAgICAvLyBDb21wZW5zYXRlIGZvciB3aGl0ZSBnYXAgb24gdG9wXG4gICAgICBzaGlmdFkgPSB0b3BZO1xuICAgIH0gZWxzZSBpZiAoYm90dG9tWSA8IGhlaWdodCkge1xuICAgICAgLy8gQ29tcGVuc2F0ZSBmb3Igd2hpdGUgZ2FwIG9uIGJvdHRvbVxuICAgICAgc2hpZnRZID0gYm90dG9tWSAtIGhlaWdodDtcbiAgICB9XG4gICAgaWYgKHNoaWZ0WSkge1xuICAgICAgcHJvcHMubGF0aXR1ZGUgPSB2aWV3cG9ydC51bnByb2plY3QoW3Byb3BzLndpZHRoIC8gMiwgaGVpZ2h0IC8gMiArIHNoaWZ0WV0pWzFdO1xuICAgIH1cblxuICAgIHJldHVybiBwcm9wcztcbiAgfVxuICAvKiBlc2xpbnQtZW5hYmxlIGNvbXBsZXhpdHkgKi9cblxuICAvLyBSZXR1cm5zIHt2aWV3cG9ydCwgbGF0aXR1ZGVSYW5nZTogW3RvcFksIGJvdHRvbVldfSBpbiBub24tcGVyc3BlY3RpdmUgbW9kZVxuICBfZ2V0TGF0aXR1ZGVSYW5nZShwcm9wcykge1xuICAgIGNvbnN0IGZsYXRWaWV3cG9ydCA9IG5ldyBQZXJzcGVjdGl2ZU1lcmNhdG9yVmlld3BvcnQoT2JqZWN0LmFzc2lnbih7fSwgcHJvcHMsIHtcbiAgICAgIHBpdGNoOiAwLFxuICAgICAgYmVhcmluZzogMFxuICAgIH0pKTtcbiAgICByZXR1cm4ge1xuICAgICAgdmlld3BvcnQ6IGZsYXRWaWV3cG9ydCxcbiAgICAgIGxhdGl0dWRlUmFuZ2U6IFtcbiAgICAgICAgZmxhdFZpZXdwb3J0LnByb2plY3QoW3Byb3BzLmxvbmdpdHVkZSwgcHJvcHMubWF4TGF0aXR1ZGVdKVsxXSxcbiAgICAgICAgZmxhdFZpZXdwb3J0LnByb2plY3QoW3Byb3BzLmxvbmdpdHVkZSwgcHJvcHMubWluTGF0aXR1ZGVdKVsxXVxuICAgICAgXVxuICAgIH07XG4gIH1cblxuICBfdW5wcm9qZWN0KHBvcykge1xuICAgIGNvbnN0IHZpZXdwb3J0ID0gbmV3IFBlcnNwZWN0aXZlTWVyY2F0b3JWaWV3cG9ydCh0aGlzLl92aWV3cG9ydFByb3BzKTtcbiAgICByZXR1cm4gcG9zICYmIHZpZXdwb3J0LnVucHJvamVjdChwb3MsIHt0b3BMZWZ0OiBmYWxzZX0pO1xuICB9XG5cbiAgLy8gQ2FsY3VsYXRlIGEgbmV3IGxuZ2xhdCBiYXNlZCBvbiBwaXhlbCBkcmFnZ2luZyBwb3NpdGlvblxuICBfY2FsY3VsYXRlTmV3TG5nTGF0KHtzdGFydFBhbkxuZ0xhdCwgcG9zfSkge1xuICAgIGNvbnN0IHZpZXdwb3J0ID0gbmV3IFBlcnNwZWN0aXZlTWVyY2F0b3JWaWV3cG9ydCh0aGlzLl92aWV3cG9ydFByb3BzKTtcbiAgICByZXR1cm4gdmlld3BvcnQuZ2V0TG9jYXRpb25BdFBvaW50KHtsbmdMYXQ6IHN0YXJ0UGFuTG5nTGF0LCBwb3N9KTtcbiAgfVxuXG4gIC8vIENhbGN1bGF0ZXMgbmV3IHpvb21cbiAgX2NhbGN1bGF0ZU5ld1pvb20oe3NjYWxlLCBzdGFydFpvb219KSB7XG4gICAgY29uc3Qge21heFpvb20sIG1pblpvb219ID0gdGhpcy5fdmlld3BvcnRQcm9wcztcbiAgICBsZXQgem9vbSA9IHN0YXJ0Wm9vbSArIE1hdGgubG9nMihzY2FsZSk7XG4gICAgem9vbSA9IHpvb20gPiBtYXhab29tID8gbWF4Wm9vbSA6IHpvb207XG4gICAgem9vbSA9IHpvb20gPCBtaW5ab29tID8gbWluWm9vbSA6IHpvb207XG4gICAgcmV0dXJuIHpvb207XG4gIH1cblxuICAvLyBDYWxjdWxhdGVzIGEgbmV3IHBpdGNoIGFuZCBiZWFyaW5nIGZyb20gYSBwb3NpdGlvbiAoY29taW5nIGZyb20gYW4gZXZlbnQpXG4gIF9jYWxjdWxhdGVOZXdQaXRjaEFuZEJlYXJpbmcoe2RlbHRhU2NhbGVYLCBkZWx0YVNjYWxlWSwgc3RhcnRCZWFyaW5nLCBzdGFydFBpdGNofSkge1xuICAgIGNvbnN0IHttaW5QaXRjaCwgbWF4UGl0Y2h9ID0gdGhpcy5fdmlld3BvcnRQcm9wcztcblxuICAgIGNvbnN0IGJlYXJpbmcgPSBzdGFydEJlYXJpbmcgKyAxODAgKiBkZWx0YVNjYWxlWDtcbiAgICBsZXQgcGl0Y2ggPSBzdGFydFBpdGNoO1xuICAgIGlmIChkZWx0YVNjYWxlWSA+IDApIHtcbiAgICAgIC8vIEdyYWR1YWxseSBpbmNyZWFzZSBwaXRjaFxuICAgICAgcGl0Y2ggPSBzdGFydFBpdGNoICsgZGVsdGFTY2FsZVkgKiAobWF4UGl0Y2ggLSBzdGFydFBpdGNoKTtcbiAgICB9IGVsc2UgaWYgKGRlbHRhU2NhbGVZIDwgMCkge1xuICAgICAgLy8gR3JhZHVhbGx5IGRlY3JlYXNlIHBpdGNoXG4gICAgICBwaXRjaCA9IHN0YXJ0UGl0Y2ggLSBkZWx0YVNjYWxlWSAqIChtaW5QaXRjaCAtIHN0YXJ0UGl0Y2gpO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBwaXRjaCxcbiAgICAgIGJlYXJpbmdcbiAgICB9O1xuICB9XG5cbn1cbiJdfQ==