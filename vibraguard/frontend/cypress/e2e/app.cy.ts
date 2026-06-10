describe('Frontend smoke test', () => {
  it('loads the app root', () => {
    cy.visit('/');
    cy.window().should('have.property', 'document');
  });
});
