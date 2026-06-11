"use client";

import React, { createContext, useContext, useState } from "react";
import { cn } from "../../lib/utils";

interface TabsContextType {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  defaultValue,
  value,
  onValueChange,
  children,
  className,
}) => {
  const [localTab, setLocalTab] = useState(defaultValue);
  const activeTab = value !== undefined ? value : localTab;

  const setActiveTab = (val: string) => {
    if (value === undefined) {
      setLocalTab(val);
    }
    if (onValueChange) {
      onValueChange(val);
    }
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
};

export interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

export const TabsList: React.FC<TabsListProps> = ({ children, className }) => {
  return (
    <div
      className={cn(
        "inline-flex items-center justify-start rounded-lg bg-surface border border-border p-1 text-text-secondary w-full sm:w-auto",
        className
      )}
    >
      {children}
    </div>
  );
};

export interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ value, children, className }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsTrigger must be used within Tabs");

  const isActive = context.activeTab === value;

  return (
    <button
      onClick={() => context.setActiveTab(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 text-text-secondary cursor-pointer",
        {
          "bg-panel text-text-primary shadow border border-border/40": isActive,
          "hover:text-text-primary hover:bg-panel/40": !isActive,
        },
        className
      )}
    >
      {children}
    </button>
  );
};

export interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export const TabsContent: React.FC<TabsContentProps> = ({ value, children, className }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsContent must be used within Tabs");

  const isActive = context.activeTab === value;

  if (!isActive) return null;

  return <div className={cn("mt-4 focus-visible:outline-none", className)}>{children}</div>;
};
