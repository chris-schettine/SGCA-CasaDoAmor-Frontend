import { FormControl, Input, InputAdornment, InputLabel, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  id?: string;
  fullWidth?: boolean;
}

/**
 * Componente de busca padronizado
 */
export default function SearchBar({
  value,
  onChange,
  label = 'Buscar',
  placeholder,
  id = 'search-input',
  fullWidth = true,
}: SearchBarProps) {
  const handleClear = () => {
    onChange('');
  };

  return (
    <FormControl fullWidth={fullWidth} variant="standard">
      <InputLabel htmlFor={id}>{label}</InputLabel>
      <Input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        endAdornment={
          <InputAdornment position="end">
            {value && (
              <IconButton
                aria-label="limpar busca"
                onClick={handleClear}
                edge="end"
                size="small"
              >
                <ClearIcon />
              </IconButton>
            )}
            <IconButton aria-label="buscar" edge="end">
              <SearchIcon />
            </IconButton>
          </InputAdornment>
        }
      />
    </FormControl>
  );
}
