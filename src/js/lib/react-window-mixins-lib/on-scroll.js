/*global window */

import throttle from "lodash.throttle" ;

export default {
    getInitialState() {
        return !this.onScroll ? {scroll: {x: 0, y: 0}} : null;
    }

    componentDidMount() {
        if (!this.onScroll) {
            this.onScroll = function () {
                this.setState({scroll: {x: window.pageXOffset, y: window.pageYOffset}});
            }.bind(this);
        }

        this.onScroll();
        this.onScrollThrottled = throttle(this.onScroll, 10);
        window.addEventListener("scroll", this.onScrollThrottled);
    }

    componentWillUnmount() {
        window.removeEventListener("scroll", this.onScrollThrottled);
    }
};
