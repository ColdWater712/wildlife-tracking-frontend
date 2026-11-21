"use client";

import Image from "next/image";
import { useEffect, useMemo } from "react";
import { ImageOff, LoaderCircle } from "lucide-react";

import { useAiMediaFile } from "@/hooks/use-ai";
import { cn } from "@/lib/utils";

type AiPredictionImageProps = {
  mediaId: number;
  alt: string;
  className?: string;
  sizes?: string;
};

export function AiPredictionImage({
  mediaId,
  alt,
  className,
  sizes = "(max-width: 768px) 100vw, 33vw",
}: AiPredictionImageProps) {
  const mediaQuery = useAiMediaFile(mediaId);
  const objectUrl = useMemo(
    () =>
      mediaQuery.data?.blob
        ? URL.createObjectURL(mediaQuery.data.blob)
        : null,
    [mediaQuery.data],
  );

  useEffect(() => {
    if (!objectUrl) return;

    return () => URL.revokeObjectURL(objectUrl);
  }, [objectUrl]);

  return (
    <div
      className={cn(
        "relative flex min-h-32 items-center justify-center overflow-hidden rounded-xl border border-line bg-surface-muted",
        className,
      )}
    >
      {mediaQuery.isPending ? (
        <LoaderCircle
          aria-hidden="true"
          className="size-6 animate-spin text-primary"
        />
      ) : mediaQuery.isError || !objectUrl ? (
        <ImageOff aria-hidden="true" className="size-7 text-muted" />
      ) : (
        <Image
          src={objectUrl}
          alt={alt}
          fill
          unoptimized
          sizes={sizes}
          className="object-cover"
        />
      )}
    </div>
  );
}
