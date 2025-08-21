import { useEffect, useRef, useState } from 'react';
import { Icon } from './Icons.jsx';

export default function Dropdown({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  disabled = false,
  searchable = false,
  renderOption,
  align = 'left',
  style,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = options.find((o) => o.value === value);

  const filtered = query
    ? options.filter((o) =>
        String(o.label).toLowerCase().includes(query.toLowerCase())
      )
    : options;

  return (
    <div className={`dropdown ${disabled ? 'dropdown-disabled' : ''}`} ref={ref} style={style}>
      <button
        type="button"
        className="dropdown-trigger"
        onClick={() => !disabled && setOpen((v) => !v)}
        disabled={disabled}
      >
        {renderOption && selected ? (
          renderOption(selected)
        ) : (
          <span className={selected ? '' : 'dropdown-placeholder'}>
            {selected ? selected.label : placeholder}
          </span>
        )}
        <span className="dropdown-chevron">▼</span>
      </button>
      {open && (
        <div className={`dropdown-menu dropdown-menu-${align}`}>
          {searchable && (
            <div className="dropdown-search">
              <input
                autoFocus
                placeholder="Search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          )}
          <div className="dropdown-options">
            {filtered.length === 0 && <div className="dropdown-empty">No options</div>}
            {filtered.map((opt) => (
              <button
                type="button"
                key={opt.value}
                className={`dropdown-option ${value === opt.value ? 'dropdown-option-selected' : ''}`}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                  setQuery('');
                }}
              >
                {renderOption ? renderOption(opt) : <span>{opt.label}</span>}
                {value === opt.value && <Icon name="check" className="dropdown-check" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}