# Design Tokens - Sistema Unificado

Este diretório contém o sistema unificado de design tokens para o SGCA - Casa do Amor.

## Estrutura

```
design-tokens/
├── index.ts          # Tokens base (cores, tipografia, espaçamentos, etc)
├── themes.ts         # Sistema de temas (light/dark/brand)
├── types.ts          # TypeScript types para estender Material-UI Theme
├── utils.ts          # Hooks e utilitários para usar tokens
└── README.md         # Esta documentação
```

## Uso

### 1. Acessar tokens no componente

```tsx
import { useDesignTokens } from '@/design-tokens/utils';

const MyComponent = () => {
  const tokens = useDesignTokens();
  
  return (
    <Box sx={{ 
      backgroundColor: tokens.brandColors.primary[500],
      padding: tokens.spacing[4],
      borderRadius: tokens.borderRadius.base,
    }}>
      Conteúdo
    </Box>
  );
};
```

### 2. Usar cores da marca

```tsx
import { useBrandColors } from '@/design-tokens/utils';

const MyComponent = () => {
  const colors = useBrandColors();
  
  return (
    <Box sx={{ color: colors.primary[500] }}>
      Texto
    </Box>
  );
};
```

### 3. Alternar temas

```tsx
import { useThemeMode } from '@/contexts/ThemeContext';

const MyComponent = () => {
  const { mode, setMode, toggleMode } = useThemeMode();
  
  return (
    <Button onClick={() => toggleMode()}>
      Tema atual: {mode}
    </Button>
  );
};
```

### 4. Acessar tokens via theme.custom

```tsx
import { useTheme } from '@mui/material/styles';

const MyComponent = () => {
  const theme = useTheme();
  
  return (
    <Box sx={{ 
      color: theme.custom.brandColors.primary[500],
      padding: theme.spacing(2), // Material-UI spacing
    }}>
      Conteúdo
    </Box>
  );
};
```

## Temas Disponíveis

- **Light**: Tema claro padrão (sempre usado por padrão)
- **Dark**: Tema escuro (opcional, usuário pode escolher)

## Tokens Disponíveis

### Cores
- `brandColors`: Paleta da marca (primary, secondary, light, dark)
- `semanticColors`: Cores semânticas (success, error, warning, info)
- `neutralColors`: Escala de cinzas

### Tipografia
- `fontFamily`: Famílias de fonte
- `fontSize`: Tamanhos de fonte
- `fontWeight`: Pesos de fonte
- `lineHeight`: Alturas de linha

### Espaçamentos
- Base de 8px (spacing[2])
- Valores de 0 a 20

### Outros
- `borderRadius`: Raio de borda
- `shadows`: Sombras
- `transitions`: Durações e easings
- `breakpoints`: Breakpoints responsivos
- `touchTargets`: Tamanhos mínimos de toque (WCAG)
- `focus`: Estilos de foco (WCAG)

## Migração

Para migrar componentes antigos:

1. **Substituir cores hardcoded**:
   ```tsx
   // Antes
   backgroundColor: '#09244B'
   
   // Depois
   backgroundColor: theme.custom.brandColors.primary[500]
   ```

2. **Usar tokens de espaçamento**:
   ```tsx
   // Antes
   padding: '16px'
   
   // Depois
   padding: theme.spacing(2) // ou tokens.spacing[4]
   ```

3. **Usar tokens de tipografia**:
   ```tsx
   // Antes
   fontSize: '14px'
   
   // Depois
   fontSize: theme.custom.typography.fontSize.md
   ```

## Benefícios

✅ **Consistência**: Todos os componentes usam os mesmos tokens
✅ **Manutenibilidade**: Mudanças centralizadas
✅ **Escalabilidade**: Fácil adicionar novos temas
✅ **Type Safety**: TypeScript garante uso correto
✅ **Acessibilidade**: Tokens seguem WCAG 2.2 AA

