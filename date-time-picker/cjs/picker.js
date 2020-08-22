"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var pickers_1 = require("@material-ui/pickers");
var RxUtils_1 = require("@rayflmc/flmc-data-layer/lib/FormController/Elements/RxUtils");
var flmc_lite_renderer_1 = require("@rayflmc/flmc-lite-renderer");
var TextInputElement_1 = require("@rayflmc/flmc-lite-renderer/build/form/elements/input/TextInputElement");
var React = __importStar(require("react"));
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var PickerTypes;
(function (PickerTypes) {
    PickerTypes[PickerTypes["TimePicker"] = 0] = "TimePicker";
    PickerTypes[PickerTypes["DatePicker"] = 1] = "DatePicker";
    PickerTypes[PickerTypes["DateTimePicker"] = 2] = "DateTimePicker";
})(PickerTypes = exports.PickerTypes || (exports.PickerTypes = {}));
function Picker(value, options) {
    var valueContainer;
    if (RxUtils_1.isSubject(value)) {
        valueContainer = value;
    }
    else if (rxjs_1.isObservable(value)) {
        valueContainer = new rxjs_1.BehaviorSubject(null);
        value.subscribe({ next: function (v) { return valueContainer.next(v); } });
    }
    else {
        valueContainer = new rxjs_1.BehaviorSubject(value);
    }
    // Modal
    // holds last date in valueController so if user canceled any change we roll back changes
    var lastDate = null;
    var open = new rxjs_1.BehaviorSubject(false);
    var modal = flmc_lite_renderer_1.Modal(flmc_lite_renderer_1.Container([
        flmc_lite_renderer_1.Raw(function (_) { return React.createElement(View, { controller: valueContainer, options: options }); }),
        flmc_lite_renderer_1.Container([
            flmc_lite_renderer_1.Button(options.localization.ok)
                .variant(flmc_lite_renderer_1.ButtonVariant.Text)
                .colors(flmc_lite_renderer_1.ButtonColor.Primary)
                .onClick(function () { return open.next(false); }),
            flmc_lite_renderer_1.Button(options.localization.cancel)
                .variant(flmc_lite_renderer_1.ButtonVariant.Text)
                .onClick(function () {
                open.next(false);
                valueContainer.next(lastDate);
            }),
            flmc_lite_renderer_1.Container([]),
            flmc_lite_renderer_1.Button(options.localization.now)
                .variant(flmc_lite_renderer_1.ButtonVariant.Text)
                .onClick(function () { return valueContainer.next(new Date()); })
                .visibility(options.showNow ? flmc_lite_renderer_1.VisibilityType.Show : flmc_lite_renderer_1.VisibilityType.Gone),
        ])
            .direction(flmc_lite_renderer_1.ContainerDirection.RowReverse)
            .flex([0, 0, 1, 0]),
        flmc_lite_renderer_1.Space().height(10),
    ]))
        .noPadding(true)
        .open(open)
        .visibleHeader(false);
    // Input
    var valueObservable = valueContainer
        .asObservable()
        .pipe(operators_1.map(function (v) {
        return v == null ? "" : new options.dateUtils().date(v).format(options.format);
    }));
    var inputElement = options.inputElement == null
        ? new TextInputElement_1.TextInputElement()
        : options.inputElement;
    inputElement.value(valueObservable);
    // connect input to modal
    inputElement.endIcon("calendar_today").onEndIconClick(function () {
        lastDate = valueContainer.value;
        open.next(true);
    });
    // clerable
    if (options.clearable) {
        inputElement
            .startIcon(valueContainer.pipe(operators_1.map(function (v) { return (v == null ? undefined : "close"); })))
            .onStartIconClick(function () { return valueContainer.next(null); });
    }
    var containerElement = flmc_lite_renderer_1.Container([inputElement, modal]);
    return containerElement;
}
exports.Picker = Picker;
function View(_a) {
    var controller = _a.controller, options = _a.options;
    var _b = React.useState(null), value = _b[0], setValue = _b[1];
    React.useEffect(function () {
        var valueSub = controller.subscribe({ next: function (v) { return setValue(v); } });
        return function () {
            valueSub.unsubscribe();
        };
    }, [controller]);
    function handleOnChange(v) {
        controller.next(v._d);
    }
    function createPicker() {
        switch (options.type) {
            case PickerTypes.TimePicker:
                return (React.createElement(pickers_1.TimePicker, { ampm: false, variant: "static", openTo: "hours", value: value, onChange: handleOnChange }));
            case PickerTypes.DatePicker:
                return (React.createElement(pickers_1.DatePicker, { variant: "static", value: value, onChange: handleOnChange }));
            case PickerTypes.DateTimePicker:
                return (React.createElement(pickers_1.DateTimePicker, { ampm: false, variant: "static", value: value, onChange: handleOnChange }));
        }
        throw new Error("Invalid picker type");
    }
    return (React.createElement(pickers_1.MuiPickersUtilsProvider, { utils: options.dateUtils, locale: options.locale }, createPicker()));
}
