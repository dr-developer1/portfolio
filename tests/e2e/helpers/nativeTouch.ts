import type { Page } from '@playwright/test';

type TouchType = 'touchStart' | 'touchMove' | 'touchEnd' | 'touchCancel';
type SendTouch = (type: TouchType, x?: number, y?: number) => Promise<void>;

export async function nativeTouch(page: Page, browserName: string): Promise<SendTouch> {
  if (browserName === 'chromium') {
    const session = await page.context().newCDPSession(page);
    return async (type, x = 0, y = 0) => {
      await session.send('Input.dispatchTouchEvent', {
        type,
        touchPoints: type === 'touchEnd' || type === 'touchCancel' ? [] : [{ x, y, id: 1 }],
      });
    };
  }
  if (browserName !== 'webkit') throw new Error(`Unsupported native touch engine: ${browserName}`);
  // Playwright 1.64 has no public touch-move API. Its local WebKit bridge exposes
  // the native input protocol; keep this test-only adapter isolated for upgrades.
  const localPage = page as Page & {
    _connection: {
      toImpl: (page: Page) => {
        delegate: {
          _pageProxySession: { send: (method: string, params: object) => Promise<unknown> };
        };
      };
    };
  };
  const session = localPage._connection.toImpl(page).delegate._pageProxySession;
  return async (type, x = 0, y = 0) => {
    await session.send('Input.dispatchTouchEvent', {
      type,
      // WebKit needs the changed point on release/cancel; Chromium needs an empty list.
      touchPoints: [{ x: Math.round(x), y: Math.round(y), id: 1 }],
    });
  };
}
