import React from 'react' ;
import _ from 'underscore' ;
import C3Chart from '../react-c3/c3-chart.jsx' ;
//import  deepcopy  from 'deepcopy' ;

import theme from '../../lucify-theme.jsx' ;

class C3StackedAreaChart extends React.Component {

    constructor(props) {
        super(props);
        // console.log("C3StackedAreaChart  this.props.spec) is ",this.props.spec);
    }

    // displayName: 'C3StackedAreaChart'


    getDataTemplate = () => {
        return {
            type: 'line',
            x: 'x',
            columns: [['x'].concat(this.props.xVals)]
        };
    }


    getColors = () => {
        if (this.props.colors != null) {
            return this.props.colors;
        }

        if (this.props.seriesDefs.length == 6) {
            return ['#26a69a', '#80cbc4', '#e0f2f1',
                '#c5cae9', '#7986cb', '#3f51b5'];
        }

        return theme.cyanToGreen8;
    }


    getColor = (index) => {
        return this.getColors()[index];
    }


    getColorsObject = () => {
        return _.object(this.props.seriesDefs.map(function (item, index) {
            return [item.name, this.getColor(index)];
        }.bind(this)));
    }


    getData = () => {
        var ret = this.getDataTemplate();

        var seriesDefs = this.props.seriesDefs;

        ret.types = _.object(seriesDefs.map(function (item) {
            return [item.name, 'area'];
        }));

        ret.groups = [
            seriesDefs.map(function (item) {
                return item.name;
            })
        ];

        ret.colors = this.getColorsObject();
        ret.order = null;

        if (!this.props.data) {
            return ret;
        }

        var allData = this.props.data;

        var xSeries = ['x'].concat(this.props.xVals);
        var actualSeries = seriesDefs.map(function (item) {
            return [item.name].concat(allData[item.series]);
        });

        ret.columns = [xSeries].concat(actualSeries);

        return ret;
    }


    getSpec = () => {
        //var newSpec = deepcopy(this.props.spec);
        var newSpec = JSON.parse(JSON.stringify(this.props.spec));
        return newSpec;
    }


    render() {
        return <C3Chart data={this.getData()} spec={this.getSpec()}/>;
    }

}

export default C3StackedAreaChart;
