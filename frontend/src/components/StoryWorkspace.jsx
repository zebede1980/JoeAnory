import React, { useState, useEffect, useRef } from 'react';
import { getStory, updateStory, generateChunk, attachCard, detachCard, editSegment, deleteSegment, getCards } from '../api';

const styles = {
  workspace: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  topBar: { padding: '12px 16px', borderBottom: '1px solid #0f3460', display: 'flex', gap: 12, alignItems: 'center', background: '#16213e' },
  titleInput: { flex: 1, background: '#0f3460', border: '1px solid #1a1a2e', borderRadius: 6, padding: '8px 12px', color: '#fff', fontSize: 16, fontWeight: 600 },
  synopsisBox: { padding: 12, borderBottom: '1px solid #0f3460', background: '#16213e' },
  synopsisLabel: { fontSize: 12, color: '#e94560', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 },
  synopsisTextarea: { width: '100%', minHeight: 80, background: '#0f3460', border: '1px solid #1a1a2e', borderRadius: 6, padding: 10, color: '#ddd', fontSize: 13, resize: 'vertical', fontFamily: 'inherit' },
  storyArea: { flex: 1, overflowY: 'auto', padding: 20, background: '#1a1a2e' },
  segment: { marginBottom: 16, padding: 14, background: '#16213e', borderRadius: 8, borderLeft: '3px solid #e94560', position: 'relative' },
  summarySegment: { borderLeftColor: '#f9a825', opacity: 0.85 },
  segmentContent: { fontSize: 15, lineHeight: 1.7, color: '#e0e0e0' },
  segmentParagraph: { margin: '0 0 1em 0' },
  segmentActions: { display: 'flex', gap: 8, marginTop: 8, justifyContent: 'flex-end' },
  segBtn: { padding: '4px 10px', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12, background: '#0f3460', color: '#fff' },
  editTextarea: { width: '100%', minHeight: 120, background: '#0f3460', border: '1px solid #e94560', borderRadius: 6, padding: 10, color: '#fff', fontSize: 14, fontFamily: 'inherit' },
  controls: { padding: 16, borderTop: '1px solid #0f3460', background: '#16213e', display: 'flex', flexDirection: 'column', gap: 10 },
  steeringRow: { display: 'flex', gap: 10, alignItems: 'center' },
  steeringInput: { flex: 1, background: '#0f3460', border: '1px solid #1a1a2e', borderRadius: 6, padding: '10px 12px', color: '#fff', fontSize: 14 },
  genBtn: { padding: '10px 20px', border: 'none', borderRadius: 6, background: '#e94560', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 14 },
  genBtnDisabled: { opacity: 0.5, cursor: 'not-allowed' },
  streamingText: { padding: 14, background: '#0f3460', borderRadius: 8, fontSize: 15, lineHeight: 1.7, color: '#e0e0e0', minHeight: 60, border: '1px dashed #e94560' },
  cardsRow: { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' },
  cardTag: { padding: '4px 10px', background: '#0f3460', borderRadius: 12, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 },
  cardRemove: { background: 'transparent', border: 'none', color: '#e94560', cursor: 'pointer', fontSize: 14 },
  addCardSelect: { background: '#0f3460', border: '1px solid #1a1a2e', borderRadius: 6, padding: '6px 10px', color: '#fff', fontSize: 13 },
  emptyState: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#888', fontSize: 16 },
};

export default function StoryWorkspace({ storyId, setActiveStoryId }) {
  const [story, setStory] = useState(null);
  const [allCards, setAllCards] = useState([]);
  const [steering, setSteering] = useState('');
  const [generating, setGenerating] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [editingSegmentId, setEditingSegmentId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const storyAreaRef = useRef(null);

  const renderParagraphs = (text, containerStyle) => {
    const paragraphs = text.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
    if (paragraphs.length === 0) return <div style={containerStyle}>{text}</div>;
    return (
      <div style={containerStyle}>
        {paragraphs.map((p, i) => (
          <p key={i} style={styles.segmentParagraph}>{p.replace(/\n/g, ' ')}</p>
        ))}
      </div>
    );
  };

  const loadStory = async () => {
    if (!storyId) return;
    try {
      const res = await getStory(storyId);
      setStory(res.data);
    } catch (e) { console.error(e); }
  };

  const loadCards = async () => {
    try {
      const res = await getCards();
      setAllCards(res.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { loadStory(); loadCards(); }, [storyId]);

  useEffect(() => {
    if (storyAreaRef.current) {
      storyAreaRef.current.scrollTop = storyAreaRef.current.scrollHeight;
    }
  }, [story?.segments, streamingContent]);

  const handleUpdateTitle = async (title) => {
    if (!story) return;
    try {
      await updateStory(story.id, { title, synopsis: story.synopsis });
      setStory({ ...story, title });
    } catch (e) { console.error(e); }
  };

  const handleUpdateSynopsis = async (synopsis) => {
    if (!story) return;
    try {
      await updateStory(story.id, { title: story.title, synopsis });
      setStory({ ...story, synopsis });
    } catch (e) { console.error(e); }
  };

  const handleAttachCard = async (e) => {
    const cardId = parseInt(e.target.value);
    if (!cardId || !story) return;
    try {
      await attachCard(story.id, cardId);
      loadStory();
    } catch (e) { alert('Failed to attach card'); }
  };

  const handleDetachCard = async (cardId) => {
    if (!story) return;
    try {
      await detachCard(story.id, cardId);
      loadStory();
    } catch (e) { alert('Failed to detach card'); }
  };

  const handleGenerate = async () => {
    if (!story || generating) return;
    setGenerating(true);
    setStreamingContent('');
    try {
      const response = await generateChunk(story.id, steering || null);
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'chunk') {
                setStreamingContent(prev => prev + data.content);
              } else if (data.type === 'done') {
                setStreamingContent('');
                loadStory();
              } else if (data.type === 'error') {
                alert('Generation error: ' + data.message);
              }
            } catch (e) {}
          }
        }
      }
    } catch (e) {
      alert('Generation failed: ' + e.message);
    } finally {
      setGenerating(false);
      setSteering('');
    }
  };

  const handleEditSegment = (seg) => {
    setEditingSegmentId(seg.id);
    setEditContent(seg.content);
  };

  const handleSaveEdit = async (segmentId) => {
    if (!story) return;
    try {
      await editSegment(story.id, segmentId, editContent);
      setEditingSegmentId(null);
      loadStory();
    } catch (e) { alert('Failed to save edit'); }
  };

  const handleDeleteSegment = async (segmentId) => {
    if (!story || !confirm('Delete this segment?')) return;
    try {
      await deleteSegment(story.id, segmentId);
      loadStory();
    } catch (e) { alert('Failed to delete segment'); }
  };

  if (!storyId) {
    return <div style={styles.emptyState}>Select or create a story to begin</div>;
  }

  if (!story) {
    return <div style={styles.emptyState}>Loading...</div>;
  }

  const attachedCardIds = new Set(story.cards.map(sc => sc.card_id));
  const availableCards = allCards.filter(c => !attachedCardIds.has(c.id));

  return (
    <div style={styles.workspace}>
      <div style={styles.topBar}>
        <input
          style={styles.titleInput}
          value={story.title}
          onChange={(e) => handleUpdateTitle(e.target.value)}
          onBlur={() => {}}
        />
        <div style={styles.cardsRow}>
          {story.cards.map(sc => (
            <span key={sc.card_id} style={styles.cardTag}>
              {sc.card.name}
              <button style={styles.cardRemove} onClick={() => handleDetachCard(sc.card_id)}>×</button>
            </span>
          ))}
          {availableCards.length > 0 && (
            <select style={styles.addCardSelect} value="" onChange={handleAttachCard}>
              <option value="">+ Add card</option>
              {availableCards.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div style={styles.synopsisBox}>
        <div style={styles.synopsisLabel}>Synopsis / Memo</div>
        <textarea
          style={styles.synopsisTextarea}
          value={story.synopsis}
          onChange={(e) => handleUpdateSynopsis(e.target.value)}
          placeholder="Map out your story premise, plot points, worldbuilding notes..."
        />
      </div>

      <div style={styles.storyArea} ref={storyAreaRef}>
        {story.segments.map(seg => (
          <div key={seg.id} style={{ ...styles.segment, ...(seg.is_summary ? styles.summarySegment : {}) }}>
            {editingSegmentId === seg.id ? (
              <>
                <textarea style={styles.editTextarea} value={editContent} onChange={(e) => setEditContent(e.target.value)} />
                <div style={styles.segmentActions}>
                  <button style={styles.segBtn} onClick={() => handleSaveEdit(seg.id)}>Save</button>
                  <button style={styles.segBtn} onClick={() => setEditingSegmentId(null)}>Cancel</button>
                </div>
              </>
            ) : (
              <>
                {renderParagraphs(seg.content, styles.segmentContent)}
                {!seg.is_summary && (
                  <div style={styles.segmentActions}>
                    <button style={styles.segBtn} onClick={() => handleEditSegment(seg)}>Edit</button>
                    <button style={styles.segBtn} onClick={() => handleDeleteSegment(seg.id)}>Delete</button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
        {streamingContent && (
          {renderParagraphs(streamingContent, styles.streamingText)}
        )}
      </div>

      <div style={styles.controls}>
        <div style={styles.steeringRow}>
          <input
            style={styles.steeringInput}
            value={steering}
            onChange={(e) => setSteering(e.target.value)}
            placeholder="Steer the story (e.g., 'Make the villain reveal their true motive')..."
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGenerate(); } }}
          />
          <button
            style={{ ...styles.genBtn, ...(generating ? styles.genBtnDisabled : {}) }}
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? 'Generating...' : 'Generate Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
