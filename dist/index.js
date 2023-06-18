"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const openai_1 = __importDefault(require("./openai"));
const cors_1 = __importDefault(require("cors"));
const socket_io_1 = require("socket.io");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
    }
});
io.on('connection', () => console.log("connected"));
io.emit("hello", "hello back");
const port = 8080;
app.get('/', (_, res) => {
    res.status(200).send();
});
app.post('/api/chat', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { question } = req.body;
    try {
        const completion = yield openai_1.default.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'system', content: "You are a bot that returns only plain text for the user" }, { role: 'user', content: question }],
            stream: true,
        }, { responseType: 'stream' });
        const stream = completion.data;
        const chatgptResponse = { content: '' };
        stream.on('data', (chunk) => {
            var _a;
            const payloads = chunk.toString().split("\n\n");
            for (const payload of payloads) {
                if (payload.includes('[DONE]'))
                    return;
                if (payload.startsWith("data:")) {
                    const data = JSON.parse(payload.replace("data: ", ""));
                    try {
                        const chunk = (_a = data.choices[0].delta) === null || _a === void 0 ? void 0 : _a.content;
                        if (chunk) {
                            chatgptResponse.content += chunk;
                            io.emit('chat-gpt-res', { content: chatgptResponse.content });
                        }
                    }
                    catch (err) {
                        io.emit('resError', { error: err });
                    }
                }
            }
        });
        stream.on('end', () => {
            setTimeout(() => {
                console.log('\nStream done');
                res.send({ message: 'Stream done' });
            }, 10);
        });
        stream.on('error', (err) => {
            res.send(err);
        });
    }
    catch (err) {
        res.send(err);
    }
}));
server.listen(port, () => console.log(`Running on port ${port}`));
//# sourceMappingURL=index.js.map