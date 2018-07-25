import React from 'react' ;

import VaccineMapLineChart from './vaccine-map-line-chart.jsx' ;

class VaccineMapTimeLayer extends React.Component {

    constructor(props) {
        super(props);
        this.state = {stamp: null}

    }

    // displayName: 'VaccineMapTimeLayer'


    updateForStamp = (stamp) => {
        this.setState({stamp: stamp});
    }


    render() {
        if (!this.props.vaccineCountsModel) {
            return <div/>;
        }

        return (
            <div className='vaccine-map-time-layer'>
                <VaccineMapLineChart {...this.props} stamp={this.state.stamp}/>
            </div>
        );
    }

}

export default VaccineMapTimeLayer;
