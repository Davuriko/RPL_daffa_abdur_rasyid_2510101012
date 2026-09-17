import { OrderStatus } from "./Enums.js";

export interface Store {
  Id: string;
  Name: string;
  OwnerName: string;
  WhatsappNumber: string;
  CampusLocation: string;
  IsOpen: boolean;
  CreatedAt: string;
}

export interface Category {
  Id: string;
  Name: string;
  CreatedAt: string;
}

export interface Product {
  Id: string;
  StoreId: string;
  CategoryId: string;
  Name: string;
  Description: string;
  Price: number;
  ImageUrl: string;
  IsAvailable: boolean;
  CreatedAt: string;
  Store?: Store;
  Category?: Category;
}

export interface OrderItem {
  Id: string;
  OrderId: string;
  ProductId: string;
  Quantity: number;
  UnitPrice: number;
  Subtotal: number;
  Product?: Product;
}

export interface Order {
  Id: string;
  StoreId: string;
  CustomerName: string;
  CustomerWhatsapp: string;
  DeliveryLocation: string;
  Notes: string;
  TotalPrice: number;
  Status: OrderStatus;
  CreatedAt: string;
  Items?: OrderItem[];
  Store?: Store;
}
