const openModal = document.getElementById('open-modal');
const closeModal = document.getElementById('close-modal');

const modal = document.querySelector('.modal-wrapper');

closeModal.onclick = () => {
	modal.style.display = 'none';
};

openModal.onclick = () => {
	modal.style.display = 'flex';
};
