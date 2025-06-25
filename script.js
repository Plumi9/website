// Rules definitions and check
const rules = {
    rule1: (password) => password.length >= 5,
    rule2: (password) => /\d/.test(password),
    rule3: (password) => /[A-Z]/.test(password),
    rule4: (password) => /[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/.test(password),
    rule5: (password) => {
        const digits = password.match(/\d/g);
        const sum = digits ? digits.reduce((acc, digit) => acc + parseInt(digit), 0) : 0;
        return sum === 25;
    },
    rule6: (password) => {
        let months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
        return months.some(month => password.toLowerCase().includes(month));
    },
    rule7: (password) => {
        const romanNumerals = /[IVXLCDM]/;
        return romanNumerals.test(password);
    },
    rule8: (password) => {return pokemonName && password.toLowerCase().includes(pokemonName.toLowerCase());},
    rule9: (password) => {return password.includes(chosen_captcha)},
    rule10: (password) => {return periodicTableSymbols.some(symbol => password.includes(symbol));},
    rule11: (password) => {
        const years = password.match(/\d+/g);
        if (!years) return false;
        return years.some(year => {
            const y = parseInt(year);
            return ((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0);
        });
    },
    rule12: (password) => password.includes(current_moon_phase_emoji),
    rule13: (password) =>  {
        const romanNumerals = password.match(/[IVXLCDM]+/g);
        if (!romanNumerals) return false;
        const values = romanNumerals.map(numeral => romanToInteger(numeral));
        const product = values.reduce((acc, val) => acc * val, 1);
        return product === 35;
    },
    rule14: (password) => password.includes(password.length),
    rule15: (password) => {
        const isPrime = num => {
            for(let i = 2, s = Math.sqrt(num); i <= s; i++) {
                if(num % i === 0) return false;
            }
            return num > 1;
        }
        return isPrime(password.length);
    }
};

// For showing and keeping track of rules
const rulesArray = Object.keys(rules);
let currentRules = [];

// For pokemon rule
let pokemonName = "";
// For captcha rule 
let captchas = ["8t23f","f75jp","ga233","kp98h","r8gbm"];
let chosen_captcha = "";
//For moon phase rule
let current_moon_phase_emoji = "🌑";
// For chemistry rule
const periodicTableSymbols = [
    'He','Li','Be','Ne','Na','Mg','Al','Si','Cl','Ar','Ca','Sc','Ti','Cr','Mn','Fe','Co','Ni','Cu','Zn','Ga','Ge','As','Se','Br',
    'Kr','Rb','Sr','Zr','Nb','Mo','Tc','Ru','Rh','Pd','Ag','Cd','In','Sn','Sb','Te','Xe','Cs','Ba','La','Ce','Pr','Nd','Pm','Sm',
    'Eu','Gd','Tb','Dy','Ho','Er','Tm','Yb','Lu','Hf','Ta','Re','Os','Ir','Pt','Au','Hg','Tl','Pb','Bi','Po','At','Rn','Fr','Ra',
];

// Returns a description of each rule to display
function getRuleDescription(rule) {
    switch (rule) {
        case 'rule1': return 'Rule 1: Your password must be at least five characters';
        case 'rule2': return 'Rule 2: Your password must include a number';
        case 'rule3': return 'Rule 3: At least one uppercase letter';
        case 'rule4': return 'Rule 4: Must contain a special character';
        case 'rule5': return 'Rule 5: The digits in your password must add up to 25';
        case 'rule6': return 'Rule 6: Your password must include a month of the year';
        case 'rule7': return 'Rule 7: Your password must include a Roman numeral';
        case 'rule8': {return `
            <div>
                Rule 8: Your password must include the name of the pokemon in this picture
                <div style="text-align: center;"> <img src="" style="width: 150px; height: 150px;"> </div>
            </div>`
        };
        case 'rule9': {return `
        <div> 
            'Rule 9: Your password must include this CAPTCHA'
            <div style="text-align: center;"> <img src="" style="width: 150px; height: 150px;"> </div>
        </div>`
        };
        case 'rule10': return 'Rule 10: Your password must include a two-letter symbol from the periodic table';
        case 'rule11': return 'Rule 11: Your password must include a leap year';
        case 'rule12': return 'Rule 12: Your password must include the current phase of the moon as an emoji';
        case 'rule13': return 'Rule 13: The Roman numerals in your password should multiply to 35';
        case 'rule14': return 'Rule 14: Your password must include the length of your password';
        case 'rule15': return 'Rule 15: The length of your password must be a prime number';
        default: return '';
    }
}
// Gets called every time input changes
function validate_Password() {
    const password = document.getElementById('password').value;
    // Always show the next rule at the start, so rules begin displaying
    if (currentRules.length === 0) {
        showNextRule();
    }
    // Check the password against all shown rules
    checkRules(password);
    // Shows the next rule if all current ones are valid
    if (areAllCurrentRulesValid(password)) {
        showNextRule();
    }
    // Shows the button if all the rules are fulfilled
    const submitButton = document.getElementById('submit_button');
    if (rulesArray.length === 0 && areAllCurrentRulesValid(password) || password == "solve") {
        submitButton.style.display = 'block';
    } else {
        submitButton.style.display = 'none';
    }
}

// This function shows the next rule in the list, if any are even left
function showNextRule() {
    const password = document.getElementById('password').value;

    while (rulesArray.length > 0 && areAllCurrentRulesValid(password)) {
        const nextRule = rulesArray.shift(); // Get the next rule
        currentRules.push(nextRule); // Add it to the displayed rules

        // Create the rule element and insert it at the top of the rules list
        const ruleDiv = document.createElement('h2');
        ruleDiv.classList.add('rule', 'invalid');
        ruleDiv.id = nextRule;
        ruleDiv.innerHTML = getRuleDescription(nextRule);

        const rulesContainer = document.getElementById('rules_container');
        rulesContainer.prepend(ruleDiv); // Add the new rule to the top of the list

        // Trigger fade-in effect
        setTimeout(() => {
            ruleDiv.classList.add('visible');
        }, 10);

        // extra function calls for weird rules
        if (nextRule === 'rule8') pokemon();
        if (nextRule === 'rule9') captcha();
        if (nextRule === 'rule12') moon_phase();

        // Validate the current rules again after adding the new rule
        checkRules(password);
    }
}

// This function checks all current rules
function checkRules(password) {
    currentRules.forEach(rule => {
        const ruleElement = document.getElementById(rule);
        const isValid = rules[rule](password);

        if (isValid) {
            ruleElement.classList.remove('invalid');
            ruleElement.classList.add('valid');
        } else {
            ruleElement.classList.remove('valid');
            ruleElement.classList.add('invalid');
        }
    });
}

// This function checks if all currently displayed rules are valid
function areAllCurrentRulesValid(password) {
    const allValid = currentRules.every(rule => rules[rule](password));
    return allValid;
}

// This function scales textbox
function autoGrow(textarea) {
    textarea.style.height = 'auto'; // Reset the height
    textarea.style.height = textarea.scrollHeight + 'px'; // Set it to the scrollHeight
}

// This function updates Password length shown
function display_length(){
    const password = document.getElementById('password').value;
    const length_display = document.getElementById('length_display');
    length_display.innerHTML = password.length;
}

// For rule 8
async function pokemon() {
    const imgElement = document.querySelector('#rule8 img');  // Get the image element within Rule 8
    let rnd_number = Math.floor(Math.random() * 1024) + 1;
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${rnd_number}`);
        if (!response.ok) {
            throw new Error("Could not fetch Pokémon data!");
        }
        const data = await response.json();
        const pokemonSpriteURL = data.sprites.front_default;
        pokemonName = data.name;
        console.log(pokemonName);
        imgElement.src = pokemonSpriteURL;
    } catch (error) {
        console.log(error);
    }
}

// For rule 9
function captcha(){
    const imgElement = document.querySelector('#rule9 img');  // Get the image element within Rule 9
    chosen_captcha = captchas[Math.floor(Math.random() * 4) + 1];
    imgElement.src = "./captcha/"+chosen_captcha+".png";
}

// For rule 11
async function moon_phase(){
    const moonPhaseEmojis = {
        "New Moon": "🌑",
        "Waxing Crescent":"🌒",
        "1st Quarter":"🌓",
        "Waxing Gibbous":"🌔",
        "Full Moon":"🌕",
        "Waning Gibbous":"🌖",
        "3rd Quarter":"🌗", 
        "Waning Crescent":"🌘",
        "Dark Moon": "🌘",
    }
    var unix_time = Math.floor(Date.now() / 1000);
    try{
        const response = await fetch(`https://api.farmsense.net/v1/moonphases/?d=${unix_time}`);
        if (!response.ok) {
            throw new Error("Could not fetch Moon data!");
        }
        const data = await response.json();
        let phase = data[0].Phase;
        current_moon_phase_emoji = moonPhaseEmojis[phase];
    }catch(error){
        console.log(error);
    }
}

// For rule 13
function romanToInteger(roman) {
    const romanValues = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
    let total = 0;
    for (let i = 0; i < roman.length; i++) {
        const current = romanValues[roman[i]];
        const next = romanValues[roman[i + 1]];

        // If the current value is less than the next one, subtract it (e.g., IV = 4)
        if (next && current < next) {
            total -= current;
        } else {
            total += current;
        }
    }
    return total;
}

// onclick Button after solving riddle
function changePage(){
    let path = "./website/index.html";
    window.location.href = path;
}