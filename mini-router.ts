import { List, Object as TSObject, String, Union } from "ts-toolbelt";

type StringSliceHead<Type extends string> = String.Join<List.Remove<String.Split<Type>, 0, 0>>;

type IsVariable<Input> = Input extends string ? (List.Includes<String.Split<Input>, ":"> extends 1 ? StringSliceHead<Input> : false) : false;

type ExtractVariablesFromObject<Input extends Record<number, string>> = TSObject.ListOf<
  TSObject.Filter<
    {
      [Key in keyof Input]: IsVariable<Input[Key]>;
    },
    false
  >
>;
type ExtractVariables<Input> = Input extends string ? ExtractVariablesFromObject<List.ObjectOf<String.Split<Input, "/">>> : never;

type RecordOfString<Keys> = Union.Merge<Keys extends string ? Record<Keys, string> : {}>;
type ValuesOfObject<Obj> = {
  [K in keyof Obj]: Obj[K];
}[keyof Obj];
// type Record
type Params<Keys> = Keys extends List.List<any> ? RecordOfString<ValuesOfObject<List.ObjectOf<Keys>>> : {};

export type Route = string;
export type Routes<Inner extends string> = {
  [Key in Inner]: RequestHandler<Params<ExtractVariables<Key>>>;
};
const pathToRegex = (path: string) => {
  const regExp = new RegExp("^" + path.replace(/\//g, "\\/").replace(/:(\w+)/g, "(.+)") + "$");
  const props = Array.from(path.matchAll(/:(\w+)/g)).map((result) => result[1]);
  return { regExp, props };
};

const matchToRecord = (match: RegExpMatchArray, props: string[]) =>
  match.slice(1).reduce((result, prop, index) => {
    result[props[index]] = prop;
    return result;
  }, {} as Record<string, string>);

export const router = <Inner extends string>(
  routes: Routes<Inner>,
  {
    sortRoutes = true,
    fallback = (req) => {
      throw new Error(`No route handler for ${req.url}`);
    },
  }: { fallback?: RequestHandler; sortRoutes?: boolean } = {}
) => {
  const entries: [path: string, handler: RequestHandler<any>][] = Object.entries(routes);
  const regularExpressionEntries = entries.map(([path, handler]) => {
    return {
      path,
      handler,
      ...pathToRegex(path),
    };
  });
  sortRoutes && regularExpressionEntries.sort((a, b) => b.path.length - a.path.length);
  return (req: Request) => {
    let match: RegExpMatchArray | null;
    const entry = regularExpressionEntries.find((entry) => (match = req.url.match(entry.regExp)));
    if (!entry) return fallback(req, {});
    return entry.handler(req, matchToRecord(match!, entry.props));
  };
};

type RequestHandler<Params = {}, Result = any> = (req: Request, params: Params) => Result;

type HTTPMethods = "get" | "post" | "put" | "patch" | "delete";

export const methods =
  <Params>(
    methodHandlers: Partial<Record<HTTPMethods, RequestHandler<Params>>>,
    {
      fallback = (req) => {
        throw new Error(`No route handler for ${req.url}`);
      },
    }: { fallback?: RequestHandler } = {}
  ) =>
  (req: Request, params: Params) => {
    const handler = methodHandlers[req.method.toLowerCase() as HTTPMethods] ?? fallback;
    return handler(req, params);
  };
