/**
 * App version: 1.0.0
 * SDK version: 3.1.1
 * CLI version: 2.2.0
 *
 * Generated: Tue, 19 Jan 2021 16:36:24 GMT
 */

var APP_com_metrological_app_myawesomeapp = (function () {
  'use strict';

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 RDK Management
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  const settings = {};
  const subscribers = {};

  const initSettings = (appSettings, platformSettings) => {
    settings['app'] = appSettings;
    settings['platform'] = platformSettings;
    settings['user'] = {};
  };

  const publish = (key, value) => {
    subscribers[key] && subscribers[key].forEach(subscriber => subscriber(value));
  };

  const dotGrab = (obj = {}, key) => {
    const keys = key.split('.');
    for (let i = 0; i < keys.length; i++) {
      obj = obj[keys[i]] = obj[keys[i]] !== undefined ? obj[keys[i]] : {};
    }
    return typeof obj === 'object' ? (Object.keys(obj).length ? obj : undefined) : obj
  };

  var Settings = {
    get(type, key, fallback = undefined) {
      const val = dotGrab(settings[type], key);
      return val !== undefined ? val : fallback
    },
    has(type, key) {
      return !!this.get(type, key)
    },
    set(key, value) {
      settings['user'][key] = value;
      publish(key, value);
    },
    subscribe(key, callback) {
      subscribers[key] = subscribers[key] || [];
      subscribers[key].push(callback);
    },
    unsubscribe(key, callback) {
      if (callback) {
        const index = subscribers[key] && subscribers[key].findIndex(cb => cb === callback);
        index > -1 && subscribers[key].splice(index, 1);
      } else {
        if (key in subscribers) {
          subscribers[key] = [];
        }
      }
    },
    clearSubscribers() {
      for (const key of Object.getOwnPropertyNames(subscribers)) {
        delete subscribers[key];
      }
    },
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 RDK Management
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  const prepLog = (type, args) => {
    const colors = {
      Info: 'green',
      Debug: 'gray',
      Warn: 'orange',
      Error: 'red',
    };

    args = Array.from(args);
    return [
      '%c' + (args.length > 1 && typeof args[0] === 'string' ? args.shift() : type),
      'background-color: ' + colors[type] + '; color: white; padding: 2px 4px; border-radius: 2px',
      args,
    ]
  };

  var Log = {
    info() {
      Settings.get('platform', 'log') && console.log.apply(console, prepLog('Info', arguments));
    },
    debug() {
      Settings.get('platform', 'log') && console.debug.apply(console, prepLog('Debug', arguments));
    },
    error() {
      Settings.get('platform', 'log') && console.error.apply(console, prepLog('Error', arguments));
    },
    warn() {
      Settings.get('platform', 'log') && console.warn.apply(console, prepLog('Warn', arguments));
    },
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 RDK Management
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  let sendMetric = (type, event, params) => {
    Log.info('Sending metric', type, event, params);
  };

  const initMetrics = config => {
    sendMetric = config.sendMetric;
  };

  // available metric per category
  const metrics = {
    app: ['launch', 'loaded', 'ready', 'close'],
    page: ['view', 'leave'],
    user: ['click', 'input'],
    media: [
      'abort',
      'canplay',
      'ended',
      'pause',
      'play',
      // with some videos there occur almost constant suspend events ... should investigate
      // 'suspend',
      'volumechange',
      'waiting',
      'seeking',
      'seeked',
    ],
  };

  // error metric function (added to each category)
  const errorMetric = (type, message, code, visible, params = {}) => {
    params = { params, ...{ message, code, visible } };
    sendMetric(type, 'error', params);
  };

  const Metric = (type, events, options = {}) => {
    return events.reduce(
      (obj, event) => {
        obj[event] = (name, params = {}) => {
          params = { ...options, ...(name ? { name } : {}), ...params };
          sendMetric(type, event, params);
        };
        return obj
      },
      {
        error(message, code, params) {
          errorMetric(type, message, code, params);
        },
        event(name, params) {
          sendMetric(type, name, params);
        },
      }
    )
  };

  const Metrics = types => {
    return Object.keys(types).reduce(
      (obj, type) => {
        // media metric works a bit different!
        // it's a function that accepts a url and returns an object with the available metrics
        // url is automatically passed as a param in every metric
        type === 'media'
          ? (obj[type] = url => Metric(type, types[type], { url }))
          : (obj[type] = Metric(type, types[type]));
        return obj
      },
      { error: errorMetric, event: sendMetric }
    )
  };

  var Metrics$1 = Metrics(metrics);

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 RDK Management
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  var events = {
    abort: 'Abort',
    canplay: 'CanPlay',
    canplaythrough: 'CanPlayThrough',
    durationchange: 'DurationChange',
    emptied: 'Emptied',
    encrypted: 'Encrypted',
    ended: 'Ended',
    error: 'Error',
    interruptbegin: 'InterruptBegin',
    interruptend: 'InterruptEnd',
    loadeddata: 'LoadedData',
    loadedmetadata: 'LoadedMetadata',
    loadstart: 'LoadStart',
    pause: 'Pause',
    play: 'Play',
    playing: 'Playing',
    progress: 'Progress',
    ratechange: 'Ratechange',
    seeked: 'Seeked',
    seeking: 'Seeking',
    stalled: 'Stalled',
    // suspend: 'Suspend', // this one is called a looooot for some videos
    timeupdate: 'TimeUpdate',
    volumechange: 'VolumeChange',
    waiting: 'Waiting',
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 RDK Management
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  var autoSetupMixin = (sourceObject, setup = () => {}) => {
    let ready = false;

    const doSetup = () => {
      if (ready === false) {
        setup();
        ready = true;
      }
    };

    return Object.keys(sourceObject).reduce((obj, key) => {
      if (typeof sourceObject[key] === 'function') {
        obj[key] = function() {
          doSetup();
          return sourceObject[key].apply(sourceObject, arguments)
        };
      } else if (typeof Object.getOwnPropertyDescriptor(sourceObject, key).get === 'function') {
        obj.__defineGetter__(key, function() {
          doSetup();
          return Object.getOwnPropertyDescriptor(sourceObject, key).get.apply(sourceObject)
        });
      } else if (typeof Object.getOwnPropertyDescriptor(sourceObject, key).set === 'function') {
        obj.__defineSetter__(key, function() {
          doSetup();
          return Object.getOwnPropertyDescriptor(sourceObject, key).set.sourceObject[key].apply(
            sourceObject,
            arguments
          )
        });
      } else {
        obj[key] = sourceObject[key];
      }
      return obj
    }, {})
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 RDK Management
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  let timeout = null;

  var easeExecution = (cb, delay) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      cb();
    }, delay);
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 RDK Management
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  let basePath;
  let proxyUrl;

  const initUtils = config => {
    basePath = ensureUrlWithProtocol(makeFullStaticPath(window.location.pathname, config.path || '/'));

    if (config.proxyUrl) {
      proxyUrl = ensureUrlWithProtocol(config.proxyUrl);
    }
  };

  var Utils = {
    asset(relPath) {
      return basePath + relPath
    },
    proxyUrl(url, options = {}) {
      return proxyUrl ? proxyUrl + '?' + makeQueryString(url, options) : url
    },
    makeQueryString() {
      return makeQueryString(...arguments)
    },
    // since imageworkers don't work without protocol
    ensureUrlWithProtocol() {
      return ensureUrlWithProtocol(...arguments)
    },
  };

  const ensureUrlWithProtocol = url => {
    if (/^\/\//.test(url)) {
      return window.location.protocol + url
    }
    if (!/^(?:https?:)/i.test(url)) {
      return window.location.origin + url
    }
    return url
  };

  const makeFullStaticPath = (pathname = '/', path) => {
    // ensure path has traling slash
    path = path.charAt(path.length - 1) !== '/' ? path + '/' : path;

    // if path is URL, we assume it's already the full static path, so we just return it
    if (/^(?:https?:)?(?:\/\/)/.test(path)) {
      return path
    }

    if (path.charAt(0) === '/') {
      return path
    } else {
      // cleanup the pathname (i.e. remove possible index.html)
      pathname = cleanUpPathName(pathname);

      // remove possible leading dot from path
      path = path.charAt(0) === '.' ? path.substr(1) : path;
      // ensure path has leading slash
      path = path.charAt(0) !== '/' ? '/' + path : path;
      return pathname + path
    }
  };

  const cleanUpPathName = pathname => {
    if (pathname.slice(-1) === '/') return pathname.slice(0, -1)
    const parts = pathname.split('/');
    if (parts[parts.length - 1].indexOf('.') > -1) parts.pop();
    return parts.join('/')
  };

  const makeQueryString = (url, options = {}, type = 'url') => {
    // add operator as an option
    options.operator = 'metrological'; // Todo: make this configurable (via url?)
    // add type (= url or qr) as an option, with url as the value
    options[type] = url;

    return Object.keys(options)
      .map(key => {
        return encodeURIComponent(key) + '=' + encodeURIComponent('' + options[key])
      })
      .join('&')
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 RDK Management
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  const formatLocale = locale => {
    if (locale && locale.length === 2) {
      return `${locale.toLowerCase()}-${locale.toUpperCase()}`
    } else {
      return locale
    }
  };

  const getLocale = defaultValue => {
    if ('language' in navigator) {
      const locale = formatLocale(navigator.language);
      return Promise.resolve(locale)
    } else {
      return Promise.resolve(defaultValue)
    }
  };

  const getLanguage = defaultValue => {
    if ('language' in navigator) {
      const language = formatLocale(navigator.language).slice(0, 2);
      return Promise.resolve(language)
    } else {
      return Promise.resolve(defaultValue)
    }
  };

  const getCountryCode = defaultValue => {
    if ('language' in navigator) {
      const countryCode = formatLocale(navigator.language).slice(3, 5);
      return Promise.resolve(countryCode)
    } else {
      return Promise.resolve(defaultValue)
    }
  };

  const hasOrAskForGeoLocationPermission = () => {
    return new Promise(resolve => {
      // force to prompt for location permission
      if (Settings.get('platform', 'forceBrowserGeolocation') === true) resolve(true);
      if ('permissions' in navigator && typeof navigator.permissions.query === 'function') {
        navigator.permissions.query({ name: 'geolocation' }).then(status => {
          resolve(status.state === 'granted' || status.status === 'granted');
        });
      } else {
        resolve(false);
      }
    })
  };

  const getLatLon = defaultValue => {
    return new Promise(resolve => {
      hasOrAskForGeoLocationPermission().then(granted => {
        if (granted === true) {
          if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
              // success
              result =>
                result && result.coords && resolve([result.coords.latitude, result.coords.longitude]),
              // error
              () => resolve(defaultValue),
              // options
              {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0,
              }
            );
          } else {
            return queryForLatLon().then(result => resolve(result || defaultValue))
          }
        } else {
          return queryForLatLon().then(result => resolve(result || defaultValue))
        }
      });
    })
  };

  const queryForLatLon = () => {
    return new Promise(resolve => {
      fetch('https://geolocation-db.com/json/')
        .then(response => response.json())
        .then(({ latitude, longitude }) =>
          latitude && longitude ? resolve([latitude, longitude]) : resolve(false)
        )
        .catch(() => resolve(false));
    })
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 RDK Management
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  const defaultProfile = {
    ageRating: 'adult',
    city: 'New York',
    zipCode: '27505',
    countryCode: () => getCountryCode('US'),
    ip: '127.0.0.1',
    household: 'b2244e9d4c04826ccd5a7b2c2a50e7d4',
    language: () => getLanguage('en'),
    latlon: () => getLatLon([40.7128, 74.006]),
    locale: () => getLocale('en-US'),
    mac: '00:00:00:00:00:00',
    operator: 'Metrological',
    platform: 'Metrological',
    packages: [],
    uid: 'ee6723b8-7ab3-462c-8d93-dbf61227998e',
    stbType: 'Metrological',
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 RDK Management
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  let getInfo = key => {
    const profile = { ...defaultProfile, ...Settings.get('platform', 'profile') };
    return Promise.resolve(typeof profile[key] === 'function' ? profile[key]() : profile[key])
  };

  let setInfo = (key, params) => {
    if (key in defaultProfile) defaultProfile[key] = params;
  };

  const initProfile = config => {
    getInfo = config.getInfo;
    setInfo = config.setInfo;
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 RDK Management
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  var Lightning = window.lng;

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 RDK Management
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  const events$1 = [
    'timeupdate',
    'error',
    'ended',
    'loadeddata',
    'canplay',
    'play',
    'playing',
    'pause',
    'loadstart',
    'seeking',
    'seeked',
    'encrypted',
  ];

  let mediaUrl = url => url;

  const initMediaPlayer = config => {
    if (config.mediaUrl) {
      mediaUrl = config.mediaUrl;
    }
  };

  class Mediaplayer extends Lightning.Component {
    _construct() {
      this._skipRenderToTexture = false;
      this._metrics = null;
      this._textureMode = Settings.get('platform', 'textureMode') || false;
      Log.info('Texture mode: ' + this._textureMode);
      console.warn(
        [
          "The 'MediaPlayer'-plugin in the Lightning-SDK is deprecated and will be removed in future releases.",
          "Please consider using the new 'VideoPlayer'-plugin instead.",
          'https://rdkcentral.github.io/Lightning-SDK/#/plugins/videoplayer',
        ].join('\n\n')
      );
    }

    static _template() {
      return {
        Video: {
          VideoWrap: {
            VideoTexture: {
              visible: false,
              pivot: 0.5,
              texture: { type: Lightning.textures.StaticTexture, options: {} },
            },
          },
        },
      }
    }

    set skipRenderToTexture(v) {
      this._skipRenderToTexture = v;
    }

    get textureMode() {
      return this._textureMode
    }

    get videoView() {
      return this.tag('Video')
    }

    _init() {
      //re-use videotag if already there
      const videoEls = document.getElementsByTagName('video');
      if (videoEls && videoEls.length > 0) this.videoEl = videoEls[0];
      else {
        this.videoEl = document.createElement('video');
        this.videoEl.setAttribute('id', 'video-player');
        this.videoEl.style.position = 'absolute';
        this.videoEl.style.zIndex = '1';
        this.videoEl.style.display = 'none';
        this.videoEl.setAttribute('width', '100%');
        this.videoEl.setAttribute('height', '100%');

        this.videoEl.style.visibility = this.textureMode ? 'hidden' : 'visible';
        document.body.appendChild(this.videoEl);
      }
      if (this.textureMode && !this._skipRenderToTexture) {
        this._createVideoTexture();
      }

      this.eventHandlers = [];
    }

    _registerListeners() {
      events$1.forEach(event => {
        const handler = e => {
          if (this._metrics && this._metrics[event] && typeof this._metrics[event] === 'function') {
            this._metrics[event]({ currentTime: this.videoEl.currentTime });
          }
          this.fire(event, { videoElement: this.videoEl, event: e });
        };
        this.eventHandlers.push(handler);
        this.videoEl.addEventListener(event, handler);
      });
    }

    _deregisterListeners() {
      Log.info('Deregistering event listeners MediaPlayer');
      events$1.forEach((event, index) => {
        this.videoEl.removeEventListener(event, this.eventHandlers[index]);
      });
      this.eventHandlers = [];
    }

    _attach() {
      this._registerListeners();
    }

    _detach() {
      this._deregisterListeners();
      this.close();
    }

    _createVideoTexture() {
      const stage = this.stage;

      const gl = stage.gl;
      const glTexture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, glTexture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      this.videoTexture.options = { source: glTexture, w: this.videoEl.width, h: this.videoEl.height };
    }

    _startUpdatingVideoTexture() {
      if (this.textureMode && !this._skipRenderToTexture) {
        const stage = this.stage;
        if (!this._updateVideoTexture) {
          this._updateVideoTexture = () => {
            if (this.videoTexture.options.source && this.videoEl.videoWidth && this.active) {
              const gl = stage.gl;

              const currentTime = new Date().getTime();

              // When BR2_PACKAGE_GST1_PLUGINS_BAD_PLUGIN_DEBUGUTILS is not set in WPE, webkitDecodedFrameCount will not be available.
              // We'll fallback to fixed 30fps in this case.
              const frameCount = this.videoEl.webkitDecodedFrameCount;

              const mustUpdate = frameCount
                ? this._lastFrame !== frameCount
                : this._lastTime < currentTime - 30;

              if (mustUpdate) {
                this._lastTime = currentTime;
                this._lastFrame = frameCount;
                try {
                  gl.bindTexture(gl.TEXTURE_2D, this.videoTexture.options.source);
                  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
                  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.videoEl);
                  this._lastFrame = this.videoEl.webkitDecodedFrameCount;
                  this.videoTextureView.visible = true;

                  this.videoTexture.options.w = this.videoEl.videoWidth;
                  this.videoTexture.options.h = this.videoEl.videoHeight;
                  const expectedAspectRatio = this.videoTextureView.w / this.videoTextureView.h;
                  const realAspectRatio = this.videoEl.videoWidth / this.videoEl.videoHeight;
                  if (expectedAspectRatio > realAspectRatio) {
                    this.videoTextureView.scaleX = realAspectRatio / expectedAspectRatio;
                    this.videoTextureView.scaleY = 1;
                  } else {
                    this.videoTextureView.scaleY = expectedAspectRatio / realAspectRatio;
                    this.videoTextureView.scaleX = 1;
                  }
                } catch (e) {
                  Log.error('texImage2d video', e);
                  this._stopUpdatingVideoTexture();
                  this.videoTextureView.visible = false;
                }
                this.videoTexture.source.forceRenderUpdate();
              }
            }
          };
        }
        if (!this._updatingVideoTexture) {
          stage.on('frameStart', this._updateVideoTexture);
          this._updatingVideoTexture = true;
        }
      }
    }

    _stopUpdatingVideoTexture() {
      if (this.textureMode) {
        const stage = this.stage;
        stage.removeListener('frameStart', this._updateVideoTexture);
        this._updatingVideoTexture = false;
        this.videoTextureView.visible = false;

        if (this.videoTexture.options.source) {
          const gl = stage.gl;
          gl.bindTexture(gl.TEXTURE_2D, this.videoTexture.options.source);
          gl.clearColor(0, 0, 0, 1);
          gl.clear(gl.COLOR_BUFFER_BIT);
        }
      }
    }

    updateSettings(settings = {}) {
      // The Component that 'consumes' the media player.
      this._consumer = settings.consumer;

      if (this._consumer && this._consumer.getMediaplayerSettings) {
        // Allow consumer to add settings.
        settings = Object.assign(settings, this._consumer.getMediaplayerSettings());
      }

      if (!Lightning.Utils.equalValues(this._stream, settings.stream)) {
        if (settings.stream && settings.stream.keySystem) {
          navigator
            .requestMediaKeySystemAccess(
              settings.stream.keySystem.id,
              settings.stream.keySystem.config
            )
            .then(keySystemAccess => {
              return keySystemAccess.createMediaKeys()
            })
            .then(createdMediaKeys => {
              return this.videoEl.setMediaKeys(createdMediaKeys)
            })
            .then(() => {
              if (settings.stream && settings.stream.src) this.open(settings.stream.src);
            })
            .catch(() => {
              console.error('Failed to set up MediaKeys');
            });
        } else if (settings.stream && settings.stream.src) {
          // This is here to be backwards compatible, will be removed
          // in future sdk release
          if (Settings.get('app', 'hls')) {
            if (!window.Hls) {
              window.Hls = class Hls {
                static isSupported() {
                  console.warn('hls-light not included');
                  return false
                }
              };
            }
            if (window.Hls.isSupported()) {
              if (!this._hls) this._hls = new window.Hls({ liveDurationInfinity: true });
              this._hls.loadSource(settings.stream.src);
              this._hls.attachMedia(this.videoEl);
              this.videoEl.style.display = 'block';
            }
          } else {
            this.open(settings.stream.src);
          }
        } else {
          this.close();
        }
        this._stream = settings.stream;
      }

      this._setHide(settings.hide);
      this._setVideoArea(settings.videoPos);
    }

    _setHide(hide) {
      if (this.textureMode) {
        this.tag('Video').setSmooth('alpha', hide ? 0 : 1);
      } else {
        this.videoEl.style.visibility = hide ? 'hidden' : 'visible';
      }
    }

    open(url, settings = { hide: false, videoPosition: null }) {
      // prep the media url to play depending on platform (mediaPlayerplugin)
      url = mediaUrl(url);
      this._metrics = Metrics$1.media(url);
      Log.info('Playing stream', url);
      if (this.application.noVideo) {
        Log.info('noVideo option set, so ignoring: ' + url);
        return
      }
      // close the video when opening same url as current (effectively reloading)
      if (this.videoEl.getAttribute('src') === url) {
        this.close();
      }
      this.videoEl.setAttribute('src', url);

      // force hide, then force show (in next tick!)
      // (fixes comcast playback rollover issue)
      this.videoEl.style.visibility = 'hidden';
      this.videoEl.style.display = 'none';

      setTimeout(() => {
        this.videoEl.style.display = 'block';
        this.videoEl.style.visibility = 'visible';
      });

      this._setHide(settings.hide);
      this._setVideoArea(settings.videoPosition || [0, 0, 1920, 1080]);
    }

    close() {
      // We need to pause first in order to stop sound.
      this.videoEl.pause();
      this.videoEl.removeAttribute('src');

      // force load to reset everything without errors
      this.videoEl.load();

      this._clearSrc();

      this.videoEl.style.display = 'none';
    }

    playPause() {
      if (this.isPlaying()) {
        this.doPause();
      } else {
        this.doPlay();
      }
    }

    get muted() {
      return this.videoEl.muted
    }

    set muted(v) {
      this.videoEl.muted = v;
    }

    get loop() {
      return this.videoEl.loop
    }

    set loop(v) {
      this.videoEl.loop = v;
    }

    isPlaying() {
      return this._getState() === 'Playing'
    }

    doPlay() {
      this.videoEl.play();
    }

    doPause() {
      this.videoEl.pause();
    }

    reload() {
      var url = this.videoEl.getAttribute('src');
      this.close();
      this.videoEl.src = url;
    }

    getPosition() {
      return Promise.resolve(this.videoEl.currentTime)
    }

    setPosition(pos) {
      this.videoEl.currentTime = pos;
    }

    getDuration() {
      return Promise.resolve(this.videoEl.duration)
    }

    seek(time, absolute = false) {
      if (absolute) {
        this.videoEl.currentTime = time;
      } else {
        this.videoEl.currentTime += time;
      }
    }

    get videoTextureView() {
      return this.tag('Video').tag('VideoTexture')
    }

    get videoTexture() {
      return this.videoTextureView.texture
    }

    _setVideoArea(videoPos) {
      if (Lightning.Utils.equalValues(this._videoPos, videoPos)) {
        return
      }

      this._videoPos = videoPos;

      if (this.textureMode) {
        this.videoTextureView.patch({
          smooth: {
            x: videoPos[0],
            y: videoPos[1],
            w: videoPos[2] - videoPos[0],
            h: videoPos[3] - videoPos[1],
          },
        });
      } else {
        const precision = this.stage.getRenderPrecision();
        this.videoEl.style.left = Math.round(videoPos[0] * precision) + 'px';
        this.videoEl.style.top = Math.round(videoPos[1] * precision) + 'px';
        this.videoEl.style.width = Math.round((videoPos[2] - videoPos[0]) * precision) + 'px';
        this.videoEl.style.height = Math.round((videoPos[3] - videoPos[1]) * precision) + 'px';
      }
    }

    _fireConsumer(event, args) {
      if (this._consumer) {
        this._consumer.fire(event, args);
      }
    }

    _equalInitData(buf1, buf2) {
      if (!buf1 || !buf2) return false
      if (buf1.byteLength != buf2.byteLength) return false
      const dv1 = new Int8Array(buf1);
      const dv2 = new Int8Array(buf2);
      for (let i = 0; i != buf1.byteLength; i++) if (dv1[i] != dv2[i]) return false
      return true
    }

    error(args) {
      this._fireConsumer('$mediaplayerError', args);
      this._setState('');
      return ''
    }

    loadeddata(args) {
      this._fireConsumer('$mediaplayerLoadedData', args);
    }

    play(args) {
      this._fireConsumer('$mediaplayerPlay', args);
    }

    playing(args) {
      this._fireConsumer('$mediaplayerPlaying', args);
      this._setState('Playing');
    }

    canplay(args) {
      this.videoEl.play();
      this._fireConsumer('$mediaplayerStart', args);
    }

    loadstart(args) {
      this._fireConsumer('$mediaplayerLoad', args);
    }

    seeked() {
      this._fireConsumer('$mediaplayerSeeked', {
        currentTime: this.videoEl.currentTime,
        duration: this.videoEl.duration || 1,
      });
    }

    seeking() {
      this._fireConsumer('$mediaplayerSeeking', {
        currentTime: this.videoEl.currentTime,
        duration: this.videoEl.duration || 1,
      });
    }

    durationchange(args) {
      this._fireConsumer('$mediaplayerDurationChange', args);
    }

    encrypted(args) {
      const video = args.videoElement;
      const event = args.event;
      // FIXME: Double encrypted events need to be properly filtered by Gstreamer
      if (video.mediaKeys && !this._equalInitData(this._previousInitData, event.initData)) {
        this._previousInitData = event.initData;
        this._fireConsumer('$mediaplayerEncrypted', args);
      }
    }

    static _states() {
      return [
        class Playing extends this {
          $enter() {
            this._startUpdatingVideoTexture();
          }
          $exit() {
            this._stopUpdatingVideoTexture();
          }
          timeupdate() {
            this._fireConsumer('$mediaplayerProgress', {
              currentTime: this.videoEl.currentTime,
              duration: this.videoEl.duration || 1,
            });
          }
          ended(args) {
            this._fireConsumer('$mediaplayerEnded', args);
            this._setState('');
          }
          pause(args) {
            this._fireConsumer('$mediaplayerPause', args);
            this._setState('Playing.Paused');
          }
          _clearSrc() {
            this._fireConsumer('$mediaplayerStop', {});
            this._setState('');
          }
          static _states() {
            return [class Paused extends this {}]
          }
        },
      ]
    }
  }

  class localCookie{constructor(e){return e=e||{},this.forceCookies=e.forceCookies||!1,!0===this._checkIfLocalStorageWorks()&&!0!==e.forceCookies?{getItem:this._getItemLocalStorage,setItem:this._setItemLocalStorage,removeItem:this._removeItemLocalStorage,clear:this._clearLocalStorage}:{getItem:this._getItemCookie,setItem:this._setItemCookie,removeItem:this._removeItemCookie,clear:this._clearCookies}}_checkIfLocalStorageWorks(){if("undefined"==typeof localStorage)return !1;try{return localStorage.setItem("feature_test","yes"),"yes"===localStorage.getItem("feature_test")&&(localStorage.removeItem("feature_test"),!0)}catch(e){return !1}}_getItemLocalStorage(e){return window.localStorage.getItem(e)}_setItemLocalStorage(e,t){return window.localStorage.setItem(e,t)}_removeItemLocalStorage(e){return window.localStorage.removeItem(e)}_clearLocalStorage(){return window.localStorage.clear()}_getItemCookie(e){var t=document.cookie.match(RegExp("(?:^|;\\s*)"+function(e){return e.replace(/([.*+?\^${}()|\[\]\/\\])/g,"\\$1")}(e)+"=([^;]*)"));return t&&""===t[1]&&(t[1]=null),t?t[1]:null}_setItemCookie(e,t){document.cookie=`${e}=${t}`;}_removeItemCookie(e){document.cookie=`${e}=;Max-Age=-99999999;`;}_clearCookies(){document.cookie.split(";").forEach(e=>{document.cookie=e.replace(/^ +/,"").replace(/=.*/,"=;expires=Max-Age=-99999999");});}}

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 RDK Management
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  let namespace;
  let lc;

  const initStorage = () => {
    namespace = Settings.get('platform', 'appId');
    // todo: pass options (for example to force the use of cookies)
    lc = new localCookie();
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 RDK Management
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  const isFunction = v => {
    return typeof v === 'function'
  };

  const isObject = v => {
    return typeof v === 'object' && v !== null
  };

  const isBoolean = v => {
    return typeof v === 'boolean'
  };

  const isPage = v => {
    if (v instanceof Lightning.Element || isComponentConstructor(v)) {
      return true
    }
    return false
  };

  const isComponentConstructor = type => {
    return type.prototype && 'isComponent' in type.prototype
  };

  const isArray = v => {
    return Array.isArray(v)
  };

  const ucfirst = v => {
    return `${v.charAt(0).toUpperCase()}${v.slice(1)}`
  };

  const isString = v => {
    return typeof v === 'string'
  };

  const isPromise = (method, args) => {
    let result;
    if (isFunction(method)) {
      try {
        result = method.apply(null);
      } catch (e) {
        result = e;
      }
    } else {
      result = method;
    }
    return isObject(result) && isFunction(result.then)
  };

  const getConfigMap = () => {
    const routerSettings = Settings.get('platform', 'router');
    const isObj = isObject(routerSettings);
    return [
      'backtrack',
      'gcOnUnload',
      'destroyOnHistoryBack',
      'lazyCreate',
      'lazyDestroy',
      'reuseInstance',
      'autoRestoreRemote',
      'numberNavigation',
      'updateHash',
    ].reduce((config, key) => {
      config.set(key, isObj ? routerSettings[key] : Settings.get('platform', key));
      return config
    }, new Map())
  };

  const incorrectParams = (cb, route) => {
    const isIncorrect = /^\w*?\s?\(\s?\{.*?\}\s?\)/i;
    if (isIncorrect.test(cb.toString())) {
      console.warn(
        [
          `DEPRECATION: The data-provider for route: ${route} is not correct.`,
          '"page" is no longer a property of the params object but is now the first function parameter: ',
          'https://github.com/rdkcentral/Lightning-SDK/blob/feature/router/docs/plugins/router/dataproviding.md#data-providing',
          "It's supported for now but will be removed in a future release.",
        ].join('\n')
      );
      return true
    }
    return false
  };

  const getQueryStringParams = hash => {
    const getQuery = /([?&].*)/;
    const matches = getQuery.exec(hash);
    const params = {};

    if (matches && matches.length) {
      const urlParams = new URLSearchParams(matches[1]);
      for (const [key, value] of urlParams.entries()) {
        params[key] = value;
      }
      return params
    }
    return false
  };

  const symbols = {
    route: Symbol('route'),
    hash: Symbol('hash'),
    store: Symbol('store'),
    fromHistory: Symbol('fromHistory'),
    expires: Symbol('expires'),
    resume: Symbol('resume'),
    backtrack: Symbol('backtrack'),
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 RDK Management
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  const fade = (i, o) => {
    return new Promise(resolve => {
      i.patch({
        alpha: 0,
        visible: true,
        smooth: {
          alpha: [1, { duration: 0.5, delay: 0.1 }],
        },
      });
      // resolve on y finish
      i.transition('alpha').on('finish', () => {
        if (o) {
          o.visible = false;
        }
        resolve();
      });
    })
  };

  const crossFade = (i, o) => {
    return new Promise(resolve => {
      i.patch({
        alpha: 0,
        visible: true,
        smooth: {
          alpha: [1, { duration: 0.5, delay: 0.1 }],
        },
      });
      if (o) {
        o.patch({
          smooth: {
            alpha: [0, { duration: 0.5, delay: 0.3 }],
          },
        });
      }
      // resolve on y finish
      i.transition('alpha').on('finish', () => {
        resolve();
      });
    })
  };

  const moveOnAxes = (axis, direction, i, o) => {
    const bounds = axis === 'x' ? 1920 : 1080;
    return new Promise(resolve => {
      i.patch({
        [`${axis}`]: direction ? bounds * -1 : bounds,
        visible: true,
        smooth: {
          [`${axis}`]: [0, { duration: 0.4, delay: 0.2 }],
        },
      });
      // out is optional
      if (o) {
        o.patch({
          [`${axis}`]: 0,
          smooth: {
            [`${axis}`]: [direction ? bounds : bounds * -1, { duration: 0.4, delay: 0.2 }],
          },
        });
      }
      // resolve on y finish
      i.transition(axis).on('finish', () => {
        resolve();
      });
    })
  };

  const up = (i, o) => {
    return moveOnAxes('y', 0, i, o)
  };

  const down = (i, o) => {
    return moveOnAxes('y', 1, i, o)
  };

  const left = (i, o) => {
    return moveOnAxes('x', 0, i, o)
  };

  const right = (i, o) => {
    return moveOnAxes('x', 1, i, o)
  };

  var Transitions = {
    fade,
    crossFade,
    up,
    down,
    left,
    right,
  };

  var isMergeableObject = function isMergeableObject(value) {
  	return isNonNullObject(value)
  		&& !isSpecial(value)
  };

  function isNonNullObject(value) {
  	return !!value && typeof value === 'object'
  }

  function isSpecial(value) {
  	var stringValue = Object.prototype.toString.call(value);

  	return stringValue === '[object RegExp]'
  		|| stringValue === '[object Date]'
  		|| isReactElement(value)
  }

  // see https://github.com/facebook/react/blob/b5ac963fb791d1298e7f396236383bc955f916c1/src/isomorphic/classic/element/ReactElement.js#L21-L25
  var canUseSymbol = typeof Symbol === 'function' && Symbol.for;
  var REACT_ELEMENT_TYPE = canUseSymbol ? Symbol.for('react.element') : 0xeac7;

  function isReactElement(value) {
  	return value.$$typeof === REACT_ELEMENT_TYPE
  }

  function emptyTarget(val) {
  	return Array.isArray(val) ? [] : {}
  }

  function cloneUnlessOtherwiseSpecified(value, options) {
  	return (options.clone !== false && options.isMergeableObject(value))
  		? deepmerge(emptyTarget(value), value, options)
  		: value
  }

  function defaultArrayMerge(target, source, options) {
  	return target.concat(source).map(function(element) {
  		return cloneUnlessOtherwiseSpecified(element, options)
  	})
  }

  function getMergeFunction(key, options) {
  	if (!options.customMerge) {
  		return deepmerge
  	}
  	var customMerge = options.customMerge(key);
  	return typeof customMerge === 'function' ? customMerge : deepmerge
  }

  function getEnumerableOwnPropertySymbols(target) {
  	return Object.getOwnPropertySymbols
  		? Object.getOwnPropertySymbols(target).filter(function(symbol) {
  			return target.propertyIsEnumerable(symbol)
  		})
  		: []
  }

  function getKeys(target) {
  	return Object.keys(target).concat(getEnumerableOwnPropertySymbols(target))
  }

  function propertyIsOnObject(object, property) {
  	try {
  		return property in object
  	} catch(_) {
  		return false
  	}
  }

  // Protects from prototype poisoning and unexpected merging up the prototype chain.
  function propertyIsUnsafe(target, key) {
  	return propertyIsOnObject(target, key) // Properties are safe to merge if they don't exist in the target yet,
  		&& !(Object.hasOwnProperty.call(target, key) // unsafe if they exist up the prototype chain,
  			&& Object.propertyIsEnumerable.call(target, key)) // and also unsafe if they're nonenumerable.
  }

  function mergeObject(target, source, options) {
  	var destination = {};
  	if (options.isMergeableObject(target)) {
  		getKeys(target).forEach(function(key) {
  			destination[key] = cloneUnlessOtherwiseSpecified(target[key], options);
  		});
  	}
  	getKeys(source).forEach(function(key) {
  		if (propertyIsUnsafe(target, key)) {
  			return
  		}

  		if (propertyIsOnObject(target, key) && options.isMergeableObject(source[key])) {
  			destination[key] = getMergeFunction(key, options)(target[key], source[key], options);
  		} else {
  			destination[key] = cloneUnlessOtherwiseSpecified(source[key], options);
  		}
  	});
  	return destination
  }

  function deepmerge(target, source, options) {
  	options = options || {};
  	options.arrayMerge = options.arrayMerge || defaultArrayMerge;
  	options.isMergeableObject = options.isMergeableObject || isMergeableObject;
  	// cloneUnlessOtherwiseSpecified is added to `options` so that custom arrayMerge()
  	// implementations can use it. The caller may not replace it.
  	options.cloneUnlessOtherwiseSpecified = cloneUnlessOtherwiseSpecified;

  	var sourceIsArray = Array.isArray(source);
  	var targetIsArray = Array.isArray(target);
  	var sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;

  	if (!sourceAndTargetTypesMatch) {
  		return cloneUnlessOtherwiseSpecified(source, options)
  	} else if (sourceIsArray) {
  		return options.arrayMerge(target, source, options)
  	} else {
  		return mergeObject(target, source, options)
  	}
  }

  deepmerge.all = function deepmergeAll(array, options) {
  	if (!Array.isArray(array)) {
  		throw new Error('first argument should be an array')
  	}

  	return array.reduce(function(prev, next) {
  		return deepmerge(prev, next, options)
  	}, {})
  };

  var deepmerge_1 = deepmerge;

  var cjs = deepmerge_1;

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 RDK Management
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  let warned = false;
  const deprecated = (force = false) => {
    if (force === true || warned === false) {
      console.warn(
        [
          "The 'Locale'-plugin in the Lightning-SDK is deprecated and will be removed in future releases.",
          "Please consider using the new 'Language'-plugin instead.",
          'https://rdkcentral.github.io/Lightning-SDK/#/plugins/language',
        ].join('\n\n')
      );
    }
    warned = true;
  };
  class Locale {
    constructor() {
      this.__enabled = false;
    }

    /**
     * Loads translation object from external json file.
     *
     * @param {String} path Path to resource.
     * @return {Promise}
     */
    async load(path) {
      if (!this.__enabled) {
        return
      }

      await fetch(path)
        .then(resp => resp.json())
        .then(resp => {
          this.loadFromObject(resp);
        });
    }

    /**
     * Sets language used by module.
     *
     * @param {String} lang
     */
    setLanguage(lang) {
      deprecated();
      this.__enabled = true;
      this.language = lang;
    }

    /**
     * Returns reference to translation object for current language.
     *
     * @return {Object}
     */
    get tr() {
      deprecated(true);
      return this.__trObj[this.language]
    }

    /**
     * Loads translation object from existing object (binds existing object).
     *
     * @param {Object} trObj
     */
    loadFromObject(trObj) {
      deprecated();
      const fallbackLanguage = 'en';
      if (Object.keys(trObj).indexOf(this.language) === -1) {
        Log.warn('No translations found for: ' + this.language);
        if (Object.keys(trObj).indexOf(fallbackLanguage) > -1) {
          Log.warn('Using fallback language: ' + fallbackLanguage);
          this.language = fallbackLanguage;
        } else {
          const error = 'No translations found for fallback language: ' + fallbackLanguage;
          Log.error(error);
          throw Error(error)
        }
      }

      this.__trObj = trObj;
      for (const lang of Object.values(this.__trObj)) {
        for (const str of Object.keys(lang)) {
          lang[str] = new LocalizedString(lang[str]);
        }
      }
    }
  }

  /**
   * Extended string class used for localization.
   */
  class LocalizedString extends String {
    /**
     * Returns formatted LocalizedString.
     * Replaces each placeholder value (e.g. {0}, {1}) with corresponding argument.
     *
     * E.g.:
     * > new LocalizedString('{0} and {1} and {0}').format('A', 'B');
     * A and B and A
     *
     * @param  {...any} args List of arguments for placeholders.
     */
    format(...args) {
      const sub = args.reduce((string, arg, index) => string.split(`{${index}}`).join(arg), this);
      return new LocalizedString(sub)
    }
  }

  var Locale$1 = new Locale();

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 RDK Management
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  class VersionLabel extends Lightning.Component {
    static _template() {
      return {
        rect: true,
        color: 0xbb0078ac,
        h: 40,
        w: 100,
        x: w => w - 50,
        y: h => h - 50,
        mount: 1,
        Text: {
          w: w => w,
          h: h => h,
          y: 5,
          x: 20,
          text: {
            fontSize: 22,
            lineHeight: 26,
          },
        },
      }
    }

    _firstActive() {
      this.tag('Text').text = `APP - v${this.version}\nSDK - v${this.sdkVersion}`;
      this.tag('Text').loadTexture();
      this.w = this.tag('Text').renderWidth + 40;
      this.h = this.tag('Text').renderHeight + 5;
    }
  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 RDK Management
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  class FpsIndicator extends Lightning.Component {
    static _template() {
      return {
        rect: true,
        color: 0xffffffff,
        texture: Lightning.Tools.getRoundRect(80, 80, 40),
        h: 80,
        w: 80,
        x: 100,
        y: 100,
        mount: 1,
        Background: {
          x: 3,
          y: 3,
          texture: Lightning.Tools.getRoundRect(72, 72, 36),
          color: 0xff008000,
        },
        Counter: {
          w: w => w,
          h: h => h,
          y: 10,
          text: {
            fontSize: 32,
            textAlign: 'center',
          },
        },
        Text: {
          w: w => w,
          h: h => h,
          y: 48,
          text: {
            fontSize: 15,
            textAlign: 'center',
            text: 'FPS',
          },
        },
      }
    }

    _setup() {
      this.config = {
        ...{
          log: false,
          interval: 500,
          threshold: 1,
        },
        ...Settings.get('platform', 'showFps'),
      };

      this.fps = 0;
      this.lastFps = this.fps - this.config.threshold;

      const fpsCalculator = () => {
        this.fps = ~~(1 / this.stage.dt);
      };
      this.stage.on('frameStart', fpsCalculator);
      this.stage.off('framestart', fpsCalculator);
      this.interval = setInterval(this.showFps.bind(this), this.config.interval);
    }

    _firstActive() {
      this.showFps();
    }

    _detach() {
      clearInterval(this.interval);
    }

    showFps() {
      if (Math.abs(this.lastFps - this.fps) <= this.config.threshold) return
      this.lastFps = this.fps;
      // green
      let bgColor = 0xff008000;
      // orange
      if (this.fps <= 40 && this.fps > 20) bgColor = 0xffffa500;
      // red
      else if (this.fps <= 20) bgColor = 0xffff0000;

      this.tag('Background').setSmooth('color', bgColor);
      this.tag('Counter').text = `${this.fps}`;

      this.config.log && Log.info('FPS', this.fps);
    }
  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 RDK Management
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  let meta = {};
  let translations = {};
  let language = null;

  const initLanguage = (file, language = null) => {
    return new Promise((resolve, reject) => {
      fetch(file)
        .then(response => response.json())
        .then(json => {
          setTranslations(json);
          // set language (directly or in a promise)
          typeof language === 'object' && 'then' in language && typeof language.then === 'function'
            ? language
                .then(lang =>
                  setLanguage(lang)
                    .then(resolve)
                    .catch(reject)
                )
                .catch(e => {
                  Log.error(e);
                  reject(e);
                })
            : setLanguage(language)
                .then(resolve)
                .catch(reject);
        })
        .catch(() => {
          const error = 'Language file ' + file + ' not found';
          Log.error(error);
          reject(error);
        });
    })
  };

  const setTranslations = obj => {
    if ('meta' in obj) {
      meta = { ...obj.meta };
      delete obj.meta;
    }
    translations = obj;
  };

  const setLanguage = lng => {
    language = null;

    return new Promise((resolve, reject) => {
      if (lng in translations) {
        language = lng;
      } else {
        if ('map' in meta && lng in meta.map && meta.map[lng] in translations) {
          language = meta.map[lng];
        } else if ('default' in meta && meta.default in translations) {
          language = meta.default;
          const error =
            'Translations for Language ' +
            language +
            ' not found. Using default language ' +
            meta.default;
          Log.warn(error);
          reject(error);
        } else {
          const error = 'Translations for Language ' + language + ' not found.';
          Log.error(error);
          reject(error);
        }
      }

      if (language) {
        Log.info('Setting language to', language);

        const translationsObj = translations[language];
        if (typeof translationsObj === 'object') {
          resolve();
        } else if (typeof translationsObj === 'string') {
          const url = Utils.asset(translationsObj);

          fetch(url)
            .then(response => response.json())
            .then(json => {
              // save the translations for this language (to prevent loading twice)
              translations[language] = json;
              resolve();
            })
            .catch(e => {
              const error = 'Error while fetching ' + url;
              Log.error(error, e);
              reject(error);
            });
        }
      }
    })
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 RDK Management
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  const registry = {
    eventListeners: [],
    timeouts: [],
    intervals: [],
    targets: [],
  };

  var Registry = {
    // Timeouts
    setTimeout(cb, timeout, ...params) {
      const timeoutId = setTimeout(
        () => {
          registry.timeouts = registry.timeouts.filter(id => id !== timeoutId);
          cb.apply(null, params);
        },
        timeout,
        params
      );
      Log.info('Set Timeout', 'ID: ' + timeoutId);
      registry.timeouts.push(timeoutId);
      return timeoutId
    },

    clearTimeout(timeoutId) {
      if (registry.timeouts.indexOf(timeoutId) > -1) {
        registry.timeouts = registry.timeouts.filter(id => id !== timeoutId);
        Log.info('Clear Timeout', 'ID: ' + timeoutId);
        clearTimeout(timeoutId);
      } else {
        Log.error('Clear Timeout', 'ID ' + timeoutId + ' not found');
      }
    },

    clearTimeouts() {
      registry.timeouts.forEach(timeoutId => {
        this.clearTimeout(timeoutId);
      });
    },

    // Intervals
    setInterval(cb, interval, ...params) {
      const intervalId = setInterval(
        () => {
          registry.intervals = registry.intervals.filter(id => id !== intervalId);
          cb.apply(null, params);
        },
        interval,
        params
      );
      Log.info('Set Interval', 'ID: ' + intervalId);
      registry.intervals.push(intervalId);
      return intervalId
    },

    clearInterval(intervalId) {
      if (registry.intervals.indexOf(intervalId) > -1) {
        registry.intervals = registry.intervals.filter(id => id !== intervalId);
        Log.info('Clear Interval', 'ID: ' + intervalId);
        clearInterval(intervalId);
      } else {
        Log.error('Clear Interval', 'ID ' + intervalId + ' not found');
      }
    },

    clearIntervals() {
      registry.intervals.forEach(intervalId => {
        this.clearInterval(intervalId);
      });
    },

    // Event listeners
    addEventListener(target, event, handler) {
      target.addEventListener(event, handler);
      let targetIndex =
        registry.targets.indexOf(target) > -1
          ? registry.targets.indexOf(target)
          : registry.targets.push(target) - 1;

      registry.eventListeners[targetIndex] = registry.eventListeners[targetIndex] || {};
      registry.eventListeners[targetIndex][event] = registry.eventListeners[targetIndex][event] || [];
      registry.eventListeners[targetIndex][event].push(handler);
      Log.info('Add eventListener', 'Target:', target, 'Event: ' + event, 'Handler:', handler);
    },

    removeEventListener(target, event, handler) {
      const targetIndex = registry.targets.indexOf(target);
      if (
        targetIndex > -1 &&
        registry.eventListeners[targetIndex] &&
        registry.eventListeners[targetIndex][event] &&
        registry.eventListeners[targetIndex][event].indexOf(handler) > -1
      ) {
        registry.eventListeners[targetIndex][event] = registry.eventListeners[targetIndex][
          event
        ].filter(fn => fn !== handler);
        Log.info('Remove eventListener', 'Target:', target, 'Event: ' + event, 'Handler:', handler);
        target.removeEventListener(event, handler);
      } else {
        Log.error(
          'Remove eventListener',
          'Not found',
          'Target',
          target,
          'Event: ' + event,
          'Handler',
          handler
        );
      }
    },

    // if `event` is omitted, removes all registered event listeners for target
    // if `target` is also omitted, removes all registered event listeners
    removeEventListeners(target, event) {
      if (target && event) {
        const targetIndex = registry.targets.indexOf(target);
        if (targetIndex > -1) {
          registry.eventListeners[targetIndex][event].forEach(handler => {
            this.removeEventListener(target, event, handler);
          });
        }
      } else if (target) {
        const targetIndex = registry.targets.indexOf(target);
        if (targetIndex > -1) {
          Object.keys(registry.eventListeners[targetIndex]).forEach(_event => {
            this.removeEventListeners(target, _event);
          });
        }
      } else {
        Object.keys(registry.eventListeners).forEach(targetIndex => {
          this.removeEventListeners(registry.targets[targetIndex]);
        });
      }
    },

    // Clear everything (to be called upon app close for proper cleanup)
    clear() {
      this.clearTimeouts();
      this.clearIntervals();
      this.removeEventListeners();
      registry.eventListeners = [];
      registry.timeouts = [];
      registry.intervals = [];
      registry.targets = [];
    },
  };

  var version = "3.1.1";

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 RDK Management
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  let AppInstance;

  const defaultOptions = {
    stage: { w: 1920, h: 1080, clearColor: 0x00000000, canvas2d: false },
    debug: false,
    defaultFontFace: 'RobotoRegular',
    keys: {
      8: 'Back',
      13: 'Enter',
      27: 'Menu',
      37: 'Left',
      38: 'Up',
      39: 'Right',
      40: 'Down',
      174: 'ChannelDown',
      175: 'ChannelUp',
      178: 'Stop',
      250: 'PlayPause',
      191: 'Search', // Use "/" for keyboard
      409: 'Search',
    },
  };

  if (window.innerHeight === 720) {
    defaultOptions.stage['w'] = 1280;
    defaultOptions.stage['h'] = 720;
    defaultOptions.stage['precision'] = 0.6666666667;
  }

  function Application(App, appData, platformSettings) {
    return class Application extends Lightning.Application {
      constructor(options) {
        const config = cjs(defaultOptions, options);
        super(config);
        this.config = config;
      }

      static _template() {
        return {
          w: 1920,
          h: 1080,
        }
      }

      _setup() {
        Promise.all([
          this.loadFonts((App.config && App.config.fonts) || (App.getFonts && App.getFonts()) || []),
          // to be deprecated
          Locale$1.load((App.config && App.config.locale) || (App.getLocale && App.getLocale())),
          App.language && this.loadLanguage(App.language()),
        ])
          .then(() => {
            Metrics$1.app.loaded();

            AppInstance = this.stage.c({
              ref: 'App',
              type: App,
              zIndex: 1,
              forceZIndexContext: !!platformSettings.showVersion || !!platformSettings.showFps,
            });

            this.childList.a(AppInstance);

            Log.info('App version', this.config.version);
            Log.info('SDK version', version);

            if (platformSettings.showVersion) {
              this.childList.a({
                ref: 'VersionLabel',
                type: VersionLabel,
                version: this.config.version,
                sdkVersion: version,
                zIndex: 1,
              });
            }

            if (platformSettings.showFps) {
              this.childList.a({
                ref: 'FpsCounter',
                type: FpsIndicator,
                zIndex: 1,
              });
            }

            super._setup();
          })
          .catch(console.error);
      }

      _handleBack() {
        this.closeApp();
      }

      _handleExit() {
        this.closeApp();
      }

      closeApp() {
        Log.info('Closing App');

        Settings.clearSubscribers();
        Registry.clear();

        if (platformSettings.onClose && typeof platformSettings.onClose === 'function') {
          platformSettings.onClose(...arguments);
        } else {
          this.close();
        }
      }

      close() {
        Log.info('Closing App');
        this.childList.remove(this.tag('App'));

        // force texture garbage collect
        this.stage.gc();
        this.destroy();
      }

      loadFonts(fonts) {
        return new Promise((resolve, reject) => {
          fonts
            .map(({ family, url, descriptors }) => () => {
              const fontFace = new FontFace(family, 'url(' + url + ')', descriptors || {});
              document.fonts.add(fontFace);
              return fontFace.load()
            })
            .reduce((promise, method) => {
              return promise.then(() => method())
            }, Promise.resolve(null))
            .then(resolve)
            .catch(reject);
        })
      }

      loadLanguage(config) {
        let file = Utils.asset('translations.json');
        let language = null;

        if (typeof config === 'object' && ('file' in config || 'language' in config)) {
          language = config.language || null;
          file = config.file && config.file;
        } else {
          language = config;
        }

        return initLanguage(file, language)
      }

      set focus(v) {
        this._focussed = v;
        this._refocus();
      }

      _getFocused() {
        return this._focussed || this.tag('App')
      }
    }
  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 RDK Management
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  class RoutedApp extends Lightning.Component {
    static _template() {
      return {
        Pages: {
          forceZIndexContext: true,
        },
        /**
         * This is a default Loading page that will be made visible
         * during data-provider on() you CAN override in child-class
         */
        Loading: {
          rect: true,
          w: 1920,
          h: 1080,
          color: 0xff000000,
          visible: false,
          zIndex: 99,
          Label: {
            mount: 0.5,
            x: 960,
            y: 540,
            text: {
              text: 'Loading..',
            },
          },
        },
      }
    }

    static _states() {
      return [
        class Loading extends this {
          $enter() {
            this.tag('Loading').visible = true;
          }

          $exit() {
            this.tag('Loading').visible = false;
          }
        },
        class Widgets extends this {
          $enter(args, widget) {
            // store widget reference
            this._widget = widget;

            // since it's possible that this behaviour
            // is non-remote driven we force a recalculation
            // of the focuspath
            this._refocus();
          }

          _getFocused() {
            // we delegate focus to selected widget
            // so it can consume remotecontrol presses
            return this._widget
          }

          // if we want to widget to widget focus delegation
          reload(widget) {
            this._widget = widget;
            this._refocus();
          }

          _handleKey() {
            restore();
          }
        },
      ]
    }

    /**
     * Return location where pages need to be stored
     */
    get pages() {
      return this.tag('Pages')
    }

    /**
     * Tell router where widgets are stored
     */
    get widgets() {
      return this.tag('Widgets')
    }

    /**
     * we MUST register _handleBack method so the Router
     * can override it
     * @private
     */
    _handleBack() {}

    /**
     * we MUST register _captureKey for dev quick-navigation
     * (via keyboard 1-9)
     */
    _captureKey() {}

    /**
     * We MUST return Router.activePage() so the new Page
     * can listen to the remote-control.
     */
    _getFocused() {
      return getActivePage()
    }
  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 RDK Management
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  const running = new Map();
  const resolved = new Map();
  const expired = new Map();
  const rejected = new Map();
  const active = new Map();

  const send = (hash, key, value) => {
    if (!Settings.get('platform', 'stats')) {
      return
    }
    if (!key && !value) {
      if (!running.has(hash)) {
        running.set(hash, {
          start: Date.now(),
        });
      }
    } else {
      if (running.has(hash)) {
        if (key && value) {
          const payload = running.get(hash);
          payload[key] = value;
        }
      }
    }
    if (key && commands[key]) {
      const command = commands[key];
      if (command) {
        command.call(null, hash);
      }
    }
  };

  const move = (hash, bucket, args) => {
    if (active.has(hash)) {
      const payload = active.get(hash);
      const route = payload.route;

      // we group by route so store
      // the hash in the payload
      payload.hash = hash;

      if (isObject(args)) {
        Object.keys(args).forEach(prop => {
          payload[prop] = args[prop];
        });
      }
      if (bucket.has(route)) {
        const records = bucket.get(route);
        records.push(payload);
        bucket.set(route, records);
      } else {
        // we add by route and group all
        // resolved hashes against that route
        bucket.set(route, [payload]);
      }
      active.delete(hash);
    }
  };

  const commands = {
    ready: hash => {
      if (running.has(hash)) {
        const payload = running.get(hash);
        payload.ready = Date.now();
        active.set(hash, payload);

        running.delete(hash);
      }
    },
    stop: hash => {
      move(hash, resolved, {
        stop: Date.now(),
      });
    },
    error: hash => {
      move(hash, rejected, {
        error: Date.now(),
      });
    },
    expired: hash => {
      move(hash, expired, {
        expired: Date.now,
      });
    },
  };

  const output = (label, bucket) => {
    Log.info(`Output: ${label}`, bucket);
    for (let [route, records] of bucket.entries()) {
      Log.debug(`route: ${route}`, records);
    }
  };

  let getStats = () => {
    output('Resolved', resolved);
    output('Expired', expired);
    output('Rejected', rejected);
    output('Expired', expired);
    output('Still active', active);
    output('Still running', running);
  };

  var stats = {
    send,
    getStats,
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 RDK Management
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  let getHash = () => {
    return document.location.hash
  };

  let setHash = url => {
    document.location.hash = url;
  };

  const initRouter = config => {
    if (config.getHash) {
      getHash = config.getHash;
    }
    if (config.setHash) {
      setHash = config.setHash;
    }
  };

  /*
  rouThor ==[x]
   */

  // instance of Lightning.Application
  let application;

  //instance of Lightning.Component
  let app;

  let stage;
  let widgetsHost;
  let pagesHost;

  const pages = new Map();
  const providers = new Map();
  const modifiers = new Map();
  const widgetsPerRoute = new Map();
  const routeHooks = new Map();

  let register = new Map();
  let routerConfig;

  // widget that has focus
  let activeWidget;
  let rootHash;
  let bootRequest;
  let history = [];
  let initialised = false;
  let activeRoute;
  let activeHash;
  let updateHash = true;
  let forcedHash;
  let lastHash = true;
  let previousState;

  // page that has focus
  let activePage;
  const hasRegex = /\{\/(.*?)\/([igm]{0,3})\}/g;
  const isWildcard = /^[!*$]$/;

  /**
   * Setup Page router
   * @param config - route config object
   * @param instance - instance of the app
   */
  const startRouter = (config, instance) => {
    // backwards compatible
    let { appInstance, routes, provider = () => {}, widgets = () => {} } = config;

    if (instance && isPage(instance)) {
      app = instance;
    }

    if (!app) {
      app = appInstance || AppInstance;
    }

    application = app.application;
    pagesHost = application.childList;
    stage = app.stage;
    routerConfig = getConfigMap();

    // test if required to host pages in a different child
    if (app.pages) {
      pagesHost = app.pages.childList;
    }

    // test if app uses widgets
    if (app.widgets && app.widgets.children) {
      widgetsHost = app.widgets.childList;
      // hide all widgets on boot
      widgetsHost.forEach(w => (w.visible = false));
    }

    // register step back handler
    app._handleBack = e => {
      step(-1);
      e.preventDefault();
    };

    // register step back handler
    app._captureKey = capture.bind(null);

    if (isArray(routes)) {
      setupRoutes(config);
      start();
    } else if (isFunction(routes)) {
      // register route data bindings
      provider();
      // register routes
      routes();
      // register widgets
      widgets();
    }
  };

  const setupRoutes = routesConfig => {
    let bootPage = routesConfig.bootComponent;

    if (!initialised) {
      rootHash = routesConfig.root;
      if (isFunction(routesConfig.boot)) {
        boot(routesConfig.boot);
      }
      if (bootPage && isPage(bootPage)) {
        route('@boot-page', routesConfig.bootComponent);
      }
      if (isBoolean(routesConfig.updateHash)) {
        updateHash = routesConfig.updateHash;
      }
      if (isFunction(routesConfig.beforeEachRoute)) {
        beforeEachRoute = routesConfig.beforeEachRoute;
      }
      initialised = true;
    }

    routesConfig.routes.forEach(r => {
      route(r.path, r.component || r.hook, r.options);
      if (r.widgets) {
        widget(r.path, r.widgets);
      }
      if (isFunction(r.on)) {
        on(r.path, r.on, r.cache || 0);
      }
      if (isFunction(r.before)) {
        before(r.path, r.before, r.cache || 0);
      }
      if (isFunction(r.after)) {
        after(r.path, r.after, r.cache || 0);
      }
      if (isFunction(r.beforeNavigate)) {
        hook(r.path, r.beforeNavigate);
      }
    });
  };

  /**
   * create a new route
   * @param route - {string}
   * @param type - {(Lightning.Component|Function()*)}
   * @param modifiers - {Object{}} - preventStorage | clearHistory | storeLast
   */
  const route = (route, type, config) => {
    route = route.replace(/\/+$/, '');
    // if the route is defined we try to push
    // the new type on to the stack
    if (pages.has(route)) {
      let stack = pages.get(route);
      if (!isArray(stack)) {
        stack = [stack];
      }

      // iterate stack and look if there is page instance
      // attached to the route
      const hasPage = stack.filter(o => isPage(o));
      if (hasPage.length) {
        // only allow multiple functions for route
        if (isFunction(type) && !isPage(type)) {
          stack.push(type);
        } else {
          console.warn(`Page for route('${route}') already exists`);
        }
      } else {
        if (isFunction(type)) {
          stack.push(type);
        } else {
          if (!routerConfig.get('lazyCreate')) {
            type = isComponentConstructor(type) ? create(type) : type;
            pagesHost.a(type);
          }
          stack.push(type);
        }
      }
      pages.set(route, stack);
    } else {
      if (isPage(type)) {
        // if flag lazy eq false we (test) and create
        // correct component and add it to the childList
        if (!routerConfig.get('lazyCreate')) {
          type = isComponentConstructor(type) ? create(type) : type;
          pagesHost.a(type);
        }
      }

      // if lazy we just store the constructor or function
      pages.set(route, [type]);

      // store router modifiers
      if (config) {
        modifiers.set(route, config);
      }
    }
  };

  /**
   * create a route and define it as root.
   * Upon boot we will automatically point browser hash
   * to the defined route
   * @param route - {string}
   * @param type - {(Lightning.Component|Function()*)}
   */
  const root = (url, type, config) => {
    rootHash = url.replace(/\/+$/, '');
    route(url, type, config);
  };

  /**
   * Define the widgets that need to become visible per route
   * @param url
   * @param widgets
   */
  const widget = (url, widgets = []) => {
    if (!widgetsPerRoute.has(url)) {
      if (!isArray(widgets)) {
        widgets = [widgets];
      }
      widgetsPerRoute.set(url, widgets);
    } else {
      console.warn(`Widgets already exist for ${url}`);
    }
  };

  const create = type => {
    const page = stage.c({ type, visible: false });
    // if the app has widgets we make them available
    // as an object on the app instance
    if (widgetsHost) {
      page.widgets = getWidgetReferences();
    }

    return page
  };

  /**
   * The actual loading of the component
   * @param {String} route - the route blueprint, used for data provider look up
   * @param {String} hash - current hash we're routing to
   * */
  const load = async ({ route, hash }) => {
    let expired = false;
    // for now we maintain one instance of the
    // navigation register and create a local copy
    // that we hand over to the loader
    const routeReg = new Map(register);
    try {
      const payload = await loader({ hash, route, routeReg });
      if (payload && payload.hash === lastHash) {
        // in case of on() providing we need to reset
        // app state;
        if (app.state === 'Loading') {
          if (previousState === 'Widgets') {
            app._setState('Widgets', [activeWidget]);
          } else {
            app._setState('');
          }
        }
        // Do page transition if instance
        // is not shared between the routes
        if (!payload.share) {
          await doTransition(payload.page, activePage);
        }
      } else {
        expired = true;
      }
      // on expired we only cleanup
      if (expired) {
        Log.debug('[router]:', `Rejected ${payload.hash} because route to ${lastHash} started`);
        if (payload.create && !payload.share) {
          // remove from render-tree
          pagesHost.remove(payload.page);
        }
      } else {
        onRouteFulfilled(payload, routeReg);
        // resolve promise
        return payload.page
      }
    } catch (payload) {
      if (!expired) {
        if (payload.create && !payload.share) {
          // remove from render-tree
          pagesHost.remove(payload.page);
        }
        handleError(payload);
      }
    }
  };

  const loader = async ({ route, hash, routeReg: register }) => {
    let type = getPageByRoute(route);
    let isConstruct = isComponentConstructor(type);
    let sharedInstance = false;
    let provide = false;
    let page = null;
    let isCreated = false;

    // if it's an instance bt we're not coming back from
    // history we test if we can re-use this instance
    if (!isConstruct && !register.get(symbols.backtrack)) {
      if (!mustReuse(route)) {
        type = type.constructor;
        isConstruct = true;
      }
    }

    // If type is not a constructor
    if (!isConstruct) {
      page = type;
      // if we have have a data route for current page
      if (providers.has(route)) {
        if (isPageExpired(type) || type[symbols.hash] !== hash) {
          provide = true;
        }
      }
      let currentRoute = activePage && activePage[symbols.route];
      // if the new route is equal to the current route it means that both
      // route share the Component instance and stack location / since this case
      // is conflicting with the way before() and after() loading works we flag it,
      // and check platform settings in we want to re-use instance
      if (route === currentRoute) {
        sharedInstance = true;
      }
    } else {
      page = create(type);
      pagesHost.a(page);
      // test if need to request data provider
      if (providers.has(route)) {
        provide = true;
      }
      isCreated = true;
    }

    // we store hash and route as properties on the page instance
    // that way we can easily calculate new behaviour on page reload
    page[symbols.hash] = hash;
    page[symbols.route] = route;

    const payload = {
      page,
      route,
      hash,
      register,
      create: isCreated,
      share: sharedInstance,
      event: [isCreated ? 'mounted' : 'changed'],
    };

    try {
      if (provide) {
        const { type: loadType } = providers.get(route);
        // update payload
        payload.loadType = loadType;

        // update statistics
        send$1(hash, `${loadType}-start`, Date.now());
        await triggers[sharedInstance ? 'shared' : loadType](payload);
        send$1(hash, `${loadType}-end`, Date.now());

        if (hash !== lastHash) {
          return false
        } else {
          emit(page, 'dataProvided');
          // resolve promise
          return payload
        }
      } else {
        addPersistData(payload);
        return payload
      }
    } catch (e) {
      payload.error = e;
      return Promise.reject(payload)
    }
  };

  /**
   * Will be called when a new navigate() request has completed
   * and has not been expired due to it's async nature
   * @param page
   * @param route
   * @param event
   * @param hash
   * @param register
   */
  const onRouteFulfilled = ({ page, route, event, hash, share }, register) => {
    // clean up history if modifier is set
    if (hashmod(hash, 'clearHistory')) {
      history.length = 0;
    } else if (activeHash && !isWildcard.test(route)) {
      updateHistory(activeHash);
    }

    // we only update the stackLocation if a route
    // is not expired before it resolves
    const location = getPageStackLocation(route);

    if (!isNaN(location)) {
      let stack = pages.get(route);
      stack[location] = page;
      pages.set(route, stack);
    }

    if (event) {
      emit(page, event);
    }

    // only update widgets if we have a host
    if (widgetsHost) {
      updateWidgets(page);
    }

    // force refocus of the app
    app._refocus();

    // we want to clean up if there is an
    // active page that is not being shared
    // between current and previous route
    if (activePage && !share) {
      cleanUp(activePage, activePage[symbols.route], register);
    }

    // flag this navigation cycle as ready
    send$1(hash, 'ready');

    activePage = page;
    activeRoute = route;
    activeHash = hash;

    Log.info('[route]:', route);
    Log.info('[hash]:', hash);
  };

  const triggerAfter = args => {
    // after() we execute the provider
    // and resolve immediately
    try {
      execProvider(args);
    } catch (e) {
      // we fail silently
    }
    return Promise.resolve()
  };

  const triggerBefore = args => {
    // before() we continue only when data resolved
    return execProvider(args)
  };

  const triggerOn = args => {
    // on() we need to place the app in
    // a Loading state and recover from it
    // on resolve
    previousState = app.state || '';
    app._setState('Loading');
    return execProvider(args)
  };

  const triggerShared = args => {
    return execProvider(args)
  };

  const triggers = {
    on: triggerOn,
    after: triggerAfter,
    before: triggerBefore,
    shared: triggerShared,
  };

  const hook = (route, handler) => {
    if (!routeHooks.has(route)) {
      routeHooks.set(route, handler);
    }
  };

  const emit = (page, events = [], params = {}) => {
    if (!isArray(events)) {
      events = [events];
    }
    events.forEach(e => {
      const event = `_on${ucfirst(e)}`;
      if (isFunction(page[event])) {
        page[event](params);
      }
    });
  };

  const send$1 = (hash, key, value) => {
    stats.send(hash, key, value);
  };

  const handleError = args => {
    if (!args.page) {
      console.error(args);
    } else {
      const hash = args.page[symbols.hash];
      // flag this navigation cycle as rejected
      send$1(hash, 'e', args.error);
      // force expire
      args.page[symbols.expires] = Date.now();
      if (pages.has('!')) {
        load({ route: '!', hash }).then(errorPage => {
          errorPage.error = { page: args.page, error: args.error };
          // on() loading type will force the app to go
          // in a loading state so on error we need to
          // go back to root state
          if (app.state === 'Loading') {
            app._setState('');
          }
          // make sure we delegate focus to the error page
          if (activePage !== errorPage) {
            activePage = errorPage;
            app._refocus();
          }
        });
      } else {
        Log.error(args.page, args.error);
      }
    }
  };

  const updateHistory = hash => {
    const storeHash = getMod(hash, 'store');
    const regStore = register.get(symbols.store);
    let configPrevent = hashmod(hash, 'preventStorage');
    let configStore = true;

    if ((isBoolean(storeHash) && storeHash === false) || configPrevent) {
      configStore = false;
    }

    if (regStore && configStore) {
      const toStore = hash.replace(/^\//, '');
      const location = history.indexOf(toStore);
      // store hash if it's not a part of history or flag for
      // storage of same hash is true
      if (location === -1 || routerConfig.get('storeSameHash')) {
        history.push(toStore);
      } else {
        // if we visit the same route we want to sync history
        history.push(history.splice(location, 1)[0]);
      }
    }
  };

  const mustReuse = route => {
    const mod = routemod(route, 'reuseInstance');
    const config = routerConfig.get('reuseInstance');

    // route always has final decision
    if (isBoolean(mod)) {
      return mod
    }
    return !(isBoolean(config) && config === false)
  };

  const boot = cb => {
    bootRequest = cb;
  };

  const addPersistData = ({ page, route, hash, register = new Map() }) => {
    const urlValues = getValuesFromHash(hash, route);
    const pageData = new Map([...urlValues, ...register]);
    const params = {};

    // make dynamic url data available to the page
    // as instance properties
    for (let [name, value] of pageData) {
      page[name] = value;
      params[name] = value;
    }

    // check navigation register for persistent data
    if (register.size) {
      const obj = {};
      for (let [k, v] of register) {
        obj[k] = v;
      }
      page.persist = obj;
    }

    // make url data and persist data available
    // via params property
    page.params = params;
    emit(page, ['urlParams'], params);

    return params
  };

  const execProvider = args => {
    const { cb, expires } = providers.get(args.route);
    const params = addPersistData(args);
    /**
     * In the first version of the Router, a reference to the page is made
     * available to the callback function as property of {params}.
     * Since this is error prone (named url parts are also being spread inside this object)
     * we made the page reference the first parameter and url values the second.
     * -
     * We keep it backwards compatible for now but a warning is showed in the console.
     */
    if (incorrectParams(cb, args.route)) {
      // keep page as params property backwards compatible for now
      return cb({ page: args.page, ...params }).then(() => {
        args.page[symbols.expires] = Date.now() + expires;
      })
    } else {
      return cb(args.page, { ...params }).then(() => {
        args.page[symbols.expires] = Date.now() + expires;
      })
    }
  };

  /**
   * execute transition between new / old page and
   * toggle the defined widgets
   * @todo: platform override default transition
   * @param pageIn
   * @param pageOut
   */
  const doTransition = (pageIn, pageOut = null) => {
    let transition = pageIn.pageTransition || pageIn.easing;

    const hasCustomTransitions = !!(pageIn.smoothIn || pageIn.smoothInOut || transition);
    const transitionsDisabled = routerConfig.get('disableTransitions');

    if (pageIn.easing) {
      console.warn('easing() method is deprecated and will be removed. Use pageTransition()');
    }
    // default behaviour is a visibility toggle
    if (!hasCustomTransitions || transitionsDisabled) {
      pageIn.visible = true;
      if (pageOut) {
        pageOut.visible = false;
      }
      return Promise.resolve()
    }

    if (transition) {
      let type;
      try {
        type = transition.call(pageIn, pageIn, pageOut);
      } catch (e) {
        type = 'crossFade';
      }

      if (isPromise(type)) {
        return type
      }

      if (isString(type)) {
        const fn = Transitions[type];
        if (fn) {
          return fn(pageIn, pageOut)
        }
      }

      // keep backwards compatible for now
      if (pageIn.smoothIn) {
        // provide a smooth function that resolves itself
        // on transition finish
        const smooth = (p, v, args = {}) => {
          return new Promise(resolve => {
            pageIn.visible = true;
            pageIn.setSmooth(p, v, args);
            pageIn.transition(p).on('finish', () => {
              resolve();
            });
          })
        };
        return pageIn.smoothIn({ pageIn, smooth })
      }
    }

    return Transitions.crossFade(pageIn, pageOut)
  };

  /**
   * update the visibility of the available widgets
   * for the current page / route
   * @param page
   */
  const updateWidgets = page => {
    const route = page[symbols.route];

    // force lowercase lookup
    const configured = (widgetsPerRoute.get(route) || []).map(ref => ref.toLowerCase());

    widgetsHost.forEach(widget => {
      widget.visible = configured.indexOf(widget.ref.toLowerCase()) !== -1;
      if (widget.visible) {
        emit(widget, ['activated'], page);
      }
    });
    if (app.state === 'Widgets' && activeWidget && !activeWidget.visible) {
      app._setState('');
    }
  };

  const cleanUp = (page, route, register) => {
    const lazyDestroy = routerConfig.get('lazyDestroy');
    const destroyOnBack = routerConfig.get('destroyOnHistoryBack');
    const keepAlive = read('keepAlive', register);
    const isFromHistory = read(symbols.backtrack, register);
    let doCleanup = false;

    if (isFromHistory && (destroyOnBack || lazyDestroy)) {
      doCleanup = true;
    } else if (lazyDestroy && !keepAlive) {
      doCleanup = true;
    }

    if (doCleanup) {
      // in lazy create mode we store constructor
      // and remove the actual page from host
      const stack = pages.get(route);
      const location = getPageStackLocation(route);

      // grab original class constructor if statemachine routed
      // else store constructor
      stack[location] = page._routedType || page.constructor;
      pages.set(route, stack);

      // actual remove of page from memory
      pagesHost.remove(page);

      // force texture gc() if configured
      // so we can cleanup textures in the same tick
      if (routerConfig.get('gcOnUnload')) {
        stage.gc();
      }
    } else {
      // If we're not removing the page we need to
      // reset it's properties
      page.patch({
        x: 0,
        y: 0,
        scale: 1,
        alpha: 1,
        visible: false,
      });
    }
    send$1(page[symbols.hash], 'stop');
  };

  /**
   * Test if page passed cache-time
   * @param page
   * @returns {boolean}
   */
  const isPageExpired = page => {
    if (!page[symbols.expires]) {
      return false
    }

    const expires = page[symbols.expires];
    const now = Date.now();

    return now >= expires
  };

  const getPageByRoute = route => {
    return getPageFromStack(route).item
  };

  /**
   * Returns the current location of a page constructor or
   * page instance for a route
   * @param route
   */
  const getPageStackLocation = route => {
    return getPageFromStack(route).index
  };

  const getPageFromStack = route => {
    if (!pages.has(route)) {
      return false
    }

    let index = -1;
    let item = null;
    let stack = pages.get(route);
    if (!Array.isArray(stack)) {
      stack = [stack];
    }

    for (let i = 0, j = stack.length; i < j; i++) {
      if (isPage(stack[i])) {
        index = i;
        item = stack[i];
        break
      }
    }

    return { index, item }
  };

  /**
   * Simple route length calculation
   * @param route {string}
   * @returns {number} - floor
   */
  const getFloor = route => {
    return stripRegex(route).split('/').length
  };

  /**
   * Test if a route is part regular expressed
   * and replace it for a simple character
   * @param route
   * @returns {*}
   */
  const stripRegex = (route, char = 'R') => {
    // if route is part regular expressed we replace
    // the regular expression for a character to
    // simplify floor calculation and backtracking
    if (hasRegex.test(route)) {
      route = route.replace(hasRegex, char);
    }
    return route
  };

  /**
   * return all stored routes that live on the same floor
   * @param floor
   * @returns {Array}
   */
  const getRoutesByFloor = floor => {
    const matches = [];
    // simple filter of level candidates
    for (let [route] of pages.entries()) {
      if (getFloor(route) === floor) {
        matches.push(route);
      }
    }
    return matches
  };

  /**
   * return a matching route by provided hash
   * hash: home/browse/12 will match:
   * route: home/browse/:categoryId
   * @param hash {string}
   * @returns {string|boolean} - route
   */
  const getRouteByHash = hash => {
    const getUrlParts = /(\/?:?[@\w%\s:-]+)/g;
    // grab possible candidates from stored routes
    const candidates = getRoutesByFloor(getFloor(hash));
    // break hash down in chunks
    const hashParts = hash.match(getUrlParts) || [];
    // test if the part of the hash has a replace
    // regex lookup id
    const hasLookupId = /\/:\w+?@@([0-9]+?)@@/;
    const isNamedGroup = /^\/:/;

    // to simplify the route matching and prevent look around
    // in our getUrlParts regex we get the regex part from
    // route candidate and store them so that we can reference
    // them when we perform the actual regex against hash
    let regexStore = [];

    let matches = candidates.filter(route => {
      let isMatching = true;

      if (isWildcard.test(route)) {
        return false
      }

      // replace regex in route with lookup id => @@{storeId}@@
      if (hasRegex.test(route)) {
        const regMatches = route.match(hasRegex);
        if (regMatches && regMatches.length) {
          route = regMatches.reduce((fullRoute, regex) => {
            const lookupId = regexStore.length;
            fullRoute = fullRoute.replace(regex, `@@${lookupId}@@`);
            regexStore.push(regex.substring(1, regex.length - 1));
            return fullRoute
          }, route);
        }
      }

      const routeParts = route.match(getUrlParts) || [];

      for (let i = 0, j = routeParts.length; i < j; i++) {
        const routePart = routeParts[i];
        const hashPart = hashParts[i];

        // Since we support catch-all and regex driven name groups
        // we first test for regex lookup id and see if the regex
        // matches the value from the hash
        if (hasLookupId.test(routePart)) {
          const routeMatches = hasLookupId.exec(routePart);
          const storeId = routeMatches[1];
          const routeRegex = regexStore[storeId];

          // split regex and modifiers so we can use both
          // to create a new RegExp
          // eslint-disable-next-line
          const regMatches = /\/([^\/]+)\/([igm]{0,3})/.exec(routeRegex);

          if (regMatches && regMatches.length) {
            const expression = regMatches[1];
            const modifiers = regMatches[2];

            const regex = new RegExp(`^/${expression}$`, modifiers);

            if (!regex.test(hashPart)) {
              isMatching = false;
            }
          }
        } else if (isNamedGroup.test(routePart)) {
          // we kindly skip namedGroups because this is dynamic
          // we only need to the static and regex drive parts
          continue
        } else if (hashPart && routePart.toLowerCase() !== hashPart.toLowerCase()) {
          isMatching = false;
        }
      }
      return isMatching
    });

    if (matches.length) {
      // we give prio to static routes over dynamic
      matches = matches.sort(a => {
        return isNamedGroup.test(a) ? -1 : 1
      });
      return matches[0]
    }

    return false
  };

  /**
   * Extract dynamic values from location hash and return a namedgroup
   * of key (from route) value (from hash) pairs
   * @param hash {string} - the actual location hash
   * @param route {string} - the route as defined in route
   */
  const getValuesFromHash = (hash, route) => {
    // replace the regex definition from the route because
    // we already did the matching part
    route = stripRegex(route, '');

    const getUrlParts = /(\/?:?[\w%\s:-]+)/g;
    const hashParts = hash.match(getUrlParts) || [];
    const routeParts = route.match(getUrlParts) || [];
    const getNamedGroup = /^\/:([\w-]+)\/?/;

    return routeParts.reduce((storage, value, index) => {
      const match = getNamedGroup.exec(value);
      if (match && match.length) {
        storage.set(match[1], decodeURIComponent(hashParts[index].replace(/^\//, '')));
      }
      return storage
    }, new Map())
  };

  /**
   * Will be called before a route starts, can be overridden
   * via routes config
   * @param from - route we came from
   * @param to - route we navigate to
   * @returns {Promise<*>}
   */
  let beforeEachRoute = async (from, to) => {
    return true
  };

  const handleHashChange = async override => {
    const hash = override || getHash();
    const route = getRouteByHash(hash);

    let result = (await beforeEachRoute(activeRoute, route)) || true;

    // test if a local hook is configured for the route
    if (routeHooks.has(route)) {
      const handler = routeHooks.get(route);
      result = (await handler()) || true;
    }

    if (isBoolean(result)) {
      // only if resolve value is explicitly true
      // we continue the current route request
      if (result) {
        return resolveHashChange(hash, route)
      }
    } else if (isString(result)) {
      navigate(result);
    } else if (isObject(result)) {
      navigate(result.path, result.params);
    }
  };

  const resolveHashChange = (hash, route) => {
    // add a new record for page statistics
    send$1(hash);

    // store last requested hash so we can
    // prevent a route that resolved later
    // from displaying itself
    lastHash = hash;

    if (route) {
      // would be strange if this fails but we do check
      if (pages.has(route)) {
        let stored = pages.get(route);
        send$1(hash, 'route', route);

        if (!isArray(stored)) {
          stored = [stored];
        }

        stored.forEach((type, idx, stored) => {
          if (isPage(type)) {
            load({ route, hash }).then(() => {
              app._refocus();
            });
          } else if (isPromise(type)) {
            type()
              .then(contents => {
                return contents.default
              })
              .then(module => {
                // flag dynamic as loaded
                stored[idx] = module;

                return load({ route, hash })
              })
              .then(() => {
                app._refocus();
              });
          } else {
            const urlParams = getValuesFromHash(hash, route);
            const params = {};
            for (const key of urlParams.keys()) {
              params[key] = urlParams.get(key);
            }

            // invoke
            type.call(null, app, { ...params });
          }
        });
      }
    } else {
      if (pages.has('*')) {
        load({ route: '*', hash }).then(() => {
          app._refocus();
        });
      }
    }
  };

  const getMod = (hash, key) => {
    const config = modifiers.get(getRouteByHash(hash));
    if (isObject(config)) {
      return config[key]
    }
  };

  const hashmod = (hash, key) => {
    return routemod(getRouteByHash(hash), key)
  };

  const routemod = (route, key) => {
    if (modifiers.has(route)) {
      const config = modifiers.get(route);
      return config[key]
    }
  };

  const read = (flag, register) => {
    if (register.has(flag)) {
      return register.get(flag)
    }
    return false
  };

  const createRegister = flags => {
    const reg = new Map()
    // store user defined and router
    // defined flags in register
    ;[...Object.keys(flags), ...Object.getOwnPropertySymbols(flags)].forEach(key => {
      reg.set(key, flags[key]);
    });
    return reg
  };

  const navigate = (url, args, store = true) => {
    let hash = getHash();

    // for now we use one register instance and create a local
    // copy for the loader
    register.clear();

    if (!mustUpdateHash() && forcedHash) {
      hash = forcedHash;
    }

    if (isObject(args)) {
      register = createRegister(args);
    } else if (isBoolean(args) && !args) {
      // if explicit set to false we don't want
      // to store the route
      store = args;
    }

    // we only store complete routes, so we set
    // a special register flag
    register.set(symbols.store, store);

    if (hash.replace(/^#/, '') !== url) {
      if (!mustUpdateHash()) {
        forcedHash = url;
        handleHashChange(url);
      } else {
        setHash(url);
      }
    } else if (read('reload', register)) {
      handleHashChange(hash);
    }
  };

  /**
   * Directional step in history
   * @param direction
   */
  const step = (direction = 0) => {
    if (!direction) {
      return false
    }

    // is we still have routes in our history
    // we splice the last of and navigate to that route
    if (history.length) {
      // for now we only support history back
      const route = history.splice(history.length - 1, 1);
      return navigate(route[0], { [symbols.backtrack]: true }, false)
    } else if (routerConfig.get('backtrack')) {
      const hashLastPart = /(\/:?[\w%\s-]+)$/;
      let hash = stripRegex(getHash());
      let floor = getFloor(hash);

      // test if we got deeplinked
      if (floor > 1) {
        while (floor--) {
          // strip of last part
          hash = hash.replace(hashLastPart, '');
          // if we have a configured route
          // we navigate to it
          if (getRouteByHash(hash)) {
            return navigate(hash, { [symbols.backtrack]: true }, false)
          }
        }
      }
    }

    if (isFunction(app._handleAppClose)) {
      return app._handleAppClose()
    }

    return false
  };

  const capture = ({ key }) => {
    // in Loading state we want to stop propagation
    // by returning undefined
    if (app.state === 'Loading') {
      return
    }

    // if not set we want to continue propagation
    // by explicitly returning false
    if (!routerConfig.get('numberNavigation')) {
      return false
    }
    key = parseInt(key);
    if (!isNaN(key)) {
      let match;
      let idx = 1;
      for (let route of pages.keys()) {
        if (idx === key) {
          match = route;
          break
        } else {
          idx++;
        }
      }
      if (match) {
        navigate(match);
      }
    }
    return false
  };

  // start translating url
  const start = () => {
    const bootKey = '@boot-page';
    const hasBootPage = pages.has('@boot-page');
    const hash = getHash();
    const params = getQueryStringParams(hash);

    // if we refreshed the boot-page we don't want to
    // redirect to this page so we force rootHash load
    const isDirectLoad = hash.indexOf(bootKey) !== -1;
    const ready = () => {
      if (hasBootPage) {
        navigate('@boot-page', {
          [symbols.resume]: isDirectLoad ? rootHash : hash || rootHash,
          reload: true,
        });
      } else if (!hash && rootHash) {
        if (isString(rootHash)) {
          navigate(rootHash);
        } else if (isFunction(rootHash)) {
          rootHash().then(url => {
            navigate(url);
          });
        }
      } else {
        handleHashChange();
      }
    };
    if (isFunction(bootRequest)) {
      bootRequest(params).then(() => {
        ready();
      });
    } else {
      ready();
    }
  };

  /**
   * Data binding to a route will invoke a loading screen
   * @param {String} route - the route
   * @param {Function} cb - must return a promise
   * @param {Number} expires - seconds after first time active that data expires
   * @param {String} type - page loading type
   */
  const on = (route, cb, expires = 0, type = 'on') => {
    if (providers.has(route)) {
      console.warn(`provider for ${route} already exists`);
    } else {
      providers.set(route, {
        cb,
        expires: expires * 1000,
        type,
      });
    }
  };

  /**
   * Request data binding for a route before
   * the page loads (active page will stay visible)
   * @param route
   * @param cb
   * @param expires
   */
  const before = (route, cb, expires = 0) => {
    on(route, cb, expires, 'before');
  };

  /**
   * Request data binding for a route after the page has
   * been loaded
   * @param route
   * @param cb
   * @param expires
   */
  const after = (route, cb, expires = 0) => {
    on(route, cb, expires, 'after');
  };

  const getWidgetReferences = () => {
    return widgetsHost.get().reduce((storage, widget) => {
      const key = widget.ref.toLowerCase();
      storage[key] = widget;
      return storage
    }, {})
  };

  const getWidgetByName = name => {
    name = ucfirst(name);
    return widgetsHost.getByRef(name) || false
  };

  /**
   * delegate app focus to a on-screen widget
   * @param name - {string}
   */
  const focusWidget = name => {
    const widget = getWidgetByName(name);
    if (name) {
      // store reference
      activeWidget = widget;
      // somewhat experimental
      if (app.state === 'Widgets') {
        app.reload(activeWidget);
      } else {
        app._setState('Widgets', [activeWidget]);
      }
    }
  };

  const handleRemote = (type, name) => {
    if (type === 'widget') {
      focusWidget(name);
    } else if (type === 'page') {
      restoreFocus();
    }
  };

  /**
   * Resume Router's page loading process after
   * the BootComponent became visible;
   */
  const resume = () => {
    if (register.has(symbols.resume)) {
      const hash = register.get(symbols.resume).replace(/^#+/, '');
      if (getRouteByHash(hash) && hash) {
        navigate(hash, false);
      } else if (rootHash) {
        navigate(rootHash, false);
      }
    }
  };

  const restore = () => {
    if (routerConfig.get('autoRestoreRemote')) {
      handleRemote('page');
    }
  };

  const hash = () => {
    return getHash()
  };

  const mustUpdateHash = () => {
    // we need support to either turn change hash off
    // per platform or per app
    const updateConfig = routerConfig.get('updateHash');
    return !((isBoolean(updateConfig) && !updateConfig) || (isBoolean(updateHash) && !updateHash))
  };

  const restoreFocus = () => {
    activeWidget = null;
    app._setState('');
  };

  const getActivePage = () => {
    if (activePage && activePage.attached) {
      return activePage
    } else {
      return app
    }
  };

  const getActiveRoute = () => {
    return activeRoute
  };

  const getActiveHash = () => {
    return activeHash
  };

  const getActiveWidget = () => {
    return activeWidget
  };

  // listen to url changes
  window.addEventListener('hashchange', () => {
    handleHashChange();
  });

  // export API
  var Router = {
    startRouter,
    navigate,
    root,
    resume,
    route,
    on,
    before,
    after,
    boot,
    step,
    restoreFocus,
    focusPage: restoreFocus,
    focusWidget,
    handleRemote,
    start,
    add: setupRoutes,
    widget,
    hash,
    getActivePage,
    getActiveWidget,
    getActiveRoute,
    getActiveHash,
    App: RoutedApp,
    restore,
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 RDK Management
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  const defaultChannels = [
    {
      number: 1,
      name: 'Metro News 1',
      description: 'New York Cable News Channel',
      entitled: true,
      program: {
        title: 'The Morning Show',
        description: "New York's best morning show",
        startTime: new Date(new Date() - 60 * 5 * 1000).toUTCString(), // started 5 minutes ago
        duration: 60 * 30, // 30 minutes
        ageRating: 0,
      },
    },
    {
      number: 2,
      name: 'MTV',
      description: 'Music Television',
      entitled: true,
      program: {
        title: 'Beavis and Butthead',
        description: 'American adult animated sitcom created by Mike Judge',
        startTime: new Date(new Date() - 60 * 20 * 1000).toUTCString(), // started 20 minutes ago
        duration: 60 * 45, // 45 minutes
        ageRating: 18,
      },
    },
    {
      number: 3,
      name: 'NBC',
      description: 'NBC TV Network',
      entitled: false,
      program: {
        title: 'The Tonight Show Starring Jimmy Fallon',
        description: 'Late-night talk show hosted by Jimmy Fallon on NBC',
        startTime: new Date(new Date() - 60 * 10 * 1000).toUTCString(), // started 10 minutes ago
        duration: 60 * 60, // 1 hour
        ageRating: 10,
      },
    },
  ];

  const channels = () => Settings.get('platform', 'tv', defaultChannels);

  const randomChannel = () => channels()[~~(channels.length * Math.random())];

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 RDK Management
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  let currentChannel;
  const callbacks = {};

  const emit$1 = (event, ...args) => {
    callbacks[event] &&
      callbacks[event].forEach(cb => {
        cb.apply(null, args);
      });
  };

  // local mock methods
  let methods = {
    getChannel() {
      if (!currentChannel) currentChannel = randomChannel();
      return new Promise((resolve, reject) => {
        if (currentChannel) {
          const channel = { ...currentChannel };
          delete channel.program;
          resolve(channel);
        } else {
          reject('No channel found');
        }
      })
    },
    getProgram() {
      if (!currentChannel) currentChannel = randomChannel();
      return new Promise((resolve, reject) => {
        currentChannel.program ? resolve(currentChannel.program) : reject('No program found');
      })
    },
    setChannel(number) {
      return new Promise((resolve, reject) => {
        if (number) {
          const newChannel = channels().find(c => c.number === number);
          if (newChannel) {
            currentChannel = newChannel;
            const channel = { ...currentChannel };
            delete channel.program;
            emit$1('channelChange', channel);
            resolve(channel);
          } else {
            reject('Channel not found');
          }
        } else {
          reject('No channel number supplied');
        }
      })
    },
  };

  const initTV = config => {
    methods = {};
    if (config.getChannel && typeof config.getChannel === 'function') {
      methods.getChannel = config.getChannel;
    }
    if (config.getProgram && typeof config.getProgram === 'function') {
      methods.getProgram = config.getProgram;
    }
    if (config.setChannel && typeof config.setChannel === 'function') {
      methods.setChannel = config.setChannel;
    }
    if (config.emit && typeof config.emit === 'function') {
      config.emit(emit$1);
    }
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 RDK Management
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  let ApplicationInstance;

  var Launch = (App, appSettings, platformSettings, appData) => {
    initSettings(appSettings, platformSettings);

    initUtils(platformSettings);
    initStorage();

    // Initialize plugins
    if (platformSettings.plugins) {
      platformSettings.plugins.profile && initProfile(platformSettings.plugins.profile);
      platformSettings.plugins.metrics && initMetrics(platformSettings.plugins.metrics);
      platformSettings.plugins.mediaPlayer && initMediaPlayer(platformSettings.plugins.mediaPlayer);
      platformSettings.plugins.mediaPlayer && initVideoPlayer(platformSettings.plugins.mediaPlayer);
      platformSettings.plugins.ads && initAds(platformSettings.plugins.ads);
      platformSettings.plugins.router && initRouter(platformSettings.plugins.router);
      platformSettings.plugins.tv && initTV(platformSettings.plugins.tv);
    }

    const app = Application(App, appData, platformSettings);
    ApplicationInstance = new app(appSettings);
    return ApplicationInstance
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 RDK Management
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  class VideoTexture extends Lightning.Component {
    static _template() {
      return {
        Video: {
          alpha: 1,
          visible: false,
          pivot: 0.5,
          texture: { type: Lightning.textures.StaticTexture, options: {} },
        },
      }
    }

    set videoEl(v) {
      this._videoEl = v;
    }

    get videoEl() {
      return this._videoEl
    }

    get videoView() {
      return this.tag('Video')
    }

    get videoTexture() {
      return this.videoView.texture
    }

    get isVisible() {
      return this.videoView.alpha === 1 && this.videoView.visible === true
    }

    _init() {
      this._createVideoTexture();
    }

    _createVideoTexture() {
      const stage = this.stage;

      const gl = stage.gl;
      const glTexture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, glTexture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      this.videoTexture.options = { source: glTexture, w: this.videoEl.width, h: this.videoEl.height };

      this.videoView.w = this.videoEl.width / this.stage.getRenderPrecision();
      this.videoView.h = this.videoEl.height / this.stage.getRenderPrecision();
    }

    start() {
      const stage = this.stage;
      if (!this._updateVideoTexture) {
        this._updateVideoTexture = () => {
          if (this.videoTexture.options.source && this.videoEl.videoWidth && this.active) {
            const gl = stage.gl;

            const currentTime = new Date().getTime();

            // When BR2_PACKAGE_GST1_PLUGINS_BAD_PLUGIN_DEBUGUTILS is not set in WPE, webkitDecodedFrameCount will not be available.
            // We'll fallback to fixed 30fps in this case.
            const frameCount = this.videoEl.webkitDecodedFrameCount;

            const mustUpdate = frameCount
              ? this._lastFrame !== frameCount
              : this._lastTime < currentTime - 30;

            if (mustUpdate) {
              this._lastTime = currentTime;
              this._lastFrame = frameCount;
              try {
                gl.bindTexture(gl.TEXTURE_2D, this.videoTexture.options.source);
                gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.videoEl);
                this._lastFrame = this.videoEl.webkitDecodedFrameCount;
                this.videoView.visible = true;

                this.videoTexture.options.w = this.videoEl.width;
                this.videoTexture.options.h = this.videoEl.height;
                const expectedAspectRatio = this.videoView.w / this.videoView.h;
                const realAspectRatio = this.videoEl.width / this.videoEl.height;

                if (expectedAspectRatio > realAspectRatio) {
                  this.videoView.scaleX = realAspectRatio / expectedAspectRatio;
                  this.videoView.scaleY = 1;
                } else {
                  this.videoView.scaleY = expectedAspectRatio / realAspectRatio;
                  this.videoView.scaleX = 1;
                }
              } catch (e) {
                Log.error('texImage2d video', e);
                this.stop();
              }
              this.videoTexture.source.forceRenderUpdate();
            }
          }
        };
      }
      if (!this._updatingVideoTexture) {
        stage.on('frameStart', this._updateVideoTexture);
        this._updatingVideoTexture = true;
      }
    }

    stop() {
      const stage = this.stage;
      stage.removeListener('frameStart', this._updateVideoTexture);
      this._updatingVideoTexture = false;
      this.videoView.visible = false;

      if (this.videoTexture.options.source) {
        const gl = stage.gl;
        gl.bindTexture(gl.TEXTURE_2D, this.videoTexture.options.source);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
      }
    }

    position(top, left) {
      this.videoView.patch({
        smooth: {
          x: left,
          y: top,
        },
      });
    }

    size(width, height) {
      this.videoView.patch({
        smooth: {
          w: width,
          h: height,
        },
      });
    }

    show() {
      this.videoView.setSmooth('alpha', 1);
    }

    hide() {
      this.videoView.setSmooth('alpha', 0);
    }
  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 RDK Management
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  let mediaUrl$1 = url => url;
  let videoEl;
  let videoTexture;
  let metrics$1;
  let consumer;
  let precision = 1;
  let textureMode = false;

  const initVideoPlayer = config => {
    if (config.mediaUrl) {
      mediaUrl$1 = config.mediaUrl;
    }
  };

  // todo: add this in a 'Registry' plugin
  // to be able to always clean this up on app close
  let eventHandlers = {};

  const state = {
    adsEnabled: false,
    playing: false,
    _playingAds: false,
    get playingAds() {
      return this._playingAds
    },
    set playingAds(val) {
      if (this._playingAds !== val) {
        this._playingAds = val;
        fireOnConsumer(val === true ? 'AdStart' : 'AdEnd');
      }
    },
    skipTime: false,
    playAfterSeek: null,
  };

  const hooks = {
    play() {
      state.playing = true;
    },
    pause() {
      state.playing = false;
    },
    seeked() {
      state.playAfterSeek === true && videoPlayerPlugin.play();
      state.playAfterSeek = null;
    },
    abort() {
      deregisterEventListeners();
    },
  };

  const withPrecision = val => Math.round(precision * val) + 'px';

  const fireOnConsumer = (event, args) => {
    if (consumer) {
      consumer.fire('$videoPlayer' + event, args);
      consumer.fire('$videoPlayerEvent', event, args);
    }
  };

  const fireHook = (event, args) => {
    hooks[event] && typeof hooks[event] === 'function' && hooks[event].call(null, event, args);
  };

  const setupVideoTag = () => {
    const videoEls = document.getElementsByTagName('video');
    if (videoEls && videoEls.length) {
      return videoEls[0]
    } else {
      const videoEl = document.createElement('video');
      videoEl.setAttribute('id', 'video-player');
      videoEl.setAttribute('width', withPrecision(1920));
      videoEl.setAttribute('height', withPrecision(1080));
      videoEl.setAttribute('crossorigin', 'anonymous');
      videoEl.style.position = 'absolute';
      videoEl.style.zIndex = '1';
      videoEl.style.display = 'none';
      videoEl.style.visibility = 'hidden';
      videoEl.style.top = withPrecision(0);
      videoEl.style.left = withPrecision(0);
      videoEl.style.width = withPrecision(1920);
      videoEl.style.height = withPrecision(1080);
      document.body.appendChild(videoEl);
      return videoEl
    }
  };

  const setUpVideoTexture = () => {
    if (!ApplicationInstance.tag('VideoTexture')) {
      const el = ApplicationInstance.stage.c({
        type: VideoTexture,
        ref: 'VideoTexture',
        zIndex: 0,
        videoEl,
      });
      ApplicationInstance.childList.addAt(el, 0);
    }
    return ApplicationInstance.tag('VideoTexture')
  };

  const registerEventListeners = () => {
    Log.info('VideoPlayer', 'Registering event listeners');
    Object.keys(events).forEach(event => {
      const handler = e => {
        // Fire a metric for each event (if it exists on the metrics object)
        if (metrics$1 && metrics$1[event] && typeof metrics$1[event] === 'function') {
          metrics$1[event]({ currentTime: videoEl.currentTime });
        }
        // fire an internal hook
        fireHook(event, { videoElement: videoEl, event: e });

        // fire the event (with human friendly event name) to the consumer of the VideoPlayer
        fireOnConsumer(events[event], { videoElement: videoEl, event: e });
      };

      eventHandlers[event] = handler;
      videoEl.addEventListener(event, handler);
    });
  };

  const deregisterEventListeners = () => {
    Log.info('VideoPlayer', 'Deregistering event listeners');
    Object.keys(eventHandlers).forEach(event => {
      videoEl.removeEventListener(event, eventHandlers[event]);
    });
    eventHandlers = {};
  };

  const videoPlayerPlugin = {
    consumer(component) {
      consumer = component;
    },

    position(top = 0, left = 0) {
      videoEl.style.left = withPrecision(left);
      videoEl.style.top = withPrecision(top);
      if (textureMode === true) {
        videoTexture.position(top, left);
      }
    },

    size(width = 1920, height = 1080) {
      videoEl.style.width = withPrecision(width);
      videoEl.style.height = withPrecision(height);
      videoEl.width = parseFloat(videoEl.style.width);
      videoEl.height = parseFloat(videoEl.style.height);
      if (textureMode === true) {
        videoTexture.size(width, height);
      }
    },

    area(top = 0, right = 1920, bottom = 1080, left = 0) {
      this.position(top, left);
      this.size(right - left, bottom - top);
    },

    open(url, details = {}) {
      if (!this.canInteract) return
      metrics$1 = Metrics$1.media(url);
      // prep the media url to play depending on platform
      url = mediaUrl$1(url);

      // if url is same as current clear (which is effectively a reload)
      if (this.src == url) {
        this.clear();
      }

      this.hide();
      deregisterEventListeners();

      // preload the video to get duration (for ads)
      //.. currently actually not working because loadedmetadata didn't work reliably on Sky boxes
      videoEl.setAttribute('src', url);
      videoEl.load();

      // const onLoadedMetadata = () => {
      // videoEl.removeEventListener('loadedmetadata', onLoadedMetadata)
      const config = { enabled: state.adsEnabled, duration: 300 }; // this.duration ||
      if (details.videoId) {
        config.caid = details.videoId;
      }
      Ads.get(config, consumer).then(ads => {
        state.playingAds = true;
        ads.prerolls().then(() => {
          state.playingAds = false;
          registerEventListeners();
          if (this.src !== url) {
            videoEl.setAttribute('src', url);
            videoEl.load();
          }
          this.show();
          setTimeout(() => {
            this.play();
          });
        });
      });
      // }

      // videoEl.addEventListener('loadedmetadata', onLoadedMetadata)
    },

    reload() {
      if (!this.canInteract) return
      const url = videoEl.getAttribute('src');
      this.close();
      this.open(url);
    },

    close() {
      Ads.cancel();
      if (state.playingAds) {
        state.playingAds = false;
        Ads.stop();
        // call self in next tick
        setTimeout(() => {
          this.close();
        });
      }
      if (!this.canInteract) return
      this.clear();
      this.hide();
      deregisterEventListeners();
    },

    clear() {
      if (!this.canInteract) return
      // pause the video first to disable sound
      this.pause();
      if (textureMode === true) videoTexture.stop();
      videoEl.removeAttribute('src');
      videoEl.load();
    },

    play() {
      if (!this.canInteract) return
      if (textureMode === true) videoTexture.start();
      videoEl.play();
    },

    pause() {
      if (!this.canInteract) return
      videoEl.pause();
    },

    playPause() {
      if (!this.canInteract) return
      this.playing === true ? this.pause() : this.play();
    },

    mute(muted = true) {
      if (!this.canInteract) return
      videoEl.muted = muted;
    },

    loop(looped = true) {
      videoEl.loop = looped;
    },

    seek(time) {
      if (!this.canInteract) return
      if (!this.src) return
      // define whether should continue to play after seek is complete (in seeked hook)
      if (state.playAfterSeek === null) {
        state.playAfterSeek = !!state.playing;
      }
      // pause before actually seeking
      this.pause();
      // currentTime always between 0 and the duration of the video (minus 0.1s to not set to the final frame and stall the video)
      videoEl.currentTime = Math.max(0, Math.min(time, this.duration - 0.1));
    },

    skip(seconds) {
      if (!this.canInteract) return
      if (!this.src) return

      state.skipTime = (state.skipTime || videoEl.currentTime) + seconds;
      easeExecution(() => {
        this.seek(state.skipTime);
        state.skipTime = false;
      }, 300);
    },

    show() {
      if (!this.canInteract) return
      if (textureMode === true) {
        videoTexture.show();
      } else {
        videoEl.style.display = 'block';
        videoEl.style.visibility = 'visible';
      }
    },

    hide() {
      if (!this.canInteract) return
      if (textureMode === true) {
        videoTexture.hide();
      } else {
        videoEl.style.display = 'none';
        videoEl.style.visibility = 'hidden';
      }
    },

    enableAds(enabled = true) {
      state.adsEnabled = enabled;
    },

    /* Public getters */
    get duration() {
      return videoEl && (isNaN(videoEl.duration) ? Infinity : videoEl.duration)
    },

    get currentTime() {
      return videoEl && videoEl.currentTime
    },

    get muted() {
      return videoEl && videoEl.muted
    },

    get looped() {
      return videoEl && videoEl.loop
    },

    get src() {
      return videoEl && videoEl.getAttribute('src')
    },

    get playing() {
      return state.playing
    },

    get playingAds() {
      return state.playingAds
    },

    get canInteract() {
      // todo: perhaps add an extra flag wether we allow interactions (i.e. pauze, mute, etc.) during ad playback
      return state.playingAds === false
    },

    get top() {
      return videoEl && parseFloat(videoEl.style.top)
    },

    get left() {
      return videoEl && parseFloat(videoEl.style.left)
    },

    get bottom() {
      return videoEl && parseFloat(videoEl.style.top - videoEl.style.height)
    },

    get right() {
      return videoEl && parseFloat(videoEl.style.left - videoEl.style.width)
    },

    get width() {
      return videoEl && parseFloat(videoEl.style.width)
    },

    get height() {
      return videoEl && parseFloat(videoEl.style.height)
    },

    get visible() {
      if (textureMode === true) {
        return videoTexture.isVisible
      } else {
        return videoEl && videoEl.style.display === 'block'
      }
    },

    get adsEnabled() {
      return state.adsEnabled
    },

    // prefixed with underscore to indicate 'semi-private'
    // because it's not recommended to interact directly with the video element
    get _videoEl() {
      return videoEl
    },
  };

  var VideoPlayer = autoSetupMixin(videoPlayerPlugin, () => {
    precision =
      ApplicationInstance &&
      ApplicationInstance.stage &&
      ApplicationInstance.stage.getRenderPrecision();

    videoEl = setupVideoTag();

    textureMode = Settings.get('platform', 'textureMode', false);
    if (textureMode === true) {
      videoTexture = setUpVideoTexture();
    }
  });

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 RDK Management
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  let consumer$1;

  let getAds = () => {
    // todo: enable some default ads during development, maybe from the settings.json
    return Promise.resolve({
      prerolls: [],
      midrolls: [],
      postrolls: [],
    })
  };

  const initAds = config => {
    if (config.getAds) {
      getAds = config.getAds;
    }
  };

  const state$1 = {
    active: false,
  };

  const playSlot = (slot = []) => {
    return slot.reduce((promise, ad) => {
      return promise.then(() => {
        return playAd(ad)
      })
    }, Promise.resolve(null))
  };

  const playAd = ad => {
    return new Promise(resolve => {
      if (state$1.active === false) {
        Log.info('Ad', 'Skipping add due to inactive state');
        return resolve()
      }
      // is it safe to rely on videoplayer plugin already created the video tag?
      const videoEl = document.getElementsByTagName('video')[0];
      videoEl.style.display = 'block';
      videoEl.style.visibility = 'visible';
      videoEl.src = mediaUrl$1(ad.url);
      videoEl.load();

      let timeEvents = null;
      let timeout;

      const cleanup = () => {
        // remove all listeners
        Object.keys(handlers).forEach(handler =>
          videoEl.removeEventListener(handler, handlers[handler])
        );
        resolve();
      };
      const handlers = {
        play() {
          Log.info('Ad', 'Play ad', ad.url);
          fireOnConsumer$1('Play', ad);
          sendBeacon(ad.callbacks, 'defaultImpression');
        },
        ended() {
          fireOnConsumer$1('Ended', ad);
          sendBeacon(ad.callbacks, 'complete');
          cleanup();
        },
        timeupdate() {
          if (!timeEvents && videoEl.duration) {
            // calculate when to fire the time based events (now that duration is known)
            timeEvents = {
              firstQuartile: videoEl.duration / 4,
              midPoint: videoEl.duration / 2,
              thirdQuartile: (videoEl.duration / 4) * 3,
            };
            Log.info('Ad', 'Calculated quartiles times', { timeEvents });
          }
          if (
            timeEvents &&
            timeEvents.firstQuartile &&
            videoEl.currentTime >= timeEvents.firstQuartile
          ) {
            fireOnConsumer$1('FirstQuartile', ad);
            delete timeEvents.firstQuartile;
            sendBeacon(ad.callbacks, 'firstQuartile');
          }
          if (timeEvents && timeEvents.midPoint && videoEl.currentTime >= timeEvents.midPoint) {
            fireOnConsumer$1('MidPoint', ad);
            delete timeEvents.midPoint;
            sendBeacon(ad.callbacks, 'midPoint');
          }
          if (
            timeEvents &&
            timeEvents.thirdQuartile &&
            videoEl.currentTime >= timeEvents.thirdQuartile
          ) {
            fireOnConsumer$1('ThirdQuartile', ad);
            delete timeEvents.thirdQuartile;
            sendBeacon(ad.callbacks, 'thirdQuartile');
          }
        },
        stalled() {
          fireOnConsumer$1('Stalled', ad);
          timeout = setTimeout(() => {
            cleanup();
          }, 5000); // make timeout configurable
        },
        canplay() {
          timeout && clearTimeout(timeout);
        },
        error() {
          fireOnConsumer$1('Error', ad);
          cleanup();
        },
        // this doesn't work reliably on sky box, moved logic to timeUpdate event
        // loadedmetadata() {
        //   // calculate when to fire the time based events (now that duration is known)
        //   timeEvents = {
        //     firstQuartile: videoEl.duration / 4,
        //     midPoint: videoEl.duration / 2,
        //     thirdQuartile: (videoEl.duration / 4) * 3,
        //   }
        // },
        abort() {
          cleanup();
        },
        // todo: pause, resume, mute, unmute beacons
      };
      // add all listeners
      Object.keys(handlers).forEach(handler => videoEl.addEventListener(handler, handlers[handler]));

      videoEl.play();
    })
  };

  const sendBeacon = (callbacks, event) => {
    if (callbacks && callbacks[event]) {
      Log.info('Ad', 'Sending beacon', event, callbacks[event]);
      return callbacks[event].reduce((promise, url) => {
        return promise.then(() =>
          fetch(url)
            // always resolve, also in case of a fetch error (so we don't block firing the rest of the beacons for this event)
            // note: for fetch failed http responses don't throw an Error :)
            .then(response => {
              if (response.status === 200) {
                fireOnConsumer$1('Beacon' + event + 'Sent');
              } else {
                fireOnConsumer$1('Beacon' + event + 'Failed' + response.status);
              }
            })
            .catch(() => {
            })
        )
      }, Promise.resolve(null))
    } else {
      Log.info('Ad', 'No callback found for ' + event);
    }
  };

  const fireOnConsumer$1 = (event, args) => {
    if (consumer$1) {
      consumer$1.fire('$ad' + event, args);
      consumer$1.fire('$adEvent', event, args);
    }
  };

  var Ads = {
    get(config, videoPlayerConsumer) {
      if (config.enabled === false) {
        return Promise.resolve({
          prerolls() {
            return Promise.resolve()
          },
        })
      }
      consumer$1 = videoPlayerConsumer;

      return new Promise(resolve => {
        Log.info('Ad', 'Starting session');
        getAds(config).then(ads => {
          Log.info('Ad', 'API result', ads);
          resolve({
            prerolls() {
              if (ads.preroll) {
                state$1.active = true;
                fireOnConsumer$1('PrerollSlotImpression', ads);
                sendBeacon(ads.preroll.callbacks, 'slotImpression');
                return playSlot(ads.preroll.ads).then(() => {
                  fireOnConsumer$1('PrerollSlotEnd', ads);
                  sendBeacon(ads.preroll.callbacks, 'slotEnd');
                  state$1.active = false;
                })
              }
              return Promise.resolve()
            },
            midrolls() {
              return Promise.resolve()
            },
            postrolls() {
              return Promise.resolve()
            },
          });
        });
      })
    },
    cancel() {
      Log.info('Ad', 'Cancel Ad');
      state$1.active = false;
    },
    stop() {
      Log.info('Ad', 'Stop Ad');
      state$1.active = false;
      // fixme: duplication
      const videoEl = document.getElementsByTagName('video')[0];
      videoEl.pause();
      videoEl.removeAttribute('src');
    },
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 RDK Management
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  class ScaledImageTexture extends Lightning.textures.ImageTexture {
    constructor(stage) {
      super(stage);
      this._scalingOptions = undefined;
    }

    set options(options) {
      this.resizeMode = this._scalingOptions = options;
    }

    _getLookupId() {
      return `${this._src}-${this._scalingOptions.type}-${this._scalingOptions.w}-${this._scalingOptions.h}`
    }

    getNonDefaults() {
      const obj = super.getNonDefaults();
      if (this._src) {
        obj.src = this._src;
      }
      return obj
    }
  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 RDK Management
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  class PinInput extends Lightning.Component {
    static _template() {
      return {
        w: 120,
        h: 150,
        rect: true,
        color: 0xff949393,
        alpha: 0.5,
        shader: { type: Lightning.shaders.RoundedRectangle, radius: 10 },
        Nr: {
          w: w => w,
          y: 24,
          text: {
            text: '',
            textColor: 0xff333333,
            fontSize: 80,
            textAlign: 'center',
            verticalAlign: 'middle',
          },
        },
      }
    }

    set index(v) {
      this.x = v * (120 + 24);
    }

    set nr(v) {
      this._timeout && clearTimeout(this._timeout);

      if (v) {
        this.setSmooth('alpha', 1);
      } else {
        this.setSmooth('alpha', 0.5);
      }

      this.tag('Nr').patch({
        text: {
          text: (v && v.toString()) || '',
          fontSize: v === '*' ? 120 : 80,
        },
      });

      if (v && v !== '*') {
        this._timeout = setTimeout(() => {
          this._timeout = null;
          this.nr = '*';
        }, 750);
      }
    }
  }

  class PinDialog extends Lightning.Component {
    static _template() {
      return {
        w: w => w,
        h: h => h,
        rect: true,
        color: 0xdd000000,
        alpha: 0.000001,
        Dialog: {
          w: 648,
          h: 320,
          y: h => (h - 320) / 2,
          x: w => (w - 648) / 2,
          rect: true,
          color: 0xdd333333,
          shader: { type: Lightning.shaders.RoundedRectangle, radius: 10 },
          Info: {
            y: 24,
            x: 48,
            text: { text: 'Please enter your PIN', fontSize: 32 },
          },
          Msg: {
            y: 260,
            x: 48,
            text: { text: '', fontSize: 28, textColor: 0xffffffff },
          },
          Code: {
            x: 48,
            y: 96,
          },
        },
      }
    }

    _init() {
      const children = [];
      for (let i = 0; i < 4; i++) {
        children.push({
          type: PinInput,
          index: i,
        });
      }

      this.tag('Code').children = children;
    }

    get pin() {
      if (!this._pin) this._pin = '';
      return this._pin
    }

    set pin(v) {
      if (v.length <= 4) {
        const maskedPin = new Array(Math.max(v.length - 1, 0)).fill('*', 0, v.length - 1);
        v.length && maskedPin.push(v.length > this._pin.length ? v.slice(-1) : '*');
        for (let i = 0; i < 4; i++) {
          this.tag('Code').children[i].nr = maskedPin[i] || '';
        }
        this._pin = v;
      }
    }

    get msg() {
      if (!this._msg) this._msg = '';
      return this._msg
    }

    set msg(v) {
      this._timeout && clearTimeout(this._timeout);

      this._msg = v;
      if (this._msg) {
        this.tag('Msg').text = this._msg;
        this.tag('Info').setSmooth('alpha', 0.5);
        this.tag('Code').setSmooth('alpha', 0.5);
      } else {
        this.tag('Msg').text = '';
        this.tag('Info').setSmooth('alpha', 1);
        this.tag('Code').setSmooth('alpha', 1);
      }
      this._timeout = setTimeout(() => {
        this.msg = '';
      }, 2000);
    }

    _firstActive() {
      this.setSmooth('alpha', 1);
    }

    _handleKey(event) {
      if (this.msg) {
        this.msg = false;
      } else {
        const val = parseInt(event.key);
        if (val > -1) {
          this.pin += val;
        }
      }
    }

    _handleBack() {
      if (this.msg) {
        this.msg = false;
      } else {
        if (this.pin.length) {
          this.pin = this.pin.slice(0, this.pin.length - 1);
        } else {
          Pin.hide();
          this.resolve(false);
        }
      }
    }

    _handleEnter() {
      if (this.msg) {
        this.msg = false;
      } else {
        Pin.submit(this.pin)
          .then(val => {
            this.msg = 'Unlocking ...';
            setTimeout(() => {
              Pin.hide();
            }, 1000);
            this.resolve(val);
          })
          .catch(e => {
            this.msg = e;
            this.reject(e);
          });
      }
    }
  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 RDK Management
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  // only used during local development
  let unlocked = false;

  let submit = pin => {
    return new Promise((resolve, reject) => {
      if (pin.toString() === Settings.get('platform', 'pin', '0000').toString()) {
        unlocked = true;
        resolve(unlocked);
      } else {
        reject('Incorrect pin');
      }
    })
  };

  let check = () => {
    return new Promise(resolve => {
      resolve(unlocked);
    })
  };

  let pinDialog = null;

  // Public API
  var Pin = {
    show() {
      return new Promise((resolve, reject) => {
        pinDialog = ApplicationInstance.stage.c({
          ref: 'PinDialog',
          type: PinDialog,
          resolve,
          reject,
        });
        ApplicationInstance.childList.a(pinDialog);
        ApplicationInstance.focus = pinDialog;
      })
    },
    hide() {
      ApplicationInstance.focus = null;
      ApplicationInstance.children = ApplicationInstance.children.map(
        child => child !== pinDialog && child
      );
      pinDialog = null;
    },
    submit(pin) {
      return new Promise((resolve, reject) => {
        try {
          submit(pin)
            .then(resolve)
            .catch(reject);
        } catch (e) {
          reject(e);
        }
      })
    },
    unlocked() {
      return new Promise((resolve, reject) => {
        try {
          check()
            .then(resolve)
            .catch(reject);
        } catch (e) {
          reject(e);
        }
      })
    },
    locked() {
      return new Promise((resolve, reject) => {
        try {
          check()
            .then(unlocked => resolve(!!!unlocked))
            .catch(reject);
        } catch (e) {
          reject(e);
        }
      })
    },
  };

  class Splash extends Lightning.Component {
    static getFonts() {
      return [
        { family: "Regular", url: Utils.asset("fonts/Roboto-Regular.ttf") }
      ];
    }

    static _template() {
      return {
        Background: {
          w: 1920,
          h: 1080,
          color: 0xfffbb03b,
          scale: 1.2,
          src: Utils.asset("images/background-new.png"),
          transitions: {
            scale: { duration: 3, timingFunction: "ease-in" }
          }
        },
        Logo: {
          mountX: 0.5,
          mountY: 1,
          x: 800,
          y: 600,
          alpha: 0.01,
          src: Utils.asset("images/logo-large.png"),
          transitions: {
            alpha: { timingFunction: "ease-in", duration: 3, delay: 1.2 },
            y: { timingFunction: "ease-in", duration: 3 }
          }
        },
        Spinner: {
          x: 800,
          y: 720,
          src: Utils.asset("images/spinner.png"),
          mount: 0.5,
          alpha: 0.01,
          transitions: {
            alpha: { duration: 3, delay: 1, timingFunction: "ease-in" }
          }
        }
      };
    }

    _init() {
      this.application.on("booted", () => {
        Router.navigate("main", false);
      });

      this.tag("Logo").on("txLoaded", () => {
        this.patch({
          Background: { smooth: { scale: 1 } },
          Logo: { smooth: { y: 540, alpha: 1 } }
        });
      });

      this.tag("Spinner").on("txLoaded", () => {
        this.tag("Spinner").setSmooth("alpha", 1);
      });

      this.tag("Spinner")
        .animation({
          duration: 1,
          repeat: -1,
          actions: [
            {
              p: "rotation",
              v: {
                0: { v: 0, sm: 0 },
                0.5: { v: 3.14, sm: 0 },
                1: { v: 9, sm: 0 }
              }
            }
          ]
        })
        .start();

      setTimeout(() => {
        Router.navigate("main", false);
      }, 3000);
    }
  }

  class MoviesListItem extends Lightning.Component {
    static _template() {
      return {
        w: MoviesListItem.width,
        h: MoviesListItem.height,
        OuterBorder: {
          x: -35,
          y: -42,
          aplha: 0,
          colorLeft: 0xff8ecea2,
          colorRight: 0xff03b3e4,
          texture: lng.Tools.getRoundRect(
            240,
            350,
            8,
            6,
            0xff8ecea2,
            false,
            0xff00ffff
          )
        },
        Item: {
          shader: { type: Lightning.shaders.RoundedRectangle, radius: 10 },
          rect: true,
          w: w => w,
          h: h => h,
          alpha: 0.8
        },
        Rating: {
          CirleProgress1: {
            shader: { type: Lightning.shaders.RoundedRectangle, radius: 50 },
            rect: true,
            h: 100,
            w: 100,
            x: 30,
            y: 85,
            color: 0xff504d63,
            alpha: 0,
            CirleProgress2: {
              shader: {
                type: Lightning.shaders.RoundedRectangle,
                radius: 40,
                stroke: 5,
                strokeColor: 0xff7eb24e,
                fillColor: 0xff504d63
              },
              rect: true,
              h: 80,
              w: 80,
              alpha: 0,
              x: 10,
              y: 10,
              InnerCircle: {
                shader: {
                  shader: {
                    type: Lightning.shaders.RoundedRectangle,
                    radius: 40
                  },
                  rect: true,
                  h: 80,
                  w: 80,
                  color: 0xffffb6c1
                }
              }
            },
            Number: {
              text: { text: "0", fontSize: 18 },
              alpha: 0,
              x: 35,
              y: 35
            },
            Percentage: {
              text: { text: "%", fontSize: 12 },
              alpha: 0,
              x: 55,
              y: 40
            }
          }
        }
      };
    }

    _init() {
      this.tag("Item").patch({ src: this.item.src });
      const itemAverage = this.item.average * 10;
      this.tag("OuterBorder").patch({ alpha: 0 });
      this.tag("CirleProgress1").patch({ alpha: 0 });
      this.tag("CirleProgress2").patch({ alpha: 0 });
      this.tag("Number").patch({ alpha: 0 });
      this.tag("Percentage").patch({ alpha: 0 });
      this._rating = this.tag("Rating").animation({
        duration: 1,
        stopMethod: "immediate",
        actions: [
          {
            p: "y",
            v: {
              0: 140,
              0.1: 135,
              0.2: 130,
              0.3: 125,
              0.4: 120,
              0.5: 115,
              0.6: 110,
              0.7: 105,
              0.8: 100,
              0.9: 95,
              1: 90
            }
          },
          {
            t: "Number",
            p: "text.text",
            v: () => {
              if (this.ratingNum < itemAverage) {
                this.ratingNum++;
              }
              return this.ratingNum;
            }
          }
        ]
      });
      this._rating.start();

      this._aniCirleProgress2 = this.tag("CirleProgress2").animation({
        duration: 1,
        stopMethod: "immediate",
        actions: [
          {
            p: "shader.strokeColor",
            v: () => {
              //TO DO..implement a progress shader!
            }
          }
        ]
      });

      this.ratingNum = 0;
      this._aniNumber = this.tag("Number").animation({
        duration: 1.2,
        stopMethod: "immediate",
        actions: [
          {
            p: "y",
            v: {
              0: 215,
              0.1: 200,
              0.2: 190,
              0.3: 180,
              0.4: 170,
              0.5: 160,
              0.6: 150,
              0.7: 155,
              0.8: 150,
              0.9: 140,
              1: 135
            }
          },
          {
            p: "text.text",
            v: () => {
              if (this.ratingNum < itemAverage) {
                this.ratingNum++;
              }
              return this.ratingNum;
            }
          }
        ]
      });
    }

    _active() {
      this.application.on("setBackground", val => {
        if (val) {
          this.tag("Item").patch({
            colorTop: 0xff717171,
            colorBottom: 0xff000000
          });
        } else {
          this.tag("Item").patch({
            colorTop: 0xffffffff,
            colorBottom: 0xffffffff
          });
        }
      });
    }

    _focus() {
      this.ratingNum = 0;
      this.tag("Item").patch({ smooth: { scale: 1.2, alpha: 1 } });
      this.tag("OuterBorder").patch({ alpha: 1 });
      this.tag("CirleProgress1").patch({ alpha: 1 });
      this.tag("CirleProgress2").patch({ alpha: 1 });
      this.tag("Number").patch({ alpha: 1 });
      this.tag("Percentage").patch({ alpha: 1 });
      this._rating.replay();
    }

    _unfocus() {
      this.tag("Item").patch({ smooth: { scale: 1, alpha: 0.8 } });
      this.tag("OuterBorder").patch({ alpha: 0 });
      this.tag("CirleProgress1").patch({ alpha: 0 });
      this.tag("CirleProgress2").patch({ alpha: 0 });
      this.tag("Number").patch({ alpha: 0 });
      this.tag("Percentage").patch({ alpha: 0 });
    }

    _handleEnter() {
      const itemId = this.item.itemId;
      const itemType = this.item.itemType;
      Router.navigate(`detail/${itemType}/${itemId}`, true);
    }

    static get width() {
      return 180;
    }

    static get height() {
      return 270;
    }
  }

  // import { FocusManager } from '@lightningjs/ui-components';

  class MovieList extends Lightning.Component {
    static _template() {
      return {
        // Row:{
        //   type: FocusManager,
        //   direction: 'row',
        //   wrapSelected: true,
        Items: { x: 20, y: 500 },
        // },

        Label: {
          x: 20,
          y: 300,
          text: { fontSize: 64 },
          transitions: {
            y: { timingFunction: "ease-in", duration: 2, delay: 0.2 }
          }
        },
        Genres: {
          x: 20,
          y: 380,
          colorLeft: 0xff8ecea2,
          colorRight: 0xff03b3e4,
          text: { fontSize: 32 },
          transitions: {
            y: { timingFunction: "ease-in", duration: 2, delay: 0.2 }
          }
        }
      };
    }

    set items(items) {
      this.tag("Items").children = items.map((item, index) => {
        return {
          type: MoviesListItem,
          item: item,
          x: index * 250
        };
      });
    }

    startTransitions() {
      this.tag("Label").patch({ y: 300 });
      this.tag("Genres").patch({ y: 380 });
      this.tag("Label").setSmooth("y", 320);
      this.tag("Genres").setSmooth("y", 400);
    }

    _construct(){
      this._changeX = 0;
    }
    _init() {
      this.index = 0;
      this.application.on("whenFocused", arrList => {
        this.tag("Label").patch({ text: { text: `${arrList[0]}` } });
        this.tag("Genres").patch({ text: { text: `${arrList[1]}` } });
      });
    }

    _active() {
      this.application.on("setBackground", val => {
        if (val) {
          this.tag("Label").patch({
            colorTop: 0xff717171,
            colorBottom: 0xff000000
          });
          this.tag("Genres").patch({
            colorTop: 0xff717171,
            colorBottom: 0xff000000
          });
        } else {
          this.tag("Label").patch({
            colorTop: 0xffffffff,
            colorBottom: 0xffffffff
          });
          this.tag("Genres").patch({
            colorTop: 0xffffffff,
            colorBottom: 0xffffffff,
            colorLeft: 0xff8ecea2,
            colorRight: 0xff03b3e4
          });
        }
      });
    }

    _handleLeft() {
      if (this.index > 0) {
        this.index--;
        this._changeLeftDirection();
      }
    }

    _handleRight() {
      if (this.index < this.tag("Items").children.length - 1) {
        this.index++;
        this._changeRightDirection();
      }
    }

    _getActiveItem() {
      return this.tag("Items").children[this.index];
    }


    _changeLeftDirection(){
      this._changeX +=  220;
      this.tag('Items').patch({x: this._changeX});
    }

    _changeRightDirection(){
      this._changeX -=  220;
      this.tag('Items').patch({x: this._changeX});
    }

    _getFocused() {
      this._focusedLabel = this.tag("Items").childList.getAt(
        this.index
      ).item.label;
      this._focusedGenres = this.tag("Items")
        .childList.getAt(this.index)
        .item.genres.join(" | ");
      let backdrop = this.tag("Items").childList.getAt(this.index).item.backdrop;
      let arrList = [this._focusedLabel, this._focusedGenres, backdrop];
      this.application.emit("whenFocused", arrList);
      this.fireAncestors("$changeBackground");
      this.startTransitions();
      return this.tag("Items").children[this.index];
    }
  }

  const getImageURL = (path, width = 200) => {
    return `//image.tmdb.org/t/p/w${width}${path}`;
  };

  class Main extends Lightning.Component {
    static _template() {
      return {
        Background: {
          src: Utils.asset("images/background-new.png"),
          w: 1920,
          h: 1080,
          colorTop: 0xff717171,
          colorBottom: 0xff000000,
          scale: 1.2,
          alpha: 0.8,
          transitions: {
            scale: { duration: 2, delay: 0.2, timingFunction: "ease-in" },
            alpha: { duration: 2, delay: 0.2, timingFunction: "ease-in" }
          }
        },
        Logo: {
          src: Utils.asset("images/logosmall.png"),
          w: 300,
          h: 50,
          x: 30,
          y: 10
        },
        List: { type: MovieList, x: 30 }
      };
    }

    _init() {
      this.application.on("whenFocused", arrList => {
        const movieBackgrnd = arrList[2];
        this.tag("Background").patch({
          src: getImageURL(movieBackgrnd, 1280)
        });
      });
    }

    _setBackgroundAlpha(val) {
      console.log("set back ground.......", val);
      //setItem
      //setlogo
      //set title
      //set geners
      //set menu
      this.application.emit("setBackground", val);
    }

    _active() {
      this.application.on("Exit", popup => {
        console.log("popup", popup);
        if (popup) {
          this.widgets.popup.visible = true;
          this.tag("Logo").patch({
            colorTop: 0xff717171,
            colorBottom: 0xff000000
          });
          this._setBackgroundAlpha(true);
          Router.focusWidget("Popup");
        }
      });
      this.application.on("closepopup", popupClose => {
        if (popupClose === false) {
          this.widgets.popup.visible = false;
          this.tag("Logo").patch({
            colorTop: 0xffffffff,
            colorBottom: 0xffffffff
          });
          this._setBackgroundAlpha(false);
          Router.focusPage();
        } else {
          this.application.closeApp();
        }
      });
    }

    $changeBackground() {
      this.tag("Background").patch({ scale: 1.2, alpha: 0.8 });
      this.tag("Background").setSmooth("scale", 1);
      this.tag("Background").setSmooth("alpha", 1);
    }

    _handleUp() {
      Router.focusWidget("Menu");
    }

    _getFocused() {
      return this.tag("List");
    }

    set main(v) {
      this.tag("List").items = v.results.map(result => {
        let label = result.type === "tv" ? result.name : result.title;
        return {
          label: label,
          genres: result.genres,
          src: getImageURL(result.poster_path),
          itemType: result.type,
          itemId: result.id,
          backdrop: result.backdrop_path,
          average: result.vote_average
        };
      });
    }
  }

  class Button extends Lightning.Component {
    static _template() {
      return {
        ButtonBorder: {
          rect: true,
          w: 335,
          h: 73,
          color: 0xffaeb2b3,
          shader: { type: Lightning.shaders.RoundedRectangle, radius: 10 }
        },
        Label: { text: { fontSize: 32 }, x: 75, y: 12, textAlign: "center" }
      };
    }

    _init() {
      this.tag("Label").patch({ text: { text: this.buttonText } });
    }

    _focus() {
      this.tag("ButtonBorder").patch({ color: 0xff33d1ff });
    }

    _unfocus() {
      this.tag("ButtonBorder").patch({ color: 0xffaeb2b3 });
    }
  }

  class PageDetails extends Lightning.Component {
    static _template() {
      return {
        Background: {
          w: 1920,
          h: 1080,
          colorTop: 0xff717171,
          colorBottom: 0xff000000,
          alpha: 0.8,
          scale: 1.2,
          transitions: {
            alpha: { timingFunction: "ease-in", duration: 2, delay: 0.2 },
            scale: { timingFunction: "ease-in", duration: 2, delay: 0.2 }
          }
        },
        Logo: {
          src: Utils.asset("images/logosmall.png"),
          w: 300,
          h: 50,
          x: 30,
          y: 10
        },
        Title: {
          x: 500,
          y: 300,
          text: { fontSize: 64 },
          transitions: {
            x: { timingFunction: "ease-in", duration: 2, delay: 0.2 }
          }
        },
        Date: {
          x: 500,
          y: 250,
          text: { fontSize: 32 },
          transitions: {
            x: { timingFunction: "ease-in", duration: 2, delay: 0.2 }
          }
        },
        Overview: {
          x: 500,
          y: 400,
          color: 0xffb9bec0,
          text: {
            fontSize: 24,
            wordWrap: true,
            wordWrapWidth: 960,
            lineHeight: 40,
            maxLines:3,
          },
          transitions: {
            x: { timingFunction: "ease-in", duration: 2, delay: 0.2 }
          }
        },
        Poster: {
          rect: true,
          w: 300,
          h: 450,
          x: 30,
          y: 250,
          shader: { type: Lightning.shaders.RoundedRectangle, radius: 15 }
        },
        Button: {
          type: Button,
          buttonText: "Watch Trailer",
          x: 500,
          y: 550,

          transitions: {
            x: { timingFunction: "ease-in", duration: 2, delay: 0.2 }
          }
        }
      };
    }

    startTransitions() {
      this.tag("Overview").patch({ x: 500 });
      this.tag("Date").patch({ x: 500 });
      this.tag("Title").patch({ x: 500 });
      this.tag("Button").patch({ x: 500 });

      this.tag("Overview").setSmooth("x", 450);
      this.tag("Date").setSmooth("x", 450);
      this.tag("Title").setSmooth("x", 450);
      this.tag("Button").setSmooth("x", 450);

      this.tag("Background").patch({ alpha: 0.8 });
      this.tag("Background").patch({ scale: 1.2 });
      this.tag("Background").setSmooth("alpha", 1);
      this.tag("Background").setSmooth("scale", 1);
    }

    _active() {
      const backdrop = getImageURL(this.details.backdrop_path, 500);
      this.tag("Background").patch({
        src: backdrop
      });
      this.startTransitions();
      const posterpath = getImageURL(this.details.poster_path, 200);
      this.tag("Poster").patch({
        src: posterpath
      });
      const title =
        this.details.type === "movie" ? this.details.title : this.details.name;
      this.tag("Title").patch({
        text: { text: `${title}` }
      });

      const year =
        this.details.type === "movie"
          ? this.details.release_date.split("-")
          : this.details.first_air_date.split("-");
      this.tag("Date").patch({
        text: { text: `${year[0]}` }
      });
      this.tag("Overview").patch({
        text: { text: `${this.details.overview}` }
      });
    }

    set detail(v) {
      this.details = v;
    }

    _handleUp() {
      Router.focusWidget("Menu");
    }

    _handleEnter() {
      Router.navigate("Player");
    }

    _getFocused() {
      return this.tag("Button");
    }
  }

  class Player extends Lightning.Component {
    static _template() {
      return {
        TitleText: {
          text: {
            text:
              "This is not a movie trailer-just a demo player for learning purposes only!.[Press M for (Mute/unmute), Press Enter for (Pause/Play),Press - for show/hide ]",
            fontSize: 22,
            textColor: 0xffff0000,
            fontStyle:'bold',
            textAlign:'center',
            x: 1,
            y: 1
          }
        },
        ProgressBarBorder: {
          zIndex: 2,
          ProgressBar: {
            shader: { type: Lightning.shaders.RoundedRectangle, radius: 4 },
            rect: true,
            w: 1,
            h: 8,
            color: 0xff000000
          },
          shader: { type: Lightning.shaders.RoundedRectangle, radius: 4 },
          rect: true,
          w: 940,
          h: 8,
          x: 360,
          y: 650,
          color: 0xff808080
        },
        PlayerDuration: {
          zIndex: 2,
          x: 390,
          y: 620,
          text: {
            text: "",
            fontSize: 12,
            textColor: 0xff000000
          }
        },
        CurrentPosition: {
          zIndex: 2,
          x: 420,
          y: 620,
          text: { text: "", fontSize: 12, textColor: 0xff000000 }
        },
        PauseIcon: {
          zIndex: 2,
          x: 360,
          y: 620,
          src: Utils.asset("images/pause.png"),
          w: 20,
          h: 20,
          alpha: 0
        },
        PlayIcon: {
          zIndex: 2,
          x: 360,
          y: 620,
          src: Utils.asset("images/play.png"),
          w: 20,
          h: 20
        }
      };
    }

    _init() {
      VideoPlayer.consumer(this);
      VideoPlayer.size(960, 540);
      VideoPlayer.position(150, 350);
    }

    _active() {
      VideoPlayer.open(
        "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
      );
      this._setState("Play");
      setTimeout(() => {
        this._checkDuration();
      }, 2000);
    }

    _inactive() {
      VideoPlayer.close();
    }

    _handleEnter() {
      VideoPlayer.playPause();
      setTimeout(() => {
        if (VideoPlayer.playing) {
          console.log("Playing....");
          this.progressAnimation.play();
          this.tag("PauseIcon").patch({ alpha: 0 });
          this.tag("PlayIcon").patch({ alpha: 1 });
        } else {
          this.progressAnimation.pause();
          console.log("Paused....");
          this.tag("PauseIcon").patch({ alpha: 1 });
          this.tag("PlayIcon").patch({ alpha: 0 });
        }
      }, 500);
    }

    _handleShow() {
      VideoPlayer.show();
      this.tag("ProgressBar").patch({ alpha: 1 });
      VideoPlayer.mute(false);
    }

    _handleHide() {
      VideoPlayer.hide();
      this.tag("ProgressBar").patch({ alpha: 0 });
      VideoPlayer.mute();
    }

    _handleMute() {
      if (VideoPlayer.muted) {
        VideoPlayer.mute(false);
      } else {
        VideoPlayer.mute();
      }
    }

    _checkDuration() {
      const width = this.tag("ProgressBarBorder").w;
      this._increment = (width / (this._duration * 60)).toFixed(2);
      this._currentPosition = VideoPlayer.currentTime;
      this.tag("CurrentPosition").patch({
        text: { text: `current position= ${this._currentPosition}` }
      });
      this._progress = 0;

      this.progressAnimation = this.tag("ProgressBar").animation({
        stopMethod: "immediate",
        delay: 0.2,
        duration: this._duration * 60,
        repeat: 0,
        actions: [
          {
            p: "w",
            v: () => {
              let currentPosition = VideoPlayer.currentTime;
              this.tag("CurrentPosition").patch({
                text: { text: `${currentPosition.toFixed(2)}` }
              });
              let duration = this._duration * 60;
              if (this._progress < width) {
                this._progress = currentPosition;
                this._progress = Math.floor(this._progress);
              }
              return this._progress;
            }
          }
        ]
      });
      this.progressAnimation.play();
    }

    static _states() {
      return [
        class Play extends this {
          $videoPlayerCanPlay() {
            this._duration = VideoPlayer.duration;
            this._duration = (this._duration / 60).toFixed(2);
            console.log("duration...", this._duration);
            this.tag("PlayerDuration").patch({
              text: { text: `${this._duration} /` }
            });
          }
        }
      ];
    }
  }

  class Details {
    constructor(obj, type) {
      this._type = type;
      this._adult = obj.adult;
      this._backdrop_path = obj.backdrop_path;
      this._budget = obj.budget;
      this._homepage = obj.homepage;
      this._id = obj.id;
      this._imdb_id = obj.imdb_id;
      this._original_language = obj.original_language;
      this._original_title = obj.original_title;
      this._overview = obj.overview;
      this._popularity = obj.popularity;
      this._poster_path = obj.poster_path;
      this._release_date = obj.release_date;
      this._status = obj.status;
      this._tagline = obj.tagline;
      this._title = obj.title;
      this._video = obj.video;
      this._vote_count = obj.vote_count;
      this._vote_average = obj.vote_average;
      this._genres = obj.genres.map(genre => {
        return genre.name;
      });
      this._name = obj.name;
      this._original_name = obj.original_name;
      this._num_of_episode = obj.number_of_episodes;
      this._num_of_seasons = obj.number_of_seasons;
      this._first_air_date = obj.first_air_date;
    }

    get type() {
      return this._type;
    }

    get num_of_episode() {
      return this._num_of_episode;
    }

    get first_air_date() {
      return this._first_air_date;
    }

    get original_name() {
      return this._original_name;
    }

    get name() {
      return this._name;
    }

    get num_of_seasons() {
      return this._num_of_seasons;
    }

    get genres() {
      return this._genres;
    }

    get vote_average() {
      return this._vote_average;
    }

    get vote_count() {
      return this._vote_count;
    }
    get video() {
      return this._video;
    }
    get title() {
      return this._title;
    }
    get tagline() {
      return this._tagline;
    }
    get status() {
      return this._status;
    }

    get release_date() {
      return this._release_date;
    }
    get poster_path() {
      return this._poster_path;
    }
    get backdrop_path() {
      return this._backdrop_path;
    }
    get id() {
      return this._id;
    }
    get imdb_id() {
      return this._imdb_id;
    }

    get popularity() {
      return this._popularity;
    }

    get overview() {
      return this._overview;
    }
    get original_title() {
      return this._original_title;
    }
    get original_language() {
      return this._original_language;
    }
    get homepage() {
      return this._homepage;
    }
    get budget() {
      return this._budget;
    }
    get adult() {
      return this._adult;
    }
  }

  class Movie {
    constructor(item, genres) {
      this._genreIds = genres;
      this._id = item.id;
      this._adult = item.adult;
      this._backdrop_path = item.backdrop_path;
      this._original_language = item.original_language;
      this._original_title = item.original_title;
      this._overview = item.overview;
      this._popularity = item.popularity;
      this._poster_path = item.poster_path;
      this._release_date = item.release_date;
      this._title = item.title;
      this._video = item.video;
      this._vote_average = item.vote_average;
      this._vote_count = item.vote_count;
      this._genres = item.genre_ids.map(id => {
        const filtered = genres.genres.find(genre => {
          return genre.id === id;
        });
        return filtered.name;
      });
    }

    get type() {
      return "movie";
    }

    get genreIds() {
      return this._genreIds;
    }

    get id() {
      return this._id;
    }

    get adult() {
      return this._adult;
    }

    get backdrop_path() {
      return this._backdrop_path;
    }

    get original_language() {
      return this._original_language;
    }

    get popularity() {
      return this._popularity;
    }

    get poster_path() {
      return this._poster_path;
    }

    get release_date() {
      return this._release_date;
    }

    get title() {
      return this._title;
    }

    get video() {
      return this._video;
    }

    get vote_average() {
      return this._vote_average;
    }

    get vote_count() {
      return this._vote_count;
    }

    get genres() {
      return this._genres;
    }
  }

  class TV {
    constructor(obj, genres) {
      this._backdrop_path = obj.backdrop_path;
      this._id = obj.id;
      this._name = obj.name;
      this._origin_country = obj.origin_country;
      this._original_language = obj.original_language;
      this._original_name = obj.original_name;
      this._overview = obj.overview;
      this._popularity = obj.popularity;
      this._poster_path = obj.poster_path;
      this._vote_average = obj.vote_average;
      this._vote_count = obj.vote_count;
      this._genres = obj.genre_ids.map(id => {
        const filtered = genres.genres.find(genre => {
          return genre.id === id;
        });
        let output = filtered === undefined ? "fake" : filtered.name;
        return output;
      });
    }

    get type() {
      return "tv";
    }

    get genres() {
      return this._genres;
    }

    get overview() {
      return this._overview;
    }

    get original_name() {
      return this._original_name;
    }

    get original_language() {
      return this._original_language;
    }

    get origin_country() {
      return this._origin_country;
    }

    get backdrop_path() {
      return this._backdrop_path;
    }

    get genre_ids() {
      return this._genre_ids;
    }

    get name() {
      return this._name;
    }

    get vote_average() {
      return this._vote_average;
    }

    get vote_count() {
      return this._vote_count;
    }

    get popularity() {
      return this._popularity;
    }

    get poster_path() {
      return this._poster_path;
    }

    get id() {
      return this._id;
    }
  }

  class Container {
    constructor(obj, genres, type) {
      this._page = obj.page;
      this._genres = genres;
      this._total_pages = obj.total_pages;
      this._results = obj.results.map(item => {
        if (type === "movie") {
          return new Movie(item, genres);
        } else if (type === "tv") {
          return new TV(item, genres);
        }
      });
      this._type = type;
      this._total_results = obj.total_results;
    }

    get page() {
      return this._page;
    }

    get items() {
      return this._total_pages;
    }

    get genres() {
      return this._genres;
    }

    get total_results() {
      return this._total_results;
    }

    get results() {
      return this._results;
    }

    get type() {
      return this._type;
    }
  }

  const apiKey = "66683917a94e703e14ca150023f4ea7c";

  const _getData = url => {
    const paramStr = `api_key=${apiKey}`;
    return fetch(`https://api.themoviedb.org/3/${url}?${paramStr}`, {
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(response => {
        if (!response.ok) {
          throw "Response not okay!";
        }
        return response.json();
      })
      .catch(error => {
        console.log("Error", error);
        throw error;
      });
  };

  async function _fetchDetails(type, id) {
    const details = await _getData(`${type}/${id}`);
    console.log("details", details);
    const detailObj = new Details(details, type);
    return detailObj;
  }

  async function _fetchMoviesData() {
    const genres = await _genres("movie");
    const movies = await _getData("movie/popular");
    const movieContainer = new Container(movies, genres, "movie");
    return movieContainer;
  }

  async function _fetchTVData() {
    const tv = await _getData("tv/popular");
    console.log("series", tv);
    const genres = await _genres("tv");
    console.log("genres", genres);
    const tvContainer = new Container(tv, genres, "tv");
    return tvContainer;
  }

  async function _genres(type) {
    let genres;
    if (type === "tv") {
      genres = await _getData("genre/tv/list");
    } else {
      genres = await _getData("genre/movie/list");
    }
    return genres;
  }

  var routes = {
    root: "splash",
    routes: [
      {
        path: "splash",
        component: Splash,
        widgets: []
      },
      {
        path: "main",
        before: async page => {
          const main = await _fetchMoviesData();
          page.main = main;
        },
        component: Main,
        widgets: ["Menu"]
      },

      {
        path: "tv",
        before: async page => {
          const main = await _fetchTVData();
          page.main = main;
        },
        component: Main,
        widgets: ["Menu"]
      },
      {
        path: "detail/:ItemType/:ItemId",
        before: async (page, { ItemType, ItemId }) => {
          const detail = await _fetchDetails(ItemType, ItemId);
          page.detail = detail;
        },
        component: PageDetails,
        widgets: ["Menu"]
      },
      {
        path: "Player",
        component: Player,
        widgets: []
      }
    ]
  };

  class Menu extends Lightning.Component {
    static _template() {
      return {
        MainMenu: {
          Movies: {
            type: MenuItem,
            title: "Movies"
          },
          Series: {
            type: MenuItem,
            title: "Series",
            x: 200
          },
          Exit: {
            type: MenuItem,
            title: "Exit",
            x: 400
          }
        }
      };
    }

    _init() {
      this.index = 0;
    }

    _handleLeft() {
      if (this.index > 0) {
        this.index--;
      }
    }

    _handleRight() {
      if (this.index < this.tag("MainMenu").children.length - 1) {
        this.index++;
      }
    }

    _handleDown() {
      Router.focusPage();
    }

    get activeItem() {
      return this.tag("MainMenu").children[this.index];
    }

    _getFocused() {
      return this.activeItem;
    }

    _handleEnter() {
      Router.focusPage();
      if (this.activeItem.title === "Series") {
        Router.navigate("tv");
      } else if (this.activeItem.title === "Movies") {
        Router.navigate("main");
      } else if (this.activeItem.title === "Exit") {
        const popup = true;
        this.application.emit("Exit", popup);
      } 
    }
  }

  class MenuItem extends Lightning.Component {
    static _template() {
      return {
        Label: { text: { text: "Movies", fontSize: 48 } },
        Focus: {
          rect: true,
          color: 0xff8ecea2,
          h: 6,
          y: 75,
          w: 155,
          alpha: 0,
          colorLeft: 0xff8ecea2,
          colorRight: 0xff03b3e4
        }
      };
    }

    _init() {
      this.tag("Label").patch({ text: { text: this.title } });
    }

    _active() {
      this.application.on("setBackground", val => {
        if (val) {
          this.tag("Label").patch({
            colorTop: 0xff717171,
            colorBottom: 0xff000000
          });
        } else {
          this.tag("Label").patch({
            colorTop: 0xffffffff,
            colorBottom: 0xffffffff
          });
        }
      });
    }

    _focus() {
      this.tag("Focus").patch({ alpha: 1 });
    }

    _unfocus() {
      this.tag("Focus").patch({ alpha: 0 });
    }
  }

  class Popup extends Lightning.Component {
    static _template() {
      return {
        Container: {
          x: 700,
          y: 200,
          ExitWindow: {
            texture: lng.Tools.getRoundRect(
              500,
              500,
              40,
              6,
              0xff03b3e4,
              true,
              0xfff5f7fa
            ),
            Label: {
              text: {
                text: "Do you want to exit the application?",
                fontSize: 32,
                wordWrap: true,
                wordWrapWidth: 400,
                lineHeight: 40,
                textAlign: "center",
                textColor: 0xff191a0c,
                paddingLeft: 40
              },
              y: 65,
              x: 50
            },
            Buttons: {
              ButtonYes: {
                y: 200,
                x: 80,
                type: Button,
                buttonText: "YES, I DO"
              },
              ButtonNo: {
                y: 300,
                x: 80,
                type: Button,
                buttonText: "NO, I DON'T"
              }
            }
          }
        }
      };
    }

    _init() {
      this.index = 0;
      this.tag("ButtonNo").patch({ color: "0xffA2A8B2" });
    }

    _getFocused() {
      console.log(
        "I am in getfocused state",
        this.tag("Buttons").children[this.index]
      );
      this.tag("Buttons").children[this.index].patch({ color: "0xffA2A8B2" });
      return this.tag("Buttons").children[this.index];
    }

    _handleUp() {
      this.index = 0;
    }

    _handleDown() {
      this.index = 1;
    }

    _handleBack() {
      Router.focusPage();
    }

    _handleEnter() {
      let appClose = false;
      if (this.tag("Buttons").children[this.index].buttonText === "NO, I DON'T") {
        this.application.emit("closepopup", appClose);
      } else if (
        this.tag("Buttons").children[this.index].buttonText === "YES, I DO"
      ) {
        appClose = true;

        this.application.emit("closepopup", appClose);
      }
    }
  }

  class App extends Router.App {
    static getFonts() {
      [
        {
          family: "SourceSansPro-Black",
          url: Utils.asset("fonts/SourceSansPro-Black.ttf"),
          descriptor: {}
        },
        {
          family: "SourceSansPro-Bold",
          url: Utils.asset("fonts/SourceSansPro-Bold.ttf"),
          descriptor: {}
        },
        {
          family: "SourceSansPro-ExtraLight",
          url: Utils.asset("fonts/SourceSansPro-ExtraLight.ttf"),
          descriptor: {}
        },
        {
          family: "SourceSansPro-Light",
          url: Utils.asset("fonts/SourceSansPro-Light.ttf"),
          descriptor: {}
        },
        {
          family: "SourceSansPro-Regular",
          url: Utils.asset("fonts/SourceSansPro-Regular.ttf"),
          descriptor: {}
        },
        {
          family: "SourceSansPro-SemiBold",
          url: Utils.asset("fonts/SourceSansPro-SemiBold.ttf"),
          descriptor: {}
        },
        {
          family: "Regular",
          url: Utils.asset("fonts/Roboto-Regular.ttf"),
          descriptor: {}
        }
      ];
    }
    static _template() {
      return {
        ...super._template(),
        Widgets: {
          Menu: { y: 100, type: Menu, x: 30 },
          Popup: { type: Popup }
        }
      };
    }
    _setup() {
      Router.startRouter(routes, this);
    }
  }

  function index() {
    return Launch(App, ...arguments);
  }

  return index;

}());
//# sourceMappingURL=appBundle.js.map
