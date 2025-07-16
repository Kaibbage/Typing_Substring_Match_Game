package org.TypingGame;

import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileWriter;
import java.io.IOException;
import java.util.Scanner;

@RestController
@CrossOrigin(origins = {
        "https://typing-substring-match-game.onrender.com",
        "http://127.0.0.1:8081"
})
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


    @GetMapping("/")
    public String home() {
        return "Sudoku Solver Backend is running!";
    }

    @GetMapping("/is-ready")
    public String getReady() {
        return "ready";
    }

    @GetMapping("/get-high-score")
    public String getHighScore() {
        try {
            Resource resource = new ClassPathResource("SavedInfo/HighScore.txt");
            File file = resource.getFile();

            try (Scanner scanner = new Scanner(file)) {
                if (scanner.hasNextLine()) {
                    String res = scanner.nextLine().trim();
                    System.out.println(res);
                    return res;
                } else {
                    return "0";
                }
            }
        } catch (IOException e) {
            System.err.println("Error reading high score file: " + e.getMessage());
            return "0";
        }
    }

    @PostMapping("/update-high-score")
    public String updateHighScore(@RequestBody InputRequest request) {
        String highScoreString = request.getInput();
        int highScore = Integer.parseInt(highScoreString);

        try {
            Resource resource = new ClassPathResource("SavedInfo/HighScore.txt");
            File file = resource.getFile();

            try (FileWriter writer = new FileWriter(file, false)) { //false = overwrite
                writer.write(String.valueOf(highScore));
            }

        } catch (FileNotFoundException e) {
            System.err.println("Error: High score file not found!");
        } catch (IOException e) {
            System.err.println("Error writing the high score file: " + e.getMessage());
        }

        return "updated";
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

