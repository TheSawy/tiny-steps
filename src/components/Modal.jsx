// ============================================================
// MODAL
// ============================================================
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div style={S.modal} onClick={onClose}>
      <div style={S.modalC} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>{title}</h3>
          <button style={{ ...S.btn("ghost"), padding: 8 }} onClick={onClose}><Icon name="x" size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
};

// ============================================================
// NEXT WINDOW BADGE (Gentle — no alarming red for parents)
// ============================================================
