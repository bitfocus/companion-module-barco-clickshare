import { SomeCompanionConfigField } from "../../../instance_skel_types";

const instance_skel = require('../../../instance_skel');

///
class instance extends instance_skel {

	constructor(system: any, id: any, config: any) {
		super(system,id,config);
	}

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
   * Clean up the instance before it is destroyed. 
   * This is called both on shutdown and when an instance 
   * is disabled or deleted. Destroy any timers and socket
   * connections here.
   * @return {void}
   */
  destroy(): void {}

  /**
   * Main initialization function called once the module is 
   * OK to start doing things. Principally, this is when 
   * the module should establish a connection to the device.
   * @return {void}
   */
  init(): void {}

  /**
   * When the instance configuration is saved by the user, 
   * this update will fire with the new configuration
   * @param {object} config
   * @return {void}
   */
  updateConfig(config: object): void {
    this.config = config;
  }
}

exports = module.exports = instance;