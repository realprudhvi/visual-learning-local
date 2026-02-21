const express = require('express');
const { GoogleGenAI } = require('@google/genai');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from the project root
app.use(express.static(path.join(__dirname)));

app.post('/api/generate', async (req, res) => {
    try {
        const { apiKey, problemDescription } = req.body;

        if (!apiKey) {
            return res.status(400).json({ error: 'Gemini API key is required.' });
        }
        if (!problemDescription) {
            return res.status(400).json({ error: 'Problem description is required.' });
        }

        const selectedModel = req.body.model || 'gemini-2.5-pro';

        const promptPath = path.join(__dirname, 'playground', 'prompt.txt');
        const systemPrompt = fs.readFileSync(promptPath, 'utf-8');

        // Combine the system prompt and the user's problem description
        const combinedPrompt = `${systemPrompt}\n\nUSER PROBLEM DESCRIPTION:\n${problemDescription}`;

        const ai = new GoogleGenAI({ apiKey: apiKey });

        const response = await ai.models.generateContent({
            model: selectedModel,
            contents: combinedPrompt,
        });

        const textResponse = response.text;

        // Try to extract JSON from markdown if it's wrapped in triple backticks
        let jsonStr = textResponse;
        const jsonMatch = textResponse.match(/```(?:json)?([\s\S]*?)```/);
        if (jsonMatch) {
            jsonStr = jsonMatch[1].trim();
        }

        // Validate that it's parseable JSON
        const parsedJson = JSON.parse(jsonStr);

        // Overwrite placeholder.json
        const placeholderPath = path.join(__dirname, 'playground', 'placeholder.json');
        fs.writeFileSync(placeholderPath, JSON.stringify(parsedJson, null, 2), 'utf-8');

        res.json({ success: true, message: 'placeholder.json updated successfully.' });
    } catch (error) {
        console.error('Error generating AI content:', error);
        res.status(500).json({ error: error.message || 'Failed to generate visual.' });
    }
});

app.post('/api/models', async (req, res) => {
    try {
        const { apiKey } = req.body;
        if (!apiKey) {
            return res.status(400).json({ error: 'Gemini API key is required.' });
        }

        const ai = new GoogleGenAI({ apiKey: apiKey });

        // Fetch models using the new SDK
        const response = await ai.models.list();

        // Filter to include only models that support content generation
        let availableModels = [];
        for await (const model of response) {
            if (model.supportedActions && model.supportedActions.includes('generateContent')) {
                // Return the displayable name and the actual model payload id
                availableModels.push({
                    name: model.name,
                    displayName: model.displayName || model.name
                });
            }
        }

        // Fallback or additional filtering if required
        res.json({ success: true, models: availableModels });
    } catch (error) {
        console.error('Error fetching models:', error);
        res.status(500).json({ error: error.message || 'Failed to fetch models.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
    console.log(`Playground available at http://localhost:${PORT}/playground/test.html`);
});
