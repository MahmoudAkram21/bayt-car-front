import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import React from "react";
import {
  Search,
  Calendar,
  RefreshCw,
  LayoutGrid,
  List,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Briefcase,
  Eye,
} from "lucide-react";
import { BookingStatus } from "../../types";
import { bookingService } from "../../services/booking.service";
import { format } from "date-fns";
import { BookingDetailsModal } from "./BookingDetailsModal";
import { useTranslation } from "react-i18next";

type ViewMode = "cards" | "table";
//
export const BookingsPage = () => {
  const { t } = useTranslation();

  const statusTabs = [
    { value: "all", label: t("common.all") },
    { value: BookingStatus.PENDING, label: t("common.pending") },
    { value: BookingStatus.CONFIRMED, label: t("bookings.statusConfirmed") },
    { value: BookingStatus.IN_PROGRESS, label: t("bookings.statusInProgress") },
    { value: BookingStatus.COMPLETED, label: t("common.completed") },
    { value: BookingStatus.CANCELLED, label: t("common.cancelled") },
  ];
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null,
  );

  const [page, setPage] = useState(1);
  const limit = 12;

  // Reset page when filters change
  React.useEffect(() => {
    setPage(1);
  }, [searchTerm, activeTab]);

  React.useEffect(() => {
    const serviceRequestId = searchParams.get("serviceRequestId");
    if (serviceRequestId) {
      setSelectedBookingId(serviceRequestId);
    }
  }, [searchParams]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["bookings", { status: activeTab, search: searchTerm, page }],
    queryFn: () =>
      bookingService.getAllBookings({
        status: activeTab !== "all" ? (activeTab as BookingStatus) : undefined,
        search: searchTerm || undefined,
        page,
        limit,
      }),
  });

  const getName = (name: any) => {
    if (typeof name === "string") return name;
    return name?.en || name?.ar || "N/A";
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      [BookingStatus.PENDING]:
        "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
      [BookingStatus.CONFIRMED]:
        "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
      [BookingStatus.IN_PROGRESS]:
        "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
      [BookingStatus.COMPLETED]:
        "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
      [BookingStatus.CANCELLED]:
        "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    };
    return (
      colors[status] ||
      "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
    );
  };

  const list = (data as any)?.data ?? [];
  const total =
    (data as any)?.pagination?.total ?? (data as any)?.total ?? list.length;
  // Note: These stats might be inaccurate if pagination is server-side and we only have the current page.
  // Ideally, valid stats should come from a dedicated API endpoint.
  // For now, consistent with existing logic, we display counts from loaded data (or full list if not paginated).
  const statPending = list.filter(
    (b: any) => b.status === BookingStatus.PENDING,
  ).length;
  const statCompleted = list.filter(
    (b: any) => b.status === BookingStatus.COMPLETED,
  ).length;
  const statCancelled = list.filter(
    (b: any) => b.status === BookingStatus.CANCELLED,
  ).length;

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            {t("common.bookings")}
          </h1>
          <p className="mt-2 max-w-2xl text-base text-gray-600 dark:text-gray-400">
            {t("bookings.subtitle")}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="shrink-0 rounded-xl gap-2 hover:bg-white/50 hover:text-teal-600 dark:hover:bg-gray-800/50 dark:hover:text-teal-400"
        >
          <RefreshCw className="h-4 w-4" />
          {t("common.refresh")}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="group overflow-hidden rounded-2xl border border-gray-100 bg-white/60 p-6 shadow-sm backdrop-blur-xl transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t("bookings.totalBookings")}
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white tabular-nums">
                {total}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400">
              <Calendar className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="group overflow-hidden rounded-2xl border border-gray-100 bg-white/60 p-6 shadow-sm backdrop-blur-xl transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t("common.pending")}
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white tabular-nums">
                {statPending}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400">
              <Clock className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="group overflow-hidden rounded-2xl border border-gray-100 bg-white/60 p-6 shadow-sm backdrop-blur-xl transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t("common.completed")}
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white tabular-nums">
                {statCompleted}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 text-teal-600 dark:bg-teal-900/40 dark:text-teal-400">
              <CheckCircle className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="group overflow-hidden rounded-2xl border border-gray-100 bg-white/60 p-6 shadow-sm backdrop-blur-xl transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t("common.cancelled")}
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white tabular-nums">
                {statCancelled}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400">
              <XCircle className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      <Card className="border-gray-100 bg-white/60 shadow-sm backdrop-blur-xl dark:border-gray-700 dark:bg-gray-800/60">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <Input
                placeholder={t("bookings.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-xl border-gray-200 bg-white/50 pl-10 focus:ring-2 focus:ring-teal-500 dark:border-gray-600 dark:bg-gray-900/50"
              />
            </div>
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white/50 px-4 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-teal-500 dark:border-gray-600 dark:bg-gray-900/50 dark:text-white"
            >
              {statusTabs.map((tab) => (
                <option key={tab.value} value={tab.value}>
                  {tab.label}
                </option>
              ))}
            </select>
            <div className="flex rounded-xl border border-gray-200 bg-white/50 dark:border-gray-600 dark:bg-gray-900/50 overflow-hidden">
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors ${
                  viewMode === "cards"
                    ? "bg-teal-500 text-white"
                    : "text-gray-600 hover:bg-gray-100/50 dark:text-gray-400 dark:hover:bg-gray-800/50"
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <div className="w-px bg-gray-200 dark:bg-gray-600" />
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors ${
                  viewMode === "table"
                    ? "bg-teal-500 text-white"
                    : "text-gray-600 hover:bg-gray-100/50 dark:text-gray-400 dark:hover:bg-gray-800/50"
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-2xl border-gray-100 bg-white/60 shadow-lg backdrop-blur-xl dark:border-gray-700 dark:bg-gray-800/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Calendar className="h-5 w-5 text-teal-500" />
            {t("bookings.bookingList")}
          </CardTitle>
          <CardDescription>
            {data ? `${total} ${t("bookings.found")}` : t("bookings.subtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
            </div>
          )}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 py-8 text-center text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              <p>{t("bookings.loadError")}</p>
            </div>
          )}
          {list.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-teal-50 dark:bg-teal-900/20">
                <Calendar className="h-12 w-12 text-teal-300 dark:text-teal-600" />
              </div>
              <p className="mt-4 text-xl font-bold text-gray-900 dark:text-white">
                {t("bookings.noBookings")}
              </p>
              <p className="mt-2 max-w-md text-center text-gray-500 dark:text-gray-400">
                {t("bookings.noBookingsDesc")}
              </p>
            </div>
          )}

          {viewMode === "cards" && list.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {list.map((booking: any) => (
                <div
                  key={booking.id}
                  className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white/80 p-5 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800/80"
                >
                  <div className="absolute right-3 top-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(booking.status)}`}
                    >
                      {String(
                        t(`bookings.status.${booking.status}`, booking.status),
                      )}
                    </span>
                  </div>

                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400">
                    <Briefcase className="h-6 w-6" />
                  </div>

                  <h3 className="mb-1 font-semibold text-gray-900 dark:text-white line-clamp-1">
                    {getName(booking.service?.name) || t("bookings.booking")}
                  </h3>

                  <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="truncate">
                        {getName(
                          booking.customer?.name || booking.owner?.name,
                        ) || t("bookings.unknownUser")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      <span className="truncate">
                        {getName(
                          booking.provider?.user?.name ||
                            booking.provider?.name,
                        ) ||
                          getName(booking.provider?.businessName) ||
                          t("bookings.unknownProvider")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {booking.created_at || booking.createdAt
                          ? format(
                              new Date(booking.created_at || booking.createdAt),
                              "MMM dd, yyyy",
                            )
                          : "—"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-700">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500">
                        {t("bookings.total")}
                      </span>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {(booking.final_agreed_price ?? booking.finalPrice) !=
                        null
                          ? `${Number(booking.final_agreed_price ?? booking.finalPrice).toFixed(2)}`
                          : "0.00"}{" "}
                        <span className="text-xs font-normal text-gray-500">
                          SAR
                        </span>
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedBookingId(booking.id)}
                      className="h-8 gap-1.5 rounded-lg border-teal-200 text-teal-700 hover:bg-teal-50 hover:text-teal-800 dark:border-teal-800 dark:text-teal-400 dark:hover:bg-teal-900/30"
                    >
                      <Eye className="h-3.5 w-3.5" /> {t("common.view")}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {viewMode === "table" && list.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100/50 dark:bg-gray-700/40">
                  <tr>
                    <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      {t("bookings.customer")}
                    </th>
                    <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      {t("common.service")}
                    </th>
                    <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      {t("common.provider")}
                    </th>
                    <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      {t("bookings.date")}
                    </th>
                    <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      {t("bookings.total")}
                    </th>
                    <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      {t("common.status")}
                    </th>
                    <th className="px-6 py-4 text-end text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      {t("common.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {list.map((booking: any) => (
                    <tr
                      key={booking.id}
                      className="transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-700/30"
                    >
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                            <User className="h-4 w-4" />
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {getName(
                              booking.customer?.name || booking.owner?.name,
                            ) || t("common.notFound")}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {getName(booking.service?.name) || t("common.notFound")}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {getName(
                          booking.provider?.user?.name ||
                            booking.provider?.name,
                        ) ||
                          getName(booking.provider?.businessName) ||
                          t("common.notFound")}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {booking.created_at || booking.createdAt
                          ? format(
                              new Date(booking.created_at || booking.createdAt),
                              "MMM dd, yyyy",
                            )
                          : "—"}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {(booking.final_agreed_price ?? booking.finalPrice) !=
                        null
                          ? `${Number(booking.final_agreed_price ?? booking.finalPrice).toFixed(2)} SAR`
                          : "—"}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(booking.status)}`}
                        >
                          {String(
                            t(
                              `bookings.status.${booking.status}`,
                              booking.status,
                            ),
                          )}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedBookingId(booking.id)}
                          className="h-8 w-8 p-0 rounded-full hover:bg-teal-50 hover:text-teal-600 dark:hover:bg-teal-900/30 dark:hover:text-teal-400"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && list.length > 0 && (
            <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-700">
              <span className="text-sm text-gray-500">
                {t("bookings.pagination", {
                  start: (page - 1) * limit + 1,
                  end: Math.min(page * limit, total),
                  total,
                })}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center justify-center px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("bookings.pageOf", { page, totalPages })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <BookingDetailsModal
        bookingId={selectedBookingId}
        onClose={() => {
          setSelectedBookingId(null);
          if (searchParams.has("serviceRequestId")) {
            const next = new URLSearchParams(searchParams);
            next.delete("serviceRequestId");
            setSearchParams(next, { replace: true });
          }
        }}
      />
    </div>
  );
};
