import { Grid, Users, Globe, Star, ChevronLeft, LogOut, Layers, Sparkles, Home, FolderKanban } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';
import CreditsDisplay from '../CreditsDisplay';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { TextAnimate } from '@/components/ui/text-animate';
import { ShineBorder } from '@/components/ui/shine-border';
import { useSidebar } from '@/contexts/SidebarContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export const Sidebar = ({ activeView, onViewChange }: SidebarProps) => {
  const [favoritesOpen, setFavoritesOpen] = useState(true);
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Failed to log out');
    } else {
      toast.success('Logged out successfully');
      navigate('/');
    }
  };

  const mainNavItems = [
    { id: 'all', label: 'All Projects', icon: FolderKanban },
    { id: 'kanvas', label: 'Kanvas', icon: Layers, isRoute: true, showBadge: true },
  ];

  const secondaryNavItems = [
    { id: 'shared', label: 'Shared with me', icon: Users },
    { id: 'community', label: 'Community', icon: Globe },
  ];

  const sidebarVariants = {
    expanded: { width: 256 },
    collapsed: { width: 64 }
  };

  const textVariants = {
    visible: { opacity: 1, x: 0, display: "block" },
    hidden: { opacity: 0, x: -10, transitionEnd: { display: "none" } }
  };

  const NavItem = ({ item, index }: { item: typeof mainNavItems[0]; index: number }) => {
    const Icon = item.icon;
    const isActive = activeView === item.id;

    const content = (
      <motion.button
        key={item.id}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ x: isCollapsed ? 0 : 2 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          if (item.isRoute) {
            navigate('/kanvas');
          } else {
            onViewChange(item.id);
          }
        }}
        className={cn(
          "relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
          isCollapsed && "justify-center px-2",
          isActive
            ? "bg-[hsl(var(--interactive-selected))] text-accent-purple border border-accent-purple/20 shadow-sm"
            : "text-text-secondary hover:text-text-primary hover:bg-[hsl(var(--interactive-hover))] dark:text-muted-foreground dark:hover:text-foreground dark:hover:bg-white/[0.04]"
        )}
      >
        {isActive && (
          <ShineBorder
            shineColor="#8B5CF6"
            borderWidth={1}
            duration={10}
          />
        )}
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 flex-shrink-0",
          isActive 
            ? "bg-accent-purple/15 shadow-sm" 
            : "bg-surface-2 dark:bg-white/[0.04]"
        )}>
          <Icon className={cn("w-4 h-4", isActive && "text-accent-purple")} />
        </div>
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.span 
              variants={textVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={{ duration: 0.15 }}
              className="flex-1 text-left whitespace-nowrap"
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>
        {item.showBadge && !isCollapsed && (
          <Badge variant="secondary" className="text-[9px] bg-accent-purple/15 text-accent-purple border-accent-purple/20 px-1.5 py-0.5 font-semibold">
            New
          </Badge>
        )}
      </motion.button>
    );

    if (isCollapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            <span className="flex items-center gap-2">
              {item.label}
              {item.showBadge && (
                <Badge variant="secondary" className="text-[9px] bg-accent-purple/15 text-accent-purple border-accent-purple/20 px-1.5 py-0.5">
                  New
                </Badge>
              )}
            </span>
          </TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  const SecondaryNavItem = ({ item }: { item: typeof secondaryNavItems[0] }) => {
    const Icon = item.icon;
    const isActive = activeView === item.id;

    const content = (
      <button
        onClick={() => onViewChange(item.id)}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
          isCollapsed && "justify-center px-2",
          isActive
            ? "bg-[hsl(var(--interactive-selected))] text-accent-purple border border-accent-purple/20"
            : "text-text-secondary hover:text-text-primary hover:bg-[hsl(var(--interactive-hover))] dark:text-muted-foreground dark:hover:text-foreground dark:hover:bg-white/[0.04]"
        )}
      >
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
          isActive ? "bg-accent-purple/15" : "bg-surface-2 dark:bg-white/[0.04]"
        )}>
          <Icon className={cn("w-4 h-4", isActive && "text-accent-purple")} />
        </div>
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.span 
              variants={textVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={{ duration: 0.15 }}
              className="whitespace-nowrap"
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    );

    if (isCollapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="font-medium">{item.label}</TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  return (
    <TooltipProvider>
      <motion.aside
        variants={sidebarVariants}
        animate={isCollapsed ? "collapsed" : "expanded"}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "h-screen flex flex-col fixed left-0 top-0 z-50 border-r group/sidebar",
          "bg-surface-1 border-border-default",
          "dark:glass-sidebar dark:border-white/[0.04]"
        )}
      >
        {/* Shine border on hover */}
        <div className="absolute inset-0 opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-500 pointer-events-none rounded-r-xl overflow-hidden">
          <ShineBorder
            shineColor={["hsl(var(--accent-purple))", "hsl(var(--amber))"]}
            borderWidth={1}
            duration={8}
          />
        </div>

        {/* Collapse Toggle Button */}
        <motion.button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 z-50 h-6 w-6 rounded-full bg-surface-1 dark:bg-zinc-800 border border-border-default dark:border-zinc-700 shadow-md flex items-center justify-center hover:bg-surface-2 dark:hover:bg-zinc-700 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <motion.div
            animate={{ rotate: isCollapsed ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <ChevronLeft className="h-3.5 w-3.5 text-muted-foreground" />
          </motion.div>
        </motion.button>

        {/* Subtle gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-amber-400/5 pointer-events-none dark:from-[rgba(139,92,246,0.04)] dark:to-[rgba(245,158,11,0.02)]" />
        
        {/* Top highlight line */}
        <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
        
        {/* Workspace Switcher */}
        <div className={cn("relative z-10 border-b border-border-default dark:border-white/[0.05]", isCollapsed ? "p-2" : "p-4")}>
          <WorkspaceSwitcher isCollapsed={isCollapsed} />
        </div>

        {/* Main Navigation */}
        <nav data-tour="sidebar-nav" className={cn("relative z-10 flex-1 space-y-6 overflow-y-auto", isCollapsed ? "p-2" : "p-4")}>
          {/* Main Menu Section */}
          <div>
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.div 
                  variants={textVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="flex items-center gap-2 px-3 mb-3"
                >
                  <Sparkles className="w-3.5 h-3.5 text-accent-purple" />
                  <TextAnimate animation="fadeIn" by="character" delay={0.1} className="text-[10px] font-semibold text-text-tertiary uppercase tracking-[0.15em]">
                    Main Menu
                  </TextAnimate>
                </motion.div>
              )}
            </AnimatePresence>
            {isCollapsed && (
              <div className="flex justify-center mb-3">
                <Sparkles className="w-3.5 h-3.5 text-accent-purple" />
              </div>
            )}
            <div className="space-y-1">
              {mainNavItems.map((item, index) => (
                <NavItem key={item.id} item={item} index={index} />
              ))}
            </div>
          </div>

          {/* Secondary Navigation */}
          <div>
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.div 
                  variants={textVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="flex items-center gap-2 px-3 mb-3"
                >
                  <Users className="w-3.5 h-3.5 text-text-tertiary" />
                  <TextAnimate animation="fadeIn" by="character" delay={0.2} className="text-[10px] font-semibold text-text-tertiary uppercase tracking-[0.15em]">
                    Collaborate
                  </TextAnimate>
                </motion.div>
              )}
            </AnimatePresence>
            {isCollapsed && (
              <div className="flex justify-center mb-3">
                <Users className="w-3.5 h-3.5 text-text-tertiary" />
              </div>
            )}
            <div className="space-y-1">
              {secondaryNavItems.map((item) => (
                <SecondaryNavItem key={item.id} item={item} />
              ))}
            </div>
          </div>

          {/* Favorites Section */}
          <div>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setFavoritesOpen(!favoritesOpen)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors dark:text-muted-foreground dark:hover:text-foreground",
                    isCollapsed && "justify-center px-2"
                  )}
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center dark:bg-amber/10 flex-shrink-0">
                    <Star className="w-4 h-4 text-amber-500" />
                  </div>
                  <AnimatePresence mode="wait">
                    {!isCollapsed && (
                      <>
                        <motion.span 
                          variants={textVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          className="flex-1 text-left font-medium whitespace-nowrap"
                        >
                          Favorites
                        </motion.span>
                        <motion.div
                          animate={{ rotate: favoritesOpen ? 0 : -90 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronLeft className={cn(
                            "w-4 h-4 transition-transform duration-200",
                            favoritesOpen ? "-rotate-90" : "rotate-0"
                          )} />
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </button>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right" className="font-medium">Favorites</TooltipContent>
              )}
            </Tooltip>
            
            <AnimatePresence>
              {favoritesOpen && !isCollapsed && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-2 ml-6 pl-3 border-l border-border-default space-y-1 dark:border-white/[0.06] overflow-hidden"
                >
                  <p className="text-xs text-text-tertiary py-2 italic dark:text-muted-foreground/50">No favorites yet</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        {/* Bottom Section */}
        <div className={cn("relative z-10 border-t border-border-default space-y-4 dark:border-white/[0.05]", isCollapsed ? "p-2" : "p-4")}>
          {/* Credits Display */}
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="p-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-amber-200/30 border border-purple-500/15 backdrop-blur-sm dark:from-[rgba(139,92,246,0.1)] dark:to-[rgba(245,158,11,0.05)] dark:border-[rgba(139,92,246,0.2)]"
              >
                <CreditsDisplay showTooltip={false} />
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Action Buttons */}
          <div className={cn(
            "flex items-center",
            isCollapsed ? "flex-col gap-2" : "justify-center"
          )}>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button 
                  onClick={handleLogout}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all duration-200",
                    "text-text-secondary hover:text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/20",
                    "border border-transparent",
                    "dark:text-muted-foreground dark:hover:text-rose-400",
                    isCollapsed && "p-2"
                  )}
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                  <AnimatePresence mode="wait">
                    {!isCollapsed && (
                      <motion.span
                        variants={textVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="whitespace-nowrap"
                      >
                        Logout
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right">Logout</TooltipContent>
              )}
            </Tooltip>
          </div>
        </div>
      </motion.aside>
    </TooltipProvider>
  );
};
