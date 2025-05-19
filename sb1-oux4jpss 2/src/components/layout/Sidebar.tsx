import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  PieChartIcon, 
  X, 
  Receipt, 
  Target, 
  PiggyBank, 
  Clock, 
  Settings,
  CalendarRange,
  CreditCard,
  Users,
  HelpCircle,
  Wallet,
  ShieldCheck,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Bell
} from 'lucide-react';
import { Button } from '../ui/Button';
import { useUserPreferences } from '../../hooks/useUserPreferences';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { preferences } = useUserPreferences();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hasNotification] = useState(true); // This would be dynamic in a real app
  const isActive = (path: string) => location.pathname === path;

  const NavLink = ({ to, icon: Icon, children }: { to: string; icon: any; children: React.ReactNode }) => (
    <Button 
      variant="ghost" 
      className={`
        w-full text-left justify-start group relative
        transition-all duration-200 ease-out
        ${isActive(to) 
          ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400' 
          : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
        }
        ${isCollapsed ? 'px-3' : 'pl-4'}
      `}
      onClick={onClose}
      asChild
    >
      <Link to={to} className="flex items-center">
        <div className={`
          relative flex items-center
          ${isActive(to) ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}
        `}>
          <Icon className={`
            ${isCollapsed ? 'mr-0' : 'mr-3'} 
            transition-transform duration-200
            ${isActive(to) ? 'scale-110' : 'group-hover:scale-110'}
          `} 
          size={18} 
        />
        </div>
        <span className={`
          transition-all duration-200
          ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}
          ${isActive(to) ? 'translate-x-1' : 'group-hover:translate-x-1'}
        `}>
          {children}
        </span>
        {isCollapsed && (
          <div className="
            absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm
            rounded opacity-0 pointer-events-none group-hover:opacity-100
            transition-opacity duration-200 whitespace-nowrap z-50
          ">
            {children}
          </div>
        )}
        {isActive(to) && (
          <div className="
            absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-r
            transform transition-transform duration-200 ease-out
          " />
        )}
      </Link>
    </Button>
  );

  const NavSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-6">
      {!isCollapsed && (
        <>
          <div className="h-px bg-gray-200 dark:bg-gray-700/30 mb-3" />
          <div className="px-4 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {title}
          </div>
        </>
      )}
      <div className="space-y-1">
        {children}
      </div>
    </div>
  );

  return (
    <>
      <div 
        className={`
          fixed inset-0 bg-black/20 backdrop-blur-sm z-20 md:hidden
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
          transition-opacity duration-200
        `}
        onClick={onClose}
      />

      <aside className={`
        fixed top-0 left-0 h-full bg-white dark:bg-gray-800 
        border-r border-gray-100 dark:border-gray-700 shadow-lg 
        transform transition-all duration-300 ease-out z-30
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        ${isCollapsed ? "w-16" : "w-64"}
        md:translate-x-0 flex flex-col
      `}>
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="relative">
              <Wallet className={`
                h-8 w-8 text-indigo-600 dark:text-indigo-400
                transition-transform duration-200
                ${isCollapsed ? 'scale-90' : ''}
              `} />
              {hasNotification && (
                <span className="
                  absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full
                  animate-pulse
                "/>
              )}
            </div>
            <div className={`
              transition-all duration-200
              ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}
            `}>
              <h1 className="text-xl font-bold">Buxfer</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Family Budget</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </Button>
        </div>
        
        <nav className="flex-1 py-4 overflow-y-auto">
          <NavSection title="Main">
            <NavLink to="/dashboard" icon={Home}>Dashboard</NavLink>
            <NavLink to="/income" icon={DollarSign}>Income</NavLink>
            <NavLink to="/expenses" icon={Receipt}>Expenses</NavLink>
            <NavLink to="/analytics" icon={PieChartIcon}>Analytics</NavLink>
          </NavSection>

          <NavSection title="Planning">
            <NavLink to="/goals" icon={Target}>Budget Goals</NavLink>
            <NavLink to="/savings" icon={PiggyBank}>Savings</NavLink>
            <NavLink to="/recurring" icon={Clock}>Recurring</NavLink>
            <NavLink to="/calendar" icon={CalendarRange}>Calendar</NavLink>
            <NavLink to="/debts" icon={CreditCard}>Debts</NavLink>
          </NavSection>

          <NavSection title="Family">
            <NavLink to="/members" icon={Users}>Members</NavLink>
            <NavLink to="/accounts" icon={CreditCard}>Shared Accounts</NavLink>
          </NavSection>

          {preferences.isAdmin && (
            <NavSection title="Administration">
              <NavLink to="/admin" icon={ShieldCheck}>Admin Panel</NavLink>
            </NavSection>
          )}
        </nav>
        
        <div className={`
          p-4 border-t border-gray-100 dark:border-gray-700 
          bg-gray-50 dark:bg-gray-800/50 space-y-1
        `}>
          <NavLink to="/settings" icon={Settings}>Settings</NavLink>
          <NavLink to="/help" icon={HelpCircle}>Help & Support</NavLink>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose} 
          className="md:hidden absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X />
        </Button>
      </aside>
    </>
  );
};