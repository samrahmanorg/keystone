var crypto = require('crypto');
var FieldType = require('../Type');
//var TextType = require('../text/TextType');
var util = require('util');
var utils = require('keystone-utils');
var _ = require('underscore');
var GooglePlaces = require('googleplaces');
var gp = new GooglePlaces('AIzaSyDGHhJVeAWd61_kCqx9t3UixM7U309e-S0','json');
var debug = require('debug')('google');

/**
 * Email FieldType Constructor
 * @extends Field
 * @api public
 */
function ddgoogleplace(list, path, options) {
	this._nativeType = String;
	if (!options.defaults) {
		options.defaults = {};
	}
	ddgoogleplace.super_.call(this, list, path, options);
}
util.inherits(ddgoogleplace, FieldType);


ddgoogleplace.prototype.addToSchema = function() {

	var field = this,
		schema = this.list.schema,
		options = this.options;
		
	var paths = this.paths = {
		item_title: this._path.append('.item_title'),
		item_is_src: this._path.append('.item_is_src'),
		item_location_long: this._path.append('.item_location_long'),
		item_location_short: this._path.append('.item_location_short'),
		item_location_street_address: this._path.append('.item_location_street_address'),
		item_location_country_name: this._path.append('.item_location_country_name'),
		item_location_city_name: this._path.append('.item_location_city_name'),
		item_location_state_name: this._path.append('.item_location_state_name'),
		item_location_postal_code: this._path.append('.item_location_postal_code'),
		item_coordinates: this._path.append('.item_coordinates'),
		item_phone_number: this._path.append('.item_phone_number'),
		item_international_phone_number: this._path.append('.item_international_phone_number'),
		item_source_reference_id: this._path.append('.item_source_reference_id'),
		item_opening_hours_text: this._path.append('.item_opening_hours_text'),
		item_opening_hours: this._path.append('.item_opening_hours'),
		item_price_level: this._path.append('.item_price_level'),
		item_source_reference_rating: this._path.append('.item_source_reference_rating'),
		item_is_from_source: this._path.append('.item_is_from_source'),
		item_source_types: this._path.append('.item_source_types'),
		item_utc_offset: this._path.append('.item_utc_offset'),
		item_website: this._path.append('.item_website'),
		item_image1: this._path.append('.item_image1'),
		item_event_start_date: this._path.append('.item_event_start_date'),
		item_event_end_date: this._path.append('.item_event_end_date'),
		item_date_created: this._path.append('.item_date_created'),
		item_date_modified: this._path.append('.item_date_modified'),
		item_tastes: this._path.append('.item_tastes'),
		item_categories: this._path.append('.item_categories'),
		serialised: this._path.append('.serialised')
	};
	
	var getFieldDef = function(type, key) {
		var def = { type: type };
		if (options.defaults[key]) {
			def.default = options.defaults[key];
		}
		
		if ( key == 'item_source_reference_id') {
			//def['unique'] = true;
		}

		return def;
	};

	schema.nested[this.path] = true;
	schema.add({

		item_title: getFieldDef(String, 'item_title'),
		item_is_src: getFieldDef(String, 'item_is_src'),
		item_location_long: getFieldDef(String, 'item_location_long'),
		item_location_short: getFieldDef(String, 'item_location_short'),
		item_location_street_address: getFieldDef(String, 'item_location_street_address'),
		item_location_country_name: getFieldDef(String, 'item_location_country_name'),
		item_location_city_name: getFieldDef(String, 'item_location_city_name'),
		item_location_state_name: getFieldDef(String, 'item_location_state_name'),
		item_location_postal_code: getFieldDef(String, 'item_location_postal_code'),
		item_coordinates: getFieldDef(String, 'item_coordinates'),
		item_phone_number: getFieldDef(String, 'item_phone_number'),
		item_international_phone_number: getFieldDef(String, 'item_international_phone_number'),
		item_source_reference_id: getFieldDef(String, 'item_source_reference_id'),
		item_opening_hours_text: getFieldDef(String, 'item_opening_hours_text'),
		item_opening_hours: getFieldDef(String, 'item_opening_hours'),
		item_price_level: getFieldDef(String, 'item_price_level'),
		item_source_reference_rating: getFieldDef(String, 'item_source_reference_rating'),
		item_is_from_source: getFieldDef(String, 'item_is_from_source'),
		item_source_types: getFieldDef(String, 'item_source_types'),
		item_utc_offset: getFieldDef(String, 'item_utc_offset'),
		item_website: getFieldDef(String, 'item_website'),
		item_image1: getFieldDef(String, 'item_image1'),
		item_event_start_date: getFieldDef(Number, 'item_event_start_date'),
		item_event_end_date: getFieldDef(Number, 'item_event_end_date'),
		item_date_created: getFieldDef(Number, 'item_date_created'),
		item_date_modified: getFieldDef(Number, 'item_date_modified'),
		item_tastes: getFieldDef([String], 'item_tastes'),
		item_categories: getFieldDef([String], 'item_categories')

	}, this.path + '.');

	schema.virtual(paths.serialised).get(function() {
		return _.compact([
			this.get(paths.item_title),
			this.get(paths.item_location_short)
		]).join(', ');
	});

	// pre-save hook to fix blank geo fields
	// see http://stackoverflow.com/questions/16388836/does-applying-a-2dsphere-index-on-a-mongoose-schema-force-the-location-field-to
	// schema.pre('save', function(next) {
	// 	var obj = field._path.get(this);
	// 	if (Array.isArray(obj.geo) && (obj.geo.length !== 2 || (obj.geo[0] === null && obj.geo[1] === null))) {
	// 		obj.geo = undefined;
	// 	}
	// 	next();
	// });

	this.bindUnderscoreMethods();

};

ddgoogleplace.prototype.checkForDuplicateEntry = function(itemSourceReferenceID, callback) {

	this.list.model.findOne({ 'google_place.item_source_reference_id':itemSourceReferenceID},
		function(err,res){
			if(err) {
				console.log('error querying mongo for existing item');
				callback(err);
			} else if(res && res._doc.google_place.item_source_reference_id == itemSourceReferenceID) {
				callback(null,true);
			} else {
				//response was empty, it's a new source item
				callback(null,false);
			}
			
		})
}


/**
 * Returns a callback that handles a standard form submission for the field
 *
 * Handles:
 * - `field.paths.improve` in `req.body` - improves data via `.googleLookup()`
 * - `field.paths.overwrite` in `req.body` - in conjunction with `improve`, overwrites existing data
 *
 * @api public
 */

ddgoogleplace.prototype.getRequestHandler = function(item, req, paths, callback) {

	var field = this;

	if (utils.isFunction(paths)) {
		callback = paths;
		paths = field.paths;
	} else if (!paths) {
		paths = field.paths;
	}
	
	var itemSourceReferenceID = req.body.selectedPlace;

	callback = callback || function() {};

	return function() {

		field.checkForDuplicateEntry(itemSourceReferenceID,function(err,fieldExists) {
			if(err) {
				callback(err);
			} else {
				//its ok to create a new item
				callback(null,fieldExists);
			}
		})

	};

};



/**
 * Immediately handles a standard form submission for the field (see `getRequestHandler()`)
 *
 * @api public
 */

ddgoogleplace.prototype.handleRequest = function(item, req, paths, callback) {
	this.getRequestHandler(item, req, paths, callback)();
};






ddgoogleplace.prototype.updateItem = function(item, data) {
	if (!_.isObject(data)) return;
	
	var self = this;
	debugger;
	var place_id = data.selectedPlace;
	var item_title = data.itemTitle;
	var item_location_short = data.itemLocationShort;

	item.set(self.paths['item_source_reference_id'],place_id);
	item.set(self.paths['item_title'],item_title);
	item.set(self.paths['item_location_short'],item_location_short)

	/*
 	gp.placeDetailsRequest({'placeid':place_id}, function(error, response) {
        if (error) throw error;
        
        debug(response);
        var result = response.result;
        
        var validFields = {
			'item_title':result.name,
			'item_is_src' : true,
			'item_location_long': '',
			'item_location_short':result.formatted_address,
			'item_location_street_address':'',
			'item_location_country_name':'',
			'item_location_city_name':'',
			'item_location_state_name':'',
			'item_location_postal_code':'',
			'item_coordinates':result.geometry,
			'item_phone_number':result.formatted_phone_number,
			'item_international_phone_number':result.international_phone_number,
			'item_source_reference_id' : result.place_id,
			'item_opening_hours_text':result.opening_hours.weekday_text,
			'item_opening_hours':result.opening_hours.periods,
			'item_price_level': (result.price_level ? result.price_level : -1),
			'item_source_reference_rating':result.rating,
			'item_is_from_source':'google',
			'item_source_types':result.types,
			'item_utc_offset':result.utc_offset,
			'item_website':result.website,
			'item_image1':null,
			'item_event_start_date':null,
			'item_event_end_date':null,
			'item_date_created': (new Date().getTime()),
			'item_date_modified':(new Date().getTime()),
			'item_tastes':null,
			'item_categories':null
		}
		
		for(var prop in validFields) {
			if(validFields.hasOwnProperty(prop) && validFields[prop] != null && typeof validFields[prop] != 'undefined') {
				var itemPathToSet = self.path + "." + prop;
				item.set(itemPathToSet,validFields[prop]);		
			}
		}

    });*/


	/**
		- check if item exists in database already
		   - if so do not create new object, simply bring user to new reference - not sure if we can put that logic here though
		- populate entire obejct in source item?

	**/

	

	

}


/* Export Field Type */
exports = module.exports = ddgoogleplace;
