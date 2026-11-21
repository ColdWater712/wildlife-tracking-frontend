"use client";

import { useState } from "react";
import { FileBarChart, Sparkles } from "lucide-react";

import { useToast } from "@/components/providers/toast-provider";
import { Button } from "@/components/ui/button";
import { FormAlert, FormField, FormGrid, FormSection, TextInput, fieldDescribedBy } from "@/components/ui/form";
import { PageHeader, Panel, SectionHeader } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAiSummaryReport } from "@/hooks/use-ai";
import { formatApiError, getApiFieldErrors, toApiErrorState } from "@/services/api";
import type { AiRecommendation, AiSpeciesBreakdownItem, AiSummaryReport } from "@/types/ai.type";
import { formatDisplayValue } from "@/utils/format";

const STATISTIC_LABELS: Record<string, string> = {
  total_animals: "Total Satwa",
  active_animals: "Satwa Aktif",
  total_species: "Total Spesies",
  total_readings: "Pembacaan GPS",
  total_incidents: "Laporan Insiden",
  critical_incidents: "Insiden Kritis",
  total_devices: "Total Perangkat",
  low_battery_devices: "Baterai Rendah",
  avg_temperature: "Suhu Rata-rata (°C)",
  avg_humidity: "Kelembapan Rata-rata (%)",
  total_rainfall: "Curah Hujan (mm)",
  total_predictions: "Prediksi AI",
  total_verified_predictions: "Prediksi Terverifikasi",
  average_confidence: "Rata-rata Kepercayaan",
  active_devices: "Perangkat Aktif",
};

const toDateInputValue = (date: Date): string => date.toISOString().slice(0, 10);

export function AiSummaryView() {
  const { showToast } = useToast();
  const summaryMutation = useAiSummaryReport();
  const [startDate, setStartDate] = useState(() => {
    const start = new Date();
    start.setDate(start.getDate() - 30);
    return toDateInputValue(start);
  });
  const [endDate, setEndDate] = useState(() => toDateInputValue(new Date()));
  const [report, setReport] = useState<AiSummaryReport | null>(null);
  const [startError, setStartError] = useState<string | undefined>(undefined);
  const [endError, setEndError] = useState<string | undefined>(undefined);

  const submit = () => {
    setStartError(undefined);
    setEndError(undefined);

    summaryMutation.mutate(
      { start_date: startDate, end_date: endDate },
      {
        onSuccess: (response) => {
          setReport(response.data);
          showToast("Laporan berhasil dibuat.", "success");
        },
        onError: (error) => {
          showToast(formatApiError(error, "Gagal membuat laporan AI."), "error");
          const fieldErrors = getApiFieldErrors(error);
          setStartError(fieldErrors.start_date);
          setEndError(fieldErrors.end_date);
        },
      },
    );
  };

  const errorState = summaryMutation.isError
    ? toApiErrorState(summaryMutation.error)
    : null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="AI Summary"
        title="Laporan Eksekutif Monitoring"
        description="Buat ringkasan kondisi monitoring dari data backend. Jika layanan AI tidak tersedia, backend menggunakan ringkasan template dan menandainya pada hasil."
      />

      <FormSection
        title="Periode Laporan"
        description="Rentang tanggal akan dikirim langsung ke endpoint ringkasan backend."
      >
        <FormGrid columns={2}>
          <FormField
            label="Dari Tanggal"
            htmlFor="ai-summary-start"
            error={startError}
          >
            <TextInput
              id="ai-summary-start"
              type="date"
              value={startDate}
              invalid={startError !== undefined}
              aria-describedby={fieldDescribedBy("ai-summary-start", false, startError !== undefined)}
              disabled={summaryMutation.isPending}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </FormField>

          <FormField
            label="Sampai Tanggal"
            htmlFor="ai-summary-end"
            error={endError}
          >
            <TextInput
              id="ai-summary-end"
              type="date"
              value={endDate}
              invalid={endError !== undefined}
              aria-describedby={fieldDescribedBy("ai-summary-end", false, endError !== undefined)}
              disabled={summaryMutation.isPending}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </FormField>
        </FormGrid>

        {errorState && !startError && !endError ? (
          <FormAlert
            message={formatApiError(summaryMutation.error, "Gagal membuat laporan AI.")}
          />
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <p className="text-xs text-muted">
            Laporan dibuat dari data live backend dan tidak disimpan sebagai riwayat.
          </p>
          <Button
            variant="primary"
            size="lg"
            loading={summaryMutation.isPending}
            disabled={summaryMutation.isPending || startDate === "" || endDate === ""}
            icon={<FileBarChart className="size-4" />}
            onClick={submit}
          >
            {summaryMutation.isPending ? "Menyusun laporan..." : "Hasilkan Laporan"}
          </Button>
        </div>
      </FormSection>

      {report ? <SummaryResult report={report} /> : null}
    </div>
  );
}

const SummaryResult = ({ report }: { report: AiSummaryReport }) => (
  <div className="flex flex-col gap-5">
    <Panel>
      <SectionHeader
        title="Ringkasan Eksekutif"
        description={`Periode ${report.period.start} sampai ${report.period.end}`}
        action={
          report.success ? (
            <StatusBadge
              label={report.used_ai ? "Dihasilkan AI" : "Template Backend"}
              variant={report.used_ai ? "info" : "neutral"}
            />
          ) : (
            <StatusBadge label="Respons Tidak Berhasil" variant="danger" />
          )
        }
      />
      <p className="whitespace-pre-line text-sm leading-7 text-ink-soft">
        {report.summary}
      </p>
      {!report.used_ai ? (
        <p className="mt-4 flex items-start gap-2 rounded-xl bg-accent-soft/60 p-3 text-xs text-accent">
          <Sparkles aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          Layanan AI tidak tersedia saat laporan dibuat. Ringkasan template tetap
          ditampilkan sesuai kontrak backend.
        </p>
      ) : null}
    </Panel>

    <Panel>
      <SectionHeader title="Statistik Kunci" />
      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(report.statistics).map(([key, value]) => (
          <div key={key} className="rounded-xl border border-line bg-surface px-4 py-3">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted">
              {STATISTIC_LABELS[key] ?? key}
            </dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums text-ink">
              {formatDisplayValue(value)}
            </dd>
          </div>
        ))}
      </dl>
    </Panel>

    <Panel>
      <SectionHeader title="Distribusi Spesies" />
      {report.species_breakdown.length === 0 ? (
        <p className="text-sm text-muted">Tidak ada data spesies pada periode ini.</p>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line">
          {report.species_breakdown.map((item, index) => (
            <SpeciesBreakdownRow key={`${item.species_id ?? item.common_name ?? "species"}-${index}`} item={item} />
          ))}
        </ul>
      )}
    </Panel>

    {report.incidents_by_type &&
    Object.keys(report.incidents_by_type).length > 0 ? (
      <Panel>
        <SectionHeader title="Insiden per Jenis" />
        <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line">
          {Object.entries(report.incidents_by_type).map(([type, count]) => (
            <li
              key={type}
              className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
            >
              <span className="font-medium capitalize text-ink-soft">{type}</span>
              <span className="font-semibold tabular-nums text-ink">{count}</span>
            </li>
          ))}
        </ul>
      </Panel>
    ) : null}

    {report.recommendations && report.recommendations.length > 0 ? (
      <Panel>
        <SectionHeader title="Rekomendasi Tindakan" />
        <ul className="flex flex-col gap-3">
          {report.recommendations.map((recommendation, index) => (
            <RecommendationRow
              key={`${recommendation.title}-${index}`}
              recommendation={recommendation}
            />
          ))}
        </ul>
      </Panel>
    ) : null}
  </div>
);

const SpeciesBreakdownRow = ({ item }: { item: AiSpeciesBreakdownItem }) => {
  const count = item.count ?? item.total ?? 0;
  const percentage = item.percentage;

  return (
    <li className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
      <div className="min-w-0">
        <p className="font-semibold text-ink">
          {item.name ??
            item.common_name ??
            `Spesies #${item.species_id ?? "-"}`}
        </p>
        <p className="text-xs text-muted">
          {item.scientific_name ?? "-"}
          {item.status ? ` · ${item.status}` : ""}
        </p>
      </div>
      <div className="flex items-center gap-3 text-xs text-muted">
        <span className="font-semibold tabular-nums text-ink-soft">
          {formatDisplayValue(count)}
        </span>
        {percentage !== undefined && percentage !== null ? (
          <span className="tabular-nums">{formatDisplayValue(percentage)}%</span>
        ) : null}
      </div>
    </li>
  );
};

const RecommendationRow = ({
  recommendation,
}: {
  recommendation: AiRecommendation;
}) => (
  <li className="flex flex-col gap-1 rounded-xl border border-line bg-surface px-4 py-3">
    <div className="flex flex-wrap items-center gap-2">
      <p className="text-sm font-semibold text-ink">{recommendation.title}</p>
      <StatusBadge label={recommendation.priority} variant="warning" />
    </div>
    <p className="text-sm leading-6 text-ink-soft">{recommendation.message}</p>
  </li>
);
