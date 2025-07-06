import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  defaultCurrency?: string;
  wallets?: string[];
}

export const TransactionForm = ({ 
  onAddTransaction, 
  defaultCurrency = 'USD',
  wallets = ['Main Wallet']
}: TransactionFormProps) => {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<'monthly' | 'weekly' | 'yearly'>('monthly');
  const [isFixed, setIsFixed] = useState(false);
  const [currency, setCurrency] = useState(defaultCurrency);
  const [wallet, setWallet] = useState(wallets[0]);
  const { toast } = useToast();

  const availableCategories = defaultCategories.filter(cat => cat.type === type);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !category || !description) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }

    const transaction: Omit<Transaction, 'id'> = {
      type,
      amount: parseFloat(amount),
      category,
      description,
      date: new Date().toISOString(),
      isRecurring,
      recurringFrequency: isRecurring ? recurringFrequency : undefined,
      isFixed,
      currency,
      wallet
    };

    onAddTransaction(transaction);
    
    // Reset form
    setAmount('');
    setCategory('');
    setDescription('');
    setIsRecurring(false);
    setIsFixed(false);
    
    toast({
      title: 'Transaction Added',
      description: `${type === 'income' ? 'Income' : 'Expense'} of ${new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency
      }).format(parseFloat(amount))} has been recorded.`,
    });
  };

  return (
    <Card className="finance-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 finance-gradient rounded-xl flex items-center justify-center">
          <Plus className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-xl font-semibold">Add Transaction</h3>
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
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              min="0"
              className="flex-1"
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
          Add Transaction
        </Button>
      </form>
    </Card>
  );
};