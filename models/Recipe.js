// models/Recipe.js
export class Recipe {
    constructor({
                    id = Date.now().toString(),
                    name,
                    description,
                    category,
                    prepTime,
                    cookTime,
                    servings,
                    ingredients,
                    steps,
                    image,
                    macros,
                    createdAt = new Date(),
                    updatedAt = new Date()
                }) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.category = category;
        this.prepTime = prepTime;        // en minutes
        this.cookTime = cookTime;        // en minutes
        this.servings = servings;
        this.ingredients = ingredients;   // [{name, amount, unit}]
        this.steps = steps;              // [{step, description}]
        this.image = image;              // uri
        this.macros = {
            calories: macros?.calories || 0,
            protein: macros?.protein || 0,
            carbs: macros?.carbs || 0,
            fat: macros?.fat || 0,
            ...macros
        };
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    get totalTime() {
        return this.prepTime + this.cookTime;
    }

    get macrosPerServing() {
        return {
            calories: Math.round(this.macros.calories / this.servings),
            protein: Math.round(this.macros.protein / this.servings),
            carbs: Math.round(this.macros.carbs / this.servings),
            fat: Math.round(this.macros.fat / this.servings)
        };
    }
}