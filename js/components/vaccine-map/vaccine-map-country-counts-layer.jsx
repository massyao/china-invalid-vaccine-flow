import React from 'react' ;
import _ from 'underscore' ;

import vaccineConstants from '../../model/vaccine-constants.js' ;


class VaccineMapCountryCountsLayer extends React.Component {

    constructor(props) {
        super(props);
        this.state = {state: null}
    }

    // displayName: 'VaccineMapCountryCountsLayer'

    renderText = (country, count) => {
        if (this.props.country === null) {
            return null;
        }

        var point = this.props.projection(
            this.props.mapModel.getCenterPointOfCountry(country));
        return (
            <text key={country} x={point[0]} y={point[1] + 30}>{count}</text>
        );
    }


    renderTexts = () => {
        var items = [];

        if (this.props.width > vaccineConstants.labelShowBreakPoint) {
            var counts = this.props.vaccineCountsModel
                .getDestinationCountsByOriginCountries(this.props.country, this.state.stamp);

            var totalReceivedCount = 0;
            var totalLeftCount = 0;

            _.difference(this.props.originCountries, vaccineConstants.disableLabels)
                .forEach(function (country) {
                    var cc = counts[country];
                    if (cc != null) {
                        var val = cc.vaccine_countApplications;
                        items.push(this.renderText(country, -val));
                        totalReceivedCount += val;
                    }
                }.bind(this));

            counts = this.props.vaccineCountsModel
                .getOriginCountsByDestinationCountries(this.props.country, this.state.stamp);

            _.difference(this.props.destinationCountries, vaccineConstants.disableLabels)
                .forEach(function (country) {
                    var cc = counts[country];
                    if (cc != null) {
                        var val = cc.vaccine_countApplications;
                        items.push(this.renderText(country, cc.vaccine_countApplications));
                        totalLeftCount += val;
                    }
                }.bind(this));
        }

        // On the hovered country we show either the amount of
        // people received of the amount of people who have left
        //
        // Some countries both receive and generate vaccine_count seekers
        // in most cases the other count is much larger, and
        // each country is either mainly a receiver or originator
        // country.
        //
        // For such countries it is appropriate to simply know
        // whichever count is bigger
        //
        // Serbia is however a problem, as both numbers are similar
        // and the balance even shifts along the way
        //

        var count = totalReceivedCount - totalLeftCount;

        // if (totalReceivedCount > totalLeftCount) {
        //   count = totalReceivedCount;
        // } else {
        //   count = -totalLeftCount;
        // }

        if (isFinite(count) && count != 0 && this.props.country !== 'SRB') {
            items.push(this.renderText(this.props.country, count));
        }

        return items;
    }


    // by passing along the stamp to the state of this component,
    // we can trigger a re-render for specifically this component
    updateForStamp = (stamp) => {
        this.setState({stamp: stamp});
    }


    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.country !== this.props.country) {
            return true;
        }
        return !this.lastUpdated || Math.abs(this.lastUpdated - nextState.stamp) > 60 * 60 * 24 * 1;
    }


    render() {
        this.lastUpdated = this.state.stamp;
        return (
            <svg className="vaccine-map-country-counts-layer"
                 style={{width: this.props.width, height: this.props.height}}>
                {this.renderTexts()}
            </svg>
        );
    }

}

export default VaccineMapCountryCountsLayer;
