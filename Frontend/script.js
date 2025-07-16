//const apiBaseUrl = "http://localhost:8080";
const apiBaseUrl = "https://typing-game-backend-x9on.onrender.com";

let startTime;
let duration;
let score;
let highScore;

const totalLength = 628;
let lastSecond;
let timerRunning;
let lastClickedButton;
let timeLength;

let lifeNum;

function setupHoverInfo() {
    //info text for each hover over button, could perhaps change to make more detailed
    const pieces = {
        'score-display': 'Find the scores in here',
        'white-squares': 'This is the number of lives you have remaining, you start with 3, and each one you lose will result in an X',
        'progress-ring': 'This shows the amount of time you have remaining',
        'textInput': 'Put your words containing the input in here',
        'timer-buttons': 'Click on one of these to set the difficulty and amount of time, more difficult means more points',
        'start-button': 'Click here to start the game',

        'next-button': 'Click here to get the next part of the instructions',
        'simple-widget': 'Find explanations in here',
        'status-container': "This will turn green once the website is ready to be used, until then it will be red",
        'instruction-container': "This box contains instructions",
        'hide-button': "click this to hide all extra widgets that are just for ease of use"
    };
    const infoText = document.getElementById('infoText');

    //adding hover for every button
    Object.keys(pieces).forEach(pieceId => {
        const piece = document.getElementById(pieceId);
        if(piece){
            piece.addEventListener('mouseenter', () => {
            infoText.textContent = pieces[pieceId];
        });
        piece.addEventListener('mouseleave', () => {
            infoText.textContent = 'Hover over anything to see information about it.';
        });
        }
    });
}

let instructions = ["Click here to get instructions", 
                    "This is a site where you can play a typing game. The objective of the game is to get as many points as possible by typing in english words with different substrings.",
                    "The substrings will show up in the center of the circle once the game starts, an example might be 'ing' and then a valid word would be 'fighting'",
                    "You will type the word in the box and then either hit submit or the enter button. Words must contain the substring and you may not use the same word again once used.",
                    "If your word is valid the word will pop up somewhere on the screen and a new substring will appear in the circle. The timer will also restart after each valid word and you will gain points for each one you submit.",
                    "If your word is invalid then the text box will flash red, and you will have to try a different word for the same substring. ",
                    "Each word is worth 1, 2, or 3 points based on the time difficulty you selected. Once you are ready select a time difficult and hit start game",
                    "Have fun :)"];
let instructionNumber = 0;

function setInstructionInfo(){
    document.getElementById("instruction-text").textContent = instructions[instructionNumber];
    instructionNumber++;
    if(instructionNumber == instructions.length){
        instructionNumber = 0;
    }
    
}


let intervalId;
let timeToReady = 120;
function startReadyTimer(){
    updateReadyTimer();
    intervalId = setInterval(() => {
        timeToReady--;
        updateReadyTimer();
    }, 1000);
}

function updateReadyTimer(){
    let min = Math.floor(timeToReady/60);
    let seconds = timeToReady % 60;
    document.getElementById("status-label").innerHTML = `This will turn green when the webpage is ready to be used. <br> Time remaining: ${min} min, ${seconds} seconds`;
}

function markOpen(){
    clearInterval(intervalId);
    clearInterval(readyIntervalId);
    document.getElementById("status-label").textContent = "Ready :)";
    let statusCircle = document.getElementById("status-circle");
    // statusCircle.style.height = "75px";
    // statusCircle.style.width = "75px";
    statusCircle.style.bottom = "50%";
    statusCircle.style.backgroundColor = "lightgreen";

    getHighScoreFromBackend();
}

let readyIntervalId;
function startCheckIfReady(){
    checkIfReady();
    readyIntervalId = setInterval(() => {
        checkIfReady();
    }, 2000);
}

function checkIfReady(){
    if(askBackendIfReady()){
        markOpen();
    }
}

async function askBackendIfReady(){

    try {
        const response = await fetch(`${apiBaseUrl}/is-ready`, {
            method: "GET",
        });

        const result = await response.text(); // Extract result
        console.log(result);
        if(result.includes("ady")){
            return true;
        }
        else{
            return false;
        }

    } catch (error) {
        console.error("Error:", error);
        throw error; // Re-throw the error if needed
    }

}

async function getHighScoreFromBackend(){

    try {
        const response = await fetch(`${apiBaseUrl}/get-high-score`, {
            method: "GET",
        });

        let result = await response.text(); // Extract result
        let savedHighScore = parseInt(result);
        highScore = savedHighScore;
        document.getElementById('high-score').textContent = highScore;

    } catch (error) {
        console.error("Error:", error);
        throw error; // Re-throw the error if needed
    }

}

async function sendHighScoreToBackend() {
    const data = { input: highScore.toString() };

    try {
        const response = await fetch(`${apiBaseUrl}/update-high-score`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data), // Convert the payload to JSON
        });

        const result = await response.text(); // Extract result
        console.log(result);

        
    } catch (error) {
        console.error("Error:", error);
        throw error; // Re-throw the error if needed
    }


}

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

function hideOrShow(){
    const extras = document.querySelectorAll('.extra');
    
    extras.forEach(element => {
        element.hidden = !element.hidden;
    });
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
    let progressCircle = document.getElementById("progress");
    timeLength = newDuration/1000;
    
    duration = newDuration;
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
    let timerButtons = document.querySelectorAll('.main');
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
    let timerButtons = document.querySelectorAll('.main');
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
        sendHighScoreToBackend();
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
        if(timeLength === 3){
            score+=3;
        }
        else if(timeLength === 5){
            score+= 2;
        }
        else{ //timeLength is 10
            score++;
        }
        
        updateScore();
        let gram = await getNewWord();
        let timerElement = document.getElementById("timer");
        timerElement.textContent = gram;
        resetTimer();
        createFloatingText(word);
    }
    else{
        //do smth here later
        flashInputRed();
    }
}

function flashInputRed() {
    const input = document.getElementById("textInput");
    input.classList.add("flash-red");
    setTimeout(() => {
        input.classList.remove("flash-red");
    }, 500);
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
    setTimer(5000, document.getElementById("5"));

    let textBox = document.getElementById("textInput")
    textBox.addEventListener("keydown", function(event) {
        if (event.key === "Enter" && textBox.value.trim() !== "") {
            // Only submit if timer is running
            if (timerRunning) {
                sendToBackend(textBox.value);

                textBox.value = "";
            } else {
                // Show message if timer isn't running
                //maybe can't do this tho because there is a little delay in between words
            }
        }
    });

    lifeNum = 1;
    timerRunning = false;

    await setupGameBackend();

    score = 0;
    highScore = 0;
    document.getElementById('high-score').textContent = highScore;

    updateScore();

    setupHoverInfo();
    setInstructionInfo();
    startReadyTimer();
    startCheckIfReady();
}

window.onload = initialize;