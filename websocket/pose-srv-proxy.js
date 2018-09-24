import WebSocketConnection from './websocket';
import PoseEvent from '../api/pose_event';
import MsgHeader from '../api/msg_header';

import {POSE_SRV_INITILIZED, POSE_UPDATE} from '../api/msg_types';

import MqttConnection from './mqtt-client';

const uuidv4 = require('uuid/v4');
  
// var mqttClient = Client.connect("mqtt://mqtt.thorman.eu:8883",{clientId:"mqttjs01"});

// mqttClient.subscribe("posetracking/user/device-id/pose-event", {qos:0});

  /**
   * This is a websocket class that Implements the logic according for thsi connection to the server.
   */
  class PoseSrvProxy {
    /**
     * Constructor
     */
    constructor(clientId) {
      this.mqttClient = null;
      this.ws = null;
    
      this.useMqtt = true;
      this.useWebsocket = false;
      
      this.deviceId = 'WebClient_1';
      if (this.useMqtt) {
        this.mqttClient = new MqttConnection('POSE_CLIENT_' + uuidv4());
        this.mqttClient.username = 'TODO';
        this.mqttClient.password = 'TODO';
        this.mqttClient.connectToMqttSrv('mqtts://mqtt.thorman.eu/mqtt/');
      }
      
      if (this.useWebsocket) {
        this.ws = new WebSocketConnection();
      // this.ws.initializeSocket('ws://localhost:8111');
        this.ws.initializeSocket('wss://posesrv.thorman.eu/ws/');
      }
      
      this.sendPoseServerInitialized = this.sendPoseServerInitialized.bind(this);
      this.sendPoseUpdateToSrv = this.sendPoseUpdateToSrv.bind(this);
      this.convertPoseEvent = this.convertPoseEvent.bind(this);
    };
  
    sendPoseServerInitialized(guiState) {
        let msg = new MsgHeader();
        msg.type = 'POSE_SRV_INITILIZED';
        msg.version = 1.0;
        msg.sendTime = Date.now();
        msg.payload = guiState;
      
        if (this.useWebsocket) {
            this.ws.sendMsg(msg);
        }
      
        if (this.useMqtt) {
            this.mqttClient.sendMsg(msg, "posetracking/${ClientId}/" + this.deviceId + "/${SessionId}/pose-settings");
        }
      }
      
      sendPoseUpdateToSrv(poses) {
        // Only send the result with highest probability
        var maxScore = 0.0;
        var maxProbabilityIndex = 0;
        var i = 0;
        poses.forEach(element => {
          if (element.score > maxScore) {
            maxScore = element.score;
            maxProbabilityIndex = i;
          }
          i = i + 1;
        });
      
        // Return the result with highest probability
        if (poses.length == 0) {
          console.log('No poses received');
          return;
        }
        let poseEvent = this.convertPoseEvent(poses[maxProbabilityIndex]);
        let msg = new MsgHeader();
        msg.type = 'POSE_UPDATE';
        msg.version = 1.0;
        msg.sendTime = Date.now();
        msg.payload = poseEvent;
      
        if (this.useWebsocket) {
            this.ws.sendMsg(msg);
        }
        
        if (this.useMqtt) {
            this.mqttClient.sendMsg(msg, "posetracking/${ClientId}/" + this.deviceId + "/${SessionId}/pose-event");
        }
      }
      
      convertPoseEvent(event) {
      //  console.log('event: ' + JSON.stringify(event));
      let poseEvent = new PoseEvent();
        event.keypoints.forEach(elem => {
            if (elem.part === 'leftAnkle') {
                poseEvent.leftAnkle = elem.position;
            } else if (elem.part === 'rightAnkle') {
                poseEvent.rightAnkle = elem.position;
            }if (elem.part === 'leftEar') {
                poseEvent.leftEar = elem.position;
            }if (elem.part === 'rightEar') {
                poseEvent.rightEar = elem.position;
            }if (elem.part === 'leftElbow') {
                poseEvent.leftElbow = elem.position;
            }if (elem.part === 'rightElbow') {
                poseEvent.rightElbow = elem.position;
            }if (elem.part === 'leftEye') {
                poseEvent.leftEye = elem.position;
            }if (elem.part === 'rightEye') {
                poseEvent.rightEye = elem.position;
            }if (elem.part === 'leftHip') {
                poseEvent.leftHip = elem.position;
            }if (elem.part === 'rightHip') {
                poseEvent.rightHip = elem.position;
            }if (elem.part === 'leftKnee') {
                poseEvent.leftKnee = elem.position;
            }if (elem.part === 'rightKnee') {
                poseEvent.rightKnee = elem.position;
            } if (elem.part === 'leftShoulder') {
                poseEvent.leftShoulder = elem.position;
            } if (elem.part === 'rightShoulder') {
                poseEvent.rightShoulder = elem.position;
            } if (elem.part === 'leftWrist') {
                poseEvent.leftWrist = elem.position;
            } if (elem.part === 'rightWrist') {
                poseEvent.rightWrist = elem.position;
            } if (elem.part === 'nose') {
                poseEvent.nose = elem.position;
            } if (elem.part === 'tightAnkle') {
                poseEvent.tightAnkle = elem.position;
            }
        });
        return poseEvent;
      }
}
  
export default PoseSrvProxy;
