require('dotenv').config()
const express = require('express');
const fileUpload = require('express-fileupload');
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
    apiKey: process.env.API_KEY,
});
const openai = new OpenAIApi(configuration);
const pdfParse = require('pdf-parse');


const app = express();
const port = 4567;

app.use(fileUpload());

// Initialize OpenAI API with your API key

// Route to upload a PDF file and ask a question to OpenAI about it
app.post('/pdf', async (req, res) => {
    if (!req.files || !req.body.question) {
        return res.status(400).json({ message: 'Missing required parameters' });
    }

    const pdf = req.files.pdf;
    const question = req.body.question;

    // Check if uploaded file is a PDF
    if (!pdf.name.endsWith('.pdf')) {
        return res.status(400).json({ message: 'Invalid file format. Only PDF files are allowed' });
    }
    pdfParse(pdf.data).then(function(data) {
        const context = data.text.replace(/\s{2,}/g,' ').trim()
        console.log(context)

        openai.createCompletion({
            model: 'text-davinci-003',
            prompt: question + ' ' + context,
            max_tokens: 500,
        })

            .then(response => {
                console.log(response.data)
                const answer = response.data.choices[0].text.trim();
                res.json({ question, answer });
            })
            .catch(error => {
                console.error(error);
                res.status(500).json({ message: 'An error occurred while processing the request' });
            });
        // PDF text

    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});