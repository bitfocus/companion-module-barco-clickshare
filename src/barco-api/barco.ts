import fetch, { HeadersInit, Response } from 'node-fetch';

class HTTPResponseError extends Error {
  response: any;
	constructor(response: Response) {
		super(`HTTP Error Response: ${response.status} ${response.statusText}`);
		this.response = response;
	}
}

interface BarcoSystemStatusResponse {
  currentUptime: number;
  errorCode: string;
  errorMessage: string;
  firstUsed: string;
  inUse: boolean;
  sharing: boolean;
  totalUptime: number;
}

export default class BarcoApi {
  private _host: string;
  private _port: number;
  private _credentials: string;
  private _defaultHeaders: HeadersInit;

  constructor(host: string, port: number, user: string, pass: string) {
    this._host = host;
    this._port = port;
    this._credentials = Buffer.from(`${user}:${pass}`).toString('base64');
    this._defaultHeaders = {
      Accept: 'application/json',
      Authorization: `Basic ${this._credentials}`
    };
  }

  private checkStatus (response: Response) {
    if (response.ok) {
      // response.status >= 200 && response.status < 300
      return response;
    } else {
      throw new HTTPResponseError(response);
    }
  }

  //@ts-ignore
  private authenticate(headers: Headers) {
    headers.append('Authorization', `Basic ${this._credentials}`);
  }

  public async isInUse(): Promise<boolean> {
    const response = await fetch(
      `https://${this._host}:${this._port}/configuration/system/status`,
      {
        method: 'get',
        headers: this._defaultHeaders
      });
    try {
      this.checkStatus(response);
      const data = await response.json() as BarcoSystemStatusResponse;
      return data.inUse;
    } catch (e) {
      return false;
    }
  }
} 

