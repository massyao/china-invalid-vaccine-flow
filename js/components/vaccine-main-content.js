import React from 'react' ;

//import  HideableContainer  from 'lucify-commons/src/js/components/hideable-container.jsx' ;
import HideableContainer from '../lib/hideable-container.jsx' ;
import Decorator from './vaccine-context-decorator.jsx' ;
import VaccineMapSegment from './vaccine-map/vaccine-map-segment.jsx' ;
//import  VaccineSankeySegment  from './vaccine-sankey/vaccine-sankey-segment.jsx' ;
//import  VaccineSoccerSegment  from './vaccine-soccer/vaccine-soccer-segment.jsx' ;

//import  Loading  from 'lucify-commons/src/js/components/loading.jsx' ;
import Loading from '../lib/loading.jsx' ;


class VaccineMainContent extends React.Component {

    constructor(props) {
        super(props);
        //console.log("VaccineMainContent",props);
    }

    // displayName: 'VaccineMainContent'

    getMapSegment = () => {

        return (
            <HideableContainer visible={this.props.loaded}>
                <VaccineMapSegment {...this.props} />
            </HideableContainer>

        );
        
        
    }


    getLoadingSegment = () => {
        if (!this.props.loaded) {
            return (
                <div className="lucify-container">
                    <Loading progress={this.props.loadProgress}/>
                </div>
            );
        }
    }


    render() {
        // console.log("VaccineMainContent has props ",this.props);
        // providing a min-height will help the browser
        // to know that there will be a scrollbar
        //
        // this will help the browser to figure out the
        // correct width immediately without an extra
        // iteration


        //{this.props.loaded ? <VaccineMapSegment {...this.props} /> :null}
        // {this.props.mapEnabled ? null :(
        //   <div className="lucify-container">
        //       <Loading progress={this.props.loadProgress} />
        //    </div>
        //  )
        //  }

        //          style={{minHeight: 800}}>

        return (
            <div className="vaccine-main-content">
                {this.getLoadingSegment()}
                {this.getMapSegment()}
            </div>
        );
    }

}

// {this.getLoadingSegment()}
//  {this.getSankeySegment()}
//  {this.getSoccerSegment()}
export default Decorator(VaccineMainContent);
