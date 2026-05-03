import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useEvent } from '../../contexts/EventContext';
import PollCard from '../dashboard/PollCard';
import EmptyState from '../shared/EmptyState';

/**
 * SondaggiTab — Visualizza la lista dei sondaggi e permette di crearne di nuovi.
 */
export default function SondaggiTab() {
  const { user } = useAuth();
  const { polls, addPoll } = useEvent();
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState([{ id: 'opt1', text: '' }, { id: 'opt2', text: '' }]);
  const [multipleChoice, setMultipleChoice] = useState(false);

  const handleAddOption = () => {
    setOptions([...options, { id: `opt${Date.now()}`, text: '' }]);
  };

  const handleOptionChange = (id, text) => {
    setOptions(options.map(opt => opt.id === id ? { ...opt, text } : opt));
  };

  const handleRemoveOption = (id) => {
    setOptions(options.filter(opt => opt.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    
    const validOptions = options.filter(o => o.text.trim() !== '').map(o => ({
      id: o.id,
      text: o.text.trim()
    }));
    
    if (validOptions.length < 2) {
      alert('Inserisci almeno 2 opzioni valide.');
      return;
    }

    await addPoll({
      question: question.trim(),
      options: validOptions,
      multipleChoice,
      createdBy: user.uid,
      createdByName: user.displayName || 'Anonimo',
    });

    setQuestion('');
    setOptions([{ id: 'opt1', text: '' }, { id: 'opt2', text: '' }]);
    setMultipleChoice(false);
    setShowForm(false);
  };

  return (
    <div className="tab-content sondaggi-tab">
      
      {/* Intestazione e pulsante crea */}
      <div className="sondaggi-header">
        <h2 className="tab-title">📊 Sondaggi</h2>
        {user && !showForm && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + Crea Sondaggio
          </button>
        )}
      </div>

      {/* Form di creazione */}
      {showForm && (
        <div className="poll-form-container">
          <form className="add-item-form" onSubmit={handleSubmit}>
            <label className="form-label">
              Domanda
              <input
                className="input"
                placeholder="Es. Che carne prendiamo?"
                value={question}
                onChange={e => setQuestion(e.target.value)}
                autoFocus
              />
            </label>
            
            <div className="poll-form-options">
              <label className="form-label">Opzioni</label>
              {options.map((opt, index) => (
                <div key={opt.id} className="poll-option-input-row">
                  <input
                    className="input input-sm"
                    placeholder={`Opzione ${index + 1}`}
                    value={opt.text}
                    onChange={e => handleOptionChange(opt.id, e.target.value)}
                  />
                  {options.length > 2 && (
                    <button 
                      type="button" 
                      className="btn btn-sm btn-ghost btn-danger" 
                      onClick={() => handleRemoveOption(opt.id)}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button 
                type="button" 
                className="btn btn-sm btn-outline" 
                onClick={handleAddOption}
                style={{ marginTop: 'var(--space-xs)' }}
              >
                + Aggiungi opzione
              </button>
            </div>

            <label className="checkbox-label" style={{ marginTop: 'var(--space-sm)' }}>
              <input
                type="checkbox"
                checked={multipleChoice}
                onChange={e => setMultipleChoice(e.target.checked)}
              />
              Consenti selezione multipla
            </label>

            <div className="add-item-buttons" style={{ marginTop: 'var(--space-md)' }}>
              <button type="submit" className="btn btn-primary">Pubblica Sondaggio</button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Annulla</button>
            </div>
          </form>
        </div>
      )}

      {/* Lista sondaggi */}
      {polls.length > 0 ? (
        <div className="polls-list">
          {polls.map(poll => (
            <PollCard key={poll.id} poll={poll} />
          ))}
        </div>
      ) : (
        !showForm && <EmptyState message="Nessun sondaggio attivo." emoji="📊" />
      )}
    </div>
  );
}
