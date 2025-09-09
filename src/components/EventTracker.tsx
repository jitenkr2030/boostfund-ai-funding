"use client";

import { useEffect } from 'react';

interface EventPayload {
  event: string;
  id: string | null;
  path: string;
  ts: number;
}

export const EventTracker = () => {
  useEffect(() => {
    const handleClick = async (event: MouseEvent) => {
      try {
        const target = event.target as HTMLElement;
        const element = target.closest('[data-evt]') as HTMLElement | null;
        
        if (!element) return;
        
        const evt = element.getAttribute('data-evt');
        if (!evt) return;
        
        const id = element.getAttribute('data-id');
        const payload: EventPayload = {
          event: evt,
          id,
          path: window.location.pathname,
          ts: Date.now()
        };

        const token = localStorage.getItem('bearer_token') || '';
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        } as Record<string, string>;

        const url = '/api/analytics';

        if (navigator.sendBeacon) {
          const beaconBlob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
          navigator.sendBeacon(url, beaconBlob);
        } else {
          fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
            keepalive: true
          });
        }
      } catch (error) {
        // Silently swallow errors for resilience
      }
    };

    document.addEventListener('click', handleClick, { capture: true });

    return () => {
      document.removeEventListener('click', handleClick, { capture: true });
    };
  }, []);

  return null;
};