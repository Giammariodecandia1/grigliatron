import { useAuth } from '../../contexts/AuthContext';
import { useEvent } from '../../contexts/EventContext';
import Card from '../shared/Card';
import ItemList from '../shared/ItemList';
import AddItemForm from '../shared/AddItemForm';
import EmptyState from '../shared/EmptyState';
import { getTheme } from '../../config/themes';

/**
 * Card Cose da fare (tasks).
 */
export default function TasksCard() {
  const { user } = useAuth();
  const { event, tasks, addItem } = useEvent();
  const theme = getTheme(event?.theme || event?.type);

  if (!event) return null;

  const freeCount = tasks.filter(i => !i.status || i.status === 'free').length;
  const doneCount = tasks.filter(i => i.status === 'completed' || i.status === 'done').length;

  const handleAdd = async (data) => {
    if (!user) return;
    await addItem('tasks', {
      title: data.name,
      description: data.description || '',
      priority: data.priority || 'normal',
      dueDate: null,
      createdBy: user.uid,
      createdByName: user.displayName || 'Anonimo',
      assignedTo: null,
      assignedToName: null,
      status: 'free',
    });
  };

  // Remap task fields for ItemList compatibility (title → name)
  const taskItems = tasks.map(t => ({
    ...t,
    name: t.title || t.name,
  }));

  return (
    <Card
      title="Cose da fare"
      emoji={theme.sectionEmojis.tasks}
      count={tasks.length}
      countLabel={doneCount > 0 ? `(${doneCount} fatti)` : freeCount > 0 ? `(${freeCount} liberi)` : ''}
      id="tasks-card"
      items={tasks}
    >
      {taskItems.length > 0 ? (
        <ItemList
          items={taskItems}
          subCollection="tasks"
          showPriority
        />
      ) : (
        <EmptyState
          message={theme.emptyMessages.tasks}
          emoji="📋"
        />
      )}

      {user && (
        <AddItemForm
          onSubmit={handleAdd}
          placeholder="Cosa c'è da fare?"
          showDescription
          showPriority
        />
      )}
    </Card>
  );
}
