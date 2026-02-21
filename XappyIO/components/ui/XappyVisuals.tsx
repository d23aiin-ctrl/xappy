'use client';

import { motion } from 'framer-motion';

// Animated Atom Logo inspired by Xappy branding
export function AtomLogo({ size = 120, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Orange orbit */}
      <motion.ellipse
        cx="60"
        cy="60"
        rx="50"
        ry="20"
        stroke="#F7931E"
        strokeWidth="3"
        fill="none"
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        style={{ transformOrigin: 'center' }}
      />
      {/* Green orbit */}
      <motion.ellipse
        cx="60"
        cy="60"
        rx="50"
        ry="20"
        stroke="#7AC143"
        strokeWidth="3"
        fill="none"
        initial={{ rotate: 60 }}
        animate={{ rotate: 420 }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        style={{ transformOrigin: 'center' }}
      />
      {/* Yellow orbit */}
      <motion.ellipse
        cx="60"
        cy="60"
        rx="50"
        ry="20"
        stroke="#FFC20E"
        strokeWidth="3"
        fill="none"
        initial={{ rotate: -60 }}
        animate={{ rotate: 300 }}
        transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
        style={{ transformOrigin: 'center' }}
      />
      {/* Center star */}
      <motion.path
        d="M60 35L63.5 52.5L80 55L63.5 60L60 80L56.5 60L40 55L56.5 52.5L60 35Z"
        fill="#0078D4"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1.1 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
        style={{ transformOrigin: 'center' }}
      />
    </svg>
  );
}

// Floating particles background
export function FloatingParticles({ count = 20 }: { count?: number }) {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    size: Math.random() * 6 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 15,
    delay: Math.random() * 5,
    color: ['#0078D4', '#7AC143', '#F7931E', '#FFC20E'][Math.floor(Math.random() * 4)],
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full opacity-20"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            backgroundColor: particle.color,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 15, 0],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// Gradient mesh background
export function GradientMesh({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full blur-[120px] opacity-30"
        style={{ background: 'radial-gradient(circle, #0078D4 0%, transparent 70%)' }}
        animate={{
          x: ['-20%', '20%', '-20%'],
          y: ['-10%', '30%', '-10%'],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute right-0 w-[500px] h-[500px] rounded-full blur-[100px] opacity-20"
        style={{ background: 'radial-gradient(circle, #7AC143 0%, transparent 70%)' }}
        animate={{
          x: ['20%', '-20%', '20%'],
          y: ['30%', '-10%', '30%'],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full blur-[80px] opacity-20"
        style={{ background: 'radial-gradient(circle, #F7931E 0%, transparent 70%)' }}
        animate={{
          x: ['-10%', '10%', '-10%'],
          y: ['10%', '-20%', '10%'],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

// Animated connection lines
export function ConnectionLines() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0078D4" stopOpacity="0" />
          <stop offset="50%" stopColor="#0078D4" stopOpacity="1" />
          <stop offset="100%" stopColor="#0078D4" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[...Array(5)].map((_, i) => (
        <motion.line
          key={i}
          x1={`${10 + i * 20}%`}
          y1="0%"
          x2={`${30 + i * 15}%`}
          y2="100%"
          stroke="url(#lineGradient)"
          strokeWidth="1"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: [0, 0.5, 0] }}
          transition={{
            duration: 8,
            repeat: Infinity,
            delay: i * 1.5,
            ease: 'easeInOut',
          }}
        />
      ))}
    </svg>
  );
}

// Animated chat bubbles for conversational AI theme
export function ChatBubbles({ className = '' }: { className?: string }) {
  const bubbles = [
    { text: 'Hi! How can I help?', delay: 0, align: 'left' },
    { text: 'Track my order #1234', delay: 1.5, align: 'right' },
    { text: 'Your order is on the way!', delay: 3, align: 'left' },
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      {bubbles.map((bubble, i) => (
        <motion.div
          key={i}
          className={`flex ${bubble.align === 'right' ? 'justify-end' : 'justify-start'}`}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: bubble.delay, duration: 0.5 }}
        >
          <div
            className={`px-4 py-3 rounded-2xl max-w-[200px] text-sm ${
              bubble.align === 'right'
                ? 'bg-primary-blue text-white rounded-br-md'
                : 'bg-white shadow-card text-text-dark rounded-bl-md'
            }`}
          >
            {bubble.text}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Animated stats counter with visual effect
export function AnimatedStat({
  value,
  label,
  icon,
  delay = 0,
}: {
  value: string;
  label: string;
  icon: string;
  delay?: number;
}) {
  return (
    <motion.div
      className="relative group"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      viewport={{ once: true }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary-blue/20 to-accent-green/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/50 shadow-card hover:shadow-card-hover transition-all duration-300">
        <motion.div
          className="w-14 h-14 bg-gradient-to-br from-primary-blue to-primary-light rounded-2xl flex items-center justify-center mb-4 mx-auto"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <i className={`${icon} text-2xl text-white`} />
        </motion.div>
        <div className="text-4xl font-extrabold bg-gradient-to-r from-primary-blue to-accent-green bg-clip-text text-transparent mb-2">
          {value}
        </div>
        <div className="text-sm text-text-muted">{label}</div>
      </div>
    </motion.div>
  );
}

// Channel icons grid with hover effects
export function ChannelIcons() {
  const channels = [
    { icon: 'ri-whatsapp-line', name: 'WhatsApp', color: '#25D366' },
    { icon: 'ri-messenger-line', name: 'Messenger', color: '#0084FF' },
    { icon: 'ri-instagram-line', name: 'Instagram', color: '#E4405F' },
    { icon: 'ri-global-line', name: 'Web', color: '#0078D4' },
    { icon: 'ri-smartphone-line', name: 'Mobile', color: '#7AC143' },
    { icon: 'ri-mail-line', name: 'Email', color: '#F7931E' },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-4">
      {channels.map((channel, i) => (
        <motion.div
          key={channel.name}
          className="group relative"
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1, type: 'spring', stiffness: 200 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="w-16 h-16 rounded-2xl bg-white shadow-card flex items-center justify-center cursor-pointer"
            whileHover={{ y: -5, scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <i className={`${channel.icon} text-2xl`} style={{ color: channel.color }} />
          </motion.div>
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium text-text-muted whitespace-nowrap">
            {channel.name}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Animated workflow steps
export function WorkflowAnimation() {
  const steps = ['Design', 'Train', 'Integrate', 'Launch', 'Optimize'];

  return (
    <div className="relative">
      {/* Connection line */}
      <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-primary-blue via-accent-green to-accent-orange rounded-full" />

      <div className="relative flex justify-between">
        {steps.map((step, i) => (
          <motion.div
            key={step}
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center border-4 border-primary-blue z-10"
              whileHover={{ scale: 1.2 }}
              animate={{
                borderColor: ['#0078D4', '#7AC143', '#F7931E', '#0078D4'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.5,
              }}
            >
              <span className="font-bold text-primary-blue">{i + 1}</span>
            </motion.div>
            <span className="mt-3 text-sm font-medium text-text-dark">{step}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Decorative blob shapes
export function DecorativeBlob({
  color = '#0078D4',
  size = 400,
  className = ''
}: {
  color?: string;
  size?: number;
  className?: string;
}) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={`absolute ${className}`}
      animate={{
        d: [
          'M44.7,-76.4C58.8,-69.2,71.8,-58.6,79.6,-45.1C87.4,-31.6,90,-15.1,89.1,-0.5C88.2,14.1,83.8,28.2,76.1,40.6C68.4,53,57.4,63.6,44.3,71.4C31.2,79.2,15.6,84.2,0.2,83.9C-15.2,83.6,-30.4,78,-43.4,69.6C-56.4,61.2,-67.2,50,-74.8,36.7C-82.4,23.4,-86.8,8,-85.7,-6.8C-84.6,-21.6,-78,-35.8,-68.3,-47.2C-58.6,-58.6,-45.8,-67.2,-32.3,-74.7C-18.8,-82.2,-4.7,-88.6,9.3,-87.2C23.3,-85.8,30.6,-83.6,44.7,-76.4Z',
          'M39.9,-68C52.7,-61.4,64.5,-52.3,73.2,-40.5C81.9,-28.7,87.5,-14.4,87.6,0.1C87.7,14.5,82.3,29,73.5,40.9C64.7,52.8,52.5,62.1,39.1,68.4C25.7,74.7,11.1,78,-3.6,83C-18.3,88,-36.6,94.7,-51.5,90.3C-66.4,85.9,-77.9,70.4,-83.4,53.5C-88.9,36.6,-88.4,18.3,-85.8,1.5C-83.2,-15.3,-78.5,-30.6,-70.6,-44C-62.7,-57.4,-51.6,-68.9,-38.6,-75.4C-25.6,-81.9,-10.6,-83.4,1.9,-86.8C14.4,-90.2,27.1,-74.6,39.9,-68Z',
        ],
      }}
      transition={{
        duration: 10,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'easeInOut',
      }}
    >
      <path
        fill={color}
        opacity="0.1"
        transform="translate(100 100)"
      />
    </motion.svg>
  );
}

// Trust badges
export function TrustBadges() {
  const badges = [
    { label: 'Enterprise Ready', icon: 'ri-shield-check-line' },
    { label: 'GDPR Compliant', icon: 'ri-lock-line' },
    { label: '99.9% Uptime', icon: 'ri-server-line' },
    { label: '24/7 Support', icon: 'ri-headphone-line' },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-6">
      {badges.map((badge, i) => (
        <motion.div
          key={badge.label}
          className="flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-sm rounded-full border border-white/30"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          viewport={{ once: true }}
        >
          <i className={`${badge.icon} text-primary-blue`} />
          <span className="text-sm font-medium text-text-dark">{badge.label}</span>
        </motion.div>
      ))}
    </div>
  );
}
