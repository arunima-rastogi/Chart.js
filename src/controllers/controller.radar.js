'use strict';

var DatasetController = require('../core/core.datasetController');
var defaults = require('../core/core.defaults');
var elements = require('../elements/index');
var helpers = require('../helpers/index');

var valueOrDefault = helpers.valueOrDefault;

defaults._set('radar', {
	spanGaps: false,
	scales: {
		r: {
			type: 'radialLinear',
		}
	},
	elements: {
		line: {
			tension: 0 // no bezier in radar
		}
	}
});

module.exports = DatasetController.extend({
	datasetElementType: elements.Line,

	dataElementType: elements.Point,

	/**
	 * @private
	 */
	_datasetElementOptions: [
		'backgroundColor',
		'borderWidth',
		'borderColor',
		'borderCapStyle',
		'borderDash',
		'borderDashOffset',
		'borderJoinStyle',
		'fill'
	],

	/**
	 * @private
	 */
	_dataElementOptions: {
		backgroundColor: 'pointBackgroundColor',
		borderColor: 'pointBorderColor',
		borderWidth: 'pointBorderWidth',
		hitRadius: 'pointHitRadius',
		hoverBackgroundColor: 'pointHoverBackgroundColor',
		hoverBorderColor: 'pointHoverBorderColor',
		hoverBorderWidth: 'pointHoverBorderWidth',
		hoverRadius: 'pointHoverRadius',
		pointStyle: 'pointStyle',
		radius: 'pointRadius',
		rotation: 'pointRotation'
	},

	/**
	 * @private
	 */
	_getIndexScaleId: function() {
		return this._cachedMeta.rAxisID;
	},

	/**
	 * @private
	 */
	_getValueScaleId: function() {
		return this._cachedMeta.rAxisID;
	},

	/**
	 * @private
	 */
	_getLabelAndValue: function(index) {
		const me = this;
		const vScale = me._cachedMeta.vScale;
		const parsed = me._getParsed(index);

		return {
			label: vScale._getLabels()[index],
			value: '' + vScale.getLabelForValue(parsed[vScale.id])
		};
	},

	update: function(mode) {
		const me = this;
		const meta = me._cachedMeta;
		const line = meta.dataset;
		const points = meta.data || [];

		const properties = {
			_children: points,
			_loop: true,
			options: me._resolveDatasetElementOptions()
		};

		me._updateElement(line, undefined, properties, mode);

		// Update Points
		me.updateElements(points, 0, mode);

		line.updateControlPoints(me.chart.chartArea);
	},

	updateElements: function(points, start, mode) {
		const me = this;
		const dataset = me.getDataset();
		const scale = me.chart.scales.r;
		const reset = mode === 'reset';
		let i;

		for (i = 0; i < points.length; i++) {
			const point = points[i];
			const index = start + i;
			const options = me._resolveDataElementOptions(index);
			const pointPosition = scale.getPointPositionForValue(index, dataset.data[index]);

			const x = reset ? scale.xCenter : pointPosition.x;
			const y = reset ? scale.yCenter : pointPosition.y;

			const properties = {
				x: x,
				y: y,
				skip: isNaN(x) || isNaN(y),
				options,
			};

			me._updateElement(point, index, properties, mode);
		}
	},

	/**
	 * @private
	 */
	_resolveDatasetElementOptions: function() {
		const me = this;
		const config = me._config;
		const options = me.chart.options;
		const values = DatasetController.prototype._resolveDatasetElementOptions.apply(me, arguments);

		values.spanGaps = valueOrDefault(config.spanGaps, options.spanGaps);
		values.tension = valueOrDefault(config.lineTension, options.elements.line.tension);

		return values;
	}
});
