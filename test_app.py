import os
import sys
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import numpy as np 
import json 
import google.api_core.exceptions # Import for catching API exceptions

# For handling environment variables for API Key
from dotenv import load_dotenv

# --- Google Gemini API Imports ---
import google.generativeai as genai
from google.generativeai.types import GenerationConfig

# --- Core DeepMost Imports ---
try:
    from deepmost import sales
    print("Debug Point 1: Successfully imported deepmost.sales.")
except ImportError as e:
    print("\n" + "="*80)
    print(f"CRITICAL ERROR: Failed to import deepmost.sales: {e}")
    print("Please ensure 'deepmost' is installed correctly. Exiting.")
    print("Check Python version (must be 3.11) and C++ build tools (Windows).")
    print("="*80)
    sys.exit(1)

app = Flask(__name__)
CORS(app) 

# Load environment variables from .env file
load_dotenv()

# --- Configure API Keys ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    print("\n" + "="*80)
    print("CRITICAL ERROR: GEMINI_API_KEY not found in environment variables or .env file.")
    print("Please create a .env file with: GEMINI_API_KEY='YOUR_API_KEY'")
    print("="*80)
    sys.exit(1)

genai.configure(api_key=GEMINI_API_KEY)

# --- Global Model Instances ---
sales_agent = None
gemini_model = None 

# --- Model Initialization Logic (happens once on server startup) ---
print("\n--- Starting DeepMost SalesRLAgent Core Model Initialization ---")
try:
    print("Debug Point 2: Attempting to instantiate sales.Agent (core RL model only).")
    sales_agent = sales.Agent(
        model_path="https://huggingface.co/DeepMostInnovations/sales-conversion-model-reinf-learning/resolve/main/sales_conversion_model.zip",
        auto_download=True,
        use_gpu=False      
    )
    print("Debug Point 3: sales.Agent constructor finished executing (core model only).")
    if sales_agent is not None:
        print("DeepMost SalesRLAgent core model initialized successfully.")
    else:
        print("DeepMost SalesRLAgent core model failed to initialize.")
    
except Exception as e:
    print("\n" + "="*80)
    print(f"CRITICAL ERROR: DeepMost SalesRLAgent core model loading failed during initialization.")
    print(f"Error Type: {type(e).__name__}")
    print(f"Error Message: {e}")
    print("="*80)
    import traceback
    traceback.print_exc()
    sales_agent = None


print("\n--- Starting Gemini LLM (1.5 Flash) Initialization ---")
try:
    print("Debug Point 4: Attempting to initialize Gemini 1.5 Flash model.")
    gemini_model = genai.GenerativeModel('gemini-1.5-flash-latest') 
    test_response = gemini_model.generate_content("Hello.", generation_config=GenerationConfig(max_output_tokens=10))
    print(f"Debug Point 5: Gemini 1.5 Flash test response: {test_response.text[:50]}...")
    print("Gemini LLM (1.5 Flash) initialized successfully.")
except Exception as e:
    print("\n" + "="*80)
    print(f"CRITICAL ERROR: Gemini LLM (1.5 Flash) initialization failed.")
    print(f"Error Type: {type(e).__name__}") 
    print(f"Error Message: {e}")
    print("Ensure your GEMINI_API_KEY is correct and has access to Gemini 1.5 Flash.")
    print("This means LLM chat functionality and enriched metrics will not work.")
    print("="*80)
    import traceback
    traceback.print_exc()
    gemini_model = None 

print("--- Finished Model Initialization Block ---\n")

# --- Flask Routes ---
@app.route('/analyze_conversation', methods=['POST'])
def analyze_conversation():
    if sales_agent is None:
        print("ERROR: API call received but sales_agent (core) is None. Core model not initialized.")
        return jsonify({"error": "SalesRLAgent core model not initialized on backend. Check server logs."}), 500

    try:
        data = request.get_json()
        if not data or 'conversation' not in data:
            return jsonify({"error": "Invalid request. 'conversation' field is required."}), 400

        conversation = data['conversation']
        if not isinstance(conversation, list) or not all(isinstance(turn, str) for turn in conversation):
            return jsonify({"error": "'conversation' must be a list of strings."}), 400

        print(f"Received conversation for analysis: {conversation}")

        all_analysis_results = []
        full_conversation_so_far = []

        # Iterate through each turn to get progressive analysis
        for i, turn_message in enumerate(conversation):
            full_conversation_so_far.append(turn_message)
            
            # DeepMost analysis on the conversation up to this turn
            deepmost_analysis = sales_agent.analyze_conversation_progression(full_conversation_so_far, print_results=False)
            
            # Extract the latest DeepMost probability
            probability = 0.0
            if deepmost_analysis and len(deepmost_analysis) > 0:
                probability = deepmost_analysis[-1]['probability']
            
            # Per-turn LLM metrics and suggestion are now SIMULATED on the frontend
            llm_metrics = {} 
            llm_per_turn_suggestion = ""

            # Combine all data for this turn
            turn_result = {
                "turn": i + 1,
                "speaker": turn_message.split(":")[0].strip() if ":" in turn_message else "Unknown",
                "message": turn_message,
                "probability": probability,
                "status": "calculated", # Always calculated by DeepMost
                "metrics": llm_metrics, # This will be empty, frontend will use simulation
                "llm_per_turn_suggestion": llm_per_turn_suggestion # This will be empty, frontend will use simulation
            }
            all_analysis_results.append(turn_result)
        
        # We now return immediately, and LLM advice is fetched via a separate endpoint
        return jsonify({"results": all_analysis_results, "llm_advice_pending": True}), 200

    except Exception as e:
        print(f"Error during conversation analysis: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"An error occurred during analysis: {str(e)}"}), 500

# NEW ENDPOINT for asynchronous LLM advice
@app.route('/get_llm_advice', methods=['POST'])
def get_llm_advice():
    if gemini_model is None:
        print("ERROR: LLM advice requested but Gemini LLM is not initialized or available.")
        return jsonify({"points": ["LLM advice unavailable. Gemini failed to load on backend."]}), 500

    try:
        data = request.get_json()
        conversation = data.get('conversation', [])
        if not conversation:
            return jsonify({"points": ["No conversation provided for LLM advice."]}), 400

        full_convo_text = "\n".join(conversation)
        advice_prompt = (
            f"Analyze the entire following sales conversation:\n\n"
            f"{full_convo_text}\n\n"
            f"As a concise sales coach, provide actionable advice to the salesperson on how to best progress this sales call towards a successful outcome. "
            f"Provide this advice as a JSON object with a single key 'points' which is an array of strings, where each string is a distinct, actionable bullet point. "
            f"Do NOT include any other text outside the JSON object. Ensure the JSON is well-formed and complete."
        )
        print(f"Prompting Gemini for structured full conversation advice (async): {advice_prompt[:200]}...") 
        try:
            gemini_response = gemini_model.generate_content(
                [advice_prompt],
                generation_config=GenerationConfig(
                    response_mime_type="application/json",
                    response_schema={"type": "OBJECT", "properties": {"points": {"type": "ARRAY", "items": {"type": "STRING"}}}, "required": ["points"]},
                    max_output_tokens=300,
                    temperature=0.6
                )
            )
            raw_json_string = ""
            if gemini_response and gemini_response.candidates and len(gemini_response.candidates) > 0 and \
               gemini_response.candidates[0].content and gemini_response.candidates[0].content.parts and \
               len(gemini_response.candidates[0].content.parts) > 0:
                raw_json_string = gemini_response.candidates[0].content.parts[0].text.strip() # Added .strip()
                print(f"Raw LLM JSON response (async): {raw_json_string}")
            else:
                print("Warning: Empty or malformed LLM response for overall advice (async).")
                return jsonify({"points": ["LLM returned an empty or malformed response."]}), 200 # Return explicit message

            parsed_advice = {}
            try:
                parsed_advice = json.loads(raw_json_string)
                if "points" in parsed_advice and isinstance(parsed_advice["points"], list):
                    print(f"Gemini Structured Full Conversation Advice (async): {parsed_advice}")
                    return jsonify(parsed_advice), 200
                else:
                    # If JSON parsed but structure is wrong
                    print(f"Warning: LLM did not return 'points' array in structured advice (async): {raw_json_string}")
                    return jsonify({"points": ["LLM response was not structured as expected (missing 'points' array). Raw: " + raw_json_string[:100] + "..."]}), 200
            except json.JSONDecodeError as json_e:
                print(f"JSON parsing error for overall advice (async): {json_e}. Raw string: {raw_json_string}")
                # More user-friendly message for JSON parsing errors
                return jsonify({"points": ["Error parsing LLM JSON advice. This happens with incomplete LLM responses (e.g., due to API rate limits or max tokens). Please try a shorter conversation or wait a moment. Raw response starts with: " + raw_json_string[:100] + "..."]})
            except Exception as parse_e:
                print(f"General error parsing LLM JSON advice (async): {parse_e}. Raw string: {raw_json_string}")
                return jsonify({"points": ["General error with LLM JSON parsing. Raw response starts with: " + raw_json_string[:100] + "..."]})
                
        except google.api_core.exceptions.ResourceExhausted as quota_e:
            print(f"Quota Exceeded for LLM advice (async): {quota_e}")
            return jsonify({"points": ["Quota Exceeded: Cannot generate overall LLM advice due to API rate limits. Please try again in a minute or two."]}), 200
        except Exception as e:
            print(f"Error generating structured Gemini advice for full conversation (async): {e}")
            import traceback
            traceback.print_exc()
            return jsonify({"points": [f"Error generating LLM advice: {type(e).__name__} - {e}"]}), 200

    except Exception as e:
        print(f"An unexpected error occurred in /get_llm_advice: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"points": [f"An unexpected error occurred: {type(e).__name__} - {e}"]}), 500


@app.route('/chat_llm', methods=['POST'])
def chat_llm():
    if gemini_model is None:
        print("ERROR: Gemini LLM instance is not initialized or available.")
        return jsonify({"error": "LLM chat functionality unavailable. Gemini failed to load."}), 500
    
    try:
        data = request.get_json()
        user_message = data.get('message', '')
        if not user_message:
            return jsonify({"error": "No message provided."}), 400

        print(f"Received message for LLM chat: {user_message}")

        general_chat_prompt = f"Respond to the following message concisely: '{user_message}'"
        chat_response_obj = gemini_model.generate_content(
            general_chat_prompt,
            generation_config=GenerationConfig(max_output_tokens=150, temperature=0.7)
        )
        chat_response = chat_response_obj.text.strip()
        print(f"Gemini Raw Chat Response: {chat_response}")

        json_prompt = (
            f"Analyze the following message: '{user_message}'. "
            f"Provide a JSON object with 'summary', 'sentiment' (positive/neutral/negative), "
            f"and 'keywords' (array of strings). Do not include any other text outside the JSON block."
        )
        json_response_obj = gemini_model.generate_content(
            [json_prompt],
            generation_config=GenerationConfig(
                response_mime_type="application/json",
                max_output_tokens=200,
                temperature=0.1
            )
        )
        json_response = json_response_obj.text.strip() # Added .strip()
        print(f"Gemini Raw JSON Prompt Response: {json_response}")
        
        parsed_json_output = None
        try:
            parsed_json_output = json.loads(json_response)
            print(f"Parsed JSON from Gemini chat: {parsed_json_output}")

        except json.JSONDecodeError as e:
            print(f"JSON parsing error for chat_llm (Gemini): {e}. Raw string: {json_response}") # Added raw string to error log
        except Exception as e:
            print(f"General error during JSON parsing attempt for chat_llm (Gemini): {e}. Raw string: {json_response}") # Added raw string to error log

        return jsonify({
            "user_message": user_message,
            "raw_chat_response": chat_response,
            "raw_json_prompt_response": json_response,
            "parsed_json_metrics": parsed_json_output,
            "status": "success"
        }), 200

    except Exception as e:
        print(f"Error during LLM chat: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"An error occurred during LLM chat: {str(e)}"}), 500

@app.route('/')
def index():
    status_message = "DeepMost SalesRLAgent Backend is running and core model initialized successfully."
    if gemini_model is not None:
        status_message += " Gemini LLM (1.5 Flash) is also initialized and available for chat and conversation advice."
    else:
        status_message += " Gemini LLM (1.5 Flash) failed to load. LLM chat and enriched metrics will be unavailable."

    status_message += " (Voice-to-Text feature is currently disabled)."

    return render_template('index.html', status_message=status_message)


# --- Main Execution Block ---
if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=False)

