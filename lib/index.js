'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.default = void 0;

function _htmlWebpackPlugin() {
  const data = _interopRequireDefault(require('html-webpack-plugin'));

  _htmlWebpackPlugin = function _htmlWebpackPlugin() {
    return data;
  };

  return data;
}

function _pEachSeries() {
  const data = _interopRequireDefault(require('p-each-series'));

  _pEachSeries = function _pEachSeries() {
    return data;
  };

  return data;
}

function _micromatch() {
  const data = _interopRequireDefault(require('micromatch'));

  _micromatch = function _micromatch() {
    return data;
  };

  return data;
}

function _crypto() {
  const data = _interopRequireDefault(require('crypto'));

  _crypto = function _crypto() {
    return data;
  };

  return data;
}

function _globby() {
  const data = _interopRequireDefault(require('globby'));

  _globby = function _globby() {
    return data;
  };

  return data;
}

var _utils = require('./utils');

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly)
      symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
    keys.push.apply(keys, symbols);
  }
  return keys;
}

function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    if (i % 2) {
      ownKeys(source, true).forEach(function(key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(source).forEach(function(key) {
        Object.defineProperty(
          target,
          key,
          Object.getOwnPropertyDescriptor(source, key)
        );
      });
    }
  }
  return target;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true,
    });
  } else {
    obj[key] = value;
  }
  return obj;
}

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }
  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function() {
    var self = this,
      args = arguments;
    return new Promise(function(resolve, reject) {
      var gen = fn.apply(self, args);
      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, 'next', value);
      }
      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, 'throw', err);
      }
      _next(undefined);
    });
  };
}

class AddAssetHtmlPlugin {
  constructor(assets = []) {
    this.assets = Array.isArray(assets) ? assets.slice().reverse() : [assets];
    this.addedAssets = [];
    this.resourceHints = [];
  }
  /* istanbul ignore next: this would be integration tests */

  apply(compiler) {
    compiler.hooks.compilation.tap('AddAssetHtmlPlugin', compilation => {
      let beforeGenerationHook;
      let alterAssetTagsHook;
      let alterAssetTagGroupsHook;

      if (_htmlWebpackPlugin().default.version === 4) {
        const hooks = _htmlWebpackPlugin().default.getHooks(compilation);

        beforeGenerationHook = hooks.beforeAssetTagGeneration;
        alterAssetTagsHook = hooks.alterAssetTags;
        alterAssetTagGroupsHook = hooks.alterAssetTagGroups;
      } else {
        const hooks = compilation.hooks;
        beforeGenerationHook = hooks.htmlWebpackPluginBeforeHtmlGeneration;
        alterAssetTagsHook = hooks.htmlWebpackPluginAlterAssetTags;
        alterAssetTagGroupsHook = hooks.htmlWebpackPluginAlterAssetTags;
      }

      beforeGenerationHook.tapPromise('AddAssetHtmlPlugin', htmlPluginData =>
        this.addAllAssetsToCompilation(compilation, htmlPluginData)
      );
      alterAssetTagsHook.tap('AddAssetHtmlPlugin', htmlPluginData => {
        const assetTags = htmlPluginData.assetTags;

        if (assetTags) {
          this.alterAssetsAttributes(assetTags);
        } else {
          this.alterAssetsAttributes({
            scripts: htmlPluginData.body
              .concat(htmlPluginData.head)
              .filter(({ tagName }) => tagName === 'script'),
          });
        }
      });
      alterAssetTagGroupsHook.tap('AddAssetHtmlPlugin', htmlPluginData => {
        const headTags = htmlPluginData.headTags,
          head = htmlPluginData.head;

        if (headTags) {
          // HtmlWebpackPlugin 4.0.0
          headTags.push(...this.resourceHints);
        } else if (head) {
          // HtmlWebpackPlugin 3.x
          head.push(...this.resourceHints);
        }
      });
    });
  }

  addAllAssetsToCompilation(compilation, htmlPluginData) {
    var _this = this;

    return _asyncToGenerator(function*() {
      const handledAssets = yield (0, _utils.handleUrl)(_this.assets);
      yield (0,
      _pEachSeries()
        .default)(handledAssets, asset => _this.addFileToAssets(compilation, htmlPluginData, asset));
      return htmlPluginData;
    })();
  }

  alterAssetsAttributes(assetTags) {
    this.assets
      .filter(
        asset => asset.attributes && Object.keys(asset.attributes).length > 0
      )
      .forEach(asset => {
        assetTags.scripts
          .map(({ attributes }) => attributes)
          .filter(attrs => this.addedAssets.includes(attrs.src))
          .forEach(attrs => Object.assign(attrs, asset.attributes));
      });
  }

  addFileToAssets(
    compilation,
    htmlPluginData,
    {
      filepath,
      typeOfAsset = 'js',
      includeRelatedFiles = true,
      hash = false,
      publicPath,
      outputPath,
      files = [],
      rel,
      optionsAs,
    }
  ) {
    var _this2 = this;

    return _asyncToGenerator(function*() {
      if (!filepath) {
        const error = new Error('No filepath defined');
        compilation.errors.push(error);
        throw error;
      }

      const fileFilters = Array.isArray(files) ? files : [files];

      if (fileFilters.length > 0) {
        const shouldSkip = !fileFilters.some(file =>
          _micromatch().default.isMatch(htmlPluginData.outputName, file)
        );

        if (shouldSkip) {
          return;
        }
      }

      const addedFilename = yield htmlPluginData.plugin.addFileToAssets(
        filepath,
        compilation
      );
      let suffix = '';

      if (hash) {
        const md5 = _crypto().default.createHash('md5');

        md5.update(compilation.assets[addedFilename].source());
        suffix = `?${md5.digest('hex').substr(0, 20)}`;
      }

      const resolvedPublicPath =
        typeof publicPath === 'undefined'
          ? (0, _utils.resolvePublicPath)(compilation, addedFilename)
          : (0, _utils.ensureTrailingSlash)(publicPath);
      const resolvedPath = `${resolvedPublicPath}${addedFilename}${suffix}`;
      htmlPluginData.assets[typeOfAsset].unshift(resolvedPath);
      (0, _utils.resolveOutput)(compilation, addedFilename, outputPath);

      _this2.addedAssets.push(resolvedPath);

      if (rel) {
        const as =
          rel === 'preload'
            ? {
                as: (0, _utils.getAsValue)(optionsAs, resolvedPath),
              }
            : {};

        _this2.resourceHints.push({
          tagName: 'link',
          voidTag: true,
          attributes: _objectSpread(
            {
              href: resolvedPath,
              rel,
            },
            as
          ),
        });
      }

      if (includeRelatedFiles) {
        const relatedFiles = yield (0, _globby().default)(`${filepath}.*`);
        yield Promise.all(
          relatedFiles.sort().map(
            /*#__PURE__*/
            (function() {
              var _ref = _asyncToGenerator(function*(relatedFile) {
                const addedMapFilename = yield htmlPluginData.plugin.addFileToAssets(
                  relatedFile,
                  compilation
                );
                (0,
                _utils.resolveOutput)(compilation, addedMapFilename, outputPath);
              });

              return function(_x) {
                return _ref.apply(this, arguments);
              };
            })()
          )
        );
      }
    })();
  }
}

exports.default = AddAssetHtmlPlugin;
module.exports = exports.default;
