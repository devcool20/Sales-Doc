Sales Doc: Real-Time Sales Conversion Prediction & Coaching

![image](https://github.com/user-attachments/assets/141bcb29-b356-4101-a5f7-12cb96dbaf19)

![image](https://github.com/user-attachments/assets/a7612bf4-e24f-41e9-8590-4d59956970f3)



🚀 Overview
Sales Doc is an innovative web application that leverages a hybrid AI approach to provide real-time sales conversation analysis and actionable coaching. It combines a highly optimized Reinforcement Learning (RL) model for rapid conversion probability prediction with a powerful Large Language Model (LLM) for nuanced conversational insights and overall sales advice.

This project aims to demonstrate how specialized, high-performance AI models can be integrated with generative LLMs to create intelligent tools for sales teams, improving efficiency and conversion rates.

✨ Features
Real-time Conversion Probability: Dynamically tracks the probability of a sale converting after each turn of a conversation using a specialized RL model.

Turn-by-Turn Breakdown: Provides detailed metrics for each conversation turn, including simulated customer sentiment, engagement, salesperson effectiveness, objections, and clarity of next steps.

Per-Turn Salesperson Suggestions: Offers instant, context-aware coaching tips for sales representatives based on the simulated metrics of each turn.

Overall LLM-Powered Sales Advice: Generates comprehensive, actionable advice for the entire conversation using a powerful Large Language Model (Gemini 1.5 Flash).

LLM Chat Tester: A dedicated section to directly interact with the integrated LLM for general conversational queries.

Performance Benchmarking: Demonstrates the superior speed and accuracy of the core RL model compared to traditional methods and LLM-only approaches.

Responsive Web UI: A clean, intuitive, and responsive user interface built with HTML, Tailwind CSS, and Chart.js.

🧠 Architecture
SalesRLAgent employs a hybrid architecture to combine the strengths of different AI paradigms:

Reinforcement Learning Core (DeepMost SalesRLAgent): This is the high-performance backbone responsible for the rapid, turn-by-turn conversion probability prediction. It is a specialized model designed for sequential decision-making in sales conversations.

Large Language Model (Google Gemini 1.5 Flash): This powerful LLM is integrated for its deep understanding of natural language, providing:

Overall Sales Coaching Advice: It analyzes the full conversation context to generate high-level, actionable recommendations.

General Chat Capabilities: Allows users to query the LLM directly.

This hybrid approach ensures both speed (from the specialized RL model) and high-quality, nuanced insights (from the LLM).

📊 Models Used
DeepMost SalesRLAgent (Core RL Model):

Type: Reinforcement Learning Agent (specifically, a custom-trained sales conversion model).

Purpose: Predicts sales conversion probability turn-by-turn.

Source: Hosted on Hugging Face: DeepMostInnovations/sales-conversion-model-reinf-learning

Performance: Optimized for low latency (avg. 85ms inference time) and high accuracy (96.7%).

Google Gemini 1.5 Flash (LLM):

Type: Large Language Model.

Purpose: Provides structured, actionable sales coaching advice for entire conversations and handles general chat queries.

Integration: Accessed via the Google Gemini API.

🛠️ Implementation Details
Backend (app.py - Flask)
Framework: Flask

Language: Python 3.11

Core Logic: Integrates the deepmost library for sales conversation analysis.

LLM Integration: Communicates with the Google Gemini API (google-generativeai library) for overall conversation advice and general chat.

API Endpoints:

/analyze_conversation (POST): Takes conversation turns, returns DeepMost probability progression.

/get_llm_advice (POST): Asynchronously fetches structured LLM advice for the full conversation.

/chat_llm (POST): Handles direct chat interactions with the LLM.

Data Handling: Uses json for data serialization, flask-cors for cross-origin requests.

Environment Variables: python-dotenv for securely loading GEMINI_API_KEY.

Error Handling: Robust try-except blocks to manage API errors (e.g., ResourceExhausted from Gemini, JSON parsing issues) and provide informative messages to the frontend.

Frontend (index.html - HTML, CSS, JavaScript)
Structure: Standard HTML5 for page layout.

Styling: Tailwind CSS for utility-first responsive design. Loaded via CDN for simplicity.

Interactivity: Vanilla JavaScript for DOM manipulation, event handling, and API calls to the Flask backend.

Charts: Chart.js library for dynamic visualization of conversion probability, accuracy, and speed comparisons.

Client-Side Simulation: Per-turn metrics (sentiment, engagement, topics) and salesperson suggestions are simulated on the frontend using simple keyword matching and rule-based logic. This offloads frequent, granular analysis from the LLM, ensuring a very fast and responsive turn-by-turn experience.

Asynchronous LLM Calls: The overall LLM advice is fetched asynchronously, preventing the UI from freezing while waiting for the LLM response.

Iconography: Inline SVG for simple icons (e.g., external link).

⚙️ Setup Instructions
To get this project up and running locally, follow these steps:

1. Backend Setup (Python)
Clone the repository:

git clone https://github.com/your-username/sales-rl-agent.git
cd sales-rl-agent/sales-backend

(Adjust the path if your project structure is different, e.g., cd sales-backend-3.11)

Create and activate a virtual environment (recommended):

python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

Install Python dependencies:

pip install Flask Flask-Cors numpy python-dotenv google-generativeai deepmost

Note: The deepmost library might require specific Python 3.11 and C++ build tools on Windows. Refer to the deepmost documentation if you encounter installation issues.

Set up your Gemini API Key:

Obtain a Gemini API key from Google AI Studio.

Create a file named .env in your sales-backend directory (the same directory as app.py) and add your API key:

GEMINI_API_KEY='YOUR_GEMINI_API_KEY_HERE'

Replace 'YOUR_GEMINI_API_KEY_HERE' with your actual key.

Run the Flask backend server:

python app.py

You should see output indicating the Flask server is running on http://127.0.0.1:5000. Keep this terminal window open.

2. Frontend Setup (HTML/JavaScript)
The frontend is a single index.html file, so no separate build process is required for it.

Navigate to the frontend directory:

cd sales-rl-agent/sales-frontend

(Adjust the path if your project structure is different, e.g., cd sales-frontend)

Open index.html in your web browser:
Simply open the index.html file using your web browser (e.g., by double-clicking it in your file explorer, or by typing file:///path/to/your/sales-frontend/index.html in the browser address bar).

Important: Ensure your Flask backend is running before opening the HTML file, as the frontend will try to connect to it for analysis.

🚀 Usage
Access the Dashboard: Open index.html in your web browser (ensure the Flask backend is running).

Interactive Conversation Analyzer:

Enter a sales conversation in the text area, with each turn on a new line (e.g., Customer: Hello, Sales Rep: Hi there!).

Alternatively, click one of the "Or try an example" buttons to load a pre-defined scenario.

Click "Analyze Conversation".

Observe the "Conversion Probability Evolution" chart update in real-time.

Review the "Turn-by-Turn Breakdown" for detailed metrics and simulated salesperson suggestions for each turn.

Check the "Overall AI Suggestion for this Conversation" box for high-level advice from the LLM (this will appear after a short delay).

![image](https://github.com/user-attachments/assets/853b8fd4-8eb2-4476-b88d-ebd494bed495)


LLM Chat Tester:

![image](https://github.com/user-attachments/assets/752de8f2-ca6e-4062-9d76-58b0f7c19b1b)


Navigate to the "LLM Chat Tester" section.

Type a message into the input field and press Enter or click "Send to LLM" to interact directly with the Gemini 1.5 Flash model.

Explore Other Sections: Browse the "Performance", "How It Works", and "Use Cases" sections to understand the model's capabilities and architecture.
