import type { ReactNode } from 'react';

/** One wizard step: visibility, validation, and content. Flow logic lives in config arrays only. */
export type MobileWizardStepDef<TCtx> = {
  id: string;
  visible: (ctx: TCtx) => boolean;
  canProceed: (ctx: TCtx) => boolean;
  render: (ctx: TCtx) => ReactNode;
  /** Primary button label for this step */
  nextLabel?: string | ((ctx: TCtx) => string);
  /** When true, WizardShell does not render default footer (use in-step actions). */
  hideFooter?: boolean;
};
