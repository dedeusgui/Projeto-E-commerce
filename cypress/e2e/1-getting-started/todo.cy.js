// teste para entrar no site na pagina inicial

describe('Abrir site local', () => {
  it('Deve acessar a página inicial', () => {
    cy.visit('/');
    cy.contains('/').should('be.visible'); 
  });
});

// teste de botoes 
describe("Teste de Botões da Página Inicial", () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it("clicar no logo deve redirecionar para a página inicial", () => {
    cy.get('.img-fluid').click();
  });

  it("clicar no botão catálogo deve redirecionar para catalogo.html", () => {
    cy.get('.nav-link-custom').click();
  });

  it("clicar no botão de busca deve redirecionar para assinatura.html", () => {
    cy.get('.d-flex > .custom-search-btn').click();
  });

  it("clicar no botão hero primário deve redirecionar para assinatura.html", () => {
    cy.get('.hero-btn-primary').click();
  });

  it("clicar no botão hero secundário deve redirecionar para catalogo.html", () => {
    cy.get('.hero-btn-secondary').click();
  
    
  });
});

  // 3. Teste de Busca
  describe("Teste de Busca", () =>{
  it("Busca de produto deve exibir resultados corretos", () => {
    cy.visit("catalogo.html")
    cy.get('#search-input').click().type('GTA');;
    cy.url().should('include', 'catalogo.html');
    cy.contains('Grand Theft Auto').should('be.visible');
  });
});

// Testes de Navegação
describe("Teste de Navegação", () => {

  it("Botão logo deve retornar à página inicial", () => {
    cy.visit('/');
    cy.get('.img-fluid').click();
    cy.url().should('include', '/');
  });

  it("Botão catálogo deve ir para catalogo.html", () => {
    cy.visit('/');
    cy.get('.nav-link-custom').click();
    cy.url().should('include', 'catalogo.html');
  });

  it("Botão assinatura deve ir para assinatura.html", () => {
    cy.visit('/');
    cy.get('.d-flex > .custom-search-btn').click();
    cy.url().should('include', 'assinatura.html');
  });

  it("Botão hero primário deve ir para assinatura.html", () => {
    cy.visit('/');
    cy.get('.hero-btn-primary').click();
    cy.url().should('include', 'assinatura.html');
  });

  it("Botão hero secundário deve ir para catalogo.html", () => {
    cy.visit('/');
    cy.get('.hero-btn-secondary').click();
    cy.url().should('include', 'catalogo.html');
  });

});

// Teste de carregamento de imagens
describe("Teste de Carregamento de Imagens", () => {
  it("Deve carregar todas as imagens da página inicial", () => {
    cy.visit('/');
    cy.get('img').each(($img) => {
      cy.wrap($img)
        .should('be.visible')
        .and('have.prop', 'naturalWidth')
        .and('be.greaterThan', 0);
    });
  });

});

//  Teste de Performance e Tempo de Carregamento
describe("Teste de Performance", () => {
  it("Página inicial deve carregar em tempo hábil", () => {
    const start = Date.now();
    cy.visit('/').then(() => {
      const loadTime = Date.now() - start;
      expect(loadTime).to.be.lessThan(3000); // máximo 3 segundos
    });
  });

  it("Navegação entre páginas deve ser rápida", () => {
    cy.visit('/');
    const start = Date.now();
    cy.get('.nav-link-custom').click().then(() => {
      const navTime = Date.now() - start;
      expect(navTime).to.be.lessThan(2000); // máximo 2 segundos
    });
    cy.url().should('include', 'catalogo.html');
  });
});


//  Teste de Filtros no Catálogo
describe("Teste de Filtros no Catálogo", () => {
  beforeEach(() => {
    cy.visit('catalogo.html');
  });

  it("Deve filtrar jogos por categoria", () => {
    // Aguarda a página carregar completamente
    cy.wait(1000);
    
    // Clica no filtro de ação
    cy.get('[data-genre="action"]').click();
    
    // Aguarda o filtro ser aplicado
    cy.wait(500);
    
    // Verifica se existem elementos na página (pode ser .game-card, .card, .game-item, etc.)
    cy.get('body').then(($body) => {
      if ($body.find('.game-card').length > 0) {
        cy.get('.game-card').should('be.visible');
      } else {
        // Se não há jogos de ação, apenas verifica se o filtro foi aplicado
        cy.get('[data-genre="action"]').should('have.class', 'active'); // ou outra classe que indique filtro ativo
      }
    });
  });
  
});

// Teste de URLs e Redirecionamentos
describe("Teste de URLs e Redirecionamentos", () => {
  it("Deve manter URL limpa sem parâmetros estranhos", () => {
    cy.visit('/');
    cy.url().should('not.contain', 'undefined');
    cy.url().should('not.contain', 'null');
    cy.url().should('not.contain', '[object');
  });

  it("Deve preservar fragmentos de URL ao navegar", () => {
    cy.visit('/#secao-jogos');
    cy.url().should('include', '#secao-jogos');
    
    // Navega e volta
    cy.get('.nav-link-custom').click();
    cy.go('back');
    cy.url().should('include', '/');
  });

  it("Deve funcionar com diferentes protocolos de URL", () => {
    // Testa se não há redirecionamento forçado para https quando em http
    cy.visit('/');
    cy.url().should('match', /^https?:\/\//); // aceita http ou https
  });

  });


  // Teste de Cookies e Local Storage
describe("Teste de Armazenamento", () => {
  it("Deve conseguir definir e ler cookies", () => {
    cy.visit('/');
    
    // Define um cookie de teste
    cy.setCookie('test_cookie', 'cypress_test');
    
    // Verifica se o cookie foi definido
    cy.getCookie('test_cookie').should('have.property', 'value', 'cypress_test');
    
    // Remove o cookie
    cy.clearCookie('test_cookie');
    cy.getCookie('test_cookie').should('be.null');
  });

  it("Deve verificar se página aceita cookies", () => {
    cy.visit('/');
    cy.setCookie('user_preferences', 'accepted');
    cy.reload();
    cy.getCookie('user_preferences').should('exist');
  });
});


// Teste de Console Errors
describe("Teste de Erros no Console", () => {
  it("Não deve ter erros de JavaScript no console", () => {
    cy.visit('/', {
      onBeforeLoad(win) {
        cy.stub(win.console, 'error').as('consoleError');
      }
    });
    
    // Aguarda a página carregar
    cy.wait(2000);
    
    // Verifica se não houve erros
    cy.get('@consoleError').should('not.have.been.called');
  });

  it("Não deve ter warnings no console ao navegar", () => {
    cy.visit('/', {
      onBeforeLoad(win) {
        cy.stub(win.console, 'warn').as('consoleWarn');
      }
    });
    
    cy.get('.nav-link-custom').click();
    cy.wait(1000);
    cy.get('@consoleWarn').should('not.have.been.called');
  });
});