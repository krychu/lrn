import React, {FC, useState} from 'react';
import {Text, Box, useInput, useApp} from 'ink';
import TextInput from 'ink-text-input';
import { Card } from "./cli";
import chalk from "chalk";

const App: FC<{cards: Card[]}> = ({cards = []}) => {
	const {exit} = useApp();
	/* const [cards, setCards] = useState(_cards); */

	//const [card] = useState(cards[0] as Card);
	const [input, setInput] = useState("");
	const [text, setText] = useState("");

	/* const [progress, setProgress] = useState({cardCnt: cards.length, answeredCnt: 0}); */

	useInput((input, key) => {
		if (input === 'q') {
			exit();
		}

		if (key.leftArrow) {
			// Left arrow key pressed
			//console.log("jaja");
			//setCards(cards);
			//setCards(cards.slice(0,1));
		} else if (key.return) {
		}

		//setText(text + input);
	});

	const onSubmit = (val: string) => {
		console.log(val);
	};


	return <Box justifyContent="center">
		<Box flexBasis="50%" flexDirection="column" borderStyle="single">
			<Box padding={1}>
				<Text>{(cards[0] as Card).question}</Text>
			</Box>
			<TextInput value={input} onChange={setInput} onSubmit={onSubmit} />
			<Box borderStyle="single">
				<Text>first text</Text>
			</Box>
			<Box marginTop={-1} borderStyle="single">
				<Box marginTop={-1}>
					<Text>second text</Text>
				</Box>
			</Box>
			<Box>
				<Text>{text}{chalk.inverse(" ")}</Text>
			</Box>
		</Box>
	</Box>
};

module.exports = App;
export default App;
