# Dialogs

The dialog system is loosely based on ink.

Next is an example of how the dialog work (each full line separator denotes a new dialog screen)

---

One line of dialog.
Another line of dialog.
It's just **markdown** with *emphasis*.
When there's nothing else, a button appears with `Continue` written on it to go to the next piece of text

---

This is another piece of dialog with variable.
The NPC name is ${npc.name}.
Javascript will parse this text as a template string and insert values contained in a "bag" of values.

You can do anything you could do with template string here such as conditionals. ${npc.mood == 'happy' ? "Great isn't it ?" : "Cool right ?"}

---

This is the next piece of dialog, this time with a choice.
Without anything else, choices just go to the next piece of dialog and only gives a fake feeling of agency

- This is a choice
- This is another choice

---

#about-titles

Sections can have titles and choices can lead to other titles. The flow of dialog is always forward so you can do loop by forcing the player to go to the same title.

Titles must be in a single "word" an be unique inside a dialog.

- Continue to the next piece of dialog
- Skip to conditions #about-conditions
- Replay this dialog #about-titles

---

Choices can be appended with functions to make theme change the state of the game

- Nod in agreement
- Punch yourself in the face §<() => { player.hp -= 2 }>§

---

#about-conditions

Choices can only appear when conditions are true using simple template strings. If a choice line is empty, the choice is skipped

- This choice always appear
- ${player.hp < 0 ? "Go back to life" : ""} §<() = { player.hp = 10 }>§
- This choice appears but the next won't
- 

---

${(() => { setBackground('market'); setPortrait('thief') })}

This piece of dialog has custom values to setup the scene.
