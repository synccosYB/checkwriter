import React, { useState } from "react";
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Pagination,
  PaginationItem,
} from "@mui/material";
import { MoreVerticalIcon } from "../../../../components/Icons";
import { CustomTable } from "../../../../components/table/CustomTable";
import { DeleteModal } from "../modals/DeleteModal";

import { styles } from "../styles";
const mockChecks = [
  {
    id: 1,
    nickName: "Abraham Sabel",
    bankName: "Bank of America",
    accountNumber: "1234567890",
    availableBalance: "$1000.00",
    actions: "",
  },
  {
    id: 2,
    nickName: "Abraham Sabel",
    bankName: "Bank of America",
    accountNumber: "1234567890",
    availableBalance: "$1000.00",
    actions: "",
  },
  {
    id: 3,
    nickName: "Abraham Sabel",
    bankName: "Bank of America",
    accountNumber: "1234567890",
    availableBalance: "$1000.00",
    actions: "",
  },
  {
    id: 4,
    nickName: "Abraham Sabel",
    bankName: "Bank of America",
    accountNumber: "1234567890",
    availableBalance: "$1000.00",
    actions: "",
  },
  {
    id: 5,
    nickName: "Abraham Sabel",
    bankName: "Bank of America",
    accountNumber: "1234567890",
    availableBalance: "$1000.00",
    actions: "",
  },
];
const DeactivatedBankAccount = () => {
  const [checks, setChecks] = useState(mockChecks);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [page, setPage] = useState(1);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const handleMenuOpen = (event, id) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleReactivateAccount = () => {
  };

  const handleDeleteAccount = () => {
    setOpenDeleteModal(true);
    setAnchorEl(null);
  };

  const handleConfirmDelete = () => {
    setOpenDeleteModal(false);
  };

  const renderHeaderCell = (column) => column.label;

  const renderCell = (row, column) => {
    switch (column.id) {
      case "actions":
        return (
          <IconButton
            sx={styles.moreButton}
            onClick={(e) => handleMenuOpen(e, row)}
          >
            <MoreVerticalIcon />
          </IconButton>
        );
      default:
        return row[column.id];
    }
  };

  return (
    <Box sx={styles.wrapper}>
      <CustomTable
        columns={[
          { id: "nickName", label: "Nick Name" },
          { id: "bankName", label: "Bank Name" },
          { id: "accountNumber", label: "Account Number" },
          { id: "availableBalance", label: "Available Balance" },
          { id: "actions", label: "Actions" },
        ]}
        data={checks}
        renderCell={renderCell}
        renderHeaderCell={renderHeaderCell}
        isCenteredCells={true}
      />
      <Box sx={styles.paginationContainer}>
        <Pagination
          count={10}
          page={page}
          onChange={(event, value) => setPage(value)}
          renderItem={(item) => (
            <PaginationItem
              slots={{
                previous: () => "Previous",
                next: () => "Next",
              }}
              {...item}
              sx={styles.paginationItem}
            />
          )}
          sx={styles.pagination}
        />
      </Box>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: styles.menuPaper,
        }}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem onClick={handleReactivateAccount} sx={styles.menuItem}>
          Reactivate Bank Account
        </MenuItem>
        <MenuItem onClick={handleDeleteAccount} sx={styles.menuItem}>
          Delete Account
        </MenuItem>
      </Menu>
      <DeleteModal
        open={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  );
};

export default DeactivatedBankAccount;
