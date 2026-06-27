import json
from flask import current_app
from google import genai
import logging

logger = logging.getLogger(__name__)

def generate_from_gemini(content, difficulty, question_count):

    client = genai.Client(
        api_key=current_app.config["GEMINI_API_KEY"]
    )

    # -----------------------------
    # Step 1: Concept Analysis
    # -----------------------------
    analysis_prompt = f"""
Analyze the following content and extract:

- Main topics
- Important keywords
- Definitions
- Processes
- Cause and effect relationships
- Examples
- Formulas and numerical facts
- Important names, places, years and terms

Focus on concepts instead of copying sentences.

Return concise structured notes only.

Content:

{content}
"""

    analysis_response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=analysis_prompt
    )

    analysis = analysis_response.text[:5000]

    # -----------------------------
    # Step 2: Question Generation
    # -----------------------------
    generation_prompt = f"""
You are an expert exam question generator.

Generate {question_count} multiple choice questions.

Difficulty: {difficulty}

Concept Analysis:
{analysis}

Original Content:
{content}

Requirements:

- Questions must be self-contained.
- Maximize coverage of important concepts and keywords.
- Cover major topics before repeating concepts.
- Prefer conceptual understanding over sentence memorization.
- Include definitions, processes, functions, examples, comparisons, applications and cause-effect relationships when appropriate.
- Avoid duplicate questions.
- Avoid similar questions.

Do NOT use phrases such as:

- according to the above paragraph
- according to the passage
- according to the information given above
- based on the picture shown above
- from the above figure
- following paragraph

Return ONLY valid JSON:

[
  {{
    "question_text": "Question here",
    "option_a": "Option A",
    "option_b": "Option B",
    "option_c": "Option C",
    "option_d": "Option D",
    "correct_answer": "A"
  }}
]

Rules:

- No markdown
- No explanation
- Strict JSON only
- Ensure questions are derived from the provided content but are self-contained and meaningful without requiring access to the original passage.
"""

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=generation_prompt
        )

        return response.text

    except Exception:
        current_app.logger.exception("Gemini generation failed")

        raise Exception("AI generation failed.")
