import React from "react";

//import ComponentWidthMixin from "./container-width-mixin.js";
// 实现onresize时的调整界面大小功能，暂时去掉此功能

//import  React  from 'react' ;
//import  ComponentWidthMixin  from './container-width-mixin.js' ;


class DividedCols extends React.Component {

    constructor(props) {
        super(props);
    }

    //// displayName = "DividedCols";


    getPrefix = () => {
        if (this.componentWidth < this.props.breakPointStacked) {
            return 'divided-cols--stacked__';
        }

        if (this.componentWidth < this.props.breakPointNarrow) {
            return 'divided-cols--narrow__';
        }

        return 'divided-cols__';
    }


    getClassName = (suffix) => {
        return this.getPrefix() + suffix;
    }


    getFirst = () => {
        if (this.props.inverse && this.componentWidth < this.props.breakPointStacked) {
            return this.props.second;
        }
        return this.props.first;
    }


    getSecond = () => {
        if (this.props.inverse && this.componentWidth < this.props.breakPointStacked) {
            return this.props.first;
        }
        return this.props.second;
    }


    render() {
        if (!this.componentWidth) {
            return <div/>;
        }

        return (
            <div className={this.getClassName('parent')}>
                <div className={this.getClassName('first')}>
                    {this.getFirst()}
                </div>
                <div className={this.getClassName('second')}>
                    {this.getSecond()}
                </div>
            </div>
        );
    }
}

DividedCols.getDefaultProps = {
    breakPointStacked: 700,
    breakPointNarrow: 800,
    inverse: false,
    alignmentClass: 'top-xs'

}


export default DividedCols;
//export default   DividedCols;
