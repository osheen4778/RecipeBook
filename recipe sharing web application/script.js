document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const navLinks = document.querySelectorAll('nav a');
    const sections = document.querySelectorAll('.section');
    const recipeForm = document.getElementById('recipeForm');
    const allRecipesContainer = document.getElementById('allRecipes');
    const featuredRecipesContainer = document.getElementById('featuredRecipes');
    const categoryFilter = document.getElementById('categoryFilter');
    const themeToggle = document.getElementById('themeToggle');
    const formatButtons = document.querySelectorAll('.format-btn');
    const recipeStepsTextarea = document.getElementById('recipeSteps');

    // Initialize app
    loadRecipes();
    setupEventListeners();
    checkTheme();

    // Event Listeners
    function setupEventListeners() {
        // Navigation
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                showSection(targetId);
                setActiveNavLink(this);
            });
        });

        // Recipe Form
        recipeForm.addEventListener('submit', handleFormSubmit);

        // Category Filter
        categoryFilter.addEventListener('change', filterRecipesByCategory);

        // Theme Toggle
        themeToggle.addEventListener('click', toggleTheme);

        // Text Formatting Buttons
        formatButtons.forEach(button => {
            button.addEventListener('click', function() {
                applyFormatting(this.dataset.format);
            });
        });
    }

    // Show Section
    function showSection(sectionId) {
        sections.forEach(section => {
            section.classList.remove('active');
            if (section.id === sectionId) {
                section.classList.add('active');
            }
        });

        // If showing view recipes section, refresh the list
        if (sectionId === 'view-recipes') {
            displayAllRecipes();
        }
    }

    // Set Active Nav Link
    function setActiveNavLink(activeLink) {
        navLinks.forEach(link => {
            link.classList.remove('active');
        });
        activeLink.classList.add('active');
    }

    // Handle Form Submission
    function handleFormSubmit(e) {
        e.preventDefault();

        // Get form values
        const name = document.getElementById('recipeName').value.trim();
        const category = document.getElementById('recipeCategory').value;
        const ingredients = document.getElementById('recipeIngredients').value.trim();
        const steps = document.getElementById('recipeSteps').value.trim();

        // Validate form
        if (!name || !category || !ingredients || !steps) {
            alert('Please fill in all required fields');
            return;
        }

        // Create recipe object
        const recipe = {
            id: Date.now().toString(),
            name,
            category,
            ingredients: ingredients.split('\n').filter(ing => ing.trim() !== ''),
            steps,
            createdAt: new Date().toISOString()
        };

        // Save recipe
        saveRecipe(recipe);

        // Reset form
        recipeForm.reset();

        // Show success message
        alert('Recipe saved successfully!');

        // Show the view recipes section
        showSection('view-recipes');
    }

    // Save Recipe to LocalStorage
    function saveRecipe(recipe) {
        const recipes = getRecipesFromStorage();
        recipes.push(recipe);
        localStorage.setItem('recipes', JSON.stringify(recipes));
    }

    // Get Recipes from LocalStorage
    function getRecipesFromStorage() {
        return JSON.parse(localStorage.getItem('recipes')) || [];
    }

    // Load Recipes on Page Load
    function loadRecipes() {
        displayAllRecipes();
        displayFeaturedRecipes();
    }

    // Display All Recipes
    function displayAllRecipes() {
        const recipes = getRecipesFromStorage();
        allRecipesContainer.innerHTML = '';

        if (recipes.length === 0) {
            allRecipesContainer.innerHTML = '<p class="no-recipes">No recipes found. Add your first recipe!</p>';
            return;
        }

        recipes.forEach(recipe => {
            allRecipesContainer.appendChild(createRecipeCard(recipe));
        });
    }

    // Display Featured Recipes (first 3)
    function displayFeaturedRecipes() {
        const recipes = getRecipesFromStorage();
        featuredRecipesContainer.innerHTML = '';

        if (recipes.length === 0) {
            featuredRecipesContainer.innerHTML = '<p class="no-recipes">No recipes found. Add your first recipe!</p>';
            return;
        }

        const featured = recipes.slice(0, 3);
        featured.forEach(recipe => {
            featuredRecipesContainer.appendChild(createRecipeCard(recipe));
        });
    }

    // Create Recipe Card Element
    function createRecipeCard(recipe) {
        const card = document.createElement('article');
        card.className = 'recipe-card';
        card.dataset.category = recipe.category;

        // Create ingredients table
        let ingredientsTable = '';
        if (recipe.ingredients.length > 0) {
            ingredientsTable = '<table class="recipe-ingredients"><tbody>';
            recipe.ingredients.forEach((ingredient, index) => {
                ingredientsTable += `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${ingredient}</td>
                    </tr>
                `;
            });
            ingredientsTable += '</tbody></table>';
        }

        // Format steps with HTML tags preserved
        const stepsWithFormatting = recipe.steps.replace(/\n/g, '<br>');

        card.innerHTML = `
            <div class="recipe-image">
                <i class="fas fa-utensils"></i>
            </div>
            <div class="recipe-content">
                <h3 class="recipe-title">${recipe.name}</h3>
                <span class="recipe-category">${recipe.category}</span>
                <div class="recipe-ingredients">
                    <h4>Ingredients</h4>
                    ${ingredientsTable}
                </div>
                <div class="recipe-steps">
                    <h4>Preparation Steps</h4>
                    <p>${stepsWithFormatting}</p>
                </div>
            </div>
        `;

        return card;
    }

    // Filter Recipes by Category
    function filterRecipesByCategory() {
        const category = categoryFilter.value;
        const cards = document.querySelectorAll('.recipe-card');

        cards.forEach(card => {
            if (category === 'all' || card.dataset.category === category) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // Text Formatting Functions
    function applyFormatting(format) {
        const textarea = recipeStepsTextarea;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        let formattedText = '';

        switch (format) {
            case 'bold':
                formattedText = `<b>${selectedText}</b>`;
                break;
            case 'italic':
                formattedText = `<i>${selectedText}</i>`;
                break;
            case 'underline':
                formattedText = `<u>${selectedText}</u>`;
                break;
            case 'subscript':
                formattedText = `<sub>${selectedText}</sub>`;
                break;
            case 'superscript':
                formattedText = `<sup>${selectedText}</sup>`;
                break;
            default:
                formattedText = selectedText;
        }

        // Insert formatted text
        textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);

        // Restore cursor position
        textarea.focus();
        textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
    }

    // Theme Toggle Functions
    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
    }

    function checkTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            document.documentElement.removeAttribute('data-theme');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
    }
});