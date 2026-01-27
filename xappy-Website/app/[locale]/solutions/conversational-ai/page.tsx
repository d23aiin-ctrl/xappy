'use client';

import Link from 'next/link';
import { Header, Footer, Badge, Button } from '@/components';
import { Animated, Stagger, StaggerItem, HoverCard, Counter, motion } from '@/components/ui';

const features = [
  { icon: 'ri-message-3-line', title: 'Natural Language Understanding', desc: 'Advanced NLU that understands intent, context, and nuance in user messages across multiple languages.' },
  { icon: 'ri-chat-history-line', title: 'Multi-Turn Conversations', desc: 'Maintain context across long conversations, remembering previous interactions and preferences.' },
  { icon: 'ri-global-line', title: '11+ Languages', desc: 'Native support for Hindi, English, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, and more.' },
  { icon: 'ri-mic-line', title: 'Voice Processing', desc: 'Speech-to-text and text-to-speech capabilities for voice-based interactions on any platform.' },
  { icon: 'ri-emotion-happy-line', title: 'Sentiment Analysis', desc: 'Real-time emotion detection to adjust tone and escalate sensitive conversations.' },
  { icon: 'ri-plug-line', title: 'System Integration', desc: 'Connect to CRMs, ERPs, ticketing systems, and databases for contextual responses.' },
];

const channels = [
  { icon: 'ri-whatsapp-line', name: 'WhatsApp', color: '#25d366' },
  { icon: 'ri-global-line', name: 'Web Chat', color: '#6366f1' },
  { icon: 'ri-smartphone-line', name: 'Mobile App', color: '#f59e0b' },
  { icon: 'ri-phone-line', name: 'Voice/IVR', color: '#ec4899' },
  { icon: 'ri-telegram-line', name: 'Telegram', color: '#0088cc' },
  { icon: 'ri-messenger-line', name: 'Messenger', color: '#0084ff' },
];

const useCases = [
  { title: 'Customer Support', desc: 'Handle FAQs, track orders, process returns, and escalate complex issues automatically.', icon: 'ri-customer-service-line' },
  { title: 'Sales & Lead Gen', desc: 'Qualify leads, answer product questions, schedule demos, and nurture prospects 24/7.', icon: 'ri-user-add-line' },
  { title: 'Appointment Booking', desc: 'Let customers book, reschedule, and cancel appointments through natural conversation.', icon: 'ri-calendar-check-line' },
  { title: 'Internal Help Desk', desc: 'IT support, HR queries, policy questions—help employees get answers instantly.', icon: 'ri-question-answer-line' },
];

export default function ConversationalAIPage() {
  return (
    <>
      <Header activePage="solutions" />

      {/* Page Header */}
      <section className="page-header" style={{ background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 50%, #4ade80 100%)' }}>
        <div className="container">
          <Animated animation="fadeInUp">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <i className="ri-chat-voice-line text-3xl text-white" />
              </div>
              <div>
                <h1 className="mb-1">Conversational AI</h1>
                <p className="m-0 opacity-90">Chatbots & Voice Assistants</p>
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
              <li className="breadcrumb-item active" aria-current="page">Conversational AI</li>
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
                  <Badge icon="ri-chat-3-line" className="mb-4" style={{ background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(74, 222, 128, 0.1) 100%)', color: '#22c55e', borderColor: 'rgba(34, 197, 94, 0.2)' }}>
                    Smart Conversations
                  </Badge>
                </Animated>
                <Animated animation="fadeInUp" delay={0.1}>
                  <h2 className="text-3xl md:text-4xl font-bold text-text-dark mb-6">Conversations That Actually Help</h2>
                </Animated>
                <Animated animation="fadeInUp" delay={0.2}>
                  <p className="text-lg text-text-muted leading-relaxed mb-5">
                    Move beyond rule-based chatbots to truly intelligent conversational systems. Our AI understands context, remembers history, and provides helpful responses in any language your customers speak.
                  </p>
                </Animated>
                <Animated animation="fadeInUp" delay={0.3}>
                  <p className="text-lg text-text-muted leading-relaxed mb-8">
                    Deploy on WhatsApp, web, mobile, or voice—with seamless handoff between channels. Your customers get consistent, high-quality support wherever they are.
                  </p>
                </Animated>
                <Animated animation="fadeInUp" delay={0.4}>
                  <div className="flex gap-3 flex-wrap">
                    <Button variant="cta" asChild style={{ background: 'linear-gradient(135deg, #22c55e 0%, #4ade80 100%)' }}>
                      <Link href="/contact">
                        <span>Build Your Bot</span>
                        <i className="ri-arrow-right-line" />
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/products/d23-ai">
                        <span>See D23.ai Demo</span>
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
                      { value: 11, suffix: '+', label: 'Languages Supported' },
                      { value: 90, suffix: '%', label: 'Query Resolution' },
                      { icon: 'ri-time-line', label: '24/7 Availability' },
                      { value: 3, suffix: 's', label: 'Avg Response Time' },
                    ].map((stat, i) => (
                      <StaggerItem key={i}>
                        <HoverCard className="service-card text-center p-7">
                          <div className="text-4xl font-extrabold text-green-500 mb-2">
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

        {/* Channels Section */}
        <section className="section">
          <div className="container">
            <div className="section-header">
              <Animated animation="fadeInUp">
                <Badge icon="ri-smartphone-line">Channels</Badge>
              </Animated>
              <Animated animation="fadeInUp" delay={0.1}>
                <h2 className="section-title">Deploy Everywhere</h2>
              </Animated>
              <Animated animation="fadeInUp" delay={0.2}>
                <p className="section-subtitle">One bot, multiple channels—consistent experience everywhere</p>
              </Animated>
            </div>
            <Stagger className="industries-grid" staggerDelay={0.08}>
              {channels.map((channel, i) => (
                <StaggerItem key={i} className="grid-item">
                  <HoverCard className="service-card hover-lift text-center py-6 px-4">
                    <motion.div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                      style={{ background: `${channel.color}20` }}
                      whileHover={{ scale: 1.15, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <i className={`${channel.icon} text-2xl`} style={{ color: channel.color }} />
                    </motion.div>
                    <h4 className="text-sm font-semibold text-text-dark">{channel.name}</h4>
                  </HoverCard>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* Features Section */}
        <section className="section bg-white">
          <div className="container">
            <div className="section-header">
              <Animated animation="fadeInUp">
                <Badge icon="ri-star-line">Features</Badge>
              </Animated>
              <Animated animation="fadeInUp" delay={0.1}>
                <h2 className="section-title">Intelligent Capabilities</h2>
              </Animated>
              <Animated animation="fadeInUp" delay={0.2}>
                <p className="section-subtitle">Advanced features that make conversations feel natural</p>
              </Animated>
            </div>
            <Stagger className="grid-3-col" staggerDelay={0.1}>
              {features.map((feature, i) => (
                <StaggerItem key={i} className="grid-item">
                  <HoverCard className="service-card p-7 h-full">
                    <motion.div
                      className="w-14 h-14 bg-gradient-green rounded-2xl flex items-center justify-center mb-5"
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
        <section className="section">
          <div className="container">
            <div className="section-header">
              <Animated animation="fadeInUp">
                <Badge icon="ri-lightbulb-line">Use Cases</Badge>
              </Animated>
              <Animated animation="fadeInUp" delay={0.1}>
                <h2 className="section-title">Common Applications</h2>
              </Animated>
            </div>
            <Stagger className="grid-2-col" staggerDelay={0.15}>
              {useCases.map((useCase, i) => (
                <StaggerItem key={i} className="grid-item">
                  <HoverCard className="service-card p-8 h-full">
                    <div className="flex items-start gap-5">
                      <motion.div
                        className="w-16 h-16 bg-gradient-green rounded-2xl flex items-center justify-center flex-shrink-0"
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

        {/* CTA Section */}
        <section className="cta-section">
          <div className="container">
            <Animated animation="scaleIn">
              <div className="cta-card" style={{ background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)' }}>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  Ready to Transform Customer Experience?
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  Build a conversational AI that speaks your customers&apos; language—literally.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                >
                  <Button variant="ctaWhite" asChild>
                    <Link href="/contact">
                      <span>Get Started</span>
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
