import { Token, marked } from 'marked'
import { opendir, watch } from 'node:fs/promises'
import { Dialog, renderText } from '~/dialog/dialog-system/system'
import { decode } from 'he'
import { object, string, array, optional, uuid, minLength, union, parse, safeParse, ValiError, flatten } from 'valibot'
import { parseArgs } from 'node:util'

const DialogSchema = object({
  title: optional(string([minLength(1, 'Title must not be empty')])),
  id: string([minLength(1, 'ID should never be empty')]),
  text: string(),
  choices: array(object({
    text: string([minLength(1, 'A choice text cannot be empty')]),
    effect: optional(string([minLength(1, "An effect should not be empty")]))
  })),
  functions: array(string([minLength(1, "A function should not be empty")]))
}, 'Dialog must be an object')

const SceneSchema = array(DialogSchema, 'Scene must be an array of dialogs')

marked.use({
  breaks: true,
  renderer: {
    code: (code, infostring, escaped) => {
      console.debug('code, infostring, escaped', code, infostring, escaped);
      return code
    },
    codespan: (text) => {
      return `\`${text}\``
    }

  },
  extensions: [
    {
      name: 'choices',
      level: 'block',
      start(src) {
        return src.match(/^-/m)?.index
      },
      tokenizer(src, tokens) {
        const rule = /^- (.+)((\r?\n.+)*)/g;
        const match = rule.exec(src);
        if (match) {
          const token = {
            type: 'choices',
            raw: match[0],
            items: []
          };
          this.lexer.inline(token.raw, token.items)
          return token
        }
      },
    },
    {
      name: 'choice',
      level: 'inline',
      start(src) {
        return src.match(/§/)?.index
      },
      tokenizer(src, tokens) {
        const rule = /^- (([^\n]*?)§(.*?)§|([^\n]*))/gms;
        const match = rule.exec(src);
        if (match) {
          return {
            type: 'choice',
            text: match[2] || match[4],
            raw: match[0],
            effect: match[3]
          };
        }
      },
    },
    {
      name: 'function',
      level: 'block',
      start(src) {
        return src.match(/^§/m)?.index
      },
      tokenizer(src, tokens) {
        const rule = /^§(.*?)§/s;
        const match = rule.exec(src);
        if (match) {
          return {
            type: 'function',
            text: '',
            raw: match[0],
            function: match[1]
          };
        }
      },
    },
    {
      name: 'id',
      level: 'block',
      start(src) {
        return src.match(/#/)?.index
      },
      tokenizer(src, tokens) {
        const rule = /^#([^\s|#]+)/;
        const match = rule.exec(src);
        if (match) {
          return {
            type: 'id',
            text: '',
            raw: match[0],
            id: match[1]
          };
        }
      },
    },
  ]
})

async function parseMarkdown(markdown: string) {
  const lexed = marked.lexer(markdown)
  // console.debug('lexed', lexed);

  const getEmptyDialog = () => ({ id: crypto.randomUUID(), text: '', choices: [], functions: [] }) satisfies Dialog

  let dialogs: Dialog[] = []
  let currentDialog: Dialog = getEmptyDialog()

  for (const token of lexed) {
    switch (token.type) {
      case 'hr':
        dialogs.push({
          title: dialogs.at(-1)?.title, // keep the last title if it exists
          ...currentDialog,
          text: decode(currentDialog.text).replaceAll('\n', '')
        })
        currentDialog = getEmptyDialog()
        break;

      case 'heading':
        currentDialog.title = token.text
        break;

      case 'choices':
        for (const choice of token.items.filter((item: Token) => item.type == 'choice')) {
          currentDialog.choices.push({
            text: choice.text.trim(),
            effect: choice.effect
          })
        }
        break;

      case 'function':
        currentDialog.functions.push(token.function)
        break;

      case 'id':
        currentDialog.id = token.id
        break;

      case 'paragraph':
      case 'blockquote':
        currentDialog.text += marked.parser([token]) || ''
        break;
    }
  }

  dialogs.push({
    title: dialogs.at(-1)?.title, // keep the last title if it exists
    ...currentDialog,
    text: decode(currentDialog.text).replaceAll('\n', '')
  })

  return parse(SceneSchema, dialogs);
}

const sourceDir = './assets/dialogs'
const targetDir = './public/scenes'

async function assertValidity(scene: Dialog[]) {
  for (const dialog of scene) {
    await renderText(dialog.text, { state: {}, from: () => true }, false)
  }
}

async function parseFile(sourcePath: string, targetPath: string) {
  console.log("Parsing", sourcePath)
  const text = await Bun.file(sourcePath).text()

  try {
    const scene = await parseMarkdown(text)
    await assertValidity(scene)
    Bun.write(targetPath, JSON.stringify(scene, null, 2))
    console.log("Parsed", targetPath)
  } catch (e) {
    if (e instanceof ValiError) {
      console.error('Error in', sourcePath, ':\n', JSON.stringify(flatten(e), null, 2))
    } else if (e instanceof SyntaxError) {
      console.error('Error in', sourcePath, ':\n', e.message)
    } else {
      throw e
    }
  }
}

async function parseAllDirectory(sourceDir: string, targetDir: string) {
  for await (const dirent of await opendir(sourceDir)) {
    if (!dirent.name.endsWith('.md')) {
      continue;
    }

    await parseFile(`${sourceDir}/${dirent.name}`, `${targetDir}/${dirent.name.replace('.md', '.json')}`)
  }

}

const { values } = parseArgs({
  args: Bun.argv,
  options: {
    watch: {
      type: 'boolean',
    },
    deamon: {
      type: 'boolean',
    },
  },
  strict: true,
  allowPositionals: true,
});

if (values.watch) {
  console.log("Starting parser in watch mode")
  const watcher = watch(sourceDir);
  for await (const event of watcher) {
    if (event.eventType == 'rename' && event.filename?.endsWith(".md")) {
      await parseFile(`${sourceDir}/${event.filename}`, `${targetDir}/${event.filename.replace('.md', '.json')}`)
    }
  }
} else {
  await parseAllDirectory(sourceDir, targetDir)
}


