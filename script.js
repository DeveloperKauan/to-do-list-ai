document.addEventListener('DOMContentLoaded', function() {
    const taskInput = document.getElementById('taskInput');
    const prioritySelect = document.getElementById('prioritySelect');
    const deadlineInput = document.getElementById('deadlineInput');
    const taskList = document.getElementById('taskList');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const shareBtn = document.getElementById('shareBtn');
    const completedTasks = document.getElementById('completedTasks');

    let taskMetrics = {
        totalTasks: 0,
        completedTasks: 0,
    };

    // Load tasks from localStorage
    loadTasks();

    // Add a new task
    addTaskBtn.addEventListener('click', function() {
        const taskText = taskInput.value.trim();
        const priority = prioritySelect.value;
        const deadline = deadlineInput.value;

        if (taskText !== '') {
            addTask(taskText, priority, deadline);
            taskInput.value = '';
            deadlineInput.value = '';
            saveTasks();
        }
    });

    // Add task to the list with priority and deadline
    function addTask(text, priority, deadline) {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${text}</span>
            <span class="deadline">${deadline ? `(Due: ${deadline})` : ''}</span>
            <span class="priority-${priority.toLowerCase()}">${priority}</span>
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

        taskList.appendChild(li);
        updateMetrics();
    }

    // Save tasks to localStorage
    function saveTasks() {
        const tasks = [];
        taskList.querySelectorAll('li').forEach(function(li) {
            tasks.push({
                text: li.querySelector('span').textContent,
                priority: li.querySelector(`.priority-${prioritySelect.value.toLowerCase()}`).textContent,
                deadline: li.querySelector('.deadline') ? li.querySelector('.deadline').textContent : '',
                completed: li.classList.contains('completed')
            });
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Load tasks from localStorage
    function loadTasks() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.forEach(function(task) {
            addTask(task.text, task.priority, task.deadline);
            if (task.completed) {
                taskList.lastChild.classList.add('completed');
            }
        });
        updateMetrics();
    }

    // Share the site
    shareBtn.addEventListener('click', function() {
        const shareLink = window.location.href;
        navigator.clipboard.writeText(shareLink).then(function() {
            alert('Site link copied to clipboard!');
        }, function() {
            alert('Failed to copy the site link.');
        });
    });

    // Update task completion metrics
    function updateMetrics() {
        const totalTasks = taskList.querySelectorAll('li').length;
        const completedTasksCount = taskList.querySelectorAll('li.completed').length;
        taskMetrics.totalTasks = totalTasks;
        taskMetrics.completedTasks = completedTasksCount;

        const completionPercentage = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;
        completedTasks.textContent = `Completed: ${completionPercentage}%`;
    }
});
