// customer.model.ts
export interface Customer {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    status?: 'active' | 'inactive' | 'archived';
    createdAt?: Date;
    updatedAt?: Date;
  }
  
  export interface CustomerApiResponse {
    success: boolean;
    data: Customer[];
    total: number;
    page: number;
    limit: number;
  }
  
  export interface CustomerQueryParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }