import React from "react";
import ReactDOM from "react-dom";
import Reflux from "reflux";
import {Tabs, Tab} from "material-ui/lib/tabs";
import Paper from "material-ui/lib/paper";
import Colors from "material-ui/lib/styles/colors";
import TextField from "material-ui/lib/text-field";
import Toggle from "material-ui/lib/toggle";
import _ from "lodash";

let injectTapEventPlugin = require("react-tap-event-plugin");
injectTapEventPlugin();

// Store part

let CounterActions = Reflux.createActions([
  "start",
  "reset",
  "pause",
  "toggle",
])

let CounterStore = Reflux.createStore({
  listenables: CounterStore,
  init: function(){
    this.state = {
       status: "stopped",
    }
    this.config　= {
      alert30: true,
      alertfinish: true,
      time_class: 240,
      time_free: 180,
      time_ask: 60
    }
  },
  start: function(max){
    if(this.state == "running")
      return
    if(this.state == "pause"){
      if(this.time >= 0){
        let step = 200;
        this.timer = setInterval(()=> {
          if(this.state == "running"){
            if(this.time >= 0){
              this.time -= step / 1000
              this.trigger(this)
            }
          }else{
            this.timer && window.clearInterval(this.timer)
          }
        }, step)
      }
    }
  },
  getConfig: function(){
    return this.config
  }
})

let Settings = React.createClass({
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
        <TextField hintText="以秒为单位" floatingLabelText="班级风采展示时间" />
      </div>
      <div style={input_style}>
        <TextField hintText="以秒为单位" floatingLabelText="自由展示时间" />
      </div>
      <div style={input_style}>
        <TextField hintText="以秒为单位" floatingLabelText="评委嘉宾提问时间" />
      </div>
      <h3 style={style}>提示设置</h3>
      <div style={style}>
        <Toggle value={this.state.config.alert30} label="还有30秒时提示" />
      </div>
      <div style={style}>
        <Toggle value={this.state.config.alertfinish} label="结束时提示" />
      </div>
      <div style={{textAlign: "center", color: Colors.grey400, fontSize: "0.9em", padding: "20px 0"}}>Powered By: Pandada8</div>
    </Paper>
  },
  getInitialState: function(){
    return {
      config: {
        alert30: true,
        alertfinish: true,
        time_class: 240,
        time_free: 180,
        time_ask: 60
      }
    }
  }
})

let Root = React.createClass({
  render: function (){
    return <Tabs>
      <Tab label="倒计时" >
        (Tab content...) 中文
      </Tab>
      <Tab label="设置" >
        <Settings />
      </Tab>
    </Tabs>
  }
})
ReactDOM.render(<Root />, document.getElementById('container'))

// bind the root