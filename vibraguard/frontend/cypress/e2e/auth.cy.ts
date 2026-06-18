describe('Authentication & Protected Routes', () => {
  it('redirige vers /login pour les routes protégées sans auth', () => {
    const protectedRoutes = [
      '/dashboard',
      '/moteurs',
      '/moteurs/ajouter',
      '/moteurs/MTR-Broyeur-01',
      '/alertes',
      '/alertes/ALT-8402',
      '/ordres-de-travail',
      '/ordres-de-travail/creer',
      '/rapports-bi',
      '/parametres',
      '/parametres/profil',
      '/notifications',
    ];

    protectedRoutes.forEach((route) => {
      cy.visit(route);
      cy.url({ timeout: 10000 }).should('contain', '/login');
    });
  });

  it('autorise l\'accès aux pages publiques sans auth', () => {
    cy.visit('/');
    cy.url().should('eq', Cypress.config('baseUrl') + '/');

    cy.visit('/login');
    cy.url().should('contain', '/login');

    cy.visit('/register');
    cy.url().should('contain', '/register');

    cy.visit('/forgot-password');
    cy.url().should('contain', '/forgot-password');
  });

  it('reste sur le dashboard après connexion', () => {
    cy.login();
    cy.mockMotors();
    cy.mockAlerts();
    cy.url().should('include', '/dashboard');
    cy.contains('Dashboard').should('be.visible');
  });

  it('permet de naviguer vers /moteurs après connexion', () => {
    cy.login();
    cy.mockMotors();
    cy.visit('/moteurs');
    cy.url().should('include', '/moteurs');
  });

  it('permet de naviguer vers /alertes après connexion', () => {
    cy.login();
    cy.mockAlerts();
    cy.visit('/alertes');
    cy.url().should('include', '/alertes');
  });

  it('restreint /rapports-bi aux admins', () => {
    cy.intercept('GET', '/api/v1/auth/me', {
      statusCode: 200,
      body: {
        email: 'tech@vibraguard.ma',
        fullName: 'Technicien',
        role: 'Technicien',
        employeeId: 'EMP-002',
        phoneNumber: '',
        department: 'Maintenance',
      },
    }).as('meTech');

    window.localStorage.setItem('token', 'fake-token-tech');
    cy.visit('/rapports-bi');
    cy.url().should('include', '/dashboard');
  });
});
