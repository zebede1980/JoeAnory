import React, { useState, useEffect } from 'react';
import { getCards, uploadCard, deleteCard } from '../api';

const styles = {
  container: { padding: 24, overflowY: 'auto', flex: 1 },
  header: { fontSize: 22, fontWeight: 600, marginBottom: 20, color: '#e94560' },
  uploadArea: { border: '2px dashed #0f3460', borderRadius: 12, padding: 32, textAlign: 'center', marginBottom: 24, cursor: 'pointer', background: '#16213e' },
  uploadText: { color: '#888', fontSize: 14 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 },
  card: { background: '#16213e', borderRadius: 10, overflow: 'hidden', border: '1px solid #0f3460', display: 'flex', flexDirection: 'column' },
  cardImage: { width: '100%', height: 260, objectFit: 'cover', background: '#0f3460' },
  cardBody: { padding: 12, flex: 1, display: 'flex', flexDirection: 'column', gap: 6 },
  cardName: { fontSize: 15, fontWeight: 600, color: '#fff' },
  cardMeta: { fontSize: 12, color: '#888' },
  cardDesc: { fontSize: 12, color: '#bbb', lineHeight: 1.4, maxHeight: 60, overflow: 'hidden' },
  cardActions: { display: 'flex', gap: 8, padding: 12, borderTop: '1px solid #0f3460' },
  btn: { flex: 1, padding: '8px 0', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500 },
  btnDelete: { background: '#e94560', color: '#fff' },
  empty: { textAlign: 'center', color: '#888', padding: 40 },
};

export default function CardsManager() {
  const [cards, setCards] = useState([]);
  const [dragOver, setDragOver] = useState(false);

  const loadCards = async () => {
    try {
      const res = await getCards();
      setCards(res.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { loadCards(); }, []);

  const handleFile = async (file) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a PNG image');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    try {
      await uploadCard(formData);
      loadCards();
    } catch (e) {
      alert('Failed to upload card: ' + (e.response?.data?.detail || e.message));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this card?')) return;
    try {
      await deleteCard(id);
      loadCards();
    } catch (e) { alert('Failed to delete card'); }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>Character Cards</div>
      <div
        style={{ ...styles.uploadArea, borderColor: dragOver ? '#e94560' : '#0f3460' }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById('card-upload').click()}
      >
        <div style={styles.uploadText}>Drop a SillyTavern PNG card here, or click to browse</div>
        <input id="card-upload" type="file" accept="image/png" style={{ display: 'none' }} onChange={handleInputChange} />
      </div>

      {cards.length === 0 && <div style={styles.empty}>No cards uploaded yet</div>}
      <div style={styles.grid}>
        {cards.map(card => (
          <div key={card.id} style={styles.card}>
            {card.image_path && (
              <img src={`/uploads/${card.image_path.replace('uploads/', '')}`} alt={card.name} style={styles.cardImage} />
            )}
            <div style={styles.cardBody}>
              <div style={styles.cardName}>{card.name}</div>
              <div style={styles.cardMeta}>{card.creator || 'Unknown creator'}</div>
              <div style={styles.cardDesc}>{card.description}</div>
            </div>
            <div style={styles.cardActions}>
              <button style={{ ...styles.btn, ...styles.btnDelete }} onClick={() => handleDelete(card.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
