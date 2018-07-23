
import  React  from 'react' ;

//import  assets  from '../lucify-assets.js' ;
import  assets  from './lucify-assets.js' ;

class Loading extends React.Component{

   constructor(props){
      super(props);
   }

  // displayName: 'Loading'

  





  getPercentage = () =>{
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
      <div className="loading">
        <div className="loading__img">
          <img src={assets.img('loading-spinner.gif')} />
        </div>
        <div className="loading__text">
          Loading... {this.getPercentage()}
        </div>
      </div>
    );
  }

}


  Loading.getDefaultProps= {
      progress: null
  }
  export  default   Loading;
