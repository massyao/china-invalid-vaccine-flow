import React from 'react' ;
import _ from 'underscore' ;
import moment from 'moment' ;

import lucifyUtils from '../../lib/lucify-utils.jsx' ;


import VaccineConstants from '../../model/vaccine-constants.js' ;

function VaccinePlayContextDecorator(Component) {


    class VaccinePlayContextDecorator extends React.Component {

        constructor(props) {
            super(props);
            //console.log("VaccinePlayContextDecorator  has props ",props);
            console.log("moment([VaccineConstants.DATA_START_YEAR, VaccineConstants.DATA_START_MONTH, 1]).unix(),",moment([VaccineConstants.DATA_START_YEAR, VaccineConstants.DATA_START_MONTH, 1]).unix(),);
            // amormaid  key point    x-axis start point
            this.state = {
                stamp: moment([2017,1,1]).unix() || moment([VaccineConstants.DATA_START_YEAR, VaccineConstants.DATA_START_MONTH, 1]).unix(), // unix timestamps (seconds-precision)
                speed: this.getDefaultSpeed(),
                play: true,
                start: true

            };

            // console.log("VaccinePlayContextDecorator has stamp ",this.state.stamp);
        }

        // displayName: 'VaccinePlayContextDecorator'


        componentWillMount() {
            this.stamp = this.state.stamp;
        }


        getDefaultSpeed = () => {
            if (lucifyUtils.isSlowDevice()) {
                return 6;
            }

            return 2;
        }


        componentDidMount() {
            this.blockPlay = false;

            this.scheduleUnblockPlay = _.debounce(function () {
                this.unblockPlay();
            }, 500);

            if (this.state.start) {
                this.play();
            }
        }


        unblockPlay = () => {
            this.blockPlay = false;
            this.play();
        }


        play = () => {
            var increment = (60 * 60 * this.state.speed); // amormaid  handler speed change
            var newStamp = this.stamp + increment;

            if (newStamp <= VaccineConstants.DATA_END_MOMENT.unix()) {
                if (!this.blockPlay && this.state.play) {
                    this.updateStamp(newStamp);
                    requestAnimationFrame(this.play);
                }
            }
        }


        updateStamp = (stamp) => {
            this.stamp = stamp;

            // updating of stamp is not done with a
            // regular React state object, as this will
            // trigger the relatively costly render
            // operation for the whole subtree
            //
            // for the purposes of the animation it is
            // a bit costly even when shouldComponentUpdate
            // is implemented
            //
            // thus the stamp is updated by calling a special
            // updateForStamp() method for all relevant
            // subcomponents
            //
            this.refs.comp.updateForStamp(stamp);
        }


        handleStampChange = (newStamp) => {
            this.blockPlay = true;
            this.updateStamp(parseInt(newStamp));
            this.scheduleUnblockPlay();
        }


        handleSpeedChange = (newSpeed) => {
            this.setState({speed: newSpeed});
        }


        render() {
            return <Component
                ref='comp'
                {...this.state}
                handleSpeedChange={this.handleSpeedChange}
                handleStampChange={this.handleStampChange}
                addStampListener={this.addStampListener}
                {...this.props} />;
        }

    }


    return VaccinePlayContextDecorator;

}


export default VaccinePlayContextDecorator;
