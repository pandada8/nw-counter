import React from "react";
import ReactDOM from "react-dom";
import Reflux from "reflux";
import {Tabs, Tab} from "material-ui/lib/tabs";
import Paper from "material-ui/lib/paper";
import Colors from "material-ui/lib/styles/colors";
import TextField from "material-ui/lib/text-field";
import Toggle from "material-ui/lib/toggle";
import _ from "lodash";
import Knob from "./knob.jsx"
import FlatButton from "material-ui/lib/flat-button";
import DropDownMenu from "material-ui/lib/drop-down-menu"

let injectTapEventPlugin = require("react-tap-event-plugin");
injectTapEventPlugin();

// Store part
var css = require("./style.css");

let alarmActions = Reflux.createActions([
  "alarm"
])

let alarmStore　= Reflux.createStore({
  listenables: alarmActions,
  alarm: function(){
    this.trigger.apply(this, _.toArray(arguments))
  }
})

let CounterActions = Reflux.createActions([
  "start",
  "resetTime",
  "pause",
  "toggle",
  "switch",
  "_config"
])

let CounterStore = Reflux.createStore({
  listenables: CounterActions,
  init: function(){
    this.config　= {
      alert30: true,
      alertfinish: true,
      time_class: 240 * 1000,
      time_free: 180 * 1000,
      time_ask: 60 * 1000,
      alarmtime: 30 * 1000
    }
    this.state = {
       status: "stopped",
       step: "class",
    }
    this.state.now = this.config['time_'+ this.state.step],
    this.timer = setInterval(this.tick, 100)
  },
  switch: function(plan){
    if(["class", 'free', 'ask'].indexOf(plan) > -1){
      this.state.step = plan
      let max = this.config["time_"+this.state.step]
      this.state.now = this.state.now > max ? max : this.state.now
      this._msg()
    }
  },
  tick: function(){
    const TICK = 100
    console.log(this.state.status, this.state.now)
    if(this.state.status == "running"){
      if(this.state.now == this.config.alarmtime){
        alarmActions.alarm("before")
      }
      if(this.state.now >= TICK){
        this.state.now -= TICK
        this._msg()
      }else{
        alarmActions.alarm("finish")
        this.state.now = 0
        this.state.status = "stopped"
        this._msg()
      }
    }else{
      return
    }
  },
  _config: function(config){
    this.config = _.extend(this.config, config)
    this._msg()
  },
  _msg: function(){
    this.trigger({
      config: this.config,
      now: this.state.now,
      status: this.state.status,
      step: this.state.step,
      max: this.config["time_"+this.state.step],
    })
  },
  start: function(){
    if(this.state.status == "running")
      return
    if(this.state.now >= 0){
      this.state.status = "running"
      this.tick()
    }
  },
  pause: function(){
    this.state.status = "stopped"
    this._msg()
  },
  toggle: function(){
    if(this.state.status == "running"){
      this.pause()
    }else{
      this.start()
    }
  },
  resetTime: function(){
    this.state.status = "stopped"
    this.state.now = this.config["time_"+this.state.step]
    this._msg()
  }
})

let Circle = React.createClass({
  render() {
    var props = this.props
    var strokeWidth = props.strokeWidth;
    var radius = (50 - strokeWidth / 2);
    var pathString = `M 50,50 m 0,-${radius}
     a ${radius},${radius} 0 1 1 0,${2 * radius}
     a ${radius},${radius} 0 1 1 0,-${2 * radius}`;
    var len = Math.PI * 2 * radius;
    var pathStyle = {
      'strokeDasharray': `${len}px ${len}px`,
      'strokeDashoffset': `${((100 - props.percent) / 100 * len)}px`,
      'transition': 'stroke-dashoffset 0.6s ease 0s, stroke 0.6s ease'
    };
    ['strokeWidth', 'strokeColor', 'trailWidth', 'trailColor'].forEach((item) => {
      if (item === 'trailWidth' && !props.trailWidth && props.strokeWidth) {
        props.trailWidth = props.strokeWidth;
        return;
      }
      if (!props[item]) {
        props[item] = defaultProps[item];
      }
    });

    return (
      <svg className='rc-progress-circle' viewBox='0 0 100 100'>
        <path className='rc-progress-circle-trail' d={pathString} stroke={props.trailColor}
          strokeWidth={props.trailWidth} fillOpacity='0'/>
        <path className='rc-progress-circle-path' d={pathString} strokeLinecap='round'
          stroke={props.strokeColor} strokeWidth={props.strokeWidth} fillOpacity='0' style={pathStyle} />
      </svg>
    );
  }
});


let Counter = React.createClass({
  mixins:[Reflux.listenTo(CounterStore, "onStatusChange"), Reflux.listenTo(alarmStore, "onAlarm")],
  onAlarm: function(type){
    switch(type){
      case "before":
      let dom = ReactDOM.findDOMNode(this.refs.alarmbefore)
      dom.paused && dom.play()
      return
      case "finish":
      ReactDOM.findDOMNode(this.refs.alarmfinish).play()
      return

    }
  },
  onStatusChange: function(data){
    this.setState({
      now: data.now,
      status: data.status,
      step: data.step,
      config: data.config,
      percent: data.now / data.max * 100
    })
  },
  getInitialState: function(){
    return {
      config: CounterStore.config,
      status: CounterStore.state.status,
      step: CounterStore.state.step,
      now: CounterStore.config["time_"+CounterStore.state.step],
      max: CounterStore.config["time_"+CounterStore.state.step],
      degree: 180
    }
  },
  handleClick: function(e){
    if(ReactDOM.findDOMNode(this.refs.config).contains(e.target)){
      return
    }
    CounterActions.toggle()
  },
  ChangePlan: function(e, n, item){
    CounterActions.switch(item.payload)
  },
  render: function(){
    let style = {
      text: {
        position: "absolute",
        width: "100%",
        top: "50%",
        textAlign: "center",
        marginTop: -80,
        paddingRight: 60,
        boxSizing:　"border-box",
      },
      text_inner: {
        fontSize: 90,
        color: (this.state.status == "running" && this.state.now <= 30*100) ? Colors.red600　: Colors.black
      }
    }
    let time
    if (this.state.now > 30){
      let t = this.state.now / 1000;
      time = `${Math.floor(t / 60)}:${_.padLeft(Math.floor(t%60).toString(), 2, '0')}`
    }else{
      time = `${Math.floor(this.state.now / 100)/10}`
    }
    let color = this.state.status == "running" ? (this.state.now > 30*1000 ? Colors.blue400 : Colors.red400) : Colors.grey600

    let configs = [
      { payload: "class", text: "班级风采展示时间"},
      { payload: "free", text: "自由展示时间"},
      { payload: "ask", text: "评委嘉宾提问时间"},
    ]
    return <div>
        <Paper zIndex={2} style={{maxWidth: 600, padding: "30px", position: "relative",margin: "auto" , marginTop: 30, }} onClick={this.handleClick} >
          <div style={style.text}>
            <DropDownMenu ref="config" menuItems={configs} onChange={this.ChangePlan}/><br/>
            <div style={style.text_inner}>{time}</div><br/>
            <FlatButton label="重置" onClick={e=>{e.stopPropagation(),CounterActions.resetTime()}}/>
          </div>
          <Circle  strokeWidth={4} strokeColor={color} percent={this.state.percent} trailWidth={2} trailColor={Colors.grey300} />
        </Paper>
        <div>
          <audio ref="alarmbefore" src="static/30.mp3" preload="auto"></audio>
          <audio ref="alarmfinish" src="static/finish.mp3" preload="auto"></audio>
        </div>

      </div>
  }
})

let Settings = React.createClass({
  mixins: [Reflux.listenTo(CounterStore, "onConfigUpdate")],
  onConfigUpdate: function(data){
    console.log(data.config)
    this.setState({config: data.config})
  },
  render: function(){
    let style = {
      marginBottom: 16,
      paddingLeft: 16,
    }
    let input_style = {
      marginTop: -10,
      paddingLeft: 16,
    }
    return <Paper zIndex={2} style={{maxWidth: "600", margin: "auto", paddingTop: 8, marginTop: 10}}>
      <h3 style={style}>时间设置</h3>
      <div style={input_style}>
        <TextField hintText="以秒为单位" floatingLabelText="班级风采展示时间"
        onBlur={e=>{CounterActions._config({time_class:e.target.value*1000})}}
        onEnterKeyDown={e=>{CounterActions._config({time_class:e.target.value*1000})}}
        defaultValue={this.state.config.time_class/1000}/>
      </div>
      <div style={input_style}>
        <TextField hintText="以秒为单位" floatingLabelText="自由展示时间"
        onBlur={e=>{CounterActions._config({time_free:e.target.value*1000})}}
        onEnterKeyDown={e=>{CounterActions._config({time_free:e.target.value*1000})}}
        defaultValue={this.state.config.time_free/1000}/>
      </div>
      <div style={input_style}>
        <TextField hintText="以秒为单位" floatingLabelText="评委嘉宾提问时间"
        onBlur={e=>{CounterActions._config({time_ask:e.target.value*1000})}}
        onEnterKeyDown={e=>{CounterActions._config({time_ask:e.target.value*1000})}}
        defaultValue={this.state.config.time_ask/1000}/>
      </div>
      <div style={input_style}>
        <TextField hintText="以秒为单位" floatingLabelText="提醒时间"
        onBlur={e=>{CounterActions._config({alarmtime:e.target.value*1000})}}
        onEnterKeyDown={e=>{CounterActions._config({alarmtime:e.target.value*1000})}}
        defaultValue={this.state.config.alarmtime/1000}/>
      </div>
      <h3 style={style}>提示设置</h3>
      <div style={style}>
        <Toggle defaultToggled={this.state.config.alert30} label={"还有"+this.state.config.alarmtime/1000+"秒时提示"} onToggle={ (e, toggled)=> {CounterActions._config({alert30: toggled}) }}/>
      </div>
      <div style={style}>
        <Toggle defaultToggled={this.state.config.alertfinish} label="结束时提示" onToggle={ (e, toggled)=> {CounterActions._config({alertfinish: toggled}) }} />
      </div>
      <div style={{textAlign: "center", color: Colors.grey400, fontSize: "0.9em",padding: "20px 0"}}>Powered By: Pandada8</div>

    </Paper>
  },
  getInitialState: function(){
    return {
      config: CounterStore.config
    }
  }
})

let Root = React.createClass({
  render: function (){
    return <Tabs>
      <Tab label="倒计时" >
        <Counter />
      </Tab>
      <Tab label="设置" >
        <Settings />
      </Tab>
    </Tabs>
  }
})
ReactDOM.render(<Root />, document.getElementById('container'))