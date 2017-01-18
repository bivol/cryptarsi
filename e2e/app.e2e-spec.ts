import { CryptarsiPage } from './app.po';

describe('cryptarsi App', function() {
  let page: CryptarsiPage;

  beforeEach(() => {
    page = new CryptarsiPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
