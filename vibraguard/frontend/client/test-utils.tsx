import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

export const testQueryClient = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
});

export function TestWrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(
    QueryClientProvider,
    { client: testQueryClient },
    React.createElement(MemoryRouter, null, children)
  );
}

export const mockAuthContext = {
  useAuth: jest.fn(),
  AuthProvider: ({ children }: any) => React.createElement(React.Fragment, null, children),
};
