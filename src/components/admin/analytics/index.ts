import dynamic from "next/dynamic";

export { DateRangePicker, type DateRange } from "./DateRangePicker";
export const RevenueChart = dynamic(() => import("./RevenueChart").then(m => m.RevenueChart), { ssr: false });
export const OrdersChart = dynamic(() => import("./OrdersChart").then(m => m.OrdersChart), { ssr: false });
export const TopProducts = dynamic(() => import("./TopProducts").then(m => m.TopProducts), { ssr: false });
export const TrafficSources = dynamic(() => import("./TrafficSources").then(m => m.TrafficSources), { ssr: false });
export const RecentActivity = dynamic(() => import("./RecentActivity").then(m => m.RecentActivity), { ssr: false });
