import {
  WS_CLIENT_CONNECTED
} from '../api/msg_types';
import ClientConnectedMsg from '../api/client_connected_msg';
import Client from 'mqtt';
const uuidv4 = require('uuid/v4');
const tls = require("tls");

var SECURE_KEY = '-----BEGIN PRIVATE KEY-----\
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDVD17RTpltxaaF\
+nePuSPX5A9wPVxiet5NtBuSWqZyUarxN60tSeeZteivWMOCZgqh3c2fB9Wf63QU\
6ZfGr6n/v/KEFTmcVBl1Owkh3XgLFIL9Iz9KP/KET7WFJAIxKK/8Uj3LFFr+tz6q\
CtJaraq3azCGi3JDlOlWYRjDVkRycSfnnY6wu8HkhXLgR6aJ4XfqaGXv/iYGLHXJ\
ZpeAyB7jWxj+JNDy6fb0FopNSvPdP4n3XOJVeYUhJyJT2ah2sz3PWBJWav+I6B7u\
cb1jMh6be8gupjTRI3AQFS+skTBV1R5qMeZrCS/BpIOPj6/fC35J0WOoMBPXw4+k\
EOzedpLHAgMBAAECggEBALsUAPSWKGBbwYk40QzQyulBJlEuf9U0/8eI0wDiOe59\
STT+5z+x+ftc4BA/R4RTJxjUEj2GeowuCUJnjc525jVbjI1vuaNLsQLfsHgc59AK\
1a2B6ou+tKp69u8OHCKgEE7kw79ygyfPLOXQFL5saU8efoBVJyKyOWSQY1b5g6Zb\
m5xP+3jPUWLqRb+1OTMvZ2w4AlX5Nxp2XHn0kW+RpGdvj70lZFvfEnHaSCKR3g0I\
/RkYuz0ItVq4iTpeUTPUXOhSCk3zjCP6YIgsniCHYo/xNPezdjsKt4nSGuqN2EE4\
dK2vcXm1J2P9xj3mF5Y4DSKXyNsVi3Tr08uhT35QifkCgYEA/4AQWhp2cqejc2t3\
hHG47fcLf4sPUqIZlehv136g7mAp+k7Xdk0wzyvdfE3QBKUDpO1fJz/7CRk1uQLi\
bDMwdVeYSRoQ3SM+lXdFVt90663RhJ/SvxxnPakl2KF5PYeKUV/vP698JQufj4EC\
PQ9uryr0ZE/1wlmxSBPcjRX+ML0CgYEA1XoONaWOsJiu3txeq3EEryS0s4u5Gl3l\
mbePR9XUlhfzrHqv2IxyxW9qMw5li/zRKl8b1WdJuKWhwNqGmvZeN0uFP1XRKuja\
FVIw1+XUmB3rzEjQpgVgd3qfOYTVRJKPlkoVz+1FbAH5wCDzajAjLiRKgSPozpZu\
YdAgm6oF89MCgYAboA8kjuPrtbB4lFAR4/Ho2ONHYRPBDYHSsZUWKbzgyUkApXGq\
euIiJE4IWKl7NxRTys6VAdf0veMPI/6zUD2XEmeGz+iu4Fat9n1qzTJpIRwcSOOS\
glGvWxCagasIOhV8gvDtY936a21PKNXDIF4JVo2iIvshjm0aq/sWzh/zyQKBgHQ7\
X68/9EAc8eGv9O+9uoIuJyE3K1K62z9l3WKMf5I1elxn9ISgfAEZ16Xy6cFdpvk+\
DaaU9WPO8xJRKUcIa2YJ/YPtktSdMdi4BpYWsjkc2X1CDDDI7qw/HKCxvXj3n6yB\
q/ypQMo9DSHaDw67JPyDj/leduy8pV8mdgqreVA3AoGBAJl+kDUEQO4jA7Ci9QCm\
R89euEv2TXzTYsLhYWGKTd7PH+9cfoEGliaWWnD1czdfV0WJ7nUkp2ryY2zCORyO\
9KAnjHWkHwvfIWnSS3VTbkSPHvyyfMABsK4Q/bnCtDyB7jwoRKuAw6S41L5KemhW\
/zAmzNYwyyjF7We+laZMFI9A\
-----END PRIVATE KEY-----';

var SECURE_CERT = '-----BEGIN CERTIFICATE-----\
MIIEDjCCAvagAwIBAgIUPtHzsBpd3287/2FrN+H71RjyVMowDQYJKoZIhvcNAQEL\
BQAwgYQxFTATBgNVBAMMDHBvc2Vjb3JlLmNvbTELMAkGA1UEBhMCU0UxCzAJBgNV\
BAgMAlZHMRMwEQYDVQQHDApHb3RoZW5idXJnMQ4wDAYDVQQKDAVNaU1hbjELMAkG\
A1UECwwCSVQxHzAdBgkqhkiG9w0BCQEWEG5vbmVAbm93aGVyZS5jb20wHhcNMjAw\
NDI2MDcwMDU0WhcNMjEwNDI2MDcwMDU0WjCBhDEVMBMGA1UEAwwMcG9zZWNvcmUu\
Y29tMQswCQYDVQQGEwJTRTELMAkGA1UECAwCVkcxEzARBgNVBAcMCkdvdGhlbmJ1\
cmcxDjAMBgNVBAoMBU1pTWFuMQswCQYDVQQLDAJJVDEfMB0GCSqGSIb3DQEJARYQ\
bm9uZUBub3doZXJlLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEB\
ANUPXtFOmW3FpoX6d4+5I9fkD3A9XGJ63k20G5JapnJRqvE3rS1J55m16K9Yw4Jm\
CqHdzZ8H1Z/rdBTpl8avqf+/8oQVOZxUGXU7CSHdeAsUgv0jP0o/8oRPtYUkAjEo\
r/xSPcsUWv63PqoK0lqtqrdrMIaLckOU6VZhGMNWRHJxJ+edjrC7weSFcuBHponh\
d+poZe/+JgYsdclml4DIHuNbGP4k0PLp9vQWik1K890/ifdc4lV5hSEnIlPZqHaz\
Pc9YElZq/4joHu5xvWMyHpt7yC6mNNEjcBAVL6yRMFXVHmox5msJL8Gkg4+Pr98L\
fknRY6gwE9fDj6QQ7N52kscCAwEAAaN2MHQwHQYDVR0OBBYEFGPXbnMXmeJj3nFJ\
9NYyFuDcbJIwMB8GA1UdIwQYMBaAFGPXbnMXmeJj3nFJ9NYyFuDcbJIwMBMGA1Ud\
JQQMMAoGCCsGAQUFBwMBMB0GA1UdEQQWMBSCDHBvc2Vjb3JlLmNvbYcEwKhEdTAN\
BgkqhkiG9w0BAQsFAAOCAQEAZmie0voI+rc6FpkmvgPT3SWJd3zMNZPYSHAXvAxq\
skBW2dx9LmxIUbx6Vi8lcWvZJSncYCAksGSWTnO7Wu9QpKjrKOsIu2Z5JryWjWwB\
5TkpLWLDuTGOUFidf7PkPClB6JSMMs8PZypjs3+d3mKfkRP4kxqiqeIUWiKxLBTO\
Sc19b8iS1yFkefcENR2oxd5sHa2UkQf4Uz+KKMiyo5brytocSnIAHCQYKSRv9A26\
FEsj1chweQ00p69tabDHbz6KnYKfEc1lUTYTD/nQqjjCmyme7BCXlDADUFPkEzG5\
uKswjfwKT7FOvPKuUGzAo6nDz49Q76NekqbnY3nNev1Y2w==\
-----END CERTIFICATE-----';

var SECURE_CA = '-----BEGIN CERTIFICATE REQUEST-----\
MIIDDzCCAfcCAQAwgYQxFTATBgNVBAMMDHBvc2Vjb3JlLmNvbTELMAkGA1UEBhMC\
U0UxCzAJBgNVBAgMAlZHMRMwEQYDVQQHDApHb3RoZW5idXJnMQ4wDAYDVQQKDAVN\
aU1hbjELMAkGA1UECwwCSVQxHzAdBgkqhkiG9w0BCQEWEG5vbmVAbm93aGVyZS5j\
b20wggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDVD17RTpltxaaF+neP\
uSPX5A9wPVxiet5NtBuSWqZyUarxN60tSeeZteivWMOCZgqh3c2fB9Wf63QU6ZfG\
r6n/v/KEFTmcVBl1Owkh3XgLFIL9Iz9KP/KET7WFJAIxKK/8Uj3LFFr+tz6qCtJa\
raq3azCGi3JDlOlWYRjDVkRycSfnnY6wu8HkhXLgR6aJ4XfqaGXv/iYGLHXJZpeA\
yB7jWxj+JNDy6fb0FopNSvPdP4n3XOJVeYUhJyJT2ah2sz3PWBJWav+I6B7ucb1j\
Mh6be8gupjTRI3AQFS+skTBV1R5qMeZrCS/BpIOPj6/fC35J0WOoMBPXw4+kEOze\
dpLHAgMBAAGgRTBDBgkqhkiG9w0BCQ4xNjA0MBMGA1UdJQQMMAoGCCsGAQUFBwMB\
MB0GA1UdEQQWMBSCDHBvc2Vjb3JlLmNvbYcEwKhEdTANBgkqhkiG9w0BAQsFAAOC\
AQEAN2hBlkKq7kcboxgF+LcGliJxUlR0LKCljVmODOg+raVRpAE74aUoynPToaKO\
GrOgzIKjbwZoBBFDd9YZQfu6lj796GzvkX1AEQBA0dD8XvovLuvpCb5T8s18Oehx\
49bvv0GPlMdFaSSMOaNDDEuDFwDpPoCMh7wDkmNDmh/JZ/ayTPQMPHdAWm8ZR7/b\
3m7Lylq60mWRdrN9oL/zShOu3qEt9iBLBIVe/i7zxNDWVlvjbA/UlvJcTj83hqjn\
cZ/Sanj05+gMy23lK+4Lp6ovH4R7kGQJBPKyzOMNpBMNH+LQ1TAgGAueq4Z4GMoy\
xINgVQo/EB384PLQANz0ZXYoSQ==\
-----END CERTIFICATE REQUEST-----';

const origCreateSecureContext = tls.createSecureContext;

tls.createSecureContext = options => {
  const context = origCreateSecureContext(options);

  const pem = fs
    .readFileSync("./rootCA.crt", { encoding: "ascii" })
    .replace(/\r\n/g, "\n");

  const certs = pem.match(SECURE_CERT);

  if (!certs) {
    throw new Error(`Could not parse certificate ./rootCA.crt`);
  }

  certs.forEach(cert => {
    context.context.addCACert(cert.trim());
  });

  return context;
};

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
    this.username = null;
    this.password = null;
    this.connectedCallback = null;
    // The URL we are connected to
    this.mqttUrl = null;

    this.sendMsg = this.sendMsg.bind(this);
    this.sendClientConnected = this.sendClientConnected.bind(this);
    this.onConnectFailed = this.onConnectFailed.bind(this);
    this.disconnect = this.disconnect.bind(this);

    this.postOptions = {
      retain: false,
      qos: 0
    };
  };

  /**
   * Connects to a MQTT srv
   * url example: mqtt://mqtt.thorman.eu:8883
   * 
   * 
   * @param {The  URL to the MQTT srv} url
   * @param {The  client id} id
   */
  connectToMqttSrv(url, connectedCallback) {
    console.log('Connecting to MQTT-srv: ' + url);
//    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
    this.connectedCallback = connectedCallback;
    this.mqttUrl = url;

    let options = {
      clientId: this.clientId,
      ca: SECURE_CA,
      key: SECURE_KEY,
      cert: SECURE_CERT,
      rejectUnauthorized: false,
      agent: false
    };
    if (this.username != null) {
      options.username = this.username;
      options.password = this.password;
    }
    this.mqttClient = Client.connect(url, options);

    // Initialize handlers
    this.mqttClient.on('connect', this.onConnectedToMqttSrv.bind(this));
    this.mqttClient.on('message', this.onMessage.bind(this));
    this.mqttClient.on('error', this.onConnectFailed.bind(this));
  };

  /**
   * Disconnects from the MQTT connection
   * @param {} callback 
   */
  disconnect(callback) {
    this.connectedCallback = callback;
    this.mqttClient.end(true);
  }

  /**
   * Sends the given data JSON:ified on the websocket
   * @param {the messge to send} msg
   */
  sendMsg(msgObj, topic) {
    let processedTopic = topic.replace('${ClientId}', this.clientId);
    processedTopic = processedTopic.replace('${SessionId}', this.sessionId);
    // Used to see the content of the actual msg being sent
//    console.log(util.inspect(msgObj));
    let msgToSend = JSON.stringify(msgObj);
    this.mqttClient.publish(processedTopic, msgToSend, this.postOptions);
    //        console.log('MQTT-msg [' + msgToSend + '] sent on topic: ' + processedTopic);
  }

  /**
   * called when the websocket connection is established
   */
  onConnectedToMqttSrv() {
    console.log('MQTT connection connected');
    if (this.connectedCallback != null) {
      this.connectedCallback(true);
    } else {
      console.log('onConnectedToMqttSrv: No callback defined');
    }
    this.mqttClient.subscribe("json/posecore/+/connected/+", {qos:0});
    this.sendClientConnected();
  }

  onConnectFailed(error) {
    console.log('MQTT connection failed: ' + error);
    if (this.connectedCallback != null) {
      this.connectedCallback(false);
    } else {
      console.log('onConnectFailed: No callback defined');
    }
  }

  /**
   * This function is called whenever we receive a message on the websocket.
   * @param {The received event} event
   */
  onMessage(topic, message, packet) {
    // Remarked to better be able to view logs
    console.log('MQTT-Msg received on topic [' + topic + ']: ' + message);

    const data = JSON.parse(message);
    console.log('received type: ' + data.type);
    //        this.dispatch(data);
  }

  /**
   * This function sends a Client connected message to the server.
   */
  sendClientConnected() {
    let ccMsg = new ClientConnectedMsg(this.clientId, this.mqttUrl);

    let msg = {
      type: WS_CLIENT_CONNECTED,
      payload: ccMsg
    };
    this.sendMsg(msg, 'json/posecore/' + this.clientId + '/client/connected/1');
  }
}

export default MqttConnection;
