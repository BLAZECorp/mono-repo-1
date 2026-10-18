import React from 'react';
import { motion } from 'framer-motion';
import { Link } from '@tanstack/react-router';
import {
  Zap,
  ShieldCheck,
  FolderTree,
  Activity,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { toast } from 'sonner';

export const HomeView: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const features = [
    {
      icon: <Zap size={22} color="#6366f1" />,
      title: 'TanStack Router + Query Synergy',
      description:
        'Zero-waterfall page transitions. Route loaders prefetch cached query data on link hover before component render.',
      badge: 'Routing & Data',
    },
    {
      icon: <FolderTree size={22} color="#10b981" />,
      title: 'Modular Monolith Architecture',
      description:
        'Strict domain isolation with api/, hooks/, schemas/, components/, and views/. Public APIs guarded via barrel exports.',
      badge: 'Clean Code',
    },
    {
      icon: <ShieldCheck size={22} color="#f59e0b" />,
      title: 'End-to-End Type Safety & Zod',
      description:
        'URL search parameters, form inputs, and remote API responses validated at runtime boundaries.',
      badge: 'Validation',
    },
    {
      icon: <Activity size={22} color="#ec4899" />,
      title: 'Redux Client State & Toasts',
      description:
        'Global UI state managed cleanly with Redux Toolkit; server state managed with TanStack Query. Integrated with Sonner.',
      badge: 'State & UI',
    },
  ];

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '60px 24px' }}>
      {/* Hero Section */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          marginBottom: '64px',
        }}
      >
        <motion.div variants={itemVariants}>
          <Badge variant="primary" style={{ marginBottom: '16px' }}>
            <Sparkles size={12} style={{ marginRight: '6px' }} />
            VGC Enterprise Grade React 19 Template
          </Badge>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          style={{
            fontSize: 'clamp(36px, 5vw, 64px)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            marginBottom: '20px',
            maxWidth: '900px',
          }}
        >
          Modern, Resilient & Modular <br />
          <span className="gradient-text">React 19 Architecture</span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          style={{
            fontSize: '18px',
            color: 'var(--text-secondary)',
            maxWidth: '680px',
            marginBottom: '32px',
            lineHeight: 1.6,
          }}
        >
          Engineered according to Veronque Group of Companies standards.
          Featuring TanStack Router with loader prefetching, TanStack Query, Redux Toolkit,
          Zod runtime contracts, and Framer Motion micro-interactions.
        </motion.p>

        <motion.div
          variants={itemVariants}
          style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}
        >
          <Link to="/dashboard">
            <Button
              size="lg"
              variant="primary"
              rightIcon={<ArrowRight size={18} />}
            >
              Explore Live Dashboard
            </Button>
          </Link>
          <Button
            size="lg"
            variant="outline"
            onClick={() => {
              toast.info('Standards Document Available', {
                description: 'See docs/frontend-standard.md for complete governance rules.',
              });
            }}
          >
            Review Governance Standard
          </Button>
        </motion.div>
      </motion.div>

      {/* Feature Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
        }}
      >
        {features.map((item, idx) => (
          <Card key={idx} whileHover={{ y: -4 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {item.icon}
              </div>
              <Badge variant="neutral">{item.badge}</Badge>
            </div>
            <h3
              style={{
                fontSize: '17px',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: '8px',
              }}
            >
              {item.title}
            </h3>
            <p
              style={{
                fontSize: '14px',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
              }}
            >
              {item.description}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
};
