
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useApiKeys } from '@/hooks/useApiKeys';
import { useAuth } from '@/providers/AuthProvider';
import { CircleDashed, CheckCircle2, AlertTriangle } from 'lucide-react';

export const ApiKeysForm = () => {
  const { apiKeys, isLoading } = useApiKeys();
  const { user } = useAuth();

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>You must be logged in to use API features</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Keys</CardTitle>
        <CardDescription>
          API keys are managed by the application. You don't need to provide your own keys.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-md">
            <div>
              <h3 className="font-medium">Luma API</h3>
              <p className="text-sm text-muted-foreground">Used for video generation</p>
            </div>
            <div>
              {isLoading ? (
                <CircleDashed className="h-5 w-5 text-slate-400 animate-spin" />
              ) : apiKeys?.lumaApiKey ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              )}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-md">
            <div>
              <h3 className="font-medium">Claude API</h3>
              <p className="text-sm text-muted-foreground">Used for text generation</p>
            </div>
            <div>
              {isLoading ? (
                <CircleDashed className="h-5 w-5 text-slate-400 animate-spin" />
              ) : apiKeys?.claudeApiKey ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiKeysForm;
