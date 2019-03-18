import moment from 'moment' ;
import Vec2 from 'vec2' ;
import randgen from 'randgen' ;

var KILOMETERS_PER_DEGREE = 111;

// single vaccine
var Vaccine = function (startPoint, endPoint, originCountry, destinationCountry,
                        speed, endMoment, smartSpreadEnabled) {

    this.startPoint = startPoint;
    this.endPoint = endPoint;
    this.originCountry = originCountry;
    this.destinationCountry = destinationCountry;
    this.speed = speed;
    this.endMoment = endMoment;
    this.totalTravelTime = this.getTravelDistance() / this.speed;
    this.smartSpreadEnabled = smartSpreadEnabled;

    if (smartSpreadEnabled) {
        this.sideDeviation = randgen.rnorm(0, 1); // mean, std. deviation
        this.maxSideDeviation = 0.3;
    }

    this.startMoment = this._getStartMoment();

    // these are unix second-precision timestamp
    this.startMomentUnix = this.startMoment.unix();
    this.endMomentUnix = this.endMoment.unix();

    this.directionVector = Vec2(
        this.startPoint[0] - this.endPoint[0],
        this.startPoint[1] - this.endPoint[1])
        .normalize();
};


Vaccine.prototype.getStartMoment = function () {
    return this.startMoment;
};


Vaccine.prototype._getStartMoment = function () {
    var ret = moment(this.endMoment);
    return ret.subtract(this.getTravelTime(), 'hours');
};


Vaccine.prototype.setRouteVaccineCount = function (count) {
    this.maxSideDeviation = Math.min(Math.max(0.3, count / 3000), 1.0);
};


Vaccine.prototype.getTravelTime = function () {
    return this.totalTravelTime;
};


/*
 * Get the distance travelled by the given
 * vaccine in kilometers
 */
Vaccine.prototype.getTravelDistance = function () {
    var x = this.endPoint[0] - this.startPoint[0];
    var y = this.startPoint[1] - this.endPoint[1];
    return Math.sqrt(x * x + y * y) * KILOMETERS_PER_DEGREE;
};


Vaccine.prototype.isPastStartMoment = function (mom) {
    return mom.unix() > this.startMomentUnix;
};


Vaccine.prototype.getLocation = function (stamp) {
    if (stamp > this.endMomentUnix) {
        return this.endPoint;
    }

    var hours = (this.startMomentUnix - stamp) / (60 * 60);
    var distance = hours * this.speed / KILOMETERS_PER_DEGREE;
    var v = [
        this.startPoint[0] + this.directionVector.x * distance,
        this.startPoint[1] + this.directionVector.y * distance
    ];

    if (this.smartSpreadEnabled) {
        var portionOfJourney = hours / this.getTravelTime();
        var sideMotionAmount = Math.sin(portionOfJourney * Math.PI) * this.sideDeviation * this.maxSideDeviation;
        v[0] += -this.directionVector.y * sideMotionAmount; // perpendicular = (-y, x)
        v[1] += this.directionVector.x * sideMotionAmount;
    }

    return v;
};


export default Vaccine;
