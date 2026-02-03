-- Fix search_path for auto-generated cron procedures

CREATE OR REPLACE PROCEDURE public.crawl_all_092a1165()
LANGUAGE plpgsql
SET search_path = public
AS $procedure$
BEGIN
  PERFORM net.http_post(
    url:='https://ixkkrousepsiorwlaycp.supabase.co/functions/v1/crawl-all',
    headers:=jsonb_build_object('Content-Type', 'application/json'),
    body:='{"edge_function_name":"crawl-all"}',
    timeout_milliseconds:=10000
  );
  COMMIT;
END;
$procedure$;

CREATE OR REPLACE PROCEDURE public.firecrawl_cron_573ef38e()
LANGUAGE plpgsql
SET search_path = public
AS $procedure$
BEGIN
  PERFORM net.http_post(
    url:='https://ixkkrousepsiorwlaycp.supabase.co/functions/v1/firecrawl-cron',
    headers:=jsonb_build_object('Content-Type', 'application/json'),
    body:='{"edge_function_name":"firecrawl-cron"}',
    timeout_milliseconds:=10000
  );
  COMMIT;
END;
$procedure$;

CREATE OR REPLACE PROCEDURE public.scheduled_crawl_39f1ca64()
LANGUAGE plpgsql
SET search_path = public
AS $procedure$
BEGIN
  PERFORM net.http_post(
    url:='https://ixkkrousepsiorwlaycp.supabase.co/functions/v1/scheduled-crawl',
    headers:=jsonb_build_object('Content-Type', 'application/json'),
    body:='{"edge_function_name":"scheduled-crawl"}',
    timeout_milliseconds:=10000
  );
  COMMIT;
END;
$procedure$;

CREATE OR REPLACE PROCEDURE public.scheduled_crawl_all_72259c95()
LANGUAGE plpgsql
SET search_path = public
AS $procedure$
BEGIN
  PERFORM net.http_post(
    url:='https://ixkkrousepsiorwlaycp.supabase.co/functions/v1/scheduled-crawl-all',
    headers:=jsonb_build_object('Content-Type', 'application/json'),
    body:='{"edge_function_name":"scheduled-crawl-all"}',
    timeout_milliseconds:=10000
  );
  COMMIT;
END;
$procedure$;