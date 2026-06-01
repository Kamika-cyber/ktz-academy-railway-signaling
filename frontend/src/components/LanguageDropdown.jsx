import { useEffect, useRef, useState } from 'react';

const DEFAULT_OPTIONS = [
  { value: 'ru', label: 'RU' },
  { value: 'kz', label: 'KZ' },
  { value: 'en', label: 'EN' },
];

const LanguageDropdown = ({
  value,
  onChange,
  options = DEFAULT_OPTIONS,
  variant = 'default',
  ariaLabel = 'Language',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);
  const selected = options.find((option) => option.value === value) || options[0];

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSelect = (nextValue) => {
    onChange(nextValue);
    setIsOpen(false);
  };

  return (
    <div
      ref={rootRef}
      className={`language-dropdown language-dropdown--${variant} ${isOpen ? 'is-open' : ''}`}
    >
      <button
        type="button"
        className="language-dropdown__button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span>{selected.label}</span>
        <i className="fas fa-chevron-down" aria-hidden="true"></i>
      </button>

      {isOpen && (
        <div className="language-dropdown__menu" role="listbox" aria-label={ariaLabel}>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`language-dropdown__option ${option.value === value ? 'is-active' : ''}`}
              role="option"
              aria-selected={option.value === value}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageDropdown;
