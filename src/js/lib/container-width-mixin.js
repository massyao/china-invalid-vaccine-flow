// 实现onresize时的调整界面大小功能，暂时去掉此功能

//var OnResize = require('./react-window-mixins').OnResize;
import ReactDOM from "react-dom";

var ContainerWidthMixin = {

    //// displayName= 'ContainerWidthMixin';

    //mixins: [OnResize],


    getInitialState() {
        return {componentWidth: 0};
    }

    componentDidMount() {
        this.mounted = true;
        this.onResize();
    }


    onResize() {
        if (this.mounted !== true) {
            return;
        }

        this.componentWidth = ReactDOM.findDOMNode(this).clientWidth;

        this.setState({
            componentWidth: ReactDOM.findDOMNode(this).clientWidth
        });
    }

};

export default ContainerWidthMixin;
