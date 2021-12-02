////////////////////////////////////////////////////////////////////////////////

screen.key("return", () => {
    if (step === "question") {
        processAnswer();
    } else if (step === "bad-answer" || step === "good-answer") {
        nextCard();
    }
});

function processAnswer() {
    if (answer.toLowerCase() === card.answer.toLowerCase()) {
        step = "good-answer";
        card.goodCnt++;
        inputElement.style.fg = "green";
    } else {
        step = "bad-answer";
        inputElement.style.fg = "red";
    }
    screen.render();
}

function processAnswer() {
    gotoGoodAnswer() || gotoBadAnswer();
}

function gotoGoodAnswer() {
    if (answer.toLowerCase() !== card.answer.toLowerCase()) {
        return false;
    }
    step = "good-answer";
    //HERE
}

function nextCard() {
    const candidateCards = cards.filter(card => card.goodCnt < requiredGoodCnt);

    if (candidateCards.length) {
        card = candidateCards[Math.floor(Math.random() * candidateCards.length)];
    } else {
        step = "end"
    }
}

////////////////////////////////////////////////////////////////////////////////

function processReturn() {
    if (step === "question") {
        if (isAnswerCorrect(answer, card.answer)) {
            stepGoodAnswer();
        } else {
            stepBadAnswer();
        }
    } else if (step === "good-answer" || step === "bad-answer") {
        stepQuestion();
    }
}

////////////////////////////////////////////////////////////////////////////////

function stepQuestion() {
    if (step !== "question") {
        return false;
    }

    if (goodAnswer) {
        gotoGoodAnswer();
    } else {
        gotoBadAnswer();
    }
}

////////////////////////////////////////////////////////////////////////////////

function nextStep() {
    if (step === "question") {
        if (answer.toLowerCase() === card.answer.toLowerCase()) {
            step = "good-answer";
        } else {
            step = "bad-answer";
        }
    } else if (step === "good-answer" || step === "bad-answer") {
        step = "question";
    }
}

////////////////////////////////////////////////////////////////////////////////

function nextStep() {
    if (step === "question") {
        processAnswer();
    } else if (step === "good-answer" || step === "bad-answer") {
        nextCard();
    }
}
