export class CommonConstants {
  public static readonly MAX_FILE_SIZE = 3; // in MB
  public static readonly ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png'];

  public static statusMenu = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false },
 ];

 public static OrderStatus = [
  { label: 'created', value: 'Order Placed' },
  { label: 'packed', value: 'Packed' },
  { label: 'shipped', value: 'Shipped' },
  { label: 'delivered', value: 'Delivered' },
  { label: 'cancelled', value: 'Cancelled' },
];
}

