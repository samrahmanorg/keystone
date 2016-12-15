var moment = require('moment');
var DateType = require('../date/DateType');
var FieldType = require('../Type');
var util = require('util');

// ISO_8601 is needed for the automatically created createdAt and updatedAt fields
var parseFormats = ['YYYY-MM-DD', 'YYYY-MM-DD h:m:s a', 'YYYY-MM-DD h:m a', 'YYYY-MM-DD H:m:s', 'YYYY-MM-DD H:m', 'YYYY-MM-DD h:mm:s a Z', moment.ISO_8601];
/**
 * DateTime FieldType Constructor
 * @extends Field
 * @api public
 */
function datetime(list, path, options) {
	this._nativeType = Date;
	this._underscoreMethods = ['format', 'moment', 'parse'];
	this._fixedSize = 'large';
	this._properties = ['formatString', 'isUTC'];
	this.typeDescription = 'date and time';
	this.parseFormatString = options.parseFormat || parseFormats;
	this.formatString = (options.format === false) ? false : (options.format || 'YYYY-MM-DD h:m:s a');
	this.isUTC = options.utc || false;
	if (this.formatString && 'string' !== typeof this.formatString) {
		throw new Error('FieldType.DateTime: options.format must be a string.');
	}
	datetime.super_.call(this, list, path, options);
	this.paths = {
		date: this._path.append('_date'),
		time: this._path.append('_time'),
		tzOffset: this._path.append('_tzOffset'),
	};
}
util.inherits(datetime, FieldType);

/* Inherit from DateType prototype */
datetime.prototype.addFilterToQuery = DateType.prototype.addFilterToQuery;
datetime.prototype.format = DateType.prototype.format;
datetime.prototype.moment = DateType.prototype.moment;
datetime.prototype.parse = DateType.prototype.parse;

/**
 * Get the value from a data object; may be simple or a pair of fields
 */
datetime.prototype.getInputFromData = function (data) {
	//console.log("datetime.prototype.getInputFromData, data=>", data);

	// var dateValue = this.getValueFromData(data, '_date');
	// var timeValue = this.getValueFromData(data, '_time');
	// var tzOffsetValue = this.getValueFromData(data, '_tzOffset');
	var dateValue = data[this.paths.date];
	var timeValue = data[this.paths.time];
	var tzOffsetValue = data[this.paths.tzOffset];

	//console.log("dateValue=>", dateValue);
	//console.log("timeValue=>", timeValue);
	//console.log("tzOffsetValue=>",tzOffsetValue)
	if (dateValue && timeValue) {
		var ret = dateValue + ' ' + timeValue.trim();
		if (typeof tzOffsetValue !== 'undefined') {
			ret += ' ' + tzOffsetValue;
		}
		//console.log("getInputFromData, ret=>", ret);
		return ret;
	}
	else {
		return data[this.path];
	}

	//return this.getValueFromData(data);
};

/**
 * Validates the input we get to be a valid date,
 * undefined, null or an empty string
 */
// datetime.prototype.validateInput = function (data, callback) {
// 	var value = this.getInputFromData(data);
// 	// If the value is null, undefined or an empty string
// 	// bail early since updateItem sanitizes that just fine
// 	var result = true;
// 	if (value) {
// 		result = this.parse(value, this.parseFormatString, true).isValid();
// 	}
// };

/**
 * Checks that a valid date has been provided in a data object
 * An empty value clears the stored value and is considered valid
 */
datetime.prototype.validateInput = function(data, required, item) {
	if (!(this.path in data && !(this.paths.date in data && this.paths.time in data)) && item && item.get(this.path)) return true;
	var newValue = moment(this.getInputFromData(data), parseFormats);
	if (required && (!newValue || !newValue.isValid())) {
		return false;
	} else if (this.getInputFromData(data) && newValue && !newValue.isValid()) {
		return false;
	} else {
		return true;
	}
};

/**
 * Updates the value for this field in the item from a data object
 */
datetime.prototype.updateItem = function(item, data) {
	if (!(this.path in data || (this.paths.date in data && this.paths.time in data))) {
		return;
	}
	var m = this.isUTC ? moment.utc : moment;
	var newValue = m(this.getInputFromData(data), parseFormats);
	//console.log("newValue=>", newValue);
	//console.log("newValue.isValid()=>?", newValue.isValid());

	if (newValue.isValid()) {
		if (!item.get(this.path) || !newValue.isSame(item.get(this.path))) {
			item.set(this.path, newValue.toDate());
		}
	} else if (item.get(this.path)) {
		item.set(this.path, null);
	}
};

/* Export Field Type */
exports = module.exports = datetime;
