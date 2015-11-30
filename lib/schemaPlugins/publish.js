var _ = require('underscore');
var keystone = require('../../');
var Types = require('../fieldTypes');

/**
 * List publish option
 *
 * When enabled, it can be published, 
 * as well as the user who published it.
 */

module.exports = function publish() {
	
	var list = this;
	var options = list.get('publish');
	var userModel = keystone.get('user model');
	var defaultOptions = {
			dev: false,
			devBy: false,
			staging: false,
			stagingBy: false,
			prod: false,
			prodBy: false 
		};
	var fields = {};

	// ensure track is a boolean or an object
	if (!_.isBoolean(options) && !_.isObject(options) ) {
		throw new Error('Invalid List "publish" option for ' + list.key + '\n' +
			'"publish" must be a boolean or an object."');				
	}

	if (_.isBoolean(options)) {
		// shorthand: { publish: true } sets all publish fields to true
		if (options) {
			options = { 
				dev: true,
				devBy: true,
				staging: true,
				stagingBy: true,
				prod: true,
				prodBy: true 
			};
		} else {
			// otherwise user doesn't want publish
			return;
		}
	}

	console.log("publish options?", JSON.stringify(options));

	// if all publish fields are set to false, then user doesn't want to publish anything
	if (!options.dev && !options.devBy && !options.staging && !options.stagingBy 
		  && !options.prod && !options.prodBy) {
		return;
	}

	// merge user options with default options
	options = _.extend({}, defaultOptions, options);

	// validate option fields
	_.each(options, function(value, key) {
		
		var fieldName;
		

		// make sure it's a valid publish option field
		if (_.has(defaultOptions, key)) {
			
			// make sure the option field value is either a boolean
			if (!_.isBoolean(value)) {
				throw new Error('Invalid List "publish" option for ' + list.key + '\n' +
					'"' + key + '" must be a boolean.\n\n');
			}

			if (value) {
				// determine 
				fieldName = value === true ? key : value;
				options[key] = fieldName;
				list.map(key, fieldName);

				switch(key) {
					case 'dev':
					case 'staging':
					case 'prod':
						fields[fieldName] = { type: Date, hidden: true, index: true };
					break;

					case 'devBy':
					case 'stagingBy':
					case 'prodBy':
						fields[fieldName] = { type: Types.Relationship, ref: userModel, hidden: true, index: true };
					break;
				}
			}
		} else {
			throw new Error('Invalid List "publish" option for ' + list.key + '\n' +
				'valid field options are "dev", "devBy", "staging", "stagingBy", "prod", a "prodBy".\n\n');				
		}
	});

	// add publish fields to schema
	//var schemaPrefix = "publish_to_"
	//list.add(fields, schemaPrefix);
	list.add(fields);
	
	list.publishing = options;


	var publishRequest = function(publishToEnv, item, callback){
		//callback(null);
		item.schema.statics.publish(publishToEnv, item, function(error, result){
			console.log("callback from pubishing");
			callback(error, result);
		});
	}

	// add the post-save schema plugin
	list.schema.post('save', function (doc) {
		console.log("=============pubishing post-save hook================");
		
		var now = new Date();
		var user = this._req_user;
		console.log("schema plugin list, publishTo?===========>", JSON.stringify(doc.publishTo));
		//console.log("this._req_user.id", this._req_user.id);
		console.log("options.devBy?", options.devBy);
		//console.log("this.options.devBy?", this.options.devBy);

		var _this = this;

		var publishTo = doc.publishTo; 

		//throw {name: "PublishError", message: "Error on publishing to " + publishTo};

		if(publishTo && publishTo.trim().length > 0) {
			publishRequest(publishTo, doc, function(error, result){
				if(error){
					console.log("error on publishing to " + publishTo)

					//throw {name: "PublishError", message: "Error on publishing to " + publishTo};
					//_this.req.flash("error", "Error on publishing to " + publishTo.upperCase());
				}
				else {
					if(publishTo == "dev"){
						doc.set(options.dev, now)

						if (options.devBy && user) {
							console.log("inside devBy check")
							doc.set(options.devBy, user._id);
						}
						else {
							console.log("no devBy")
						}
					}
					else if(publishTo == "staging"){
						doc.set(options.staging, now)

						if (options.stagingBy && user) {
							doc.set(options.stagingBy, user._id);
						}
					}
					else if(publishTo == "prod"){
						doc.set(options.prod, now)

						if (options.prodBy && user) {
							doc.set(options.prodBy, user._id);
						}
					}

					//_this.req.flash("success", "Your changes have been saved and published to " + publishTo.upperCase());

					doc.publishTo = null; // make sure the post-save hook does not call it self again
					doc.save();
				}
			});			
		}
		
	});

};
