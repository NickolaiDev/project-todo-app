const form = document.getElementById("taskForm");
const input = document.getElementById("taskInput");
const list = document.getElementById("taskList");

const tasks = JSON.parse(localStorage.getItem('tasks')) || [];

function renderEmptyMessage() {
    if (tasks.length === 0) {
        const p = document.createElement('p');
        p.textContent = "You don't have tasks";
        p.id = 'noTasksMsg';
        p.classList.add('emptyList');
        list.appendChild(p);
    }
}

function createTaskElement(task) {
    const li = document.createElement('li');
    li.classList.add('fade-in');
    li.textContent = task.text;

    if (task.completed) {
        li.classList.add('completed');
    }

    li.addEventListener('click', () => {
        li.classList.toggle('completed');
        task.completed = !task.completed;
        localStorage.setItem('tasks', JSON.stringify(tasks));
    });

    const remove = document.createElement('button');
    remove.textContent = '[X]';
    remove.classList.add('removeButton');
    remove.addEventListener('click', (e) => {
        e.stopPropagation(); // предотвращает переключение выполненности при удалении
        li.remove();

        const index = tasks.findIndex(t => t.text === task.text);
        if (index !== -1) {
            tasks.splice(index, 1);
            localStorage.setItem('tasks', JSON.stringify(tasks));
        }

        renderEmptyMessage();
    });

    li.setAttribute('draggable', true);

    li.addEventListener('dragstart', (event) => {
        const index = tasks.findIndex( t => t.text === task.text );
        event.dataTransfer.setData('text/plain', index);
    });

    li.addEventListener('dragover', (event) => {
        event.preventDefault();

        li.classList.add('drag-over');
    });

    li.addEventListener('dragleave', () => {
        li.classList.remove('drag-over');
    });

    li.addEventListener('drop', (event) => {
        event.preventDefault();

        const fromIndex = +event.dataTransfer.getData('text/plain');
        const toIndex = tasks.findIndex ( t => t.text === task.text );

        console.log(`from: ${fromIndex} to ${toIndex}`);

        const movedTask = tasks.splice(fromIndex, 1) [0];
        tasks.splice(toIndex, 0, movedTask);

        li.classList.remove('drag-over');

        list.innerHTML = '';

        localStorage.setItem('tasks', JSON.stringify(tasks));

        tasks.forEach(task => createTaskElement(task));
    });

    li.appendChild(remove);
    list.appendChild(li);

    // Удалить сообщение "нет задач", если есть
    const existingMsg = document.getElementById('noTasksMsg');
    if (existingMsg) {
        existingMsg.remove();
    }
}

// Загрузка задач при старте
if (tasks.length > 0) {
    tasks.forEach(task => {
        createTaskElement(task);
    });
} else {
    renderEmptyMessage();
}

// Обработка новой задачи
form.addEventListener('submit', (event) => {
    event.preventDefault();

    const taskText = input.value.trim();
    if (taskText === '') return;

    const task = {
        text: taskText,
        completed: false
    };

    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));

    createTaskElement(task);
    input.value = '';
});
