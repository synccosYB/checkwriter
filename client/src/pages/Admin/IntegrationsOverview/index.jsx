import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { AdminPageWrapper } from '../components/AdminPageWrapper'
import { StatusChip } from '../components/StatusChip'
import { adminStyles } from '../components/adminStyles'
import Tabs from '../../../components/shared/tabs'
import { useAdminIntegrations } from '../../../API/admin/useAdminIntegrations'

const IntegrationTable = ({ data, columns, emptyMessage }) => {
  if (!data || data.length === 0) {
    return (
      <Box sx={adminStyles.emptyState}>
        <Typography color="text.secondary">{emptyMessage}</Typography>
      </Box>
    )
  }

  return (
    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '8px' }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell
                key={col.id}
                sx={{ fontWeight: 600, fontSize: '12px', color: '#6B7280', backgroundColor: '#F9FAFB' }}
              >
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, idx) => (
            <TableRow key={row._id || idx} sx={{ '&:hover': { backgroundColor: '#F9FAFB' } }}>
              {columns.map((col) => (
                <TableCell key={col.id} sx={{ fontSize: '13px' }}>
                  {col.render ? col.render(row) : row[col.id] ?? '—'}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

const quickbooksColumns = [
  { id: 'status', label: 'Status', render: (row) => <StatusChip status={row.status || (row.connected ? 'Connected' : 'Disconnected')} /> },
  { id: 'userName', label: 'User', render: (row) => row.userName || (row.userId ? `${row.userId.firstName || ''} ${row.userId.lastName || ''}`.trim() : '—') },
  { id: 'organizationName', label: 'Organization', render: (row) => row.organizationName || row.organizationId?.name || '—' },
  { id: 'companyName', label: 'Company', render: (row) => row.companyName || row.realmId || '—' },
  { id: 'lastSync', label: 'Last Sync', render: (row) => row.lastSync ? new Date(row.lastSync).toLocaleString() : '—' }
]

const stripeColumns = [
  { id: 'status', label: 'Status', render: (row) => <StatusChip status={row.subscriptionStatus || row.status || 'Unknown'} /> },
  { id: 'userName', label: 'User', render: (row) => row.userName || (row.userId ? `${row.userId.firstName || ''} ${row.userId.lastName || ''}`.trim() : '—') },
  { id: 'organizationName', label: 'Organization', render: (row) => row.organizationName || row.organizationId?.name || '—' },
  { id: 'customerId', label: 'Customer ID', render: (row) => <Typography variant="caption" fontFamily="monospace">{row.stripeCustomerId || row.customerId || '—'}</Typography> },
  { id: 'plan', label: 'Plan', render: (row) => row.plan || row.planName || '—' }
]

const plaidColumns = [
  { id: 'status', label: 'Status', render: (row) => <StatusChip status={row.status || (row.connected ? 'Connected' : 'Disconnected')} /> },
  { id: 'userName', label: 'User', render: (row) => row.userName || (row.userId ? `${row.userId.firstName || ''} ${row.userId.lastName || ''}`.trim() : '—') },
  { id: 'organizationName', label: 'Organization', render: (row) => row.organizationName || row.organizationId?.name || '—' },
  { id: 'institution', label: 'Institution', render: (row) => row.institutionName || row.institution || '—' },
  { id: 'accountCount', label: 'Linked Accounts', render: (row) => row.accountCount ?? row.accounts?.length ?? '—' }
]

const IntegrationsOverview = () => {
  const { data, isLoading, error } = useAdminIntegrations()

  if (isLoading) {
    return (
      <AdminPageWrapper title="Integrations Overview" description="Review all third-party integration connections.">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </AdminPageWrapper>
    )
  }

  const integrations = data?.data || data || {}
  const quickbooks = Array.isArray(integrations.quickbooks) ? integrations.quickbooks : []
  const stripe = Array.isArray(integrations.stripe) ? integrations.stripe : []
  const plaid = Array.isArray(integrations.plaid) ? integrations.plaid : []

  return (
    <AdminPageWrapper
      title="Integrations Overview"
      description="Review all third-party integration connections across the platform."
    >
      <Box sx={adminStyles.readOnlyBanner}>
        <VisibilityIcon sx={{ color: '#64748B', fontSize: 20 }} />
        <Typography variant="body2" color="text.secondary">
          Read-only view — integration connections are managed by individual users.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load integrations data. Please try again.
        </Alert>
      )}

      <Tabs
        tabsData={[
          {
            title: 'QuickBooks',
            component: (
              <Box sx={{ mt: 2 }}>
                <IntegrationTable
                  data={quickbooks}
                  columns={quickbooksColumns}
                  emptyMessage="No QuickBooks connections found"
                />
              </Box>
            )
          },
          {
            title: 'Stripe',
            component: (
              <Box sx={{ mt: 2 }}>
                <IntegrationTable
                  data={stripe}
                  columns={stripeColumns}
                  emptyMessage="No Stripe connections found"
                />
              </Box>
            )
          },
          {
            title: 'Plaid',
            component: (
              <Box sx={{ mt: 2 }}>
                <IntegrationTable
                  data={plaid}
                  columns={plaidColumns}
                  emptyMessage="No Plaid connections found"
                />
              </Box>
            )
          }
        ]}
        useQueryParam={false}
      />
    </AdminPageWrapper>
  )
}

export default IntegrationsOverview
