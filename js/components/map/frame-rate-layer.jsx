import React from 'react' ;
import d3 from 'd3' ;

// only used for testing, this will be disabled
// in production

class FrameRateLayer extends React.Component {

    constructor(props) {
        super(props);
    }

    // displayName: 'FrameRateLayer'


    componentWillMount() {
        this.smoothFps = 1;
    }


    componentDidMount() {
        this.sel = d3.select(React.findDOMNode(this.refs.fpsVal));
    }


    update = () => {
        var diff = Date.now() - this.previousStamp;
        this.previousStamp = Date.now();

        var fps = 1000 / diff;

        if (isFinite(fps)) {
            var smoothing = 20;
            this.smoothFps = this.smoothFps
                + (fps - this.smoothFps) / smoothing;
        }

        this.sel.text(this.smoothFps.toFixed(1));
    }


    render() {
        return (
            <div className="frame-rate-layer" style={{padding: '1rem'}}>
                <span ref="fpsVal">?</span> fps
            </div>
        );
    }

}

export default FrameRateLayer;
