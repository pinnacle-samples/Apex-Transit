import { rcsClient } from './rcsClient';
import { Pinnacle } from 'rcs-js';
import { sendTypingIndicator } from './typing';

export class BaseAgent {
  protected readonly agentName: string =
    process.env.AGENT_NAME ?? process.env.PINNACLE_AGENT_ID!;
  protected readonly client = rcsClient;
  protected readonly TEST_MODE = process.env.TEST_MODE === 'true';

  protected showTyping(to: string): void {
    sendTypingIndicator(to);
  }

  /**
   * Send a simple text message. Caller is responsible for supplying any
   * quick replies — there is no implicit Main Menu / End Demo injected
   * here. If a method needs escape navigation, pass it explicitly.
   */
  async sendMessage(to: string, text: string, quickReplies: Pinnacle.RichButton[] = []) {
    return await this.client.messages.rcs.send({
      from: this.agentName,
      to,
      text,
      quickReplies,
    });
  }

  async sendButtonOnlyMessage(to: string) {
    return await this.client.messages.rcs.send({
      from: this.agentName,
      to,
      text: 'This agent does not process text messages. Please use the buttons provided to interact.',
      quickReplies: [
        {
          type: 'trigger',
          title: '🏠 Main Menu',
          payload: JSON.stringify({ action: 'showMainMenu' }),
        },
      ],
    });
  }

  async sendStrictFormatMessage(to: string, formatInstructions: string) {
    return await this.client.messages.rcs.send({
      from: this.agentName,
      to,
      text: formatInstructions,
      quickReplies: [
        {
          type: 'trigger',
          title: '🏠 Main Menu',
          payload: JSON.stringify({ action: 'showMainMenu' }),
        },
      ],
    });
  }
}
