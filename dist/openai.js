"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const openai_1 = require("openai");
const configuration = new openai_1.Configuration({
    organization: "org-3ZTGqahovUrzkimRrAZgqpVo",
    apiKey: "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" // process.env.OPENAI_API_KEY,
});
const OpenAiAPI = new openai_1.OpenAIApi(configuration);
exports.default = OpenAiAPI;
//# sourceMappingURL=openai.js.map