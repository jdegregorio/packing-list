document.addEventListener('DOMContentLoaded', function() {
    // Initialize Materialize Components
    M.AutoInit();

    const packingListContainer = document.getElementById('packing-list-container');
    const addCategoryButton = document.getElementById('add-category-button');
    const resetButton = document.getElementById('reset-button');
    const categoryModal = document.getElementById('category-modal');
    const saveCategoryButton = document.getElementById('save-category-button');
    const newCategoryInput = document.getElementById('new-category-input');
    const categoryModalInstance = M.Modal.init(categoryModal);

    // Comprehensive default items for a family with children
    const defaultItems = [
        // (Same as before, but you can add more items or categories as needed)
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
            const categoryCard = document.createElement('div');
            categoryCard.className = 'card category-card';
            categoryCard.dataset.category = category;

            const categoryHeader = document.createElement('div');
            categoryHeader.className = 'category-header';

            const categoryTitle = document.createElement('span');
            categoryTitle.className = 'category-title';
            categoryTitle.textContent = category;
            categoryTitle.addEventListener('dblclick', () => enableCategoryEditing(categoryTitle, category));

            const categoryActions = document.createElement('div');
            categoryActions.className = 'category-actions';

            const deleteCategoryIcon = document.createElement('i');
            deleteCategoryIcon.className = 'material-icons';
            deleteCategoryIcon.textContent = 'delete';
            deleteCategoryIcon.title = 'Delete Category';
            deleteCategoryIcon.addEventListener('click', () => deleteCategory(category));

            categoryActions.appendChild(deleteCategoryIcon);

            categoryHeader.appendChild(categoryTitle);
            categoryHeader.appendChild(categoryActions);

            const list = document.createElement('ul');
            list.className = 'collection sortable-list';
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
            addItemButton.textContent = '+ Add Item';
            addItemButton.addEventListener('click', () => addItemToCategory(category));

            categoryCard.appendChild(categoryHeader);
            categoryCard.appendChild(list);
            categoryCard.appendChild(addItemButton);

            packingListContainer.appendChild(categoryCard);
        });
    }

    // Create a list item element
    function createListItem(item) {
        const listItem = document.createElement('li');
        listItem.className = 'collection-item';
        listItem.dataset.id = item.id;

        const dragHandle = document.createElement('i');
        dragHandle.className = 'material-icons';
        dragHandle.textContent = 'drag_handle';

        const checkbox = document.createElement('label');
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = item.checked;
        input.addEventListener('change', () => toggleItemChecked(item.id));
        const span = document.createElement('span');
        span.className = 'checkbox-label';
        span.textContent = item.name;
        span.addEventListener('dblclick', () => enableItemEditing(span, item));

        checkbox.appendChild(input);
        checkbox.appendChild(span);

        listItem.appendChild(dragHandle);
        listItem.appendChild(checkbox);

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
                handle: '.material-icons',
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
                    const newListItems = Array.from(evt.to.children).filter(child => child.classList.contains('collection-item'));
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
        M.Modal.getInstance(document.getElementById('add-item-modal')).open();
        // Implement modal input for adding items
    }

    // Add a new category via modal
    function openAddCategoryModal() {
        categoryModalInstance.open();
    }

    // Save new category
    function saveNewCategory() {
        const newCategory = newCategoryInput.value.trim();
        if (newCategory && !categories.includes(newCategory)) {
            categories.push(newCategory);
            updateLocalStorage();
            renderList();
            categoryModalInstance.close();
            newCategoryInput.value = '';
        } else {
            M.toast({html: 'Category name is empty or already exists.'});
        }
    }

    // Delete a category
    function deleteCategory(category) {
        if (confirm(`Are you sure you want to delete the category "${category}"? All items within will also be deleted.`)) {
            items = items.filter(item => item.category !== category);
            categories = categories.filter(cat => cat !== category);
            updateLocalStorage();
            renderList();
        }
    }

    // Enable inline editing for items
    function enableItemEditing(span, item) {
        const currentText = span.textContent;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.className = 'editable-input';
        span.replaceWith(input);
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
            M.toast({html: 'Item name cannot be empty.'});
            renderList();
        }
    }

    // Enable inline editing for categories
    function enableCategoryEditing(span, category) {
        const currentName = span.textContent;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentName;
        input.className = 'editable-input';
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
            M.toast({html: 'Category name cannot be empty or already exists.'});
            renderList();
        }
    }

    // Reset to default items
    function resetToDefault() {
        if (confirm('Are you sure you want to reset the packing list to its default state? This will delete all your current items and categories.')) {
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
    saveCategoryButton.addEventListener('click', saveNewCategory);
    resetButton.addEventListener('click', resetToDefault);

    // Initialize the list on load
    renderList();
});
