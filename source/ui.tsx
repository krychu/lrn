import React, {FC, useState, useEffect} from 'react';
import {Text, Box, useInput, useApp} from 'ink';
import { Card } from "./cli";
import chalk from "chalk";
import { useScreenSize } from './hooks/useScreenSize';

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

interface ShowCardStep {
    step: "show-card";
    cardIdx: number;
    userInput: string;
};

interface GoodAnswerStep {
    step: "good-answer";
    cardIdx: number;
};

interface BadAnswerStep {
    step: "bad-answer";
    cardIdx: number;
};

interface EndStep {
    step: "end";
};

type Step = ShowCardStep | GoodAnswerStep | BadAnswerStep | EndStep;

//type Step = "question" | "good-answer" | "bad-answer" | "end";

const enterAltScreenCommand = `\x1b[?1049h`;
const leaveAltScreenCommand = `\x1b[?1049l`;

export const enterFullscreen = (): void => void process.stdout.write(enterAltScreenCommand);
export const exitFullscreen = (): void => void process.stdout.write(leaveAltScreenCommand);

/* const App: FC<{cards2: Card[]}> = ({cards2 = []}) => { */
const App: FC<{cards: Card[], goodCnt: number}> = ({cards = [], goodCnt = 1}) => {
	  const {exit} = useApp();

    const { width, height } = useScreenSize();

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

    useInput((input, key) => {
        if (step.type === "question") {
            useInputQuestionStep(input, key);
        } else if (step.type === "answer") {
            useInputAnswerStep(input, key);
        }
    });

    const useInput_ShowCard = (input: string, key: any) => {
        if (key.return) {
            isAnswerGood() ? gotoAnswerStep();
        } else {
            step.userInput += input;
        }
    };

    const useInput_Answer = (input: string, key: any) => {
        if (key.return) {
            hasMoreCards() ? gotoQuestionStep() : gotoEndStep();
        }
    };

    const gotoAnswerStep = () => {
        const answerStep = {
            type: "answer",
            isAnswerGood: isAnswerGood(),
            card: step.card
        };
        if (answerStep.isAnswerGood) {
            answerStep.card.goodCnt++;
        }
        setStep(answerStep);
    };

    const gotoQuestionStep = () => {
        const quesitonStep = {
            type: "question",
            answer: "",
            card: getNextCard()
        };
        setStep(questionStep);
    };

    const gotoEndStep = () => {
        const endStep = {
            type: "end"
        };
    };

    const getNextCard = () => {
		    const candidateCards = allCards.filter(card => card.goodCnt < goodCnt);
		    if (!candidateCards.length) {
			      return null;
		    }
		    const idx = Math.floor(Math.random() * candidateCards.length);
		    return candidateCards[idx];
	  };

    const hasMoreCards = () => {
        return !!allCards.filter(card => card.goodCnt < goodCnt).length;
    };

    const isAnswerGood


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
            //exitFullscreen();
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

	  const correctAnswer = step === "bad-answer" ? <Box paddingX={1}>
		    <Text color="green">{card.answer}</Text>
	  </Box> : null;

    let userInputColor = "white";
    let userInputText = userInput;
    if (step === "question") {
        userInputText += chalk.inverse(" ");
    } else if (step === "bad-answer") {
        userInputColor = "red";
    } else if (step === "good-answer") {
        userInputColor = "green";
    }

    //enterFullscreen();

	  return <Box justifyContent="center" width={width} height={height}>
		    <Box justifyContent="center" flexBasis={60} minWidth={20} flexDirection="column">
			      <Box flexDirection="column" borderStyle="single">
				        <Box paddingX={1}>
					          <Text>{card.question}</Text>
				        </Box>
				        <Box paddingX={1} paddingTop={1} height={2}>
					          <Text color={userInputColor}>{userInputText}</Text>
				        </Box>
			      </Box>
			      {correctAnswer}
		    </Box>
	  </Box>
};

export const FullScreen: FC = (props) => {
 	  const [size, setSize] = useState({
 		    columns: process.stdout.columns,
 		    rows: process.stdout.rows,
 	  });

 	  useEffect(() => {
 		    function onResize() {
 			      setSize({
 				        columns: process.stdout.columns,
 				        rows: process.stdout.rows,
 			      });
 		    }

 		    process.stdout.on("resize", onResize);
 		    process.stdout.write("\x1b[?1049h");
 		    return () => {
 			      process.stdout.off("resize", onResize);
 			      process.stdout.write("\x1b[?1049l");
 		    };
 	  }, []);

 	  return (
 		    <Box width={size.columns} height={size.rows}>
 			      {props.children}
 		    </Box>
 	  );
};

/* function isCorrect(question: string, answer: string): boolean {
 * 	return question.toLowerCase() === answer.toLowerCase();
 * } */

module.exports = App;
export default App;
