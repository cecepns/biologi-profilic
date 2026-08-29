import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

export const DebounceInput = ({
  value: initialValue = '',
  onChange,
  debounce = 350,
  placeholder = 'Cari data...',
  className = '',
  ...props
}) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value, debounce, onChange]);

  return (
    <div className={`relative flex items-center ${className}`}>
      <Search className="absolute left-3.5 text-slate-400 pointer-events-none" size={18} />
      <input
        {...props}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400 shadow-xs"
      />
    </div>
  );
};
