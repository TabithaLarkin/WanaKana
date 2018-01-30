const wk = require('../../dist/lib/wanakana');

Cypress.config({
  baseUrl: 'http://localhost:9080',
  videoUploadOnPasses: false,
});

/* eslint-disable no-sequences */
Cypress.Commands.add('wkBind', { prevSubject: true }, ($el, options) => {
  wk.bind($el.get(0), options);
  return $el;
});

Cypress.Commands.add('wkUnbind', { prevSubject: true }, ($el) => {
  wk.unbind($el.get(0));
  return $el;
});

Cypress.Commands.add('wk', { prevSubject: true }, ($el, method, options) => {
  wk[method]($el.value(), options);
  return $el;
});

Cypress.Commands.add('setRange', { prevSubject: true }, ($el) => {
  $el.get(0).setSelectionRange(5, 5);
  return $el;
});
/* eslint-enable no-sequences */

describe('input tests', () => {
  before(() => {
    cy.visit('');
  });

  describe('binding & unbinding', () => {
    it('throws if invalid element passed to bind()', () => {
      cy.get('form').then(($el) => {
        expect(() => wk.bind('nah')).throws(Error);
        expect(() => wk.bind([])).throws(Error);
        expect(() => wk.bind($el.get(0))).throws(Error);
      });
    });

    it('throws if invalid element passed to unbind()', () => {
      cy.get('#input').then(($el) => {
        expect(() => wk.unbind('nah')).throws(Error);
        expect(() => wk.unbind([])).throws(Error);
        expect(() => wk.unbind($el.get(0))).throws(Error);
      });
    });

    describe('binds & unbinds', () => {
      it('forces IMEMode true and converts for input', () => {
        cy
          .get('#input')
          .wkBind()
          .type('wanakana')
          .should('have.value', 'わなかな')
          .wkUnbind()
          .clear()
          .type('wanakana')
          .should('have.value', 'wanakana')
          .clear();
      });

      it('forces IMEMode true and converts for textarea', () => {
        cy
          .get('#textarea')
          .wkBind()
          .type('wanakana')
          .should('have.value', 'わなかな')
          .wkUnbind()
          .clear()
          .type('wanakana')
          .should('have.value', 'wanakana')
          .clear();
      });

      it('should handle concurrent separate bindings', () => {
        const [sel1, sel2] = ['#input', '#input2'];
        cy
          .get(sel1)
          .wkBind()
          .get(sel2)
          .wkBind()
          .get(sel1)
          .type('wana')
          .should('have.value', 'わな')
          .get(sel2)
          .type('kana')
          .should('have.value', 'かな')
          .get(sel1)
          .wkUnbind()
          .clear()
          .get(sel2)
          .wkUnbind()
          .clear();
      });

      it('should apply IMEMode toKana method selection', () => {
        cy
          .get('#input')
          .wkBind({ IMEMode: wk.TO_KANA_METHODS.KATAKANA })
          .type('amerika')
          .should('have.value', 'アメリカ')
          .wkUnbind()
          .clear()
          .wkBind({ IMEMode: wk.TO_KANA_METHODS.HIRAGANA })
          .type('KURO')
          .debug()
          .should('have.value', 'くろ')
          .wkUnbind()
          .clear();
      });

      it('should apply useObsoleteKana if specified', () => {
        cy
          .get('#input')
          .wkBind({ useObsoleteKana: true })
          .type('wiweWIWEwo')
          .should('have.value', 'ゐゑヰヱを')
          .wkUnbind()
          .clear();
      });
    });
  });
});

describe('default IME conversions', () => {
  before(() => {
    cy
      .visit('')
      .get('#input')
      .wkBind();
  });

  beforeEach(() => {
    cy.get('#input').clear();
  });

  it('should ignore nonascii/zenkaku latin', () => {
    cy
      .get('#input')
      .type('ｈｉｒｏｉ')
      .should('have.value', 'ｈｉｒｏｉ')
      .type('hiroi')
      .should('have.value', 'ｈｉｒｏｉひろい');
  });

  it('double consonants', () => {
    cy
      .get('#input')
      .type('gakkounimacchanakatta')
      .should('have.value', 'がっこうにまっちゃなかった');
  });

  it("solo n's are not transliterated.", () => {
    cy
      .get('#input')
      .type('n')
      .should('have.value', 'n');
  });

  it("solo n's are not transliterated, even when cursor has been relocated.", () => {
    cy
      .get('#input')
      .type('かな{leftArrow}n')
      .setRange(2, 2)
      .trigger('input')
      .type('y')
      .setRange(3, 3)
      .trigger('input')
      .should('have.value', 'かnyな');
  });

  it("solo n's are not transliterated, even when cursor has been relocated.", () => {
    cy
      .get('#input')
      .type('かん')
      .setRange(2, 2)
      .trigger('input')
      .type('{leftArrow}n')
      .setRange(2, 2)
      .trigger('input')
      .should('have.value', 'かnん');
  });

  it("double n's are transliterated.", () => {
    cy
      .get('#input')
      .type('nn')
      .should('have.value', 'ん');
  });

  it('n + space are transliterated.', () => {
    cy
      .get('#input')
      .type('n ')
      .should('have.value', 'ん');
  });

  it("n + ' are transliterated.", () => {
    cy
      .get('#input')
      .type("n'")
      .should('have.value', 'ん');
  });

  it('ni.', () => {
    cy
      .get('#input')
      .type('ni')
      .should('have.value', 'に');
  });

  it('kan', () => {
    cy
      .get('#input')
      .type('kan')
      .should('have.value', 'かn');
  });

  it('kanp', () => {
    cy
      .get('#input')
      .type('kanp')
      .should('have.value', 'かんp');
  });

  it('kanpai!', () => {
    cy
      .get('#input')
      .type('kanpai')
      .should('have.value', 'かんぱい');
  });

  it('nihongo', () => {
    cy
      .get('#input')
      .type('nihongo')
      .should('have.value', 'にほんご');
  });

  it("y doesn't count as a consonant for IME", () => {
    cy
      .get('#input')
      .type('ny')
      .should('have.value', 'ny');
  });

  it('nya works as expected', () => {
    cy
      .get('#input')
      .type('nya')
      .should('have.value', 'にゃ');
  });

  it("solo N's are not transliterated - katakana.", () => {
    cy
      .get('#input')
      .type('N')
      .should('have.value', 'N');
  });

  it("double N's are transliterated - katakana.", () => {
    cy
      .get('#input')
      .type('NN')
      .should('have.value', 'ン');
  });

  it('NI - katakana.', () => {
    cy
      .get('#input')
      .type('NI')
      .should('have.value', 'ニ');
  });

  it('KAN - katakana', () => {
    cy
      .get('#input')
      .type('KAN')
      .should('have.value', 'カN');
  });

  it('NIHONGO - katakana', () => {
    cy
      .get('#input')
      .type('NIHONGO')
      .should('have.value', 'ニホンゴ');
  });

  it('converts characters after cursor movement', () => {
    cy
      .get('#input')
      .type('wanakana')
      .should('have.value', 'わなかな')
      .type('{leftArrow}{leftArrow}shi')
      .setRange(5, 5)
      .trigger('input')
      .should('have.value', 'わなしかな')
      // NOTE: once upon a time there was an edgecase for inserting new input before an initial number
      .clear()
      .type('2{leftArrow}w{leftArrow}')
      .setRange(1, 1)
      .trigger('input')
      .type('a')
      .setRange(2, 2)
      .trigger('input')
      .should('have.value', 'わ2');
  });

  it('converts correct partial when multiple similar tokens', () => {
    cy
      .get('#input')
      .type('koskoskosko')
      .should('have.value', 'こsこsこsこ')
      .type('{leftArrow}{leftArrow}{leftArrow}o')
      .setRange(5, 5)
      .trigger('input')
      .should('have.value', 'こsこそこsこ');
  });

  // Microsoft IME style (Google converts to sokuon early -> かっｔ)
  it('ignores double consonants following compositionupdate', () => {
    cy
      .get('#input')
      .type('かｔ')
      .should('have.value', 'かｔ')
      .type('ｔ')
      .should('have.value', 'かｔｔ')
      .trigger('compositionupdate', {
        data: 'かｔｔ',
      })
      .should('have.value', 'かｔｔ')
      .setRange(3, 3);
  });
});
