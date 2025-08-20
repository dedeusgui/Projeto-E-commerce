# 🌌 Orion Game Pass

**Plataforma de catálogo de jogos com design cyberpunk e interface moderna**

Uma Assinatura web que vende um game pass, oferecendo um catálogo de jogos com uma proposta inovadora.

## 📋 Escopo do Projeto

### Funcionalidades Implementadas

- **Catálogo Dinâmico de Jogos**: Exibição de jogos populares com informações detalhadas
- **Sistema de Busca**: Pesquisa em tempo real por nome de jogos
- **Categorização por Gêneros**: 9 categorias (Ação, Estratégia, RPG, Shooter, Aventura, Puzzle, Corrida, Esportes)
- **Scroll Infinito**: Carregamento automático de mais conteúdo durante a navegação
- **Sistema de Planos**: Página dedicada com planos Mensal (R$29) e Anual (R$279)
- **Design Responsivo**: Interface adaptável para desktop, tablet e mobile
- **Tema Cyberpunk**: Estética futurística com elementos neon e gradientes

### Estrutura do Sistema

```
orion-gamepass/
├── index.html          # Página principal com catálogo
├── assinatura.html     # Página de planos de assinatura  
├── script.js           # Lógica JavaScript e integração API
├── style.css           # Estilos customizados cyberpunk
└── img/
    └── logo.png        # Logotipo da aplicação
```

### Arquitetura Técnica

**Frontend**: SPA (Single Page Application) com navegação dinâmica
**Padrão**: Vanilla JavaScript com manipulação DOM
**Responsividade**: Mobile-first design com Bootstrap Grid
**Performance**: Lazy loading e paginação otimizada

## 🛠️ Tecnologias Utilizadas

### Frontend Core
- **HTML5**: Estruturação semântica das páginas
- **CSS3**: Estilização avançada com variáveis CSS, gradientes e animações
- **JavaScript ES6+**: Lógica de negócio, manipulação DOM e requisições HTTP

### Framework e Bibliotecas
- **Bootstrap 5.3.0**: Sistema de grid responsivo e componentes UI
- **Google Fonts (Orbitron)**: Tipografia futurística para tema cyberpunk

### APIs Externas
- **RAWG Video Games Database API**: Fonte de dados dos jogos
  - **Endpoint**: `https://api.rawg.io/api/games`
  - **Funcionalidades**: Busca, filtros por gênero, paginação
  - **Autenticação**: API Key required
  - **Rate Limit**: Conforme documentação da RAWG

### Recursos CSS Avançados
- **CSS Custom Properties**: Variáveis para tema consistente
- **Flexbox & CSS Grid**: Layout responsivo moderno  
- **Backdrop Filter**: Efeitos de blur para glassmorphism
- **CSS Gradients**: Elementos neon e cyberpunk
- **Animations & Transitions**: Micro-interações fluidas

## 🎯 Justificativa do Projeto

### Análise de Mercado

O mercado de game subscription services tem crescimento exponencial:
- Xbox Game Pass ultrapassou 25 milhões de assinantes
- PlayStation Plus registra crescimento de 30% ano a ano
- Modelo de negócio por assinatura se consolidou no gaming

### Problemas Identificados

1. **UX Fragmentada**: Interfaces desatualizadas em plataformas existentes
2. **Descoberta Limitada**: Dificuldade para encontrar novos jogos relevantes  
3. **Performance Web**: Carregamento lento e experiência mobile deficiente
4. **Identidade Visual**: Falta de diferenciação estética no mercado

### Soluções Implementadas

#### Interface Moderna e Intuitiva
- Design cyberpunk único que apela ao público gamer
- Navegação simplificada com categorias bem definidas
- Micro-animações que melhoram a experiência do usuário

#### Sistema de Descoberta Otimizado
- Integração robusta com RAWG API (200k+ jogos)
- Busca em tempo real com debounce
- Scroll infinito para exploração contínua
- Categorização inteligente por gêneros

#### Performance Técnica Superior
- Lazy loading de imagens para otimização
- Paginação eficiente com cache de requisições
- Tratamento de estados de erro e loading
- Código JavaScript modular e reutilizável

#### Modelo de Negócio Transparente
- Preços competitivos e claros
- Economia evidente no plano anual (20% desconto)
- Comparação direta de benefícios

## 🔧 Funcionalidades Técnicas Detalhadas

### Sistema de Busca
```javascript
// Implementação com debounce e tratamento de erro
function fetchAndDisplayGames(apiUrl, isNewSearch = false) {
  // Rate limiting e cache management
  // Error handling robusto
  // Loading states consistentes
}
```

### Scroll Infinito
- Detecção de proximidade do fim da página
- Prevenção de múltiplas requisições simultâneas  
- Carregamento progressivo com feedback visual

### Responsividade
- **Breakpoints**: Mobile (576px), Tablet (768px), Desktop (992px+)
- **Grid System**: Bootstrap flexível com classes customizadas
- **Touch Interactions**: Otimizado para dispositivos móveis

### Gestão de Estado
- Controle de paginação com variáveis globais
- Cache da URL da próxima página
- Estados de loading para UX consistente

## 📊 Métricas e KPIs

### Performance
- **First Contentful Paint**: < 2s
- **Time to Interactive**: < 3s  
- **Core Web Vitals**: Otimizado para mobile

### Engagement
- Tempo médio por sessão
- Taxa de exploração de categorias
- Scroll depth médio

### Conversão (Simulada)
- Cliques em "Assinar Agora"
- Navegação catálogo → assinatura
- Comparação entre planos

## 🚀 Roadmap e Evolução

### Versão Atual (v1.0)
- ✅ Catálogo funcional com API integration
- ✅ Sistema de busca e filtros
- ✅ Design responsivo cyberpunk
- ✅ Páginas de assinatura

### Próximas Iterações

**v1.1 - UX Enhancements**
- Favoritos e wishlist
- Filtros avançados (ano, rating, plataforma)
- Modo escuro/claro toggle

**v1.2 - Features Avançadas** 
- Sistema de usuários e autenticação
- Biblioteca pessoal
- Recomendações baseadas em histórico

**v2.0 - Platform Evolution**
- PWA (Progressive Web App)
- Integração com launchers de jogos
- Sistema de reviews e ratings

## 💻 Como Executar

### Pré-requisitos
- Navegador moderno (Chrome 90+, Firefox 88+, Safari 14+)
- Servidor HTTP local (recomendado)

### Instalação
```bash
# Clone o repositório
git clone https://github.com/BrunoSilvaCampos/gamepass.git

# Navegue para o diretório
cd gamepass

# Configure a API key da RAWG no arquivo script.js
const apiKey = "SUA_RAWG_API_KEY";
```

### Configuração da API RAWG
1. Acesse [RAWG.io API Documentation](https://rawg.io/apidocs)
2. Crie uma conta gratuita
3. Gere sua API key
4. Substitua no arquivo `script.js`:
```javascript
const apiKey = "sua-chave-api-aqui";
```

### Execução
```bash
# Opção 1: Servidor Python
python -m http.server 8000

# Opção 2: Live Server (VS Code Extension)
# Clique com botão direito no index.html → "Open with Live Server"

# Opção 3: Node.js http-server
npx http-server .
```

Acesse: `http://localhost:8000`

## 🔐 Variáveis de Ambiente

```javascript
// Configurações da API
const API_CONFIG = {
  baseURL: "https://api.rawg.io/api",
  apiKey: "sua-chave-aqui",
  pageSize: 12,
  timeout: 5000
};
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma feature branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas alterações (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

### Padrões de Código
- **JavaScript**: ES6+ com async/await
- **CSS**: BEM methodology para classes
- **HTML**: Semântica e acessibilidade

## 📄 Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais informações.

---

**Desenvolvido por [Bruno Silva Campos] E **[Guilherme De Deus Dalosto] (https://github.com/dedeusgui)**;(https://github.com/BrunoSilvaCampos)**

*Orion Game Pass - Revolucionando a descoberta de jogos com design futurístico e tecnologia moderna*
(wireframe)https://excalidraw.com/#json=4qSWLXDtzRaf-nFVZwMPY,cUjZboAHYVuOTI_mTKeIBw
