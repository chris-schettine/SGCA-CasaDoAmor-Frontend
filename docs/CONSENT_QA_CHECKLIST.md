# ✅ Checklist de QA: Sistema de Consentimento LGPD

**Para testers, QA engineers e stakeholders**

---

## 🎯 Objetivo

Validar que o sistema de consentimento LGPD está funcionando corretamente em **todos os cenários** antes do deploy para produção.

---

## 📋 Checklist de Testes Funcionais

### 🔹 Fluxo 1: Primeiro Acesso (Admin)

**Cenário:** Admin faz login pela primeira vez

- [ ] 1.1 - Login com admin (ADMINISTRADOR)
- [ ] 1.2 - Dialog de consentimento aparece automaticamente
- [ ] 1.3 - Título correto: "Sua Privacidade Importa"
- [ ] 1.4 - 6 finalidades listadas (2 essenciais bloqueadas + 4 opcionais)
- [ ] 1.5 - Botão "Aceitar Tudo" funciona e fecha dialog
- [ ] 1.6 - Após fechar, não reabre na mesma sessão (sessionStorage)
- [ ] 1.7 - Fazer logout e login novamente → Dialog NÃO aparece (já consentiu)
- [ ] 1.8 - Verificar localStorage: `consent_choices_<uuid>` existe
- [ ] 1.9 - Verificar backend: Consentimento registrado na API

**Resultado Esperado:** ✅ Admin consente uma vez, não é perturbado novamente

---

### 🔹 Fluxo 2: Cadastro de Profissional

**Cenário:** Criar novo usuário profissional

- [ ] 2.1 - Acessar `/users/register`
- [ ] 2.2 - Preencher formulário completo
- [ ] 2.3 - Clicar "Cadastrar"
- [ ] 2.4 - Alert verde: "Cadastro Concluído com Sucesso!"
- [ ] 2.5 - Dialog de consentimento aparece sobreposto
- [ ] 2.6 - Botão "Aceitar Tudo" salva e navega para `/users`
- [ ] 2.7 - Toast: "Profissional cadastrado com sucesso!"
- [ ] 2.8 - Verificar backend: Consentimento do novo UUID criado

**Resultado Esperado:** ✅ Consentimento coletado imediatamente após cadastro

---

### 🔹 Fluxo 3: Reabrir Preferências (Footer)

**Cenário:** Usuário quer mudar consentimentos

- [ ] 3.1 - Navegar para qualquer página
- [ ] 3.2 - Rolar até o footer
- [ ] 3.3 - Clicar "🍪 Gerenciar Cookies"
- [ ] 3.4 - Dialog abre com preferências atuais carregadas
- [ ] 3.5 - Mudar toggles (ex: desligar "Analytics")
- [ ] 3.6 - Clicar "Salvar Preferências"
- [ ] 3.7 - Dialog fecha
- [ ] 3.8 - Toast: "Preferências salvas com sucesso!"
- [ ] 3.9 - Verificar localStorage: Mudanças persistidas
- [ ] 3.10 - Reabrir dialog → Mudanças mantidas

**Resultado Esperado:** ✅ Usuário pode modificar consentimentos a qualquer momento

---

### 🔹 Fluxo 4: "Apenas Essenciais"

**Cenário:** Usuário rejeita tudo menos essenciais

- [ ] 4.1 - Limpar localStorage (DevTools)
- [ ] 4.2 - Fazer login como admin
- [ ] 4.3 - Dialog aparece
- [ ] 4.4 - Clicar "Apenas Essenciais"
- [ ] 4.5 - Dialog fecha
- [ ] 4.6 - Verificar localStorage: Apenas `essential_*: true`, resto `false`
- [ ] 4.7 - Reabrir via footer → Toggles opcionais desligados
- [ ] 4.8 - Componentes com `<ConsentGuard purposeId="analytics_usage">` NÃO renderizam

**Resultado Esperado:** ✅ Usuário pode rejeitar finalidades não essenciais

---

### 🔹 Fluxo 5: Personalizar Preferências

**Cenário:** Usuário escolhe manualmente cada finalidade

- [ ] 5.1 - Dialog aberto
- [ ] 5.2 - Clicar "Personalizar Preferências"
- [ ] 5.3 - Painel de preferências expande
- [ ] 5.4 - Alternar toggles individuais (ex: ON analytics, OFF marketing)
- [ ] 5.5 - Finais essenciais permanecem travadas (desabilitadas)
- [ ] 5.6 - Clicar "Salvar Preferências"
- [ ] 5.7 - Dialog fecha
- [ ] 5.8 - Verificar localStorage: Escolhas customizadas salvas
- [ ] 5.9 - Backend: Endpoint recebeu POST com choices corretas

**Resultado Esperado:** ✅ Granularidade total, usuário controla tudo

---

### 🔹 Fluxo 6: Versionamento (Re-consentimento)

**Cenário:** Política de privacidade mudou, nova versão requer consentimento

- [ ] 6.1 - Usuário já consentiu (versão 1.0.0)
- [ ] 6.2 - Desenvolvedor muda `CONSENT_VERSION = '2.0.0'`
- [ ] 6.3 - Deploy
- [ ] 6.4 - Usuário faz login
- [ ] 6.5 - Dialog aparece novamente (version mismatch)
- [ ] 6.6 - Mensagem: "Nossa política foi atualizada"
- [ ] 6.7 - Usuário precisa consentir novamente
- [ ] 6.8 - Após salvar, localStorage: `consent_version_<uuid> = "2.0.0"`

**Resultado Esperado:** ✅ Sistema força re-consentimento em mudanças de política

---

## ♿ Checklist de Acessibilidade (WCAG 2.2 AA)

### 🎹 Navegação por Teclado

- [ ] A1 - Tab navega entre botões (Aceitar/Rejeitar/Personalizar)
- [ ] A2 - Shift+Tab navega de volta
- [ ] A3 - Enter/Space ativam botão focado
- [ ] A4 - ESC fecha dialog (se não obrigatório)
- [ ] A5 - ESC NÃO fecha dialog obrigatório (admin first login)
- [ ] A6 - Foco retorna ao elemento que abriu dialog ao fechar
- [ ] A7 - No painel de preferências, Tab navega toggles
- [ ] A8 - Space alterna toggle (liga/desliga)
- [ ] A9 - Foco fica preso dentro do dialog (não escapa)
- [ ] A10 - Outline azul 2px visível em todos elementos focados

**Teste com:** Apenas teclado, sem mouse

---

### 🔊 Screen Readers

**Teste com:** NVDA (Windows), JAWS (Windows), VoiceOver (macOS)

- [ ] SR1 - Dialog anunciado: "Dialog, Sua Privacidade Importa"
- [ ] SR2 - Finalidades lidas: "Autenticação e Segurança, obrigatório"
- [ ] SR3 - Toggles anunciados: "Analytics Anônimo, switch, desligado"
- [ ] SR4 - Botões anunciados: "Aceitar Tudo, botão"
- [ ] SR5 - Expandir preferências: "Personalizar Preferências, botão expandido/recolhido"
- [ ] SR6 - Alertas lidas: "Preferências salvas com sucesso"
- [ ] SR7 - Descrições legais completas (não truncadas)

---

### 🎨 Contraste Visual (WCAG 1.4.3)

**Ferramenta:** [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

- [ ] C1 - Texto preto em fundo branco: ≥ 4.5:1 ✅
- [ ] C2 - Botão primário azul (#0D2E4D) em texto branco: ≥ 4.5:1 ✅
- [ ] C3 - Botão secundário cinza em texto: ≥ 3:1 ✅
- [ ] C4 - Outline de foco azul (#65ACD6) em fundo: ≥ 3:1 ✅
- [ ] C5 - Links/texto secundário: ≥ 4.5:1 ✅

---

### 📱 Touch Targets (WCAG 2.5.5)

**Ferramenta:** DevTools → Measure ou régua física

- [ ] T1 - Botões: ≥ 44×44px ✅
- [ ] T2 - Toggles: ≥ 44×44px ✅
- [ ] T3 - Links no footer: ≥ 44×44px ✅
- [ ] T4 - Espaçamento entre botões: ≥ 8px ✅

---

### 🏷️ ARIA Semântica (WCAG 4.1.2)

**Ferramenta:** DevTools → Accessibility Tree

- [ ] ARIA1 - Dialog tem `role="dialog"`
- [ ] ARIA2 - Dialog tem `aria-modal="true"`
- [ ] ARIA3 - Dialog tem `aria-labelledby` apontando para título
- [ ] ARIA4 - Painel expansível tem `aria-expanded="true/false"`
- [ ] ARIA5 - Toggles têm `role="switch"` e `aria-checked`
- [ ] ARIA6 - Botões desabilitados têm `aria-disabled="true"`
- [ ] ARIA7 - Loading states têm `aria-busy="true"`

---

## 🔒 Checklist de Conformidade LGPD

### Artigo 7º - Bases Legais

- [ ] LGPD1 - Essenciais usam bases: `contract_execution` ou `legal_obligation`
- [ ] LGPD2 - Opcionais usam base: `consent` ou `legitimate_interest`
- [ ] LGPD3 - Cada finalidade tem base legal declarada em `consentConfig.ts`

---

### Artigo 8º - Consentimento Válido

- [ ] LGPD4 - **Livre:** Não bloqueia serviço se rejeitar opcionais ✅
- [ ] LGPD5 - **Informado:** Descrições claras de cada finalidade ✅
- [ ] LGPD6 - **Inequívoco:** Ação afirmativa (clique em botão) ✅
- [ ] LGPD7 - **Específico:** Granularidade por finalidade (6 toggles) ✅
- [ ] LGPD8 - **Destacado:** Essenciais vs opcionais separados ✅

---

### Artigo 9º - Direitos do Titular

- [ ] LGPD9 - **Acesso:** Usuário pode ver consentimentos (via dialog)
- [ ] LGPD10 - **Retificação:** Pode modificar preferências (footer link)
- [ ] LGPD11 - **Revogação:** Pode desligar opcionais a qualquer momento
- [ ] LGPD12 - **Portabilidade:** Consentimentos salvos em formato JSON (backend)

---

## 📊 Checklist de Analytics & Privacidade

- [ ] AN1 - Analytics só roda se `hasConsent('analytics_usage') === true`
- [ ] AN2 - Eventos rastreados não contêm PII (nome, email, CPF)
- [ ] AN3 - Apenas metadata: `{ event, consent_version, timestamp }`
- [ ] AN4 - `ConsentGuard` bloqueia scripts sem consentimento
- [ ] AN5 - Cookies de marketing só setam se `marketing_emails === true`

---

## 🚀 Checklist de Performance

- [ ] P1 - Bundle size: ConsentDialog < 5 kB gzipped ✅
- [ ] P2 - First Paint não impactado (lazy loaded)
- [ ] P3 - LocalStorage read/write < 10ms
- [ ] P4 - API POST `/consentimentos` < 500ms
- [ ] P5 - Dialog abre em < 100ms (60fps)

---

## 🐛 Checklist de Edge Cases

### Erros de Rede

- [ ] E1 - API down → Salva em localStorage, exibe warning
- [ ] E2 - Retry automático em 5s se falhar
- [ ] E3 - Não bloqueia UX se backend cair

---

### Múltiplos Dispositivos

- [ ] E4 - Consentimento em desktop → Sincroniza no mobile (via API)
- [ ] E5 - Mudar preferências no tablet → Atualiza no desktop

---

### Dados Corrompidos

- [ ] E6 - localStorage inválido → Reseta para defaults
- [ ] E7 - Versão futura (3.0.0) no localStorage → Ignora, pede novo

---

### Concorrência

- [ ] E8 - Abrir 2 tabs → Ambas sincronizam via storage events
- [ ] E9 - Salvar simultaneamente em 2 tabs → Última escrita vence

---

## 📱 Checklist de Responsividade

**Testar em:**
- [ ] 📱 Mobile (375×667px - iPhone SE)
- [ ] 📱 Tablet (768×1024px - iPad)
- [ ] 💻 Desktop (1920×1080px)

### Mobile
- [ ] R1 - Dialog ocupa 90% da tela
- [ ] R2 - Botões stacked verticalmente
- [ ] R3 - Texto legível sem zoom
- [ ] R4 - Touch targets ≥ 44px
- [ ] R5 - Scrollable se conteúdo grande

### Tablet
- [ ] R6 - Dialog centralizado, max-width 600px
- [ ] R7 - Botões inline se cabe

### Desktop
- [ ] R8 - Dialog max-width 700px
- [ ] R9 - Hover states funcionam
- [ ] R10 - Keyboard focus visível

---

## 🌐 Checklist de Compatibilidade de Browsers

**Testar em:**
- [ ] ✅ Chrome 120+ (Windows/Mac)
- [ ] ✅ Firefox 120+ (Windows/Mac)
- [ ] ✅ Safari 17+ (Mac/iOS)
- [ ] ✅ Edge 120+ (Windows)

### Funcionalidades Críticas
- [ ] B1 - Dialog renderiza corretamente
- [ ] B2 - LocalStorage funciona
- [ ] B3 - ARIA anunciado em screen readers
- [ ] B4 - CSS Grid/Flexbox sem quebras
- [ ] B5 - Animations suaves (60fps)

---

## ✅ Aprovação Final

### Pré-Deploy Checklist

- [ ] ✅ Todos os testes funcionais passaram
- [ ] ✅ Acessibilidade WCAG 2.2 AA validada
- [ ] ✅ Conformidade LGPD verificada
- [ ] ✅ Performance aceitável (< 5 kB, < 100ms)
- [ ] ✅ Edge cases cobertos
- [ ] ✅ Responsividade testada em 3 dispositivos
- [ ] ✅ Cross-browser testado em 4 navegadores
- [ ] ✅ Analytics rastreando sem PII
- [ ] ✅ Backend API funcionando (POST/GET)
- [ ] ✅ Documentação completa (4 arquivos MD)

---

### Assinaturas de Aprovação

| Papel | Nome | Data | Assinatura |
|---|---|---|---|
| **QA Lead** | _______________ | ____/____/____ | _______________ |
| **Tech Lead** | _______________ | ____/____/____ | _______________ |
| **UX Designer** | _______________ | ____/____/____ | _______________ |
| **Legal/DPO** | _______________ | ____/____/____ | _______________ |

---

## 🆘 Bugs Encontrados?

**Reporte em:** GitHub Issues com template:

```markdown
**Título:** [CONSENT] Descrição curta do bug

**Reproduzir:**
1. Passo 1
2. Passo 2
3. Resultado incorreto

**Esperado:** Resultado correto

**Screenshots:** [anexar]

**Ambiente:**
- Browser: Chrome 120
- OS: macOS 14
- Viewport: 1920x1080

**Logs do Console:** [colar erros]
```

---

**🎉 Checklist completo! Pronto para deploy seguro.**

**Itens obrigatórios antes de aprovar:**
1. ✅ Todos os testes funcionais (Fluxos 1-6)
2. ✅ Navegação por teclado (A1-A10)
3. ✅ Contraste visual (C1-C5)
4. ✅ ARIA semântica (ARIA1-7)
5. ✅ Conformidade LGPD (LGPD1-12)

**Tudo passou? Deploy aprovado! 🚀**
