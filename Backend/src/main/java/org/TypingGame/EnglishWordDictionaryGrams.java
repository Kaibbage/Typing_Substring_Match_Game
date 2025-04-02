package org.TypingGame;

import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Scanner;

public class EnglishWordDictionaryGrams {
    private HashSet<String> dictionary;
    private HashSet<String> used;
    private ArrayList<String> grams;
    private String currentGram;


    public EnglishWordDictionaryGrams(){
        dictionary = new HashSet<>();
        used = new HashSet<>();
        grams = new ArrayList<>();
        currentGram = "";
    }

    // Load dictionary from the resources folder
    public void loadDictionary(String filename) {
        try {
            // Get the file from the classpath (resources folder)
            Resource resource = new ClassPathResource(filename);
            File file = resource.getFile();  // Get the file from the classpath

            // Read the file content
            try (Scanner scanner = new Scanner(file)) {
                while (scanner.hasNext()) {
                    dictionary.add(scanner.next().toLowerCase());
                }
                System.out.println("Dictionary loaded successfully! Words: " + dictionary.size());
            }
        } catch (FileNotFoundException e) {
            System.err.println("Error: Dictionary file not found!");
        } catch (IOException e) {
            System.err.println("Error reading the file: " + e.getMessage());
        }
    }

    // Load grams from the grams.txt file into an ArrayList
    public void loadGrams(String filename) {
        try {
            // Get the file from the classpath (resources folder)
            Resource resource = new ClassPathResource(filename);
            File file = resource.getFile();  // Get the file from the classpath

            // Read the file content
            try (Scanner scanner = new Scanner(file)) {
                while (scanner.hasNext()) {
                    grams.add(scanner.next().toLowerCase());
                }
                System.out.println("Grams loaded successfully! Total grams: " + grams.size());
            }
        } catch (FileNotFoundException e) {
            System.err.println("Error: Grams file not found!");
        } catch (IOException e) {
            System.err.println("Error reading the grams file: " + e.getMessage());
        }
    }

    public void generateNewGram(){
        int randIndex = (int) (Math.random() * grams.size());
        currentGram = grams.get(randIndex);
    }

    public boolean isValid(String word){
        word = word.toLowerCase();
        if(dictionary.contains(word) && word.contains(currentGram) && !used.contains(word)){
            return true;
        }
        return false;
    }

    public void addToUsed(String word){
        used.add(word);
    }

    public String getCurrentGram(){
        return currentGram;
    }

    public void initializeStuff(){
        loadDictionary("textfiles/words_alpha.txt");
        loadGrams("textfiles/grams.txt");
    }

    public void resetStuff(){
        used = new HashSet<>();

        generateNewGram();
    }

//    public static void main(String[] args) {
//        // Load words from the file in the resources folder
//        loadDictionary("textfiles/words_alpha.txt");
//
//        // Load grams from the grams.txt file in the resources folder
//        loadGrams("textfiles/grams.txt");
//
//        // Test the dictionary
//        System.out.println(isEnglishWord("hello"));  // true
//        System.out.println(isEnglishWord("hjdskf")); // false
//        System.out.println(isEnglishWord("apple"));  // true
//
//        // Test grams list
//        System.out.println("Grams: " + grams); // Print loaded grams
//    }
}
