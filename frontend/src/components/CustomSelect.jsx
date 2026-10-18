import { useEffect, useRef, useState } from "react";
import "./CustomSelect.css";

function CustomSelect({ label, name, value, placeholder, options, onChange }) {
  const [open, setOpen] = useState(false);
  const selectRef = useRef(null);

  const selectedOption = options.find((option) => option.value === value);

  const handleSelect = (optionValue) => {
    onChange({
      target: {
        name,
        value: optionValue,
      },
    });

    setOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, []);

  return (
    <div className="custom-select-field" ref={selectRef}>
      {label && <label>{label}</label>}

      <button
        type="button"
        className={`custom-select-trigger ${open ? "active" : ""}`}
        onClick={() => setOpen((previousOpen) => !previousOpen)}
      >
        <span
          className={selectedOption ? "custom-selected" : "custom-placeholder"}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        <span className={`custom-arrow ${open ? "open" : ""}`}>⌄</span>
      </button>

      {open && (
        <div className="custom-select-dropdown">
          {options.map((option) => (
            <button
              type="button"
              key={option.value}
              className={`custom-select-item ${
                value === option.value ? "selected" : ""
              }`}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default CustomSelect;