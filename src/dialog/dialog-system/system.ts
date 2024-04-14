export type Choice = {
  text: string
  effect?: string
}

export type Dialog = {
  id: string
  title?: string
  text: string
  choices: Array<Choice>
  functions: Array<string>
}

// "new Function()" is a valid constructor in JS but AsyncFunction is not.
// With this, we can create async functions from a string
export const AsyncFunction: AsyncFunctionConstructor = Object.getPrototypeOf(async function() { }).constructor;
export type AsyncFunctionConstructor = {
  new(...args: string[]): AsyncFunctionType<any[], any>;
  (...args: string[]): AsyncFunctionType<any[], any>;
}
export type AsyncFunctionType<Params extends any[] = any[], Return = void> = (...args: Params) => Promise<Return>

export async function parseStaticTemplateLiteral(
  templateLiteral: string,
  context: Object,
  safe = true,
): Promise<string> {
  try {
    let fn = new AsyncFunction(
      ...Object.keys(context),
      "return `" + templateLiteral + "`"
    );
    const result = fn(...Object.values(context));
    return result
  } catch (e) {
    if (safe) {
      console.log(e)
      return ''
    } else {
      throw e
    }
  }
}

export async function renderText(text: string, state: Record<string, any>, safe = true) {
  try {
    return parseStaticTemplateLiteral(text, state, safe);
  } catch (e) {
    if (safe) {
      // If the function fails, we log it and return an empty string
      // so it doesn't break the template
      console.error(e);
      console.error(text);
      return "";
    } else {
      throw e
    }
  }
}
