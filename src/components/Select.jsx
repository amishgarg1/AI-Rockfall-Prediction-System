import React, { useEffect, useId, useRef, useState } from 'react';
import './Select.css';

/* A styled replacement for <select>.

   A native select renders its option list through the operating system, which
   is why the dropdowns came out as a plain white Windows list on a dark page:
   no amount of CSS on <option> can reach it. This draws the list itself, so it
   can match the rest of the interface — and it keeps the keyboard behaviour
   people expect from the native control:

     ArrowDown / ArrowUp   move the highlight (and open the list if closed)
     Home / End            jump to the first or last option
     Enter / Space         commit the highlighted option
     Escape                close without changing anything
     Tab / outside click   close

   `options` is [{ value, label }]. */
const Select = ({ value, onChange, options, id, ariaLabel, name }) => {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef(null);
  const listRef = useRef(null);
  const generatedId = useId();
  const listId = `${id ?? generatedId}-listbox`;

  const selectedIndex = Math.max(options.findIndex((o) => o.value === value), 0);
  const selected = options[selectedIndex];

  /* Opening always starts from what is currently selected, not from wherever
     the highlight happened to be left last time. */
  const openList = () => {
    setActiveIndex(selectedIndex);
    setOpen(true);
  };

  const commit = (index) => {
    const option = options[index];
    if (option) onChange(option.value);
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  /* Keep the highlighted row in view when arrowing through a long list. */
  useEffect(() => {
    if (!open || !listRef.current) return;
    const node = listRef.current.children[activeIndex];
    if (node) node.scrollIntoView({ block: 'nearest' });
  }, [open, activeIndex]);

  const handleKeyDown = (event) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!open) { openList(); return; }
        setActiveIndex((i) => Math.min(i + 1, options.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!open) { openList(); return; }
        setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case 'Home':
        if (open) { event.preventDefault(); setActiveIndex(0); }
        break;
      case 'End':
        if (open) { event.preventDefault(); setActiveIndex(options.length - 1); }
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (open) commit(activeIndex); else openList();
        break;
      case 'Escape':
        if (open) { event.preventDefault(); setOpen(false); }
        break;
      case 'Tab':
        setOpen(false);
        break;
      default:
        break;
    }
  };

  return (
    <div className={`ms-select ${open ? 'is-open' : ''}`} ref={rootRef}>
      <button
        type="button"
        id={id}
        name={name}
        className="ms-select-trigger"
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={ariaLabel}
      >
        <span className="ms-select-value">{selected?.label ?? ''}</span>
        <svg className="ms-select-chevron" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 6.5 8 10.5 12 6.5" />
        </svg>
      </button>

      {open && (
        <ul
          className="ms-select-list"
          id={listId}
          role="listbox"
          ref={listRef}
          tabIndex={-1}
          aria-activedescendant={`${listId}-${activeIndex}`}
        >
          {options.map((option, index) => (
            <li
              key={option.value}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={option.value === value}
              className={`ms-select-option ${index === activeIndex ? 'is-active' : ''} ${option.value === value ? 'is-selected' : ''}`}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseDown={(e) => e.preventDefault()} /* keep focus on the trigger */
              onClick={() => commit(index)}
            >
              <span className="ms-select-option-label">{option.label}</span>
              {option.value === value && (
                <svg className="ms-select-check" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3.5 8.5 6.5 11.5 12.5 5" />
                </svg>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Select;
