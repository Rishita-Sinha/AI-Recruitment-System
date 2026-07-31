from ollama import chat


def ask_llm(prompt: str, model: str = "llama3.2"):
    response = chat(
        model=model,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    return response.message.content