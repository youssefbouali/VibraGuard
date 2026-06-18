describe('Dashboard Page', () => {
  beforeEach(() => {
    cy.login();
    cy.mockDashboard();
    cy.visit('/dashboard');
  });

  it('affiche le layout du dashboard', () => {
    cy.contains('Dashboard').should('be.visible');
    cy.get('header').should('exist');
    cy.get('aside').should('exist');
  });

  it('affiche les cartes KPI', () => {
    cy.contains('Moteurs').should('be.visible');
    cy.contains('Alertes').should('be.visible');
  });

  it('affiche la cartographie santé', () => {
    cy.contains('Santé').should('be.visible');
  });

  it('affiche le graphique de vibration', () => {
    cy.contains('Vibration').should('be.visible');
  });

  it('affiche la table des moteurs', () => {
    cy.contains('Moteurs').should('be.visible');
  });

  it('affiche les alertes récentes', () => {
    cy.contains('Alertes').should('be.visible');
  });
});
