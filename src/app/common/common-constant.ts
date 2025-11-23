export class CommonConstants {
  public static readonly MAX_FILE_SIZE = 3; // in MB
  public static readonly ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png'];

  public static statusMenu = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false },
 ];

 public static OrderStatus = [
  { key: 'created', value: 'Order Placed' },
  { key: 'confirmed', value: 'Order Confirmed' },
  { key: 'packed', value: 'Packed' },
  { key: 'shipped', value: 'Shipped' },
  { key: 'delivered', value: 'Delivered' },
  { key: 'cancelled', value: 'Cancelled' },
];
}

