# lrn

Command-line tool for learning by repetition repetition. <br>

`lrn` doesn't support sophisticated spacing algorithms, schedules, categories, tags, styles etc. The final frontier between you and the thing you want to learn is removed. No last chance to procrastinate by tweaking knobs and whistles of the learning tool itself. You won't find refuge in "designing" your deck either; the input file format makes .csv look complicated. What's left is to learn, learn, and repeat.

## Install

```bash
$ npm install --global lrn
$ lrn
```

## CLI

```
  Usage
    $ lrn [OPTIONS] file.txt


  Options

    -m match | cards     Mode of learning. In the `match` mode you type in
                         answer to a question, which is then checked against
                         the correct answer. In the `cards` mode you flip
                         between question and the correct answer, and
                         decide yourself whether you knew it or not.

    -r N                 Required number of times a question must be
                         answered correctly. Default: 1.

    -s                   Show staus bar at the bottom of the screen.


  Keybindings

    C-s           Show/hide status bar. Hidden by default.
    C-c or ESC    Exit.

  Keybindings unique to `cards` mode:

    f             Flip the card.
    y             Accept the card as answered correctly.
    n             Accept the card as answered wrong.


  The format of the file is as follows:
    question1
    answer1

    question2
    answer2

```
