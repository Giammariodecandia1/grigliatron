import { useAuth } from '../../contexts/AuthContext';
import { useEvent } from '../../contexts/EventContext';
import Card from '../shared/Card';
import ItemList from '../shared/ItemList';
import AddItemForm from '../shared/AddItemForm';
import EmptyState from '../shared/EmptyState';
import { getTheme } from '../../config/themes';

/**
 * Card Attrezzatura & Cose utili.
 */
export default function GearCard() {
  const { user } = useAuth();
  const { event, gearItems, addItem } = useEvent();
  const theme = getTheme(event?.theme || event?.type);

  if (!event) return null;

  const freeCount = gearItems.filter(i => !i.status || i.status === 'free').length;

  const handleAdd = async (data) => {
    if (!user) return;
    await addItem('gearItems', {
      ...data,
      createdBy: user.uid,
      createdByName: user.displayName || 'Anonimo',
      assignedTo: null,
      assignedToName: null,
      status: 'free',
    });
  };

  return (
    <Card
      title="Attrezzatura & Cose utili"
      emoji={theme.sectionEmojis.gear}
      count={gearItems.length}
      countLabel={freeCount > 0 ? `(${freeCount} liberi)` : ''}
      id="gear-card"
      items={gearItems}
    >
      {gearItems.length > 0 ? (
        <ItemList
          items={gearItems}
          subCollection="gearItems"
        />
      ) : (
        <EmptyState
          message={theme.emptyMessages.gear}
          emoji="⛺"
        />
      )}

      {user && (
        <AddItemForm
          onSubmit={handleAdd}
          placeholder="Cosa serve?"
          showQuantity
          showNotes
        />
      )}
    </Card>
  );
}
