import moment from 'moment' ;

import Vaccine from './vaccine.js' ;
import VaccineConstants from './vaccine-constants.js' ;
import utils from '../utils.js' ;


/*
 * Create list of vaccines based on given vaccine_count and regional data
 */
//  amormaid
var createFullList = function (mapModel, vaccine_countData, peoplePerPoint, randomStartPoint, smartSpreadEnabled) {
    var ret = [];
    var pared_contries = {}
    var skippedCountries = {};
    var skippedFutureDataCountries = {};

    if (vaccine_countData) {
        //console.log("vaccine_countData has elements of ",vaccine_countData.length);
        /*
        var  arr_sample = [];
        for(var i = 0;i<100;i++){
            arr_sample.push(vaccine_countData[i]);
        } */
        //console.table(arr_sample);


        //  mapModel    数据的模型对象
        //  peoplePerPoint  25
        //   randomStartPointfalse
        //    smartSpreadEnabled  true
        //console.log(mapModel,"\n", peoplePerPoint, "\n",randomStartPoint, "\n",smartSpreadEnabled)
        vaccine_countData.forEach(function (item) {
            if (!mapModel.containsCountry(item.ac)) {
                skippedCountries[item.ac] = true;
            } else if (!mapModel.containsCountry(item.oc)) {
                skippedCountries[item.oc] = true;
            } else {
                if (item.year > VaccineConstants.DATA_END_YEAR ||
                    (item.year == VaccineConstants.DATA_END_YEAR && (item.month - 1) > VaccineConstants.DATA_END_MONTH)) {
                    skippedFutureDataCountries[item.ac] = true;
                } else {
                    pared_contries[item.ac] = true;
                    // add vaccines for journey visualization
                    var vaccinesToAdd = Math.round(item.count / peoplePerPoint);
                    for (var i = 0; i < vaccinesToAdd; i++) {
                        ret.push(createVaccine(item.oc, item.ac, item.month - 1, item.year));
                    }
                }
            }
        });

        if (Object.keys(skippedCountries).length > 0) {
            console.log('Skipped the following countries that are not on map: ' + // eslint-disable-line
                Object.keys(skippedCountries).join(', '));

            console.log('这些省匹配到数据: ' + // eslint-disable-line
                Object.keys(pared_contries).join(', '));

        }
        if (Object.keys(skippedFutureDataCountries).length > 0) {
            console.log('Not showing data that is past ' + // eslint-disable-line
                VaccineConstants.DATA_END_MOMENT.format('ll') +
                ' from the following countries: ' +
                Object.keys(skippedFutureDataCountries).join(', '));

        }
    }

    return ret;

    /*
     * Create a vaccine
     */
    function createVaccine(startCountry, endCountry, month, year) {
        return new Vaccine(
            randomStartPoint ? mapModel.getRandomPointFromCountry(startCountry) : mapModel.getCenterPointOfCountry(startCountry),
            mapModel.getCenterPointOfCountry(endCountry),
            startCountry,
            endCountry,
            prepareVaccineSpeed(),
            prepareVaccineEndMoment(month, year),
            smartSpreadEnabled
        );
    }
};


/*
 * Get a speed for a new vaccine in km / h;
 */
var prepareVaccineSpeed = function () {
    return Math.random() * 2 + 4;
};


/*
 * Get an end moment for a random vaccine that
 * has arrived at given month (zero-based) and year
 */
var prepareVaccineEndMoment = function (month, year) {
    return moment(new Date(year, month, 1).getTime() +
        Math.random() * utils.daysInMonth(month, year) * 86400000); // ms in day
};


module.exports.createFullList = createFullList;
