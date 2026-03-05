const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyA_...'; // Mock key or rely on env
const promptDesc = 'A simple resistor';

async function testGen() {
    try {
        const response = await fetch('http://localhost:3000/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                apiKey: 'test-key', // Server doesn't strictly validate format if groq/gemini SDK handles it later, wait actually we might need a real key.
                platform: 'gemini',
                model: 'gemini-2.5-flash',
                problemDescription: promptDesc,
                section: 'eee'
            })
        });

        const text = await response.text();
        console.log("Status:", response.status);
        console.log("Response:", text.substring(0, 500));
    } catch (e) {
        console.error("Fetch error:", e);
    }
}

testGen();
