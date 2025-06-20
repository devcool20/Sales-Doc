from llama_cpp import Llama
import os

# Configuration for TinyLlama Q2_K GGUF (from TheBloke)
# This script is ONLY for testing llama-cpp-python's ability to load a GGUF model directly.
MODEL_ID = "TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF"
MODEL_FILENAME = "tinyllama-1.1b-chat-v1.0.Q2_K.gguf"

print(f"--- Attempting to load LLM: {MODEL_ID} with filename {MODEL_FILENAME} ---")
print("This will download the model (~400MB) if not cached.")

try:
    llm = Llama.from_pretrained(
        repo_id=MODEL_ID,
        filename=MODEL_FILENAME,
        verbose=True,
        n_gpu_layers=0,
        n_ctx=2048
    )
    print("\n✅ Success: LLM loaded directly with llama-cpp-python!")
    
    print("\n--- Testing a simple inference ---")
    prompt = "What is the capital of France?"
    print(f"Prompt: {prompt}")
    output = llm(
        prompt,
        max_tokens=30,
        stop=["\n", "."],
        echo=False,
        temperature=0.1
    )
    print(f"Response: {output['choices'][0]['text']}")
    print("\n--- Inference Test Complete ---")

except Exception as e:
    print("\n" + "="*80)
    print(f"❌ ERROR: Failed to load LLM directly using llama-cpp-python.")
    print(f"Error Type: {type(e).__name__}")
    print(f"Error Message: {e}")
    print("\nThis indicates a fundamental issue with llama-cpp-python on your system.")
    print("Possible causes: Insufficient RAM, CPU not compatible with the pre-built llama-cpp-python binary, or a corrupted download of this specific model.")
    print("="*80)
    import traceback
    traceback.print_exc()

print("\n--- Test Script Finished ---")
