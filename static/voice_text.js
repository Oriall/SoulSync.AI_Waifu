let recognition;
if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
} else {
    alert("Your browser doesn't support speech recognition.");
}

function startRecording() {
    if (!recognition) return;
    recognition.start();
    const micCircle = document.getElementById("circle-mic");
    recognition.onstart = () => {
        document.getElementById("ai-response").textContent = "Listening...";
    };

    recognition.onerror = (event) => {
        console.error("Error during speech recognition: ", event.error);
        document.getElementById("ai-response").textContent = "Error while listening. Try again.";
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        document.getElementById("ai-response").textContent = "Replying...";
        micCircle.classList.add("active"); // Add animation
        sendMessageToAI(transcript);
    };

    recognition.onend = () => {
        console.log("Voice recording stopped.");
    };
}

function sendMessageToAI(message) {
    const formData = new FormData();
    const messages = [{ role: "user", content: message }];
    formData.append("messages", JSON.stringify(messages));

    fetch("/tts", {
        method: "POST",
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            const reply = data.messages[data.messages.length - 1].content;
            typeTextAnimation(document.getElementById("ai-response"), reply);
            fetchAudio(reply);
        })
        .catch(error => {
            console.error("Error communicating with server: ", error);
            document.getElementById("ai-response").textContent = "An error occurred. Please try again.";
        });
}

function fetchAudio(text) {
    const formData = new FormData();
    formData.append("message", text);

    fetch("/getAudio", {
        method: "POST",
        body: formData
    })
        .then(response => response.blob())
        .then(blob => {
            const audioUrl = URL.createObjectURL(blob);
            const audio = new Audio(audioUrl);
            audio.play();
        })
        .catch(error => {
            console.error("Error fetching audio: ", error);
        });
}

function typeTextAnimation(element, text, speed = 40) {
    element.textContent = ""; // Clear previous text
    const micCircle = document.getElementById("circle-mic");
    let index = 0;

    function typeChar() {
        if (index < text.length) {
            element.textContent += text.charAt(index);
            index++;
            setTimeout(typeChar, speed);
        } else {
            micCircle.classList.remove("active"); // Remove animation after typing finishes
        }
    }

    typeChar();
}
