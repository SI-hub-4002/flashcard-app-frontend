import { Button } from "@/components/ui/Button";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
}

export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  message,
}: ConfirmationModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-md w-96">
        <h3 className="text-xl font-semibold mb-4">削除の確認</h3>
        <p className="mb-4">{message}</p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            削除
          </Button>
        </div>
      </div>
    </div>
  );
};
