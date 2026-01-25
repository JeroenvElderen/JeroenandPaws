import React from "react";
import VirtualizedList from "../common/VirtualizedList";

const SearchableSelect = ({
  label,
  options,
  value,
  onChange,
  className = "",
  fullWidth = true,
  placeholder = "Search breeds…",
  onSearch,
  filteredOptions,
}) => {
  const labelClassName = fullWidth ? "input-group full-width" : "input-group";
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [highlight, setHighlight] = React.useState(0);

  const listRef = React.useRef(null);
  const virtualizedListRef = React.useRef(null);
  const inputRef = React.useRef(null);

  const rowHeight = 44;
  const listMaxHeight = rowHeight * 5;
  const filtered = React.useMemo(() => {
    if (filteredOptions) return filteredOptions;

    const q = query.toLowerCase();
    return options.filter((opt) => opt.toLowerCase().includes(q));
  }, [query, options, filteredOptions]);

  const handleSearch = (text) => {
    setQuery(text);
    setHighlight(0);
    setOpen(true);

    if (onSearch) {
      onSearch(text);
    }

    if (text === "") {
      onChange("");
    }
  };

  React.useEffect(() => {
    if (!open) return;
    setHighlight((h) => Math.min(h, Math.max(filtered.length - 1, 0)));
  }, [filtered, open]);

  React.useEffect(() => {
    if (!open) return;
    if (!virtualizedListRef.current) return;
    if (!filtered.length) return;
    virtualizedListRef.current.scrollToItem(highlight, "smart");
  }, [highlight, filtered.length, open]);

  React.useEffect(() => {
    // Keep the visible value in sync when an option is selected externally
    if (!open && query === "") {
      setQuery("");
    }
  }, [value, open, query]);

  React.useEffect(() => {
    const handleClick = (e) => {
      if (
        listRef.current &&
        inputRef.current &&
        !listRef.current.contains(e.target) &&
        !inputRef.current.contains(e.target)
      ) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleKeyDown = (e) => {
    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    }

    if (e.key === "Enter") {
      e.preventDefault();
      const choice = filtered[highlight];
      if (choice) {
        onChange(choice);
        setQuery("");
        setOpen(false);
      }
    }

    if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const handleOptionSelect = (choice) => {
    if (!choice) return;
    onChange(choice);
    setQuery("");
    setOpen(false);
  };

  const Row = ({ index, style, data }) => {
    const { items, currentValue, onSelect } = data;
    const opt = items[index];
    if (!opt) return null;
    const itemStyle = {
      ...style,
      padding: "10px 12px",
      margin: 0,
    };
    return (
      <li
        key={opt}
        style={itemStyle}
        className={`option ${index === highlight ? "highlight" : ""} ${
          currentValue === opt ? "selected" : ""
        }`}
        onMouseEnter={() => setHighlight(index)}
        onClick={() => onSelect(opt)}
        role="option"
        aria-selected={currentValue === opt}
      >
        <span className="option-label">{opt}</span>
        {currentValue === opt && <span className="option-check">✓</span>}
      </li>
    );
  };

  return (
    <div className={`searchable-select ${className}`}>
      <label className={labelClassName}>
        <span>{label}</span>
        <div className="select-shell">
          <div className="select-input" role="combobox" aria-expanded={open}>
            <input
              ref={inputRef}
              type="text"
              value={query !== "" ? query : value}
              placeholder={placeholder}
              onFocus={() => {
                setOpen(true);
                setHighlight(0);
              }}
              onKeyDown={handleKeyDown}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {value && (
              <button
                type="button"
                className="clear-button"
                onClick={() => {
                  onChange("");
                  setQuery("");
                  inputRef.current?.focus();
                }}
                aria-label="Clear breed selection"
              >
                ×
              </button>
            )}
            <span className="chevron" aria-hidden="true">
              {open ? "▲" : "▼"}
            </span>
          </div>

          {open && (
            <>
              {filtered.length === 0 ? (
                <ul className="options-list" ref={listRef} role="listbox">
                  <li className="no-results">No breeds found</li>
                </ul>
              ) : (
                <VirtualizedList
                  ref={virtualizedListRef}
                  outerRef={listRef}
                  className="options-list"
                  itemCount={filtered.length}
                  itemSize={rowHeight}
                  maxHeight={listMaxHeight}
                  role="listbox"
                  ariaLabel="Breed options"
                  innerPadding={6}
                  itemData={{
                    items: filtered,
                    currentValue: value,
                    onSelect: handleOptionSelect,
                  }}
                  renderItem={Row}
                />
              )}
            </>
          )}
        </div>
      </label>
    </div>
  );
};

export default SearchableSelect;