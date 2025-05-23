import { EventEmitter } from "eventemitter3";
import { ethErrors } from "eth-rpc-errors";
import { ethers } from "ethers";
import type { Event } from "@coral-xyz/common";
import {
  getLogger,
  BackgroundEthereumProvider,
  CHANNEL_ETHEREUM_RPC_REQUEST,
  CHANNEL_ETHEREUM_RPC_RESPONSE,
  CHANNEL_ETHEREUM_NOTIFICATION,
  CHANNEL_ETHEREUM_CONNECTION_INJECTED_REQUEST,
  CHANNEL_ETHEREUM_CONNECTION_INJECTED_RESPONSE,
  ETHEREUM_RPC_METHOD_CONNECT,
  NOTIFICATION_ETHEREUM_CONNECTED,
  NOTIFICATION_ETHEREUM_DISCONNECTED,
  NOTIFICATION_ETHEREUM_CONNECTION_URL_UPDATED,
  NOTIFICATION_ETHEREUM_CHAIN_ID_UPDATED,
  NOTIFICATION_ETHEREUM_ACTIVE_WALLET_UPDATED,
} from "@coral-xyz/common";
import * as cmn from "./common/ethereum";
import { RequestManager } from "./request-manager";

const logger = getLogger("provider-ethereum-injection");

export type EthersSendCallback = (error: unknown, response: unknown) => void;

// https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1193.md#request
interface RequestArguments {
  readonly method: string;
  readonly params?: readonly unknown[] | object;
}

// https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1193.md#rpc-errors
interface ProviderRpcError extends Error {
  code: number;
  data?: unknown;
}

// https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1193.md#connect-1
interface ProviderConnectInfo {
  readonly chainId: string;
}

export interface JsonRpcRequest {
  jsonrpc: string;
  method: string;
  params: any[];
  id: number;
}

export interface JsonRpcResponse {
  jsonrpc: string;
  id: number;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

const messages = {
  errors: {
    disconnected: () =>
      "Backpack: Disconnected from chain. Attempting to connect.",
    invalidRequestArgs: () =>
      `Backpack: Expected a single, non-array, object argument.`,
    invalidRequestMethod: () =>
      `Backpack: 'args.method' must be a non-empty string.`,
    invalidRequestParams: () =>
      `Backpack: 'args.params' must be an object or array if provided.`,
  },
};

export interface BaseProviderState {
  accounts: null | string[];
  isConnected: boolean;
  isPermanentlyDisconnected: boolean;
}

export class ProviderEthereumInjection extends EventEmitter {
  protected _state: BaseProviderState;

  protected static _defaultState: BaseProviderState = {
    accounts: null,
    isConnected: false,
    isPermanentlyDisconnected: false,
  };

  /**
   * Channel to send extension specific RPC requests to the extension.
   */
  private _requestManager: RequestManager;

  /**
   *  Channel to send Solana connection API requests to the extension.
   */
  private _connectionRequestManager: RequestManager;

  /**
   * The chain ID of the currently connected Ethereum chain.
   */
  public chainId: string | null;

  /**
   * The user's currently selected Ethereum address.
   */
  public publicKey: string | null;

  /**
   *
   */
  public networkVersion?: string;

  /**
   * Boolean indicating that the provider is Backpack.
   */
  public isBBAWallet: boolean;

  /**
   * Ethereum JSON RPC provider.
   */
  public provider?: ethers.providers.JsonRpcProvider;

  constructor() {
    super();
    this._requestManager = new RequestManager(
      CHANNEL_ETHEREUM_RPC_REQUEST,
      CHANNEL_ETHEREUM_RPC_RESPONSE
    );
    this._connectionRequestManager = new RequestManager(
      CHANNEL_ETHEREUM_CONNECTION_INJECTED_REQUEST,
      CHANNEL_ETHEREUM_CONNECTION_INJECTED_RESPONSE
    );
    this._initChannels();

    this._state = {
      ...ProviderEthereumInjection._defaultState,
    };

    this.isBBAWallet = true;
    this.chainId = null;
    this.publicKey = null;

    this._handleConnect = this._handleConnect.bind(this);
    this._handleChainChanged = this._handleChainChanged.bind(this);
    this._handleEthRequestAccounts = this._handleEthRequestAccounts.bind(this);
    this._handleEthSignMessage = this._handleEthSignMessage.bind(this);
    this._handleEthSignTransaction = this._handleEthSignTransaction.bind(this);
    this._handleEthSendTransaction = this._handleEthSendTransaction.bind(this);
  }

  // Setup channels with the content script.
  _initChannels() {
    window.addEventListener("message", this._handleNotification.bind(this));
  }

  //
  // Public methods
  //

  /**
   * Returns whether the provider can process RPC requests.
   */
  isConnected(): boolean {
    return this._state.isConnected;
  }

  // Deprecated EIP-1193 method
  async enable(): Promise<unknown> {
    return this.request({ method: "eth_requestAccounts" });
  }

  // Deprecated EIP-1193 method
  send(
    methodOrRequest: string | RequestArguments,
    paramsOrCallback: Array<unknown> | EthersSendCallback
  ): Promise<unknown> | void {
    if (
      typeof methodOrRequest === "string" &&
      typeof paramsOrCallback !== "function"
    ) {
      return this.request({
        method: methodOrRequest,
        params: paramsOrCallback,
      });
    } else if (
      typeof methodOrRequest === "object" &&
      typeof paramsOrCallback === "function"
    ) {
      return this.sendAsync(methodOrRequest, paramsOrCallback);
    }
    return Promise.reject(new Error("Unsupported function parameters"));
  }

  // Deprecated EIP-1193 method still in use by some DApps
  sendAsync(
    request: RequestArguments & { id?: number; jsonrpc?: string },
    callback: (error: unknown, response: unknown) => void
  ): Promise<unknown> | void {
    return this.request(request).then(
      (response) =>
        callback(null, {
          result: response,
          id: request.id,
          jsonrpc: request.jsonrpc,
        }),
      (error) => callback(error, null)
    );
  }

  /**
   *
   */
  async request(args: RequestArguments): Promise<JsonRpcResponse> {
    if (!args || typeof args !== "object" || Array.isArray(args)) {
      throw ethErrors.rpc.invalidRequest({
        message: messages.errors.invalidRequestArgs(),
        data: args,
      });
    }

    const { method, params } = args;

    logger.debug("page injected provider request", method, params);

    if (typeof method !== "string" || method.length === 0) {
      throw ethErrors.rpc.invalidRequest({
        message: messages.errors.invalidRequestMethod(),
        data: args,
      });
    }

    if (
      params !== undefined &&
      !Array.isArray(params) &&
      (typeof params !== "object" || params === null)
    ) {
      throw ethErrors.rpc.invalidRequest({
        message: messages.errors.invalidRequestParams(),
        data: args,
      });
    }

    const functionMap = {
      eth_accounts: this._handleEthRequestAccounts,
      eth_requestAccounts: this._handleEthRequestAccounts,
      eth_chainId: () => this.chainId,
      eth_getBalance: (address: string) => this.provider!.getBalance(address),
      eth_getCode: (address: string) => this.provider!.getCode(address),
      eth_getStorageAt: (address: string, position: string) =>
        this.provider!.getStorageAt(address, position),
      eth_getTransactionCount: (address: string) =>
        this.provider!.getTransactionCount(address),
      eth_blockNumber: () => this.provider!.getBlockNumber(),
      eth_getBlockByNumber: (block: number) => this.provider!.getBlock(block),
      eth_call: (transaction: any) => this.provider!.call(transaction),
      eth_estimateGas: (transaction: any) =>
        this.provider!.estimateGas(transaction),
      eth_getTransactionByHash: (hash: string) =>
        this.provider!.getTransaction(hash),
      eth_getTransactionReceipt: (hash: string) =>
        this.provider!.getTransactionReceipt(hash),
      eth_sign: (_address: string, _message: string) => {
        // This is a significant security risk because it can be used to
        // sign transactions.
        // TODO maybe enable this with a large warning in the UI?
        throw new Error(
          "Backpack does not support eth_sign due to security concerns"
        );
      },
      personal_sign: (messageHex: string, _address: string) =>
        this._handleEthSignMessage(messageHex),
      eth_signTransaction: (transaction: any) =>
        this._handleEthSignTransaction(transaction),
      eth_sendTransaction: (transaction: any) =>
        this._handleEthSendTransaction(transaction),
    };

    const func = functionMap[method];
    if (func === undefined) {
      throw ethErrors.rpc.invalidRequest({
        message: messages.errors.invalidRequestMethod(),
        data: args,
      });
    }

    return new Promise<JsonRpcResponse>(async (resolve, reject) => {
      let rpcResult;
      try {
        rpcResult = await func(...(<[]>(params ? params : [])));
      } catch (error) {
        console.error("rpc response error", error);
        return reject(error);
      }
      return resolve(rpcResult);
    });
  }

  //
  // Private methods
  //

  /**
   *  Handle notifications from Backpack.
   */
  _handleNotification(event: Event) {
    if (event.data.type !== CHANNEL_ETHEREUM_NOTIFICATION) return;
    logger.debug("notification", event);

    switch (event.data.detail.name) {
      case NOTIFICATION_ETHEREUM_CONNECTED:
        this._handleNotificationConnected(event);
        break;
      case NOTIFICATION_ETHEREUM_DISCONNECTED:
        this._handleNotificationDisconnected();
        break;
      case NOTIFICATION_ETHEREUM_CONNECTION_URL_UPDATED:
        this._handleNotificationConnectionUrlUpdated(event);
        break;
      case NOTIFICATION_ETHEREUM_CHAIN_ID_UPDATED:
        this._handleNotificationChainIdUpdated(event);
        break;
      case NOTIFICATION_ETHEREUM_ACTIVE_WALLET_UPDATED:
        this._handleNotificationActiveWalletUpdated(event);
        break;
      default:
        throw new Error(`unexpected notification ${event.data.detail.name}`);
    }
  }

  /**
   * Handle a connect notification from Backpack.
   */
  async _handleNotificationConnected(event) {
    const { publicKey, connectionUrl, chainId } = event.data.detail.data;
    this.publicKey = publicKey;
    this.provider = new ethers.providers.JsonRpcProvider(
      connectionUrl,
      parseInt(chainId)
    );
    this._handleConnect(chainId);
    this._handleChainChanged(chainId);
    this._handleAccountsChanged([this.publicKey]);
  }

  /**
   * Handle a disconnection notification from Backpack.
   */
  async _handleNotificationDisconnected() {
    if (this.isConnected()) {
      // Reset public state
      this.chainId = null;
      this.publicKey = null;
      // Reset private state
      this._state = {
        ...ProviderEthereumInjection._defaultState,
      };
    }
    // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1193.md#disconnect
    this.emit("disconnect", {
      code: 4900,
      message: "User disconnected",
    } as ProviderRpcError);
  }

  /**
   * Handle a change of the RPC connection URL in Backpack. This may also be a change
   * of the chainId/network if the change was to a different network RPC.
   */
  async _handleNotificationConnectionUrlUpdated(event: any) {
    const { connectionUrl } = event.data.detail.data;
    this.provider = new BackgroundEthereumProvider(
      this._connectionRequestManager,
      connectionUrl
    );
  }

  async _handleNotificationChainIdUpdated(event: any) {
    const { chainId } = event.data.detail.data;
    this._handleChainChanged(chainId);
  }

  /**
   * Handle a change of the active wallet in Backpack.
   */
  async _handleNotificationActiveWalletUpdated(event: any) {
    const { activeWallet } = event.data.detail.data;
    if (this.publicKey !== activeWallet) {
      this.publicKey = activeWallet;
      // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1193.md#accountschanged
      this._handleAccountsChanged([this.publicKey]);
    }
  }

  /**
   * Update local state and emit required event for connect.
   */
  protected async _handleConnect(chainId: string) {
    if (!this._state.isConnected) {
      this._state.isConnected = true;
    }
    // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1193.md#connect
    this.emit("connect", { chainId } as ProviderConnectInfo);
  }

  /**
   * Update local state and emit required event for chain change.
   */
  protected async _handleChainChanged(chainId: string) {
    this.chainId = chainId;
    // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1193.md#chainchanged
    this.emit("chainChanged", chainId);
  }

  /**
   * Emit the required event for a change of accounts.
   */
  protected async _handleAccountsChanged(accounts: unknown[]) {
    this.emit("accountsChanged", accounts);
  }

  /**
   * Handle eth_accounts and eth_requestAccounts requests
   */
  protected async _handleEthRequestAccounts() {
    // Send request to the RPC API.
    if (this.isConnected() && this.publicKey) {
      return [this.publicKey];
    } else {
      const result = await this._requestManager.request({
        method: ETHEREUM_RPC_METHOD_CONNECT,
        params: [],
      });
      return [result.publicKey];
    }
  }

  /**
   * Handle eth_sign, eth_signTypedData, personal_sign RPC requests.
   */
  protected async _handleEthSignMessage(messageHex: string) {
    if (!this.publicKey) {
      throw new Error("wallet not connected");
    }
    return await cmn.signMessage(
      this.publicKey,
      this._requestManager,
      ethers.utils.toUtf8String(messageHex)
    );
  }

  /**
   * Handle eth_signTransaction RPC requests.
   */
  protected async _handleEthSignTransaction(transaction: any) {
    if (!this.publicKey) {
      throw new Error("wallet not connected");
    }
    return await cmn.signTransaction(
      this.publicKey,
      this._requestManager,
      transaction
    );
  }

  /**
   * Handle eth_sendTransaction RPC requests.
   */
  protected async _handleEthSendTransaction(transaction: any) {
    if (!this.publicKey) {
      throw new Error("wallet not connected");
    }
    return await cmn.sendTransaction(
      this.publicKey,
      this._requestManager,
      transaction
    );
  }
}
