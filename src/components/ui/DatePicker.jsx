'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export function DatePicker({ value, onChange, placeholder = 'Pick a date' }) {
  const selectedDate = value ? new Date(value) : undefined;

  return (
    <div className="relative w-full">
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={`w-full flex items-center justify-between px-3.5 py-2 bg-white rounded-xl border border-slate-200 text-xs font-mono shadow-sm hover:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all ${
              !value ? 'text-slate-400' : 'text-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5 truncate">
              <CalendarIcon className="w-4 h-4 text-teal-600 flex-shrink-0" />
              <span className="truncate">
                {value ? format(selectedDate, 'PPP') : placeholder}
              </span>
            </div>
          </button>
        </PopoverTrigger>

        <PopoverContent
          className="w-auto p-0 rounded-2xl border border-slate-200 shadow-xl bg-white"
          align="start"
        >
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              if (date) {
                // YYYY-MM-DD ফরম্যাটে কনভার্ট করে স্টেট আপডেট করা হচ্ছে
                const formatted = format(date, 'yyyy-MM-dd');
                onChange(formatted);
              } else {
                onChange('');
              }
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {/* Clear Button (যদি কোনো ডেট সিলেক্ট করা থাকে) */}
      {value && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onChange('');
          }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}