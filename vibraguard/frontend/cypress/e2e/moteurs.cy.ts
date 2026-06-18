describe('Moteurs Page', () => {
  beforeEach(() => {
    cy.login();
    cy.mockMotors();
    cy.visit('/moteurs');
  });

  it('affiche la page des moteurs', () => {
    cy.contains('Liste des Moteurs').should('be.visible');
    cy.contains('Ajouter un Moteur').should('be.visible');
  });

  it('affiche les données des moteurs', () => {
    cy.contains('MTR-Broyeur-01').should('be.visible');
    cy.contains('MTR-Conv-12').should('be.visible');
    cy.contains('MTR-Pompe-02').should('be.visible');
  });

  it('permet de basculer entre les vues liste et carte', () => {
    cy.contains('Carte').click();
    cy.contains('Liste').click();
  });

  it('affiche le champ de recherche', () => {
    cy.get('input[placeholder*="Rechercher"]').should('be.visible');
  });

  it('filtre les moteurs par recherche', () => {
    cy.get('input[placeholder*="Rechercher"]').type('Broyeur');
    cy.contains('MTR-Broyeur-01').should('be.visible');
    cy.contains('MTR-Conv-12').should('not.exist');
  });

  it('affiche la pagination', () => {
    cy.contains('Affichage de').should('be.visible');
    cy.contains('moteurs').should('be.visible');
  });

  it('affiche le bouton Download All Motors', () => {
    cy.contains('Download All Motors').should('be.visible');
  });

  it('navigue vers la page d\'ajout', () => {
    cy.contains('Ajouter un Moteur').click();
    cy.url().should('include', '/moteurs/ajouter');
  });

  it('affiche les badges de santé', () => {
    cy.contains('Critique').should('be.visible');
    cy.contains('Optimal').should('be.visible');
    cy.contains('Attention').should('be.visible');
  });
});
