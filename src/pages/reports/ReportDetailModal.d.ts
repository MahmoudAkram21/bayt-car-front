import type { Report } from "../../services/report.service";
interface ReportDetailModalProps {
    report: Report | null;
    isOpen: boolean;
    onClose: () => void;
}
export declare const ReportDetailModal: ({ report, isOpen, onClose }: ReportDetailModalProps) => import("react/jsx-runtime").JSX.Element | null;
export {};
