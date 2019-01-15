/**
 *
 * AutoFormFill v0.0.1
 *
 * Made by Adam Kocić [Falkan3]
 * http://github.com/Falkan3/
 *
 * Boilerplate description by Chris Ferdinandi.
 * http://gomakethings.com
 *
 * Free to use under the MIT License.
 * http://gomakethings.com/mit/
 *
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory(root));
    } else if (typeof exports === 'object') {
        module.exports = factory(root);
    } else {
        root.AFF = factory(root);
    }
})(typeof global !== "undefined" ? global : this.window || this.global, function (root) {

    'use strict';

    //
    // Variables
    //

    const AFF = {}; // Object for public APIs
    const supports = !!document.querySelector && !!root.addEventListener; // Feature test
    let settings, eventTimeout;

    // Default settings
    const defaults = {
        someVar: 123,
        initClass: 'js-AFF',
        callbackOnInit: function() {
            console.log('inited');
        },
        callbackBefore: function () {
        },
        callbackAfter: function () {
        },
        callbackOnInitArray: [
            function () {
                console.log('Init function callback array 1');
            },
            function () {
                console.log('Init function callback array 2');
            },
        ],
    };


    //
    // Helpers
    //
    AFF.helpers = require('./modules/helpers.js');

    //
    // Methods
    //

    // @todo Do something...

    /**
     * Handle events
     * @private
     */
    const eventHandler = function (event) {
        const toggle = event.target;
        const closest = AFF.helpers.getClosest(toggle, '[data-some-selector]');
        if (closest) {
            // run methods
        }
    };

    /**
     * Destroy the current initialization.
     * @public
     */
    AFF.destroy = function () {

        // If plugin isn't already initialized, stop
        if (!settings) return;

        // Remove init class for conditional CSS
        document.documentElement.classList.remove(settings.initClass);

        // @todo Undo any other init functions...

        // Remove event listeners
        document.removeEventListener('click', eventHandler, false);

        // Reset variables
        settings = null;
        eventTimeout = null;
    };

    /**
     * On window scroll and resize, only run events at a rate of 15fps for better performance
     * @private
     * @param  {Function} eventTimeout Timeout function
     * @param  {Object} settings
     */
    const eventThrottler = function () {
        if (!eventTimeout) {
            eventTimeout = setTimeout(function () {
                eventTimeout = null;
                actualMethod(settings);
            }, 66);
        }
    };

    /**
     * Initialize Plugin
     * @public
     * @param {Object} options User settings
     */
    AFF.init = function (options) {
        // feature test
        if (!supports) return;

        // Destroy any existing initializations
        AFF.destroy();

        // Merge user options with defaults
        settings = AFF.helpers.extend(defaults, options || {});

        // Add class to HTML element to activate conditional CSS
        document.documentElement.classList.add(settings.initClass);

        // @todo Do something...

        // Listen for events
        document.addEventListener('click', eventHandler, false);

        // On Init callback
        AFF.callbackCall('Init');
    };

    /**
     * Call callback by name
     * @public
     * @param {String} callbackName callback's name
     */
    AFF.callbackCall = function (callbackName) {
        const callback = settings[`callbackOn${callbackName}`];
        const callbackArray = settings[`callbackOn${callbackName}Array`];
        if (typeof callback === 'function') {
            callback.call(this);
        }
        if(AFF.helpers.isArray(callbackArray)) {
            AFF.helpers.forEach(callbackArray, function(value, prop) {
                if (typeof callbackArray[prop] === 'function') {
                    callbackArray[prop].call(this);
                }
            }, this);
        }
    };

    //
    // Public APIs
    //

    return AFF;

});