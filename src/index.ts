import { CompanionFeedbackEvent, SomeCompanionConfigField } from "../../../instance_skel_types";
import BarcoApi from './barco-api/barco';
import InstanceSkel from '../../../instance_skel';
import sleep from './sleep';

interface BarcoClickShareConfig {
  host: string;
  port: number;
  user: string;
  password: string;
}

///
class instance extends InstanceSkel<BarcoClickShareConfig> {
  private _api: BarcoApi | null = null;

	constructor(system: any, id: any, config: any) {
		super(system,id,config);
    this.setupFeedback();
	}

  public isInUse?: boolean = undefined;
  private _subscriptions: number = 0;
  
  private get subscriptions(): number {
    return this._subscriptions;
  }
  
  private set subscriptions(value: number) {
    this._subscriptions = value;
    this.shouldBePolling = value > 0;
    if (this.shouldBePolling && !this.isPolling) {
      this.pollInUseStatus();
      // it stops by itself
    }
  }

  private shouldBePolling: boolean = false;
  private isPolling: boolean = false;

  /**
   * Provide a simple return 
   * of the necessary fields for the 
   * instance configuration screen.
   * @return {object[]}
   */
  config_fields(): SomeCompanionConfigField[] {
    return [
      {
        type: 'textinput',
        id: 'host',
        label: 'Clickshare IP Address',
        width: 6,
        regex: this.REGEX_IP
      },
      {
        type: 'number',
        id: 'port',
        label: 'Clickshare API Port',
        width: 6,
        min: 1,
        max: 65536,
        default: 4003
      },
      {
        type: 'textinput',
        id: 'user',
        label: 'Clickshare API Username',
        width: 6
      },
      {
        type: 'textinput',
        id: 'password',
        label: 'Clickshare API Password',
        width: 6
      }
    ];
  }

  /**
   * Main initialization function called once the module is 
   * OK to start doing things. Principally, this is when 
   * the module should establish a connection to the device.
   * @return {void}
   */
   init(): void {
     const config = this.config;
     this._api = new BarcoApi(config.host, config.port, config.user, config.password);
     this.subscribeFeedbacks();
   }

  /**
   * Clean up the instance before it is destroyed. 
   * This is called both on shutdown and when an instance 
   * is disabled or deleted. Destroy any timers and socket
   * connections here.
   * @return {void}
   */
  destroy(): void {
    this._api = null;
  }

  /**
   * Poll for in use status continuously until there are 
   * no more subscriptions or until the module is destroyed
   * @return {void}
   */
  private async pollInUseStatus() {
    this.isPolling = true;
    try {
      // loop until we don't need to poll any more
      while (this._api && this.shouldBePolling) {
        // check the status via the api
        try {
          let isInUse = await this._api.isInUse();
          this.status(this.STATUS_OK);
          if (isInUse !== this.isInUse) {
            // status changed
            this.isInUse = isInUse;
            this.checkFeedbacks('inUse', 'idle');
          }
        }
        catch (e: any) {
          this.status(this.STATUS_ERROR, e.message);
        }
        await sleep(750);
      }
    }
    finally {
      this.isPolling = false;
    }
  }

  /**
   * When the instance configuration is saved by the user, 
   * this update will fire with the new configuration
   * @param {BarcoClickShareConfig} config
   * @return {void}
   */
  updateConfig(config: BarcoClickShareConfig): void {
    this.config = config;
    this._api = new BarcoApi(config.host, config.port, config.user, config.password);
  }

  setupFeedback() {
    this.setFeedbackDefinitions({
      inUse: {
        type: 'boolean', // Feedbacks can either a simple boolean, or can be an 'advanced' style change (until recently, all feedbacks were 'advanced')
        label: 'In Use',
        description: 'True if someone is streaming a desktop to the Clickshare',
        style: {
          // The default style change for a boolean feedback
          // The user will be able to customise these values as well as the fields that will be changed
          color: this.rgb(0, 0, 0),
          bgcolor: this.rgb(255, 0, 0)
        },
        // options is how the user can choose the condition the feedback activates for
        options: [],
        callback: (feedback: CompanionFeedbackEvent): boolean => {
          // This callback will be called whenever companion wants to check if this feedback is 'active' and should affect the button style
          switch (feedback.type) {
            case 'inUse': return this.isInUse ?? false;    
          }      
          return false;            
        },
        subscribe: () => {
          this.subscriptions++;
        },
        unsubscribe: () => {
          this.subscriptions--;
        }
      },
      idle: {
        type: 'boolean', // Feedbacks can either a simple boolean, or can be an 'advanced' style change (until recently, all feedbacks were 'advanced')
        label: 'Available for sharing',
        description: 'True if no one is streaming a desktop to the Clickshare',
        style: {
          // The default style change for a boolean feedback
          // The user will be able to customise these values as well as the fields that will be changed
          color: this.rgb(0, 0, 0),
          bgcolor: this.rgb(255, 0, 0)
        },
        // options is how the user can choose the condition the feedback activates for
        options: [],
        callback: (feedback: CompanionFeedbackEvent) => {
          // This callback will be called whenever companion wants to check if this feedback is 'active' and should affect the button style
          switch (feedback.type) {
            case 'idle': return !this.isInUse;    
          }      
          return true;            
        },
        subscribe: () => {
          this.subscriptions++;
        },
        unsubscribe: () => {
          this.subscriptions--;
        }
      }
    });
  }

}

exports = module.exports = instance;