import { Token, marked } from 'marked'
import { opendir } from 'node:fs/promises'
import { Dialog } from '~/dialog/dialog-system/system'
import { decode } from 'he'

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
    if (['space'].includes(token.type)) {
      continue
    }

    if (token.type == 'hr') {
      dialogs.push({
        title: dialogs.at(-1)?.title, // keep the last title if it exists
        ...currentDialog,
        text: decode(currentDialog.text).replaceAll('\n', '')
      })
      currentDialog = getEmptyDialog()
    } else if (token.type == 'heading') {
      currentDialog.title = token.text
    } else if (token.type == 'choices') {
      for (const choice of token.items.filter((item: Token) => item.type == 'choice')) {
        currentDialog.choices.push({
          text: choice.text.trim(),
          effect: choice.effect
        })
      }
    } else if (token.type == 'function') {
      currentDialog.functions.push(token.function)
    } else if (token.type == 'id') {
      currentDialog.id = token.id
    } else if (['paragraph', 'blockquote'].includes(token.type)) {
      currentDialog.text += marked.parser([token]) || ''
    }
  }

  dialogs.push({
    title: dialogs.at(-1)?.title, // keep the last title if it exists
    ...currentDialog,
    text: decode(currentDialog.text).replaceAll('\n', '')
  })

  return dialogs;
}


for await (const dirent of await opendir('./assets/dialogs')) {
  if (!dirent.name.endsWith('.md')) {
    continue;
  }

  console.log("Parsing", ('./assets/dialogs/' + dirent.name))
  const text = await Bun.file('./assets/dialogs/' + dirent.name).text()
  const scene = await parseMarkdown(text)
  Bun.write('./public/scenes/' + dirent.name.replace('.md', '.json'), JSON.stringify(scene, null, 2))
  console.log("Parsed", './public/scenes/' + dirent.name.replace('.md', '.json'))
}

