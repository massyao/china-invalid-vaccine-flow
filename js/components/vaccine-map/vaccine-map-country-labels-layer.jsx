
import  React  from 'react' ;
import  _  from 'underscore' ;

import  vaccineConstants  from '../../model/vaccine-constants.js' ;


class VaccineMapCountryLabelsLayer extends React.Component{

   constructor(props){
      super(props);
   }

  // displayName: 'VaccineMapCountryLabelsLayer'

  


  renderCountryLabel = (country, type) =>{
    var point = this.props.projection(
      this.props.mapModel.getCenterPointOfCountry(country));

    return (
    <text key={country + type} x={point[0]} y={point[1] + 15} className={type}>
      {this.props.mapModel.getFriendlyNameForCountry(country)}
    </text>
    );
  }


  renderCountryLabels = () =>{
    var items = [];

    if (this.props.country === null) {
      return items;
    }

    items.push(this.renderCountryLabel(this.props.country, 'highlighted'));

    if (this.props.width > vaccineConstants.labelShowBreakPoint) {
      _.difference(this.props.destinationCountries, vaccineConstants.disableLabels)
        .forEach(function(country) {
          items.push(this.renderCountryLabel(country, 'destination'));
        }.bind(this));

      _.difference(this.props.originCountries, vaccineConstants.disableLabels)
        .forEach(function(country) {
          items.push(this.renderCountryLabel(country, 'origin'));
        }.bind(this));
    }

    return items;
  }

  // vaccine-map is updating the originCountries
  // and destinationCountries in vaccine-map's state
  // regularly when stamps are updated, so any changes
  // will trigger a render as appropriate
  // key point amormaid    nextProps.originCountries is  null
  shouldComponentUpdate(nextProps, _nextState) {
    return nextProps.country !== this.props.country || (nextProps && nextProps.originCountries && nextProps.originCountries instanceof Object && nextProps.originCountries.length !== this.props.originCountries.length )  || (nextProps && nextProps.destinationCountries && nextProps.destinationCountries instanceof Object && nextProps.destinationCountries.length !== this.props.destinationCountries.length)    || nextProps.width !== this.props.width;
  }


  render() {
    return (
       <svg className="vaccine-map-country-labels-layer"
        style={{width: this.props.width, height: this.props.height}}>
        {this.renderCountryLabels()}
       </svg>
    );
  }

}export  default   VaccineMapCountryLabelsLayer;
