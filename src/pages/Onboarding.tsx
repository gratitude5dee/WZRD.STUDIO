import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  ChevronRight, 
  Music, 
  Film, 
  BookOpen, 
  Sparkles,
  Zap,
  Heart,
  Moon,
  Flame,
  Leaf,
  ArrowRight,
  X,
  ExternalLink,
  BadgeCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

type CreatorType = 'human' | 'agent';

// Types
interface CreativeTaste {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
}

interface Genre {
  id: string;
  name: string;
  category: 'music' | 'film' | 'reading';
  color: string;
  emoji: string;
}

interface ContentService {
  id: string;
  name: string;
  color: string;
  description: string;
  connected: boolean;
}

// Data
const CREATIVE_TASTES: CreativeTaste[] = [
  {
    id: 'energetic',
    label: 'Energetic',
    description: 'High-energy, uplifting content that moves you',
    icon: <Zap className="w-6 h-6" />,
    gradient: 'from-orange-500 via-amber-500 to-yellow-400',
  },
  {
    id: 'contemplative',
    label: 'Contemplative',
    description: 'Thoughtful, introspective experiences',
    icon: <Moon className="w-6 h-6" />,
    gradient: 'from-indigo-600 via-purple-600 to-violet-500',
  },
  {
    id: 'romantic',
    label: 'Romantic',
    description: 'Emotional depth and heartfelt stories',
    icon: <Heart className="w-6 h-6" />,
    gradient: 'from-rose-500 via-pink-500 to-fuchsia-400',
  },
  {
    id: 'adventurous',
    label: 'Adventurous',
    description: 'Bold explorations and new discoveries',
    icon: <Flame className="w-6 h-6" />,
    gradient: 'from-red-600 via-orange-500 to-amber-400',
  },
  {
    id: 'peaceful',
    label: 'Peaceful',
    description: 'Calm, serene, and grounding',
    icon: <Leaf className="w-6 h-6" />,
    gradient: 'from-emerald-500 via-teal-500 to-cyan-400',
  },
  {
    id: 'inspired',
    label: 'Inspired',
    description: 'Creative fuel and artistic expression',
    icon: <Sparkles className="w-6 h-6" />,
    gradient: 'from-violet-600 via-purple-500 to-fuchsia-400',
  },
];

const GENRES: Genre[] = [
  // Music
  { id: 'hip-hop', name: 'Hip-Hop', category: 'music', color: '#F97316', emoji: '🎤' },
  { id: 'electronic', name: 'Electronic', category: 'music', color: '#8B5CF6', emoji: '🎧' },
  { id: 'rnb', name: 'R&B / Soul', category: 'music', color: '#EC4899', emoji: '💜' },
  { id: 'rock', name: 'Rock', category: 'music', color: '#EF4444', emoji: '🎸' },
  { id: 'jazz', name: 'Jazz', category: 'music', color: '#3B82F6', emoji: '🎷' },
  { id: 'classical', name: 'Classical', category: 'music', color: '#A78BFA', emoji: '🎻' },
  { id: 'indie', name: 'Indie', category: 'music', color: '#10B981', emoji: '🎹' },
  { id: 'lofi', name: 'Lo-Fi', category: 'music', color: '#6366F1', emoji: '☕' },
  // Film
  { id: 'drama', name: 'Drama', category: 'film', color: '#DC2626', emoji: '🎭' },
  { id: 'comedy', name: 'Comedy', category: 'film', color: '#FBBF24', emoji: '😂' },
  { id: 'thriller', name: 'Thriller', category: 'film', color: '#1F2937', emoji: '🔪' },
  { id: 'scifi', name: 'Sci-Fi', category: 'film', color: '#0EA5E9', emoji: '🚀' },
  { id: 'documentary', name: 'Documentary', category: 'film', color: '#059669', emoji: '📽️' },
  { id: 'horror', name: 'Horror', category: 'film', color: '#7C2D12', emoji: '👻' },
  { id: 'romance', name: 'Romance', category: 'film', color: '#F472B6', emoji: '💕' },
  { id: 'action', name: 'Action', category: 'film', color: '#F59E0B', emoji: '💥' },
  // Reading
  { id: 'fiction', name: 'Fiction', category: 'reading', color: '#8B5CF6', emoji: '📚' },
  { id: 'nonfiction', name: 'Non-Fiction', category: 'reading', color: '#0D9488', emoji: '📖' },
  { id: 'poetry', name: 'Poetry', category: 'reading', color: '#DB2777', emoji: '✨' },
  { id: 'essays', name: 'Essays', category: 'reading', color: '#64748B', emoji: '📝' },
];

const CONTENT_SERVICES: ContentService[] = [
  {
    id: 'spotify',
    name: 'Spotify',
    color: '#1DB954',
    description: 'Import your listening history & playlists',
    connected: false,
  },
  {
    id: 'apple-music',
    name: 'Apple Music',
    color: '#FC3C44',
    description: 'Sync your Apple Music library',
    connected: false,
  },
  {
    id: 'netflix',
    name: 'Netflix',
    color: '#E50914',
    description: 'Learn from your watch history',
    connected: false,
  },
  {
    id: 'youtube',
    name: 'YouTube',
    color: '#FF0000',
    description: 'Analyze your subscriptions & likes',
    connected: false,
  },
  {
    id: 'goodreads',
    name: 'Goodreads',
    color: '#553B08',
    description: 'Import your reading history',
    connected: false,
  },
];

// Animation Variants
const pageVariants = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
};

const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const cardHover = {
  rest: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
};

// Step Components
function WelcomeStep({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  return (
    <motion.div
      key="welcome"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center"
    >
      {/* Animated Logo/Brand Element */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative mb-12"
      >
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/30 to-primary/10 blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center shadow-2xl shadow-primary/30">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-2 rounded-full border border-primary-foreground/20"
          />
          <Sparkles className="w-12 h-12 text-primary-foreground" />
        </div>
      </motion.div>

      {/* Headlines */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="font-serif text-4xl md:text-5xl lg:text-6xl font-light text-foreground mb-4 tracking-tight"
      >
        Let's discover
        <br />
        <span className="italic text-primary">your taste</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="text-muted-foreground text-lg max-w-md mb-12 leading-relaxed"
      >
        Answer a few questions so we can curate content that resonates with you.
      </motion.p>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
      >
        <Button
          onClick={onNext}
          size="lg"
          className="h-14 px-8 text-lg font-medium rounded-full bg-foreground text-background hover:bg-foreground/90 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
        >
          Begin
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </motion.div>

      {/* Skip option */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        onClick={onSkip}
        className="mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        Skip for now
      </motion.button>
    </motion.div>
  );
}

function CreatorTypeStep({
  selected,
  onSelect,
  onNext,
  onBack,
}: {
  selected: CreatorType | null;
  onSelect: (type: CreatorType) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const options = [
    {
      id: 'human' as CreatorType,
      label: 'Human Creator',
      description: 'I am a human artist, musician, filmmaker, or creative',
      badge: <BadgeCheck className="w-8 h-8 text-yellow-400 fill-yellow-400/20" />,
      gradient: 'from-yellow-500 via-amber-500 to-orange-400',
    },
    {
      id: 'agent' as CreatorType,
      label: 'AI Agent',
      description: 'I am an AI creating or curating content autonomously',
      badge: <span className="text-3xl">🦞</span>,
      gradient: 'from-orange-500 via-red-500 to-pink-400',
    },
  ];

  return (
    <motion.div
      key="creator-type"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="px-6 py-8 pt-20"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <p className="text-primary text-sm font-medium uppercase tracking-widest mb-2">
          Step 1 of 4
        </p>
        <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-3">
          Who are you?
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Help us understand your creative identity.
        </p>
      </motion.div>

      {/* Creator Type Cards */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-10"
      >
        {options.map((option) => {
          const isSelected = selected === option.id;
          return (
            <motion.button
              key={option.id}
              variants={staggerItem}
              whileHover="hover"
              whileTap="tap"
              onClick={() => onSelect(option.id)}
              className="relative group"
            >
              <motion.div
                variants={cardHover}
                className={`
                  relative overflow-hidden rounded-2xl p-8 h-48 flex flex-col items-center justify-center text-center
                  border-2 transition-all duration-300
                  ${isSelected 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border/50 bg-card hover:border-border'
                  }
                `}
              >
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`absolute inset-0 bg-gradient-to-br ${option.gradient} opacity-10`}
                  />
                )}

                <div className={`
                  relative w-16 h-16 rounded-2xl flex items-center justify-center mb-4
                  ${isSelected 
                    ? `bg-gradient-to-br ${option.gradient} text-white` 
                    : 'bg-secondary text-muted-foreground'
                  }
                `}>
                  {option.badge}
                </div>

                <div className="relative">
                  <h3 className="font-semibold text-lg text-foreground mb-2">{option.label}</h3>
                  <p className="text-sm text-muted-foreground">
                    {option.description}
                  </p>
                </div>

                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                  >
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </motion.div>
                )}
              </motion.div>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Navigation */}
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        <Button variant="ghost" onClick={onBack} className="text-muted-foreground">
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!selected}
          className="rounded-full px-6"
        >
          Continue
          <ChevronRight className="ml-1 w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}

function CreativeTastesStep({
  selected,
  onSelect,
  onNext,
  onBack,
}: {
  selected: string[];
  onSelect: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <motion.div
      key="tastes"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="px-6 py-8 pt-20"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <p className="text-primary text-sm font-medium uppercase tracking-widest mb-2">
          Step 2 of 4
        </p>
        <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-3">
          What moves you?
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Select all the moods and vibes that resonate with your creative soul.
        </p>
      </motion.div>

      {/* Taste Grid */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-10"
      >
        {CREATIVE_TASTES.map((taste) => {
          const isSelected = selected.includes(taste.id);
          return (
            <motion.button
              key={taste.id}
              variants={staggerItem}
              whileHover="hover"
              whileTap="tap"
              onClick={() => onSelect(taste.id)}
              className="relative group"
            >
              <motion.div
                variants={cardHover}
                className={`
                  relative overflow-hidden rounded-2xl p-6 h-40 flex flex-col justify-between
                  border-2 transition-all duration-300
                  ${isSelected 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border/50 bg-card hover:border-border'
                  }
                `}
              >
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`absolute inset-0 bg-gradient-to-br ${taste.gradient} opacity-10`}
                  />
                )}

                <div className={`
                  relative w-12 h-12 rounded-xl flex items-center justify-center
                  ${isSelected 
                    ? `bg-gradient-to-br ${taste.gradient} text-white` 
                    : 'bg-secondary text-muted-foreground'
                  }
                `}>
                  {taste.icon}
                </div>

                <div className="relative text-left">
                  <h3 className="font-semibold text-foreground mb-1">{taste.label}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {taste.description}
                  </p>
                </div>

                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                  >
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </motion.div>
                )}
              </motion.div>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Navigation */}
      <div className="flex items-center justify-between max-w-3xl mx-auto">
        <Button variant="ghost" onClick={onBack} className="text-muted-foreground">
          Back
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {selected.length} selected
          </span>
          <Button
            onClick={onNext}
            disabled={selected.length === 0}
            className="rounded-full px-6"
          >
            Continue
            <ChevronRight className="ml-1 w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function GenreSelectionStep({
  selected,
  onSelect,
  onNext,
  onBack,
}: {
  selected: string[];
  onSelect: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [activeCategory, setActiveCategory] = useState<'music' | 'film' | 'reading'>('music');

  const categories = [
    { id: 'music' as const, label: 'Music', icon: <Music className="w-4 h-4" /> },
    { id: 'film' as const, label: 'Film & TV', icon: <Film className="w-4 h-4" /> },
    { id: 'reading' as const, label: 'Reading', icon: <BookOpen className="w-4 h-4" /> },
  ];

  const filteredGenres = GENRES.filter((g) => g.category === activeCategory);

  return (
    <motion.div
      key="genres"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="px-6 py-8 pt-20"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <p className="text-primary text-sm font-medium uppercase tracking-widest mb-2">
          Step 3 of 4
        </p>
        <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-3">
          Pick your genres
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Select your favorites across music, film, and reading.
        </p>
      </motion.div>

      {/* Category Tabs */}
      <div className="flex justify-center gap-2 mb-8">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`
              flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium
              transition-all duration-200
              ${activeCategory === cat.id
                ? 'bg-foreground text-background'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
              }
            `}
          >
            {cat.icon}
            {cat.label}
          </button>
        ))}
      </div>

      {/* Genre Grid */}
      <motion.div
        key={activeCategory}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-w-3xl mx-auto mb-10"
      >
        {filteredGenres.map((genre, index) => {
          const isSelected = selected.includes(genre.id);
          return (
            <motion.button
              key={genre.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(genre.id)}
              className={`
                relative h-24 rounded-xl overflow-hidden
                transition-all duration-200
                ${isSelected 
                  ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' 
                  : ''
                }
              `}
              style={{ 
                backgroundColor: isSelected ? genre.color : `${genre.color}20`,
              }}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                <span className="text-2xl">{genre.emoji}</span>
                <span 
                  className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-foreground'}`}
                >
                  {genre.name}
                </span>
              </div>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white/90 flex items-center justify-center"
                >
                  <Check className="w-3 h-3 text-primary" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Selected count indicator */}
      <div className="flex justify-center gap-4 mb-8">
        {categories.map((cat) => {
          const count = selected.filter((id) => 
            GENRES.find((g) => g.id === id)?.category === cat.id
          ).length;
          return (
            <div key={cat.id} className="flex items-center gap-1.5 text-sm text-muted-foreground">
              {cat.icon}
              <span className="font-medium text-foreground">{count}</span>
            </div>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between max-w-3xl mx-auto">
        <Button variant="ghost" onClick={onBack} className="text-muted-foreground">
          Back
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {selected.length} selected
          </span>
          <Button
            onClick={onNext}
            disabled={selected.length === 0}
            className="rounded-full px-6"
          >
            Continue
            <ChevronRight className="ml-1 w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function ConnectServicesStep({
  services,
  onConnect,
  onNext,
  onBack,
}: {
  services: ContentService[];
  onConnect: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const connectedCount = services.filter((s) => s.connected).length;

  return (
    <motion.div
      key="connect"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="px-6 py-8 pt-20"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <p className="text-primary text-sm font-medium uppercase tracking-widest mb-2">
          Step 4 of 4
        </p>
        <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-3">
          Connect your world
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Link your existing accounts for smarter, personalized recommendations.
        </p>
      </motion.div>

      {/* Services List */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="space-y-3 max-w-lg mx-auto mb-10"
      >
        {services.map((service) => (
          <motion.div
            key={service.id}
            variants={staggerItem}
            className={`
              group relative rounded-2xl p-4 border-2 transition-all duration-300 cursor-pointer
              ${service.connected 
                ? 'border-primary bg-primary/5' 
                : 'border-border/50 bg-card hover:border-border'
              }
            `}
            onClick={() => onConnect(service.id)}
          >
            <div className="flex items-center gap-4">
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-xl font-bold"
                style={{ backgroundColor: service.color }}
              >
                {service.name.charAt(0)}
              </div>

              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-0.5">{service.name}</h3>
                <p className="text-sm text-muted-foreground">{service.description}</p>
              </div>

              <div>
                {service.connected ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-1.5 text-sm font-medium text-primary"
                  >
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                    Connected
                  </motion.div>
                ) : (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="rounded-full group-hover:bg-foreground group-hover:text-background transition-all"
                  >
                    Connect
                    <ExternalLink className="ml-1.5 w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Privacy note */}
      <div className="text-center mb-8">
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          We only read your preferences to improve recommendations. 
          Your data is never shared or sold.
        </p>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between max-w-lg mx-auto">
        <Button variant="ghost" onClick={onBack} className="text-muted-foreground">
          Back
        </Button>
        <Button
          onClick={onNext}
          className="rounded-full px-6"
        >
          {connectedCount > 0 ? 'Finish Setup' : 'Skip for Now'}
          <ChevronRight className="ml-1 w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}

function CompletionStep({ onFinish }: { onFinish: () => void }) {
  return (
    <motion.div
      key="complete"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center"
    >
      {/* Success Animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="relative mb-10"
      >
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
              x: Math.cos(i * 45 * Math.PI / 180) * 80,
              y: Math.sin(i * 45 * Math.PI / 180) * 80,
            }}
            transition={{ delay: 0.3 + i * 0.05, duration: 0.8 }}
            className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full bg-primary"
          />
        ))}
        
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="w-24 h-24 rounded-full bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center shadow-2xl shadow-primary/30"
        >
          <Check className="w-12 h-12 text-primary-foreground" />
        </motion.div>
      </motion.div>

      {/* Headlines */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="font-serif text-4xl md:text-5xl font-light text-foreground mb-4"
      >
        You're all set
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="text-muted-foreground text-lg max-w-md mb-4 leading-relaxed"
      >
        Your personalized experience awaits. We've curated content just for you.
      </motion.p>

      {/* Quick stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="flex items-center gap-6 mb-12 text-sm"
      >
        <div className="text-center">
          <div className="font-bold text-xl text-foreground">147</div>
          <div className="text-muted-foreground">Tracks queued</div>
        </div>
        <div className="w-px h-10 bg-border" />
        <div className="text-center">
          <div className="font-bold text-xl text-foreground">23</div>
          <div className="text-muted-foreground">Films matched</div>
        </div>
        <div className="w-px h-10 bg-border" />
        <div className="text-center">
          <div className="font-bold text-xl text-foreground">98%</div>
          <div className="text-muted-foreground">Taste match</div>
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.6 }}
      >
        <Button
          onClick={onFinish}
          size="lg"
          className="h-14 px-10 text-lg font-medium rounded-full bg-foreground text-background hover:bg-foreground/90 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
        >
          Start Exploring
          <Sparkles className="ml-2 w-5 h-5" />
        </Button>
      </motion.div>
    </motion.div>
  );
}

// Main Onboarding Component
export default function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [creatorType, setCreatorType] = useState<CreatorType | null>(null);
  const [selectedTastes, setSelectedTastes] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [services, setServices] = useState<ContentService[]>(CONTENT_SERVICES);

  const steps = ['welcome', 'creator-type', 'tastes', 'genres', 'connect', 'complete'];
  const progress = ((currentStep) / (steps.length - 1)) * 100;

  const handleTasteSelect = (id: string) => {
    setSelectedTastes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleGenreSelect = (id: string) => {
    setSelectedGenres((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const handleServiceConnect = (id: string) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, connected: !s.connected } : s))
    );
  };

  const handleSkip = () => {
    localStorage.setItem('eartone_onboarding_complete', 'true');
    navigate('/home');
  };

  const handleFinish = () => {
    // Save creator type separately for easy access
    if (creatorType) {
      localStorage.setItem('eartone_creator_type', creatorType);
    }
    
    const preferences = {
      creatorType,
      tastes: selectedTastes,
      genres: selectedGenres,
      connectedServices: services.filter((s) => s.connected).map((s) => s.id),
      completedAt: new Date().toISOString(),
    };
    localStorage.setItem('eartone_preferences', JSON.stringify(preferences));
    localStorage.setItem('eartone_onboarding_complete', 'true');
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Progress Bar */}
      {currentStep > 0 && currentStep < steps.length - 1 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-0 left-0 right-0 z-50 px-6 pt-6 safe-top"
        >
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <button 
                onClick={() => setCurrentStep(0)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                Getting to know you
              </span>
              <div className="w-5" />
            </div>
            <Progress value={progress} className="h-1" />
          </div>
        </motion.div>
      )}

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {currentStep === 0 && (
          <WelcomeStep onNext={() => setCurrentStep(1)} onSkip={handleSkip} />
        )}
        {currentStep === 1 && (
          <CreatorTypeStep
            selected={creatorType}
            onSelect={setCreatorType}
            onNext={() => setCurrentStep(2)}
            onBack={() => setCurrentStep(0)}
          />
        )}
        {currentStep === 2 && (
          <CreativeTastesStep
            selected={selectedTastes}
            onSelect={handleTasteSelect}
            onNext={() => setCurrentStep(3)}
            onBack={() => setCurrentStep(1)}
          />
        )}
        {currentStep === 3 && (
          <GenreSelectionStep
            selected={selectedGenres}
            onSelect={handleGenreSelect}
            onNext={() => setCurrentStep(4)}
            onBack={() => setCurrentStep(2)}
          />
        )}
        {currentStep === 4 && (
          <ConnectServicesStep
            services={services}
            onConnect={handleServiceConnect}
            onNext={() => setCurrentStep(5)}
            onBack={() => setCurrentStep(3)}
          />
        )}
        {currentStep === 5 && (
          <CompletionStep onFinish={handleFinish} />
        )}
      </AnimatePresence>

      {/* Decorative background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/3 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
