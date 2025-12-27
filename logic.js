// const phrase = 'devastating circumstances falling over';
// const phrase = 'my achilles heel';
const phrase = 'thumbs up';
const phraseTrimmed = phrase.replace(/ /g,'');
const phraseContainer = document.getElementsByClassName('board-container');
// const guessedWordsList = [];
let currentChanceNum = 1;
let guessedWord ="";
const keyboard_letters_dict = {}; //Creating dictionary for keyboard letters
const keyboard_colors_dict = {}; //creating dictionary for storing colour values 1 for green, 2 for orange, 3 for purple, 4 for gray and 5 for white ie word not used from keyboard 
keyboard_colors_dict[1] = 'green'
keyboard_colors_dict[2] = 'orange'
keyboard_colors_dict[3] = 'purple'
keyboard_colors_dict[4] = 'gray'
keyboard_colors_dict[5] = 'white'

//Initializing the Keyboard Letter Colours by looping through the keyboard letter elements
// Note: We skip Enter and Del buttons for the dictionary as they are not letter keys
const allKeyboardButtons = document.getElementsByClassName('keyboard-button');
for (let i = 0; i < allKeyboardButtons.length; i++) {
    const btnText = allKeyboardButtons[i].innerText.toLowerCase();
    
    // Only initialize dictionary for single letters a-z
    if (btnText.length === 1 && btnText.match(/[a-z]/)) {
        allKeyboardButtons[i].classList.add('white');
        keyboard_letters_dict[btnText] = 5;
    } else {
        // Just add white class to Enter/Del for styling consistency
        allKeyboardButtons[i].classList.add('white');
    }
}

//Rendering the phrase rows and the boxes within depending on the phrase
Array.from(document.getElementsByClassName('phrase-row')).forEach(phraseRowEl => {
    // phraseRowEl.style.gridTemplateColumns =`repeat(${phrase.length},1fr)`;
    for (let index = 0; index < phrase.length; index++) {
        // console.log(phrase.charAt(index));
        if (phrase.charAt(index) !== " ") {
            let letterEl = document.createElement("div");
            letterEl.classList.add('letter');
            phraseRowEl.appendChild(letterEl);
        } else{
            let letterEl = document.createElement("div");
            letterEl.classList.add('space');
            // letterEl.textContent = ' '
            phraseRowEl.appendChild(letterEl);
        }
        
    }
});

// Centralized Input Handler
function handleInput(key) {
    if (key.match(/^[a-z]$/) || key === 'enter' || key === 'backspace') {
      // Handle key press
      // console.log('Key pressed:', key);
        if (guessedWord.length <= phraseTrimmed.length) {
            if (key === 'enter')    {
                if (guessedWord.length === phraseTrimmed.length) {
                  // Get colours for each tile to be implemented  
                  const guessed_word_withSpaces = generate_Space_Separated_Word();
                  const colorCodedString = generateColours(phrase,guessed_word_withSpaces);
                  console.log(colorCodedString);
                  color_AllLetterBoxes(colorCodedString);
                  color_KeyboardLetters(guessedWord, colorCodedString);
                  
                  // guessedWordsList.push(guessedWord);
                    guessedWord = ''
                    currentChanceNum++;                    
                }
            } else if (key === 'backspace') {
                guessedWord = guessedWord.slice(0, -1);
                updateWordOnScreen(guessedWord,currentChanceNum);
            } else {
                if (guessedWord.length < phraseTrimmed.length) {
                    guessedWord = guessedWord + key;
                    updateWordOnScreen(guessedWord,currentChanceNum);                    
                }
            }
        }
    }
}

// 1. Listen for Physical Keyboard
document.addEventListener('keydown', function(event) {
    handleInput(event.key.toLowerCase());
});

// 2. Listen for On-Screen Keyboard Clicks
for (let i = 0; i < allKeyboardButtons.length; i++) {
    allKeyboardButtons[i].addEventListener('click', function(e) {
        // Check if the button has a specific data-key (like backspace) or use innerText
        let key = this.getAttribute('data-key') || this.innerText.toLowerCase();
        
        // Map 'del' text to 'backspace' logic if data-key wasn't set
        if (key === 'del') key = 'backspace';
        
        handleInput(key);
        
        // Remove focus from button to prevent Enter key triggering the button again
        this.blur(); 
    });
}

function updateWordOnScreen(guessedWord,currentChanceNum){
    clearAllLetters();
    
    // Safety check to ensure we don't crash if game is over (row doesn't exist)
    const phraseRowEl = document.getElementsByClassName('phrase-row')[currentChanceNum-1];
    if (!phraseRowEl) return; 

    for (let i = 0; i < guessedWord.length; i++) {
        phraseRowEl.querySelectorAll('.letter')[i].textContent = guessedWord[i];
    }    
}

function clearAllLetters(){
    const phraseRowEl = document.getElementsByClassName('phrase-row')[currentChanceNum-1];
    if (!phraseRowEl) return;

    phraseRowEl.querySelectorAll('.letter').forEach((element) => {
        element.textContent = '';
    });
}

function generate_Space_Separated_Word() {
    let combinedText = "";
    const element = document.getElementsByClassName('phrase-row')[currentChanceNum-1];

    // Loop through the child elements
    for (let i = 0; i < element.children.length; i++) {
    if (element.children[i].classList.contains('space')) {
        combinedText += ' ';
    } else {
        const childElement = element.children[i];
        combinedText += childElement.textContent;
    }
    }

    return combinedText;
}

function color_AllLetterBoxes(colorCodedString) {
    const letters = document.getElementsByClassName('phrase-row')[currentChanceNum-1].getElementsByClassName('letter');

    // Loop through the child elements
    for (let i = 0; i < letters.length; i++) {
    if (colorCodedString.charAt(i) === '1') {
        letters[i].classList.add('green')
    } else if (colorCodedString.charAt(i) === '2') {
        letters[i].classList.add('orange')          
    } else if (colorCodedString.charAt(i) === '3') {
        letters[i].classList.add('purple')          
    } else if (colorCodedString.charAt(i) === '*') {
        letters[i].classList.add('gray')          
    }
    }

}

function color_KeyboardLetters(guessedWord, colorCodedString){
    const buttons = document.getElementsByClassName('keyboard-button');
    for (let i = 0; i < buttons.length; i++) {
        let lowest_color_num_for_letter_in_guess;
    
        let letter = buttons[i].innerText.toLowerCase();
        
        // Skip keys that aren't in our dictionary (Enter, Backspace)
        if (!keyboard_letters_dict.hasOwnProperty(letter)) continue;

        lowest_color_num_for_letter_in_guess = get_LowestColorValue_For_Letter(letter,guessedWord,colorCodedString);
        console.log(letter,guessedWord,colorCodedString,lowest_color_num_for_letter_in_guess);

        if (lowest_color_num_for_letter_in_guess < keyboard_letters_dict[letter]) {
        //Updating class name of keyboard tile to ensure correct color gets applied
        buttons[i].classList.remove(keyboard_colors_dict[keyboard_letters_dict[letter]]);
        buttons[i].classList.add(keyboard_colors_dict[lowest_color_num_for_letter_in_guess]);
        
        //Updating keyboard letter dictionary's color number
        keyboard_letters_dict[letter] = lowest_color_num_for_letter_in_guess
        }      
    }
}

function get_LowestColorValue_For_Letter(letter, guessedWord, colorCodedString) {
    let letter_color_num = 5;
    let pos = 0;
    while (guessedWord.indexOf(letter, pos) !== -1) {
    let updatedPos = guessedWord.indexOf(letter, pos);
    let updatedColorVal = colorCodedString.charAt(updatedPos).toString();
    console.log(updatedColorVal);
    let temp_color_num

    if (updatedColorVal == '*') {
        temp_color_num = 4
    } else if (updatedColorVal == '3') {
        temp_color_num = 3
    } else if (updatedColorVal == '2') {
        temp_color_num = 2
    } else if (updatedColorVal == '1') { 
        temp_color_num = 1
    } else {
        temp_color_num = 5
    }
    
    if (temp_color_num < letter_color_num) {
        letter_color_num = temp_color_num
    }

    pos = updatedPos + 1;
    }

    return letter_color_num
}
//******************************************************************************************************************************************* // Functions to generate colours for tiles in a string made of 1,2,3 and *
function generateColours(phrase, guess) {
    let guessed_Phrase_Trimmed = guess.replace(/ /g, "").toLowerCase();
    let correctPhrase_Trimmed = phrase.replace(/ /g, "").toLowerCase();
    let colorCodedPhrase = "*".repeat(correctPhrase_Trimmed.length);
    
    let wordList = phrase.split(" ");
    let guessedWordList = guess.split(" ");
    
    // Stage 1 - Green check
    for (let i = 0; i < correctPhrase_Trimmed.length; i++) {
        if (correctPhrase_Trimmed.charAt(i) === guessed_Phrase_Trimmed.charAt(i)) {
        colorCodedPhrase = replaceCharAtIndex(colorCodedPhrase, i, "1");
        correctPhrase_Trimmed = replaceCharAtIndex(correctPhrase_Trimmed, i, "-");
        guessed_Phrase_Trimmed = replaceCharAtIndex(guessed_Phrase_Trimmed, i, "-");
        }
    }
    // console.log(correctPhrase_Trimmed,guessed_Phrase_Trimmed)
    // console.log(colorCodedPhrase)

    // Update word list for dashes
    // console.log(wordList,guessedWordList)
    // console.log(correctPhrase_Trimmed)
    wordList = updateWordListsDashes(wordList, correctPhrase_Trimmed);
    guessedWordList = updateWordListsDashes(guessedWordList, correctPhrase_Trimmed);
    
    // console.log(wordList,guessedWordList)

    // Stage 2 - Orange check
    let letterCount = 0;
    for (let wordIndex = 0; wordIndex < wordList.length; wordIndex++) {
        const word = wordList[wordIndex];
        for (let x = 0; x < word.length; x++) {
        if (correctPhrase_Trimmed.charAt(letterCount) !== "-") {
            const letterToCheck = correctPhrase_Trimmed.charAt(letterCount);
            // console.log(letterToCheck);
            if (guessedWordList[wordIndex].indexOf(letterToCheck) !== -1) {
            let wordPositionTranslated = 0;
            for (let n = 0; n <= wordIndex; n++) {
                if (n === wordIndex) {
                wordPositionTranslated += guessedWordList[wordIndex].indexOf(letterToCheck) + 1;
                colorCodedPhrase = replaceCharAtIndex(colorCodedPhrase, wordPositionTranslated - 1, "2");
                correctPhrase_Trimmed = replaceCharAtIndex(correctPhrase_Trimmed, letterCount, "-");
                guessed_Phrase_Trimmed = replaceCharAtIndex(guessed_Phrase_Trimmed, wordPositionTranslated - 1, "-");

                // Update word lists for modifications made above
                wordList = updateWordListsDashes(wordList, correctPhrase_Trimmed);
                guessedWordList = updateWordListsDashes(guessedWordList, guessed_Phrase_Trimmed);
        
                break;
                }
                wordPositionTranslated += wordList[n].length;
            }
            }
        }
        letterCount++;
        }
    }
    
    // console.log(colorCodedPhrase)
    // console.log(wordList,guessedWordList)
    // console.log(correctPhrase_Trimmed,guessed_Phrase_Trimmed)

    // Stage 3 - Purple Check
    letterCount = 0;
    for (let wordIndex = 0; wordIndex < wordList.length; wordIndex++) {
        const word = wordList[wordIndex];
        for (let x = 0; x < word.length; x++) {
        if (correctPhrase_Trimmed.charAt(letterCount) !== "-") {
            const letterToCheck = correctPhrase_Trimmed.charAt(letterCount);
            for (let wordIndex2 = 0; wordIndex2 < guessedWordList.length; wordIndex2++) {
            if (guessedWordList[wordIndex2].indexOf(letterToCheck) !== -1) {
                let wordPositionTranslated = 0;
                for (let n = 0; n <= wordIndex2; n++) {
                if (n === wordIndex2) {
                    wordPositionTranslated += guessedWordList[wordIndex2].indexOf(letterToCheck) + 1;
                    colorCodedPhrase = replaceCharAtIndex(colorCodedPhrase, wordPositionTranslated - 1, "3");
                    correctPhrase_Trimmed = replaceCharAtIndex(correctPhrase_Trimmed, letterCount, "-");
                    guessed_Phrase_Trimmed = replaceCharAtIndex(guessed_Phrase_Trimmed, wordPositionTranslated - 1, "-");
                    break;
                }
                wordPositionTranslated += guessedWordList[n].length;
                }
                break;
            }
            }
        }
        letterCount++;
        }
    }
    
    return colorCodedPhrase;
    }
    
    function replaceCharAtIndex(str, index, replacement) {
    return str.substring(0, index) + replacement + str.substring(index + 1);
    }
    
    function updateWordListsDashes(wordList, correctPhrase_Trimmed) {
    let pos = 0;
    while (correctPhrase_Trimmed.indexOf("-", pos) !== -1) {
        let updatedPos = correctPhrase_Trimmed.indexOf("-", pos);
        let wordLength = 0;
        for (let wordIndex = 0; wordIndex < wordList.length; wordIndex++) {
        wordLength += wordList[wordIndex].length;
        if (updatedPos + 1 <= wordLength) {
            let charIndex = wordList[wordIndex].length - (wordLength - (updatedPos + 1))-1;
            wordList[wordIndex] = replaceCharAtIndex(wordList[wordIndex], charIndex, "-");
            // console.log(wordIndex);
            // console.log(charIndex);
            // console.log(wordList[wordIndex]);
            break;
        }
        }
        pos = updatedPos + 1;
    }
    
    return wordList;
    }