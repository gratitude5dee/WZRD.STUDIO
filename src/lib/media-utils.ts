const SUPABASE_URL = "https://mttpdwowikfzcdpehlrd.supabase.co/storage/v1/object/public";

export function getCoverUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  if (path.startsWith('demo/')) return null;
  return `${SUPABASE_URL}/covers/${path}`;
}

export function getThumbnailUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  if (path.startsWith('/')) return path; // Public folder paths
  if (path.startsWith('demo/')) return null;
  return `${SUPABASE_URL}/covers/${path}`;
}
