import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useEvent } from '../../contexts/EventContext';
import Card from '../shared/Card';

/**
 * PollCard — visualizzazione sondaggio, voto e risultati.
 * TODO tecnico: Per eventi molto grandi o uso open source scalabile,
 * valutare migrazione dei votes in subcollection events/{eventId}/polls/{pollId}/votes/{userId}
 */
export default function PollCard({ poll }) {
  const { user } = useAuth();
  const { isEventAdmin } = useEvent();
  const { updatePoll, deletePoll, votePoll, addItem } = useEvent();
  
  const [editing, setEditing] = useState(false);
  const [transformingOption, setTransformingOption] = useState(null);
  const [transformCategory, setTransformCategory] = useState('foodItems');

  const votesMap = poll.votes || {};
  const totalVoters = Object.keys(votesMap).length;
  const myVote = user ? votesMap[user.uid] : null;

  // Calculate votes per option
  const optionCounts = {};
  poll.options.forEach(opt => {
    optionCounts[opt.id] = 0;
  });
  
  Object.values(votesMap).forEach(vote => {
    vote.selectedOptionIds?.forEach(optId => {
      if (optionCounts[optId] !== undefined) {
        optionCounts[optId]++;
      }
    });
  });

  const canManage = user && (isEventAdmin || poll.createdBy === user.uid);
  const isOpen = poll.status === 'open';

  const handleVote = async (optionId) => {
    if (!user || !isOpen) return;
    
    let newSelected = [];
    if (poll.multipleChoice) {
      const currentSelected = myVote?.selectedOptionIds || [];
      if (currentSelected.includes(optionId)) {
        newSelected = currentSelected.filter(id => id !== optionId);
      } else {
        newSelected = [...currentSelected, optionId];
      }
    } else {
      newSelected = [optionId];
    }
    
    // Se toglie tutti i voti in un multiple choice, Firebase salva array vuoto, corretto.
    await votePoll(poll.id, user, newSelected);
  };

  const handleClosePoll = async () => {
    if (window.confirm('Chiudere il sondaggio? Non sarà più possibile votare.')) {
      await updatePoll(poll.id, { status: 'closed' });
    }
  };

  const handleReopenPoll = async () => {
    await updatePoll(poll.id, { status: 'open' });
  };

  const handleDelete = async () => {
    if (window.confirm('Eliminare definitivamente questo sondaggio?')) {
      await deletePoll(poll.id);
    }
  };

  const handleTransform = async () => {
    if (!transformingOption || !isEventAdmin) return;
    
    await addItem(transformCategory, {
      name: transformingOption.text,
      title: transformingOption.text, // tasks use title
      createdBy: user.uid,
      createdByName: 'Risultato Sondaggio',
    });
    
    alert('Aggiunto con successo!');
    setTransformingOption(null);
  };

  return (
    <Card id={`poll-${poll.id}`} className={`poll-card ${!isOpen ? 'poll-closed' : ''}`}>
      <div className="poll-header">
        <h3 className="poll-question">{poll.question}</h3>
        <span className={`poll-badge ${isOpen ? 'badge-ok' : 'badge-info'}`}>
          {isOpen ? 'Aperto' : 'Chiuso'}
        </span>
      </div>

      <p className="poll-meta">
        Creato da {poll.createdByName} • {poll.multipleChoice ? 'Risposta multipla' : 'Risposta singola'} • {totalVoters} voti
      </p>

      <div className="poll-options">
        {poll.options.map(opt => {
          const count = optionCounts[opt.id] || 0;
          const percentage = totalVoters > 0 ? Math.round((count / totalVoters) * 100) : 0;
          const isSelectedByMe = myVote?.selectedOptionIds?.includes(opt.id);

          return (
            <div 
              key={opt.id} 
              className={`poll-option ${isSelectedByMe ? 'poll-option-selected' : ''} ${!isOpen ? 'poll-option-readonly' : ''}`}
              onClick={() => handleVote(opt.id)}
            >
              <div className="poll-option-bar" style={{ width: `${percentage}%` }} />
              <div className="poll-option-content">
                <div className="poll-option-text">
                  <span className="poll-radio">
                    {poll.multipleChoice ? (isSelectedByMe ? '☑️' : '⬜') : (isSelectedByMe ? '🔘' : '⚪')}
                  </span>
                  {opt.text}
                </div>
                <div className="poll-option-stats">
                  {count} ({percentage}%)
                </div>
              </div>
              
              {!isOpen && isEventAdmin && (
                <button 
                  className="btn btn-sm btn-ghost poll-transform-btn"
                  onClick={(e) => { e.stopPropagation(); setTransformingOption(opt); }}
                  title="Trasforma in elemento della lista"
                >
                  ⚡ Trasforma
                </button>
              )}
            </div>
          );
        })}
      </div>

      {transformingOption && (
        <div className="poll-transform-dialog">
          <strong>Aggiungi "{transformingOption.text}" a:</strong>
          <select 
            className="input input-sm" 
            value={transformCategory} 
            onChange={e => setTransformCategory(e.target.value)}
          >
            <option value="foodItems">Cibo & Bevande</option>
            <option value="gearItems">Attrezzatura</option>
            <option value="tasks">Cose da fare</option>
          </select>
          <div className="add-item-buttons">
            <button className="btn btn-primary btn-sm" onClick={handleTransform}>Conferma</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setTransformingOption(null)}>Annulla</button>
          </div>
        </div>
      )}

      {canManage && (
        <div className="poll-actions admin-actions">
          {isOpen ? (
            <button className="btn btn-sm btn-outline" onClick={handleClosePoll}>🔒 Chiudi sondaggio</button>
          ) : (
            <button className="btn btn-sm btn-ghost" onClick={handleReopenPoll}>🔓 Riapri</button>
          )}
          <button className="btn btn-sm btn-ghost btn-danger" onClick={handleDelete} title="Elimina sondaggio">🗑️</button>
        </div>
      )}
    </Card>
  );
}
