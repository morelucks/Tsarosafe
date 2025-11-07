module.exports = [
"[turbopack-node]/transforms/postcss.ts { CONFIG => \"[project]/tsarosafe/ui/postcss.config.mjs [postcss] (ecmascript)\" } [postcss] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "build/chunks/9a08a_2dc6dfc2._.js",
  "build/chunks/[root-of-the-server]__60b404c7._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[turbopack-node]/transforms/postcss.ts { CONFIG => \"[project]/tsarosafe/ui/postcss.config.mjs [postcss] (ecmascript)\" } [postcss] (ecmascript)");
    });
});
}),
];