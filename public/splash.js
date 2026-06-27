var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/@protobufjs/aspromise/index.js
var require_aspromise = __commonJS({
  "node_modules/@protobufjs/aspromise/index.js"(exports, module) {
    "use strict";
    module.exports = asPromise;
    function asPromise(fn, ctx) {
      var params = new Array(arguments.length - 1), offset = 0, index = 2, pending = true;
      while (index < arguments.length)
        params[offset++] = arguments[index++];
      return new Promise(function executor(resolve, reject) {
        params[offset] = function callback(err) {
          if (pending) {
            pending = false;
            if (err)
              reject(err);
            else {
              var params2 = new Array(arguments.length - 1), offset2 = 0;
              while (offset2 < params2.length)
                params2[offset2++] = arguments[offset2];
              resolve.apply(null, params2);
            }
          }
        };
        try {
          fn.apply(ctx || null, params);
        } catch (err) {
          if (pending) {
            pending = false;
            reject(err);
          }
        }
      });
    }
  }
});

// node_modules/@protobufjs/base64/index.js
var require_base64 = __commonJS({
  "node_modules/@protobufjs/base64/index.js"(exports) {
    "use strict";
    var base64 = exports;
    base64.length = function length(string) {
      var p = string.length;
      if (!p)
        return 0;
      var n = 0;
      while (--p % 4 > 1 && string.charAt(p) === "=")
        ++n;
      return Math.ceil(string.length * 3) / 4 - n;
    };
    var b64 = new Array(64);
    var s64 = new Array(123);
    for (i = 0; i < 64; )
      s64[b64[i] = i < 26 ? i + 65 : i < 52 ? i + 71 : i < 62 ? i - 4 : i - 59 | 43] = i++;
    var i;
    base64.encode = function encode(buffer, start, end) {
      var parts = null, chunk = [];
      var i2 = 0, j = 0, t;
      while (start < end) {
        var b = buffer[start++];
        switch (j) {
          case 0:
            chunk[i2++] = b64[b >> 2];
            t = (b & 3) << 4;
            j = 1;
            break;
          case 1:
            chunk[i2++] = b64[t | b >> 4];
            t = (b & 15) << 2;
            j = 2;
            break;
          case 2:
            chunk[i2++] = b64[t | b >> 6];
            chunk[i2++] = b64[b & 63];
            j = 0;
            break;
        }
        if (i2 > 8191) {
          (parts || (parts = [])).push(String.fromCharCode.apply(String, chunk));
          i2 = 0;
        }
      }
      if (j) {
        chunk[i2++] = b64[t];
        chunk[i2++] = 61;
        if (j === 1)
          chunk[i2++] = 61;
      }
      if (parts) {
        if (i2)
          parts.push(String.fromCharCode.apply(String, chunk.slice(0, i2)));
        return parts.join("");
      }
      return String.fromCharCode.apply(String, chunk.slice(0, i2));
    };
    var invalidEncoding = "invalid encoding";
    base64.decode = function decode(string, buffer, offset) {
      var start = offset;
      var j = 0, t;
      for (var i2 = 0; i2 < string.length; ) {
        var c = string.charCodeAt(i2++);
        if (c === 61 && j > 1)
          break;
        if ((c = s64[c]) === void 0)
          throw Error(invalidEncoding);
        switch (j) {
          case 0:
            t = c;
            j = 1;
            break;
          case 1:
            buffer[offset++] = t << 2 | (c & 48) >> 4;
            t = c;
            j = 2;
            break;
          case 2:
            buffer[offset++] = (t & 15) << 4 | (c & 60) >> 2;
            t = c;
            j = 3;
            break;
          case 3:
            buffer[offset++] = (t & 3) << 6 | c;
            j = 0;
            break;
        }
      }
      if (j === 1)
        throw Error(invalidEncoding);
      return offset - start;
    };
    base64.test = function test(string) {
      return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(string);
    };
  }
});

// node_modules/@protobufjs/eventemitter/index.js
var require_eventemitter = __commonJS({
  "node_modules/@protobufjs/eventemitter/index.js"(exports, module) {
    "use strict";
    module.exports = EventEmitter;
    function EventEmitter() {
      this._listeners = {};
    }
    EventEmitter.prototype.on = function on(evt, fn, ctx) {
      (this._listeners[evt] || (this._listeners[evt] = [])).push({
        fn,
        ctx: ctx || this
      });
      return this;
    };
    EventEmitter.prototype.off = function off(evt, fn) {
      if (evt === void 0)
        this._listeners = {};
      else {
        if (fn === void 0)
          this._listeners[evt] = [];
        else {
          var listeners = this._listeners[evt];
          for (var i = 0; i < listeners.length; )
            if (listeners[i].fn === fn)
              listeners.splice(i, 1);
            else
              ++i;
        }
      }
      return this;
    };
    EventEmitter.prototype.emit = function emit(evt) {
      var listeners = this._listeners[evt];
      if (listeners) {
        var args = [], i = 1;
        for (; i < arguments.length; )
          args.push(arguments[i++]);
        for (i = 0; i < listeners.length; )
          listeners[i].fn.apply(listeners[i++].ctx, args);
      }
      return this;
    };
  }
});

// node_modules/@protobufjs/float/index.js
var require_float = __commonJS({
  "node_modules/@protobufjs/float/index.js"(exports, module) {
    "use strict";
    module.exports = factory(factory);
    function factory(exports2) {
      if (typeof Float32Array !== "undefined") (function() {
        var f32 = new Float32Array([-0]), f8b = new Uint8Array(f32.buffer), le = f8b[3] === 128;
        function writeFloat_f32_cpy(val, buf, pos) {
          f32[0] = val;
          buf[pos] = f8b[0];
          buf[pos + 1] = f8b[1];
          buf[pos + 2] = f8b[2];
          buf[pos + 3] = f8b[3];
        }
        function writeFloat_f32_rev(val, buf, pos) {
          f32[0] = val;
          buf[pos] = f8b[3];
          buf[pos + 1] = f8b[2];
          buf[pos + 2] = f8b[1];
          buf[pos + 3] = f8b[0];
        }
        exports2.writeFloatLE = le ? writeFloat_f32_cpy : writeFloat_f32_rev;
        exports2.writeFloatBE = le ? writeFloat_f32_rev : writeFloat_f32_cpy;
        function readFloat_f32_cpy(buf, pos) {
          f8b[0] = buf[pos];
          f8b[1] = buf[pos + 1];
          f8b[2] = buf[pos + 2];
          f8b[3] = buf[pos + 3];
          return f32[0];
        }
        function readFloat_f32_rev(buf, pos) {
          f8b[3] = buf[pos];
          f8b[2] = buf[pos + 1];
          f8b[1] = buf[pos + 2];
          f8b[0] = buf[pos + 3];
          return f32[0];
        }
        exports2.readFloatLE = le ? readFloat_f32_cpy : readFloat_f32_rev;
        exports2.readFloatBE = le ? readFloat_f32_rev : readFloat_f32_cpy;
      })();
      else (function() {
        function writeFloat_ieee754(writeUint, val, buf, pos) {
          var sign = val < 0 ? 1 : 0;
          if (sign)
            val = -val;
          if (val === 0)
            writeUint(1 / val > 0 ? (
              /* positive */
              0
            ) : (
              /* negative 0 */
              2147483648
            ), buf, pos);
          else if (isNaN(val))
            writeUint(2143289344, buf, pos);
          else if (val > 34028234663852886e22)
            writeUint((sign << 31 | 2139095040) >>> 0, buf, pos);
          else if (val < 11754943508222875e-54)
            writeUint((sign << 31 | Math.round(val / 1401298464324817e-60)) >>> 0, buf, pos);
          else {
            var exponent = Math.floor(Math.log(val) / Math.LN2), mantissa = Math.round(val * Math.pow(2, -exponent) * 8388608) & 8388607;
            writeUint((sign << 31 | exponent + 127 << 23 | mantissa) >>> 0, buf, pos);
          }
        }
        exports2.writeFloatLE = writeFloat_ieee754.bind(null, writeUintLE);
        exports2.writeFloatBE = writeFloat_ieee754.bind(null, writeUintBE);
        function readFloat_ieee754(readUint, buf, pos) {
          var uint = readUint(buf, pos), sign = (uint >> 31) * 2 + 1, exponent = uint >>> 23 & 255, mantissa = uint & 8388607;
          return exponent === 255 ? mantissa ? NaN : sign * Infinity : exponent === 0 ? sign * 1401298464324817e-60 * mantissa : sign * Math.pow(2, exponent - 150) * (mantissa + 8388608);
        }
        exports2.readFloatLE = readFloat_ieee754.bind(null, readUintLE);
        exports2.readFloatBE = readFloat_ieee754.bind(null, readUintBE);
      })();
      if (typeof Float64Array !== "undefined") (function() {
        var f64 = new Float64Array([-0]), f8b = new Uint8Array(f64.buffer), le = f8b[7] === 128;
        function writeDouble_f64_cpy(val, buf, pos) {
          f64[0] = val;
          buf[pos] = f8b[0];
          buf[pos + 1] = f8b[1];
          buf[pos + 2] = f8b[2];
          buf[pos + 3] = f8b[3];
          buf[pos + 4] = f8b[4];
          buf[pos + 5] = f8b[5];
          buf[pos + 6] = f8b[6];
          buf[pos + 7] = f8b[7];
        }
        function writeDouble_f64_rev(val, buf, pos) {
          f64[0] = val;
          buf[pos] = f8b[7];
          buf[pos + 1] = f8b[6];
          buf[pos + 2] = f8b[5];
          buf[pos + 3] = f8b[4];
          buf[pos + 4] = f8b[3];
          buf[pos + 5] = f8b[2];
          buf[pos + 6] = f8b[1];
          buf[pos + 7] = f8b[0];
        }
        exports2.writeDoubleLE = le ? writeDouble_f64_cpy : writeDouble_f64_rev;
        exports2.writeDoubleBE = le ? writeDouble_f64_rev : writeDouble_f64_cpy;
        function readDouble_f64_cpy(buf, pos) {
          f8b[0] = buf[pos];
          f8b[1] = buf[pos + 1];
          f8b[2] = buf[pos + 2];
          f8b[3] = buf[pos + 3];
          f8b[4] = buf[pos + 4];
          f8b[5] = buf[pos + 5];
          f8b[6] = buf[pos + 6];
          f8b[7] = buf[pos + 7];
          return f64[0];
        }
        function readDouble_f64_rev(buf, pos) {
          f8b[7] = buf[pos];
          f8b[6] = buf[pos + 1];
          f8b[5] = buf[pos + 2];
          f8b[4] = buf[pos + 3];
          f8b[3] = buf[pos + 4];
          f8b[2] = buf[pos + 5];
          f8b[1] = buf[pos + 6];
          f8b[0] = buf[pos + 7];
          return f64[0];
        }
        exports2.readDoubleLE = le ? readDouble_f64_cpy : readDouble_f64_rev;
        exports2.readDoubleBE = le ? readDouble_f64_rev : readDouble_f64_cpy;
      })();
      else (function() {
        function writeDouble_ieee754(writeUint, off0, off1, val, buf, pos) {
          var sign = val < 0 ? 1 : 0;
          if (sign)
            val = -val;
          if (val === 0) {
            writeUint(0, buf, pos + off0);
            writeUint(1 / val > 0 ? (
              /* positive */
              0
            ) : (
              /* negative 0 */
              2147483648
            ), buf, pos + off1);
          } else if (isNaN(val)) {
            writeUint(0, buf, pos + off0);
            writeUint(2146959360, buf, pos + off1);
          } else if (val > 17976931348623157e292) {
            writeUint(0, buf, pos + off0);
            writeUint((sign << 31 | 2146435072) >>> 0, buf, pos + off1);
          } else {
            var mantissa;
            if (val < 22250738585072014e-324) {
              mantissa = val / 5e-324;
              writeUint(mantissa >>> 0, buf, pos + off0);
              writeUint((sign << 31 | mantissa / 4294967296) >>> 0, buf, pos + off1);
            } else {
              var exponent = Math.floor(Math.log(val) / Math.LN2);
              if (exponent === 1024)
                exponent = 1023;
              mantissa = val * Math.pow(2, -exponent);
              writeUint(mantissa * 4503599627370496 >>> 0, buf, pos + off0);
              writeUint((sign << 31 | exponent + 1023 << 20 | mantissa * 1048576 & 1048575) >>> 0, buf, pos + off1);
            }
          }
        }
        exports2.writeDoubleLE = writeDouble_ieee754.bind(null, writeUintLE, 0, 4);
        exports2.writeDoubleBE = writeDouble_ieee754.bind(null, writeUintBE, 4, 0);
        function readDouble_ieee754(readUint, off0, off1, buf, pos) {
          var lo = readUint(buf, pos + off0), hi = readUint(buf, pos + off1);
          var sign = (hi >> 31) * 2 + 1, exponent = hi >>> 20 & 2047, mantissa = 4294967296 * (hi & 1048575) + lo;
          return exponent === 2047 ? mantissa ? NaN : sign * Infinity : exponent === 0 ? sign * 5e-324 * mantissa : sign * Math.pow(2, exponent - 1075) * (mantissa + 4503599627370496);
        }
        exports2.readDoubleLE = readDouble_ieee754.bind(null, readUintLE, 0, 4);
        exports2.readDoubleBE = readDouble_ieee754.bind(null, readUintBE, 4, 0);
      })();
      return exports2;
    }
    function writeUintLE(val, buf, pos) {
      buf[pos] = val & 255;
      buf[pos + 1] = val >>> 8 & 255;
      buf[pos + 2] = val >>> 16 & 255;
      buf[pos + 3] = val >>> 24;
    }
    function writeUintBE(val, buf, pos) {
      buf[pos] = val >>> 24;
      buf[pos + 1] = val >>> 16 & 255;
      buf[pos + 2] = val >>> 8 & 255;
      buf[pos + 3] = val & 255;
    }
    function readUintLE(buf, pos) {
      return (buf[pos] | buf[pos + 1] << 8 | buf[pos + 2] << 16 | buf[pos + 3] << 24) >>> 0;
    }
    function readUintBE(buf, pos) {
      return (buf[pos] << 24 | buf[pos + 1] << 16 | buf[pos + 2] << 8 | buf[pos + 3]) >>> 0;
    }
  }
});

// node_modules/@protobufjs/inquire/index.js
var require_inquire = __commonJS({
  "node_modules/@protobufjs/inquire/index.js"(exports, module) {
    "use strict";
    module.exports = inquire;
    function inquire(moduleName) {
      try {
        if (typeof __require !== "function") {
          return null;
        }
        var mod = __require(moduleName);
        if (mod && (mod.length || Object.keys(mod).length)) return mod;
        return null;
      } catch (err) {
        return null;
      }
    }
  }
});

// node_modules/@protobufjs/utf8/index.js
var require_utf8 = __commonJS({
  "node_modules/@protobufjs/utf8/index.js"(exports) {
    "use strict";
    var utf8 = exports;
    var replacementChar = "\uFFFD";
    utf8.length = function utf8_length(string) {
      var len = 0, c = 0;
      for (var i = 0; i < string.length; ++i) {
        c = string.charCodeAt(i);
        if (c < 128)
          len += 1;
        else if (c < 2048)
          len += 2;
        else if ((c & 64512) === 55296 && (string.charCodeAt(i + 1) & 64512) === 56320) {
          ++i;
          len += 4;
        } else
          len += 3;
      }
      return len;
    };
    utf8.read = function utf8_read(buffer, start, end) {
      if (end - start < 1) {
        return "";
      }
      var str = "";
      for (var i = start; i < end; ) {
        var t = buffer[i++];
        if (t <= 127) {
          str += String.fromCharCode(t);
        } else if (t >= 192 && t < 224) {
          var c2 = (t & 31) << 6 | buffer[i++] & 63;
          str += c2 >= 128 ? String.fromCharCode(c2) : replacementChar;
        } else if (t >= 224 && t < 240) {
          var c3 = (t & 15) << 12 | (buffer[i++] & 63) << 6 | buffer[i++] & 63;
          str += c3 >= 2048 ? String.fromCharCode(c3) : replacementChar;
        } else if (t >= 240) {
          var t2 = (t & 7) << 18 | (buffer[i++] & 63) << 12 | (buffer[i++] & 63) << 6 | buffer[i++] & 63;
          if (t2 < 65536 || t2 > 1114111)
            str += replacementChar;
          else {
            t2 -= 65536;
            str += String.fromCharCode(55296 + (t2 >> 10));
            str += String.fromCharCode(56320 + (t2 & 1023));
          }
        }
      }
      return str;
    };
    utf8.write = function utf8_write(string, buffer, offset) {
      var start = offset, c1, c2;
      for (var i = 0; i < string.length; ++i) {
        c1 = string.charCodeAt(i);
        if (c1 < 128) {
          buffer[offset++] = c1;
        } else if (c1 < 2048) {
          buffer[offset++] = c1 >> 6 | 192;
          buffer[offset++] = c1 & 63 | 128;
        } else if ((c1 & 64512) === 55296 && ((c2 = string.charCodeAt(i + 1)) & 64512) === 56320) {
          c1 = 65536 + ((c1 & 1023) << 10) + (c2 & 1023);
          ++i;
          buffer[offset++] = c1 >> 18 | 240;
          buffer[offset++] = c1 >> 12 & 63 | 128;
          buffer[offset++] = c1 >> 6 & 63 | 128;
          buffer[offset++] = c1 & 63 | 128;
        } else {
          buffer[offset++] = c1 >> 12 | 224;
          buffer[offset++] = c1 >> 6 & 63 | 128;
          buffer[offset++] = c1 & 63 | 128;
        }
      }
      return offset - start;
    };
  }
});

// node_modules/@protobufjs/pool/index.js
var require_pool = __commonJS({
  "node_modules/@protobufjs/pool/index.js"(exports, module) {
    "use strict";
    module.exports = pool;
    function pool(alloc, slice, size) {
      var SIZE = size || 8192;
      var MAX = SIZE >>> 1;
      var slab = null;
      var offset = SIZE;
      return function pool_alloc(size2) {
        if (size2 < 1 || size2 > MAX)
          return alloc(size2);
        if (offset + size2 > SIZE) {
          slab = alloc(SIZE);
          offset = 0;
        }
        var buf = slice.call(slab, offset, offset += size2);
        if (offset & 7)
          offset = (offset | 7) + 1;
        return buf;
      };
    }
  }
});

// node_modules/protobufjs/src/util/longbits.js
var require_longbits = __commonJS({
  "node_modules/protobufjs/src/util/longbits.js"(exports, module) {
    "use strict";
    module.exports = LongBits;
    var util = require_minimal();
    function LongBits(lo, hi) {
      this.lo = lo >>> 0;
      this.hi = hi >>> 0;
    }
    var zero = LongBits.zero = new LongBits(0, 0);
    zero.toNumber = function() {
      return 0;
    };
    zero.zzEncode = zero.zzDecode = function() {
      return this;
    };
    zero.length = function() {
      return 1;
    };
    var zeroHash = LongBits.zeroHash = "\0\0\0\0\0\0\0\0";
    LongBits.fromNumber = function fromNumber2(value) {
      if (value === 0)
        return zero;
      var sign = value < 0;
      if (sign)
        value = -value;
      var lo = value >>> 0, hi = (value - lo) / 4294967296 >>> 0;
      if (sign) {
        hi = ~hi >>> 0;
        lo = ~lo >>> 0;
        if (++lo > 4294967295) {
          lo = 0;
          if (++hi > 4294967295)
            hi = 0;
        }
      }
      return new LongBits(lo, hi);
    };
    LongBits.from = function from(value) {
      if (typeof value === "number")
        return LongBits.fromNumber(value);
      if (util.isString(value)) {
        if (util.Long)
          value = util.Long.fromString(value);
        else
          return LongBits.fromNumber(parseInt(value, 10));
      }
      return value.low || value.high ? new LongBits(value.low >>> 0, value.high >>> 0) : zero;
    };
    LongBits.prototype.toNumber = function toNumber2(unsigned) {
      if (!unsigned && this.hi >>> 31) {
        var lo = ~this.lo + 1 >>> 0, hi = ~this.hi >>> 0;
        if (!lo)
          hi = hi + 1 >>> 0;
        return -(lo + hi * 4294967296);
      }
      return this.lo + this.hi * 4294967296;
    };
    LongBits.prototype.toLong = function toLong(unsigned) {
      return util.Long ? new util.Long(this.lo | 0, this.hi | 0, Boolean(unsigned)) : { low: this.lo | 0, high: this.hi | 0, unsigned: Boolean(unsigned) };
    };
    var charCodeAt = String.prototype.charCodeAt;
    LongBits.fromHash = function fromHash(hash) {
      if (hash === zeroHash)
        return zero;
      return new LongBits(
        (charCodeAt.call(hash, 0) | charCodeAt.call(hash, 1) << 8 | charCodeAt.call(hash, 2) << 16 | charCodeAt.call(hash, 3) << 24) >>> 0,
        (charCodeAt.call(hash, 4) | charCodeAt.call(hash, 5) << 8 | charCodeAt.call(hash, 6) << 16 | charCodeAt.call(hash, 7) << 24) >>> 0
      );
    };
    LongBits.prototype.toHash = function toHash() {
      return String.fromCharCode(
        this.lo & 255,
        this.lo >>> 8 & 255,
        this.lo >>> 16 & 255,
        this.lo >>> 24,
        this.hi & 255,
        this.hi >>> 8 & 255,
        this.hi >>> 16 & 255,
        this.hi >>> 24
      );
    };
    LongBits.prototype.zzEncode = function zzEncode() {
      var mask = this.hi >> 31;
      this.hi = ((this.hi << 1 | this.lo >>> 31) ^ mask) >>> 0;
      this.lo = (this.lo << 1 ^ mask) >>> 0;
      return this;
    };
    LongBits.prototype.zzDecode = function zzDecode() {
      var mask = -(this.lo & 1);
      this.lo = ((this.lo >>> 1 | this.hi << 31) ^ mask) >>> 0;
      this.hi = (this.hi >>> 1 ^ mask) >>> 0;
      return this;
    };
    LongBits.prototype.length = function length() {
      var part0 = this.lo, part1 = (this.lo >>> 28 | this.hi << 4) >>> 0, part2 = this.hi >>> 24;
      return part2 === 0 ? part1 === 0 ? part0 < 16384 ? part0 < 128 ? 1 : 2 : part0 < 2097152 ? 3 : 4 : part1 < 16384 ? part1 < 128 ? 5 : 6 : part1 < 2097152 ? 7 : 8 : part2 < 128 ? 9 : 10;
    };
  }
});

// node_modules/protobufjs/src/util/minimal.js
var require_minimal = __commonJS({
  "node_modules/protobufjs/src/util/minimal.js"(exports) {
    "use strict";
    var util = exports;
    util.asPromise = require_aspromise();
    util.base64 = require_base64();
    util.EventEmitter = require_eventemitter();
    util.float = require_float();
    util.inquire = require_inquire();
    util.utf8 = require_utf8();
    util.pool = require_pool();
    util.LongBits = require_longbits();
    util.isNode = Boolean(typeof global !== "undefined" && global && global.process && global.process.versions && global.process.versions.node);
    util.global = util.isNode && global || typeof window !== "undefined" && window || typeof self !== "undefined" && self || exports;
    util.emptyArray = Object.freeze ? Object.freeze([]) : (
      /* istanbul ignore next */
      []
    );
    util.emptyObject = Object.freeze ? Object.freeze({}) : (
      /* istanbul ignore next */
      {}
    );
    util.isInteger = Number.isInteger || /* istanbul ignore next */
    function isInteger(value) {
      return typeof value === "number" && isFinite(value) && Math.floor(value) === value;
    };
    util.isString = function isString(value) {
      return typeof value === "string" || value instanceof String;
    };
    util.isObject = function isObject5(value) {
      return value && typeof value === "object";
    };
    util.isset = /**
     * Checks if a property on a message is considered to be present.
     * @param {Object} obj Plain object or message instance
     * @param {string} prop Property name
     * @returns {boolean} `true` if considered to be present, otherwise `false`
     */
    util.isSet = function isSet16(obj, prop) {
      var value = obj[prop];
      if (value != null && obj.hasOwnProperty(prop))
        return typeof value !== "object" || (Array.isArray(value) ? value.length : Object.keys(value).length) > 0;
      return false;
    };
    util.Buffer = (function() {
      try {
        var Buffer2 = util.inquire("buffer").Buffer;
        return Buffer2.prototype.utf8Write ? Buffer2 : (
          /* istanbul ignore next */
          null
        );
      } catch (e) {
        return null;
      }
    })();
    util._Buffer_from = null;
    util._Buffer_allocUnsafe = null;
    util.newBuffer = function newBuffer(sizeOrArray) {
      return typeof sizeOrArray === "number" ? util.Buffer ? util._Buffer_allocUnsafe(sizeOrArray) : new util.Array(sizeOrArray) : util.Buffer ? util._Buffer_from(sizeOrArray) : typeof Uint8Array === "undefined" ? sizeOrArray : new Uint8Array(sizeOrArray);
    };
    util.Array = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
    util.Long = /* istanbul ignore next */
    util.global.dcodeIO && /* istanbul ignore next */
    util.global.dcodeIO.Long || /* istanbul ignore next */
    util.global.Long || util.inquire("long");
    util.key2Re = /^true|false|0|1$/;
    util.key32Re = /^-?(?:0|[1-9][0-9]*)$/;
    util.key64Re = /^(?:[\\x00-\\xff]{8}|-?(?:0|[1-9][0-9]*))$/;
    util.longToHash = function longToHash(value) {
      return value ? util.LongBits.from(value).toHash() : util.LongBits.zeroHash;
    };
    util.longFromHash = function longFromHash(hash, unsigned) {
      var bits = util.LongBits.fromHash(hash);
      if (util.Long)
        return util.Long.fromBits(bits.lo, bits.hi, unsigned);
      return bits.toNumber(Boolean(unsigned));
    };
    function merge(dst, src, ifNotSet) {
      for (var keys = Object.keys(src), i = 0; i < keys.length; ++i)
        if (dst[keys[i]] === void 0 || !ifNotSet)
          dst[keys[i]] = src[keys[i]];
      return dst;
    }
    util.merge = merge;
    util.lcFirst = function lcFirst(str) {
      return str.charAt(0).toLowerCase() + str.substring(1);
    };
    function newError(name) {
      function CustomError(message, properties) {
        if (!(this instanceof CustomError))
          return new CustomError(message, properties);
        Object.defineProperty(this, "message", { get: function() {
          return message;
        } });
        if (Error.captureStackTrace)
          Error.captureStackTrace(this, CustomError);
        else
          Object.defineProperty(this, "stack", { value: new Error().stack || "" });
        if (properties)
          merge(this, properties);
      }
      CustomError.prototype = Object.create(Error.prototype, {
        constructor: {
          value: CustomError,
          writable: true,
          enumerable: false,
          configurable: true
        },
        name: {
          get: function get() {
            return name;
          },
          set: void 0,
          enumerable: false,
          // configurable: false would accurately preserve the behavior of
          // the original, but I'm guessing that was not intentional.
          // For an actual error subclass, this property would
          // be configurable.
          configurable: true
        },
        toString: {
          value: function value() {
            return this.name + ": " + this.message;
          },
          writable: true,
          enumerable: false,
          configurable: true
        }
      });
      return CustomError;
    }
    util.newError = newError;
    util.ProtocolError = newError("ProtocolError");
    util.oneOfGetter = function getOneOf(fieldNames) {
      var fieldMap = {};
      for (var i = 0; i < fieldNames.length; ++i)
        fieldMap[fieldNames[i]] = 1;
      return function() {
        for (var keys = Object.keys(this), i2 = keys.length - 1; i2 > -1; --i2)
          if (fieldMap[keys[i2]] === 1 && this[keys[i2]] !== void 0 && this[keys[i2]] !== null)
            return keys[i2];
      };
    };
    util.oneOfSetter = function setOneOf(fieldNames) {
      return function(name) {
        for (var i = 0; i < fieldNames.length; ++i)
          if (fieldNames[i] !== name)
            delete this[fieldNames[i]];
      };
    };
    util.toJSONOptions = {
      longs: String,
      enums: String,
      bytes: String,
      json: true
    };
    util._configure = function() {
      var Buffer2 = util.Buffer;
      if (!Buffer2) {
        util._Buffer_from = util._Buffer_allocUnsafe = null;
        return;
      }
      util._Buffer_from = Buffer2.from !== Uint8Array.from && Buffer2.from || /* istanbul ignore next */
      function Buffer_from(value, encoding) {
        return new Buffer2(value, encoding);
      };
      util._Buffer_allocUnsafe = Buffer2.allocUnsafe || /* istanbul ignore next */
      function Buffer_allocUnsafe(size) {
        return new Buffer2(size);
      };
    };
  }
});

// node_modules/protobufjs/src/writer.js
var require_writer = __commonJS({
  "node_modules/protobufjs/src/writer.js"(exports, module) {
    "use strict";
    module.exports = Writer;
    var util = require_minimal();
    var BufferWriter;
    var LongBits = util.LongBits;
    var base64 = util.base64;
    var utf8 = util.utf8;
    function Op(fn, len, val) {
      this.fn = fn;
      this.len = len;
      this.next = void 0;
      this.val = val;
    }
    function noop() {
    }
    function State(writer) {
      this.head = writer.head;
      this.tail = writer.tail;
      this.len = writer.len;
      this.next = writer.states;
    }
    function Writer() {
      this.len = 0;
      this.head = new Op(noop, 0, 0);
      this.tail = this.head;
      this.states = null;
    }
    var create = function create2() {
      return util.Buffer ? function create_buffer_setup() {
        return (Writer.create = function create_buffer() {
          return new BufferWriter();
        })();
      } : function create_array() {
        return new Writer();
      };
    };
    Writer.create = create();
    Writer.alloc = function alloc(size) {
      return new util.Array(size);
    };
    if (util.Array !== Array)
      Writer.alloc = util.pool(Writer.alloc, util.Array.prototype.subarray);
    Writer.prototype._push = function push(fn, len, val) {
      this.tail = this.tail.next = new Op(fn, len, val);
      this.len += len;
      return this;
    };
    function writeByte(val, buf, pos) {
      buf[pos] = val & 255;
    }
    function writeVarint32(val, buf, pos) {
      while (val > 127) {
        buf[pos++] = val & 127 | 128;
        val >>>= 7;
      }
      buf[pos] = val;
    }
    function VarintOp(len, val) {
      this.len = len;
      this.next = void 0;
      this.val = val;
    }
    VarintOp.prototype = Object.create(Op.prototype);
    VarintOp.prototype.fn = writeVarint32;
    Writer.prototype.uint32 = function write_uint32(value) {
      this.len += (this.tail = this.tail.next = new VarintOp(
        (value = value >>> 0) < 128 ? 1 : value < 16384 ? 2 : value < 2097152 ? 3 : value < 268435456 ? 4 : 5,
        value
      )).len;
      return this;
    };
    Writer.prototype.int32 = function write_int32(value) {
      return value < 0 ? this._push(writeVarint64, 10, LongBits.fromNumber(value)) : this.uint32(value);
    };
    Writer.prototype.sint32 = function write_sint32(value) {
      return this.uint32((value << 1 ^ value >> 31) >>> 0);
    };
    function writeVarint64(val, buf, pos) {
      while (val.hi) {
        buf[pos++] = val.lo & 127 | 128;
        val.lo = (val.lo >>> 7 | val.hi << 25) >>> 0;
        val.hi >>>= 7;
      }
      while (val.lo > 127) {
        buf[pos++] = val.lo & 127 | 128;
        val.lo = val.lo >>> 7;
      }
      buf[pos++] = val.lo;
    }
    Writer.prototype.uint64 = function write_uint64(value) {
      var bits = LongBits.from(value);
      return this._push(writeVarint64, bits.length(), bits);
    };
    Writer.prototype.int64 = Writer.prototype.uint64;
    Writer.prototype.sint64 = function write_sint64(value) {
      var bits = LongBits.from(value).zzEncode();
      return this._push(writeVarint64, bits.length(), bits);
    };
    Writer.prototype.bool = function write_bool(value) {
      return this._push(writeByte, 1, value ? 1 : 0);
    };
    function writeFixed32(val, buf, pos) {
      buf[pos] = val & 255;
      buf[pos + 1] = val >>> 8 & 255;
      buf[pos + 2] = val >>> 16 & 255;
      buf[pos + 3] = val >>> 24;
    }
    Writer.prototype.fixed32 = function write_fixed32(value) {
      return this._push(writeFixed32, 4, value >>> 0);
    };
    Writer.prototype.sfixed32 = Writer.prototype.fixed32;
    Writer.prototype.fixed64 = function write_fixed64(value) {
      var bits = LongBits.from(value);
      return this._push(writeFixed32, 4, bits.lo)._push(writeFixed32, 4, bits.hi);
    };
    Writer.prototype.sfixed64 = Writer.prototype.fixed64;
    Writer.prototype.float = function write_float(value) {
      return this._push(util.float.writeFloatLE, 4, value);
    };
    Writer.prototype.double = function write_double(value) {
      return this._push(util.float.writeDoubleLE, 8, value);
    };
    var writeBytes = util.Array.prototype.set ? function writeBytes_set(val, buf, pos) {
      buf.set(val, pos);
    } : function writeBytes_for(val, buf, pos) {
      for (var i = 0; i < val.length; ++i)
        buf[pos + i] = val[i];
    };
    Writer.prototype.bytes = function write_bytes(value) {
      var len = value.length >>> 0;
      if (!len)
        return this._push(writeByte, 1, 0);
      if (util.isString(value)) {
        var buf = Writer.alloc(len = base64.length(value));
        base64.decode(value, buf, 0);
        value = buf;
      }
      return this.uint32(len)._push(writeBytes, len, value);
    };
    Writer.prototype.string = function write_string(value) {
      var len = utf8.length(value);
      return len ? this.uint32(len)._push(utf8.write, len, value) : this._push(writeByte, 1, 0);
    };
    Writer.prototype.fork = function fork() {
      this.states = new State(this);
      this.head = this.tail = new Op(noop, 0, 0);
      this.len = 0;
      return this;
    };
    Writer.prototype.reset = function reset() {
      if (this.states) {
        this.head = this.states.head;
        this.tail = this.states.tail;
        this.len = this.states.len;
        this.states = this.states.next;
      } else {
        this.head = this.tail = new Op(noop, 0, 0);
        this.len = 0;
      }
      return this;
    };
    Writer.prototype.ldelim = function ldelim() {
      var head = this.head, tail = this.tail, len = this.len;
      this.reset().uint32(len);
      if (len) {
        this.tail.next = head.next;
        this.tail = tail;
        this.len += len;
      }
      return this;
    };
    Writer.prototype.finish = function finish() {
      var head = this.head.next, buf = this.constructor.alloc(this.len), pos = 0;
      while (head) {
        head.fn(head.val, buf, pos);
        pos += head.len;
        head = head.next;
      }
      return buf;
    };
    Writer._configure = function(BufferWriter_) {
      BufferWriter = BufferWriter_;
      Writer.create = create();
      BufferWriter._configure();
    };
  }
});

// node_modules/protobufjs/src/writer_buffer.js
var require_writer_buffer = __commonJS({
  "node_modules/protobufjs/src/writer_buffer.js"(exports, module) {
    "use strict";
    module.exports = BufferWriter;
    var Writer = require_writer();
    (BufferWriter.prototype = Object.create(Writer.prototype)).constructor = BufferWriter;
    var util = require_minimal();
    function BufferWriter() {
      Writer.call(this);
    }
    BufferWriter._configure = function() {
      BufferWriter.alloc = util._Buffer_allocUnsafe;
      BufferWriter.writeBytesBuffer = util.Buffer && util.Buffer.prototype instanceof Uint8Array && util.Buffer.prototype.set.name === "set" ? function writeBytesBuffer_set(val, buf, pos) {
        buf.set(val, pos);
      } : function writeBytesBuffer_copy(val, buf, pos) {
        if (val.copy)
          val.copy(buf, pos, 0, val.length);
        else for (var i = 0; i < val.length; )
          buf[pos++] = val[i++];
      };
    };
    BufferWriter.prototype.bytes = function write_bytes_buffer(value) {
      if (util.isString(value))
        value = util._Buffer_from(value, "base64");
      var len = value.length >>> 0;
      this.uint32(len);
      if (len)
        this._push(BufferWriter.writeBytesBuffer, len, value);
      return this;
    };
    function writeStringBuffer(val, buf, pos) {
      if (val.length < 40)
        util.utf8.write(val, buf, pos);
      else if (buf.utf8Write)
        buf.utf8Write(val, pos);
      else
        buf.write(val, pos);
    }
    BufferWriter.prototype.string = function write_string_buffer(value) {
      var len = util.Buffer.byteLength(value);
      this.uint32(len);
      if (len)
        this._push(writeStringBuffer, len, value);
      return this;
    };
    BufferWriter._configure();
  }
});

// node_modules/protobufjs/src/reader.js
var require_reader = __commonJS({
  "node_modules/protobufjs/src/reader.js"(exports, module) {
    "use strict";
    module.exports = Reader;
    var util = require_minimal();
    var BufferReader;
    var LongBits = util.LongBits;
    var utf8 = util.utf8;
    function indexOutOfRange(reader, writeLength) {
      return RangeError("index out of range: " + reader.pos + " + " + (writeLength || 1) + " > " + reader.len);
    }
    function Reader(buffer) {
      this.buf = buffer;
      this.pos = 0;
      this.len = buffer.length;
    }
    var create_array = typeof Uint8Array !== "undefined" ? function create_typed_array(buffer) {
      if (buffer instanceof Uint8Array || Array.isArray(buffer))
        return new Reader(buffer);
      throw Error("illegal buffer");
    } : function create_array2(buffer) {
      if (Array.isArray(buffer))
        return new Reader(buffer);
      throw Error("illegal buffer");
    };
    var create = function create2() {
      return util.Buffer ? function create_buffer_setup(buffer) {
        return (Reader.create = function create_buffer(buffer2) {
          return util.Buffer.isBuffer(buffer2) ? new BufferReader(buffer2) : create_array(buffer2);
        })(buffer);
      } : create_array;
    };
    Reader.create = create();
    Reader.prototype._slice = util.Array.prototype.subarray || /* istanbul ignore next */
    util.Array.prototype.slice;
    Reader.prototype.uint32 = /* @__PURE__ */ (function read_uint32_setup() {
      var value = 4294967295;
      return function read_uint32() {
        value = (this.buf[this.pos] & 127) >>> 0;
        if (this.buf[this.pos++] < 128) return value;
        value = (value | (this.buf[this.pos] & 127) << 7) >>> 0;
        if (this.buf[this.pos++] < 128) return value;
        value = (value | (this.buf[this.pos] & 127) << 14) >>> 0;
        if (this.buf[this.pos++] < 128) return value;
        value = (value | (this.buf[this.pos] & 127) << 21) >>> 0;
        if (this.buf[this.pos++] < 128) return value;
        value = (value | (this.buf[this.pos] & 15) << 28) >>> 0;
        if (this.buf[this.pos++] < 128) return value;
        if ((this.pos += 5) > this.len) {
          this.pos = this.len;
          throw indexOutOfRange(this, 10);
        }
        return value;
      };
    })();
    Reader.prototype.int32 = function read_int32() {
      return this.uint32() | 0;
    };
    Reader.prototype.sint32 = function read_sint32() {
      var value = this.uint32();
      return value >>> 1 ^ -(value & 1) | 0;
    };
    function readLongVarint() {
      var bits = new LongBits(0, 0);
      var i = 0;
      if (this.len - this.pos > 4) {
        for (; i < 4; ++i) {
          bits.lo = (bits.lo | (this.buf[this.pos] & 127) << i * 7) >>> 0;
          if (this.buf[this.pos++] < 128)
            return bits;
        }
        bits.lo = (bits.lo | (this.buf[this.pos] & 127) << 28) >>> 0;
        bits.hi = (bits.hi | (this.buf[this.pos] & 127) >> 4) >>> 0;
        if (this.buf[this.pos++] < 128)
          return bits;
        i = 0;
      } else {
        for (; i < 3; ++i) {
          if (this.pos >= this.len)
            throw indexOutOfRange(this);
          bits.lo = (bits.lo | (this.buf[this.pos] & 127) << i * 7) >>> 0;
          if (this.buf[this.pos++] < 128)
            return bits;
        }
        bits.lo = (bits.lo | (this.buf[this.pos++] & 127) << i * 7) >>> 0;
        return bits;
      }
      if (this.len - this.pos > 4) {
        for (; i < 5; ++i) {
          bits.hi = (bits.hi | (this.buf[this.pos] & 127) << i * 7 + 3) >>> 0;
          if (this.buf[this.pos++] < 128)
            return bits;
        }
      } else {
        for (; i < 5; ++i) {
          if (this.pos >= this.len)
            throw indexOutOfRange(this);
          bits.hi = (bits.hi | (this.buf[this.pos] & 127) << i * 7 + 3) >>> 0;
          if (this.buf[this.pos++] < 128)
            return bits;
        }
      }
      throw Error("invalid varint encoding");
    }
    Reader.prototype.bool = function read_bool() {
      return this.uint32() !== 0;
    };
    function readFixed32_end(buf, end) {
      return (buf[end - 4] | buf[end - 3] << 8 | buf[end - 2] << 16 | buf[end - 1] << 24) >>> 0;
    }
    Reader.prototype.fixed32 = function read_fixed32() {
      if (this.pos + 4 > this.len)
        throw indexOutOfRange(this, 4);
      return readFixed32_end(this.buf, this.pos += 4);
    };
    Reader.prototype.sfixed32 = function read_sfixed32() {
      if (this.pos + 4 > this.len)
        throw indexOutOfRange(this, 4);
      return readFixed32_end(this.buf, this.pos += 4) | 0;
    };
    function readFixed64() {
      if (this.pos + 8 > this.len)
        throw indexOutOfRange(this, 8);
      return new LongBits(readFixed32_end(this.buf, this.pos += 4), readFixed32_end(this.buf, this.pos += 4));
    }
    Reader.prototype.float = function read_float() {
      if (this.pos + 4 > this.len)
        throw indexOutOfRange(this, 4);
      var value = util.float.readFloatLE(this.buf, this.pos);
      this.pos += 4;
      return value;
    };
    Reader.prototype.double = function read_double() {
      if (this.pos + 8 > this.len)
        throw indexOutOfRange(this, 4);
      var value = util.float.readDoubleLE(this.buf, this.pos);
      this.pos += 8;
      return value;
    };
    Reader.prototype.bytes = function read_bytes() {
      var length = this.uint32(), start = this.pos, end = this.pos + length;
      if (end > this.len)
        throw indexOutOfRange(this, length);
      this.pos += length;
      if (Array.isArray(this.buf))
        return this.buf.slice(start, end);
      if (start === end) {
        var nativeBuffer = util.Buffer;
        return nativeBuffer ? nativeBuffer.alloc(0) : new this.buf.constructor(0);
      }
      return this._slice.call(this.buf, start, end);
    };
    Reader.prototype.string = function read_string() {
      var bytes = this.bytes();
      return utf8.read(bytes, 0, bytes.length);
    };
    Reader.prototype.skip = function skip(length) {
      if (typeof length === "number") {
        if (this.pos + length > this.len)
          throw indexOutOfRange(this, length);
        this.pos += length;
      } else {
        do {
          if (this.pos >= this.len)
            throw indexOutOfRange(this);
        } while (this.buf[this.pos++] & 128);
      }
      return this;
    };
    Reader.prototype.skipType = function(wireType) {
      switch (wireType) {
        case 0:
          this.skip();
          break;
        case 1:
          this.skip(8);
          break;
        case 2:
          this.skip(this.uint32());
          break;
        case 3:
          while ((wireType = this.uint32() & 7) !== 4) {
            this.skipType(wireType);
          }
          break;
        case 5:
          this.skip(4);
          break;
        /* istanbul ignore next */
        default:
          throw Error("invalid wire type " + wireType + " at offset " + this.pos);
      }
      return this;
    };
    Reader._configure = function(BufferReader_) {
      BufferReader = BufferReader_;
      Reader.create = create();
      BufferReader._configure();
      var fn = util.Long ? "toLong" : (
        /* istanbul ignore next */
        "toNumber"
      );
      util.merge(Reader.prototype, {
        int64: function read_int64() {
          return readLongVarint.call(this)[fn](false);
        },
        uint64: function read_uint64() {
          return readLongVarint.call(this)[fn](true);
        },
        sint64: function read_sint64() {
          return readLongVarint.call(this).zzDecode()[fn](false);
        },
        fixed64: function read_fixed64() {
          return readFixed64.call(this)[fn](true);
        },
        sfixed64: function read_sfixed64() {
          return readFixed64.call(this)[fn](false);
        }
      });
    };
  }
});

// node_modules/protobufjs/src/reader_buffer.js
var require_reader_buffer = __commonJS({
  "node_modules/protobufjs/src/reader_buffer.js"(exports, module) {
    "use strict";
    module.exports = BufferReader;
    var Reader = require_reader();
    (BufferReader.prototype = Object.create(Reader.prototype)).constructor = BufferReader;
    var util = require_minimal();
    function BufferReader(buffer) {
      Reader.call(this, buffer);
    }
    BufferReader._configure = function() {
      if (util.Buffer)
        BufferReader.prototype._slice = util.Buffer.prototype.slice;
    };
    BufferReader.prototype.string = function read_string_buffer() {
      var len = this.uint32();
      return this.buf.utf8Slice ? this.buf.utf8Slice(this.pos, this.pos = Math.min(this.pos + len, this.len)) : this.buf.toString("utf-8", this.pos, this.pos = Math.min(this.pos + len, this.len));
    };
    BufferReader._configure();
  }
});

// node_modules/protobufjs/src/rpc/service.js
var require_service = __commonJS({
  "node_modules/protobufjs/src/rpc/service.js"(exports, module) {
    "use strict";
    module.exports = Service;
    var util = require_minimal();
    (Service.prototype = Object.create(util.EventEmitter.prototype)).constructor = Service;
    function Service(rpcImpl, requestDelimited, responseDelimited) {
      if (typeof rpcImpl !== "function")
        throw TypeError("rpcImpl must be a function");
      util.EventEmitter.call(this);
      this.rpcImpl = rpcImpl;
      this.requestDelimited = Boolean(requestDelimited);
      this.responseDelimited = Boolean(responseDelimited);
    }
    Service.prototype.rpcCall = function rpcCall(method, requestCtor, responseCtor, request, callback) {
      if (!request)
        throw TypeError("request must be specified");
      var self2 = this;
      if (!callback)
        return util.asPromise(rpcCall, self2, method, requestCtor, responseCtor, request);
      if (!self2.rpcImpl) {
        setTimeout(function() {
          callback(Error("already ended"));
        }, 0);
        return void 0;
      }
      try {
        return self2.rpcImpl(
          method,
          requestCtor[self2.requestDelimited ? "encodeDelimited" : "encode"](request).finish(),
          function rpcCallback(err, response) {
            if (err) {
              self2.emit("error", err, method);
              return callback(err);
            }
            if (response === null) {
              self2.end(
                /* endedByRPC */
                true
              );
              return void 0;
            }
            if (!(response instanceof responseCtor)) {
              try {
                response = responseCtor[self2.responseDelimited ? "decodeDelimited" : "decode"](response);
              } catch (err2) {
                self2.emit("error", err2, method);
                return callback(err2);
              }
            }
            self2.emit("data", response, method);
            return callback(null, response);
          }
        );
      } catch (err) {
        self2.emit("error", err, method);
        setTimeout(function() {
          callback(err);
        }, 0);
        return void 0;
      }
    };
    Service.prototype.end = function end(endedByRPC) {
      if (this.rpcImpl) {
        if (!endedByRPC)
          this.rpcImpl(null, null, null);
        this.rpcImpl = null;
        this.emit("end").off();
      }
      return this;
    };
  }
});

// node_modules/protobufjs/src/rpc.js
var require_rpc = __commonJS({
  "node_modules/protobufjs/src/rpc.js"(exports) {
    "use strict";
    var rpc = exports;
    rpc.Service = require_service();
  }
});

// node_modules/protobufjs/src/roots.js
var require_roots = __commonJS({
  "node_modules/protobufjs/src/roots.js"(exports, module) {
    "use strict";
    module.exports = {};
  }
});

// node_modules/protobufjs/src/index-minimal.js
var require_index_minimal = __commonJS({
  "node_modules/protobufjs/src/index-minimal.js"(exports) {
    "use strict";
    var protobuf = exports;
    protobuf.build = "minimal";
    protobuf.Writer = require_writer();
    protobuf.BufferWriter = require_writer_buffer();
    protobuf.Reader = require_reader();
    protobuf.BufferReader = require_reader_buffer();
    protobuf.util = require_minimal();
    protobuf.rpc = require_rpc();
    protobuf.roots = require_roots();
    protobuf.configure = configure;
    function configure() {
      protobuf.util._configure();
      protobuf.Writer._configure(protobuf.BufferWriter);
      protobuf.Reader._configure(protobuf.BufferReader);
    }
    configure();
  }
});

// node_modules/protobufjs/minimal.js
var require_minimal2 = __commonJS({
  "node_modules/protobufjs/minimal.js"(exports, module) {
    "use strict";
    module.exports = require_index_minimal();
  }
});

// node_modules/@devvit/protos/json/devvit/ui/effects/v1alpha/effect.js
var EffectType;
(function(EffectType2) {
  EffectType2[EffectType2["EFFECT_REALTIME_SUB"] = 0] = "EFFECT_REALTIME_SUB";
  EffectType2[EffectType2["EFFECT_RERENDER_UI"] = 1] = "EFFECT_RERENDER_UI";
  EffectType2[EffectType2["EFFECT_RELOAD_PART"] = 2] = "EFFECT_RELOAD_PART";
  EffectType2[EffectType2["EFFECT_SHOW_FORM"] = 3] = "EFFECT_SHOW_FORM";
  EffectType2[EffectType2["EFFECT_SHOW_TOAST"] = 4] = "EFFECT_SHOW_TOAST";
  EffectType2[EffectType2["EFFECT_NAVIGATE_TO_URL"] = 5] = "EFFECT_NAVIGATE_TO_URL";
  EffectType2[EffectType2["EFFECT_SET_INTERVALS"] = 7] = "EFFECT_SET_INTERVALS";
  EffectType2[EffectType2["EFFECT_CREATE_ORDER"] = 8] = "EFFECT_CREATE_ORDER";
  EffectType2[EffectType2["EFFECT_WEB_VIEW"] = 9] = "EFFECT_WEB_VIEW";
  EffectType2[EffectType2["EFFECT_CAN_RUN_AS_USER"] = 11] = "EFFECT_CAN_RUN_AS_USER";
  EffectType2[EffectType2["EFFECT_TELEMETRY"] = 12] = "EFFECT_TELEMETRY";
  EffectType2[EffectType2["EFFECT_UPDATE_REQUEST_CONTEXT"] = 13] = "EFFECT_UPDATE_REQUEST_CONTEXT";
  EffectType2[EffectType2["EFFECT_SCREENSHOT_RESPONSE"] = 14] = "EFFECT_SCREENSHOT_RESPONSE";
  EffectType2[EffectType2["EFFECT_LOGIN_PROMPT"] = 15] = "EFFECT_LOGIN_PROMPT";
  EffectType2[EffectType2["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(EffectType || (EffectType = {}));

// node_modules/@devvit/protos/json/devvit/ui/effects/web_view/v1alpha/immersive_mode.js
var WebViewImmersiveMode;
(function(WebViewImmersiveMode3) {
  WebViewImmersiveMode3[WebViewImmersiveMode3["UNSPECIFIED"] = 0] = "UNSPECIFIED";
  WebViewImmersiveMode3[WebViewImmersiveMode3["INLINE_MODE"] = 1] = "INLINE_MODE";
  WebViewImmersiveMode3[WebViewImmersiveMode3["IMMERSIVE_MODE"] = 2] = "IMMERSIVE_MODE";
  WebViewImmersiveMode3[WebViewImmersiveMode3["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(WebViewImmersiveMode || (WebViewImmersiveMode = {}));

// node_modules/@devvit/protos/json/devvit/ui/effects/web_view/v1alpha/post_message.js
var WebViewInternalMessageScope;
(function(WebViewInternalMessageScope2) {
  WebViewInternalMessageScope2[WebViewInternalMessageScope2["CLIENT"] = 0] = "CLIENT";
  WebViewInternalMessageScope2[WebViewInternalMessageScope2["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(WebViewInternalMessageScope || (WebViewInternalMessageScope = {}));

// node_modules/@devvit/protos/types/devvit/ui/events/v1alpha/web_view.js
var import_minimal16 = __toESM(require_minimal2(), 1);

// node_modules/@devvit/protos/types/google/protobuf/struct.js
var import_minimal = __toESM(require_minimal2(), 1);

// node_modules/@devvit/protos/types/typeRegistry.js
var messageTypeRegistry = /* @__PURE__ */ new Map();

// node_modules/@devvit/protos/types/google/protobuf/struct.js
var NullValue;
(function(NullValue2) {
  NullValue2[NullValue2["NULL_VALUE"] = 0] = "NULL_VALUE";
  NullValue2[NullValue2["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(NullValue || (NullValue = {}));
function nullValueFromJSON(object) {
  switch (object) {
    case 0:
    case "NULL_VALUE":
      return NullValue.NULL_VALUE;
    case -1:
    case "UNRECOGNIZED":
    default:
      return NullValue.UNRECOGNIZED;
  }
}
function nullValueToJSON(object) {
  switch (object) {
    case NullValue.NULL_VALUE:
      return 0;
    case NullValue.UNRECOGNIZED:
    default:
      return -1;
  }
}
function createBaseStruct() {
  return { fields: {} };
}
var Struct = {
  $type: "google.protobuf.Struct",
  encode(message, writer = import_minimal.default.Writer.create()) {
    Object.entries(message.fields).forEach(([key, value]) => {
      if (value !== void 0) {
        Struct_FieldsEntry.encode({ key, value }, writer.uint32(10).fork()).ldelim();
      }
    });
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal.default.Reader ? input : import_minimal.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseStruct();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          const entry1 = Struct_FieldsEntry.decode(reader, reader.uint32());
          if (entry1.value !== void 0) {
            message.fields[entry1.key] = entry1.value;
          }
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      fields: isObject(object.fields) ? Object.entries(object.fields).reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {}) : {}
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.fields) {
      const entries = Object.entries(message.fields);
      if (entries.length > 0) {
        obj.fields = {};
        entries.forEach(([k, v]) => {
          obj.fields[k] = v;
        });
      }
    }
    return obj;
  },
  create(base) {
    return Struct.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseStruct();
    message.fields = Object.entries(object.fields ?? {}).reduce((acc, [key, value]) => {
      if (value !== void 0) {
        acc[key] = value;
      }
      return acc;
    }, {});
    return message;
  },
  wrap(object) {
    const struct = createBaseStruct();
    if (object !== void 0) {
      for (const key of Object.keys(object)) {
        struct.fields[key] = object[key];
      }
    }
    return struct;
  },
  unwrap(message) {
    const object = {};
    if (message.fields) {
      for (const key of Object.keys(message.fields)) {
        object[key] = message.fields[key];
      }
    }
    return object;
  }
};
messageTypeRegistry.set(Struct.$type, Struct);
function createBaseStruct_FieldsEntry() {
  return { key: "", value: void 0 };
}
var Struct_FieldsEntry = {
  $type: "google.protobuf.Struct.FieldsEntry",
  encode(message, writer = import_minimal.default.Writer.create()) {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== void 0) {
      Value.encode(Value.wrap(message.value), writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal.default.Reader ? input : import_minimal.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseStruct_FieldsEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.key = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }
          message.value = Value.unwrap(Value.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      key: isSet(object.key) ? globalThis.String(object.key) : "",
      value: isSet(object?.value) ? object.value : void 0
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.key !== "") {
      obj.key = message.key;
    }
    if (message.value !== void 0) {
      obj.value = message.value;
    }
    return obj;
  },
  create(base) {
    return Struct_FieldsEntry.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseStruct_FieldsEntry();
    message.key = object.key ?? "";
    message.value = object.value ?? void 0;
    return message;
  }
};
messageTypeRegistry.set(Struct_FieldsEntry.$type, Struct_FieldsEntry);
function createBaseValue() {
  return {
    nullValue: void 0,
    numberValue: void 0,
    stringValue: void 0,
    boolValue: void 0,
    structValue: void 0,
    listValue: void 0
  };
}
var Value = {
  $type: "google.protobuf.Value",
  encode(message, writer = import_minimal.default.Writer.create()) {
    if (message.nullValue !== void 0) {
      writer.uint32(8).int32(message.nullValue);
    }
    if (message.numberValue !== void 0) {
      writer.uint32(17).double(message.numberValue);
    }
    if (message.stringValue !== void 0) {
      writer.uint32(26).string(message.stringValue);
    }
    if (message.boolValue !== void 0) {
      writer.uint32(32).bool(message.boolValue);
    }
    if (message.structValue !== void 0) {
      Struct.encode(Struct.wrap(message.structValue), writer.uint32(42).fork()).ldelim();
    }
    if (message.listValue !== void 0) {
      ListValue.encode(ListValue.wrap(message.listValue), writer.uint32(50).fork()).ldelim();
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal.default.Reader ? input : import_minimal.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseValue();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }
          message.nullValue = reader.int32();
          continue;
        case 2:
          if (tag !== 17) {
            break;
          }
          message.numberValue = reader.double();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }
          message.stringValue = reader.string();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }
          message.boolValue = reader.bool();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }
          message.structValue = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }
          message.listValue = ListValue.unwrap(ListValue.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      nullValue: isSet(object.nullValue) ? nullValueFromJSON(object.nullValue) : void 0,
      numberValue: isSet(object.numberValue) ? globalThis.Number(object.numberValue) : void 0,
      stringValue: isSet(object.stringValue) ? globalThis.String(object.stringValue) : void 0,
      boolValue: isSet(object.boolValue) ? globalThis.Boolean(object.boolValue) : void 0,
      structValue: isObject(object.structValue) ? object.structValue : void 0,
      listValue: globalThis.Array.isArray(object.listValue) ? [...object.listValue] : void 0
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.nullValue !== void 0) {
      obj.nullValue = nullValueToJSON(message.nullValue);
    }
    if (message.numberValue !== void 0) {
      obj.numberValue = message.numberValue;
    }
    if (message.stringValue !== void 0) {
      obj.stringValue = message.stringValue;
    }
    if (message.boolValue !== void 0) {
      obj.boolValue = message.boolValue;
    }
    if (message.structValue !== void 0) {
      obj.structValue = message.structValue;
    }
    if (message.listValue !== void 0) {
      obj.listValue = message.listValue;
    }
    return obj;
  },
  create(base) {
    return Value.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseValue();
    message.nullValue = object.nullValue ?? void 0;
    message.numberValue = object.numberValue ?? void 0;
    message.stringValue = object.stringValue ?? void 0;
    message.boolValue = object.boolValue ?? void 0;
    message.structValue = object.structValue ?? void 0;
    message.listValue = object.listValue ?? void 0;
    return message;
  },
  wrap(value) {
    const result = createBaseValue();
    if (value === null) {
      result.nullValue = NullValue.NULL_VALUE;
    } else if (typeof value === "boolean") {
      result.boolValue = value;
    } else if (typeof value === "number") {
      result.numberValue = value;
    } else if (typeof value === "string") {
      result.stringValue = value;
    } else if (globalThis.Array.isArray(value)) {
      result.listValue = value;
    } else if (typeof value === "object") {
      result.structValue = value;
    } else if (typeof value !== "undefined") {
      throw new globalThis.Error("Unsupported any value type: " + typeof value);
    }
    return result;
  },
  unwrap(message) {
    if (message.stringValue !== void 0) {
      return message.stringValue;
    } else if (message?.numberValue !== void 0) {
      return message.numberValue;
    } else if (message?.boolValue !== void 0) {
      return message.boolValue;
    } else if (message?.structValue !== void 0) {
      return message.structValue;
    } else if (message?.listValue !== void 0) {
      return message.listValue;
    } else if (message?.nullValue !== void 0) {
      return null;
    }
    return void 0;
  }
};
messageTypeRegistry.set(Value.$type, Value);
function createBaseListValue() {
  return { values: [] };
}
var ListValue = {
  $type: "google.protobuf.ListValue",
  encode(message, writer = import_minimal.default.Writer.create()) {
    for (const v of message.values) {
      Value.encode(Value.wrap(v), writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal.default.Reader ? input : import_minimal.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseListValue();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.values.push(Value.unwrap(Value.decode(reader, reader.uint32())));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return { values: globalThis.Array.isArray(object?.values) ? [...object.values] : [] };
  },
  toJSON(message) {
    const obj = {};
    if (message.values?.length) {
      obj.values = message.values;
    }
    return obj;
  },
  create(base) {
    return ListValue.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseListValue();
    message.values = object.values?.map((e) => e) || [];
    return message;
  },
  wrap(array) {
    const result = createBaseListValue();
    result.values = array ?? [];
    return result;
  },
  unwrap(message) {
    if (message?.hasOwnProperty("values") && globalThis.Array.isArray(message.values)) {
      return message.values;
    } else {
      return message;
    }
  }
};
messageTypeRegistry.set(ListValue.$type, ListValue);
function isObject(value) {
  return typeof value === "object" && value !== null;
}
function isSet(value) {
  return value !== null && value !== void 0;
}

// node_modules/@devvit/protos/types/devvit/ui/effect_types/v1alpha/app_permission.js
var import_minimal4 = __toESM(require_minimal2(), 1);

// node_modules/@devvit/protos/types/reddit/devvit/app_permission/v1/app_permission.js
var import_minimal3 = __toESM(require_minimal2(), 1);

// node_modules/long/index.js
var wasm = null;
try {
  wasm = new WebAssembly.Instance(
    new WebAssembly.Module(
      new Uint8Array([
        // \0asm
        0,
        97,
        115,
        109,
        // version 1
        1,
        0,
        0,
        0,
        // section "type"
        1,
        13,
        2,
        // 0, () => i32
        96,
        0,
        1,
        127,
        // 1, (i32, i32, i32, i32) => i32
        96,
        4,
        127,
        127,
        127,
        127,
        1,
        127,
        // section "function"
        3,
        7,
        6,
        // 0, type 0
        0,
        // 1, type 1
        1,
        // 2, type 1
        1,
        // 3, type 1
        1,
        // 4, type 1
        1,
        // 5, type 1
        1,
        // section "global"
        6,
        6,
        1,
        // 0, "high", mutable i32
        127,
        1,
        65,
        0,
        11,
        // section "export"
        7,
        50,
        6,
        // 0, "mul"
        3,
        109,
        117,
        108,
        0,
        1,
        // 1, "div_s"
        5,
        100,
        105,
        118,
        95,
        115,
        0,
        2,
        // 2, "div_u"
        5,
        100,
        105,
        118,
        95,
        117,
        0,
        3,
        // 3, "rem_s"
        5,
        114,
        101,
        109,
        95,
        115,
        0,
        4,
        // 4, "rem_u"
        5,
        114,
        101,
        109,
        95,
        117,
        0,
        5,
        // 5, "get_high"
        8,
        103,
        101,
        116,
        95,
        104,
        105,
        103,
        104,
        0,
        0,
        // section "code"
        10,
        191,
        1,
        6,
        // 0, "get_high"
        4,
        0,
        35,
        0,
        11,
        // 1, "mul"
        36,
        1,
        1,
        126,
        32,
        0,
        173,
        32,
        1,
        173,
        66,
        32,
        134,
        132,
        32,
        2,
        173,
        32,
        3,
        173,
        66,
        32,
        134,
        132,
        126,
        34,
        4,
        66,
        32,
        135,
        167,
        36,
        0,
        32,
        4,
        167,
        11,
        // 2, "div_s"
        36,
        1,
        1,
        126,
        32,
        0,
        173,
        32,
        1,
        173,
        66,
        32,
        134,
        132,
        32,
        2,
        173,
        32,
        3,
        173,
        66,
        32,
        134,
        132,
        127,
        34,
        4,
        66,
        32,
        135,
        167,
        36,
        0,
        32,
        4,
        167,
        11,
        // 3, "div_u"
        36,
        1,
        1,
        126,
        32,
        0,
        173,
        32,
        1,
        173,
        66,
        32,
        134,
        132,
        32,
        2,
        173,
        32,
        3,
        173,
        66,
        32,
        134,
        132,
        128,
        34,
        4,
        66,
        32,
        135,
        167,
        36,
        0,
        32,
        4,
        167,
        11,
        // 4, "rem_s"
        36,
        1,
        1,
        126,
        32,
        0,
        173,
        32,
        1,
        173,
        66,
        32,
        134,
        132,
        32,
        2,
        173,
        32,
        3,
        173,
        66,
        32,
        134,
        132,
        129,
        34,
        4,
        66,
        32,
        135,
        167,
        36,
        0,
        32,
        4,
        167,
        11,
        // 5, "rem_u"
        36,
        1,
        1,
        126,
        32,
        0,
        173,
        32,
        1,
        173,
        66,
        32,
        134,
        132,
        32,
        2,
        173,
        32,
        3,
        173,
        66,
        32,
        134,
        132,
        130,
        34,
        4,
        66,
        32,
        135,
        167,
        36,
        0,
        32,
        4,
        167,
        11
      ])
    ),
    {}
  ).exports;
} catch {
}
function Long(low, high, unsigned) {
  this.low = low | 0;
  this.high = high | 0;
  this.unsigned = !!unsigned;
}
Long.prototype.__isLong__;
Object.defineProperty(Long.prototype, "__isLong__", { value: true });
function isLong(obj) {
  return (obj && obj["__isLong__"]) === true;
}
function ctz32(value) {
  var c = Math.clz32(value & -value);
  return value ? 31 - c : c;
}
Long.isLong = isLong;
var INT_CACHE = {};
var UINT_CACHE = {};
function fromInt(value, unsigned) {
  var obj, cachedObj, cache;
  if (unsigned) {
    value >>>= 0;
    if (cache = 0 <= value && value < 256) {
      cachedObj = UINT_CACHE[value];
      if (cachedObj) return cachedObj;
    }
    obj = fromBits(value, 0, true);
    if (cache) UINT_CACHE[value] = obj;
    return obj;
  } else {
    value |= 0;
    if (cache = -128 <= value && value < 128) {
      cachedObj = INT_CACHE[value];
      if (cachedObj) return cachedObj;
    }
    obj = fromBits(value, value < 0 ? -1 : 0, false);
    if (cache) INT_CACHE[value] = obj;
    return obj;
  }
}
Long.fromInt = fromInt;
function fromNumber(value, unsigned) {
  if (isNaN(value)) return unsigned ? UZERO : ZERO;
  if (unsigned) {
    if (value < 0) return UZERO;
    if (value >= TWO_PWR_64_DBL) return MAX_UNSIGNED_VALUE;
  } else {
    if (value <= -TWO_PWR_63_DBL) return MIN_VALUE;
    if (value + 1 >= TWO_PWR_63_DBL) return MAX_VALUE;
  }
  if (value < 0) return fromNumber(-value, unsigned).neg();
  return fromBits(
    value % TWO_PWR_32_DBL | 0,
    value / TWO_PWR_32_DBL | 0,
    unsigned
  );
}
Long.fromNumber = fromNumber;
function fromBits(lowBits, highBits, unsigned) {
  return new Long(lowBits, highBits, unsigned);
}
Long.fromBits = fromBits;
var pow_dbl = Math.pow;
function fromString(str, unsigned, radix) {
  if (str.length === 0) throw Error("empty string");
  if (typeof unsigned === "number") {
    radix = unsigned;
    unsigned = false;
  } else {
    unsigned = !!unsigned;
  }
  if (str === "NaN" || str === "Infinity" || str === "+Infinity" || str === "-Infinity")
    return unsigned ? UZERO : ZERO;
  radix = radix || 10;
  if (radix < 2 || 36 < radix) throw RangeError("radix");
  var p;
  if ((p = str.indexOf("-")) > 0) throw Error("interior hyphen");
  else if (p === 0) {
    return fromString(str.substring(1), unsigned, radix).neg();
  }
  var radixToPower = fromNumber(pow_dbl(radix, 8));
  var result = ZERO;
  for (var i = 0; i < str.length; i += 8) {
    var size = Math.min(8, str.length - i), value = parseInt(str.substring(i, i + size), radix);
    if (size < 8) {
      var power = fromNumber(pow_dbl(radix, size));
      result = result.mul(power).add(fromNumber(value));
    } else {
      result = result.mul(radixToPower);
      result = result.add(fromNumber(value));
    }
  }
  result.unsigned = unsigned;
  return result;
}
Long.fromString = fromString;
function fromValue(val, unsigned) {
  if (typeof val === "number") return fromNumber(val, unsigned);
  if (typeof val === "string") return fromString(val, unsigned);
  return fromBits(
    val.low,
    val.high,
    typeof unsigned === "boolean" ? unsigned : val.unsigned
  );
}
Long.fromValue = fromValue;
var TWO_PWR_16_DBL = 1 << 16;
var TWO_PWR_24_DBL = 1 << 24;
var TWO_PWR_32_DBL = TWO_PWR_16_DBL * TWO_PWR_16_DBL;
var TWO_PWR_64_DBL = TWO_PWR_32_DBL * TWO_PWR_32_DBL;
var TWO_PWR_63_DBL = TWO_PWR_64_DBL / 2;
var TWO_PWR_24 = fromInt(TWO_PWR_24_DBL);
var ZERO = fromInt(0);
Long.ZERO = ZERO;
var UZERO = fromInt(0, true);
Long.UZERO = UZERO;
var ONE = fromInt(1);
Long.ONE = ONE;
var UONE = fromInt(1, true);
Long.UONE = UONE;
var NEG_ONE = fromInt(-1);
Long.NEG_ONE = NEG_ONE;
var MAX_VALUE = fromBits(4294967295 | 0, 2147483647 | 0, false);
Long.MAX_VALUE = MAX_VALUE;
var MAX_UNSIGNED_VALUE = fromBits(4294967295 | 0, 4294967295 | 0, true);
Long.MAX_UNSIGNED_VALUE = MAX_UNSIGNED_VALUE;
var MIN_VALUE = fromBits(0, 2147483648 | 0, false);
Long.MIN_VALUE = MIN_VALUE;
var LongPrototype = Long.prototype;
LongPrototype.toInt = function toInt() {
  return this.unsigned ? this.low >>> 0 : this.low;
};
LongPrototype.toNumber = function toNumber() {
  if (this.unsigned)
    return (this.high >>> 0) * TWO_PWR_32_DBL + (this.low >>> 0);
  return this.high * TWO_PWR_32_DBL + (this.low >>> 0);
};
LongPrototype.toString = function toString(radix) {
  radix = radix || 10;
  if (radix < 2 || 36 < radix) throw RangeError("radix");
  if (this.isZero()) return "0";
  if (this.isNegative()) {
    if (this.eq(MIN_VALUE)) {
      var radixLong = fromNumber(radix), div = this.div(radixLong), rem1 = div.mul(radixLong).sub(this);
      return div.toString(radix) + rem1.toInt().toString(radix);
    } else return "-" + this.neg().toString(radix);
  }
  var radixToPower = fromNumber(pow_dbl(radix, 6), this.unsigned), rem = this;
  var result = "";
  while (true) {
    var remDiv = rem.div(radixToPower), intval = rem.sub(remDiv.mul(radixToPower)).toInt() >>> 0, digits = intval.toString(radix);
    rem = remDiv;
    if (rem.isZero()) return digits + result;
    else {
      while (digits.length < 6) digits = "0" + digits;
      result = "" + digits + result;
    }
  }
};
LongPrototype.getHighBits = function getHighBits() {
  return this.high;
};
LongPrototype.getHighBitsUnsigned = function getHighBitsUnsigned() {
  return this.high >>> 0;
};
LongPrototype.getLowBits = function getLowBits() {
  return this.low;
};
LongPrototype.getLowBitsUnsigned = function getLowBitsUnsigned() {
  return this.low >>> 0;
};
LongPrototype.getNumBitsAbs = function getNumBitsAbs() {
  if (this.isNegative())
    return this.eq(MIN_VALUE) ? 64 : this.neg().getNumBitsAbs();
  var val = this.high != 0 ? this.high : this.low;
  for (var bit = 31; bit > 0; bit--) if ((val & 1 << bit) != 0) break;
  return this.high != 0 ? bit + 33 : bit + 1;
};
LongPrototype.isSafeInteger = function isSafeInteger() {
  var top11Bits = this.high >> 21;
  if (!top11Bits) return true;
  if (this.unsigned) return false;
  return top11Bits === -1 && !(this.low === 0 && this.high === -2097152);
};
LongPrototype.isZero = function isZero() {
  return this.high === 0 && this.low === 0;
};
LongPrototype.eqz = LongPrototype.isZero;
LongPrototype.isNegative = function isNegative() {
  return !this.unsigned && this.high < 0;
};
LongPrototype.isPositive = function isPositive() {
  return this.unsigned || this.high >= 0;
};
LongPrototype.isOdd = function isOdd() {
  return (this.low & 1) === 1;
};
LongPrototype.isEven = function isEven() {
  return (this.low & 1) === 0;
};
LongPrototype.equals = function equals(other) {
  if (!isLong(other)) other = fromValue(other);
  if (this.unsigned !== other.unsigned && this.high >>> 31 === 1 && other.high >>> 31 === 1)
    return false;
  return this.high === other.high && this.low === other.low;
};
LongPrototype.eq = LongPrototype.equals;
LongPrototype.notEquals = function notEquals(other) {
  return !this.eq(
    /* validates */
    other
  );
};
LongPrototype.neq = LongPrototype.notEquals;
LongPrototype.ne = LongPrototype.notEquals;
LongPrototype.lessThan = function lessThan(other) {
  return this.comp(
    /* validates */
    other
  ) < 0;
};
LongPrototype.lt = LongPrototype.lessThan;
LongPrototype.lessThanOrEqual = function lessThanOrEqual(other) {
  return this.comp(
    /* validates */
    other
  ) <= 0;
};
LongPrototype.lte = LongPrototype.lessThanOrEqual;
LongPrototype.le = LongPrototype.lessThanOrEqual;
LongPrototype.greaterThan = function greaterThan(other) {
  return this.comp(
    /* validates */
    other
  ) > 0;
};
LongPrototype.gt = LongPrototype.greaterThan;
LongPrototype.greaterThanOrEqual = function greaterThanOrEqual(other) {
  return this.comp(
    /* validates */
    other
  ) >= 0;
};
LongPrototype.gte = LongPrototype.greaterThanOrEqual;
LongPrototype.ge = LongPrototype.greaterThanOrEqual;
LongPrototype.compare = function compare(other) {
  if (!isLong(other)) other = fromValue(other);
  if (this.eq(other)) return 0;
  var thisNeg = this.isNegative(), otherNeg = other.isNegative();
  if (thisNeg && !otherNeg) return -1;
  if (!thisNeg && otherNeg) return 1;
  if (!this.unsigned) return this.sub(other).isNegative() ? -1 : 1;
  return other.high >>> 0 > this.high >>> 0 || other.high === this.high && other.low >>> 0 > this.low >>> 0 ? -1 : 1;
};
LongPrototype.comp = LongPrototype.compare;
LongPrototype.negate = function negate() {
  if (!this.unsigned && this.eq(MIN_VALUE)) return MIN_VALUE;
  return this.not().add(ONE);
};
LongPrototype.neg = LongPrototype.negate;
LongPrototype.add = function add(addend) {
  if (!isLong(addend)) addend = fromValue(addend);
  var a48 = this.high >>> 16;
  var a32 = this.high & 65535;
  var a16 = this.low >>> 16;
  var a00 = this.low & 65535;
  var b48 = addend.high >>> 16;
  var b32 = addend.high & 65535;
  var b16 = addend.low >>> 16;
  var b00 = addend.low & 65535;
  var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
  c00 += a00 + b00;
  c16 += c00 >>> 16;
  c00 &= 65535;
  c16 += a16 + b16;
  c32 += c16 >>> 16;
  c16 &= 65535;
  c32 += a32 + b32;
  c48 += c32 >>> 16;
  c32 &= 65535;
  c48 += a48 + b48;
  c48 &= 65535;
  return fromBits(c16 << 16 | c00, c48 << 16 | c32, this.unsigned);
};
LongPrototype.subtract = function subtract(subtrahend) {
  if (!isLong(subtrahend)) subtrahend = fromValue(subtrahend);
  return this.add(subtrahend.neg());
};
LongPrototype.sub = LongPrototype.subtract;
LongPrototype.multiply = function multiply(multiplier) {
  if (this.isZero()) return this;
  if (!isLong(multiplier)) multiplier = fromValue(multiplier);
  if (wasm) {
    var low = wasm["mul"](this.low, this.high, multiplier.low, multiplier.high);
    return fromBits(low, wasm["get_high"](), this.unsigned);
  }
  if (multiplier.isZero()) return this.unsigned ? UZERO : ZERO;
  if (this.eq(MIN_VALUE)) return multiplier.isOdd() ? MIN_VALUE : ZERO;
  if (multiplier.eq(MIN_VALUE)) return this.isOdd() ? MIN_VALUE : ZERO;
  if (this.isNegative()) {
    if (multiplier.isNegative()) return this.neg().mul(multiplier.neg());
    else return this.neg().mul(multiplier).neg();
  } else if (multiplier.isNegative()) return this.mul(multiplier.neg()).neg();
  if (this.lt(TWO_PWR_24) && multiplier.lt(TWO_PWR_24))
    return fromNumber(this.toNumber() * multiplier.toNumber(), this.unsigned);
  var a48 = this.high >>> 16;
  var a32 = this.high & 65535;
  var a16 = this.low >>> 16;
  var a00 = this.low & 65535;
  var b48 = multiplier.high >>> 16;
  var b32 = multiplier.high & 65535;
  var b16 = multiplier.low >>> 16;
  var b00 = multiplier.low & 65535;
  var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
  c00 += a00 * b00;
  c16 += c00 >>> 16;
  c00 &= 65535;
  c16 += a16 * b00;
  c32 += c16 >>> 16;
  c16 &= 65535;
  c16 += a00 * b16;
  c32 += c16 >>> 16;
  c16 &= 65535;
  c32 += a32 * b00;
  c48 += c32 >>> 16;
  c32 &= 65535;
  c32 += a16 * b16;
  c48 += c32 >>> 16;
  c32 &= 65535;
  c32 += a00 * b32;
  c48 += c32 >>> 16;
  c32 &= 65535;
  c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
  c48 &= 65535;
  return fromBits(c16 << 16 | c00, c48 << 16 | c32, this.unsigned);
};
LongPrototype.mul = LongPrototype.multiply;
LongPrototype.divide = function divide(divisor) {
  if (!isLong(divisor)) divisor = fromValue(divisor);
  if (divisor.isZero()) throw Error("division by zero");
  if (wasm) {
    if (!this.unsigned && this.high === -2147483648 && divisor.low === -1 && divisor.high === -1) {
      return this;
    }
    var low = (this.unsigned ? wasm["div_u"] : wasm["div_s"])(
      this.low,
      this.high,
      divisor.low,
      divisor.high
    );
    return fromBits(low, wasm["get_high"](), this.unsigned);
  }
  if (this.isZero()) return this.unsigned ? UZERO : ZERO;
  var approx, rem, res;
  if (!this.unsigned) {
    if (this.eq(MIN_VALUE)) {
      if (divisor.eq(ONE) || divisor.eq(NEG_ONE))
        return MIN_VALUE;
      else if (divisor.eq(MIN_VALUE)) return ONE;
      else {
        var halfThis = this.shr(1);
        approx = halfThis.div(divisor).shl(1);
        if (approx.eq(ZERO)) {
          return divisor.isNegative() ? ONE : NEG_ONE;
        } else {
          rem = this.sub(divisor.mul(approx));
          res = approx.add(rem.div(divisor));
          return res;
        }
      }
    } else if (divisor.eq(MIN_VALUE)) return this.unsigned ? UZERO : ZERO;
    if (this.isNegative()) {
      if (divisor.isNegative()) return this.neg().div(divisor.neg());
      return this.neg().div(divisor).neg();
    } else if (divisor.isNegative()) return this.div(divisor.neg()).neg();
    res = ZERO;
  } else {
    if (!divisor.unsigned) divisor = divisor.toUnsigned();
    if (divisor.gt(this)) return UZERO;
    if (divisor.gt(this.shru(1)))
      return UONE;
    res = UZERO;
  }
  rem = this;
  while (rem.gte(divisor)) {
    approx = Math.max(1, Math.floor(rem.toNumber() / divisor.toNumber()));
    var log2 = Math.ceil(Math.log(approx) / Math.LN2), delta = log2 <= 48 ? 1 : pow_dbl(2, log2 - 48), approxRes = fromNumber(approx), approxRem = approxRes.mul(divisor);
    while (approxRem.isNegative() || approxRem.gt(rem)) {
      approx -= delta;
      approxRes = fromNumber(approx, this.unsigned);
      approxRem = approxRes.mul(divisor);
    }
    if (approxRes.isZero()) approxRes = ONE;
    res = res.add(approxRes);
    rem = rem.sub(approxRem);
  }
  return res;
};
LongPrototype.div = LongPrototype.divide;
LongPrototype.modulo = function modulo(divisor) {
  if (!isLong(divisor)) divisor = fromValue(divisor);
  if (wasm) {
    var low = (this.unsigned ? wasm["rem_u"] : wasm["rem_s"])(
      this.low,
      this.high,
      divisor.low,
      divisor.high
    );
    return fromBits(low, wasm["get_high"](), this.unsigned);
  }
  return this.sub(this.div(divisor).mul(divisor));
};
LongPrototype.mod = LongPrototype.modulo;
LongPrototype.rem = LongPrototype.modulo;
LongPrototype.not = function not() {
  return fromBits(~this.low, ~this.high, this.unsigned);
};
LongPrototype.countLeadingZeros = function countLeadingZeros() {
  return this.high ? Math.clz32(this.high) : Math.clz32(this.low) + 32;
};
LongPrototype.clz = LongPrototype.countLeadingZeros;
LongPrototype.countTrailingZeros = function countTrailingZeros() {
  return this.low ? ctz32(this.low) : ctz32(this.high) + 32;
};
LongPrototype.ctz = LongPrototype.countTrailingZeros;
LongPrototype.and = function and(other) {
  if (!isLong(other)) other = fromValue(other);
  return fromBits(this.low & other.low, this.high & other.high, this.unsigned);
};
LongPrototype.or = function or(other) {
  if (!isLong(other)) other = fromValue(other);
  return fromBits(this.low | other.low, this.high | other.high, this.unsigned);
};
LongPrototype.xor = function xor(other) {
  if (!isLong(other)) other = fromValue(other);
  return fromBits(this.low ^ other.low, this.high ^ other.high, this.unsigned);
};
LongPrototype.shiftLeft = function shiftLeft(numBits) {
  if (isLong(numBits)) numBits = numBits.toInt();
  if ((numBits &= 63) === 0) return this;
  else if (numBits < 32)
    return fromBits(
      this.low << numBits,
      this.high << numBits | this.low >>> 32 - numBits,
      this.unsigned
    );
  else return fromBits(0, this.low << numBits - 32, this.unsigned);
};
LongPrototype.shl = LongPrototype.shiftLeft;
LongPrototype.shiftRight = function shiftRight(numBits) {
  if (isLong(numBits)) numBits = numBits.toInt();
  if ((numBits &= 63) === 0) return this;
  else if (numBits < 32)
    return fromBits(
      this.low >>> numBits | this.high << 32 - numBits,
      this.high >> numBits,
      this.unsigned
    );
  else
    return fromBits(
      this.high >> numBits - 32,
      this.high >= 0 ? 0 : -1,
      this.unsigned
    );
};
LongPrototype.shr = LongPrototype.shiftRight;
LongPrototype.shiftRightUnsigned = function shiftRightUnsigned(numBits) {
  if (isLong(numBits)) numBits = numBits.toInt();
  if ((numBits &= 63) === 0) return this;
  if (numBits < 32)
    return fromBits(
      this.low >>> numBits | this.high << 32 - numBits,
      this.high >>> numBits,
      this.unsigned
    );
  if (numBits === 32) return fromBits(this.high, 0, this.unsigned);
  return fromBits(this.high >>> numBits - 32, 0, this.unsigned);
};
LongPrototype.shru = LongPrototype.shiftRightUnsigned;
LongPrototype.shr_u = LongPrototype.shiftRightUnsigned;
LongPrototype.rotateLeft = function rotateLeft(numBits) {
  var b;
  if (isLong(numBits)) numBits = numBits.toInt();
  if ((numBits &= 63) === 0) return this;
  if (numBits === 32) return fromBits(this.high, this.low, this.unsigned);
  if (numBits < 32) {
    b = 32 - numBits;
    return fromBits(
      this.low << numBits | this.high >>> b,
      this.high << numBits | this.low >>> b,
      this.unsigned
    );
  }
  numBits -= 32;
  b = 32 - numBits;
  return fromBits(
    this.high << numBits | this.low >>> b,
    this.low << numBits | this.high >>> b,
    this.unsigned
  );
};
LongPrototype.rotl = LongPrototype.rotateLeft;
LongPrototype.rotateRight = function rotateRight(numBits) {
  var b;
  if (isLong(numBits)) numBits = numBits.toInt();
  if ((numBits &= 63) === 0) return this;
  if (numBits === 32) return fromBits(this.high, this.low, this.unsigned);
  if (numBits < 32) {
    b = 32 - numBits;
    return fromBits(
      this.high << b | this.low >>> numBits,
      this.low << b | this.high >>> numBits,
      this.unsigned
    );
  }
  numBits -= 32;
  b = 32 - numBits;
  return fromBits(
    this.low << b | this.high >>> numBits,
    this.high << b | this.low >>> numBits,
    this.unsigned
  );
};
LongPrototype.rotr = LongPrototype.rotateRight;
LongPrototype.toSigned = function toSigned() {
  if (!this.unsigned) return this;
  return fromBits(this.low, this.high, false);
};
LongPrototype.toUnsigned = function toUnsigned() {
  if (this.unsigned) return this;
  return fromBits(this.low, this.high, true);
};
LongPrototype.toBytes = function toBytes(le) {
  return le ? this.toBytesLE() : this.toBytesBE();
};
LongPrototype.toBytesLE = function toBytesLE() {
  var hi = this.high, lo = this.low;
  return [
    lo & 255,
    lo >>> 8 & 255,
    lo >>> 16 & 255,
    lo >>> 24,
    hi & 255,
    hi >>> 8 & 255,
    hi >>> 16 & 255,
    hi >>> 24
  ];
};
LongPrototype.toBytesBE = function toBytesBE() {
  var hi = this.high, lo = this.low;
  return [
    hi >>> 24,
    hi >>> 16 & 255,
    hi >>> 8 & 255,
    hi & 255,
    lo >>> 24,
    lo >>> 16 & 255,
    lo >>> 8 & 255,
    lo & 255
  ];
};
Long.fromBytes = function fromBytes(bytes, unsigned, le) {
  return le ? Long.fromBytesLE(bytes, unsigned) : Long.fromBytesBE(bytes, unsigned);
};
Long.fromBytesLE = function fromBytesLE(bytes, unsigned) {
  return new Long(
    bytes[0] | bytes[1] << 8 | bytes[2] << 16 | bytes[3] << 24,
    bytes[4] | bytes[5] << 8 | bytes[6] << 16 | bytes[7] << 24,
    unsigned
  );
};
Long.fromBytesBE = function fromBytesBE(bytes, unsigned) {
  return new Long(
    bytes[4] << 24 | bytes[5] << 16 | bytes[6] << 8 | bytes[7],
    bytes[0] << 24 | bytes[1] << 16 | bytes[2] << 8 | bytes[3],
    unsigned
  );
};
if (typeof BigInt === "function") {
  Long.fromBigInt = function fromBigInt(value, unsigned) {
    var lowBits = Number(BigInt.asIntN(32, value));
    var highBits = Number(BigInt.asIntN(32, value >> BigInt(32)));
    return fromBits(lowBits, highBits, unsigned);
  };
  Long.fromValue = function fromValueWithBigInt(value, unsigned) {
    if (typeof value === "bigint") return Long.fromBigInt(value, unsigned);
    return fromValue(value, unsigned);
  };
  LongPrototype.toBigInt = function toBigInt() {
    var lowBigInt = BigInt(this.low >>> 0);
    var highBigInt = BigInt(this.unsigned ? this.high >>> 0 : this.high);
    return highBigInt << BigInt(32) | lowBigInt;
  };
}
var long_default = Long;

// node_modules/@devvit/protos/types/google/protobuf/timestamp.js
var import_minimal2 = __toESM(require_minimal2(), 1);
function createBaseTimestamp() {
  return { seconds: 0, nanos: 0 };
}
var Timestamp = {
  $type: "google.protobuf.Timestamp",
  encode(message, writer = import_minimal2.default.Writer.create()) {
    if (message.seconds !== 0) {
      writer.uint32(8).int64(message.seconds);
    }
    if (message.nanos !== 0) {
      writer.uint32(16).int32(message.nanos);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal2.default.Reader ? input : import_minimal2.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseTimestamp();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }
          message.seconds = longToNumber(reader.int64());
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }
          message.nanos = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      seconds: isSet2(object.seconds) ? globalThis.Number(object.seconds) : 0,
      nanos: isSet2(object.nanos) ? globalThis.Number(object.nanos) : 0
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.seconds !== 0) {
      obj.seconds = Math.round(message.seconds);
    }
    if (message.nanos !== 0) {
      obj.nanos = Math.round(message.nanos);
    }
    return obj;
  },
  create(base) {
    return Timestamp.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseTimestamp();
    message.seconds = object.seconds ?? 0;
    message.nanos = object.nanos ?? 0;
    return message;
  }
};
messageTypeRegistry.set(Timestamp.$type, Timestamp);
function longToNumber(long) {
  if (long.gt(globalThis.Number.MAX_SAFE_INTEGER)) {
    throw new globalThis.Error("Value is larger than Number.MAX_SAFE_INTEGER");
  }
  return long.toNumber();
}
if (import_minimal2.default.util.Long !== long_default) {
  import_minimal2.default.util.Long = long_default;
  import_minimal2.default.configure();
}
function isSet2(value) {
  return value !== null && value !== void 0;
}

// node_modules/@devvit/protos/types/reddit/devvit/app_permission/v1/app_permission.js
var ConsentStatus;
(function(ConsentStatus3) {
  ConsentStatus3[ConsentStatus3["CONSENT_STATUS_UNKNOWN"] = 0] = "CONSENT_STATUS_UNKNOWN";
  ConsentStatus3[ConsentStatus3["REVOKED"] = 1] = "REVOKED";
  ConsentStatus3[ConsentStatus3["GRANTED"] = 2] = "GRANTED";
  ConsentStatus3[ConsentStatus3["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(ConsentStatus || (ConsentStatus = {}));
function consentStatusFromJSON(object) {
  switch (object) {
    case 0:
    case "CONSENT_STATUS_UNKNOWN":
      return ConsentStatus.CONSENT_STATUS_UNKNOWN;
    case 1:
    case "REVOKED":
      return ConsentStatus.REVOKED;
    case 2:
    case "GRANTED":
      return ConsentStatus.GRANTED;
    case -1:
    case "UNRECOGNIZED":
    default:
      return ConsentStatus.UNRECOGNIZED;
  }
}
function consentStatusToJSON(object) {
  switch (object) {
    case ConsentStatus.CONSENT_STATUS_UNKNOWN:
      return 0;
    case ConsentStatus.REVOKED:
      return 1;
    case ConsentStatus.GRANTED:
      return 2;
    case ConsentStatus.UNRECOGNIZED:
    default:
      return -1;
  }
}
var Scope;
(function(Scope3) {
  Scope3[Scope3["SCOPE_UNKNOWN"] = 0] = "SCOPE_UNKNOWN";
  Scope3[Scope3["SUBMIT_POST"] = 1] = "SUBMIT_POST";
  Scope3[Scope3["SUBMIT_COMMENT"] = 2] = "SUBMIT_COMMENT";
  Scope3[Scope3["SUBSCRIBE_TO_SUBREDDIT"] = 3] = "SUBSCRIBE_TO_SUBREDDIT";
  Scope3[Scope3["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(Scope || (Scope = {}));
function scopeFromJSON(object) {
  switch (object) {
    case 0:
    case "SCOPE_UNKNOWN":
      return Scope.SCOPE_UNKNOWN;
    case 1:
    case "SUBMIT_POST":
      return Scope.SUBMIT_POST;
    case 2:
    case "SUBMIT_COMMENT":
      return Scope.SUBMIT_COMMENT;
    case 3:
    case "SUBSCRIBE_TO_SUBREDDIT":
      return Scope.SUBSCRIBE_TO_SUBREDDIT;
    case -1:
    case "UNRECOGNIZED":
    default:
      return Scope.UNRECOGNIZED;
  }
}
function scopeToJSON(object) {
  switch (object) {
    case Scope.SCOPE_UNKNOWN:
      return 0;
    case Scope.SUBMIT_POST:
      return 1;
    case Scope.SUBMIT_COMMENT:
      return 2;
    case Scope.SUBSCRIBE_TO_SUBREDDIT:
      return 3;
    case Scope.UNRECOGNIZED:
    default:
      return -1;
  }
}
function createBaseAppPermission() {
  return { appSlug: "", subredditId: "", scopes: [], consentStatus: 0, updatedAt: void 0 };
}
var AppPermission = {
  $type: "reddit.devvit.app_permission.v1.AppPermission",
  encode(message, writer = import_minimal3.default.Writer.create()) {
    if (message.appSlug !== "") {
      writer.uint32(10).string(message.appSlug);
    }
    if (message.subredditId !== "") {
      writer.uint32(18).string(message.subredditId);
    }
    writer.uint32(26).fork();
    for (const v of message.scopes) {
      writer.int32(v);
    }
    writer.ldelim();
    if (message.consentStatus !== 0) {
      writer.uint32(32).int32(message.consentStatus);
    }
    if (message.updatedAt !== void 0) {
      Timestamp.encode(toTimestamp(message.updatedAt), writer.uint32(42).fork()).ldelim();
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal3.default.Reader ? input : import_minimal3.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseAppPermission();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.appSlug = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }
          message.subredditId = reader.string();
          continue;
        case 3:
          if (tag === 24) {
            message.scopes.push(reader.int32());
            continue;
          }
          if (tag === 26) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.scopes.push(reader.int32());
            }
            continue;
          }
          break;
        case 4:
          if (tag !== 32) {
            break;
          }
          message.consentStatus = reader.int32();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }
          message.updatedAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      appSlug: isSet3(object.appSlug) ? globalThis.String(object.appSlug) : "",
      subredditId: isSet3(object.subredditId) ? globalThis.String(object.subredditId) : "",
      scopes: globalThis.Array.isArray(object?.scopes) ? object.scopes.map((e) => scopeFromJSON(e)) : [],
      consentStatus: isSet3(object.consentStatus) ? consentStatusFromJSON(object.consentStatus) : 0,
      updatedAt: isSet3(object.updatedAt) ? fromJsonTimestamp(object.updatedAt) : void 0
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.appSlug !== "") {
      obj.appSlug = message.appSlug;
    }
    if (message.subredditId !== "") {
      obj.subredditId = message.subredditId;
    }
    if (message.scopes?.length) {
      obj.scopes = message.scopes.map((e) => scopeToJSON(e));
    }
    if (message.consentStatus !== 0) {
      obj.consentStatus = consentStatusToJSON(message.consentStatus);
    }
    if (message.updatedAt !== void 0) {
      obj.updatedAt = message.updatedAt.toISOString();
    }
    return obj;
  },
  create(base) {
    return AppPermission.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseAppPermission();
    message.appSlug = object.appSlug ?? "";
    message.subredditId = object.subredditId ?? "";
    message.scopes = object.scopes?.map((e) => e) || [];
    message.consentStatus = object.consentStatus ?? 0;
    message.updatedAt = object.updatedAt ?? void 0;
    return message;
  }
};
messageTypeRegistry.set(AppPermission.$type, AppPermission);
function createBaseDevvitApp() {
  return { appSlug: "", appName: "", termsAndConditions: void 0, privacyPolicy: void 0 };
}
var DevvitApp = {
  $type: "reddit.devvit.app_permission.v1.DevvitApp",
  encode(message, writer = import_minimal3.default.Writer.create()) {
    if (message.appSlug !== "") {
      writer.uint32(10).string(message.appSlug);
    }
    if (message.appName !== "") {
      writer.uint32(18).string(message.appName);
    }
    if (message.termsAndConditions !== void 0) {
      writer.uint32(26).string(message.termsAndConditions);
    }
    if (message.privacyPolicy !== void 0) {
      writer.uint32(34).string(message.privacyPolicy);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal3.default.Reader ? input : import_minimal3.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseDevvitApp();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.appSlug = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }
          message.appName = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }
          message.termsAndConditions = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }
          message.privacyPolicy = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      appSlug: isSet3(object.appSlug) ? globalThis.String(object.appSlug) : "",
      appName: isSet3(object.appName) ? globalThis.String(object.appName) : "",
      termsAndConditions: isSet3(object.termsAndConditions) ? globalThis.String(object.termsAndConditions) : void 0,
      privacyPolicy: isSet3(object.privacyPolicy) ? globalThis.String(object.privacyPolicy) : void 0
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.appSlug !== "") {
      obj.appSlug = message.appSlug;
    }
    if (message.appName !== "") {
      obj.appName = message.appName;
    }
    if (message.termsAndConditions !== void 0) {
      obj.termsAndConditions = message.termsAndConditions;
    }
    if (message.privacyPolicy !== void 0) {
      obj.privacyPolicy = message.privacyPolicy;
    }
    return obj;
  },
  create(base) {
    return DevvitApp.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseDevvitApp();
    message.appSlug = object.appSlug ?? "";
    message.appName = object.appName ?? "";
    message.termsAndConditions = object.termsAndConditions ?? void 0;
    message.privacyPolicy = object.privacyPolicy ?? void 0;
    return message;
  }
};
messageTypeRegistry.set(DevvitApp.$type, DevvitApp);
function createBaseGetAppPermissionsByUserIdRequest() {
  return { userId: "" };
}
var GetAppPermissionsByUserIdRequest = {
  $type: "reddit.devvit.app_permission.v1.GetAppPermissionsByUserIdRequest",
  encode(message, writer = import_minimal3.default.Writer.create()) {
    if (message.userId !== "") {
      writer.uint32(10).string(message.userId);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal3.default.Reader ? input : import_minimal3.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseGetAppPermissionsByUserIdRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.userId = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return { userId: isSet3(object.userId) ? globalThis.String(object.userId) : "" };
  },
  toJSON(message) {
    const obj = {};
    if (message.userId !== "") {
      obj.userId = message.userId;
    }
    return obj;
  },
  create(base) {
    return GetAppPermissionsByUserIdRequest.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseGetAppPermissionsByUserIdRequest();
    message.userId = object.userId ?? "";
    return message;
  }
};
messageTypeRegistry.set(GetAppPermissionsByUserIdRequest.$type, GetAppPermissionsByUserIdRequest);
function createBaseGetAppPermissionsByUserIdResponse() {
  return { appPermissions: [], devvitApps: [] };
}
var GetAppPermissionsByUserIdResponse = {
  $type: "reddit.devvit.app_permission.v1.GetAppPermissionsByUserIdResponse",
  encode(message, writer = import_minimal3.default.Writer.create()) {
    for (const v of message.appPermissions) {
      AppPermission.encode(v, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.devvitApps) {
      DevvitApp.encode(v, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal3.default.Reader ? input : import_minimal3.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseGetAppPermissionsByUserIdResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.appPermissions.push(AppPermission.decode(reader, reader.uint32()));
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }
          message.devvitApps.push(DevvitApp.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      appPermissions: globalThis.Array.isArray(object?.appPermissions) ? object.appPermissions.map((e) => AppPermission.fromJSON(e)) : [],
      devvitApps: globalThis.Array.isArray(object?.devvitApps) ? object.devvitApps.map((e) => DevvitApp.fromJSON(e)) : []
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.appPermissions?.length) {
      obj.appPermissions = message.appPermissions.map((e) => AppPermission.toJSON(e));
    }
    if (message.devvitApps?.length) {
      obj.devvitApps = message.devvitApps.map((e) => DevvitApp.toJSON(e));
    }
    return obj;
  },
  create(base) {
    return GetAppPermissionsByUserIdResponse.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseGetAppPermissionsByUserIdResponse();
    message.appPermissions = object.appPermissions?.map((e) => AppPermission.fromPartial(e)) || [];
    message.devvitApps = object.devvitApps?.map((e) => DevvitApp.fromPartial(e)) || [];
    return message;
  }
};
messageTypeRegistry.set(GetAppPermissionsByUserIdResponse.$type, GetAppPermissionsByUserIdResponse);
function createBaseGrantAppPermissionRequest() {
  return { userId: "", appSlug: "", subredditId: "", scopes: [] };
}
var GrantAppPermissionRequest = {
  $type: "reddit.devvit.app_permission.v1.GrantAppPermissionRequest",
  encode(message, writer = import_minimal3.default.Writer.create()) {
    if (message.userId !== "") {
      writer.uint32(10).string(message.userId);
    }
    if (message.appSlug !== "") {
      writer.uint32(18).string(message.appSlug);
    }
    if (message.subredditId !== "") {
      writer.uint32(26).string(message.subredditId);
    }
    writer.uint32(34).fork();
    for (const v of message.scopes) {
      writer.int32(v);
    }
    writer.ldelim();
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal3.default.Reader ? input : import_minimal3.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseGrantAppPermissionRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.userId = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }
          message.appSlug = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }
          message.subredditId = reader.string();
          continue;
        case 4:
          if (tag === 32) {
            message.scopes.push(reader.int32());
            continue;
          }
          if (tag === 34) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.scopes.push(reader.int32());
            }
            continue;
          }
          break;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      userId: isSet3(object.userId) ? globalThis.String(object.userId) : "",
      appSlug: isSet3(object.appSlug) ? globalThis.String(object.appSlug) : "",
      subredditId: isSet3(object.subredditId) ? globalThis.String(object.subredditId) : "",
      scopes: globalThis.Array.isArray(object?.scopes) ? object.scopes.map((e) => scopeFromJSON(e)) : []
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.userId !== "") {
      obj.userId = message.userId;
    }
    if (message.appSlug !== "") {
      obj.appSlug = message.appSlug;
    }
    if (message.subredditId !== "") {
      obj.subredditId = message.subredditId;
    }
    if (message.scopes?.length) {
      obj.scopes = message.scopes.map((e) => scopeToJSON(e));
    }
    return obj;
  },
  create(base) {
    return GrantAppPermissionRequest.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseGrantAppPermissionRequest();
    message.userId = object.userId ?? "";
    message.appSlug = object.appSlug ?? "";
    message.subredditId = object.subredditId ?? "";
    message.scopes = object.scopes?.map((e) => e) || [];
    return message;
  }
};
messageTypeRegistry.set(GrantAppPermissionRequest.$type, GrantAppPermissionRequest);
function createBaseGrantAppPermissionResponse() {
  return { error: void 0 };
}
var GrantAppPermissionResponse = {
  $type: "reddit.devvit.app_permission.v1.GrantAppPermissionResponse",
  encode(message, writer = import_minimal3.default.Writer.create()) {
    if (message.error !== void 0) {
      ErrorMessage.encode(message.error, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal3.default.Reader ? input : import_minimal3.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseGrantAppPermissionResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.error = ErrorMessage.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return { error: isSet3(object.error) ? ErrorMessage.fromJSON(object.error) : void 0 };
  },
  toJSON(message) {
    const obj = {};
    if (message.error !== void 0) {
      obj.error = ErrorMessage.toJSON(message.error);
    }
    return obj;
  },
  create(base) {
    return GrantAppPermissionResponse.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseGrantAppPermissionResponse();
    message.error = object.error !== void 0 && object.error !== null ? ErrorMessage.fromPartial(object.error) : void 0;
    return message;
  }
};
messageTypeRegistry.set(GrantAppPermissionResponse.$type, GrantAppPermissionResponse);
function createBaseRevokeAppPermissionRequest() {
  return { appSlug: "", userId: "", subredditId: "" };
}
var RevokeAppPermissionRequest = {
  $type: "reddit.devvit.app_permission.v1.RevokeAppPermissionRequest",
  encode(message, writer = import_minimal3.default.Writer.create()) {
    if (message.appSlug !== "") {
      writer.uint32(10).string(message.appSlug);
    }
    if (message.userId !== "") {
      writer.uint32(18).string(message.userId);
    }
    if (message.subredditId !== "") {
      writer.uint32(26).string(message.subredditId);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal3.default.Reader ? input : import_minimal3.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseRevokeAppPermissionRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.appSlug = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }
          message.userId = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }
          message.subredditId = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      appSlug: isSet3(object.appSlug) ? globalThis.String(object.appSlug) : "",
      userId: isSet3(object.userId) ? globalThis.String(object.userId) : "",
      subredditId: isSet3(object.subredditId) ? globalThis.String(object.subredditId) : ""
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.appSlug !== "") {
      obj.appSlug = message.appSlug;
    }
    if (message.userId !== "") {
      obj.userId = message.userId;
    }
    if (message.subredditId !== "") {
      obj.subredditId = message.subredditId;
    }
    return obj;
  },
  create(base) {
    return RevokeAppPermissionRequest.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseRevokeAppPermissionRequest();
    message.appSlug = object.appSlug ?? "";
    message.userId = object.userId ?? "";
    message.subredditId = object.subredditId ?? "";
    return message;
  }
};
messageTypeRegistry.set(RevokeAppPermissionRequest.$type, RevokeAppPermissionRequest);
function createBaseRevokeAppPermissionResponse() {
  return { error: void 0 };
}
var RevokeAppPermissionResponse = {
  $type: "reddit.devvit.app_permission.v1.RevokeAppPermissionResponse",
  encode(message, writer = import_minimal3.default.Writer.create()) {
    if (message.error !== void 0) {
      ErrorMessage.encode(message.error, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal3.default.Reader ? input : import_minimal3.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseRevokeAppPermissionResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.error = ErrorMessage.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return { error: isSet3(object.error) ? ErrorMessage.fromJSON(object.error) : void 0 };
  },
  toJSON(message) {
    const obj = {};
    if (message.error !== void 0) {
      obj.error = ErrorMessage.toJSON(message.error);
    }
    return obj;
  },
  create(base) {
    return RevokeAppPermissionResponse.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseRevokeAppPermissionResponse();
    message.error = object.error !== void 0 && object.error !== null ? ErrorMessage.fromPartial(object.error) : void 0;
    return message;
  }
};
messageTypeRegistry.set(RevokeAppPermissionResponse.$type, RevokeAppPermissionResponse);
function createBaseErrorMessage() {
  return { message: "" };
}
var ErrorMessage = {
  $type: "reddit.devvit.app_permission.v1.ErrorMessage",
  encode(message, writer = import_minimal3.default.Writer.create()) {
    if (message.message !== "") {
      writer.uint32(10).string(message.message);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal3.default.Reader ? input : import_minimal3.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseErrorMessage();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.message = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return { message: isSet3(object.message) ? globalThis.String(object.message) : "" };
  },
  toJSON(message) {
    const obj = {};
    if (message.message !== "") {
      obj.message = message.message;
    }
    return obj;
  },
  create(base) {
    return ErrorMessage.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseErrorMessage();
    message.message = object.message ?? "";
    return message;
  }
};
messageTypeRegistry.set(ErrorMessage.$type, ErrorMessage);
function toTimestamp(date) {
  const seconds = Math.trunc(date.getTime() / 1e3);
  const nanos = date.getTime() % 1e3 * 1e6;
  return { seconds, nanos };
}
function fromTimestamp(t) {
  let millis = (t.seconds || 0) * 1e3;
  millis += (t.nanos || 0) / 1e6;
  return new globalThis.Date(millis);
}
function fromJsonTimestamp(o) {
  if (o instanceof globalThis.Date) {
    return o;
  } else if (typeof o === "string") {
    return new globalThis.Date(o);
  } else {
    return fromTimestamp(Timestamp.fromJSON(o));
  }
}
function isSet3(value) {
  return value !== null && value !== void 0;
}

// node_modules/@devvit/protos/types/devvit/ui/effect_types/v1alpha/app_permission.js
function createBaseCanRunAsUserEffect() {
  return { postId: void 0, appSlug: void 0, subredditId: void 0 };
}
var CanRunAsUserEffect = {
  $type: "devvit.ui.effect_types.v1alpha.CanRunAsUserEffect",
  encode(message, writer = import_minimal4.default.Writer.create()) {
    if (message.postId !== void 0) {
      writer.uint32(10).string(message.postId);
    }
    if (message.appSlug !== void 0) {
      writer.uint32(18).string(message.appSlug);
    }
    if (message.subredditId !== void 0) {
      writer.uint32(26).string(message.subredditId);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal4.default.Reader ? input : import_minimal4.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseCanRunAsUserEffect();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.postId = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }
          message.appSlug = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }
          message.subredditId = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      postId: isSet4(object.postId) ? globalThis.String(object.postId) : void 0,
      appSlug: isSet4(object.appSlug) ? globalThis.String(object.appSlug) : void 0,
      subredditId: isSet4(object.subredditId) ? globalThis.String(object.subredditId) : void 0
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.postId !== void 0) {
      obj.postId = message.postId;
    }
    if (message.appSlug !== void 0) {
      obj.appSlug = message.appSlug;
    }
    if (message.subredditId !== void 0) {
      obj.subredditId = message.subredditId;
    }
    return obj;
  },
  create(base) {
    return CanRunAsUserEffect.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseCanRunAsUserEffect();
    message.postId = object.postId ?? void 0;
    message.appSlug = object.appSlug ?? void 0;
    message.subredditId = object.subredditId ?? void 0;
    return message;
  }
};
messageTypeRegistry.set(CanRunAsUserEffect.$type, CanRunAsUserEffect);
function createBaseConsentStatusEvent() {
  return { consentStatus: 0 };
}
var ConsentStatusEvent = {
  $type: "devvit.ui.effect_types.v1alpha.ConsentStatusEvent",
  encode(message, writer = import_minimal4.default.Writer.create()) {
    if (message.consentStatus !== 0) {
      writer.uint32(8).int32(message.consentStatus);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal4.default.Reader ? input : import_minimal4.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseConsentStatusEvent();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }
          message.consentStatus = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return { consentStatus: isSet4(object.consentStatus) ? consentStatusFromJSON(object.consentStatus) : 0 };
  },
  toJSON(message) {
    const obj = {};
    if (message.consentStatus !== 0) {
      obj.consentStatus = consentStatusToJSON(message.consentStatus);
    }
    return obj;
  },
  create(base) {
    return ConsentStatusEvent.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseConsentStatusEvent();
    message.consentStatus = object.consentStatus ?? 0;
    return message;
  }
};
messageTypeRegistry.set(ConsentStatusEvent.$type, ConsentStatusEvent);
function isSet4(value) {
  return value !== null && value !== void 0;
}

// node_modules/@devvit/protos/types/devvit/ui/effect_types/v1alpha/create_order.js
var import_minimal5 = __toESM(require_minimal2(), 1);
var OrderResultStatus;
(function(OrderResultStatus3) {
  OrderResultStatus3[OrderResultStatus3["STATUS_CANCELLED"] = 0] = "STATUS_CANCELLED";
  OrderResultStatus3[OrderResultStatus3["STATUS_SUCCESS"] = 1] = "STATUS_SUCCESS";
  OrderResultStatus3[OrderResultStatus3["STATUS_ERROR"] = 2] = "STATUS_ERROR";
  OrderResultStatus3[OrderResultStatus3["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(OrderResultStatus || (OrderResultStatus = {}));
function orderResultStatusFromJSON(object) {
  switch (object) {
    case 0:
    case "STATUS_CANCELLED":
      return OrderResultStatus.STATUS_CANCELLED;
    case 1:
    case "STATUS_SUCCESS":
      return OrderResultStatus.STATUS_SUCCESS;
    case 2:
    case "STATUS_ERROR":
      return OrderResultStatus.STATUS_ERROR;
    case -1:
    case "UNRECOGNIZED":
    default:
      return OrderResultStatus.UNRECOGNIZED;
  }
}
function orderResultStatusToJSON(object) {
  switch (object) {
    case OrderResultStatus.STATUS_CANCELLED:
      return 0;
    case OrderResultStatus.STATUS_SUCCESS:
      return 1;
    case OrderResultStatus.STATUS_ERROR:
      return 2;
    case OrderResultStatus.UNRECOGNIZED:
    default:
      return -1;
  }
}
function createBaseCreateOrderEffect() {
  return { id: "", skus: [], metadata: {} };
}
var CreateOrderEffect = {
  $type: "devvit.ui.effect_types.v1alpha.CreateOrderEffect",
  encode(message, writer = import_minimal5.default.Writer.create()) {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    for (const v of message.skus) {
      writer.uint32(18).string(v);
    }
    Object.entries(message.metadata).forEach(([key, value]) => {
      CreateOrderEffect_MetadataEntry.encode({ key, value }, writer.uint32(26).fork()).ldelim();
    });
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal5.default.Reader ? input : import_minimal5.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseCreateOrderEffect();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.id = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }
          message.skus.push(reader.string());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }
          const entry3 = CreateOrderEffect_MetadataEntry.decode(reader, reader.uint32());
          if (entry3.value !== void 0) {
            message.metadata[entry3.key] = entry3.value;
          }
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      id: isSet5(object.id) ? globalThis.String(object.id) : "",
      skus: globalThis.Array.isArray(object?.skus) ? object.skus.map((e) => globalThis.String(e)) : [],
      metadata: isObject2(object.metadata) ? Object.entries(object.metadata).reduce((acc, [key, value]) => {
        acc[key] = String(value);
        return acc;
      }, {}) : {}
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.id !== "") {
      obj.id = message.id;
    }
    if (message.skus?.length) {
      obj.skus = message.skus;
    }
    if (message.metadata) {
      const entries = Object.entries(message.metadata);
      if (entries.length > 0) {
        obj.metadata = {};
        entries.forEach(([k, v]) => {
          obj.metadata[k] = v;
        });
      }
    }
    return obj;
  },
  create(base) {
    return CreateOrderEffect.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseCreateOrderEffect();
    message.id = object.id ?? "";
    message.skus = object.skus?.map((e) => e) || [];
    message.metadata = Object.entries(object.metadata ?? {}).reduce((acc, [key, value]) => {
      if (value !== void 0) {
        acc[key] = globalThis.String(value);
      }
      return acc;
    }, {});
    return message;
  }
};
messageTypeRegistry.set(CreateOrderEffect.$type, CreateOrderEffect);
function createBaseCreateOrderEffect_MetadataEntry() {
  return { key: "", value: "" };
}
var CreateOrderEffect_MetadataEntry = {
  $type: "devvit.ui.effect_types.v1alpha.CreateOrderEffect.MetadataEntry",
  encode(message, writer = import_minimal5.default.Writer.create()) {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== "") {
      writer.uint32(18).string(message.value);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal5.default.Reader ? input : import_minimal5.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseCreateOrderEffect_MetadataEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.key = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }
          message.value = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      key: isSet5(object.key) ? globalThis.String(object.key) : "",
      value: isSet5(object.value) ? globalThis.String(object.value) : ""
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.key !== "") {
      obj.key = message.key;
    }
    if (message.value !== "") {
      obj.value = message.value;
    }
    return obj;
  },
  create(base) {
    return CreateOrderEffect_MetadataEntry.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseCreateOrderEffect_MetadataEntry();
    message.key = object.key ?? "";
    message.value = object.value ?? "";
    return message;
  }
};
messageTypeRegistry.set(CreateOrderEffect_MetadataEntry.$type, CreateOrderEffect_MetadataEntry);
function createBaseOrderResultEvent() {
  return { errorMessage: void 0, orderId: void 0, order: void 0, status: 0, errorCode: void 0 };
}
var OrderResultEvent = {
  $type: "devvit.ui.effect_types.v1alpha.OrderResultEvent",
  encode(message, writer = import_minimal5.default.Writer.create()) {
    if (message.errorMessage !== void 0) {
      writer.uint32(18).string(message.errorMessage);
    }
    if (message.orderId !== void 0) {
      writer.uint32(26).string(message.orderId);
    }
    if (message.order !== void 0) {
      CreateOrderEffect.encode(message.order, writer.uint32(34).fork()).ldelim();
    }
    if (message.status !== 0) {
      writer.uint32(40).int32(message.status);
    }
    if (message.errorCode !== void 0) {
      writer.uint32(48).int32(message.errorCode);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal5.default.Reader ? input : import_minimal5.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseOrderResultEvent();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 2:
          if (tag !== 18) {
            break;
          }
          message.errorMessage = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }
          message.orderId = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }
          message.order = CreateOrderEffect.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }
          message.status = reader.int32();
          continue;
        case 6:
          if (tag !== 48) {
            break;
          }
          message.errorCode = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      errorMessage: isSet5(object.errorMessage) ? globalThis.String(object.errorMessage) : void 0,
      orderId: isSet5(object.orderId) ? globalThis.String(object.orderId) : void 0,
      order: isSet5(object.order) ? CreateOrderEffect.fromJSON(object.order) : void 0,
      status: isSet5(object.status) ? orderResultStatusFromJSON(object.status) : 0,
      errorCode: isSet5(object.errorCode) ? globalThis.Number(object.errorCode) : void 0
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.errorMessage !== void 0) {
      obj.errorMessage = message.errorMessage;
    }
    if (message.orderId !== void 0) {
      obj.orderId = message.orderId;
    }
    if (message.order !== void 0) {
      obj.order = CreateOrderEffect.toJSON(message.order);
    }
    if (message.status !== 0) {
      obj.status = orderResultStatusToJSON(message.status);
    }
    if (message.errorCode !== void 0) {
      obj.errorCode = Math.round(message.errorCode);
    }
    return obj;
  },
  create(base) {
    return OrderResultEvent.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseOrderResultEvent();
    message.errorMessage = object.errorMessage ?? void 0;
    message.orderId = object.orderId ?? void 0;
    message.order = object.order !== void 0 && object.order !== null ? CreateOrderEffect.fromPartial(object.order) : void 0;
    message.status = object.status ?? 0;
    message.errorCode = object.errorCode ?? void 0;
    return message;
  }
};
messageTypeRegistry.set(OrderResultEvent.$type, OrderResultEvent);
function isObject2(value) {
  return typeof value === "object" && value !== null;
}
function isSet5(value) {
  return value !== null && value !== void 0;
}

// node_modules/@devvit/protos/types/devvit/ui/effect_types/v1alpha/show_form.js
var import_minimal9 = __toESM(require_minimal2(), 1);

// node_modules/@devvit/protos/types/devvit/ui/form_builder/v1alpha/form.js
var import_minimal8 = __toESM(require_minimal2(), 1);

// node_modules/@devvit/protos/types/devvit/ui/form_builder/v1alpha/field.js
var import_minimal7 = __toESM(require_minimal2(), 1);

// node_modules/@devvit/protos/types/devvit/ui/form_builder/v1alpha/type.js
var FormFieldType;
(function(FormFieldType3) {
  FormFieldType3[FormFieldType3["STRING"] = 0] = "STRING";
  FormFieldType3[FormFieldType3["PARAGRAPH"] = 1] = "PARAGRAPH";
  FormFieldType3[FormFieldType3["NUMBER"] = 2] = "NUMBER";
  FormFieldType3[FormFieldType3["BOOLEAN"] = 3] = "BOOLEAN";
  FormFieldType3[FormFieldType3["LIST"] = 4] = "LIST";
  FormFieldType3[FormFieldType3["SELECTION"] = 5] = "SELECTION";
  FormFieldType3[FormFieldType3["GROUP"] = 6] = "GROUP";
  FormFieldType3[FormFieldType3["IMAGE"] = 7] = "IMAGE";
  FormFieldType3[FormFieldType3["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(FormFieldType || (FormFieldType = {}));
function formFieldTypeFromJSON(object) {
  switch (object) {
    case 0:
    case "STRING":
      return FormFieldType.STRING;
    case 1:
    case "PARAGRAPH":
      return FormFieldType.PARAGRAPH;
    case 2:
    case "NUMBER":
      return FormFieldType.NUMBER;
    case 3:
    case "BOOLEAN":
      return FormFieldType.BOOLEAN;
    case 4:
    case "LIST":
      return FormFieldType.LIST;
    case 5:
    case "SELECTION":
      return FormFieldType.SELECTION;
    case 6:
    case "GROUP":
      return FormFieldType.GROUP;
    case 7:
    case "IMAGE":
      return FormFieldType.IMAGE;
    case -1:
    case "UNRECOGNIZED":
    default:
      return FormFieldType.UNRECOGNIZED;
  }
}
function formFieldTypeToJSON(object) {
  switch (object) {
    case FormFieldType.STRING:
      return 0;
    case FormFieldType.PARAGRAPH:
      return 1;
    case FormFieldType.NUMBER:
      return 2;
    case FormFieldType.BOOLEAN:
      return 3;
    case FormFieldType.LIST:
      return 4;
    case FormFieldType.SELECTION:
      return 5;
    case FormFieldType.GROUP:
      return 6;
    case FormFieldType.IMAGE:
      return 7;
    case FormFieldType.UNRECOGNIZED:
    default:
      return -1;
  }
}

// node_modules/@devvit/protos/types/devvit/ui/form_builder/v1alpha/value.js
var import_minimal6 = __toESM(require_minimal2(), 1);
function createBaseFormFieldValue() {
  return {
    fieldType: 0,
    isSecret: void 0,
    stringValue: void 0,
    numberValue: void 0,
    boolValue: void 0,
    listValue: void 0,
    selectionValue: void 0,
    groupValue: void 0
  };
}
var FormFieldValue = {
  $type: "devvit.ui.form_builder.v1alpha.FormFieldValue",
  encode(message, writer = import_minimal6.default.Writer.create()) {
    if (message.fieldType !== 0) {
      writer.uint32(8).int32(message.fieldType);
    }
    if (message.isSecret !== void 0) {
      writer.uint32(800).bool(message.isSecret);
    }
    if (message.stringValue !== void 0) {
      writer.uint32(18).string(message.stringValue);
    }
    if (message.numberValue !== void 0) {
      writer.uint32(25).double(message.numberValue);
    }
    if (message.boolValue !== void 0) {
      writer.uint32(32).bool(message.boolValue);
    }
    if (message.listValue !== void 0) {
      FormFieldValue_ListValue.encode(message.listValue, writer.uint32(42).fork()).ldelim();
    }
    if (message.selectionValue !== void 0) {
      FormFieldValue_SelectionValue.encode(message.selectionValue, writer.uint32(50).fork()).ldelim();
    }
    if (message.groupValue !== void 0) {
      FormFieldValue_GroupValue.encode(message.groupValue, writer.uint32(58).fork()).ldelim();
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal6.default.Reader ? input : import_minimal6.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseFormFieldValue();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }
          message.fieldType = reader.int32();
          continue;
        case 100:
          if (tag !== 800) {
            break;
          }
          message.isSecret = reader.bool();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }
          message.stringValue = reader.string();
          continue;
        case 3:
          if (tag !== 25) {
            break;
          }
          message.numberValue = reader.double();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }
          message.boolValue = reader.bool();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }
          message.listValue = FormFieldValue_ListValue.decode(reader, reader.uint32());
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }
          message.selectionValue = FormFieldValue_SelectionValue.decode(reader, reader.uint32());
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }
          message.groupValue = FormFieldValue_GroupValue.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      fieldType: isSet6(object.fieldType) ? formFieldTypeFromJSON(object.fieldType) : 0,
      isSecret: isSet6(object.isSecret) ? globalThis.Boolean(object.isSecret) : void 0,
      stringValue: isSet6(object.stringValue) ? globalThis.String(object.stringValue) : void 0,
      numberValue: isSet6(object.numberValue) ? globalThis.Number(object.numberValue) : void 0,
      boolValue: isSet6(object.boolValue) ? globalThis.Boolean(object.boolValue) : void 0,
      listValue: isSet6(object.listValue) ? FormFieldValue_ListValue.fromJSON(object.listValue) : void 0,
      selectionValue: isSet6(object.selectionValue) ? FormFieldValue_SelectionValue.fromJSON(object.selectionValue) : void 0,
      groupValue: isSet6(object.groupValue) ? FormFieldValue_GroupValue.fromJSON(object.groupValue) : void 0
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.fieldType !== 0) {
      obj.fieldType = formFieldTypeToJSON(message.fieldType);
    }
    if (message.isSecret !== void 0) {
      obj.isSecret = message.isSecret;
    }
    if (message.stringValue !== void 0) {
      obj.stringValue = message.stringValue;
    }
    if (message.numberValue !== void 0) {
      obj.numberValue = message.numberValue;
    }
    if (message.boolValue !== void 0) {
      obj.boolValue = message.boolValue;
    }
    if (message.listValue !== void 0) {
      obj.listValue = FormFieldValue_ListValue.toJSON(message.listValue);
    }
    if (message.selectionValue !== void 0) {
      obj.selectionValue = FormFieldValue_SelectionValue.toJSON(message.selectionValue);
    }
    if (message.groupValue !== void 0) {
      obj.groupValue = FormFieldValue_GroupValue.toJSON(message.groupValue);
    }
    return obj;
  },
  create(base) {
    return FormFieldValue.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseFormFieldValue();
    message.fieldType = object.fieldType ?? 0;
    message.isSecret = object.isSecret ?? void 0;
    message.stringValue = object.stringValue ?? void 0;
    message.numberValue = object.numberValue ?? void 0;
    message.boolValue = object.boolValue ?? void 0;
    message.listValue = object.listValue !== void 0 && object.listValue !== null ? FormFieldValue_ListValue.fromPartial(object.listValue) : void 0;
    message.selectionValue = object.selectionValue !== void 0 && object.selectionValue !== null ? FormFieldValue_SelectionValue.fromPartial(object.selectionValue) : void 0;
    message.groupValue = object.groupValue !== void 0 && object.groupValue !== null ? FormFieldValue_GroupValue.fromPartial(object.groupValue) : void 0;
    return message;
  }
};
messageTypeRegistry.set(FormFieldValue.$type, FormFieldValue);
function createBaseFormFieldValue_ListValue() {
  return { itemType: 0, items: [] };
}
var FormFieldValue_ListValue = {
  $type: "devvit.ui.form_builder.v1alpha.FormFieldValue.ListValue",
  encode(message, writer = import_minimal6.default.Writer.create()) {
    if (message.itemType !== 0) {
      writer.uint32(8).int32(message.itemType);
    }
    for (const v of message.items) {
      FormFieldValue.encode(v, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal6.default.Reader ? input : import_minimal6.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseFormFieldValue_ListValue();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }
          message.itemType = reader.int32();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }
          message.items.push(FormFieldValue.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      itemType: isSet6(object.itemType) ? formFieldTypeFromJSON(object.itemType) : 0,
      items: globalThis.Array.isArray(object?.items) ? object.items.map((e) => FormFieldValue.fromJSON(e)) : []
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.itemType !== 0) {
      obj.itemType = formFieldTypeToJSON(message.itemType);
    }
    if (message.items?.length) {
      obj.items = message.items.map((e) => FormFieldValue.toJSON(e));
    }
    return obj;
  },
  create(base) {
    return FormFieldValue_ListValue.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseFormFieldValue_ListValue();
    message.itemType = object.itemType ?? 0;
    message.items = object.items?.map((e) => FormFieldValue.fromPartial(e)) || [];
    return message;
  }
};
messageTypeRegistry.set(FormFieldValue_ListValue.$type, FormFieldValue_ListValue);
function createBaseFormFieldValue_SelectionValue() {
  return { values: [] };
}
var FormFieldValue_SelectionValue = {
  $type: "devvit.ui.form_builder.v1alpha.FormFieldValue.SelectionValue",
  encode(message, writer = import_minimal6.default.Writer.create()) {
    for (const v of message.values) {
      writer.uint32(10).string(v);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal6.default.Reader ? input : import_minimal6.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseFormFieldValue_SelectionValue();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.values.push(reader.string());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      values: globalThis.Array.isArray(object?.values) ? object.values.map((e) => globalThis.String(e)) : []
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.values?.length) {
      obj.values = message.values;
    }
    return obj;
  },
  create(base) {
    return FormFieldValue_SelectionValue.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseFormFieldValue_SelectionValue();
    message.values = object.values?.map((e) => e) || [];
    return message;
  }
};
messageTypeRegistry.set(FormFieldValue_SelectionValue.$type, FormFieldValue_SelectionValue);
function createBaseFormFieldValue_GroupValue() {
  return {};
}
var FormFieldValue_GroupValue = {
  $type: "devvit.ui.form_builder.v1alpha.FormFieldValue.GroupValue",
  encode(_, writer = import_minimal6.default.Writer.create()) {
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal6.default.Reader ? input : import_minimal6.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseFormFieldValue_GroupValue();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(_) {
    return {};
  },
  toJSON(_) {
    const obj = {};
    return obj;
  },
  create(base) {
    return FormFieldValue_GroupValue.fromPartial(base ?? {});
  },
  fromPartial(_) {
    const message = createBaseFormFieldValue_GroupValue();
    return message;
  }
};
messageTypeRegistry.set(FormFieldValue_GroupValue.$type, FormFieldValue_GroupValue);
function isSet6(value) {
  return value !== null && value !== void 0;
}

// node_modules/@devvit/protos/types/devvit/ui/form_builder/v1alpha/field.js
function createBaseFormField() {
  return {
    fieldId: "",
    fieldType: 0,
    label: "",
    helpText: void 0,
    defaultValue: void 0,
    required: void 0,
    disabled: void 0,
    fieldConfig: void 0,
    isSecret: void 0
  };
}
var FormField = {
  $type: "devvit.ui.form_builder.v1alpha.FormField",
  encode(message, writer = import_minimal7.default.Writer.create()) {
    if (message.fieldId !== "") {
      writer.uint32(10).string(message.fieldId);
    }
    if (message.fieldType !== 0) {
      writer.uint32(16).int32(message.fieldType);
    }
    if (message.label !== "") {
      writer.uint32(26).string(message.label);
    }
    if (message.helpText !== void 0) {
      writer.uint32(34).string(message.helpText);
    }
    if (message.defaultValue !== void 0) {
      FormFieldValue.encode(message.defaultValue, writer.uint32(42).fork()).ldelim();
    }
    if (message.required !== void 0) {
      writer.uint32(48).bool(message.required);
    }
    if (message.disabled !== void 0) {
      writer.uint32(56).bool(message.disabled);
    }
    if (message.fieldConfig !== void 0) {
      FieldConfig.encode(message.fieldConfig, writer.uint32(66).fork()).ldelim();
    }
    if (message.isSecret !== void 0) {
      writer.uint32(72).bool(message.isSecret);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal7.default.Reader ? input : import_minimal7.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseFormField();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.fieldId = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }
          message.fieldType = reader.int32();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }
          message.label = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }
          message.helpText = reader.string();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }
          message.defaultValue = FormFieldValue.decode(reader, reader.uint32());
          continue;
        case 6:
          if (tag !== 48) {
            break;
          }
          message.required = reader.bool();
          continue;
        case 7:
          if (tag !== 56) {
            break;
          }
          message.disabled = reader.bool();
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }
          message.fieldConfig = FieldConfig.decode(reader, reader.uint32());
          continue;
        case 9:
          if (tag !== 72) {
            break;
          }
          message.isSecret = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      fieldId: isSet7(object.fieldId) ? globalThis.String(object.fieldId) : "",
      fieldType: isSet7(object.fieldType) ? formFieldTypeFromJSON(object.fieldType) : 0,
      label: isSet7(object.label) ? globalThis.String(object.label) : "",
      helpText: isSet7(object.helpText) ? globalThis.String(object.helpText) : void 0,
      defaultValue: isSet7(object.defaultValue) ? FormFieldValue.fromJSON(object.defaultValue) : void 0,
      required: isSet7(object.required) ? globalThis.Boolean(object.required) : void 0,
      disabled: isSet7(object.disabled) ? globalThis.Boolean(object.disabled) : void 0,
      fieldConfig: isSet7(object.fieldConfig) ? FieldConfig.fromJSON(object.fieldConfig) : void 0,
      isSecret: isSet7(object.isSecret) ? globalThis.Boolean(object.isSecret) : void 0
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.fieldId !== "") {
      obj.fieldId = message.fieldId;
    }
    if (message.fieldType !== 0) {
      obj.fieldType = formFieldTypeToJSON(message.fieldType);
    }
    if (message.label !== "") {
      obj.label = message.label;
    }
    if (message.helpText !== void 0) {
      obj.helpText = message.helpText;
    }
    if (message.defaultValue !== void 0) {
      obj.defaultValue = FormFieldValue.toJSON(message.defaultValue);
    }
    if (message.required !== void 0) {
      obj.required = message.required;
    }
    if (message.disabled !== void 0) {
      obj.disabled = message.disabled;
    }
    if (message.fieldConfig !== void 0) {
      obj.fieldConfig = FieldConfig.toJSON(message.fieldConfig);
    }
    if (message.isSecret !== void 0) {
      obj.isSecret = message.isSecret;
    }
    return obj;
  },
  create(base) {
    return FormField.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseFormField();
    message.fieldId = object.fieldId ?? "";
    message.fieldType = object.fieldType ?? 0;
    message.label = object.label ?? "";
    message.helpText = object.helpText ?? void 0;
    message.defaultValue = object.defaultValue !== void 0 && object.defaultValue !== null ? FormFieldValue.fromPartial(object.defaultValue) : void 0;
    message.required = object.required ?? void 0;
    message.disabled = object.disabled ?? void 0;
    message.fieldConfig = object.fieldConfig !== void 0 && object.fieldConfig !== null ? FieldConfig.fromPartial(object.fieldConfig) : void 0;
    message.isSecret = object.isSecret ?? void 0;
    return message;
  }
};
messageTypeRegistry.set(FormField.$type, FormField);
function createBaseFieldConfig() {
  return {
    stringConfig: void 0,
    paragraphConfig: void 0,
    numberConfig: void 0,
    booleanConfig: void 0,
    listConfig: void 0,
    selectionConfig: void 0,
    groupConfig: void 0
  };
}
var FieldConfig = {
  $type: "devvit.ui.form_builder.v1alpha.FieldConfig",
  encode(message, writer = import_minimal7.default.Writer.create()) {
    if (message.stringConfig !== void 0) {
      FieldConfig_String.encode(message.stringConfig, writer.uint32(10).fork()).ldelim();
    }
    if (message.paragraphConfig !== void 0) {
      FieldConfig_Paragraph.encode(message.paragraphConfig, writer.uint32(18).fork()).ldelim();
    }
    if (message.numberConfig !== void 0) {
      FieldConfig_Number.encode(message.numberConfig, writer.uint32(26).fork()).ldelim();
    }
    if (message.booleanConfig !== void 0) {
      FieldConfig_Boolean.encode(message.booleanConfig, writer.uint32(34).fork()).ldelim();
    }
    if (message.listConfig !== void 0) {
      FieldConfig_List.encode(message.listConfig, writer.uint32(42).fork()).ldelim();
    }
    if (message.selectionConfig !== void 0) {
      FieldConfig_Selection.encode(message.selectionConfig, writer.uint32(50).fork()).ldelim();
    }
    if (message.groupConfig !== void 0) {
      FieldConfig_Group.encode(message.groupConfig, writer.uint32(58).fork()).ldelim();
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal7.default.Reader ? input : import_minimal7.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseFieldConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.stringConfig = FieldConfig_String.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }
          message.paragraphConfig = FieldConfig_Paragraph.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }
          message.numberConfig = FieldConfig_Number.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }
          message.booleanConfig = FieldConfig_Boolean.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }
          message.listConfig = FieldConfig_List.decode(reader, reader.uint32());
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }
          message.selectionConfig = FieldConfig_Selection.decode(reader, reader.uint32());
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }
          message.groupConfig = FieldConfig_Group.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      stringConfig: isSet7(object.stringConfig) ? FieldConfig_String.fromJSON(object.stringConfig) : void 0,
      paragraphConfig: isSet7(object.paragraphConfig) ? FieldConfig_Paragraph.fromJSON(object.paragraphConfig) : void 0,
      numberConfig: isSet7(object.numberConfig) ? FieldConfig_Number.fromJSON(object.numberConfig) : void 0,
      booleanConfig: isSet7(object.booleanConfig) ? FieldConfig_Boolean.fromJSON(object.booleanConfig) : void 0,
      listConfig: isSet7(object.listConfig) ? FieldConfig_List.fromJSON(object.listConfig) : void 0,
      selectionConfig: isSet7(object.selectionConfig) ? FieldConfig_Selection.fromJSON(object.selectionConfig) : void 0,
      groupConfig: isSet7(object.groupConfig) ? FieldConfig_Group.fromJSON(object.groupConfig) : void 0
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.stringConfig !== void 0) {
      obj.stringConfig = FieldConfig_String.toJSON(message.stringConfig);
    }
    if (message.paragraphConfig !== void 0) {
      obj.paragraphConfig = FieldConfig_Paragraph.toJSON(message.paragraphConfig);
    }
    if (message.numberConfig !== void 0) {
      obj.numberConfig = FieldConfig_Number.toJSON(message.numberConfig);
    }
    if (message.booleanConfig !== void 0) {
      obj.booleanConfig = FieldConfig_Boolean.toJSON(message.booleanConfig);
    }
    if (message.listConfig !== void 0) {
      obj.listConfig = FieldConfig_List.toJSON(message.listConfig);
    }
    if (message.selectionConfig !== void 0) {
      obj.selectionConfig = FieldConfig_Selection.toJSON(message.selectionConfig);
    }
    if (message.groupConfig !== void 0) {
      obj.groupConfig = FieldConfig_Group.toJSON(message.groupConfig);
    }
    return obj;
  },
  create(base) {
    return FieldConfig.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseFieldConfig();
    message.stringConfig = object.stringConfig !== void 0 && object.stringConfig !== null ? FieldConfig_String.fromPartial(object.stringConfig) : void 0;
    message.paragraphConfig = object.paragraphConfig !== void 0 && object.paragraphConfig !== null ? FieldConfig_Paragraph.fromPartial(object.paragraphConfig) : void 0;
    message.numberConfig = object.numberConfig !== void 0 && object.numberConfig !== null ? FieldConfig_Number.fromPartial(object.numberConfig) : void 0;
    message.booleanConfig = object.booleanConfig !== void 0 && object.booleanConfig !== null ? FieldConfig_Boolean.fromPartial(object.booleanConfig) : void 0;
    message.listConfig = object.listConfig !== void 0 && object.listConfig !== null ? FieldConfig_List.fromPartial(object.listConfig) : void 0;
    message.selectionConfig = object.selectionConfig !== void 0 && object.selectionConfig !== null ? FieldConfig_Selection.fromPartial(object.selectionConfig) : void 0;
    message.groupConfig = object.groupConfig !== void 0 && object.groupConfig !== null ? FieldConfig_Group.fromPartial(object.groupConfig) : void 0;
    return message;
  }
};
messageTypeRegistry.set(FieldConfig.$type, FieldConfig);
function createBaseFieldConfig_String() {
  return { minLength: void 0, maxLength: void 0, placeholder: void 0 };
}
var FieldConfig_String = {
  $type: "devvit.ui.form_builder.v1alpha.FieldConfig.String",
  encode(message, writer = import_minimal7.default.Writer.create()) {
    if (message.minLength !== void 0) {
      writer.uint32(8).int32(message.minLength);
    }
    if (message.maxLength !== void 0) {
      writer.uint32(16).int32(message.maxLength);
    }
    if (message.placeholder !== void 0) {
      writer.uint32(26).string(message.placeholder);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal7.default.Reader ? input : import_minimal7.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseFieldConfig_String();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }
          message.minLength = reader.int32();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }
          message.maxLength = reader.int32();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }
          message.placeholder = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      minLength: isSet7(object.minLength) ? globalThis.Number(object.minLength) : void 0,
      maxLength: isSet7(object.maxLength) ? globalThis.Number(object.maxLength) : void 0,
      placeholder: isSet7(object.placeholder) ? globalThis.String(object.placeholder) : void 0
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.minLength !== void 0) {
      obj.minLength = Math.round(message.minLength);
    }
    if (message.maxLength !== void 0) {
      obj.maxLength = Math.round(message.maxLength);
    }
    if (message.placeholder !== void 0) {
      obj.placeholder = message.placeholder;
    }
    return obj;
  },
  create(base) {
    return FieldConfig_String.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseFieldConfig_String();
    message.minLength = object.minLength ?? void 0;
    message.maxLength = object.maxLength ?? void 0;
    message.placeholder = object.placeholder ?? void 0;
    return message;
  }
};
messageTypeRegistry.set(FieldConfig_String.$type, FieldConfig_String);
function createBaseFieldConfig_Paragraph() {
  return { maxCharacters: void 0, lineHeight: void 0, placeholder: void 0 };
}
var FieldConfig_Paragraph = {
  $type: "devvit.ui.form_builder.v1alpha.FieldConfig.Paragraph",
  encode(message, writer = import_minimal7.default.Writer.create()) {
    if (message.maxCharacters !== void 0) {
      writer.uint32(8).int32(message.maxCharacters);
    }
    if (message.lineHeight !== void 0) {
      writer.uint32(16).int32(message.lineHeight);
    }
    if (message.placeholder !== void 0) {
      writer.uint32(26).string(message.placeholder);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal7.default.Reader ? input : import_minimal7.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseFieldConfig_Paragraph();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }
          message.maxCharacters = reader.int32();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }
          message.lineHeight = reader.int32();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }
          message.placeholder = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      maxCharacters: isSet7(object.maxCharacters) ? globalThis.Number(object.maxCharacters) : void 0,
      lineHeight: isSet7(object.lineHeight) ? globalThis.Number(object.lineHeight) : void 0,
      placeholder: isSet7(object.placeholder) ? globalThis.String(object.placeholder) : void 0
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.maxCharacters !== void 0) {
      obj.maxCharacters = Math.round(message.maxCharacters);
    }
    if (message.lineHeight !== void 0) {
      obj.lineHeight = Math.round(message.lineHeight);
    }
    if (message.placeholder !== void 0) {
      obj.placeholder = message.placeholder;
    }
    return obj;
  },
  create(base) {
    return FieldConfig_Paragraph.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseFieldConfig_Paragraph();
    message.maxCharacters = object.maxCharacters ?? void 0;
    message.lineHeight = object.lineHeight ?? void 0;
    message.placeholder = object.placeholder ?? void 0;
    return message;
  }
};
messageTypeRegistry.set(FieldConfig_Paragraph.$type, FieldConfig_Paragraph);
function createBaseFieldConfig_Number() {
  return { step: void 0, min: void 0, max: void 0 };
}
var FieldConfig_Number = {
  $type: "devvit.ui.form_builder.v1alpha.FieldConfig.Number",
  encode(message, writer = import_minimal7.default.Writer.create()) {
    if (message.step !== void 0) {
      writer.uint32(9).double(message.step);
    }
    if (message.min !== void 0) {
      writer.uint32(17).double(message.min);
    }
    if (message.max !== void 0) {
      writer.uint32(25).double(message.max);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal7.default.Reader ? input : import_minimal7.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseFieldConfig_Number();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 9) {
            break;
          }
          message.step = reader.double();
          continue;
        case 2:
          if (tag !== 17) {
            break;
          }
          message.min = reader.double();
          continue;
        case 3:
          if (tag !== 25) {
            break;
          }
          message.max = reader.double();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      step: isSet7(object.step) ? globalThis.Number(object.step) : void 0,
      min: isSet7(object.min) ? globalThis.Number(object.min) : void 0,
      max: isSet7(object.max) ? globalThis.Number(object.max) : void 0
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.step !== void 0) {
      obj.step = message.step;
    }
    if (message.min !== void 0) {
      obj.min = message.min;
    }
    if (message.max !== void 0) {
      obj.max = message.max;
    }
    return obj;
  },
  create(base) {
    return FieldConfig_Number.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseFieldConfig_Number();
    message.step = object.step ?? void 0;
    message.min = object.min ?? void 0;
    message.max = object.max ?? void 0;
    return message;
  }
};
messageTypeRegistry.set(FieldConfig_Number.$type, FieldConfig_Number);
function createBaseFieldConfig_Boolean() {
  return {};
}
var FieldConfig_Boolean = {
  $type: "devvit.ui.form_builder.v1alpha.FieldConfig.Boolean",
  encode(_, writer = import_minimal7.default.Writer.create()) {
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal7.default.Reader ? input : import_minimal7.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseFieldConfig_Boolean();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(_) {
    return {};
  },
  toJSON(_) {
    const obj = {};
    return obj;
  },
  create(base) {
    return FieldConfig_Boolean.fromPartial(base ?? {});
  },
  fromPartial(_) {
    const message = createBaseFieldConfig_Boolean();
    return message;
  }
};
messageTypeRegistry.set(FieldConfig_Boolean.$type, FieldConfig_Boolean);
function createBaseFieldConfig_List() {
  return { itemType: 0, itemConfig: void 0, minEntries: void 0, maxEntries: void 0, entryLabel: void 0 };
}
var FieldConfig_List = {
  $type: "devvit.ui.form_builder.v1alpha.FieldConfig.List",
  encode(message, writer = import_minimal7.default.Writer.create()) {
    if (message.itemType !== 0) {
      writer.uint32(8).int32(message.itemType);
    }
    if (message.itemConfig !== void 0) {
      FieldConfig.encode(message.itemConfig, writer.uint32(18).fork()).ldelim();
    }
    if (message.minEntries !== void 0) {
      writer.uint32(24).int32(message.minEntries);
    }
    if (message.maxEntries !== void 0) {
      writer.uint32(32).int32(message.maxEntries);
    }
    if (message.entryLabel !== void 0) {
      writer.uint32(42).string(message.entryLabel);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal7.default.Reader ? input : import_minimal7.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseFieldConfig_List();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }
          message.itemType = reader.int32();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }
          message.itemConfig = FieldConfig.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }
          message.minEntries = reader.int32();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }
          message.maxEntries = reader.int32();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }
          message.entryLabel = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      itemType: isSet7(object.itemType) ? formFieldTypeFromJSON(object.itemType) : 0,
      itemConfig: isSet7(object.itemConfig) ? FieldConfig.fromJSON(object.itemConfig) : void 0,
      minEntries: isSet7(object.minEntries) ? globalThis.Number(object.minEntries) : void 0,
      maxEntries: isSet7(object.maxEntries) ? globalThis.Number(object.maxEntries) : void 0,
      entryLabel: isSet7(object.entryLabel) ? globalThis.String(object.entryLabel) : void 0
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.itemType !== 0) {
      obj.itemType = formFieldTypeToJSON(message.itemType);
    }
    if (message.itemConfig !== void 0) {
      obj.itemConfig = FieldConfig.toJSON(message.itemConfig);
    }
    if (message.minEntries !== void 0) {
      obj.minEntries = Math.round(message.minEntries);
    }
    if (message.maxEntries !== void 0) {
      obj.maxEntries = Math.round(message.maxEntries);
    }
    if (message.entryLabel !== void 0) {
      obj.entryLabel = message.entryLabel;
    }
    return obj;
  },
  create(base) {
    return FieldConfig_List.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseFieldConfig_List();
    message.itemType = object.itemType ?? 0;
    message.itemConfig = object.itemConfig !== void 0 && object.itemConfig !== null ? FieldConfig.fromPartial(object.itemConfig) : void 0;
    message.minEntries = object.minEntries ?? void 0;
    message.maxEntries = object.maxEntries ?? void 0;
    message.entryLabel = object.entryLabel ?? void 0;
    return message;
  }
};
messageTypeRegistry.set(FieldConfig_List.$type, FieldConfig_List);
function createBaseFieldConfig_Selection() {
  return {
    choices: [],
    multiSelect: void 0,
    minSelections: void 0,
    maxSelections: void 0,
    renderAsList: void 0
  };
}
var FieldConfig_Selection = {
  $type: "devvit.ui.form_builder.v1alpha.FieldConfig.Selection",
  encode(message, writer = import_minimal7.default.Writer.create()) {
    for (const v of message.choices) {
      FieldConfig_Selection_Item.encode(v, writer.uint32(10).fork()).ldelim();
    }
    if (message.multiSelect !== void 0) {
      writer.uint32(16).bool(message.multiSelect);
    }
    if (message.minSelections !== void 0) {
      writer.uint32(24).int32(message.minSelections);
    }
    if (message.maxSelections !== void 0) {
      writer.uint32(32).int32(message.maxSelections);
    }
    if (message.renderAsList !== void 0) {
      writer.uint32(40).bool(message.renderAsList);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal7.default.Reader ? input : import_minimal7.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseFieldConfig_Selection();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.choices.push(FieldConfig_Selection_Item.decode(reader, reader.uint32()));
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }
          message.multiSelect = reader.bool();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }
          message.minSelections = reader.int32();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }
          message.maxSelections = reader.int32();
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }
          message.renderAsList = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      choices: globalThis.Array.isArray(object?.choices) ? object.choices.map((e) => FieldConfig_Selection_Item.fromJSON(e)) : [],
      multiSelect: isSet7(object.multiSelect) ? globalThis.Boolean(object.multiSelect) : void 0,
      minSelections: isSet7(object.minSelections) ? globalThis.Number(object.minSelections) : void 0,
      maxSelections: isSet7(object.maxSelections) ? globalThis.Number(object.maxSelections) : void 0,
      renderAsList: isSet7(object.renderAsList) ? globalThis.Boolean(object.renderAsList) : void 0
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.choices?.length) {
      obj.choices = message.choices.map((e) => FieldConfig_Selection_Item.toJSON(e));
    }
    if (message.multiSelect !== void 0) {
      obj.multiSelect = message.multiSelect;
    }
    if (message.minSelections !== void 0) {
      obj.minSelections = Math.round(message.minSelections);
    }
    if (message.maxSelections !== void 0) {
      obj.maxSelections = Math.round(message.maxSelections);
    }
    if (message.renderAsList !== void 0) {
      obj.renderAsList = message.renderAsList;
    }
    return obj;
  },
  create(base) {
    return FieldConfig_Selection.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseFieldConfig_Selection();
    message.choices = object.choices?.map((e) => FieldConfig_Selection_Item.fromPartial(e)) || [];
    message.multiSelect = object.multiSelect ?? void 0;
    message.minSelections = object.minSelections ?? void 0;
    message.maxSelections = object.maxSelections ?? void 0;
    message.renderAsList = object.renderAsList ?? void 0;
    return message;
  }
};
messageTypeRegistry.set(FieldConfig_Selection.$type, FieldConfig_Selection);
function createBaseFieldConfig_Selection_Item() {
  return { label: "", value: "" };
}
var FieldConfig_Selection_Item = {
  $type: "devvit.ui.form_builder.v1alpha.FieldConfig.Selection.Item",
  encode(message, writer = import_minimal7.default.Writer.create()) {
    if (message.label !== "") {
      writer.uint32(10).string(message.label);
    }
    if (message.value !== "") {
      writer.uint32(18).string(message.value);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal7.default.Reader ? input : import_minimal7.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseFieldConfig_Selection_Item();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.label = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }
          message.value = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      label: isSet7(object.label) ? globalThis.String(object.label) : "",
      value: isSet7(object.value) ? globalThis.String(object.value) : ""
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.label !== "") {
      obj.label = message.label;
    }
    if (message.value !== "") {
      obj.value = message.value;
    }
    return obj;
  },
  create(base) {
    return FieldConfig_Selection_Item.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseFieldConfig_Selection_Item();
    message.label = object.label ?? "";
    message.value = object.value ?? "";
    return message;
  }
};
messageTypeRegistry.set(FieldConfig_Selection_Item.$type, FieldConfig_Selection_Item);
function createBaseFieldConfig_Group() {
  return { fields: [] };
}
var FieldConfig_Group = {
  $type: "devvit.ui.form_builder.v1alpha.FieldConfig.Group",
  encode(message, writer = import_minimal7.default.Writer.create()) {
    for (const v of message.fields) {
      FormField.encode(v, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal7.default.Reader ? input : import_minimal7.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseFieldConfig_Group();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.fields.push(FormField.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      fields: globalThis.Array.isArray(object?.fields) ? object.fields.map((e) => FormField.fromJSON(e)) : []
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.fields?.length) {
      obj.fields = message.fields.map((e) => FormField.toJSON(e));
    }
    return obj;
  },
  create(base) {
    return FieldConfig_Group.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseFieldConfig_Group();
    message.fields = object.fields?.map((e) => FormField.fromPartial(e)) || [];
    return message;
  }
};
messageTypeRegistry.set(FieldConfig_Group.$type, FieldConfig_Group);
function isSet7(value) {
  return value !== null && value !== void 0;
}

// node_modules/@devvit/protos/types/devvit/ui/form_builder/v1alpha/form.js
function createBaseForm() {
  return {
    fields: [],
    title: void 0,
    shortDescription: void 0,
    acceptLabel: void 0,
    cancelLabel: void 0,
    id: void 0
  };
}
var Form = {
  $type: "devvit.ui.form_builder.v1alpha.Form",
  encode(message, writer = import_minimal8.default.Writer.create()) {
    for (const v of message.fields) {
      FormField.encode(v, writer.uint32(10).fork()).ldelim();
    }
    if (message.title !== void 0) {
      writer.uint32(18).string(message.title);
    }
    if (message.shortDescription !== void 0) {
      writer.uint32(26).string(message.shortDescription);
    }
    if (message.acceptLabel !== void 0) {
      writer.uint32(34).string(message.acceptLabel);
    }
    if (message.cancelLabel !== void 0) {
      writer.uint32(42).string(message.cancelLabel);
    }
    if (message.id !== void 0) {
      writer.uint32(50).string(message.id);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal8.default.Reader ? input : import_minimal8.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseForm();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.fields.push(FormField.decode(reader, reader.uint32()));
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }
          message.title = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }
          message.shortDescription = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }
          message.acceptLabel = reader.string();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }
          message.cancelLabel = reader.string();
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }
          message.id = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      fields: globalThis.Array.isArray(object?.fields) ? object.fields.map((e) => FormField.fromJSON(e)) : [],
      title: isSet8(object.title) ? globalThis.String(object.title) : void 0,
      shortDescription: isSet8(object.shortDescription) ? globalThis.String(object.shortDescription) : void 0,
      acceptLabel: isSet8(object.acceptLabel) ? globalThis.String(object.acceptLabel) : void 0,
      cancelLabel: isSet8(object.cancelLabel) ? globalThis.String(object.cancelLabel) : void 0,
      id: isSet8(object.id) ? globalThis.String(object.id) : void 0
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.fields?.length) {
      obj.fields = message.fields.map((e) => FormField.toJSON(e));
    }
    if (message.title !== void 0) {
      obj.title = message.title;
    }
    if (message.shortDescription !== void 0) {
      obj.shortDescription = message.shortDescription;
    }
    if (message.acceptLabel !== void 0) {
      obj.acceptLabel = message.acceptLabel;
    }
    if (message.cancelLabel !== void 0) {
      obj.cancelLabel = message.cancelLabel;
    }
    if (message.id !== void 0) {
      obj.id = message.id;
    }
    return obj;
  },
  create(base) {
    return Form.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseForm();
    message.fields = object.fields?.map((e) => FormField.fromPartial(e)) || [];
    message.title = object.title ?? void 0;
    message.shortDescription = object.shortDescription ?? void 0;
    message.acceptLabel = object.acceptLabel ?? void 0;
    message.cancelLabel = object.cancelLabel ?? void 0;
    message.id = object.id ?? void 0;
    return message;
  }
};
messageTypeRegistry.set(Form.$type, Form);
function isSet8(value) {
  return value !== null && value !== void 0;
}

// node_modules/@devvit/protos/types/devvit/ui/effect_types/v1alpha/show_form.js
function createBaseShowFormEffect() {
  return { form: void 0 };
}
var ShowFormEffect = {
  $type: "devvit.ui.effect_types.v1alpha.ShowFormEffect",
  encode(message, writer = import_minimal9.default.Writer.create()) {
    if (message.form !== void 0) {
      Form.encode(message.form, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal9.default.Reader ? input : import_minimal9.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseShowFormEffect();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.form = Form.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return { form: isSet9(object.form) ? Form.fromJSON(object.form) : void 0 };
  },
  toJSON(message) {
    const obj = {};
    if (message.form !== void 0) {
      obj.form = Form.toJSON(message.form);
    }
    return obj;
  },
  create(base) {
    return ShowFormEffect.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseShowFormEffect();
    message.form = object.form !== void 0 && object.form !== null ? Form.fromPartial(object.form) : void 0;
    return message;
  }
};
messageTypeRegistry.set(ShowFormEffect.$type, ShowFormEffect);
function createBaseFormSubmittedEvent() {
  return { results: {}, formId: void 0 };
}
var FormSubmittedEvent = {
  $type: "devvit.ui.effect_types.v1alpha.FormSubmittedEvent",
  encode(message, writer = import_minimal9.default.Writer.create()) {
    Object.entries(message.results).forEach(([key, value]) => {
      FormSubmittedEvent_ResultsEntry.encode({ key, value }, writer.uint32(10).fork()).ldelim();
    });
    if (message.formId !== void 0) {
      writer.uint32(18).string(message.formId);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal9.default.Reader ? input : import_minimal9.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseFormSubmittedEvent();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          const entry1 = FormSubmittedEvent_ResultsEntry.decode(reader, reader.uint32());
          if (entry1.value !== void 0) {
            message.results[entry1.key] = entry1.value;
          }
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }
          message.formId = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      results: isObject3(object.results) ? Object.entries(object.results).reduce((acc, [key, value]) => {
        acc[key] = FormFieldValue.fromJSON(value);
        return acc;
      }, {}) : {},
      formId: isSet9(object.formId) ? globalThis.String(object.formId) : void 0
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.results) {
      const entries = Object.entries(message.results);
      if (entries.length > 0) {
        obj.results = {};
        entries.forEach(([k, v]) => {
          obj.results[k] = FormFieldValue.toJSON(v);
        });
      }
    }
    if (message.formId !== void 0) {
      obj.formId = message.formId;
    }
    return obj;
  },
  create(base) {
    return FormSubmittedEvent.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseFormSubmittedEvent();
    message.results = Object.entries(object.results ?? {}).reduce((acc, [key, value]) => {
      if (value !== void 0) {
        acc[key] = FormFieldValue.fromPartial(value);
      }
      return acc;
    }, {});
    message.formId = object.formId ?? void 0;
    return message;
  }
};
messageTypeRegistry.set(FormSubmittedEvent.$type, FormSubmittedEvent);
function createBaseFormSubmittedEvent_ResultsEntry() {
  return { key: "", value: void 0 };
}
var FormSubmittedEvent_ResultsEntry = {
  $type: "devvit.ui.effect_types.v1alpha.FormSubmittedEvent.ResultsEntry",
  encode(message, writer = import_minimal9.default.Writer.create()) {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== void 0) {
      FormFieldValue.encode(message.value, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal9.default.Reader ? input : import_minimal9.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseFormSubmittedEvent_ResultsEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.key = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }
          message.value = FormFieldValue.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      key: isSet9(object.key) ? globalThis.String(object.key) : "",
      value: isSet9(object.value) ? FormFieldValue.fromJSON(object.value) : void 0
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.key !== "") {
      obj.key = message.key;
    }
    if (message.value !== void 0) {
      obj.value = FormFieldValue.toJSON(message.value);
    }
    return obj;
  },
  create(base) {
    return FormSubmittedEvent_ResultsEntry.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseFormSubmittedEvent_ResultsEntry();
    message.key = object.key ?? "";
    message.value = object.value !== void 0 && object.value !== null ? FormFieldValue.fromPartial(object.value) : void 0;
    return message;
  }
};
messageTypeRegistry.set(FormSubmittedEvent_ResultsEntry.$type, FormSubmittedEvent_ResultsEntry);
function createBaseFormCanceledEvent() {
  return { formId: void 0 };
}
var FormCanceledEvent = {
  $type: "devvit.ui.effect_types.v1alpha.FormCanceledEvent",
  encode(message, writer = import_minimal9.default.Writer.create()) {
    if (message.formId !== void 0) {
      writer.uint32(10).string(message.formId);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal9.default.Reader ? input : import_minimal9.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseFormCanceledEvent();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.formId = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return { formId: isSet9(object.formId) ? globalThis.String(object.formId) : void 0 };
  },
  toJSON(message) {
    const obj = {};
    if (message.formId !== void 0) {
      obj.formId = message.formId;
    }
    return obj;
  },
  create(base) {
    return FormCanceledEvent.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseFormCanceledEvent();
    message.formId = object.formId ?? void 0;
    return message;
  }
};
messageTypeRegistry.set(FormCanceledEvent.$type, FormCanceledEvent);
function isObject3(value) {
  return typeof value === "object" && value !== null;
}
function isSet9(value) {
  return value !== null && value !== void 0;
}

// node_modules/@devvit/protos/types/devvit/ui/effect_types/v1alpha/update_request_context.js
var import_minimal10 = __toESM(require_minimal2(), 1);
function createBaseUpdateRequestContextEffect() {
  return {};
}
var UpdateRequestContextEffect = {
  $type: "devvit.ui.effect_types.v1alpha.UpdateRequestContextEffect",
  encode(_, writer = import_minimal10.default.Writer.create()) {
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal10.default.Reader ? input : import_minimal10.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseUpdateRequestContextEffect();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(_) {
    return {};
  },
  toJSON(_) {
    const obj = {};
    return obj;
  },
  create(base) {
    return UpdateRequestContextEffect.fromPartial(base ?? {});
  },
  fromPartial(_) {
    const message = createBaseUpdateRequestContextEffect();
    return message;
  }
};
messageTypeRegistry.set(UpdateRequestContextEffect.$type, UpdateRequestContextEffect);
function createBaseUpdateRequestContextEvent() {
  return { signedRequestContext: "" };
}
var UpdateRequestContextEvent = {
  $type: "devvit.ui.effect_types.v1alpha.UpdateRequestContextEvent",
  encode(message, writer = import_minimal10.default.Writer.create()) {
    if (message.signedRequestContext !== "") {
      writer.uint32(10).string(message.signedRequestContext);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal10.default.Reader ? input : import_minimal10.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseUpdateRequestContextEvent();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.signedRequestContext = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      signedRequestContext: isSet10(object.signedRequestContext) ? globalThis.String(object.signedRequestContext) : ""
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.signedRequestContext !== "") {
      obj.signedRequestContext = message.signedRequestContext;
    }
    return obj;
  },
  create(base) {
    return UpdateRequestContextEvent.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseUpdateRequestContextEvent();
    message.signedRequestContext = object.signedRequestContext ?? "";
    return message;
  }
};
messageTypeRegistry.set(UpdateRequestContextEvent.$type, UpdateRequestContextEvent);
function isSet10(value) {
  return value !== null && value !== void 0;
}

// node_modules/@devvit/protos/types/devvit/ui/effects/v1alpha/realtime_subscriptions.js
var import_minimal13 = __toESM(require_minimal2(), 1);

// node_modules/@devvit/protos/types/devvit/events/v1alpha/realtime.js
var import_minimal12 = __toESM(require_minimal2(), 1);

// node_modules/@devvit/protos/types/google/protobuf/empty.js
var import_minimal11 = __toESM(require_minimal2(), 1);
function createBaseEmpty() {
  return {};
}
var Empty = {
  $type: "google.protobuf.Empty",
  encode(_, writer = import_minimal11.default.Writer.create()) {
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal11.default.Reader ? input : import_minimal11.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseEmpty();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(_) {
    return {};
  },
  toJSON(_) {
    const obj = {};
    return obj;
  },
  create(base) {
    return Empty.fromPartial(base ?? {});
  },
  fromPartial(_) {
    const message = createBaseEmpty();
    return message;
  }
};
messageTypeRegistry.set(Empty.$type, Empty);

// node_modules/@devvit/protos/types/devvit/events/v1alpha/realtime.js
function createBaseRealtimeRequest() {
  return { channels: [] };
}
var RealtimeRequest = {
  $type: "devvit.events.v1alpha.RealtimeRequest",
  encode(message, writer = import_minimal12.default.Writer.create()) {
    for (const v of message.channels) {
      writer.uint32(10).string(v);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal12.default.Reader ? input : import_minimal12.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseRealtimeRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.channels.push(reader.string());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      channels: globalThis.Array.isArray(object?.channels) ? object.channels.map((e) => globalThis.String(e)) : []
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.channels?.length) {
      obj.channels = message.channels;
    }
    return obj;
  },
  create(base) {
    return RealtimeRequest.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseRealtimeRequest();
    message.channels = object.channels?.map((e) => e) || [];
    return message;
  }
};
messageTypeRegistry.set(RealtimeRequest.$type, RealtimeRequest);
function createBaseRealtimeEvent() {
  return { channel: "", data: void 0 };
}
var RealtimeEvent = {
  $type: "devvit.events.v1alpha.RealtimeEvent",
  encode(message, writer = import_minimal12.default.Writer.create()) {
    if (message.channel !== "") {
      writer.uint32(10).string(message.channel);
    }
    if (message.data !== void 0) {
      Struct.encode(Struct.wrap(message.data), writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal12.default.Reader ? input : import_minimal12.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseRealtimeEvent();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.channel = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }
          message.data = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      channel: isSet11(object.channel) ? globalThis.String(object.channel) : "",
      data: isObject4(object.data) ? object.data : void 0
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.channel !== "") {
      obj.channel = message.channel;
    }
    if (message.data !== void 0) {
      obj.data = message.data;
    }
    return obj;
  },
  create(base) {
    return RealtimeEvent.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseRealtimeEvent();
    message.channel = object.channel ?? "";
    message.data = object.data ?? void 0;
    return message;
  }
};
messageTypeRegistry.set(RealtimeEvent.$type, RealtimeEvent);
function isObject4(value) {
  return typeof value === "object" && value !== null;
}
function isSet11(value) {
  return value !== null && value !== void 0;
}

// node_modules/@devvit/protos/types/devvit/ui/effects/v1alpha/realtime_subscriptions.js
var RealtimeSubscriptionStatus;
(function(RealtimeSubscriptionStatus3) {
  RealtimeSubscriptionStatus3[RealtimeSubscriptionStatus3["REALTIME_SUBSCRIBED"] = 0] = "REALTIME_SUBSCRIBED";
  RealtimeSubscriptionStatus3[RealtimeSubscriptionStatus3["REALTIME_UNSUBSCRIBED"] = 1] = "REALTIME_UNSUBSCRIBED";
  RealtimeSubscriptionStatus3[RealtimeSubscriptionStatus3["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(RealtimeSubscriptionStatus || (RealtimeSubscriptionStatus = {}));
function realtimeSubscriptionStatusFromJSON(object) {
  switch (object) {
    case 0:
    case "REALTIME_SUBSCRIBED":
      return RealtimeSubscriptionStatus.REALTIME_SUBSCRIBED;
    case 1:
    case "REALTIME_UNSUBSCRIBED":
      return RealtimeSubscriptionStatus.REALTIME_UNSUBSCRIBED;
    case -1:
    case "UNRECOGNIZED":
    default:
      return RealtimeSubscriptionStatus.UNRECOGNIZED;
  }
}
function realtimeSubscriptionStatusToJSON(object) {
  switch (object) {
    case RealtimeSubscriptionStatus.REALTIME_SUBSCRIBED:
      return 0;
    case RealtimeSubscriptionStatus.REALTIME_UNSUBSCRIBED:
      return 1;
    case RealtimeSubscriptionStatus.UNRECOGNIZED:
    default:
      return -1;
  }
}
function createBaseRealtimeSubscriptionsEffect() {
  return { subscriptionIds: [] };
}
var RealtimeSubscriptionsEffect = {
  $type: "devvit.ui.effects.v1alpha.RealtimeSubscriptionsEffect",
  encode(message, writer = import_minimal13.default.Writer.create()) {
    for (const v of message.subscriptionIds) {
      writer.uint32(10).string(v);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal13.default.Reader ? input : import_minimal13.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseRealtimeSubscriptionsEffect();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.subscriptionIds.push(reader.string());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      subscriptionIds: globalThis.Array.isArray(object?.subscriptionIds) ? object.subscriptionIds.map((e) => globalThis.String(e)) : []
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.subscriptionIds?.length) {
      obj.subscriptionIds = message.subscriptionIds;
    }
    return obj;
  },
  create(base) {
    return RealtimeSubscriptionsEffect.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseRealtimeSubscriptionsEffect();
    message.subscriptionIds = object.subscriptionIds?.map((e) => e) || [];
    return message;
  }
};
messageTypeRegistry.set(RealtimeSubscriptionsEffect.$type, RealtimeSubscriptionsEffect);
function createBaseRealtimeSubscriptionEvent() {
  return { event: void 0, status: void 0 };
}
var RealtimeSubscriptionEvent = {
  $type: "devvit.ui.effects.v1alpha.RealtimeSubscriptionEvent",
  encode(message, writer = import_minimal13.default.Writer.create()) {
    if (message.event !== void 0) {
      RealtimeEvent.encode(message.event, writer.uint32(10).fork()).ldelim();
    }
    if (message.status !== void 0) {
      writer.uint32(16).int32(message.status);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal13.default.Reader ? input : import_minimal13.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseRealtimeSubscriptionEvent();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.event = RealtimeEvent.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }
          message.status = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      event: isSet12(object.event) ? RealtimeEvent.fromJSON(object.event) : void 0,
      status: isSet12(object.status) ? realtimeSubscriptionStatusFromJSON(object.status) : void 0
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.event !== void 0) {
      obj.event = RealtimeEvent.toJSON(message.event);
    }
    if (message.status !== void 0) {
      obj.status = realtimeSubscriptionStatusToJSON(message.status);
    }
    return obj;
  },
  create(base) {
    return RealtimeSubscriptionEvent.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseRealtimeSubscriptionEvent();
    message.event = object.event !== void 0 && object.event !== null ? RealtimeEvent.fromPartial(object.event) : void 0;
    message.status = object.status ?? void 0;
    return message;
  }
};
messageTypeRegistry.set(RealtimeSubscriptionEvent.$type, RealtimeSubscriptionEvent);
function isSet12(value) {
  return value !== null && value !== void 0;
}

// node_modules/@devvit/protos/types/devvit/ui/effects/web_view/v1alpha/immersive_mode.js
var import_minimal14 = __toESM(require_minimal2(), 1);
var WebViewImmersiveMode2;
(function(WebViewImmersiveMode3) {
  WebViewImmersiveMode3[WebViewImmersiveMode3["UNSPECIFIED"] = 0] = "UNSPECIFIED";
  WebViewImmersiveMode3[WebViewImmersiveMode3["INLINE_MODE"] = 1] = "INLINE_MODE";
  WebViewImmersiveMode3[WebViewImmersiveMode3["IMMERSIVE_MODE"] = 2] = "IMMERSIVE_MODE";
  WebViewImmersiveMode3[WebViewImmersiveMode3["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(WebViewImmersiveMode2 || (WebViewImmersiveMode2 = {}));
function webViewImmersiveModeFromJSON(object) {
  switch (object) {
    case 0:
    case "UNSPECIFIED":
      return WebViewImmersiveMode2.UNSPECIFIED;
    case 1:
    case "INLINE_MODE":
      return WebViewImmersiveMode2.INLINE_MODE;
    case 2:
    case "IMMERSIVE_MODE":
      return WebViewImmersiveMode2.IMMERSIVE_MODE;
    case -1:
    case "UNRECOGNIZED":
    default:
      return WebViewImmersiveMode2.UNRECOGNIZED;
  }
}
function webViewImmersiveModeToJSON(object) {
  switch (object) {
    case WebViewImmersiveMode2.UNSPECIFIED:
      return 0;
    case WebViewImmersiveMode2.INLINE_MODE:
      return 1;
    case WebViewImmersiveMode2.IMMERSIVE_MODE:
      return 2;
    case WebViewImmersiveMode2.UNRECOGNIZED:
    default:
      return -1;
  }
}
function createBaseWebViewImmersiveModeEffect() {
  return { immersiveMode: 0, entryUrl: void 0 };
}
var WebViewImmersiveModeEffect = {
  $type: "devvit.ui.effects.web_view.v1alpha.WebViewImmersiveModeEffect",
  encode(message, writer = import_minimal14.default.Writer.create()) {
    if (message.immersiveMode !== 0) {
      writer.uint32(8).int32(message.immersiveMode);
    }
    if (message.entryUrl !== void 0) {
      writer.uint32(18).string(message.entryUrl);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal14.default.Reader ? input : import_minimal14.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseWebViewImmersiveModeEffect();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }
          message.immersiveMode = reader.int32();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }
          message.entryUrl = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      immersiveMode: isSet13(object.immersiveMode) ? webViewImmersiveModeFromJSON(object.immersiveMode) : 0,
      entryUrl: isSet13(object.entryUrl) ? globalThis.String(object.entryUrl) : void 0
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.immersiveMode !== 0) {
      obj.immersiveMode = webViewImmersiveModeToJSON(message.immersiveMode);
    }
    if (message.entryUrl !== void 0) {
      obj.entryUrl = message.entryUrl;
    }
    return obj;
  },
  create(base) {
    return WebViewImmersiveModeEffect.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseWebViewImmersiveModeEffect();
    message.immersiveMode = object.immersiveMode ?? 0;
    message.entryUrl = object.entryUrl ?? void 0;
    return message;
  }
};
messageTypeRegistry.set(WebViewImmersiveModeEffect.$type, WebViewImmersiveModeEffect);
function isSet13(value) {
  return value !== null && value !== void 0;
}

// node_modules/@devvit/protos/types/devvit/ui/effects/web_view/v1alpha/screenshot.js
var import_minimal15 = __toESM(require_minimal2(), 1);
function createBaseWebViewScreenshotRequestEvent() {
  return {};
}
var WebViewScreenshotRequestEvent = {
  $type: "devvit.ui.effects.web_view.v1alpha.WebViewScreenshotRequestEvent",
  encode(_, writer = import_minimal15.default.Writer.create()) {
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal15.default.Reader ? input : import_minimal15.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseWebViewScreenshotRequestEvent();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(_) {
    return {};
  },
  toJSON(_) {
    const obj = {};
    return obj;
  },
  create(base) {
    return WebViewScreenshotRequestEvent.fromPartial(base ?? {});
  },
  fromPartial(_) {
    const message = createBaseWebViewScreenshotRequestEvent();
    return message;
  }
};
messageTypeRegistry.set(WebViewScreenshotRequestEvent.$type, WebViewScreenshotRequestEvent);
function createBaseWebViewScreenshotResponseEffect() {
  return { dataUrl: void 0, error: void 0 };
}
var WebViewScreenshotResponseEffect = {
  $type: "devvit.ui.effects.web_view.v1alpha.WebViewScreenshotResponseEffect",
  encode(message, writer = import_minimal15.default.Writer.create()) {
    if (message.dataUrl !== void 0) {
      writer.uint32(10).string(message.dataUrl);
    }
    if (message.error !== void 0) {
      writer.uint32(18).string(message.error);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal15.default.Reader ? input : import_minimal15.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseWebViewScreenshotResponseEffect();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.dataUrl = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }
          message.error = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      dataUrl: isSet14(object.dataUrl) ? globalThis.String(object.dataUrl) : void 0,
      error: isSet14(object.error) ? globalThis.String(object.error) : void 0
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.dataUrl !== void 0) {
      obj.dataUrl = message.dataUrl;
    }
    if (message.error !== void 0) {
      obj.error = message.error;
    }
    return obj;
  },
  create(base) {
    return WebViewScreenshotResponseEffect.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseWebViewScreenshotResponseEffect();
    message.dataUrl = object.dataUrl ?? void 0;
    message.error = object.error ?? void 0;
    return message;
  }
};
messageTypeRegistry.set(WebViewScreenshotResponseEffect.$type, WebViewScreenshotResponseEffect);
function isSet14(value) {
  return value !== null && value !== void 0;
}

// node_modules/@devvit/protos/types/devvit/ui/events/v1alpha/web_view.js
var WebViewVisibility;
(function(WebViewVisibility2) {
  WebViewVisibility2[WebViewVisibility2["WEBVIEW_VISIBLE"] = 0] = "WEBVIEW_VISIBLE";
  WebViewVisibility2[WebViewVisibility2["WEBVIEW_HIDDEN"] = 1] = "WEBVIEW_HIDDEN";
  WebViewVisibility2[WebViewVisibility2["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(WebViewVisibility || (WebViewVisibility = {}));
function webViewVisibilityFromJSON(object) {
  switch (object) {
    case 0:
    case "WEBVIEW_VISIBLE":
      return WebViewVisibility.WEBVIEW_VISIBLE;
    case 1:
    case "WEBVIEW_HIDDEN":
      return WebViewVisibility.WEBVIEW_HIDDEN;
    case -1:
    case "UNRECOGNIZED":
    default:
      return WebViewVisibility.UNRECOGNIZED;
  }
}
function webViewVisibilityToJSON(object) {
  switch (object) {
    case WebViewVisibility.WEBVIEW_VISIBLE:
      return 0;
    case WebViewVisibility.WEBVIEW_HIDDEN:
      return 1;
    case WebViewVisibility.UNRECOGNIZED:
    default:
      return -1;
  }
}
function createBaseWebViewPostMessageEvent() {
  return { message: void 0, jsonString: "" };
}
var WebViewPostMessageEvent = {
  $type: "devvit.ui.events.v1alpha.WebViewPostMessageEvent",
  encode(message, writer = import_minimal16.default.Writer.create()) {
    if (message.message !== void 0) {
      Value.encode(Value.wrap(message.message), writer.uint32(10).fork()).ldelim();
    }
    if (message.jsonString !== "") {
      writer.uint32(18).string(message.jsonString);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal16.default.Reader ? input : import_minimal16.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseWebViewPostMessageEvent();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.message = Value.unwrap(Value.decode(reader, reader.uint32()));
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }
          message.jsonString = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      message: isSet15(object?.message) ? object.message : void 0,
      jsonString: isSet15(object.jsonString) ? globalThis.String(object.jsonString) : ""
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.message !== void 0) {
      obj.message = message.message;
    }
    if (message.jsonString !== "") {
      obj.jsonString = message.jsonString;
    }
    return obj;
  },
  create(base) {
    return WebViewPostMessageEvent.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseWebViewPostMessageEvent();
    message.message = object.message ?? void 0;
    message.jsonString = object.jsonString ?? "";
    return message;
  }
};
messageTypeRegistry.set(WebViewPostMessageEvent.$type, WebViewPostMessageEvent);
function createBaseWebViewFullScreenEvent() {
  return { visibility: 0 };
}
var WebViewFullScreenEvent = {
  $type: "devvit.ui.events.v1alpha.WebViewFullScreenEvent",
  encode(message, writer = import_minimal16.default.Writer.create()) {
    if (message.visibility !== 0) {
      writer.uint32(8).int32(message.visibility);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal16.default.Reader ? input : import_minimal16.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseWebViewFullScreenEvent();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }
          message.visibility = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return { visibility: isSet15(object.visibility) ? webViewVisibilityFromJSON(object.visibility) : 0 };
  },
  toJSON(message) {
    const obj = {};
    if (message.visibility !== 0) {
      obj.visibility = webViewVisibilityToJSON(message.visibility);
    }
    return obj;
  },
  create(base) {
    return WebViewFullScreenEvent.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseWebViewFullScreenEvent();
    message.visibility = object.visibility ?? 0;
    return message;
  }
};
messageTypeRegistry.set(WebViewFullScreenEvent.$type, WebViewFullScreenEvent);
function createBaseWebViewEvent() {
  return { postMessage: void 0, fullScreen: void 0 };
}
var WebViewEvent = {
  $type: "devvit.ui.events.v1alpha.WebViewEvent",
  encode(message, writer = import_minimal16.default.Writer.create()) {
    if (message.postMessage !== void 0) {
      WebViewPostMessageEvent.encode(message.postMessage, writer.uint32(10).fork()).ldelim();
    }
    if (message.fullScreen !== void 0) {
      WebViewFullScreenEvent.encode(message.fullScreen, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal16.default.Reader ? input : import_minimal16.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseWebViewEvent();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.postMessage = WebViewPostMessageEvent.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }
          message.fullScreen = WebViewFullScreenEvent.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      postMessage: isSet15(object.postMessage) ? WebViewPostMessageEvent.fromJSON(object.postMessage) : void 0,
      fullScreen: isSet15(object.fullScreen) ? WebViewFullScreenEvent.fromJSON(object.fullScreen) : void 0
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.postMessage !== void 0) {
      obj.postMessage = WebViewPostMessageEvent.toJSON(message.postMessage);
    }
    if (message.fullScreen !== void 0) {
      obj.fullScreen = WebViewFullScreenEvent.toJSON(message.fullScreen);
    }
    return obj;
  },
  create(base) {
    return WebViewEvent.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseWebViewEvent();
    message.postMessage = object.postMessage !== void 0 && object.postMessage !== null ? WebViewPostMessageEvent.fromPartial(object.postMessage) : void 0;
    message.fullScreen = object.fullScreen !== void 0 && object.fullScreen !== null ? WebViewFullScreenEvent.fromPartial(object.fullScreen) : void 0;
    return message;
  }
};
messageTypeRegistry.set(WebViewEvent.$type, WebViewEvent);
function createBaseWebViewImmersiveModeChangedEvent() {
  return { immersiveMode: 0 };
}
var WebViewImmersiveModeChangedEvent = {
  $type: "devvit.ui.events.v1alpha.WebViewImmersiveModeChangedEvent",
  encode(message, writer = import_minimal16.default.Writer.create()) {
    if (message.immersiveMode !== 0) {
      writer.uint32(8).int32(message.immersiveMode);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal16.default.Reader ? input : import_minimal16.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseWebViewImmersiveModeChangedEvent();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }
          message.immersiveMode = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return { immersiveMode: isSet15(object.immersiveMode) ? webViewImmersiveModeFromJSON(object.immersiveMode) : 0 };
  },
  toJSON(message) {
    const obj = {};
    if (message.immersiveMode !== 0) {
      obj.immersiveMode = webViewImmersiveModeToJSON(message.immersiveMode);
    }
    return obj;
  },
  create(base) {
    return WebViewImmersiveModeChangedEvent.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseWebViewImmersiveModeChangedEvent();
    message.immersiveMode = object.immersiveMode ?? 0;
    return message;
  }
};
messageTypeRegistry.set(WebViewImmersiveModeChangedEvent.$type, WebViewImmersiveModeChangedEvent);
function createBaseWebViewInternalEventMessage() {
  return {
    id: "",
    formCanceled: void 0,
    formSubmitted: void 0,
    realtimeEvent: void 0,
    immersiveModeEvent: void 0,
    consentStatus: void 0,
    orderResult: void 0,
    updateRequestContext: void 0,
    screenshotRequest: void 0
  };
}
var WebViewInternalEventMessage = {
  $type: "devvit.ui.events.v1alpha.WebViewInternalEventMessage",
  encode(message, writer = import_minimal16.default.Writer.create()) {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.formCanceled !== void 0) {
      FormCanceledEvent.encode(message.formCanceled, writer.uint32(18).fork()).ldelim();
    }
    if (message.formSubmitted !== void 0) {
      FormSubmittedEvent.encode(message.formSubmitted, writer.uint32(26).fork()).ldelim();
    }
    if (message.realtimeEvent !== void 0) {
      RealtimeSubscriptionEvent.encode(message.realtimeEvent, writer.uint32(34).fork()).ldelim();
    }
    if (message.immersiveModeEvent !== void 0) {
      WebViewImmersiveModeChangedEvent.encode(message.immersiveModeEvent, writer.uint32(42).fork()).ldelim();
    }
    if (message.consentStatus !== void 0) {
      ConsentStatusEvent.encode(message.consentStatus, writer.uint32(58).fork()).ldelim();
    }
    if (message.orderResult !== void 0) {
      OrderResultEvent.encode(message.orderResult, writer.uint32(66).fork()).ldelim();
    }
    if (message.updateRequestContext !== void 0) {
      UpdateRequestContextEvent.encode(message.updateRequestContext, writer.uint32(74).fork()).ldelim();
    }
    if (message.screenshotRequest !== void 0) {
      WebViewScreenshotRequestEvent.encode(message.screenshotRequest, writer.uint32(82).fork()).ldelim();
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal16.default.Reader ? input : import_minimal16.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseWebViewInternalEventMessage();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.id = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }
          message.formCanceled = FormCanceledEvent.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }
          message.formSubmitted = FormSubmittedEvent.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }
          message.realtimeEvent = RealtimeSubscriptionEvent.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }
          message.immersiveModeEvent = WebViewImmersiveModeChangedEvent.decode(reader, reader.uint32());
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }
          message.consentStatus = ConsentStatusEvent.decode(reader, reader.uint32());
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }
          message.orderResult = OrderResultEvent.decode(reader, reader.uint32());
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }
          message.updateRequestContext = UpdateRequestContextEvent.decode(reader, reader.uint32());
          continue;
        case 10:
          if (tag !== 82) {
            break;
          }
          message.screenshotRequest = WebViewScreenshotRequestEvent.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      id: isSet15(object.id) ? globalThis.String(object.id) : "",
      formCanceled: isSet15(object.formCanceled) ? FormCanceledEvent.fromJSON(object.formCanceled) : void 0,
      formSubmitted: isSet15(object.formSubmitted) ? FormSubmittedEvent.fromJSON(object.formSubmitted) : void 0,
      realtimeEvent: isSet15(object.realtimeEvent) ? RealtimeSubscriptionEvent.fromJSON(object.realtimeEvent) : void 0,
      immersiveModeEvent: isSet15(object.immersiveModeEvent) ? WebViewImmersiveModeChangedEvent.fromJSON(object.immersiveModeEvent) : void 0,
      consentStatus: isSet15(object.consentStatus) ? ConsentStatusEvent.fromJSON(object.consentStatus) : void 0,
      orderResult: isSet15(object.orderResult) ? OrderResultEvent.fromJSON(object.orderResult) : void 0,
      updateRequestContext: isSet15(object.updateRequestContext) ? UpdateRequestContextEvent.fromJSON(object.updateRequestContext) : void 0,
      screenshotRequest: isSet15(object.screenshotRequest) ? WebViewScreenshotRequestEvent.fromJSON(object.screenshotRequest) : void 0
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.id !== "") {
      obj.id = message.id;
    }
    if (message.formCanceled !== void 0) {
      obj.formCanceled = FormCanceledEvent.toJSON(message.formCanceled);
    }
    if (message.formSubmitted !== void 0) {
      obj.formSubmitted = FormSubmittedEvent.toJSON(message.formSubmitted);
    }
    if (message.realtimeEvent !== void 0) {
      obj.realtimeEvent = RealtimeSubscriptionEvent.toJSON(message.realtimeEvent);
    }
    if (message.immersiveModeEvent !== void 0) {
      obj.immersiveModeEvent = WebViewImmersiveModeChangedEvent.toJSON(message.immersiveModeEvent);
    }
    if (message.consentStatus !== void 0) {
      obj.consentStatus = ConsentStatusEvent.toJSON(message.consentStatus);
    }
    if (message.orderResult !== void 0) {
      obj.orderResult = OrderResultEvent.toJSON(message.orderResult);
    }
    if (message.updateRequestContext !== void 0) {
      obj.updateRequestContext = UpdateRequestContextEvent.toJSON(message.updateRequestContext);
    }
    if (message.screenshotRequest !== void 0) {
      obj.screenshotRequest = WebViewScreenshotRequestEvent.toJSON(message.screenshotRequest);
    }
    return obj;
  },
  create(base) {
    return WebViewInternalEventMessage.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseWebViewInternalEventMessage();
    message.id = object.id ?? "";
    message.formCanceled = object.formCanceled !== void 0 && object.formCanceled !== null ? FormCanceledEvent.fromPartial(object.formCanceled) : void 0;
    message.formSubmitted = object.formSubmitted !== void 0 && object.formSubmitted !== null ? FormSubmittedEvent.fromPartial(object.formSubmitted) : void 0;
    message.realtimeEvent = object.realtimeEvent !== void 0 && object.realtimeEvent !== null ? RealtimeSubscriptionEvent.fromPartial(object.realtimeEvent) : void 0;
    message.immersiveModeEvent = object.immersiveModeEvent !== void 0 && object.immersiveModeEvent !== null ? WebViewImmersiveModeChangedEvent.fromPartial(object.immersiveModeEvent) : void 0;
    message.consentStatus = object.consentStatus !== void 0 && object.consentStatus !== null ? ConsentStatusEvent.fromPartial(object.consentStatus) : void 0;
    message.orderResult = object.orderResult !== void 0 && object.orderResult !== null ? OrderResultEvent.fromPartial(object.orderResult) : void 0;
    message.updateRequestContext = object.updateRequestContext !== void 0 && object.updateRequestContext !== null ? UpdateRequestContextEvent.fromPartial(object.updateRequestContext) : void 0;
    message.screenshotRequest = object.screenshotRequest !== void 0 && object.screenshotRequest !== null ? WebViewScreenshotRequestEvent.fromPartial(object.screenshotRequest) : void 0;
    return message;
  }
};
messageTypeRegistry.set(WebViewInternalEventMessage.$type, WebViewInternalEventMessage);
function createBaseWebViewMessageEvent() {
  return { data: void 0 };
}
var WebViewMessageEvent = {
  $type: "devvit.ui.events.v1alpha.WebViewMessageEvent",
  encode(message, writer = import_minimal16.default.Writer.create()) {
    if (message.data !== void 0) {
      WebViewMessageEvent_MessageData.encode(message.data, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal16.default.Reader ? input : import_minimal16.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseWebViewMessageEvent();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.data = WebViewMessageEvent_MessageData.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return { data: isSet15(object.data) ? WebViewMessageEvent_MessageData.fromJSON(object.data) : void 0 };
  },
  toJSON(message) {
    const obj = {};
    if (message.data !== void 0) {
      obj.data = WebViewMessageEvent_MessageData.toJSON(message.data);
    }
    return obj;
  },
  create(base) {
    return WebViewMessageEvent.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseWebViewMessageEvent();
    message.data = object.data !== void 0 && object.data !== null ? WebViewMessageEvent_MessageData.fromPartial(object.data) : void 0;
    return message;
  }
};
messageTypeRegistry.set(WebViewMessageEvent.$type, WebViewMessageEvent);
function createBaseWebViewMessageEvent_MessageData() {
  return { type: "", data: void 0 };
}
var WebViewMessageEvent_MessageData = {
  $type: "devvit.ui.events.v1alpha.WebViewMessageEvent.MessageData",
  encode(message, writer = import_minimal16.default.Writer.create()) {
    if (message.type !== "") {
      writer.uint32(10).string(message.type);
    }
    if (message.data !== void 0) {
      WebViewInternalEventMessage.encode(message.data, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal16.default.Reader ? input : import_minimal16.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseWebViewMessageEvent_MessageData();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.type = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }
          message.data = WebViewInternalEventMessage.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      type: isSet15(object.type) ? globalThis.String(object.type) : "",
      data: isSet15(object.data) ? WebViewInternalEventMessage.fromJSON(object.data) : void 0
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.type !== "") {
      obj.type = message.type;
    }
    if (message.data !== void 0) {
      obj.data = WebViewInternalEventMessage.toJSON(message.data);
    }
    return obj;
  },
  create(base) {
    return WebViewMessageEvent_MessageData.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseWebViewMessageEvent_MessageData();
    message.type = object.type ?? "";
    message.data = object.data !== void 0 && object.data !== null ? WebViewInternalEventMessage.fromPartial(object.data) : void 0;
    return message;
  }
};
messageTypeRegistry.set(WebViewMessageEvent_MessageData.$type, WebViewMessageEvent_MessageData);
function isSet15(value) {
  return value !== null && value !== void 0;
}

// node_modules/@devvit/shared-types/client/emit-effect.js
var webViewInternalMessageType = "devvit-internal";
var emitEffect = (effect, requestId) => {
  const message = {
    ...effect,
    realtimeEffect: effect.realtime,
    // to-do: remove deprecated field.
    id: requestId,
    scope: WebViewInternalMessageScope.CLIENT,
    type: webViewInternalMessageType
  };
  if (effect.showToast || effect.navigateToUrl) {
    message.effect = effect;
  }
  parent.postMessage(message, "*");
};

// node_modules/@devvit/shared-types/client/telemetry.js
function emitTelemetryClickEffect(event) {
  const click = TelemetryClickPayload(event.target, event.isTrusted);
  void emitEffect({
    type: EffectType.EFFECT_TELEMETRY,
    telemetry: { event: click.event, click },
    // to-do: remove once all clients support `telemetry`. Deprecated on
    //        2025-11-24.
    analytics: click
  });
}
function TelemetryClickPayload(eventTarget, isTrusted) {
  const { definition, elemTrackId } = analyzeClickTarget(eventTarget, isTrusted);
  return { event: "click", definition, elemTrackId };
}
function analyzeClickTarget(eventTarget, isTrusted) {
  const targetElement = getTargetElement(eventTarget);
  if (!targetElement) {
    return { definition: "default", elemTrackId: void 0 };
  }
  let definition = "default";
  if (isTrusted) {
    const computedStyles = globalThis.window.getComputedStyle(targetElement);
    if (computedStyles?.getPropertyValue("cursor") === "pointer") {
      definition = "strict";
    }
  }
  let elemTrackId;
  let currentElement = targetElement;
  while (currentElement) {
    if (elemTrackId === void 0) {
      const dataTrackId = currentElement.getAttribute("data-track-id");
      if (dataTrackId) {
        elemTrackId = dataTrackId;
      } else if (currentElement.id) {
        elemTrackId = currentElement.id;
      }
    }
    if (isTrusted && definition === "default" && elementIsStrictClickTarget(currentElement)) {
      definition = "strict";
    }
    if (elemTrackId !== void 0 && (!isTrusted || definition === "strict")) {
      break;
    }
    currentElement = currentElement.parentElement;
  }
  return { definition, elemTrackId };
}
function getTargetElement(eventTarget) {
  if (!eventTarget || typeof eventTarget !== "object" || !("nodeType" in eventTarget)) {
    return void 0;
  }
  const node = eventTarget;
  return node.nodeType === 1 ? node : node.parentElement ?? void 0;
}
function elementIsStrictClickTarget(element) {
  const STRICT_CLICK_TAGNAMES = ["A", "BUTTON", "CANVAS", "INPUT", "SELECT", "TEXTAREA", "LABEL"];
  return STRICT_CLICK_TAGNAMES.includes(element.tagName) || ["true", "plaintext-only"].includes(element.getAttribute("contenteditable") ?? "");
}

// node_modules/@devvit/shared-types/webbit.js
var tokenParam = "token";

// node_modules/@devvit/client/effects/web-view-mode.js
var modeListeners = /* @__PURE__ */ new Set();
function getWebViewMode() {
  return webViewMode(devvit.webViewMode);
}
function requestExpandedMode(event, entry) {
  if (devvit.webViewMode === WebViewImmersiveMode.IMMERSIVE_MODE)
    throw Error("web view is already expanded");
  emitTelemetryClickEffect(event);
  emitModeEffect(WebViewImmersiveMode.IMMERSIVE_MODE, event, entry);
}
function emitModeEffect(mode, event, entry) {
  if (!event.isTrusted || event.type !== "click") {
    console.error("Expanded mode effect ignored due to untrusted event");
    throw new Error("Untrusted event");
  }
  if (entry != null && !devvit.entrypoints[entry])
    throw Error(`no entrypoint named "${entry}"; all entrypoints must appear in \`devvit.json\` \`post.entrypoints\``);
  let entryUrl;
  if (entry) {
    const url = new URL(devvit.entrypoints[entry]);
    url.searchParams.set(tokenParam, devvit.token);
    entryUrl = `${url}`;
  }
  emitEffect({
    type: EffectType.EFFECT_WEB_VIEW,
    immersiveMode: { entryUrl, immersiveMode: mode }
  });
}
function initWebViewMode() {
  addEventListener("message", onWebViewMessage);
}
function onWebViewMessage(ev) {
  if (ev.data?.type !== "devvit-message")
    return;
  if (!ev.data?.data?.immersiveModeEvent)
    return;
  const mode = getWebViewMode();
  for (const listener of modeListeners)
    listener(mode);
}
function webViewMode(mode) {
  switch (mode) {
    case WebViewImmersiveMode.IMMERSIVE_MODE:
      return "expanded";
    case WebViewImmersiveMode.INLINE_MODE:
    case WebViewImmersiveMode.UNRECOGNIZED:
    case WebViewImmersiveMode.UNSPECIFIED:
    case void 0:
      return "inline";
    default:
      mode;
      throw Error(`${mode} not a WebViewImmersiveMode`);
  }
}

// node_modules/@devvit/client/clientContext.js
var context = globalThis.devvit?.context;

// node_modules/@devvit/protos/json/reddit/devvit/app_permission/v1/app_permission.js
var ConsentStatus2;
(function(ConsentStatus3) {
  ConsentStatus3[ConsentStatus3["CONSENT_STATUS_UNKNOWN"] = 0] = "CONSENT_STATUS_UNKNOWN";
  ConsentStatus3[ConsentStatus3["REVOKED"] = 1] = "REVOKED";
  ConsentStatus3[ConsentStatus3["GRANTED"] = 2] = "GRANTED";
  ConsentStatus3[ConsentStatus3["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(ConsentStatus2 || (ConsentStatus2 = {}));
var Scope2;
(function(Scope3) {
  Scope3[Scope3["SCOPE_UNKNOWN"] = 0] = "SCOPE_UNKNOWN";
  Scope3[Scope3["SUBMIT_POST"] = 1] = "SUBMIT_POST";
  Scope3[Scope3["SUBMIT_COMMENT"] = 2] = "SUBMIT_COMMENT";
  Scope3[Scope3["SUBSCRIBE_TO_SUBREDDIT"] = 3] = "SUBSCRIBE_TO_SUBREDDIT";
  Scope3[Scope3["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(Scope2 || (Scope2 = {}));

// node_modules/@devvit/protos/json/devvit/ui/effects/web_view/v1alpha/context.js
var Client;
(function(Client2) {
  Client2[Client2["CLIENT_UNSPECIFIED"] = 0] = "CLIENT_UNSPECIFIED";
  Client2[Client2["ANDROID"] = 1] = "ANDROID";
  Client2[Client2["IOS"] = 2] = "IOS";
  Client2[Client2["SHREDDIT"] = 3] = "SHREDDIT";
  Client2[Client2["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(Client || (Client = {}));
var Height;
(function(Height2) {
  Height2[Height2["HEIGHT_UNSPECIFIED"] = 0] = "HEIGHT_UNSPECIFIED";
  Height2[Height2["REGULAR"] = 1] = "REGULAR";
  Height2[Height2["TALL"] = 2] = "TALL";
  Height2[Height2["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(Height || (Height = {}));

// node_modules/@devvit/shared-types/tid.js
var T_PREFIX;
(function(T_PREFIX2) {
  T_PREFIX2["COMMENT"] = "t1_";
  T_PREFIX2["ACCOUNT"] = "t2_";
  T_PREFIX2["LINK"] = "t3_";
  T_PREFIX2["MESSAGE"] = "t4_";
  T_PREFIX2["SUBREDDIT"] = "t5_";
  T_PREFIX2["AWARD"] = "t6_";
})(T_PREFIX || (T_PREFIX = {}));

// node_modules/@devvit/shared-types/web-view-scripts-constants.js
var devvitScriptFileName = "devvit.v1.min.js";
var devvitScriptUrl = `https://webview.devvit.net/scripts/${devvitScriptFileName}`;

// node_modules/jwt-decode/build/esm/index.js
var InvalidTokenError = class extends Error {
};
InvalidTokenError.prototype.name = "InvalidTokenError";

// node_modules/@devvit/protos/json/devvit/ui/form_builder/v1alpha/type.js
var FormFieldType2;
(function(FormFieldType3) {
  FormFieldType3[FormFieldType3["STRING"] = 0] = "STRING";
  FormFieldType3[FormFieldType3["PARAGRAPH"] = 1] = "PARAGRAPH";
  FormFieldType3[FormFieldType3["NUMBER"] = 2] = "NUMBER";
  FormFieldType3[FormFieldType3["BOOLEAN"] = 3] = "BOOLEAN";
  FormFieldType3[FormFieldType3["LIST"] = 4] = "LIST";
  FormFieldType3[FormFieldType3["SELECTION"] = 5] = "SELECTION";
  FormFieldType3[FormFieldType3["GROUP"] = 6] = "GROUP";
  FormFieldType3[FormFieldType3["IMAGE"] = 7] = "IMAGE";
  FormFieldType3[FormFieldType3["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(FormFieldType2 || (FormFieldType2 = {}));

// node_modules/@devvit/protos/json/devvit/events/v1alpha/events.js
var EventSource;
(function(EventSource2) {
  EventSource2[EventSource2["UNKNOWN_EVENT_SOURCE"] = 0] = "UNKNOWN_EVENT_SOURCE";
  EventSource2[EventSource2["USER"] = 1] = "USER";
  EventSource2[EventSource2["ADMIN"] = 2] = "ADMIN";
  EventSource2[EventSource2["MODERATOR"] = 3] = "MODERATOR";
  EventSource2[EventSource2["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(EventSource || (EventSource = {}));
var DeletionReason;
(function(DeletionReason2) {
  DeletionReason2[DeletionReason2["UNSPECIFIED_DELETION_REASON"] = 0] = "UNSPECIFIED_DELETION_REASON";
  DeletionReason2[DeletionReason2["SPAM"] = 1] = "SPAM";
  DeletionReason2[DeletionReason2["LEGAL"] = 2] = "LEGAL";
  DeletionReason2[DeletionReason2["OTHER"] = 3] = "OTHER";
  DeletionReason2[DeletionReason2["UNKNOWN"] = 4] = "UNKNOWN";
  DeletionReason2[DeletionReason2["EXPLICIT_CONTENT"] = 5] = "EXPLICIT_CONTENT";
  DeletionReason2[DeletionReason2["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(DeletionReason || (DeletionReason = {}));

// node_modules/@devvit/protos/json/devvit/reddit/v2alpha/postv2.js
var CrowdControlLevel;
(function(CrowdControlLevel2) {
  CrowdControlLevel2[CrowdControlLevel2["OFF"] = 0] = "OFF";
  CrowdControlLevel2[CrowdControlLevel2["LENIENT"] = 1] = "LENIENT";
  CrowdControlLevel2[CrowdControlLevel2["MEDIUM"] = 2] = "MEDIUM";
  CrowdControlLevel2[CrowdControlLevel2["STRICT"] = 3] = "STRICT";
  CrowdControlLevel2[CrowdControlLevel2["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(CrowdControlLevel || (CrowdControlLevel = {}));
var DistinguishType;
(function(DistinguishType2) {
  DistinguishType2[DistinguishType2["NULL_VALUE"] = 0] = "NULL_VALUE";
  DistinguishType2[DistinguishType2["ADMIN"] = 1] = "ADMIN";
  DistinguishType2[DistinguishType2["GOLD"] = 2] = "GOLD";
  DistinguishType2[DistinguishType2["GOLD_AUTO"] = 3] = "GOLD_AUTO";
  DistinguishType2[DistinguishType2["YES"] = 4] = "YES";
  DistinguishType2[DistinguishType2["SPECIAL"] = 5] = "SPECIAL";
  DistinguishType2[DistinguishType2["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(DistinguishType || (DistinguishType = {}));

// node_modules/@devvit/protos/json/devvit/reddit/v2alpha/subredditv2.js
var SubredditType;
(function(SubredditType2) {
  SubredditType2[SubredditType2["ARCHIVED"] = 0] = "ARCHIVED";
  SubredditType2[SubredditType2["EMPLOYEES_ONLY"] = 1] = "EMPLOYEES_ONLY";
  SubredditType2[SubredditType2["GOLD_ONLY"] = 2] = "GOLD_ONLY";
  SubredditType2[SubredditType2["GOLD_RESTRICTED"] = 3] = "GOLD_RESTRICTED";
  SubredditType2[SubredditType2["PRIVATE"] = 4] = "PRIVATE";
  SubredditType2[SubredditType2["PUBLIC"] = 5] = "PUBLIC";
  SubredditType2[SubredditType2["RESTRICTED"] = 6] = "RESTRICTED";
  SubredditType2[SubredditType2["USER"] = 7] = "USER";
  SubredditType2[SubredditType2["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(SubredditType || (SubredditType = {}));
var SubredditRating;
(function(SubredditRating2) {
  SubredditRating2[SubredditRating2["UNKNOWN_SUBREDDIT_RATING"] = 0] = "UNKNOWN_SUBREDDIT_RATING";
  SubredditRating2[SubredditRating2["E"] = 1] = "E";
  SubredditRating2[SubredditRating2["M1"] = 2] = "M1";
  SubredditRating2[SubredditRating2["M2"] = 3] = "M2";
  SubredditRating2[SubredditRating2["D"] = 4] = "D";
  SubredditRating2[SubredditRating2["V"] = 5] = "V";
  SubredditRating2[SubredditRating2["X"] = 6] = "X";
  SubredditRating2[SubredditRating2["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(SubredditRating || (SubredditRating = {}));
var SubredditTypeV2;
(function(SubredditTypeV22) {
  SubredditTypeV22[SubredditTypeV22["SUBREDDIT_TYPE_UNSPECIFIED"] = 0] = "SUBREDDIT_TYPE_UNSPECIFIED";
  SubredditTypeV22[SubredditTypeV22["SUBREDDIT_TYPE_UNKNOWN"] = 1] = "SUBREDDIT_TYPE_UNKNOWN";
  SubredditTypeV22[SubredditTypeV22["SUBREDDIT_TYPE_ARCHIVED"] = 2] = "SUBREDDIT_TYPE_ARCHIVED";
  SubredditTypeV22[SubredditTypeV22["SUBREDDIT_TYPE_EMPLOYEES_ONLY"] = 3] = "SUBREDDIT_TYPE_EMPLOYEES_ONLY";
  SubredditTypeV22[SubredditTypeV22["SUBREDDIT_TYPE_GOLD_ONLY"] = 4] = "SUBREDDIT_TYPE_GOLD_ONLY";
  SubredditTypeV22[SubredditTypeV22["SUBREDDIT_TYPE_GOLD_RESTRICTED"] = 5] = "SUBREDDIT_TYPE_GOLD_RESTRICTED";
  SubredditTypeV22[SubredditTypeV22["SUBREDDIT_TYPE_PRIVATE"] = 6] = "SUBREDDIT_TYPE_PRIVATE";
  SubredditTypeV22[SubredditTypeV22["SUBREDDIT_TYPE_PUBLIC"] = 7] = "SUBREDDIT_TYPE_PUBLIC";
  SubredditTypeV22[SubredditTypeV22["SUBREDDIT_TYPE_RESTRICTED"] = 8] = "SUBREDDIT_TYPE_RESTRICTED";
  SubredditTypeV22[SubredditTypeV22["SUBREDDIT_TYPE_USER"] = 9] = "SUBREDDIT_TYPE_USER";
  SubredditTypeV22[SubredditTypeV22["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(SubredditTypeV2 || (SubredditTypeV2 = {}));
var SubredditRatingV2;
(function(SubredditRatingV22) {
  SubredditRatingV22[SubredditRatingV22["SUBREDDIT_RATING_UNSPECIFIED"] = 0] = "SUBREDDIT_RATING_UNSPECIFIED";
  SubredditRatingV22[SubredditRatingV22["SUBREDDIT_RATING_UNKNOWN"] = 1] = "SUBREDDIT_RATING_UNKNOWN";
  SubredditRatingV22[SubredditRatingV22["SUBREDDIT_RATING_E"] = 2] = "SUBREDDIT_RATING_E";
  SubredditRatingV22[SubredditRatingV22["SUBREDDIT_RATING_M1"] = 3] = "SUBREDDIT_RATING_M1";
  SubredditRatingV22[SubredditRatingV22["SUBREDDIT_RATING_M2"] = 4] = "SUBREDDIT_RATING_M2";
  SubredditRatingV22[SubredditRatingV22["SUBREDDIT_RATING_D"] = 5] = "SUBREDDIT_RATING_D";
  SubredditRatingV22[SubredditRatingV22["SUBREDDIT_RATING_V"] = 6] = "SUBREDDIT_RATING_V";
  SubredditRatingV22[SubredditRatingV22["SUBREDDIT_RATING_X"] = 7] = "SUBREDDIT_RATING_X";
  SubredditRatingV22[SubredditRatingV22["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(SubredditRatingV2 || (SubredditRatingV2 = {}));

// node_modules/@devvit/shared-types/shared/form.js
var SettingScope;
(function(SettingScope2) {
  SettingScope2["Installation"] = "installation";
  SettingScope2["App"] = "app";
})(SettingScope || (SettingScope = {}));

// node_modules/@devvit/client/index.js
initWebViewMode();

// node_modules/@devvit/protos/json/devvit/ui/effect_types/v1alpha/create_order.js
var OrderResultStatus2;
(function(OrderResultStatus3) {
  OrderResultStatus3[OrderResultStatus3["STATUS_CANCELLED"] = 0] = "STATUS_CANCELLED";
  OrderResultStatus3[OrderResultStatus3["STATUS_SUCCESS"] = 1] = "STATUS_SUCCESS";
  OrderResultStatus3[OrderResultStatus3["STATUS_ERROR"] = 2] = "STATUS_ERROR";
  OrderResultStatus3[OrderResultStatus3["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(OrderResultStatus2 || (OrderResultStatus2 = {}));

// node_modules/@devvit/protos/json/devvit/ui/effects/v1alpha/realtime_subscriptions.js
var RealtimeSubscriptionStatus2;
(function(RealtimeSubscriptionStatus3) {
  RealtimeSubscriptionStatus3[RealtimeSubscriptionStatus3["REALTIME_SUBSCRIBED"] = 0] = "REALTIME_SUBSCRIBED";
  RealtimeSubscriptionStatus3[RealtimeSubscriptionStatus3["REALTIME_UNSUBSCRIBED"] = 1] = "REALTIME_UNSUBSCRIBED";
  RealtimeSubscriptionStatus3[RealtimeSubscriptionStatus3["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(RealtimeSubscriptionStatus2 || (RealtimeSubscriptionStatus2 = {}));

// src/client/splash.ts
var FINAL_STATES = [
  "Final",
  "Game Over",
  "Final: Tied",
  "Completed Early",
  "Completed Early: Rain",
  "Completed Early: Mercy",
  "Cancelled",
  "Cancelled: Rain"
];
var PRE_GAME_STATES = ["Pre-Game", "Scheduled", "Warmup"];
var isFinalState = (s) => FINAL_STATES.includes(s);
var isPreGameState = (s) => PRE_GAME_STATES.includes(s);
var isSuspendedState = (s) => s.startsWith("Suspended");
var isLiveState = (s) => !isFinalState(s) && !isPreGameState(s) && !["Postponed", "Suspended", "Suspended: Rain", "Cancelled", "Cancelled: Rain", "Delayed"].includes(s);
var isTerminalState = (s) => isFinalState(s) || s === "Postponed";
var MLB_TEAM_IDS = /* @__PURE__ */ new Set([
  108,
  109,
  110,
  111,
  112,
  113,
  114,
  115,
  116,
  117,
  118,
  119,
  120,
  121,
  133,
  134,
  135,
  136,
  137,
  138,
  139,
  140,
  141,
  142,
  143,
  144,
  145,
  146,
  147,
  158
]);
var PITCH_MAP = {
  FF: { label: "4-Seam", abbr: "FF", color: "#e63946" },
  FA: { label: "4-Seam", abbr: "FF", color: "#e63946" },
  FT: { label: "2-Seam", abbr: "FT", color: "#c1121f" },
  SI: { label: "Sinker", abbr: "SI", color: "#c1121f" },
  FC: { label: "Cutter", abbr: "FC", color: "#f4a261" },
  SL: { label: "Slider", abbr: "SL", color: "#2a9d8f" },
  ST: { label: "Sweeper", abbr: "ST", color: "#fb8500" },
  SV: { label: "Slurve", abbr: "SV", color: "#3a86ff" },
  CU: { label: "Curve", abbr: "CU", color: "#457b9d" },
  KC: { label: "Knuck-Cur", abbr: "KC", color: "#457b9d" },
  CS: { label: "Slow Cur", abbr: "CS", color: "#457b9d" },
  CH: { label: "Change", abbr: "CH", color: "#8338ec" },
  FS: { label: "Splitter", abbr: "FS", color: "#06d6a0" },
  FO: { label: "Forkball", abbr: "FO", color: "#06d6a0" },
  KN: { label: "Knuckle", abbr: "KN", color: "#adb5bd" },
  EP: { label: "Eephus", abbr: "EP", color: "#adb5bd" },
  PO: { label: "Pitchout", abbr: "PO", color: "#6c757d" },
  IN: { label: "Int. Ball", abbr: "IN", color: "#6c757d" }
};
function pitchInfo(code) {
  return PITCH_MAP[code || ""] || { label: code || "?", abbr: code || "?", color: "#94a3b8" };
}
var ZONE_W = 120;
var ZONE_H = 155;
var SZ_LEFT = 22;
var SZ_RIGHT = 98;
var SZ_TOP = 24;
var SZ_BOT = 108;
var SZ_CX = (SZ_LEFT + SZ_RIGHT) / 2;
var PX_PER_FT = (SZ_RIGHT - SZ_LEFT) / 1.7;
var PZ_TOP_FT = 3.5;
var PZ_BOT_FT = 1.5;
var DZ_LEFT = SZ_LEFT + 6;
var DZ_RIGHT = SZ_RIGHT - 6;
var DZ_TOP = SZ_TOP + 5;
var DZ_BOT = SZ_BOT - 12;
function mapPx(pX) {
  return SZ_CX + pX * PX_PER_FT;
}
function mapPz(pZ) {
  return SZ_BOT - (pZ - PZ_BOT_FT) / (PZ_TOP_FT - PZ_BOT_FT) * (SZ_BOT - SZ_TOP);
}
function svgInk() {
  const light = document.documentElement.getAttribute("data-theme") === "light";
  return light ? {
    empty: "rgba(10,24,40,0.10)",
    faint: "rgba(10,24,40,0.32)",
    mid: "rgba(10,24,40,0.30)",
    strong: "rgba(10,24,40,0.62)",
    label: "rgba(10,24,40,0.50)",
    grid: "rgba(10,24,40,0.10)",
    chartBg: "rgba(10,24,40,0.05)",
    dotFill: "#0a1828",
    dotRing: "rgba(10,24,40,0.6)"
  } : {
    empty: "rgba(255,255,255,0.08)",
    faint: "rgba(255,255,255,0.35)",
    mid: "rgba(255,255,255,0.30)",
    strong: "rgba(255,255,255,0.55)",
    label: "rgba(255,255,255,0.45)",
    grid: "rgba(255,255,255,0.08)",
    chartBg: "rgba(255,255,255,0.04)",
    dotFill: "#fff",
    dotRing: "rgba(255,255,255,0.6)"
  };
}
function buildStrikeZoneSVG(pitches) {
  const ink = svgInk();
  const dW = DZ_RIGHT - DZ_LEFT, dH = DZ_BOT - DZ_TOP;
  const d3 = dW / 3, d3h = dH / 3;
  const dots = pitches.map((p, i) => {
    const px = p.pitchData?.coordinates?.pX;
    const pz = p.pitchData?.coordinates?.pZ;
    if (px == null || pz == null) return "";
    const cx = mapPx(px), cy = mapPz(pz);
    const info = pitchInfo(p.details?.type?.code);
    const isLast = i === pitches.length - 1;
    return `<circle cx="${cx}" cy="${cy}" r="${isLast ? 7 : 5}"
      fill="${info.color}" stroke="${isLast ? "#fff" : ink.faint}"
      stroke-width="${isLast ? 2 : 1}" opacity="${isLast ? 1 : 0.65}"/>
      <text x="${cx}" y="${cy + 0.5}" text-anchor="middle" dominant-baseline="middle"
      font-size="${isLast ? 7 : 6}" font-weight="700" fill="white"
      font-family="monospace" pointer-events="none">${i + 1}</text>`;
  }).join("");
  return `<svg viewBox="0 0 ${ZONE_W} ${ZONE_H}" xmlns="http://www.w3.org/2000/svg" style="overflow:visible;">
    <rect x="${DZ_LEFT}" y="${DZ_TOP}" width="${dW}" height="${dH}"
      fill="rgba(191,13,61,0.04)" stroke="rgba(191,13,61,0.75)" stroke-width="1.5" rx="1"/>
    <line x1="${DZ_LEFT + d3}" y1="${DZ_TOP}" x2="${DZ_LEFT + d3}" y2="${DZ_BOT}"
      stroke="rgba(191,13,61,0.22)" stroke-width="0.8" stroke-dasharray="3,2"/>
    <line x1="${DZ_LEFT + d3 * 2}" y1="${DZ_TOP}" x2="${DZ_LEFT + d3 * 2}" y2="${DZ_BOT}"
      stroke="rgba(191,13,61,0.22)" stroke-width="0.8" stroke-dasharray="3,2"/>
    <line x1="${DZ_LEFT}" y1="${DZ_TOP + d3h}" x2="${DZ_RIGHT}" y2="${DZ_TOP + d3h}"
      stroke="rgba(191,13,61,0.22)" stroke-width="0.8" stroke-dasharray="3,2"/>
    <line x1="${DZ_LEFT}" y1="${DZ_TOP + d3h * 2}" x2="${DZ_RIGHT}" y2="${DZ_TOP + d3h * 2}"
      stroke="rgba(191,13,61,0.22)" stroke-width="0.8" stroke-dasharray="3,2"/>
    <polygon points="${DZ_LEFT},${DZ_BOT + 5} ${DZ_RIGHT},${DZ_BOT + 5} ${DZ_RIGHT},${DZ_BOT + 12} ${SZ_CX},${DZ_BOT + 20} ${DZ_LEFT},${DZ_BOT + 12}"
      fill="${ink.strong}" stroke="${ink.mid}" stroke-width="1"/>
    ${dots}
  </svg>`;
}
function buildBasesSVG(outs, onBase) {
  const ink = svgInk();
  const outFill = (n) => outs >= n ? "#bf0d3d" : ink.empty;
  const baseFill = (b) => b ? "#bf0d3d" : ink.empty;
  return `<svg width="60" height="60" viewBox="0 0 58 79" xmlns="http://www.w3.org/2000/svg">
    <circle cx="13" cy="61" r="6" fill="${outFill(1)}" stroke="#bf0d3d" stroke-width="1.5"/>
    <circle cx="30" cy="61" r="6" fill="${outFill(2)}" stroke="#bf0d3d" stroke-width="1.5"/>
    <circle cx="47" cy="61" r="6" fill="${outFill(3)}" stroke="#bf0d3d" stroke-width="1.5"/>
    <rect x="17.6" y="29.7" width="14" height="14" transform="rotate(45 17.6 29.7)"
      fill="${baseFill(onBase?.third)}" stroke="#bf0d3d" stroke-width="1.5"/>
    <rect x="29.4" y="17.7" width="14" height="14" transform="rotate(45 29.4 17.7)"
      fill="${baseFill(onBase?.second)}" stroke="#bf0d3d" stroke-width="1.5"/>
    <rect x="41.6" y="29.7" width="14" height="14" transform="rotate(45 41.6 29.7)"
      fill="${baseFill(onBase?.first)}" stroke="#bf0d3d" stroke-width="1.5"/>
  </svg>`;
}
function getBatterSeasonStats(teamBox, batterId) {
  if (!teamBox || !batterId) return "\u2014";
  const stats = teamBox.players?.[`ID${batterId}`]?.seasonStats?.batting;
  if (!stats) return "\u2014";
  const avg = stats.avg || "---";
  const hr = stats.homeRuns ?? 0;
  const rbi = stats.rbi ?? 0;
  return `${avg} \xB7 ${hr} HR \xB7 ${rbi} RBI`;
}
function getPitcherInGameLine(teamBox, pitcherId) {
  if (!teamBox || !pitcherId) return "\u2014";
  const player = teamBox.players?.[`ID${pitcherId}`];
  const game = player?.stats?.pitching;
  const season = player?.seasonStats?.pitching;
  if (!game && !season) return "\u2014";
  const ip = game?.inningsPitched ?? "0.0";
  const k = game?.strikeOuts ?? 0;
  const era = season?.era ?? "\u2014";
  return `${ip} IP \xB7 ${k} K \xB7 ${era} ERA`;
}
function getPitcherSeasonStats(teamBox, pitcherId) {
  if (!teamBox || !pitcherId) return "\u2014";
  const player = teamBox.players?.[`ID${pitcherId}`];
  const stats = player?.seasonStats?.pitching;
  if (!stats) return "\u2014";
  const w = stats.wins ?? 0;
  const l = stats.losses ?? 0;
  const era = stats.era ?? "\u2014";
  const k = stats.strikeOuts ?? 0;
  return `${w}-${l}  \xB7  ${era} ERA  \xB7  ${k} K`;
}
function abbreviateSeriesDesc(desc) {
  if (!desc) return "Postseason";
  if (/world series/i.test(desc)) return "World Series";
  if (/american league championship/i.test(desc)) return "ALCS";
  if (/national league championship/i.test(desc)) return "NLCS";
  if (/american league division/i.test(desc)) return "ALDS";
  if (/national league division/i.test(desc)) return "NLDS";
  if (/american league wild card/i.test(desc)) return "AL Wild Card";
  if (/national league wild card/i.test(desc)) return "NL Wild Card";
  if (/wild card/i.test(desc)) return "Wild Card";
  return desc;
}
function getGameContextLabel(gameDataObj) {
  const gameInfo = gameDataObj?.game || {};
  const gameType = gameInfo.type || gameInfo.gameType || "R";
  const parts = [];
  if (["F", "D", "L", "W"].includes(gameType)) {
    const seriesPrefix = abbreviateSeriesDesc(gameInfo.seriesDescription || "");
    const gameNum = gameInfo.seriesGameNumber;
    parts.push(gameNum ? `${seriesPrefix} Game ${gameNum}` : seriesPrefix);
  } else if (gameType === "S") {
    parts.push("Spring Training");
  } else if (gameType === "A") {
    parts.push("All-Star Game");
  } else if (gameType === "E") {
    parts.push("Exhibition");
  }
  const dh = gameInfo.doubleHeader || "N";
  const dhNum = gameInfo.gameNumber;
  if (dh !== "N" && dhNum) {
    parts.push(`Game ${dhNum} of 2`);
  }
  return parts.join(" \xB7 ").toUpperCase();
}
var gamePk = null;
var pollInterval = null;
var lastGameData = null;
var postgameNotificationFired = false;
var postType = null;
var gameIsTerminal = false;
function reportError(label, e) {
  console.error(`[${label}]`, e);
  let overlay = document.getElementById("error-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "error-overlay";
    overlay.style.cssText = "position:fixed;top:0;left:0;right:0;background:rgba(180,0,0,0.95);color:#fff;padding:8px 12px;font-family:monospace;font-size:10px;z-index:99999;max-height:40vh;overflow-y:auto;border-bottom:2px solid #fff;line-height:1.4;white-space:pre-wrap;word-break:break-word;";
    overlay.onclick = () => overlay.remove();
    document.body.appendChild(overlay);
  }
  const msg = e instanceof Error ? `${e.message}
${e.stack || ""}` : String(e);
  const line = document.createElement("div");
  line.style.cssText = "padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.2);";
  line.textContent = `[${label}] ${msg}`;
  overlay.appendChild(line);
}
window.addEventListener("error", (e) => reportError("window.error", e.error || e.message));
window.addEventListener("unhandledrejection", (e) => reportError("unhandled promise", e.reason));
var $ = (id) => document.getElementById(id);
function baseLogoPath(teamId) {
  return `/teams/${teamId}.svg`;
}
function getLogoPath(teamId) {
  const light = document.documentElement.getAttribute("data-theme") === "light";
  if (light) return `/teams/${teamId}.svg`;
  return MLB_TEAM_IDS.has(teamId) ? `/teams/dark/${teamId}.svg` : `/teams/${teamId}.svg`;
}
var logoFallbackAttr = (teamId) => `this.onerror=null;this.src='${baseLogoPath(teamId)}'`;
function loadLogo(imgEl, teamId) {
  imgEl.onerror = () => {
    imgEl.onerror = null;
    imgEl.src = baseLogoPath(teamId);
  };
  imgEl.src = getLogoPath(teamId);
}
function formatGameTime(gameDate) {
  const d = new Date(gameDate);
  const h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
}
function getTeamShortName(team) {
  if (!team) return "";
  if (team.teamName) return team.teamName;
  if (team.clubName) return team.clubName;
  const name = team.name || "";
  if (name.includes("Red Sox")) return "Red Sox";
  if (name.includes("White Sox")) return "White Sox";
  if (name.includes("Blue Jays")) return "Blue Jays";
  const parts = name.split(" ");
  return parts[parts.length - 1] || team.abbreviation || "";
}
function formatPitcherName(fullName) {
  const safe = (fullName || "").trim();
  if (!safe) return "TBD";
  const parts = safe.split(/\s+/);
  if (parts.length === 1) {
    return safe;
  }
  const last = parts.pop();
  const rest = parts.join(" ");
  return `${rest}<br>${last}`;
}
function hideAllStatePanes() {
  ["pregame-content", "live-content", "final-content", "postponed-content", "suspended-content"].forEach((id) => {
    const el = $(id);
    if (el) el.style.display = "none";
  });
}
var EXPAND_ICON = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>';
function isExpandedMode() {
  try {
    return getWebViewMode() === "expanded";
  } catch {
    return false;
  }
}
function setupExpand() {
  if (document.getElementById("expand-btn")) return;
  const host = $("scorebug-content") || document.body;
  const btn = document.createElement("button");
  btn.id = "expand-btn";
  btn.type = "button";
  btn.setAttribute("aria-label", "Open full screen");
  btn.innerHTML = EXPAND_ICON;
  btn.style.cssText = "position:absolute;top:10px;right:12px;z-index:40;width:32px;height:32px;display:flex;align-items:center;justify-content:center;padding:0;background:var(--bg-elev-2);color:var(--text-primary);border:1px solid var(--border-medium);border-radius:6px;cursor:pointer;-webkit-tap-highlight-color:transparent;backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);";
  let modePoll = 0;
  const sync = () => {
    const expanded = isExpandedMode();
    btn.style.display = expanded ? "none" : "flex";
    if (expanded && !modePoll) {
      modePoll = window.setInterval(sync, 400);
    } else if (!expanded && modePoll) {
      window.clearInterval(modePoll);
      modePoll = 0;
    }
  };
  sync();
  window.addEventListener("resize", sync);
  document.addEventListener("visibilitychange", sync);
  btn.addEventListener("click", (event) => {
    if (isExpandedMode()) {
      sync();
      return;
    }
    try {
      requestExpandedMode(event, "default");
    } catch (e) {
      reportError("requestExpandedMode", e);
    }
    sync();
  });
  host.appendChild(btn);
}
var SUN_ICON = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
var MOON_ICON = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
var THEME_KEY = "mlb-scores-theme";
function applyTheme(theme) {
  if (theme === "light") document.documentElement.setAttribute("data-theme", "light");
  else document.documentElement.removeAttribute("data-theme");
}
function systemTheme() {
  try {
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  } catch {
    return "dark";
  }
}
function savedTheme() {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return v === "light" || v === "dark" ? v : null;
  } catch {
    return null;
  }
}
function resolveTheme() {
  return savedTheme() ?? systemTheme();
}
function setupThemeToggle() {
  if (document.getElementById("theme-btn")) return;
  const host = $("scorebug-content") || document.body;
  let theme = resolveTheme();
  applyTheme(theme);
  const btn = document.createElement("button");
  btn.id = "theme-btn";
  btn.type = "button";
  btn.style.cssText = "position:absolute;top:10px;left:12px;z-index:40;width:32px;height:32px;display:flex;align-items:center;justify-content:center;padding:0;background:var(--bg-elev-2);color:var(--text-primary);border:1px solid var(--border-medium);border-radius:6px;cursor:pointer;-webkit-tap-highlight-color:transparent;backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);";
  const paint = () => {
    btn.innerHTML = theme === "light" ? MOON_ICON : SUN_ICON;
    btn.setAttribute("aria-label", theme === "light" ? "Switch to dark mode" : "Switch to light mode");
  };
  paint();
  btn.addEventListener("click", () => {
    theme = theme === "light" ? "dark" : "light";
    applyTheme(theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
    }
    paint();
    try {
      if (lastGameData) render(lastGameData);
    } catch (e) {
      reportError("theme re-render", e);
    }
  });
  try {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onSchemeChange = (e) => {
      try {
        localStorage.removeItem(THEME_KEY);
      } catch {
      }
      theme = e.matches ? "dark" : "light";
      applyTheme(theme);
      paint();
      try {
        if (lastGameData) render(lastGameData);
      } catch (err) {
        reportError("scheme re-render", err);
      }
    };
    if (mq.addEventListener) mq.addEventListener("change", onSchemeChange);
    else if (mq.addListener) mq.addListener(onSchemeChange);
  } catch {
  }
  host.appendChild(btn);
}
function renderPregameContent(data, awayTeam, homeTeam) {
  const teamsBox = data.liveData?.boxscore?.teams || {};
  const probables = data.gameData?.probablePitchers || {};
  const awayPid = probables.away?.id;
  const homePid = probables.home?.id;
  const awayLabel = $("pregame-away-pitcher-label");
  const homeLabel = $("pregame-home-pitcher-label");
  if (awayLabel) awayLabel.textContent = `${getTeamShortName(awayTeam).toUpperCase()} STARTER`;
  if (homeLabel) homeLabel.textContent = `${getTeamShortName(homeTeam).toUpperCase()} STARTER`;
  $("pregame-away-pitcher-name").innerHTML = formatPitcherName(probables.away?.fullName || "TBD");
  $("pregame-home-pitcher-name").innerHTML = formatPitcherName(probables.home?.fullName || "TBD");
  $("pregame-away-pitcher-stats").textContent = getPitcherSeasonStats(teamsBox.away, awayPid);
  $("pregame-home-pitcher-stats").textContent = getPitcherSeasonStats(teamsBox.home, homePid);
  const dt = new Date(data.gameData.datetime?.dateTime || Date.now());
  const dateStr = dt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }).toUpperCase();
  const timeStr = formatGameTime(data.gameData.datetime?.dateTime || dt.toISOString());
  $("pregame-first-pitch").textContent = `${dateStr}  \xB7  ${timeStr}`;
}
function renderLiveContent(data) {
  const linescore = data.liveData?.linescore;
  const currentPlay = data.liveData?.plays?.currentPlay;
  if (!linescore || !currentPlay) return;
  const teamsBox = data.liveData.boxscore?.teams || {};
  const matchup = currentPlay.matchup || {};
  const batter = matchup.batter;
  const pitcher = matchup.pitcher;
  const count = currentPlay.count || { balls: 0, strikes: 0, outs: 0 };
  const awayBatting = linescore.inningHalf === "Top";
  const awaySlotPlayer = awayBatting ? batter : pitcher;
  const homeSlotPlayer = awayBatting ? pitcher : batter;
  const awaySlotIsBatter = awayBatting;
  const homeSlotIsBatter = !awayBatting;
  const awaySlotEl = $("live-player-away");
  const homeSlotEl = $("live-player-home");
  if (awaySlotEl) {
    awaySlotEl.classList.toggle("is-batter", awaySlotIsBatter);
    awaySlotEl.classList.toggle("is-pitcher", !awaySlotIsBatter);
  }
  if (homeSlotEl) {
    homeSlotEl.classList.toggle("is-batter", homeSlotIsBatter);
    homeSlotEl.classList.toggle("is-pitcher", !homeSlotIsBatter);
  }
  const awayTeamId = data.gameData?.teams?.away?.id;
  const homeTeamId = data.gameData?.teams?.home?.id;
  const getPlayerPos = (teamBox, playerId) => {
    if (!teamBox || !playerId) return "";
    return teamBox.players?.[`ID${playerId}`]?.position?.abbreviation || "";
  };
  $("live-away-role").textContent = awaySlotIsBatter ? "BATTER" : "PITCHER";
  $("live-away-pos").textContent = awaySlotIsBatter ? getPlayerPos(teamsBox.away, awaySlotPlayer?.id) : "";
  $("live-away-name").textContent = awaySlotPlayer?.fullName || "\u2014";
  $("live-away-stats").textContent = awaySlotIsBatter ? getBatterSeasonStats(teamsBox.away, awaySlotPlayer?.id) : getPitcherInGameLine(teamsBox.away, awaySlotPlayer?.id);
  const awayLogoEl = $("live-away-team-logo");
  if (awayLogoEl && awayTeamId) loadLogo(awayLogoEl, awayTeamId);
  $("live-home-role").textContent = homeSlotIsBatter ? "BATTER" : "PITCHER";
  $("live-home-pos").textContent = homeSlotIsBatter ? getPlayerPos(teamsBox.home, homeSlotPlayer?.id) : "";
  $("live-home-name").textContent = homeSlotPlayer?.fullName || "\u2014";
  $("live-home-stats").textContent = homeSlotIsBatter ? getBatterSeasonStats(teamsBox.home, homeSlotPlayer?.id) : getPitcherInGameLine(teamsBox.home, homeSlotPlayer?.id);
  const homeLogoEl = $("live-home-team-logo");
  if (homeLogoEl && homeTeamId) loadLogo(homeLogoEl, homeTeamId);
  const onBase = linescore.offense || {};
  $("live-bases").innerHTML = buildBasesSVG(count.outs ?? 0, onBase);
  $("live-count").textContent = `${count.balls ?? 0}\u2013${count.strikes ?? 0}`;
  const pitches = (currentPlay.playEvents || []).filter((e) => e.isPitch);
  $("live-zone-container").innerHTML = buildStrikeZoneSVG(pitches);
  const lastPitch = pitches[pitches.length - 1];
  const pitchEl = $("live-pitch-latest");
  if (lastPitch) {
    const info = pitchInfo(lastPitch.details?.type?.code);
    const velo = lastPitch.pitchData?.startSpeed?.toFixed(1) ?? "\u2014";
    const isInPlay = lastPitch.details?.isInPlay;
    const isStrike = lastPitch.details?.isStrike;
    const isFoul = (lastPitch.details?.description || "").toLowerCase().includes("foul");
    let resCls = "live-pr-ball";
    let resLbl = "BALL";
    if (isInPlay) {
      resCls = "live-pr-contact";
      resLbl = "IN PLAY";
    } else if (isFoul) {
      resCls = "live-pr-foul";
      resLbl = "FOUL";
    } else if (isStrike) {
      resCls = "live-pr-strike";
      resLbl = "STR";
    }
    pitchEl.innerHTML = `
      <span class="live-pitch-num">PITCH ${pitches.length}</span>
      <span class="live-pitch-badge" style="background:${info.color}">${info.abbr}</span>
      <span class="live-pitch-type">${info.label}</span>
      <span class="live-pitch-velo">${velo} mph</span>
      <span class="live-pitch-result ${resCls}">${resLbl}</span>
    `;
  } else {
    pitchEl.innerHTML = '<span style="font-family:var(--font-mono);font-size:10px;color:var(--text-muted);">Waiting for first pitch\u2026</span>';
  }
  const resultEvent = currentPlay.result?.event || "";
  const resultDesc = currentPlay.result?.description || "";
  const resultEl = $("live-result");
  if (resultEvent || resultDesc) {
    resultEl.innerHTML = `
      ${resultEvent ? `<div class="live-event">${resultEvent}</div>` : ""}
      ${resultDesc ? `<div class="live-desc">${resultDesc}</div>` : ""}
    `;
  } else {
    resultEl.innerHTML = "";
  }
}
function shortName(name) {
  if (!name) return "";
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0] ?? "";
  const SUFFIX = ["Jr.", "Jr", "Sr.", "Sr", "II", "III", "IV", "V"];
  const lastPart = parts[parts.length - 1] ?? "";
  const useSecondToLast = SUFFIX.includes(lastPart) && parts.length > 2;
  const surname = useSecondToLast ? parts[parts.length - 2] ?? "" : lastPart;
  const firstInitial = parts[0]?.[0] ?? "";
  return `${firstInitial}. ${surname}`;
}
function fmtAvg(v) {
  if (!v || v === ".000" || v === "0.000") return ".000";
  const f = parseFloat(v);
  if (isNaN(f)) return ".000";
  return f < 1 ? "." + String(Math.round(f * 1e3)).padStart(3, "0") : String(v);
}
function buildBattingRow(player, displayNum, s) {
  const g = player.stats?.batting || {};
  const name = shortName(player.person?.fullName || "Unknown");
  const pos = player.position?.abbreviation || "";
  const ab = g.atBats ?? 0;
  const h = g.hits ?? 0;
  const r = g.runs ?? 0;
  const rbi = g.rbi ?? 0;
  const hr = g.homeRuns ?? 0;
  const bb = g.baseOnBalls ?? 0;
  const so = g.strikeOuts ?? 0;
  const avg = fmtAvg(s?.avg);
  return `<tr class="bs-row">
    <td class="bs-num">${displayNum}</td>
    <td class="bs-pos-cell"><span class="bs-pos">${pos}</span></td>
    <td class="bs-player"><div class="bs-pname">${name}</div></td>
    <td>${ab}</td>
    <td class="${h > 0 ? "bs-hit" : ""}">${h}</td>
    <td>${r}</td>
    <td>${rbi}</td>
    <td class="${hr > 0 ? "bs-hr" : ""}">${hr}</td>
    <td>${bb}</td>
    <td>${so}</td>
    <td class="bs-avg">${avg}</td>
  </tr>`;
}
function buildPitchingRow(player, s) {
  const g = player.stats?.pitching || {};
  const name = shortName(player.person?.fullName || "Unknown");
  const ip = g.inningsPitched ?? "0.0";
  const h = g.hits ?? 0;
  const r = g.runs ?? 0;
  const er = g.earnedRuns ?? 0;
  const bb = g.baseOnBalls ?? 0;
  const so = g.strikeOuts ?? 0;
  const era = s?.era ?? "-.--";
  const erHasRuns = er > 0;
  return `<tr class="bs-row">
    <td class="bs-num"></td>
    <td class="bs-pos-cell"><span class="bs-pos p">P</span></td>
    <td class="bs-player"><div class="bs-pname">${name}</div></td>
    <td>${ip}</td>
    <td>${h}</td>
    <td class="${erHasRuns ? "bs-er" : ""}">${r}</td>
    <td class="${erHasRuns ? "bs-er" : ""}">${er}</td>
    <td>${bb}</td>
    <td>${so}</td>
    <td colspan="2" class="bs-avg">${era}</td>
  </tr>`;
}
function buildBoxPanel(teamStats) {
  if (!teamStats?.players) {
    return '<div class="bs-empty">Lineups not yet available</div>';
  }
  const rawBatters = teamStats.batters || [];
  const pitchers = teamStats.pitchers || [];
  const batters = rawBatters.filter((id) => {
    const pos = teamStats.players?.[`ID${id}`]?.position?.abbreviation;
    return pos && pos !== "P" && pos !== "Pitcher";
  });
  if (!batters.length && !pitchers.length) {
    return '<div class="bs-empty">Lineups not yet available</div>';
  }
  const battingRows = batters.map((id, i) => {
    const player = teamStats.players?.[`ID${id}`];
    if (!player) return "";
    const s = player.seasonStats?.batting;
    return buildBattingRow(player, i + 1, s);
  }).filter(Boolean).join("");
  const pitchingRows = pitchers.map((id) => {
    const player = teamStats.players?.[`ID${id}`];
    if (!player) return "";
    const s = player.seasonStats?.pitching;
    return buildPitchingRow(player, s);
  }).filter(Boolean).join("");
  return `
    <div class="bs-section-hdr"><span class="bs-dot"></span>Batting</div>
    <table class="bs-table bs-table-batting">
      <thead>
        <tr>
          <th class="bs-th-num">#</th>
          <th class="bs-th-pos"></th>
          <th class="bs-th-player">Player</th>
          <th>AB</th><th>H</th><th>R</th><th>RBI</th><th>HR</th><th>BB</th><th>K</th><th>AVG</th>
        </tr>
      </thead>
      <tbody>${battingRows || `<tr><td colspan="11" class="bs-empty">Awaiting first AB</td></tr>`}</tbody>
    </table>
    <div class="bs-section-hdr pitching"><span class="bs-dot"></span>Pitching</div>
    <table class="bs-table bs-table-pitching">
      <thead>
        <tr>
          <th class="bs-th-num"></th>
          <th class="bs-th-pos"></th>
          <th class="bs-th-player">Pitcher</th>
          <th>IP</th><th>H</th><th>R</th><th>ER</th><th>BB</th><th>K</th><th colspan="2">ERA</th>
        </tr>
      </thead>
      <tbody>${pitchingRows || `<tr><td colspan="11" class="bs-empty">No pitching data yet</td></tr>`}</tbody>
    </table>
  `;
}
function renderBoxScore(data) {
  const awayTeam = data.gameData?.teams?.away;
  const homeTeam = data.gameData?.teams?.home;
  const boxscore = data.liveData?.boxscore;
  if (!awayTeam || !homeTeam || !boxscore) return;
  const awayAbbrEl = $("bs-away-tab-abbr");
  const homeAbbrEl = $("bs-home-tab-abbr");
  if (awayAbbrEl) awayAbbrEl.textContent = awayTeam.abbreviation || "?";
  if (homeAbbrEl) homeAbbrEl.textContent = homeTeam.abbreviation || "?";
  const awayLogoEl = $("bs-away-tab-logo");
  const homeLogoEl = $("bs-home-tab-logo");
  if (awayLogoEl && awayTeam.id) loadLogo(awayLogoEl, awayTeam.id);
  if (homeLogoEl && homeTeam.id) loadLogo(homeLogoEl, homeTeam.id);
  const wrap = document.querySelector(".bs-panel-wrap");
  const savedScroll = wrap?.scrollTop ?? 0;
  const awayPanel = $("bs-away-panel");
  const homePanel = $("bs-home-panel");
  if (awayPanel) awayPanel.innerHTML = buildBoxPanel(boxscore.teams?.away);
  if (homePanel) homePanel.innerHTML = buildBoxPanel(boxscore.teams?.home);
  if (wrap) wrap.scrollTop = savedScroll;
}
function setupBoxScoreTeamTabs() {
  document.querySelectorAll(".bs-team-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      const team = btn.dataset.bsTeam;
      if (!team) return;
      document.querySelectorAll(".bs-team-tab").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      document.querySelectorAll(".bs-panel").forEach((p) => p.classList.remove("active"));
      $(`bs-${team}-panel`)?.classList.add("active");
      const wrap = document.querySelector(".bs-panel-wrap");
      if (wrap) wrap.scrollTop = 0;
    });
  });
}
function getEventBadge(eventType) {
  if (!eventType) return "?";
  const exact = {
    "Single": "1B",
    "Double": "2B",
    "Triple": "3B",
    "Home Run": "HR",
    "Strikeout": "K",
    "Walk": "BB",
    "Intent Walk": "IBB",
    "Hit By Pitch": "HBP",
    "Grounded Into DP": "DP",
    "Field Error": "E",
    "Fielders Choice": "FC",
    "Fielders Choice Out": "FC",
    "Double Play": "DP",
    "Catcher Interference": "CI",
    "Caught Stealing 2B": "CS",
    "Caught Stealing 3B": "CS",
    "Pickoff Caught Stealing 2B": "CS",
    "Pickoff Caught Stealing 3B": "CS",
    "Stolen Base 2B": "SB",
    "Stolen Base 3B": "SB",
    "Stolen Base Home": "SB",
    "Sac Fly": "SAC",
    "Sac Bunt": "SAC",
    "Wild Pitch": "WP",
    "Passed Ball": "PB"
  };
  if (exact[eventType]) return exact[eventType];
  if (eventType.includes("Substitution") || eventType.includes("Switch")) return "\u2194";
  if (/error/i.test(eventType)) return "E";
  if (/out/i.test(eventType)) return "OUT";
  return eventType.slice(0, 3).toUpperCase();
}
function buildPlayScorebug(play) {
  const count = play.count || {};
  const outs = count.outs ?? 0;
  const balls = count.balls ?? 0;
  const strikes = count.strikes ?? 0;
  const onBase = {
    first: !!play.matchup?.postOnFirst,
    second: !!play.matchup?.postOnSecond,
    third: !!play.matchup?.postOnThird
  };
  const ink = svgInk();
  const outFill = (n) => outs >= n ? "#bf0d3d" : ink.empty;
  const baseFill = (b) => b ? "#bf0d3d" : ink.empty;
  return `<div class="play-scorebug">
    <div class="play-count-mini">${balls}-${strikes}</div>
    <svg width="48" height="48" viewBox="0 0 58 79" xmlns="http://www.w3.org/2000/svg">
      <circle cx="13" cy="61" r="5" fill="${outFill(1)}" stroke="#bf0d3d" stroke-width="1"/>
      <circle cx="30" cy="61" r="5" fill="${outFill(2)}" stroke="#bf0d3d" stroke-width="1"/>
      <circle cx="47" cy="61" r="5" fill="${outFill(3)}" stroke="#bf0d3d" stroke-width="1"/>
      <rect x="17.6" y="29.7" width="14" height="14" transform="rotate(45 17.6 29.7)"
        fill="${baseFill(onBase.third)}"  stroke="#bf0d3d" stroke-width="1"/>
      <rect x="29.4" y="17.7" width="14" height="14" transform="rotate(45 29.4 17.7)"
        fill="${baseFill(onBase.second)}" stroke="#bf0d3d" stroke-width="1"/>
      <rect x="41.6" y="29.7" width="14" height="14" transform="rotate(45 41.6 29.7)"
        fill="${baseFill(onBase.first)}"  stroke="#bf0d3d" stroke-width="1"/>
    </svg>
  </div>`;
}
function buildPlayCard(play, awayAbbr, homeAbbr, showScore) {
  const inning = play.about?.inning ?? 1;
  const isTop = play.about?.isTopInning;
  const inningTxt = `${isTop ? "\u25B2" : "\u25BC"} ${inning}`;
  const event = play.result?.event || "\u2014";
  const eventBadge = getEventBadge(event);
  const desc = play.result?.description || "";
  const hitData = play.playEvents?.find((e) => e?.hitData)?.hitData || {};
  const exitVelo = hitData.launchSpeed ? `${Math.round(hitData.launchSpeed)} mph` : "";
  const launchAngle = hitData.launchAngle != null ? `${Math.round(hitData.launchAngle)}\xB0` : "";
  const distance = hitData.totalDistance ? `${Math.round(hitData.totalDistance)} ft` : "";
  const hasStatcast = exitVelo || launchAngle || distance;
  let scoreHtml = "";
  if (showScore && play.result?.awayScore != null && play.result?.homeScore != null) {
    const rbiHtml = play.result.rbi > 0 ? `<span class="play-rbi">+${play.result.rbi} RBI</span>` : "";
    scoreHtml = `<div class="play-score-line">
      <span class="play-score">${awayAbbr} ${play.result.awayScore} \u2014 ${homeAbbr} ${play.result.homeScore}</span>
      ${rbiHtml}
    </div>`;
  }
  let statcastHtml = "";
  if (hasStatcast) {
    const chips = [];
    if (exitVelo) chips.push(`<div class="play-chip"><span class="play-chip-l">EV</span><span class="play-chip-v">${exitVelo}</span></div>`);
    if (launchAngle) chips.push(`<div class="play-chip"><span class="play-chip-l">LA</span><span class="play-chip-v">${launchAngle}</span></div>`);
    if (distance) chips.push(`<div class="play-chip"><span class="play-chip-l">DIST</span><span class="play-chip-v">${distance}</span></div>`);
    statcastHtml = `<div class="play-statcast">${chips.join("")}</div>`;
  }
  return `<div class="play-card">
    <div class="play-main">
      <div class="play-header">
        <span class="play-inning">${inningTxt}</span>
        <span class="play-event-badge">${eventBadge}</span>
        <span class="play-event-text">${event}</span>
      </div>
      <div class="play-desc">${desc}</div>
      ${scoreHtml}
      ${statcastHtml}
    </div>
    ${buildPlayScorebug(play)}
  </div>`;
}
function renderScoringPlays(data) {
  const container = $("scoring-plays-list");
  if (!container) return;
  const tabEl = $("tab-scoring");
  const savedScroll = tabEl?.scrollTop ?? 0;
  const allPlays = data.liveData?.plays?.allPlays || [];
  const scoringIdx = data.liveData?.plays?.scoringPlays || [];
  const awayAbbr = data.gameData?.teams?.away?.abbreviation || "AWAY";
  const homeAbbr = data.gameData?.teams?.home?.abbreviation || "HOME";
  if (!scoringIdx.length) {
    container.innerHTML = '<div class="plays-empty">No scoring plays yet</div>';
    return;
  }
  const cards = [...scoringIdx].reverse().map((idx) => {
    const play = allPlays[idx];
    if (!play) return "";
    return buildPlayCard(play, awayAbbr, homeAbbr, true);
  }).filter(Boolean).join("");
  container.innerHTML = cards;
  if (tabEl) tabEl.scrollTop = savedScroll;
}
function renderAllPlays(data) {
  const container = $("all-plays-list");
  if (!container) return;
  const tabEl = $("tab-plays");
  const savedScroll = tabEl?.scrollTop ?? 0;
  const allPlays = data.liveData?.plays?.allPlays || [];
  const awayAbbr = data.gameData?.teams?.away?.abbreviation || "AWAY";
  const homeAbbr = data.gameData?.teams?.home?.abbreviation || "HOME";
  if (!allPlays.length) {
    container.innerHTML = '<div class="plays-empty">Awaiting first play</div>';
    return;
  }
  const completed = allPlays.filter((p) => p.result?.event);
  if (!completed.length) {
    container.innerHTML = '<div class="plays-empty">Awaiting first play</div>';
    return;
  }
  const cards = [...completed].reverse().map(
    (play) => buildPlayCard(play, awayAbbr, homeAbbr, false)
  ).join("");
  container.innerHTML = cards;
  if (tabEl) tabEl.scrollTop = savedScroll;
}
function renderFinalContent(data) {
  const awayTeamId = data.gameData?.teams?.away?.id;
  const homeTeamId = data.gameData?.teams?.home?.id;
  const linescore = data.liveData?.linescore;
  const decisions = data.liveData?.decisions || {};
  const winner = decisions.winner;
  const loser = decisions.loser;
  const teamsBox = data.liveData?.boxscore?.teams || {};
  const awayRuns = linescore?.teams?.away?.runs ?? 0;
  const homeRuns = linescore?.teams?.home?.runs ?? 0;
  const awayWon = awayRuns > homeRuns;
  const homeWon = homeRuns > awayRuns;
  const awayLogoEl = $("final-away-team-logo");
  const homeLogoEl = $("final-home-team-logo");
  if (awayLogoEl && awayTeamId) loadLogo(awayLogoEl, awayTeamId);
  if (homeLogoEl && homeTeamId) loadLogo(homeLogoEl, homeTeamId);
  let awayPitcher = null;
  let homePitcher = null;
  let awayDecision = "";
  let homeDecision = "";
  if (awayWon) {
    awayPitcher = winner;
    homePitcher = loser;
    awayDecision = "W";
    homeDecision = "L";
  } else if (homeWon) {
    awayPitcher = loser;
    homePitcher = winner;
    awayDecision = "L";
    homeDecision = "W";
  }
  const getFinalPitcherLine = (teamBox, pitcherId) => {
    if (!teamBox || !pitcherId) return "\u2014";
    const game = teamBox.players?.[`ID${pitcherId}`]?.stats?.pitching;
    if (!game) return "\u2014";
    const ip = game.inningsPitched ?? "0.0";
    const h = game.hits ?? 0;
    const er = game.earnedRuns ?? 0;
    const k = game.strikeOuts ?? 0;
    return `${ip} IP \xB7 ${h} H \xB7 ${er} ER \xB7 ${k} K`;
  };
  $("final-away-pitcher-name").textContent = awayPitcher?.fullName || "\u2014";
  $("final-away-pitcher-stats").textContent = getFinalPitcherLine(teamsBox.away, awayPitcher?.id);
  const awayDecEl = $("final-away-decision");
  awayDecEl.textContent = awayDecision || "\u2014";
  awayDecEl.classList.remove("win", "loss");
  if (awayDecision === "W") awayDecEl.classList.add("win");
  else if (awayDecision === "L") awayDecEl.classList.add("loss");
  $("final-home-pitcher-name").textContent = homePitcher?.fullName || "\u2014";
  $("final-home-pitcher-stats").textContent = getFinalPitcherLine(teamsBox.home, homePitcher?.id);
  const homeDecEl = $("final-home-decision");
  homeDecEl.textContent = homeDecision || "\u2014";
  homeDecEl.classList.remove("win", "loss");
  if (homeDecision === "W") homeDecEl.classList.add("win");
  else if (homeDecision === "L") homeDecEl.classList.add("loss");
  const performers = data.liveData?.boxscore?.topPerformers || [];
  for (let i = 0; i < 3; i++) {
    const slot = $(`final-performer-${i + 1}`);
    if (!slot) continue;
    const performer = performers[i];
    if (!performer?.player) {
      slot.style.display = "none";
      continue;
    }
    slot.style.display = "";
    const name = performer.player.person?.fullName || "\u2014";
    const type = performer.type;
    const isPitcher = type === "pitcher" || type === "starter";
    let stats = "\u2014";
    if (isPitcher) {
      const p = performer.player.stats?.pitching;
      if (p?.summary) stats = p.summary;
      else if (p) stats = `${p.inningsPitched || "0"} IP \xB7 ${p.earnedRuns ?? 0} ER \xB7 ${p.strikeOuts ?? 0} K`;
    } else {
      const b = performer.player.stats?.batting;
      if (b?.summary) stats = b.summary;
      else if (b) stats = `${b.hits ?? 0}-${b.atBats ?? 0} \xB7 ${b.runs ?? 0} R \xB7 ${b.rbi ?? 0} RBI`;
    }
    const nameEl = slot.querySelector(".final-performer-name");
    const statsEl = slot.querySelector(".final-performer-stats");
    if (nameEl) nameEl.textContent = name;
    if (statsEl) statsEl.textContent = stats;
  }
}
function renderPostponedContent(data) {
  const game = data.gameData;
  const reason = game?.status?.reason || "";
  const reasonEl = $("postponed-reason");
  if (reasonEl) {
    reasonEl.textContent = reason ? `Due to ${reason.toLowerCase()}` : "Postponed by Major League Baseball";
  }
  const gameInfo = game?.game || {};
  const dh = gameInfo.doubleHeader || "N";
  const dhNum = gameInfo.gameNumber;
  const dhEl = $("postponed-dh-note");
  if (dhEl) {
    if (dh !== "N" && dhNum) {
      dhEl.textContent = `Now scheduled as Game ${dhNum} of a doubleheader`;
      dhEl.style.display = "block";
    } else {
      dhEl.style.display = "none";
    }
  }
  const away = game?.teams?.away?.name || "";
  const home = game?.teams?.home?.name || "";
  const teamsEl = $("postponed-teams");
  if (teamsEl) {
    teamsEl.textContent = away && home ? `${away} at ${home}` : "";
  }
}
function renderSuspendedContent(data) {
  const game = data.gameData;
  const linescore = data.liveData?.linescore;
  const inningEl = $("suspended-inning");
  if (inningEl) {
    const half = linescore?.inningHalf;
    const inning = linescore?.currentInning;
    if (half && inning) {
      const halfTxt = half === "Top" ? "TOP" : "BOTTOM";
      inningEl.textContent = `${halfTxt} ${ordinalInning(inning)}`;
    } else {
      inningEl.textContent = "";
    }
  }
  const away = game?.teams?.away?.name || "";
  const home = game?.teams?.home?.name || "";
  const teamsEl = $("suspended-teams");
  if (teamsEl) {
    teamsEl.textContent = away && home ? `${away} at ${home}` : "";
  }
  const reason = game?.status?.reason || "";
  const reasonEl = $("suspended-reason");
  if (reasonEl) {
    reasonEl.textContent = reason ? `Due to ${reason.toLowerCase()}` : "Game has been suspended";
  }
  const reschedRaw = game?.rescheduleDate || game?.rescheduleGameDate || game?.rescheduledTo || game?.datetime?.rescheduleDate || game?.game?.rescheduleDate || null;
  const makeupEl = $("suspended-makeup-note");
  if (makeupEl) {
    if (reschedRaw) {
      const dt = new Date(reschedRaw);
      const dateStr = dt.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric"
      });
      const timeStr = formatGameTime(reschedRaw);
      makeupEl.textContent = `Resumes ${dateStr} at ${timeStr}`;
      makeupEl.style.display = "block";
    } else {
      makeupEl.style.display = "none";
    }
  }
  const gameInfo = game?.game || {};
  const dh = gameInfo.doubleHeader || "N";
  const dhNum = gameInfo.gameNumber;
  const dhEl = $("suspended-dh-note");
  if (dhEl) {
    if (dh !== "N" && dhNum) {
      dhEl.textContent = `Continues as Game ${dhNum} of a doubleheader`;
      dhEl.style.display = "block";
    } else {
      dhEl.style.display = "none";
    }
  }
}
function ordinalInning(n) {
  if (n === 1) return "1ST";
  if (n === 2) return "2ND";
  if (n === 3) return "3RD";
  if (n >= 21) {
    const last = n % 10;
    if (last === 1) return `${n}ST`;
    if (last === 2) return `${n}ND`;
    if (last === 3) return `${n}RD`;
  }
  return `${n}TH`;
}
var MLB_TEAM_COLORS = {
  108: "#BA0021",
  109: "#A71930",
  110: "#DF4601",
  111: "#BD3039",
  112: "#0E3386",
  113: "#C6011F",
  114: "#E50022",
  115: "#7C6BAF",
  116: "#FA4616",
  117: "#EB6E1F",
  118: "#004687",
  119: "#005A9C",
  120: "#AB0003",
  121: "#FF5910",
  133: "#003831",
  134: "#FDB827",
  135: "#FFC72C",
  136: "#005C5C",
  137: "#FD5A1E",
  138: "#C41E3A",
  139: "#8FBCE6",
  140: "#003278",
  141: "#134A8E",
  142: "#D31145",
  143: "#E81828",
  144: "#CE1141",
  145: "#C4CED4",
  146: "#00A3E0",
  147: "#C4CED3",
  158: "#ffc52f"
};
var WBC_COLORS = {
  "Japan": "#BC002D",
  "USA": "#BF0A30",
  "Korea": "#CD2E3A",
  "Venezuela": "#CF0921",
  "Mexico": "#006847",
  "Puerto Rico": "#ED0000",
  "Dominican Republic": "#002D62",
  "Canada": "#FF0000",
  "Cuba": "#002A8F",
  "Italy": "#009246"
};
function getTeamColor(id, name = "") {
  if (id && MLB_TEAM_COLORS[id]) return MLB_TEAM_COLORS[id];
  if (name && WBC_COLORS[name]) return WBC_COLORS[name];
  return "#535557";
}
function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
var winProbCache = null;
async function fetchWinProb() {
  if (!gamePk) return null;
  try {
    const res = await fetch(`/api/winprob/${gamePk}`);
    if (!res.ok) return winProbCache;
    const data = await res.json();
    if (Array.isArray(data)) {
      winProbCache = data;
      return data;
    }
    return winProbCache;
  } catch (e) {
    console.error("fetchWinProb error:", e);
    return winProbCache;
  }
}
async function renderWinProb() {
  const container = $("tab-winprob");
  if (!container) return;
  if (!lastGameData) {
    container.innerHTML = '<div class="placeholder">Waiting for game data\u2026</div>';
    return;
  }
  const awayTeam = lastGameData.gameData?.teams?.away;
  const homeTeam = lastGameData.gameData?.teams?.home;
  if (!awayTeam || !homeTeam) {
    container.innerHTML = '<div class="placeholder">Waiting for game data\u2026</div>';
    return;
  }
  if (!container.querySelector(".wp-summary")) {
    container.innerHTML = '<div class="placeholder">Loading win probability\u2026</div>';
  }
  const wpData = await fetchWinProb();
  if (!wpData || !wpData.length) {
    container.innerHTML = '<div class="placeholder">Win probability not available</div>';
    return;
  }
  const awayId = awayTeam.id;
  const homeId = homeTeam.id;
  const awayName = awayTeam.name || "";
  const homeName = homeTeam.name || "";
  const awayAbbr = awayTeam.abbreviation || awayTeam.teamName || "AWY";
  const homeAbbr = homeTeam.abbreviation || homeTeam.teamName || "HOM";
  const awayColor = getTeamColor(awayId, awayName);
  const homeColor = getTeamColor(homeId, homeName);
  const latest = wpData[wpData.length - 1];
  const homeProb = Math.round(latest.homeTeamWinProbability ?? 50);
  const awayProb = Math.round(latest.awayTeamWinProbability ?? 50);
  const W = 520, H = 125;
  const PL = 36, PR = 16, PT = 10, PB = 22;
  const CW = W - PL - PR;
  const CH = H - PT - PB;
  const stepX = CW / Math.max(1, wpData.length - 1);
  const midY = PT + CH / 2;
  const pts = wpData.map((d, i) => ({
    x: PL + i * stepX,
    y: PT + CH / 2 + ((d.homeTeamWinProbability ?? 50) - 50) / 50 * (CH / 2),
    homeProb: d.homeTeamWinProbability ?? 50,
    awayProb: d.awayTeamWinProbability ?? 50,
    added: d.homeTeamWinProbabilityAdded,
    event: d.result?.event || "",
    desc: d.result?.description || "",
    inning: d.about?.inning || 0,
    isTop: !!d.about?.isTopInning
  }));
  const linePoints = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const polyPts = [`${PL},${midY}`, ...pts.map((p) => `${p.x},${p.y}`), `${PL + CW},${midY}`].join(" ");
  const ink = svgInk();
  let inningLines = "";
  let lastInn = 0;
  pts.forEach((p) => {
    if (p.inning && p.inning !== lastInn && p.isTop) {
      lastInn = p.inning;
      inningLines += `
        <line x1="${p.x}" y1="${PT}" x2="${p.x}" y2="${PT + CH}" stroke="${ink.grid}" stroke-width="1" stroke-dasharray="3,3"/>
        <line x1="${p.x}" y1="${PT + CH}" x2="${p.x}" y2="${PT + CH + 5}" stroke="${ink.mid}" stroke-width="1"/>
        <text x="${p.x}" y="${PT + CH + 15}" text-anchor="middle" font-size="8" fill="${ink.strong}" font-family="DM Mono, monospace">${p.inning}</text>`;
    }
  });
  const zones = pts.map((p, i) => {
    const prev = pts[i - 1];
    const next = pts[i + 1];
    const x = i === 0 ? PL : prev ? prev.x + (p.x - prev.x) / 2 : PL;
    const nx = i === pts.length - 1 ? PL + CW : next ? p.x + (next.x - p.x) / 2 : PL + CW;
    const added = p.added != null ? p.added.toFixed(1) : "N/A";
    const sign = (p.added ?? 0) >= 0 ? "+" : "";
    const acls = (p.added ?? 0) >= 0 ? "wp-pos" : "wp-neg";
    const inn = p.inning ? `${p.isTop ? "Top" : "Bot"} ${p.inning}` : "";
    return `<rect x="${x}" y="${PT}" width="${nx - x}" height="${CH}" class="wp-zone"
      data-x="${p.x}" data-y="${p.y}"
      data-home="${p.homeProb.toFixed(1)}" data-away="${p.awayProb.toFixed(1)}"
      data-added="${added}" data-acls="${acls}" data-sign="${sign}"
      data-event="${escapeHtml(p.event)}" data-desc="${escapeHtml(p.desc)}" data-inn="${inn}"/>`;
  }).join("");
  container.innerHTML = `
    <div class="wp-summary">
      <div class="wp-team wp-team-away">
        <img class="wp-team-logo" src="${getLogoPath(awayId)}" onerror="${logoFallbackAttr(awayId)}" alt="${awayAbbr}">
        <span class="wp-team-pct" style="color:${awayColor}">${awayProb}%</span>
      </div>
      <div class="wp-title">WIN PROBABILITY</div>
      <div class="wp-team wp-team-home">
        <span class="wp-team-pct" style="color:${homeColor}">${homeProb}%</span>
        <img class="wp-team-logo" src="${getLogoPath(homeId)}" onerror="${logoFallbackAttr(homeId)}" alt="${homeAbbr}">
      </div>
    </div>

    <div class="wp-prob-bar">
      <div class="wp-prob-bar-fill" style="width:${awayProb}%;background:${awayColor};"></div>
      <div class="wp-prob-bar-fill" style="width:${homeProb}%;background:${homeColor};"></div>
    </div>

    <div class="wp-chart-wrap">
      <div class="wp-tooltip" id="wp-tooltip"></div>
      <svg class="wp-chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">
        <rect x="${PL}" y="${PT}" width="${CW}" height="${CH}" fill="${ink.chartBg}" rx="2"/>
        <defs>
          <clipPath id="wp-clip-top"><rect x="${PL}" y="${PT}" width="${CW}" height="${CH / 2}"/></clipPath>
          <clipPath id="wp-clip-bot"><rect x="${PL}" y="${PT + CH / 2}" width="${CW}" height="${CH / 2}"/></clipPath>
        </defs>
        <polygon points="${polyPts}" fill="${awayColor}" opacity="0.9" clip-path="url(#wp-clip-top)"/>
        <polygon points="${polyPts}" fill="${homeColor}" opacity="0.9" clip-path="url(#wp-clip-bot)"/>
        <line x1="${PL}" y1="${midY}" x2="${PL + CW}" y2="${midY}" stroke="${ink.mid}" stroke-width="1" stroke-dasharray="4,3"/>
        <text x="${PL - 4}" y="${midY + 3}" text-anchor="end" font-size="8" fill="${ink.strong}" font-family="DM Mono, monospace">50%</text>
        <text x="${PL - 4}" y="${PT + 6}" text-anchor="end" font-size="8" fill="${awayColor}" font-family="DM Mono, monospace">${awayAbbr}</text>
        <text x="${PL - 4}" y="${PT + CH + 2}" text-anchor="end" font-size="8" fill="${homeColor}" font-family="DM Mono, monospace">${homeAbbr}</text>
        ${inningLines}
        <polyline points="${linePoints}" fill="none" stroke="${ink.strong}" stroke-width="1.2" stroke-linejoin="round"/>
        ${zones}
        <circle id="wp-dot" cx="0" cy="0" r="4" fill="${ink.dotFill}" stroke="${ink.dotRing}" stroke-width="2" style="display:none;pointer-events:none;"/>
        <text x="${PL + CW / 2}" y="${H - 2}" text-anchor="middle" font-size="9" fill="${ink.label}" font-family="DM Mono, monospace">INNING</text>
      </svg>
    </div>

    <div class="wp-legend">
      <div class="wp-legend-item"><span class="wp-legend-swatch" style="background:${awayColor}"></span>${awayName}</div>
      <div class="wp-legend-item"><span class="wp-legend-swatch" style="background:${homeColor}"></span>${homeName}</div>
    </div>
  `;
  wireWinProbHover(awayAbbr, homeAbbr, awayColor, homeColor);
}
function wireWinProbHover(awayAbbr, homeAbbr, awayColor, homeColor) {
  const chart = document.querySelector(".wp-chart");
  const tooltip = $("wp-tooltip");
  const dot = document.getElementById("wp-dot");
  if (!chart || !tooltip || !dot) return;
  const showFor = (z) => {
    const ds = z.dataset;
    dot.setAttribute("cx", ds.x || "0");
    dot.setAttribute("cy", ds.y || "0");
    dot.style.display = "block";
    const addedLine = ds.added !== "N/A" ? `<div class="${ds.acls}">${ds.sign}${ds.added}% WP shift</div>` : "";
    tooltip.innerHTML = `
      ${ds.inn ? `<div class="wp-tt-inn">${ds.inn}</div>` : ""}
      ${ds.event ? `<div class="wp-tt-event">${ds.event}</div>` : ""}
      ${ds.desc ? `<div class="wp-tt-desc">${ds.desc}</div>` : ""}
      ${addedLine}
      <div class="wp-tt-probs"><span style="color:${awayColor}">${awayAbbr} ${ds.away}%</span><span style="color:${homeColor}">${homeAbbr} ${ds.home}%</span></div>`;
    tooltip.style.display = "block";
  };
  const hide = () => {
    tooltip.style.display = "none";
    dot.style.display = "none";
  };
  chart.querySelectorAll(".wp-zone").forEach((zone) => {
    const z = zone;
    z.addEventListener("mouseenter", () => showFor(z));
    z.addEventListener("mouseleave", hide);
    z.addEventListener("click", (e) => {
      e.stopPropagation();
      showFor(z);
    });
  });
}
function setupWinProbDismiss() {
  document.addEventListener("click", (e) => {
    const tip = document.getElementById("wp-tooltip");
    if (!tip || tip.style.display === "none") return;
    const target = e.target;
    if (target?.closest(".wp-chart")) return;
    tip.style.display = "none";
    const dotEl = document.getElementById("wp-dot");
    if (dotEl) dotEl.style.display = "none";
  });
}
async function selectGameForThisPost() {
  try {
    const res = await fetch("/api/post-game");
    if (res.ok) {
      const data = await res.json();
      if (data?.postType) postType = data.postType;
      if (data?.gamePk) return Number(data.gamePk);
    }
  } catch (e) {
  }
  return selectTodaysGame();
}
async function selectTodaysGame() {
  const dateStr = (/* @__PURE__ */ new Date()).toLocaleDateString("sv-SE", { timeZone: "America/New_York" });
  try {
    const res = await fetch(`/api/schedule?date=${dateStr}`);
    const data = await res.json();
    const games = data?.dates?.[0]?.games || [];
    if (!games.length) return null;
    const live = games.find((g) => isLiveState(g.status?.detailedState || ""));
    if (live) return live.gamePk;
    const upcoming = games.find((g) => isPreGameState(g.status?.detailedState || ""));
    if (upcoming) return upcoming.gamePk;
    return games[0].gamePk;
  } catch (e) {
    console.error("selectTodaysGame error:", e);
    return null;
  }
}
async function fetchAndRender(pk) {
  try {
    const res = await fetch(`/api/game/${pk}`);
    const data = await res.json();
    if (!data?.gameData || !data?.liveData) {
      console.error("Game data unavailable");
      return;
    }
    render(data);
  } catch (e) {
    console.error("fetchAndRender error:", e);
  }
}
function render(data) {
  lastGameData = data;
  const game = data.gameData;
  const linescore = data.liveData.linescore;
  const statusText = postType === "postponed" ? "Postponed" : game.status.detailedState;
  const awayTeam = game.teams.away;
  const homeTeam = game.teams.home;
  document.body.classList.toggle("is-pregame", isPreGameState(statusText));
  document.body.classList.toggle("is-live", isLiveState(statusText));
  document.body.classList.toggle("is-final", isFinalState(statusText));
  document.body.classList.toggle("is-postponed", statusText === "Postponed");
  document.body.classList.toggle("is-suspended", isSuspendedState(statusText));
  void maybeNotifyPostgame(statusText);
  const loading = $("loading-state");
  const content = $("scorebug-content");
  loading.style.display = "none";
  content.style.display = "";
  const venueName = game.venue?.name || "";
  const dt = new Date(game.datetime?.dateTime || Date.now());
  const dateStr = dt.toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase();
  const timeStr = formatGameTime(game.datetime?.dateTime || dt.toISOString());
  $("venue-info").textContent = `${venueName.toUpperCase()} \xB7 ${dateStr} \xB7 ${timeStr}`;
  const broadcasts = game.broadcasts || [];
  const tvBroadcast = broadcasts.find((b) => b.type === "TV" && b.isNational);
  $("network-info").textContent = tvBroadcast?.name || "";
  const contextEl = $("game-context");
  if (contextEl) {
    contextEl.textContent = getGameContextLabel(game);
  }
  $("away-logo").alt = awayTeam.name;
  $("home-logo").alt = homeTeam.name;
  loadLogo($("away-logo"), awayTeam.id);
  loadLogo($("home-logo"), homeTeam.id);
  $("away-name").textContent = getTeamShortName(awayTeam);
  $("home-name").textContent = getTeamShortName(homeTeam);
  const awayRec = awayTeam.record;
  const homeRec = homeTeam.record;
  $("away-record").textContent = awayRec ? `${awayRec.wins}-${awayRec.losses}` : "";
  $("home-record").textContent = homeRec ? `${homeRec.wins}-${homeRec.losses}` : "";
  $("away-score").textContent = String(linescore?.teams?.away?.runs ?? 0);
  $("home-score").textContent = String(linescore?.teams?.home?.runs ?? 0);
  const badge = $("status-badge");
  const inning = $("inning-info");
  const countBlock = $("status-count");
  hideAllStatePanes();
  if (isFinalState(statusText)) {
    badge.textContent = "FINAL";
    badge.style.background = "#bf0d3d";
    const n = linescore?.currentInning || 9;
    inning.textContent = n !== 9 ? `F/${n}` : "";
    inning.style.color = "#bf0d3d";
    countBlock.style.display = "none";
    $("dynamic-tab-label").textContent = "WRAP";
    const finEl = $("final-content");
    if (finEl) finEl.style.display = "block";
    try {
      renderFinalContent(data);
    } catch (e) {
      reportError("renderFinalContent", e);
    }
  } else if (isPreGameState(statusText)) {
    badge.textContent = "";
    inning.textContent = timeStr;
    inning.style.color = "var(--text-secondary)";
    countBlock.style.display = "none";
    $("dynamic-tab-label").textContent = "GAME INFO";
    const preEl = $("pregame-content");
    if (preEl) preEl.style.display = "block";
    try {
      renderPregameContent(data, awayTeam, homeTeam);
    } catch (e) {
      reportError("renderPregameContent", e);
    }
  } else if (statusText === "Postponed") {
    badge.textContent = "POSTPONED";
    badge.style.background = "#bf0d3d";
    const reason = game?.status?.reason || "";
    inning.textContent = reason ? reason.toUpperCase() : "";
    inning.style.color = "var(--text-secondary)";
    countBlock.style.display = "none";
    $("dynamic-tab-label").textContent = "POSTPONED";
    const ppdEl = $("postponed-content");
    if (ppdEl) ppdEl.style.display = "block";
    try {
      renderPostponedContent(data);
    } catch (e) {
      reportError("renderPostponedContent", e);
    }
  } else if (isSuspendedState(statusText)) {
    badge.textContent = "SUSPENDED";
    badge.style.background = "#bf0d3d";
    const half = linescore?.inningHalf === "Top" ? "\u25B2" : "\u25BC";
    inning.textContent = linescore?.currentInning ? `${half} ${linescore.currentInning}` : "";
    inning.style.color = "#bf0d3d";
    countBlock.style.display = "none";
    $("dynamic-tab-label").textContent = "SUSPENDED";
    const susEl = $("suspended-content");
    if (susEl) susEl.style.display = "block";
    try {
      renderSuspendedContent(data);
    } catch (e) {
      reportError("renderSuspendedContent", e);
    }
  } else if (isLiveState(statusText)) {
    badge.textContent = "LIVE";
    badge.style.background = "#bf0d3d";
    const half = linescore?.inningHalf === "Top" ? "\u25B2" : "\u25BC";
    inning.textContent = `${half} ${linescore?.currentInning || ""}`;
    inning.style.color = "#bf0d3d";
    const cp = data.liveData?.plays?.currentPlay;
    const count = cp?.count;
    if (count) {
      $("balls").textContent = String(count.balls ?? 0);
      $("strikes").textContent = String(count.strikes ?? 0);
      $("outs").textContent = String(count.outs ?? 0);
      countBlock.style.display = "flex";
    } else {
      countBlock.style.display = "none";
    }
    $("dynamic-tab-label").textContent = "LIVE";
    const liveEl = $("live-content");
    if (liveEl) liveEl.style.display = "block";
    try {
      renderLiveContent(data);
    } catch (e) {
      reportError("renderLiveContent", e);
    }
  } else {
    badge.textContent = statusText.toUpperCase();
    badge.style.background = "var(--text-muted)";
    inning.textContent = "";
    countBlock.style.display = "none";
    $("dynamic-tab-label").textContent = statusText.toUpperCase();
  }
  try {
    renderLinescore(linescore, awayTeam, homeTeam, isFinalState(statusText));
  } catch (e) {
    reportError("renderLinescore", e);
  }
  try {
    renderBoxScore(data);
  } catch (e) {
    reportError("renderBoxScore", e);
  }
  try {
    renderScoringPlays(data);
  } catch (e) {
    reportError("renderScoringPlays", e);
  }
  try {
    renderAllPlays(data);
  } catch (e) {
    reportError("renderAllPlays", e);
  }
  if ($("tab-winprob")?.classList.contains("tab-content-active")) {
    void renderWinProb();
  }
  if (isTerminalState(statusText)) {
    gameIsTerminal = true;
    stopPolling();
  }
}
function renderLinescore(linescore, awayTeam, homeTeam, isFinal) {
  if (!linescore) return;
  const innings = linescore.innings || [];
  const currentInning = linescore.currentInning;
  const maxInnings = Math.max(9, innings.length);
  const awayRuns = linescore.teams?.away?.runs ?? 0;
  const homeRuns = linescore.teams?.home?.runs ?? 0;
  const awayIsLoser = isFinal && homeRuns > awayRuns;
  const homeIsLoser = isFinal && awayRuns > homeRuns;
  let headerCells = '<th class="ls-team-col"></th>';
  for (let i = 1; i <= maxInnings; i++) {
    headerCells += `<th class="ls-inning-h${i === currentInning ? " ls-current" : ""}">${i}</th>`;
  }
  headerCells += '<th class="ls-total ls-r-header">R</th><th class="ls-total ls-h-header">H</th><th class="ls-total ls-e-header">E</th>';
  const buildRow = (teamKey, team) => {
    const abbr = team.abbreviation || team.teamName?.slice(0, 3).toUpperCase() || "\u2014";
    let cells = `<td class="ls-team-col">
      <img class="ls-team-logo" src="${getLogoPath(team.id)}" onerror="${logoFallbackAttr(team.id)}" alt="${abbr}">
      <span class="ls-team-abbr">${abbr}</span>
    </td>`;
    for (let i = 1; i <= maxInnings; i++) {
      const inn = innings.find((x) => x.num === i);
      const runs = inn?.[teamKey]?.runs;
      const isCurrent = i === currentInning;
      let cls = "ls-inning";
      if (runs == null) cls += " ls-empty";
      else if (runs === 0) cls += " ls-zero";
      else cls += " ls-nonzero";
      if (isCurrent) cls += " ls-current";
      cells += `<td class="${cls}">${runs == null ? "\u2013" : runs}</td>`;
    }
    const t = linescore.teams[teamKey];
    const r = t?.runs ?? 0;
    const h = t?.hits ?? 0;
    const e = t?.errors ?? 0;
    cells += `<td class="ls-total ls-r-value ${r === 0 ? "ls-zero" : "ls-nonzero"}">${r}</td>`;
    cells += `<td class="ls-total ls-h-value ${h === 0 ? "ls-zero" : "ls-nonzero"}">${h}</td>`;
    cells += `<td class="ls-total ls-e-value">${e}</td>`;
    return cells;
  };
  const awayRowClass = awayIsLoser ? "ls-row-loser" : "";
  const homeRowClass = homeIsLoser ? "ls-row-loser" : "";
  $("linescore-container").innerHTML = `
    <table class="linescore-compact">
      <thead><tr>${headerCells}</tr></thead>
      <tbody>
        <tr class="ls-row-away ${awayRowClass}">${buildRow("away", awayTeam)}</tr>
        <tr class="ls-row-home ${homeRowClass}">${buildRow("home", homeTeam)}</tr>
      </tbody>
    </table>`;
}
function setupTabs() {
  document.querySelectorAll(".tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetTab = btn.dataset.tab;
      if (!targetTab) return;
      document.body.classList.toggle("on-box-tab", targetTab === "box");
      document.querySelectorAll(".tab").forEach((t) => t.classList.remove("tab-active"));
      btn.classList.add("tab-active");
      document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("tab-content-active"));
      $(`tab-${targetTab}`)?.classList.add("tab-content-active");
      if (targetTab === "winprob") {
        void renderWinProb();
      }
    });
  });
}
function startPolling() {
  if (pollInterval) clearInterval(pollInterval);
  pollInterval = setInterval(() => {
    if (document.hidden || gamePk == null) return;
    void fetchAndRender(gamePk);
  }, 1e4);
}
function stopPolling() {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
}
async function maybeNotifyPostgame(statusText) {
  if (postgameNotificationFired) return;
  if (!isFinalState(statusText)) return;
  postgameNotificationFired = true;
  try {
    await fetch("/api/postgame-check", { method: "POST" });
  } catch (e) {
    console.error("postgame notify failed:", e);
  }
}
(async () => {
  setupTabs();
  setupBoxScoreTeamTabs();
  setupWinProbDismiss();
  setupThemeToggle();
  setupExpand();
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && pollInterval !== null && gamePk != null) {
      void fetchAndRender(gamePk);
    }
  });
  gamePk = await selectGameForThisPost();
  if (!gamePk) {
    $("loading-state").textContent = "No games today.";
    return;
  }
  await fetchAndRender(gamePk);
  if (!gameIsTerminal) startPolling();
})();
/*! Bundled license information:

long/index.js:
  (**
   * @license
   * Copyright 2009 The Closure Library Authors
   * Copyright 2020 Daniel Wirtz / The long.js Authors.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *     http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *
   * SPDX-License-Identifier: Apache-2.0
   *)
*/
//# sourceMappingURL=splash.js.map
