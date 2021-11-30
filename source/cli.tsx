#!/usr/bin/env node

import fs from "fs";
//import React from 'react';
import React from 'react';
// import {Box} from 'ink';
import {render} from 'ink';
//import meow from 'meow';
import App from './ui';

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

export interface Card {
	question: string;
	answer: string;
	goodCnt: number;
};

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

const cards = readCards("cards/german.txt");

// const FullScreen: FC = (props) => {
// 	const [size, setSize] = useState({
// 		columns: process.stdout.columns,
// 		rows: process.stdout.rows,
// 	});

// 	useEffect(() => {
// 		function onResize() {
// 			setSize({
// 				columns: process.stdout.columns,
// 				rows: process.stdout.rows,
// 			});
// 		}

// 		process.stdout.on("resize", onResize);
// 		process.stdout.write("\x1b[?1049h");
// 		return () => {
// 			process.stdout.off("resize", onResize);
// 			process.stdout.write("\x1b[?1049l");
// 		};
// 	}, []);

// 	return (
// 		<Box width={size.columns} height={size.rows}>
// 			{props.children}
// 		</Box>
// 	);
// };

const enterAltScreenCommand = "\x1b[?1049h";
const leaveAltScreenCommand = "\x1b[?1049l";
process.stdout.write(enterAltScreenCommand);
process.on("exit", () => {
  process.stdout.write(leaveAltScreenCommand);
});

//render(<App name={cli.flags.name}/>);
render(
		<App cards={cards} goodCnt={2} />
);
