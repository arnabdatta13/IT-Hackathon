# your_app/consumers.py

from channels.generic.websocket import AsyncWebsocketConsumer
import json


from channels.generic.websocket import AsyncWebsocketConsumer
from dotenv import load_dotenv
from openai import OpenAI
import os
import json
from asgiref.sync import sync_to_async
import uuid
from typing import Dict
import os
from dotenv import load_dotenv
import websockets
import base64
from elevenlabs import ElevenLabs
import asyncio
from asgiref.sync import sync_to_async
from django.contrib import messages
import re
from google.cloud import texttospeech
from google.oauth2 import service_account
import time
from django.utils import timezone
from channels.db import database_sync_to_async
import math    
from google import genai
from google.genai import types


# Load the API key from the .env file
load_dotenv()



ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
elevenlabs = ElevenLabs(api_key=ELEVENLABS_API_KEY)

# Load environment variables


# OpenAI and Deepgram API keys
api_key = os.getenv("OPENAI_API_KEY")


openai_client = OpenAI(
    api_key= api_key
)


class MyConsumer(AsyncWebsocketConsumer):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.messages = []
        self.elevenlabs_socket = None
        self.prompt = """
You are "EduMentor" – a highly intelligent, friendly, and supportive AI tutor who teaches Math, Physics, Biology, and Chemistry. Your role is to explain concepts clearly, interactively, and with empathy—just like a top human teacher. You teach mainly in English, but when a concept is too hard to understand, you give a simple Bangla translation or short explanation to help the student.

Follow these teaching principles:

1. **Start by asking the student**:
   - What subject and topic they need help with (Math, Physics, Biology, or Chemistry)
   - Their grade or level
   - Whether they prefer mostly English or a mix of English + Bangla explanations

2. **Explain step-by-step**: Teach from the basics to advanced, one idea at a time. Use simple language, examples, and real-life analogies.

3. **Bangla support**:
   - If the student seems confused or the concept is difficult, translate or summarize the key point in Bangla.
   - Use this style:  
     “So, in simple Bangla, this means…”  
     Or  
     “বাংলায় সহজ করে বললে, এটা মানে…”

4. **Use questions and interaction**:
   - Ask the student small questions to keep them engaged.
   - Encourage them to think, solve mini problems, and participate.

5. **Explain visually**:
   - If there’s a formula, diagram, or process, describe what it would look like and why it works.
   - Make learning imaginative and visual even without images.

6. **Correct mistakes gently**:
   - If a student answers incorrectly, explain the error kindly.
   - Say something like: “Nice try! Let me show you the correct way.”

7. **Adapt to their level**:
   - For younger students, use simpler terms and more Bangla.
   - For older or advanced learners, go deeper and keep most explanations in English.

8. **Use memory tricks**:
   - Offer mnemonics, fun facts, or stories to help the student remember key information.

9. **Stay positive and motivating**:
   - Celebrate small wins, praise effort, and never make the student feel bad for not knowing something.

At the start of every session, say:

**"Hi! I'm EduMentor, your AI teacher. What subject and topic would you like help with today—Math, Physics, Biology, or Chemistry? Also, what grade are you in, and do you prefer mostly English or a mix of English and Bangla?"**



        """
        

    async def connect(self):
        #await self.connect_to_deepgram()
        await self.accept()

        
    async def disconnect(self, close_code):
        # Cancel the periodic task if it exists
        
        # Existing disconnect code
        if hasattr(self, 'socket') and self.socket:
            try:
                await self.socket.disconnect()
            except AttributeError:
                print("The socket does not support disconnecting directly.")
    
    async def receive(self,bytes_data=None,text_data= None):
        
        if bytes_data:
            # Process audio data
            if self.socket:
                self.socket.send(bytes_data)
        if text_data:
            data = json.loads(text_data)
            print(data)
            
            if data.get("type") == "input":
                asyncio.create_task(self.agent(data.get("value")))  # Process transcript in parallel

            


    async def agent(self, query):
        system_message = [{"role": "system", "content": self.prompt}]
        self.messages.append({"role": "user", "content": query})
        
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=system_message + self.messages,
            temperature=0.2,
            stream=True
        )

        text_buffer = ""
        # Stream chunks to client
        for chunk in response:
            content = chunk.choices[0].delta.content
            if content:
                text_buffer += content
                await self.send(text_data=json.dumps({"type": "output", "value": content}))

        # Signal end of message
        await self.send(text_data=json.dumps({"type": "end"}))
        self.messages.append({"role": "assistant", "content": text_buffer})
