#!/usr/bin/env node

// import { terminal as term } from "terminal-kit";

// term.magenta("Enter your name: ");
// term.inputField((error, input) => {
//     term.green("Your name is %s", input);
// });

import fs from "fs";
import blessed, {Widgets} from "blessed";
//const blessed = require("neo-blessed");

interface Card {
	  question: string;
	  answer: string;
	  goodCnt: number;
};

const {screen, question, input, answer} = createUI();
let step: "question" | "bad-answer" | "good-answer" | "end" = "question";
const cards = readCards("cards/german.txt");
let card: Card = cards[0];
let answer: string | null = null;
nextCard();

input.on("submit", (a) => {
    // input.setValue("");
    // screen.render();
    answer = a;
    // console.log("here1");
    // if (a === card.answer) {
    //     card.goodCnt++;
    //     renderGoodAnswer();
    //     step = "good-answer";
    // } else {
    //     renderBadAnswer();
    //     step = "bad-answer";
    // }
});

screen.on("keypress", (ch, key) => {
    if (step === "question" && key.name === "return") {
        if (answer === card.answer) {HERE
            step = "good-answer";
            card.goodCnt++;
            render();
        } else {
            step = "bad-answer";
            render();
        }
    } else if ((step === "good-answer" || step === "bad-answer") && key.name === "return") {
        step = "question";
        nextCard();
        render();
    }
});

// input.readInput(() => {});
screen.render();
//input.focus();
//input.focus();

function renderGoodAnswer() {
    //
}

function renderBadAnswer() {
    answer.setContent(card.answer);
    answer.show();
    screen.render();
}

function nextCard() {
    card = cards.filter(card => card.goodCnt<2)[0];
    answer.hide();
    input.setValue("");
    question.setContent(card.question);
    input.focus();
    screen.render();
}

function createUI() {
    const screen = blessed.screen({
        smartCSR: true
    });

    screen.title = "Krychu";

    const question = blessed.box({
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

    const input = blessed.textbox({
        content: "lala",
        border: {
            type: "line"
        },
        top: 10,
        inputOnFocus: true
    });

    const answer = blessed.box({
        content: "Box2",
        border: {
            type: "line"
        },
        width: 20,
        height: 10
    });

    screen.append(question);
    question.append(input);
    question.append(answer);

    return {screen, question, input, answer};
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

input.key(["C-c"], (ch, key) => {
    return process.exit(0);
});

// input.on("submit", (a) => {input.setValue(""); screen.render()});
// //input.focus();
// input.readInput(() => {});
