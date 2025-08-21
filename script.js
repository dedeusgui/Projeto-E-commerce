// Cole a sua chave da API da RAWG aqui
const apiKey = "9d8f7b3b9c054b31ae12b147798d28ca";

// --- CONFIGURAÇÕES DE FILTROS DE QUALIDADE ---
const QUALITY_FILTERS = {
  // Filtro mínimo de Metacritic (elimina jogos muito ruins)
  MIN_METACRITIC: 60,
  // Rating mínimo (1-5, elimina jogos mal avaliados)
  MIN_RATING: 3.5,
  // Número mínimo de avaliações (elimina jogos obscuros/asset flips)
  MIN_RATINGS_COUNT: 100,
  // Excluir plataformas móveis para evitar jogos casuais de baixa qualidade
  EXCLUDE_MOBILE: true,
  // Focar apenas em jogos mais recentes (últimos 15 anos)
  MIN_YEAR: 2010,
};

// --- SELETORES DE ELEMENTOS HTML ---
const gamesContainer = document.getElementById("game-cards-container");
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const categoryItems = document.querySelectorAll(".category-item");
const catalogTitle = document.getElementById("catalog-title");
const gameCountSpan = document.getElementById("game-count");
const loadingIndicator = document.getElementById("loading-indicator");
const noGamesMessage = document.getElementById("no-games-message");
const gridViewBtn = document.getElementById("grid-view");
const listViewBtn = document.getElementById("list-view");

// --- VARIÁVEIS DE ESTADO PARA PAGINAÇÃO E SCROLL ---
let currentUrl = ""; // Armazena a URL da próxima página a ser carregada
let isLoading = false; // Impede múltiplos carregamentos ao mesmo tempo
let currentViewMode = "grid"; // 'grid' ou 'list'
let currentSearchTerm = "";
let currentGenre = "popular";

// --- FUNÇÃO PARA CONSTRUIR URL COM FILTROS DE QUALIDADE ---
function buildQualityFilteredURL(baseParams = {}) {
  const params = new URLSearchParams({
    key: apiKey,
    page_size: 12,
    // Ordena por rating ponderado (combina rating e popularidade)
    ordering: "-rating,-ratings_count",
    // Data mínima para jogos mais recentes
    dates: `${
      QUALITY_FILTERS.MIN_YEAR
    }-01-01,${new Date().getFullYear()}-12-31`,
    // Rating mínimo
    rating: `${QUALITY_FILTERS.MIN_RATING},5`,
    // Metacritic mínimo
    metacritic: `${QUALITY_FILTERS.MIN_METACRITIC},100`,
    ...baseParams,
  });

  // Exclui plataformas móveis se configurado
  if (QUALITY_FILTERS.EXCLUDE_MOBILE) {
    // IDs das principais plataformas (PC, PlayStation, Xbox, Nintendo)
    params.set("platforms", "4,187,1,18,186,7,3,8,9,13,14,15,16,17,19,21");
  }

  return `https://api.rawg.io/api/games?${params.toString()}`;
}

// --- FUNÇÃO PARA FILTRAR JOGOS POR QUALIDADE (LADO CLIENTE) ---
function filterGamesByQuality(games) {
  return games.filter((game) => {
    // Filtra por número mínimo de avaliações
    if (
      game.ratings_count &&
      game.ratings_count < QUALITY_FILTERS.MIN_RATINGS_COUNT
    ) {
      return false;
    }

    // Filtra jogos sem rating
    if (!game.rating || game.rating < QUALITY_FILTERS.MIN_RATING) {
      return false;
    }

    // Filtra por Metacritic se disponível
    if (game.metacritic && game.metacritic < QUALITY_FILTERS.MIN_METACRITIC) {
      return false;
    }

    // Filtra jogos suspeitos (nomes muito genéricos ou com números aleatórios)
    const suspiciousNamePatterns = [
      /^[A-Z\s]+\d+$/i, // Nomes só com letras maiúsculas e números
      /simulator\s*\d*$/i, // Simuladores genéricos
      /\b(asset|flip|quick|simple|basic)\b/i, // Palavras comuns em asset flips
      /^\w{1,3}\s*\d+$/i, // Nomes muito curtos com números
    ];

    if (suspiciousNamePatterns.some((pattern) => pattern.test(game.name))) {
      return false;
    }

    return true;
  });
}

// --- FUNÇÃO PARA CRIAR CARD DE JOGO (COM INDICADORES DE QUALIDADE) ---
function createGameCard(game, index) {
  const releaseDate = game.released
    ? new Date(game.released).toLocaleDateString("pt-BR")
    : "Não informado";
  const rating = game.rating ? game.rating.toFixed(1) : "N/A";
  const metacritic = game.metacritic || null;
  const ratingsCount = game.ratings_count
    ? game.ratings_count.toLocaleString("pt-BR")
    : "N/A";

  const genres = game.genres
    ? game.genres
        .slice(0, 2)
        .map((g) => g.name)
        .join(", ")
    : "Variado";
  const platforms = game.platforms
    ? game.platforms
        .slice(0, 3)
        .map((p) => p.platform.name)
        .join(", ")
    : "Multiplataforma";

  // Tratamento de imagem com fallback
  const gameImage =
    game.background_image ||
    `https://via.placeholder.com/400x250/1a0033/00ffff?text=${encodeURIComponent(
      game.name
    )}`;

  // Badge de qualidade baseado no Metacritic
  let qualityBadge = "";
  if (metacritic) {
    let badgeClass = "bg-success";
    let qualityText = "Excelente";

    if (metacritic >= 90) {
      badgeClass = "bg-success";
      qualityText = "Obra-prima";
    } else if (metacritic >= 80) {
      badgeClass = "bg-success";
      qualityText = "Excelente";
    } else if (metacritic >= 70) {
      badgeClass = "bg-info";
      qualityText = "Muito Bom";
    } else if (metacritic >= 60) {
      badgeClass = "bg-warning";
      qualityText = "Bom";
    }

    qualityBadge = `<span class="badge ${badgeClass} ms-1">${qualityText}</span>`;
  }

  if (currentViewMode === "list") {
    return `
      <div class="col-12 game-item" data-index="${index}">
        <div class="card custom-card-list h-100">
          <div class="row g-0 h-100">
            <div class="col-md-3">
              <img src="${gameImage}" 
                   class="img-fluid rounded-start custom-card-img-list" 
                   alt="${game.name}"
                   onerror="this.src='https://via.placeholder.com/400x250/1a0033/00ffff?text=Jogo'">
            </div>
            <div class="col-md-9">
              <div class="card-body d-flex flex-column h-100">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <h5 class="card-title custom-card-title mb-0">${
                    game.name
                  }</h5>
                  <div class="d-flex align-items-center">
                    <span class="badge bg-info">${rating} ★</span>
                    ${qualityBadge}
                  </div>
                </div>
                
                <div class="quality-indicators mb-2">
                  ${
                    metacritic
                      ? `<small class="text-info me-3"><i class="fas fa-trophy me-1"></i>Metacritic: ${metacritic}</small>`
                      : ""
                  }
                  <small class="text-muted"><i class="fas fa-users me-1"></i>${ratingsCount} avaliações</small>
                </div>
                
                <p class="card-text text-muted small mb-2">
                  <i class="fas fa-calendar me-1"></i>Lançamento: ${releaseDate}
                </p>
                <p class="card-text text-muted small mb-2">
                  <i class="fas fa-gamepad me-1"></i>Gêneros: ${genres}
                </p>
                <p class="card-text text-muted small mb-3">
                  <i class="fas fa-desktop me-1"></i>Plataformas: ${platforms}
                </p>
                <div class="mt-auto d-flex justify-content-between align-items-end">
                  <div class="custom-card-price">Disponível no Game Pass</div>
                  <button class="btn btn-sm btn-outline-info" onclick="showGameDetails(${
                    game.id
                  })">
                    <i class="fas fa-info-circle me-1"></i>Detalhes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  } else {
    return `
      <div class="col-xl-3 col-lg-4 col-md-6 col-sm-12 game-item" data-index="${index}">
        <div class="card custom-card h-100">
          <div class="position-relative">
            <img src="${gameImage}" 
                 class="card-img-top custom-card-img" 
                 alt="${game.name}"
                 onerror="this.src='https://via.placeholder.com/400x250/1a0033/00ffff?text=Jogo'">
            <div class="position-absolute top-0 end-0 m-2">
              <span class="badge bg-info">${rating} ★</span>
              ${qualityBadge}
            </div>
            ${
              metacritic
                ? `<div class="position-absolute top-0 start-0 m-2">
              <span class="badge bg-dark">Meta: ${metacritic}</span>
            </div>`
                : ""
            }
            <div class="card-img-overlay d-flex align-items-center justify-content-center opacity-0 hover-overlay">
              <button class="btn btn-primary btn-lg" onclick="showGameDetails(${
                game.id
              })">
                <i class="fas fa-play me-2"></i>Ver Detalhes
              </button>
            </div>
          </div>
          <div class="card-body d-flex flex-column">
            <h5 class="card-title custom-card-title">${game.name}</h5>
            <div class="quality-info mb-2">
              <small class="text-muted"><i class="fas fa-users me-1"></i>${ratingsCount} avaliações</small>
            </div>
            <p class="card-text small text-muted mb-2">
              <i class="fas fa-calendar me-1"></i>${releaseDate}
            </p>
            <p class="card-text small text-muted mb-3">
              <i class="fas fa-gamepad me-1"></i>${genres}
            </p>
            <div class="mt-auto">
              <div class="custom-card-price text-end">Disponível</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

// --- FUNÇÃO PARA BUSCAR E EXIBIR JOGOS (MELHORADA COM FILTROS) ---
// --- FUNÇÃO PARA BUSCAR E EXIBIR JOGOS (CORREÇÃO DO CONTADOR) ---
function fetchAndDisplayGames(apiUrl, isNewSearch = false) {
  if (isLoading) return;
  isLoading = true;

  // Mostra indicador de carregamento
  if (loadingIndicator) {
    loadingIndicator.style.display = "block";
  }

  // Esconde mensagem de "não encontrado" se estiver visível
  if (noGamesMessage) {
    noGamesMessage.style.display = "none";
  }

  // Se for uma nova busca, limpa o container
  if (isNewSearch) {
    gamesContainer.innerHTML = "";
    if (gameCountSpan) {
      gameCountSpan.textContent = "";
    }
  }

  fetch(apiUrl)
    .then((response) => {
      if (!response.ok) throw new Error(`Erro na API: ${response.status}`);
      return response.json();
    })
    .then((data) => {
      // Filtra jogos por qualidade no lado cliente
      const filteredGames = filterGamesByQuality(data.results || []);

      // CORREÇÃO: Atualiza o contador com o TOTAL de jogos encontrados pela API
      // não apenas os que aparecem na tela atual
      if (isNewSearch && gameCountSpan) {
        // Usa o 'count' total da API, não o número de jogos filtrados da página atual
        const totalGames = data.count || 0;
        gameCountSpan.textContent = `(${totalGames.toLocaleString(
          "pt-BR"
        )} jogos de qualidade encontrados)`;
      }

      // Salva a URL da PRÓXIMA página de resultados
      currentUrl = data.next;

      // Se não há jogos e é nova busca, mostra mensagem
      if (filteredGames.length === 0 && isNewSearch) {
        if (noGamesMessage) {
          noGamesMessage.style.display = "block";
        } else {
          gamesContainer.innerHTML = `
            <div class="col-12">
              <div class="text-center py-5">
                <i class="fas fa-gamepad fa-4x text-muted mb-3"></i>
                <h3 class="text-muted">Nenhum jogo de qualidade encontrado</h3>
                <p class="text-muted">Tente buscar por outro termo ou categoria. Só mostramos jogos com boa avaliação!</p>
              </div>
            </div>
          `;
        }
      }

      // Adiciona os novos cards ao container
      filteredGames.forEach((game, index) => {
        const gameCardHTML = createGameCard(game, index);
        gamesContainer.innerHTML += gameCardHTML;
      });

      // Adiciona animações aos novos cards
      addCardAnimations();

      isLoading = false;
      if (loadingIndicator) {
        loadingIndicator.style.display = "none";
      }
    })
    .catch((error) => {
      console.error("Erro ao buscar os jogos:", error);

      if (isNewSearch) {
        gamesContainer.innerHTML = `
          <div class="col-12">
            <div class="alert alert-danger text-center">
              <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
              <h4>Ops! Algo deu errado</h4>
              <p class="mb-3">Não foi possível carregar os jogos. Verifique sua conexão e tente novamente.</p>
              <button class="btn btn-outline-light" onclick="retryLastSearch()">
                <i class="fas fa-redo me-2"></i>Tentar Novamente
              </button>
            </div>
          </div>
        `;
      }

      isLoading = false;
      if (loadingIndicator) {
        loadingIndicator.style.display = "none";
      }
    });
}
// --- FUNÇÃO PARA ADICIONAR ANIMAÇÕES AOS CARDS ---
function addCardAnimations() {
  const newCards = document.querySelectorAll(".game-item:not(.animated)");
  newCards.forEach((card, index) => {
    card.classList.add("animated");
    card.style.opacity = "0";
    card.style.transform = "translateY(20px)";

    setTimeout(() => {
      card.style.transition = "all 0.6s ease-out";
      card.style.opacity = "1";
      card.style.transform = "translateY(0)";
    }, index * 100);
  });
}

// --- FUNÇÃO PARA LIDAR COM NOVA BUSCA ---
function handleNewSearch(url, title) {
  if (catalogTitle) {
    catalogTitle.firstChild.textContent = title + " ";
  }
  fetchAndDisplayGames(url, true);
}

// --- FUNÇÃO PARA TENTAR NOVAMENTE A ÚLTIMA BUSCA ---
function retryLastSearch() {
  if (currentSearchTerm) {
    const searchApiUrl = buildQualityFilteredURL({ search: currentSearchTerm });
    handleNewSearch(searchApiUrl, `Resultados para: "${currentSearchTerm}"`);
  } else {
    loadCategoryGames(currentGenre);
  }
}

// --- FUNÇÃO PARA CARREGAR JOGOS POR CATEGORIA (COM FILTROS DE QUALIDADE) ---
function loadCategoryGames(genre) {
  currentGenre = genre;
  currentSearchTerm = "";

  let apiUrl = "";
  let genreName = "";

  // Encontra o nome da categoria
  const categoryElement = document.querySelector(`[data-genre="${genre}"]`);
  if (categoryElement) {
    genreName = categoryElement.textContent;
  }

  if (genre === "popular") {
    // Para jogos populares, usa ordering por rating e popularidade
    apiUrl = buildQualityFilteredURL({
      ordering: "-rating,-ratings_count,-added",
    });
  } else {
    // Para gêneros específicos
    apiUrl = buildQualityFilteredURL({
      genres: genre,
      ordering: "-rating,-metacritic",
    });
  }

  handleNewSearch(apiUrl, genreName || "Jogos de Qualidade");
}

// --- FUNÇÃO PARA ALTERNAR ENTRE VISUALIZAÇÕES ---
function switchViewMode(mode) {
  currentViewMode = mode;

  // Atualiza botões ativos
  if (gridViewBtn && listViewBtn) {
    gridViewBtn.classList.toggle("btn-info", mode === "grid");
    gridViewBtn.classList.toggle("btn-outline-info", mode !== "grid");
    listViewBtn.classList.toggle("btn-info", mode === "list");
    listViewBtn.classList.toggle("btn-outline-info", mode !== "list");
  }

  // Recarrega os jogos na nova visualização
  if (currentSearchTerm) {
    const searchApiUrl = buildQualityFilteredURL({ search: currentSearchTerm });
    handleNewSearch(searchApiUrl, `Resultados para: "${currentSearchTerm}"`);
  } else {
    loadCategoryGames(currentGenre);
  }
}

// --- FUNÇÃO PARA MOSTRAR DETALHES DO JOGO ---
function showGameDetails(gameId) {
  // Cria modal de detalhes
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

  // Remove modal existente se houver
  const existingModal = document.getElementById("gameDetailsModal");
  if (existingModal) {
    existingModal.remove();
  }

  // Adiciona novo modal
  document.body.insertAdjacentHTML("beforeend", modalHTML);

  // Mostra o modal
  const modal = new bootstrap.Modal(
    document.getElementById("gameDetailsModal")
  );
  modal.show();

  // Busca detalhes do jogo
  fetch(`https://api.rawg.io/api/games/${gameId}?key=${apiKey}`)
    .then((response) => response.json())
    .then((game) => {
      const modalTitle = document.querySelector(
        "#gameDetailsModal .modal-title"
      );
      const modalBody = document.querySelector("#gameDetailsModal .modal-body");

      modalTitle.innerHTML = `<i class="fas fa-gamepad me-2"></i>${game.name}`;

      const genres = game.genres
        ? game.genres.map((g) => g.name).join(", ")
        : "N/A";
      const platforms = game.platforms
        ? game.platforms
            .slice(0, 4)
            .map((p) => p.platform.name)
            .join(", ")
        : "N/A";
      const developers = game.developers
        ? game.developers.map((d) => d.name).join(", ")
        : "N/A";
      const publishers = game.publishers
        ? game.publishers.map((p) => p.name).join(", ")
        : "N/A";
      const releaseDate = game.released
        ? new Date(game.released).toLocaleDateString("pt-BR")
        : "N/A";
      const rating = game.rating ? game.rating.toFixed(1) : "N/A";
      const metacritic = game.metacritic || "N/A";
      const ratingsCount = game.ratings_count
        ? game.ratings_count.toLocaleString("pt-BR")
        : "N/A";

      modalBody.innerHTML = `
        <div class="row">
          <div class="col-md-4">
            <img src="${
              game.background_image ||
              "https://via.placeholder.com/400x600/1a0033/00ffff?text=Jogo"
            }" 
                 class="img-fluid rounded" alt="${game.name}">
          </div>
          <div class="col-md-8">
            <div class="game-details">
              <div class="mb-3">
                <h6 class="text-info">Avaliação de Qualidade:</h6>
                <div class="d-flex align-items-center gap-3">
                  <span class="badge bg-primary fs-6">${rating} ★</span>
                  ${
                    metacritic !== "N/A"
                      ? `<span class="badge bg-success fs-6">Metacritic: ${metacritic}</span>`
                      : ""
                  }
                  <small class="text-muted">${ratingsCount} avaliações</small>
                </div>
              </div>
              
              <div class="mb-3">
                <h6 class="text-info">Data de Lançamento:</h6>
                <p class="mb-0">${releaseDate}</p>
              </div>
              
              <div class="mb-3">
                <h6 class="text-info">Gêneros:</h6>
                <p class="mb-0">${genres}</p>
              </div>
              
              <div class="mb-3">
                <h6 class="text-info">Plataformas:</h6>
                <p class="mb-0">${platforms}</p>
              </div>
              
              <div class="mb-3">
                <h6 class="text-info">Desenvolvedores:</h6>
                <p class="mb-0">${developers}</p>
              </div>
              
              <div class="mb-3">
                <h6 class="text-info">Distribuidores:</h6>
                <p class="mb-0">${publishers}</p>
              </div>
              
              ${
                game.description_raw
                  ? `
                <div class="mb-3">
                  <h6 class="text-info">Descrição:</h6>
                  <p class="text-muted small" style="max-height: 150px; overflow-y: auto;">
                    ${game.description_raw.substring(0, 500)}${
                      game.description_raw.length > 500 ? "..." : ""
                    }
                  </p>
                </div>
              `
                  : ""
              }
            </div>
          </div>
        </div>
        
        <div class="text-center mt-4">
          <button class="btn btn-success btn-lg" onclick="playGame('${
            game.name
          }')">
            <i class="fas fa-play me-2"></i>Jogar Agora
          </button>
          <button class="btn btn-outline-info ms-2" onclick="addToWishlist('${
            game.name
          }')">
            <i class="fas fa-heart me-2"></i>Favoritar
          </button>
        </div>
      `;
    })
    .catch((error) => {
      console.error("Erro ao carregar detalhes:", error);
      const modalBody = document.querySelector("#gameDetailsModal .modal-body");
      modalBody.innerHTML = `
        <div class="alert alert-danger text-center">
          <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
          <h5>Erro ao carregar detalhes</h5>
          <p class="mb-0">Não foi possível carregar os detalhes do jogo. Tente novamente.</p>
        </div>
      `;
    });
}

// --- FUNÇÃO PARA "JOGAR" JOGO ---
function playGame(gameName) {
  // Simula início do jogo
  const modal = bootstrap.Modal.getInstance(
    document.getElementById("gameDetailsModal")
  );
  modal.hide();

  // Mostra notificação
  showNotification(`Iniciando ${gameName}...`, "success");

  setTimeout(() => {
    showNotification("Jogo disponível no seu Game Pass!", "info");
  }, 2000);
}

// --- FUNÇÃO PARA ADICIONAR À WISHLIST ---
function addToWishlist(gameName) {
  showNotification(`${gameName} foi adicionado aos seus favoritos!`, "success");
}

// --- FUNÇÃO PARA MOSTRAR NOTIFICAÇÕES ---
function showNotification(message, type = "info") {
  const notificationHTML = `
    <div class="position-fixed top-0 end-0 p-3" style="z-index: 2000;">
      <div class="toast show" role="alert">
        <div class="toast-header bg-${type} text-white">
          <i class="fas fa-info-circle me-2"></i>
          <strong class="me-auto">Orion Game Pass</strong>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
        </div>
        <div class="toast-body bg-dark text-light">
          ${message}
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", notificationHTML);

  // Remove após 5 segundos
  setTimeout(() => {
    const notification = document.querySelector(".toast.show");
    if (notification) {
      notification.remove();
    }
  }, 5000);
}

// --- EVENTOS DE BUSCA ---
if (searchForm) {
  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const searchTerm = searchInput.value.trim();
    if (searchTerm) {
      currentSearchTerm = searchTerm;
      const searchApiUrl = buildQualityFilteredURL({ search: searchTerm });
      handleNewSearch(searchApiUrl, `Resultados para: "${searchTerm}"`);
    }
  });
}

// --- EVENTOS DE CATEGORIA ---
categoryItems.forEach((item) => {
  item.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    categoryItems.forEach((i) => i.classList.remove("active"));
    item.classList.add("active");

    const genre = item.getAttribute("data-genre");
    loadCategoryGames(genre);
  });
});

// --- EVENTOS DE VISUALIZAÇÃO ---
if (gridViewBtn) {
  gridViewBtn.addEventListener("click", () => switchViewMode("grid"));
}

if (listViewBtn) {
  listViewBtn.addEventListener("click", () => switchViewMode("list"));
}

// --- LÓGICA DO SCROLL INFINITO ---
let scrollTimeout;
window.addEventListener("scroll", () => {
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    if (
      window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 1000 &&
      !isLoading &&
      currentUrl
    ) {
      fetchAndDisplayGames(currentUrl);
    }
  }, 150);
});

// --- CARREGAMENTO INICIAL ---
function loadInitialGames() {
  const popularGamesUrl = buildQualityFilteredURL({
    ordering: "-rating,-ratings_count,-added",
  });
  handleNewSearch(popularGamesUrl, "Jogos Populares de Qualidade");
}

// --- FUNÇÃO PARA BUSCAR JOGOS EM DESTAQUE (COM FILTROS) ---
function loadFeaturedGames() {
  const featuredGamesContainer = document.querySelector(
    ".featured-games-section .row"
  );
  if (!featuredGamesContainer) return;

  // Lista de jogos específicos para destacar (jogos conhecidamente bons)
  const featuredGameNames = [
    "Cyberpunk 2077",
    "The Witcher 3",
    "Red Dead Redemption 2",
    "God of War",
    "Horizon Zero Dawn",
  ];

  featuredGamesContainer.innerHTML = `
    <div class="col-12 text-center mb-4">
      <div class="spinner-border text-info" role="status">
        <span class="visually-hidden">Carregando jogos em destaque...</span>
      </div>
    </div>
  `;

  // Busca jogos em destaque com filtros de qualidade
  const searchPromises = featuredGameNames.map((gameName) => {
    const url = buildQualityFilteredURL({
      search: encodeURIComponent(gameName),
      page_size: 1,
    });

    return fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const games = filterGamesByQuality(data.results || []);
        return games[0] || null;
      })
      .catch(() => null);
  });

  Promise.all(searchPromises)
    .then((games) => {
      featuredGamesContainer.innerHTML = "";

      games.forEach((game, index) => {
        if (game) {
          const genres = game.genres
            ? game.genres.slice(0, 2).map((g) => g.name)
            : ["RPG", "Ação"];
          const gameCard = createFeaturedGameCard(game, genres);
          featuredGamesContainer.innerHTML += gameCard;
        }
      });

      // Adiciona animações
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
    })
    .catch((error) => {
      console.error("Erro ao carregar jogos em destaque:", error);
      featuredGamesContainer.innerHTML = `
      <div class="col-12 text-center">
        <div class="alert alert-warning">
          <i class="fas fa-exclamation-triangle me-2"></i>
          Não foi possível carregar os jogos em destaque.
        </div>
      </div>
    `;
    });
}

// --- FUNÇÃO PARA CRIAR CARD DE JOGO EM DESTAQUE ---
function createFeaturedGameCard(game, genres) {
  const gameImage =
    game.background_image ||
    `https://via.placeholder.com/400x250/1a0033/00ffff?text=${encodeURIComponent(
      game.name
    )}`;

  const metacritic = game.metacritic || null;
  const rating = game.rating ? game.rating.toFixed(1) : "N/A";

  // Badge de qualidade para jogos em destaque
  let qualityIndicator = "";
  if (metacritic) {
    qualityIndicator = `<span class="badge bg-success position-absolute top-0 end-0 m-2">Meta: ${metacritic}</span>`;
  }

  return `
    <div class="col-lg-4 col-md-6">
      <div class="featured-game-card" style="opacity: 0; transform: translateY(20px); transition: all 0.6s ease-out;">
        <div class="game-image position-relative">
          <img src="${gameImage}" alt="${
    game.name
  }" onerror="this.src='https://via.placeholder.com/400x250/1a0033/00ffff?text=Jogo'">
          ${qualityIndicator}
          <div class="game-overlay">
            <div class="play-button" onclick="goToGameInCatalog('${
              game.name
            }')">▶</div>
          </div>
        </div>
        <div class="game-info">
          <h3 class="game-title">${game.name}</h3>
          <div class="quality-info mb-2">
            <span class="badge bg-info">${rating} ★</span>
            ${
              game.ratings_count
                ? `<small class="text-muted ms-2">${game.ratings_count.toLocaleString(
                    "pt-BR"
                  )} avaliações</small>`
                : ""
            }
          </div>
          <p class="game-description">
            ${
              game.description_raw
                ? game.description_raw.substring(0, 120) + "..."
                : "Jogo de alta qualidade disponível no Orion Game Pass com gráficos incríveis e jogabilidade envolvente."
            }
          </p>
          <div class="game-tags">
            ${genres
              .map((genre) => `<span class="tag">${genre}</span>`)
              .join("")}
          </div>
          <div class="mt-3">
            <button class="btn btn-primary btn-sm me-2" onclick="goToGameInCatalog('${
              game.name
            }')">
              <i class="fas fa-search me-1"></i>Ver no Catálogo
            </button>
            <button class="btn btn-outline-info btn-sm" onclick="showGameDetails(${
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

// --- FUNÇÃO PARA IR PARA JOGO ESPECÍFICO NO CATÁLOGO ---
function goToGameInCatalog(gameName) {
  // Se estivermos na página inicial, redireciona para o catálogo com busca
  if (
    window.location.pathname.includes("index.html") ||
    window.location.pathname === "/"
  ) {
    window.location.href = `catalogo.html?search=${encodeURIComponent(
      gameName
    )}`;
  } else {
    // Se já estivermos no catálogo, faz a busca diretamente
    if (searchInput) {
      searchInput.value = gameName;
      currentSearchTerm = gameName;
      const searchApiUrl = buildQualityFilteredURL({
        search: encodeURIComponent(gameName),
      });
      handleNewSearch(searchApiUrl, `Resultados para: "${gameName}"`);

      // Scroll para o topo
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }
}

// --- FUNÇÃO PARA LIDAR COM PARÂMETROS DA URL ---
function handleURLParameters() {
  const urlParams = new URLSearchParams(window.location.search);
  const searchParam = urlParams.get("search");
  const genreParam = urlParams.get("genre");

  if (searchParam && searchInput) {
    // Se há um parâmetro de busca, executa a busca com filtros
    searchInput.value = searchParam;
    currentSearchTerm = searchParam;
    const searchApiUrl = buildQualityFilteredURL({
      search: encodeURIComponent(searchParam),
    });
    handleNewSearch(searchApiUrl, `Resultados para: "${searchParam}"`);
    return true;
  } else if (genreParam && categoryItems.length > 0) {
    // Se há um parâmetro de gênero, seleciona a categoria
    const categoryElement = document.querySelector(
      `[data-genre="${genreParam}"]`
    );
    if (categoryElement) {
      categoryItems.forEach((item) => item.classList.remove("active"));
      categoryElement.classList.add("active");
      loadCategoryGames(genreParam);
      return true;
    }
  }

  return false;
}

// --- FUNÇÃO PARA DESTACAR GÊNEROS NA HOME ---
function setupGenreLinks() {
  // Adiciona links funcionais para os gêneros na página inicial
  const genreButtons = document.querySelectorAll(".tag");
  genreButtons.forEach((button) => {
    button.style.cursor = "pointer";
    button.addEventListener("click", function () {
      const genreText = this.textContent.trim().toLowerCase();
      let genreMap = {
        rpg: "role-playing-games-rpg",
        ação: "action",
        aventura: "adventure",
        corrida: "racing",
        multiplayer: "action", // fallback para multiplayer
        estratégia: "strategy",
        simulação: "simulation",
        esportes: "sports",
      };

      const genre = genreMap[genreText] || "action";
      window.location.href = `catalogo.html?genre=${genre}`;
    });
  });
}

// --- FUNÇÃO PARA ADICIONAR FILTRO PERSONALIZADO DE QUALIDADE ---
function addQualityFilterUI() {
  const filterContainer = document.querySelector(".filters-section");
  if (!filterContainer) return;

  const qualityFilterHTML = `
    <div class="quality-filter-section mb-3">
      <h6 class="text-info mb-2">
        <i class="fas fa-trophy me-2"></i>Filtros de Qualidade
      </h6>
      <div class="row g-2">
        <div class="col-md-3">
          <label class="form-label small">Metacritic Mín:</label>
          <select class="form-select form-select-sm" id="metacritic-filter">
            <option value="60">60+ (Bom)</option>
            <option value="70">70+ (Muito Bom)</option>
            <option value="80" selected>80+ (Excelente)</option>
            <option value="90">90+ (Obra-prima)</option>
          </select>
        </div>
        <div class="col-md-3">
          <label class="form-label small">Rating Mín:</label>
          <select class="form-select form-select-sm" id="rating-filter">
            <option value="3.0">3.0+</option>
            <option value="3.5" selected>3.5+</option>
            <option value="4.0">4.0+</option>
            <option value="4.5">4.5+</option>
          </select>
        </div>
        <div class="col-md-3">
          <label class="form-label small">Avaliações Mín:</label>
          <select class="form-select form-select-sm" id="ratings-count-filter">
            <option value="50">50+</option>
            <option value="100" selected>100+</option>
            <option value="500">500+</option>
            <option value="1000">1000+</option>
          </select>
        </div>
        <div class="col-md-3">
          <button class="btn btn-info btn-sm w-100 mt-4" onclick="applyQualityFilters()">
            <i class="fas fa-filter me-1"></i>Aplicar Filtros
          </button>
        </div>
      </div>
    </div>
  `;

  filterContainer.insertAdjacentHTML("afterbegin", qualityFilterHTML);
}

// --- FUNÇÃO PARA APLICAR FILTROS DE QUALIDADE PERSONALIZADOS ---
function applyQualityFilters() {
  const metacriticSelect = document.getElementById("metacritic-filter");
  const ratingSelect = document.getElementById("rating-filter");
  const ratingsCountSelect = document.getElementById("ratings-count-filter");

  if (metacriticSelect && ratingSelect && ratingsCountSelect) {
    QUALITY_FILTERS.MIN_METACRITIC = parseInt(metacriticSelect.value);
    QUALITY_FILTERS.MIN_RATING = parseFloat(ratingSelect.value);
    QUALITY_FILTERS.MIN_RATINGS_COUNT = parseInt(ratingsCountSelect.value);

    // Recarrega os jogos com os novos filtros
    if (currentSearchTerm) {
      const searchApiUrl = buildQualityFilteredURL({
        search: currentSearchTerm,
      });
      handleNewSearch(
        searchApiUrl,
        `Resultados filtrados para: "${currentSearchTerm}"`
      );
    } else {
      loadCategoryGames(currentGenre);
    }

    showNotification("Filtros de qualidade aplicados!", "success");
  }
}

// --- INICIALIZAÇÃO ---
document.addEventListener("DOMContentLoaded", function () {
  // Carrega jogos em destaque se estivermos na página inicial
  if (document.querySelector(".featured-games-section")) {
    loadFeaturedGames();
    setupGenreLinks();
  }

  // Adiciona filtros de qualidade personalizados
  addQualityFilterUI();

  // Carrega jogos do catálogo e verifica parâmetros da URL
  if (gamesContainer) {
    // Primeiro verifica se há parâmetros na URL
    if (!handleURLParameters()) {
      // Se não há parâmetros, carrega jogos populares de qualidade
      loadInitialGames();
    }
  }

  // Adiciona estilos CSS adicionais para as novas funcionalidades
  const additionalStyles = `
    <style>
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
      
      .toast {
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
      }
      
      .play-button:hover {
        transform: scale(1.2);
      }
      
      .quality-indicators {
        font-size: 0.8rem;
      }
      
      .quality-info {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      
      .quality-filter-section {
        background: rgba(26, 0, 51, 0.3);
        border: 1px solid var(--purple);
        border-radius: var(--border-radius);
        padding: 15px;
      }
      
      .quality-filter-section .form-select {
        background-color: var(--card-bg);
        border-color: var(--purple);
        color: white;
      }
      
      .quality-filter-section .form-select:focus {
        border-color: var(--neon-cyan);
        box-shadow: 0 0 0 0.2rem rgba(0, 255, 255, 0.25);
      }
      
      .badge.bg-success {
        background-color: #28a745 !important;
      }
      
      .badge.bg-warning {
        background-color: #ffc107 !important;
        color: #000 !important;
      }
    </style>
  `;

  document.head.insertAdjacentHTML("beforeend", additionalStyles);
});

// --- TRATAMENTO DE ERROS GLOBAIS ---
window.addEventListener("error", function (e) {
  console.error("Erro JavaScript:", e.error);
});

// --- FUNÇÃO PARA DETECTAR DISPOSITIVOS MÓVEIS ---
function isMobile() {
  return window.innerWidth <= 768;
}

// --- OTIMIZAÇÃO PARA MOBILE ---
if (isMobile()) {
  // Reduz o número de jogos carregados por vez em mobile
  const originalApiKey = apiKey;
  // Você pode ajustar o page_size para mobile aqui se necessário
}
