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
        initClass: 'js-AFF',
        inputs: [],
        typing: {
            clearOnInit: true,
            autoFillNext: true,
            strokeInterval: 100, // time between keystrokes in miliseconds
            strokeIntervalVariation: 50, // random variation in base stroke interval, e.g. setting this value to 15 will result in stroke intervals taking between 35-65 ms
            focusInterval: 250, // time between switching focus between inputs
            focusIntervalVariation: 125, // random focus switch variation
            state: {
                inProgress: false, // if the typing is currently in progress
                currentInputIndex: null,
                nextChar: null, // next character to type
                nextCharAt: null, // index of the next character to type
                nextPause: null, // ms for the next pause
                typingTimeoutNo: null, // ID of the typing timeout
                focusTimeoutNo: null, // ID of the focus timeout
            }
        },
        templates: {
            input: {
                element: null, // DOM input element
                value: 'test value', // text to be typed into the input element
                typing: {
                    strokeInterval: null, // override default stroke interval (for this element) with this value
                    strokeIntervalVariation: null // override default stroke interval variation (for this element) with this value
                }
            }
        },

        callbackOnInit: function () {

        },
        callbackOnFillInEnd: function() {

        },
        callbackOnInitArray: [
            function () {
                console.log('Init function callback array 1');
            },
            function () {
                console.log('Init function callback array 2');
            },
        ],
        callbackOnFillInEndArray: [
            function () {
                console.log('FillInEnd function callback array 1');
            },
            function () {
                console.log('FillInEnd function callback array 2');
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
        settings = AFF.helpers.mergeDeep(defaults, options || {});

        // Add class to HTML element to activate conditional CSS
        document.documentElement.classList.add(settings.initClass);

        // Main functions
        AFF.initInputs();

        // Listen for events
        document.addEventListener('click', eventHandler, false);

        // On Init callback
        AFF.callbackCall('Init');
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
        if (AFF.helpers.isArray(callbackArray)) {
            AFF.helpers.forEach(callbackArray, function (value, prop) {
                if (typeof callbackArray[prop] === 'function') {
                    callbackArray[prop].call(this);
                }
            }, this);
        }
    };

    //
    // Main functions
    //

    /**
     * Initialize inputs from settings
     * @public
     */
    AFF.initInputs = function () {
        AFF.helpers.forEach(settings.inputs, function (item, i) {
            settings.inputs[i] = AFF.helpers.extend(settings.templates.input, item);
        });
    };

    /**
     * Reset input typing state
     * @public
     */
    AFF.resetInputTypingState = function (inProgress) {
        settings.typing.state.inProgress = !!inProgress;
        settings.typing.state.nextCharAt = 0;
        if(!settings.typing.state.inProgress) {
            settings.typing.state.currentInputIndex = 0;
        }
    };

    /**
     * Fill in all inputs
     * @public
     */
    AFF.inputsFillIn = function (id) {
        // Check if ID is given and the input for it exists
        // ID not given. Fill in all inputs. (default)
        if (typeof id === "undefined") {
            AFF.helpers.forEach(settings.inputs, function (item, i) {
                // Fill in only if DOM element exists
                if (item.element) {
                    if(settings.typing.clearOnInit) {
                        item.element.value = '';
                    }
                }
            });

            // Fill in first input only if DOM element exists
            const item = settings.inputs[0];
            if (item) {
                // Initialize typing
                AFF.resetInputTypingState(true);
                settings.typing.autoFillNext = true;

                AFF.inputFillInChar(item, settings.typing.state.nextCharAt);
            }
        }
        // ID given. Check if it is valid.
        else {
            if (isNaN(id) || typeof settings.inputs[id] === "undefined") {
                console.log(`Input ${id} doesn't exist.`);
            }
            // Input exists. Fill it in.
            else {
                const item = settings.inputs[id];
                if (item) {
                    if(settings.typing.clearOnInit) {
                        item.element.value = '';
                    }

                    // Initialize typing
                    AFF.resetInputTypingState(true);
                    settings.typing.autoFillNext = false;

                    AFF.inputFillInChar(item, settings.typing.state.nextCharAt);
                }
            }
        }
    };

    /**
     * Callback fired after a character has been filled in
     * @private
     */
    AFF.inputFillInCharCallback = function (item, characterAt) {
        const characterLastIndex = item.value.length - 1;

        // Filling in progress
        if(settings.typing.state.nextCharAt <= characterLastIndex) {
            let strokeInterval = settings.typing.strokeInterval;
            let strokeIntervalVariation = settings.typing.strokeIntervalVariation;

            // Customize settings for input
            if (item.typing.strokeInterval !== null && !isNaN(item.typing.strokeInterval)) {
                strokeInterval = item.typing.strokeInterval;
            }
            if (item.typing.strokeIntervalVariation !== null && !isNaN(item.typing.strokeIntervalVariation)) {
                strokeIntervalVariation = item.typing.strokeIntervalVariation;
            }

            characterAt++;
            settings.typing.state.nextCharAt = characterAt;
            settings.typing.state.nextPause = AFF.helpers.randomMinMax(strokeInterval - strokeIntervalVariation, strokeInterval + strokeIntervalVariation);

            AFF.inputFillInChar(item, characterAt);
            return true;
        }
        // Finished filling current input
        else {
            settings.typing.state.currentInputIndex++;

            // if auto fill next is set to true, filling the next input will begin immediately
            if(settings.typing.autoFillNext) {
                const nextItem = settings.inputs[settings.typing.state.currentInputIndex];
                if (nextItem) {
                    let focusInterval = settings.typing.focusInterval;
                    let focusIntervalVariation = settings.typing.focusIntervalVariation;
                    settings.typing.state.nextPause = AFF.helpers.randomMinMax(focusInterval - focusIntervalVariation, focusInterval + focusIntervalVariation);

                    AFF.resetInputTypingState(true);

                    settings.typing.state.typingTimeoutNo = setTimeout(function () {
                        AFF.inputFillInChar(nextItem, settings.typing.state.nextCharAt);
                    }, settings.typing.state.nextPause);
                    return true;
                }
                // No next input
                else {
                    AFF.resetInputTypingState(false);

                    // On FillInEnd callback
                    AFF.callbackCall('FillInEnd');

                    return false;
                }
            }
            // if auto fill next is false, stop the process
            else {
                AFF.resetInputTypingState(false);

                // On FillInEnd callback
                AFF.callbackCall('FillInEnd');

                return false;
            }
        }
    };
    
    /**
     * Fill in a character in an input element
     * @private
     */
    AFF.inputFillInChar = function (item, characterAt) {
        if (typeof characterAt !== "undefined" && !isNaN(characterAt)) {
            try {
                const characterLastIndex = item.value.length - 1;
                // Character is not last
                if (characterAt <= characterLastIndex) {
                    // set pause to 0 for first character
                    if(characterAt === 0) {
                        settings.typing.state.nextPause = 0;
                        item.element.focus();
                    }

                    let character = item.value[characterAt];

                    settings.typing.state.typingTimeoutNo = setTimeout(function () {
                        item.element.value = item.element.value + character;

                        AFF.inputFillInCharCallback(item, characterAt);
                    }, settings.typing.state.nextPause);

                    return true;
                }
                // Typing finished
                else {
                    return AFF.inputFillInCharCallback(item, characterAt);
                }
            } catch (ex) {
                console.log('Fill in error (' + ex.message + ')');
                return false;
            }
        }
        return false;
    };

    //
    // Public APIs
    //

    return AFF;

});