import React from 'react';
import { X } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface CategoryModalProps {
  show: boolean;
  onClose: () => void;
  categoryForm: string;
  setCategoryForm: React.Dispatch<React.SetStateAction<string>>;
  addCustomCategory: () => void;
  customCategories: string[];
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  show,
  onClose,
  categoryForm,
  setCategoryForm,
  addCustomCategory,
  customCategories
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-xl font-semibold">Manage Categories</h4>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X />
            </Button>
          </div>
          
          <Input
            placeholder="New Category Name"
            value={categoryForm}
            onChange={e => setCategoryForm(e.target.value)}
          />
          
          <Button className="w-full" onClick={addCustomCategory}>
            Add Category
          </Button>
          
          <div className="mt-4">
            <h5 className="text-sm font-semibold">Existing Custom Categories</h5>
            {customCategories.length ? (
              <ul className="mt-2 space-y-1">
                {customCategories.map(cat => (
                  <li key={cat} className="text-sm">{cat}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 mt-2">No custom categories yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};