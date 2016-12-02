var _ = require('underscore');
var keystone = require('../../');
var Types = require('../fieldTypes');

/**
 * List publish Connect option
 *
 * When enabled, it can be published, 
 * as well as the user who published it.
 */

module.exports = function publishConnect() {
  
  var list = this;
  var options = list.get('publishConnect');
  var userModel = keystone.get('user model');
  var defaultOptions = {
      sandboxConnect : false,
      sandboxConnectBy: false,
      prodConnect: false,
      prodConnectBy: false 
    };
  var fields = {};

  // ensure track is a boolean or an object
  if (!_.isBoolean(options) && !_.isObject(options) ) {
    throw new Error('Invalid List "publish connect" option for ' + list.key + '\n' +
      '"publish connect" must be a boolean or an object."');        
  }

  if (_.isBoolean(options)) {
    // shorthand: { publish: true } sets all publish fields to true
    if (options) {
      options = { 
        sandboxConnect : true,
        sandboxConnectBy: true,
        prodConnect: true,
        prodConnectBy: true 
      };
    } else {
      // otherwise user doesn't want publish
      return;
    }
  }

  console.log("publish Connect options?", JSON.stringify(options));

  // if all publish fields are set to false, then user doesn't want to publish anything
  if (!options.sandboxConnect && !options.sandboxConnectBy && !options.prodConnect && !options.prodConnectBy) {
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
        throw new Error('Invalid List "publish connect" option for ' + list.key + '\n' +
          '"' + key + '" must be a boolean.\n\n');
      }

      if (value) {
        // determine 
        fieldName = value === true ? key : value;
        options[key] = fieldName;
        list.map(key, fieldName);

        switch(key) {
          case 'sandboxConnect':
          case 'prodConnect':
            fields[fieldName] = { type: Date, hidden: true, index: true };
          break;

          case 'sandboxConnectBy':
          case 'prodConnectBy':
            fields[fieldName] = { type: Types.Relationship, ref: userModel, hidden: true, index: true };
          break;
        }
      }
    } else {
      throw new Error('Invalid List "publish connect" option for ' + list.key + '\n' +
        'valid field options are "sandboxConnect", "sandboxConnectBy", "prodConnect", a "prodConnectBy".\n\n');       
    }
  });

  // add publish fields to schema
  //var schemaPrefix = "publish_to_"
  //list.add(fields, schemaPrefix);
  list.add(fields);
  
  list.publishingConnect = options;


  var publishToConnectRequest = function(publishToEnv, item, callback){
    //callback(null);
    item.schema.statics.publishToConnect(publishToEnv, item, function(error, result){
      console.log("callback from publishing to connect");
      callback(error, result);
    });
  }

  // add the post-save schema plugin
  list.schema.post('save', function (doc) {
    console.log("=============publishing post-save hook================");
    
    var now = new Date();
    var user = this._req_user;
    console.log("schema plugin list, publishToConnect?===========>", JSON.stringify(doc.publishToConnectEnv));
    //console.log("this._req_user.id", this._req_user.id);
    //console.log("options.devBy?", options.devBy);
    

    var _this = this;

    var publishToConnectEnv = doc.publishToConnectEnv; 

    //throw {name: "PublishError", message: "Error on publishing to " + publishTo};

    if(publishToConnectEnv && publishToConnectEnv.trim().length > 0) {
      publishToConnectRequest(publishToConnectEnv, doc, function(error, result){
        if(error){
          console.log("error on publishing to " + publishToConnectEnv)

          //throw {name: "PublishError", message: "Error on publishing to " + publishToConnectEnv};
          //_this.req.flash("error", "Error on publishing to " + publishToConnectEnv.upperCase());
        }
        else {
          if(publishToConnectEnv == "sandbox"){
            doc.set(options.sandboxConnect, now)

            if (options.sandboxConnectBy && user) {
              console.log("inside sandboxConnectBy check")
              doc.set(options.sandboxConnectBy, user._id);
            }
            else {
              console.log("no sandboxConnectBy")
            }
          }
          else if(publishToConnectEnv == "prod"){
            doc.set(options.prodConnect, now)

            if (options.prodConnectBy && user) {
              doc.set(options.prodConnectBy, user._id);
            }
          }

          //_this.req.flash("success", "Your changes have been saved and published to " + publishToConnectEnv.upperCase());

          doc.publishToConnectEnv = null; // make sure the post-save hook does not call it self again
          doc.save();
        }
      });     
    }
    
  });

};
