import React from 'react' ;


class VaccineDataUpdated extends React.Component {

    constructor(props) {
        super(props);
    }

    // displayName: 'VaccineDataUpdated'


    shouldComponentUpdate() {
        return false;
    }

    render() {
        return (
            <div className="vaccine-updated-at">
                Data updated<br/>
                {this.props.updatedAt.format('MMM D, YYYY')}
            </div>
        );
    }

}

export default VaccineDataUpdated;
