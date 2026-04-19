import requests

r = requests.post(
    'http://localhost:11434/api/generate',
    json={
        'model': 'llama3',
        'prompt': 'Respond with only a JSON object, no explanation, no markdown, no backticks. Keys: intents (array), filename, language, content. User said: Create a Python file with a hello world function.',
        'stream': False
    },
    timeout=120
)
print(r.json().get('response'))