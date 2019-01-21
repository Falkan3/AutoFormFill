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
            form: null,
            inputs: [],
            typing: {
                clearOnInit: true,
                submitOnFinish: false,
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
                    type: null,
                    value: 'test value', // text to be typed into the input element
                    valueMultipleCharacters: false,
                    typing: {
                        strokeInterval: null, // override default stroke interval (for this element) with this value
                        strokeIntervalVariation: null // override default stroke interval variation (for this element) with this value
                    }
                }
            },

            callbackOnInit: function () {

            },
            callbackOnFillInEnd: function () {

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
                    console.log('Callback FillInEnd');

                    if (settings.typing.submitOnFinish) {
                        if (settings.form) {
                            const focusInterval = settings.typing.focusInterval;
                            const focusIntervalVariation = settings.typing.focusIntervalVariation;
                            const timeout = AFF.helpers.randomMinMax(focusInterval - focusIntervalVariation, focusInterval + focusIntervalVariation);

                            setTimeout(function () {
                                settings.form.submit();
                            }, timeout);
                        } else {
                            console.log('No form to submit.');
                        }
                    }
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
            // document.addEventListener('click', eventHandler, false);

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
            // document.removeEventListener('click', eventHandler, false);

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
                const updatedItem = AFF.helpers.extend(settings.templates.input, item);
                const tagName = updatedItem.element.tagName.toLowerCase();

                if (updatedItem.element) {
                    // Input
                    if (tagName === "input") {
                        if (updatedItem.element.type === "text" || updatedItem.element.type === "email" || updatedItem.element.type === "tel" || updatedItem.element.type === "password") {
                            updatedItem.type = 'text';
                        } else if (updatedItem.element.type === "checkbox") {
                            updatedItem.type = 'checkbox';
                        } else if (updatedItem.element.type === "radio") {
                            updatedItem.type = 'radio';
                        }
                    }
                    // Textarea
                    else if (tagName === "textarea") {
                        updatedItem.type = 'textarea';
                    }
                    // Select
                    else if (tagName === "select") {
                        updatedItem.type = 'select';
                    }
                }

                updatedItem.valueMultipleCharacters = AFF.helpers.isArrayOrString(updatedItem.value);

                settings.inputs[i] = AFF.helpers.extend(settings.inputs[i], updatedItem);
            });
        };

        /**
         * Reset input typing state
         * @public
         * @param {Boolean} inProgress - is the typing in progress
         */
        AFF.resetInputTypingState = function (inProgress) {
            settings.typing.state.inProgress = !!inProgress;
            settings.typing.state.nextCharAt = 0;
            if (!settings.typing.state.inProgress) {
                settings.typing.state.currentInputIndex = 0;
            }
        };

        /**
         * Fill in all inputs
         * @public
         * @param {Number} id - input's id
         */
        AFF.inputsFillIn = function (id) {
            // Check if ID is given and the input for it exists
            // ID not given. Fill in all inputs. (default)
            if (typeof id === "undefined") {
                AFF.helpers.forEach(settings.inputs, function (item, i) {
                    // Fill in only if DOM element exists
                    if (item.element) {
                        if (settings.typing.clearOnInit) {
                            if (item.type === 'checkbox' || item.type === 'radio') {
                                item.element.checked = false;
                            } else {
                                item.element.value = '';
                            }
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
                        if (settings.typing.clearOnInit) {
                            if (item.type === 'checkbox' || item.type === 'radio') {
                                item.element.checked = false;
                            } else {
                                item.element.value = '';
                            }
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
         * @param {Object} item - input object with parameters
         * @param {Number} characterAt - index of character to fill in
         */
        AFF.inputFillInCharCallback = function (item, characterAt) {
            const multipleCharacters = item.valueMultipleCharacters;
            const characterLastIndex = multipleCharacters ? item.value.length - 1 : 0;

            // Filling in progress
            // for inputs of text and textarea type
            if (item.type === 'text' || item.type === 'textarea' || item.type === 'select' || item.type === 'checkbox') {
                if (multipleCharacters && settings.typing.state.nextCharAt <= characterLastIndex) {
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
            }
            // For inputs of checkbox and radio type or Finished filling current input
            if ((item.type === 'select' || item.type === 'checkbox' || item.type === 'radio') || (multipleCharacters && settings.typing.state.nextCharAt > characterLastIndex)) {
                // if select, check if all values have been selected
                if (!multipleCharacters || (multipleCharacters && settings.typing.state.nextCharAt > characterLastIndex)) {
                    settings.typing.state.currentInputIndex++;

                    // if auto fill next is set to true, filling the next input will begin immediately
                    if (settings.typing.autoFillNext) {
                        const nextItem = settings.inputs[settings.typing.state.currentInputIndex];
                        if (nextItem) {
                            let focusInterval = settings.typing.focusInterval;
                            let focusIntervalVariation = settings.typing.focusIntervalVariation;
                            settings.typing.state.nextPause = AFF.helpers.randomMinMax(focusInterval - focusIntervalVariation, focusInterval + focusIntervalVariation);

                            AFF.resetInputTypingState(true);

                            settings.typing.state.typingTimeoutNo = setTimeout(function () {
                                AFF.inputTriggerEvent(item, 'blur');
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
            }
            // the element given is not a valid input
            else {
                AFF.resetInputTypingState(false);

                // On FillInEnd callback
                AFF.callbackCall('FillInEnd');

                return false;
            }
        };

        /**
         * Fill in a character in an input element
         * @private
         * @param {Object} item - input object with parameters
         * @param {Number} characterAt - index of character to fill in
         */
        AFF.inputFillInChar = function (item, characterAt) {
            if (typeof characterAt !== "undefined" && !isNaN(characterAt)) {
                try {
                    // for inputs of text and textarea type
                    if (item.type === 'text' || item.type === 'textarea') {
                        const characterLastIndex = (item.value.length - 1) || 0;
                        // Character is not last
                        if (characterAt <= characterLastIndex) {
                            // set pause to 0 for first character
                            if (characterAt === 0) {
                                settings.typing.state.nextPause = 0;
                                item.element.focus();
                            }

                            let character = item.value[characterAt];

                            settings.typing.state.typingTimeoutNo = setTimeout(function () {
                                item.element.value = item.element.value + character;
                                AFF.inputTriggerEvent(item, 'input');

                                AFF.inputFillInCharCallback(item, characterAt);
                            }, settings.typing.state.nextPause);

                            return true;
                        }
                        // Typing finished
                        else {
                            return AFF.inputFillInCharCallback(item, characterAt);
                        }
                    }
                    // for inputs of checkbox and radio type
                    else if (item.type === 'checkbox' || item.type === 'radio') {
                        let value = !!item.value;

                        item.element.focus();

                        settings.typing.state.typingTimeoutNo = setTimeout(function () {
                            item.element.checked = value;
                            AFF.inputTriggerEvent(item, ['input', 'change']);

                            AFF.inputFillInCharCallback(item, characterAt);
                        }, settings.typing.state.nextPause);

                        return true;
                    }
                    // for selects
                    else if (item.type === 'select') {
                        // item.element.value = item.value;
                        const characterLastIndex = (item.value.length - 1) || 0;

                        // Character is not last
                        if (characterAt <= characterLastIndex) {
                            // set pause to 0 for first character
                            if (characterAt === 0) {
                                settings.typing.state.nextPause = 0;
                                item.element.focus();
                            }

                            const options = item.element.getElementsByTagName('option');
                            const value = AFF.helpers.isArray(item.value) ? item.value[characterAt] : item.value;
                            let optionToSelect;
                            for (let i = 0; i < options.length; i++) {
                                if (options[i].value == value) {
                                    optionToSelect = i;
                                    break;
                                }
                            }

                            if (typeof options[optionToSelect] !== "undefined") {
                                settings.typing.state.typingTimeoutNo = setTimeout(function () {
                                    const option = options[optionToSelect];
                                    option.selected = true;
                                    AFF.inputTriggerEvent(item, ['input', 'change']);

                                    AFF.inputFillInCharCallback(item, characterAt);
                                }, settings.typing.state.nextPause);
                            } else {
                                console.log(`Select option ${optionToSelect} doesn't exist.`);

                                settings.typing.state.typingTimeoutNo = setTimeout(function () {
                                    AFF.inputFillInCharCallback(item, characterAt);
                                }, settings.typing.state.nextPause);

                                return false;
                            }

                            /*
                            // for multiple values
                            if (AFF.helpers.isArray(item.value)) {
                                for (let i = 0, l = options.length, o; i < options.length - 1; i++) {
                                    o = options[i];
                                    if (item.value.indexOf(parseInt(o.value)) != -1) {
                                        settings.typing.state.typingTimeoutNo = setTimeout(function () {
                                            o.selected = true; // 'selected'

                                            AFF.inputFillInCharCallback(item, characterAt);
                                        }, settings.typing.state.nextPause);
                                    }
                                }
                            }
                            // for single value
                            else {
                                if (options.indexOf(parseInt(item.value)) != -1) {
                                    const option = item.element.getElementsByTagName('option')[item.value];
                                    option.selected = true;
                                }
                            }
                            */
                        }
                        // Typing finished
                        else {
                            return AFF.inputFillInCharCallback(item, characterAt);
                        }
                    }
                    // invalid input type
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

        /**
         * Fill in a character in an input element
         * @private
         * @param {Object} item - input object with parameters
         * @param {String|Array} event - event name to be triggered
         */
        AFF.inputTriggerEvent = function (item, event) {
            let eventName = event;

            if (item.type === 'text' || item.type === 'email' || item.type === 'tel' || item.type === 'textarea') {
                // For multiple events
                if (AFF.helpers.isArray(eventName)) {
                    AFF.helpers.forEach(eventName, function (elem, index) {
                        let tempEventName = elem;
                        switch (elem) {
                            case 'input':
                                tempEventName = 'input';
                                break;
                        }
                        eventName[index] = tempEventName;
                    });
                }
                // For single event
                else {
                    switch (eventName) {
                        case 'input':
                            eventName = 'input';
                            break;
                    }
                }
            } else if (item.type === 'checkbox' || item.type === 'radio' || item.type === 'select') {
                // For multiple events
                if (AFF.helpers.isArray(eventName)) {
                    AFF.helpers.forEach(eventName, function (elem, index) {
                        let tempEventName = elem;
                        switch (elem) {
                            case 'input':
                                tempEventName = 'input';
                                break;
                        }
                        eventName[index] = tempEventName;
                    });
                }
                // For single event
                else {
                    switch (eventName) {
                        case 'input':
                            eventName = 'change';
                            break;
                    }
                }
            }

            // Check for compatibility
            if (typeof Event !== "undefined") {
                // For multiple events
                if (AFF.helpers.isArray(eventName)) {
                    AFF.helpers.forEach(eventName, function (elem, index) {
                        item.element.dispatchEvent(new Event(elem));
                    });
                }
                // For single event
                else {
                    item.element.dispatchEvent(new Event(eventName));
                }
            }
            // Older browsers (<= IE 10)
            else {
                // For multiple events
                if (AFF.helpers.isArray(eventName)) {
                    AFF.helpers.forEach(eventName, function (elem, index) {
                        item.element.dispatchEvent(document.createEvent(elem));
                    });
                }
                // For single event
                else {
                    item.element.dispatchEvent(document.createEvent(eventName));
                }
            }
        };

        //
        // Public APIs
        //

        return AFF;

    }
);