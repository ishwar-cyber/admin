export class CommonConstants {
  public static readonly MAX_FILE_SIZE = 3; // in MB
  public static readonly ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png'];

  public static statusMenu = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false },
 ];

 public static OrderStatus = [
  { key: 'placed', value: 'Order Placed' },
  { key: 'confirmed', value: 'Confirmed' },
  { key: 'shipped', value: 'Shipped' },
  { key: 'delivered', value: 'Delivered' },
  { key: 'cancelled', value: 'Cancelled' },
];

/* -------------------- CONFIG DRIVEN FILTERS -------------------- */
 public static FilterConfig = [
    {
      key: 'statusFilter',
      label: 'Order Status',
      type: 'select',
      placeholder: '',
      options: [
        { value: '', label: 'All' },
        { value: 'pending', label: 'Pending' },
        { value: 'packed', label: 'Packed' },
        { value: 'shipped', label: 'Shipped' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'cancelled', label: 'Cancelled' }
      ]
    },
    {
      key: 'paymentStatusFilter',
      label: 'Payment',
      type: 'select',
      options: [
        { value: '', label: 'All' },
        { value: 'pending', label: 'Pending' },
        { value: 'paid', label: 'Paid' },
        { value: 'failed', label: 'Failed' },
        { value: 'refunded', label: 'Refunded' }
      ]
    },
    { key: 'dateFromFilter', label: 'From', type: 'date' },
    { key: 'dateToFilter', label: 'To', type: 'date' }
  ];
}