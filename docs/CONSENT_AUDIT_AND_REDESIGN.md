# Sistema de Consentimento LGPD - Implementação Completa

## 📋 RESUMO EXECUTIVO

**Status**: Auditoria concluída ✅ | Implementação em andamento ⏳

**Problemas Críticos Identificados**: 24 issues (10 críticos, 9 importantes, 5 menores)

**Arquivos Criados**:
- ✅ `src/consent/types/consent.types.ts` - Tipos TypeScript
- ✅ `src/consent/config/consentConfig.ts` - Configuração de finalidades
- ✅ `src/consent/config/designTokens.ts` - Design tokens WCAG 2.2 AA

---

## 🔴 PROBLEMAS CRÍTICOS (BLOQUEIAM WCAG 2.2 AA)

### 1. Semântica ARIA Ausente
**Arquivo**: `ConsentimentoLGPDCheck/index.tsx`, `ConsentimentoForm/index.tsx`
**Problema**: Dialog não tem `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, `aria-describedby`
**Impacto**: Leitores de tela não identificam como modal
**Solução**: Adicionar atributos:
```tsx
<Dialog
  open={open}
  role="dialog"
  aria-modal="true"
  aria-labelledby="consent-dialog-title"
  aria-describedby="consent-dialog-description"
>
  <DialogTitle id="consent-dialog-title">...</DialogTitle>
  <DialogContent id="consent-dialog-description">...</DialogContent>
</Dialog>
```

### 2. Emojis no Texto Principal
**Arquivo**: `ConsentimentoLGPDCheck/index.tsx` linha 74, `ConsentimentoForm/index.tsx` linha 262-263
**Problema**: "📋 Consentimento LGPD Obrigatório", "✓ Concordo", "⚠️ Declaro"
**Impacto**: NVDA vocaliza "clipboard emoji", confunde usuário
**Solução**: Remover emojis do texto OU usar aria-hidden:
```tsx
<Typography>
  <span aria-hidden="true">📋 </span>
  Consentimento LGPD Obrigatório
</Typography>
```

### 3. Focus Trap Ausente
**Arquivo**: Todos os dialogs
**Problema**: Tab/Shift+Tab não prendem foco dentro do modal
**Impacto**: Usuário de teclado "escapa" do modal
**Solução**: Implementar `useFocusTrap` hook:
```typescript
// src/consent/hooks/useFocusTrap.ts
export function useFocusTrap(containerRef: RefObject<HTMLElement>, isActive: boolean) {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;
    
    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };
    
    container.addEventListener('keydown', handleKeyDown);
    firstElement.focus(); // Foco inicial
    
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [containerRef, isActive]);
}
```

### 4. Retorno de Foco Ausente
**Problema**: Ao fechar dialog, foco não retorna ao elemento que abriu
**Solução**:
```typescript
const previousFocusRef = useRef<HTMLElement | null>(null);

const openDialog = () => {
  previousFocusRef.current = document.activeElement as HTMLElement;
  setOpen(true);
};

const closeDialog = () => {
  setOpen(false);
  setTimeout(() => previousFocusRef.current?.focus(), 0);
};
```

### 5. ESC Desabilitado (Violação de Controle do Usuário)
**Arquivo**: `ConsentimentoLGPDCheck/index.tsx` linha 68
**Problema**: `disableEscapeKeyDown={true}`
**Impacto**: WCAG 2.1.2 No Keyboard Trap
**Solução**: Remover e explicar implicações ao fechar:
```tsx
<Dialog
  open={open}
  onClose={handleClose}
  // REMOVER: disableEscapeKeyDown
>
```

### 6. Granularidade Ausente (Dark Pattern)
**Arquivo**: `consentimentoSchema.ts`
**Problema**: `.refine(data => data.concorda === true)` força opt-in total
**Impacto**: Viola princípio de consentimento livre (LGPD Art. 8º, § 4º)
**Solução**: Permitir escolhas granulares por finalidade

### 7. Sem Eventos de Analytics
**Problema**: Zero tracking de interações
**Solução**: Criar `src/consent/analytics/consentAnalytics.ts`:
```typescript
export class ConsentAnalytics {
  static track(event: ConsentAnalyticsEvent) {
    const payload = {
      ...event,
      timestamp: new Date().toISOString(),
      device_id: this.getAnonymousId(), // Hash, não IP
    };
    
    // Enviar para endpoint de analytics
    window.dataLayer?.push(payload);
    
    // Log em dev
    if (process.env.NODE_ENV === 'development') {
      console.log('[Consent Analytics]', payload);
    }
  }
  
  private static getAnonymousId(): string {
    let id = localStorage.getItem('analytics_device_id');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('analytics_device_id', id);
    }
    return id;
  }
}
```

### 8. IP/Metadata Expostos na UI
**Arquivo**: `ConsentimentoForm/index.tsx` linhas 295-305
**Problema**: Alert mostra IP publicamente
**Impacto**: Privacidade questionável
**Solução**: Remover Alert de IP da UI (manter apenas no backend)

### 9. Botão "Fechar" Ausente
**Arquivo**: `ConsentimentoLGPDCheck/index.tsx`
**Problema**: Sem botão X visível
**Solução**: Adicionar IconButton no DialogTitle

### 10. Checkbox Sem Label Dedicado
**Arquivo**: `ConsentimentoForm/index.tsx`
**Problema**: Typography inline em FormControlLabel
**Solução**: Usar `<label>` HTML nativo com `htmlFor`

---

## ⚠️ PROBLEMAS IMPORTANTES (DEGRADAM UX)

### 11. Microcopy Prolixa
**Problema**: 150+ linhas de termo em `<pre>`
**Solução**: Resumo + link "Ler termo completo" expandível

### 12. Botão Cor Condicional Confusa
```tsx
// ANTES (confuso)
color={concordaValue ? 'success' : 'error'}

// DEPOIS (neutro)
variant="contained"
color="primary"
```

### 13-19. Outros (ver seção completa)

---

## 💡 ARQUIVOS A CRIAR

### `src/consent/store/consentStore.ts`
```typescript
import type { ConsentSnapshot, ConsentChoice } from '../types/consent.types';
import { CONSENT_STORAGE_KEY, CONSENT_VERSION, CONSENT_PURPOSES } from '../config/consentConfig';

export class ConsentStore {
  // Persistência dual (localStorage + API)
  static async save(userUuid: string, choices: ConsentChoice): Promise<ConsentSnapshot> {
    const snapshot: ConsentSnapshot = {
      version: CONSENT_VERSION,
      choices,
      timestamp: new Date().toISOString(),
    };
    
    // 1. Salvar localmente (síncrono)
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(snapshot));
    
    // 2. Sincronizar com API (assíncrono)
    try {
      await consentimentoService.registrarConsentimento(userUuid, {
        versaoTermo: snapshot.version,
        escopo: 'GERAL',
        concorda: this.hasAcceptedAll(choices),
        metadata: JSON.stringify(choices), // Salvar escolhas granulares
        // IP e userAgent são capturados pelo backend
      });
    } catch (error) {
      console.error('[ConsentStore] Falha ao sync com API:', error);
      // Continuar com cache local
    }
    
    return snapshot;
  }
  
  static load(userUuid: string): ConsentSnapshot | null {
    const cached = localStorage.getItem(CONSENT_STORAGE_KEY);
    return cached ? JSON.parse(cached) : null;
  }
  
  static getDefaultChoices(): ConsentChoice {
    return CONSENT_PURPOSES.reduce((acc, purpose) => {
      acc[purpose.id] = purpose.defaultEnabled;
      return acc;
    }, {} as ConsentChoice);
  }
  
  private static hasAcceptedAll(choices: ConsentChoice): boolean {
    return CONSENT_PURPOSES.every(p => choices[p.id] === true);
  }
}
```

### `src/consent/components/ConsentDialog/ConsentDialog.tsx`
```tsx
import { useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  IconButton,
  Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { CONSENT_LABELS, CONSENT_TERMS_SUMMARY } from '../../config/consentConfig';
import { ConsentPreferencesPanel } from '../ConsentPreferencesPanel/ConsentPreferencesPanel';
import { useFocusTrap } from '../../hooks/useFocusTrap';

interface ConsentDialogProps {
  open: boolean;
  onClose: () => void;
  onAcceptAll: () => void;
  onRejectNonEssential: () => void;
  onSavePreferences: (choices: ConsentChoice) => void;
  currentChoices?: ConsentChoice;
  isLoading?: boolean;
}

export function ConsentDialog({
  open,
  onClose,
  onAcceptAll,
  onRejectNonEssential,
  onSavePreferences,
  currentChoices,
  isLoading = false,
}: ConsentDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  
  // Focus trap
  useFocusTrap(dialogRef, open);
  
  // Salvar foco anterior
  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    }
  }, [open]);
  
  // Restaurar foco ao fechar
  const handleClose = () => {
    onClose();
    setTimeout(() => previousFocusRef.current?.focus(), 0);
  };
  
  // Permitir Esc
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [open]);
  
  return (
    <Dialog
      ref={dialogRef}
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="consent-dialog-title"
      aria-describedby="consent-dialog-description"
      // NÃO usar disableEscapeKeyDown
    >
      <DialogTitle id="consent-dialog-title">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 600, flex: 1 }}>
            {CONSENT_LABELS.dialogTitle}
          </Typography>
          <IconButton
            onClick={handleClose}
            aria-label={CONSENT_LABELS.closeButton}
            sx={{ marginTop: '-8px', marginRight: '-8px' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {CONSENT_LABELS.dialogDescription}
        </Typography>
      </DialogTitle>
      
      <DialogContent id="consent-dialog-description" dividers>
        {/* Resumo do termo */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}>
            {CONSENT_TERMS_SUMMARY}
          </Typography>
        </Box>
        
        {/* Painel de finalidades */}
        <ConsentPreferencesPanel
          currentChoices={currentChoices}
          onSave={onSavePreferences}
          isLoading={isLoading}
        />
      </DialogContent>
      
      <DialogActions sx={{ p: 3, gap: 2, flexWrap: 'wrap' }}>
        <Button
          onClick={onRejectNonEssential}
          variant="outlined"
          disabled={isLoading}
          sx={{ minWidth: 140 }}
        >
          {CONSENT_LABELS.rejectNonEssentialButton}
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button
          onClick={onAcceptAll}
          variant="contained"
          color="primary"
          disabled={isLoading}
          sx={{ minWidth: 140 }}
        >
          {CONSENT_LABELS.acceptAllButton}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
```

---

## ✅ CHECKLIST DE ACEITE

### Acessibilidade (WCAG 2.2 AA)
- [ ] Dialog com `role="dialog"` e `aria-modal="true"`
- [ ] `aria-labelledby` referencia heading
- [ ] `aria-describedby` referencia descrição
- [ ] Focus trap funcional (Tab/Shift+Tab)
- [ ] Foco retorna ao elemento original ao fechar
- [ ] ESC fecha dialog (não desabilitado)
- [ ] Botão Fechar visível com `aria-label`
- [ ] Contraste mínimo 4.5:1 (texto normal)
- [ ] Contraste mínimo 3:1 (texto grande ≥18px)
- [ ] Estados de foco visíveis (outline 3px)
- [ ] Navegação apenas por teclado funcional
- [ ] Sem emojis no texto principal OU aria-hidden
- [ ] Checkboxes com labels semânticos
- [ ] Tamanhos de toque ≥44x44px (mobile)

### UX/IHC
- [ ] Granularidade por finalidade (não binário)
- [ ] Essenciais fixos + não essenciais opt-in
- [ ] Botões claros: Aceitar Todos, Apenas Essenciais, Salvar
- [ ] Link para Política de Privacidade
- [ ] "Gerenciar Preferências" no footer global
- [ ] Microcopy sem jargões (linguagem B1/B2)
- [ ] Estados de loading/erro/offline
- [ ] Feedback visual ao salvar
- [ ] Rollback em caso de erro de API

### Privacidade/LGPD
- [ ] Sem dark patterns (schema não força opt-in)
- [ ] IP/metadata não expostos na UI
- [ ] Consentimento livre (ESC funciona)
- [ ] Bases legais corretas por finalidade
- [ ] Versionamento de termo
- [ ] Detecção de mudanças de versão
- [ ] Retirada de consentimento funcional

### Analytics/Mensurabilidade
- [ ] Evento `consent_dialog_shown`
- [ ] Evento `consent_accept_all`
- [ ] Evento `consent_reject_non_essential`
- [ ] Evento `consent_save_preferences`
- [ ] Evento `consent_withdrawn`
- [ ] Evento `consent_dialog_closed`
- [ ] Eventos SEM PII (apenas device_id hash)
- [ ] Payload inclui `consent_version`

### Persistência
- [ ] Dual-write (localStorage + API)
- [ ] Idempotência (salvar múltiplas vezes = mesmo resultado)
- [ ] Hydration do localStorage na inicialização
- [ ] Fallback offline (cache local)
- [ ] Sincronização automática ao reconectar

---

## ⚠️ RISCOS & PRÓXIMOS PASSOS

### Riscos Conhecidos
1. **Mudança de API**: Se backend não suportar granularidade, adaptar para salvar JSON em `metadata`
2. **Performance**: Lista de consentimentos antiga pode crescer → implementar paginação
3. **Migração**: Usuários com escolha binária antiga precisam re-consentir → trigger modal automático

### Próximos Passos Recomendados
1. **Fase 1** (Sprint atual): Implementar infraestrutura (tipos, config, store, analytics)
2. **Fase 2**: ConsentDialog + ConsentPreferencesPanel + testes
3. **Fase 3**: ConsentProvider + integração com sistema existente
4. **Fase 4**: Migração de dados antigos + testes E2E
5. **Fase 5**: Auditoria final WCAG + ajustes de copy

### Comandos para Executar

```bash
# Build e validação
npm run build
npm run lint

# Testes (quando criados)
npm run test -- --coverage

# Acessibilidade (com axe-core)
npm run test:a11y
```

---

## 📚 REFERÊNCIAS

- [WCAG 2.2](https://www.w3.org/WAI/WCAG22/quickref/)
- [LGPD Art. 8º (Consentimento)](http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
- [ARIA Authoring Practices - Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [Material-UI Accessibility](https://mui.com/material-ui/guides/accessibility/)

---

**Autor**: GitHub Copilot (Senior React + TypeScript Engineer)  
**Data**: 2025-11-12  
**Versão**: 1.0.0
