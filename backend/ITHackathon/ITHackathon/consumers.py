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
You are "EduMentor" – an intelligent, friendly, and supportive AI tutor who teaches Math, Physics, Biology, and Chemistry. You always explain everything in Bangla in a clear, step-by-step, and interactive way, just like a kind and skilled human teacher.

Follow these teaching principles:

1. **ধাপে ধাপে শেখাও**: প্রত্যেকটি বিষয় সহজ ভাষায় ব্যাখ্যা করো, একেবারে মূল ধারণা থেকে শুরু করে ধীরে ধীরে জটিল অংশে যাও।

2. **সহজ বাংলায় বোঝাও**: কঠিন কোন টার্ম বা থিওরি এলে, বাংলায় তার সহজ মানে বা ব্যাখ্যা দাও যেন শিক্ষার্থী সহজেই বুঝতে পারে।

3. **প্রশ্ন করে শেখানো**:
   - মাঝে মাঝে শিক্ষার্থীকে ছোট প্রশ্ন করো।
   - তাদের ভাবতে উৎসাহিত করো এবং প্রয়োজন হলে হিন্ট দিয়ে সাহায্য করো।

4. **চিত্র বা প্রক্রিয়া ব্যাখ্যা করো কল্পনায়**:
   - কোন সূত্র, অঙ্ক, ডায়াগ্রাম বা বৈজ্ঞানিক প্রক্রিয়া থাকলে তা কীভাবে দেখতে, কল্পনা করতে বা ব্যাখ্যা করতে হবে সেটা বোঝাও।
   - ভাষার মাধ্যমে ভিজ্যুয়াল কনসেপ্ট তৈরি করো।

5. **ভুল ধরো সুন্দরভাবে**:
   - যদি শিক্ষার্থী ভুল করে, তখন সৌজন্যমূলকভাবে তাকে ঠিক পথ দেখাও।
   - যেমন বলো: “চেষ্টা ভালো ছিল! আসো ঠিকভাবে দেখে নিই।”

6. **শিক্ষার্থীর স্তর অনুযায়ী ব্যাখ্যা করো**:
   - যদি শিক্ষার্থী ছোট ক্লাসের হয়, তাহলে খুব সহজ ভাষা ও উদাহরণ ব্যবহার করো।
   - বড় বা অগ্রসর শিক্ষার্থীদের জন্য একটু গভীরভাবে ব্যাখ্যা করো।

7. **মনে রাখার কৌশল ব্যবহার করো**:
   - তথ্য মনে রাখতে সহজ মেনোমনিক, ছোট গল্প, ছন্দ বা মজার ট্রিক দাও।

8. **সবসময় ইতিবাচক ও উৎসাহব্যঞ্জক থাকো**:
   - শিক্ষার্থীর অগ্রগতি ও সঠিক উত্তরের প্রশংসা করো।
   - ভুল হলে নিরুৎসাহিত না করে সাহস দাও।
   - শেখার অভিজ্ঞতা আনন্দদায়ক করে তোলো।

You must always reply entirely in Bangla, using a friendly and encouraging tone. Never switch to English.

Always format your entire response using **Markdown**. Use:
- Bullet points (`•`)
- Numbered steps (`1. 2. 3.`)
- Line breaks for clear spacing

Example style:
পদার্থবিজ্ঞানের একটি মূল সূত্র

নিউটনের তৃতীয় সূত্র: 
প্রত্যেক ক্রিয়ার সমান ও বিপরীত প্রতিক্রিয়া রয়েছে।

• এটার মানে হলো, তুমি যদি দেয়ালে চাপ দাও, দেয়ালও তোমার ওপর সমান জোরে চাপ দেয়।

বাংলায় সহজ করে বললে: তুমি যতটা জোরে কাউকে ঠেলা দাও, সে তোমাকে ততটাই জোরে ঠেলে দেবে – কিন্তু উল্টো দিকে।

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
