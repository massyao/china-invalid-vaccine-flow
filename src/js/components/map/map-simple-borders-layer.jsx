import React from 'react' ;
import ReactDOM from "react-dom";
import d3 from 'd3' ;


class VaccineMapSimpleBordersLayer extends React.Component {

    constructor(props) {
        super(props);
    }

    // displayName: 'VaccineMapSimpleBordersLayer'


    componentDidMount() {
        this.draw();
    }


    draw = () => {
        var path = d3.geo.path().projection(this.props.projection);
        var context = ReactDOM.findDOMNode(this).getContext('2d');
        path.context(context);
        this.props.mapModel.featureData.features.map(function (feature) {
            path(feature);
        });

        context.fillStyle = '#1A202B';
        context.fill();
        context.strokeStyle = '#18b7b7';
        context.stroke();
        this.pendingUpdate = false;
    }


    componentWillReceiveProps(nextProps) {
        if (this.props.width !== nextProps.width) {
            this.pendingUpdate = true;
        }
    }

    componentDidUpdate() {
        if (this.pendingUpdate) {
            this.draw();
        }
    }

    render() {
        return (
            <canvas className="vaccine-map-simple-borders-layer"
                    width={this.props.width} height={this.props.height}/>
        );
    }

}

export default VaccineMapSimpleBordersLayer;
