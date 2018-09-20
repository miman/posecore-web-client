import {
    WS_CLIENT_CONNECTED
  } from '../api/msg_types';
  import ClientConnectedMsg from '../api/client_connected_msg';
  import Client from 'mqtt';
  const uuidv4 = require('uuid/v4');
  
// var mqttClient = Client.connect("mqtt://mqtt.thorman.eu:8883",{clientId:"mqttjs01"});

// mqttClient.subscribe("posetracking/user/device-id/pose-event", {qos:0});

  /**
   * This is a websocket class that Implements the logic according for thsi connection to the server.
   */
  class MqttConnection {
    /**
     * Constructor
     */
    constructor(clientId) {
      this.mqttClient = null;
      this.clientId = clientId;
      this.sessionId = uuidv4();
  
      this.sendMsg = this.sendMsg.bind(this);
      this.sendClientConnected = this.sendClientConnected.bind(this);

      this.postOptions={
          retain:false,
          qos:0
        };
    };
  
    /**
     * Connects to a MQTT srv
     * url example: mqtt://mqtt.thorman.eu:8883
     * @param {The  URL to the MQTT srv} url
     * @param {The  client id} id
     */
    connectToMqttSrv(url) {
      this.mqttClient = Client.connect(url,{clientId:this.clientId});
  
      // Initialize handlers
      this.mqttClient.on("connect", this.onConnectedToMqttSrv.bind(this));
      this.mqttClient.on("message", this.onMessage.bind(this));
    };
  
    /**
     * Sends the given data JSON:ified on the websocket
     * @param {the messge to send} msg
     */
    sendMsg(msgObj, topic) {
        let processedTopic = topic.replace("${ClientId}", this.clientId);
        processedTopic = processedTopic.replace("${SessionId}", this.sessionId);
        this.mqttClient.publish(processedTopic, JSON.stringify(msgObj), this.postOptions);
    }
  
    /**
     * called when the websocket connection is established
     */
    onConnectedToMqttSrv() {
      console.log('MQTT connection connected');
      this.sendClientConnected();
    }
  
    /**
     * This function is called whenever we receive a message on the websocket.
     * @param {The received event} event
     */
    onMessage(topic, message, packet) {
        console.log("MQTT-Msg received on topic [" + topic + "]: " + message);

      const data = JSON.parse(message);
      console.log('received type: ' + data.type);
      //        this.dispatch(data);
    }
  
    /**
     * This function sends a Client connected message to the server.
     */
    sendClientConnected() {
      var ccMsg = new ClientConnectedMsg(this.clientId);
  
      var msg = {
        type: WS_CLIENT_CONNECTED,
        payload: ccMsg
      };
      this.sendMsg(msg, "posetracking/" + this.clientId + "/1/client/connected");
    }
  }
  
  export default MqttConnection;
