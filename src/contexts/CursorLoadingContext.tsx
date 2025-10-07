import { createContext, useContext, useState, ReactNode } from 'react';

interface CursorLoadingContextType {
  isLoading: boolean;
  setGlobalCursorLoading: (loading: boolean) => void;
}

const CursorLoadingContext = createContext<CursorLoadingContextType | undefined>(undefined);

export const CursorLoadingProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <CursorLoadingContext.Provider value={{ 
      isLoading,
      setGlobalCursorLoading: setIsLoading 
    }}>
      {children}
    </CursorLoadingContext.Provider>
  );
};

export const useCursorLoading = () => {
  const context = useContext(CursorLoadingContext);
  if (context === undefined) {
    throw new Error('useCursorLoading must be used within CursorLoadingProvider');
  }
  return context;
};
