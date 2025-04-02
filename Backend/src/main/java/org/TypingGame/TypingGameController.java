package org.TypingGame;

import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "http://127.0.0.1:8081")  // Adjust the URL to your frontend's URL if necessary
public class TypingGameController {

    EnglishWordDictionaryGrams ewdg;

    // Constructor injection of WebSocket handler
    public TypingGameController() {
        ewdg = new EnglishWordDictionaryGrams();
    }

    public static class InputRequest {
        private String input;

        public String getInput() {
            return input;
        }

        public void setInput(String input) {
            this.input = input;
        }
    }



    // Endpoint to check word
    @PostMapping("/process-word")
    public String startSolving(@RequestBody InputRequest request) {
        String word = request.getInput();
        if(ewdg.isValid(word)){
            ewdg.addToUsed(word);
            return "good";
        }

        return "bad";
    }

    @PostMapping("/setup-game")
    public String setupGame() {
        ewdg.initializeStuff();

        return "yay";
    }

    @PostMapping("/reset-game")
    public String resetGame() {
        ewdg.resetStuff();

        return ewdg.getCurrentGram();
    }

    @GetMapping("/new-word")
    public String getNewWord() {
        ewdg.generateNewGram();

        return ewdg.getCurrentGram();
    }


}

