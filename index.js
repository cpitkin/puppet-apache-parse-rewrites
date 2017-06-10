#!/usr/bin/env node

'use strict'

const Promise = require('bluebird');
const cli = require('cli');
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');
const yaml = require('json2yaml');
const _ = require('underscore');

function parse(content) {
  const rulesAry = [];
  let temp = {};
  const split = content.split('\n');
  const cond = /RewriteCond.*/;
  const rule = /RewriteRule.*/;
  const previous = [];
  const filtered = _.map(split, (filterText, i) => {
    const both = /(RewriteCond|RewriteRule).*/;
    const testString = filterText.trim();
    if (both.test(testString)) {
      previous.push(true);
      return filterText;
    }
    if (!previous[i - 3]) {
      previous.push(false);
    } else if (!previous[i - 2]) {
      previous.push(false);
      return 'REMOVE';
    }
  });
  _.map(filtered, (text) => {
    if (text) {
      const testString = text.trim();
      if (cond.test(testString)) {
        const spt = testString.split('RewriteCond ')[1];
        const str = spt.replace('%', '%%');
        if (_.has(temp, 'rewrite_cond')) {
          temp.rewrite_cond.push(str);
        } else {
          temp.rewrite_cond = [str];
        }
      } else if (rule.test(testString)) {
        const spt = testString.split('RewriteRule ')[1];
        const str = spt.replace('%', '%%');
        if (_.has(temp, 'rewrite_rule')) {
          temp.rewrite_rule.push(str);
        } else {
          temp.rewrite_rule = [str];
        }
      } else if (text === 'REMOVE') {
        return
      }
    } else if (!_.isEmpty(temp)) {
      rulesAry.push(temp);
      temp = {};
    }
  });


  const yamlFile = yaml.stringify(rulesAry);
  if (cli.options.output) {
    fs.writeFileAsync(path.resolve(cli.options.output), yamlFile, 'utf8').catch((e) => {
      cli.fatal(e);
    });
  } else {
    fs.writeFileAsync(`${path.resolve()}/rewriteRules.yaml`, yamlFile, 'utf8').catch((e) => {
      cli.fatal(e);
    });
  }
}

cli.setApp('apache-parse');

cli.parse({
  input: ['i', 'Apache configuration file', 'path'],
  output: ['o', 'Hiera yaml output path. If none provided the current directory is used.', 'path'],
});

cli.enable('status');

if (cli.options.input === null) {
  cli.error('No input path found. Please provide the path to your Apache configuration file.');
} else {
  fs.readFileAsync(path.resolve(cli.options.input), 'utf8').then((contents) => {
    parse(contents);
  }).catch((e) => {
    cli.fatal(e);
  });
}
