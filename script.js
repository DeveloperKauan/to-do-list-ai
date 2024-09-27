document.addEventListener('DOMContentLoaded', function() {
    const taskInput = document.getElementById('taskInput');
    const prioritySelect = document.getElementById('prioritySelect');
    const deadlineInput = document.getElementById('deadlineInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const groupInput = document.getElementById('groupInput');
    const addGroupBtn = document.getElementById('addGroupBtn');
    const groupsContainer = document.getElementById('groupsContainer');
    const shareBtn = document.getElementById('shareBtn');
    const completedTasks = document.getElementById('completedTasks');

    let taskMetrics = {
        totalTasks: 0,
        completedTasks: 0,
    };

    // Adicionar tarefa com botão ou Enter
    taskInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            addTask();
        }
    });
    addTaskBtn.addEventListener('click', addTask);

    // Adicionar grupo personalizado
    addGroupBtn.addEventListener('click', addGroup);

    // Carregar tarefas salvas no localStorage
    loadTasks();

    // Adicionar nova tarefa
    function addTask() {
        const taskText = taskInput.value.trim();
        const priority = prioritySelect.value;
        const deadline = deadlineInput.value;
        const group = groupsContainer.querySelector('.column'); // Adiciona ao primeiro grupo se houver

        if (taskText !== '' && group) {
            const task = {
                text: taskText,
                priority: priority,
                deadline: deadline,
                completed: false,
                groupId: group.id,
            };
            addTaskToDOM(task, group);
            saveTasks();
            taskInput.value = '';
            deadlineInput.value = '';
        }
    }

    // Adicionar tarefa ao DOM
    function addTaskToDOM(task, groupElement) {
        const li = document.createElement('li');
        li.setAttribute('draggable', true);
        li.innerHTML = `
            <span>${task.text}</span>
            <span class="priority-${task.priority.toLowerCase()}">${task.priority}</span>
            <button class="deleteBtn">Delete</button>
        `;

        // Marcar tarefa como completa
        li.addEventListener('click', function() {
            li.classList.toggle('completed');
            updateMetrics();
            saveTasks();
        });

        // Deletar tarefa
        li.querySelector('.deleteBtn').addEventListener('click', function(e) {
            e.stopPropagation();
            li.remove();
            updateMetrics();
            saveTasks();
        });

        // Adicionar funcionalidade de arrastar e soltar
        li.addEventListener('dragstart', handleDragStart);
        li.addEventListener('dragend', handleDragEnd);

        groupElement.querySelector('ul').appendChild(li);
        updateMetrics();
    }

    // Criar novo grupo
    function addGroup() {
        const groupName = groupInput.value.trim();
        if (groupName !== '') {
            const groupId = `group-${Date.now()}`;
            const column = document.createElement('div');
            column.classList.add('column');
            column.id = groupId;
            column.innerHTML = `
                <h2>${groupName}</h2>
                <ul></ul>
            `;

            // Adicionar eventos de drag-and-drop nas colunas
            column.addEventListener('dragover', handleDragOver);
            column.addEventListener('drop', handleDrop);

            groupsContainer.appendChild(column);
            groupInput.value = '';
        }
    }

    // Funcionalidades de arrastar e soltar
    let draggedTask = null;

    function handleDragStart() {
        draggedTask = this;
        setTimeout(() => this.style.display = 'none', 0);
    }

    function handleDragEnd() {
        draggedTask.style.display = 'block';
        draggedTask = null;
    }

    function handleDragOver(e) {
        e.preventDefault();
    }

    function handleDrop() {
        this.querySelector('ul').appendChild(draggedTask);
        saveTasks();
    }

    // Salvar tarefas no localStorage
    function saveTasks() {
        const tasks = [];
        groupsContainer.querySelectorAll('.column').forEach(function(column) {
            const groupId = column.id;
            column.querySelectorAll('li').forEach(function(li) {
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

    // Carregar tarefas do localStorage
    function loadTasks() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.forEach(function(task) {
            const groupElement = document.getElementById(task.groupId);
            if (groupElement) {
                addTaskToDOM(task, groupElement);
            }
        });
        updateMetrics();
    }

    // Compartilhar a lista de tarefas
    shareBtn.addEventListener('click', function() {
        const tasks = [];
        groupsContainer.querySelectorAll('.column').forEach(function(column) {
            column.querySelectorAll('li').forEach(function(li) {
                tasks.push(li.querySelector('span').textContent);
            });
        });
        const taskListText = tasks.join('\n');
        navigator.clipboard.writeText(taskListText).then(function() {
            alert('Your task list has been copied to the clipboard!');
        }, function() {
            alert('Failed to copy the task list.');
        });
    });

    // Atualizar métricas de conclusão de tarefas
    function updateMetrics() {
        const totalTasks = [...groupsContainer.querySelectorAll('li')].length;
        const completedTasksCount = [...groupsContainer.querySelectorAll('li.completed')].length;
        taskMetrics.totalTasks = totalTasks;
        taskMetrics.completedTasks = completedTasksCount;

        const completionPercentage = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;
        completedTasks.textContent = `Completed: ${completionPercentage}%`;
    }
});
