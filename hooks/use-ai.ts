"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { AI_SERVICE } from "@/services/ai.service";
import type {
  AiPredictionListParams,
  AiPredictionVerifyPayload,
  AiSummaryReportParams,
} from "@/types/ai.type";

const AI_PREDICTIONS_KEY = ["ai-predictions"] as const;

export const useAiPredictions = (params?: AiPredictionListParams) =>
  useQuery({
    queryKey: [...AI_PREDICTIONS_KEY, params],
    queryFn: () => AI_SERVICE.getPredictions(params),
  });

export const useAiPendingPredictions = () =>
  useQuery({
    queryKey: [...AI_PREDICTIONS_KEY, "pending-verification"],
    queryFn: () => AI_SERVICE.getPendingPredictions(),
  });

export const useAiPrediction = (id: number) =>
  useQuery({
    queryKey: [...AI_PREDICTIONS_KEY, id],
    queryFn: () => AI_SERVICE.getPredictionById(id),
    enabled: Number.isFinite(id) && id > 0,
  });

export const useAiMediaFile = (mediaId: number) =>
  useQuery({
    queryKey: ["ai-media-files", mediaId],
    queryFn: () => AI_SERVICE.getMediaFile(mediaId),
    enabled: Number.isFinite(mediaId) && mediaId > 0,
  });

export const useAiPredictionUpload = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, reportId }: { file: File; reportId?: number | null }) =>
      AI_SERVICE.upload(file, reportId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: AI_PREDICTIONS_KEY }),
        queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] }),
      ]);
    },
  });
};

export const useAiPredictionVerification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: AiPredictionVerifyPayload }) =>
      AI_SERVICE.verifyPrediction(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: AI_PREDICTIONS_KEY });
    },
  });
};

export const useAiSummaryReport = () =>
  useMutation({
    mutationFn: (params: AiSummaryReportParams) =>
      AI_SERVICE.getSummaryReport(params),
  });
