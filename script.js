document.addEventListener('DOMContentLoaded', function() {
    const packingList = document.getElementById('packing-list');
    const newItemInput = document.getElementById('new-item-input');
    const addItemButton = document.getElementById('add-item-button');

    // Predefined categories and items
    const predefinedItems = [
        { category: 'Clothing', name: 'T-shirts', checked: false },
        { category: 'Clothing', name: 'Jeans', checked: false },
        { category: 'Clothing', name: 'Jacket', checked: false },
        { category: 'Toiletries', name: 'Toothbrush', checked: false },
        { category: 'Toiletries', name: 'Toothpaste', checked: false },
        { category: 'Toiletries', name: 'Shampoo', checked: false },
        { category: 'Electronics', name: 'Phone Charger', checked: false },
        { category: 'Electronics', name: 'Headphones', checked: false },
        { category: 'Electronics', name: 'Adapter', checked: false },
        { category: 'Miscellaneous', name: 'Passport', checked: false },
        { category: 'Miscellaneous', name: 'Travel Pillow', checked: false },
        { category: 'Miscellaneous', name: 'Snacks', checked: false }
    ];

    // Retrieve items from localStorage or use predefined items
    let items = JSON.parse(localStorage.getItem('packingList'));
    if (!items) {
        items = predefinedItems;
        updateLocalStorage();
    }

    function renderList() {
        packingList.innerHTML = '';
        let currentCategory = '';
        items.forEach((item, index) => {
            if (item.category !== currentCategory) {
                currentCategory = item.category;
                const categoryHeader = document.createElement('li');
                categoryHeader.className = 'category-header';
                categoryHeader.textContent = currentCategory;
                packingList.appendChild(categoryHeader);
            }

            const listItem = document.createElement('li');
            listItem.className = 'list-item';
            listItem.setAttribute('data-id', index);

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = item.checked;
            checkbox.onchange = () => toggleItem(index);

            const label = document.createElement('label');
            label.textContent = item.name;

            listItem.appendChild(checkbox);
            listItem.appendChild(label);

            packingList.appendChild(listItem);
        });
    }

    function addItem() {
        const itemName = newItemInput.value.trim();
        if (itemName) {
            // For simplicity, assign new items to 'Miscellaneous' category
            items.push({ category: 'Miscellaneous', name: itemName, checked: false });
            newItemInput.value = '';
            updateLocalStorage();
            renderList();
            sortable.destroy(); // Destroy existing Sortable instance
            initializeSortable(); // Re-initialize Sortable
        }
    }

    function toggleItem(index) {
        items[index].checked = !items[index].checked;
        updateLocalStorage();
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

    // Initialize SortableJS
    function initializeSortable() {
        Sortable.create(packingList, {
            animation: 150,
            handle: '.list-item',
            onEnd: function (evt) {
                // Update items array based on new order
                const movedItem = items.splice(evt.oldIndex - countCategoryHeaders(evt.oldIndex), 1)[0];
                const newIndex = evt.newIndex - countCategoryHeaders(evt.newIndex);
                items.splice(newIndex, 0, movedItem);
                updateLocalStorage();
                renderList();
                initializeSortable(); // Re-initialize after re-rendering
            }
        });
    }

    // Helper function to count category headers before a given index
    function countCategoryHeaders(index) {
        return items.slice(0, index).filter(item => item.category).length;
    }

    renderList();
    initializeSortable();
});
