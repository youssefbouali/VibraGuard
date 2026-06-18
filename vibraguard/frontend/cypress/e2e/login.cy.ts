describe('Login Page', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('affiche le formulaire de connexion', () => {
    cy.contains('OCP VibraGuard').should('be.visible');
    cy.contains('Plateforme de maintenance prédictive I4.0').should('be.visible');
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    cy.contains('Se connecter').should('be.visible');
  });

  it('affiche le lien vers la création de compte', () => {
    cy.contains('Créer un compte').should('be.visible');
    cy.contains('Créer un compte').should('have.attr', 'href', '/register');
  });

  it('affiche la case à cocher "Se souvenir de moi"', () => {
    cy.contains('Se souvenir de moi').should('be.visible');
  });

  it('affiche une erreur avec des identifiants invalides', () => {
    cy.intercept('POST', '/api/v1/auth/login', {
      statusCode: 401,
      body: { message: 'Échec de la connexion' },
    }).as('loginFail');

    cy.get('input[type="email"]').type('wrong@email.com');
    cy.get('input[type="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    cy.wait('@loginFail');
    cy.get('li[data-sonner-toaster]').should('exist');
  });

  it('affiche une erreur avec email vide', () => {
    cy.get('button[type="submit"]').click();
    cy.get('input[type="email"]:invalid').should('exist');
  });

  it('se connecte avec succès et redirige vers /dashboard', () => {
    cy.fixture('auth').then((auth) => {
      cy.fixture('me').then((me) => {
        cy.intercept('POST', '/api/v1/auth/login', {
          statusCode: 200,
          body: { token: auth.token, ...auth },
        }).as('loginSuccess');

        cy.intercept('GET', '/api/v1/auth/me', {
          statusCode: 200,
          body: me,
        }).as('meRequest');

        cy.get('input[type="email"]').type('mr.boualiyoussef@gmail.com');
        cy.get('input[type="password"]').type('password');
        cy.get('button[type="submit"]').click();
        cy.wait('@loginSuccess');
        cy.url().should('include', '/dashboard');
      });
    });
  });

  it('navigue vers register', () => {
    cy.contains('Créer un compte').click();
    cy.url().should('include', '/register');
  });
});
