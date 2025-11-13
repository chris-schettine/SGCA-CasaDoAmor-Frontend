# Guia de Integração - Sistema de Consentimento LGPD

## 🚀 Setup Inicial

### 1. Envolver a aplicação com ConsentProvider

No arquivo `src/main.tsx` ou onde você renderiza o componente raiz:

```tsx
import { ConsentProvider } from './consent';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <ConsentProvider>
              <App />
            </ConsentProvider>
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>
);
```

**Importante**: O `ConsentProvider` deve estar **dentro** do `AuthProvider` para ter acesso ao usuário autenticado.

---

## 📝 Cenários de Uso

### Cenário 1: Link "Gerenciar Preferências" no Footer

Adicione ao componente `Layout` ou `Footer`:

```tsx
import { ConsentManageLink } from '@/consent/components';

export function Footer() {
  return (
    <Box component="footer" sx={{ py: 3, borderTop: '1px solid', borderColor: 'divider' }}>
      <Container maxWidth="lg">
        <Stack direction="row" spacing={3} justifyContent="center">
          <Link href="/sobre">Sobre</Link>
          <Link href="/contato">Contato</Link>
          <Link href="/politica-privacidade">Privacidade</Link>
          
          {/* Link de consentimento */}
          <ConsentManageLink sx={{ color: 'text.secondary' }}>
            Gerenciar Cookies
          </ConsentManageLink>
        </Stack>
      </Container>
    </Box>
  );
}
```

---

### Cenário 2: Verificar Consentimento Antes de Ativar Feature

Use o hook `useConsent()` para conditional rendering:

```tsx
import { useConsent } from '@/consent/hooks';
import { useEffect } from 'react';

export function HomePage() {
  const { hasConsent } = useConsent();
  
  useEffect(() => {
    // Só ativa Google Analytics se usuário consentiu
    if (hasConsent('analytics_usage')) {
      // Inicializar GA
      window.gtag('config', 'UA-XXXXX');
    }
  }, [hasConsent]);
  
  return (
    <div>
      <h1>Bem-vindo!</h1>
      
      {/* Mostrar feature só se consentiu */}
      {hasConsent('marketing_emails') && (
        <NewsletterBanner />
      )}
    </div>
  );
}
```

---

### Cenário 3: Guard Componente (Render Condicional)

Use `ConsentGuard` para envolver componentes que precisam de consentimento:

```tsx
import { ConsentGuard } from '@/consent/components';

export function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      
      {/* Analytics widgets só aparecem se consentido */}
      <ConsentGuard
        purposeId="analytics_usage"
        fallback={
          <Alert severity="info">
            Ative Analytics nas preferências para ver estatísticas
          </Alert>
        }
      >
        <AnalyticsWidget />
        <UserBehaviorChart />
      </ConsentGuard>
      
      {/* Chat widget de marketing */}
      <ConsentGuard purposeId="marketing_emails">
        <IntercomChatWidget />
      </ConsentGuard>
    </div>
  );
}
```

---

### Cenário 4: Abrir Dialog Programaticamente

Use `openDialog()` para abrir o modal de qualquer lugar:

```tsx
import { useConsent } from '@/consent/hooks';
import { Button } from '@mui/material';

export function SettingsPage() {
  const { openDialog } = useConsent();
  
  return (
    <div>
      <h2>Configurações de Privacidade</h2>
      
      <Button 
        variant="outlined"
        onClick={openDialog}
        startIcon={<PrivacyIcon />}
      >
        Gerenciar Consentimento LGPD
      </Button>
    </div>
  );
}
```

---

### Cenário 5: Exibir Estado Atual do Consentimento

Mostre as escolhas atuais do usuário:

```tsx
import { useConsent } from '@/consent/hooks';
import { CONSENT_PURPOSES } from '@/consent/config/consentConfig';
import { Chip, Stack } from '@mui/material';

export function PrivacyDashboard() {
  const { choices, openDialog } = useConsent();
  
  return (
    <div>
      <h2>Suas Preferências de Privacidade</h2>
      
      <Stack spacing={2}>
        {CONSENT_PURPOSES.map((purpose) => (
          <Box key={purpose.id} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography sx={{ flex: 1 }}>{purpose.label}</Typography>
            <Chip
              label={choices[purpose.id] ? 'Ativo' : 'Inativo'}
              color={choices[purpose.id] ? 'success' : 'default'}
              size="small"
            />
          </Box>
        ))}
      </Stack>
      
      <Button onClick={openDialog} sx={{ mt: 3 }}>
        Alterar Preferências
      </Button>
    </div>
  );
}
```

---

### Cenário 6: Retirar Consentimento (LGPD Art. 8º § 5º)

Permita que o usuário retire todo o consentimento:

```tsx
import { useConsent } from '@/consent/hooks';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useState } from 'react';

export function DeleteAccountPage() {
  const { withdrawConsent } = useConsent();
  const [open, setOpen] = useState(false);
  
  const handleWithdraw = async () => {
    await withdrawConsent();
    setOpen(false);
    // Mostrar toast de sucesso
  };
  
  return (
    <div>
      <h2>Excluir Conta</h2>
      
      <Button
        variant="outlined"
        color="error"
        onClick={() => setOpen(true)}
      >
        Retirar Todos os Consentimentos
      </Button>
      
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Retirar Consentimento?</DialogTitle>
        <DialogContent>
          Isso desativará todas as finalidades não essenciais.
          Você pode reverter a qualquer momento.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleWithdraw} color="error">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
```

---

## 🔧 Integração com Google Tag Manager (GTM)

Se usar GTM, o sistema já envia eventos automaticamente para `window.dataLayer`:

```tsx
// Nenhuma configuração necessária!
// Eventos são enviados automaticamente:

// - consent_dialog_shown
// - consent_accept_all
// - consent_reject_non_essential
// - consent_save_preferences
// - consent_withdrawn

// Acesse no GTM:
// Data Layer Variable > dataLayer.event
```

Para **bloquear tags** que precisam de consentimento:

1. No GTM, vá em **Triggers**
2. Crie trigger customizado:
   - **Event Name**: `consent_accept_all` OU `consent_save_preferences`
   - **Condition**: dataLayer.purposes_accepted contains "analytics_usage"
3. Associe tags de analytics a esse trigger

---

## 📊 Verificar Estado no DevTools

Durante desenvolvimento:

```js
// Console do navegador
localStorage.getItem('casa-amor-lgpd-consent')

// Output:
// {"version":"1.0.0","choices":{"essential_auth":true,...},"timestamp":"2025-11-12T..."}
```

---

## ⚠️ Checklist Pré-Deploy

Antes de fazer deploy em produção:

- [ ] `ConsentProvider` está dentro do `AuthProvider`
- [ ] Link "Gerenciar Preferências" visível no footer
- [ ] Página `/politica-privacidade` existe e está acessível
- [ ] Analytics só ativa se `hasConsent('analytics_usage') === true`
- [ ] Scripts de terceiros (Hotjar, Intercom, etc.) protegidos com `<ConsentGuard>`
- [ ] Testar fluxo completo:
  - [ ] Primeira visita → Dialog abre automaticamente
  - [ ] Aceitar Todos → Salva e fecha
  - [ ] Reabrir dialog → Preferências carregam corretamente
  - [ ] ESC fecha dialog (se não obrigatório)
  - [ ] Tab/Shift+Tab funciona (focus trap)

---

## 🐛 Troubleshooting

### Dialog não abre na primeira visita

**Causa**: `ConsentProvider` está fora do `AuthProvider`  
**Solução**: Mover `ConsentProvider` para dentro

```tsx
// ❌ Errado
<ConsentProvider>
  <AuthProvider>
    <App />
  </AuthProvider>
</ConsentProvider>

// ✅ Correto
<AuthProvider>
  <ConsentProvider>
    <App />
  </ConsentProvider>
</AuthProvider>
```

### `useConsent()` lança erro "must be used within ConsentProvider"

**Causa**: Componente está fora da árvore do `ConsentProvider`  
**Solução**: Verificar hierarquia de componentes

### Consentimento não persiste após reload

**Causa**: localStorage bloqueado ou navegação privada  
**Solução**: Sistema funciona normalmente, mas pede re-consentimento a cada sessão

### Analytics não inicializa mesmo com consentimento

**Causa**: Verificação de `hasConsent()` acontece antes da hydration  
**Solução**: Usar `useEffect` com dependência em `hasConsent`:

```tsx
useEffect(() => {
  if (hasConsent('analytics_usage')) {
    initAnalytics();
  }
}, [hasConsent]); // ← Dependência crucial
```

---

## 📚 Referências

- [Documentação completa](./CONSENT_AUDIT_AND_REDESIGN.md)
- [Resumo de implementação](./CONSENT_IMPLEMENTATION_SUMMARY.md)
- [WCAG 2.2 AA](https://www.w3.org/WAI/WCAG22/quickref/)
- [LGPD Art. 8º](http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
