var _ = require('underscore'),
	moment = require('moment'),
	React = require('react'),
	Fields = require('FieldTypes'),
	FormHeading = require('./FormHeading'),
	Toolbar = require('./Toolbar'),
	InvalidFieldType = require('./InvalidFieldType');

var EditForm = React.createClass({
	
	displayName: 'EditForm',
	
	getInitialState: function() {
		return {
			values: _.clone(this.props.data.fields)
		};
	},
	
	getFieldProps: function(field) {
		var props = _.clone(field);
		props.value = this.state.values[field.path];
		props.values = this.state.values;
		props.onChange = this.handleChange;
		props.mode = 'edit';
		return props;
	},
	
	handleChange: function(event) {
		var values = this.state.values;
		values[event.path] = event.value;
		this.setState({
			values: values
		});
	},

	publish: function(publishToEnv){
		console.log("publishToEnv", publishToEnv);
		this.refs.publishToField.getDOMNode().value = publishToEnv;
		this.refs.submitButton.getDOMNode().click();
	},
	
	renderNameField: function() {
		
		var nameField = this.props.list.nameField,
			nameIsEditable = this.props.list.nameIsEditable;
		
		function wrapNameField(field) {
			return (
				<div className="field item-name">
					<div className="col-sm-12">
						{field}
					</div>
				</div>
			);
		}
		
		if (nameIsEditable) {
			
			var nameFieldProps = this.getFieldProps(nameField);
			nameFieldProps.className = 'item-name-field';
			nameFieldProps.placeholder = nameField.label;
			nameFieldProps.label = false;
			
			return wrapNameField(
				React.createElement(Fields[nameField.type], nameFieldProps)
			);
			
		} else {
			return wrapNameField(
				<h2 className="form-heading name-value">{this.props.data.name || '(no name)'}</h2>
			);
		}
	},
	
	renderTrackingMeta: function() {
		
		if (!this.props.list.tracking) return null;
		
		var elements = {},
			data = {},
			label;
		
		if (this.props.list.tracking.createdAt) {
			data.createdAt = this.props.data.fields[this.props.list.tracking.createdAt];
			if (data.createdAt) {
				elements.createdAt = (
					<div className="item-details-meta-item">
						<span className="item-details-meta-label">Created</span>
						<span className="item-details-meta-info">{moment(data.createdAt).format('Do MMM YY h:mm:ssa')}</span>
					</div>
				);
			}
		}
		
		if (this.props.list.tracking.createdBy) {
			data.createdBy = this.props.data.fields[this.props.list.tracking.createdBy];
			if (data.createdBy) {
				label = data.createdAt ? 'by' : 'Created by';
				// todo: harden logic around user name
				elements.createdBy = (
					<div className="item-details-meta-item">
						<span className="item-details-meta-label">{label}</span>
						<span className="item-details-meta-info">{data.createdBy.name.first} {data.createdBy.name.last}</span>
					</div>
				);
			}
		}
		
		if (this.props.list.tracking.updatedAt) {
			data.updatedAt = this.props.data.fields[this.props.list.tracking.updatedAt];
			if (data.updatedAt && (!data.createdAt || data.createdAt !== data.updatedAt)) {
				elements.updatedAt = (
					<div className="item-details-meta-item">
						<span className="item-details-meta-label">Updated</span>
						<span className="item-details-meta-info">{moment(data.updatedAt).format('Do MMM YY h:mm:ssa')}</span>
					</div>
				);
			}
		}
		
		if (this.props.list.tracking.updatedBy) {
			data.updatedBy = this.props.data.fields[this.props.list.tracking.updatedBy];
			if (data.updatedBy && (!data.createdBy || data.createdBy.id !== data.updatedBy.id || elements.updatedAt)) {
				label = data.updatedAt ? 'by' : 'Created by';
				elements.updatedBy = (
					<div className="item-details-meta-item">
						<span className="item-details-meta-label">{label}</span>
						<span className="item-details-meta-info">{data.updatedBy.name.first} {data.updatedBy.name.last}</span>
					</div>
				);
			}
		}
		
		return Object.keys(elements).length ? <div className="item-details-meta">{elements}</div> : null;
		
	},

	renderPublishingMeta: function() {
		
		if (!this.props.list.publishing) return null;
		
		var elements = {},
			data = {},
			label;
		
		if (this.props.list.publishing.dev) {
			data.dev = this.props.data.fields[this.props.list.publishing.dev];
			if (data.dev) {
				elements.dev = (
					<div className="item-details-meta-item">
						<span className="item-details-meta-label">Published to DEV</span>
						<span className="item-details-meta-info">{moment(data.dev).format('Do MMM YY h:mm:ssa')}</span>
					</div>
				);
			}
		}
		
		if (this.props.list.publishing.devBy) {
			data.devBy = this.props.data.fields[this.props.list.publishing.devBy];
			if (data.devBy) {
				label = 'by';
				// todo: harden logic around user name
				elements.devBy = (
					<div className="item-details-meta-item">
						<span className="item-details-meta-label">{label}</span>
						<span className="item-details-meta-info">{data.devBy.name.first} {data.devBy.name.last}</span>
					</div>
				);
			}
		}

		if (this.props.list.publishing.staging) {
			data.staging= this.props.data.fields[this.props.list.publishing.staging];
			if (data.staging) {
				elements.staging = (
					<div className="item-details-meta-item">
						<span className="item-details-meta-label">Published to STAGING</span>
						<span className="item-details-meta-info">{moment(data.staging).format('Do MMM YY h:mm:ssa')}</span>
					</div>
				);
			}
		}
		
		if (this.props.list.publishing.stagingBy) {
			data.stagingBy = this.props.data.fields[this.props.list.publishing.stagingBy];
			if (data.stagingBy) {
				label = 'by';
				// todo: harden logic around user name
				elements.stagingBy = (
					<div className="item-details-meta-item">
						<span className="item-details-meta-label">{label}</span>
						<span className="item-details-meta-info">{data.stagingBy.name.first} {data.stagingBy.name.last}</span>
					</div>
				);
			}
		}

		if (this.props.list.publishing.prod) {
			data.prod= this.props.data.fields[this.props.list.publishing.prod];
			if (data.prod) {
				elements.prod = (
					<div className="item-details-meta-item">
						<span className="item-details-meta-label">Published to PROD</span>
						<span className="item-details-meta-info">{moment(data.prod).format('Do MMM YY h:mm:ssa')}</span>
					</div>
				);
			}
		}
		
		if (this.props.list.publishing.prodBy) {
			data.prodBy = this.props.data.fields[this.props.list.publishing.prodBy];
			if (data.prodBy) {
				label = 'by';
				// todo: harden logic around user name
				elements.prodBy = (
					<div className="item-details-meta-item">
						<span className="item-details-meta-label">{label}</span>
						<span className="item-details-meta-info">{data.prodBy.name.first} {data.prodBy.name.last}</span>
					</div>
				);
			}
		}
		
		return Object.keys(elements).length ? <div className="item-details-meta">{elements}</div> : null;
		
	},
	
	renderFormElements: function() {
		
		var elements = {},
			headings = 0;
		
		_.each(this.props.list.uiElements, function(el) {
			
			if (el.type === 'heading') {
				
				headings++;
				el.options.values = this.state.values;
				elements['h-' + headings] = React.createElement(FormHeading, el);
				
			} else if (el.type === 'field') {
				
				var field = this.props.list.fields[el.field],
					props = this.getFieldProps(field);


				if ('function' !== typeof Fields[field.type]) {
					elements[field.path] = React.createElement(InvalidFieldType, { type: field.type, path: field.path });
					return;
				}

				if (props.dependsOn) {
					props.currentDependencies = {};
					Object.keys(props.dependsOn).forEach(function (dep) {
						props.currentDependencies[dep] = this.state.values[dep];
					}, this);
				}

				elements[field.path] = React.createElement(Fields[field.type], props);
				
			}
			
		}, this);
		
		return elements;
		
	},
	
	renderToolbar: function() {
		
		var toolbar = {};
		
		if (!this.props.list.noedit) {
			toolbar.save = <button ref="submitButton" type="submit" className="btn btn-save">Save</button>;
			// TODO: Confirm: Use React & Modal
			toolbar.reset = <a href={'/keystone/' + this.props.list.path + '/' + this.props.data.id} className="btn btn-link btn-cancel" data-confirm="Are you sure you want to reset your changes?">reset changes</a>;
		}
		
		if (!this.props.list.noedit && !this.props.list.nodelete) {
			// TODO: Confirm: Use React & Modal
			toolbar.del = <a href={'/keystone/' + this.props.list.path + '?delete=' + this.props.data.id + Keystone.csrf.query} className="btn btn-link btn-cancel delete" data-confirm={'Are you sure you want to delete this?' + this.props.list.singular.toLowerCase()}>delete {this.props.list.singular.toLowerCase()}</a>;
		}

		var publishing = this.props.list.publishing;
		console.log("===============>renderToolar publishing?", JSON.stringify(publishing));

		if(publishing){
			if(publishing.dev) toolbar.dev = <button type="button" className="btn btn-save" onClick={this.publish.bind(this, 'dev')}>Publish To DEV</button>;
			if(publishing.staging) toolbar.staging = <button type="button" className="btn btn-save" onClick={this.publish.bind(this, 'staging')}>Publish To STAGING</button>;
			if(publishing.prod) toolbar.prod = <button type="button" className="btn btn-save" onClick={this.publish.bind(this, 'prod')}>Publish To PROD</button>;
		}
		
		return (
			<Toolbar className="toolbar">
				{toolbar}
			</Toolbar>
		);
		
	},
	
	render: function() {
		
		return (
			<form method="post" encType="multipart/form-data" className="item-details">
				<input type="hidden" name="action" value="updateItem" />
				<input type="hidden" ref="publishToField" name="publishTo" value="" />
				<input type="hidden" name={Keystone.csrf.key} value={Keystone.csrf.value} />
				{this.renderNameField()}
				{this.renderTrackingMeta()}
				{this.renderPublishingMeta()}
				{this.renderFormElements()}
				{this.renderToolbar()}
			</form>
		);
	}
	
});

module.exports = EditForm;
