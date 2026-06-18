describe('Ordres de Travail Page', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/ordres-de-travail');
  });

  it('affiche la page des ordres de travail', () => {
    cy.contains('Ordres de Travail').should('be.visible');
  });

  it('affiche le KanbanBoard', () => {
    cy.get('[class*="grid"]').should('exist');
  });

  it('affiche le bouton Nouveau OT', () => {
    cy.contains('Nouveau OT').should('be.visible');
  });

  it('navigue vers la création d\'OT', () => {
    cy.contains('Nouveau OT').click();
    cy.url().should('include', '/ordres-de-travail/creer');
  });
});
