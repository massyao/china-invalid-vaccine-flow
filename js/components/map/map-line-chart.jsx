import React from 'react' ;
import ReactDOM from "react-dom";
//import  C3Chart  from 'lucify-commons/src/js/components/react-c3/c3-chart.jsx' ;
import C3Chart from '../../lib/react-c3/c3-chart.jsx' ;
import vaccineConstants from '../../model/vaccine-constants.js' ;
import moment from 'moment' ;
import d3 from 'd3' ;

//console.log("vaccineConstants is",vaccineConstants);


class VaccineMapLineChart extends React.Component {

    constructor(props) {
        super(props);
    }

    // displayName: 'VaccineMapLineChart'


    getData = ()=> {
     //console.log("moment([VaccineConstants.DATA_START_YEAR, VaccineConstants.DATA_START_MONTH, 1]).unix(), is ",moment([ .DATA_START_YEAR, VaccineConstants.DATA_START_MONTH, 1]).unix(),);
     console.log("vaccineConstants is ",vaccineConstants);
        var mom = moment([vaccineConstants.DATA_START_YEAR, vaccineConstants.DATA_START_MONTH]);
        var endMoment = vaccineConstants.DATA_END_MOMENT;
        var cols = [];
        var xvals = [];

        do {
            var counts = this.props.vaccineCountsModel.getGlobalArrivingPerDayCounts(mom.unix());
            cols.push(counts.vaccine_countApplications);
            xvals.push(mom.unix());
            mom.add(5, 'days');
        } while (endMoment.diff(mom) >= 0);


        var ret = {
            x: 'x',
            columns: [
                ['x'].concat(xvals),
                ['data1'].concat(cols)
            ],
            colors: {
                data1: '#ffffff'
            },
            onmouseover: this.handleMouseOverChart,
            onclick: this.handleOnClick,
            regions: {
                'data1': [{
                    start: this.getDataMissingStartStamp(),//  data start point
                    end: vaccineConstants.DATA_END_MOMENT.unix(),
                    style: 'dashed'
                }]
            }
        };
        return ret;
    }


    getFriendlyTime() {
        return moment(new Date(this.props.stamp * 1000)).format('DD.MM.YYYY');
    }


    componentWillReceiveProps() {
        this.updateLine(this.props.stamp);
    }


    shouldComponentUpdate() {
        return false;
    }


    updateLine =(stamp)=> {
        var chart = this.refs.c3Chart && this.refs.c3Chart.chart;

        if (!this.lineSel) {
            this.lineSel = d3.select(ReactDOM.findDOMNode(this)).select('.c3-xgrid-line');//this.getDOMNode()
        }

        var xval = chart.internal.x(stamp);

        // we update the line directly
        // since the c3 api function xgrids
        // triggers a redraw for the whole chart

        this.lineSel.select('line')
            .attr('x1', xval)
            .attr('x2', xval);

        this.lineSel.select('text')
            .attr('y', xval)
            .text(this.getFriendlyTime());

        // we update the line with the above code
        // since the c3 api function xgrids triggers a redraw
        // for the whole chart

        //chart.xgrids([
        //  {value: this.props.stamp, text: this.getFriendlyTime()}
        //]);

        //chart.regions([
        //  {axis: 'x', end: this.props.stamp, 'class': 'regionX'}
        //]);

        this.updateCountriesWithMissingData(stamp);
    }


    updateCountriesWithMissingData(stamp) {
        var timestampMoment = moment.unix(stamp);
        var res = this.countriesWithMissingDataCache && this.countriesWithMissingDataCache[timestampMoment.year() * 12 + timestampMoment.month()];

        if (res == null) {
            var countriesWithMissingData = this.props.vaccineCountsModel && this.props.vaccineCountsModel.getDestinationCountriesWithMissingData && this.props.vaccineCountsModel.getDestinationCountriesWithMissingData(timestampMoment) || [];
            var length = countriesWithMissingData.length;
            if (length > 0) {
                var missingDataText;
                countriesWithMissingData = countriesWithMissingData.map(function (countryCode) {
                    return this.props.mapModel.getFriendlyNameForCountry(countryCode);
                }.bind(this));
                if (length > 5) {
                    missingDataText = 'Missing data from ' + countriesWithMissingData.slice(0, 4).join(', ') +
                        ' and ' + (length - 4) + ' other countries';
                } else {
                    missingDataText = 'Missing data from ';
                    if (length > 1) {
                        missingDataText += countriesWithMissingData.slice(0, length - 1).join(', ') + ' and ';
                    }
                    missingDataText += countriesWithMissingData[length - 1];
                }
               // amormaid  display no missingDataText
                res = {
                    title: 'Missing data for ' + countriesWithMissingData.join(', '),
                    text: " " || missingDataText
                };

            } else {
                res = {
                    title: '',
                    text: ''
                };
            }
            this.countriesWithMissingDataCache[timestampMoment.year() * 12 + timestampMoment.month()] = res;
        }


        this.labelSelection
            .attr('title', res.title)
            .text(res.text);
    }


    updatePosition = (d)=> {
        this.updateLine(d.x);
        if (this.props.onMouseOver) {
            this.props.onMouseOver(d.x);
        }
    }


    handleOnClick = (d) => {
        //console.log("handleOnClick(d) {  is ",d);
        // Touch devices are never really
        // hovering on the timeline, so the
        // timing logic will not work, even
        // when the touch device is sending
        // a mouseOverEvent for a tap.
        //
        // We should always update on a "click"
        // event to support touch devices.
        //
        // However the onClick on c3.js only supports
        // clicks on the line itself. We will listen
        // to onClick of the parent component and use
        // the position conveyed via onMouseOver.
        //
        // To be sure that the onMouseOver runs
        // before the onClick event, we execute
        // the update after a small delay
        //
        //window.setTimeout(() => {
        //typeof window.setTimeout === "function" || console.log("window is ",window);
        window.setTimeout && window.setTimeout(() => {
            if (this.d != null) {
                this.updatePosition(this.d);
            }
        }, 100);
    }


    handleMouseOverChart = (d) => {
       // d is this.d     ,means  timestamp data
        this.d = d;

        // use a simple timing logic to ignore occasions where
        // the mouse clickly passed over the timeline chart,
        // while maintaining the ability to scroll through time
        // on hover
        if (!this.mouseOverStamp || Date.now() - this.mouseOverStamp < 250) {
            return;
        }

        this.updatePosition(d);
    }


    handleMouseOver = () => {
        if (!this.mouseOverStamp) {
            this.mouseOverStamp = Date.now();
        }
    }


    handleMouseLeave = () => {
        this.mouseOverStamp = null;
    }


    getSpec() {
        return {
            axis: {
                x: {
                    show: false
                },
                y: {
                    show: false
                }
            },
            point: {
                show: false
            },
            legend: {
                show: false
            },
            padding: {
                top: 0,
                bottom: 0,
                right: 0,
                left: 0
            },
            tooltip: {
                show: false
            },
            grid: {
                x: {
                    lines: [{
                        value: this.props.stamp,
                        text: this.getFriendlyTime()
                    }]
                }
            }
        };
    }


    getDataMissingStartStamp = () => {
        var timestamp = moment(vaccineConstants.DATA_END_MOMENT);
        var countriesWithMissingData = this.props.vaccineCountsModel && this.props.vaccineCountsModel.getDestinationCountriesWithMissingData && this.props.vaccineCountsModel.getDestinationCountriesWithMissingData instanceof Function && this.props.vaccineCountsModel.getDestinationCountriesWithMissingData(timestamp) || [];

        while (countriesWithMissingData.length > 0) {
            timestamp.subtract(1, 'months');
            countriesWithMissingData = this.props.vaccineCountsModel && this.props.vaccineCountsModel.getDestinationCountriesWithMissingData && this.props.vaccineCountsModel.getDestinationCountriesWithMissingData instanceof Function && this.props.vaccineCountsModel.getDestinationCountriesWithMissingData(timestamp) || [];
        }
        return timestamp.endOf('month').unix();
    }


    componentDidMount() {
        this.labelSelection = d3.select(this.refs.missingData); //d3.select(React.findDOMNode(this.refs.missingData));
        this.countriesWithMissingDataCache = {};
    }


    render() {
        return (
            <div className='vaccine-map-line-chart'
                 onMouseOver={this.handleMouseOver}
                 onMouseLeave={this.handleMouseLeave}
                 onClick={this.handleOnClick}>
                <span ref="missingData" className="vaccine-map-line-chart__missing-data"/>
                <C3Chart
                    ref='c3Chart'
                    lineStrokeWidth={2}
                    height={100}
                    width={window.innerWidth}
                    spec={this.getSpec()}
                    data={this.getData()}/>
            </div>
        );
    }

}

export default VaccineMapLineChart;
