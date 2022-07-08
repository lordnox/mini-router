/// <reference types="bun-types" />
import { List, Object as TSObject, String, Union } from "ts-toolbelt";
declare type StringSliceHead<Type extends string> = String.Join<List.Remove<String.Split<Type>, 0, 0>>;
declare type IsVariable<Input> = Input extends string ? (List.Includes<String.Split<Input>, ":"> extends 1 ? StringSliceHead<Input> : false) : false;
declare type ExtractVariablesFromObject<Input extends Record<number, string>> = TSObject.ListOf<TSObject.Filter<{
    [Key in keyof Input]: IsVariable<Input[Key]>;
}, false>>;
declare type ExtractVariables<Input> = Input extends string ? ExtractVariablesFromObject<List.ObjectOf<String.Split<Input, "/">>> : never;
declare type RecordOfString<Keys> = Union.Merge<Keys extends string ? Record<Keys, string> : {}>;
declare type ValuesOfObject<Obj> = {
    [K in keyof Obj]: Obj[K];
}[keyof Obj];
declare type Params<Keys> = Keys extends List.List<any> ? RecordOfString<ValuesOfObject<List.ObjectOf<Keys>>> : {};
export declare type Route = string;
export declare type Routes<Inner extends string> = {
    [Key in Inner]: RequestHandler<Params<ExtractVariables<Key>>>;
};
export declare const router: <Inner extends string>(routes: Routes<Inner>, { sortRoutes, fallback, }?: {
    fallback?: RequestHandler<{}, any> | undefined;
    sortRoutes?: boolean | undefined;
}) => (req: Request) => any;
declare type RequestHandler<Params = {}, Result = any> = (req: Request, params: Params) => Result;
declare type HTTPMethods = "get" | "post" | "put" | "patch" | "delete";
export declare const methods: <Params_1>(methodHandlers: Partial<Record<HTTPMethods, RequestHandler<Params_1, any>>>, { fallback, }?: {
    fallback?: RequestHandler<{}, any> | undefined;
}) => (req: Request, params: Params_1) => any;
export {};
