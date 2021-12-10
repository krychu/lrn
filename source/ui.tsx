import React, {FC, useState} from 'react';
import {Text, Box, useInput, useApp} from 'ink';
import { Card } from "./cli";
import chalk from "chalk";
import { useScreenSize } from './hooks/useScreenSize';

type Step = "question" | "good-answer" | "bad-answer" | "end";

interface AppParams {
    cards: Card[];
    requiredGoodCnt: number;
};

const App: FC<AppParams> = (params: AppParams) => {
	  const {exit} = useApp();

    const requiredGoodCnt = params.requiredGoodCnt;
    const { width, height } = useScreenSize();

    const [userInput, setUserInput] = useState("");
	  const [cards] = useState(params.cards);
    const [step, setStep] = useState<Step>("question");
	  const [card, setCard] = useState<Card | null>(getNextCard());
	  /* const [progress, setProgress] = useState({cardCnt: cards.length, answeredCnt: 0}); */

    useInput((input, key) => {
        if (key.escape) {
            //exitFullscreen();
            exit();
        }

        if (step === "question") {
            useInputQuestionStep(input, key);
        } else if (step === "good-answer" || step === "bad-answer") {
            useInputAnswerStep(input, key);
        }
    });

    // Handle input during the question step
    function useInputQuestionStep(input: string, key: any) {
        if (key.return) {
            isAnswerGood() ? gotoGoodAnswerStep() : gotoBadAnswerStep();
        } else if (key.backspace || key.delete) {
            setUserInput(userInput.slice(0, userInput.length-1));
        } else {
            setUserInput(userInput + input);
        }
    };

    // Handle input during the good-answer and bad-answer steps
    function useInputAnswerStep(_input: string, key: any) {
        if (key.return) {
            hasMoreCards() ? gotoQuestionStep() : gotoEndStep();
        }
    };

    function gotoGoodAnswerStep() {
        if (card) {
            card.goodCnt++;
        }
        setStep("good-answer");
    };

    function gotoBadAnswerStep() {
        setStep("bad-answer");
    };

    function gotoQuestionStep() {
        setCard(getNextCard());
        setStep("question");
    };

    function gotoEndStep() {
        setStep("end");
    };

    function getNextCard(): Card | null {
		    const candidateCards = cards.filter(card => card.goodCnt < requiredGoodCnt);
		    if (!candidateCards.length) {
			      return null;
		    }
		    const idx = Math.floor(Math.random() * candidateCards.length);
        const card = candidateCards[idx];
        return card ? card : null;
	  };

    function hasMoreCards() {
        return !!cards.filter(card => card.goodCnt < requiredGoodCnt).length;
    };

    function isAnswerGood() {
        return userInput.toLowerCase() === card?.answer.toLowerCase();
    };

    const hint = step === "bad-answer" ? card?.answer : "";
    let userInputColor = "white";
    let userInputText = userInput;
    if (step === "question") {
        userInputText += chalk.inverse(" ");
    } else if (step === "bad-answer") {
        userInputColor = "red";
    } else if (step === "good-answer") {
        userInputColor = "green";
    }
    const question = card?.question;
    //const question = "super long question blah blah dsfkjdslk jfdskljf dklsjf ksdjfkdsjf ldsjflksdjf ljsdf kdsjflkjds lfjsdklf jdslk fjdlskj lksdjf lkdsjf klsdjf lkjsdlfkjdskfj akjkfj jsdflkjdskl fjdalkjf lkdajf lkadjfkljdalkf jdalkf jadlksjf lkdj lfkjdalkfjdalkfj ldakj flkadsjf lkadjf lkjda kfljdalkf jdklafj lkadjf lkdajf kljadslkfjdlk fjldk jdkl jflkdaj flkdasj flkjdf";

	  return <Box justifyContent="center" width={width} height={height}>
		    <Box justifyContent="center" flexBasis={60} minWidth={20} flexDirection="column">
			      <Box flexDirection="column" borderStyle="single">
				        <Box paddingX={1}>
					          <Text>{question}</Text>
				        </Box>
				        <Box paddingX={1} paddingTop={1} height={2}>
					          <Text color={userInputColor}>{userInputText}</Text>
				        </Box>
                <Box marginBottom={-1}><Text>dkjfdskfj</Text></Box>
			      </Box>

            <Box paddingX={2} height={1}>
                <Text color="green">{hint}</Text>
            </Box>
		    </Box>
	  </Box>
};

module.exports = App;
export default App;
