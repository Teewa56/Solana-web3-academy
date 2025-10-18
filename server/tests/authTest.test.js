const axios = require('axios');

// Base URL
const BASE_URL = 'http://localhost:5000/api/v1';

// Test Health Endpoint
async function testHealthEndpoint() {
    try {
        console.log('\n========== TESTING HEALTH ENDPOINT ==========\n');
        
        // Test 1: Check health status
        console.log('Test 1: GET /health');
        console.log('Expected: 200 OK with success: true');
        
        const response = await axios.get(`${BASE_URL}/health`);
        
        console.log('\nResponse Status:', response.status);
        console.log('Response Data:', response.data);
        
        // Validate response
        if (response.status === 200 && response.data.success === true) {
            console.log('\n✅ Test PASSED - Health endpoint is working');
            return true;
        } else {
            console.log('\n❌ Test FAILED - Unexpected response');
            return false;
        }
        
    } catch (error) {
        console.log('\n❌ Test FAILED - Error occurred');
        console.log('Error Status:', error.response?.status);
        console.log('Error Data:', error.response?.data);
        console.log('Error Message:', error.message);
        return false;
    }
}

// Run the test
testHealthEndpoint();