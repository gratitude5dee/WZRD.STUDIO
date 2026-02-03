import { useState } from 'react';
import { ChevronLeft, Plus, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/providers/AuthProvider';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { ShineBorder } from '@/components/ui/shine-border';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface WorkspaceSwitcherProps {
  isCollapsed?: boolean;
}

export const WorkspaceSwitcher = ({ isCollapsed = false }: WorkspaceSwitcherProps) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  
  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const userName = user?.email?.split('@')[0] || 'User';

  const textVariants = {
    visible: { opacity: 1, x: 0, display: "flex" },
    hidden: { opacity: 0, x: -10, transitionEnd: { display: "none" } }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <motion.button 
          className={cn(
            "w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.04] transition-colors group",
            isCollapsed && "justify-center"
          )}
          whileTap={{ scale: 0.98 }}
        >
          {/* Avatar with ShineBorder on hover */}
          <div className="relative">
            <Avatar className="w-8 h-8 ring-2 ring-transparent group-hover:ring-accent-purple/20 transition-all duration-300">
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-purple-700 text-white text-xs">
                {user?.email ? getInitials(user.email) : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full overflow-hidden pointer-events-none">
              <ShineBorder
                shineColor={["#8B5CF6", "#A855F7"]}
                borderWidth={2}
                duration={3}
              />
            </div>
          </div>
          
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div 
                variants={textVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{ duration: 0.15 }}
                className="flex-1 flex items-center justify-between min-w-0"
              >
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {userName}
                  </p>
                  <p className="text-xs text-muted-foreground">Personal</p>
                </div>
                
                <motion.div
                  animate={{ rotate: isOpen ? -90 : 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  <ChevronLeft className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={isCollapsed ? "center" : "start"}
        side={isCollapsed ? "right" : "bottom"}
        sideOffset={8}
        className="w-64 p-2 backdrop-blur-xl bg-popover/95 border-border/50"
        asChild
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          <div className="px-2 py-1.5 mb-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Workspaces
            </p>
          </div>

          {/* Current workspace */}
          <DropdownMenuItem className="flex items-center gap-3 p-2 rounded-lg cursor-pointer" asChild>
            <motion.div whileHover={{ x: 4 }}>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-purple-700 text-white text-xs font-semibold">
                  {user?.email ? getInitials(user.email) : 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="flex-1 text-sm font-medium">Personal Workspace</span>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
              >
                <Check className="h-4 w-4 text-accent-purple" />
              </motion.div>
            </motion.div>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-2" />

          <DropdownMenuItem className="flex items-center gap-3 p-2 rounded-lg cursor-pointer text-muted-foreground hover:text-foreground">
            <motion.div className="flex items-center gap-3 w-full" whileHover={{ x: 4 }}>
              <div className="h-8 w-8 rounded-full border-2 border-dashed border-muted-foreground/50 flex items-center justify-center">
                <Plus className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium">Create Workspace</span>
            </motion.div>
          </DropdownMenuItem>
        </motion.div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
