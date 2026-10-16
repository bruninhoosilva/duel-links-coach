// The key under which a change is saved in the verdict library. Shared by the page and the server.
// A missing side (a removal has no added card, an addition has no removed card) is written as "-".
export const keyFor = (deck, removed, added) => `${deck}|${removed ?? '-'}|${added ?? '-'}`;
