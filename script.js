            option.textContent = groupName;
            groupSelect.appendChild(option);

            // Delete group
            column.querySelector('.deleteGroupBtn').addEventListener('click', function () {
                column.remove();
                groupSelect.querySelector(`option[value="${groupId}"]`).remove();
                saveGroups();
            });

            // Load tasks in the respective group
            loadTasksInGroup(task.groupId);
        });
    }

    // Save groups in localStorage
    function saveGroups() {
        const groups = [];
        groupsContainer.querySelectorAll('.column').forEach(function (column) {
            const groupId = column.id;
            const groupName = column.querySelector('h2').textContent;
            groups.push({ id: groupId, name: groupName });
        });
        localStorage.setItem('groups', JSON.stringify(groups));
    }

    // Load tasks in the respective group
    function loadTasksInGroup(groupId) {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.forEach(function (task) {
            if (task.groupId === groupId) {
                const groupElement = document.getElementById(groupId);
                addTaskToDOM(task, groupElement);
            }
        });
    }

    // Update metrics for completed tasks
    function updateMetrics() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        const completedCount = tasks.filter(task => task.completed).length;
        const totalCount = tasks.length;
        const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
        completedTasks.textContent = `Completed: ${completionRate}%`;
    }

    // Share the list
    shareBtn.addEventListener('click', function () {
        const shareableLink = window.location.href;
        navigator.clipboard.writeText(shareableLink).then(() => {
            alert('List link copied to clipboard!');
        });
    });
});
