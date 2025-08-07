import * as vscode from 'vscode';
import axios from 'axios';
import * as path from 'path';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('rallyTestcaseGenerator.start', async () => {
      const panel = vscode.window.createWebviewPanel(
        'rallyTestcaseGenerator',
        'Rally Testcase Generator',
        vscode.ViewColumn.One,
        {
          enableScripts: true
        }
      );

      const htmlPath = path.join(context.extensionPath, 'webview-ui', 'index.html');
      panel.webview.html = fs.readFileSync(htmlPath, 'utf8');

      panel.webview.onDidReceiveMessage(async message => {
        if (message.command === 'fetchDescription') {
          try {
            const rallyRes = await axios.get(
              `https://rally1.rallydev.com/slm/webservice/v2.0/${message.type}/${message.id}?fetch=Description`,
              {
                headers: {
                  'ZSESSIONID': message.apiKey,
                  'Content-Type': 'application/json'
                }
              }
            );
            const description = rallyRes.data?.[`${message.type}`]?.Description;
            panel.webview.postMessage({ command: 'showDescription', description });
          } catch (error) {
            vscode.window.showErrorMessage("Failed to fetch from Rally");
          }
        } else if (message.command === 'generateTestcases') {
          try {
            const gptRes = await axios.post(
              'https://api.openai.com/v1/chat/completions',
              {
                model: 'gpt-4',
                messages: [
                  {
                    role: 'user',
                    content: `Write Gherkin test cases for the following description:

${message.description}`
                  }
                ]
              },
              {
                headers: {
                  'Authorization': `Bearer ${message.gptKey}`,
                  'Content-Type': 'application/json'
                }
              }
            );
            const gherkin = gptRes.data.choices[0].message.content;
            panel.webview.postMessage({ command: 'showTestcases', gherkin });
          } catch (err) {
            vscode.window.showErrorMessage("Failed to generate test cases from ChatGPT");
          }
        }
      });
    })
  );
}