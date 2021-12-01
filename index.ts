#!/usr/bin/env node

// import { terminal as term } from "terminal-kit";

// term.magenta("Enter your name: ");
// term.inputField((error, input) => {
//     term.green("Your name is %s", input);
// });

import fs from "fs";
import assert from 'assert/strict';
import blessed, {Widgets} from "blessed";
//const blessed = require("neo-blessed");

interface Card {
	  question: string;
	  answer: string;
	  goodCnt: number;
};

const {screen, questionElement, inputElement, answerElement} = createUI();
let step: "question" | "bad-answer" | "good-answer" | "end" = "question";
const cards = readCards("cards/german.txt");
let card: Card = cards[0];
let answer: string = "";
nextCard();

// input.on("submit", (a) => {
//     // input.setValue("");
//     // screen.render();
//     answer = a;
//     // console.log("here1");
//     // if (a === card.answer) {
//     //     card.goodCnt++;
//     //     renderGoodAnswer();
//     //     step = "good-answer";
//     // } else {
//     //     renderBadAnswer();
//     //     step = "bad-answer";
//     // }
// });

// screen.on("keypress", (ch, key) => {
//     if (step === "question" && key.name === "return") {
//         if (answer === card.answer) {
//             step = "good-answer";
//             card.goodCnt++;
//             render();
//         } else {
//             step = "bad-answer";
//             render();
//         }
//     } else if ((step === "good-answer" || step === "bad-answer") && key.name === "return") {
//         step = "question";
//         nextCard();
//         render();
//     }
// });

// good
inputElement.on("submit", text => (answer = text));
// This will be called AFTER submit above
// screen.key("return", () => {
//     if (step === "question") {
//         processAnswer();
//     } else if (step === "bad-answer" || step === "good-answer") {
//         nextCard();
//     }
// });
screen.key("return", nextStep);

// input.readInput(() => {});
screen.render();
inputElement.focus();
//input.focus();

function processAnswer() {
    if (answer.toLowerCase() === card.answer.toLowerCase()) {
        step = "good-answer";
        card.goodCnt++;
        inputElement.style.fg = "green";
    } else {
        step = "bad-answer";
        inputElement.style.fg = "red";
    }
    screen.render();
}

function processAnswer() {
    gotoGoodAnswer() || gotoBadAnswer();
    // if (answer.toLowerCase() === card.answer.toLowerCase()) {
    //     gotoGoodAnswer();
    // } else {
    //     gotoBadAnswer();
    // }
}

function gotoGoodAnswer() {
    if (answer.toLowerCase() !== card.answer.toLowerCase()) {
        return false;
    }
    step = "good-answer";
    HERE
}

function nextCard() {
    const candidateCards = cards.filter(card => card.goodCnt < requiredGoodCnt);

    if (candidateCards.length) {
        card = candidateCards[Math.floor(Math.random() * candidateCards.length)];
    } else {
        step = "end"
    }
}

// new idea
function nextStep() {
    if (step === "question") {
        if (answer.toLowerCase() === card.answer.toLowerCase()) {
            step = "good-answer";
        } else {
            step = "bad-answer";
        }
    } else if (step === "good-answer" || step === "bad-answer") {
        step = "question";
    }
}

function nextStep() {
    if (step === "question") {
        processAnswer();
    } else if (step === "good-answer" || step === "bad-answer") {
        nextCard();
    }
}

// function render() {
    
// }

// function stepQuestion() {
// }

// function renderGoodAnswer() {
//     //
// }

// function renderBadAnswer() {
//     answer.setContent(card.answer);
//     answer.show();
//     screen.render();
// }

// function nextCard() {
//     card = cards.filter(card => card.goodCnt<2)[0];
//     answer.hide();
//     input.setValue("");
//     question.setContent(card.question);
//     input.focus();
//     screen.render();
// }

function createUI() {
    const screen = blessed.screen({
        smartCSR: true
    });

    screen.title = "Krychu";

    const questionElement = blessed.box({
        top: "center",
        left: "center",
        width: "50%",
        height: "50%",
        content: "Hello {bold}world{/bold}!",
        tags: true,
        label: "haha",
        border: {
            type: "line"
        },
        style: {
            fg: "white",
            //bg: "magenta",
            border: {
                fg: "#f0f0f0"
            },
            hover: {
                bg: "green"
            }
        }
    });

    screen.key(["escape", "q", "C-c"], (ch, key) => {
        return process.exit(0);
    });

    const inputElement = blessed.textbox({
        content: "lala",
        border: {
            type: "line"
        },
        top: 10,
        inputOnFocus: true
    });

    const answerElement = blessed.box({
        content: "Box2",
        border: {
            type: "line"
        },
        width: 20,
        height: 10
    });

    screen.append(questionElement);
    questionElement.append(inputElement);
    questionElement.append(answerElement);

    return {screen, questionElement, inputElement, answerElement};
}

function readCards(filename: string): Card[] {
	const text = fs.readFileSync(filename, {encoding: "utf8"});
	const lines = text.split(/\n/);
	const cards: Card[] = [];

	let lastState: "separator" | "question" | "answer" = "separator";
	let question: string = "";
	let answer: string = "";
	for (let i=0; i<lines.length; i++) {
		const line = (lines[i] as string).trim();
		const emptyLine = line.length === 0;
		const lastLine = i === lines.length-1;
		if (lastState === "separator") {
			if (!emptyLine) {
				lastState = "question";
				question = line;
			} // else lastState correctly remains "separator"
		} else if (lastState === "question") {
			if (emptyLine) {
				throw new Error(`Answer should follow the question (line: ${i})`);
			} else {
				lastState = "answer";
				answer = line;
				const card: Card = {question, answer, goodCnt: 0};
				cards.push(card);
			}
		} else if (lastState === "answer") {
			if (emptyLine) {
				lastState = "separator";
			} else {
				throw new Error(`Empty line should follow question (line: ${i})`);
			}
		}

		if (lastLine && lastState === "question") {
			throw Error(`Last question doesn't have an answer`);
		}
	}

	return cards;
}

//input.focus();
//input.readInput(function() {});

inputElement.key(["C-c"], (ch, key) => {
    return process.exit(0);
});

// input.on("submit", (a) => {input.setValue(""); screen.render()});
// //input.focus();
// input.readInput(() => {});
