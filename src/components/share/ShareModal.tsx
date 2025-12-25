import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Link2, Mail, Users, Globe, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/providers/AuthProvider';

interface ShareModalProps {
  projectId: string;
  projectName: string;
  isOpen: boolean;
  onClose: () => void;
}

interface SharedUserProfile {
  email?: string | null;
  display_name?: string | null;
  avatar_url?: string | null;
}

interface ProjectShare {
  id: string;
  is_public: boolean;
  permission_level: 'view' | 'comment' | 'edit';
  share_token: string | null;
  shared_with_user?: SharedUserProfile | null;
}

export const ShareModal = ({ projectId, projectName, isOpen, onClose }: ShareModalProps) => {
  const { user } = useAuth();
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [permission, setPermission] = useState<'view' | 'comment' | 'edit'>('view');
  const [isPublic, setIsPublic] = useState(false);
  const [email, setEmail] = useState('');
  const [existingShares, setExistingShares] = useState<ProjectShare[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const channelName = useMemo(() => `project:${projectId}`, [projectId]);

  useEffect(() => {
    if (!isOpen || !projectId) return;

    const channel = supabase
      .channel(channelName)
      .on('broadcast', { event: 'share_created' }, ({ payload }) => {
        setExistingShares((prev) => [...prev, payload.share as ProjectShare]);
      })
      .on('broadcast', { event: 'share_revoked' }, ({ payload }) => {
        setExistingShares((prev) => prev.filter((share) => share.id !== payload.shareId));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelName, isOpen, projectId]);

  useEffect(() => {
    if (!isOpen || !projectId) return;

    const fetchShares = async () => {
      const { data } = await supabase
        .from('project_shares')
        .select(
          `
          id,
          is_public,
          permission_level,
          share_token,
          shared_with_user:users!project_shares_shared_with_fkey(
            email,
            display_name,
            avatar_url
          )
        `
        )
        .eq('project_id', projectId);

      setExistingShares((data as ProjectShare[]) || []);
    };

    fetchShares();
  }, [isOpen, projectId]);

  useEffect(() => {
    if (!isOpen) {
      setShareLink(null);
      setEmail('');
      setCopied(false);
    }
  }, [isOpen]);

  const createShare = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await supabase.functions.invoke('create-share', {
        body: {
          projectId,
          permissionLevel: permission,
          isPublic,
          sharedWithEmail: email || undefined,
          expiresInDays: 30,
        },
      });

      if (response.error) {
        throw response.error;
      }

      if (response.data?.shareUrl) {
        setShareLink(response.data.shareUrl);
      }
    } catch (error) {
      console.error('Failed to create share:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (shareLink) {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const revokeShare = async (shareId: string) => {
    await supabase.from('project_shares').delete().eq('id', shareId);

    await supabase.channel(channelName).send({
      type: 'broadcast',
      event: 'share_revoked',
      payload: { shareId },
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="mb-1 text-xl font-semibold text-white">Share &quot;{projectName}&quot;</h2>
            <p className="mb-6 text-sm text-zinc-400">Invite collaborators or create a public link</p>

            <div className="mb-4 flex gap-2">
              {(['view', 'comment', 'edit'] as const).map((value) => (
                <button
                  key={value}
                  onClick={() => setPermission(value)}
                  className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    permission === value
                      ? 'bg-violet-600 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  {value.charAt(0).toUpperCase() + value.slice(1)}
                </button>
              ))}
            </div>

            <label className="mb-4 flex cursor-pointer items-center gap-3">
              <div
                className={`relative h-6 w-10 rounded-full transition-colors ${
                  isPublic ? 'bg-violet-600' : 'bg-zinc-700'
                }`}
              >
                <motion.div
                  className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white"
                  animate={{ x: isPublic ? 16 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </div>
              <span className="flex items-center gap-2 text-sm text-zinc-300">
                {isPublic ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                {isPublic ? 'Anyone with link' : 'Only invited people'}
              </span>
            </label>

            {!isPublic && (
              <div className="relative mb-4">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter email to invite"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 py-2.5 pl-10 pr-4 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            )}

            <button
              onClick={createShare}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 py-2.5 font-medium text-white transition-colors hover:bg-violet-500 disabled:opacity-50"
            >
              {loading ? (
                <motion.div
                  className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
              ) : (
                <>
                  <Link2 className="h-4 w-4" />
                  Generate Share Link
                </>
              )}
            </button>

            {shareLink && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 rounded-lg border border-zinc-700 bg-zinc-800/50 p-3"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    className="flex-1 truncate bg-transparent text-sm text-zinc-300 outline-none"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="rounded-md p-2 transition-colors hover:bg-zinc-700"
                  >
                    <Copy className={`h-4 w-4 ${copied ? 'text-green-400' : 'text-zinc-400'}`} />
                  </button>
                </div>
                {copied && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-1 text-xs text-green-400">
                    Copied to clipboard!
                  </motion.p>
                )}
              </motion.div>
            )}

            {existingShares.length > 0 && (
              <div className="mt-6">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-zinc-400">
                  <Users className="h-4 w-4" />
                  People with access
                </h3>
                <div className="max-h-40 space-y-2 overflow-y-auto">
                  {existingShares.map((share) => (
                    <div
                      key={share.id}
                      className="flex items-center justify-between rounded-lg bg-zinc-800/50 p-2"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-700">
                          {share.is_public ? (
                            <Globe className="h-4 w-4 text-zinc-400" />
                          ) : (
                            <span className="text-xs text-zinc-300">
                              {share.shared_with_user?.email?.[0]?.toUpperCase() || '?'}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-white">
                            {share.is_public
                              ? 'Public link'
                              : share.shared_with_user?.email || 'Pending invite'}
                          </p>
                          <p className="text-xs capitalize text-zinc-500">{share.permission_level}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => revokeShare(share.id)}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Revoke
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShareModal;
