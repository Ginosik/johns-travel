# Mobile Support

John's Travel is designed to reflow from a 320px-wide phone through tablet and desktop layouts.

## Support target

- Minimum supported viewport width: 320 CSS pixels
- Primary mobile browsers: current Android Chrome and iOS Safari
- Primary tablet browsers: current Chrome, Safari, and Edge
- Orientation: portrait and landscape
- Browser zoom and text resizing: layouts should remain readable without horizontal page scrolling

The current automated viewport audit runs in local headless Chrome. A real iOS Safari check is still required before the first public release because Chromium emulation cannot reproduce WebKit-specific behavior.

## Mobile behavior

- Feed rails collapse into a single-column feed.
- Story translations stack beneath the conversation on narrow screens.
- The translation header remains visible while its transcript scrolls.
- Conversation controls stay reachable above safe-area insets.
- Touch controls target a minimum size of 44 by 44 pixels.
- Route scroll positions are restored when visitors navigate back.
- Portrait and landscape changes do not remount the story or reset conversation state.
- Audio is requested only when a message is revealed or replayed, with loading, interaction-waiting, and error feedback.
- Feed cover images load lazily; avatars and covers use mobile-sized assets.

## Viewport audit

Run the app and Chrome with remote debugging, then execute:

```sh
node scripts/mobile-smoke.mjs
```

The audit covers the feed, both published stories, and the trip map at 320, 360, 390, 768, and 1024 pixels, plus phone landscape and a reduced-height keyboard simulation. It fails when a page is wider than its viewport and reports undersized interactive controls.

## Release-device checklist

- Test one physical or hosted iPhone in Safari.
- Test one physical or hosted Android phone in Chrome.
- Confirm audio playback after a direct tap and after an autoplay restriction.
- Open and close the translation panel midway through a conversation.
- Rotate while a conversation and translation panel are open.
- Focus the feed search input with the on-screen keyboard visible.
- Navigate feed → story → back and confirm the feed position is restored.
