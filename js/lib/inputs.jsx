import React from "react";

export default class Inputs extends React.Component {
    // displayName: 'Inputs';


    render() {
        return (
            <div className="inputs">
                {this.props.children}
            </div>
        );
    }

}
