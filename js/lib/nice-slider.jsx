import React from 'react' ;

import noUiSlider from './nouislider.js' ;


class NiceSlider extends React.Component {

    constructor(props) {
        super(props);
    }

    // displayName: 'NiceSlider'


    componentDidMount() {
        // TODO: use ReactDOM once we upgrade to React 0.14
        var slider = React.findDOMNode(this.refs.slider);

        var settings = {
            start: [this.props.defaultValue],
            range: {
                'min': this.props.min,
                'max': this.props.max
            }
        };

        if (this.props.step != null) {
            settings.step = this.props.step;
        }

        noUiSlider.create(slider, settings);

        slider.noUiSlider.on('update', function () {
            var value = Math.round(slider.noUiSlider.get());

            if (this.props.onChange) {
                this.props.onChange(value);
            }
        }.bind(this));
    }


    render() {
        return (
            <div className="nice-slider">
                <div ref="slider"/>
            </div>
        );
    }

}

NiceSlider.getDefaultProps = {
    defaultValue: 0

}


export default NiceSlider;
