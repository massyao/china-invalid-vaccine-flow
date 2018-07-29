import React from 'react' ;

/*
import  Inputs  from 'lucify-commons/src/js/components/inputs.jsx' ;
import  DividedCols  from 'lucify-commons/src/js/components/divided-cols.jsx' ;
import  FormRow  from 'lucify-commons/src/js/components/nice-form-row.jsx' ;
import  Slider  from 'lucify-commons/src/js/components/nice-slider.jsx' ;
import  lucifyUtils  from 'lucify-commons/src/js/lucify-utils.jsx' ;
import  ComponentWidthMixin  from 'lucify-commons/src/js/components/container-width-mixin.js' ;
*/

import Inputs from '../../lib/inputs.jsx' ;
import DividedCols from '../../lib/divided-cols.jsx' ;
import FormRow from '../../lib/nice-form-row.jsx' ;
import Slider from '../../lib/nice-slider.jsx' ;
import lucifyUtils from '../../lib/lucify-utils.jsx' ;
//import  ComponentWidthMixin  from '../../lib/container-width-mixin.js' ;


import VaccineMap from './responsive-vaccine-map.jsx' ;
import VaccinePlayContextDecorator from './vaccine-play-context-decorator.jsx' ;
import TimeLayer from './vaccine-map-time-layer.jsx' ;
import vaccineConstants from '../../model/vaccine-constants.js' ;

//console.log(VaccinePlayContextDecorator);

class VaccineMapSegment extends React.Component {

    constructor(props) {
        super(props);
    }

    // displayName: 'VaccineMapSegment'


    //mixins: [ComponentWidthMixin],


    updateForStamp = (stamp) => {
        this.refs.rmap.updateForStamp(stamp);
        this.refs.time.updateForStamp(stamp);
    }


    interactionsEnabled = () => {
        return !lucifyUtils.isSlowDevice();
    }


    getPeoplePerPointText = () => {

        if (lucifyUtils.isSlowDevice()) {
            return   <span>  Each moving point on the map represents10000 vaccines.  </span>;
        }else{
            return    <span> Each moving point on the map represents  5000 vaccines.  </span>;
        }

    }


    getCountsInstruction = () => {
        if (vaccineConstants.labelShowBreakPoint < this.componentWidth) {
            return (
                <span> The counts shown on hover represent the number  of vaccine that flows in and out since 2012.</span>
            );
        }
        return null;
    }


    getInteractionsInstruction = () => {
        if (this.interactionsEnabled()) {
            return (
                <div>
                    <p className="first">
                        Hover over countries to
                        show details. Click on a country to
                        lock the selection.
                        {' '}{this.getCountsInstruction()}
                    </p>

                    <p className="last">
                        The line chart displays the total rate of
                        vaccine_count seekers over time. Hover over the
                        chart to move the map in time.
                    </p>
                </div>
            );
        } else {
            return (
                <p className="first last">
                    The line chart displays the total rate of
                    vaccine_count seekers over time. Hover over the
                    chart to move the map in time.
                </p>
            );
        }
    }


    render() {

        //console.log(this.props);

        return (

            <div className="vaccine-map-segment">
                <VaccineMap ref="rmap"
                            {...this.props}
                            interactionsEnabled={this.interactionsEnabled()}/>

                <TimeLayer
                    ref="time"
                    onMouseOver={this.props.handleStampChange}
                    stamp={this.props.stamp}
                    vaccineCountsModel={this.props.vaccineCountsModel}
                    mapModel={this.props.mapModel}/>
                {
                    /*
              <Inputs>
                <div className="lucify-container">

                  <DividedCols
                  first={
                    <div className="inputs__instructions">
                      <h3>Instructions</h3>
                      <p className="first">
                        The map below shows the flow of
                        {' '}<b>vaccine_count seekers</b>{' '}
                        to
                        {' '}<b>European countries</b>{' '}
                        over time.
                      </p>

                      <p className="last">
                        {this.getPeoplePerPointText()}
                      </p>
                    </div>
                  }
                  second={
                    <div className="inputs__instructions">
                      <FormRow
                      title={<div>Speed</div>}
                      input={<Slider min={1} max={100}
                      defaultValue={this.props.speed}
                      onChange={this.props.handleSpeedChange} />} />

                      {this.getInteractionsInstruction()}
                    </div>
                  } />
                </div>
              </Inputs>
                 */
                }

            </div>
        );
    }

}

export default VaccinePlayContextDecorator(VaccineMapSegment);
