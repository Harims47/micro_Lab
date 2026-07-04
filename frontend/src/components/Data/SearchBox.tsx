import React from 'react';
import './Data.css';
import { Search } from 'lucide-react';

export interface SearchBoxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onChangeValue: (value: string) => void;
}

export const SearchBox: React.FC<SearchBoxProps> = ({
  value,
  onChangeValue,
  placeholder = 'Search records...',
  className = '',
  ...props
}) => {
  return (
    <div className={`lims-searchbox-container ${className}`}>
      <Search size={16} className="lims-searchbox-icon" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChangeValue(e.target.value)}
        className="lims-input lims-searchbox-input"
        placeholder={placeholder}
        {...props}
      />
    </div>
  );
};
