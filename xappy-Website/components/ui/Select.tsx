'use client';

import * as SelectPrimitive from '@radix-ui/react-select';
import { forwardRef } from 'react';
import { cn } from '@/lib/cn';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  error?: string;
  id?: string;
  name?: string;
  className?: string;
}

const Select = forwardRef<HTMLButtonElement, SelectProps>(
  ({ options, value, onValueChange, placeholder, label, required, error, id, name, className }, ref) => {
    return (
      <div className="form-group">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-text-dark mb-2"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <SelectPrimitive.Root value={value} onValueChange={onValueChange} name={name}>
          <SelectPrimitive.Trigger
            ref={ref}
            id={id}
            className={cn(
              'form-control flex items-center justify-between',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
              className
            )}
          >
            <SelectPrimitive.Value placeholder={placeholder} />
            <SelectPrimitive.Icon>
              <i className="ri-arrow-down-s-line text-text-muted"></i>
            </SelectPrimitive.Icon>
          </SelectPrimitive.Trigger>
          <SelectPrimitive.Portal>
            <SelectPrimitive.Content
              className="overflow-hidden bg-white rounded-xl shadow-lg border border-border z-50"
              position="popper"
              sideOffset={5}
            >
              <SelectPrimitive.Viewport className="p-2">
                {options
                  .filter((option) => option.value !== '')
                  .map((option) => (
                    <SelectPrimitive.Item
                      key={option.value}
                      value={option.value}
                      className="relative flex items-center px-4 py-2 rounded-lg text-sm text-text-dark cursor-pointer hover:bg-primary-blue/5 focus:bg-primary-blue/5 focus:outline-none data-[highlighted]:bg-primary-blue/5"
                    >
                      <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                      <SelectPrimitive.ItemIndicator className="absolute right-2">
                        <i className="ri-check-line text-primary-blue"></i>
                      </SelectPrimitive.ItemIndicator>
                    </SelectPrimitive.Item>
                  ))}
              </SelectPrimitive.Viewport>
            </SelectPrimitive.Content>
          </SelectPrimitive.Portal>
        </SelectPrimitive.Root>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';

export { Select };
