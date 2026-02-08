export type ErrorCode = 400 | 403 | 404 | 500;
interface ErrorPageViewProps {
    code: ErrorCode;
    title: string;
    description: string;
    icon: React.ReactNode;
    showLoginLink?: boolean;
}
export declare function ErrorPageView({ code, title, description, icon, showLoginLink }: ErrorPageViewProps): import("react/jsx-runtime").JSX.Element;
export {};
