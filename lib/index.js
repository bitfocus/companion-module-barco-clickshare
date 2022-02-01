"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var instance_skel = require('../../../instance_skel');
///
var instance = /** @class */ (function (_super) {
    __extends(instance, _super);
    function instance(system, id, config) {
        return _super.call(this, system, id, config) || this;
    }
    /**
     * Provide a simple return
     * of the necessary fields for the
     * instance configuration screen.
     * @return {object[]}
     */
    instance.prototype.config_fields = function () {
        return [
            {
                type: 'textinput',
                id: 'host',
                label: 'IP Address',
                width: 6,
                regex: this.REGEX_IP
            },
            {
                type: 'textinput',
                id: 'user',
                label: 'API Username',
                width: 6
            },
            {
                type: 'textinput',
                id: 'password',
                label: 'API Password',
                width: 6
            }
        ];
    };
    /**
     * Clean up the instance before it is destroyed.
     * This is called both on shutdown and when an instance
     * is disabled or deleted. Destroy any timers and socket
     * connections here.
     * @return {void}
     */
    instance.prototype.destroy = function () { };
    /**
     * Main initialization function called once the module is
     * OK to start doing things. Principally, this is when
     * the module should establish a connection to the device.
     * @return {void}
     */
    instance.prototype.init = function () { };
    /**
     * When the instance configuration is saved by the user,
     * this update will fire with the new configuration
     * @param {object} config
     * @return {void}
     */
    instance.prototype.updateConfig = function (config) {
        this.config = config;
    };
    return instance;
}(instance_skel));
exports = module.exports = instance;
