import { Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export const SearchBar = ({ onSearch, placeholder = 'Search projects...' }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, onSearch]);

  return (
    <div className={cn(
      "relative w-full max-w-md transition-all duration-300",
      isFocused && "scale-[1.02]"
    )}>
      <Search className={cn(
        "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200",
        isFocused ? "text-primary" : "text-muted-foreground"
      )} />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className={cn(
          "w-full h-10 pl-11 pr-4 rounded-full text-sm transition-all duration-200",
          "bg-card/60 backdrop-blur-sm border text-foreground placeholder:text-muted-foreground",
          "focus:outline-none focus:ring-2 focus:ring-primary/30",
          isFocused 
            ? "border-primary/50 shadow-lg shadow-primary/5" 
            : "border-border/40 hover:border-border/60"
        )}
      />
    </div>
  );
};
