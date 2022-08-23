/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 9669:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(1609);

/***/ }),

/***/ 5448:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(4867);
var settle = __webpack_require__(6026);
var cookies = __webpack_require__(4372);
var buildURL = __webpack_require__(5327);
var buildFullPath = __webpack_require__(4097);
var parseHeaders = __webpack_require__(4109);
var isURLSameOrigin = __webpack_require__(7985);
var createError = __webpack_require__(5061);
var transitionalDefaults = __webpack_require__(7874);
var Cancel = __webpack_require__(5263);

module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;
    var responseType = config.responseType;
    var onCanceled;
    function done() {
      if (config.cancelToken) {
        config.cancelToken.unsubscribe(onCanceled);
      }

      if (config.signal) {
        config.signal.removeEventListener('abort', onCanceled);
      }
    }

    if (utils.isFormData(requestData)) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();

    // HTTP basic authentication
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    var fullPath = buildFullPath(config.baseURL, config.url);
    request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    function onloadend() {
      if (!request) {
        return;
      }
      // Prepare the response
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !responseType || responseType === 'text' ||  responseType === 'json' ?
        request.responseText : request.response;
      var response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      settle(function _resolve(value) {
        resolve(value);
        done();
      }, function _reject(err) {
        reject(err);
        done();
      }, response);

      // Clean up request
      request = null;
    }

    if ('onloadend' in request) {
      // Use onloadend if available
      request.onloadend = onloadend;
    } else {
      // Listen for ready state to emulate onloadend
      request.onreadystatechange = function handleLoad() {
        if (!request || request.readyState !== 4) {
          return;
        }

        // The request errored out and we didn't get a response, this will be
        // handled by onerror instead
        // With one exception: request that using file: protocol, most browsers
        // will return status as 0 even though it's a successful request
        if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
          return;
        }
        // readystate handler is calling before onerror or ontimeout handlers,
        // so we should call onloadend on the next 'tick'
        setTimeout(onloadend);
      };
    }

    // Handle browser request cancellation (as opposed to a manual cancellation)
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }

      reject(createError('Request aborted', config, 'ECONNABORTED', request));

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(createError('Network Error', config, null, request));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      var timeoutErrorMessage = config.timeout ? 'timeout of ' + config.timeout + 'ms exceeded' : 'timeout exceeded';
      var transitional = config.transitional || transitionalDefaults;
      if (config.timeoutErrorMessage) {
        timeoutErrorMessage = config.timeoutErrorMessage;
      }
      reject(createError(
        timeoutErrorMessage,
        config,
        transitional.clarifyTimeoutError ? 'ETIMEDOUT' : 'ECONNABORTED',
        request));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (utils.isStandardBrowserEnv()) {
      // Add xsrf header
      var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
        cookies.read(config.xsrfCookieName) :
        undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      });
    }

    // Add withCredentials to request if needed
    if (!utils.isUndefined(config.withCredentials)) {
      request.withCredentials = !!config.withCredentials;
    }

    // Add responseType to request if needed
    if (responseType && responseType !== 'json') {
      request.responseType = config.responseType;
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if (config.cancelToken || config.signal) {
      // Handle cancellation
      // eslint-disable-next-line func-names
      onCanceled = function(cancel) {
        if (!request) {
          return;
        }
        reject(!cancel || (cancel && cancel.type) ? new Cancel('canceled') : cancel);
        request.abort();
        request = null;
      };

      config.cancelToken && config.cancelToken.subscribe(onCanceled);
      if (config.signal) {
        config.signal.aborted ? onCanceled() : config.signal.addEventListener('abort', onCanceled);
      }
    }

    if (!requestData) {
      requestData = null;
    }

    // Send the request
    request.send(requestData);
  });
};


/***/ }),

/***/ 1609:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(4867);
var bind = __webpack_require__(1849);
var Axios = __webpack_require__(321);
var mergeConfig = __webpack_require__(7185);
var defaults = __webpack_require__(5546);

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  // Factory for creating new instances
  instance.create = function create(instanceConfig) {
    return createInstance(mergeConfig(defaultConfig, instanceConfig));
  };

  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Expose Cancel & CancelToken
axios.Cancel = __webpack_require__(5263);
axios.CancelToken = __webpack_require__(4972);
axios.isCancel = __webpack_require__(6502);
axios.VERSION = (__webpack_require__(7288).version);

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = __webpack_require__(8713);

// Expose isAxiosError
axios.isAxiosError = __webpack_require__(6268);

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports["default"] = axios;


/***/ }),

/***/ 5263:
/***/ ((module) => {

"use strict";


/**
 * A `Cancel` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};

Cancel.prototype.__CANCEL__ = true;

module.exports = Cancel;


/***/ }),

/***/ 4972:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Cancel = __webpack_require__(5263);

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;

  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;

  // eslint-disable-next-line func-names
  this.promise.then(function(cancel) {
    if (!token._listeners) return;

    var i;
    var l = token._listeners.length;

    for (i = 0; i < l; i++) {
      token._listeners[i](cancel);
    }
    token._listeners = null;
  });

  // eslint-disable-next-line func-names
  this.promise.then = function(onfulfilled) {
    var _resolve;
    // eslint-disable-next-line func-names
    var promise = new Promise(function(resolve) {
      token.subscribe(resolve);
      _resolve = resolve;
    }).then(onfulfilled);

    promise.cancel = function reject() {
      token.unsubscribe(_resolve);
    };

    return promise;
  };

  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Subscribe to the cancel signal
 */

CancelToken.prototype.subscribe = function subscribe(listener) {
  if (this.reason) {
    listener(this.reason);
    return;
  }

  if (this._listeners) {
    this._listeners.push(listener);
  } else {
    this._listeners = [listener];
  }
};

/**
 * Unsubscribe from the cancel signal
 */

CancelToken.prototype.unsubscribe = function unsubscribe(listener) {
  if (!this._listeners) {
    return;
  }
  var index = this._listeners.indexOf(listener);
  if (index !== -1) {
    this._listeners.splice(index, 1);
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

module.exports = CancelToken;


/***/ }),

/***/ 6502:
/***/ ((module) => {

"use strict";


module.exports = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};


/***/ }),

/***/ 321:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(4867);
var buildURL = __webpack_require__(5327);
var InterceptorManager = __webpack_require__(782);
var dispatchRequest = __webpack_require__(3572);
var mergeConfig = __webpack_require__(7185);
var validator = __webpack_require__(4875);

var validators = validator.validators;
/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(configOrUrl, config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof configOrUrl === 'string') {
    config = config || {};
    config.url = configOrUrl;
  } else {
    config = configOrUrl || {};
  }

  config = mergeConfig(this.defaults, config);

  // Set config.method
  if (config.method) {
    config.method = config.method.toLowerCase();
  } else if (this.defaults.method) {
    config.method = this.defaults.method.toLowerCase();
  } else {
    config.method = 'get';
  }

  var transitional = config.transitional;

  if (transitional !== undefined) {
    validator.assertOptions(transitional, {
      silentJSONParsing: validators.transitional(validators.boolean),
      forcedJSONParsing: validators.transitional(validators.boolean),
      clarifyTimeoutError: validators.transitional(validators.boolean)
    }, false);
  }

  // filter out skipped interceptors
  var requestInterceptorChain = [];
  var synchronousRequestInterceptors = true;
  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
      return;
    }

    synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;

    requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  var responseInterceptorChain = [];
  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
  });

  var promise;

  if (!synchronousRequestInterceptors) {
    var chain = [dispatchRequest, undefined];

    Array.prototype.unshift.apply(chain, requestInterceptorChain);
    chain = chain.concat(responseInterceptorChain);

    promise = Promise.resolve(config);
    while (chain.length) {
      promise = promise.then(chain.shift(), chain.shift());
    }

    return promise;
  }


  var newConfig = config;
  while (requestInterceptorChain.length) {
    var onFulfilled = requestInterceptorChain.shift();
    var onRejected = requestInterceptorChain.shift();
    try {
      newConfig = onFulfilled(newConfig);
    } catch (error) {
      onRejected(error);
      break;
    }
  }

  try {
    promise = dispatchRequest(newConfig);
  } catch (error) {
    return Promise.reject(error);
  }

  while (responseInterceptorChain.length) {
    promise = promise.then(responseInterceptorChain.shift(), responseInterceptorChain.shift());
  }

  return promise;
};

Axios.prototype.getUri = function getUri(config) {
  config = mergeConfig(this.defaults, config);
  return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: (config || {}).data
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

module.exports = Axios;


/***/ }),

/***/ 782:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(4867);

function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected, options) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected,
    synchronous: options ? options.synchronous : false,
    runWhen: options ? options.runWhen : null
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

module.exports = InterceptorManager;


/***/ }),

/***/ 4097:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var isAbsoluteURL = __webpack_require__(1793);
var combineURLs = __webpack_require__(7303);

/**
 * Creates a new URL by combining the baseURL with the requestedURL,
 * only when the requestedURL is not already an absolute URL.
 * If the requestURL is absolute, this function returns the requestedURL untouched.
 *
 * @param {string} baseURL The base URL
 * @param {string} requestedURL Absolute or relative URL to combine
 * @returns {string} The combined full path
 */
module.exports = function buildFullPath(baseURL, requestedURL) {
  if (baseURL && !isAbsoluteURL(requestedURL)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
};


/***/ }),

/***/ 5061:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var enhanceError = __webpack_require__(481);

/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
module.exports = function createError(message, config, code, request, response) {
  var error = new Error(message);
  return enhanceError(error, config, code, request, response);
};


/***/ }),

/***/ 3572:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(4867);
var transformData = __webpack_require__(8527);
var isCancel = __webpack_require__(6502);
var defaults = __webpack_require__(5546);
var Cancel = __webpack_require__(5263);

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }

  if (config.signal && config.signal.aborted) {
    throw new Cancel('canceled');
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
module.exports = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData.call(
    config,
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  var adapter = config.adapter || defaults.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData.call(
      config,
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData.call(
          config,
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};


/***/ }),

/***/ 481:
/***/ ((module) => {

"use strict";


/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The error.
 */
module.exports = function enhanceError(error, config, code, request, response) {
  error.config = config;
  if (code) {
    error.code = code;
  }

  error.request = request;
  error.response = response;
  error.isAxiosError = true;

  error.toJSON = function toJSON() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: this.config,
      code: this.code,
      status: this.response && this.response.status ? this.response.status : null
    };
  };
  return error;
};


/***/ }),

/***/ 7185:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(4867);

/**
 * Config-specific merge-function which creates a new config-object
 * by merging two configuration objects together.
 *
 * @param {Object} config1
 * @param {Object} config2
 * @returns {Object} New object resulting from merging config2 to config1
 */
module.exports = function mergeConfig(config1, config2) {
  // eslint-disable-next-line no-param-reassign
  config2 = config2 || {};
  var config = {};

  function getMergedValue(target, source) {
    if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
      return utils.merge(target, source);
    } else if (utils.isPlainObject(source)) {
      return utils.merge({}, source);
    } else if (utils.isArray(source)) {
      return source.slice();
    }
    return source;
  }

  // eslint-disable-next-line consistent-return
  function mergeDeepProperties(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(config1[prop], config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function valueFromConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(undefined, config2[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function defaultToConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(undefined, config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function mergeDirectKeys(prop) {
    if (prop in config2) {
      return getMergedValue(config1[prop], config2[prop]);
    } else if (prop in config1) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  var mergeMap = {
    'url': valueFromConfig2,
    'method': valueFromConfig2,
    'data': valueFromConfig2,
    'baseURL': defaultToConfig2,
    'transformRequest': defaultToConfig2,
    'transformResponse': defaultToConfig2,
    'paramsSerializer': defaultToConfig2,
    'timeout': defaultToConfig2,
    'timeoutMessage': defaultToConfig2,
    'withCredentials': defaultToConfig2,
    'adapter': defaultToConfig2,
    'responseType': defaultToConfig2,
    'xsrfCookieName': defaultToConfig2,
    'xsrfHeaderName': defaultToConfig2,
    'onUploadProgress': defaultToConfig2,
    'onDownloadProgress': defaultToConfig2,
    'decompress': defaultToConfig2,
    'maxContentLength': defaultToConfig2,
    'maxBodyLength': defaultToConfig2,
    'transport': defaultToConfig2,
    'httpAgent': defaultToConfig2,
    'httpsAgent': defaultToConfig2,
    'cancelToken': defaultToConfig2,
    'socketPath': defaultToConfig2,
    'responseEncoding': defaultToConfig2,
    'validateStatus': mergeDirectKeys
  };

  utils.forEach(Object.keys(config1).concat(Object.keys(config2)), function computeConfigValue(prop) {
    var merge = mergeMap[prop] || mergeDeepProperties;
    var configValue = merge(prop);
    (utils.isUndefined(configValue) && merge !== mergeDirectKeys) || (config[prop] = configValue);
  });

  return config;
};


/***/ }),

/***/ 6026:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var createError = __webpack_require__(5061);

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
module.exports = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(createError(
      'Request failed with status code ' + response.status,
      response.config,
      null,
      response.request,
      response
    ));
  }
};


/***/ }),

/***/ 8527:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(4867);
var defaults = __webpack_require__(5546);

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
module.exports = function transformData(data, headers, fns) {
  var context = this || defaults;
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn.call(context, data, headers);
  });

  return data;
};


/***/ }),

/***/ 5546:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(4867);
var normalizeHeaderName = __webpack_require__(6016);
var enhanceError = __webpack_require__(481);
var transitionalDefaults = __webpack_require__(7874);

var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = __webpack_require__(5448);
  } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
    // For node use HTTP adapter
    adapter = __webpack_require__(5448);
  }
  return adapter;
}

function stringifySafely(rawValue, parser, encoder) {
  if (utils.isString(rawValue)) {
    try {
      (parser || JSON.parse)(rawValue);
      return utils.trim(rawValue);
    } catch (e) {
      if (e.name !== 'SyntaxError') {
        throw e;
      }
    }
  }

  return (encoder || JSON.stringify)(rawValue);
}

var defaults = {

  transitional: transitionalDefaults,

  adapter: getDefaultAdapter(),

  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Accept');
    normalizeHeaderName(headers, 'Content-Type');

    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }
    if (utils.isObject(data) || (headers && headers['Content-Type'] === 'application/json')) {
      setContentTypeIfUnset(headers, 'application/json');
      return stringifySafely(data);
    }
    return data;
  }],

  transformResponse: [function transformResponse(data) {
    var transitional = this.transitional || defaults.transitional;
    var silentJSONParsing = transitional && transitional.silentJSONParsing;
    var forcedJSONParsing = transitional && transitional.forcedJSONParsing;
    var strictJSONParsing = !silentJSONParsing && this.responseType === 'json';

    if (strictJSONParsing || (forcedJSONParsing && utils.isString(data) && data.length)) {
      try {
        return JSON.parse(data);
      } catch (e) {
        if (strictJSONParsing) {
          if (e.name === 'SyntaxError') {
            throw enhanceError(e, this, 'E_JSON_PARSE');
          }
          throw e;
        }
      }
    }

    return data;
  }],

  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,
  maxBodyLength: -1,

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  },

  headers: {
    common: {
      'Accept': 'application/json, text/plain, */*'
    }
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

module.exports = defaults;


/***/ }),

/***/ 7874:
/***/ ((module) => {

"use strict";


module.exports = {
  silentJSONParsing: true,
  forcedJSONParsing: true,
  clarifyTimeoutError: false
};


/***/ }),

/***/ 7288:
/***/ ((module) => {

module.exports = {
  "version": "0.26.1"
};

/***/ }),

/***/ 1849:
/***/ ((module) => {

"use strict";


module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};


/***/ }),

/***/ 5327:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(4867);

function encode(val) {
  return encodeURIComponent(val).
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
module.exports = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  var serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (utils.isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    var parts = [];

    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (utils.isArray(val)) {
        key = key + '[]';
      } else {
        val = [val];
      }

      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    var hashmarkIndex = url.indexOf('#');
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }

    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};


/***/ }),

/***/ 7303:
/***/ ((module) => {

"use strict";


/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
module.exports = function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
};


/***/ }),

/***/ 4372:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(4867);

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs support document.cookie
    (function standardBrowserEnv() {
      return {
        write: function write(name, value, expires, path, domain, secure) {
          var cookie = [];
          cookie.push(name + '=' + encodeURIComponent(value));

          if (utils.isNumber(expires)) {
            cookie.push('expires=' + new Date(expires).toGMTString());
          }

          if (utils.isString(path)) {
            cookie.push('path=' + path);
          }

          if (utils.isString(domain)) {
            cookie.push('domain=' + domain);
          }

          if (secure === true) {
            cookie.push('secure');
          }

          document.cookie = cookie.join('; ');
        },

        read: function read(name) {
          var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
          return (match ? decodeURIComponent(match[3]) : null);
        },

        remove: function remove(name) {
          this.write(name, '', Date.now() - 86400000);
        }
      };
    })() :

  // Non standard browser env (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return {
        write: function write() {},
        read: function read() { return null; },
        remove: function remove() {}
      };
    })()
);


/***/ }),

/***/ 1793:
/***/ ((module) => {

"use strict";


/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
module.exports = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
};


/***/ }),

/***/ 6268:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(4867);

/**
 * Determines whether the payload is an error thrown by Axios
 *
 * @param {*} payload The value to test
 * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
 */
module.exports = function isAxiosError(payload) {
  return utils.isObject(payload) && (payload.isAxiosError === true);
};


/***/ }),

/***/ 7985:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(4867);

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
    (function standardBrowserEnv() {
      var msie = /(msie|trident)/i.test(navigator.userAgent);
      var urlParsingNode = document.createElement('a');
      var originURL;

      /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
      function resolveURL(url) {
        var href = url;

        if (msie) {
        // IE needs attribute set twice to normalize properties
          urlParsingNode.setAttribute('href', href);
          href = urlParsingNode.href;
        }

        urlParsingNode.setAttribute('href', href);

        // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
        return {
          href: urlParsingNode.href,
          protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
          host: urlParsingNode.host,
          search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
          hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
          hostname: urlParsingNode.hostname,
          port: urlParsingNode.port,
          pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
            urlParsingNode.pathname :
            '/' + urlParsingNode.pathname
        };
      }

      originURL = resolveURL(window.location.href);

      /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
      return function isURLSameOrigin(requestURL) {
        var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
        return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
      };
    })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return function isURLSameOrigin() {
        return true;
      };
    })()
);


/***/ }),

/***/ 6016:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(4867);

module.exports = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};


/***/ }),

/***/ 4109:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(4867);

// Headers whose duplicates are ignored by node
// c.f. https://nodejs.org/api/http.html#http_message_headers
var ignoreDuplicateOf = [
  'age', 'authorization', 'content-length', 'content-type', 'etag',
  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
  'referer', 'retry-after', 'user-agent'
];

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
module.exports = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) { return parsed; }

  utils.forEach(headers.split('\n'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
        return;
      }
      if (key === 'set-cookie') {
        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
      }
    }
  });

  return parsed;
};


/***/ }),

/***/ 8713:
/***/ ((module) => {

"use strict";


/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
module.exports = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};


/***/ }),

/***/ 4875:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var VERSION = (__webpack_require__(7288).version);

var validators = {};

// eslint-disable-next-line func-names
['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach(function(type, i) {
  validators[type] = function validator(thing) {
    return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
  };
});

var deprecatedWarnings = {};

/**
 * Transitional option validator
 * @param {function|boolean?} validator - set to false if the transitional option has been removed
 * @param {string?} version - deprecated version / removed since version
 * @param {string?} message - some message with additional info
 * @returns {function}
 */
validators.transitional = function transitional(validator, version, message) {
  function formatMessage(opt, desc) {
    return '[Axios v' + VERSION + '] Transitional option \'' + opt + '\'' + desc + (message ? '. ' + message : '');
  }

  // eslint-disable-next-line func-names
  return function(value, opt, opts) {
    if (validator === false) {
      throw new Error(formatMessage(opt, ' has been removed' + (version ? ' in ' + version : '')));
    }

    if (version && !deprecatedWarnings[opt]) {
      deprecatedWarnings[opt] = true;
      // eslint-disable-next-line no-console
      console.warn(
        formatMessage(
          opt,
          ' has been deprecated since v' + version + ' and will be removed in the near future'
        )
      );
    }

    return validator ? validator(value, opt, opts) : true;
  };
};

/**
 * Assert object's properties type
 * @param {object} options
 * @param {object} schema
 * @param {boolean?} allowUnknown
 */

function assertOptions(options, schema, allowUnknown) {
  if (typeof options !== 'object') {
    throw new TypeError('options must be an object');
  }
  var keys = Object.keys(options);
  var i = keys.length;
  while (i-- > 0) {
    var opt = keys[i];
    var validator = schema[opt];
    if (validator) {
      var value = options[opt];
      var result = value === undefined || validator(value, opt, options);
      if (result !== true) {
        throw new TypeError('option ' + opt + ' must be ' + result);
      }
      continue;
    }
    if (allowUnknown !== true) {
      throw Error('Unknown option ' + opt);
    }
  }
}

module.exports = {
  assertOptions: assertOptions,
  validators: validators
};


/***/ }),

/***/ 4867:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var bind = __webpack_require__(1849);

// utils is a library of generic helper functions non-specific to axios

var toString = Object.prototype.toString;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return Array.isArray(val);
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Determine if a value is a Buffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Buffer, otherwise false
 */
function isBuffer(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
    && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
function isArrayBuffer(val) {
  return toString.call(val) === '[object ArrayBuffer]';
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(val) {
  return toString.call(val) === '[object FormData]';
}

/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  var result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (isArrayBuffer(val.buffer));
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
  return typeof val === 'number';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a plain Object
 *
 * @param {Object} val The value to test
 * @return {boolean} True if value is a plain Object, otherwise false
 */
function isPlainObject(val) {
  if (toString.call(val) !== '[object Object]') {
    return false;
  }

  var prototype = Object.getPrototypeOf(val);
  return prototype === null || prototype === Object.prototype;
}

/**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
function isDate(val) {
  return toString.call(val) === '[object Date]';
}

/**
 * Determine if a value is a File
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
function isFile(val) {
  return toString.call(val) === '[object File]';
}

/**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
function isBlob(val) {
  return toString.call(val) === '[object Blob]';
}

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
function isURLSearchParams(val) {
  return toString.call(val) === '[object URLSearchParams]';
}

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
  return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
}

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 * nativescript
 *  navigator.product -> 'NativeScript' or 'NS'
 */
function isStandardBrowserEnv() {
  if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                           navigator.product === 'NativeScript' ||
                                           navigator.product === 'NS')) {
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object') {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (isPlainObject(result[key]) && isPlainObject(val)) {
      result[key] = merge(result[key], val);
    } else if (isPlainObject(val)) {
      result[key] = merge({}, val);
    } else if (isArray(val)) {
      result[key] = val.slice();
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

/**
 * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
 *
 * @param {string} content with BOM
 * @return {string} content value without BOM
 */
function stripBOM(content) {
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return content;
}

module.exports = {
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isBuffer: isBuffer,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isPlainObject: isPlainObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isURLSearchParams: isURLSearchParams,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge,
  extend: extend,
  trim: trim,
  stripBOM: stripBOM
};


/***/ }),

/***/ 6100:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(8081);
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3645);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
___CSS_LOADER_EXPORT___.push([module.id, "@import url(https://fonts.googleapis.com/css2?family=Ubuntu:wght@300;400;500;700&display=swap);"]);
___CSS_LOADER_EXPORT___.push([module.id, "@import url(https://fonts.googleapis.com/css2?family=Dosis:wght@200;300;400;500;600;700;800&family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap);"]);
___CSS_LOADER_EXPORT___.push([module.id, "@import url(https://fonts.googleapis.com/css2?family=Ubuntu+Mono:wght@400;700&display=swap);"]);
// Module
___CSS_LOADER_EXPORT___.push([module.id, "#header {\n  height: 70px;\n  background-color: #c2cad6;\n}\n\n#headerLogo {\n  height: 50px;\n}\n\nbody {\n  padding: 0;\n}\n\n.px-4 {\n  padding-left: 2rem !important;\n  padding-right: 2rem !important;\n}\n\nh1,\nh2,\nh3,\nh4,\nh5,\nh6,\n.card-header {\n  font-family: \"Dosis\", sans-serif;\n}\n\nh2 {\n  padding-left: 5px;\n  padding-top: 10px;\n}\n\n#dropdown {\n  width: 150px;\n  align-items: center;\n}\n\n#ddcontrol {\n  align-items: center;\n}\n\na.badge {\n  text-decoration: none;\n}\n\n.bg-summa {\n  background-color: #334155;\n}\n\n.bg-summa-light {\n  background-color: #e5e5e5;\n}\n\nhtml,\nbody,\n.page {\n  height: 100%;\n  min-height: 100%;\n}\n\nbody {\n  background-color: #fff;\n  height: 100%;\n  min-height: 100%;\n  position: relative;\n}\n\n#navtopbar {\n  background-color: #0f172a;\n}\n#navtopbar hr {\n  color: #f97316;\n}\n#navtopbar .dropdown:hover .dropdown-menu {\n  display: block;\n  margin-top: 0;\n}\n#navtopbar .dropdown-toggle {\n  color: #8c95a6;\n}\n#navtopbar .dropdown-toggle:after {\n  content: none;\n}\n#navtopbar .dropdown-toggle:hover {\n  color: white;\n}\n#navtopbar .navbar-user .nav-link {\n  line-height: 32px;\n  font-weight: bold;\n  padding: 0;\n}\n#navtopbar .navbar-user .nav-link:hover {\n  border-color: #f97316;\n}\n#navtopbar .navbar-user .nav-link .user-avatar {\n  width: 32px;\n  height: 32px;\n  float: right;\n  background-color: #1f2937;\n  margin-left: 1rem;\n  border: 1px solid #f97316;\n}\n#navtopbar .navbar-user .dropdown-menu {\n  border-color: #f97316;\n}\n#navtopbar .breadcrumb {\n  background-color: #0f172a;\n}\n#navtopbar .breadcrumb li.active {\n  color: white;\n}\n#navtopbar .breadcrumb li a {\n  color: #7782e2;\n}\n#navtopbar .navbar .nav .nav-link {\n  position: relative;\n}\n#navtopbar .navbar .nav .nav-link:hover {\n  color: white;\n}\n#navtopbar .navbar .nav .nav-link::after {\n  position: absolute;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  margin: auto;\n  margin-bottom: -9px;\n  color: transparent;\n  width: 0%;\n  content: \".\";\n  height: 2px;\n  font-size: 12px;\n}\n#navtopbar .navbar .nav .nav-link:hover::after {\n  width: 65%;\n  background-color: #f97316;\n}\n#navtopbar .underline {\n  position: relative;\n}\n#navtopbar .underline p::after {\n  position: absolute;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  margin: auto;\n  margin-bottom: -16px;\n  color: transparent;\n  width: 100%;\n  background-color: #f97316;\n  content: \".\";\n  height: 4px;\n  font-size: 12px;\n}\n\n.wrapper {\n  height: 100%;\n  background-color: #334155;\n}\n\n#sidebar {\n  background-color: #475569;\n  width: 250px;\n  overflow-y: auto;\n  transition: all 0.5s;\n  float: left;\n}\n#sidebar .sidebar-header {\n  padding: 1em;\n}\n#sidebar .sidebar-list {\n  padding-left: 20px;\n  padding-top: 1em;\n}\n#sidebar .sidebar-list li {\n  line-height: 25px;\n  border-bottom: 1px solid #334155;\n  display: flex;\n  height: 45px;\n  padding: 0;\n  align-items: center;\n  position: relative;\n}\n#sidebar .sidebar-list li .menu-icon {\n  width: 25px;\n  text-align: left;\n  display: flex;\n  align-items: center;\n  justify-content: flex-start;\n}\n#sidebar .sidebar-list li .menu-name {\n  left: -9999px;\n  width: 100%;\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n#sidebar .sidebar-list li.in-on-page:hover {\n  background-color: #e2e8f0;\n  border-bottom: 4px solid #f97316;\n  margin-bottom: -3px;\n}\n#sidebar .sidebar-list li.in-on-page:hover a {\n  font-weight: bold;\n}\n#sidebar .sidebar-list li a {\n  display: flex;\n  width: 100%;\n  justify-content: flex-start !important;\n  color: #fff;\n  text-decoration: none;\n}\n#sidebar .sidebar-list li a:hover {\n  color: #0f172a;\n}\n#sidebar .sidebar-list li a .fa-chevron-right {\n  padding-right: 10px;\n  font-size: 10px;\n}\n#sidebar .sidebar-list li p {\n  color: #fff;\n  display: block;\n}\n#sidebar .sidebar-list li.active::before,\n#sidebar .sidebar-list li:hover::before {\n  z-index: 0;\n  content: \"\";\n  position: absolute;\n  width: 50px;\n  height: 45px;\n  left: -50px;\n  top: 0;\n  border-bottom: 4px solid #f97316;\n  background-color: #e2e8f0;\n}\n#sidebar .sidebar-list li.active,\n#sidebar .sidebar-list li:hover {\n  background-color: #e2e8f0;\n  border-bottom: 4px solid #f97316;\n}\n#sidebar .sidebar-list li.active a,\n#sidebar .sidebar-list li:hover a {\n  color: #0f172a;\n  font-weight: bold;\n}\n#sidebar .open-collapse {\n  display: none;\n}\n#sidebar .close-collapse {\n  display: block;\n}\n#sidebar.toggle-menu .sidebar-list {\n  padding-left: 12px;\n}\n#sidebar.toggle-menu .sidebar-list .menu-name {\n  position: absolute;\n}\n#sidebar.toggle-menu .sidebar-list li a {\n  justify-content: center !important;\n}\n#sidebar.toggle-menu .sidebar-list li > p {\n  display: none !important;\n}\n#sidebar.toggle-menu .close-collapse {\n  display: none;\n}\n#sidebar.toggle-menu .open-collapse {\n  display: block;\n}\n\n#collapse-menu:hover {\n  color: #0f172a;\n  font-weight: bold;\n}\n\n.nocursor {\n  pointer-events: none;\n}\n\n#content {\n  width: calc(100% - 250px);\n  float: left;\n  margin-left: 0;\n  height: 100%;\n  background-color: #334155;\n  overflow: auto;\n  transition: all 0.5s ease 0s;\n}\n#content h1,\n#content h2,\n#content h3,\n#content h4,\n#content h5,\n#content h6 {\n  color: #0f172a;\n}\n\n.btn {\n  height: 32px !important;\n  border-radius: 4px !important;\n  padding: 0 6px !important;\n  line-height: 32px !important;\n  font-size: 14px !important;\n  font-family: \"Inter\", sans-serif;\n}\n.btn.btn-primary {\n  background: #5048e5 !important;\n  border-color: #5048e5 !important;\n}\n.btn.btn-secondary {\n  background: #c8d3fe !important;\n  border-color: #c8d3fe !important;\n}\n.btn.btn-background-embed {\n  background-color: #334155 !important;\n  border-color: #334155 !important;\n}\n\n.breadcrumb {\n  background: #cbd5e1;\n}\n.breadcrumb li {\n  color: #0f172a;\n  text-transform: capitalize;\n}\n.breadcrumb li.active {\n  color: #0f172a;\n  font-weight: bold;\n}\n.breadcrumb li a {\n  color: #0f172a;\n  text-decoration: none;\n}\n\n.card {\n  background-color: #fff;\n  border: 1px solid #ddd;\n}\n.card .card-header {\n  background-color: #334155;\n}\n.card .card-body {\n  color: #0f172a;\n}\n.card .card-body p {\n  color: #0f172a;\n  font-size: 10pt;\n  font: \"Dosis\", sans-serif;\n}\n.card .card-body hr {\n  color: #334155;\n}\n.card .card-body .property {\n  font-size: 10pt;\n  color: #0f172a;\n}\n.card .card-body .property strong {\n  margin-right: 0.3em;\n}\n.card .card-body .relation {\n  font-size: 10pt;\n  color: #0f172a;\n}\n.card .card-body .relation::before {\n  font-family: \"Font Awesome 6 Free\";\n  font-weight: 900;\n  content: \"\";\n  margin-right: 0.2em;\n}\n.card .card-footer {\n  background-color: #334155;\n}\n.card ul.list-group li {\n  background: transparent;\n  color: #0f172a;\n  font-family: \"Dosis\", sans-serif;\n  font-size: 10pt;\n  border: none;\n}\n.card .fixed-table-toolbar {\n  padding-right: 0.5em;\n  background-color: #334155;\n}\n.card .fixed-table-pagination {\n  color: #0f172a;\n  font-size: 8pt;\n  font-family: \"Dosis\", sans-serif;\n  padding-left: 0.5em;\n}\n.card .fixed-table-pagination ul.pagination {\n  margin-right: 0.5em !important;\n}\n.card .fixed-table-pagination ul.pagination li.page-item.active {\n  font-weight: bold;\n}\n.card .fixed-table-pagination ul.pagination li.page-item.active a.page-link {\n  background-color: #5048e5;\n}\n.card .fixed-table-pagination ul.pagination li.page-item a.page-link {\n  background-color: #c8d3fe;\n}\n.card table.table-summa {\n  border: none;\n}\n.card table.table-summa thead tr th {\n  color: #0f172a;\n  font-family: \"Dosis\", sans-serif;\n  font-size: 10pt;\n  font-weight: bold;\n}\n.card table.table-summa tbody tr {\n  border-bottom: 1px solid #ddd;\n}\n.card table.table-summa tbody tr th {\n  font-family: \"Dosis\", sans-serif;\n  font-weight: bold;\n}\n.card table.table-summa tbody tr td,\n.card table.table-summa tbody tr th {\n  color: #0f172a;\n  font-size: 10pt;\n}\n\ninput.form-control,\nselect.form-control,\nselect.form-select {\n  border: 1px solid #ddd;\n  height: 32px !important;\n  border-radius: 4px !important;\n  padding: 0 6px !important;\n  line-height: 32px !important;\n  font-size: 14px !important;\n  box-shadow: 0px 1px 2px rgba(30, 41, 59, 0.08);\n}\n\nlabel.form-label {\n  color: #0f172a;\n  font: \"Dosis\", sans-serif;\n  font-size: 10pt;\n  font-weight: bold;\n}\n\n.form-check input.form-check-input {\n  background-color: #334155;\n}\n.form-check label.form-check-label {\n  color: #0f172a;\n  font: \"Dosis\", sans-serif;\n  font-size: 10pt;\n}\n.form-check.form-switch input.form-check-input {\n  background-color: #5048e5;\n}\n\ntable.table-properties tbody tr:nth-child(even) {\n  background-color: #fff;\n}\ntable.table-properties tbody tr:nth-child(odd) {\n  background-color: #fefefe;\n}\ntable.table-properties tbody tr th,\ntable.table-properties tbody tr td {\n  color: #0f172a;\n  font-family: \"Dosis\", sans-serif;\n  font-size: 10pt;\n  background-color: transparent;\n}\ntable.table-properties tbody tr th {\n  font-weight: bold;\n}\n\n#floorplan-container {\n  position: relative;\n  overflow: hidden;\n  border-radius: 4px;\n}\n#floorplan-container .toolbar {\n  width: auto;\n  min-width: 100px;\n  height: 34px;\n  top: 0;\n  position: absolute;\n  margin: 0 auto;\n  border-bottom-left-radius: 10px;\n  border-bottom-right-radius: 10px;\n  overflow: hidden;\n  background-color: #e2e2e2;\n  -webkit-box-shadow: 0px 0px 15px 5px rgba(0, 0, 0, 0.78);\n  box-shadow: 0px 0px 15px 5px rgba(0, 0, 0, 0.78);\n}\n#floorplan-container .toolbar .toolbar-button {\n  min-width: 30px;\n  text-align: center;\n  height: 26px;\n  line-height: 26px;\n  text-decoration: none;\n  display: inline-block;\n  color: #0f172a;\n  border-radius: 2px;\n  margin: 4px 0.3em;\n  box-sizing: border-box;\n  border: 1px solid transparent;\n}\n#floorplan-container .toolbar .toolbar-button em {\n  margin: 0 0.3em;\n}\n#floorplan-container .toolbar .toolbar-button span {\n  margin-right: 0.5em;\n  font-family: \"Inter\", sans-serif;\n  font-size: 10pt !important;\n}\n#floorplan-container .toolbar .toolbar-button.checked {\n  background-color: #5048e5;\n  color: #c8d3fe;\n  border: 1px solid #5048e5;\n}\n#floorplan-container .toolbar .toolbar-button.checked:hover {\n  background-color: #5048e5;\n  color: #0f172a;\n}\n#floorplan-container .toolbar .toolbar-button:hover {\n  background-color: #c8d3fe;\n}\n#floorplan-container .toolbar .toolbar-button:first-child {\n  border-bottom-left-radius: 10px;\n}\n#floorplan-container .toolbar .toolbar-button:last-child {\n  border-bottom-right-radius: 10px;\n}\n#floorplan-container .layer-selector {\n  height: auto;\n  min-height: 100px;\n  width: 80px;\n  top: 0;\n  position: absolute;\n  margin: 0 auto;\n  border-top-right-radius: 10px;\n  border-bottom-right-radius: 10px;\n  overflow: hidden;\n  background-color: #e2e2e2;\n  background-color: #e2e2e2;\n  -webkit-box-shadow: 0px 0px 15px 5px rgba(0, 0, 0, 0.78);\n  box-shadow: 0px 0px 15px 5px rgba(0, 0, 0, 0.78);\n}\n#floorplan-container .layer-selector .layer-selector-item {\n  width: 70px;\n  margin: 5px;\n  box-sizing: border-box;\n  text-align: center;\n  padding: 0.2em;\n  border-radius: 2px;\n  color: #0f172a;\n  font-family: \"Inter\", sans-serif;\n  font-size: 10pt !important;\n}\n#floorplan-container .layer-selector .layer-selector-item em {\n  font-size: 30px;\n  display: block;\n}\n#floorplan-container .layer-selector .layer-selector-item:hover {\n  background-color: #c8d3fe;\n}\n#floorplan-container .layer-selector .layer-selector-item:first-child {\n  border-top-right-radius: 10px;\n}\n#floorplan-container .layer-selector .layer-selector-item:last-child {\n  border-bottom-right-radius: 10px;\n}\n#floorplan-container .property-box {\n  width: 250px;\n  position: absolute;\n  background: #fff;\n  height: auto;\n  border: 1px solid #c8d3fe;\n  border-radius: 4px;\n  overflow: hidden;\n}\n#floorplan-container .property-box .property-box-header {\n  background: #334155;\n  margin-bottom: 0.5em;\n  font-family: \"Dosis\", sans-serif;\n  font-size: 12pt;\n  font-weight: bold;\n  padding: 0 0.5em;\n}\n#floorplan-container .property-box .property-box-footer {\n  background: #cbd5e1;\n  margin-top: 0.5em;\n  padding: 0.5em;\n}\n#floorplan-container .property-box .property-box-footer .btn {\n  font-family: \"Inter\", sans-serif;\n  font-size: 9pt !important;\n  line-height: 22px !important;\n  height: 22px !important;\n  box-sizing: border-box;\n}\n#floorplan-container .property-box .property-box-footer .action-container {\n  margin-bottom: 0.2em;\n  display: flex;\n}\n#floorplan-container .property-box .property-box-footer .action-container .btn {\n  margin-right: 0.2em;\n}\n#floorplan-container\n  .property-box\n  .property-box-footer\n  .action-container\n  .btn:last-child {\n  margin-right: 0;\n  background: red;\n}\n#floorplan-container .property-box .property {\n  padding: 0 0.5em;\n  border: 1px solid #ddd;\n  box-shadow: 0px 1px 2px rgba(30, 41, 59, 0.08);\n  height: auto;\n  overflow: hidden;\n  border-bottom: none;\n}\n#floorplan-container .property-box .property label.property-label {\n  color: #0f172a;\n  font-family: \"Inter\", sans-serif;\n  font-size: 9pt;\n  font-weight: bold;\n  float: left;\n  display: block;\n  width: 40%;\n  line-height: 18px !important;\n  margin-bottom: 0;\n}\n#floorplan-container .property-box .property input.property-text {\n  font-family: \"Inter\", sans-serif;\n  font-size: 9pt;\n  float: left;\n  display: block;\n  width: 60%;\n  height: 18px !important;\n  padding: 0 6px !important;\n  line-height: 18px !important;\n  border: none;\n  border-left: 1px solid #ddd;\n}\n#floorplan-container .property-box .property:last-child {\n  border-bottom: 1px solid red;\n}\n\n.login-body {\n  height: 100%;\n  background-color: #cbd5e1;\n}\n.login-body .login {\n  top: 50%;\n  left: 50%;\n  position: absolute;\n  background: #fff;\n  border-radius: 10px;\n  width: 300px;\n  height: 400px;\n  margin-left: -150px;\n  margin-top: -200px;\n  overflow: hidden;\n}\n.login-body .login .logo {\n  background: #334155;\n  width: 100%;\n  padding-top: 20px;\n  height: 100px;\n  background-size: 200px auto;\n  background-position: center;\n  background-repeat: no-repeat;\n}\n.login-body .login .login-form {\n  padding: 20px;\n  position: relative;\n  height: 320px;\n  overflow: hidden;\n}\n.login-body .login .login-form .btn {\n  position: absolute;\n  right: 20px;\n  bottom: 20px;\n}\n\nhtml.landingpage,\nbody.landingpage {\n  height: 100%;\n  overflow: hidden;\n}\n\n#video-background {\n  position: absolute;\n  z-index: 100;\n  height: 100%;\n  left: -700px;\n  opacity: 50%;\n}\n\n.landing-page {\n  z-index: 200;\n  width: 100%;\n  height: 100%;\n  position: relative;\n  overflow: hidden;\n}\n.landing-page .angle-filler {\n  height: 200%;\n  width: 100%;\n  background-color: #334155;\n  border-radius: 50px;\n  transform: rotate(20deg);\n  position: absolute;\n  left: -40%;\n  top: -30%;\n  box-shadow: 0px 0px 15px 5px #000000;\n}\n.landing-page .logo {\n  height: 40px;\n  width: 400px;\n  background-size: 20%;\n  overflow: visible;\n  background-position: 10% center;\n  background-repeat: no-repeat;\n  position: absolute;\n  bottom: 40px;\n  left: 20px;\n  padding: 10px 0 0 130px;\n  font-size: 9pt;\n}\n.landing-page .content-container {\n  top: 180px;\n  left: 40px;\n  width: 100%;\n  height: 75%;\n  position: absolute;\n  padding-left: 20px;\n  color: #fff;\n  font-size: 11pt;\n}\n.landing-page .content-container h1,\n.landing-page .content-container h2,\n.landing-page .content-container h3,\n.landing-page .content-container h4,\n.landing-page .content-container h5,\n.landing-page .content-container h6 {\n  color: #fff;\n}\n.landing-page .content-container p {\n  width: 40%;\n}\n.landing-page .content-container label {\n  color: #fff;\n}\n.landing-page .content-container input.form-check-input {\n  background-color: #fff;\n}\n.landing-page .content-container a {\n  font-size: 11pt;\n}\n\n.project-setup-form {\n  width: 400px;\n}\n\n#project-dashboard .card .card-body-scroller,\n#reseller-dashboard .card .card-body-scroller {\n  height: 300px;\n  overflow-y: auto;\n  background-color: #f0f3ff;\n}\n#project-dashboard .card .card-body-scroller .dashboard-loader,\n#reseller-dashboard .card .card-body-scroller .dashboard-loader {\n  font-size: 60px;\n  text-align: center;\n  color: #334155;\n  height: 100%;\n  opacity: 0.5;\n  padding: 30px;\n}\n#project-dashboard .card .card-body-scroller canvas,\n#reseller-dashboard .card .card-body-scroller canvas {\n  margin: 0.5em;\n}\n#project-dashboard .card .card-body-scroller .dashboard-card-label,\n#reseller-dashboard .card .card-body-scroller .dashboard-card-label {\n  color: #71717a;\n  width: 100%;\n  text-align: center;\n  line-height: 3em;\n  font-family: \"Dosis\", sans-serif;\n}\n#project-dashboard .card .card-body-scroller .dashboard-card-value,\n#reseller-dashboard .card .card-body-scroller .dashboard-card-value {\n  font-family: \"Dosis\", sans-serif;\n  color: #0f172a;\n  width: 100%;\n  text-align: center;\n  font-size: 70pt;\n  font-weight: bolder;\n  line-height: 70pt;\n}\n#project-dashboard .card .card-body-scroller .dashboard-card-value:first-child,\n#reseller-dashboard\n  .card\n  .card-body-scroller\n  .dashboard-card-value:first-child {\n  color: red;\n}\n#project-dashboard .card .card-body-scroller .dashboard-card-value:last-child,\n#reseller-dashboard .card .card-body-scroller .dashboard-card-value:last-child {\n  color: green;\n}\n#project-dashboard .card .card-body-scroller .current-usage,\n#reseller-dashboard .card .card-body-scroller .current-usage {\n  font-family: \"Dosis\", sans-serif;\n  font-size: 16pt;\n  color: #0f172a;\n  padding-left: 1em;\n  font-weight: bold;\n}\n#project-dashboard .card .card-body-scroller .current-usage small,\n#reseller-dashboard .card .card-body-scroller .current-usage small {\n  font-size: 12pt;\n  font-weight: normal;\n  margin-left: 0.25em;\n}\n#project-dashboard .card .card-body-scroller table.table thead tr th,\n#reseller-dashboard .card .card-body-scroller table.table thead tr th {\n  font-size: 10pt;\n  line-height: 11pt;\n  color: #0f172a;\n  border-bottom: 1px solid #ddd;\n}\n#project-dashboard .card .card-body-scroller table.table tbody tr,\n#reseller-dashboard .card .card-body-scroller table.table tbody tr {\n  background-color: none !important;\n}\n#project-dashboard .card .card-body-scroller table.table tbody tr td,\n#reseller-dashboard .card .card-body-scroller table.table tbody tr td {\n  font-size: 10pt;\n  line-height: 11pt;\n  color: #0f172a;\n  border-bottom: 1px solid #ddd;\n}\n#project-dashboard .card .card-body-scroller table.table tbody tr td em,\n#reseller-dashboard .card .card-body-scroller table.table tbody tr td em {\n  color: #f97316;\n}\n#project-dashboard .card .card-body-scroller table.table tbody tr td a,\n#reseller-dashboard .card .card-body-scroller table.table tbody tr td a {\n  text-decoration: none;\n  color: #0f172a;\n}\n#project-dashboard .card .card-body-scroller table.table tbody tr td a:hover,\n#reseller-dashboard .card .card-body-scroller table.table tbody tr td a:hover {\n  color: #5048e5;\n}\n#project-dashboard .card .card-body-scroller table.table tbody tr.unread td,\n#reseller-dashboard .card .card-body-scroller table.table tbody tr.unread td {\n  background-color: #c8d3fe;\n  font-weight: bold;\n}\n#project-dashboard .card .card-header,\n#reseller-dashboard .card .card-header {\n  background-color: #f0f3ff;\n  color: #0f172a;\n  font-family: \"Inter\", sans-serif;\n  font-size: 10pt;\n  font-weight: bold;\n  line-height: 30px;\n}\n#project-dashboard .card .card-header a,\n#reseller-dashboard .card .card-header a {\n  color: #0f172a;\n}\n#project-dashboard .card .card-header a:hover,\n#reseller-dashboard .card .card-header a:hover {\n  text-decoration: none;\n}\n#project-dashboard .card .card-header .dropdown-toggle,\n#reseller-dashboard .card .card-header .dropdown-toggle {\n  color: #fff;\n}\n#project-dashboard .card .card-header .dropdown-toggle::after,\n#reseller-dashboard .card .card-header .dropdown-toggle::after {\n  display: none;\n}\n#project-dashboard .card .card-header .dropdown-menu,\n#reseller-dashboard .card .card-header .dropdown-menu {\n  background-color: #f0f3ff;\n}\n#project-dashboard .card .card-header .dropdown-menu .dropdown-item:hover,\n#reseller-dashboard .card .card-header .dropdown-menu .dropdown-item:hover {\n  background-color: #c8d3fe;\n}\n#project-dashboard .card .card-body,\n#reseller-dashboard .card .card-body {\n  background-color: #f0f3ff;\n  color: #0f172a;\n  font-size: 9pt;\n}\n#project-dashboard .card .card-body.todo-item,\n#reseller-dashboard .card .card-body.todo-item {\n  margin-bottom: 0;\n  padding-bottom: 0;\n}\n#project-dashboard .card .card-body.todo-item .todo-item-details,\n#reseller-dashboard .card .card-body.todo-item .todo-item-details {\n  border-bottom: 1px solid #ddd;\n}\n#project-dashboard\n  .card\n  .card-body.todo-item\n  .todo-item-details\n  .todo-item-related-links,\n#reseller-dashboard\n  .card\n  .card-body.todo-item\n  .todo-item-details\n  .todo-item-related-links {\n  margin: 1em;\n}\n#project-dashboard .card .card-body:last-of-type .todo-item-details,\n#reseller-dashboard .card .card-body:last-of-type .todo-item-details {\n  border-bottom: none;\n}\n#project-dashboard .card .card-body label,\n#reseller-dashboard .card .card-body label {\n  font-weight: bold;\n}\n#project-dashboard .card .card-body .todo-item-details,\n#reseller-dashboard .card .card-body .todo-item-details {\n  margin-bottom: 0.25em;\n}\n#project-dashboard .card .card-body .todo-item-related-links a,\n#reseller-dashboard .card .card-body .todo-item-related-links a {\n  clear: both;\n  display: block;\n}\n#project-dashboard .card .card-body .todo-item-related-links a em,\n#reseller-dashboard .card .card-body .todo-item-related-links a em {\n  margin-right: 0.5em;\n}\n#project-dashboard .card .card-body .active-scenario-row,\n#reseller-dashboard .card .card-body .active-scenario-row {\n  color: #333;\n}\n#project-dashboard\n  .card\n  .card-body\n  .active-scenario-row\n  .active-scenario-group-name,\n#reseller-dashboard\n  .card\n  .card-body\n  .active-scenario-row\n  .active-scenario-group-name {\n  font-weight: bold;\n}\n#project-dashboard .card .card-body .active-scenario-subrow,\n#reseller-dashboard .card .card-body .active-scenario-subrow {\n  margin-bottom: 1em;\n  margin-left: 1em;\n}\n#project-dashboard .card .card-body .status-project-name,\n#reseller-dashboard .card .card-body .status-project-name {\n  line-height: 80px;\n  font-weight: bold;\n}\n#project-dashboard .card .card-body .status-project-name a,\n#reseller-dashboard .card .card-body .status-project-name a {\n  text-decoration: none;\n  color: #0f172a;\n}\n#project-dashboard .card .card-body .status-project-name a:hover,\n#reseller-dashboard .card .card-body .status-project-name a:hover {\n  color: #5048e5;\n}\n#project-dashboard .card .card-body .status-icon-container,\n#reseller-dashboard .card .card-body .status-icon-container {\n  line-height: 80px;\n}\n#project-dashboard .card .card-body .status-icon-container .status-icon,\n#reseller-dashboard .card .card-body .status-icon-container .status-icon {\n  font-size: 30pt;\n  color: #5048e5;\n  position: relative;\n}\n#project-dashboard .card .card-body .status-icon-container .status-icon .badge,\n#reseller-dashboard\n  .card\n  .card-body\n  .status-icon-container\n  .status-icon\n  .badge {\n  font-size: 6pt;\n  background-color: #71717a;\n}\n#project-dashboard\n  .card\n  .card-body\n  .status-icon-container\n  .status-icon\n  .rounded-circle,\n#reseller-dashboard\n  .card\n  .card-body\n  .status-icon-container\n  .status-icon\n  .rounded-circle {\n  border: 1px solid #f0f3ff !important;\n  font-size: 8pt;\n  color: #fff;\n  width: 20px;\n  height: 20px;\n  background-color: #71717a;\n  box-sizing: border-box;\n}\n#project-dashboard\n  .card\n  .card-body\n  .status-icon-container\n  .status-icon\n  .rounded-circle\n  i,\n#reseller-dashboard\n  .card\n  .card-body\n  .status-icon-container\n  .status-icon\n  .rounded-circle\n  i {\n  width: 18px;\n  height: 18px;\n  line-height: 18px;\n}\n#project-dashboard .card .card-footer,\n#reseller-dashboard .card .card-footer {\n  background-color: #f0f3ff;\n  display: flex;\n  height: 50px;\n}\n#project-dashboard .card .card-footer .btn-dashboard,\n#reseller-dashboard .card .card-footer .btn-dashboard {\n  background-color: #f0f3ff;\n  color: #5048e5;\n  margin: 0 auto;\n  height: 30px;\n}\n#project-dashboard .card .hub-status .hub-status-indicator,\n#reseller-dashboard .card .hub-status .hub-status-indicator {\n  border-radius: 5px;\n  width: 100%;\n  height: 20px;\n  font-family: \"Inter\", sans-serif;\n}\n#project-dashboard .card .scroll_indicator,\n#reseller-dashboard .card .scroll_indicator {\n  position: absolute;\n  margin: 0 auto;\n  background-color: #334155;\n  width: 40px;\n  height: 40px;\n  line-height: 40px;\n  bottom: 50px;\n  right: 10px;\n  font-size: 20pt;\n  border-radius: 50%;\n  box-sizing: border-box;\n  text-align: center;\n  opacity: 0;\n}\n#project-dashboard .card a.link,\n#reseller-dashboard .card a.link {\n  background-color: #5048e5;\n  height: 32px !important;\n  border-radius: 4px !important;\n  padding: 3px 6px !important;\n  line-height: 32px !important;\n  font-size: 8pt !important;\n  font-family: \"Inter\", sans-serif;\n  color: #fff;\n  text-decoration: none;\n  line-height: 32px;\n  margin-right: 1em;\n}\n#project-dashboard .card a.link:last-of-type,\n#reseller-dashboard .card a.link:last-of-type {\n  margin-right: 0;\n}\n\n.nav-summa {\n  margin: 16px 0;\n  background: #5048e5;\n  border-radius: 5px;\n  padding: 5px 4px;\n  height: 35px;\n}\n.nav-summa .nav-item {\n  margin: 0 2px;\n}\n.nav-summa .nav-item .nav-link {\n  background: #5048e5;\n  font-size: 14px;\n  padding: 0 1em;\n  line-height: 25px;\n  color: #fff;\n  cursor: pointer;\n  text-transform: capitalize;\n}\n.nav-summa .nav-item .nav-link.hover,\n.nav-summa .nav-item .nav-link.active {\n  background-color: #c8d3fe;\n  color: #5048e5;\n  font-weight: bold;\n}\n\n#project-group-control .group-tile {\n  background-color: #f97316;\n  width: 100%;\n  border-radius: 0.25rem;\n  position: relative;\n  cursor: pointer;\n  overflow: hidden;\n}\n#project-group-control .group-tile:after {\n  content: \"\";\n  display: block;\n  padding-bottom: 80%;\n}\n#project-group-control .group-tile.icon-light {\n  /* background-image: url(\"data:image/svg+xml;utf8,<svg width='78' height='78' viewBox='0 0 78 78' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M30.0415 58.1667H47.9547M39 4.5V8.33333M63.3953 14.6047L60.6852 17.3148M73.5 39H69.6667M8.33333 39H4.5M17.3148 17.3148L14.6047 14.6047M25.4453 52.5547C22.7653 49.874 20.9404 46.4588 20.2012 42.7409C19.4621 39.0231 19.842 35.1696 21.2928 31.6676C22.7436 28.1657 25.2003 25.1726 28.3521 23.0667C31.5039 20.9609 35.2094 19.8369 39 19.8369C42.7906 19.8369 46.4961 20.9609 49.6479 23.0667C52.7997 25.1726 55.2564 28.1657 56.7072 31.6676C58.158 35.1696 58.5379 39.0231 57.7988 42.7409C57.0596 46.4588 55.2347 49.874 52.5547 52.5547L50.454 54.6515C49.253 55.8527 48.3005 57.2786 47.6506 58.848C47.0008 60.4173 46.6664 62.0993 46.6667 63.7978V65.8333C46.6667 67.8667 45.8589 69.8167 44.4211 71.2545C42.9834 72.6923 41.0333 73.5 39 73.5C36.9667 73.5 35.0166 72.6923 33.5788 71.2545C32.1411 69.8167 31.3333 67.8667 31.3333 65.8333V63.7978C31.3333 60.367 29.9687 57.0742 27.546 54.6515L25.4453 52.5547Z' stroke='white' stroke-width='8' stroke-linecap='round' stroke-linejoin='round'/></svg>\"); */\n  background-repeat: no-repeat;\n  background-position: center;\n}\n#project-group-control .group-tile.icon-light.off {\n  /* // background-image: url(\"data:image/svg+xml;utf8,<svg width='48' height='63' viewBox='0 0 48 63' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M15.0414 43.1667H32.9546M10.4453 37.5547C7.76526 34.874 5.94031 31.4588 5.20117 27.741C4.46203 24.0231 4.84189 20.1696 6.29272 16.6676C7.74355 13.1657 10.2002 10.1726 13.352 8.06673C16.5039 5.96089 20.2093 4.83691 23.9999 4.83691C27.7905 4.83691 31.496 5.96089 34.6478 8.06673C37.7997 10.1726 40.2563 13.1657 41.7071 16.6676C43.158 20.1696 43.5378 24.0231 42.7987 27.741C42.0595 31.4588 40.2346 34.874 37.5546 37.5547L35.4539 39.6515C34.253 40.8527 33.3004 42.2786 32.6506 43.848C32.0007 45.4173 31.6664 47.0993 31.6666 48.7978V50.8333C31.6666 52.8667 30.8589 54.8167 29.4211 56.2545C27.9833 57.6923 26.0333 58.5 23.9999 58.5C21.9666 58.5 20.0166 57.6923 18.5788 56.2545C17.141 54.8167 16.3333 52.8667 16.3333 50.8333V48.7978C16.3333 45.367 14.9686 42.0742 12.5459 39.6515L10.4453 37.5547Z' stroke='#94A3B8' stroke-width='8' stroke-linecap='round' stroke-linejoin='round'/></svg>\"); */\n}\n#project-group-control .group-tile.icon-light.glow {\n  /* // background-image: url(\"data:image/svg+xml;utf8,<svg width='110' height='110' viewBox='0 0 110 110' fill='none' xmlns='http://www.w3.org/2000/svg'><g filter='url(#filter0_d_302_95753)'><path d='M46.0415 74.1667H63.9547M55 20.5V24.3333M79.3953 30.6047L76.6852 33.3148M89.5 55H85.6667M24.3333 55H20.5M33.3148 33.3148L30.6047 30.6047M41.4453 68.5547C38.7653 65.874 36.9404 62.4588 36.2012 58.7409C35.4621 55.0231 35.842 51.1696 37.2928 47.6676C38.7436 44.1657 41.2003 41.1726 44.3521 39.0667C47.5039 36.9609 51.2094 35.8369 55 35.8369C58.7906 35.8369 62.4961 36.9609 65.6479 39.0667C68.7997 41.1726 71.2564 44.1657 72.7072 47.6676C74.158 51.1696 74.5379 55.0231 73.7988 58.7409C73.0596 62.4588 71.2347 65.874 68.5547 68.5547L66.454 70.6515C65.253 71.8527 64.3005 73.2786 63.6506 74.848C63.0008 76.4173 62.6664 78.0993 62.6667 79.7978V81.8333C62.6667 83.8667 61.8589 85.8167 60.4211 87.2545C58.9834 88.6923 57.0333 89.5 55 89.5C52.9667 89.5 51.0166 88.6923 49.5788 87.2545C48.1411 85.8167 47.3333 83.8667 47.3333 81.8333V79.7978C47.3333 76.367 45.9687 73.0742 43.546 70.6515L41.4453 68.5547Z' stroke='white' stroke-width='8' stroke-linecap='round' stroke-linejoin='round'/></g><defs><filter id='filter0_d_302_95753' x='-7' y='-7' width='124' height='124' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'><feFlood flood-opacity='0' result='BackgroundImageFix'/><feColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/><feOffset/><feGaussianBlur stdDeviation='8'/><feColorMatrix type='matrix' values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 0 0 0 0 0.5 0'/><feBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_302_95753'/><feBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_302_95753' result='shape'/></filter></defs></svg>\"); */\n}\n#project-group-control .group-tile .group-tile-name {\n  color: #000;\n  font-size: 10pt;\n  font-weight: bold;\n  text-align: center;\n  height: 20%;\n  box-sizing: border-box;\n  padding-top: 1em;\n}\n#project-group-control .group-tile .dropdown-toggle {\n  position: absolute;\n  top: 1em;\n  right: 1em;\n}\n#project-group-control .group-tile .dropdown-toggle i {\n  color: #0f172a;\n}\n#project-group-control .group-tile .dropdown-toggle::after {\n  display: none !important;\n  content: \"\";\n}\n#project-group-control .group-tile .current-value {\n  position: absolute;\n  bottom: 1.25em;\n  width: 100%;\n  text-align: center;\n  font-size: 10pt;\n}\n#project-group-control .group-tile .current-value span {\n  display: inline-block;\n  background: rgba(15, 23, 42, 0.1);\n  padding: 0 0.25em;\n}\n#project-group-control .group-tile .brightness-slider {\n  position: absolute;\n  height: 100%;\n  width: 8px;\n  background: #fff;\n  left: 0;\n  top: 0;\n}\n#project-group-control .group-tile .brightness-slider .brightness-slider-inner {\n  position: relative;\n  bottom: 0;\n  width: 100%;\n  left: 0;\n  background: #0f172a;\n}\n\n#icon-online-hub {\n  /* // background-image: url(\"data:image/svg+xml;utf8,<svg width='48' height='90' viewBox='0 0 48 90' fill='none' xmlns='http://www.w3.org/2000/svg'><circle cx='24' cy='53' r='16' fill='#0D9488'/></svg>\"); */\n}\n\n#project-scenario-control .scenario-tile {\n  background: #f97316;\n  font: \"Dosis\", sans-serif;\n  color: #0f172a;\n  font-size: 12pt;\n  padding: 1em;\n  cursor: pointer;\n  border-radius: 0.25rem;\n}\n#project-scenario-control .scenario-tile .scenario-tile-name {\n  position: relative;\n  z-index: 2000;\n}\n#project-scenario-control .scenario-tile::after {\n  background-color: rgba(255, 255, 255, 0.2);\n}\n\niframe#modelframe {\n  width: 100%;\n  height: 500px;\n}\n\n.summa-modal .modal-content {\n  background-color: #fff;\n}\n\n.property-dialog {\n  height: 100%;\n}\n.property-dialog p {\n  color: #0f172a;\n}\n.property-dialog em {\n  font-size: 10pt;\n  color: #666;\n  display: block;\n}\n\nbody.popup {\n  background-color: #fff;\n  padding: 0;\n  height: 100%;\n}\n\n#overlay {\n  position: fixed;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  background-color: #000;\n  filter: alpha(opacity=50);\n  -moz-opacity: 0.5;\n  -khtml-opacity: 0.5;\n  opacity: 0.5;\n  z-index: 10000;\n  border-radius: 5px;\n}\n\n.list-group-summa-structure {\n  background-color: #f0f3ff;\n  border: none;\n}\n.list-group-summa-structure .list-group-item {\n  border: 1px solid #c8d3fe;\n  background-color: #f0f3ff;\n}\n.list-group-summa-structure .list-group-item a {\n  text-decoration: none;\n  color: #5048e5;\n}\n.list-group-summa-structure .list-group-item a em {\n  margin-right: 0.5em;\n}\n.list-group-summa-structure .list-group-item.list-group-item-back a {\n  color: #0f172a;\n}\n\n.card table.table thead tr th {\n  color: #0f172a;\n  font-weight: bold;\n  font-size: 10pt;\n}\n.card table.table tbody tr td {\n  color: #0f172a;\n  font-size: 10pt;\n}\n\n.summa-analysis-header .analytic-heading {\n  position: relative;\n  height: 100%;\n}\n.summa-analysis-header .analytic-heading div {\n  position: absolute;\n  bottom: -40px;\n  z-index: 9999;\n  right: 0;\n  font-family: \"Dosis\", sans-serif;\n  display: flex;\n  align-items: flex-end;\n  align-content: flex-start;\n  flex-direction: column;\n  background-color: #212c40;\n  width: 100px;\n  text-align: center;\n  padding: 0 20px;\n}\n.summa-analysis-header .analytic-heading div span {\n  margin-right: 5px;\n}\n.summa-analysis-header .analytic-heading div #analysis-heading-icon {\n  color: #334155;\n  font-size: 20px;\n}\n.summa-analysis-header .analytic-heading div #analysis-heading-value {\n  font-size: 70px;\n  line-height: 44px;\n  font-weight: 700;\n  color: #ffffff;\n}\n.summa-analysis-header .analytic-heading div #analysis-heading-suffix {\n  color: #f97316;\n  font-weight: 700;\n  font-size: 16px;\n  margin-top: 10px;\n  font-size: 16px;\n}\n.summa-analysis-header .summa-analysis-back-button {\n  color: #475569;\n  font-family: \"Inter\", sans-serif;\n  font-size: 14px;\n  font-weight: 700;\n  margin-top: 22px;\n  margin-bottom: 18px;\n  display: flex;\n  align-items: center;\n  margin-left: 10.5px;\n}\n.summa-analysis-header .summa-analysis-back-button em {\n  font-size: 18px;\n  margin-right: 10.5px;\n}\n.summa-analysis-header .analysis-title {\n  font-family: \"Inter\", sans-serif;\n  font-size: 20px;\n  color: #334155;\n  font-weight: 700;\n  float: left;\n  width: 150px;\n}\n.summa-analysis-header .analysis-title em {\n  color: #f97316;\n}\n\n#analysis-structure {\n  float: left;\n  width: max-content;\n  display: flex;\n  height: 25px;\n}\n\n#analysis-structure i {\n  font-size: 24px;\n  color: #f97316;\n  margin-right: 10px;\n}\n\n#analysis-structure .btn-select {\n  font-size: 20px;\n  color: #ffffff;\n  font-weight: 700;\n  background-color: unset;\n  box-shadow: unset !important;\n  border: none;\n  border-radius: 0;\n}\n\n#analysis-structure .dropdown-menu {\n  background-color: #fff;\n}\n\n.floor-item {\n  width: 100%;\n  background: #fff;\n  color: #334155;\n  text-align: left;\n  border: none;\n  padding: 5px 30px;\n  font-size: 16px;\n  font-weight: 600;\n}\n\n.floor-item.parent {\n  padding: 5px 10px;\n}\n\n.selected.floor-item {\n  color: gray;\n}\n\n#select-floor .dropdown-menu {\n  border: 1px solid gray;\n  border-radius: 2px;\n  padding: 0;\n}\n\n.list-group.summa-analysis-properties {\n  background: transparent;\n  border: none;\n}\n.list-group.summa-analysis-properties li.list-group-item {\n  border: none;\n  background: transparent;\n  color: #1f2937;\n  font-size: 10pt;\n  font-family: \"Inter\", sans-serif;\n  border-bottom: 1px solid #cbd5e1;\n  line-height: 30px;\n  border-radius: 0;\n  margin: 0;\n  padding: 0.5rem 0;\n}\n.list-group.summa-analysis-properties\n  li.list-group-item\n  .summa-analysis-property-header {\n  float: left;\n  font-weight: bold;\n}\n.list-group.summa-analysis-properties\n  li.list-group-item\n  .summa-analysis-property-value {\n  float: left;\n  font-weight: 400;\n  font-size: 14px;\n  color: #1f2937;\n}\n.list-group.summa-analysis-properties\n  li.list-group-item\n  .summa-analysis-property-suffix {\n  float: right;\n  margin-left: 0.25em;\n  font-size: 8pt;\n}\n\n.summa-people-tracking-list .list-group-item {\n  background: transparent;\n  border: none;\n}\n.summa-people-tracking-list .list-group-item .people-tracking-item-container {\n  position: relative;\n  height: 35px;\n  border-bottom: 1px solid #cbd5e1;\n}\n.summa-people-tracking-list\n  .list-group-item\n  .people-tracking-item-container\n  .people-tracking-text {\n  color: #0f172a;\n  font-family: \"Inter\", sans-serif;\n  font-size: 10pt;\n  position: absolute;\n  top: 0;\n  left: 0;\n  height: 35px;\n  line-height: 35px;\n}\n.summa-people-tracking-list\n  .list-group-item\n  .people-tracking-item-container\n  .people-tracking-checkbox-container {\n  position: absolute;\n  top: 0;\n  right: 0;\n  height: 35px;\n}\n\n#analysis-people-tracking-test .list-group-item {\n  padding: 0;\n}\n\n.summa-analysis-toggle {\n  margin-top: -15px;\n}\n.summa-analysis-toggle input[type=\"checkbox\"] {\n  height: 0;\n  width: 0;\n  visibility: hidden;\n}\n.summa-analysis-toggle label {\n  cursor: pointer;\n  text-indent: -9999px;\n  width: 34px;\n  height: 19px;\n  background: grey;\n  display: block;\n  border-radius: 100px;\n  position: relative;\n}\n.summa-analysis-toggle label:after {\n  content: \"\";\n  position: absolute;\n  top: 2px;\n  left: 2px;\n  width: 15px;\n  height: 15px;\n  background: #fff;\n  border-radius: 90px;\n  transition: 0.3s;\n}\n.summa-analysis-toggle input:checked + label {\n  background: #5048e5;\n}\n.summa-analysis-toggle input:checked + label:after {\n  left: calc(100% - 2px);\n  transform: translateX(-100%);\n}\n.summa-analysis-toggle label:active:after {\n  width: 15px;\n}\n\n.summa-toggle {\n  display: flex;\n  justify-content: center;\n  align-items: end;\n  height: 100%;\n}\n.summa-toggle .title-toggle {\n  color: #334155;\n  margin-right: 18px;\n  font-size: 20px;\n  font-weight: 700;\n}\n.summa-toggle input[type=\"checkbox\"] {\n  height: 0;\n  width: 0;\n  visibility: hidden;\n}\n.summa-toggle label {\n  cursor: pointer;\n  text-indent: -9999px;\n  width: 48px;\n  height: 32px;\n  background: grey;\n  display: block;\n  border-radius: 100px;\n  position: relative;\n}\n.summa-toggle label:after {\n  content: \"\";\n  position: absolute;\n  top: 2px;\n  left: 2px;\n  width: 28px;\n  height: 28px;\n  background: #fff;\n  border-radius: 90px;\n  transition: 0.3s;\n}\n.summa-toggle input:checked + label {\n  background: #5048e5;\n}\n.summa-toggle input:checked + label:after {\n  left: calc(100% - 2px);\n  transform: translateX(-100%);\n}\n.summa-toggle label:active:after {\n  width: 15px;\n}\n\n#select-people .select2-container {\n  display: none;\n}\n\n#floorplan-svg {\n  width: 100%;\n  height: 100%;\n  background-color: #e5e5e5;\n}\n#floorplan-svg svg {\n  width: 100%;\n  height: 100%;\n}\n#floorplan-svg svg .fixtures path {\n  stroke: 1px #f97316;\n}\n#floorplan-svg svg .analysis-layer-people-counting {\n  font-family: \"Dosis\";\n  font-size: 15pt;\n  line-height: 15pt;\n}\n#floorplan-svg svg .analysis-sensor-grid .analysis-sensor-grid-block {\n  fill: #f97316;\n  opacity: 0.4;\n  stroke: #f97316;\n  stroke-width: 1px;\n}\n#floorplan-svg svg .analysis-sensor-grid .analysis-sensor-grid-background {\n  fill: #f0f3ff;\n  opacity: 0.1;\n}\n#floorplan-svg .hidden {\n  display: none;\n}\n#floorplan-svg path {\n  stroke: #0f172a;\n  stroke-width: 1;\n}\n\n.select2.select2-container {\n  width: 100% !important;\n}\n\n.select2-selection.select2-selection--single {\n  height: 32px !important;\n}\n\n.btn-dashboard.btn.btn-light,\n.btn-details.btn.btn-light,\n.btn-details.btn.btn-light:active {\n  border: unset;\n  background-color: unset;\n  font-size: 13px;\n  color: white;\n}\n\n.btn-dashboard.btn.btn-light {\n  color: black;\n}\n\n.btn-dashboard.btn.btn-light:hover,\n.btn-details.btn.btn-light:hover {\n  background-color: unset;\n}\n\n.btn-dashboard.btn.btn-light:focus,\n.btn-details.btn.btn-light:focus {\n  outline: 0;\n  box-shadow: none;\n}\n\n.has-search .form-control {\n  padding-left: 2.375rem !important;\n}\n\n.has-search .form-control-feedback {\n  position: absolute;\n  z-index: 2;\n  display: block;\n  width: 2rem;\n  height: 2rem;\n  line-height: 2rem;\n  text-align: center;\n  pointer-events: none;\n  color: #aaa;\n}\n\n.btn-details {\n  font-size: 14px !important;\n  background-color: unset;\n  border: unset;\n  margin-top: 25px;\n  margin-left: 10px;\n}\n\n.floorplan {\n  width: 100%;\n  height: 100%;\n  overflow: auto;\n}\n.floorplan .overlay {\n  width: 100%;\n  height: 100%;\n  position: absolute;\n}\n.floorplan iframe {\n  width: 100%;\n  height: 100%;\n}\n\n.select2-dropdown {\n  color: #0f172a;\n}\n\n.detail-item {\n  color: #0f172a;\n  font-family: \"Inter\", sans-serif;\n  position: relative;\n  height: 35px;\n  line-height: 35px;\n  border-bottom: 1px solid #f0f3ff;\n}\n.detail-item .detail-item-header {\n  font-size: 9pt;\n  position: absolute;\n  left: 0;\n  top: 0;\n}\n.detail-item .detail-item-value {\n  font-size: 10pt;\n  position: absolute;\n  right: 0;\n  top: 0;\n}\n\n.detail-form .card {\n  border: none;\n}\n.detail-form .card .card-header {\n  background-color: transparent;\n  color: #0f172a;\n  border: none;\n  font-family: \"Inter\", sans-serif;\n  font-size: 10pt;\n  font-weight: bold;\n}\n.detail-form .card .card-body {\n  background-color: transparent;\n  padding-top: 0;\n}\n.detail-form .card .card-footer {\n  background-color: transparent;\n}\n\n.clickable-row:hover {\n  cursor: pointer;\n}\n.clickable-row:hover td {\n  background-color: #c8d3fe;\n}\n\n.summa-hub-status {\n  width: 100px;\n  border: 1px solid #71717a;\n  background-color: #f0f3ff;\n  height: auto;\n  overflow: hidden;\n  border-radius: 0.15em;\n  box-sizing: border-box;\n}\n.summa-hub-status .summa-hub-status-icon {\n  float: left;\n  width: 22px;\n  line-height: 25px;\n  padding-left: 4px;\n}\n.summa-hub-status .summa-hub-status-text {\n  float: left;\n  width: 76px;\n  line-height: 25px;\n  font-family: \"Inter\", sans-serif;\n  font-weight: bold;\n}\n.summa-hub-status.online {\n  color: green;\n}\n.summa-hub-statusoffline {\n  color: red;\n}\n\n#select-people ul {\n  height: 60vh;\n  overflow: auto;\n  padding-right: 15px !important;\n}\n\n#select-people ul::-webkit-scrollbar {\n  width: 3px;\n}\n\n#select-people ul::-webkit-scrollbar-thumb {\n  background: #c4c4c4;\n}\n\n#select-people ul {\n  padding: 0;\n  list-style: none;\n}\n\n#sidebar-tracking .title-group {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  margin-bottom: 30px;\n}\n\n#sidebar-tracking .title-group div {\n  display: flex;\n  font-size: 24px;\n  color: #334155;\n  align-items: center;\n}\n\n#sidebar-tracking .title-group p {\n  margin-bottom: 0;\n}\n\n.select-tracking ul li {\n  cursor: pointer;\n  font-size: 14px;\n  color: #f0f3ff;\n  font-weight: 400;\n  padding: 10px 5px 10px 15px;\n  border-bottom: 1px solid #cbd5e1;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  position: relative;\n  text-transform: uppercase;\n}\n\n.select-tracking ul li::before {\n  font-family: \"Font Awesome 6 Free\";\n  font-weight: 900;\n  content: \"\";\n  position: absolute;\n  left: 5px;\n  font-size: 24px;\n  visibility: hidden;\n}\n\n.select-tracking ul#list-people li:hover::before,\n.select-tracking ul#list-people-tracking li:hover::before {\n  visibility: visible;\n}\n\n#list-people-tracking {\n  padding: 0;\n}\n\n.select-tracking ul li:hover {\n  background-color: #f97316;\n  color: #fff;\n  font-weight: 700;\n  padding: 10px 5px 10px 35px;\n}\n\n#select-people ul#list-devices li:hover {\n  padding: 10px 5px 10px 15px;\n  background-color: #fff;\n  color: #0f172a;\n  font-weight: 700;\n  border-bottom: 2px solid #99f6e4;\n}\n\n@media only screen and (max-width: 1390px) {\n  .title-toggle,\n  #analysis-structure .btn-select {\n    font-size: 14px !important;\n  }\n  #analysis-structure i {\n    font-size: 18px !important;\n    margin-right: 3px;\n  }\n  .summa-analysis-header .analytic-heading div #analysis-heading-value {\n    font-size: 30px;\n    line-height: 30px;\n  }\n  .summa-toggle label:after {\n    top: 3px;\n    left: 3px;\n    width: 23px;\n    height: 18px;\n  }\n  .summa-toggle label {\n    width: 40px;\n    height: 24px;\n  }\n  .nav-summa {\n    padding: 0 x;\n  }\n  .nav-summa .nav-item {\n    padding: 0 5px;\n  }\n  .nav-summa .nav-item .nav-link {\n    font-size: 13px;\n    padding: 0 5px;\n  }\n}\n\n.summa-hub-status {\n  width: 100px;\n  border: 1px solid #71717a;\n  background-color: #f0f3ff;\n  height: auto;\n  overflow: hidden;\n  border-radius: 0.15em;\n  box-sizing: border-box;\n}\n\n.summa-hub-status .summa-hub-status-icon {\n  float: left;\n  width: 22px;\n  line-height: 25px;\n  padding-left: 4px;\n}\n\n.summa-hub-status .summa-hub-status-text {\n  float: left;\n  width: 76px;\n  line-height: 25px;\n  font-family: \"Inter\", sans-serif;\n  font-weight: bold;\n}\n\n.summa-hub-status.online {\n  color: green;\n}\n\n.summa-hub-statusoffline {\n  color: red;\n}\n\n.sensor-grid {\n  border-radius: 5px;\n  box-sizing: border-box;\n  border: 1px solid #71717a;\n  overflow: auto;\n  height: auto;\n  width: 162px;\n}\n.sensor-grid .sensor-grid-row {\n  width: 160px;\n}\n.sensor-grid .sensor-grid-row .sensor-grid-cell {\n  float: left;\n  width: 20px;\n  height: 20px;\n  box-sizing: border-box;\n  border: 1px solid #71717a;\n  border-top: none;\n  border-right: none;\n}\n.sensor-grid .sensor-grid-row .sensor-grid-cell.active {\n  background-color: #f97316;\n}\n.sensor-grid .sensor-grid-row .sensor-grid-cell:first-child {\n  border-left: none;\n}\n.sensor-grid .sensor-grid-row:last-child .sensor-grid-cell {\n  border-bottom: none;\n}\n\n.invalid-form-field {\n  color: red;\n  font-size: 8pt;\n}\n\n.event-card {\n  font-size: 9pt;\n}\n\n#floorplan-editor {\n  -webkit-user-select: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n  user-select: none;\n  background-color: white;\n  position: relative;\n  overflow: hidden;\n  background-color: #334155;\n  background-image: linear-gradient(\n      0deg,\n      transparent 9%,\n      rgba(255, 255, 255, 0.2) 10%,\n      rgba(255, 255, 255, 0.2) 12%,\n      transparent 13%,\n      transparent 29%,\n      rgba(255, 255, 255, 0.1) 30%,\n      rgba(255, 255, 255, 0.1) 31%,\n      transparent 32%,\n      transparent 49%,\n      rgba(255, 255, 255, 0.1) 50%,\n      rgba(255, 255, 255, 0.1) 51%,\n      transparent 52%,\n      transparent 69%,\n      rgba(255, 255, 255, 0.1) 70%,\n      rgba(255, 255, 255, 0.1) 71%,\n      transparent 72%,\n      transparent 89%,\n      rgba(255, 255, 255, 0.1) 90%,\n      rgba(255, 255, 255, 0.1) 91%,\n      transparent 92%,\n      transparent\n    ),\n    linear-gradient(\n      90deg,\n      transparent 9%,\n      rgba(255, 255, 255, 0.2) 10%,\n      rgba(255, 255, 255, 0.2) 12%,\n      transparent 13%,\n      transparent 29%,\n      rgba(255, 255, 255, 0.1) 30%,\n      rgba(255, 255, 255, 0.1) 31%,\n      transparent 32%,\n      transparent 49%,\n      rgba(255, 255, 255, 0.1) 50%,\n      rgba(255, 255, 255, 0.1) 51%,\n      transparent 52%,\n      transparent 69%,\n      rgba(255, 255, 255, 0.1) 70%,\n      rgba(255, 255, 255, 0.1) 71%,\n      transparent 72%,\n      transparent 89%,\n      rgba(255, 255, 255, 0.1) 90%,\n      rgba(255, 255, 255, 0.1) 91%,\n      transparent 92%,\n      transparent\n    );\n  background-size: 50px 50px;\n}\n#floorplan-editor .go-back {\n  background: radial-gradient(\n      50% 50% at 50% 50%,\n      rgba(255, 255, 255, 0.2) 0%,\n      rgba(255, 255, 255, 0) 100%\n    ),\n    #5048e5;\n  background-blend-mode: luminosity, normal;\n  border: 1px solid rgba(255, 255, 255, 0.1);\n  box-sizing: border-box;\n  box-shadow: 0px 1px 2px rgba(30, 41, 59, 0.08);\n  background-position: center;\n  background-repeat: no-repeat;\n  z-index: 100;\n  position: absolute;\n  top: 0;\n  margin: 0 50%;\n  border-bottom-left-radius: 5px;\n  border-bottom-right-radius: 5px;\n  padding: 5px 10px;\n  font-size: 12pt;\n  font-family: Inter;\n  cursor: pointer;\n  overflow: hidden;\n}\n#floorplan-editor .editor-loader {\n  position: absolute;\n  height: 100%;\n  width: 100%;\n  z-index: 2000;\n  padding: auto;\n  background: #c8d3fe;\n}\n#floorplan-editor .editor-loader .progress {\n  width: 80%;\n  margin: 50px auto 10px auto;\n}\n#floorplan-editor .editor-loader .progress-label {\n  font-family: Inter;\n  font-size: 14pt;\n  text-align: center;\n  color: black;\n}\n#floorplan-editor .editor-sidebar {\n  background-color: #0f172a;\n  position: absolute;\n  z-index: 1000;\n  -webkit-box-shadow: 0px 0px 15px 0px #000000;\n  box-shadow: 0px 0px 15px 0px #000000;\n}\n#floorplan-editor .editor-sidebar .editor-sidebar-close {\n  color: white;\n  width: 100px;\n  text-align: right;\n  float: right;\n  padding: 10px 20px 0 0;\n  cursor: pointer;\n}\n#floorplan-editor .editor-sidebar .editor .editor-header {\n  margin-top: 40px;\n  padding: 10px 0 0 20px;\n}\n#floorplan-editor .editor-sidebar .editor .editor-header h1.editor-title {\n  color: white;\n  float: left;\n  font-size: 22pt;\n  line-height: 25px;\n}\n#floorplan-editor .editor-sidebar .editor .editor-header .editor-title-edit {\n  margin-top: 10px;\n}\n#floorplan-editor\n  .editor-sidebar\n  .editor\n  .editor-header\n  .editor-title-edit::before {\n  font-family: \"Font Awesome 6 Free\";\n  font-weight: 900;\n  content: \"\";\n  color: #5048e5;\n  font-size: 12pt;\n  padding-left: 10px;\n  cursor: pointer;\n}\n#floorplan-editor .editor-sidebar .editor .editor-header input {\n  background-color: #828df8;\n  display: none;\n  border: none;\n  font-size: 16pt;\n  height: 25px;\n}\n#floorplan-editor .editor-sidebar .editor .tab-controller {\n  overflow: hidden;\n  position: relative;\n  height: auto;\n}\n#floorplan-editor .editor-sidebar .editor .tab-controller .editor-container {\n  padding: 20px;\n  width: 300px;\n  position: absolute;\n  overflow: scroll;\n}\n#floorplan-editor\n  .editor-sidebar\n  .editor\n  .tab-controller\n  .editor-container\n  .btn {\n  width: 100%;\n  background-color: #5048e5;\n  color: white;\n}\n#floorplan-editor\n  .editor-sidebar\n  .editor\n  .tab-controller\n  .editor-container\n  .btn\n  em {\n  margin-right: 5px;\n}\n#floorplan-editor\n  .editor-sidebar\n  .editor\n  .tab-controller\n  .sub-editor-container {\n  width: 300px;\n  position: absolute;\n  left: 300px;\n  overflow: scroll;\n}\n#floorplan-editor\n  .editor-sidebar\n  .editor\n  .tab-controller\n  .sub-editor-container\n  .btn-back {\n  margin-left: 8px;\n}\n#floorplan-editor\n  .editor-sidebar\n  .editor\n  .tab-controller\n  .sub-editor-container\n  .list-group {\n  border: none;\n}\n#floorplan-editor\n  .editor-sidebar\n  .editor\n  .tab-controller\n  .sub-editor-container\n  .list-group\n  .list-group-item {\n  background: transparent;\n  border: none;\n  border-bottom: 1px solid #334155;\n}\n#floorplan-editor\n  .editor-sidebar\n  .editor\n  .tab-controller\n  .sub-editor-container\n  .list-group\n  .list-group-item\n  .btn-summa-add-button {\n  float: right;\n  background-color: #5048e5;\n}\n#floorplan-editor .editor-sidebar .editor .editor-textbox-container {\n  margin-bottom: 1em;\n}\n#floorplan-editor\n  .editor-sidebar\n  .editor\n  .editor-textbox-container\n  .form-label {\n  color: white;\n}\n#floorplan-editor .editor-sidebar .editor .editor-select-container {\n  margin-bottom: 1em;\n}\n#floorplan-editor .editor-sidebar .editor .editor-select-container .form-label {\n  color: white;\n}\n#floorplan-editor .editor-sidebar .editor hr.editor-separator {\n  border-color: #aaa;\n}\n#floorplan-editor .group {\n  position: absolute;\n  width: 40px;\n  height: 40px;\n  border-radius: 100%;\n  background: radial-gradient(\n      50% 50% at 50% 50%,\n      rgba(255, 255, 255, 0.2) 0%,\n      rgba(255, 255, 255, 0) 100%\n    ),\n    #5048e5;\n  background-blend-mode: luminosity, normal;\n  border: 1px solid rgba(255, 255, 255, 0.1);\n  box-sizing: border-box;\n  box-shadow: 0px 1px 2px rgba(30, 41, 59, 0.08);\n  /* // background-image: url(\"./../svg/icon.group.svg\"); */\n  background-position: center;\n  background-repeat: no-repeat;\n  z-index: 100;\n  -webkit-box-shadow: 0px 0px 15px 0px #000000;\n  box-shadow: 0px 0px 15px 0px #000000;\n}\n#floorplan-editor .group.selected {\n  border-width: 4px;\n  border-color: #99f6e4;\n  z-index: 101;\n}\n#floorplan-editor .group.selected .group-label {\n  margin: -3px 0 0 -3px;\n}\n#floorplan-editor .group.hovered,\n#floorplan-editor .group:hover {\n  border-width: 4px;\n  border-color: #99f6e4;\n  z-index: 101;\n}\n#floorplan-editor .group.hovered .group-label,\n#floorplan-editor .group:hover .group-label {\n  margin: -3px 0 0 -3px;\n}\n#floorplan-editor .group.is-loading.hovered,\n#floorplan-editor .group.is-loading:hover {\n  border-width: 0;\n}\n#floorplan-editor .group.is-loading.hovered .group-label,\n#floorplan-editor .group.is-loading:hover .group-label {\n  margin: 1px;\n}\n#floorplan-editor .group.is-loading.hovered .loader,\n#floorplan-editor .group.is-loading:hover .loader {\n  margin: -20px 0 0 0px;\n}\n#floorplan-editor .group .group-label {\n  background: #ddd;\n  border: 1px solid #eee;\n  border-radius: 3px;\n  color: black;\n  white-space: nowrap;\n  width: 80px;\n  left: -20px;\n  font-size: 8pt;\n  text-align: center;\n  position: relative;\n  top: 50px;\n  opacity: 0.7;\n}\n#floorplan-editor .device {\n  position: absolute;\n  width: 40px;\n  height: 40px;\n  border-radius: 100%;\n  background: radial-gradient(\n      50% 50% at 50% 50%,\n      rgba(255, 255, 255, 0.2) 0%,\n      rgba(255, 255, 255, 0) 100%\n    ),\n    #5048e5;\n  background-blend-mode: luminosity, normal;\n  border: 1px solid rgba(255, 255, 255, 0.1);\n  box-sizing: border-box;\n  box-shadow: 0px 1px 2px rgba(30, 41, 59, 0.08);\n  /* // background-image: url(\"./../svg/icon.light-bulb-off.svg\"); */\n  background-position: center;\n  background-repeat: no-repeat;\n  z-index: 100;\n  -webkit-box-shadow: 0px 0px 15px 0px #000000;\n  box-shadow: 0px 0px 15px 0px #000000;\n}\n#floorplan-editor .device.selected {\n  border-width: 4px;\n  border-color: #99f6e4;\n  z-index: 101;\n}\n#floorplan-editor .device.selected .group-label {\n  margin: -3px 0 0 -3px;\n}\n#floorplan-editor .device.not-scanned {\n  background-color: #334155;\n}\n#floorplan-editor .device.hovered,\n#floorplan-editor .device:hover {\n  border-width: 4px;\n  border-color: #99f6e4;\n  z-index: 101;\n}\n#floorplan-editor .device.hovered .group-label,\n#floorplan-editor .device:hover .group-label {\n  margin: -3px 0 0 -3px;\n}\n#floorplan-editor .device .group-label {\n  background: #ddd;\n  border: 1px solid #eee;\n  border-radius: 3px;\n  color: black;\n  white-space: nowrap;\n  width: 80px;\n  left: -20px;\n  font-size: 8pt;\n  text-align: center;\n  position: relative;\n  top: 50px;\n  opacity: 0.7;\n}\n#floorplan-editor .loader {\n  border: 4px solid #99f6e4;\n  border-top: 4px solid transparent;\n  border-radius: 50%;\n  width: 40px;\n  height: 40px;\n  animation: spin 1s linear infinite;\n  margin-top: -19px;\n}\n#floorplan-editor .light-value-container .heading {\n  text-align: right;\n  color: #a1a1aa;\n  font-family: Inter;\n  font-size: 16px;\n  font-style: normal;\n  font-weight: 700;\n  line-height: 34px;\n  letter-spacing: 0em;\n}\n#floorplan-editor .light-value-container .value-indicator {\n  float: right;\n  width: 40px;\n  height: 40px;\n  background-color: #5048e5;\n  margin-right: 20px;\n  border-radius: 100%;\n  margin-top: 20px;\n  border: 4px solid white;\n}\n#floorplan-editor .light-value-container .value {\n  float: right;\n  font-family: Dosis;\n  font-size: 66px;\n  font-style: normal;\n  font-weight: 700;\n  line-height: 66px;\n  letter-spacing: 0.36px;\n  text-align: right;\n  color: #ffffff;\n}\n#floorplan-editor .light-value-container .footing {\n  clear: both;\n  text-align: right;\n  font-family: Inter;\n  font-size: 16px;\n  font-style: normal;\n  font-weight: 700;\n  line-height: 34px;\n  letter-spacing: 0em;\n  text-align: right;\n  color: #f97316;\n}\n#floorplan-editor .cct-slider input[type=\"range\"] {\n  -webkit-appearance: none;\n  margin: 10px 0;\n  width: 100%;\n}\n#floorplan-editor .cct-slider input[type=\"range\"]:focus {\n  outline: none;\n}\n#floorplan-editor\n  .cct-slider\n  input[type=\"range\"]::-webkit-slider-runnable-track {\n  width: 100%;\n  height: 27px;\n  cursor: pointer;\n  animate: 0.2s;\n  box-shadow: 0px 0px 0px #000000;\n  /* // background: url(\"./../imgs/kelvin_gradient.png\"); */\n  background-size: 100%;\n  border: 0px solid #000000;\n}\n#floorplan-editor .cct-slider input[type=\"range\"]::-webkit-slider-thumb {\n  box-shadow: 0px 0px 1px #000000;\n  border: 0px solid #000000;\n  height: 39px;\n  width: 20px;\n  background: #ffffff;\n  cursor: pointer;\n  -webkit-appearance: none;\n  margin-top: -6px;\n}\n#floorplan-editor\n  .cct-slider\n  input[type=\"range\"]:focus::-webkit-slider-runnable-track {\n  /* // background: url(\"./../imgs/kelvin_gradient.png\"); */\n  background-size: 100%;\n}\n#floorplan-editor .cct-slider input[type=\"range\"]::-moz-range-track {\n  width: 100%;\n  height: 27px;\n  cursor: pointer;\n  animate: 0.2s;\n  box-shadow: 0px 0px 0px #000000;\n  /* // background: url(\"./../imgs/kelvin_gradient.png\"); */\n  background-size: 100%;\n  border: 0px solid #000000;\n}\n#floorplan-editor .cct-slider input[type=\"range\"]::-moz-range-thumb {\n  box-shadow: 0px 0px 1px #000000;\n  border: 0px solid #000000;\n  height: 39px;\n  width: 20px;\n  background: #ffffff;\n  cursor: pointer;\n}\n#floorplan-editor .cct-slider input[type=\"range\"]::-ms-track {\n  width: 100%;\n  height: 27px;\n  cursor: pointer;\n  animate: 0.2s;\n  background: transparent;\n  border-color: transparent;\n  color: transparent;\n}\n#floorplan-editor .cct-slider input[type=\"range\"]::-ms-fill-lower {\n  /* // background: url(\"./../imgs/kelvin_gradient.png\"); */\n  background-size: 100%;\n  border: 0px solid #000000;\n  box-shadow: 0px 0px 0px #000000;\n}\n#floorplan-editor .cct-slider input[type=\"range\"]::-ms-fill-upper {\n  /* // background: url(\"./../imgs/kelvin_gradient.png\"); */\n  background-size: 100%;\n  border: 0px solid #000000;\n  box-shadow: 0px 0px 0px #000000;\n}\n#floorplan-editor .cct-slider input[type=\"range\"]::-ms-thumb {\n  box-shadow: 0px 0px 1px #000000;\n  border: 0px solid #000000;\n  height: 39px;\n  width: 20px;\n  background: #ffffff;\n  cursor: pointer;\n}\n#floorplan-editor .cct-slider input[type=\"range\"]:focus::-ms-fill-lower {\n  /* // background: url(\"./../imgs/kelvin_gradient.png\"); */\n  background-size: 100%;\n}\n#floorplan-editor .cct-slider input[type=\"range\"]:focus::-ms-fill-upper {\n  /* // background: url(\"./../imgs/kelvin_gradient.png\"); */\n  background-size: 100%;\n}\n#floorplan-editor .dimmer input[type=\"range\"] {\n  -webkit-appearance: none;\n  margin: 10px 0;\n  width: 100%;\n}\n#floorplan-editor .dimmer input[type=\"range\"]:focus {\n  outline: none;\n}\n#floorplan-editor .dimmer input[type=\"range\"]::-webkit-slider-runnable-track {\n  width: 100%;\n  height: 27px;\n  cursor: pointer;\n  animate: 0.2s;\n  box-shadow: 0px 0px 0px #000000;\n  border: 0px solid #000000;\n}\n#floorplan-editor .dimmer input[type=\"range\"]::-webkit-slider-thumb {\n  box-shadow: 0px 0px 1px #000000;\n  border: 0px solid #000000;\n  height: 39px;\n  width: 20px;\n  background: #ffffff;\n  cursor: pointer;\n  -webkit-appearance: none;\n  margin-top: -6px;\n}\n#floorplan-editor .dimmer input[type=\"range\"]::-moz-range-track {\n  width: 100%;\n  height: 27px;\n  cursor: pointer;\n  animate: 0.2s;\n  box-shadow: 0px 0px 0px #000000;\n  border: 0px solid #000000;\n}\n#floorplan-editor .dimmer input[type=\"range\"]::-moz-range-thumb {\n  box-shadow: 0px 0px 1px #000000;\n  border: 0px solid #000000;\n  height: 39px;\n  width: 20px;\n  background: #ffffff;\n  cursor: pointer;\n}\n#floorplan-editor .dimmer input[type=\"range\"]::-ms-track {\n  width: 100%;\n  height: 27px;\n  cursor: pointer;\n  animate: 0.2s;\n  background: transparent;\n  border-color: transparent;\n  color: transparent;\n}\n#floorplan-editor .dimmer input[type=\"range\"]::-ms-fill-lower {\n  border: 0px solid #000000;\n  box-shadow: 0px 0px 0px #000000;\n}\n#floorplan-editor .dimmer input[type=\"range\"]::-ms-fill-upper {\n  border: 0px solid #000000;\n  box-shadow: 0px 0px 0px #000000;\n}\n#floorplan-editor .dimmer input[type=\"range\"]::-ms-thumb {\n  box-shadow: 0px 0px 1px #000000;\n  border: 0px solid #000000;\n  height: 39px;\n  width: 20px;\n  background: #ffffff;\n  cursor: pointer;\n}\n#floorplan-editor .zoombox {\n  background-color: rgba(204, 249, 255, 0.2);\n  border: 1px solid #ccf9ff;\n  position: absolute;\n  z-index: 1001;\n}\n#floorplan-editor .tmpbox {\n  background-color: red;\n  width: 10px;\n  height: 10px;\n  position: absolute;\n}\n#floorplan-editor .layer-list {\n  width: 200px;\n  float: left;\n  background: #e2e8f0;\n  padding-right: 2em;\n}\n#floorplan-editor .layer-list .list-group {\n  background-color: transparent;\n  border: none;\n}\n#floorplan-editor .layer-list .list-group .list-group-item {\n  background: transparent;\n  border: none;\n  border-bottom: 1px solid #334155;\n  color: black;\n  border-radius: 0;\n  cursor: pointer;\n}\n#floorplan-editor .layer-list .list-group .list-group-item:hover {\n  border-bottom-width: 3px;\n}\n#floorplan-editor .layer-list .list-group .list-group-item.selected {\n  font-weight: bold;\n}\n#floorplan-editor\n  .layer-list\n  .list-group\n  .list-group-item\n  .btn-summa-add-button {\n  float: right;\n  background-color: #5048e5;\n}\n\n@keyframes spin {\n  0% {\n    transform: rotate(0deg);\n  }\n  100% {\n    transform: rotate(360deg);\n  }\n}\n\n.abc123 {\n  display: none;\n}\n\n.card {\n  background-color: #fff;\n  border: 1px solid #ddd;\n}\n\n.card .card-header {\n  background-color: #334155;\n}\n\n.card .card-body p {\n  color: #0f172a;\n  font-size: 10pt;\n  font: \"Dosis\", sans-serif;\n}\n\n.card .card-body hr {\n  color: #334155;\n}\n\n.card .card-body .property {\n  font-size: 10pt;\n  color: #0f172a;\n}\n\n.card .card-body .property strong {\n  margin-right: 0.3em;\n}\n\n.card .card-body .relation {\n  font-size: 10pt;\n  color: #0f172a;\n}\n\n.card .card-body .relation::before {\n  font-family: \"Font Awesome 6 Free\";\n  font-weight: 900;\n  content: \"\";\n  margin-right: 0.2em;\n}\n\n.card .card-footer {\n  background-color: #334155;\n}\n\n.card ul.list-group li {\n  background: transparent;\n  color: #0f172a;\n  font-family: \"Dosis\", sans-serif;\n  font-size: 10pt;\n  border: none;\n}\n\n.card .fixed-table-toolbar {\n  padding-right: 0.5em;\n  background-color: #334155;\n}\n\n.card .fixed-table-pagination {\n  color: #0f172a;\n  font-size: 8pt;\n  font-family: \"Dosis\", sans-serif;\n  padding-left: 0.5em;\n}\n\n.card .fixed-table-pagination ul.pagination {\n  margin-right: 0.5em !important;\n}\n\n.card .fixed-table-pagination ul.pagination li.page-item.active {\n  font-weight: bold;\n}\n\n.card .fixed-table-pagination ul.pagination li.page-item.active a.page-link {\n  background-color: #5048e5;\n}\n\n.card .fixed-table-pagination ul.pagination li.page-item a.page-link {\n  background-color: #c8d3fe;\n}\n\n.card table.table-summa {\n  border: none;\n}\n\n.card table.table-summa thead tr th {\n  color: #0f172a;\n  font-family: \"Dosis\", sans-serif;\n  font-size: 10pt;\n  font-weight: bold;\n}\n\n.card table.table-summa tbody tr {\n  border-bottom: 1px solid #ddd;\n}\n\n.card table.table-summa tbody tr td {\n  color: #0f172a;\n  font-size: 10pt;\n}\n\n#project-dashboard .card .card-body-scroller,\n#reseller-dashboard .card .card-body-scroller {\n  height: 300px;\n  overflow-y: auto;\n  background-color: #f0f3ff;\n}\n\n#project-dashboard .card .card-body-scroller .dashboard-loader,\n#reseller-dashboard .card .card-body-scroller .dashboard-loader {\n  font-size: 60px;\n  text-align: center;\n  color: #334155;\n  height: 100%;\n  opacity: 0.5;\n  padding: 30px;\n}\n\n#project-dashboard .card .card-body-scroller canvas,\n#reseller-dashboard .card .card-body-scroller canvas {\n  margin: 0.5em;\n}\n\n#project-dashboard .card .card-body-scroller .dashboard-card-label,\n#reseller-dashboard .card .card-body-scroller .dashboard-card-label {\n  color: #71717a;\n  width: 100%;\n  text-align: center;\n  line-height: 3em;\n  font-family: \"Dosis\", sans-serif;\n}\n\n#project-dashboard .card .card-body-scroller .dashboard-card-value,\n#reseller-dashboard .card .card-body-scroller .dashboard-card-value {\n  font-family: \"Dosis\", sans-serif;\n  color: #0f172a;\n  width: 100%;\n  text-align: center;\n  font-size: 70pt;\n  font-weight: bolder;\n  line-height: 70pt;\n}\n\n#project-dashboard .card .card-body-scroller .dashboard-card-value:first-child,\n#reseller-dashboard\n  .card\n  .card-body-scroller\n  .dashboard-card-value:first-child {\n  color: red;\n}\n\n#project-dashboard .card .card-body-scroller .dashboard-card-value:last-child,\n#reseller-dashboard .card .card-body-scroller .dashboard-card-value:last-child {\n  color: green;\n}\n\n#project-dashboard .card .card-body-scroller .current-usage,\n#reseller-dashboard .card .card-body-scroller .current-usage {\n  font-family: \"Dosis\", sans-serif;\n  font-size: 16pt;\n  color: #0f172a;\n  padding-left: 1em;\n  font-weight: bold;\n}\n\n#project-dashboard .card .card-body-scroller .current-usage small,\n#reseller-dashboard .card .card-body-scroller .current-usage small {\n  font-size: 12pt;\n  font-weight: normal;\n  margin-left: 0.25em;\n}\n\n#project-dashboard .card .card-body-scroller table.table thead tr th,\n#reseller-dashboard .card .card-body-scroller table.table thead tr th {\n  font-size: 10pt;\n  line-height: 11pt;\n  color: #0f172a;\n  border-bottom: 1px solid #ddd;\n}\n\n#project-dashboard .card .card-body-scroller table.table tbody tr,\n#reseller-dashboard .card .card-body-scroller table.table tbody tr {\n  background-color: none !important;\n}\n\n#project-dashboard .card .card-body-scroller table.table tbody tr td,\n#reseller-dashboard .card .card-body-scroller table.table tbody tr td {\n  font-size: 10pt;\n  line-height: 11pt;\n  color: #0f172a;\n  border-bottom: 1px solid #ddd;\n}\n\n#project-dashboard .card .card-body-scroller table.table tbody tr td em,\n#reseller-dashboard .card .card-body-scroller table.table tbody tr td em {\n  color: #f97316;\n}\n\n#project-dashboard .card .card-body-scroller table.table tbody tr td a,\n#reseller-dashboard .card .card-body-scroller table.table tbody tr td a {\n  text-decoration: none;\n  color: #0f172a;\n}\n\n#project-dashboard .card .card-body-scroller table.table tbody tr td a:hover,\n#reseller-dashboard .card .card-body-scroller table.table tbody tr td a:hover {\n  color: #5048e5;\n}\n\n#project-dashboard .card .card-body-scroller table.table tbody tr.unread td,\n#reseller-dashboard .card .card-body-scroller table.table tbody tr.unread td {\n  background-color: #c8d3fe;\n  font-weight: bold;\n}\n\n#project-dashboard .card .card-header,\n#reseller-dashboard .card .card-header {\n  background-color: #f0f3ff;\n  color: #0f172a;\n  font-family: \"Inter\", sans-serif;\n  font-size: 10pt;\n  font-weight: bold;\n  line-height: 30px;\n}\n\n#project-dashboard .card .card-header a,\n#reseller-dashboard .card .card-header a {\n  color: #0f172a;\n}\n\n#project-dashboard .card .card-header a:hover,\n#reseller-dashboard .card .card-header a:hover {\n  text-decoration: none;\n}\n\n#project-dashboard .card .card-header .dropdown-toggle::after,\n#reseller-dashboard .card .card-header .dropdown-toggle::after {\n  display: none;\n}\n\n#project-dashboard .card .card-header .dropdown-menu,\n#reseller-dashboard .card .card-header .dropdown-menu {\n  background-color: #f0f3ff;\n}\n\n#project-dashboard .card .card-header .dropdown-menu .dropdown-item:hover,\n#reseller-dashboard .card .card-header .dropdown-menu .dropdown-item:hover {\n  background-color: #c8d3fe;\n}\n\n#project-dashboard .card .card-body,\n#reseller-dashboard .card .card-body {\n  background-color: #f0f3ff;\n  color: #0f172a;\n  font-size: 9pt;\n}\n\n#project-dashboard .card .card-body.todo-item,\n#reseller-dashboard .card .card-body.todo-item {\n  margin-bottom: 0;\n  padding-bottom: 0;\n}\n\n#project-dashboard .card .card-body.todo-item .todo-item-details,\n#reseller-dashboard .card .card-body.todo-item .todo-item-details {\n  border-bottom: 1px solid #ddd;\n}\n\n#project-dashboard\n  .card\n  .card-body.todo-item\n  .todo-item-details\n  .todo-item-related-links,\n#reseller-dashboard\n  .card\n  .card-body.todo-item\n  .todo-item-details\n  .todo-item-related-links {\n  margin: 1em;\n}\n\n#project-dashboard .card .card-body:last-of-type .todo-item-details,\n#reseller-dashboard .card .card-body:last-of-type .todo-item-details {\n  border-bottom: none;\n}\n\n#project-dashboard .card .card-body label,\n#reseller-dashboard .card .card-body label {\n  font-weight: bold;\n}\n\n#project-dashboard .card .card-body .todo-item-details,\n#reseller-dashboard .card .card-body .todo-item-details {\n  margin-bottom: 0.25em;\n}\n\n#project-dashboard .card .card-body .todo-item-related-links a,\n#reseller-dashboard .card .card-body .todo-item-related-links a {\n  clear: both;\n  display: block;\n}\n\n#project-dashboard .card .card-body .todo-item-related-links a em,\n#reseller-dashboard .card .card-body .todo-item-related-links a em {\n  margin-right: 0.5em;\n}\n\n#project-dashboard .card .card-body .active-scenario-row,\n#reseller-dashboard .card .card-body .active-scenario-row {\n  color: #333;\n}\n\n#project-dashboard\n  .card\n  .card-body\n  .active-scenario-row\n  .active-scenario-group-name,\n#reseller-dashboard\n  .card\n  .card-body\n  .active-scenario-row\n  .active-scenario-group-name {\n  font-weight: bold;\n}\n\n#project-dashboard .card .card-body .active-scenario-subrow,\n#reseller-dashboard .card .card-body .active-scenario-subrow {\n  margin-bottom: 1em;\n  margin-left: 1em;\n}\n\n#project-dashboard .card .card-body .status-project-name,\n#reseller-dashboard .card .card-body .status-project-name {\n  line-height: 80px;\n  font-weight: bold;\n}\n\n#project-dashboard .card .card-body .status-project-name a,\n#reseller-dashboard .card .card-body .status-project-name a {\n  text-decoration: none;\n  color: #0f172a;\n}\n\n#project-dashboard .card .card-body .status-project-name a:hover,\n#reseller-dashboard .card .card-body .status-project-name a:hover {\n  color: #5048e5;\n}\n\n#project-dashboard .card .card-body .status-icon-container,\n#reseller-dashboard .card .card-body .status-icon-container {\n  line-height: 80px;\n}\n\n#project-dashboard .card .card-body .status-icon-container .status-icon,\n#reseller-dashboard .card .card-body .status-icon-container .status-icon {\n  font-size: 30pt;\n  color: #5048e5;\n  position: relative;\n}\n\n#project-dashboard .card .card-body .status-icon-container .status-icon .badge,\n#reseller-dashboard\n  .card\n  .card-body\n  .status-icon-container\n  .status-icon\n  .badge {\n  font-size: 6pt;\n  background-color: #71717a;\n}\n\n#project-dashboard\n  .card\n  .card-body\n  .status-icon-container\n  .status-icon\n  .rounded-circle,\n#reseller-dashboard\n  .card\n  .card-body\n  .status-icon-container\n  .status-icon\n  .rounded-circle {\n  border: 1px solid #f0f3ff !important;\n  font-size: 8pt;\n  color: #fff;\n  width: 20px;\n  height: 20px;\n  background-color: #71717a;\n  box-sizing: border-box;\n}\n\n#project-dashboard\n  .card\n  .card-body\n  .status-icon-container\n  .status-icon\n  .rounded-circle\n  i,\n#reseller-dashboard\n  .card\n  .card-body\n  .status-icon-container\n  .status-icon\n  .rounded-circle\n  i {\n  width: 18px;\n  height: 18px;\n  line-height: 18px;\n}\n\n#project-dashboard .card .card-footer,\n#reseller-dashboard .card .card-footer {\n  background-color: #f0f3ff;\n  display: flex;\n  height: 50px;\n}\n\n#project-dashboard .card .card-footer .btn-dashboard,\n#reseller-dashboard .card .card-footer .btn-dashboard {\n  background-color: #f0f3ff;\n  color: #5048e5;\n  margin: 0 auto;\n  height: 30px;\n}\n\n#project-dashboard .card .hub-status .hub-status-indicator,\n#reseller-dashboard .card .hub-status .hub-status-indicator {\n  border-radius: 5px;\n  width: 100%;\n  height: 20px;\n  font-family: \"Inter\", sans-serif;\n}\n\n#project-dashboard .card .scroll_indicator,\n#reseller-dashboard .card .scroll_indicator {\n  position: absolute;\n  margin: 0 auto;\n  background-color: #334155;\n  width: 40px;\n  height: 40px;\n  line-height: 40px;\n  bottom: 50px;\n  right: 10px;\n  font-size: 20pt;\n  border-radius: 50%;\n  box-sizing: border-box;\n  text-align: center;\n  opacity: 0;\n}\n\n#project-dashboard .card a.link,\n#reseller-dashboard .card a.link {\n  background-color: #5048e5;\n  height: 32px !important;\n  border-radius: 4px !important;\n  padding: 3px 6px !important;\n  line-height: 32px !important;\n  font-size: 8pt !important;\n  font-family: \"Inter\", sans-serif;\n  color: #fff;\n  text-decoration: none;\n  line-height: 32px;\n  margin-right: 1em;\n}\n\n#project-dashboard .card a.link:last-of-type,\n#reseller-dashboard .card a.link:last-of-type {\n  margin-right: 0;\n}\n\n.main-dashboard::-webkit-scrollbar {\n  width: 3px;\n}\n\n#project-scenario-control .group-tile {\n  background-color: #f97316;\n  width: 100%;\n  border-radius: 0.25rem;\n  position: relative;\n  cursor: pointer;\n  overflow: hidden;\n}\n\n#project-scenario-control .group-tile:after {\n  content: \"\";\n  display: block;\n  padding-bottom: 80%;\n}\n\n#project-scenario-control .group-tile.icon-light {\n  /* // background-image: url(\"data:image/svg+xml;utf8,<svg width='92' height='92' viewBox='0 0 92 92' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M68.9998 15.3333L76.6665 26.8333H65.1665L57.4998 15.3333H49.8332L57.4998 26.8333H45.9998L38.3332 15.3333H30.6665L38.3332 26.8333H26.8332L19.1665 15.3333H15.3332C11.1165 15.3333 7.70484 18.7833 7.70484 23L7.6665 69C7.6665 73.2167 11.1165 76.6667 15.3332 76.6667H76.6665C80.8832 76.6667 84.3332 73.2167 84.3332 69V15.3333H68.9998ZM43.1248 58.4583L38.3332 69L33.5415 58.4583L22.9998 53.6667L33.5415 48.875L38.3332 38.3333L43.1248 48.875L53.6665 53.6667L43.1248 58.4583ZM64.9365 45.77L61.3332 53.6667L57.7298 45.77L49.8332 42.1667L57.7298 38.5633L61.3332 30.6667L64.9365 38.5633L72.8332 42.1667L64.9365 45.77Z' fill='white'/></svg>\"); */\n  background-repeat: no-repeat;\n  background-position: center;\n}\n\n#project-scenario-control .group-tile.icon-light.off {\n  /* // background-image: url(\"data:image/svg+xml;utf8,<svg width='48' height='63' viewBox='0 0 48 63' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M15.0414 43.1667H32.9546M10.4453 37.5547C7.76526 34.874 5.94031 31.4588 5.20117 27.741C4.46203 24.0231 4.84189 20.1696 6.29272 16.6676C7.74355 13.1657 10.2002 10.1726 13.352 8.06673C16.5039 5.96089 20.2093 4.83691 23.9999 4.83691C27.7905 4.83691 31.496 5.96089 34.6478 8.06673C37.7997 10.1726 40.2563 13.1657 41.7071 16.6676C43.158 20.1696 43.5378 24.0231 42.7987 27.741C42.0595 31.4588 40.2346 34.874 37.5546 37.5547L35.4539 39.6515C34.253 40.8527 33.3004 42.2786 32.6506 43.848C32.0007 45.4173 31.6664 47.0993 31.6666 48.7978V50.8333C31.6666 52.8667 30.8589 54.8167 29.4211 56.2545C27.9833 57.6923 26.0333 58.5 23.9999 58.5C21.9666 58.5 20.0166 57.6923 18.5788 56.2545C17.141 54.8167 16.3333 52.8667 16.3333 50.8333V48.7978C16.3333 45.367 14.9686 42.0742 12.5459 39.6515L10.4453 37.5547Z' stroke='#94A3B8' stroke-width='8' stroke-linecap='round' stroke-linejoin='round'/></svg>\"); */\n}\n\n#project-scenario-control .group-tile.icon-light.glow {\n  /* // background-image: url(\"data:image/svg+xml;utf8,<svg width='110' height='110' viewBox='0 0 110 110' fill='none' xmlns='http://www.w3.org/2000/svg'><g filter='url(#filter0_d_302_95753)'><path d='M46.0415 74.1667H63.9547M55 20.5V24.3333M79.3953 30.6047L76.6852 33.3148M89.5 55H85.6667M24.3333 55H20.5M33.3148 33.3148L30.6047 30.6047M41.4453 68.5547C38.7653 65.874 36.9404 62.4588 36.2012 58.7409C35.4621 55.0231 35.842 51.1696 37.2928 47.6676C38.7436 44.1657 41.2003 41.1726 44.3521 39.0667C47.5039 36.9609 51.2094 35.8369 55 35.8369C58.7906 35.8369 62.4961 36.9609 65.6479 39.0667C68.7997 41.1726 71.2564 44.1657 72.7072 47.6676C74.158 51.1696 74.5379 55.0231 73.7988 58.7409C73.0596 62.4588 71.2347 65.874 68.5547 68.5547L66.454 70.6515C65.253 71.8527 64.3005 73.2786 63.6506 74.848C63.0008 76.4173 62.6664 78.0993 62.6667 79.7978V81.8333C62.6667 83.8667 61.8589 85.8167 60.4211 87.2545C58.9834 88.6923 57.0333 89.5 55 89.5C52.9667 89.5 51.0166 88.6923 49.5788 87.2545C48.1411 85.8167 47.3333 83.8667 47.3333 81.8333V79.7978C47.3333 76.367 45.9687 73.0742 43.546 70.6515L41.4453 68.5547Z' stroke='white' stroke-width='8' stroke-linecap='round' stroke-linejoin='round'/></g><defs><filter id='filter0_d_302_95753' x='-7' y='-7' width='124' height='124' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'><feFlood flood-opacity='0' result='BackgroundImageFix'/><feColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/><feOffset/><feGaussianBlur stdDeviation='8'/><feColorMatrix type='matrix' values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 0 0 0 0 0.5 0'/><feBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_302_95753'/><feBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_302_95753' result='shape'/></filter></defs></svg>\"); */\n}\n\n#project-scenario-control .group-tile .scenario-tile-name {\n  color: #000;\n  font-size: 10pt;\n  font-weight: bold;\n  text-align: center;\n  height: 20%;\n  box-sizing: border-box;\n  padding-top: 1em;\n}\n\n#project-scenario-control .group-tile .current-value {\n  position: absolute;\n  bottom: 1.25em;\n  width: 100%;\n  text-align: center;\n  font-size: 10pt;\n}\n\n#project-scenario-control .group-tile .current-value span {\n  display: inline-block;\n  background: rgba(15, 23, 42, 0.1);\n  padding: 0 0.25em;\n}\n\n.btn-xs {\n  display: inline-block !important;\n  padding: 0.35em 0.65em !important;\n  font-size: 0.75em !important;\n  font-weight: 700 !important;\n  line-height: 1 !important;\n  color: #fff !important;\n  text-align: center !important;\n  white-space: nowrap !important;\n  vertical-align: baseline !important;\n  border-radius: 0.25rem !important;\n  height: auto !important;\n}\n\n.event-handler-preconditions {\n  line-height: 20px;\n}\n.event-handler-preconditions .variable {\n  font-family: \"Ubuntu Mono\", monospace;\n  background-color: #ddd;\n  border-radius: 2px;\n  padding: 0 5px;\n  color: green;\n}\n.event-handler-preconditions .comparison {\n  font-family: \"Ubuntu Mono\", monospace;\n  background-color: #ddd;\n  border-radius: 2px;\n  padding: 0 5px;\n  font-weight: bold;\n  text-align: center;\n}\n.event-handler-preconditions .value {\n  font-family: \"Ubuntu Mono\", monospace;\n  background-color: #ddd;\n  border-radius: 2px;\n  padding: 0 5px;\n  text-align: center;\n}\n.event-handler-preconditions .time-condition {\n  font-family: \"Ubuntu Mono\", monospace;\n  background-color: #ddd;\n  border-radius: 2px;\n  padding: 0 5px;\n  font-weight: bold;\n}\n.event-handler-preconditions .time-value {\n  font-family: \"Ubuntu Mono\", monospace;\n  background-color: #ddd;\n  border-radius: 2px;\n  padding: 0 5px;\n  text-align: center;\n}\n\n.loading {\n  /* // background-image: url(\"./../imgs/loading.gif\"); */\n  background-repeat: no-repeat;\n  background-position: 10px;\n}\n", ""]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ 4953:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(8081);
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3645);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, ".container-structure {\n}\n.box-header {\n  height: 145px;\n}\n.padding-0 {\n  padding: 0;\n}\n.header {\n  height: 100%;\n  border-bottom: 4px solid #ffffff;\n  align-content: space-between;\n  flex-direction: column;\n  justify-content: space-between;\n  padding: 16px 0;\n  width: 100%;\n}\n.layout-left {\n  padding-left: 50px;\n  background-color: #334155;\n  height: 115vh;\n}\n.layout-right {\n  height: 115vh;\n  padding-right: 50px;\n  background-color: #212c40;\n}\n.layout-left .bottom-header h2 {\n  font-size: 20px;\n  font-weight: bold;\n  color: #ffffff !important;\n  line-height: 0px;\n}\n.layout-left .bottom-header .d-flex i {\n  color: #f97316;\n  font-size: 24px;\n}\n.layout-left .bottom-header .icon-arrow {\n  color: #374151;\n  margin-left: 18px;\n}\n.layout-left .top-header {\n  color: #828df8;\n  font-size: 20px;\n  font-weight: bold;\n  font-family: \"Inter\";\n  cursor: pointer;\n}\n.layout-right .bottom-header {\n  justify-content: space-between;\n}\n.layout-right .bottom-header > div {\n  padding-left: 24px;\n  color: #f0f3ff;\n  font-size: 20px;\n  padding-top: 2px;\n  font-weight: bold;\n  font-family: \"Inter\";\n}\n.layout-right .bottom-header button,\n.layout-left .bottom-header button {\n  font-size: 14px !important;\n  height: 32px;\n}\n.expanded-view {\n  background-color: #c8d3fe;\n  width: 149px;\n  height: 32px;\n  border-radius: 4px;\n  color: #5048e5;\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n.col-0 {\n  width: 0;\n}\n.row .padding-0 {\n  transition: all 0.4s;\n}\n.layout-left .contain-list {\n  justify-content: space-between;\n  align-items: center;\n}\n.layout-left .contain-list .box-title {\n  justify-content: space-between;\n  padding: 10px 32px 10px 0;\n  width: 100%;\n}\n.layout-left .box-title .title {\n  font-size: 14px;\n  font-weight: bold;\n  color: #f0f3ff;\n  font-family: \"Inter\";\n  display: flex;\n  align-items: center;\n}\n.d-flex.middle {\n  justify-content: space-between;\n  align-items: center;\n}\n.layout-left .bottom-header {\n  position: relative;\n}\n.layout-left .nav {\n  list-style: none;\n  position: absolute;\n  background-color: #fff;\n  width: 250px;\n  left: 0;\n  padding: 0 !important;\n  margin: 0;\n  border-top: 1px solid #cbd5e1;\n  display: none !important;\n  z-index: 99;\n  top: 22px;\n}\n.layout-left ul {\n  list-style: none;\n  margin: 0;\n  padding: 0;\n  width: 100%;\n}\n.layout-left .bottom-header .d-flex:hover .nav {\n  display: flex !important;\n}\n.layout-left .nav li {\n  margin: 0;\n  padding: 0 10px;\n  display: flex;\n  align-items: center;\n  justify-content: flex-start;\n  position: relative;\n  border-bottom: 1px solid #cbd5e1;\n  cursor: pointer;\n  height: 44px;\n}\n\n.layout-left .nav li i {\n  color: #334155 !important;\n  margin-right: 5px;\n  font-size: 16px !important;\n}\n\n/* .layout-left .nav li:hover {\n  background-color: #cbd5e1;\n} */\n\n.layout-left .nav li:hover > span {\n  color: #0f172a;\n}\n\n.layout-left .nav li span {\n  display: flex;\n  align-items: center;\n  font-size: 16px;\n  color: #5048e5;\n}\n.table-floors {\n  padding-right: 32px;\n}\n.contain-list table td {\n  color: #f0f3ff;\n  font-size: 16px;\n  height: 44px;\n  border-top: unset;\n}\n.contain-list .total-layer {\n  display: block;\n  color: #f0f3ff;\n  font-size: 14px;\n  text-align: right;\n}\n.contain-list .total-layer i {\n  color: #0f172a;\n}\n\n.contain-list table thead th {\n  border: none;\n  color: #ffffff;\n  text-align: left;\n  font-size: 14px;\n  font-weight: 400;\n  text-decoration: underline;\n  cursor: pointer;\n}\n.layout-center {\n  height: 100%;\n}\n\n.layout-center .bottom-header {\n  position: relative;\n}\n.layout-center .nav {\n  list-style: none;\n  position: absolute;\n  background-color: #fff;\n  width: 250px;\n  left: 0;\n  padding: 0 !important;\n  margin: 0;\n  border-top: 1px solid #cbd5e1;\n  display: none !important;\n  z-index: 99;\n  top: 35px;\n}\n.layout-center ul {\n  list-style: none;\n  margin: 0;\n  padding: 0;\n  width: 100%;\n}\n.layout-center .bottom-header > .d-flex:hover .nav {\n  display: flex !important;\n}\n.layout-center .nav li {\n  margin: 0;\n  padding: 0 10px;\n  display: flex;\n  align-items: center;\n  justify-content: flex-start;\n  position: relative;\n  border-bottom: 1px solid #cbd5e1;\n  cursor: pointer;\n  height: 44px;\n}\n.layout-center .bottom-header > .d-flex {\n  align-items: center;\n}\n.layout-center .nav li i {\n  color: #334155 !important;\n  margin-right: 5px;\n  font-size: 16px !important;\n}\n\n.layout-center .nav li:hover {\n  background-color: #cbd5e1;\n}\n\n.layout-center .nav li:hover > span {\n  color: #0f172a;\n}\n\n.layout-center .nav li span {\n  display: flex;\n  align-items: center;\n  font-size: 16px;\n  color: #5048e5;\n}\n\n.layout-center .bottom-header h2 {\n  font-family: \"Inter\";\n  font-style: normal;\n  font-weight: 700;\n  font-size: 20px;\n  line-height: 32px;\n  /* letter-spacing: 0.36px; */\n}\n.layout-center .bottom-header .fa-building {\n  color: #f97316;\n  font-size: 24px;\n}\n.layout-center .title h4 {\n  color: #f0f3ff !important;\n  font-family: \"Inter\";\n  font-style: normal;\n  font-weight: 700;\n  font-size: 14px;\n  line-height: 20px;\n  padding-top: 24px;\n}\n.layout-center .bottom-header .icon-arrow {\n  color: #374151;\n  margin-left: 18px;\n}\n.layout-center .top-header {\n  color: #5048e5;\n  font-size: 20px;\n  font-weight: bold;\n  font-family: \"Inter\";\n  cursor: pointer;\n}\n.layout-center label {\n  font-family: \"Inter\";\n  font-style: normal;\n  font-weight: 500;\n  font-size: 14px;\n  line-height: 20px;\n  color: #f0f3ff;\n}\n.layout-center .bottom-header button {\n  font-size: 14px;\n  margin-left: 4px;\n  margin-right: 4px;\n}\n.layout-center .bottom-header {\n  justify-content: space-between;\n  align-items: center;\n}\n.table td a {\n  padding: 2px !important;\n}\n.table td a .fa-pen-to-square {\n  font-size: 16px;\n}\n.box-detail-floor .row p {\n  font-size: 16px;\n  color: #f0f3ff;\n}\n.box-detail-floor .row h6 {\n  color: #f0f3ff !important;\n}\n/* Tree */\n.tree-title {\n  overflow: hidden;\n  text-overflow: ellipsis;\n  word-wrap: normal;\n  white-space: nowrap;\n  width: 170px;\n  text-align: left !important;\n}\n\n.project-structure .v-icon {\n  font-size: 15px;\n}\n\n.btn-tree,\n.btn-tree:hover,\n.btn-tree:focus,\n.btn-tree:after,\n.btn-tree:before,\n.btn-tree:active,\n.btn-tree:active:hover,\n.btn-tree:active:focus {\n  background-color: unset;\n  border: unset;\n  outline: unset;\n  box-shadow: unset;\n  font-size: 16px !important;\n  font-family: \"Inter\";\n  font-style: normal;\n  line-height: 20px !important;\n  color: #f0f3ff;\n  width: 170px;\n  position: absolute;\n}\n\n.sl-vue-tree {\n  position: relative;\n  cursor: default;\n  -webkit-touch-callout: none; /* iOS Safari */\n  -webkit-user-select: none; /* Safari */\n  -khtml-user-select: none; /* Konqueror HTML */\n  -moz-user-select: none; /* Firefox */\n  -ms-user-select: none; /* Internet Explorer/Edge */\n  user-select: none;\n}\n\n.sl-vue-tree.sl-vue-tree-root {\n  border-radius: 3px;\n}\n\n.sl-vue-tree-root > .sl-vue-tree-nodes-list {\n  overflow: hidden;\n  position: relative;\n  padding-bottom: 4px;\n}\n\n.sl-vue-tree-selected > .sl-vue-tree-node-item {\n  background-color: #f97316;\n  color: #0f172a;\n}\n.sl-vue-tree-title img,\n.sl-vue-tree-title > span {\n  margin-right: 10px;\n}\n.sl-vue-tree-selected\n  > .sl-vue-tree-node-item\n  > .sl-vue-tree-title\n  > .group-btn\n  span {\n  color: #0f172a;\n}\n.sl-vue-tree-title:hover .group-btn span {\n  color: #0f172a;\n}\n.sl-vue-tree-node-item:hover,\n.sl-vue-tree-node-item.sl-vue-tree-cursor-hover {\n  background-color: #f97316;\n  color: #0f172a;\n}\n\n.sl-vue-tree-node-item {\n  position: relative;\n  display: flex;\n  flex-direction: row;\n\n  /* padding-right: 10px; */\n  line-height: 28px;\n  border: unset;\n}\n\n.sl-vue-tree-node-item.sl-vue-tree-cursor-inside {\n  border: 1px solid rgba(255, 255, 255, 0.5);\n}\n\n.sl-vue-tree-gap {\n  width: 20px;\n  min-height: 1px;\n}\n\n.sl-vue-tree-toggle {\n  display: inline-block;\n  text-align: left;\n  width: 20px;\n  margin-left: 0;\n}\n\n.sl-vue-tree-sidebar {\n  margin-left: auto;\n}\n\n.sl-vue-tree-cursor {\n  position: absolute;\n  border: unset;\n  height: 1px;\n  width: 100%;\n}\n\n.sl-vue-tree-drag-info {\n  position: absolute;\n  opacity: 0.5;\n  margin-left: 20px;\n  padding: 5px 10px;\n}\n\n.sl-vue-tree-node-item.sl-vue-tree-node-is-leaf {\n  padding: 0;\n}\n\n.sl-vue-tree-node-item.sl-vue-tree-node-is-leaf > .sl-vue-tree-title {\n  padding-left: 33px;\n}\n\n.title-header {\n  display: flex;\n  justify-content: space-between;\n}\n\n.title-header .v-btn--active:before {\n  background-color: unset;\n}\n.sl-vue-tree-title .group-btn {\n  color: #0f172a;\n  font-size: 16px;\n  border-top: unset;\n}\n.sl-vue-tree-title {\n  cursor: pointer;\n  height: 40px;\n  width: 100%;\n  padding-top: 5px;\n  border-bottom: 1px solid #475569;\n}\n.dark-mode-icon {\n  filter: invert(100%) sepia(28%) saturate(4896%) hue-rotate(179deg)\n    brightness(107%) contrast(101%);\n}\n.assign-button {\n  display: flex;\n  justify-content: space-between;\n}\n\n#chevron-arrow-down {\n  display: inline-block;\n  border-right: 2px solid #f0f3ff;\n  border-bottom: 2px solid #f0f3ff;\n  width: 8px;\n  height: 8px;\n  -webkit-transform: rotate(-315deg) translateX(-3px) translateY(-3px);\n  transform: rotate(-315deg) translateX(2px) translateY(-6px);\n}\n\n#chevron-arrow-right {\n  display: inline-block;\n  border-right: 2px solid #f0f3ff;\n  border-bottom: 2px solid #f0f3ff;\n  width: 8px;\n  height: 8px;\n  -webkit-transform: rotate(-45deg) translateX(2px) translateY(1px);\n  transform: rotate(-45deg) translateX(2px) translateY(1px);\n}\n\n.v-btn--small {\n  font-size: 13px;\n  height: 28px;\n  padding: 0 5px;\n}\n\n.fixture-icon {\n  font-size: 15px;\n  padding-right: 2px;\n  position: absolute;\n  transform: translateX(-22px) translateY(6px);\n}\n\n/* End Tree */\n\n/* Popup */\n.sidebar-menu.structure {\n  overflow-y: scroll;\n  width: 300px;\n  padding: 20px 20px;\n  position: absolute;\n  z-index: 100;\n  top: 150px;\n  right: 0;\n  background: #0f172a;\n  height: auto;\n  box-shadow: 1px 1px 10px rgb(0 0 0 / 50%);\n  transition: unset;\n}\n\n.sidebar-menu::-webkit-scrollbar {\n  width: 10px;\n}\n.sidebar-menu::-webkit-scrollbar-thumb {\n  border-radius: 10px;\n  background-color: #c1c1c1;\n}\n\n.slide-enter,\n.slide-leave-active {\n  right: -100%;\n}\n\n.close-btn {\n  margin: 0;\n  display: flex;\n  flex-direction: row-reverse;\n  cursor: pointer;\n}\n\n.title {\n  font-size: 14px;\n  color: #a1a1aa;\n}\n.slider-color {\n  -webkit-appearance: none;\n  width: 100%;\n  height: 15px;\n  border-radius: 5px;\n  background: linear-gradient(90deg, #ff8b14 0%, #ccdcff 100%);\n  outline: none;\n  opacity: 0.7;\n  -webkit-transition: 0.2s;\n  transition: opacity 0.2s;\n}\n\n.slider-intensity {\n  -webkit-appearance: none;\n  width: 100%;\n  height: 15px;\n  border-radius: 5px;\n  background: linear-gradient(\n    90deg,\n    rgba(255, 243, 239, 0) 0%,\n    rgb(255, 243, 239) 100%\n  );\n  outline: none;\n  opacity: 0.7;\n  -webkit-transition: 0.2s;\n  transition: opacity 0.2s;\n}\n\n.slider-intensity::-webkit-slider-thumb {\n  -webkit-appearance: none;\n  appearance: none;\n  width: 25px;\n  height: 25px;\n  border-radius: 50%;\n  background: #ffffff;\n  cursor: pointer;\n}\n\n.slider-color::-webkit-slider-thumb {\n  -webkit-appearance: none;\n  appearance: none;\n  width: 25px;\n  height: 25px;\n  border-radius: 50%;\n  background: #ffffff;\n  cursor: pointer;\n}\n.slider-color::-moz-range-thumb {\n  width: 25px;\n  height: 25px;\n  border-radius: 50%;\n  background: #4caf50;\n  cursor: pointer;\n}\n\n.switch {\n  position: relative;\n  display: inline-block;\n  width: 52px;\n  height: 30px;\n}\n\n.switch input {\n  opacity: 0;\n  width: 0;\n  height: 0;\n}\n\n.sliders {\n  position: absolute;\n  cursor: pointer;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  background-color: #ccc;\n  -webkit-transition: 0.4s;\n  transition: 0.4s;\n}\n\n.sliders:before {\n  position: absolute;\n  content: \"\";\n  height: 22px;\n  width: 22px;\n  left: 2px;\n  bottom: 4px;\n  background-color: white;\n  -webkit-transition: 0.4s;\n  transition: 0.4s;\n}\n\ninput:checked .sliders {\n  background-color: #5048e5;\n}\n\ninput:focus .sliders {\n  box-shadow: 0 0 1px #5048e5;\n}\n\ninput:checked .sliders:before {\n  -webkit-transform: translateX(26px);\n  -ms-transform: translateX(26px);\n  transform: translateX(26px);\n}\n\n/* Rounded sliders */\n.sliders.round {\n  border-radius: 34px;\n}\n\n.sliders.round:before {\n  border-radius: 50%;\n}\n\n#radioBtn .notActive {\n  color: #5048e5;\n  background-color: #fff;\n}\n\n.scenes-control {\n  font-size: 14px;\n  border-bottom: 1px solid gray;\n  padding: 10px 0;\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n\n.content-item {\n  padding: 10px 0;\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n\n.button-control .box-middle .title-time > div {\n  text-align: center;\n}\n.contain-button .box-middle .contain {\n  padding: 0 !important;\n}\n\n.contain-button .box-middle .title-time {\n  padding: 5px 0px;\n  display: flex;\n  justify-content: space-around;\n  background-color: #334155;\n  border-radius: 4px;\n  width: 115px;\n}\n\n.contain-button .box-middle .title-time span {\n  font-size: 14px;\n  color: #fff;\n  padding: 5px 15px;\n  border-radius: 4px;\n}\n\n.contain-button .box-middle .title-time span.active {\n  background-color: #5048e5;\n  color: #ffffff;\n}\n\n.box-turn {\n  width: 35px;\n  height: 35px;\n  border-radius: 5px;\n  cursor: pointer;\n}\n\n.box-turn.on {\n  background-color: #f97316;\n  margin-bottom: 5px;\n}\n\n.box-turn.off {\n  background-color: #e0e8ff;\n  margin-bottom: 5px;\n}\n\n.on .icon-led {\n  width: 35px;\n  height: 31px;\n  background-position: center;\n  background-repeat: no-repeat;\n  /* background-image: url(\"../imgs/light-group-on.svg\"); */\n}\n\n.off .icon-led {\n  width: 35px;\n  height: 31px;\n  background-position: center;\n  background-repeat: no-repeat;\n  /* background-image: url(\"../imgs/light-group-off.svg\"); */\n}\n\n.segment {\n  background-color: #5048e5;\n  color: #c8d3fe;\n  border-radius: 5px;\n  display: flex;\n  font-size: 14px;\n  height: 30px;\n  justify-content: space-between;\n  line-height: 16px;\n  margin: 0;\n  padding: 0;\n  text-align: center;\n  width: 100%;\n}\n\n.segment div {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  text-transform: uppercase;\n  cursor: pointer;\n  width: 100%;\n}\n\n.segment div.active {\n  background-color: #c8d3fe;\n  border-radius: 5px;\n  margin: 3px;\n}\n\n.segment div.active div.active {\n  color: #5048e5;\n}\n\n@media only screen and (max-width: 640px) {\n  .segment {\n    padding: 0;\n  }\n}\n.title-name p {\n  font-size: 24px;\n  margin: 0;\n}\n/* End Popup */\n\n.visually-hidden {\n  position: absolute !important;\n  height: 1px;\n  width: 1px;\n  overflow: hidden;\n  clip: rect(1px, 1px, 1px, 1px);\n}\n\n.loader {\n  margin: 0;\n  display: flex;\n  border: 4px solid #f3f3f3; /* Light grey */\n  border-top: 4px solid #5048e5; /* Blue */\n  border-radius: 50%;\n  width: 25px;\n  height: 25px;\n  animation: spin 2s linear infinite;\n}\n\n@keyframes spin {\n  0% {\n    transform: rotate(0deg);\n  }\n  100% {\n    transform: rotate(360deg);\n  }\n}\n\n.fa-question-circle {\n  color: #f0f3ff;\n}\n\n/* Modal */\n.modal-mask {\n  position: fixed;\n  z-index: 9998;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  background-color: rgba(0, 0, 0, 0.5);\n  display: table;\n  transition: opacity 0.3s ease;\n}\n\n.modal-wrapper {\n  display: table-cell;\n  vertical-align: middle;\n}\n\n.modal-container {\n  width: 40%;\n  margin: 0px auto;\n  padding: 20px 30px;\n  background-color: #fff;\n  border-radius: 2px;\n  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);\n  transition: all 0.3s ease;\n}\n\n.modal-header h2 {\n  margin-top: 0;\n  padding-left: unset;\n  font-size: 20px;\n  font-weight: bold;\n  color: #0f172a;\n  line-height: 0px;\n}\n\n.modal-footer {\n  color: black;\n  font-size: 14px;\n  font-family: \"Inter\";\n}\n\n.modal-body {\n  margin: 20px 0;\n  color: black;\n  font-size: 14px;\n  font-family: \"Inter\";\n}\n\n.modal-default-button {\n  float: right;\n}\n\n/*\n * The following styles are auto-applied to elements with\n * transition=\"modal\" when their visibility is toggled\n * by Vue.js.\n *\n * You can easily play with the modal transition by editing\n * these styles.\n */\n\n.modal-enter-from {\n  opacity: 0;\n}\n\n.modal-leave-to {\n  opacity: 0;\n}\n\n.modal-enter-from .modal-container,\n.modal-leave-to .modal-container {\n  -webkit-transform: scale(1.1);\n  transform: scale(1.1);\n}\n/* */\n\n/* Start Progress bar */\n\n#contain-progress {\n  position: absolute;\n  z-index: 99;\n  transform: translate(-50%, -50%);\n  left: 50%;\n  top: 50%;\n  text-align: center;\n  width: 300px;\n}\n#progress-viewer-bar {\n  width: 100%;\n  background-color: white;\n  border-radius: 12px;\n  overflow: hidden;\n}\n\n#progress-bar {\n  width: 1%;\n  height: 5px;\n  background-color: #4942d7;\n}\n\n/* End Progress bar */\n\n/* Start Floor Stack */\n\n.floor-stack-wrapper {\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  margin: auto;\n}\n\n.floor-stack {\n  transform: translateY(225px);\n}\n\n.floor-wrapper {\n  position: absolute;\n  height: 211px;\n  transition: all 0.2s linear;\n}\n\n.floor-wrapper g path.main-path .not-config {\n  fill: #828df8;\n}\n\n.floor-wrapper g path.main-path .open {\n  fill: #f97316;\n}\n\n.floor-button {\n  position: absolute;\n  bottom: 15px;\n  left: 0;\n  right: 0;\n  margin: auto;\n}\n\n.floor-shadow {\n  background: transparent;\n  position: absolute;\n  padding: 103px;\n  pointer-events: none;\n  top: 10px;\n  left: 106px;\n  transform: rotate(156deg) skewX(42deg) scaleY(0.9) scaleX(1.15);\n  box-shadow: 20px -20px 30px rgb(31 41 55 / 10%);\n  border-radius: 8px;\n}\n/* End Floor Stack */\n", ""]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ 2293:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(8081);
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3645);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, ".nav-acction {\n  position: absolute !important;\n  top: -63px;\n  left: 65px;\n}\n.nav-acction-title {\n  color: #828df8;\n  font-weight: bold;\n  font-size: 14px;\n  margin-bottom: 10px;\n}\n#sidebar {\n  height: 100%;\n  position: relative;\n}\n#sidebar #collapse-menu {\n  cursor: pointer;\n  position: absolute;\n  right: 8px;\n  top: 26px;\n  color: #1f2226;\n}\n#sidebar #collapse-menu:hover {\n  color: #fff;\n}\n.toggle-menu #collapse-menu {\n  right: 20px !important;\n}\n.project-nav.active {\n  color: #fff !important;\n  background-color: unset !important;\n  position: relative;\n  border-radius: 0;\n}\n.project-nav.active::before {\n  content: \"\";\n  width: 70%;\n  height: 4px;\n  position: absolute;\n  bottom: 0px;\n  left: 50%;\n  z-index: 999;\n  background-color: #f87415;\n  transform: translate(-50%, -50%);\n  overflow: unset !important;\n}\n\n.group-box-light .box-middle {\n  height: 80px;\n  background-repeat: no-repeat;\n  background-position: center;\n}\n.card-sumary-header {\n  margin-bottom: 20px !important;\n}\n\n.group-box-light {\n  height: 88px;\n  width: 260px;\n  box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;\n  position: relative;\n  float: left;\n  cursor: pointer;\n}\n\n.group-box-light.on {\n  background-color: #f97316;\n  margin-bottom: 5px;\n}\n\n.group-box-light.off {\n  background-color: #e0e8ff;\n  margin-bottom: 5px;\n}\n\n.group-box-light .group-tile-name {\n  height: 40px;\n  width: 100%;\n  margin-top: 8px;\n  padding: 0 10px;\n  color: #0f172a;\n  font-weight: 700;\n  font-size: 16px;\n  text-align: center;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  display: inline-block;\n  text-align-last: left;\n}\n\n.group-box-light .box-active {\n  justify-content: space-between !important;\n}\n\n.group-box-light .box-active .switch {\n  margin: 0 0 10px;\n}\n\n#group-custom-light input[type=\"range\"].custom-light {\n  border-radius: unset !important;\n}\n\n.value-light {\n  margin: 0;\n  background-color: unset;\n  padding: 2px 6px !important;\n}\n\n.value-led {\n  align-items: center;\n  align-content: center;\n  background-color: #0f172a30;\n  border-radius: 8px;\n  width: 70px;\n  height: 28px;\n  justify-content: center;\n}\n.group-icon-led {\n  padding-top: 2px;\n}\n\n.clr {\n  clear: both;\n}\n\n.sidebar-menu {\n  overflow-y: scroll;\n  width: 300px;\n  padding: 20px 20px;\n  position: absolute;\n  z-index: 100;\n  top: 65px;\n  right: 0;\n  background: #0f172a;\n  height: 500px;\n  box-shadow: 1px 1px 10px rgb(0 0 0 / 50%);\n  transition: all 0.5s ease-in-out;\n}\n\n.sidebar-menu::-webkit-scrollbar {\n  width: 10px;\n}\n.sidebar-menu::-webkit-scrollbar-thumb {\n  border-radius: 10px;\n  background-color: #c1c1c1;\n}\n\n.slide-enter,\n.slide-leave-active {\n  right: -100%;\n}\n\n.close-btn {\n  margin: 0;\n  display: flex;\n  flex-direction: row-reverse;\n  cursor: pointer;\n}\n\n.title {\n  font-size: 14px;\n  color: #a1a1aa;\n}\n.slider-color {\n  -webkit-appearance: none;\n  width: 100%;\n  height: 15px;\n  border-radius: 5px;\n  background: linear-gradient(90deg, #ff8b14 0%, #ccdcff 100%);\n  outline: none;\n  opacity: 0.7;\n  -webkit-transition: 0.2s;\n  transition: opacity 0.2s;\n}\n\n.slider-intensity {\n  -webkit-appearance: none;\n  width: 100%;\n  height: 15px;\n  border-radius: 5px;\n  background: linear-gradient(\n    90deg,\n    rgba(255, 243, 239, 0) 0%,\n    rgb(255, 243, 239) 100%\n  );\n  outline: none;\n  opacity: 0.7;\n  -webkit-transition: 0.2s;\n  transition: opacity 0.2s;\n}\n\n.slider-intensity::-webkit-slider-thumb {\n  -webkit-appearance: none;\n  appearance: none;\n  width: 25px;\n  height: 25px;\n  border-radius: 50%;\n  background: #ffffff;\n  cursor: pointer;\n}\n\n.slider-color::-webkit-slider-thumb {\n  -webkit-appearance: none;\n  appearance: none;\n  width: 25px;\n  height: 25px;\n  border-radius: 50%;\n  background: #ffffff;\n  cursor: pointer;\n}\n.slider-color::-moz-range-thumb {\n  width: 25px;\n  height: 25px;\n  border-radius: 50%;\n  background: #4caf50;\n  cursor: pointer;\n}\n\n.switch {\n  position: relative;\n  display: inline-block;\n  width: 52px;\n  height: 30px;\n}\n\n.switch input {\n  opacity: 0;\n  width: 0;\n  height: 0;\n}\n\n.sliders {\n  position: absolute;\n  cursor: pointer;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  background-color: #ccc;\n  -webkit-transition: 0.4s;\n  transition: 0.4s;\n}\n\n.sliders:before {\n  position: absolute;\n  content: \"\";\n  height: 22px;\n  width: 22px;\n  left: 2px;\n  bottom: 4px;\n  background-color: white;\n  -webkit-transition: 0.4s;\n  transition: 0.4s;\n}\n\ninput:checked + .sliders {\n  background-color: #5048e5;\n}\n\ninput:focus + .sliders {\n  box-shadow: 0 0 1px #5048e5;\n}\n\ninput:checked + .sliders:before {\n  -webkit-transform: translateX(26px);\n  -ms-transform: translateX(26px);\n  transform: translateX(26px);\n}\n\n/* Rounded sliders */\n.sliders.round {\n  border-radius: 34px;\n}\n\n.sliders.round:before {\n  border-radius: 50%;\n}\n\n#radioBtn .notActive {\n  color: #5048e5;\n  background-color: #fff;\n}\n\n.scenes-control {\n  font-size: 14px;\n  border-bottom: 1px solid gray;\n  padding: 10px 0;\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n\n.content-item {\n  padding: 10px 0;\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n\n.button-control .box-middle .title-time > div {\n  text-align: center;\n}\n.contain-button .box-middle .contain {\n  padding: 0 !important;\n}\n\n.contain-button .box-middle .title-time {\n  padding: 5px 0px;\n  display: flex;\n  justify-content: space-around;\n  background-color: #334155;\n  border-radius: 4px;\n  width: 115px;\n}\n\n.contain-button .box-middle .title-time span {\n  font-size: 14px;\n  color: #fff;\n  padding: 5px 15px;\n  border-radius: 4px;\n}\n\n.contain-button .box-middle .title-time span.active {\n  background-color: #5048e5;\n  color: #ffffff;\n}\n\n.box-turn {\n  width: 35px;\n  height: 35px;\n  border-radius: 5px;\n  cursor: pointer;\n}\n\n.box-turn.on {\n  background-color: #f97316;\n  margin-bottom: 5px;\n}\n\n.box-turn.off {\n  background-color: #e0e8ff;\n  margin-bottom: 5px;\n}\n\n.on .icon-led {\n  width: 35px;\n  height: 31px;\n  background-position: center;\n  background-repeat: no-repeat;\n  /* // background-image: url(\"../imgs/light-group-on.svg\"); */\n}\n\n.off .icon-led {\n  width: 35px;\n  height: 31px;\n  background-position: center;\n  background-repeat: no-repeat;\n  /* // background-image: url(\"../imgs/light-group-off.svg\"); */\n}\n\n.segment {\n  background-color: #5048e5;\n  color: #c8d3fe;\n  border-radius: 5px;\n  display: flex;\n  font-size: 14px;\n  height: 30px;\n  justify-content: space-between;\n  line-height: 16px;\n  margin: 0;\n  padding: 0;\n  text-align: center;\n  width: 100%;\n}\n\n.segment div {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  text-transform: uppercase;\n  cursor: pointer;\n  width: 100%;\n}\n\n.segment div.active {\n  background-color: #c8d3fe;\n  border-radius: 5px;\n  margin: 3px;\n}\n\n.segment div.active div.active {\n  color: #5048e5;\n}\n\n@media only screen and (max-width: 640px) {\n  .segment {\n    padding: 0;\n  }\n}\n.title-name p {\n  font-size: 24px;\n  margin: 0;\n}\n", ""]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ 5856:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(8081);
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3645);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_node_modules_bootstrap_dist_css_bootstrap_css__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(1194);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_mgmtservice_css__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(6100);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_structure_css__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(4953);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_style_manifera_css__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(2293);
// Imports






var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
___CSS_LOADER_EXPORT___.i(_node_modules_css_loader_dist_cjs_js_node_modules_bootstrap_dist_css_bootstrap_css__WEBPACK_IMPORTED_MODULE_2__/* ["default"] */ .Z);
___CSS_LOADER_EXPORT___.i(_node_modules_css_loader_dist_cjs_js_mgmtservice_css__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .Z);
___CSS_LOADER_EXPORT___.i(_node_modules_css_loader_dist_cjs_js_structure_css__WEBPACK_IMPORTED_MODULE_4__/* ["default"] */ .Z);
___CSS_LOADER_EXPORT___.i(_node_modules_css_loader_dist_cjs_js_style_manifera_css__WEBPACK_IMPORTED_MODULE_5__/* ["default"] */ .Z);
// Module
___CSS_LOADER_EXPORT___.push([module.id, "\n", ""]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ 1194:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(8081);
/* harmony import */ var _css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3645);
/* harmony import */ var _css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(1667);
/* harmony import */ var _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2__);
// Imports



var ___CSS_LOADER_URL_IMPORT_0___ = new URL(/* asset import */ __webpack_require__(7211), __webpack_require__.b);
var ___CSS_LOADER_URL_IMPORT_1___ = new URL(/* asset import */ __webpack_require__(4576), __webpack_require__.b);
var ___CSS_LOADER_URL_IMPORT_2___ = new URL(/* asset import */ __webpack_require__(1024), __webpack_require__.b);
var ___CSS_LOADER_URL_IMPORT_3___ = new URL(/* asset import */ __webpack_require__(9653), __webpack_require__.b);
var ___CSS_LOADER_URL_IMPORT_4___ = new URL(/* asset import */ __webpack_require__(4231), __webpack_require__.b);
var ___CSS_LOADER_URL_IMPORT_5___ = new URL(/* asset import */ __webpack_require__(7263), __webpack_require__.b);
var ___CSS_LOADER_URL_IMPORT_6___ = new URL(/* asset import */ __webpack_require__(1380), __webpack_require__.b);
var ___CSS_LOADER_URL_IMPORT_7___ = new URL(/* asset import */ __webpack_require__(9242), __webpack_require__.b);
var ___CSS_LOADER_URL_IMPORT_8___ = new URL(/* asset import */ __webpack_require__(4104), __webpack_require__.b);
var ___CSS_LOADER_URL_IMPORT_9___ = new URL(/* asset import */ __webpack_require__(9700), __webpack_require__.b);
var ___CSS_LOADER_EXPORT___ = _css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
var ___CSS_LOADER_URL_REPLACEMENT_0___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_0___);
var ___CSS_LOADER_URL_REPLACEMENT_1___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_1___);
var ___CSS_LOADER_URL_REPLACEMENT_2___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_2___);
var ___CSS_LOADER_URL_REPLACEMENT_3___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_3___);
var ___CSS_LOADER_URL_REPLACEMENT_4___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_4___);
var ___CSS_LOADER_URL_REPLACEMENT_5___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_5___);
var ___CSS_LOADER_URL_REPLACEMENT_6___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_6___);
var ___CSS_LOADER_URL_REPLACEMENT_7___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_7___);
var ___CSS_LOADER_URL_REPLACEMENT_8___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_8___);
var ___CSS_LOADER_URL_REPLACEMENT_9___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_9___);
// Module
___CSS_LOADER_EXPORT___.push([module.id, "/*!\n * Bootstrap v4.6.2 (https://getbootstrap.com/)\n * Copyright 2011-2022 The Bootstrap Authors\n * Copyright 2011-2022 Twitter, Inc.\n * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)\n */\n:root {\n  --blue: #007bff;\n  --indigo: #6610f2;\n  --purple: #6f42c1;\n  --pink: #e83e8c;\n  --red: #dc3545;\n  --orange: #fd7e14;\n  --yellow: #ffc107;\n  --green: #28a745;\n  --teal: #20c997;\n  --cyan: #17a2b8;\n  --white: #fff;\n  --gray: #6c757d;\n  --gray-dark: #343a40;\n  --primary: #007bff;\n  --secondary: #6c757d;\n  --success: #28a745;\n  --info: #17a2b8;\n  --warning: #ffc107;\n  --danger: #dc3545;\n  --light: #f8f9fa;\n  --dark: #343a40;\n  --breakpoint-xs: 0;\n  --breakpoint-sm: 576px;\n  --breakpoint-md: 768px;\n  --breakpoint-lg: 992px;\n  --breakpoint-xl: 1200px;\n  --font-family-sans-serif: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, \"Noto Sans\", \"Liberation Sans\", sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\", \"Noto Color Emoji\";\n  --font-family-monospace: SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace;\n}\n\n*,\n*::before,\n*::after {\n  box-sizing: border-box;\n}\n\nhtml {\n  font-family: sans-serif;\n  line-height: 1.15;\n  -webkit-text-size-adjust: 100%;\n  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);\n}\n\narticle, aside, figcaption, figure, footer, header, hgroup, main, nav, section {\n  display: block;\n}\n\nbody {\n  margin: 0;\n  font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, \"Noto Sans\", \"Liberation Sans\", sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\", \"Noto Color Emoji\";\n  font-size: 1rem;\n  font-weight: 400;\n  line-height: 1.5;\n  color: #212529;\n  text-align: left;\n  background-color: #fff;\n}\n\n[tabindex=\"-1\"]:focus:not(:focus-visible) {\n  outline: 0 !important;\n}\n\nhr {\n  box-sizing: content-box;\n  height: 0;\n  overflow: visible;\n}\n\nh1, h2, h3, h4, h5, h6 {\n  margin-top: 0;\n  margin-bottom: 0.5rem;\n}\n\np {\n  margin-top: 0;\n  margin-bottom: 1rem;\n}\n\nabbr[title],\nabbr[data-original-title] {\n  text-decoration: underline;\n  -webkit-text-decoration: underline dotted;\n  text-decoration: underline dotted;\n  cursor: help;\n  border-bottom: 0;\n  -webkit-text-decoration-skip-ink: none;\n  text-decoration-skip-ink: none;\n}\n\naddress {\n  margin-bottom: 1rem;\n  font-style: normal;\n  line-height: inherit;\n}\n\nol,\nul,\ndl {\n  margin-top: 0;\n  margin-bottom: 1rem;\n}\n\nol ol,\nul ul,\nol ul,\nul ol {\n  margin-bottom: 0;\n}\n\ndt {\n  font-weight: 700;\n}\n\ndd {\n  margin-bottom: .5rem;\n  margin-left: 0;\n}\n\nblockquote {\n  margin: 0 0 1rem;\n}\n\nb,\nstrong {\n  font-weight: bolder;\n}\n\nsmall {\n  font-size: 80%;\n}\n\nsub,\nsup {\n  position: relative;\n  font-size: 75%;\n  line-height: 0;\n  vertical-align: baseline;\n}\n\nsub {\n  bottom: -.25em;\n}\n\nsup {\n  top: -.5em;\n}\n\na {\n  color: #007bff;\n  text-decoration: none;\n  background-color: transparent;\n}\n\na:hover {\n  color: #0056b3;\n  text-decoration: underline;\n}\n\na:not([href]):not([class]) {\n  color: inherit;\n  text-decoration: none;\n}\n\na:not([href]):not([class]):hover {\n  color: inherit;\n  text-decoration: none;\n}\n\npre,\ncode,\nkbd,\nsamp {\n  font-family: SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace;\n  font-size: 1em;\n}\n\npre {\n  margin-top: 0;\n  margin-bottom: 1rem;\n  overflow: auto;\n  -ms-overflow-style: scrollbar;\n}\n\nfigure {\n  margin: 0 0 1rem;\n}\n\nimg {\n  vertical-align: middle;\n  border-style: none;\n}\n\nsvg {\n  overflow: hidden;\n  vertical-align: middle;\n}\n\ntable {\n  border-collapse: collapse;\n}\n\ncaption {\n  padding-top: 0.75rem;\n  padding-bottom: 0.75rem;\n  color: #6c757d;\n  text-align: left;\n  caption-side: bottom;\n}\n\nth {\n  text-align: inherit;\n  text-align: -webkit-match-parent;\n}\n\nlabel {\n  display: inline-block;\n  margin-bottom: 0.5rem;\n}\n\nbutton {\n  border-radius: 0;\n}\n\nbutton:focus:not(:focus-visible) {\n  outline: 0;\n}\n\ninput,\nbutton,\nselect,\noptgroup,\ntextarea {\n  margin: 0;\n  font-family: inherit;\n  font-size: inherit;\n  line-height: inherit;\n}\n\nbutton,\ninput {\n  overflow: visible;\n}\n\nbutton,\nselect {\n  text-transform: none;\n}\n\n[role=\"button\"] {\n  cursor: pointer;\n}\n\nselect {\n  word-wrap: normal;\n}\n\nbutton,\n[type=\"button\"],\n[type=\"reset\"],\n[type=\"submit\"] {\n  -webkit-appearance: button;\n}\n\nbutton:not(:disabled),\n[type=\"button\"]:not(:disabled),\n[type=\"reset\"]:not(:disabled),\n[type=\"submit\"]:not(:disabled) {\n  cursor: pointer;\n}\n\nbutton::-moz-focus-inner,\n[type=\"button\"]::-moz-focus-inner,\n[type=\"reset\"]::-moz-focus-inner,\n[type=\"submit\"]::-moz-focus-inner {\n  padding: 0;\n  border-style: none;\n}\n\ninput[type=\"radio\"],\ninput[type=\"checkbox\"] {\n  box-sizing: border-box;\n  padding: 0;\n}\n\ntextarea {\n  overflow: auto;\n  resize: vertical;\n}\n\nfieldset {\n  min-width: 0;\n  padding: 0;\n  margin: 0;\n  border: 0;\n}\n\nlegend {\n  display: block;\n  width: 100%;\n  max-width: 100%;\n  padding: 0;\n  margin-bottom: .5rem;\n  font-size: 1.5rem;\n  line-height: inherit;\n  color: inherit;\n  white-space: normal;\n}\n\nprogress {\n  vertical-align: baseline;\n}\n\n[type=\"number\"]::-webkit-inner-spin-button,\n[type=\"number\"]::-webkit-outer-spin-button {\n  height: auto;\n}\n\n[type=\"search\"] {\n  outline-offset: -2px;\n  -webkit-appearance: none;\n}\n\n[type=\"search\"]::-webkit-search-decoration {\n  -webkit-appearance: none;\n}\n\n::-webkit-file-upload-button {\n  font: inherit;\n  -webkit-appearance: button;\n}\n\noutput {\n  display: inline-block;\n}\n\nsummary {\n  display: list-item;\n  cursor: pointer;\n}\n\ntemplate {\n  display: none;\n}\n\n[hidden] {\n  display: none !important;\n}\n\nh1, h2, h3, h4, h5, h6,\n.h1, .h2, .h3, .h4, .h5, .h6 {\n  margin-bottom: 0.5rem;\n  font-weight: 500;\n  line-height: 1.2;\n}\n\nh1, .h1 {\n  font-size: 2.5rem;\n}\n\nh2, .h2 {\n  font-size: 2rem;\n}\n\nh3, .h3 {\n  font-size: 1.75rem;\n}\n\nh4, .h4 {\n  font-size: 1.5rem;\n}\n\nh5, .h5 {\n  font-size: 1.25rem;\n}\n\nh6, .h6 {\n  font-size: 1rem;\n}\n\n.lead {\n  font-size: 1.25rem;\n  font-weight: 300;\n}\n\n.display-1 {\n  font-size: 6rem;\n  font-weight: 300;\n  line-height: 1.2;\n}\n\n.display-2 {\n  font-size: 5.5rem;\n  font-weight: 300;\n  line-height: 1.2;\n}\n\n.display-3 {\n  font-size: 4.5rem;\n  font-weight: 300;\n  line-height: 1.2;\n}\n\n.display-4 {\n  font-size: 3.5rem;\n  font-weight: 300;\n  line-height: 1.2;\n}\n\nhr {\n  margin-top: 1rem;\n  margin-bottom: 1rem;\n  border: 0;\n  border-top: 1px solid rgba(0, 0, 0, 0.1);\n}\n\nsmall,\n.small {\n  font-size: 0.875em;\n  font-weight: 400;\n}\n\nmark,\n.mark {\n  padding: 0.2em;\n  background-color: #fcf8e3;\n}\n\n.list-unstyled {\n  padding-left: 0;\n  list-style: none;\n}\n\n.list-inline {\n  padding-left: 0;\n  list-style: none;\n}\n\n.list-inline-item {\n  display: inline-block;\n}\n\n.list-inline-item:not(:last-child) {\n  margin-right: 0.5rem;\n}\n\n.initialism {\n  font-size: 90%;\n  text-transform: uppercase;\n}\n\n.blockquote {\n  margin-bottom: 1rem;\n  font-size: 1.25rem;\n}\n\n.blockquote-footer {\n  display: block;\n  font-size: 0.875em;\n  color: #6c757d;\n}\n\n.blockquote-footer::before {\n  content: \"\\2014\\00A0\";\n}\n\n.img-fluid {\n  max-width: 100%;\n  height: auto;\n}\n\n.img-thumbnail {\n  padding: 0.25rem;\n  background-color: #fff;\n  border: 1px solid #dee2e6;\n  border-radius: 0.25rem;\n  max-width: 100%;\n  height: auto;\n}\n\n.figure {\n  display: inline-block;\n}\n\n.figure-img {\n  margin-bottom: 0.5rem;\n  line-height: 1;\n}\n\n.figure-caption {\n  font-size: 90%;\n  color: #6c757d;\n}\n\ncode {\n  font-size: 87.5%;\n  color: #e83e8c;\n  word-wrap: break-word;\n}\n\na > code {\n  color: inherit;\n}\n\nkbd {\n  padding: 0.2rem 0.4rem;\n  font-size: 87.5%;\n  color: #fff;\n  background-color: #212529;\n  border-radius: 0.2rem;\n}\n\nkbd kbd {\n  padding: 0;\n  font-size: 100%;\n  font-weight: 700;\n}\n\npre {\n  display: block;\n  font-size: 87.5%;\n  color: #212529;\n}\n\npre code {\n  font-size: inherit;\n  color: inherit;\n  word-break: normal;\n}\n\n.pre-scrollable {\n  max-height: 340px;\n  overflow-y: scroll;\n}\n\n.container,\n.container-fluid,\n.container-sm,\n.container-md,\n.container-lg,\n.container-xl {\n  width: 100%;\n  padding-right: 15px;\n  padding-left: 15px;\n  margin-right: auto;\n  margin-left: auto;\n}\n\n@media (min-width: 576px) {\n  .container, .container-sm {\n    max-width: 540px;\n  }\n}\n\n@media (min-width: 768px) {\n  .container, .container-sm, .container-md {\n    max-width: 720px;\n  }\n}\n\n@media (min-width: 992px) {\n  .container, .container-sm, .container-md, .container-lg {\n    max-width: 960px;\n  }\n}\n\n@media (min-width: 1200px) {\n  .container, .container-sm, .container-md, .container-lg, .container-xl {\n    max-width: 1140px;\n  }\n}\n\n.row {\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-wrap: wrap;\n  flex-wrap: wrap;\n  margin-right: -15px;\n  margin-left: -15px;\n}\n\n.no-gutters {\n  margin-right: 0;\n  margin-left: 0;\n}\n\n.no-gutters > .col,\n.no-gutters > [class*=\"col-\"] {\n  padding-right: 0;\n  padding-left: 0;\n}\n\n.col-1, .col-2, .col-3, .col-4, .col-5, .col-6, .col-7, .col-8, .col-9, .col-10, .col-11, .col-12, .col,\n.col-auto, .col-sm-1, .col-sm-2, .col-sm-3, .col-sm-4, .col-sm-5, .col-sm-6, .col-sm-7, .col-sm-8, .col-sm-9, .col-sm-10, .col-sm-11, .col-sm-12, .col-sm,\n.col-sm-auto, .col-md-1, .col-md-2, .col-md-3, .col-md-4, .col-md-5, .col-md-6, .col-md-7, .col-md-8, .col-md-9, .col-md-10, .col-md-11, .col-md-12, .col-md,\n.col-md-auto, .col-lg-1, .col-lg-2, .col-lg-3, .col-lg-4, .col-lg-5, .col-lg-6, .col-lg-7, .col-lg-8, .col-lg-9, .col-lg-10, .col-lg-11, .col-lg-12, .col-lg,\n.col-lg-auto, .col-xl-1, .col-xl-2, .col-xl-3, .col-xl-4, .col-xl-5, .col-xl-6, .col-xl-7, .col-xl-8, .col-xl-9, .col-xl-10, .col-xl-11, .col-xl-12, .col-xl,\n.col-xl-auto {\n  position: relative;\n  width: 100%;\n  padding-right: 15px;\n  padding-left: 15px;\n}\n\n.col {\n  -ms-flex-preferred-size: 0;\n  flex-basis: 0;\n  -ms-flex-positive: 1;\n  flex-grow: 1;\n  max-width: 100%;\n}\n\n.row-cols-1 > * {\n  -ms-flex: 0 0 100%;\n  flex: 0 0 100%;\n  max-width: 100%;\n}\n\n.row-cols-2 > * {\n  -ms-flex: 0 0 50%;\n  flex: 0 0 50%;\n  max-width: 50%;\n}\n\n.row-cols-3 > * {\n  -ms-flex: 0 0 33.333333%;\n  flex: 0 0 33.333333%;\n  max-width: 33.333333%;\n}\n\n.row-cols-4 > * {\n  -ms-flex: 0 0 25%;\n  flex: 0 0 25%;\n  max-width: 25%;\n}\n\n.row-cols-5 > * {\n  -ms-flex: 0 0 20%;\n  flex: 0 0 20%;\n  max-width: 20%;\n}\n\n.row-cols-6 > * {\n  -ms-flex: 0 0 16.666667%;\n  flex: 0 0 16.666667%;\n  max-width: 16.666667%;\n}\n\n.col-auto {\n  -ms-flex: 0 0 auto;\n  flex: 0 0 auto;\n  width: auto;\n  max-width: 100%;\n}\n\n.col-1 {\n  -ms-flex: 0 0 8.333333%;\n  flex: 0 0 8.333333%;\n  max-width: 8.333333%;\n}\n\n.col-2 {\n  -ms-flex: 0 0 16.666667%;\n  flex: 0 0 16.666667%;\n  max-width: 16.666667%;\n}\n\n.col-3 {\n  -ms-flex: 0 0 25%;\n  flex: 0 0 25%;\n  max-width: 25%;\n}\n\n.col-4 {\n  -ms-flex: 0 0 33.333333%;\n  flex: 0 0 33.333333%;\n  max-width: 33.333333%;\n}\n\n.col-5 {\n  -ms-flex: 0 0 41.666667%;\n  flex: 0 0 41.666667%;\n  max-width: 41.666667%;\n}\n\n.col-6 {\n  -ms-flex: 0 0 50%;\n  flex: 0 0 50%;\n  max-width: 50%;\n}\n\n.col-7 {\n  -ms-flex: 0 0 58.333333%;\n  flex: 0 0 58.333333%;\n  max-width: 58.333333%;\n}\n\n.col-8 {\n  -ms-flex: 0 0 66.666667%;\n  flex: 0 0 66.666667%;\n  max-width: 66.666667%;\n}\n\n.col-9 {\n  -ms-flex: 0 0 75%;\n  flex: 0 0 75%;\n  max-width: 75%;\n}\n\n.col-10 {\n  -ms-flex: 0 0 83.333333%;\n  flex: 0 0 83.333333%;\n  max-width: 83.333333%;\n}\n\n.col-11 {\n  -ms-flex: 0 0 91.666667%;\n  flex: 0 0 91.666667%;\n  max-width: 91.666667%;\n}\n\n.col-12 {\n  -ms-flex: 0 0 100%;\n  flex: 0 0 100%;\n  max-width: 100%;\n}\n\n.order-first {\n  -ms-flex-order: -1;\n  order: -1;\n}\n\n.order-last {\n  -ms-flex-order: 13;\n  order: 13;\n}\n\n.order-0 {\n  -ms-flex-order: 0;\n  order: 0;\n}\n\n.order-1 {\n  -ms-flex-order: 1;\n  order: 1;\n}\n\n.order-2 {\n  -ms-flex-order: 2;\n  order: 2;\n}\n\n.order-3 {\n  -ms-flex-order: 3;\n  order: 3;\n}\n\n.order-4 {\n  -ms-flex-order: 4;\n  order: 4;\n}\n\n.order-5 {\n  -ms-flex-order: 5;\n  order: 5;\n}\n\n.order-6 {\n  -ms-flex-order: 6;\n  order: 6;\n}\n\n.order-7 {\n  -ms-flex-order: 7;\n  order: 7;\n}\n\n.order-8 {\n  -ms-flex-order: 8;\n  order: 8;\n}\n\n.order-9 {\n  -ms-flex-order: 9;\n  order: 9;\n}\n\n.order-10 {\n  -ms-flex-order: 10;\n  order: 10;\n}\n\n.order-11 {\n  -ms-flex-order: 11;\n  order: 11;\n}\n\n.order-12 {\n  -ms-flex-order: 12;\n  order: 12;\n}\n\n.offset-1 {\n  margin-left: 8.333333%;\n}\n\n.offset-2 {\n  margin-left: 16.666667%;\n}\n\n.offset-3 {\n  margin-left: 25%;\n}\n\n.offset-4 {\n  margin-left: 33.333333%;\n}\n\n.offset-5 {\n  margin-left: 41.666667%;\n}\n\n.offset-6 {\n  margin-left: 50%;\n}\n\n.offset-7 {\n  margin-left: 58.333333%;\n}\n\n.offset-8 {\n  margin-left: 66.666667%;\n}\n\n.offset-9 {\n  margin-left: 75%;\n}\n\n.offset-10 {\n  margin-left: 83.333333%;\n}\n\n.offset-11 {\n  margin-left: 91.666667%;\n}\n\n@media (min-width: 576px) {\n  .col-sm {\n    -ms-flex-preferred-size: 0;\n    flex-basis: 0;\n    -ms-flex-positive: 1;\n    flex-grow: 1;\n    max-width: 100%;\n  }\n  .row-cols-sm-1 > * {\n    -ms-flex: 0 0 100%;\n    flex: 0 0 100%;\n    max-width: 100%;\n  }\n  .row-cols-sm-2 > * {\n    -ms-flex: 0 0 50%;\n    flex: 0 0 50%;\n    max-width: 50%;\n  }\n  .row-cols-sm-3 > * {\n    -ms-flex: 0 0 33.333333%;\n    flex: 0 0 33.333333%;\n    max-width: 33.333333%;\n  }\n  .row-cols-sm-4 > * {\n    -ms-flex: 0 0 25%;\n    flex: 0 0 25%;\n    max-width: 25%;\n  }\n  .row-cols-sm-5 > * {\n    -ms-flex: 0 0 20%;\n    flex: 0 0 20%;\n    max-width: 20%;\n  }\n  .row-cols-sm-6 > * {\n    -ms-flex: 0 0 16.666667%;\n    flex: 0 0 16.666667%;\n    max-width: 16.666667%;\n  }\n  .col-sm-auto {\n    -ms-flex: 0 0 auto;\n    flex: 0 0 auto;\n    width: auto;\n    max-width: 100%;\n  }\n  .col-sm-1 {\n    -ms-flex: 0 0 8.333333%;\n    flex: 0 0 8.333333%;\n    max-width: 8.333333%;\n  }\n  .col-sm-2 {\n    -ms-flex: 0 0 16.666667%;\n    flex: 0 0 16.666667%;\n    max-width: 16.666667%;\n  }\n  .col-sm-3 {\n    -ms-flex: 0 0 25%;\n    flex: 0 0 25%;\n    max-width: 25%;\n  }\n  .col-sm-4 {\n    -ms-flex: 0 0 33.333333%;\n    flex: 0 0 33.333333%;\n    max-width: 33.333333%;\n  }\n  .col-sm-5 {\n    -ms-flex: 0 0 41.666667%;\n    flex: 0 0 41.666667%;\n    max-width: 41.666667%;\n  }\n  .col-sm-6 {\n    -ms-flex: 0 0 50%;\n    flex: 0 0 50%;\n    max-width: 50%;\n  }\n  .col-sm-7 {\n    -ms-flex: 0 0 58.333333%;\n    flex: 0 0 58.333333%;\n    max-width: 58.333333%;\n  }\n  .col-sm-8 {\n    -ms-flex: 0 0 66.666667%;\n    flex: 0 0 66.666667%;\n    max-width: 66.666667%;\n  }\n  .col-sm-9 {\n    -ms-flex: 0 0 75%;\n    flex: 0 0 75%;\n    max-width: 75%;\n  }\n  .col-sm-10 {\n    -ms-flex: 0 0 83.333333%;\n    flex: 0 0 83.333333%;\n    max-width: 83.333333%;\n  }\n  .col-sm-11 {\n    -ms-flex: 0 0 91.666667%;\n    flex: 0 0 91.666667%;\n    max-width: 91.666667%;\n  }\n  .col-sm-12 {\n    -ms-flex: 0 0 100%;\n    flex: 0 0 100%;\n    max-width: 100%;\n  }\n  .order-sm-first {\n    -ms-flex-order: -1;\n    order: -1;\n  }\n  .order-sm-last {\n    -ms-flex-order: 13;\n    order: 13;\n  }\n  .order-sm-0 {\n    -ms-flex-order: 0;\n    order: 0;\n  }\n  .order-sm-1 {\n    -ms-flex-order: 1;\n    order: 1;\n  }\n  .order-sm-2 {\n    -ms-flex-order: 2;\n    order: 2;\n  }\n  .order-sm-3 {\n    -ms-flex-order: 3;\n    order: 3;\n  }\n  .order-sm-4 {\n    -ms-flex-order: 4;\n    order: 4;\n  }\n  .order-sm-5 {\n    -ms-flex-order: 5;\n    order: 5;\n  }\n  .order-sm-6 {\n    -ms-flex-order: 6;\n    order: 6;\n  }\n  .order-sm-7 {\n    -ms-flex-order: 7;\n    order: 7;\n  }\n  .order-sm-8 {\n    -ms-flex-order: 8;\n    order: 8;\n  }\n  .order-sm-9 {\n    -ms-flex-order: 9;\n    order: 9;\n  }\n  .order-sm-10 {\n    -ms-flex-order: 10;\n    order: 10;\n  }\n  .order-sm-11 {\n    -ms-flex-order: 11;\n    order: 11;\n  }\n  .order-sm-12 {\n    -ms-flex-order: 12;\n    order: 12;\n  }\n  .offset-sm-0 {\n    margin-left: 0;\n  }\n  .offset-sm-1 {\n    margin-left: 8.333333%;\n  }\n  .offset-sm-2 {\n    margin-left: 16.666667%;\n  }\n  .offset-sm-3 {\n    margin-left: 25%;\n  }\n  .offset-sm-4 {\n    margin-left: 33.333333%;\n  }\n  .offset-sm-5 {\n    margin-left: 41.666667%;\n  }\n  .offset-sm-6 {\n    margin-left: 50%;\n  }\n  .offset-sm-7 {\n    margin-left: 58.333333%;\n  }\n  .offset-sm-8 {\n    margin-left: 66.666667%;\n  }\n  .offset-sm-9 {\n    margin-left: 75%;\n  }\n  .offset-sm-10 {\n    margin-left: 83.333333%;\n  }\n  .offset-sm-11 {\n    margin-left: 91.666667%;\n  }\n}\n\n@media (min-width: 768px) {\n  .col-md {\n    -ms-flex-preferred-size: 0;\n    flex-basis: 0;\n    -ms-flex-positive: 1;\n    flex-grow: 1;\n    max-width: 100%;\n  }\n  .row-cols-md-1 > * {\n    -ms-flex: 0 0 100%;\n    flex: 0 0 100%;\n    max-width: 100%;\n  }\n  .row-cols-md-2 > * {\n    -ms-flex: 0 0 50%;\n    flex: 0 0 50%;\n    max-width: 50%;\n  }\n  .row-cols-md-3 > * {\n    -ms-flex: 0 0 33.333333%;\n    flex: 0 0 33.333333%;\n    max-width: 33.333333%;\n  }\n  .row-cols-md-4 > * {\n    -ms-flex: 0 0 25%;\n    flex: 0 0 25%;\n    max-width: 25%;\n  }\n  .row-cols-md-5 > * {\n    -ms-flex: 0 0 20%;\n    flex: 0 0 20%;\n    max-width: 20%;\n  }\n  .row-cols-md-6 > * {\n    -ms-flex: 0 0 16.666667%;\n    flex: 0 0 16.666667%;\n    max-width: 16.666667%;\n  }\n  .col-md-auto {\n    -ms-flex: 0 0 auto;\n    flex: 0 0 auto;\n    width: auto;\n    max-width: 100%;\n  }\n  .col-md-1 {\n    -ms-flex: 0 0 8.333333%;\n    flex: 0 0 8.333333%;\n    max-width: 8.333333%;\n  }\n  .col-md-2 {\n    -ms-flex: 0 0 16.666667%;\n    flex: 0 0 16.666667%;\n    max-width: 16.666667%;\n  }\n  .col-md-3 {\n    -ms-flex: 0 0 25%;\n    flex: 0 0 25%;\n    max-width: 25%;\n  }\n  .col-md-4 {\n    -ms-flex: 0 0 33.333333%;\n    flex: 0 0 33.333333%;\n    max-width: 33.333333%;\n  }\n  .col-md-5 {\n    -ms-flex: 0 0 41.666667%;\n    flex: 0 0 41.666667%;\n    max-width: 41.666667%;\n  }\n  .col-md-6 {\n    -ms-flex: 0 0 50%;\n    flex: 0 0 50%;\n    max-width: 50%;\n  }\n  .col-md-7 {\n    -ms-flex: 0 0 58.333333%;\n    flex: 0 0 58.333333%;\n    max-width: 58.333333%;\n  }\n  .col-md-8 {\n    -ms-flex: 0 0 66.666667%;\n    flex: 0 0 66.666667%;\n    max-width: 66.666667%;\n  }\n  .col-md-9 {\n    -ms-flex: 0 0 75%;\n    flex: 0 0 75%;\n    max-width: 75%;\n  }\n  .col-md-10 {\n    -ms-flex: 0 0 83.333333%;\n    flex: 0 0 83.333333%;\n    max-width: 83.333333%;\n  }\n  .col-md-11 {\n    -ms-flex: 0 0 91.666667%;\n    flex: 0 0 91.666667%;\n    max-width: 91.666667%;\n  }\n  .col-md-12 {\n    -ms-flex: 0 0 100%;\n    flex: 0 0 100%;\n    max-width: 100%;\n  }\n  .order-md-first {\n    -ms-flex-order: -1;\n    order: -1;\n  }\n  .order-md-last {\n    -ms-flex-order: 13;\n    order: 13;\n  }\n  .order-md-0 {\n    -ms-flex-order: 0;\n    order: 0;\n  }\n  .order-md-1 {\n    -ms-flex-order: 1;\n    order: 1;\n  }\n  .order-md-2 {\n    -ms-flex-order: 2;\n    order: 2;\n  }\n  .order-md-3 {\n    -ms-flex-order: 3;\n    order: 3;\n  }\n  .order-md-4 {\n    -ms-flex-order: 4;\n    order: 4;\n  }\n  .order-md-5 {\n    -ms-flex-order: 5;\n    order: 5;\n  }\n  .order-md-6 {\n    -ms-flex-order: 6;\n    order: 6;\n  }\n  .order-md-7 {\n    -ms-flex-order: 7;\n    order: 7;\n  }\n  .order-md-8 {\n    -ms-flex-order: 8;\n    order: 8;\n  }\n  .order-md-9 {\n    -ms-flex-order: 9;\n    order: 9;\n  }\n  .order-md-10 {\n    -ms-flex-order: 10;\n    order: 10;\n  }\n  .order-md-11 {\n    -ms-flex-order: 11;\n    order: 11;\n  }\n  .order-md-12 {\n    -ms-flex-order: 12;\n    order: 12;\n  }\n  .offset-md-0 {\n    margin-left: 0;\n  }\n  .offset-md-1 {\n    margin-left: 8.333333%;\n  }\n  .offset-md-2 {\n    margin-left: 16.666667%;\n  }\n  .offset-md-3 {\n    margin-left: 25%;\n  }\n  .offset-md-4 {\n    margin-left: 33.333333%;\n  }\n  .offset-md-5 {\n    margin-left: 41.666667%;\n  }\n  .offset-md-6 {\n    margin-left: 50%;\n  }\n  .offset-md-7 {\n    margin-left: 58.333333%;\n  }\n  .offset-md-8 {\n    margin-left: 66.666667%;\n  }\n  .offset-md-9 {\n    margin-left: 75%;\n  }\n  .offset-md-10 {\n    margin-left: 83.333333%;\n  }\n  .offset-md-11 {\n    margin-left: 91.666667%;\n  }\n}\n\n@media (min-width: 992px) {\n  .col-lg {\n    -ms-flex-preferred-size: 0;\n    flex-basis: 0;\n    -ms-flex-positive: 1;\n    flex-grow: 1;\n    max-width: 100%;\n  }\n  .row-cols-lg-1 > * {\n    -ms-flex: 0 0 100%;\n    flex: 0 0 100%;\n    max-width: 100%;\n  }\n  .row-cols-lg-2 > * {\n    -ms-flex: 0 0 50%;\n    flex: 0 0 50%;\n    max-width: 50%;\n  }\n  .row-cols-lg-3 > * {\n    -ms-flex: 0 0 33.333333%;\n    flex: 0 0 33.333333%;\n    max-width: 33.333333%;\n  }\n  .row-cols-lg-4 > * {\n    -ms-flex: 0 0 25%;\n    flex: 0 0 25%;\n    max-width: 25%;\n  }\n  .row-cols-lg-5 > * {\n    -ms-flex: 0 0 20%;\n    flex: 0 0 20%;\n    max-width: 20%;\n  }\n  .row-cols-lg-6 > * {\n    -ms-flex: 0 0 16.666667%;\n    flex: 0 0 16.666667%;\n    max-width: 16.666667%;\n  }\n  .col-lg-auto {\n    -ms-flex: 0 0 auto;\n    flex: 0 0 auto;\n    width: auto;\n    max-width: 100%;\n  }\n  .col-lg-1 {\n    -ms-flex: 0 0 8.333333%;\n    flex: 0 0 8.333333%;\n    max-width: 8.333333%;\n  }\n  .col-lg-2 {\n    -ms-flex: 0 0 16.666667%;\n    flex: 0 0 16.666667%;\n    max-width: 16.666667%;\n  }\n  .col-lg-3 {\n    -ms-flex: 0 0 25%;\n    flex: 0 0 25%;\n    max-width: 25%;\n  }\n  .col-lg-4 {\n    -ms-flex: 0 0 33.333333%;\n    flex: 0 0 33.333333%;\n    max-width: 33.333333%;\n  }\n  .col-lg-5 {\n    -ms-flex: 0 0 41.666667%;\n    flex: 0 0 41.666667%;\n    max-width: 41.666667%;\n  }\n  .col-lg-6 {\n    -ms-flex: 0 0 50%;\n    flex: 0 0 50%;\n    max-width: 50%;\n  }\n  .col-lg-7 {\n    -ms-flex: 0 0 58.333333%;\n    flex: 0 0 58.333333%;\n    max-width: 58.333333%;\n  }\n  .col-lg-8 {\n    -ms-flex: 0 0 66.666667%;\n    flex: 0 0 66.666667%;\n    max-width: 66.666667%;\n  }\n  .col-lg-9 {\n    -ms-flex: 0 0 75%;\n    flex: 0 0 75%;\n    max-width: 75%;\n  }\n  .col-lg-10 {\n    -ms-flex: 0 0 83.333333%;\n    flex: 0 0 83.333333%;\n    max-width: 83.333333%;\n  }\n  .col-lg-11 {\n    -ms-flex: 0 0 91.666667%;\n    flex: 0 0 91.666667%;\n    max-width: 91.666667%;\n  }\n  .col-lg-12 {\n    -ms-flex: 0 0 100%;\n    flex: 0 0 100%;\n    max-width: 100%;\n  }\n  .order-lg-first {\n    -ms-flex-order: -1;\n    order: -1;\n  }\n  .order-lg-last {\n    -ms-flex-order: 13;\n    order: 13;\n  }\n  .order-lg-0 {\n    -ms-flex-order: 0;\n    order: 0;\n  }\n  .order-lg-1 {\n    -ms-flex-order: 1;\n    order: 1;\n  }\n  .order-lg-2 {\n    -ms-flex-order: 2;\n    order: 2;\n  }\n  .order-lg-3 {\n    -ms-flex-order: 3;\n    order: 3;\n  }\n  .order-lg-4 {\n    -ms-flex-order: 4;\n    order: 4;\n  }\n  .order-lg-5 {\n    -ms-flex-order: 5;\n    order: 5;\n  }\n  .order-lg-6 {\n    -ms-flex-order: 6;\n    order: 6;\n  }\n  .order-lg-7 {\n    -ms-flex-order: 7;\n    order: 7;\n  }\n  .order-lg-8 {\n    -ms-flex-order: 8;\n    order: 8;\n  }\n  .order-lg-9 {\n    -ms-flex-order: 9;\n    order: 9;\n  }\n  .order-lg-10 {\n    -ms-flex-order: 10;\n    order: 10;\n  }\n  .order-lg-11 {\n    -ms-flex-order: 11;\n    order: 11;\n  }\n  .order-lg-12 {\n    -ms-flex-order: 12;\n    order: 12;\n  }\n  .offset-lg-0 {\n    margin-left: 0;\n  }\n  .offset-lg-1 {\n    margin-left: 8.333333%;\n  }\n  .offset-lg-2 {\n    margin-left: 16.666667%;\n  }\n  .offset-lg-3 {\n    margin-left: 25%;\n  }\n  .offset-lg-4 {\n    margin-left: 33.333333%;\n  }\n  .offset-lg-5 {\n    margin-left: 41.666667%;\n  }\n  .offset-lg-6 {\n    margin-left: 50%;\n  }\n  .offset-lg-7 {\n    margin-left: 58.333333%;\n  }\n  .offset-lg-8 {\n    margin-left: 66.666667%;\n  }\n  .offset-lg-9 {\n    margin-left: 75%;\n  }\n  .offset-lg-10 {\n    margin-left: 83.333333%;\n  }\n  .offset-lg-11 {\n    margin-left: 91.666667%;\n  }\n}\n\n@media (min-width: 1200px) {\n  .col-xl {\n    -ms-flex-preferred-size: 0;\n    flex-basis: 0;\n    -ms-flex-positive: 1;\n    flex-grow: 1;\n    max-width: 100%;\n  }\n  .row-cols-xl-1 > * {\n    -ms-flex: 0 0 100%;\n    flex: 0 0 100%;\n    max-width: 100%;\n  }\n  .row-cols-xl-2 > * {\n    -ms-flex: 0 0 50%;\n    flex: 0 0 50%;\n    max-width: 50%;\n  }\n  .row-cols-xl-3 > * {\n    -ms-flex: 0 0 33.333333%;\n    flex: 0 0 33.333333%;\n    max-width: 33.333333%;\n  }\n  .row-cols-xl-4 > * {\n    -ms-flex: 0 0 25%;\n    flex: 0 0 25%;\n    max-width: 25%;\n  }\n  .row-cols-xl-5 > * {\n    -ms-flex: 0 0 20%;\n    flex: 0 0 20%;\n    max-width: 20%;\n  }\n  .row-cols-xl-6 > * {\n    -ms-flex: 0 0 16.666667%;\n    flex: 0 0 16.666667%;\n    max-width: 16.666667%;\n  }\n  .col-xl-auto {\n    -ms-flex: 0 0 auto;\n    flex: 0 0 auto;\n    width: auto;\n    max-width: 100%;\n  }\n  .col-xl-1 {\n    -ms-flex: 0 0 8.333333%;\n    flex: 0 0 8.333333%;\n    max-width: 8.333333%;\n  }\n  .col-xl-2 {\n    -ms-flex: 0 0 16.666667%;\n    flex: 0 0 16.666667%;\n    max-width: 16.666667%;\n  }\n  .col-xl-3 {\n    -ms-flex: 0 0 25%;\n    flex: 0 0 25%;\n    max-width: 25%;\n  }\n  .col-xl-4 {\n    -ms-flex: 0 0 33.333333%;\n    flex: 0 0 33.333333%;\n    max-width: 33.333333%;\n  }\n  .col-xl-5 {\n    -ms-flex: 0 0 41.666667%;\n    flex: 0 0 41.666667%;\n    max-width: 41.666667%;\n  }\n  .col-xl-6 {\n    -ms-flex: 0 0 50%;\n    flex: 0 0 50%;\n    max-width: 50%;\n  }\n  .col-xl-7 {\n    -ms-flex: 0 0 58.333333%;\n    flex: 0 0 58.333333%;\n    max-width: 58.333333%;\n  }\n  .col-xl-8 {\n    -ms-flex: 0 0 66.666667%;\n    flex: 0 0 66.666667%;\n    max-width: 66.666667%;\n  }\n  .col-xl-9 {\n    -ms-flex: 0 0 75%;\n    flex: 0 0 75%;\n    max-width: 75%;\n  }\n  .col-xl-10 {\n    -ms-flex: 0 0 83.333333%;\n    flex: 0 0 83.333333%;\n    max-width: 83.333333%;\n  }\n  .col-xl-11 {\n    -ms-flex: 0 0 91.666667%;\n    flex: 0 0 91.666667%;\n    max-width: 91.666667%;\n  }\n  .col-xl-12 {\n    -ms-flex: 0 0 100%;\n    flex: 0 0 100%;\n    max-width: 100%;\n  }\n  .order-xl-first {\n    -ms-flex-order: -1;\n    order: -1;\n  }\n  .order-xl-last {\n    -ms-flex-order: 13;\n    order: 13;\n  }\n  .order-xl-0 {\n    -ms-flex-order: 0;\n    order: 0;\n  }\n  .order-xl-1 {\n    -ms-flex-order: 1;\n    order: 1;\n  }\n  .order-xl-2 {\n    -ms-flex-order: 2;\n    order: 2;\n  }\n  .order-xl-3 {\n    -ms-flex-order: 3;\n    order: 3;\n  }\n  .order-xl-4 {\n    -ms-flex-order: 4;\n    order: 4;\n  }\n  .order-xl-5 {\n    -ms-flex-order: 5;\n    order: 5;\n  }\n  .order-xl-6 {\n    -ms-flex-order: 6;\n    order: 6;\n  }\n  .order-xl-7 {\n    -ms-flex-order: 7;\n    order: 7;\n  }\n  .order-xl-8 {\n    -ms-flex-order: 8;\n    order: 8;\n  }\n  .order-xl-9 {\n    -ms-flex-order: 9;\n    order: 9;\n  }\n  .order-xl-10 {\n    -ms-flex-order: 10;\n    order: 10;\n  }\n  .order-xl-11 {\n    -ms-flex-order: 11;\n    order: 11;\n  }\n  .order-xl-12 {\n    -ms-flex-order: 12;\n    order: 12;\n  }\n  .offset-xl-0 {\n    margin-left: 0;\n  }\n  .offset-xl-1 {\n    margin-left: 8.333333%;\n  }\n  .offset-xl-2 {\n    margin-left: 16.666667%;\n  }\n  .offset-xl-3 {\n    margin-left: 25%;\n  }\n  .offset-xl-4 {\n    margin-left: 33.333333%;\n  }\n  .offset-xl-5 {\n    margin-left: 41.666667%;\n  }\n  .offset-xl-6 {\n    margin-left: 50%;\n  }\n  .offset-xl-7 {\n    margin-left: 58.333333%;\n  }\n  .offset-xl-8 {\n    margin-left: 66.666667%;\n  }\n  .offset-xl-9 {\n    margin-left: 75%;\n  }\n  .offset-xl-10 {\n    margin-left: 83.333333%;\n  }\n  .offset-xl-11 {\n    margin-left: 91.666667%;\n  }\n}\n\n.table {\n  width: 100%;\n  margin-bottom: 1rem;\n  color: #212529;\n}\n\n.table th,\n.table td {\n  padding: 0.75rem;\n  vertical-align: top;\n  border-top: 1px solid #dee2e6;\n}\n\n.table thead th {\n  vertical-align: bottom;\n  border-bottom: 2px solid #dee2e6;\n}\n\n.table tbody + tbody {\n  border-top: 2px solid #dee2e6;\n}\n\n.table-sm th,\n.table-sm td {\n  padding: 0.3rem;\n}\n\n.table-bordered {\n  border: 1px solid #dee2e6;\n}\n\n.table-bordered th,\n.table-bordered td {\n  border: 1px solid #dee2e6;\n}\n\n.table-bordered thead th,\n.table-bordered thead td {\n  border-bottom-width: 2px;\n}\n\n.table-borderless th,\n.table-borderless td,\n.table-borderless thead th,\n.table-borderless tbody + tbody {\n  border: 0;\n}\n\n.table-striped tbody tr:nth-of-type(odd) {\n  background-color: rgba(0, 0, 0, 0.05);\n}\n\n.table-hover tbody tr:hover {\n  color: #212529;\n  background-color: rgba(0, 0, 0, 0.075);\n}\n\n.table-primary,\n.table-primary > th,\n.table-primary > td {\n  background-color: #b8daff;\n}\n\n.table-primary th,\n.table-primary td,\n.table-primary thead th,\n.table-primary tbody + tbody {\n  border-color: #7abaff;\n}\n\n.table-hover .table-primary:hover {\n  background-color: #9fcdff;\n}\n\n.table-hover .table-primary:hover > td,\n.table-hover .table-primary:hover > th {\n  background-color: #9fcdff;\n}\n\n.table-secondary,\n.table-secondary > th,\n.table-secondary > td {\n  background-color: #d6d8db;\n}\n\n.table-secondary th,\n.table-secondary td,\n.table-secondary thead th,\n.table-secondary tbody + tbody {\n  border-color: #b3b7bb;\n}\n\n.table-hover .table-secondary:hover {\n  background-color: #c8cbcf;\n}\n\n.table-hover .table-secondary:hover > td,\n.table-hover .table-secondary:hover > th {\n  background-color: #c8cbcf;\n}\n\n.table-success,\n.table-success > th,\n.table-success > td {\n  background-color: #c3e6cb;\n}\n\n.table-success th,\n.table-success td,\n.table-success thead th,\n.table-success tbody + tbody {\n  border-color: #8fd19e;\n}\n\n.table-hover .table-success:hover {\n  background-color: #b1dfbb;\n}\n\n.table-hover .table-success:hover > td,\n.table-hover .table-success:hover > th {\n  background-color: #b1dfbb;\n}\n\n.table-info,\n.table-info > th,\n.table-info > td {\n  background-color: #bee5eb;\n}\n\n.table-info th,\n.table-info td,\n.table-info thead th,\n.table-info tbody + tbody {\n  border-color: #86cfda;\n}\n\n.table-hover .table-info:hover {\n  background-color: #abdde5;\n}\n\n.table-hover .table-info:hover > td,\n.table-hover .table-info:hover > th {\n  background-color: #abdde5;\n}\n\n.table-warning,\n.table-warning > th,\n.table-warning > td {\n  background-color: #ffeeba;\n}\n\n.table-warning th,\n.table-warning td,\n.table-warning thead th,\n.table-warning tbody + tbody {\n  border-color: #ffdf7e;\n}\n\n.table-hover .table-warning:hover {\n  background-color: #ffe8a1;\n}\n\n.table-hover .table-warning:hover > td,\n.table-hover .table-warning:hover > th {\n  background-color: #ffe8a1;\n}\n\n.table-danger,\n.table-danger > th,\n.table-danger > td {\n  background-color: #f5c6cb;\n}\n\n.table-danger th,\n.table-danger td,\n.table-danger thead th,\n.table-danger tbody + tbody {\n  border-color: #ed969e;\n}\n\n.table-hover .table-danger:hover {\n  background-color: #f1b0b7;\n}\n\n.table-hover .table-danger:hover > td,\n.table-hover .table-danger:hover > th {\n  background-color: #f1b0b7;\n}\n\n.table-light,\n.table-light > th,\n.table-light > td {\n  background-color: #fdfdfe;\n}\n\n.table-light th,\n.table-light td,\n.table-light thead th,\n.table-light tbody + tbody {\n  border-color: #fbfcfc;\n}\n\n.table-hover .table-light:hover {\n  background-color: #ececf6;\n}\n\n.table-hover .table-light:hover > td,\n.table-hover .table-light:hover > th {\n  background-color: #ececf6;\n}\n\n.table-dark,\n.table-dark > th,\n.table-dark > td {\n  background-color: #c6c8ca;\n}\n\n.table-dark th,\n.table-dark td,\n.table-dark thead th,\n.table-dark tbody + tbody {\n  border-color: #95999c;\n}\n\n.table-hover .table-dark:hover {\n  background-color: #b9bbbe;\n}\n\n.table-hover .table-dark:hover > td,\n.table-hover .table-dark:hover > th {\n  background-color: #b9bbbe;\n}\n\n.table-active,\n.table-active > th,\n.table-active > td {\n  background-color: rgba(0, 0, 0, 0.075);\n}\n\n.table-hover .table-active:hover {\n  background-color: rgba(0, 0, 0, 0.075);\n}\n\n.table-hover .table-active:hover > td,\n.table-hover .table-active:hover > th {\n  background-color: rgba(0, 0, 0, 0.075);\n}\n\n.table .thead-dark th {\n  color: #fff;\n  background-color: #343a40;\n  border-color: #454d55;\n}\n\n.table .thead-light th {\n  color: #495057;\n  background-color: #e9ecef;\n  border-color: #dee2e6;\n}\n\n.table-dark {\n  color: #fff;\n  background-color: #343a40;\n}\n\n.table-dark th,\n.table-dark td,\n.table-dark thead th {\n  border-color: #454d55;\n}\n\n.table-dark.table-bordered {\n  border: 0;\n}\n\n.table-dark.table-striped tbody tr:nth-of-type(odd) {\n  background-color: rgba(255, 255, 255, 0.05);\n}\n\n.table-dark.table-hover tbody tr:hover {\n  color: #fff;\n  background-color: rgba(255, 255, 255, 0.075);\n}\n\n@media (max-width: 575.98px) {\n  .table-responsive-sm {\n    display: block;\n    width: 100%;\n    overflow-x: auto;\n    -webkit-overflow-scrolling: touch;\n  }\n  .table-responsive-sm > .table-bordered {\n    border: 0;\n  }\n}\n\n@media (max-width: 767.98px) {\n  .table-responsive-md {\n    display: block;\n    width: 100%;\n    overflow-x: auto;\n    -webkit-overflow-scrolling: touch;\n  }\n  .table-responsive-md > .table-bordered {\n    border: 0;\n  }\n}\n\n@media (max-width: 991.98px) {\n  .table-responsive-lg {\n    display: block;\n    width: 100%;\n    overflow-x: auto;\n    -webkit-overflow-scrolling: touch;\n  }\n  .table-responsive-lg > .table-bordered {\n    border: 0;\n  }\n}\n\n@media (max-width: 1199.98px) {\n  .table-responsive-xl {\n    display: block;\n    width: 100%;\n    overflow-x: auto;\n    -webkit-overflow-scrolling: touch;\n  }\n  .table-responsive-xl > .table-bordered {\n    border: 0;\n  }\n}\n\n.table-responsive {\n  display: block;\n  width: 100%;\n  overflow-x: auto;\n  -webkit-overflow-scrolling: touch;\n}\n\n.table-responsive > .table-bordered {\n  border: 0;\n}\n\n.form-control {\n  display: block;\n  width: 100%;\n  height: calc(1.5em + 0.75rem + 2px);\n  padding: 0.375rem 0.75rem;\n  font-size: 1rem;\n  font-weight: 400;\n  line-height: 1.5;\n  color: #495057;\n  background-color: #fff;\n  background-clip: padding-box;\n  border: 1px solid #ced4da;\n  border-radius: 0.25rem;\n  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .form-control {\n    transition: none;\n  }\n}\n\n.form-control::-ms-expand {\n  background-color: transparent;\n  border: 0;\n}\n\n.form-control:focus {\n  color: #495057;\n  background-color: #fff;\n  border-color: #80bdff;\n  outline: 0;\n  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);\n}\n\n.form-control::-webkit-input-placeholder {\n  color: #6c757d;\n  opacity: 1;\n}\n\n.form-control::-moz-placeholder {\n  color: #6c757d;\n  opacity: 1;\n}\n\n.form-control:-ms-input-placeholder {\n  color: #6c757d;\n  opacity: 1;\n}\n\n.form-control::-ms-input-placeholder {\n  color: #6c757d;\n  opacity: 1;\n}\n\n.form-control::placeholder {\n  color: #6c757d;\n  opacity: 1;\n}\n\n.form-control:disabled, .form-control[readonly] {\n  background-color: #e9ecef;\n  opacity: 1;\n}\n\ninput[type=\"date\"].form-control,\ninput[type=\"time\"].form-control,\ninput[type=\"datetime-local\"].form-control,\ninput[type=\"month\"].form-control {\n  -webkit-appearance: none;\n  -moz-appearance: none;\n  appearance: none;\n}\n\nselect.form-control:-moz-focusring {\n  color: transparent;\n  text-shadow: 0 0 0 #495057;\n}\n\nselect.form-control:focus::-ms-value {\n  color: #495057;\n  background-color: #fff;\n}\n\n.form-control-file,\n.form-control-range {\n  display: block;\n  width: 100%;\n}\n\n.col-form-label {\n  padding-top: calc(0.375rem + 1px);\n  padding-bottom: calc(0.375rem + 1px);\n  margin-bottom: 0;\n  font-size: inherit;\n  line-height: 1.5;\n}\n\n.col-form-label-lg {\n  padding-top: calc(0.5rem + 1px);\n  padding-bottom: calc(0.5rem + 1px);\n  font-size: 1.25rem;\n  line-height: 1.5;\n}\n\n.col-form-label-sm {\n  padding-top: calc(0.25rem + 1px);\n  padding-bottom: calc(0.25rem + 1px);\n  font-size: 0.875rem;\n  line-height: 1.5;\n}\n\n.form-control-plaintext {\n  display: block;\n  width: 100%;\n  padding: 0.375rem 0;\n  margin-bottom: 0;\n  font-size: 1rem;\n  line-height: 1.5;\n  color: #212529;\n  background-color: transparent;\n  border: solid transparent;\n  border-width: 1px 0;\n}\n\n.form-control-plaintext.form-control-sm, .form-control-plaintext.form-control-lg {\n  padding-right: 0;\n  padding-left: 0;\n}\n\n.form-control-sm {\n  height: calc(1.5em + 0.5rem + 2px);\n  padding: 0.25rem 0.5rem;\n  font-size: 0.875rem;\n  line-height: 1.5;\n  border-radius: 0.2rem;\n}\n\n.form-control-lg {\n  height: calc(1.5em + 1rem + 2px);\n  padding: 0.5rem 1rem;\n  font-size: 1.25rem;\n  line-height: 1.5;\n  border-radius: 0.3rem;\n}\n\nselect.form-control[size], select.form-control[multiple] {\n  height: auto;\n}\n\ntextarea.form-control {\n  height: auto;\n}\n\n.form-group {\n  margin-bottom: 1rem;\n}\n\n.form-text {\n  display: block;\n  margin-top: 0.25rem;\n}\n\n.form-row {\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-wrap: wrap;\n  flex-wrap: wrap;\n  margin-right: -5px;\n  margin-left: -5px;\n}\n\n.form-row > .col,\n.form-row > [class*=\"col-\"] {\n  padding-right: 5px;\n  padding-left: 5px;\n}\n\n.form-check {\n  position: relative;\n  display: block;\n  padding-left: 1.25rem;\n}\n\n.form-check-input {\n  position: absolute;\n  margin-top: 0.3rem;\n  margin-left: -1.25rem;\n}\n\n.form-check-input[disabled] ~ .form-check-label,\n.form-check-input:disabled ~ .form-check-label {\n  color: #6c757d;\n}\n\n.form-check-label {\n  margin-bottom: 0;\n}\n\n.form-check-inline {\n  display: -ms-inline-flexbox;\n  display: inline-flex;\n  -ms-flex-align: center;\n  align-items: center;\n  padding-left: 0;\n  margin-right: 0.75rem;\n}\n\n.form-check-inline .form-check-input {\n  position: static;\n  margin-top: 0;\n  margin-right: 0.3125rem;\n  margin-left: 0;\n}\n\n.valid-feedback {\n  display: none;\n  width: 100%;\n  margin-top: 0.25rem;\n  font-size: 0.875em;\n  color: #28a745;\n}\n\n.valid-tooltip {\n  position: absolute;\n  top: 100%;\n  left: 0;\n  z-index: 5;\n  display: none;\n  max-width: 100%;\n  padding: 0.25rem 0.5rem;\n  margin-top: .1rem;\n  font-size: 0.875rem;\n  line-height: 1.5;\n  color: #fff;\n  background-color: rgba(40, 167, 69, 0.9);\n  border-radius: 0.25rem;\n}\n\n.form-row > .col > .valid-tooltip,\n.form-row > [class*=\"col-\"] > .valid-tooltip {\n  left: 5px;\n}\n\n.was-validated :valid ~ .valid-feedback,\n.was-validated :valid ~ .valid-tooltip,\n.is-valid ~ .valid-feedback,\n.is-valid ~ .valid-tooltip {\n  display: block;\n}\n\n.was-validated .form-control:valid, .form-control.is-valid {\n  border-color: #28a745;\n  padding-right: calc(1.5em + 0.75rem) !important;\n  background-image: url(" + ___CSS_LOADER_URL_REPLACEMENT_0___ + ");\n  background-repeat: no-repeat;\n  background-position: right calc(0.375em + 0.1875rem) center;\n  background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);\n}\n\n.was-validated .form-control:valid:focus, .form-control.is-valid:focus {\n  border-color: #28a745;\n  box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25);\n}\n\n.was-validated select.form-control:valid, select.form-control.is-valid {\n  padding-right: 3rem !important;\n  background-position: right 1.5rem center;\n}\n\n.was-validated textarea.form-control:valid, textarea.form-control.is-valid {\n  padding-right: calc(1.5em + 0.75rem);\n  background-position: top calc(0.375em + 0.1875rem) right calc(0.375em + 0.1875rem);\n}\n\n.was-validated .custom-select:valid, .custom-select.is-valid {\n  border-color: #28a745;\n  padding-right: calc(0.75em + 2.3125rem) !important;\n  background: url(" + ___CSS_LOADER_URL_REPLACEMENT_1___ + ") right 0.75rem center/8px 10px no-repeat, #fff url(" + ___CSS_LOADER_URL_REPLACEMENT_0___ + ") center right 1.75rem/calc(0.75em + 0.375rem) calc(0.75em + 0.375rem) no-repeat;\n}\n\n.was-validated .custom-select:valid:focus, .custom-select.is-valid:focus {\n  border-color: #28a745;\n  box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25);\n}\n\n.was-validated .form-check-input:valid ~ .form-check-label, .form-check-input.is-valid ~ .form-check-label {\n  color: #28a745;\n}\n\n.was-validated .form-check-input:valid ~ .valid-feedback,\n.was-validated .form-check-input:valid ~ .valid-tooltip, .form-check-input.is-valid ~ .valid-feedback,\n.form-check-input.is-valid ~ .valid-tooltip {\n  display: block;\n}\n\n.was-validated .custom-control-input:valid ~ .custom-control-label, .custom-control-input.is-valid ~ .custom-control-label {\n  color: #28a745;\n}\n\n.was-validated .custom-control-input:valid ~ .custom-control-label::before, .custom-control-input.is-valid ~ .custom-control-label::before {\n  border-color: #28a745;\n}\n\n.was-validated .custom-control-input:valid:checked ~ .custom-control-label::before, .custom-control-input.is-valid:checked ~ .custom-control-label::before {\n  border-color: #34ce57;\n  background-color: #34ce57;\n}\n\n.was-validated .custom-control-input:valid:focus ~ .custom-control-label::before, .custom-control-input.is-valid:focus ~ .custom-control-label::before {\n  box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25);\n}\n\n.was-validated .custom-control-input:valid:focus:not(:checked) ~ .custom-control-label::before, .custom-control-input.is-valid:focus:not(:checked) ~ .custom-control-label::before {\n  border-color: #28a745;\n}\n\n.was-validated .custom-file-input:valid ~ .custom-file-label, .custom-file-input.is-valid ~ .custom-file-label {\n  border-color: #28a745;\n}\n\n.was-validated .custom-file-input:valid:focus ~ .custom-file-label, .custom-file-input.is-valid:focus ~ .custom-file-label {\n  border-color: #28a745;\n  box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25);\n}\n\n.invalid-feedback {\n  display: none;\n  width: 100%;\n  margin-top: 0.25rem;\n  font-size: 0.875em;\n  color: #dc3545;\n}\n\n.invalid-tooltip {\n  position: absolute;\n  top: 100%;\n  left: 0;\n  z-index: 5;\n  display: none;\n  max-width: 100%;\n  padding: 0.25rem 0.5rem;\n  margin-top: .1rem;\n  font-size: 0.875rem;\n  line-height: 1.5;\n  color: #fff;\n  background-color: rgba(220, 53, 69, 0.9);\n  border-radius: 0.25rem;\n}\n\n.form-row > .col > .invalid-tooltip,\n.form-row > [class*=\"col-\"] > .invalid-tooltip {\n  left: 5px;\n}\n\n.was-validated :invalid ~ .invalid-feedback,\n.was-validated :invalid ~ .invalid-tooltip,\n.is-invalid ~ .invalid-feedback,\n.is-invalid ~ .invalid-tooltip {\n  display: block;\n}\n\n.was-validated .form-control:invalid, .form-control.is-invalid {\n  border-color: #dc3545;\n  padding-right: calc(1.5em + 0.75rem) !important;\n  background-image: url(" + ___CSS_LOADER_URL_REPLACEMENT_2___ + ");\n  background-repeat: no-repeat;\n  background-position: right calc(0.375em + 0.1875rem) center;\n  background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);\n}\n\n.was-validated .form-control:invalid:focus, .form-control.is-invalid:focus {\n  border-color: #dc3545;\n  box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);\n}\n\n.was-validated select.form-control:invalid, select.form-control.is-invalid {\n  padding-right: 3rem !important;\n  background-position: right 1.5rem center;\n}\n\n.was-validated textarea.form-control:invalid, textarea.form-control.is-invalid {\n  padding-right: calc(1.5em + 0.75rem);\n  background-position: top calc(0.375em + 0.1875rem) right calc(0.375em + 0.1875rem);\n}\n\n.was-validated .custom-select:invalid, .custom-select.is-invalid {\n  border-color: #dc3545;\n  padding-right: calc(0.75em + 2.3125rem) !important;\n  background: url(" + ___CSS_LOADER_URL_REPLACEMENT_1___ + ") right 0.75rem center/8px 10px no-repeat, #fff url(" + ___CSS_LOADER_URL_REPLACEMENT_2___ + ") center right 1.75rem/calc(0.75em + 0.375rem) calc(0.75em + 0.375rem) no-repeat;\n}\n\n.was-validated .custom-select:invalid:focus, .custom-select.is-invalid:focus {\n  border-color: #dc3545;\n  box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);\n}\n\n.was-validated .form-check-input:invalid ~ .form-check-label, .form-check-input.is-invalid ~ .form-check-label {\n  color: #dc3545;\n}\n\n.was-validated .form-check-input:invalid ~ .invalid-feedback,\n.was-validated .form-check-input:invalid ~ .invalid-tooltip, .form-check-input.is-invalid ~ .invalid-feedback,\n.form-check-input.is-invalid ~ .invalid-tooltip {\n  display: block;\n}\n\n.was-validated .custom-control-input:invalid ~ .custom-control-label, .custom-control-input.is-invalid ~ .custom-control-label {\n  color: #dc3545;\n}\n\n.was-validated .custom-control-input:invalid ~ .custom-control-label::before, .custom-control-input.is-invalid ~ .custom-control-label::before {\n  border-color: #dc3545;\n}\n\n.was-validated .custom-control-input:invalid:checked ~ .custom-control-label::before, .custom-control-input.is-invalid:checked ~ .custom-control-label::before {\n  border-color: #e4606d;\n  background-color: #e4606d;\n}\n\n.was-validated .custom-control-input:invalid:focus ~ .custom-control-label::before, .custom-control-input.is-invalid:focus ~ .custom-control-label::before {\n  box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);\n}\n\n.was-validated .custom-control-input:invalid:focus:not(:checked) ~ .custom-control-label::before, .custom-control-input.is-invalid:focus:not(:checked) ~ .custom-control-label::before {\n  border-color: #dc3545;\n}\n\n.was-validated .custom-file-input:invalid ~ .custom-file-label, .custom-file-input.is-invalid ~ .custom-file-label {\n  border-color: #dc3545;\n}\n\n.was-validated .custom-file-input:invalid:focus ~ .custom-file-label, .custom-file-input.is-invalid:focus ~ .custom-file-label {\n  border-color: #dc3545;\n  box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);\n}\n\n.form-inline {\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-flow: row wrap;\n  flex-flow: row wrap;\n  -ms-flex-align: center;\n  align-items: center;\n}\n\n.form-inline .form-check {\n  width: 100%;\n}\n\n@media (min-width: 576px) {\n  .form-inline label {\n    display: -ms-flexbox;\n    display: flex;\n    -ms-flex-align: center;\n    align-items: center;\n    -ms-flex-pack: center;\n    justify-content: center;\n    margin-bottom: 0;\n  }\n  .form-inline .form-group {\n    display: -ms-flexbox;\n    display: flex;\n    -ms-flex: 0 0 auto;\n    flex: 0 0 auto;\n    -ms-flex-flow: row wrap;\n    flex-flow: row wrap;\n    -ms-flex-align: center;\n    align-items: center;\n    margin-bottom: 0;\n  }\n  .form-inline .form-control {\n    display: inline-block;\n    width: auto;\n    vertical-align: middle;\n  }\n  .form-inline .form-control-plaintext {\n    display: inline-block;\n  }\n  .form-inline .input-group,\n  .form-inline .custom-select {\n    width: auto;\n  }\n  .form-inline .form-check {\n    display: -ms-flexbox;\n    display: flex;\n    -ms-flex-align: center;\n    align-items: center;\n    -ms-flex-pack: center;\n    justify-content: center;\n    width: auto;\n    padding-left: 0;\n  }\n  .form-inline .form-check-input {\n    position: relative;\n    -ms-flex-negative: 0;\n    flex-shrink: 0;\n    margin-top: 0;\n    margin-right: 0.25rem;\n    margin-left: 0;\n  }\n  .form-inline .custom-control {\n    -ms-flex-align: center;\n    align-items: center;\n    -ms-flex-pack: center;\n    justify-content: center;\n  }\n  .form-inline .custom-control-label {\n    margin-bottom: 0;\n  }\n}\n\n.btn {\n  display: inline-block;\n  font-weight: 400;\n  color: #212529;\n  text-align: center;\n  vertical-align: middle;\n  -webkit-user-select: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n  user-select: none;\n  background-color: transparent;\n  border: 1px solid transparent;\n  padding: 0.375rem 0.75rem;\n  font-size: 1rem;\n  line-height: 1.5;\n  border-radius: 0.25rem;\n  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .btn {\n    transition: none;\n  }\n}\n\n.btn:hover {\n  color: #212529;\n  text-decoration: none;\n}\n\n.btn:focus, .btn.focus {\n  outline: 0;\n  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);\n}\n\n.btn.disabled, .btn:disabled {\n  opacity: 0.65;\n}\n\n.btn:not(:disabled):not(.disabled) {\n  cursor: pointer;\n}\n\na.btn.disabled,\nfieldset:disabled a.btn {\n  pointer-events: none;\n}\n\n.btn-primary {\n  color: #fff;\n  background-color: #007bff;\n  border-color: #007bff;\n}\n\n.btn-primary:hover {\n  color: #fff;\n  background-color: #0069d9;\n  border-color: #0062cc;\n}\n\n.btn-primary:focus, .btn-primary.focus {\n  color: #fff;\n  background-color: #0069d9;\n  border-color: #0062cc;\n  box-shadow: 0 0 0 0.2rem rgba(38, 143, 255, 0.5);\n}\n\n.btn-primary.disabled, .btn-primary:disabled {\n  color: #fff;\n  background-color: #007bff;\n  border-color: #007bff;\n}\n\n.btn-primary:not(:disabled):not(.disabled):active, .btn-primary:not(:disabled):not(.disabled).active,\n.show > .btn-primary.dropdown-toggle {\n  color: #fff;\n  background-color: #0062cc;\n  border-color: #005cbf;\n}\n\n.btn-primary:not(:disabled):not(.disabled):active:focus, .btn-primary:not(:disabled):not(.disabled).active:focus,\n.show > .btn-primary.dropdown-toggle:focus {\n  box-shadow: 0 0 0 0.2rem rgba(38, 143, 255, 0.5);\n}\n\n.btn-secondary {\n  color: #fff;\n  background-color: #6c757d;\n  border-color: #6c757d;\n}\n\n.btn-secondary:hover {\n  color: #fff;\n  background-color: #5a6268;\n  border-color: #545b62;\n}\n\n.btn-secondary:focus, .btn-secondary.focus {\n  color: #fff;\n  background-color: #5a6268;\n  border-color: #545b62;\n  box-shadow: 0 0 0 0.2rem rgba(130, 138, 145, 0.5);\n}\n\n.btn-secondary.disabled, .btn-secondary:disabled {\n  color: #fff;\n  background-color: #6c757d;\n  border-color: #6c757d;\n}\n\n.btn-secondary:not(:disabled):not(.disabled):active, .btn-secondary:not(:disabled):not(.disabled).active,\n.show > .btn-secondary.dropdown-toggle {\n  color: #fff;\n  background-color: #545b62;\n  border-color: #4e555b;\n}\n\n.btn-secondary:not(:disabled):not(.disabled):active:focus, .btn-secondary:not(:disabled):not(.disabled).active:focus,\n.show > .btn-secondary.dropdown-toggle:focus {\n  box-shadow: 0 0 0 0.2rem rgba(130, 138, 145, 0.5);\n}\n\n.btn-success {\n  color: #fff;\n  background-color: #28a745;\n  border-color: #28a745;\n}\n\n.btn-success:hover {\n  color: #fff;\n  background-color: #218838;\n  border-color: #1e7e34;\n}\n\n.btn-success:focus, .btn-success.focus {\n  color: #fff;\n  background-color: #218838;\n  border-color: #1e7e34;\n  box-shadow: 0 0 0 0.2rem rgba(72, 180, 97, 0.5);\n}\n\n.btn-success.disabled, .btn-success:disabled {\n  color: #fff;\n  background-color: #28a745;\n  border-color: #28a745;\n}\n\n.btn-success:not(:disabled):not(.disabled):active, .btn-success:not(:disabled):not(.disabled).active,\n.show > .btn-success.dropdown-toggle {\n  color: #fff;\n  background-color: #1e7e34;\n  border-color: #1c7430;\n}\n\n.btn-success:not(:disabled):not(.disabled):active:focus, .btn-success:not(:disabled):not(.disabled).active:focus,\n.show > .btn-success.dropdown-toggle:focus {\n  box-shadow: 0 0 0 0.2rem rgba(72, 180, 97, 0.5);\n}\n\n.btn-info {\n  color: #fff;\n  background-color: #17a2b8;\n  border-color: #17a2b8;\n}\n\n.btn-info:hover {\n  color: #fff;\n  background-color: #138496;\n  border-color: #117a8b;\n}\n\n.btn-info:focus, .btn-info.focus {\n  color: #fff;\n  background-color: #138496;\n  border-color: #117a8b;\n  box-shadow: 0 0 0 0.2rem rgba(58, 176, 195, 0.5);\n}\n\n.btn-info.disabled, .btn-info:disabled {\n  color: #fff;\n  background-color: #17a2b8;\n  border-color: #17a2b8;\n}\n\n.btn-info:not(:disabled):not(.disabled):active, .btn-info:not(:disabled):not(.disabled).active,\n.show > .btn-info.dropdown-toggle {\n  color: #fff;\n  background-color: #117a8b;\n  border-color: #10707f;\n}\n\n.btn-info:not(:disabled):not(.disabled):active:focus, .btn-info:not(:disabled):not(.disabled).active:focus,\n.show > .btn-info.dropdown-toggle:focus {\n  box-shadow: 0 0 0 0.2rem rgba(58, 176, 195, 0.5);\n}\n\n.btn-warning {\n  color: #212529;\n  background-color: #ffc107;\n  border-color: #ffc107;\n}\n\n.btn-warning:hover {\n  color: #212529;\n  background-color: #e0a800;\n  border-color: #d39e00;\n}\n\n.btn-warning:focus, .btn-warning.focus {\n  color: #212529;\n  background-color: #e0a800;\n  border-color: #d39e00;\n  box-shadow: 0 0 0 0.2rem rgba(222, 170, 12, 0.5);\n}\n\n.btn-warning.disabled, .btn-warning:disabled {\n  color: #212529;\n  background-color: #ffc107;\n  border-color: #ffc107;\n}\n\n.btn-warning:not(:disabled):not(.disabled):active, .btn-warning:not(:disabled):not(.disabled).active,\n.show > .btn-warning.dropdown-toggle {\n  color: #212529;\n  background-color: #d39e00;\n  border-color: #c69500;\n}\n\n.btn-warning:not(:disabled):not(.disabled):active:focus, .btn-warning:not(:disabled):not(.disabled).active:focus,\n.show > .btn-warning.dropdown-toggle:focus {\n  box-shadow: 0 0 0 0.2rem rgba(222, 170, 12, 0.5);\n}\n\n.btn-danger {\n  color: #fff;\n  background-color: #dc3545;\n  border-color: #dc3545;\n}\n\n.btn-danger:hover {\n  color: #fff;\n  background-color: #c82333;\n  border-color: #bd2130;\n}\n\n.btn-danger:focus, .btn-danger.focus {\n  color: #fff;\n  background-color: #c82333;\n  border-color: #bd2130;\n  box-shadow: 0 0 0 0.2rem rgba(225, 83, 97, 0.5);\n}\n\n.btn-danger.disabled, .btn-danger:disabled {\n  color: #fff;\n  background-color: #dc3545;\n  border-color: #dc3545;\n}\n\n.btn-danger:not(:disabled):not(.disabled):active, .btn-danger:not(:disabled):not(.disabled).active,\n.show > .btn-danger.dropdown-toggle {\n  color: #fff;\n  background-color: #bd2130;\n  border-color: #b21f2d;\n}\n\n.btn-danger:not(:disabled):not(.disabled):active:focus, .btn-danger:not(:disabled):not(.disabled).active:focus,\n.show > .btn-danger.dropdown-toggle:focus {\n  box-shadow: 0 0 0 0.2rem rgba(225, 83, 97, 0.5);\n}\n\n.btn-light {\n  color: #212529;\n  background-color: #f8f9fa;\n  border-color: #f8f9fa;\n}\n\n.btn-light:hover {\n  color: #212529;\n  background-color: #e2e6ea;\n  border-color: #dae0e5;\n}\n\n.btn-light:focus, .btn-light.focus {\n  color: #212529;\n  background-color: #e2e6ea;\n  border-color: #dae0e5;\n  box-shadow: 0 0 0 0.2rem rgba(216, 217, 219, 0.5);\n}\n\n.btn-light.disabled, .btn-light:disabled {\n  color: #212529;\n  background-color: #f8f9fa;\n  border-color: #f8f9fa;\n}\n\n.btn-light:not(:disabled):not(.disabled):active, .btn-light:not(:disabled):not(.disabled).active,\n.show > .btn-light.dropdown-toggle {\n  color: #212529;\n  background-color: #dae0e5;\n  border-color: #d3d9df;\n}\n\n.btn-light:not(:disabled):not(.disabled):active:focus, .btn-light:not(:disabled):not(.disabled).active:focus,\n.show > .btn-light.dropdown-toggle:focus {\n  box-shadow: 0 0 0 0.2rem rgba(216, 217, 219, 0.5);\n}\n\n.btn-dark {\n  color: #fff;\n  background-color: #343a40;\n  border-color: #343a40;\n}\n\n.btn-dark:hover {\n  color: #fff;\n  background-color: #23272b;\n  border-color: #1d2124;\n}\n\n.btn-dark:focus, .btn-dark.focus {\n  color: #fff;\n  background-color: #23272b;\n  border-color: #1d2124;\n  box-shadow: 0 0 0 0.2rem rgba(82, 88, 93, 0.5);\n}\n\n.btn-dark.disabled, .btn-dark:disabled {\n  color: #fff;\n  background-color: #343a40;\n  border-color: #343a40;\n}\n\n.btn-dark:not(:disabled):not(.disabled):active, .btn-dark:not(:disabled):not(.disabled).active,\n.show > .btn-dark.dropdown-toggle {\n  color: #fff;\n  background-color: #1d2124;\n  border-color: #171a1d;\n}\n\n.btn-dark:not(:disabled):not(.disabled):active:focus, .btn-dark:not(:disabled):not(.disabled).active:focus,\n.show > .btn-dark.dropdown-toggle:focus {\n  box-shadow: 0 0 0 0.2rem rgba(82, 88, 93, 0.5);\n}\n\n.btn-outline-primary {\n  color: #007bff;\n  border-color: #007bff;\n}\n\n.btn-outline-primary:hover {\n  color: #fff;\n  background-color: #007bff;\n  border-color: #007bff;\n}\n\n.btn-outline-primary:focus, .btn-outline-primary.focus {\n  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.5);\n}\n\n.btn-outline-primary.disabled, .btn-outline-primary:disabled {\n  color: #007bff;\n  background-color: transparent;\n}\n\n.btn-outline-primary:not(:disabled):not(.disabled):active, .btn-outline-primary:not(:disabled):not(.disabled).active,\n.show > .btn-outline-primary.dropdown-toggle {\n  color: #fff;\n  background-color: #007bff;\n  border-color: #007bff;\n}\n\n.btn-outline-primary:not(:disabled):not(.disabled):active:focus, .btn-outline-primary:not(:disabled):not(.disabled).active:focus,\n.show > .btn-outline-primary.dropdown-toggle:focus {\n  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.5);\n}\n\n.btn-outline-secondary {\n  color: #6c757d;\n  border-color: #6c757d;\n}\n\n.btn-outline-secondary:hover {\n  color: #fff;\n  background-color: #6c757d;\n  border-color: #6c757d;\n}\n\n.btn-outline-secondary:focus, .btn-outline-secondary.focus {\n  box-shadow: 0 0 0 0.2rem rgba(108, 117, 125, 0.5);\n}\n\n.btn-outline-secondary.disabled, .btn-outline-secondary:disabled {\n  color: #6c757d;\n  background-color: transparent;\n}\n\n.btn-outline-secondary:not(:disabled):not(.disabled):active, .btn-outline-secondary:not(:disabled):not(.disabled).active,\n.show > .btn-outline-secondary.dropdown-toggle {\n  color: #fff;\n  background-color: #6c757d;\n  border-color: #6c757d;\n}\n\n.btn-outline-secondary:not(:disabled):not(.disabled):active:focus, .btn-outline-secondary:not(:disabled):not(.disabled).active:focus,\n.show > .btn-outline-secondary.dropdown-toggle:focus {\n  box-shadow: 0 0 0 0.2rem rgba(108, 117, 125, 0.5);\n}\n\n.btn-outline-success {\n  color: #28a745;\n  border-color: #28a745;\n}\n\n.btn-outline-success:hover {\n  color: #fff;\n  background-color: #28a745;\n  border-color: #28a745;\n}\n\n.btn-outline-success:focus, .btn-outline-success.focus {\n  box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.5);\n}\n\n.btn-outline-success.disabled, .btn-outline-success:disabled {\n  color: #28a745;\n  background-color: transparent;\n}\n\n.btn-outline-success:not(:disabled):not(.disabled):active, .btn-outline-success:not(:disabled):not(.disabled).active,\n.show > .btn-outline-success.dropdown-toggle {\n  color: #fff;\n  background-color: #28a745;\n  border-color: #28a745;\n}\n\n.btn-outline-success:not(:disabled):not(.disabled):active:focus, .btn-outline-success:not(:disabled):not(.disabled).active:focus,\n.show > .btn-outline-success.dropdown-toggle:focus {\n  box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.5);\n}\n\n.btn-outline-info {\n  color: #17a2b8;\n  border-color: #17a2b8;\n}\n\n.btn-outline-info:hover {\n  color: #fff;\n  background-color: #17a2b8;\n  border-color: #17a2b8;\n}\n\n.btn-outline-info:focus, .btn-outline-info.focus {\n  box-shadow: 0 0 0 0.2rem rgba(23, 162, 184, 0.5);\n}\n\n.btn-outline-info.disabled, .btn-outline-info:disabled {\n  color: #17a2b8;\n  background-color: transparent;\n}\n\n.btn-outline-info:not(:disabled):not(.disabled):active, .btn-outline-info:not(:disabled):not(.disabled).active,\n.show > .btn-outline-info.dropdown-toggle {\n  color: #fff;\n  background-color: #17a2b8;\n  border-color: #17a2b8;\n}\n\n.btn-outline-info:not(:disabled):not(.disabled):active:focus, .btn-outline-info:not(:disabled):not(.disabled).active:focus,\n.show > .btn-outline-info.dropdown-toggle:focus {\n  box-shadow: 0 0 0 0.2rem rgba(23, 162, 184, 0.5);\n}\n\n.btn-outline-warning {\n  color: #ffc107;\n  border-color: #ffc107;\n}\n\n.btn-outline-warning:hover {\n  color: #212529;\n  background-color: #ffc107;\n  border-color: #ffc107;\n}\n\n.btn-outline-warning:focus, .btn-outline-warning.focus {\n  box-shadow: 0 0 0 0.2rem rgba(255, 193, 7, 0.5);\n}\n\n.btn-outline-warning.disabled, .btn-outline-warning:disabled {\n  color: #ffc107;\n  background-color: transparent;\n}\n\n.btn-outline-warning:not(:disabled):not(.disabled):active, .btn-outline-warning:not(:disabled):not(.disabled).active,\n.show > .btn-outline-warning.dropdown-toggle {\n  color: #212529;\n  background-color: #ffc107;\n  border-color: #ffc107;\n}\n\n.btn-outline-warning:not(:disabled):not(.disabled):active:focus, .btn-outline-warning:not(:disabled):not(.disabled).active:focus,\n.show > .btn-outline-warning.dropdown-toggle:focus {\n  box-shadow: 0 0 0 0.2rem rgba(255, 193, 7, 0.5);\n}\n\n.btn-outline-danger {\n  color: #dc3545;\n  border-color: #dc3545;\n}\n\n.btn-outline-danger:hover {\n  color: #fff;\n  background-color: #dc3545;\n  border-color: #dc3545;\n}\n\n.btn-outline-danger:focus, .btn-outline-danger.focus {\n  box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.5);\n}\n\n.btn-outline-danger.disabled, .btn-outline-danger:disabled {\n  color: #dc3545;\n  background-color: transparent;\n}\n\n.btn-outline-danger:not(:disabled):not(.disabled):active, .btn-outline-danger:not(:disabled):not(.disabled).active,\n.show > .btn-outline-danger.dropdown-toggle {\n  color: #fff;\n  background-color: #dc3545;\n  border-color: #dc3545;\n}\n\n.btn-outline-danger:not(:disabled):not(.disabled):active:focus, .btn-outline-danger:not(:disabled):not(.disabled).active:focus,\n.show > .btn-outline-danger.dropdown-toggle:focus {\n  box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.5);\n}\n\n.btn-outline-light {\n  color: #f8f9fa;\n  border-color: #f8f9fa;\n}\n\n.btn-outline-light:hover {\n  color: #212529;\n  background-color: #f8f9fa;\n  border-color: #f8f9fa;\n}\n\n.btn-outline-light:focus, .btn-outline-light.focus {\n  box-shadow: 0 0 0 0.2rem rgba(248, 249, 250, 0.5);\n}\n\n.btn-outline-light.disabled, .btn-outline-light:disabled {\n  color: #f8f9fa;\n  background-color: transparent;\n}\n\n.btn-outline-light:not(:disabled):not(.disabled):active, .btn-outline-light:not(:disabled):not(.disabled).active,\n.show > .btn-outline-light.dropdown-toggle {\n  color: #212529;\n  background-color: #f8f9fa;\n  border-color: #f8f9fa;\n}\n\n.btn-outline-light:not(:disabled):not(.disabled):active:focus, .btn-outline-light:not(:disabled):not(.disabled).active:focus,\n.show > .btn-outline-light.dropdown-toggle:focus {\n  box-shadow: 0 0 0 0.2rem rgba(248, 249, 250, 0.5);\n}\n\n.btn-outline-dark {\n  color: #343a40;\n  border-color: #343a40;\n}\n\n.btn-outline-dark:hover {\n  color: #fff;\n  background-color: #343a40;\n  border-color: #343a40;\n}\n\n.btn-outline-dark:focus, .btn-outline-dark.focus {\n  box-shadow: 0 0 0 0.2rem rgba(52, 58, 64, 0.5);\n}\n\n.btn-outline-dark.disabled, .btn-outline-dark:disabled {\n  color: #343a40;\n  background-color: transparent;\n}\n\n.btn-outline-dark:not(:disabled):not(.disabled):active, .btn-outline-dark:not(:disabled):not(.disabled).active,\n.show > .btn-outline-dark.dropdown-toggle {\n  color: #fff;\n  background-color: #343a40;\n  border-color: #343a40;\n}\n\n.btn-outline-dark:not(:disabled):not(.disabled):active:focus, .btn-outline-dark:not(:disabled):not(.disabled).active:focus,\n.show > .btn-outline-dark.dropdown-toggle:focus {\n  box-shadow: 0 0 0 0.2rem rgba(52, 58, 64, 0.5);\n}\n\n.btn-link {\n  font-weight: 400;\n  color: #007bff;\n  text-decoration: none;\n}\n\n.btn-link:hover {\n  color: #0056b3;\n  text-decoration: underline;\n}\n\n.btn-link:focus, .btn-link.focus {\n  text-decoration: underline;\n}\n\n.btn-link:disabled, .btn-link.disabled {\n  color: #6c757d;\n  pointer-events: none;\n}\n\n.btn-lg, .btn-group-lg > .btn {\n  padding: 0.5rem 1rem;\n  font-size: 1.25rem;\n  line-height: 1.5;\n  border-radius: 0.3rem;\n}\n\n.btn-sm, .btn-group-sm > .btn {\n  padding: 0.25rem 0.5rem;\n  font-size: 0.875rem;\n  line-height: 1.5;\n  border-radius: 0.2rem;\n}\n\n.btn-block {\n  display: block;\n  width: 100%;\n}\n\n.btn-block + .btn-block {\n  margin-top: 0.5rem;\n}\n\ninput[type=\"submit\"].btn-block,\ninput[type=\"reset\"].btn-block,\ninput[type=\"button\"].btn-block {\n  width: 100%;\n}\n\n.fade {\n  transition: opacity 0.15s linear;\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .fade {\n    transition: none;\n  }\n}\n\n.fade:not(.show) {\n  opacity: 0;\n}\n\n.collapse:not(.show) {\n  display: none;\n}\n\n.collapsing {\n  position: relative;\n  height: 0;\n  overflow: hidden;\n  transition: height 0.35s ease;\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .collapsing {\n    transition: none;\n  }\n}\n\n.collapsing.width {\n  width: 0;\n  height: auto;\n  transition: width 0.35s ease;\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .collapsing.width {\n    transition: none;\n  }\n}\n\n.dropup,\n.dropright,\n.dropdown,\n.dropleft {\n  position: relative;\n}\n\n.dropdown-toggle {\n  white-space: nowrap;\n}\n\n.dropdown-toggle::after {\n  display: inline-block;\n  margin-left: 0.255em;\n  vertical-align: 0.255em;\n  content: \"\";\n  border-top: 0.3em solid;\n  border-right: 0.3em solid transparent;\n  border-bottom: 0;\n  border-left: 0.3em solid transparent;\n}\n\n.dropdown-toggle:empty::after {\n  margin-left: 0;\n}\n\n.dropdown-menu {\n  position: absolute;\n  top: 100%;\n  left: 0;\n  z-index: 1000;\n  display: none;\n  float: left;\n  min-width: 10rem;\n  padding: 0.5rem 0;\n  margin: 0.125rem 0 0;\n  font-size: 1rem;\n  color: #212529;\n  text-align: left;\n  list-style: none;\n  background-color: #fff;\n  background-clip: padding-box;\n  border: 1px solid rgba(0, 0, 0, 0.15);\n  border-radius: 0.25rem;\n}\n\n.dropdown-menu-left {\n  right: auto;\n  left: 0;\n}\n\n.dropdown-menu-right {\n  right: 0;\n  left: auto;\n}\n\n@media (min-width: 576px) {\n  .dropdown-menu-sm-left {\n    right: auto;\n    left: 0;\n  }\n  .dropdown-menu-sm-right {\n    right: 0;\n    left: auto;\n  }\n}\n\n@media (min-width: 768px) {\n  .dropdown-menu-md-left {\n    right: auto;\n    left: 0;\n  }\n  .dropdown-menu-md-right {\n    right: 0;\n    left: auto;\n  }\n}\n\n@media (min-width: 992px) {\n  .dropdown-menu-lg-left {\n    right: auto;\n    left: 0;\n  }\n  .dropdown-menu-lg-right {\n    right: 0;\n    left: auto;\n  }\n}\n\n@media (min-width: 1200px) {\n  .dropdown-menu-xl-left {\n    right: auto;\n    left: 0;\n  }\n  .dropdown-menu-xl-right {\n    right: 0;\n    left: auto;\n  }\n}\n\n.dropup .dropdown-menu {\n  top: auto;\n  bottom: 100%;\n  margin-top: 0;\n  margin-bottom: 0.125rem;\n}\n\n.dropup .dropdown-toggle::after {\n  display: inline-block;\n  margin-left: 0.255em;\n  vertical-align: 0.255em;\n  content: \"\";\n  border-top: 0;\n  border-right: 0.3em solid transparent;\n  border-bottom: 0.3em solid;\n  border-left: 0.3em solid transparent;\n}\n\n.dropup .dropdown-toggle:empty::after {\n  margin-left: 0;\n}\n\n.dropright .dropdown-menu {\n  top: 0;\n  right: auto;\n  left: 100%;\n  margin-top: 0;\n  margin-left: 0.125rem;\n}\n\n.dropright .dropdown-toggle::after {\n  display: inline-block;\n  margin-left: 0.255em;\n  vertical-align: 0.255em;\n  content: \"\";\n  border-top: 0.3em solid transparent;\n  border-right: 0;\n  border-bottom: 0.3em solid transparent;\n  border-left: 0.3em solid;\n}\n\n.dropright .dropdown-toggle:empty::after {\n  margin-left: 0;\n}\n\n.dropright .dropdown-toggle::after {\n  vertical-align: 0;\n}\n\n.dropleft .dropdown-menu {\n  top: 0;\n  right: 100%;\n  left: auto;\n  margin-top: 0;\n  margin-right: 0.125rem;\n}\n\n.dropleft .dropdown-toggle::after {\n  display: inline-block;\n  margin-left: 0.255em;\n  vertical-align: 0.255em;\n  content: \"\";\n}\n\n.dropleft .dropdown-toggle::after {\n  display: none;\n}\n\n.dropleft .dropdown-toggle::before {\n  display: inline-block;\n  margin-right: 0.255em;\n  vertical-align: 0.255em;\n  content: \"\";\n  border-top: 0.3em solid transparent;\n  border-right: 0.3em solid;\n  border-bottom: 0.3em solid transparent;\n}\n\n.dropleft .dropdown-toggle:empty::after {\n  margin-left: 0;\n}\n\n.dropleft .dropdown-toggle::before {\n  vertical-align: 0;\n}\n\n.dropdown-menu[x-placement^=\"top\"], .dropdown-menu[x-placement^=\"right\"], .dropdown-menu[x-placement^=\"bottom\"], .dropdown-menu[x-placement^=\"left\"] {\n  right: auto;\n  bottom: auto;\n}\n\n.dropdown-divider {\n  height: 0;\n  margin: 0.5rem 0;\n  overflow: hidden;\n  border-top: 1px solid #e9ecef;\n}\n\n.dropdown-item {\n  display: block;\n  width: 100%;\n  padding: 0.25rem 1.5rem;\n  clear: both;\n  font-weight: 400;\n  color: #212529;\n  text-align: inherit;\n  white-space: nowrap;\n  background-color: transparent;\n  border: 0;\n}\n\n.dropdown-item:hover, .dropdown-item:focus {\n  color: #16181b;\n  text-decoration: none;\n  background-color: #e9ecef;\n}\n\n.dropdown-item.active, .dropdown-item:active {\n  color: #fff;\n  text-decoration: none;\n  background-color: #007bff;\n}\n\n.dropdown-item.disabled, .dropdown-item:disabled {\n  color: #adb5bd;\n  pointer-events: none;\n  background-color: transparent;\n}\n\n.dropdown-menu.show {\n  display: block;\n}\n\n.dropdown-header {\n  display: block;\n  padding: 0.5rem 1.5rem;\n  margin-bottom: 0;\n  font-size: 0.875rem;\n  color: #6c757d;\n  white-space: nowrap;\n}\n\n.dropdown-item-text {\n  display: block;\n  padding: 0.25rem 1.5rem;\n  color: #212529;\n}\n\n.btn-group,\n.btn-group-vertical {\n  position: relative;\n  display: -ms-inline-flexbox;\n  display: inline-flex;\n  vertical-align: middle;\n}\n\n.btn-group > .btn,\n.btn-group-vertical > .btn {\n  position: relative;\n  -ms-flex: 1 1 auto;\n  flex: 1 1 auto;\n}\n\n.btn-group > .btn:hover,\n.btn-group-vertical > .btn:hover {\n  z-index: 1;\n}\n\n.btn-group > .btn:focus, .btn-group > .btn:active, .btn-group > .btn.active,\n.btn-group-vertical > .btn:focus,\n.btn-group-vertical > .btn:active,\n.btn-group-vertical > .btn.active {\n  z-index: 1;\n}\n\n.btn-toolbar {\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-wrap: wrap;\n  flex-wrap: wrap;\n  -ms-flex-pack: start;\n  justify-content: flex-start;\n}\n\n.btn-toolbar .input-group {\n  width: auto;\n}\n\n.btn-group > .btn:not(:first-child),\n.btn-group > .btn-group:not(:first-child) {\n  margin-left: -1px;\n}\n\n.btn-group > .btn:not(:last-child):not(.dropdown-toggle),\n.btn-group > .btn-group:not(:last-child) > .btn {\n  border-top-right-radius: 0;\n  border-bottom-right-radius: 0;\n}\n\n.btn-group > .btn:not(:first-child),\n.btn-group > .btn-group:not(:first-child) > .btn {\n  border-top-left-radius: 0;\n  border-bottom-left-radius: 0;\n}\n\n.dropdown-toggle-split {\n  padding-right: 0.5625rem;\n  padding-left: 0.5625rem;\n}\n\n.dropdown-toggle-split::after,\n.dropup .dropdown-toggle-split::after,\n.dropright .dropdown-toggle-split::after {\n  margin-left: 0;\n}\n\n.dropleft .dropdown-toggle-split::before {\n  margin-right: 0;\n}\n\n.btn-sm + .dropdown-toggle-split, .btn-group-sm > .btn + .dropdown-toggle-split {\n  padding-right: 0.375rem;\n  padding-left: 0.375rem;\n}\n\n.btn-lg + .dropdown-toggle-split, .btn-group-lg > .btn + .dropdown-toggle-split {\n  padding-right: 0.75rem;\n  padding-left: 0.75rem;\n}\n\n.btn-group-vertical {\n  -ms-flex-direction: column;\n  flex-direction: column;\n  -ms-flex-align: start;\n  align-items: flex-start;\n  -ms-flex-pack: center;\n  justify-content: center;\n}\n\n.btn-group-vertical > .btn,\n.btn-group-vertical > .btn-group {\n  width: 100%;\n}\n\n.btn-group-vertical > .btn:not(:first-child),\n.btn-group-vertical > .btn-group:not(:first-child) {\n  margin-top: -1px;\n}\n\n.btn-group-vertical > .btn:not(:last-child):not(.dropdown-toggle),\n.btn-group-vertical > .btn-group:not(:last-child) > .btn {\n  border-bottom-right-radius: 0;\n  border-bottom-left-radius: 0;\n}\n\n.btn-group-vertical > .btn:not(:first-child),\n.btn-group-vertical > .btn-group:not(:first-child) > .btn {\n  border-top-left-radius: 0;\n  border-top-right-radius: 0;\n}\n\n.btn-group-toggle > .btn,\n.btn-group-toggle > .btn-group > .btn {\n  margin-bottom: 0;\n}\n\n.btn-group-toggle > .btn input[type=\"radio\"],\n.btn-group-toggle > .btn input[type=\"checkbox\"],\n.btn-group-toggle > .btn-group > .btn input[type=\"radio\"],\n.btn-group-toggle > .btn-group > .btn input[type=\"checkbox\"] {\n  position: absolute;\n  clip: rect(0, 0, 0, 0);\n  pointer-events: none;\n}\n\n.input-group {\n  position: relative;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-wrap: wrap;\n  flex-wrap: wrap;\n  -ms-flex-align: stretch;\n  align-items: stretch;\n  width: 100%;\n}\n\n.input-group > .form-control,\n.input-group > .form-control-plaintext,\n.input-group > .custom-select,\n.input-group > .custom-file {\n  position: relative;\n  -ms-flex: 1 1 auto;\n  flex: 1 1 auto;\n  width: 1%;\n  min-width: 0;\n  margin-bottom: 0;\n}\n\n.input-group > .form-control + .form-control,\n.input-group > .form-control + .custom-select,\n.input-group > .form-control + .custom-file,\n.input-group > .form-control-plaintext + .form-control,\n.input-group > .form-control-plaintext + .custom-select,\n.input-group > .form-control-plaintext + .custom-file,\n.input-group > .custom-select + .form-control,\n.input-group > .custom-select + .custom-select,\n.input-group > .custom-select + .custom-file,\n.input-group > .custom-file + .form-control,\n.input-group > .custom-file + .custom-select,\n.input-group > .custom-file + .custom-file {\n  margin-left: -1px;\n}\n\n.input-group > .form-control:focus,\n.input-group > .custom-select:focus,\n.input-group > .custom-file .custom-file-input:focus ~ .custom-file-label {\n  z-index: 3;\n}\n\n.input-group > .custom-file .custom-file-input:focus {\n  z-index: 4;\n}\n\n.input-group > .form-control:not(:first-child),\n.input-group > .custom-select:not(:first-child) {\n  border-top-left-radius: 0;\n  border-bottom-left-radius: 0;\n}\n\n.input-group > .custom-file {\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-align: center;\n  align-items: center;\n}\n\n.input-group > .custom-file:not(:last-child) .custom-file-label,\n.input-group > .custom-file:not(:last-child) .custom-file-label::after {\n  border-top-right-radius: 0;\n  border-bottom-right-radius: 0;\n}\n\n.input-group > .custom-file:not(:first-child) .custom-file-label {\n  border-top-left-radius: 0;\n  border-bottom-left-radius: 0;\n}\n\n.input-group:not(.has-validation) > .form-control:not(:last-child),\n.input-group:not(.has-validation) > .custom-select:not(:last-child),\n.input-group:not(.has-validation) > .custom-file:not(:last-child) .custom-file-label,\n.input-group:not(.has-validation) > .custom-file:not(:last-child) .custom-file-label::after {\n  border-top-right-radius: 0;\n  border-bottom-right-radius: 0;\n}\n\n.input-group.has-validation > .form-control:nth-last-child(n + 3),\n.input-group.has-validation > .custom-select:nth-last-child(n + 3),\n.input-group.has-validation > .custom-file:nth-last-child(n + 3) .custom-file-label,\n.input-group.has-validation > .custom-file:nth-last-child(n + 3) .custom-file-label::after {\n  border-top-right-radius: 0;\n  border-bottom-right-radius: 0;\n}\n\n.input-group-prepend,\n.input-group-append {\n  display: -ms-flexbox;\n  display: flex;\n}\n\n.input-group-prepend .btn,\n.input-group-append .btn {\n  position: relative;\n  z-index: 2;\n}\n\n.input-group-prepend .btn:focus,\n.input-group-append .btn:focus {\n  z-index: 3;\n}\n\n.input-group-prepend .btn + .btn,\n.input-group-prepend .btn + .input-group-text,\n.input-group-prepend .input-group-text + .input-group-text,\n.input-group-prepend .input-group-text + .btn,\n.input-group-append .btn + .btn,\n.input-group-append .btn + .input-group-text,\n.input-group-append .input-group-text + .input-group-text,\n.input-group-append .input-group-text + .btn {\n  margin-left: -1px;\n}\n\n.input-group-prepend {\n  margin-right: -1px;\n}\n\n.input-group-append {\n  margin-left: -1px;\n}\n\n.input-group-text {\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-align: center;\n  align-items: center;\n  padding: 0.375rem 0.75rem;\n  margin-bottom: 0;\n  font-size: 1rem;\n  font-weight: 400;\n  line-height: 1.5;\n  color: #495057;\n  text-align: center;\n  white-space: nowrap;\n  background-color: #e9ecef;\n  border: 1px solid #ced4da;\n  border-radius: 0.25rem;\n}\n\n.input-group-text input[type=\"radio\"],\n.input-group-text input[type=\"checkbox\"] {\n  margin-top: 0;\n}\n\n.input-group-lg > .form-control:not(textarea),\n.input-group-lg > .custom-select {\n  height: calc(1.5em + 1rem + 2px);\n}\n\n.input-group-lg > .form-control,\n.input-group-lg > .custom-select,\n.input-group-lg > .input-group-prepend > .input-group-text,\n.input-group-lg > .input-group-append > .input-group-text,\n.input-group-lg > .input-group-prepend > .btn,\n.input-group-lg > .input-group-append > .btn {\n  padding: 0.5rem 1rem;\n  font-size: 1.25rem;\n  line-height: 1.5;\n  border-radius: 0.3rem;\n}\n\n.input-group-sm > .form-control:not(textarea),\n.input-group-sm > .custom-select {\n  height: calc(1.5em + 0.5rem + 2px);\n}\n\n.input-group-sm > .form-control,\n.input-group-sm > .custom-select,\n.input-group-sm > .input-group-prepend > .input-group-text,\n.input-group-sm > .input-group-append > .input-group-text,\n.input-group-sm > .input-group-prepend > .btn,\n.input-group-sm > .input-group-append > .btn {\n  padding: 0.25rem 0.5rem;\n  font-size: 0.875rem;\n  line-height: 1.5;\n  border-radius: 0.2rem;\n}\n\n.input-group-lg > .custom-select,\n.input-group-sm > .custom-select {\n  padding-right: 1.75rem;\n}\n\n.input-group > .input-group-prepend > .btn,\n.input-group > .input-group-prepend > .input-group-text,\n.input-group:not(.has-validation) > .input-group-append:not(:last-child) > .btn,\n.input-group:not(.has-validation) > .input-group-append:not(:last-child) > .input-group-text,\n.input-group.has-validation > .input-group-append:nth-last-child(n + 3) > .btn,\n.input-group.has-validation > .input-group-append:nth-last-child(n + 3) > .input-group-text,\n.input-group > .input-group-append:last-child > .btn:not(:last-child):not(.dropdown-toggle),\n.input-group > .input-group-append:last-child > .input-group-text:not(:last-child) {\n  border-top-right-radius: 0;\n  border-bottom-right-radius: 0;\n}\n\n.input-group > .input-group-append > .btn,\n.input-group > .input-group-append > .input-group-text,\n.input-group > .input-group-prepend:not(:first-child) > .btn,\n.input-group > .input-group-prepend:not(:first-child) > .input-group-text,\n.input-group > .input-group-prepend:first-child > .btn:not(:first-child),\n.input-group > .input-group-prepend:first-child > .input-group-text:not(:first-child) {\n  border-top-left-radius: 0;\n  border-bottom-left-radius: 0;\n}\n\n.custom-control {\n  position: relative;\n  z-index: 1;\n  display: block;\n  min-height: 1.5rem;\n  padding-left: 1.5rem;\n  -webkit-print-color-adjust: exact;\n  color-adjust: exact;\n  print-color-adjust: exact;\n}\n\n.custom-control-inline {\n  display: -ms-inline-flexbox;\n  display: inline-flex;\n  margin-right: 1rem;\n}\n\n.custom-control-input {\n  position: absolute;\n  left: 0;\n  z-index: -1;\n  width: 1rem;\n  height: 1.25rem;\n  opacity: 0;\n}\n\n.custom-control-input:checked ~ .custom-control-label::before {\n  color: #fff;\n  border-color: #007bff;\n  background-color: #007bff;\n}\n\n.custom-control-input:focus ~ .custom-control-label::before {\n  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);\n}\n\n.custom-control-input:focus:not(:checked) ~ .custom-control-label::before {\n  border-color: #80bdff;\n}\n\n.custom-control-input:not(:disabled):active ~ .custom-control-label::before {\n  color: #fff;\n  background-color: #b3d7ff;\n  border-color: #b3d7ff;\n}\n\n.custom-control-input[disabled] ~ .custom-control-label, .custom-control-input:disabled ~ .custom-control-label {\n  color: #6c757d;\n}\n\n.custom-control-input[disabled] ~ .custom-control-label::before, .custom-control-input:disabled ~ .custom-control-label::before {\n  background-color: #e9ecef;\n}\n\n.custom-control-label {\n  position: relative;\n  margin-bottom: 0;\n  vertical-align: top;\n}\n\n.custom-control-label::before {\n  position: absolute;\n  top: 0.25rem;\n  left: -1.5rem;\n  display: block;\n  width: 1rem;\n  height: 1rem;\n  pointer-events: none;\n  content: \"\";\n  background-color: #fff;\n  border: 1px solid #adb5bd;\n}\n\n.custom-control-label::after {\n  position: absolute;\n  top: 0.25rem;\n  left: -1.5rem;\n  display: block;\n  width: 1rem;\n  height: 1rem;\n  content: \"\";\n  background: 50% / 50% 50% no-repeat;\n}\n\n.custom-checkbox .custom-control-label::before {\n  border-radius: 0.25rem;\n}\n\n.custom-checkbox .custom-control-input:checked ~ .custom-control-label::after {\n  background-image: url(" + ___CSS_LOADER_URL_REPLACEMENT_3___ + ");\n}\n\n.custom-checkbox .custom-control-input:indeterminate ~ .custom-control-label::before {\n  border-color: #007bff;\n  background-color: #007bff;\n}\n\n.custom-checkbox .custom-control-input:indeterminate ~ .custom-control-label::after {\n  background-image: url(" + ___CSS_LOADER_URL_REPLACEMENT_4___ + ");\n}\n\n.custom-checkbox .custom-control-input:disabled:checked ~ .custom-control-label::before {\n  background-color: rgba(0, 123, 255, 0.5);\n}\n\n.custom-checkbox .custom-control-input:disabled:indeterminate ~ .custom-control-label::before {\n  background-color: rgba(0, 123, 255, 0.5);\n}\n\n.custom-radio .custom-control-label::before {\n  border-radius: 50%;\n}\n\n.custom-radio .custom-control-input:checked ~ .custom-control-label::after {\n  background-image: url(" + ___CSS_LOADER_URL_REPLACEMENT_5___ + ");\n}\n\n.custom-radio .custom-control-input:disabled:checked ~ .custom-control-label::before {\n  background-color: rgba(0, 123, 255, 0.5);\n}\n\n.custom-switch {\n  padding-left: 2.25rem;\n}\n\n.custom-switch .custom-control-label::before {\n  left: -2.25rem;\n  width: 1.75rem;\n  pointer-events: all;\n  border-radius: 0.5rem;\n}\n\n.custom-switch .custom-control-label::after {\n  top: calc(0.25rem + 2px);\n  left: calc(-2.25rem + 2px);\n  width: calc(1rem - 4px);\n  height: calc(1rem - 4px);\n  background-color: #adb5bd;\n  border-radius: 0.5rem;\n  transition: background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out, -webkit-transform 0.15s ease-in-out;\n  transition: transform 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;\n  transition: transform 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out, -webkit-transform 0.15s ease-in-out;\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .custom-switch .custom-control-label::after {\n    transition: none;\n  }\n}\n\n.custom-switch .custom-control-input:checked ~ .custom-control-label::after {\n  background-color: #fff;\n  -webkit-transform: translateX(0.75rem);\n  transform: translateX(0.75rem);\n}\n\n.custom-switch .custom-control-input:disabled:checked ~ .custom-control-label::before {\n  background-color: rgba(0, 123, 255, 0.5);\n}\n\n.custom-select {\n  display: inline-block;\n  width: 100%;\n  height: calc(1.5em + 0.75rem + 2px);\n  padding: 0.375rem 1.75rem 0.375rem 0.75rem;\n  font-size: 1rem;\n  font-weight: 400;\n  line-height: 1.5;\n  color: #495057;\n  vertical-align: middle;\n  background: #fff url(" + ___CSS_LOADER_URL_REPLACEMENT_1___ + ") right 0.75rem center/8px 10px no-repeat;\n  border: 1px solid #ced4da;\n  border-radius: 0.25rem;\n  -webkit-appearance: none;\n  -moz-appearance: none;\n  appearance: none;\n}\n\n.custom-select:focus {\n  border-color: #80bdff;\n  outline: 0;\n  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);\n}\n\n.custom-select:focus::-ms-value {\n  color: #495057;\n  background-color: #fff;\n}\n\n.custom-select[multiple], .custom-select[size]:not([size=\"1\"]) {\n  height: auto;\n  padding-right: 0.75rem;\n  background-image: none;\n}\n\n.custom-select:disabled {\n  color: #6c757d;\n  background-color: #e9ecef;\n}\n\n.custom-select::-ms-expand {\n  display: none;\n}\n\n.custom-select:-moz-focusring {\n  color: transparent;\n  text-shadow: 0 0 0 #495057;\n}\n\n.custom-select-sm {\n  height: calc(1.5em + 0.5rem + 2px);\n  padding-top: 0.25rem;\n  padding-bottom: 0.25rem;\n  padding-left: 0.5rem;\n  font-size: 0.875rem;\n}\n\n.custom-select-lg {\n  height: calc(1.5em + 1rem + 2px);\n  padding-top: 0.5rem;\n  padding-bottom: 0.5rem;\n  padding-left: 1rem;\n  font-size: 1.25rem;\n}\n\n.custom-file {\n  position: relative;\n  display: inline-block;\n  width: 100%;\n  height: calc(1.5em + 0.75rem + 2px);\n  margin-bottom: 0;\n}\n\n.custom-file-input {\n  position: relative;\n  z-index: 2;\n  width: 100%;\n  height: calc(1.5em + 0.75rem + 2px);\n  margin: 0;\n  overflow: hidden;\n  opacity: 0;\n}\n\n.custom-file-input:focus ~ .custom-file-label {\n  border-color: #80bdff;\n  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);\n}\n\n.custom-file-input[disabled] ~ .custom-file-label,\n.custom-file-input:disabled ~ .custom-file-label {\n  background-color: #e9ecef;\n}\n\n.custom-file-input:lang(en) ~ .custom-file-label::after {\n  content: \"Browse\";\n}\n\n.custom-file-input ~ .custom-file-label[data-browse]::after {\n  content: attr(data-browse);\n}\n\n.custom-file-label {\n  position: absolute;\n  top: 0;\n  right: 0;\n  left: 0;\n  z-index: 1;\n  height: calc(1.5em + 0.75rem + 2px);\n  padding: 0.375rem 0.75rem;\n  overflow: hidden;\n  font-weight: 400;\n  line-height: 1.5;\n  color: #495057;\n  background-color: #fff;\n  border: 1px solid #ced4da;\n  border-radius: 0.25rem;\n}\n\n.custom-file-label::after {\n  position: absolute;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  z-index: 3;\n  display: block;\n  height: calc(1.5em + 0.75rem);\n  padding: 0.375rem 0.75rem;\n  line-height: 1.5;\n  color: #495057;\n  content: \"Browse\";\n  background-color: #e9ecef;\n  border-left: inherit;\n  border-radius: 0 0.25rem 0.25rem 0;\n}\n\n.custom-range {\n  width: 100%;\n  height: 1.4rem;\n  padding: 0;\n  background-color: transparent;\n  -webkit-appearance: none;\n  -moz-appearance: none;\n  appearance: none;\n}\n\n.custom-range:focus {\n  outline: 0;\n}\n\n.custom-range:focus::-webkit-slider-thumb {\n  box-shadow: 0 0 0 1px #fff, 0 0 0 0.2rem rgba(0, 123, 255, 0.25);\n}\n\n.custom-range:focus::-moz-range-thumb {\n  box-shadow: 0 0 0 1px #fff, 0 0 0 0.2rem rgba(0, 123, 255, 0.25);\n}\n\n.custom-range:focus::-ms-thumb {\n  box-shadow: 0 0 0 1px #fff, 0 0 0 0.2rem rgba(0, 123, 255, 0.25);\n}\n\n.custom-range::-moz-focus-outer {\n  border: 0;\n}\n\n.custom-range::-webkit-slider-thumb {\n  width: 1rem;\n  height: 1rem;\n  margin-top: -0.25rem;\n  background-color: #007bff;\n  border: 0;\n  border-radius: 1rem;\n  -webkit-transition: background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;\n  transition: background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;\n  -webkit-appearance: none;\n  appearance: none;\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .custom-range::-webkit-slider-thumb {\n    -webkit-transition: none;\n    transition: none;\n  }\n}\n\n.custom-range::-webkit-slider-thumb:active {\n  background-color: #b3d7ff;\n}\n\n.custom-range::-webkit-slider-runnable-track {\n  width: 100%;\n  height: 0.5rem;\n  color: transparent;\n  cursor: pointer;\n  background-color: #dee2e6;\n  border-color: transparent;\n  border-radius: 1rem;\n}\n\n.custom-range::-moz-range-thumb {\n  width: 1rem;\n  height: 1rem;\n  background-color: #007bff;\n  border: 0;\n  border-radius: 1rem;\n  -moz-transition: background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;\n  transition: background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;\n  -moz-appearance: none;\n  appearance: none;\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .custom-range::-moz-range-thumb {\n    -moz-transition: none;\n    transition: none;\n  }\n}\n\n.custom-range::-moz-range-thumb:active {\n  background-color: #b3d7ff;\n}\n\n.custom-range::-moz-range-track {\n  width: 100%;\n  height: 0.5rem;\n  color: transparent;\n  cursor: pointer;\n  background-color: #dee2e6;\n  border-color: transparent;\n  border-radius: 1rem;\n}\n\n.custom-range::-ms-thumb {\n  width: 1rem;\n  height: 1rem;\n  margin-top: 0;\n  margin-right: 0.2rem;\n  margin-left: 0.2rem;\n  background-color: #007bff;\n  border: 0;\n  border-radius: 1rem;\n  -ms-transition: background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;\n  transition: background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;\n  appearance: none;\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .custom-range::-ms-thumb {\n    -ms-transition: none;\n    transition: none;\n  }\n}\n\n.custom-range::-ms-thumb:active {\n  background-color: #b3d7ff;\n}\n\n.custom-range::-ms-track {\n  width: 100%;\n  height: 0.5rem;\n  color: transparent;\n  cursor: pointer;\n  background-color: transparent;\n  border-color: transparent;\n  border-width: 0.5rem;\n}\n\n.custom-range::-ms-fill-lower {\n  background-color: #dee2e6;\n  border-radius: 1rem;\n}\n\n.custom-range::-ms-fill-upper {\n  margin-right: 15px;\n  background-color: #dee2e6;\n  border-radius: 1rem;\n}\n\n.custom-range:disabled::-webkit-slider-thumb {\n  background-color: #adb5bd;\n}\n\n.custom-range:disabled::-webkit-slider-runnable-track {\n  cursor: default;\n}\n\n.custom-range:disabled::-moz-range-thumb {\n  background-color: #adb5bd;\n}\n\n.custom-range:disabled::-moz-range-track {\n  cursor: default;\n}\n\n.custom-range:disabled::-ms-thumb {\n  background-color: #adb5bd;\n}\n\n.custom-control-label::before,\n.custom-file-label,\n.custom-select {\n  transition: background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .custom-control-label::before,\n  .custom-file-label,\n  .custom-select {\n    transition: none;\n  }\n}\n\n.nav {\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-wrap: wrap;\n  flex-wrap: wrap;\n  padding-left: 0;\n  margin-bottom: 0;\n  list-style: none;\n}\n\n.nav-link {\n  display: block;\n  padding: 0.5rem 1rem;\n}\n\n.nav-link:hover, .nav-link:focus {\n  text-decoration: none;\n}\n\n.nav-link.disabled {\n  color: #6c757d;\n  pointer-events: none;\n  cursor: default;\n}\n\n.nav-tabs {\n  border-bottom: 1px solid #dee2e6;\n}\n\n.nav-tabs .nav-link {\n  margin-bottom: -1px;\n  background-color: transparent;\n  border: 1px solid transparent;\n  border-top-left-radius: 0.25rem;\n  border-top-right-radius: 0.25rem;\n}\n\n.nav-tabs .nav-link:hover, .nav-tabs .nav-link:focus {\n  isolation: isolate;\n  border-color: #e9ecef #e9ecef #dee2e6;\n}\n\n.nav-tabs .nav-link.disabled {\n  color: #6c757d;\n  background-color: transparent;\n  border-color: transparent;\n}\n\n.nav-tabs .nav-link.active,\n.nav-tabs .nav-item.show .nav-link {\n  color: #495057;\n  background-color: #fff;\n  border-color: #dee2e6 #dee2e6 #fff;\n}\n\n.nav-tabs .dropdown-menu {\n  margin-top: -1px;\n  border-top-left-radius: 0;\n  border-top-right-radius: 0;\n}\n\n.nav-pills .nav-link {\n  background: none;\n  border: 0;\n  border-radius: 0.25rem;\n}\n\n.nav-pills .nav-link.active,\n.nav-pills .show > .nav-link {\n  color: #fff;\n  background-color: #007bff;\n}\n\n.nav-fill > .nav-link,\n.nav-fill .nav-item {\n  -ms-flex: 1 1 auto;\n  flex: 1 1 auto;\n  text-align: center;\n}\n\n.nav-justified > .nav-link,\n.nav-justified .nav-item {\n  -ms-flex-preferred-size: 0;\n  flex-basis: 0;\n  -ms-flex-positive: 1;\n  flex-grow: 1;\n  text-align: center;\n}\n\n.tab-content > .tab-pane {\n  display: none;\n}\n\n.tab-content > .active {\n  display: block;\n}\n\n.navbar {\n  position: relative;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-wrap: wrap;\n  flex-wrap: wrap;\n  -ms-flex-align: center;\n  align-items: center;\n  -ms-flex-pack: justify;\n  justify-content: space-between;\n  padding: 0.5rem 1rem;\n}\n\n.navbar .container,\n.navbar .container-fluid, .navbar .container-sm, .navbar .container-md, .navbar .container-lg, .navbar .container-xl {\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-wrap: wrap;\n  flex-wrap: wrap;\n  -ms-flex-align: center;\n  align-items: center;\n  -ms-flex-pack: justify;\n  justify-content: space-between;\n}\n\n.navbar-brand {\n  display: inline-block;\n  padding-top: 0.3125rem;\n  padding-bottom: 0.3125rem;\n  margin-right: 1rem;\n  font-size: 1.25rem;\n  line-height: inherit;\n  white-space: nowrap;\n}\n\n.navbar-brand:hover, .navbar-brand:focus {\n  text-decoration: none;\n}\n\n.navbar-nav {\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-direction: column;\n  flex-direction: column;\n  padding-left: 0;\n  margin-bottom: 0;\n  list-style: none;\n}\n\n.navbar-nav .nav-link {\n  padding-right: 0;\n  padding-left: 0;\n}\n\n.navbar-nav .dropdown-menu {\n  position: static;\n  float: none;\n}\n\n.navbar-text {\n  display: inline-block;\n  padding-top: 0.5rem;\n  padding-bottom: 0.5rem;\n}\n\n.navbar-collapse {\n  -ms-flex-preferred-size: 100%;\n  flex-basis: 100%;\n  -ms-flex-positive: 1;\n  flex-grow: 1;\n  -ms-flex-align: center;\n  align-items: center;\n}\n\n.navbar-toggler {\n  padding: 0.25rem 0.75rem;\n  font-size: 1.25rem;\n  line-height: 1;\n  background-color: transparent;\n  border: 1px solid transparent;\n  border-radius: 0.25rem;\n}\n\n.navbar-toggler:hover, .navbar-toggler:focus {\n  text-decoration: none;\n}\n\n.navbar-toggler-icon {\n  display: inline-block;\n  width: 1.5em;\n  height: 1.5em;\n  vertical-align: middle;\n  content: \"\";\n  background: 50% / 100% 100% no-repeat;\n}\n\n.navbar-nav-scroll {\n  max-height: 75vh;\n  overflow-y: auto;\n}\n\n@media (max-width: 575.98px) {\n  .navbar-expand-sm > .container,\n  .navbar-expand-sm > .container-fluid, .navbar-expand-sm > .container-sm, .navbar-expand-sm > .container-md, .navbar-expand-sm > .container-lg, .navbar-expand-sm > .container-xl {\n    padding-right: 0;\n    padding-left: 0;\n  }\n}\n\n@media (min-width: 576px) {\n  .navbar-expand-sm {\n    -ms-flex-flow: row nowrap;\n    flex-flow: row nowrap;\n    -ms-flex-pack: start;\n    justify-content: flex-start;\n  }\n  .navbar-expand-sm .navbar-nav {\n    -ms-flex-direction: row;\n    flex-direction: row;\n  }\n  .navbar-expand-sm .navbar-nav .dropdown-menu {\n    position: absolute;\n  }\n  .navbar-expand-sm .navbar-nav .nav-link {\n    padding-right: 0.5rem;\n    padding-left: 0.5rem;\n  }\n  .navbar-expand-sm > .container,\n  .navbar-expand-sm > .container-fluid, .navbar-expand-sm > .container-sm, .navbar-expand-sm > .container-md, .navbar-expand-sm > .container-lg, .navbar-expand-sm > .container-xl {\n    -ms-flex-wrap: nowrap;\n    flex-wrap: nowrap;\n  }\n  .navbar-expand-sm .navbar-nav-scroll {\n    overflow: visible;\n  }\n  .navbar-expand-sm .navbar-collapse {\n    display: -ms-flexbox !important;\n    display: flex !important;\n    -ms-flex-preferred-size: auto;\n    flex-basis: auto;\n  }\n  .navbar-expand-sm .navbar-toggler {\n    display: none;\n  }\n}\n\n@media (max-width: 767.98px) {\n  .navbar-expand-md > .container,\n  .navbar-expand-md > .container-fluid, .navbar-expand-md > .container-sm, .navbar-expand-md > .container-md, .navbar-expand-md > .container-lg, .navbar-expand-md > .container-xl {\n    padding-right: 0;\n    padding-left: 0;\n  }\n}\n\n@media (min-width: 768px) {\n  .navbar-expand-md {\n    -ms-flex-flow: row nowrap;\n    flex-flow: row nowrap;\n    -ms-flex-pack: start;\n    justify-content: flex-start;\n  }\n  .navbar-expand-md .navbar-nav {\n    -ms-flex-direction: row;\n    flex-direction: row;\n  }\n  .navbar-expand-md .navbar-nav .dropdown-menu {\n    position: absolute;\n  }\n  .navbar-expand-md .navbar-nav .nav-link {\n    padding-right: 0.5rem;\n    padding-left: 0.5rem;\n  }\n  .navbar-expand-md > .container,\n  .navbar-expand-md > .container-fluid, .navbar-expand-md > .container-sm, .navbar-expand-md > .container-md, .navbar-expand-md > .container-lg, .navbar-expand-md > .container-xl {\n    -ms-flex-wrap: nowrap;\n    flex-wrap: nowrap;\n  }\n  .navbar-expand-md .navbar-nav-scroll {\n    overflow: visible;\n  }\n  .navbar-expand-md .navbar-collapse {\n    display: -ms-flexbox !important;\n    display: flex !important;\n    -ms-flex-preferred-size: auto;\n    flex-basis: auto;\n  }\n  .navbar-expand-md .navbar-toggler {\n    display: none;\n  }\n}\n\n@media (max-width: 991.98px) {\n  .navbar-expand-lg > .container,\n  .navbar-expand-lg > .container-fluid, .navbar-expand-lg > .container-sm, .navbar-expand-lg > .container-md, .navbar-expand-lg > .container-lg, .navbar-expand-lg > .container-xl {\n    padding-right: 0;\n    padding-left: 0;\n  }\n}\n\n@media (min-width: 992px) {\n  .navbar-expand-lg {\n    -ms-flex-flow: row nowrap;\n    flex-flow: row nowrap;\n    -ms-flex-pack: start;\n    justify-content: flex-start;\n  }\n  .navbar-expand-lg .navbar-nav {\n    -ms-flex-direction: row;\n    flex-direction: row;\n  }\n  .navbar-expand-lg .navbar-nav .dropdown-menu {\n    position: absolute;\n  }\n  .navbar-expand-lg .navbar-nav .nav-link {\n    padding-right: 0.5rem;\n    padding-left: 0.5rem;\n  }\n  .navbar-expand-lg > .container,\n  .navbar-expand-lg > .container-fluid, .navbar-expand-lg > .container-sm, .navbar-expand-lg > .container-md, .navbar-expand-lg > .container-lg, .navbar-expand-lg > .container-xl {\n    -ms-flex-wrap: nowrap;\n    flex-wrap: nowrap;\n  }\n  .navbar-expand-lg .navbar-nav-scroll {\n    overflow: visible;\n  }\n  .navbar-expand-lg .navbar-collapse {\n    display: -ms-flexbox !important;\n    display: flex !important;\n    -ms-flex-preferred-size: auto;\n    flex-basis: auto;\n  }\n  .navbar-expand-lg .navbar-toggler {\n    display: none;\n  }\n}\n\n@media (max-width: 1199.98px) {\n  .navbar-expand-xl > .container,\n  .navbar-expand-xl > .container-fluid, .navbar-expand-xl > .container-sm, .navbar-expand-xl > .container-md, .navbar-expand-xl > .container-lg, .navbar-expand-xl > .container-xl {\n    padding-right: 0;\n    padding-left: 0;\n  }\n}\n\n@media (min-width: 1200px) {\n  .navbar-expand-xl {\n    -ms-flex-flow: row nowrap;\n    flex-flow: row nowrap;\n    -ms-flex-pack: start;\n    justify-content: flex-start;\n  }\n  .navbar-expand-xl .navbar-nav {\n    -ms-flex-direction: row;\n    flex-direction: row;\n  }\n  .navbar-expand-xl .navbar-nav .dropdown-menu {\n    position: absolute;\n  }\n  .navbar-expand-xl .navbar-nav .nav-link {\n    padding-right: 0.5rem;\n    padding-left: 0.5rem;\n  }\n  .navbar-expand-xl > .container,\n  .navbar-expand-xl > .container-fluid, .navbar-expand-xl > .container-sm, .navbar-expand-xl > .container-md, .navbar-expand-xl > .container-lg, .navbar-expand-xl > .container-xl {\n    -ms-flex-wrap: nowrap;\n    flex-wrap: nowrap;\n  }\n  .navbar-expand-xl .navbar-nav-scroll {\n    overflow: visible;\n  }\n  .navbar-expand-xl .navbar-collapse {\n    display: -ms-flexbox !important;\n    display: flex !important;\n    -ms-flex-preferred-size: auto;\n    flex-basis: auto;\n  }\n  .navbar-expand-xl .navbar-toggler {\n    display: none;\n  }\n}\n\n.navbar-expand {\n  -ms-flex-flow: row nowrap;\n  flex-flow: row nowrap;\n  -ms-flex-pack: start;\n  justify-content: flex-start;\n}\n\n.navbar-expand > .container,\n.navbar-expand > .container-fluid, .navbar-expand > .container-sm, .navbar-expand > .container-md, .navbar-expand > .container-lg, .navbar-expand > .container-xl {\n  padding-right: 0;\n  padding-left: 0;\n}\n\n.navbar-expand .navbar-nav {\n  -ms-flex-direction: row;\n  flex-direction: row;\n}\n\n.navbar-expand .navbar-nav .dropdown-menu {\n  position: absolute;\n}\n\n.navbar-expand .navbar-nav .nav-link {\n  padding-right: 0.5rem;\n  padding-left: 0.5rem;\n}\n\n.navbar-expand > .container,\n.navbar-expand > .container-fluid, .navbar-expand > .container-sm, .navbar-expand > .container-md, .navbar-expand > .container-lg, .navbar-expand > .container-xl {\n  -ms-flex-wrap: nowrap;\n  flex-wrap: nowrap;\n}\n\n.navbar-expand .navbar-nav-scroll {\n  overflow: visible;\n}\n\n.navbar-expand .navbar-collapse {\n  display: -ms-flexbox !important;\n  display: flex !important;\n  -ms-flex-preferred-size: auto;\n  flex-basis: auto;\n}\n\n.navbar-expand .navbar-toggler {\n  display: none;\n}\n\n.navbar-light .navbar-brand {\n  color: rgba(0, 0, 0, 0.9);\n}\n\n.navbar-light .navbar-brand:hover, .navbar-light .navbar-brand:focus {\n  color: rgba(0, 0, 0, 0.9);\n}\n\n.navbar-light .navbar-nav .nav-link {\n  color: rgba(0, 0, 0, 0.5);\n}\n\n.navbar-light .navbar-nav .nav-link:hover, .navbar-light .navbar-nav .nav-link:focus {\n  color: rgba(0, 0, 0, 0.7);\n}\n\n.navbar-light .navbar-nav .nav-link.disabled {\n  color: rgba(0, 0, 0, 0.3);\n}\n\n.navbar-light .navbar-nav .show > .nav-link,\n.navbar-light .navbar-nav .active > .nav-link,\n.navbar-light .navbar-nav .nav-link.show,\n.navbar-light .navbar-nav .nav-link.active {\n  color: rgba(0, 0, 0, 0.9);\n}\n\n.navbar-light .navbar-toggler {\n  color: rgba(0, 0, 0, 0.5);\n  border-color: rgba(0, 0, 0, 0.1);\n}\n\n.navbar-light .navbar-toggler-icon {\n  background-image: url(" + ___CSS_LOADER_URL_REPLACEMENT_6___ + ");\n}\n\n.navbar-light .navbar-text {\n  color: rgba(0, 0, 0, 0.5);\n}\n\n.navbar-light .navbar-text a {\n  color: rgba(0, 0, 0, 0.9);\n}\n\n.navbar-light .navbar-text a:hover, .navbar-light .navbar-text a:focus {\n  color: rgba(0, 0, 0, 0.9);\n}\n\n.navbar-dark .navbar-brand {\n  color: #fff;\n}\n\n.navbar-dark .navbar-brand:hover, .navbar-dark .navbar-brand:focus {\n  color: #fff;\n}\n\n.navbar-dark .navbar-nav .nav-link {\n  color: rgba(255, 255, 255, 0.5);\n}\n\n.navbar-dark .navbar-nav .nav-link:hover, .navbar-dark .navbar-nav .nav-link:focus {\n  color: rgba(255, 255, 255, 0.75);\n}\n\n.navbar-dark .navbar-nav .nav-link.disabled {\n  color: rgba(255, 255, 255, 0.25);\n}\n\n.navbar-dark .navbar-nav .show > .nav-link,\n.navbar-dark .navbar-nav .active > .nav-link,\n.navbar-dark .navbar-nav .nav-link.show,\n.navbar-dark .navbar-nav .nav-link.active {\n  color: #fff;\n}\n\n.navbar-dark .navbar-toggler {\n  color: rgba(255, 255, 255, 0.5);\n  border-color: rgba(255, 255, 255, 0.1);\n}\n\n.navbar-dark .navbar-toggler-icon {\n  background-image: url(" + ___CSS_LOADER_URL_REPLACEMENT_7___ + ");\n}\n\n.navbar-dark .navbar-text {\n  color: rgba(255, 255, 255, 0.5);\n}\n\n.navbar-dark .navbar-text a {\n  color: #fff;\n}\n\n.navbar-dark .navbar-text a:hover, .navbar-dark .navbar-text a:focus {\n  color: #fff;\n}\n\n.card {\n  position: relative;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-direction: column;\n  flex-direction: column;\n  min-width: 0;\n  word-wrap: break-word;\n  background-color: #fff;\n  background-clip: border-box;\n  border: 1px solid rgba(0, 0, 0, 0.125);\n  border-radius: 0.25rem;\n}\n\n.card > hr {\n  margin-right: 0;\n  margin-left: 0;\n}\n\n.card > .list-group {\n  border-top: inherit;\n  border-bottom: inherit;\n}\n\n.card > .list-group:first-child {\n  border-top-width: 0;\n  border-top-left-radius: calc(0.25rem - 1px);\n  border-top-right-radius: calc(0.25rem - 1px);\n}\n\n.card > .list-group:last-child {\n  border-bottom-width: 0;\n  border-bottom-right-radius: calc(0.25rem - 1px);\n  border-bottom-left-radius: calc(0.25rem - 1px);\n}\n\n.card > .card-header + .list-group,\n.card > .list-group + .card-footer {\n  border-top: 0;\n}\n\n.card-body {\n  -ms-flex: 1 1 auto;\n  flex: 1 1 auto;\n  min-height: 1px;\n  padding: 1.25rem;\n}\n\n.card-title {\n  margin-bottom: 0.75rem;\n}\n\n.card-subtitle {\n  margin-top: -0.375rem;\n  margin-bottom: 0;\n}\n\n.card-text:last-child {\n  margin-bottom: 0;\n}\n\n.card-link:hover {\n  text-decoration: none;\n}\n\n.card-link + .card-link {\n  margin-left: 1.25rem;\n}\n\n.card-header {\n  padding: 0.75rem 1.25rem;\n  margin-bottom: 0;\n  background-color: rgba(0, 0, 0, 0.03);\n  border-bottom: 1px solid rgba(0, 0, 0, 0.125);\n}\n\n.card-header:first-child {\n  border-radius: calc(0.25rem - 1px) calc(0.25rem - 1px) 0 0;\n}\n\n.card-footer {\n  padding: 0.75rem 1.25rem;\n  background-color: rgba(0, 0, 0, 0.03);\n  border-top: 1px solid rgba(0, 0, 0, 0.125);\n}\n\n.card-footer:last-child {\n  border-radius: 0 0 calc(0.25rem - 1px) calc(0.25rem - 1px);\n}\n\n.card-header-tabs {\n  margin-right: -0.625rem;\n  margin-bottom: -0.75rem;\n  margin-left: -0.625rem;\n  border-bottom: 0;\n}\n\n.card-header-pills {\n  margin-right: -0.625rem;\n  margin-left: -0.625rem;\n}\n\n.card-img-overlay {\n  position: absolute;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  padding: 1.25rem;\n  border-radius: calc(0.25rem - 1px);\n}\n\n.card-img,\n.card-img-top,\n.card-img-bottom {\n  -ms-flex-negative: 0;\n  flex-shrink: 0;\n  width: 100%;\n}\n\n.card-img,\n.card-img-top {\n  border-top-left-radius: calc(0.25rem - 1px);\n  border-top-right-radius: calc(0.25rem - 1px);\n}\n\n.card-img,\n.card-img-bottom {\n  border-bottom-right-radius: calc(0.25rem - 1px);\n  border-bottom-left-radius: calc(0.25rem - 1px);\n}\n\n.card-deck .card {\n  margin-bottom: 15px;\n}\n\n@media (min-width: 576px) {\n  .card-deck {\n    display: -ms-flexbox;\n    display: flex;\n    -ms-flex-flow: row wrap;\n    flex-flow: row wrap;\n    margin-right: -15px;\n    margin-left: -15px;\n  }\n  .card-deck .card {\n    -ms-flex: 1 0 0%;\n    flex: 1 0 0%;\n    margin-right: 15px;\n    margin-bottom: 0;\n    margin-left: 15px;\n  }\n}\n\n.card-group > .card {\n  margin-bottom: 15px;\n}\n\n@media (min-width: 576px) {\n  .card-group {\n    display: -ms-flexbox;\n    display: flex;\n    -ms-flex-flow: row wrap;\n    flex-flow: row wrap;\n  }\n  .card-group > .card {\n    -ms-flex: 1 0 0%;\n    flex: 1 0 0%;\n    margin-bottom: 0;\n  }\n  .card-group > .card + .card {\n    margin-left: 0;\n    border-left: 0;\n  }\n  .card-group > .card:not(:last-child) {\n    border-top-right-radius: 0;\n    border-bottom-right-radius: 0;\n  }\n  .card-group > .card:not(:last-child) .card-img-top,\n  .card-group > .card:not(:last-child) .card-header {\n    border-top-right-radius: 0;\n  }\n  .card-group > .card:not(:last-child) .card-img-bottom,\n  .card-group > .card:not(:last-child) .card-footer {\n    border-bottom-right-radius: 0;\n  }\n  .card-group > .card:not(:first-child) {\n    border-top-left-radius: 0;\n    border-bottom-left-radius: 0;\n  }\n  .card-group > .card:not(:first-child) .card-img-top,\n  .card-group > .card:not(:first-child) .card-header {\n    border-top-left-radius: 0;\n  }\n  .card-group > .card:not(:first-child) .card-img-bottom,\n  .card-group > .card:not(:first-child) .card-footer {\n    border-bottom-left-radius: 0;\n  }\n}\n\n.card-columns .card {\n  margin-bottom: 0.75rem;\n}\n\n@media (min-width: 576px) {\n  .card-columns {\n    -webkit-column-count: 3;\n    -moz-column-count: 3;\n    column-count: 3;\n    -webkit-column-gap: 1.25rem;\n    -moz-column-gap: 1.25rem;\n    column-gap: 1.25rem;\n    orphans: 1;\n    widows: 1;\n  }\n  .card-columns .card {\n    display: inline-block;\n    width: 100%;\n  }\n}\n\n.accordion {\n  overflow-anchor: none;\n}\n\n.accordion > .card {\n  overflow: hidden;\n}\n\n.accordion > .card:not(:last-of-type) {\n  border-bottom: 0;\n  border-bottom-right-radius: 0;\n  border-bottom-left-radius: 0;\n}\n\n.accordion > .card:not(:first-of-type) {\n  border-top-left-radius: 0;\n  border-top-right-radius: 0;\n}\n\n.accordion > .card > .card-header {\n  border-radius: 0;\n  margin-bottom: -1px;\n}\n\n.breadcrumb {\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-wrap: wrap;\n  flex-wrap: wrap;\n  padding: 0.75rem 1rem;\n  margin-bottom: 1rem;\n  list-style: none;\n  background-color: #e9ecef;\n  border-radius: 0.25rem;\n}\n\n.breadcrumb-item + .breadcrumb-item {\n  padding-left: 0.5rem;\n}\n\n.breadcrumb-item + .breadcrumb-item::before {\n  float: left;\n  padding-right: 0.5rem;\n  color: #6c757d;\n  content: \"/\";\n}\n\n.breadcrumb-item + .breadcrumb-item:hover::before {\n  text-decoration: underline;\n}\n\n.breadcrumb-item + .breadcrumb-item:hover::before {\n  text-decoration: none;\n}\n\n.breadcrumb-item.active {\n  color: #6c757d;\n}\n\n.pagination {\n  display: -ms-flexbox;\n  display: flex;\n  padding-left: 0;\n  list-style: none;\n  border-radius: 0.25rem;\n}\n\n.page-link {\n  position: relative;\n  display: block;\n  padding: 0.5rem 0.75rem;\n  margin-left: -1px;\n  line-height: 1.25;\n  color: #007bff;\n  background-color: #fff;\n  border: 1px solid #dee2e6;\n}\n\n.page-link:hover {\n  z-index: 2;\n  color: #0056b3;\n  text-decoration: none;\n  background-color: #e9ecef;\n  border-color: #dee2e6;\n}\n\n.page-link:focus {\n  z-index: 3;\n  outline: 0;\n  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);\n}\n\n.page-item:first-child .page-link {\n  margin-left: 0;\n  border-top-left-radius: 0.25rem;\n  border-bottom-left-radius: 0.25rem;\n}\n\n.page-item:last-child .page-link {\n  border-top-right-radius: 0.25rem;\n  border-bottom-right-radius: 0.25rem;\n}\n\n.page-item.active .page-link {\n  z-index: 3;\n  color: #fff;\n  background-color: #007bff;\n  border-color: #007bff;\n}\n\n.page-item.disabled .page-link {\n  color: #6c757d;\n  pointer-events: none;\n  cursor: auto;\n  background-color: #fff;\n  border-color: #dee2e6;\n}\n\n.pagination-lg .page-link {\n  padding: 0.75rem 1.5rem;\n  font-size: 1.25rem;\n  line-height: 1.5;\n}\n\n.pagination-lg .page-item:first-child .page-link {\n  border-top-left-radius: 0.3rem;\n  border-bottom-left-radius: 0.3rem;\n}\n\n.pagination-lg .page-item:last-child .page-link {\n  border-top-right-radius: 0.3rem;\n  border-bottom-right-radius: 0.3rem;\n}\n\n.pagination-sm .page-link {\n  padding: 0.25rem 0.5rem;\n  font-size: 0.875rem;\n  line-height: 1.5;\n}\n\n.pagination-sm .page-item:first-child .page-link {\n  border-top-left-radius: 0.2rem;\n  border-bottom-left-radius: 0.2rem;\n}\n\n.pagination-sm .page-item:last-child .page-link {\n  border-top-right-radius: 0.2rem;\n  border-bottom-right-radius: 0.2rem;\n}\n\n.badge {\n  display: inline-block;\n  padding: 0.25em 0.4em;\n  font-size: 75%;\n  font-weight: 700;\n  line-height: 1;\n  text-align: center;\n  white-space: nowrap;\n  vertical-align: baseline;\n  border-radius: 0.25rem;\n  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .badge {\n    transition: none;\n  }\n}\n\na.badge:hover, a.badge:focus {\n  text-decoration: none;\n}\n\n.badge:empty {\n  display: none;\n}\n\n.btn .badge {\n  position: relative;\n  top: -1px;\n}\n\n.badge-pill {\n  padding-right: 0.6em;\n  padding-left: 0.6em;\n  border-radius: 10rem;\n}\n\n.badge-primary {\n  color: #fff;\n  background-color: #007bff;\n}\n\na.badge-primary:hover, a.badge-primary:focus {\n  color: #fff;\n  background-color: #0062cc;\n}\n\na.badge-primary:focus, a.badge-primary.focus {\n  outline: 0;\n  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.5);\n}\n\n.badge-secondary {\n  color: #fff;\n  background-color: #6c757d;\n}\n\na.badge-secondary:hover, a.badge-secondary:focus {\n  color: #fff;\n  background-color: #545b62;\n}\n\na.badge-secondary:focus, a.badge-secondary.focus {\n  outline: 0;\n  box-shadow: 0 0 0 0.2rem rgba(108, 117, 125, 0.5);\n}\n\n.badge-success {\n  color: #fff;\n  background-color: #28a745;\n}\n\na.badge-success:hover, a.badge-success:focus {\n  color: #fff;\n  background-color: #1e7e34;\n}\n\na.badge-success:focus, a.badge-success.focus {\n  outline: 0;\n  box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.5);\n}\n\n.badge-info {\n  color: #fff;\n  background-color: #17a2b8;\n}\n\na.badge-info:hover, a.badge-info:focus {\n  color: #fff;\n  background-color: #117a8b;\n}\n\na.badge-info:focus, a.badge-info.focus {\n  outline: 0;\n  box-shadow: 0 0 0 0.2rem rgba(23, 162, 184, 0.5);\n}\n\n.badge-warning {\n  color: #212529;\n  background-color: #ffc107;\n}\n\na.badge-warning:hover, a.badge-warning:focus {\n  color: #212529;\n  background-color: #d39e00;\n}\n\na.badge-warning:focus, a.badge-warning.focus {\n  outline: 0;\n  box-shadow: 0 0 0 0.2rem rgba(255, 193, 7, 0.5);\n}\n\n.badge-danger {\n  color: #fff;\n  background-color: #dc3545;\n}\n\na.badge-danger:hover, a.badge-danger:focus {\n  color: #fff;\n  background-color: #bd2130;\n}\n\na.badge-danger:focus, a.badge-danger.focus {\n  outline: 0;\n  box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.5);\n}\n\n.badge-light {\n  color: #212529;\n  background-color: #f8f9fa;\n}\n\na.badge-light:hover, a.badge-light:focus {\n  color: #212529;\n  background-color: #dae0e5;\n}\n\na.badge-light:focus, a.badge-light.focus {\n  outline: 0;\n  box-shadow: 0 0 0 0.2rem rgba(248, 249, 250, 0.5);\n}\n\n.badge-dark {\n  color: #fff;\n  background-color: #343a40;\n}\n\na.badge-dark:hover, a.badge-dark:focus {\n  color: #fff;\n  background-color: #1d2124;\n}\n\na.badge-dark:focus, a.badge-dark.focus {\n  outline: 0;\n  box-shadow: 0 0 0 0.2rem rgba(52, 58, 64, 0.5);\n}\n\n.jumbotron {\n  padding: 2rem 1rem;\n  margin-bottom: 2rem;\n  background-color: #e9ecef;\n  border-radius: 0.3rem;\n}\n\n@media (min-width: 576px) {\n  .jumbotron {\n    padding: 4rem 2rem;\n  }\n}\n\n.jumbotron-fluid {\n  padding-right: 0;\n  padding-left: 0;\n  border-radius: 0;\n}\n\n.alert {\n  position: relative;\n  padding: 0.75rem 1.25rem;\n  margin-bottom: 1rem;\n  border: 1px solid transparent;\n  border-radius: 0.25rem;\n}\n\n.alert-heading {\n  color: inherit;\n}\n\n.alert-link {\n  font-weight: 700;\n}\n\n.alert-dismissible {\n  padding-right: 4rem;\n}\n\n.alert-dismissible .close {\n  position: absolute;\n  top: 0;\n  right: 0;\n  z-index: 2;\n  padding: 0.75rem 1.25rem;\n  color: inherit;\n}\n\n.alert-primary {\n  color: #004085;\n  background-color: #cce5ff;\n  border-color: #b8daff;\n}\n\n.alert-primary hr {\n  border-top-color: #9fcdff;\n}\n\n.alert-primary .alert-link {\n  color: #002752;\n}\n\n.alert-secondary {\n  color: #383d41;\n  background-color: #e2e3e5;\n  border-color: #d6d8db;\n}\n\n.alert-secondary hr {\n  border-top-color: #c8cbcf;\n}\n\n.alert-secondary .alert-link {\n  color: #202326;\n}\n\n.alert-success {\n  color: #155724;\n  background-color: #d4edda;\n  border-color: #c3e6cb;\n}\n\n.alert-success hr {\n  border-top-color: #b1dfbb;\n}\n\n.alert-success .alert-link {\n  color: #0b2e13;\n}\n\n.alert-info {\n  color: #0c5460;\n  background-color: #d1ecf1;\n  border-color: #bee5eb;\n}\n\n.alert-info hr {\n  border-top-color: #abdde5;\n}\n\n.alert-info .alert-link {\n  color: #062c33;\n}\n\n.alert-warning {\n  color: #856404;\n  background-color: #fff3cd;\n  border-color: #ffeeba;\n}\n\n.alert-warning hr {\n  border-top-color: #ffe8a1;\n}\n\n.alert-warning .alert-link {\n  color: #533f03;\n}\n\n.alert-danger {\n  color: #721c24;\n  background-color: #f8d7da;\n  border-color: #f5c6cb;\n}\n\n.alert-danger hr {\n  border-top-color: #f1b0b7;\n}\n\n.alert-danger .alert-link {\n  color: #491217;\n}\n\n.alert-light {\n  color: #818182;\n  background-color: #fefefe;\n  border-color: #fdfdfe;\n}\n\n.alert-light hr {\n  border-top-color: #ececf6;\n}\n\n.alert-light .alert-link {\n  color: #686868;\n}\n\n.alert-dark {\n  color: #1b1e21;\n  background-color: #d6d8d9;\n  border-color: #c6c8ca;\n}\n\n.alert-dark hr {\n  border-top-color: #b9bbbe;\n}\n\n.alert-dark .alert-link {\n  color: #040505;\n}\n\n@-webkit-keyframes progress-bar-stripes {\n  from {\n    background-position: 1rem 0;\n  }\n  to {\n    background-position: 0 0;\n  }\n}\n\n@keyframes progress-bar-stripes {\n  from {\n    background-position: 1rem 0;\n  }\n  to {\n    background-position: 0 0;\n  }\n}\n\n.progress {\n  display: -ms-flexbox;\n  display: flex;\n  height: 1rem;\n  overflow: hidden;\n  line-height: 0;\n  font-size: 0.75rem;\n  background-color: #e9ecef;\n  border-radius: 0.25rem;\n}\n\n.progress-bar {\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-direction: column;\n  flex-direction: column;\n  -ms-flex-pack: center;\n  justify-content: center;\n  overflow: hidden;\n  color: #fff;\n  text-align: center;\n  white-space: nowrap;\n  background-color: #007bff;\n  transition: width 0.6s ease;\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .progress-bar {\n    transition: none;\n  }\n}\n\n.progress-bar-striped {\n  background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);\n  background-size: 1rem 1rem;\n}\n\n.progress-bar-animated {\n  -webkit-animation: 1s linear infinite progress-bar-stripes;\n  animation: 1s linear infinite progress-bar-stripes;\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .progress-bar-animated {\n    -webkit-animation: none;\n    animation: none;\n  }\n}\n\n.media {\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-align: start;\n  align-items: flex-start;\n}\n\n.media-body {\n  -ms-flex: 1;\n  flex: 1;\n}\n\n.list-group {\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-direction: column;\n  flex-direction: column;\n  padding-left: 0;\n  margin-bottom: 0;\n  border-radius: 0.25rem;\n}\n\n.list-group-item-action {\n  width: 100%;\n  color: #495057;\n  text-align: inherit;\n}\n\n.list-group-item-action:hover, .list-group-item-action:focus {\n  z-index: 1;\n  color: #495057;\n  text-decoration: none;\n  background-color: #f8f9fa;\n}\n\n.list-group-item-action:active {\n  color: #212529;\n  background-color: #e9ecef;\n}\n\n.list-group-item {\n  position: relative;\n  display: block;\n  padding: 0.75rem 1.25rem;\n  background-color: #fff;\n  border: 1px solid rgba(0, 0, 0, 0.125);\n}\n\n.list-group-item:first-child {\n  border-top-left-radius: inherit;\n  border-top-right-radius: inherit;\n}\n\n.list-group-item:last-child {\n  border-bottom-right-radius: inherit;\n  border-bottom-left-radius: inherit;\n}\n\n.list-group-item.disabled, .list-group-item:disabled {\n  color: #6c757d;\n  pointer-events: none;\n  background-color: #fff;\n}\n\n.list-group-item.active {\n  z-index: 2;\n  color: #fff;\n  background-color: #007bff;\n  border-color: #007bff;\n}\n\n.list-group-item + .list-group-item {\n  border-top-width: 0;\n}\n\n.list-group-item + .list-group-item.active {\n  margin-top: -1px;\n  border-top-width: 1px;\n}\n\n.list-group-horizontal {\n  -ms-flex-direction: row;\n  flex-direction: row;\n}\n\n.list-group-horizontal > .list-group-item:first-child {\n  border-bottom-left-radius: 0.25rem;\n  border-top-right-radius: 0;\n}\n\n.list-group-horizontal > .list-group-item:last-child {\n  border-top-right-radius: 0.25rem;\n  border-bottom-left-radius: 0;\n}\n\n.list-group-horizontal > .list-group-item.active {\n  margin-top: 0;\n}\n\n.list-group-horizontal > .list-group-item + .list-group-item {\n  border-top-width: 1px;\n  border-left-width: 0;\n}\n\n.list-group-horizontal > .list-group-item + .list-group-item.active {\n  margin-left: -1px;\n  border-left-width: 1px;\n}\n\n@media (min-width: 576px) {\n  .list-group-horizontal-sm {\n    -ms-flex-direction: row;\n    flex-direction: row;\n  }\n  .list-group-horizontal-sm > .list-group-item:first-child {\n    border-bottom-left-radius: 0.25rem;\n    border-top-right-radius: 0;\n  }\n  .list-group-horizontal-sm > .list-group-item:last-child {\n    border-top-right-radius: 0.25rem;\n    border-bottom-left-radius: 0;\n  }\n  .list-group-horizontal-sm > .list-group-item.active {\n    margin-top: 0;\n  }\n  .list-group-horizontal-sm > .list-group-item + .list-group-item {\n    border-top-width: 1px;\n    border-left-width: 0;\n  }\n  .list-group-horizontal-sm > .list-group-item + .list-group-item.active {\n    margin-left: -1px;\n    border-left-width: 1px;\n  }\n}\n\n@media (min-width: 768px) {\n  .list-group-horizontal-md {\n    -ms-flex-direction: row;\n    flex-direction: row;\n  }\n  .list-group-horizontal-md > .list-group-item:first-child {\n    border-bottom-left-radius: 0.25rem;\n    border-top-right-radius: 0;\n  }\n  .list-group-horizontal-md > .list-group-item:last-child {\n    border-top-right-radius: 0.25rem;\n    border-bottom-left-radius: 0;\n  }\n  .list-group-horizontal-md > .list-group-item.active {\n    margin-top: 0;\n  }\n  .list-group-horizontal-md > .list-group-item + .list-group-item {\n    border-top-width: 1px;\n    border-left-width: 0;\n  }\n  .list-group-horizontal-md > .list-group-item + .list-group-item.active {\n    margin-left: -1px;\n    border-left-width: 1px;\n  }\n}\n\n@media (min-width: 992px) {\n  .list-group-horizontal-lg {\n    -ms-flex-direction: row;\n    flex-direction: row;\n  }\n  .list-group-horizontal-lg > .list-group-item:first-child {\n    border-bottom-left-radius: 0.25rem;\n    border-top-right-radius: 0;\n  }\n  .list-group-horizontal-lg > .list-group-item:last-child {\n    border-top-right-radius: 0.25rem;\n    border-bottom-left-radius: 0;\n  }\n  .list-group-horizontal-lg > .list-group-item.active {\n    margin-top: 0;\n  }\n  .list-group-horizontal-lg > .list-group-item + .list-group-item {\n    border-top-width: 1px;\n    border-left-width: 0;\n  }\n  .list-group-horizontal-lg > .list-group-item + .list-group-item.active {\n    margin-left: -1px;\n    border-left-width: 1px;\n  }\n}\n\n@media (min-width: 1200px) {\n  .list-group-horizontal-xl {\n    -ms-flex-direction: row;\n    flex-direction: row;\n  }\n  .list-group-horizontal-xl > .list-group-item:first-child {\n    border-bottom-left-radius: 0.25rem;\n    border-top-right-radius: 0;\n  }\n  .list-group-horizontal-xl > .list-group-item:last-child {\n    border-top-right-radius: 0.25rem;\n    border-bottom-left-radius: 0;\n  }\n  .list-group-horizontal-xl > .list-group-item.active {\n    margin-top: 0;\n  }\n  .list-group-horizontal-xl > .list-group-item + .list-group-item {\n    border-top-width: 1px;\n    border-left-width: 0;\n  }\n  .list-group-horizontal-xl > .list-group-item + .list-group-item.active {\n    margin-left: -1px;\n    border-left-width: 1px;\n  }\n}\n\n.list-group-flush {\n  border-radius: 0;\n}\n\n.list-group-flush > .list-group-item {\n  border-width: 0 0 1px;\n}\n\n.list-group-flush > .list-group-item:last-child {\n  border-bottom-width: 0;\n}\n\n.list-group-item-primary {\n  color: #004085;\n  background-color: #b8daff;\n}\n\n.list-group-item-primary.list-group-item-action:hover, .list-group-item-primary.list-group-item-action:focus {\n  color: #004085;\n  background-color: #9fcdff;\n}\n\n.list-group-item-primary.list-group-item-action.active {\n  color: #fff;\n  background-color: #004085;\n  border-color: #004085;\n}\n\n.list-group-item-secondary {\n  color: #383d41;\n  background-color: #d6d8db;\n}\n\n.list-group-item-secondary.list-group-item-action:hover, .list-group-item-secondary.list-group-item-action:focus {\n  color: #383d41;\n  background-color: #c8cbcf;\n}\n\n.list-group-item-secondary.list-group-item-action.active {\n  color: #fff;\n  background-color: #383d41;\n  border-color: #383d41;\n}\n\n.list-group-item-success {\n  color: #155724;\n  background-color: #c3e6cb;\n}\n\n.list-group-item-success.list-group-item-action:hover, .list-group-item-success.list-group-item-action:focus {\n  color: #155724;\n  background-color: #b1dfbb;\n}\n\n.list-group-item-success.list-group-item-action.active {\n  color: #fff;\n  background-color: #155724;\n  border-color: #155724;\n}\n\n.list-group-item-info {\n  color: #0c5460;\n  background-color: #bee5eb;\n}\n\n.list-group-item-info.list-group-item-action:hover, .list-group-item-info.list-group-item-action:focus {\n  color: #0c5460;\n  background-color: #abdde5;\n}\n\n.list-group-item-info.list-group-item-action.active {\n  color: #fff;\n  background-color: #0c5460;\n  border-color: #0c5460;\n}\n\n.list-group-item-warning {\n  color: #856404;\n  background-color: #ffeeba;\n}\n\n.list-group-item-warning.list-group-item-action:hover, .list-group-item-warning.list-group-item-action:focus {\n  color: #856404;\n  background-color: #ffe8a1;\n}\n\n.list-group-item-warning.list-group-item-action.active {\n  color: #fff;\n  background-color: #856404;\n  border-color: #856404;\n}\n\n.list-group-item-danger {\n  color: #721c24;\n  background-color: #f5c6cb;\n}\n\n.list-group-item-danger.list-group-item-action:hover, .list-group-item-danger.list-group-item-action:focus {\n  color: #721c24;\n  background-color: #f1b0b7;\n}\n\n.list-group-item-danger.list-group-item-action.active {\n  color: #fff;\n  background-color: #721c24;\n  border-color: #721c24;\n}\n\n.list-group-item-light {\n  color: #818182;\n  background-color: #fdfdfe;\n}\n\n.list-group-item-light.list-group-item-action:hover, .list-group-item-light.list-group-item-action:focus {\n  color: #818182;\n  background-color: #ececf6;\n}\n\n.list-group-item-light.list-group-item-action.active {\n  color: #fff;\n  background-color: #818182;\n  border-color: #818182;\n}\n\n.list-group-item-dark {\n  color: #1b1e21;\n  background-color: #c6c8ca;\n}\n\n.list-group-item-dark.list-group-item-action:hover, .list-group-item-dark.list-group-item-action:focus {\n  color: #1b1e21;\n  background-color: #b9bbbe;\n}\n\n.list-group-item-dark.list-group-item-action.active {\n  color: #fff;\n  background-color: #1b1e21;\n  border-color: #1b1e21;\n}\n\n.close {\n  float: right;\n  font-size: 1.5rem;\n  font-weight: 700;\n  line-height: 1;\n  color: #000;\n  text-shadow: 0 1px 0 #fff;\n  opacity: .5;\n}\n\n.close:hover {\n  color: #000;\n  text-decoration: none;\n}\n\n.close:not(:disabled):not(.disabled):hover, .close:not(:disabled):not(.disabled):focus {\n  opacity: .75;\n}\n\nbutton.close {\n  padding: 0;\n  background-color: transparent;\n  border: 0;\n}\n\na.close.disabled {\n  pointer-events: none;\n}\n\n.toast {\n  -ms-flex-preferred-size: 350px;\n  flex-basis: 350px;\n  max-width: 350px;\n  font-size: 0.875rem;\n  background-color: rgba(255, 255, 255, 0.85);\n  background-clip: padding-box;\n  border: 1px solid rgba(0, 0, 0, 0.1);\n  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.1);\n  opacity: 0;\n  border-radius: 0.25rem;\n}\n\n.toast:not(:last-child) {\n  margin-bottom: 0.75rem;\n}\n\n.toast.showing {\n  opacity: 1;\n}\n\n.toast.show {\n  display: block;\n  opacity: 1;\n}\n\n.toast.hide {\n  display: none;\n}\n\n.toast-header {\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-align: center;\n  align-items: center;\n  padding: 0.25rem 0.75rem;\n  color: #6c757d;\n  background-color: rgba(255, 255, 255, 0.85);\n  background-clip: padding-box;\n  border-bottom: 1px solid rgba(0, 0, 0, 0.05);\n  border-top-left-radius: calc(0.25rem - 1px);\n  border-top-right-radius: calc(0.25rem - 1px);\n}\n\n.toast-body {\n  padding: 0.75rem;\n}\n\n.modal-open {\n  overflow: hidden;\n}\n\n.modal-open .modal {\n  overflow-x: hidden;\n  overflow-y: auto;\n}\n\n.modal {\n  position: fixed;\n  top: 0;\n  left: 0;\n  z-index: 1050;\n  display: none;\n  width: 100%;\n  height: 100%;\n  overflow: hidden;\n  outline: 0;\n}\n\n.modal-dialog {\n  position: relative;\n  width: auto;\n  margin: 0.5rem;\n  pointer-events: none;\n}\n\n.modal.fade .modal-dialog {\n  transition: -webkit-transform 0.3s ease-out;\n  transition: transform 0.3s ease-out;\n  transition: transform 0.3s ease-out, -webkit-transform 0.3s ease-out;\n  -webkit-transform: translate(0, -50px);\n  transform: translate(0, -50px);\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .modal.fade .modal-dialog {\n    transition: none;\n  }\n}\n\n.modal.show .modal-dialog {\n  -webkit-transform: none;\n  transform: none;\n}\n\n.modal.modal-static .modal-dialog {\n  -webkit-transform: scale(1.02);\n  transform: scale(1.02);\n}\n\n.modal-dialog-scrollable {\n  display: -ms-flexbox;\n  display: flex;\n  max-height: calc(100% - 1rem);\n}\n\n.modal-dialog-scrollable .modal-content {\n  max-height: calc(100vh - 1rem);\n  overflow: hidden;\n}\n\n.modal-dialog-scrollable .modal-header,\n.modal-dialog-scrollable .modal-footer {\n  -ms-flex-negative: 0;\n  flex-shrink: 0;\n}\n\n.modal-dialog-scrollable .modal-body {\n  overflow-y: auto;\n}\n\n.modal-dialog-centered {\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-align: center;\n  align-items: center;\n  min-height: calc(100% - 1rem);\n}\n\n.modal-dialog-centered::before {\n  display: block;\n  height: calc(100vh - 1rem);\n  height: -webkit-min-content;\n  height: -moz-min-content;\n  height: min-content;\n  content: \"\";\n}\n\n.modal-dialog-centered.modal-dialog-scrollable {\n  -ms-flex-direction: column;\n  flex-direction: column;\n  -ms-flex-pack: center;\n  justify-content: center;\n  height: 100%;\n}\n\n.modal-dialog-centered.modal-dialog-scrollable .modal-content {\n  max-height: none;\n}\n\n.modal-dialog-centered.modal-dialog-scrollable::before {\n  content: none;\n}\n\n.modal-content {\n  position: relative;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-direction: column;\n  flex-direction: column;\n  width: 100%;\n  pointer-events: auto;\n  background-color: #fff;\n  background-clip: padding-box;\n  border: 1px solid rgba(0, 0, 0, 0.2);\n  border-radius: 0.3rem;\n  outline: 0;\n}\n\n.modal-backdrop {\n  position: fixed;\n  top: 0;\n  left: 0;\n  z-index: 1040;\n  width: 100vw;\n  height: 100vh;\n  background-color: #000;\n}\n\n.modal-backdrop.fade {\n  opacity: 0;\n}\n\n.modal-backdrop.show {\n  opacity: 0.5;\n}\n\n.modal-header {\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-align: start;\n  align-items: flex-start;\n  -ms-flex-pack: justify;\n  justify-content: space-between;\n  padding: 1rem 1rem;\n  border-bottom: 1px solid #dee2e6;\n  border-top-left-radius: calc(0.3rem - 1px);\n  border-top-right-radius: calc(0.3rem - 1px);\n}\n\n.modal-header .close {\n  padding: 1rem 1rem;\n  margin: -1rem -1rem -1rem auto;\n}\n\n.modal-title {\n  margin-bottom: 0;\n  line-height: 1.5;\n}\n\n.modal-body {\n  position: relative;\n  -ms-flex: 1 1 auto;\n  flex: 1 1 auto;\n  padding: 1rem;\n}\n\n.modal-footer {\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-wrap: wrap;\n  flex-wrap: wrap;\n  -ms-flex-align: center;\n  align-items: center;\n  -ms-flex-pack: end;\n  justify-content: flex-end;\n  padding: 0.75rem;\n  border-top: 1px solid #dee2e6;\n  border-bottom-right-radius: calc(0.3rem - 1px);\n  border-bottom-left-radius: calc(0.3rem - 1px);\n}\n\n.modal-footer > * {\n  margin: 0.25rem;\n}\n\n.modal-scrollbar-measure {\n  position: absolute;\n  top: -9999px;\n  width: 50px;\n  height: 50px;\n  overflow: scroll;\n}\n\n@media (min-width: 576px) {\n  .modal-dialog {\n    max-width: 500px;\n    margin: 1.75rem auto;\n  }\n  .modal-dialog-scrollable {\n    max-height: calc(100% - 3.5rem);\n  }\n  .modal-dialog-scrollable .modal-content {\n    max-height: calc(100vh - 3.5rem);\n  }\n  .modal-dialog-centered {\n    min-height: calc(100% - 3.5rem);\n  }\n  .modal-dialog-centered::before {\n    height: calc(100vh - 3.5rem);\n    height: -webkit-min-content;\n    height: -moz-min-content;\n    height: min-content;\n  }\n  .modal-sm {\n    max-width: 300px;\n  }\n}\n\n@media (min-width: 992px) {\n  .modal-lg,\n  .modal-xl {\n    max-width: 800px;\n  }\n}\n\n@media (min-width: 1200px) {\n  .modal-xl {\n    max-width: 1140px;\n  }\n}\n\n.tooltip {\n  position: absolute;\n  z-index: 1070;\n  display: block;\n  margin: 0;\n  font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, \"Noto Sans\", \"Liberation Sans\", sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\", \"Noto Color Emoji\";\n  font-style: normal;\n  font-weight: 400;\n  line-height: 1.5;\n  text-align: left;\n  text-align: start;\n  text-decoration: none;\n  text-shadow: none;\n  text-transform: none;\n  letter-spacing: normal;\n  word-break: normal;\n  white-space: normal;\n  word-spacing: normal;\n  line-break: auto;\n  font-size: 0.875rem;\n  word-wrap: break-word;\n  opacity: 0;\n}\n\n.tooltip.show {\n  opacity: 0.9;\n}\n\n.tooltip .arrow {\n  position: absolute;\n  display: block;\n  width: 0.8rem;\n  height: 0.4rem;\n}\n\n.tooltip .arrow::before {\n  position: absolute;\n  content: \"\";\n  border-color: transparent;\n  border-style: solid;\n}\n\n.bs-tooltip-top, .bs-tooltip-auto[x-placement^=\"top\"] {\n  padding: 0.4rem 0;\n}\n\n.bs-tooltip-top .arrow, .bs-tooltip-auto[x-placement^=\"top\"] .arrow {\n  bottom: 0;\n}\n\n.bs-tooltip-top .arrow::before, .bs-tooltip-auto[x-placement^=\"top\"] .arrow::before {\n  top: 0;\n  border-width: 0.4rem 0.4rem 0;\n  border-top-color: #000;\n}\n\n.bs-tooltip-right, .bs-tooltip-auto[x-placement^=\"right\"] {\n  padding: 0 0.4rem;\n}\n\n.bs-tooltip-right .arrow, .bs-tooltip-auto[x-placement^=\"right\"] .arrow {\n  left: 0;\n  width: 0.4rem;\n  height: 0.8rem;\n}\n\n.bs-tooltip-right .arrow::before, .bs-tooltip-auto[x-placement^=\"right\"] .arrow::before {\n  right: 0;\n  border-width: 0.4rem 0.4rem 0.4rem 0;\n  border-right-color: #000;\n}\n\n.bs-tooltip-bottom, .bs-tooltip-auto[x-placement^=\"bottom\"] {\n  padding: 0.4rem 0;\n}\n\n.bs-tooltip-bottom .arrow, .bs-tooltip-auto[x-placement^=\"bottom\"] .arrow {\n  top: 0;\n}\n\n.bs-tooltip-bottom .arrow::before, .bs-tooltip-auto[x-placement^=\"bottom\"] .arrow::before {\n  bottom: 0;\n  border-width: 0 0.4rem 0.4rem;\n  border-bottom-color: #000;\n}\n\n.bs-tooltip-left, .bs-tooltip-auto[x-placement^=\"left\"] {\n  padding: 0 0.4rem;\n}\n\n.bs-tooltip-left .arrow, .bs-tooltip-auto[x-placement^=\"left\"] .arrow {\n  right: 0;\n  width: 0.4rem;\n  height: 0.8rem;\n}\n\n.bs-tooltip-left .arrow::before, .bs-tooltip-auto[x-placement^=\"left\"] .arrow::before {\n  left: 0;\n  border-width: 0.4rem 0 0.4rem 0.4rem;\n  border-left-color: #000;\n}\n\n.tooltip-inner {\n  max-width: 200px;\n  padding: 0.25rem 0.5rem;\n  color: #fff;\n  text-align: center;\n  background-color: #000;\n  border-radius: 0.25rem;\n}\n\n.popover {\n  position: absolute;\n  top: 0;\n  left: 0;\n  z-index: 1060;\n  display: block;\n  max-width: 276px;\n  font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, \"Noto Sans\", \"Liberation Sans\", sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\", \"Noto Color Emoji\";\n  font-style: normal;\n  font-weight: 400;\n  line-height: 1.5;\n  text-align: left;\n  text-align: start;\n  text-decoration: none;\n  text-shadow: none;\n  text-transform: none;\n  letter-spacing: normal;\n  word-break: normal;\n  white-space: normal;\n  word-spacing: normal;\n  line-break: auto;\n  font-size: 0.875rem;\n  word-wrap: break-word;\n  background-color: #fff;\n  background-clip: padding-box;\n  border: 1px solid rgba(0, 0, 0, 0.2);\n  border-radius: 0.3rem;\n}\n\n.popover .arrow {\n  position: absolute;\n  display: block;\n  width: 1rem;\n  height: 0.5rem;\n  margin: 0 0.3rem;\n}\n\n.popover .arrow::before, .popover .arrow::after {\n  position: absolute;\n  display: block;\n  content: \"\";\n  border-color: transparent;\n  border-style: solid;\n}\n\n.bs-popover-top, .bs-popover-auto[x-placement^=\"top\"] {\n  margin-bottom: 0.5rem;\n}\n\n.bs-popover-top > .arrow, .bs-popover-auto[x-placement^=\"top\"] > .arrow {\n  bottom: calc(-0.5rem - 1px);\n}\n\n.bs-popover-top > .arrow::before, .bs-popover-auto[x-placement^=\"top\"] > .arrow::before {\n  bottom: 0;\n  border-width: 0.5rem 0.5rem 0;\n  border-top-color: rgba(0, 0, 0, 0.25);\n}\n\n.bs-popover-top > .arrow::after, .bs-popover-auto[x-placement^=\"top\"] > .arrow::after {\n  bottom: 1px;\n  border-width: 0.5rem 0.5rem 0;\n  border-top-color: #fff;\n}\n\n.bs-popover-right, .bs-popover-auto[x-placement^=\"right\"] {\n  margin-left: 0.5rem;\n}\n\n.bs-popover-right > .arrow, .bs-popover-auto[x-placement^=\"right\"] > .arrow {\n  left: calc(-0.5rem - 1px);\n  width: 0.5rem;\n  height: 1rem;\n  margin: 0.3rem 0;\n}\n\n.bs-popover-right > .arrow::before, .bs-popover-auto[x-placement^=\"right\"] > .arrow::before {\n  left: 0;\n  border-width: 0.5rem 0.5rem 0.5rem 0;\n  border-right-color: rgba(0, 0, 0, 0.25);\n}\n\n.bs-popover-right > .arrow::after, .bs-popover-auto[x-placement^=\"right\"] > .arrow::after {\n  left: 1px;\n  border-width: 0.5rem 0.5rem 0.5rem 0;\n  border-right-color: #fff;\n}\n\n.bs-popover-bottom, .bs-popover-auto[x-placement^=\"bottom\"] {\n  margin-top: 0.5rem;\n}\n\n.bs-popover-bottom > .arrow, .bs-popover-auto[x-placement^=\"bottom\"] > .arrow {\n  top: calc(-0.5rem - 1px);\n}\n\n.bs-popover-bottom > .arrow::before, .bs-popover-auto[x-placement^=\"bottom\"] > .arrow::before {\n  top: 0;\n  border-width: 0 0.5rem 0.5rem 0.5rem;\n  border-bottom-color: rgba(0, 0, 0, 0.25);\n}\n\n.bs-popover-bottom > .arrow::after, .bs-popover-auto[x-placement^=\"bottom\"] > .arrow::after {\n  top: 1px;\n  border-width: 0 0.5rem 0.5rem 0.5rem;\n  border-bottom-color: #fff;\n}\n\n.bs-popover-bottom .popover-header::before, .bs-popover-auto[x-placement^=\"bottom\"] .popover-header::before {\n  position: absolute;\n  top: 0;\n  left: 50%;\n  display: block;\n  width: 1rem;\n  margin-left: -0.5rem;\n  content: \"\";\n  border-bottom: 1px solid #f7f7f7;\n}\n\n.bs-popover-left, .bs-popover-auto[x-placement^=\"left\"] {\n  margin-right: 0.5rem;\n}\n\n.bs-popover-left > .arrow, .bs-popover-auto[x-placement^=\"left\"] > .arrow {\n  right: calc(-0.5rem - 1px);\n  width: 0.5rem;\n  height: 1rem;\n  margin: 0.3rem 0;\n}\n\n.bs-popover-left > .arrow::before, .bs-popover-auto[x-placement^=\"left\"] > .arrow::before {\n  right: 0;\n  border-width: 0.5rem 0 0.5rem 0.5rem;\n  border-left-color: rgba(0, 0, 0, 0.25);\n}\n\n.bs-popover-left > .arrow::after, .bs-popover-auto[x-placement^=\"left\"] > .arrow::after {\n  right: 1px;\n  border-width: 0.5rem 0 0.5rem 0.5rem;\n  border-left-color: #fff;\n}\n\n.popover-header {\n  padding: 0.5rem 0.75rem;\n  margin-bottom: 0;\n  font-size: 1rem;\n  background-color: #f7f7f7;\n  border-bottom: 1px solid #ebebeb;\n  border-top-left-radius: calc(0.3rem - 1px);\n  border-top-right-radius: calc(0.3rem - 1px);\n}\n\n.popover-header:empty {\n  display: none;\n}\n\n.popover-body {\n  padding: 0.5rem 0.75rem;\n  color: #212529;\n}\n\n.carousel {\n  position: relative;\n}\n\n.carousel.pointer-event {\n  -ms-touch-action: pan-y;\n  touch-action: pan-y;\n}\n\n.carousel-inner {\n  position: relative;\n  width: 100%;\n  overflow: hidden;\n}\n\n.carousel-inner::after {\n  display: block;\n  clear: both;\n  content: \"\";\n}\n\n.carousel-item {\n  position: relative;\n  display: none;\n  float: left;\n  width: 100%;\n  margin-right: -100%;\n  -webkit-backface-visibility: hidden;\n  backface-visibility: hidden;\n  transition: -webkit-transform 0.6s ease-in-out;\n  transition: transform 0.6s ease-in-out;\n  transition: transform 0.6s ease-in-out, -webkit-transform 0.6s ease-in-out;\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .carousel-item {\n    transition: none;\n  }\n}\n\n.carousel-item.active,\n.carousel-item-next,\n.carousel-item-prev {\n  display: block;\n}\n\n.carousel-item-next:not(.carousel-item-left),\n.active.carousel-item-right {\n  -webkit-transform: translateX(100%);\n  transform: translateX(100%);\n}\n\n.carousel-item-prev:not(.carousel-item-right),\n.active.carousel-item-left {\n  -webkit-transform: translateX(-100%);\n  transform: translateX(-100%);\n}\n\n.carousel-fade .carousel-item {\n  opacity: 0;\n  transition-property: opacity;\n  -webkit-transform: none;\n  transform: none;\n}\n\n.carousel-fade .carousel-item.active,\n.carousel-fade .carousel-item-next.carousel-item-left,\n.carousel-fade .carousel-item-prev.carousel-item-right {\n  z-index: 1;\n  opacity: 1;\n}\n\n.carousel-fade .active.carousel-item-left,\n.carousel-fade .active.carousel-item-right {\n  z-index: 0;\n  opacity: 0;\n  transition: opacity 0s 0.6s;\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .carousel-fade .active.carousel-item-left,\n  .carousel-fade .active.carousel-item-right {\n    transition: none;\n  }\n}\n\n.carousel-control-prev,\n.carousel-control-next {\n  position: absolute;\n  top: 0;\n  bottom: 0;\n  z-index: 1;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-align: center;\n  align-items: center;\n  -ms-flex-pack: center;\n  justify-content: center;\n  width: 15%;\n  padding: 0;\n  color: #fff;\n  text-align: center;\n  background: none;\n  border: 0;\n  opacity: 0.5;\n  transition: opacity 0.15s ease;\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .carousel-control-prev,\n  .carousel-control-next {\n    transition: none;\n  }\n}\n\n.carousel-control-prev:hover, .carousel-control-prev:focus,\n.carousel-control-next:hover,\n.carousel-control-next:focus {\n  color: #fff;\n  text-decoration: none;\n  outline: 0;\n  opacity: 0.9;\n}\n\n.carousel-control-prev {\n  left: 0;\n}\n\n.carousel-control-next {\n  right: 0;\n}\n\n.carousel-control-prev-icon,\n.carousel-control-next-icon {\n  display: inline-block;\n  width: 20px;\n  height: 20px;\n  background: 50% / 100% 100% no-repeat;\n}\n\n.carousel-control-prev-icon {\n  background-image: url(" + ___CSS_LOADER_URL_REPLACEMENT_8___ + ");\n}\n\n.carousel-control-next-icon {\n  background-image: url(" + ___CSS_LOADER_URL_REPLACEMENT_9___ + ");\n}\n\n.carousel-indicators {\n  position: absolute;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  z-index: 15;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-pack: center;\n  justify-content: center;\n  padding-left: 0;\n  margin-right: 15%;\n  margin-left: 15%;\n  list-style: none;\n}\n\n.carousel-indicators li {\n  box-sizing: content-box;\n  -ms-flex: 0 1 auto;\n  flex: 0 1 auto;\n  width: 30px;\n  height: 3px;\n  margin-right: 3px;\n  margin-left: 3px;\n  text-indent: -999px;\n  cursor: pointer;\n  background-color: #fff;\n  background-clip: padding-box;\n  border-top: 10px solid transparent;\n  border-bottom: 10px solid transparent;\n  opacity: .5;\n  transition: opacity 0.6s ease;\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .carousel-indicators li {\n    transition: none;\n  }\n}\n\n.carousel-indicators .active {\n  opacity: 1;\n}\n\n.carousel-caption {\n  position: absolute;\n  right: 15%;\n  bottom: 20px;\n  left: 15%;\n  z-index: 10;\n  padding-top: 20px;\n  padding-bottom: 20px;\n  color: #fff;\n  text-align: center;\n}\n\n@-webkit-keyframes spinner-border {\n  to {\n    -webkit-transform: rotate(360deg);\n    transform: rotate(360deg);\n  }\n}\n\n@keyframes spinner-border {\n  to {\n    -webkit-transform: rotate(360deg);\n    transform: rotate(360deg);\n  }\n}\n\n.spinner-border {\n  display: inline-block;\n  width: 2rem;\n  height: 2rem;\n  vertical-align: -0.125em;\n  border: 0.25em solid currentcolor;\n  border-right-color: transparent;\n  border-radius: 50%;\n  -webkit-animation: .75s linear infinite spinner-border;\n  animation: .75s linear infinite spinner-border;\n}\n\n.spinner-border-sm {\n  width: 1rem;\n  height: 1rem;\n  border-width: 0.2em;\n}\n\n@-webkit-keyframes spinner-grow {\n  0% {\n    -webkit-transform: scale(0);\n    transform: scale(0);\n  }\n  50% {\n    opacity: 1;\n    -webkit-transform: none;\n    transform: none;\n  }\n}\n\n@keyframes spinner-grow {\n  0% {\n    -webkit-transform: scale(0);\n    transform: scale(0);\n  }\n  50% {\n    opacity: 1;\n    -webkit-transform: none;\n    transform: none;\n  }\n}\n\n.spinner-grow {\n  display: inline-block;\n  width: 2rem;\n  height: 2rem;\n  vertical-align: -0.125em;\n  background-color: currentcolor;\n  border-radius: 50%;\n  opacity: 0;\n  -webkit-animation: .75s linear infinite spinner-grow;\n  animation: .75s linear infinite spinner-grow;\n}\n\n.spinner-grow-sm {\n  width: 1rem;\n  height: 1rem;\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .spinner-border,\n  .spinner-grow {\n    -webkit-animation-duration: 1.5s;\n    animation-duration: 1.5s;\n  }\n}\n\n.align-baseline {\n  vertical-align: baseline !important;\n}\n\n.align-top {\n  vertical-align: top !important;\n}\n\n.align-middle {\n  vertical-align: middle !important;\n}\n\n.align-bottom {\n  vertical-align: bottom !important;\n}\n\n.align-text-bottom {\n  vertical-align: text-bottom !important;\n}\n\n.align-text-top {\n  vertical-align: text-top !important;\n}\n\n.bg-primary {\n  background-color: #007bff !important;\n}\n\na.bg-primary:hover, a.bg-primary:focus,\nbutton.bg-primary:hover,\nbutton.bg-primary:focus {\n  background-color: #0062cc !important;\n}\n\n.bg-secondary {\n  background-color: #6c757d !important;\n}\n\na.bg-secondary:hover, a.bg-secondary:focus,\nbutton.bg-secondary:hover,\nbutton.bg-secondary:focus {\n  background-color: #545b62 !important;\n}\n\n.bg-success {\n  background-color: #28a745 !important;\n}\n\na.bg-success:hover, a.bg-success:focus,\nbutton.bg-success:hover,\nbutton.bg-success:focus {\n  background-color: #1e7e34 !important;\n}\n\n.bg-info {\n  background-color: #17a2b8 !important;\n}\n\na.bg-info:hover, a.bg-info:focus,\nbutton.bg-info:hover,\nbutton.bg-info:focus {\n  background-color: #117a8b !important;\n}\n\n.bg-warning {\n  background-color: #ffc107 !important;\n}\n\na.bg-warning:hover, a.bg-warning:focus,\nbutton.bg-warning:hover,\nbutton.bg-warning:focus {\n  background-color: #d39e00 !important;\n}\n\n.bg-danger {\n  background-color: #dc3545 !important;\n}\n\na.bg-danger:hover, a.bg-danger:focus,\nbutton.bg-danger:hover,\nbutton.bg-danger:focus {\n  background-color: #bd2130 !important;\n}\n\n.bg-light {\n  background-color: #f8f9fa !important;\n}\n\na.bg-light:hover, a.bg-light:focus,\nbutton.bg-light:hover,\nbutton.bg-light:focus {\n  background-color: #dae0e5 !important;\n}\n\n.bg-dark {\n  background-color: #343a40 !important;\n}\n\na.bg-dark:hover, a.bg-dark:focus,\nbutton.bg-dark:hover,\nbutton.bg-dark:focus {\n  background-color: #1d2124 !important;\n}\n\n.bg-white {\n  background-color: #fff !important;\n}\n\n.bg-transparent {\n  background-color: transparent !important;\n}\n\n.border {\n  border: 1px solid #dee2e6 !important;\n}\n\n.border-top {\n  border-top: 1px solid #dee2e6 !important;\n}\n\n.border-right {\n  border-right: 1px solid #dee2e6 !important;\n}\n\n.border-bottom {\n  border-bottom: 1px solid #dee2e6 !important;\n}\n\n.border-left {\n  border-left: 1px solid #dee2e6 !important;\n}\n\n.border-0 {\n  border: 0 !important;\n}\n\n.border-top-0 {\n  border-top: 0 !important;\n}\n\n.border-right-0 {\n  border-right: 0 !important;\n}\n\n.border-bottom-0 {\n  border-bottom: 0 !important;\n}\n\n.border-left-0 {\n  border-left: 0 !important;\n}\n\n.border-primary {\n  border-color: #007bff !important;\n}\n\n.border-secondary {\n  border-color: #6c757d !important;\n}\n\n.border-success {\n  border-color: #28a745 !important;\n}\n\n.border-info {\n  border-color: #17a2b8 !important;\n}\n\n.border-warning {\n  border-color: #ffc107 !important;\n}\n\n.border-danger {\n  border-color: #dc3545 !important;\n}\n\n.border-light {\n  border-color: #f8f9fa !important;\n}\n\n.border-dark {\n  border-color: #343a40 !important;\n}\n\n.border-white {\n  border-color: #fff !important;\n}\n\n.rounded-sm {\n  border-radius: 0.2rem !important;\n}\n\n.rounded {\n  border-radius: 0.25rem !important;\n}\n\n.rounded-top {\n  border-top-left-radius: 0.25rem !important;\n  border-top-right-radius: 0.25rem !important;\n}\n\n.rounded-right {\n  border-top-right-radius: 0.25rem !important;\n  border-bottom-right-radius: 0.25rem !important;\n}\n\n.rounded-bottom {\n  border-bottom-right-radius: 0.25rem !important;\n  border-bottom-left-radius: 0.25rem !important;\n}\n\n.rounded-left {\n  border-top-left-radius: 0.25rem !important;\n  border-bottom-left-radius: 0.25rem !important;\n}\n\n.rounded-lg {\n  border-radius: 0.3rem !important;\n}\n\n.rounded-circle {\n  border-radius: 50% !important;\n}\n\n.rounded-pill {\n  border-radius: 50rem !important;\n}\n\n.rounded-0 {\n  border-radius: 0 !important;\n}\n\n.clearfix::after {\n  display: block;\n  clear: both;\n  content: \"\";\n}\n\n.d-none {\n  display: none !important;\n}\n\n.d-inline {\n  display: inline !important;\n}\n\n.d-inline-block {\n  display: inline-block !important;\n}\n\n.d-block {\n  display: block !important;\n}\n\n.d-table {\n  display: table !important;\n}\n\n.d-table-row {\n  display: table-row !important;\n}\n\n.d-table-cell {\n  display: table-cell !important;\n}\n\n.d-flex {\n  display: -ms-flexbox !important;\n  display: flex !important;\n}\n\n.d-inline-flex {\n  display: -ms-inline-flexbox !important;\n  display: inline-flex !important;\n}\n\n@media (min-width: 576px) {\n  .d-sm-none {\n    display: none !important;\n  }\n  .d-sm-inline {\n    display: inline !important;\n  }\n  .d-sm-inline-block {\n    display: inline-block !important;\n  }\n  .d-sm-block {\n    display: block !important;\n  }\n  .d-sm-table {\n    display: table !important;\n  }\n  .d-sm-table-row {\n    display: table-row !important;\n  }\n  .d-sm-table-cell {\n    display: table-cell !important;\n  }\n  .d-sm-flex {\n    display: -ms-flexbox !important;\n    display: flex !important;\n  }\n  .d-sm-inline-flex {\n    display: -ms-inline-flexbox !important;\n    display: inline-flex !important;\n  }\n}\n\n@media (min-width: 768px) {\n  .d-md-none {\n    display: none !important;\n  }\n  .d-md-inline {\n    display: inline !important;\n  }\n  .d-md-inline-block {\n    display: inline-block !important;\n  }\n  .d-md-block {\n    display: block !important;\n  }\n  .d-md-table {\n    display: table !important;\n  }\n  .d-md-table-row {\n    display: table-row !important;\n  }\n  .d-md-table-cell {\n    display: table-cell !important;\n  }\n  .d-md-flex {\n    display: -ms-flexbox !important;\n    display: flex !important;\n  }\n  .d-md-inline-flex {\n    display: -ms-inline-flexbox !important;\n    display: inline-flex !important;\n  }\n}\n\n@media (min-width: 992px) {\n  .d-lg-none {\n    display: none !important;\n  }\n  .d-lg-inline {\n    display: inline !important;\n  }\n  .d-lg-inline-block {\n    display: inline-block !important;\n  }\n  .d-lg-block {\n    display: block !important;\n  }\n  .d-lg-table {\n    display: table !important;\n  }\n  .d-lg-table-row {\n    display: table-row !important;\n  }\n  .d-lg-table-cell {\n    display: table-cell !important;\n  }\n  .d-lg-flex {\n    display: -ms-flexbox !important;\n    display: flex !important;\n  }\n  .d-lg-inline-flex {\n    display: -ms-inline-flexbox !important;\n    display: inline-flex !important;\n  }\n}\n\n@media (min-width: 1200px) {\n  .d-xl-none {\n    display: none !important;\n  }\n  .d-xl-inline {\n    display: inline !important;\n  }\n  .d-xl-inline-block {\n    display: inline-block !important;\n  }\n  .d-xl-block {\n    display: block !important;\n  }\n  .d-xl-table {\n    display: table !important;\n  }\n  .d-xl-table-row {\n    display: table-row !important;\n  }\n  .d-xl-table-cell {\n    display: table-cell !important;\n  }\n  .d-xl-flex {\n    display: -ms-flexbox !important;\n    display: flex !important;\n  }\n  .d-xl-inline-flex {\n    display: -ms-inline-flexbox !important;\n    display: inline-flex !important;\n  }\n}\n\n@media print {\n  .d-print-none {\n    display: none !important;\n  }\n  .d-print-inline {\n    display: inline !important;\n  }\n  .d-print-inline-block {\n    display: inline-block !important;\n  }\n  .d-print-block {\n    display: block !important;\n  }\n  .d-print-table {\n    display: table !important;\n  }\n  .d-print-table-row {\n    display: table-row !important;\n  }\n  .d-print-table-cell {\n    display: table-cell !important;\n  }\n  .d-print-flex {\n    display: -ms-flexbox !important;\n    display: flex !important;\n  }\n  .d-print-inline-flex {\n    display: -ms-inline-flexbox !important;\n    display: inline-flex !important;\n  }\n}\n\n.embed-responsive {\n  position: relative;\n  display: block;\n  width: 100%;\n  padding: 0;\n  overflow: hidden;\n}\n\n.embed-responsive::before {\n  display: block;\n  content: \"\";\n}\n\n.embed-responsive .embed-responsive-item,\n.embed-responsive iframe,\n.embed-responsive embed,\n.embed-responsive object,\n.embed-responsive video {\n  position: absolute;\n  top: 0;\n  bottom: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  border: 0;\n}\n\n.embed-responsive-21by9::before {\n  padding-top: 42.857143%;\n}\n\n.embed-responsive-16by9::before {\n  padding-top: 56.25%;\n}\n\n.embed-responsive-4by3::before {\n  padding-top: 75%;\n}\n\n.embed-responsive-1by1::before {\n  padding-top: 100%;\n}\n\n.flex-row {\n  -ms-flex-direction: row !important;\n  flex-direction: row !important;\n}\n\n.flex-column {\n  -ms-flex-direction: column !important;\n  flex-direction: column !important;\n}\n\n.flex-row-reverse {\n  -ms-flex-direction: row-reverse !important;\n  flex-direction: row-reverse !important;\n}\n\n.flex-column-reverse {\n  -ms-flex-direction: column-reverse !important;\n  flex-direction: column-reverse !important;\n}\n\n.flex-wrap {\n  -ms-flex-wrap: wrap !important;\n  flex-wrap: wrap !important;\n}\n\n.flex-nowrap {\n  -ms-flex-wrap: nowrap !important;\n  flex-wrap: nowrap !important;\n}\n\n.flex-wrap-reverse {\n  -ms-flex-wrap: wrap-reverse !important;\n  flex-wrap: wrap-reverse !important;\n}\n\n.flex-fill {\n  -ms-flex: 1 1 auto !important;\n  flex: 1 1 auto !important;\n}\n\n.flex-grow-0 {\n  -ms-flex-positive: 0 !important;\n  flex-grow: 0 !important;\n}\n\n.flex-grow-1 {\n  -ms-flex-positive: 1 !important;\n  flex-grow: 1 !important;\n}\n\n.flex-shrink-0 {\n  -ms-flex-negative: 0 !important;\n  flex-shrink: 0 !important;\n}\n\n.flex-shrink-1 {\n  -ms-flex-negative: 1 !important;\n  flex-shrink: 1 !important;\n}\n\n.justify-content-start {\n  -ms-flex-pack: start !important;\n  justify-content: flex-start !important;\n}\n\n.justify-content-end {\n  -ms-flex-pack: end !important;\n  justify-content: flex-end !important;\n}\n\n.justify-content-center {\n  -ms-flex-pack: center !important;\n  justify-content: center !important;\n}\n\n.justify-content-between {\n  -ms-flex-pack: justify !important;\n  justify-content: space-between !important;\n}\n\n.justify-content-around {\n  -ms-flex-pack: distribute !important;\n  justify-content: space-around !important;\n}\n\n.align-items-start {\n  -ms-flex-align: start !important;\n  align-items: flex-start !important;\n}\n\n.align-items-end {\n  -ms-flex-align: end !important;\n  align-items: flex-end !important;\n}\n\n.align-items-center {\n  -ms-flex-align: center !important;\n  align-items: center !important;\n}\n\n.align-items-baseline {\n  -ms-flex-align: baseline !important;\n  align-items: baseline !important;\n}\n\n.align-items-stretch {\n  -ms-flex-align: stretch !important;\n  align-items: stretch !important;\n}\n\n.align-content-start {\n  -ms-flex-line-pack: start !important;\n  align-content: flex-start !important;\n}\n\n.align-content-end {\n  -ms-flex-line-pack: end !important;\n  align-content: flex-end !important;\n}\n\n.align-content-center {\n  -ms-flex-line-pack: center !important;\n  align-content: center !important;\n}\n\n.align-content-between {\n  -ms-flex-line-pack: justify !important;\n  align-content: space-between !important;\n}\n\n.align-content-around {\n  -ms-flex-line-pack: distribute !important;\n  align-content: space-around !important;\n}\n\n.align-content-stretch {\n  -ms-flex-line-pack: stretch !important;\n  align-content: stretch !important;\n}\n\n.align-self-auto {\n  -ms-flex-item-align: auto !important;\n  align-self: auto !important;\n}\n\n.align-self-start {\n  -ms-flex-item-align: start !important;\n  align-self: flex-start !important;\n}\n\n.align-self-end {\n  -ms-flex-item-align: end !important;\n  align-self: flex-end !important;\n}\n\n.align-self-center {\n  -ms-flex-item-align: center !important;\n  align-self: center !important;\n}\n\n.align-self-baseline {\n  -ms-flex-item-align: baseline !important;\n  align-self: baseline !important;\n}\n\n.align-self-stretch {\n  -ms-flex-item-align: stretch !important;\n  align-self: stretch !important;\n}\n\n@media (min-width: 576px) {\n  .flex-sm-row {\n    -ms-flex-direction: row !important;\n    flex-direction: row !important;\n  }\n  .flex-sm-column {\n    -ms-flex-direction: column !important;\n    flex-direction: column !important;\n  }\n  .flex-sm-row-reverse {\n    -ms-flex-direction: row-reverse !important;\n    flex-direction: row-reverse !important;\n  }\n  .flex-sm-column-reverse {\n    -ms-flex-direction: column-reverse !important;\n    flex-direction: column-reverse !important;\n  }\n  .flex-sm-wrap {\n    -ms-flex-wrap: wrap !important;\n    flex-wrap: wrap !important;\n  }\n  .flex-sm-nowrap {\n    -ms-flex-wrap: nowrap !important;\n    flex-wrap: nowrap !important;\n  }\n  .flex-sm-wrap-reverse {\n    -ms-flex-wrap: wrap-reverse !important;\n    flex-wrap: wrap-reverse !important;\n  }\n  .flex-sm-fill {\n    -ms-flex: 1 1 auto !important;\n    flex: 1 1 auto !important;\n  }\n  .flex-sm-grow-0 {\n    -ms-flex-positive: 0 !important;\n    flex-grow: 0 !important;\n  }\n  .flex-sm-grow-1 {\n    -ms-flex-positive: 1 !important;\n    flex-grow: 1 !important;\n  }\n  .flex-sm-shrink-0 {\n    -ms-flex-negative: 0 !important;\n    flex-shrink: 0 !important;\n  }\n  .flex-sm-shrink-1 {\n    -ms-flex-negative: 1 !important;\n    flex-shrink: 1 !important;\n  }\n  .justify-content-sm-start {\n    -ms-flex-pack: start !important;\n    justify-content: flex-start !important;\n  }\n  .justify-content-sm-end {\n    -ms-flex-pack: end !important;\n    justify-content: flex-end !important;\n  }\n  .justify-content-sm-center {\n    -ms-flex-pack: center !important;\n    justify-content: center !important;\n  }\n  .justify-content-sm-between {\n    -ms-flex-pack: justify !important;\n    justify-content: space-between !important;\n  }\n  .justify-content-sm-around {\n    -ms-flex-pack: distribute !important;\n    justify-content: space-around !important;\n  }\n  .align-items-sm-start {\n    -ms-flex-align: start !important;\n    align-items: flex-start !important;\n  }\n  .align-items-sm-end {\n    -ms-flex-align: end !important;\n    align-items: flex-end !important;\n  }\n  .align-items-sm-center {\n    -ms-flex-align: center !important;\n    align-items: center !important;\n  }\n  .align-items-sm-baseline {\n    -ms-flex-align: baseline !important;\n    align-items: baseline !important;\n  }\n  .align-items-sm-stretch {\n    -ms-flex-align: stretch !important;\n    align-items: stretch !important;\n  }\n  .align-content-sm-start {\n    -ms-flex-line-pack: start !important;\n    align-content: flex-start !important;\n  }\n  .align-content-sm-end {\n    -ms-flex-line-pack: end !important;\n    align-content: flex-end !important;\n  }\n  .align-content-sm-center {\n    -ms-flex-line-pack: center !important;\n    align-content: center !important;\n  }\n  .align-content-sm-between {\n    -ms-flex-line-pack: justify !important;\n    align-content: space-between !important;\n  }\n  .align-content-sm-around {\n    -ms-flex-line-pack: distribute !important;\n    align-content: space-around !important;\n  }\n  .align-content-sm-stretch {\n    -ms-flex-line-pack: stretch !important;\n    align-content: stretch !important;\n  }\n  .align-self-sm-auto {\n    -ms-flex-item-align: auto !important;\n    align-self: auto !important;\n  }\n  .align-self-sm-start {\n    -ms-flex-item-align: start !important;\n    align-self: flex-start !important;\n  }\n  .align-self-sm-end {\n    -ms-flex-item-align: end !important;\n    align-self: flex-end !important;\n  }\n  .align-self-sm-center {\n    -ms-flex-item-align: center !important;\n    align-self: center !important;\n  }\n  .align-self-sm-baseline {\n    -ms-flex-item-align: baseline !important;\n    align-self: baseline !important;\n  }\n  .align-self-sm-stretch {\n    -ms-flex-item-align: stretch !important;\n    align-self: stretch !important;\n  }\n}\n\n@media (min-width: 768px) {\n  .flex-md-row {\n    -ms-flex-direction: row !important;\n    flex-direction: row !important;\n  }\n  .flex-md-column {\n    -ms-flex-direction: column !important;\n    flex-direction: column !important;\n  }\n  .flex-md-row-reverse {\n    -ms-flex-direction: row-reverse !important;\n    flex-direction: row-reverse !important;\n  }\n  .flex-md-column-reverse {\n    -ms-flex-direction: column-reverse !important;\n    flex-direction: column-reverse !important;\n  }\n  .flex-md-wrap {\n    -ms-flex-wrap: wrap !important;\n    flex-wrap: wrap !important;\n  }\n  .flex-md-nowrap {\n    -ms-flex-wrap: nowrap !important;\n    flex-wrap: nowrap !important;\n  }\n  .flex-md-wrap-reverse {\n    -ms-flex-wrap: wrap-reverse !important;\n    flex-wrap: wrap-reverse !important;\n  }\n  .flex-md-fill {\n    -ms-flex: 1 1 auto !important;\n    flex: 1 1 auto !important;\n  }\n  .flex-md-grow-0 {\n    -ms-flex-positive: 0 !important;\n    flex-grow: 0 !important;\n  }\n  .flex-md-grow-1 {\n    -ms-flex-positive: 1 !important;\n    flex-grow: 1 !important;\n  }\n  .flex-md-shrink-0 {\n    -ms-flex-negative: 0 !important;\n    flex-shrink: 0 !important;\n  }\n  .flex-md-shrink-1 {\n    -ms-flex-negative: 1 !important;\n    flex-shrink: 1 !important;\n  }\n  .justify-content-md-start {\n    -ms-flex-pack: start !important;\n    justify-content: flex-start !important;\n  }\n  .justify-content-md-end {\n    -ms-flex-pack: end !important;\n    justify-content: flex-end !important;\n  }\n  .justify-content-md-center {\n    -ms-flex-pack: center !important;\n    justify-content: center !important;\n  }\n  .justify-content-md-between {\n    -ms-flex-pack: justify !important;\n    justify-content: space-between !important;\n  }\n  .justify-content-md-around {\n    -ms-flex-pack: distribute !important;\n    justify-content: space-around !important;\n  }\n  .align-items-md-start {\n    -ms-flex-align: start !important;\n    align-items: flex-start !important;\n  }\n  .align-items-md-end {\n    -ms-flex-align: end !important;\n    align-items: flex-end !important;\n  }\n  .align-items-md-center {\n    -ms-flex-align: center !important;\n    align-items: center !important;\n  }\n  .align-items-md-baseline {\n    -ms-flex-align: baseline !important;\n    align-items: baseline !important;\n  }\n  .align-items-md-stretch {\n    -ms-flex-align: stretch !important;\n    align-items: stretch !important;\n  }\n  .align-content-md-start {\n    -ms-flex-line-pack: start !important;\n    align-content: flex-start !important;\n  }\n  .align-content-md-end {\n    -ms-flex-line-pack: end !important;\n    align-content: flex-end !important;\n  }\n  .align-content-md-center {\n    -ms-flex-line-pack: center !important;\n    align-content: center !important;\n  }\n  .align-content-md-between {\n    -ms-flex-line-pack: justify !important;\n    align-content: space-between !important;\n  }\n  .align-content-md-around {\n    -ms-flex-line-pack: distribute !important;\n    align-content: space-around !important;\n  }\n  .align-content-md-stretch {\n    -ms-flex-line-pack: stretch !important;\n    align-content: stretch !important;\n  }\n  .align-self-md-auto {\n    -ms-flex-item-align: auto !important;\n    align-self: auto !important;\n  }\n  .align-self-md-start {\n    -ms-flex-item-align: start !important;\n    align-self: flex-start !important;\n  }\n  .align-self-md-end {\n    -ms-flex-item-align: end !important;\n    align-self: flex-end !important;\n  }\n  .align-self-md-center {\n    -ms-flex-item-align: center !important;\n    align-self: center !important;\n  }\n  .align-self-md-baseline {\n    -ms-flex-item-align: baseline !important;\n    align-self: baseline !important;\n  }\n  .align-self-md-stretch {\n    -ms-flex-item-align: stretch !important;\n    align-self: stretch !important;\n  }\n}\n\n@media (min-width: 992px) {\n  .flex-lg-row {\n    -ms-flex-direction: row !important;\n    flex-direction: row !important;\n  }\n  .flex-lg-column {\n    -ms-flex-direction: column !important;\n    flex-direction: column !important;\n  }\n  .flex-lg-row-reverse {\n    -ms-flex-direction: row-reverse !important;\n    flex-direction: row-reverse !important;\n  }\n  .flex-lg-column-reverse {\n    -ms-flex-direction: column-reverse !important;\n    flex-direction: column-reverse !important;\n  }\n  .flex-lg-wrap {\n    -ms-flex-wrap: wrap !important;\n    flex-wrap: wrap !important;\n  }\n  .flex-lg-nowrap {\n    -ms-flex-wrap: nowrap !important;\n    flex-wrap: nowrap !important;\n  }\n  .flex-lg-wrap-reverse {\n    -ms-flex-wrap: wrap-reverse !important;\n    flex-wrap: wrap-reverse !important;\n  }\n  .flex-lg-fill {\n    -ms-flex: 1 1 auto !important;\n    flex: 1 1 auto !important;\n  }\n  .flex-lg-grow-0 {\n    -ms-flex-positive: 0 !important;\n    flex-grow: 0 !important;\n  }\n  .flex-lg-grow-1 {\n    -ms-flex-positive: 1 !important;\n    flex-grow: 1 !important;\n  }\n  .flex-lg-shrink-0 {\n    -ms-flex-negative: 0 !important;\n    flex-shrink: 0 !important;\n  }\n  .flex-lg-shrink-1 {\n    -ms-flex-negative: 1 !important;\n    flex-shrink: 1 !important;\n  }\n  .justify-content-lg-start {\n    -ms-flex-pack: start !important;\n    justify-content: flex-start !important;\n  }\n  .justify-content-lg-end {\n    -ms-flex-pack: end !important;\n    justify-content: flex-end !important;\n  }\n  .justify-content-lg-center {\n    -ms-flex-pack: center !important;\n    justify-content: center !important;\n  }\n  .justify-content-lg-between {\n    -ms-flex-pack: justify !important;\n    justify-content: space-between !important;\n  }\n  .justify-content-lg-around {\n    -ms-flex-pack: distribute !important;\n    justify-content: space-around !important;\n  }\n  .align-items-lg-start {\n    -ms-flex-align: start !important;\n    align-items: flex-start !important;\n  }\n  .align-items-lg-end {\n    -ms-flex-align: end !important;\n    align-items: flex-end !important;\n  }\n  .align-items-lg-center {\n    -ms-flex-align: center !important;\n    align-items: center !important;\n  }\n  .align-items-lg-baseline {\n    -ms-flex-align: baseline !important;\n    align-items: baseline !important;\n  }\n  .align-items-lg-stretch {\n    -ms-flex-align: stretch !important;\n    align-items: stretch !important;\n  }\n  .align-content-lg-start {\n    -ms-flex-line-pack: start !important;\n    align-content: flex-start !important;\n  }\n  .align-content-lg-end {\n    -ms-flex-line-pack: end !important;\n    align-content: flex-end !important;\n  }\n  .align-content-lg-center {\n    -ms-flex-line-pack: center !important;\n    align-content: center !important;\n  }\n  .align-content-lg-between {\n    -ms-flex-line-pack: justify !important;\n    align-content: space-between !important;\n  }\n  .align-content-lg-around {\n    -ms-flex-line-pack: distribute !important;\n    align-content: space-around !important;\n  }\n  .align-content-lg-stretch {\n    -ms-flex-line-pack: stretch !important;\n    align-content: stretch !important;\n  }\n  .align-self-lg-auto {\n    -ms-flex-item-align: auto !important;\n    align-self: auto !important;\n  }\n  .align-self-lg-start {\n    -ms-flex-item-align: start !important;\n    align-self: flex-start !important;\n  }\n  .align-self-lg-end {\n    -ms-flex-item-align: end !important;\n    align-self: flex-end !important;\n  }\n  .align-self-lg-center {\n    -ms-flex-item-align: center !important;\n    align-self: center !important;\n  }\n  .align-self-lg-baseline {\n    -ms-flex-item-align: baseline !important;\n    align-self: baseline !important;\n  }\n  .align-self-lg-stretch {\n    -ms-flex-item-align: stretch !important;\n    align-self: stretch !important;\n  }\n}\n\n@media (min-width: 1200px) {\n  .flex-xl-row {\n    -ms-flex-direction: row !important;\n    flex-direction: row !important;\n  }\n  .flex-xl-column {\n    -ms-flex-direction: column !important;\n    flex-direction: column !important;\n  }\n  .flex-xl-row-reverse {\n    -ms-flex-direction: row-reverse !important;\n    flex-direction: row-reverse !important;\n  }\n  .flex-xl-column-reverse {\n    -ms-flex-direction: column-reverse !important;\n    flex-direction: column-reverse !important;\n  }\n  .flex-xl-wrap {\n    -ms-flex-wrap: wrap !important;\n    flex-wrap: wrap !important;\n  }\n  .flex-xl-nowrap {\n    -ms-flex-wrap: nowrap !important;\n    flex-wrap: nowrap !important;\n  }\n  .flex-xl-wrap-reverse {\n    -ms-flex-wrap: wrap-reverse !important;\n    flex-wrap: wrap-reverse !important;\n  }\n  .flex-xl-fill {\n    -ms-flex: 1 1 auto !important;\n    flex: 1 1 auto !important;\n  }\n  .flex-xl-grow-0 {\n    -ms-flex-positive: 0 !important;\n    flex-grow: 0 !important;\n  }\n  .flex-xl-grow-1 {\n    -ms-flex-positive: 1 !important;\n    flex-grow: 1 !important;\n  }\n  .flex-xl-shrink-0 {\n    -ms-flex-negative: 0 !important;\n    flex-shrink: 0 !important;\n  }\n  .flex-xl-shrink-1 {\n    -ms-flex-negative: 1 !important;\n    flex-shrink: 1 !important;\n  }\n  .justify-content-xl-start {\n    -ms-flex-pack: start !important;\n    justify-content: flex-start !important;\n  }\n  .justify-content-xl-end {\n    -ms-flex-pack: end !important;\n    justify-content: flex-end !important;\n  }\n  .justify-content-xl-center {\n    -ms-flex-pack: center !important;\n    justify-content: center !important;\n  }\n  .justify-content-xl-between {\n    -ms-flex-pack: justify !important;\n    justify-content: space-between !important;\n  }\n  .justify-content-xl-around {\n    -ms-flex-pack: distribute !important;\n    justify-content: space-around !important;\n  }\n  .align-items-xl-start {\n    -ms-flex-align: start !important;\n    align-items: flex-start !important;\n  }\n  .align-items-xl-end {\n    -ms-flex-align: end !important;\n    align-items: flex-end !important;\n  }\n  .align-items-xl-center {\n    -ms-flex-align: center !important;\n    align-items: center !important;\n  }\n  .align-items-xl-baseline {\n    -ms-flex-align: baseline !important;\n    align-items: baseline !important;\n  }\n  .align-items-xl-stretch {\n    -ms-flex-align: stretch !important;\n    align-items: stretch !important;\n  }\n  .align-content-xl-start {\n    -ms-flex-line-pack: start !important;\n    align-content: flex-start !important;\n  }\n  .align-content-xl-end {\n    -ms-flex-line-pack: end !important;\n    align-content: flex-end !important;\n  }\n  .align-content-xl-center {\n    -ms-flex-line-pack: center !important;\n    align-content: center !important;\n  }\n  .align-content-xl-between {\n    -ms-flex-line-pack: justify !important;\n    align-content: space-between !important;\n  }\n  .align-content-xl-around {\n    -ms-flex-line-pack: distribute !important;\n    align-content: space-around !important;\n  }\n  .align-content-xl-stretch {\n    -ms-flex-line-pack: stretch !important;\n    align-content: stretch !important;\n  }\n  .align-self-xl-auto {\n    -ms-flex-item-align: auto !important;\n    align-self: auto !important;\n  }\n  .align-self-xl-start {\n    -ms-flex-item-align: start !important;\n    align-self: flex-start !important;\n  }\n  .align-self-xl-end {\n    -ms-flex-item-align: end !important;\n    align-self: flex-end !important;\n  }\n  .align-self-xl-center {\n    -ms-flex-item-align: center !important;\n    align-self: center !important;\n  }\n  .align-self-xl-baseline {\n    -ms-flex-item-align: baseline !important;\n    align-self: baseline !important;\n  }\n  .align-self-xl-stretch {\n    -ms-flex-item-align: stretch !important;\n    align-self: stretch !important;\n  }\n}\n\n.float-left {\n  float: left !important;\n}\n\n.float-right {\n  float: right !important;\n}\n\n.float-none {\n  float: none !important;\n}\n\n@media (min-width: 576px) {\n  .float-sm-left {\n    float: left !important;\n  }\n  .float-sm-right {\n    float: right !important;\n  }\n  .float-sm-none {\n    float: none !important;\n  }\n}\n\n@media (min-width: 768px) {\n  .float-md-left {\n    float: left !important;\n  }\n  .float-md-right {\n    float: right !important;\n  }\n  .float-md-none {\n    float: none !important;\n  }\n}\n\n@media (min-width: 992px) {\n  .float-lg-left {\n    float: left !important;\n  }\n  .float-lg-right {\n    float: right !important;\n  }\n  .float-lg-none {\n    float: none !important;\n  }\n}\n\n@media (min-width: 1200px) {\n  .float-xl-left {\n    float: left !important;\n  }\n  .float-xl-right {\n    float: right !important;\n  }\n  .float-xl-none {\n    float: none !important;\n  }\n}\n\n.user-select-all {\n  -webkit-user-select: all !important;\n  -moz-user-select: all !important;\n  user-select: all !important;\n}\n\n.user-select-auto {\n  -webkit-user-select: auto !important;\n  -moz-user-select: auto !important;\n  -ms-user-select: auto !important;\n  user-select: auto !important;\n}\n\n.user-select-none {\n  -webkit-user-select: none !important;\n  -moz-user-select: none !important;\n  -ms-user-select: none !important;\n  user-select: none !important;\n}\n\n.overflow-auto {\n  overflow: auto !important;\n}\n\n.overflow-hidden {\n  overflow: hidden !important;\n}\n\n.position-static {\n  position: static !important;\n}\n\n.position-relative {\n  position: relative !important;\n}\n\n.position-absolute {\n  position: absolute !important;\n}\n\n.position-fixed {\n  position: fixed !important;\n}\n\n.position-sticky {\n  position: -webkit-sticky !important;\n  position: sticky !important;\n}\n\n.fixed-top {\n  position: fixed;\n  top: 0;\n  right: 0;\n  left: 0;\n  z-index: 1030;\n}\n\n.fixed-bottom {\n  position: fixed;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  z-index: 1030;\n}\n\n@supports ((position: -webkit-sticky) or (position: sticky)) {\n  .sticky-top {\n    position: -webkit-sticky;\n    position: sticky;\n    top: 0;\n    z-index: 1020;\n  }\n}\n\n.sr-only {\n  position: absolute;\n  width: 1px;\n  height: 1px;\n  padding: 0;\n  margin: -1px;\n  overflow: hidden;\n  clip: rect(0, 0, 0, 0);\n  white-space: nowrap;\n  border: 0;\n}\n\n.sr-only-focusable:active, .sr-only-focusable:focus {\n  position: static;\n  width: auto;\n  height: auto;\n  overflow: visible;\n  clip: auto;\n  white-space: normal;\n}\n\n.shadow-sm {\n  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important;\n}\n\n.shadow {\n  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;\n}\n\n.shadow-lg {\n  box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.175) !important;\n}\n\n.shadow-none {\n  box-shadow: none !important;\n}\n\n.w-25 {\n  width: 25% !important;\n}\n\n.w-50 {\n  width: 50% !important;\n}\n\n.w-75 {\n  width: 75% !important;\n}\n\n.w-100 {\n  width: 100% !important;\n}\n\n.w-auto {\n  width: auto !important;\n}\n\n.h-25 {\n  height: 25% !important;\n}\n\n.h-50 {\n  height: 50% !important;\n}\n\n.h-75 {\n  height: 75% !important;\n}\n\n.h-100 {\n  height: 100% !important;\n}\n\n.h-auto {\n  height: auto !important;\n}\n\n.mw-100 {\n  max-width: 100% !important;\n}\n\n.mh-100 {\n  max-height: 100% !important;\n}\n\n.min-vw-100 {\n  min-width: 100vw !important;\n}\n\n.min-vh-100 {\n  min-height: 100vh !important;\n}\n\n.vw-100 {\n  width: 100vw !important;\n}\n\n.vh-100 {\n  height: 100vh !important;\n}\n\n.m-0 {\n  margin: 0 !important;\n}\n\n.mt-0,\n.my-0 {\n  margin-top: 0 !important;\n}\n\n.mr-0,\n.mx-0 {\n  margin-right: 0 !important;\n}\n\n.mb-0,\n.my-0 {\n  margin-bottom: 0 !important;\n}\n\n.ml-0,\n.mx-0 {\n  margin-left: 0 !important;\n}\n\n.m-1 {\n  margin: 0.25rem !important;\n}\n\n.mt-1,\n.my-1 {\n  margin-top: 0.25rem !important;\n}\n\n.mr-1,\n.mx-1 {\n  margin-right: 0.25rem !important;\n}\n\n.mb-1,\n.my-1 {\n  margin-bottom: 0.25rem !important;\n}\n\n.ml-1,\n.mx-1 {\n  margin-left: 0.25rem !important;\n}\n\n.m-2 {\n  margin: 0.5rem !important;\n}\n\n.mt-2,\n.my-2 {\n  margin-top: 0.5rem !important;\n}\n\n.mr-2,\n.mx-2 {\n  margin-right: 0.5rem !important;\n}\n\n.mb-2,\n.my-2 {\n  margin-bottom: 0.5rem !important;\n}\n\n.ml-2,\n.mx-2 {\n  margin-left: 0.5rem !important;\n}\n\n.m-3 {\n  margin: 1rem !important;\n}\n\n.mt-3,\n.my-3 {\n  margin-top: 1rem !important;\n}\n\n.mr-3,\n.mx-3 {\n  margin-right: 1rem !important;\n}\n\n.mb-3,\n.my-3 {\n  margin-bottom: 1rem !important;\n}\n\n.ml-3,\n.mx-3 {\n  margin-left: 1rem !important;\n}\n\n.m-4 {\n  margin: 1.5rem !important;\n}\n\n.mt-4,\n.my-4 {\n  margin-top: 1.5rem !important;\n}\n\n.mr-4,\n.mx-4 {\n  margin-right: 1.5rem !important;\n}\n\n.mb-4,\n.my-4 {\n  margin-bottom: 1.5rem !important;\n}\n\n.ml-4,\n.mx-4 {\n  margin-left: 1.5rem !important;\n}\n\n.m-5 {\n  margin: 3rem !important;\n}\n\n.mt-5,\n.my-5 {\n  margin-top: 3rem !important;\n}\n\n.mr-5,\n.mx-5 {\n  margin-right: 3rem !important;\n}\n\n.mb-5,\n.my-5 {\n  margin-bottom: 3rem !important;\n}\n\n.ml-5,\n.mx-5 {\n  margin-left: 3rem !important;\n}\n\n.p-0 {\n  padding: 0 !important;\n}\n\n.pt-0,\n.py-0 {\n  padding-top: 0 !important;\n}\n\n.pr-0,\n.px-0 {\n  padding-right: 0 !important;\n}\n\n.pb-0,\n.py-0 {\n  padding-bottom: 0 !important;\n}\n\n.pl-0,\n.px-0 {\n  padding-left: 0 !important;\n}\n\n.p-1 {\n  padding: 0.25rem !important;\n}\n\n.pt-1,\n.py-1 {\n  padding-top: 0.25rem !important;\n}\n\n.pr-1,\n.px-1 {\n  padding-right: 0.25rem !important;\n}\n\n.pb-1,\n.py-1 {\n  padding-bottom: 0.25rem !important;\n}\n\n.pl-1,\n.px-1 {\n  padding-left: 0.25rem !important;\n}\n\n.p-2 {\n  padding: 0.5rem !important;\n}\n\n.pt-2,\n.py-2 {\n  padding-top: 0.5rem !important;\n}\n\n.pr-2,\n.px-2 {\n  padding-right: 0.5rem !important;\n}\n\n.pb-2,\n.py-2 {\n  padding-bottom: 0.5rem !important;\n}\n\n.pl-2,\n.px-2 {\n  padding-left: 0.5rem !important;\n}\n\n.p-3 {\n  padding: 1rem !important;\n}\n\n.pt-3,\n.py-3 {\n  padding-top: 1rem !important;\n}\n\n.pr-3,\n.px-3 {\n  padding-right: 1rem !important;\n}\n\n.pb-3,\n.py-3 {\n  padding-bottom: 1rem !important;\n}\n\n.pl-3,\n.px-3 {\n  padding-left: 1rem !important;\n}\n\n.p-4 {\n  padding: 1.5rem !important;\n}\n\n.pt-4,\n.py-4 {\n  padding-top: 1.5rem !important;\n}\n\n.pr-4,\n.px-4 {\n  padding-right: 1.5rem !important;\n}\n\n.pb-4,\n.py-4 {\n  padding-bottom: 1.5rem !important;\n}\n\n.pl-4,\n.px-4 {\n  padding-left: 1.5rem !important;\n}\n\n.p-5 {\n  padding: 3rem !important;\n}\n\n.pt-5,\n.py-5 {\n  padding-top: 3rem !important;\n}\n\n.pr-5,\n.px-5 {\n  padding-right: 3rem !important;\n}\n\n.pb-5,\n.py-5 {\n  padding-bottom: 3rem !important;\n}\n\n.pl-5,\n.px-5 {\n  padding-left: 3rem !important;\n}\n\n.m-n1 {\n  margin: -0.25rem !important;\n}\n\n.mt-n1,\n.my-n1 {\n  margin-top: -0.25rem !important;\n}\n\n.mr-n1,\n.mx-n1 {\n  margin-right: -0.25rem !important;\n}\n\n.mb-n1,\n.my-n1 {\n  margin-bottom: -0.25rem !important;\n}\n\n.ml-n1,\n.mx-n1 {\n  margin-left: -0.25rem !important;\n}\n\n.m-n2 {\n  margin: -0.5rem !important;\n}\n\n.mt-n2,\n.my-n2 {\n  margin-top: -0.5rem !important;\n}\n\n.mr-n2,\n.mx-n2 {\n  margin-right: -0.5rem !important;\n}\n\n.mb-n2,\n.my-n2 {\n  margin-bottom: -0.5rem !important;\n}\n\n.ml-n2,\n.mx-n2 {\n  margin-left: -0.5rem !important;\n}\n\n.m-n3 {\n  margin: -1rem !important;\n}\n\n.mt-n3,\n.my-n3 {\n  margin-top: -1rem !important;\n}\n\n.mr-n3,\n.mx-n3 {\n  margin-right: -1rem !important;\n}\n\n.mb-n3,\n.my-n3 {\n  margin-bottom: -1rem !important;\n}\n\n.ml-n3,\n.mx-n3 {\n  margin-left: -1rem !important;\n}\n\n.m-n4 {\n  margin: -1.5rem !important;\n}\n\n.mt-n4,\n.my-n4 {\n  margin-top: -1.5rem !important;\n}\n\n.mr-n4,\n.mx-n4 {\n  margin-right: -1.5rem !important;\n}\n\n.mb-n4,\n.my-n4 {\n  margin-bottom: -1.5rem !important;\n}\n\n.ml-n4,\n.mx-n4 {\n  margin-left: -1.5rem !important;\n}\n\n.m-n5 {\n  margin: -3rem !important;\n}\n\n.mt-n5,\n.my-n5 {\n  margin-top: -3rem !important;\n}\n\n.mr-n5,\n.mx-n5 {\n  margin-right: -3rem !important;\n}\n\n.mb-n5,\n.my-n5 {\n  margin-bottom: -3rem !important;\n}\n\n.ml-n5,\n.mx-n5 {\n  margin-left: -3rem !important;\n}\n\n.m-auto {\n  margin: auto !important;\n}\n\n.mt-auto,\n.my-auto {\n  margin-top: auto !important;\n}\n\n.mr-auto,\n.mx-auto {\n  margin-right: auto !important;\n}\n\n.mb-auto,\n.my-auto {\n  margin-bottom: auto !important;\n}\n\n.ml-auto,\n.mx-auto {\n  margin-left: auto !important;\n}\n\n@media (min-width: 576px) {\n  .m-sm-0 {\n    margin: 0 !important;\n  }\n  .mt-sm-0,\n  .my-sm-0 {\n    margin-top: 0 !important;\n  }\n  .mr-sm-0,\n  .mx-sm-0 {\n    margin-right: 0 !important;\n  }\n  .mb-sm-0,\n  .my-sm-0 {\n    margin-bottom: 0 !important;\n  }\n  .ml-sm-0,\n  .mx-sm-0 {\n    margin-left: 0 !important;\n  }\n  .m-sm-1 {\n    margin: 0.25rem !important;\n  }\n  .mt-sm-1,\n  .my-sm-1 {\n    margin-top: 0.25rem !important;\n  }\n  .mr-sm-1,\n  .mx-sm-1 {\n    margin-right: 0.25rem !important;\n  }\n  .mb-sm-1,\n  .my-sm-1 {\n    margin-bottom: 0.25rem !important;\n  }\n  .ml-sm-1,\n  .mx-sm-1 {\n    margin-left: 0.25rem !important;\n  }\n  .m-sm-2 {\n    margin: 0.5rem !important;\n  }\n  .mt-sm-2,\n  .my-sm-2 {\n    margin-top: 0.5rem !important;\n  }\n  .mr-sm-2,\n  .mx-sm-2 {\n    margin-right: 0.5rem !important;\n  }\n  .mb-sm-2,\n  .my-sm-2 {\n    margin-bottom: 0.5rem !important;\n  }\n  .ml-sm-2,\n  .mx-sm-2 {\n    margin-left: 0.5rem !important;\n  }\n  .m-sm-3 {\n    margin: 1rem !important;\n  }\n  .mt-sm-3,\n  .my-sm-3 {\n    margin-top: 1rem !important;\n  }\n  .mr-sm-3,\n  .mx-sm-3 {\n    margin-right: 1rem !important;\n  }\n  .mb-sm-3,\n  .my-sm-3 {\n    margin-bottom: 1rem !important;\n  }\n  .ml-sm-3,\n  .mx-sm-3 {\n    margin-left: 1rem !important;\n  }\n  .m-sm-4 {\n    margin: 1.5rem !important;\n  }\n  .mt-sm-4,\n  .my-sm-4 {\n    margin-top: 1.5rem !important;\n  }\n  .mr-sm-4,\n  .mx-sm-4 {\n    margin-right: 1.5rem !important;\n  }\n  .mb-sm-4,\n  .my-sm-4 {\n    margin-bottom: 1.5rem !important;\n  }\n  .ml-sm-4,\n  .mx-sm-4 {\n    margin-left: 1.5rem !important;\n  }\n  .m-sm-5 {\n    margin: 3rem !important;\n  }\n  .mt-sm-5,\n  .my-sm-5 {\n    margin-top: 3rem !important;\n  }\n  .mr-sm-5,\n  .mx-sm-5 {\n    margin-right: 3rem !important;\n  }\n  .mb-sm-5,\n  .my-sm-5 {\n    margin-bottom: 3rem !important;\n  }\n  .ml-sm-5,\n  .mx-sm-5 {\n    margin-left: 3rem !important;\n  }\n  .p-sm-0 {\n    padding: 0 !important;\n  }\n  .pt-sm-0,\n  .py-sm-0 {\n    padding-top: 0 !important;\n  }\n  .pr-sm-0,\n  .px-sm-0 {\n    padding-right: 0 !important;\n  }\n  .pb-sm-0,\n  .py-sm-0 {\n    padding-bottom: 0 !important;\n  }\n  .pl-sm-0,\n  .px-sm-0 {\n    padding-left: 0 !important;\n  }\n  .p-sm-1 {\n    padding: 0.25rem !important;\n  }\n  .pt-sm-1,\n  .py-sm-1 {\n    padding-top: 0.25rem !important;\n  }\n  .pr-sm-1,\n  .px-sm-1 {\n    padding-right: 0.25rem !important;\n  }\n  .pb-sm-1,\n  .py-sm-1 {\n    padding-bottom: 0.25rem !important;\n  }\n  .pl-sm-1,\n  .px-sm-1 {\n    padding-left: 0.25rem !important;\n  }\n  .p-sm-2 {\n    padding: 0.5rem !important;\n  }\n  .pt-sm-2,\n  .py-sm-2 {\n    padding-top: 0.5rem !important;\n  }\n  .pr-sm-2,\n  .px-sm-2 {\n    padding-right: 0.5rem !important;\n  }\n  .pb-sm-2,\n  .py-sm-2 {\n    padding-bottom: 0.5rem !important;\n  }\n  .pl-sm-2,\n  .px-sm-2 {\n    padding-left: 0.5rem !important;\n  }\n  .p-sm-3 {\n    padding: 1rem !important;\n  }\n  .pt-sm-3,\n  .py-sm-3 {\n    padding-top: 1rem !important;\n  }\n  .pr-sm-3,\n  .px-sm-3 {\n    padding-right: 1rem !important;\n  }\n  .pb-sm-3,\n  .py-sm-3 {\n    padding-bottom: 1rem !important;\n  }\n  .pl-sm-3,\n  .px-sm-3 {\n    padding-left: 1rem !important;\n  }\n  .p-sm-4 {\n    padding: 1.5rem !important;\n  }\n  .pt-sm-4,\n  .py-sm-4 {\n    padding-top: 1.5rem !important;\n  }\n  .pr-sm-4,\n  .px-sm-4 {\n    padding-right: 1.5rem !important;\n  }\n  .pb-sm-4,\n  .py-sm-4 {\n    padding-bottom: 1.5rem !important;\n  }\n  .pl-sm-4,\n  .px-sm-4 {\n    padding-left: 1.5rem !important;\n  }\n  .p-sm-5 {\n    padding: 3rem !important;\n  }\n  .pt-sm-5,\n  .py-sm-5 {\n    padding-top: 3rem !important;\n  }\n  .pr-sm-5,\n  .px-sm-5 {\n    padding-right: 3rem !important;\n  }\n  .pb-sm-5,\n  .py-sm-5 {\n    padding-bottom: 3rem !important;\n  }\n  .pl-sm-5,\n  .px-sm-5 {\n    padding-left: 3rem !important;\n  }\n  .m-sm-n1 {\n    margin: -0.25rem !important;\n  }\n  .mt-sm-n1,\n  .my-sm-n1 {\n    margin-top: -0.25rem !important;\n  }\n  .mr-sm-n1,\n  .mx-sm-n1 {\n    margin-right: -0.25rem !important;\n  }\n  .mb-sm-n1,\n  .my-sm-n1 {\n    margin-bottom: -0.25rem !important;\n  }\n  .ml-sm-n1,\n  .mx-sm-n1 {\n    margin-left: -0.25rem !important;\n  }\n  .m-sm-n2 {\n    margin: -0.5rem !important;\n  }\n  .mt-sm-n2,\n  .my-sm-n2 {\n    margin-top: -0.5rem !important;\n  }\n  .mr-sm-n2,\n  .mx-sm-n2 {\n    margin-right: -0.5rem !important;\n  }\n  .mb-sm-n2,\n  .my-sm-n2 {\n    margin-bottom: -0.5rem !important;\n  }\n  .ml-sm-n2,\n  .mx-sm-n2 {\n    margin-left: -0.5rem !important;\n  }\n  .m-sm-n3 {\n    margin: -1rem !important;\n  }\n  .mt-sm-n3,\n  .my-sm-n3 {\n    margin-top: -1rem !important;\n  }\n  .mr-sm-n3,\n  .mx-sm-n3 {\n    margin-right: -1rem !important;\n  }\n  .mb-sm-n3,\n  .my-sm-n3 {\n    margin-bottom: -1rem !important;\n  }\n  .ml-sm-n3,\n  .mx-sm-n3 {\n    margin-left: -1rem !important;\n  }\n  .m-sm-n4 {\n    margin: -1.5rem !important;\n  }\n  .mt-sm-n4,\n  .my-sm-n4 {\n    margin-top: -1.5rem !important;\n  }\n  .mr-sm-n4,\n  .mx-sm-n4 {\n    margin-right: -1.5rem !important;\n  }\n  .mb-sm-n4,\n  .my-sm-n4 {\n    margin-bottom: -1.5rem !important;\n  }\n  .ml-sm-n4,\n  .mx-sm-n4 {\n    margin-left: -1.5rem !important;\n  }\n  .m-sm-n5 {\n    margin: -3rem !important;\n  }\n  .mt-sm-n5,\n  .my-sm-n5 {\n    margin-top: -3rem !important;\n  }\n  .mr-sm-n5,\n  .mx-sm-n5 {\n    margin-right: -3rem !important;\n  }\n  .mb-sm-n5,\n  .my-sm-n5 {\n    margin-bottom: -3rem !important;\n  }\n  .ml-sm-n5,\n  .mx-sm-n5 {\n    margin-left: -3rem !important;\n  }\n  .m-sm-auto {\n    margin: auto !important;\n  }\n  .mt-sm-auto,\n  .my-sm-auto {\n    margin-top: auto !important;\n  }\n  .mr-sm-auto,\n  .mx-sm-auto {\n    margin-right: auto !important;\n  }\n  .mb-sm-auto,\n  .my-sm-auto {\n    margin-bottom: auto !important;\n  }\n  .ml-sm-auto,\n  .mx-sm-auto {\n    margin-left: auto !important;\n  }\n}\n\n@media (min-width: 768px) {\n  .m-md-0 {\n    margin: 0 !important;\n  }\n  .mt-md-0,\n  .my-md-0 {\n    margin-top: 0 !important;\n  }\n  .mr-md-0,\n  .mx-md-0 {\n    margin-right: 0 !important;\n  }\n  .mb-md-0,\n  .my-md-0 {\n    margin-bottom: 0 !important;\n  }\n  .ml-md-0,\n  .mx-md-0 {\n    margin-left: 0 !important;\n  }\n  .m-md-1 {\n    margin: 0.25rem !important;\n  }\n  .mt-md-1,\n  .my-md-1 {\n    margin-top: 0.25rem !important;\n  }\n  .mr-md-1,\n  .mx-md-1 {\n    margin-right: 0.25rem !important;\n  }\n  .mb-md-1,\n  .my-md-1 {\n    margin-bottom: 0.25rem !important;\n  }\n  .ml-md-1,\n  .mx-md-1 {\n    margin-left: 0.25rem !important;\n  }\n  .m-md-2 {\n    margin: 0.5rem !important;\n  }\n  .mt-md-2,\n  .my-md-2 {\n    margin-top: 0.5rem !important;\n  }\n  .mr-md-2,\n  .mx-md-2 {\n    margin-right: 0.5rem !important;\n  }\n  .mb-md-2,\n  .my-md-2 {\n    margin-bottom: 0.5rem !important;\n  }\n  .ml-md-2,\n  .mx-md-2 {\n    margin-left: 0.5rem !important;\n  }\n  .m-md-3 {\n    margin: 1rem !important;\n  }\n  .mt-md-3,\n  .my-md-3 {\n    margin-top: 1rem !important;\n  }\n  .mr-md-3,\n  .mx-md-3 {\n    margin-right: 1rem !important;\n  }\n  .mb-md-3,\n  .my-md-3 {\n    margin-bottom: 1rem !important;\n  }\n  .ml-md-3,\n  .mx-md-3 {\n    margin-left: 1rem !important;\n  }\n  .m-md-4 {\n    margin: 1.5rem !important;\n  }\n  .mt-md-4,\n  .my-md-4 {\n    margin-top: 1.5rem !important;\n  }\n  .mr-md-4,\n  .mx-md-4 {\n    margin-right: 1.5rem !important;\n  }\n  .mb-md-4,\n  .my-md-4 {\n    margin-bottom: 1.5rem !important;\n  }\n  .ml-md-4,\n  .mx-md-4 {\n    margin-left: 1.5rem !important;\n  }\n  .m-md-5 {\n    margin: 3rem !important;\n  }\n  .mt-md-5,\n  .my-md-5 {\n    margin-top: 3rem !important;\n  }\n  .mr-md-5,\n  .mx-md-5 {\n    margin-right: 3rem !important;\n  }\n  .mb-md-5,\n  .my-md-5 {\n    margin-bottom: 3rem !important;\n  }\n  .ml-md-5,\n  .mx-md-5 {\n    margin-left: 3rem !important;\n  }\n  .p-md-0 {\n    padding: 0 !important;\n  }\n  .pt-md-0,\n  .py-md-0 {\n    padding-top: 0 !important;\n  }\n  .pr-md-0,\n  .px-md-0 {\n    padding-right: 0 !important;\n  }\n  .pb-md-0,\n  .py-md-0 {\n    padding-bottom: 0 !important;\n  }\n  .pl-md-0,\n  .px-md-0 {\n    padding-left: 0 !important;\n  }\n  .p-md-1 {\n    padding: 0.25rem !important;\n  }\n  .pt-md-1,\n  .py-md-1 {\n    padding-top: 0.25rem !important;\n  }\n  .pr-md-1,\n  .px-md-1 {\n    padding-right: 0.25rem !important;\n  }\n  .pb-md-1,\n  .py-md-1 {\n    padding-bottom: 0.25rem !important;\n  }\n  .pl-md-1,\n  .px-md-1 {\n    padding-left: 0.25rem !important;\n  }\n  .p-md-2 {\n    padding: 0.5rem !important;\n  }\n  .pt-md-2,\n  .py-md-2 {\n    padding-top: 0.5rem !important;\n  }\n  .pr-md-2,\n  .px-md-2 {\n    padding-right: 0.5rem !important;\n  }\n  .pb-md-2,\n  .py-md-2 {\n    padding-bottom: 0.5rem !important;\n  }\n  .pl-md-2,\n  .px-md-2 {\n    padding-left: 0.5rem !important;\n  }\n  .p-md-3 {\n    padding: 1rem !important;\n  }\n  .pt-md-3,\n  .py-md-3 {\n    padding-top: 1rem !important;\n  }\n  .pr-md-3,\n  .px-md-3 {\n    padding-right: 1rem !important;\n  }\n  .pb-md-3,\n  .py-md-3 {\n    padding-bottom: 1rem !important;\n  }\n  .pl-md-3,\n  .px-md-3 {\n    padding-left: 1rem !important;\n  }\n  .p-md-4 {\n    padding: 1.5rem !important;\n  }\n  .pt-md-4,\n  .py-md-4 {\n    padding-top: 1.5rem !important;\n  }\n  .pr-md-4,\n  .px-md-4 {\n    padding-right: 1.5rem !important;\n  }\n  .pb-md-4,\n  .py-md-4 {\n    padding-bottom: 1.5rem !important;\n  }\n  .pl-md-4,\n  .px-md-4 {\n    padding-left: 1.5rem !important;\n  }\n  .p-md-5 {\n    padding: 3rem !important;\n  }\n  .pt-md-5,\n  .py-md-5 {\n    padding-top: 3rem !important;\n  }\n  .pr-md-5,\n  .px-md-5 {\n    padding-right: 3rem !important;\n  }\n  .pb-md-5,\n  .py-md-5 {\n    padding-bottom: 3rem !important;\n  }\n  .pl-md-5,\n  .px-md-5 {\n    padding-left: 3rem !important;\n  }\n  .m-md-n1 {\n    margin: -0.25rem !important;\n  }\n  .mt-md-n1,\n  .my-md-n1 {\n    margin-top: -0.25rem !important;\n  }\n  .mr-md-n1,\n  .mx-md-n1 {\n    margin-right: -0.25rem !important;\n  }\n  .mb-md-n1,\n  .my-md-n1 {\n    margin-bottom: -0.25rem !important;\n  }\n  .ml-md-n1,\n  .mx-md-n1 {\n    margin-left: -0.25rem !important;\n  }\n  .m-md-n2 {\n    margin: -0.5rem !important;\n  }\n  .mt-md-n2,\n  .my-md-n2 {\n    margin-top: -0.5rem !important;\n  }\n  .mr-md-n2,\n  .mx-md-n2 {\n    margin-right: -0.5rem !important;\n  }\n  .mb-md-n2,\n  .my-md-n2 {\n    margin-bottom: -0.5rem !important;\n  }\n  .ml-md-n2,\n  .mx-md-n2 {\n    margin-left: -0.5rem !important;\n  }\n  .m-md-n3 {\n    margin: -1rem !important;\n  }\n  .mt-md-n3,\n  .my-md-n3 {\n    margin-top: -1rem !important;\n  }\n  .mr-md-n3,\n  .mx-md-n3 {\n    margin-right: -1rem !important;\n  }\n  .mb-md-n3,\n  .my-md-n3 {\n    margin-bottom: -1rem !important;\n  }\n  .ml-md-n3,\n  .mx-md-n3 {\n    margin-left: -1rem !important;\n  }\n  .m-md-n4 {\n    margin: -1.5rem !important;\n  }\n  .mt-md-n4,\n  .my-md-n4 {\n    margin-top: -1.5rem !important;\n  }\n  .mr-md-n4,\n  .mx-md-n4 {\n    margin-right: -1.5rem !important;\n  }\n  .mb-md-n4,\n  .my-md-n4 {\n    margin-bottom: -1.5rem !important;\n  }\n  .ml-md-n4,\n  .mx-md-n4 {\n    margin-left: -1.5rem !important;\n  }\n  .m-md-n5 {\n    margin: -3rem !important;\n  }\n  .mt-md-n5,\n  .my-md-n5 {\n    margin-top: -3rem !important;\n  }\n  .mr-md-n5,\n  .mx-md-n5 {\n    margin-right: -3rem !important;\n  }\n  .mb-md-n5,\n  .my-md-n5 {\n    margin-bottom: -3rem !important;\n  }\n  .ml-md-n5,\n  .mx-md-n5 {\n    margin-left: -3rem !important;\n  }\n  .m-md-auto {\n    margin: auto !important;\n  }\n  .mt-md-auto,\n  .my-md-auto {\n    margin-top: auto !important;\n  }\n  .mr-md-auto,\n  .mx-md-auto {\n    margin-right: auto !important;\n  }\n  .mb-md-auto,\n  .my-md-auto {\n    margin-bottom: auto !important;\n  }\n  .ml-md-auto,\n  .mx-md-auto {\n    margin-left: auto !important;\n  }\n}\n\n@media (min-width: 992px) {\n  .m-lg-0 {\n    margin: 0 !important;\n  }\n  .mt-lg-0,\n  .my-lg-0 {\n    margin-top: 0 !important;\n  }\n  .mr-lg-0,\n  .mx-lg-0 {\n    margin-right: 0 !important;\n  }\n  .mb-lg-0,\n  .my-lg-0 {\n    margin-bottom: 0 !important;\n  }\n  .ml-lg-0,\n  .mx-lg-0 {\n    margin-left: 0 !important;\n  }\n  .m-lg-1 {\n    margin: 0.25rem !important;\n  }\n  .mt-lg-1,\n  .my-lg-1 {\n    margin-top: 0.25rem !important;\n  }\n  .mr-lg-1,\n  .mx-lg-1 {\n    margin-right: 0.25rem !important;\n  }\n  .mb-lg-1,\n  .my-lg-1 {\n    margin-bottom: 0.25rem !important;\n  }\n  .ml-lg-1,\n  .mx-lg-1 {\n    margin-left: 0.25rem !important;\n  }\n  .m-lg-2 {\n    margin: 0.5rem !important;\n  }\n  .mt-lg-2,\n  .my-lg-2 {\n    margin-top: 0.5rem !important;\n  }\n  .mr-lg-2,\n  .mx-lg-2 {\n    margin-right: 0.5rem !important;\n  }\n  .mb-lg-2,\n  .my-lg-2 {\n    margin-bottom: 0.5rem !important;\n  }\n  .ml-lg-2,\n  .mx-lg-2 {\n    margin-left: 0.5rem !important;\n  }\n  .m-lg-3 {\n    margin: 1rem !important;\n  }\n  .mt-lg-3,\n  .my-lg-3 {\n    margin-top: 1rem !important;\n  }\n  .mr-lg-3,\n  .mx-lg-3 {\n    margin-right: 1rem !important;\n  }\n  .mb-lg-3,\n  .my-lg-3 {\n    margin-bottom: 1rem !important;\n  }\n  .ml-lg-3,\n  .mx-lg-3 {\n    margin-left: 1rem !important;\n  }\n  .m-lg-4 {\n    margin: 1.5rem !important;\n  }\n  .mt-lg-4,\n  .my-lg-4 {\n    margin-top: 1.5rem !important;\n  }\n  .mr-lg-4,\n  .mx-lg-4 {\n    margin-right: 1.5rem !important;\n  }\n  .mb-lg-4,\n  .my-lg-4 {\n    margin-bottom: 1.5rem !important;\n  }\n  .ml-lg-4,\n  .mx-lg-4 {\n    margin-left: 1.5rem !important;\n  }\n  .m-lg-5 {\n    margin: 3rem !important;\n  }\n  .mt-lg-5,\n  .my-lg-5 {\n    margin-top: 3rem !important;\n  }\n  .mr-lg-5,\n  .mx-lg-5 {\n    margin-right: 3rem !important;\n  }\n  .mb-lg-5,\n  .my-lg-5 {\n    margin-bottom: 3rem !important;\n  }\n  .ml-lg-5,\n  .mx-lg-5 {\n    margin-left: 3rem !important;\n  }\n  .p-lg-0 {\n    padding: 0 !important;\n  }\n  .pt-lg-0,\n  .py-lg-0 {\n    padding-top: 0 !important;\n  }\n  .pr-lg-0,\n  .px-lg-0 {\n    padding-right: 0 !important;\n  }\n  .pb-lg-0,\n  .py-lg-0 {\n    padding-bottom: 0 !important;\n  }\n  .pl-lg-0,\n  .px-lg-0 {\n    padding-left: 0 !important;\n  }\n  .p-lg-1 {\n    padding: 0.25rem !important;\n  }\n  .pt-lg-1,\n  .py-lg-1 {\n    padding-top: 0.25rem !important;\n  }\n  .pr-lg-1,\n  .px-lg-1 {\n    padding-right: 0.25rem !important;\n  }\n  .pb-lg-1,\n  .py-lg-1 {\n    padding-bottom: 0.25rem !important;\n  }\n  .pl-lg-1,\n  .px-lg-1 {\n    padding-left: 0.25rem !important;\n  }\n  .p-lg-2 {\n    padding: 0.5rem !important;\n  }\n  .pt-lg-2,\n  .py-lg-2 {\n    padding-top: 0.5rem !important;\n  }\n  .pr-lg-2,\n  .px-lg-2 {\n    padding-right: 0.5rem !important;\n  }\n  .pb-lg-2,\n  .py-lg-2 {\n    padding-bottom: 0.5rem !important;\n  }\n  .pl-lg-2,\n  .px-lg-2 {\n    padding-left: 0.5rem !important;\n  }\n  .p-lg-3 {\n    padding: 1rem !important;\n  }\n  .pt-lg-3,\n  .py-lg-3 {\n    padding-top: 1rem !important;\n  }\n  .pr-lg-3,\n  .px-lg-3 {\n    padding-right: 1rem !important;\n  }\n  .pb-lg-3,\n  .py-lg-3 {\n    padding-bottom: 1rem !important;\n  }\n  .pl-lg-3,\n  .px-lg-3 {\n    padding-left: 1rem !important;\n  }\n  .p-lg-4 {\n    padding: 1.5rem !important;\n  }\n  .pt-lg-4,\n  .py-lg-4 {\n    padding-top: 1.5rem !important;\n  }\n  .pr-lg-4,\n  .px-lg-4 {\n    padding-right: 1.5rem !important;\n  }\n  .pb-lg-4,\n  .py-lg-4 {\n    padding-bottom: 1.5rem !important;\n  }\n  .pl-lg-4,\n  .px-lg-4 {\n    padding-left: 1.5rem !important;\n  }\n  .p-lg-5 {\n    padding: 3rem !important;\n  }\n  .pt-lg-5,\n  .py-lg-5 {\n    padding-top: 3rem !important;\n  }\n  .pr-lg-5,\n  .px-lg-5 {\n    padding-right: 3rem !important;\n  }\n  .pb-lg-5,\n  .py-lg-5 {\n    padding-bottom: 3rem !important;\n  }\n  .pl-lg-5,\n  .px-lg-5 {\n    padding-left: 3rem !important;\n  }\n  .m-lg-n1 {\n    margin: -0.25rem !important;\n  }\n  .mt-lg-n1,\n  .my-lg-n1 {\n    margin-top: -0.25rem !important;\n  }\n  .mr-lg-n1,\n  .mx-lg-n1 {\n    margin-right: -0.25rem !important;\n  }\n  .mb-lg-n1,\n  .my-lg-n1 {\n    margin-bottom: -0.25rem !important;\n  }\n  .ml-lg-n1,\n  .mx-lg-n1 {\n    margin-left: -0.25rem !important;\n  }\n  .m-lg-n2 {\n    margin: -0.5rem !important;\n  }\n  .mt-lg-n2,\n  .my-lg-n2 {\n    margin-top: -0.5rem !important;\n  }\n  .mr-lg-n2,\n  .mx-lg-n2 {\n    margin-right: -0.5rem !important;\n  }\n  .mb-lg-n2,\n  .my-lg-n2 {\n    margin-bottom: -0.5rem !important;\n  }\n  .ml-lg-n2,\n  .mx-lg-n2 {\n    margin-left: -0.5rem !important;\n  }\n  .m-lg-n3 {\n    margin: -1rem !important;\n  }\n  .mt-lg-n3,\n  .my-lg-n3 {\n    margin-top: -1rem !important;\n  }\n  .mr-lg-n3,\n  .mx-lg-n3 {\n    margin-right: -1rem !important;\n  }\n  .mb-lg-n3,\n  .my-lg-n3 {\n    margin-bottom: -1rem !important;\n  }\n  .ml-lg-n3,\n  .mx-lg-n3 {\n    margin-left: -1rem !important;\n  }\n  .m-lg-n4 {\n    margin: -1.5rem !important;\n  }\n  .mt-lg-n4,\n  .my-lg-n4 {\n    margin-top: -1.5rem !important;\n  }\n  .mr-lg-n4,\n  .mx-lg-n4 {\n    margin-right: -1.5rem !important;\n  }\n  .mb-lg-n4,\n  .my-lg-n4 {\n    margin-bottom: -1.5rem !important;\n  }\n  .ml-lg-n4,\n  .mx-lg-n4 {\n    margin-left: -1.5rem !important;\n  }\n  .m-lg-n5 {\n    margin: -3rem !important;\n  }\n  .mt-lg-n5,\n  .my-lg-n5 {\n    margin-top: -3rem !important;\n  }\n  .mr-lg-n5,\n  .mx-lg-n5 {\n    margin-right: -3rem !important;\n  }\n  .mb-lg-n5,\n  .my-lg-n5 {\n    margin-bottom: -3rem !important;\n  }\n  .ml-lg-n5,\n  .mx-lg-n5 {\n    margin-left: -3rem !important;\n  }\n  .m-lg-auto {\n    margin: auto !important;\n  }\n  .mt-lg-auto,\n  .my-lg-auto {\n    margin-top: auto !important;\n  }\n  .mr-lg-auto,\n  .mx-lg-auto {\n    margin-right: auto !important;\n  }\n  .mb-lg-auto,\n  .my-lg-auto {\n    margin-bottom: auto !important;\n  }\n  .ml-lg-auto,\n  .mx-lg-auto {\n    margin-left: auto !important;\n  }\n}\n\n@media (min-width: 1200px) {\n  .m-xl-0 {\n    margin: 0 !important;\n  }\n  .mt-xl-0,\n  .my-xl-0 {\n    margin-top: 0 !important;\n  }\n  .mr-xl-0,\n  .mx-xl-0 {\n    margin-right: 0 !important;\n  }\n  .mb-xl-0,\n  .my-xl-0 {\n    margin-bottom: 0 !important;\n  }\n  .ml-xl-0,\n  .mx-xl-0 {\n    margin-left: 0 !important;\n  }\n  .m-xl-1 {\n    margin: 0.25rem !important;\n  }\n  .mt-xl-1,\n  .my-xl-1 {\n    margin-top: 0.25rem !important;\n  }\n  .mr-xl-1,\n  .mx-xl-1 {\n    margin-right: 0.25rem !important;\n  }\n  .mb-xl-1,\n  .my-xl-1 {\n    margin-bottom: 0.25rem !important;\n  }\n  .ml-xl-1,\n  .mx-xl-1 {\n    margin-left: 0.25rem !important;\n  }\n  .m-xl-2 {\n    margin: 0.5rem !important;\n  }\n  .mt-xl-2,\n  .my-xl-2 {\n    margin-top: 0.5rem !important;\n  }\n  .mr-xl-2,\n  .mx-xl-2 {\n    margin-right: 0.5rem !important;\n  }\n  .mb-xl-2,\n  .my-xl-2 {\n    margin-bottom: 0.5rem !important;\n  }\n  .ml-xl-2,\n  .mx-xl-2 {\n    margin-left: 0.5rem !important;\n  }\n  .m-xl-3 {\n    margin: 1rem !important;\n  }\n  .mt-xl-3,\n  .my-xl-3 {\n    margin-top: 1rem !important;\n  }\n  .mr-xl-3,\n  .mx-xl-3 {\n    margin-right: 1rem !important;\n  }\n  .mb-xl-3,\n  .my-xl-3 {\n    margin-bottom: 1rem !important;\n  }\n  .ml-xl-3,\n  .mx-xl-3 {\n    margin-left: 1rem !important;\n  }\n  .m-xl-4 {\n    margin: 1.5rem !important;\n  }\n  .mt-xl-4,\n  .my-xl-4 {\n    margin-top: 1.5rem !important;\n  }\n  .mr-xl-4,\n  .mx-xl-4 {\n    margin-right: 1.5rem !important;\n  }\n  .mb-xl-4,\n  .my-xl-4 {\n    margin-bottom: 1.5rem !important;\n  }\n  .ml-xl-4,\n  .mx-xl-4 {\n    margin-left: 1.5rem !important;\n  }\n  .m-xl-5 {\n    margin: 3rem !important;\n  }\n  .mt-xl-5,\n  .my-xl-5 {\n    margin-top: 3rem !important;\n  }\n  .mr-xl-5,\n  .mx-xl-5 {\n    margin-right: 3rem !important;\n  }\n  .mb-xl-5,\n  .my-xl-5 {\n    margin-bottom: 3rem !important;\n  }\n  .ml-xl-5,\n  .mx-xl-5 {\n    margin-left: 3rem !important;\n  }\n  .p-xl-0 {\n    padding: 0 !important;\n  }\n  .pt-xl-0,\n  .py-xl-0 {\n    padding-top: 0 !important;\n  }\n  .pr-xl-0,\n  .px-xl-0 {\n    padding-right: 0 !important;\n  }\n  .pb-xl-0,\n  .py-xl-0 {\n    padding-bottom: 0 !important;\n  }\n  .pl-xl-0,\n  .px-xl-0 {\n    padding-left: 0 !important;\n  }\n  .p-xl-1 {\n    padding: 0.25rem !important;\n  }\n  .pt-xl-1,\n  .py-xl-1 {\n    padding-top: 0.25rem !important;\n  }\n  .pr-xl-1,\n  .px-xl-1 {\n    padding-right: 0.25rem !important;\n  }\n  .pb-xl-1,\n  .py-xl-1 {\n    padding-bottom: 0.25rem !important;\n  }\n  .pl-xl-1,\n  .px-xl-1 {\n    padding-left: 0.25rem !important;\n  }\n  .p-xl-2 {\n    padding: 0.5rem !important;\n  }\n  .pt-xl-2,\n  .py-xl-2 {\n    padding-top: 0.5rem !important;\n  }\n  .pr-xl-2,\n  .px-xl-2 {\n    padding-right: 0.5rem !important;\n  }\n  .pb-xl-2,\n  .py-xl-2 {\n    padding-bottom: 0.5rem !important;\n  }\n  .pl-xl-2,\n  .px-xl-2 {\n    padding-left: 0.5rem !important;\n  }\n  .p-xl-3 {\n    padding: 1rem !important;\n  }\n  .pt-xl-3,\n  .py-xl-3 {\n    padding-top: 1rem !important;\n  }\n  .pr-xl-3,\n  .px-xl-3 {\n    padding-right: 1rem !important;\n  }\n  .pb-xl-3,\n  .py-xl-3 {\n    padding-bottom: 1rem !important;\n  }\n  .pl-xl-3,\n  .px-xl-3 {\n    padding-left: 1rem !important;\n  }\n  .p-xl-4 {\n    padding: 1.5rem !important;\n  }\n  .pt-xl-4,\n  .py-xl-4 {\n    padding-top: 1.5rem !important;\n  }\n  .pr-xl-4,\n  .px-xl-4 {\n    padding-right: 1.5rem !important;\n  }\n  .pb-xl-4,\n  .py-xl-4 {\n    padding-bottom: 1.5rem !important;\n  }\n  .pl-xl-4,\n  .px-xl-4 {\n    padding-left: 1.5rem !important;\n  }\n  .p-xl-5 {\n    padding: 3rem !important;\n  }\n  .pt-xl-5,\n  .py-xl-5 {\n    padding-top: 3rem !important;\n  }\n  .pr-xl-5,\n  .px-xl-5 {\n    padding-right: 3rem !important;\n  }\n  .pb-xl-5,\n  .py-xl-5 {\n    padding-bottom: 3rem !important;\n  }\n  .pl-xl-5,\n  .px-xl-5 {\n    padding-left: 3rem !important;\n  }\n  .m-xl-n1 {\n    margin: -0.25rem !important;\n  }\n  .mt-xl-n1,\n  .my-xl-n1 {\n    margin-top: -0.25rem !important;\n  }\n  .mr-xl-n1,\n  .mx-xl-n1 {\n    margin-right: -0.25rem !important;\n  }\n  .mb-xl-n1,\n  .my-xl-n1 {\n    margin-bottom: -0.25rem !important;\n  }\n  .ml-xl-n1,\n  .mx-xl-n1 {\n    margin-left: -0.25rem !important;\n  }\n  .m-xl-n2 {\n    margin: -0.5rem !important;\n  }\n  .mt-xl-n2,\n  .my-xl-n2 {\n    margin-top: -0.5rem !important;\n  }\n  .mr-xl-n2,\n  .mx-xl-n2 {\n    margin-right: -0.5rem !important;\n  }\n  .mb-xl-n2,\n  .my-xl-n2 {\n    margin-bottom: -0.5rem !important;\n  }\n  .ml-xl-n2,\n  .mx-xl-n2 {\n    margin-left: -0.5rem !important;\n  }\n  .m-xl-n3 {\n    margin: -1rem !important;\n  }\n  .mt-xl-n3,\n  .my-xl-n3 {\n    margin-top: -1rem !important;\n  }\n  .mr-xl-n3,\n  .mx-xl-n3 {\n    margin-right: -1rem !important;\n  }\n  .mb-xl-n3,\n  .my-xl-n3 {\n    margin-bottom: -1rem !important;\n  }\n  .ml-xl-n3,\n  .mx-xl-n3 {\n    margin-left: -1rem !important;\n  }\n  .m-xl-n4 {\n    margin: -1.5rem !important;\n  }\n  .mt-xl-n4,\n  .my-xl-n4 {\n    margin-top: -1.5rem !important;\n  }\n  .mr-xl-n4,\n  .mx-xl-n4 {\n    margin-right: -1.5rem !important;\n  }\n  .mb-xl-n4,\n  .my-xl-n4 {\n    margin-bottom: -1.5rem !important;\n  }\n  .ml-xl-n4,\n  .mx-xl-n4 {\n    margin-left: -1.5rem !important;\n  }\n  .m-xl-n5 {\n    margin: -3rem !important;\n  }\n  .mt-xl-n5,\n  .my-xl-n5 {\n    margin-top: -3rem !important;\n  }\n  .mr-xl-n5,\n  .mx-xl-n5 {\n    margin-right: -3rem !important;\n  }\n  .mb-xl-n5,\n  .my-xl-n5 {\n    margin-bottom: -3rem !important;\n  }\n  .ml-xl-n5,\n  .mx-xl-n5 {\n    margin-left: -3rem !important;\n  }\n  .m-xl-auto {\n    margin: auto !important;\n  }\n  .mt-xl-auto,\n  .my-xl-auto {\n    margin-top: auto !important;\n  }\n  .mr-xl-auto,\n  .mx-xl-auto {\n    margin-right: auto !important;\n  }\n  .mb-xl-auto,\n  .my-xl-auto {\n    margin-bottom: auto !important;\n  }\n  .ml-xl-auto,\n  .mx-xl-auto {\n    margin-left: auto !important;\n  }\n}\n\n.stretched-link::after {\n  position: absolute;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  z-index: 1;\n  pointer-events: auto;\n  content: \"\";\n  background-color: rgba(0, 0, 0, 0);\n}\n\n.text-monospace {\n  font-family: SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace !important;\n}\n\n.text-justify {\n  text-align: justify !important;\n}\n\n.text-wrap {\n  white-space: normal !important;\n}\n\n.text-nowrap {\n  white-space: nowrap !important;\n}\n\n.text-truncate {\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.text-left {\n  text-align: left !important;\n}\n\n.text-right {\n  text-align: right !important;\n}\n\n.text-center {\n  text-align: center !important;\n}\n\n@media (min-width: 576px) {\n  .text-sm-left {\n    text-align: left !important;\n  }\n  .text-sm-right {\n    text-align: right !important;\n  }\n  .text-sm-center {\n    text-align: center !important;\n  }\n}\n\n@media (min-width: 768px) {\n  .text-md-left {\n    text-align: left !important;\n  }\n  .text-md-right {\n    text-align: right !important;\n  }\n  .text-md-center {\n    text-align: center !important;\n  }\n}\n\n@media (min-width: 992px) {\n  .text-lg-left {\n    text-align: left !important;\n  }\n  .text-lg-right {\n    text-align: right !important;\n  }\n  .text-lg-center {\n    text-align: center !important;\n  }\n}\n\n@media (min-width: 1200px) {\n  .text-xl-left {\n    text-align: left !important;\n  }\n  .text-xl-right {\n    text-align: right !important;\n  }\n  .text-xl-center {\n    text-align: center !important;\n  }\n}\n\n.text-lowercase {\n  text-transform: lowercase !important;\n}\n\n.text-uppercase {\n  text-transform: uppercase !important;\n}\n\n.text-capitalize {\n  text-transform: capitalize !important;\n}\n\n.font-weight-light {\n  font-weight: 300 !important;\n}\n\n.font-weight-lighter {\n  font-weight: lighter !important;\n}\n\n.font-weight-normal {\n  font-weight: 400 !important;\n}\n\n.font-weight-bold {\n  font-weight: 700 !important;\n}\n\n.font-weight-bolder {\n  font-weight: bolder !important;\n}\n\n.font-italic {\n  font-style: italic !important;\n}\n\n.text-white {\n  color: #fff !important;\n}\n\n.text-primary {\n  color: #007bff !important;\n}\n\na.text-primary:hover, a.text-primary:focus {\n  color: #0056b3 !important;\n}\n\n.text-secondary {\n  color: #6c757d !important;\n}\n\na.text-secondary:hover, a.text-secondary:focus {\n  color: #494f54 !important;\n}\n\n.text-success {\n  color: #28a745 !important;\n}\n\na.text-success:hover, a.text-success:focus {\n  color: #19692c !important;\n}\n\n.text-info {\n  color: #17a2b8 !important;\n}\n\na.text-info:hover, a.text-info:focus {\n  color: #0f6674 !important;\n}\n\n.text-warning {\n  color: #ffc107 !important;\n}\n\na.text-warning:hover, a.text-warning:focus {\n  color: #ba8b00 !important;\n}\n\n.text-danger {\n  color: #dc3545 !important;\n}\n\na.text-danger:hover, a.text-danger:focus {\n  color: #a71d2a !important;\n}\n\n.text-light {\n  color: #f8f9fa !important;\n}\n\na.text-light:hover, a.text-light:focus {\n  color: #cbd3da !important;\n}\n\n.text-dark {\n  color: #343a40 !important;\n}\n\na.text-dark:hover, a.text-dark:focus {\n  color: #121416 !important;\n}\n\n.text-body {\n  color: #212529 !important;\n}\n\n.text-muted {\n  color: #6c757d !important;\n}\n\n.text-black-50 {\n  color: rgba(0, 0, 0, 0.5) !important;\n}\n\n.text-white-50 {\n  color: rgba(255, 255, 255, 0.5) !important;\n}\n\n.text-hide {\n  font: 0/0 a;\n  color: transparent;\n  text-shadow: none;\n  background-color: transparent;\n  border: 0;\n}\n\n.text-decoration-none {\n  text-decoration: none !important;\n}\n\n.text-break {\n  word-break: break-word !important;\n  word-wrap: break-word !important;\n}\n\n.text-reset {\n  color: inherit !important;\n}\n\n.visible {\n  visibility: visible !important;\n}\n\n.invisible {\n  visibility: hidden !important;\n}\n\n@media print {\n  *,\n  *::before,\n  *::after {\n    text-shadow: none !important;\n    box-shadow: none !important;\n  }\n  a:not(.btn) {\n    text-decoration: underline;\n  }\n  abbr[title]::after {\n    content: \" (\" attr(title) \")\";\n  }\n  pre {\n    white-space: pre-wrap !important;\n  }\n  pre,\n  blockquote {\n    border: 1px solid #adb5bd;\n    page-break-inside: avoid;\n  }\n  tr,\n  img {\n    page-break-inside: avoid;\n  }\n  p,\n  h2,\n  h3 {\n    orphans: 3;\n    widows: 3;\n  }\n  h2,\n  h3 {\n    page-break-after: avoid;\n  }\n  @page {\n    size: a3;\n  }\n  body {\n    min-width: 992px !important;\n  }\n  .container {\n    min-width: 992px !important;\n  }\n  .navbar {\n    display: none;\n  }\n  .badge {\n    border: 1px solid #000;\n  }\n  .table {\n    border-collapse: collapse !important;\n  }\n  .table td,\n  .table th {\n    background-color: #fff !important;\n  }\n  .table-bordered th,\n  .table-bordered td {\n    border: 1px solid #dee2e6 !important;\n  }\n  .table-dark {\n    color: inherit;\n  }\n  .table-dark th,\n  .table-dark td,\n  .table-dark thead th,\n  .table-dark tbody + tbody {\n    border-color: #dee2e6;\n  }\n  .table .thead-dark th {\n    color: inherit;\n    border-color: #dee2e6;\n  }\n}", ""]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ 894:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(8081);
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3645);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_scss_style_css__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(5856);
// Imports



var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
___CSS_LOADER_EXPORT___.i(_node_modules_css_loader_dist_cjs_js_scss_style_css__WEBPACK_IMPORTED_MODULE_2__/* ["default"] */ .Z);
// Module
___CSS_LOADER_EXPORT___.push([module.id, "", ""]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ 3645:
/***/ ((module) => {

"use strict";


/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
module.exports = function (cssWithMappingToString) {
  var list = []; // return the list of modules as css string

  list.toString = function toString() {
    return this.map(function (item) {
      var content = "";
      var needLayer = typeof item[5] !== "undefined";

      if (item[4]) {
        content += "@supports (".concat(item[4], ") {");
      }

      if (item[2]) {
        content += "@media ".concat(item[2], " {");
      }

      if (needLayer) {
        content += "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {");
      }

      content += cssWithMappingToString(item);

      if (needLayer) {
        content += "}";
      }

      if (item[2]) {
        content += "}";
      }

      if (item[4]) {
        content += "}";
      }

      return content;
    }).join("");
  }; // import a list of modules into the list


  list.i = function i(modules, media, dedupe, supports, layer) {
    if (typeof modules === "string") {
      modules = [[null, modules, undefined]];
    }

    var alreadyImportedModules = {};

    if (dedupe) {
      for (var k = 0; k < this.length; k++) {
        var id = this[k][0];

        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }

    for (var _k = 0; _k < modules.length; _k++) {
      var item = [].concat(modules[_k]);

      if (dedupe && alreadyImportedModules[item[0]]) {
        continue;
      }

      if (typeof layer !== "undefined") {
        if (typeof item[5] === "undefined") {
          item[5] = layer;
        } else {
          item[1] = "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {").concat(item[1], "}");
          item[5] = layer;
        }
      }

      if (media) {
        if (!item[2]) {
          item[2] = media;
        } else {
          item[1] = "@media ".concat(item[2], " {").concat(item[1], "}");
          item[2] = media;
        }
      }

      if (supports) {
        if (!item[4]) {
          item[4] = "".concat(supports);
        } else {
          item[1] = "@supports (".concat(item[4], ") {").concat(item[1], "}");
          item[4] = supports;
        }
      }

      list.push(item);
    }
  };

  return list;
};

/***/ }),

/***/ 1667:
/***/ ((module) => {

"use strict";


module.exports = function (url, options) {
  if (!options) {
    options = {};
  }

  if (!url) {
    return url;
  }

  url = String(url.__esModule ? url.default : url); // If url is already wrapped in quotes, remove them

  if (/^['"].*['"]$/.test(url)) {
    url = url.slice(1, -1);
  }

  if (options.hash) {
    url += options.hash;
  } // Should url be wrapped?
  // See https://drafts.csswg.org/css-values-3/#urls


  if (/["'() \t\n]|(%20)/.test(url) || options.needQuotes) {
    return "\"".concat(url.replace(/"/g, '\\"').replace(/\n/g, "\\n"), "\"");
  }

  return url;
};

/***/ }),

/***/ 8081:
/***/ ((module) => {

"use strict";


module.exports = function (i) {
  return i[1];
};

/***/ }),

/***/ 6823:
/***/ ((module) => {

!function(e,t){ true?module.exports=t():0}(window,(function(){return function(e){var t={};function n(r){if(t[r])return t[r].exports;var i=t[r]={i:r,l:!1,exports:{}};return e[r].call(i.exports,i,i.exports,n),i.l=!0,i.exports}return n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var i in e)n.d(r,i,function(t){return e[t]}.bind(null,i));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=0)}([function(e,t,n){"use strict";function r(e){return function(e){if(Array.isArray(e)){for(var t=0,n=new Array(e.length);t<e.length;t++)n[t]=e[t];return n}}(e)||function(e){if(Symbol.iterator in Object(e)||"[object Arguments]"===Object.prototype.toString.call(e))return Array.from(e)}(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance")}()}n.r(t);var i={name:"sl-vue-tree",props:{value:{type:Array,default:function(){return[]}},edgeSize:{type:Number,default:3},showBranches:{type:Boolean,default:!1},level:{type:Number,default:0},parentInd:{type:Number},allowMultiselect:{type:Boolean,default:!0},allowToggleBranch:{type:Boolean,default:!0},multiselectKey:{type:[String,Array],default:function(){return["ctrlKey","metaKey"]},validator:function(e){var t=["ctrlKey","metaKey","altKey"],n=Array.isArray(e)?e:[e];return!!(n=n.filter((function(e){return-1!==t.indexOf(e)}))).length}},scrollAreaHeight:{type:Number,default:70},maxScrollSpeed:{type:Number,default:20}},data:function(){return{rootCursorPosition:null,scrollIntervalId:0,scrollSpeed:0,lastSelectedNode:null,mouseIsDown:!1,isDragging:!1,lastMousePos:{x:0,y:0},preventDrag:!1,currentValue:this.value}},mounted:function(){this.isRoot&&document.addEventListener("mouseup",this.onDocumentMouseupHandler)},beforeDestroy:function(){document.removeEventListener("mouseup",this.onDocumentMouseupHandler)},watch:{value:function(e){this.currentValue=e}},computed:{cursorPosition:function(){return this.isRoot?this.rootCursorPosition:this.getParent().cursorPosition},depth:function(){return this.gaps.length},nodes:function(){if(this.isRoot){var e=this.copy(this.currentValue);return this.getNodes(e)}return this.getParent().nodes[this.parentInd].children},gaps:function(){var e=[],t=this.level-1;for(this.showBranches||t++;t-- >0;)e.push(t);return e},isRoot:function(){return!this.level},selectionSize:function(){return this.getSelected().length},dragSize:function(){return this.getDraggable().length}},methods:{setCursorPosition:function(e){this.isRoot?this.rootCursorPosition=e:this.getParent().setCursorPosition(e)},getNodes:function(e){var t=this,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:[],r=!(arguments.length>2&&void 0!==arguments[2])||arguments[2];return e.map((function(i,o){var s=n.concat(o);return t.getNode(s,i,e,r)}))},getNode:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null,n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null,r=arguments.length>3&&void 0!==arguments[3]?arguments[3]:null,i=e.slice(-1)[0];if(n=n||this.getNodeSiblings(this.currentValue,e),t=t||n&&n[i]||null,null==r&&(r=this.isVisible(e)),!t)return null;var o=null==t.isExpanded||!!t.isExpanded,s=null==t.isDraggable||!!t.isDraggable,l=null==t.isSelectable||!!t.isSelectable,a={title:t.title,isLeaf:!!t.isLeaf,children:t.children?this.getNodes(t.children,e,o):[],isSelected:!!t.isSelected,isExpanded:o,isVisible:r,isDraggable:s,isSelectable:l,data:void 0!==t.data?t.data:{},path:e,pathStr:JSON.stringify(e),level:e.length,ind:i,isFirstChild:0==i,isLastChild:i===n.length-1};return a},isVisible:function(e){if(e.length<2)return!0;for(var t=this.currentValue,n=0;n<e.length-1;n++){var r=t[e[n]];if(!(null==r.isExpanded||!!r.isExpanded))return!1;t=r.children}return!0},emitInput:function(e){this.currentValue=e,this.getRoot().$emit("input",e)},emitSelect:function(e,t){this.getRoot().$emit("select",e,t)},emitBeforeDrop:function(e,t,n){this.getRoot().$emit("beforedrop",e,t,n)},emitDrop:function(e,t,n){this.getRoot().$emit("drop",e,t,n)},emitToggle:function(e,t){this.getRoot().$emit("toggle",e,t)},emitNodeClick:function(e,t){this.getRoot().$emit("nodeclick",e,t)},emitNodeDblclick:function(e,t){this.getRoot().$emit("nodedblclick",e,t)},emitNodeContextmenu:function(e,t){this.getRoot().$emit("nodecontextmenu",e,t)},onExternalDragoverHandler:function(e,t){t.preventDefault();var n=this.getRoot(),r=n.getCursorPositionFromCoords(t.clientX,t.clientY);n.setCursorPosition(r),n.$emit("externaldragover",r,t)},onExternalDropHandler:function(e,t){var n=this.getRoot(),r=n.getCursorPositionFromCoords(t.clientX,t.clientY);n.$emit("externaldrop",r,t),this.setCursorPosition(null)},select:function(e){var t=this,n=arguments.length>1&&void 0!==arguments[1]&&arguments[1],r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null,i=Array.isArray(this.multiselectKey)?this.multiselectKey:[this.multiselectKey],o=r&&!!i.find((function(e){return r[e]}));n=(o||n)&&this.allowMultiselect;var s=this.getNode(e);if(!s)return null;var l=this.copy(this.currentValue),a=this.allowMultiselect&&r&&r.shiftKey&&this.lastSelectedNode,u=[],c=!1;return this.traverse((function(e,r){a?(e.pathStr!==s.pathStr&&e.pathStr!==t.lastSelectedNode.pathStr||(r.isSelected=e.isSelectable,c=!c),c&&(r.isSelected=e.isSelectable)):e.pathStr===s.pathStr?r.isSelected=e.isSelectable:n||r.isSelected&&(r.isSelected=!1),r.isSelected&&u.push(e)}),l),this.lastSelectedNode=s,this.emitInput(l),this.emitSelect(u,r),s},onMousemoveHandler:function(e){if(this.isRoot){if(!this.preventDrag){var t=this.isDragging,n=this.isDragging||this.mouseIsDown&&(this.lastMousePos.x!==e.clientX||this.lastMousePos.y!==e.clientY),r=!1===t&&!0===n;if(this.lastMousePos={x:e.clientX,y:e.clientY},n){var i=this.getRoot().$el,o=i.getBoundingClientRect(),s=this.$refs.dragInfo,l=e.clientY-o.top+i.scrollTop-(0|s.style.marginBottom),a=e.clientX-o.left;s.style.top=l+"px",s.style.left=a+"px";var u=this.getCursorPositionFromCoords(e.clientX,e.clientY),c=u.node,d=u.placement;if(r&&!c.isSelected&&this.select(c.path,!1,e),this.getDraggable().length){this.isDragging=n,this.setCursorPosition({node:c,placement:d});var h=o.bottom-this.scrollAreaHeight,f=(e.clientY-h)/(o.bottom-h),g=o.top+this.scrollAreaHeight,p=(g-e.clientY)/(g-o.top);f>0?this.startScroll(f):p>0?this.startScroll(-p):this.stopScroll()}else this.preventDrag=!0}}}else this.getRoot().onMousemoveHandler(e)},getCursorPositionFromCoords:function(e,t){var n,r,i=document.elementFromPoint(e,t),o=i.getAttribute("path")?i:this.getClosetElementWithPath(i);if(o){if(!o)return;n=this.getNode(JSON.parse(o.getAttribute("path")));var s=o.offsetHeight,l=this.edgeSize,a=t-o.getBoundingClientRect().top;r=n.isLeaf?a>=s/2?"after":"before":a<=l?"before":a>=s-l?"after":"inside"}else{var u=this.getRoot().$el.getBoundingClientRect();t>u.top+u.height/2?(r="after",n=this.getLastNode()):(r="before",n=this.getFirstNode())}return{node:n,placement:r}},getClosetElementWithPath:function(e){return e?e.getAttribute("path")?e:this.getClosetElementWithPath(e.parentElement):null},onMouseleaveHandler:function(e){if(this.isRoot&&this.isDragging){var t=this.getRoot().$el.getBoundingClientRect();e.clientY>=t.bottom?this.setCursorPosition({node:this.nodes.slice(-1)[0],placement:"after"}):e.clientY<t.top&&this.setCursorPosition({node:this.getFirstNode(),placement:"before"})}},getNodeEl:function(e){this.getRoot().$el.querySelector('[path="'.concat(JSON.stringify(e),'"]'))},getLastNode:function(){var e=null;return this.traverse((function(t){e=t})),e},getFirstNode:function(){return this.getNode([0])},getNextNode:function(e){var t=this,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null,r=null;return this.traverse((function(i){if(!(t.comparePaths(i.path,e)<1))return!n||n(i)?(r=i,!1):void 0})),r},getPrevNode:function(e,t){var n=this,r=[];this.traverse((function(t){if(n.comparePaths(t.path,e)>=0)return!1;r.push(t)}));for(var i=r.length;i--;){var o=r[i];if(!t||t(o))return o}return null},comparePaths:function(e,t){for(var n=0;n<e.length;n++){if(null==t[n])return 1;if(e[n]>t[n])return 1;if(e[n]<t[n])return-1}return null==t[e.length]?0:-1},onNodeMousedownHandler:function(e,t){0===e.button&&(this.isRoot?this.mouseIsDown=!0:this.getRoot().onNodeMousedownHandler(e,t))},startScroll:function(e){var t=this,n=this.getRoot().$el;this.scrollSpeed!==e&&(this.scrollIntervalId&&this.stopScroll(),this.scrollSpeed=e,this.scrollIntervalId=setInterval((function(){n.scrollTop+=t.maxScrollSpeed*e}),20))},stopScroll:function(){clearInterval(this.scrollIntervalId),this.scrollIntervalId=0,this.scrollSpeed=0},onDocumentMouseupHandler:function(e){this.isDragging&&this.onNodeMouseupHandler(e)},onNodeMouseupHandler:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;if(0===e.button)if(this.isRoot)if(this.mouseIsDown=!1,this.isDragging||!t||this.preventDrag||this.select(t.path,!1,e),this.preventDrag=!1,this.cursorPosition){var n=this.getDraggable(),r=!0,i=!1,o=void 0;try{for(var s,l=n[Symbol.iterator]();!(r=(s=l.next()).done);r=!0){var a=s.value;if(a.pathStr==this.cursorPosition.node.pathStr)return void this.stopDrag();if(this.checkNodeIsParent(a,this.cursorPosition.node))return void this.stopDrag()}}catch(e){i=!0,o=e}finally{try{r||null==l.return||l.return()}finally{if(i)throw o}}var u=this.copy(this.currentValue),c=[],d=!0,h=!1,f=void 0;try{for(var g,p=n[Symbol.iterator]();!(d=(g=p.next()).done);d=!0){var v=g.value,m=this.getNodeSiblings(u,v.path),S=m[v.ind];c.push(S)}}catch(e){h=!0,f=e}finally{try{d||null==p.return||p.return()}finally{if(h)throw f}}var y=!1;if(this.emitBeforeDrop(n,this.cursorPosition,(function(){return y=!0})),y)this.stopDrag();else{for(var b=[],_=0;_<c.length;_++){var C=c[_];b.push(this.copy(C)),C._markToDelete=!0}this.insertModels(this.cursorPosition,b,u),this.traverseModels((function(e,t,n){e._markToDelete&&t.splice(n,1)}),u),this.lastSelectedNode=null,this.emitInput(u),this.emitDrop(n,this.cursorPosition,e),this.stopDrag()}}else this.stopDrag();else this.getRoot().onNodeMouseupHandler(e,t)},onToggleHandler:function(e,t){this.allowToggleBranch&&(this.updateNode(t.path,{isExpanded:!t.isExpanded}),this.emitToggle(t,e),e.stopPropagation())},stopDrag:function(){this.isDragging=!1,this.mouseIsDown=!1,this.setCursorPosition(null),this.stopScroll()},getParent:function(){return this.$parent},getRoot:function(){return this.isRoot?this:this.getParent().getRoot()},getNodeSiblings:function(e,t){return 1===t.length?e:this.getNodeSiblings(e[t[0]].children,t.slice(1))},updateNode:function(e,t){if(this.isRoot){var n=JSON.stringify(e),r=this.copy(this.currentValue);this.traverse((function(e,r){e.pathStr===n&&Object.assign(r,t)}),r),this.emitInput(r)}else this.getParent().updateNode(e,t)},getSelected:function(){var e=[];return this.traverse((function(t){t.isSelected&&e.push(t)})),e},getDraggable:function(){var e=[];return this.traverse((function(t){t.isSelected&&t.isDraggable&&e.push(t)})),e},traverse:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null,n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:[];t||(t=this.currentValue);for(var r=!1,i=[],o=0;o<t.length;o++){var s=t[o],l=n.concat(o),a=this.getNode(l,s,t);if(r=!1===e(a,s,t),i.push(a),r)break;if(s.children&&(r=!1===this.traverse(e,s.children,l)))break}return!r&&i},traverseModels:function(e,t){for(var n=t.length;n--;){var r=t[n];r.children&&this.traverseModels(e,r.children),e(r,t,n)}return t},remove:function(e){var t=e.map((function(e){return JSON.stringify(e)})),n=this.copy(this.currentValue);this.traverse((function(e,n,r){var i=!0,o=!1,s=void 0;try{for(var l,a=t[Symbol.iterator]();!(i=(l=a.next()).done);i=!0){var u=l.value;e.pathStr===u&&(n._markToDelete=!0)}}catch(e){o=!0,s=e}finally{try{i||null==a.return||a.return()}finally{if(o)throw s}}}),n),this.traverseModels((function(e,t,n){e._markToDelete&&t.splice(n,1)}),n),this.emitInput(n)},insertModels:function(e,t,n){var i=e.node,o=this.getNodeSiblings(n,i.path),s=o[i.ind];if("inside"===e.placement){var l;s.children=s.children||[],(l=s.children).unshift.apply(l,r(t))}else{var a="before"===e.placement?i.ind:i.ind+1;o.splice.apply(o,[a,0].concat(r(t)))}},insert:function(e,t){var n=Array.isArray(t)?t:[t],r=this.copy(this.currentValue);this.insertModels(e,n,r),this.emitInput(r)},checkNodeIsParent:function(e,t){var n=t.path;return JSON.stringify(n.slice(0,e.path.length))==e.pathStr},copy:function(e){return JSON.parse(JSON.stringify(e))}}},o=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{staticClass:"sl-vue-tree",class:{"sl-vue-tree-root":e.isRoot},on:{mousemove:e.onMousemoveHandler,mouseleave:e.onMouseleaveHandler,dragend:function(t){e.onDragendHandler(null,t)}}},[n("div",{ref:"nodes",staticClass:"sl-vue-tree-nodes-list"},[e._l(e.nodes,(function(t,r){return n("div",{staticClass:"sl-vue-tree-node",class:{"sl-vue-tree-selected":t.isSelected}},[n("div",{staticClass:"sl-vue-tree-cursor sl-vue-tree-cursor_before",style:{visibility:e.cursorPosition&&e.cursorPosition.node.pathStr===t.pathStr&&"before"===e.cursorPosition.placement?"visible":"hidden","--depth":e.depth},on:{dragover:function(e){e.preventDefault()}}}),e._v(" "),n("div",{staticClass:"sl-vue-tree-node-item",class:{"sl-vue-tree-cursor-hover":e.cursorPosition&&e.cursorPosition.node.pathStr===t.pathStr,"sl-vue-tree-cursor-inside":e.cursorPosition&&"inside"===e.cursorPosition.placement&&e.cursorPosition.node.pathStr===t.pathStr,"sl-vue-tree-node-is-leaf":t.isLeaf,"sl-vue-tree-node-is-folder":!t.isLeaf},attrs:{path:t.pathStr},on:{mousedown:function(n){e.onNodeMousedownHandler(n,t)},mouseup:function(n){e.onNodeMouseupHandler(n,t)},contextmenu:function(n){e.emitNodeContextmenu(t,n)},dblclick:function(n){e.emitNodeDblclick(t,n)},click:function(n){e.emitNodeClick(t,n)},dragover:function(n){e.onExternalDragoverHandler(t,n)},drop:function(n){e.onExternalDropHandler(t,n)}}},[e._l(e.gaps,(function(e){return n("div",{staticClass:"sl-vue-tree-gap"})})),e._v(" "),e.level&&e.showBranches?n("div",{staticClass:"sl-vue-tree-branch"},[e._t("branch",[t.isLastChild?e._e():n("span",[e._v("\n            "+e._s(String.fromCharCode(9500))+e._s(String.fromCharCode(9472))+" \n          ")]),e._v(" "),t.isLastChild?n("span",[e._v("\n            "+e._s(String.fromCharCode(9492))+e._s(String.fromCharCode(9472))+" \n          ")]):e._e()],{node:t})],2):e._e(),e._v(" "),n("div",{staticClass:"sl-vue-tree-title"},[t.isLeaf?e._e():n("span",{staticClass:"sl-vue-tree-toggle",on:{click:function(n){e.onToggleHandler(n,t)}}},[e._t("toggle",[n("span",[e._v("\n             "+e._s(t.isLeaf?"":t.isExpanded?"-":"+")+"\n            ")])],{node:t})],2),e._v(" "),e._t("title",[e._v(e._s(t.title))],{node:t}),e._v(" "),!t.isLeaf&&0==t.children.length&&t.isExpanded?e._t("empty-node",null,{node:t}):e._e()],2),e._v(" "),n("div",{staticClass:"sl-vue-tree-sidebar"},[e._t("sidebar",null,{node:t})],2)],2),e._v(" "),t.children&&t.children.length&&t.isExpanded?n("sl-vue-tree",{attrs:{value:t.children,level:t.level,parentInd:r,allowMultiselect:e.allowMultiselect,allowToggleBranch:e.allowToggleBranch,edgeSize:e.edgeSize,showBranches:e.showBranches},on:{dragover:function(e){e.preventDefault()}},scopedSlots:e._u([{key:"title",fn:function(t){var n=t.node;return[e._t("title",[e._v(e._s(n.title))],{node:n})]}},{key:"toggle",fn:function(t){var r=t.node;return[e._t("toggle",[n("span",[e._v("\n             "+e._s(r.isLeaf?"":r.isExpanded?"-":"+")+"\n          ")])],{node:r})]}},{key:"sidebar",fn:function(t){var n=t.node;return[e._t("sidebar",null,{node:n})]}},{key:"empty-node",fn:function(t){var n=t.node;return[!n.isLeaf&&0==n.children.length&&n.isExpanded?e._t("empty-node",null,{node:n}):e._e()]}}])}):e._e(),e._v(" "),n("div",{staticClass:"sl-vue-tree-cursor sl-vue-tree-cursor_after",style:{visibility:e.cursorPosition&&e.cursorPosition.node.pathStr===t.pathStr&&"after"===e.cursorPosition.placement?"visible":"hidden","--depth":e.depth},on:{dragover:function(e){e.preventDefault()}}})],1)})),e._v(" "),e.isRoot?n("div",{directives:[{name:"show",rawName:"v-show",value:e.isDragging,expression:"isDragging"}],ref:"dragInfo",staticClass:"sl-vue-tree-drag-info"},[e._t("draginfo",[e._v("\n        Items: "+e._s(e.selectionSize)+"\n      ")])],2):e._e()],2)])};o._withStripped=!0;var s=function(e,t,n,r,i,o,s,l){var a=typeof(e=e||{}).default;"object"!==a&&"function"!==a||(e=e.default);var u,c="function"==typeof e?e.options:e;if(t&&(c.render=t,c.staticRenderFns=n,c._compiled=!0),r&&(c.functional=!0),o&&(c._scopeId=o),s?(u=function(e){(e=e||this.$vnode&&this.$vnode.ssrContext||this.parent&&this.parent.$vnode&&this.parent.$vnode.ssrContext)||"undefined"==typeof __VUE_SSR_CONTEXT__||(e=__VUE_SSR_CONTEXT__),i&&i.call(this,e),e&&e._registeredComponents&&e._registeredComponents.add(s)},c._ssrRegister=u):i&&(u=l?function(){i.call(this,this.$root.$options.shadowRoot)}:i),u)if(c.functional){c._injectStyles=u;var d=c.render;c.render=function(e,t){return u.call(t),d(e,t)}}else{var h=c.beforeCreate;c.beforeCreate=h?[].concat(h,u):[u]}return{exports:e,options:c}}(i,o,[],!1,null,null,null);s.options.__file="src/sl-vue-tree.vue";t.default=s.exports}]).default}));
//# sourceMappingURL=sl-vue-tree.js.map

/***/ }),

/***/ 3379:
/***/ ((module) => {

"use strict";


var stylesInDOM = [];

function getIndexByIdentifier(identifier) {
  var result = -1;

  for (var i = 0; i < stylesInDOM.length; i++) {
    if (stylesInDOM[i].identifier === identifier) {
      result = i;
      break;
    }
  }

  return result;
}

function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];

  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var indexByIdentifier = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3],
      supports: item[4],
      layer: item[5]
    };

    if (indexByIdentifier !== -1) {
      stylesInDOM[indexByIdentifier].references++;
      stylesInDOM[indexByIdentifier].updater(obj);
    } else {
      var updater = addElementStyle(obj, options);
      options.byIndex = i;
      stylesInDOM.splice(i, 0, {
        identifier: identifier,
        updater: updater,
        references: 1
      });
    }

    identifiers.push(identifier);
  }

  return identifiers;
}

function addElementStyle(obj, options) {
  var api = options.domAPI(options);
  api.update(obj);

  var updater = function updater(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap && newObj.supports === obj.supports && newObj.layer === obj.layer) {
        return;
      }

      api.update(obj = newObj);
    } else {
      api.remove();
    }
  };

  return updater;
}

module.exports = function (list, options) {
  options = options || {};
  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];

    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDOM[index].references--;
    }

    var newLastIdentifiers = modulesToDom(newList, options);

    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];

      var _index = getIndexByIdentifier(_identifier);

      if (stylesInDOM[_index].references === 0) {
        stylesInDOM[_index].updater();

        stylesInDOM.splice(_index, 1);
      }
    }

    lastIdentifiers = newLastIdentifiers;
  };
};

/***/ }),

/***/ 569:
/***/ ((module) => {

"use strict";


var memo = {};
/* istanbul ignore next  */

function getTarget(target) {
  if (typeof memo[target] === "undefined") {
    var styleTarget = document.querySelector(target); // Special case to return head of iframe instead of iframe itself

    if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
      try {
        // This will throw an exception if access to iframe is blocked
        // due to cross-origin restrictions
        styleTarget = styleTarget.contentDocument.head;
      } catch (e) {
        // istanbul ignore next
        styleTarget = null;
      }
    }

    memo[target] = styleTarget;
  }

  return memo[target];
}
/* istanbul ignore next  */


function insertBySelector(insert, style) {
  var target = getTarget(insert);

  if (!target) {
    throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
  }

  target.appendChild(style);
}

module.exports = insertBySelector;

/***/ }),

/***/ 9216:
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function insertStyleElement(options) {
  var element = document.createElement("style");
  options.setAttributes(element, options.attributes);
  options.insert(element, options.options);
  return element;
}

module.exports = insertStyleElement;

/***/ }),

/***/ 3565:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


/* istanbul ignore next  */
function setAttributesWithoutAttributes(styleElement) {
  var nonce =  true ? __webpack_require__.nc : 0;

  if (nonce) {
    styleElement.setAttribute("nonce", nonce);
  }
}

module.exports = setAttributesWithoutAttributes;

/***/ }),

/***/ 7795:
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function apply(styleElement, options, obj) {
  var css = "";

  if (obj.supports) {
    css += "@supports (".concat(obj.supports, ") {");
  }

  if (obj.media) {
    css += "@media ".concat(obj.media, " {");
  }

  var needLayer = typeof obj.layer !== "undefined";

  if (needLayer) {
    css += "@layer".concat(obj.layer.length > 0 ? " ".concat(obj.layer) : "", " {");
  }

  css += obj.css;

  if (needLayer) {
    css += "}";
  }

  if (obj.media) {
    css += "}";
  }

  if (obj.supports) {
    css += "}";
  }

  var sourceMap = obj.sourceMap;

  if (sourceMap && typeof btoa !== "undefined") {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  } // For old IE

  /* istanbul ignore if  */


  options.styleTagTransform(css, styleElement, options.options);
}

function removeStyleElement(styleElement) {
  // istanbul ignore if
  if (styleElement.parentNode === null) {
    return false;
  }

  styleElement.parentNode.removeChild(styleElement);
}
/* istanbul ignore next  */


function domAPI(options) {
  var styleElement = options.insertStyleElement(options);
  return {
    update: function update(obj) {
      apply(styleElement, options, obj);
    },
    remove: function remove() {
      removeStyleElement(styleElement);
    }
  };
}

module.exports = domAPI;

/***/ }),

/***/ 4589:
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function styleTagTransform(css, styleElement) {
  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css;
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild);
    }

    styleElement.appendChild(document.createTextNode(css));
  }
}

module.exports = styleTagTransform;

/***/ }),

/***/ 541:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "Z": () => (/* binding */ root)
});

;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./assets/js/root.vue?vue&type=template&id=41f9ea87&
var render = function () {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    { attrs: { id: "content" } },
    [
      _c("LayoutStructure", {
        attrs: {
          buildings: _vm.myBuilding,
          floors: _vm.myFloors,
          groups: _vm.myGroups,
          devices: _vm.myDevices,
        },
      }),
    ],
    1
  )
}
var staticRenderFns = []
render._withStripped = true


;// CONCATENATED MODULE: ./assets/js/root.vue?vue&type=template&id=41f9ea87&

;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./assets/js/components/structure/layout-structure.vue?vue&type=template&id=7369adf8&
var layout_structurevue_type_template_id_7369adf8_render = function () {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    { staticClass: "row container-structure" },
    [
      _c(
        "div",
        { staticClass: "padding-0", class: _vm.colLeft },
        [
          _c("LayoutLeft", {
            ref: "layoutLeft",
            attrs: {
              token: this.token,
              buildings_json: this.buildings,
              groups_json: this.groups,
              devices_json: this.devices,
              floors_json: this.floors,
              project: this.project,
            },
            on: {
              handleSelectBuilding: _vm.handleSelectBuilding,
              handleExpandedView: _vm.handleExpandedView,
              handleCompactView: _vm.handleCompactView,
              handleGroup: _vm.handleGroup,
              changeExpanded: _vm.changeExpanded,
              editBuilding: _vm.editBuilding,
              handleItemClick: _vm.handleItemClick,
              handleClickFloor: _vm.handleClickFloor,
              handleFloorsChange: _vm.handleFloorsChange,
            },
          }),
        ],
        1
      ),
      _vm._v(" "),
      _c(
        "div",
        { staticClass: "padding-0", class: _vm.colRight },
        [
          _c("LayoutRight", {
            ref: "layoutRight",
            attrs: {
              token: this.token,
              title: this.title,
              groupData: this.selectedGroup,
              floorData: this.floorData,
              currentFloors: _vm.currentFloors,
              viewMode: _vm.viewMode,
            },
            on: { editBuilding: _vm.editBuilding },
          }),
        ],
        1
      ),
      _vm._v(" "),
      _vm.floorData
        ? _c("Modal", {
            attrs: {
              show: _vm.showModalEditFloorplan,
              header: "Floor plan configuration is not finished.",
              body: "Layers are not defined. Please click Edit floorplan below to define.",
              loading: _vm.loading,
              error: _vm.errorMessage,
              buttonText: "Edit floorplan",
            },
            on: { action: _vm.handleActionEditFloorplanModal },
          })
        : _vm._e(),
    ],
    1
  )
}
var layout_structurevue_type_template_id_7369adf8_staticRenderFns = []
layout_structurevue_type_template_id_7369adf8_render._withStripped = true


;// CONCATENATED MODULE: ./assets/js/components/structure/layout-structure.vue?vue&type=template&id=7369adf8&

;// CONCATENATED MODULE: ./assets/js/Helper/GroupHelper.js
const getChildrenGroupIds = (groups) => {
  const groupIds = [];
  groups.forEach((g) => groupIds.push(g.id));
  return groups
    .map((g) => g.group_ids)
    .flat(Infinity)
    .filter((id) => groupIds.includes(id));
}

const getRootGroups = (groups) => {
  const childrenGroupIds = getChildrenGroupIds(groups);

  return groups.filter((g) => !childrenGroupIds.includes(g.id));
};

const getChildrenGroupsByParentGroupId = (groups, id) => {
  const childrenGroupIds = groups
    .filter((g) => g.id == id)
    .map((g) => g.group_ids)
    .flat(Infinity);
  return groups.filter((g) => childrenGroupIds.includes(g.id));
};

const getParentGroupId = (groups, id, parentGroupIds) => {
  groups.forEach((g) => {
    if (g.group_ids.includes(id)) {
      parentGroupIds.push(g);
      getParentGroupId(groups, g.id, parentGroupIds);
    }
  });
  return parentGroupIds;
}

const getParentGroup = (groups, id) => { 
  let parentGroups = [null];
  parentGroups = getParentGroupId(groups, id, parentGroups);
  return parentGroups;
}
// EXTERNAL MODULE: ./node_modules/vue/dist/vue.runtime.esm.js
var vue_runtime_esm = __webpack_require__(144);
;// CONCATENATED MODULE: ./assets/js/store.js


const EventBus = new vue_runtime_esm/* default */.Z();

const store = vue_runtime_esm/* default.observable */.Z.observable({
  amountPeople: 0,
  activeLivePosition: false,
  isShowFloorStackSelector: true,
  currentNav: "",
  selectedFloorplan: null,
  popup: false,
  selectedGroup: null,
  selectedObjects: null,
  selectedScene: null,
  isMoveGroup: false,
  isMoveAllInGroup: false,
});

const storeFunctions = {
  setAmountPeople(val) {
    store.amountPeople = val;
  },

  setActiveLivePosition(val) {
    store.activeLivePosition = val;
  },

  setShowFloorStackSelector(val) {
    store.isShowFloorStackSelector = val;
  },

  setCurrentNav(val) {
    store.currentNav = val;
  },

  setSelectedFloorplan(val) {
    store.selectedFloorplan = val;
  },
  setPopup(val) {
    store.popup = val;
  },
  setSelectedGroup(val) {
    store.selectedGroup = val;
  },
  setSelectedObjects(val) {
    store.setSelectedObjects = val;
  },
  setSelectedScene(val) {
    store.selectedScene = val;
  },
  setIsMoveGroup(val) {
    store.isMoveGroup = val;
    if (val) {
      store.isMoveAllInGroup = !val;
    }
  },
  setIsMoveAllInGroup(val) {
    store.isMoveAllInGroup = val;
    if (val) {
      store.isMoveGroup = !val;
    }
  },
};

;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./assets/js/components/structure/layout-left/layout-left.vue?vue&type=template&id=41ef0d5e&
var layout_leftvue_type_template_id_41ef0d5e_render = function () {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    { staticClass: "layout-left", style: _vm.paddingRight },
    [
      _c("div", { staticClass: "box-header" }, [
        _c("div", { staticClass: "header d-flex" }, [
          _c(
            "div",
            {
              staticClass: "top-header",
              on: {
                click: function ($event) {
                  return _vm.back()
                },
              },
            },
            [
              _c("i", { staticClass: "fa-solid fa-left-long" }),
              _vm._v(" " + _vm._s(_vm.navigator) + "\n      "),
            ]
          ),
          _vm._v(" "),
          _c(
            "div",
            {
              staticClass: "bottom-header d-flex",
              staticStyle: { "justify-content": "space-between" },
            },
            [
              _c(
                "div",
                { staticClass: "d-flex" },
                [
                  _vm.navigator == "Dashboard"
                    ? [_c("i", { staticClass: "fa-solid fa-building" })]
                    : _vm.navigator == "Floorplans"
                    ? [_c("i", { staticClass: "fa-solid fa-layer-group" })]
                    : _vm._e(),
                  _vm._v(" "),
                  _c(
                    "h2",
                    {
                      directives: [
                        {
                          name: "show",
                          rawName: "v-show",
                          value: !_vm.addBuilding,
                          expression: "!addBuilding",
                        },
                      ],
                      staticClass: "title-building",
                    },
                    [
                      _vm._v(
                        "\n            " +
                          _vm._s(_vm.titleSelect) +
                          "\n          "
                      ),
                    ]
                  ),
                  _vm._v(" "),
                  _c("NavSelect", {
                    directives: [
                      {
                        name: "show",
                        rawName: "v-show",
                        value: !_vm.addBuilding,
                        expression: "!addBuilding",
                      },
                    ],
                    ref: "navSelect",
                    attrs: { data: _vm.selectNav },
                    on: { selectBuilding: _vm.selectBuilding },
                  }),
                ],
                2
              ),
              _vm._v(" "),
              this.selectedBuilding &&
              Object.keys(this.selectedBuilding).length > 0
                ? [
                    (_vm.editBuilding ||
                      _vm.addGroup ||
                      _vm.addFloor ||
                      _vm.editFloor ||
                      _vm.addBuilding) &&
                    _vm.expanded
                      ? _c("div", [
                          _c(
                            "button",
                            {
                              staticClass: "btn btn-secondary",
                              on: {
                                click: function ($event) {
                                  return _vm.back()
                                },
                              },
                            },
                            [_vm._v("Cancel")]
                          ),
                          _vm._v(" "),
                          _c(
                            "button",
                            {
                              staticClass: "btn btn-primary",
                              on: {
                                click: function ($event) {
                                  return _vm.submit()
                                },
                              },
                            },
                            [_vm._v("Save")]
                          ),
                        ])
                      : _vm._e(),
                    _vm._v(" "),
                    !(
                      _vm.editBuilding ||
                      _vm.addGroup ||
                      _vm.addFloor ||
                      _vm.editFloor ||
                      _vm.addBuilding
                    ) && _vm.expanded
                      ? _c("div", [
                          _c(
                            "button",
                            {
                              staticClass: "btn btn-primary",
                              attrs: { type: "button" },
                              on: {
                                click: function ($event) {
                                  _vm.showBuildingModal = true
                                },
                              },
                            },
                            [
                              _vm._v(
                                "\n              Remove building\n            "
                              ),
                            ]
                          ),
                          _vm._v(" "),
                          _c(
                            "button",
                            {
                              staticClass: "btn btn-primary",
                              attrs: { type: "button" },
                              on: { click: _vm.handleAddBuilding },
                            },
                            [
                              _vm._v(
                                "\n              Create building\n            "
                              ),
                            ]
                          ),
                          _vm._v(" "),
                          _c(
                            "button",
                            {
                              staticClass: "btn btn-primary",
                              attrs: { type: "button" },
                              on: { click: _vm.handleEditBuilding },
                            },
                            [
                              _vm._v(
                                "\n              Edit building\n            "
                              ),
                            ]
                          ),
                        ])
                      : _vm._e(),
                  ]
                : _vm._e(),
            ],
            2
          ),
        ]),
      ]),
      _vm._v(" "),
      _c("FloorplanList", {
        directives: [
          {
            name: "show",
            rawName: "v-show",
            value: _vm.visibleFloor,
            expression: "visibleFloor",
          },
        ],
        attrs: {
          building: _vm.selectedBuilding,
          groups: _vm.filteredGroups,
          floors: _vm.filteredFloors,
          expanded: _vm.expanded,
          token: _vm.token,
        },
        on: {
          compactClick: _vm.handleCompactClick,
          expandedClick: _vm.handleExpandedClick,
          layoutGroup: _vm.handleGroup,
          addGroup: _vm.handleAddGroup,
          addFloor: _vm.handleAddFloor,
          editFloor: _vm.handleEditFloor,
          handleClickFloorName: _vm.handleClickFloorName,
          onFloorsChange: _vm.handleFloorsChange,
        },
      }),
      _vm._v(" "),
      _c("ListLayer", {
        directives: [
          {
            name: "show",
            rawName: "v-show",
            value: _vm.visibleGroup,
            expression: "visibleGroup",
          },
        ],
        ref: "listLayer",
        attrs: {
          groupData: _vm.filteredGroups,
          floor: _vm.selectedFloor,
          expanded: _vm.expanded,
        },
        on: {
          compactClick: _vm.handleCompactClick,
          expandedClick: _vm.handleExpandedClick,
        },
      }),
      _vm._v(" "),
      _c("EditBuilding", {
        directives: [
          {
            name: "show",
            rawName: "v-show",
            value: _vm.editBuilding,
            expression: "editBuilding",
          },
        ],
        attrs: {
          token: _vm.token,
          project_id: _vm.projectData.id,
          building: _vm.selectedBuilding,
        },
        on: { back: _vm.back },
      }),
      _vm._v(" "),
      _c("AddBuilding", {
        directives: [
          {
            name: "show",
            rawName: "v-show",
            value: _vm.addBuilding,
            expression: "addBuilding",
          },
        ],
        attrs: { token: _vm.token, project_id: _vm.projectData.id },
        on: { refreshBuilding: _vm.handleRefreshBuilding, back: _vm.back },
      }),
      _vm._v(" "),
      _c("AddGroup", {
        directives: [
          {
            name: "show",
            rawName: "v-show",
            value: _vm.addGroup,
            expression: "addGroup",
          },
        ],
        attrs: { token: _vm.token, floorplan: _vm.selectedFloor },
        on: { back: _vm.back },
      }),
      _vm._v(" "),
      _c("AddFloor", {
        directives: [
          {
            name: "show",
            rawName: "v-show",
            value: _vm.addFloor,
            expression: "addFloor",
          },
        ],
        attrs: { token: _vm.token, building: _vm.selectedBuilding },
        on: { back: _vm.back },
      }),
      _vm._v(" "),
      _c("EditFloor", {
        directives: [
          {
            name: "show",
            rawName: "v-show",
            value: _vm.editFloor,
            expression: "editFloor",
          },
        ],
        attrs: {
          token: _vm.token,
          building: _vm.selectedBuilding,
          floorplan: _vm.editSelectedFloor,
        },
        on: { back: _vm.back },
      }),
      _vm._v(" "),
      [
        _c("Modal", {
          attrs: {
            show: _vm.showBuildingModal,
            header: "Remove Building",
            body:
              "Are you sure you want to remove building <b>" +
              (this.selectedBuilding ? this.selectedBuilding.name : "") +
              "</b> ?",
            loading: _vm.loading,
            error: _vm.errorMessage,
          },
          on: {
            no: function ($event) {
              _vm.showBuildingModal = false
            },
            yes: _vm.handleDeleteBuilding,
          },
        }),
      ],
    ],
    2
  )
}
var layout_leftvue_type_template_id_41ef0d5e_staticRenderFns = []
layout_leftvue_type_template_id_41ef0d5e_render._withStripped = true


;// CONCATENATED MODULE: ./assets/js/components/structure/layout-left/layout-left.vue?vue&type=template&id=41ef0d5e&

;// CONCATENATED MODULE: ./assets/js/constant.js
const API_DOMAIN_SUMMA = "http://cloud.summa.systems:5001";
const API_DOMAIN_MANIFERA = "https://portal-api.summa.systems";
const SOCKET_DOMAIN_MANIFERA = "wss://portal-api.summa.systems/";

;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./assets/js/components/structure/popup/modal.vue?vue&type=template&id=0384936a&
var modalvue_type_template_id_0384936a_render = function () {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("Transition", { attrs: { name: "modal" } }, [
    _vm.show
      ? _c("div", { staticClass: "modal-mask" }, [
          _c("div", { staticClass: "modal-wrapper" }, [
            _c("div", { staticClass: "modal-container" }, [
              _c("div", { staticClass: "modal-header" }, [
                _c("h2", { staticClass: "title-building" }, [
                  _vm._v(_vm._s(_vm.header)),
                ]),
              ]),
              _vm._v(" "),
              _c(
                "div",
                { staticClass: "modal-body" },
                [
                  _vm._t("body", [
                    _c("div", { domProps: { innerHTML: _vm._s(_vm.body) } }),
                  ]),
                ],
                2
              ),
              _vm._v(" "),
              _c(
                "div",
                { staticClass: "modal-footer" },
                [
                  _vm._t("footer", [
                    _vm.error
                      ? _c("div", { staticClass: "alert w-100 alert-danger" }, [
                          _vm._v(
                            "\n              " +
                              _vm._s(_vm.error) +
                              "\n            "
                          ),
                        ])
                      : _vm._e(),
                    _vm._v(" "),
                    _c(
                      "div",
                      { staticClass: "d-flex w-100 justify-content-between" },
                      [
                        _c("div", [
                          _vm.loading
                            ? _c("div", { staticClass: "spinner-border" })
                            : _vm._e(),
                        ]),
                        _vm._v(" "),
                        _c("div", [
                          _vm.buttonText != ""
                            ? _c("div", [
                                _c(
                                  "button",
                                  {
                                    staticClass: "btn btn-primary",
                                    on: {
                                      click: function ($event) {
                                        return _vm.$emit("action")
                                      },
                                    },
                                  },
                                  [
                                    _vm._v(
                                      "\n                    " +
                                        _vm._s(_vm.buttonText) +
                                        "\n                  "
                                    ),
                                  ]
                                ),
                              ])
                            : _c("div", [
                                _c(
                                  "button",
                                  {
                                    staticClass: "btn btn-primary me-2",
                                    on: {
                                      click: function ($event) {
                                        return _vm.$emit("no")
                                      },
                                    },
                                  },
                                  [
                                    _vm._v(
                                      "\n                    No \n                  "
                                    ),
                                  ]
                                ),
                                _vm._v(" "),
                                _c(
                                  "button",
                                  {
                                    staticClass: "btn btn-light",
                                    on: {
                                      click: function ($event) {
                                        return _vm.$emit("yes")
                                      },
                                    },
                                  },
                                  [
                                    _vm._v(
                                      "\n                    Yes\n                  "
                                    ),
                                  ]
                                ),
                              ]),
                        ]),
                      ]
                    ),
                  ]),
                ],
                2
              ),
            ]),
          ]),
        ])
      : _vm._e(),
  ])
}
var modalvue_type_template_id_0384936a_staticRenderFns = []
modalvue_type_template_id_0384936a_render._withStripped = true


;// CONCATENATED MODULE: ./assets/js/components/structure/popup/modal.vue?vue&type=template&id=0384936a&

;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/index.js??vue-loader-options!./assets/js/components/structure/popup/modal.vue?vue&type=script&lang=js&
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ const modalvue_type_script_lang_js_ = ({
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    header: {
      type: String,
      default: "",
    },
    body: {
      type: String,
      default: "",
    },
    footer: {
      type: String,
      default: "",
    },
    error: {
      type: String,
      default: "",
    },
    loading: {
      type: Boolean,
      default: false,
    },
    buttonText: {
      type: String,
      default: "",
    },
  },
});

;// CONCATENATED MODULE: ./assets/js/components/structure/popup/modal.vue?vue&type=script&lang=js&
 /* harmony default export */ const popup_modalvue_type_script_lang_js_ = (modalvue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/runtime/componentNormalizer.js
/* globals __VUE_SSR_CONTEXT__ */

// IMPORTANT: Do NOT use ES2015 features in this file (except for modules).
// This module is a runtime utility for cleaner component module output and will
// be included in the final webpack user bundle.

function normalizeComponent(
  scriptExports,
  render,
  staticRenderFns,
  functionalTemplate,
  injectStyles,
  scopeId,
  moduleIdentifier /* server only */,
  shadowMode /* vue-cli only */
) {
  // Vue.extend constructor export interop
  var options =
    typeof scriptExports === 'function' ? scriptExports.options : scriptExports

  // render functions
  if (render) {
    options.render = render
    options.staticRenderFns = staticRenderFns
    options._compiled = true
  }

  // functional template
  if (functionalTemplate) {
    options.functional = true
  }

  // scopedId
  if (scopeId) {
    options._scopeId = 'data-v-' + scopeId
  }

  var hook
  if (moduleIdentifier) {
    // server build
    hook = function (context) {
      // 2.3 injection
      context =
        context || // cached call
        (this.$vnode && this.$vnode.ssrContext) || // stateful
        (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext) // functional
      // 2.2 with runInNewContext: true
      if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
        context = __VUE_SSR_CONTEXT__
      }
      // inject component styles
      if (injectStyles) {
        injectStyles.call(this, context)
      }
      // register component module identifier for async chunk inferrence
      if (context && context._registeredComponents) {
        context._registeredComponents.add(moduleIdentifier)
      }
    }
    // used by ssr in case component is cached and beforeCreate
    // never gets called
    options._ssrRegister = hook
  } else if (injectStyles) {
    hook = shadowMode
      ? function () {
          injectStyles.call(
            this,
            (options.functional ? this.parent : this).$root.$options.shadowRoot
          )
        }
      : injectStyles
  }

  if (hook) {
    if (options.functional) {
      // for template-only hot-reload because in that case the render fn doesn't
      // go through the normalizer
      options._injectStyles = hook
      // register for functional component in vue file
      var originalRender = options.render
      options.render = function renderWithStyleInjection(h, context) {
        hook.call(context)
        return originalRender(h, context)
      }
    } else {
      // inject component registration as beforeCreate hook
      var existing = options.beforeCreate
      options.beforeCreate = existing ? [].concat(existing, hook) : [hook]
    }
  }

  return {
    exports: scriptExports,
    options: options
  }
}

;// CONCATENATED MODULE: ./assets/js/components/structure/popup/modal.vue





/* normalize component */
;
var component = normalizeComponent(
  popup_modalvue_type_script_lang_js_,
  modalvue_type_template_id_0384936a_render,
  modalvue_type_template_id_0384936a_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const modal = (component.exports);
;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./assets/js/components/structure/layout-left/layout-left-list.vue?vue&type=template&id=07c33907&
var layout_left_listvue_type_template_id_07c33907_render = function () {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    { ref: "width", staticClass: "contain-list" },
    [
      _c("div", { staticClass: "d-flex middle" }, [
        _c("div", { staticClass: "d-flex box-title", style: _vm.widthLeft }, [
          _c(
            "div",
            {
              directives: [
                {
                  name: "show",
                  rawName: "v-show",
                  value: _vm.expanded,
                  expression: "expanded",
                },
              ],
              staticClass: "expanded-view",
              on: {
                click: function ($event) {
                  return _vm.compactClick()
                },
              },
            },
            [
              _c("i", { staticClass: "fa-solid fa-arrow-left" }),
              _vm._v("  Compact View\n      "),
            ]
          ),
          _vm._v(" "),
          _c("div", { staticClass: "title" }, [_vm._v("Floorplans")]),
          _vm._v(" "),
          _c(
            "div",
            {
              directives: [
                {
                  name: "show",
                  rawName: "v-show",
                  value: !_vm.expanded,
                  expression: "!expanded",
                },
              ],
              staticClass: "expanded-view",
              on: {
                click: function ($event) {
                  return _vm.expandedClick()
                },
              },
            },
            [
              _vm._v("\n        Expanded View "),
              _c("i", { staticClass: "fa-solid fa-arrow-right" }),
            ]
          ),
        ]),
        _vm._v(" "),
        _c("div", [
          _c(
            "button",
            {
              directives: [
                {
                  name: "show",
                  rawName: "v-show",
                  value: _vm.expanded,
                  expression: "expanded",
                },
              ],
              staticClass: "btn btn-primary",
              attrs: { type: "button" },
              on: { click: _vm.addFloor },
            },
            [
              _c("i", { staticClass: "fa-solid fa-plus" }),
              _vm._v("  Create floorplan\n      "),
            ]
          ),
        ]),
      ]),
      _vm._v(" "),
      _c(
        "div",
        {
          class: {
            "table-floors": !_vm.expanded,
            "table-floors-full": _vm.expanded,
          },
        },
        [
          _c(
            "table",
            {
              directives: [
                {
                  name: "show",
                  rawName: "v-show",
                  value:
                    _vm.floorData && _vm.floorData.length > 0 && _vm.expanded,
                  expression:
                    "\n        floorData && floorData.length > 0 && expanded\n      ",
                },
              ],
              staticClass: "table",
            },
            [
              _c("thead", [
                _c("tr", [
                  _c(
                    "th",
                    {
                      on: {
                        click: function ($event) {
                          return _vm.sort("full_name")
                        },
                      },
                    },
                    [
                      _vm._v("\n            Name  "),
                      _vm.currentSort == "full_name"
                        ? _c("img", {
                            staticClass: "dark-mode-icon",
                            attrs: {
                              src:
                                _vm.currentSortDir == "asc"
                                  ? "/static/icons/sort_asc.svg"
                                  : "/static/icons/sort_desc.svg",
                            },
                          })
                        : _vm._e(),
                    ]
                  ),
                  _vm._v(" "),
                  _c(
                    "th",
                    {
                      on: {
                        click: function ($event) {
                          return _vm.sort("file_name")
                        },
                      },
                    },
                    [_vm._v("File")]
                  ),
                  _vm._v(" "),
                  _c(
                    "th",
                    {
                      on: {
                        click: function ($event) {
                          return _vm.sort("short_name")
                        },
                      },
                    },
                    [_vm._v("Number")]
                  ),
                  _vm._v(" "),
                  _c(
                    "th",
                    {
                      on: {
                        click: function ($event) {
                          return _vm.sort("position")
                        },
                      },
                    },
                    [_vm._v("Position")]
                  ),
                  _vm._v(" "),
                  _c(
                    "th",
                    {
                      on: {
                        click: function ($event) {
                          return _vm.sort("fixture_layer_name")
                        },
                      },
                    },
                    [_vm._v("Fixture Layer")]
                  ),
                  _vm._v(" "),
                  _c(
                    "th",
                    {
                      on: {
                        click: function ($event) {
                          return _vm.sort("floor_layer_name")
                        },
                      },
                    },
                    [_vm._v("Floor Layer")]
                  ),
                  _vm._v(" "),
                  _c("th", [_vm._v("Actions")]),
                  _vm._v(" "),
                  _c("th"),
                ]),
              ]),
              _vm._v(" "),
              _c(
                "tbody",
                _vm._l(_vm.sortedFloors, function (floor) {
                  return _c(
                    "tr",
                    { key: floor.id },
                    [
                      _c(
                        "td",
                        {
                          staticStyle: { cursor: "pointer" },
                          on: {
                            click: function ($event) {
                              return _vm.onClickFloor(floor)
                            },
                          },
                        },
                        [
                          _c("img", {
                            staticClass: "dark-mode-icon",
                            attrs: { src: "/static/icons/layer.svg", alt: "" },
                          }),
                          _vm._v(
                            "  " + _vm._s(floor.full_name) + "\n          "
                          ),
                        ]
                      ),
                      _vm._v(" "),
                      _vm.expanded
                        ? [
                            _c("td", [_vm._v(_vm._s(floor.file_name))]),
                            _vm._v(" "),
                            _c("td", [_vm._v(_vm._s(floor.short_name))]),
                            _vm._v(" "),
                            _c("td", [_vm._v(_vm._s(floor.position))]),
                            _vm._v(" "),
                            _c("td", [
                              _vm._v(_vm._s(floor.fixture_layer_name)),
                            ]),
                            _vm._v(" "),
                            _c("td", [_vm._v(_vm._s(floor.floor_layer_name))]),
                            _vm._v(" "),
                            _c("td", [
                              _c(
                                "a",
                                {
                                  staticClass: "btn",
                                  attrs: { href: floor.download_url },
                                },
                                [
                                  _c("img", {
                                    staticClass: "dark-mode-icon",
                                    attrs: {
                                      src: "/static/icons/download.svg",
                                      alt: "",
                                    },
                                  }),
                                ]
                              ),
                              _vm._v(" "),
                              _c("a", { staticClass: "btn" }, [
                                _c("i", {
                                  directives: [
                                    {
                                      name: "show",
                                      rawName: "v-show",
                                      value: _vm.expanded,
                                      expression: "expanded",
                                    },
                                  ],
                                  staticClass: "fa-solid fa-pen-to-square",
                                  on: {
                                    click: function ($event) {
                                      return _vm.editFloor(floor)
                                    },
                                  },
                                }),
                              ]),
                              _vm._v(" "),
                              _c("a", { staticClass: "btn" }, [
                                _c("i", {
                                  staticClass: "fa-solid fa-trash-can",
                                  on: {
                                    click: function ($event) {
                                      _vm.showFloorplanModal = true
                                      _vm.selectedFloor = floor
                                    },
                                  },
                                }),
                              ]),
                            ]),
                          ]
                        : _vm._e(),
                      _vm._v(" "),
                      _c(
                        "td",
                        {
                          on: {
                            click: function ($event) {
                              return _vm.groupClick(floor)
                            },
                          },
                        },
                        [
                          _c(
                            "a",
                            {
                              staticClass: "total-layer",
                              attrs: { href: "#" },
                            },
                            [_vm._v("layers(8) \n              ")]
                          ),
                        ]
                      ),
                    ],
                    2
                  )
                }),
                0
              ),
            ]
          ),
          _vm._v(" "),
          _c("SlVueTree", {
            directives: [
              {
                name: "show",
                rawName: "v-show",
                value: !_vm.expanded,
                expression: "!expanded",
              },
            ],
            ref: "tree_nodes",
            scopedSlots: _vm._u([
              {
                key: "toggle",
                fn: function (ref) {
                  var node = ref.node
                  return [
                    !node.isLeaf
                      ? _c("span", [
                          node.isExpanded
                            ? _c("div", { attrs: { id: "chevron-arrow-down" } })
                            : _vm._e(),
                          _vm._v(" "),
                          !node.isExpanded
                            ? _c("div", {
                                attrs: { id: "chevron-arrow-right" },
                              })
                            : _vm._e(),
                        ])
                      : _vm._e(),
                  ]
                },
              },
              {
                key: "title",
                fn: function (ref) {
                  var node = ref.node
                  return [
                    node.data.type == "Group" &&
                    (node.isLeaf == false || node.level == 2)
                      ? _c("img", {
                          staticClass: "v-icon dark-mode-icon",
                          attrs: {
                            src: "/static/icons/menu.svg",
                            width: "18",
                            height: "18",
                          },
                        })
                      : _vm._e(),
                    _vm._v(" "),
                    node.data.type == "Group" && node.isLeaf && node.level != 2
                      ? _c("img", {
                          staticClass: "v-icon dark-mode-icon",
                          attrs: {
                            src: "/static/imgs/group.svg",
                            width: "18",
                            height: "18",
                          },
                        })
                      : node.data.type == "Floorplan"
                      ? _c("img", {
                          staticClass: "v-icon dark-mode-icon",
                          attrs: {
                            src: "/static/icons/layer.svg",
                            width: "18",
                            height: "18",
                          },
                        })
                      : _vm._e(),
                    _vm._v(" "),
                    _c(
                      "button",
                      {
                        staticClass: "btn btn-light btn-tree",
                        attrs: { flat: "", small: "" },
                        on: {
                          click: function ($event) {
                            return _vm.onItemClick(node.data)
                          },
                        },
                      },
                      [
                        _c("div", { staticClass: "tree-title" }, [
                          _vm._v(
                            "\n               " +
                              _vm._s(
                                node.data.type == "Group"
                                  ? node.data.name
                                  : node.data.full_name
                              ) +
                              "\n              "
                          ),
                        ]),
                      ]
                    ),
                  ]
                },
              },
            ]),
            model: {
              value: _vm.computedNodes,
              callback: function ($$v) {
                _vm.computedNodes = $$v
              },
              expression: "computedNodes",
            },
          }),
          _vm._v(" "),
          _c(
            "button",
            {
              directives: [
                {
                  name: "show",
                  rawName: "v-show",
                  value: !_vm.expanded,
                  expression: "!expanded",
                },
              ],
              staticClass: "btn btn-primary",
              staticStyle: { float: "right" },
              attrs: { type: "button" },
              on: { click: _vm.addFloor },
            },
            [
              _c("i", { staticClass: "fa-solid fa-plus" }),
              _vm._v("  Create floorplan\n    "),
            ]
          ),
        ],
        1
      ),
      _vm._v(" "),
      _c("Modal", {
        attrs: {
          show: _vm.showFloorplanModal,
          header: "Remove Floorplan",
          body:
            "Are you sure you want to remove floorplan <b>" +
            (this.selectedFloor ? this.selectedFloor.full_name : "") +
            "</b> ?",
          loading: _vm.loading,
          error: _vm.errorMessage,
        },
        on: {
          no: function ($event) {
            _vm.showFloorplanModal = false
          },
          yes: _vm.deleteFloor,
        },
      }),
    ],
    1
  )
}
var layout_left_listvue_type_template_id_07c33907_staticRenderFns = []
layout_left_listvue_type_template_id_07c33907_render._withStripped = true


;// CONCATENATED MODULE: ./assets/js/components/structure/layout-left/layout-left-list.vue?vue&type=template&id=07c33907&

// EXTERNAL MODULE: ./node_modules/sl-vue-tree/dist/sl-vue-tree.js
var sl_vue_tree = __webpack_require__(6823);
var sl_vue_tree_default = /*#__PURE__*/__webpack_require__.n(sl_vue_tree);
;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/index.js??vue-loader-options!./assets/js/components/structure/layout-left/layout-left-list.vue?vue&type=script&lang=js&
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//



const axios = (__webpack_require__(9669)["default"]);


/* harmony default export */ const layout_left_listvue_type_script_lang_js_ = ({
  components: {
    SlVueTree: (sl_vue_tree_default()),
    Modal: modal,
  },
  props: {
    building: {
      default() {
        return {};
      },
    },
    groups: {
      default() {
        return [];
      },
    },
    floors: {
      default() {
        return [];
      },
    },
    expanded: {
      default() {
        return false;
      },
    },
    token: "",
  },

  mounted() {},
  watch: {
    groups(val) {
      this.groupData = val;
    },
    selectedFloorplan(val) {
      this.selectedFloor = val || {};
    },
    building(val) {
      console.log("building: ", val);
      if (val && (!this.selectedBuilding || this.selectedBuilding.id != val.id)) {
        this.selectedBuilding = val;
        this.getFloors();
      }
    }
  },
  data() {
    return {
      showFloorplanModal: false,
      loading: false,
      errorMessage:"",
      groupData: [],
      widthLeft: {},
      currentSortDir: "asc",
      currentSort: "",
      nodes: [],
      selectedFloor: {},
      floorData: [],
      selectedBuilding: null,
    };
  },

  computed: {
    selectedFloorplan() {
      return store.selectedFloorplan;
    },
    sortedFloors: function () {
      let floorplans = this.floorData;
      if (floorplans) {
        return floorplans.sort((a, b) => {
          let modifier = 1;
          if (this.currentSortDir === "desc") modifier = -1;
          if (a[this.currentSort] < b[this.currentSort]) return -1 * modifier;
          if (a[this.currentSort] > b[this.currentSort]) return 1 * modifier;
          return 0;
        });
      } else {
        return [];
      }
    },
    computedNodes() {
      return this.getNodes(this.building, this.groupData, this.floors);
    },
  },

  methods: {
    sort(sortBy) {
      //if s == current sort, reverse
      if (sortBy === this.currentSort) {
        this.currentSortDir = this.currentSortDir === "asc" ? "desc" : "asc";
      }
      this.currentSort = sortBy;
    },
    onClickFloor(v) {
      this.$emit("handleClickFloorName", v);
    },
    getGroup(id) {
      let group = this.groupData.filter((g) => g.id === id);
      return group.length > 0 ? group[0] : null;
    },
    getFloorplansByBuilding(id) {
      return this.floorData.filter((f) => f.building_id === id);
    },
    getGroupsByBuilding(id) {
      return this.groupData.filter((g) => g.building_id === id);
    },
    getGroupsByFile(id) {
      return this.groupData.filter((f) => f.file_id === id);
    },
    parseGroup(id) {
      const group = this.getGroup(id);
      if (!group) {
        return null;
      }
      group["data"] = {
        navigator: "groups",
        ...group
      };
      group["data"] = { ...group["data"], ...group };
      // group['groups'] = [];
      group["isLeaf"] = true;
      group["isExpanded"] = false;
      // group["isSelected"] = store.selectedGroup ? store.selectedGroup.id == id : false;
      group["isDraggable"] = false;
      group["title"] = group.name;
      if (group.group_ids.length > 0 || group.device_ids.length > 0) {
        group["children"] = [];
        for (let i = 0; i < group.group_ids.length; i++) {
          let child = this.parseGroup(group.group_ids[i]);
          if (child) {
            group["isLeaf"] = false;
            group["isExpanded"] = true;
            group["children"].push(child);
          }
          // group['groups'][i] = this.parseGroup(group.group_ids[i]);
        }
      } else {
        // isleaf
        group["isLeaf"] = true;
      }
      return group;
    },
    groupDataByFile(id) {
      let groupNodes = [];
      let childGroups = [];
      let filteredGroup = this.getGroupsByFile(id);

      if (filteredGroup.length > 0) {
        filteredGroup.forEach((group) => {
          childGroups.push(...group.group_ids);
        });

        filteredGroup.forEach((group) => {
          if (!childGroups.includes(group.id)) {
            groupNodes.push(this.parseGroup(group.id));
          }
        });
      }
      return groupNodes;
    },
    getNodes(building, groups, floors) {
      this.nodes = [];
      let floorplans = this.getFloorplansByBuilding(building.id);
      floorplans.forEach((floorplan) => {
        let newFloorplan = floorplan;
        newFloorplan["type"] = "Floorplan";
        newFloorplan["navigator"] = "files";
        let groupNodes = this.groupDataByFile(floorplan.id);
        let data = {
          title: newFloorplan.full_name,
          isDraggable: false,
          isExpanded: this.selectedFloor.id == floorplan.id,
          isSelected: this.selectedFloor.id == floorplan.id,
          children: groupNodes,
          isLeaf: groupNodes.length == 0,
          data: newFloorplan,
        };
        this.nodes.push(data);
      });
      return this.nodes;
    },
    expandedClick() {
      this.$emit("expandedClick");
      // this.$root.$children[0].popup = false;
      storeFunctions.setPopup(false);
      // this.$root.$children[0].floorData = null;
      // this.$root.$children[0].groupData = {};
      storeFunctions.setSelectedGroup(null);
      this.widthLeft = { width: "285px" };
    },
    compactClick() {
      this.$emit("compactClick");
      this.widthLeft = { width: "100%" };
    },
    groupClick(obj) {
      this.$emit("layoutGroup", obj);
    },
    addGroup(obj) {
      this.$emit("addGroup", obj);
    },
    addFloor() {
      this.$emit("addFloor");
    },
    editFloor(obj) {
      this.$emit("editFloor", obj);
    },
    async deleteFloor(){
      const token = this.token || "";
      axios.defaults.headers.common["Authorization"] = token;
      axios.defaults.headers.post["Content-Type"] =
          "application/x-www-form-urlencoded";
      this.loading = true;
      await axios
        .delete(
            `${API_DOMAIN_MANIFERA}/api/v1/files/${this.selectedFloor.id}`
        )
        .then((response) => {
          this.showFloorplanModal = false;
          this.getFloors();
          this.loading = false;
        })
        .catch((error) => {
            // handle error
            this.errorMessage = 'Failed to delete floorplan';
        })
      this.loading = false;
    },
    async getFloors() {
      axios.defaults.headers.common["Authorization"] = this.token;
      axios.defaults.headers.post["Content-Type"] =
        "application/x-www-form-urlencoded";
      this.loading = true;
      await axios
        .get(
          `${API_DOMAIN_MANIFERA}/api/v1/files?building_id=${this.building.id}`
        )
        .then((response) => {
          this.$parent.back();
          this.floorData = response.data;
          this.$emit("onFloorsChange", response.data);
          this.loading = false;
        })
        .catch((error) => {});
      this.loading = false;
    },
    onItemClick(obj) {
      if (obj.type == "Group") {
        let selectedFloor = this.floorData.filter(
          (f) => f.id == obj.file_id
        );
        if (selectedFloor.length > 0) {
          this.selectedFloor = selectedFloor[0];
          storeFunctions.setSelectedFloorplan(this.selectedFloor);
          EventBus.$emit("handleItemClick", obj, this.selectedFloor);
        } else {
          EventBus.$emit("handleItemClick", obj, null);
        }
      } else {
        let selectedFloor = this.floorData.filter(
          (f) => f.id == obj.id
        );
        if (selectedFloor.length > 0) {
          this.selectedFloor = selectedFloor[0];
        }
        EventBus.$emit("handleItemClick", obj, null);
      }
    },
    updateGroups(newGroups) {
      let oldGroups = [];
      let addedGroups = [];
      let recentlyAddedGroups = {};
      let groupByFile = {};
      let fileId = 0;

      if (newGroups.length > 0) {
        fileId = newGroups[0].file_id;
      }

      this.groupData.forEach((group) => {
        if (!addedGroups.includes(group.id)) {
          addedGroups.push(group.id);
        }
        if (!groupByFile[group.file_id]) {
          groupByFile[group.file_id] = [];
        } else {
          groupByFile[group.file_id].push(group);
        }
      });

      newGroups.forEach((group) => {
        if (!addedGroups.includes(group.id)) {
          recentlyAddedGroups[group.id] = group;
        }
      });

      this.groupData.forEach((group) => {
        let newGroup = newGroups.find((g) => g.id == group.id);
        if (newGroup) {
          oldGroups.push({ ...group, ...newGroup });
        } else {
          let deletedGroup = [];
          if (fileId && fileId == group.file_id) {
            let fileGroups = groupByFile[group.file_id];
            if (fileGroups.length>0) {
              fileGroups.forEach((g)=> {
                let findGroup = newGroups.find((newGroup) => g.id == newGroup.id);
                if (!findGroup && !deletedGroup.includes(g.id)) {
                  deletedGroup.push(g.id);
                }
              })
            }
          }

          if (!deletedGroup.includes(group.id)) {
            oldGroups.push(group);
          }
        }
      });

      if (Object.keys(recentlyAddedGroups).length > 0) {
        Object.values(recentlyAddedGroups).forEach((group) => {
          oldGroups.push(group);
        });
      }

      this.groupData = oldGroups;
    },

    updateFloorData() {
      this.$parent.back();
      this.getFloors();
    },
    
    updateSelectedGroup(groups, floorplan) {
      let groupIds = [];

      if (groups.length) {
        groups.forEach((group) => {
          groupIds.push(group.id);
        });
      }
      this.$refs.tree_nodes.traverse((node, nodeModel, path) => {
        if (groups.length > 0) {
          if (node.data.type == "Group" && groupIds.includes(node.data.id)) {
            this.$refs.tree_nodes.select(node.path, groups.length !== 1);
          }
        } else {
          if (floorplan && node.data.type == "Floorplan" && node.data.id == floorplan.id) {
            this.$refs.tree_nodes.select(node.path, false);
          }
        }
      });
    },

    updateTitleTreeNode(data) {
      this.$parent.back();
      this.$refs.tree_nodes.traverse((node, nodeModel, path) => {
        console.log(data)
        data.forEach((d) => {
          if (node.data.id == d.id && node.data.type == 'Floorplan') {
          this.$refs.tree_nodes.updateNode(node.path, {
              data: {
                  ...d,
                  navigator: node.data.navigator,
              }
            });
          }
        });
      });
    },
    updateTreeNode(data) {
      this.$refs.tree_nodes.traverse((node, nodeModel, path) => {
        data.forEach((d) => {
          if (node.data.id == d.id && node.data.type == "Group") {
            this.$refs.tree_nodes.updateNode(node.path, {
              data: {
                ...d,
                navigator: node.data.navigator,
              },
            });
          }
        });
      });
    },
  },
  created() {
    EventBus.$on("updateTreeNode", this.updateTreeNode);
    EventBus.$on("updateGroups", this.updateGroups);
    EventBus.$on("updateFloorData", this.updateFloorData);
    EventBus.$on("updateSelectedGroup", this.updateSelectedGroup);
    EventBus.$on("compactClick", this.compactClick);
  },
  destroyed() {
    EventBus.$off("updateTreeNode", this.updateTreeNode);
    EventBus.$off("updateGroups", this.updateGroups);
    EventBus.$off("updateFloorData", this.updateFloorData);
    EventBus.$off("updateSelectedGroup", this.updateSelectedGroup);
    EventBus.$off("compactClick", this.compactClick);
  },
});

;// CONCATENATED MODULE: ./assets/js/components/structure/layout-left/layout-left-list.vue?vue&type=script&lang=js&
 /* harmony default export */ const layout_left_layout_left_listvue_type_script_lang_js_ = (layout_left_listvue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./assets/js/components/structure/layout-left/layout-left-list.vue





/* normalize component */
;
var layout_left_list_component = normalizeComponent(
  layout_left_layout_left_listvue_type_script_lang_js_,
  layout_left_listvue_type_template_id_07c33907_render,
  layout_left_listvue_type_template_id_07c33907_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const layout_left_list = (layout_left_list_component.exports);
;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./assets/js/components/structure/layout-left/layer-list.vue?vue&type=template&id=70ff9187&
var layer_listvue_type_template_id_70ff9187_render = function () {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    {
      ref: "width",
      staticClass: "contain-list row table-floors",
      staticStyle: { "align-items": "normal" },
    },
    [
      _c(
        "div",
        {
          class: {
            "col-12": !this.expanded,
            "col-4": this.expanded,
          },
        },
        [
          _c("div", { staticClass: "d-flex middle" }, [
            _c(
              "div",
              { staticClass: "d-flex box-title", style: _vm.widthLeft },
              [_c("div", { staticClass: "title" }, [_vm._v("Layers")])]
            ),
          ]),
          _vm._v(" "),
          _c("table", { staticClass: "table" }, [
            _c(
              "tbody",
              _vm._l(_vm.groupData, function (layer) {
                return _c("tr", { key: layer.id }, [
                  _c("td", [
                    _c("img", {
                      attrs: { src: "/static/icons/menu.png", alt: "" },
                    }),
                    _vm._v("  " + _vm._s(layer.name) + "\n          "),
                  ]),
                  _vm._v(" "),
                  _c(
                    "td",
                    {
                      on: {
                        click: function ($event) {
                          return _vm.groupClick(layer)
                        },
                      },
                    },
                    [_vm._m(0, true)]
                  ),
                ])
              }),
              0
            ),
          ]),
          _vm._v(" "),
          _c(
            "button",
            {
              directives: [
                {
                  name: "show",
                  rawName: "v-show",
                  value: !this.expanded,
                  expression: "!this.expanded",
                },
              ],
              staticClass: "btn btn-primary",
              staticStyle: { float: "right" },
              attrs: { type: "button" },
            },
            [
              _c("i", { staticClass: "fa-solid fa-plus" }),
              _vm._v("  Add layer\n    "),
            ]
          ),
        ]
      ),
      _vm._v(" "),
      _c(
        "div",
        {
          directives: [
            {
              name: "show",
              rawName: "v-show",
              value: this.expanded,
              expression: "this.expanded",
            },
          ],
          staticClass: "col-8 box-detail-floor",
        },
        [
          _vm._m(1),
          _vm._v(" "),
          _c("div", { staticClass: "row" }, [
            _c("div", { staticClass: "col-4" }, [
              _c("h6", [_vm._v("Name")]),
              _vm._v(" "),
              _c("p", [_vm._v(_vm._s(this.floor.full_name))]),
            ]),
            _vm._v(" "),
            _c("div", { staticClass: "col-4" }, [
              _c("h6", [_vm._v("Number")]),
              _vm._v(" "),
              _c("p", [_vm._v(_vm._s(this.floor.id))]),
            ]),
            _vm._v(" "),
            _c("div", { staticClass: "col-4" }, [
              _c("h6", [_vm._v("Order Position")]),
              _vm._v(" "),
              _c("p", [_vm._v(_vm._s(this.floor.position))]),
            ]),
          ]),
          _vm._v(" "),
          _c("div", { staticClass: "row" }, [
            _c("div", { staticClass: "col-4" }, [
              _c("h6", [_vm._v("Layer Name")]),
              _vm._v(" "),
              _c("p", [_vm._v(_vm._s(this.floor.layer_names))]),
            ]),
            _vm._v(" "),
            _c("div", { staticClass: "col-4" }, [
              _c("h6", [_vm._v("Sensor Layer Name")]),
              _vm._v(" "),
              _c("p", [_vm._v(_vm._s(this.floor.sensor_layer_name))]),
            ]),
            _vm._v(" "),
            _c("div", { staticClass: "col-4" }, [
              _c("h6", [_vm._v("Fixture Layer Name")]),
              _vm._v(" "),
              _c("p", [_vm._v(_vm._s(this.floor.fixture_layer_name))]),
            ]),
          ]),
        ]
      ),
    ]
  )
}
var layer_listvue_type_template_id_70ff9187_staticRenderFns = [
  function () {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("a", { staticClass: "total-layer", attrs: { href: "#" } }, [
      _vm._v("groups(8) "),
      _c("i", { staticClass: "fa-solid fa-chevron-right" }),
    ])
  },
  function () {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("div", { staticClass: "d-flex" }, [
      _c("div", { staticClass: "d-flex box-title" }, [
        _c("div", { staticClass: "title" }, [_vm._v("Floor Details")]),
      ]),
    ])
  },
]
layer_listvue_type_template_id_70ff9187_render._withStripped = true


;// CONCATENATED MODULE: ./assets/js/components/structure/layout-left/layer-list.vue?vue&type=template&id=70ff9187&

;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/index.js??vue-loader-options!./assets/js/components/structure/layout-left/layer-list.vue?vue&type=script&lang=js&
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ const layer_listvue_type_script_lang_js_ = ({
  props: {
    groupData: {
      default() {
        return () => [];
      },
    },
    expanded: {
      type: Boolean,
      default: false,
    },
    floor: {
      default() {
        return {};
      },
    },
  },

  mounted() {},
  watch: {},
  data() {
    return {
      widthLeft: {},
      col: "col-4",
    };
  },

  computed: {},

  methods: {
    expandedClick(status) {
      // console.log("!231", status);
      this.$emit("expandedClick");
      this.expanded = true;
      this.widthLeft = { width: "285px" };
    },
    compactClick(status) {
      // console.log("!====", status);
      this.$emit("compactClick");
      this.expanded = false;
      this.widthLeft = { width: "100%" };
    },
    groupClick(id) {
      //this.$emit("layoutGroup", id);
    },
  },
});

;// CONCATENATED MODULE: ./assets/js/components/structure/layout-left/layer-list.vue?vue&type=script&lang=js&
 /* harmony default export */ const layout_left_layer_listvue_type_script_lang_js_ = (layer_listvue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./assets/js/components/structure/layout-left/layer-list.vue





/* normalize component */
;
var layer_list_component = normalizeComponent(
  layout_left_layer_listvue_type_script_lang_js_,
  layer_listvue_type_template_id_70ff9187_render,
  layer_listvue_type_template_id_70ff9187_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const layer_list = (layer_list_component.exports);
;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./assets/js/components/structure/nav-select.vue?vue&type=template&id=03900d9e&
var nav_selectvue_type_template_id_03900d9e_render = function () {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { staticClass: "nav" }, [
    _c(
      "ul",
      _vm._l(_vm.data, function (building) {
        return _c(
          "li",
          {
            key: building.id,
            on: {
              click: function ($event) {
                return _vm.selectBuilding(building)
              },
            },
          },
          [
            building.full_name
              ? [
                  _c("i", { staticClass: "fa-solid fa-layer-group" }),
                  _vm._v(" "),
                  _c("span", [_vm._v(_vm._s(building.full_name))]),
                ]
              : [
                  _c("i", { staticClass: "fa-solid fa-building" }),
                  _vm._v(" "),
                  _c("span", [_vm._v(_vm._s(building.name))]),
                ],
          ],
          2
        )
      }),
      0
    ),
  ])
}
var nav_selectvue_type_template_id_03900d9e_staticRenderFns = []
nav_selectvue_type_template_id_03900d9e_render._withStripped = true


;// CONCATENATED MODULE: ./assets/js/components/structure/nav-select.vue?vue&type=template&id=03900d9e&

;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/index.js??vue-loader-options!./assets/js/components/structure/nav-select.vue?vue&type=script&lang=js&
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ const nav_selectvue_type_script_lang_js_ = ({
  props: {
    data: {},
  },

  mounted() {},
  watch: {},
  data() {
    return {
      
    };
  },

  methods: {
    selectBuilding(building) {
      this.$emit("selectBuilding", building);
    },
  },
});

;// CONCATENATED MODULE: ./assets/js/components/structure/nav-select.vue?vue&type=script&lang=js&
 /* harmony default export */ const structure_nav_selectvue_type_script_lang_js_ = (nav_selectvue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./assets/js/components/structure/nav-select.vue





/* normalize component */
;
var nav_select_component = normalizeComponent(
  structure_nav_selectvue_type_script_lang_js_,
  nav_selectvue_type_template_id_03900d9e_render,
  nav_selectvue_type_template_id_03900d9e_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const nav_select = (nav_select_component.exports);
;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./assets/js/components/structure/buildings/building-edit.vue?vue&type=template&id=70c19bee&
var building_editvue_type_template_id_70c19bee_render = function () {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { staticClass: "layout-center" }, [
    _c("div", { staticClass: "form-update" }, [
      _c("div", { staticClass: "title" }, [
        _c("h4", [_vm._v("Building Details " + _vm._s(_vm.project_id))]),
      ]),
      _vm._v(" "),
      _c(
        "form",
        {
          on: {
            submit: function ($event) {
              $event.preventDefault()
              return _vm.updateBuilding()
            },
          },
        },
        [
          _c("div", { staticClass: "row" }, [
            _c("div", { staticClass: "col-lg-4 col-sm-12" }, [
              _vm._m(0),
              _vm._v(" "),
              _c("input", {
                directives: [
                  {
                    name: "model",
                    rawName: "v-model",
                    value: _vm.computedBuilding.name,
                    expression: "computedBuilding.name",
                  },
                ],
                staticClass: "form-control",
                attrs: {
                  type: "text",
                  id: "building_name",
                  name: "building_name",
                  placeholder: "Building name",
                },
                domProps: { value: _vm.computedBuilding.name },
                on: {
                  input: function ($event) {
                    if ($event.target.composing) {
                      return
                    }
                    _vm.$set(_vm.computedBuilding, "name", $event.target.value)
                  },
                },
              }),
            ]),
            _vm._v(" "),
            _c("div", { staticClass: "col-lg-4 col-sm-12" }, [
              _vm._m(1),
              _vm._v(" "),
              _c("input", {
                directives: [
                  {
                    name: "model",
                    rawName: "v-model",
                    value: _vm.computedBuilding.address,
                    expression: "computedBuilding.address",
                  },
                ],
                staticClass: "form-control",
                attrs: {
                  type: "text",
                  id: "building_address",
                  name: "building_address",
                  placeholder: "Building address",
                },
                domProps: { value: _vm.computedBuilding.address },
                on: {
                  input: function ($event) {
                    if ($event.target.composing) {
                      return
                    }
                    _vm.$set(
                      _vm.computedBuilding,
                      "address",
                      $event.target.value
                    )
                  },
                },
              }),
            ]),
            _vm._v(" "),
            _c("div", { staticClass: "col-lg-4 col-sm-12" }, [
              _vm._m(2),
              _vm._v(" "),
              _c("input", {
                directives: [
                  {
                    name: "model",
                    rawName: "v-model",
                    value: _vm.computedBuilding.position,
                    expression: "computedBuilding.position",
                  },
                ],
                staticClass: "form-control",
                attrs: {
                  type: "number",
                  min: "0",
                  id: "order_position",
                  name: "order_position",
                  placeholder: "Order Position",
                },
                domProps: { value: _vm.computedBuilding.position },
                on: {
                  input: function ($event) {
                    if ($event.target.composing) {
                      return
                    }
                    _vm.$set(
                      _vm.computedBuilding,
                      "position",
                      $event.target.value
                    )
                  },
                },
              }),
            ]),
          ]),
        ]
      ),
    ]),
  ])
}
var building_editvue_type_template_id_70c19bee_staticRenderFns = [
  function () {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c(
      "label",
      { staticClass: "form-label", attrs: { for: "building_name" } },
      [
        _vm._v("Name  "),
        _c("i", {
          staticClass: "fa fa-question-circle",
          attrs: { "aria-hidden": "true" },
        }),
      ]
    )
  },
  function () {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c(
      "label",
      { staticClass: "form-label", attrs: { for: "building_address" } },
      [
        _vm._v("Address  "),
        _c("i", {
          staticClass: "fa fa-question-circle",
          attrs: { "aria-hidden": "true" },
        }),
      ]
    )
  },
  function () {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c(
      "label",
      { staticClass: "form-label", attrs: { for: "order_position" } },
      [
        _vm._v("Order Position  "),
        _c("i", {
          staticClass: "fa fa-question-circle",
          attrs: { "aria-hidden": "true" },
        }),
      ]
    )
  },
]
building_editvue_type_template_id_70c19bee_render._withStripped = true


;// CONCATENATED MODULE: ./assets/js/components/structure/buildings/building-edit.vue?vue&type=template&id=70c19bee&

;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/index.js??vue-loader-options!./assets/js/components/structure/buildings/building-edit.vue?vue&type=script&lang=js&
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

const building_editvue_type_script_lang_js_axios = (__webpack_require__(9669)["default"]);


/* harmony default export */ const building_editvue_type_script_lang_js_ = ({
  props: {
    token: "",
    building: {
      type: Object,
      default() {
        return {};
      }
    },
    project_id: 0,
  },

  mounted() {
    
  },

  computed: {
    computedBuilding() {
      return this.building;
    },
  },

  created() {
    this.$parent.$on('save', (data) => {
      this.updateBuilding();
    });
   },

  data() {
    return {
      selectedBuilding: {},
    };
  },

  methods: {
    updateBuilding() {
      const token = this.token || "";
      building_editvue_type_script_lang_js_axios.defaults.headers.common["Authorization"] = token;
      building_editvue_type_script_lang_js_axios.defaults.headers.post["Content-Type"] =
        "application/x-www-form-urlencoded";
      building_editvue_type_script_lang_js_axios
        .put(
          `${API_DOMAIN_MANIFERA}/api/v1/buildings/${this.computedBuilding.id}`, this.computedBuilding
        )
        .then((response) => {
          this.$emit('back');
          alert('Building Updated')
        })
        .catch((error) => {
          // handle error
          alert('Failed to update building');
        })
    },
  },
});

;// CONCATENATED MODULE: ./assets/js/components/structure/buildings/building-edit.vue?vue&type=script&lang=js&
 /* harmony default export */ const buildings_building_editvue_type_script_lang_js_ = (building_editvue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./assets/js/components/structure/buildings/building-edit.vue





/* normalize component */
;
var building_edit_component = normalizeComponent(
  buildings_building_editvue_type_script_lang_js_,
  building_editvue_type_template_id_70c19bee_render,
  building_editvue_type_template_id_70c19bee_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const building_edit = (building_edit_component.exports);
;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./assets/js/components/structure/buildings/add-building.vue?vue&type=template&id=b8871262&
var add_buildingvue_type_template_id_b8871262_render = function () {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    { staticClass: "layout-center", staticStyle: { "padding-top": "24px" } },
    [
      _c("div", { staticClass: "form-update" }, [
        _c(
          "form",
          {
            on: {
              submit: function ($event) {
                $event.preventDefault()
                return _vm.createBuilding()
              },
            },
          },
          [
            _c("div", { staticClass: "row" }, [
              _c("div", { staticClass: "col-lg-4 col-sm-12" }, [
                _vm._m(0),
                _vm._v(" "),
                _c("input", {
                  directives: [
                    {
                      name: "model",
                      rawName: "v-model",
                      value: _vm.building.name,
                      expression: "building.name",
                    },
                  ],
                  staticClass: "form-control",
                  attrs: {
                    type: "text",
                    id: "building_name",
                    name: "building_name",
                    placeholder: "Building name",
                  },
                  domProps: { value: _vm.building.name },
                  on: {
                    input: function ($event) {
                      if ($event.target.composing) {
                        return
                      }
                      _vm.$set(_vm.building, "name", $event.target.value)
                    },
                  },
                }),
              ]),
              _vm._v(" "),
              _c("div", { staticClass: "col-lg-4 col-sm-12" }, [
                _vm._m(1),
                _vm._v(" "),
                _c("input", {
                  directives: [
                    {
                      name: "model",
                      rawName: "v-model",
                      value: _vm.building.address,
                      expression: "building.address",
                    },
                  ],
                  staticClass: "form-control",
                  attrs: {
                    type: "text",
                    id: "building_address",
                    name: "building_address",
                    placeholder: "Building address",
                  },
                  domProps: { value: _vm.building.address },
                  on: {
                    input: function ($event) {
                      if ($event.target.composing) {
                        return
                      }
                      _vm.$set(_vm.building, "address", $event.target.value)
                    },
                  },
                }),
              ]),
              _vm._v(" "),
              _c("div", { staticClass: "col-lg-4 col-sm-12" }, [
                _vm._m(2),
                _vm._v(" "),
                _c("input", {
                  directives: [
                    {
                      name: "model",
                      rawName: "v-model",
                      value: _vm.building.position,
                      expression: "building.position",
                    },
                  ],
                  staticClass: "form-control",
                  attrs: {
                    type: "number",
                    min: "0",
                    id: "order_position",
                    name: "order_position",
                    placeholder: "Order Position",
                  },
                  domProps: { value: _vm.building.position },
                  on: {
                    input: function ($event) {
                      if ($event.target.composing) {
                        return
                      }
                      _vm.$set(_vm.building, "position", $event.target.value)
                    },
                  },
                }),
              ]),
            ]),
          ]
        ),
      ]),
    ]
  )
}
var add_buildingvue_type_template_id_b8871262_staticRenderFns = [
  function () {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c(
      "label",
      { staticClass: "form-label", attrs: { for: "building_name" } },
      [
        _vm._v("Name  "),
        _c("i", {
          staticClass: "fa fa-question-circle",
          attrs: { "aria-hidden": "true" },
        }),
      ]
    )
  },
  function () {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c(
      "label",
      { staticClass: "form-label", attrs: { for: "building_address" } },
      [
        _vm._v("Address  "),
        _c("i", {
          staticClass: "fa fa-question-circle",
          attrs: { "aria-hidden": "true" },
        }),
      ]
    )
  },
  function () {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c(
      "label",
      { staticClass: "form-label", attrs: { for: "order_position" } },
      [
        _vm._v("Order Position  "),
        _c("i", {
          staticClass: "fa fa-question-circle",
          attrs: { "aria-hidden": "true" },
        }),
      ]
    )
  },
]
add_buildingvue_type_template_id_b8871262_render._withStripped = true


;// CONCATENATED MODULE: ./assets/js/components/structure/buildings/add-building.vue?vue&type=template&id=b8871262&

;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/index.js??vue-loader-options!./assets/js/components/structure/buildings/add-building.vue?vue&type=script&lang=js&
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

const add_buildingvue_type_script_lang_js_axios = (__webpack_require__(9669)["default"]);


/* harmony default export */ const add_buildingvue_type_script_lang_js_ = ({
  props: {
    token: "",
    project_id: 0,
  },

  mounted() {
    
  },

  created() {
    this.$parent.$on('add_building', (data) => {
      this.createBuilding();
    });
   },

  data() {
    return {
      building: {
        name: "",
        address: "",
        position: 0,
        project_id: this.project_id,
      },
    };
  },

  methods: {
    createBuilding() {
      this.building.project_id = this.project_id;
      const token = this.token || "";
      add_buildingvue_type_script_lang_js_axios.defaults.headers.common["Authorization"] = token;
      add_buildingvue_type_script_lang_js_axios.defaults.headers.post["Content-Type"] =
        "application/x-www-form-urlencoded";
      add_buildingvue_type_script_lang_js_axios
        .post(
          `${API_DOMAIN_MANIFERA}/api/v1/buildings/`, this.building
        )
        .then((response) => {
          this.$emit('refreshBuilding');
          alert('Building Create')
        })
        .catch((error) => {
          // handle error
          alert('Failed to update building');
        })
    },
  },
});

;// CONCATENATED MODULE: ./assets/js/components/structure/buildings/add-building.vue?vue&type=script&lang=js&
 /* harmony default export */ const buildings_add_buildingvue_type_script_lang_js_ = (add_buildingvue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./assets/js/components/structure/buildings/add-building.vue





/* normalize component */
;
var add_building_component = normalizeComponent(
  buildings_add_buildingvue_type_script_lang_js_,
  add_buildingvue_type_template_id_b8871262_render,
  add_buildingvue_type_template_id_b8871262_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const add_building = (add_building_component.exports);
;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./assets/js/components/structure/add-group.vue?vue&type=template&id=37eab18c&
var add_groupvue_type_template_id_37eab18c_render = function () {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { staticClass: "layout-center" }, [
    _c("div", { staticClass: "form-update" }, [
      _c("div", { staticClass: "title" }, [
        _c("h4", [
          _vm._v("Add New Group For Floor "),
          _c("b", [_c("i", [_vm._v(_vm._s(_vm.computedFloor.full_name))])]),
        ]),
      ]),
      _vm._v(" "),
      _c(
        "form",
        {
          on: {
            submit: function ($event) {
              $event.preventDefault()
              return _vm.addGroup($event)
            },
          },
        },
        [
          _c("div", { staticClass: "row" }, [
            _c("div", { staticClass: "col-lg-4 col-sm-12" }, [
              _vm._m(0),
              _vm._v(" "),
              _c("input", {
                directives: [
                  {
                    name: "model",
                    rawName: "v-model",
                    value: _vm.group.name,
                    expression: "group.name",
                  },
                ],
                staticClass: "form-control",
                attrs: {
                  type: "text",
                  id: "name",
                  name: "name",
                  placeholder: "Group name",
                  required: "",
                },
                domProps: { value: _vm.group.name },
                on: {
                  input: function ($event) {
                    if ($event.target.composing) {
                      return
                    }
                    _vm.$set(_vm.group, "name", $event.target.value)
                  },
                },
              }),
            ]),
          ]),
        ]
      ),
    ]),
  ])
}
var add_groupvue_type_template_id_37eab18c_staticRenderFns = [
  function () {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("label", { staticClass: "form-label", attrs: { for: "name" } }, [
      _vm._v("Name  "),
      _c("i", {
        staticClass: "fa fa-question-circle",
        attrs: { "aria-hidden": "true" },
      }),
    ])
  },
]
add_groupvue_type_template_id_37eab18c_render._withStripped = true


;// CONCATENATED MODULE: ./assets/js/components/structure/add-group.vue?vue&type=template&id=37eab18c&

;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/index.js??vue-loader-options!./assets/js/components/structure/add-group.vue?vue&type=script&lang=js&
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

const add_groupvue_type_script_lang_js_axios = (__webpack_require__(9669)["default"]);


/* harmony default export */ const add_groupvue_type_script_lang_js_ = ({
  props: {
    token: "",
    floorplan: {
      type: Object,
      default() {
        return {};
      }
    },
  },

  mounted() {
    
  },

  computed: {
    computedFloor() {
      return this.floorplan;
    },
  },

  created() {
    this.$parent.$on('add_group', (data) => {
      this.addGroup();
    });
   },

  data() {
    return {
      group: {
        name: '',
        building_id: 0,
        project_id: 0,
        file_id: 0,
      },
    };
  },

  methods: {
    addGroup() {
      if (!this.group.name) {
        alert('Please enter group name');
        return;
      }
      const token = this.token || "";
      add_groupvue_type_script_lang_js_axios.defaults.headers.common["Authorization"] = token;
      add_groupvue_type_script_lang_js_axios.defaults.headers.post["Content-Type"] =
        "application/x-www-form-urlencoded";
      this.group.building_id = this.computedFloor.building_id;
      this.group.project_id = this.computedFloor.project_id;
      this.group.file_id = this.computedFloor.id;

      add_groupvue_type_script_lang_js_axios
        .post(
          `${API_DOMAIN_MANIFERA}/api/v1/groups/`, this.group
        )
        .then((response) => {
          window.location.reload();
        })
        .catch((error) => {
          // handle error
          alert('Failed to create new group');
        })
    },
  },
});

;// CONCATENATED MODULE: ./assets/js/components/structure/add-group.vue?vue&type=script&lang=js&
 /* harmony default export */ const structure_add_groupvue_type_script_lang_js_ = (add_groupvue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./assets/js/components/structure/add-group.vue





/* normalize component */
;
var add_group_component = normalizeComponent(
  structure_add_groupvue_type_script_lang_js_,
  add_groupvue_type_template_id_37eab18c_render,
  add_groupvue_type_template_id_37eab18c_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const add_group = (add_group_component.exports);
;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./assets/js/components/structure/floorplans/add-floorplan.vue?vue&type=template&id=2be8030b&
var add_floorplanvue_type_template_id_2be8030b_render = function () {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { staticClass: "layout-center" }, [
    _c("div", { staticClass: "form-update" }, [
      _c("div", { staticClass: "title" }, [
        _c("h4", [
          _vm._v("\n        Add Floorplan For Building:\n        "),
          _c("b", [_c("i", [_vm._v(_vm._s(_vm.computedBuilding.name))])]),
          _vm._v(" "),
          _c("div", {
            directives: [
              {
                name: "show",
                rawName: "v-show",
                value: _vm.loading,
                expression: "loading",
              },
            ],
            staticClass: "spinner-border spinner-border-sm ml-2",
          }),
        ]),
      ]),
      _vm._v(" "),
      _c(
        "form",
        {
          on: {
            submit: function ($event) {
              $event.preventDefault()
              return _vm.addFloor($event)
            },
          },
        },
        [
          _c("div", { staticClass: "row" }, [
            _c("div", { staticClass: "col-lg-12 col-sm-12 mb-2" }, [
              _vm._m(0),
              _vm._v(" "),
              _c("input", {
                directives: [
                  {
                    name: "model",
                    rawName: "v-model",
                    value: _vm.floorplan.full_name,
                    expression: "floorplan.full_name",
                  },
                ],
                staticClass: "form-control",
                attrs: {
                  type: "text",
                  id: "full_name",
                  name: "full_name",
                  placeholder: "Floor Name",
                  required: "",
                },
                domProps: { value: _vm.floorplan.full_name },
                on: {
                  input: function ($event) {
                    if ($event.target.composing) {
                      return
                    }
                    _vm.$set(_vm.floorplan, "full_name", $event.target.value)
                  },
                },
              }),
            ]),
            _vm._v(" "),
            _c("div", { staticClass: "col-lg-12 col-sm-12 mb-2" }, [
              _vm._m(1),
              _vm._v(" "),
              _c("input", {
                directives: [
                  {
                    name: "model",
                    rawName: "v-model",
                    value: _vm.floorplan.short_name,
                    expression: "floorplan.short_name",
                  },
                ],
                staticClass: "form-control",
                attrs: {
                  type: "text",
                  id: "short_name",
                  name: "short_name",
                  placeholder: "Floor Number",
                  required: "",
                },
                domProps: { value: _vm.floorplan.short_name },
                on: {
                  input: function ($event) {
                    if ($event.target.composing) {
                      return
                    }
                    _vm.$set(_vm.floorplan, "short_name", $event.target.value)
                  },
                },
              }),
            ]),
            _vm._v(" "),
            _c("div", { staticClass: "col-lg-12 col-sm-12 mb-2" }, [
              _vm._m(2),
              _vm._v(" "),
              _c("input", {
                directives: [
                  {
                    name: "model",
                    rawName: "v-model",
                    value: _vm.floorplan.position,
                    expression: "floorplan.position",
                  },
                ],
                staticClass: "form-control",
                attrs: {
                  type: "text",
                  id: "position",
                  name: "position",
                  placeholder: "Floor Position",
                  required: "",
                },
                domProps: { value: _vm.floorplan.position },
                on: {
                  input: function ($event) {
                    if ($event.target.composing) {
                      return
                    }
                    _vm.$set(_vm.floorplan, "position", $event.target.value)
                  },
                },
              }),
            ]),
          ]),
          _vm._v(" "),
          _c("div", { staticClass: "row" }, [
            _c("div", { staticClass: "col-lg-12 col-sm-12" }, [
              _vm._m(3),
              _vm._v(" "),
              _c("br"),
              _vm._v(" "),
              _c("input", {
                ref: "fileInput",
                attrs: { name: "file", type: "file", accept: ".dxf,.dwg" },
              }),
            ]),
          ]),
        ]
      ),
    ]),
  ])
}
var add_floorplanvue_type_template_id_2be8030b_staticRenderFns = [
  function () {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("label", { staticClass: "form-label", attrs: { for: "name" } }, [
      _vm._v("Floor Name  "),
      _c("i", {
        staticClass: "fa fa-question-circle",
        attrs: { "aria-hidden": "true" },
      }),
    ])
  },
  function () {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("label", { staticClass: "form-label", attrs: { for: "name" } }, [
      _vm._v("Floor Number  "),
      _c("i", {
        staticClass: "fa fa-question-circle",
        attrs: { "aria-hidden": "true" },
      }),
    ])
  },
  function () {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("label", { staticClass: "form-label", attrs: { for: "name" } }, [
      _vm._v("Floor Position  "),
      _c("i", {
        staticClass: "fa fa-question-circle",
        attrs: { "aria-hidden": "true" },
      }),
    ])
  },
  function () {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("label", { staticClass: "form-label", attrs: { for: "name" } }, [
      _vm._v("Select Floor  "),
      _c("i", {
        staticClass: "fa fa-question-circle",
        attrs: { "aria-hidden": "true" },
      }),
    ])
  },
]
add_floorplanvue_type_template_id_2be8030b_render._withStripped = true


;// CONCATENATED MODULE: ./assets/js/components/structure/floorplans/add-floorplan.vue?vue&type=template&id=2be8030b&

;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/index.js??vue-loader-options!./assets/js/components/structure/floorplans/add-floorplan.vue?vue&type=script&lang=js&
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

const add_floorplanvue_type_script_lang_js_axios = (__webpack_require__(9669)["default"]);



/* harmony default export */ const add_floorplanvue_type_script_lang_js_ = ({
  props: {
    token: "",
    building: {
      type: Object,
      default() {
        return {};
      },
    },
  },

  mounted() {},

  computed: {
    computedBuilding() {
      return this.building;
    },
  },

  created() {
    this.$parent.$on("add_floor", (data) => {
      this.addFloor();
    });
  },

  data() {
    return {
      loading: false,
      floorplan: {
        full_name: "",
        short_name: "",
        project_id: 0,
        building_id: 0,
        position: 0,
      },
    };
  },

  methods: {
    async addFloor() {
      this.loading = true;
      const token = this.token || "";
      add_floorplanvue_type_script_lang_js_axios.defaults.headers.common["Authorization"] = token;
      add_floorplanvue_type_script_lang_js_axios.defaults.headers.post["Content-Type"] =
        "application/x-www-form-urlencoded";

      let formData = new FormData();
      formData.append("full_name", this.floorplan.full_name);
      formData.append("short_name", this.floorplan.short_name);
      formData.append("position", this.floorplan.position);
      formData.append("building_id", this.computedBuilding.id);
      formData.append("project_id", this.computedBuilding.project_id);
      formData.append("file", this.$refs.fileInput.files[0]);

      await add_floorplanvue_type_script_lang_js_axios
        .post(`${API_DOMAIN_MANIFERA}/api/v1/files/`, formData)
        .then((response) => {
          // window.location.reload();
          EventBus.$emit("updateFloorData");
        })
        .catch((error) => {
          // handle error
          alert("Failed to upload floorplan");
        });
      this.loading = false;
    },
  },
});

;// CONCATENATED MODULE: ./assets/js/components/structure/floorplans/add-floorplan.vue?vue&type=script&lang=js&
 /* harmony default export */ const floorplans_add_floorplanvue_type_script_lang_js_ = (add_floorplanvue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./assets/js/components/structure/floorplans/add-floorplan.vue





/* normalize component */
;
var add_floorplan_component = normalizeComponent(
  floorplans_add_floorplanvue_type_script_lang_js_,
  add_floorplanvue_type_template_id_2be8030b_render,
  add_floorplanvue_type_template_id_2be8030b_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const add_floorplan = (add_floorplan_component.exports);
;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./assets/js/components/structure/floorplans/edit-floorplan.vue?vue&type=template&id=430dacd8&
var edit_floorplanvue_type_template_id_430dacd8_render = function () {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { staticClass: "layout-center" }, [
    _c("div", { staticClass: "form-update" }, [
      _c("div", { staticClass: "title" }, [
        _c("h4", [
          _vm._v(
            "\n                Edit Floorplan For Building:\n                "
          ),
          _c("b", [_c("i", [_vm._v(_vm._s(_vm.computedBuilding.name))])]),
        ]),
      ]),
      _vm._v(" "),
      _c(
        "form",
        {
          attrs: { autocomplete: "off" },
          on: {
            submit: function ($event) {
              $event.preventDefault()
              return _vm.editFloor($event)
            },
          },
        },
        [
          _c("div", { staticClass: "row" }, [
            _c("div", { staticClass: "col-lg-12 col-sm-12" }, [
              _vm._m(0),
              _vm._v(" "),
              _c("input", {
                directives: [
                  {
                    name: "model",
                    rawName: "v-model",
                    value: _vm.floorplan.full_name,
                    expression: "floorplan.full_name",
                  },
                ],
                staticClass: "form-control",
                attrs: {
                  type: "text",
                  id: "full_name",
                  name: "full_name",
                  placeholder: "Floor Name",
                  required: "",
                },
                domProps: { value: _vm.floorplan.full_name },
                on: {
                  input: function ($event) {
                    if ($event.target.composing) {
                      return
                    }
                    _vm.$set(_vm.floorplan, "full_name", $event.target.value)
                  },
                },
              }),
            ]),
            _vm._v(" "),
            _c("div", { staticClass: "col-lg-12 col-sm-12" }, [
              _vm._m(1),
              _vm._v(" "),
              _c("input", {
                directives: [
                  {
                    name: "model",
                    rawName: "v-model",
                    value: _vm.floorplan.short_name,
                    expression: "floorplan.short_name",
                  },
                ],
                staticClass: "form-control",
                attrs: {
                  type: "text",
                  id: "short_name",
                  name: "short_name",
                  placeholder: "Floor Number",
                  required: "",
                },
                domProps: { value: _vm.floorplan.short_name },
                on: {
                  input: function ($event) {
                    if ($event.target.composing) {
                      return
                    }
                    _vm.$set(_vm.floorplan, "short_name", $event.target.value)
                  },
                },
              }),
            ]),
            _vm._v(" "),
            _c("div", { staticClass: "col-lg-12 col-sm-12" }, [
              _vm._m(2),
              _vm._v(" "),
              _c("input", {
                directives: [
                  {
                    name: "model",
                    rawName: "v-model",
                    value: _vm.floorplan.position,
                    expression: "floorplan.position",
                  },
                ],
                staticClass: "form-control",
                attrs: {
                  type: "text",
                  id: "position",
                  name: "position",
                  placeholder: "Floor Position",
                  required: "",
                },
                domProps: { value: _vm.floorplan.position },
                on: {
                  input: function ($event) {
                    if ($event.target.composing) {
                      return
                    }
                    _vm.$set(_vm.floorplan, "position", $event.target.value)
                  },
                },
              }),
            ]),
            _vm._v(" "),
            _c("div", { staticClass: "col-lg-12 col-sm-12" }, [
              _vm._m(3),
              _vm._v(" "),
              _c(
                "select",
                {
                  directives: [
                    {
                      name: "model",
                      rawName: "v-model",
                      value: _vm.floorplan.floor_layer_name,
                      expression: "floorplan.floor_layer_name",
                    },
                  ],
                  staticClass: "form-select plain-select",
                  on: {
                    change: function ($event) {
                      var $$selectedVal = Array.prototype.filter
                        .call($event.target.options, function (o) {
                          return o.selected
                        })
                        .map(function (o) {
                          var val = "_value" in o ? o._value : o.value
                          return val
                        })
                      _vm.$set(
                        _vm.floorplan,
                        "floor_layer_name",
                        $event.target.multiple
                          ? $$selectedVal
                          : $$selectedVal[0]
                      )
                    },
                  },
                },
                _vm._l(_vm.floorplan.layer_names, function (option) {
                  return _c("option", { key: option }, [_vm._v(_vm._s(option))])
                }),
                0
              ),
            ]),
            _vm._v(" "),
            _c("div", { staticClass: "col-lg-12 col-sm-12" }, [
              _vm._m(4),
              _vm._v(" "),
              _c(
                "select",
                {
                  directives: [
                    {
                      name: "model",
                      rawName: "v-model",
                      value: _vm.floorplan.sensor_layer_name,
                      expression: "floorplan.sensor_layer_name",
                    },
                  ],
                  staticClass: "form-select plain-select",
                  on: {
                    change: function ($event) {
                      var $$selectedVal = Array.prototype.filter
                        .call($event.target.options, function (o) {
                          return o.selected
                        })
                        .map(function (o) {
                          var val = "_value" in o ? o._value : o.value
                          return val
                        })
                      _vm.$set(
                        _vm.floorplan,
                        "sensor_layer_name",
                        $event.target.multiple
                          ? $$selectedVal
                          : $$selectedVal[0]
                      )
                    },
                  },
                },
                _vm._l(_vm.floorplan.layer_names, function (option) {
                  return _c("option", { key: option }, [_vm._v(_vm._s(option))])
                }),
                0
              ),
            ]),
            _vm._v(" "),
            _c("div", { staticClass: "col-lg-12 col-sm-12" }, [
              _vm._m(5),
              _vm._v(" "),
              _c(
                "select",
                {
                  directives: [
                    {
                      name: "model",
                      rawName: "v-model",
                      value: _vm.floorplan.fixture_layer_name,
                      expression: "floorplan.fixture_layer_name",
                    },
                  ],
                  staticClass: "form-select plain-select",
                  on: {
                    change: function ($event) {
                      var $$selectedVal = Array.prototype.filter
                        .call($event.target.options, function (o) {
                          return o.selected
                        })
                        .map(function (o) {
                          var val = "_value" in o ? o._value : o.value
                          return val
                        })
                      _vm.$set(
                        _vm.floorplan,
                        "fixture_layer_name",
                        $event.target.multiple
                          ? $$selectedVal
                          : $$selectedVal[0]
                      )
                    },
                  },
                },
                _vm._l(_vm.floorplan.layer_names, function (option) {
                  return _c("option", { key: option }, [_vm._v(_vm._s(option))])
                }),
                0
              ),
            ]),
          ]),
        ]
      ),
    ]),
  ])
}
var edit_floorplanvue_type_template_id_430dacd8_staticRenderFns = [
  function () {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("label", { staticClass: "form-label", attrs: { for: "name" } }, [
      _vm._v(
        "\n                        Floor Name  \n                        "
      ),
      _c("i", {
        staticClass: "fa fa-question-circle",
        attrs: { "aria-hidden": "true" },
      }),
    ])
  },
  function () {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("label", { staticClass: "form-label", attrs: { for: "name" } }, [
      _vm._v(
        "\n                        Floor Number  \n                        "
      ),
      _c("i", {
        staticClass: "fa fa-question-circle",
        attrs: { "aria-hidden": "true" },
      }),
    ])
  },
  function () {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("label", { staticClass: "form-label", attrs: { for: "name" } }, [
      _vm._v(
        "\n                        Floor Position  \n                        "
      ),
      _c("i", {
        staticClass: "fa fa-question-circle",
        attrs: { "aria-hidden": "true" },
      }),
    ])
  },
  function () {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("label", { staticClass: "form-label", attrs: { for: "name" } }, [
      _vm._v(
        "\n                        Floor Layer Name  \n                        "
      ),
      _c("i", {
        staticClass: "fa fa-question-circle",
        attrs: { "aria-hidden": "true" },
      }),
    ])
  },
  function () {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("label", { staticClass: "form-label", attrs: { for: "name" } }, [
      _vm._v(
        "\n                        Sensor Layer Name  \n                        "
      ),
      _c("i", {
        staticClass: "fa fa-question-circle",
        attrs: { "aria-hidden": "true" },
      }),
    ])
  },
  function () {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("label", { staticClass: "form-label", attrs: { for: "name" } }, [
      _vm._v(
        "\n                        Fixture Layer Name  \n                        "
      ),
      _c("i", {
        staticClass: "fa fa-question-circle",
        attrs: { "aria-hidden": "true" },
      }),
    ])
  },
]
edit_floorplanvue_type_template_id_430dacd8_render._withStripped = true


;// CONCATENATED MODULE: ./assets/js/components/structure/floorplans/edit-floorplan.vue?vue&type=template&id=430dacd8&

;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/index.js??vue-loader-options!./assets/js/components/structure/floorplans/edit-floorplan.vue?vue&type=script&lang=js&
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

const edit_floorplanvue_type_script_lang_js_axios = (__webpack_require__(9669)["default"]);



/* harmony default export */ const edit_floorplanvue_type_script_lang_js_ = ({
    props: {
        token: "",
        building: {
            type: Object,
            default() {
                return {};
            }
        },
        floorplan: {
            type: Object,
            default() {
                return {};
            }
        },
    },

    mounted() {
    },

    computed: {
        computedBuilding() {
            return this.building;
        },
        seletedFloorplan() {
            return this.floorplan;
        },
    },

    created() {
        this.$parent.$on('edit_floor', (data) => {
            this.editFloor();
        });
    },

    data() {
        return {
        };
    },

    methods: {
        async editFloor() {
            const token = this.token || "";
            edit_floorplanvue_type_script_lang_js_axios.defaults.headers.common["Authorization"] = token;
            edit_floorplanvue_type_script_lang_js_axios.defaults.headers.post["Content-Type"] =
                "application/x-www-form-urlencoded";

            await edit_floorplanvue_type_script_lang_js_axios
                .put(
                    `${API_DOMAIN_MANIFERA}/api/v1/files/${this.floorplan.id}`, this.floorplan
                )
                .then((response) => {
                    // window.location.reload();
                    // this.$parent.$children[1].updateTitleTreeNode(response.data)
                    EventBus.$emit("updateFloorData");
                    this.$emit("back");
                })
                .catch((error) => {
                    // handle error
                    alert('Failed to update floorplan');
                })
        },
    },
});

;// CONCATENATED MODULE: ./assets/js/components/structure/floorplans/edit-floorplan.vue?vue&type=script&lang=js&
 /* harmony default export */ const floorplans_edit_floorplanvue_type_script_lang_js_ = (edit_floorplanvue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./assets/js/components/structure/floorplans/edit-floorplan.vue





/* normalize component */
;
var edit_floorplan_component = normalizeComponent(
  floorplans_edit_floorplanvue_type_script_lang_js_,
  edit_floorplanvue_type_template_id_430dacd8_render,
  edit_floorplanvue_type_template_id_430dacd8_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const edit_floorplan = (edit_floorplan_component.exports);
;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/index.js??vue-loader-options!./assets/js/components/structure/layout-left/layout-left.vue?vue&type=script&lang=js&
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

const layout_leftvue_type_script_lang_js_axios = (__webpack_require__(9669)["default"]);













/* harmony default export */ const layout_leftvue_type_script_lang_js_ = ({
  components: {
    FloorplanList: layout_left_list,
    ListLayer: layer_list,
    NavSelect: nav_select,
    EditBuilding: building_edit,
    AddGroup: add_group,
    AddFloor: add_floorplan,
    EditFloor: edit_floorplan,
    AddBuilding: add_building,
    Modal: modal,
  },
  props: {
    project: {
      default() {
        return {};
      },
    },
    buildings_json: {
      default() {
        return "[]";
      },
    },
    token: "",
    groups_json: {
      default() {
        return "[]";
      },
    },
    devices_json: {
      default() {
        return "[]";
      },
    },
    floors_json: {
      default() {
        return "[]";
      },
    },
  },

  mounted() {
    // this.buildings = JSON.parse(this.buildings_json);
    // this.floors = JSON.parse(this.floors_json);
    // this.selectNav = JSON.parse(this.buildings_json);
    // this.groups = JSON.parse(this.groups_json);
    // this.devices = JSON.parse(this.devices_json);
    // this.selectBuilding(this.buildings[0]);
    // this.titleSelect = this.buildings[0].name;
    // this.projectData = JSON.parse(this.project);
  },

  created() {},

  data() {
    return {
      errorMessage: "",
      loading: false,
      showBuildingModal: false,
      buildings: {},
      paddingRight: {},
      selectedBuilding: {},
      editSelectedFloor: {},
      expanded: false,
      visibleGroup: false,
      visibleFloor: true,
      navigator: "Dashboard",
      selectNav: {},
      titleSelect: "",
      selectedFloor: {},
      groups: [],
      filteredGroups: [],
      filteredFloors: [],
      devices: [],
      floors: [],
      editBuilding: false,
      addGroup: false,
      addFloor: false,
      editFloor: false,
      addBuilding: false,
      projectData: {},
    };
  },

  computed: {
    currentNav() {
      return store.currentNav;
    },
  },

  watch: {
    currentNav(val) {
      this.navigator = val;
    },
  },

  methods: {
    resetActions() {
      this.visibleGroup = false;
      this.visibleFloor = true;
      this.editBuilding = false;
      this.addGroup = false;
      this.expanded = false;
      this.addFloor = false;
      this.editFloor = false;
      this.addBuilding = false;
      this.navigator = "Dashboard";
      this.loading = false;
      this.errorMessage = "";
      storeFunctions.setSelectedGroup(null);
    },
    handleClickFloorName(v) {
      this.$emit("handleClickFloor", v);
    },
    selectBuilding(building) {
      this.$emit("handleSelectBuilding", building);
      this.selectedBuilding = building;
      if (this.navigator == "Dashboard") {
        this.titleSelect = building.name;
        this.filteredGroups = this.groups.filter(
          (group) => group.building_id == building.id
        );

        this.filteredFloors = this.floors.filter(
          (floor) => floor.building_id == building.id
        );
      } else if (this.navigator == "Floorplans") {
        this.titleSelect = building.full_name;
        this.selectedFloor = building;

        this.filteredGroups = this.groups.filter(
          (group) => group.file_id == building.id
        );

        this.filteredFloors = this.floors.filter(
          (floor) => floor.file_id == building.id
        );

        // axios.defaults.headers.common["Authorization"] = this.token;
        // axios.defaults.headers.post["Content-Type"] =
        //   "application/x-www-form-urlencoded";
        // axios
        //   .get(
        //     `${API_DOMAIN_MANIFERA}/api/v1/groups?file_id=${building.id}&is_active=false`
        //   )
        //   .then((response) => {
        //     this.groupData = response.data;
        //   })
        //   .catch((error) => {});
      }
    },
    back() {
      if (this.navigator == "Dashboard") {
      } else if (
        this.navigator == "Floorplans" ||
        this.navigator == "Edit Building" ||
        this.navigator == "Add Group" ||
        this.navigator == "Add Floor" ||
        this.navigator == "Edit Floor" ||
        this.navigator == "Add Building"
      ) {
        this.resetActions();
        this.selectNav = this.buildings;
        this.titleSelect = this.buildings[0].name;
        this.navigator = "Dashboard";
        this.selectedBuilding = this.buildings[0];
        this.filteredFloors = this.floors.filter(
          (floor) => floor.building_id == this.selectedBuilding.id
        );
        this.filteredGroups = this.groups.filter(
          (group) => group.building_id == this.selectedBuilding.id
        );
        this.$emit("changeExpanded", false);
        this.paddingRight = { padding: "0 0 0 50px" };
        storeFunctions.setShowFloorStackSelector(true);
        storeFunctions.setCurrentNav("Dashboard");
        storeFunctions.setSelectedFloorplan(null);
        storeFunctions.setPopup(false);
        EventBus.$emit("compactClick");
      }
    },
    handleExpandedClick() {
      this.$emit("handleExpandedView");
      this.paddingRight = { padding: "0 50px" };
      this.expanded = true;
    },

    handleCompactClick() {
      this.$emit("handleCompactView");
      this.paddingRight = { padding: "0 0 0 50px" };
      this.expanded = false;
    },
    handleRefreshBuilding() {
      this.back();
      layout_leftvue_type_script_lang_js_axios.defaults.headers.common["Authorization"] = this.token;
      layout_leftvue_type_script_lang_js_axios.defaults.headers.post["Content-Type"] =
        "application/x-www-form-urlencoded";
      this.loading = true;
      layout_leftvue_type_script_lang_js_axios
        .get(
          `${API_DOMAIN_MANIFERA}/api/v1/buildings?project_id=${this.projectData.id}`
        )
        .then((response) => {
          this.buildings = response.data;
          let selectedBuilding = {};
          for (let i = 0; i < this.buildings.length; i++) {
            if (this.buildings[i].id == this.selectedBuilding.id) {
              selectedBuilding = this.buildings[i];
              break;
            }
          }
          if (Object.keys(selectedBuilding).length > 0) {
            this.selectBuilding(selectedBuilding);
          } else {
            if (this.buildings && this.buildings.length > 0) {
              this.selectBuilding(this.buildings[0]);
            } else {
              this.selectedBuilding = {};
              this.titleSelect = "";
            }
          }
          this.selectNav = this.buildings;
          this.loading = false;
        })
        .catch((error) => {});
    },

    handleGroup(obj) {
      this.selectNav = this.selectedBuilding.floorplans;
      this.titleSelect = obj.full_name;
      this.selectedFloor = obj;
      this.$emit("handleGroup", obj);
      this.navigator = "Floorplans";
      this.visibleFloor = false;
      this.visibleGroup = true;

      this.filteredGroups = this.groups.filter(
        (group) => group.file_id == obj.id
      );

      // axios.defaults.headers.common["Authorization"] = this.token;
      // axios.defaults.headers.post["Content-Type"] =
      //   "application/x-www-form-urlencoded";
      // axios
      //   .get(
      //     `${API_DOMAIN_MANIFERA}/api/v1/groups?file_id=${obj.id}&is_active=false`
      //   )
      //   .then((response) => {
      //     this.groupData = response.data;
      //   })
      //   .catch((error) => {});
    },
    handleEditBuilding() {
      this.resetActions();
      this.visibleFloor = false;
      this.expanded = true;
      this.editBuilding = true;
      this.navigator = "Edit Building";
    },
    handleAddBuilding() {
      this.resetActions();
      this.visibleFloor = false;
      this.expanded = true;
      this.addBuilding = true;
      this.navigator = "Add Building";
    },
    handleAddGroup(floor) {
      this.resetActions();
      this.visibleFloor = false;
      this.expanded = true;
      this.addGroup = true;
      this.selectedFloor = floor;
      this.navigator = "Add Group";
    },
    handleAddFloor() {
      this.resetActions();
      this.$refs.listLayer.expandedClick();
      this.visibleFloor = false;
      this.expanded = true;
      this.addFloor = true;
      this.navigator = "Add Floor";
    },
    handleEditFloor(floor) {
      this.resetActions();
      this.$refs.listLayer.expandedClick();
      this.visibleFloor = false;
      this.expanded = true;
      this.editFloor = true;
      this.navigator = "Edit Floor";
      this.editSelectedFloor = floor;
    },
    async handleDeleteBuilding() {
      this.resetActions();
      layout_leftvue_type_script_lang_js_axios.defaults.headers.common["Authorization"] = this.token;
      this.loading = true;
      await layout_leftvue_type_script_lang_js_axios
        .delete(
          `${API_DOMAIN_MANIFERA}/api/v1/buildings/${this.selectedBuilding.id}`
        )
        .then((response) => {
          this.handleRefreshBuilding();
          this.showBuildingModal = false;
          this.$refs.listLayer.compactClick();
        })
        .catch((error) => {
          this.errorMessage = "Unable to delete building";
        });
      this.loading = false;
    },
    submit() {
      if (this.editBuilding) {
        this.$emit("save", this.selectedBuilding);
      } else if (this.addGroup) {
        this.$emit("add_group", this.selectedFloor);
      } else if (this.addFloor) {
        this.$emit("add_floor", this.selectedBuilding);
      } else if (this.editFloor) {
        this.$emit("edit_floor");
      } else if (this.addBuilding) {
        this.$emit("add_building");
      }
    },

    handleFloorsChange(floors) {
      this.$emit("handleFloorsChange", floors);
    },
  },

  created() {
    EventBus.$on("handleEditFloor", this.handleEditFloor);
  },
  destroyed() {
    EventBus.$off("handleEditFloor", this.handleEditFloor);
  },
});

;// CONCATENATED MODULE: ./assets/js/components/structure/layout-left/layout-left.vue?vue&type=script&lang=js&
 /* harmony default export */ const layout_left_layout_leftvue_type_script_lang_js_ = (layout_leftvue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./assets/js/components/structure/layout-left/layout-left.vue





/* normalize component */
;
var layout_left_component = normalizeComponent(
  layout_left_layout_leftvue_type_script_lang_js_,
  layout_leftvue_type_template_id_41ef0d5e_render,
  layout_leftvue_type_template_id_41ef0d5e_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const layout_left = (layout_left_component.exports);
;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./assets/js/components/structure/layout-right/layout-right.vue?vue&type=template&id=570dc545&
var layout_rightvue_type_template_id_570dc545_render = function () {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { staticClass: "layout-right" }, [
    _c("div", { staticClass: "box-header" }, [
      _c("div", { staticClass: "header d-flex" }, [
        _c("div"),
        _vm._v(" "),
        _c("div", { staticClass: "bottom-header d-flex" }, [
          _c("div", [_vm._v(_vm._s(this.title))]),
          _vm._v(" "),
          _c("div", [
            _c(
              "button",
              {
                directives: [
                  {
                    name: "show",
                    rawName: "v-show",
                    value: !_vm.buttonEdit,
                    expression: "!buttonEdit",
                  },
                ],
                staticClass: "btn btn-primary",
                attrs: { type: "button" },
              },
              [_vm._v("\n            Edit structure\n          ")]
            ),
            _vm._v(" "),
            _c(
              "button",
              {
                directives: [
                  {
                    name: "show",
                    rawName: "v-show",
                    value: _vm.showBackButton,
                    expression: "showBackButton",
                  },
                ],
                staticClass: "btn btn-primary",
                attrs: { id: "add-group", type: "button" },
                on: { click: _vm.handleBackButton },
              },
              [_vm._v("\n            Back to Edit mode\n          ")]
            ),
            _vm._v(" "),
            _c(
              "button",
              {
                directives: [
                  {
                    name: "show",
                    rawName: "v-show",
                    value: _vm.showCreateGroupButton,
                    expression: "showCreateGroupButton",
                  },
                ],
                staticClass: "btn btn-primary",
                attrs: { id: "add-group", type: "button" },
                on: { click: _vm.handleCreateGroupButton },
              },
              [_vm._v("\n            Create Group\n          ")]
            ),
            _vm._v(" "),
            _c(
              "button",
              {
                directives: [
                  {
                    name: "show",
                    rawName: "v-show",
                    value: _vm.showCreateDeviceButton,
                    expression: "showCreateDeviceButton",
                  },
                ],
                staticClass: "btn btn-primary",
                attrs: { id: "add-device", type: "button" },
                on: { click: _vm.handleCreateDeviceButton },
              },
              [_vm._v("\n            Create Device\n          ")]
            ),
            _vm._v(" "),
            _c(
              "button",
              {
                directives: [
                  {
                    name: "show",
                    rawName: "v-show",
                    value: _vm.showDrawAreaButton,
                    expression: "showDrawAreaButton",
                  },
                ],
                staticClass: "btn btn-primary",
                attrs: { id: "add-device", type: "button" },
                on: { click: _vm.handleDrawAreaButton },
              },
              [_vm._v("\n            Draw Area\n          ")]
            ),
            _vm._v(" "),
            _c(
              "button",
              {
                directives: [
                  {
                    name: "show",
                    rawName: "v-show",
                    value: _vm.showDrawPolygonAreaButton,
                    expression: "showDrawPolygonAreaButton",
                  },
                ],
                staticClass: "btn btn-primary",
                attrs: { id: "add-device", type: "button" },
                on: { click: _vm.handleDrawPolygonAreaButton },
              },
              [_vm._v("\n            Draw Polygon Area\n          ")]
            ),
            _vm._v(" "),
            _c(
              "button",
              {
                directives: [
                  {
                    name: "show",
                    rawName: "v-show",
                    value: _vm.showAreaModeButton,
                    expression: "showAreaModeButton",
                  },
                ],
                staticClass: "btn btn-primary",
                attrs: { id: "add-area", type: "button" },
                on: { click: _vm.handleAreaModeButton },
              },
              [_vm._v("\n            Area Mode\n          ")]
            ),
          ]),
        ]),
      ]),
    ]),
    _vm._v(" "),
    _c(
      "div",
      {
        directives: [
          {
            name: "show",
            rawName: "v-show",
            value: _vm.isShowFloorStack,
            expression: "isShowFloorStack",
          },
        ],
        staticClass: "floor-stack-wrapper",
      },
      [
        _c("Floorstack", {
          attrs: { token: _vm.token, floors: _vm.currentFloors },
          on: { handleSelectedFloor: _vm.handleSelectedFloorStack },
        }),
      ],
      1
    ),
  ])
}
var layout_rightvue_type_template_id_570dc545_staticRenderFns = []
layout_rightvue_type_template_id_570dc545_render._withStripped = true


;// CONCATENATED MODULE: ./assets/js/components/structure/layout-right/layout-right.vue?vue&type=template&id=570dc545&

// EXTERNAL MODULE: ./node_modules/axios/index.js
var node_modules_axios = __webpack_require__(9669);
var axios_default = /*#__PURE__*/__webpack_require__.n(node_modules_axios);
;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./assets/js/components/structure/floorstack/floorstack.vue?vue&type=template&id=7a62cf69&
var floorstackvue_type_template_id_7a62cf69_render = function () {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { staticClass: "position-relative" }, [
    _c("div", { staticClass: "d-flex flex-column" }, [
      _c(
        "div",
        { staticClass: "floor-stack" },
        _vm._l(_vm.floors, function (floor, index) {
          return _c(
            "div",
            { key: floor.id, staticClass: "d-flex justify-content-center" },
            [
              _c("FloorstackItem", {
                attrs: { index: index, floor: floor, allFloors: _vm.floors },
                on: { handleFloorItemClick: _vm.handleFloorItemClick },
              }),
            ],
            1
          )
        }),
        0
      ),
    ]),
  ])
}
var floorstackvue_type_template_id_7a62cf69_staticRenderFns = []
floorstackvue_type_template_id_7a62cf69_render._withStripped = true


;// CONCATENATED MODULE: ./assets/js/components/structure/floorstack/floorstack.vue?vue&type=template&id=7a62cf69&

;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./assets/js/components/structure/floorstack/floorstack-item.vue?vue&type=template&id=1a86e5ae&
var floorstack_itemvue_type_template_id_1a86e5ae_render = function () {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { staticClass: "floor-wrapper", style: _vm.floorStyle }, [
    _c("div", { staticStyle: { height: "211px" } }, [
      _c(
        "svg",
        { attrs: { width: "470", height: "256", viewBox: "0 0 470 256" } },
        [
          _c("g", { attrs: { filter: "url(#filter0_dd_4067_7417)" } }, [
            _c("path", {
              staticClass: "main-path",
              attrs: {
                "data-id": "1",
                "data-object": "aaaa",
                d: "M25.1897 103.021V113.21C25.1897 116.374 27.0544 119.24 29.9466 120.523L232.391 210.297C234.461 211.216 236.825 211.213 238.893 210.29L440.07 120.529C442.953 119.242 444.81 116.38 444.81 113.223V103.008C444.81 99.8507 442.953 96.9887 440.07 95.7022L238.893 5.9407C236.825 5.01765 234.461 5.01496 232.391 5.9333L29.9466 95.7078C27.0544 96.9904 25.1897 99.8571 25.1897 103.021Z",
                fill: "#828DF8",
              },
            }),
          ]),
          _vm._v(" "),
          _c("defs", [
            _c(
              "filter",
              {
                attrs: {
                  id: "filter0_dd_4067_7417",
                  x: "0.189697",
                  y: "0.246582",
                  width: "469.621",
                  height: "255.738",
                  filterUnits: "userSpaceOnUse",
                  "color-interpolation-filters": "sRGB",
                },
              },
              [
                _c("feFlood", {
                  attrs: { "flood-opacity": "0", result: "BackgroundImageFix" },
                }),
                _vm._v(" "),
                _c("feColorMatrix", {
                  attrs: {
                    in: "SourceAlpha",
                    type: "matrix",
                    values: "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0",
                    result: "hardAlpha",
                  },
                }),
                _vm._v(" "),
                _c("feOffset", { attrs: { dy: "10" } }),
                _vm._v(" "),
                _c("feGaussianBlur", { attrs: { stdDeviation: "5" } }),
                _vm._v(" "),
                _c("feColorMatrix", {
                  attrs: {
                    type: "matrix",
                    values:
                      "0 0 0 0 0.121569 0 0 0 0 0.160784 0 0 0 0 0.215686 0 0 0 0.04 0",
                  },
                }),
                _vm._v(" "),
                _c("feBlend", {
                  attrs: {
                    mode: "normal",
                    in2: "BackgroundImageFix",
                    result: "effect1_dropShadow_4067_7417",
                  },
                }),
                _vm._v(" "),
                _c("feColorMatrix", {
                  attrs: {
                    in: "SourceAlpha",
                    type: "matrix",
                    values: "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0",
                    result: "hardAlpha",
                  },
                }),
                _vm._v(" "),
                _c("feOffset", { attrs: { dy: "20" } }),
                _vm._v(" "),
                _c("feGaussianBlur", { attrs: { stdDeviation: "12.5" } }),
                _vm._v(" "),
                _c("feColorMatrix", {
                  attrs: {
                    type: "matrix",
                    values:
                      "0 0 0 0 0.121569 0 0 0 0 0.160784 0 0 0 0 0.215686 0 0 0 0.1 0",
                  },
                }),
                _vm._v(" "),
                _c("feBlend", {
                  attrs: {
                    mode: "normal",
                    in2: "effect1_dropShadow_4067_7417",
                    result: "effect2_dropShadow_4067_7417",
                  },
                }),
                _vm._v(" "),
                _c("feBlend", {
                  attrs: {
                    mode: "normal",
                    in: "SourceGraphic",
                    in2: "effect2_dropShadow_4067_7417",
                    result: "shape",
                  },
                }),
              ],
              1
            ),
          ]),
        ]
      ),
      _vm._v(" "),
      _c(
        "button",
        {
          staticClass: "btn btn-info floor-button",
          on: {
            click: function ($event) {
              return _vm.onFloorClick(_vm.floor)
            },
          },
        },
        [_vm._v("\n      " + _vm._s(this.floor.full_name) + "\n    ")]
      ),
    ]),
  ])
}
var floorstack_itemvue_type_template_id_1a86e5ae_staticRenderFns = []
floorstack_itemvue_type_template_id_1a86e5ae_render._withStripped = true


;// CONCATENATED MODULE: ./assets/js/components/structure/floorstack/floorstack-item.vue?vue&type=template&id=1a86e5ae&

;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/index.js??vue-loader-options!./assets/js/components/structure/floorstack/floorstack-item.vue?vue&type=script&lang=js&
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ const floorstack_itemvue_type_script_lang_js_ = ({
  props: {
    index: null,
    floor: null,
    allFloors: [],
  },

  created() {},

  mounted() {},

  computed: {
    floorStyle() {
      let offset = 75;
      if (this.selectedFloorPosition === 1) {
        offset = 150;
      }

      return {
        top: `${offset * (this.allFloors.length - this.floor.position)}px`,
        "z-index": this.floor.position,
      };
    },
  },

  data() {
    return {
      selectedFloor: null,
      selectedFloorPosition: 0,
    };
  },

  methods: {
    onSvgClick(e) {
      console.log("jasdjaslkdajld");
      this.selectedFloorPosition = 1;
    },

    onFloorClick(v) {
      this.$emit("handleFloorItemClick", v);
    },
  },
});

;// CONCATENATED MODULE: ./assets/js/components/structure/floorstack/floorstack-item.vue?vue&type=script&lang=js&
 /* harmony default export */ const floorstack_floorstack_itemvue_type_script_lang_js_ = (floorstack_itemvue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./assets/js/components/structure/floorstack/floorstack-item.vue





/* normalize component */
;
var floorstack_item_component = normalizeComponent(
  floorstack_floorstack_itemvue_type_script_lang_js_,
  floorstack_itemvue_type_template_id_1a86e5ae_render,
  floorstack_itemvue_type_template_id_1a86e5ae_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const floorstack_item = (floorstack_item_component.exports);
;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/index.js??vue-loader-options!./assets/js/components/structure/floorstack/floorstack.vue?vue&type=script&lang=js&
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

const floorstackvue_type_script_lang_js_axios = (__webpack_require__(9669)["default"]);



/* harmony default export */ const floorstackvue_type_script_lang_js_ = ({
  components: { FloorstackItem: floorstack_item },
  props: {
    token: "",
    floors: {
      type: Object,
      default: null,
    },
  },

  watch: {
    floors(val) {
      console.log("watch_building", val);
      this.floors = val;
    },
  },

  created() {},

  mounted() {},

  computed: {},

  data() {
    return {
      floorplans: [],
      groups: [],
      filterGroups: [],
      devices: [],
      files: [],
      selectedFile: null,
      selectedFileId: null,
    };
  },

  methods: {
    handleFloorItemClick(file) {
      this.selectedFile = file;
      this.selectedFileId = file.id;
      this.$emit("handleSelectedFloor", file);
    },
  },
});

;// CONCATENATED MODULE: ./assets/js/components/structure/floorstack/floorstack.vue?vue&type=script&lang=js&
 /* harmony default export */ const floorstack_floorstackvue_type_script_lang_js_ = (floorstackvue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./assets/js/components/structure/floorstack/floorstack.vue





/* normalize component */
;
var floorstack_component = normalizeComponent(
  floorstack_floorstackvue_type_script_lang_js_,
  floorstackvue_type_template_id_7a62cf69_render,
  floorstackvue_type_template_id_7a62cf69_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const floorstack = (floorstack_component.exports);
;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/index.js??vue-loader-options!./assets/js/components/structure/layout-right/layout-right.vue?vue&type=script&lang=js&
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//





// import LayoutRightViewer from "./layout-right-viewer.vue";


/* harmony default export */ const layout_rightvue_type_script_lang_js_ = ({
  components: { Floorstack: floorstack },
  props: {
    token: "",
    title: "",
    groupData: null,
    floorData: null,
    currentFloors: null,
    viewMode: "",
  },

  created() {},

  mounted() {},

  updated() {},

  computed: {
    showFloorStack() {
      return store.isShowFloorStackSelector;
    },
  },

  watch: {
    async floorData(val) {
      this.handleBackButton();
      if (val) {
        storeFunctions.setShowFloorStackSelector(false);

        let refresh = false;
        if ((this.floor && this.floor.id != val.id) || this.floor == null) {
          refresh = true;
        }
        this.floor = val;
        // this.showAddGroup = true;
        // this.showDeviceModeButton = true;
        // this.showAreaModeButton = true;
        // this.showGroupModeButton = true;

        this.selectedFileId = val.id;
        if (refresh && this.selectedFileId) {
          await this.getDevices(refresh);
          this.getGroups();
          this.getAreas();
        }
      }
    },

    viewMode(val) {
      if (val === "compact") {
        storeFunctions.setShowFloorStackSelector(true);
      } else {
        storeFunctions.setShowFloorStackSelector(false);
      }
    },

    showFloorStack(val) {
      this.isShowFloorStack = val;
    },
  },

  data() {
    return {
      showBackButton: false,
      // showGroupModeButton: false,
      // showDeviceModeButton: false,
      showAreaModeButton: false,
      showCreateGroupButton: false,
      showMoveGroupButton: false,
      showCreateDeviceButton: false,
      showDrawAreaButton: false,
      showDrawPolygonAreaButton: false,

      addGroup: false,
      addDevice: false,

      areaMode: false,
      addAreaMode: false,

      buttonEdit: true,
      floor: null,
      groups: [],
      devices: [],
      areas: [],
      selectedFileId: null,
      needRefresh: true,
      isShowFloorStack: true,
    };
  },

  methods: {
    handlePopupLayoutRightViwer() {
      this.$refs.LayoutRightViewer.isAddToGroupOpen = false;
      this.$refs.LayoutRightViewer.isAddDeviceOpen = false;
      this.$refs.LayoutRightViewer.isAddAreaOpen = false;
      storeFunctions.setPopup(false);
    },

    getGroups() {
      const token = this.token || "";
      (axios_default()).defaults.headers.common.Authorization = token;
      (axios_default()).defaults.headers.post["Content-Type"] =
        "application/x-www-form-urlencoded";
      axios_default().get(
          `${API_DOMAIN_MANIFERA}/api/v1/groups?file_id=${this.selectedFileId}`
        )
        .then((response) => {
          let responseGroups = response.data;
          responseGroups.forEach((data1) => {
            responseGroups.forEach((data2) => {
              if (data2.group_ids.includes(data1.id)) {
                data1.parent_id = data2.id;
              }
            });
          });

          responseGroups.forEach((data) => {
            data.childrens = this.findChildrens(data, responseGroups);
            let device_childrens = [
              ...data.device_ids,
              ...this.findDeviceChildrens(data, responseGroups),
            ];

            data.controllable = false;

            let unscanDevices = this.devices.filter((device) => {
              return (
                device_childrens.includes(device.id) &&
                (!device.serial_number || device.serial_number.length < 3)
              );
            });

            data.controllable = unscanDevices.length == 0;
          });

          this.groups = responseGroups;
          // this.$root.$children[0].$children[0].$children[1].updateGroups(
          //   responseGroups
          // );
          // this.$root.$children[0].$children[0].$children[1].updateTreeNode(
          //   responseGroups
          // );
          EventBus.$emit("updateGroups", responseGroups);
          // EventBus.$emit("updateTreeNode", responseGroups);s
        })
        .catch((error) => {})
        .then((a) => {});
    },

    // recursion to append all children ids of a group
    findChildrens(group, groups) {
      let childrens = [];
      groups.forEach((data) => {
        if (data.parent_id == group.id) {
          childrens.push(data.id);
          childrens = childrens.concat(this.findChildrens(data, groups));
        }
      });
      return childrens;
    },

    findDeviceChildrens(group, groups) {
      let childrens = [];
      if (group.childrens && group.childrens.length > 0) {
        group.childrens.forEach((childId) => {
          let child = groups.find((group) => {
            return group.id == childId;
          });
          if (child) {
            childrens = [
              ...childrens,
              ...child.device_ids,
              ...this.findDeviceChildrens(child, groups),
            ];
          }
        });
      }
      return childrens;
    },

    async handleSelectedFloorStack(v) {
      EventBus.$emit("checkLayersForFloorplan", v);
      storeFunctions.setShowFloorStackSelector(false);
      storeFunctions.setCurrentNav("Floorplans");
      storeFunctions.setSelectedFloorplan(v);
      this.showAddGroup = true;
      this.showDeviceMode = true;
      this.showAreaMode = true;
      this.showGroupMode = true;
      this.selectedFileId = v.id;
      this.floor = v;
      await this.getDevices(true);
      this.getGroups();
      this.getAreas();
    },

    getDevices(refresh = true) {
      (axios_default()).defaults.headers.common.Authorization = this.token;
      (axios_default()).defaults.headers.post["Content-Type"] =
        "application/x-www-form-urlencoded";
      axios_default().get(
          `${API_DOMAIN_MANIFERA}/api/v1/files/${this.selectedFileId}/devices`
        )
        .then((response) => {
          let responseData = response.data;
          // responseData.forEach((data1) => {
          //   this.groups.forEach((data2) => {
          //     if (data2.device_ids.includes(data1.id)) {
          //       data1.parent_id = data2.id;
          //     }
          //   });
          // });

          this.devices = responseData;
          this.needRefresh = refresh;
        })
        .catch((error) => {})
        .then((a) => {});
    },

    getAreas(refresh = true) {
      (axios_default()).defaults.headers.common.Authorization = this.token;
      (axios_default()).defaults.headers.post["Content-Type"] =
        "application/x-www-form-urlencoded";
      axios_default().get(`${API_DOMAIN_MANIFERA}/api/v1/files/${this.selectedFileId}/areas`)
        .then((response) => {
          let responseData = response.data;
          this.areas = responseData;
        })
        .catch((error) => {})
        .then((a) => {});
    },

    handleBackButton() {
      this.showAreaModeButton = true;

      this.showCreateGroupButton = true;
      this.showCreateDeviceButton = true;
      this.showMoveGroupButton = true;
      this.showBackButton = false;
      this.showDrawAreaButton = false;
      this.showDrawPolygonAreaButton = false;

      this.addGroup = false;
      this.addDevice = false;

      this.areaMode = false;
    },

    handleAreaModeButton() {
      this.showDrawAreaButton = true;
      this.showDrawPolygonAreaButton = true;
      this.showBackButton = true;

      this.showCreateGroupButton = false;
      this.showCreateDeviceButton = false;
      this.showMoveGroupButton = false;

      this.areaMode = true;
      this.addGroup = false;
      this.addDevice = false;

      this.showAreaModeButton = false;
    },

    handleCreateGroupButton() {
      this.addGroup = true;
      // this.$parent.popup = true;
      // storeFunctions.setPopup(true);

      this.addDevice = false;
      this.areaMode = false;
      this.handlePopupLayoutRightViwer();
    },

    handleMoveGroupButton() {
      this.areaMode = false;

      this.addGroup = false;
      this.addDevice = false;
    },

    handleCreateDeviceButton() {
      this.addDevice = true;
      // this.$parent.popup = true;

      this.addGroup = false;
      this.areaMode = false;

      this.handlePopupLayoutRightViwer();
      // EventBus.$emit("onEnableCreateDevice");
    },

    handleDrawAreaButton() {
      EventBus.$emit("handleSwitchToDrawArea");
    },

    handleDrawPolygonAreaButton() {
      EventBus.$emit("handleSwitchToDrawPolygonArea");
    },
  },
  created() {
    EventBus.$on("getGroups", this.getGroups);
    EventBus.$on("getDevices", this.getDevices);
    EventBus.$on("getAreas", this.getAreas);
  },
  destroyed() {
    EventBus.$off("getGroups", this.getGroups);
    EventBus.$off("getDevices", this.getDevices);
    EventBus.$off("getAreas", this.getAreas);
  },
});

;// CONCATENATED MODULE: ./assets/js/components/structure/layout-right/layout-right.vue?vue&type=script&lang=js&
 /* harmony default export */ const layout_right_layout_rightvue_type_script_lang_js_ = (layout_rightvue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./assets/js/components/structure/layout-right/layout-right.vue





/* normalize component */
;
var layout_right_component = normalizeComponent(
  layout_right_layout_rightvue_type_script_lang_js_,
  layout_rightvue_type_template_id_570dc545_render,
  layout_rightvue_type_template_id_570dc545_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const layout_right = (layout_right_component.exports);
;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/index.js??vue-loader-options!./assets/js/components/structure/layout-structure.vue?vue&type=script&lang=js&
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//







/* harmony default export */ const layout_structurevue_type_script_lang_js_ = ({
  components: { LayoutLeft: layout_left, LayoutRight: layout_right, Modal: modal },
  props: {
    buildings: {
      default() {
        return "[]";
      },
    },
    project: {
      default() {
        return {};
      },
    },
    groups: {
      default() {
        return "[]";
      },
    },
    floors: {
      default() {
        return "[]";
      },
    },
    devices: {
      default() {
        return "[]";
      },
    },
    token: "",
  },

  mounted() {
    //JSON.parse(this.buildings); nho parse du lieu
  },

  computed: {
    selectedFloorplan() {
      return store.selectedFloorplan;
    },
    selectedGroup() {
      return store.selectedGroup;
    },
  },

  watch: {
    selectedFloorplan(val) {
      if (val) {
        this.floorData = val;
        this.title = val.full_name;
      } else {
        this.title = "";
      }
    },
  },

  created() {},

  data() {
    return {
      colLeft: "col-4",
      colRight: "col-8",
      title: "",
      // popup: false,
      // data: {},
      floorData: null,
      currentFloors: null,
      currentNavigation: "",
      viewMode: "",
      showModalEditFloorplan: false,
      loading: false,
      errorMessage: "",
      newGroups: [],
    };
  },

  methods: {
    // handleSelectBuilding(v) {
    //   console.log("handleSelectBuilding", v);
    //   this.currentFloors = v;
    // },

    handleExpandedView() {
      this.colLeft = "col-12";
      this.colRight = "col-0 d-none";
      this.viewMode = "expand";
    },

    handleCompactView() {
      this.colLeft = "col-4";
      this.colRight = "col-8";
      this.viewMode = "compact";
    },

    handleGroup(obj) {
      this.title = obj.name;
    },

    changeExpanded(status) {
      if (status == false) {
        this.colLeft = "col-4";
        this.colRight = "col-8";
      } else {
        this.colLeft = "col-12";
        this.colRight = "col-0";
      }
    },

    editBuilding(obj) {
      this.$refs.layoutLeft.$children[1].expandedClick();
      this.$refs.layoutLeft.handleEditBuilding();
    },

    resetActions() {
      // this.popup = false;
      storeFunctions.setPopup(false);
      // this.data = {};
      storeFunctions.setSelectedGroup(null);
    },

    handlePopupLayOutRight() {
      this.$refs.layoutRight.addGroup = false;
      this.$refs.layoutRight.areaMode = false;
      this.$refs.layoutRight.addDevice = false;
      this.$refs.layoutRight.$children[0].isAddAreaOpen = false;
      this.$refs.layoutRight.$children[0].isAddDeviceOpen = false;
      this.$refs.layoutRight.$children[0].isAddToGroupOpen = false;
    },

    // This groups data has parent_id key in the children group
    getNewGroups(data) {
      this.newGroups = data;
    },

    handleItemClick(obj, selectedFloor = null) {
      console.log("handleItemClick", obj, selectedFloor);
      this.handlePopupLayOutRight();
      storeFunctions.setCurrentNav("Floorplans");
      if (obj.type == "Group") {
        storeFunctions.setSelectedGroup(obj);
        // EventBus.$emit("getScenarios", obj);
        storeFunctions.setPopup(true);

        // This parentGroups is considered as a "history" of the groups when user click on the children group
        const parentGroups = getParentGroup(this.newGroups, obj.id);

        this.$refs.layoutRight.$children[0].$emit("handleSelectGroup", obj);
        this.$refs.layoutRight.$children[0].$emit(
          "handleSetHistory",
          parentGroups
        );

        if (selectedFloor && this.floorData.id != selectedFloor.id) {
          this.floorData = selectedFloor;
          this.title = selectedFloor.full_name;
        }
        // this.data = obj;
      } else if (obj.type == "Floorplan") {
        this.checkLayersForFloorplan(obj);
        this.title = obj.full_name;
        // this.popup = false;
        storeFunctions.setPopup(false);
        if (!this.floorData || this.floorData.id != obj.id) {
          this.floorData = obj;
          storeFunctions.setSelectedFloorplan(this.floorData);
        }
      }
    },

    handleClickFloor(v) {
      console.log("handleClickFloor", v);
      // this.data = v;
      storeFunctions.setSelectedFloorplan(v);
    },

    checkLayersForFloorplan(floor) {
      if (
        floor.floor_layer_name == "" ||
        floor.fixture_layer_name == "" ||
        floor.sensor_layer_name == ""
      ) {
        this.showModalEditFloorplan = true;
      }
    },

    handleActionEditFloorplanModal() {
      this.showModalEditFloorplan = false;
      EventBus.$emit("handleEditFloor", this.floorData);
    },

    handleFloorsChange(floors) {
      console.log("handleFloorsChange", floors);
      this.currentFloors = floors;
    },
  },
  created() {
    EventBus.$on("resetActions", this.resetActions);
    EventBus.$on("handleItemClick", this.handleItemClick);
    EventBus.$on("checkLayersForFloorplan", this.checkLayersForFloorplan);
    EventBus.$on("updateGroups", this.getNewGroups);
  },
  destroyed() {
    EventBus.$off("resetActions", this.resetActions);
    EventBus.$off("handleItemClick", this.handleItemClick);
    EventBus.$off("checkLayersForFloorplan", this.checkLayersForFloorplan);
  },
});

;// CONCATENATED MODULE: ./assets/js/components/structure/layout-structure.vue?vue&type=script&lang=js&
 /* harmony default export */ const structure_layout_structurevue_type_script_lang_js_ = (layout_structurevue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./assets/js/components/structure/layout-structure.vue





/* normalize component */
;
var layout_structure_component = normalizeComponent(
  structure_layout_structurevue_type_script_lang_js_,
  layout_structurevue_type_template_id_7369adf8_render,
  layout_structurevue_type_template_id_7369adf8_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const layout_structure = (layout_structure_component.exports);
;// CONCATENATED MODULE: ./assets/js/dummy/dummy_building.js
const buildings = JSON.stringify([
  {
    address: "444444",
    name: "Building 1",
    status: true,
    id: 1,
    project_id: 1,
    amount_of_storey: 11,
    position: 0,
    floorplans: [
      {
        floor_layer_name: "",
        fixture_layer_name: "",
        sensor_layer_name: "",
        ceiling_height: null,
        scale: null,
        full_name: null,
        short_name: null,
        position: null,
        display_name: "1642412644.dxf",
        status: true,
        id: 61,
        file_name: "1642412644.dxf",
        user_id: 1,
        created_at: "2022-06-03T06:40:24.809220",
        updated_at: "2022-07-27T07:12:55.628022",
        project_id: 2,
        layer_names: [
          "0",
          "DEFPOINTS",
          "BL$2A---_SNIJLIJN",
          "BL$2B---_KADER",
          "EL63101-_LICHT-ARM",
        ],
        percentage: null,
        building_id: 1,
        download_url:
          "http://localhost/api/v1/files/61/download?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjQ4MTQzMDMyNDIsInN1YiI6IjEifQ.Qd2QW-OuY_5hbZEaxr_fZpG7x7hu0g04d8Z6-QDo_K4",
        people_tracking: null,
      },
      {
        floor_layer_name: "XREF",
        fixture_layer_name: "EL63101-_LICHT-ARM",
        sensor_layer_name: "EL63101-_LICHT-ARM",
        ceiling_height: null,
        scale: null,
        full_name: "Basement 1",
        short_name: "B1",
        position: 11,
        display_name: "Summa VdV Best Kamer 1.dxf",
        status: true,
        id: 1,
        file_name: "Summa VdV Best Kamer 1.dxf",
        user_id: 1,
        created_at: "2022-03-14T07:19:38.779905",
        updated_at: "2022-07-27T07:12:55.628022",
        project_id: 2,
        layer_names: [
          "0",
          "DEFPOINTS",
          "BL$2A---_SNIJLIJN",
          "BL$2B---_KADER",
          "EL63101-_LICHT-ARM",
          "XREF",
        ],
        percentage: 57.8947,
        building_id: 1,
        download_url:
          "http://localhost/api/v1/files/1/download?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjQ4MTQzMDMyNDIsInN1YiI6IjEifQ.Qd2QW-OuY_5hbZEaxr_fZpG7x7hu0g04d8Z6-QDo_K4",
        people_tracking: null,
      },
      {
        floor_layer_name: "Architect-Plattegrond",
        fixture_layer_name: "Noodverlichting",
        sensor_layer_name: "",
        ceiling_height: null,
        scale: null,
        full_name: "Test AAA",
        short_name: "Test AAA",
        position: 10,
        display_name: "A201013 Nieuw Kantoorpand.dxf",
        status: true,
        id: 54,
        file_name: "A201013 Nieuw Kantoorpand.dxf",
        user_id: 1,
        created_at: "2022-04-28T02:55:50.926990",
        updated_at: "2022-07-27T07:12:55.628022",
        project_id: 2,
        layer_names: [
          "0",
          "00KAD070",
          "Defpoints",
          "Noodverlichting",
          "Kabelgoot-tekst",
          "symbool",
          "Bras-PV paneel",
          "Bras-Materialenlijst",
          "Bras-Kader",
          "Architect-Plattegrond",
          "Bras-Inbouw",
          "Bras-Tekst",
          "Bras-Mantelbuis",
          "MelderLus",
          "Bras-Inbraak",
          "Bras-BMC",
          "Bras-nummer",
          "Bras-Opbouw",
          "Bras-Afdekramen",
          "Bras-Renvooi",
          "Bras-Data",
          "Viewport",
          "Zwakstroom",
          "Xref01_BG_BRAS$0$Architect-systeemplafond",
          "Xref01_BG_BRAS$0$Architect-Plattegrond",
          "Xref02_VD_BRAS$0$NONE",
          "Xref02_VD_BRAS$0$SectionCutEdges",
          "Xref02_VD_BRAS$0$Architect-Plattegrond",
          "Xref02_VD_BRAS$0$Architect-systeemplafond",
          "Xref03_DAK_BRAS$0$NONE",
          "Xref03_DAK_BRAS$0$Architect-Plattegrond",
          "Xref04_TERREIN_BRAS$0$wegdeel (vlak)",
          "Xref04_TERREIN_BRAS$0$NONE",
          "Xref04_TERREIN_BRAS$0$SectionCutEdges",
          "Xref04_TERREIN_BRAS$0$Plattegrond",
          "Xref04_TERREIN_BRAS$0$Architect-Plattegrond",
          "Bras-Tekst-Inbraak",
          "OVK_Scheiding",
          "00ATT018",
          "Xref01_BG_BRAS$0$Brandslanghaspels",
          "Xref01_BG_BRAS$0$Brandslanghaspels_Tekst",
          "Xref02_VD_BRAS$0$Brandslanghaspels",
          "Xref02_VD_BRAS$0$Brandslanghaspels_Tekst",
          "Bras-Tekst-Data",
          "Xref01_BG_BRAS$0$Indeling",
          "EL6131--_KG_D",
          "EM6131--_KG",
          "Bras-Verlichting",
          "EL-verlichting",
          "EL-verlichting-Opbouw",
          "NONE",
          "EL-verlichting-Spots",
          "Xref02_VD_BRAS$0$OUD",
          "BL$2A---_SNIJLIJN",
          "BL$2B---_PS-KADER",
          "BL$8V---_VOUWLIJN",
          "BL$3A---_VPORTS",
          "ONDERHOEK",
          "LOGO",
          "WL561---_AANVOER",
          "WL561---_RETOUR",
          "Xref",
          "Hulplijn",
          "WL5771--_T_KANAAL-C",
          "WL5773--_HARTLIJN",
          "WL5771--_T_ORNAMENT-C",
          "WB5771--_T_ORNAMENT-C",
          "WL5771--_T_FLEX-C",
          "WL5771--_T_KANAAL-H",
          "WL5772--_R_ORNAMENT-C",
          "WB5772--_R_ORNAMENT-C",
          "WL5772--_R_KANAAL-C",
          "WL5772--_R_FLEX-C",
          "WL5772--_R_KANAAL-H",
          "Worp",
          "WL5771--_T_KANAAL-H3",
          "WL6510--_SYMBOOL",
          "Service",
          "WM570---_T_MATEN-B",
          "WL5771--_T_KANAAL-H2",
          "WL5772--_R_PIJL",
          "WB577---_ATT",
          "WL5772--_R_KANAAL-H2",
          "WL5771--_T_PIJL",
          "WL5772--_R_KANAAL-H1",
          "WM570---_R_MATEN-B",
          "WL5505--_FREON-A",
          "WL5506--_FREON-R",
          "WL550---_PIJL-A",
          "WB550---_ATT",
          "WL52----_RIOOL",
          "WL52----_HARTLIJN",
          "WL52----_SPIE",
          "WL52----_SYMBOOL",
          "WL52----_VERLOOP",
          "Elektra",
          "Mantelbuis",
          "WERKTEKENINGEN$0$NONE",
          "WERKTEKENINGEN$0$Laag_nul",
          "WERKTEKENINGEN$0$Plafondplan",
          "WERKTEKENINGEN$0$Stramien",
          "WERKTEKENINGEN$0$Ruimtenr.",
          "EL6112--",
          "EL6311--",
          "00KAD025",
          "00ATT025",
          "BL$2----",
          "K-LIJN",
          "G-ANNO-TTLB",
          "G-ANNO-TEXT",
          "BL$4----",
          "00ATT035",
          "00ATT050",
          "Layer1",
          "EL6222--",
          "EL6312--",
          "plat",
          "W-installatie$0$BL$2A---_SNIJLIJN",
          "W-installatie$0$BL$2B---_PS-KADER",
          "W-installatie$0$BL$8V---_VOUWLIJN",
          "W-installatie$0$BL$3A---_VPORTS",
          "W-installatie$0$ONDERHOEK",
          "W-installatie$0$LOGO",
          "W-installatie$0$WL561---_AANVOER",
          "W-installatie$0$WL561---_RETOUR",
          "W-installatie$0$Xref",
          "W-installatie$0$Hulplijn",
          "W-installatie$0$WL5771--_T_KANAAL-C",
          "W-installatie$0$WL5773--_HARTLIJN",
          "W-installatie$0$WL5771--_T_ORNAMENT-C",
          "W-installatie$0$WB5771--_T_ORNAMENT-C",
          "W-installatie$0$WL5771--_T_FLEX-C",
          "W-installatie$0$WL5771--_T_KANAAL-H",
          "W-installatie$0$WL5772--_R_ORNAMENT-C",
          "W-installatie$0$WB5772--_R_ORNAMENT-C",
          "W-installatie$0$WL5772--_R_KANAAL-C",
          "W-installatie$0$WL5772--_R_FLEX-C",
          "W-installatie$0$WL5772--_R_KANAAL-H",
          "W-installatie$0$Worp",
          "W-installatie$0$WL5771--_T_KANAAL-H3",
          "W-installatie$0$WL6510--_SYMBOOL",
          "W-installatie$0$Service",
          "W-installatie$0$WM570---_T_MATEN-B",
          "W-installatie$0$WL5771--_T_KANAAL-H2",
          "W-installatie$0$WL5772--_R_PIJL",
          "W-installatie$0$WB577---_ATT",
          "W-installatie$0$WL5772--_R_KANAAL-H2",
          "W-installatie$0$WL5771--_T_PIJL",
          "W-installatie$0$WL5772--_R_KANAAL-H1",
          "W-installatie$0$WM570---_R_MATEN-B",
          "W-installatie$0$WL5505--_FREON-A",
          "W-installatie$0$WL5506--_FREON-R",
          "W-installatie$0$WL550---_PIJL-A",
          "W-installatie$0$WB550---_ATT",
          "W-installatie$0$WL52----_RIOOL",
          "W-installatie$0$WL52----_HARTLIJN",
          "W-installatie$0$WL52----_SPIE",
          "W-installatie$0$WL52----_SYMBOOL",
          "W-installatie$0$WL52----_VERLOOP",
          "W-installatie$0$Elektra",
          "W-installatie$0$Mantelbuis",
          "EL6132--",
          "EL6221--",
          "Bras Audio Video",
          "EL6421--",
          "Maatvoering vloerdozen",
          "EL6524--",
        ],
        percentage: null,
        building_id: 1,
        download_url:
          "http://localhost/api/v1/files/54/download?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjQ4MTQzMDMyNDIsInN1YiI6IjEifQ.Qd2QW-OuY_5hbZEaxr_fZpG7x7hu0g04d8Z6-QDo_K4",
        people_tracking: null,
      },
      {
        floor_layer_name: "XREF",
        fixture_layer_name: "EL63101-_LICHT-ARM",
        sensor_layer_name: "A--L$01A__Algemeen",
        ceiling_height: null,
        scale: null,
        full_name: "Test AAA",
        short_name: "Test AAA",
        position: 9,
        display_name: "200163B BG leeg.dxf",
        status: true,
        id: 53,
        file_name: "200163B BG leeg.dxf",
        user_id: 1,
        created_at: "2022-04-28T02:31:00.148110",
        updated_at: "2022-07-27T07:12:55.628022",
        project_id: 2,
        layer_names: [
          "0",
          "DEFPOINTS",
          "BL$2A---_SNIJLIJN",
          "BL$2B---_KADER",
          "XREF",
          "Utilicht",
          "Laag 1",
          "A--L$01A__Algemeen",
          "EL63101-_LICHT-ARM",
        ],
        percentage: null,
        building_id: 1,
        download_url:
          "http://localhost/api/v1/files/53/download?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjQ4MTQzMDMyNDIsInN1YiI6IjEifQ.Qd2QW-OuY_5hbZEaxr_fZpG7x7hu0g04d8Z6-QDo_K4",
        people_tracking: null,
      },
      {
        floor_layer_name: "Architect-Plattegrond",
        fixture_layer_name: "Noodverlichting",
        sensor_layer_name: "",
        ceiling_height: null,
        scale: null,
        full_name: "Final Test",
        short_name: "aa",
        position: 8,
        display_name: "A201013 Nieuw Kantoorpand.dxf",
        status: true,
        id: 60,
        file_name: "A201013 Nieuw Kantoorpand.dxf",
        user_id: 1,
        created_at: "2022-04-28T10:51:04.764799",
        updated_at: "2022-07-27T07:12:55.628022",
        project_id: 2,
        layer_names: [
          "0",
          "00KAD070",
          "Defpoints",
          "Noodverlichting",
          "Kabelgoot-tekst",
          "symbool",
          "Bras-PV paneel",
          "Bras-Materialenlijst",
          "Bras-Kader",
          "Architect-Plattegrond",
          "Bras-Inbouw",
          "Bras-Tekst",
          "Bras-Mantelbuis",
          "MelderLus",
          "Bras-Inbraak",
          "Bras-BMC",
          "Bras-nummer",
          "Bras-Opbouw",
          "Bras-Afdekramen",
          "Bras-Renvooi",
          "Bras-Data",
          "Viewport",
          "Zwakstroom",
          "Xref01_BG_BRAS$0$Architect-systeemplafond",
          "Xref01_BG_BRAS$0$Architect-Plattegrond",
          "Xref02_VD_BRAS$0$NONE",
          "Xref02_VD_BRAS$0$SectionCutEdges",
          "Xref02_VD_BRAS$0$Architect-Plattegrond",
          "Xref02_VD_BRAS$0$Architect-systeemplafond",
          "Xref03_DAK_BRAS$0$NONE",
          "Xref03_DAK_BRAS$0$Architect-Plattegrond",
          "Xref04_TERREIN_BRAS$0$wegdeel (vlak)",
          "Xref04_TERREIN_BRAS$0$NONE",
          "Xref04_TERREIN_BRAS$0$SectionCutEdges",
          "Xref04_TERREIN_BRAS$0$Plattegrond",
          "Xref04_TERREIN_BRAS$0$Architect-Plattegrond",
          "Bras-Tekst-Inbraak",
          "OVK_Scheiding",
          "00ATT018",
          "Xref01_BG_BRAS$0$Brandslanghaspels",
          "Xref01_BG_BRAS$0$Brandslanghaspels_Tekst",
          "Xref02_VD_BRAS$0$Brandslanghaspels",
          "Xref02_VD_BRAS$0$Brandslanghaspels_Tekst",
          "Bras-Tekst-Data",
          "Xref01_BG_BRAS$0$Indeling",
          "EL6131--_KG_D",
          "EM6131--_KG",
          "Bras-Verlichting",
          "EL-verlichting",
          "EL-verlichting-Opbouw",
          "NONE",
          "EL-verlichting-Spots",
          "Xref02_VD_BRAS$0$OUD",
          "BL$2A---_SNIJLIJN",
          "BL$2B---_PS-KADER",
          "BL$8V---_VOUWLIJN",
          "BL$3A---_VPORTS",
          "ONDERHOEK",
          "LOGO",
          "WL561---_AANVOER",
          "WL561---_RETOUR",
          "Xref",
          "Hulplijn",
          "WL5771--_T_KANAAL-C",
          "WL5773--_HARTLIJN",
          "WL5771--_T_ORNAMENT-C",
          "WB5771--_T_ORNAMENT-C",
          "WL5771--_T_FLEX-C",
          "WL5771--_T_KANAAL-H",
          "WL5772--_R_ORNAMENT-C",
          "WB5772--_R_ORNAMENT-C",
          "WL5772--_R_KANAAL-C",
          "WL5772--_R_FLEX-C",
          "WL5772--_R_KANAAL-H",
          "Worp",
          "WL5771--_T_KANAAL-H3",
          "WL6510--_SYMBOOL",
          "Service",
          "WM570---_T_MATEN-B",
          "WL5771--_T_KANAAL-H2",
          "WL5772--_R_PIJL",
          "WB577---_ATT",
          "WL5772--_R_KANAAL-H2",
          "WL5771--_T_PIJL",
          "WL5772--_R_KANAAL-H1",
          "WM570---_R_MATEN-B",
          "WL5505--_FREON-A",
          "WL5506--_FREON-R",
          "WL550---_PIJL-A",
          "WB550---_ATT",
          "WL52----_RIOOL",
          "WL52----_HARTLIJN",
          "WL52----_SPIE",
          "WL52----_SYMBOOL",
          "WL52----_VERLOOP",
          "Elektra",
          "Mantelbuis",
          "WERKTEKENINGEN$0$NONE",
          "WERKTEKENINGEN$0$Laag_nul",
          "WERKTEKENINGEN$0$Plafondplan",
          "WERKTEKENINGEN$0$Stramien",
          "WERKTEKENINGEN$0$Ruimtenr.",
          "EL6112--",
          "EL6311--",
          "00KAD025",
          "00ATT025",
          "BL$2----",
          "K-LIJN",
          "G-ANNO-TTLB",
          "G-ANNO-TEXT",
          "BL$4----",
          "00ATT035",
          "00ATT050",
          "Layer1",
          "EL6222--",
          "EL6312--",
          "plat",
          "W-installatie$0$BL$2A---_SNIJLIJN",
          "W-installatie$0$BL$2B---_PS-KADER",
          "W-installatie$0$BL$8V---_VOUWLIJN",
          "W-installatie$0$BL$3A---_VPORTS",
          "W-installatie$0$ONDERHOEK",
          "W-installatie$0$LOGO",
          "W-installatie$0$WL561---_AANVOER",
          "W-installatie$0$WL561---_RETOUR",
          "W-installatie$0$Xref",
          "W-installatie$0$Hulplijn",
          "W-installatie$0$WL5771--_T_KANAAL-C",
          "W-installatie$0$WL5773--_HARTLIJN",
          "W-installatie$0$WL5771--_T_ORNAMENT-C",
          "W-installatie$0$WB5771--_T_ORNAMENT-C",
          "W-installatie$0$WL5771--_T_FLEX-C",
          "W-installatie$0$WL5771--_T_KANAAL-H",
          "W-installatie$0$WL5772--_R_ORNAMENT-C",
          "W-installatie$0$WB5772--_R_ORNAMENT-C",
          "W-installatie$0$WL5772--_R_KANAAL-C",
          "W-installatie$0$WL5772--_R_FLEX-C",
          "W-installatie$0$WL5772--_R_KANAAL-H",
          "W-installatie$0$Worp",
          "W-installatie$0$WL5771--_T_KANAAL-H3",
          "W-installatie$0$WL6510--_SYMBOOL",
          "W-installatie$0$Service",
          "W-installatie$0$WM570---_T_MATEN-B",
          "W-installatie$0$WL5771--_T_KANAAL-H2",
          "W-installatie$0$WL5772--_R_PIJL",
          "W-installatie$0$WB577---_ATT",
          "W-installatie$0$WL5772--_R_KANAAL-H2",
          "W-installatie$0$WL5771--_T_PIJL",
          "W-installatie$0$WL5772--_R_KANAAL-H1",
          "W-installatie$0$WM570---_R_MATEN-B",
          "W-installatie$0$WL5505--_FREON-A",
          "W-installatie$0$WL5506--_FREON-R",
          "W-installatie$0$WL550---_PIJL-A",
          "W-installatie$0$WB550---_ATT",
          "W-installatie$0$WL52----_RIOOL",
          "W-installatie$0$WL52----_HARTLIJN",
          "W-installatie$0$WL52----_SPIE",
          "W-installatie$0$WL52----_SYMBOOL",
          "W-installatie$0$WL52----_VERLOOP",
          "W-installatie$0$Elektra",
          "W-installatie$0$Mantelbuis",
          "EL6132--",
          "EL6221--",
          "Bras Audio Video",
          "EL6421--",
          "Maatvoering vloerdozen",
          "EL6524--",
        ],
        percentage: null,
        building_id: 1,
        download_url:
          "http://localhost/api/v1/files/60/download?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjQ4MTQzMDMyNDIsInN1YiI6IjEifQ.Qd2QW-OuY_5hbZEaxr_fZpG7x7hu0g04d8Z6-QDo_K4",
        people_tracking: null,
      },
      {
        floor_layer_name: "XREF",
        fixture_layer_name: "EL63101-_LICHT-ARM",
        sensor_layer_name: "A--L$01A__Algemeen",
        ceiling_height: null,
        scale: null,
        full_name: "ax",
        short_name: null,
        position: 7,
        display_name: "200163B BG leeg.dxf",
        status: true,
        id: 58,
        file_name: "200163B BG leeg.dxf",
        user_id: 1,
        created_at: "2022-04-28T09:57:12.623297",
        updated_at: "2022-07-27T07:12:55.628022",
        project_id: 2,
        layer_names: [
          "0",
          "DEFPOINTS",
          "BL$2A---_SNIJLIJN",
          "BL$2B---_KADER",
          "XREF",
          "Utilicht",
          "Laag 1",
          "A--L$01A__Algemeen",
          "EL63101-_LICHT-ARM",
        ],
        percentage: null,
        building_id: 1,
        download_url:
          "http://localhost/api/v1/files/58/download?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjQ4MTQzMDMyNDIsInN1YiI6IjEifQ.Qd2QW-OuY_5hbZEaxr_fZpG7x7hu0g04d8Z6-QDo_K4",
        people_tracking: null,
      },
      {
        floor_layer_name: "0",
        fixture_layer_name: "EL63101-_LICHT-ARM",
        sensor_layer_name: "EL63101-_LICHT-ARM",
        ceiling_height: null,
        scale: null,
        full_name: "Test 2",
        short_name: "aaaaa",
        position: 4,
        display_name: "1642412644.dxf",
        status: true,
        id: 14,
        file_name: "1642412644.dxf",
        user_id: 1,
        created_at: "2022-04-25T04:16:10.770487",
        updated_at: "2022-07-27T07:12:55.628022",
        project_id: 2,
        layer_names: [
          "0",
          "DEFPOINTS",
          "BL$2A---_SNIJLIJN",
          "BL$2B---_KADER",
          "EL63101-_LICHT-ARM",
        ],
        percentage: null,
        building_id: 1,
        download_url:
          "http://localhost/api/v1/files/14/download?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjQ4MTQzMDMyNDIsInN1YiI6IjEifQ.Qd2QW-OuY_5hbZEaxr_fZpG7x7hu0g04d8Z6-QDo_K4",
        people_tracking: null,
      },
      {
        floor_layer_name: "XREF",
        fixture_layer_name: "EL63101-_LICHT-ARM",
        sensor_layer_name: "EL63101-_LICHT-ARM",
        ceiling_height: null,
        scale: null,
        full_name: "Floor 3",
        short_name: "3F",
        position: 3,
        display_name: "Kantoor Summa1.dxf",
        status: false,
        id: 12,
        file_name: "Kantoor Summa1.dxf",
        user_id: 1,
        created_at: "2022-03-31T10:25:01.502655",
        updated_at: "2022-07-27T07:12:55.628022",
        project_id: 2,
        layer_names: [
          "0",
          "DEFPOINTS",
          "BL$2A---_SNIJLIJN",
          "BL$2B---_KADER",
          "XREF",
          "Viewport",
          "EL63101-_LICHT-ARM",
          "plattegrond",
        ],
        percentage: 5.8824,
        building_id: 1,
        download_url:
          "http://localhost/api/v1/files/12/download?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjQ4MTQzMDMyNDIsInN1YiI6IjEifQ.Qd2QW-OuY_5hbZEaxr_fZpG7x7hu0g04d8Z6-QDo_K4",
        people_tracking: null,
      },
      {
        floor_layer_name: "XREF",
        fixture_layer_name: "EL63101-_LICHT-ARM",
        sensor_layer_name: "EL63101-_LICHT-ARM",
        ceiling_height: null,
        scale: null,
        full_name: "Test",
        short_name: "1F",
        position: 2,
        display_name: "Summa VdV Best Kamer 1.dxf",
        status: true,
        id: 13,
        file_name: "Summa VdV Best Kamer 1.dxf",
        user_id: 1,
        created_at: "2022-04-13T04:04:03.313948",
        updated_at: "2022-07-27T07:12:55.628022",
        project_id: 2,
        layer_names: [
          "0",
          "DEFPOINTS",
          "BL$2A---_SNIJLIJN",
          "BL$2B---_KADER",
          "EL63101-_LICHT-ARM",
          "XREF",
        ],
        percentage: 5.8824,
        building_id: 1,
        download_url:
          "http://localhost/api/v1/files/13/download?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjQ4MTQzMDMyNDIsInN1YiI6IjEifQ.Qd2QW-OuY_5hbZEaxr_fZpG7x7hu0g04d8Z6-QDo_K4",
        people_tracking: null,
      },
      {
        floor_layer_name: "XREF",
        fixture_layer_name: "EL63101-_LICHT-ARM",
        sensor_layer_name: "EL63101-_LICHT-ARM",
        ceiling_height: null,
        scale: null,
        full_name: "Basement",
        short_name: "B0",
        position: 1,
        display_name: "Summa VdV Best Kamer 1.dxf",
        status: false,
        id: 2,
        file_name: "Summa VdV Best Kamer 1.dxf",
        user_id: 1,
        created_at: "2022-03-16T04:40:26.985394",
        updated_at: "2022-07-27T07:12:55.628022",
        project_id: 2,
        layer_names: [
          "0",
          "DEFPOINTS",
          "BL$2A---_SNIJLIJN",
          "BL$2B---_KADER",
          "EL63101-_LICHT-ARM",
          "XREF",
        ],
        percentage: null,
        building_id: 1,
        download_url:
          "http://localhost/api/v1/files/2/download?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjQ4MTQzMDMyNDIsInN1YiI6IjEifQ.Qd2QW-OuY_5hbZEaxr_fZpG7x7hu0g04d8Z6-QDo_K4",
        people_tracking: null,
      },
      {
        floor_layer_name: "XREF",
        fixture_layer_name: "XREF",
        sensor_layer_name: "XREF",
        ceiling_height: null,
        scale: null,
        full_name: "InputOutput",
        short_name: "0",
        position: 0,
        display_name: "Summa VdV Best Kamer 1.dxf",
        status: true,
        id: 65,
        file_name: "Summa VdV Best Kamer 1.dxf",
        user_id: 1,
        created_at: "2022-08-22T06:58:54.314597",
        updated_at: "2022-08-22T06:59:16.869611",
        project_id: 1,
        layer_names: [
          "0",
          "DEFPOINTS",
          "BL$2A---_SNIJLIJN",
          "BL$2B---_KADER",
          "EL63101-_LICHT-ARM",
          "XREF",
        ],
        percentage: null,
        building_id: 1,
        download_url:
          "http://localhost/api/v1/files/65/download?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjQ4MTQzMDMyNDIsInN1YiI6IjEifQ.Qd2QW-OuY_5hbZEaxr_fZpG7x7hu0g04d8Z6-QDo_K4",
        people_tracking: null,
      },
    ],
  },
  {
    address: "124124",
    name: "Building 2",
    status: true,
    id: 4,
    project_id: 1,
    amount_of_storey: 4,
    position: 1,
    floorplans: [
      {
        floor_layer_name: "",
        fixture_layer_name: "",
        sensor_layer_name: "",
        ceiling_height: null,
        scale: null,
        full_name: "Floor 1",
        short_name: "test",
        position: null,
        display_name: "Summa VdV Best Kamer 1.dxf",
        status: true,
        id: 8,
        file_name: "Summa VdV Best Kamer 1.dxf",
        user_id: 1,
        created_at: "2022-03-29T10:39:37.553540",
        updated_at: "2022-07-27T07:12:55.628022",
        project_id: 2,
        layer_names: [
          "0",
          "DEFPOINTS",
          "BL$2A---_SNIJLIJN",
          "BL$2B---_KADER",
          "EL63101-_LICHT-ARM",
          "XREF",
        ],
        percentage: null,
        building_id: 4,
        download_url:
          "http://localhost/api/v1/files/8/download?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjQ4MTQzMDMyNDIsInN1YiI6IjEifQ.Qd2QW-OuY_5hbZEaxr_fZpG7x7hu0g04d8Z6-QDo_K4",
        people_tracking: null,
      },
      {
        floor_layer_name: "XREF",
        fixture_layer_name: "EL63101-_LICHT-ARM",
        sensor_layer_name: "EL63101-_LICHT-ARM",
        ceiling_height: null,
        scale: null,
        full_name: "Floor 4",
        short_name: "Summa portal",
        position: null,
        display_name: "Summa VdV Best Kamer 1.dxf",
        status: true,
        id: 9,
        file_name: "Summa VdV Best Kamer 1.dxf",
        user_id: 1,
        created_at: "2022-03-29T10:40:26.524784",
        updated_at: "2022-07-27T07:12:55.628022",
        project_id: 2,
        layer_names: [
          "0",
          "DEFPOINTS",
          "BL$2A---_SNIJLIJN",
          "BL$2B---_KADER",
          "EL63101-_LICHT-ARM",
          "XREF",
        ],
        percentage: null,
        building_id: 4,
        download_url:
          "http://localhost/api/v1/files/9/download?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjQ4MTQzMDMyNDIsInN1YiI6IjEifQ.Qd2QW-OuY_5hbZEaxr_fZpG7x7hu0g04d8Z6-QDo_K4",
        people_tracking: null,
      },
      {
        floor_layer_name: "XREF",
        fixture_layer_name: "EL63101-_LICHT-ARM",
        sensor_layer_name: "EL63101-_LICHT-ARM",
        ceiling_height: null,
        scale: null,
        full_name: "Floor 2",
        short_name: "Summa portal",
        position: null,
        display_name: "Summa VdV Best Kamer 1.dxf",
        status: true,
        id: 10,
        file_name: "Summa VdV Best Kamer 1.dxf",
        user_id: 1,
        created_at: "2022-03-29T10:40:53.003105",
        updated_at: "2022-07-27T07:12:55.628022",
        project_id: 2,
        layer_names: [
          "0",
          "DEFPOINTS",
          "BL$2A---_SNIJLIJN",
          "BL$2B---_KADER",
          "EL63101-_LICHT-ARM",
          "XREF",
        ],
        percentage: null,
        building_id: 4,
        download_url:
          "http://localhost/api/v1/files/10/download?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjQ4MTQzMDMyNDIsInN1YiI6IjEifQ.Qd2QW-OuY_5hbZEaxr_fZpG7x7hu0g04d8Z6-QDo_K4",
        people_tracking: null,
      },
      {
        floor_layer_name: "XREF",
        fixture_layer_name: "",
        sensor_layer_name: "EL63101-_LICHT-ARM",
        ceiling_height: null,
        scale: null,
        full_name: "Tz",
        short_name: "s",
        position: 0,
        display_name: "Summa VdV Best Kamer 1.dxf",
        status: true,
        id: 7,
        file_name: "Summa VdV Best Kamer 1.dxf",
        user_id: 1,
        created_at: "2022-03-23T09:12:21.125672",
        updated_at: "2022-07-27T07:12:55.628022",
        project_id: 2,
        layer_names: [
          "0",
          "DEFPOINTS",
          "BL$2A---_SNIJLIJN",
          "BL$2B---_KADER",
          "EL63101-_LICHT-ARM",
          "XREF",
        ],
        percentage: 5.8824,
        building_id: 4,
        download_url:
          "http://localhost/api/v1/files/7/download?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjQ4MTQzMDMyNDIsInN1YiI6IjEifQ.Qd2QW-OuY_5hbZEaxr_fZpG7x7hu0g04d8Z6-QDo_K4",
        people_tracking: null,
      },
    ],
  },
  {
    address: "222",
    name: "Building 5",
    status: true,
    id: 21,
    project_id: 1,
    amount_of_storey: 0,
    position: 2,
    floorplans: [],
  },
]);

;// CONCATENATED MODULE: ./assets/js/dummy/dummy_devices.js
const devices = JSON.stringify([
  {
    x: "37235",
    y: "1684",
    width: "0",
    height: "0",
    type: "fixture",
    block_name: "Dea Carmenta S",
    mac_address: null,
    status: false,
    serial_number: null,
    channels: null,
    mA: null,
    ceil_height: 0,
    selected_cells: null,
    angle: 0,
    layer: "EL63101-_LICHT-ARM",
    id: 9227,
    file_id: 65,
    rotation: 0,
    groups: [],
  },
  {
    x: "39387",
    y: "3005",
    width: "0",
    height: "0",
    type: "fixture",
    block_name: "Dea Carmenta S",
    mac_address: null,
    status: false,
    serial_number: null,
    channels: null,
    mA: null,
    ceil_height: 0,
    selected_cells: null,
    angle: 0,
    layer: "EL63101-_LICHT-ARM",
    id: 9228,
    file_id: 65,
    rotation: 0,
    groups: [],
  },
  {
    x: "39513",
    y: "5170",
    width: "0",
    height: "0",
    type: "fixture",
    block_name: "Dea Carmenta S",
    mac_address: null,
    status: false,
    serial_number: null,
    channels: null,
    mA: null,
    ceil_height: 0,
    selected_cells: null,
    angle: 0,
    layer: "EL63101-_LICHT-ARM",
    id: 9229,
    file_id: 65,
    rotation: 0,
    groups: [],
  },
  {
    x: "37243",
    y: "5960",
    width: "0",
    height: "0",
    type: "fixture",
    block_name: "Dea Carmenta S",
    mac_address: null,
    status: false,
    serial_number: null,
    channels: null,
    mA: null,
    ceil_height: 0,
    selected_cells: null,
    angle: 0,
    layer: "EL63101-_LICHT-ARM",
    id: 9230,
    file_id: 65,
    rotation: 0,
    groups: [],
  },
  {
    x: "40115",
    y: "9051",
    width: "0",
    height: "0",
    type: "fixture",
    block_name: "Dea Carmenta S",
    mac_address: null,
    status: false,
    serial_number: null,
    channels: null,
    mA: null,
    ceil_height: 0,
    selected_cells: null,
    angle: 0,
    layer: "EL63101-_LICHT-ARM",
    id: 9231,
    file_id: 65,
    rotation: 0,
    groups: [],
  },
  {
    x: "41033",
    y: "8260",
    width: "0",
    height: "0",
    type: "fixture",
    block_name: "Dea Carmenta S",
    mac_address: null,
    status: false,
    serial_number: null,
    channels: null,
    mA: null,
    ceil_height: 0,
    selected_cells: null,
    angle: 0,
    layer: "EL63101-_LICHT-ARM",
    id: 9232,
    file_id: 65,
    rotation: 0,
    groups: [],
  },
  {
    x: "37283",
    y: "9134",
    width: "0",
    height: "0",
    type: "fixture",
    block_name: "Dea Carmenta S",
    mac_address: null,
    status: false,
    serial_number: null,
    channels: null,
    mA: null,
    ceil_height: 0,
    selected_cells: null,
    angle: 0,
    layer: "EL63101-_LICHT-ARM",
    id: 9233,
    file_id: 65,
    rotation: 0,
    groups: [],
  },
  {
    x: "40949",
    y: "4544",
    width: "0",
    height: "0",
    type: "fixture",
    block_name: "Dea Carmenta S",
    mac_address: null,
    status: false,
    serial_number: null,
    channels: null,
    mA: null,
    ceil_height: 0,
    selected_cells: null,
    angle: 0,
    layer: "EL63101-_LICHT-ARM",
    id: 9234,
    file_id: 65,
    rotation: 0,
    groups: [],
  },
  {
    x: "40846",
    y: "4615",
    width: "0",
    height: "0",
    type: "fixture",
    block_name: "Dea Carmenta S",
    mac_address: null,
    status: false,
    serial_number: null,
    channels: null,
    mA: null,
    ceil_height: 0,
    selected_cells: null,
    angle: 0,
    layer: "EL63101-_LICHT-ARM",
    id: 9235,
    file_id: 65,
    rotation: 0,
    groups: [],
  },
  {
    x: "40465",
    y: "1684",
    width: "0",
    height: "0",
    type: "fixture",
    block_name: "Dea Carmenta S",
    mac_address: null,
    status: false,
    serial_number: null,
    channels: null,
    mA: null,
    ceil_height: 0,
    selected_cells: null,
    angle: 0,
    layer: "EL63101-_LICHT-ARM",
    id: 9236,
    file_id: 65,
    rotation: 0,
    groups: [],
  },
  {
    x: "39535",
    y: "3005",
    width: "0",
    height: "0",
    type: "fixture",
    block_name: "Dea Carmenta S",
    mac_address: null,
    status: false,
    serial_number: null,
    channels: null,
    mA: null,
    ceil_height: 0,
    selected_cells: null,
    angle: 0,
    layer: "EL63101-_LICHT-ARM",
    id: 9237,
    file_id: 65,
    rotation: 0,
    groups: [],
  },
  {
    x: "38965",
    y: "5960",
    width: "0",
    height: "0",
    type: "fixture",
    block_name: "Dea Carmenta S",
    mac_address: null,
    status: false,
    serial_number: null,
    channels: null,
    mA: null,
    ceil_height: 0,
    selected_cells: null,
    angle: 0,
    layer: "EL63101-_LICHT-ARM",
    id: 9238,
    file_id: 65,
    rotation: 0,
    groups: [],
  },
  {
    x: "40520",
    y: "5960",
    width: "0",
    height: "0",
    type: "fixture",
    block_name: "Dea Carmenta S",
    mac_address: null,
    status: false,
    serial_number: null,
    channels: null,
    mA: null,
    ceil_height: 0,
    selected_cells: null,
    angle: 0,
    layer: "EL63101-_LICHT-ARM",
    id: 9239,
    file_id: 65,
    rotation: 0,
    groups: [],
  },
  {
    x: "37243",
    y: "7533",
    width: "0",
    height: "0",
    type: "fixture",
    block_name: "Dea Carmenta S",
    mac_address: null,
    status: false,
    serial_number: null,
    channels: null,
    mA: null,
    ceil_height: 0,
    selected_cells: null,
    angle: 0,
    layer: "EL63101-_LICHT-ARM",
    id: 9240,
    file_id: 65,
    rotation: 0,
    groups: [],
  },
  {
    x: "38454",
    y: "8260",
    width: "0",
    height: "0",
    type: "fixture",
    block_name: "Dea Carmenta S",
    mac_address: null,
    status: false,
    serial_number: null,
    channels: null,
    mA: null,
    ceil_height: 0,
    selected_cells: null,
    angle: 0,
    layer: "EL63101-_LICHT-ARM",
    id: 9241,
    file_id: 65,
    rotation: 0,
    groups: [],
  },
  {
    x: "39708",
    y: "8260",
    width: "0",
    height: "0",
    type: "fixture",
    block_name: "Dea Carmenta S",
    mac_address: null,
    status: false,
    serial_number: null,
    channels: null,
    mA: null,
    ceil_height: 0,
    selected_cells: null,
    angle: 0,
    layer: "EL63101-_LICHT-ARM",
    id: 9242,
    file_id: 65,
    rotation: 0,
    groups: [],
  },
]);

;// CONCATENATED MODULE: ./assets/js/dummy/dummy_floors.js
const floors = JSON.stringify([
  {
    floor_layer_name: "XREF",
    fixture_layer_name: "XREF",
    sensor_layer_name: "XREF",
    ceiling_height: null,
    scale: null,
    full_name: "InputOutput",
    short_name: "0",
    position: 0,
    display_name: "Summa VdV Best Kamer 1.dxf",
    status: true,
    id: 65,
    file_name: "Summa VdV Best Kamer 1.dxf",
    user_id: 1,
    created_at: "2022-08-22T06:58:54.314597",
    updated_at: "2022-08-22T06:59:16.869611",
    project_id: 1,
    layer_names: [
      "0",
      "DEFPOINTS",
      "BL$2A---_SNIJLIJN",
      "BL$2B---_KADER",
      "EL63101-_LICHT-ARM",
      "XREF",
    ],
    percentage: null,
    building_id: 1,
    download_url:
      "http://localhost/api/v1/files/65/download?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjQ4MTQzMDMyNDIsInN1YiI6IjEifQ.Qd2QW-OuY_5hbZEaxr_fZpG7x7hu0g04d8Z6-QDo_K4",
    people_tracking: null,
  },
]);

;// CONCATENATED MODULE: ./assets/js/dummy/dummy_groups.js
const groups = JSON.stringify([
  {
    name: "1 Group",
    x: "20974",
    y: "47733",
    x_color: 0.0,
    y_color: 0.0,
    color_type: "cct",
    building_id: 1,
    id: 46,
    user_id: 1,
    type: "Group",
    is_active: false,
    project_id: 1,
    scene_status: false,
    scene_id: 829,
    energy: 0,
    total_amount: 0,
    file_id: null,
    is_layer: false,
    light: 0,
    color: "7F2C0A",
    intensity: 0,
    device_ids: [],
    group_ids: [],
    positions: [],
    is_featured: false,
    devices_status: [],
  },
  {
    name: "AAAAA",
    x: "41033",
    y: "8260",
    x_color: 0.0,
    y_color: 0.0,
    color_type: "cct",
    building_id: 1,
    id: 43,
    user_id: 1,
    type: "Group",
    is_active: false,
    project_id: 1,
    scene_status: false,
    scene_id: 829,
    energy: 0,
    total_amount: 0,
    file_id: 13,
    is_layer: false,
    light: 0,
    color: "7F2C0A",
    intensity: 0,
    device_ids: [206],
    group_ids: [],
    positions: [
      {
        x: "41033.0",
        y: "8260.0",
        file_id: 13,
        f_x: "41033.0",
        f_y: "8260.0",
        f_width: "0.0",
        f_height: "0.0",
      },
    ],
    is_featured: false,
    devices_status: [{ id: 206, status: false }],
  },
  {
    name: "AAAAX",
    x: "49579",
    y: "23962",
    x_color: 0.0,
    y_color: 0.0,
    color_type: "cct",
    building_id: 1,
    id: 37,
    user_id: 1,
    type: "Group",
    is_active: false,
    project_id: 1,
    scene_status: false,
    scene_id: 829,
    energy: 0,
    total_amount: 0,
    file_id: 12,
    is_layer: false,
    light: 0,
    color: "7F2C0A",
    intensity: 0,
    device_ids: [],
    group_ids: [],
    positions: [],
    is_featured: false,
    devices_status: [],
  },
  {
    name: "BBBB",
    x: "37243",
    y: "7533",
    x_color: 0.0,
    y_color: 0.0,
    color_type: "cct",
    building_id: 1,
    id: 44,
    user_id: 1,
    type: "Group",
    is_active: false,
    project_id: 1,
    scene_status: false,
    scene_id: 829,
    energy: 0,
    total_amount: 0,
    file_id: 13,
    is_layer: true,
    light: 0,
    color: "7F2C0A",
    intensity: 0,
    device_ids: [213, 214, 215],
    group_ids: [45],
    positions: [
      {
        x: "38881.5",
        y: "7110.0",
        file_id: 13,
        f_x: "37243.0",
        f_y: "5960.0",
        f_width: "3277.0",
        f_height: "2300.0",
      },
    ],
    is_featured: false,
    devices_status: [
      { id: 214, status: false },
      { id: 215, status: false },
      { id: 213, status: false },
    ],
  },
  {
    name: "CCCC",
    x: "39513",
    y: "5170",
    x_color: 0.0,
    y_color: 0.0,
    color_type: "cct",
    building_id: 1,
    id: 45,
    user_id: 1,
    type: "Group",
    is_active: false,
    project_id: 1,
    scene_status: false,
    scene_id: 829,
    energy: 0,
    total_amount: 0,
    file_id: 13,
    is_layer: false,
    light: 0,
    color: "7F2C0A",
    intensity: 0,
    device_ids: [203, 212],
    group_ids: [],
    positions: [
      {
        x: "39239.0",
        y: "5565.0",
        file_id: 13,
        f_x: "38965.0",
        f_y: "5170.0",
        f_width: "548.0",
        f_height: "790.0",
      },
    ],
    is_featured: false,
    devices_status: [
      { id: 203, status: false },
      { id: 212, status: false },
    ],
  },
  {
    name: "Group 1",
    x: "40054.80372469752",
    y: "6760.3168628915755",
    x_color: 0.0,
    y_color: 0.0,
    color_type: "cct",
    building_id: 1,
    id: 2,
    user_id: 1,
    type: "Group",
    is_active: false,
    project_id: 1,
    scene_status: false,
    scene_id: 829,
    energy: 0,
    total_amount: 0,
    file_id: 1,
    is_layer: false,
    light: 0,
    color: "7F2C0A",
    intensity: 0,
    device_ids: [9, 11],
    group_ids: [],
    positions: [
      {
        x: "40054.80372469752",
        y: "6760.3168628915755",
        file_id: 1,
        f_x: "39535.0",
        f_y: "3005.0",
        f_width: "1311.0",
        f_height: "1610.0",
      },
    ],
    is_featured: false,
    devices_status: [
      { id: 11, status: false },
      { id: 9, status: false },
    ],
  },
  {
    name: "Group 1",
    x: "50751",
    y: "25516",
    x_color: 0.0,
    y_color: 0.0,
    color_type: "cct",
    building_id: 1,
    id: 34,
    user_id: 1,
    type: "Group",
    is_active: false,
    project_id: 1,
    scene_status: false,
    scene_id: 829,
    energy: 0,
    total_amount: 0,
    file_id: 12,
    is_layer: false,
    light: 0,
    color: "7F2C0A",
    intensity: 0,
    device_ids: [],
    group_ids: [],
    positions: [],
    is_featured: false,
    devices_status: [],
  },
  {
    name: "Group 10",
    x: "38965",
    y: "5960",
    x_color: 0.0,
    y_color: 0.0,
    color_type: "cct",
    building_id: 1,
    id: 30,
    user_id: 1,
    type: "Group",
    is_active: false,
    project_id: 1,
    scene_status: false,
    scene_id: 829,
    energy: 0,
    total_amount: 0,
    file_id: 2,
    is_layer: true,
    light: 0,
    color: "7F2C0A",
    intensity: 0,
    device_ids: [],
    group_ids: [40, 39],
    positions: [
      {
        x: "39239.0",
        y: "5565.0",
        file_id: 2,
        f_x: "38965.0",
        f_y: "5170.0",
        f_width: "548.0",
        f_height: "790.0",
      },
    ],
    is_featured: false,
    devices_status: [],
  },
  {
    name: "Group 20",
    x: "39513",
    y: "5170",
    x_color: 0.0,
    y_color: 0.0,
    color_type: "cct",
    building_id: 1,
    id: 39,
    user_id: 1,
    type: "Group",
    is_active: false,
    project_id: 1,
    scene_status: false,
    scene_id: 829,
    energy: 0,
    total_amount: 0,
    file_id: 2,
    is_layer: false,
    light: 0,
    color: "7F2C0A",
    intensity: 0,
    device_ids: [],
    group_ids: [],
    positions: [],
    is_featured: false,
    devices_status: [],
  },
  {
    name: "Group 3",
    x: "48344",
    y: "25005",
    x_color: 0.0,
    y_color: 0.0,
    color_type: "cct",
    building_id: 1,
    id: 38,
    user_id: 1,
    type: "Group",
    is_active: false,
    project_id: 1,
    scene_status: false,
    scene_id: 829,
    energy: 0,
    total_amount: 0,
    file_id: 12,
    is_layer: false,
    light: 0,
    color: "7F2C0A",
    intensity: 0,
    device_ids: [188, 190],
    group_ids: [],
    positions: [
      {
        x: "48889.0",
        y: "25005.0",
        file_id: 12,
        f_x: "48344.0",
        f_y: "25005.0",
        f_width: "1090.0",
        f_height: "0.0",
      },
    ],
    is_featured: false,
    devices_status: [
      { id: 190, status: false },
      { id: 188, status: false },
    ],
  },
  {
    name: "Group 30",
    x: "40520",
    y: "5960",
    x_color: 0.0,
    y_color: 0.0,
    color_type: "cct",
    building_id: 1,
    id: 40,
    user_id: 1,
    type: "Group",
    is_active: false,
    project_id: 1,
    scene_status: false,
    scene_id: 829,
    energy: 0,
    total_amount: 0,
    file_id: 2,
    is_layer: false,
    light: 0,
    color: "7F2C0A",
    intensity: 0,
    device_ids: [19, 28],
    group_ids: [],
    positions: [
      {
        x: "39239.0",
        y: "5565.0",
        file_id: 2,
        f_x: "38965.0",
        f_y: "5170.0",
        f_width: "548.0",
        f_height: "790.0",
      },
    ],
    is_featured: false,
    devices_status: [
      { id: 19, status: false },
      { id: 28, status: false },
    ],
  },
  {
    name: "Group 4",
    x: "40115",
    y: "9051",
    x_color: 0.0,
    y_color: 0.0,
    color_type: "cct",
    building_id: 1,
    id: 7,
    user_id: 1,
    type: "Group",
    is_active: false,
    project_id: 1,
    scene_status: false,
    scene_id: 829,
    energy: 0,
    total_amount: 0,
    file_id: 1,
    is_layer: false,
    light: 0,
    color: "7F2C0A",
    intensity: 0,
    device_ids: [16, 5],
    group_ids: [],
    positions: [
      {
        x: "39911.5",
        y: "8655.5",
        file_id: 1,
        f_x: "39708.0",
        f_y: "8260.0",
        f_width: "407.0",
        f_height: "791.0",
      },
    ],
    is_featured: false,
    devices_status: [
      { id: 5, status: false },
      { id: 16, status: false },
    ],
  },
  {
    name: "Group Children",
    x: "0",
    y: "0",
    x_color: 0.0,
    y_color: 0.0,
    color_type: "cct",
    building_id: 1,
    id: 6,
    user_id: 1,
    type: "Group",
    is_active: false,
    project_id: 1,
    scene_status: false,
    scene_id: 829,
    energy: 0,
    total_amount: 0,
    file_id: 1,
    is_layer: false,
    light: 0,
    color: "7F2C0A",
    intensity: 0,
    device_ids: [],
    group_ids: [],
    positions: [],
    is_featured: false,
    devices_status: [],
  },
  {
    name: "Group Children 3",
    x: "0",
    y: "0",
    x_color: 0.0,
    y_color: 0.0,
    color_type: "cct",
    building_id: 1,
    id: 5,
    user_id: 1,
    type: "Group",
    is_active: false,
    project_id: 1,
    scene_status: false,
    scene_id: 829,
    energy: 0,
    total_amount: 0,
    file_id: 1,
    is_layer: false,
    light: 0,
    color: "7F2C0A",
    intensity: 0,
    device_ids: [],
    group_ids: [],
    positions: [],
    is_featured: false,
    devices_status: [],
  },
  {
    name: "Group Independence",
    x: "0",
    y: "0",
    x_color: 0.0,
    y_color: 0.0,
    color_type: "cct",
    building_id: 1,
    id: 8,
    user_id: 1,
    type: "Group",
    is_active: false,
    project_id: 1,
    scene_status: false,
    scene_id: 829,
    energy: 0,
    total_amount: 0,
    file_id: null,
    is_layer: false,
    light: 0,
    color: "7F2C0A",
    intensity: 0,
    device_ids: [],
    group_ids: [],
    positions: [],
    is_featured: false,
    devices_status: [],
  },
  {
    name: "Group Parent 1",
    x: "38156.428717904644",
    y: "6758.380804900996",
    x_color: 0.0,
    y_color: 0.0,
    color_type: "cct",
    building_id: 1,
    id: 4,
    user_id: 1,
    type: "Group",
    is_active: false,
    project_id: 1,
    scene_status: false,
    scene_id: 829,
    energy: 0,
    total_amount: 0,
    file_id: 1,
    is_layer: true,
    light: 0,
    color: "7F2C0A",
    intensity: 0,
    device_ids: [14, 15],
    group_ids: [6],
    positions: [
      {
        x: "38156.428717904644",
        y: "6758.380804900996",
        file_id: 1,
        f_x: "37243.0",
        f_y: "7533.0",
        f_width: "1211.0",
        f_height: "727.0",
      },
    ],
    is_featured: false,
    devices_status: [
      { id: 14, status: false },
      { id: 15, status: false },
    ],
  },
  {
    name: "haha",
    x: "30089",
    y: "52791",
    x_color: 0.0,
    y_color: 0.0,
    color_type: "cct",
    building_id: 1,
    id: 47,
    user_id: 1,
    type: "Group",
    is_active: false,
    project_id: 1,
    scene_status: true,
    scene_id: 829,
    energy: 0,
    total_amount: 0,
    file_id: null,
    is_layer: false,
    light: 0,
    color: "7F2C0A",
    intensity: 0,
    device_ids: [],
    group_ids: [],
    positions: [],
    is_featured: false,
    devices_status: [],
  },
  {
    name: "haha 1",
    x: "32195",
    y: "43119",
    x_color: 0.0,
    y_color: 0.0,
    color_type: "cct",
    building_id: 1,
    id: 48,
    user_id: 1,
    type: "Group",
    is_active: false,
    project_id: 1,
    scene_status: false,
    scene_id: 829,
    energy: 0,
    total_amount: 0,
    file_id: null,
    is_layer: false,
    light: 0,
    color: "7F2C0A",
    intensity: 0,
    device_ids: [],
    group_ids: [],
    positions: [],
    is_featured: false,
    devices_status: [],
  },
  {
    name: "New Group",
    x: "40276.14702520929",
    y: "7512.803951557964",
    x_color: 0.0,
    y_color: 0.0,
    color_type: "cct",
    building_id: 1,
    id: 36,
    user_id: 1,
    type: "Group",
    is_active: false,
    project_id: 1,
    scene_status: true,
    scene_id: 829,
    energy: 0,
    total_amount: 0,
    file_id: 1,
    is_layer: true,
    light: 0,
    color: "7F2C0A",
    intensity: 0,
    device_ids: [6, 199],
    group_ids: [1],
    positions: [
      {
        x: "38031.25835999189",
        y: "8065.219948542874",
        file_id: 1,
        f_x: "39513.0",
        f_y: "5170.0",
        f_width: "0.0",
        f_height: "0.0",
      },
    ],
    is_featured: false,
    devices_status: [
      { id: 199, status: true },
      { id: 6, status: true },
    ],
  },
  {
    name: "Root Group",
    x: "36868.80986011129",
    y: "4143.524047536016",
    x_color: 0.0,
    y_color: 0.0,
    color_type: "cct",
    building_id: 1,
    id: 3,
    user_id: 1,
    type: "Group",
    is_active: false,
    project_id: 1,
    scene_status: false,
    scene_id: 829,
    energy: 0,
    total_amount: 0,
    file_id: 1,
    is_layer: true,
    light: 0,
    color: "7F2C0A",
    intensity: 0,
    device_ids: [8],
    group_ids: [4, 5, 7],
    positions: [
      {
        x: "36868.80986011129",
        y: "4143.524047536016",
        file_id: 1,
        f_x: "40949.0",
        f_y: "4544.0",
        f_width: "0.0",
        f_height: "0.0",
      },
    ],
    is_featured: false,
    devices_status: [{ id: 8, status: false }],
  },
  {
    name: "Root Group 5",
    x: "38031.25835999189",
    y: "8065.219948542874",
    x_color: 0.0,
    y_color: 0.0,
    color_type: "cct",
    building_id: 1,
    id: 1,
    user_id: 1,
    type: "Group",
    is_active: false,
    project_id: 1,
    scene_status: false,
    scene_id: 829,
    energy: 0,
    total_amount: 0,
    file_id: 1,
    is_layer: true,
    light: 0,
    color: "7F2C0A",
    intensity: 0,
    device_ids: [3],
    group_ids: [2],
    positions: [
      {
        x: "38031.25835999189",
        y: "8065.219948542874",
        file_id: 1,
        f_x: "39513.0",
        f_y: "5170.0",
        f_width: "0.0",
        f_height: "0.0",
      },
    ],
    is_featured: false,
    devices_status: [{ id: 3, status: false }],
  },
  {
    name: "Summa portal",
    x: "39387",
    y: "3005",
    x_color: 0.0,
    y_color: 0.0,
    color_type: "cct",
    building_id: 1,
    id: 12,
    user_id: 1,
    type: "Group",
    is_active: false,
    project_id: 1,
    scene_status: false,
    scene_id: 829,
    energy: 0,
    total_amount: 0,
    file_id: null,
    is_layer: false,
    light: 0,
    color: "7F2C0A",
    intensity: 0,
    device_ids: [],
    group_ids: [],
    positions: [],
    is_featured: false,
    devices_status: [],
  },
  {
    name: "TEst",
    x: "39513",
    y: "5170",
    x_color: 0.0,
    y_color: 0.0,
    color_type: "cct",
    building_id: 1,
    id: 33,
    user_id: 1,
    type: "Group",
    is_active: false,
    project_id: 1,
    scene_status: false,
    scene_id: 829,
    energy: 0,
    total_amount: 0,
    file_id: null,
    is_layer: true,
    light: 0,
    color: "7F2C0A",
    intensity: 0,
    device_ids: [],
    group_ids: [],
    positions: [],
    is_featured: false,
    devices_status: [],
  },
  {
    name: "TEst",
    x: "40115",
    y: "9051",
    x_color: 0.0,
    y_color: 0.0,
    color_type: "cct",
    building_id: 1,
    id: 42,
    user_id: 1,
    type: "Group",
    is_active: false,
    project_id: 1,
    scene_status: false,
    scene_id: 829,
    energy: 0,
    total_amount: 0,
    file_id: 13,
    is_layer: true,
    light: 0,
    color: "7F2C0A",
    intensity: 0,
    device_ids: [216, 205],
    group_ids: [43],
    positions: [
      {
        x: "39911.5",
        y: "8655.5",
        file_id: 13,
        f_x: "39708.0",
        f_y: "8260.0",
        f_width: "407.0",
        f_height: "791.0",
      },
    ],
    is_featured: false,
    devices_status: [
      { id: 205, status: false },
      { id: 216, status: false },
    ],
  },
]);

;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/index.js??vue-loader-options!./assets/js/root.vue?vue&type=script&lang=js&
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//







/* harmony default export */ const rootvue_type_script_lang_js_ = ({
  props: ['msg'],
  data() {
    return {
      myBuilding: buildings,
      myDevices: devices,
      myFloors: floors,
      myGroups: groups,
    };
  },
  components: {
    LayoutStructure: layout_structure,
  },
});

;// CONCATENATED MODULE: ./assets/js/root.vue?vue&type=script&lang=js&
 /* harmony default export */ const js_rootvue_type_script_lang_js_ = (rootvue_type_script_lang_js_); 
// EXTERNAL MODULE: ./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js
var injectStylesIntoStyleTag = __webpack_require__(3379);
var injectStylesIntoStyleTag_default = /*#__PURE__*/__webpack_require__.n(injectStylesIntoStyleTag);
// EXTERNAL MODULE: ./node_modules/style-loader/dist/runtime/styleDomAPI.js
var styleDomAPI = __webpack_require__(7795);
var styleDomAPI_default = /*#__PURE__*/__webpack_require__.n(styleDomAPI);
// EXTERNAL MODULE: ./node_modules/style-loader/dist/runtime/insertBySelector.js
var insertBySelector = __webpack_require__(569);
var insertBySelector_default = /*#__PURE__*/__webpack_require__.n(insertBySelector);
// EXTERNAL MODULE: ./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js
var setAttributesWithoutAttributes = __webpack_require__(3565);
var setAttributesWithoutAttributes_default = /*#__PURE__*/__webpack_require__.n(setAttributesWithoutAttributes);
// EXTERNAL MODULE: ./node_modules/style-loader/dist/runtime/insertStyleElement.js
var insertStyleElement = __webpack_require__(9216);
var insertStyleElement_default = /*#__PURE__*/__webpack_require__.n(insertStyleElement);
// EXTERNAL MODULE: ./node_modules/style-loader/dist/runtime/styleTagTransform.js
var styleTagTransform = __webpack_require__(4589);
var styleTagTransform_default = /*#__PURE__*/__webpack_require__.n(styleTagTransform);
// EXTERNAL MODULE: ./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/sass-loader/dist/cjs.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./assets/js/root.vue?vue&type=style&index=0&id=41f9ea87&prod&lang=css&
var rootvue_type_style_index_0_id_41f9ea87_prod_lang_css_ = __webpack_require__(894);
;// CONCATENATED MODULE: ./node_modules/style-loader/dist/cjs.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/sass-loader/dist/cjs.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./assets/js/root.vue?vue&type=style&index=0&id=41f9ea87&prod&lang=css&

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (styleTagTransform_default());
options.setAttributes = (setAttributesWithoutAttributes_default());

      options.insert = insertBySelector_default().bind(null, "head");
    
options.domAPI = (styleDomAPI_default());
options.insertStyleElement = (insertStyleElement_default());

var update = injectStylesIntoStyleTag_default()(rootvue_type_style_index_0_id_41f9ea87_prod_lang_css_/* default */.Z, options);




       /* harmony default export */ const js_rootvue_type_style_index_0_id_41f9ea87_prod_lang_css_ = (rootvue_type_style_index_0_id_41f9ea87_prod_lang_css_/* default */.Z && rootvue_type_style_index_0_id_41f9ea87_prod_lang_css_/* default.locals */.Z.locals ? rootvue_type_style_index_0_id_41f9ea87_prod_lang_css_/* default.locals */.Z.locals : undefined);

;// CONCATENATED MODULE: ./assets/js/root.vue?vue&type=style&index=0&id=41f9ea87&prod&lang=css&

;// CONCATENATED MODULE: ./assets/js/root.vue



;


/* normalize component */

var root_component = normalizeComponent(
  js_rootvue_type_script_lang_js_,
  render,
  staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const root = (root_component.exports);

/***/ }),

/***/ 144:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/*!
 * Vue.js v2.6.11
 * (c) 2014-2019 Evan You
 * Released under the MIT License.
 */
/*  */

var emptyObject = Object.freeze({});

// These helpers produce better VM code in JS engines due to their
// explicitness and function inlining.
function isUndef (v) {
  return v === undefined || v === null
}

function isDef (v) {
  return v !== undefined && v !== null
}

function isTrue (v) {
  return v === true
}

function isFalse (v) {
  return v === false
}

/**
 * Check if value is primitive.
 */
function isPrimitive (value) {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    // $flow-disable-line
    typeof value === 'symbol' ||
    typeof value === 'boolean'
  )
}

/**
 * Quick object check - this is primarily used to tell
 * Objects from primitive values when we know the value
 * is a JSON-compliant type.
 */
function isObject (obj) {
  return obj !== null && typeof obj === 'object'
}

/**
 * Get the raw type string of a value, e.g., [object Object].
 */
var _toString = Object.prototype.toString;

function toRawType (value) {
  return _toString.call(value).slice(8, -1)
}

/**
 * Strict object type check. Only returns true
 * for plain JavaScript objects.
 */
function isPlainObject (obj) {
  return _toString.call(obj) === '[object Object]'
}

function isRegExp (v) {
  return _toString.call(v) === '[object RegExp]'
}

/**
 * Check if val is a valid array index.
 */
function isValidArrayIndex (val) {
  var n = parseFloat(String(val));
  return n >= 0 && Math.floor(n) === n && isFinite(val)
}

function isPromise (val) {
  return (
    isDef(val) &&
    typeof val.then === 'function' &&
    typeof val.catch === 'function'
  )
}

/**
 * Convert a value to a string that is actually rendered.
 */
function toString (val) {
  return val == null
    ? ''
    : Array.isArray(val) || (isPlainObject(val) && val.toString === _toString)
      ? JSON.stringify(val, null, 2)
      : String(val)
}

/**
 * Convert an input value to a number for persistence.
 * If the conversion fails, return original string.
 */
function toNumber (val) {
  var n = parseFloat(val);
  return isNaN(n) ? val : n
}

/**
 * Make a map and return a function for checking if a key
 * is in that map.
 */
function makeMap (
  str,
  expectsLowerCase
) {
  var map = Object.create(null);
  var list = str.split(',');
  for (var i = 0; i < list.length; i++) {
    map[list[i]] = true;
  }
  return expectsLowerCase
    ? function (val) { return map[val.toLowerCase()]; }
    : function (val) { return map[val]; }
}

/**
 * Check if a tag is a built-in tag.
 */
var isBuiltInTag = makeMap('slot,component', true);

/**
 * Check if an attribute is a reserved attribute.
 */
var isReservedAttribute = makeMap('key,ref,slot,slot-scope,is');

/**
 * Remove an item from an array.
 */
function remove (arr, item) {
  if (arr.length) {
    var index = arr.indexOf(item);
    if (index > -1) {
      return arr.splice(index, 1)
    }
  }
}

/**
 * Check whether an object has the property.
 */
var hasOwnProperty = Object.prototype.hasOwnProperty;
function hasOwn (obj, key) {
  return hasOwnProperty.call(obj, key)
}

/**
 * Create a cached version of a pure function.
 */
function cached (fn) {
  var cache = Object.create(null);
  return (function cachedFn (str) {
    var hit = cache[str];
    return hit || (cache[str] = fn(str))
  })
}

/**
 * Camelize a hyphen-delimited string.
 */
var camelizeRE = /-(\w)/g;
var camelize = cached(function (str) {
  return str.replace(camelizeRE, function (_, c) { return c ? c.toUpperCase() : ''; })
});

/**
 * Capitalize a string.
 */
var capitalize = cached(function (str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
});

/**
 * Hyphenate a camelCase string.
 */
var hyphenateRE = /\B([A-Z])/g;
var hyphenate = cached(function (str) {
  return str.replace(hyphenateRE, '-$1').toLowerCase()
});

/**
 * Simple bind polyfill for environments that do not support it,
 * e.g., PhantomJS 1.x. Technically, we don't need this anymore
 * since native bind is now performant enough in most browsers.
 * But removing it would mean breaking code that was able to run in
 * PhantomJS 1.x, so this must be kept for backward compatibility.
 */

/* istanbul ignore next */
function polyfillBind (fn, ctx) {
  function boundFn (a) {
    var l = arguments.length;
    return l
      ? l > 1
        ? fn.apply(ctx, arguments)
        : fn.call(ctx, a)
      : fn.call(ctx)
  }

  boundFn._length = fn.length;
  return boundFn
}

function nativeBind (fn, ctx) {
  return fn.bind(ctx)
}

var bind = Function.prototype.bind
  ? nativeBind
  : polyfillBind;

/**
 * Convert an Array-like object to a real Array.
 */
function toArray (list, start) {
  start = start || 0;
  var i = list.length - start;
  var ret = new Array(i);
  while (i--) {
    ret[i] = list[i + start];
  }
  return ret
}

/**
 * Mix properties into target object.
 */
function extend (to, _from) {
  for (var key in _from) {
    to[key] = _from[key];
  }
  return to
}

/**
 * Merge an Array of Objects into a single Object.
 */
function toObject (arr) {
  var res = {};
  for (var i = 0; i < arr.length; i++) {
    if (arr[i]) {
      extend(res, arr[i]);
    }
  }
  return res
}

/* eslint-disable no-unused-vars */

/**
 * Perform no operation.
 * Stubbing args to make Flow happy without leaving useless transpiled code
 * with ...rest (https://flow.org/blog/2017/05/07/Strict-Function-Call-Arity/).
 */
function noop (a, b, c) {}

/**
 * Always return false.
 */
var no = function (a, b, c) { return false; };

/* eslint-enable no-unused-vars */

/**
 * Return the same value.
 */
var identity = function (_) { return _; };

/**
 * Check if two values are loosely equal - that is,
 * if they are plain objects, do they have the same shape?
 */
function looseEqual (a, b) {
  if (a === b) { return true }
  var isObjectA = isObject(a);
  var isObjectB = isObject(b);
  if (isObjectA && isObjectB) {
    try {
      var isArrayA = Array.isArray(a);
      var isArrayB = Array.isArray(b);
      if (isArrayA && isArrayB) {
        return a.length === b.length && a.every(function (e, i) {
          return looseEqual(e, b[i])
        })
      } else if (a instanceof Date && b instanceof Date) {
        return a.getTime() === b.getTime()
      } else if (!isArrayA && !isArrayB) {
        var keysA = Object.keys(a);
        var keysB = Object.keys(b);
        return keysA.length === keysB.length && keysA.every(function (key) {
          return looseEqual(a[key], b[key])
        })
      } else {
        /* istanbul ignore next */
        return false
      }
    } catch (e) {
      /* istanbul ignore next */
      return false
    }
  } else if (!isObjectA && !isObjectB) {
    return String(a) === String(b)
  } else {
    return false
  }
}

/**
 * Return the first index at which a loosely equal value can be
 * found in the array (if value is a plain object, the array must
 * contain an object of the same shape), or -1 if it is not present.
 */
function looseIndexOf (arr, val) {
  for (var i = 0; i < arr.length; i++) {
    if (looseEqual(arr[i], val)) { return i }
  }
  return -1
}

/**
 * Ensure a function is called only once.
 */
function once (fn) {
  var called = false;
  return function () {
    if (!called) {
      called = true;
      fn.apply(this, arguments);
    }
  }
}

var SSR_ATTR = 'data-server-rendered';

var ASSET_TYPES = [
  'component',
  'directive',
  'filter'
];

var LIFECYCLE_HOOKS = [
  'beforeCreate',
  'created',
  'beforeMount',
  'mounted',
  'beforeUpdate',
  'updated',
  'beforeDestroy',
  'destroyed',
  'activated',
  'deactivated',
  'errorCaptured',
  'serverPrefetch'
];

/*  */



var config = ({
  /**
   * Option merge strategies (used in core/util/options)
   */
  // $flow-disable-line
  optionMergeStrategies: Object.create(null),

  /**
   * Whether to suppress warnings.
   */
  silent: false,

  /**
   * Show production mode tip message on boot?
   */
  productionTip: "production" !== 'production',

  /**
   * Whether to enable devtools
   */
  devtools: "production" !== 'production',

  /**
   * Whether to record perf
   */
  performance: false,

  /**
   * Error handler for watcher errors
   */
  errorHandler: null,

  /**
   * Warn handler for watcher warns
   */
  warnHandler: null,

  /**
   * Ignore certain custom elements
   */
  ignoredElements: [],

  /**
   * Custom user key aliases for v-on
   */
  // $flow-disable-line
  keyCodes: Object.create(null),

  /**
   * Check if a tag is reserved so that it cannot be registered as a
   * component. This is platform-dependent and may be overwritten.
   */
  isReservedTag: no,

  /**
   * Check if an attribute is reserved so that it cannot be used as a component
   * prop. This is platform-dependent and may be overwritten.
   */
  isReservedAttr: no,

  /**
   * Check if a tag is an unknown element.
   * Platform-dependent.
   */
  isUnknownElement: no,

  /**
   * Get the namespace of an element
   */
  getTagNamespace: noop,

  /**
   * Parse the real tag name for the specific platform.
   */
  parsePlatformTagName: identity,

  /**
   * Check if an attribute must be bound using property, e.g. value
   * Platform-dependent.
   */
  mustUseProp: no,

  /**
   * Perform updates asynchronously. Intended to be used by Vue Test Utils
   * This will significantly reduce performance if set to false.
   */
  async: true,

  /**
   * Exposed for legacy reasons
   */
  _lifecycleHooks: LIFECYCLE_HOOKS
});

/*  */

/**
 * unicode letters used for parsing html tags, component names and property paths.
 * using https://www.w3.org/TR/html53/semantics-scripting.html#potentialcustomelementname
 * skipping \u10000-\uEFFFF due to it freezing up PhantomJS
 */
var unicodeRegExp = /a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/;

/**
 * Check if a string starts with $ or _
 */
function isReserved (str) {
  var c = (str + '').charCodeAt(0);
  return c === 0x24 || c === 0x5F
}

/**
 * Define a property.
 */
function def (obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  });
}

/**
 * Parse simple path.
 */
var bailRE = new RegExp(("[^" + (unicodeRegExp.source) + ".$_\\d]"));
function parsePath (path) {
  if (bailRE.test(path)) {
    return
  }
  var segments = path.split('.');
  return function (obj) {
    for (var i = 0; i < segments.length; i++) {
      if (!obj) { return }
      obj = obj[segments[i]];
    }
    return obj
  }
}

/*  */

// can we use __proto__?
var hasProto = '__proto__' in {};

// Browser environment sniffing
var inBrowser = typeof window !== 'undefined';
var inWeex = typeof WXEnvironment !== 'undefined' && !!WXEnvironment.platform;
var weexPlatform = inWeex && WXEnvironment.platform.toLowerCase();
var UA = inBrowser && window.navigator.userAgent.toLowerCase();
var isIE = UA && /msie|trident/.test(UA);
var isIE9 = UA && UA.indexOf('msie 9.0') > 0;
var isEdge = UA && UA.indexOf('edge/') > 0;
var isAndroid = (UA && UA.indexOf('android') > 0) || (weexPlatform === 'android');
var isIOS = (UA && /iphone|ipad|ipod|ios/.test(UA)) || (weexPlatform === 'ios');
var isChrome = UA && /chrome\/\d+/.test(UA) && !isEdge;
var isPhantomJS = UA && /phantomjs/.test(UA);
var isFF = UA && UA.match(/firefox\/(\d+)/);

// Firefox has a "watch" function on Object.prototype...
var nativeWatch = ({}).watch;

var supportsPassive = false;
if (inBrowser) {
  try {
    var opts = {};
    Object.defineProperty(opts, 'passive', ({
      get: function get () {
        /* istanbul ignore next */
        supportsPassive = true;
      }
    })); // https://github.com/facebook/flow/issues/285
    window.addEventListener('test-passive', null, opts);
  } catch (e) {}
}

// this needs to be lazy-evaled because vue may be required before
// vue-server-renderer can set VUE_ENV
var _isServer;
var isServerRendering = function () {
  if (_isServer === undefined) {
    /* istanbul ignore if */
    if (!inBrowser && !inWeex && typeof __webpack_require__.g !== 'undefined') {
      // detect presence of vue-server-renderer and avoid
      // Webpack shimming the process
      _isServer = __webpack_require__.g['process'] && __webpack_require__.g['process'].env.VUE_ENV === 'server';
    } else {
      _isServer = false;
    }
  }
  return _isServer
};

// detect devtools
var devtools = inBrowser && window.__VUE_DEVTOOLS_GLOBAL_HOOK__;

/* istanbul ignore next */
function isNative (Ctor) {
  return typeof Ctor === 'function' && /native code/.test(Ctor.toString())
}

var hasSymbol =
  typeof Symbol !== 'undefined' && isNative(Symbol) &&
  typeof Reflect !== 'undefined' && isNative(Reflect.ownKeys);

var _Set;
/* istanbul ignore if */ // $flow-disable-line
if (typeof Set !== 'undefined' && isNative(Set)) {
  // use native Set when available.
  _Set = Set;
} else {
  // a non-standard Set polyfill that only works with primitive keys.
  _Set = /*@__PURE__*/(function () {
    function Set () {
      this.set = Object.create(null);
    }
    Set.prototype.has = function has (key) {
      return this.set[key] === true
    };
    Set.prototype.add = function add (key) {
      this.set[key] = true;
    };
    Set.prototype.clear = function clear () {
      this.set = Object.create(null);
    };

    return Set;
  }());
}

/*  */

var warn = noop;
var tip = (/* unused pure expression or super */ null && (noop));
var generateComponentTrace = ((/* unused pure expression or super */ null && (noop))); // work around flow check
var formatComponentName = ((/* unused pure expression or super */ null && (noop)));

if (false) { var repeat, classify, classifyRE, hasConsole; }

/*  */

var uid = 0;

/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 */
var Dep = function Dep () {
  this.id = uid++;
  this.subs = [];
};

Dep.prototype.addSub = function addSub (sub) {
  this.subs.push(sub);
};

Dep.prototype.removeSub = function removeSub (sub) {
  remove(this.subs, sub);
};

Dep.prototype.depend = function depend () {
  if (Dep.target) {
    Dep.target.addDep(this);
  }
};

Dep.prototype.notify = function notify () {
  // stabilize the subscriber list first
  var subs = this.subs.slice();
  if (false) {}
  for (var i = 0, l = subs.length; i < l; i++) {
    subs[i].update();
  }
};

// The current target watcher being evaluated.
// This is globally unique because only one watcher
// can be evaluated at a time.
Dep.target = null;
var targetStack = [];

function pushTarget (target) {
  targetStack.push(target);
  Dep.target = target;
}

function popTarget () {
  targetStack.pop();
  Dep.target = targetStack[targetStack.length - 1];
}

/*  */

var VNode = function VNode (
  tag,
  data,
  children,
  text,
  elm,
  context,
  componentOptions,
  asyncFactory
) {
  this.tag = tag;
  this.data = data;
  this.children = children;
  this.text = text;
  this.elm = elm;
  this.ns = undefined;
  this.context = context;
  this.fnContext = undefined;
  this.fnOptions = undefined;
  this.fnScopeId = undefined;
  this.key = data && data.key;
  this.componentOptions = componentOptions;
  this.componentInstance = undefined;
  this.parent = undefined;
  this.raw = false;
  this.isStatic = false;
  this.isRootInsert = true;
  this.isComment = false;
  this.isCloned = false;
  this.isOnce = false;
  this.asyncFactory = asyncFactory;
  this.asyncMeta = undefined;
  this.isAsyncPlaceholder = false;
};

var prototypeAccessors = { child: { configurable: true } };

// DEPRECATED: alias for componentInstance for backwards compat.
/* istanbul ignore next */
prototypeAccessors.child.get = function () {
  return this.componentInstance
};

Object.defineProperties( VNode.prototype, prototypeAccessors );

var createEmptyVNode = function (text) {
  if ( text === void 0 ) text = '';

  var node = new VNode();
  node.text = text;
  node.isComment = true;
  return node
};

function createTextVNode (val) {
  return new VNode(undefined, undefined, undefined, String(val))
}

// optimized shallow clone
// used for static nodes and slot nodes because they may be reused across
// multiple renders, cloning them avoids errors when DOM manipulations rely
// on their elm reference.
function cloneVNode (vnode) {
  var cloned = new VNode(
    vnode.tag,
    vnode.data,
    // #7975
    // clone children array to avoid mutating original in case of cloning
    // a child.
    vnode.children && vnode.children.slice(),
    vnode.text,
    vnode.elm,
    vnode.context,
    vnode.componentOptions,
    vnode.asyncFactory
  );
  cloned.ns = vnode.ns;
  cloned.isStatic = vnode.isStatic;
  cloned.key = vnode.key;
  cloned.isComment = vnode.isComment;
  cloned.fnContext = vnode.fnContext;
  cloned.fnOptions = vnode.fnOptions;
  cloned.fnScopeId = vnode.fnScopeId;
  cloned.asyncMeta = vnode.asyncMeta;
  cloned.isCloned = true;
  return cloned
}

/*
 * not type checking this file because flow doesn't play well with
 * dynamically accessing methods on Array prototype
 */

var arrayProto = Array.prototype;
var arrayMethods = Object.create(arrayProto);

var methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
];

/**
 * Intercept mutating methods and emit events
 */
methodsToPatch.forEach(function (method) {
  // cache original method
  var original = arrayProto[method];
  def(arrayMethods, method, function mutator () {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    var result = original.apply(this, args);
    var ob = this.__ob__;
    var inserted;
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args;
        break
      case 'splice':
        inserted = args.slice(2);
        break
    }
    if (inserted) { ob.observeArray(inserted); }
    // notify change
    ob.dep.notify();
    return result
  });
});

/*  */

var arrayKeys = Object.getOwnPropertyNames(arrayMethods);

/**
 * In some cases we may want to disable observation inside a component's
 * update computation.
 */
var shouldObserve = true;

function toggleObserving (value) {
  shouldObserve = value;
}

/**
 * Observer class that is attached to each observed
 * object. Once attached, the observer converts the target
 * object's property keys into getter/setters that
 * collect dependencies and dispatch updates.
 */
var Observer = function Observer (value) {
  this.value = value;
  this.dep = new Dep();
  this.vmCount = 0;
  def(value, '__ob__', this);
  if (Array.isArray(value)) {
    if (hasProto) {
      protoAugment(value, arrayMethods);
    } else {
      copyAugment(value, arrayMethods, arrayKeys);
    }
    this.observeArray(value);
  } else {
    this.walk(value);
  }
};

/**
 * Walk through all properties and convert them into
 * getter/setters. This method should only be called when
 * value type is Object.
 */
Observer.prototype.walk = function walk (obj) {
  var keys = Object.keys(obj);
  for (var i = 0; i < keys.length; i++) {
    defineReactive$$1(obj, keys[i]);
  }
};

/**
 * Observe a list of Array items.
 */
Observer.prototype.observeArray = function observeArray (items) {
  for (var i = 0, l = items.length; i < l; i++) {
    observe(items[i]);
  }
};

// helpers

/**
 * Augment a target Object or Array by intercepting
 * the prototype chain using __proto__
 */
function protoAugment (target, src) {
  /* eslint-disable no-proto */
  target.__proto__ = src;
  /* eslint-enable no-proto */
}

/**
 * Augment a target Object or Array by defining
 * hidden properties.
 */
/* istanbul ignore next */
function copyAugment (target, src, keys) {
  for (var i = 0, l = keys.length; i < l; i++) {
    var key = keys[i];
    def(target, key, src[key]);
  }
}

/**
 * Attempt to create an observer instance for a value,
 * returns the new observer if successfully observed,
 * or the existing observer if the value already has one.
 */
function observe (value, asRootData) {
  if (!isObject(value) || value instanceof VNode) {
    return
  }
  var ob;
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__;
  } else if (
    shouldObserve &&
    !isServerRendering() &&
    (Array.isArray(value) || isPlainObject(value)) &&
    Object.isExtensible(value) &&
    !value._isVue
  ) {
    ob = new Observer(value);
  }
  if (asRootData && ob) {
    ob.vmCount++;
  }
  return ob
}

/**
 * Define a reactive property on an Object.
 */
function defineReactive$$1 (
  obj,
  key,
  val,
  customSetter,
  shallow
) {
  var dep = new Dep();

  var property = Object.getOwnPropertyDescriptor(obj, key);
  if (property && property.configurable === false) {
    return
  }

  // cater for pre-defined getter/setters
  var getter = property && property.get;
  var setter = property && property.set;
  if ((!getter || setter) && arguments.length === 2) {
    val = obj[key];
  }

  var childOb = !shallow && observe(val);
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      var value = getter ? getter.call(obj) : val;
      if (Dep.target) {
        dep.depend();
        if (childOb) {
          childOb.dep.depend();
          if (Array.isArray(value)) {
            dependArray(value);
          }
        }
      }
      return value
    },
    set: function reactiveSetter (newVal) {
      var value = getter ? getter.call(obj) : val;
      /* eslint-disable no-self-compare */
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
      /* eslint-enable no-self-compare */
      if (false) {}
      // #7981: for accessor properties without setter
      if (getter && !setter) { return }
      if (setter) {
        setter.call(obj, newVal);
      } else {
        val = newVal;
      }
      childOb = !shallow && observe(newVal);
      dep.notify();
    }
  });
}

/**
 * Set a property on an object. Adds the new property and
 * triggers change notification if the property doesn't
 * already exist.
 */
function set (target, key, val) {
  if (false
  ) {}
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.length = Math.max(target.length, key);
    target.splice(key, 1, val);
    return val
  }
  if (key in target && !(key in Object.prototype)) {
    target[key] = val;
    return val
  }
  var ob = (target).__ob__;
  if (target._isVue || (ob && ob.vmCount)) {
     false && 0;
    return val
  }
  if (!ob) {
    target[key] = val;
    return val
  }
  defineReactive$$1(ob.value, key, val);
  ob.dep.notify();
  return val
}

/**
 * Delete a property and trigger change if necessary.
 */
function del (target, key) {
  if (false
  ) {}
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.splice(key, 1);
    return
  }
  var ob = (target).__ob__;
  if (target._isVue || (ob && ob.vmCount)) {
     false && 0;
    return
  }
  if (!hasOwn(target, key)) {
    return
  }
  delete target[key];
  if (!ob) {
    return
  }
  ob.dep.notify();
}

/**
 * Collect dependencies on array elements when the array is touched, since
 * we cannot intercept array element access like property getters.
 */
function dependArray (value) {
  for (var e = (void 0), i = 0, l = value.length; i < l; i++) {
    e = value[i];
    e && e.__ob__ && e.__ob__.dep.depend();
    if (Array.isArray(e)) {
      dependArray(e);
    }
  }
}

/*  */

/**
 * Option overwriting strategies are functions that handle
 * how to merge a parent option value and a child option
 * value into the final value.
 */
var strats = config.optionMergeStrategies;

/**
 * Options with restrictions
 */
if (false) {}

/**
 * Helper that recursively merges two data objects together.
 */
function mergeData (to, from) {
  if (!from) { return to }
  var key, toVal, fromVal;

  var keys = hasSymbol
    ? Reflect.ownKeys(from)
    : Object.keys(from);

  for (var i = 0; i < keys.length; i++) {
    key = keys[i];
    // in case the object is already observed...
    if (key === '__ob__') { continue }
    toVal = to[key];
    fromVal = from[key];
    if (!hasOwn(to, key)) {
      set(to, key, fromVal);
    } else if (
      toVal !== fromVal &&
      isPlainObject(toVal) &&
      isPlainObject(fromVal)
    ) {
      mergeData(toVal, fromVal);
    }
  }
  return to
}

/**
 * Data
 */
function mergeDataOrFn (
  parentVal,
  childVal,
  vm
) {
  if (!vm) {
    // in a Vue.extend merge, both should be functions
    if (!childVal) {
      return parentVal
    }
    if (!parentVal) {
      return childVal
    }
    // when parentVal & childVal are both present,
    // we need to return a function that returns the
    // merged result of both functions... no need to
    // check if parentVal is a function here because
    // it has to be a function to pass previous merges.
    return function mergedDataFn () {
      return mergeData(
        typeof childVal === 'function' ? childVal.call(this, this) : childVal,
        typeof parentVal === 'function' ? parentVal.call(this, this) : parentVal
      )
    }
  } else {
    return function mergedInstanceDataFn () {
      // instance merge
      var instanceData = typeof childVal === 'function'
        ? childVal.call(vm, vm)
        : childVal;
      var defaultData = typeof parentVal === 'function'
        ? parentVal.call(vm, vm)
        : parentVal;
      if (instanceData) {
        return mergeData(instanceData, defaultData)
      } else {
        return defaultData
      }
    }
  }
}

strats.data = function (
  parentVal,
  childVal,
  vm
) {
  if (!vm) {
    if (childVal && typeof childVal !== 'function') {
       false && 0;

      return parentVal
    }
    return mergeDataOrFn(parentVal, childVal)
  }

  return mergeDataOrFn(parentVal, childVal, vm)
};

/**
 * Hooks and props are merged as arrays.
 */
function mergeHook (
  parentVal,
  childVal
) {
  var res = childVal
    ? parentVal
      ? parentVal.concat(childVal)
      : Array.isArray(childVal)
        ? childVal
        : [childVal]
    : parentVal;
  return res
    ? dedupeHooks(res)
    : res
}

function dedupeHooks (hooks) {
  var res = [];
  for (var i = 0; i < hooks.length; i++) {
    if (res.indexOf(hooks[i]) === -1) {
      res.push(hooks[i]);
    }
  }
  return res
}

LIFECYCLE_HOOKS.forEach(function (hook) {
  strats[hook] = mergeHook;
});

/**
 * Assets
 *
 * When a vm is present (instance creation), we need to do
 * a three-way merge between constructor options, instance
 * options and parent options.
 */
function mergeAssets (
  parentVal,
  childVal,
  vm,
  key
) {
  var res = Object.create(parentVal || null);
  if (childVal) {
     false && 0;
    return extend(res, childVal)
  } else {
    return res
  }
}

ASSET_TYPES.forEach(function (type) {
  strats[type + 's'] = mergeAssets;
});

/**
 * Watchers.
 *
 * Watchers hashes should not overwrite one
 * another, so we merge them as arrays.
 */
strats.watch = function (
  parentVal,
  childVal,
  vm,
  key
) {
  // work around Firefox's Object.prototype.watch...
  if (parentVal === nativeWatch) { parentVal = undefined; }
  if (childVal === nativeWatch) { childVal = undefined; }
  /* istanbul ignore if */
  if (!childVal) { return Object.create(parentVal || null) }
  if (false) {}
  if (!parentVal) { return childVal }
  var ret = {};
  extend(ret, parentVal);
  for (var key$1 in childVal) {
    var parent = ret[key$1];
    var child = childVal[key$1];
    if (parent && !Array.isArray(parent)) {
      parent = [parent];
    }
    ret[key$1] = parent
      ? parent.concat(child)
      : Array.isArray(child) ? child : [child];
  }
  return ret
};

/**
 * Other object hashes.
 */
strats.props =
strats.methods =
strats.inject =
strats.computed = function (
  parentVal,
  childVal,
  vm,
  key
) {
  if (childVal && "production" !== 'production') {}
  if (!parentVal) { return childVal }
  var ret = Object.create(null);
  extend(ret, parentVal);
  if (childVal) { extend(ret, childVal); }
  return ret
};
strats.provide = mergeDataOrFn;

/**
 * Default strategy.
 */
var defaultStrat = function (parentVal, childVal) {
  return childVal === undefined
    ? parentVal
    : childVal
};

/**
 * Validate component names
 */
function checkComponents (options) {
  for (var key in options.components) {
    validateComponentName(key);
  }
}

function validateComponentName (name) {
  if (!new RegExp(("^[a-zA-Z][\\-\\.0-9_" + (unicodeRegExp.source) + "]*$")).test(name)) {
    warn(
      'Invalid component name: "' + name + '". Component names ' +
      'should conform to valid custom element name in html5 specification.'
    );
  }
  if (isBuiltInTag(name) || config.isReservedTag(name)) {
    warn(
      'Do not use built-in or reserved HTML elements as component ' +
      'id: ' + name
    );
  }
}

/**
 * Ensure all props option syntax are normalized into the
 * Object-based format.
 */
function normalizeProps (options, vm) {
  var props = options.props;
  if (!props) { return }
  var res = {};
  var i, val, name;
  if (Array.isArray(props)) {
    i = props.length;
    while (i--) {
      val = props[i];
      if (typeof val === 'string') {
        name = camelize(val);
        res[name] = { type: null };
      } else if (false) {}
    }
  } else if (isPlainObject(props)) {
    for (var key in props) {
      val = props[key];
      name = camelize(key);
      res[name] = isPlainObject(val)
        ? val
        : { type: val };
    }
  } else if (false) {}
  options.props = res;
}

/**
 * Normalize all injections into Object-based format
 */
function normalizeInject (options, vm) {
  var inject = options.inject;
  if (!inject) { return }
  var normalized = options.inject = {};
  if (Array.isArray(inject)) {
    for (var i = 0; i < inject.length; i++) {
      normalized[inject[i]] = { from: inject[i] };
    }
  } else if (isPlainObject(inject)) {
    for (var key in inject) {
      var val = inject[key];
      normalized[key] = isPlainObject(val)
        ? extend({ from: key }, val)
        : { from: val };
    }
  } else if (false) {}
}

/**
 * Normalize raw function directives into object format.
 */
function normalizeDirectives (options) {
  var dirs = options.directives;
  if (dirs) {
    for (var key in dirs) {
      var def$$1 = dirs[key];
      if (typeof def$$1 === 'function') {
        dirs[key] = { bind: def$$1, update: def$$1 };
      }
    }
  }
}

function assertObjectType (name, value, vm) {
  if (!isPlainObject(value)) {
    warn(
      "Invalid value for option \"" + name + "\": expected an Object, " +
      "but got " + (toRawType(value)) + ".",
      vm
    );
  }
}

/**
 * Merge two option objects into a new one.
 * Core utility used in both instantiation and inheritance.
 */
function mergeOptions (
  parent,
  child,
  vm
) {
  if (false) {}

  if (typeof child === 'function') {
    child = child.options;
  }

  normalizeProps(child, vm);
  normalizeInject(child, vm);
  normalizeDirectives(child);

  // Apply extends and mixins on the child options,
  // but only if it is a raw options object that isn't
  // the result of another mergeOptions call.
  // Only merged options has the _base property.
  if (!child._base) {
    if (child.extends) {
      parent = mergeOptions(parent, child.extends, vm);
    }
    if (child.mixins) {
      for (var i = 0, l = child.mixins.length; i < l; i++) {
        parent = mergeOptions(parent, child.mixins[i], vm);
      }
    }
  }

  var options = {};
  var key;
  for (key in parent) {
    mergeField(key);
  }
  for (key in child) {
    if (!hasOwn(parent, key)) {
      mergeField(key);
    }
  }
  function mergeField (key) {
    var strat = strats[key] || defaultStrat;
    options[key] = strat(parent[key], child[key], vm, key);
  }
  return options
}

/**
 * Resolve an asset.
 * This function is used because child instances need access
 * to assets defined in its ancestor chain.
 */
function resolveAsset (
  options,
  type,
  id,
  warnMissing
) {
  /* istanbul ignore if */
  if (typeof id !== 'string') {
    return
  }
  var assets = options[type];
  // check local registration variations first
  if (hasOwn(assets, id)) { return assets[id] }
  var camelizedId = camelize(id);
  if (hasOwn(assets, camelizedId)) { return assets[camelizedId] }
  var PascalCaseId = capitalize(camelizedId);
  if (hasOwn(assets, PascalCaseId)) { return assets[PascalCaseId] }
  // fallback to prototype chain
  var res = assets[id] || assets[camelizedId] || assets[PascalCaseId];
  if (false) {}
  return res
}

/*  */



function validateProp (
  key,
  propOptions,
  propsData,
  vm
) {
  var prop = propOptions[key];
  var absent = !hasOwn(propsData, key);
  var value = propsData[key];
  // boolean casting
  var booleanIndex = getTypeIndex(Boolean, prop.type);
  if (booleanIndex > -1) {
    if (absent && !hasOwn(prop, 'default')) {
      value = false;
    } else if (value === '' || value === hyphenate(key)) {
      // only cast empty string / same name to boolean if
      // boolean has higher priority
      var stringIndex = getTypeIndex(String, prop.type);
      if (stringIndex < 0 || booleanIndex < stringIndex) {
        value = true;
      }
    }
  }
  // check default value
  if (value === undefined) {
    value = getPropDefaultValue(vm, prop, key);
    // since the default value is a fresh copy,
    // make sure to observe it.
    var prevShouldObserve = shouldObserve;
    toggleObserving(true);
    observe(value);
    toggleObserving(prevShouldObserve);
  }
  if (
    false
  ) {}
  return value
}

/**
 * Get the default value of a prop.
 */
function getPropDefaultValue (vm, prop, key) {
  // no default, return undefined
  if (!hasOwn(prop, 'default')) {
    return undefined
  }
  var def = prop.default;
  // warn against non-factory defaults for Object & Array
  if (false) {}
  // the raw prop value was also undefined from previous render,
  // return previous default value to avoid unnecessary watcher trigger
  if (vm && vm.$options.propsData &&
    vm.$options.propsData[key] === undefined &&
    vm._props[key] !== undefined
  ) {
    return vm._props[key]
  }
  // call factory function for non-Function types
  // a value is Function if its prototype is function even across different execution context
  return typeof def === 'function' && getType(prop.type) !== 'Function'
    ? def.call(vm)
    : def
}

/**
 * Assert whether a prop is valid.
 */
function assertProp (
  prop,
  name,
  value,
  vm,
  absent
) {
  if (prop.required && absent) {
    warn(
      'Missing required prop: "' + name + '"',
      vm
    );
    return
  }
  if (value == null && !prop.required) {
    return
  }
  var type = prop.type;
  var valid = !type || type === true;
  var expectedTypes = [];
  if (type) {
    if (!Array.isArray(type)) {
      type = [type];
    }
    for (var i = 0; i < type.length && !valid; i++) {
      var assertedType = assertType(value, type[i]);
      expectedTypes.push(assertedType.expectedType || '');
      valid = assertedType.valid;
    }
  }

  if (!valid) {
    warn(
      getInvalidTypeMessage(name, value, expectedTypes),
      vm
    );
    return
  }
  var validator = prop.validator;
  if (validator) {
    if (!validator(value)) {
      warn(
        'Invalid prop: custom validator check failed for prop "' + name + '".',
        vm
      );
    }
  }
}

var simpleCheckRE = /^(String|Number|Boolean|Function|Symbol)$/;

function assertType (value, type) {
  var valid;
  var expectedType = getType(type);
  if (simpleCheckRE.test(expectedType)) {
    var t = typeof value;
    valid = t === expectedType.toLowerCase();
    // for primitive wrapper objects
    if (!valid && t === 'object') {
      valid = value instanceof type;
    }
  } else if (expectedType === 'Object') {
    valid = isPlainObject(value);
  } else if (expectedType === 'Array') {
    valid = Array.isArray(value);
  } else {
    valid = value instanceof type;
  }
  return {
    valid: valid,
    expectedType: expectedType
  }
}

/**
 * Use function string name to check built-in types,
 * because a simple equality check will fail when running
 * across different vms / iframes.
 */
function getType (fn) {
  var match = fn && fn.toString().match(/^\s*function (\w+)/);
  return match ? match[1] : ''
}

function isSameType (a, b) {
  return getType(a) === getType(b)
}

function getTypeIndex (type, expectedTypes) {
  if (!Array.isArray(expectedTypes)) {
    return isSameType(expectedTypes, type) ? 0 : -1
  }
  for (var i = 0, len = expectedTypes.length; i < len; i++) {
    if (isSameType(expectedTypes[i], type)) {
      return i
    }
  }
  return -1
}

function getInvalidTypeMessage (name, value, expectedTypes) {
  var message = "Invalid prop: type check failed for prop \"" + name + "\"." +
    " Expected " + (expectedTypes.map(capitalize).join(', '));
  var expectedType = expectedTypes[0];
  var receivedType = toRawType(value);
  var expectedValue = styleValue(value, expectedType);
  var receivedValue = styleValue(value, receivedType);
  // check if we need to specify expected value
  if (expectedTypes.length === 1 &&
      isExplicable(expectedType) &&
      !isBoolean(expectedType, receivedType)) {
    message += " with value " + expectedValue;
  }
  message += ", got " + receivedType + " ";
  // check if we need to specify received value
  if (isExplicable(receivedType)) {
    message += "with value " + receivedValue + ".";
  }
  return message
}

function styleValue (value, type) {
  if (type === 'String') {
    return ("\"" + value + "\"")
  } else if (type === 'Number') {
    return ("" + (Number(value)))
  } else {
    return ("" + value)
  }
}

function isExplicable (value) {
  var explicitTypes = ['string', 'number', 'boolean'];
  return explicitTypes.some(function (elem) { return value.toLowerCase() === elem; })
}

function isBoolean () {
  var args = [], len = arguments.length;
  while ( len-- ) args[ len ] = arguments[ len ];

  return args.some(function (elem) { return elem.toLowerCase() === 'boolean'; })
}

/*  */

function handleError (err, vm, info) {
  // Deactivate deps tracking while processing error handler to avoid possible infinite rendering.
  // See: https://github.com/vuejs/vuex/issues/1505
  pushTarget();
  try {
    if (vm) {
      var cur = vm;
      while ((cur = cur.$parent)) {
        var hooks = cur.$options.errorCaptured;
        if (hooks) {
          for (var i = 0; i < hooks.length; i++) {
            try {
              var capture = hooks[i].call(cur, err, vm, info) === false;
              if (capture) { return }
            } catch (e) {
              globalHandleError(e, cur, 'errorCaptured hook');
            }
          }
        }
      }
    }
    globalHandleError(err, vm, info);
  } finally {
    popTarget();
  }
}

function invokeWithErrorHandling (
  handler,
  context,
  args,
  vm,
  info
) {
  var res;
  try {
    res = args ? handler.apply(context, args) : handler.call(context);
    if (res && !res._isVue && isPromise(res) && !res._handled) {
      res.catch(function (e) { return handleError(e, vm, info + " (Promise/async)"); });
      // issue #9511
      // avoid catch triggering multiple times when nested calls
      res._handled = true;
    }
  } catch (e) {
    handleError(e, vm, info);
  }
  return res
}

function globalHandleError (err, vm, info) {
  if (config.errorHandler) {
    try {
      return config.errorHandler.call(null, err, vm, info)
    } catch (e) {
      // if the user intentionally throws the original error in the handler,
      // do not log it twice
      if (e !== err) {
        logError(e, null, 'config.errorHandler');
      }
    }
  }
  logError(err, vm, info);
}

function logError (err, vm, info) {
  if (false) {}
  /* istanbul ignore else */
  if ((inBrowser || inWeex) && typeof console !== 'undefined') {
    console.error(err);
  } else {
    throw err
  }
}

/*  */

var isUsingMicroTask = false;

var callbacks = [];
var pending = false;

function flushCallbacks () {
  pending = false;
  var copies = callbacks.slice(0);
  callbacks.length = 0;
  for (var i = 0; i < copies.length; i++) {
    copies[i]();
  }
}

// Here we have async deferring wrappers using microtasks.
// In 2.5 we used (macro) tasks (in combination with microtasks).
// However, it has subtle problems when state is changed right before repaint
// (e.g. #6813, out-in transitions).
// Also, using (macro) tasks in event handler would cause some weird behaviors
// that cannot be circumvented (e.g. #7109, #7153, #7546, #7834, #8109).
// So we now use microtasks everywhere, again.
// A major drawback of this tradeoff is that there are some scenarios
// where microtasks have too high a priority and fire in between supposedly
// sequential events (e.g. #4521, #6690, which have workarounds)
// or even between bubbling of the same event (#6566).
var timerFunc;

// The nextTick behavior leverages the microtask queue, which can be accessed
// via either native Promise.then or MutationObserver.
// MutationObserver has wider support, however it is seriously bugged in
// UIWebView in iOS >= 9.3.3 when triggered in touch event handlers. It
// completely stops working after triggering a few times... so, if native
// Promise is available, we will use it:
/* istanbul ignore next, $flow-disable-line */
if (typeof Promise !== 'undefined' && isNative(Promise)) {
  var p = Promise.resolve();
  timerFunc = function () {
    p.then(flushCallbacks);
    // In problematic UIWebViews, Promise.then doesn't completely break, but
    // it can get stuck in a weird state where callbacks are pushed into the
    // microtask queue but the queue isn't being flushed, until the browser
    // needs to do some other work, e.g. handle a timer. Therefore we can
    // "force" the microtask queue to be flushed by adding an empty timer.
    if (isIOS) { setTimeout(noop); }
  };
  isUsingMicroTask = true;
} else if (!isIE && typeof MutationObserver !== 'undefined' && (
  isNative(MutationObserver) ||
  // PhantomJS and iOS 7.x
  MutationObserver.toString() === '[object MutationObserverConstructor]'
)) {
  // Use MutationObserver where native Promise is not available,
  // e.g. PhantomJS, iOS7, Android 4.4
  // (#6466 MutationObserver is unreliable in IE11)
  var counter = 1;
  var observer = new MutationObserver(flushCallbacks);
  var textNode = document.createTextNode(String(counter));
  observer.observe(textNode, {
    characterData: true
  });
  timerFunc = function () {
    counter = (counter + 1) % 2;
    textNode.data = String(counter);
  };
  isUsingMicroTask = true;
} else if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
  // Fallback to setImmediate.
  // Technically it leverages the (macro) task queue,
  // but it is still a better choice than setTimeout.
  timerFunc = function () {
    setImmediate(flushCallbacks);
  };
} else {
  // Fallback to setTimeout.
  timerFunc = function () {
    setTimeout(flushCallbacks, 0);
  };
}

function nextTick (cb, ctx) {
  var _resolve;
  callbacks.push(function () {
    if (cb) {
      try {
        cb.call(ctx);
      } catch (e) {
        handleError(e, ctx, 'nextTick');
      }
    } else if (_resolve) {
      _resolve(ctx);
    }
  });
  if (!pending) {
    pending = true;
    timerFunc();
  }
  // $flow-disable-line
  if (!cb && typeof Promise !== 'undefined') {
    return new Promise(function (resolve) {
      _resolve = resolve;
    })
  }
}

/*  */

/* not type checking this file because flow doesn't play well with Proxy */

var initProxy;

if (false) { var getHandler, hasHandler, isBuiltInModifier, hasProxy, warnReservedPrefix, warnNonPresent, allowedGlobals; }

/*  */

var seenObjects = new _Set();

/**
 * Recursively traverse an object to evoke all converted
 * getters, so that every nested property inside the object
 * is collected as a "deep" dependency.
 */
function traverse (val) {
  _traverse(val, seenObjects);
  seenObjects.clear();
}

function _traverse (val, seen) {
  var i, keys;
  var isA = Array.isArray(val);
  if ((!isA && !isObject(val)) || Object.isFrozen(val) || val instanceof VNode) {
    return
  }
  if (val.__ob__) {
    var depId = val.__ob__.dep.id;
    if (seen.has(depId)) {
      return
    }
    seen.add(depId);
  }
  if (isA) {
    i = val.length;
    while (i--) { _traverse(val[i], seen); }
  } else {
    keys = Object.keys(val);
    i = keys.length;
    while (i--) { _traverse(val[keys[i]], seen); }
  }
}

var mark;
var measure;

if (false) { var perf; }

/*  */

var normalizeEvent = cached(function (name) {
  var passive = name.charAt(0) === '&';
  name = passive ? name.slice(1) : name;
  var once$$1 = name.charAt(0) === '~'; // Prefixed last, checked first
  name = once$$1 ? name.slice(1) : name;
  var capture = name.charAt(0) === '!';
  name = capture ? name.slice(1) : name;
  return {
    name: name,
    once: once$$1,
    capture: capture,
    passive: passive
  }
});

function createFnInvoker (fns, vm) {
  function invoker () {
    var arguments$1 = arguments;

    var fns = invoker.fns;
    if (Array.isArray(fns)) {
      var cloned = fns.slice();
      for (var i = 0; i < cloned.length; i++) {
        invokeWithErrorHandling(cloned[i], null, arguments$1, vm, "v-on handler");
      }
    } else {
      // return handler return value for single handlers
      return invokeWithErrorHandling(fns, null, arguments, vm, "v-on handler")
    }
  }
  invoker.fns = fns;
  return invoker
}

function updateListeners (
  on,
  oldOn,
  add,
  remove$$1,
  createOnceHandler,
  vm
) {
  var name, def$$1, cur, old, event;
  for (name in on) {
    def$$1 = cur = on[name];
    old = oldOn[name];
    event = normalizeEvent(name);
    if (isUndef(cur)) {
       false && 0;
    } else if (isUndef(old)) {
      if (isUndef(cur.fns)) {
        cur = on[name] = createFnInvoker(cur, vm);
      }
      if (isTrue(event.once)) {
        cur = on[name] = createOnceHandler(event.name, cur, event.capture);
      }
      add(event.name, cur, event.capture, event.passive, event.params);
    } else if (cur !== old) {
      old.fns = cur;
      on[name] = old;
    }
  }
  for (name in oldOn) {
    if (isUndef(on[name])) {
      event = normalizeEvent(name);
      remove$$1(event.name, oldOn[name], event.capture);
    }
  }
}

/*  */

function mergeVNodeHook (def, hookKey, hook) {
  if (def instanceof VNode) {
    def = def.data.hook || (def.data.hook = {});
  }
  var invoker;
  var oldHook = def[hookKey];

  function wrappedHook () {
    hook.apply(this, arguments);
    // important: remove merged hook to ensure it's called only once
    // and prevent memory leak
    remove(invoker.fns, wrappedHook);
  }

  if (isUndef(oldHook)) {
    // no existing hook
    invoker = createFnInvoker([wrappedHook]);
  } else {
    /* istanbul ignore if */
    if (isDef(oldHook.fns) && isTrue(oldHook.merged)) {
      // already a merged invoker
      invoker = oldHook;
      invoker.fns.push(wrappedHook);
    } else {
      // existing plain hook
      invoker = createFnInvoker([oldHook, wrappedHook]);
    }
  }

  invoker.merged = true;
  def[hookKey] = invoker;
}

/*  */

function extractPropsFromVNodeData (
  data,
  Ctor,
  tag
) {
  // we are only extracting raw values here.
  // validation and default values are handled in the child
  // component itself.
  var propOptions = Ctor.options.props;
  if (isUndef(propOptions)) {
    return
  }
  var res = {};
  var attrs = data.attrs;
  var props = data.props;
  if (isDef(attrs) || isDef(props)) {
    for (var key in propOptions) {
      var altKey = hyphenate(key);
      if (false) { var keyInLowerCase; }
      checkProp(res, props, key, altKey, true) ||
      checkProp(res, attrs, key, altKey, false);
    }
  }
  return res
}

function checkProp (
  res,
  hash,
  key,
  altKey,
  preserve
) {
  if (isDef(hash)) {
    if (hasOwn(hash, key)) {
      res[key] = hash[key];
      if (!preserve) {
        delete hash[key];
      }
      return true
    } else if (hasOwn(hash, altKey)) {
      res[key] = hash[altKey];
      if (!preserve) {
        delete hash[altKey];
      }
      return true
    }
  }
  return false
}

/*  */

// The template compiler attempts to minimize the need for normalization by
// statically analyzing the template at compile time.
//
// For plain HTML markup, normalization can be completely skipped because the
// generated render function is guaranteed to return Array<VNode>. There are
// two cases where extra normalization is needed:

// 1. When the children contains components - because a functional component
// may return an Array instead of a single root. In this case, just a simple
// normalization is needed - if any child is an Array, we flatten the whole
// thing with Array.prototype.concat. It is guaranteed to be only 1-level deep
// because functional components already normalize their own children.
function simpleNormalizeChildren (children) {
  for (var i = 0; i < children.length; i++) {
    if (Array.isArray(children[i])) {
      return Array.prototype.concat.apply([], children)
    }
  }
  return children
}

// 2. When the children contains constructs that always generated nested Arrays,
// e.g. <template>, <slot>, v-for, or when the children is provided by user
// with hand-written render functions / JSX. In such cases a full normalization
// is needed to cater to all possible types of children values.
function normalizeChildren (children) {
  return isPrimitive(children)
    ? [createTextVNode(children)]
    : Array.isArray(children)
      ? normalizeArrayChildren(children)
      : undefined
}

function isTextNode (node) {
  return isDef(node) && isDef(node.text) && isFalse(node.isComment)
}

function normalizeArrayChildren (children, nestedIndex) {
  var res = [];
  var i, c, lastIndex, last;
  for (i = 0; i < children.length; i++) {
    c = children[i];
    if (isUndef(c) || typeof c === 'boolean') { continue }
    lastIndex = res.length - 1;
    last = res[lastIndex];
    //  nested
    if (Array.isArray(c)) {
      if (c.length > 0) {
        c = normalizeArrayChildren(c, ((nestedIndex || '') + "_" + i));
        // merge adjacent text nodes
        if (isTextNode(c[0]) && isTextNode(last)) {
          res[lastIndex] = createTextVNode(last.text + (c[0]).text);
          c.shift();
        }
        res.push.apply(res, c);
      }
    } else if (isPrimitive(c)) {
      if (isTextNode(last)) {
        // merge adjacent text nodes
        // this is necessary for SSR hydration because text nodes are
        // essentially merged when rendered to HTML strings
        res[lastIndex] = createTextVNode(last.text + c);
      } else if (c !== '') {
        // convert primitive to vnode
        res.push(createTextVNode(c));
      }
    } else {
      if (isTextNode(c) && isTextNode(last)) {
        // merge adjacent text nodes
        res[lastIndex] = createTextVNode(last.text + c.text);
      } else {
        // default key for nested array children (likely generated by v-for)
        if (isTrue(children._isVList) &&
          isDef(c.tag) &&
          isUndef(c.key) &&
          isDef(nestedIndex)) {
          c.key = "__vlist" + nestedIndex + "_" + i + "__";
        }
        res.push(c);
      }
    }
  }
  return res
}

/*  */

function initProvide (vm) {
  var provide = vm.$options.provide;
  if (provide) {
    vm._provided = typeof provide === 'function'
      ? provide.call(vm)
      : provide;
  }
}

function initInjections (vm) {
  var result = resolveInject(vm.$options.inject, vm);
  if (result) {
    toggleObserving(false);
    Object.keys(result).forEach(function (key) {
      /* istanbul ignore else */
      if (false) {} else {
        defineReactive$$1(vm, key, result[key]);
      }
    });
    toggleObserving(true);
  }
}

function resolveInject (inject, vm) {
  if (inject) {
    // inject is :any because flow is not smart enough to figure out cached
    var result = Object.create(null);
    var keys = hasSymbol
      ? Reflect.ownKeys(inject)
      : Object.keys(inject);

    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      // #6574 in case the inject object is observed...
      if (key === '__ob__') { continue }
      var provideKey = inject[key].from;
      var source = vm;
      while (source) {
        if (source._provided && hasOwn(source._provided, provideKey)) {
          result[key] = source._provided[provideKey];
          break
        }
        source = source.$parent;
      }
      if (!source) {
        if ('default' in inject[key]) {
          var provideDefault = inject[key].default;
          result[key] = typeof provideDefault === 'function'
            ? provideDefault.call(vm)
            : provideDefault;
        } else if (false) {}
      }
    }
    return result
  }
}

/*  */



/**
 * Runtime helper for resolving raw children VNodes into a slot object.
 */
function resolveSlots (
  children,
  context
) {
  if (!children || !children.length) {
    return {}
  }
  var slots = {};
  for (var i = 0, l = children.length; i < l; i++) {
    var child = children[i];
    var data = child.data;
    // remove slot attribute if the node is resolved as a Vue slot node
    if (data && data.attrs && data.attrs.slot) {
      delete data.attrs.slot;
    }
    // named slots should only be respected if the vnode was rendered in the
    // same context.
    if ((child.context === context || child.fnContext === context) &&
      data && data.slot != null
    ) {
      var name = data.slot;
      var slot = (slots[name] || (slots[name] = []));
      if (child.tag === 'template') {
        slot.push.apply(slot, child.children || []);
      } else {
        slot.push(child);
      }
    } else {
      (slots.default || (slots.default = [])).push(child);
    }
  }
  // ignore slots that contains only whitespace
  for (var name$1 in slots) {
    if (slots[name$1].every(isWhitespace)) {
      delete slots[name$1];
    }
  }
  return slots
}

function isWhitespace (node) {
  return (node.isComment && !node.asyncFactory) || node.text === ' '
}

/*  */

function normalizeScopedSlots (
  slots,
  normalSlots,
  prevSlots
) {
  var res;
  var hasNormalSlots = Object.keys(normalSlots).length > 0;
  var isStable = slots ? !!slots.$stable : !hasNormalSlots;
  var key = slots && slots.$key;
  if (!slots) {
    res = {};
  } else if (slots._normalized) {
    // fast path 1: child component re-render only, parent did not change
    return slots._normalized
  } else if (
    isStable &&
    prevSlots &&
    prevSlots !== emptyObject &&
    key === prevSlots.$key &&
    !hasNormalSlots &&
    !prevSlots.$hasNormal
  ) {
    // fast path 2: stable scoped slots w/ no normal slots to proxy,
    // only need to normalize once
    return prevSlots
  } else {
    res = {};
    for (var key$1 in slots) {
      if (slots[key$1] && key$1[0] !== '$') {
        res[key$1] = normalizeScopedSlot(normalSlots, key$1, slots[key$1]);
      }
    }
  }
  // expose normal slots on scopedSlots
  for (var key$2 in normalSlots) {
    if (!(key$2 in res)) {
      res[key$2] = proxyNormalSlot(normalSlots, key$2);
    }
  }
  // avoriaz seems to mock a non-extensible $scopedSlots object
  // and when that is passed down this would cause an error
  if (slots && Object.isExtensible(slots)) {
    (slots)._normalized = res;
  }
  def(res, '$stable', isStable);
  def(res, '$key', key);
  def(res, '$hasNormal', hasNormalSlots);
  return res
}

function normalizeScopedSlot(normalSlots, key, fn) {
  var normalized = function () {
    var res = arguments.length ? fn.apply(null, arguments) : fn({});
    res = res && typeof res === 'object' && !Array.isArray(res)
      ? [res] // single vnode
      : normalizeChildren(res);
    return res && (
      res.length === 0 ||
      (res.length === 1 && res[0].isComment) // #9658
    ) ? undefined
      : res
  };
  // this is a slot using the new v-slot syntax without scope. although it is
  // compiled as a scoped slot, render fn users would expect it to be present
  // on this.$slots because the usage is semantically a normal slot.
  if (fn.proxy) {
    Object.defineProperty(normalSlots, key, {
      get: normalized,
      enumerable: true,
      configurable: true
    });
  }
  return normalized
}

function proxyNormalSlot(slots, key) {
  return function () { return slots[key]; }
}

/*  */

/**
 * Runtime helper for rendering v-for lists.
 */
function renderList (
  val,
  render
) {
  var ret, i, l, keys, key;
  if (Array.isArray(val) || typeof val === 'string') {
    ret = new Array(val.length);
    for (i = 0, l = val.length; i < l; i++) {
      ret[i] = render(val[i], i);
    }
  } else if (typeof val === 'number') {
    ret = new Array(val);
    for (i = 0; i < val; i++) {
      ret[i] = render(i + 1, i);
    }
  } else if (isObject(val)) {
    if (hasSymbol && val[Symbol.iterator]) {
      ret = [];
      var iterator = val[Symbol.iterator]();
      var result = iterator.next();
      while (!result.done) {
        ret.push(render(result.value, ret.length));
        result = iterator.next();
      }
    } else {
      keys = Object.keys(val);
      ret = new Array(keys.length);
      for (i = 0, l = keys.length; i < l; i++) {
        key = keys[i];
        ret[i] = render(val[key], key, i);
      }
    }
  }
  if (!isDef(ret)) {
    ret = [];
  }
  (ret)._isVList = true;
  return ret
}

/*  */

/**
 * Runtime helper for rendering <slot>
 */
function renderSlot (
  name,
  fallback,
  props,
  bindObject
) {
  var scopedSlotFn = this.$scopedSlots[name];
  var nodes;
  if (scopedSlotFn) { // scoped slot
    props = props || {};
    if (bindObject) {
      if (false) {}
      props = extend(extend({}, bindObject), props);
    }
    nodes = scopedSlotFn(props) || fallback;
  } else {
    nodes = this.$slots[name] || fallback;
  }

  var target = props && props.slot;
  if (target) {
    return this.$createElement('template', { slot: target }, nodes)
  } else {
    return nodes
  }
}

/*  */

/**
 * Runtime helper for resolving filters
 */
function resolveFilter (id) {
  return resolveAsset(this.$options, 'filters', id, true) || identity
}

/*  */

function isKeyNotMatch (expect, actual) {
  if (Array.isArray(expect)) {
    return expect.indexOf(actual) === -1
  } else {
    return expect !== actual
  }
}

/**
 * Runtime helper for checking keyCodes from config.
 * exposed as Vue.prototype._k
 * passing in eventKeyName as last argument separately for backwards compat
 */
function checkKeyCodes (
  eventKeyCode,
  key,
  builtInKeyCode,
  eventKeyName,
  builtInKeyName
) {
  var mappedKeyCode = config.keyCodes[key] || builtInKeyCode;
  if (builtInKeyName && eventKeyName && !config.keyCodes[key]) {
    return isKeyNotMatch(builtInKeyName, eventKeyName)
  } else if (mappedKeyCode) {
    return isKeyNotMatch(mappedKeyCode, eventKeyCode)
  } else if (eventKeyName) {
    return hyphenate(eventKeyName) !== key
  }
}

/*  */

/**
 * Runtime helper for merging v-bind="object" into a VNode's data.
 */
function bindObjectProps (
  data,
  tag,
  value,
  asProp,
  isSync
) {
  if (value) {
    if (!isObject(value)) {
       false && 0;
    } else {
      if (Array.isArray(value)) {
        value = toObject(value);
      }
      var hash;
      var loop = function ( key ) {
        if (
          key === 'class' ||
          key === 'style' ||
          isReservedAttribute(key)
        ) {
          hash = data;
        } else {
          var type = data.attrs && data.attrs.type;
          hash = asProp || config.mustUseProp(tag, type, key)
            ? data.domProps || (data.domProps = {})
            : data.attrs || (data.attrs = {});
        }
        var camelizedKey = camelize(key);
        var hyphenatedKey = hyphenate(key);
        if (!(camelizedKey in hash) && !(hyphenatedKey in hash)) {
          hash[key] = value[key];

          if (isSync) {
            var on = data.on || (data.on = {});
            on[("update:" + key)] = function ($event) {
              value[key] = $event;
            };
          }
        }
      };

      for (var key in value) loop( key );
    }
  }
  return data
}

/*  */

/**
 * Runtime helper for rendering static trees.
 */
function renderStatic (
  index,
  isInFor
) {
  var cached = this._staticTrees || (this._staticTrees = []);
  var tree = cached[index];
  // if has already-rendered static tree and not inside v-for,
  // we can reuse the same tree.
  if (tree && !isInFor) {
    return tree
  }
  // otherwise, render a fresh tree.
  tree = cached[index] = this.$options.staticRenderFns[index].call(
    this._renderProxy,
    null,
    this // for render fns generated for functional component templates
  );
  markStatic(tree, ("__static__" + index), false);
  return tree
}

/**
 * Runtime helper for v-once.
 * Effectively it means marking the node as static with a unique key.
 */
function markOnce (
  tree,
  index,
  key
) {
  markStatic(tree, ("__once__" + index + (key ? ("_" + key) : "")), true);
  return tree
}

function markStatic (
  tree,
  key,
  isOnce
) {
  if (Array.isArray(tree)) {
    for (var i = 0; i < tree.length; i++) {
      if (tree[i] && typeof tree[i] !== 'string') {
        markStaticNode(tree[i], (key + "_" + i), isOnce);
      }
    }
  } else {
    markStaticNode(tree, key, isOnce);
  }
}

function markStaticNode (node, key, isOnce) {
  node.isStatic = true;
  node.key = key;
  node.isOnce = isOnce;
}

/*  */

function bindObjectListeners (data, value) {
  if (value) {
    if (!isPlainObject(value)) {
       false && 0;
    } else {
      var on = data.on = data.on ? extend({}, data.on) : {};
      for (var key in value) {
        var existing = on[key];
        var ours = value[key];
        on[key] = existing ? [].concat(existing, ours) : ours;
      }
    }
  }
  return data
}

/*  */

function resolveScopedSlots (
  fns, // see flow/vnode
  res,
  // the following are added in 2.6
  hasDynamicKeys,
  contentHashKey
) {
  res = res || { $stable: !hasDynamicKeys };
  for (var i = 0; i < fns.length; i++) {
    var slot = fns[i];
    if (Array.isArray(slot)) {
      resolveScopedSlots(slot, res, hasDynamicKeys);
    } else if (slot) {
      // marker for reverse proxying v-slot without scope on this.$slots
      if (slot.proxy) {
        slot.fn.proxy = true;
      }
      res[slot.key] = slot.fn;
    }
  }
  if (contentHashKey) {
    (res).$key = contentHashKey;
  }
  return res
}

/*  */

function bindDynamicKeys (baseObj, values) {
  for (var i = 0; i < values.length; i += 2) {
    var key = values[i];
    if (typeof key === 'string' && key) {
      baseObj[values[i]] = values[i + 1];
    } else if (false) {}
  }
  return baseObj
}

// helper to dynamically append modifier runtime markers to event names.
// ensure only append when value is already string, otherwise it will be cast
// to string and cause the type check to miss.
function prependModifier (value, symbol) {
  return typeof value === 'string' ? symbol + value : value
}

/*  */

function installRenderHelpers (target) {
  target._o = markOnce;
  target._n = toNumber;
  target._s = toString;
  target._l = renderList;
  target._t = renderSlot;
  target._q = looseEqual;
  target._i = looseIndexOf;
  target._m = renderStatic;
  target._f = resolveFilter;
  target._k = checkKeyCodes;
  target._b = bindObjectProps;
  target._v = createTextVNode;
  target._e = createEmptyVNode;
  target._u = resolveScopedSlots;
  target._g = bindObjectListeners;
  target._d = bindDynamicKeys;
  target._p = prependModifier;
}

/*  */

function FunctionalRenderContext (
  data,
  props,
  children,
  parent,
  Ctor
) {
  var this$1 = this;

  var options = Ctor.options;
  // ensure the createElement function in functional components
  // gets a unique context - this is necessary for correct named slot check
  var contextVm;
  if (hasOwn(parent, '_uid')) {
    contextVm = Object.create(parent);
    // $flow-disable-line
    contextVm._original = parent;
  } else {
    // the context vm passed in is a functional context as well.
    // in this case we want to make sure we are able to get a hold to the
    // real context instance.
    contextVm = parent;
    // $flow-disable-line
    parent = parent._original;
  }
  var isCompiled = isTrue(options._compiled);
  var needNormalization = !isCompiled;

  this.data = data;
  this.props = props;
  this.children = children;
  this.parent = parent;
  this.listeners = data.on || emptyObject;
  this.injections = resolveInject(options.inject, parent);
  this.slots = function () {
    if (!this$1.$slots) {
      normalizeScopedSlots(
        data.scopedSlots,
        this$1.$slots = resolveSlots(children, parent)
      );
    }
    return this$1.$slots
  };

  Object.defineProperty(this, 'scopedSlots', ({
    enumerable: true,
    get: function get () {
      return normalizeScopedSlots(data.scopedSlots, this.slots())
    }
  }));

  // support for compiled functional template
  if (isCompiled) {
    // exposing $options for renderStatic()
    this.$options = options;
    // pre-resolve slots for renderSlot()
    this.$slots = this.slots();
    this.$scopedSlots = normalizeScopedSlots(data.scopedSlots, this.$slots);
  }

  if (options._scopeId) {
    this._c = function (a, b, c, d) {
      var vnode = createElement(contextVm, a, b, c, d, needNormalization);
      if (vnode && !Array.isArray(vnode)) {
        vnode.fnScopeId = options._scopeId;
        vnode.fnContext = parent;
      }
      return vnode
    };
  } else {
    this._c = function (a, b, c, d) { return createElement(contextVm, a, b, c, d, needNormalization); };
  }
}

installRenderHelpers(FunctionalRenderContext.prototype);

function createFunctionalComponent (
  Ctor,
  propsData,
  data,
  contextVm,
  children
) {
  var options = Ctor.options;
  var props = {};
  var propOptions = options.props;
  if (isDef(propOptions)) {
    for (var key in propOptions) {
      props[key] = validateProp(key, propOptions, propsData || emptyObject);
    }
  } else {
    if (isDef(data.attrs)) { mergeProps(props, data.attrs); }
    if (isDef(data.props)) { mergeProps(props, data.props); }
  }

  var renderContext = new FunctionalRenderContext(
    data,
    props,
    children,
    contextVm,
    Ctor
  );

  var vnode = options.render.call(null, renderContext._c, renderContext);

  if (vnode instanceof VNode) {
    return cloneAndMarkFunctionalResult(vnode, data, renderContext.parent, options, renderContext)
  } else if (Array.isArray(vnode)) {
    var vnodes = normalizeChildren(vnode) || [];
    var res = new Array(vnodes.length);
    for (var i = 0; i < vnodes.length; i++) {
      res[i] = cloneAndMarkFunctionalResult(vnodes[i], data, renderContext.parent, options, renderContext);
    }
    return res
  }
}

function cloneAndMarkFunctionalResult (vnode, data, contextVm, options, renderContext) {
  // #7817 clone node before setting fnContext, otherwise if the node is reused
  // (e.g. it was from a cached normal slot) the fnContext causes named slots
  // that should not be matched to match.
  var clone = cloneVNode(vnode);
  clone.fnContext = contextVm;
  clone.fnOptions = options;
  if (false) {}
  if (data.slot) {
    (clone.data || (clone.data = {})).slot = data.slot;
  }
  return clone
}

function mergeProps (to, from) {
  for (var key in from) {
    to[camelize(key)] = from[key];
  }
}

/*  */

/*  */

/*  */

/*  */

// inline hooks to be invoked on component VNodes during patch
var componentVNodeHooks = {
  init: function init (vnode, hydrating) {
    if (
      vnode.componentInstance &&
      !vnode.componentInstance._isDestroyed &&
      vnode.data.keepAlive
    ) {
      // kept-alive components, treat as a patch
      var mountedNode = vnode; // work around flow
      componentVNodeHooks.prepatch(mountedNode, mountedNode);
    } else {
      var child = vnode.componentInstance = createComponentInstanceForVnode(
        vnode,
        activeInstance
      );
      child.$mount(hydrating ? vnode.elm : undefined, hydrating);
    }
  },

  prepatch: function prepatch (oldVnode, vnode) {
    var options = vnode.componentOptions;
    var child = vnode.componentInstance = oldVnode.componentInstance;
    updateChildComponent(
      child,
      options.propsData, // updated props
      options.listeners, // updated listeners
      vnode, // new parent vnode
      options.children // new children
    );
  },

  insert: function insert (vnode) {
    var context = vnode.context;
    var componentInstance = vnode.componentInstance;
    if (!componentInstance._isMounted) {
      componentInstance._isMounted = true;
      callHook(componentInstance, 'mounted');
    }
    if (vnode.data.keepAlive) {
      if (context._isMounted) {
        // vue-router#1212
        // During updates, a kept-alive component's child components may
        // change, so directly walking the tree here may call activated hooks
        // on incorrect children. Instead we push them into a queue which will
        // be processed after the whole patch process ended.
        queueActivatedComponent(componentInstance);
      } else {
        activateChildComponent(componentInstance, true /* direct */);
      }
    }
  },

  destroy: function destroy (vnode) {
    var componentInstance = vnode.componentInstance;
    if (!componentInstance._isDestroyed) {
      if (!vnode.data.keepAlive) {
        componentInstance.$destroy();
      } else {
        deactivateChildComponent(componentInstance, true /* direct */);
      }
    }
  }
};

var hooksToMerge = Object.keys(componentVNodeHooks);

function createComponent (
  Ctor,
  data,
  context,
  children,
  tag
) {
  if (isUndef(Ctor)) {
    return
  }

  var baseCtor = context.$options._base;

  // plain options object: turn it into a constructor
  if (isObject(Ctor)) {
    Ctor = baseCtor.extend(Ctor);
  }

  // if at this stage it's not a constructor or an async component factory,
  // reject.
  if (typeof Ctor !== 'function') {
    if (false) {}
    return
  }

  // async component
  var asyncFactory;
  if (isUndef(Ctor.cid)) {
    asyncFactory = Ctor;
    Ctor = resolveAsyncComponent(asyncFactory, baseCtor);
    if (Ctor === undefined) {
      // return a placeholder node for async component, which is rendered
      // as a comment node but preserves all the raw information for the node.
      // the information will be used for async server-rendering and hydration.
      return createAsyncPlaceholder(
        asyncFactory,
        data,
        context,
        children,
        tag
      )
    }
  }

  data = data || {};

  // resolve constructor options in case global mixins are applied after
  // component constructor creation
  resolveConstructorOptions(Ctor);

  // transform component v-model data into props & events
  if (isDef(data.model)) {
    transformModel(Ctor.options, data);
  }

  // extract props
  var propsData = extractPropsFromVNodeData(data, Ctor, tag);

  // functional component
  if (isTrue(Ctor.options.functional)) {
    return createFunctionalComponent(Ctor, propsData, data, context, children)
  }

  // extract listeners, since these needs to be treated as
  // child component listeners instead of DOM listeners
  var listeners = data.on;
  // replace with listeners with .native modifier
  // so it gets processed during parent component patch.
  data.on = data.nativeOn;

  if (isTrue(Ctor.options.abstract)) {
    // abstract components do not keep anything
    // other than props & listeners & slot

    // work around flow
    var slot = data.slot;
    data = {};
    if (slot) {
      data.slot = slot;
    }
  }

  // install component management hooks onto the placeholder node
  installComponentHooks(data);

  // return a placeholder vnode
  var name = Ctor.options.name || tag;
  var vnode = new VNode(
    ("vue-component-" + (Ctor.cid) + (name ? ("-" + name) : '')),
    data, undefined, undefined, undefined, context,
    { Ctor: Ctor, propsData: propsData, listeners: listeners, tag: tag, children: children },
    asyncFactory
  );

  return vnode
}

function createComponentInstanceForVnode (
  vnode, // we know it's MountedComponentVNode but flow doesn't
  parent // activeInstance in lifecycle state
) {
  var options = {
    _isComponent: true,
    _parentVnode: vnode,
    parent: parent
  };
  // check inline-template render functions
  var inlineTemplate = vnode.data.inlineTemplate;
  if (isDef(inlineTemplate)) {
    options.render = inlineTemplate.render;
    options.staticRenderFns = inlineTemplate.staticRenderFns;
  }
  return new vnode.componentOptions.Ctor(options)
}

function installComponentHooks (data) {
  var hooks = data.hook || (data.hook = {});
  for (var i = 0; i < hooksToMerge.length; i++) {
    var key = hooksToMerge[i];
    var existing = hooks[key];
    var toMerge = componentVNodeHooks[key];
    if (existing !== toMerge && !(existing && existing._merged)) {
      hooks[key] = existing ? mergeHook$1(toMerge, existing) : toMerge;
    }
  }
}

function mergeHook$1 (f1, f2) {
  var merged = function (a, b) {
    // flow complains about extra args which is why we use any
    f1(a, b);
    f2(a, b);
  };
  merged._merged = true;
  return merged
}

// transform component v-model info (value and callback) into
// prop and event handler respectively.
function transformModel (options, data) {
  var prop = (options.model && options.model.prop) || 'value';
  var event = (options.model && options.model.event) || 'input'
  ;(data.attrs || (data.attrs = {}))[prop] = data.model.value;
  var on = data.on || (data.on = {});
  var existing = on[event];
  var callback = data.model.callback;
  if (isDef(existing)) {
    if (
      Array.isArray(existing)
        ? existing.indexOf(callback) === -1
        : existing !== callback
    ) {
      on[event] = [callback].concat(existing);
    }
  } else {
    on[event] = callback;
  }
}

/*  */

var SIMPLE_NORMALIZE = 1;
var ALWAYS_NORMALIZE = 2;

// wrapper function for providing a more flexible interface
// without getting yelled at by flow
function createElement (
  context,
  tag,
  data,
  children,
  normalizationType,
  alwaysNormalize
) {
  if (Array.isArray(data) || isPrimitive(data)) {
    normalizationType = children;
    children = data;
    data = undefined;
  }
  if (isTrue(alwaysNormalize)) {
    normalizationType = ALWAYS_NORMALIZE;
  }
  return _createElement(context, tag, data, children, normalizationType)
}

function _createElement (
  context,
  tag,
  data,
  children,
  normalizationType
) {
  if (isDef(data) && isDef((data).__ob__)) {
     false && 0;
    return createEmptyVNode()
  }
  // object syntax in v-bind
  if (isDef(data) && isDef(data.is)) {
    tag = data.is;
  }
  if (!tag) {
    // in case of component :is set to falsy value
    return createEmptyVNode()
  }
  // warn against non-primitive key
  if (false
  ) {}
  // support single function children as default scoped slot
  if (Array.isArray(children) &&
    typeof children[0] === 'function'
  ) {
    data = data || {};
    data.scopedSlots = { default: children[0] };
    children.length = 0;
  }
  if (normalizationType === ALWAYS_NORMALIZE) {
    children = normalizeChildren(children);
  } else if (normalizationType === SIMPLE_NORMALIZE) {
    children = simpleNormalizeChildren(children);
  }
  var vnode, ns;
  if (typeof tag === 'string') {
    var Ctor;
    ns = (context.$vnode && context.$vnode.ns) || config.getTagNamespace(tag);
    if (config.isReservedTag(tag)) {
      // platform built-in elements
      if (false) {}
      vnode = new VNode(
        config.parsePlatformTagName(tag), data, children,
        undefined, undefined, context
      );
    } else if ((!data || !data.pre) && isDef(Ctor = resolveAsset(context.$options, 'components', tag))) {
      // component
      vnode = createComponent(Ctor, data, context, children, tag);
    } else {
      // unknown or unlisted namespaced elements
      // check at runtime because it may get assigned a namespace when its
      // parent normalizes children
      vnode = new VNode(
        tag, data, children,
        undefined, undefined, context
      );
    }
  } else {
    // direct component options / constructor
    vnode = createComponent(tag, data, context, children);
  }
  if (Array.isArray(vnode)) {
    return vnode
  } else if (isDef(vnode)) {
    if (isDef(ns)) { applyNS(vnode, ns); }
    if (isDef(data)) { registerDeepBindings(data); }
    return vnode
  } else {
    return createEmptyVNode()
  }
}

function applyNS (vnode, ns, force) {
  vnode.ns = ns;
  if (vnode.tag === 'foreignObject') {
    // use default namespace inside foreignObject
    ns = undefined;
    force = true;
  }
  if (isDef(vnode.children)) {
    for (var i = 0, l = vnode.children.length; i < l; i++) {
      var child = vnode.children[i];
      if (isDef(child.tag) && (
        isUndef(child.ns) || (isTrue(force) && child.tag !== 'svg'))) {
        applyNS(child, ns, force);
      }
    }
  }
}

// ref #5318
// necessary to ensure parent re-render when deep bindings like :style and
// :class are used on slot nodes
function registerDeepBindings (data) {
  if (isObject(data.style)) {
    traverse(data.style);
  }
  if (isObject(data.class)) {
    traverse(data.class);
  }
}

/*  */

function initRender (vm) {
  vm._vnode = null; // the root of the child tree
  vm._staticTrees = null; // v-once cached trees
  var options = vm.$options;
  var parentVnode = vm.$vnode = options._parentVnode; // the placeholder node in parent tree
  var renderContext = parentVnode && parentVnode.context;
  vm.$slots = resolveSlots(options._renderChildren, renderContext);
  vm.$scopedSlots = emptyObject;
  // bind the createElement fn to this instance
  // so that we get proper render context inside it.
  // args order: tag, data, children, normalizationType, alwaysNormalize
  // internal version is used by render functions compiled from templates
  vm._c = function (a, b, c, d) { return createElement(vm, a, b, c, d, false); };
  // normalization is always applied for the public version, used in
  // user-written render functions.
  vm.$createElement = function (a, b, c, d) { return createElement(vm, a, b, c, d, true); };

  // $attrs & $listeners are exposed for easier HOC creation.
  // they need to be reactive so that HOCs using them are always updated
  var parentData = parentVnode && parentVnode.data;

  /* istanbul ignore else */
  if (false) {} else {
    defineReactive$$1(vm, '$attrs', parentData && parentData.attrs || emptyObject, null, true);
    defineReactive$$1(vm, '$listeners', options._parentListeners || emptyObject, null, true);
  }
}

var currentRenderingInstance = null;

function renderMixin (Vue) {
  // install runtime convenience helpers
  installRenderHelpers(Vue.prototype);

  Vue.prototype.$nextTick = function (fn) {
    return nextTick(fn, this)
  };

  Vue.prototype._render = function () {
    var vm = this;
    var ref = vm.$options;
    var render = ref.render;
    var _parentVnode = ref._parentVnode;

    if (_parentVnode) {
      vm.$scopedSlots = normalizeScopedSlots(
        _parentVnode.data.scopedSlots,
        vm.$slots,
        vm.$scopedSlots
      );
    }

    // set parent vnode. this allows render functions to have access
    // to the data on the placeholder node.
    vm.$vnode = _parentVnode;
    // render self
    var vnode;
    try {
      // There's no need to maintain a stack because all render fns are called
      // separately from one another. Nested component's render fns are called
      // when parent component is patched.
      currentRenderingInstance = vm;
      vnode = render.call(vm._renderProxy, vm.$createElement);
    } catch (e) {
      handleError(e, vm, "render");
      // return error render result,
      // or previous vnode to prevent render error causing blank component
      /* istanbul ignore else */
      if (false) {} else {
        vnode = vm._vnode;
      }
    } finally {
      currentRenderingInstance = null;
    }
    // if the returned array contains only a single node, allow it
    if (Array.isArray(vnode) && vnode.length === 1) {
      vnode = vnode[0];
    }
    // return empty vnode in case the render function errored out
    if (!(vnode instanceof VNode)) {
      if (false) {}
      vnode = createEmptyVNode();
    }
    // set parent
    vnode.parent = _parentVnode;
    return vnode
  };
}

/*  */

function ensureCtor (comp, base) {
  if (
    comp.__esModule ||
    (hasSymbol && comp[Symbol.toStringTag] === 'Module')
  ) {
    comp = comp.default;
  }
  return isObject(comp)
    ? base.extend(comp)
    : comp
}

function createAsyncPlaceholder (
  factory,
  data,
  context,
  children,
  tag
) {
  var node = createEmptyVNode();
  node.asyncFactory = factory;
  node.asyncMeta = { data: data, context: context, children: children, tag: tag };
  return node
}

function resolveAsyncComponent (
  factory,
  baseCtor
) {
  if (isTrue(factory.error) && isDef(factory.errorComp)) {
    return factory.errorComp
  }

  if (isDef(factory.resolved)) {
    return factory.resolved
  }

  var owner = currentRenderingInstance;
  if (owner && isDef(factory.owners) && factory.owners.indexOf(owner) === -1) {
    // already pending
    factory.owners.push(owner);
  }

  if (isTrue(factory.loading) && isDef(factory.loadingComp)) {
    return factory.loadingComp
  }

  if (owner && !isDef(factory.owners)) {
    var owners = factory.owners = [owner];
    var sync = true;
    var timerLoading = null;
    var timerTimeout = null

    ;(owner).$on('hook:destroyed', function () { return remove(owners, owner); });

    var forceRender = function (renderCompleted) {
      for (var i = 0, l = owners.length; i < l; i++) {
        (owners[i]).$forceUpdate();
      }

      if (renderCompleted) {
        owners.length = 0;
        if (timerLoading !== null) {
          clearTimeout(timerLoading);
          timerLoading = null;
        }
        if (timerTimeout !== null) {
          clearTimeout(timerTimeout);
          timerTimeout = null;
        }
      }
    };

    var resolve = once(function (res) {
      // cache resolved
      factory.resolved = ensureCtor(res, baseCtor);
      // invoke callbacks only if this is not a synchronous resolve
      // (async resolves are shimmed as synchronous during SSR)
      if (!sync) {
        forceRender(true);
      } else {
        owners.length = 0;
      }
    });

    var reject = once(function (reason) {
       false && 0;
      if (isDef(factory.errorComp)) {
        factory.error = true;
        forceRender(true);
      }
    });

    var res = factory(resolve, reject);

    if (isObject(res)) {
      if (isPromise(res)) {
        // () => Promise
        if (isUndef(factory.resolved)) {
          res.then(resolve, reject);
        }
      } else if (isPromise(res.component)) {
        res.component.then(resolve, reject);

        if (isDef(res.error)) {
          factory.errorComp = ensureCtor(res.error, baseCtor);
        }

        if (isDef(res.loading)) {
          factory.loadingComp = ensureCtor(res.loading, baseCtor);
          if (res.delay === 0) {
            factory.loading = true;
          } else {
            timerLoading = setTimeout(function () {
              timerLoading = null;
              if (isUndef(factory.resolved) && isUndef(factory.error)) {
                factory.loading = true;
                forceRender(false);
              }
            }, res.delay || 200);
          }
        }

        if (isDef(res.timeout)) {
          timerTimeout = setTimeout(function () {
            timerTimeout = null;
            if (isUndef(factory.resolved)) {
              reject(
                 false
                  ? (0)
                  : null
              );
            }
          }, res.timeout);
        }
      }
    }

    sync = false;
    // return in case resolved synchronously
    return factory.loading
      ? factory.loadingComp
      : factory.resolved
  }
}

/*  */

function isAsyncPlaceholder (node) {
  return node.isComment && node.asyncFactory
}

/*  */

function getFirstComponentChild (children) {
  if (Array.isArray(children)) {
    for (var i = 0; i < children.length; i++) {
      var c = children[i];
      if (isDef(c) && (isDef(c.componentOptions) || isAsyncPlaceholder(c))) {
        return c
      }
    }
  }
}

/*  */

/*  */

function initEvents (vm) {
  vm._events = Object.create(null);
  vm._hasHookEvent = false;
  // init parent attached events
  var listeners = vm.$options._parentListeners;
  if (listeners) {
    updateComponentListeners(vm, listeners);
  }
}

var target;

function add (event, fn) {
  target.$on(event, fn);
}

function remove$1 (event, fn) {
  target.$off(event, fn);
}

function createOnceHandler (event, fn) {
  var _target = target;
  return function onceHandler () {
    var res = fn.apply(null, arguments);
    if (res !== null) {
      _target.$off(event, onceHandler);
    }
  }
}

function updateComponentListeners (
  vm,
  listeners,
  oldListeners
) {
  target = vm;
  updateListeners(listeners, oldListeners || {}, add, remove$1, createOnceHandler, vm);
  target = undefined;
}

function eventsMixin (Vue) {
  var hookRE = /^hook:/;
  Vue.prototype.$on = function (event, fn) {
    var vm = this;
    if (Array.isArray(event)) {
      for (var i = 0, l = event.length; i < l; i++) {
        vm.$on(event[i], fn);
      }
    } else {
      (vm._events[event] || (vm._events[event] = [])).push(fn);
      // optimize hook:event cost by using a boolean flag marked at registration
      // instead of a hash lookup
      if (hookRE.test(event)) {
        vm._hasHookEvent = true;
      }
    }
    return vm
  };

  Vue.prototype.$once = function (event, fn) {
    var vm = this;
    function on () {
      vm.$off(event, on);
      fn.apply(vm, arguments);
    }
    on.fn = fn;
    vm.$on(event, on);
    return vm
  };

  Vue.prototype.$off = function (event, fn) {
    var vm = this;
    // all
    if (!arguments.length) {
      vm._events = Object.create(null);
      return vm
    }
    // array of events
    if (Array.isArray(event)) {
      for (var i$1 = 0, l = event.length; i$1 < l; i$1++) {
        vm.$off(event[i$1], fn);
      }
      return vm
    }
    // specific event
    var cbs = vm._events[event];
    if (!cbs) {
      return vm
    }
    if (!fn) {
      vm._events[event] = null;
      return vm
    }
    // specific handler
    var cb;
    var i = cbs.length;
    while (i--) {
      cb = cbs[i];
      if (cb === fn || cb.fn === fn) {
        cbs.splice(i, 1);
        break
      }
    }
    return vm
  };

  Vue.prototype.$emit = function (event) {
    var vm = this;
    if (false) { var lowerCaseEvent; }
    var cbs = vm._events[event];
    if (cbs) {
      cbs = cbs.length > 1 ? toArray(cbs) : cbs;
      var args = toArray(arguments, 1);
      var info = "event handler for \"" + event + "\"";
      for (var i = 0, l = cbs.length; i < l; i++) {
        invokeWithErrorHandling(cbs[i], vm, args, vm, info);
      }
    }
    return vm
  };
}

/*  */

var activeInstance = null;
var isUpdatingChildComponent = false;

function setActiveInstance(vm) {
  var prevActiveInstance = activeInstance;
  activeInstance = vm;
  return function () {
    activeInstance = prevActiveInstance;
  }
}

function initLifecycle (vm) {
  var options = vm.$options;

  // locate first non-abstract parent
  var parent = options.parent;
  if (parent && !options.abstract) {
    while (parent.$options.abstract && parent.$parent) {
      parent = parent.$parent;
    }
    parent.$children.push(vm);
  }

  vm.$parent = parent;
  vm.$root = parent ? parent.$root : vm;

  vm.$children = [];
  vm.$refs = {};

  vm._watcher = null;
  vm._inactive = null;
  vm._directInactive = false;
  vm._isMounted = false;
  vm._isDestroyed = false;
  vm._isBeingDestroyed = false;
}

function lifecycleMixin (Vue) {
  Vue.prototype._update = function (vnode, hydrating) {
    var vm = this;
    var prevEl = vm.$el;
    var prevVnode = vm._vnode;
    var restoreActiveInstance = setActiveInstance(vm);
    vm._vnode = vnode;
    // Vue.prototype.__patch__ is injected in entry points
    // based on the rendering backend used.
    if (!prevVnode) {
      // initial render
      vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */);
    } else {
      // updates
      vm.$el = vm.__patch__(prevVnode, vnode);
    }
    restoreActiveInstance();
    // update __vue__ reference
    if (prevEl) {
      prevEl.__vue__ = null;
    }
    if (vm.$el) {
      vm.$el.__vue__ = vm;
    }
    // if parent is an HOC, update its $el as well
    if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
      vm.$parent.$el = vm.$el;
    }
    // updated hook is called by the scheduler to ensure that children are
    // updated in a parent's updated hook.
  };

  Vue.prototype.$forceUpdate = function () {
    var vm = this;
    if (vm._watcher) {
      vm._watcher.update();
    }
  };

  Vue.prototype.$destroy = function () {
    var vm = this;
    if (vm._isBeingDestroyed) {
      return
    }
    callHook(vm, 'beforeDestroy');
    vm._isBeingDestroyed = true;
    // remove self from parent
    var parent = vm.$parent;
    if (parent && !parent._isBeingDestroyed && !vm.$options.abstract) {
      remove(parent.$children, vm);
    }
    // teardown watchers
    if (vm._watcher) {
      vm._watcher.teardown();
    }
    var i = vm._watchers.length;
    while (i--) {
      vm._watchers[i].teardown();
    }
    // remove reference from data ob
    // frozen object may not have observer.
    if (vm._data.__ob__) {
      vm._data.__ob__.vmCount--;
    }
    // call the last hook...
    vm._isDestroyed = true;
    // invoke destroy hooks on current rendered tree
    vm.__patch__(vm._vnode, null);
    // fire destroyed hook
    callHook(vm, 'destroyed');
    // turn off all instance listeners.
    vm.$off();
    // remove __vue__ reference
    if (vm.$el) {
      vm.$el.__vue__ = null;
    }
    // release circular reference (#6759)
    if (vm.$vnode) {
      vm.$vnode.parent = null;
    }
  };
}

function mountComponent (
  vm,
  el,
  hydrating
) {
  vm.$el = el;
  if (!vm.$options.render) {
    vm.$options.render = createEmptyVNode;
    if (false) {}
  }
  callHook(vm, 'beforeMount');

  var updateComponent;
  /* istanbul ignore if */
  if (false) {} else {
    updateComponent = function () {
      vm._update(vm._render(), hydrating);
    };
  }

  // we set this to vm._watcher inside the watcher's constructor
  // since the watcher's initial patch may call $forceUpdate (e.g. inside child
  // component's mounted hook), which relies on vm._watcher being already defined
  new Watcher(vm, updateComponent, noop, {
    before: function before () {
      if (vm._isMounted && !vm._isDestroyed) {
        callHook(vm, 'beforeUpdate');
      }
    }
  }, true /* isRenderWatcher */);
  hydrating = false;

  // manually mounted instance, call mounted on self
  // mounted is called for render-created child components in its inserted hook
  if (vm.$vnode == null) {
    vm._isMounted = true;
    callHook(vm, 'mounted');
  }
  return vm
}

function updateChildComponent (
  vm,
  propsData,
  listeners,
  parentVnode,
  renderChildren
) {
  if (false) {}

  // determine whether component has slot children
  // we need to do this before overwriting $options._renderChildren.

  // check if there are dynamic scopedSlots (hand-written or compiled but with
  // dynamic slot names). Static scoped slots compiled from template has the
  // "$stable" marker.
  var newScopedSlots = parentVnode.data.scopedSlots;
  var oldScopedSlots = vm.$scopedSlots;
  var hasDynamicScopedSlot = !!(
    (newScopedSlots && !newScopedSlots.$stable) ||
    (oldScopedSlots !== emptyObject && !oldScopedSlots.$stable) ||
    (newScopedSlots && vm.$scopedSlots.$key !== newScopedSlots.$key)
  );

  // Any static slot children from the parent may have changed during parent's
  // update. Dynamic scoped slots may also have changed. In such cases, a forced
  // update is necessary to ensure correctness.
  var needsForceUpdate = !!(
    renderChildren ||               // has new static slots
    vm.$options._renderChildren ||  // has old static slots
    hasDynamicScopedSlot
  );

  vm.$options._parentVnode = parentVnode;
  vm.$vnode = parentVnode; // update vm's placeholder node without re-render

  if (vm._vnode) { // update child tree's parent
    vm._vnode.parent = parentVnode;
  }
  vm.$options._renderChildren = renderChildren;

  // update $attrs and $listeners hash
  // these are also reactive so they may trigger child update if the child
  // used them during render
  vm.$attrs = parentVnode.data.attrs || emptyObject;
  vm.$listeners = listeners || emptyObject;

  // update props
  if (propsData && vm.$options.props) {
    toggleObserving(false);
    var props = vm._props;
    var propKeys = vm.$options._propKeys || [];
    for (var i = 0; i < propKeys.length; i++) {
      var key = propKeys[i];
      var propOptions = vm.$options.props; // wtf flow?
      props[key] = validateProp(key, propOptions, propsData, vm);
    }
    toggleObserving(true);
    // keep a copy of raw propsData
    vm.$options.propsData = propsData;
  }

  // update listeners
  listeners = listeners || emptyObject;
  var oldListeners = vm.$options._parentListeners;
  vm.$options._parentListeners = listeners;
  updateComponentListeners(vm, listeners, oldListeners);

  // resolve slots + force update if has children
  if (needsForceUpdate) {
    vm.$slots = resolveSlots(renderChildren, parentVnode.context);
    vm.$forceUpdate();
  }

  if (false) {}
}

function isInInactiveTree (vm) {
  while (vm && (vm = vm.$parent)) {
    if (vm._inactive) { return true }
  }
  return false
}

function activateChildComponent (vm, direct) {
  if (direct) {
    vm._directInactive = false;
    if (isInInactiveTree(vm)) {
      return
    }
  } else if (vm._directInactive) {
    return
  }
  if (vm._inactive || vm._inactive === null) {
    vm._inactive = false;
    for (var i = 0; i < vm.$children.length; i++) {
      activateChildComponent(vm.$children[i]);
    }
    callHook(vm, 'activated');
  }
}

function deactivateChildComponent (vm, direct) {
  if (direct) {
    vm._directInactive = true;
    if (isInInactiveTree(vm)) {
      return
    }
  }
  if (!vm._inactive) {
    vm._inactive = true;
    for (var i = 0; i < vm.$children.length; i++) {
      deactivateChildComponent(vm.$children[i]);
    }
    callHook(vm, 'deactivated');
  }
}

function callHook (vm, hook) {
  // #7573 disable dep collection when invoking lifecycle hooks
  pushTarget();
  var handlers = vm.$options[hook];
  var info = hook + " hook";
  if (handlers) {
    for (var i = 0, j = handlers.length; i < j; i++) {
      invokeWithErrorHandling(handlers[i], vm, null, vm, info);
    }
  }
  if (vm._hasHookEvent) {
    vm.$emit('hook:' + hook);
  }
  popTarget();
}

/*  */

var MAX_UPDATE_COUNT = 100;

var queue = [];
var activatedChildren = [];
var has = {};
var circular = {};
var waiting = false;
var flushing = false;
var index = 0;

/**
 * Reset the scheduler's state.
 */
function resetSchedulerState () {
  index = queue.length = activatedChildren.length = 0;
  has = {};
  if (false) {}
  waiting = flushing = false;
}

// Async edge case #6566 requires saving the timestamp when event listeners are
// attached. However, calling performance.now() has a perf overhead especially
// if the page has thousands of event listeners. Instead, we take a timestamp
// every time the scheduler flushes and use that for all event listeners
// attached during that flush.
var currentFlushTimestamp = 0;

// Async edge case fix requires storing an event listener's attach timestamp.
var getNow = Date.now;

// Determine what event timestamp the browser is using. Annoyingly, the
// timestamp can either be hi-res (relative to page load) or low-res
// (relative to UNIX epoch), so in order to compare time we have to use the
// same timestamp type when saving the flush timestamp.
// All IE versions use low-res event timestamps, and have problematic clock
// implementations (#9632)
if (inBrowser && !isIE) {
  var performance = window.performance;
  if (
    performance &&
    typeof performance.now === 'function' &&
    getNow() > document.createEvent('Event').timeStamp
  ) {
    // if the event timestamp, although evaluated AFTER the Date.now(), is
    // smaller than it, it means the event is using a hi-res timestamp,
    // and we need to use the hi-res version for event listener timestamps as
    // well.
    getNow = function () { return performance.now(); };
  }
}

/**
 * Flush both queues and run the watchers.
 */
function flushSchedulerQueue () {
  currentFlushTimestamp = getNow();
  flushing = true;
  var watcher, id;

  // Sort queue before flush.
  // This ensures that:
  // 1. Components are updated from parent to child. (because parent is always
  //    created before the child)
  // 2. A component's user watchers are run before its render watcher (because
  //    user watchers are created before the render watcher)
  // 3. If a component is destroyed during a parent component's watcher run,
  //    its watchers can be skipped.
  queue.sort(function (a, b) { return a.id - b.id; });

  // do not cache length because more watchers might be pushed
  // as we run existing watchers
  for (index = 0; index < queue.length; index++) {
    watcher = queue[index];
    if (watcher.before) {
      watcher.before();
    }
    id = watcher.id;
    has[id] = null;
    watcher.run();
    // in dev build, check and stop circular updates.
    if (false) {}
  }

  // keep copies of post queues before resetting state
  var activatedQueue = activatedChildren.slice();
  var updatedQueue = queue.slice();

  resetSchedulerState();

  // call component updated and activated hooks
  callActivatedHooks(activatedQueue);
  callUpdatedHooks(updatedQueue);

  // devtool hook
  /* istanbul ignore if */
  if (devtools && config.devtools) {
    devtools.emit('flush');
  }
}

function callUpdatedHooks (queue) {
  var i = queue.length;
  while (i--) {
    var watcher = queue[i];
    var vm = watcher.vm;
    if (vm._watcher === watcher && vm._isMounted && !vm._isDestroyed) {
      callHook(vm, 'updated');
    }
  }
}

/**
 * Queue a kept-alive component that was activated during patch.
 * The queue will be processed after the entire tree has been patched.
 */
function queueActivatedComponent (vm) {
  // setting _inactive to false here so that a render function can
  // rely on checking whether it's in an inactive tree (e.g. router-view)
  vm._inactive = false;
  activatedChildren.push(vm);
}

function callActivatedHooks (queue) {
  for (var i = 0; i < queue.length; i++) {
    queue[i]._inactive = true;
    activateChildComponent(queue[i], true /* true */);
  }
}

/**
 * Push a watcher into the watcher queue.
 * Jobs with duplicate IDs will be skipped unless it's
 * pushed when the queue is being flushed.
 */
function queueWatcher (watcher) {
  var id = watcher.id;
  if (has[id] == null) {
    has[id] = true;
    if (!flushing) {
      queue.push(watcher);
    } else {
      // if already flushing, splice the watcher based on its id
      // if already past its id, it will be run next immediately.
      var i = queue.length - 1;
      while (i > index && queue[i].id > watcher.id) {
        i--;
      }
      queue.splice(i + 1, 0, watcher);
    }
    // queue the flush
    if (!waiting) {
      waiting = true;

      if (false) {}
      nextTick(flushSchedulerQueue);
    }
  }
}

/*  */



var uid$2 = 0;

/**
 * A watcher parses an expression, collects dependencies,
 * and fires callback when the expression value changes.
 * This is used for both the $watch() api and directives.
 */
var Watcher = function Watcher (
  vm,
  expOrFn,
  cb,
  options,
  isRenderWatcher
) {
  this.vm = vm;
  if (isRenderWatcher) {
    vm._watcher = this;
  }
  vm._watchers.push(this);
  // options
  if (options) {
    this.deep = !!options.deep;
    this.user = !!options.user;
    this.lazy = !!options.lazy;
    this.sync = !!options.sync;
    this.before = options.before;
  } else {
    this.deep = this.user = this.lazy = this.sync = false;
  }
  this.cb = cb;
  this.id = ++uid$2; // uid for batching
  this.active = true;
  this.dirty = this.lazy; // for lazy watchers
  this.deps = [];
  this.newDeps = [];
  this.depIds = new _Set();
  this.newDepIds = new _Set();
  this.expression =  false
    ? 0
    : '';
  // parse expression for getter
  if (typeof expOrFn === 'function') {
    this.getter = expOrFn;
  } else {
    this.getter = parsePath(expOrFn);
    if (!this.getter) {
      this.getter = noop;
       false && 0;
    }
  }
  this.value = this.lazy
    ? undefined
    : this.get();
};

/**
 * Evaluate the getter, and re-collect dependencies.
 */
Watcher.prototype.get = function get () {
  pushTarget(this);
  var value;
  var vm = this.vm;
  try {
    value = this.getter.call(vm, vm);
  } catch (e) {
    if (this.user) {
      handleError(e, vm, ("getter for watcher \"" + (this.expression) + "\""));
    } else {
      throw e
    }
  } finally {
    // "touch" every property so they are all tracked as
    // dependencies for deep watching
    if (this.deep) {
      traverse(value);
    }
    popTarget();
    this.cleanupDeps();
  }
  return value
};

/**
 * Add a dependency to this directive.
 */
Watcher.prototype.addDep = function addDep (dep) {
  var id = dep.id;
  if (!this.newDepIds.has(id)) {
    this.newDepIds.add(id);
    this.newDeps.push(dep);
    if (!this.depIds.has(id)) {
      dep.addSub(this);
    }
  }
};

/**
 * Clean up for dependency collection.
 */
Watcher.prototype.cleanupDeps = function cleanupDeps () {
  var i = this.deps.length;
  while (i--) {
    var dep = this.deps[i];
    if (!this.newDepIds.has(dep.id)) {
      dep.removeSub(this);
    }
  }
  var tmp = this.depIds;
  this.depIds = this.newDepIds;
  this.newDepIds = tmp;
  this.newDepIds.clear();
  tmp = this.deps;
  this.deps = this.newDeps;
  this.newDeps = tmp;
  this.newDeps.length = 0;
};

/**
 * Subscriber interface.
 * Will be called when a dependency changes.
 */
Watcher.prototype.update = function update () {
  /* istanbul ignore else */
  if (this.lazy) {
    this.dirty = true;
  } else if (this.sync) {
    this.run();
  } else {
    queueWatcher(this);
  }
};

/**
 * Scheduler job interface.
 * Will be called by the scheduler.
 */
Watcher.prototype.run = function run () {
  if (this.active) {
    var value = this.get();
    if (
      value !== this.value ||
      // Deep watchers and watchers on Object/Arrays should fire even
      // when the value is the same, because the value may
      // have mutated.
      isObject(value) ||
      this.deep
    ) {
      // set new value
      var oldValue = this.value;
      this.value = value;
      if (this.user) {
        try {
          this.cb.call(this.vm, value, oldValue);
        } catch (e) {
          handleError(e, this.vm, ("callback for watcher \"" + (this.expression) + "\""));
        }
      } else {
        this.cb.call(this.vm, value, oldValue);
      }
    }
  }
};

/**
 * Evaluate the value of the watcher.
 * This only gets called for lazy watchers.
 */
Watcher.prototype.evaluate = function evaluate () {
  this.value = this.get();
  this.dirty = false;
};

/**
 * Depend on all deps collected by this watcher.
 */
Watcher.prototype.depend = function depend () {
  var i = this.deps.length;
  while (i--) {
    this.deps[i].depend();
  }
};

/**
 * Remove self from all dependencies' subscriber list.
 */
Watcher.prototype.teardown = function teardown () {
  if (this.active) {
    // remove self from vm's watcher list
    // this is a somewhat expensive operation so we skip it
    // if the vm is being destroyed.
    if (!this.vm._isBeingDestroyed) {
      remove(this.vm._watchers, this);
    }
    var i = this.deps.length;
    while (i--) {
      this.deps[i].removeSub(this);
    }
    this.active = false;
  }
};

/*  */

var sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
};

function proxy (target, sourceKey, key) {
  sharedPropertyDefinition.get = function proxyGetter () {
    return this[sourceKey][key]
  };
  sharedPropertyDefinition.set = function proxySetter (val) {
    this[sourceKey][key] = val;
  };
  Object.defineProperty(target, key, sharedPropertyDefinition);
}

function initState (vm) {
  vm._watchers = [];
  var opts = vm.$options;
  if (opts.props) { initProps(vm, opts.props); }
  if (opts.methods) { initMethods(vm, opts.methods); }
  if (opts.data) {
    initData(vm);
  } else {
    observe(vm._data = {}, true /* asRootData */);
  }
  if (opts.computed) { initComputed(vm, opts.computed); }
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch);
  }
}

function initProps (vm, propsOptions) {
  var propsData = vm.$options.propsData || {};
  var props = vm._props = {};
  // cache prop keys so that future props updates can iterate using Array
  // instead of dynamic object key enumeration.
  var keys = vm.$options._propKeys = [];
  var isRoot = !vm.$parent;
  // root instance props should be converted
  if (!isRoot) {
    toggleObserving(false);
  }
  var loop = function ( key ) {
    keys.push(key);
    var value = validateProp(key, propsOptions, propsData, vm);
    /* istanbul ignore else */
    if (false) { var hyphenatedKey; } else {
      defineReactive$$1(props, key, value);
    }
    // static props are already proxied on the component's prototype
    // during Vue.extend(). We only need to proxy props defined at
    // instantiation here.
    if (!(key in vm)) {
      proxy(vm, "_props", key);
    }
  };

  for (var key in propsOptions) loop( key );
  toggleObserving(true);
}

function initData (vm) {
  var data = vm.$options.data;
  data = vm._data = typeof data === 'function'
    ? getData(data, vm)
    : data || {};
  if (!isPlainObject(data)) {
    data = {};
     false && 0;
  }
  // proxy data on instance
  var keys = Object.keys(data);
  var props = vm.$options.props;
  var methods = vm.$options.methods;
  var i = keys.length;
  while (i--) {
    var key = keys[i];
    if (false) {}
    if (props && hasOwn(props, key)) {
       false && 0;
    } else if (!isReserved(key)) {
      proxy(vm, "_data", key);
    }
  }
  // observe data
  observe(data, true /* asRootData */);
}

function getData (data, vm) {
  // #7573 disable dep collection when invoking data getters
  pushTarget();
  try {
    return data.call(vm, vm)
  } catch (e) {
    handleError(e, vm, "data()");
    return {}
  } finally {
    popTarget();
  }
}

var computedWatcherOptions = { lazy: true };

function initComputed (vm, computed) {
  // $flow-disable-line
  var watchers = vm._computedWatchers = Object.create(null);
  // computed properties are just getters during SSR
  var isSSR = isServerRendering();

  for (var key in computed) {
    var userDef = computed[key];
    var getter = typeof userDef === 'function' ? userDef : userDef.get;
    if (false) {}

    if (!isSSR) {
      // create internal watcher for the computed property.
      watchers[key] = new Watcher(
        vm,
        getter || noop,
        noop,
        computedWatcherOptions
      );
    }

    // component-defined computed properties are already defined on the
    // component prototype. We only need to define computed properties defined
    // at instantiation here.
    if (!(key in vm)) {
      defineComputed(vm, key, userDef);
    } else if (false) {}
  }
}

function defineComputed (
  target,
  key,
  userDef
) {
  var shouldCache = !isServerRendering();
  if (typeof userDef === 'function') {
    sharedPropertyDefinition.get = shouldCache
      ? createComputedGetter(key)
      : createGetterInvoker(userDef);
    sharedPropertyDefinition.set = noop;
  } else {
    sharedPropertyDefinition.get = userDef.get
      ? shouldCache && userDef.cache !== false
        ? createComputedGetter(key)
        : createGetterInvoker(userDef.get)
      : noop;
    sharedPropertyDefinition.set = userDef.set || noop;
  }
  if (false) {}
  Object.defineProperty(target, key, sharedPropertyDefinition);
}

function createComputedGetter (key) {
  return function computedGetter () {
    var watcher = this._computedWatchers && this._computedWatchers[key];
    if (watcher) {
      if (watcher.dirty) {
        watcher.evaluate();
      }
      if (Dep.target) {
        watcher.depend();
      }
      return watcher.value
    }
  }
}

function createGetterInvoker(fn) {
  return function computedGetter () {
    return fn.call(this, this)
  }
}

function initMethods (vm, methods) {
  var props = vm.$options.props;
  for (var key in methods) {
    if (false) {}
    vm[key] = typeof methods[key] !== 'function' ? noop : bind(methods[key], vm);
  }
}

function initWatch (vm, watch) {
  for (var key in watch) {
    var handler = watch[key];
    if (Array.isArray(handler)) {
      for (var i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i]);
      }
    } else {
      createWatcher(vm, key, handler);
    }
  }
}

function createWatcher (
  vm,
  expOrFn,
  handler,
  options
) {
  if (isPlainObject(handler)) {
    options = handler;
    handler = handler.handler;
  }
  if (typeof handler === 'string') {
    handler = vm[handler];
  }
  return vm.$watch(expOrFn, handler, options)
}

function stateMixin (Vue) {
  // flow somehow has problems with directly declared definition object
  // when using Object.defineProperty, so we have to procedurally build up
  // the object here.
  var dataDef = {};
  dataDef.get = function () { return this._data };
  var propsDef = {};
  propsDef.get = function () { return this._props };
  if (false) {}
  Object.defineProperty(Vue.prototype, '$data', dataDef);
  Object.defineProperty(Vue.prototype, '$props', propsDef);

  Vue.prototype.$set = set;
  Vue.prototype.$delete = del;

  Vue.prototype.$watch = function (
    expOrFn,
    cb,
    options
  ) {
    var vm = this;
    if (isPlainObject(cb)) {
      return createWatcher(vm, expOrFn, cb, options)
    }
    options = options || {};
    options.user = true;
    var watcher = new Watcher(vm, expOrFn, cb, options);
    if (options.immediate) {
      try {
        cb.call(vm, watcher.value);
      } catch (error) {
        handleError(error, vm, ("callback for immediate watcher \"" + (watcher.expression) + "\""));
      }
    }
    return function unwatchFn () {
      watcher.teardown();
    }
  };
}

/*  */

var uid$3 = 0;

function initMixin (Vue) {
  Vue.prototype._init = function (options) {
    var vm = this;
    // a uid
    vm._uid = uid$3++;

    var startTag, endTag;
    /* istanbul ignore if */
    if (false) {}

    // a flag to avoid this being observed
    vm._isVue = true;
    // merge options
    if (options && options._isComponent) {
      // optimize internal component instantiation
      // since dynamic options merging is pretty slow, and none of the
      // internal component options needs special treatment.
      initInternalComponent(vm, options);
    } else {
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor),
        options || {},
        vm
      );
    }
    /* istanbul ignore else */
    if (false) {} else {
      vm._renderProxy = vm;
    }
    // expose real self
    vm._self = vm;
    initLifecycle(vm);
    initEvents(vm);
    initRender(vm);
    callHook(vm, 'beforeCreate');
    initInjections(vm); // resolve injections before data/props
    initState(vm);
    initProvide(vm); // resolve provide after data/props
    callHook(vm, 'created');

    /* istanbul ignore if */
    if (false) {}

    if (vm.$options.el) {
      vm.$mount(vm.$options.el);
    }
  };
}

function initInternalComponent (vm, options) {
  var opts = vm.$options = Object.create(vm.constructor.options);
  // doing this because it's faster than dynamic enumeration.
  var parentVnode = options._parentVnode;
  opts.parent = options.parent;
  opts._parentVnode = parentVnode;

  var vnodeComponentOptions = parentVnode.componentOptions;
  opts.propsData = vnodeComponentOptions.propsData;
  opts._parentListeners = vnodeComponentOptions.listeners;
  opts._renderChildren = vnodeComponentOptions.children;
  opts._componentTag = vnodeComponentOptions.tag;

  if (options.render) {
    opts.render = options.render;
    opts.staticRenderFns = options.staticRenderFns;
  }
}

function resolveConstructorOptions (Ctor) {
  var options = Ctor.options;
  if (Ctor.super) {
    var superOptions = resolveConstructorOptions(Ctor.super);
    var cachedSuperOptions = Ctor.superOptions;
    if (superOptions !== cachedSuperOptions) {
      // super option changed,
      // need to resolve new options.
      Ctor.superOptions = superOptions;
      // check if there are any late-modified/attached options (#4976)
      var modifiedOptions = resolveModifiedOptions(Ctor);
      // update base extend options
      if (modifiedOptions) {
        extend(Ctor.extendOptions, modifiedOptions);
      }
      options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions);
      if (options.name) {
        options.components[options.name] = Ctor;
      }
    }
  }
  return options
}

function resolveModifiedOptions (Ctor) {
  var modified;
  var latest = Ctor.options;
  var sealed = Ctor.sealedOptions;
  for (var key in latest) {
    if (latest[key] !== sealed[key]) {
      if (!modified) { modified = {}; }
      modified[key] = latest[key];
    }
  }
  return modified
}

function Vue (options) {
  if (false
  ) {}
  this._init(options);
}

initMixin(Vue);
stateMixin(Vue);
eventsMixin(Vue);
lifecycleMixin(Vue);
renderMixin(Vue);

/*  */

function initUse (Vue) {
  Vue.use = function (plugin) {
    var installedPlugins = (this._installedPlugins || (this._installedPlugins = []));
    if (installedPlugins.indexOf(plugin) > -1) {
      return this
    }

    // additional parameters
    var args = toArray(arguments, 1);
    args.unshift(this);
    if (typeof plugin.install === 'function') {
      plugin.install.apply(plugin, args);
    } else if (typeof plugin === 'function') {
      plugin.apply(null, args);
    }
    installedPlugins.push(plugin);
    return this
  };
}

/*  */

function initMixin$1 (Vue) {
  Vue.mixin = function (mixin) {
    this.options = mergeOptions(this.options, mixin);
    return this
  };
}

/*  */

function initExtend (Vue) {
  /**
   * Each instance constructor, including Vue, has a unique
   * cid. This enables us to create wrapped "child
   * constructors" for prototypal inheritance and cache them.
   */
  Vue.cid = 0;
  var cid = 1;

  /**
   * Class inheritance
   */
  Vue.extend = function (extendOptions) {
    extendOptions = extendOptions || {};
    var Super = this;
    var SuperId = Super.cid;
    var cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {});
    if (cachedCtors[SuperId]) {
      return cachedCtors[SuperId]
    }

    var name = extendOptions.name || Super.options.name;
    if (false) {}

    var Sub = function VueComponent (options) {
      this._init(options);
    };
    Sub.prototype = Object.create(Super.prototype);
    Sub.prototype.constructor = Sub;
    Sub.cid = cid++;
    Sub.options = mergeOptions(
      Super.options,
      extendOptions
    );
    Sub['super'] = Super;

    // For props and computed properties, we define the proxy getters on
    // the Vue instances at extension time, on the extended prototype. This
    // avoids Object.defineProperty calls for each instance created.
    if (Sub.options.props) {
      initProps$1(Sub);
    }
    if (Sub.options.computed) {
      initComputed$1(Sub);
    }

    // allow further extension/mixin/plugin usage
    Sub.extend = Super.extend;
    Sub.mixin = Super.mixin;
    Sub.use = Super.use;

    // create asset registers, so extended classes
    // can have their private assets too.
    ASSET_TYPES.forEach(function (type) {
      Sub[type] = Super[type];
    });
    // enable recursive self-lookup
    if (name) {
      Sub.options.components[name] = Sub;
    }

    // keep a reference to the super options at extension time.
    // later at instantiation we can check if Super's options have
    // been updated.
    Sub.superOptions = Super.options;
    Sub.extendOptions = extendOptions;
    Sub.sealedOptions = extend({}, Sub.options);

    // cache constructor
    cachedCtors[SuperId] = Sub;
    return Sub
  };
}

function initProps$1 (Comp) {
  var props = Comp.options.props;
  for (var key in props) {
    proxy(Comp.prototype, "_props", key);
  }
}

function initComputed$1 (Comp) {
  var computed = Comp.options.computed;
  for (var key in computed) {
    defineComputed(Comp.prototype, key, computed[key]);
  }
}

/*  */

function initAssetRegisters (Vue) {
  /**
   * Create asset registration methods.
   */
  ASSET_TYPES.forEach(function (type) {
    Vue[type] = function (
      id,
      definition
    ) {
      if (!definition) {
        return this.options[type + 's'][id]
      } else {
        /* istanbul ignore if */
        if (false) {}
        if (type === 'component' && isPlainObject(definition)) {
          definition.name = definition.name || id;
          definition = this.options._base.extend(definition);
        }
        if (type === 'directive' && typeof definition === 'function') {
          definition = { bind: definition, update: definition };
        }
        this.options[type + 's'][id] = definition;
        return definition
      }
    };
  });
}

/*  */



function getComponentName (opts) {
  return opts && (opts.Ctor.options.name || opts.tag)
}

function matches (pattern, name) {
  if (Array.isArray(pattern)) {
    return pattern.indexOf(name) > -1
  } else if (typeof pattern === 'string') {
    return pattern.split(',').indexOf(name) > -1
  } else if (isRegExp(pattern)) {
    return pattern.test(name)
  }
  /* istanbul ignore next */
  return false
}

function pruneCache (keepAliveInstance, filter) {
  var cache = keepAliveInstance.cache;
  var keys = keepAliveInstance.keys;
  var _vnode = keepAliveInstance._vnode;
  for (var key in cache) {
    var cachedNode = cache[key];
    if (cachedNode) {
      var name = getComponentName(cachedNode.componentOptions);
      if (name && !filter(name)) {
        pruneCacheEntry(cache, key, keys, _vnode);
      }
    }
  }
}

function pruneCacheEntry (
  cache,
  key,
  keys,
  current
) {
  var cached$$1 = cache[key];
  if (cached$$1 && (!current || cached$$1.tag !== current.tag)) {
    cached$$1.componentInstance.$destroy();
  }
  cache[key] = null;
  remove(keys, key);
}

var patternTypes = [String, RegExp, Array];

var KeepAlive = {
  name: 'keep-alive',
  abstract: true,

  props: {
    include: patternTypes,
    exclude: patternTypes,
    max: [String, Number]
  },

  created: function created () {
    this.cache = Object.create(null);
    this.keys = [];
  },

  destroyed: function destroyed () {
    for (var key in this.cache) {
      pruneCacheEntry(this.cache, key, this.keys);
    }
  },

  mounted: function mounted () {
    var this$1 = this;

    this.$watch('include', function (val) {
      pruneCache(this$1, function (name) { return matches(val, name); });
    });
    this.$watch('exclude', function (val) {
      pruneCache(this$1, function (name) { return !matches(val, name); });
    });
  },

  render: function render () {
    var slot = this.$slots.default;
    var vnode = getFirstComponentChild(slot);
    var componentOptions = vnode && vnode.componentOptions;
    if (componentOptions) {
      // check pattern
      var name = getComponentName(componentOptions);
      var ref = this;
      var include = ref.include;
      var exclude = ref.exclude;
      if (
        // not included
        (include && (!name || !matches(include, name))) ||
        // excluded
        (exclude && name && matches(exclude, name))
      ) {
        return vnode
      }

      var ref$1 = this;
      var cache = ref$1.cache;
      var keys = ref$1.keys;
      var key = vnode.key == null
        // same constructor may get registered as different local components
        // so cid alone is not enough (#3269)
        ? componentOptions.Ctor.cid + (componentOptions.tag ? ("::" + (componentOptions.tag)) : '')
        : vnode.key;
      if (cache[key]) {
        vnode.componentInstance = cache[key].componentInstance;
        // make current key freshest
        remove(keys, key);
        keys.push(key);
      } else {
        cache[key] = vnode;
        keys.push(key);
        // prune oldest entry
        if (this.max && keys.length > parseInt(this.max)) {
          pruneCacheEntry(cache, keys[0], keys, this._vnode);
        }
      }

      vnode.data.keepAlive = true;
    }
    return vnode || (slot && slot[0])
  }
};

var builtInComponents = {
  KeepAlive: KeepAlive
};

/*  */

function initGlobalAPI (Vue) {
  // config
  var configDef = {};
  configDef.get = function () { return config; };
  if (false) {}
  Object.defineProperty(Vue, 'config', configDef);

  // exposed util methods.
  // NOTE: these are not considered part of the public API - avoid relying on
  // them unless you are aware of the risk.
  Vue.util = {
    warn: warn,
    extend: extend,
    mergeOptions: mergeOptions,
    defineReactive: defineReactive$$1
  };

  Vue.set = set;
  Vue.delete = del;
  Vue.nextTick = nextTick;

  // 2.6 explicit observable API
  Vue.observable = function (obj) {
    observe(obj);
    return obj
  };

  Vue.options = Object.create(null);
  ASSET_TYPES.forEach(function (type) {
    Vue.options[type + 's'] = Object.create(null);
  });

  // this is used to identify the "base" constructor to extend all plain-object
  // components with in Weex's multi-instance scenarios.
  Vue.options._base = Vue;

  extend(Vue.options.components, builtInComponents);

  initUse(Vue);
  initMixin$1(Vue);
  initExtend(Vue);
  initAssetRegisters(Vue);
}

initGlobalAPI(Vue);

Object.defineProperty(Vue.prototype, '$isServer', {
  get: isServerRendering
});

Object.defineProperty(Vue.prototype, '$ssrContext', {
  get: function get () {
    /* istanbul ignore next */
    return this.$vnode && this.$vnode.ssrContext
  }
});

// expose FunctionalRenderContext for ssr runtime helper installation
Object.defineProperty(Vue, 'FunctionalRenderContext', {
  value: FunctionalRenderContext
});

Vue.version = '2.6.11';

/*  */

// these are reserved for web because they are directly compiled away
// during template compilation
var isReservedAttr = makeMap('style,class');

// attributes that should be using props for binding
var acceptValue = makeMap('input,textarea,option,select,progress');
var mustUseProp = function (tag, type, attr) {
  return (
    (attr === 'value' && acceptValue(tag)) && type !== 'button' ||
    (attr === 'selected' && tag === 'option') ||
    (attr === 'checked' && tag === 'input') ||
    (attr === 'muted' && tag === 'video')
  )
};

var isEnumeratedAttr = makeMap('contenteditable,draggable,spellcheck');

var isValidContentEditableValue = makeMap('events,caret,typing,plaintext-only');

var convertEnumeratedValue = function (key, value) {
  return isFalsyAttrValue(value) || value === 'false'
    ? 'false'
    // allow arbitrary string value for contenteditable
    : key === 'contenteditable' && isValidContentEditableValue(value)
      ? value
      : 'true'
};

var isBooleanAttr = makeMap(
  'allowfullscreen,async,autofocus,autoplay,checked,compact,controls,declare,' +
  'default,defaultchecked,defaultmuted,defaultselected,defer,disabled,' +
  'enabled,formnovalidate,hidden,indeterminate,inert,ismap,itemscope,loop,multiple,' +
  'muted,nohref,noresize,noshade,novalidate,nowrap,open,pauseonexit,readonly,' +
  'required,reversed,scoped,seamless,selected,sortable,translate,' +
  'truespeed,typemustmatch,visible'
);

var xlinkNS = 'http://www.w3.org/1999/xlink';

var isXlink = function (name) {
  return name.charAt(5) === ':' && name.slice(0, 5) === 'xlink'
};

var getXlinkProp = function (name) {
  return isXlink(name) ? name.slice(6, name.length) : ''
};

var isFalsyAttrValue = function (val) {
  return val == null || val === false
};

/*  */

function genClassForVnode (vnode) {
  var data = vnode.data;
  var parentNode = vnode;
  var childNode = vnode;
  while (isDef(childNode.componentInstance)) {
    childNode = childNode.componentInstance._vnode;
    if (childNode && childNode.data) {
      data = mergeClassData(childNode.data, data);
    }
  }
  while (isDef(parentNode = parentNode.parent)) {
    if (parentNode && parentNode.data) {
      data = mergeClassData(data, parentNode.data);
    }
  }
  return renderClass(data.staticClass, data.class)
}

function mergeClassData (child, parent) {
  return {
    staticClass: concat(child.staticClass, parent.staticClass),
    class: isDef(child.class)
      ? [child.class, parent.class]
      : parent.class
  }
}

function renderClass (
  staticClass,
  dynamicClass
) {
  if (isDef(staticClass) || isDef(dynamicClass)) {
    return concat(staticClass, stringifyClass(dynamicClass))
  }
  /* istanbul ignore next */
  return ''
}

function concat (a, b) {
  return a ? b ? (a + ' ' + b) : a : (b || '')
}

function stringifyClass (value) {
  if (Array.isArray(value)) {
    return stringifyArray(value)
  }
  if (isObject(value)) {
    return stringifyObject(value)
  }
  if (typeof value === 'string') {
    return value
  }
  /* istanbul ignore next */
  return ''
}

function stringifyArray (value) {
  var res = '';
  var stringified;
  for (var i = 0, l = value.length; i < l; i++) {
    if (isDef(stringified = stringifyClass(value[i])) && stringified !== '') {
      if (res) { res += ' '; }
      res += stringified;
    }
  }
  return res
}

function stringifyObject (value) {
  var res = '';
  for (var key in value) {
    if (value[key]) {
      if (res) { res += ' '; }
      res += key;
    }
  }
  return res
}

/*  */

var namespaceMap = {
  svg: 'http://www.w3.org/2000/svg',
  math: 'http://www.w3.org/1998/Math/MathML'
};

var isHTMLTag = makeMap(
  'html,body,base,head,link,meta,style,title,' +
  'address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,' +
  'div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,' +
  'a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,' +
  's,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,' +
  'embed,object,param,source,canvas,script,noscript,del,ins,' +
  'caption,col,colgroup,table,thead,tbody,td,th,tr,' +
  'button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,' +
  'output,progress,select,textarea,' +
  'details,dialog,menu,menuitem,summary,' +
  'content,element,shadow,template,blockquote,iframe,tfoot'
);

// this map is intentionally selective, only covering SVG elements that may
// contain child elements.
var isSVG = makeMap(
  'svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,font-face,' +
  'foreignObject,g,glyph,image,line,marker,mask,missing-glyph,path,pattern,' +
  'polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view',
  true
);

var isReservedTag = function (tag) {
  return isHTMLTag(tag) || isSVG(tag)
};

function getTagNamespace (tag) {
  if (isSVG(tag)) {
    return 'svg'
  }
  // basic support for MathML
  // note it doesn't support other MathML elements being component roots
  if (tag === 'math') {
    return 'math'
  }
}

var unknownElementCache = Object.create(null);
function isUnknownElement (tag) {
  /* istanbul ignore if */
  if (!inBrowser) {
    return true
  }
  if (isReservedTag(tag)) {
    return false
  }
  tag = tag.toLowerCase();
  /* istanbul ignore if */
  if (unknownElementCache[tag] != null) {
    return unknownElementCache[tag]
  }
  var el = document.createElement(tag);
  if (tag.indexOf('-') > -1) {
    // http://stackoverflow.com/a/28210364/1070244
    return (unknownElementCache[tag] = (
      el.constructor === window.HTMLUnknownElement ||
      el.constructor === window.HTMLElement
    ))
  } else {
    return (unknownElementCache[tag] = /HTMLUnknownElement/.test(el.toString()))
  }
}

var isTextInputType = makeMap('text,number,password,search,email,tel,url');

/*  */

/**
 * Query an element selector if it's not an element already.
 */
function query (el) {
  if (typeof el === 'string') {
    var selected = document.querySelector(el);
    if (!selected) {
       false && 0;
      return document.createElement('div')
    }
    return selected
  } else {
    return el
  }
}

/*  */

function createElement$1 (tagName, vnode) {
  var elm = document.createElement(tagName);
  if (tagName !== 'select') {
    return elm
  }
  // false or null will remove the attribute but undefined will not
  if (vnode.data && vnode.data.attrs && vnode.data.attrs.multiple !== undefined) {
    elm.setAttribute('multiple', 'multiple');
  }
  return elm
}

function createElementNS (namespace, tagName) {
  return document.createElementNS(namespaceMap[namespace], tagName)
}

function createTextNode (text) {
  return document.createTextNode(text)
}

function createComment (text) {
  return document.createComment(text)
}

function insertBefore (parentNode, newNode, referenceNode) {
  parentNode.insertBefore(newNode, referenceNode);
}

function removeChild (node, child) {
  node.removeChild(child);
}

function appendChild (node, child) {
  node.appendChild(child);
}

function parentNode (node) {
  return node.parentNode
}

function nextSibling (node) {
  return node.nextSibling
}

function tagName (node) {
  return node.tagName
}

function setTextContent (node, text) {
  node.textContent = text;
}

function setStyleScope (node, scopeId) {
  node.setAttribute(scopeId, '');
}

var nodeOps = /*#__PURE__*/Object.freeze({
  createElement: createElement$1,
  createElementNS: createElementNS,
  createTextNode: createTextNode,
  createComment: createComment,
  insertBefore: insertBefore,
  removeChild: removeChild,
  appendChild: appendChild,
  parentNode: parentNode,
  nextSibling: nextSibling,
  tagName: tagName,
  setTextContent: setTextContent,
  setStyleScope: setStyleScope
});

/*  */

var ref = {
  create: function create (_, vnode) {
    registerRef(vnode);
  },
  update: function update (oldVnode, vnode) {
    if (oldVnode.data.ref !== vnode.data.ref) {
      registerRef(oldVnode, true);
      registerRef(vnode);
    }
  },
  destroy: function destroy (vnode) {
    registerRef(vnode, true);
  }
};

function registerRef (vnode, isRemoval) {
  var key = vnode.data.ref;
  if (!isDef(key)) { return }

  var vm = vnode.context;
  var ref = vnode.componentInstance || vnode.elm;
  var refs = vm.$refs;
  if (isRemoval) {
    if (Array.isArray(refs[key])) {
      remove(refs[key], ref);
    } else if (refs[key] === ref) {
      refs[key] = undefined;
    }
  } else {
    if (vnode.data.refInFor) {
      if (!Array.isArray(refs[key])) {
        refs[key] = [ref];
      } else if (refs[key].indexOf(ref) < 0) {
        // $flow-disable-line
        refs[key].push(ref);
      }
    } else {
      refs[key] = ref;
    }
  }
}

/**
 * Virtual DOM patching algorithm based on Snabbdom by
 * Simon Friis Vindum (@paldepind)
 * Licensed under the MIT License
 * https://github.com/paldepind/snabbdom/blob/master/LICENSE
 *
 * modified by Evan You (@yyx990803)
 *
 * Not type-checking this because this file is perf-critical and the cost
 * of making flow understand it is not worth it.
 */

var emptyNode = new VNode('', {}, []);

var hooks = ['create', 'activate', 'update', 'remove', 'destroy'];

function sameVnode (a, b) {
  return (
    a.key === b.key && (
      (
        a.tag === b.tag &&
        a.isComment === b.isComment &&
        isDef(a.data) === isDef(b.data) &&
        sameInputType(a, b)
      ) || (
        isTrue(a.isAsyncPlaceholder) &&
        a.asyncFactory === b.asyncFactory &&
        isUndef(b.asyncFactory.error)
      )
    )
  )
}

function sameInputType (a, b) {
  if (a.tag !== 'input') { return true }
  var i;
  var typeA = isDef(i = a.data) && isDef(i = i.attrs) && i.type;
  var typeB = isDef(i = b.data) && isDef(i = i.attrs) && i.type;
  return typeA === typeB || isTextInputType(typeA) && isTextInputType(typeB)
}

function createKeyToOldIdx (children, beginIdx, endIdx) {
  var i, key;
  var map = {};
  for (i = beginIdx; i <= endIdx; ++i) {
    key = children[i].key;
    if (isDef(key)) { map[key] = i; }
  }
  return map
}

function createPatchFunction (backend) {
  var i, j;
  var cbs = {};

  var modules = backend.modules;
  var nodeOps = backend.nodeOps;

  for (i = 0; i < hooks.length; ++i) {
    cbs[hooks[i]] = [];
    for (j = 0; j < modules.length; ++j) {
      if (isDef(modules[j][hooks[i]])) {
        cbs[hooks[i]].push(modules[j][hooks[i]]);
      }
    }
  }

  function emptyNodeAt (elm) {
    return new VNode(nodeOps.tagName(elm).toLowerCase(), {}, [], undefined, elm)
  }

  function createRmCb (childElm, listeners) {
    function remove$$1 () {
      if (--remove$$1.listeners === 0) {
        removeNode(childElm);
      }
    }
    remove$$1.listeners = listeners;
    return remove$$1
  }

  function removeNode (el) {
    var parent = nodeOps.parentNode(el);
    // element may have already been removed due to v-html / v-text
    if (isDef(parent)) {
      nodeOps.removeChild(parent, el);
    }
  }

  function isUnknownElement$$1 (vnode, inVPre) {
    return (
      !inVPre &&
      !vnode.ns &&
      !(
        config.ignoredElements.length &&
        config.ignoredElements.some(function (ignore) {
          return isRegExp(ignore)
            ? ignore.test(vnode.tag)
            : ignore === vnode.tag
        })
      ) &&
      config.isUnknownElement(vnode.tag)
    )
  }

  var creatingElmInVPre = 0;

  function createElm (
    vnode,
    insertedVnodeQueue,
    parentElm,
    refElm,
    nested,
    ownerArray,
    index
  ) {
    if (isDef(vnode.elm) && isDef(ownerArray)) {
      // This vnode was used in a previous render!
      // now it's used as a new node, overwriting its elm would cause
      // potential patch errors down the road when it's used as an insertion
      // reference node. Instead, we clone the node on-demand before creating
      // associated DOM element for it.
      vnode = ownerArray[index] = cloneVNode(vnode);
    }

    vnode.isRootInsert = !nested; // for transition enter check
    if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
      return
    }

    var data = vnode.data;
    var children = vnode.children;
    var tag = vnode.tag;
    if (isDef(tag)) {
      if (false) {}

      vnode.elm = vnode.ns
        ? nodeOps.createElementNS(vnode.ns, tag)
        : nodeOps.createElement(tag, vnode);
      setScope(vnode);

      /* istanbul ignore if */
      {
        createChildren(vnode, children, insertedVnodeQueue);
        if (isDef(data)) {
          invokeCreateHooks(vnode, insertedVnodeQueue);
        }
        insert(parentElm, vnode.elm, refElm);
      }

      if (false) {}
    } else if (isTrue(vnode.isComment)) {
      vnode.elm = nodeOps.createComment(vnode.text);
      insert(parentElm, vnode.elm, refElm);
    } else {
      vnode.elm = nodeOps.createTextNode(vnode.text);
      insert(parentElm, vnode.elm, refElm);
    }
  }

  function createComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
    var i = vnode.data;
    if (isDef(i)) {
      var isReactivated = isDef(vnode.componentInstance) && i.keepAlive;
      if (isDef(i = i.hook) && isDef(i = i.init)) {
        i(vnode, false /* hydrating */);
      }
      // after calling the init hook, if the vnode is a child component
      // it should've created a child instance and mounted it. the child
      // component also has set the placeholder vnode's elm.
      // in that case we can just return the element and be done.
      if (isDef(vnode.componentInstance)) {
        initComponent(vnode, insertedVnodeQueue);
        insert(parentElm, vnode.elm, refElm);
        if (isTrue(isReactivated)) {
          reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm);
        }
        return true
      }
    }
  }

  function initComponent (vnode, insertedVnodeQueue) {
    if (isDef(vnode.data.pendingInsert)) {
      insertedVnodeQueue.push.apply(insertedVnodeQueue, vnode.data.pendingInsert);
      vnode.data.pendingInsert = null;
    }
    vnode.elm = vnode.componentInstance.$el;
    if (isPatchable(vnode)) {
      invokeCreateHooks(vnode, insertedVnodeQueue);
      setScope(vnode);
    } else {
      // empty component root.
      // skip all element-related modules except for ref (#3455)
      registerRef(vnode);
      // make sure to invoke the insert hook
      insertedVnodeQueue.push(vnode);
    }
  }

  function reactivateComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
    var i;
    // hack for #4339: a reactivated component with inner transition
    // does not trigger because the inner node's created hooks are not called
    // again. It's not ideal to involve module-specific logic in here but
    // there doesn't seem to be a better way to do it.
    var innerNode = vnode;
    while (innerNode.componentInstance) {
      innerNode = innerNode.componentInstance._vnode;
      if (isDef(i = innerNode.data) && isDef(i = i.transition)) {
        for (i = 0; i < cbs.activate.length; ++i) {
          cbs.activate[i](emptyNode, innerNode);
        }
        insertedVnodeQueue.push(innerNode);
        break
      }
    }
    // unlike a newly created component,
    // a reactivated keep-alive component doesn't insert itself
    insert(parentElm, vnode.elm, refElm);
  }

  function insert (parent, elm, ref$$1) {
    if (isDef(parent)) {
      if (isDef(ref$$1)) {
        if (nodeOps.parentNode(ref$$1) === parent) {
          nodeOps.insertBefore(parent, elm, ref$$1);
        }
      } else {
        nodeOps.appendChild(parent, elm);
      }
    }
  }

  function createChildren (vnode, children, insertedVnodeQueue) {
    if (Array.isArray(children)) {
      if (false) {}
      for (var i = 0; i < children.length; ++i) {
        createElm(children[i], insertedVnodeQueue, vnode.elm, null, true, children, i);
      }
    } else if (isPrimitive(vnode.text)) {
      nodeOps.appendChild(vnode.elm, nodeOps.createTextNode(String(vnode.text)));
    }
  }

  function isPatchable (vnode) {
    while (vnode.componentInstance) {
      vnode = vnode.componentInstance._vnode;
    }
    return isDef(vnode.tag)
  }

  function invokeCreateHooks (vnode, insertedVnodeQueue) {
    for (var i$1 = 0; i$1 < cbs.create.length; ++i$1) {
      cbs.create[i$1](emptyNode, vnode);
    }
    i = vnode.data.hook; // Reuse variable
    if (isDef(i)) {
      if (isDef(i.create)) { i.create(emptyNode, vnode); }
      if (isDef(i.insert)) { insertedVnodeQueue.push(vnode); }
    }
  }

  // set scope id attribute for scoped CSS.
  // this is implemented as a special case to avoid the overhead
  // of going through the normal attribute patching process.
  function setScope (vnode) {
    var i;
    if (isDef(i = vnode.fnScopeId)) {
      nodeOps.setStyleScope(vnode.elm, i);
    } else {
      var ancestor = vnode;
      while (ancestor) {
        if (isDef(i = ancestor.context) && isDef(i = i.$options._scopeId)) {
          nodeOps.setStyleScope(vnode.elm, i);
        }
        ancestor = ancestor.parent;
      }
    }
    // for slot content they should also get the scopeId from the host instance.
    if (isDef(i = activeInstance) &&
      i !== vnode.context &&
      i !== vnode.fnContext &&
      isDef(i = i.$options._scopeId)
    ) {
      nodeOps.setStyleScope(vnode.elm, i);
    }
  }

  function addVnodes (parentElm, refElm, vnodes, startIdx, endIdx, insertedVnodeQueue) {
    for (; startIdx <= endIdx; ++startIdx) {
      createElm(vnodes[startIdx], insertedVnodeQueue, parentElm, refElm, false, vnodes, startIdx);
    }
  }

  function invokeDestroyHook (vnode) {
    var i, j;
    var data = vnode.data;
    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.destroy)) { i(vnode); }
      for (i = 0; i < cbs.destroy.length; ++i) { cbs.destroy[i](vnode); }
    }
    if (isDef(i = vnode.children)) {
      for (j = 0; j < vnode.children.length; ++j) {
        invokeDestroyHook(vnode.children[j]);
      }
    }
  }

  function removeVnodes (vnodes, startIdx, endIdx) {
    for (; startIdx <= endIdx; ++startIdx) {
      var ch = vnodes[startIdx];
      if (isDef(ch)) {
        if (isDef(ch.tag)) {
          removeAndInvokeRemoveHook(ch);
          invokeDestroyHook(ch);
        } else { // Text node
          removeNode(ch.elm);
        }
      }
    }
  }

  function removeAndInvokeRemoveHook (vnode, rm) {
    if (isDef(rm) || isDef(vnode.data)) {
      var i;
      var listeners = cbs.remove.length + 1;
      if (isDef(rm)) {
        // we have a recursively passed down rm callback
        // increase the listeners count
        rm.listeners += listeners;
      } else {
        // directly removing
        rm = createRmCb(vnode.elm, listeners);
      }
      // recursively invoke hooks on child component root node
      if (isDef(i = vnode.componentInstance) && isDef(i = i._vnode) && isDef(i.data)) {
        removeAndInvokeRemoveHook(i, rm);
      }
      for (i = 0; i < cbs.remove.length; ++i) {
        cbs.remove[i](vnode, rm);
      }
      if (isDef(i = vnode.data.hook) && isDef(i = i.remove)) {
        i(vnode, rm);
      } else {
        rm();
      }
    } else {
      removeNode(vnode.elm);
    }
  }

  function updateChildren (parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
    var oldStartIdx = 0;
    var newStartIdx = 0;
    var oldEndIdx = oldCh.length - 1;
    var oldStartVnode = oldCh[0];
    var oldEndVnode = oldCh[oldEndIdx];
    var newEndIdx = newCh.length - 1;
    var newStartVnode = newCh[0];
    var newEndVnode = newCh[newEndIdx];
    var oldKeyToIdx, idxInOld, vnodeToMove, refElm;

    // removeOnly is a special flag used only by <transition-group>
    // to ensure removed elements stay in correct relative positions
    // during leaving transitions
    var canMove = !removeOnly;

    if (false) {}

    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      if (isUndef(oldStartVnode)) {
        oldStartVnode = oldCh[++oldStartIdx]; // Vnode has been moved left
      } else if (isUndef(oldEndVnode)) {
        oldEndVnode = oldCh[--oldEndIdx];
      } else if (sameVnode(oldStartVnode, newStartVnode)) {
        patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
        oldStartVnode = oldCh[++oldStartIdx];
        newStartVnode = newCh[++newStartIdx];
      } else if (sameVnode(oldEndVnode, newEndVnode)) {
        patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx);
        oldEndVnode = oldCh[--oldEndIdx];
        newEndVnode = newCh[--newEndIdx];
      } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
        patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx);
        canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm));
        oldStartVnode = oldCh[++oldStartIdx];
        newEndVnode = newCh[--newEndIdx];
      } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
        patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
        canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
        oldEndVnode = oldCh[--oldEndIdx];
        newStartVnode = newCh[++newStartIdx];
      } else {
        if (isUndef(oldKeyToIdx)) { oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx); }
        idxInOld = isDef(newStartVnode.key)
          ? oldKeyToIdx[newStartVnode.key]
          : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx);
        if (isUndef(idxInOld)) { // New element
          createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx);
        } else {
          vnodeToMove = oldCh[idxInOld];
          if (sameVnode(vnodeToMove, newStartVnode)) {
            patchVnode(vnodeToMove, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
            oldCh[idxInOld] = undefined;
            canMove && nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm);
          } else {
            // same key but different element. treat as new element
            createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx);
          }
        }
        newStartVnode = newCh[++newStartIdx];
      }
    }
    if (oldStartIdx > oldEndIdx) {
      refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm;
      addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
    } else if (newStartIdx > newEndIdx) {
      removeVnodes(oldCh, oldStartIdx, oldEndIdx);
    }
  }

  function checkDuplicateKeys (children) {
    var seenKeys = {};
    for (var i = 0; i < children.length; i++) {
      var vnode = children[i];
      var key = vnode.key;
      if (isDef(key)) {
        if (seenKeys[key]) {
          warn(
            ("Duplicate keys detected: '" + key + "'. This may cause an update error."),
            vnode.context
          );
        } else {
          seenKeys[key] = true;
        }
      }
    }
  }

  function findIdxInOld (node, oldCh, start, end) {
    for (var i = start; i < end; i++) {
      var c = oldCh[i];
      if (isDef(c) && sameVnode(node, c)) { return i }
    }
  }

  function patchVnode (
    oldVnode,
    vnode,
    insertedVnodeQueue,
    ownerArray,
    index,
    removeOnly
  ) {
    if (oldVnode === vnode) {
      return
    }

    if (isDef(vnode.elm) && isDef(ownerArray)) {
      // clone reused vnode
      vnode = ownerArray[index] = cloneVNode(vnode);
    }

    var elm = vnode.elm = oldVnode.elm;

    if (isTrue(oldVnode.isAsyncPlaceholder)) {
      if (isDef(vnode.asyncFactory.resolved)) {
        hydrate(oldVnode.elm, vnode, insertedVnodeQueue);
      } else {
        vnode.isAsyncPlaceholder = true;
      }
      return
    }

    // reuse element for static trees.
    // note we only do this if the vnode is cloned -
    // if the new node is not cloned it means the render functions have been
    // reset by the hot-reload-api and we need to do a proper re-render.
    if (isTrue(vnode.isStatic) &&
      isTrue(oldVnode.isStatic) &&
      vnode.key === oldVnode.key &&
      (isTrue(vnode.isCloned) || isTrue(vnode.isOnce))
    ) {
      vnode.componentInstance = oldVnode.componentInstance;
      return
    }

    var i;
    var data = vnode.data;
    if (isDef(data) && isDef(i = data.hook) && isDef(i = i.prepatch)) {
      i(oldVnode, vnode);
    }

    var oldCh = oldVnode.children;
    var ch = vnode.children;
    if (isDef(data) && isPatchable(vnode)) {
      for (i = 0; i < cbs.update.length; ++i) { cbs.update[i](oldVnode, vnode); }
      if (isDef(i = data.hook) && isDef(i = i.update)) { i(oldVnode, vnode); }
    }
    if (isUndef(vnode.text)) {
      if (isDef(oldCh) && isDef(ch)) {
        if (oldCh !== ch) { updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly); }
      } else if (isDef(ch)) {
        if (false) {}
        if (isDef(oldVnode.text)) { nodeOps.setTextContent(elm, ''); }
        addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
      } else if (isDef(oldCh)) {
        removeVnodes(oldCh, 0, oldCh.length - 1);
      } else if (isDef(oldVnode.text)) {
        nodeOps.setTextContent(elm, '');
      }
    } else if (oldVnode.text !== vnode.text) {
      nodeOps.setTextContent(elm, vnode.text);
    }
    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.postpatch)) { i(oldVnode, vnode); }
    }
  }

  function invokeInsertHook (vnode, queue, initial) {
    // delay insert hooks for component root nodes, invoke them after the
    // element is really inserted
    if (isTrue(initial) && isDef(vnode.parent)) {
      vnode.parent.data.pendingInsert = queue;
    } else {
      for (var i = 0; i < queue.length; ++i) {
        queue[i].data.hook.insert(queue[i]);
      }
    }
  }

  var hydrationBailed = false;
  // list of modules that can skip create hook during hydration because they
  // are already rendered on the client or has no need for initialization
  // Note: style is excluded because it relies on initial clone for future
  // deep updates (#7063).
  var isRenderedModule = makeMap('attrs,class,staticClass,staticStyle,key');

  // Note: this is a browser-only function so we can assume elms are DOM nodes.
  function hydrate (elm, vnode, insertedVnodeQueue, inVPre) {
    var i;
    var tag = vnode.tag;
    var data = vnode.data;
    var children = vnode.children;
    inVPre = inVPre || (data && data.pre);
    vnode.elm = elm;

    if (isTrue(vnode.isComment) && isDef(vnode.asyncFactory)) {
      vnode.isAsyncPlaceholder = true;
      return true
    }
    // assert node match
    if (false) {}
    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.init)) { i(vnode, true /* hydrating */); }
      if (isDef(i = vnode.componentInstance)) {
        // child component. it should have hydrated its own tree.
        initComponent(vnode, insertedVnodeQueue);
        return true
      }
    }
    if (isDef(tag)) {
      if (isDef(children)) {
        // empty element, allow client to pick up and populate children
        if (!elm.hasChildNodes()) {
          createChildren(vnode, children, insertedVnodeQueue);
        } else {
          // v-html and domProps: innerHTML
          if (isDef(i = data) && isDef(i = i.domProps) && isDef(i = i.innerHTML)) {
            if (i !== elm.innerHTML) {
              /* istanbul ignore if */
              if (false
              ) {}
              return false
            }
          } else {
            // iterate and compare children lists
            var childrenMatch = true;
            var childNode = elm.firstChild;
            for (var i$1 = 0; i$1 < children.length; i$1++) {
              if (!childNode || !hydrate(childNode, children[i$1], insertedVnodeQueue, inVPre)) {
                childrenMatch = false;
                break
              }
              childNode = childNode.nextSibling;
            }
            // if childNode is not null, it means the actual childNodes list is
            // longer than the virtual children list.
            if (!childrenMatch || childNode) {
              /* istanbul ignore if */
              if (false
              ) {}
              return false
            }
          }
        }
      }
      if (isDef(data)) {
        var fullInvoke = false;
        for (var key in data) {
          if (!isRenderedModule(key)) {
            fullInvoke = true;
            invokeCreateHooks(vnode, insertedVnodeQueue);
            break
          }
        }
        if (!fullInvoke && data['class']) {
          // ensure collecting deps for deep class bindings for future updates
          traverse(data['class']);
        }
      }
    } else if (elm.data !== vnode.text) {
      elm.data = vnode.text;
    }
    return true
  }

  function assertNodeMatch (node, vnode, inVPre) {
    if (isDef(vnode.tag)) {
      return vnode.tag.indexOf('vue-component') === 0 || (
        !isUnknownElement$$1(vnode, inVPre) &&
        vnode.tag.toLowerCase() === (node.tagName && node.tagName.toLowerCase())
      )
    } else {
      return node.nodeType === (vnode.isComment ? 8 : 3)
    }
  }

  return function patch (oldVnode, vnode, hydrating, removeOnly) {
    if (isUndef(vnode)) {
      if (isDef(oldVnode)) { invokeDestroyHook(oldVnode); }
      return
    }

    var isInitialPatch = false;
    var insertedVnodeQueue = [];

    if (isUndef(oldVnode)) {
      // empty mount (likely as component), create new root element
      isInitialPatch = true;
      createElm(vnode, insertedVnodeQueue);
    } else {
      var isRealElement = isDef(oldVnode.nodeType);
      if (!isRealElement && sameVnode(oldVnode, vnode)) {
        // patch existing root node
        patchVnode(oldVnode, vnode, insertedVnodeQueue, null, null, removeOnly);
      } else {
        if (isRealElement) {
          // mounting to a real element
          // check if this is server-rendered content and if we can perform
          // a successful hydration.
          if (oldVnode.nodeType === 1 && oldVnode.hasAttribute(SSR_ATTR)) {
            oldVnode.removeAttribute(SSR_ATTR);
            hydrating = true;
          }
          if (isTrue(hydrating)) {
            if (hydrate(oldVnode, vnode, insertedVnodeQueue)) {
              invokeInsertHook(vnode, insertedVnodeQueue, true);
              return oldVnode
            } else if (false) {}
          }
          // either not server-rendered, or hydration failed.
          // create an empty node and replace it
          oldVnode = emptyNodeAt(oldVnode);
        }

        // replacing existing element
        var oldElm = oldVnode.elm;
        var parentElm = nodeOps.parentNode(oldElm);

        // create new node
        createElm(
          vnode,
          insertedVnodeQueue,
          // extremely rare edge case: do not insert if old element is in a
          // leaving transition. Only happens when combining transition +
          // keep-alive + HOCs. (#4590)
          oldElm._leaveCb ? null : parentElm,
          nodeOps.nextSibling(oldElm)
        );

        // update parent placeholder node element, recursively
        if (isDef(vnode.parent)) {
          var ancestor = vnode.parent;
          var patchable = isPatchable(vnode);
          while (ancestor) {
            for (var i = 0; i < cbs.destroy.length; ++i) {
              cbs.destroy[i](ancestor);
            }
            ancestor.elm = vnode.elm;
            if (patchable) {
              for (var i$1 = 0; i$1 < cbs.create.length; ++i$1) {
                cbs.create[i$1](emptyNode, ancestor);
              }
              // #6513
              // invoke insert hooks that may have been merged by create hooks.
              // e.g. for directives that uses the "inserted" hook.
              var insert = ancestor.data.hook.insert;
              if (insert.merged) {
                // start at index 1 to avoid re-invoking component mounted hook
                for (var i$2 = 1; i$2 < insert.fns.length; i$2++) {
                  insert.fns[i$2]();
                }
              }
            } else {
              registerRef(ancestor);
            }
            ancestor = ancestor.parent;
          }
        }

        // destroy old node
        if (isDef(parentElm)) {
          removeVnodes([oldVnode], 0, 0);
        } else if (isDef(oldVnode.tag)) {
          invokeDestroyHook(oldVnode);
        }
      }
    }

    invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch);
    return vnode.elm
  }
}

/*  */

var directives = {
  create: updateDirectives,
  update: updateDirectives,
  destroy: function unbindDirectives (vnode) {
    updateDirectives(vnode, emptyNode);
  }
};

function updateDirectives (oldVnode, vnode) {
  if (oldVnode.data.directives || vnode.data.directives) {
    _update(oldVnode, vnode);
  }
}

function _update (oldVnode, vnode) {
  var isCreate = oldVnode === emptyNode;
  var isDestroy = vnode === emptyNode;
  var oldDirs = normalizeDirectives$1(oldVnode.data.directives, oldVnode.context);
  var newDirs = normalizeDirectives$1(vnode.data.directives, vnode.context);

  var dirsWithInsert = [];
  var dirsWithPostpatch = [];

  var key, oldDir, dir;
  for (key in newDirs) {
    oldDir = oldDirs[key];
    dir = newDirs[key];
    if (!oldDir) {
      // new directive, bind
      callHook$1(dir, 'bind', vnode, oldVnode);
      if (dir.def && dir.def.inserted) {
        dirsWithInsert.push(dir);
      }
    } else {
      // existing directive, update
      dir.oldValue = oldDir.value;
      dir.oldArg = oldDir.arg;
      callHook$1(dir, 'update', vnode, oldVnode);
      if (dir.def && dir.def.componentUpdated) {
        dirsWithPostpatch.push(dir);
      }
    }
  }

  if (dirsWithInsert.length) {
    var callInsert = function () {
      for (var i = 0; i < dirsWithInsert.length; i++) {
        callHook$1(dirsWithInsert[i], 'inserted', vnode, oldVnode);
      }
    };
    if (isCreate) {
      mergeVNodeHook(vnode, 'insert', callInsert);
    } else {
      callInsert();
    }
  }

  if (dirsWithPostpatch.length) {
    mergeVNodeHook(vnode, 'postpatch', function () {
      for (var i = 0; i < dirsWithPostpatch.length; i++) {
        callHook$1(dirsWithPostpatch[i], 'componentUpdated', vnode, oldVnode);
      }
    });
  }

  if (!isCreate) {
    for (key in oldDirs) {
      if (!newDirs[key]) {
        // no longer present, unbind
        callHook$1(oldDirs[key], 'unbind', oldVnode, oldVnode, isDestroy);
      }
    }
  }
}

var emptyModifiers = Object.create(null);

function normalizeDirectives$1 (
  dirs,
  vm
) {
  var res = Object.create(null);
  if (!dirs) {
    // $flow-disable-line
    return res
  }
  var i, dir;
  for (i = 0; i < dirs.length; i++) {
    dir = dirs[i];
    if (!dir.modifiers) {
      // $flow-disable-line
      dir.modifiers = emptyModifiers;
    }
    res[getRawDirName(dir)] = dir;
    dir.def = resolveAsset(vm.$options, 'directives', dir.name, true);
  }
  // $flow-disable-line
  return res
}

function getRawDirName (dir) {
  return dir.rawName || ((dir.name) + "." + (Object.keys(dir.modifiers || {}).join('.')))
}

function callHook$1 (dir, hook, vnode, oldVnode, isDestroy) {
  var fn = dir.def && dir.def[hook];
  if (fn) {
    try {
      fn(vnode.elm, dir, vnode, oldVnode, isDestroy);
    } catch (e) {
      handleError(e, vnode.context, ("directive " + (dir.name) + " " + hook + " hook"));
    }
  }
}

var baseModules = [
  ref,
  directives
];

/*  */

function updateAttrs (oldVnode, vnode) {
  var opts = vnode.componentOptions;
  if (isDef(opts) && opts.Ctor.options.inheritAttrs === false) {
    return
  }
  if (isUndef(oldVnode.data.attrs) && isUndef(vnode.data.attrs)) {
    return
  }
  var key, cur, old;
  var elm = vnode.elm;
  var oldAttrs = oldVnode.data.attrs || {};
  var attrs = vnode.data.attrs || {};
  // clone observed objects, as the user probably wants to mutate it
  if (isDef(attrs.__ob__)) {
    attrs = vnode.data.attrs = extend({}, attrs);
  }

  for (key in attrs) {
    cur = attrs[key];
    old = oldAttrs[key];
    if (old !== cur) {
      setAttr(elm, key, cur);
    }
  }
  // #4391: in IE9, setting type can reset value for input[type=radio]
  // #6666: IE/Edge forces progress value down to 1 before setting a max
  /* istanbul ignore if */
  if ((isIE || isEdge) && attrs.value !== oldAttrs.value) {
    setAttr(elm, 'value', attrs.value);
  }
  for (key in oldAttrs) {
    if (isUndef(attrs[key])) {
      if (isXlink(key)) {
        elm.removeAttributeNS(xlinkNS, getXlinkProp(key));
      } else if (!isEnumeratedAttr(key)) {
        elm.removeAttribute(key);
      }
    }
  }
}

function setAttr (el, key, value) {
  if (el.tagName.indexOf('-') > -1) {
    baseSetAttr(el, key, value);
  } else if (isBooleanAttr(key)) {
    // set attribute for blank value
    // e.g. <option disabled>Select one</option>
    if (isFalsyAttrValue(value)) {
      el.removeAttribute(key);
    } else {
      // technically allowfullscreen is a boolean attribute for <iframe>,
      // but Flash expects a value of "true" when used on <embed> tag
      value = key === 'allowfullscreen' && el.tagName === 'EMBED'
        ? 'true'
        : key;
      el.setAttribute(key, value);
    }
  } else if (isEnumeratedAttr(key)) {
    el.setAttribute(key, convertEnumeratedValue(key, value));
  } else if (isXlink(key)) {
    if (isFalsyAttrValue(value)) {
      el.removeAttributeNS(xlinkNS, getXlinkProp(key));
    } else {
      el.setAttributeNS(xlinkNS, key, value);
    }
  } else {
    baseSetAttr(el, key, value);
  }
}

function baseSetAttr (el, key, value) {
  if (isFalsyAttrValue(value)) {
    el.removeAttribute(key);
  } else {
    // #7138: IE10 & 11 fires input event when setting placeholder on
    // <textarea>... block the first input event and remove the blocker
    // immediately.
    /* istanbul ignore if */
    if (
      isIE && !isIE9 &&
      el.tagName === 'TEXTAREA' &&
      key === 'placeholder' && value !== '' && !el.__ieph
    ) {
      var blocker = function (e) {
        e.stopImmediatePropagation();
        el.removeEventListener('input', blocker);
      };
      el.addEventListener('input', blocker);
      // $flow-disable-line
      el.__ieph = true; /* IE placeholder patched */
    }
    el.setAttribute(key, value);
  }
}

var attrs = {
  create: updateAttrs,
  update: updateAttrs
};

/*  */

function updateClass (oldVnode, vnode) {
  var el = vnode.elm;
  var data = vnode.data;
  var oldData = oldVnode.data;
  if (
    isUndef(data.staticClass) &&
    isUndef(data.class) && (
      isUndef(oldData) || (
        isUndef(oldData.staticClass) &&
        isUndef(oldData.class)
      )
    )
  ) {
    return
  }

  var cls = genClassForVnode(vnode);

  // handle transition classes
  var transitionClass = el._transitionClasses;
  if (isDef(transitionClass)) {
    cls = concat(cls, stringifyClass(transitionClass));
  }

  // set the class
  if (cls !== el._prevClass) {
    el.setAttribute('class', cls);
    el._prevClass = cls;
  }
}

var klass = {
  create: updateClass,
  update: updateClass
};

/*  */

/*  */

/*  */

/*  */

// in some cases, the event used has to be determined at runtime
// so we used some reserved tokens during compile.
var RANGE_TOKEN = '__r';
var CHECKBOX_RADIO_TOKEN = '__c';

/*  */

// normalize v-model event tokens that can only be determined at runtime.
// it's important to place the event as the first in the array because
// the whole point is ensuring the v-model callback gets called before
// user-attached handlers.
function normalizeEvents (on) {
  /* istanbul ignore if */
  if (isDef(on[RANGE_TOKEN])) {
    // IE input[type=range] only supports `change` event
    var event = isIE ? 'change' : 'input';
    on[event] = [].concat(on[RANGE_TOKEN], on[event] || []);
    delete on[RANGE_TOKEN];
  }
  // This was originally intended to fix #4521 but no longer necessary
  // after 2.5. Keeping it for backwards compat with generated code from < 2.4
  /* istanbul ignore if */
  if (isDef(on[CHECKBOX_RADIO_TOKEN])) {
    on.change = [].concat(on[CHECKBOX_RADIO_TOKEN], on.change || []);
    delete on[CHECKBOX_RADIO_TOKEN];
  }
}

var target$1;

function createOnceHandler$1 (event, handler, capture) {
  var _target = target$1; // save current target element in closure
  return function onceHandler () {
    var res = handler.apply(null, arguments);
    if (res !== null) {
      remove$2(event, onceHandler, capture, _target);
    }
  }
}

// #9446: Firefox <= 53 (in particular, ESR 52) has incorrect Event.timeStamp
// implementation and does not fire microtasks in between event propagation, so
// safe to exclude.
var useMicrotaskFix = isUsingMicroTask && !(isFF && Number(isFF[1]) <= 53);

function add$1 (
  name,
  handler,
  capture,
  passive
) {
  // async edge case #6566: inner click event triggers patch, event handler
  // attached to outer element during patch, and triggered again. This
  // happens because browsers fire microtask ticks between event propagation.
  // the solution is simple: we save the timestamp when a handler is attached,
  // and the handler would only fire if the event passed to it was fired
  // AFTER it was attached.
  if (useMicrotaskFix) {
    var attachedTimestamp = currentFlushTimestamp;
    var original = handler;
    handler = original._wrapper = function (e) {
      if (
        // no bubbling, should always fire.
        // this is just a safety net in case event.timeStamp is unreliable in
        // certain weird environments...
        e.target === e.currentTarget ||
        // event is fired after handler attachment
        e.timeStamp >= attachedTimestamp ||
        // bail for environments that have buggy event.timeStamp implementations
        // #9462 iOS 9 bug: event.timeStamp is 0 after history.pushState
        // #9681 QtWebEngine event.timeStamp is negative value
        e.timeStamp <= 0 ||
        // #9448 bail if event is fired in another document in a multi-page
        // electron/nw.js app, since event.timeStamp will be using a different
        // starting reference
        e.target.ownerDocument !== document
      ) {
        return original.apply(this, arguments)
      }
    };
  }
  target$1.addEventListener(
    name,
    handler,
    supportsPassive
      ? { capture: capture, passive: passive }
      : capture
  );
}

function remove$2 (
  name,
  handler,
  capture,
  _target
) {
  (_target || target$1).removeEventListener(
    name,
    handler._wrapper || handler,
    capture
  );
}

function updateDOMListeners (oldVnode, vnode) {
  if (isUndef(oldVnode.data.on) && isUndef(vnode.data.on)) {
    return
  }
  var on = vnode.data.on || {};
  var oldOn = oldVnode.data.on || {};
  target$1 = vnode.elm;
  normalizeEvents(on);
  updateListeners(on, oldOn, add$1, remove$2, createOnceHandler$1, vnode.context);
  target$1 = undefined;
}

var events = {
  create: updateDOMListeners,
  update: updateDOMListeners
};

/*  */

var svgContainer;

function updateDOMProps (oldVnode, vnode) {
  if (isUndef(oldVnode.data.domProps) && isUndef(vnode.data.domProps)) {
    return
  }
  var key, cur;
  var elm = vnode.elm;
  var oldProps = oldVnode.data.domProps || {};
  var props = vnode.data.domProps || {};
  // clone observed objects, as the user probably wants to mutate it
  if (isDef(props.__ob__)) {
    props = vnode.data.domProps = extend({}, props);
  }

  for (key in oldProps) {
    if (!(key in props)) {
      elm[key] = '';
    }
  }

  for (key in props) {
    cur = props[key];
    // ignore children if the node has textContent or innerHTML,
    // as these will throw away existing DOM nodes and cause removal errors
    // on subsequent patches (#3360)
    if (key === 'textContent' || key === 'innerHTML') {
      if (vnode.children) { vnode.children.length = 0; }
      if (cur === oldProps[key]) { continue }
      // #6601 work around Chrome version <= 55 bug where single textNode
      // replaced by innerHTML/textContent retains its parentNode property
      if (elm.childNodes.length === 1) {
        elm.removeChild(elm.childNodes[0]);
      }
    }

    if (key === 'value' && elm.tagName !== 'PROGRESS') {
      // store value as _value as well since
      // non-string values will be stringified
      elm._value = cur;
      // avoid resetting cursor position when value is the same
      var strCur = isUndef(cur) ? '' : String(cur);
      if (shouldUpdateValue(elm, strCur)) {
        elm.value = strCur;
      }
    } else if (key === 'innerHTML' && isSVG(elm.tagName) && isUndef(elm.innerHTML)) {
      // IE doesn't support innerHTML for SVG elements
      svgContainer = svgContainer || document.createElement('div');
      svgContainer.innerHTML = "<svg>" + cur + "</svg>";
      var svg = svgContainer.firstChild;
      while (elm.firstChild) {
        elm.removeChild(elm.firstChild);
      }
      while (svg.firstChild) {
        elm.appendChild(svg.firstChild);
      }
    } else if (
      // skip the update if old and new VDOM state is the same.
      // `value` is handled separately because the DOM value may be temporarily
      // out of sync with VDOM state due to focus, composition and modifiers.
      // This  #4521 by skipping the unnecesarry `checked` update.
      cur !== oldProps[key]
    ) {
      // some property updates can throw
      // e.g. `value` on <progress> w/ non-finite value
      try {
        elm[key] = cur;
      } catch (e) {}
    }
  }
}

// check platforms/web/util/attrs.js acceptValue


function shouldUpdateValue (elm, checkVal) {
  return (!elm.composing && (
    elm.tagName === 'OPTION' ||
    isNotInFocusAndDirty(elm, checkVal) ||
    isDirtyWithModifiers(elm, checkVal)
  ))
}

function isNotInFocusAndDirty (elm, checkVal) {
  // return true when textbox (.number and .trim) loses focus and its value is
  // not equal to the updated value
  var notInFocus = true;
  // #6157
  // work around IE bug when accessing document.activeElement in an iframe
  try { notInFocus = document.activeElement !== elm; } catch (e) {}
  return notInFocus && elm.value !== checkVal
}

function isDirtyWithModifiers (elm, newVal) {
  var value = elm.value;
  var modifiers = elm._vModifiers; // injected by v-model runtime
  if (isDef(modifiers)) {
    if (modifiers.number) {
      return toNumber(value) !== toNumber(newVal)
    }
    if (modifiers.trim) {
      return value.trim() !== newVal.trim()
    }
  }
  return value !== newVal
}

var domProps = {
  create: updateDOMProps,
  update: updateDOMProps
};

/*  */

var parseStyleText = cached(function (cssText) {
  var res = {};
  var listDelimiter = /;(?![^(]*\))/g;
  var propertyDelimiter = /:(.+)/;
  cssText.split(listDelimiter).forEach(function (item) {
    if (item) {
      var tmp = item.split(propertyDelimiter);
      tmp.length > 1 && (res[tmp[0].trim()] = tmp[1].trim());
    }
  });
  return res
});

// merge static and dynamic style data on the same vnode
function normalizeStyleData (data) {
  var style = normalizeStyleBinding(data.style);
  // static style is pre-processed into an object during compilation
  // and is always a fresh object, so it's safe to merge into it
  return data.staticStyle
    ? extend(data.staticStyle, style)
    : style
}

// normalize possible array / string values into Object
function normalizeStyleBinding (bindingStyle) {
  if (Array.isArray(bindingStyle)) {
    return toObject(bindingStyle)
  }
  if (typeof bindingStyle === 'string') {
    return parseStyleText(bindingStyle)
  }
  return bindingStyle
}

/**
 * parent component style should be after child's
 * so that parent component's style could override it
 */
function getStyle (vnode, checkChild) {
  var res = {};
  var styleData;

  if (checkChild) {
    var childNode = vnode;
    while (childNode.componentInstance) {
      childNode = childNode.componentInstance._vnode;
      if (
        childNode && childNode.data &&
        (styleData = normalizeStyleData(childNode.data))
      ) {
        extend(res, styleData);
      }
    }
  }

  if ((styleData = normalizeStyleData(vnode.data))) {
    extend(res, styleData);
  }

  var parentNode = vnode;
  while ((parentNode = parentNode.parent)) {
    if (parentNode.data && (styleData = normalizeStyleData(parentNode.data))) {
      extend(res, styleData);
    }
  }
  return res
}

/*  */

var cssVarRE = /^--/;
var importantRE = /\s*!important$/;
var setProp = function (el, name, val) {
  /* istanbul ignore if */
  if (cssVarRE.test(name)) {
    el.style.setProperty(name, val);
  } else if (importantRE.test(val)) {
    el.style.setProperty(hyphenate(name), val.replace(importantRE, ''), 'important');
  } else {
    var normalizedName = normalize(name);
    if (Array.isArray(val)) {
      // Support values array created by autoprefixer, e.g.
      // {display: ["-webkit-box", "-ms-flexbox", "flex"]}
      // Set them one by one, and the browser will only set those it can recognize
      for (var i = 0, len = val.length; i < len; i++) {
        el.style[normalizedName] = val[i];
      }
    } else {
      el.style[normalizedName] = val;
    }
  }
};

var vendorNames = ['Webkit', 'Moz', 'ms'];

var emptyStyle;
var normalize = cached(function (prop) {
  emptyStyle = emptyStyle || document.createElement('div').style;
  prop = camelize(prop);
  if (prop !== 'filter' && (prop in emptyStyle)) {
    return prop
  }
  var capName = prop.charAt(0).toUpperCase() + prop.slice(1);
  for (var i = 0; i < vendorNames.length; i++) {
    var name = vendorNames[i] + capName;
    if (name in emptyStyle) {
      return name
    }
  }
});

function updateStyle (oldVnode, vnode) {
  var data = vnode.data;
  var oldData = oldVnode.data;

  if (isUndef(data.staticStyle) && isUndef(data.style) &&
    isUndef(oldData.staticStyle) && isUndef(oldData.style)
  ) {
    return
  }

  var cur, name;
  var el = vnode.elm;
  var oldStaticStyle = oldData.staticStyle;
  var oldStyleBinding = oldData.normalizedStyle || oldData.style || {};

  // if static style exists, stylebinding already merged into it when doing normalizeStyleData
  var oldStyle = oldStaticStyle || oldStyleBinding;

  var style = normalizeStyleBinding(vnode.data.style) || {};

  // store normalized style under a different key for next diff
  // make sure to clone it if it's reactive, since the user likely wants
  // to mutate it.
  vnode.data.normalizedStyle = isDef(style.__ob__)
    ? extend({}, style)
    : style;

  var newStyle = getStyle(vnode, true);

  for (name in oldStyle) {
    if (isUndef(newStyle[name])) {
      setProp(el, name, '');
    }
  }
  for (name in newStyle) {
    cur = newStyle[name];
    if (cur !== oldStyle[name]) {
      // ie9 setting to null has no effect, must use empty string
      setProp(el, name, cur == null ? '' : cur);
    }
  }
}

var style = {
  create: updateStyle,
  update: updateStyle
};

/*  */

var whitespaceRE = /\s+/;

/**
 * Add class with compatibility for SVG since classList is not supported on
 * SVG elements in IE
 */
function addClass (el, cls) {
  /* istanbul ignore if */
  if (!cls || !(cls = cls.trim())) {
    return
  }

  /* istanbul ignore else */
  if (el.classList) {
    if (cls.indexOf(' ') > -1) {
      cls.split(whitespaceRE).forEach(function (c) { return el.classList.add(c); });
    } else {
      el.classList.add(cls);
    }
  } else {
    var cur = " " + (el.getAttribute('class') || '') + " ";
    if (cur.indexOf(' ' + cls + ' ') < 0) {
      el.setAttribute('class', (cur + cls).trim());
    }
  }
}

/**
 * Remove class with compatibility for SVG since classList is not supported on
 * SVG elements in IE
 */
function removeClass (el, cls) {
  /* istanbul ignore if */
  if (!cls || !(cls = cls.trim())) {
    return
  }

  /* istanbul ignore else */
  if (el.classList) {
    if (cls.indexOf(' ') > -1) {
      cls.split(whitespaceRE).forEach(function (c) { return el.classList.remove(c); });
    } else {
      el.classList.remove(cls);
    }
    if (!el.classList.length) {
      el.removeAttribute('class');
    }
  } else {
    var cur = " " + (el.getAttribute('class') || '') + " ";
    var tar = ' ' + cls + ' ';
    while (cur.indexOf(tar) >= 0) {
      cur = cur.replace(tar, ' ');
    }
    cur = cur.trim();
    if (cur) {
      el.setAttribute('class', cur);
    } else {
      el.removeAttribute('class');
    }
  }
}

/*  */

function resolveTransition (def$$1) {
  if (!def$$1) {
    return
  }
  /* istanbul ignore else */
  if (typeof def$$1 === 'object') {
    var res = {};
    if (def$$1.css !== false) {
      extend(res, autoCssTransition(def$$1.name || 'v'));
    }
    extend(res, def$$1);
    return res
  } else if (typeof def$$1 === 'string') {
    return autoCssTransition(def$$1)
  }
}

var autoCssTransition = cached(function (name) {
  return {
    enterClass: (name + "-enter"),
    enterToClass: (name + "-enter-to"),
    enterActiveClass: (name + "-enter-active"),
    leaveClass: (name + "-leave"),
    leaveToClass: (name + "-leave-to"),
    leaveActiveClass: (name + "-leave-active")
  }
});

var hasTransition = inBrowser && !isIE9;
var TRANSITION = 'transition';
var ANIMATION = 'animation';

// Transition property/event sniffing
var transitionProp = 'transition';
var transitionEndEvent = 'transitionend';
var animationProp = 'animation';
var animationEndEvent = 'animationend';
if (hasTransition) {
  /* istanbul ignore if */
  if (window.ontransitionend === undefined &&
    window.onwebkittransitionend !== undefined
  ) {
    transitionProp = 'WebkitTransition';
    transitionEndEvent = 'webkitTransitionEnd';
  }
  if (window.onanimationend === undefined &&
    window.onwebkitanimationend !== undefined
  ) {
    animationProp = 'WebkitAnimation';
    animationEndEvent = 'webkitAnimationEnd';
  }
}

// binding to window is necessary to make hot reload work in IE in strict mode
var raf = inBrowser
  ? window.requestAnimationFrame
    ? window.requestAnimationFrame.bind(window)
    : setTimeout
  : /* istanbul ignore next */ function (fn) { return fn(); };

function nextFrame (fn) {
  raf(function () {
    raf(fn);
  });
}

function addTransitionClass (el, cls) {
  var transitionClasses = el._transitionClasses || (el._transitionClasses = []);
  if (transitionClasses.indexOf(cls) < 0) {
    transitionClasses.push(cls);
    addClass(el, cls);
  }
}

function removeTransitionClass (el, cls) {
  if (el._transitionClasses) {
    remove(el._transitionClasses, cls);
  }
  removeClass(el, cls);
}

function whenTransitionEnds (
  el,
  expectedType,
  cb
) {
  var ref = getTransitionInfo(el, expectedType);
  var type = ref.type;
  var timeout = ref.timeout;
  var propCount = ref.propCount;
  if (!type) { return cb() }
  var event = type === TRANSITION ? transitionEndEvent : animationEndEvent;
  var ended = 0;
  var end = function () {
    el.removeEventListener(event, onEnd);
    cb();
  };
  var onEnd = function (e) {
    if (e.target === el) {
      if (++ended >= propCount) {
        end();
      }
    }
  };
  setTimeout(function () {
    if (ended < propCount) {
      end();
    }
  }, timeout + 1);
  el.addEventListener(event, onEnd);
}

var transformRE = /\b(transform|all)(,|$)/;

function getTransitionInfo (el, expectedType) {
  var styles = window.getComputedStyle(el);
  // JSDOM may return undefined for transition properties
  var transitionDelays = (styles[transitionProp + 'Delay'] || '').split(', ');
  var transitionDurations = (styles[transitionProp + 'Duration'] || '').split(', ');
  var transitionTimeout = getTimeout(transitionDelays, transitionDurations);
  var animationDelays = (styles[animationProp + 'Delay'] || '').split(', ');
  var animationDurations = (styles[animationProp + 'Duration'] || '').split(', ');
  var animationTimeout = getTimeout(animationDelays, animationDurations);

  var type;
  var timeout = 0;
  var propCount = 0;
  /* istanbul ignore if */
  if (expectedType === TRANSITION) {
    if (transitionTimeout > 0) {
      type = TRANSITION;
      timeout = transitionTimeout;
      propCount = transitionDurations.length;
    }
  } else if (expectedType === ANIMATION) {
    if (animationTimeout > 0) {
      type = ANIMATION;
      timeout = animationTimeout;
      propCount = animationDurations.length;
    }
  } else {
    timeout = Math.max(transitionTimeout, animationTimeout);
    type = timeout > 0
      ? transitionTimeout > animationTimeout
        ? TRANSITION
        : ANIMATION
      : null;
    propCount = type
      ? type === TRANSITION
        ? transitionDurations.length
        : animationDurations.length
      : 0;
  }
  var hasTransform =
    type === TRANSITION &&
    transformRE.test(styles[transitionProp + 'Property']);
  return {
    type: type,
    timeout: timeout,
    propCount: propCount,
    hasTransform: hasTransform
  }
}

function getTimeout (delays, durations) {
  /* istanbul ignore next */
  while (delays.length < durations.length) {
    delays = delays.concat(delays);
  }

  return Math.max.apply(null, durations.map(function (d, i) {
    return toMs(d) + toMs(delays[i])
  }))
}

// Old versions of Chromium (below 61.0.3163.100) formats floating pointer numbers
// in a locale-dependent way, using a comma instead of a dot.
// If comma is not replaced with a dot, the input will be rounded down (i.e. acting
// as a floor function) causing unexpected behaviors
function toMs (s) {
  return Number(s.slice(0, -1).replace(',', '.')) * 1000
}

/*  */

function enter (vnode, toggleDisplay) {
  var el = vnode.elm;

  // call leave callback now
  if (isDef(el._leaveCb)) {
    el._leaveCb.cancelled = true;
    el._leaveCb();
  }

  var data = resolveTransition(vnode.data.transition);
  if (isUndef(data)) {
    return
  }

  /* istanbul ignore if */
  if (isDef(el._enterCb) || el.nodeType !== 1) {
    return
  }

  var css = data.css;
  var type = data.type;
  var enterClass = data.enterClass;
  var enterToClass = data.enterToClass;
  var enterActiveClass = data.enterActiveClass;
  var appearClass = data.appearClass;
  var appearToClass = data.appearToClass;
  var appearActiveClass = data.appearActiveClass;
  var beforeEnter = data.beforeEnter;
  var enter = data.enter;
  var afterEnter = data.afterEnter;
  var enterCancelled = data.enterCancelled;
  var beforeAppear = data.beforeAppear;
  var appear = data.appear;
  var afterAppear = data.afterAppear;
  var appearCancelled = data.appearCancelled;
  var duration = data.duration;

  // activeInstance will always be the <transition> component managing this
  // transition. One edge case to check is when the <transition> is placed
  // as the root node of a child component. In that case we need to check
  // <transition>'s parent for appear check.
  var context = activeInstance;
  var transitionNode = activeInstance.$vnode;
  while (transitionNode && transitionNode.parent) {
    context = transitionNode.context;
    transitionNode = transitionNode.parent;
  }

  var isAppear = !context._isMounted || !vnode.isRootInsert;

  if (isAppear && !appear && appear !== '') {
    return
  }

  var startClass = isAppear && appearClass
    ? appearClass
    : enterClass;
  var activeClass = isAppear && appearActiveClass
    ? appearActiveClass
    : enterActiveClass;
  var toClass = isAppear && appearToClass
    ? appearToClass
    : enterToClass;

  var beforeEnterHook = isAppear
    ? (beforeAppear || beforeEnter)
    : beforeEnter;
  var enterHook = isAppear
    ? (typeof appear === 'function' ? appear : enter)
    : enter;
  var afterEnterHook = isAppear
    ? (afterAppear || afterEnter)
    : afterEnter;
  var enterCancelledHook = isAppear
    ? (appearCancelled || enterCancelled)
    : enterCancelled;

  var explicitEnterDuration = toNumber(
    isObject(duration)
      ? duration.enter
      : duration
  );

  if (false) {}

  var expectsCSS = css !== false && !isIE9;
  var userWantsControl = getHookArgumentsLength(enterHook);

  var cb = el._enterCb = once(function () {
    if (expectsCSS) {
      removeTransitionClass(el, toClass);
      removeTransitionClass(el, activeClass);
    }
    if (cb.cancelled) {
      if (expectsCSS) {
        removeTransitionClass(el, startClass);
      }
      enterCancelledHook && enterCancelledHook(el);
    } else {
      afterEnterHook && afterEnterHook(el);
    }
    el._enterCb = null;
  });

  if (!vnode.data.show) {
    // remove pending leave element on enter by injecting an insert hook
    mergeVNodeHook(vnode, 'insert', function () {
      var parent = el.parentNode;
      var pendingNode = parent && parent._pending && parent._pending[vnode.key];
      if (pendingNode &&
        pendingNode.tag === vnode.tag &&
        pendingNode.elm._leaveCb
      ) {
        pendingNode.elm._leaveCb();
      }
      enterHook && enterHook(el, cb);
    });
  }

  // start enter transition
  beforeEnterHook && beforeEnterHook(el);
  if (expectsCSS) {
    addTransitionClass(el, startClass);
    addTransitionClass(el, activeClass);
    nextFrame(function () {
      removeTransitionClass(el, startClass);
      if (!cb.cancelled) {
        addTransitionClass(el, toClass);
        if (!userWantsControl) {
          if (isValidDuration(explicitEnterDuration)) {
            setTimeout(cb, explicitEnterDuration);
          } else {
            whenTransitionEnds(el, type, cb);
          }
        }
      }
    });
  }

  if (vnode.data.show) {
    toggleDisplay && toggleDisplay();
    enterHook && enterHook(el, cb);
  }

  if (!expectsCSS && !userWantsControl) {
    cb();
  }
}

function leave (vnode, rm) {
  var el = vnode.elm;

  // call enter callback now
  if (isDef(el._enterCb)) {
    el._enterCb.cancelled = true;
    el._enterCb();
  }

  var data = resolveTransition(vnode.data.transition);
  if (isUndef(data) || el.nodeType !== 1) {
    return rm()
  }

  /* istanbul ignore if */
  if (isDef(el._leaveCb)) {
    return
  }

  var css = data.css;
  var type = data.type;
  var leaveClass = data.leaveClass;
  var leaveToClass = data.leaveToClass;
  var leaveActiveClass = data.leaveActiveClass;
  var beforeLeave = data.beforeLeave;
  var leave = data.leave;
  var afterLeave = data.afterLeave;
  var leaveCancelled = data.leaveCancelled;
  var delayLeave = data.delayLeave;
  var duration = data.duration;

  var expectsCSS = css !== false && !isIE9;
  var userWantsControl = getHookArgumentsLength(leave);

  var explicitLeaveDuration = toNumber(
    isObject(duration)
      ? duration.leave
      : duration
  );

  if (false) {}

  var cb = el._leaveCb = once(function () {
    if (el.parentNode && el.parentNode._pending) {
      el.parentNode._pending[vnode.key] = null;
    }
    if (expectsCSS) {
      removeTransitionClass(el, leaveToClass);
      removeTransitionClass(el, leaveActiveClass);
    }
    if (cb.cancelled) {
      if (expectsCSS) {
        removeTransitionClass(el, leaveClass);
      }
      leaveCancelled && leaveCancelled(el);
    } else {
      rm();
      afterLeave && afterLeave(el);
    }
    el._leaveCb = null;
  });

  if (delayLeave) {
    delayLeave(performLeave);
  } else {
    performLeave();
  }

  function performLeave () {
    // the delayed leave may have already been cancelled
    if (cb.cancelled) {
      return
    }
    // record leaving element
    if (!vnode.data.show && el.parentNode) {
      (el.parentNode._pending || (el.parentNode._pending = {}))[(vnode.key)] = vnode;
    }
    beforeLeave && beforeLeave(el);
    if (expectsCSS) {
      addTransitionClass(el, leaveClass);
      addTransitionClass(el, leaveActiveClass);
      nextFrame(function () {
        removeTransitionClass(el, leaveClass);
        if (!cb.cancelled) {
          addTransitionClass(el, leaveToClass);
          if (!userWantsControl) {
            if (isValidDuration(explicitLeaveDuration)) {
              setTimeout(cb, explicitLeaveDuration);
            } else {
              whenTransitionEnds(el, type, cb);
            }
          }
        }
      });
    }
    leave && leave(el, cb);
    if (!expectsCSS && !userWantsControl) {
      cb();
    }
  }
}

// only used in dev mode
function checkDuration (val, name, vnode) {
  if (typeof val !== 'number') {
    warn(
      "<transition> explicit " + name + " duration is not a valid number - " +
      "got " + (JSON.stringify(val)) + ".",
      vnode.context
    );
  } else if (isNaN(val)) {
    warn(
      "<transition> explicit " + name + " duration is NaN - " +
      'the duration expression might be incorrect.',
      vnode.context
    );
  }
}

function isValidDuration (val) {
  return typeof val === 'number' && !isNaN(val)
}

/**
 * Normalize a transition hook's argument length. The hook may be:
 * - a merged hook (invoker) with the original in .fns
 * - a wrapped component method (check ._length)
 * - a plain function (.length)
 */
function getHookArgumentsLength (fn) {
  if (isUndef(fn)) {
    return false
  }
  var invokerFns = fn.fns;
  if (isDef(invokerFns)) {
    // invoker
    return getHookArgumentsLength(
      Array.isArray(invokerFns)
        ? invokerFns[0]
        : invokerFns
    )
  } else {
    return (fn._length || fn.length) > 1
  }
}

function _enter (_, vnode) {
  if (vnode.data.show !== true) {
    enter(vnode);
  }
}

var transition = inBrowser ? {
  create: _enter,
  activate: _enter,
  remove: function remove$$1 (vnode, rm) {
    /* istanbul ignore else */
    if (vnode.data.show !== true) {
      leave(vnode, rm);
    } else {
      rm();
    }
  }
} : {};

var platformModules = [
  attrs,
  klass,
  events,
  domProps,
  style,
  transition
];

/*  */

// the directive module should be applied last, after all
// built-in modules have been applied.
var modules = platformModules.concat(baseModules);

var patch = createPatchFunction({ nodeOps: nodeOps, modules: modules });

/**
 * Not type checking this file because flow doesn't like attaching
 * properties to Elements.
 */

/* istanbul ignore if */
if (isIE9) {
  // http://www.matts411.com/post/internet-explorer-9-oninput/
  document.addEventListener('selectionchange', function () {
    var el = document.activeElement;
    if (el && el.vmodel) {
      trigger(el, 'input');
    }
  });
}

var directive = {
  inserted: function inserted (el, binding, vnode, oldVnode) {
    if (vnode.tag === 'select') {
      // #6903
      if (oldVnode.elm && !oldVnode.elm._vOptions) {
        mergeVNodeHook(vnode, 'postpatch', function () {
          directive.componentUpdated(el, binding, vnode);
        });
      } else {
        setSelected(el, binding, vnode.context);
      }
      el._vOptions = [].map.call(el.options, getValue);
    } else if (vnode.tag === 'textarea' || isTextInputType(el.type)) {
      el._vModifiers = binding.modifiers;
      if (!binding.modifiers.lazy) {
        el.addEventListener('compositionstart', onCompositionStart);
        el.addEventListener('compositionend', onCompositionEnd);
        // Safari < 10.2 & UIWebView doesn't fire compositionend when
        // switching focus before confirming composition choice
        // this also fixes the issue where some browsers e.g. iOS Chrome
        // fires "change" instead of "input" on autocomplete.
        el.addEventListener('change', onCompositionEnd);
        /* istanbul ignore if */
        if (isIE9) {
          el.vmodel = true;
        }
      }
    }
  },

  componentUpdated: function componentUpdated (el, binding, vnode) {
    if (vnode.tag === 'select') {
      setSelected(el, binding, vnode.context);
      // in case the options rendered by v-for have changed,
      // it's possible that the value is out-of-sync with the rendered options.
      // detect such cases and filter out values that no longer has a matching
      // option in the DOM.
      var prevOptions = el._vOptions;
      var curOptions = el._vOptions = [].map.call(el.options, getValue);
      if (curOptions.some(function (o, i) { return !looseEqual(o, prevOptions[i]); })) {
        // trigger change event if
        // no matching option found for at least one value
        var needReset = el.multiple
          ? binding.value.some(function (v) { return hasNoMatchingOption(v, curOptions); })
          : binding.value !== binding.oldValue && hasNoMatchingOption(binding.value, curOptions);
        if (needReset) {
          trigger(el, 'change');
        }
      }
    }
  }
};

function setSelected (el, binding, vm) {
  actuallySetSelected(el, binding, vm);
  /* istanbul ignore if */
  if (isIE || isEdge) {
    setTimeout(function () {
      actuallySetSelected(el, binding, vm);
    }, 0);
  }
}

function actuallySetSelected (el, binding, vm) {
  var value = binding.value;
  var isMultiple = el.multiple;
  if (isMultiple && !Array.isArray(value)) {
     false && 0;
    return
  }
  var selected, option;
  for (var i = 0, l = el.options.length; i < l; i++) {
    option = el.options[i];
    if (isMultiple) {
      selected = looseIndexOf(value, getValue(option)) > -1;
      if (option.selected !== selected) {
        option.selected = selected;
      }
    } else {
      if (looseEqual(getValue(option), value)) {
        if (el.selectedIndex !== i) {
          el.selectedIndex = i;
        }
        return
      }
    }
  }
  if (!isMultiple) {
    el.selectedIndex = -1;
  }
}

function hasNoMatchingOption (value, options) {
  return options.every(function (o) { return !looseEqual(o, value); })
}

function getValue (option) {
  return '_value' in option
    ? option._value
    : option.value
}

function onCompositionStart (e) {
  e.target.composing = true;
}

function onCompositionEnd (e) {
  // prevent triggering an input event for no reason
  if (!e.target.composing) { return }
  e.target.composing = false;
  trigger(e.target, 'input');
}

function trigger (el, type) {
  var e = document.createEvent('HTMLEvents');
  e.initEvent(type, true, true);
  el.dispatchEvent(e);
}

/*  */

// recursively search for possible transition defined inside the component root
function locateNode (vnode) {
  return vnode.componentInstance && (!vnode.data || !vnode.data.transition)
    ? locateNode(vnode.componentInstance._vnode)
    : vnode
}

var show = {
  bind: function bind (el, ref, vnode) {
    var value = ref.value;

    vnode = locateNode(vnode);
    var transition$$1 = vnode.data && vnode.data.transition;
    var originalDisplay = el.__vOriginalDisplay =
      el.style.display === 'none' ? '' : el.style.display;
    if (value && transition$$1) {
      vnode.data.show = true;
      enter(vnode, function () {
        el.style.display = originalDisplay;
      });
    } else {
      el.style.display = value ? originalDisplay : 'none';
    }
  },

  update: function update (el, ref, vnode) {
    var value = ref.value;
    var oldValue = ref.oldValue;

    /* istanbul ignore if */
    if (!value === !oldValue) { return }
    vnode = locateNode(vnode);
    var transition$$1 = vnode.data && vnode.data.transition;
    if (transition$$1) {
      vnode.data.show = true;
      if (value) {
        enter(vnode, function () {
          el.style.display = el.__vOriginalDisplay;
        });
      } else {
        leave(vnode, function () {
          el.style.display = 'none';
        });
      }
    } else {
      el.style.display = value ? el.__vOriginalDisplay : 'none';
    }
  },

  unbind: function unbind (
    el,
    binding,
    vnode,
    oldVnode,
    isDestroy
  ) {
    if (!isDestroy) {
      el.style.display = el.__vOriginalDisplay;
    }
  }
};

var platformDirectives = {
  model: directive,
  show: show
};

/*  */

var transitionProps = {
  name: String,
  appear: Boolean,
  css: Boolean,
  mode: String,
  type: String,
  enterClass: String,
  leaveClass: String,
  enterToClass: String,
  leaveToClass: String,
  enterActiveClass: String,
  leaveActiveClass: String,
  appearClass: String,
  appearActiveClass: String,
  appearToClass: String,
  duration: [Number, String, Object]
};

// in case the child is also an abstract component, e.g. <keep-alive>
// we want to recursively retrieve the real component to be rendered
function getRealChild (vnode) {
  var compOptions = vnode && vnode.componentOptions;
  if (compOptions && compOptions.Ctor.options.abstract) {
    return getRealChild(getFirstComponentChild(compOptions.children))
  } else {
    return vnode
  }
}

function extractTransitionData (comp) {
  var data = {};
  var options = comp.$options;
  // props
  for (var key in options.propsData) {
    data[key] = comp[key];
  }
  // events.
  // extract listeners and pass them directly to the transition methods
  var listeners = options._parentListeners;
  for (var key$1 in listeners) {
    data[camelize(key$1)] = listeners[key$1];
  }
  return data
}

function placeholder (h, rawChild) {
  if (/\d-keep-alive$/.test(rawChild.tag)) {
    return h('keep-alive', {
      props: rawChild.componentOptions.propsData
    })
  }
}

function hasParentTransition (vnode) {
  while ((vnode = vnode.parent)) {
    if (vnode.data.transition) {
      return true
    }
  }
}

function isSameChild (child, oldChild) {
  return oldChild.key === child.key && oldChild.tag === child.tag
}

var isNotTextNode = function (c) { return c.tag || isAsyncPlaceholder(c); };

var isVShowDirective = function (d) { return d.name === 'show'; };

var Transition = {
  name: 'transition',
  props: transitionProps,
  abstract: true,

  render: function render (h) {
    var this$1 = this;

    var children = this.$slots.default;
    if (!children) {
      return
    }

    // filter out text nodes (possible whitespaces)
    children = children.filter(isNotTextNode);
    /* istanbul ignore if */
    if (!children.length) {
      return
    }

    // warn multiple elements
    if (false) {}

    var mode = this.mode;

    // warn invalid mode
    if (false
    ) {}

    var rawChild = children[0];

    // if this is a component root node and the component's
    // parent container node also has transition, skip.
    if (hasParentTransition(this.$vnode)) {
      return rawChild
    }

    // apply transition data to child
    // use getRealChild() to ignore abstract components e.g. keep-alive
    var child = getRealChild(rawChild);
    /* istanbul ignore if */
    if (!child) {
      return rawChild
    }

    if (this._leaving) {
      return placeholder(h, rawChild)
    }

    // ensure a key that is unique to the vnode type and to this transition
    // component instance. This key will be used to remove pending leaving nodes
    // during entering.
    var id = "__transition-" + (this._uid) + "-";
    child.key = child.key == null
      ? child.isComment
        ? id + 'comment'
        : id + child.tag
      : isPrimitive(child.key)
        ? (String(child.key).indexOf(id) === 0 ? child.key : id + child.key)
        : child.key;

    var data = (child.data || (child.data = {})).transition = extractTransitionData(this);
    var oldRawChild = this._vnode;
    var oldChild = getRealChild(oldRawChild);

    // mark v-show
    // so that the transition module can hand over the control to the directive
    if (child.data.directives && child.data.directives.some(isVShowDirective)) {
      child.data.show = true;
    }

    if (
      oldChild &&
      oldChild.data &&
      !isSameChild(child, oldChild) &&
      !isAsyncPlaceholder(oldChild) &&
      // #6687 component root is a comment node
      !(oldChild.componentInstance && oldChild.componentInstance._vnode.isComment)
    ) {
      // replace old child transition data with fresh one
      // important for dynamic transitions!
      var oldData = oldChild.data.transition = extend({}, data);
      // handle transition mode
      if (mode === 'out-in') {
        // return placeholder node and queue update when leave finishes
        this._leaving = true;
        mergeVNodeHook(oldData, 'afterLeave', function () {
          this$1._leaving = false;
          this$1.$forceUpdate();
        });
        return placeholder(h, rawChild)
      } else if (mode === 'in-out') {
        if (isAsyncPlaceholder(child)) {
          return oldRawChild
        }
        var delayedLeave;
        var performLeave = function () { delayedLeave(); };
        mergeVNodeHook(data, 'afterEnter', performLeave);
        mergeVNodeHook(data, 'enterCancelled', performLeave);
        mergeVNodeHook(oldData, 'delayLeave', function (leave) { delayedLeave = leave; });
      }
    }

    return rawChild
  }
};

/*  */

var props = extend({
  tag: String,
  moveClass: String
}, transitionProps);

delete props.mode;

var TransitionGroup = {
  props: props,

  beforeMount: function beforeMount () {
    var this$1 = this;

    var update = this._update;
    this._update = function (vnode, hydrating) {
      var restoreActiveInstance = setActiveInstance(this$1);
      // force removing pass
      this$1.__patch__(
        this$1._vnode,
        this$1.kept,
        false, // hydrating
        true // removeOnly (!important, avoids unnecessary moves)
      );
      this$1._vnode = this$1.kept;
      restoreActiveInstance();
      update.call(this$1, vnode, hydrating);
    };
  },

  render: function render (h) {
    var tag = this.tag || this.$vnode.data.tag || 'span';
    var map = Object.create(null);
    var prevChildren = this.prevChildren = this.children;
    var rawChildren = this.$slots.default || [];
    var children = this.children = [];
    var transitionData = extractTransitionData(this);

    for (var i = 0; i < rawChildren.length; i++) {
      var c = rawChildren[i];
      if (c.tag) {
        if (c.key != null && String(c.key).indexOf('__vlist') !== 0) {
          children.push(c);
          map[c.key] = c
          ;(c.data || (c.data = {})).transition = transitionData;
        } else if (false) { var name, opts; }
      }
    }

    if (prevChildren) {
      var kept = [];
      var removed = [];
      for (var i$1 = 0; i$1 < prevChildren.length; i$1++) {
        var c$1 = prevChildren[i$1];
        c$1.data.transition = transitionData;
        c$1.data.pos = c$1.elm.getBoundingClientRect();
        if (map[c$1.key]) {
          kept.push(c$1);
        } else {
          removed.push(c$1);
        }
      }
      this.kept = h(tag, null, kept);
      this.removed = removed;
    }

    return h(tag, null, children)
  },

  updated: function updated () {
    var children = this.prevChildren;
    var moveClass = this.moveClass || ((this.name || 'v') + '-move');
    if (!children.length || !this.hasMove(children[0].elm, moveClass)) {
      return
    }

    // we divide the work into three loops to avoid mixing DOM reads and writes
    // in each iteration - which helps prevent layout thrashing.
    children.forEach(callPendingCbs);
    children.forEach(recordPosition);
    children.forEach(applyTranslation);

    // force reflow to put everything in position
    // assign to this to avoid being removed in tree-shaking
    // $flow-disable-line
    this._reflow = document.body.offsetHeight;

    children.forEach(function (c) {
      if (c.data.moved) {
        var el = c.elm;
        var s = el.style;
        addTransitionClass(el, moveClass);
        s.transform = s.WebkitTransform = s.transitionDuration = '';
        el.addEventListener(transitionEndEvent, el._moveCb = function cb (e) {
          if (e && e.target !== el) {
            return
          }
          if (!e || /transform$/.test(e.propertyName)) {
            el.removeEventListener(transitionEndEvent, cb);
            el._moveCb = null;
            removeTransitionClass(el, moveClass);
          }
        });
      }
    });
  },

  methods: {
    hasMove: function hasMove (el, moveClass) {
      /* istanbul ignore if */
      if (!hasTransition) {
        return false
      }
      /* istanbul ignore if */
      if (this._hasMove) {
        return this._hasMove
      }
      // Detect whether an element with the move class applied has
      // CSS transitions. Since the element may be inside an entering
      // transition at this very moment, we make a clone of it and remove
      // all other transition classes applied to ensure only the move class
      // is applied.
      var clone = el.cloneNode();
      if (el._transitionClasses) {
        el._transitionClasses.forEach(function (cls) { removeClass(clone, cls); });
      }
      addClass(clone, moveClass);
      clone.style.display = 'none';
      this.$el.appendChild(clone);
      var info = getTransitionInfo(clone);
      this.$el.removeChild(clone);
      return (this._hasMove = info.hasTransform)
    }
  }
};

function callPendingCbs (c) {
  /* istanbul ignore if */
  if (c.elm._moveCb) {
    c.elm._moveCb();
  }
  /* istanbul ignore if */
  if (c.elm._enterCb) {
    c.elm._enterCb();
  }
}

function recordPosition (c) {
  c.data.newPos = c.elm.getBoundingClientRect();
}

function applyTranslation (c) {
  var oldPos = c.data.pos;
  var newPos = c.data.newPos;
  var dx = oldPos.left - newPos.left;
  var dy = oldPos.top - newPos.top;
  if (dx || dy) {
    c.data.moved = true;
    var s = c.elm.style;
    s.transform = s.WebkitTransform = "translate(" + dx + "px," + dy + "px)";
    s.transitionDuration = '0s';
  }
}

var platformComponents = {
  Transition: Transition,
  TransitionGroup: TransitionGroup
};

/*  */

// install platform specific utils
Vue.config.mustUseProp = mustUseProp;
Vue.config.isReservedTag = isReservedTag;
Vue.config.isReservedAttr = isReservedAttr;
Vue.config.getTagNamespace = getTagNamespace;
Vue.config.isUnknownElement = isUnknownElement;

// install platform runtime directives & components
extend(Vue.options.directives, platformDirectives);
extend(Vue.options.components, platformComponents);

// install platform patch function
Vue.prototype.__patch__ = inBrowser ? patch : noop;

// public mount method
Vue.prototype.$mount = function (
  el,
  hydrating
) {
  el = el && inBrowser ? query(el) : undefined;
  return mountComponent(this, el, hydrating)
};

// devtools global hook
/* istanbul ignore next */
if (inBrowser) {
  setTimeout(function () {
    if (config.devtools) {
      if (devtools) {
        devtools.emit('init', Vue);
      } else if (
        false
      ) {}
    }
    if (false
    ) {}
  }, 0);
}

/*  */

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Vue);


/***/ }),

/***/ 9700:
/***/ ((module) => {

"use strict";
module.exports = "data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27%23fff%27 width=%278%27 height=%278%27 viewBox=%270 0 8 8%27%3e%3cpath d=%27M2.75 0l-1.5 1.5L3.75 4l-2.5 2.5L2.75 8l4-4-4-4z%27/%3e%3c/svg%3e";

/***/ }),

/***/ 4104:
/***/ ((module) => {

"use strict";
module.exports = "data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27%23fff%27 width=%278%27 height=%278%27 viewBox=%270 0 8 8%27%3e%3cpath d=%27M5.25 0l-4 4 4 4 1.5-1.5L4.25 4l2.5-2.5L5.25 0z%27/%3e%3c/svg%3e";

/***/ }),

/***/ 1024:
/***/ ((module) => {

"use strict";
module.exports = "data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2712%27 height=%2712%27 fill=%27none%27 stroke=%27%23dc3545%27 viewBox=%270 0 12 12%27%3e%3ccircle cx=%276%27 cy=%276%27 r=%274.5%27/%3e%3cpath stroke-linejoin=%27round%27 d=%27M5.8 3.6h.4L6 6.5z%27/%3e%3ccircle cx=%276%27 cy=%278.2%27 r=%27.6%27 fill=%27%23dc3545%27 stroke=%27none%27/%3e%3c/svg%3e";

/***/ }),

/***/ 7263:
/***/ ((module) => {

"use strict";
module.exports = "data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2712%27 height=%2712%27 viewBox=%27-4 -4 8 8%27%3e%3ccircle r=%273%27 fill=%27%23fff%27/%3e%3c/svg%3e";

/***/ }),

/***/ 1380:
/***/ ((module) => {

"use strict";
module.exports = "data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2730%27 height=%2730%27 viewBox=%270 0 30 30%27%3e%3cpath stroke=%27rgba%280, 0, 0, 0.5%29%27 stroke-linecap=%27round%27 stroke-miterlimit=%2710%27 stroke-width=%272%27 d=%27M4 7h22M4 15h22M4 23h22%27/%3e%3c/svg%3e";

/***/ }),

/***/ 9242:
/***/ ((module) => {

"use strict";
module.exports = "data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2730%27 height=%2730%27 viewBox=%270 0 30 30%27%3e%3cpath stroke=%27rgba%28255, 255, 255, 0.5%29%27 stroke-linecap=%27round%27 stroke-miterlimit=%2710%27 stroke-width=%272%27 d=%27M4 7h22M4 15h22M4 23h22%27/%3e%3c/svg%3e";

/***/ }),

/***/ 4231:
/***/ ((module) => {

"use strict";
module.exports = "data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%274%27 height=%274%27 viewBox=%270 0 4 4%27%3e%3cpath stroke=%27%23fff%27 d=%27M0 2h4%27/%3e%3c/svg%3e";

/***/ }),

/***/ 4576:
/***/ ((module) => {

"use strict";
module.exports = "data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%274%27 height=%275%27 viewBox=%270 0 4 5%27%3e%3cpath fill=%27%23343a40%27 d=%27M2 0L0 2h4zm0 5L0 3h4z%27/%3e%3c/svg%3e";

/***/ }),

/***/ 7211:
/***/ ((module) => {

"use strict";
module.exports = "data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%278%27 height=%278%27 viewBox=%270 0 8 8%27%3e%3cpath fill=%27%2328a745%27 d=%27M2.3 6.73L.6 4.53c-.4-1.04.46-1.4 1.1-.8l1.1 1.4 3.4-3.8c.6-.63 1.6-.27 1.2.7l-4 4.6c-.43.5-.8.4-1.1.1z%27/%3e%3c/svg%3e";

/***/ }),

/***/ 9653:
/***/ ((module) => {

"use strict";
module.exports = "data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%278%27 height=%278%27 viewBox=%270 0 8 8%27%3e%3cpath fill=%27%23fff%27 d=%27M6.564.75l-3.59 3.612-1.538-1.55L0 4.26l2.974 2.99L8 2.193z%27/%3e%3c/svg%3e";

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		__webpack_require__.b = document.baseURI || self.location.href;
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			179: 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		// no on chunks loaded
/******/ 		
/******/ 		// no jsonp function
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/nonce */
/******/ 	(() => {
/******/ 		__webpack_require__.nc = undefined;
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";

// EXTERNAL MODULE: ./node_modules/vue/dist/vue.runtime.esm.js
var vue_runtime_esm = __webpack_require__(144);
;// CONCATENATED MODULE: ./node_modules/vue-custom-element/dist/vue-custom-element.esm.js
/**
  * vue-custom-element v3.2.12
  * (c) 2019 Karol Fabjańczuk
  * @license MIT
  */
/**
 * ES6 Object.getPrototypeOf Polyfill
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
 */

Object.setPrototypeOf = Object.setPrototypeOf || setPrototypeOf;

function setPrototypeOf(obj, proto) {
  obj.__proto__ = proto;
  return obj;
}

var setPrototypeOf_1 = setPrototypeOf.bind(Object);

function isES2015() {
  if (typeof Symbol === 'undefined' || typeof Reflect === 'undefined' || typeof Proxy === 'undefined' || Object.isSealed(Proxy)) return false;

  return true;
}

var isES2015$1 = isES2015();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _CustomElement() {
  return Reflect.construct(HTMLElement, [], this.__proto__.constructor);
}


Object.setPrototypeOf(_CustomElement.prototype, HTMLElement.prototype);
Object.setPrototypeOf(_CustomElement, HTMLElement);
function registerCustomElement(tag) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  if (typeof customElements === 'undefined') {
    return;
  }

  function constructorCallback() {
    if (options.shadow === true && HTMLElement.prototype.attachShadow) {
      this.attachShadow({ mode: 'open' });
    }
    typeof options.constructorCallback === 'function' && options.constructorCallback.call(this);
  }
  function connectedCallback() {
    typeof options.connectedCallback === 'function' && options.connectedCallback.call(this);
  }

  function disconnectedCallback() {
    typeof options.disconnectedCallback === 'function' && options.disconnectedCallback.call(this);
  }

  function attributeChangedCallback(name, oldValue, value) {
    typeof options.attributeChangedCallback === 'function' && options.attributeChangedCallback.call(this, name, oldValue, value);
  }

  function define(tagName, CustomElement) {
    var existingCustomElement = customElements.get(tagName);
    return typeof existingCustomElement !== 'undefined' ? existingCustomElement : customElements.define(tagName, CustomElement);
  }

  if (isES2015$1) {
    var CustomElement = function (_CustomElement2) {
      _inherits(CustomElement, _CustomElement2);

      function CustomElement(self) {
        var _ret;

        _classCallCheck(this, CustomElement);

        var _this = _possibleConstructorReturn(this, (CustomElement.__proto__ || Object.getPrototypeOf(CustomElement)).call(this));

        var me = self ? HTMLElement.call(self) : _this;

        constructorCallback.call(me);
        return _ret = me, _possibleConstructorReturn(_this, _ret);
      }

      _createClass(CustomElement, null, [{
        key: 'observedAttributes',
        get: function get() {
          return options.observedAttributes || [];
        }
      }]);

      return CustomElement;
    }(_CustomElement);

    CustomElement.prototype.connectedCallback = connectedCallback;
    CustomElement.prototype.disconnectedCallback = disconnectedCallback;
    CustomElement.prototype.attributeChangedCallback = attributeChangedCallback;

    define(tag, CustomElement);
    return CustomElement;
  } else {
    var _CustomElement3 = function _CustomElement3(self) {
      var me = self ? HTMLElement.call(self) : this;

      constructorCallback.call(me);
      return me;
    };

    _CustomElement3.observedAttributes = options.observedAttributes || [];

    _CustomElement3.prototype = Object.create(HTMLElement.prototype, {
      constructor: {
        configurable: true,
        writable: true,
        value: _CustomElement3
      }
    });

    _CustomElement3.prototype.connectedCallback = connectedCallback;
    _CustomElement3.prototype.disconnectedCallback = disconnectedCallback;
    _CustomElement3.prototype.attributeChangedCallback = attributeChangedCallback;

    define(tag, _CustomElement3);
    return _CustomElement3;
  }
}

var camelizeRE = /-(\w)/g;
var camelize = function camelize(str) {
  return str.replace(camelizeRE, function (_, c) {
    return c ? c.toUpperCase() : '';
  });
};
var hyphenateRE = /([^-])([A-Z])/g;
var hyphenate = function hyphenate(str) {
  return str.replace(hyphenateRE, '$1-$2').replace(hyphenateRE, '$1-$2').toLowerCase();
};

function toArray(list) {
  var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

  var i = list.length - start;
  var ret = new Array(i);
  while (i--) {
    ret[i] = list[i + start];
  }
  return ret;
}

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function convertAttributeValue(value, overrideType) {
  if (value === null || value === undefined) {
    return overrideType === Boolean ? false : undefined;
  }
  var propsValue = value;
  var isBoolean = ['true', 'false'].indexOf(value) > -1;
  var valueParsed = parseFloat(propsValue, 10);
  var isNumber = !isNaN(valueParsed) && isFinite(propsValue) && typeof propsValue === 'string' && !propsValue.match(/^0+[^.]\d*$/g);

  if (overrideType && overrideType !== Boolean && (typeof propsValue === 'undefined' ? 'undefined' : _typeof(propsValue)) !== overrideType) {
    propsValue = overrideType(value);
  } else if (isBoolean || overrideType === Boolean) {
    propsValue = propsValue === '' ? true : propsValue === 'true';
  } else if (isNumber) {
    propsValue = valueParsed;
  }

  return propsValue;
}

function extractProps(collection, props) {
  if (collection && collection.length) {
    collection.forEach(function (prop) {
      var camelCaseProp = camelize(prop);
      props.camelCase.indexOf(camelCaseProp) === -1 && props.camelCase.push(camelCaseProp);
    });
  } else if (collection && (typeof collection === 'undefined' ? 'undefined' : _typeof(collection)) === 'object') {
    for (var prop in collection) {
      var camelCaseProp = camelize(prop);
      props.camelCase.indexOf(camelCaseProp) === -1 && props.camelCase.push(camelCaseProp);

      if (collection[camelCaseProp] && collection[camelCaseProp].type) {
        props.types[prop] = [].concat(collection[camelCaseProp].type)[0];
      }
    }
  }
}

function getProps() {
  var componentDefinition = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var props = {
    camelCase: [],
    hyphenate: [],
    types: {}
  };

  if (componentDefinition.mixins) {
    componentDefinition.mixins.forEach(function (mixin) {
      extractProps(mixin.props, props);
    });
  }

  if (componentDefinition.extends && componentDefinition.extends.props) {
    var parentProps = componentDefinition.extends.props;


    extractProps(parentProps, props);
  }

  extractProps(componentDefinition.props, props);

  props.camelCase.forEach(function (prop) {
    props.hyphenate.push(hyphenate(prop));
  });

  return props;
}

function reactiveProps(element, props) {
  props.camelCase.forEach(function (name, index) {
    Object.defineProperty(element, name, {
      get: function get() {
        return this.__vue_custom_element__[name];
      },
      set: function set(value) {
        if (((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' || typeof value === 'function') && this.__vue_custom_element__) {
          var propName = props.camelCase[index];
          this.__vue_custom_element__[propName] = value;
        } else {
          var type = props.types[props.camelCase[index]];
          this.setAttribute(props.hyphenate[index], convertAttributeValue(value, type));
        }
      }
    });
  });
}

function getPropsData(element, componentDefinition, props) {
  var propsData = componentDefinition.propsData || {};

  props.hyphenate.forEach(function (name, index) {
    var propCamelCase = props.camelCase[index];
    var propValue = element.attributes[name] || element[propCamelCase];

    var type = null;
    if (props.types[propCamelCase]) {
      type = props.types[propCamelCase];
    }

    if (propValue instanceof Attr) {
      propsData[propCamelCase] = convertAttributeValue(propValue.value, type);
    } else if (typeof propValue !== 'undefined') {
      propsData[propCamelCase] = propValue;
    }
  });

  return propsData;
}

function getAttributes(children) {
  var attributes = {};

  toArray(children.attributes).forEach(function (attribute) {
    attributes[attribute.nodeName === 'vue-slot' ? 'slot' : attribute.nodeName] = attribute.nodeValue;
  });

  return attributes;
}

function getChildNodes(element) {
  if (element.childNodes.length) return element.childNodes;
  if (element.content && element.content.childNodes && element.content.childNodes.length) {
    return element.content.childNodes;
  }

  var placeholder = document.createElement('div');

  placeholder.innerHTML = element.innerHTML;

  return placeholder.childNodes;
}

function templateElement(createElement, element, elementOptions) {
  var templateChildren = getChildNodes(element);

  var vueTemplateChildren = toArray(templateChildren).map(function (child) {
    if (child.nodeName === '#text') return child.nodeValue;

    return createElement(child.tagName, {
      attrs: getAttributes(child),
      domProps: {
        innerHTML: child.innerHTML
      }
    });
  });

  elementOptions.slot = element.id;

  return createElement('template', elementOptions, vueTemplateChildren);
}

function getSlots() {
  var children = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var createElement = arguments[1];

  var slots = [];
  toArray(children).forEach(function (child) {
    if (child.nodeName === '#text') {
      if (child.nodeValue.trim()) {
        slots.push(createElement('span', child.nodeValue));
      }
    } else if (child.nodeName !== '#comment') {
      var attributes = getAttributes(child);
      var elementOptions = {
        attrs: attributes,
        domProps: {
          innerHTML: child.innerHTML === '' ? child.innerText : child.innerHTML
        }
      };

      if (attributes.slot) {
        elementOptions.slot = attributes.slot;
        attributes.slot = undefined;
      }

      var slotVueElement = child.tagName === 'TEMPLATE' ? templateElement(createElement, child, elementOptions) : createElement(child.tagName, elementOptions);

      slots.push(slotVueElement);
    }
  });

  return slots;
}

function customEvent(eventName, detail) {
  var params = { bubbles: false, cancelable: false, detail: detail };
  var event = void 0;
  if (typeof window.CustomEvent === 'function') {
    event = new CustomEvent(eventName, params);
  } else {
    event = document.createEvent('CustomEvent');
    event.initCustomEvent(eventName, params.bubbles, params.cancelable, params.detail);
  }
  return event;
}

function customEmit(element, eventName) {
  for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    args[_key - 2] = arguments[_key];
  }

  var event = customEvent(eventName, [].concat(args));
  element.dispatchEvent(event);
}

function createVueInstance(element, Vue, componentDefinition, props, options) {
  if (!element.__vue_custom_element__) {
    var beforeCreate = function beforeCreate() {
      this.$emit = function emit() {
        var _proto__$$emit;

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        customEmit.apply(undefined, [element].concat(args));
        this.__proto__ && (_proto__$$emit = this.__proto__.$emit).call.apply(_proto__$$emit, [this].concat(args));
      };
    };

    var ComponentDefinition = Vue.util.extend({}, componentDefinition);
    var propsData = getPropsData(element, ComponentDefinition, props);
    var vueVersion = Vue.version && parseInt(Vue.version.split('.')[0], 10) || 0;

    ComponentDefinition.beforeCreate = [].concat(ComponentDefinition.beforeCreate || [], beforeCreate);

    if (ComponentDefinition._compiled) {
      var constructorOptions = {};
      var _constructor = ComponentDefinition._Ctor;
      if (_constructor) {
        constructorOptions = Object.keys(_constructor).map(function (key) {
          return _constructor[key];
        })[0].options;
      }
      constructorOptions.beforeCreate = ComponentDefinition.beforeCreate;
    }

    var rootElement = void 0;

    if (vueVersion >= 2) {
      var elementOriginalChildren = element.cloneNode(true).childNodes;
      rootElement = {
        propsData: propsData,
        props: props.camelCase,
        computed: {
          reactiveProps: function reactiveProps$$1() {
            var _this = this;

            var reactivePropsList = {};
            props.camelCase.forEach(function (prop) {
              typeof _this[prop] !== 'undefined' && (reactivePropsList[prop] = _this[prop]);
            });

            return reactivePropsList;
          }
        },
        render: function render(createElement) {
          var data = {
            props: this.reactiveProps
          };

          return createElement(ComponentDefinition, data, getSlots(elementOriginalChildren, createElement));
        }
      };
    } else if (vueVersion === 1) {
      rootElement = ComponentDefinition;
      rootElement.propsData = propsData;
    } else {
      rootElement = ComponentDefinition;
      var propsWithDefault = {};
      Object.keys(propsData).forEach(function (prop) {
        propsWithDefault[prop] = { default: propsData[prop] };
      });
      rootElement.props = propsWithDefault;
    }

    var elementInnerHtml = vueVersion >= 2 ? '<div></div>' : ('<div>' + element.innerHTML + '</div>').replace(/vue-slot=/g, 'slot=');
    if (options.shadow && element.shadowRoot) {
      element.shadowRoot.innerHTML = elementInnerHtml;
      rootElement.el = element.shadowRoot.children[0];
    } else {
      element.innerHTML = elementInnerHtml;
      rootElement.el = element.children[0];
    }

    reactiveProps(element, props);

    if (typeof options.beforeCreateVueInstance === 'function') {
      rootElement = options.beforeCreateVueInstance(rootElement) || rootElement;
    }

    element.__vue_custom_element__ = new Vue(rootElement);
    element.__vue_custom_element_props__ = props;
    element.getVueInstance = function () {
      var vueInstance = element.__vue_custom_element__;
      return vueInstance.$children.length ? vueInstance.$children[0] : vueInstance;
    };

    if (options.shadow && options.shadowCss && element.shadowRoot) {
      var style = document.createElement('style');
      style.type = 'text/css';
      style.appendChild(document.createTextNode(options.shadowCss));

      element.shadowRoot.appendChild(style);
    }
    element.removeAttribute('vce-cloak');
    element.setAttribute('vce-ready', '');
    customEmit(element, 'vce-ready');
  }
}

function install(Vue) {
  Vue.customElement = function vueCustomElement(tag, componentDefinition) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    var isAsyncComponent = typeof componentDefinition === 'function';
    var optionsProps = isAsyncComponent && { props: options.props || [] };
    var props = getProps(isAsyncComponent ? optionsProps : componentDefinition);

    var CustomElement = registerCustomElement(tag, {
      constructorCallback: function constructorCallback() {
        typeof options.constructorCallback === 'function' && options.constructorCallback.call(this);
      },
      connectedCallback: function connectedCallback() {
        var _this = this;

        var asyncComponentPromise = isAsyncComponent && componentDefinition();
        var isAsyncComponentPromise = asyncComponentPromise && asyncComponentPromise.then && typeof asyncComponentPromise.then === 'function';

        typeof options.connectedCallback === 'function' && options.connectedCallback.call(this);

        if (isAsyncComponent && !isAsyncComponentPromise) {
          throw new Error('Async component ' + tag + ' do not returns Promise');
        }
        if (!this.__detached__) {
          if (isAsyncComponentPromise) {
            asyncComponentPromise.then(function (lazyLoadedComponent) {
              var lazyLoadedComponentProps = getProps(lazyLoadedComponent);
              createVueInstance(_this, Vue, lazyLoadedComponent, lazyLoadedComponentProps, options);
              typeof options.vueInstanceCreatedCallback === 'function' && options.vueInstanceCreatedCallback.call(_this);
            });
          } else {
            createVueInstance(this, Vue, componentDefinition, props, options);
            typeof options.vueInstanceCreatedCallback === 'function' && options.vueInstanceCreatedCallback.call(this);
          }
        }

        this.__detached__ = false;
      },
      disconnectedCallback: function disconnectedCallback() {
        var _this2 = this;

        this.__detached__ = true;
        typeof options.disconnectedCallback === 'function' && options.disconnectedCallback.call(this);

        options.destroyTimeout !== null && setTimeout(function () {
          if (_this2.__detached__ && _this2.__vue_custom_element__) {
            _this2.__detached__ = false;
            _this2.__vue_custom_element__.$destroy(true);
            delete _this2.__vue_custom_element__;
            delete _this2.__vue_custom_element_props__;
          }
        }, options.destroyTimeout || 3000);
      },
      attributeChangedCallback: function attributeChangedCallback(name, oldValue, value) {
        if (this.__vue_custom_element__ && typeof value !== 'undefined') {
          var nameCamelCase = camelize(name);
          typeof options.attributeChangedCallback === 'function' && options.attributeChangedCallback.call(this, name, oldValue, value);
          var type = this.__vue_custom_element_props__.types[nameCamelCase];
          this.__vue_custom_element__[nameCamelCase] = convertAttributeValue(value, type);
        }
      },


      observedAttributes: props.hyphenate,

      shadow: !!options.shadow && !!HTMLElement.prototype.attachShadow
    });

    return CustomElement;
  };
}

if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(install);
  if (install.installed) {
    install.installed = false;
  }
}

/* harmony default export */ const vue_custom_element_esm = (install);

;// CONCATENATED MODULE: ./assets/js/index.js



vue_runtime_esm/* default.use */.Z.use(vue_custom_element_esm);
vue_runtime_esm/* default.customElement */.Z.customElement("vue-component", (__webpack_require__(541)/* ["default"] */ .Z));

})();

/******/ })()
;