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

// State
const {screen, questionElement, inputElement, answerElement} = createUI();
let step: "start" | "question" | "bad-answer" | "good-answer" | "end" = "start";
const cards = readCards("cards/german.txt");
let card: Card | null = cards[0];
const requiredGoodCnt = 2;
let answer: string = "";

// This is called before `return` handler, so the `answer`
// is set when `gotoNext` is called.
inputElement.on("submit", text => (answer = text));
screen.key("return", gotoNext);
inputElement.key(["escape", "C-c"], () => {
    return process.exit(0);
})
screen.key(["escape", "q", "C-c"], (ch, key) => {
    return process.exit(0);
});

//screen.render();
gotoNext();

// function processReturn()
function gotoNext() {
    const steps = [gotoQuestion, gotoGoodAnswer, gotoBadAnswer, gotoEnd];
    for (const step of steps) {
        if (step()) {
            return;
        }
    }
}

function gotoQuestion() {
    if ((step === "start" || step === "good-answer" || step === "bad-answer") && hasMoreCards()) {
        step = "question";
        card = nextCard() as Card;
        inputElement.style.fg = "white";
        inputElement.setValue("");
        questionElement.setContent(card.question);
        //questionElement.insertTop(card.question);
        answerElement.hide();
        inputElement.focus();
        //console.log("render");
        screen.render();
        return true;
    }
    return false;
}

function gotoGoodAnswer() {
    if (step === "question" && card && isAnswerCorrect()) {
        step = "good-answer";
        card.goodCnt++;
        inputElement.style.fg = "green";
        screen.render();
        // or updateUI();
        return true;
    }
    return false;
}

function gotoBadAnswer() {
    if (step === "question" && card && !isAnswerCorrect()) {
        step = "bad-answer";
        inputElement.style.fg = "red";
        answerElement.setContent(card.answer);
        answerElement.show();
        screen.render();
        return true;
    }
    return false;
}

function gotoEnd() {
    if ((step === "good-answer" || step === "bad-answer") && !hasMoreCards()) {
        step = "end";
        card = null;
        process.exit();
        return true;
    }
    return false;
}

function nextCard(): Card | null {
    const candidateCards = cards.filter(card => card.goodCnt < requiredGoodCnt);
    if (!candidateCards.length) {
        return null;
    }
    return candidateCards[Math.floor(Math.random() * candidateCards.length)];
}

function hasMoreCards(): boolean {
    return nextCard() != null;
}

function isAnswerCorrect(): boolean {
    return answer.toLowerCase() === card?.answer.toLowerCase();
}

function createUI() {
    const screen = blessed.screen({
        smartCSR: true,
        dockBorders: true
    });

    screen.title = "Flash Gordon";

    const containerElement = blessed.box({
        content: "",
        top: "center",
        left: "center",
        width: "50%",
        //height: "auto",
        shrink: true,
        border: {
            type: "line"
        },
        style: {
            fg: "white",
            border: {
                fg: "#f0f0f0"
            }
        }
    });

    const questionElement = blessed.box({
        //top: "center",
        //top: "50%",
        //left: "center",
        top: 0,
        left: 0,
        //width: "50%",
        //shrink: true,
        height: "shrink",
        padding: {left: 1, right: 1},
        //maxWidth: "100%-2",
        //height: 1,
        //shrink: true,
        //height: 3,
        //scrollable: true,
        content: "",
        tags: true
        //label: "haha",
    });

    const inputElement = blessed.textbox({
        top: 3,
        //bottom: 0,
        left: 0,
        //width: 10,
        height: 3,
        padding: {top: 1, left: 1, right: 1},
        content: "",
        //top: 10,
        inputOnFocus: true
    });

    const answerElement = blessed.box({
        width: 10,
        height: 3,
        top: 2,
        left: 8,
        content: ""
        //width: 20,
        //height: 10
    });

    //containerElement.append(questionElement);
    screen.append(containerElement);
    containerElement.append(questionElement);
    containerElement.append(inputElement);
    containerElement.append(answerElement);
    // questionElement.append(inputElement);
    // questionElement.append(answerElement);

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

// inputElement.key(["C-c"], (ch, key) => {
//     return process.exit(0);
// });

// input.on("submit", (a) => {input.setValue(""); screen.render()});
// //input.focus();
// input.readInput(() => {});
