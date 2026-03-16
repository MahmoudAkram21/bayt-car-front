export declare enum UserRole {
    OWNER = "OWNER",
    PROVIDER = "PROVIDER",
    ADMIN = "ADMIN",
    SUPER_ADMIN = "SUPER_ADMIN"
}
export declare enum BookingStatus {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}
export declare enum PaymentStatus {
    PENDING = "PENDING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    REFUNDED = "REFUNDED"
}
export declare enum OfferStatus {
    PENDING = "PENDING",
    ACCEPTED = "ACCEPTED",
    REJECTED = "REJECTED",
    WITHDRAWN = "WITHDRAWN"
}
export declare enum PaymentMethod {
    CASH = "CASH",
    CARD = "CARD",
    WALLET = "WALLET"
}
export interface MultilingualText {
    en: string;
    ar: string;
}
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
export interface ServiceCategoryRef {
    id: number;
    name_ar: string;
    name_en?: string | null;
    slug: string;
}
export type PricingType = 'FIXED' | 'BY_OPTION' | 'PER_UNIT' | 'CUSTOMER_DEFINED';
export interface Service {
    id: string | number;
    name: MultilingualText | string;
    slug?: string;
    description?: MultilingualText | string | null;
    icon_url?: string | null;
    sort_order?: number;
    category_id?: number | null;
    category?: ServiceCategoryRef | null;
    gps_radius_km?: number | null;
    pricing_type?: PricingType;
    base_price?: number;
    price?: number;
    unit_label?: string | null;
    is_negotiable?: boolean;
    isNegotiable?: boolean;
    is_active?: boolean;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
    attributes?: ServiceAttribute[];
}
export interface AttributeOption {
    id: number;
    label: string;
    price_adjustment?: number;
}
export interface ServiceAttribute {
    id: number;
    label: string | MultilingualText;
    service_id?: number;
    options?: AttributeOption[];
}
export interface ServiceDetail extends Service {
    attributes?: ServiceAttribute[];
}
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
export interface Wallet {
    id: string;
    userId: string;
    balance: number;
    createdAt: string;
    updatedAt: string;
}
export interface LoginRequest {
    email: string;
    password: string;
}
export interface LoginResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
}
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
