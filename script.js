document.addEventListener('DOMContentLoaded', function() {
    const packingListContainer = document.getElementById('packing-list-container');
    const newItemInput = document.getElementById('new-item-input');
    const addItemButton = document.getElementById('add-item-button');
    const categorySelect = document.getElementById('category-select');
    const addCategoryButton = document.getElementById('add-category-button');
    const categoryModal = document.getElementById('category-modal');
    const closeCategoryModalButtons = document.querySelectorAll('.close-button');
    const saveCategoryButton = document.getElementById('save-category-button');
    const newCategoryInput = document.getElementById('new-category-input');
    const editModal = document.getElementById('edit-modal');
    const editItemInput = document.getElementById('edit-item-input');
    const saveEditButton = document.getElementById('save-edit-button');

    // Predefined categories and items
    const predefinedItems = [
        { id: generateUniqueId(), category: 'Clothing', name: 'T-shirts', checked: false },
        { id: generateUniqueId(), category: 'Clothing', name: 'Jeans', checked: false },
        { id: generateUniqueId(), category: 'Clothing', name: 'Jacket', checked: false },
        { id: generateUniqueId(), category: 'Toiletries', name: 'Toothbrush', checked: false },
        { id: generateUniqueId(), category: 'Toiletries', name: 'Toothpaste', checked: false },
        { id: generateUniqueId(), category: 'Toiletries', name: 'Shampoo', checked: false },
        { id: generateUniqueId(), category: 'Electronics', name: 'Phone Charger', checked: false },
        { id: generateUniqueId(), category: 'Electronics', name: 'Headphones', checked: false },
        { id: generateUniqueId(), category: 'Electronics', name: 'Adapter', checked: false },
        { id: generateUniqueId(), category: 'Miscellaneous', name: 'Passport', checked: false },
        { id: generateUniqueId(), category: 'Miscellaneous', name: 'Travel Pillow', checked: false },
        { id: generateUniqueId(), category: 'Miscellaneous', name: 'Snacks', checked: false }
    ];

    // Initialize items from localStorage or use predefined items
    let items = JSON.parse(localStorage.getItem('packingList'));
    if (!items || !Array.isArray(items)) {
        items = predefinedItems;
        updateLocalStorage();
    }

    // Extract unique categories
    let categories = [...new Set(items.map(item => item.category))];

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

            // Add delete button to category header
            const deleteCategoryButton = document.createElement('button');
            deleteCategoryButton.className = 'delete-category';
            deleteCategoryButton.innerHTML = '&times;';
            deleteCategoryButton.title = 'Delete Category';
            deleteCategoryButton.addEventListener('click', () => deleteCategory(category));
            categoryHeader.appendChild(deleteCategoryButton);

            const list = document.createElement('ul');
            list.className = 'sortable-list';
            list.dataset.category = category;

            // Add items to the list
            const categoryItems = items.filter(item => item.category === category);
            categoryItems.forEach(item => {
                const listItem = createListItem(item);
                list.appendChild(listItem);
            });

            // Add "Add item" button
            const addItemButton = document.createElement('div');
            addItemButton.className = 'add-item-button';
            addItemButton.innerHTML = '+';
            addItemButton.title = 'Add Item';
            addItemButton.addEventListener('click', () => addItemToCategory(category));

            categoryDiv.appendChild(categoryHeader);
            categoryDiv.appendChild(list);
            categoryDiv.appendChild(addItemButton);

            packingListContainer.appendChild(categoryDiv);
        });
    }

    // Create a list item element
    function createListItem(item) {
        const listItem = document.createElement('li');
        listItem.className = 'list-item';
        listItem.dataset.id = item.id;

        const dragHandle = document.createElement('span');
        dragHandle.className = 'drag-handle';
        dragHandle.innerHTML = '&#9776;'; // Hamburger icon

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = item.checked;
        checkbox.addEventListener('change', () => toggleItemChecked(item.id));

        const label = document.createElement('label');
        label.textContent = item.name;
        label.addEventListener('click', () => openEditModal(item.id, item.name));

        listItem.appendChild(dragHandle);
        listItem.appendChild(checkbox);
        listItem.appendChild(label);

        return listItem;
    }

    // Render the packing list
    function renderList() {
        initializeCategories();
        initializeSortable();
    }

    // Initialize SortableJS for all lists
    function initializeSortable() {
        const sortableLists = document.querySelectorAll('.sortable-list');
        sortableLists.forEach(list => {
            if (list.sortableInitialized) return; // Prevent initializing multiple times

            Sortable.create(list, {
                group: 'shared',
                animation: 150,
                handle: '.drag-handle',
                ghostClass: 'sortable-ghost',
                chosenClass: 'sortable-chosen',
                dragClass: 'sortable-drag',
                onEnd: function(evt) {
                    const itemId = evt.item.dataset.id;
                    const newCategory = evt.to.dataset.category;
                    const oldCategory = evt.from.dataset.category;

                    if (newCategory !== oldCategory) {
                        const item = items.find(it => it.id === itemId);
                        if (item) {
                            item.category = newCategory;
                            updateLocalStorage();
                        }
                    }

                    // Reorder items within the new category
                    const newListItems = Array.from(evt.to.children).filter(child => child.classList.contains('list-item'));
                    const updatedCategoryItems = newListItems.map(child => {
                        const id = child.dataset.id;
                        return items.find(it => it.id === id);
                    });

                    // Remove all items from the new category and re-add them in the new order
                    items = items.filter(it => it.category !== newCategory).concat(updatedCategoryItems);

                    updateLocalStorage();
                }
            });
            list.sortableInitialized = true;
        });
    }

    // Toggle item's checked status
    function toggleItemChecked(id) {
        items = items.map(item => item.id === id ? { ...item, checked: !item.checked } : item);
        updateLocalStorage();
    }

    // Add a new item globally (Not used now)
    function addItem() {
        const itemName = newItemInput.value.trim();
        const category = categorySelect.value;
        if (itemName) {
            const newItem = { id: generateUniqueId(), category, name: itemName, checked: false };
            items.push(newItem);
            newItemInput.value = '';
            updateLocalStorage();
            renderList();
        }
    }

    // Add a new item to a specific category
    function addItemToCategory(category) {
        const itemName = prompt(`Add a new item to "${category}":`);
        if (itemName && itemName.trim() !== '') {
            const newItem = { id: generateUniqueId(), category, name: itemName.trim(), checked: false };
            items.push(newItem);
            updateLocalStorage();
            renderList();
        }
    }

    // Add a new category via modal
    function openAddCategoryModal() {
        categoryModal.style.display = 'block';
        newCategoryInput.value = '';
        newCategoryInput.focus();
    }

    // Close modals
    function closeModals() {
        categoryModal.style.display = 'none';
        editModal.style.display = 'none';
    }

    // Save new category
    function saveNewCategory() {
        const newCategory = newCategoryInput.value.trim();
        if (newCategory && !categories.includes(newCategory)) {
            categories.push(newCategory);
            updateLocalStorage();
            renderList();
            categoryModal.style.display = 'none';
        } else {
            alert('Category name is empty or already exists.');
        }
    }

    // Delete a category
    function deleteCategory(category) {
        const confirmDelete = confirm(`Are you sure you want to delete the category "${category}"? All items within will also be deleted.`);
        if (confirmDelete) {
            items = items.filter(item => item.category !== category);
            categories = categories.filter(cat => cat !== category);
            updateLocalStorage();
            renderList();
        }
    }

    // Open edit modal
    let currentEditItemId = null;
    function openEditModal(id, currentName) {
        currentEditItemId = id;
        editModal.style.display = 'block';
        editItemInput.value = currentName;
        editItemInput.focus();
    }

    // Save edited item
    function saveEditedItem() {
        const newName = editItemInput.value.trim();
        if (newName && currentEditItemId) {
            items = items.map(item => item.id === currentEditItemId ? { ...item, name: newName } : item);
            updateLocalStorage();
            renderList();
            editModal.style.display = 'none';
            currentEditItemId = null;
        } else {
            alert('Item name cannot be empty.');
        }
    }

    // Generate unique ID
    function generateUniqueId() {
        return 'id-' + Math.random().toString(36).substr(2, 16);
    }

    // Update localStorage
    function updateLocalStorage() {
        localStorage.setItem('packingList', JSON.stringify(items));
    }

    // Event Listeners
    addItemButton.addEventListener('click', addItem); // May not be used if per-category add buttons are used
    newItemInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addItem();
        }
    });

    addCategoryButton.addEventListener('click', openAddCategoryModal);

    closeCategoryModalButtons.forEach(button => {
        button.addEventListener('click', closeModals);
    });

    window.addEventListener('click', function(event) {
        if (event.target === categoryModal || event.target === editModal) {
            closeModals();
        }
    });

    saveCategoryButton.addEventListener('click', saveNewCategory);

    saveEditButton.addEventListener('click', saveEditedItem);

    editItemInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            saveEditedItem();
        }
    });

    // Initialize the list on load
    renderList();
});
