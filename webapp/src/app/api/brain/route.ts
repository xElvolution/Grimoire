import { NextResponse } from "next/server";
import { db } from "@/lib/store";
import { buildNeuronGraph, agentBrainHealth } from "@/lib/neuron";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const agents = db.agents();
  const skills = db.skills();
  const memories = db.memories();
  const synapses = db.synapses();
  const graph = buildNeuronGraph(agents, skills, memories, synapses);
  const health = agents.map((a) =>
    agentBrainHealth(a.id, agents, memories, skills, synapses)
  );

  return NextResponse.json({
    graph,
    synapses,
    health,
    stats: {
      neurons: graph.nodes.length,
      synapses: graph.links.length,
      memories: memories.filter((m) => !m.superseded).length,
      skills: skills.length,
      agents: agents.length,
    },
  });
}
