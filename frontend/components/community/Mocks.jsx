'use client';
import React, { useEffect, useRef } from 'react';

/* Both mocks are imperative DOM animations. They mount into a ref'd node and
   return their own teardown, so React just owns the lifecycle. The modules are
   loaded lazily — neither is needed for first paint, and the Meet mock in
   particular is a lot of markup. */

export function MeetMock() {
  const ref = useRef(null);

  useEffect(() => {
    let teardown = null;
    let cancelled = false;
    import('@/lib/community/mocks').then(({ initMeetMock }) => {
      if (cancelled || !ref.current) return;
      teardown = initMeetMock(ref.current);
    });
    return () => {
      cancelled = true;
      if (teardown) teardown();
    };
  }, []);

  return (
    <div
      className="meet-mock reveal"
      ref={ref}
      aria-label="A live RPS Cohorts session running on Google Meet"
    />
  );
}

export function WaMock() {
  const ref = useRef(null);

  useEffect(() => {
    let teardown = null;
    let cancelled = false;
    import('@/lib/community/mocks').then(({ initWaMock }) => {
      if (cancelled || !ref.current) return;
      teardown = initWaMock(ref.current);
    });
    return () => {
      cancelled = true;
      if (teardown) teardown();
    };
  }, []);

  return (
    <div
      className="wa-mock"
      ref={ref}
      aria-label="A preview of the WhatsApp group chat, playing on a loop"
    />
  );
}
