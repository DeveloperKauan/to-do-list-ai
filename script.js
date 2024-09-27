document.addEventListener('DOMContentLoaded', function() {
    const taskInput = document.getElementById('taskInput');
    const categorySelect = document.getElementById('categorySelect');
    const prioritySelect = document.getElementById('prioritySelect');
    const deadlineInput = document.getElementById('deadlineInput');
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

    // Add task on Enter keypress
    taskInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            addTask();
        }
    });

    // Load tasks from localStorage
    loadTasks();

    // Add a new task
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

    // Add task to the DOM based on category
    function addTaskToDOM(task) {
        const li = document.createElement('li');
        li.setAttribute('draggable', true);
        li.innerHTML = `
            <span>${task.text}</span>
            <span class="deadline">${task.deadline ? `(Due: ${task.deadline})` : ''}</span>
            <span class="priority-${task.priority.toLowerCase()}">${task.priority}</span>
            <button class="deleteBtn">Delete</button>
        `;

        // Mark task as complete
        li.addEventListener('click', function() {
            li.classList.toggle('completed');
            updateMetrics();
            saveTasks();
        });

        // Delete task
        li.querySelector('.deleteBtn').addEventListener('click', function(e) {
            e.stopPropagation();
            li.remove();
            updateMetrics();
            saveTasks();
        });

        // Determine the correct category column
        if (task.category === 'Work') {
            workTaskList.appendChild(li);
        } else if (task.category === 'Personal') {
            personalTaskList.appendChild(li);
        } else if (task.category === 'Study') {
            studyTaskList.appendChild(li);
        }

        updateMetrics();
    }

    // Save tasks to localStorage
    function saveTasks() {
        const tasks = [];
        [workTaskList, personalTaskList, studyTaskList].forEach(function(list) {
            list.querySelectorAll('li').forEach(function(li) {
                const taskText = li.querySelector('span').textContent;
                const priority = li.querySelector('span.priority-low') || li.querySelector('span.priority-medium') || li.querySelector('span.priority-high');
                const deadline = li.querySelector('.deadline') ? li.querySelector('.deadline').textContent : '';
                const completed = li.classList.contains('completed');
                tasks.push({
                    text: taskText,
                    priority: priority.textContent,
                    deadline: deadline ? deadline.replace('(Due: ', '').replace(')', '') : '',
                    category: list.id.includes('work') ? 'Work' : list.id.includes('personal') ? 'Personal' : 'Study',
                    completed: completed
                });
            });
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Load tasks from localStorage
    function loadTasks() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.forEach(function(task) {
            addTaskToDOM(task);
        });
        updateMetrics();
    }

    // Share the user's tasks
    shareBtn.addEventListener('click', function() {
        generateShareableLink();
    });

    // Generate a shareable link
    function generateShareableLink() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        const encodedTasks = encodeURIComponent(JSON.stringify(tasks));
        const shareableLink = `${window.location.origin}${window.location.pathname}?tasks=${encodedTasks}`;
        navigator.clipboard.writeText(shareableLink).then(() => {
            alert('Link para compartilhar as tarefas copiado!');
        });
    }

    // Load tasks from a shared link
    function loadTasksFromLink() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('tasks')) {
            const tasks = JSON.parse(decodeURIComponent(urlParams.get('tasks')));
            localStorage.setItem('tasks', JSON.stringify(tasks));
            location.reload();
        }
    }
    loadTasksFromLink();

    // Update task completion metrics
    function updateMetrics() {
        const totalTasks = [...workTaskList.children, ...personalTaskList.children, ...studyTaskList.children].length;
        const completedTasksCount = [...workTaskList.children, ...personalTaskList.children, ...studyTaskList.children].filter(li => li.classList.contains('completed')).length;
        taskMetrics.totalTasks = totalTasks;
        taskMetrics.completedTasks = completedTasksCount;

        const completionPercentage = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;
        completedTasks.textContent = `Completed: ${completionPercentage}%`;
    }

    // Toggle theme mode
    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
    });

    // Load previously selected theme
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }
});
