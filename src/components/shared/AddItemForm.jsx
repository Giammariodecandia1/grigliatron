import { useState } from 'react';

/**
 * Form compatto per aggiungere un elemento.
 * @param {{ onSubmit, placeholder, showQuantity, showNotes, showCategory, showPriority, showDescription, categories }} props
 */
export default function AddItemForm({
  onSubmit,
  placeholder = 'Aggiungi qualcosa...',
  showQuantity = false,
  showNotes = false,
  showCategory = false,
  showPriority = false,
  showDescription = false,
  categories = [],
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('normal');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const data = { name: name.trim() };
    if (showQuantity && quantity.trim()) data.quantity = quantity.trim();
    if (showNotes && notes.trim()) data.notes = notes.trim();
    if (showDescription && description.trim()) data.description = description.trim();
    if (showCategory && category) data.category = category;
    if (showPriority) data.priority = priority;

    onSubmit(data);
    setName('');
    setQuantity('');
    setNotes('');
    setDescription('');
    setCategory('');
    setPriority('normal');
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        className="btn btn-add-item"
        onClick={() => setIsOpen(true)}
      >
        + Aggiungi
      </button>
    );
  }

  return (
    <form className="add-item-form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={placeholder}
        className="input"
        autoFocus
      />

      <div className="add-item-extras">
        {showQuantity && (
          <input
            type="text"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Quantità"
            className="input input-sm"
          />
        )}

        {showCategory && categories.length > 0 && (
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input input-sm"
          >
            <option value="">Categoria</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        )}

        {showPriority && (
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="input input-sm"
          >
            <option value="normal">Normale</option>
            <option value="important">❗ Importante</option>
          </select>
        )}
      </div>

      {showDescription && (
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descrizione (opzionale)"
          className="input"
        />
      )}

      {showNotes && (
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Note (opzionale)"
          className="input"
        />
      )}

      <div className="add-item-buttons">
        <button type="submit" className="btn btn-primary btn-sm">
          Aggiungi
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => setIsOpen(false)}
        >
          Annulla
        </button>
      </div>
    </form>
  );
}
