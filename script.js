document.addEventListener('DOMContentLoaded', function() {
    const packingList = document.getElementById('packing-list');
    const newItemInput = document.getElementById('new-item-input');
    const addItemButton = document.getElementById('add-item-button');

    let items = JSON.parse(localStorage.getItem('packingList')) || [];

    function renderList() {
        packingList.innerHTML = '';
        items.forEach((item, index) => {
            const listItem = document.createElement('li');
            listItem.className = 'list-item';

            const moveButtons = document.createElement('div');
            moveButtons.className = 'move-buttons';

            const moveUpButton = document.createElement('button');
            moveUpButton.innerHTML = '⬆️';
            moveUpButton.onclick = () => moveItemUp(index);

            const moveDownButton = document.createElement('button');
            moveDownButton.innerHTML = '⬇️';
            moveDownButton.onclick = () => moveItemDown(index);

            moveButtons.appendChild(moveUpButton);
            moveButtons.appendChild(moveDownButton);

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = item.checked;
            checkbox.onchange = () => toggleItem(index);

            const label = document.createElement('label');
            label.textContent = item.name;

            listItem.appendChild(moveButtons);
            listItem.appendChild(checkbox);
            listItem.appendChild(label);

            packingList.appendChild(listItem);
        });
    }

    function addItem() {
        const itemName = newItemInput.value.trim();
        if (itemName) {
            items.push({ name: itemName, checked: false });
            newItemInput.value = '';
            updateLocalStorage();
            renderList();
        }
    }

    function toggleItem(index) {
        items[index].checked = !items[index].checked;
        updateLocalStorage();
    }

    function moveItemUp(index) {
        if (index > 0) {
            [items[index - 1], items[index]] = [items[index], items[index - 1]];
            updateLocalStorage();
            renderList();
        }
    }

    function moveItemDown(index) {
        if (index < items.length - 1) {
            [items[index + 1], items[index]] = [items[index], items[index + 1]];
            updateLocalStorage();
            renderList();
        }
    }

    function updateLocalStorage() {
        localStorage.setItem('packingList', JSON.stringify(items));
    }

    addItemButton.addEventListener('click', addItem);
    newItemInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addItem();
        }
    });

    renderList();
});
