import React from 'react' ;
import VaccineMap from './vaccine-map.jsx' ;

//import  ComponentWidthMixin  from 'lucify-commons/src/js/components/container-width-mixin.js' ;
//import  ComponentWidthMixin  from '../../lib/container-width-mixin.js' ;


class ResponsiveVaccineMap extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            componentWidth: window.innerWidth,

        };
    }

    // displayName: 'ResponsiveVaccineMap'

    //mixins: [ComponentWidthMixin],


    getWidth = () => {
        return this.state.componentWidth;
    }


    getHeight = () => {
        return this.state.componentWidth;
    }


    updateForStamp = (stamp) => {
        this.refs.rmap.updateForStamp(stamp);
    }


    render() {
        // console.log("responsive vaccine map ",this.props);
        return (
            <div>
                <VaccineMap ref="rmap" {...this.props}
                            width={this.getWidth()}
                            height={this.getHeight()}/>
            </div>
        );
    }

}

export default ResponsiveVaccineMap;
