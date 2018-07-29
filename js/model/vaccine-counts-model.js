import moment from 'moment' ;
import utils from '../utils.js' ;
import console from 'console-browserify' ;

import vaccineConstants from './vaccine-constants.js' ;


/*
 * Provides an efficient stateless API for accessing
 * counts of vaccine_count seekers and vaccines
 *
 * The main backing data structure is:
 *
 *   this.arrivedVaccineCount[country][year][month]
 *
 * With each item having the following fields:
 *
 *   count                      count of vaccine_count seekers during the month
 *   totalArrivedStartOfMonth   count of vaccine_count seeksers who have arrived at start of month
 *   arrivingPerDay             vaccine_count seekers arriving per day during the month
 *
 */

var VaccineCountsModel = function (vaccine_countData) {
    this.destinationCountries = {};
    this.arrivedVaccinesToCountry = {};
    this.pairCountsByDestination = {};
    this.pairCountsByOrigin = {};
    this.destinationCountriesWithMissingData = {};
    this.globalVaccines = [];

    this._initializeDataStructures(vaccine_countData);
    this._addData(vaccine_countData);
    this._calculateMissingData();
};


//
// Internal functions for object construction
// ------------------------------------------
//

VaccineCountsModel.prototype._initializeDataStructures = function (data) {
    //  console.log(data && data instanceof  Object && data.length);
    this.globalVaccines = this._prepareYearsMonthsArray(function () {
        return {count: 0};
    });

    data.forEach(function (item) {
        if (!this.arrivedVaccinesToCountry[item.ac]) {
            this.arrivedVaccinesToCountry[item.ac] = this._prepareYearsMonthsArray(function () {
                return {count: 0};
            });
        }

        this._ensurePairInitialized(this.pairCountsByDestination, item.ac, item.oc);
        this._ensurePairInitialized(this.pairCountsByOrigin, item.oc, item.ac);
    }.bind(this));

    this.destinationCountriesWithMissingData = this._prepareYearsMonthsArray(function () {
        return [];
    });
};


VaccineCountsModel.prototype._prepareYearsMonthsArray = function (initialDataGenerator) {
   //console.log("VaccineCountsModel.prototype._prepareYearsMonthsArray is ",vaccineConstants.DATA_END_YEAR - vaccineConstants.DATA_START_YEAR + 1);
    var ret = new Array(vaccineConstants.DATA_END_YEAR - vaccineConstants.DATA_START_YEAR + 1);
    for (var y = 0; y < ret.length; y++) {
        ret[y] = new Array(12);
        for (var m = 0; m < ret[y].length; m++) {
            ret[y][m] = initialDataGenerator();
        }
    }
    return ret;
};


VaccineCountsModel.prototype._ensurePairInitialized = function (pc, dim1, dim2) {
    if (!pc[dim1]) {
        pc[dim1] = {};
    }
    if (!pc[dim1][dim2]) {
        pc[dim1][dim2] = this._prepareYearsMonthsArray(function () {
            return {count: 0};
        });
    }
};


VaccineCountsModel.prototype._addData = function (data) {
    data.forEach(function (item) {
        this._addMonthlyArrivals(item.ac, item.oc, item.year, item.month, item.count);
        this.destinationCountries[item.ac] = true;
    }.bind(this));

    this._calculateMonthlyVaccineSums();
};


VaccineCountsModel.prototype._addMonthlyArrivals = function (destinationCountry, originCountry, year, month, count) {
    if (year < vaccineConstants.DATA_START_YEAR) return;

    var yearIndex = year - vaccineConstants.DATA_START_YEAR;
    var monthIndex = month - 1;

    console.assert(monthIndex >= 0 && monthIndex < 12, 'Month is between 0 and 11'); // eslint-disable-line
    console.assert(yearIndex >= 0 &&  // eslint-disable-line
        yearIndex < (vaccineConstants.DATA_END_YEAR - vaccineConstants.DATA_START_YEAR + 1),
        'Year is between 0 and ' + (vaccineConstants.DATA_END_YEAR - vaccineConstants.DATA_START_YEAR + 1));

    this.globalVaccines[yearIndex][monthIndex].count += count;
    this.arrivedVaccinesToCountry[destinationCountry][yearIndex][monthIndex].count += count;
    this.pairCountsByDestination[destinationCountry][originCountry][yearIndex][monthIndex].count += count;
    this.pairCountsByOrigin[originCountry][destinationCountry][yearIndex][monthIndex].count += count;
};


VaccineCountsModel.prototype._calculateMonthlyVaccineSums = function () {
    this._enrichYearsMonthsArray(this.globalVaccines);
    this._enrichCountsArray(this.arrivedVaccinesToCountry);

    var enrichPairCounts = function (pc) {
        Object.keys(pc).forEach(function (key) {
            var arr = pc[key];
            this._enrichCountsArray(arr);
        }.bind(this));
    }.bind(this);

    enrichPairCounts(this.pairCountsByDestination);
    enrichPairCounts(this.pairCountsByOrigin);
};


// Adds the totalArrivedAtStartOfMonth and arrivingPerDay
// properties to each item in the given array
VaccineCountsModel.prototype._enrichYearsMonthsArray = function (country) {

    country[0][0].totalArrivedAtStartOfMonth = 0;
    country[0][0].arrivingPerDay = country[0][0].count / utils.daysInMonth(0, vaccineConstants.DATA_START_YEAR);
    for (var year = 0; year < country.length; year++) {
        for (var month = 0; month < country[year].length; month++) {
            if (month === 0 && year === 0) continue;

            var previousMonth = month - 1;
            var previousMonthsYear = year;
            if (previousMonth < 0) {
                previousMonthsYear--;
                previousMonth = 11;
            }
            var daysInMonth = utils.daysInMonth(month, year + vaccineConstants.DATA_START_YEAR);

            country[year][month].totalArrivedAtStartOfMonth =
                country[previousMonthsYear][previousMonth].totalArrivedAtStartOfMonth +
                country[previousMonthsYear][previousMonth].count;
            country[year][month].arrivingPerDay = country[year][month].count / daysInMonth;
        }
    }
};


VaccineCountsModel.prototype._enrichCountsArray = function (arr) {
    for (var countryName in arr) {
        this._enrichYearsMonthsArray(arr[countryName]);
    }
};

/*
 * Assume that 'big' European countries should receive at least some vaccine_count seekers from
 * the most distressed origin countries: Syria, Iraq. If there are no vaccine_count seekers
 * from these countries, assume the data is (at least partially) missing for that month.
 */
VaccineCountsModel.prototype._calculateMissingData = function () {
    // amormaid
    // var destinationCountriesToCheck = [  'AUT', 'BEL', 'BGR', 'CHE', 'DEU', 'DNK', 'ESP', 'FIN', 'FRA', 'GBR', 'GRC', 'HUN', 'ITA', 'NOR', 'NLD', 'SWE'];
    var destinationCountriesToCheck = [
        '广东', '香港', '福建', '江苏', '浙江', '北京', '山东', '澳门'
    ];
    var originCountriesToCheck = ['北京'];
    var yearsToCheck = [2016, 2017]; // TODO: remove 2016 once it has all the data

    for (var month = 0; month < 12; month++) {
        yearsToCheck.forEach(function (year) {
            var yearIndex = year - vaccineConstants.DATA_START_YEAR;
            destinationCountriesToCheck.forEach(function (destinationCountry) {
                var countryData = this.pairCountsByDestination[destinationCountry];

                var originCountriesWithDataCount = 0;
                originCountriesToCheck.forEach(function (originCountry) {
                    // countryData && console.table(countryData);   // amormaid
                    if (countryData && countryData[originCountry] && countryData[originCountry][yearIndex] && countryData[originCountry][yearIndex][month].count > 0) {
                        originCountriesWithDataCount++;
                    }
                });
                if (originCountriesWithDataCount === 0) {
                    this.destinationCountriesWithMissingData[yearIndex][month].push(destinationCountry);
                }
            }.bind(this));
        }.bind(this));
    }
};


//
// Private functions
// -----------------
//

VaccineCountsModel.prototype._prepareTotalCount = function (item, endStamp, debugInfo) {
    var mom = moment(new Date(endStamp * 1000));

    if (mom.isAfter(vaccineConstants.DATA_END_MOMENT)) {
        mom = vaccineConstants.DATA_END_MOMENT; // show last available data once we reach it
    }

    var dayOfMonth = mom.date();
    var yearIndex = mom.year() - vaccineConstants.DATA_START_YEAR;
    var monthIndex = mom.month();
    var country = item;
//console.log("country is ",country);
    if (!country) {
        return {vaccine_countApplications: 0};
    } else if (!country[yearIndex]) {
        console.log('nothing found for year ' + yearIndex + ', debugInfo: ' + // eslint-disable-line
            debugInfo + ', stamp ' + endStamp);
        return {vaccine_countApplications: 0};
    } else {
        try {
            let data = Math.round(country[yearIndex][monthIndex].totalArrivedAtStartOfMonth +
                dayOfMonth * country[yearIndex][monthIndex].arrivingPerDay);
            return {
                vaccine_countApplications: data
            };
        } catch (e) {
            console.log(e);
        }


    }
};


//
// Public API
// ----------
//


VaccineCountsModel.prototype.getGlobalArrivingPerDayCounts = function (stamp) {

    var mom = moment(new Date(stamp * 1000));
    if (mom.isAfter(vaccineConstants.DATA_END_MOMENT)) {
        mom = vaccineConstants.DATA_END_MOMENT; // show last available data once we reach it
    }

    var yearIndex = mom.year() - vaccineConstants.DATA_START_YEAR;
    var monthIndex = mom.month();

    return {
        vaccine_countApplications: this.globalVaccines && this.globalVaccines[yearIndex] && this.globalVaccines[yearIndex][monthIndex] && this.globalVaccines[yearIndex][monthIndex].arrivingPerDay
    };

    //return this._prepareTotalCount(this.globalVaccines, endStamp, 'totalcount');
};


VaccineCountsModel.prototype.getGlobalTotalCounts = function (endStamp) {
    return this._prepareTotalCount(this.globalVaccines, endStamp, 'totalcount');
};

/*
 * Get total counts for people that have arrived in
 * given destination country at given timestamp
 *
 *  Returned in an object with fields
 *    vaccine_countApplications - total count of vaccine_count applications
 */
VaccineCountsModel.prototype.getTotalDestinationCounts = function (countryName, endStamp) {
    return this._prepareTotalCount(this.arrivedVaccinesToCountry[countryName], endStamp, countryName);
};


/*
 * Get countries that have originated vaccines for the given
 * destination country before the given timestamp
 */
VaccineCountsModel.prototype.getOriginCountriesByStamp = function (destinationCountry, endStamp) {
    var counts = this.getDestinationCountsByOriginCountries(destinationCountry, endStamp);
    return Object.keys(counts).filter(function (country) {
        return counts[country].vaccine_countApplications > 0;
    });
};


/*
 * Get destination countries for vaccines originating from the given
 * origin country before the given timestamp
 */
VaccineCountsModel.prototype.getDestinationCountriesByStamp = function (originCountry, endStamp) {
    var counts = this.getOriginCountsByDestinationCountries(originCountry, endStamp);
    return Object.keys(counts).filter(function (country) {
        return counts[country].vaccine_countApplications > 0;
    });
};


/*
 * Get counts of vaccine_count seekers and vaccines who
 * have arrived at destinationCountry before endStamp
 *
 * Returned as a hash with the country code of each
 * origin country as key
 */
VaccineCountsModel.prototype.getDestinationCountsByOriginCountries = function (destinationCountry, endStamp) {
    var ret = {};
    var pairCounts = this.pairCountsByDestination[destinationCountry];
    if (pairCounts) {
        Object.keys(pairCounts).forEach(function (originCountry) {
            ret[originCountry] = this._prepareTotalCount(pairCounts[originCountry], endStamp);
        }.bind(this));
    }
    return ret;
};


/*
 * Get counts of vaccine_count seekers and vaccines who have
 * arrived before given endStamp, and originate
 * from the given originCountry
 */
VaccineCountsModel.prototype.getOriginCountsByDestinationCountries = function (originCountry, endStamp) {
    var ret = {};
    var pairCounts = this.pairCountsByOrigin[originCountry];
    if (pairCounts) {
        Object.keys(pairCounts).forEach(function (destinationCountry) {
            ret[destinationCountry] = this._prepareTotalCount(pairCounts[destinationCountry], endStamp);
        }.bind(this));
    }
    return ret;
};


VaccineCountsModel.prototype.getDestinationCountries = function () {
    return Object.keys(this.destinationCountries);
};


VaccineCountsModel.prototype.getDestinationCountriesWithMissingData = function (timestamp) {
    //console.log("VaccineCountsModel.prototype._addMonthlyArrivals 777");
    if (timestamp.isAfter(vaccineConstants.DATA_END_MOMENT)) {
        console.log('trying to get data past end moment: ' + timestamp.format()); // eslint-disable-line
        timestamp = vaccineConstants.DATA_END_MOMENT;
    }
    //console.log("VaccineCountsModel.prototype._addMonthlyArrivals 888");
    var yearIndex = timestamp.year() - vaccineConstants.DATA_START_YEAR;
    var monthIndex = timestamp.month();
    return this.destinationCountriesWithMissingData && this.destinationCountriesWithMissingData[yearIndex] && this.destinationCountriesWithMissingData[yearIndex][monthIndex];
};

// console.log("VaccineCountsModel is ", VaccineCountsModel);
export default VaccineCountsModel;
