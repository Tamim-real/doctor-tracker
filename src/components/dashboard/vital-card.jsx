'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CountUp } from './dashboard-helpers';

export function VitalCard({ label, value, decimals = 0, icon: Icon, accentColor, bgColor, suffix }) {
  return (
    <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <div className="mt-2 font-mono text-3xl font-semibold text-foreground">
            <CountUp value={value} decimals={decimals} />
            {suffix && <span className="font-sans text-sm text-muted-foreground ml-1">{suffix}</span>}
          </div>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${bgColor} ${accentColor}`}>
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
      </CardContent>
    </Card>
  );
}

export function VitalCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6 flex items-center justify-between">
        <div className="space-y-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton className="h-12 w-12 rounded-xl" />
      </CardContent>
    </Card>
  );
}