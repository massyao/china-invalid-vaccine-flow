import React from 'react' ;

//import  assets  from '../lucify-assets.js' ;
import assets from './lucify-assets.js' ;

class Loading extends React.Component {

    constructor(props) {
        super(props);
    }

    // displayName: 'Loading'


    getPercentage = () => {
        if (this.props.progress === null) {
            return null;
        }
        return (
            <span className="loading__percentage">
        ({this.props.progress} %)
      </span>
        );
    }


    render() {
        return (
            <div>
                <div className="loading">
                    <div className="loading_row">
                        <div className="loading__img">
                            <img src={assets.img('loading-spinner.gif')}/>
                        </div>
                        <div className="loading__text">
                            Loading... {this.getPercentage()}
                        </div>
                    </div>
                </div>

                <div className="loading_project_description">
                    <div>
                        <h1>中国历年无效疫苗流向数据可视化 </h1>
                    </div>
                    <br/>
                    <br/>
                    <div>在看过 <a href="https://v2ex.com/t/473163">https://v2ex.com/t/473163</a>的帖子后，
                    </div>
                    <div>
                        根据 <a href="https://github.com/fuckcqcs">"github.com/fuckcqcs"</a> 提供的数据，
                    </div>
                    <div>
                        对各疫苗公司及其无效疫苗的历年流向做了可视化，
                    </div>
                    <div>
                        方便大家对无效疫苗的来源、去向、数量有一个直观的了解，
                    </div>
                </div>

            </div>
        );
    }

}


Loading.getDefaultProps = {
    progress: null
}

export default Loading;
