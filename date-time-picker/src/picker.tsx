import {
  DatePicker,
  DateTimePicker,
  MuiPickersUtilsProvider,
  TimePicker as TimePickerView,
} from "@material-ui/pickers";
import { isSubject } from "@rayflmc/flmc-data-layer/lib/FormController/Elements/RxUtils";
import {
  Button,
  ButtonColor,
  ButtonVariant,
  Container,
  ContainerDirection,
  Modal,
  Raw,
  Space,
  VisibilityType,
} from "@rayflmc/flmc-lite-renderer";
import IElement from "@rayflmc/flmc-lite-renderer/build/flmc-data-layer/FormController/IElement";
import { TextInputElement } from "@rayflmc/flmc-lite-renderer/build/form/elements/input/TextInputElement";
import * as React from "react";
import { BehaviorSubject, isObservable, Observable } from "rxjs";
import { map } from "rxjs/operators";

export type Localization = {
  ok: string;
  cancel: string;
  now: string;
  clear: string;
};

export enum PickerTypes {
  TimePicker,
  DatePicker,
  DateTimePicker,
}

export type Options = {
  format: string;
  showNow: boolean;
  clearable: boolean;
  inputElement?: TextInputElement;
  localization: Localization;
  type: PickerTypes;
  dateUtils: any;
  locale?: string;
};

export type PickerValueType =
  | BehaviorSubject<Date | null>
  | Observable<Date | null>
  | (Date | null);
export function Picker(value: PickerValueType, options: Options): IElement {
  let valueContainer: BehaviorSubject<Date | null>;
  if (isSubject(value)) {
    valueContainer = value as BehaviorSubject<Date | null>;
  } else if (isObservable(value)) {
    valueContainer = new BehaviorSubject<Date | null>(null);
    value.subscribe({ next: (v) => valueContainer.next(v) });
  } else {
    valueContainer = new BehaviorSubject(value);
  }

  // Modal

  // holds last date in valueController so if user canceled any change we roll back changes
  let lastDate: Date | null = null;

  const open = new BehaviorSubject<boolean>(false);

  const modal = Modal(
    Container([
      Raw((_) => <View controller={valueContainer} options={options} />),
      Container([
        Button(options.localization.ok)
          .variant(ButtonVariant.Text)
          .colors(ButtonColor.Primary)
          .onClick(() => open.next(false)),
        Button(options.localization.cancel)
          .variant(ButtonVariant.Text)
          .onClick(() => {
            open.next(false);
            valueContainer.next(lastDate);
          }),
        Container([]),
        Button(options.localization.now)
          .variant(ButtonVariant.Text)
          .onClick(() => valueContainer.next(new Date()))
          .visibility(
            options.showNow ? VisibilityType.Show : VisibilityType.Gone
          ),
      ])
        .direction(ContainerDirection.RowReverse)
        .flex([0, 0, 1, 0]),
      Space().height(10),
    ])
  )
    .noPadding(true)
    .open(open)
    .visibleHeader(false);

  // Input

  const valueObservable = valueContainer
    .asObservable()
    .pipe(
      map((v) =>
        v == null ? "" : new options.dateUtils().date(v).format(options.format)
      )
    );
  const inputElement =
    options.inputElement == null
      ? new TextInputElement()
      : options.inputElement;
  inputElement.value(valueObservable);

  // connect input to modal

  inputElement.endIcon("calendar_today").onEndIconClick(() => {
    lastDate = valueContainer.value;
    open.next(true);
  });

  // clerable
  if (options.clearable) {
    inputElement
      .startIcon(
        valueContainer.pipe(map((v) => (v == null ? undefined : "close")))
      )
      .onStartIconClick(() => valueContainer.next(null));
  }

  const containerElement = Container([inputElement, modal]);

  return containerElement;
}

type Props = {
  controller: BehaviorSubject<Date | null>;
  options: Options;
};

function View({ controller, options }: Props): React.ReactElement {
  const [value, setValue] = React.useState<Date | null>(null);

  React.useEffect(() => {
    const valueSub = controller.subscribe({ next: (v) => setValue(v) });

    return () => {
      valueSub.unsubscribe();
    };
  }, [controller]);

  function handleOnChange(v: any) {
    controller.next(v._d);
  }

  function createPicker(): React.ReactElement {
    switch (options.type) {
      case PickerTypes.TimePicker:
        return (
          <TimePickerView
            ampm={false}
            variant="static"
            openTo="hours"
            value={value}
            onChange={handleOnChange}
          />
        );
      case PickerTypes.DatePicker:
        return (
          <DatePicker
            variant="static"
            value={value}
            onChange={handleOnChange}
          />
        );
      case PickerTypes.DateTimePicker:
        return (
          <DateTimePicker
            ampm={false}
            variant="static"
            value={value}
            onChange={handleOnChange}
          />
        );
    }
    throw new Error("Invalid picker type");
  }

  return (
    <MuiPickersUtilsProvider utils={options.dateUtils} locale={options.locale}>
      {createPicker()}
    </MuiPickersUtilsProvider>
  );
}
