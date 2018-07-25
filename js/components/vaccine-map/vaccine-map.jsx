import React from 'react' ;
import d3 from 'd3' ;

var geoProjection = require('d3-geo-projection');
import _ from 'underscore' ;

import BordersLayer from './vaccine-map-borders-layer.jsx' ;
import CountryCountsLayer from './vaccine-map-country-counts-layer.jsx' ;
import CountryLabelsLayer from './vaccine-map-country-labels-layer.jsx' ;
import CountBarsLayer from './vaccine-map-count-bars-layer.jsx' ;
import PointsLayer from './vaccine-map-points-layer.jsx' ;
import SimpleBordersLayer from './vaccine-map-simple-borders-layer.jsx' ;
import FrameRateLayer from './frame-rate-layer.jsx' ;
//import  VaccineHighlightMixin  from './vaccine-highlight-mixin.js' ;
import DataUpdated from '../vaccine-data-updated.jsx' ;
import VaccineConstants from '../../model/vaccine-constants.js' ;

//import  lucifyUtils  from 'lucify-commons/src/js/lucify-utils.jsx' ;
import lucifyUtils from '../../lib/lucify-utils.jsx' ;


class VaccineMap extends React.Component {

    constructor(props) {
        super(props);
        console.log("VaccineMap has props of ", props);
        this.state = {
            hoveredCountry: null,
            clickedCountry: null
        }
    }

    // displayName: 'VaccineMap'


    // mixins:[VaccineHighlightMixin],


    getWidth = () => {
        //console.log("vaccine map getWidth()  is ",this.props.width);
        return this.props.width;
    }


    getHeight = () => {
        //console.log("vaccine map height()  is ",this.props.height);

        return this.props.height;
    }


    componentWillUpdate = (nextProps, nextState) => {
        if (this.props.width !== nextProps.width) {
            this._projection = null;
        }
    }

    getConicConformalProjection = () => {
        var lo = this.props.lo || 114.53; // x
        var la = this.props.la || 35.21; // y
        return d3.geo.conicConformal()
            .center([0, la])
            .rotate([-lo, 0])
            .scale(this.getWidth() * 0.85)
            //  .translate([this.getWidth() / 2, this.getHeight() / 2])   
            // amormaid
            .translate([window.innerWidth / 2, (window.innerHeight - 100) / 2])
    }


    getAzimuthalEqualAreaProjection = () => {
        var lo = this.props.lo || 114.53; // x
        var la = this.props.la || 35.21; // y

        return d3.geo.azimuthalEqualArea()
        //.clipAngle(180 - 1e-3)
            .center([0, la])
            .rotate([-lo, 0])
            .scale(this.getWidth() * this.props.scale)
            //  .translate([this.getWidth() / 2, this.getHeight() / 2])   // amormaid
            .translate([window.innerWidth / 2, (window.innerHeight - 100) / 2])
            .precision(1);
    }


    getWinkel3Projection = () => {
        var lo = this.props.lo || 114.53; // x
        var la = this.props.la || 35.21; // y
        //console.log(geoProjection);

        //  https://www.bootcdn.cn/d3-geo-projection/readme/
        // https://github.com/d3/d3-geo-projection/blob/master/src/winkel3.js
        // https://bl.ocks.org/mbostock/3682676

        //console.log("this.props.scale()  is ",this.props.scale);
        this.props.scale = this.props.scale || 0.6;

        return geoProjection.geoWinkel3()
            .center([0, la])
            .rotate([-lo, 0])
            .scale(this.getWidth() * this.props.scale)
            //  .translate([this.getWidth() / 2, this.getHeight() / 2])   // amormaid
            .translate([window.innerWidth / 2, (window.innerHeight - 100) / 2])
            .precision(1);
    }


    getMercatorProjection = () => {
        var lo = this.props.lo || 114.53; // x
        var la = this.props.la || 35.21; // y

        return d3.geo.mercator()
            .center([0, la])
            .rotate([-lo, 0])
            .scale(this.getWidth() * 0.55) //0.55
            .translate([this.getWidth() / 2, this.getHeight() / 2]);
    }


    getProjection = () => {
        if (!this._projection) {
            this._projection = this.getWinkel3Projection();
        }
        return this._projection;
    }


    getStandardLayerParams = () => {
        return {
            mapModel: this.props.mapModel,
            projection: this.getProjection(),
            width: this.getWidth(),
            height: this.getHeight(),
            stamp: this.getStamp()
        };
    }


    componentWillMount = () => {
        this.stamp = this.props.stamp;
    }

    handleMapClick = () => {
        if (this.state.clickedCountry == this.state.hoveredCountry) {
            // clicking a country again should clear the
            // "lock" on the country
            this.setState({clickedCountry: null});
            return;
        }
        this.setState({clickedCountry: this.state.hoveredCountry});
        this.updateHighlight(this.state.hoveredCountry);
    }


    handleMouseOver = (country) => {
        this.pendingHoverOut = false;
        this.setHoveredCountry(country);
    }


    handleMouseLeave = (_country) => {
        this.pendingHoverOut = true;
        window.setTimeout(() => {
            if (this.pendingHoverOut) {
                this.setHoveredCountry(null);
            }
        }, 50);
    }


    setHoveredCountry = (country) => {
        this.setState({hoveredCountry: country});
        if (!this.state.clickedCountry) {
            this.updateHighlight(country);
        }
    }


    getHighlightedCountry = () => {
        if (this.state.clickedCountry != null) {
            return this.state.clickedCountry;
        }
        return this.state.hoveredCountry;
    }


    getDestinationCountries = (country) => {
        return this.props.vaccineCountsModel
            .getDestinationCountriesByStamp(country, this.getStamp());
    }


    getOriginCountries = (country) => {
        return this.props.vaccineCountsModel
            .getOriginCountriesByStamp(country, this.getStamp());
    }


    updateHighlight = (country) => {

        var dc = this.getDestinationCountries(country);
        var oc = this.getOriginCountries(country);

        // In some cases there are people
        // seeking vaccine_count in both directions
        // for a country pair.
        //
        // In such a situtation we decide on which
        // which side to display based on whether
        // [country] is mainly a sender or receiver.
        //
        if (oc.length > dc.length) {
            dc = _.difference(dc, oc);
        } else {
            oc = _.difference(oc, dc);
        }

        // We should update if the destination
        // countries or origin countries have changed
        //
        // To avoid slow deep comparison we
        // only compare length.

        //

        //console.log("this.storedDestinationCountries",this.storedDestinationCountries);
        //console.log("this.storedDestinationCountries",dc);
        // key point amormaid

        this.storedDestinationCountries = this.storedDestinationCountries || [];
        this.storedOriginCountries = this.storedOriginCountries || [];

        var update = country != this.country
            || dc.length != this.storedDestinationCountries.length
            || oc.length != this.storedOriginCountries.length;

        this.country = country;
        this.storedDestinationCountries = dc;
        this.storedOriginCountries = oc;

        // if the list of destination countries was updated,
        // we call set state to trigger a re-render for borders
        if (update) {
            this.setState({});
        }
    }


    getHighlightLayerParams = () => {
        return {
            country: this.getHighlightedCountry(),
            originCountries: this.storedOriginCountries,
            destinationCountries: this.storedDestinationCountries
        };
    }


    // see vaccine-play-context-decorator.jsx
    // for explanation

    updateForStamp = (stamp) => {
        this.stamp = stamp;

        if (this.refs.pointsLayer != null) {
            this.refs.pointsLayer.updateForStamp(stamp);
        }

        if (this.refs.frameRateLayer != null) {
            this.refs.frameRateLayer.update();
        }

        if (this.refs.bordersLayer != null) {
            this.refs.bordersLayer.updateForStamp(stamp);
        }

        if (this.refs.countBars != null) {
            this.refs.countBars.updateForStamp(stamp);
        }

        if (this.refs.countsLayer != null) {
            this.refs.countsLayer.updateForStamp(stamp);
        }

        if (this.interactionsEnabled() && this.props.vaccineCountsModel != null) {
            this.updateHighlight(this.getHighlightedCountry());
        }
    }


    getStamp = () => {
        return this.stamp;
    }


    interactionsEnabled = () => {
        //   true
        return this.props.interactionsEnabled;
    }


    getFirstBordersLayer = () => {
        // console.log("this.props.getStandardLayerParams  is ",this.getStandardLayerParams());
        if (this.interactionsEnabled()) {
            return (
                <BordersLayer
                    ref="bordersLayer"
                    updatesEnabled={true}
                    enableOverlay={true}
                    {...this.getStandardLayerParams()}
                    {...this.getHighlightLayerParams()}
                    vaccineCountsModel={this.props.vaccineCountsModel}
                    subunitClass="subunit"/>
            );
        } else {
            return <SimpleBordersLayer {...this.getStandardLayerParams()} />;
        }
    }


    getSecondBordersLayer = () => {
        if (this.interactionsEnabled()) {
            return (
                <BordersLayer
                    updatesEnabled={false}
                    {...this.getStandardLayerParams()}
                    subunitClass="subunit-invisible"
                    onMouseOver={this.handleMouseOver}
                    onMouseLeave={this.handleMouseLeave}
                    onClick={this.handleMapClick}/>
            );
        }
    }


    getCountryLabelsLayer = () => {
        if (this.interactionsEnabled()) {
            return (
                <CountryLabelsLayer
                    ref="countryLabels"
                    {...this.getStandardLayerParams()}
                    {...this.getHighlightLayerParams()} />
            );
        }
    }


    getCountryCountsLayer = () => {
        if (this.interactionsEnabled()) {
            return (
                <CountryCountsLayer
                    ref="countsLayer"
                    {...this.getStandardLayerParams()}
                    {...this.getHighlightLayerParams()}
                    vaccineCountsModel={this.props.vaccineCountsModel}/>
            );
        }
    }


    getOverlayLayer = () => {
        if (this.interactionsEnabled()) {
            return null;
        }
        return (
            <div
                className="vaccine-map__overlay-layer"
                style={{width: this.getWidth(), height: this.getHeight()}}>
            </div>
        );
    }

    getCountBarsLayer = () => {
        if (lucifyUtils.detectIE() !== 9) {
            return (
                <CountBarsLayer
                    ref="countBars"
                    {...this.getStandardLayerParams()}
                    highlightedCountry={this.getHighlightedCountry()}
                    vaccineCountsModel={this.props.vaccineCountsModel}/>
            );
        }
        return null;
    }


    getFrameRateLayer = () => {
        if (this.props.showFps) {
            return <FrameRateLayer ref="frameRateLayer"/>;
        }
        return null;
    }


    getDataUpdated = () => {
        if (this.props.showDataUpdated) {
            return <DataUpdated updatedAt={VaccineConstants.vaccine_count_APPLICANTS_DATA_UPDATED_MOMENT}/>;
        }
    }


    render() {
        //console.log("regugee map   prop of  vaccineCountsModel is ",this.props.vaccineCountsModel );
        // console.log("regugee map   prop of  vaccinePointsModel is ",this.props.vaccinePointsModel );
        //console.log("regugee map   prop of  mapModel is ",this.props.mapModel );
        //console.table(this.state);

        let status = !this.props.vaccineCountsModel || !this.props.vaccinePointsModel || !this.props.mapModel;
        if (status) {
            return (
                <div className="vaccine-map"
                     style={{width: this.getWidth(), height: this.getHeight()}}>
                    <div className="vaccine-map__loading">Loading...</div>
                </div>
            );
        } else {
            return (
                <div className="vaccine-map"
                     style={{width: window.innerWidth, height: (window.innerHeight - 100)}}>
                    {this.getFirstBordersLayer()/*  map */}
                    {this.getCountBarsLayer()/*  people count  */}
                    {this.getCountryLabelsLayer() /*  unknow */}
                    {this.getCountryCountsLayer()/*  unknow */}
                    <PointsLayer
                        ref="pointsLayer"
                        {...this.getStandardLayerParams()}
                        highlightedCountry={this.getHighlightedCountry()}
                        vaccinePointsModel={this.props.vaccinePointsModel}
                    />
                    {this.getSecondBordersLayer()}
                    {this.getFrameRateLayer()}
                    {this.getOverlayLayer()}
                    {this.getDataUpdated()}
                </div>
            );

        }
//  style={{width: this.getWidth(), height: this.getHeight()}}>

        //console.log("VaccineMapBordersLayer will receive props ",this.getStandardLayerParams());

    }

}


VaccineMap.storedDestinationCountries = [];
VaccineMap.storedOriginCountries = [];
VaccineMap.highlightStamp = 0;


VaccineMap.getDefaultProps = {
    width: window.innerWidth, //width: 1200,
    height: (window.innerHeight - 100), //height: 1200,
    interactionsEnabled: true,
    showFps: false,
    lo: 114.53,//lo: 22.2206322 + 7,
    la: 35.21,//la: 32.0485818,
    scale: 0.70, //  scale: 0.70,
    showDataUpdated: true
}


export default VaccineMap;
