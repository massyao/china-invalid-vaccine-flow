import inside from 'point-in-polygon' ;
import Polygon from 'polygon' ;
import Vec2 from 'vec2' ;
import _ from 'underscore' ;
import countries from 'i18n-iso-countries' ;
import d3 from 'd3' ;

var MapModel = function (featureData) {
    //  if(featureData){
    // console.log("---------------------------------------");
    //  console.table(featureData);
    /*

    Array(34)
    0:geometry:{type: "Polygon", coordinates: Array(1)}
    id:"xin_jiang"
    properties:{name: "新疆", cp: Array(2), childNum: 18}
    type:"Feature"
    __proto__:Object
    1:{type: "Feature", id: "xi_zang", properties: {…}, geometry: {…}}
    2:{type: "Feature", id: "nei_meng_gu", properties: {…}, geometry: {…}}
    3:{type: "Feature", id: "qing_hai", properties: {…}, geometry: {…}}
    4:{type: "Feature", id: "si_chuan", properties: {…}, geometry: {…}}
    5:{type: "Feature", id: "hei_long_jiang", properties: {…}, geometry: {…}}
    6:{type: "Feature", id: "gan_su", properties: {…}, geometry: {…}}
    7:{type: "Feature", id: "yun_nan", properties: {…}, geometry: {…}}
    8:{type: "Feature", id: "guang_xi", properties: {…}, geometry: {…}}
    9:{type: "Feature", id: "hu_nan", properties: {…}, geometry: {…}}
    10:{type: "Feature", id: "shan_xi_1", properties: {…}, geometry: {…}}
    11:{type: "Feature", id: "guang_dong", properties: {…}, geometry: {…}}
    12:{type: "Feature", id: "ji_lin", properties: {…}, geometry: {…}}
    13:{type: "Feature", id: "he_bei", properties: {…}, geometry: {…}}
    14:{type: "Feature", id: "hu_bei", properties: {…}, geometry: {…}}
    15:{type: "Feature", id: "gui_zhou", properties: {…}, geometry: {…}}
    16:{type: "Feature", id: "shan_dong", properties: {…}, geometry: {…}}
    17:{type: "Feature", id: "jiang_xi", properties: {…}, geometry: {…}}
    18:{type: "Feature", id: "he_nan", properties: {…}, geometry: {…}}
    19:{type: "Feature", id: "liao_ning", properties: {…}, geometry: {…}}
    20:{type: "Feature", id: "shan_xi_2", properties: {…}, geometry: {…}}
    21:{type: "Feature", id: "an_hui", properties: {…}, geometry: {…}}
    22:{type: "Feature", id: "fu_jian", properties: {…}, geometry: {…}}
    23:{type: "Feature", id: "zhe_jiang", properties: {…}, geometry: {…}}
    24:{type: "Feature", id: "jiang_su", properties: {…}, geometry: {…}}
    25:{type: "Feature", id: "chong_qing", properties: {…}, geometry: {…}}
    26:{type: "Feature", id: "ning_xia", properties: {…}, geometry: {…}}
    27:{type: "Feature", id: "hai_nan", properties: {…}, geometry: {…}}
    28:{type: "Feature", id: "tai_wan", properties: {…}, geometry: {…}}
    29:{type: "Feature", id: "bei_jing", properties: {…}, geometry: {…}}
    30:{type: "Feature", id: "tian_jin", properties: {…}, geometry: {…}}
    31:{type: "Feature", id: "shang_hai", properties: {…}, geometry: {…}}
    32:{type: "Feature", id: "xiang_gang", properties: {…}, geometry: {…}}
    33:{type: "Feature", id: "ao_men", properties: {…}, geometry: {…}}
    length:34


    */

    //   featureData  为topojson里的feature对象
    this.featureData = featureData;

    this._countryFeatureCache = {};
    this._countryBordersCache = {};
    this._countryCentersCache = {};
    this._countryBoundsCache = {};
    this._labelFeatureCache = {};

    this.initialize();
};


MapModel.prototype.initialize = function () {
    // the centroid isn't always good. fix for these countries:
    this._countryCentersCache['FRA'] = [2.449486512892406, 46.62237366531258];
    this._countryCentersCache['SWE'] = [15.273817, 59.803497];
    this._countryCentersCache['FIN'] = [25.356445, 61.490593];
    this._countryCentersCache['NOR'] = [9.006239, 60.975869];
    this._countryCentersCache['DEU'] = [9.6, 50.9];
    this._countryCentersCache['GBR'] = [-1.538086, 52.815213];
    this._countryCentersCache['GRC'] = [21.752930, 39.270271];
    this._countryCentersCache['RUS'] = [51.328125, 56.641127];
    this._countryCentersCache['HUN'] = [18.632813, 47.159840];
};

MapModel.prototype.containsCountry = function (country) {
    return this.getFeatureForCountry(country) != null;
};

MapModel.prototype.getFeatureForCountry = function (country) {
    if (this._countryFeatureCache[country]) {
        //console.log(this._countryFeatureCache[country]);
        return this._countryFeatureCache[country];
    }

    var arr = [];
    //  在 featurexData里找到ADM0_A3属性 等于国家名的feature
    //console.table(this.featureData.features,);   //  为topo json 数据
    var countryFeature = _.find(
        this.featureData.features,
        //   amormaid
        //function(f) { return f.properties.ADM0_A3 == country; });
        function (f) {
            /*
            // alert(JSON.stringify(f));
            {"type":"Feature","id":"xin_jiang","properties":{"name":"新疆","cp":[84.9023,41.748],"childNum":18},"geometry":{"type":"Polygon","coordinates":[[[96.41678100810081,42.71629189918991],[95.97929702970296,42.49639434943494],[96.06556147614762,42.31905761576157],[96.23809036903691,42.230389248924894],[95.97929702970296,41.925370067006696],[95.27069621962195,41.616804150415035],[95.18443177317732,41.79059414941494],[94.56825715571557,41.485574967496746],[94.04450873087309,41.0883406840684],[93.86581809180919,40.69465313531353],[93.07711458145815,40.64854558455845],[92.63963060306031,39.63772620262026],[92.37467551755175,39.33270702070207],[92.37467551755175,39.11280947094709],[92.37467551755175,39.02414110411041],[90.17493213321332,38.49567763776378],[90.35362277227723,38.23321927192719],[90.61241611161117,38.32188763876387],[90.52615166516651,37.83598498849885],[91.05606183618362,37.44229743974397],[91.32101692169218,37.0911707070707],[90.70484230423043,36.78260479047904],[90.79110675067507,36.60526805680568],[91.05606183618362,36.52014642464246],[91.05606183618362,36.08035132513251],[90.87737119711971,36.03424377437743],[90.00240324032403,36.254141324132405],[89.90997704770477,36.08035132513251],[89.73744815481548,36.08035132513251],[89.20753798379837,36.30024887488749],[88.77005400540054,36.34280969096909],[88.59136336633664,36.47403887388738],[87.36517587758776,36.431478057805776],[86.21909108910891,36.16547295729573],[86.13282664266427,35.860453775377536],[85.60291647164716,35.683117041704165],[85.07916804680468,35.729224592459246],[84.19803834383438,35.374551125112504],[83.1443797479748,35.420658675867585],[82.87942466246625,35.683117041704165],[82.44194068406841,35.729224592459246],[82.00445670567058,35.3319903090309],[81.65323717371737,35.243321942194214],[80.42088793879388,35.420658675867585],...
            */

            return f.properties.name == country;
        });
    if (countryFeature) {
        this._countryFeatureCache[country] = countryFeature;
        //console.table(countryFeature);
        return countryFeature;
    }
    return null;
};

MapModel.prototype.getLabelPointForCountry = function (country) {
    var feature = this.getLabelFeatureForCountry(country);

    if (!feature) {
        console.log('could not find label point for ' + country); // eslint-disable-line
        return [0, 0];
    }

    return feature.geometry.coordinates;
};


// MapModel.prototype.getLabelFeatureForCountry = function(country) {
//   if (this._labelFeatureCache[country]) return this._labelFeatureCache[country];
//   var feature = _.find(
//     this.labelFeatureData.features,
//     function(f) { return f.properties.sr_su_a3 == country; });
//   return feature;
// };


MapModel.prototype.getFriendlyNameForCountry = function (country) {
    switch (country) {
        case 'SYR':
            return 'Syria';
        case 'MKD':
            return 'Macedonia';
        case 'IRN':
            return 'Iran';
        case 'LBY':
            return 'Libya';
        case 'RUS':
            return 'Russia';
        case 'RCB':
            return 'Congo';
        case 'COD':
            return 'Congo';
    }
    return countries.getName(country, 'en');
};


MapModel.prototype.getRandomPointFromCountry = function (country) {
    var feature = this.getFeatureForCountry(country);
    if (feature == null) {
        throw 'could not find feature for ' + country;
    }
    var borders = this.getMainCountryBorderForFeature(feature);
    return this.getRandomPointForCountryBorder(country, borders);
};

MapModel.prototype.getMainCountryBorderForFeature = function (feature) {
    var key = feature.properties.ADM0_A3;
    if (this._countryBordersCache[key] == null) {
        if (feature.geometry.type == 'MultiPolygon') {
            this._countryBordersCache[key] = MapModel.getLargestPolygon(feature.geometry.coordinates);
        } else {
            this._countryBordersCache[key] = feature.geometry.coordinates[0];
        }
    }
    return this._countryBordersCache[key];
};

MapModel.prototype.getCenterPointOfCountry = function (country) {
    if (!this._countryCentersCache[country]) {
        var feature = this.getFeatureForCountry(country);
        //  amormaid
        //console.log("country Feature function is ",this.getFeatureForCountry);
        if (feature == null) {
            //console.log('could not find feature for ' + country);
            return [0, 0];
        }
        this._countryCentersCache[country] = d3.geo.centroid(feature);
    }
    //isNaN(this._countryCentersCache[country][0]) && console.log("NaN");
    //return  isNaN(this._countryCentersCache[country][0]) ? [0,0] :this._countryCentersCache[country];

    //  isNaN(this._countryCentersCache[country][0]) && console.log("this._countryCentersCache[country] is ",this._countryCentersCache[country]);
    return this._countryCentersCache[country];
};

/*
 * Get a random point within the polygon defined
 * by the coordinates in the given array
 */
MapModel.prototype.getRandomPointForCountryBorder = function (country, coordinates) {
    if (!this._countryBoundsCache[country]) {
        this._countryBoundsCache[country] = MapModel.getBounds(coordinates);
    }
    var bounds = this._countryBoundsCache[country];
    var la, lo;

    var count = 0;
    do {
        la = Math.random() * (bounds.maxLa - bounds.minLa) + bounds.minLa;
        lo = Math.random() * (bounds.maxLo - bounds.minLo) + bounds.minLo;
        count++;
    } while (!inside([la, lo], coordinates) && count < 100);

    if (count == 100) {
        //console.log('could not create random point for ' + country);
        return [0, 0];
    }
    return [la, lo];
};


/*
 * Get largest polygon within a GeoJSON
 * MultiPolygon coordinates array
 *
 * (used to figure out what is mainland)
 */
MapModel.getLargestPolygon = function (coordinates) {
    var largest = Number.MIN_VALUE;
    var ret = null;
    coordinates.forEach(function (item) {
        var va = item[0].map(function (point) {
            return Vec2(point[0], point[1]);
        });

        var p = new Polygon(va);
        var val = p.area();
        if (val > largest) {
            largest = val;
            ret = item[0];
        }
    });
    return ret;
};

MapModel.getBounds = function (coordinates) {
    var bounds = coordinates.reduce(function (previous, item) {
        previous.minLa = Math.min(item[0], previous.minLa);
        previous.maxLa = Math.max(item[0], previous.maxLa);
        previous.minLo = Math.min(item[1], previous.minLo);
        previous.maxLo = Math.max(item[1], previous.maxLo);

        return previous;

    }, {
        minLa: Number.MAX_VALUE,
        maxLa: Number.MIN_VALUE,
        minLo: Number.MAX_VALUE,
        maxLo: Number.MIN_VALUE
    });
    return bounds;
};


export default MapModel;
