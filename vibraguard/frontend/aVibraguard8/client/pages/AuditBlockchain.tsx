import { useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { AuditKPICards } from "./audit/AuditKPICards";
import { TraceabilityGraph } from "./audit/TraceabilityGraph";
import { TransactionTable } from "./audit/TransactionTable";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export default function AuditBlockchain() {
  return (
    <DashboardLayout breadcrumb="Audit">
      <div className="flex flex-col gap-6 max-w-full">
        {/* KPI Cards */}
        <AuditKPICards />

        {/* Traceability graph */}
        <TraceabilityGraph />

        {/* Transaction table */}
        <TransactionTable />
      </div>
    </DashboardLayout>
  );
}

