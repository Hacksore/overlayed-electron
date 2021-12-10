import EventEmitter from "events";
import IPCTransport from "./ipc";
import { RPCCommands, RPCEvents } from "./constants";
import { uuid } from "../util";

/**
 * The main hub for interacting with Discord RPC
 * @extends {BaseClient}
 */
class RPCClient extends EventEmitter {
  user: null;
  options: any;
  accessToken: null;
  clientId: null;
  transport: any;
  _expecting: Map<any, any>;
  _connectPromise: any;
  _subscriptions: any;
  application: null;

  /**
   * @param {RPCClientOptions} [options] Options for the client.
   * You must provide a transport
   */
  constructor(options = {}) {
    super();

    this.options = options;

    this.accessToken = null;
    this.clientId = null;

    /**
     * Application used in this client
     * @type {?ClientApplication}
     */
    this.application = null;

    /**
     * User used in this application
     * @type {?User}
     */
    this.user = null;

    /**
     * Raw transport userd
     * @type {RPCTransport}
     * @private
     */
    this.transport = new IPCTransport(this);
    this.transport.on("message", this._onRpcMessage.bind(this));

    /**
     * Map of nonces being expected from the transport
     * @type {Map}
     * @private
     */
    this._expecting = new Map();

    this._connectPromise = undefined;
  }

  /**
   * Search and connect to RPC
   */
  connect(clientId: any) {
    if (this._connectPromise) {
      return this._connectPromise;
    }
    this._connectPromise = new Promise((resolve, reject) => {
      this.clientId = clientId;
      this.once("connected", () => {
        resolve(this);
      });
      this.transport.once("close", () => {
        this.emit("disconnected");
      });

      this.transport.connect().catch(reject);
    });
    return this._connectPromise;
  }

  /**
   * @typedef {RPCLoginOptions}
   * @param {string} clientId Client ID
   * @param {string} [clientSecret] Client secret
   * @param {string} [accessToken] Access token
   * @param {string} [rpcToken] RPC token
   * @param {string} [tokenEndpoint] Token endpoint
   * @param {string[]} [scopes] Scopes to authorize with
   */

  /**
   * Performs authentication flow. Automatically calls Client#connect if needed.
   * @param {RPCLoginOptions} options Options for authentication.
   * At least one property must be provided to perform login.
   * @example client.login({ clientId: '1234567', clientSecret: 'abcdef123' });
   * @returns {Promise<RPCClient>}
   */
  async login(options: any = {}) {
    const { clientId, accessToken }: any = options;
    await this.connect(clientId);
    if (!options.scopes) {
      this.emit("ready");
      return this;
    }

    return this.authenticate(accessToken);
  }

  /**
   * Request - allows for a promise to be returned
   * @param {string} cmd Command
   * @param {Object} [args={}] Arguments
   * @param {string} [evt] Event
   * @returns {Promise}
   * @private
   */
  request(cmd: string, args: any, evt: any) {
    return new Promise((resolve, reject) => {
      const nonce = uuid();
      this.transport.send({ cmd, args, evt, nonce });
      this._expecting.set(nonce, { resolve, reject });
    });
  }

  /**
   * Sends the command to the transport
   * @param {string} cmd Command
   * @param {Object} [args={}] Arguments
   * @param {string} [evt] Event
   * @returns {void}
   */
  send({ cmd, args, evt }: any) {
    const nonce = uuid();
    this.transport.send({ cmd, args, evt, nonce });
  }

  /**
   * Message handler
   * @param {Object} message message
   * @private
   */
  _onRpcMessage(message: any) {
    if (message.cmd === RPCCommands.DISPATCH && message.evt === RPCEvents.READY) {
      if (message.data.user) {
        this.user = message.data.user;
      }
      this.emit("connected");
    } else if (this._expecting.has(message.nonce)) {
      const { resolve, reject } = this._expecting.get(message.nonce);
      if (message.evt ===  RPCEvents.ERROR) {
        const e: any = new Error(message.data.message);
        e.code = message.data.code;
        e.data = message.data;
        reject(e);
      } else {
        resolve(message.data);
      }
      this._expecting.delete(message.nonce);
    } else {
      // This was kinda silly imo, bad DX
      // this.emit(message.evt, message.data);

      // generic emitter
      this.emit("message", message);
    }
  }

  /**
   * Authenticate
   * @param {string} accessToken access token
   * @returns {Promise}
   * @private
   */
  authenticate(accessToken: any) {
    return this.request("AUTHENTICATE", { access_token: accessToken }, null).then(({ application, user }: any) => {
      this.accessToken = accessToken;
      this.application = application;
      this.user = user;
      this.emit("ready");
      return this;
    });
  }

  /**
   * Subscribe to an event
   * @param {string} event Name of event e.g. `MESSAGE_CREATE`
   * @param {Object} [args] Args for event e.g. `{ channel_id: '1234' }`
   * @returns {Promise<Object>}
   */
  async subscribe(event: string, args: any) {
    await this.request(RPCCommands.SUBSCRIBE, args, event);
    return {
      unsubscribe: () => this.request(RPCCommands.UNSUBSCRIBE, args, event),
    };
  }

  /**
   * Destroy the client
   */
  async destroy() {
    await this.transport.close();
  }
}

export default RPCClient;
