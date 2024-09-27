document.addEventListener('DOMContentLoaded', function() {
    const taskInput = document.getElementById('taskInput');
    const taskList = document.getElementById('taskList');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const shareBtn = document.getElementById('shareBtn');

    // Load tasks from localStorage
    loadTasks();

    // Add a new task
    addTaskBtn.addEventListener('click', function() {
        const taskText = taskInput.value.trim();
        if (taskText !== '') {
            addTask(taskText);
            taskInput.value = '';
            saveTasks();
        }
    });

    // Add task to the list
    function addTask(text) {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${text}</span>
            <button class="deleteBtn">Delete</button>
        `;
        
        // Mark task as complete
        li.addEventListener('click', function() {
            li.classList.toggle('completed');
            saveTasks();
        });

        // Delete task
        li.querySelector('.deleteBtn').addEventListener('click', function(e) {
            e.stopPropagation();
            li.remove();
            saveTasks();
        });

        taskList.appendChild(li);
    }

    // Save tasks to localStorage
    function saveTasks() {
        const tasks = [];
        taskList.querySelectorAll('li').forEach(function(li) {
            tasks.push({
                text: li.querySelector('span').textContent,
                completed: li.classList.contains('completed')
            });
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Load tasks from localStorage
    function loadTasks() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.forEach(function(task) {
            addTask(task.text);
            if (task.completed) {
                taskList.lastChild.classList.add('completed');
            }
        });
    }

    // Share the list
    shareBtn.addEventListener('click', function() {
        const tasks = [];
        taskList.querySelectorAll('li').forEach(function(li) {
            tasks.push(li.querySelector('span').textContent);
        });
        const taskText = tasks.join('\n');
        navigator.clipboard.writeText(taskText).then(function() {
            alert('Task list copied to clipboard!');
        }, function() {
            alert('Failed to copy task list.');
        });
    });
});
