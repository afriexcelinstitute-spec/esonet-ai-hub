REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;

CREATE POLICY "Anyone can view course images" ON storage.objects FOR SELECT USING (bucket_id = 'course-images');
CREATE POLICY "Admins upload course images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'course-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update course images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'course-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete course images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'course-images' AND public.has_role(auth.uid(), 'admin'));