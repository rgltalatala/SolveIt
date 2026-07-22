import { Modal } from '@/shared/components/Modal';
import { ui } from '@/content/onboarding/ui';

type ConfirmModalProps = {
  open: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

/** Two-action confirm/cancel dialog built on the shared Modal. */
export function ConfirmModal({
  open,
  title,
  body,
  confirmLabel = ui.confirm,
  cancelLabel = ui.cancel,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal
      open={open}
      title={title}
      body={body}
      onDismiss={onCancel}
      actions={[
        {
          label: cancelLabel,
          onClick: onCancel,
          variant: 'secondary',
          autoFocus: true,
        },
        {
          label: confirmLabel,
          onClick: onConfirm,
          variant: 'primary',
        },
      ]}
    />
  );
}
