import {
  WS_CLIENT_CONNECTED
} from '../api/msg_types';
import ClientConnectedMsg from '../api/client_connected_msg';
const uuidv4 = require('uuid/v4');

/**
 * This is a websocket class that Implements the logic according for thsi connection to the server.
 */
class WebSocketConnection {
  /**
   * Constructor
   */
  constructor() {
    this.socket = null;
    this.clientId = 'POSENET_CLIENT_' + uuidv4();

    this.sendMsg = this.sendMsg.bind(this);
    this.sendClientConnected = this.sendClientConnected.bind(this);
  };

  /**
   * Initializes the socket
   * @param {The websocket URL} url
   */
  initializeSocket(url) {
    this.socket = new WebSocket(url)

    // Initialize socket handlers
    this.socket.onopen = this.onSocketOpen.bind(this);
    this.socket.onmessage = this.onMessage.bind(this);
  };

  /**
   * Sends the given data JSON:ified on the websocket
   * @param {the messge to send} msg
   */
  sendMsg(msgObj) {
    this.socket.send(JSON.stringify(msgObj));
  }

  /**
   * called when the websocket connection is established
   */
  onSocketOpen() {
    console.log('Websocket connected');
    this.sendClientConnected();
  }

  /**
   * This function is called whenever we receive a message on the websocket.
   * @param {The received event} event
   */
  onMessage(event) {
    console.log('Websocket event received: ' + event.data);
    const data = JSON.parse(event.data)
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
    this.socket.send(JSON.stringify(msg));
  }
}

export default WebSocketConnection;
