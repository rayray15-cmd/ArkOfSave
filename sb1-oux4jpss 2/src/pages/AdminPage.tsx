import React, { useState } from 'react';
import { 
  ShieldCheck, Key, DollarSign, Users, Bell, RefreshCw, 
  RotateCcw, Tags, Plus, Trash2, Edit2, List, ChevronDown,
  Image
} from 'lucide-react';
import { CardShell } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select';
import { predefinedCategories, autoCatRules } from '../lib/categories';
import toast from 'react-hot-toast';

export const AdminPage = () => {
  const [newAmberPasscode, setNewAmberPasscode] = useState('');
  const [amberBudget, setAmberBudget] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(predefinedCategories[0]);
  const [editingKeyword, setEditingKeyword] = useState<{ original: string; category: string } | null>(null);
  const [editedKeyword, setEditedKeyword] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState<{ id: string; name: string } | null>(null);
  const [loginBackground, setLoginBackground] = useState(() => {
    const stored = localStorage.getItem('loginBackground');
    return stored || 'https://images.pexels.com/photos/7130469/pexels-photo-7130469.jpeg?auto=compress&cs=tinysrgb&w=1920';
  });
  const [categories, setCategories] = useState(() => {
    const stored = localStorage.getItem('categories');
    return stored ? JSON.parse(stored) : predefinedCategories;
  });

  const keywordsByCategory = autoCatRules.reduce((acc, rule) => {
    if (!acc[rule.category]) {
      acc[rule.category] = [];
    }
    acc[rule.category].push(rule.keyword);
    return acc;
  }, {} as Record<string, string[]>);

  const handlePasscodeReset = () => {
    if (newAmberPasscode.length !== 4 || !/^\d+$/.test(newAmberPasscode)) {
      toast.error('Passcode must be exactly 4 digits');
      return;
    }

    const passcodes = JSON.parse(localStorage.getItem('passcodes') || '{}');
    passcodes['Amber'] = newAmberPasscode;
    localStorage.setItem('passcodes', JSON.stringify(passcodes));
    
    toast.success("Amber's passcode has been updated");
    setNewAmberPasscode('');
  };

  const handleBudgetUpdate = () => {
    const amount = parseFloat(amberBudget);
    if (isNaN(amount) || amount < 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const budgets = JSON.parse(localStorage.getItem('budgets') || '[]');
    if (budgets[0]) {
      budgets[0].personalBudget = {
        ...budgets[0].personalBudget,
        Amber: amount
      };
      localStorage.setItem('budgets', JSON.stringify(budgets));
      toast.success("Amber's budget has been updated");
      setAmberBudget('');
    }
  };

  const handleMonthlyReset = () => {
    const budgets = JSON.parse(localStorage.getItem('budgets') || '[]');
    if (budgets[0]) {
      budgets[0] = {
        ...budgets[0],
        spent: 0,
        personalBudget: {
          Ray: 0,
          Amber: 0
        }
      };
      localStorage.setItem('budgets', JSON.stringify(budgets));
    }

    localStorage.setItem('expenses', '[]');

    const budgetGoals = JSON.parse(localStorage.getItem('budgetGoals') || '[]');
    const resetGoals = budgetGoals.map(goal => ({
      ...goal,
      currentAmount: 0
    }));
    localStorage.setItem('budgetGoals', JSON.stringify(resetGoals));

    toast.success('Monthly data has been reset successfully');
  };

  const handleLoginBackgroundUpdate = (url: string) => {
    if (!url.trim()) {
      toast.error('Please enter a valid URL');
      return;
    }

    try {
      new URL(url);
    } catch {
      toast.error('Please enter a valid URL');
      return;
    }

    setLoginBackground(url);
    localStorage.setItem('loginBackground', url);
    toast.success('Login background updated successfully');
  };

  const handleAddKeyword = () => {
    const keyword = newKeyword.trim().toLowerCase();
    if (!keyword) {
      toast.error('Please enter a keyword');
      return;
    }

    if (autoCatRules.some(rule => rule.keyword === keyword)) {
      toast.error('This keyword already exists');
      return;
    }

    autoCatRules.push({
      keyword,
      category: selectedCategory
    });

    toast.success(`Added "${keyword}" to ${selectedCategory} category`);
    setNewKeyword('');
  };

  const handleEditKeyword = (original: string, category: string) => {
    setEditingKeyword({ original, category });
    setEditedKeyword(original);
  };

  const handleSaveEdit = () => {
    if (!editingKeyword) return;

    const edited = editedKeyword.trim().toLowerCase();
    if (!edited) {
      toast.error('Keyword cannot be empty');
      return;
    }

    if (edited !== editingKeyword.original && 
        autoCatRules.some(rule => rule.keyword === edited)) {
      toast.error('This keyword already exists');
      return;
    }

    const ruleIndex = autoCatRules.findIndex(
      rule => rule.keyword === editingKeyword.original
    );
    if (ruleIndex !== -1) {
      autoCatRules[ruleIndex].keyword = edited;
      toast.success('Keyword updated successfully');
      setEditingKeyword(null);
      setEditedKeyword('');
    }
  };

  const handleDeleteKeyword = (keyword: string) => {
    const index = autoCatRules.findIndex(rule => rule.keyword === keyword);
    if (index !== -1) {
      autoCatRules.splice(index, 1);
      toast.success('Keyword deleted successfully');
    }
  };

  const handleAddCategory = () => {
    const name = newCategory.trim();
    if (!name) {
      toast.error('Please enter a category name');
      return;
    }

    if (categories.includes(name)) {
      toast.error('This category already exists');
      return;
    }

    const updatedCategories = [...categories, name];
    setCategories(updatedCategories);
    localStorage.setItem('categories', JSON.stringify(updatedCategories));
    toast.success(`Added category: ${name}`);
    setNewCategory('');
  };

  const handleEditCategory = (category: string) => {
    setEditingCategory({ id: category, name: category });
  };

  const handleSaveCategory = () => {
    if (!editingCategory) return;

    const newName = editingCategory.name.trim();
    if (!newName) {
      toast.error('Category name cannot be empty');
      return;
    }

    if (newName !== editingCategory.id && categories.includes(newName)) {
      toast.error('This category already exists');
      return;
    }

    const updatedCategories = categories.map(cat => 
      cat === editingCategory.id ? newName : cat
    );

    autoCatRules.forEach(rule => {
      if (rule.category === editingCategory.id) {
        rule.category = newName;
      }
    });

    setCategories(updatedCategories);
    localStorage.setItem('categories', JSON.stringify(updatedCategories));
    toast.success('Category updated successfully');
    setEditingCategory(null);
  };

  const handleDeleteCategory = (category: string) => {
    if (window.confirm(`Are you sure you want to delete the "${category}" category? This will also remove all associated keywords.`)) {
      const updatedCategories = categories.filter(cat => cat !== category);
      setCategories(updatedCategories);
      localStorage.setItem('categories', JSON.stringify(updatedCategories));

      const updatedRules = autoCatRules.filter(rule => rule.category !== category);
      autoCatRules.length = 0;
      autoCatRules.push(...updatedRules);

      toast.success(`Deleted category: ${category}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <ShieldCheck size={24} /> Admin Panel
      </h1>

      <div className="grid gap-6">
        <details className="group" open={false}>
          <summary className="cursor-pointer list-none">
            <CardShell>
              <h2 className="text-lg font-semibold flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Image size={20} /> Login Background
                </div>
                <div className="w-4 h-4 transition-transform group-open:rotate-180">
                  <ChevronDown size={16} />
                </div>
              </h2>
            </CardShell>
          </summary>
          <div className="mt-2">
            <CardShell>
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h3 className="font-medium mb-2">Current Background</h3>
                  <div className="aspect-video rounded-lg overflow-hidden mb-4">
                    <img 
                      src={loginBackground} 
                      alt="Login background preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter image URL"
                      value={loginBackground}
                      onChange={(e) => setLoginBackground(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={() => handleLoginBackgroundUpdate(loginBackground)}>
                      Update Background
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Enter the URL of an image to use as the login screen background.
                    For best results, use a high-resolution image (1920x1080 or larger).
                  </p>
                </div>
              </div>
            </CardShell>
          </div>
        </details>

        <details className="group" open={false}>
          <summary className="cursor-pointer list-none">
            <CardShell>
              <h2 className="text-lg font-semibold flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <RotateCcw size={20} /> Monthly Reset
                </div>
                <div className="w-4 h-4 transition-transform group-open:rotate-180">
                  <ChevronDown size={16} />
                </div>
              </h2>
            </CardShell>
          </summary>
          <div className="mt-2">
            <CardShell>
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h3 className="font-medium mb-2">Reset Monthly Data</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    This will reset all budgets, expenses, and progress for the new month. This action cannot be undone.
                  </p>
                  <Button 
                    variant="destructive"
                    onClick={handleMonthlyReset}
                    className="w-full"
                  >
                    Reset Monthly Data
                  </Button>
                </div>
              </div>
            </CardShell>
          </div>
        </details>

        <details className="group" open={false}>
          <summary className="cursor-pointer list-none">
            <CardShell>
              <h2 className="text-lg font-semibold flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Key size={20} /> Security Management
                </div>
                <div className="w-4 h-4 transition-transform group-open:rotate-180">
                  <ChevronDown size={16} />
                </div>
              </h2>
            </CardShell>
          </summary>
          <div className="mt-2">
            <CardShell>
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h3 className="font-medium mb-2">Reset Amber's Passcode</h3>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="New 4-digit passcode"
                      value={newAmberPasscode}
                      onChange={(e) => setNewAmberPasscode(e.target.value)}
                      maxLength={4}
                      className="w-40"
                    />
                    <Button onClick={handlePasscodeReset}>
                      Update Passcode
                    </Button>
                  </div>
                </div>
              </div>
            </CardShell>
          </div>
        </details>

        <details className="group" open={false}>
          <summary className="cursor-pointer list-none">
            <CardShell>
              <h2 className="text-lg font-semibold flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <DollarSign size={20} /> Budget Management
                </div>
                <div className="w-4 h-4 transition-transform group-open:rotate-180">
                  <ChevronDown size={16} />
                </div>
              </h2>
            </CardShell>
          </summary>
          <div className="mt-2">
            <CardShell>
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h3 className="font-medium mb-2">Update Amber's Budget</h3>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Budget amount"
                      value={amberBudget}
                      onChange={(e) => setAmberBudget(e.target.value)}
                      className="w-40"
                    />
                    <Button onClick={handleBudgetUpdate}>
                      Update Budget
                    </Button>
                  </div>
                </div>
              </div>
            </CardShell>
          </div>
        </details>

        <details className="group" open={false}>
          <summary className="cursor-pointer list-none">
            <CardShell>
              <h2 className="text-lg font-semibold flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Tags size={20} /> Category Keywords
                </div>
                <div className="w-4 h-4 transition-transform group-open:rotate-180">
                  <ChevronDown size={16} />
                </div>
              </h2>
            </CardShell>
          </summary>
          <div className="mt-2">
            <CardShell>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="New keyword"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleAddKeyword}>
                    <Plus size={16} className="mr-2" /> Add Keyword
                  </Button>
                </div>

                <div className="space-y-4">
                  {categories.map(category => (
                    <div key={category} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <h3 className="font-medium mb-3">{category}</h3>
                      <div className="flex flex-wrap gap-2">
                        {(keywordsByCategory[category] || []).map(keyword => (
                          <div
                            key={keyword}
                            className="flex items-center gap-1 bg-white dark:bg-gray-800 px-2 py-1 rounded-lg shadow-sm"
                          >
                            {editingKeyword?.original === keyword ? (
                              <>
                                <Input
                                  value={editedKeyword}
                                  onChange={(e) => setEditedKeyword(e.target.value)}
                                  className="w-32 h-6 text-sm"
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={handleSaveEdit}
                                  className="h-6 px-2"
                                >
                                  Save
                                </Button>
                              </>
                            ) : (
                              <>
                                <span className="text-sm">{keyword}</span>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleEditKeyword(keyword, category)}
                                    className="p-1 hover:text-indigo-600 transition-colors"
                                  >
                                    <Edit2 size={12} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteKeyword(keyword)}
                                    className="p-1 hover:text-red-600 transition-colors"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardShell>
          </div>
        </details>

        <details className="group" open={false}>
          <summary className="cursor-pointer list-none">
            <CardShell>
              <h2 className="text-lg font-semibold flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <List size={20} /> Manage Categories
                </div>
                <div className="w-4 h-4 transition-transform group-open:rotate-180">
                  <ChevronDown size={16} />
                </div>
              </h2>
            </CardShell>
          </summary>
          <div className="mt-2">
            <CardShell>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="New category name"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleAddCategory}>
                    <Plus size={16} className="mr-2" /> Add Category
                  </Button>
                </div>

                <div className="space-y-2">
                  {categories.map(category => (
                    <div
                      key={category}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                    >
                      {editingCategory?.id === category ? (
                        <div className="flex-1 flex items-center gap-2">
                          <Input
                            value={editingCategory.name}
                            onChange={(e) => setEditingCategory(prev => ({ 
                              ...prev!, 
                              name: e.target.value 
                            }))}
                            className="flex-1"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSaveCategory}
                          >
                            Save
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingCategory(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <>
                          <span className="font-medium">{category}</span>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditCategory(category)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              <Edit2 size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCategory(category)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardShell>
          </div>
        </details>

        <details className="group" open={false}>
          <summary className="cursor-pointer list-none">
            <CardShell>
              <h2 className="text-lg font-semibold flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Users size={20} /> User Management
                </div>
                <div className="w-4 h-4 transition-transform group-open:rotate-180">
                  <ChevronDown size={16} />
                </div>
              </h2>
            </CardShell>
          </summary>
          <div className="mt-2">
            <CardShell>
              <div className="space-y-4">
                <Button variant="secondary" className="w-full justify-start">
                  <RefreshCw size={16} className="mr-2" /> Reset User Preferences
                </Button>
                <Button variant="secondary" className="w-full justify-start">
                  <Bell size={16} className="mr-2" /> Manage Notifications
                </Button>
              </div>
            </CardShell>
          </div>
        </details>
      </div>
    </div>
  );
};