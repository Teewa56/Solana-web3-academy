const axios = require('axios');

const testSQLInjection = async () => {
    const payload = "' OR '1'='1";
    try {
        const response = await axios.post('http://localhost:3000/api/v1/login', {
            username: payload,
            password: 'password'
        });
        if (response.data.success) {
            console.log('SQL Injection Test Failed: Vulnerability Detected');
        }
        else {
            console.log('SQL Injection Test Passed: No Vulnerability Detected');
        }
    }
    catch (error) {
        console.log('SQL Injection Test Passed: No Vulnerability Detected');
    }
};

const testXSS = async () => {
    const payload = '<script>alert("XSS")</script>';
    try {
        const response = await axios.post('http://localhost:3000/api/v1/login', {
            comment: payload
        });
        if (response.data.comment.includes(payload)) {
            console.log('XSS Test Failed: Vulnerability Detected');
        }
        else {
            console.log('XSS Test Passed: No Vulnerability Detected');
        }
    }
    catch (error) {
        console.log('XSS Test Passed: No Vulnerability Detected');
    }
};

const runPenetrationTests = async () => {
    await testSQLInjection();
    await testXSS();
};

runPenetrationTests();