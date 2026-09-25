/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useRef, useState } from 'react';
import { UserWarning } from './UserWarning';
import { getTodos, updateTodo, USER_ID } from './api/todos';
import { Todo } from './types/Todo';
import classNames from 'classnames';

export const App: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [todosFromServer, setTodosFromServer] = useState<Todo[]>([]);
  const [isEditId, setIsEditId] = useState(0);
  const [inputEdit, setInputEdit] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const refFocusInputSearch = useRef<HTMLInputElement>(null);
  const allTodosCompleted = todosFromServer.every(todo => todo.completed);
  const [errorMessage, setErrorMessage] = useState('');

  let visibilitedTodos: Todo[] = todosFromServer;

  // #region filterTodos

  const handleArrowAddStatus = async () => {
    if (allTodosCompleted) {
      const updatedTodos = todosFromServer.map(todo => ({
        ...todo,
        completed: false,
      }));

      await Promise.all(updatedTodos.map(todo => updateTodo(todo, todo.id)));

      setTodosFromServer(updatedTodos);

      return;
    }

    const updatedTodos = todosFromServer.map(todo => ({
      ...todo,
      completed: true,
    }));

    await Promise.all(updatedTodos.map(todo => updateTodo(todo, todo.id)));

    setTodosFromServer(updatedTodos);
  };

  if (filterStatus === 'All') {
    visibilitedTodos = todosFromServer;
  }

  if (filterStatus === 'Active') {
    visibilitedTodos = visibilitedTodos.filter(
      todo => todo.completed === false,
    );
  }

  if (filterStatus === 'Completed') {
    visibilitedTodos = visibilitedTodos.filter(todo => todo.completed === true);
  }
  // #endregion filterTodos

  // #region Edit Double Click
  const finishEditing = () => {
    setIsEditId(0);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        finishEditing();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isEditId !== 0) {
      refFocusInputSearch.current?.blur();
      inputRef.current?.focus();
    }
  }, [isEditId]);

  // #endregion Edit Double Click

  // #region update
  const handleCheckBoxStatus = (id: number, status: boolean) => {
    const todo = todosFromServer.find(tod => tod.id === id);

    if (!todo) {
      return;
    }

    const updatedTodo: Todo = {
      ...todo,
      completed: !status,
    };

    updateTodo(updatedTodo, id).then(todoNew => {
      setTodosFromServer(current => {
        const updatedTodos = [...current];

        const index = current.findIndex(tod => tod.id === id);

        updatedTodos.splice(index, 1, todoNew);

        return updatedTodos;
      });
    });
  };

  // #endregion update
  const handleSubmit = () => {
    return;
  };

  useEffect(() => {
    getTodos()
      .then(setTodosFromServer)
      .catch(() => {
        setErrorMessage('Unable to load todos');
      })
      .finally(() => window.setTimeout(() => setErrorMessage(''), 3000));
  }, []);

  useEffect(() => {
    refFocusInputSearch.current?.focus();
  }, []);

  if (!USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <header className="todoapp__header">
          {/* this button should have `active` class only if all todos are completed */}
          <button
            type="button"
            className="todoapp__toggle-all active"
            data-cy="ToggleAllButton"
            onClick={() => handleArrowAddStatus()}
          />

          {/* Add a todo on form submit */}
          <form onSubmit={() => handleSubmit()}>
            <input
              data-cy="NewTodoField"
              type="text"
              defaultValue={''}
              value={inputValue}
              className="todoapp__new-todo"
              placeholder="What needs to be done?"
              onChange={event => setInputValue(event.target.value)}
              ref={refFocusInputSearch}
            />
          </form>
        </header>

        <section className="todoapp__main" data-cy="TodoList">
          {visibilitedTodos.map(todo => {
            return (
              <div
                data-cy="Todo"
                className={classNames('todo', { completed: todo.completed })}
                key={todo.id}
              >
                <label className="todo__status-label">
                  <input
                    data-cy="TodoStatus"
                    type="checkbox"
                    className="todo__status"
                    onClick={() =>
                      handleCheckBoxStatus(todo.id, todo.completed)
                    }
                    checked={todo.completed}
                  />
                </label>

                {isEditId !== todo.id && (
                  <span
                    data-cy="TodoTitle"
                    className="todo__title"
                    onDoubleClick={() => {
                      setIsEditId(todo.id);
                      setInputEdit(todo.title);
                    }}
                    onMouseDown={event => {
                      if (event.detail > 1) {
                        event.preventDefault();
                      }
                    }}
                  >
                    {todo.title}
                  </span>
                )}

                {isEditId === todo.id && (
                  <form
                    onSubmit={event => {
                      event.preventDefault();
                      finishEditing();
                    }}
                  >
                    <input
                      ref={inputRef}
                      data-cy="TodoTitleField"
                      type="text"
                      className="todo__title-field"
                      onChange={evemt => setInputEdit(evemt.target.value)}
                      value={inputEdit}
                    />
                  </form>
                )}
                {isEditId !== todo.id && (
                  <button
                    type="button"
                    className="todo__remove"
                    data-cy="TodoDelete"
                  >
                    ×
                  </button>
                )}

                <div data-cy="TodoLoader" className="modal overlay">
                  <div className="modal-background has-background-white-ter" />
                  <div className="loader" />
                </div>
              </div>
            );
          })}

          {/* This todo is in loadind state */}
          {/* <div data-cy="Todo" className="todo">
            <label className="todo__status-label">
              <input
                data-cy="TodoStatus"
                type="checkbox"
                className="todo__status"
              />
            </label>

            <span data-cy="TodoTitle" className="todo__title">
              Todo is being saved now
            </span>

            <button type="button" className="todo__remove" data-cy="TodoDelete">
              ×
            </button>

            'is-active' class puts this modal on top of the todo
            <div data-cy="TodoLoader" className="modal overlay is-active">
              <div className="modal-background has-background-white-ter" />
              <div className="loader" />
            </div>
          </div> */}
        </section>

        {/* Hide the footer if there are no todos */}
        {todosFromServer.length !== 0 && (
          <footer className="todoapp__footer" data-cy="Footer">
            <span className="todo-count" data-cy="TodosCounter">
              {`${todosFromServer.filter(todo => todo.completed === false).length} `}
              items left
            </span>

            {/* Active link should have the 'selected' class */}
            <nav className="filter" data-cy="Filter">
              <a
                href="#/"
                className={classNames('filter__link', {
                  selected: filterStatus === 'All',
                })}
                data-cy="FilterLinkAll"
                onClick={() => {
                  setFilterStatus('All');
                }}
              >
                All
              </a>

              <a
                href="#/active"
                className={classNames('filter__link', {
                  selected: filterStatus === 'Active',
                })}
                data-cy="FilterLinkActive"
                onClick={() => {
                  setFilterStatus('Active');
                }}
              >
                Active
              </a>

              <a
                href="#/completed"
                className={classNames('filter__link', {
                  selected: filterStatus === 'Completed',
                })}
                data-cy="FilterLinkCompleted"
                onClick={() => {
                  setFilterStatus('Completed');
                }}
              >
                Completed
              </a>
            </nav>

            {/* this button should be disabled if there are no completed todos */}
            <button
              type="button"
              className="todoapp__clear-completed"
              data-cy="ClearCompletedButton"
            >
              Clear completed
            </button>
          </footer>
        )}
      </div>

      {/* DON'T use conditional rendering to hide the notification */}
      {/* Add the 'hidden' class to hide the message smoothly */}
      <div
        data-cy="ErrorNotification"
        className={classNames(
          'notification is-danger is-light has-text-weight-normal',
          { hidden: errorMessage === '' },
        )}
      >
        <button
          data-cy="HideErrorButton"
          type="button"
          className="delete"
          onClick={() => setErrorMessage('')}
        />
        {/* show only one message at a time */}
        {errorMessage}
        {/* Unable to load todos
        <br />
        Title should not be empty
        <br />
        Unable to add a todo
        <br />
        Unable to delete a todo
        <br />
        Unable to update a todo */}
      </div>
    </div>
  );
};
