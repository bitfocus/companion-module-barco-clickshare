import BarcoApi from './barco-api/barco'
import sleep from './sleep'
import { BarcoClickShareConfig, getConfigFields } from './config'
import {
	InstanceBase,
	InstanceStatus,
	SomeCompanionConfigField,
	runEntrypoint,
} from '@companion-module/base'
import { UpdateFeedbacks } from './feedbacks'
import { UpgradeScripts } from './upgrades'
import { UpdateActions } from './actions'

export class BarcoClickShareInstance extends InstanceBase<BarcoClickShareConfig> {
	private _api: BarcoApi | null = null

	public isInUse?: boolean = undefined
	public isSharing?: boolean = undefined
	private _subscriptions: number = 0

	public get subscriptions(): number {
		return this._subscriptions
	}

	public set subscriptions(value: number) {
		this._subscriptions = value
		this.shouldBePolling = value > 0
		if (this.shouldBePolling && !this.isPolling) {
			this.pollInUseStatus()
			// it stops by itself
		}
	}

	private shouldBePolling: boolean = false
	private isPolling: boolean = false

	/**
	 * Provide a simple return
	 * of the necessary fields for the
	 * instance configuration screen.
	 */
	getConfigFields(): SomeCompanionConfigField[] {
		return getConfigFields()
	}

	/**
	 * Main initialization function called once the module is
	 * OK to start doing things. Principally, this is when
	 * the module should establish a connection to the device.
	 * @return {void}
	 */
	async init(config: BarcoClickShareConfig): Promise<void> {
		this._api = new BarcoApi(config.host, config.port, config.user, config.password)
		this.updateActions()
		this.updateFeedbacks()
		this.subscribeFeedbacks()
	}

	/**
	 * Clean up the instance before it is destroyed.
	 * This is called both on shutdown and when an instance
	 * is disabled or deleted. Destroy any timers and socket
	 * connections here.
	 * @return {void}
	 */
	async destroy(): Promise<void> {
		this._api = null
		this.shouldBePolling = false
	}

	/**
	 * Poll for in use status continuously until there are
	 * no more subscriptions or until the module is destroyed
	 * @return {void}
	 */
	private async pollInUseStatus() {
		this.isPolling = true
		try {
			// loop until we don't need to poll any more
			while (this._api && this.shouldBePolling) {
				// check the status via the api
				try {
					let status = await this._api.isInUse()
					this.updateStatus(InstanceStatus.Ok)
					if (this.isInUse !== status.inUse) {
						// status changed
						this.isInUse = status.inUse
						this.checkFeedbacks('available', 'inUse', 'idle')
					}
					if (this.isSharing !== status.sharing) {
						// status changed
						this.isSharing = status.sharing
						this.checkFeedbacks('available', 'sharing')
					}
				} catch (e: any) {
					this.updateStatus(InstanceStatus.ConnectionFailure, e.message)
				}
				await sleep(750)
			}
		} finally {
			this.isPolling = false
		}
	}

	selectWallpaper(wallpaperId: number) {
		this._api?.selectWallpaper(wallpaperId)
	}

	/**
	 * When the instance configuration is saved by the user,
	 * this update will fire with the new configuration
	 * @param {BarcoClickShareConfig} config
	 * @return {void}
	 */
	async configUpdated(config: BarcoClickShareConfig): Promise<void> {
		this._api = new BarcoApi(config.host, config.port, config.user, config.password)
	}

	updateFeedbacks(): void {
		UpdateFeedbacks(this)
	}

	updateActions(): void {
		UpdateActions(this)
	}
}

runEntrypoint(BarcoClickShareInstance, UpgradeScripts)
