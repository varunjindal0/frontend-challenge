import React, { Component, PureComponent } from 'react';
import * as ls from 'local-storage';
import './App.css';


class Block extends Component{
  constructor(props){
    super(props);
    this.state={data: []};
  }

  isInTimeRange = (date, locaStorageIdentifier)=>{
    if(new Date(date)<=new Date(ls.get('localLayout')[locaStorageIdentifier]['endDate']) && new Date(date) >= new Date(ls.get('localLayout')[locaStorageIdentifier]['startDate'])){
      return true;
    }else {
      return false;
    }
  }

  render(){
    var heading = null;
    var locaStorageIdentifier = null;
    if(this.props.data.length===0){
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
                  function(){
                    var num = ls.get('localLayout')?ls.get('localLayout')[locaStorageIdentifier].count : 30;
                    var arr = [];
                    for(var i=0; i<num; i++){
                      var date = new Date(this.props.data[i].created_at);
                      if(!ls.get('localLayout') || (ls.get('localLayout') && this.isInTimeRange(date, locaStorageIdentifier))){
                        var n = this.props.data[i].text.split(" ");
                        var url = null;
                        var content;
                        var usrName = null;
                        if(n[0]==='RT' && n[1][0]==='@'){
                          // do this
                          if(this.props.data[i]["retweeted_status"]["entities"]["urls"][0]){
                            url=this.props.data[i]["retweeted_status"]["entities"]["urls"][0]["url"];
                            // console.log(url); 
                          }
                          
                          usrName = n.splice(0, 2).join(" ");
                          content = n.join(" ");
                        }else {
                           url = n.splice(-1);
                           content = n.join(" ");
                        }
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

class MyFirstGrid extends PureComponent{
  constructor(props){
    super(props);
    
    // const newsycombinator = 'http://localhost:7890/1.1/statuses/user_timeline.json?count=30&screen_name=newsycombinator';
    // const ycombinator = 'http://localhost:7890/1.1/statuses/user_timeline.json?count=30&screen_name=ycombinator';
    // const makeschool = 'http://localhost:7890/1.1/statuses/user_timeline.json?count=30&screen_name=makeschool';
    // this.state={leftSide: ycombinator, middle: makeschool, rightSide: newsycombinator};
    // var localLayout = ls.get('localLayout');

    // this.state = {orderOfColumns: {'leftSide' :  ls.get('localLayout')?ls.get('localLayout')['left']:'ycombinator' , 
    //                               'middle' : ls.get('localLayout')?ls.get('localLayout')['middle']:'makeschool',
    //                               'rightSide' : ls.get('localLayout')?ls.get('localLayout')['right']:'newsycombinator'}, }

     this.state = {orderOfColumns: [ls.get('localLayout')?ls.get('localLayout')['left']:'ycombinator' , 
                                    ls.get('localLayout')?ls.get('localLayout')['middle']:'makeschool',
                                    ls.get('localLayout')?ls.get('localLayout')['right']:'newsycombinator'],
                  data: {'ycombinator': [], 'newsycombinator': [], 'makeschool': []} ,
                  ycombinator: [],
                  newsycombinator: [],
                  makeschool: []
                }
    
  }

  componentDidMount(){
    var urlArr = ['http://localhost:7890/1.1/statuses/user_timeline.json?count=30&screen_name=ycombinator', 'http://localhost:7890/1.1/statuses/user_timeline.json?count=30&screen_name=makeschool', 'http://localhost:7890/1.1/statuses/user_timeline.json?count=30&screen_name=newsycombinator']
    var dic = {'0': 'ycombinator', '1': 'makeschool', '2': 'newsycombinator'}
    var tempObj={};

    Promise.all(urlArr.map(url=>{
      return fetch(url);
    }))
    .then(responses=>{
      return Promise.all(responses.map(res=>res.json()))
    })
    .then(allThreeposts=>{
      allThreeposts.forEach((posts, index)=>{
        tempObj[dic[index].toString()]=posts
      })
      this.setState({data: tempObj});
    })
    .catch(error=>{
      console.log("Error: "+error);
      // Handle failed fetch
      alert("Backend isn't responding...Please check.");
    })
  }

  drag(ev) {
    ev.dataTransfer.setData("text", ev.currentTarget.id);
  }
  drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
  // ev.target.appendChild(document.getElementById(data));
    this.swap(data, ev.currentTarget.id);
  }
  allowDrop(ev) {
    ev.preventDefault();
  }
  swap = (id1, id2)=>{
    var tempArr = Array.from(this.state.orderOfColumns);
    tempArr[parseInt(id1)] = this.state.orderOfColumns[parseInt(id2)];
    tempArr[parseInt(id2)] = this.state.orderOfColumns[parseInt(id1)];
    this.setState({orderOfColumns: tempArr}, function(){
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
      var dic = {
        "0": 'left',
        "1": 'middle',
        "2": 'right'
      }
      // ls.set('localLayout')
      tempObject[dic[id1]] =  this.state.orderOfColumns[parseInt(id1)];
      tempObject[dic[id2]] =  this.state.orderOfColumns[parseInt(id2)];
      ls.set('localLayout', tempObject);
    });
  }



  render() {
    
    // update localStorage
    var constUrlPart = 'http://localhost:7890/1.1/statuses/user_timeline.json?count=30&screen_name=';
    return (
        <div className="container" style={{backgroundColor: localStorage.getItem("overallSkin")?localStorage.getItem("overallSkin"): null} } >
          <div id="0" style={{flex: '1'}} draggable="true" onDragStart={(event)=>this.drag(event)} onDrop={(event)=>this.drop(event)} onDragOver={(event)=>this.allowDrop(event)} ><Block dataUrl={constUrlPart + this.state.orderOfColumns[0]} data={this.state.data[this.state.orderOfColumns[0]]}/></div>
          <div id="1" style={{flex: '1'}}  draggable="true" onDragStart={(event)=>this.drag(event)} onDrop={(event)=>this.drop(event)} onDragOver={(event)=>this.allowDrop(event)}><Block dataUrl={constUrlPart + this.state.orderOfColumns[1]} data={this.state.data[this.state.orderOfColumns[1]]}/></div>
          <div id="2" style={{flex: '1'}}  draggable="true" onDragStart={(event)=>this.drag(event)} onDrop={(event)=>this.drop(event)} onDragOver={(event)=>this.allowDrop(event)}><Block dataUrl={constUrlPart + this.state.orderOfColumns[2]} data={this.state.data[this.state.orderOfColumns[2]]}/></div>
       </div>
      )
  }
};

class EditLayoutForm extends PureComponent{
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
    // console.log("hexcolor func value: "+ this.isHexaColor(skinColor))
    if(skinColor!=="#000000" && this.isHexaColor(skinColor)){
      return true;
    }else {
      // console.log("I was printed: "+ skinColor)
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
    // console.log(ls.get("localLayout").ycombinator);
  }

  render(){
    return (
      <form className='form'>
        {/* <div className='formLine'>
          <span style={{flex: '1'}}></span>
          <h1 style={{flex: '1'}}>Date Range</h1>
          <h1 style={{flex: '1'}}>Number of Posts</h1>
          <h1 style={{flex: '1'}}>Position of Posts</h1>
        </div> */}
        <div className="formLine">
          <h2 style={{marginRight: '5px', flex: '1'}}>Y Combinator:</h2>
          <div style={{flex: '1'}}><MyDatePicker locaStorageIdentifier={'ycombinator'} /></div>
          <div style={{flex: '1'}}>
            <input type="number" style={{width: "50px", marginTop: "10px"}} id="ycombinatorCount" min="1" max="30" placeholder="num" />
          </div>
          {/* <div className="positionInput" style={{flex: '1'}}>
           <div className="positionRadioEntry"><label style={{marginRight: '5px'}}>L:</label> <input type="radio" name="ycombinator"  value="left" /></div> 
           <div className="positionRadioEntry"><label style={{marginRight: '5px'}}>M:</label ><input type="radio" name="ycombinator"  value="middle" /></div> 
           <div className="positionRadioEntry"><label style={{marginRight: '5px'}}>R:</label> <input type="radio" name="ycombinator"  value="right" /></div> 
          </div> */}
        </div>
        <div className="formLine">
          <h2 style={{marginRight: '5px', flex: '1'}}>Hacker News:</h2>
          <div style={{flex: '1'}}><MyDatePicker  locaStorageIdentifier={'newsycombinator'}/></div>
          <div style={{flex: '1'}}>
            <input type="number" style={{width: "50px", marginTop: "10px" }} id="newsycombinatorCount" min="1" max="30" placeholder="num" />
          </div>
          {/* <div className="positionInput" style={{flex: '1'}}>
           <div className="positionRadioEntry"><label style={{marginRight: '5px'}}>L:</label> <input type="radio" name="newsycombinator"  value="left" /></div> 
           <div className="positionRadioEntry"><label style={{marginRight: '5px'}}>M:</label ><input type="radio" name="newsycombinator"  value="middle" /></div> 
           <div className="positionRadioEntry"><label style={{marginRight: '5px'}}>R:</label> <input type="radio" name="newsycombinator"  value="right" /></div> 
          </div> */}
        </div>
        <div className="formLine">
          <h2 style={{marginRight: '5px', flex: '1'}}>Make School:</h2>
          <div style={{flex: '1'}}><MyDatePicker locaStorageIdentifier={'makeschool'}/></div>
          <div style={{flex: '1'}}>
            <input type="number" style={{width: "50px", marginTop: "10px"}} id="makeschoolCount" min="1" max="30" placeholder="num" />
          </div>
          {/* <div className="positionInput" style={{flex: '1'}}>
           <div className="positionRadioEntry"><label style={{marginRight: '5px'}}>L:</label> <input type="radio" name="makeschool"  value="left" /></div> 
           <div className="positionRadioEntry"><label style={{marginRight: '5px'}}>M:</label ><input type="radio" name="makeschool"  value="middle" /></div> 
           <div className="positionRadioEntry"><label style={{marginRight: '5px'}}>R:</label> <input type="radio" name="makeschool"  value="right" /></div> 
          </div> */}
        </div>
        <div className='formLine'> 
          <h2 style={{marginRight: '5px', flex: '1'}}>Pick Skin Color: </h2>
          <div style={{flex: '1'}}><input style={{width: '50px'}} id="skinColor" type='color' /></div>
          <span style={{flex: '1'}}></span>
          {/* <span style={{flex: '1'}}></span> */}
        </div>
        <div className='formLine'>
          <input className="button" onClick={this.layoutSubmission} type="submit" />
        </div>
      </form>  
      )
  }
}

class MyDatePicker extends PureComponent{
  state={};

  render(){
    var startDateId = this.props.locaStorageIdentifier+'startDate';
    var endDateId = this.props.locaStorageIdentifier + 'endDate'
    return (
      <div>
        <input type="date" id={startDateId} style={{marginLeft: '10px'}} />
        <input type="date" id  = {endDateId} style={{marginLeft: '10px'}} />
      </div>
    )
  }
}

class App extends PureComponent{

  state = {editLayout: {value: false}};

  handleCheckBoxClick = (e)=>{
    // this.setState({editLayout: !this.state.editLayout})
    var temp = {value: !this.state.editLayout.value};
    this.setState({editLayout: temp});
  }

  render() {
    return (
      <div className="App" style={{backgroundColor: ls.get('localLayout')?ls.get('localLayout').skinColor: '#f2f2f2'}}>
        <div className="upper-bar">
          <div style={{marginRight: "10px"}}>Change layout settings!</div>
          <label className="switch">
            <input type="checkbox" onChange={this.handleCheckBoxClick}/>
            <span className="slider round"></span>
          </label>
        </div>
        <div>
        {
          this.state.editLayout.value?<EditLayoutForm />:<MyFirstGrid />
        }
        </div>
      </div>
     )     

  } 
}

export default App;
