import os
import uuid
from elevenlabs import ElevenLabs, Voice, VoiceSettings, save
from dotenv import load_dotenv

# Load API key từ file .env
load_dotenv()
API_KEY = os.getenv("ELEVEN_API_KEY")

# Khởi tạo ElevenLabs client
client = ElevenLabs(api_key=API_KEY)

# Đường dẫn thư mục lưu trữ voice
VOICE_DIR = "./voice"

# Hàm đảm bảo thư mục tồn tại
def ensure_voice_dir():
    if not os.path.exists(VOICE_DIR):
        os.makedirs(VOICE_DIR)

# Hàm xóa file lâu nhất nếu số lượng file vượt quá giới hạn
def clean_old_voices(limit=10):
    files = [os.path.join(VOICE_DIR, f) for f in os.listdir(VOICE_DIR) if os.path.isfile(os.path.join(VOICE_DIR, f))]
    if len(files) > limit:
        # Sắp xếp file theo thời gian chỉnh sửa, cũ nhất trước
        files.sort(key=os.path.getmtime)
        os.remove(files[0])  # Xóa file cũ nhất

# Hàm chuyển text thành file audio và lưu vào thư mục /voice
def convert_to_audio(text):
    ensure_voice_dir()  # Đảm bảo thư mục /voice tồn tại

    # Cấu hình giọng nói
    voice = Voice(
        voice_id="eVItLK1UvXctxuaRV2Oq",
        settings=VoiceSettings(stability=0.71, similarity_boost=0.5, style=0.0, use_speaker_boost=True),
    )

    # Tạo audio từ text
    audio = client.generate(text=text, voice=voice)

    # Tạo tên file ngẫu nhiên
    file_path = os.path.join(VOICE_DIR, f"{uuid.uuid4()}.mp3")
    
    # Lưu audio vào file
    save(audio, file_path)
    
    # Xóa file cũ nếu vượt quá giới hạn
    clean_old_voices(limit=10)

    return file_path

