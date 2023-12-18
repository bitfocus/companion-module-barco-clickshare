import BarcoApi from './barco-api/barco'
import sleep from './sleep'
import { BarcoClickShareConfig, getConfigFields } from './config'
import {
	InstanceBase,
	InstanceStatus,
	SomeCompanionConfigField,
	combineRgb,
	runEntrypoint,
} from '@companion-module/base'
import { UpgradeScripts } from './upgrades'

class BarcoClickShareInstance extends InstanceBase<BarcoClickShareConfig> {
	private _api: BarcoApi | null = null

	public isInUse?: boolean = undefined
	public isSharing?: boolean = undefined
	private _subscriptions: number = 0

	private get subscriptions(): number {
		return this._subscriptions
	}

	private set subscriptions(value: number) {
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

	/**
	 * When the instance configuration is saved by the user,
	 * this update will fire with the new configuration
	 * @param {BarcoClickShareConfig} config
	 * @return {void}
	 */
	async configUpdated(config: BarcoClickShareConfig): Promise<void> {
		this._api = new BarcoApi(config.host, config.port, config.user, config.password)
	}

	setupFeedback() {
		this.setFeedbackDefinitions({
			inUse: {
				type: 'boolean', // Feedbacks can either a simple boolean, or can be an 'advanced' style change (until recently, all feedbacks were 'advanced')
				name: 'In Use',
				description: 'True if the app or a button is connected to the Clickshare',
				defaultStyle: {
					// The default style change for a boolean feedback
					// The user will be able to customise these values as well as the fields that will be changed
					color: combineRgb(0, 0, 0),
					bgcolor: combineRgb(255, 0, 0),
				},
				// options is how the user can choose the condition the feedback activates for
				options: [],
				callback: (_feedback): boolean => {
					// This callback will be called whenever companion wants to check if this feedback is 'active' and should affect the button style
					return !!this.isInUse
				},
				subscribe: () => {
					this.subscriptions++
				},
				unsubscribe: () => {
					this.subscriptions--
				},
			},
			sharing: {
				type: 'boolean', // Feedbacks can either a simple boolean, or can be an 'advanced' style change (until recently, all feedbacks were 'advanced')
				name: 'Sharing',
				description: 'True if someone is streaming a desktop to the Clickshare',
				defaultStyle: {
					// The default style change for a boolean feedback
					// The user will be able to customise these values as well as the fields that will be changed
					color: combineRgb(0, 0, 0),
					bgcolor: combineRgb(255, 0, 0),
				},
				// options is how the user can choose the condition the feedback activates for
				options: [],
				callback: (_feedback): boolean => {
					// This callback will be called whenever companion wants to check if this feedback is 'active' and should affect the button style
					return !!this.isSharing
				},
				subscribe: () => {
					this.subscriptions++
				},
				unsubscribe: () => {
					this.subscriptions--
				},
			},
			idle: {
				type: 'boolean', // Feedbacks can either a simple boolean, or can be an 'advanced' style change (until recently, all feedbacks were 'advanced')
				name: 'Idle',
				description: 'True if no one is connected to the Clickshare',
				defaultStyle: {
					// The default style change for a boolean feedback
					// The user will be able to customise these values as well as the fields that will be changed
					color: combineRgb(0, 0, 0),
					bgcolor: combineRgb(255, 0, 0),
				},
				// options is how the user can choose the condition the feedback activates for
				options: [],
				callback: (_feedback) => {
					// This callback will be called whenever companion wants to check if this feedback is 'active' and should affect the button style
					return !this.isInUse
				},
				subscribe: () => {
					this.subscriptions++
				},
				unsubscribe: () => {
					this.subscriptions--
				},
			},
			available: {
				type: 'boolean', // Feedbacks can either a simple boolean, or can be an 'advanced' style change (until recently, all feedbacks were 'advanced')
				name: 'Available',
				description: 'True if some one is connected to the Clickshare but no one is streaming',
				defaultStyle: {
					// The default style change for a boolean feedback
					// The user will be able to customise these values as well as the fields that will be changed
					color: combineRgb(0, 0, 0),
					bgcolor: combineRgb(255, 0, 0),
				},
				// options is how the user can choose the condition the feedback activates for
				options: [],
				callback: (_feedback) => {
					// This callback will be called whenever companion wants to check if this feedback is 'active' and should affect the button style
					return !!this.isInUse && !this.isSharing
				},
				subscribe: () => {
					this.subscriptions++
				},
				unsubscribe: () => {
					this.subscriptions--
				},
			},
		})
	}
}

runEntrypoint(BarcoClickShareInstance, UpgradeScripts)
