import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2, Mail, CheckCircle, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface NewsletterFormProps {
  className?: string;
  variant?: 'default' | 'minimal' | 'hero';
  showDescription?: boolean;
}

export const NewsletterForm: React.FC<NewsletterFormProps> = ({
  className,
  variant = 'default',
  showDescription = true,
}) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!email || !email.includes('@')) {
        toast.error('Please enter a valid email address');
        return;
      }

      setIsLoading(true);
      try {
        // Subscribe via edge function (recommended approach)
        const { data, error } = await supabase.functions.invoke('newsletter-subscribe', {
          body: { email, source: 'landing_page' },
        });

        if (error) {
          // Edge function failed - show user-friendly error
          throw new Error('Subscription service temporarily unavailable');
        }

        if (data?.already_subscribed) {
          toast.info("You're already subscribed!");
          setIsSubscribed(true);
          return;
        }

        setIsSubscribed(true);
        toast.success('Thanks for subscribing! Check your inbox for updates.');
      } catch (error) {
        console.error('Subscription error:', error);
        toast.error('Failed to subscribe. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [email]
  );

  if (isSubscribed) {
    return (
      <div
        className={cn(
          'flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20',
          className
        )}
      >
        <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
        <div>
          <p className="text-green-300 font-medium">You're subscribed!</p>
          <p className="text-green-400/70 text-sm">We'll keep you updated on the latest features.</p>
        </div>
      </div>
    );
  }

  if (variant === 'hero') {
    return (
      <div className={cn('w-full max-w-md', className)}>
        {showDescription && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Stay Updated
            </h3>
            <p className="text-zinc-400 text-sm">
              Get early access to new features and AI model updates.
            </p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="pl-10 bg-zinc-900/50 border-zinc-800 focus:border-purple-500/50"
              disabled={isLoading}
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Subscribe'}
          </Button>
        </form>
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <form onSubmit={handleSubmit} className={cn('flex gap-2', className)}>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="bg-zinc-900/50 border-zinc-800"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading} size="sm" variant="secondary">
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
        </Button>
      </form>
    );
  }

  // Default variant
  return (
    <div
      className={cn(
        'p-6 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800',
        className
      )}
    >
      {showDescription && (
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-white mb-2">Subscribe to our newsletter</h3>
          <p className="text-zinc-400 text-sm">
            Stay up to date with the latest features, AI model updates, and creative inspiration.
          </p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="pl-11 h-12 bg-zinc-900/50 border-zinc-700 focus:border-purple-500/50"
            disabled={isLoading}
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Subscribing...
            </>
          ) : (
            'Subscribe'
          )}
        </Button>
      </form>
      <p className="text-xs text-zinc-500 mt-3 text-center">
        We respect your privacy. Unsubscribe at any time.
      </p>
    </div>
  );
};

NewsletterForm.displayName = 'NewsletterForm';
