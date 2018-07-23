
import  React  from 'react' ;
import ReactDOM from "react-dom";
import  d3  from 'd3' ;
import  moment  from 'moment' ;



class VaccineMapCountBar extends React.Component{

   constructor(props){
      super(props);
   }

  // displayName: 'VaccineMapCountBar'

  

  // for some reason Safari
  // slows down a lot when these
  // updates are rendered with
  // React, so we use D3 instead

  updateForStamp = (stamp) =>{
    var country = this.props.country;
    var vaccineCounts = this.props.vaccineCountsModel.getTotalDestinationCounts(country, stamp);
    var asylumBarSize = this.props.scale(vaccineCounts.asylumApplications);
    var coordinates = this.props.projection(this.props.mapModel.getCenterPointOfCountry(country));
    
    let lo = coordinates[0]-0;
    //  key point   , amormaid    some coordinates  is NaN
    coordinates = lo !== lo ? [0,0] :coordinates;
    
   // console.log("coordinates[1] - asylumBarSize  is ",coordinates[1] - asylumBarSize);
    //console.log("coordinates  is ",coordinates);
    

    this.asylumSel
      .attr('y', coordinates[1] - asylumBarSize)
      .attr('height', asylumBarSize)
      .attr('x', coordinates[0] - 2)
      .style('display', asylumBarSize > 0 ? 'inherit' : 'none');
  }


  shouldComponentUpdate(nextProps) {
    return this.props.height !== nextProps.height;
  }


  componentDidMount() {
    this.asylumSel = d3.select(ReactDOM.findDOMNode(this.refs.asylumBar));
  }


  render() {
    var country = this.props.country;
    var width = Math.max(3, Math.round(5 * this.props.width / 1000));
     //  rect 是 svg的形状元素     http://www.w3school.com.cn/svg/svg_rect.asp
    return (
      <g key={country}>
        <rect
        ref="asylumBar"
        key="asylum-bar"
        className="asylum-bar"
        width={width}
        x={0}
        height={0}
        y={0} />
      </g>
    );
  }
}



class VaccineMapCountBarsLayer extends React.Component{

   constructor(props){
      super(props);
   }

  // displayName: 'VaccineMapCountBarsLayer'

  


  getTotal() {
    if (!this._total) {
      this._total = this.props.vaccineCountsModel.getTotalDestinationCounts('DEU', moment().unix()).asylumApplications;
    }
    return this._total;
  }


  getBarSizeScale() {
    // this scale work as long as germany is in the
    // lead and we use the current map projection+position
    return d3.scale.linear()
      .domain([0, this.getTotal()])
      .range([0, this.props.height * 0.2]);
  }


  getBarItems() {
    var items = [];
    var countries = this.props.vaccineCountsModel.getDestinationCountries();

    var props = {
      vaccineCountsModel: this.props.vaccineCountsModel,
      projection: this.props.projection,
      mapModel: this.props.mapModel,
      scale: this.getBarSizeScale(),
      width: this.props.width,
      height: this.props.height
    };

    if (this.props.highlightedCountry != null) {
      if (countries.indexOf(this.props.highlightedCountry) != -1) {
        items.push(<VaccineMapCountBar
                    ref={this.props.highlightedCountry}
                    key={this.props.highlightedCountry + '_'}
                    country={this.props.highlightedCountry}
                    {...props} />);
      }

    } else {
      countries.forEach(function(country) {
        items.push(<VaccineMapCountBar
                    ref={country}
                    key={country}
                    country={country}
                    {...props} />);
      }.bind(this));
    }

    return items;
  }


  shouldComponentUpdate(nextProps) {
    return (this.props.highlightedCountry !== nextProps.highlightedCountry ||
            this.props.width !== nextProps.width);
  }


  componentDidUpdate() {
    if (this.lastUpdate != null) {
      this.doUpdate(this.lastUpdate);
    }
  }


  doUpdate(stamp) {
    this.lastUpdate = stamp;
    var countries = this.props.vaccineCountsModel.getDestinationCountries();
    countries.forEach(function(country) {
      if (this.refs[country] != null) {
        this.refs[country].updateForStamp(stamp);
      }
    }.bind(this));
  }


  updateForStamp(stamp) {
      // this update is for some reason pretty heavy
      // so only do it when stamp jumps more than five days
    if (!this.lastUpdate || Math.abs(this.lastUpdate - stamp) > 60 * 60 * 24 * 5) {
      this.doUpdate(stamp);
    }
  }


  render() {
    return (
      <svg className="vaccine-map-count-bars-layer"
        style={{width: this.props.width, height: this.props.height}}>
        {this.getBarItems()}
      </svg>
     );
  }

}
export  default   VaccineMapCountBarsLayer;
