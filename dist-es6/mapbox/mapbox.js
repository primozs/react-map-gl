var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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

/* global window, document, process */
import PropTypes from 'prop-types';

var isBrowser = !((typeof process === 'undefined' ? 'undefined' : _typeof(process)) === 'object' && String(process) === '[object process]' && !process.browser);

export var mapboxgl = isBrowser ? require('mapbox-gl') : null;

function noop() {}

var propTypes = {
  // Creation parameters
  // container: PropTypes.DOMElement || String

  mapboxApiAccessToken: PropTypes.string, /** Mapbox API access token for Mapbox tiles/styles. */
  attributionControl: PropTypes.bool, /** Show attribution control or not. */
  preserveDrawingBuffer: PropTypes.bool, /** Useful when you want to export the canvas as a PNG. */
  onLoad: PropTypes.func, /** The onLoad callback for the map */
  reuseMaps: PropTypes.bool,

  mapStyle: PropTypes.string, /** The Mapbox style. A string url to a MapboxGL style */
  visible: PropTypes.bool, /** Whether the map is visible */

  // Map view state
  width: PropTypes.number.isRequired, /** The width of the map. */
  height: PropTypes.number.isRequired, /** The height of the map. */
  longitude: PropTypes.number.isRequired, /** The longitude of the center of the map. */
  latitude: PropTypes.number.isRequired, /** The latitude of the center of the map. */
  zoom: PropTypes.number.isRequired, /** The tile zoom level of the map. */
  bearing: PropTypes.number, /** Specify the bearing of the viewport */
  pitch: PropTypes.number, /** Specify the pitch of the viewport */

  // Note: Non-public API, see https://github.com/mapbox/mapbox-gl-js/issues/1137
  altitude: PropTypes.number /** Altitude of the viewport camera. Default 1.5 "screen heights" */
};

var defaultProps = {
  mapboxApiAccessToken: getAccessToken(),
  preserveDrawingBuffer: false,
  attributionControl: true,
  preventStyleDiffing: false,
  onLoad: noop,
  reuseMaps: false,

  mapStyle: 'mapbox://styles/mapbox/light-v8',
  visible: true,

  bearing: 0,
  pitch: 0,
  altitude: 1.5
};

// Try to get access token from URL, env, local storage or config
export function getAccessToken() {
  var accessToken = null;

  if (typeof window !== 'undefined' && window.location) {
    var match = window.location.search.match(/access_token=([^&\/]*)/);
    accessToken = match && match[1];
  }

  if (!accessToken && typeof process !== 'undefined') {
    // Note: This depends on bundler plugins (e.g. webpack) inmporting environment correctly
    accessToken = accessToken || process.env.MapboxAccessToken; // eslint-disable-line
  }

  return accessToken || null;
}

// Helper function to merge defaultProps and check prop types
function checkPropTypes(props) {
  var component = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'component';

  // TODO - check for production (unless done by prop types package?)
  if (props.debug) {
    PropTypes.checkPropTypes(propTypes, props, 'prop', component);
  }
}

// A small wrapper class for mapbox-gl
// - Provides a prop style interface (that can be trivially used by a React wrapper)
// - Makes sure mapbox doesn't crash under Node
// - Handles map reuse (to work around Mapbox resource leak issues)
// - Provides support for specifying tokens during development

var Mapbox = function () {
  _createClass(Mapbox, null, [{
    key: 'supported',
    value: function supported() {
      return mapboxgl && mapboxgl.supported();
    }
  }]);

  function Mapbox(props) {
    _classCallCheck(this, Mapbox);

    if (!mapboxgl) {
      throw new Error('Mapbox not supported');
    }

    this.props = {};
    this._initialize(props);
  }

  _createClass(Mapbox, [{
    key: 'finalize',
    value: function finalize() {
      if (!mapboxgl || !this._map) {
        return this;
      }

      this._destroy();
      return this;
    }
  }, {
    key: 'setProps',
    value: function setProps(props) {
      if (!mapboxgl || !this._map) {
        return this;
      }

      this._update(this.props, props);
      return this;
    }

    // Mapbox's map.resize() reads size from DOM, so DOM element must already be resized
    // In a system like React we must wait to read size until after render
    // (e.g. until "componentDidUpdate")

  }, {
    key: 'resize',
    value: function resize() {
      if (!mapboxgl || !this._map) {
        return this;
      }

      this._map.resize();
      return this;
    }

    // External apps can access map this way

  }, {
    key: 'getMap',
    value: function getMap() {
      return this._map;
    }

    // PRIVATE API

  }, {
    key: '_create',
    value: function _create(props) {
      // Reuse a saved map, if available
      if (props.reuseMaps && Mapbox.savedMap) {
        this._map = this.map = Mapbox.savedMap;
        Mapbox.savedMap = null;
        // TODO - need to call onload again, need to track with Promise?
        props.onLoad();
        console.debug('Reused existing mapbox map', this._map); // eslint-disable-line
      } else {
        this._map = this.map = new mapboxgl.Map({
          container: props.container || document.body,
          center: [props.longitude, props.latitude],
          zoom: props.zoom,
          pitch: props.pitch,
          bearing: props.bearing,
          style: props.mapStyle,
          interactive: false,
          attributionControl: props.attributionControl,
          preserveDrawingBuffer: props.preserveDrawingBuffer
        });
        // Attach optional onLoad function
        this.map.once('load', props.onLoad);
        console.debug('Created new mapbox map', this._map); // eslint-disable-line
      }

      return this;
    }
  }, {
    key: '_destroy',
    value: function _destroy() {
      if (!Mapbox.savedMap) {
        Mapbox.savedMap = this._map;
      } else {
        this._map.remove();
      }
    }
  }, {
    key: '_initialize',
    value: function _initialize(props) {
      props = Object.assign({}, defaultProps, props);
      checkPropTypes(props, 'Mapbox');

      // Make empty string pick up default prop
      this.accessToken = props.mapboxApiAccessToken || defaultProps.mapboxApiAccessToken;

      // Creation only props
      if (mapboxgl) {
        if (!this.accessToken) {
          console.error('An API access token is required to use Mapbox GL'); // eslint-disable-line
          mapboxgl.accessToken = 'no-token'; // Prevents mapbox from throwing
        } else {
          mapboxgl.accessToken = this.accessToken;
        }
      }

      this._create(props);

      // Disable outline style
      var canvas = this.map.getCanvas();
      if (canvas) {
        canvas.style.outline = 'none';
      }

      this._updateMapViewport({}, props);
      this._updateMapSize({}, props);

      this.props = props;
    }
  }, {
    key: '_update',
    value: function _update(oldProps, newProps) {
      newProps = Object.assign({}, this.props, newProps);
      checkPropTypes(newProps, 'Mapbox');

      this._updateMapViewport(oldProps, newProps);
      this._updateMapSize(oldProps, newProps);

      this.props = newProps;
    }
  }, {
    key: '_updateMapViewport',
    value: function _updateMapViewport(oldProps, newProps) {
      var viewportChanged = newProps.latitude !== oldProps.latitude || newProps.longitude !== oldProps.longitude || newProps.zoom !== oldProps.zoom || newProps.pitch !== oldProps.pitch || newProps.bearing !== oldProps.bearing || newProps.altitude !== oldProps.altitude;

      if (viewportChanged) {
        this._map.jumpTo({
          center: [newProps.longitude, newProps.latitude],
          zoom: newProps.zoom,
          bearing: newProps.bearing,
          pitch: newProps.pitch
        });

        // TODO - jumpTo doesn't handle altitude
        if (newProps.altitude !== oldProps.altitude) {
          this._map.transform.altitude = newProps.altitude;
        }
      }
    }

    // Note: needs to be called after render (e.g. in componentDidUpdate)

  }, {
    key: '_updateMapSize',
    value: function _updateMapSize(oldProps, newProps) {
      var sizeChanged = oldProps.width !== newProps.width || oldProps.height !== newProps.height;
      if (sizeChanged) {
        this._map.resize();
      }
    }
  }]);

  return Mapbox;
}();

export default Mapbox;


Mapbox.propTypes = propTypes;
Mapbox.defaultProps = defaultProps;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tYXBib3gvbWFwYm94LmpzIl0sIm5hbWVzIjpbIlByb3BUeXBlcyIsImlzQnJvd3NlciIsInByb2Nlc3MiLCJTdHJpbmciLCJicm93c2VyIiwibWFwYm94Z2wiLCJyZXF1aXJlIiwibm9vcCIsInByb3BUeXBlcyIsIm1hcGJveEFwaUFjY2Vzc1Rva2VuIiwic3RyaW5nIiwiYXR0cmlidXRpb25Db250cm9sIiwiYm9vbCIsInByZXNlcnZlRHJhd2luZ0J1ZmZlciIsIm9uTG9hZCIsImZ1bmMiLCJyZXVzZU1hcHMiLCJtYXBTdHlsZSIsInZpc2libGUiLCJ3aWR0aCIsIm51bWJlciIsImlzUmVxdWlyZWQiLCJoZWlnaHQiLCJsb25naXR1ZGUiLCJsYXRpdHVkZSIsInpvb20iLCJiZWFyaW5nIiwicGl0Y2giLCJhbHRpdHVkZSIsImRlZmF1bHRQcm9wcyIsImdldEFjY2Vzc1Rva2VuIiwicHJldmVudFN0eWxlRGlmZmluZyIsImFjY2Vzc1Rva2VuIiwid2luZG93IiwibG9jYXRpb24iLCJtYXRjaCIsInNlYXJjaCIsImVudiIsIk1hcGJveEFjY2Vzc1Rva2VuIiwiY2hlY2tQcm9wVHlwZXMiLCJwcm9wcyIsImNvbXBvbmVudCIsImRlYnVnIiwiTWFwYm94Iiwic3VwcG9ydGVkIiwiRXJyb3IiLCJfaW5pdGlhbGl6ZSIsIl9tYXAiLCJfZGVzdHJveSIsIl91cGRhdGUiLCJyZXNpemUiLCJzYXZlZE1hcCIsIm1hcCIsImNvbnNvbGUiLCJNYXAiLCJjb250YWluZXIiLCJkb2N1bWVudCIsImJvZHkiLCJjZW50ZXIiLCJzdHlsZSIsImludGVyYWN0aXZlIiwib25jZSIsInJlbW92ZSIsIk9iamVjdCIsImFzc2lnbiIsImVycm9yIiwiX2NyZWF0ZSIsImNhbnZhcyIsImdldENhbnZhcyIsIm91dGxpbmUiLCJfdXBkYXRlTWFwVmlld3BvcnQiLCJfdXBkYXRlTWFwU2l6ZSIsIm9sZFByb3BzIiwibmV3UHJvcHMiLCJ2aWV3cG9ydENoYW5nZWQiLCJq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OUMsT0FKOUIsSUFLQStDLFNBQVM3QyxRQUFULEtBQXNCNEMsU0FBUzVDLFFBTmpDOztBQVFBLFVBQUk4QyxlQUFKLEVBQXFCO0FBQ25CLGFBQUszQixJQUFMLENBQVU0QixNQUFWLENBQWlCO0FBQ2ZqQixrQkFBUSxDQUFDZSxTQUFTbEQsU0FBVixFQUFxQmtELFNBQVNqRCxRQUE5QixDQURPO0FBRWZDLGdCQUFNZ0QsU0FBU2hELElBRkE7QUFHZkMsbUJBQVMrQyxTQUFTL0MsT0FISDtBQUlmQyxpQkFBTzhDLFNBQVM5QztBQUpELFNBQWpCOztBQU9BO0FBQ0EsWUFBSThDLFNBQVM3QyxRQUFULEtBQXNCNEMsU0FBUzVDLFFBQW5DLEVBQTZDO0FBQzNDLGVBQUttQixJQUFMLENBQVU2QixTQUFWLENBQW9CaEQsUUFBcEIsR0FBK0I2QyxTQUFTN0MsUUFBeEM7QUFDRDtBQUNGO0FBQ0Y7O0FBRUQ7Ozs7bUNBQ2U0QyxRLEVBQVVDLFEsRUFBVTtBQUNqQyxVQUFNSSxjQUFjTCxTQUFTckQsS0FBVCxLQUFtQnNELFNBQVN0RCxLQUE1QixJQUFxQ3FELFNBQVNsRCxNQUFULEtBQW9CbUQsU0FBU25ELE1BQXRGO0FBQ0EsVUFBSXVELFdBQUosRUFBaUI7QUFDZixhQUFLOUIsSUFBTCxDQUFVRyxNQUFWO0FBQ0Q7QUFDRjs7Ozs7O2VBOUprQlAsTTs7O0FBaUtyQkEsT0FBT25DLFNBQVAsR0FBbUJBLFNBQW5CO0FBQ0FtQyxPQUFPZCxZQUFQLEdBQXNCQSxZQUF0QiIsImZpbGUiOiJtYXBib3guanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTUgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cblxuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG4vKiBnbG9iYWwgd2luZG93LCBkb2N1bWVudCwgcHJvY2VzcyAqL1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcblxuY29uc3QgaXNCcm93c2VyID0gIShcbiAgdHlwZW9mIHByb2Nlc3MgPT09ICdvYmplY3QnICYmXG4gIFN0cmluZyhwcm9jZXNzKSA9PT0gJ1tvYmplY3QgcHJvY2Vzc10nICYmXG4gICFwcm9jZXNzLmJyb3dzZXJcbik7XG5cbmV4cG9ydCBjb25zdCBtYXBib3hnbCA9IGlzQnJvd3NlciA/IHJlcXVpcmUoJ21hcGJveC1nbCcpIDogbnVsbDtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbmNvbnN0IHByb3BUeXBlcyA9IHtcbiAgLy8gQ3JlYXRpb24gcGFyYW1ldGVyc1xuICAvLyBjb250YWluZXI6IFByb3BUeXBlcy5ET01FbGVtZW50IHx8IFN0cmluZ1xuXG4gIG1hcGJveEFwaUFjY2Vzc1Rva2VuOiBQcm9wVHlwZXMuc3RyaW5nLCAvKiogTWFwYm94IEFQSSBhY2Nlc3MgdG9rZW4gZm9yIE1hcGJveCB0aWxlcy9zdHlsZXMuICovXG4gIGF0dHJpYnV0aW9uQ29udHJvbDogUHJvcFR5cGVzLmJvb2wsIC8qKiBTaG93IGF0dHJpYnV0aW9uIGNvbnRyb2wgb3Igbm90LiAqL1xuICBwcmVzZXJ2ZURyYXdpbmdCdWZmZXI6IFByb3BUeXBlcy5ib29sLCAvKiogVXNlZnVsIHdoZW4geW91IHdhbnQgdG8gZXhwb3J0IHRoZSBjYW52YXMgYXMgYSBQTkcuICovXG4gIG9uTG9hZDogUHJvcFR5cGVzLmZ1bmMsIC8qKiBUaGUgb25Mb2FkIGNhbGxiYWNrIGZvciB0aGUgbWFwICovXG4gIHJldXNlTWFwczogUHJvcFR5cGVzLmJvb2wsXG5cbiAgbWFwU3R5bGU6IFByb3BUeXBlcy5zdHJpbmcsIC8qKiBUaGUgTWFwYm94IHN0eWxlLiBBIHN0cmluZyB1cmwgdG8gYSBNYXBib3hHTCBzdHlsZSAqL1xuICB2aXNpYmxlOiBQcm9wVHlwZXMuYm9vbCwgLyoqIFdoZXRoZXIgdGhlIG1hcCBpcyB2aXNpYmxlICovXG5cbiAgLy8gTWFwIHZpZXcgc3RhdGVcbiAgd2lkdGg6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCwgLyoqIFRoZSB3aWR0aCBvZiB0aGUgbWFwLiAqL1xuICBoZWlnaHQ6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCwgLyoqIFRoZSBoZWlnaHQgb2YgdGhlIG1hcC4gKi9cbiAgbG9uZ2l0dWRlOiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsIC8qKiBUaGUgbG9uZ2l0dWRlIG9mIHRoZSBjZW50ZXIgb2YgdGhlIG1hcC4gKi9cbiAgbGF0aXR1ZGU6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCwgLyoqIFRoZSBsYXRpdHVkZSBvZiB0aGUgY2VudGVyIG9mIHRoZSBtYXAuICovXG4gIHpvb206IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCwgLyoqIFRoZSB0aWxlIHpvb20gbGV2ZWwgb2YgdGhlIG1hcC4gKi9cbiAgYmVhcmluZzogUHJvcFR5cGVzLm51bWJlciwgLyoqIFNwZWNpZnkgdGhlIGJlYXJpbmcgb2YgdGhlIHZpZXdwb3J0ICovXG4gIHBpdGNoOiBQcm9wVHlwZXMubnVtYmVyLCAvKiogU3BlY2lmeSB0aGUgcGl0Y2ggb2YgdGhlIHZpZXdwb3J0ICovXG5cbiAgLy8gTm90ZTogTm9uLXB1YmxpYyBBUEksIHNlZSBodHRwczovL2dpdGh1Yi5jb20vbWFwYm94L21hcGJveC1nbC1qcy9pc3N1ZXMvMTEzN1xuICBhbHRpdHVkZTogUHJvcFR5cGVzLm51bWJlciAvKiogQWx0aXR1ZGUgb2YgdGhlIHZpZXdwb3J0IGNhbWVyYS4gRGVmYXVsdCAxLjUgXCJzY3JlZW4gaGVpZ2h0c1wiICovXG59O1xuXG5jb25zdCBkZWZhdWx0UHJvcHMgPSB7XG4gIG1hcGJveEFwaUFjY2Vzc1Rva2VuOiBnZXRBY2Nlc3NUb2tlbigpLFxuICBwcmVzZXJ2ZURyYXdpbmdCdWZmZXI6IGZhbHNlLFxuICBhdHRyaWJ1dGlvbkNvbnRyb2w6IHRydWUsXG4gIHByZXZlbnRTdHlsZURpZmZpbmc6IGZhbHNlLFxuICBvbkxvYWQ6IG5vb3AsXG4gIHJldXNlTWFwczogZmFsc2UsXG5cbiAgbWFwU3R5bGU6ICdtYXBib3g6Ly9zdHlsZXMvbWFwYm94L2xpZ2h0LXY4JyxcbiAgdmlzaWJsZTogdHJ1ZSxcblxuICBiZWFyaW5nOiAwLFxuICBwaXRjaDogMCxcbiAgYWx0aXR1ZGU6IDEuNVxufTtcblxuLy8gVHJ5IHRvIGdldCBhY2Nlc3MgdG9rZW4gZnJvbSBVUkwsIGVudiwgbG9jYWwgc3RvcmFnZSBvciBjb25maWdcbmV4cG9ydCBmdW5jdGlvbiBnZXRBY2Nlc3NUb2tlbigpIHtcbiAgbGV0IGFjY2Vzc1Rva2VuID0gbnVsbDtcblxuICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LmxvY2F0aW9uKSB7XG4gICAgY29uc3QgbWF0Y2ggPSB3aW5kb3cubG9jYXRpb24uc2VhcmNoLm1hdGNoKC9hY2Nlc3NfdG9rZW49KFteJlxcL10qKS8pO1xuICAgIGFjY2Vzc1Rva2VuID0gbWF0Y2ggJiYgbWF0Y2hbMV07XG4gIH1cblxuICBpZiAoIWFjY2Vzc1Rva2VuICYmIHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJykge1xuICAgIC8vIE5vdGU6IFRoaXMgZGVwZW5kcyBvbiBidW5kbGVyIHBsdWdpbnMgKGUuZy4gd2VicGFjaykgaW5tcG9ydGluZyBlbnZpcm9ubWVudCBjb3JyZWN0bHlcbiAgICBhY2Nlc3NUb2tlbiA9IGFjY2Vzc1Rva2VuIHx8IHByb2Nlc3MuZW52Lk1hcGJveEFjY2Vzc1Rva2VuOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gIH1cblxuICByZXR1cm4gYWNjZXNzVG9rZW4gfHwgbnVsbDtcbn1cblxuLy8gSGVscGVyIGZ1bmN0aW9uIHRvIG1lcmdlIGRlZmF1bHRQcm9wcyBhbmQgY2hlY2sgcHJvcCB0eXBlc1xuZnVuY3Rpb24gY2hlY2tQcm9wVHlwZXMocHJvcHMsIGNvbXBvbmVudCA9ICdjb21wb25lbnQnKSB7XG4gIC8vIFRPRE8gLSBjaGVjayBmb3IgcHJvZHVjdGlvbiAodW5sZXNzIGRvbmUgYnkgcHJvcCB0eXBlcyBwYWNrYWdlPylcbiAgaWYgKHByb3BzLmRlYnVnKSB7XG4gICAgUHJvcFR5cGVzLmNoZWNrUHJvcFR5cGVzKHByb3BUeXBlcywgcHJvcHMsICdwcm9wJywgY29tcG9uZW50KTtcbiAgfVxufVxuXG4vLyBBIHNtYWxsIHdyYXBwZXIgY2xhc3MgZm9yIG1hcGJveC1nbFxuLy8gLSBQcm92aWRlcyBhIHByb3Agc3R5bGUgaW50ZXJmYWNlICh0aGF0IGNhbiBiZSB0cml2aWFsbHkgdXNlZCBieSBhIFJlYWN0IHdyYXBwZXIpXG4vLyAtIE1ha2VzIHN1cmUgbWFwYm94IGRvZXNuJ3QgY3Jhc2ggdW5kZXIgTm9kZVxuLy8gLSBIYW5kbGVzIG1hcCByZXVzZSAodG8gd29yayBhcm91bmQgTWFwYm94IHJlc291cmNlIGxlYWsgaXNzdWVzKVxuLy8gLSBQcm92aWRlcyBzdXBwb3J0IGZvciBzcGVjaWZ5aW5nIHRva2VucyBkdXJpbmcgZGV2ZWxvcG1lbnRcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWFwYm94IHtcbiAgc3RhdGljIHN1cHBvcnRlZCgpIHtcbiAgICByZXR1cm4gbWFwYm94Z2wgJiYgbWFwYm94Z2wuc3VwcG9ydGVkKCk7XG4gIH1cblxuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgIGlmICghbWFwYm94Z2wpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTWFwYm94IG5vdCBzdXBwb3J0ZWQnKTtcbiAgICB9XG5cbiAgICB0aGlzLnByb3BzID0ge307XG4gICAgdGhpcy5faW5pdGlhbGl6ZShwcm9wcyk7XG4gIH1cblxuICBmaW5hbGl6ZSgpIHtcbiAgICBpZiAoIW1hcGJveGdsIHx8ICF0aGlzLl9tYXApIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHRoaXMuX2Rlc3Ryb3koKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHNldFByb3BzKHByb3BzKSB7XG4gICAgaWYgKCFtYXBib3hnbCB8fCAhdGhpcy5fbWFwKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB0aGlzLl91cGRhdGUodGhpcy5wcm9wcywgcHJvcHMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gTWFwYm94J3MgbWFwLnJlc2l6ZSgpIHJlYWRzIHNpemUgZnJvbSBET00sIHNvIERPTSBlbGVtZW50IG11c3QgYWxyZWFkeSBiZSByZXNpemVkXG4gIC8vIEluIGEgc3lzdGVtIGxpa2UgUmVhY3Qgd2UgbXVzdCB3YWl0IHRvIHJlYWQgc2l6ZSB1bnRpbCBhZnRlciByZW5kZXJcbiAgLy8gKGUuZy4gdW50aWwgXCJjb21wb25lbnREaWRVcGRhdGVcIilcbiAgcmVzaXplKCkge1xuICAgIGlmICghbWFwYm94Z2wgfHwgIXRoaXMuX21hcCkge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdGhpcy5fbWFwLnJlc2l6ZSgpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gRXh0ZXJuYWwgYXBwcyBjYW4gYWNjZXNzIG1hcCB0aGlzIHdheVxuICBnZXRNYXAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX21hcDtcbiAgfVxuXG4gIC8vIFBSSVZBVEUgQVBJXG5cbiAgX2NyZWF0ZShwcm9wcykge1xuICAgIC8vIFJldXNlIGEgc2F2ZWQgbWFwLCBpZiBhdmFpbGFibGVcbiAgICBpZiAocHJvcHMucmV1c2VNYXBzICYmIE1hcGJveC5zYXZlZE1hcCkge1xuICAgICAgdGhpcy5fbWFwID0gdGhpcy5tYXAgPSBNYXBib3guc2F2ZWRNYXA7XG4gICAgICBNYXBib3guc2F2ZWRNYXAgPSBudWxsO1xuICAgICAgLy8gVE9ETyAtIG5lZWQgdG8gY2FsbCBvbmxvYWQgYWdhaW4sIG5lZWQgdG8gdHJhY2sgd2l0aCBQcm9taXNlP1xuICAgICAgcHJvcHMub25Mb2FkKCk7XG4gICAgICBjb25zb2xlLmRlYnVnKCdSZXVzZWQgZXhpc3RpbmcgbWFwYm94IG1hcCcsIHRoaXMuX21hcCk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fbWFwID0gdGhpcy5tYXAgPSBuZXcgbWFwYm94Z2wuTWFwKHtcbiAgICAgICAgY29udGFpbmVyOiBwcm9wcy5jb250YWluZXIgfHwgZG9jdW1lbnQuYm9keSxcbiAgICAgICAgY2VudGVyOiBbcHJvcHMubG9uZ2l0dWRlLCBwcm9wcy5sYXRpdHVkZV0sXG4gICAgICAgIHpvb206IHByb3BzLnpvb20sXG4gICAgICAgIHBpdGNoOiBwcm9wcy5waXRjaCxcbiAgICAgICAgYmVhcmluZzogcHJvcHMuYmVhcmluZyxcbiAgICAgICAgc3R5bGU6IHByb3BzLm1hcFN0eWxlLFxuICAgICAgICBpbnRlcmFjdGl2ZTogZmFsc2UsXG4gICAgICAgIGF0dHJpYnV0aW9uQ29udHJvbDogcHJvcHMuYXR0cmlidXRpb25Db250cm9sLFxuICAgICAgICBwcmVzZXJ2ZURyYXdpbmdCdWZmZXI6IHByb3BzLnByZXNlcnZlRHJhd2luZ0J1ZmZlclxuICAgICAgfSk7XG4gICAgICAvLyBBdHRhY2ggb3B0aW9uYWwgb25Mb2FkIGZ1bmN0aW9uXG4gICAgICB0aGlzLm1hcC5vbmNlKCdsb2FkJywgcHJvcHMub25Mb2FkKTtcbiAgICAgIGNvbnNvbGUuZGVidWcoJ0NyZWF0ZWQgbmV3IG1hcGJveCBtYXAnLCB0aGlzLl9tYXApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBfZGVzdHJveSgpIHtcbiAgICBpZiAoIU1hcGJveC5zYXZlZE1hcCkge1xuICAgICAgTWFwYm94LnNhdmVkTWFwID0gdGhpcy5fbWFwO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9tYXAucmVtb3ZlKCk7XG4gICAgfVxuICB9XG5cbiAgX2luaXRpYWxpemUocHJvcHMpIHtcbiAgICBwcm9wcyA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRQcm9wcywgcHJvcHMpO1xuICAgIGNoZWNrUHJvcFR5cGVzKHByb3BzLCAnTWFwYm94Jyk7XG5cbiAgICAvLyBNYWtlIGVtcHR5IHN0cmluZyBwaWNrIHVwIGRlZmF1bHQgcHJvcFxuICAgIHRoaXMuYWNjZXNzVG9rZW4gPSBwcm9wcy5tYXBib3hBcGlBY2Nlc3NUb2tlbiB8fCBkZWZhdWx0UHJvcHMubWFwYm94QXBpQWNjZXNzVG9rZW47XG5cbiAgICAvLyBDcmVhdGlvbiBvbmx5IHByb3BzXG4gICAgaWYgKG1hcGJveGdsKSB7XG4gICAgICBpZiAoIXRoaXMuYWNjZXNzVG9rZW4pIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignQW4gQVBJIGFjY2VzcyB0b2tlbiBpcyByZXF1aXJlZCB0byB1c2UgTWFwYm94IEdMJyk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgICAgICAgbWFwYm94Z2wuYWNjZXNzVG9rZW4gPSAnbm8tdG9rZW4nOyAvLyBQcmV2ZW50cyBtYXBib3ggZnJvbSB0aHJvd2luZ1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbWFwYm94Z2wuYWNjZXNzVG9rZW4gPSB0aGlzLmFjY2Vzc1Rva2VuO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuX2NyZWF0ZShwcm9wcyk7XG5cbiAgICAvLyBEaXNhYmxlIG91dGxpbmUgc3R5bGVcbiAgICBjb25zdCBjYW52YXMgPSB0aGlzLm1hcC5nZXRDYW52YXMoKTtcbiAgICBpZiAoY2FudmFzKSB7XG4gICAgICBjYW52YXMuc3R5bGUub3V0bGluZSA9ICdub25lJztcbiAgICB9XG5cbiAgICB0aGlzLl91cGRhdGVNYXBWaWV3cG9ydCh7fSwgcHJvcHMpO1xuICAgIHRoaXMuX3VwZGF0ZU1hcFNpemUoe30sIHByb3BzKTtcblxuICAgIHRoaXMucHJvcHMgPSBwcm9wcztcbiAgfVxuXG4gIF91cGRhdGUob2xkUHJvcHMsIG5ld1Byb3BzKSB7XG4gICAgbmV3UHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLnByb3BzLCBuZXdQcm9wcyk7XG4gICAgY2hlY2tQcm9wVHlwZXMobmV3UHJvcHMsICdNYXBib3gnKTtcblxuICAgIHRoaXMuX3VwZGF0ZU1hcFZpZXdwb3J0KG9sZFByb3BzLCBuZXdQcm9wcyk7XG4gICAgdGhpcy5fdXBkYXRlTWFwU2l6ZShvbGRQcm9wcywgbmV3UHJvcHMpO1xuXG4gICAgdGhpcy5wcm9wcyA9IG5ld1Byb3BzO1xuICB9XG5cbiAgX3VwZGF0ZU1hcFZpZXdwb3J0KG9sZFByb3BzLCBuZXdQcm9wcykge1xuICAgIGNvbnN0IHZpZXdwb3J0Q2hhbmdlZCA9XG4gICAgICBuZXdQcm9wcy5sYXRpdHVkZSAhPT0gb2xkUHJvcHMubGF0aXR1ZGUgfHxcbiAgICAgIG5ld1Byb3BzLmxvbmdpdHVkZSAhPT0gb2xkUHJvcHMubG9uZ2l0dWRlIHx8XG4gICAgICBuZXdQcm9wcy56b29tICE9PSBvbGRQcm9wcy56b29tIHx8XG4gICAgICBuZXdQcm9wcy5waXRjaCAhPT0gb2xkUHJvcHMucGl0Y2ggfHxcbiAgICAgIG5ld1Byb3BzLmJlYXJpbmcgIT09IG9sZFByb3BzLmJlYXJpbmcgfHxcbiAgICAgIG5ld1Byb3BzLmFsdGl0dWRlICE9PSBvbGRQcm9wcy5hbHRpdHVkZTtcblxuICAgIGlmICh2aWV3cG9ydENoYW5nZWQpIHtcbiAgICAgIHRoaXMuX21hcC5qdW1wVG8oe1xuICAgICAgICBjZW50ZXI6IFtuZXdQcm9wcy5sb25naXR1ZGUsIG5ld1Byb3BzLmxhdGl0dWRlXSxcbiAgICAgICAgem9vbTogbmV3UHJvcHMuem9vbSxcbiAgICAgICAgYmVhcmluZzogbmV3UHJvcHMuYmVhcmluZyxcbiAgICAgICAgcGl0Y2g6IG5ld1Byb3BzLnBpdGNoXG4gICAgICB9KTtcblxuICAgICAgLy8gVE9ETyAtIGp1bXBUbyBkb2Vzbid0IGhhbmRsZSBhbHRpdHVkZVxuICAgICAgaWYgKG5ld1Byb3BzLmFsdGl0dWRlICE9PSBvbGRQcm9wcy5hbHRpdHVkZSkge1xuICAgICAgICB0aGlzLl9tYXAudHJhbnNmb3JtLmFsdGl0dWRlID0gbmV3UHJvcHMuYWx0aXR1ZGU7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gTm90ZTogbmVlZHMgdG8gYmUgY2FsbGVkIGFmdGVyIHJlbmRlciAoZS5nLiBpbiBjb21wb25lbnREaWRVcGRhdGUpXG4gIF91cGRhdGVNYXBTaXplKG9sZFByb3BzLCBuZXdQcm9wcykge1xuICAgIGNvbnN0IHNpemVDaGFuZ2VkID0gb2xkUHJvcHMud2lkdGggIT09IG5ld1Byb3BzLndpZHRoIHx8IG9sZFByb3BzLmhlaWdodCAhPT0gbmV3UHJvcHMuaGVpZ2h0O1xuICAgIGlmIChzaXplQ2hhbmdlZCkge1xuICAgICAgdGhpcy5fbWFwLnJlc2l6ZSgpO1xuICAgIH1cbiAgfVxufVxuXG5NYXBib3gucHJvcFR5cGVzID0gcHJvcFR5cGVzO1xuTWFwYm94LmRlZmF1bHRQcm9wcyA9IGRlZmF1bHRQcm9wcztcbiJdfQ==