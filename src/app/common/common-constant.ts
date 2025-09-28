export class CommonConstants {
  public static readonly MAX_FILE_SIZE = 3; // in MB
  public static readonly ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png'];

  public static statusMenu = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false },
 ];

 public static OrderStatus = [
  { label: 'Pending', value: 'Pending' },
  { label: 'Confirmed', value: 'Confirmed' },
  { label: 'Shipped', value: 'Shipped' },
  { label: 'Delivered', value: 'Delivered' },
  { label: 'Cancelled', value: 'Cancelled' },
];
}

