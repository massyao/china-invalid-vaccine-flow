import React from 'react' ;
import ReactDOM from "react-dom";
import d3 from 'd3' ;
import _ from 'underscore' ;
import sprintf from 'sprintf-js' ;
//import  console  from 'console-browserify' ;


var getFullCount = function (counts) {
    if (!counts) {
        return 0;
    }

    return counts.vaccine_countApplications;
};


class VaccineMapBorder extends React.Component {

    constructor(props) {
        super(props);
        //console.log("VaccineMapBorder props's enableOverlay is ",props.enableOverlay );
        this.state = {};
    }

    // displayName: 'VaccineMapBorder'

    componentDidMount() {
        //console.log(this.refs.overlay)
        this.sel = d3.select(ReactDOM.findDOMNode(this.refs.overlay));
    }


    componentWillReceiveProps(nextProps, _nextState) {
        this.sel
            .classed('subunit--hovered', nextProps.hovered)
            .classed('subunit--destination', nextProps.destination)
            .classed('subunit--origin', nextProps.origin);
    }


    shouldComponentUpdate(nextProps, _nextState) {
        // it is important to prevent an expensive diff of the svg path
        // a react render will only be needed if we need to resize
        return this.props.width !== nextProps.width;
    }


    updateWithCountDetails = (details) => {
        var fillStyle = null;

        if (this.props.origin && getFullCount(details.originCounts) > 0) {
            fillStyle = sprintf('rgba(190, 88, 179, %.2f)', details.originScale(getFullCount(details.originCounts)));
        } else if (this.props.destination && getFullCount(details.destinationCounts) > 0) {
            fillStyle = sprintf('rgba(95, 196, 114, %.2f)', details.destinationScale(getFullCount(details.destinationCounts)));
        }

        this.sel.style('fill', fillStyle);
    }


    onMouseOver = () => {
        this.props.onMouseOver(this.props.country);
    }


    onMouseLeave = () => {
        this.props.onMouseLeave(this.props.country);
    }


    render = () => {
        //console.log("VaccineMapBorder props are  ",this.props);
        // console.log("VaccineMapBorder path props are  ",this.props.path);
        // round pixels using a custom rendering context
        var d = '';
        var context = {
            beginPath: () => {
                d += '';
            },
            moveTo: (x, y) => {
                // amormaid
                // key point
                //console.log("VaccineMapBorder context moveTo x is ",x);
                var x = x !== x ? 0 : x;
                var y = y !== y ? 0 : y;
                //console.log("VaccineMapBorder context   this  is ",this);
                d += 'M' + Math.round(x) + ',' + Math.round(y);
            },
            lineTo: (x, y) => {
                var x = x !== x ? 0 : x;
                var y = y !== y ? 0 : y;
                d += 'L' + Math.round(x) + ',' + Math.round(y);
            },
            closePath: () => {
                d += 'Z';
            },
            arc: () => {
                d += '';
            }
        };

        // console.log("this.props are ",this.props);
        var path = this.props.path;

        path.context(context);

        path(this.props.feature);

        var overlay = this.props.enableOverlay ? (
            <path key="p2" ref="overlay"
                  className="subunit--overlay"
                  onMouseOver={this.onMouseOver}
                  onMouseLeave={this.onMouseLeave}
                  d={d}/>) : null;

        return (
            <g>
                <path key="p1"
                      className={this.props.subunitClass}
                      d={d}
                      onMouseOver={this.onMouseOver}
                      onMouseLeave={this.onMouseLeave}/>
                {overlay}
            </g>
        );

    }

}


class VaccineMapBordersLayer extends React.Component {

    constructor(props) {
        super(props);
    }

    // displayName: 'VaccineMapBorderLayer'

    onMouseOver = (country) => {
        if (this.props.onMouseOver) {
            this.props.onMouseOver(country);
        }
    }

    onMouseLeave = (country) => {
        if (this.props.onMouseLeave) {
            this.props.onMouseLeave(country);
        }
    }


    onClick = () => {
        if (this.props.onClick) {
            this.props.onClick();
        }
    }


    getHighlightParams = (country) => {
        if (!this.props.country) {
            return {};
        }

        return {
            hovered: this.props.country == country,
            destination: this.props.destinationCountries.indexOf(country) != -1,
            origin: this.props.originCountries.indexOf(country) != -1
        };
    }


    // quick update
    // ------------

    updateForStamp = (stamp) => {
        if (!this.lastUpdate || Math.abs(this.lastUpdate - stamp) > 60 * 60 * 24 * 5) {
            this.doUpdate(stamp);
        }
    }


    doUpdate = (stamp) => {
        this.lastUpdate = stamp;
        var countData = this.getCountData(stamp);

        return this.props.mapModel.featureData.features.map(function (feature) {
            var country = feature.properties.ADM0_A3;
            var countDetails = {};
            if (countData != null) {
                countDetails = {
                    originScale: countData.originScale,
                    destinationScale: countData.destinationScale,
                    destinationCounts: countData.destinationCounts[country],
                    originCounts: countData.originCounts[country]
                };
            }

            this.refs[country] && this.refs[country].updateWithCountDetails(countDetails);
        }.bind(this));
    }

    /*
     * Get count data for current
     * this.props.country at this.props.stamp
     */
    getCountData = (stamp) => {

        var getMaxCount = (counts) => {
            return _.values(counts).reduce(function (prev, item) {
                return Math.max(prev, item.vaccine_countApplications);
            }, 0);
        };

        var countData = null;
        var exponent = 0.5;

        if (this.props.country != null) {
            var originCounts = this.props.vaccineCountsModel
                .getDestinationCountsByOriginCountries(this.props.country, stamp);
            var maxOriginCount = getMaxCount(originCounts);

            var destinationCounts = this.props.vaccineCountsModel
                .getOriginCountsByDestinationCountries(this.props.country, stamp);
            var maxDestinationCount = getMaxCount(destinationCounts);

            var originScale = d3.scale.pow().exponent(exponent).domain([0, maxOriginCount]).range([0.075, 0.80]);
            var destinationScale = d3.scale.pow().exponent(exponent).domain([1, maxDestinationCount]).range([0.075, 0.80]);

            countData = {
                originCounts: originCounts,
                destinationCounts: destinationCounts,
                originScale: originScale,
                destinationScale: destinationScale
            };
        }

        return countData;
    }


    /*
     * Get paths representing map borders
     */
    getPaths = () => {
        var countries = {};

        // while we use React to manage the DOM,
        // we still use D3 to calculate the path

        // from vaccine-map   getWinkel3Projection()
        // keypoint amormaid
        //console.log( "this.props.projection  is ",this.props.projection );
        var path = d3.geo.path().projection(this.props.projection);
        /*
        path.context = {
            function(t) {
            return arguments.length ? (r = null == (n = t) ? new
            function() {
                var t = br(4.5),
                n = [],
                e = {
                    point: r,
                    lineStart: function() {
                        e.point = i
                    },
                    lineEnd: a,
                    polygonStart: function() {
                        e.lineEnd = u
                    },
                    polygonEnd: function() {
                        e.lineEnd = a,
                        e.point = r
                    },
                    pointRadius: function(n) {
                        return t = br(n),
                        e
                    },
                    result: function() {
                        if (n.length) {
                            var t = n.join("");
                            return n = [],
                            t
                        }
                    }
                };
                function r(e, r) {
                    n.push("M", e, ",", r, t)
                }
                function i(t, r) {
                    n.push("M", t, ",", r),
                    e.point = o
                }
                function o(t, e) {
                    n.push("L", t, ",", e)
                }
                function a() {
                    e.point = r
                }
                function u() {
                    n.push("Z")
                }
                return e
            }: new
            function(t) {
                var n = 4.5,
                e = {
                    point: r,
                    lineStart: function() {
                        e.point = i
                    },
                    lineEnd: a,
                    polygonStart: function() {
                        e.lineEnd = u
                    },
                    polygonEnd: function() {
                        e.lineEnd = a,
                        e.point = r
                    },
                    pointRadius: function(t) {
                        return n = t,
                        e
                    },
                    result: I
                };
                function r(e, r) {
                    t.moveTo(e + n, r),
                    t.arc(e, r, n, 0, Pt)
                }
                function i(n, r) {
                    t.moveTo(n, r),
                    e.point = o
                }
                function o(n, e) {
                    t.lineTo(n, e)
                }
                function a() {
                    e.point = r
                }
                function u() {
                    t.closePath()
                }
                return e
            } (t), "function" != typeof a && r.pointRadius(a), l()) : n
        }



        }

        */
        return this.props.mapModel.featureData.features.map(function (feature) {
            //console.log(feature);
            //var country = feature.properties.ADM0_A3;
            var country = feature.properties.name;

            var hparams = this.getHighlightParams(country);

            if (countries[country]) {
                //   amormaid
                // console.log('duplicate for ' + country); // eslint-disable-line
            }

            countries[country] = true;

            return <VaccineMapBorder
                ref={country}
                enableOverlay={this.props.enableOverlay}
                subunitClass={this.props.subunitClass}
                key={country}
                onMouseLeave={this.onMouseLeave}
                onMouseOver={this.onMouseOver}
                path={path}
                feature={feature}
                country={country}
                width={this.props.width}
                {...hparams} />;
        }.bind(this));
    }


    componentDidUpdate() {
        if (this.lastUpdate != null) {
            this.doUpdate(this.lastUpdate);
        }
    }


    shouldComponentUpdate(nextProps, _nextState) {
        if (this.props.width !== nextProps.width) {
            return true;
        }

        if (!this.props.updatesEnabled) {
            return false;
        }

        if (nextProps.country !== this.props.country) {
            return true;
        }

        return false;
    }


    render() {
        return (
            <svg className="vaccine-map-borders-layer"
                 style={{width: this.props.width, height: this.props.height}}
                 onClick={this.onClick}>
                {this.getPaths()}
            </svg>
        );
    }


}

VaccineMapBordersLayer.getDefaultProps = {
    subunitClass: 'subunit',
    updatesEnabled: true
}


export default VaccineMapBordersLayer;
