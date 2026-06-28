"use client";

import { useEffect, useState } from "react";
import Nav from "@/components/app/Nav";
import TaskChat from "@/components/app/TaskChat";
import CreditBadge from "@/components/app/CreditBadge";
import { fetchState } from "@/lib/client";
import type { Agent } from "@/lib/types";

export default function TaskPage() {
  const [agents, setAgents] = useState<Agent[]>([]);

  useEffect(() => {
    fetchState()
      .then((s) => setAgents(s.agents))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-runic-grid flex flex-col">
      <Nav right={<CreditBadge />} />
      <div className="flex flex-col flex-1 min-h-0 max-h-[calc(100vh-3.5rem)] sm:max-h-[calc(100vh-4rem)]">
        <TaskChat agents={agents} />
      </div>
    </div>
  );
}
