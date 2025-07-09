import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TransactionForm } from './TransactionForm';
import { Transaction } from '@/types/finance';

interface TransactionEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onEditTransaction: (transaction: Transaction) => void;
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
}

export const TransactionEditModal = ({
  isOpen,
  onClose,
  transaction,
  onEditTransaction,
  onAddTransaction
}: TransactionEditModalProps) => {
  const handleSuccess = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {transaction ? 'Edit Transaction' : 'Add Transaction'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <TransactionForm
            onAddTransaction={(newTransaction) => {
              onAddTransaction(newTransaction);
              handleSuccess();
            }}
            onEditTransaction={(updatedTransaction) => {
              onEditTransaction(updatedTransaction);
              handleSuccess();
            }}
            editingTransaction={transaction || undefined}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};