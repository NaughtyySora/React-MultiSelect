import { ChangeEvent, HTMLAttributes, forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { Select } from "../Select/Select";
import { TextInput } from "../TextInput/TextInput";
import "./MultiSelect.scss";

export interface iOption {
  value: string;
  label: string;
  [k: string]: any;
};

interface iMultiSelect {
  options: iOption[];
  getValues: (data: iOption[], resetList: iOption[]) => void;
  onChange?: (option: iOption) => void;
  onRemove?: (option: iOption, data: iOption[]) => void;
  inputProps?: HTMLAttributes<HTMLInputElement>;
  value?: string;
  picked?: iOption[]
  limit?: number;
  className?: string;
};

export interface tMultiSelectRef {
  cleanValues: () => void;
};

export const MultiSelect = forwardRef<tMultiSelectRef, iMultiSelect>(
  function ({ options, getValues, onChange, onRemove, picked = [], limit, value = "", inputProps, className = "" }, ref) {

    const [values, setValues] = useState<iOption[]>(picked);
    const [inputValue, setInputValue] = useState(value);

    useImperativeHandle(ref, () => ({ cleanValues }), []);

    const lowerValue = inputValue.trim().toLowerCase();

    const inputQuery = (item: iOption) => lowerValue ? item.label.toLowerCase().includes(lowerValue)
      || item.value.toLowerCase().includes(lowerValue) : true;

    const intersectionQuery = (item: iOption) => !values.find(value => value.label === item.label);
    const localOptions = options?.filter(intersectionQuery).filter(inputQuery) || [];

    const cleanValues = () => {
      setValues(picked);
      getValues([], localOptions);
    };

    useEffect(() => {
      getValues(values, localOptions);
    }, [values]);

    const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
      inputProps?.onChange?.(e);
    };

    const onSelect = (option: iOption) => {
      if (limit && values.length >= limit) return;
      setValues(pv => [...pv, option])
      onChange?.(option);
      setInputValue("");
    };

    const removeValue = (target: iOption) => {
      setValues(pv => [...pv].filter(item => item !== target));
      setInputValue("");
      onRemove?.(target, values);
    };

    const ListItem = (option: iOption) => <span className="MultiSelect-option">{option.label}</span>;

    return (
      <div className={`MultiSelect ${className}`}>
        <Select
          options={localOptions}
          ListItem={ListItem}
          onSelect={onSelect}
          listItemKey="label"
        >
          {values?.map(item => (
            <button
              key={item?.label}
              className="MultiSelect-picked"
              onClick={() => removeValue(item)}
            >
              {item?.label}
            </button>
          ))}

          <TextInput
            id="multi_text_input"
            className={`MultiSelect-input ${!values.length ? "wide" : ""}`}
            autoComplete="off"
            placeholder="Enter Coin"
            {...inputProps}
            value={inputValue}
            onChange={onInputChange}
          />
        </Select>
      </div>
    );
  });

MultiSelect.displayName = "MultiSelect";