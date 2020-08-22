"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var moment_1 = __importDefault(require("@date-io/moment"));
var picker_1 = require("./picker");
exports.Picker = picker_1.Picker;
var defaultLocalization = {
    ok: "Ok",
    cancel: "Cancel",
    now: "Now",
    clear: "Clear",
};
var defaultOptions = {
    showNow: true,
    clearable: true,
    localization: defaultLocalization,
    dateUtils: moment_1.default,
};
function TimePicker(value, options) {
    var _options;
    if (!options)
        _options = __assign({}, defaultOptions, { format: "LT", type: picker_1.PickerTypes.TimePicker });
    else
        _options = options;
    return picker_1.Picker(value, _options);
}
exports.TimePicker = TimePicker;
function DatePicker(value, options) {
    var _options;
    if (!options)
        _options = __assign({}, defaultOptions, { format: "dddd, MMMM Do YYYY", type: picker_1.PickerTypes.DatePicker });
    else
        _options = options;
    return picker_1.Picker(value, _options);
}
exports.DatePicker = DatePicker;
function DateTimePicker(value, options) {
    var _options;
    if (!options)
        _options = __assign({}, defaultOptions, { format: "dddd, MMMM Do YYYY [-] LT", type: picker_1.PickerTypes.DateTimePicker });
    else
        _options = options;
    return picker_1.Picker(value, _options);
}
exports.DateTimePicker = DateTimePicker;
