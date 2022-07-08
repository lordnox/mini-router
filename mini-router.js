"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.methods = exports.router = void 0;
const pathToRegex = (path) => {
    const regExp = new RegExp("^" + path.replace(/\//g, "\\/").replace(/:(\w+)/g, "(.+)") + "$");
    const props = Array.from(path.matchAll(/:(\w+)/g)).map((result) => result[1]);
    return { regExp, props };
};
const matchToRecord = (match, props) => match.slice(1).reduce((result, prop, index) => {
    result[props[index]] = prop;
    return result;
}, {});
const router = (routes, { sortRoutes = true, fallback = (req) => {
    throw new Error(`No route handler for ${req.url}`);
}, } = {}) => {
    const entries = Object.entries(routes);
    const regularExpressionEntries = entries.map(([path, handler]) => {
        return Object.assign({ path,
            handler }, pathToRegex(path));
    });
    sortRoutes && regularExpressionEntries.sort((a, b) => b.path.length - a.path.length);
    return (req) => {
        let match;
        const entry = regularExpressionEntries.find((entry) => (match = req.url.match(entry.regExp)));
        if (!entry)
            return fallback(req, {});
        return entry.handler(req, matchToRecord(match, entry.props));
    };
};
exports.router = router;
const methods = (methodHandlers, { fallback = (req) => {
    throw new Error(`No route handler for ${req.url}`);
}, } = {}) => (req, params) => {
    var _a;
    const handler = (_a = methodHandlers[req.method.toLowerCase()]) !== null && _a !== void 0 ? _a : fallback;
    return handler(req, params);
};
exports.methods = methods;
