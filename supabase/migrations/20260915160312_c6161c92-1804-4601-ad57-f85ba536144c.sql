REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM anon;
CREATE POLICY "No client access to payment secrets" ON public.payment_secrets FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);