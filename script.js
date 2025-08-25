// ============================================================================
// CONFIGURAÇÃO CENTRALIZADA
// ============================================================================
const CONFIG = {
  API: {
    KEY: "9d8f7b3b9c054b31ae12b147798d28ca",
    BASE_URL: "https://api.rawg.io/api",
    PAGE_SIZE: 12,
    TIMEOUT: 10000,
  },

  QUALITY_FILTERS: {
    MIN_METACRITIC: 60,
    MIN_RATING: 3.5,
    MIN_RATINGS_COUNT: 100,
    MIN_YEAR: 2010,
    EXCLUDE_MOBILE: true,
    MAIN_PLATFORMS: [4, 187, 18, 1, 186, 7],
  },

  UI: {
    ANIMATION_DELAY: 100,
    SCROLL_THRESHOLD: 1000,
    SCROLL_DEBOUNCE: 150,
    NOTIFICATION_DURATION: 5000,
  },

  SUSPICIOUS_PATTERNS: [
    /^[A-Z\s]+\d+$/i,
    /simulator\s*\d*$/i,
    /\b(asset|flip|quick|simple|basic)\b/i,
    /^\w{1,3}\s*\d+$/i,
  ],
};

// ============================================================================
// UTILITÁRIOS
// ============================================================================
const Utils = {
  sanitizeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str || "";
    return div.innerHTML;
  },

  formatDate(date) {
    return date ? new Date(date).toLocaleDateString("pt-BR") : "Não informado";
  },

  formatRating(rating) {
    return rating ? rating.toFixed(1) : "N/A";
  },

  formatNumber(num) {
    return num ? num.toLocaleString("pt-BR") : "N/A";
  },

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  isValidGame(game) {
    return game && game.id && game.name && typeof game.name === "string";
  },

  isMobile() {
    return window.innerWidth <= 768;
  },
};

// ============================================================================
// TEMPLATES HTML
// ============================================================================
const Templates = {
  gameCardGrid(game, index = 0) {
    const data = this.prepareGameData(game, index);
    return `
      <div class="col-xl-3 col-lg-4 col-md-6 col-sm-12 game-item" data-index="${data.index}">
        <div class="card custom-card h-100">
          <div class="position-relative">
            <img src="${data.imageUrl}" 
                 class="card-img-top custom-card-img" 
                 alt="${data.safeName}"
                 onerror="this.onerror=null; this.src='${data.fallbackImage}';">
            <div class="position-absolute top-0 end-0 m-2">
              <span class="badge bg-info">${data.formattedRating} ⭐</span>
              ${data.qualityBadge}
            </div>
            ${data.metacriticBadge}
            <div class="card-img-overlay d-flex align-items-center justify-content-center opacity-0 hover-overlay">
              <button class="btn btn-primary btn-lg" onclick="GameApp.showGameDetails(${game.id})">
                <i class="fas fa-play me-2"></i>Ver Detalhes
              </button>
            </div>
          </div>
          <div class="card-body d-flex flex-column">
            <h5 class="card-title custom-card-title">${data.safeName}</h5>
            <div class="quality-info mb-2">
              <small class="text-muted"><i class="fas fa-users me-1"></i>${data.formattedRatingsCount} avaliações</small>
            </div>
            <p class="card-text small text-muted mb-2">
              <i class="fas fa-calendar me-1"></i>${data.formattedDate}
            </p>
            <p class="card-text small text-muted mb-3">
              <i class="fas fa-gamepad me-1"></i>${data.genres}
            </p>
            <div class="mt-auto">
              <div class="custom-card-price text-end">Disponível no Game Pass</div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  gameCardList(game, index = 0) {
    const data = this.prepareGameData(game, index);
    return `
      <div class="col-12 game-item" data-index="${data.index}">
        <div class="card custom-card-list h-100">
          <div class="row g-0 h-100">
            <div class="col-md-3">
              <img src="${data.imageUrl}"
     class="img-fluid rounded-start custom-card-img-list"
     style="height: 250px; object-fit: cover; transition: var(--transition);"
     alt="${data.safeName}"
     onerror="this.onerror=null; this.src='${data.fallbackImage}';">
            </div>
            <div class="col-md-9">
              <div class="card-body d-flex flex-column h-100">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <h5 class="card-title custom-card-title mb-0">${data.safeName}</h5>
                  <div class="d-flex align-items-center">
                    <span class="badge bg-info">${data.formattedRating} ⭐</span>
                    ${data.qualityBadge}
                  </div>
                </div>
                
                <div class="quality-indicators mb-2">
                  ${data.metacriticIndicator}
                  <small class="text-muted"><i class="fas fa-users me-1"></i>${data.formattedRatingsCount} avaliações</small>
                </div>
                
                <p class="card-text text-muted small mb-2">
                  <i class="fas fa-calendar me-1"></i>Lançamento: ${data.formattedDate}
                </p>
                <p class="card-text text-muted small mb-2">
                  <i class="fas fa-gamepad me-1"></i>Gêneros: ${data.genres}
                </p>
                <p class="card-text text-muted small mb-3">
                  <i class="fas fa-desktop me-1"></i>Plataformas: ${data.platforms}
                </p>
                <div class="mt-auto d-flex justify-content-between align-items-end">
                  <div class="custom-card-price">Disponível no Game Pass</div>
                  <button class="btn btn-sm btn-outline-info" onclick="GameApp.showGameDetails(${game.id})">
                    <i class="fas fa-info-circle me-1"></i>Detalhes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  prepareGameData(game, index = 0) {
    const safeName = Utils.sanitizeHTML(game.name);
    const metacritic = parseInt(game.metacritic) || null;
    const rating = Utils.formatRating(game.rating);

    return {
      index,
      safeName,
      formattedDate: Utils.formatDate(game.released),
      formattedRating: rating,
      formattedRatingsCount: Utils.formatNumber(game.ratings_count),
      genres: game.genres
        ? game.genres
            .slice(0, 2)
            .map((g) => g.name)
            .join(", ")
        : "Variado",
      platforms: game.platforms
        ? game.platforms
            .slice(0, 3)
            .map((p) => p.platform.name)
            .join(", ")
        : "Multiplataforma",
      imageUrl: game.background_image || this.getFallbackImage(safeName),
      fallbackImage: this.getFallbackImage(safeName),
      qualityBadge: this.getQualityBadge(metacritic),
      metacriticBadge: metacritic
        ? `<div class="position-absolute top-0 start-0 m-2"><span class="badge bg-dark">Meta: ${metacritic}</span></div>`
        : "",
      metacriticIndicator: metacritic
        ? `<small class="text-info me-3"><i class="fas fa-trophy me-1"></i>Metacritic: ${metacritic}</small>`
        : "",
    };
  },

  getFallbackImage(name) {
    try {
      // Tentar versão completa primeiro
      const safeName = name.replace(/[^\w\s-]/g, "").substring(0, 25);

      // Cores de gradiente baseadas no hash do nome
      const gradients = [
        ["#667eea", "#764ba2"],
        ["#f093fb", "#f5576c"],
        ["#4facfe", "#00f2fe"],
        ["#43e97b", "#38f9d7"],
        ["#fa709a", "#fee140"],
        ["#a8edea", "#fed6e3"],
        ["#ff9a9e", "#fecfef"],
        ["#ffecd2", "#fcb69f"],
      ];

      // Hash simples para selecionar gradiente
      const hash = safeName.length + (safeName.charCodeAt(0) || 0);
      const [color1, color2] = gradients[hash % gradients.length];

      // Usar Canvas em vez de SVG para evitar problemas com btoa
      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 250;
      const ctx = canvas.getContext("2d");

      // Criar gradiente
      const gradient = ctx.createLinearGradient(0, 0, 400, 250);
      gradient.addColorStop(0, color1);
      gradient.addColorStop(1, color2);

      // Desenhar fundo
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 400, 250);

      // Adicionar texto
      ctx.fillStyle = "white";
      ctx.font = "bold 16px Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Quebrar texto em linhas se for muito longo
      const words = safeName.split(" ");
      const lines = [];
      let currentLine = words[0] || "";

      for (let i = 1; i < words.length; i++) {
        const testLine = currentLine + " " + words[i];
        const metrics = ctx.measureText(testLine);
        if (metrics.width > 350 && currentLine !== "") {
          lines.push(currentLine);
          currentLine = words[i];
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) lines.push(currentLine);

      // Desenhar linhas de texto
      const startY = 125 - (lines.length - 1) * 10;
      lines.forEach((line, index) => {
        ctx.fillText(line, 200, startY + index * 20);
      });

      // Adicionar texto "Orion Game Pass"
      ctx.font = "12px Arial, sans-serif";
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      ctx.fillText("Orion Game Pass", 200, 180);

      // Adicionar ícone de play simples
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.beginPath();
      ctx.arc(200, 200, 15, 0, 2 * Math.PI);
      ctx.fill();

      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.moveTo(195, 195);
      ctx.lineTo(195, 205);
      ctx.lineTo(208, 200);
      ctx.closePath();
      ctx.fill();

      // Retornar como data URL
      return canvas.toDataURL("image/png");
    } catch (error) {
      console.warn(
        "Erro ao criar fallback image, usando versão simples:",
        error
      );
      // Fallback do fallback - imagem sólida simples
      return this.getFallbackImageSimple(name);
    }
  },

  getQualityBadge(metacritic) {
    if (!metacritic) return "";

    const badges = [
      { score: 90, class: "bg-success", text: "Obra-prima" },
      { score: 80, class: "bg-success", text: "Excelente" },
      { score: 70, class: "bg-info", text: "Muito Bom" },
      { score: 60, class: "bg-warning", text: "Bom" },
    ];

    for (const badge of badges) {
      if (metacritic >= badge.score) {
        return `<span class="badge ${badge.class} ms-1">${badge.text}</span>`;
      }
    }
    return "";
  },

  errorMessage(message) {
    return `
      <div class="col-12">
        <div class="alert alert-danger text-center">
          <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
          <h4>Ops! Algo deu errado</h4>
          <p class="mb-3">${Utils.sanitizeHTML(message)}</p>
          <button class="btn btn-outline-light" onclick="GameApp.retryLastSearch()">
            <i class="fas fa-redo me-2"></i>Tentar Novamente
          </button>
        </div>
      </div>
    `;
  },

  noGamesMessage() {
    return `
      <div class="col-12">
        <div class="text-center py-5">
          <i class="fas fa-gamepad fa-4x text-muted mb-3"></i>
          <h3 class="text-muted">Nenhum jogo de qualidade encontrado</h3>
          <p class="text-muted">Tente buscar por outro termo ou categoria. Só mostramos jogos com boa avaliação!</p>
        </div>
      </div>
    `;
  },

  loadingSpinner() {
    return `
      <div class="col-12 text-center">
        <div class="spinner-border text-info" role="status">
          <span class="visually-hidden">Carregando...</span>
        </div>
      </div>
    `;
  },
};

// ============================================================================
// SERVIÇO DA API
// ============================================================================
class GameService {
  constructor() {
    this.apiKey = CONFIG.API.KEY;
    this.baseUrl = CONFIG.API.BASE_URL;
  }

  buildURL(params = {}) {
    console.log("Construindo URL com parâmetros:", params);

    const defaultParams = {
      key: CONFIG.API.KEY,
      page_size: CONFIG.API.PAGE_SIZE,
    };

    // Ordenação - usar o que foi passado ou padrão
    defaultParams.ordering = params.ordering || "-rating";

    // ⭐ SEMPRE aplicar filtros de qualidade básicos
    defaultParams.dates = `${
      CONFIG.QUALITY_FILTERS.MIN_YEAR
    }-01-01,${new Date().getFullYear()}-12-31`;

    // ⭐ SEMPRE aplicar filtro de Metacritic (exceto para buscas muito específicas)
    if (!params.search || params.search.length < 5) {
      defaultParams.metacritic = `${CONFIG.QUALITY_FILTERS.MIN_METACRITIC},100`;
    }

    // ⭐ SEMPRE excluir plataformas mobile/fracas
    if (
      params.platforms &&
      params.platforms !== "" &&
      params.platforms !== "all"
    ) {
      defaultParams.platforms = params.platforms;
    } else {
      // SEMPRE aplicar filtro de plataformas principais
      defaultParams.platforms = CONFIG.QUALITY_FILTERS.MAIN_PLATFORMS.join(",");
    }

    // Busca por texto
    if (params.search && params.search.trim()) {
      defaultParams.search = params.search.trim();
    }

    // Gêneros
    if (params.genres && params.genres !== "" && params.genres !== "popular") {
      defaultParams.genres = params.genres;
    }

    // Página
    if (params.page) {
      defaultParams.page = params.page;
    }

    const url = `${CONFIG.API.BASE_URL}/games?${new URLSearchParams(
      defaultParams
    ).toString()}`;
    console.log("URL construída:", url);

    return url;
  }

  async fetchGames(url) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        CONFIG.API.TIMEOUT
      );

      const response = await fetch(url, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error("Timeout: A requisição demorou muito para responder");
      }
      throw error;
    }
  }

  async fetchGameDetails(gameId) {
    const url = `${this.baseUrl}/games/${gameId}?key=${this.apiKey}`;
    return this.fetchGames(url);
  }

  filterGamesByQuality(games) {
    console.log(
      "🔍 Iniciando filtro de qualidade. Total recebido:",
      games.length
    );

    const filtered = games.filter((game, index) => {
      // Log do jogo sendo analisado
      if (index < 5) {
        console.log(`Analisando jogo ${index + 1}:`, {
          name: game.name,
          rating: game.rating,
          ratings_count: game.ratings_count,
          metacritic: game.metacritic,
          released: game.released,
        });
      }

      // 1. Validação básica
      if (!Utils.isValidGame(game)) {
        console.log("❌ Jogo inválido removido:", game?.name || "sem nome");
        return false;
      }

      // 2. ⭐ FILTRO RIGOROSO: Contagem mínima de ratings
      if (
        !game.ratings_count ||
        game.ratings_count < CONFIG.QUALITY_FILTERS.MIN_RATINGS_COUNT
      ) {
        if (index < 10)
          console.log(
            `❌ Removido por poucos ratings (${game.ratings_count || 0}):`,
            game.name
          );
        return false;
      }

      // 3. ⭐ FILTRO RIGOROSO: Rating mínimo
      if (!game.rating || game.rating < CONFIG.QUALITY_FILTERS.MIN_RATING) {
        if (index < 10)
          console.log(
            `❌ Removido por rating baixo (${game.rating || 0}):`,
            game.name
          );
        return false;
      }

      // 4. ⭐ FILTRO ADICIONAL: Metacritic (se existir, deve ser bom)
      if (
        game.metacritic !== null &&
        game.metacritic !== undefined &&
        game.metacritic < CONFIG.QUALITY_FILTERS.MIN_METACRITIC
      ) {
        if (index < 10)
          console.log(
            `❌ Removido por Metacritic baixo (${game.metacritic}):`,
            game.name
          );
        return false;
      }

      // 5. ⭐ FILTRO ADICIONAL: Ano de lançamento
      if (game.released) {
        const releaseYear = new Date(game.released).getFullYear();
        if (releaseYear < CONFIG.QUALITY_FILTERS.MIN_YEAR) {
          if (index < 10)
            console.log(
              `❌ Removido por ano antigo (${releaseYear}):`,
              game.name
            );
          return false;
        }
      }

      // 6. ⭐ FILTRO ADICIONAL: Padrões suspeitos no nome
      if (
        CONFIG.SUSPICIOUS_PATTERNS.some((pattern) => pattern.test(game.name))
      ) {
        if (index < 10)
          console.log(`❌ Removido por nome suspeito:`, game.name);
        return false;
      }

      // 7. ⭐ FILTRO ADICIONAL: Jogos com muito poucas informações
      if (
        !game.background_image &&
        !game.genres?.length &&
        !game.platforms?.length
      ) {
        if (index < 10)
          console.log(`❌ Removido por falta de informações:`, game.name);
        return false;
      }

      // Se passou por todos os filtros
      if (index < 5) console.log(`✅ Jogo aprovado:`, game.name);
      return true;
    });

    console.log(
      `🎯 RESULTADO DO FILTRO: ${filtered.length} jogos de qualidade (de ${games.length} originais)`
    );

    // Se ainda estão passando muitos jogos, aplicar filtro adicional
    if (filtered.length > 100) {
      console.log(
        "⚠️ Muitos jogos ainda passaram, aplicando filtro adicional..."
      );

      const extraFiltered = filtered.filter((game) => {
        // Só jogos com rating muito bom E muitas avaliações
        return game.rating >= 4.0 && game.ratings_count >= 500;
      });

      console.log(
        `🔥 Filtro extra aplicado: ${extraFiltered.length} jogos premium`
      );
      return extraFiltered;
    }

    return filtered;
  }
}

// ============================================================================
// GERENCIADOR DE ESTADO
// ============================================================================
class StateManager {
  constructor() {
    this.state = {
      currentUrl: "",
      isLoading: false,
      currentViewMode: "grid",
      currentSearchTerm: "",
      currentGenre: "popular",
      lastSearchUrl: "",
      lastSearchTitle: "",
    };
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
  }

  getState() {
    return { ...this.state };
  }

  isLoading() {
    return this.state.isLoading;
  }

  setLoading(loading) {
    this.setState({ isLoading: loading });
  }
}

// ============================================================================
// GERENCIADOR DE UI
// ============================================================================
class UIManager {
  constructor() {
    this.elements = this.getElements();
    this.setupEventListeners();

    this.themeManager = new ThemeManager();
  }

  getElements() {
    return {
      gamesContainer: document.getElementById("game-cards-container"),
      searchForm: document.getElementById("search-form"),
      searchInput: document.getElementById("search-input"),
      categoryItems: document.querySelectorAll(".category-item"),
      catalogTitle: document.getElementById("catalog-title"),
      gameCountSpan: document.getElementById("game-count"),
      loadingIndicator: document.getElementById("loading-indicator"),
      noGamesMessage: document.getElementById("no-games-message"),
      gridViewBtn: document.getElementById("grid-view"),
      listViewBtn: document.getElementById("list-view"),
      sortSelect: document.getElementById("sortSelect"),
      platformSelect: document.getElementById("platformSelect"),
    };
  }

  setupEventListeners() {
    // Event listeners serão configurados pelo GameApp
  }

  showLoading() {
    if (this.elements.loadingIndicator) {
      this.elements.loadingIndicator.style.display = "block";
    }
  }

  hideLoading() {
    if (this.elements.loadingIndicator) {
      this.elements.loadingIndicator.style.display = "none";
    }
  }

  showNoGamesMessage() {
    if (this.elements.noGamesMessage) {
      this.elements.noGamesMessage.style.display = "block";
    } else if (this.elements.gamesContainer) {
      this.elements.gamesContainer.innerHTML = Templates.noGamesMessage();
    }
  }

  hideNoGamesMessage() {
    if (this.elements.noGamesMessage) {
      this.elements.noGamesMessage.style.display = "none";
    }
  }

  clearGamesContainer() {
    if (this.elements.gamesContainer) {
      this.elements.gamesContainer.innerHTML = "";
    }
  }

  updateGameCount(count) {
    if (this.elements.gameCountSpan) {
      this.elements.gameCountSpan.textContent = `(${Utils.formatNumber(
        count
      )} jogos de qualidade encontrados)`;
    }
  }

  updateCatalogTitle(title) {
    if (this.elements.catalogTitle) {
      // Preserva o span de contagem
      const gameCountSpan =
        this.elements.catalogTitle.querySelector("#game-count") ||
        this.elements.gameCountSpan;
      this.elements.catalogTitle.innerHTML = `${title} `;
      if (gameCountSpan) {
        this.elements.catalogTitle.appendChild(gameCountSpan);
      }
    }
  }

  addGameCards(games, viewMode) {
    if (!this.elements.gamesContainer) return;

    const template =
      viewMode === "list" ? Templates.gameCardList : Templates.gameCardGrid;

    games.forEach((game, index) => {
      const gameCardHTML = template.call(Templates, game, index);
      this.elements.gamesContainer.innerHTML += gameCardHTML;
    });

    this.addCardAnimations();
  }

  addCardAnimations() {
    const newCards = document.querySelectorAll(".game-item:not(.animated)");
    newCards.forEach((card, index) => {
      card.classList.add("animated");
      card.style.opacity = "0";
      card.style.transform = "translateY(20px)";

      setTimeout(() => {
        card.style.transition = "all 0.6s ease-out";
        card.style.opacity = "1";
        card.style.transform = "translateY(0)";
      }, index * CONFIG.UI.ANIMATION_DELAY);
    });
  }

  showError(message) {
    if (this.elements.gamesContainer) {
      this.elements.gamesContainer.innerHTML = Templates.errorMessage(message);
    }
  }

  updateViewButtons(mode) {
    if (this.elements.gridViewBtn && this.elements.listViewBtn) {
      this.elements.gridViewBtn.classList.toggle("btn-info", mode === "grid");
      this.elements.gridViewBtn.classList.toggle(
        "btn-outline-info",
        mode !== "grid"
      );
      this.elements.listViewBtn.classList.toggle("btn-info", mode === "list");
      this.elements.listViewBtn.classList.toggle(
        "btn-outline-info",
        mode !== "list"
      );
    }
  }

  showNotification(message, type = "info") {
    // Remove notificações existentes
    const existingNotifications = document.querySelectorAll(
      ".notification-toast"
    );
    existingNotifications.forEach((n) => n.remove());

    const notificationHTML = `
      <div class="position-fixed top-0 end-0 p-3 notification-toast" style="z-index: 2000;">
        <div class="toast show" role="alert">
          <div class="toast-header bg-${type} text-white">
            <i class="fas fa-info-circle me-2"></i>
            <strong class="me-auto">Orion Game Pass</strong>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
          </div>
          <div class="toast-body bg-dark text-light">
            ${Utils.sanitizeHTML(message)}
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", notificationHTML);

    // Auto remove após duração configurada
    setTimeout(() => {
      const notification = document.querySelector(".notification-toast");
      if (notification) {
        notification.remove();
      }
    }, CONFIG.UI.NOTIFICATION_DURATION);

    // Remove ao clicar no X
    const closeBtn = document.querySelector(".notification-toast .btn-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        const notification = document.querySelector(".notification-toast");
        if (notification) {
          notification.remove();
        }
      });
    }
  }
}

// ============================================================================
// APLICAÇÃO PRINCIPAL
// ============================================================================
class GameApp {
  constructor() {
    this.gameService = new GameService();
    this.stateManager = new StateManager();
    this.uiManager = new UIManager();
    this.debouncedScroll = Utils.debounce(
      this.handleScroll.bind(this),
      CONFIG.UI.SCROLL_DEBOUNCE
    );

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.handleURLParameters();
    this.loadInitialContent();
  }

  setupEventListeners() {
    const self = this;

    // Busca
    if (this.uiManager.elements.searchForm) {
      this.uiManager.elements.searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleSearch();
      });
    }

    // Ordenação
    if (this.uiManager.elements.sortSelect) {
      this.uiManager.elements.sortSelect.addEventListener("change", (e) => {
        console.log("Mudança de ordenação:", e.target.value);
        this.handleSortChange(e.target.value);
      });
    }

    // Plataforma
    if (this.uiManager.elements.platformSelect) {
      this.uiManager.elements.platformSelect.addEventListener("change", (e) => {
        console.log("Mudança de plataforma:", e.target.value);
        this.handlePlatformChange(e.target.value);
      });
    }

    // Categorias
    this.uiManager.elements.categoryItems.forEach((item) => {
      item.addEventListener("click", () => this.handleCategoryClick(item));
    });

    // View modes
    if (this.uiManager.elements.gridViewBtn) {
      this.uiManager.elements.gridViewBtn.addEventListener("click", () =>
        this.switchViewMode("grid")
      );
    }

    if (this.uiManager.elements.listViewBtn) {
      this.uiManager.elements.listViewBtn.addEventListener("click", () =>
        this.switchViewMode("list")
      );
    }

    // Scroll infinito
    window.addEventListener("scroll", this.debouncedScroll);
  }

  handleSortChange(ordering) {
    const { currentSearchTerm, currentGenre } = this.stateManager.getState();
    const params = { ordering };

    // Se há um termo de busca, prioriza a busca
    if (currentSearchTerm) {
      params.search = currentSearchTerm;
      // Não aplica filtro de gênero em buscas por texto
    } else if (
      currentGenre &&
      currentGenre !== "popular" &&
      currentGenre !== ""
    ) {
      // Aplica o gênero atual se não for popular e não estiver vazio
      params.genres = currentGenre;
    }

    // Manter plataforma selecionada
    if (
      this.uiManager.elements.platformSelect?.value &&
      this.uiManager.elements.platformSelect.value !== "all"
    ) {
      params.platforms = this.uiManager.elements.platformSelect.value;
    }

    const url = this.gameService.buildURL(params);
    const sortText =
      this.uiManager.elements.sortSelect.options[
        this.uiManager.elements.sortSelect.selectedIndex
      ].text;

    // Determinar o título baseado no contexto atual
    let title = `Ordenado por ${sortText}`;
    if (currentSearchTerm) {
      title = `"${currentSearchTerm}" - ${sortText}`;
    } else if (currentGenre && currentGenre !== "popular") {
      const activeCategory = document.querySelector(".category-item.active");
      if (activeCategory) {
        title = `${activeCategory.textContent} - ${sortText}`;
      }
    }

    console.log("Sort Change - Params:", params);
    console.log("Sort Change - URL:", url);

    this.handleNewSearch(url, title);
  }

  handlePlatformChange(platform) {
    const { currentSearchTerm, currentGenre } = this.stateManager.getState();
    const params = {};

    // Aplicar filtro de plataforma se não for "all"
    if (platform && platform !== "all") {
      params.platforms = platform;
    }

    // Se há um termo de busca, prioriza a busca
    if (currentSearchTerm) {
      params.search = currentSearchTerm;
      // Não aplica filtro de gênero em buscas por texto
    } else if (
      currentGenre &&
      currentGenre !== "popular" &&
      currentGenre !== ""
    ) {
      // Aplica o gênero atual se não for popular e não estiver vazio
      params.genres = currentGenre;
    }

    // Manter ordenação selecionada
    if (this.uiManager.elements.sortSelect?.value) {
      params.ordering = this.uiManager.elements.sortSelect.value;
    }

    const url = this.gameService.buildURL(params);

    // Determinar o título baseado no contexto atual
    let title = "Jogos Filtrados";
    if (currentSearchTerm) {
      title = `Resultados para: "${currentSearchTerm}"`;
    } else if (currentGenre && currentGenre !== "popular") {
      const activeCategory = document.querySelector(".category-item.active");
      if (activeCategory) {
        title = activeCategory.textContent;
      }
    } else {
      title = "Jogos Populares de Qualidade";
    }

    // Adicionar informação da plataforma ao título
    if (platform && platform !== "all") {
      const platformSelect = this.uiManager.elements.platformSelect;
      const platformText =
        platformSelect.options[platformSelect.selectedIndex].text;
      title += ` - ${platformText}`;
    }

    console.log("Platform Change - Params:", params);
    console.log("Platform Change - URL:", url);

    this.handleNewSearch(url, title);
  }
  handleCategoryClick(item) {
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Atualizar interface
    this.uiManager.elements.categoryItems.forEach((i) =>
      i.classList.remove("active")
    );
    item.classList.add("active");

    const genre = item.getAttribute("data-genre");

    // Resetar termo de busca quando seleciona categoria
    this.stateManager.setState({
      currentGenre: genre,
      currentSearchTerm: "",
    });

    // Limpar campo de busca
    if (this.uiManager.elements.searchInput) {
      this.uiManager.elements.searchInput.value = "";
    }

    this.loadCategoryGames(genre);
  }

  async fetchAndDisplayGames(apiUrl, isNewSearch = false) {
    console.log("Buscando jogos com URL:", apiUrl);

    if (this.stateManager.isLoading()) {
      console.log("Já está carregando, aguardando...");
      return;
    }

    this.stateManager.setLoading(true);
    this.uiManager.showLoading();

    if (isNewSearch) {
      this.uiManager.clearGamesContainer();
      this.uiManager.hideNoGamesMessage();
    }

    try {
      const data = await this.gameService.fetchGames(apiUrl);
      console.log(
        "Resposta da API - Total de jogos:",
        data.results?.length || 0
      );

      const filteredGames = this.gameService.filterGamesByQuality(
        data.results || []
      );
      console.log("Jogos após filtros:", filteredGames.length);

      if (isNewSearch) {
        this.uiManager.updateGameCount(data.count || 0);
      }

      this.stateManager.setState({ currentUrl: data.next });

      if (filteredGames.length === 0) {
        if (isNewSearch) {
          console.log("Nenhum jogo passou nos filtros, mostrando mensagem");
          this.uiManager.showNoGamesMessage();
        }
      } else {
        console.log("Adicionando jogos à interface:", filteredGames.length);
        const { currentViewMode } = this.stateManager.getState();
        this.uiManager.addGameCards(filteredGames, currentViewMode);
      }
    } catch (error) {
      console.error("Erro ao buscar jogos:", error);
      if (isNewSearch) {
        this.uiManager.showError(
          error.message ||
            "Não foi possível carregar os jogos. Verifique sua conexão e tente novamente."
        );
      }
    } finally {
      this.stateManager.setLoading(false);
      this.uiManager.hideLoading();
    }
  }

  handleSearch() {
    const searchTerm = this.uiManager.elements.searchInput?.value.trim();
    if (!searchTerm) return;

    // Ao fazer uma busca, limpar seleção de categoria
    this.uiManager.elements.categoryItems.forEach((item) =>
      item.classList.remove("active")
    );

    this.stateManager.setState({
      currentSearchTerm: searchTerm,
      currentGenre: "", // Limpar gênero ao buscar
    });

    const params = { search: searchTerm };

    // Manter filtros de plataforma e ordenação
    if (
      this.uiManager.elements.platformSelect?.value &&
      this.uiManager.elements.platformSelect.value !== "all"
    ) {
      params.platforms = this.uiManager.elements.platformSelect.value;
    }

    if (this.uiManager.elements.sortSelect?.value) {
      params.ordering = this.uiManager.elements.sortSelect.value;
    }

    const searchApiUrl = this.gameService.buildURL(params);
    this.handleNewSearch(searchApiUrl, `Resultados para: "${searchTerm}"`);
  }
  handleScroll() {
    const { currentUrl } = this.stateManager.getState();

    if (
      window.innerHeight + window.scrollY >=
        document.body.offsetHeight - CONFIG.UI.SCROLL_THRESHOLD &&
      !this.stateManager.isLoading() &&
      currentUrl
    ) {
      this.fetchAndDisplayGames(currentUrl);
    }
  }

  handleNewSearch(url, title) {
    this.stateManager.setState({
      lastSearchUrl: url,
      lastSearchTitle: title,
    });
    this.uiManager.updateCatalogTitle(title);
    this.fetchAndDisplayGames(url, true);
  }

  loadCategoryGames(genre) {
    this.stateManager.setState({
      currentGenre: genre,
      currentSearchTerm: "",
    });

    const params = {};
    let genreName = "";

    // Obter nome da categoria
    const categoryElement = document.querySelector(`[data-genre="${genre}"]`);
    if (categoryElement) {
      genreName = categoryElement.textContent;
    }

    // Configurar parâmetros baseados no gênero
    if (genre === "popular") {
      params.ordering = "-rating,-ratings_count,-added";
    } else {
      params.genres = genre;
      params.ordering = "-rating,-metacritic";
    }

    // Manter filtros de plataforma e ordenação se estiverem selecionados
    if (
      this.uiManager.elements.platformSelect?.value &&
      this.uiManager.elements.platformSelect.value !== "all"
    ) {
      params.platforms = this.uiManager.elements.platformSelect.value;

      // Adicionar plataforma ao título
      const platformText =
        this.uiManager.elements.platformSelect.options[
          this.uiManager.elements.platformSelect.selectedIndex
        ].text;
      genreName += ` - ${platformText}`;
    }

    if (
      this.uiManager.elements.sortSelect?.value &&
      genre !== "popular" // Para popular, já definimos a ordenação específica
    ) {
      params.ordering = this.uiManager.elements.sortSelect.value;
    }

    const apiUrl = this.gameService.buildURL(params);

    console.log("Category Load - Genre:", genre);
    console.log("Category Load - Params:", params);
    console.log("Category Load - URL:", apiUrl);

    this.handleNewSearch(apiUrl, genreName || "Jogos de Qualidade");
  }

  switchViewMode(mode) {
    this.stateManager.setState({ currentViewMode: mode });
    this.uiManager.updateViewButtons(mode);

    const { currentSearchTerm, currentGenre } = this.stateManager.getState();

    if (currentSearchTerm) {
      const searchApiUrl = this.gameService.buildURL({
        search: currentSearchTerm,
      });
      this.handleNewSearch(
        searchApiUrl,
        `Resultados para: "${currentSearchTerm}"`
      );
    } else {
      this.loadCategoryGames(currentGenre);
    }
  }

  retryLastSearch() {
    const { lastSearchUrl, lastSearchTitle } = this.stateManager.getState();
    if (lastSearchUrl && lastSearchTitle) {
      this.handleNewSearch(lastSearchUrl, lastSearchTitle);
    } else {
      const { currentSearchTerm, currentGenre } = this.stateManager.getState();
      if (currentSearchTerm) {
        const searchApiUrl = this.gameService.buildURL({
          search: currentSearchTerm,
        });
        this.handleNewSearch(
          searchApiUrl,
          `Resultados para: "${currentSearchTerm}"`
        );
      } else {
        this.loadCategoryGames(currentGenre);
      }
    }
  }

  async showGameDetails(gameId) {
    try {
      this.createGameModal();
      const game = await this.gameService.fetchGameDetails(gameId);
      this.updateGameModal(game);
    } catch (error) {
      console.error("Erro ao carregar detalhes:", error);
      this.showGameModalError();
    }
  }

  createGameModal() {
    const modalHTML = `
      <div class="modal fade" id="gameDetailsModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
          <div class="modal-content bg-dark text-light">
            <div class="modal-header border-secondary">
              <h5 class="modal-title">
                <i class="fas fa-spinner fa-spin me-2"></i>Carregando detalhes...
              </h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="text-center">
                <div class="spinner-border text-info" role="status">
                  <span class="visually-hidden">Carregando...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    const existingModal = document.getElementById("gameDetailsModal");
    if (existingModal) {
      existingModal.remove();
    }

    document.body.insertAdjacentHTML("beforeend", modalHTML);

    // Verificar se Bootstrap está disponível
    if (typeof bootstrap !== "undefined" && bootstrap.Modal) {
      const modal = new bootstrap.Modal(
        document.getElementById("gameDetailsModal")
      );
      modal.show();
    } else {
      // Fallback se Bootstrap não estiver carregado
      document.getElementById("gameDetailsModal").style.display = "block";
      document.getElementById("gameDetailsModal").classList.add("show");
    }
  }

  updateGameModal(game) {
    const modalTitle = document.querySelector("#gameDetailsModal .modal-title");
    const modalBody = document.querySelector("#gameDetailsModal .modal-body");

    if (!modalTitle || !modalBody) return;

    modalTitle.innerHTML = `<i class="fas fa-gamepad me-2"></i>${Utils.sanitizeHTML(
      game.name
    )}`;

    const gameData = {
      genres: game.genres ? game.genres.map((g) => g.name).join(", ") : "N/A",
      platforms: game.platforms
        ? game.platforms
            .slice(0, 4)
            .map((p) => p.platform.name)
            .join(", ")
        : "N/A",
      developers: game.developers
        ? game.developers.map((d) => d.name).join(", ")
        : "N/A",
      publishers: game.publishers
        ? game.publishers.map((p) => p.name).join(", ")
        : "N/A",
      releaseDate: Utils.formatDate(game.released),
      rating: Utils.formatRating(game.rating),
      metacritic: game.metacritic || "N/A",
      ratingsCount: Utils.formatNumber(game.ratings_count),
      description: game.description_raw
        ? Utils.sanitizeHTML(game.description_raw.substring(0, 500))
        : "Jogo de alta qualidade disponível no Orion Game Pass.",
    };

    modalBody.innerHTML = `
      <div class="row">
        <div class="col-md-4">
          <img src="${
            game.background_image || Templates.getFallbackImage(game.name)
          }" 
               class="img-fluid rounded" 
               alt="${Utils.sanitizeHTML(game.name)}"
               onerror="this.src='${Templates.getFallbackImage(game.name)}'">
        </div>
        <div class="col-md-8">
          <div class="game-details">
            <div class="mb-3">
              <h6 class="text-info">Avaliação de Qualidade:</h6>
              <div class="d-flex align-items-center gap-3">
                <span class="badge bg-primary fs-6">${gameData.rating} ★</span>
                ${
                  gameData.metacritic !== "N/A"
                    ? `<span class="badge bg-success fs-6">Metacritic: ${gameData.metacritic}</span>`
                    : ""
                }
                <small class="text-muted">${
                  gameData.ratingsCount
                } avaliações</small>
              </div>
            </div>
            
            <div class="mb-3">
              <h6 class="text-info">Data de Lançamento:</h6>
              <p class="mb-0">${gameData.releaseDate}</p>
            </div>
            
            <div class="mb-3">
              <h6 class="text-info">Gêneros:</h6>
              <p class="mb-0">${gameData.genres}</p>
            </div>
            
            <div class="mb-3">
              <h6 class="text-info">Plataformas:</h6>
              <p class="mb-0">${gameData.platforms}</p>
            </div>
            
            <div class="mb-3">
              <h6 class="text-info">Desenvolvedores:</h6>
              <p class="mb-0">${gameData.developers}</p>
            </div>
            
            <div class="mb-3">
              <h6 class="text-info">Distribuidores:</h6>
              <p class="mb-0">${gameData.publishers}</p>
            </div>
            
            <div class="mb-3">
              <h6 class="text-info">Descrição:</h6>
              <p class="text-muted small" style="max-height: 150px; overflow-y: auto;">
                ${gameData.description}${
      game.description_raw && game.description_raw.length > 500 ? "..." : ""
    }
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="text-center mt-4">
        <button class="btn btn-success btn-lg" onclick="GameApp.playGame('${Utils.sanitizeHTML(
          game.name
        )}')">
          <i class="fas fa-play me-2"></i>Jogar Agora
        </button>
        <button class="btn btn-outline-info ms-2" onclick="GameApp.addToWishlist('${Utils.sanitizeHTML(
          game.name
        )}')">
          <i class="fas fa-heart me-2"></i>Favoritar
        </button>
      </div>
    `;
  }

  showGameModalError() {
    const modalTitle = document.querySelector("#gameDetailsModal .modal-title");
    const modalBody = document.querySelector("#gameDetailsModal .modal-body");

    if (modalTitle) {
      modalTitle.innerHTML =
        '<i class="fas fa-exclamation-triangle me-2"></i>Erro';
    }

    if (modalBody) {
      modalBody.innerHTML = `
        <div class="alert alert-danger text-center">
          <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
          <h5>Erro ao carregar detalhes</h5>
          <p class="mb-0">Não foi possível carregar os detalhes do jogo. Tente novamente.</p>
        </div>
      `;
    }
  }

  playGame(gameName) {
    // Fechar modal se estiver usando Bootstrap
    if (typeof bootstrap !== "undefined" && bootstrap.Modal) {
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("gameDetailsModal")
      );
      if (modal) {
        modal.hide();
      }
    } else {
      // Fallback
      const modal = document.getElementById("gameDetailsModal");
      if (modal) {
        modal.style.display = "none";
        modal.classList.remove("show");
      }
    }

    this.uiManager.showNotification(`Iniciando ${gameName}...`, "success");

    setTimeout(() => {
      this.uiManager.showNotification(
        "Jogo disponível no seu Game Pass!",
        "info"
      );
    }, 2000);
  }

  addToWishlist(gameName) {
    this.uiManager.showNotification(
      `${gameName} foi adicionado aos seus favoritos!`,
      "success"
    );
  }

  handleURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get("search");
    const genreParam = urlParams.get("genre");

    if (searchParam && this.uiManager.elements.searchInput) {
      this.uiManager.elements.searchInput.value = searchParam;
      this.stateManager.setState({ currentSearchTerm: searchParam });
      const searchApiUrl = this.gameService.buildURL({ search: searchParam });
      this.handleNewSearch(searchApiUrl, `Resultados para: "${searchParam}"`);
      return true;
    } else if (genreParam && this.uiManager.elements.categoryItems.length > 0) {
      const categoryElement = document.querySelector(
        `[data-genre="${genreParam}"]`
      );
      if (categoryElement) {
        this.uiManager.elements.categoryItems.forEach((item) =>
          item.classList.remove("active")
        );
        categoryElement.classList.add("active");
        this.loadCategoryGames(genreParam);
        return true;
      }
    }

    return false;
  }

  loadInitialContent() {
    // Carrega jogos em destaque se estivermos na página inicial
    if (document.querySelector(".featured-games-section")) {
      this.loadFeaturedGames();
      this.setupGenreLinks();
    }

    // Carrega jogos do catálogo
    if (this.uiManager.elements.gamesContainer) {
      if (!this.handleURLParameters()) {
        this.loadInitialGames();
      }
    }
  }

  loadInitialGames() {
    const popularGamesUrl = this.gameService.buildURL({
      ordering: "-rating,-ratings_count,-added",
    });
    this.handleNewSearch(popularGamesUrl, "Jogos Populares de Qualidade");
  }

  async loadFeaturedGames() {
    const featuredGamesContainer = document.querySelector(
      ".featured-games-section .row"
    );
    if (!featuredGamesContainer) return;

    // CORRIGIDO: Buscar apenas 3 jogos específicos para página inicial
    const featuredGameNames = [
      "Grand Theft Auto V",
      "God of War",
      "Red Dead Redemption 2",
    ];

    featuredGamesContainer.innerHTML = Templates.loadingSpinner();

    try {
      const games = [];

      // Buscar jogos um por um para garantir ordem e qualidade
      for (const gameName of featuredGameNames) {
        try {
          const url = this.gameService.buildURL({
            search: encodeURIComponent(gameName),
            page_size: 1,
          });
          const data = await this.gameService.fetchGames(url);

          if (data.results && data.results.length > 0) {
            const filteredGames = this.gameService.filterGamesByQuality(
              data.results
            );
            if (filteredGames.length > 0) {
              games.push(filteredGames[0]);
            }
          }
        } catch (error) {
          console.warn(`Erro ao buscar ${gameName}:`, error);
        }
      }

      featuredGamesContainer.innerHTML = "";

      // CORRIGIDO: Verificar se temos jogos para mostrar
      if (games.length === 0) {
        featuredGamesContainer.innerHTML = `
          <div class="col-12 text-center">
            <div class="alert alert-warning">
              <i class="fas fa-exclamation-triangle me-2"></i>
              Não foi possível carregar os jogos em destaque.
            </div>
          </div>
        `;
        return;
      }

      // Criar cards para os jogos encontrados
      games.forEach((game) => {
        const genres = game.genres
          ? game.genres.slice(0, 2).map((g) => g.name)
          : ["RPG", "Ação"];
        const gameCard = this.createFeaturedGameCard(game, genres);
        featuredGamesContainer.innerHTML += gameCard;
      });

      // Adicionar animações
      setTimeout(() => {
        const cards = featuredGamesContainer.querySelectorAll(
          ".featured-game-card"
        );
        cards.forEach((card, index) => {
          setTimeout(() => {
            card.style.opacity = "1";
            card.style.transform = "translateY(0)";
          }, index * 200);
        });
      }, 100);
    } catch (error) {
      console.error("Erro ao carregar jogos em destaque:", error);
      featuredGamesContainer.innerHTML = `
        <div class="col-12 text-center">
          <div class="alert alert-warning">
            <i class="fas fa-exclamation-triangle me-2"></i>
            Não foi possível carregar os jogos em destaque.
          </div>
        </div>
      `;
    }
  }

  createFeaturedGameCard(game, genres) {
    const gameImage =
      game.background_image || Templates.getFallbackImage(game.name);
    const metacritic = game.metacritic || null;
    const rating = Utils.formatRating(game.rating);
    const safeName = Utils.sanitizeHTML(game.name);
    const safeDescription = game.description_raw
      ? Utils.sanitizeHTML(game.description_raw.substring(0, 120)) + "..."
      : "Jogo de alta qualidade disponível no Orion Game Pass com gráficos incríveis e jogabilidade envolvente.";

    const qualityIndicator = metacritic
      ? `<span class="badge bg-success position-absolute top-0 end-0 m-2">Meta: ${metacritic}</span>`
      : "";

    return `
      <div class="col-lg-4 col-md-6">
        <div class="featured-game-card" style="opacity: 0; transform: translateY(20px); transition: all 0.6s ease-out;">
          <div class="game-image position-relative">
            <img src="${gameImage}" 
                 alt="${safeName}" 
                 onerror="this.src='${Templates.getFallbackImage(game.name)}'">
            ${qualityIndicator}
            <div class="game-overlay">
              <div class="play-button" onclick="GameApp.goToGameInCatalog('${safeName.replace(
                /'/g,
                "\\'"
              )}')">▶</div>
            </div>
          </div>
          <div class="game-info">
            <h3 class="game-title">${safeName}</h3>
            <div class="quality-info mb-2">
              <span class="badge bg-info">${rating} ★</span>
              ${
                game.ratings_count
                  ? `<small class="text-muted ms-2">${Utils.formatNumber(
                      game.ratings_count
                    )} avaliações</small>`
                  : ""
              }
            </div>
            <p class="game-description">${safeDescription}</p>
            <div class="game-tags">
              ${genres
                .map(
                  (genre) =>
                    `<span class="tag">${Utils.sanitizeHTML(genre)}</span>`
                )
                .join("")}
            </div>
            <div class="mt-3">
              <button class="btn btn-primary btn-sm me-2" onclick="GameApp.goToGameInCatalog('${safeName.replace(
                /'/g,
                "\\'"
              )}')">
                <i class="fas fa-search me-1"></i>Ver no Catálogo
              </button>
              <button class="btn btn-outline-info btn-sm" onclick="GameApp.showGameDetails(${
                game.id
              })">
                <i class="fas fa-info-circle me-1"></i>Detalhes
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  goToGameInCatalog(gameName) {
    if (
      window.location.pathname.includes("index.html") ||
      window.location.pathname === "/"
    ) {
      window.location.href = `catalogo.html?search=${encodeURIComponent(
        gameName
      )}`;
    } else {
      if (this.uiManager.elements.searchInput) {
        this.uiManager.elements.searchInput.value = gameName;
        this.stateManager.setState({ currentSearchTerm: gameName });
        const searchApiUrl = this.gameService.buildURL({ search: gameName });
        this.handleNewSearch(searchApiUrl, `Resultados para: "${gameName}"`);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  }

  setupGenreLinks() {
    const genreButtons = document.querySelectorAll(".tag");
    genreButtons.forEach((button) => {
      button.style.cursor = "pointer";
      button.addEventListener("click", () => {
        const genreText = button.textContent.trim().toLowerCase();
        const genreMap = {
          rpg: "role-playing-games-rpg",
          ação: "action",
          aventura: "adventure",
          corrida: "racing",
          multiplayer: "action",
          estratégia: "strategy",
          simulação: "simulation",
          esportes: "sports",
        };

        const genre = genreMap[genreText] || "action";
        window.location.href = `catalogo.html?genre=${genre}`;
      });
    });
  }

  // Métodos estáticos para serem chamados pelo HTML
  static instance = null;

  static getInstance() {
    if (!GameApp.instance) {
      GameApp.instance = new GameApp();
    }
    return GameApp.instance;
  }

  static showGameDetails(gameId) {
    GameApp.getInstance().showGameDetails(gameId);
  }

  static playGame(gameName) {
    GameApp.getInstance().playGame(gameName);
  }

  static addToWishlist(gameName) {
    GameApp.getInstance().addToWishlist(gameName);
  }

  static retryLastSearch() {
    GameApp.getInstance().retryLastSearch();
  }

  static goToGameInCatalog(gameName) {
    GameApp.getInstance().goToGameInCatalog(gameName);
  }
}

// ============================================================================
// ESTILOS ADICIONAIS
// ============================================================================
const AdditionalStyles = {
  inject() {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
      .custom-card-list {
        background: var(--card-bg) !important;
        border: 2px solid var(--purple) !important;
        border-radius: var(--border-radius) !important;
        transition: var(--transition);
      }
      
      .custom-card-list:hover {
        border-color: var(--neon-cyan) !important;
        box-shadow: var(--glow) var(--neon-cyan);
        transform: translateY(-3px);
      }
      
      .custom-card-img-list {
        height: 150px;
        object-fit: cover;
        transition: var(--transition);
      }
      
      .hover-overlay {
        background: rgba(0,0,0,0.8);
        transition: var(--transition);
      }
      
      .custom-card:hover .hover-overlay {
        opacity: 1 !important;
      }
      
      .game-item {
        opacity: 0;
        transform: translateY(20px);
      }
      
      .notification-toast .toast {
        background: var(--card-bg) !important;
        border: 1px solid var(--neon-cyan) !important;
      }
      
      .modal-content {
        border: 2px solid var(--neon-cyan) !important;
        box-shadow: var(--glow) var(--neon-cyan);
      }
      
      .featured-game-card .game-info {
        padding: 20px;
      }
      
      .featured-game-card .btn {
        font-size: 0.85rem;
        padding: 6px 12px;
      }
      
      .tag {
        cursor: pointer;
        transition: var(--transition);
      }
      
      .tag:hover {
        background: var(--neon-cyan) !important;
        color: var(--black) !important;
        transform: scale(1.05);
      }
      
      .game-overlay {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        gap: 10px;
      }
      
      .play-button {
        cursor: pointer;
        transition: var(--transition);
        font-size: 2rem;
        color: white;
        text-shadow: 0 0 10px var(--neon-cyan);
      }
      
      .play-button:hover {
        transform: scale(1.2);
        color: var(--neon-cyan);
      }
      
      .quality-indicators {
        font-size: 0.8rem;
      }
      
      .quality-info {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      
      .badge.bg-success {
        background-color: #28a745 !important;
      }
      
      .badge.bg-warning {
        background-color: #ffc107 !important;
        color: #000 !important;
      }
      
      .spinner-border {
        width: 3rem;
        height: 3rem;
      }
      
      /* Fallback para modal sem Bootstrap */
      #gameDetailsModal.show {
        display: block !important;
        background: rgba(0,0,0,0.5);
      }
      
      @media (max-width: 768px) {
        .game-cards-container {
          padding: 0 10px;
        }
        
        .featured-game-card .btn {
          font-size: 0.75rem;
          padding: 4px 8px;
        }
        
        .modal-dialog {
          margin: 10px;
        }
      }
    `;
    document.head.appendChild(styleSheet);
  },
};

// ============================================================================
// FUNÇÃO DE DEBUG
// ============================================================================
window.debugGameFilters = function () {
  console.log("=== DEBUG DOS FILTROS ===");

  const gameApp = GameApp.getInstance();

  // Testar elementos HTML
  const sortSelect = document.getElementById("sortSelect");
  const platformSelect = document.getElementById("platformSelect");

  console.log("Elementos encontrados:");
  console.log("- sortSelect:", !!sortSelect, sortSelect?.value);
  console.log("- platformSelect:", !!platformSelect, platformSelect?.value);
  console.log(
    "- games container:",
    !!document.getElementById("game-cards-container")
  );

  // Testar construção de URL
  const testParams = {
    ordering: "-rating",
    platforms: "4",
    search: "cyberpunk",
  };

  const testUrl = gameApp.gameService.buildURL(testParams);
  console.log("URL de teste:", testUrl);

  // Estado atual
  const state = gameApp.stateManager.getState();
  console.log("Estado atual:", state);

  // Testar busca simples
  console.log("Testando busca básica...");
  const basicUrl = gameApp.gameService.buildURL({ ordering: "-rating" });
  gameApp.fetchAndDisplayGames(basicUrl, true);
};

// ============================================================================
// INICIALIZAÇÃO
// ============================================================================
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM carregado, iniciando aplicação...");

  try {
    AdditionalStyles.inject();

    // Aguardar elementos carregarem
    setTimeout(() => {
      const gameApp = GameApp.getInstance();
      console.log("✅ Aplicação iniciada com sucesso!");

      // Auto-debug se não houver jogos em 3 segundos (apenas em desenvolvimento)
      setTimeout(() => {
        const gamesContainer = document.getElementById("game-cards-container");
        if (gamesContainer && gamesContainer.children.length === 0) {
          console.warn("⚠️ Nenhum jogo carregado automaticamente.");
        }
      }, 3000);
    }, 200);

    // Tratamento de erros globais
    window.addEventListener("error", function (e) {
      console.error("Erro JavaScript:", e.error);

      const gameApp = GameApp.getInstance();
      if (gameApp?.uiManager) {
        gameApp.uiManager.showNotification(
          "Ocorreu um erro inesperado. Tente recarregar a página.",
          "danger"
        );
      }
    });

    // Tratamento de promessas rejeitadas
    window.addEventListener("unhandledrejection", function (e) {
      console.error("Promise rejeitada:", e.reason);

      const gameApp = GameApp.getInstance();
      if (gameApp?.uiManager) {
        gameApp.uiManager.showNotification(
          "Erro de conexão. Verifique sua internet e tente novamente.",
          "warning"
        );
      }

      e.preventDefault();
    });
  } catch (error) {
    console.error("Erro na inicialização:", error);

    // Fallback caso a aplicação não carregue
    document.body.innerHTML += `
      <div class="position-fixed top-50 start-50 translate-middle text-center bg-dark p-4 rounded" style="z-index: 9999;">
        <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
        <h4 class="text-white">Erro na Aplicação</h4>
        <p class="text-muted">Não foi possível inicializar a aplicação. Recarregue a página.</p>
        <button class="btn btn-primary" onclick="location.reload()">
          <i class="fas fa-refresh me-2"></i>Recarregar
        </button>
      </div>
    `;
  }
});

// ============================================================================
// GERENCIADOR DE TEMA
// ============================================================================
class ThemeManager {
  constructor() {
    this.init();
  }

  init() {
    // Detectar preferência do sistema ou tema salvo
    this.loadTheme();

    // Criar botão de tema
    this.createThemeToggle();

    // Escutar mudanças na preferência do sistema
    this.watchSystemTheme();
  }

  getSystemTheme() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  getCurrentTheme() {
    return document.documentElement.getAttribute("data-theme") || "dark";
  }

  loadTheme() {
    // Verificar se há tema salvo no localStorage
    const savedTheme = localStorage.getItem("orion-theme");

    if (savedTheme) {
      this.setTheme(savedTheme);
    } else {
      // Usar preferência do sistema
      const systemTheme = this.getSystemTheme();
      this.setTheme(systemTheme);
    }
  }

  setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("orion-theme", theme);

    // Atualizar meta theme-color para mobile
    this.updateMetaThemeColor(theme);

    // Disparar evento customizado para outros componentes
    window.dispatchEvent(
      new CustomEvent("themeChanged", { detail: { theme } })
    );
  }

  updateMetaThemeColor(theme) {
    let themeColorMeta = document.querySelector('meta[name="theme-color"]');

    if (!themeColorMeta) {
      themeColorMeta = document.createElement("meta");
      themeColorMeta.name = "theme-color";
      document.head.appendChild(themeColorMeta);
    }

    const color = theme === "dark" ? "#0a0a0a" : "#f8f9fa";
    themeColorMeta.content = color;
  }

  toggleTheme() {
    const currentTheme = this.getCurrentTheme();
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    this.setTheme(newTheme);

    // Feedback visual
    this.animateToggle();
  }

  animateToggle() {
    const button = document.querySelector(".theme-toggle");
    if (button) {
      button.style.transform = "scale(0.95)";
      setTimeout(() => {
        button.style.transform = "scale(1)";
      }, 150);
    }
  }

  createThemeToggle() {
    // Remover botão existente se houver
    const existingToggle = document.querySelector(".theme-toggle");
    if (existingToggle) {
      existingToggle.remove();
    }

    const themeToggle = document.createElement("button");
    themeToggle.className = "theme-toggle";
    themeToggle.setAttribute("aria-label", "Alternar tema claro/escuro");
    themeToggle.setAttribute("title", "Alternar tema");

    themeToggle.innerHTML = `
      <div class="theme-icon sun">☀️</div>
      <div class="theme-toggle-slider"></div>
      <div class="theme-icon moon">🌙</div>
    `;

    themeToggle.addEventListener("click", () => {
      this.toggleTheme();
    });

    // Adicionar ao DOM
    document.body.appendChild(themeToggle);

    // Animação de entrada
    setTimeout(() => {
      themeToggle.style.opacity = "1";
      themeToggle.style.transform = "translateY(0)";
    }, 100);
  }

  watchSystemTheme() {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    mediaQuery.addListener((e) => {
      // Só atualizar automaticamente se não há preferência salva
      if (!localStorage.getItem("orion-theme")) {
        const systemTheme = e.matches ? "dark" : "light";
        this.setTheme(systemTheme);
      }
    });
  }

  // Método para outros componentes verificarem o tema atual
  isDarkTheme() {
    return this.getCurrentTheme() === "dark";
  }

  isLightTheme() {
    return this.getCurrentTheme() === "light";
  }
}
