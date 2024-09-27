document.addEventListener('DOMContentLoaded', function () {
    const taskInput = document.getElementById('taskInput');
    const prioritySelect = document.getElementById('prioritySelect');
    const deadlineInput = document.getElementById('deadlineInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const groupInput = document.getElementById('groupInput');
    const addGroupBtn = document.getElementById('addGroupBtn');
    const groupSelect = document.getElementById('groupSelect');
    const groupsContainer = document.getElementById('groupsContainer');
    const shareBtn = document.getElementById('shareBtn');
    const completedTasks = document.getElementById('completedTasks');

    // Load tasks and groups
    loadTasks();
    loadGroups();

    // Add task with button or 'Enter'
    taskInput.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            addTask();
        }
    });

    addTaskBtn.addEventListener('click', addTask);

    // Add group
    addGroupBtn.addEventListener('click', addGroup);

    // Add task to DOM
    function addTask() {
        const taskText = taskInput.value.trim();
        const priority = prioritySelect.value;
        const deadline = deadlineInput.value;
        const selectedGroup = groupSelect.value;

        if (taskText !== '' && selectedGroup !== '') {
            const groupElement = document.getElementById(selectedGroup);
            const task = {
                text: taskText,
                priority: priority,
                deadline: deadline,
                completed: false,
                groupId: selectedGroup,
            };
            addTaskToDOM(task, groupElement);
            saveTasks();
            taskInput.value = '';
            deadlineInput.value = '';
        }
    }

    function addTaskToDOM(task, groupElement) {
        const li = document.createElement('li');
        li.setAttribute('draggable', true);
        li.innerHTML = `
            <span>${task.text}</span>
            <span class="priority-${task.priority.toLowerCase()}">${task.priority}</span>
            <button class="deleteBtn">Delete</button>
        `;

        // Complete task
        li.addEventListener('click', function () {
            li.classList.toggle('completed');
            updateMetrics();
            saveTasks();
        });

        // Delete task
        li.querySelector('.deleteBtn').addEventListener('click', function (e) {
            e.stopPropagation();
            li.remove();
            updateMetrics();
            saveTasks();
        });

        groupElement.querySelector('ul').appendChild(li);
        updateMetrics();
    }

    function addGroup() {
        const groupName = groupInput.value.trim();
        if (groupName !== '') {
            const groupId = `group-${Date.now()}`;
            const column = document.createElement('div');
            column.classList.add('column');
            column.id = groupId;
            column.innerHTML = `
                <h2>${groupName}</h2>
                <button class="deleteGroupBtn">Delete Group</button>
                <ul></ul>
            `;

            groupsContainer.appendChild(column);

            const option = document.createElement('option');
            option.value = groupId;
            option.textContent = groupName;
            groupSelect.appendChild(option);

            // Delete group
            column.querySelector('.deleteGroupBtn').addEventListener('click', function () {
                column.remove();
                groupSelect.querySelector(`option[value="${groupId}"]`).remove();
                saveTasks();
            });

            groupInput.value = '';
        }
    }

    // Save tasks in localStorage
    function saveTasks() {
        const tasks = [];
        groupsContainer.querySelectorAll('.column').forEach(function (column) {
            const groupId = column.id;
            column.querySelectorAll('li').forEach(function (li) {
                const taskText = li.querySelector('span').textContent;
                const priority = li.querySelector('span.priority').textContent;
                const completed = li.classList.contains('completed');
                const task = {
                    text: taskText,
                    priority: priority,
                    completed: completed,
                    groupId: groupId,
                };
                tasks.push(task);
            });
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Load tasks from localStorage
    function loadTasks() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.forEach(function (task) {
            const groupElement = document.getElementById(task.groupId);
            if (groupElement) {
                addTaskToDOM(task, groupElement);
            }
        });
        updateMetrics();
    }

    // Load groups from localStorage
    function loadGroups() {
        const groups = JSON.parse(localStorage.getItem('groups')) || [];
        groups.forEach(function (group) {
            const groupId = group.id;
            const groupName = group.name;

            const column = document.createElement('div');
            column.classList.add('column');
            column.id = groupId;
            column.innerHTML = `
                <h2>${groupName}</h2>
                <button class="deleteGroupBtn">Delete Group</button>
                <ul></ul>
            `;
            groupsContainer.appendChild(column);

            const option = document.createElement('option');
            option.value = groupId
