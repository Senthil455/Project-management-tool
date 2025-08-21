import Modal from './Modal.jsx';

export default function ConfirmDialog({ title, message, confirmLabel = 'Delete', onConfirm, onCancel, danger = true }) {
  return (
    <Modal title={title} onClose={onCancel} width={420}>
      <p className="confirm-message">{message}</p>
      <div className="confirm-actions">
        <button className="btn" onClick={onCancel}>
          Cancel
        </button>
        <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}