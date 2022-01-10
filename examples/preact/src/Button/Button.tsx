function Button({ disabled = false, onClick, children }) {
  return (
    <button disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}

Button.displayName = 'Button';

export default Button;
