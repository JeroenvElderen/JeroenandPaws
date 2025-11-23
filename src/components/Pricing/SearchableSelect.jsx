import React from "react";

const SearchableSelect = ({
  label,
  options,
  value,
  onChange,
  className = "",
  fullWidth = true,
}) => {
  const labelClassName = fullWidth ? "input-group full-width" : "input-group";
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [highlight, setHighlight] = React.useState(0);

  const listRef = React.useRef(null);
  const inputRef = React.useRef(null);

  const filtered = React.useMemo(() => {
    const q = query.toLowerCase();
    return options.filter((opt) => opt.toLowerCase().includes(q));
  }, [query, options]);

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

  return (
    <div className={`searchable-select ${className}`}>
      <label className={labelClassName}>
        <span>{label}</span>

        <input
          ref={inputRef}
          type="text"
          value={query !== "" ? query : value}
          placeholder="Search breeds…"
          onFocus={() => {
            setOpen(true);
            setHighlight(0);
          }}
          onKeyDown={handleKeyDown}
          onChange={(e) => {
            const text = e.target.value;
            setQuery(text);
            setOpen(true);

            if (text === "") {
              onChange("");
            }
          }}
        />

        {open && (
          <ul className="options-list" ref={listRef}>
            {filtered.length === 0 && (
              <li className="no-results">No breeds found</li>
            )}

            {filtered.map((opt, i) => (
              <li
                key={opt}
                className={`option ${i === highlight ? "highlight" : ""}`}
                onMouseEnter={() => setHighlight(i)}
                onClick={() => {
                  onChange(opt);
                  setQuery("");
                  setOpen(false);
                }}
              >
                {opt}
              </li>
            ))}
          </ul>
        )}
      </label>
    </div>
  );
};

export default SearchableSelect;