'use client';

import Link from 'next/link';
import { Header, Footer, Badge, Button } from '@/components';
import { Animated, Stagger, StaggerItem, HoverCard, Counter, motion } from '@/components/ui';

const features = [
  { icon: 'ri-mic-line', gradient: 'bg-gradient-whatsapp', title: 'Voice Messages', desc: 'Send voice messages in any Indian language and get intelligent responses. No typing needed - just speak naturally.' },
  { icon: 'ri-translate-2', gradient: 'bg-gradient-primary', title: '11+ Indian Languages', desc: 'Hindi, English, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, Malayalam, Punjabi, and more supported natively.' },
  { icon: 'ri-image-ai-line', gradient: 'bg-gradient-purple', title: 'Image Generation', desc: 'Create stunning AI-generated images from text descriptions. Perfect for creative projects and visualizations.' },
  { icon: 'ri-train-line', gradient: 'bg-gradient-orange', title: 'Train PNR Status', desc: 'Check Indian Railways PNR status instantly. Get booking details, seat confirmation, and train schedules.' },
  { icon: 'ri-global-line', gradient: 'bg-gradient-blue', title: 'Web Search', desc: 'Search the web and get summarized, accurate answers. Stay updated with real-time information.' },
  { icon: 'ri-chat-smile-3-line', gradient: 'bg-gradient-pink', title: 'Smart Conversations', desc: 'Have natural, context-aware conversations. D23.ai remembers context and provides relevant follow-up responses.' },
];

const useCases = [
  { icon: 'ri-question-answer-line', title: 'Ask Anything', desc: 'Get answers to questions on any topic - education, health, technology, general knowledge, and more.' },
  { icon: 'ri-train-line', title: 'Travel Planning', desc: 'Check train PNR status, get travel information, and plan your journeys with real-time data.' },
  { icon: 'ri-image-add-line', title: 'Create Images', desc: 'Generate unique images from text descriptions for personal projects, social media, or creative work.' },
  { icon: 'ri-translate-line', title: 'Language Translation', desc: 'Translate text between Indian languages and English seamlessly within your conversations.' },
  { icon: 'ri-file-text-line', title: 'Content Writing', desc: 'Get help with writing emails, messages, essays, and professional documents in your preferred language.' },
  { icon: 'ri-search-line', title: 'Research & Facts', desc: 'Search the web and get summarized, accurate information with sources for any research topic.' },
];

const comparisonData = [
  { feature: 'Works on WhatsApp', d23: true, chatgpt: false, others: true },
  { feature: '11+ Indian Languages', d23: true, chatgpt: false, others: false },
  { feature: 'Voice Message Support', d23: true, chatgpt: false, others: false },
  { feature: 'Train PNR Status', d23: true, chatgpt: false, others: false },
  { feature: 'AI Image Generation', d23: true, chatgpt: true, others: false },
  { feature: 'Real-time Web Search', d23: true, chatgpt: true, others: false },
  { feature: 'No App Download Required', d23: true, chatgpt: false, others: true },
  { feature: 'Free Tier Available', d23: true, chatgpt: true, others: true },
];

const steps = [
  { num: 1, title: 'Open WhatsApp', desc: 'Use the WhatsApp you already have installed' },
  { num: 2, title: 'Save Our Number', desc: 'Add D23.ai to your contacts or scan QR' },
  { num: 3, title: 'Send "Hi"', desc: 'Start a conversation in any language' },
  { num: 4, title: 'Get AI Responses', desc: 'Receive instant, intelligent answers' },
];

const pricingPlans = [
  {
    name: 'Free',
    subtitle: 'For casual users',
    price: '₹0',
    period: '/month',
    features: ['50 messages/day', 'Text conversations', 'Basic web search', 'Train PNR status', 'All 11+ languages'],
    cta: 'Start Free',
    ctaStyle: 'bg-bg-light text-text-dark hover:bg-gray-200',
    featured: false,
  },
  {
    name: 'Pro',
    subtitle: 'For power users',
    price: '₹99',
    period: '/month',
    features: ['Unlimited messages', 'Voice message support', 'AI image generation', 'Priority response time', 'Advanced web search', 'Document analysis'],
    cta: 'Upgrade to Pro',
    ctaStyle: 'bg-gradient-whatsapp text-white',
    featured: true,
  },
  {
    name: 'Enterprise',
    subtitle: 'For businesses',
    price: 'Custom',
    period: '',
    features: ['White-label solution', 'Custom AI training', 'API access', 'CRM integrations', 'Dedicated support', 'SLA guarantees'],
    cta: 'Contact Sales',
    ctaStyle: 'bg-bg-light text-text-dark hover:bg-gray-200',
    featured: false,
  },
];

const testimonials = [
  { quote: 'Finally an AI that understands Hindi properly! I use it daily for everything from recipes to helping my kids with homework.', name: 'Priya Sharma', role: 'Homemaker, Delhi', gradient: 'bg-gradient-orange' },
  { quote: 'The voice message feature is incredible. I can ask questions while driving and get answers read back to me in Tamil.', name: 'Rajesh Kumar', role: 'Business Owner, Chennai', gradient: 'bg-gradient-blue' },
  { quote: 'Train PNR checking is so convenient! No more opening multiple apps. Just send the PNR number and get instant status.', name: 'Amit Patel', role: 'Student, Ahmedabad', gradient: 'bg-gradient-purple' },
];

export default function D23AIPage() {
  return (
    <>
      <Header activePage="products" />

      {/* Page Header */}
      <section className="page-header bg-gradient-hero">
        <div className="container">
          <Animated animation="fadeInUp">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <i className="ri-whatsapp-line text-3xl text-white" />
              </div>
              <div>
                <h1 className="mb-1">D23.ai</h1>
                <p className="m-0 opacity-90">WhatsApp AI Assistant for India</p>
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
              <li className="breadcrumb-item"><Link href="/products">Products</Link></li>
              <li className="breadcrumb-item active" aria-current="page">D23.ai</li>
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
                  <Badge icon="ri-whatsapp-line" className="mb-4" style={{ background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.1) 0%, rgba(37, 211, 102, 0.15) 100%)', color: '#25d366', borderColor: 'rgba(37, 211, 102, 0.2)' }}>
                    India&apos;s #1 WhatsApp AI
                  </Badge>
                </Animated>
                <Animated animation="fadeInUp" delay={0.1}>
                  <h2 className="text-3xl md:text-4xl font-bold text-text-dark mb-6">ChatGPT for India, on WhatsApp</h2>
                </Animated>
                <Animated animation="fadeInUp" delay={0.2}>
                  <p className="text-lg text-text-muted leading-relaxed mb-5">
                    D23.ai brings the power of advanced AI to 500M+ Indians on WhatsApp. Ask questions in Hindi, send voice notes in Tamil, generate images, check train PNR, search the web - all in the app you already use daily.
                  </p>
                </Animated>
                <Animated animation="fadeInUp" delay={0.3}>
                  <p className="text-lg text-text-muted leading-relaxed mb-6">
                    <strong>No app downloads. No sign-ups. No English required.</strong> Just message and get instant, intelligent responses in 11+ Indian languages.
                  </p>
                </Animated>
                <Animated animation="fadeInUp" delay={0.4}>
                  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 mb-8 border-l-4 border-green-500">
                    <p className="m-0 text-text-dark text-sm">
                      <i className="ri-time-line mr-2 text-green-600" />
                      Average response time: <strong>&lt;2 seconds</strong>
                    </p>
                  </div>
                </Animated>
                <Animated animation="fadeInUp" delay={0.5}>
                  <div className="flex gap-3 flex-wrap">
                    <Button variant="cta" asChild style={{ background: 'linear-gradient(135deg, #128C7E 0%, #25d366 100%)' }}>
                      <a href="https://d23.ai" target="_blank" rel="noopener noreferrer">
                        <span>Start Chatting Free</span>
                        <i className="ri-whatsapp-line" />
                      </a>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/contact">
                        <span>Enterprise API</span>
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
                      { value: 50, suffix: 'K+', label: 'Active Users' },
                      { value: 98, suffix: '%', label: 'Accuracy Rate' },
                      { value: 5, suffix: 'M+', label: 'Messages Processed' },
                      { value: 11, suffix: '+', label: 'Indian Languages' },
                    ].map((stat, i) => (
                      <StaggerItem key={i}>
                        <HoverCard className="service-card text-center p-7">
                          <div className="text-4xl font-extrabold text-green-500 mb-2">
                            <Counter from={0} to={stat.value} duration={2} suffix={stat.suffix} />
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
                <Badge icon="ri-star-line">Features</Badge>
              </Animated>
              <Animated animation="fadeInUp" delay={0.1}>
                <h2 className="section-title">Powerful AI Capabilities</h2>
              </Animated>
              <Animated animation="fadeInUp" delay={0.2}>
                <p className="section-subtitle">Everything you need from an AI assistant, right in WhatsApp.</p>
              </Animated>
            </div>
            <Stagger className="grid-3-col" staggerDelay={0.1}>
              {features.map((feature, i) => (
                <StaggerItem key={i} className="grid-item">
                  <HoverCard className="service-card p-7 h-full">
                    <motion.div
                      className={`w-14 h-14 ${feature.gradient} rounded-2xl flex items-center justify-center mb-5`}
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
                <h2 className="section-title">What You Can Do with D23.ai</h2>
              </Animated>
              <Animated animation="fadeInUp" delay={0.2}>
                <p className="section-subtitle">Everyday tasks made simple through WhatsApp.</p>
              </Animated>
            </div>
            <Stagger className="grid-3-col" staggerDelay={0.1}>
              {useCases.map((useCase, i) => (
                <StaggerItem key={i} className="grid-item">
                  <HoverCard className="value-card h-full">
                    <h3 className="text-lg">
                      <i className={`${useCase.icon} mr-2 text-green-500`} />
                      {useCase.title}
                    </h3>
                    <p className="text-text-muted text-sm">{useCase.desc}</p>
                  </HoverCard>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* Why D23.ai Section - Comparison Table */}
        <section className="section">
          <div className="container">
            <div className="section-header">
              <Animated animation="fadeInUp">
                <Badge icon="ri-question-line">Why D23.ai</Badge>
              </Animated>
              <Animated animation="fadeInUp" delay={0.1}>
                <h2 className="section-title">Why Choose D23.ai Over Other AI Assistants?</h2>
              </Animated>
              <Animated animation="fadeInUp" delay={0.2}>
                <p className="section-subtitle">Built specifically for India, not adapted from Western products.</p>
              </Animated>
            </div>
            <Animated animation="scaleIn" delay={0.3}>
              <div className="overflow-x-auto">
                <table className="w-full bg-white rounded-2xl overflow-hidden shadow-card">
                  <thead>
                    <tr style={{ background: 'linear-gradient(135deg, #128C7E 0%, #25d366 100%)' }}>
                      <th className="p-4 text-left text-white font-semibold">Feature</th>
                      <th className="p-4 text-left text-white font-semibold">D23.ai</th>
                      <th className="p-4 text-left text-white font-semibold">ChatGPT</th>
                      <th className="p-4 text-left text-white font-semibold">Other Bots</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonData.map((row, i) => (
                      <tr key={i} className="border-b border-gray-100 last:border-0">
                        <td className="p-4 font-medium text-text-dark">{row.feature}</td>
                        <td className="p-4">
                          {row.d23 ? <i className="ri-check-line text-xl text-green-500" /> : <i className="ri-close-line text-xl text-red-500" />}
                        </td>
                        <td className="p-4">
                          {row.chatgpt ? <i className="ri-check-line text-xl text-green-500" /> : <i className="ri-close-line text-xl text-red-500" />}
                        </td>
                        <td className="p-4">
                          {row.others ? <i className="ri-check-line text-xl text-green-500" /> : <i className="ri-close-line text-xl text-red-500" />}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Animated>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="section bg-white">
          <div className="container">
            <div className="section-header">
              <Animated animation="fadeInUp">
                <Badge icon="ri-flow-chart">How It Works</Badge>
              </Animated>
              <Animated animation="fadeInUp" delay={0.1}>
                <h2 className="section-title">Start in 30 Seconds</h2>
              </Animated>
              <Animated animation="fadeInUp" delay={0.2}>
                <p className="section-subtitle">No downloads, no sign-ups, no hassle.</p>
              </Animated>
            </div>
            <Stagger className="grid-4-col" staggerDelay={0.15}>
              {steps.map((step, i) => (
                <StaggerItem key={i} className="grid-item">
                  <HoverCard className="service-card text-center py-8 px-6 h-full">
                    <motion.div
                      className="w-16 h-16 bg-gradient-whatsapp rounded-full flex items-center justify-center mx-auto mb-5 text-white text-2xl font-extrabold"
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      {step.num}
                    </motion.div>
                    <h4 className="text-lg font-semibold mb-2">{step.title}</h4>
                    <p className="text-text-muted text-sm m-0">{step.desc}</p>
                  </HoverCard>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="section">
          <div className="container">
            <div className="section-header">
              <Animated animation="fadeInUp">
                <Badge icon="ri-price-tag-3-line">Pricing</Badge>
              </Animated>
              <Animated animation="fadeInUp" delay={0.1}>
                <h2 className="section-title">Simple, Affordable Pricing</h2>
              </Animated>
              <Animated animation="fadeInUp" delay={0.2}>
                <p className="section-subtitle">Start free, upgrade when you need more.</p>
              </Animated>
            </div>
            <Stagger className="flex flex-wrap gap-6 justify-center" staggerDelay={0.15}>
              {pricingPlans.map((plan, i) => (
                <StaggerItem key={i}>
                  <HoverCard
                    className={`bg-white rounded-3xl p-8 shadow-card min-w-[280px] max-w-[380px] flex-1 relative ${plan.featured ? 'border-2 border-green-500' : 'border-2 border-transparent'}`}
                    hoverY={-4}
                  >
                    {plan.featured && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-whatsapp text-white text-xs font-semibold px-4 py-1 rounded-full">
                        Most Popular
                      </div>
                    )}
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-text-muted text-sm mb-4">{plan.subtitle}</p>
                    <div className="text-4xl font-extrabold text-green-500 mb-4">
                      {plan.price}<span className="text-base font-medium text-text-muted">{plan.period}</span>
                    </div>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, j) => (
                        <li key={j} className="flex items-center gap-2.5 text-text-muted text-sm">
                          <i className="ri-check-line text-green-500 text-lg" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button className={`w-full justify-center ${plan.ctaStyle}`} asChild>
                      <a href={plan.name === 'Enterprise' ? '/contact' : 'https://d23.ai'} target={plan.name !== 'Enterprise' ? '_blank' : undefined}>
                        {plan.cta}
                      </a>
                    </Button>
                  </HoverCard>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="section bg-white">
          <div className="container">
            <div className="section-header">
              <Animated animation="fadeInUp">
                <Badge icon="ri-chat-quote-line">Testimonials</Badge>
              </Animated>
              <Animated animation="fadeInUp" delay={0.1}>
                <h2 className="section-title">What Our Users Say</h2>
              </Animated>
              <Animated animation="fadeInUp" delay={0.2}>
                <p className="section-subtitle">Join thousands of happy users across India.</p>
              </Animated>
            </div>
            <Stagger className="grid-3-col" staggerDelay={0.15}>
              {testimonials.map((testimonial, i) => (
                <StaggerItem key={i} className="grid-item">
                  <HoverCard className="bg-white rounded-2xl p-8 shadow-card h-full">
                    <p className="text-text-muted leading-relaxed mb-5 italic">&ldquo;{testimonial.quote}&rdquo;</p>
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 ${testimonial.gradient} rounded-full flex items-center justify-center text-white font-bold`}>
                        {testimonial.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-text-dark">{testimonial.name}</div>
                        <div className="text-sm text-text-muted">{testimonial.role}</div>
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
              <div className="cta-card" style={{ background: 'linear-gradient(135deg, #128C7E 0%, #25d366 100%)' }}>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  Ready to Experience AI in Your Language?
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  Join 50,000+ Indians using D23.ai. Free to start, no app download needed.
                </motion.p>
                <motion.div
                  className="flex gap-3 justify-center flex-wrap"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                >
                  <Button variant="ctaWhite" asChild>
                    <a href="https://d23.ai" target="_blank" rel="noopener noreferrer">
                      <span>Start Chatting Free</span>
                      <i className="ri-whatsapp-line" />
                    </a>
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link href="/contact">
                      <span>Enterprise API</span>
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
