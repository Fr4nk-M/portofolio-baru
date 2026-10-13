// frontend/src/components/Button.jsx
const Button = ({ type = "submit", primary = true, text, disabled = false, onClick, className }) => {
  return (
    <button
      {...(type ? { type } : {})}
      disabled={disabled}
      onClick={onClick}
      className={'button ' + (primary ? 'primary' : 'secondary') + (className ? ` ${className}` : '')}
    >
      <span className="label">{text}</span>
    </button>
  );
};

export default Button;
