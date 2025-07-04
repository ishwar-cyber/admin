export interface CouponseM {
    _id?: string; // Optional for creation, will be provided by MongoDB
    code: string;
    discount?: number;
    getBy?: any;
    product?: string; // Optional, can be used for specific product discount
    discountType?: string; // Type of discount
    applyTo?: string; // Can be 'all' or specific product ID
    startDate: Date | string; // Can accept both Date object or ISO string
    expiryDate: Date | string;
    noExpiry?: boolean; // Indicates if the coupon has no expiry date
    createdAt?: Date; // Added by timestamps
    updatedAt?: Date; // Added by timestamps
}