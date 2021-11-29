#!/usr/bin/env node

//import fs from "fs";
import React from 'react';
import {render} from 'ink';
//import meow from 'meow';
import App from './ui';
import { RecoilRoot } from "recoil";

// const cli = meow(`
// 	Usage
// 	  $ flashcards

// 	Options
// 		--name  Your name

// 	Examples
// 	  $ flashcards --name=Jane
// 	  Hello, Jane
// `, {
// 	flags: {
// 		name: {
// 			type: 'string'
// 		}
// 	}
// });

// export interface Card {
// 	question: string;
// 	answer: string;
// };

// function readCards(filename: string) {
// 	const text = fs.readFileSync(filename, {encoding: "utf8"});
// 	const lines = text.split(/\n/);
// 	const cards: Card[] = [];

// 	let lastState: "separator" | "question" | "answer" = "separator";
// 	let question: string = "";
// 	let answer: string = "";
// 	for (let i=0; i<lines.length; i++) {
// 		const line = (lines[i] as string).trim();
// 		const emptyLine = line.length === 0;
// 		const lastLine = i === lines.length-1;
// 		if (lastState === "separator") {
// 			if (!emptyLine) {
// 				lastState = "question";
// 				question = line;
// 			} // else lastState correctly remains "separator"
// 		} else if (lastState === "question") {
// 			if (emptyLine) {
// 				throw new Error(`Answer should follow the question (line: ${i})`);
// 			} else {
// 				lastState = "answer";
// 				answer = line;
// 				const card: Card = {question, answer};
// 				cards.push(card);
// 			}
// 		} else if (lastState === "answer") {
// 			if (emptyLine) {
// 				lastState = "separator";
// 			} else {
// 				throw new Error(`Empty line should follow question (line: ${i})`);
// 			}
// 		}

// 		if (lastLine && lastState === "question") {
// 			throw Error(`Last question doesn't have an answer`);
// 		}
// 	}

// 	return cards;
// }

//const cards = readCards("cards/german.txt");
//render(<App name={cli.flags.name}/>);
render(
    <RecoilRoot>
        <App />
    </RecoilRoot>
);
