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

// --- VARIÁVEIS DE ESTADO PARA PAGINAÇÃO E SCROLL ---
let currentUrl = ""; // Armazena a URL da próxima página a ser carregada
let isLoading = false; // Impede múltiplos carregamentos ao mesmo tempo

// --- FUNÇÃO PARA BUSCAR E EXIBIR JOGOS (MODIFICADA) ---
function fetchAndDisplayGames(apiUrl, isNewSearch = false) {
  if (isLoading) return; // Se já estiver carregando, não faz nada
  isLoading = true;
  loadingIndicator.style.display = "block"; // Mostra o indicador de "carregando"

  // Se for uma nova busca (não scroll), limpa o container
  if (isNewSearch) {
    gamesContainer.innerHTML = "";
    gameCountSpan.textContent = "";
  }

  fetch(apiUrl)
    .then((response) => {
      if (!response.ok) throw new Error(`Erro na API: ${response.status}`);
      return response.json();
    })
    .then((data) => {
      // Atualiza o contador de jogos (apenas na primeira página)
      if (isNewSearch) {
        gameCountSpan.textContent = `(${data.count} jogos encontrados)`;
      }

      // Salva a URL da PRÓXIMA página de resultados
      currentUrl = data.next;

      const games = data.results;
      if (games.length === 0 && isNewSearch) {
        gamesContainer.innerHTML =
          '<p class="text-warning text-center">Nenhum jogo encontrado.</p>';
      }

      // Adiciona os novos cards ao container
      games.forEach((game) => {
        const gameCardHTML = `
          <div class="col-xl-3 col-lg-4 col-md-6 col-sm-12">
            <div class="card custom-card h-100">
              <img src="${
                game.background_image || "img/placeholder.png"
              }" class="card-img-top custom-card-img" alt="${game.name}">
              <div class="card-body d-flex flex-column">
                <h5 class="card-title custom-card-title">${game.name}</h5>
                <p class="card-text small">Lançamento: ${
                  game.released || "Não informado"
                }</p>
                <div class="mt-auto">
                  <div class="custom-card-price text-end">Disponível</div>
                </div>
              </div>
            </div>
          </div>
        `;
        gamesContainer.innerHTML += gameCardHTML;
      });

      isLoading = false;
      loadingIndicator.style.display = "none";
    })
    .catch((error) => {
      console.error("Erro ao buscar os jogos:", error);
      gamesContainer.innerHTML = `<div class="alert alert-danger"><strong>Oops! Algo deu errado.</strong><br>Não foi possível carregar os jogos.</div>`;
      isLoading = false;
      loadingIndicator.style.display = "none";
    });
}

// --- EVENTOS DE BUSCA E CATEGORIA ---
function handleNewSearch(url, title) {
  catalogTitle.firstChild.textContent = title + " ";
  fetchAndDisplayGames(url, true);
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const searchTerm = searchInput.value.trim();
  if (searchTerm) {
    const searchApiUrl = `https://api.rawg.io/api/games?key=${apiKey}&search=${searchTerm}&page_size=12`;
    handleNewSearch(searchApiUrl, `Resultados para: "${searchTerm}"`);
  }
});

categoryItems.forEach((item) => {
  item.addEventListener("click", () => {
    categoryItems.forEach((i) => i.classList.remove("active"));
    item.classList.add("active");

    const genre = item.getAttribute("data-genre");
    const genreName = item.textContent;
    let apiUrl = "";

    if (genre === "popular") {
      apiUrl = `https://api.rawg.io/api/games?key=${apiKey}&dates=2023-01-01,2024-12-31&ordering=-rating&page_size=12`;
    } else {
      apiUrl = `https://api.rawg.io/api/games?key=${apiKey}&genres=${genre}&page_size=12`;
    }
    handleNewSearch(apiUrl, genreName);
  });
});

// --- LÓGICA DO SCROLL INFINITO ---
window.addEventListener("scroll", () => {
  // Verifica se o usuário chegou perto do fim da página E se não está carregando E se existe uma próxima página
  if (
    window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 &&
    !isLoading &&
    currentUrl
  ) {
    fetchAndDisplayGames(currentUrl); // Carrega a próxima página
  }
});

// --- CARREGAMENTO INICIAL ---
function loadInitialGames() {
  const popularGamesUrl = `https://api.rawg.io/api/games?key=${apiKey}&dates=2023-01-01,2024-12-31&ordering=-rating&page_size=12`;
  handleNewSearch(popularGamesUrl, "Populares");
}

loadInitialGames();
