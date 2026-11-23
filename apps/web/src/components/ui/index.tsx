import { useEffect, useId, useRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

const joinClassNames = (...classNames: readonly (string | false | null | undefined)[]): string =>
  classNames.filter(Boolean).join(' ');

export interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  readonly variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  readonly size?: 'normal' | 'compact';
}

export const Button = ({
  className,
  variant = 'primary',
  size = 'normal',
  type = 'button',
  ...props
}: ButtonProps): JSX.Element => (
  <button
    className={joinClassNames('ui-button', `ui-button--${variant}`, `ui-button--${size}`, className)}
    type={type}
    {...props}
  />
);

export interface FieldProps {
  readonly label: string;
  readonly description?: string;
  readonly error?: string;
  readonly inputProps?: ComponentPropsWithoutRef<'input'>;
}

export const Field = ({ label, description, error, inputProps }: FieldProps): JSX.Element => {
  const generatedId = useId();
  const { className, id, ...safeInputProps } = inputProps ?? {};
  const inputId = id ?? generatedId;
  const descriptionId = `${inputId}-description`;
  const errorId = `${inputId}-error`;
  const describedBy = [
    description === undefined ? undefined : descriptionId,
    error === undefined ? undefined : errorId,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="ui-field">
      <label className="ui-field__label" htmlFor={inputId}>
        {label}
      </label>
      <input
        {...safeInputProps}
        aria-describedby={describedBy === '' ? undefined : describedBy}
        aria-invalid={error === undefined ? undefined : true}
        className={joinClassNames('ui-field__control', className)}
        id={inputId}
      />
      {description === undefined ? null : (
        <p className="ui-field__help" id={descriptionId}>
          {description}
        </p>
      )}
      {error === undefined ? null : (
        <p className="ui-field__error" id={errorId}>
          {error}
        </p>
      )}
    </div>
  );
};

export interface AlertProps {
  readonly children: ReactNode;
  readonly title?: string;
  readonly tone?: Tone;
}

export const Alert = ({ children, title, tone = 'info' }: AlertProps): JSX.Element => (
  <div className={joinClassNames('ui-alert', `ui-alert--${tone}`)} role="status">
    {title === undefined ? null : <strong>{title}</strong>}
    <div>{children}</div>
  </div>
);

export interface TagProps {
  readonly children: ReactNode;
  readonly tone?: Tone;
}

export const Tag = ({ children, tone = 'neutral' }: TagProps): JSX.Element => (
  <span className={joinClassNames('ui-tag', `ui-tag--${tone}`)}>{children}</span>
);

export interface CardProps extends Omit<ComponentPropsWithoutRef<'section'>, 'title'> {
  readonly title?: string;
}

export const Card = ({ children, className, title, ...props }: CardProps): JSX.Element => (
  <section className={joinClassNames('ui-card', className)} {...props}>
    {title === undefined ? null : <h3>{title}</h3>}
    {children}
  </section>
);

export interface TableProps {
  readonly caption: string;
  readonly headers: readonly string[];
  readonly rows: readonly (readonly ReactNode[])[];
}

export const Table = ({ caption, headers, rows }: TableProps): JSX.Element => (
  <div className="ui-table-wrap">
    <table className="ui-table">
      <caption>{caption}</caption>
      <thead>
        <tr>
          {headers.map((header) => (
            <th key={header} scope="col">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={`row-${rowIndex.toString()}`}>
            {row.map((cell, cellIndex) => (
              <td key={`cell-${rowIndex.toString()}-${cellIndex.toString()}`}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export interface ToastMessage {
  readonly id: string;
  readonly title: string;
  readonly message: string;
  readonly tone?: Tone;
}

export interface ToastProps {
  readonly messages: readonly ToastMessage[];
}

export const Toast = ({ messages }: ToastProps): JSX.Element => (
  <div className="ui-toast-region" aria-live="polite" aria-relevant="additions text">
    {messages.map((message) => (
      <div
        className={joinClassNames('ui-toast', `ui-toast--${message.tone ?? 'info'}`)}
        key={message.id}
        role="status"
      >
        <strong>{message.title}</strong>
        <span>{message.message}</span>
      </div>
    ))}
  </div>
);

export interface DialogProps {
  readonly children: ReactNode;
  readonly isOpen: boolean;
  readonly title: string;
  readonly onClose: () => void;
}

export const Dialog = ({ children, isOpen, title, onClose }: DialogProps): JSX.Element | null => {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousActiveElement = document.activeElement;
    const dialogElement = dialogRef.current;
    const focusableElements = dialogElement?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), ' +
        'textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    focusableElements?.[0]?.focus();

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key !== 'Tab' || focusableElements === undefined || focusableElements.length === 0) {
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      }

      if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (previousActiveElement instanceof HTMLElement) {
        previousActiveElement.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div className="ui-dialog-backdrop" role="presentation">
      <div
        aria-labelledby={titleId}
        aria-modal="true"
        className="ui-dialog"
        ref={dialogRef}
        role="dialog"
      >
        <div className="ui-dialog__header">
          <h2 id={titleId}>{title}</h2>
          <Button aria-label="Close dialog" onClick={onClose} variant="ghost">
            X
          </Button>
        </div>
        <div className="ui-dialog__body">{children}</div>
      </div>
    </div>,
    document.body,
  );
};

export interface MetricCardProps {
  readonly label: string;
  readonly value: string;
  readonly detail: string;
  readonly tone?: Tone;
}

export const MetricCard = ({
  detail,
  label,
  tone = 'neutral',
  value,
}: MetricCardProps): JSX.Element => (
  <section className={joinClassNames('ui-metric', `ui-metric--${tone}`)}>
    <span>{label}</span>
    <strong>{value}</strong>
    <p>{detail}</p>
  </section>
);

export interface TimelineItem {
  readonly id: string;
  readonly title: string;
  readonly detail: string;
  readonly time: string;
}

export interface TimelineProps {
  readonly items: readonly TimelineItem[];
}

export const Timeline = ({ items }: TimelineProps): JSX.Element => (
  <ol className="ui-timeline">
    {items.map((item) => (
      <li key={item.id}>
        <time>{item.time}</time>
        <strong>{item.title}</strong>
        <p>{item.detail}</p>
      </li>
    ))}
  </ol>
);

export interface LoadingStateProps {
  readonly label: string;
}

export const LoadingState = ({ label }: LoadingStateProps): JSX.Element => (
  <div className="ui-loading" role="status">
    <span aria-hidden="true" />
    <p>{label}</p>
  </div>
);
