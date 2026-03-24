interface Commission {
    id: string | number;
    amount: number;
    isPaid: boolean;
    dueDate?: string | null;
    paidAt?: string | null;
    paymentMethod?: string | null;
    rate?: number | null;
    provider?: {
        businessName?: string | {
            en?: string;
            ar?: string;
        };
        email?: string;
        phone?: string;
        user?: {
            name?: string;
            email?: string;
            phone?: string;
        };
    };
    booking?: {
        id?: string | number;
        service?: {
            name?: string | {
                en?: string;
                ar?: string;
            };
        };
        customer?: {
            name?: string;
        };
        finalPrice?: number;
        final_agreed_price?: number;
        status?: string;
    };
    serviceRequest?: {
        id?: string | number;
        service?: {
            name?: string | {
                en?: string;
                ar?: string;
            };
        };
        final_agreed_price?: number;
        customer?: {
            name?: string;
        };
    };
}
interface CommissionDetailsModalProps {
    commission: Commission | null;
    onClose: () => void;
}
export declare const CommissionDetailsModal: ({ commission: c, onClose }: CommissionDetailsModalProps) => import("react/jsx-runtime").JSX.Element;
export {};
