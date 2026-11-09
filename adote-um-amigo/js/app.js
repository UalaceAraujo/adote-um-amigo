/**
 * Adote um Amigo - Script Principal
 * Controla renderização, filtros reativos, modais, cadastro no LocalStorage
 * e integração de contato via WhatsApp.
 */

// Chave para armazenamento no localStorage
const STORAGE_KEY = 'adote_um_amigo_pets_data_v1';

// Estado global da aplicação
let petsState = [];
let currentFilter = {
  search: '',
  species: 'all',
  size: 'all',
  gender: 'all'
};

// Elementos do DOM
const petsGrid = document.getElementById('petsGrid');
const emptyState = document.getElementById('emptyState');
const resultsCount = document.getElementById('resultsCount');
const activeFilterChips = document.getElementById('activeFilterChips');

// Inputs de filtro
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const speciesFilter = document.getElementById('speciesFilter');
const sizeFilter = document.getElementById('sizeFilter');
const genderFilter = document.getElementById('genderFilter');
const resetFiltersBtn = document.getElementById('resetFiltersBtn');
const emptyResetBtn = document.getElementById('emptyResetBtn');

// Modais
const petDetailModal = document.getElementById('petDetailModal');
const petDetailModalBody = document.getElementById('petDetailModalBody');
const closeDetailModalBtn = document.getElementById('closeDetailModalBtn');

const newPetModal = document.getElementById('newPetModal');
const openNewPetModalBtn = document.getElementById('openNewPetModalBtn');
const footerNewPetBtn = document.getElementById('footerNewPetBtn');
const closeNewPetModalBtn = document.getElementById('closeNewPetModalBtn');
const cancelNewPetBtn = document.getElementById('cancelNewPetBtn');
const newPetForm = document.getElementById('newPetForm');

const adoptInterestModal = document.getElementById('adoptInterestModal');
const closeInterestModalBtn = document.getElementById('closeInterestModalBtn');
const cancelInterestBtn = document.getElementById('cancelInterestBtn');
const adoptionInterestForm = document.getElementById('adoptionInterestForm');
const interestPetIdInput = document.getElementById('interestPetId');
const interestModalPetTarget = document.getElementById('interestModalPetTarget');

// Stats e Menu Mobile
const statsWaiting = document.getElementById('statsWaiting');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.getElementById('navLinks');
const toastContainer = document.getElementById('toastContainer');

// ==========================================
// INICIALIZAÇÃO
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  loadPets();
  setupEventListeners();
  renderPets();
  updateStats();
});

// Carrega os pets do LocalStorage ou utiliza os dados iniciais do data.js
function loadPets() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      petsState = JSON.parse(stored);
    } catch (e) {
      console.error('Erro ao ler localStorage:', e);
      petsState = [...initialPets];
    }
  } else {
    petsState = [...initialPets];
    savePetsToStorage();
  }
}

function savePetsToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(petsState));
}

// Atualiza o contador de pets aguardando lar
function updateStats() {
  if (statsWaiting) {
    statsWaiting.textContent = petsState.length;
  }
}

// ==========================================
// RENDERIZAÇÃO DOS CARDS DE PETS
// ==========================================
function renderPets() {
  const filtered = filterPets();

  // Atualizar contador e estado vazio
  resultsCount.textContent = `Mostrando ${filtered.length} ${filtered.length === 1 ? 'animal' : 'animais'}`;
  renderFilterChips();

  if (filtered.length === 0) {
    petsGrid.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';

  petsGrid.innerHTML = filtered.map(pet => {
    const isDog = pet.species === 'dog';
    const speciesLabel = isDog ? 'Cachorro' : 'Gato';
    const speciesClass = isDog ? 'dog' : 'cat';
    const genderIcon = pet.gender === 'Fêmea' 
      ? '<i class="fa-solid fa-venus gender-female" title="Fêmea"></i>' 
      : '<i class="fa-solid fa-mars gender-male" title="Macho"></i>';

    return `
      <article class="pet-card" data-id="${pet.id}">
        <div class="pet-card-image-wrap">
          <img src="${pet.photo}" alt="${pet.name}, ${pet.breed}" class="pet-card-img" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80'">
          <span class="species-tag ${speciesClass}">${speciesLabel}</span>
          <span class="location-tag"><i class="fa-solid fa-location-dot"></i> ${pet.location}</span>
        </div>

        <div class="pet-card-body">
          <div class="pet-name-row">
            <h3 class="pet-name">${pet.name}</h3>
            <span class="pet-gender-icon">${genderIcon}</span>
          </div>
          <p class="pet-breed">${pet.breed}</p>

          <div class="pet-spec-tags">
            <span class="spec-pill"><i class="fa-regular fa-clock"></i> ${pet.age}</span>
            <span class="spec-pill"><i class="fa-solid fa-ruler"></i> Porte ${pet.size}</span>
          </div>

          <div class="pet-health-row">
            <span class="health-item ${pet.vaccinated ? 'checked' : ''}">
              <i class="fa-solid ${pet.vaccinated ? 'fa-check' : 'fa-xmark'}"></i> Vacinas
            </span>
            <span class="health-item ${pet.neutered ? 'checked' : ''}">
              <i class="fa-solid ${pet.neutered ? 'fa-check' : 'fa-xmark'}"></i> Castrado
            </span>
            <span class="health-item ${pet.dewormed ? 'checked' : ''}">
              <i class="fa-solid ${pet.dewormed ? 'fa-check' : 'fa-xmark'}"></i> Vermifugado
            </span>
          </div>

          <div class="pet-card-actions">
            <button class="btn btn-secondary btn-detail" onclick="openPetDetail('${pet.id}')">
              <i class="fa-solid fa-circle-info"></i> Detalhes
            </button>
            <button class="btn btn-primary btn-adopt" onclick="openAdoptInterestModal('${pet.id}')">
              <i class="fa-solid fa-heart"></i> Adotar
            </button>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

// ==========================================
// FILTROS E BUSCA
// ==========================================
function filterPets() {
  const searchTerm = currentFilter.search.trim().toLowerCase();

  return petsState.filter(pet => {
    // Filtro por termo digitado (Nome, raça, localização, descrição)
    const matchesSearch = !searchTerm || 
      pet.name.toLowerCase().includes(searchTerm) ||
      pet.breed.toLowerCase().includes(searchTerm) ||
      pet.location.toLowerCase().includes(searchTerm) ||
      pet.description.toLowerCase().includes(searchTerm);

    // Filtro por espécie
    const matchesSpecies = currentFilter.species === 'all' || pet.species === currentFilter.species;

    // Filtro por porte
    const matchesSize = currentFilter.size === 'all' || pet.size === currentFilter.size;

    // Filtro por sexo
    const matchesGender = currentFilter.gender === 'all' || pet.gender === currentFilter.gender;

    return matchesSearch && matchesSpecies && matchesSize && matchesGender;
  });
}

function renderFilterChips() {
  const chips = [];

  if (currentFilter.search) {
    chips.push(`<span class="chip">Busca: "${currentFilter.search}" <i class="fa-solid fa-xmark" style="cursor:pointer" onclick="clearSearchInput()"></i></span>`);
  }
  if (currentFilter.species !== 'all') {
    const label = currentFilter.species === 'dog' ? 'Cachorro' : 'Gato';
    chips.push(`<span class="chip">${label}</span>`);
  }
  if (currentFilter.size !== 'all') {
    chips.push(`<span class="chip">Porte ${currentFilter.size}</span>`);
  }
  if (currentFilter.gender !== 'all') {
    chips.push(`<span class="chip">${currentFilter.gender}</span>`);
  }

  activeFilterChips.innerHTML = chips.join('');
}

function clearSearchInput() {
  searchInput.value = '';
  currentFilter.search = '';
  clearSearchBtn.style.display = 'none';
  renderPets();
}

function resetAllFilters() {
  searchInput.value = '';
  speciesFilter.value = 'all';
  sizeFilter.value = 'all';
  genderFilter.value = 'all';

  currentFilter = {
    search: '',
    species: 'all',
    size: 'all',
    gender: 'all'
  };

  clearSearchBtn.style.display = 'none';
  renderPets();
  showToast('Filtros restaurados com sucesso!', 'info');
}

// ==========================================
// MODAL DETALHES DO PET
// ==========================================
window.openPetDetail = function(petId) {
  const pet = petsState.find(p => p.id === petId);
  if (!pet) return;

  const isDog = pet.species === 'dog';
  const speciesLabel = isDog ? 'Cachorro' : 'Gato';
  const speciesClass = isDog ? 'dog' : 'cat';

  petDetailModalBody.innerHTML = `
    <div class="detail-modal-layout">
      <div class="detail-modal-image">
        <img src="${pet.photo}" alt="${pet.name}" onerror="this.src='https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80'">
      </div>

      <div class="detail-modal-info">
        <div class="detail-header-row">
          <h2 class="detail-pet-name">${pet.name}</h2>
          <span class="species-tag ${speciesClass}">${speciesLabel}</span>
        </div>

        <div class="detail-badges">
          <span class="spec-pill"><i class="fa-solid fa-location-dot"></i> ${pet.location}</span>
          <span class="spec-pill"><i class="fa-solid fa-venus-mars"></i> ${pet.gender}</span>
        </div>

        <h4 class="detail-section-title">Sobre ${pet.name}</h4>
        <p class="detail-story">${pet.description}</p>

        <h4 class="detail-section-title">Características</h4>
        <div class="detail-specs-grid">
          <div class="spec-entry">
            <span>Raça</span>
            <span>${pet.breed}</span>
          </div>
          <div class="spec-entry">
            <span>Idade</span>
            <span>${pet.age}</span>
          </div>
          <div class="spec-entry">
            <span>Porte</span>
            <span>${pet.size}</span>
          </div>
          <div class="spec-entry">
            <span>Nível de Energia</span>
            <span>${pet.energy || 'Médio'}</span>
          </div>
        </div>

        <h4 class="detail-section-title">Saúde e Cuidados</h4>
        <div class="detail-health-box">
          <div class="health-tags-list">
            <span class="health-chip"><i class="fa-solid fa-check"></i> ${pet.vaccinated ? 'Vacinado(a)' : 'Vacinas pendentes'}</span>
            <span class="health-chip"><i class="fa-solid fa-check"></i> ${pet.neutered ? 'Castrado(a)' : 'Não castrado'}</span>
            <span class="health-chip"><i class="fa-solid fa-check"></i> ${pet.dewormed ? 'Vermifugado(a)' : 'Vermifugação pendente'}</span>
          </div>
        </div>

        <div class="detail-cta-area">
          <button class="btn btn-primary btn-lg" style="width: 100%;" onclick="closeModal(petDetailModal); openAdoptInterestModal('${pet.id}');">
            <i class="fa-solid fa-heart"></i> Quero Adotar o(a) ${pet.name}
          </button>
        </div>
      </div>
    </div>
  `;

  openModal(petDetailModal);
};

// ==========================================
// MODAL INTERESSE DE ADOÇÃO (WHATSAPP)
// ==========================================
window.openAdoptInterestModal = function(petId) {
  const pet = petsState.find(p => p.id === petId);
  if (!pet) return;

  interestPetIdInput.value = pet.id;
  interestModalPetTarget.textContent = `Você está manifestando interesse em adotar ${pet.name} (${pet.breed}).`;
  openModal(adoptInterestModal);
};

adoptionInterestForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const petId = interestPetIdInput.value;
  const pet = petsState.find(p => p.id === petId);
  if (!pet) return;

  const adopterName = document.getElementById('adopterName').value.trim();
  const adopterCity = document.getElementById('adopterCity').value.trim();
  const adopterHomeType = document.getElementById('adopterHomeType').value;
  const adopterOtherPets = document.getElementById('adopterOtherPets').value.trim();
  const adopterMessage = document.getElementById('adopterMessage').value.trim();

  // Construir mensagem estruturada para WhatsApp
  const cleanPhone = (pet.contactWhatsapp || '5516999999999').replace(/\D/g, '');
  const textMessage = `Olá! Vi o anúncio no site *Adote um Amigo* e tenho muito interesse em adotar o(a) *${pet.name}* (ID: ${pet.id}).\n\n` +
    `*Meus Dados:*\n` +
    `• Nome: ${adopterName}\n` +
    `• Cidade: ${adopterCity}\n` +
    `• Tipo de Residência: ${adopterHomeType}\n` +
    `• Outros animais em casa: ${adopterOtherPets}\n` +
    (adopterMessage ? `• Mensagem adicional: ${adopterMessage}\n\n` : `\n`) +
    `Gostaria de saber os próximos passos para a adoção responsável! Obrigado!`;

  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(textMessage)}`;

  // Fechar modal, limpar formulário e abrir WhatsApp
  closeModal(adoptInterestModal);
  adoptionInterestForm.reset();
  showToast(`Redirecionando para o WhatsApp do responsável por ${pet.name}...`, 'success');

  window.open(waUrl, '_blank');
});

// ==========================================
// CADASTRO DE NOVO ANIMAL
// ==========================================
newPetForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = document.getElementById('petFormName').value.trim();
  const species = document.getElementById('petFormSpecies').value;
  const breed = document.getElementById('petFormBreed').value.trim();
  const gender = document.getElementById('petFormGender').value;
  const size = document.getElementById('petFormSize').value;
  const age = document.getElementById('petFormAge').value.trim();
  const location = document.getElementById('petFormLocation').value.trim();
  const photo = document.getElementById('petFormPhoto').value.trim();
  const whatsapp = document.getElementById('petFormWhatsapp').value.trim();
  const vaccinated = document.getElementById('petFormVaccinated').checked;
  const neutered = document.getElementById('petFormNeutered').checked;
  const dewormed = document.getElementById('petFormDewormed').checked;
  const description = document.getElementById('petFormDescription').value.trim();

  const newPet = {
    id: `pet-${Date.now()}`,
    name,
    species,
    breed,
    gender,
    size,
    age,
    energy: 'Média',
    location,
    photo,
    contactWhatsapp: whatsapp,
    vaccinated,
    neutered,
    dewormed,
    description,
    createdAt: new Date().toISOString().split('T')[0]
  };

  // Inserir no topo da lista
  petsState.unshift(newPet);
  savePetsToStorage();
  updateStats();
  renderPets();

  // Reset e fechar modal
  newPetForm.reset();
  closeModal(newPetModal);
  showToast(`O pet ${name} foi cadastrado com sucesso e já está disponível!`, 'success');

  // Rolar suavemente para a seção do catálogo
  document.getElementById('catalogo').scrollIntoView({ behavior: 'smooth' });
});

// ==========================================
// CONTROLE DE MODAIS GENÉRICO
// ==========================================
function openModal(modal) {
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

// Fechar ao clicar fora do container do modal
document.querySelectorAll('.modal-overlay').forEach(modal => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal(modal);
    }
  });
});

// ==========================================
// TOAST FEEDBACK
// ==========================================
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-info'}"></i>
    <span>${message}</span>
  `;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ==========================================
// LISTENERS DE EVENTOS
// ==========================================
function setupEventListeners() {
  // Input de busca em tempo real com debounce simples
  let searchTimeout;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    clearSearchBtn.style.display = e.target.value ? 'block' : 'none';
    searchTimeout = setTimeout(() => {
      currentFilter.search = e.target.value;
      renderPets();
    }, 200);
  });

  clearSearchBtn.addEventListener('click', clearSearchInput);

  // Dropdowns de filtro
  speciesFilter.addEventListener('change', (e) => {
    currentFilter.species = e.target.value;
    renderPets();
  });

  sizeFilter.addEventListener('change', (e) => {
    currentFilter.size = e.target.value;
    renderPets();
  });

  genderFilter.addEventListener('change', (e) => {
    currentFilter.gender = e.target.value;
    renderPets();
  });

  // Botões de Reset
  resetFiltersBtn.addEventListener('click', resetAllFilters);
  emptyResetBtn.addEventListener('click', resetAllFilters);

  // Modais de Cadastro e Fechamento
  openNewPetModalBtn.addEventListener('click', () => openModal(newPetModal));
  footerNewPetBtn.addEventListener('click', () => openModal(newPetModal));
  closeNewPetModalBtn.addEventListener('click', () => closeModal(newPetModal));
  cancelNewPetBtn.addEventListener('click', () => closeModal(newPetModal));

  closeDetailModalBtn.addEventListener('click', () => closeModal(petDetailModal));

  closeInterestModalBtn.addEventListener('click', () => closeModal(adoptInterestModal));
  cancelInterestBtn.addEventListener('click', () => closeModal(adoptInterestModal));

  // Fechar modais com tecla ESC
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.active').forEach(modal => closeModal(modal));
    }
  });

  // Toggle Menu Mobile
  mobileMenuBtn.addEventListener('click', () => {
    const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
    mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
    navLinks.classList.toggle('show');
  });

  // Fechar menu mobile ao clicar em um link
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('show');
      mobileMenuBtn.setAttribute('aria-expanded', 'false');
    });
  });
}
