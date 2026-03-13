import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Plus, 
  MessageSquare, 
  Lightbulb, 
  Info, 
  ChevronRight, 
  ChevronLeft, 
  ArrowRight, 
  CheckCircle2, 
  ThumbsUp, 
  ThumbsDown,
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow } from 'date-fns';

// --- Utils ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
interface Idea {
  id: string;
  title: string;
  description: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  votes_use: number;
  votes_not_use: number;
  created_at: string;
}

// --- Components ---

const Navbar = ({ activePage, setActivePage }: { activePage: string, setActivePage: (p: string) => void }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { id: 'feed', label: 'Ideas Feed', icon: Lightbulb },
    { id: 'submit', label: 'Submit Idea', icon: Plus },
    { id: 'about', label: 'About', icon: Info },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div 
            className="flex items-center cursor-pointer group" 
            onClick={() => setActivePage('home')}
          >
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center mr-2 group-hover:rotate-12 transition-transform">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase font-display">Half Cooked</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-black",
                  activePage === item.id ? "text-black" : "text-gray-500"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2">
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-black/5 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActivePage(item.id);
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center w-full text-left px-2 py-2 text-lg font-medium text-gray-600"
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const IdeaCard = ({ idea, onVote }: { idea: Idea, onVote: (id: string, type: 'use' | 'not_use') => void, key?: string }) => {
  const [voted, setVoted] = useState(false);

  const handleVote = async (type: 'use' | 'not_use') => {
    if (voted) return;
    try {
      const res = await fetch(`/api/ideas/${idea.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
      if (res.ok) {
        setVoted(true);
        onVote(idea.id, type);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full"
    >
      <div className="flex-1">
        <h3 className="text-xl font-bold mb-2 leading-tight">{idea.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{idea.description}</p>
      </div>
      
      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{formatDistanceToNow(new Date(idea.created_at))} ago</span>
          <div className="flex space-x-3">
            <span className="flex items-center"><ThumbsUp className="w-3 h-3 mr-1" /> {idea.votes_use}</span>
            <span className="flex items-center"><ThumbsDown className="w-3 h-3 mr-1" /> {idea.votes_not_use}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => handleVote('use')}
            disabled={voted}
            className={cn(
              "flex items-center justify-center py-2 px-3 rounded-xl text-xs font-semibold transition-all",
              voted ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            )}
          >
            <ThumbsUp className="w-3 h-3 mr-2" /> I'd use this
          </button>
          <button 
            onClick={() => handleVote('not_use')}
            disabled={voted}
            className={cn(
              "flex items-center justify-center py-2 px-3 rounded-xl text-xs font-semibold transition-all",
              voted ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-rose-50 text-rose-700 hover:bg-rose-100"
            )}
          >
            <ThumbsDown className="w-3 h-3 mr-2" /> I wouldn't
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// --- Pages ---

const HomePage = ({ onBrowse, onSubmit, featuredIdeas }: { onBrowse: () => void, onSubmit: () => void, featuredIdeas: Idea[] }) => (
  <div className="flex flex-col min-h-[calc(100vh-64px)]">
    <div className="grid lg:grid-cols-2 flex-1 border-b border-black/5">
      {/* Left Column: Text Content */}
      <div className="p-8 md:p-16 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-black/5">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-block px-3 py-1 rounded-full bg-black text-white text-[10px] font-bold uppercase tracking-widest mb-8">
            The Raw Idea Repository
          </div>
          <h1 className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter mb-8 uppercase font-display">
            Half <br />
            Cooked <br />
            <span className="text-gray-300">Ideas.</span>
          </h1>
          <p className="text-xl text-gray-500 mb-12 max-w-md leading-relaxed">
            The internet's repository for unpolished, raw, and potentially brilliant startup concepts. 
            No pitch decks. No business plans. Just ideas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={onBrowse}
              className="px-10 py-5 bg-black text-white rounded-full font-bold text-lg hover:scale-105 transition-transform flex items-center justify-center group"
            >
              Explore Feed <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={onSubmit}
              className="px-10 py-5 bg-white text-black border-2 border-black rounded-full font-bold text-lg hover:bg-black hover:text-white transition-all"
            >
              Drop an Idea
            </button>
          </div>
        </motion.div>
      </div>

      {/* Right Column: Featured/Visual */}
      <div className="bg-gray-50 p-8 md:p-16 flex flex-col justify-center relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-8">Trending Concepts</h3>
          <div className="space-y-6">
            {featuredIdeas.length > 0 ? (
              featuredIdeas.slice(0, 3).map((idea, i) => (
                <motion.div
                  key={idea.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + (i * 0.1) }}
                  className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm hover:shadow-xl transition-all cursor-pointer group"
                  onClick={onBrowse}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-lg group-hover:text-emerald-600 transition-colors">{idea.title}</h4>
                    <div className="flex items-center text-xs text-emerald-500 font-bold">
                      <ThumbsUp className="w-3 h-3 mr-1" /> {idea.votes_use}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2">{idea.description}</p>
                </motion.div>
              ))
            ) : (
              <div className="bg-white p-12 rounded-3xl border border-dashed border-black/10 text-center">
                <Lightbulb className="w-8 h-8 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-400 font-medium">No ideas trending yet. Be the first!</p>
              </div>
            )}
          </div>
          
          <div className="mt-12 flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
            <span>Community Driven Feedback</span>
            <div className="flex -space-x-2">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200" />
              ))}
            </div>
          </div>
        </div>

        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100/50 rounded-full -mr-48 -mt-48 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-100/50 rounded-full -ml-32 -mb-32 blur-3xl" />
      </div>
    </div>

    {/* Stats/Marquee Section */}
    <div className="bg-black text-white py-6 overflow-hidden whitespace-nowrap">
      <div className="flex animate-marquee">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="flex items-center mx-8">
            <span className="text-2xl font-black uppercase tracking-tighter font-display">Raw Concepts</span>
            <div className="w-2 h-2 bg-emerald-400 rounded-full mx-6" />
            <span className="text-2xl font-black uppercase tracking-tighter font-display">Unfiltered Feedback</span>
            <div className="w-2 h-2 bg-rose-400 rounded-full mx-6" />
            <span className="text-2xl font-black uppercase tracking-tighter font-display">Community Driven</span>
            <div className="w-2 h-2 bg-white rounded-full mx-6" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const FeedPage = ({ ideas, setIdeas }: { ideas: Idea[], setIdeas: React.Dispatch<React.SetStateAction<Idea[]>> }) => {
  const [sort, setSort] = useState('newest');
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const LIMIT = 9;

  const observer = useRef<IntersectionObserver | null>(null);
  const lastIdeaElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setOffset(prevOffset => prevOffset + LIMIT);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  useEffect(() => {
    // Reset when sort changes
    setIdeas([]);
    setOffset(0);
    setHasMore(true);
  }, [sort]);

  useEffect(() => {
    const fetchIdeas = async () => {
      setLoading(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
        const res = await fetch(`/api/ideas?sort=${sort}&limit=${LIMIT}&offset=${offset}`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        const data = await res.json();
        
        if (data.error) {
          console.error('Server error:', data.error);
          setHasMore(false);
          return;
        }

        if (data.length < LIMIT) {
          setHasMore(false);
        }
        
        setIdeas(prev => {
          const existingIds = new Set(prev.map(i => i.id));
          const newIdeas = data.filter((i: Idea) => !existingIds.has(i.id));
          return [...prev, ...newIdeas];
        });
      } catch (err: any) {
        console.error(err);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };
    fetchIdeas();
  }, [sort, offset]);

  const onVote = (id: string, type: 'use' | 'not_use') => {
    setIdeas(prev => prev.map(idea => {
      if (idea.id === id) {
        return {
          ...idea,
          votes_use: type === 'use' ? idea.votes_use + 1 : idea.votes_use,
          votes_not_use: type === 'not_use' ? idea.votes_not_use + 1 : idea.votes_not_use
        };
      }
      return idea;
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h2 className="text-4xl font-bold mb-2">Ideas Feed</h2>
          <p className="text-gray-500">Unfinished thoughts from around the web.</p>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-xl">
          {['newest', 'popular', 'controversial'].map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all",
                sort === s ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-black"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {ideas.length === 0 && !loading ? (
        <div className="text-center py-24 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
          <Lightbulb className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-400">No ideas found yet.</h3>
          <p className="text-gray-400">Be the first to submit one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ideas.map((idea, index) => {
            if (ideas.length === index + 1) {
              return (
                <div ref={lastIdeaElementRef} key={idea.id}>
                  <IdeaCard idea={idea} onVote={onVote} />
                </div>
              );
            } else {
              return <IdeaCard key={idea.id} idea={idea} onVote={onVote} />;
            }
          })}
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {!hasMore && ideas.length > 0 && (
        <div className="text-center py-12 text-gray-400 text-sm">
          You've reached the end of the half-cooked ideas.
        </div>
      )}
    </div>
  );
};

const SubmitPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', description: '', email: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
      const res = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (res.ok) {
        setSubmitted(true);
      } else {
        setError(data.error || 'Failed to submit idea. Please check your connection.');
      }
    } catch (err: any) {
      console.error(err);
      if (err.name === 'AbortError') {
        setError('Submission timed out. Please check your internet connection and try again.');
      } else {
        setError('An unexpected error occurred. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-emerald-50 p-12 rounded-[3rem] border border-emerald-100"
        >
          <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-emerald-900 mb-4">Idea Submitted!</h2>
          <p className="text-emerald-700 text-lg mb-8">
            Your idea has been submitted and is awaiting approval. <br />
            We'll check it out soon!
          </p>
          <button 
            onClick={() => setSubmitted(false)}
            className="px-8 py-3 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-colors"
          >
            Submit Another
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h2 className="text-4xl font-bold mb-2">Submit an Idea</h2>
        <p className="text-gray-500">Don't let it rot in your notes app.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-medium">
            {error}
          </div>
        )}
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 ml-1">Idea Title</label>
          <input 
            required
            placeholder="e.g. Uber for Dog Walkers"
            className="w-full px-6 py-4 bg-gray-50 border border-black/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
            value={form.title}
            onChange={e => setForm({...form, title: e.target.value})}
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 ml-1">Description</label>
          <textarea 
            required
            rows={5}
            placeholder="Explain the problem and your half-cooked solution..."
            className="w-full px-6 py-4 bg-gray-50 border border-black/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all resize-none"
            value={form.description}
            onChange={e => setForm({...form, description: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 ml-1">Your Email</label>
          <input 
            required
            type="email"
            placeholder="you@example.com"
            className="w-full px-6 py-4 bg-gray-50 border border-black/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
            value={form.email}
            onChange={e => setForm({...form, email: e.target.value})}
          />
          <p className="text-xs text-gray-400 ml-1">We'll only use this if we need to contact you about your idea.</p>
        </div>

        <button 
          disabled={loading}
          className="w-full py-5 bg-black text-white rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Idea"}
        </button>
      </form>
    </div>
  );
};

const AboutPage = () => {
  const messages = [
    { role: 'user', text: 'What is Half Cooked Ideas?' },
    { role: 'bot', text: 'It’s a place for unfinished startup ideas. Most great things start as a random thought in the shower or a notes app entry. We want to see them all.' },
    { role: 'user', text: 'Do I need an account?' },
    { role: 'bot', text: 'No. Just browse, vote, or submit. We believe in extreme simplicity. No passwords, no onboarding, just ideas.' },
    { role: 'user', text: 'What happens when I submit an idea?' },
    { role: 'bot', text: 'It goes to moderation. If approved, it appears in the public feed for everyone to see and vote on.' },
    { role: 'user', text: 'Why "Half Cooked"?' },
    { role: 'bot', text: 'Because "Fully Baked" ideas are boring. The raw, messy, and slightly crazy ones are where the magic happens.' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h2 className="text-4xl font-bold mb-2">About</h2>
        <p className="text-gray-500">The philosophy behind the platform.</p>
      </div>

      <div className="space-y-8">
        {messages.map((m, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "flex flex-col max-w-[80%]",
              m.role === 'user' ? "ml-auto items-end" : "items-start"
            )}
          >
            <span className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">
              {m.role === 'user' ? 'You' : 'Half Cooked Ideas'}
            </span>
            <div className={cn(
              "px-6 py-4 rounded-[2rem]",
              m.role === 'user' 
                ? "bg-black text-white rounded-tr-none" 
                : "bg-gray-100 text-gray-800 rounded-tl-none"
            )}>
              <p className="text-lg leading-relaxed">{m.text}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const AdminPage = () => {
  const [secret, setSecret] = useState('');
  const [isAuth, setIsAuth] = useState(false);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/ideas', {
        headers: { 'x-admin-secret': secret }
      });
      if (res.ok) {
        const data = await res.json();
        setIdeas(data);
        setIsAuth(true);
      } else {
        alert('Invalid secret');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch(`/api/admin/ideas/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-secret': secret
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setIdeas(prev => prev.filter(i => i.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isAuth) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <ShieldCheck className="w-12 h-12 mx-auto mb-6 text-gray-300" />
        <h2 className="text-2xl font-bold mb-6">Admin Access</h2>
        <input 
          type="password"
          placeholder="Enter Admin Secret"
          className="w-full px-6 py-4 bg-gray-50 border border-black/5 rounded-2xl mb-4 focus:outline-none"
          value={secret}
          onChange={e => setSecret(e.target.value)}
        />
        <button 
          onClick={fetchPending}
          className="w-full py-4 bg-black text-white rounded-2xl font-bold"
        >
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h2 className="text-4xl font-bold mb-2">Moderation Queue</h2>
          <p className="text-gray-500">{ideas.length} ideas awaiting review.</p>
        </div>
        <button onClick={() => setIsAuth(false)} className="text-sm text-gray-400 hover:text-black">Logout</button>
      </div>

      <div className="bg-white border border-black/5 rounded-[2rem] overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-black/5">
            <tr>
              <th className="px-6 py-4 text-sm font-bold text-gray-500">Idea</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-500">Submitter</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-500">Date</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {ideas.map((idea) => (
              <tr key={idea.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-6 max-w-md">
                  <div className="font-bold mb-1">{idea.title}</div>
                  <div className="text-sm text-gray-500 line-clamp-2">{idea.description}</div>
                </td>
                <td className="px-6 py-6 text-sm text-gray-600">{idea.email}</td>
                <td className="px-6 py-6 text-sm text-gray-400">{new Date(idea.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-6 text-right">
                  <div className="flex justify-end space-x-2">
                    <button 
                      onClick={() => handleAction(idea.id, 'approved')}
                      className="px-4 py-2 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleAction(idea.id, 'rejected')}
                      className="px-4 py-2 bg-rose-500 text-white text-xs font-bold rounded-lg hover:bg-rose-600"
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {ideas.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-400">All caught up! No pending ideas.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activePage, setActivePage] = useState('home');
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [featuredIdeas, setFeaturedIdeas] = useState<Idea[]>([]);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch('/api/ideas?sort=popular');
        const data = await res.json();
        setFeaturedIdeas(data.slice(0, 5));
      } catch (err) {
        console.error(err);
      }
    };
    fetchFeatured();
  }, []);

  const renderPage = () => {
    switch (activePage) {
      case 'home': return <HomePage onBrowse={() => setActivePage('feed')} onSubmit={() => setActivePage('submit')} featuredIdeas={featuredIdeas} />;
      case 'feed': return <FeedPage ideas={ideas} setIdeas={setIdeas} />;
      case 'submit': return <SubmitPage />;
      case 'about': return <AboutPage />;
      case 'admin': return <AdminPage />;
      default: return <HomePage onBrowse={() => setActivePage('feed')} onSubmit={() => setActivePage('submit')} featuredIdeas={featuredIdeas} />;
    }
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      <Navbar activePage={activePage} setActivePage={setActivePage} />
      
      <main className="min-h-[calc(100vh-12rem)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="py-12 border-t border-black/5">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-6 h-6 bg-black rounded flex items-center justify-center mr-2">
              <Lightbulb className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-sm">Half Cooked Ideas</span>
          </div>
          <p className="text-gray-400 text-sm">Made by TARS Networks</p>
          <button 
            onClick={() => setActivePage('admin')}
            className="mt-4 text-[10px] text-gray-200 hover:text-gray-400 transition-colors"
          >
            Admin
          </button>
        </div>
      </footer>
    </div>
  );
}
