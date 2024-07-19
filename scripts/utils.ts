
export function stripTags(string: string) {
  return string.replace(/{@(\w+)\s?(.*?)}/g, (_, _tag, content) => content)
}

