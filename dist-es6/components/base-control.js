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
import { Component } from 'react';
import PropTypes from 'prop-types';
import { PerspectiveMercatorViewport } from 'viewport-mercator-project';

var propTypes = {
  /** Event handling */
  captureScroll: PropTypes.bool,
  // Stop map pan & rotate
  captureDrag: PropTypes.bool,
  // Stop map click
  captureClick: PropTypes.bool,
  // Stop map double click
  captureDoubleClick: PropTypes.bool
};

var defaultProps = {
  captureScroll: false,
  captureDrag: true,
  captureClick: true,
  captureDoubleClick: true
};

var contextTypes = {
  viewport: PropTypes.instanceOf(PerspectiveMercatorViewport),
  isDragging: PropTypes.bool,
  eventManager: PropTypes.object
};

/*
 * PureComponent doesn't update when context changes.
 * The only way is to implement our own shouldComponentUpdate here. Considering
 * the parent component (StaticMap or InteractiveMap) is pure, and map re-render
 * is almost always triggered by a viewport change, we almost definitely need to
 * recalculate the marker's position when the parent re-renders.
 */

var BaseControl = function (_Component) {
  _inherits(BaseControl, _Component);

  function BaseControl(props) {
    _classCallCheck(this, BaseControl);

    var _this = _possibleConstructorReturn(this, (BaseControl.__proto__ || Object.getPrototypeOf(BaseControl)).call(this, props));

    _this._onContainerLoad = _this._onContainerLoad.bind(_this);
    _this._onEvent = _this._onEvent.bind(_this);
    return _this;
  }

  _createClass(BaseControl, [{
    key: '_onContainerLoad',
    value: function _onContainerLoad(ref) {
      var events = {
        wheel: this._onEvent,
        panstart: this._onEvent,
        click: this._onEvent,
        dblclick: this._onEvent
      };

      if (ref) {
        this.context.eventManager.on(events, ref);
      } else {
        this.context.eventManager.off(events);
      }
    }
  }, {
    key: '_onEvent',
    value: function _onEvent(event) {
      var stopPropagation = void 0;
      switch (event.type) {
        case 'wheel':
          stopPropagation = this.props.captureScroll;
          break;
        case 'panstart':
          stopPropagation = this.props.captureDrag;
          break;
        case 'click':
          stopPropagation = this.props.captureClick;
          break;
        case 'dblclick':
          stopPropagation = this.props.captureDoubleClick;
          break;
        default:
      }

      if (stopPropagation) {
        event.stopPropagation();
      }
    }
  }, {
    key: 'render',
    value: function render() {
      return null;
    }
  }]);

  return BaseControl;
}(Component);

export default BaseControl;


BaseControl.propTypes = propTypes;
BaseControl.defaultProps = defaultProps;
BaseControl.contextTypes = contextTypes;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21wb25lbnRzL2Jhc2UtY29udHJvbC5qcyJdLCJuYW1lcyI6WyJDb21wb25lbnQiLCJQcm9wVHlwZXMiLCJQZXJzcGVjdGl2ZU1lcmNhdG9yVmlld3BvcnQiLCJwcm9wVHlwZXMiLCJjYXB0dXJlU2Nyb2xsIiwiYm9vbCIsImNhcHR1cmVEcmFnIiwiY2FwdHVyZUNsaWNrIiwiY2FwdHVyZURvdWJsZUNsaWNrIiwiZGVmYXVsdFByb3BzIiwiY29udGV4dFR5cGVzIiwidmlld3BvcnQiLCJpbnN0YW5jZU9mIiwiaXNEcmFnZ2luZyIsImV2ZW50TWFuYWdlciIsIm9iamVjdCIsIkJhc2VDb250cm9sIiwicHJvcHMiLCJfb25Db250YWluZXJMb2FkIiwiYmluZCIsIl9vbkV2ZW50IiwicmVmIiwiZXZlbnRzIiwid2hlZWwiLCJwYW5zdGFydCIsImNsaWNrIiwiZGJsY2xpY2siLCJjb250ZXh0Iiwib24iLCJvZmYiLCJldmVudCIsInN0b3BQcm9wYWdhdGlvbiIsInR5cGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFRQSxTQUFSLFFBQXdCLE9BQXhCO0FBQ0EsT0FBT0MsU0FBUCxNQUFzQixZQUF0QjtBQUNBLFNBQVFDLDJCQUFSLFFBQTBDLDJCQUExQzs7QUFFQSxJQUFNQyxZQUFZO0FBQ2hCO0FBQ0FDLGlCQUFlSCxVQUFVSSxJQUZUO0FBR2hCO0FBQ0FDLGVBQWFMLFVBQVVJLElBSlA7QUFLaEI7QUFDQUUsZ0JBQWNOLFVBQVVJLElBTlI7QUFPaEI7QUFDQUcsc0JBQW9CUCxVQUFVSTtBQVJkLENBQWxCOztBQVdBLElBQU1JLGVBQWU7QUFDbkJMLGlCQUFlLEtBREk7QUFFbkJFLGVBQWEsSUFGTTtBQUduQkMsZ0JBQWMsSUFISztBQUluQkMsc0JBQW9CO0FBSkQsQ0FBckI7O0FBT0EsSUFBTUUsZUFBZTtBQUNuQkMsWUFBVVYsVUFBVVcsVUFBVixDQUFxQlYsMkJBQXJCLENBRFM7QUFFbkJXLGNBQVlaLFVBQVVJLElBRkg7QUFHbkJTLGdCQUFjYixVQUFVYztBQUhMLENBQXJCOztBQU1BOzs7Ozs7OztJQU9xQkMsVzs7O0FBRW5CLHVCQUFZQyxLQUFaLEVBQW1CO0FBQUE7O0FBQUEsMEhBQ1hBLEtBRFc7O0FBR2pCLFVBQUtDLGdCQUFMLEdBQXdCLE1BQUtBLGdCQUFMLENBQXNCQyxJQUF0QixPQUF4QjtBQUNBLFVBQUtDLFFBQUwsR0FBZ0IsTUFBS0EsUUFBTCxDQUFjRCxJQUFkLE9BQWhCO0FBSmlCO0FBS2xCOzs7O3FDQUVnQkUsRyxFQUFLO0FBQ3BCLFVBQU1DLFNBQVM7QUFDYkMsZUFBTyxLQUFLSCxRQURDO0FBRWJJLGtCQUFVLEtBQUtKLFFBRkY7QUFHYkssZUFBTyxLQUFLTCxRQUhDO0FBSWJNLGtCQUFVLEtBQUtOO0FBSkYsT0FBZjs7QUFPQSxVQUFJQyxHQUFKLEVBQVM7QUFDUCxhQUFLTSxPQUFMLENBQWFiLFlBQWIsQ0FBMEJjLEVBQTFCLENBQTZCTixNQUE3QixFQUFxQ0QsR0FBckM7QUFDRCxPQUZELE1BRU87QUFDTCxhQUFLTSxPQUFMLENBQWFiLFlBQWIsQ0FBMEJlLEdBQTFCLENBQThCUCxNQUE5QjtBQUNEO0FBQ0Y7Ozs2QkFFUVEsSyxFQUFPO0FBQ2QsVUFBSUMsd0JBQUo7QUFDQSxjQUFRRCxNQUFNRSxJQUFkO0FBQ0EsYUFBSyxPQUFMO0FBQ0VELDRCQUFrQixLQUFLZCxLQUFMLENBQVdiLGFBQTdCO0FBQ0E7QUFDRixhQUFLLFVBQUw7QUFDRTJCLDRCQUFrQixLQUFLZCxLQUFMLENBQVdYLFdBQTdCO0FBQ0E7QUFDRixhQUFLLE9BQUw7QUFDRXlCLDRCQUFrQixLQUFLZCxLQUFMLENBQVdWLFlBQTdCO0FBQ0E7QUFDRixhQUFLLFVBQUw7QUFDRXdCLDRCQUFrQixLQUFLZCxLQUFMLENBQVdULGtCQUE3QjtBQUNBO0FBQ0Y7QUFiQTs7QUFnQkEsVUFBSXVCLGVBQUosRUFBcUI7QUFDbkJELGNBQU1DLGVBQU47QUFDRDtBQUNGOzs7NkJBRVE7QUFDUCxhQUFPLElBQVA7QUFDRDs7OztFQWpEc0MvQixTOztlQUFwQmdCLFc7OztBQXFEckJBLFlBQVliLFNBQVosR0FBd0JBLFNBQXhCO0FBQ0FhLFlBQVlQLFlBQVosR0FBMkJBLFlBQTNCO0FBQ0FPLFlBQVlOLFlBQVosR0FBMkJBLFlBQTNCIiwiZmlsZSI6ImJhc2UtY29udHJvbC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAxNSBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG5cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cblxuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5pbXBvcnQge0NvbXBvbmVudH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCB7UGVyc3BlY3RpdmVNZXJjYXRvclZpZXdwb3J0fSBmcm9tICd2aWV3cG9ydC1tZXJjYXRvci1wcm9qZWN0JztcblxuY29uc3QgcHJvcFR5cGVzID0ge1xuICAvKiogRXZlbnQgaGFuZGxpbmcgKi9cbiAgY2FwdHVyZVNjcm9sbDogUHJvcFR5cGVzLmJvb2wsXG4gIC8vIFN0b3AgbWFwIHBhbiAmIHJvdGF0ZVxuICBjYXB0dXJlRHJhZzogUHJvcFR5cGVzLmJvb2wsXG4gIC8vIFN0b3AgbWFwIGNsaWNrXG4gIGNhcHR1cmVDbGljazogUHJvcFR5cGVzLmJvb2wsXG4gIC8vIFN0b3AgbWFwIGRvdWJsZSBjbGlja1xuICBjYXB0dXJlRG91YmxlQ2xpY2s6IFByb3BUeXBlcy5ib29sXG59O1xuXG5jb25zdCBkZWZhdWx0UHJvcHMgPSB7XG4gIGNhcHR1cmVTY3JvbGw6IGZhbHNlLFxuICBjYXB0dXJlRHJhZzogdHJ1ZSxcbiAgY2FwdHVyZUNsaWNrOiB0cnVlLFxuICBjYXB0dXJlRG91YmxlQ2xpY2s6IHRydWVcbn07XG5cbmNvbnN0IGNvbnRleHRUeXBlcyA9IHtcbiAgdmlld3BvcnQ6IFByb3BUeXBlcy5pbnN0YW5jZU9mKFBlcnNwZWN0aXZlTWVyY2F0b3JWaWV3cG9ydCksXG4gIGlzRHJhZ2dpbmc6IFByb3BUeXBlcy5ib29sLFxuICBldmVudE1hbmFnZXI6IFByb3BUeXBlcy5vYmplY3Rcbn07XG5cbi8qXG4gKiBQdXJlQ29tcG9uZW50IGRvZXNuJ3QgdXBkYXRlIHdoZW4gY29udGV4dCBjaGFuZ2VzLlxuICogVGhlIG9ubHkgd2F5IGlzIHRvIGltcGxlbWVudCBvdXIgb3duIHNob3VsZENvbXBvbmVudFVwZGF0ZSBoZXJlLiBDb25zaWRlcmluZ1xuICogdGhlIHBhcmVudCBjb21wb25lbnQgKFN0YXRpY01hcCBvciBJbnRlcmFjdGl2ZU1hcCkgaXMgcHVyZSwgYW5kIG1hcCByZS1yZW5kZXJcbiAqIGlzIGFsbW9zdCBhbHdheXMgdHJpZ2dlcmVkIGJ5IGEgdmlld3BvcnQgY2hhbmdlLCB3ZSBhbG1vc3QgZGVmaW5pdGVseSBuZWVkIHRvXG4gKiByZWNhbGN1bGF0ZSB0aGUgbWFya2VyJ3MgcG9zaXRpb24gd2hlbiB0aGUgcGFyZW50IHJlLXJlbmRlcnMuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJhc2VDb250cm9sIGV4dGVuZHMgQ29tcG9uZW50IHtcblxuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcblxuICAgIHRoaXMuX29uQ29udGFpbmVyTG9hZCA9IHRoaXMuX29uQ29udGFpbmVyTG9hZC5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX29uRXZlbnQgPSB0aGlzLl9vbkV2ZW50LmJpbmQodGhpcyk7XG4gIH1cblxuICBfb25Db250YWluZXJMb2FkKHJlZikge1xuICAgIGNvbnN0IGV2ZW50cyA9IHtcbiAgICAgIHdoZWVsOiB0aGlzLl9vbkV2ZW50LFxuICAgICAgcGFuc3RhcnQ6IHRoaXMuX29uRXZlbnQsXG4gICAgICBjbGljazogdGhpcy5fb25FdmVudCxcbiAgICAgIGRibGNsaWNrOiB0aGlzLl9vbkV2ZW50XG4gICAgfTtcblxuICAgIGlmIChyZWYpIHtcbiAgICAgIHRoaXMuY29udGV4dC5ldmVudE1hbmFnZXIub24oZXZlbnRzLCByZWYpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmNvbnRleHQuZXZlbnRNYW5hZ2VyLm9mZihldmVudHMpO1xuICAgIH1cbiAgfVxuXG4gIF9vbkV2ZW50KGV2ZW50KSB7XG4gICAgbGV0IHN0b3BQcm9wYWdhdGlvbjtcbiAgICBzd2l0Y2ggKGV2ZW50LnR5cGUpIHtcbiAgICBjYXNlICd3aGVlbCc6XG4gICAgICBzdG9wUHJvcGFnYXRpb24gPSB0aGlzLnByb3BzLmNhcHR1cmVTY3JvbGw7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdwYW5zdGFydCc6XG4gICAgICBzdG9wUHJvcGFnYXRpb24gPSB0aGlzLnByb3BzLmNhcHR1cmVEcmFnO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnY2xpY2snOlxuICAgICAgc3RvcFByb3BhZ2F0aW9uID0gdGhpcy5wcm9wcy5jYXB0dXJlQ2xpY2s7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdkYmxjbGljayc6XG4gICAgICBzdG9wUHJvcGFnYXRpb24gPSB0aGlzLnByb3BzLmNhcHR1cmVEb3VibGVDbGljaztcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgfVxuXG4gICAgaWYgKHN0b3BQcm9wYWdhdGlvbikge1xuICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgfVxuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbn1cblxuQmFzZUNvbnRyb2wucHJvcFR5cGVzID0gcHJvcFR5cGVzO1xuQmFzZUNvbnRyb2wuZGVmYXVsdFByb3BzID0gZGVmYXVsdFByb3BzO1xuQmFzZUNvbnRyb2wuY29udGV4dFR5cGVzID0gY29udGV4dFR5cGVzO1xuIl19