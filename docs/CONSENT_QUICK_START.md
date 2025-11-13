# ⚡ Guia Rápido: Sistema de Consentimento LGPD

**5 minutos para entender e usar o sistema completo**

---

## 🎯 O Que Foi Implementado

Um sistema de **gerenciamento de consentimento LGPD** com:
- ✅ **WCAG 2.2 AA completo** (acessível para todos)
- ✅ **6 finalidades configuráveis** (2 essenciais + 4 opcionais)
- ✅ **Dual-write persistence** (localStorage + API backend)
- ✅ **Zero PII tracking** (analytics privacy-first)
- ✅ **State machine robusto** (loading, first_visit, consented, version_mismatch, saving, error)

---

## 🚀 Como Usar (Para Desenvolvedores)

### 1️⃣ Já Está Funcionando!

O sistema já está integrado em:
- ✅ **main.tsx:** `<ConsentProvider>` wrapeando App
- ✅ **Footer:** Link "Gerenciar Cookies" para reabrir preferências
- ✅ **Admin first login:** Auto-check de consentimento
- ✅ **Cadastro profissional:** Dialog pós-registro

**Você não precisa fazer nada para os fluxos principais!**

---

### 2️⃣ Verificar Se Usuário Consentiu Algo

```typescript
import { useConsent } from '../../consent/hooks/useConsent';

function MyComponent() {
  const { hasConsent } = useConsent();

  if (hasConsent('analytics_usage')) {
    // Usuário consentiu analytics
    initGoogleAnalytics();
  }

  if (hasConsent('marketing_emails')) {
    // Pode enviar emails promocionais
    showNewsletterBanner();
  }

  return <div>Meu componente</div>;
}
```

---

### 3️⃣ Renderizar Conteúdo Condicionalmente

Use `<ConsentGuard>` para mostrar algo apenas se consentido:

```typescript
import { ConsentGuard } from '../../consent/components/ConsentGuard/ConsentGuard';

function AnalyticsPage() {
  return (
    <>
      <h1>Analytics Dashboard</h1>
      
      {/* Google Analytics só carrega se consentido */}
      <ConsentGuard 
        purposeId="analytics_usage"
        fallback={
          <Alert severity="info">
            Habilite Analytics nas preferências para ver este conteúdo.
          </Alert>
        }
      >
        <GoogleAnalytics />
        <MixpanelTracker />
      </ConsentGuard>
    </>
  );
}
```

---

### 4️⃣ Abrir Dialog de Preferências Manualmente

```typescript
import { useConsent } from '../../consent/hooks/useConsent';

function SettingsPage() {
  const { openDialog } = useConsent();

  return (
    <Button onClick={openDialog}>
      ⚙️ Gerenciar Privacidade
    </Button>
  );
}
```

Ou use o componente pronto:

```typescript
import { ConsentManageLink } from '../../consent/components/ConsentManageLink/ConsentManageLink';

function Footer() {
  return (
    <footer>
      <ConsentManageLink />
      {/* Renderiza: "🍪 Gerenciar Cookies" */}
    </footer>
  );
}
```

---

### 5️⃣ Acessar Estado Completo do Consentimento

```typescript
import { useConsent } from '../../consent/hooks/useConsent';

function DebugPanel() {
  const { state, consentChoices, saveConsent } = useConsent();

  console.log('Estado atual:', state); 
  // "loading" | "first_visit" | "consented" | "version_mismatch" | "saving" | "error"

  console.log('Escolhas:', consentChoices);
  // { essential_auth: true, analytics_usage: false, ... }

  // Forçar salvamento manual (use com cuidado)
  const handleSave = async () => {
    await saveConsent({
      essential_auth: true,
      essential_clinical: true,
      functional_preferences: true,
      functional_notifications: false,
      analytics_usage: true,
      marketing_emails: false,
    });
  };

  return (
    <div>
      <p>Estado: {state}</p>
      <Button onClick={handleSave}>Salvar</Button>
    </div>
  );
}
```

---

## 🎨 Personalizar o Sistema

### Adicionar Nova Finalidade

1. **Edite `src/consent/config/consentConfig.ts`:**

```typescript
export const CONSENT_PURPOSES: ConsentPurposeConfig[] = [
  // ... finalidades existentes
  {
    id: 'performance_monitoring',
    label: 'Monitoramento de Performance',
    description: 'Rastreamento de velocidade e erros para melhorar o sistema.',
    required: false,
    legalBasis: 'consent',
    defaultValue: false,
    category: 'functional',
  },
];
```

2. **Atualize o type `ConsentChoice` em `src/consent/types/consent.types.ts`:**

```typescript
export interface ConsentChoice {
  essential_auth: boolean;
  essential_clinical: boolean;
  functional_preferences: boolean;
  functional_notifications: boolean;
  analytics_usage: boolean;
  marketing_emails: boolean;
  performance_monitoring: boolean; // ✨ NOVA
}
```

3. **Use a nova finalidade:**

```typescript
if (hasConsent('performance_monitoring')) {
  initSentry();
}
```

---

### Mudar Versão de Consentimento (Re-consentimento)

Quando a política de privacidade mudar:

1. **Atualize `CONSENT_VERSION` em `consentConfig.ts`:**

```typescript
export const CONSENT_VERSION = '2.0.0'; // Era 1.0.0
```

2. **Sistema automaticamente:**
   - Detecta versão desatualizada
   - Mostra dialog novamente
   - Registra nova versão no backend

---

### Customizar Textos (Microcopy)

Edite `CONSENT_LABELS` em `consentConfig.ts`:

```typescript
export const CONSENT_LABELS = {
  dialogTitle: 'Sua Privacidade Importa! 🔒', // Customizável
  acceptAllButton: 'Aceitar Tudo',
  rejectButton: 'Apenas Essenciais',
  // ...
};
```

---

## 🔧 Troubleshooting

### "ConsentProvider not found" error

❌ **Problema:** Tentando usar `useConsent()` fora do ConsentProvider

✅ **Solução:** Certifique-se que `main.tsx` tem:
```typescript
<ConsentProvider>
  <App />
</ConsentProvider>
```

---

### Dialog não aparece no primeiro acesso

❌ **Problema:** localStorage já tem consentimento salvo

✅ **Solução (Dev):** Limpe localStorage:
```javascript
// DevTools Console
localStorage.removeItem('consent_choices_<user_uuid>');
localStorage.removeItem('consent_version_<user_uuid>');
location.reload();
```

---

### Consentimento não salva no backend

❌ **Problema:** API endpoint incorreto ou erro de rede

✅ **Solução:** Verifique console:
```typescript
// consentStore.ts mostra logs:
console.log('[ConsentStore] Salvando no backend...', userUuid);
```

Verifique se `consentimentoService.createConsentimento()` está funcionando.

---

### Focus trap não funciona

❌ **Problema:** Outros modais conflitando

✅ **Solução:** Use apenas um modal por vez. ConsentDialog já gerencia foco automaticamente com `useFocusTrap()`.

---

## 📊 Analytics Events

O sistema rastreia automaticamente (zero PII):

```typescript
// Evento automático quando dialog abre
ConsentAnalytics.trackDialogShown('first_visit');

// Evento quando usuário clica "Aceitar Tudo"
ConsentAnalytics.trackAcceptAll('1.0.0');

// Evento quando salva preferências customizadas
ConsentAnalytics.trackSavePreferences('1.0.0', ['essential_auth', 'analytics_usage']);
```

**Integração com GA4:**
```typescript
// src/consent/analytics/consentAnalytics.ts
private static sendToProvider(event: ConsentEvent): void {
  if (window.gtag) {
    window.gtag('event', event.event, {
      consent_version: event.consent_version,
      event_category: 'consent',
      ...event.metadata,
    });
  }
}
```

---

## ♿ Atalhos de Teclado (Acessibilidade)

No ConsentDialog:
- **Tab/Shift+Tab:** Navegar entre botões
- **Enter/Space:** Ativar botão focado
- **ESC:** Fechar dialog (se não `required`)
- **Setas ↑↓:** Navegar toggles no painel de preferências

Screen readers anunciam:
- Título do dialog
- Quantidade de preferências
- Estado de cada toggle (ligado/desligado)
- Botões de ação

---

## 🎓 Documentação Completa

- **Auditoria & Redesign:** `docs/CONSENT_AUDIT_AND_REDESIGN.md`
- **Guia de Integração:** `docs/CONSENT_INTEGRATION_GUIDE.md`
- **Resumo de Implementação:** `docs/CONSENT_IMPLEMENTATION_SUMMARY.md`
- **Sumário de Deploy:** `docs/CONSENT_DEPLOYMENT_SUMMARY.md`
- **Storybook:** `npm run storybook` (componentes interativos)

---

## 🆘 Precisa de Ajuda?

1. **Leia FAQ:** `docs/CONSENT_INTEGRATION_GUIDE.md` (seção 7)
2. **Veja exemplos:** Storybook stories em `src/consent/components/*/*.stories.tsx`
3. **Debug mode:** 
   ```typescript
   // main.tsx
   const queryClient = new QueryClient({
     logger: {
       log: console.log,
       warn: console.warn,
       error: console.error,
     }
   });
   ```

4. **Issues:** GitHub com label `consent-system`

---

**🎉 Pronto! Agora você sabe tudo que precisa.**

**Casos de uso mais comuns:**
1. ✅ Verificar consentimento: `hasConsent('analytics_usage')`
2. ✅ Renderizar condicionalmente: `<ConsentGuard purposeId="...">`
3. ✅ Abrir preferências: `<ConsentManageLink />`
4. ✅ Adicionar finalidade: Editar `consentConfig.ts` + types

**Tudo mais acontece automaticamente! 🚀**
