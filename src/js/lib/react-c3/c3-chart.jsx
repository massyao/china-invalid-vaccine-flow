import React from 'react' ;
import ReactDOM from "react-dom";
import c3 from 'c3' ; // https://c3js.org/
import d3 from 'd3' ;

import debounceTime from '../debounce-time.jsx' ;

import _ from 'underscore' ;

//import  ComponentWidthMixin  from '../container-width-mixin.js' ;


class C3Chart extends React.Component {

    constructor(props) {
        super(props);
        //console.log("c3 chart has props ",props);
        //console.log(ReactDOM.findDOMNode);
        //console.log("ReactDOM.findDOMNode",ReactDOM.findDOMNode);
    }

    // displayName: 'C3Chart'


    //mixins: [ComponentWidthMixin],


    componentDidUpdate() {
        if (this.getUpdateDebounceTime() > 0) {
            this.scheduleUpdateData();
        } else {
            this.updateData();
        }

        this.scheduleResize();
    }


    updateData = () => {
        if (!this.destroyed) {
            try {
                this.chart.load(this.props.data);
                if (this.props.onUpdateData) {
                    this.props.onUpdateData();
                }
            } catch (err) {
                console.log("caught error at chart.load", err);
            }
        }
    }


    resizeChart() {
        if (!this.destroyed) {
            try {
                this.chart.resize(this.getSize());
            } catch (err) {
                console.log("caught error at chart.resize ", err);
            }
        }
    }


    updateStyles = () => {
        // console.log("ReactDOM.findDOMNode",ReactDOM.findDOMNode);
        if (this.props.lineStrokeWidth) {
            d3.select(ReactDOM.findDOMNode(this))
                .selectAll('.c3-line')
                .style('stroke-width', this.props.lineStrokeWidth);
        }

        d3.select(ReactDOM.findDOMNode(this))
            .select('.c3-axis-x').style('stroke-width', '1.5px');

        if (!this.props.spec.axis || !this.props.spec.axis.rotated) {
            d3.select(ReactDOM.findDOMNode(this))
                .selectAll('.c3-axis-x .tick text tspan')
                .attr('y', this.props.ticksFontSize);
        }

        d3.select(ReactDOM.findDOMNode(this))
            .selectAll('.tick text')
            .style('font-size', this.props.ticksFontSize + 'px');
    }


    getSize = () => {
        var baseWidth = Math.max(200, !!this.componentWidth ? this.componentWidth : 0);

        var ret = {
            width: baseWidth,
            height: baseWidth / this.props.aspectRatio
        };

        if (this.props.width) {
            ret.width = this.props.width;
        }

        if (this.props.height) {
            ret.height = this.props.height;
        }

        return ret;
    }


    onRendered = () => {
        this.initialRenderReady = true;

        if (!this.destroyed) {
            this.updateStyles();
            if (this.props.onRendered) {
                this.props.onRendered();
            }
        }
    }

    getUpdateDebounceTime = () => {
        return debounceTime(
            this.props.slowUpdateDebounceTime,
            this.props.fastUpdateDebounceTime);
    }


    getResizeDebounceTime = () => {
        return debounceTime(
            this.props.slowResizeDebounceTime,
            this.props.fastResizeDebounceTime);
    }


    componentDidMount = () => {
        //console.log("C3Chart props.spec is ",JSON.stringify(this.props.spec));
        console.log("C3Chart props.spec is ",this.props.spec);

        var fullSpec = JSON.parse(JSON.stringify(this.props.spec));
        
        

        // TODO: use ReactDOM once we upgrade to React 0.14
        //console.log("this.refs  is ",this.refs);
        //  keypoint amormaid
        fullSpec.bindto = this.refs.chart; //React.findDOMNode(this.refs.chart);
        fullSpec.data = this.props.data;
        fullSpec.size = this.getSize();
        // amormaid
        // fullSpec.regions = {};
        //fullSpec.bindto = "#content";

        // fullSpec.onrendered = this.onRendered;

       // console.log("fullSpec is ", fullSpec);

        this.chart = c3.generate(fullSpec);
        console.log("this.chart  is ", this.chart);

        this.scheduleResize = _.debounce(function () {
            this.resizeChart();
        }, this.getResizeDebounceTime());

        this.scheduleUpdateData = _.debounce(function () {
            this.updateData();
        }, this.getUpdateDebounceTime());
    }


    componentWillUnmount() {
        this.destroyed = true;
        this.chart && this.chart.destroy && this.chart.destroy();
    }


    render() {
        return (
            <div className="c3-chart">
                <div ref="chart"/>
            </div>
        );
    }

}


C3Chart.getDefaultProps = {
    slowUpdateDebounceTime: 1000,
    fastUpdateDebounceTime: 5,

    slowResizeDebounceTime: 1000,
    fastResizeDebounceTime: 500,

    lineStrokeWidth: 2,
    aspectRatio: 1.3, // aspectRatio = width / height
    ticksFontSize: 13,
    yTicksSpacing: 5
}
export default C3Chart;
