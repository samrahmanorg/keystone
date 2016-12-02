exports.sortable = require('./schemaPlugins/sortable');
exports.autokey = require('./schemaPlugins/autokey');
exports.track = require('./schemaPlugins/track');
exports.publish = require('./schemaPlugins/publish');
exports.publishConnect = require('./schemaPlugins/publishconnect');
exports.history = require('./schemaPlugins/history');

exports.methods = {
	getRelated: require('./schemaPlugins/methods/getRelated'),
	populateRelated: require('./schemaPlugins/methods/populateRelated')
};

exports.options = {
	transform: require('./schemaPlugins/options/transform')
};
