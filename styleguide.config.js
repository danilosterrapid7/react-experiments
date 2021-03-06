/* eslint-disable */
const path = require('path');
const fs = require('fs');
const webpackConfigCreate = require('./tools/webpack/webpack.config');
const pack = require('./package.json');
const removeKeys = require('./tools/docs/removeKeys');
const webpackConfig = webpackConfigCreate({ name: 'default' }, __dirname);
const config = removeKeys(webpackConfig, ['entry', 'output']);

// Lerna utilities
const PackageUtilities = require('lerna/lib/PackageUtilities');
const Repository = require('lerna/lib/Repository');

const packagesInfo = PackageUtilities.getPackages(new Repository(process.cwd()));
const packages = packagesInfo.map(function(subPackage) {
  return {
    location: subPackage._location,
    package: subPackage._package,
    version: subPackage._version,
  };
});

const noDevPackages = packages
  .filter(function(item) {
    return !fs.existsSync(`${item.location}/DEV`);
  })
  .map(function(item) {
    return `${item.location}/**/*.js`;
  });

const devPackages = packages.filter(function(item) {
  return fs.existsSync(`${item.location}/DEV`);
});

const componentSections = devPackages.map(function(info) {
  return {
    components: `${info.location}/src/**/*.js`,
    description: info.package.description,
    ignore: (info.package.styleguide || {}).ignore || ['**/src/index.js', '**/__test__/**/*.js'],
    name: info.package.name,
  };
});

const sections = [
  {
    name: 'Introduction',
    content: 'README.md',
  },
].concat(componentSections);
console.log('devPackages sections', sections);

const node_modules = path.resolve('node_modules');

const reactDocgenDisplaynameHandler = require('react-docgen-displayname-handler');
const reactDocgen = require('react-docgen');

function customHandler(documentation, path) {
  // Calculate a display name for components based upon the declared class name.
  if (path.value.type === 'ClassDeclaration' && path.value.id.type === 'Identifier') {
    documentation.set('displayName', path.value.id.name);

    // Calculate the key required to find the component in the module exports
    if (path.parentPath.value.type === 'ExportNamedDeclaration') {
      documentation.set('path', path.value.id.name);
    }
  }

  // The component is the default export
  if (path.parentPath.value.type === 'ExportDefaultDeclaration') {
    documentation.set('path', 'default');
  }
}

function handlers(componentPath) {
  return []
    .concat(reactDocgen.defaultHandlers)
    .concat(customHandler, reactDocgenDisplaynameHandler.createDisplayNameHandler(componentPath));
}

module.exports = {
  ignore: [
    '**/*.locale.js',
    '**/*.spec.js',
    '**/mockData.test/**',
    '**/baseStyles/**',
    '**/cli/**',
    '**/utils/**',
    '**/lib/**',
    '**/DEV/**',
    '**/demo/**',
    '**/.nyc_output/**',
    '**/coverage/**',
    '**/mochawesome-report/**',
    '**/mochawesome-reports/**',
    '**/tools/**',
    /* node_modules dependencies */
    node_modules,
  ].concat(noDevPackages),
  require: ['babel-polyfill'],
  // style references: https://github.com/styleguidist/react-styleguidist/blob/master/src/styles/theme.js
  theme: {
    baseBackground: '#fdfdfc',
    link: '#1978c8',
    linkHover: '#f28a25',
    border: '#e0d2de',
    font:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
  },
  styles: {
    Playground: {
      preview: {
        paddingLeft: 0,
        paddingRight: 0,
        borderWidth: [[0, 0, 1, 0]],
        borderRadius: 0,
      },
    },
    Markdown: {
      pre: {
        border: 0,
        background: 'none',
      },
      code: {
        fontSize: 14,
      },
    },
  },
  styleguideComponents: {
    LogoRenderer: path.join(__dirname, 'styleguide/components/Logo'),
    StyleGuideRenderer: path.join(__dirname, 'styleguide/components/StyleGuide'),
  },
  webpackConfig: config,
  resolver: require('react-docgen').resolver.findAllComponentDefinitions,
  showUsage: true,
  sections: sections,
  handlers: handlers,
};
/* eslint-enable */
