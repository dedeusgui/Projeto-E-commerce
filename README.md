# 🎮 Orion Game Pass  

## 📋 Índice  
- [Sobre o Projeto](#-sobre-o-projeto)  
- [Escopo](#-escopo)  
- [Justificativa](#-justificativa)  
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)  
- [APIs Integradas](#-apis-integradas)  
- [Funcionalidades](#-funcionalidades)  
- [Estrutura do Projeto](#-estrutura-do-projeto)  
- [Como Executar](#️-como-executar)  
- [Planos de Assinatura](#-planos-de-assinatura)  
- [Sistema de Filtros](#-sistema-de-filtros)  
- [Contribuição](#-contribuição)  

---

## 🎯 Sobre o Projeto  
O **Orion Game Pass** é uma plataforma web moderna que simula um serviço de assinatura de jogos, similar ao Xbox Game Pass ou PlayStation Plus.  
A plataforma oferece aos usuários acesso ilimitado a um catálogo extenso de jogos através de diferentes planos de assinatura, com uma interface futurista e intuitiva.  

---

## 🎪 Escopo  

### Funcionalidades Principais  
- **Catálogo Dinâmico:** Navegação por milhares de jogos organizados por categorias  
- **Sistema de Busca Avançada:** Pesquisa inteligente com filtros de qualidade  
- **Planos de Assinatura:** Três modalidades (Mensal, Trimestral, Anual)  
- **Interface Responsiva:** Design adaptável para desktop e mobile  
- **Filtros de Qualidade:** Sistema que prioriza jogos bem avaliados  
- **Visualizações Múltiplas:** Modo grade e lista para o catálogo  
- **Detalhes dos Jogos:** Informações completas com ratings e metacritic  
- **Sistema de Pagamento:** Simulação de pagamento via PIX e cartão  

### Páginas do Sistema  
- **Homepage (index.html):** Apresentação principal com jogos em destaque  
- **Catálogo (catalogo.html):** Listagem completa dos jogos com filtros  
- **Assinatura (assinatura.html):** Comparação de planos e FAQ  
- **Pagamento (pagamento.html):** Sistema de checkout (simulado)  

---

## 💡 Justificativa  

### Problema Identificado  
O mercado de jogos digitais cresceu exponencialmente, mas muitas plataformas apresentam:  
- Interfaces desatualizadas e pouco atrativas  
- Sistemas de busca ineficientes  
- Falta de curadoria de qualidade  
- Experiência do usuário fragmentada  

### Solução Proposta  
O **Orion Game Pass** resolve esses problemas através de:  
- **Design Futurista:** Interface moderna com tema cyberpunk/neon  
- **Curadoria Inteligente:** Filtros automáticos que priorizam jogos de qualidade  
- **UX Otimizada:** Navegação intuitiva com feedback visual  
- **Performance:** Carregamento otimizado com scroll infinito  
- **Acessibilidade:** Design responsivo para todos os dispositivos  

---

## 🚀 Tecnologias Utilizadas  

### Frontend  
- **HTML5**: Estruturação semântica das páginas  
- **CSS3**: Estilização avançada com:  
  - Variáveis CSS customizadas  
  - Gradientes e animações complexas  
  - Flexbox e Grid Layout  
  - Media queries para responsividade  

- **JavaScript (ES6+):**  
  - Fetch API para requisições  
  - Async/Await para programação assíncrona  
  - DOM manipulation avançada  
  - Event handling otimizado  

### Frameworks e Bibliotecas  
- **Bootstrap 5.3.0** – Framework CSS para componentes e grid  
- **Font Awesome 6.4.0** – Biblioteca de ícones  
- **Google Fonts (Orbitron)** – Tipografia futurista  

### Fontes Externas  
- CDN Jsdelivr: Bootstrap CSS/JS  
- CDN Cloudflare: Font Awesome  
- Google Fonts: Fonte Orbitron  

---

## 🔌 APIs Integradas  

### RAWG Video Games Database API  
- **URL Base:** https://api.rawg.io/api/  
- **Versão:** v1.0  

#### Funcionalidades Utilizadas  
- **GET /games:** Listagem de jogos com paginação  
- **GET /games/{id}:** Detalhes específicos de jogos  

#### Parâmetros de Filtro  
- `search`: Busca por nome do jogo  
- `genres`: Filtro por gênero  
- `platforms`: Filtro por plataforma  
- `ordering`: Ordenação (rating, metacritic, data)  
- `dates`: Período de lançamento  
- `metacritic`: Pontuação Metacritic  
- `rating`: Avaliação dos usuários  

#### Parâmetros de Qualidade Implementados  
```js
const QUALITY_FILTERS = {
  MIN_METACRITIC: 60,     // Pontuação mínima Metacritic
  MIN_RATING: 3.5,        // Rating mínimo (1-5)
  MIN_RATINGS_COUNT: 100, // Mínimo de avaliações
  EXCLUDE_MOBILE: true,   // Exclui jogos mobile
  MIN_YEAR: 2010          // Jogos dos últimos 15 anos
};
```

---

## ⭐ Funcionalidades  

### 1. Sistema de Catálogo Inteligente  
- **Scroll Infinito:** Carregamento automático de mais jogos  
- **Filtros por Categoria:** Action, RPG, Strategy, Adventure, etc.  
- **Busca Avançada:** Pesquisa por nome com filtros de qualidade  
- **Visualizações:** Modo grade e lista  
- **Cache Inteligente:** Otimização de requisições à API  

### 2. Curadoria de Qualidade  
- **Filtros Automáticos:** Remove jogos de baixa qualidade  
- **Sistema de Badges:** Indicadores visuais de qualidade  
- **Ordenação Inteligente:** Prioriza jogos bem avaliados  
- **Metacritic Integration:** Pontuações oficiais da crítica  

### 3. Interface Futurista  
- **Tema Cyberpunk:** Cores neon (magenta/cyan) em fundo escuro  
- **Animações Fluidas:** Transições suaves e efeitos visuais  
- **Partículas de Fundo:** Efeitos visuais dinâmicos  
- **Tipografia Futurística:** Fonte Orbitron em todo o sistema  

### 4. Sistema de Assinatura  
Três planos disponíveis:  
- **Mensal:** R$ 29/mês  
- **Trimestral:** R$ 78/3 meses (economia de 10%)  
- **Anual:** R$ 279/ano (economia de 20%)  

---

## 📁 Estrutura do Projeto  

```
orion-game-pass/
├── index.html           # Página principal
├── catalogo.html        # Catálogo de jogos
├── assinatura.html      # Página de planos
├── pagamento.html       # Página de checkout
├── style.css            # Estilos principais
├── script.js            # Lógica JavaScript
├── img/
│   └── logo.png         # Logo do projeto
└── README.md            # Documentação
```

### Arquitetura JavaScript  

```js
// Principais funções do sistema
buildQualityFilteredURL()    // Constrói URLs com filtros
filterGamesByQuality()       // Filtra jogos no cliente
fetchAndDisplayGames()       // Busca e exibe jogos
createGameCard()             // Cria cards de jogos
loadCategoryGames()          // Carrega por categoria
showGameDetails()            // Modal de detalhes
handleURLParameters()        // Gerencia parâmetros da URL
```

---

## 🖥️ Como Executar  

### Pré-requisitos  
- Navegador web moderno (Chrome, Firefox, Safari, Edge)  
- Conexão com internet (para APIs e CDNs)  

### Instalação  
1. Clone ou baixe os arquivos do projeto  
2. Abra o arquivo `index.html` em seu navegador  
3. Navegue pelas diferentes páginas através do menu  

### Configuração da API (Opcional)  
Para usar sua própria chave da RAWG API, edite o arquivo `script.js`:  
```js
// Linha 2
const apiKey = "SUA_CHAVE_AQUI";
```  

---

## 💳 Planos de Assinatura  

| Plano      | Preço        | Economia | Benefícios |
|------------|-------------|----------|-------------|
| **Mensal** | R$ 29/mês   | -        | Acesso completo, cancele quando quiser |
| **Trimestral** | R$ 78/3 meses | 10% | Todos os benefícios + suporte prioritário |
| **Anual**  | R$ 279/ano  | 20%      | Todos os benefícios + acesso antecipado |

### Benefícios Inclusos  
✅ Acesso ao catálogo completo (+70.000 jogos)  
✅ Jogos no primeiro dia de lançamento  
✅ Descontos exclusivos para membros (até 20%)  
✅ Suporte via chat  
✅ Sem taxas de cancelamento  

---

## 🔍 Sistema de Filtros  

### Filtros de Qualidade Automáticos  
- **Metacritic:** Pontuação mínima de 60  
- **Rating:** Avaliação mínima de 3.5/5  
- **Popularidade:** Mínimo de 100 avaliações  
- **Período:** Jogos dos últimos 15 anos  
- **Plataformas:** Exclui jogos exclusivamente mobile  

### Categorias Disponíveis  
- 🔥 Populares  
- ⚔️ Ação  
- 🧠 Estratégia  
- 🐲 RPG  
- 🎯 Shooter  
- 🗺️ Aventura  
- 🧩 Puzzle  
- 🏁 Corrida  
- ⚽ Esportes  

---

## 🤝 Contribuição  

Este projeto é uma demonstração de habilidades em desenvolvimento frontend.  
Para sugestões ou melhorias:  

1. Faça um **fork** do projeto  
2. Crie uma **branch** para sua feature  
3. Commit suas mudanças  
4. Push para a branch  
5. Abra um **Pull Request**  

---

### Desenvolvido por  
**Bruno Silva Campos**  
**Guilherme De Deus Dalosto**  

