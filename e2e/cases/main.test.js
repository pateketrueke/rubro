import { Selector } from 'testcafe';
import { url, href } from '../helpers';

/* global fixture, test */

fixture('yrv (dsl)')
  .page(url('/'));

test('it just loads!', async t => {
  await t.expect(Selector('h1').withText('Example page').visible).ok();
  await t.expect(Selector('[data-test=counter]').innerText).contains(1);
  await t.expect(Selector('a').withText('Home').getAttribute('href')).eql(href('/'));
  await t.expect(Selector('a').withText('Home').hasAttribute('aria-current')).ok();
});

test('it would mount Route-less content', async t => {
  await t.expect(Selector('p[data-test=routeless]').visible).ok();
  await t.expect(Selector('[data-test=counter]').innerText).contains(1);
});

test('it should mount from slot-content nodes', async t => {
  await t.click(Selector('a').withText('Test page'));
  await t.expect(Selector('h2').withText('Testing features').visible).ok();
  await t.expect(Selector('[data-test=counter]').innerText).contains(2);
});

test('it should allow to bind <Link {href} /> and such', async t => {
  await t.typeText(Selector('[data-test=custominput]'), 'success');
  await t.expect(Selector('[data-test=customhref]').getAttribute('href')).contains('/success');
  await t.expect(Selector('[data-test=counter]').innerText).contains(1);
});

fixture('yrv (example)')
  .page(url('/example'));

test('it should mount "Hello World"', async t => {
  await t.expect(Selector('[data-test=example]').withText('Hello World').visible).ok();
  await t.expect(Selector('[data-test=counter]').innerText).contains(1);
});

test('it should mount nested content', async t => {
  await t.click(Selector('a').withText('Link'));
  await t.expect(Selector('[data-test=example]').withText('Hello a').visible).ok();
  await t.expect(Selector('[data-test=counter]').innerText).contains(2);
  await t.expect(Selector('[data-test=unordered]').innerText).notContains('III');

  await t.click(Selector('a').withText('List'));
  await t.expect(Selector('[data-test=unordered]').innerText).eql('III');

  await t.click(Selector('a').withText('Show'));
  await t.expect(Selector('[data-test=unordered]').innerText).eql('II III');

  await t.click(Selector('a').withText('Edit'));
  await t.expect(Selector('[data-test=unordered]').innerText).eql('I II III');
});

test('it should fallback on unmatched routes', async t => {
  await t.click(Selector('a').withText('Broken link'));
  await t.expect(Selector('[data-test=example]').withText('Not found').visible).ok();
  await t.expect(Selector('[data-test=example]').innerText).notContains('Hello a');
  await t.expect(Selector('[data-test=counter]').innerText).contains(2);
});

fixture('yrv (fallback)')
  .page(url('/e'));

test('should not mount any fallback et all', async t => {
  await t.expect(Selector('h2[data-test=fallback]').exists).notOk();
  await t.expect(Selector('[data-test=counter]').innerText).contains(1);
});

test.page(url('/e/im_not_exists'))('should handle non-matched routes as fallback', async t => {
  await t.expect(Selector('h2').withText('NOT FOUND').visible).ok();
  await t.expect(Selector('[data-test=counter]').innerText).contains(1);
});

fixture('yrv (buttons)')
  .page(url('/test'));

test('it should disable Link buttons if they are active', async t => {
  const UndoButton = Selector('button').withText('Undo');
  const Parameters = Selector('[data-test=parameters]');

  await t.expect(UndoButton.visible).ok();
  await t.expect(UndoButton.hasAttribute('disabled')).ok();
  await t.click(Selector('a').withText('Test props'));

  await t.expect(Parameters.visible).ok();
  await t.expect(UndoButton.hasAttribute('disabled')).notOk();

  await t.click(UndoButton);
  await t.expect(Parameters.exists).notOk();
  await t.expect(UndoButton.hasAttribute('disabled')).ok();
  await t.expect(Selector('[data-test=counter]').innerText).contains(3);
});

fixture('yrv (query params)')
  .page(url('/test/props'));

test('it should parse from location.search', async t => {
  await t.expect(Selector('li').withText('query: {}').exists).ok();
  await t.expect(Selector('[data-test=counter]').innerText).contains(1);

  await t.expect(Selector('a').withText('Test page').getAttribute('href')).eql(href('/test'));
  await t.expect(Selector('a').withText('Test page').hasAttribute('aria-current')).ok();

  await t.expect(Selector('a').withText('Test props').getAttribute('href')).eql(href('/test/props'));
  await t.expect(Selector('a').withText('Test props').hasAttribute('aria-current')).ok();
});

test('it should take queryParams from navigateTo()', async t => {
  await t.click(Selector('a').withText('Do not click!'));
  await t.expect(Selector('li').withText('query: {"truth":"42"}').exists).ok();

  await t.typeText(Selector('[data-test=key]'), 'x');
  await t.typeText(Selector('[data-test=value]'), 'y');
  await t.click(Selector('[data-test=append]'));

  await t.expect(Selector('li').withText('query: {"truth":"42","x":"y"}').exists).ok();
  await t.expect(Selector('[data-test=counter]').innerText).contains(3);
});

fixture('yrv (middleware)')
  .page(url('/test/props'));

test('it should redirect if the given route matches', async t => {
  await t.click(Selector('a').withText('Redirect'));
  await t.expect(Selector('button').withText('Undo').hasAttribute('disabled')).ok();
  await t.expect(Selector('[data-test=counter]').innerText).contains(3);
});

test('it should mount or redirect based on given condition', async t => {
  await t.setNativeDialogHandler(() => false);
  await t.click(Selector('a').withText('Protected'));
  await t.expect(Selector('[data-test=redirect]').innerText).contains('Wrong!');

  await t.setNativeDialogHandler(() => true);
  await t.click(Selector('a').withText('Protected'));
  await t.expect(Selector('[data-test=redirect]').innerText).contains('Yay!');
  await t.expect(Selector('[data-test=counter]').innerText).contains(4);
});

fixture('yrv (nested params)')
  .page(url('/test/props'));

test('it should inject params from resolved routes', async t => {
  await t.click(Selector('a').withText('Hello World.'));
  await t.expect(Selector('p').withText('Value: Hello World').visible).ok();
  await t.expect(Selector('[data-test=counter]').innerText).contains(2);
});

if (!process.env.HASHCHANGE) {
  fixture('yrv (anchored routes)')
    .page(url('/sub'));

  test('it should inject params from resolved routes', async t => {
    await t.click(Selector('a').withText('Root'));
    await t.expect(Selector('p[data-test=anchored]').innerText).contains('HOME');
    await t.expect(Selector('p[data-test=anchored]').innerText).notContains('ABOUT');
    await t.expect(Selector('[data-test=counter]').innerText).contains(2);
  });

  test('it should skip non-exact routes from matched ones', async t => {
    await t.click(Selector('a').withText('About page'));
    await t.expect(Selector('p[data-test=anchored]').innerText).contains('ABOUT');
    await t.expect(Selector('p[data-test=anchored]').innerText).notContains('HOME');
    await t.expect(Selector('[data-test=counter]').innerText).contains(2);
  });

  test('it should handle non-matched routes as fallback', async t => {
    await t.click(Selector('a').withText('Broken anchor'));
    await t.expect(Selector('h2[data-test=fallback]').exists).notOk();
    await t.expect(Selector('fieldset').innerText).contains("Unreachable '/sub#broken'");
    await t.expect(Selector('[data-test=counter]').innerText).contains(2);
  });
}

fixture('yrv (nested routes)')
  .page(url('/top'));

test('it should nothing at top-level', async t => {
  await t.expect(Selector('p[data-test=nested]').innerText).contains('?');
  await t.expect(Selector('p[data-test=nested]').innerText).notContains('a');
  await t.expect(Selector('p[data-test=nested]').innerText).notContains('b');
  await t.expect(Selector('p[data-test=nested]').innerText).notContains('c');

  await t.click(Selector('a').withText('1'));
  await t.expect(Selector('p[data-test=nested]').innerText).notContains('?');
  await t.expect(Selector('p[data-test=nested]').innerText).contains('a');
  await t.expect(Selector('p[data-test=nested]').innerText).notContains('b');
  await t.expect(Selector('p[data-test=nested]').innerText).notContains('c');

  await t.click(Selector('a').withText('2'));
  await t.expect(Selector('p[data-test=nested]').innerText).notContains('?');
  await t.expect(Selector('p[data-test=nested]').innerText).notContains('a');
  await t.expect(Selector('p[data-test=nested]').innerText).contains('b');
  await t.expect(Selector('p[data-test=nested]').innerText).notContains('c');

  await t.click(Selector('a').withText('3'));
  await t.expect(Selector('p[data-test=nested]').innerText).notContains('?');
  await t.expect(Selector('p[data-test=nested]').innerText).notContains('a');
  await t.expect(Selector('p[data-test=nested]').innerText).notContains('b');
  await t.expect(Selector('p[data-test=nested]').innerText).contains('c');
  await t.expect(Selector('[data-test=counter]').innerText).contains(4);
});

fixture('yrv (hashed routes)')
  .page(url('/gist'));

test('it should load root-handlers', async t => {
  await t.expect(Selector('[data-test=hashed]').innerText).contains('GIST INFO');
  await t.expect(Selector('[data-test=hashed]').innerText).notContains('SHA1: N/A');
  await t.expect(Selector('[data-test=hashed]').innerText).notContains('(edit)');
  await t.expect(Selector('[data-test=hashed]').innerText).notContains('(save)');
  await t.expect(Selector('[data-test=counter]').innerText).contains(1);
});

test.page(url('/gist#test'))('it should load sub-handlers', async t => {
  await t.expect(Selector('[data-test=hashed]').innerText).notContains('GIST INFO');
  await t.expect(Selector('[data-test=hashed]').innerText).contains('SHA1: test');
  await t.expect(Selector('[data-test=hashed]').innerText).notContains('(edit)');
  await t.expect(Selector('[data-test=hashed]').innerText).notContains('(save)');
  await t.expect(Selector('[data-test=counter]').innerText).contains(1);
});

test.page(url('/gist#test/edit'))('it should load nested sub-handlers (/edit)', async t => {
  await t.expect(Selector('[data-test=hashed]').innerText).notContains('GIST INFO');
  await t.expect(Selector('[data-test=hashed]').innerText).contains('SHA1: test');
  await t.expect(Selector('[data-test=hashed]').innerText).contains('(edit)');
  await t.expect(Selector('[data-test=hashed]').innerText).notContains('(save)');
  await t.expect(Selector('[data-test=counter]').innerText).contains(1);
});

test.page(url('/gist#test/save'))('it should load nested root-handlers (/save)', async t => {
  await t.expect(Selector('[data-test=hashed]').innerText).notContains('GIST INFO');
  await t.expect(Selector('[data-test=hashed]').innerText).contains('SHA1: test');
  await t.expect(Selector('[data-test=hashed]').innerText).notContains('(edit)');
  await t.expect(Selector('[data-test=hashed]').innerText).contains('(save)');
  await t.expect(Selector('[data-test=counter]').innerText).contains(1);
});

test.page(url('/gist#test/not_found'))('it should fail on unreachable routes', async t => {
  await t.expect(Selector('[data-test=hashed]').innerText).notContains('GIST INFO');
  await t.expect(Selector('[data-test=hashed]').innerText).contains('SHA1: test');
  await t.expect(Selector('[data-test=hashed]').innerText).notContains('(edit)');
  await t.expect(Selector('[data-test=hashed]').innerText).notContains('(save)');
  await t.expect(Selector('[data-test=hashed]').innerText).contains('Unreachable');
  await t.expect(Selector('[data-test=counter]').innerText).contains(1);
});

fixture('yrv (conditional routes)')
  .page(url('/auth'));

test('it should redirect from protected pages', async t => {
  await t.click(Selector('a').withText('Protected page'));
  await t.expect(Selector('[data-test=logged]').innerText).contains('Log-in');
  await t.expect(Selector('[data-test=logged]').innerText).notContains('Welcome back.');
  await t.expect(Selector('[data-test=logged]').innerText).notContains('O.K.');
  await t.expect(Selector('[data-test=counter]').innerText).contains(4);
});

test('it should skip redirections otherwise', async t => {
  await t.click(Selector('[data-test=logged]').find('input'));
  await t.click(Selector('a').withText('→'));
  await t.expect(Selector('[data-test=logged]').innerText).contains('Welcome back.');
  await t.expect(Selector('[data-test=logged]').innerText).notContains('Log-in');
  await t.expect(Selector('[data-test=logged]').innerText).notContains('O.K.');
  await t.expect(Selector('[data-test=counter]').innerText).contains(3);
});

test('it should allow routes if conditions are met', async t => {
  await t.expect(Selector('[data-test=secret]').exists).notOk();
  await t.click(Selector('[data-test=logged]').find('input'));
  await t.click(Selector('a').withText('Protected page'));
  await t.expect(Selector('[data-test=secret]').innerText).contains('Top-secret');
  await t.expect(Selector('[data-test=logged]').innerText).notContains('Log-in');
  await t.expect(Selector('[data-test=logged]').innerText).notContains('Welcome back.');
  await t.expect(Selector('[data-test=logged]').innerText).contains('O.K.');

  await t.click(Selector('[data-test=logged]').find('input'));
  await t.expect(Selector('[data-test=secret]').exists).notOk();
  await t.expect(Selector('[data-test=logged]').innerText).contains('Log-in');
  await t.expect(Selector('[data-test=logged]').innerText).notContains('Welcome back.');
  await t.expect(Selector('[data-test=logged]').innerText).notContains('O.K.');
  await t.expect(Selector('[data-test=counter]').innerText).contains(4);
});

fixture('yrv (dynamic imports)')
  .page(url('/import', true));

test('it should allow routes to be loaded through dynamic-imports', async t => {
  await t
    .expect(Selector('[data-test=container]').innerText).contains('Loading...')
    .expect(Selector('[data-test=import]').exists)
    .ok();
});

if (!process.env.HASHCHANGE) {
  fixture('yrv (base-href)')
    .page(url('/folder', true));

  test('it should rebase all links to preserve base-href location', async t => {
    await t.expect(Selector('a').withText('Home').getAttribute('href')).eql(href('/folder'));
    await t.expect(Selector('a').withText('Home').hasAttribute('aria-current')).ok();
  });

  test('it should handle <base href="..." /> on all routes and links', async t => {
    await t.click(Selector('a').withText('Test page'));
    await t.expect(Selector('h2').withText('Testing features').visible).ok();

    await t.click(Selector('a').withText('Test props'));
    await t.click(Selector('a').withText('Do not click!'));
    await t.expect(Selector('li').withText('query: {"truth":"42"}').exists).ok();

    await t.click(Selector('a').withText('Anchor page'));
    await t.click(Selector('a').withText('Root'));

    await t.expect(Selector('p[data-test=anchored]').innerText).contains('HOME');
    await t.expect(Selector('p[data-test=anchored]').innerText).notContains('ABOUT');

    await t.click(Selector('a').withText('Link'));
    await t.expect(Selector('p[data-test=example').innerText).contains('Hello a');
    await t.expect(Selector('[data-test=counter]').innerText).contains(7);
  });
}

// this test seems to be working if you don't use chrom*:headless
if (!process.argv.some(x => x.includes(':headless'))) {
  fixture('yrv (links a new-tab)')
    .page(url('/'));

  test('should open links on new tabs', async t => {
    const initialURL = await t.eval(() => document.documentURI);

    await t.click(Selector('a').withText('Test page'), { modifiers: { meta: true } }).wait(1000);

    const openedURL = await t.eval(() => document.documentURI);

    await t.expect(initialURL).notEql(openedURL);

    try {
      // this crashes the browser after closing
      await t.eval(() => window.close());
    } catch (e) {
      // ok
    }

    const prevURL = await t.eval(() => document.documentURI);

    await t.expect(initialURL).eql(prevURL);
  });
}
