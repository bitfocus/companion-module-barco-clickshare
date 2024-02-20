import { Agent } from 'https'
import fetch, { HeadersInit, Response } from 'node-fetch'

class HTTPResponseError extends Error {
	response: any
	constructor(response: Response) {
		super(`HTTP Error Response: ${response.status} ${response.statusText}`)
		this.response = response
	}
}

interface BarcoSystemStatusResponse {
	currentUptime: number
	errorCode: string
	errorMessage: string
	firstUsed: string
	inUse: boolean
	sharing: boolean
	totalUptime: number
}

export interface InUseStatus {
	inUse: boolean
	sharing: boolean
}
export default class BarcoApi {
	private _host: string
	private _port: number
	private _credentials: string
	private _defaultHeaders: HeadersInit
	private _agent: Agent
	private _apiVersion: string

	constructor(host: string, port: number, user: string, pass: string) {
		this._host = host
		this._port = port
		this._apiVersion = 'v2'
		this._credentials = Buffer.from(`${user}:${pass}`).toString('base64')
		this._defaultHeaders = {
			Accept: 'application/json',
			Authorization: `Basic ${this._credentials}`,
		}
		this._agent = new Agent({
			rejectUnauthorized: false,
		})
	}

	private checkStatus(response: Response) {
		if (response.ok) {
			// response.status >= 200 && response.status < 300
			return response
		} else {
			throw new HTTPResponseError(response)
		}
	}

	//@ts-ignore
	private authenticate(headers: Headers) {
		headers.append('Authorization', `Basic ${this._credentials}`)
	}

	public async isInUse(): Promise<InUseStatus> {
		const url = `https://${this._host}:${this._port}/${this._apiVersion}/configuration/system/status`
		const response = await fetch(url, {
			method: 'get',
			headers: this._defaultHeaders,
			agent: this._agent,
		})
		this.checkStatus(response)
		const data = (await response.json()) as BarcoSystemStatusResponse
		return {
			inUse: data.inUse,
			sharing: data.sharing,
		}
	}

	public async selectWallpaper(wallpaperId: number): Promise<Response> {
		const url = `https://${this._host}:${this._port}/${this._apiVersion}/configuration/wallpapers/selected`
		const opts = {
			method: 'PATCH',
			headers: {
				Accept: '*/*',
				'Content-Type': 'application/json',
				Authorization: `Basic ${this._credentials}`,
			},
			agent: this._agent,
			body: JSON.stringify({id: wallpaperId})
		}
		const response = await fetch(url, opts)
		return this.checkStatus(response)
	}
}
