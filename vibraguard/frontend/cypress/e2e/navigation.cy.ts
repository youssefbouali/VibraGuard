describe('Navigation & 404', () => {
  it('affiche la page 404 pour les routes inconnues', () => {
    cy.visit('/route-inexistante', { failOnStatusCode: false });
    cy.contains('Page non trouvée').should('be.visible');
    cy.contains('404').should('be.visible');
  });

  it('affiche la 404 avec un lien de retour', () => {
    cy.visit('/page-aleatoire', { failOnStatusCode: false });
    cy.contains('Retour au Dashboard').should('be.visible');
    cy.contains('Retour au Dashboard').click();
    cy.url().should('eq', Cypress.config('baseUrl') + '/');
  });

  it('navigue depuis la landing vers login', () => {
    cy.visit('/');
    cy.contains('Se connecter').click();
    cy.url().should('include', '/login');
  });

  it('affiche les pages publiques sans redirection', () => {
    const publicRoutes = [
      { path: '/', contains: 'VibraGuard' },
      { path: '/login', contains: 'Se connecter' },
      { path: '/register', contains: 'Créer un compte' },
    ];

    publicRoutes.forEach(({ path, contains }) => {
      cy.visit(path);
      cy.contains(contains).should('be.visible');
    });
  });
});
