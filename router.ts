import { Router, Request, Response } from 'express';
import { rcsClient } from './lib/rcsClient';
import { handleButtonClick, handleTextMessage, handleLocation } from './handlers';
import { sendTypingIndicator } from './lib/typing';

const apexTransitRouter = Router();

apexTransitRouter.post('/', async (req: Request, res: Response) => {
  try {
    const messageEvent = await rcsClient.messages.process(req);
    if (messageEvent.type !== 'MESSAGE.RECEIVED') {
      console.error('[Apex Transit]: User event received', messageEvent);
      return res.status(200).json({ message: 'User event received' });
    }
    const message = messageEvent.message;
    const from = messageEvent.conversation.from;

    // Handle button clicks
    if (message.type === 'RCS_BUTTON_DATA' && typeof message.button.raw === 'object') {
      // Handle location request button
      if (message.button.raw.type === 'requestUserLocation') {
        return res.status(200).json({ message: 'Share Location button clicked' });
      }

      // Handle trigger buttons
      if (message.button.raw.type === 'trigger') {
        sendTypingIndicator(from);
        return handleButtonClick(from, message.button.raw.payload ?? '', res);
      }
    }

    // Handle location sharing
    if (message.type === 'RCS_LOCATION_DATA') {
      sendTypingIndicator(from);
      const { latitude, longitude } = message.data;
      return handleLocation(from, latitude, longitude, res);
    }

    // Handle text messages
    if (message.type === 'RCS_TEXT') {
      sendTypingIndicator(from);
      return handleTextMessage(from, message.text, res);
    }

    // Unknown message type
    console.error('[Apex Transit]: Unknown message type', message);
    return res.status(400).json({
      error: 'Unknown message type',
      received: message,
    });
  } catch (error) {
    console.error('[Apex Transit]: Internal server error', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default apexTransitRouter;
