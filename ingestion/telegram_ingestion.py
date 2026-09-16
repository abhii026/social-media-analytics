import os
from dotenv import load_dotenv
from telethon import TelegramClient

load_dotenv()

api_id = int(os.getenv("TELEGRAM_API_ID"))
api_hash = os.getenv("TELEGRAM_API_HASH")

client = TelegramClient(
    "sih_session",
    api_id,
    api_hash
)

async def main():
    print("Connected to Telegram!")

with client:
    client.loop.run_until_complete(main())