import { OrderStatus } from "./Enums.js";
import { Order, Product, Store } from "./Models.js";

export interface CreateStoreRequest {
  Name: string;
  OwnerName: string;
  WhatsappNumber: string;
  CampusLocation: string;
  IsOpen?: boolean;
}

export interface UpdateStoreRequest {
  Name?: string;
  OwnerName?: string;
  WhatsappNumber?: string;
  CampusLocation?: string;
  IsOpen?: boolean;
}

export interface CreateProductRequest {
  StoreId: string;
  CategoryId: string;
  Name: string;
  Description: string;
  Price: number;
  ImageUrl: string;
  IsAvailable?: boolean;
}

export interface UpdateProductRequest {
  CategoryId?: string;
  Name?: string;
  Description?: string;
  Price?: number;
  ImageUrl?: string;
  IsAvailable?: boolean;
}

export interface ProductFilterQuery {
  StoreId?: string;
  CategoryId?: string;
  IsAvailable?: boolean;
}

export interface CreateOrderItemRequest {
  ProductId: string;
  Quantity: number;
}

export interface CreateOrderRequest {
  StoreId: string;
  CustomerName: string;
  CustomerWhatsapp: string;
  DeliveryLocation: string;
  Notes?: string;
  Items: CreateOrderItemRequest[];
}

export interface CreateOrderResponse {
  Order: Order;
  WhatsappUrl: string;
}

export interface UpdateOrderStatusRequest {
  Status: OrderStatus;
}

export interface DashboardResponse {
  Store: Store;
  TotalSales: number;
  ActiveOrders: number;
  TotalMenu: number;
  RecentOrders: Order[];
}

export interface ErrorResponse {
  Message: string;
}

export type ProductListResponse = Product[];
