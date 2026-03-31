import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      retry: 1,
    },
    queries: {
      gcTime: 5 * 60 * 1000,
      retry: 1,
      staleTime: 30 * 1000,
    },
  },
});
