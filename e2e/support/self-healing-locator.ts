import { Page, Locator } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

export class SelfHealingLocator {
    private static readonly MODEL_DIR = path.join(__dirname, '..', 'models');
    private static readonly ATTRIBUTE_PRIORITY = [
        'data-test',
        'id',
        'name',
        'class',
        'placeholder',
        'title',
        'aria-label'
    ];

    constructor(private page: Page) {}

    async findElement(originalSelector: string, modelFile: string): Promise<Locator> {
        try {
            // First try with original selector
            const element = this.page.locator(originalSelector);
            await element.waitFor({ state: 'visible', timeout: 5000 });
            return element;
        } catch (error) {
            console.log(`\x1b[33m[Self-Healing] Original selector failed: ${originalSelector}\x1b[0m`);
            
            // Attempt to find alternative selector
            const newSelector = await this.findAlternativeSelector(originalSelector);
            if (newSelector) {
                console.log(`\x1b[32m[Self-Healing] Found alternative selector: ${newSelector}\x1b[0m`);
                
                // Update the model file
                await this.updateModelFile(modelFile, originalSelector, newSelector);
                
                return this.page.locator(newSelector);
            }
            
            throw new Error(`Unable to find alternative selector for: ${originalSelector}`);
        }
    }

    private async findAlternativeSelector(originalSelector: string): Promise<string | null> {
        // Try to find element using various strategies
        for (const attribute of SelfHealingLocator.ATTRIBUTE_PRIORITY) {
            try {
                // Use JavaScript evaluation to find element
                const element = await this.page.evaluateHandle(async ({ selector, attr }: { selector: string, attr: string }) => {
                    let el: Element | null;
                    try {
                        el = document.querySelector(selector);
                    } catch {
                        try {
                            el = document.evaluate(selector, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue as Element;
                        } catch {
                            return null;
                        }
                    }
                    if (!el) return null;

                    // Try to create unique selector
                    const attrValue = el.getAttribute(attr);
                    if (attrValue) {
                        return `[${attr}="${attrValue}"]`;
                    }
                    
                    // Try CSS path
                    const path = [];
                    let currentEl = el as Element;
                    while (currentEl && currentEl.nodeType === Node.ELEMENT_NODE) {
                        let selector = currentEl.nodeName.toLowerCase();
                        if (currentEl instanceof HTMLElement && currentEl.id) {
                            selector = '#' + currentEl.id;
                            path.unshift(selector);
                            break;
                        } else {
                            let sibling = currentEl;
                            let nth = 1;
                            while (sibling.previousElementSibling) {
                                sibling = sibling.previousElementSibling;
                                if (sibling.nodeName.toLowerCase() === selector) nth++;
                            }
                            if (nth > 1) selector += `:nth-of-type(${nth})`;
                        }
                        path.unshift(selector);
                        const parentNode = currentEl.parentNode;
                        if (parentNode && parentNode instanceof Element) {
                            currentEl = parentNode;
                        } else {
                            break;
                        }
                    }
                    return path.join(' > ');
                }, { selector: originalSelector, attr: attribute });

                const newSelector = await element.jsonValue();
                if (newSelector) {
                    // Verify the new selector works
                    const foundElement = this.page.locator(newSelector);
                    await foundElement.waitFor({ state: 'visible', timeout: 2000 });
                    return newSelector;
                }
            } catch (e) {
                continue;
            }
        }
        return null;
    }

    private async updateModelFile(modelFile: string, oldSelector: string, newSelector: string): Promise<void> {
        const filePath = path.join(SelfHealingLocator.MODEL_DIR, modelFile);
        if (!fs.existsSync(filePath)) return;

        let content = fs.readFileSync(filePath, 'utf8');
        const escapedOldSelector = oldSelector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(['"\`])${escapedOldSelector}\\1`, 'g');
        
        content = content.replace(regex, `'${newSelector}'`);
        fs.writeFileSync(filePath, content);
        
        console.log(`\x1b[32m[Self-Healing] Updated model file: ${modelFile}\x1b[0m`);
        console.log(`\x1b[32m[Self-Healing] Old selector: ${oldSelector}\x1b[0m`);
        console.log(`\x1b[32m[Self-Healing] New selector: ${newSelector}\x1b[0m`);
    }
}
