// Cole a sua chave da API da RAWG aqui
const apiKey = "9d8f7b3b9c054b31ae12b147798d28ca";

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

// --- FUNÇÃO PARA CRIAR CARD DE JOGO ---
function createGameCard(game, index) {
  const releaseDate = game.released
    ? new Date(game.released).toLocaleDateString("pt-BR")
    : "Não informado";
  const rating = game.rating ? game.rating.toFixed(1) : "N/A";
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
                  <h5 class="card-title custom-card-title mb-0">${game.name}</h5>
                  <span class="badge bg-info">${rating} ★</span>
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
                  <button class="btn btn-sm btn-outline-info" onclick="showGameDetails(${game.id})">
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
            </div>
            <div class="card-img-overlay d-flex align-items-center justify-content-center opacity-0 hover-overlay">
              <button class="btn btn-primary btn-lg" onclick="showGameDetails(${game.id})">
                <i class="fas fa-play me-2"></i>Ver Detalhes
              </button>
            </div>
          </div>
          <div class="card-body d-flex flex-column">
            <h5 class="card-title custom-card-title">${game.name}</h5>
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

// --- FUNÇÃO PARA BUSCAR E EXIBIR JOGOS (MELHORADA) ---
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
      // Atualiza o contador de jogos (apenas na primeira página)
      if (isNewSearch && gameCountSpan) {
        gameCountSpan.textContent = `(${data.count || 0} jogos encontrados)`;
      }

      // Salva a URL da PRÓXIMA página de resultados
      currentUrl = data.next;
      const games = data.results || [];

      // Se não há jogos e é nova busca, mostra mensagem
      if (games.length === 0 && isNewSearch) {
        if (noGamesMessage) {
          noGamesMessage.style.display = "block";
        } else {
          gamesContainer.innerHTML = `
            <div class="col-12">
              <div class="text-center py-5">
                <i class="fas fa-gamepad fa-4x text-muted mb-3"></i>
                <h3 class="text-muted">Nenhum jogo encontrado</h3>
                <p class="text-muted">Tente buscar por outro termo ou categoria.</p>
              </div>
            </div>
          `;
        }
      }

      // Adiciona os novos cards ao container
      games.forEach((game, index) => {
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
    const searchApiUrl = `https://api.rawg.io/api/games?key=${apiKey}&search=${currentSearchTerm}&page_size=12`;
    handleNewSearch(searchApiUrl, `Resultados para: "${currentSearchTerm}"`);
  } else {
    loadCategoryGames(currentGenre);
  }
}

// --- FUNÇÃO PARA CARREGAR JOGOS POR CATEGORIA ---
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
    apiUrl = `https://api.rawg.io/api/games?key=${apiKey}&dates=2023-01-01,2024-12-31&ordering=-rating&page_size=12`;
  } else {
    apiUrl = `https://api.rawg.io/api/games?key=${apiKey}&genres=${genre}&page_size=12`;
  }

  handleNewSearch(apiUrl, genreName || "Jogos");
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
    const searchApiUrl = `https://api.rawg.io/api/games?key=${apiKey}&search=${currentSearchTerm}&page_size=12`;
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
                <h6 class="text-info">Avaliação:</h6>
                <div class="d-flex align-items-center gap-3">
                  <span class="badge bg-primary fs-6">${rating} ★</span>
                  ${
                    metacritic !== "N/A"
                      ? `<span class="badge bg-success fs-6">Metacritic: ${metacritic}</span>`
                      : ""
                  }
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
      const searchApiUrl = `https://api.rawg.io/api/games?key=${apiKey}&search=${searchTerm}&page_size=12`;
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
  const popularGamesUrl = `https://api.rawg.io/api/games?key=${apiKey}&dates=2023-01-01,2024-12-31&ordering=-rating&page_size=12`;
  handleNewSearch(popularGamesUrl, "Populares");
}

// --- FUNÇÃO PARA BUSCAR JOGOS EM DESTAQUE ---
function loadFeaturedGames() {
  const featuredGamesContainer = document.querySelector(
    ".featured-games-section .row"
  );
  if (!featuredGamesContainer) return;

  // Lista de jogos específicos para destacar
  const featuredGameNames = [
    "Cyberpunk 2077",
    "The Witcher 3",
    "Red Dead Redemption 2",
  ];

  featuredGamesContainer.innerHTML = `
    <div class="col-12 text-center mb-4">
      <div class="spinner-border text-info" role="status">
        <span class="visually-hidden">Carregando jogos em destaque...</span>
      </div>
    </div>
  `;

  // Busca jogos em destaque
  const searchPromises = featuredGameNames.map((gameName) =>
    fetch(
      `https://api.rawg.io/api/games?key=${apiKey}&search=${encodeURIComponent(
        gameName
      )}&page_size=1`
    )
      .then((response) => response.json())
      .then((data) => data.results[0])
      .catch(() => null)
  );

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

  return `
    <div class="col-lg-4 col-md-6">
      <div class="featured-game-card" style="opacity: 0; transform: translateY(20px); transition: all 0.6s ease-out;">
        <div class="game-image">
          <img src="${gameImage}" alt="${
    game.name
  }" onerror="this.src='https://via.placeholder.com/400x250/1a0033/00ffff?text=Jogo'">
          <div class="game-overlay">
            <div class="play-button" onclick="goToGameInCatalog('${
              game.name
            }')">▶</div>
          </div>
        </div>
        <div class="game-info">
          <h3 class="game-title">${game.name}</h3>
          <p class="game-description">
            ${
              game.description_raw
                ? game.description_raw.substring(0, 100) + "..."
                : "Jogo disponível no Orion Game Pass com gráficos incríveis e jogabilidade envolvente."
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
      const searchApiUrl = `https://api.rawg.io/api/games?key=${apiKey}&search=${encodeURIComponent(
        gameName
      )}&page_size=12`;
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
    // Se há um parâmetro de busca, executa a busca
    searchInput.value = searchParam;
    currentSearchTerm = searchParam;
    const searchApiUrl = `https://api.rawg.io/api/games?key=${apiKey}&search=${encodeURIComponent(
      searchParam
    )}&page_size=12`;
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
      };

      const genre = genreMap[genreText] || "action";
      window.location.href = `catalogo.html?genre=${genre}`;
    });
  });
}

// --- INICIALIZAÇÃO ---
document.addEventListener("DOMContentLoaded", function () {
  // Carrega jogos em destaque se estivermos na página inicial
  if (document.querySelector(".featured-games-section")) {
    loadFeaturedGames();
    setupGenreLinks();
  }

  // Carrega jogos do catálogo e verifica parâmetros da URL
  if (gamesContainer) {
    // Primeiro verifica se há parâmetros na URL
    if (!handleURLParameters()) {
      // Se não há parâmetros, carrega jogos populares
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
