let tasks = [];
let volunteers = [];
let currentPriority = 'all';
let searchTerm = '';

function updateStats() {
  document.getElementById('activeCount').textContent = tasks.filter(t => t.status === 'active').length;
  document.getElementById('criticalCount').textContent = tasks.filter(t => t.priority === 'critical').length;
  document.getElementById('volunteerCount').textContent = volunteers.length;
  document.getElementById('completedCount').textContent = tasks.filter(t => t.status === 'completed').length;
}

function renderTasks() {
  const taskGrid = document.getElementById('taskGrid');
  taskGrid.innerHTML = '';
  tasks.filter(task =>
    (currentPriority === 'all' || task.priority === currentPriority) &&
    task.title.toLowerCase().includes(searchTerm.toLowerCase())
  ).forEach(task => {
    const card = document.createElement('div');
    card.className = `task-card ${task.priority}`;
    card.innerHTML = `
      <h4>${task.title}</h4>
      <p>${task.description}</p>
      <button class="status-btn ${task.status}">${task.status}</button>
      <button class="assign-btn ${task.status === 'completed' ? 'disabled' : ''}">+ Assign</button>
      <button class="delete-btn">Delete</button>
      <ul>${task.assignedVolunteers.map(v => `<li>${v}</li>`).join('')}</ul>
    `;

    card.querySelector('.status-btn').onclick = () => {
      const states = ['pending', 'active', 'completed'];
      task.status = states[(states.indexOf(task.status)+1)%3];
      renderTasks(); updateStats();
    };

    card.querySelector('.assign-btn').onclick = (e) => {
      if(task.status === 'completed') return;
      const dropdown = document.createElement('select');
      volunteers.filter(v => v.availability === 'available' && !task.assignedVolunteers.includes(v.name))
      .forEach(v => {
        const opt = document.createElement('option'); opt.value = v.name; opt.textContent = v.name; dropdown.appendChild(opt);
      });
      dropdown.onchange = () => {
        task.assignedVolunteers.push(dropdown.value);
        volunteers.find(v => v.name === dropdown.value).availability = 'on Task';
        renderTasks(); renderVolunteers();
      };
      e.target.replaceWith(dropdown);
    };

    card.querySelector('.delete-btn').onclick = () => {
      tasks = tasks.filter(t => t.id !== task.id);
      renderTasks(); updateStats();
    };

    taskGrid.prepend(card);
  });
}

function renderVolunteers() {
  const list = document.getElementById('volunteerList');
  list.innerHTML = '';
  volunteers.forEach(v => {
    const card = document.createElement('div');
    card.className = 'volunteer-card';
    card.innerHTML = `<strong>${v.name}</strong><p>${v.availability}</p>`;
    list.appendChild(card);
  });
  updateStats();
}

document.getElementById('newTaskBtn').onclick = () => taskModalBackdrop.style.display = 'flex';
document.getElementById('registerVolunteerBtn').onclick = () => volunteerModalBackdrop.style.display = 'flex';
document.getElementById('closeTaskModal').onclick = () => taskModalBackdrop.style.display = 'none';
document.getElementById('closeVolunteerModal').onclick = () => volunteerModalBackdrop.style.display = 'none';

document.getElementById('taskDescription').addEventListener('input', e => {
  document.getElementById('descCounter').textContent = `${200 - e.target.value.length}/200`;
});

document.getElementById('createTaskBtn').onclick = () => {
  const title = taskTitle.value.trim();
  const description = taskDescription.value.trim();
  if(title.length < 5) return titleError.textContent = 'Minimum 5 characters';
  if(description.length > 200) return descError.textContent = 'Max 200 characters';

  tasks.unshift({
    id: Date.now(),
    title,
    description,
    priority: taskPriority.value,
    status: 'pending',
    minVolunteers: minVolunteers.value,
    requiredSkills: [],
    assignedVolunteers: []
  });
  renderTasks(); updateStats();
  taskModalBackdrop.style.display = 'none';
};

document.getElementById('submitVolunteerBtn').onclick = () => {
  const skills = [...document.querySelectorAll('#volunteerModalBackdrop input[type=checkbox]:checked')].map(c => c.value);
  const email = volEmail.value.trim();
  if(!volName.value || !/^\S+@\S+\.\S+$/.test(email) || skills.length < 4) return;
  volunteers.push({ name: volName.value, email, skills, availability: 'available' });
  renderVolunteers();
  volunteerModalBackdrop.style.display = 'none';
};

document.querySelectorAll('.filters button').forEach(btn => btn.onclick = () => {
  currentPriority = btn.dataset.priority;
  renderTasks();
});

document.getElementById('searchInput').addEventListener('input', e => {
  searchTerm = e.target.value;
  renderTasks();
});