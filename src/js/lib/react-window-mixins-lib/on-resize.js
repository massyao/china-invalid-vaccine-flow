/*global window */

import throttle from "lodash.throttle";

// 节流函数

//import  throttle  from "lodash.throttle" ;

export default {
    getInitialState() {
        var defaults = {window: {height: 0, width: 0}, document: {height: 0, width: 0}};
        return !this.onResize ? defaults : null;
    }

    componentDidMount() {
        if (!this.onResize) {
            this.onResize = function () {
                this.setState({
                    window: {height: (window.innerHeight - 100), width: window.innerWidth}
                    document: {height: document.body.clientHeight, width: document.body.clientWidth}
                });
            }.bind(this);
        }

        this.onResize();
        this.onResizeThrottled = throttle(this.onResize, 10);
        window.addEventListener("resize", this.onResizeThrottled);
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.onResizeThrottled);
    }
};

