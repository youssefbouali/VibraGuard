describe('Alertes Page', () => {
  beforeEach(() => {
    cy.login();
    cy.mockAlerts();
    cy.visit('/alertes');
  });

  it('affiche la page des alertes', () => {
    cy.contains('Alertes').should('be.visible');
  });

  it('affiche le champ de recherche', () => {
    cy.get('input[placeholder*="Rechercher"]').should('be.visible');
  });

  it('affiche les filtres', () => {
    cy.contains('Sévérité:').should('be.visible');
    cy.contains('Date:').should('be.visible');
    cy.contains('Moteur:').should('be.visible');
  });

  it('affiche les alertes mockées', () => {
    cy.contains('#ALT-8402').should('be.visible');
    cy.contains('#ALT-8401').should('be.visible');
  });

  it('affiche la pagination', () => {
    cy.contains('alertes').should('be.visible');
  });

  it('filtre par sévérité', () => {
    cy.contains('Sévérité: Toutes').click();
    cy.contains('Critique').click();
    cy.contains('#ALT-8402').should('be.visible');
  });

  it('filtre par recherche textuelle', () => {
    cy.get('input[placeholder*="Rechercher"]').type('8402');
    cy.contains('#ALT-8402').should('be.visible');
  });
});
