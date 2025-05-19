import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, KeyRound, ChevronLeft, User } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { CardShell } from '../components/ui/Card';
import toast from 'react-hot-toast';

const DEFAULT_CODES = {
  'Ray': '2311',
  'Amber': '1590'
};

export const LoginPage = () => {
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState<'Ray' | 'Amber' | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [showKeypad, setShowKeypad] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [showRecovery, setShowRecovery] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [revealedDigit, setRevealedDigit] = useState<{ value: string; index: number } | null>(null);
  const [loginBackground] = useState(() => {
    const stored = localStorage.getItem('loginBackground');
    return stored || 'https://images.pexels.com/photos/7130469/pexels-photo-7130469.jpeg?auto=compress&cs=tinysrgb&w=1920';
  });

  const handleNumberClick = useCallback((num: number) => {
    if (code.length < 4) {
      setCode(prev => {
        const newCode = prev + num;
        setRevealedDigit({ value: num.toString(), index: prev.length });
        setTimeout(() => setRevealedDigit(null), 500);
        return newCode;
      });
    }
  }, [code]);

  const handleDelete = () => {
    setCode(prev => prev.slice(0, -1));
    setError('');
  };

  const handleClear = () => {
    setCode('');
    setError('');
  };

  const handleManualInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCode(value);
    setError('');
  };

  const handleBack = () => {
    setSelectedUser(null);
    setCode('');
    setError('');
    setFailedAttempts(0);
    setShowRecovery(false);
  };

  const handleError = () => {
    setError('Incorrect PIN. Please try again.');
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
    setFailedAttempts(prev => prev + 1);
    setCode('');
  };

  useEffect(() => {
    if (code.length === 4 && selectedUser) {
      const storedPasscodes = JSON.parse(localStorage.getItem('passcodes') || '{}');
      const validCode = storedPasscodes[selectedUser] || DEFAULT_CODES[selectedUser];
      
      if (code === validCode) {
        localStorage.setItem('user', selectedUser);
        navigate('/dashboard');
      } else {
        handleError();
      }
    }
  }, [code, selectedUser, navigate]);

  useEffect(() => {
    if (failedAttempts >= 3) {
      setShowRecovery(true);
    }
  }, [failedAttempts]);

  if (!selectedUser) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative overflow-hidden"
        style={{ backgroundImage: `url(${loginBackground})` }}
      >
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
        
        <CardShell className="w-full max-w-md relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-3xl p-8 shadow-2xl transform transition-all duration-300 hover:shadow-3xl">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full blur-lg opacity-75 group-hover:opacity-100 transition-opacity" />
                <div className="relative p-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full shadow-xl transform transition-transform duration-300 group-hover:scale-110">
                  <Wallet className="w-10 h-10 text-white transform transition-transform group-hover:rotate-12" />
                </div>
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              Welcome to Buxfer
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Your family budget tracker
            </p>
          </div>

          <div className="space-y-4">
            <Button
              className="w-full h-16 text-lg relative overflow-hidden group bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:scale-[1.02] rounded-2xl"
              onClick={() => setSelectedUser('Ray')}
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <User className="w-6 h-6 mr-3 transition-transform group-hover:scale-110" />
              <span className="font-medium">Ray</span>
            </Button>
            
            <Button
              className="w-full h-16 text-lg relative overflow-hidden group bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg hover:shadow-pink-500/25 transition-all duration-300 hover:scale-[1.02] rounded-2xl"
              onClick={() => setSelectedUser('Amber')}
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <User className="w-6 h-6 mr-3 transition-transform group-hover:scale-110" />
              <span className="font-medium">Amber</span>
            </Button>
          </div>
        </CardShell>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative overflow-hidden"
      style={{ backgroundImage: `url(${loginBackground})` }}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      
      <CardShell className="w-full max-w-md relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-3xl p-8 shadow-2xl">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4"
          onClick={handleBack}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full blur-lg opacity-75 group-hover:opacity-100 transition-opacity" />
              <div className="relative p-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full shadow-xl transform transition-transform duration-300 group-hover:scale-110">
                <Wallet className="w-10 h-10 text-white transform transition-transform group-hover:rotate-12" />
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-3">Welcome back, {selectedUser}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            🔒 Please enter your Code to continue
          </p>
        </div>

        <div className={`mb-8 transition-transform ${isShaking ? 'animate-shake' : ''}`}>
          <div className="flex justify-center gap-3 mb-4">
            {[1, 2, 3, 4].map((_, i) => (
              <div
                key={i}
                className={`
                  w-14 h-14 rounded-2xl border-2 flex items-center justify-center text-2xl font-bold
                  transition-all duration-200 shadow-sm
                  ${code[i] 
                    ? 'border-indigo-600 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-900/20' 
                    : 'border-gray-200 dark:border-gray-700'}
                  ${error ? 'border-red-500 bg-red-50 dark:border-red-500/50 dark:bg-red-900/20' : ''}
                  ${revealedDigit?.index === i ? 'scale-110' : ''}
                `}
              >
                {revealedDigit?.index === i ? revealedDigit.value : code[i] ? '•' : ''}
              </div>
            ))}
          </div>
          {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
          {showRecovery && (
            <div className="mt-4 text-center">
              <button
                onClick={() => toast.error('Please contact support to reset your PIN')}
                className="text-indigo-600 dark:text-indigo-400 text-sm hover:underline"
              >
                Forgot PIN?
              </button>
            </div>
          )}
        </div>

        <div className="mb-4">
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => setShowKeypad(!showKeypad)}
          >
            <KeyRound size={16} className="mr-2" />
            Switch to {showKeypad ? 'manual input' : 'keypad'}
          </Button>
        </div>

        {showKeypad ? (
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <Button
                key={num}
                variant="ghost"
                className="h-16 w-16 mx-auto rounded-full text-2xl font-semibold transition-transform active:scale-95"
                onClick={() => handleNumberClick(num)}
              >
                {num}
              </Button>
            ))}
            <Button
              variant="ghost"
              className="h-16 text-lg font-medium text-red-500 mx-auto rounded-full"
              onClick={handleClear}
            >
              Clear
            </Button>
            <Button
              variant="ghost"
              className="h-16 w-16 mx-auto rounded-full text-2xl font-semibold transition-transform active:scale-95"
              onClick={() => handleNumberClick(0)}
            >
              0
            </Button>
            <Button
              variant="ghost"
              className="h-16 w-16 mx-auto rounded-full text-lg transition-transform active:scale-95"
              onClick={handleDelete}
            >
              ←
            </Button>
          </div>
        ) : (
          <div className="mb-4">
            <Input
              type="password"
              placeholder="Enter 4-digit PIN"
              value={code}
              onChange={handleManualInput}
              maxLength={4}
              className={`
                text-center text-2xl tracking-widest
                ${error ? 'border-red-500 focus:border-red-500' : ''}
              `}
              aria-label="Enter PIN"
            />
          </div>
        )}
      </CardShell>
    </div>
  );
};