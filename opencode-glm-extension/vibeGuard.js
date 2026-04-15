/**
 * VibeGuard - Safety middleware for LLM prompts in OpenCode
 * Replaces sensitive API keys and secrets with VibeGuard placeholders 
 * to prevent leaking sensitive information to external LLM providers.
 */

const SECRET_PATTERNS = [
  /(sk-[a-zA-Z0-9]{32,})/g, // Generic secret keys
  /(sk-or-v1-[a-zA-Z0-9]{64,})/g, // OpenRouter keys
  /(AIzaSy[a-zA-Z0-9_-]{33})/g, // Google API keys
];

class VibeGuard {
  constructor() {
    this.vault = new Map();
    this.counter = 0;
  }

  /**
   * Masks sensitive information in a string before sending to LLM.
   */
  mask(text) {
    if (!text) return text;
    let maskedText = text;

    for (const pattern of SECRET_PATTERNS) {
      maskedText = maskedText.replace(pattern, (match) => {
        const tokenId = `<VIBEGUARD_REDACTED_KEY_${++this.counter}>`;
        this.vault.set(tokenId, match);
        return tokenId;
      });
    }

    return maskedText;
  }

  /**
   * Unmasks the VibeGuard placeholders in the LLM response back to real keys if necessary,
   * though typically LLM responses shouldn't output keys anyway, this is for file editing.
   */
  unmask(text) {
    if (!text) return text;
    let unmaskedText = text;

    for (const [tokenId, secret] of this.vault.entries()) {
      // Create a regex to replace all instances of the token placeholder globally
      const regex = new RegExp(tokenId, 'g');
      unmaskedText = unmaskedText.replace(regex, secret);
    }
    
    return unmaskedText;
  }

  /**
   * Reset the vault (useful per-session or per-request).
   */
  clear() {
    this.vault.clear();
    this.counter = 0;
  }
}

module.exports = new VibeGuard();
