var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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
import { PureComponent, createElement } from 'react';
import PropTypes from 'prop-types';
import autobind from '../utils/autobind';

import { getInteractiveLayerIds, setDiffStyle } from '../utils/style-utils';
import Immutable from 'immutable';

import { PerspectiveMercatorViewport } from 'viewport-mercator-project';

import Mapbox from '../mapbox/mapbox';

/* eslint-disable max-len */
var TOKEN_DOC_URL = 'https://uber.github.io/react-map-gl/#/Documentation/getting-started/about-mapbox-tokens';
/* eslint-disable max-len */

function noop() {}

var propTypes = Object.assign({}, Mapbox.propTypes, {
  /** The Mapbox style. A string url or a MapboxGL style Immutable.Map object. */
  mapStyle: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Immutable.Map)]),
  /** There are known issues with style diffing. As stopgap, add option to prevent style diffing. */
  preventStyleDiffing: PropTypes.bool,
  /** Whether the map is visible */
  visible: PropTypes.bool
});

var defaultProps = Object.assign({}, Mapbox.defaultProps, {
  mapStyle: 'mapbox://styles/mapbox/light-v8',
  preventStyleDiffing: false,
  visible: true
});

var childContextTypes = {
  viewport: PropTypes.instanceOf(PerspectiveMercatorViewport)
};

var StaticMap = function (_PureComponent) {
  _inherits(StaticMap, _PureComponent);

  _createClass(StaticMap, null, [{
    key: 'supported',
    value: function supported() {
      return Mapbox && Mapbox.supported();
    }
  }]);

  function StaticMap(props) {
    _classCallCheck(this, StaticMap);

    var _this = _possibleConstructorReturn(this, (StaticMap.__proto__ || Object.getPrototypeOf(StaticMap)).call(this, props));

    _this._queryParams = {};
    if (!StaticMap.supported()) {
      _this.componentDidMount = noop;
      _this.componentWillReceiveProps = noop;
      _this.componentDidUpdate = noop;
    }
    _this.state = {};
    autobind(_this);
    return _this;
  }

  _createClass(StaticMap, [{
    key: 'getChildContext',
    value: function getChildContext() {
      return {
        viewport: new PerspectiveMercatorViewport(this.props)
      };
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      this._mapbox = new Mapbox(Object.assign({}, this.props, {
        container: this._mapboxMap,
        style: undefined
      }));
      this._map = this._mapbox.getMap();
      this._updateMapStyle({}, this.props);
      this.forceUpdate(); // Make sure we rerender after mounting
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(newProps) {
      this._mapbox.setProps(newProps);
      this._updateMapStyle(this.props, newProps);

      // this._updateMapViewport(this.props, newProps);

      // Save width/height so that we can check them in componentDidUpdate
      this.setState({
        width: this.props.width,
        height: this.props.height
      });
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      // Since Mapbox's map.resize() reads size from DOM
      // we must wait to read size until after render (i.e. here in "didUpdate")
      this._updateMapSize(this.state, this.props);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this._mapbox.finalize();
      this._mapbox = null;
      this._map = null;
    }

    // External apps can access map this way

  }, {
    key: 'getMap',
    value: function getMap() {
      return this._map;
    }

    /** Uses Mapbox's
      * queryRenderedFeatures API to find features at point or in a bounding box.
      * https://www.mapbox.com/mapbox-gl-js/api/#Map#queryRenderedFeatures
      * To query only some of the layers, set the `interactive` property in the
      * layer style to `true`.
      * @param {[Number, Number]|[[Number, Number], [Number, Number]]} geometry -
      *   Point or an array of two points defining the bounding box
      * @param {Object} parameters - query options
      */

  }, {
    key: 'queryRenderedFeatures',
    value: function queryRenderedFeatures(geometry, parameters) {
      var queryParams = parameters || this._queryParams;
      if (queryParams.layers && queryParams.layers.length === 0) {
        return [];
      }
      return this._map.queryRenderedFeatures(geometry, queryParams);
    }

    // Hover and click only query layers whose interactive property is true

  }, {
    key: '_updateQueryParams',
    value: function _updateQueryParams(mapStyle) {
      var interactiveLayerIds = getInteractiveLayerIds(mapStyle);
      this._queryParams = { layers: interactiveLayerIds };
    }

    // Note: needs to be called after render (e.g. in componentDidUpdate)

  }, {
    key: '_updateMapSize',
    value: function _updateMapSize(oldProps, newProps) {
      var sizeChanged = oldProps.width !== newProps.width || oldProps.height !== newProps.height;

      if (sizeChanged) {
        this._map.resize();
        // this._callOnChangeViewport(this._map.transform);
      }
    }
  }, {
    key: '_updateMapStyle',
    value: function _updateMapStyle(oldProps, newProps) {
      var mapStyle = newProps.mapStyle;
      var oldMapStyle = oldProps.mapStyle;
      if (mapStyle !== oldMapStyle) {
        if (Immutable.Map.isMap(mapStyle)) {
          if (this.props.preventStyleDiffing) {
            this._map.setStyle(mapStyle.toJS());
          } else {
            setDiffStyle(oldMapStyle, mapStyle, this._map);
          }
        } else {
          this._map.setStyle(mapStyle);
        }
        this._updateQueryParams(mapStyle);
      }
    }
  }, {
    key: '_mapboxMapLoaded',
    value: function _mapboxMapLoaded(ref) {
      this._mapboxMap = ref;
    }
  }, {
    key: '_renderNoTokenWarning',
    value: function _renderNoTokenWarning() {
      if (this._mapbox && !this._mapbox.accessToken) {
        var style = {
          position: 'absolute',
          left: 0,
          top: 0
        };
        return createElement('div', { key: 'warning', id: 'no-token-warning', style: style }, [createElement('h3', { key: 'header' }, 'No Mapbox access token found'), createElement('div', { key: 'text' }, 'For information on setting up your basemap, read'), createElement('a', { key: 'link', href: TOKEN_DOC_URL }, 'Note on Map Tokens')]);
      }

      return null;
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props,
          className = _props.className,
          width = _props.width,
          height = _props.height,
          style = _props.style,
          visible = _props.visible;

      var mapContainerStyle = Object.assign({}, style, { width: width, height: height, position: 'relative' });
      var mapStyle = Object.assign({}, style, {
        width: width,
        height: height,
        visibility: visible ? 'visible' : 'hidden'
      });
      var overlayContainerStyle = {
        position: 'absolute',
        left: 0,
        top: 0,
        width: width,
        height: height,
        overflow: 'hidden'
      };

      // Note: a static map still handles clicks and hover events
      return createElement('div', {
        key: 'map-container',
        style: mapContainerStyle,
        children: [createElement('div', {
          key: 'map-mapbox',
          ref: this._mapboxMapLoaded,
          style: mapStyle,
          className: className
        }), createElement('div', {
          key: 'map-overlays',
          // Same as interactive map's overlay container
          className: 'overlays',
          style: overlayContainerStyle,
          children: this.props.children
        }), this._renderNoTokenWarning()]
      });
    }
  }]);

  return StaticMap;
}(PureComponent);

export default StaticMap;


StaticMap.displayName = 'StaticMap';
StaticMap.propTypes = propTypes;
StaticMap.defaultProps = defaultProps;
StaticMap.childContextTypes = childContextTypes;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21wb25lbnRzL3N0YXRpYy1tYXAuanMiXSwibmFtZXMiOlsiUHVyZUNvbXBvbmVudCIsImNyZWF0ZUVsZW1lbnQiLCJQcm9wVHlwZXMiLCJhdXRvYmluZCIsImdldEludGVyYWN0aXZlTGF5ZXJJZHMiLCJzZXREaWZmU3R5bGUiLCJJbW11dGFibGUiLCJQZXJzcGVjdGl2ZU1lcmNhdG9yVmlld3BvcnQiLCJNYXBib3giLCJUT0tFTl9ET0NfVVJMIiwibm9vcCIsInByb3BUeXBlcyIsIk9iamVjdCIsImFzc2lnbiIsIm1hcFN0eWxlIiwib25lT2ZUeXBlIiwic3RyaW5nIiwiaW5zdGFuY2VPZiIsIk1hcCIsInByZXZlbnRTdHlsZURpZmZpbmciLCJib29sIiwidmlzaWJsZSIsImRlZmF1bHRQcm9wcyIsImNoaWxkQ29udGV4dFR5cGVzIiwidmlld3BvcnQiLCJTdGF0aWNNYXAiLCJzdXBwb3J0ZWQiLCJwcm9wcyIsIl9xdWVyeVBhcmFtcyIsImNvbXBvbmVudERpZE1vdW50IiwiY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyIsImNvbXBvbmVudERpZFVwZGF0ZSIsInN0YXRlIiwiX21hcGJveCIsImNvbnRhaW5lciIsIl9tYXBib3hNYXAiLCJzdHlsZSIsInVuZGVmaW5lZCIsIl9tYXAiLCJnZXRNYXAiLCJfdXBkYXRlTWFwU3R5bGUiLCJmb3JjZVVwZGF0ZSIsIm5ld1Byb3BzIiwic2V0UHJvcHMiLCJzZXRTdGF0ZSIsIndpZHRoIiwiaGVpZ2h0IiwiX3VwZGF0ZU1hcFNpemUiLCJmaW5hbGl6ZSIsImdlb21ldHJ5IiwicGFyYW1ldGVycyIsInF1ZXJ5UGFyYW1zIiwibGF5ZXJzIiwibGVuZ3RoIiwicXVlcnlSZW5kZXJlZEZlYXR1cmVzIiwiaW50ZXJhY3RpdmVMYXllcklkcyIsIm9sZFByb3BzIiwic2l6ZUNoYW5nZWQiLCJyZXNpemUiLCJvbGRNYXBTdHlsZSIsImlzTWFwIiwic2V0U3R5bGUiLCJ0b0pTIiwiX3VwZGF0ZVF1ZXJ5UGFyYW1zIiwicmVmIiwiYWNjZXNzVG9rZW4iLCJwb3NpdGlvbiIsImxlZnQiLCJ0b3AiLCJrZXkiLCJpZCIsImhyZWYiLCJjbGFzc05hbWUiLCJtYXBDb250YWluZXJTdHlsZSIsInZpc2liaWxpdHkiLCJvdmVybGF5Q29udGFpbmVyU3R5bGUiLCJvdmVyZmxvdyIsImNoaWxkcmVuIiwiX21hcGJveE1hcExvYWRlZCIsIl9yZW5kZXJOb1Rva2VuV2FybmluZyIsImRpc3BsYXlOYW1lIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUUEsYUFBUixFQUF1QkMsYUFBdkIsUUFBMkMsT0FBM0M7QUFDQSxPQUFPQyxTQUFQLE1BQXNCLFlBQXRCO0FBQ0EsT0FBT0MsUUFBUCxNQUFxQixtQkFBckI7O0FBRUEsU0FBUUMsc0JBQVIsRUFBZ0NDLFlBQWhDLFFBQW1ELHNCQUFuRDtBQUNBLE9BQU9DLFNBQVAsTUFBc0IsV0FBdEI7O0FBRUEsU0FBUUMsMkJBQVIsUUFBMEMsMkJBQTFDOztBQUVBLE9BQU9DLE1BQVAsTUFBbUIsa0JBQW5COztBQUVBO0FBQ0EsSUFBTUMsZ0JBQWdCLHlGQUF0QjtBQUNBOztBQUVBLFNBQVNDLElBQVQsR0FBZ0IsQ0FBRTs7QUFFbEIsSUFBTUMsWUFBWUMsT0FBT0MsTUFBUCxDQUFjLEVBQWQsRUFBa0JMLE9BQU9HLFNBQXpCLEVBQW9DO0FBQ3BEO0FBQ0FHLFlBQVVaLFVBQVVhLFNBQVYsQ0FBb0IsQ0FDNUJiLFVBQVVjLE1BRGtCLEVBRTVCZCxVQUFVZSxVQUFWLENBQXFCWCxVQUFVWSxHQUEvQixDQUY0QixDQUFwQixDQUYwQztBQU1wRDtBQUNBQyx1QkFBcUJqQixVQUFVa0IsSUFQcUI7QUFRcEQ7QUFDQUMsV0FBU25CLFVBQVVrQjtBQVRpQyxDQUFwQyxDQUFsQjs7QUFZQSxJQUFNRSxlQUFlVixPQUFPQyxNQUFQLENB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YyxLQUFkLEVBQXFCO0FBQ25Cb0UsZUFBSyxjQURjO0FBRW5CO0FBQ0FHLHFCQUFXLFVBSFE7QUFJbkJwQyxpQkFBT3VDLHFCQUpZO0FBS25CRSxvQkFBVSxLQUFLbEQsS0FBTCxDQUFXa0Q7QUFMRixTQUFyQixDQVBRLEVBY1IsS0FBS0UscUJBQUwsRUFkUTtBQUhTLE9BQXJCLENBREY7QUFzQkQ7Ozs7RUFqTG9DL0UsYTs7ZUFBbEJ5QixTOzs7QUFvTHJCQSxVQUFVdUQsV0FBVixHQUF3QixXQUF4QjtBQUNBdkQsVUFBVWQsU0FBVixHQUFzQkEsU0FBdEI7QUFDQWMsVUFBVUgsWUFBVixHQUF5QkEsWUFBekI7QUFDQUcsVUFBVUYsaUJBQVYsR0FBOEJBLGlCQUE5QiIsImZpbGUiOiJzdGF0aWMtbWFwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDE1IFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG5cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcblxuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cbmltcG9ydCB7UHVyZUNvbXBvbmVudCwgY3JlYXRlRWxlbWVudH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCBhdXRvYmluZCBmcm9tICcuLi91dGlscy9hdXRvYmluZCc7XG5cbmltcG9ydCB7Z2V0SW50ZXJhY3RpdmVMYXllcklkcywgc2V0RGlmZlN0eWxlfSBmcm9tICcuLi91dGlscy9zdHlsZS11dGlscyc7XG5pbXBvcnQgSW1tdXRhYmxlIGZyb20gJ2ltbXV0YWJsZSc7XG5cbmltcG9ydCB7UGVyc3BlY3RpdmVNZXJjYXRvclZpZXdwb3J0fSBmcm9tICd2aWV3cG9ydC1tZXJjYXRvci1wcm9qZWN0JztcblxuaW1wb3J0IE1hcGJveCBmcm9tICcuLi9tYXBib3gvbWFwYm94JztcblxuLyogZXNsaW50LWRpc2FibGUgbWF4LWxlbiAqL1xuY29uc3QgVE9LRU5fRE9DX1VSTCA9ICdodHRwczovL3ViZXIuZ2l0aHViLmlvL3JlYWN0LW1hcC1nbC8jL0RvY3VtZW50YXRpb24vZ2V0dGluZy1zdGFydGVkL2Fib3V0LW1hcGJveC10b2tlbnMnO1xuLyogZXNsaW50LWRpc2FibGUgbWF4LWxlbiAqL1xuXG5mdW5jdGlvbiBub29wKCkge31cblxuY29uc3QgcHJvcFR5cGVzID0gT2JqZWN0LmFzc2lnbih7fSwgTWFwYm94LnByb3BUeXBlcywge1xuICAvKiogVGhlIE1hcGJveCBzdHlsZS4gQSBzdHJpbmcgdXJsIG9yIGEgTWFwYm94R0wgc3R5bGUgSW1tdXRhYmxlLk1hcCBvYmplY3QuICovXG4gIG1hcFN0eWxlOiBQcm9wVHlwZXMub25lT2ZUeXBlKFtcbiAgICBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIFByb3BUeXBlcy5pbnN0YW5jZU9mKEltbXV0YWJsZS5NYXApXG4gIF0pLFxuICAvKiogVGhlcmUgYXJlIGtub3duIGlzc3VlcyB3aXRoIHN0eWxlIGRpZmZpbmcuIEFzIHN0b3BnYXAsIGFkZCBvcHRpb24gdG8gcHJldmVudCBzdHlsZSBkaWZmaW5nLiAqL1xuICBwcmV2ZW50U3R5bGVEaWZmaW5nOiBQcm9wVHlwZXMuYm9vbCxcbiAgLyoqIFdoZXRoZXIgdGhlIG1hcCBpcyB2aXNpYmxlICovXG4gIHZpc2libGU6IFByb3BUeXBlcy5ib29sXG59KTtcblxuY29uc3QgZGVmYXVsdFByb3BzID0gT2JqZWN0LmFzc2lnbih7fSwgTWFwYm94LmRlZmF1bHRQcm9wcywge1xuICBtYXBTdHlsZTogJ21hcGJveDovL3N0eWxlcy9tYXBib3gvbGlnaHQtdjgnLFxuICBwcmV2ZW50U3R5bGVEaWZmaW5nOiBmYWxzZSxcbiAgdmlzaWJsZTogdHJ1ZVxufSk7XG5cbmNvbnN0IGNoaWxkQ29udGV4dFR5cGVzID0ge1xuICB2aWV3cG9ydDogUHJvcFR5cGVzLmluc3RhbmNlT2YoUGVyc3BlY3RpdmVNZXJjYXRvclZpZXdwb3J0KVxufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3RhdGljTWFwIGV4dGVuZHMgUHVyZUNvbXBvbmVudCB7XG4gIHN0YXRpYyBzdXBwb3J0ZWQoKSB7XG4gICAgcmV0dXJuIE1hcGJveCAmJiBNYXBib3guc3VwcG9ydGVkKCk7XG4gIH1cblxuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLl9xdWVyeVBhcmFtcyA9IHt9O1xuICAgIGlmICghU3RhdGljTWFwLnN1cHBvcnRlZCgpKSB7XG4gICAgICB0aGlzLmNvbXBvbmVudERpZE1vdW50ID0gbm9vcDtcbiAgICAgIHRoaXMuY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyA9IG5vb3A7XG4gICAgICB0aGlzLmNvbXBvbmVudERpZFVwZGF0ZSA9IG5vb3A7XG4gICAgfVxuICAgIHRoaXMuc3RhdGUgPSB7fTtcbiAgICBhdXRvYmluZCh0aGlzKTtcbiAgfVxuXG4gIGdldENoaWxkQ29udGV4dCgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdmlld3BvcnQ6IG5ldyBQZXJzcGVjdGl2ZU1lcmNhdG9yVmlld3BvcnQodGhpcy5wcm9wcylcbiAgICB9O1xuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgdGhpcy5fbWFwYm94ID0gbmV3IE1hcGJveChPYmplY3QuYXNzaWduKHt9LCB0aGlzLnByb3BzLCB7XG4gICAgICBjb250YWluZXI6IHRoaXMuX21hcGJveE1hcCxcbiAgICAgIHN0eWxlOiB1bmRlZmluZWRcbiAgICB9KSk7XG4gICAgdGhpcy5fbWFwID0gdGhpcy5fbWFwYm94LmdldE1hcCgpO1xuICAgIHRoaXMuX3VwZGF0ZU1hcFN0eWxlKHt9LCB0aGlzLnByb3BzKTtcbiAgICB0aGlzLmZvcmNlVXBkYXRlKCk7IC8vIE1ha2Ugc3VyZSB3ZSByZXJlbmRlciBhZnRlciBtb3VudGluZ1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXdQcm9wcykge1xuICAgIHRoaXMuX21hcGJveC5zZXRQcm9wcyhuZXdQcm9wcyk7XG4gICAgdGhpcy5fdXBkYXRlTWFwU3R5bGUodGhpcy5wcm9wcywgbmV3UHJvcHMpO1xuXG4gICAgLy8gdGhpcy5fdXBkYXRlTWFwVmlld3BvcnQodGhpcy5wcm9wcywgbmV3UHJvcHMpO1xuXG4gICAgLy8gU2F2ZSB3aWR0aC9oZWlnaHQgc28gdGhhdCB3ZSBjYW4gY2hlY2sgdGhlbSBpbiBjb21wb25lbnREaWRVcGRhdGVcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHdpZHRoOiB0aGlzLnByb3BzLndpZHRoLFxuICAgICAgaGVpZ2h0OiB0aGlzLnByb3BzLmhlaWdodFxuICAgIH0pO1xuICB9XG5cbiAgY29tcG9uZW50RGlkVXBkYXRlKCkge1xuICAgIC8vIFNpbmNlIE1hcGJveCdzIG1hcC5yZXNpemUoKSByZWFkcyBzaXplIGZyb20gRE9NXG4gICAgLy8gd2UgbXVzdCB3YWl0IHRvIHJlYWQgc2l6ZSB1bnRpbCBhZnRlciByZW5kZXIgKGkuZS4gaGVyZSBpbiBcImRpZFVwZGF0ZVwiKVxuICAgIHRoaXMuX3VwZGF0ZU1hcFNpemUodGhpcy5zdGF0ZSwgdGhpcy5wcm9wcyk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICB0aGlzLl9tYXBib3guZmluYWxpemUoKTtcbiAgICB0aGlzLl9tYXBib3ggPSBudWxsO1xuICAgIHRoaXMuX21hcCA9IG51bGw7XG4gIH1cblxuICAvLyBFeHRlcm5hbCBhcHBzIGNhbiBhY2Nlc3MgbWFwIHRoaXMgd2F5XG4gIGdldE1hcCgpIHtcbiAgICByZXR1cm4gdGhpcy5fbWFwO1xuICB9XG5cbiAgLyoqIFVzZXMgTWFwYm94J3NcbiAgICAqIHF1ZXJ5UmVuZGVyZWRGZWF0dXJlcyBBUEkgdG8gZmluZCBmZWF0dXJlcyBhdCBwb2ludCBvciBpbiBhIGJvdW5kaW5nIGJveC5cbiAgICAqIGh0dHBzOi8vd3d3Lm1hcGJveC5jb20vbWFwYm94LWdsLWpzL2FwaS8jTWFwI3F1ZXJ5UmVuZGVyZWRGZWF0dXJlc1xuICAgICogVG8gcXVlcnkgb25seSBzb21lIG9mIHRoZSBsYXllcnMsIHNldCB0aGUgYGludGVyYWN0aXZlYCBwcm9wZXJ0eSBpbiB0aGVcbiAgICAqIGxheWVyIHN0eWxlIHRvIGB0cnVlYC5cbiAgICAqIEBwYXJhbSB7W051bWJlciwgTnVtYmVyXXxbW051bWJlciwgTnVtYmVyXSwgW051bWJlciwgTnVtYmVyXV19IGdlb21ldHJ5IC1cbiAgICAqICAgUG9pbnQgb3IgYW4gYXJyYXkgb2YgdHdvIHBvaW50cyBkZWZpbmluZyB0aGUgYm91bmRpbmcgYm94XG4gICAgKiBAcGFyYW0ge09iamVjdH0gcGFyYW1ldGVycyAtIHF1ZXJ5IG9wdGlvbnNcbiAgICAqL1xuICBxdWVyeVJlbmRlcmVkRmVhdHVyZXMoZ2VvbWV0cnksIHBhcmFtZXRlcnMpIHtcbiAgICBjb25zdCBxdWVyeVBhcmFtcyA9IHBhcmFtZXRlcnMgfHwgdGhpcy5fcXVlcnlQYXJhbXM7XG4gICAgaWYgKHF1ZXJ5UGFyYW1zLmxheWVycyAmJiBxdWVyeVBhcmFtcy5sYXllcnMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9tYXAucXVlcnlSZW5kZXJlZEZlYXR1cmVzKGdlb21ldHJ5LCBxdWVyeVBhcmFtcyk7XG4gIH1cblxuICAvLyBIb3ZlciBhbmQgY2xpY2sgb25seSBxdWVyeSBsYXllcnMgd2hvc2UgaW50ZXJhY3RpdmUgcHJvcGVydHkgaXMgdHJ1ZVxuICBfdXBkYXRlUXVlcnlQYXJhbXMobWFwU3R5bGUpIHtcbiAgICBjb25zdCBpbnRlcmFjdGl2ZUxheWVySWRzID0gZ2V0SW50ZXJhY3RpdmVMYXllcklkcyhtYXBTdHlsZSk7XG4gICAgdGhpcy5fcXVlcnlQYXJhbXMgPSB7bGF5ZXJzOiBpbnRlcmFjdGl2ZUxheWVySWRzfTtcbiAgfVxuXG4gIC8vIE5vdGU6IG5lZWRzIHRvIGJlIGNhbGxlZCBhZnRlciByZW5kZXIgKGUuZy4gaW4gY29tcG9uZW50RGlkVXBkYXRlKVxuICBfdXBkYXRlTWFwU2l6ZShvbGRQcm9wcywgbmV3UHJvcHMpIHtcbiAgICBjb25zdCBzaXplQ2hhbmdlZCA9XG4gICAgICBvbGRQcm9wcy53aWR0aCAhPT0gbmV3UHJvcHMud2lkdGggfHwgb2xkUHJvcHMuaGVpZ2h0ICE9PSBuZXdQcm9wcy5oZWlnaHQ7XG5cbiAgICBpZiAoc2l6ZUNoYW5nZWQpIHtcbiAgICAgIHRoaXMuX21hcC5yZXNpemUoKTtcbiAgICAgIC8vIHRoaXMuX2NhbGxPbkNoYW5nZVZpZXdwb3J0KHRoaXMuX21hcC50cmFuc2Zvcm0pO1xuICAgIH1cbiAgfVxuXG4gIF91cGRhdGVNYXBTdHlsZShvbGRQcm9wcywgbmV3UHJvcHMpIHtcbiAgICBjb25zdCBtYXBTdHlsZSA9IG5ld1Byb3BzLm1hcFN0eWxlO1xuICAgIGNvbnN0IG9sZE1hcFN0eWxlID0gb2xkUHJvcHMubWFwU3R5bGU7XG4gICAgaWYgKG1hcFN0eWxlICE9PSBvbGRNYXBTdHlsZSkge1xuICAgICAgaWYgKEltbXV0YWJsZS5NYXAuaXNNYXAobWFwU3R5bGUpKSB7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLnByZXZlbnRTdHlsZURpZmZpbmcpIHtcbiAgICAgICAgICB0aGlzLl9tYXAuc2V0U3R5bGUobWFwU3R5bGUudG9KUygpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzZXREaWZmU3R5bGUob2xkTWFwU3R5bGUsIG1hcFN0eWxlLCB0aGlzLl9tYXApO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9tYXAuc2V0U3R5bGUobWFwU3R5bGUpO1xuICAgICAgfVxuICAgICAgdGhpcy5fdXBkYXRlUXVlcnlQYXJhbXMobWFwU3R5bGUpO1xuICAgIH1cbiAgfVxuXG4gIF9tYXBib3hNYXBMb2FkZWQocmVmKSB7XG4gICAgdGhpcy5fbWFwYm94TWFwID0gcmVmO1xuICB9XG5cbiAgX3JlbmRlck5vVG9rZW5XYXJuaW5nKCkge1xuICAgIGlmICh0aGlzLl9tYXBib3ggJiYgIXRoaXMuX21hcGJveC5hY2Nlc3NUb2tlbikge1xuICAgICAgY29uc3Qgc3R5bGUgPSB7XG4gICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgICBsZWZ0OiAwLFxuICAgICAgICB0b3A6IDBcbiAgICAgIH07XG4gICAgICByZXR1cm4gKFxuICAgICAgICBjcmVhdGVFbGVtZW50KCdkaXYnLCB7a2V5OiAnd2FybmluZycsIGlkOiAnbm8tdG9rZW4td2FybmluZycsIHN0eWxlfSwgW1xuICAgICAgICAgIGNyZWF0ZUVsZW1lbnQoJ2gzJywge2tleTogJ2hlYWRlcid9LCAnTm8gTWFwYm94IGFjY2VzcyB0b2tlbiBmb3VuZCcpLFxuICAgICAgICAgIGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtrZXk6ICd0ZXh0J30sICdGb3IgaW5mb3JtYXRpb24gb24gc2V0dGluZyB1cCB5b3VyIGJhc2VtYXAsIHJlYWQnKSxcbiAgICAgICAgICBjcmVhdGVFbGVtZW50KCdhJywge2tleTogJ2xpbmsnLCBocmVmOiBUT0tFTl9ET0NfVVJMfSwgJ05vdGUgb24gTWFwIFRva2VucycpXG4gICAgICAgIF0pXG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHtjbGFzc05hbWUsIHdpZHRoLCBoZWlnaHQsIHN0eWxlLCB2aXNpYmxlfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3QgbWFwQ29udGFpbmVyU3R5bGUgPSBPYmplY3QuYXNzaWduKHt9LCBzdHlsZSwge3dpZHRoLCBoZWlnaHQsIHBvc2l0aW9uOiAncmVsYXRpdmUnfSk7XG4gICAgY29uc3QgbWFwU3R5bGUgPSBPYmplY3QuYXNzaWduKHt9LCBzdHlsZSwge1xuICAgICAgd2lkdGgsXG4gICAgICBoZWlnaHQsXG4gICAgICB2aXNpYmlsaXR5OiB2aXNpYmxlID8gJ3Zpc2libGUnIDogJ2hpZGRlbidcbiAgICB9KTtcbiAgICBjb25zdCBvdmVybGF5Q29udGFpbmVyU3R5bGUgPSB7XG4gICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgIGxlZnQ6IDAsXG4gICAgICB0b3A6IDAsXG4gICAgICB3aWR0aCxcbiAgICAgIGhlaWdodCxcbiAgICAgIG92ZXJmbG93OiAnaGlkZGVuJ1xuICAgIH07XG5cbiAgICAvLyBOb3RlOiBhIHN0YXRpYyBtYXAgc3RpbGwgaGFuZGxlcyBjbGlja3MgYW5kIGhvdmVyIGV2ZW50c1xuICAgIHJldHVybiAoXG4gICAgICBjcmVhdGVFbGVtZW50KCdkaXYnLCB7XG4gICAgICAgIGtleTogJ21hcC1jb250YWluZXInLFxuICAgICAgICBzdHlsZTogbWFwQ29udGFpbmVyU3R5bGUsXG4gICAgICAgIGNoaWxkcmVuOiBbXG4gICAgICAgICAgY3JlYXRlRWxlbWVudCgnZGl2Jywge1xuICAgICAgICAgICAga2V5OiAnbWFwLW1hcGJveCcsXG4gICAgICAgICAgICByZWY6IHRoaXMuX21hcGJveE1hcExvYWRlZCxcbiAgICAgICAgICAgIHN0eWxlOiBtYXBTdHlsZSxcbiAgICAgICAgICAgIGNsYXNzTmFtZVxuICAgICAgICAgIH0pLFxuICAgICAgICAgIGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgICAgICAgIGtleTogJ21hcC1vdmVybGF5cycsXG4gICAgICAgICAgICAvLyBTYW1lIGFzIGludGVyYWN0aXZlIG1hcCdzIG92ZXJsYXkgY29udGFpbmVyXG4gICAgICAgICAgICBjbGFzc05hbWU6ICdvdmVybGF5cycsXG4gICAgICAgICAgICBzdHlsZTogb3ZlcmxheUNvbnRhaW5lclN0eWxlLFxuICAgICAgICAgICAgY2hpbGRyZW46IHRoaXMucHJvcHMuY2hpbGRyZW5cbiAgICAgICAgICB9KSxcbiAgICAgICAgICB0aGlzLl9yZW5kZXJOb1Rva2VuV2FybmluZygpXG4gICAgICAgIF1cbiAgICAgIH0pXG4gICAgKTtcbiAgfVxufVxuXG5TdGF0aWNNYXAuZGlzcGxheU5hbWUgPSAnU3RhdGljTWFwJztcblN0YXRpY01hcC5wcm9wVHlwZXMgPSBwcm9wVHlwZXM7XG5TdGF0aWNNYXAuZGVmYXVsdFByb3BzID0gZGVmYXVsdFByb3BzO1xuU3RhdGljTWFwLmNoaWxkQ29udGV4dFR5cGVzID0gY2hpbGRDb250ZXh0VHlwZXM7XG4iXX0=