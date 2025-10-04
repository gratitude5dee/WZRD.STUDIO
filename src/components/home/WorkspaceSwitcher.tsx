import { ChevronDown } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export const WorkspaceSwitcher = () => {
  const { user } = useAuth();
  
  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.04] transition-colors group">
      <Avatar className="w-8 h-8">
        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-purple-700 text-white text-xs">
          {user?.email ? getInitials(user.email) : 'U'}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 text-left min-w-0">
        <p className="text-sm font-medium text-white truncate">
          {user?.email?.split('@')[0] || 'User'}
        </p>
        <p className="text-xs text-white/40">Personal</p>
      </div>
      
      <ChevronDown className="w-4 h-4 text-white/40 group-hover:text-white/60 transition-colors" />
    </button>
  );
};
