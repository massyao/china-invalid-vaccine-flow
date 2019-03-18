import React from 'react' ;
import ReactDOM from "react-dom";
import PIXI from 'pixi.js' ;

//import  lucifyUtils  from 'lucify-commons/src/js/lucify-utils.jsx' ;
//import  assets  from 'lucify-commons/src/js/lucify-assets.js' ;
import lucifyUtils from '../../lib/lucify-utils.jsx' ;
import assets from '../../lib/lucify-assets.js' ;


var isSafari = lucifyUtils.isSafari;
var isSlowDevice = lucifyUtils.isSlowDevice;


class VaccineMapPointsLayer extends React.Component {

    constructor(props) {
        super(props);
    }

    // displayName: 'VaccineMapPointsLayer'


    componentDidMount() {
        this.graphics = {};
        this.sprites = {};
        this.initializePixiCanvas();
    }


    updateForStamp = (stamp) => {
        this.stamp = stamp;
        this.renderCanvas();
    }


    getWidth = () => {
        return this.props.width;
    }


    getHeight = () => {
        return this.props.height;
    }


    componentDidUpdate = () => {
        this.renderCanvas();
    }


    autoDetectRenderer = () => {
        if (window.navigator.userAgent.indexOf('IEMobile/11') != -1) {
            return false;
        }

        // for fast devices we always use canvas renderer
        // since it allows for displaying trails
        return isSlowDevice();
    }


    isCanvasRenderer = () => {
        return this.renderer.type === PIXI.RENDERER_TYPE.CANVAS;
    }


    createRenderer = () => {
        var opts = {
            transparent: true,
            antialias: true,
            view: ReactDOM.findDOMNode(ReactDOM.findDOMNode(this))
        };

        var ret;

        if (this.autoDetectRenderer()) {
            ret = PIXI.autoDetectRenderer(this.getWidth(), this.getHeight(), opts);
        } else {
            ret = new PIXI.CanvasRenderer(this.getWidth(), this.getHeight(), opts);
        }

        if (ret.type === PIXI.RENDERER_TYPE.CANVAS) {
            console.log('using canvas renderer'); // eslint-disable-line
            ret.preserveDrawingBuffer = true;
            ret.clearBeforeRender = false;
        } else {
            console.log('using webgl renderer'); // eslint-disable-line
            ret.preserveDrawingBuffer = false;
            ret.clearBeforeRender = true;
        }

        return ret;
    }


    initializePixiCanvas = () => {
        PIXI.dontSayHello = true;
        PIXI.utils._saidHello = true;
        PIXI.doNotSayHello = true;
        PIXI.AUTO_PREVENT_DEFAULT = false;

        this.renderer = this.createRenderer();
        this.renderer.plugins.interaction.autoPreventDefault = false;

        this.stage = new PIXI.Container();

        this.vaccineContainer = new PIXI.Container();
        this.vaccineContainer.alpha = 1.0;
        this.stage.addChild(this.vaccineContainer);

        // for some reason the trails do not work
        // unless there is some graphics sharing the stage
        // so we add a dummy graphics object
        var graphics = new PIXI.Graphics();
        this.stage.addChild(graphics);

        this.vaccineTexture = new PIXI.Texture.fromImage(
            assets.img('one-white-pixel.png'),
            new PIXI.Rectangle(0, 0, 1, 1));
    }


    getStamp = () => {
        return this.stamp;
    }


    renderCanvas = () => {

        if (this.getWidth() !== this.lastWidth) {
            this.renderer.resize(this.getWidth(), this.getHeight());
        }

        this.lastWidth = this.getWidth();

        this.vaccineContainer.removeChildren();

        this.props.vaccinePointsModel.forEachActiveVaccine(this.getStamp(), function (r) {
            if (!r.sprite) {
                r.sprite = new PIXI.Sprite(this.vaccineTexture);
                r.sprite.alpha = 1.0;
            }

            var loc = r.getLocation(this.getStamp());
            var point = this.props.projection(loc);
            r.sprite.position.x = point[0];
            r.sprite.position.y = point[1];

            if (this.props.highlightedCountry == null) {
                r.sprite.alpha = 1.0; // make all solid
            } else {
                if (r.originCountry === this.props.highlightedCountry) {
                    r.sprite.alpha = 1.0;
                } else if (r.destinationCountry === this.props.highlightedCountry) {
                    r.sprite.alpha = 1.0;
                } else {
                    // safari gets slowed down a lot by alpha
                    // that is not 0 or 1
                    r.sprite.alpha = isSafari() ? 0.0 : 0.10;
                }
            }

            // this gives best performance
            if (r.sprite.alpha == 1.0) {
                this.vaccineContainer.addChild(r.sprite);
            }
        }.bind(this));

        var diff = this.getStamp() - this.previousStamp;
        var trailsEnabled = this.isCanvasRenderer() && (diff >= 0) && (diff < 60 * 60 * 5);

        this.previousStamp = this.getStamp();

        this.renderer.clearBeforeRender = !trailsEnabled;
        this.renderer.render(this.stage);

        if (trailsEnabled) {
            // snippet adapted from earth.js
            // https://github.com/cambecc/earth/blob/master/public/libs/earth/1.0.0/earth.js
            // see draw()-function
            var g = this.renderer.view.getContext('2d');
            if (g != null) {
                g.fillStyle = 'rgba(0, 0, 0, 0.95)';
                var prevAlpha = g.globalAlpha;
                var prev = g.globalCompositeOperation;
                g.globalAlpha = 0.90;
                g.globalCompositeOperation = 'destination-in';
                g.fillRect(0, 0, this.getWidth(), this.getHeight());
                g.globalCompositeOperation = prev;
                g.globalAlpha = prevAlpha;
            }
        }
    }

    render() {
        return <canvas style={{width: this.props.width, height: this.props.height}}/>;
    }

}

export default VaccineMapPointsLayer;
