import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

/**
 * Course covers live in a private storage bucket, so we resolve a signed URL
 * for display. Falls back to a branded gradient when a course has no image.
 */
export function CourseImage({
  path,
  title,
  className,
}: {
  path: string | null | undefined;
  title: string;
  className?: string;
}) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!path) {
      setUrl(null);
      return;
    }
    if (path.startsWith("http")) {
      setUrl(path);
      return;
    }
    supabase.storage
      .from("course-images")
      .createSignedUrl(path, 60 * 60 * 24 * 7)
      .then(({ data }) => {
        if (active) setUrl(data?.signedUrl ?? null);
      });
    return () => {
      active = false;
    };
  }, [path]);

  if (!url) {
    return (
      <div
        className={cn(
          "flex items-center justify-center overflow-hidden bg-grid bg-secondary/60",
          className,
        )}
      >
        <div className="flex size-14 items-center justify-center rounded-full gradient-brand shadow-glow">
          <Sparkles className="size-6 text-primary-foreground" />
        </div>
      </div>
    );
  }

  return <img src={url} alt={`${title} cover`} loading="lazy" className={cn("object-cover", className)} />;
}
