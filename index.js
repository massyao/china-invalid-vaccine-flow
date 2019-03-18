import 'core-js/es6/map';
import 'core-js/es6/set';
import 'core-js/es6/typed';
//import 'core-js/fn/object/define-property';

import React from "react";
import ReactDOM from "react-dom";
import "./scss/index.scss";

import Main_content from "./js/components/main-content.js";

//ReactDOM.render(
ReactDOM.render(
    <Main_content/>,
    document.getElementById("content")
);