import React from 'react';
import { Button } from '../ui/Button';

interface ExpenseFiltersProps {
  clearFilters: () => void;
}

export const ExpenseFilters: React.FC<ExpenseFiltersProps> = ({ clearFilters }) => {
  return (
    <div className="mb-4 flex justify-end">
      <Button variant="secondary" onClick={clearFilters}>Clear Filters</Button>
    </div>
  );
};