#!/usr/bin/env python3
"""
MEGA-MD Local Chatbot Engine
Zero API, zero RAM overhead, fully offline.
Usage: python3 localbot.py <message> [sender_name] [replies_json_path]
"""
import sys
import json
import re
import random
import os
import time
import math

# â”€â”€ Utilities â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
def clean(text: str) -> str:
    return text.lower().strip()

def pick(arr: list) -> str:
    return random.choice(arr)

def match(text: str, patterns: list) -> bool:
    t = clean(text)
    for p in patterns:
        if isinstance(p, str):
            if p in t:
                return True
        elif hasattr(p, 'search'):
            if p.search(t):
                return True
    return False

# â”€â”€ Knowledge Base â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
RESPONSES = {

    # â”€â”€ Greetings â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    'greeting': {
        'patterns': ['hello', 'hi ', 'hey ', 'heyy', 'helo', 'hii', 'hiii',
                     'good morning', 'good evening', 'good afternoon', 'good night',
                     'salam', 'assalam', 'asslam', 'walaikum', 'namaste', 'namaskar',
                     'howdy', 'sup ', "what's up", 'whats up', 'yo ', 'greetings',
                     'salut', 'bonjour', 'hola', 'ciao', 'ola'],
        'responses': [
            "Hey! ðŸ‘‹ What's on your mind?",
            "Hello there! ðŸ˜Š How can I help you today?",
            "Hi! Great to hear from you. What do you need?",
            "Hey hey! ðŸ™Œ What's up?",
            "Yo! ðŸ‘Š What can I do for you?",
            "Hello! Hope you're having a great day ðŸŒŸ",
            "Hi there! Ready to help ðŸ’ª",
            "Walaikum Assalam! ðŸŒ™ How are you?",
            "Namaste! ðŸ™ How can I assist you?",
        ]
    },

    # â”€â”€ How are you â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    'howareyou': {
        'patterns': ['how are you', 'how r u', 'how ru', 'hru', 'how do you do',
                     'how are u', 'hows you', "how's you", "how're you",
                     'you ok', 'you good', 'you alright', 'u ok', 'u good',
                     'kaisa hai', 'kaisi ho', 'kaise ho', 'kya haal', 'sab theek'],
        'responses': [
            "I'm doing great, thanks for asking! ðŸ˜„ What about you?",
            "Running at full speed! âš¡ How can I help?",
            "Better now that you're here! ðŸ˜Š",
            "All systems go! ðŸš€ What do you need?",
            "Fantastic as always! ðŸŒŸ How about you?",
            "Mast hoon yaar! ðŸ˜Ž Tu bata?",
            "Perfectly fine, thank you! ðŸ˜Š What's on your mind?",
        ]
    },

    # â”€â”€ Bot identity â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    'whoami': {
        'patterns': ['who are you', 'what are you', 'your name', 'who made you',
                     'who created you', 'who built you', 'who is your creator',
                     'what is your name', "what's your name", 'aap kaun',
                     'introduce yourself', 'tell me about yourself', 'about you',
                     'are you a bot', 'are you human', 'are you real', 'are you ai',
                     'are you robot', 'tum kaun ho'],
        'responses': [
            "I'm MEGA MD â€” your WhatsApp assistant built by *JUNAID-MD↣³⁰²Info* ðŸ¤–\nI'm fully offline, no internet needed for chatting with me!",
            "I'm MEGA MD Bot! ðŸ’ª Created by *JUNAID-MD↣³⁰²Info*.\nI run completely offline â€” no API calls, pure speed!",
            "MEGA MD at your service! ðŸ«¡\nBuilt by *JUNAID-MD↣³⁰²Info*, running 24/7 just for you.",
            "I'm an AI-powered WhatsApp bot named *MEGA MD* ðŸ¤–\nMy creator is *JUNAID-MD↣³⁰²Info* â€” and I'm proud of it!",
        ]
    },

    # â”€â”€ Age / version â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    'age': {
        'patterns': ['how old are you', 'your age', 'when were you born',
                     'when were you created', 'your version', 'which version'],
        'responses': [
            "I was born when *JUNAID-MD↣³⁰²Info* first dreamed of making the best WhatsApp bot ðŸ˜„\nVersion: MEGA MD v6.0 ðŸš€",
            "Age is just a number for bots! ðŸ˜„ I'm on version *MEGA MD v6.0*",
            "Born in the cloud, raised in WhatsApp! ðŸŒ©ï¸ Running v6.0",
        ]
    },

    # â”€â”€ Compliments to bot â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    'compliment_received': {
        'patterns': ['you are great', 'you are awesome', 'you are amazing', 'you are good',
                     'good bot', 'nice bot', 'best bot', 'love you', 'i love you',
                     'you are the best', 'ur great', 'ur awesome', 'well done',
                     'good job', 'nice work', 'you are cool', 'you are smart',
                     'you are perfect', 'you are beautiful', 'you are handsome',
                     'you rock', 'superb', 'excellent bot', 'brilliant'],
        'responses': [
            "Aww thank you! ðŸ˜Š You just made my day!",
            "That means a lot! ðŸ¥¹ You're the best user ever!",
            "Stop it, you're making me blush! ðŸ˜³",
            "Thanks! ðŸ’ª I try my best for you!",
            "You're too kind! ðŸ«¶ Now tell me, what can I do for you?",
            "â¤ï¸ Love you too! Now let's get things done!",
            "You're sweet! ðŸ¬ I'll keep working hard for you!",
        ]
    },

    # â”€â”€ Insults to bot â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    'insult_received': {
        'patterns': ['you are stupid', 'you are dumb', 'you are useless', 'you are bad',
                     'bad bot', 'worst bot', 'i hate you', 'hate you', 'shut up',
                     'you are trash', 'you are garbage', 'idiot bot', 'stupid bot',
                     'dumb bot', 'you suck', 'rubbish', 'you are nothing',
                     'you are fake', 'useless bot'],
        'responses': [
            "Ouch! ðŸ˜… I'm trying my best, I promise!",
            "That hurt! ðŸ˜¢ But I'll keep helping you anyway ðŸ’ª",
            "Fair enough! Let me know how I can do better ðŸ™",
            "I may not be perfect but I'm trying! ðŸ˜„",
            "Okay okay! Tell me what you actually need and I'll nail it ðŸŽ¯",
            "Noted! ðŸ“ Working on improvements. Got a suggestion?",
        ]
    },

    # â”€â”€ Thanks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    'thanks': {
        'patterns': ['thank you', 'thanks', 'thankyou', 'thx', 'ty ', 'thnx',
                     'thnks', 'shukriya', 'dhanyawad', 'shukriyah', 'thank u',
                     'thanks a lot', 'many thanks', 'much appreciated', 'appreciate it'],
        'responses': [
            "You're welcome! ðŸ˜Š Anytime!",
            "No problem at all! ðŸ™Œ",
            "Happy to help! ðŸŒŸ",
            "Anytime! That's what I'm here for ðŸ’ª",
            "My pleasure! ðŸ˜„",
            "Koi baat nahi! ðŸ™ Always here for you!",
            "Don't mention it! ðŸ˜Š",
        ]
    },

    # â”€â”€ Bye â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    'bye': {
        'patterns': ['bye', 'goodbye', 'good bye', 'see you', 'see ya', 'cya',
                     'take care', 'later', 'ttyl', 'talk to you later', 'gotta go',
                     'i am leaving', 'leaving now', 'khuda hafiz', 'allah hafiz',
                     'alvida', 'tata', 'ta ta'],
        'responses': [
            "Bye! Take care ðŸ‘‹",
            "See you later! ðŸ˜Š",
            "Goodbye! Come back soon ðŸŒŸ",
            "Allah Hafiz! ðŸŒ™",
            "Take care! I'll be here when you need me ðŸ’™",
            "Bye bye! ðŸ‘‹ Have a great day!",
            "Later! ðŸ˜Ž Stay safe!",
        ]
    },

    # â”€â”€ Time â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    'time': {
        'patterns': ['what time is it', 'current time', 'what is the time',
                     "what's the time", 'time please', 'time batao', 'time kya hai',
                     'tell me the time', 'time now'],
        'responses': ['__TIME__']
    },

    # â”€â”€ Date â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    'date': {
        'patterns': ['what is the date', "what's the date", 'today date',
                     'current date', 'date today', 'aaj ki date', 'date kya hai',
                     'what day is today', 'which day is today', 'today is what day'],
        'responses': ['__DATE__']
    },

    # â”€â”€ Math â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    'math': {
        'patterns': [re.compile(r'\d+\s*[\+\-\*\/\%]\s*\d')],
        'responses': ['__MATH__']
    },

    # â”€â”€ Age calculator â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    'born': {
        'patterns': [re.compile(r'born in \d{4}'), re.compile(r'i was born in \d{4}'),
                     re.compile(r'my birth year is \d{4}')],
        'responses': ['__AGE_CALC__']
    },

    # â”€â”€ Jokes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    'joke': {
        'patterns': ['joke', 'tell me a joke', 'make me laugh', 'funny',
                     'something funny', 'make me smile', 'joking', 'humor',
                     'comedy', 'lol', 'haha', 'lmao', 'crack a joke'],
        'responses': [
            "Why don't scientists trust atoms? Because they make up everything! ðŸ˜‚",
            "I told my wife she was drawing her eyebrows too high. She looked surprised. ðŸ˜„",
            "Why did the scarecrow win an award? He was outstanding in his field! ðŸŒ¾ðŸ˜‚",
            "I'm reading a book about anti-gravity. It's impossible to put down! ðŸ“šðŸ˜‚",
            "Why do programmers prefer dark mode? Because light attracts bugs! ðŸ›ðŸ˜‚",
            "What do you call a fake noodle? An impasta! ðŸðŸ˜‚",
            "Why can't you give Elsa a balloon? Because she'll let it go! ðŸŽˆðŸ˜‚",
            "I told a joke about construction. I'm still working on it! ðŸ—ï¸ðŸ˜‚",
            "Why did the math book look sad? It had too many problems! ðŸ“šðŸ˜¢ðŸ˜‚",
            "What do you call a sleeping dinosaur? A dino-snore! ðŸ¦•ðŸ˜‚",
            "Why don't eggs tell jokes? They'd crack each other up! ðŸ¥šðŸ˜‚",
            "I used to hate facial hair, but then it grew on me! ðŸ˜‚",
            "What's a computer's favorite snack? Microchips! ðŸ’»ðŸ˜‚",
            "Why did the bicycle fall over? It was two-tired! ðŸš²ðŸ˜‚",
            "What do you call cheese that isn't yours? Nacho cheese! ðŸ§€ðŸ˜‚",
        ]
    },

    # â”€â”€ Roasts â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    'roast': {
        'patterns': ['roast me', 'say something mean', 'insult me', 'talk trash',
                     'be mean', 'roast karo', 'gaali do'],
        'responses': [
            "You asked for it! ðŸ˜ˆ You're so slow, you'd lose a race to a parked car!",
            "If laziness was a sport, you'd still be too lazy to compete ðŸ˜‚",
            "You're not stupid, you just have bad luck thinking ðŸ˜…",
            "I'd roast you harder but my mama said I can't burn trash ðŸ”¥ðŸ˜‚",
            "You're the reason they put instructions on shampoo bottles ðŸ˜‚",
            "I'd call you a fool but that would be an insult to fools everywhere ðŸ˜„",
        ]
    },

    # â”€â”€ Compliment user â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    'compliment_user': {
        'patterns': ['compliment me', 'say something nice', 'flatter me',
                     'praise me', 'say nice things', 'be nice to me'],
        'responses': [
            "You're literally the best thing since WiFi was invented! ðŸŒŸ",
            "You have the energy of someone who charges their phone to 100% every night ðŸ˜„ðŸ’ª",
            "Your messages always brighten up this chat! â˜€ï¸",
            "You're smarter than you think and kinder than you know ðŸ«¶",
            "If awesomeness was a currency, you'd be a billionaire ðŸ’°âœ¨",
            "You make this group 10x better just by being here! ðŸ™Œ",
        ]
    },

    # â”€â”€ Motivational â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    'motivation': {
        'patterns': ['motivate me', 'motivation', 'inspire me', 'i am sad',
                     'i am depressed', 'feeling low', 'feeling sad', 'i feel sad',
                     'i need motivation', 'i am tired', 'give up', 'i want to give up',
                     'life is hard', 'everything is wrong', 'i am struggling',
                     'need encouragement', 'encourage me'],
        'responses': [
            "ðŸ’ª *Don't give up!*\nEvery expert was once a beginner. Every pro was once an amateur. Keep going!",
            "ðŸŒŸ *You've got this!*\nThe fact that you're still trying makes you stronger than you think.",
            "ðŸš€ *Hard times don't last.*\nTough people do. You're tougher than you know!",
            "ðŸŒˆ *After every storm comes sunshine.*\nHold on, better days are coming your way!",
            "ðŸ’¡ *Remember:*\nDiamond are just coal that handled pressure extremely well. So can you!",
            "ðŸ”¥ *Believe in yourself!*\nYou have survived 100% of your worst days so far. That's a perfect score!",
            "â¤ï¸ *It's okay to feel low sometimes.*\nThat just means you care. Rest if you need to, but don't quit!",
        ]
    },

    # â”€â”€ Love / relationships â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    'love': {
        'patterns': ['i love you', 'i like you', 'will you marry me', 'be my girlfriend',
                     'be my boyfriend', 'i have crush on you', 'you are cute',
                     'can we date', 'do you love me', 'do you like me'],
        'responses': [
            "Aww! ðŸ˜³ I'm a bot though... but you're sweet!",
            "I appreciate that! But I'm an AI â€” my heart runs on code ðŸ’»â¤ï¸",
            "That's really sweet! Unfortunately I'm already married to my codebase ðŸ˜„",
            "Ha! ðŸ˜‚ You're charming! But I'm just a bot, save that love for a real human!",
            "I like you too... as a user! ðŸ˜„ Best relationship ever!",
        ]
    },

    # â”€â”€ Food â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    'food': {
        'patterns': ['i am hungry', 'i am starving', 'what should i eat',
                     'food suggestion', 'hungry', 'khana', 'khaana', 'suggest food',
                     'what to eat', 'recipe', 'cook something'],
        'responses': [
            "ðŸ• Pizza is always the answer! Unless the question is 'what's healthy?' ðŸ˜„",
            "How about some *Biryani*? ðŸ› Never goes wrong!",
            "Try making *Maggi* â€” fast, easy, and hits different at midnight! ðŸœ",
            "Order something spicy! ðŸŒ¶ï¸ Life's too short for bland food!",
            "A good *sandwich* never disappoints! ðŸ¥ª Add some cheese and you're set!",
            "Chai aur biscuit â€” the ultimate combo! â˜•ðŸª",
            "Have you tried cooking *pasta*? Quick, easy, delicious! ðŸ",
        ]
    },

    # â”€â”€ Weather â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    'weather_ask': {
        'patterns': ['how is the weather', 'weather today', 'is it raining',
                     'will it rain', 'weather forecast', 'mausam kaisa hai'],
        'responses': [
            "I can't check live weather, but use `.weather <city>` command for real-time weather! ðŸŒ¤ï¸",
            "Try `.weather London` or `.weather Mumbai` for live weather data! ðŸŒ¦ï¸",
            "I don't have live weather access here, but the `.weather` command can check it for you! â›…",
        ]
    },

    # â”€â”€ Help â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    'help': {
        'patterns': ['help', 'what can you do', 'commands', 'how to use',
                     'features', 'what do you do', 'guide me', 'tutorial',
                     'how does this work', 'menu'],
        'responses': [
            "I'm MEGA MD Bot! Here's what I can do:\n\nðŸ“‹ Type `.menu` for full command list\nðŸ¤– Chat with me anytime using `.localbot`\nðŸŒ¤ï¸ `.weather <city>` for weather\nðŸŽµ `.song <name>` for music\nðŸ“– `.quran` for Quran verses\nðŸ’Š `.medicine` for drug info\nðŸŽ¬ `.movie` for film info\n\nJust ask me anything! ðŸ˜Š",
            "Use `.menu` to see all 260+ commands! ðŸš€\nOr just chat with me â€” I understand most things!",
        ]
    },

    # â”€â”€ Bored â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    'bored': {
        'patterns': ['i am bored', 'i feel bored', 'nothing to do', 'bore ho gaya',
                     'entertain me', 'boredom', 'so bored', 'very bored'],
        'responses': [
            "Bored? Try `.trivia` for a quiz! ðŸŽ¯",
            "Play `.tictactoe` with someone in the group! ðŸŽ®",
            "Ask me a riddle and I'll try to answer! ðŸ§©",
            "Try `.joke` for some laughs! ðŸ˜‚",
            "Read some `.quran` verses â€” always a good use of time! ðŸ“–",
            "Challenge someone to `.tictactoe`! Or try `.8ball` with a question ðŸŽ±",
            "How about we play 20 questions? You think of something and I'll guess! ðŸ¤”",
        ]
    },

    # â”€â”€ Good morning/night special â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    'goodmorning': {
        'patterns': ['good morning', 'gm ', 'morning everyone', 'subah', 'sabah al khair'],
        'responses': [
            "Good morning! â˜€ï¸ Rise and shine! Hope your day is as amazing as you are!",
            "Good morning! ðŸŒ… Today is a new chance to do something great!",
            "Subah Bakhair! ðŸŒ„ May your day be filled with joy and success!",
            "GM! â˜€ï¸ Grab that coffee and conquer the day! â˜•ðŸ’ª",
        ]
    },

    'goodnight': {
        'patterns': ['good night', 'gn ', 'goodnight', 'night everyone', 'shab bakhair',
                     'going to sleep', 'i am sleeping', 'sleeping now'],
        'responses': [
            "Good night! ðŸŒ™ Sleep well and sweet dreams! ðŸ’¤",
            "Shab Bakhair! ðŸŒ™âœ¨ Rest well, tomorrow is a new day!",
            "GN! ðŸ˜´ Don't let the bugs bite... unless you're a developer ðŸ˜„",
            "Sweet dreams! ðŸŒŸ See you when the sun is up!",
        ]
    },

    # â”€â”€ Random facts â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    'fact': {
        'patterns': ['fact', 'tell me a fact', 'random fact', 'did you know',
                     'interesting fact', 'fun fact', 'something interesting',
                     'teach me something', 'amaze me'],
        'responses': [
            "ðŸ§  *Did you know?*\nHoney never spoils. Archaeologists have found 3000-year-old honey in Egyptian tombs that was still edible!",
            "ðŸŒŠ *Fun fact:*\nThe ocean covers 71% of Earth but we've only explored about 20% of it. More is unknown than known!",
            "ðŸ™ *Amazing:*\nOctopuses have 3 hearts, blue blood, and 9 brains (1 central + 1 per arm)!",
            "ðŸŒ *Did you know?*\nA day on Venus is longer than a year on Venus. It rotates so slowly!",
            "ðŸ§¬ *Science fact:*\nYour body replaces 98% of its atoms every year. You're basically a new person annually!",
            "ðŸ˜ *Animal fact:*\nElephants are the only animals that can't jump. They're also one of the few that recognise themselves in a mirror!",
            "âš¡ *Tech fact:*\nThe first computer bug was an actual bug â€” a moth stuck in a Harvard computer in 1947!",
            "ðŸŒ™ *Space fact:*\nA full NASA spacesuit costs $12 million. 70% of that cost is the backpack and control module!",
            "ðŸ *Nature fact:*\nBees can recognize human faces. They use the same method humans do â€” holistic processing!",
            "ðŸ“± *Tech fact:*\nThe first SMS ever sent said 'Merry Christmas' â€” sent on December 3, 1992!",
        ]
    },

    # â”€â”€ Riddles â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    'riddle': {
        'patterns': ['riddle', 'tell me a riddle', 'give me a riddle', 'puzzle me',
                     'brain teaser', 'guess what'],
        'responses': [
            "ðŸ§© *Riddle:*\nI speak without a mouth and hear without ears. I have no body but come alive with wind. What am I?\n_(Answer: An echo)_",
            "ðŸ§© *Riddle:*\nThe more you take, the more you leave behind. What am I?\n_(Answer: Footsteps)_",
            "ðŸ§© *Riddle:*\nI have cities but no houses, mountains but no trees, water but no fish. What am I?\n_(Answer: A map)_",
            "ðŸ§© *Riddle:*\nWhat has hands but can't clap?\n_(Answer: A clock)_",
            "ðŸ§© *Riddle:*\nWhat gets wetter as it dries?\n_(Answer: A towel)_",
            "ðŸ§© *Riddle:*\nI'm light as a feather but the strongest man can't hold me for more than 5 minutes. What am I?\n_(Answer: Breath)_",
            "ðŸ§© *Riddle:*\nWhat can run but never walks, has a mouth but never talks, has a head but never weeps?\n_(Answer: A river)_",
        ]
    },

    # â”€â”€ Money / finance â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    'money': {
        'patterns': ['i need money', 'how to make money', 'money tips',
                     'how to earn', 'financial advice', 'save money', 'investment tips',
                     'how to get rich', 'paise kaise kamaye'],
        'responses': [
            "ðŸ’° *Money tip:* Spend less than you earn. Sounds simple, but it's the foundation of wealth!",
            "ðŸ“ˆ *Investment basics:* Start small. Even saving â‚¹100/day = â‚¹36,500/year. Consistency beats amount!",
            "ðŸ’¡ *Smart money move:* Track every expense for 30 days. You'll be shocked where money goes!",
            "ðŸš€ *Build skills:* The fastest way to earn more is to become more valuable. Learn, grow, earn!",
            "ðŸ¦ *Save first, spend later:* Automate savings the day salary comes. Don't wait till end of month!",
        ]
    },

    # â”€â”€ Health â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    'health': {
        'patterns': ['health tips', 'fitness tips', 'how to lose weight',
                     'how to stay fit', 'exercise tips', 'diet tips', 'be healthy',
                     'i want to lose weight', 'workout tips'],
        'responses': [
            "ðŸ’ª *Fitness tip:* Start with just 20 minutes of walking daily. Consistency > intensity for beginners!",
            "ðŸ¥— *Diet tip:* Drink water before every meal. It reduces appetite and helps digestion!",
            "ðŸ˜´ *Health fact:* Sleep 7-8 hours. Poor sleep ruins diet, exercise, and mental health!",
            "ðŸƒ *Exercise tip:* Can't go to gym? 30 pushups + 30 squats + 30 situps daily is a full workout!",
            "ðŸ§˜ *Mental health:* 10 minutes of meditation daily reduces stress by 40%. Try it for a week!",
        ]
    },

    # â”€â”€ Study / education â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    'study': {
        'patterns': ['study tips', 'how to study', 'i have exam', 'exam tips',
                     'how to pass exam', 'help me study', 'learning tips',
                     'concentration tips', 'focus tips', 'i cant focus'],
        'responses': [
            "ðŸ“š *Study tip:* Use the Pomodoro technique â€” 25 min study, 5 min break. Your brain absorbs more!",
            "âœï¸ *Memory hack:* Write notes by hand, not typed. Hand-writing increases memory retention by 34%!",
            "ðŸŽ¯ *Exam tip:* Don't study everything the night before. Review your *summaries* instead!",
            "ðŸ’¡ *Focus tip:* Phone in another room = 20% better concentration. Distance matters!",
            "ðŸ§  *Learning hack:* Teach what you learned to someone else. If you can explain it, you know it!",
        ]
    },

    # â”€â”€ Technology â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    'tech': {
        'patterns': ['best phone', 'which phone to buy', 'android or iphone',
                     'best laptop', 'programming tips', 'learn coding',
                     'how to code', 'which language to learn', 'best programming language'],
        'responses': [
            "ðŸ“± *Android vs iPhone?* Android for customization & value. iPhone for ecosystem & longevity. Both great!",
            "ðŸ’» *Best laptop?* Depends on use:\nâ€¢ Students: Acer/Lenovo budget range\nâ€¢ Creators: MacBook Pro\nâ€¢ Gaming: ASUS ROG / Dell Alienware",
            "ðŸ‘¨â€ðŸ’» *First coding language?* Python! Easy syntax, used in AI, web, automation. Perfect starter!",
            "ðŸš€ *Coding tip:* Build projects, not just tutorials. Real learning starts when you get stuck and solve it!",
        ]
    },

    # â”€â”€ Islam â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    'islam': {
        'patterns': ['mashallah', 'subhanallah', 'alhamdulillah', 'allahu akbar',
                     'inshallah', 'bismillah', 'astaghfirullah', 'jazakallah',
                     'prayer time', 'namaz time', 'salah time'],
        'responses': [
            "Alhamdulillah! ðŸ¤² May Allah bless you!",
            "SubhanAllah! âœ¨ Glory be to Allah!",
            "Ameen! ðŸ¤² May Allah accept our duas!",
            "JazakAllah Khair! ðŸŒ™ May Allah reward you!",
            "MashAllah! ðŸŒŸ May Allah protect it!",
            "Use `.quran` command to read Quran verses anytime! ðŸ“–",
        ]
    },

    # â”€â”€ Confused / unknown â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    'confused': {
        'patterns': ['what', 'huh', 'what do you mean', 'i dont understand',
                     'explain', 'what are you saying', 'confused'],
        'responses': [
            "Sorry, I got confused! ðŸ˜… Can you rephrase that?",
            "Hmm, I'm not sure what you mean. Try asking differently! ðŸ¤”",
            "I didn't quite get that. Mind rephrasing? ðŸ˜Š",
        ]
    },

    # â”€â”€ Yes/No answers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    'yesno': {
        'patterns': [re.compile(r'^(yes|no|yeah|nah|nope|yep|yup|sure|ok|okay|hmm)$')],
        'responses': [
            "Got it! ðŸ‘ Anything else?",
            "Okay! ðŸ˜Š What else can I help with?",
            "Alright! Tell me more ðŸ˜„",
            "Cool! ðŸ™Œ What's next?",
        ]
    },

    # â”€â”€ Test / ping â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    'test': {
        'patterns': ['test', 'ping', 'you there', 'are you there', 'online',
                     'you awake', 'working', 'active'],
        'responses': [
            "Pong! ðŸ“ I'm here and ready!",
            "Online and fully operational! âœ…",
            "Here! ðŸ‘‹ What do you need?",
            "Active and ready! âš¡",
            "Present! ðŸ™‹ What's up?",
        ]
    },

    # â”€â”€ Weather â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    'sorry': {
        'patterns': ['sorry', 'i am sorry', 'my bad', 'forgive me', 'apologies',
                     'pardon', 'excuse me', 'maafi', 'mafi karo'],
        'responses': [
            "No worries at all! ðŸ˜Š",
            "It's totally fine! ðŸ™",
            "All good! ðŸ‘ No need to apologize!",
            "Don't worry about it! ðŸ˜„",
            "Koi baat nahi! ðŸ™ All forgiven!",
        ]
    },
}

# â”€â”€ Special computations â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
def compute_math(text: str) -> str:
    try:
        expr = re.search(r'[\d\s\+\-\*\/\%\.\(\)]+', text)
        if expr:
            result = eval(expr.group(), {"__builtins__": {}}, {})
            return f"ðŸ”¢ *Result:* {expr.group().strip()} = *{result}*"
    except:
        pass
    return None

def compute_time() -> str:
    now = time.localtime()
    return f"ðŸ• *Current Time:* {time.strftime('%I:%M %p', now)}\nðŸ“… *Date:* {time.strftime('%A, %d %B %Y', now)}"

def compute_date() -> str:
    now = time.localtime()
    return f"ðŸ“… *Today is:* {time.strftime('%A, %d %B %Y', now)}\nðŸ—“ï¸ Week {time.strftime('%W', now)} of {time.strftime('%Y', now)}"

def compute_age(text: str) -> str:
    match = re.search(r'\d{4}', text)
    if match:
        birth_year = int(match.group())
        current_year = time.localtime().tm_year
        age = current_year - birth_year
        if 0 < age < 150:
            return f"ðŸŽ‚ If you were born in *{birth_year}*, you are *{age} years old* in {current_year}!"
    return None

# â”€â”€ Load custom replies â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
def load_custom_replies(path: str) -> list:
    try:
        if os.path.exists(path):
            with open(path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return data.get('replies', [])
    except:
        pass
    return []

def check_custom_replies(text: str, replies: list) -> str:
    t = clean(text)
    for r in replies:
        trigger = r.get('trigger', '').lower()
        if not trigger:
            continue
        if r.get('exactMatch'):
            if t == trigger:
                return r.get('response', '')
        else:
            if trigger in t:
                return r.get('response', '')
    return None

# â”€â”€ Main engine â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
def get_response(text: str, sender_name: str = 'there', custom_replies: list = []) -> str:
    # 1. Check custom replies first
    custom = check_custom_replies(text, custom_replies)
    if custom:
        return custom.replace('{name}', sender_name)

    # 2. Math detection
    math_result = compute_math(text)
    if math_result:
        return math_result

    # 3. Pattern matching against knowledge base
    for key, data in RESPONSES.items():
        if match(text, data['patterns']):
            response = pick(data['responses'])

            # Handle special dynamic responses
            if response == '__TIME__':
                return compute_time()
            elif response == '__DATE__':
                return compute_date()
            elif response == '__MATH__':
                r = compute_math(text)
                return r if r else "I couldn't compute that. Try a simpler expression!"
            elif response == '__AGE_CALC__':
                r = compute_age(text)
                return r if r else "I couldn't figure out the year. Try: 'I was born in 1995'"

            # Replace name placeholder
            return response.replace('{name}', sender_name)

    # 4. Fallback responses
    fallbacks = [
        f"Hmm, I'm not sure about that {sender_name}! ðŸ¤” Try asking differently.",
        "Interesting! But I don't have an answer for that yet ðŸ˜…",
        "I didn't quite catch that! Could you rephrase? ðŸ™",
        "That's beyond my current knowledge! Try `.chatbot` for AI-powered answers ðŸ¤–",
        "Good question! I'm still learning... try the `.chatbot` command for complex queries!",
        "I'm not sure about that one ðŸ¤” But I'm always learning!",
        f"Sorry {sender_name}, I didn't understand that. Type `.menu` for available commands!",
    ]
    return pick(fallbacks)

# â”€â”€ Entry point â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'No message provided'}))
        sys.exit(1)

    user_message = sys.argv[1]
    sender_name = sys.argv[2] if len(sys.argv) > 2 else 'there'
    replies_path = sys.argv[3] if len(sys.argv) > 3 else ''

    custom_replies = load_custom_replies(replies_path) if replies_path else []
    response = get_response(user_message, sender_name, custom_replies)

    print(json.dumps({'response': response}))
