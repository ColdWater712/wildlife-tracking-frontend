import type { ReactNode } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

type ConfirmationDialogProps = {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  isPending?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmationDialog({
  open,
  title,
  description,
  confirmLabel = "Ya, Hapus",
  cancelLabel = "Batal",
  isPending = false,
  error,
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      role="alertdialog"
      size="sm"
    >
      <div className="mb-5 flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-danger-soft text-danger">
          <Trash2 aria-hidden="true" className="size-5" />
        </span>
        <div className="text-sm leading-6 text-ink-soft">{description}</div>
      </div>

      {error !== undefined && error !== null && error !== "" ? (
        <p role="alert" className="ui-alert mb-4">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap justify-end gap-2 border-t border-line pt-4">
        <Button variant="outline" onClick={onCancel} disabled={isPending}>
          {cancelLabel}
        </Button>
        <Button variant="danger" onClick={onConfirm} loading={isPending} icon={<Trash2 className="size-4" />}>
          {isPending ? "Menghapus..." : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
