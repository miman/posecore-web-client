
/**
 * This message is sent from a client as the first message after it has connected to a Websocket connection to the server.
 */
class ClientConnectedMsg {
    /**
     * Constructor
     * @param {The dispatch function for redux} dispatch 
     */
    constructor(clientId, srvUrl) {
        // The id of this client
        this.clientId = clientId;
        /** Which of the exposed server URL's that the client was able to connect to
         * This is while a client might expose several if it has multiple network cards, 
         * by sending the URL that worked the server will know which the server was actually bound to.
         */
        this.srvUrl = srvUrl;
    };
}

module.exports = ClientConnectedMsg;
