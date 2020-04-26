import WebSocketConnection from './websocket';
import PoseEvent from '../api/pose_event';
import MsgHeader from '../api/msg_header';

import {
    POSE_SRV_INITILIZED,
    POSE_UPDATE
} from '../api/msg_types';

import MqttConnection from './mqtt-client';

const uuidv4 = require('uuid/v4');

// var mqttClient = Client.connect("mqtt://mqtt.thorman.eu:8883",{clientId:"mqttjs01"});

// mqttClient.subscribe("posetracking/user/device-id/pose-event", {qos:0});

const localWsMqttUrl = 'ws://192.168.68.117:9080';
const localWssMqttUrl = 'wss://192.168.68.117:9443';

/**
 * This is a websocket class that Implements the logic according for thsi connection to the server.
 */
class PoseSrvProxy {
    /**
     * Constructor
     */
    constructor(clientId, useWss, poseSrvConnectedCallback) {
        this.mqttClient = null;
        this.ws = null;
        this.useWss = useWss;

        this.useMqtt = true;
        this.useWebsocket = false;
        this.videoWidth = 600;
        this.videoHeight = 500;

        this.deviceId = 'PoseCore-WebClient';
        this.clientId = clientId;
        this.poseSettingVersion = 1;
        this.poseEventVersion = 1;

        // Use this to inform the client that the connection is open
        this.poseSrvConnectedCallback = poseSrvConnectedCallback;

        this.sendPoseServerInitialized = this.sendPoseServerInitialized.bind(this);
        this.sendPoseUpdateToSrv = this.sendPoseUpdateToSrv.bind(this);
        this.convertPoseEvent = this.convertPoseEvent.bind(this);
        this.connectToMqttSrv = this.connectToMqttSrv.bind(this);
        this.setScreenSize = this.setScreenSize.bind(this);
        this.convertPositionToPercent = this.convertPositionToPercent.bind(this);
        this.cleanValuePercentage = this.cleanValuePercentage.bind(this);
    };

    connectToMqttSrv() {
        console.log('Connecting to communication channel');
        if (this.useMqtt) {
            this.mqttClient = new MqttConnection('POSE_CLIENT_' + uuidv4());
            this.mqttClient.username = '';
            this.mqttClient.password = '';
            if (this.useWss) {
                this.mqttClient.connectToMqttSrv(localWssMqttUrl, this.useWss, this.poseSrvConnectedCallback);
            } else {
                this.mqttClient.connectToMqttSrv(localWsMqttUrl, this.useWss, this.poseSrvConnectedCallback);
            }
        }

        if (this.useWebsocket) {
            console.log('Connecting to Websocket');
            this.ws = new WebSocketConnection();
            // this.ws.initializeSocket('ws://localhost:8111');
            this.ws.initializeSocket('wss://posesrv.thorman.eu/ws/');
        }
    }

    sendPoseServerInitialized(guiState) {
        let msg = new MsgHeader();
        msg.type = POSE_SRV_INITILIZED;
        msg.version = 1.0;
        msg.sendTime = Date.now();
        msg.payload = guiState;

        if (this.useWebsocket) {
            if (this.ws !== null) {
                this.ws.sendMsg(msg);
            }
        }

        if (this.useMqtt) {
            if (this.mqttClient !== null) {
                this.mqttClient.sendMsg(msg, 'json/posecore/' + this.clientId + '/' + this.deviceId + '/pose-settings/' + this.poseSettingVersion);
            }
        }
    }

    sendPoseUpdateToSrv(poses) {
//        console.log('New pose: ' + JSON.stringify(poses));
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
//        console.log('Pose-event to send: ' + JSON.stringify(poseEvent));
        let msg = new MsgHeader();
        msg.type = POSE_UPDATE;
        msg.version = 1.0;
        msg.sendTime = Date.now();
        msg.payload = poseEvent;

        if (this.useWebsocket) {
            if (this.ws !== null) {
                this.ws.sendMsg(msg);
            }
        }

        if (this.useMqtt) {
            if (this.mqttClient !== null) {
                this.mqttClient.sendMsg(msg, 'json/posecore/' + this.clientId + '/' + this.deviceId + '/pose-event/' + this.poseEventVersion);
            }
        }
    }

    setScreenSize(height, width) {
        this.videoHeight = height;
        this.videoWidth = width;
        console.log('Screen size (h: ' + this.videoHeight + ', w: ' + this.videoWidth + ')');
    }

    /**
     * Converts from the PoseNet JSON structure to the PoseApi JSON Format.
     */
    convertPoseEvent(event) {
        //  console.log('event: ' + JSON.stringify(event));
        let poseEvent = new PoseEvent();
        event.keypoints.forEach(elem => {
            if (elem.part === 'leftAnkle') {
                poseEvent.leftFoot = this.convertPositionToPercent(elem.position);
            } else if (elem.part === 'rightAnkle') {
                poseEvent.rightFoot = this.convertPositionToPercent(elem.position);
            }
            if (elem.part === 'leftEar') {
                poseEvent.leftEar = this.convertPositionToPercent(elem.position);
            }
            if (elem.part === 'rightEar') {
                poseEvent.rightEar = this.convertPositionToPercent(elem.position);
            }
            if (elem.part === 'leftElbow') {
                poseEvent.leftElbow = this.convertPositionToPercent(elem.position);
            }
            if (elem.part === 'rightElbow') {
                poseEvent.rightElbow = this.convertPositionToPercent(elem.position);
            }
            if (elem.part === 'leftEye') {
                poseEvent.leftEye = this.convertPositionToPercent(elem.position);
            }
            if (elem.part === 'rightEye') {
                poseEvent.rightEye = this.convertPositionToPercent(elem.position);
            }
            if (elem.part === 'leftHip') {
                poseEvent.leftHip = this.convertPositionToPercent(elem.position);
            }
            if (elem.part === 'rightHip') {
                poseEvent.rightHip = this.convertPositionToPercent(elem.position);
            }
            if (elem.part === 'leftKnee') {
                poseEvent.leftKnee = this.convertPositionToPercent(elem.position);
            }
            if (elem.part === 'rightKnee') {
                poseEvent.rightKnee = this.convertPositionToPercent(elem.position);
            }
            if (elem.part === 'leftShoulder') {
                poseEvent.leftShoulder = this.convertPositionToPercent(elem.position);
            }
            if (elem.part === 'rightShoulder') {
                poseEvent.rightShoulder = this.convertPositionToPercent(elem.position);
            }
            if (elem.part === 'leftWrist') {
                poseEvent.leftWrist = this.convertPositionToPercent(elem.position);
            }
            if (elem.part === 'rightWrist') {
                poseEvent.rightWrist = this.convertPositionToPercent(elem.position);
            }
            if (elem.part === 'nose') {
                poseEvent.nose = this.convertPositionToPercent(elem.position);
            }
            if (elem.part === 'tightAnkle') {
                poseEvent.tightAnkle = this.convertPositionToPercent(elem.position);
            }
        });
        return poseEvent;
    }

    /**
     * Converts the x & y-values from screen pixels to % (based on video-height & width)
     * @param {The position to convert)} pos 
     */
    convertPositionToPercent(pos) {
        return {
            "x": this.cleanValuePercentage((100*pos.x)/this.videoWidth),
            "y": 100 - this.cleanValuePercentage((100*pos.y)/this.videoHeight),
            "z": 0  // Posenet doesn't support depth
        };
    }

    /**
     * Ensures that the given value is between 0 - 100
     * @param {The value to check} v 
     */
    cleanValuePercentage(v) {
        if (v < 0) {
            v = 0;
        } else if (v > 100) {
            v = 100;
        }
        return v;
    }
}

export default PoseSrvProxy;