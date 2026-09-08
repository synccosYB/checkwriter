
export const statusMap = {
  'All Checks': null,
  'Draft Checks': 'DRAFT',
  'Cleared Checks': 'CLEARED',
  'Uncleared Checks': 'UNCLEARED',
};

export function mapFiltersToQueryParams(filterList, sort) {
  const queryParams = {};

  if (sort?.sortBy && sort?.sortOrder) {
    queryParams.sortBy = sort.sortBy;
    queryParams.sortOrder = sort.sortOrder;
  }

  

  const singleStatuses = filterList.singleFilter
    .map(label => statusMap[label])
    .filter(Boolean);

  const multiStatuses = (filterList.multiFilter['Status'] || []).map(s => s.value);

  const allStatuses = Array.from(new Set([...singleStatuses, ...multiStatuses]));

  if (allStatuses.length > 0) {
    queryParams.status = allStatuses.join(',');
  }

  const multi = filterList.multiFilter;

  if (multi['Payee Name']?.length > 0) {
    queryParams.payeeIds = multi['Payee Name'].map(p => p.value).join(',');
  }

  if (multi['Bank account']?.length > 0) {
    queryParams.bankIds = multi['Bank account'].map(b => b.value).join(',');
  }

  if (multi['Account Nickname']?.length > 0) {
    queryParams.bankIds = multi['Account Nickname'].map(b => b.value).join(',');
  }

  if (multi['Tags']?.length > 0) {
    queryParams.tagIds = multi['Tags'].map(t => t.value).join(',');
  }

  if (multi['Created As']?.length > 0) {
    queryParams.createdAs = multi['Created As'].map(t => t.value).join(',');
  }

  const dateLabel = filterList.dateRange;
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());

  const format = (d) => d.toISOString().split('T')[0];

  const datePresets = {
    'This Week': {
      startDate: format(startOfWeek),
      endDate: format(new Date(startOfWeek.getTime() + 6 * 86400000)),
    },
    'This Month': {
      startDate: format(new Date(today.getFullYear(), today.getMonth(), 1)),
      endDate: format(new Date(today.getFullYear(), today.getMonth() + 1, 0)),
    },
    'This Quarter': {
      startDate: format(new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1)),
      endDate: format(new Date(today.getFullYear(), (Math.floor(today.getMonth() / 3) + 1) * 3, 0)),
    },
    'This Year': {
      startDate: format(new Date(today.getFullYear(), 0, 1)),
      endDate: format(new Date(today.getFullYear(), 11, 31)),
    },
    'Last Week': {
      startDate: format(new Date(startOfWeek.getTime() - 7 * 86400000)),
      endDate: format(new Date(startOfWeek.getTime() - 1 * 86400000)),
    },
    'Last Month': {
      startDate: format(new Date(today.getFullYear(), today.getMonth() - 1, 1)),
      endDate: format(new Date(today.getFullYear(), today.getMonth(), 0)),
    },
    'Last Quarter': {
      startDate: format(new Date(today.getFullYear(), (Math.floor(today.getMonth() / 3) - 1) * 3, 1)),
      endDate: format(new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 0)),
    },
    'Last Year': {
      startDate: format(new Date(today.getFullYear() - 1, 0, 1)),
      endDate: format(new Date(today.getFullYear() - 1, 11, 31)),
    },
  };

  if(dateLabel){
    if (datePresets[dateLabel]) {
      queryParams.startDate = datePresets[dateLabel].startDate;
      queryParams.endDate = datePresets[dateLabel].endDate;
    }else{
      const [start, end] = dateLabel.split(' to ');
      if(start && end){
        queryParams.startDate = start;
        queryParams.endDate = end;
      }
    }
  }

  return queryParams;
}