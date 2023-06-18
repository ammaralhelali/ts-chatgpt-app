import { Configuration, OpenAIApi } from "openai";
const configuration = new Configuration({
    organization: "org-3ZTGqahovUrzkimRrAZgqpVo",
    apiKey: "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" // process.env.OPENAI_API_KEY,
});
const OpenAiAPI = new OpenAIApi(configuration);
export default OpenAiAPI