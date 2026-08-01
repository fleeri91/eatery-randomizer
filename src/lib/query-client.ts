import { QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      // Keeps inactive queries (e.g. a previous search after navigating
      // away) around long enough that the localStorage persister actually
      // saves them — the default 5 min otherwise evicts them from memory
      // before a reload has a chance to reuse them.
      gcTime: 30 * 60 * 1000,
    },
  },
})

export default queryClient
