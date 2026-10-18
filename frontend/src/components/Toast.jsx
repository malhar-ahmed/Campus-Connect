import "./Toast.css";

function Toast({ message, type, onClose }) {
  if (!message) return null;

  return (
    <div className={`toast toast-${type}`}>
      <span>{message}</span>

      <button type="button" onClick={onClose}>
        ×
      </button>
    </div>
  );
}

export default Toast;