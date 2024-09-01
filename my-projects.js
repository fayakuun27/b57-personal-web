
// Fungsi untuk mendapatkan data dari local storage
function getProjectsFromLocalStorage() {
  return JSON.parse(localStorage.getItem('projects')) || [];
}

// Fungsi untuk menyimpan data ke local storage
function saveProjectsToLocalStorage(projects) {
  localStorage.setItem('projects', JSON.stringify(projects));
}

// Fungsi untuk menambahkan proyek baru
function addProject(project) {
  const projects = getProjectsFromLocalStorage();
  projects.unshift(project);
  saveProjectsToLocalStorage(projects);
  displayProjects(); // Tampilkan ulang proyek setelah ditambah
}

// Fungsi untuk menghapus proyek
function deleteProject(projectId) {
  let projects = getProjectsFromLocalStorage();
  projects = projects.filter(project => project.id !== projectId);
  saveProjectsToLocalStorage(projects);
  displayProjects(); // Tampilkan ulang proyek setelah dihapus
}

// Fungsi untuk menampilkan proyek di halaman
function displayProjects() {
  const projectCardsContainer = document.querySelector('.project-cards');
  projectCardsContainer.innerHTML = ''; // Kosongkan container sebelum menampilkan ulang

  const projects = getProjectsFromLocalStorage();

  projects.forEach(project => {
    const card = document.createElement('div');
    card.classList.add('card');

    // Tambahkan gambar
    const img = document.createElement('img');
    img.src = project.image || 'https://via.placeholder.com/150';
    img.alt = project.name;
    card.appendChild(img);

    // Tambahkan judul proyek
    const title = document.createElement('h2');
    title.textContent = project.name;
    card.appendChild(title);

    // Tambahkan tanggal dalam format "31 Aug 2024"
    const date = document.createElement('p');
    const formattedDate = new Date(project.startDate).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    date.textContent = formattedDate;
    card.appendChild(date);

    // Tambahkan durasi proyek
    const duration = document.createElement('p');
    const startDate = new Date(project.startDate);
    const endDate = new Date(project.endDate);
    const durationMonths = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24 * 30));
    duration.textContent = `Duration: ${durationMonths} month${durationMonths > 1 ? 's' : ''}`;
    card.appendChild(duration);

    // Tambahkan deskripsi singkat
    const description = document.createElement('p');
    if (project.description.length>30){
      description.textContent = project.description.slice(0, 30) + '...'; // Tampilkan hanya sebagian deskripsi
    } else {
      description.textContent = project.description
    }
    
    card.appendChild(description);

    // Tambahkan ikon teknologi
    const icons = document.createElement('div');
    icons.classList.add('icons');
    project.technologies.forEach(tech => {
      const icon = document.createElement('i');
      icon.classList.add('fab', `fa-${tech.toLowerCase()}`);
      icons.appendChild(icon);
    });
    card.appendChild(icons);

    // Tambahkan tombol edit dan delete
    const cardButtons = document.createElement('div');
    cardButtons.classList.add('card-buttons');

    const editButton = document.createElement('button');
    editButton.classList.add('edit');
    editButton.textContent = 'Edit';
    cardButtons.appendChild(editButton);

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('delete');
    deleteButton.textContent = 'Delete';
    deleteButton.onclick = (e) => {
      deleteProject(project.id);
    };
    cardButtons.appendChild(deleteButton);

    card.appendChild(cardButtons);

    
    projectCardsContainer.appendChild(card);
  });
}


// Event listener untuk submit form
document.getElementById('projectForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const projectName = document.getElementById('projectName').value;
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;
  const description = document.getElementById('description').value;
  const imageFile = document.getElementById('uploadImage').files[0];
  const technologies = Array.from(document.querySelectorAll('.tech-checkboxes input[type="checkbox"]:checked')).map(checkbox => checkbox.value);

  let imageUrl = '';
  if (imageFile) {
    const reader = new FileReader();
    reader.onloadend = function () {
      imageUrl = reader.result;

      const newProject = {
        id: document.getElementById('uploadImage').dataset.editingId || Date.now().toString(),
        name: projectName,
        startDate: startDate,
        endDate: endDate,
        description: description,
        technologies: technologies,
        image: imageUrl
      };

      if (document.getElementById('uploadImage').dataset.editingId) {
        updateProject(newProject);
        document.getElementById('uploadImage').removeAttribute('data-editingId');
      } else {
        addProject(newProject);
      }

      document.getElementById('projectForm').reset();
    };
    reader.readAsDataURL(imageFile);
  } else {
    const newProject = {
      id: document.getElementById('uploadImage').dataset.editingId || Date.now().toString(),
      name: projectName,
      startDate: startDate,
      endDate: endDate,
      description: description,
      technologies: technologies,
      image: imageUrl
    };

    if (document.getElementById('uploadImage').dataset.editingId) {
      updateProject(newProject);
      document.getElementById('uploadImage').removeAttribute('data-editingId');
    } else {
      addProject(newProject);
    }

    document.getElementById('projectForm').reset();
  }
});

displayProjects();