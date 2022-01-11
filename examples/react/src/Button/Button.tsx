import type { MouseEventHandler, ReactNode } from 'react';

export type ButtonProps = {
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  children: ReactNode;
};

function Button({ disabled = false, onClick, children }: ButtonProps) {
  return (
    <button disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}

Button.displayName = 'Button';

export default Button;
