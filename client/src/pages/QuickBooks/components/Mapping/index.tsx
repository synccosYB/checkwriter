import React, { useEffect, useMemo, useState } from 'react'
import { Box, InputAdornment, Pagination, PaginationItem, TextField, Typography } from '@mui/material'
import { styles } from '../../styles';
import { SearchIcon } from '../../../../components/Icons'
import { CustomTable } from '../../../../components/table/CustomTable'
import { CustomButton } from '../../../../components/buttons/CustomButton';
import { RemapAlert } from '../modals/RemapAlert';
import { MapModal } from '../modals/MapModal';

interface MappingProps {
  type: 'unmapped' | 'mapped';
  mapType: 'bank' | 'payee';
  PayeeData?: any[];
  bankData?: any[];
  handleSearch: (type:string, value: string) => void;
  handlePage: (type: string, value: number) => void;
  meta: {
        total: number,
        page: number,
        limit: number,
        totalPages: number
    }
}

interface Column {
  id: string;
  label: string;
  width?: string;
}

const getPayeeAdress = (rawData:any) => {
  if(rawData && rawData.BillAddr){
    return `${rawData.BillAddr.Line1} | ${rawData.BillAddr.City} | ${rawData.BillAddr.CountrySubDivisionCode}, ${rawData.BillAddr.PostalCode}`
  }
}

export const Mapping: React.FC<MappingProps> = ({ type, mapType, PayeeData, bankData, handleSearch, meta, handlePage }) => {

  const [openRemapAlert, setOpenRemapAlert] = useState(false);
  const [openMapModal, setOpenMapModal] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');

  const [quickbookId, setQuickbookId] = useState("");

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [data, setData] = useState([]);

  const filteredData = useMemo(() => {
  if (!searchQuery) return data;

  return data.filter((item) => {
    const searchString = `${item.quickbooksName ?? ''} ${item.detail?.name ?? ''} ${item.detail?.email ?? ''} ${item.detail?.accountName ?? ''} ${item.detail?.accountNickName ?? ''}`;
    return searchString.toLowerCase().includes(searchQuery.toLowerCase());
  });
  }, [searchQuery, data]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);


  useEffect(() =>{
    setData(mapType === 'bank' ? bankData || [] : PayeeData || [])
  },[PayeeData, bankData])

  const handleRemap = () => {
    setOpenRemapAlert(false);
    setOpenMapModal(true);
  }

  const handleMap = () => {
    setOpenMapModal(false);
  }

  const renderHeaderCell = (column: Column) => {
    switch (column.id) {
      case 'info':
        return <Typography sx={{ fontSize: { sm: '14px', xs: '12px' }, fontWeight: 600, pl: '16px' }}>{column.label}</Typography>
      case 'action':
        return <Typography sx={{ fontSize: { sm: '14px', xs: '12px' }, fontWeight: 600, textAlign: 'right', pr: '16px' }}>{column.label}</Typography>
    }
  }

  const handleMapButtonClick = (quickbookId) =>{
    setQuickbookId(quickbookId)
    if(type === 'mapped') setOpenRemapAlert(true)
    else{setOpenMapModal(true)}
  }
  const renderCell = (row: any, column: Column) => {
    switch (column.id) {
      case 'info':
        return <>
          {mapType === 'payee' ? <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, padding: '12px', textAlign:'left' }}>
            <Typography sx={styles.tableText}>{row.quickbooksName}</Typography>
            <Typography sx={{ ...styles.tableLabelText, color: '#00000099' }}>{getPayeeAdress(row.rawData)}</Typography>
            <Typography sx={{ ...styles.tableLabelText, color: '#1e3a5f', textDecoration: 'underline', cursor: 'pointer' }}>{row.rawData?.PrimaryEmailAddr?.Address}</Typography>
          </Box> : <Box sx={{
            display: 'flex', flexDirection: 'column', gap: '4px', padding: '12px', textAlign:'left'
          }}>
            <Typography sx={styles.tableText}>{row.quickbooksName}</Typography>
            <Typography sx={{ ...styles.tableLabelText, color: '#00000099' }}>{row.rawData?.FullyQualifiedName}</Typography>
          </Box>
          }
        </>
      case 'action':
        return <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '24px', alignItems: 'center', padding:'12px' }}>
          {
            (mapType === 'payee' && row.detail) && <Box>
            <Typography sx={styles.tableText}>{row.detail.name}</Typography>
            <Typography sx={{ ...styles.tableLabelText, color: '#00000099' }}>{row.detail.email}</Typography>
          </Box>
          }
          {
            (mapType === 'bank' && row.detail) && <Box>
            <Typography sx={styles.tableText}>{row.detail.accountName}</Typography>
            <Typography sx={{ ...styles.tableLabelText, color: '#00000099' }}>{row.detail.accountNickName}</Typography>
          </Box>
          }
          <CustomButton
            variant="contained"
            color="primary"
            onClick={() => handleMapButtonClick(row.quickbooksId)}
          >
            {type === 'unmapped' ? 'Map' : 'Remap'}
          </CustomButton>
        </Box>
    }
  };

  return <Box sx={styles.mapContainer}>
    <Typography sx={styles.mapTitle}>{mapType === 'bank' ? 'Bank Account' : 'Payee'} Mapping</Typography>

    <TextField
      placeholder="Search"
      sx={{ ...styles.searchField }}
      onChange={(e)=>{
        setSearchQuery(e.target.value);
        handleSearch(mapType, e.target.value)
      }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
      }}
    />

    <CustomTable
      columns={[
        { id: 'info', label: `QuickBooks ${mapType === 'payee' ? 'Payee' : 'Bank'}` },
        { id: 'action', label: `Map to ${mapType === 'payee' ? 'Payee' : 'Bank'} in Check Writer` },
      ]}
      data={paginatedData}
      renderCell={renderCell}
      renderHeaderCell={renderHeaderCell}
    />

    <Box sx={styles.paginationContainer}>
      <Pagination
        count={Math.ceil(meta?.total / 5)}
        page={meta?.page}
        onChange={(event, value) => handlePage(mapType,value)}
        renderItem={(item) => (
          <PaginationItem
            slots={{
              previous: () => 'Previous',
              next: () => 'Next',
            }}
            {...item}
            sx={styles.paginationItem}
          />
        )}
        sx={styles.pagination}
      />
    </Box>
    <RemapAlert
      open={openRemapAlert}
      onClose={() => setOpenRemapAlert(false)}
      onConfirm={handleRemap}
      mapType={mapType}
    />

    {
      openMapModal && <MapModal
      open={openMapModal}
      onClose={() => setOpenMapModal(false)}
      onConfirm={handleMap}
      mapType={mapType}
      quickbookId={quickbookId}
    />
    }
  </Box>
}
