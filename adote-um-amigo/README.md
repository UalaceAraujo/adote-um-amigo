# 🐾 Adote um Amigo - Plataforma Web de Adoção de Animais

Uma plataforma web moderna, responsiva e completa voltada para a promoção da adoção responsável de cães e gatos resgatados.

---

## 🚀 Como Abrir e Executar no VS Code

O projeto foi construído com tecnologias web nativas (**HTML5, CSS3 moderno e JavaScript ES6+**), o que significa que ele **não requer Node.js, compilação ou instalação de dependências** para funcionar imediatamente.

### Passo a passo:

1. **Extraia o arquivo ZIP** em uma pasta de sua preferência no seu computador.
2. Abra o **Visual Studio Code**.
3. No VS Code, vá no menu **File > Open Folder...** (ou `Arquivo > Abrir Pasta...`) e selecione a pasta descompactada `adote-um-amigo`.
4. **Para executar e testar o site:**
   - **Opção 1 (Recomendada - Live Server):**
     1. Instale a extensão **Live Server** (de *Ritwick Dey*) no VS Code (aba de Extensões: `Ctrl + Shift + X`).
     2. Clique com o botão direito no arquivo `index.html` e selecione **"Open with Live Server"**.
     3. O site abrirá automaticamente no seu navegador com hot-reload a cada alteração salva.
   - **Opção 2 (Direto no Navegador):**
     - Dê um duplo clique diretamente no arquivo `index.html` ou arraste-o para uma aba do Google Chrome / Edge / Firefox.

---

## 📁 Estrutura de Pastas do Projeto

```
adote-um-amigo/
│
├── index.html          # Estrutura principal da página, cabeçalho, hero, modais e catálogo
├── css/
│   └── style.css       # Design system, variáveis CSS, layout responsivo e animações
├── js/
│   ├── data.js         # Base de dados inicial mockada com cães e gatos reais
│   └── app.js          # Lógica da aplicação: busca em tempo real, filtros, modais, LocalStorage e WhatsApp
├── assets/             # Pasta reservada para ícones, logos e fotos locais adicionais
└── README.md           # Guia de instruções e documentação
```

---

## ✨ Recursos Implementados

1. **Catálogo Dinâmico & Responsivo:**
   - Grid com cards de pets exibindo foto, espécie, idade, porte, sexo, localidade e status de saúde (vacinado, castrado, vermifugado).
2. **Sistema de Busca e Filtros Reativos:**
   - Busca em tempo real por nome, raça, descrição ou cidade.
   - Filtros combináveis por **Espécie** (Cachorro/Gato), **Porte** (Pequeno/Médio/Grande) e **Sexo** (Macho/Fêmea).
   - Contador dinâmico de resultados e chips de filtros ativos com botão de limpar.
3. **Modal de Detalhes Completos:**
   - Visualização da história do animal, nível de energia, temperamento e cuidados veterinários.
4. **Fluxo de Adoção Integrado ao WhatsApp:**
   - Ao clicar em *"Quero Adotar"*, o usuário preenche uma rápida ficha de intenção (moradia, se possui outros pets, etc.).
   - O sistema gera automaticamente uma mensagem personalizada pré-formatada e abre uma conversa direta com o protetor responsável no WhatsApp via API `wa.me`.
5. **Cadastro de Novos Pets (Persistência no Navegador):**
   - Formulário completo para cadastrar novos animais resgatados.
   - Salva os dados no `localStorage` do navegador, atualizando a listagem e os contadores instantaneamente sem perder as informações ao recarregar a página.
6. **Interface Acessível e Mobile-First:**
   - Menu hambúrguer adaptado para smartphones e tablets.
   - Feedback visual através de notificações estilo *Toast*.

---

## 🛠️ Personalização e Extensões Futuras

- **Alterar o WhatsApp Padrão:**
  - No arquivo `js/data.js` e em `js/app.js`, você pode alterar o número de telefone de contato (atualmente configurado com placeholder DDD 16).
- **Conectar a um Banco de Dados Real:**
  - A lógica em `js/app.js` foi modularizada. Você pode facilmente substituir o `loadPets()` e `savePetsToStorage()` por chamadas `fetch()` para uma API em Node.js, Python (FastAPI/Flask) ou Supabase/Firebase.
