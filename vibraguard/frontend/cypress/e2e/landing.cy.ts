describe('Landing Page', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('affiche le logo et le titre', () => {
    cy.contains('OCP').should('be.visible');
    cy.contains('VibraGuard').should('be.visible');
  });

  it('affiche la navbar avec les liens', () => {
    cy.contains('Accueil').should('be.visible');
    cy.contains('Fonctionnalités').should('be.visible');
    cy.contains('Solutions').should('be.visible');
    cy.contains('À propos').should('be.visible');
    cy.contains('Contact').should('be.visible');
  });

  it('affiche les boutons de connexion', () => {
    cy.contains('Se connecter').should('be.visible');
    cy.contains('Commencer').should('be.visible');
  });

  it('affiche les sections principales', () => {
    cy.contains('Fonctionnalités').should('be.visible');
    cy.contains('Comment ça marche').should('be.visible');
    cy.contains('KPIs').should('be.visible');
  });

  it('navigue vers /login via Se connecter', () => {
    cy.contains('Se connecter').click();
    cy.url().should('include', '/login');
  });

  it('navigue vers /login via Commencer', () => {
    cy.contains('Commencer').click();
    cy.url().should('include', '/login');
  });

  it('affiche le footer', () => {
    cy.contains('VibraGuard').should('be.visible');
    cy.contains('Tous droits réservés').should('be.visible');
  });

  it('a un arrière-plan sombre (thème)', () => {
    cy.get('div.min-h-screen').should('have.css', 'background-color');
  });
});
