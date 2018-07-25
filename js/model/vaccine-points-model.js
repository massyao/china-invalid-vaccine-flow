import console from 'console-browserify' ;


var VaccinePointsModel = function (vaccines, randomStartPoint, smartSpreadEnabled) {

    this.randomStartPoint = randomStartPoint;
    this.smartSpreadEnabled = smartSpreadEnabled;

    this.vaccines = vaccines;
    this.activeVaccines = [];
    this.stamp = 0;
    this.vaccineIndex = 0;
    this.vaccinesOnPath = {};

    console.time('vaccine sorting'); // eslint-disable-line
    this.vaccines.sort(function (a, b) {
        return a.startMomentUnix - b.startMomentUnix;
    });
    console.timeEnd('vaccine sorting'); // eslint-disable-line
};


// Public API
// ----------

VaccinePointsModel.prototype.getNumVaccinesOnPath = function (startCountry, endCountry, stamp) {
    this._moveToStamp(stamp);
    return this.vaccinesOnPath[startCountry][endCountry].length;
};


VaccinePointsModel.prototype.forEachActiveVaccine = function (stamp, func) {
    this._moveToStamp(stamp);
    var length = this.activeVaccines.length;
    for (var i = 0; i < length; i++) {
        func(this.activeVaccines[i]);
    }
};


// Private functions
// -----------------

VaccinePointsModel.prototype._update = function (newStamp) {
    if (newStamp > this.stamp) {
        this._updateForward(newStamp);
    } else {
        this._updateBackward(newStamp);
    }
    this.stamp = newStamp;
};


// Moving backwards not that efficient
// as it will iterate through the whole array of vaccines
VaccinePointsModel.prototype._updateBackward = function (stamp) {
    this.activeVaccines = this.vaccines.filter(function (r) {
        return r.startMomentUnix < stamp && r.endMomentUnix > stamp;
    });

    var latestStamp = 0;
    var latestVaccine;
    this.vaccinesOnPath = {};
    this.activeVaccines.forEach(function (r) {
        r.setRouteVaccineCount(this._increaseVaccineEnRoute(r.originCountry, r.destinationCountry));

        if (r.startMomentUnix > latestStamp) {
            latestStamp = r.startMomentUnix;
            latestVaccine = r;
        }
        latestStamp = Math.max(latestStamp, r.startMomentUnix);
    }.bind(this));

    this.vaccineIndex = this.vaccines.indexOf(latestVaccine);
};


// Moving forwards is efficient
VaccinePointsModel.prototype._updateForward = function (stamp) {
    var r;

    // add new ones
    while ((r = this.vaccines[this.vaccineIndex]) != null && r.startMomentUnix < stamp) {
        if (this.smartSpreadEnabled) {
            r.setRouteVaccineCount(this._increaseVaccineEnRoute(r.originCountry, r.destinationCountry));
        }
        this.activeVaccines.push(r);
        this.vaccineIndex++;
    }

    // update current ones
    var stillActive = [];
    var length = this.activeVaccines.length;

    for (var i = 0; i < length; i++) {
        r = this.activeVaccines[i];
        if (r.endMomentUnix < stamp) {
            if (this.smartSpreadEnabled) {
                this.vaccinesOnPath[r.originCountry][r.destinationCountry]--;
            }
        } else {
            stillActive.push(r);
        }
    }

    this.activeVaccines = stillActive;
};


VaccinePointsModel.prototype._increaseVaccineEnRoute = function (start, end) {
    if (!(start in this.vaccinesOnPath)) {
        this.vaccinesOnPath[start] = {};
    }

    if (!(end in this.vaccinesOnPath[start])) {
        this.vaccinesOnPath[start][end] = 1;
    } else {
        this.vaccinesOnPath[start][end]++;
    }

    return this.vaccinesOnPath[start][end];
};


VaccinePointsModel.prototype._moveToStamp = function (stamp) {
    if (this.stamp !== stamp) {
        this._update(stamp);
    }
};


export default VaccinePointsModel;
