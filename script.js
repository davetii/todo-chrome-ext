document.addEventListener('DOMContentLoaded', () => {
    const todoList = document.getElementById('todo-list');
    const addButton = document.getElementById('add-todo');
    
    // Initialize Sortable
    new Sortable(todoList, {
        animation: 150,
        ghostClass: 'sortable-ghost',
        onEnd: () => {
            saveTodos();
        }
    });

    // Load saved todos
    loadTodos();

    // Add new todo when button is clicked
    addButton.addEventListener('click', () => {
        addTodoItem();
    });

    function createTodoItem(text = '', completed = false) {
        const todoItem = document.createElement('div');
        todoItem.className = 'todo-item';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'todo-checkbox';
        checkbox.checked = completed;

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'todo-text';
        input.value = text;
        if (completed) input.classList.add('completed');

        const removeButton = document.createElement('button');
        removeButton.className = 'remove-button';
        removeButton.innerHTML = '<span class="material-icons">close</span>';

        // Event listeners
        checkbox.addEventListener('change', () => {
            input.classList.toggle('completed');
            saveTodos();
        });

        input.addEventListener('change', saveTodos);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addTodoItem();
            }
        });

        removeButton.addEventListener('click', () => {
            todoItem.remove();
            saveTodos();
        });

        todoItem.appendChild(checkbox);
        todoItem.appendChild(input);
        todoItem.appendChild(removeButton);

        return todoItem;
    }

    function addTodoItem(text = '', completed = false) {
        const todoItem = createTodoItem(text, completed);
        todoList.appendChild(todoItem);
        todoItem.querySelector('.todo-text').focus();
        saveTodos();
    }

    function saveTodos() {
        try {
            const todos = [];
            document.querySelectorAll('.todo-item').forEach(item => {
                todos.push({
                    text: item.querySelector('.todo-text').value,
                    completed: item.querySelector('.todo-checkbox').checked
                });
            });
            if (chrome.storage && chrome.storage.sync) {
                chrome.storage.sync.set({ todos }, () => {
                    if (chrome.runtime.lastError) {
                        console.error('Error saving todos:', chrome.runtime.lastError);
                    }
                });
            } else {
                // Fallback to localStorage if chrome.storage is not available
                localStorage.setItem('todos', JSON.stringify(todos));
            }
        } catch (error) {
            console.error('Error saving todos:', error);
        }
    }

    function loadTodos() {
        try {
            if (chrome.storage && chrome.storage.sync) {
                chrome.storage.sync.get(['todos'], (result) => {
                    if (chrome.runtime.lastError) {
                        console.error('Error loading todos:', chrome.runtime.lastError);
                        return;
                    }
                    if (result.todos) {
                        result.todos.forEach(todo => {
                            addTodoItem(todo.text, todo.completed);
                        });
                    }
                });
            } else {
                // Fallback to localStorage if chrome.storage is not available
                const savedTodos = localStorage.getItem('todos');
                if (savedTodos) {
                    JSON.parse(savedTodos).forEach(todo => {
                        addTodoItem(todo.text, todo.completed);
                    });
                }
            }
        } catch (error) {
            console.error('Error loading todos:', error);
        }
    }
});