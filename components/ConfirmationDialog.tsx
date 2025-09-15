import React from 'react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}) => {
  if (!isOpen) {
    return null;
  }

  // Prevent background scroll when modal is open
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      aria-labelledby="confirmation-dialog-title"
      role="dialog"
      aria-modal="true"
      onClick={onCancel} // Close on backdrop click
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md m-4 transform animate-fade-in-up"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the dialog
      >
        <h2 id="confirmation-dialog-title" className="text-xl font-bold text-[#0B2545] dark:text-gray-100 mb-4">
          {title}
        </h2>
        <p className="text-[#4A4A4A] dark:text-gray-300 mb-6 whitespace-pre-wrap">
          {message}
        </p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            type="button"
            className="bg-gray-200 dark:bg-gray-700 text-[#0B2545] dark:text-gray-200 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            type="button"
            className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
