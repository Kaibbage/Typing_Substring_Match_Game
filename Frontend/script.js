const apiBaseUrl = "http://localhost:8080";

let startTime;
let duration;
let score;
let highScore;

const totalLength = 628;
let lastSecond;
let timerRunning;
let lastClickedButton;

let lifeNum;

async function startGame(){
    lifeNum = 1;
    score = 0;
    updateScore();
    clearWhiteSquares();

    // Wait for the async rsetGaneBackend to complete
    let startGram = await resetGameBackend();
    let timerElement = document.getElementById("timer");
    timerElement.textContent = startGram;

    startTimer();
}

function updateTimer() {
    if (!timerRunning) return;

    let elapsed = Date.now() - startTime;
    let timeLeft = Math.max(0, (duration - elapsed) / 1000);
    let currentSecond = Math.ceil(timeLeft);
    //let timerElement = document.getElementById("timer");
    let progressCircle = document.getElementById("progress");

    if (currentSecond !== lastSecond) {
        //timerElement.textContent = currentSecond;
        lastSecond = currentSecond;
    }
    let offset = totalLength * (timeLeft / (duration / 1000));
    progressCircle.style.strokeDashoffset = offset;
    
    if (elapsed < duration) {
        requestAnimationFrame(updateTimer);
    } else {
        //timerElement.textContent = "0";
        timerRunning = false;
        setTimeout(() => {
            timerEnded();
        }, 100);
    }
}

function setTimer(newDuration, button) {
    if (timerRunning) return;
    //let timerElement = document.getElementById("timer");
    let progressCircle = document.getElementById("progress");
    
    duration = newDuration;
    //timerElement.textContent = (duration / 1000).toString();
    progressCircle.style.strokeDashoffset = totalLength;
    
    if (lastClickedButton) {
        lastClickedButton.classList.remove("active");
    }
    button.classList.add("active");
    lastClickedButton = button;
}

function startTimer() {
    if (!duration || timerRunning) return;
    
    // Disable timer buttons
    let timerButtons = document.querySelectorAll('.timer-button');
    timerButtons.forEach(button => {
        button.disabled = true;
    });
    
    startTime = Date.now();
    lastSecond = duration / 1000;
    timerRunning = true;
    requestAnimationFrame(updateTimer);
}

function resetTimer() {
    // Stop the current timer
    timerRunning = false;
    
    //set the timer back to default for current time length
    setTimer(duration, lastClickedButton);
    
    // Start the timer again
    startTimer();
}

async function timerEnded() {
    // Add X marks to all white squares
    let square = document.getElementById(`ws${lifeNum}`);
    const xMark = document.createElement('div');
    xMark.className = 'x-mark';
    xMark.style.display = 'block';
    square.appendChild(xMark);
    
    
    //alert("Time's up!");

    lifeNum++;
    if(lifeNum > 3){
        gameOver();
    }
    else{
        let gram = await getNewWord();
        let timerElement = document.getElementById("timer");
        timerElement.textContent = gram;
        resetTimer();
    }
    
}

async function getNewWord() {

    try {
        const response = await fetch(`${apiBaseUrl}/new-word`, {
            method: "GET",
        });

        const result = await response.text(); // Extract result
        console.log(result);

        return result; // Return the result

    } catch (error) {
        console.error("Error:", error);
        throw error; // Re-throw the error if needed
    }
}

function gameOver(){
    timerRunning = false;
    setTimer(duration, lastClickedButton);
    tryUpdateHighScore();

    resetGame();
}

function resetGame(){
    // Re-enable timer buttons
    let timerButtons = document.querySelectorAll('.timer-button');
    timerButtons.forEach(button => {
        button.disabled = false;
    });

    let timerElement = document.getElementById("timer");
    timerElement.textContent = ":(";
}

function updateScore(){
    document.getElementById('score').textContent = score;
}

function tryUpdateHighScore(){
    if (score > highScore) {
        highScore = score;
        document.getElementById('high-score').textContent = highScore;
    }
}

function clearWhiteSquares() {
    const whiteSquares = document.querySelectorAll('.white-square');
    whiteSquares.forEach(square => {
        const xMark = square.querySelector('.x-mark');
        if (xMark) {
            square.removeChild(xMark);
        }
    });
}

function createFloatingText(text) {
    const floatingText = document.createElement("div");
    floatingText.className = "floating-text";
    floatingText.textContent = text;
    document.body.appendChild(floatingText);

    const startX = Math.random() * (window.innerWidth - 100);
    const startY = Math.random() * (window.innerHeight - 100);
    const fontSize = Math.floor(Math.random() * 120) + 20;

    floatingText.style.left = `${startX}px`;
    floatingText.style.top = `${startY}px`;
    floatingText.style.fontSize = `${fontSize}px`;

    setTimeout(() => {
        floatingText.style.transform = `translateY(-100px)`;
        floatingText.style.opacity = "0";
    }, 100);

    setTimeout(() => {
        floatingText.remove();
    }, 3000);
}

async function sendToBackend(word) {
    const data = { input: word };

    try {
        const response = await fetch(`${apiBaseUrl}/process-word`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data), // Convert the payload to JSON
        });

        const result = await response.text(); // Extract result
        console.log(result);

        processBackendResponse(result, word);

        

    } catch (error) {
        console.error("Error:", error);
        throw error; // Re-throw the error if needed
    }


}

async function processBackendResponse(result, word){
    if(result == "good"){
        score++;
        updateScore();
        let gram = await getNewWord();
        let timerElement = document.getElementById("timer");
        timerElement.textContent = gram;
        resetTimer();
        createFloatingText(word);
    }
    else{
        //do smth here later
    }
}

async function resetGameBackend() {

    try {
        const response = await fetch(`${apiBaseUrl}/reset-game`, {
            method: "POST",
        });

        const result = await response.text(); // Extract result
        console.log(result);

        return result; // Return the result

    } catch (error) {
        console.error("Error:", error);
        throw error; // Re-throw the error if needed
    }
}

async function setupGameBackend() {

    try {
        const response = await fetch(`${apiBaseUrl}/setup-game`, {
            method: "POST",
        });

        const result = await response.text(); // Extract result
        console.log(result);

        return result; // Return the result

    } catch (error) {
        console.error("Error:", error);
        throw error; // Re-throw the error if needed
    }
}

async function initialize() {
    setTimer(10000, document.getElementById("10"));

    let textBox = document.getElementById("textInput")
    textBox.addEventListener("keydown", function(event) {
        if (event.key === "Enter" && textBox.value.trim() !== "") {
            // Only submit if timer is running
            if (timerRunning) {
                sendToBackend(textBox.value);

                textBox.value = "";
            } else {
                // Show message if timer isn't running
                alert("Please start the timer before submitting text!");
                textBox.value = "";
            }
        }
    });

    lifeNum = 1;
    timerRunning = false;

    await setupGameBackend();

    score = 0;
    highScore = -1;

    // Initialize score displays
    updateScore();
    tryUpdateHighScore();
}

initialize();