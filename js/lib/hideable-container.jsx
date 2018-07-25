//import  React  from 'react' ;
//import  classNames  from 'classnames' ;
import React from "react";
import classNames from "classnames";


class HideableContainer extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            visible: false
        };
    }


    // displayName: 'HideableContainer'


    componentWillReceiveProps(newProps) {
        if (newProps.visible != this.props.visible) {
            setTimeout(function () {
                this.setState({visible: newProps.visible});
            }.bind(this), this.props.delay);
        }
    }


    componentDidMount() {
        // Setting state in componentDidMount not recommended. will trigger rerender
        this.setState({visible: this.props.visible});
    }


    getClasses = () => {
        return 'hideable-container' + (this.state.visible ? 'hideable-container-visible' : "");


        /*    classNames(
             'hideable-container',
             {
               'hideable-container-visible': this.state.visible
             }
           );*/
    }


    getContent = () => {
        if (this.props.removeFromDOM && !this.props.visible) {
            return <span/>;
        }
        return this.props.children;
    }


    getStyle = () => {
        return {
            display: (this.props.displayNone && !this.props.visible) ? 'none' : 'block',
            height: (this.props.heightZero && !this.props.visible) ? '0' : 'auto'
        };
    }

    render() {
        return <div style={this.getStyle()}
                    className={this.getClasses()}>{this.getContent()}</div>;
    }

}


HideableContainer.getDefaultProps = {
    visible: false,
    delay: 0,
    removeFromDOM: false,
    displayNone: false,
    heightZero: false,
}
//export default   HideableContainer;
export default HideableContainer;
