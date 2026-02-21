'use client';

import Link from 'next/link';
import { Header, Footer, Badge, Button } from '@/components';
import { Animated, Stagger, StaggerItem, HoverCard, Counter, motion } from '@/components/ui';

const features = [
  { icon: 'ri-translate-2', gradient: 'bg-gradient-purple', title: 'Multi-Language TTS', desc: 'Generate natural speech in Hindi, English, Bengali, Tamil, Telugu, Marathi, and more Indian languages.' },
  { icon: 'ri-user-voice-line', gradient: 'bg-gradient-primary', title: 'Voice Cloning', desc: 'Clone any voice with just a few minutes of sample audio. Perfect for consistent brand voices and personalization.' },
  { icon: 'ri-video-add-line', gradient: 'bg-gradient-blue', title: 'Video Dubbing', desc: 'Automatically dub videos into multiple languages while preserving lip-sync and natural pacing.' },
  { icon: 'ri-emotion-happy-line', gradient: 'bg-gradient-pink', title: 'Emotion Control', desc: 'Fine-tune voice emotions - happy, sad, excited, calm, professional. Match the tone to your content.' },
  { icon: 'ri-headphone-line', gradient: 'bg-gradient-green', title: 'Studio Quality', desc: '44.1kHz, 16-bit audio output with noise reduction. Ready for broadcast and commercial use.' },
  { icon: 'ri-code-s-slash-line', gradient: 'bg-gradient-orange', title: 'API Access', desc: 'Integrate OHGRT into your applications with our RESTful API. SDKs available for Python, Node.js, and more.' },
];

const useCases = [
  { icon: 'ri-movie-2-line', title: 'Media & Entertainment', desc: 'Dub movies, TV shows, and documentaries into multiple languages for global distribution.' },
  { icon: 'ri-book-read-line', title: 'E-Learning', desc: 'Create voice-overs for educational content in multiple languages without hiring voice actors.' },
  { icon: 'ri-youtube-line', title: 'Content Creators', desc: 'Scale your YouTube and social media content to new audiences with localized audio.' },
  { icon: 'ri-advertisement-line', title: 'Advertising', desc: 'Create ad variations for different markets and A/B test voice styles efficiently.' },
  { icon: 'ri-headphone-line', title: 'Audiobooks', desc: 'Convert written content to professional audiobooks with consistent narrator voices.' },
  { icon: 'ri-customer-service-2-line', title: 'IVR Systems', desc: 'Create natural-sounding IVR prompts that enhance customer experience.' },
];

export default function OHGRTPage() {
  return (
    <>
      <Header activePage="products" />

      {/* Page Header */}
      <section className="page-header bg-gradient-hero">
        <div className="container">
          <Animated animation="fadeInUp">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <i className="ri-voiceprint-line text-3xl text-white" />
              </div>
              <div>
                <h1 className="mb-1">OHGRT</h1>
                <p className="m-0 opacity-90">AI Voice Generation Studio</p>
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
              <li className="breadcrumb-item active" aria-current="page">OHGRT</li>
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
                  <Badge icon="ri-voiceprint-line" className="mb-4" style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(192, 132, 252, 0.1) 100%)', color: '#a855f7', borderColor: 'rgba(168, 85, 247, 0.2)' }}>
                    Voice AI
                  </Badge>
                </Animated>
                <Animated animation="fadeInUp" delay={0.1}>
                  <h2 className="text-3xl md:text-4xl font-bold text-text-dark mb-6">Professional AI Voice Generation</h2>
                </Animated>
                <Animated animation="fadeInUp" delay={0.2}>
                  <p className="text-lg text-text-muted leading-relaxed mb-5">
                    OHGRT is a professional-grade AI voice generation platform for content creators, media companies, and enterprises. Create natural-sounding voices in 10+ languages with studio-quality output.
                  </p>
                </Animated>
                <Animated animation="fadeInUp" delay={0.3}>
                  <p className="text-lg text-text-muted leading-relaxed mb-8">
                    With advanced voice cloning technology, video dubbing capabilities, and emotion control, OHGRT empowers you to create compelling audio content at scale.
                  </p>
                </Animated>
                <Animated animation="fadeInUp" delay={0.4}>
                  <div className="flex gap-3 flex-wrap">
                    <Button variant="cta" asChild style={{ background: 'linear-gradient(135deg, #a855f7 0%, #c084fc 100%)' }}>
                      <a href="https://ohgrt.com" target="_blank" rel="noopener noreferrer">
                        <span>Try OHGRT Free</span>
                        <i className="ri-play-line" />
                      </a>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/contact">
                        <span>Enterprise Demo</span>
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
                      { text: '4.8', suffix: '★', label: 'User Rating' },
                      { value: 2, suffix: 'M+', label: 'Downloads' },
                      { value: 1000, suffix: '+', label: 'Active Users' },
                      { text: 'Free', label: 'Freemium Model' },
                    ].map((stat, i) => (
                      <StaggerItem key={i}>
                        <HoverCard className="service-card text-center p-7">
                          <div className="text-4xl font-extrabold text-purple-500 mb-2">
                            {stat.text ? (
                              <>{stat.text}{stat.suffix}</>
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
                <Badge icon="ri-star-line">Features</Badge>
              </Animated>
              <Animated animation="fadeInUp" delay={0.1}>
                <h2 className="section-title">Powerful Voice AI Capabilities</h2>
              </Animated>
              <Animated animation="fadeInUp" delay={0.2}>
                <p className="section-subtitle">Everything you need for professional audio production.</p>
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
                <h2 className="section-title">Who Uses OHGRT</h2>
              </Animated>
              <Animated animation="fadeInUp" delay={0.2}>
                <p className="section-subtitle">Powering audio for diverse industries and creators.</p>
              </Animated>
            </div>
            <Stagger className="grid-3-col" staggerDelay={0.1}>
              {useCases.map((useCase, i) => (
                <StaggerItem key={i} className="grid-item">
                  <HoverCard className="value-card h-full">
                    <h3 className="text-lg">
                      <i className={`${useCase.icon} mr-2 text-purple-500`} />
                      {useCase.title}
                    </h3>
                    <p className="text-text-muted text-sm">{useCase.desc}</p>
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
              <div className="cta-card" style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)' }}>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  Give Your Content a Voice
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  Start creating professional audio content with OHGRT&apos;s AI voice generation. Free to start.
                </motion.p>
                <motion.div
                  className="flex gap-3 justify-center flex-wrap"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                >
                  <Button variant="ctaWhite" asChild>
                    <a href="https://ohgrt.com" target="_blank" rel="noopener noreferrer">
                      <span>Start Free</span>
                      <i className="ri-play-line" />
                    </a>
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link href="/contact">
                      <span>Enterprise Solutions</span>
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
