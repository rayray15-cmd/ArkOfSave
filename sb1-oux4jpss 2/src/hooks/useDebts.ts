import { useState } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { Debt, DebtPayment, PersonalDebt } from '../types';
import { useBudgetData } from './useBudgetData';
import toast from 'react-hot-toast';

export const useDebts = () => {
  const [debts, setDebts] = useLocalStorage<Debt[]>('debts', []);
  const [personalDebts, setPersonalDebts] = useLocalStorage<PersonalDebt[]>('personalDebts', []);
  const currentUser = localStorage.getItem('user');
  const { addExpense, setExpenseForm } = useBudgetData();

  const addDebt = (description: string, amount: number, isShared: boolean) => {
    if (!description || amount <= 0) {
      toast.error('Please provide a valid description and amount');
      return;
    }

    const newDebt: Debt = {
      id: Date.now(),
      description,
      totalAmount: amount,
      remainingAmount: amount,
      date: new Date().toISOString().split('T')[0],
      addedBy: currentUser || '',
      isShared,
      payments: []
    };

    setDebts([newDebt, ...debts]);

    // Add as expense
    setExpenseForm({
      description,
      amount: amount.toString(),
      category: 'Debts',
      splitWith: isShared ? (currentUser === 'Ray' ? 'Amber' : 'Ray') : undefined,
      splitAmount: isShared ? amount / 2 : undefined
    });
    addExpense();

    toast.success('Debt added successfully');
  };

  const addPersonalDebt = (description: string, totalAmount: number, paymentAmount: number) => {
    if (!description || totalAmount <= 0 || paymentAmount <= 0) {
      toast.error('Please provide valid amounts');
      return;
    }

    const newDebt: PersonalDebt = {
      id: Date.now(),
      description,
      totalAmount,
      remainingAmount: totalAmount,
      paymentAmount,
      date: new Date().toISOString().split('T')[0],
      addedBy: currentUser || '',
      payments: []
    };

    setPersonalDebts([newDebt, ...personalDebts]);
    toast.success('Personal debt added successfully');
  };

  const addPayment = (debtId: number, isPersonal = false) => {
    if (isPersonal) {
      const debt = personalDebts.find(d => d.id === debtId);
      if (!debt) {
        toast.error('Debt not found');
        return;
      }

      if (debt.remainingAmount <= 0) {
        toast.error('This debt has been fully paid');
        return;
      }

      const paymentAmount = Math.min(debt.paymentAmount, debt.remainingAmount);

      const payment: DebtPayment = {
        id: Date.now(),
        amount: paymentAmount,
        date: new Date().toISOString().split('T')[0],
        addedBy: currentUser || ''
      };

      setPersonalDebts(prev => prev.map(d => {
        if (d.id === debtId) {
          return {
            ...d,
            remainingAmount: d.remainingAmount - paymentAmount,
            payments: [...d.payments, payment]
          };
        }
        return d;
      }));

      // Add payment as expense
      setExpenseForm({
        description: `Payment for: ${debt.description}`,
        amount: paymentAmount.toString(),
        category: 'Debt Payments',
        splitWith: undefined,
        splitAmount: undefined
      });
      addExpense();

      toast.success(`Payment of £${paymentAmount.toLocaleString()} recorded`);
    } else {
      const debt = debts.find(d => d.id === debtId);
      if (!debt) {
        toast.error('Debt not found');
        return;
      }

      if (debt.remainingAmount <= 0) {
        toast.error('This debt has been fully paid');
        return;
      }

      const payment: DebtPayment = {
        id: Date.now(),
        amount: debt.remainingAmount,
        date: new Date().toISOString().split('T')[0],
        addedBy: currentUser || ''
      };

      setDebts(prev => prev.map(d => {
        if (d.id === debtId) {
          return {
            ...d,
            remainingAmount: 0,
            payments: [...d.payments, payment]
          };
        }
        return d;
      }));

      // Add payment as expense
      setExpenseForm({
        description: `Payment for: ${debt.description}`,
        amount: debt.remainingAmount.toString(),
        category: 'Debt Payments',
        splitWith: debt.isShared ? (currentUser === 'Ray' ? 'Amber' : 'Ray') : undefined,
        splitAmount: debt.isShared ? debt.remainingAmount / 2 : undefined
      });
      addExpense();

      toast.success(`Payment of £${debt.remainingAmount.toLocaleString()} recorded`);
    }
  };

  const deleteDebt = (id: number, isPersonal = false) => {
    if (isPersonal) {
      setPersonalDebts(personalDebts.filter(d => d.id !== id));
    } else {
      setDebts(debts.filter(d => d.id !== id));
    }
    toast.success('Debt deleted successfully');
  };

  const updatePersonalDebtPayment = (id: number, newPaymentAmount: number) => {
    if (newPaymentAmount <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }

    setPersonalDebts(prev => prev.map(debt => 
      debt.id === id ? { ...debt, paymentAmount: newPaymentAmount } : debt
    ));

    toast.success('Payment amount updated');
  };

  const getVisibleDebts = () => {
    if (currentUser === 'Ray') {
      return {
        shared: debts.filter(d => d.isShared),
        personal: personalDebts
      };
    }
    return {
      shared: debts.filter(d => d.isShared),
      personal: []
    };
  };

  return {
    ...getVisibleDebts(),
    addDebt,
    addPersonalDebt,
    addPayment,
    deleteDebt,
    updatePersonalDebtPayment
  };
};