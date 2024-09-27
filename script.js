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
            <input type="checkbox" ${task.completed ? 'checked' : ''} class="complete-checkbox" />
            <span contenteditable="false" class="task-text">${task.text}</span>
            <span class="deadline">${task.deadline ? `(Due: ${task.deadline})` : ''}</span>
            <span class="priority-${task.priority.toLowerCase()}">${task.priority}</span>
            <button class="deleteBtn">Delete</button>
        `;

        li.addEventListener('dragstart', (event) => {
            event.dataTransfer.setData('text/plain', JSON.stringify(task));
        });

        li.querySelector('.complete-checkbox').addEventListener('change', function() {
            task.completed = this.checked;
            saveTasks();
            updateMetrics();
        });

        li.querySelector('.deleteBtn').addEventListener('click', () => {
            li.remove();
            updateMetrics();
            saveTasks();
        });

        if (task.category === 'Work') workTaskList.appendChild(li);
        else if (task.category === 'Personal') personalTaskList.appendChild(li);
        else if (task.category === 'Study') studyTaskList.appendChild(li);

        updateMetrics();
    }

    function saveTasks() {
        const tasks = [];
        [workTaskList, personalTaskList, studyTaskList].forEach(list => {
            list.querySelectorAll('li').forEach(li => {
                const input = li.querySelector('.task-text').textContent;
                const completed = li.querySelector('.complete-checkbox').checked;
                const category = list.id.includes('work') ? 'Work' : list.id.includes('personal') ? 'Personal' : 'Study';
                const priority = li.querySelector('span[class^=priority]').textContent;
                const deadline = li.querySelector('.deadline').textContent.replace('(Due: ', '').replace(')', '');

                tasks.push({ text: input, completed, category, priority, deadline });
            });
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function loadTasks() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.forEach(task => addTaskToDOM(task));
        updateMetrics();
    }

    function updateMetrics() {
        const totalTasks = [...document.querySelectorAll('li')].length;
        const completedTasks = [...document.querySelectorAll('.complete-checkbox:checked')].length;
        completedTasks.textContent = `Completed: ${((completedTasks / totalTasks) * 100).toFixed(2)}%`;
    }

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        themeToggle.textContent = document.body.classList.contains('dark-mode') ? '🌜' : '🌞';
        localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
    });

    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.textContent = '🌜';
    }

    // Funções de arrastar e soltar
    window.allowDrop = (ev) => ev.preventDefault();
    window.drop = (ev) => {
        ev.preventDefault();
        const data = JSON.parse(ev.dataTransfer.getData("text"));
        addTaskToDOM(data);
        saveTasks();
    };
});
