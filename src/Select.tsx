import { useEffect, useRef, useState } from "react";
import styles from "./select.module.css";

export type SelectOption = {
  label: string;
  value: string | number;
};

type MultipleSelectProps = {
  multiple: true;
  value: SelectOption[];
  onChange: (value: SelectOption[]) => void;
};
type SingleSelectProps = {
  multiple?: false;
  value?: SelectOption;
  onChange: (value: SelectOption | undefined) => void;
};

type SelectPros = {
  options: SelectOption[];
} & (SingleSelectProps | MultipleSelectProps);

const Select = (props: SelectPros) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  function clearOptions() {
    props.multiple ? props.onChange([]) : props.onChange(undefined);
  }

  function selectOption(option: SelectOption) {
    if (props.multiple) {
      if (props.value.includes(option)) {
        props.onChange(props.value.filter((o) => o !== option));
      } else {
        props.onChange([...props.value, option]);
      }
    } else {
      if (option !== props.value) props.onChange(option);
    }
  }

  function isOptionSelected(option: SelectOption) {
    return props.multiple
      ? props.value.includes(option)
      : option === props.value;
  }

  useEffect(() => {
    if (isOpen) setHighlightedIndex(0);
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target != containerRef.current) return;
      switch (e.code) {
        case "Enter":
        case "Space":
          setIsOpen(!isOpen);
          if (isOpen) selectOption(props.options[highlightedIndex]);
          break;
        case "ArrowUp":
        case "ArrowDown":
          if (!isOpen) {
            setIsOpen(true);
            break;
          }

          const newValue = highlightedIndex + (e.code === "ArrowDown" ? 1 : -1);
          if (newValue >= 0 && newValue < props.options.length) {
            setHighlightedIndex(newValue);
          }
          break;
        case "Escape":
          setIsOpen(false);
          break;
      }
    };
    containerRef.current?.addEventListener("keydown", handler);

    return () => {
      containerRef.current?.addEventListener("keydown", handler);
    };
  }, [isOpen, highlightedIndex, props.options]);

  return (
    <div
      ref={containerRef}
      onClick={() => setIsOpen(!isOpen)}
      onBlur={() => setIsOpen(false)}
      className={styles.container}
      tabIndex={0}
    >
      <span className={styles.value}>
        {props.multiple
          ? props.value.map((item) => (
              <button
                key={item.value}
                onClick={(e) => {
                  e.stopPropagation();
                  selectOption(item);
                }}
                className={styles["option-badge"]}
              >
                {item.label}
                <span className={styles["remove-btn"]}>&times;</span>
              </button>
            ))
          : props.value?.label}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          clearOptions();
        }}
        className={styles["clear-btn"]}
      >
        &times;
      </button>
      <div className={styles.divider}></div>
      <div className={styles.caret}></div>
      <ul className={`${styles.options} ${isOpen ? styles.show : ""}`}>
        {props.options.map((option, index) => (
          <li
            onClick={(e) => {
              e.stopPropagation();
              selectOption(option);
              setIsOpen(false);
            }}
            onMouseEnter={() => setHighlightedIndex(index)}
            className={`${styles.option} ${
              isOptionSelected(option) ? styles.selected : ""
            } ${index === highlightedIndex ? styles.highlighted : ""}`}
            key={option.value}
          >
            {option.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Select;
