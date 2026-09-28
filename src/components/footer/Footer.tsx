import classNames from 'classnames';
import { Todo } from '../../types/Todo';
import { FilterOption } from '../../types/FilterOption';

type Props = {
  todos: Todo[];
  filterStatus: FilterOption;
  setFilterStatus: (status: FilterOption) => void;
};

export const Footer = ({ todos, filterStatus, setFilterStatus }: Props) => {
  if (todos.length === 0) {
    return null;
  }

  const activeTodosCount = todos.filter(todo => !todo.completed).length;

  return (
    <footer className="todoapp__footer" data-cy="Footer">
      <span className="todo-count" data-cy="TodosCounter">
        {`${activeTodosCount} `}
        items left
      </span>

      <nav className="filter" data-cy="Filter">
        <a
          href="#/"
          className={classNames('filter__link', {
            selected: filterStatus === FilterOption.All,
          })}
          data-cy="FilterLinkAll"
          onClick={() => {
            setFilterStatus(FilterOption.All);
          }}
        >
          All
        </a>

        <a
          href="#/active"
          className={classNames('filter__link', {
            selected: filterStatus === FilterOption.Active,
          })}
          data-cy="FilterLinkActive"
          onClick={() => {
            setFilterStatus(FilterOption.Active);
          }}
        >
          Active
        </a>

        <a
          href="#/completed"
          className={classNames('filter__link', {
            selected: filterStatus === FilterOption.Completed,
          })}
          data-cy="FilterLinkCompleted"
          onClick={() => {
            setFilterStatus(FilterOption.Completed);
          }}
        >
          Completed
        </a>
      </nav>

      <button
        type="button"
        className="todoapp__clear-completed"
        data-cy="ClearCompletedButton"
      >
        Clear completed
      </button>
    </footer>
  );
};
