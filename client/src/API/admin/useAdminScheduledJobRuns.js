import { useQuery } from '@tanstack/react-query'
import { adminClient } from './adminClient'

export function useAdminScheduledJobRuns(params = {}) {
  return useQuery({
    queryKey: ['admin-scheduled-job-runs', params],
    queryFn: async () => {
      return await adminClient.get('/scheduled-job-runs', params)
    },
    keepPreviousData: true
  })
}

export function useAdminScheduledJobRunsSummary() {
  return useQuery({
    queryKey: ['admin-scheduled-job-runs-summary'],
    queryFn: async () => {
      return await adminClient.get('/scheduled-job-runs/summary')
    }
  })
}

export function useAdminScheduledJobNames() {
  return useQuery({
    queryKey: ['admin-scheduled-job-names'],
    queryFn: async () => {
      return await adminClient.get('/scheduled-job-runs/job-names')
    }
  })
}
