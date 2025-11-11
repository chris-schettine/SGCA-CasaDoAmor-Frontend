import { FormControl, Input, InputAdornment, InputLabel, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
// Removido ClearIcon personalizado para evitar duplicação com o clear nativo do input type="search"

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
  // O navegador já fornece botão clear para type="search" em alguns sistemas (ex: Safari, Edge, Chrome WebKit variantes)
  // Para manter acessibilidade, ainda permitimos limpar via ESC e exposição programática se necessário futuramente.
  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Escape' && value) {
      onChange('');
    }
  };

  return (
    <FormControl fullWidth={fullWidth} variant="standard">
      <InputLabel htmlFor={id}>{label}</InputLabel>
      <Input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label={label}
        endAdornment={
          <InputAdornment position="end">
            <IconButton aria-label="buscar" edge="end" tabIndex={-1}>
              <SearchIcon />
            </IconButton>
          </InputAdornment>
        }
      />
    </FormControl>
  );
}
