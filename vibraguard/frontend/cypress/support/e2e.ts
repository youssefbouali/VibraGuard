/// <reference types="cypress" />

Cypress.Commands.add('login', (email?: string, password?: string) => {
  cy.session([email || 'mr.boualiyoussef@gmail.com'], () => {
    cy.fixture('auth').then((auth) => {
      cy.fixture('me').then((me) => {
        cy.intercept('POST', '/api/v1/auth/login', {
          statusCode: 200,
          body: {
            token: auth.token,
            ...auth,
          },
        }).as('loginRequest');

        cy.intercept('GET', '/api/v1/auth/me', {
          statusCode: 200,
          body: me,
        }).as('meRequest');

        cy.visit('/login');
        cy.get('input[type="email"]').type(email || 'mr.boualiyoussef@gmail.com');
        cy.get('input[type="password"]').type(password || 'password');
        cy.get('button[type="submit"]').click();
        cy.wait('@loginRequest');
        cy.url().should('include', '/dashboard');
      });
    });
  });
});

Cypress.Commands.add('mockAuth', () => {
  cy.fixture('auth').then((auth) => {
    cy.fixture('me').then((me) => {
      cy.intercept('GET', '/api/v1/auth/me', {
        statusCode: 200,
        body: me,
      }).as('meStub');

      window.localStorage.setItem('token', auth.token);
    });
  });
});

Cypress.Commands.add('mockMotors', () => {
  cy.fixture('moteurs').then((moteurs) => {
    cy.intercept('GET', '/api/v1/moteurs*', {
      statusCode: 200,
      body: moteurs,
    }).as('motorsStub');
  });
});

Cypress.Commands.add('mockAlerts', () => {
  cy.fixture('alertes').then((alertes) => {
    cy.intercept('GET', '/api/v1/alertes*', {
      statusCode: 200,
      body: alertes,
    }).as('alertsStub');
  });
});

Cypress.Commands.add('mockDashboard', () => {
  cy.mockAuth();
  cy.mockMotors();
  cy.mockAlerts();
});
