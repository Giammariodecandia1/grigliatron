import { useAuth } from '../../contexts/AuthContext';
import { useEvent } from '../../contexts/EventContext';
import Card from '../shared/Card';
import ItemList from '../shared/ItemList';
import AddItemForm from '../shared/AddItemForm';
import EmptyState from '../shared/EmptyState';
import { getTheme } from '../../config/themes';

const FOOD_CATEGORIES = ['Carne', 'Pane', 'Verdure', 'Bevande', 'Dolci', 'Condimenti', 'Altro'];

/**
 * Card Cibo & Bevande.
 */
export default function FoodCard() {
  const { user } = useAuth();
  const { event, foodItems, addItem } = useEvent();
  const theme = getTheme(event?.theme || event?.type);

  if (!event) return null;

  const freeCount = foodItems.filter(i => !i.status || i.status === 'free').length;

  const handleAdd = async (data) => {
    if (!user) return;
    await addItem('foodItems', {
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
      title="Cibo & Bevande"
      emoji={theme.sectionEmojis.food}
      count={foodItems.length}
      countLabel={freeCount > 0 ? `(${freeCount} liberi)` : ''}
      id="food-card"
      items={foodItems}
    >
      {foodItems.length > 0 ? (
        <ItemList
          items={foodItems}
          subCollection="foodItems"
          showCategory
        />
      ) : (
        <EmptyState
          message={theme.emptyMessages.food}
          emoji="🥩"
        />
      )}

      {user && (
        <AddItemForm
          onSubmit={handleAdd}
          placeholder="Cosa portiamo?"
          showQuantity
          showNotes
          showCategory
          categories={FOOD_CATEGORIES}
        />
      )}
    </Card>
  );
}
