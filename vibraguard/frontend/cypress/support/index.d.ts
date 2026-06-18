/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable<Subject = any> {
    login(email?: string, password?: string): Chainable<void>;
    mockAuth(): Chainable<void>;
    mockMotors(): Chainable<void>;
    mockAlerts(): Chainable<void>;
    mockDashboard(): Chainable<void>;
  }
}
