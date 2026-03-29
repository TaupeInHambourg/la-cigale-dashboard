import { useEffect, useMemo, useRef, type ReactNode } from "react";

type AppModalProps = {
  isOpen: boolean;
  titleId: string;
  onClose: () => void;
  children: ReactNode;
  closeOnOverlay?: boolean;
};

export function AppModal({
  isOpen,
  titleId,
  onClose,
  children,
  closeOnOverlay = false,
}: AppModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  const focusableSelector = useMemo(
    () => 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    [],
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    previousFocus.current = document.activeElement as HTMLElement | null;
    const focusables = containerRef.current?.querySelectorAll<HTMLElement>(focusableSelector);
    focusables?.[0]?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab" || !containerRef.current) {
        return;
      }

      const nodes = containerRef.current.querySelectorAll<HTMLElement>(focusableSelector);
      if (nodes.length === 0) {
        return;
      }

      const first = nodes[0];
      const last = nodes[nodes.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previousFocus.current?.focus();
    };
  }, [focusableSelector, isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="modal-overlay"
      onClick={() => {
        if (closeOnOverlay) {
          onClose();
        }
      }}
    >
      <div
        ref={containerRef}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
