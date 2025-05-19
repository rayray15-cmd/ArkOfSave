import React, { useState } from 'react';
import { User, Bell, Sun, Calendar, Palette, Shield, Key } from 'lucide-react';
import { CardShell } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select';
import { useUserPreferences } from '../hooks/useUserPreferences';
import toast from 'react-hot-toast';

export const ProfilePage = () => {
  const user = localStorage.getItem('user');
  const { preferences, updatePreferences } = useUserPreferences();
  const [newPasscode, setNewPasscode] = useState('');

  const handlePasscodeReset = () => {
    if (newPasscode.length !== 4 || !/^\d+$/.test(newPasscode)) {
      toast.error('Passcode must be exactly 4 digits');
      return;
    }

    // Store the new passcode
    const passcodes = JSON.parse(localStorage.getItem('passcodes') || '{}');
    passcodes['Amber'] = newPasscode;
    localStorage.setItem('passcodes', JSON.stringify(passcodes));
    
    toast.success("Amber's passcode has been updated");
    setNewPasscode('');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <User size={24} /> Profile Settings
      </h1>

      <div className="grid gap-6">
        <CardShell>
          <h2 className="text-lg font-semibold mb-4">Account Status</h2>
          <div className="flex items-center gap-3 p-4 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg">
            <Shield size={24} className={preferences.isAdmin ? "text-indigo-600" : "text-gray-400"} />
            <div>
              <p className="font-medium">{preferences.isAdmin ? "Administrator" : "Regular User"}</p>
              <p className="text-sm text-gray-500">
                {preferences.isAdmin 
                  ? "You have full administrative access" 
                  : "You have standard user permissions"}
              </p>
            </div>
          </div>
        </CardShell>

        {preferences.isAdmin && (
          <CardShell>
            <h2 className="text-lg font-semibold mb-4">Administrative Tools</h2>
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <Key size={20} className="text-indigo-600" />
                  <h3 className="font-medium">Reset Amber's Passcode</h3>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="New 4-digit passcode"
                    value={newPasscode}
                    onChange={(e) => setNewPasscode(e.target.value)}
                    maxLength={4}
                    className="w-40"
                  />
                  <Button onClick={handlePasscodeReset}>
                    Update Passcode
                  </Button>
                </div>
              </div>
              
              <Button 
                variant="secondary"
                onClick={() => {/* Add admin functionality */}}
                className="w-full justify-start"
              >
                Manage Budget Allocations
              </Button>
              <Button 
                variant="secondary"
                onClick={() => {/* Add admin functionality */}}
                className="w-full justify-start"
              >
                View All User Activities
              </Button>
              <Button 
                variant="secondary"
                onClick={() => {/* Add admin functionality */}}
                className="w-full justify-start"
              >
                Configure System Settings
              </Button>
            </div>
          </CardShell>
        )}

        <CardShell>
          <h2 className="text-lg font-semibold mb-4">Appearance</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sun size={20} />
                <div>
                  <p className="font-medium">Theme</p>
                  <p className="text-sm text-gray-500">Choose your preferred theme</p>
                </div>
              </div>
              <Select
                value={preferences.theme}
                onValueChange={v => updatePreferences({ theme: v as 'light' | 'dark' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette size={20} />
                <div>
                  <p className="font-medium">Currency</p>
                  <p className="text-sm text-gray-500">Set your preferred currency</p>
                </div>
              </div>
              <Select
                value={preferences.currency}
                onValueChange={v => updatePreferences({ currency: v as 'GBP' | 'USD' | 'EUR' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar size={20} />
                <div>
                  <p className="font-medium">Week Starts On</p>
                  <p className="text-sm text-gray-500">Choose your preferred start of the week</p>
                </div>
              </div>
              <Select
                value={preferences.weekStartsOn.toString()}
                onValueChange={v => updatePreferences({ weekStartsOn: Number(v) as 0 | 1 })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Sunday</SelectItem>
                  <SelectItem value="1">Monday</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardShell>

        <CardShell>
          <h2 className="text-lg font-semibold mb-4">Notifications</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell size={20} />
              <div>
                <p className="font-medium">Enable Notifications</p>
                <p className="text-sm text-gray-500">Get notified about important updates</p>
              </div>
            </div>
            <Button
              variant={preferences.notifications ? 'default' : 'secondary'}
              onClick={() => updatePreferences({ notifications: !preferences.notifications })}
            >
              {preferences.notifications ? 'Enabled' : 'Disabled'}
            </Button>
          </div>
        </CardShell>

        <CardShell>
          <h2 className="text-lg font-semibold mb-4">Account</h2>
          <div className="space-y-4">
            <div>
              <p className="font-medium">Current User</p>
              <p className="text-2xl font-bold text-indigo-600">{user}</p>
            </div>
            <Button
              variant="destructive"
              onClick={() => {
                localStorage.removeItem('user');
                window.location.href = '/';
              }}
            >
              Sign Out
            </Button>
          </div>
        </CardShell>
      </div>
    </div>
  );
};