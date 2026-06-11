export type AdminTable = {
  tableId: string;
  restaurantId: string;
  name: string;
  menuUrl: string;
  qrCodeValue: string;
  isActive: boolean;
};

export type TableFormValues = {
  restaurantId: string;
  name: string;
  isActive: boolean;
};
