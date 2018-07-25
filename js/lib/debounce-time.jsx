import utils from './lucify-utils.jsx' ;


/*
 * Get debounce time
 *
 * first parameter is the time that should be used for
 * a slow device
 *
 * second parameter is the time that should be used for
 * a fast device
 */
var debounceTime = function (slowDeviceTime, fastDeviceTime) {
    var ret = utils.isSlowDevice() ? slowDeviceTime : fastDeviceTime;
    //console.log("debounceTime is " + ret);
    return ret;
};


export default debounceTime;
