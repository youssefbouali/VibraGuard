describe('App Smoke Test', () => {
  it('charge l\'application', () => {
    cy.visit('/');
    cy.window().should('have.property', 'document');
    cy.document().should('not.be.empty');
  });

  it('Charge les assets sans erreur 404', () => {
    cy.visit('/');
    cy.window().then((win) => {
      const errors: string[] = [];
      const originalConsole = win.console.error;
      win.console.error = (...args: any[]) => {
        errors.push(args.join(' '));
        originalConsole.apply(win.console, args);
      };
      cy.wait(3000).then(() => {
        const fetchErrors = errors.filter(
          (e) => e.includes('404') || e.includes('Failed to load')
        );
        expect(fetchErrors).to.have.length(0);
      });
    });
  });
});
