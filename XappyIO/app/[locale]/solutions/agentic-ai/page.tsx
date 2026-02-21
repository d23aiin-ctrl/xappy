'use client';

import Link from 'next/link';
import { Header, Footer, Badge, Button } from '@/components';
import { Animated, Stagger, StaggerItem, HoverCard, Counter, motion } from '@/components/ui';

const features = [
  { icon: 'ri-brain-line', title: 'Multi-Step Reasoning', desc: 'Agents that break down complex problems into logical steps and execute them sequentially with built-in error handling.' },
  { icon: 'ri-tools-line', title: 'Tool Use & APIs', desc: 'Seamlessly integrate with databases, APIs, and external services. Your agents can query data, send emails, update CRMs, and more.' },
  { icon: 'ri-loop-left-line', title: 'Self-Correction', desc: 'Built-in feedback loops that detect errors and automatically retry with improved approaches.' },
  { icon: 'ri-user-settings-line', title: 'Human-in-the-Loop', desc: 'Define approval checkpoints for sensitive operations. Agents pause and await human confirmation when needed.' },
  { icon: 'ri-database-2-line', title: 'Long-Term Memory', desc: 'Persistent memory systems that retain context across sessions, enabling personalized and context-aware interactions.' },
  { icon: 'ri-shield-check-line', title: 'Guardrails & Safety', desc: 'Built-in constraints and safety mechanisms to ensure agents operate within defined boundaries.' },
];

const useCases = [
  { icon: 'ri-customer-service-2-line', title: 'Customer Support Agents', desc: 'Autonomous agents that handle support tickets, escalate issues, and resolve queries 24/7.' },
  { icon: 'ri-file-search-line', title: 'Research Assistants', desc: 'Agents that gather information from multiple sources, synthesize findings, and generate reports.' },
  { icon: 'ri-flow-chart', title: 'Workflow Automation', desc: 'End-to-end process automation with intelligent decision-making at each step.' },
  { icon: 'ri-code-s-slash-line', title: 'Code Generation & Review', desc: 'AI agents that write, test, and review code with minimal human intervention.' },
];

const techStack = [
  { name: 'LangChain', desc: 'Agent Framework' },
  { name: 'OpenAI', desc: 'GPT-4, GPT-4o' },
  { name: 'Anthropic', desc: 'Claude 3.5, 4' },
  { name: 'Vector DBs', desc: 'Pinecone, Weaviate' },
];

export default function AgenticAIPage() {
  return (
    <>
      <Header activePage="solutions" />

      {/* Page Header */}
      <section className="page-header" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #818cf8 100%)' }}>
        <div className="container">
          <Animated animation="fadeInUp">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <i className="ri-robot-2-line text-3xl text-white" />
              </div>
              <div>
                <h1 className="mb-1">Agentic AI</h1>
                <p className="m-0 opacity-90">Autonomous AI Agents</p>
              </div>
            </div>
          </Animated>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="breadcrumb-wrapper">
        <div className="container">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item"><Link href="/">Home</Link></li>
              <li className="breadcrumb-item"><Link href="/solutions">Solutions</Link></li>
              <li className="breadcrumb-item active" aria-current="page">Agentic AI</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main id="main-content" role="main">
        {/* Overview Section */}
        <section className="section bg-white">
          <div className="container">
            <div className="two-col-section">
              <div className="col-left">
                <Animated animation="fadeInUp">
                  <Badge icon="ri-robot-line" className="mb-4" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(129, 140, 248, 0.1) 100%)', color: '#6366f1', borderColor: 'rgba(99, 102, 241, 0.2)' }}>
                    Autonomous Systems
                  </Badge>
                </Animated>
                <Animated animation="fadeInUp" delay={0.1}>
                  <h2 className="text-3xl md:text-4xl font-bold text-text-dark mb-6">AI That Works While You Sleep</h2>
                </Animated>
                <Animated animation="fadeInUp" delay={0.2}>
                  <p className="text-lg text-text-muted leading-relaxed mb-5">
                    Agentic AI represents the next evolution of artificial intelligence—systems that don&apos;t just respond to prompts but actively reason, plan, and execute complex multi-step tasks with minimal human intervention.
                  </p>
                </Animated>
                <Animated animation="fadeInUp" delay={0.3}>
                  <p className="text-lg text-text-muted leading-relaxed mb-8">
                    Our agentic systems combine the latest LLMs with sophisticated orchestration frameworks, enabling autonomous operation while maintaining human oversight where it matters most.
                  </p>
                </Animated>
                <Animated animation="fadeInUp" delay={0.4}>
                  <div className="flex gap-3 flex-wrap">
                    <Button variant="cta" asChild>
                      <Link href="/contact">
                        <span>Start Building</span>
                        <i className="ri-arrow-right-line" />
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/solutions">
                        <span>All Solutions</span>
                        <i className="ri-arrow-right-line" />
                      </Link>
                    </Button>
                  </div>
                </Animated>
              </div>
              <div className="col-right">
                <Animated animation="fadeInRight" delay={0.3}>
                  <Stagger className="grid grid-cols-2 gap-5" staggerDelay={0.1}>
                    {[
                      { icon: 'ri-brain-line', label: 'Reasoning & Planning' },
                      { value: 24, suffix: '/7', label: 'Autonomous Operation' },
                      { icon: 'ri-tools-line', label: 'Tool Integration' },
                      { value: 100, suffix: '+', label: 'APIs Supported' },
                    ].map((stat, i) => (
                      <StaggerItem key={i}>
                        <HoverCard className="service-card text-center p-7">
                          <div className="text-4xl font-extrabold text-primary-blue mb-2">
                            {stat.icon ? (
                              <i className={stat.icon} />
                            ) : (
                              <Counter from={0} to={stat.value as number} duration={2} suffix={stat.suffix} />
                            )}
                          </div>
                          <div className="text-text-muted text-sm">{stat.label}</div>
                        </HoverCard>
                      </StaggerItem>
                    ))}
                  </Stagger>
                </Animated>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="section">
          <div className="container">
            <div className="section-header">
              <Animated animation="fadeInUp">
                <Badge icon="ri-star-line">Capabilities</Badge>
              </Animated>
              <Animated animation="fadeInUp" delay={0.1}>
                <h2 className="section-title">What Our Agents Can Do</h2>
              </Animated>
              <Animated animation="fadeInUp" delay={0.2}>
                <p className="section-subtitle">Advanced capabilities that enable true autonomous operation</p>
              </Animated>
            </div>
            <Stagger className="grid-3-col" staggerDelay={0.1}>
              {features.map((feature, i) => (
                <StaggerItem key={i} className="grid-item">
                  <HoverCard className="service-card p-7 h-full">
                    <motion.div
                      className="w-14 h-14 bg-gradient-primary rounded-2xl flex items-center justify-center mb-5"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <i className={`${feature.icon} text-2xl text-white`} />
                    </motion.div>
                    <h3 className="text-lg font-bold mb-3">{feature.title}</h3>
                    <p className="text-text-muted text-sm leading-relaxed">{feature.desc}</p>
                  </HoverCard>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="section bg-white">
          <div className="container">
            <div className="section-header">
              <Animated animation="fadeInUp">
                <Badge icon="ri-lightbulb-line">Use Cases</Badge>
              </Animated>
              <Animated animation="fadeInUp" delay={0.1}>
                <h2 className="section-title">Where Agentic AI Shines</h2>
              </Animated>
              <Animated animation="fadeInUp" delay={0.2}>
                <p className="section-subtitle">Real-world applications that deliver measurable ROI</p>
              </Animated>
            </div>
            <Stagger className="grid-2-col" staggerDelay={0.15}>
              {useCases.map((useCase, i) => (
                <StaggerItem key={i} className="grid-item">
                  <HoverCard className="service-card p-8 h-full">
                    <div className="flex items-start gap-5">
                      <motion.div
                        className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center flex-shrink-0"
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <i className={`${useCase.icon} text-2xl text-white`} />
                      </motion.div>
                      <div>
                        <h3 className="text-xl font-bold mb-2">{useCase.title}</h3>
                        <p className="text-text-muted leading-relaxed">{useCase.desc}</p>
                      </div>
                    </div>
                  </HoverCard>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* Tech Stack Section */}
        <section className="section" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)' }}>
          <div className="container">
            <div className="section-header">
              <Animated animation="fadeInUp">
                <Badge icon="ri-stack-line" variant="white">Tech Stack</Badge>
              </Animated>
              <Animated animation="fadeInUp" delay={0.1}>
                <h2 className="section-title text-white">Built on Best-in-Class Tools</h2>
              </Animated>
            </div>
            <Stagger className="flex flex-wrap justify-center gap-6" staggerDelay={0.1}>
              {techStack.map((tech, i) => (
                <StaggerItem key={i}>
                  <div className="bg-white/10 backdrop-blur-md px-8 py-6 rounded-2xl text-center border border-white/10 min-w-[160px]">
                    <div className="text-xl font-bold text-white mb-1">{tech.name}</div>
                    <div className="text-sm text-white/70">{tech.desc}</div>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="container">
            <Animated animation="scaleIn">
              <div className="cta-card">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  Ready to Build Your AI Agent?
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  Let&apos;s discuss your use case and design an agentic system that delivers real value.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                >
                  <Button variant="ctaWhite" asChild>
                    <Link href="/contact">
                      <span>Schedule Consultation</span>
                      <i className="ri-arrow-right-line" />
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </Animated>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
