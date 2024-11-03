document.addEventListener('DOMContentLoaded', function() {
    const packingListContainer = document.getElementById('packing-list-container');
    const newItemInput = document.getElementById('new-item-input');
    const addItemButton = document.getElementById('add-item-button');
    const categorySelect = document.getElementById('category-select');

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

    // Extract unique categories
    const categories = [...new Set(items.map(item => item.category))];

    // Initialize categories in the DOM
    function initializeCategories() {
        packingListContainer.innerHTML = '';
        categories.forEach(category => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'category';
            categoryDiv.dataset.category = category;

            const categoryHeader = document.createElement('div');
            categoryHeader.className = 'category-header';
            categoryHeader.textContent = category;

            const list = document.createElement('ul');
            list.className = 'sortable-list';
            list.dataset.category = category;

            categoryDiv.appendChild(categoryHeader);
            categoryDiv.appendChild(list);
            packingListContainer.appendChild(categoryDiv);
        });
    }

    // Render items into their respective categories
    function renderList() {
        initializeCategories();
        categories.forEach(category => {
            const list = document.querySelector(`ul[data-category="${category}"]`);
            const categoryItems = items.filter(item => item.category === category);
            categoryItems.forEach((item, index) => {
                const listItem = document.createElement('li');
                listItem.className = 'list-item';
                listItem.dataset.id = getItemId(item);

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = item.checked;
                checkbox.addEventListener('change', () => toggleItem(item.id));

                const label = document.createElement('label');
                label.textContent = item.name;
                label.addEventListener('click', () => toggleItem(item.id));

                listItem.appendChild(checkbox);
                listItem.appendChild(label);
                list.appendChild(listItem);
            });
        });
        initializeSortable();
    }

    // Generate a unique ID for each item
    function getItemId(item) {
        return `${item.category}-${item.name}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Toggle item's checked status
    function toggleItem(id) {
        items = items.map(item => {
            const currentId = `${item.category}-${item.name}-${item.idSuffix || ''}`;
            if (currentId.startsWith(id.slice(0, id.indexOf('-')))) {
                return { ...item, checked: !item.checked };
            }
            return item;
        });
        updateLocalStorage();
        renderList();
    }

    // Add a new item
    function addItem() {
        const itemName = newItemInput.value.trim();
        const category = categorySelect.value;
        if (itemName) {
            const newItem = { category, name: itemName, checked: false, idSuffix: Math.random().toString(36).substr(2, 9) };
            items.push(newItem);
            newItemInput.value = '';
            updateLocalStorage();
            renderList();
        }
    }

    // Update localStorage
    function updateLocalStorage() {
        localStorage.setItem('packingList', JSON.stringify(items));
    }

    // Initialize SortableJS for all lists
    function initializeSortable() {
        const sortableLists = document.querySelectorAll('.sortable-list');
        sortableLists.forEach(list => {
            if (list.sortable) return; // Prevent initializing multiple times

            Sortable.create(list, {
                group: 'shared', // To allow dragging between lists
                animation: 150,
                ghostClass: 'sortable-ghost',
                chosenClass: 'sortable-chosen',
                dragClass: 'sortable-drag',
                onAdd: function (evt) {
                    const itemId = evt.item.dataset.id;
                    const newCategory = evt.to.dataset.category;
                    const item = items.find(it => it.idSuffix === itemId.split('-').pop());
                    if (item) {
                        item.category = newCategory;
                        updateLocalStorage();
                        renderList();
                    }
                },
                onUpdate: function (evt) {
                    const category = evt.to.dataset.category;
                    const newIndex = evt.newIndex;
                    const movedItem = items.find(it => it.idSuffix === evt.item.dataset.id.split('-').pop());
                    if (movedItem) {
                        // Remove the item from its current position
                        items = items.filter(it => it !== movedItem);
                        // Insert the item at the new position within the same category
                        const categoryItems = items.filter(it => it.category === category);
                        items.splice(newIndex, 0, movedItem);
                        updateLocalStorage();
                        renderList();
                    }
                }
            });
        });
    }

    // Initialize the app
    renderList();

    // Event listeners
    addItemButton.addEventListener('click', addItem);
    newItemInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addItem();
        }
    });
});
