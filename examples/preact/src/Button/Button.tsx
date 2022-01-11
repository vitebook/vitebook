import type { ComponentChildren } from 'preact';

export type ButtonProps = {
  disabled?: boolean;
  onClick?: (event: Event) => void;
  children: ComponentChildren;
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
