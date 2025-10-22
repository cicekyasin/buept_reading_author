

import { useState, useEffect, useCallback } from 'react';
import type { CreditSystemMode } from '../types';

// --- LOCAL STORAGE KEYS ---
const LOCAL_STORAGE_KEY_SIMPLE = 'fled-credits-simple';
const LOCAL_STORAGE_KEY_COMPLEX = 'fled-credits-complex';

// --- SYSTEM CONFIGS ---
const SIMPLE_SYSTEM_CONFIG = {
  DAILY_LIMIT: 5,
  COSTS: {
    lessonPlan: 2,
    buept: 1,
  },
};

const COMPLEX_SYSTEM_CONFIG = {
  LESSON_PLAN_DAILY_LIMIT: 2,
  BUEPT_COOLDOWN_MS: 72 * 60 * 60 * 1000, // 3 days in milliseconds
};

// --- DATA STRUCTURES ---
type SimpleCreditData = {
  credits: number;
  lastResetTimestamp: number; 
};

type ComplexCreditData = {
  lessonPlan: {
    count: number;
    lastResetTimestamp: number;
  };
  bueptReading1: {
    lastUsedTimestamp: number;
  };
  bueptReading2: {
    lastUsedTimestamp: number; 
  };
};

// --- HELPER ---
const isSameDay = (ts1: number, ts2: number) => {
    const d1 = new Date(ts1);
    const d2 = new Date(ts2);
    return d1.getUTCFullYear() === d2.getUTCFullYear() &&
           d1.getUTCMonth() === d2.getUTCMonth() &&
           d1.getUTCDate() === d2.getUTCDate();
};

export const useCredits = (isDevMode = false, systemMode: CreditSystemMode = 'simple') => {
  const [credits, setCredits] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const initialize = useCallback(() => {
    setIsLoading(true);
    const now = Date.now();
    
    if (systemMode === 'simple') {
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY_SIMPLE);
        if (saved) {
          const data: SimpleCreditData = JSON.parse(saved);
          if (isSameDay(data.lastResetTimestamp, now)) {
            setCredits({
              system: 'simple',
              shared: data.credits,
              limits: { daily: SIMPLE_SYSTEM_CONFIG.DAILY_LIMIT },
              costs: SIMPLE_SYSTEM_CONFIG.COSTS,
            });
            setIsLoading(false);
            return;
          }
        }
      } catch (e) { console.error(e); }
      // Default or reset
      const initialData = { credits: SIMPLE_SYSTEM_CONFIG.DAILY_LIMIT, lastResetTimestamp: now };
      localStorage.setItem(LOCAL_STORAGE_KEY_SIMPLE, JSON.stringify(initialData));
      setCredits({ 
        system: 'simple', 
        shared: initialData.credits, 
        limits: { daily: SIMPLE_SYSTEM_CONFIG.DAILY_LIMIT },
        costs: SIMPLE_SYSTEM_CONFIG.COSTS
      });
    } 
    
    else if (systemMode === 'complex') {
        let data: ComplexCreditData | null = null;
        try {
            const saved = localStorage.getItem(LOCAL_STORAGE_KEY_COMPLEX);
            if (saved) data = JSON.parse(saved);
        } catch(e) { console.error(e); }

        // Lesson Plan credits (reset daily)
        const lessonPlanCreditsUsed = (data?.lessonPlan && isSameDay(data.lessonPlan.lastResetTimestamp, now)) 
            ? data.lessonPlan.count 
            : 0;
        
        // BUEPT R1 cooldown check
        const r1LastUsed = data?.bueptReading1?.lastUsedTimestamp || 0;
        const r1Available = now - r1LastUsed > COMPLEX_SYSTEM_CONFIG.BUEPT_COOLDOWN_MS;
        
        // BUEPT R2 cooldown check
        const r2LastUsed = data?.bueptReading2?.lastUsedTimestamp || 0;
        const r2Available = now - r2LastUsed > COMPLEX_SYSTEM_CONFIG.BUEPT_COOLDOWN_MS;

        setCredits({
            system: 'complex',
            lessonPlan: {
                remaining: COMPLEX_SYSTEM_CONFIG.LESSON_PLAN_DAILY_LIMIT - lessonPlanCreditsUsed,
                total: COMPLEX_SYSTEM_CONFIG.LESSON_PLAN_DAILY_LIMIT,
            },
            bueptReading1: {
                available: r1Available,
                cooldownEndsTimestamp: r1LastUsed + COMPLEX_SYSTEM_CONFIG.BUEPT_COOLDOWN_MS,
            },
            bueptReading2: {
                available: r2Available,
                cooldownEndsTimestamp: r2LastUsed + COMPLEX_SYSTEM_CONFIG.BUEPT_COOLDOWN_MS,
            }
        });
    }
    setIsLoading(false);
  }, [systemMode]);

  useEffect(() => {
    if (isDevMode) {
      setCredits({
        system: 'dev',
        shared: 999,
        lessonPlan: { remaining: 999, total: 999 },
        bueptReading1: { available: true, cooldownEndsTimestamp: 0 },
        bueptReading2: { available: true, cooldownEndsTimestamp: 0 },
        limits: { daily: 999 },
        costs: { lessonPlan: 0, buept: 0 },
      });
      setIsLoading(false);
    } else {
      initialize();
    }
  }, [isDevMode, systemMode, initialize]);

  const deductCredits = useCallback((type: 'lessonPlan' | 'bueptReading1' | 'bueptReading2') => {
    if (isDevMode) return;

    const now = Date.now();
    
    if (systemMode === 'simple') {
      const cost = type === 'lessonPlan' ? SIMPLE_SYSTEM_CONFIG.COSTS.lessonPlan : SIMPLE_SYSTEM_CONFIG.COSTS.buept;
      setCredits((prev: any) => {
        const newCredits = Math.max(0, prev.shared - cost);
        localStorage.setItem(LOCAL_STORAGE_KEY_SIMPLE, JSON.stringify({ credits: newCredits, lastResetTimestamp: now }));
        return { ...prev, shared: newCredits };
      });
    } 
    
    else if (systemMode === 'complex') {
        let data: ComplexCreditData;
        try {
            const saved = localStorage.getItem(LOCAL_STORAGE_KEY_COMPLEX);
            data = saved ? JSON.parse(saved) : {
                lessonPlan: { count: 0, lastResetTimestamp: 0 },
                bueptReading1: { lastUsedTimestamp: 0 },
                bueptReading2: { lastUsedTimestamp: 0 },
            };
        } catch(e) {
            console.error(e);
            return;
        }

        if (type === 'lessonPlan') {
            if (!isSameDay(data.lessonPlan.lastResetTimestamp, now)) {
                data.lessonPlan.count = 0;
                data.lessonPlan.lastResetTimestamp = now;
            }
            data.lessonPlan.count += 1;
        } else if (type === 'bueptReading1') {
            data.bueptReading1.lastUsedTimestamp = now;
        } else if (type === 'bueptReading2') {
            data.bueptReading2.lastUsedTimestamp = now;
        }
        
        localStorage.setItem(LOCAL_STORAGE_KEY_COMPLEX, JSON.stringify(data));
        initialize(); // Re-read and update state from storage
    }
  }, [isDevMode, systemMode, initialize]);

  return { credits, deductCredits, isLoading };
};