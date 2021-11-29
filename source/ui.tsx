import React, {FC} from 'react';
import {Text, Box, useInput, useApp} from 'ink';
//import { Card } from "./cli";
import { useRecoilState } from "recoil";
import chalk from "chalk";
import { cardsState, userInputState, Card } from "./state";

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

   /* const App: FC<{cards2: Card[]}> = ({cards2 = []}) => { */
const App: FC<{}> = () => {
	  const {exit} = useApp();
	  /* const [cards, setCards] = useState(_cards); */

	  //const [card] = useState(cards[0] as Card);
	  /* const [input, setInput] = useState(""); */
	  //const [text, setText] = useState("");
    const [userInput, setUserInput] = useRecoilState(userInputState);
    const [cards] = useRecoilState(cardsState);

	  /* const [progress, setProgress] = useState({cardCnt: cards.length, answeredCnt: 0}); */

	  useInput((input, key) => {
		    if (input === 'q') {
			      exit();
		    }

		    if (key.leftArrow) {
		    } else if (key.return) {
            setUserInput("");
            return;
		    } else if (key.delete) {
            setUserInput(userInput.slice(0, userInput.length-1));
            return;
        }

		    setUserInput(userInput + input);
	  });

	  return <Box justifyContent="center">
		    <Box flexBasis="50%" flexDirection="column" borderStyle="single">
			      <Box paddingX={1}>
				        <Text>{(cards[0] as Card).question}</Text>
			      </Box>
			      <Box paddingX={1} paddingTop={1}>
				        <Text>{userInput}{chalk.inverse(" ")}</Text>
			      </Box>
		    </Box>
	  </Box>
};

module.exports = App;
export default App;
