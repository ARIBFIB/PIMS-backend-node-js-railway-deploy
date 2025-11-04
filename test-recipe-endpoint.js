const axios = require('axios');

// Test data
const recipeData = {
  name: "Test Recipe",
  description: "A test recipe for verification",
  category: "Test",
  prepTime: 15,
  cookTime: 30,
  servings: 4,
  difficulty: "medium",
  instructions: ["Step 1", "Step 2", "Step 3"],
  ingredients: [
    {
      inventoryId: 1,
      quantity: 2,
      unit: "pieces"
    }
  ],
  additionalCosts: [],
  notes: "Test notes"
};

// Test the endpoint
async function testRecipeEndpoint() {
  try {
    // First, let's try to login to get a token
    const loginResponse = await axios.post('http://localhost:4000/api/auth/login', {
      email: 'admin@prodx.com',
      password: 'Admin123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('Login successful, token received');
    
    // Now test the recipe creation endpoint
    const response = await axios.post('http://localhost:4000/api/recipes', recipeData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Recipe creation response:', response.data);
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

testRecipeEndpoint();