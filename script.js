document.addEventListener('DOMContentLoaded', function() {
    const packingListContainer = document.getElementById('packing-list-container');
    const addCategoryButton = document.getElementById('add-category-button');
    const resetButton = document.getElementById('reset-button');
    const categoryModal = document.getElementById('category-modal');
    const closeCategoryModalButtons = document.querySelectorAll('.close-button');
    const saveCategoryButton = document.getElementById('save-category-button');
    const newCategoryInput = document.getElementById('new-category-input');

    // Comprehensive default items for a family with children
    const defaultItems = [
        // Clothing
        { id: generateUniqueId(), category: 'Clothing', name: 'T-shirts', checked: false },
        { id: generateUniqueId(), category: 'Clothing', name: 'Jeans/Pants', checked: false },
        { id: generateUniqueId(), category: 'Clothing', name: 'Shorts', checked: false },
        { id: generateUniqueId(), category: 'Clothing', name: 'Sweaters/Jackets', checked: false },
        { id: generateUniqueId(), category: 'Clothing', name: 'Socks', checked: false },
        { id: generateUniqueId(), category: 'Clothing', name: 'Underwear', checked: false },
        { id: generateUniqueId(), category: 'Clothing', name: 'Pajamas', checked: false },
        { id: generateUniqueId(), category: 'Clothing', name: 'Comfortable Shoes', checked: false },
        { id: generateUniqueId(), category: 'Clothing', name: 'Sandals/Flip-flops', checked: false },
        // Toiletries
        { id: generateUniqueId(), category: 'Toiletries', name: 'Toothbrush', checked: false },
        { id: generateUniqueId(), category: 'Toiletries', name: 'Toothpaste', checked: false },
        { id: generateUniqueId(), category: 'Toiletries', name: 'Shampoo & Conditioner', checked: false },
        { id: generateUniqueId(), category: 'Toiletries', name: 'Body Wash/Soap', checked: false },
        { id: generateUniqueId(), category: 'Toiletries', name: 'Deodorant', checked: false },
        { id: generateUniqueId(), category: 'Toiletries', name: 'Hairbrush/Comb', checked: false },
        { id: generateUniqueId(), category: 'Toiletries', name: 'Sunscreen', checked: false },
        { id: generateUniqueId(), category: 'Toiletries', name: 'First Aid Kit', checked: false },
        // Electronics
        { id: generateUniqueId(), category: 'Electronics', name: 'Phone Charger', checked: false },
        { id: generateUniqueId(), category: 'Electronics', name: 'Portable Power Bank', checked: false },
        { id: generateUniqueId(), category: 'Electronics', name: 'Headphones/Earbuds', checked: false },
        { id: generateUniqueId(), category: 'Electronics', name: 'Camera & Accessories', checked: false },
        { id: generateUniqueId(), category: 'Electronics', name: 'Travel Adapter', checked: false },
        // Miscellaneous
        { id: generateUniqueId(), category: 'Miscellaneous', name: 'Passport/ID', checked: false },
        { id: generateUniqueId(), category: 'Miscellaneous', name: 'Travel Itinerary', checked: false },
        { id: generateUniqueId(), category: 'Miscellaneous', name: 'Wallet', checked: false },
        { id: generateUniqueId(), category: 'Miscellaneous', name: 'Sunglasses', checked: false },
        { id: generateUniqueId(), category: 'Miscellaneous', name: 'Books/E-books', checked: false },
        { id: generateUniqueId(), category: 'Miscellaneous', name: 'Snacks', checked: false },
        { id: generateUniqueId(), category: 'Miscellaneous', name: 'Reusable Water Bottle', checked: false },
        { id: generateUniqueId(), category: 'Miscellaneous', name: 'Travel Pillow', checked: false },
        // Children's Items
        { id: generateUniqueId(), category: 'Children', name: 'Diapers/Wipes', checked: false },
        { id: generateUniqueId(), category: 'Children', name: 'Baby Bottles', checked: false },
        { id: generateUniqueId(), category: 'Children', name: 'Kids’ Clothing', checked: false },
        { id: generateUniqueId(), category: 'Children', name: 'Favorite Toys', checked: false },
        { id: generateUniqueId(), category: 'Children', name: 'Children’s Medications', checked: false },
        { id: generateUniqueId(), category: 'Children', name: 'Stroller/Carrier', checked: false },
        { id: generateUniqueId(), category: 'Children', name: 'Snacks/Food', checked: false },
    ];

    // Initialize items from localStorage or use default items
    let items = JSON.parse(localStorage.getItem('packingList'));
    if (!items || !Array.isArray(items)) {
        items = defaultItems;
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

            const categoryName = document.createElement('span');
            categoryName.className = 'category-name';
            categoryName.textContent = category;
            categoryName.addEventListener('dblclick', () => enableCategoryEditing(categoryName, category));

            const deleteCategoryButton = document.createElement('button');
            deleteCategoryButton.className = 'delete-category';
            deleteCategoryButton.innerHTML = '&times;';
            deleteCategoryButton.title = 'Delete Category';
            deleteCategoryButton.addEventListener('click', () => deleteCategory(category));

            categoryHeader.appendChild(categoryName);
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
        label.className = 'editable';
        label.addEventListener('dblclick', () => enableItemEditing(label, item));

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

    // Enable inline editing for items
    function enableItemEditing(label, item) {
        const currentText = label.textContent;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.className = 'edit-input';
        label.replaceWith(input);
        input.focus();

        input.addEventListener('blur', () => saveItemEditing(input, item));
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                saveItemEditing(input, item);
            }
        });
    }

    // Save edited item
    function saveItemEditing(input, item) {
        const newName = input.value.trim();
        if (newName !== '') {
            item.name = newName;
            updateLocalStorage();
            renderList();
        } else {
            alert('Item name cannot be empty.');
            renderList();
        }
    }

    // Enable inline editing for categories
    function enableCategoryEditing(span, category) {
        const currentName = span.textContent;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentName;
        input.className = 'edit-input';
        span.replaceWith(input);
        input.focus();

        input.addEventListener('blur', () => saveCategoryEditing(input, category));
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                saveCategoryEditing(input, category);
            }
        });
    }

    // Save edited category
    function saveCategoryEditing(input, oldCategory) {
        const newCategory = input.value.trim();
        if (newCategory && !categories.includes(newCategory)) {
            // Update category name in items
            items.forEach(item => {
                if (item.category === oldCategory) {
                    item.category = newCategory;
                }
            });
            // Update categories list
            categories = categories.map(cat => cat === oldCategory ? newCategory : cat);
            updateLocalStorage();
            renderList();
        } else {
            alert('Category name cannot be empty or already exists.');
            renderList();
        }
    }

    // Reset to default items
    function resetToDefault() {
        const confirmReset = confirm('Are you sure you want to reset the packing list to its default state? This will delete all your current items and categories.');
        if (confirmReset) {
            items = defaultItems;
            categories = [...new Set(items.map(item => item.category))];
            updateLocalStorage();
            renderList();
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
    addCategoryButton.addEventListener('click', openAddCategoryModal);

    closeCategoryModalButtons.forEach(button => {
        button.addEventListener('click', closeModals);
    });

    window.addEventListener('click', function(event) {
        if (event.target === categoryModal) {
            closeModals();
        }
    });

    saveCategoryButton.addEventListener('click', saveNewCategory);

    resetButton.addEventListener('click', resetToDefault);

    // Initialize the list on load
    renderList();
});
