var React = require('react');
var ComponentWidthMixin = require('./container-width-mixin.js');


module.exports = React.createClass({

    mixins: [ComponentWidthMixin],


    getDefaultProps: function () {
        return {
            minWidth: null,
            maxWidth: null
        }
    },


    match: function () {
        if (this.props.minWidth != null && this.componentWidth < this.props.minWidth) {
            return false;
        }

        if (this.props.maxWidth != null && this.componentWidth > this.props.maxWidth) {
            return false;
        }

        return true;
    },


    getChildren: function () {
        if (!this.componentWidth || !this.match()) {
            return <span/>;
        }
        return this.props.children;
    },


    render: function () {
        return (
            <div>
                {this.getChildren()}
            </div>
        );

    }


});

