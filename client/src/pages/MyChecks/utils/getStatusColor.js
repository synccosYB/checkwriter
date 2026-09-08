import { CHECK_STATUS } from "../../../types/check.types";

export const getStatusColor = (status) => {
    switch (status) {
      case CHECK_STATUS.PRINTED:
        return '#EF6C00';
      case CHECK_STATUS.SUBMITTED:
        return '#1e3a5f';
      case CHECK_STATUS.MAILED:
        return '#CBB300';
      case CHECK_STATUS.EMAILED:
        return '#3EA5F9';
      case CHECK_STATUS.CLEARED:
        return '#058205'
      case CHECK_STATUS.VOID:
        return '#F03D3E';
      case CHECK_STATUS.BLANK:
        return '#e2e8f0';
      case CHECK_STATUS.DRAFT:
        return "#00000099";
      default:
        return '#000000';
    }
  };
  

export const getStatusText = (status) => {
    switch (status) {
      case CHECK_STATUS.PRINTED:
        return 'Printed';
      case CHECK_STATUS.SUBMITTED:
        return 'Submitted';
      case CHECK_STATUS.MAILED:
        return 'Mailed';
      case CHECK_STATUS:
        return 'Emailed';
      case CHECK_STATUS.CLEARED:
        return 'Cleared'
      case CHECK_STATUS.VOID:
        return 'Void';
      case CHECK_STATUS.BLANK:
        return 'Blank';
      case CHECK_STATUS.DRAFT:
        return "Draft";
      case CHECK_STATUS.UNCLEARED:
          return "Uncleared";
      case CHECK_STATUS.EMAILED:
            return "Emailed";
      default:
        return status;
    }
  }