import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Agentic AI Solutions - Autonomous AI Agents | Mobirizer',
  description:
    'Build autonomous AI agents that reason, plan, and execute complex tasks. Multi-step workflows, tool integration, and human-in-the-loop systems.',
  keywords: 'Agentic AI, Autonomous AI, AI Agents, Workflow Automation, AI Planning, Tool Integration',
  openGraph: {
    title: 'Agentic AI Solutions | Mobirizer',
    description: 'Autonomous AI agents for complex multi-step task execution.',
    type: 'website',
  },
};

export default function AgenticAILayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
