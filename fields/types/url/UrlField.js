var React = require('react'),
	Field = require('../Field');

module.exports = Field.create({
	displayName: 'UrlField',

	renderField: function() {
		var styles = {
			height: this.props.height
		};

		if (this.props.disabled) return <div><input disabled name={this.props.path} styles={styles} ref="focusTarget" value={this.props.value} className="form-control" /><a href={this.props.value} className="btn btn-link btn-goto-linked-item">View Link</a></div>;


		return <div><input name={this.props.path} styles={styles} ref="focusTarget" value={this.props.value} onChange={this.valueChanged} autoComplete="off" className="form-control" /><a href={this.props.value} className="btn btn-link btn-goto-linked-item">View Link</a></div>;
	}
});
