import { useMemo, useState, useLayoutEffect, useCallback, useRef } from 'react';
import type { MobileWizardStepDef } from './types';

export function useWizardNavigation<TCtx>(
  steps: MobileWizardStepDef<TCtx>[],
  ctx: TCtx,
  resetKey?: string | number,
) {
  const visibleSteps = useMemo(
    () => steps.filter((s) => s.visible(ctx)),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- steps identity from parent; ctx drives visibility
    [steps, ctx],
  );

  const visibleStepsRef = useRef(visibleSteps);
  visibleStepsRef.current = visibleSteps;

  const stableStepIdRef = useRef<string>('');
  const lastResetKeyRef = useRef<typeof resetKey | undefined>(undefined);

  const [stepIndex, setStepIndexRaw] = useState(0);

  const visibleSignature = useMemo(
    () => visibleSteps.map((s) => s.id).join('|'),
    [visibleSteps],
  );

  const setStepIndex = useCallback((value: number | ((prev: number) => number)) => {
    setStepIndexRaw((prev) => {
      const next = typeof value === 'function' ? value(prev) : value;
      const vs = visibleStepsRef.current;
      if (vs.length === 0) return 0;
      const clamped = Math.max(0, Math.min(vs.length - 1, next));
      const step = vs[clamped];
      if (step) stableStepIdRef.current = step.id;
      return clamped;
    });
  }, []);

  useLayoutEffect(() => {
    const vs = visibleStepsRef.current;
    if (vs.length === 0) return;

    const resetChanged = lastResetKeyRef.current !== resetKey;
    if (resetChanged) {
      lastResetKeyRef.current = resetKey;
      stableStepIdRef.current = vs[0]?.id ?? '';
      setStepIndexRaw(0);
      return;
    }

    const id = stableStepIdRef.current;
    if (!id) {
      const first = vs[0];
      if (first) {
        stableStepIdRef.current = first.id;
        setStepIndexRaw(0);
      }
      return;
    }

    const ni = vs.findIndex((s) => s.id === id);
    if (ni >= 0) {
      setStepIndexRaw((prev) => (prev !== ni ? ni : prev));
      return;
    }

    setStepIndexRaw((prev) => {
      const clamped = Math.min(prev, vs.length - 1);
      const step = vs[clamped];
      if (step) stableStepIdRef.current = step.id;
      return clamped;
    });
  }, [visibleSignature, resetKey]);

  const safeIndex =
    visibleSteps.length === 0
      ? 0
      : Math.min(Math.max(0, stepIndex), visibleSteps.length - 1);
  const current = visibleSteps.length > 0 ? visibleSteps[safeIndex] : undefined;
  const visibleCount = visibleSteps.length;
  const isLastStep = visibleCount === 0 ? true : safeIndex >= visibleCount - 1;

  const progressStepIndex = useMemo(() => {
    if (!current) return 0;
    const i = steps.findIndex((s) => s.id === current.id);
    return i >= 0 ? i : 0;
  }, [steps, current]);

  const progressTotal = steps.length;

  const goBack = useCallback(() => {
    setStepIndex((i) => Math.max(0, i - 1));
  }, [setStepIndex]);

  const goNext = useCallback(() => {
    setStepIndex((i) => Math.min(visibleStepsRef.current.length - 1, i + 1));
  }, [setStepIndex]);

  const goToStep = useCallback(
    (index: number) => {
      setStepIndex(index);
    },
    [setStepIndex],
  );

  return {
    visibleSteps,
    currentStep: current,
    stepIndex: safeIndex,
    totalSteps: visibleCount,
    progressStepIndex,
    progressTotal,
    isLastStep,
    goBack,
    goNext,
    goToStep,
    setStepIndex,
  };
}
