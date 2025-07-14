import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ArrowUp, ArrowDown, Plus } from 'lucide-react';
import { Transaction } from '@/types/finance';
import { defaultCategories } from '@/data/defaultCategories';
import { useToast } from '@/hooks/use-toast';

interface TransactionFormProps {
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  onEditTransaction?: (transaction: Transaction) => void;
  editingTransaction?: Transaction;
  defaultCurrency?: string;
  wallets?: string[];
}

export const TransactionForm = ({ 
  onAddTransaction,
  onEditTransaction,
  editingTransaction,
  defaultCurrency = 'USD',
  wallets = ['Main Wallet']
}: TransactionFormProps) => {
  const [type, setType] = useState<'income' | 'expense'>(editingTransaction?.type || 'expense');
  const [amount, setAmount] = useState(editingTransaction?.originalAmount?.toString() || '');
  const [category, setCategory] = useState(editingTransaction?.category || '');
  const [description, setDescription] = useState(editingTransaction?.description || '');
  const [isRecurring, setIsRecurring] = useState(editingTransaction?.isRecurring || false);
  const [recurringFrequency, setRecurringFrequency] = useState<'monthly' | 'weekly' | 'yearly'>(
    (editingTransaction?.recurringFrequency && editingTransaction.recurringFrequency !== 'daily' ? editingTransaction.recurringFrequency : 'monthly')
  );
  const [isFixed, setIsFixed] = useState(editingTransaction?.isFixed || false);
  const [currency, setCurrency] = useState(editingTransaction?.originalCurrency || defaultCurrency);
  const [wallet, setWallet] = useState(editingTransaction?.wallet || wallets[0]);
  const { toast } = useToast();

  const availableCategories = defaultCategories.filter(cat => cat.type === type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !category) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in amount and category.',
        variant: 'destructive'
      });
      return;
    }

    const originalAmount = parseFloat(amount);
    let convertedAmount = originalAmount;
    let exchangeRate = 1;

    // Convert to BRL if currency is not BRL
    if (currency !== 'BRL') {
      try {
        const { convertToBRL } = await import('@/utils/currencyService');
        const conversion = await convertToBRL(originalAmount, currency);
        convertedAmount = conversion.convertedAmount;
        exchangeRate = conversion.exchangeRate;
        
        toast({
          title: 'Currency Converted',
          description: `${originalAmount} ${currency} = ${convertedAmount.toFixed(2)} BRL (Rate: ${exchangeRate.toFixed(4)})`,
        });
      } catch (error) {
        toast({
          title: 'Conversion Error',
          description: 'Using fallback exchange rate',
          variant: 'destructive'
        });
      }
    }

    const transactionData = {
      type,
      amount: convertedAmount, // Amount in BRL
      originalAmount,
      category,
      description,
      date: editingTransaction?.date || new Date().toISOString(),
      isRecurring,
      recurringFrequency: isRecurring ? recurringFrequency : undefined,
      isFixed,
      currency: 'BRL', // Always BRL for calculations
      originalCurrency: currency,
      exchangeRate: currency !== 'BRL' ? exchangeRate : undefined,
      wallet
    };

    if (editingTransaction && onEditTransaction) {
      onEditTransaction({ ...transactionData, id: editingTransaction.id });
    } else {
      onAddTransaction(transactionData);
    }
    
    // Reset form
    setAmount('');
    setCategory('');
    setDescription('');
    setIsRecurring(false);
    setIsFixed(false);
    
    toast({
      title: editingTransaction ? 'Transaction Updated' : 'Transaction Added',
      description: `${type === 'income' ? 'Income' : 'Expense'} of ${new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(convertedAmount)} has been ${editingTransaction ? 'updated' : 'recorded'}.`,
    });
  };

  return (
    <Card className="finance-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 finance-gradient rounded-xl flex items-center justify-center">
          <Plus className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-xl font-semibold">
          {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Transaction Type */}
        <div className="flex gap-2">
          <Button
            type="button"
            variant={type === 'expense' ? 'default' : 'outline'}
            onClick={() => setType('expense')}
            className={type === 'expense' ? 'bg-warning hover:bg-warning/90' : ''}
          >
            <ArrowDown className="w-4 h-4 mr-2" />
            Expense
          </Button>
          <Button
            type="button"
            variant={type === 'income' ? 'default' : 'outline'}
            onClick={() => setType('income')}
            className={type === 'income' ? 'success-gradient' : ''}
          >
            <ArrowUp className="w-4 h-4 mr-2" />
            Income
          </Button>
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Amount</label>
          <div className="flex gap-2">
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
                <SelectItem value="BRL">BRL</SelectItem>
              </SelectContent>
            </Select>
            <CurrencyInput
              value={amount}
              onChange={setAmount}
              currency={currency}
              locale={currency === 'BRL' ? 'pt-BR' : 'en-US'}
              className="flex-1"
              placeholder="0,00"
            />
          </div>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Category</label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {availableCategories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: cat.color }}
                    />
                    {cat.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <Input
            placeholder="Enter transaction description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Wallet Selection */}
        {wallets.length > 1 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Wallet</label>
            <Select value={wallet} onValueChange={setWallet}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {wallets.map((w) => (
                  <SelectItem key={w} value={w}>{w}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Options */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">Recurring Transaction</label>
              <p className="text-xs text-muted-foreground">This transaction repeats automatically</p>
            </div>
            <Switch checked={isRecurring} onCheckedChange={setIsRecurring} />
          </div>

          {isRecurring && (
            <Select value={recurringFrequency} onValueChange={(value) => setRecurringFrequency(value as 'monthly' | 'weekly' | 'yearly')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          )}

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">Fixed {type === 'income' ? 'Income' : 'Expense'}</label>
              <p className="text-xs text-muted-foreground">
                {type === 'income' ? 'Regular salary or fixed income' : 'Rent, subscriptions, fixed bills'}
              </p>
            </div>
            <Switch checked={isFixed} onCheckedChange={setIsFixed} />
          </div>
        </div>

        {/* Badges for quick info */}
        <div className="flex gap-2 flex-wrap">
          {isRecurring && (
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              Recurring {recurringFrequency}
            </Badge>
          )}
          {isFixed && (
            <Badge variant="secondary" className="bg-secondary">
              Fixed {type}
            </Badge>
          )}
        </div>

        <Button type="submit" className="w-full finance-gradient">
          {editingTransaction ? 'Update Transaction' : 'Add Transaction'}
        </Button>
      </form>
    </Card>
  );
};