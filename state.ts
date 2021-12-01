class State {
    submitAnswer(answer: string);
    nextCard();

    answerCard(answer);

    
}

class State {
    step: "question" | "bad-answer" | "good-answer" | "end";
    card: Card;

    input(key);
}
