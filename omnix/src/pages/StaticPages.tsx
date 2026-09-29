import React from 'react';
import { motion } from 'motion/react';
import { Shield, FileText, Info, LifeBuoy, AlertTriangle, Bug } from 'lucide-react';
import { Link } from 'react-router-dom';

const PageContainer = ({ title, icon: Icon, children }: { title: string, icon: any, children: React.ReactNode }) => (
  <div className="min-h-screen bg-black text-white p-6 max-w-4xl mx-auto pb-20">
    <div className="flex items-center gap-3 mb-8">
      <Link to="/" className="text-zinc-400 hover:text-white">&larr; Back</Link>
    </div>
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-400">
          <Icon className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-bold">{title}</h1>
      </div>
      <div className="prose prose-invert max-w-none text-zinc-300">
        {children}
      </div>
    </motion.div>
  </div>
);

export const PrivacyPolicy = () => (
  <PageContainer title="Privacy Policy" icon={Shield}>
    <p>Last updated: {new Date().toLocaleDateString()}</p>
    <h2>1. Introduction</h2>
    <p>Welcome to Omnix. We are committed to protecting your personal information and your right to privacy.</p>
    <h2>2. Information We Collect</h2>
    <p>We collect personal information that you provide to us such as name, address, contact information, passwords and security data, and payment information.</p>
    <h2>3. How We Use Your Information</h2>
    <p>We process your information for purposes based on legitimate business interests, the fulfillment of our contract with you, compliance with our legal obligations, and/or your consent.</p>
  </PageContainer>
);

export const Terms = () => (
  <PageContainer title="Terms of Service" icon={FileText}>
    <p>Last updated: {new Date().toLocaleDateString()}</p>
    <h2>1. Agreement to Terms</h2>
    <p>By viewing or using this website, you agree to be bound by all of these Terms of Use.</p>
    <h2>2. Intellectual Property Rights</h2>
    <p>Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site are owned or controlled by us or licensed to us.</p>
  </PageContainer>
);

export const About = () => (
  <PageContainer title="About Omnix" icon={Info}>
    <h2>Our Mission</h2>
    <p>Omnix is the next-generation social platform designed to empower creators, foster communities, and seamlessly integrate artificial intelligence into the content creation process.</p>
    <h2>Who We Are</h2>
    <p>We are a global team of developers, designers, and creators who believe in the power of expression and community.</p>
  </PageContainer>
);

export const HelpCenter = () => (
  <PageContainer title="Help Center" icon={LifeBuoy}>
    <h2>Frequently Asked Questions</h2>
    <div className="space-y-4 mt-6">
      <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
        <h3 className="font-bold mb-2">How do I create an OmniClip?</h3>
        <p className="text-sm text-zinc-400">Go to the OmniClips tab and tap the + button, or use the AI Studio to generate one from a prompt.</p>
      </div>
      <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
        <h3 className="font-bold mb-2">How do I verify my account?</h3>
        <p className="text-sm text-zinc-400">Verification is available to creators with an established following. Apply through the settings page.</p>
      </div>
    </div>
  </PageContainer>
);

export const Support = () => (
  <PageContainer title="Support" icon={AlertTriangle}>
    <p>Need help? Our support team is here for you 24/7.</p>
    <div className="mt-8">
      <form className="space-y-4 max-w-md" onSubmit={(e) => { e.preventDefault(); alert('Message sent! We will get back to you shortly.'); }}>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input type="email" required className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Message</label>
          <textarea required rows={4} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white"></textarea>
        </div>
        <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg">Send Message</button>
      </form>
    </div>
  </PageContainer>
);

export const ReportBug = () => (
  <PageContainer title="Report a Bug" icon={Bug}>
    <p>Found a glitch? Let us know so we can fix it.</p>
    <div className="mt-8">
      <form className="space-y-4 max-w-md" onSubmit={(e) => { e.preventDefault(); alert('Bug report submitted. Thank you!'); }}>
        <div>
          <label className="block text-sm font-medium mb-1">Bug Description</label>
          <textarea required rows={4} placeholder="What happened?" className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white"></textarea>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Steps to Reproduce</label>
          <textarea required rows={3} placeholder="1. Go to...\n2. Click on...\n3. See error..." className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white"></textarea>
        </div>
        <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg">Submit Report</button>
      </form>
    </div>
  </PageContainer>
);
