'use client';

import Link from 'next/link';
import { StatCard, Button, Badge, Animated, Stagger, StaggerItem, Float, GradientText, HoverCard, motion, Counter } from '@/components';

export function HomePageContent() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-hero overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1920&q=80')",
          }}
        />
        <div className="container relative z-10 py-20">
          <div className="hero-two-col">
            <div className="hero-content-col">
              <div className="hero-content">
                <Animated animation="fadeInUp" delay={0}>
                  <Badge icon="ri-rocket-2-line" variant="white">
                    AI Solutions Since 2019
                  </Badge>
                </Animated>
                <Animated animation="fadeInUp" delay={0.1}>
                  <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mt-6 mb-6">
                    Transform Your Business with{' '}
                    <GradientText>Effective AI Solutions</GradientText>
                  </h1>
                </Animated>
                <Animated animation="fadeInUp" delay={0.2}>
                  <p className="text-lg md:text-xl text-white/80 mb-8 leading-relaxed">
                    We deliver tailored AI services from strategy through implementation, designed to
                    drive efficiency and growth without breaking your budget. Real solutions that
                    work, backed by a decade of expertise.
                  </p>
                </Animated>
                <Animated animation="fadeInUp" delay={0.3}>
                  <div className="flex gap-3 flex-wrap mb-8">
                    <Button variant="ctaWhite" asChild>
                      <Link href="/contact">
                        <span>Get Free Consultation</span>
                        <i className="ri-arrow-right-line" />
                      </Link>
                    </Button>
                    <Button variant="ghost" asChild>
                      <Link href="/products">
                        <span>Explore Products</span>
                        <i className="ri-arrow-right-line" />
                      </Link>
                    </Button>
                  </div>
                </Animated>
                <Animated animation="fadeInUp" delay={0.4}>
                  {/* Divider */}
                  <div className="w-full h-px bg-white/20 mb-8" />
                  <div className="flex gap-12 flex-wrap">
                    {[
                      { value: 10, suffix: '+', label: 'Years Experience', gradient: 'from-white to-white/80' },
                      { value: 100, suffix: '+', label: 'Clients Served', gradient: 'from-white to-white/80' },
                      { value: 200, suffix: '+', label: 'Projects Delivered', gradient: 'from-white to-white/80' },
                    ].map((stat, i) => (
                      <motion.div
                        key={i}
                        className="text-center"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + i * 0.15, duration: 0.5 }}
                        viewport={{ once: true }}
                      >
                        <div className={`text-4xl md:text-5xl font-extrabold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                          <Counter from={0} to={stat.value} duration={2} suffix={stat.suffix} />
                        </div>
                        <div className="text-sm text-white/70 mt-1">{stat.label}</div>
                      </motion.div>
                    ))}
                  </div>
                </Animated>
              </div>
            </div>
            <div className="hero-image-col">
              <Animated animation="fadeInRight" delay={0.3}>
                <Float intensity={15} duration={5}>
                  <div className="relative p-5">
                    <img
                      src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&q=80"
                      alt="AI Robot Technology"
                      className="w-full rounded-3xl shadow-2xl"
                    />
                    <motion.div
                      className="absolute bottom-0 left-0 bg-gradient-primary px-6 py-4 rounded-2xl shadow-primary-glow"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6, type: 'spring' }}
                      viewport={{ once: true }}
                    >
                      <div className="text-2xl font-extrabold text-white">200+</div>
                      <div className="text-xs text-white/90">Projects Delivered</div>
                    </motion.div>
                  </div>
                </Float>
              </Animated>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main id="main-content" role="main">
        {/* Philosophy Section */}
        <section className="py-20 bg-white">
          <div className="container">
            <div className="two-col-section">
              <div className="col-left">
                <Animated animation="fadeInLeft">
                  <Badge icon="ri-lightbulb-flash-line" className="mb-5">
                    Our Philosophy
                  </Badge>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-text-dark mb-6 leading-tight">
                    Your Ideal Partner in <span className="text-primary-blue">AI Excellence</span>
                  </h2>
                  <p className="text-lg text-text-muted leading-relaxed mb-6">
                    We don&apos;t believe in abstract strategies that overpromise and underdeliver. At
                    Mobirizer, we focus on building real AI solutions backed by clear strategy that
                    effectively boosts your business.
                  </p>
                  <p className="text-lg text-text-muted leading-relaxed mb-8">
                    Our approach is simple: understand your unique challenges, design tailored
                    solutions, and deliver measurable results. No fluff, no buzzwords—just AI that
                    works.
                  </p>
                  <div className="flex gap-6 flex-wrap">
                    {[
                      { icon: 'ri-check-double-line', title: 'Proven Track Record', desc: '200+ successful projects' },
                      { icon: 'ri-shield-check-line', title: 'Enterprise Ready', desc: 'Government & enterprise grade' },
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        className="flex items-center gap-3"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + i * 0.1 }}
                        viewport={{ once: true }}
                      >
                        <div className="w-10 h-10 bg-primary-blue/10 rounded-lg flex items-center justify-center">
                          <i className={`${item.icon} text-primary-blue text-xl`} />
                        </div>
                        <div>
                          <div className="font-semibold text-text-dark text-sm">{item.title}</div>
                          <div className="text-sm text-text-muted">{item.desc}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </Animated>
              </div>
              <div className="col-right">
                <Animated animation="fadeInRight">
                  <div className="relative">
                    <img
                      src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80"
                      alt="Team collaboration"
                      className="rounded-3xl shadow-card-hover"
                    />
                    <motion.div
                      className="absolute -top-4 -right-4 bg-white p-5 rounded-2xl shadow-card z-10"
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
                      viewport={{ once: true }}
                    >
                      <div className="text-3xl font-extrabold text-primary-blue">98%</div>
                      <div className="text-sm text-text-muted">Client Satisfaction</div>
                    </motion.div>
                  </div>
                </Animated>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="section">
          <div className="container">
            <Animated animation="fadeInUp" className="section-header">
              <Badge icon="ri-award-line">Why Choose Us</Badge>
              <h2 className="section-title">Our Core Expertise</h2>
              <p className="section-subtitle">
                What sets us apart in delivering exceptional AI solutions
              </p>
            </Animated>
            <Stagger className="grid-4-col" staggerDelay={0.1}>
              {[
                {
                  icon: 'ri-route-line',
                  title: 'End-to-End Expertise',
                  desc: 'Our teams handle both AI strategy design and implementation—from concept to production deployment.',
                },
                {
                  icon: 'ri-user-heart-line',
                  title: 'Client-Centric Solutions',
                  desc: 'We focus deeply on understanding your unique needs to deliver solutions perfectly aligned with your goals.',
                },
                {
                  icon: 'ri-scales-3-line',
                  title: 'Tailored & Scalable',
                  desc: 'Custom solutions built with reusable components that scale efficiently as your business grows.',
                },
                {
                  icon: 'ri-cpu-line',
                  title: 'Modern Technologies',
                  desc: 'We integrate cutting-edge AI including GPT-4, Claude, Gemini, and custom fine-tuned models.',
                },
              ].map((item, i) => (
                <StaggerItem key={i} className="grid-item">
                  <HoverCard className="service-card text-center py-8 px-6 h-full">
                    <motion.div
                      className="w-16 h-16 bg-primary-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-5"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <i className={`${item.icon} text-3xl text-primary-blue`} />
                    </motion.div>
                    <h3 className="text-lg font-semibold mb-3 text-text-dark">{item.title}</h3>
                    <p className="text-text-muted text-sm leading-relaxed">{item.desc}</p>
                  </HoverCard>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* Services Section */}
        <section className="section bg-white">
          <div className="container">
            <Animated animation="fadeInUp" className="section-header">
              <Badge icon="ri-service-line">Our Services</Badge>
              <h2 className="section-title">Comprehensive AI Services</h2>
              <p className="section-subtitle">
                From strategy to maintenance, we&apos;ve got your AI journey covered
              </p>
            </Animated>
            <Stagger className="grid-2-col" staggerDelay={0.15}>
              {[
                {
                  icon: 'ri-compass-3-line',
                  title: 'AI Strategy',
                  desc: 'We identify opportunities where AI creates real value aligned with your business goals. Our strategic assessments help you prioritize high-impact initiatives.',
                  features: ['AI Readiness Assessment', 'Use Case Identification', 'ROI Analysis & Roadmap'],
                },
                {
                  icon: 'ri-team-line',
                  title: 'Project Management & Adoption',
                  desc: 'Our managers ensure delivery speed while adoption experts prepare your teams for seamless implementation and organizational change.',
                  features: ['Agile Project Delivery', 'Team Training & Enablement', 'Change Management'],
                },
                {
                  icon: 'ri-robot-2-line',
                  title: 'AI Solutions Development',
                  desc: 'Custom AI-driven solutions from intelligent automation to advanced analytics. We build conversational AI, agentic systems, and enterprise integrations.',
                  features: ['Conversational AI & Chatbots', 'Agentic AI Systems', 'Custom ML Models'],
                },
                {
                  icon: 'ri-settings-4-line',
                  title: 'AI Maintenance & Support',
                  desc: 'Continuous optimization with proactive monitoring and updates. We ensure your AI solutions stay performant, secure, and aligned with evolving needs.',
                  features: ['24/7 Monitoring', 'Performance Optimization', 'Model Retraining & Updates'],
                },
              ].map((service, i) => (
                <StaggerItem key={i} className="grid-item">
                  <HoverCard className="service-card p-8 h-full flex gap-6 items-start">
                    <motion.div
                      className="w-14 h-14 min-w-[56px] bg-primary-blue/10 rounded-2xl flex items-center justify-center"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <i className={`${service.icon} text-2xl text-primary-blue`} />
                    </motion.div>
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-text-dark">{service.title}</h3>
                      <p className="text-text-muted text-sm leading-relaxed mb-4">{service.desc}</p>
                      <ul className="space-y-2">
                        {service.features.map((feature, j) => (
                          <li key={j} className="text-text-muted text-sm flex items-center gap-2">
                            <i className="ri-check-line text-primary-blue" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </HoverCard>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* AI Capabilities Section */}
        <section className="section">
          <div className="container">
            <Animated animation="fadeInUp" className="section-header">
              <Badge icon="ri-magic-line">AI Capabilities</Badge>
              <h2 className="section-title">What Can AI Do For You?</h2>
              <p className="section-subtitle">
                Discover the transformative power of AI across your business operations
              </p>
            </Animated>
            <Stagger className="grid-3-col" staggerDelay={0.08}>
              {[
                { icon: 'ri-flow-chart', title: 'Workflow Automation', desc: 'Automate repetitive tasks, streamline processes, and reduce manual effort with intelligent automation that learns and improves.', link: '/solutions/ai-integration' },
                { icon: 'ri-robot-line', title: 'AI Agent Development', desc: 'Build autonomous AI agents that can reason, plan, and execute complex multi-step tasks with minimal human intervention.', link: '/solutions/agentic-ai' },
                { icon: 'ri-line-chart-line', title: 'Predictive Analytics', desc: 'Leverage machine learning to forecast trends, predict outcomes, and make data-driven decisions with confidence.', link: '/solutions/custom-development' },
                { icon: 'ri-customer-service-2-line', title: 'Intelligent Customer Service', desc: 'Deploy AI chatbots and voice assistants that handle inquiries 24/7 in multiple languages with human-like understanding.', link: '/solutions/conversational-ai' },
                { icon: 'ri-file-text-line', title: 'Content Generation', desc: 'Automatically draft reports, emails, contracts, and marketing content with AI that understands your brand voice.', link: '/solutions/custom-development' },
                { icon: 'ri-eye-line', title: 'Document Intelligence', desc: 'Extract, analyze, and process information from documents, forms, and images with advanced OCR and NLP.', link: '/solutions/ai-integration' },
              ].map((item, i) => (
                <StaggerItem key={i} className="grid-item">
                  <Link href={item.link}>
                    <HoverCard className="service-card p-6 h-full cursor-pointer">
                      <motion.div
                        className="w-12 h-12 bg-primary-blue/10 rounded-xl flex items-center justify-center mb-4"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <i className={`${item.icon} text-xl text-primary-blue`} />
                      </motion.div>
                      <h3 className="text-base font-semibold mb-2 text-text-dark">{item.title}</h3>
                      <p className="text-text-muted text-sm leading-relaxed">{item.desc}</p>
                    </HoverCard>
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* Success Stories Section */}
        <section className="section bg-gradient-stats">
          <div className="container">
            <Animated animation="fadeInUp" className="section-header">
              <Badge icon="ri-trophy-line" variant="white">
                Success Stories
              </Badge>
              <h2 className="section-title text-white">Our Impact in Action</h2>
              <p className="section-subtitle text-white/70">
                Real solutions delivering real results for our clients
              </p>
            </Animated>
            <Stagger className="grid-3-col" staggerDelay={0.15}>
              {[
                {
                  icon: 'ri-whatsapp-line',
                  name: 'D23.ai',
                  type: 'WhatsApp AI Assistant',
                  desc: 'AI-powered WhatsApp assistant serving 5000+ users with multilingual support, voice processing, and real-time information access across 11+ Indian languages.',
                  stats: [
                    { value: '1M+', label: 'Messages Processed' },
                    { value: '11+', label: 'Languages' },
                  ],
                  link: '/products/d23-ai',
                },
                {
                  icon: 'ri-voiceprint-line',
                  name: 'OHGRT',
                  type: 'AI Voice Studio',
                  desc: 'Professional AI voice generation platform enabling content creators and enterprises with text-to-speech, voice cloning, and video dubbing in 10+ languages.',
                  stats: [
                    { value: '2M+', label: 'Downloads' },
                    { value: '4.8★', label: 'User Rating' },
                  ],
                  link: '/products/ohgrt',
                },
                {
                  icon: 'ri-heart-pulse-line',
                  name: 'Xappy Healthcare',
                  type: 'Government Healthcare',
                  desc: 'AI strategy addressing healthcare access, administrative pressure, and clinician support—deployed for government health departments with ethical standards.',
                  stats: [
                    { value: 'Gov', label: 'Grade Security' },
                    { value: '100K+', label: 'Records Managed' },
                  ],
                  link: '/products/xappy',
                },
              ].map((story, i) => (
                <StaggerItem key={i} className="grid-item">
                  <HoverCard className="glass-card p-6 h-full" hoverScale={1.02} hoverY={-5}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                        <i className={`${story.icon} text-xl text-white`} />
                      </div>
                      <div>
                        <h4 className="text-white text-base font-semibold">{story.name}</h4>
                        <span className="text-white/60 text-sm">{story.type}</span>
                      </div>
                    </div>
                    <p className="text-white/70 text-sm leading-relaxed mb-4">{story.desc}</p>
                    <div className="flex gap-6 mb-4">
                      {story.stats.map((stat, j) => (
                        <div key={j}>
                          <div className="text-xl font-bold text-white">{stat.value}</div>
                          <div className="text-xs text-white/50">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                    <Link
                      href={story.link}
                      className="inline-flex items-center gap-2 text-white/80 text-sm font-medium hover:text-white transition-colors group"
                    >
                      View Case Study <i className="ri-arrow-right-line group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </HoverCard>
                </StaggerItem>
              ))}
            </Stagger>
            <Animated animation="fadeInUp" delay={0.4} className="text-center mt-10">
              <Button variant="ctaWhite" asChild>
                <Link href="/products">
                  <span>View All Products</span>
                  <i className="ri-arrow-right-line" />
                </Link>
              </Button>
            </Animated>
          </div>
        </section>

        {/* Stats Section */}
        <section className="stats-section relative">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-15"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80')",
            }}
          />
          <div className="container relative z-10">
            <Stagger className="stats-grid" staggerDelay={0.1}>
              {[
                { value: '2014', label: 'Founded' },
                { value: '100+', label: 'Clients Served' },
                { value: '200+', label: 'Projects Delivered' },
                { value: '10+', label: 'Years Experience' },
              ].map((stat, i) => (
                <StaggerItem key={i}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1, type: 'spring', stiffness: 200 }}
                    viewport={{ once: true }}
                  >
                    <StatCard value={stat.value} label={stat.label} />
                  </motion.div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* Industries Section */}
        <section className="section bg-white">
          <div className="container">
            <Animated animation="fadeInUp" className="section-header">
              <Badge icon="ri-building-2-line">Industries</Badge>
              <h2 className="section-title">Industries We Serve</h2>
              <p className="section-subtitle">
                Delivering AI solutions across diverse sectors with domain expertise
              </p>
            </Animated>
            <Stagger className="industries-grid" staggerDelay={0.05}>
              {[
                { icon: 'ri-government-line', name: 'Government' },
                { icon: 'ri-book-open-line', name: 'Education' },
                { icon: 'ri-heart-pulse-line', name: 'Healthcare' },
                { icon: 'ri-bank-line', name: 'BFSI' },
                { icon: 'ri-store-2-line', name: 'Retail' },
                { icon: 'ri-movie-2-line', name: 'Media' },
              ].map((industry, i) => (
                <StaggerItem key={i} className="grid-item">
                  <HoverCard className="service-card text-center py-5 px-3">
                    <motion.div
                      className="w-12 h-12 bg-primary-blue/10 rounded-xl flex items-center justify-center mx-auto mb-3"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <i className={`${industry.icon} text-xl text-primary-blue`} />
                    </motion.div>
                    <h4 className="text-sm font-medium text-text-dark">{industry.name}</h4>
                  </HoverCard>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* Tech Stack Section */}
        <section className="section">
          <div className="container">
            <Animated animation="fadeInUp" className="section-header">
              <Badge icon="ri-stack-line">Technology</Badge>
              <h2 className="section-title">Powered by Leading AI Technologies</h2>
              <p className="section-subtitle">
                We work with the best tools and platforms to deliver exceptional results
              </p>
            </Animated>
            <Stagger className="tech-grid" staggerDelay={0.05}>
              {[
                { icon: 'ri-brain-fill', color: 'text-[#10a37f]', name: 'OpenAI' },
                { icon: 'ri-google-fill', color: 'text-[#4285f4]', name: 'Google AI' },
                { icon: 'ri-facebook-fill', color: 'text-[#0668e1]', name: 'Meta AI' },
                { icon: 'ri-amazon-fill', color: 'text-[#ff9900]', name: 'AWS' },
                { icon: 'ri-terminal-box-fill', color: 'text-[#3776ab]', name: 'Python' },
                { icon: 'ri-reactjs-line', color: 'text-[#61dafb]', name: 'React' },
                { icon: 'ri-nodejs-fill', color: 'text-[#339933]', name: 'Node.js' },
                { icon: 'ri-database-2-line', color: 'text-[#336791]', name: 'PostgreSQL' },
                { icon: 'ri-sparkling-2-fill', color: 'text-[#d97757]', name: 'Claude' },
              ].map((tech, i) => (
                <StaggerItem key={i} className="tech-item">
                  <motion.div
                    className="tech-badge"
                    whileHover={{ scale: 1.05, y: -3 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <i className={`${tech.icon} ${tech.color}`} />
                    <span>{tech.name}</span>
                  </motion.div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section relative overflow-hidden">
          <div className="container">
            <Animated animation="scaleIn">
              <div className="cta-card">
                <h2>Ready to Transform Your Business with AI?</h2>
                <p>
                  Get a free consultation and AI readiness assessment. Let&apos;s discuss how AI can
                  drive efficiency and growth for your organization.
                </p>
                <div className="flex gap-3 justify-center flex-wrap">
                  <Button variant="ctaWhite" asChild>
                    <Link href="/contact">
                      <span>Get Free Consultation</span>
                      <i className="ri-arrow-right-line" />
                    </Link>
                  </Button>
                  <Button variant="ghost" asChild>
                    <a href="tel:+919810503222">
                      <i className="ri-phone-line" />
                      <span>+91 9810503222</span>
                    </a>
                  </Button>
                </div>
              </div>
            </Animated>
          </div>
        </section>
      </main>
    </>
  );
}
