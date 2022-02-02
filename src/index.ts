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

  public isInUse: boolean = false;

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
     this.pollStatus();
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

  private async pollStatus() {
    let wasInUse = this.isInUse;
    while (this._api) {
      this.isInUse = await this._api.isInUse();
      if (wasInUse !== this.isInUse) {
        this.checkFeedbacksById('inUse');
      }
      await sleep(1000);
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
        callback: (feedback: CompanionFeedbackEvent) => {
          // This callback will be called whenever companion wants to check if this feedback is 'active' and should affect the button style
          switch (feedback.id) {
            case 'inUse': return this.isInUse;    
          }      
          return false;            
        }
      }
    });
  }
}

exports = module.exports = instance;