import React, { Component } from 'react';
// import { SketchPicker, PhotoshopPicker } from 'react-color'
// var ls = require('local-storage');
import * as ls from 'local-storage';
// import logo from './logo.svg';
import './App.css';
// import '../node_modules/react-grid-layout/css/styles.css'
// import '../node_modules/react-resizable/css/styles.css';

// var ReactGridLayout = require('react-grid-layout');
 // import DatetimeRangePicker from 'react-datetime-range-picker';
// import * as Datetime from 'react-datetime';

// import 'bootstrap/dist/css/bootstrap.min.css';
// import {Form, Input, FormGroup, Container, Label} from 'reactstrap';
// import 'react-dates/initialize';
// import 'react-dates/lib/css/_datepicker.css';
// import {SingleDatePicker, DateRangePicker} from 'react-dates';

class Block extends Component{
  constructor(props){
    super(props);
    this.state={data: []};
  }
  componentDidMount(){
    fetch(this.props.dataUrl)
    .then(result=>result.json())
    .then(posts=>{
      this.setState({data: posts});
    })
  }

  isInTimeRange = (date, locaStorageIdentifier)=>{
    // date<=ls.get('localLayout')[locaStorageIdentifier]['endDate'] && date >= ls.get('localLayout')[locaStorageIdentifier]['startDate'] 

    if(new Date(date)<=new Date(ls.get('localLayout')[locaStorageIdentifier]['endDate']) && new Date(date) >= new Date(ls.get('localLayout')[locaStorageIdentifier]['startDate'])){
      return true;
    }else {
      return false;
    }
  }

  render(){
    var heading = null;
    var locaStorageIdentifier = null;
    if(this.state.data.length===0){
      return (<p>Loading...</p>)
    }else {
      
      if(this.props.dataUrl==='http://localhost:7890/1.1/statuses/user_timeline.json?count=30&screen_name=newsycombinator'){
        heading = 'Hacker News';
        locaStorageIdentifier = 'newsycombinator';
      }else if(this.props.dataUrl==='http://localhost:7890/1.1/statuses/user_timeline.json?count=30&screen_name=ycombinator'){
        heading = 'Y Combinator';
        locaStorageIdentifier = 'ycombinator';
      }else if(this.props.dataUrl==='http://localhost:7890/1.1/statuses/user_timeline.json?count=30&screen_name=makeschool'){
        heading = 'Make School';
        locaStorageIdentifier = 'makeschool'
      }
      return <div>
              <h3>{heading}</h3>
              <ol style={{marginRight: '5px'}}>
                {
                  // this.state.data.map((post, index)=>{
                  //   var n = post.text.split(" ");
                  //   var url = n.splice(-1);
                  //   var content = n.join(" ");
                  //   var date = new Date(post.created_at);
                  //   return <li key={index.toString()} className="post"><div><a href={url} target="_blank" rel="noopener noreferrer">{content}</a><div className="date">{date.toDateString()}</div><hr/> </div></li>
                  // })

                  function(){
                    var num = ls.get('localLayout')?ls.get('localLayout')[locaStorageIdentifier].count : 30;
                    var arr = [];
                    for(var i=0; i<num; i++){
                      var date = new Date(this.state.data[i].created_at);
                      if(!ls.get('localLayout') || (ls.get('localLayout') && this.isInTimeRange(date, locaStorageIdentifier))){
                        var n = this.state.data[i].text.split(" ");
                        var url = null;
                        var content;
                        var usrName = null;
                        if(n[0]==='RT' && n[1][0]==='@'){
                          // do this
                          if(this.state.data[i]["retweeted_status"]["entities"]["urls"][0]){
                            url=this.state.data[i]["retweeted_status"]["entities"]["urls"][0]["url"];
                            // console.log(url); 
                          }
                          
                          usrName = n.splice(0, 2).join(" ");
                          content = n.join(" ");
                        }else {
                           url = n.splice(-1);
                           content = n.join(" ");
                        }

                        // var url = n.splice(-1);
                        // var content = n.join(" ");
                        // var date = new Date(this.state.data[i].created_at);
                        arr.push(<li key={i.toString()} className="post"><div><a href={url} target="_blank" rel="noopener noreferrer">{content}</a><div className="date"><span>{usrName}</span><span>{date.toDateString()}</span></div><hr/> </div></li>)
                      }
                      
                    }
                    return arr;
                  }.bind(this)()
                  
                }
              </ol>
            </div> 
    }
  }
}

class MyFirstGrid extends Component{
  constructor(props){
    super(props);
    
    // const newsycombinator = 'http://localhost:7890/1.1/statuses/user_timeline.json?count=30&screen_name=newsycombinator';
    // const ycombinator = 'http://localhost:7890/1.1/statuses/user_timeline.json?count=30&screen_name=ycombinator';
    // const makeschool = 'http://localhost:7890/1.1/statuses/user_timeline.json?count=30&screen_name=makeschool';
    // this.state={leftSide: ycombinator, middle: makeschool, rightSide: newsycombinator};
    // var localLayout = ls.get('localLayout');
    this.state = {orderOfColumns: {'leftSide' :  ls.get('localLayout')?ls.get('localLayout')['left']:'ycombinator' , 
                                  'middle' : ls.get('localLayout')?ls.get('localLayout')['middle']:'makeschool',
                                  'rightSide' : ls.get('localLayout')?ls.get('localLayout')['right']:'newsycombinator'}, }
  }

  render() {
    // update localStorage
    var constUrlPart = 'http://localhost:7890/1.1/statuses/user_timeline.json?count=30&screen_name=';
    return (
        <div className="container" style={{backgroundColor: localStorage.getItem("overallSkin")?localStorage.getItem("overallSkin"): null} } >
          <div style={{flex: '1'}}><Block dataUrl={constUrlPart + this.state.orderOfColumns.leftSide} /></div>
          <div style={{flex: '1'}}><Block dataUrl={constUrlPart + this.state.orderOfColumns.middle} /></div>
          <div style={{flex: '1'}}><Block dataUrl={constUrlPart + this.state.orderOfColumns.rightSide} /></div>
       </div>
      )
  }
};

class EditLayoutForm extends Component{
  state= {focusedInput: null};

  isValidCount=(countNum)=>{
    if(countNum!==null && countNum!=='' && parseInt(countNum)<=30 && parseInt(countNum)>=1){
      return true;
    }else {
      return false;
    }
  }
  isHexaColor=(sNum)=>{
      return (typeof sNum === "string") && sNum.length === 7 
         && ! isNaN( parseInt(sNum.substring(1, sNum.length), 16) );
    }
  isValidColor=(skinColor)=>{
    console.log("hexcolor func value: "+ this.isHexaColor(skinColor))
    if(skinColor!=="#000000" && this.isHexaColor(skinColor)){
      return true;
    }else {
      console.log("I was printed: "+ skinColor)
      return false;
    }
  }

  layoutSubmission = ()=>{
    var tempObject = {};
    if(ls.get("localLayout")){
      tempObject = ls.get("localLayout");
    }else {
     tempObject = {
                       'skinColor': '#f2f2f2',
                       'ycombinator': {'count': '30', 'position': 'l', 'startDate': new Date("11 nov 1900"), 'endDate': new Date()},
                       'newsycombinator': {'count': '30', 'position': 'l', 'startDate': new Date("11 nov 1900"), 'endDate': new Date()},
                       'makeschool': {'count': '30', 'position': 'l', 'startDate': new Date("11 nov 1900"), 'endDate': new Date()},
                       'left': 'ycombinator',
                       'middle': 'makeschool',
                       'right': 'newsycombinator'
                     }
    }
    var ycombinatorCount = document.getElementById("ycombinatorCount").value;
    if(this.isValidCount(ycombinatorCount)){
      tempObject.ycombinator.count = ycombinatorCount;
    }
    var newsycombinatorCount = document.getElementById("newsycombinatorCount").value;
    if(this.isValidCount(newsycombinatorCount)){
      tempObject.newsycombinator.count =newsycombinatorCount;
    }
    var makeschoolCount = document.getElementById("makeschoolCount").value;
    if(this.isValidCount(makeschoolCount)){
      tempObject.makeschool.count = makeschoolCount;
    }
    var skinColor = document.getElementById("skinColor").value;
    if(this.isValidColor(skinColor)){
      tempObject.skinColor = skinColor;
    }

    var ycombinatorstartDate = document.getElementById("ycombinatorstartDate").value;
    if(ycombinatorstartDate!=="" && ycombinatorstartDate!==null){
      tempObject.ycombinator.startDate = ycombinatorstartDate;
    }
    var newsycombinatorstartDate = document.getElementById("newsycombinatorstartDate").value;
    if(newsycombinatorstartDate!=="" && newsycombinatorstartDate!==null){
      tempObject.newsycombinator.startDate = newsycombinatorstartDate;
    }
    var makeschoolstartDate = document.getElementById("makeschoolstartDate").value;
    if(makeschoolstartDate!=="" && makeschoolstartDate!==null){
      tempObject.makeschool.startDate = makeschoolstartDate;
    }

    var ycombinatorendDate = document.getElementById("ycombinatorendDate").value;
    if(ycombinatorendDate!=="" && ycombinatorendDate!==null){
      tempObject.ycombinator.endDate = ycombinatorendDate;
    }
    var newsycombinatorendDate = document.getElementById("newsycombinatorendDate").value;
    if(newsycombinatorendDate!=="" && newsycombinatorendDate!==null){
      tempObject.newsycombinator.endDate = newsycombinatorendDate;
    }
    var makeschoolendDate = document.getElementById("makeschoolendDate").value;
    if(makeschoolendDate!=="" && makeschoolendDate!==null){
      tempObject.makeschool.endDate = makeschoolendDate;
    }

    // Playing with radio button to change column order:
    var ycombinatorPositionObj = document.querySelector('input[name="ycombinator"]:checked');
    if(ycombinatorPositionObj){
      tempObject[ycombinatorPositionObj.value]="ycombinator";
    }
    var newsycombinatorPositionObj = document.querySelector('input[name="newsycombinator"]:checked');
    if(newsycombinatorPositionObj){
      tempObject[newsycombinatorPositionObj.value]="newsycombinator";
    }
    var makeschoolPositionObj = document.querySelector('input[name="makeschool"]:checked');
    if(makeschoolPositionObj){
      tempObject[makeschoolPositionObj.value]="makeschool";
    }

    ls.set("localLayout", tempObject);
    console.log(ls.get("localLayout").ycombinator);
  }

  render(){
    return (
      <form className='form'>
        <div className='formLine'>
          <span style={{flex: '1'}}></span>
          <h1 style={{flex: '1'}}>Date Range</h1>
          <h1 style={{flex: '1'}}>Number of Posts</h1>
          <h1 style={{flex: '1'}}>Position of Posts</h1>
        </div>
        <div className="formLine">
          <h2 style={{marginRight: '5px', flex: '1'}}>Y Combinator:</h2>
          <MyDatePicker locaStorageIdentifier={'ycombinator'} />
          <div style={{flex: '1'}}>
            <input type="number" id="ycombinatorCount" min="1" max="30" />
          </div>
          <div className="positionInput" style={{flex: '1'}}>
           <div className="positionRadioEntry"><label style={{marginRight: '5px'}}>L:</label> <input type="radio" name="ycombinator"  value="left" /></div> 
           <div className="positionRadioEntry"><label style={{marginRight: '5px'}}>M:</label ><input type="radio" name="ycombinator"  value="middle" /></div> 
           <div className="positionRadioEntry"><label style={{marginRight: '5px'}}>R:</label> <input type="radio" name="ycombinator"  value="right" /></div> 
          </div>
        </div>
        <div className="formLine">
          <h2 style={{marginRight: '5px', flex: '1'}}>Hacker News:</h2>
          <MyDatePicker  locaStorageIdentifier={'newsycombinator'}/>
          <div style={{flex: '1'}}>
            <input type="number" id="newsycombinatorCount" min="1" max="30" />
          </div>
          <div className="positionInput" style={{flex: '1'}}>
           <div className="positionRadioEntry"><label style={{marginRight: '5px'}}>L:</label> <input type="radio" name="newsycombinator"  value="left" /></div> 
           <div className="positionRadioEntry"><label style={{marginRight: '5px'}}>M:</label ><input type="radio" name="newsycombinator"  value="middle" /></div> 
           <div className="positionRadioEntry"><label style={{marginRight: '5px'}}>R:</label> <input type="radio" name="newsycombinator"  value="right" /></div> 
          </div>
        </div>
        <div className="formLine">
          <h2 style={{marginRight: '5px', flex: '1'}}>Make School:</h2>
          <MyDatePicker locaStorageIdentifier={'makeschool'}/>
          <div style={{flex: '1'}}>
            <input type="number" id="makeschoolCount" min="1" max="30" />
          </div>
          <div className="positionInput" style={{flex: '1'}}>
           <div className="positionRadioEntry"><label style={{marginRight: '5px'}}>L:</label> <input type="radio" name="makeschool"  value="left" /></div> 
           <div className="positionRadioEntry"><label style={{marginRight: '5px'}}>M:</label ><input type="radio" name="makeschool"  value="middle" /></div> 
           <div className="positionRadioEntry"><label style={{marginRight: '5px'}}>R:</label> <input type="radio" name="makeschool"  value="right" /></div> 
          </div>
        </div>
        <div className='formLine'> 
          <h2 style={{marginRight: '5px', flex: '1'}}>Pick Skin Color: </h2>
          <div style={{flex: '1'}}><input style={{width: '50%'}} id="skinColor" type='color' /></div>
          <span style={{flex: '1'}}></span>
          <span style={{flex: '1'}}></span>
        </div>
        <div className='formLine'>
          <input className="button" onClick={this.layoutSubmission} type="submit" />
        </div>
      </form>  
      )
  }
}

class MyDatePicker extends Component{
  state={};

  render(){
    var startDateId = this.props.locaStorageIdentifier+'startDate';
    var endDateId = this.props.locaStorageIdentifier + 'endDate'
    return (
      // <DateRangePicker
      //   startDate={this.state.startDate} // momentPropTypes.momentObj or null,
      //   startDateId="your_unique_start_date_id" // PropTypes.string.isRequired,
      //   endDate={this.state.endDate} // momentPropTypes.momentObj or null,
      //   endDateId="your_unique_end_date_id" // PropTypes.string.isRequired,
      //   onDatesChange={({ startDate, endDate }) => this.setState({ startDate, endDate })} // PropTypes.func.isRequired,
      //   focusedInput={this.state.focusedInput} // PropTypes.oneOf([START_DATE, END_DATE]) or null,
      //   onFocusChange={focusedInput => this.setState({ focusedInput })} // PropTypes.func.isRequired,
      // />
      <div>
      <input type="date" id={startDateId}/>
      <span> -> </span>
      <input type="date" id  = {endDateId} />
      </div>
    )
  }
}

class App extends Component{

  state = {editLayout: false};

  handleCheckBoxClick = (e)=>{
    this.setState({editLayout: !this.state.editLayout})
  }

  render() {
    // Hack: For better user exp.
    // If localStrorage have custom layout than set endDate to current date on every reload.
    // if(ls.get('localLayout')){
    //   var tempObj = ls.get('localLayout');
    //   tempObj['ycombinator']['endDate']= new Date();
    //   tempObj['newsycombinator']['endDate']= new Date();
    //   tempObj['makeschool']['endDate']= new Date();
    //   ls.set('localLayout', tempObj);
    // }
    return (
      <div className="App" style={{backgroundColor: ls.get('localLayout')?ls.get('localLayout').skinColor: '#f2f2f2'}}>
        <div className="upper-bar">
          <div style={{marginRight: "10px"}}>Change layout settings!</div>
          <label className="switch">
            <input type="checkbox" onChange={this.handleCheckBoxClick}/>
            <span className="slider round"></span>
          </label>
        </div>
        
      {
        function(){
          if(!this.state.editLayout){
            return <MyFirstGrid />
          }else {
            return <EditLayoutForm />
          }
        }.bind(this)()
      }
      </div>
     )     

  } 
}

export default App;
