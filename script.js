document.addEventListener('DOMContentLoaded', function() {
    const taskInput = document.getElementById('taskInput');
    const categorySelect = document.getElementById('categorySelect');
    const prioritySelect = document.getElementById('prioritySelect');
    const deadlineInput = document.getElementById('deadlineInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const workTaskList = document.getElementById('workTaskList');
    const personalTaskList = document.getElementById('personalTaskList');
    const studyTaskList = document.getElementById('studyTaskList');
    const shareBtn = document.getElementById('shareBtn');
    const completedTasks = document.getElementById('completedTasks');
    const themeToggle = document.getElementById('themeToggle');

    let taskMetrics = {
        totalTasks: 0,
        completedTasks: 0,
    };

    addTaskBtn.addEventListener('click', addTask);
    loadTasks();

    function addTask() {
        const taskText = taskInput.value.trim();
        const category = categorySelect.value;
        const priority = prioritySelect.value;
        const deadline = deadlineInput.value;

        if (taskText !== '') {
            const task = {
                text: taskText,
                category: category,
                priority: priority,
                deadline: deadline,
                completed: false,
            };
            addTaskToDOM(task);
            saveTasks();
            taskInput.value = '';
            deadlineInput.value = '';
        }
    }

    function addTaskToDOM(task) {
        const li = document.createElement('li');
        li.setAttribute('draggable', true);
        
        li.innerHTML = `
            <input type="text" value="${task.text}" readonly />
            <span class="deadline">${task.deadline ? `(Due: ${task.deadline})` : ''}</span>
            <span class="priority-${task.priority.toLowerCase()}">${task.priority}</span>
            <button class="editBtn">Edit</button>
            <button class="deleteBtn">Delete</button>
        `;

        const editBtn = li.querySelector('.editBtn');
        const deleteBtn = li.querySelector('.deleteBtn');
        const input = li.querySelector('input');

        editBtn.addEventListener('click', function() {
            if (input.readOnly) {
                input.readOnly = false;
                input.focus();
                editBtn.textContent = 'Save';
            } else {
                input.readOnly = true;
                task.text = input.value;
                editBtn.textContent = 'Edit';
                saveTasks();
            }
        });

        deleteBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            li.remove();
            updateMetrics();
            saveTasks();
        });

        input.addEventListener('change', saveTasks);
        input.addEventListener('click', (e) => e.stopPropagation());

        if (task.category === 'Work') workTaskList.appendChild(li);
        else if (task.category === 'Personal') personalTaskList.appendChild(li);
        else if (task.category === 'Study') studyTaskList.appendChild(li);

        updateMetrics();
    }

    function saveTasks() {
        const tasks = [];
        [workTaskList, personalTaskList, studyTaskList].forEach(list => {
            list.querySelectorAll('li').forEach(li => {
                const input = li.querySelector('input').value;
                const priority = li.querySelector('span.priority-low') || li.querySelector('span.priority-medium') || li.querySelector('span.priority-high');
                const deadline = li.querySelector('.deadline') ? li.querySelector('.deadline').textContent : '';
                const completed = li.classList.contains('completed');
                tasks.push({
                    text: input,
                    priority: priority.textContent,
                    deadline: deadline.replace('(Due: ', '').replace(')', ''),
                    category: list.id.includes('work') ? 'Work' : list.id.includes('personal') ? 'Personal' : 'Study',
                    completed: completed
                });
            });
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function loadTasks() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.forEach(task => addTaskToDOM(task));
        updateMetrics();
    }

    shareBtn.addEventListener('click', function() {
        generateShareableLink();
    });

    function generateShareableLink() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        const encodedTasks = encodeURIComponent(JSON.stringify(tasks));
        const shareableLink = `${window.location.origin}${window.location.pathname}?tasks=${encodedTasks}`;
        navigator.clipboard.writeText(shareableLink).then(() => {
            alert('Link para compartilhar as tarefas copiado!');
        });
    }

    function loadTasksFromLink() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('tasks')) {
            const tasks = JSON.parse(decodeURIComponent(urlParams.get('tasks')));
            localStorage.setItem('tasks', JSON.stringify(tasks));
            window.history.replaceState(null, null, window.location.pathname);
            location.reload();
        }
    }
    loadTasksFromLink();

    themeToggle.addEventListener('click', function() {
        const isDark = document.body.classList.toggle('dark-mode');
        themeToggle.textContent = isDark ? '🌜' : '🌞';
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });

    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.textContent = '🌜';
    }
});
