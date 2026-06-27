from google import genai
from flask import current_app

def generate_ai_summary(content):

    client = genai.Client(
        api_key=current_app.config["GEMINI_API_KEY"]
    )

    prompt = f"""
Summarize the following content in 2-3 lines.

Rules:
- Keep it simple
- No markdown
- No bullet points
- Focus on subject meaning

Content:
{content}
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    return response.text.strip()