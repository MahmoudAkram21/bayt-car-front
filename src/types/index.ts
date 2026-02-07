// Enums
export enum UserRole {
  OWNER = 'OWNER',
  PROVIDER = 'PROVIDER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum OfferStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
}

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  WALLET = 'WALLET',
}

// Multilingual text type
export interface MultilingualText {
  en: string;
  ar: string;
}

// User
export interface User {
  id: string;
  email: string;
  phone?: string;
  password?: string;
  role: UserRole;
  name: MultilingualText;
  avatar?: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// Service Provider
export interface ServiceProvider {
  id: string;
  userId: string;
  businessName: MultilingualText;
  description: MultilingualText;
  address: MultilingualText;
  city: MultilingualText;
  state?: MultilingualText;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  phone: string;
  email: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

// Service Category
export interface ServiceCategory {
  id: string;
  name: MultilingualText;
  description?: MultilingualText;
  slug: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

// Service (list item – may use snake_case from API)
export interface Service {
  id: string;
  providerId?: string;
  categoryId?: string;
  category_id?: number;
  name: MultilingualText | string;
  description?: MultilingualText | string | null;
  icon_url?: string | null;
  price?: number;
  base_price?: number;
  duration?: number;
  isActive?: boolean;
  is_negotiable?: boolean;
  isNegotiable?: boolean;
  createdAt?: string;
  updatedAt?: string;
  provider?: ServiceProvider;
  category?: ServiceCategory;
  attributes?: ServiceAttribute[];
}

// Attribute option (for booking options)
export interface AttributeOption {
  id: number;
  label: string;
  price_adjustment?: number;
}

// Service attribute (e.g. Car Size, Wash Type)
export interface ServiceAttribute {
  id: number;
  label: string;
  service_id?: number;
  options?: AttributeOption[];
}

// Service detail (full for detail page)
export interface ServiceDetail extends Service {
  attributes?: ServiceAttribute[];
}

// Booking
export interface Booking {
  id: string;
  ownerId: string;
  providerId: string;
  serviceId: string;
  offerId?: string;
  scheduledDate: string;
  notes?: MultilingualText;
  finalPrice: number;
  status: BookingStatus;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  owner?: User;
  provider?: ServiceProvider;
  service?: Service;
}

// Price Offer
export interface PriceOffer {
  id: string;
  serviceId: string;
  customerId: string;
  providerId: string;
  offeredPrice: number;
  status: OfferStatus;
  customerNote?: MultilingualText;
  providerNote?: MultilingualText;
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
  service?: Service;
  customer?: User;
  provider?: ServiceProvider;
}

// Commission
export interface Commission {
  id: string;
  bookingId: string;
  providerId: string;
  amount: number;
  isPaid: boolean;
  paymentMethod?: PaymentMethod;
  dueDate: string;
  paidAt?: string;
  createdAt: string;
  booking?: Booking;
  provider?: ServiceProvider;
}

// Wallet
export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

// Auth
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// API Response wrappers
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
