import React from 'react';
import { Type } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

const ManualEntryForm = ({ code, onChange, onSubmit, onCancel }) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="barcode">Enter Barcode/SKU</Label>
        <Input
          id="barcode"
          value={code}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter product barcode or SKU"
          autoFocus
        />
      </div>
      
      <div className="flex space-x-2">
        <Button type="submit" className="flex-1">
          <Type className="h-4 w-4 mr-2" />
          Process Code
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default ManualEntryForm;
