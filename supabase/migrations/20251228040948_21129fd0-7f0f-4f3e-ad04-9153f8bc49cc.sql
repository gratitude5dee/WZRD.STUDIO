-- Fix search_path for functions that are missing it (SECURITY: Prevent search_path injection attacks)

-- cleanup_expired_idempotency
CREATE OR REPLACE FUNCTION public.cleanup_expired_idempotency()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.idempotency_keys WHERE expires_at < NOW();
END;
$$;

-- cleanup_mrkt_decision_logs  
CREATE OR REPLACE FUNCTION public.cleanup_mrkt_decision_logs()
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    DELETE FROM mrkt_decision_logs WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$;

-- get_mrkt_principal_id
CREATE OR REPLACE FUNCTION public.get_mrkt_principal_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN (
        SELECT id FROM mrkt_principals 
        WHERE external_id = auth.uid()::TEXT
        LIMIT 1
    );
END;
$$;

-- get_mrkt_tenant_id
CREATE OR REPLACE FUNCTION public.get_mrkt_tenant_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN (
        SELECT tenant_id FROM mrkt_principals 
        WHERE external_id = auth.uid()::TEXT
        LIMIT 1
    );
END;
$$;

-- log_order_status_change
CREATE OR REPLACE FUNCTION public.log_order_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO public.order_status_history (order_id, status, notes)
    VALUES (NEW.id, NEW.status, 'Status changed from ' || OLD.status || ' to ' || NEW.status);
  END IF;
  RETURN NEW;
END;
$$;

-- mrkt_has_any_role
CREATE OR REPLACE FUNCTION public.mrkt_has_any_role(required_roles principal_role[])
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM mrkt_principals 
        WHERE external_id = auth.uid()::TEXT
        AND roles && required_roles
    );
END;
$$;

-- mrkt_has_role
CREATE OR REPLACE FUNCTION public.mrkt_has_role(required_role principal_role)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM mrkt_principals 
        WHERE external_id = auth.uid()::TEXT
        AND required_role = ANY(roles)
    );
END;
$$;

-- update_daily_spend
CREATE OR REPLACE FUNCTION public.update_daily_spend()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status != 'failed' THEN
    INSERT INTO public.daily_spend_tracking (user_id, date, total_spent_usd, transaction_count)
    VALUES (NEW.from_user_id, CURRENT_DATE, 0, 1)
    ON CONFLICT (user_id, date) DO UPDATE SET
      transaction_count = daily_spend_tracking.transaction_count + 1,
      updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$;

-- update_research_session_timestamp
CREATE OR REPLACE FUNCTION public.update_research_session_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- update_transactions_updated_at
CREATE OR REPLACE FUNCTION public.update_transactions_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;