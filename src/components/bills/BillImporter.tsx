import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { Transaction } from '@/types/finance';
import { convertToBRL } from '@/utils/currencyService';
import { useToast } from '@/hooks/use-toast';

interface BillImporterProps {
  onImportTransactions: (transactions: Transaction[]) => void;
}

export const BillImporter = ({ onImportTransactions }: BillImporterProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [defaultCategory, setDefaultCategory] = useState('bills');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const processCSVFile = async (file: File) => {
    setIsProcessing(true);
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('CSV file must have at least a header and one data row');
      }

      const header = lines[0].split(',').map(h => h.trim().toLowerCase());
      const transactions: Transaction[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        
        if (values.length < 3) continue;

        const dateIndex = header.findIndex(h => h.includes('date') || h.includes('data'));
        const amountIndex = header.findIndex(h => h.includes('amount') || h.includes('valor') || h.includes('value'));
        const descriptionIndex = header.findIndex(h => h.includes('description') || h.includes('descricao') || h.includes('desc'));
        const typeIndex = header.findIndex(h => h.includes('type') || h.includes('tipo'));
        const currencyIndex = header.findIndex(h => h.includes('currency') || h.includes('moeda'));

        if (dateIndex === -1 || amountIndex === -1) continue;

        const dateStr = values[dateIndex];
        const amountStr = values[amountIndex].replace(/[^\d.,-]/g, '').replace(',', '.');
        const amount = parseFloat(amountStr);
        const description = values[descriptionIndex] || `Imported transaction ${i}`;
        const type = values[typeIndex]?.toLowerCase().includes('income') || values[typeIndex]?.toLowerCase().includes('receita') ? 'income' : 'expense';
        const currency = values[currencyIndex] || 'BRL';

        if (isNaN(amount) || amount <= 0) continue;

        // Convert to BRL if needed
        let convertedAmount = amount;
        let exchangeRate = 1;
        
        if (currency !== 'BRL') {
          const conversion = await convertToBRL(amount, currency);
          convertedAmount = conversion.convertedAmount;
          exchangeRate = conversion.exchangeRate;
        }

        const transaction: Transaction = {
          id: `import-${Date.now()}-${i}`,
          type: type as 'income' | 'expense',
          amount: convertedAmount,
          originalAmount: amount,
          category: defaultCategory,
          description,
          date: dateStr,
          isRecurring: false,
          isFixed: false,
          currency: 'BRL',
          originalCurrency: currency,
          exchangeRate: currency !== 'BRL' ? exchangeRate : undefined
        };

        transactions.push(transaction);
      }

      if (transactions.length > 0) {
        onImportTransactions(transactions);
        toast({
          title: 'Bills Imported Successfully',
          description: `${transactions.length} transactions imported from CSV.`,
        });
      } else {
        throw new Error('No valid transactions found in the CSV file');
      }

    } catch (error) {
      toast({
        title: 'Import Error',
        description: error instanceof Error ? error.message : 'Failed to import CSV file',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      processCSVFile(file);
    } else {
      toast({
        title: 'Invalid File',
        description: 'Please select a valid CSV file.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="finance-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 finance-gradient rounded-xl flex items-center justify-center">
          <Upload className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-xl font-semibold">Import Bills</h3>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="default-category">Default Category</Label>
            <Select value={defaultCategory} onValueChange={setDefaultCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bills">Bills</SelectItem>
                <SelectItem value="utilities">Utilities</SelectItem>
                <SelectItem value="subscriptions">Subscriptions</SelectItem>
                <SelectItem value="rent">Rent</SelectItem>
                <SelectItem value="food">Food</SelectItem>
                <SelectItem value="transport">Transport</SelectItem>
                <SelectItem value="entertainment">Entertainment</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="shopping">Shopping</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h4 className="font-semibold mb-2">Upload CSV File</h4>
          <p className="text-sm text-muted-foreground mb-4">
            CSV should contain columns: date, amount, description (optional), type (optional), currency (optional)
          </p>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
            id="csv-upload"
          />
          
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="gap-2"
          >
            <Upload className="w-4 h-4" />
            {isProcessing ? 'Processing...' : 'Select CSV File'}
          </Button>
        </div>

        <div className="flex items-start gap-2 p-4 bg-muted/50 rounded-lg">
          <AlertCircle className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <strong>CSV Format Requirements:</strong>
            <ul className="mt-1 space-y-1 text-muted-foreground">
              <li>• Header row with column names</li>
              <li>• Date column (YYYY-MM-DD format preferred)</li>
              <li>• Amount column (numeric values)</li>
              <li>• Optional: description, type (income/expense), currency</li>
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
};