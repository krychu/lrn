import React, {FC, useState} from 'react';
import {Text, Box, useInput, useApp} from 'ink';
import { Card } from "./cli";
import chalk from "chalk";

/*
   {
   upArrow: false,
   downArrow: false,
   leftArrow: false,
   rightArrow: false,
   pageDown: false,
   pageUp: false,
   return: false,
   escape: false,
   ctrl: true,
   shift: false,
   tab: false,
   backspace: false,
   delete: false,
   meta: false
   }
 */

type Step = "question" | "good-answer" | "bad-answer" | "end";

/* const App: FC<{cards2: Card[]}> = ({cards2 = []}) => { */
const App: FC<{cards: Card[], goodCnt: number}> = ({cards = [], goodCnt = 1}) => {
	const {exit} = useApp();

	/* const [cards, setCards] = useState(_cards); */

	//const [card] = useState(cards[0] as Card);
	/* const [input, setInput] = useState(""); */
	//const [text, setText] = useState("");
  const [userInput, setUserInput] = useState("");
	//const [card] = useState(cards[0] as Card);
	const [allCards] = useState(cards);
	//const [cardIdx, setCardIdx] = useState(0);
	const [step, setStep] = useState("question" as Step)
	const [card, setCard] = useState(cards[0] as Card);

	/* const [progress, setProgress] = useState({cardCnt: cards.length, answeredCnt: 0}); */

	const getNextCard = () => {
		const candidateCards = allCards.filter(card => card.goodCnt < goodCnt);
		if (!candidateCards.length) {
			return null;
		}
		const idx = Math.floor(Math.random() * candidateCards.length);
		return candidateCards[idx];
	};

	const questionInput = (input: string, key: any) => {
		if (key.return) {
			if (userInput.toLowerCase() === card.answer.toLowerCase()) {
				//const newCards = [...cards];
				card.goodCnt++;
				//setCards(newCards);
				setStep("good-answer");
			} else {
				setStep("bad-answer");
			}
			return;
		} else if (key.delete) {
			setUserInput(userInput.slice(0, userInput.length-1));
			return;
		}
		setUserInput(userInput + input);
	};

	const answerInput = (_: string, key: any) => {
		if (key.return) {
			const nextCard = getNextCard();
			setUserInput("");
			if (nextCard) {
				setCard(nextCard);
				setStep("question");
			} else {
				setStep("end");
			}
		}
	};

	useInput((input, key) => {
		if (input === 'q') {
			exit();
		}

		switch (step) {
			case "question":
				questionInput(input, key);
				break;
		  case "bad-answer":
			case "good-answer":
				answerInput(input, key);
				break;
			default:
				throw new Error("?");
		}
	});

	const badAnswer = step === "bad-answer" ? <Box paddingX={1}>
		<Text color="red">{card.answer}</Text>
	</Box> : null;

	const userInputDisplay = userInput + (step === "question" ? chalk.inverse(" ") : "");

	return <Box justifyContent="center">
		<Box flexBasis="50%" flexDirection="column">
			<Box flexDirection="column" borderStyle="single">
				<Box paddingX={1}>
					<Text>{card.question}</Text>
				</Box>
				<Box paddingX={1} paddingTop={1} height={2}>
					<Text>{userInputDisplay}</Text>
				</Box>
			</Box>
			{badAnswer}
		</Box>
	</Box>
};

/* function isCorrect(question: string, answer: string): boolean {
 * 	return question.toLowerCase() === answer.toLowerCase();
 * } */

module.exports = App;
export default App;
