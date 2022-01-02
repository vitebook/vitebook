function Button({ disabled = false }) {
  return <button disabled={disabled}>Click Me</button>;
}

Button.displayName = 'Button';

export default Button;
