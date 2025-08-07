"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const axios_1 = __importDefault(require("axios"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand('rallyTestcaseGenerator.start', () => __awaiter(this, void 0, void 0, function* () {
        const panel = vscode.window.createWebviewPanel('rallyTestcaseGenerator', 'Rally Testcase Generator', vscode.ViewColumn.One, {
            enableScripts: true
        });
        const htmlPath = path.join(context.extensionPath, 'webview-ui', 'index.html');
        panel.webview.html = fs.readFileSync(htmlPath, 'utf8');
        panel.webview.onDidReceiveMessage((message) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            if (message.command === 'fetchDescription') {
                try {
                    const rallyRes = yield axios_1.default.get(`https://rally1.rallydev.com/slm/webservice/v2.0/${message.type}/${message.id}?fetch=Description`, {
                        headers: {
                            'ZSESSIONID': message.apiKey,
                            'Content-Type': 'application/json'
                        }
                    });
                    const description = (_b = (_a = rallyRes.data) === null || _a === void 0 ? void 0 : _a[`${message.type}`]) === null || _b === void 0 ? void 0 : _b.Description;
                    panel.webview.postMessage({ command: 'showDescription', description });
                }
                catch (error) {
                    vscode.window.showErrorMessage("Failed to fetch from Rally");
                }
            }
            else if (message.command === 'generateTestcases') {
                try {
                    const gptRes = yield axios_1.default.post('https://api.openai.com/v1/chat/completions', {
                        model: 'gpt-4',
                        messages: [
                            {
                                role: 'user',
                                content: `Write Gherkin test cases for the following description:

${message.description}`
                            }
                        ]
                    }, {
                        headers: {
                            'Authorization': `Bearer ${message.gptKey}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    const gherkin = gptRes.data.choices[0].message.content;
                    panel.webview.postMessage({ command: 'showTestcases', gherkin });
                }
                catch (err) {
                    vscode.window.showErrorMessage("Failed to generate test cases from ChatGPT");
                }
            }
        }));
    })));
}
exports.activate = activate;
