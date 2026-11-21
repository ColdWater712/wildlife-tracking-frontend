import { api, unwrapData } from "@/services/api";
import type { ApiResponse, BlobResponse } from "@/types/api.type";
import type {
  AiPrediction,
  AiPredictionListParams,
  AiPredictionUploadResult,
  AiPredictionVerifyPayload,
  AiSummaryReport,
  AiSummaryReportParams,
} from "@/types/ai.type";

export const AI_SERVICE = {
  upload: async (
    file: File,
    reportId?: number | null,
  ): Promise<ApiResponse<AiPredictionUploadResult>> => {
    const formData = new FormData();
    formData.append("file", file);

    if (reportId !== undefined && reportId !== null && reportId > 0) {
      formData.append("report_id", String(reportId));
    }

    return api.post<ApiResponse<AiPredictionUploadResult>>("/ai/upload", {
      formData,
      timeoutMs: 120_000,
    });
  },

  getPredictions: async (
    params?: AiPredictionListParams,
  ): Promise<ApiResponse<AiPrediction[]>> =>
    api.get<ApiResponse<AiPrediction[]>>("/ai-predictions", {
      params,
      timeoutMs: 30_000,
    }),

  getPendingPredictions: async (): Promise<ApiResponse<AiPrediction[]>> =>
    api.get<ApiResponse<AiPrediction[]>>("/ai-predictions/pending-verification", {
      timeoutMs: 30_000,
    }),

  getPredictionById: async (
    id: number,
  ): Promise<ApiResponse<AiPrediction | null>> =>
    api.get<ApiResponse<AiPrediction | null>>(`/ai-predictions/${id}`, {
      timeoutMs: 30_000,
    }),

  verifyPrediction: async (
    id: number,
    payload: AiPredictionVerifyPayload,
  ): Promise<ApiResponse<AiPrediction>> =>
    api.post<ApiResponse<AiPrediction>>(`/ai-predictions/${id}/verify`, {
      body: payload,
      timeoutMs: 30_000,
    }),

  getMediaFile: async (mediaId: number): Promise<BlobResponse> =>
    api.getBlob(`/media-uploads/${mediaId}/file`, { timeoutMs: 30_000 }),

  getSummaryReport: async (
    params: AiSummaryReportParams,
  ): Promise<ApiResponse<AiSummaryReport>> => {
    const response = await api.get<ApiResponse<AiSummaryReport>>(
      "/ai/summary-report",
      { params, timeoutMs: 120_000 },
    );

    const data = unwrapData(response);

    return {
      success: response.success,
      message: response.message,
      data: {
        ...data,
        success:
          typeof data.success === "boolean" ? data.success : response.success,
      },
      errors: response.errors,
    };
  },
} as const;
