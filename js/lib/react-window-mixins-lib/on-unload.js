/*global window */

export default {
    componentDidMount() {
        if (this.onUnload) {
            window.addEventListener("unload", this.onUnload);
        }
        if (this.onBeforeUnload) {
            window.addEventListener("beforeunload", this.onBeforeUnload);
        }
    }

    componentWillUnmount() {
        if (this.onUnload) {
            window.removeEventListener("unload", this.onUnload);
        }
        if (this.onBeforeUnload) {
            window.removeEventListener("beforeunload", this.onBeforeUnload);
        }
    }
};
