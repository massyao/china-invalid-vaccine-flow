import React from 'react' ;


class FormRow extends React.Component {

    constructor(props) {
        super(props);
    }

    // displayName: 'NiceFormRow'


    getInput = () => {
        if (this.props.value) {
            return (
                <div className="nice-form-row__input-inner">
                    <div className="nice-form-row__input-main">
                        {this.props.input}
                    </div>
                    <div className="nice-form-row__input-value">
                        {this.props.value}
                    </div>
                </div>
            );
        }
        return this.props.input;
    }


    render() {
        return (
            <div className="nice-form-row">
                <div className="nice-form-row__title">
                    {this.props.title}
                </div>
                <div className="nice-form-row__input">
                    {this.getInput()}
                </div>
            </div>
        );
    }

}

export default FormRow;
