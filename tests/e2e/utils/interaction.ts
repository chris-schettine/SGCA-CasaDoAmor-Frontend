import type { Page, Locator } from '@playwright/test';

/**
 * Try several strategies to select an option for combobox/select-like controls.
 * Strategies (in order):
 * - Click combobox and type into inner input if present
 * - Look for overlayed listbox/menu and click matching option
 * - Global option/text click
 * - Keyboard navigation
 * - Fill input
 * - Click labeled control and repeat overlay search
 * - DOM-set value (last resort)
 */
export async function selectByLabel(page: Page, label: RegExp | string, optionText: RegExp | string) {
	const labelFilter = { name: label as string | RegExp };
	const labelStr = typeof label === 'string' ? label : (label as RegExp).source;
	const optionStr = typeof optionText === 'string' ? optionText : (optionText as RegExp).source;

	// Helper to click the first matching option inside a listbox overlay
	const clickInListbox = async (): Promise<boolean> => {
		try {
			const listbox: Locator = page.getByRole('listbox');
			if (await listbox.count() === 0) return false;
			const firstList = listbox.first();
			const opt = firstList.getByRole('option', { name: optionText });
			if (await opt.count() > 0) {
				await opt.first().click();
				return true;
			}
			const optText = firstList.getByText(optionText, { exact: false });
			if (await optText.count() > 0) {
				await optText.first().click();
				return true;
			}
		} catch {
			// ignore and continue
		}
		return false;
	};

	// 1) If there's a combobox, try interacting with it first
	const combobox: Locator = page.getByRole('combobox', labelFilter);
	if (await combobox.count() > 0) {
		await combobox.first().click();

		// a) type into inner input if present
		try {
			const innerInput: Locator = combobox.first().locator('input, textarea, [contenteditable="true"]');
			if (await innerInput.count() > 0 && optionStr.length > 0) {
				await innerInput.first().fill(optionStr);
				await innerInput.first().press('Enter');
				return;
			}
		} catch {
			// ignore
		}

		// b) try overlay listbox
		if (await clickInListbox()) return;

		// c) try global role=option or text clicks
		try {
			const globalOpt: Locator = page.getByRole('option', { name: optionText });
			if (await globalOpt.count() > 0) {
				await globalOpt.first().click();
				return;
			}
			const globalText: Locator = page.getByText(optionText, { exact: false }).first();
			if (await globalText.count() > 0) {
				try {
					await globalText.click();
				} catch {
					await globalText.click({ force: true });
				}
				return;
			}
		} catch {
			// continue
		}

		// d) keyboard attempt
		try {
			if (optionStr.length > 0) {
				await combobox.first().press('ArrowDown');
				await page.keyboard.type(optionStr, { delay: 30 });
				await page.keyboard.press('Enter');
				return;
			}
		} catch {
			// ignore
		}

		// e) try filling combobox directly
		try {
			await combobox.first().fill(optionStr);
			return;
		} catch {
			// continue
		}
	}

	// 2) Try a labeled control (non-combobox)
	const labelled: Locator = page.getByLabel(label).first();
	if (await labelled.count() > 0) {
		try {
			const tag = await labelled.evaluate((el: Element) => el.tagName);
			if (tag === 'INPUT' || tag === 'TEXTAREA') {
				await labelled.fill(optionStr);
				return;
			}
		} catch {
			// ignore
		}

		try {
			await labelled.click();
			if (await clickInListbox()) return;
			const opt2: Locator = page.getByRole('option', { name: optionText });
			if (await opt2.count() > 0) {
				await opt2.first().click();
				return;
			}
			const text2: Locator = page.getByText(optionText, { exact: false }).first();
			if (await text2.count() > 0) {
				await text2.click();
				return;
			}
		} catch {
			// continue
		}
	}

	// 3) Generic text/button click
	try {
		const anyElem: Locator = page.getByText(optionText, { exact: false }).first();
		if (await anyElem.count() > 0) {
			try {
				await anyElem.click();
			} catch {
				await anyElem.click({ force: true });
			}
			return;
		}
	} catch {
		// ignore
	}

	// 4) DOM-set value as last resort
	try {
		const setResult = await page.evaluate(({ labelText, value }) => {
			function findLabelNode(text: string) {
				const candidates = Array.from(document.querySelectorAll('label, div, span, p'));
				return candidates.find(el => el.textContent && el.textContent.trim().includes(text));
			}
			const labelNode = findLabelNode(labelText);
			if (!labelNode) return false;
			const container = labelNode.closest('div') || labelNode.parentElement;
			if (!container) return false;
			const input = container.querySelector('input, textarea, select') as HTMLInputElement | null;
			if (input) {
				try { input.focus(); } catch { /* ignore focus errors */ }
				input.value = value;
				input.dispatchEvent(new Event('input', { bubbles: true }));
				input.dispatchEvent(new Event('change', { bubbles: true }));
				return true;
			}
			const nextInput = labelNode.parentElement?.querySelector('input, textarea, select') as HTMLInputElement | null || document.querySelector('input, textarea, select') as HTMLInputElement | null;
			if (nextInput) {
				try { nextInput.focus(); } catch { /* ignore focus errors */ }
				nextInput.value = value;
				nextInput.dispatchEvent(new Event('input', { bubbles: true }));
				nextInput.dispatchEvent(new Event('change', { bubbles: true }));
				return true;
			}
			return false;
		}, { labelText: labelStr, value: optionStr });
		if (setResult) return;
	} catch {
		// ignore
	}

	// 5) Coordinate fallback: try clicking below combobox to hit overlay
	try {
		if (await combobox.count() > 0) {
			const box = await combobox.first().boundingBox();
			if (box) {
				await page.mouse.click(box.x + Math.min(20, box.width / 2), box.y + box.height + 24);
				await page.waitForTimeout(150);
				const optAfter: Locator = page.getByRole('option', { name: optionText });
				if (await optAfter.count() > 0) {
					await optAfter.first().click();
					return;
				}
				const textAfter: Locator = page.getByText(optionText, { exact: false }).first();
				if (await textAfter.count() > 0) {
					try { await textAfter.click(); } catch { await textAfter.click({ force: true }); }
					return;
				}
			}
		}
	} catch {
		// ignore
	}

	throw new Error(`selectByLabel: could not select ${String(optionText)} for ${String(label)}`);
}


