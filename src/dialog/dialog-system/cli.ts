import { createInterface } from 'node:readline/promises'
import { AsyncFunction, Dialog, renderText } from './system'

async function cliRenderer(scene: Array<Dialog>) {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  let state: Record<string, any> = {
    text: {
      red: () => console.log("\x1b[31m"),
      blue: () => console.log("\x1b[34m"),
      reset: () => console.log("\x1b[0m")
    }
  }

  async function executeDialog(dialog: Dialog): Promise<string | null> {
    let nextDialogId = null

    for (const func of dialog.functions) {
      let fn = new AsyncFunction(
        'createVar',
        ...Object.keys(state),
        func,
      )

      await fn((obj: Record<string, any>) => { state.vars = { ...state.vars, ...obj } }, ...Object.values(state));
    }

    if (dialog.title) {
      console.log(`# ${await renderText(dialog.title, state)}\n`)
    }

    console.log(await renderText(dialog.text, state))

    const choices = (await Promise.all(dialog.choices.map(async (choice, index) => {
      const text = await renderText(choice.text, state)
      if (text) {
        return `${index + 1}. ${text}`;
      } else {
        return null
      }
    }))).filter(Boolean).join('\n') + '\n\n'

    const choice = await rl.question(choices)

    if (choice && dialog.choices.at(Number(choice) - 1)?.effect != null) {
      let fn = new AsyncFunction(
        'goto',
        ...Object.keys(state),
        dialog.choices.at(Number(choice) - 1)!.effect
      );
      await fn((id: string) => { nextDialogId = id }, ...Object.values(state));
    }

    console.log("\n---\n")

    return nextDialogId
  }

  if (scene.length <= 0) {
    return
  }

  let id = scene[0].id
  let dialogIndex = scene.findIndex(dialog => dialog.id == id)
  while (scene[dialogIndex] != null) {
    const nextDialogId = await executeDialog(scene[dialogIndex])

    if (nextDialogId) {
      dialogIndex = scene.findIndex(dialog => dialog.id == nextDialogId)
    } else {
      dialogIndex++
    }
  }

  console.clear()
}

const testDialog = await Bun.file('./assets/dialogs/test.json').json()
await cliRenderer(testDialog)
process.exit()

