import d3 from 'd3' ;
//import topojson from 'topojson' ;
var topojson = require('topojson');
import React from 'react' ;
import console from 'console-browserify' ;
import Promise from 'bluebird' ;

import VaccineCountsModel from '../model/vaccine-counts-model.js' ;
import VaccinePointsModel from '../model/vaccine-points-model.js' ;
import pointList from '../model/point-list.js' ;
import MapModel from '../model/map-model.js' ;

//import  lucifyUtils  from 'lucify-commons/src/js/lucify-utils.jsx' ;
//import  assets  from 'lucify-commons/src/js/lucify-assets.js' ;

import lucifyUtils from '../lib/lucify-utils.jsx' ;
import assets from '../lib/lucify-assets.js' ;

Promise.promisifyAll(d3);

// Bind vaccine and map data to given map component
//
// This is a React higher-order component as described here:
//   http://jamesknelson.com/structuring-react-applications-higher-order-components/
//   http://stackoverflow.com/questions/30845561/how-to-solve-this-using-composition-instead-of-mixins-in-react


var bindToVaccineMapContext = function (Component) {

    return class DividedCols extends React.Component {

        constructor(props) {
            super(props);
            this.state = {
                loaded: false,
                loadProgress: null,
                mapModel: null,
                vaccineCountsModel: null,
                vaccinePointsModel: null,
                smartSpreadEnabled: true,   // different values for these props have
                randomStartPoint: false     // not been tested and will probably result in bugs
            };
        };


        // displayName: 'VaccineContextDecorator'


        getPeoplePerPoint = () => {
            if (isFinite(this.props.peoplePerPoint)) {
                return this.props.peoplePerPoint;
            }

            if (lucifyUtils.isSlowDevice()) {
                return 10000;
            }
            return 5000;
        }


        componentDidMount() {
            console.time('load json'); // eslint-disable-line
            var promises = [];
            // promises.push(d3.jsonAsync(assets.data('topomap.json')).then(function(data) {
            promises.push(d3.jsonAsync(assets.data('chinamap.topo.json')).then(function (data) {
                //console.log(data);
                this.topomap = data;
            }.bind(this)));

            promises.push(d3.jsonAsync(assets.data('vaccine.data.json')).then(function (data) {
// amormaid
                this.vaccine_countData = data;
            }.bind(this)));

            Promise.all(promises).then(function () {
                console.timeEnd('load json'); // eslint-disable-line
                this.dataLoaded();
            }.bind(this), function (error) {
                throw error;
            });
        }


        createPointList = (mapModel) => {
            return pointList.createFullList(
                mapModel, this.vaccine_countData, this.getPeoplePerPoint(),
                this.props.randomStartPoint, this.props.smartSpreadEnabled);
        }


        progress = (percent) => {
            this.setState({loadProgress: percent});
        }


        initFeatures = () => {

            //   console.log("initFeatures  !!");
            this.features = topojson.feature(this.topomap, this.topomap.objects.map);

            window.setTimeout(this.initMapModel, 15);
        }


        initMapModel = () => {
            console.time('init map model'); // eslint-disable-line
            this.mapModel = new MapModel(this.features);
            this.progress(20);
            console.timeEnd('init map model'); // eslint-disable-line
            window.setTimeout(this.initPointsList, 15);

        }


        initPointsList = () => {
            console.time('create points list'); // eslint-disable-line
            this.pointList = this.createPointList(this.mapModel);
            this.progress(85);
            console.timeEnd('create points list'); // eslint-disable-line
            window.setTimeout(this.initModels, 15);
        }


        initModels = () => {
            this.vaccinePointsModel = new VaccinePointsModel(this.pointList, this.props.randomStartPoint, this.props.smartSpreadEnabled);
            this.vaccineCountsModel = new VaccineCountsModel(this.vaccine_countData);
            this.progress(95);
            window.setTimeout(this.finishLoading, 15);

        }


        finishLoading = () => {
            // console.log("bindToVaccineMapContext is loaded",);
            //console.log("vaccinePointsModel  is  ",this.vaccinePointsModel);
            // console.log("vaccineCountsModel  is  ",this.vaccineCountsModel);
            //console.log("mapModel  is  ",this.mapModel);
            console.log("finishLoading  is called");
            this.setState({
                vaccine_countData: this.vaccine_countData,
                mapModel: this.mapModel,
                vaccinePointsModel: this.vaccinePointsModel,
                vaccineCountsModel: this.vaccineCountsModel,
                loaded: true,
                loadProgress: 100
            });
            //console.log(this.state);

            /*         this.setState({
                        vaccine_countData: this.vaccine_countData,
                        mapModel: this.mapModel,
                        vaccinePointsModel: this.vaccinePointsModel,
                        vaccineCountsModel: this.vaccineCountsModel,
                        loaded: true,
                        loadProgress: 100
                     });*/

            // only for debugging
            /*
            window.vaccineCountsModel = this.vaccineCountsModel;
            window.vaccinePointsModel = this.vaccinePointsModel;
            window.mapModel = this.mapModel;
            window.vaccine_countData = this.vaccine_countData;
            */
        }


        dataLoaded = () => {
            this.progress(10);


            // This will trigger also the other inits
            //
            // We need to use setTimeout to allow for the
            // UI to update between parts of the loading
            // progress.
            //
            // For optimal results we would have to allow
            // this also during individual steps in createPointList,
            // which is taking most of the load time.
            //
            this.initFeatures();
        }


        render() {
            //console.log("vaccinePointsModel  is  ",this.state.vaccinePointsModel);
            //console.log("vaccineCountsModel  is  ",this.state.vaccineCountsModel);
            //console.log("mapModel  is  ",this.state.mapModel);
            return (
                <Component
                    {...this.props}
                    {...this.state}

                    peoplePerPoint={this.getPeoplePerPoint()}/>
            );
        }


    }

};


export default bindToVaccineMapContext;
