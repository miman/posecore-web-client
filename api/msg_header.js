
/**
 * The is the message header
 */
class MsgHeader {
    /**
     * Constructor
     */
    constructor(clientId) {
        this.type = null;
        this.version = null;
        this.sendTime = null;
        this.payload = null;
    };
}

module.exports = MsgHeader;
